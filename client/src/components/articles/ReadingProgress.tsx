import { motion, useScroll, useSpring } from "framer-motion";

/**
 * Article reading progress bar — mirrors the main ScrollProgress component
 * but scoped to the article page.
 */
export function ReadingProgress() {
  const { scrollYProgress } = useScroll();
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
        willChange: "transform",
      }}
    />
  );
}
