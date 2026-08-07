/**
 * components/articles/RAGChatWidget.tsx
 *
 * Neo-Brutalist RAG chatbot widget for the Articles section.
 * UI styling matches Portfolio AI Chatbot (Chatbot.tsx) while serving
 * specialized article & technical Q&A with source attributions.
 */

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare,
  X,
  Send,
  Bot,
  User,
  Sparkles,
  AlertCircle,
  RotateCcw,
  ExternalLink,
  Globe,
  FileText,
  Loader2,
  ChevronRight,
} from "lucide-react";
import { useRAGChat, type Source } from "@/hooks/useRAGChat";
import { MayIHelpYouPopup } from "@/components/articles/MayIHelpYouPopup";
import { scrollToNearestUpperHeading } from "@/lib/utils";

const GLOBAL_SUGGESTIONS = [
  "Summarize Aditya's top articles",
  "List key takeaways from full-stack articles",
  "What articles cover RAG & AI?",
  "Compare Qdrant vs Pinecone",
];

const ARTICLE_SPECIFIC_SUGGESTIONS = [
  "Summarize this article",
  "List key learnings & takeaways",
  "What core problem does this solve?",
  "Explain the technical architecture",
];

const GREETING_DELAY = 300;
const LABEL_DELAY = 1000;
const FIRST_CHIP_DELAY = 1300;
const CHIP_STAGGER = 180;

// ── Shared animated welcome sequence matching main portfolio chatbot ───────
const WelcomeSequence = ({
  articleSlug,
  onSend,
}: {
  articleSlug?: string;
  onSend: (text: string) => void;
}) => {
  const [showGreeting, setShowGreeting] = useState(false);
  const [showLabel, setShowLabel] = useState(false);
  const [visibleChips, setVisibleChips] = useState(0);

  const suggestions = articleSlug ? ARTICLE_SPECIFIC_SUGGESTIONS : GLOBAL_SUGGESTIONS;

  useEffect(() => {
    const t1 = setTimeout(() => setShowGreeting(true), GREETING_DELAY);
    const t2 = setTimeout(() => setShowLabel(true), LABEL_DELAY);
    const chipTimers = suggestions.map((_, i) =>
      setTimeout(() => setVisibleChips(i + 1), FIRST_CHIP_DELAY + i * CHIP_STAGGER)
    );
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      chipTimers.forEach(clearTimeout);
    };
  }, [suggestions]);

  return (
    <div className="space-y-3">
      {/* Greeting bubble */}
      <AnimatePresence>
        {showGreeting && (
          <motion.div
            className="flex items-start gap-2.5"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="w-7 h-7 rounded-lg bg-secondary border border-foreground text-foreground flex items-center justify-center text-xs flex-shrink-0 shadow-2xs">
              <Bot className="w-3.5 h-3.5" />
            </div>
            <div className="px-3.5 py-2.5 border bg-secondary text-foreground border-border/80 rounded-xl rounded-tl-none text-sm leading-relaxed max-w-[75%] font-sans font-normal">
              {articleSlug
                ? "Hi! I'm Articles AI. Ask me anything about this article or use a quick prompt below to analyze it! 📚"
                : "Hi! I'm Articles AI. Ask me anything about Aditya's articles, system architecture, RAG, or web development! 📚"}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Suggestions label */}
      <AnimatePresence>
        {showLabel && (
          <motion.p
            className="text-[11px] text-muted-foreground font-mono flex items-center gap-1 pt-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.25 }}
          >
            <Sparkles className="w-3 h-3 text-yellow-500 animate-pulse" />
            SUGGESTED QUERIES:
          </motion.p>
        )}
      </AnimatePresence>

      {/* Suggestion chips — one-by-one */}
      <div className="flex flex-col gap-2">
        {suggestions.map((sug, i) => (
          <AnimatePresence key={sug}>
            {visibleChips > i && (
              <motion.button
                onClick={() => onSend(sug)}
                className="text-xs font-mono text-left px-3 py-2 rounded-xl border border-foreground/60 bg-card hover:bg-secondary hover:border-foreground hover:translate-y-[-1px] transition-all duration-200 shadow-2xs active:translate-y-[1px] active:shadow-[1px_1px_0px_0px_currentColor] text-foreground"
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              >
                <span className="text-blue-400 mr-1.5">{">"}</span>
                {sug}
              </motion.button>
            )}
          </AnimatePresence>
        ))}
      </div>
    </div>
  );
};

