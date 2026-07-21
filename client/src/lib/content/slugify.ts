/**
 * lib/content/slugify.ts
 * Deterministic slug generation for categories, series, and tags.
 */

/** Converts any string to a URL-safe slug. */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")   // remove non-word chars (except hyphens)
    .replace(/[\s_]+/g, "-")    // spaces/underscores → hyphens
    .replace(/-+/g, "-")        // collapse multiple hyphens
    .replace(/^-+|-+$/g, "");   // trim leading/trailing hyphens
}

/** "Web Development" → "web-development" */
export function categoryToSlug(category: string): string {
  return slugify(category);
}

/** "Building Production RAG" → "building-production-rag" */
export function seriesToSlug(series: string): string {
  return slugify(series);
}

/** "React Hooks" → "react-hooks" */
export function tagToSlug(tag: string): string {
  return slugify(tag);
}

/** Derives a slug from an MDX file path: "./articles/my-article.mdx" → "my-article" */
export function slugFromPath(filePath: string): string {
  return filePath
    .replace(/^.*\//, "")  // strip directory
    .replace(/\.mdx?$/, ""); // strip extension
}
