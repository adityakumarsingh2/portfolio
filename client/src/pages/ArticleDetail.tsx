import { useState, useEffect } from "react";
import { useParams, Navigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
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
import { ArticleFooter } from "@/components/articles/ArticleFooter";
import { RAGChatWidget } from "@/components/articles/RAGChatWidget";
import { useTableOfContents } from "@/hooks/useTableOfContents";
import { getArticleBySlug, getRelatedArticles, getAdjacentArticles } from "@/content/articles";
import { MessageSquare, X } from "lucide-react";

export default function ArticleDetail() {
  const { slug } = useParams<{ slug: string }>();
  const article = slug ? getArticleBySlug(slug) : undefined;

  const [isChatOpen, setIsChatOpen] = useState(false);

  // ⚠️ All hooks must run unconditionally — call them before any early return
  const { items: tocItems, activeId } = useTableOfContents(article?.content ?? "");

  // Listen for open-rag-chat custom events from footer / prompt chips
  useEffect(() => {
    const handleCustomOpen = () => setIsChatOpen(true);
    window.addEventListener("open-rag-chat", handleCustomOpen);
    return () => window.removeEventListener("open-rag-chat", handleCustomOpen);
  }, []);

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
    // Update existing or create new OG tags
    const ogTags = [
      { property: 'og:title', content: article.seoTitle },
      { property: 'og:description', content: article.seoDescription },
      { property: 'og:type', content: 'article' },
      { property: 'article:published_time', content: article.publishedDate },
    ];
    
    if (article.ogImage || article.coverImage) {
      ogTags.push({ property: 'og:image', content: article.ogImage || article.coverImage });
    }
    
    ogTags.forEach(({ property, content }) => {
      let meta = document.querySelector(`meta[property="${property}"]`);
      if (!meta) {
        meta = document.createElement("meta");
        meta.setAttribute("property", property);
        document.head.appendChild(meta);
      }
      meta.setAttribute("content", content);
    });

    // JSON-LD Schema
    const schema = {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      "headline": article.seoTitle,
      "description": article.seoDescription,
      "image": article.ogImage || article.coverImage,
      "datePublished": article.publishedDate,
      "dateModified": article.updatedDate || article.publishedDate,
      "author": [{
          "@type": "Person",
          "name": article.author.name
      }]
    };
    
    let script = document.querySelector('#article-schema');
    if (!script) {
      script = document.createElement('script');
      script.setAttribute('id', 'article-schema');
      script.setAttribute('type', 'application/ld+json');
      document.head.appendChild(script);
    }
    script.textContent = JSON.stringify(schema);

    window.scrollTo({ top: 0 });

    return () => {
      document.title = "Aditya Kumar Singh — Full-Stack Engineer & AI Builder";
      ogTags.forEach(({ property }) => {
        const el = document.querySelector(`meta[property="${property}"]`);
        if (el) el.remove();
      });
      const schemaEl = document.querySelector('#article-schema');
      if (schemaEl) schemaEl.remove();
    };
  }, [article]);

  // Redirect after hooks run
  if (!article) {
    return <Navigate to="/articles" replace />;
  }

  const related = getRelatedArticles(article, 3);
  const { prev, next } = getAdjacentArticles(article.slug);

  return (
    <div className="min-h-screen bg-background relative">
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

        {/* ── DYNAMIC 3-COLUMN SPLIT STUDIO LAYOUT ───────────────────────── */}
        <div className="w-full px-4 md:px-6 lg:px-8 pb-24 transition-all duration-500 ease-out">
          <div className="max-w-[1720px] mx-auto">
            <div className="flex gap-6 lg:gap-8 items-start justify-center">

              {/* ── SUBTOPICS / TABLE OF CONTENTS ── */}
              {/* Uses layoutId and flex order to continuously glide from right side to left side smoothly */}
              <motion.div
                layout
                layoutId="article-subtopics-toc"
                transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                className={`hidden xl:block sticky top-24 shrink-0 w-64 ${
                  isChatOpen ? "order-1" : "order-3"
                }`}
              >
                <TableOfContents
                  items={tocItems}
                  activeId={activeId}
                  readingTime={article.readingTime}
                  className="w-64 sticky top-24 self-start"
                />
              </motion.div>

              {/* ── CENTER COLUMN: Main Article Content (Full reading width prioritized) ── */}
              <motion.div
                layout
                transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                className="order-2 min-w-0 flex-1 max-w-3xl lg:max-w-4xl"
              >
                <ArticleContent content={article.content} />
                <ArticleShare title={article.title} />
                <RelatedArticles articles={related} />
                <PrevNextNav prev={prev} next={next} />
                <ArticleFooter />
              </motion.div>

              {/* ── RIGHT SIDEBAR: Integrated Articles AI Chat Panel (When OPEN) ── */}
              <AnimatePresence>
                {isChatOpen && (
                  <motion.div
                    key="chatbot-panel"
                    initial={{ opacity: 0, x: 50, scale: 0.96 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: 50, scale: 0.96 }}
                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    className="hidden lg:block order-3 sticky top-24 shrink-0 w-[360px] xl:w-[400px] h-[calc(100vh-7rem)]"
                  >
                    <RAGChatWidget
                      articleSlug={slug}
                      isEmbedded={true}
                      isOpen={true}
                      onClose={() => setIsChatOpen(false)}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

            </div>
          </div>
        </div>
        
        {/* Radial Ambient Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[120px] pointer-events-none -z-10" />
      </main>

      {/* Floating Toggle Button (Handles mobile overlay + desktop toggle) */}
      <div className="fixed bottom-6 right-6 z-50 font-sans">
        {/* Mobile floating widget overlay when open */}
        <div className="lg:hidden">
          <RAGChatWidget
            articleSlug={slug}
            isOpen={isChatOpen}
            setIsOpen={setIsChatOpen}
          />
        </div>

        {/* Desktop Toggle Button */}
        <motion.button
          onClick={() => setIsChatOpen(!isChatOpen)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="hidden lg:flex w-14 h-14 rounded-2xl bg-card border-2 border-foreground items-center justify-center text-foreground shadow-sm hover:shadow-md cursor-pointer hover:bg-secondary transition-all duration-300 relative group overflow-hidden"
          aria-label="Toggle Articles AI chatbot"
          title={isChatOpen ? "Close AI Assistant" : "Open AI Assistant (Split Studio View)"}
        >
          <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-2xl blur-md opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
          {isChatOpen ? (
            <X className="w-6 h-6 relative z-10" />
          ) : (
            <MessageSquare className="w-6 h-6 relative z-10" />
          )}
        </motion.button>
      </div>

      <Footer />
    </div>
  );
}
