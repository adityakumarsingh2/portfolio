/**
 * modules/rag/ingestion/chunker.js
 *
 * Markdown-aware chunker for MDX article sections.
 * Each chunk:
 *   - Contains one section (split at h2/h3 boundaries from the parser)
 *   - Has the article title + section heading prepended for context enrichment
 *   - Is within 300–700 token range (estimated ~4 chars/token)
 *   - Overlapping tail from previous chunk is prepended if section > max size
 */

const MAX_CHUNK_CHARS = 2800; // ~700 tokens
const MIN_CHUNK_CHARS = 80;   // skip trivially short sections
const OVERLAP_SENTENCES = 2;  // sentences to carry over between sub-chunks

/**
 * Estimate token count (rough: 1 token ≈ 4 characters for English)
 */
function estimateTokens(text) {
  return Math.ceil(text.length / 4);
}

/**
 * Extract the last N sentences from text for overlap.
 */
function getLastNSentences(text, n) {
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [];
  return sentences.slice(-n).join(" ").trim();
}

/**
 * Split a long section into smaller sub-chunks with sentence-level overlap.
 */
function splitLongSection(contextPrefix, sectionText) {
  const chunks = [];
  const paragraphs = sectionText.split(/\n\n+/);
  let current = "";
  let previousTail = "";

  for (const para of paragraphs) {
    const candidate = previousTail
      ? `${current}\n\n${para}`
      : current
      ? `${current}\n\n${para}`
      : para;

    if (candidate.length > MAX_CHUNK_CHARS && current.length > 0) {
      chunks.push(`${contextPrefix}\n\n${previousTail ? previousTail + "\n\n" : ""}${current}`);
      previousTail = getLastNSentences(current, OVERLAP_SENTENCES);
      current = para;
    } else {
      current = candidate;
    }
  }

  if (current.length > MIN_CHUNK_CHARS) {
    chunks.push(`${contextPrefix}\n\n${previousTail ? previousTail + "\n\n" : ""}${current}`);
  }

  return chunks;
}

/**
 * Convert a parsed article into an array of chunks ready for embedding.
 *
 * @param {Object} article - output from parseMDXFile()
 * @returns {Array<{ chunk_id, article_slug, article_title, section, text, chunk_index, metadata }>}
 */
export function chunkArticle(article) {
  const chunks = [];
  let chunkIndex = 0;

  // Always include a "summary" chunk from the description + first 300 chars of raw content
  const introText = [
    `# ${article.title}`,
    article.subtitle ? `*${article.subtitle}*` : "",
    article.description,
  ]
    .filter(Boolean)
    .join("\n\n");

  if (introText.length > MIN_CHUNK_CHARS) {
    chunks.push({
      chunk_id: `${article.slug}-intro`,
      article_slug: article.slug,
      article_title: article.title,
      section: "Introduction",
      text: introText,
      chunk_index: chunkIndex++,
      metadata: {
        category: article.category,
        tags: article.tags,
        difficulty: article.difficulty,
        audience: article.audience,
        published_at: article.publishedAt,
        article_hash: article.hash,
      },
    });
  }

  // Process each section
  for (const section of article.sections) {
    if (section.text.length < MIN_CHUNK_CHARS) continue;

    // Context prefix ensures the LLM knows which article/section this came from
    const contextPrefix = `Article: "${article.title}" | Section: "${section.heading}"`;

    if (section.text.length <= MAX_CHUNK_CHARS) {
      // Single chunk for this section
      const text = `${contextPrefix}\n\n${section.text}`;
      chunks.push({
        chunk_id: `${article.slug}-${chunkIndex}`,
        article_slug: article.slug,
        article_title: article.title,
        section: section.heading,
        text,
        chunk_index: chunkIndex++,
        metadata: {
          category: article.category,
          tags: article.tags,
          difficulty: article.difficulty,
          audience: article.audience,
          published_at: article.publishedAt,
          article_hash: article.hash,
        },
      });
    } else {
      // Split long section into overlapping sub-chunks
      const subChunks = splitLongSection(contextPrefix, section.text);
      for (const subText of subChunks) {
        chunks.push({
          chunk_id: `${article.slug}-${chunkIndex}`,
          article_slug: article.slug,
          article_title: article.title,
          section: section.heading,
          text: subText,
          chunk_index: chunkIndex++,
          metadata: {
            category: article.category,
            tags: article.tags,
            difficulty: article.difficulty,
            audience: article.audience,
            published_at: article.publishedAt,
            article_hash: article.hash,
          },
        });
      }
    }
  }

  console.log(
    `[chunker] "${article.title}" → ${chunks.length} chunks ` +
    `(avg ${Math.round(chunks.reduce((s, c) => s + estimateTokens(c.text), 0) / chunks.length)} tokens)`
  );

  return chunks;
}

/**
 * Chunk all articles.
 * @param {Array} articles - array of parsed article objects
 * @returns {Array} flat array of all chunks
 */
export function chunkAllArticles(articles) {
  return articles.flatMap(chunkArticle);
}
