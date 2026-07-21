/**
 * lib/content/cms.ts
 * CMS Adapter interface — the only thing that changes when we migrate
 * from MDX files to Sanity / Contentful / Microcosm.
 *
 * Today: MDXAdapter (backed by import.meta.glob in loader.ts)
 * Tomorrow: SanityAdapter, ContentfulAdapter, MicrocosmAdapter
 */

import type { Article, ArticleCategory, SortOption } from "@/types/article";
import type { CategoryMeta, SeriesMeta } from "@/types/content";

// ---------------------------------------------------------------------------
// Adapter contract
// ---------------------------------------------------------------------------
export interface CMSAdapter {
  getArticle(slug: string): Promise<Article | undefined>;
  getArticles(): Promise<Article[]>;
  getCategories(): Promise<CategoryMeta[]>;
  getSeries(): Promise<SeriesMeta[]>;
  getTags(): Promise<string[]>;
  filterArticles(
    query: string,
    category: ArticleCategory,
    sort: SortOption
  ): Promise<Article[]>;
}

// ---------------------------------------------------------------------------
// MDX Adapter — delegates to the synchronous loader
// This adapter is a thin async wrapper so future adapters
// can be truly async (API calls, GraphQL, etc.)
// ---------------------------------------------------------------------------
export class MDXAdapter implements CMSAdapter {
  private loader: typeof import("@/content/loader");

  constructor(loader: typeof import("@/content/loader")) {
    this.loader = loader;
  }

  async getArticle(slug: string) {
    return this.loader.getArticleBySlug(slug);
  }

  async getArticles() {
    return this.loader.articles;
  }

  async getCategories() {
    return this.loader.getCategories();
  }

  async getSeries() {
    return this.loader.getAllSeries();
  }

  async getTags() {
    return this.loader.getAllTags();
  }

  async filterArticles(
    query: string,
    category: ArticleCategory,
    sort: SortOption
  ) {
    return this.loader.filterArticles(query, category, sort);
  }
}

// ---------------------------------------------------------------------------
// Future adapters (stubs — uncomment and implement when needed)
// ---------------------------------------------------------------------------

// export class SanityAdapter implements CMSAdapter { ... }
// export class MicrocosmAdapter implements CMSAdapter {
//   // Will support: embeddings, knowledge graph, semantic search,
//   // backlinks, referenced concepts, collections, knowledge spaces
// }
