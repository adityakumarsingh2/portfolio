import { motion, useInView } from "framer-motion";
import { useRef, ReactNode, useMemo } from "react";

interface RevealOnScrollProps {
  children: ReactNode;
  width?: "fit-content" | "100%";
  delay?: number;
  direction?: "up" | "down" | "left" | "right";
  className?: string;
}

const RevealOnScroll = ({ 
  children, 
  width = "100%", 
  delay = 0,
  direction = "up",
  className = ""
}: RevealOnScrollProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  const { initial, animate } = useMemo(() => {
    const offset = 30;
    switch (direction) {
      case "up": return { initial: { opacity: 0, y: offset }, animate: { opacity: 1, y: 0 } };
      case "down": return { initial: { opacity: 0, y: -offset }, animate: { opacity: 1, y: 0 } };
      case "left": return { initial: { opacity: 0, x: offset }, animate: { opacity: 1, x: 0 } };
      case "right": return { initial: { opacity: 0, x: -offset }, animate: { opacity: 1, x: 0 } };
      default: return { initial: { opacity: 0, y: offset }, animate: { opacity: 1, y: 0 } };
    }
  }, [direction]);

  return (
    <div ref={ref} style={{ width }} className={className}>
      <motion.div
        className="gpu-accelerate"
        initial={initial}
        animate={isInView ? animate : initial}
        transition={{
          duration: 0.6,
          delay,
          ease: [0.25, 0.1, 0.25, 1],
        }}
      >
        {children}
      </motion.div>
    </div>
  );
};

export default RevealOnScroll;
