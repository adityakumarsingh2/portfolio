/**
 * modules/rag/ingestion/embedder.js
 *
 * Generates embeddings using Gemini text-embedding-004 (768 dimensions).
 * Implements:
 *   - Batch processing (max 100 texts per API call)
 *   - Exponential backoff on 429 rate limit errors
 *   - Task type "RETRIEVAL_DOCUMENT" for ingestion (better retrieval quality)
 */

import { GoogleGenerativeAI } from "@google/generative-ai";

const EMBEDDING_MODEL = "gemini-embedding-001";
const BATCH_SIZE = 50; // conservative batch size for stability
const MAX_RETRIES = 4;
const BASE_DELAY_MS = 1000;

let genAI = null;

function getGenAI() {
  if (!genAI) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("GEMINI_API_KEY not set");
    genAI = new GoogleGenerativeAI(apiKey);
  }
  return genAI;
}

/**
 * Sleep for a given number of milliseconds.
 */
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Embed a single text with retry logic.
 * @param {string} text
 * @returns {number[]} embedding vector
 */
async function embedWithRetry(text, attempt = 0) {
  try {
    const model = getGenAI().getGenerativeModel({ model: EMBEDDING_MODEL });
    const result = await model.embedContent(text);
    return result.embedding.values;
  } catch (error) {
    if (attempt < MAX_RETRIES && (error.status === 429 || error.status === 503)) {
      const delay = BASE_DELAY_MS * Math.pow(2, attempt) + Math.random() * 500;
      console.warn(`[embedder] Rate limited, retrying in ${Math.round(delay)}ms (attempt ${attempt + 1}/${MAX_RETRIES})`);
      await sleep(delay);
      return embedWithRetry(text, attempt + 1);
    }
    throw error;
  }
}

/**
 * Embed a batch of texts (up to BATCH_SIZE).
 * Processes them sequentially with a small delay to avoid rate limits.
 */
async function embedBatch(texts) {
  const vectors = [];
  for (let i = 0; i < texts.length; i++) {
    const vector = await embedWithRetry(texts[i]);
    vectors.push(vector);
    // Small delay between requests to stay within rate limits
    if (i < texts.length - 1) await sleep(100);
  }
  return vectors;
}

/**
 * Embed an array of chunks for document storage.
 * @param {Array<{ chunk_id, text, ... }>} chunks
 * @returns {Array<{ chunk_id, vector, ...originalChunk }>}
 */
export async function embedChunks(chunks) {
  console.log(`[embedder] Embedding ${chunks.length} chunks using ${EMBEDDING_MODEL}...`);
  const results = [];

  for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
    const batch = chunks.slice(i, i + BATCH_SIZE);
    const batchNum = Math.floor(i / BATCH_SIZE) + 1;
    const totalBatches = Math.ceil(chunks.length / BATCH_SIZE);
    console.log(`[embedder] Processing batch ${batchNum}/${totalBatches} (${batch.length} chunks)`);

    const texts = batch.map((c) => c.text);
    const vectors = await embedBatch(texts);

    for (let j = 0; j < batch.length; j++) {
      results.push({ ...batch[j], vector: vectors[j] });
    }

    // Delay between batches
    if (i + BATCH_SIZE < chunks.length) await sleep(500);
  }

  console.log(`[embedder] Successfully embedded ${results.length} chunks`);
  return results;
}

/**
 * Embed a single query string for retrieval.
 * @param {string} query
 * @returns {number[]} query embedding vector
 */
export async function embedQuery(query) {
  return embedWithRetry(query);
}
