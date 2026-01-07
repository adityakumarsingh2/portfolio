import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { ArrowDown, Github, Linkedin, Mail } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import Antigravity from "./Antigravity";
import profilePhoto from "@/assets/profile-photo.png";

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

// Interactive 3D Card component
const Interactive3DCard = ({ children }: { children: React.ReactNode }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  const mouseXSpring = useSpring(x, { stiffness: 150, damping: 15 });
  const mouseYSpring = useSpring(y, { stiffness: 150, damping: 15 });
  
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["15deg", "-15deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-15deg", "15deg"]);
  const glareX = useTransform(mouseXSpring, [-0.5, 0.5], ["0%", "100%"]);
  const glareY = useTransform(mouseYSpring, [-0.5, 0.5], ["0%", "100%"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    
    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const mouseX = (e.clientX - centerX) / rect.width;
    const mouseY = (e.clientY - centerY) / rect.height;
    
    x.set(mouseX);
    y.set(mouseY);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      }}
      className="relative cursor-pointer"
    >
      {children}
      
      {/* Glare effect */}
      <motion.div
        className="absolute inset-0 rounded-2xl pointer-events-none overflow-hidden"
        style={{
          background: `radial-gradient(circle at ${glareX} ${glareY}, rgba(255,255,255,0.25) 0%, transparent 50%)`,
          opacity: isHovered ? 1 : 0,
          transition: "opacity 0.3s",
        }}
      />
    </motion.div>
  );
};

