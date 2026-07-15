import { useEffect, useState } from "react";

/** Tracks reading progress (0–100) for an article page */
export function useReadingProgress(containerRef?: React.RefObject<HTMLElement>) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const updateProgress = () => {
      const container = containerRef?.current ?? document.documentElement;
      const scrollTop = window.scrollY;
      const docHeight = container.scrollHeight - window.innerHeight;
      const pct = docHeight > 0 ? Math.min((scrollTop / docHeight) * 100, 100) : 0;
      setProgress(pct);
    };

    window.addEventListener("scroll", updateProgress, { passive: true });
    updateProgress();

    return () => window.removeEventListener("scroll", updateProgress);
  }, [containerRef]);

  return progress;
}
