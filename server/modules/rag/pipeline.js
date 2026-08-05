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
export async function runRAGPipeline({ query, history, onChunk, onDone, onError }) {
  try {
    console.log(`[pipeline] Query: "${query.slice(0, 80)}..."`);

    // Query rewriting disabled to minimize API calls (RPM).
    // Re-enable for large article sets: rewriteStandaloneQuery(query, history)
    const standaloneQuery = query;

    // Step 2: Extract metadata hints for boosting (no API call needed)
    const queryMeta = extractQueryMetadata(standaloneQuery);
    if (queryMeta.tags.length > 0 || queryMeta.categories.length > 0) {
      console.log(`[pipeline] Metadata hints: categories=${queryMeta.categories}, tags=${queryMeta.tags}`);
    }

    // Step 3: Retrieve relevant chunks from Qdrant
    const chunks = await retrieve(standaloneQuery, queryMeta);
    console.log(`[pipeline] Retrieved ${chunks.length} chunks`);

    // Step 4: Generate streaming response with grounding
    await generateStreamingResponse(
      standaloneQuery,
      chunks,
      history,
      onChunk,
      onDone
    );
  } catch (error) {
    console.error("[pipeline] Error:", error.message);
    onError(error);
  }
}
