/**
 * modules/rag/ingestion/indexer.js
 *
 * Manages the Qdrant collection lifecycle and handles incremental upserts.
 *
 * Strategy:
 *   - Collection: "articles_chunks" with 768-dim cosine vectors
 *   - Hash-based diffing: only re-index articles whose MD5 hash changed
 *   - Point IDs: deterministic UUIDs derived from chunk_id (no random IDs)
 *   - Payload includes all metadata for filtering + source attribution
 */

import { QdrantClient } from "@qdrant/js-client-rest";
import { createHash } from "crypto";

const COLLECTION_NAME = "articles_chunks";
const VECTOR_SIZE = 3072; // gemini-embedding-001 output dimensions
const UPSERT_BATCH_SIZE = 50;

let _client = null;

function getClient() {
  if (!_client) {
    const url = process.env.QDRANT_URL;
    const apiKey = process.env.QDRANT_API_KEY;
    if (!url) throw new Error("QDRANT_URL not set in environment variables");
    _client = new QdrantClient({ url, apiKey });
  }
  return _client;
}

/**
 * Convert a string chunk_id to a deterministic UUID v4-like format.
 * Qdrant requires UUIDs or unsigned integers for point IDs.
 */
function chunkIdToUUID(chunkId) {
  const hash = createHash("md5").update(chunkId).digest("hex");
  return [
    hash.slice(0, 8),
    hash.slice(8, 12),
    "4" + hash.slice(13, 16), // version 4
    ((parseInt(hash.slice(16, 18), 16) & 0x3f) | 0x80).toString(16) + hash.slice(18, 20),
    hash.slice(20, 32),
  ].join("-");
}

/**
 * Ensure the Qdrant collection exists with the correct config.
 * If it doesn't exist, creates it. If it exists, leaves it unchanged.
 */
export async function ensureCollection() {
  const client = getClient();

  try {
    const info = await client.getCollection(COLLECTION_NAME);
    const existingDim = info.config?.params?.vectors?.size;

    if (existingDim && existingDim !== VECTOR_SIZE) {
      console.warn(
        `[indexer] Dimension mismatch: collection has ${existingDim}, need ${VECTOR_SIZE}. Recreating collection...`
      );
      await client.deleteCollection(COLLECTION_NAME);
      throw new Error("recreate"); // fall through to creation block
    }

    console.log(`[indexer] Collection "${COLLECTION_NAME}" already exists (dim: ${existingDim})`);
  } catch (err) {
    if (err.message !== "recreate" && !err.message?.includes("Not found") && err.status !== 404) {
      throw err;
    }
    console.log(`[indexer] Creating collection "${COLLECTION_NAME}" (dim: ${VECTOR_SIZE})...`);
    await client.createCollection(COLLECTION_NAME, {
      vectors: {
        size: VECTOR_SIZE,
        distance: "Cosine",
      },
      optimizers_config: {
        default_segment_number: 2,
      },
    });

    // Create payload indexes for efficient filtering
    await client.createPayloadIndex(COLLECTION_NAME, {
      field_name: "article_slug",
      field_schema: "keyword",
    });
    await client.createPayloadIndex(COLLECTION_NAME, {
      field_name: "category",
      field_schema: "keyword",
    });
    await client.createPayloadIndex(COLLECTION_NAME, {
      field_name: "tags",
      field_schema: "keyword",
    });
    await client.createPayloadIndex(COLLECTION_NAME, {
      field_name: "article_hash",
      field_schema: "keyword",
    });

    console.log(`[indexer] Collection created with payload indexes`);
  }
}

/**
 * Get the stored article_hash for all articles currently in the collection.
 * Returns a Map<slug, hash>.
 */
