import { useEffect, useRef, useState } from "react";

/**
 * Tracks reading progress (0–100) for an article page.
 *
 * Performance optimizations applied:
 *  1. requestAnimationFrame throttling — the scroll handler schedules at most
 *     one rAF per browser paint cycle (~60fps), preventing the 100+ calls/sec
 *     that a raw scroll listener produces.
 *  2. Change threshold (0.5%) — setProgress() is only called when the new
 *     value differs by more than 0.5 percentage points from the last rendered
 *     value, avoiding no-op React re-renders on tiny scroll deltas.
 *  3. Container ref caching (Fix 5) — the DOM node for the scroll container is
 *     resolved once per containerRef change and stored in a ref, so the scroll
 *     handler never touches the DOM to fetch the element.
 */
export function useReadingProgress(containerRef?: React.RefObject<HTMLElement>) {
  const [progress, setProgress] = useState(0);

  // Cached container element — resolved once when containerRef changes.
  const containerElRef = useRef<HTMLElement | null>(null);

  // Tracks the last value that was actually committed to state.
  const lastProgressRef = useRef(0);

  // Holds the pending rAF id so we can cancel it on cleanup.
  const rafIdRef = useRef<number | null>(null);

  // Keep the cached container element in sync with containerRef.
  useEffect(() => {
    containerElRef.current = containerRef?.current ?? document.documentElement;
  }, [containerRef]);

  useEffect(() => {
    const handleScroll = () => {
      // Cancel any already-pending frame — we only need the latest scroll position.
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
      }

      rafIdRef.current = requestAnimationFrame(() => {
        rafIdRef.current = null;

        const container = containerElRef.current ?? document.documentElement;
        const scrollTop = window.scrollY;
        const docHeight = container.scrollHeight - window.innerHeight;
        const newPct = docHeight > 0 ? Math.min((scrollTop / docHeight) * 100, 100) : 0;

        // Only commit a state update when the change exceeds 0.5% — avoids
        // spurious re-renders from micro-scroll deltas.
        if (Math.abs(newPct - lastProgressRef.current) >= 0.5) {
          lastProgressRef.current = newPct;
          setProgress(newPct);
        }
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    // Compute initial value immediately (no rAF needed — synchronous).
    const container = containerElRef.current ?? document.documentElement;
    const scrollTop = window.scrollY;
    const docHeight = container.scrollHeight - window.innerHeight;
    const initialPct = docHeight > 0 ? Math.min((scrollTop / docHeight) * 100, 100) : 0;
    lastProgressRef.current = initialPct;
    setProgress(initialPct);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, [containerRef]);

  return progress;
}
