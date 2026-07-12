import { motion, useMotionValue, useSpring } from "framer-motion";
import { ArrowDown, Github, Linkedin, Mail } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import profilePhoto from "@/assets/profile-photo.png";
import Chatbot, { Message } from "./Chatbot";

const useTypingEffect = (texts: string[], typingSpeed = 100, deletingSpeed = 50, pauseDuration = 2000) => {
  const [displayedText, setDisplayedText] = useState("");
  const [textIndex, setTextIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentText = texts[textIndex];

    const timeout = setTimeout(() => {
      if (!isDeleting) {
        if (displayedText.length < currentText.length) {
          setDisplayedText(currentText.slice(0, displayedText.length + 1));
        } else {
          setTimeout(() => setIsDeleting(true), pauseDuration);
        }
      } else {
        if (displayedText.length > 0) {
          setDisplayedText(displayedText.slice(0, -1));
        } else {
          setIsDeleting(false);
          setTextIndex((prev) => (prev + 1) % texts.length);
        }
      }
    }, isDeleting ? deletingSpeed : typingSpeed);

    return () => clearTimeout(timeout);
  }, [displayedText, isDeleting, textIndex, texts, typingSpeed, deletingSpeed, pauseDuration]);

  return displayedText;
};

// Magnetic Button component
const MagneticElement = ({ children, className = "", strength = 0.3 }: { children: React.ReactNode; className?: string; strength?: number }) => {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springConfig = { stiffness: 150, damping: 15 };
  const xSpring = useSpring(x, springConfig);
  const ySpring = useSpring(y, springConfig);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;

    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const distanceX = e.clientX - centerX;
    const distanceY = e.clientY - centerY;

    x.set(distanceX * strength);
    y.set(distanceY * strength);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ x: xSpring, y: ySpring }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

interface HeroProps {
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  input: string;
  setInput: (val: string) => void;
}

