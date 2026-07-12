import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  MessageSquare, X, Send, Bot, User, Sparkles, AlertCircle,
  Github, ExternalLink, Mic, MicOff, Download, Command, ChevronRight
} from "lucide-react";

interface Message {
  role: "user" | "model";
  text: string;
}

const SUGGESTIONS = [
  "Who is Aditya?",
  "Tell me about his projects",
  "What is his tech stack?",
  "Tell me about his boxing background 🥊",
];

// ── Section nav items shown below the greeting ────────────────────────────
const GREETING_SECTIONS = [
  { id: "about",    label: "About" },
  { id: "skills",   label: "Skills" },
  { id: "projects", label: "Projects" },
];

// Timing constants (ms) for the welcome sequence
const GREETING_DELAY   = 300;   // greeting bubble appears
const JUMPS_DELAY      = 1100;  // section jump buttons
const LABEL_DELAY      = 1800;  // "SUGGESTED QUERIES:" label
const FIRST_CHIP_DELAY = 2100;  // first suggestion chip
const CHIP_STAGGER     = 180;   // delay between chips

// ── Shared animated welcome sequence ─────────────────────────────────────
const WelcomeSequence = ({
  isSmall,
  onSend,
}: {
  isSmall: boolean;   // true = inline (IDE card), false = floating panel
  onSend: (text: string) => void;
}) => {
  // Drive each element in with its own timer so nothing jumps in at once
  const [showGreeting,    setShowGreeting]    = useState(false);
  const [showJumps,       setShowJumps]       = useState(false);
  const [showLabel,       setShowLabel]       = useState(false);
  const [visibleChips,    setVisibleChips]    = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setShowGreeting(true),  GREETING_DELAY);
    const t2 = setTimeout(() => setShowJumps(true),     JUMPS_DELAY);
    const t3 = setTimeout(() => setShowLabel(true),     LABEL_DELAY);
    // Reveal chips one-by-one
    const chipTimers = SUGGESTIONS.map((_, i) =>
      setTimeout(() => setVisibleChips(i + 1), FIRST_CHIP_DELAY + i * CHIP_STAGGER)
    );
    return () => {
      clearTimeout(t1); clearTimeout(t2); clearTimeout(t3);
      chipTimers.forEach(clearTimeout);
    };
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  if (isSmall) {
    // ── Inline (IDE card) variant ──────────────────────────────────────
    return (
      <div className="space-y-2.5">
        {/* Greeting bubble */}
        <AnimatePresence>
          {showGreeting && (
            <motion.div
              className="flex items-start gap-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="w-6 h-6 rounded-lg bg-secondary border border-foreground text-foreground flex items-center justify-center text-[10px] flex-shrink-0 shadow-2xs">
                <Bot className="w-3 h-3" />
              </div>
              <div className="px-3 py-2 border bg-secondary text-foreground border-border/80 rounded-xl rounded-tl-none text-xs leading-relaxed max-w-[80%]">
                Hi! I'm Aditya's AI Assistant. Ask me anything about his projects, tech stack, certifications, or boxing achievements! 🥊
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Section jump buttons */}
        <AnimatePresence>
          {showJumps && (
            <motion.div
              className="flex flex-wrap gap-1 pl-8"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
              {GREETING_SECTIONS.map((sec) => (
                <button
                  key={sec.id}
                  type="button"
                  onClick={() => scrollTo(sec.id)}
                  className="inline-flex items-center gap-1 text-[9px] font-mono font-bold bg-blue-100 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 px-1.5 py-0.5 border border-blue-400/30 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/40 transition-colors cursor-pointer"
                >
                  ⚓ Jump to {sec.label}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Suggestions label */}
        <AnimatePresence>
          {showLabel && (
            <motion.p
              className="text-[10px] text-muted-foreground font-mono flex items-center gap-1 pt-0.5"
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
        <div className="flex flex-col gap-1.5">
          {SUGGESTIONS.map((sug, i) => (
            <AnimatePresence key={sug}>
              {visibleChips > i && (
                <motion.button
                  onClick={() => onSend(sug)}
                  className="text-[11px] font-mono text-left px-2.5 py-1.5 rounded-xl border border-foreground/60 bg-card hover:bg-secondary hover:border-foreground hover:translate-y-[-1px] transition-all duration-200 shadow-2xs active:translate-y-[1px] active:shadow-[1px_1px_0px_0px_currentColor] text-foreground"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                >
                  <span className="text-blue-400 mr-1">{">"}</span>
                  {sug}
                </motion.button>
              )}
            </AnimatePresence>
          ))}
        </div>
      </div>
    );
  }

  // ── Floating panel variant ─────────────────────────────────────────────
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
              Hi! I'm Aditya's AI Assistant. Ask me anything about his projects, tech stack, certifications, or boxing achievements! 🥊
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Section jump buttons */}
      <AnimatePresence>
        {showJumps && (
          <motion.div
            className="flex flex-wrap gap-1.5 pl-9"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
          >
            {GREETING_SECTIONS.map((sec) => (
              <button
                key={sec.id}
                type="button"
                onClick={() => scrollTo(sec.id)}
                className="inline-flex items-center gap-1 text-[10px] font-mono font-bold bg-blue-100 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 px-2 py-0.5 border border-blue-400/30 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/40 transition-colors cursor-pointer"
              >
                ⚓ Jump to {sec.label}
              </button>
            ))}
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
        {SUGGESTIONS.map((sug, i) => (
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

const PROJECTS_DATA = [
  {
    keywords: ["confessit", "confess it", "anonymous confession"],
    title: "ConfessIt",
    live: "https://justconfessit.vercel.app",
    github: "https://github.com/adityakumarsingh2/confessit"
  },
  {
    keywords: ["fitkart", "fit kart", "try-on", "e-commerce"],
    title: "FitKart",
    live: "https://fitkartshop.netlify.app/",
    github: "https://github.com/adityakumarsingh2/fitkart"
  },
  {
    keywords: ["shanti brick field", "shanti brickfield", "brick field"],
    title: "Shanti Brick Field",
    live: "https://shantibrickfield.kesug.com/",
    github: "https://github.com/adityakumarsingh2/shantibrickfield"
  },
  {
    keywords: ["set intern", "setintern", "internship allocation"],
    title: "Set Intern",
    github: "https://github.com/adityakumarsingh2/setintern"
  },
  {
    keywords: ["portfolio", "personal website"],
    title: "Personal Portfolio",
    live: "https://adityakumaronline.netlify.app",
    github: "https://github.com/adityakumarsingh2/portfolio"
  }
];

const CERTIFICATIONS_DATA = [
  {
    keywords: ["cloud computing", "nptel cloud"],
    title: "Cloud Computing | NPTEL",
    link: "https://drive.google.com/file/d/187CFo6VbufxGicOaZHFFDU3OLRUGT-oz/view"
  },
  {
    keywords: ["demystifying networking", "nptel networking", "demystifying"],
    title: "Demystifying Networking | NPTEL",
    link: "https://drive.google.com/file/d/187CFo6VbufxGicOaZHFFDU3OLRUGT-oz/view"
  },
  {
    keywords: ["oracle cloud", "oci", "oracle cloud infrastructure", "certified foundation associate"],
    title: "OCI 2025 Foundation Associate | Oracle",
    link: "https://catalog-education.oracle.com/ords/certview/sharebadge?id=9DC2763D8B6786054E3DF258C1999F07DB5A0BF66C15CFA639399A0DC2C86D61"
  }
];

const SECTIONS_DATA = [
  { keywords: ["about", "profile", "bio", "background"], id: "about", label: "About" },
  { keywords: ["skills", "tech stack", "technologies", "languages"], id: "skills", label: "Skills" },
  { keywords: ["experience", "job", "freelance", "work history"], id: "experience", label: "Experience" },
  { keywords: ["projects", "work", "portfolio projects"], id: "projects", label: "Projects" },
  { keywords: ["contact", "email", "reach out"], id: "contact", label: "Contact" }
];

const COMMANDS = [
  { cmd: "/projects", desc: "Aditya's projects", query: "Tell me about his projects" },
  { cmd: "/skills", desc: "His technical stack", query: "What is his tech stack?" },
  { cmd: "/experience", desc: "Freelance & work history", query: "Tell me about his professional experience" },
  { cmd: "/contact", desc: "Contact details", query: "How can I contact Aditya?" },
  { cmd: "/boxing", desc: "Boxing accolades 🥊", query: "Tell me about his boxing background 🥊" },
  { cmd: "/resume", desc: "Download CV / Resume", query: "Can I download his resume?" }
];

const detectProjects = (text: string) => {
  if (!text) return [];
  const lower = text.toLowerCase();
  return PROJECTS_DATA.filter((proj) =>
    proj.keywords.some((kw) => lower.includes(kw))
  );
};

const detectCertifications = (text: string) => {
  if (!text) return [];
  const lower = text.toLowerCase();
  return CERTIFICATIONS_DATA.filter((cert) =>
    cert.keywords.some((kw) => lower.includes(kw))
  );
};

const detectSections = (text: string) => {
  if (!text) return [];
  const lower = text.toLowerCase();
  return SECTIONS_DATA.filter((sec) =>
    sec.keywords.some((kw) => lower.includes(kw))
  );
};

const getISTStatus = () => {
  const now = new Date();
  const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
  const istTime = new Date(utc + (3600000 * 5.5));
  const hours = istTime.getHours();
  
  if (hours >= 23 || hours < 7) {
    return { emoji: "💤", text: "Sleeping (Dreaming in code)" };
  } else if (hours >= 18 && hours < 20) {
    return { emoji: "🥊", text: "Training at boxing gym" };
  } else if (hours >= 9 && hours < 18) {
    return { emoji: "💻", text: "Coding & Building things" };
  } else {
    return { emoji: "☕", text: "Learning & Exploring" };
  }
};

interface ChatbotProps {
  isInline?: boolean;
  messages?: Message[];
  setMessages?: React.Dispatch<React.SetStateAction<Message[]>>;
  input?: string;
  setInput?: (val: string) => void;
  isOpen?: boolean;
  setIsOpen?: (val: boolean) => void;
}

const Chatbot = ({
  isInline = false,
  messages: propMessages,
  setMessages: propSetMessages,
  input: propInput,
  setInput: propSetInput,
  isOpen: propIsOpen,
  setIsOpen: propSetIsOpen,
}: ChatbotProps) => {
  const [localIsOpen, localSetIsOpen] = useState(false);
  const [localMessages, localSetMessages] = useState<Message[]>([
    {
      role: "model",
      text: "Hi! I'm Aditya's AI Assistant. Ask me anything about Aditya's full-stack projects, tech stack, certifications, or even his boxing achievements! 🥊",
    },
  ]);
  const [localInput, localSetInput] = useState("");

  const isOpen = propIsOpen !== undefined ? propIsOpen : localIsOpen;
  const setIsOpen = propSetIsOpen !== undefined ? propSetIsOpen : localSetIsOpen;
  const messages = propMessages !== undefined ? propMessages : localMessages;
  const setMessages = propSetMessages !== undefined ? propSetMessages : localSetMessages;
  const input = propInput !== undefined ? propInput : localInput;
  const setInput = propSetInput !== undefined ? propSetInput : localSetInput;

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Speech Recognition state
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  const bodyRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (bodyRef.current) {
      bodyRef.current.scrollTo({
        top: bodyRef.current.scrollHeight,
        behavior: "smooth"
      });
    }
  };

  useEffect(() => {
    if (isOpen || isInline) {
      scrollToBottom();
    }
  }, [messages, isOpen, isInline, isLoading]);

  // Speech Recognition initialization
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = "en-US";

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput((prev) => prev + (prev ? " " : "") + transcript);
      };

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, [setInput]);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert("Speech recognition is not supported in this browser. Try Chrome or Edge!");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
    }
  };

  const exportChatTranscript = () => {
    if (messages.length <= 1) return;
    
    let transcript = `# Aditya Kumar Singh AI Assistant Chat Transcript\n`;
    transcript += `Generated on: ${new Date().toLocaleString()}\n\n`;
    
    messages.forEach((msg) => {
      const roleName = msg.role === "user" ? "You (User)" : "AI Assistant";
      transcript += `### **${roleName}**:\n${msg.text}\n\n`;
    });
    
    const blob = new Blob([transcript], { type: "text/markdown;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Aditya_Chat_Transcript_${new Date().toISOString().slice(0,10)}.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim()) return;

    setError(null);
    const userMessage: Message = { role: "user", text: textToSend };
    
    // Add user message, clear input
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // Append a placeholder model response that we will stream text into
    setMessages((prev) => [...prev, { role: "model", text: "" }]);

    try {
      const history = messages.slice(1); // skip the greeting

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
        let errorMsg = "Unable to reach the server. Make sure the backend server is running.";
        try {
          const contentType = response.headers.get("content-type");
          if (contentType && contentType.includes("application/json")) {
            const errData = await response.json();
            if (errData && errData.error) {
              errorMsg = errData.error;
            }
          }
        } catch (e) {
          // Fallback if parsing fails
        }
        throw new Error(errorMsg);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("No readable stream in response.");
      }

      const decoder = new TextDecoder();
      let done = false;
      let accumulatedText = "";
      let buffer = "";

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        if (value) {
          buffer += decoder.decode(value, { stream: !done });
          const lines = buffer.split("\n\n");
          
          // Save the last partial block back to buffer
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const rawData = line.slice(6).trim();
              if (rawData === "[DONE]") {
                done = true;
                break;
              }
              try {
                const parsed = JSON.parse(rawData);
                if (parsed.error) {
                  throw new Error(parsed.error);
                }
                if (parsed.text) {
                  accumulatedText += parsed.text;
                  setMessages((prev) => {
                    const updated = [...prev];
                    if (updated.length > 0) {
                      updated[updated.length - 1] = {
                        role: "model",
                        text: accumulatedText,
                      };
                    }
                    return updated;
                  });
                }
              } catch (e) {
                // Ignore parsing errors for incomplete JSON segments
              }
            }
          }
        }
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Something went wrong. Please try again.");
      // Remove empty model placeholder on failure
      setMessages((prev) => {
        const updated = [...prev];
        if (updated.length > 0 && updated[updated.length - 1].text === "") {
          return updated.slice(0, -1);
        }
        return updated;
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Parses markdown bold (**text**), links ([text](url)) and list items line-by-line
  const formatMessageText = (text: string) => {
    if (!text) return null;
    const lines = text.split("\n");
    
    return lines.map((line, lineIdx) => {
      // Check for bullet lists
      const isBullet = line.trim().startsWith("- ") || line.trim().startsWith("* ");
      const cleanLine = isBullet ? line.trim().substring(2) : line;

      // Match bold tags or link brackets
      const regex = /(\*\*.*?\*\*|\[[^\]]+\]\([^)]+\))/g;
      const parts = cleanLine.split(regex);
      
      const parsedLine = parts.map((part, partIdx) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return (
            <strong key={partIdx} className="font-bold text-foreground">
              {part.slice(2, -2)}
            </strong>
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

  // Helper to determine if we should show the typing loading indicator
  const shouldShowTyping = () => {
    if (!isLoading) return false;
    if (messages.length === 0) return false;
    const lastMsg = messages[messages.length - 1];
    return lastMsg.role === "user" || (lastMsg.role === "model" && lastMsg.text === "");
  };

  const matchingCommands = input.startsWith("/") 
    ? COMMANDS.filter((cmd) => cmd.cmd.startsWith(input.toLowerCase()))
    : [];

  if (isInline) {
    return (
      <div className="w-full h-full bg-card flex flex-col overflow-hidden relative text-foreground">
        {/* Minimal header showing activity status */}
        <div className="p-2.5 bg-secondary/60 border-b border-border/30 flex items-center justify-between font-mono text-[10px]">
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
            </span>
            <span>Status: {getISTStatus().emoji} {getISTStatus().text}</span>
          </div>
        </div>

        {/* Chat Body */}
        <div ref={bodyRef} className="flex-1 p-3 overflow-y-auto space-y-3.5 custom-scrollbar bg-card">
          {/* First message = hardcoded greeting — render the animated welcome sequence */}
          {messages.length === 1 && !isLoading ? (
            <WelcomeSequence isSmall onSend={handleSendMessage} />
          ) : (
            messages.map((msg, index) => {
              if (msg.role === "model" && msg.text === "") return null;
              // Skip index 0 (greeting) once conversation has started — it's
              // already been seen; skip rendering it again to avoid duplication.
              if (index === 0) return null;

              return (
                <div
                  key={index}
                  className={`flex items-start gap-2 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
                >
                  <div
                    className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] flex-shrink-0 border border-foreground shadow-2xs ${
                      msg.role === "user"
                        ? "bg-foreground text-background"
                        : "bg-secondary text-foreground"
                    }`}
                  >
                    {msg.role === "user" ? <User className="w-3 h-3" /> : <Bot className="w-3 h-3" />}
                  </div>

                  <div className="flex flex-col max-w-[80%]">
                    <div
                      className={`px-3 py-2 border rounded-xl text-xs leading-relaxed whitespace-pre-wrap ${
                        msg.role === "user"
                          ? "bg-foreground text-background border-foreground rounded-tr-none shadow-2xs"
                          : "bg-secondary text-foreground border-border/80 rounded-tl-none font-sans font-normal"
                      }`}
                    >
                      {formatMessageText(msg.text)}
                    </div>

                    {/* Interactive Buttons for projects and sections */}
                    {msg.role === "model" && msg.text !== "" && (
                      <div className="mt-1 space-y-1">
                        {/* Project redirection buttons */}
                        {(() => {
                          const detected = detectProjects(msg.text);
                          if (detected.length === 0) return null;
                          return (
                            <div className="flex flex-wrap gap-1 mt-1 pt-1 border-t border-dashed border-border/30">
                              {detected.map((proj) => (
                                <div key={proj.title} className="flex flex-wrap items-center gap-1 bg-secondary border border-foreground/30 rounded-lg p-1 shadow-2xs">
                                  <span className="text-[9px] font-mono font-semibold text-foreground mr-0.5">{proj.title}</span>
                                  {proj.live && (
                                    <a
                                      href={proj.live}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-0.5 text-[8px] font-mono font-bold bg-green-400 dark:bg-green-500/90 text-black px-1.5 py-0.5 border border-black rounded transition-all hover:-translate-y-[0.5px] active:translate-y-0"
                                    >
                                      <ExternalLink className="w-2 h-2" /> Live
                                    </a>
                                  )}
                                  {proj.github && (
                                    <a
                                      href={proj.github}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-0.5 text-[8px] font-mono font-bold bg-card hover:bg-accent text-foreground px-1.5 py-0.5 border border-foreground/50 rounded transition-all hover:-translate-y-[0.5px] active:translate-y-0"
                                    >
                                      <Github className="w-2 h-2" /> Code
                                    </a>
                                  )}
                                </div>
                              ))}
                            </div>
                          );
                        })()}

                        {/* Certification redirection buttons */}
                        {(() => {
                          const detectedCerts = detectCertifications(msg.text);
                          if (detectedCerts.length === 0) return null;
                          return (
                            <div className="flex flex-wrap gap-1 mt-1 pt-1 border-t border-dashed border-border/30">
                              {detectedCerts.map((cert) => (
                                <div key={cert.title} className="flex flex-wrap items-center gap-1 bg-secondary border border-foreground/30 rounded-lg p-1 shadow-2xs">
                                  <span className="text-[9px] font-mono font-semibold text-foreground mr-0.5">{cert.title}</span>
                                  <a
                                    href={cert.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-0.5 text-[8px] font-mono font-bold bg-[#FFCB6B] text-black px-1.5 py-0.5 border border-black rounded transition-all hover:-translate-y-[0.5px] active:translate-y-0"
                                  >
                                    <ExternalLink className="w-2 h-2" /> Credential
                                  </a>
                                </div>
                              ))}
                            </div>
                          );
                        })()}

                        {/* Section Jumper buttons */}
                        {(() => {
                          const detectedSecs = detectSections(msg.text);
                          if (detectedSecs.length === 0) return null;
                          return (
                            <div className="flex flex-wrap gap-1">
                              {detectedSecs.map((sec) => (
                                <button
                                  key={sec.id}
                                  type="button"
                                  onClick={() => {
                                    const element = document.getElementById(sec.id);
                                    if (element) {
                                      element.scrollIntoView({ behavior: "smooth", block: "start" });
                                    }
                                  }}
                                  className="inline-flex items-center gap-1 text-[9px] font-mono font-bold bg-blue-100 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 px-1.5 py-0.5 border border-blue-400/30 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/40 transition-colors cursor-pointer"
                                >
                                  ⚓ Jump to {sec.label}
                                </button>
                              ))}
                            </div>
                          );
                        })()}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}

          {shouldShowTyping() && (
            <div className="flex items-start gap-2">
              <div className="w-6 h-6 rounded-lg bg-secondary border border-foreground text-foreground flex items-center justify-center text-[10px] flex-shrink-0 shadow-2xs">
                <Bot className="w-3.5 h-3.5" />
              </div>
              <div className="bg-secondary border border-border/80 px-3 py-2 rounded-xl rounded-tl-none max-w-[80%] flex items-center gap-1">
                <span className="w-1 h-1 bg-foreground rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-1 h-1 bg-foreground rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-1 h-1 bg-foreground rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-destructive/10 border-2 border-destructive text-destructive font-mono text-[10px] shadow-2xs">
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Autocomplete Command Dropdown */}
        {input.startsWith("/") && matchingCommands.length > 0 && (
          <div className="absolute bottom-[55px] left-2.5 right-2.5 bg-card border-2 border-foreground rounded-xl shadow-md z-20 overflow-hidden max-h-[140px] overflow-y-auto">
            <div className="bg-secondary p-1.5 border-b border-foreground text-[9px] font-mono text-muted-foreground flex items-center gap-1">
              <Command className="w-2.5 h-2.5 text-primary" /> COMMAND QUICK SHORTCUTS
            </div>
            <div className="flex flex-col">
              {matchingCommands.map((cmd) => (
                <button
                  key={cmd.cmd}
                  type="button"
                  onClick={() => {
                    setInput(cmd.query);
                    handleSendMessage(cmd.query);
                  }}
                  className="w-full text-left font-mono text-[10px] p-2 hover:bg-secondary border-b border-border/40 last:border-0 flex items-center justify-between text-foreground"
                >
                  <div className="flex items-center gap-1.5">
                    <span className="text-blue-400 font-bold">{cmd.cmd}</span>
                    <span className="text-muted-foreground text-[9px]">— {cmd.desc}</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Chat Input */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage(input);
          }}
          className="p-2 border-t-2 border-foreground bg-secondary/40 flex items-center gap-1.5 relative mt-auto"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type or '/' for commands..."
            className="flex-1 min-w-0 bg-card border-2 border-foreground rounded-xl px-2.5 py-1.5 text-xs focus:outline-none focus:ring-0 font-mono text-foreground"
            disabled={isLoading}
          />

          {/* Web Speech microphone button */}
          <button
            type="button"
            onClick={toggleListening}
            className={`p-2 rounded-xl border-2 border-foreground transition-all duration-150 flex-shrink-0 ${
              isListening
                ? "bg-red-500 text-white animate-pulse"
                : "bg-card text-foreground hover:bg-secondary"
            }`}
            title={isListening ? "Listening..." : "Speech Input"}
          >
            {isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
          </button>

          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="p-2 rounded-xl bg-foreground text-background border-2 border-foreground disabled:opacity-40 hover:bg-secondary hover:text-foreground hover:translate-y-[-1px] shadow-2xs active:translate-y-[1px] active:shadow-none transition-all duration-150 flex-shrink-0"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
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
                    <span>assistant</span>
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
                  <span>Activity: {getISTStatus().emoji} {getISTStatus().text}</span>
                </div>
              </div>

              <div className="flex items-center gap-1">
                {/* Export Conversation Button */}
                {messages.length > 1 && (
                  <button
                    onClick={exportChatTranscript}
                    className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-card border border-transparent hover:border-foreground/30 transition-all text-foreground/80 hover:text-foreground"
                    title="Export Conversation"
                  >
                    <Download className="w-4 h-4" />
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
              {/* Initial state: animated welcome sequence */}
              {messages.length === 1 && !isLoading ? (
                <WelcomeSequence isSmall={false} onSend={handleSendMessage} />
              ) : (
                messages.map((msg, index) => {
                  if (msg.role === "model" && msg.text === "") return null;
                  // Greeting (index 0) is handled by WelcomeSequence above;
                  // skip re-rendering it once conversation starts.
                  if (index === 0) return null;

                  return (
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
                          {formatMessageText(msg.text)}
                        </div>

                        {/* Interactive action buttons — only on AI responses */}
                        {msg.role === "model" && msg.text !== "" && (
                          <div className="mt-1 space-y-1.5">
                            {(() => {
                              const detected = detectProjects(msg.text);
                              if (detected.length === 0) return null;
                              return (
                                <div className="flex flex-wrap gap-1.5 mt-1 pt-1.5 border-t border-dashed border-border/30">
                                  {detected.map((proj) => (
                                    <div key={proj.title} className="flex flex-wrap items-center gap-1 bg-secondary border border-foreground/30 rounded-lg p-1 shadow-2xs">
                                      <span className="text-[10px] font-mono font-semibold text-foreground mr-1">{proj.title}</span>
                                      {proj.live && (
                                        <a href={proj.live} target="_blank" rel="noopener noreferrer"
                                          className="inline-flex items-center gap-0.5 text-[9px] font-mono font-bold bg-green-400 dark:bg-green-500/90 text-black px-1.5 py-0.5 border border-black rounded transition-all hover:-translate-y-[0.5px] active:translate-y-0">
                                          <ExternalLink className="w-2.5 h-2.5" /> Live
                                        </a>
                                      )}
                                      {proj.github && (
                                        <a href={proj.github} target="_blank" rel="noopener noreferrer"
                                          className="inline-flex items-center gap-0.5 text-[9px] font-mono font-bold bg-card hover:bg-accent text-foreground px-1.5 py-0.5 border border-foreground/50 rounded transition-all hover:-translate-y-[0.5px] active:translate-y-0">
                                          <Github className="w-2.5 h-2.5" /> Code
                                        </a>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              );
                            })()}
                            {(() => {
                              const detectedCerts = detectCertifications(msg.text);
                              if (detectedCerts.length === 0) return null;
                              return (
                                <div className="flex flex-wrap gap-1.5 mt-1 pt-1.5 border-t border-dashed border-border/30">
                                  {detectedCerts.map((cert) => (
                                    <div key={cert.title} className="flex flex-wrap items-center gap-1 bg-secondary border border-foreground/30 rounded-lg p-1 shadow-2xs">
                                      <span className="text-[10px] font-mono font-semibold text-foreground mr-1">{cert.title}</span>
                                      <a href={cert.link} target="_blank" rel="noopener noreferrer"
                                        className="inline-flex items-center gap-0.5 text-[9px] font-mono font-bold bg-[#FFCB6B] text-black px-1.5 py-0.5 border border-black rounded transition-all hover:-translate-y-[0.5px] active:translate-y-0">
                                        <ExternalLink className="w-2.5 h-2.5" /> Credential
                                      </a>
                                    </div>
                                  ))}
                                </div>
                              );
                            })()}
                            {(() => {
                              const detectedSecs = detectSections(msg.text);
                              if (detectedSecs.length === 0) return null;
                              return (
                                <div className="flex flex-wrap gap-1">
                                  {detectedSecs.map((sec) => (
                                    <button key={sec.id} type="button"
                                      onClick={() => document.getElementById(sec.id)?.scrollIntoView({ behavior: "smooth", block: "start" })}
                                      className="inline-flex items-center gap-1 text-[10px] font-mono font-bold bg-blue-100 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 px-2 py-0.5 border border-blue-400/30 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/40 transition-colors cursor-pointer">
                                      ⚓ Jump to {sec.label}
                                    </button>
                                  ))}
                                </div>
                              );
                            })()}
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

              {error && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-destructive/10 border-2 border-destructive text-destructive font-mono text-xs shadow-2xs">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}
            </div>

            {/* Autocomplete Command Dropdown */}
            {input.startsWith("/") && matchingCommands.length > 0 && (
              <div className="absolute bottom-[60px] left-3 right-3 bg-card border-2 border-foreground rounded-xl shadow-md z-20 overflow-hidden max-h-[180px] overflow-y-auto">
                <div className="bg-secondary p-2 border-b border-foreground text-[10px] font-mono text-muted-foreground flex items-center gap-1">
                  <Command className="w-3 h-3 text-primary" /> COMMAND QUICK SHORTCUTS
                </div>
                <div className="flex flex-col">
                  {matchingCommands.map((cmd) => (
                    <button
                      key={cmd.cmd}
                      type="button"
                      onClick={() => {
                        setInput(cmd.query);
                        handleSendMessage(cmd.query);
                      }}
                      className="w-full text-left font-mono text-xs p-2.5 hover:bg-secondary border-b border-border/40 last:border-0 flex items-center justify-between text-foreground"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-blue-400 font-bold">{cmd.cmd}</span>
                        <span className="text-muted-foreground text-[10px]">— {cmd.desc}</span>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Chat Input */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage(input);
              }}
              className="p-3 border-t-2 border-foreground bg-secondary/40 flex items-center gap-2 relative mt-auto"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type a message or '/' for commands..."
                className="flex-1 min-w-0 bg-card border-2 border-foreground rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-0 font-mono text-foreground"
                disabled={isLoading}
              />

              {/* Web Speech microphone button */}
              <button
                type="button"
                onClick={toggleListening}
                className={`p-2.5 rounded-xl border-2 border-foreground transition-all duration-150 flex-shrink-0 ${
                  isListening
                    ? "bg-red-500 text-white animate-pulse"
                    : "bg-card text-foreground hover:bg-secondary"
                }`}
                title={isListening ? "Listening... Click to Stop" : "Speech-to-Text Input"}
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>

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
export type { Message };
