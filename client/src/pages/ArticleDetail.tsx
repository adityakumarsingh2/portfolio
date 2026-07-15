import { useEffect } from "react";
import { useParams, Link, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ReadingProgress } from "@/components/articles/ReadingProgress";
import { ArticleBreadcrumb } from "@/components/articles/ArticleBreadcrumb";
import { ArticleMeta } from "@/components/articles/ArticleMeta";
import { ArticleContent } from "@/components/articles/ArticleContent";
import { TableOfContents } from "@/components/articles/TableOfContents";
import { ArticleShare } from "@/components/articles/ArticleShare";
import { RelatedArticles } from "@/components/articles/RelatedArticles";
import { PrevNextNav } from "@/components/articles/PrevNextNav";
import { useTableOfContents } from "@/hooks/useTableOfContents";
import { getArticleBySlug, getRelatedArticles, getAdjacentArticles } from "@/content/articles";
import { ArrowLeft } from "lucide-react";

export default function ArticleDetail() {
  const { slug } = useParams<{ slug: string }>();
  const article = slug ? getArticleBySlug(slug) : undefined;

  // ⚠️ All hooks must run unconditionally — call them before any early return
  const { items: tocItems, activeId } = useTableOfContents(article?.content ?? "");

  // SEO effect — runs whenever the article changes
  useEffect(() => {
    if (!article) return;
    document.title = article.seoTitle;
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement("meta");
      metaDesc.setAttribute("name", "description");
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute("content", article.seoDescription);
    window.scrollTo({ top: 0 });

    return () => {
      document.title = "Aditya Kumar Singh — Full-Stack Engineer & AI Builder";
    };
  }, [article?.slug, article?.seoTitle, article?.seoDescription]);

  // Redirect after hooks run
  if (!article) {
    return <Navigate to="/articles" replace />;
  }

  const related = getRelatedArticles(article, 3);
  const { prev, next } = getAdjacentArticles(article.slug);

  return (
    <div className="min-h-screen bg-background">
      <ReadingProgress />
      <Navbar />

      <main className="pt-24">
        {/* ── ARTICLE HERO ─────────────────────────────────────────────────── */}
        <div className="relative overflow-hidden">
          {/* Cover image hero */}
          <div className="relative h-[340px] md:h-[460px] lg:h-[520px] overflow-hidden">
            <img
              src={article.coverImage}
              alt={article.title}
              className="w-full h-full object-cover"
              loading="eager"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/10" />
          </div>

          {/* Hero content overlay */}
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto -mt-20 relative z-10 pb-8">
              {/* Breadcrumb */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="mb-5"
              >
                <ArticleBreadcrumb
                  items={[
                    { label: "Articles", href: "/articles" },
                    {
                      label: article.category,
                      href: `/articles?category=${encodeURIComponent(article.category)}`,
                    },
                    { label: article.title },
                  ]}
                />
              </motion.div>

              {/* Title */}
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.05, ease: [0.25, 0.1, 0.25, 1] }}
                className="font-display text-3xl md:text-5xl font-bold leading-tight mb-4"
              >
                {article.title}
              </motion.h1>

              {/* Subtitle */}
              {article.subtitle && (
                <motion.p
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="text-muted-foreground text-lg leading-relaxed mb-6 max-w-2xl"
                >
                  {article.subtitle}
                </motion.p>
              )}

              {/* Meta */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.15 }}
              >
                <ArticleMeta article={article} />
              </motion.div>
            </div>
          </div>
        </div>

        {/* ── ARTICLE BODY ─────────────────────────────────────────────────── */}
        <div className="container mx-auto px-6 pb-24">
          <div className="max-w-7xl mx-auto">
            <div className="flex gap-12 items-start">

              {/* Main content */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="min-w-0 flex-1 max-w-3xl"
              >
                <ArticleContent content={article.content} />

                <ArticleShare title={article.title} />

                <RelatedArticles articles={related} />

                <PrevNextNav prev={prev} next={next} />

                <div className="mt-12">
                  <Link
                    to="/articles"
                    className="inline-flex items-center gap-2 font-mono text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Articles
                  </Link>
                </div>
              </motion.div>

              {/* TOC sidebar — desktop only */}
              <TableOfContents items={tocItems} activeId={activeId} />
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
