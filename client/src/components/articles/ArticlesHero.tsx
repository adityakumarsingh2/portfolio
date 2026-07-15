import { motion } from "framer-motion";
import { ArticleSearch } from "./ArticleSearch";
import { CategoryFilter } from "./CategoryFilter";
import type { ArticleCategory, SortOption } from "@/types/article";

interface ArticlesHeroProps {
  query: string;
  setQuery: (v: string) => void;
  category: ArticleCategory;
  setCategory: (c: ArticleCategory) => void;
  sort: SortOption;
  setSort: (s: SortOption) => void;
  totalCount: number;
  resultCount: number;
  isFiltering: boolean;
}

export function ArticlesHero({
  query,
  setQuery,
  category,
  setCategory,
  sort,
  setSort,
  totalCount,
  resultCount,
  isFiltering,
}: ArticlesHeroProps) {
  return (
    <section className="relative pt-32 pb-16 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-dots opacity-10" />
      <div className="absolute top-1/3 left-1/4 w-96 h-96 rounded-full bg-primary/5 blur-3xl" />
      <div className="absolute top-1/2 right-1/4 w-72 h-72 rounded-full bg-primary/5 blur-3xl" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-4xl mx-auto">
          {/* Import statement decoration */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
            className="font-mono text-sm mb-4"
          >
            <span className="text-blue-400">{"import "}</span>
            <span className="text-foreground">{"{ Articles }"}</span>
            <span className="text-blue-400">{" from "}</span>
            <span className="text-green-400">{"\"@aditya/knowledge-base\""}</span>
          </motion.div>

          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.05, ease: [0.25, 0.1, 0.25, 1] }}
            className="mb-6"
          >
            <h1 className="font-display text-5xl md:text-7xl font-bold leading-tight">
              <span className="font-mono text-purple-400 text-4xl md:text-5xl">{"const "}</span>
              <span className="text-foreground">Articles</span>
              <span className="text-blue-400">{": "}</span>
              <span className="text-gradient-warm">{"KnowledgeBase"}</span>
            </h1>
          </motion.div>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.12, ease: [0.25, 0.1, 0.25, 1] }}
            className="text-lg text-muted-foreground leading-relaxed mb-10 max-w-2xl"
          >
            A collection of engineering articles, AI research, startup learnings, and software
            development guides. Deep dives, not hot takes.
          </motion.p>

          {/* Search */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.18, ease: [0.25, 0.1, 0.25, 1] }}
            className="mb-5"
          >
            <ArticleSearch value={query} onChange={setQuery} />
          </motion.div>

          {/* Filters row */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.24, ease: [0.25, 0.1, 0.25, 1] }}
            className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
          >
            <CategoryFilter active={category} onChange={setCategory} />

            <div className="flex items-center gap-3">
              {/* Sort */}
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortOption)}
                className="px-3 py-2 rounded-xl bg-card/80 border border-border/60 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 font-mono cursor-pointer"
                aria-label="Sort articles"
              >
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
                <option value="reading-time-asc">Shortest</option>
                <option value="reading-time-desc">Longest</option>
              </select>

              {/* Count badge */}
              <span className="font-mono text-xs text-muted-foreground whitespace-nowrap">
                {isFiltering ? (
                  <>{resultCount} / {totalCount}</>
                ) : (
                  <>{totalCount} articles</>
                )}
              </span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
