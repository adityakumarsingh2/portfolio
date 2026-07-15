import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Clock, ArrowRight, CalendarDays } from "lucide-react";
import type { Article } from "@/types/article";
import { formatDate } from "@/lib/utils";

interface FeaturedArticleProps {
  article: Article;
}

const CATEGORY_COLORS: Record<string, string> = {
  AI: "text-purple-400 bg-purple-500/10 border-purple-500/20",
  "Web Development": "text-blue-400 bg-blue-500/10 border-blue-500/20",
  "System Design": "text-orange-400 bg-orange-500/10 border-orange-500/20",
  Startups: "text-green-400 bg-green-500/10 border-green-500/20",
  Career: "text-pink-400 bg-pink-500/10 border-pink-500/20",
};

export function FeaturedArticle({ article }: FeaturedArticleProps) {
  const categoryStyle =
    CATEGORY_COLORS[article.category] ?? "text-primary bg-primary/10 border-primary/20";

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
      className="mb-16"
    >
      {/* Section label */}
      <div className="flex items-center gap-3 mb-6">
        <span className="font-mono text-xs text-primary/60 tracking-widest uppercase">
          {`// featured`}
        </span>
        <div className="flex-1 h-px bg-border/40" />
      </div>

      <Link to={`/articles/${article.slug}`} className="group block">
        <div className="card-elegant overflow-hidden transition-all duration-500 group-hover:-translate-y-1 group-hover:shadow-[0_20px_60px_hsl(var(--primary)/0.15)]">
          <div className="grid lg:grid-cols-5 gap-0">
            {/* Cover Image — 3/5 on desktop */}
            <div className="lg:col-span-3 relative overflow-hidden bg-muted/30 aspect-video lg:aspect-auto lg:min-h-[380px]">
              <img
                src={article.coverImage}
                alt={article.title}
                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                loading="eager"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-background/80 hidden lg:block" />
              <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/30 to-transparent lg:hidden" />

              {/* Featured badge */}
              <div className="absolute top-4 left-4">
                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-background/80 backdrop-blur-sm border border-border/60 font-mono text-xs text-foreground">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-ping-slow" />
                  Featured
                </span>
              </div>
            </div>

            {/* Content — 2/5 on desktop */}
            <div className="lg:col-span-2 flex flex-col justify-center p-8 lg:p-10">
              <div className="flex items-center gap-3 mb-4">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${categoryStyle}`}>
                  {article.category}
                </span>
                <span className="flex items-center gap-1 text-xs text-muted-foreground font-mono">
                  <Clock className="w-3 h-3" />
                  {article.readingTime} min read
                </span>
              </div>

              <h2 className="font-display text-2xl md:text-3xl font-bold leading-snug mb-3 group-hover:text-primary transition-colors duration-300">
                {article.title}
              </h2>

              {article.subtitle && (
                <p className="font-mono text-xs text-primary/60 mb-4 leading-relaxed">
                  {article.subtitle}
                </p>
              )}

              <p className="text-muted-foreground text-sm leading-relaxed mb-6 line-clamp-3">
                {article.excerpt}
              </p>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono">
                  <CalendarDays className="w-3.5 h-3.5" />
                  {formatDate(article.publishedDate)}
                </div>
                <span className="inline-flex items-center gap-2 text-sm font-semibold text-primary group/btn">
                  Read Article
                  <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover/btn:translate-x-1" />
                </span>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
