/**
 * lib/content/reading.ts
 * Reading time + word count utilities.
 * Extends the existing lib/content.ts utilities.
 */

const WORDS_PER_MINUTE = 225;

/** Strips HTML tags from a string to get plain text. */
export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>?/gm, " ");
}

/** Strips basic Markdown/MDX syntax to get plain text for counting. */
export function stripMarkdown(md: string): string {
  return md
    .replace(/^---[\s\S]*?---/m, "")         // frontmatter
    .replace(/```[\s\S]*?```/g, " ")         // fenced code blocks
    .replace(/`[^`]+`/g, " ")               // inline code
    .replace(/!\[.*?\]\(.*?\)/g, " ")       // images
    .replace(/\[([^\]]+)\]\([^\)]+\)/g, "$1") // links → link text
    .replace(/#{1,6}\s+/g, "")              // headings
    .replace(/[*_~]{1,3}/g, "")             // bold, italic, strikethrough
    .replace(/^\s*[-*+]\s+/gm, "")          // list bullets
    .replace(/^\s*\d+\.\s+/gm, "")          // ordered list numbers
    .replace(/>\s+/g, "")                   // blockquotes
    .replace(/<[^>]*>/g, "");               // remaining HTML tags
}

/** Calculates the word count of a plain-text or HTML string. */
export function calculateWordCount(text: string, isHtml = false): number {
  const plain = isHtml ? stripHtml(text) : text;
  const words = plain.trim().split(/\s+/);
  return words.filter((w) => w.length > 0).length;
}

/** Calculates estimated reading time in minutes (always ≥ 1 minute). */
export function calculateReadingTime(
  wordCount: number,
  wordsPerMinute = WORDS_PER_MINUTE
): number {
  return Math.max(1, Math.ceil(wordCount / wordsPerMinute));
}
