import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const PageLoader = ({ onComplete }: { onComplete: () => void }) => {
  const [progress, setProgress] = useState(0);
  const [isReturningVisitor, setIsReturningVisitor] = useState(false);

  useEffect(() => {
    // Check if user has visited before
    const hasVisited = sessionStorage.getItem('hasVisited');
    const isReturning = !!hasVisited;
    setIsReturningVisitor(isReturning);
    
    // Mark as visited for this session
    sessionStorage.setItem('hasVisited', 'true');

    // Faster loading for returning visitors
    const increment = isReturning ? 35 : 15;
    const interval = isReturning ? 50 : 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(onComplete, isReturning ? 150 : 300);
          return 100;
        }
        return prev + Math.random() * increment;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: isReturningVisitor ? 0.3 : 0.5, ease: "easeInOut" } }}
    >
      {/* Logo */}
      <motion.div
        className="font-display text-6xl md:text-8xl font-bold mb-8"
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: isReturningVisitor ? 0.2 : 0.5, type: "spring" }}
      >
        A<span className="text-primary">.</span>
      </motion.div>

      {/* Loading bar container */}
      <div className="w-48 md:w-64 h-1 bg-secondary rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ background: "var(--gradient-warm)" }}
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(progress, 100)}%` }}
          transition={{ duration: 0.1 }}
        />
      </div>

      {/* Loading text - only show for first-time visitors */}
      {!isReturningVisitor && (
        <motion.p
          className="mt-4 font-mono text-sm text-muted-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          Loading...
        </motion.p>
      )}

      {/* Floating particles - fewer for returning visitors */}
      {[...Array(isReturningVisitor ? 3 : 6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 rounded-full bg-primary/30"
          initial={{
            opacity: 0,
          }}
          animate={{
            y: [0, -20, 0],
            opacity: [0.3, 0.7, 0.3],
          }}
          transition={{
            duration: 2 + Math.random() * 2,
            repeat: Infinity,
            delay: i * 0.2,
          }}
          style={{
            left: `${20 + i * 12}%`,
            top: `${30 + (i % 3) * 20}%`,
          }}
        />
      ))}
    </motion.div>
  );
};

export default PageLoader;
