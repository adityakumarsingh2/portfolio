/**
 * components/articles/RAGChatWidget.tsx
 *
 * Floating RAG chatbot widget for the Articles section.
 * Distinct from the portfolio chatbot — specialized for article Q&A.
 *
 * Features:
 *   - Floating trigger button (bottom-right, distinct position/color from main chatbot)
 *   - Streaming response rendering
 *   - Source pills: "📄 Article Name" + "🌐 Web Source"
 *   - Markdown-aware message rendering (bold, code, bullet points)
 *   - Animated typing indicator
 *   - New conversation reset
 *   - Suggested starter questions
 */

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen,
  X,
  Send,
  Sparkles,
  RotateCcw,
  ExternalLink,
  Globe,
  FileText,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { useRAGChat, type RAGMessage, type Source } from "@/hooks/useRAGChat";

// ── Starter suggestions ────────────────────────────────────────────────────
const SUGGESTIONS = [
  "What chunking strategies work best for RAG?",
  "Compare Qdrant vs Pinecone",
  "How does cursor pagination work?",
  "What is TanStack Query and why use it?",
];

// ── Typing indicator ────────────────────────────────────────────────────────
function TypingDots() {
  return (
    <div className="flex items-center gap-1 px-1 py-0.5">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-current opacity-60"
          animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }}
          transition={{
            duration: 1,
            repeat: Infinity,
            delay: i * 0.18,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

// ── Minimal markdown renderer ───────────────────────────────────────────────
function renderMarkdown(text: string): React.ReactNode[] {
  const lines = text.split("\n");
  const nodes: React.ReactNode[] = [];
  let listItems: string[] = [];
  let key = 0;

  const flushList = () => {
    if (listItems.length > 0) {
      nodes.push(
        <ul key={`ul-${key++}`} className="my-1.5 space-y-0.5 pl-3">
          {listItems.map((item, i) => (
            <li key={i} className="flex items-start gap-2 text-[0.82rem] leading-5.5">
              <span className="mt-1.5 w-1 h-1 rounded-full bg-violet-400/80 flex-shrink-0" />
              <span dangerouslySetInnerHTML={{ __html: inlineFormat(item) }} />
            </li>
          ))}
        </ul>
      );
      listItems = [];
    }
  };

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      flushList();
      continue;
    }

    // Bullet list
    if (/^[-*•]\s/.test(trimmed)) {
      listItems.push(trimmed.slice(2).trim());
      continue;
    }

    flushList();

    // Bold heading lines (** wrapped)
    if (/^\*\*[^*]+\*\*$/.test(trimmed)) {
      nodes.push(
        <p key={key++} className="font-semibold text-[0.84rem] text-foreground mt-2 mb-0.5"
          dangerouslySetInnerHTML={{ __html: inlineFormat(trimmed) }}
        />
      );
    } else if (trimmed.startsWith("```")) {
      // skip fence markers
    } else {
      nodes.push(
        <p key={key++} className="text-[0.82rem] leading-5.5 text-foreground/85"
          dangerouslySetInnerHTML={{ __html: inlineFormat(trimmed) }}
        />
      );
    }
  }

  flushList();
  return nodes;
}

function inlineFormat(text: string): string {
  return text
    // Bold
    .replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold text-foreground">$1</strong>')
    // Inline code
    .replace(/`([^`]+)`/g, '<code class="font-mono text-[0.78rem] px-1 py-0.5 rounded bg-violet-500/15 border border-violet-500/25 text-violet-300">$1</code>')
    // Italic
    .replace(/\*([^*]+)\*/g, '<em>$1</em>');
}

// ── Source pills ────────────────────────────────────────────────────────────
function SourcePills({ sources }: { sources: Source[] }) {
  if (!sources || sources.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1.5 mt-2 pt-2 border-t border-white/10">
      {sources.map((source, i) =>
        source.type === "article" ? (
          <a
            key={i}
            href={`/articles/${source.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-[0.7rem] px-2 py-0.5 rounded-full
              bg-violet-500/15 border border-violet-500/30 text-violet-300
              hover:bg-violet-500/25 transition-colors"
          >
            <FileText className="w-2.5 h-2.5 flex-shrink-0" />
            <span className="truncate max-w-[120px]">{source.title}</span>
          </a>
        ) : (
          <a
            key={i}
            href={source.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-[0.7rem] px-2 py-0.5 rounded-full
              bg-sky-500/15 border border-sky-500/30 text-sky-300
              hover:bg-sky-500/25 transition-colors"
          >
            <Globe className="w-2.5 h-2.5 flex-shrink-0" />
            <span className="truncate max-w-[120px]">{source.title}</span>
            <ExternalLink className="w-2 h-2 flex-shrink-0 opacity-60" />
          </a>
        )
      )}
    </div>
  );
}

