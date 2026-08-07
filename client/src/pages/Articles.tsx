import { useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ArticlesHero } from "@/components/articles/ArticlesHero";
import { FeaturedArticle } from "@/components/articles/FeaturedArticle";
import { ArticleGrid } from "@/components/articles/ArticleGrid";
import { useArticleSearch } from "@/hooks/useArticleSearch";
import { CATEGORY_META } from "@/lib/content/categories";
import { getAllSeries, getCategoryArticlesBySlug } from "@/content/articles";
import { ArrowRight, BookOpen } from "lucide-react";

export default function Articles() {
  const {
    query,
    setQuery,
    category,
    setCategory,
    sort,
    setSort,
    results,
    featuredInResults,
    latestInResults,
    isFiltering,
    totalCount,
  } = useArticleSearch();

  const seriesList = useMemo(() => getAllSeries(), []);
  const categoriesList = useMemo(() => Object.values(CATEGORY_META), []);

  // Update page title for SEO
  useEffect(() => {
    document.title = "Articles | Aditya Kumar Singh — Engineering Knowledge Base";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) {
      meta.setAttribute(
        "content",
        "Engineering articles, AI research, startup learnings, and software development guides by Aditya Kumar Singh."
      );
    }
    return () => {
      document.title = "Aditya Kumar Singh — Full-Stack Engineer & AI Builder";
    };
  }, []);

  // Smooth scroll to target section if hash is present (e.g. #latest-categories)
  useEffect(() => {
    const handleHashScroll = () => {
      const hash = window.location.hash;
      if (hash) {
        const id = hash.replace("#", "");
        const el = document.getElementById(id);
        if (el) {
          const top = el.getBoundingClientRect().top + window.scrollY - 100;
          window.scrollTo({ top, behavior: "smooth" });
        }
      }
    };

    handleHashScroll();
    window.addEventListener("hashchange", handleHashScroll);
    return () => window.removeEventListener("hashchange", handleHashScroll);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main>
        {/* Hero with search + filters */}
        <ArticlesHero
          query={query}
          setQuery={setQuery}
          category={category}
          setCategory={setCategory}
          sort={sort}
          setSort={setSort}
          totalCount={totalCount}
          resultCount={results.length}
          isFiltering={isFiltering}
        />

        <div className="container mx-auto px-6 pb-24">
          <div className="max-w-7xl mx-auto space-y-16">
            {/* Featured article — only shown when not actively filtering */}
            {!isFiltering && featuredInResults && (
              <FeaturedArticle article={featuredInResults} />
            )}

            {/* ── LATEST ARTICLES ────────────────────────────────────────────── */}
            <div>
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="flex items-center gap-3 mb-8"
              >
                <span className="font-mono text-xs text-primary/60">
                  {isFiltering ? "// search results" : "// latest articles"}
                </span>
                <div className="flex-1 h-px bg-border/40" />
                {isFiltering && (
                  <span className="font-mono text-xs text-muted-foreground">
                    {results.length} result{results.length !== 1 ? "s" : ""}
                  </span>
                )}
              </motion.div>

              <ArticleGrid
                articles={isFiltering ? results : latestInResults}
                isFiltering={isFiltering}
              />
            </div>

            {/* ── LATEST CATEGORIES (Shown when not filtering) ───────────────── */}
            {!isFiltering && (
              <div id="latest-categories" className="pt-4 border-t border-border/30">
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                  className="flex items-center gap-3 mb-8"
                >
                  <span className="font-mono text-xs text-primary/60">// latest categories</span>
                  <div className="flex-1 h-px bg-border/40" />
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {categoriesList.map((cat) => {
                    const count = getCategoryArticlesBySlug(cat.slug).length;
                    return (
                      <Link
                        key={cat.slug}
                        to={`/articles/category/${cat.slug}`}
                        className="group p-5 rounded-2xl border-2 border-foreground bg-card hover:bg-secondary hover:translate-y-[-2px] transition-all duration-200 shadow-2xs flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-1.5">
                              <span
                                className="font-mono text-base font-bold flex-shrink-0"
                                style={{ color: cat.color }}
                              >
                                {">"}
                              </span>
                              <h3 className="font-display font-bold text-base text-foreground group-hover:text-purple-400 transition-colors">
                                {cat.label}
                              </h3>
                            </div>
                            <span className="font-mono text-xs text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-md border border-border/40">
                              {count} {count === 1 ? "article" : "articles"}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground font-sans line-clamp-2 leading-relaxed mb-4">
                            {cat.description}
                          </p>
                        </div>
                        <div className="flex items-center text-xs font-mono font-semibold text-purple-400 group-hover:translate-x-1 transition-transform pt-2">
                          <span>Explore Category</span>
                          <ArrowRight className="w-3.5 h-3.5 ml-1" />
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ── LATEST SERIES (Shown when not filtering) ───────────────────── */}
            {!isFiltering && seriesList.length > 0 && (
              <div id="latest-series" className="pt-4 border-t border-border/30">
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                  className="flex items-center gap-3 mb-8"
                >
                  <span className="font-mono text-xs text-primary/60">// latest series</span>
                  <div className="flex-1 h-px bg-border/40" />
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {seriesList.map((series) => (
                    <Link
                      key={series.slug}
                      to={`/articles/series/${series.slug}`}
                      className="group p-5 rounded-2xl border-2 border-foreground bg-card hover:bg-secondary hover:translate-y-[-2px] transition-all duration-200 shadow-2xs flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-3">
                          <div className="flex items-center gap-2">
                            <BookOpen className="w-4 h-4 text-purple-400" />
                            <span className="font-mono text-xs font-semibold text-purple-400 uppercase tracking-wider">
                              Series
                            </span>
                          </div>
                          <span className="font-mono text-xs font-bold text-foreground bg-purple-500/10 border border-purple-500/30 px-2.5 py-0.5 rounded-full">
                            {series.publishedCount} / {series.articleCount} Parts
                          </span>
                        </div>
                        <h3 className="font-display font-bold text-lg text-foreground mb-2 group-hover:text-purple-400 transition-colors">
                          {series.label}
                        </h3>
                        <p className="text-xs text-muted-foreground font-sans leading-relaxed line-clamp-2 mb-4">
                          {series.description}
                        </p>
                      </div>
                      <div className="flex items-center justify-between pt-3 border-t border-dashed border-border/40">
                        <span className="font-mono text-[11px] text-muted-foreground">Comprehensive Deep-Dive</span>
                        <div className="flex items-center text-xs font-mono font-semibold text-purple-400 group-hover:translate-x-1 transition-transform">
                          <span>View Series</span>
                          <ArrowRight className="w-3.5 h-3.5 ml-1" />
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
