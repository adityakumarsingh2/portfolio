/**
 * content/loader.ts
 * Single source of truth for all article data.
 *
 * Uses Vite's import.meta.glob with { eager: true } to load all MDX modules
 * synchronously at import time — keeping the public API 100% synchronous
 * so zero hooks or components need to change.
 *
 * To add a new article: drop a *.mdx file in src/content/articles/.
 * No registration needed.
 */

import type { ComponentType } from "react";
import type { Article, ArticleCategory, SortOption } from "@/types/article";
import type { ArticleFrontmatter, MDXModule, CategoryMeta, SeriesMeta } from "@/types/content";
import { calculateReadingTime, calculateWordCount, stripMarkdown } from "@/lib/content/reading";
import { slugFromPath, categoryToSlug, seriesToSlug } from "@/lib/content/slugify";
import { CATEGORY_META, getCategoryMeta } from "@/lib/content/categories";
import { defaultSearchProvider, applySortAndFilter } from "@/lib/content/search";

// ---------------------------------------------------------------------------
// Eager glob — all *.mdx modules loaded at import time (synchronous API)
// ---------------------------------------------------------------------------
const mdxModules = import.meta.glob<MDXModule>("./articles/*.mdx", {
  eager: true,
});

// ---------------------------------------------------------------------------
// Transform frontmatter + MDX component → Article shape
// ---------------------------------------------------------------------------
function frontmatterToArticle(
  fm: ArticleFrontmatter,
  Component: ComponentType,
  filePath: string
): Article {
  if (!fm) {
    console.error(`Missing frontmatter in file: ${filePath}`);
    // return a dummy article or throw a better error
    throw new Error(`Missing frontmatter in file: ${filePath}`);
  }
  const slug = fm.slug || slugFromPath(filePath);
  const readingTime =
    fm.readingTime ??
    calculateReadingTime(fm.wordCount ?? calculateWordCount(fm.description));

  return {
    slug,
    title: fm.title,
    subtitle: fm.subtitle ?? "",
    excerpt: fm.description,
    content: Component,
    contentSource: "mdx",
    coverImage: fm.coverImage ?? "",
    publishedDate: fm.published,
    updatedDate: fm.updated,
    category: fm.category as ArticleCategory,
    tags: fm.tags ?? [],
    readingTime,
    wordCount: fm.wordCount,
    featured: fm.featured ?? (fm.featuredPriority != null && fm.featuredPriority > 0),
    featuredPriority: fm.featuredPriority,
    draft: fm.draft ?? false,
    series: fm.series,
    seriesOrder: fm.seriesOrder,
    difficulty: fm.difficulty,
    audience: fm.audience,
    seoTitle: fm.seoTitle ?? `${fm.title} | Aditya Kumar Singh`,
    seoDescription: fm.seoDescription ?? fm.description,
    ogImage: fm.coverImage,
    canonicalUrl: fm.canonical,
    keywords: fm.keywords,
    author: fm.author ?? {
      name: "Aditya Kumar Singh",
      title: "Full-Stack Engineer & AI Builder",
    },
  };
}

// ---------------------------------------------------------------------------
// Build and cache the articles array
// ---------------------------------------------------------------------------
const _allArticles: Article[] = Object.entries(mdxModules)
  .map(([path, mod]) => frontmatterToArticle(mod.frontmatter, mod.default, path))
  .sort(
    (a, b) =>
      new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime()
  );

/** All non-draft articles, sorted newest first */
export const articles: Article[] = _allArticles.filter((a) => !a.draft);

// ---------------------------------------------------------------------------
// Public API — identical contract to the previous content/articles/index.ts
// ---------------------------------------------------------------------------

/** Get a single article by its URL slug */
export function getArticleBySlug(slug: string): Article | undefined {
  return articles.find((a) => a.slug === slug);
}

/** Get the single featured article (highest featuredPriority, or first marked featured) */
export function getFeaturedArticle(): Article | undefined {
  const featured = articles.filter((a) => a.featured);
  if (featured.length === 0) return undefined;
  return featured.sort(
    (a, b) => (b.featuredPriority ?? 0) - (a.featuredPriority ?? 0)
  )[0];
}

