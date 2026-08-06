/**
 * modules/rag/retrieval/retriever.js
 *
 * Hybrid retrieval pipeline:
 * 1. Dense vector search — top-20 results by cosine similarity
 * 2. Metadata keyword boosting — bonus score for tag/category matches
 * 3. Reciprocal Rank Fusion (RRF) — merges semantic rank + keyword rank
 * 4. Returns top-K deduplicated chunks for the generator
 */

import { QdrantClient } from "@qdrant/js-client-rest";
import { embedQuery } from "../ingestion/embedder.js";

const COLLECTION_NAME = "articles_chunks";
const SEARCH_TOP_K = 20;      // candidates from vector search
const FINAL_TOP_K = 6;        // chunks passed to generator
const RRF_K = 60;             // standard RRF constant
const TAG_BOOST = 0.15;       // score bonus per matching tag
const CATEGORY_BOOST = 0.20;  // score bonus for matching category

let _client = null;

function getClient() {
  if (!_client) {
    const url = process.env.QDRANT_URL;
    const apiKey = process.env.QDRANT_API_KEY;
    if (!url) throw new Error("QDRANT_URL not set");
    _client = new QdrantClient({ url, apiKey });
  }
  return _client;
}

/**
 * Reciprocal Rank Fusion score for a given rank.
 */
function rrfScore(rank) {
  return 1 / (RRF_K + rank + 1);
}

/**
 * Apply metadata keyword boosting to search results.
 * Boosts scores for chunks whose tags/category match the extracted query metadata.
 *
 * @param {Array} results - Qdrant search results with payload
 * @param {{ categories: string[], tags: string[] }} queryMeta
 * @returns {Array} results with adjusted scores
 */
function applyMetadataBoost(results, queryMeta) {
  return results.map((result) => {
    let boost = 0;
    const payload = result.payload || {};

    // Tag matching
    const chunkTags = (payload.tags || []).map((t) => t.toLowerCase());
    for (const tag of queryMeta.tags) {
      if (chunkTags.includes(tag.toLowerCase())) {
        boost += TAG_BOOST;
      }
    }

    // Category matching
    const chunkCategory = (payload.category || "").toLowerCase();
    for (const cat of queryMeta.categories) {
      if (chunkCategory === cat.toLowerCase()) {
        boost += CATEGORY_BOOST;
      }
    }

    return { ...result, score: result.score + boost };
  });
}

/**
 * RRF fusion of two ranked lists.
 * Semantic rank (from vector similarity) + keyword rank (from metadata boost).
 *
 * @param {Array} semanticResults - results sorted by cosine score
 * @param {Array} keywordResults - same results re-sorted by metadata boost score
 * @returns {Array} fused and deduplicated results
 */
function rfFusion(semanticResults, keywordResults) {
  const scoreMap = new Map();

  // Add semantic rank contribution
  semanticResults.forEach((result, rank) => {
    const id = result.id;
    const current = scoreMap.get(id) || { ...result, fusedScore: 0 };
    current.fusedScore += rrfScore(rank);
    scoreMap.set(id, current);
  });

  // Add keyword rank contribution
  keywordResults.forEach((result, rank) => {
    const id = result.id;
    const current = scoreMap.get(id) || { ...result, fusedScore: 0 };
    current.fusedScore += rrfScore(rank);
    scoreMap.set(id, current);
  });

  return Array.from(scoreMap.values()).sort((a, b) => b.fusedScore - a.fusedScore);
}

/**
 * Main retrieval function.
 *
 * @param {string} query - standalone query (after rewriting)
 * @param {{ categories: string[], tags: string[] }} queryMeta - for boosting
 * @param {number} topK - number of chunks to return (default: FINAL_TOP_K)
 * @returns {Promise<Array<{ article_slug, article_title, section, text, score }>>}
 */
export async function retrieve(query, queryMeta = { categories: [], tags: [] }, topK = FINAL_TOP_K, articleSlug = null) {
  const client = getClient();

  // 1. Embed the query
  const queryVector = await embedQuery(query);

  // 2. Dense vector search with base threshold
  const searchParams = {
    vector: queryVector,
    limit: SEARCH_TOP_K,
    with_payload: true,
    score_threshold: 0.35, // base candidates threshold
  };

  if (articleSlug) {
    // Qdrant filter: only return chunks belonging to this specific article
    searchParams.filter = {
      must: [
        {
          key: "article_slug",
          match: { value: articleSlug },
        },
      ],
    };
    console.log(`[retriever] Scoped to article: "${articleSlug}"`);
  }

  const searchResults = await client.search(COLLECTION_NAME, searchParams);

  if (!searchResults || searchResults.length === 0) {
    console.log("[retriever] Low Confidence (0 vector matches) -> Returning 0 chunks");
    return [];
  }

  // 3. Dynamic Confidence Analysis
  const topScore = searchResults[0].score;
  let confidenceTier = "Low";
  let targetLimit = 0;
  let minScoreCutoff = 0.40;

  if (topScore >= 0.52) {
    confidenceTier = "High";
    targetLimit = Math.min(topK, 4);
    minScoreCutoff = 0.45;
  } else if (topScore >= 0.38) {
    confidenceTier = "Medium";
    targetLimit = 2;
    minScoreCutoff = 0.38;
  } else {
    console.log(`[retriever] Low Confidence (top score ${topScore.toFixed(3)} < 0.38) -> Returning 0 chunks`);
    return [];
  }

  // Filter chunks meeting the confidence cutoff
  const qualityResults = searchResults.filter((r) => r.score >= minScoreCutoff);

  if (qualityResults.length === 0) {
    console.log(`[retriever] No chunks met cutoff ${minScoreCutoff} -> Returning 0 chunks`);
    return [];
  }

  // 4. Apply metadata keyword boosting
  const boostedResults = applyMetadataBoost(qualityResults, queryMeta);

  // 5. RRF fusion
  const keywordSortedResults = [...boostedResults].sort((a, b) => b.score - a.score);
  const fused = rfFusion(qualityResults, keywordSortedResults);

  // 6. Select top-K based on confidence tier limit
  const topResults = fused.slice(0, targetLimit);

  const articleCount = new Set(topResults.map((r) => r.payload?.article_slug)).size;
  console.log(
    `[retriever] Confidence: ${confidenceTier} (top score: ${topScore.toFixed(3)}) -> Selected ${topResults.length} chunks from ${articleCount} article(s)`
  );

  return topResults.map((result) => ({
    chunk_id: result.payload?.chunk_id,
    article_slug: result.payload?.article_slug,
    article_title: result.payload?.article_title,
    section: result.payload?.section,
    text: result.payload?.text,
    category: result.payload?.category,
    tags: result.payload?.tags,
    confidenceTier,
    score: Math.round((result.fusedScore || result.score) * 1000) / 1000,
  }));
}

/**
 * Check if the collection has any indexed documents.
 */
export async function isIndexPopulated() {
  try {
    const client = getClient();
    const info = await client.getCollection(COLLECTION_NAME);
    return (info.points_count || 0) > 0;
  } catch {
    return false;
  }
}