// ── Source pills styled in neo-brutalist card design ─────────────────────────
function SourcePills({ sources }: { sources: Source[] }) {
  if (!sources || sources.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1.5 mt-2 pt-2 border-t border-dashed border-border/30">
      <div className="w-full text-[9px] font-mono font-bold text-muted-foreground tracking-wider uppercase">
        Referenced Articles
      </div>
      {sources.map((source, i) =>
        source.type === "article" ? (
          <a
            key={i}
            href={`/articles/${source.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-[10px] font-mono font-bold bg-secondary border border-foreground/30 rounded-lg px-2 py-1 shadow-2xs hover:bg-card hover:border-foreground text-foreground transition-all hover:-translate-y-[0.5px] active:translate-y-0"
          >
            <FileText className="w-3 h-3 text-blue-500 flex-shrink-0" />
            <span className="truncate max-w-[160px]">{source.title}</span>
            <ExternalLink className="w-2.5 h-2.5 opacity-60 flex-shrink-0" />
          </a>
        ) : (
          <a
            key={i}
            href={source.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-[10px] font-mono font-bold bg-secondary border border-foreground/30 rounded-lg px-2 py-1 shadow-2xs hover:bg-card hover:border-foreground text-foreground transition-all hover:-translate-y-[0.5px] active:translate-y-0"
          >
            <Globe className="w-3 h-3 text-sky-500 flex-shrink-0" />
            <span className="truncate max-w-[160px]">{source.title}</span>
            <ExternalLink className="w-2.5 h-2.5 opacity-60 flex-shrink-0" />
          </a>
        )
      )}
    </div>
  );
}

interface RAGChatWidgetProps {
  articleSlug?: string;
  isEmbedded?: boolean;
  isOpen?: boolean;
  setIsOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  onClose?: () => void;
}

// ── Main widget ─────────────────────────────────────────────────────────────
export function RAGChatWidget({
  articleSlug,
  isEmbedded = false,
  isOpen: propIsOpen,
  setIsOpen: propSetIsOpen,
  onClose,
}: RAGChatWidgetProps) {
  const [localIsOpen, localSetIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const bodyRef = useRef<HTMLDivElement>(null);
  const latestModelMsgRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const isOpen = propIsOpen !== undefined ? propIsOpen : localIsOpen;
  const setIsOpen = propSetIsOpen !== undefined ? propSetIsOpen : localSetIsOpen;

  const {
    messages,
    isLoading,
    sendMessage,
    clearConversation,
    hasMessages,
    cooldownSecondsLeft,
  } = useRAGChat({ articleSlug });

  const hasScrolledForResponseRef = useRef(false);

  const scrollToBottom = () => {
    if (bodyRef.current) {
      bodyRef.current.scrollTo({
        top: bodyRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  };

  const scrollToLatestMessage = () => {
    if (latestModelMsgRef.current && bodyRef.current) {
      const container = bodyRef.current;
      const el = latestModelMsgRef.current;
      const targetTop = el.offsetTop - 12; // 12px breathing room above the bot bubble
      container.scrollTo({ top: Math.max(0, targetTop), behavior: "smooth" });
    }
  };

  // Scroll to start of bot response ONCE when response starts (ChatGPT style)
  useEffect(() => {
    if (!hasMessages) return;
    const lastMsg = messages[messages.length - 1];
    if (lastMsg && lastMsg.role === "assistant" && !hasScrolledForResponseRef.current) {
      hasScrolledForResponseRef.current = true;
      setTimeout(() => scrollToLatestMessage(), 50);
    }
  }, [messages, hasMessages]);

  const handleOpenChat = useCallback(() => {
    setIsOpen(true);
    scrollToNearestUpperHeading();
  }, [setIsOpen]);

  const handleToggleChat = useCallback(() => {
    setIsOpen((prev) => {
      const next = !prev;
      if (next) {
        scrollToNearestUpperHeading();
      }
      return next;
    });
  }, [setIsOpen]);

  // Focus input when opened (with preventScroll to avoid window displacement)
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus({ preventScroll: true }), 100);
      if (hasMessages) {
        setTimeout(() => scrollToLatestMessage(), 50);
      }
    }
  }, [isOpen, hasMessages]);

  const handleSendText = useCallback(
    async (textToSend: string) => {
      const q = textToSend.trim();
      if (!q || isLoading || cooldownSecondsLeft > 0) return;
      hasScrolledForResponseRef.current = false;
      setInputValue("");
      await sendMessage(q);
    },
    [isLoading, cooldownSecondsLeft, sendMessage]
  );

  // Listen for custom trigger event from article pages / footer prompt bar
  useEffect(() => {
    const handleCustomOpen = (e: Event) => {
      const customEvent = e as CustomEvent<{ query?: string }>;
      handleOpenChat();
      if (customEvent.detail?.query) {
        handleSendText(customEvent.detail.query);
      }
    };

    window.addEventListener("open-rag-chat", handleCustomOpen);
    return () => window.removeEventListener("open-rag-chat", handleCustomOpen);
  }, [handleOpenChat, handleSendText]);

  const sanitizeText = (rawText: string) => {
    if (!rawText) return "";
    return rawText
      .replace(/\[SOURCE:\s*[^\]]+\]/gi, "")
      .replace(/(?:📄\s*)?Source:\s*[^\n]+/gi, "")
      .replace(/ {2,}/g, " ")
      .trim();
  };

  const formatMessageText = (text: string) => {
    const cleaned = sanitizeText(text);
    if (!cleaned) return null;
    const lines = cleaned.split("\n");

    return lines.map((line, lineIdx) => {
      const isBullet = line.trim().startsWith("- ") || line.trim().startsWith("* ");
      const cleanLine = isBullet ? line.trim().substring(2) : line;

      const regex = /(\*\*.*?\*\*|`[^`]+`|\[[^\]]+\]\([^)]+\))/g;
      const parts = cleanLine.split(regex);

      const parsedLine = parts.map((part, partIdx) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return (
            <strong key={partIdx} className="font-bold text-foreground">
              {part.slice(2, -2)}
            </strong>
          );
        }

        if (part.startsWith("`") && part.endsWith("`")) {
          return (
            <code key={partIdx} className="font-mono text-[11px] px-1 py-0.5 rounded bg-muted border border-border text-foreground">
              {part.slice(1, -1)}
            </code>
          );
        }

        const linkMatch = part.match(/^\[(.*?)\]\((.*?)\)$/);
        if (linkMatch) {
          return (
            <a
              key={partIdx}
              href={linkMatch[2]}
              target="_blank"
              rel="noopener noreferrer"
              className="underline font-bold text-blue-400 hover:text-blue-500 transition-colors"
            >
              {linkMatch[1]}
            </a>
          );
        }

        return part;
      });

      if (isBullet) {
        return (
          <div key={lineIdx} className="flex items-start gap-1.5 ml-2 my-1">
            <span className="text-blue-400 font-mono flex-shrink-0 mt-0.5">•</span>
            <span className="flex-1">{parsedLine}</span>
          </div>
        );
      }

      return (
        <div key={lineIdx} className={line.trim() === "" ? "h-2" : "my-0.5"}>
          {parsedLine}
        </div>
      );
    });
  };

  const shouldShowTyping = () => {
    if (!isLoading) return false;
    if (messages.length === 0) return false;
    const lastMsg = messages[messages.length - 1];
    return lastMsg.role === "assistant" && lastMsg.text === "";
  };

  if (isEmbedded) {
    return (
      <div className="w-full h-full bg-card border-2 border-foreground rounded-2xl shadow-md flex flex-col overflow-hidden relative font-sans">
        {/* Header: Neo-Brutalist Code Bar with Live Status */}
        <div className="p-3 bg-secondary border-b-2 border-foreground flex items-center justify-between font-mono text-xs flex-shrink-0">
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-1.5">
              <div className="flex gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 border border-foreground/30" />
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-500 border border-foreground/30" />
                <span className="w-2.5 h-2.5 rounded-full bg-green-500 border border-foreground/30" />
              </div>
              <div className="ml-1 flex items-center gap-1 text-foreground font-semibold">
                <span className="text-blue-500">const</span>
                <span>articles</span>
                <span className="text-foreground/70">=</span>
                <span className="text-gradient-warm font-bold font-sans">AI;</span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground pl-0.5 mt-0.5">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
              </span>
              <span>Activity: {articleSlug ? "Analyzing Article" : "RAG · Articles Q&A"}</span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {hasMessages && (
              <button
                onClick={clearConversation}
                className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-card border border-transparent hover:border-foreground/30 transition-all text-foreground/80 hover:text-foreground"
                title="New Conversation"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}

            {onClose && (
              <button
                onClick={onClose}
                className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-card border border-transparent hover:border-foreground/30 transition-all text-foreground/80 hover:text-foreground"
                title="Close Panel"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Chat Body */}
        <div ref={bodyRef} className="flex-1 p-4 overflow-y-auto space-y-4 custom-scrollbar bg-card">
          {!hasMessages && !isLoading ? (
            <WelcomeSequence articleSlug={articleSlug} onSend={handleSendText} />
          ) : (
            messages.map((msg, index) => {
              if (msg.role === "assistant" && msg.text === "" && msg.isStreaming) return null;
              const isUser = msg.role === "user";

              return (
                <div
                  key={msg.id || index}
                  ref={!isUser && index === messages.length - 1 ? latestModelMsgRef : undefined}
                  className={`flex items-start gap-2.5 ${isUser ? "flex-row-reverse" : ""}`}
                >
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs flex-shrink-0 border border-foreground shadow-2xs ${
                      isUser
                        ? "bg-foreground text-background"
                        : "bg-secondary text-foreground"
                    }`}
                  >
                    {isUser ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                  </div>

                  <div className="flex flex-col max-w-[80%]">
                    <div
                      className={`px-3.5 py-2.5 border rounded-xl text-sm leading-relaxed whitespace-pre-wrap ${
                        isUser
                          ? "bg-foreground text-background border-foreground rounded-tr-none shadow-2xs"
                          : "bg-secondary text-foreground border-border/80 rounded-tl-none font-sans font-normal"
                      }`}
                    >
                      {formatMessageText(msg.text)}
                      {msg.isStreaming && (
                        <span className="inline-block w-1.5 h-3.5 bg-foreground animate-pulse ml-1 align-middle" />
                      )}
                    </div>

                    {!isUser && !msg.isStreaming && msg.sources && (
                      <SourcePills sources={msg.sources} />
                    )}

                    {!isUser && !msg.isStreaming && msg.followUpSuggestions && msg.followUpSuggestions.length > 0 && (
                      <div className="mt-2 pt-1.5 border-t border-dashed border-border/30 w-full">
                        <p className="text-[10px] font-mono font-bold text-muted-foreground uppercase mb-1 flex items-center gap-1">
                          <Sparkles className="w-2.5 h-2.5 text-yellow-500" />
                          Follow-up questions
                        </p>
                        <div className="flex flex-col gap-1">
                          {msg.followUpSuggestions.map((suggestion, idx) => (
                            <button
                              key={idx}
                              onClick={() => handleSendText(suggestion)}
                              className="flex items-center gap-1.5 text-left text-xs font-mono px-2.5 py-1.5 rounded-lg border border-foreground/40 bg-card hover:bg-secondary hover:border-foreground transition-all group text-foreground"
                            >
                              <ChevronRight className="w-3 h-3 text-blue-400 flex-shrink-0 group-hover:translate-x-0.5 transition-transform" />
                              <span className="line-clamp-1">{suggestion}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}

          {shouldShowTyping() && (
            <div className="flex items-start gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-secondary border border-foreground text-foreground flex items-center justify-center text-xs flex-shrink-0 shadow-2xs">
                <Bot className="w-3.5 h-3.5" />
              </div>
              <div className="bg-secondary border border-border/80 px-4 py-3 rounded-xl rounded-tl-none max-w-[75%] flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-foreground rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-1.5 h-1.5 bg-foreground rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-1.5 h-1.5 bg-foreground rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          )}

          {cooldownSecondsLeft > 0 && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-500/10 border-2 border-amber-500 text-amber-600 dark:text-amber-400 font-mono text-xs shadow-2xs">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>Rate limited — ready in {cooldownSecondsLeft}s…</span>
            </div>
          )}
        </div>

        {/* Chat Input */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendText(inputValue);
          }}
          className="p-3 border-t-2 border-foreground bg-secondary/40 flex items-center gap-2 relative mt-auto flex-shrink-0"
        >
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={
              cooldownSecondsLeft > 0
                ? `Rate limited — ready in ${cooldownSecondsLeft}s…`
                : "Ask about any article topic..."
            }
            className="flex-1 min-w-0 bg-card border-2 border-foreground rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-0 font-mono text-foreground"
            disabled={isLoading || cooldownSecondsLeft > 0}
          />

          <button
            type="submit"
            disabled={isLoading || !inputValue.trim() || cooldownSecondsLeft > 0}
            className="p-2.5 rounded-xl bg-foreground text-background border-2 border-foreground disabled:opacity-40 hover:bg-secondary hover:text-foreground hover:translate-y-[-1px] shadow-2xs active:translate-y-[1px] active:shadow-none transition-all duration-150 flex-shrink-0"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans flex flex-col items-end">
      {/* Pop up bubble above chat button icon */}
      <AnimatePresence>
        {!isOpen && (
          <MayIHelpYouPopup onOpenChat={handleOpenChat} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="mb-4 w-[380px] h-[550px] max-w-[calc(100vw-2rem)] bg-card border-2 border-foreground rounded-2xl shadow-md flex flex-col overflow-hidden relative"
          >
            {/* Header: Neo-Brutalist Code Bar with Live Status */}
            <div className="p-3 bg-secondary border-b-2 border-foreground flex items-center justify-between font-mono text-xs">
              <div className="flex flex-col gap-0.5">
                <div className="flex items-center gap-1.5">
                  {/* Simulated CLI indicator */}
                  <div className="flex gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500 border border-foreground/30" />
                    <span className="w-2.5 h-2.5 rounded-full bg-yellow-500 border border-foreground/30" />
                    <span className="w-2.5 h-2.5 rounded-full bg-green-500 border border-foreground/30" />
                  </div>
                  <div className="ml-1 flex items-center gap-1 text-foreground font-semibold">
                    <span className="text-blue-500">const</span>
                    <span>articles</span>
                    <span className="text-foreground/70">=</span>
                    <span className="text-gradient-warm font-bold font-sans">AI;</span>
                  </div>
                </div>

                {/* Live status activity indicator */}
                <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground pl-0.5 mt-0.5">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                  </span>
                  <span>Activity: {articleSlug ? "Analyzing Article" : "RAG · Articles Q&A"}</span>
                </div>
              </div>

              <div className="flex items-center gap-1">
                {hasMessages && (
                  <button
                    onClick={clearConversation}
                    className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-card border border-transparent hover:border-foreground/30 transition-all text-foreground/80 hover:text-foreground"
                    title="New Conversation"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                )}

                <button
                  onClick={() => setIsOpen(false)}
                  className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-card border border-transparent hover:border-foreground/30 transition-all text-foreground/80 hover:text-foreground"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Chat Body */}
            <div ref={bodyRef} className="flex-1 p-4 overflow-y-auto space-y-4 custom-scrollbar bg-card">
              {!hasMessages && !isLoading ? (
                <WelcomeSequence articleSlug={articleSlug} onSend={handleSendText} />
              ) : (
                messages.map((msg, index) => {
                  if (msg.role === "assistant" && msg.text === "" && msg.isStreaming) return null;
                  const isUser = msg.role === "user";

                  return (
                    <div
                      key={msg.id || index}
                      ref={!isUser && index === messages.length - 1 ? latestModelMsgRef : undefined}
                      className={`flex items-start gap-2.5 ${isUser ? "flex-row-reverse" : ""}`}
                    >
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs flex-shrink-0 border border-foreground shadow-2xs ${
                          isUser
                            ? "bg-foreground text-background"
                            : "bg-secondary text-foreground"
                        }`}
                      >
                        {isUser ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                      </div>

                      <div className="flex flex-col max-w-[75%]">
                        <div
                          className={`px-3.5 py-2.5 border rounded-xl text-sm leading-relaxed whitespace-pre-wrap ${
                            isUser
                              ? "bg-foreground text-background border-foreground rounded-tr-none shadow-2xs"
                              : "bg-secondary text-foreground border-border/80 rounded-tl-none font-sans font-normal"
                          }`}
                        >
                          {formatMessageText(msg.text)}
                          {msg.isStreaming && (
                            <span className="inline-block w-1.5 h-3.5 bg-foreground animate-pulse ml-1 align-middle" />
                          )}
                        </div>

                        {!isUser && !msg.isStreaming && msg.sources && (
                          <SourcePills sources={msg.sources} />
                        )}

                        {!isUser && !msg.isStreaming && msg.followUpSuggestions && msg.followUpSuggestions.length > 0 && (
                          <div className="mt-2 pt-1.5 border-t border-dashed border-border/30 w-full">
                            <p className="text-[10px] font-mono font-bold text-muted-foreground uppercase mb-1 flex items-center gap-1">
                              <Sparkles className="w-2.5 h-2.5 text-yellow-500" />
                              Follow-up questions
                            </p>
                            <div className="flex flex-col gap-1">
                              {msg.followUpSuggestions.map((suggestion, idx) => (
                                <button
                                  key={idx}
                                  onClick={() => handleSendText(suggestion)}
                                  className="flex items-center gap-1.5 text-left text-xs font-mono px-2.5 py-1.5 rounded-lg border border-foreground/40 bg-card hover:bg-secondary hover:border-foreground transition-all group text-foreground"
                                >
                                  <ChevronRight className="w-3 h-3 text-blue-400 flex-shrink-0 group-hover:translate-x-0.5 transition-transform" />
                                  <span className="line-clamp-1">{suggestion}</span>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}

              {shouldShowTyping() && (
                <div className="flex items-start gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-secondary border border-foreground text-foreground flex items-center justify-center text-xs flex-shrink-0 shadow-2xs">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                  <div className="bg-secondary border border-border/80 px-4 py-3 rounded-xl rounded-tl-none max-w-[75%] flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-foreground rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-1.5 h-1.5 bg-foreground rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-1.5 h-1.5 bg-foreground rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              )}

              {cooldownSecondsLeft > 0 && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-500/10 border-2 border-amber-500 text-amber-600 dark:text-amber-400 font-mono text-xs shadow-2xs">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>Rate limited — ready in {cooldownSecondsLeft}s…</span>
                </div>
              )}
            </div>

            {/* Chat Input */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendText(inputValue);
              }}
              className="p-3 border-t-2 border-foreground bg-secondary/40 flex items-center gap-2 relative mt-auto"
            >
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={
                  cooldownSecondsLeft > 0
                    ? `Rate limited — ready in ${cooldownSecondsLeft}s…`
                    : "Ask about any article topic..."
                }
                className="flex-1 min-w-0 bg-card border-2 border-foreground rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-0 font-mono text-foreground"
                disabled={isLoading || cooldownSecondsLeft > 0}
              />

              <button
                type="submit"
                disabled={isLoading || !inputValue.trim() || cooldownSecondsLeft > 0}
                className="p-2.5 rounded-xl bg-foreground text-background border-2 border-foreground disabled:opacity-40 hover:bg-secondary hover:text-foreground hover:translate-y-[-1px] shadow-2xs active:translate-y-[1px] active:shadow-none transition-all duration-150 flex-shrink-0"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Toggle Button: Neo-Brutalist Code Toggle */}
      <motion.button
        onClick={handleToggleChat}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="w-14 h-14 rounded-2xl bg-card border-2 border-foreground flex items-center justify-center text-foreground shadow-sm hover:shadow-md cursor-pointer hover:bg-secondary transition-all duration-300 relative group overflow-hidden"
        aria-label="Toggle Articles AI chatbot"
        title="Ask about Aditya's articles"
      >
        {/* Glow accent */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-2xl blur-md opacity-0 group-hover:opacity-10 transition-opacity duration-300" />

        {isOpen ? (
          <X className="w-6 h-6 relative z-10" />
        ) : (
          <MessageSquare className="w-6 h-6 relative z-10" />
        )}
      </motion.button>
    </div>
  );
}
