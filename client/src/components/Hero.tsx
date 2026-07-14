import { motion, useMotionValue, useSpring } from "framer-motion";
import { Github, Linkedin, Mail, MapPin, ArrowUpRight, Code2, Trophy, Zap } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import profilePhoto from "@/assets/profile-photo.png";
import Chatbot, { Message } from "./Chatbot";

// ─── Typing effect ────────────────────────────────────────────────────────────
const useTypingEffect = (texts: string[], speed = 80, del = 38, pause = 2400) => {
  const [text, setText] = useState("");
  const [idx, setIdx] = useState(0);
  const [deleting, setDeleting] = useState(false);
  useEffect(() => {
    const cur = texts[idx];
    const t = setTimeout(() => {
      if (!deleting) {
        if (text.length < cur.length) setText(cur.slice(0, text.length + 1));
        else setTimeout(() => setDeleting(true), pause);
      } else {
        if (text.length > 0) setText(text.slice(0, -1));
        else { setDeleting(false); setIdx(p => (p + 1) % texts.length); }
      }
    }, deleting ? del : speed);
    return () => clearTimeout(t);
  }, [text, deleting, idx, texts, speed, del, pause]);
  return text;
};

// ─── Magnetic wrapper ─────────────────────────────────────────────────────────
const Mag = ({ children, s = 0.25, className = "" }: {
  children: React.ReactNode; s?: number; className?: string;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0); const y = useMotionValue(0);
  const xs = useSpring(x, { stiffness: 160, damping: 18 });
  const ys = useSpring(y, { stiffness: 160, damping: 18 });
  return (
    <motion.div ref={ref} style={{ x: xs, y: ys }} className={className}
      onMouseMove={e => {
        const r = ref.current!.getBoundingClientRect();
        x.set((e.clientX - r.left - r.width / 2) * s);
        y.set((e.clientY - r.top - r.height / 2) * s);
      }}
      onMouseLeave={() => { x.set(0); y.set(0); }}
    >{children}</motion.div>
  );
};

// ─── Props ────────────────────────────────────────────────────────────────────
interface HeroProps {
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  input: string;
  setInput: (v: string) => void;
}

// Scrolling ticker tags
const TICKER_TAGS = [
  "React", "Node.js", "TypeScript", "MongoDB", "AWS", "Oracle Cloud",
  "Express.js", "Tailwind CSS", "C++", "DSA", "REST APIs", "Git",
  "Supabase", "Vercel", "Linux", "Python", "Java", "PostgreSQL",
];

