/**
 * modules/rag/pipeline.js
 *
 * RAG pipeline orchestrator.
 * Wires together: query-processor → retriever → generator
 *
 * This is the single entry point called by the route handler.
 */

import { rewriteStandaloneQuery, extractQueryMetadata } from "./retrieval/query-processor.js";
import { retrieve } from "./retrieval/retriever.js";
import { generateStreamingResponse } from "./generation/generator.js";

// ── Response cache ─────────────────────────────────────────────────────────
// Caches completed responses so identical queries never re-hit the Gemini API.
// Key: normalized query + sorted article slugs from retrieval
// TTL: 10 minutes (covers repeated clicks on the same suggestion)

const responseCache = new Map(); // key → { text, sources, webSources, cachedAt }
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

function buildCacheKey(query, chunks) {
  const normalizedQuery = query.trim().toLowerCase().replace(/\s+/g, " ");
  const slugs = [...new Set(chunks.map((c) => c.article_slug))].sort().join(",");
  return `${normalizedQuery}|${slugs}`;
}

function getCached(key) {
  const entry = responseCache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.cachedAt > CACHE_TTL_MS) {
    responseCache.delete(key);
    return null;
  }
  return entry;
}

// Prune stale entries every 15 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of responseCache.entries()) {
    if (now - entry.cachedAt > CACHE_TTL_MS) responseCache.delete(key);
  }
}, 15 * 60 * 1000);

/**
 * Run the full RAG pipeline for a user query.
 *
 * @param {Object} params
 * @param {string} params.query - raw user query
 * @param {Array} params.history - conversation history from session store
 * @param {function} params.onChunk - SSE chunk callback (text)
 * @param {function} params.onDone - SSE done callback ({ sources, webSources })
 * @param {function} params.onError - SSE error callback (error)
 */
export async function runRAGPipeline({ query, history, articleSlug = null, onChunk, onDone, onError }) {
  try {
    console.log(`[pipeline] Query: "${query.slice(0, 80)}..."${articleSlug ? ` [scoped to: ${articleSlug}]` : ""}`);

    // Query rewriting disabled to minimize API calls (RPM).
    const standaloneQuery = query;

    // Step 2: Extract metadata hints for boosting (no API call needed)
    const queryMeta = extractQueryMetadata(standaloneQuery);
    if (queryMeta.tags.length > 0 || queryMeta.categories.length > 0) {
      console.log(`[pipeline] Metadata hints: categories=${queryMeta.categories}, tags=${queryMeta.tags}`);
    }

    // Step 3: Retrieve relevant chunks — scoped to articleSlug if provided
    const chunks = await retrieve(standaloneQuery, queryMeta, undefined, articleSlug);
    console.log(`[pipeline] Retrieved ${chunks.length} chunks`);

    // Step 4: Check response cache before calling Gemini
    const cacheKey = buildCacheKey(standaloneQuery, chunks);
    const cached = getCached(cacheKey);

    if (cached) {
      console.log(`[pipeline] Cache HIT — replaying cached response (${cached.text.length} chars)`);

      // Replay the cached response in chunks to keep SSE experience identical
      const CHUNK_SIZE = 60;
      for (let i = 0; i < cached.text.length; i += CHUNK_SIZE) {
        onChunk(cached.text.slice(i, i + CHUNK_SIZE));
      }
      onDone({ sources: cached.sources, webSources: cached.webSources });
      return;
    }

    console.log(`[pipeline] Cache MISS — calling Gemini`);

    // Step 5: Generate streaming response with grounding
    // Intercept chunks to accumulate full text for caching
    let fullText = "";
    const cachingOnChunk = (text) => {
      fullText += text;
      onChunk(text);
    };

    const cachingOnDone = ({ sources, webSources }) => {
      // Store in cache only if we got a real response
      if (fullText.length > 0) {
        responseCache.set(cacheKey, {
          text: fullText,
          sources,
          webSources,
          cachedAt: Date.now(),
        });
        console.log(`[pipeline] Cached response (${fullText.length} chars, key: "${cacheKey.slice(0, 60)}...")`);
      }
      onDone({ sources, webSources });
    };

    await generateStreamingResponse(
      standaloneQuery,
      chunks,
      history,
      cachingOnChunk,
      cachingOnDone
    );
  } catch (error) {
    console.error("[pipeline] Error:", error.message);
    onError(error);
  }
}
