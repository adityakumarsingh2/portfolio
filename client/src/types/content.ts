import type { ComponentType } from "react";
import type { ArticleCategory } from "./article";

// ---------------------------------------------------------------------------
// Frontmatter — raw shape as parsed from MDX YAML headers
// ---------------------------------------------------------------------------
export interface ArticleFrontmatter {
  title: string;
  subtitle?: string;
  /** URL-safe slug. Falls back to filename if omitted. */
  slug: string;
  /** Short description used for excerpt + SEO description */
  description: string;
  category: string;
  series?: string;
  seriesOrder?: number;
  tags?: string[];
  difficulty?: "Beginner" | "Intermediate" | "Advanced";
  audience?: string[];
  /** ISO 8601 publish date */
  published: string;
  /** ISO 8601 last updated date */
  updated?: string;
  draft?: boolean;
  /** Whether this article is pinned as featured */
  featured?: boolean;
  /** Higher number = higher featured priority (for tie-breaking) */
  featuredPriority?: number;
  /** Pre-computed reading time in minutes (optional; calculated if omitted) */
  readingTime?: number;
  /** Pre-computed word count (optional) */
  wordCount?: number;
  /** Path to cover image (served from /public) e.g. /articles/covers/ai.svg */
  coverImage?: string;
  /** Canonical URL for this article */
  canonical?: string;
  /** Extra keywords for SEO */
  keywords?: string[];
  /** Override SEO title (defaults to "{title} | Aditya Kumar Singh") */
  seoTitle?: string;
  /** Override SEO description (defaults to description) */
  seoDescription?: string;
  author?: {
    name: string;
    avatar?: string;
    title?: string;
  };
}

// ---------------------------------------------------------------------------
// MDX Module — shape of an eagerly-imported *.mdx file
// ---------------------------------------------------------------------------
export interface MDXModule {
  default: ComponentType;
  frontmatter: ArticleFrontmatter;
}

// ---------------------------------------------------------------------------
// Category metadata
// ---------------------------------------------------------------------------
export interface CategoryMeta {
  slug: string;
  label: ArticleCategory;
  description: string;
  color: string;
  icon: string;
}

// ---------------------------------------------------------------------------
// Series metadata
// ---------------------------------------------------------------------------
export interface SeriesMeta {
  slug: string;
  label: string;
  description: string;
  articleCount: number;
  publishedCount: number;
}

// ---------------------------------------------------------------------------
// Search index — flat, search-optimised representation of an article
// ---------------------------------------------------------------------------
export interface SearchIndex {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  tags: string[];
  publishedDate: string;
  /** Plain-text body stripped of markup — used for full-text search */
  body?: string;
}

// ---------------------------------------------------------------------------
// CMS Adapter — interface for future content sources
// ---------------------------------------------------------------------------
export interface CMSAdapter {
  getArticle(slug: string): Promise<import("./article").Article | undefined>;
  getArticles(): Promise<import("./article").Article[]>;
  getCategories(): Promise<CategoryMeta[]>;
  getSeries(): Promise<SeriesMeta[]>;
  getTags(): Promise<string[]>;
}
