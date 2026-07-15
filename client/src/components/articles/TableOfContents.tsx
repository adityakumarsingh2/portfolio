import type { TocItem } from "@/hooks/useTableOfContents";
import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import { Clock } from "lucide-react";

interface TableOfContentsProps {
  items: TocItem[];
  activeId: string;
  readingTime: number;
}

export function TableOfContents({ items, activeId, readingTime }: TableOfContentsProps) {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });
  
  // Calculate remaining time based on scroll progress
  const remainingTime = useTransform(scrollYProgress, (latest) => {
    const remaining = Math.ceil(readingTime * (1 - latest));
    return Math.max(1, remaining);
  });

  if (items.length === 0) return null;

  const handleClick = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - 96;
    window.scrollTo({ top, behavior: "smooth" });
  };

  return (
    <aside className="hidden xl:block sticky top-24 self-start w-64 shrink-0">
      <div className="card-elegant p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-primary/60">{"// "}</span>
            <span className="font-mono text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              On this page
            </span>
          </div>
          
          <motion.div 
            className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground bg-muted/40 px-2 py-0.5 rounded-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <Clock className="w-3 h-3 text-primary/60" />
            <motion.span>{remainingTime}</motion.span>m left
          </motion.div>
        </div>

        {/* Progress Bar Track */}
        <div className="h-1 w-full bg-muted/50 rounded-full mb-5 overflow-hidden">
          <motion.div 
            className="h-full bg-gradient-to-r from-primary/60 to-primary"
            style={{ scaleX, originX: 0 }}
          />
        </div>

        <nav aria-label="Table of contents">
          <ul className="space-y-0.5">
            {items.map((item) => {
              const isActive = activeId === item.id;
              return (
                <li key={item.id}>
                  <button
                    onClick={() => handleClick(item.id)}
                    className={`relative w-full text-left text-sm transition-all duration-200 rounded-lg px-3 py-1.5 z-10 ${
                      item.level === 3 ? "pl-6" : ""
                    } ${
                      isActive
                        ? "text-primary font-medium"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeTOC"
                        className="absolute inset-0 bg-primary/10 rounded-lg -z-10"
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                    )}
                    <span className="relative z-10 flex items-center">
                      {isActive && (
                        <span
                          className="inline-block w-1 h-1 rounded-full mr-2"
                          style={{ background: "var(--gradient-warm)" }}
                        />
                      )}
                      {item.text}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </aside>
  );
}
