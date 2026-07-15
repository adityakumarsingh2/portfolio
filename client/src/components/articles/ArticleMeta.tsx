import { Clock, CalendarDays, RefreshCw, User, Tag } from "lucide-react";
import type { Article } from "@/types/article";
import { formatDate } from "@/lib/utils";

const CATEGORY_COLORS: Record<string, string> = {
  AI: "text-purple-400 bg-purple-500/10 border-purple-500/20",
  "Web Development": "text-blue-400 bg-blue-500/10 border-blue-500/20",
  "System Design": "text-orange-400 bg-orange-500/10 border-orange-500/20",
  Startups: "text-green-400 bg-green-500/10 border-green-500/20",
  Career: "text-pink-400 bg-pink-500/10 border-pink-500/20",
};

interface ArticleMetaProps {
  article: Article;
}

export function ArticleMeta({ article }: ArticleMetaProps) {
  const categoryStyle =
    CATEGORY_COLORS[article.category] ?? "text-primary bg-primary/10 border-primary/20";

  return (
    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
      {/* Author */}
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 border border-primary/20 flex items-center justify-center">
          <User className="w-3.5 h-3.5 text-primary/60" />
        </div>
        <span className="font-medium text-foreground/80">{article.author.name}</span>
        {article.author.title && (
          <span className="text-xs text-muted-foreground/60">· {article.author.title}</span>
        )}
      </div>

      <span className="text-border">·</span>

      {/* Published */}
      <div className="flex items-center gap-1.5 font-mono text-xs">
        <CalendarDays className="w-3.5 h-3.5" />
        {formatDate(article.publishedDate)}
      </div>

      {/* Updated */}
      {article.updatedDate && article.updatedDate !== article.publishedDate && (
        <>
          <span className="text-border">·</span>
          <div className="flex items-center gap-1.5 font-mono text-xs">
            <RefreshCw className="w-3 h-3" />
            Updated {formatDate(article.updatedDate)}
          </div>
        </>
      )}

      <span className="text-border">·</span>

      {/* Reading time */}
      <div className="flex items-center gap-1.5 font-mono text-xs">
        <Clock className="w-3.5 h-3.5" />
        {article.readingTime} min read
      </div>

      <span className="text-border">·</span>

      {/* Category */}
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${categoryStyle}`}>
        {article.category}
      </span>

      {/* Tags */}
      {article.tags.length > 0 && (
        <div className="flex items-center gap-1.5 flex-wrap">
          <Tag className="w-3 h-3 text-muted-foreground/60" />
          {article.tags.map((tag) => (
            <span
              key={tag}
              className="px-2 py-0.5 rounded-md bg-muted/50 border border-border/40 font-mono text-xs text-muted-foreground"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
