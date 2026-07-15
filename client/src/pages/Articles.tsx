import { useEffect } from "react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ArticlesHero } from "@/components/articles/ArticlesHero";
import { FeaturedArticle } from "@/components/articles/FeaturedArticle";
import { ArticleGrid } from "@/components/articles/ArticleGrid";
import { useArticleSearch } from "@/hooks/useArticleSearch";

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
          <div className="max-w-7xl mx-auto">
            {/* Featured article — only shown when not actively filtering */}
            {!isFiltering && featuredInResults && (
              <FeaturedArticle article={featuredInResults} />
            )}

            {/* Latest articles section label */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="flex items-center gap-3 mb-8"
            >
              <span className="font-mono text-xs text-primary/60">
                {isFiltering ? "// search results" : "// latest"}
              </span>
              <div className="flex-1 h-px bg-border/40" />
              {isFiltering && (
                <span className="font-mono text-xs text-muted-foreground">
                  {results.length} result{results.length !== 1 ? "s" : ""}
                </span>
              )}
            </motion.div>

            {/* Article grid */}
            <ArticleGrid
              articles={isFiltering ? results : latestInResults}
              isFiltering={isFiltering}
            />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
