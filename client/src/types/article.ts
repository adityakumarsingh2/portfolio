import type { ComponentType } from "react";

export type ArticleCategory =
  | "AI"
  | "Web Development"
  | "System Design"
  | "Startups"
  | "Career"
  | "All";

export interface ArticleTag {
  label: string;
  slug: string;
}

export interface Article {
  /** URL-safe slug, used as route param: /articles/:slug */
  slug: string;
  title: string;
  subtitle: string;
  excerpt: string;
  /**
   * Article body.
   * - "html"  legacy: raw HTML string parsed by ArticleContent
   * - "mdx"   new:    React component produced by @mdx-js/rollup
   */
  content: string | ComponentType;
  /** Discriminates the content field so ArticleContent can route correctly */
  contentSource?: "html" | "mdx";
  coverImage: string;
  publishedDate: string; // ISO 8601
  updatedDate?: string;  // ISO 8601
  category: ArticleCategory;
  tags: string[];
  /** Estimated reading time in minutes */
  readingTime: number;
  wordCount?: number;
  featured: boolean;
  /** Higher = more featured priority when multiple articles are featured */
  featuredPriority?: number;
  draft: boolean;

  /** Content organization */
  series?: string;
  seriesOrder?: number;
  difficulty?: "Beginner" | "Intermediate" | "Advanced";
  audience?: string[];
  collections?: string[];

  /** SEO / OG fields */
  seoTitle: string;
  seoDescription: string;
  ogImage?: string;
  canonicalUrl?: string;
  keywords?: string[];
  lastReviewed?: string; // ISO 8601

  /** Author (future-ready for multi-author) */
  author: {
    name: string;
    avatar?: string;
    title?: string;
  };
}

export type SortOption = "newest" | "oldest" | "reading-time-asc" | "reading-time-desc";

