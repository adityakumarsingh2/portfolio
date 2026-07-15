/**
 * Strips HTML tags from a string to get plain text.
 */
export function stripHtml(html: string): string {
  // Simple regex to remove tags. Not perfect, but enough for word count estimation.
  return html.replace(/<[^>]*>?/gm, " ");
}

/**
 * Calculates the word count of a given HTML or plain text string.
 */
export function calculateWordCount(text: string, isHtml = true): number {
  const plainText = isHtml ? stripHtml(text) : text;
  const words = plainText.trim().split(/\s+/);
  return words.filter((word) => word.length > 0).length;
}

/**
 * Calculates estimated reading time in minutes.
 * Assuming average reading speed of 225 words per minute.
 */
export function calculateReadingTime(wordCount: number, wordsPerMinute = 225): number {
  const minutes = Math.ceil(wordCount / wordsPerMinute);
  return Math.max(1, minutes); // Always at least 1 minute
}
