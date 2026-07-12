import { useScroll, useTransform, MotionValue } from "framer-motion";
import { useRef } from "react";

export const useParallax = (distance: number = 100) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });
  
  const y = useTransform(scrollYProgress, [0, 1], [-distance, distance]);
  
  return { ref, y };
};

export const useParallaxRange = (
  inputRange: [number, number] = [0, 1],
  outputRange: [number, number] = [-50, 50]
): { scrollYProgress: MotionValue<number>; y: MotionValue<number> } => {
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, inputRange, outputRange);
  
  return { scrollYProgress, y };
};
