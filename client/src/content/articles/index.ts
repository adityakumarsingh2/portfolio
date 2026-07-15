import type { Article, ArticleCategory, SortOption } from "@/types/article";
import { articlesData } from "./data";

// ── Public API ────────────────────────────────────────────────────────────────

/** All non-draft articles */
export const articles: Article[] = articlesData.filter((a) => !a.draft);

/** Get a single article by its URL slug */
export function getArticleBySlug(slug: string): Article | undefined {
  return articles.find((a) => a.slug === slug);
}

/** Get the single featured article (first one marked featured) */
export function getFeaturedArticle(): Article | undefined {
  return articles.find((a) => a.featured);
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
    (a, b) => new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime()
  );
  const idx = sorted.findIndex((a) => a.slug === slug);
  return {
    prev: idx > 0 ? sorted[idx - 1] : null,
    next: idx < sorted.length - 1 ? sorted[idx + 1] : null,
  };
}

/** Search and filter articles */
export function filterArticles(
  query: string,
  category: ArticleCategory,
  sort: SortOption
): Article[] {
  let result = [...articles];

  // Filter by category
  if (category !== "All") {
    result = result.filter((a) => a.category === category);
  }

  // Full-text search across title, excerpt, tags, category
  if (query.trim()) {
    const q = query.toLowerCase();
    result = result.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        a.excerpt.toLowerCase().includes(q) ||
        a.category.toLowerCase().includes(q) ||
        a.tags.some((t) => t.toLowerCase().includes(q))
    );
  }

  // Sort
  switch (sort) {
    case "oldest":
      result.sort(
        (a, b) =>
          new Date(a.publishedDate).getTime() - new Date(b.publishedDate).getTime()
      );
      break;
    case "reading-time-asc":
      result.sort((a, b) => a.readingTime - b.readingTime);
      break;
    case "reading-time-desc":
      result.sort((a, b) => b.readingTime - a.readingTime);
      break;
    case "newest":
    default:
      result.sort(
        (a, b) =>
          new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime()
      );
  }

  return result;
}

/** Get all unique categories that have at least one article */
export function getUsedCategories(): ArticleCategory[] {
  const cats = new Set(articles.map((a) => a.category));
  return Array.from(cats);
}

/** All unique tags across all articles */
export function getAllTags(): string[] {
  const tags = new Set(articles.flatMap((a) => a.tags));
  return Array.from(tags).sort();
}

/** Get the total number of unique topics (tags) */
export function getUniqueTopicCount(): number {
  return getAllTags().length;
}

/** Get all articles in a specific series, ordered by seriesOrder */
export function getArticlesInSeries(seriesName: string): Article[] {
  return articles
    .filter((a) => a.series === seriesName)
    .sort((a, b) => (a.seriesOrder ?? 0) - (b.seriesOrder ?? 0));
}

/** Get all articles belonging to a specific collection */
export function getCollectionArticles(collectionName: string): Article[] {
  return articles.filter((a) => a.collections?.includes(collectionName));
}

export { articlesData };
