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
  /** Rich HTML-like content string, rendered by ArticleContent component */
  content: string;
  coverImage: string;
  publishedDate: string; // ISO 8601
  updatedDate?: string;  // ISO 8601
  category: ArticleCategory;
  tags: string[];
  /** Estimated reading time in minutes */
  readingTime: number;
  featured: boolean;
  draft: boolean;
  /** SEO / OG fields */
  seoTitle: string;
  seoDescription: string;
  ogImage?: string;
  /** Author (future-ready for multi-author) */
  author: {
    name: string;
    avatar?: string;
    title?: string;
  };
}

export type SortOption = "newest" | "oldest" | "reading-time-asc" | "reading-time-desc";
