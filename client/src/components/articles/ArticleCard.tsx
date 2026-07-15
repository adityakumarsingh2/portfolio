import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Clock, ArrowUpRight } from "lucide-react";
import type { Article } from "@/types/article";
import { formatDate } from "@/lib/utils";

interface ArticleCardProps {
  article: Article;
  index?: number;
}

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.55,
      delay: i * 0.1,
      ease: [0.25, 0.1, 0.25, 1] as const,
    },
  }),
};

const CATEGORY_COLORS: Record<string, string> = {
  AI: "text-purple-400 bg-purple-500/10 border-purple-500/20",
  "Web Development": "text-blue-400 bg-blue-500/10 border-blue-500/20",
  "System Design": "text-orange-400 bg-orange-500/10 border-orange-500/20",
  Startups: "text-green-400 bg-green-500/10 border-green-500/20",
  Career: "text-pink-400 bg-pink-500/10 border-pink-500/20",
};

export function ArticleCard({ article, index = 0 }: ArticleCardProps) {
  const categoryStyle = CATEGORY_COLORS[article.category] ?? "text-primary bg-primary/10 border-primary/20";

  return (
    <motion.article
      custom={index}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      className="group relative card-elegant card-glow flex flex-col overflow-hidden transition-all duration-300 hover:-translate-y-1"
    >
      {/* Cover Image */}
      <Link to={`/articles/${article.slug}`} className="block overflow-hidden aspect-video bg-muted/30" tabIndex={-1} aria-hidden>
        <img
          src={article.coverImage}
          alt={article.title}
          className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/10 to-transparent" />
      </Link>

      {/* Content */}
      <div className="flex flex-col flex-1 p-5">
        {/* Meta row */}
        <div className="flex items-center justify-between mb-3">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${categoryStyle}`}>
            {article.category}
          </span>
          <span className="flex items-center gap-1 text-xs text-muted-foreground font-mono">
            <Clock className="w-3 h-3" />
            {article.readingTime} min
          </span>
        </div>

        {/* Title */}
        <Link to={`/articles/${article.slug}`}>
          <h3 className="font-display font-bold text-lg leading-snug mb-2 group-hover:text-primary transition-colors duration-200 line-clamp-2">
            {article.title}
          </h3>
        </Link>

        {/* Excerpt */}
        <p className="text-muted-foreground text-sm leading-relaxed line-clamp-2 flex-1 mb-4">
          {article.excerpt}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-border/40">
          <time className="font-mono text-xs text-muted-foreground">
            {formatDate(article.publishedDate)}
          </time>
          <Link
            to={`/articles/${article.slug}`}
            className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:text-primary/80 transition-colors group/link"
          >
            Read Article
            <ArrowUpRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5" />
          </Link>
        </div>
      </div>
    </motion.article>
  );
}
