/**
 * scripts/reindex.js
 *
 * Standalone re-indexing script. Can be run directly:
 *   node scripts/reindex.js
 *
 * Also used by the server on startup and the /api/articles/reindex endpoint.
 * Exported as a function so it can be called programmatically.
 */

import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../.env") });

import { parseAllArticles } from "../modules/rag/ingestion/mdx-parser.js";
import { chunkAllArticles } from "../modules/rag/ingestion/chunker.js";
import { embedChunks } from "../modules/rag/ingestion/embedder.js";
import { indexArticles, getCollectionStats } from "../modules/rag/ingestion/indexer.js";

// Shared state so status endpoint can read progress
export const reindexState = {
  isRunning: false,
  lastRun: null,
  lastResult: null,
  error: null,
};

/**
 * Run the full ingestion pipeline.
 * Safe to call multiple times — hash-based diffing prevents redundant work.
 *
 * @returns {Promise<{ indexed, skipped, total, durationMs }>}
 */
export async function reindex() {
  if (reindexState.isRunning) {
    console.log("[reindex] Already running, skipping duplicate call");
    return reindexState.lastResult;
  }

  reindexState.isRunning = true;
  reindexState.error = null;
  const startTime = Date.now();

  try {
    console.log("=== [reindex] Starting article indexing pipeline ===");

    // 1. Parse all MDX files
    const articles = parseAllArticles();
    if (articles.length === 0) {
      console.warn("[reindex] No articles found. Check ARTICLES_DIR path.");
      return { indexed: 0, skipped: 0, total: 0, durationMs: 0 };
    }

    // 2. Chunk articles
    const chunks = chunkAllArticles(articles);
    console.log(`[reindex] Total chunks: ${chunks.length}`);

    // 3. Only embed chunks for articles that have changed
    // (indexer.js will do the diff, but we pre-filter to avoid embedding unchanged articles)
    const { getStoredHashes } = await import("../modules/rag/ingestion/indexer.js");
    const storedHashes = await getStoredHashes();

    const changedArticles = articles.filter(
      (a) => storedHashes.get(a.slug) !== a.hash
    );

    if (changedArticles.length === 0) {
      console.log("[reindex] All articles are up-to-date. Nothing to index.");
      const result = {
        indexed: 0,
        skipped: articles.length,
        total: articles.length,
        durationMs: Date.now() - startTime,
      };
      reindexState.lastResult = result;
      reindexState.lastRun = new Date().toISOString();
      return result;
    }

    console.log(`[reindex] ${changedArticles.length} articles need re-indexing`);
    const changedSlugs = new Set(changedArticles.map((a) => a.slug));
    const chunksToEmbed = chunks.filter((c) => changedSlugs.has(c.article_slug));

    // 4. Embed only changed chunks
    const embeddedChunks = await embedChunks(chunksToEmbed);

    // 5. Upsert into Qdrant (handles deletion of old points internally)
    const result = await indexArticles(articles, embeddedChunks);

    const finalResult = { ...result, durationMs: Date.now() - startTime };
    reindexState.lastResult = finalResult;
    reindexState.lastRun = new Date().toISOString();

    console.log(`=== [reindex] Done in ${finalResult.durationMs}ms ===`);
    return finalResult;
  } catch (error) {
    console.error("[reindex] Pipeline failed:", error);
    reindexState.error = error.message;
    throw error;
  } finally {
    reindexState.isRunning = false;
  }
}

/**
 * Get current indexing status (for /api/articles/status endpoint).
 */
export async function getIndexingStatus() {
  const stats = await getCollectionStats();
  return {
    ...reindexState,
    collection: stats,
  };
}

// Allow running as a standalone script: node scripts/reindex.js
if (process.argv[1] && process.argv[1].endsWith("reindex.js")) {
  console.log("Running reindex as standalone script...");
  reindex()
    .then((result) => {
      console.log("Reindex result:", result);
      process.exit(0);
    })
    .catch((err) => {
      console.error("Reindex failed:", err);
      process.exit(1);
    });
}