/** Get all non-featured articles */
export function getLatestArticles(): Article[] {
  return articles.filter((a) => !a.featured);
}

/** Get related articles based on shared category and tags */
export function getRelatedArticles(current: Article, limit = 3): Article[] {
  return articles
    .filter((a) => a.slug !== current.slug)
    .map((a) => {
      const categoryScore = a.category === current.category ? 2 : 0;
      const tagScore = a.tags.filter((t) => current.tags.includes(t)).length;
      return { article: a, score: categoryScore + tagScore };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((r) => r.article);
}

/** Get the previous and next articles (sorted by publishedDate desc) */
export function getAdjacentArticles(slug: string): {
  prev: Article | null;
  next: Article | null;
} {
  const sorted = [...articles].sort(
    (a, b) =>
      new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime()
  );
  const idx = sorted.findIndex((a) => a.slug === slug);
  return {
    prev: idx > 0 ? sorted[idx - 1] : null,
    next: idx < sorted.length - 1 ? sorted[idx + 1] : null,
  };
}

/** Search and filter articles — delegates to the search provider */
export function filterArticles(
  query: string,
  category: ArticleCategory,
  sort: SortOption
): Article[] {
  const searched = defaultSearchProvider.search(query, articles);
  return applySortAndFilter(searched, category, sort);
}

/** All unique categories that have at least one article */
export function getUsedCategories(): ArticleCategory[] {
  const cats = new Set(articles.map((a) => a.category));
  return Array.from(cats);
}

/** All unique tags across all articles */
export function getAllTags(): string[] {
  const tags = new Set(articles.flatMap((a) => a.tags));
  return Array.from(tags).sort();
}

/** Total number of unique topics (tags) */
export function getUniqueTopicCount(): number {
  return getAllTags().length;
}

/** All articles in a specific series, ordered by seriesOrder */
export function getArticlesInSeries(seriesName: string): Article[] {
  return articles
    .filter((a) => a.series === seriesName)
    .sort((a, b) => (a.seriesOrder ?? 0) - (b.seriesOrder ?? 0));
}

/** All articles belonging to a specific collection */
export function getCollectionArticles(collectionName: string): Article[] {
  return articles.filter((a) => a.collections?.includes(collectionName));
}

// ---------------------------------------------------------------------------
// New APIs (not in legacy index.ts)
// ---------------------------------------------------------------------------

/** Category metadata for all categories that have articles */
export function getCategories(): CategoryMeta[] {
  const usedCats = getUsedCategories();
  return usedCats
    .map((cat) => getCategoryMeta(cat))
    .filter((c): c is CategoryMeta => c !== undefined);
}

/** All unique series with metadata */
export function getAllSeries(): SeriesMeta[] {
  const seriesMap = new Map<string, Article[]>();
  articles.forEach((a) => {
    if (a.series) {
      const existing = seriesMap.get(a.series) ?? [];
      seriesMap.set(a.series, [...existing, a]);
    }
  });

  return Array.from(seriesMap.entries()).map(([name, arts]) => ({
    slug: seriesToSlug(name),
    label: name,
    description: `A ${arts.length}-part series on ${name}.`,
    articleCount: arts.length,
    publishedCount: arts.filter((a) => !a.draft).length,
  }));
}

/** Get articles in a series by series slug (e.g. "building-production-rag") */
export function getSeriesArticlesBySlug(seriesSlug: string): Article[] {
  const allSeries = getAllSeries();
  const series = allSeries.find((s) => s.slug === seriesSlug);
  if (!series) return [];
  return getArticlesInSeries(series.label);
}

/** Category articles by category slug (e.g. "web-development") */
export function getCategoryArticlesBySlug(catSlug: string): Article[] {
  const slug = catSlug.toLowerCase();
  return articles.filter((a) => categoryToSlug(a.category) === slug);
}

// Re-export for backward compatibility
export { articles as articlesData };