// ─── Component ───────────────────────────────────────────────────────────────
const Hero = ({ messages, setMessages, input, setInput }: HeroProps) => {
  const taglines = ["Full Stack Developer", "Cloud Enthusiast", "DSA Enthusiast", "Problem Solver"];
  const typed = useTypingEffect(taglines);

  const [activeTab, setActiveTab] = useState<"profile" | "chat">("profile");
  const [bootStage, setBootStage] = useState(0);
  const [hasBooted, setHasBooted] = useState(false);
  useEffect(() => {
    if (activeTab === "chat" && !hasBooted) {
      setBootStage(0);
      const t1 = setTimeout(() => setBootStage(1), 220);
      const t2 = setTimeout(() => setBootStage(2), 440);
      const t3 = setTimeout(() => setBootStage(3), 660);
      const t4 = setTimeout(() => setHasBooted(true), 900);
      return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
    }
  }, [activeTab, hasBooted]);

  return (
    <section id="home" className="relative h-screen min-h-[680px] max-h-[1080px] flex flex-col overflow-hidden bg-background pt-[68px] lg:pt-[72px]">

      {/* ═══════════════════ BACKGROUND ═══════════════════════════════ */}

      {/* Fine grid — stronger, more visible */}
      <div className="absolute inset-0 z-0 pointer-events-none" style={{
        backgroundImage: `
          linear-gradient(hsl(var(--foreground)/0.04) 1px, transparent 1px),
          linear-gradient(90deg, hsl(var(--foreground)/0.04) 1px, transparent 1px)
        `,
        backgroundSize: "80px 80px",
      }} />

      {/* Noise texture overlay — adds depth/grain */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.025]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        backgroundSize: "256px 256px",
      }} />

      {/* Two large radial spotlights — visible but tasteful */}
      <div className="absolute top-[-20%] left-[-10%] w-[70vw] h-[70vw] max-w-[900px] max-h-[900px] rounded-full pointer-events-none z-0"
        style={{ background: "radial-gradient(circle, hsl(var(--foreground)/0.055) 0%, transparent 65%)" }} />
      <div className="absolute bottom-[-20%] right-[-10%] w-[55vw] h-[55vw] max-w-[700px] max-h-[700px] rounded-full pointer-events-none z-0"
        style={{ background: "radial-gradient(circle, hsl(var(--foreground)/0.04) 0%, transparent 65%)" }} />

      {/* Thin accent lines — architectural */}
      <div className="absolute left-0 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-foreground/[0.08] to-transparent z-[1] pointer-events-none hidden lg:block" style={{ left: "8%" }} />
      <div className="absolute left-0 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-foreground/[0.05] to-transparent z-[1] pointer-events-none hidden xl:block" style={{ left: "92%" }} />
      <div className="absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-foreground/[0.07] to-transparent z-[1] pointer-events-none" style={{ top: "50%" }} />

      {/* Top/bottom vignette */}
      <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-background to-transparent z-[2] pointer-events-none" />
      {/* Bottom vignette stops before the ticker bar (40px) so it doesn't cover it */}
      <div className="absolute inset-x-0 bottom-10 h-24 bg-gradient-to-t from-background to-transparent z-[2] pointer-events-none" />

      {/* ═══════════════════ MAIN CONTENT ══════════════════════════════ */}
      <div className="relative z-10 flex-1 flex flex-col">

        {/* Main grid — takes up the central viewport */}
        <div className="flex-1 flex items-center">
          <div className="container mx-auto px-6 xl:px-12 w-full">
            <div className="max-w-[1400px] mx-auto w-full grid lg:grid-cols-[1fr_minmax(0,45%)] gap-8 xl:gap-16 items-center">

              {/* ══════════ LEFT COLUMN ══════════════════════════════ */}
              <div className="flex flex-col items-center lg:items-start text-center lg:text-left">

                {/* Index tag + availability */}
                <motion.div className="flex items-center gap-4 mb-5 lg:mb-7"
                  initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <span className="font-mono text-[10px] text-foreground/25 tracking-[0.25em] uppercase hidden lg:block">
                    01 / Portfolio
                  </span>
                  <div className="hidden lg:block h-px w-8 bg-foreground/15" />
                  <span className="inline-flex items-center gap-2 text-[11px] font-mono px-3.5 py-1.5 rounded-full border border-foreground/[0.12] bg-foreground/[0.04] text-muted-foreground">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
                    </span>
                    <span className="text-emerald-400 font-medium">Open to work</span>
                    <span className="text-foreground/25">·</span>
                    <MapPin className="w-3 h-3 text-foreground/30" />
                    <span className="text-foreground/40">India</span>
                  </span>
                </motion.div>

                {/* ── HERO NAME — editorial contrast ── */}
                <div className="mb-4 lg:mb-5 overflow-hidden">
                  {/* "Aditya Kumar" — medium weight, spacious tracking */}
                  <motion.div
                    initial={{ opacity: 0, y: 60 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <span className="block font-display font-medium text-[2rem] sm:text-[2.6rem] lg:text-[2.7rem] xl:text-[3.2rem] text-foreground/55 tracking-[0.02em] leading-none">
                      Aditya Kumar
                    </span>
                  </motion.div>

                  {/* "SINGH" — massive, bold, full contrast */}
                  <motion.div className="relative"
                    initial={{ opacity: 0, y: 80 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.75, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <span className="block font-display font-black text-[4.5rem] sm:text-[6rem] md:text-[7rem] lg:text-[6.2rem] xl:text-[7.8rem] text-foreground leading-[0.88] tracking-[-0.02em] uppercase select-none">
                      Singh
                    </span>
                    {/* Animated underline — grows in */}
                    <motion.span
                      className="absolute left-0 bottom-1 h-[3px] bg-foreground/20 rounded-full"
                      initial={{ width: 0 }} animate={{ width: "100%" }}
                      transition={{ delay: 0.75, duration: 1.0, ease: [0.22, 1, 0.36, 1] }}
                    />
                  </motion.div>
                </div>

                {/* Tagline with thin rule — fixed height prevents layout shift */}
                <motion.div
                  className="flex items-center gap-3 mb-4 lg:mb-5 justify-center lg:justify-start w-full h-8"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.38 }}
                >
                  <span className="hidden lg:block h-px w-10 bg-foreground/20 flex-shrink-0" />
                  {/* Reserve height equal to one line of text so surrounding
                      elements never shift when the typed string changes length */}
                  <span
                    className="text-base md:text-lg font-mono text-foreground/50 tracking-wide"
                    style={{ minWidth: "260px", display: "inline-block", lineHeight: "1.75rem" }}
                  >
                    {typed}
                  </span>
                  <motion.span
                    className="inline-block w-[2px] h-5 bg-foreground/50 rounded-sm flex-shrink-0"
                    animate={{ opacity: [1, 0] }}
                    transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
                  />
                </motion.div>

                {/* Bio */}
                <motion.p
                  className="text-sm md:text-[0.9375rem] text-foreground/40 leading-[1.7] mb-4 lg:mb-6 max-w-[460px] mx-auto lg:mx-0"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.48 }}
                >
                  B.Tech CSE at{" "}
                  <span className="text-foreground/70 font-semibold">LPU</span>. Building
                  production-grade full-stack products with the{" "}
                  <span className="text-foreground/70 font-semibold">MERN stack</span>, deployed on{" "}
                  <span className="text-foreground/70 font-semibold">AWS & Oracle Cloud</span>.
                </motion.p>

                {/* ── STAT ROW ── */}
                <motion.div
                  className="grid grid-cols-3 gap-3 mb-4 lg:mb-6 w-full max-w-[460px] mx-auto lg:mx-0"
                  initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.56 }}
                >
                  {[
                    { icon: Trophy, num: "#1543", sub: "LeetCode / 30k+" },
                    { icon: Code2,  num: "MERN",  sub: "Stack + Cloud" },
                    { icon: Zap,    num: "3+",    sub: "Live Projects" },
                  ].map(({ icon: Icon, num, sub }) => (
                    <div key={num}
                      className="flex flex-col gap-1 px-3.5 py-3 rounded-2xl border border-foreground/[0.08] bg-foreground/[0.03] hover:bg-foreground/[0.06] hover:border-foreground/[0.15] transition-all duration-300 cursor-default group"
                    >
                      <Icon className="w-3.5 h-3.5 text-foreground/30 group-hover:text-foreground/50 transition-colors" />
                      <span className="font-display font-black text-lg text-foreground leading-none">{num}</span>
                      <span className="font-mono text-[9px] text-foreground/30 leading-tight uppercase tracking-wider">{sub}</span>
                    </div>
                  ))}
                </motion.div>

                {/* ── CTAs ── */}
                <motion.div
                  className="flex flex-wrap gap-3 mb-4 lg:mb-6 justify-center lg:justify-start items-center"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.64 }}
                >
                  <Mag s={0.28}>
                    <motion.a
                      href="#projects"
                      onClick={e => { e.preventDefault(); document.getElementById("projects")?.scrollIntoView({ behavior: "smooth" }); }}
                      className="group inline-flex items-center gap-2.5 h-12 pl-6 pr-5 rounded-full bg-foreground text-background text-sm font-semibold relative overflow-hidden transition-all duration-300 hover:gap-3.5"
                      whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                    >
                      <span>View My Work</span>
                      <span className="w-6 h-6 rounded-full bg-background/15 flex items-center justify-center flex-shrink-0 transition-transform duration-200 group-hover:translate-x-0.5">
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </span>
                    </motion.a>
                  </Mag>

                  <Mag s={0.28}>
                    <motion.a
                      href="#contact"
                      onClick={e => { e.preventDefault(); document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" }); }}
                      className="h-12 px-6 text-sm rounded-full border border-foreground/20 font-medium text-foreground/60 hover:border-foreground/50 hover:text-foreground/90 transition-all duration-300 inline-flex items-center justify-center"
                      whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                    >
                      Get In Touch
                    </motion.a>
                  </Mag>
                </motion.div>

                {/* Socials */}
                <motion.div
                  className="flex items-center gap-3 justify-center lg:justify-start"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  transition={{ delay: 0.76 }}
                >
                  {([
                    { icon: Github,   url: "https://github.com/adityakumarsingh2",       label: "GitHub" },
                    { icon: Linkedin, url: "https://linkedin.com/in/adityakumarsingh2",  label: "LinkedIn" },
                    { icon: Mail,     url: "mailto:adityakumarsingh599@gmail.com",        label: "Email" },
                  ] as const).map(({ icon: Icon, url, label }, i) => (
                    <Mag key={label} s={0.18}>
                      <motion.a href={url}
                        target={label !== "Email" ? "_blank" : undefined}
                        rel="noopener noreferrer" aria-label={label}
                        className="w-9 h-9 rounded-xl border border-foreground/10 hover:border-foreground/40 text-foreground/35 hover:text-foreground/80 flex items-center justify-center transition-all duration-300 hover:bg-foreground/[0.05]"
                        whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.92 }}
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        transition={{ delay: 0.78 + i * 0.06 }}
                      >
                        <Icon className="w-4 h-4" />
                      </motion.a>
                    </Mag>
                  ))}
                  <span className="h-4 w-px bg-foreground/10 mx-0.5" />
                  <motion.a
                    href="/AdityaResume.pdf" download="Aditya_Kumar_Singh_Resume.pdf"
                    className="text-[11px] font-mono text-foreground/30 hover:text-foreground/60 transition-colors underline underline-offset-4 decoration-foreground/15 hover:decoration-foreground/40"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.96 }}
                  >
                    résumé ↓
                  </motion.a>
                </motion.div>

              </div>
              {/* ══════════ END LEFT ════════════════════════════════ */}

              {/* ══════════ RIGHT — IDE CARD ═════════════════════════ */}
              <motion.div
                className="hidden lg:flex justify-center flex-shrink-0 w-full"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="relative w-full">
                  {/* Static border glow — no spinning */}
                  <div className="absolute -inset-px rounded-[20px] pointer-events-none z-0"
                    style={{ background: "linear-gradient(135deg, hsl(var(--foreground)/0.18), hsl(var(--foreground)/0.04) 50%, hsl(var(--foreground)/0.12))" }}
                  />
                  {/* Soft outer glow */}
                  <div className="absolute -inset-8 rounded-3xl pointer-events-none z-0"
                    style={{ background: "radial-gradient(circle at 50% 50%, hsl(var(--foreground)/0.06) 0%, transparent 70%)" }}
                  />

                  {/* IDE shell */}
                  <div
                    className="relative z-10 w-full rounded-[19px] bg-[#0A0C12] border border-white/[0.08] shadow-[0_40px_100px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.06)] flex flex-col overflow-hidden"
                    style={{ height: "min(calc(100vh - 200px), 560px)" }}
                  >
                    {/* Title bar */}
                    <div className="flex-shrink-0 bg-[#0E1018] px-4 py-3 border-b border-white/[0.05] flex items-center justify-between select-none">
                      <div className="flex items-center gap-3">
                        <div className="flex gap-1.5">
                          <span className="w-3 h-3 rounded-full bg-[#FF5F57]" />
                          <span className="w-3 h-3 rounded-full bg-[#FEBC2E]" />
                          <span className="w-3 h-3 rounded-full bg-[#28C840]" />
                        </div>
                        <span className="font-mono text-[11px] text-zinc-600">
                          {activeTab === "profile" ? "portfolio.tsx" : "assistant.sh"}
                        </span>
                      </div>
                      <span className="flex items-center gap-1.5 font-mono text-[9px] text-zinc-600">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        LIVE
                      </span>
                    </div>

                    {/* Tab bar */}
                    <div className="flex-shrink-0 flex px-2 py-1.5 bg-[#0C0E16] border-b border-white/[0.04] gap-1">
                      {(["profile", "chat"] as const).map(tab => (
                        <button key={tab} onClick={() => setActiveTab(tab)}
                          className={`flex-1 py-1.5 rounded-md font-mono text-[11px] font-semibold transition-all duration-200 cursor-pointer ${
                            activeTab === tab
                              ? "bg-white/[0.08] text-white/90 border border-white/[0.1]"
                              : "text-zinc-700 hover:text-zinc-400 hover:bg-white/[0.03]"
                          }`}
                        >
                          {tab === "profile" ? "👤 Profile" : "💬 Assistant"}
                        </button>
                      ))}
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-hidden flex flex-col min-h-0">
                      {activeTab === "profile" ? (
                        <div className="w-full h-full p-3.5 flex flex-col gap-3 bg-[#0A0C12]">

                          {/* Photo */}
                          <div className="flex-1 rounded-xl overflow-hidden relative min-h-0 group/img" style={{ border: "1px solid rgba(255,255,255,0.06)" }}>
                            <img src={profilePhoto} alt="Aditya Kumar Singh"
                              className="w-full h-full object-cover transition-transform duration-700 group-hover/img:scale-[1.04]"
                              style={{ objectPosition: "center 8%" }} />
                            {/* Corner brackets — white */}
                            <div className="absolute top-3 left-3 w-5 h-5 border-l-2 border-t-2 border-white/30" />
                            <div className="absolute top-3 right-3 w-5 h-5 border-r-2 border-t-2 border-white/30" />
                            <div className="absolute bottom-3 left-3 w-5 h-5 border-l-2 border-b-2 border-white/30" />
                            <div className="absolute bottom-3 right-3 w-5 h-5 border-r-2 border-b-2 border-white/30" />
                            {/* Name overlay at bottom */}
                            <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#0A0C12] via-[#0A0C12]/60 to-transparent" />
                            <div className="absolute bottom-0 inset-x-0 px-4 pb-3">
                              <p className="font-display font-bold text-white text-lg leading-tight">Aditya Kumar Singh</p>
                              <p className="font-mono text-zinc-400 text-[10px]">Full Stack Developer</p>
                            </div>
                          </div>

                          {/* Status bar */}
                          <div className="flex-shrink-0 flex items-center justify-between px-1">
                            <span className="font-mono text-[10px] text-zinc-600">adityasingh.exe</span>
                            <div className="flex items-center gap-1.5">
                              {["React", "Node.js", "AWS"].map(t => (
                                <span key={t} className="font-mono text-[9px] text-zinc-700 bg-white/[0.03] px-1.5 py-0.5 rounded border border-white/[0.05]">{t}</span>
                              ))}
                              <span className="flex items-center gap-1 font-mono text-[10px] text-emerald-500">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                active
                              </span>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="w-full h-full flex flex-col overflow-hidden min-h-0">
                          {!hasBooted ? (
                            <div className="w-full h-full bg-[#0A0C12] font-mono p-5 text-xs flex flex-col gap-2.5 select-none">
                              <div className="flex gap-1.5 items-center mb-2">
                                <span className="w-2 h-2 rounded-full bg-[#FF5F57]" />
                                <span className="w-2 h-2 rounded-full bg-[#FEBC2E]" />
                                <span className="w-2 h-2 rounded-full bg-[#28C840]" />
                                <span className="text-[9px] text-zinc-700 ml-2">system_boot.sh</span>
                              </div>
                              {bootStage >= 0 && <div className="flex gap-2 text-zinc-500"><span className="text-zinc-700">$</span><span>Booting AI Assistant...</span></div>}
                              {bootStage >= 1 && <div className="flex gap-2 text-zinc-500"><span className="text-zinc-700">$</span><span>Loading portfolio data...</span></div>}
                              {bootStage >= 2 && <div className="flex gap-2 text-zinc-500"><span className="text-zinc-700">$</span><span>Indexing projects...</span></div>}
                              {bootStage >= 3 && (
                                <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                                  <span>Ready ✓</span>
                                  <motion.span className="inline-block w-[7px] h-[14px] bg-emerald-400 rounded-sm"
                                    animate={{ opacity: [1, 0] }} transition={{ duration: 0.4, repeat: Infinity }} />
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
              {/* ══════════ END RIGHT ═══════════════════════════════ */}

            </div>
          </div>
        </div>

        {/* ══════════ BOTTOM TICKER ══════════════════════════════════ */}
        <div className="relative z-10 border-t border-foreground/[0.06] overflow-hidden h-10 flex items-center">
          {/* Fade masks on edges */}
          <div className="absolute left-0 top-0 bottom-0 w-24 z-10 pointer-events-none"
            style={{ background: "linear-gradient(90deg, hsl(var(--background)), transparent)" }} />
          <div className="absolute right-0 top-0 bottom-0 w-24 z-10 pointer-events-none"
            style={{ background: "linear-gradient(-90deg, hsl(var(--background)), transparent)" }} />

          <motion.div
            className="flex items-center gap-8 whitespace-nowrap"
            animate={{ x: ["0%", "-50%"] }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          >
            {[...TICKER_TAGS, ...TICKER_TAGS].map((tag, i) => (
              <span key={i} className="flex items-center gap-3 text-[11px] font-mono text-foreground/25 uppercase tracking-[0.15em]">
                <span className="w-1 h-1 rounded-full bg-foreground/15 flex-shrink-0" />
                {tag}
              </span>
            ))}
          </motion.div>
        </div>

      </div>

      {/* ── Scroll indicator ─────────────────────────────────────── */}
      <motion.a href="#about"
        onClick={e => { e.preventDefault(); document.getElementById("about")?.scrollIntoView({ behavior: "smooth" }); }}
        className="absolute bottom-[3.25rem] right-8 z-20 hidden lg:flex flex-col items-center gap-2 text-foreground/20 hover:text-foreground/50 transition-colors group"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.4 }}
        aria-label="Scroll down"
      >
        <span className="font-mono text-[9px] tracking-[0.25em] uppercase [writing-mode:vertical-rl]">scroll</span>
        <motion.div
          className="w-px h-10 bg-foreground/15 group-hover:bg-foreground/40 transition-colors origin-top"
          animate={{ scaleY: [0.3, 1, 0.3] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.a>

    </section>
  );
};

export default Hero;