const Hero = ({ messages, setMessages, input, setInput }: HeroProps) => {
  const taglines = [
    "Full Stack Developer",
    "Cloud Enthusiast",
    "DSA Enthusiast",
    "Problem Solver"
  ];

  const typedText = useTypingEffect(taglines, 100, 50, 2000);

  const techSymbols = ["C++", "Java", "DSA", "React", "Node.js", "Express.js", "MongoDB", "TypeScript", "Python", "AWS"];
  const [randomSymbols, setRandomSymbols] = useState<string[]>([]);
  
  useEffect(() => {
    // Seed symbols once on mount to prevent React hydration warning
    setRandomSymbols([...techSymbols].sort(() => Math.random() - 0.5).slice(0, 6));
  }, []);

  const containerRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<"profile" | "chat">("profile");
  const [bootStage, setBootStage] = useState(0);
  const [hasBooted, setHasBooted] = useState(false);

  useEffect(() => {
    if (activeTab === "chat" && !hasBooted) {
      setBootStage(0);
      const t1 = setTimeout(() => setBootStage(1), 200);
      const t2 = setTimeout(() => setBootStage(2), 400);
      const t3 = setTimeout(() => setBootStage(3), 600);
      const t4 = setTimeout(() => setHasBooted(true), 850);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
        clearTimeout(t4);
      };
    }
  }, [activeTab, hasBooted]);

  return (
    <section
      ref={containerRef}
      id="home"
      className="min-h-screen flex items-center justify-center relative overflow-hidden bg-background gpu-accelerate"
    >
      {/* Subtle grid pattern overlay */}
      <div className="absolute inset-0 z-0 opacity-[0.03]" style={{
        backgroundImage: `linear-gradient(hsl(var(--primary) / 0.3) 1px, transparent 1px),
                          linear-gradient(90deg, hsl(var(--primary) / 0.3) 1px, transparent 1px)`,
        backgroundSize: '60px 60px',
        willChange: 'auto'
      }} />

      {/* Animated noise texture overlay */}
      <div className="absolute inset-0 z-0 opacity-[0.015] mix-blend-overlay pointer-events-none" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
      }} />

      {/* Premium gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background z-[1] pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.02] via-transparent to-primary/[0.04] z-[1] pointer-events-none" />

      {/* Glowing background mesh gradients */}
      <motion.div
        className="absolute top-[10%] left-[5%] w-[350px] h-[350px] md:w-[600px] md:h-[600px] rounded-full bg-gradient-to-br from-orange-500/10 via-rose-500/5 to-transparent blur-[100px] md:blur-[130px] pointer-events-none z-0"
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.5, 0.8, 0.5],
        }}
        transition={{
          duration: 9,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute bottom-[10%] right-[5%] w-[250px] h-[250px] md:w-[500px] md:h-[500px] rounded-full bg-gradient-to-br from-blue-500/8 via-purple-500/3 to-transparent blur-[85px] md:blur-[115px] pointer-events-none z-0"
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.4, 0.7, 0.4],
        }}
        transition={{
          duration: 11,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2.5,
        }}
      />

      {/* Radial gradient spotlight effect */}
      <div className="absolute inset-0 z-[1] pointer-events-none" style={{
        background: 'radial-gradient(ellipse 80% 50% at 50% 50%, hsl(var(--primary) / 0.05) 0%, transparent 60%)'
      }} />

      {/* Animated corner accents - refined */}
      <motion.div
        className="absolute top-24 left-12 w-16 h-16 border-l border-t border-primary/10 z-[2]"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5, duration: 0.8 }}
      />
      <motion.div
        className="absolute bottom-24 right-12 w-16 h-16 border-r border-b border-primary/10 z-[2]"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.7, duration: 0.8 }}
      />

      {/* Floating code symbols - stable on mount */}
      {randomSymbols.map((symbol, i) => (
        <motion.span
          key={symbol + i}
          className="absolute font-mono text-primary/15 text-lg md:text-xl select-none z-[2] hidden lg:block"
          style={{
            left: `${8 + i * 14}%`,
            top: `${20 + (i % 3) * 22}%`,
          }}
          animate={{
            y: [0, -4, 0],
            opacity: [0.08, 0.15, 0.08],
          }}
          transition={{
            duration: 10 + i * 2,
            repeat: Infinity,
            delay: i * 1.5,
            ease: "easeInOut",
          }}
        >
          {symbol}
        </motion.span>
      ))}

      {/* Subtle horizontal lines */}
      <div className="absolute top-1/4 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/10 to-transparent z-[1]" />
      <div className="absolute bottom-1/3 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/5 to-transparent z-[1]" />

      <div className="container mx-auto px-6 relative z-10 pt-20">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Left side - Text content */}
            <div className="text-center lg:text-left order-2 lg:order-1">
              {/* Intro - Code style */}
              <motion.div
                className="mb-4"
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
              >
                <motion.span
                  className="font-mono text-xs tracking-wider inline-block px-4 py-2.5 rounded-lg bg-card/40 border border-border/40 backdrop-blur-md cursor-default shadow-sm"
                  whileHover={{
                    scale: 1.02,
                    borderColor: "hsl(var(--primary) / 0.3)",
                    boxShadow: "0 4px 20px hsl(var(--primary) / 0.05)"
                  }}
                  transition={{ duration: 0.2 }}
                >
                  <span className="text-[#C792EA] font-semibold">import </span>
                  <span className="text-[#82B1FF]">Developer </span>
                  <span className="text-[#C792EA] font-semibold">from </span>
                  <span className="text-[#C3E88D]">"@/career"</span>
                </motion.span>
              </motion.div>

              {/* Name with animated gradient underline */}
              <motion.h1
                className="font-display text-5xl md:text-6xl lg:text-7xl font-bold mb-6 relative tracking-tight"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.3 }}
              >
                <span className="relative">
                  Aditya Kumar
                  <motion.span
                    className="absolute -bottom-2 left-0 h-[2px] bg-gradient-to-r from-orange-500 via-rose-500 to-amber-500 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ delay: 0.8, duration: 0.8 }}
                  />
                </span>
                <span className="block text-gradient-warm mt-4 pb-2">Singh</span>
              </motion.h1>

              {/* Typing Animation Tagline */}
              <motion.div
                className="text-xl md:text-2xl text-muted-foreground mb-8 h-10 flex items-center justify-center lg:justify-start gap-2"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.4 }}
              >
                <span className="text-primary font-mono text-lg">{">"}</span>
                <span className="text-foreground font-semibold">{typedText}</span>
                <motion.span
                  className="inline-block w-0.5 h-6 bg-primary"
                  animate={{ opacity: [1, 0] }}
                  transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
                />
              </motion.div>

              {/* Syntax Highlighted IDE badge */}
              <motion.p
                className="text-xs md:text-sm text-muted-foreground mb-8 max-w-xl mx-auto lg:mx-0 font-mono px-4 py-3 rounded-lg bg-card/40 border border-border/40 backdrop-blur-md cursor-default shadow-sm"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.5 }}
                whileHover={{
                  scale: 1.02,
                  borderColor: "hsl(var(--primary) / 0.3)",
                  boxShadow: "0 4px 20px hsl(var(--primary) / 0.05)"
                }}
              >
                <span className="text-[#89DDFF]">&lt;</span>
                <span className="text-[#FFCB6B]">App </span>
                <span className="text-[#F07178]">stack</span>
                <span className="text-[#89DDFF]">=</span>
                <span className="text-[#C3E88D]">"MERN Stack, DSA, Cloud"</span>
                <span className="text-[#89DDFF]"> /&gt;</span>
              </motion.p>

              {/* CTAs with magnetic effect - aligned */}
              <motion.div
                className="flex flex-wrap gap-4 mb-8 justify-center lg:justify-start items-center"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.6 }}
              >
                <MagneticElement strength={0.4}>
                  <motion.a
                    href="#projects"
                    className="btn-primary inline-flex items-center justify-center gap-2 relative overflow-hidden group h-12 px-6"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span className="relative z-10">View My Work</span>
                    <motion.span
                      className="absolute inset-0 bg-white/20"
                      initial={{ x: "-100%" }}
                      whileHover={{ x: "100%" }}
                      transition={{ duration: 0.5 }}
                    />
                  </motion.a>
                </MagneticElement>
                <MagneticElement strength={0.4}>
                  <motion.a
                    href="#contact"
                    className="h-12 px-6 rounded-full border border-border/60 font-semibold hover:border-primary hover:text-primary transition-all duration-300 backdrop-blur-sm inline-flex items-center justify-center bg-card/25"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Get In Touch
                  </motion.a>
                </MagneticElement>
              </motion.div>

              {/* Social Links with magnetic effect */}
              <motion.div
                className="flex items-center gap-6 justify-center lg:justify-start flex-wrap"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
              >
                {[
                  { icon: Github, url: "https://github.com/adityakumarsingh2" },
                  { icon: Linkedin, url: "https://linkedin.com/in/adityakumarsingh2" },
                  { icon: Mail, url: "mailto:adityakumarsingh599@gmail.com" }
                ].map((social, i) => (
                  <MagneticElement key={i} strength={0.3}>
                    <motion.a
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 rounded-full border border-border/60 hover:border-primary text-muted-foreground hover:text-primary flex items-center justify-center transition-all duration-300 bg-card/20 shadow-sm hover:shadow-md"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.8 + i * 0.1 }}
                    >
                      <social.icon className="w-5 h-5" />
                    </motion.a>
                  </MagneticElement>
                ))}
                <span className="hidden sm:block h-px w-16 bg-gradient-to-r from-border/50 to-primary/30" />
                <motion.span
                  className="font-mono text-xs text-muted-foreground px-3 py-1.5 rounded-full bg-card/40 border border-border/40 shadow-sm"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.1 }}
                >
                  B.Tech CSE @ LPU
                </motion.span>
              </motion.div>
            </div>

            {/* Right side - Premium IDE card console */}
            <motion.div
              className="flex justify-center lg:justify-center order-1 lg:order-2"
              initial={{ opacity: 0, scale: 0.8, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.8, type: "spring", stiffness: 100 }}
            >
              <div className="relative" style={{ perspective: "1000px" }}>
                {/* Subtle back-glow */}
                <div className="absolute -inset-6 bg-gradient-to-br from-orange-500/10 via-rose-500/5 to-transparent blur-2xl rounded-3xl" />

                <div className="relative w-80 h-[500px] md:w-[360px] md:h-[520px] lg:w-[380px] lg:h-[540px] rounded-2xl bg-[#0B0D13]/95 border border-white/10 backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden z-10 hover:border-white/20 hover:shadow-[0_20px_50px_rgba(0,0,0,0.6)] transition-all duration-500">
                  {/* macOS style Window Header */}
                  <div className="bg-[#121520]/90 px-4 py-3.5 border-b border-white/5 flex items-center justify-between font-mono text-[11px] select-none">
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#FF5F56]" />
                        <span className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E]" />
                        <span className="w-2.5 h-2.5 rounded-full bg-[#27C93F]" />
                      </div>
                      <span className="ml-2 font-mono text-zinc-400">
                        {activeTab === "profile" ? "AdityaProfile.tsx" : "AdityaAssistant.sh"}
                      </span>
                    </div>
                    <span className="text-[9px] text-zinc-500 font-semibold bg-white/5 px-2 py-0.5 rounded border border-white/5">
                      UTF-8
                    </span>
                  </div>

                  {/* Window Tabs Switcher */}
                  <div className="flex gap-2 p-2 bg-[#121520]/40 border-b border-white/5 font-mono text-xs z-10">
                    <button
                      onClick={() => setActiveTab("profile")}
                      className={`flex-1 py-2 text-center rounded-lg font-bold transition-all duration-300 cursor-pointer ${
                        activeTab === "profile" 
                          ? "bg-white/10 text-white shadow-[0_2px_8px_rgba(0,0,0,0.3)] border border-white/10" 
                          : "text-zinc-500 hover:text-zinc-300 hover:bg-white/5"
                      }`}
                    >
                      👤 Profile
                    </button>
                    <button
                      onClick={() => setActiveTab("chat")}
                      className={`flex-1 py-2 text-center rounded-lg font-bold transition-all duration-300 cursor-pointer ${
                        activeTab === "chat" 
                          ? "bg-white/10 text-white shadow-[0_2px_8px_rgba(0,0,0,0.3)] border border-white/10" 
                          : "text-zinc-500 hover:text-zinc-300 hover:bg-white/5"
                      }`}
                    >
                      💬 Aditya's Assistant
                    </button>
                  </div>

                  <div className="flex-1 relative overflow-hidden flex flex-col bg-[#0B0D13]">
                    {activeTab === "profile" ? (
                      /* Profile image container */
                      <div className="w-full h-full p-4 flex flex-col justify-between bg-card">
                        <div className="w-full h-[85%] rounded-xl overflow-hidden relative border border-border/40">
                          <img
                            src={profilePhoto}
                            alt="Aditya Kumar Singh"
                            className="w-full h-full object-cover object-top transition-transform duration-500 ease-out hover:scale-[1.02]"
                          />

                          {/* Corner decorations */}
                          <div className="absolute top-3 left-3 w-5 h-5 border-l border-t border-orange-500/40" />
                          <div className="absolute top-3 right-3 w-5 h-5 border-r border-t border-orange-500/40" />
                          <div className="absolute bottom-3 left-3 w-5 h-5 border-l border-b border-orange-500/40" />
                          <div className="absolute bottom-3 right-3 w-5 h-5 border-r border-b border-orange-500/40" />

                          <div className="absolute inset-0 bg-gradient-to-t from-[#0B0D13] via-transparent to-transparent opacity-90" />
                        </div>

                        {/* Custom overlay with status */}
                        <div className="font-mono text-xs flex justify-between items-center text-foreground mt-2 px-1">
                          <span>adityasingh.exe</span>
                          <span className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            active_now
                          </span>
                        </div>
                      </div>
                    ) : (
                      /* Chat Content inline */
                      <div className="w-full h-full flex flex-col overflow-hidden">
                        {!hasBooted ? (
                          /* Boot Animation */
                          <div className="w-full h-full bg-[#0B0D13] text-emerald-400 font-mono p-5 text-xs flex flex-col justify-start gap-2 select-none items-start">
                            <div className="flex gap-1.5 mb-2">
                              <span className="w-2.5 h-2.5 rounded-full bg-red-500 border border-black/20" />
                              <span className="w-2.5 h-2.5 rounded-full bg-yellow-500 border border-black/20" />
                              <span className="w-2.5 h-2.5 rounded-full bg-green-500 border border-black/20" />
                              <span className="text-[9px] text-zinc-500 ml-1">system_boot.sh</span>
                            </div>
                            <div className="mt-2 space-y-2 flex-1 w-full text-left">
                              {bootStage >= 0 && (
                                <div className="flex items-center gap-1.5 text-zinc-300">
                                  <span className="text-zinc-500">{"$"}</span>
                                  <span>Booting AI Assistant...</span>
                                </div>
                              )}
                              {bootStage >= 1 && (
                                <div className="flex items-center gap-1.5 text-zinc-300">
                                  <span className="text-zinc-500">{"$"}</span>
                                  <span>Initializing portfolio knowledge...</span>
                                </div>
                              )}
                              {bootStage >= 2 && (
                                <div className="flex items-center gap-1.5 text-zinc-300">
                                  <span className="text-zinc-500">{"$"}</span>
                                  <span>Loading projects...</span>
                                </div>
                              )}
                              {bootStage >= 3 && (
                                <div className="flex items-center gap-1 text-emerald-400 font-bold">
                                  <span>Ready ✓</span>
                                  <motion.span
                                    className="inline-block w-1.5 h-3.5 bg-emerald-400 ml-0.5"
                                    animate={{ opacity: [1, 0] }}
                                    transition={{ duration: 0.4, repeat: Infinity }}
                                  />
                                </div>
                              )}
                            </div>
                          </div>
                        ) : (
                          <Chatbot
                            isInline={true}
                            messages={messages}
                            setMessages={setMessages}
                            input={input}
                            setInput={setInput}
                          />
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Enhanced scroll indicator with magnetic effect */}
      <MagneticElement className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10" strength={0.3}>
        <motion.a
          href="#about"
          className="flex flex-col items-center gap-2 text-muted-foreground hover:text-primary transition-colors group"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
        >
          <span className="font-mono text-xs tracking-wider uppercase group-hover:text-primary transition-colors">Scroll</span>
          <motion.div
            className="p-2 rounded-full border border-border/60 group-hover:border-primary transition-colors"
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <ArrowDown className="w-4 h-4" />
          </motion.div>
        </motion.a>
      </MagneticElement>
    </section>
  );
};

export default Hero;
