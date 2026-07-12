import { motion, useMotionValue, useSpring } from "framer-motion";
import { useEffect, useState } from "react";

const CustomCursor = () => {
  const [isHovering, setIsHovering] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);
  
  const springConfig = { damping: 25, stiffness: 400 };
  const cursorXSpring = useSpring(cursorX, springConfig);
  const cursorYSpring = useSpring(cursorY, springConfig);

  useEffect(() => {
    // Check if device supports hover (not touch-only)
    const hasHover = window.matchMedia('(hover: hover)').matches;
    if (!hasHover) return;

    const moveCursor = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
      if (!isVisible) setIsVisible(true);
    };

    const handleMouseDown = () => setIsClicking(true);
    const handleMouseUp = () => setIsClicking(false);

    // Event delegation (much cheaper than querying + MutationObserver)
    const isInteractive = (el: Element | null) =>
      !!el?.closest(
        'a, button, [role="button"], input, textarea, select, .cursor-pointer, [data-cursor="pointer"]'
      );

    const handlePointerOver = (e: Event) => {
      const target = e.target as Element | null;
      setIsHovering(isInteractive(target));
    };

    const handlePointerOut = (e: Event) => {
      const target = e.target as Element | null;
      // If we're leaving an interactive element, reset
      if (isInteractive(target)) setIsHovering(false);
    };

    window.addEventListener("mousemove", moveCursor, { passive: true } as AddEventListenerOptions);
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("mouseover", handlePointerOver, true);
    document.addEventListener("mouseout", handlePointerOut, true);

    return () => {
      window.removeEventListener("mousemove", moveCursor as any);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("mouseover", handlePointerOver, true);
      document.removeEventListener("mouseout", handlePointerOut, true);
    };
  }, [cursorX, cursorY, isVisible]);

  // Don't render on touch devices
  if (typeof window !== "undefined" && !window.matchMedia('(hover: hover)').matches) {
    return null;
  }

  return (
    <>
      {/* Main cursor dot */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[9999] mix-blend-difference"
        style={{
          x: cursorXSpring,
          y: cursorYSpring,
        }}
      >
        <motion.div
          className="relative -translate-x-1/2 -translate-y-1/2"
          animate={{
            scale: isClicking ? 0.8 : isHovering ? 1.5 : 1,
            opacity: isVisible ? 1 : 0,
          }}
          transition={{ duration: 0.15 }}
        >
          <div className="w-3 h-3 bg-white rounded-full" />
        </motion.div>
      </motion.div>

      {/* Outer ring */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[9998]"
        style={{
          x: cursorXSpring,
          y: cursorYSpring,
        }}
      >
        <motion.div
          className="relative -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-primary/50"
          animate={{
            width: isHovering ? 50 : 32,
            height: isHovering ? 50 : 32,
            opacity: isVisible ? (isHovering ? 1 : 0.5) : 0,
            borderColor: isHovering ? "hsl(var(--primary))" : "hsl(var(--primary) / 0.5)",
          }}
          transition={{ duration: 0.2 }}
        />
      </motion.div>

      {/* Hide default cursor globally */}
      <style>{`
        @media (hover: hover) {
          * {
            cursor: none !important;
          }
        }
      `}</style>
    </>
  );
};

export default CustomCursor;