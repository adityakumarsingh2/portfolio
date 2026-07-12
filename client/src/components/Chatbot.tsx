import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, X, Send, Bot, User, Sparkles, AlertCircle } from "lucide-react";

interface Message {
  role: "user" | "model";
  text: string;
}

const SUGGESTIONS = [
  "Who is Aditya?",
  "Tell me about your projects",
  "What is your tech stack?",
  "Tell me about your boxing background 🥊",
];

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "model",
      text: "Hi! I'm Aditya's AI Assistant. Ask me anything about my full-stack projects, tech stack, certifications, or even my boxing achievements! 🥊",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen, isLoading]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim()) return;

    setError(null);
    const userMessage: Message = { role: "user", text: textToSend };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // Create history array, skipping the first greeting message
      const history = messages.slice(1);

      const response = await fetch("http://localhost:5000/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: textToSend,
          history: history,
        }),
      });

      if (!response.ok) {
        throw new Error("Unable to reach the server. Make sure the backend server is running.");
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      setMessages((prev) => [...prev, { role: "model", text: data.reply }]);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="mb-4 w-[380px] h-[550px] max-w-[calc(100vw-2rem)] bg-card border-2 border-foreground rounded-2xl shadow-md flex flex-col overflow-hidden"
          >
            {/* Header: Neo-Brutalist Code Bar */}
            <div className="p-4 bg-secondary border-b-2 border-foreground flex items-center justify-between font-mono text-sm">
              <div className="flex items-center gap-2.5">
                {/* Simulated CLI indicator */}
                <div className="flex gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-red-500 border border-foreground/30" />
                  <span className="w-3 h-3 rounded-full bg-yellow-500 border border-foreground/30" />
                  <span className="w-3 h-3 rounded-full bg-green-500 border border-foreground/30" />
                </div>
                <div className="ml-2 flex items-center gap-1.5 text-foreground font-semibold">
                  <span className="text-blue-500">const</span>
                  <span>assistant</span>
                  <span className="text-foreground/70">=</span>
                  <span className="text-gradient-warm font-bold font-sans">AI;</span>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-7 h-7 rounded-lg border border-border hover:border-foreground flex items-center justify-center hover:bg-muted/80 transition-all text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Chat Body */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4 custom-scrollbar bg-card">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex items-start gap-2.5 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
                >
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs flex-shrink-0 border border-foreground shadow-2xs ${
                      msg.role === "user"
                        ? "bg-foreground text-background"
                        : "bg-secondary text-foreground"
                    }`}
                  >
                    {msg.role === "user" ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                  </div>

                  <div className="flex flex-col max-w-[75%]">
                    <div
                      className={`px-3.5 py-2.5 border rounded-xl text-sm leading-relaxed whitespace-pre-wrap ${
                        msg.role === "user"
                          ? "bg-foreground text-background border-foreground rounded-tr-none shadow-2xs"
                          : "bg-secondary text-foreground border-border/80 rounded-tl-none font-sans font-normal"
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                </div>
              ))}

              {isLoading && (
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

              {error && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-destructive/10 border-2 border-destructive text-destructive font-mono text-xs shadow-2xs">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Suggestions Chips (shown when no conversation other than greeting has occurred) */}
              {messages.length === 1 && !isLoading && (
                <div className="pt-2 space-y-2">
                  <p className="text-[11px] text-muted-foreground font-mono flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-yellow-500 animate-pulse" /> SUGGESTED QUERIES:
                  </p>
                  <div className="flex flex-col gap-2">
                    {SUGGESTIONS.map((sug) => (
                      <button
                        key={sug}
                        onClick={() => handleSendMessage(sug)}
                        className="text-xs font-mono text-left px-3 py-2 rounded-xl border border-foreground/60 bg-card hover:bg-secondary hover:border-foreground hover:translate-y-[-1px] transition-all duration-200 shadow-2xs active:translate-y-[1px] active:shadow-[1px_1px_0px_0px_currentColor] text-foreground"
                      >
                        <span className="text-blue-400 mr-1.5">{">"}</span>
                        {sug}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Chat Input */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage(input);
              }}
              className="p-3 border-t-2 border-foreground bg-secondary/40 flex items-center gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask me something about Aditya..."
                className="flex-1 min-w-0 bg-card border-2 border-foreground rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-0 font-mono text-foreground"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="p-2.5 rounded-xl bg-foreground text-background border-2 border-foreground disabled:opacity-40 hover:bg-secondary hover:text-foreground hover:translate-y-[-1px] shadow-2xs active:translate-y-[1px] active:shadow-none transition-all duration-150 flex-shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Toggle Button: Neo-Brutalist Code Toggle */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="w-14 h-14 rounded-2xl bg-card border-2 border-foreground flex items-center justify-center text-foreground shadow-sm hover:shadow-md cursor-pointer hover:bg-secondary transition-all duration-300 relative group overflow-hidden"
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
};

export default Chatbot;
