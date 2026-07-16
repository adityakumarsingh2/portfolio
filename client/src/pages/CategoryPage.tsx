import { useEffect, useMemo } from "react";
import { useParams, Link, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ArticleGrid } from "@/components/articles/ArticleGrid";
import { ArticleBreadcrumb } from "@/components/articles/ArticleBreadcrumb";
import { getCategoryMeta } from "@/lib/content/categories";
import { getCategoryArticlesBySlug } from "@/content/articles";
import { ArrowLeft, FileText, BookOpen } from "lucide-react";

const categoryIconMap: Record<string, React.ElementType> = {
  brain: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
      <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.46 2.5 2.5 0 0 1-1.07-3 2.5 2.5 0 0 1 .91-4.01A2.5 2.5 0 0 1 9.5 2Z"/>
      <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.46 2.5 2.5 0 0 0 1.07-3 2.5 2.5 0 0 0-.91-4.01A2.5 2.5 0 0 0 14.5 2Z"/>
    </svg>
  ),
  code: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
      <polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>
    </svg>
  ),
  layers: BookOpen,
  rocket: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
      <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/>
      <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/>
      <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/>
    </svg>
  ),
  user: FileText,
};

export default function CategoryPage() {
  const { slug } = useParams<{ slug: string }>();
  const meta = slug ? getCategoryMeta(slug) : undefined;
  const categoryArticles = useMemo(
    () => (slug ? getCategoryArticlesBySlug(slug) : []),
    [slug]
  );

  useEffect(() => {
    if (!meta) return;
    document.title = `${meta.label} Articles | Aditya Kumar Singh`;
    const desc = document.querySelector('meta[name="description"]');
    if (desc) desc.setAttribute("content", meta.description);
    return () => {
      document.title = "Aditya Kumar Singh — Full-Stack Engineer & AI Builder";
    };
  }, [meta]);

  if (!meta) return <Navigate to="/articles" replace />;

  const IconComponent = categoryIconMap[meta.icon] ?? FileText;

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
                className="flex items-start gap-6"
              >
                <div
                  className="flex-shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center border"
                  style={{
                    background: `${meta.color}18`,
                    borderColor: `${meta.color}40`,
                    color: meta.color,
                  }}
                >
                  <IconComponent />
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-mono text-xs text-primary/50">// category</span>
                  </div>
                  <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
                    {meta.label}
                  </h1>
                  <p className="text-muted-foreground text-lg max-w-2xl leading-relaxed">
                    {meta.description}
                  </p>
                </div>
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
              <span className="font-mono text-xs text-primary/60">// articles</span>
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
