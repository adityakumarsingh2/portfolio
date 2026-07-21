import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import type { Article } from "@/types/article";

interface PrevNextNavProps {
  prev: Article | null;
  next: Article | null;
}

export function PrevNextNav({ prev, next }: PrevNextNavProps) {
  if (!prev && !next) return null;

  return (
    <motion.nav
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="mt-12 pt-8 border-t border-border/40 grid grid-cols-1 sm:grid-cols-2 gap-4"
      aria-label="Article navigation"
    >
      {prev ? (
        <Link
          to={`/articles/${prev.slug}`}
          className="group flex items-start gap-3 card-elegant p-5 hover:-translate-y-0.5 transition-all duration-300"
        >
          <ChevronLeft className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors mt-0.5 flex-shrink-0" />
          <div className="min-w-0">
            <span className="font-mono text-xs text-muted-foreground block mb-1">Previous</span>
            <span className="font-display font-bold text-sm leading-snug group-hover:text-primary transition-colors line-clamp-2">
              {prev.title}
            </span>
          </div>
        </Link>
      ) : (
        <div />
      )}

      {next ? (
        <Link
          to={`/articles/${next.slug}`}
          className="group flex items-start gap-3 card-elegant p-5 hover:-translate-y-0.5 transition-all duration-300 sm:flex-row-reverse sm:text-right"
        >
          <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors mt-0.5 flex-shrink-0" />
          <div className="min-w-0">
            <span className="font-mono text-xs text-muted-foreground block mb-1">Next</span>
            <span className="font-display font-bold text-sm leading-snug group-hover:text-primary transition-colors line-clamp-2">
              {next.title}
            </span>
          </div>
        </Link>
      ) : (
        <div />
      )}
    </motion.nav>
  );
}