// ── Single message bubble ───────────────────────────────────────────────────
function MessageBubble({ message }: { message: RAGMessage }) {
  const isUser = message.role === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
      className={`flex ${isUser ? "justify-end" : "justify-start"} mb-3`}
    >
      {!isUser && (
        <div className="w-6 h-6 rounded-lg bg-violet-600/30 border border-violet-500/40
          flex items-center justify-center flex-shrink-0 mr-2 mt-0.5">
          <Sparkles className="w-3 h-3 text-violet-400" />
        </div>
      )}

      <div className={`max-w-[85%] ${isUser ? "items-end" : "items-start"} flex flex-col`}>
        <div
          className={`px-3 py-2 rounded-2xl text-sm ${
            isUser
              ? "bg-violet-600 text-white rounded-tr-sm shadow-lg shadow-violet-900/30"
              : "bg-white/5 border border-white/10 text-foreground rounded-tl-sm"
          }`}
        >
          {isUser ? (
            <p className="text-[0.82rem] leading-5.5">{message.text}</p>
          ) : message.isStreaming && !message.text ? (
            <TypingDots />
          ) : (
            <div className="space-y-0.5">
              {renderMarkdown(message.text)}
              {message.isStreaming && (
                <span className="inline-block w-0.5 h-3.5 bg-violet-400 animate-pulse ml-0.5 align-middle" />
              )}
            </div>
          )}
        </div>

        {!isUser && !message.isStreaming && message.sources && (
          <div className="px-1 w-full">
            <SourcePills sources={message.sources} />
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ── Welcome screen (no messages yet) ───────────────────────────────────────
function WelcomeScreen({ onSuggest }: { onSuggest: (q: string) => void }) {
  const [visibleChips, setVisibleChips] = useState(0);

  useEffect(() => {
    const timers = SUGGESTIONS.map((_, i) =>
      setTimeout(() => setVisibleChips(i + 1), 300 + i * 140)
    );
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-full px-4 py-6 text-center">
      {/* Icon */}
      <motion.div
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600
          flex items-center justify-center mb-4 shadow-lg shadow-violet-900/40"
      >
        <BookOpen className="w-6 h-6 text-white" />
      </motion.div>

      <motion.h3
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.3 }}
        className="font-semibold text-foreground text-sm mb-1"
      >
        Ask about the articles
      </motion.h3>

      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25, duration: 0.3 }}
        className="text-muted-foreground text-[0.75rem] leading-5 mb-5 max-w-[220px]"
      >
        Powered by RAG + Gemini. Answers from Aditya's articles, extended with web search.
      </motion.p>

      <div className="flex flex-col gap-1.5 w-full">
        {SUGGESTIONS.slice(0, visibleChips).map((q, i) => (
          <motion.button
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            onClick={() => onSuggest(q)}
            className="flex items-center gap-2 text-left text-[0.75rem] px-3 py-2 rounded-xl
              bg-white/5 border border-white/10 text-foreground/70
              hover:bg-violet-500/10 hover:border-violet-500/30 hover:text-foreground
              transition-all duration-150 group"
          >
            <ChevronRight className="w-3 h-3 text-violet-400 flex-shrink-0 group-hover:translate-x-0.5 transition-transform" />
            <span>{q}</span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}

// ── Main widget ─────────────────────────────────────────────────────────────
export function RAGChatWidget({ articleSlug }: { articleSlug?: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const { messages, isLoading, sendMessage, clearConversation, hasMessages, cooldownSecondsLeft } = useRAGChat({ articleSlug });

  // Auto-scroll to bottom
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleSend = useCallback(async () => {
    const q = inputValue.trim();
    if (!q || isLoading || cooldownSecondsLeft > 0) return;
    setInputValue("");
    await sendMessage(q);
  }, [inputValue, isLoading, cooldownSecondsLeft, sendMessage]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSuggest = useCallback(
    (q: string) => {
      if (isLoading || cooldownSecondsLeft > 0) return;
      setInputValue("");
      sendMessage(q);
    },
    [sendMessage, isLoading, cooldownSecondsLeft]
  );

  return (
    <>
      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="rag-panel"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="fixed bottom-24 right-5 z-50 w-[340px] h-[500px] flex flex-col
              rounded-2xl border border-white/10 shadow-2xl shadow-black/50
              bg-[#0f0f14]/95 backdrop-blur-xl overflow-hidden"
            style={{ maxHeight: "calc(100vh - 120px)" }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3
              border-b border-white/10 bg-gradient-to-r from-violet-600/20 to-indigo-600/20 flex-shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600
                  flex items-center justify-center shadow-lg">
                  <Sparkles className="w-3.5 h-3.5 text-white" />
                </div>
                <div>
                  <p className="text-[0.8rem] font-semibold text-foreground leading-tight">Articles AI</p>
                  <p className="text-[0.65rem] text-muted-foreground">{articleSlug ? "This Article · AI" : "RAG · Gemini"}</p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                {hasMessages && (
                  <button
                    onClick={clearConversation}
                    title="New conversation"
                    className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground
                      hover:bg-white/10 transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground
                    hover:bg-white/10 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-3 py-3 space-y-0 scrollbar-thin
              scrollbar-thumb-white/10 scrollbar-track-transparent">
              {!hasMessages ? (
                <WelcomeScreen onSuggest={handleSuggest} />
              ) : (
                <>
                  {messages.map((msg) => (
                    <MessageBubble key={msg.id} message={msg} />
                  ))}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Input */}
            <div className="flex-shrink-0 border-t border-white/10 p-3">
              <div className={`flex items-end gap-2 bg-white/5 rounded-xl border transition-all px-3 py-2 ${
                cooldownSecondsLeft > 0
                  ? "border-amber-500/30 bg-amber-500/5"
                  : "border-white/10 focus-within:border-violet-500/50 focus-within:bg-violet-500/5"
              }`}>
                <textarea
                  ref={inputRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={
                    cooldownSecondsLeft > 0
                      ? `Rate limited — ready in ${cooldownSecondsLeft}s…`
                      : "Ask about any article topic…"
                  }
                  rows={1}
                  className="flex-1 bg-transparent text-[0.82rem] text-foreground placeholder:text-muted-foreground/60
                    resize-none outline-none leading-5 max-h-[80px] overflow-y-auto"
                  style={{ minHeight: "20px" }}
                  disabled={isLoading || cooldownSecondsLeft > 0}
                />
                <button
                  onClick={handleSend}
                  disabled={!inputValue.trim() || isLoading || cooldownSecondsLeft > 0}
                  className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center
                    bg-violet-600 hover:bg-violet-500 disabled:bg-white/10 disabled:cursor-not-allowed
                    transition-all text-white shadow-lg shadow-violet-900/30"
                >
                  {isLoading ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Send className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
              {cooldownSecondsLeft > 0 ? (
                <p className="text-[0.62rem] text-amber-400/80 text-center mt-1.5 animate-pulse">
                  ⏳ API rate limited — ready in {cooldownSecondsLeft}s
                </p>
              ) : (
                <p className="text-[0.62rem] text-muted-foreground/50 text-center mt-1.5">
                  Answers from Aditya's articles + web
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Trigger Button */}
      <motion.button
        onClick={() => setIsOpen((v) => !v)}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.94 }}
        className="fixed bottom-5 right-5 z-50 flex items-center gap-2
          bg-gradient-to-br from-violet-600 to-indigo-600
          hover:from-violet-500 hover:to-indigo-500
          text-white rounded-full shadow-2xl shadow-violet-900/50
          transition-all duration-200 border border-violet-400/20"
        aria-label="Toggle Articles AI chatbot"
        title="Ask about Aditya's articles"
        style={{ padding: isOpen ? "10px" : "10px 18px 10px 14px" }}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.span
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <X className="w-5 h-5" />
            </motion.span>
          ) : (
            <motion.span
              key="open"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="flex items-center gap-2"
            >
              <BookOpen className="w-4.5 h-4.5 flex-shrink-0" />
              <span className="text-[0.8rem] font-medium whitespace-nowrap">Articles AI</span>
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>
    </>
  );
}
