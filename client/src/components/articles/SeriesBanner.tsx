import { useMemo } from "react";
import { Link } from "react-router-dom";
import { BookOpen, CheckCircle, Lock, ChevronRight, Layers } from "lucide-react";
import { getArticlesInSeries, getAllSeries } from "@/content/articles";
import { seriesToSlug } from "@/lib/content/slugify";

interface SeriesBannerProps {
  seriesName: string;
  currentSlug: string;
}

export function SeriesBanner({ seriesName, currentSlug }: SeriesBannerProps) {
  const seriesArticles = useMemo(
    () => getArticlesInSeries(seriesName),
    [seriesName]
  );
  
  const seriesSlug = useMemo(() => seriesToSlug(seriesName), [seriesName]);

  const allSeries = useMemo(() => getAllSeries(), []);
  const seriesMeta = useMemo(
    () => allSeries.find((s) => s.label === seriesName || s.slug === seriesSlug),
    [allSeries, seriesName, seriesSlug]
  );

  if (!seriesArticles || seriesArticles.length === 0) return null;

  const publishedCount = seriesArticles.filter((a) => !a.draft).length;
  const totalCount = seriesMeta?.articleCount ?? seriesArticles.length;
  const progressPct = Math.round((publishedCount / totalCount) * 100);

  const currentPartNumber = seriesArticles.find((a) => a.slug === currentSlug)?.seriesOrder ?? 1;

  return (
    <div className="my-8 rounded-2xl border border-primary/20 bg-gradient-to-b from-primary/5 via-card/50 to-card/20 p-6 backdrop-blur-sm shadow-sm relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 pb-4 border-b border-border/40">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-primary font-semibold tracking-wider uppercase">
                Series Guide · Part {currentPartNumber} of {totalCount}
              </span>
            </div>
            <Link
              to={`/articles/series/${seriesSlug}`}
              className="font-display font-bold text-lg text-foreground hover:text-primary transition-colors flex items-center gap-1.5 group"
            >
              {seriesName}
              <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
            </Link>
          </div>
        </div>

        {/* Progress Pill */}
        <div className="flex items-center gap-3 self-start sm:self-auto bg-background/60 border border-border/50 px-3 py-1.5 rounded-full font-mono text-xs">
          <span className="text-muted-foreground">
            <span className="text-primary font-semibold">{publishedCount}</span> / {totalCount} Parts
          </span>
          <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Parts timeline list */}
      <div className="space-y-2">
        {seriesArticles.map((art, idx) => {
          const isCurrent = art.slug === currentSlug;
          const isPublished = !art.draft;
          const partNum = art.seriesOrder ?? idx + 1;

          return (
            <div key={art.slug || idx}>
              {isPublished ? (
                <Link
                  to={`/articles/${art.slug}`}
                  className={`flex items-center justify-between p-3 rounded-xl border transition-all text-sm group ${
                    isCurrent
                      ? "bg-primary/15 border-primary/40 text-foreground font-medium shadow-sm"
                      : "bg-card/40 border-border/30 hover:bg-card/80 hover:border-primary/30 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 pr-2">
                    {isCurrent ? (
                      <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs font-mono font-bold flex items-center justify-center shrink-0">
                        {partNum}
                      </span>
                    ) : (
                      <CheckCircle className="w-4 h-4 text-primary/70 shrink-0" />
                    )}
                    <span className="truncate">
                      <span className="font-mono text-xs mr-2 opacity-70">Part {partNum}:</span>
                      {art.title}
                    </span>
                  </div>

                  {isCurrent ? (
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-primary text-primary-foreground shrink-0">
                      Reading Now
                    </span>
                  ) : (
                    <span className="font-mono text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity shrink-0 flex items-center gap-1">
                      Read <ChevronRight className="w-3 h-3" />
                    </span>
                  )}
                </Link>
              ) : (
                <div className="flex items-center justify-between p-3 rounded-xl border border-border/20 bg-muted/10 opacity-60 text-sm">
                  <div className="flex items-center gap-3 min-w-0 pr-2">
                    <Lock className="w-4 h-4 text-muted-foreground/60 shrink-0" />
                    <span className="truncate text-muted-foreground">
                      <span className="font-mono text-xs mr-2 opacity-70">Part {partNum}:</span>
                      {art.title}
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-muted/40 text-muted-foreground border border-border/30 shrink-0">
                    Coming Soon
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
