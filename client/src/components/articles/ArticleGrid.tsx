import { motion, AnimatePresence } from "framer-motion";
import type { Article } from "@/types/article";
import { ArticleCard } from "./ArticleCard";
import { FileText } from "lucide-react";

interface ArticleGridProps {
  articles: Article[];
  isFiltering?: boolean;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.05 },
  },
};

export function ArticleGrid({ articles, isFiltering }: ArticleGridProps) {
  if (articles.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="col-span-full flex flex-col items-center justify-center py-24 text-center"
      >
        <div className="w-16 h-16 rounded-2xl bg-muted/50 border border-border flex items-center justify-center mb-4">
          <FileText className="w-7 h-7 text-muted-foreground" />
        </div>
        <h3 className="font-display text-xl font-bold mb-2">No articles found</h3>
        <p className="text-muted-foreground text-sm max-w-xs">
          {isFiltering
            ? "Try adjusting your search or selecting a different category."
            : "Check back soon — new articles are on the way."}
        </p>
      </motion.div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={articles.map((a) => a.slug).join(",")}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {articles.map((article, i) => (
          <ArticleCard key={article.slug} article={article} index={i} />
        ))}
      </motion.div>
    </AnimatePresence>
  );
}
