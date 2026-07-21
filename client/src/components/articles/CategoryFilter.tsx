import { motion } from "framer-motion";
import type { ArticleCategory } from "@/types/article";

const CATEGORIES: ArticleCategory[] = [
  "All",
  "AI",
  "Web Development",
  "System Design",
  "Startups",
  "Career",
];

interface CategoryFilterProps {
  active: ArticleCategory;
  onChange: (cat: ArticleCategory) => void;
}

export function CategoryFilter({ active, onChange }: CategoryFilterProps) {
  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by category">
      {CATEGORIES.map((cat) => {
        const isActive = active === cat;
        return (
          <button
            key={cat}
            onClick={() => onChange(cat)}
            className={`relative px-4 py-2 rounded-full text-sm font-medium border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary/30 ${
              isActive
                ? "border-transparent text-white"
                : "border-border/60 text-muted-foreground hover:text-foreground hover:border-primary/40 bg-card/50"
            }`}
            aria-pressed={isActive}
          >
            {isActive && (
              <motion.span
                layoutId="active-category"
                className="absolute inset-0 rounded-full"
                style={{ background: "var(--gradient-warm)" }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            )}
            <span className="relative z-10">{cat}</span>
          </button>
        );
      })}
    </div>
  );
}
