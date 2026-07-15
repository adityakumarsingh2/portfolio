import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowUpRight, Clock } from "lucide-react";
import type { Article } from "@/types/article";
import { formatDate } from "@/lib/utils";

const CATEGORY_COLORS: Record<string, string> = {
  AI: "text-purple-400",
  "Web Development": "text-blue-400",
  "System Design": "text-orange-400",
  Startups: "text-green-400",
  Career: "text-pink-400",
};

interface RelatedArticlesProps {
  articles: Article[];
}

export function RelatedArticles({ articles }: RelatedArticlesProps) {
  if (articles.length === 0) return null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="mt-16 pt-12 border-t border-border/40"
    >
      <div className="flex items-center gap-3 mb-8">
        <span className="font-mono text-xs text-primary/60">{"// "}</span>
        <h2 className="font-display text-xl font-bold">Related Articles</h2>
        <div className="flex-1 h-px bg-border/40" />
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {articles.map((article, i) => {
          const catColor = CATEGORY_COLORS[article.category] ?? "text-primary";
          return (
            <motion.div
              key={article.slug}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
            >
              <Link
                to={`/articles/${article.slug}`}
                className="group flex flex-col h-full card-elegant p-5 hover:-translate-y-1 transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className={`font-mono text-xs font-medium ${catColor}`}>
                    {article.category}
                  </span>
                  <span className="flex items-center gap-1 font-mono text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    {article.readingTime}m
                  </span>
                </div>

                <h3 className="font-display font-bold text-base leading-snug group-hover:text-primary transition-colors duration-200 mb-2 line-clamp-2 flex-1">
                  {article.title}
                </h3>

                <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/30">
                  <time className="font-mono text-xs text-muted-foreground">
                    {formatDate(article.publishedDate)}
                  </time>
                  <ArrowUpRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </motion.section>
  );
}