export async function getStoredHashes() {
  const client = getClient();
  const hashMap = new Map();

  try {
    // Scroll through all points to get their article_slug + article_hash
    let offset = null;
    do {
      const result = await client.scroll(COLLECTION_NAME, {
        limit: 250,
        offset,
        with_payload: ["article_slug", "article_hash"],
        with_vector: false,
      });

      for (const point of result.points) {
        const slug = point.payload?.article_slug;
        const hash = point.payload?.article_hash;
        if (slug && hash && !hashMap.has(slug)) {
          hashMap.set(slug, hash);
        }
      }

      offset = result.next_page_offset;
    } while (offset !== null && offset !== undefined);
  } catch (error) {
    console.warn("[indexer] Could not fetch stored hashes:", error.message);
  }

  return hashMap;
}

/**
 * Delete all points belonging to a specific article slug.
 */
async function deleteArticlePoints(slug) {
  const client = getClient();
  await client.delete(COLLECTION_NAME, {
    filter: {
      must: [
        { key: "article_slug", match: { value: slug } },
      ],
    },
  });
  console.log(`[indexer] Deleted existing points for slug: ${slug}`);
}

/**
 * Upsert embedded chunks into Qdrant in batches.
 * @param {Array<{ chunk_id, vector, article_slug, article_title, section, text, metadata }>} embeddedChunks
 */
async function upsertChunks(embeddedChunks) {
  const client = getClient();

  const points = embeddedChunks.map((chunk) => ({
    id: chunkIdToUUID(chunk.chunk_id),
    vector: chunk.vector,
    payload: {
      chunk_id: chunk.chunk_id,
      article_slug: chunk.article_slug,
      article_title: chunk.article_title,
      section: chunk.section,
      text: chunk.text,
      chunk_index: chunk.chunk_index,
      category: chunk.metadata.category,
      tags: chunk.metadata.tags,
      difficulty: chunk.metadata.difficulty,
      audience: chunk.metadata.audience,
      published_at: chunk.metadata.published_at,
      article_hash: chunk.metadata.article_hash,
    },
  }));

  for (let i = 0; i < points.length; i += UPSERT_BATCH_SIZE) {
    const batch = points.slice(i, i + UPSERT_BATCH_SIZE);
    await client.upsert(COLLECTION_NAME, {
      wait: true,
      points: batch,
    });
    console.log(
      `[indexer] Upserted ${Math.min(i + UPSERT_BATCH_SIZE, points.length)}/${points.length} points`
    );
  }
}

/**
 * Main incremental indexing function.
 * Only re-indexes articles whose content has changed (hash-based diff).
 *
 * @param {Array} articles - parsed article objects (from mdx-parser)
 * @param {Array} allEmbeddedChunks - all embedded chunks (from embedder)
 * @returns {{ indexed: number, skipped: number, total: number }}
 */
export async function indexArticles(articles, allEmbeddedChunks) {
  await ensureCollection();
  const storedHashes = await getStoredHashes();

  let indexed = 0;
  let skipped = 0;

  for (const article of articles) {
    const storedHash = storedHashes.get(article.slug);

    if (storedHash === article.hash) {
      console.log(`[indexer] Skipping "${article.title}" (unchanged)`);
      skipped++;
      continue;
    }

    // Delete old points if article existed before
    if (storedHash) {
      await deleteArticlePoints(article.slug);
    }

    // Get chunks for this article
    const articleChunks = allEmbeddedChunks.filter(
      (c) => c.article_slug === article.slug
    );

    if (articleChunks.length === 0) {
      console.warn(`[indexer] No chunks found for "${article.title}"`);
      continue;
    }

    await upsertChunks(articleChunks);
    console.log(`[indexer] ✓ Indexed "${article.title}" (${articleChunks.length} chunks)`);
    indexed++;
  }

  console.log(
    `[indexer] Complete: ${indexed} indexed, ${skipped} skipped, ${articles.length} total`
  );

  return { indexed, skipped, total: articles.length };
}

/**
 * Get collection stats for the status endpoint.
 */
export async function getCollectionStats() {
  try {
    const client = getClient();
    const info = await client.getCollection(COLLECTION_NAME);
    return {
      pointsCount: info.points_count,
      status: info.status,
      vectorsCount: info.vectors_count,
    };
  } catch {
    return { pointsCount: 0, status: "not_found", vectorsCount: 0 };
  }
}
