/**
 * lib/content/metadata.ts
 * Centralised SEO metadata builders.
 * Every page type has a dedicated builder — no ad-hoc meta in components.
 */

import type { Article } from "@/types/article";
import type { CategoryMeta, SeriesMeta } from "@/types/content";

const SITE_URL = "https://adityakumarsingh.tech";
const SITE_NAME = "Aditya Kumar Singh";
const DEFAULT_OG = `${SITE_URL}/og-image.png`;

export interface PageMeta {
  title: string;
  description: string;
  canonical: string;
  og: {
    title: string;
    description: string;
    image: string;
    type: string;
  };
  twitter: {
    card: string;
    title: string;
    description: string;
    image: string;
  };
}

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

// ---------------------------------------------------------------------------
// Article schema (JSON-LD)
// ---------------------------------------------------------------------------
export function buildArticleJsonLd(article: Article): object {
  return {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: article.seoTitle,
    description: article.seoDescription,
    image: article.ogImage || article.coverImage || DEFAULT_OG,
    datePublished: article.publishedDate,
    dateModified: article.updatedDate || article.publishedDate,
    author: [
      {
        "@type": "Person",
        name: article.author.name,
        url: SITE_URL,
      },
    ],
    publisher: {
      "@type": "Person",
      name: SITE_NAME,
      url: SITE_URL,
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": article.canonicalUrl || `${SITE_URL}/articles/${article.slug}`,
    },
    keywords: article.keywords?.join(", ") || article.tags.join(", "),
    articleSection: article.category,
    ...(article.wordCount && { wordCount: article.wordCount }),
  };
}

// ---------------------------------------------------------------------------
// Breadcrumb schema (JSON-LD)
// ---------------------------------------------------------------------------
export function buildBreadcrumbJsonLd(items: BreadcrumbItem[]): object {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.label,
      ...(item.href && { item: `${SITE_URL}${item.href}` }),
    })),
  };
}

// ---------------------------------------------------------------------------
// Article page meta
// ---------------------------------------------------------------------------
export function buildArticleMeta(article: Article): PageMeta {
  const image = article.ogImage || article.coverImage || DEFAULT_OG;
  const canonical =
    article.canonicalUrl || `${SITE_URL}/articles/${article.slug}`;
  return {
    title: article.seoTitle,
    description: article.seoDescription,
    canonical,
    og: {
      title: article.seoTitle,
      description: article.seoDescription,
      image,
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: article.seoTitle,
      description: article.seoDescription,
      image,
    },
  };
}

// ---------------------------------------------------------------------------
// Category page meta
// ---------------------------------------------------------------------------
export function buildCategoryMeta(
  category: CategoryMeta,
  articleCount: number
): PageMeta {
  const title = `${category.label} Articles | ${SITE_NAME}`;
  const description = `${category.description} — ${articleCount} article${articleCount !== 1 ? "s" : ""}.`;
  const canonical = `${SITE_URL}/articles/category/${category.slug}`;
  return {
    title,
    description,
    canonical,
    og: { title, description, image: DEFAULT_OG, type: "website" },
    twitter: { card: "summary_large_image", title, description, image: DEFAULT_OG },
  };
}

// ---------------------------------------------------------------------------
// Series page meta
// ---------------------------------------------------------------------------
export function buildSeriesMeta(series: SeriesMeta): PageMeta {
  const title = `${series.label} — Article Series | ${SITE_NAME}`;
  const description = series.description;
  const canonical = `${SITE_URL}/articles/series/${series.slug}`;
  return {
    title,
    description,
    canonical,
    og: { title, description, image: DEFAULT_OG, type: "website" },
    twitter: { card: "summary_large_image", title, description, image: DEFAULT_OG },
  };
}
