/**
 * content/articles/index.ts
 * Public API boundary — unchanged contract for all components and hooks.
 *
 * Previously: imported from ./data (static TypeScript objects with HTML strings)
 * Now:        re-exports from ../loader (MDX-backed, via import.meta.glob)
 *
 * Zero import path changes required in any component or hook.
 */

export {
  // Core exports consumed by hooks + components
  articles,
  getArticleBySlug,
  getFeaturedArticle,
  getLatestArticles,
  getRelatedArticles,
  getAdjacentArticles,
  filterArticles,
  getUsedCategories,
  getAllTags,
  getUniqueTopicCount,
  getArticlesInSeries,
  getCollectionArticles,

  // New APIs (for category + series pages)
  getCategories,
  getAllSeries,
  getSeriesArticlesBySlug,
  getCategoryArticlesBySlug,

  // Backward compat alias
  articlesData,
} from "../loader";
