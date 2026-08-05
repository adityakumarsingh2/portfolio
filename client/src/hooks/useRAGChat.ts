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

export interface ArticleSource {
  slug: string;
  title: string;
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
  isStreaming?: boolean;
}

function generateSessionId(): string {
  return `rag-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function getOrCreateSessionId(): string {
  const key = "rag_session_id";
  let id = sessionStorage.getItem(key);
  if (!id) {
    id = generateSessionId();
    sessionStorage.setItem(key, id);
  }
  return id;
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
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server error: ${response.status}`);
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
          let event: { type: string; text?: string; sources?: Source[]; webSources?: Source[]; error?: string };
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
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantMsgId
                  ? { ...m, isStreaming: false, sources: allSources }
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
      await fetch(`${API_BASE}/api/articles/session/${sessionIdRef.current}`, {
        method: "DELETE",
      });
    } catch {
      // Non-critical
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
