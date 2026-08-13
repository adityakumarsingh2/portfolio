/**
 * modules/rag/retrieval/query-processor.js
 *
 * Query preprocessing pipeline:
 * 1. Standalone query rewriter — resolves follow-up references using conversation history
 * 2. Keyword/category extractor — identifies tags/categories for metadata boosting
 */

import { GoogleGenerativeAI } from "@google/generative-ai";

const MODEL = "gemini-3.5-flash-lite";

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
 * Known article categories and common tags for keyword boosting.
 * Extend this as more articles are added.
 */
const KNOWN_CATEGORIES = ["AI", "System Design", "Web Development", "Backend", "Full Stack"];
const KNOWN_TAGS = [
  "RAG", "LLM", "Vector DB", "Embeddings", "Python", "AI Engineering",
  "API Design", "REST", "Node.js", "Backend", "Rate Limiting", "Pagination",
  "TanStack Query", "React", "Data Fetching", "TypeScript",
  "Full Stack", "Architecture", "Microservices", "Docker",
  "Qdrant", "Pinecone", "ChromaDB", "LangChain", "Gemini",
];

/**
 * Rewrite a follow-up query into a standalone question using conversation history.
 * If the query is already self-contained (first turn or no references), returns it as-is.
 *
 * @param {string} query - current user query
 * @param {Array<{ role: string, text: string }>} history - conversation history (last N turns)
 * @returns {Promise<string>} standalone query
 */
export async function rewriteStandaloneQuery(query, history = []) {
  // If no history or the query is clearly self-contained, skip rewriting
  if (history.length === 0) return query;

  const referenceWords = /\b(it|this|that|they|them|the above|the previous|the last|mentioned|said|described|those|these)\b/i;
  if (!referenceWords.test(query)) return query;

  // Build context from last 4 messages
  const recentHistory = history.slice(-4);
  const historyText = recentHistory
    .map((m) => `${m.role === "user" ? "User" : "Assistant"}: ${m.text}`)
    .join("\n");

  const rewritePrompt = `Given the following conversation history, rewrite the user's latest question as a completely standalone question that can be understood without any context.

Conversation History:
${historyText}

Latest Question: "${query}"

Rules:
- Replace all pronouns and references (it, this, that, they, those, mentioned, above, etc.) with explicit terms
- Keep the question concise and natural
- Output ONLY the rewritten question, nothing else
- If the question is already self-contained, return it unchanged`;

  try {
    const model = getGenAI().getGenerativeModel({ model: MODEL });
    const result = await model.generateContent(rewritePrompt);
    const rewritten = result.response.text().trim().replace(/^["']|["']$/g, "");
    console.log(`[query-processor] Rewrote: "${query}" → "${rewritten}"`);
    return rewritten;
  } catch (error) {
    console.warn("[query-processor] Rewrite failed, using original query:", error.message);
    return query;
  }
}

/**
 * Extract relevant categories and tags from a query for metadata boosting.
 * Simple keyword matching — no extra API calls.
 *
 * @param {string} query
 * @returns {{ categories: string[], tags: string[] }}
 */
export function extractQueryMetadata(query) {
  const queryLower = query.toLowerCase();

  const matchedCategories = KNOWN_CATEGORIES.filter((cat) =>
    queryLower.includes(cat.toLowerCase())
  );

  const matchedTags = KNOWN_TAGS.filter((tag) =>
    queryLower.includes(tag.toLowerCase())
  );

  return {
    categories: matchedCategories,
    tags: matchedTags,
  };
}
