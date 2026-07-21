import { useEffect, useMemo } from "react";
import { useParams, Link, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ArticleBreadcrumb } from "@/components/articles/ArticleBreadcrumb";
import { getAllSeries, getSeriesArticlesBySlug } from "@/content/articles";
import { ArrowLeft, ArrowRight, Clock, BookOpen, CheckCircle, Lock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function SeriesPage() {
  const { slug } = useParams<{ slug: string }>();

  const allSeries = useMemo(() => getAllSeries(), []);
  const seriesMeta = useMemo(
    () => allSeries.find((s) => s.slug === slug),
    [allSeries, slug]
  );
  const seriesArticles = useMemo(
    () => (slug ? getSeriesArticlesBySlug(slug) : []),
    [slug]
  );

  useEffect(() => {
    if (!seriesMeta) return;
    document.title = `${seriesMeta.label} — Article Series | Aditya Kumar Singh`;
    const desc = document.querySelector('meta[name="description"]');
    if (desc) desc.setAttribute("content", seriesMeta.description);
    return () => {
      document.title = "Aditya Kumar Singh — Full-Stack Engineer & AI Builder";
    };
  }, [seriesMeta]);

  if (!seriesMeta) return <Navigate to="/articles" replace />;

  const progressPct = Math.round(
    (seriesMeta.publishedCount / seriesMeta.articleCount) * 100
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-24">
        {/* ── HERO ─────────────────────────────────────────────────────────── */}
        <section className="relative py-20 overflow-hidden">
          {/* Ambient glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[250px] bg-primary/10 rounded-full blur-[100px] pointer-events-none" />

          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto">
              {/* Breadcrumb */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="mb-8"
              >
                <ArticleBreadcrumb
                  items={[
                    { label: "Articles", href: "/articles" },
                    { label: "Series" },
                    { label: seriesMeta.label },
                  ]}
                />
              </motion.div>

              {/* Series header */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55 }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className="font-mono text-xs text-primary/50">// series</span>
                  <div className="h-px flex-1 bg-border/30 max-w-[60px]" />
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono border border-primary/30 bg-primary/5 text-primary/80">
                    <BookOpen className="w-3 h-3" />
                    {seriesMeta.articleCount} parts
                  </span>
                </div>

                <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
                  {seriesMeta.label}
                </h1>
                <p className="text-muted-foreground text-lg max-w-2xl leading-relaxed">
                  {seriesMeta.description}
                </p>
              </motion.div>

              {/* Progress */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="mt-8 pt-8 border-t border-border/40"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground font-mono">
                    {seriesMeta.publishedCount} of {seriesMeta.articleCount} parts published
                  </span>
                  <span className="text-sm font-mono text-primary/80">{progressPct}%</span>
                </div>
                <div className="h-1.5 bg-muted/40 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-primary/60 to-primary rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPct}%` }}
                    transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
                  />
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ── ARTICLES TIMELINE ─────────────────────────────────────────────── */}
        <div className="container mx-auto px-6 pb-24">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="flex items-center gap-3 mb-8"
            >
              <span className="font-mono text-xs text-primary/60">// parts</span>
              <div className="flex-1 h-px bg-border/40" />
            </motion.div>

            <div className="relative">
              {/* Vertical timeline line */}
              <div className="absolute left-6 top-4 bottom-4 w-px bg-border/30" />

              <div className="space-y-4">
                {seriesArticles.map((article, i) => {
                  const isPublished = !article.draft;
                  return (
                    <motion.div
                      key={article.slug}
                      initial={{ opacity: 0, x: -16 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: i * 0.06 }}
                    >
                      {isPublished ? (
                        <Link to={`/articles/${article.slug}`} className="group block">
                          <div className="relative pl-16 pr-6 py-5 rounded-2xl border border-border/40 bg-card/30 hover:bg-card/60 hover:border-primary/30 transition-all duration-300">
                            {/* Timeline dot */}
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-primary/20 border-2 border-primary/60 flex items-center justify-center">
                              <CheckCircle className="w-2.5 h-2.5 text-primary" />
                            </div>

                            {/* Part badge */}
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1.5">
                                  <span className="font-mono text-xs text-primary/60">
                                    Part {article.seriesOrder ?? i + 1}
                                  </span>
                                  <span className="text-border/60">·</span>
                                  <span className="flex items-center gap-1 font-mono text-xs text-muted-foreground">
                                    <Clock className="w-3 h-3" />
                                    {article.readingTime} min read
                                  </span>
                                </div>
                                <h3 className="font-display font-semibold text-foreground group-hover:text-primary transition-colors leading-snug">
                                  {article.title}
                                </h3>
                                {article.subtitle && (
                                  <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                                    {article.subtitle}
                                  </p>
                                )}
                                <p className="text-xs text-muted-foreground/60 font-mono mt-2">
                                  {formatDistanceToNow(new Date(article.publishedDate), { addSuffix: true })}
                                </p>
                              </div>
                              <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all flex-shrink-0 mt-1" />
                            </div>
                          </div>
                        </Link>
                      ) : (
                        <div className="relative pl-16 pr-6 py-5 rounded-2xl border border-border/20 bg-muted/10 opacity-60">
                          {/* Timeline dot */}
                          <div className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-muted/40 border-2 border-muted-foreground/30 flex items-center justify-center">
                            <Lock className="w-2.5 h-2.5 text-muted-foreground/60" />
                          </div>

                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <div className="flex items-center gap-2 mb-1.5">
                                <span className="font-mono text-xs text-muted-foreground/60">
                                  Part {article.seriesOrder ?? i + 1}
                                </span>
                                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-muted/40 text-muted-foreground/70 border border-border/30">
                                  Coming Soon
                                </span>
                              </div>
                              <h3 className="font-display font-semibold text-muted-foreground leading-snug">
                                {article.title}
                              </h3>
                            </div>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Back link */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className="mt-12"
            >
              <Link
                to="/articles"
                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors font-mono"
              >
                <ArrowLeft className="w-4 h-4" />
                All articles
              </Link>
            </motion.div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