const Hero = () => {
  const taglines = [
    "Full Stack Developer",
    "Cloud Enthusiast", 
    "DSA Enthusiast",
    "Problem Solver"
  ];

  const typedText = useTypingEffect(taglines, 100, 50, 2000);

  // Delay mounting heavy visuals until browser is idle (reduces first-scroll stutter)
  const [enableHeavyFx, setEnableHeavyFx] = useState(false);
  useEffect(() => {
    const ric = (window as any).requestIdleCallback as undefined | ((cb: () => void, opts?: { timeout: number }) => number);
    if (ric) {
      const id = ric(() => setEnableHeavyFx(true), { timeout: 1500 });
      return () => {
        const cancel = (window as any).cancelIdleCallback as undefined | ((id: number) => void);
        cancel?.(id);
      };
    }
    const t = window.setTimeout(() => setEnableHeavyFx(true), 900);
    return () => window.clearTimeout(t);
  }, []);

  // Tech stack floating elements
  const techSymbols = ["C++", "Java", "DSA", "React", "Node.js", "Express.js", "MongoDB", "TypeScript", "Python", "AWS"];
  const randomSymbols = techSymbols.sort(() => Math.random() - 0.5).slice(0, 8);

  const containerRef = useRef<HTMLDivElement>(null);

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
      <div className="absolute inset-0 z-0 opacity-[0.015] mix-blend-overlay" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
      }} />
      
      {/* Antigravity Background - mount after idle for smoother first scroll */}
      {enableHeavyFx && (
        <div className="absolute inset-0 z-0 gpu-accelerate">
          <Antigravity
            count={80}
            magnetRadius={8}
            ringRadius={10}
            waveSpeed={0.03}
            waveAmplitude={0.3}
            particleSize={0.8}
            lerpSpeed={0.005}
            color={'#FF6B35'}
            autoAnimate={true}
            particleVariance={0.6}
            particleShape="sphere"
          />
        </div>
      )}
      
      {/* Premium gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background z-[1]" />
      <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.02] via-transparent to-primary/[0.04] z-[1]" />
      
      {/* Radial gradient spotlight effect */}
      <div className="absolute inset-0 z-[1]" style={{
        background: 'radial-gradient(ellipse 80% 50% at 50% 50%, hsl(var(--primary) / 0.06) 0%, transparent 60%)'
      }} />
      
      {/* Animated corner accents - refined */}
      <motion.div
        className="absolute top-20 left-10 w-24 h-24 border-l border-t border-primary/20 z-[2]"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5, duration: 0.8 }}
      />
      <motion.div
        className="absolute bottom-20 right-10 w-24 h-24 border-r border-b border-primary/20 z-[2]"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.7, duration: 0.8 }}
      />
      
      {/* Floating code symbols - more subtle */}
      {randomSymbols.map((symbol, i) => (
        <motion.span
          key={i}
          className="absolute font-mono text-primary/10 text-lg md:text-xl select-none z-[2] hidden lg:block"
          style={{
            left: `${8 + i * 11}%`,
            top: `${15 + (i % 3) * 25}%`,
          }}
          animate={{
            y: [0, -3, 0],
            opacity: [0.05, 0.1, 0.05],
          }}
          transition={{
            duration: 50 + i * 5,
            repeat: Infinity,
            delay: i * 3,
            ease: "easeInOut",
          }}
        >
          {symbol}
        </motion.span>
      ))}
      
      {/* Elegant floating orbs - refined with GPU acceleration */}
      <div
        className="absolute w-[500px] h-[500px] rounded-full z-[1] gpu-accelerate animate-pulse"
        style={{ 
          left: '5%', 
          top: '10%',
          background: 'radial-gradient(circle, hsl(var(--primary) / 0.08) 0%, transparent 70%)',
          filter: 'blur(60px)',
          opacity: 0.6
        }}
      />
      <div
        className="absolute w-[400px] h-[400px] rounded-full z-[1] gpu-accelerate animate-pulse"
        style={{ 
          right: '0%', 
          bottom: '20%',
          background: 'radial-gradient(circle, hsl(var(--primary) / 0.06) 0%, transparent 70%)',
          filter: 'blur(80px)',
          opacity: 0.5,
          animationDelay: '2s'
        }}
      />
      
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
                  className="font-mono text-primary text-sm tracking-wider inline-block px-4 py-2 rounded-lg bg-card/80 border border-primary/20 backdrop-blur-sm cursor-default"
                  whileHover={{ 
                    scale: 1.02, 
                    borderColor: "hsl(var(--primary) / 0.5)",
                    boxShadow: "0 0 20px hsl(var(--primary) / 0.2)"
                  }}
                  transition={{ duration: 0.2 }}
                >
                  <span className="text-blue-400">{"import "}</span>
                  <span className="text-foreground">Developer</span>
                  <span className="text-blue-400">{" from "}</span>
                  <span className="text-green-400">"@/career"</span>
                </motion.span>
              </motion.div>
              
              {/* Name with animated underline */}
              <motion.h1 
                className="font-display text-5xl md:text-6xl lg:text-7xl font-bold mb-6 relative"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.3 }}
              >
                <span className="relative">
                  Aditya Kumar
                  <motion.span
                    className="absolute -bottom-2 left-0 h-1 bg-gradient-to-r from-primary to-primary/50 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ delay: 1, duration: 0.8 }}
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

              <motion.p 
                className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto lg:mx-0 font-mono text-sm px-4 py-3 rounded-lg bg-card/60 border border-border/50 backdrop-blur-sm cursor-default"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.5 }}
                whileHover={{ 
                  scale: 1.02, 
                  borderColor: "hsl(var(--primary) / 0.4)",
                  boxShadow: "0 0 20px hsl(var(--primary) / 0.15)"
                }}
              >
                <span className="text-blue-400">{"<App "}</span>
                <span className="text-purple-400">stack</span>=
                <span className="text-green-400">"MERN Stack, DSA, Cloud"</span>
                <span className="text-blue-400">{" />"}</span>
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
                    className="h-12 px-6 rounded-full border-2 border-foreground/20 font-semibold hover:border-primary hover:text-primary transition-all duration-300 backdrop-blur-sm inline-flex items-center justify-center"
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
                transition={{ duration: 0.7, delay: 0.7 }}
              >
                {[
                  { href: "https://github.com/adityakumarsingh2", icon: Github },
                  { href: "https://linkedin.com/in/adityakumarsingh2", icon: Linkedin },
                  { href: "mailto:adityakumarsingh909@outlook.com", icon: Mail },
                ].map((social, i) => (
                  <MagneticElement key={social.href} strength={0.5}>
                    <motion.a
                      href={social.href}
                      target={social.href.startsWith('mailto') ? undefined : "_blank"}
                      rel={social.href.startsWith('mailto') ? undefined : "noopener noreferrer"}
                      className="p-3 rounded-full bg-card/80 border border-border hover:border-primary hover:text-primary hover:bg-primary/10 transition-all duration-300 backdrop-blur-sm block"
                      whileHover={{ scale: 1.15, rotate: 5 }}
                      whileTap={{ scale: 0.9 }}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.8 + i * 0.1 }}
                    >
                      <social.icon className="w-5 h-5" />
                    </motion.a>
                  </MagneticElement>
                ))}
                <span className="hidden sm:block h-px w-16 bg-gradient-to-r from-border to-primary/50" />
                <motion.span 
                  className="font-mono text-sm text-muted-foreground px-3 py-1 rounded-full bg-card/60 border border-border/50"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.1 }}
                >
                  B.Tech CSE @ LPU
                </motion.span>
              </motion.div>
            </div>

            {/* Right side - Interactive 3D Profile Card */}
            <motion.div 
              className="flex justify-center lg:justify-center order-1 lg:order-2"
              initial={{ opacity: 0, scale: 0.8, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.8, type: "spring", stiffness: 100 }}
            >
              <div className="relative" style={{ perspective: "1000px" }}>
                {/* Animated rings around card */}
                <motion.div
                  className="absolute -inset-8 rounded-3xl border border-primary/20"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  style={{ transformStyle: "preserve-3d" }}
                />
                <motion.div
                  className="absolute -inset-12 rounded-3xl border border-primary/10"
                  animate={{ rotate: -360 }}
                  transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                />
                
                {/* Pulsing glow behind */}
                <motion.div 
                  className="absolute -inset-6 bg-gradient-to-br from-primary/30 via-primary/20 to-transparent blur-2xl rounded-3xl"
                  animate={{ 
                    opacity: [0.4, 0.7, 0.4],
                    scale: [1, 1.1, 1],
                  }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                />
                
                {/* Orbiting particles */}
                {[0, 1, 2, 3].map((i) => (
                  <motion.div
                    key={i}
                    className="absolute w-3 h-3 rounded-full bg-primary/60"
                    style={{
                      top: "50%",
                      left: "50%",
                    }}
                    animate={{
                      x: [
                        Math.cos((i * Math.PI) / 2) * 150,
                        Math.cos((i * Math.PI) / 2 + Math.PI) * 150,
                        Math.cos((i * Math.PI) / 2) * 150,
                      ],
                      y: [
                        Math.sin((i * Math.PI) / 2) * 180,
                        Math.sin((i * Math.PI) / 2 + Math.PI) * 180,
                        Math.sin((i * Math.PI) / 2) * 180,
                      ],
                      opacity: [0.3, 0.8, 0.3],
                      scale: [0.5, 1, 0.5],
                    }}
                    transition={{
                      duration: 4 + i * 0.5,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: i * 0.5,
                    }}
                  />
                ))}
                
                <Interactive3DCard>
                  {/* Profile image container */}
                  <div className="relative w-52 h-68 md:w-60 md:h-80 lg:w-72 lg:h-96 rounded-2xl overflow-hidden border-2 border-primary/40 bg-card shadow-2xl">
                    <img 
                      src={profilePhoto} 
                      alt="Aditya Kumar Singh"
                      className="w-full h-full object-cover object-top"
                    />
                    
                    {/* Corner decorations */}
                    <div className="absolute top-3 left-3 w-6 h-6 border-l-2 border-t-2 border-primary/60" />
                    <div className="absolute top-3 right-3 w-6 h-6 border-r-2 border-t-2 border-primary/60" />
                    <div className="absolute bottom-3 left-3 w-6 h-6 border-l-2 border-b-2 border-primary/60" />
                    <div className="absolute bottom-3 right-3 w-6 h-6 border-r-2 border-b-2 border-primary/60" />
                    
                    {/* Gradient overlay at bottom with text */}
                    <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-background/90 via-background/50 to-transparent flex items-end justify-center pb-4">
                      <motion.span 
                        className="font-mono text-xs text-primary/80"
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        {"<Developer status=\"active\" />"}
                      </motion.span>
                    </div>
                  </div>
                </Interactive3DCard>
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
            className="p-2 rounded-full border border-border group-hover:border-primary transition-colors"
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
