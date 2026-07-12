import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

// Stable particle positions — seeded once at module level so they never
// change between renders and never cause layout thrash.
const PARTICLE_POSITIONS = [
  { left: "18%", top: "28%" },
  { left: "30%", top: "62%" },
  { left: "50%", top: "18%" },
  { left: "68%", top: "72%" },
  { left: "80%", top: "35%" },
  { left: "44%", top: "80%" },
];

interface PageLoaderProps {
  onComplete: () => void;
}

const PageLoader = ({ onComplete }: PageLoaderProps) => {
  // Detect returning visitor *synchronously* so the value is stable on first render.
  const isReturningVisitor = useRef(!!sessionStorage.getItem("hasVisited")).current;

  const [progress, setProgress] = useState(0);
  // Track whether onComplete has already been called.
  const completedRef = useRef(false);
  // Keep a stable ref to onComplete so the interval closure never goes stale.
  const onCompleteRef = useRef(onComplete);
  useEffect(() => { onCompleteRef.current = onComplete; }, [onComplete]);

  useEffect(() => {
    sessionStorage.setItem("hasVisited", "true");

    const increment = isReturningVisitor ? 30 : 14;
    const intervalMs = isReturningVisitor ? 45 : 90;

    const timer = setInterval(() => {
      setProgress((prev) => {
        const next = Math.min(prev + Math.random() * increment, 100);
        return next;
      });
    }, intervalMs);

    return () => clearInterval(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fire onComplete in a separate effect that watches progress,
  // keeping side-effects out of the setState updater.
  useEffect(() => {
    if (progress >= 100 && !completedRef.current) {
      completedRef.current = true;
      const delay = isReturningVisitor ? 120 : 260;
      const id = setTimeout(() => onCompleteRef.current(), delay);
      return () => clearTimeout(id);
    }
  }, [progress, isReturningVisitor]);

  const exitDuration = isReturningVisitor ? 0.28 : 0.45;

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background overflow-hidden"
      initial={{ opacity: 1 }}
      exit={{
        opacity: 0,
        transition: { duration: exitDuration, ease: [0.4, 0, 0.2, 1] },
      }}
    >
      {/* Subtle warm radial behind the logo */}
      <div className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 60% 50% at 50% 50%, hsl(15 85% 55% / 0.06) 0%, transparent 70%)",
        }}
      />

      {/* Logo mark */}
      <motion.div
        className="relative mb-10 select-none"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: isReturningVisitor ? 0.22 : 0.48,
          ease: [0.22, 1, 0.36, 1],
        }}
      >
        {/* Outer glow ring */}
        <motion.div
          className="absolute inset-0 rounded-full blur-2xl pointer-events-none"
          style={{ background: "var(--gradient-warm)", opacity: 0.15 }}
          animate={{ scale: [1, 1.3, 1], opacity: [0.12, 0.22, 0.12] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        />
        <span className="font-display text-6xl md:text-7xl font-bold relative z-10 tracking-tight">
          A<span className="text-gradient-warm">.</span>
        </span>
      </motion.div>

      {/* Progress track */}
      <div className="w-44 md:w-56 h-[3px] bg-secondary rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full origin-left"
          style={{ background: "var(--gradient-warm)" }}
          animate={{ width: `${Math.min(progress, 100)}%` }}
          transition={{ duration: 0.08, ease: "linear" }}
        />
      </div>

      {/* Percentage counter */}
      <motion.span
        className="mt-3 font-mono text-xs text-muted-foreground/60 tabular-nums"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        {Math.min(Math.round(progress), 100)}%
      </motion.span>

      {/* Floating ambient particles */}
      {PARTICLE_POSITIONS.slice(0, isReturningVisitor ? 3 : 6).map((pos, i) => (
        <motion.div
          key={i}
          className="absolute w-1.5 h-1.5 rounded-full pointer-events-none"
          style={{
            left: pos.left,
            top: pos.top,
            background: "var(--gradient-warm)",
            opacity: 0,
          }}
          animate={{
            y: [0, -18, 0],
            opacity: [0.15, 0.4, 0.15],
          }}
          transition={{
            duration: 2.4 + i * 0.5,
            repeat: Infinity,
            delay: i * 0.3,
            ease: "easeInOut",
          }}
        />
      ))}
    </motion.div>
  );
};

export default PageLoader;
