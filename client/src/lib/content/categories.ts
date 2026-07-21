/**
 * lib/content/categories.ts
 * Static category metadata — descriptions, colors, icons.
 * Add new categories here; the UI picks them up automatically.
 */

import type { ArticleCategory } from "@/types/article";
import type { CategoryMeta } from "@/types/content";

export const CATEGORY_META: Record<string, CategoryMeta> = {
  "ai": {
    slug: "ai",
    label: "AI",
    description:
      "Artificial intelligence, LLMs, RAG systems, embeddings, and production ML engineering.",
    color: "#8B5CF6",
    icon: "brain",
  },
  "web-development": {
    slug: "web-development",
    label: "Web Development",
    description:
      "React, TypeScript, full-stack architecture, performance, and modern frontend patterns.",
    color: "#06B6D4",
    icon: "code",
  },
  "system-design": {
    slug: "system-design",
    label: "System Design",
    description:
      "API design, distributed systems, scalability patterns, and production engineering.",
    color: "#F59E0B",
    icon: "layers",
  },
  "startups": {
    slug: "startups",
    label: "Startups",
    description:
      "Building products, early-stage decisions, indie hacking, and startup lessons.",
    color: "#10B981",
    icon: "rocket",
  },
  "career": {
    slug: "career",
    label: "Career",
    description:
      "Software engineering career growth, interviews, networking, and learning strategies.",
    color: "#F43F5E",
    icon: "user",
  },
} as const;

/** Returns CategoryMeta for a given category label (e.g. "AI") or slug (e.g. "ai"). */
export function getCategoryMeta(labelOrSlug: string): CategoryMeta | undefined {
  // Try by slug first
  if (CATEGORY_META[labelOrSlug.toLowerCase()]) {
    return CATEGORY_META[labelOrSlug.toLowerCase()];
  }
  // Try by label
  return Object.values(CATEGORY_META).find(
    (c) => c.label.toLowerCase() === labelOrSlug.toLowerCase()
  );
}

/** Returns the label (ArticleCategory) for a given slug, e.g. "web-development" → "Web Development" */
export function slugToCategory(slug: string): ArticleCategory {
  const meta = getCategoryMeta(slug);
  return (meta?.label ?? slug) as ArticleCategory;
}

export const ALL_CATEGORY_SLUGS = Object.keys(CATEGORY_META);
