/**
 * lib/content/search.ts
 * Search Provider Pattern — UI never changes, only the provider swaps.
 *
 * Today:   KeywordSearchProvider  (exact keyword match — current behavior)
 * Future:  FuseSearchProvider     (fuzzy search via fuse.js)
 * Future:  MicrocosmSearchProvider (semantic search via Microcosm API)
 */

import type { Article, ArticleCategory, SortOption } from "@/types/article";

// ---------------------------------------------------------------------------
// Provider interface
// ---------------------------------------------------------------------------
export interface SearchProvider {
  /**
   * Returns articles matching the given query string.
   * An empty query returns all articles.
   */
  search(query: string, articles: Article[]): Article[];
}

// ---------------------------------------------------------------------------
// Keyword provider — mirrors the existing filterArticles logic exactly
// ---------------------------------------------------------------------------
export class KeywordSearchProvider implements SearchProvider {
  search(query: string, articles: Article[]): Article[] {
    if (!query.trim()) return articles;
    const q = query.toLowerCase();
    return articles.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        a.excerpt.toLowerCase().includes(q) ||
        a.category.toLowerCase().includes(q) ||
        a.tags.some((t) => t.toLowerCase().includes(q))
    );
  }
}

// ---------------------------------------------------------------------------
// Default provider (swap this import to upgrade search globally)
// ---------------------------------------------------------------------------
export const defaultSearchProvider: SearchProvider = new KeywordSearchProvider();

// ---------------------------------------------------------------------------
// Helper: apply sort + category filter on top of a search result
// ---------------------------------------------------------------------------
export function applySortAndFilter(
  articles: Article[],
  category: ArticleCategory,
  sort: SortOption
): Article[] {
  let result = [...articles];

  if (category !== "All") {
    result = result.filter((a) => a.category === category);
  }

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
