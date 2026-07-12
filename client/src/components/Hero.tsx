import { motion, useMotionValue, useSpring } from "framer-motion";
import { ArrowDown, Github, Linkedin, Mail, MapPin, Sparkles } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import profilePhoto from "@/assets/profile-photo.png";
import Chatbot, { Message } from "./Chatbot";

// ── Typing effect hook ─────────────────────────────────────────────────────
const useTypingEffect = (texts: string[], typingSpeed = 90, deletingSpeed = 45, pauseDuration = 2200) => {
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

// ── Magnetic wrapper — only use on non-absolutely-positioned elements ──────
const MagneticElement = ({
  children,
  className = "",
  strength = 0.3,
}: {
  children: React.ReactNode;
  className?: string;
  strength?: number;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springConfig = { stiffness: 150, damping: 15 };
  const xSpring = useSpring(x, springConfig);
  const ySpring = useSpring(y, springConfig);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    x.set((e.clientX - (rect.left + rect.width / 2)) * strength);
    y.set((e.clientY - (rect.top + rect.height / 2)) * strength);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => { x.set(0); y.set(0); }}
      style={{ x: xSpring, y: ySpring }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// ── Types ─────────────────────────────────────────────────────────────────
interface HeroProps {
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  input: string;
  setInput: (val: string) => void;
}

// ── Component ─────────────────────────────────────────────────────────────
const Hero = ({ messages, setMessages, input, setInput }: HeroProps) => {
  const taglines = ["Full Stack Developer", "Cloud Enthusiast", "DSA Enthusiast", "Problem Solver"];
  const typedText = useTypingEffect(taglines);

  const techPool = ["C++", "Java", "React", "Node.js", "TypeScript", "AWS", "MongoDB", "Python"];
  const [randomSymbols, setRandomSymbols] = useState<string[]>([]);
  useEffect(() => {
    setRandomSymbols([...techPool].sort(() => Math.random() - 0.5).slice(0, 5));
  }, []);

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
      return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
    }
  }, [activeTab, hasBooted]);

  return (
    <section id="home" className="min-h-screen flex items-center justify-center relative overflow-hidden bg-background">

      {/* ── Backgrounds ─────────────────────────────────────────────────── */}

      {/* Dot grid — masked to a soft ellipse so edges stay clean */}
      <div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(hsl(var(--primary) / 0.13) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
          maskImage: "radial-gradient(ellipse 75% 75% at 50% 50%, black 30%, transparent 100%)",
          WebkitMaskImage: "radial-gradient(ellipse 75% 75% at 50% 50%, black 30%, transparent 100%)",
        }}
      />

      {/* Warm blob — top-left */}
      <div className="absolute top-[8%] left-[3%] w-[360px] h-[360px] md:w-[560px] md:h-[560px] rounded-full bg-gradient-to-br from-orange-500/[0.13] via-rose-500/[0.06] to-transparent blur-[110px] md:blur-[140px] pointer-events-none z-0 animate-blob-slow" />
      {/* Cool blob — bottom-right */}
      <div
        className="absolute bottom-[8%] right-[3%] w-[260px] h-[260px] md:w-[460px] md:h-[460px] rounded-full bg-gradient-to-br from-blue-500/[0.09] via-indigo-500/[0.04] to-transparent blur-[90px] md:blur-[120px] pointer-events-none z-0 animate-blob-slow"
        style={{ animationDelay: "3s", animationDirection: "reverse" }}
      />

      {/* Vignette — top + bottom fades into background */}
      <div className="absolute inset-0 z-[1] pointer-events-none bg-gradient-to-b from-background/70 via-transparent to-background/90" />

      {/* Floating tech labels — xl screens only */}
      {randomSymbols.map((symbol, i) => (
        <motion.span
          key={symbol + i}
          className="absolute font-mono text-primary/[0.07] text-sm select-none z-[2] hidden xl:block pointer-events-none"
          style={{ left: `${5 + i * 17}%`, top: `${16 + (i % 3) * 25}%` }}
          animate={{ y: [0, -7, 0], opacity: [0.05, 0.11, 0.05] }}
          transition={{ duration: 13 + i * 2.5, repeat: Infinity, delay: i * 1.8, ease: "easeInOut" }}
        >
          {symbol}
        </motion.span>
      ))}

      {/* ── Main layout ─────────────────────────────────────────────────── */}
      <div className="container mx-auto px-6 relative z-10 pt-24 pb-20">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">

            {/* ════════════════ LEFT — Text content ════════════════════ */}
            <div className="text-center lg:text-left order-2 lg:order-1 flex flex-col">

              {/* Availability pill */}
              <motion.div
                className="mb-6"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45 }}
              >
                <span className="inline-flex items-center gap-2 text-xs font-mono px-3.5 py-1.5 rounded-full bg-card/60 border border-border/40 text-muted-foreground backdrop-blur-sm shadow-sm">
                  <span className="relative flex h-2 w-2 flex-shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                  </span>
                  <span className="text-emerald-500 font-semibold">Open to opportunities</span>
                  <span className="text-border/60">·</span>
                  <MapPin className="w-3 h-3 flex-shrink-0" />
                  <span>India</span>
                </span>
              </motion.div>

              {/* Name */}
              <motion.h1
                className="font-display font-bold tracking-tight mb-5 leading-[1.06]"
                initial={{ opacity: 0, y: 26 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.65, delay: 0.15 }}
              >
                <span className="block text-[2.75rem] md:text-[3.5rem] lg:text-[3.9rem] text-foreground">
                  Aditya Kumar
                </span>
                <span className="relative inline-block text-gradient-warm text-[2.75rem] md:text-[3.5rem] lg:text-[3.9rem] mt-1">
                  Singh
                  <motion.span
                    className="absolute -bottom-1 left-0 h-[3px] rounded-full"
                    style={{ background: "var(--gradient-warm)" }}
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ delay: 0.72, duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
                  />
                </span>
              </motion.h1>

              {/* Typing tagline */}
              <motion.div
                className="flex items-center gap-2.5 mb-6 justify-center lg:justify-start"
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.28 }}
              >
                <span className="font-mono text-primary/50 text-xl select-none leading-none">_</span>
                <span className="text-lg md:text-xl font-semibold text-muted-foreground" style={{ minWidth: "210px" }}>
                  {typedText}
                </span>
                <motion.span
                  className="inline-block w-[2px] h-[22px] bg-primary/80 rounded-full flex-shrink-0"
                  animate={{ opacity: [1, 0] }}
                  transition={{ duration: 0.55, repeat: Infinity, repeatType: "reverse" }}
                />
              </motion.div>

              {/* Short bio */}
              <motion.p
                className="text-sm md:text-[0.9375rem] text-muted-foreground leading-relaxed mb-8 max-w-[420px] mx-auto lg:mx-0"
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.4 }}
              >
                B.Tech CSE at{" "}
                <span className="text-foreground font-medium">LPU</span>, building full-stack products with the{" "}
                <span className="text-foreground font-medium">MERN stack</span> and shipping to{" "}
                <span className="text-foreground font-medium">AWS & Oracle Cloud</span>.
                Competitive programmer —{" "}
                <span className="text-orange-400 font-semibold font-mono">Rank 1543</span>{" "}
                in LeetCode Weekly Contest 470.
              </motion.p>

              {/* CTAs */}
              <motion.div
                className="flex flex-wrap gap-3 mb-8 justify-center lg:justify-start items-center"
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.5 }}
              >
                <MagneticElement strength={0.3}>
                  <motion.a
                    href="#projects"
                    onClick={(e) => { e.preventDefault(); document.getElementById("projects")?.scrollIntoView({ behavior: "smooth" }); }}
                    className="btn-primary inline-flex items-center justify-center gap-2 relative overflow-hidden group h-11 px-6 text-sm"
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Sparkles className="w-3.5 h-3.5 relative z-10" />
                    <span className="relative z-10">View My Work</span>
                    <motion.span
                      className="absolute inset-0 bg-white/15"
                      initial={{ x: "-110%" }}
                      whileHover={{ x: "110%" }}
                      transition={{ duration: 0.42 }}
                    />
                  </motion.a>
                </MagneticElement>

                <MagneticElement strength={0.3}>
                  <motion.a
                    href="#contact"
                    onClick={(e) => { e.preventDefault(); document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" }); }}
                    className="h-11 px-6 text-sm rounded-full border border-border/60 font-semibold hover:border-primary/60 hover:text-primary transition-all duration-300 backdrop-blur-sm inline-flex items-center justify-center bg-card/30"
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Get In Touch
                  </motion.a>
                </MagneticElement>
              </motion.div>

              {/* Social links + resume */}
              <motion.div
                className="flex items-center gap-3 justify-center lg:justify-start flex-wrap"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.65 }}
              >
                {[
                  { icon: Github,   url: "https://github.com/adityakumarsingh2",          label: "GitHub" },
                  { icon: Linkedin, url: "https://linkedin.com/in/adityakumarsingh2",     label: "LinkedIn" },
                  { icon: Mail,     url: "mailto:adityakumarsingh599@gmail.com",           label: "Email" },
                ].map((social, i) => (
                  <MagneticElement key={i} strength={0.22}>
                    <motion.a
                      href={social.url}
                      target={social.icon !== Mail ? "_blank" : undefined}
                      rel="noopener noreferrer"
                      aria-label={social.label}
                      className="w-9 h-9 rounded-full border border-border/50 hover:border-primary/60 text-muted-foreground hover:text-primary flex items-center justify-center transition-all duration-300 bg-card/30 hover:bg-card/60"
                      whileHover={{ scale: 1.12 }}
                      whileTap={{ scale: 0.92 }}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.7 + i * 0.07 }}
                    >
                      <social.icon className="w-4 h-4" />
                    </motion.a>
                  </MagneticElement>
                ))}

                <span className="h-4 w-px bg-border/40 mx-0.5" />

                <motion.a
                  href="/AdityaResume.pdf"
                  download="Aditya_Kumar_Singh_Resume.pdf"
                  className="text-xs font-mono text-muted-foreground hover:text-primary transition-colors border-b border-dashed border-border/40 hover:border-primary/50 pb-px leading-none"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.95 }}
                >
                  resume.pdf ↓
                </motion.a>
              </motion.div>
            </div>
            {/* ═════════════ END LEFT ═════════════════════════════════ */}

            {/* ════════════════ RIGHT — IDE card ══════════════════════ */}
            <motion.div
              className="flex justify-center order-1 lg:order-2"
              initial={{ opacity: 0, scale: 0.9, y: 22 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.7, type: "spring", stiffness: 90, damping: 18 }}
            >
              <div className="relative">
                {/* Ambient glow behind card */}
                <div className="absolute -inset-8 bg-gradient-to-br from-orange-500/[0.1] via-rose-500/[0.05] to-blue-500/[0.05] blur-3xl rounded-3xl pointer-events-none" />

                {/* IDE window shell */}
                <div className="relative w-[315px] h-[485px] md:w-[350px] md:h-[508px] lg:w-[370px] lg:h-[526px] rounded-2xl bg-[#0C0E15] border border-white/[0.08] shadow-[0_24px_64px_rgba(0,0,0,0.55)] flex flex-col overflow-hidden z-10 transition-all duration-500 hover:border-white/[0.14] hover:shadow-[0_28px_72px_rgba(0,0,0,0.65)]">

                  {/* Title bar */}
                  <div className="flex-shrink-0 bg-[#13161F] px-4 py-3 border-b border-white/[0.06] flex items-center justify-between select-none">
                    <div className="flex items-center gap-3">
                      <div className="flex gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#FF5F57]" />
                        <span className="w-2.5 h-2.5 rounded-full bg-[#FEBC2E]" />
                        <span className="w-2.5 h-2.5 rounded-full bg-[#28C840]" />
                      </div>
                      <span className="font-mono text-[11px] text-zinc-500">
                        {activeTab === "profile" ? "AdityaProfile.tsx" : "assistant.sh"}
                      </span>
                    </div>
                    <span className="font-mono text-[9px] text-zinc-600 bg-white/[0.04] px-2 py-0.5 rounded border border-white/[0.05]">UTF-8</span>
                  </div>

                  {/* Tab bar */}
                  <div className="flex-shrink-0 flex gap-1.5 px-2 py-1.5 bg-[#0F1118] border-b border-white/[0.05]">
                    {(["profile", "chat"] as const).map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`flex-1 py-1.5 text-center rounded-md font-mono text-[11px] font-semibold transition-all duration-200 ${
                          activeTab === tab
                            ? "bg-white/[0.09] text-white border border-white/[0.1] shadow-sm"
                            : "text-zinc-600 hover:text-zinc-400 hover:bg-white/[0.04]"
                        }`}
                      >
                        {tab === "profile" ? "👤 Profile" : "💬 Assistant"}
                      </button>
                    ))}
                  </div>

                  {/* Content */}
                  <div className="flex-1 relative overflow-hidden flex flex-col min-h-0">
                    {activeTab === "profile" ? (
                      <div className="w-full h-full p-3.5 flex flex-col gap-3 bg-[#0C0E15]">
                        <div className="flex-1 rounded-xl overflow-hidden relative border border-white/[0.07] min-h-0">
                          <img
                            src={profilePhoto}
                            alt="Aditya Kumar Singh"
                            className="w-full h-full object-cover object-top transition-transform duration-500 hover:scale-[1.03]"
                          />
                          {/* Corner brackets */}
                          <div className="absolute top-2.5 left-2.5 w-[18px] h-[18px] border-l-2 border-t-2 border-orange-400/50 rounded-tl" />
                          <div className="absolute top-2.5 right-2.5 w-[18px] h-[18px] border-r-2 border-t-2 border-orange-400/50 rounded-tr" />
                          <div className="absolute bottom-2.5 left-2.5 w-[18px] h-[18px] border-l-2 border-b-2 border-orange-400/50 rounded-bl" />
                          <div className="absolute bottom-2.5 right-2.5 w-[18px] h-[18px] border-r-2 border-b-2 border-orange-400/50 rounded-br" />
                          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#0C0E15] via-[#0C0E15]/30 to-transparent" />
                        </div>
                        <div className="flex-shrink-0 flex items-center justify-between font-mono text-[11px] px-0.5">
                          <span className="text-zinc-500">adityasingh.exe</span>
                          <span className="flex items-center gap-1.5 text-zinc-400">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            active_now
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="w-full h-full flex flex-col overflow-hidden min-h-0">
                        {!hasBooted ? (
                          <div className="w-full h-full bg-[#0C0E15] text-emerald-400 font-mono p-5 text-xs flex flex-col gap-2.5 select-none">
                            <div className="flex gap-1.5 items-center mb-1">
                              <span className="w-2 h-2 rounded-full bg-[#FF5F57]" />
                              <span className="w-2 h-2 rounded-full bg-[#FEBC2E]" />
                              <span className="w-2 h-2 rounded-full bg-[#28C840]" />
                              <span className="text-[9px] text-zinc-600 ml-2">system_boot.sh</span>
                            </div>
                            {bootStage >= 0 && <div className="flex gap-2 text-zinc-400"><span className="text-zinc-600">$</span><span>Booting AI Assistant...</span></div>}
                            {bootStage >= 1 && <div className="flex gap-2 text-zinc-400"><span className="text-zinc-600">$</span><span>Loading portfolio data...</span></div>}
                            {bootStage >= 2 && <div className="flex gap-2 text-zinc-400"><span className="text-zinc-600">$</span><span>Indexing projects...</span></div>}
                            {bootStage >= 3 && (
                              <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                                <span>Ready ✓</span>
                                <motion.span
                                  className="inline-block w-[7px] h-[14px] bg-emerald-400 rounded-sm"
                                  animate={{ opacity: [1, 0] }}
                                  transition={{ duration: 0.4, repeat: Infinity }}
                                />
                              </div>
                            )}
                          </div>
                        ) : (
                          <Chatbot isInline messages={messages} setMessages={setMessages} input={input} setInput={setInput} />
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
            {/* ═══════════════ END RIGHT ═══════════════════════════════ */}

          </div>
        </div>
      </div>

      {/* ── Scroll indicator ──────────────────────────────────────────────── */}
      <motion.a
        href="#about"
        onClick={(e) => { e.preventDefault(); document.getElementById("about")?.scrollIntoView({ behavior: "smooth" }); }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors group"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.25 }}
        aria-label="Scroll to About"
      >
        <span className="font-mono text-[10px] tracking-widest uppercase opacity-50 group-hover:opacity-100 transition-opacity">scroll</span>
        <motion.div
          className="p-1.5 rounded-full border border-border/40 group-hover:border-primary/50 transition-colors"
          animate={{ y: [0, 5, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        >
          <ArrowDown className="w-3.5 h-3.5" />
        </motion.div>
      </motion.a>

    </section>
  );
};

export default Hero;
