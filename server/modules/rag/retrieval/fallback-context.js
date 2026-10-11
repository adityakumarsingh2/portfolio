/**
 * modules/rag/retrieval/fallback-context.js
 *
 * Local fallback context for article-scoped queries when vector retrieval fails.
 */

import { parseAllArticles } from "../ingestion/mdx-parser.js";

const MAX_FALLBACK_TEXT_CHARS = 12000;
let cachedArticles = null;

function getArticles() {
  if (!cachedArticles) {
    cachedArticles = parseAllArticles();
  }
  return cachedArticles;
}

export function getFallbackChunksForArticle(articleSlug) {
  if (!articleSlug || typeof articleSlug !== "string") return [];

  const article = getArticles().find((entry) => entry.slug === articleSlug);
  if (!article) return [];

  const text = (article.rawContent || "").trim().slice(0, MAX_FALLBACK_TEXT_CHARS);
  if (!text) return [];

  return [
    {
      chunk_id: `fallback-${article.slug}`,
      article_slug: article.slug,
      article_title: article.title || article.slug,
      section: "Full Article (Fallback)",
      text,
      category: article.category || "General",
      tags: Array.isArray(article.tags) ? article.tags : [],
      confidenceTier: "Fallback",
      score: 0.001,
    },
  ];
}

export function __resetFallbackArticleCacheForTests() {
  cachedArticles = null;
}

