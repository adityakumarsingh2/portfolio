/**
 * hooks/useRAGChat.ts
 *
 * Custom hook for the Articles RAG chatbot.
 * Handles:
 *   - Session ID generation (persisted in sessionStorage per tab)
 *   - SSE stream consumption from /api/articles/chat
 *   - Message history state
 *   - Source attribution state (article + web sources)
 *   - Loading / error states
 *   - Rate limit cooldown countdown
 *   - New conversation reset
 */

import { useState, useCallback, useRef, useEffect } from "react";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";
const RATE_LIMIT_COOLDOWN_MS = 65_000; // 65s — Gemini RPM window is 60s
const UUID_V4_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const LEGACY_RAG_SESSION_ID_RE = /^rag-\d{10,}-[a-z0-9]+$/i;

export interface ArticleSource {
  slug: string;
  title: string;
  section?: string;
  reason?: string;
  type: "article";
}

export interface WebSource {
  title: string;
  url: string;
  type: "web";
}

export type Source = ArticleSource | WebSource;

export interface RAGMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  sources?: Source[];
  followUpSuggestions?: string[];
  isStreaming?: boolean;
}

function generateSessionId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  // Legacy fallback for older browsers lacking crypto.randomUUID support.
  const randomPart = Math.random().toString(36).slice(2, 12) || Date.now().toString(36);
  return `rag-${Date.now()}-${randomPart}`;
}

function isValidSessionId(value: unknown): value is string {
  return (
    typeof value === "string" &&
    (UUID_V4_RE.test(value) || LEGACY_RAG_SESSION_ID_RE.test(value))
  );
}

function getOrCreateSessionId(): string {
  const key = "rag_session_id";
  let id = sessionStorage.getItem(key);
  if (!isValidSessionId(id)) {
    id = generateSessionId();
    sessionStorage.setItem(key, id);
  }
  return id;
}

async function readErrorBody(response: Response): Promise<string | null> {
  const contentType = response.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    const json = await response.json().catch(() => null);
    if (json && typeof json.error === "string" && json.error.trim()) {
      return json.error.trim().slice(0, 300);
    }
  }

  const text = await response.text().catch(() => "");
  const trimmed = text.trim();
  return trimmed ? trimmed.slice(0, 300) : null;
}

function isRateLimitError(msg: string) {
  return msg.toLowerCase().includes("temporarily busy") || msg.toLowerCase().includes("rate limit");
}

export function useRAGChat({ articleSlug }: { articleSlug?: string } = {}) {
  const [messages, setMessages] = useState<RAGMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // cooldownSecondsLeft > 0 means the user must wait before sending another request
  const [cooldownSecondsLeft, setCooldownSecondsLeft] = useState(0);
  const sessionIdRef = useRef<string>(getOrCreateSessionId());
  const abortControllerRef = useRef<AbortController | null>(null);
  const cooldownTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  // Track last articleSlug to reset session when article changes
  const lastArticleSlugRef = useRef<string | undefined>(articleSlug);

  // Reset conversation when article changes
  useEffect(() => {
    if (lastArticleSlugRef.current !== articleSlug) {
      lastArticleSlugRef.current = articleSlug;
      // Generate a fresh session so history from the previous article doesn't bleed in
      const newId = generateSessionId();
      sessionStorage.setItem("rag_session_id", newId);
      sessionIdRef.current = newId;
      setMessages([]);
      setError(null);
    }
  }, [articleSlug]);

  // Countdown ticker
  useEffect(() => {
    return () => {
      if (cooldownTimerRef.current) clearInterval(cooldownTimerRef.current);
    };
  }, []);

  const startCooldown = useCallback(() => {
    if (cooldownTimerRef.current) clearInterval(cooldownTimerRef.current);
    setCooldownSecondsLeft(Math.ceil(RATE_LIMIT_COOLDOWN_MS / 1000));

    cooldownTimerRef.current = setInterval(() => {
      setCooldownSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(cooldownTimerRef.current!);
          cooldownTimerRef.current = null;
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  const sendMessage = useCallback(async (query: string) => {
    if (!query.trim() || isLoading || cooldownSecondsLeft > 0) return;

    setError(null);
    setIsLoading(true);

    // Add user message
    const userMsg: RAGMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      text: query.trim(),
    };

    // Add placeholder assistant message for streaming
    const assistantMsgId = `assistant-${Date.now()}`;
    const assistantMsg: RAGMessage = {
      id: assistantMsgId,
      role: "assistant",
      text: "",
      isStreaming: true,
    };

    setMessages((prev) => [...prev, userMsg, assistantMsg]);

    // Cancel any previous stream
    abortControllerRef.current?.abort();
    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch(`${API_BASE}/api/articles/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: query.trim(),
          sessionId: sessionIdRef.current,
          ...(articleSlug ? { articleSlug } : {}), // scope retrieval to current article
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        const responseMessage = await readErrorBody(response);
        const message = responseMessage || `Server error: ${response.status}`;
        throw new Error(message);
      }

      if (!response.body) throw new Error("No response body");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6).trim();
          if (!jsonStr) continue;

          // Only catch JSON parse errors — let server error events propagate to the outer catch
          let event: {
            type: string;
            text?: string;
            sources?: Source[];
            webSources?: Source[];
            followUpSuggestions?: string[];
            error?: string;
          };
          try {
            event = JSON.parse(jsonStr);
          } catch {
            continue; // skip malformed SSE lines
          }

          if (event.type === "chunk") {
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantMsgId
                  ? { ...m, text: m.text + event.text }
                  : m
              )
            );
          } else if (event.type === "done") {
            const allSources: Source[] = [
              ...(event.sources || []),
              ...(event.webSources || []),
            ];
            const suggestions = event.followUpSuggestions || [];

            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantMsgId
                  ? {
                      ...m,
                      isStreaming: false,
                      sources: allSources,
                      followUpSuggestions: suggestions,
                    }
                  : m
              )
            );
            setIsLoading(false);
          } else if (event.type === "error") {
            // This throw correctly propagates to the outer catch block
            throw new Error(event.error || "Unknown error from server");
          }
        }
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name === "AbortError") return;

      const errMsg = err instanceof Error ? err.message : "Something went wrong";
      setError(errMsg);

      // Start cooldown timer on rate limit errors
      if (isRateLimitError(errMsg)) {
        startCooldown();
      }

      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMsgId
            ? {
                ...m,
                isStreaming: false,
                text: m.text || errMsg || "Sorry, something went wrong. Please try again.",
              }
            : m
        )
      );
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, cooldownSecondsLeft, startCooldown]);

  const clearConversation = useCallback(async () => {
    // Clear server-side session
    try {
      const response = await fetch(`${API_BASE}/api/articles/session/${sessionIdRef.current}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const responseMessage = await readErrorBody(response);
        if (import.meta.env.DEV) {
          console.warn("[RAG Chat] Failed to clear server session", {
            status: response.status,
            sessionId: sessionIdRef.current,
            error: responseMessage || "No response body",
          });
        }
      }
    } catch {
      if (import.meta.env.DEV) {
        console.warn("[RAG Chat] Session cleanup request failed");
      }
    }

    // Generate new session ID
    const newId = generateSessionId();
    sessionStorage.setItem("rag_session_id", newId);
    sessionIdRef.current = newId;

    setMessages([]);
    setError(null);
    setIsLoading(false);
    // Don't clear cooldown — rate limit is still active on the server
  }, []);

  return {
    messages,
    isLoading,
    error,
    cooldownSecondsLeft,
    sendMessage,
    clearConversation,
    hasMessages: messages.length > 0,
  };
}
