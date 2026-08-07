import { useEffect, useMemo } from "react";
import { useParams, Link, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ArticleGrid } from "@/components/articles/ArticleGrid";
import { ArticleBreadcrumb } from "@/components/articles/ArticleBreadcrumb";
import { getCategoryMeta } from "@/lib/content/categories";
import { getCategoryArticlesBySlug } from "@/content/articles";
import { ArrowLeft } from "lucide-react";

export default function CategoryPage() {
  const { slug } = useParams<{ slug: string }>();
  const meta = slug ? getCategoryMeta(slug) : undefined;
  const categoryArticles = useMemo(
    () => (slug ? getCategoryArticlesBySlug(slug) : []),
    [slug]
  );

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    if (!meta) return;
    document.title = `${meta.label} Articles | Aditya Kumar Singh`;
    const desc = document.querySelector('meta[name="description"]');
    if (desc) desc.setAttribute("content", meta.description);
    return () => {
      document.title = "Aditya Kumar Singh — Full-Stack Engineer & AI Builder";
    };
  }, [meta]);

  if (!meta) return <Navigate to="/articles" replace />;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-24">
        {/* ── HERO ─────────────────────────────────────────────────────────── */}
        <section className="relative py-20 overflow-hidden">
          {/* Ambient glow */}
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full blur-[120px] opacity-20 pointer-events-none"
            style={{ background: meta.color }}
          />

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
                    { label: meta.label },
                  ]}
                />
              </motion.div>

              {/* Category header */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55 }}
              >
                <div className="flex items-center gap-2 mb-3 font-mono text-xs text-muted-foreground uppercase tracking-widest">
                  <span className="text-purple-400 font-bold">{">"}</span>
                  <span className="text-foreground/80 font-bold">CATEGORY TRACK</span>
                  <span className="text-border">·</span>
                  <span className="font-bold" style={{ color: meta.color }}>
                    {meta.label}
                  </span>
                </div>

                <h1 className="font-display text-4xl md:text-6xl font-bold tracking-tight mb-4 text-foreground">
                  {meta.label}
                </h1>
                <p className="text-muted-foreground text-lg max-w-2xl leading-relaxed">
                  {meta.description}
                </p>
              </motion.div>

              {/* Stats */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="flex items-center gap-6 mt-8 pt-8 border-t border-border/40"
              >
                <div className="text-center">
                  <div className="font-mono text-3xl font-bold" style={{ color: meta.color }}>
                    {categoryArticles.length}
                  </div>
                  <div className="text-xs text-muted-foreground font-mono uppercase tracking-wider mt-1">
                    article{categoryArticles.length !== 1 ? "s" : ""}
                  </div>
                </div>
                <div className="h-8 w-px bg-border/40" />
                <Link
                  to="/articles"
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  All categories
                </Link>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ── ARTICLES ─────────────────────────────────────────────────────── */}
        <div className="container mx-auto px-6 pb-24">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="flex items-center gap-3 mb-8"
            >
              <span className="font-mono text-xs text-primary/60">// latest</span>
              <div className="flex-1 h-px bg-border/40" />
              <span className="font-mono text-xs text-muted-foreground">
                {categoryArticles.length} result{categoryArticles.length !== 1 ? "s" : ""}
              </span>
            </motion.div>

            <ArticleGrid articles={categoryArticles} isFiltering={false} />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
