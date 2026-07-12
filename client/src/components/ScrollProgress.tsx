import { motion, useScroll, useSpring } from "framer-motion";

const ScrollProgress = () => {
  const { scrollYProgress } = useScroll();
  // Lower stiffness = silkier follow, higher damping = less oscillation
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 80,
    damping: 25,
    restDelta: 0.001,
  });

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-[3px] z-[60] origin-left"
      style={{
        scaleX,
        background: "var(--gradient-warm)",
        // Only promote this single thin bar to its own layer
        willChange: "transform",
      }}
    />
  );
};

export default ScrollProgress;
