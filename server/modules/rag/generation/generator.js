/**
 * modules/rag/generation/generator.js
 *
 * RAG response generator using Gemini 2.5 Flash with:
 *   - Google Search Grounding (web augmentation beyond articles)
 *   - Streaming SSE output
 *   - Source attribution tracking (article chunks + web sources)
 *   - Structured context injection with citation markers
 */

import { GoogleGenerativeAI } from "@google/generative-ai";

// Model rotation chain — on 429, instantly switches to the next model
// (each model has its own separate RPM quota pool)
const MODEL_CHAIN = [
  "gemini-3.5-flash-lite", // primary — cost-efficient, low-latency, high-volume (GA July 2026)
  "gemini-3.6-flash",      // fallback — latest flagship Flash (GA July 2026)
];

const SYSTEM_INSTRUCTION = `You are a knowledgeable technical assistant for Aditya Kumar Singh's engineering blog. You help readers understand the topics covered in his articles and related technical concepts.

Your behavior:
1. **Article-first**: Always prioritize information from the provided article context.
2. **Technical accuracy**: This is a technical engineering blog — be precise, clear, and well-structured. Include code examples when helpful.
3. **Concise but complete**: 2-5 sentences for simple questions, up to 300 words for complex ones. Use bullet points and inline code formatting for clarity.
4. **NO INLINE CITATIONS OR TEXT CITATION TAGS**: DO NOT write inline citation tags like [SOURCE: ...], [Section: ...], or text lines like "📄 Source: ...". The user interface automatically displays interactive source pill buttons for cited articles beneath your message.
5. **Stay on topic**: Only answer questions related to software engineering, AI, system design, and web development. For off-topic questions, politely redirect.
6. **Tone**: Engaging, friendly, and expert — like a senior engineer pair-programming with the reader.

Never say you are an AI made by Google. You are Aditya's blog assistant.`;

let _genAI = null;

function getGenAI() {
  if (!_genAI) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("GEMINI_API_KEY not set");
    _genAI = new GoogleGenerativeAI(apiKey);
  }
  return _genAI;
}

/**
 * Build the context string from retrieved chunks.
 * Context is formatted clearly without bracketed source tags that LLMs tend to repeat.
 *
 * @param {Array<{ article_slug, article_title, section, text }>} chunks
 * @returns {{ contextString, sources }}
 */
function buildContext(chunks) {
  if (chunks.length === 0) {
    return { contextString: "", sources: [] };
  }

  const usedArticles = new Map(); // slug → title
  const contextParts = [];

  for (const chunk of chunks) {
    if (!usedArticles.has(chunk.article_slug)) {
      usedArticles.set(chunk.article_slug, chunk.article_title);
    }

    contextParts.push(
      `Article: "${chunk.article_title}" (Section: ${chunk.section})\n${chunk.text}`
    );
  }

  const contextString = contextParts.join("\n\n---\n\n");
  const sources = Array.from(usedArticles.entries()).map(([slug, title]) => ({
    slug,
    title,
    type: "article",
  }));

  return { contextString, sources };
}

const RETRY_BASE_DELAY_MS = 62000; // 62s — RPM windows are 60s, must wait full window
const MODEL_SWITCH_DELAY_MS = 2000;  // 2s pause between model switches (burst protection)
const MAX_CYCLES = 0;               // no retry cycles — fail fast after one full sweep

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

// Friendly error thrown when all models + all retry cycles are exhausted
class RateLimitExhaustedError extends Error {
  constructor() {
    super("The AI service is temporarily busy. Please wait a moment and try again.");
    this.name = "RateLimitExhaustedError";
    this.isRateLimit = true;
  }
}

/**
 * Generate a streaming RAG response with automatic 429 retry.
 *
 * @param {string} query - standalone user query
 * @param {Array} retrievedChunks - chunks from retriever
 * @param {Array<{ role: string, text: string }>} history - conversation history
 * @param {function} onChunk - SSE chunk callback (text)
 * @param {function} onDone - callback called with final metadata { sources, webSources }
 */
export async function generateStreamingResponse(
  query,
  retrievedChunks,
  history = [],
  onChunk,
  onDone,
  _modelIndex = 0,
  _cycleCount = 0
) {
  const { contextString, sources } = buildContext(retrievedChunks);

  const userMessage =
    contextString.length > 0
      ? `ARTICLE CONTEXT:\n${contextString}\n\n---\n\nUSER QUESTION: ${query}`
      : query;

  // Format conversation history for Gemini
  const formattedHistory = history.slice(-6).map((msg) => ({
    role: msg.role === "user" ? "user" : "model",
    parts: [{ text: msg.text }],
  }));

  const currentModel = MODEL_CHAIN[_modelIndex];
  console.log(`[generator] Using model: ${currentModel}${_modelIndex > 0 ? ` (fallback #${_modelIndex})` : ""}`);

  try {
    // Plain generation — no Google Search Grounding tool.
    // Grounding requires a paid Gemini API tier; using it on the free tier
    // causes 429 for ALL requests regardless of API key or RPM quota.
    const model = getGenAI().getGenerativeModel({
      model: currentModel,
      systemInstruction: SYSTEM_INSTRUCTION,
    });

    const chat = model.startChat({ history: formattedHistory });
    const result = await chat.sendMessageStream(userMessage);

    let fullText = "";

    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      if (chunkText) {
        fullText += chunkText;
        onChunk(chunkText);
      }
    }

    onDone({ sources, webSources: [] }); // webSources empty on free tier (no grounding)
  } catch (error) {
    if (error.status === 429) {
      const nextModelIndex = _modelIndex + 1;

      if (nextModelIndex < MODEL_CHAIN.length) {
        // Switch to next model — brief pause to avoid burst rate limiting
        console.warn(
          `[generator] Rate limited (429) on "${currentModel}", switching to "${MODEL_CHAIN[nextModelIndex]}" in ${MODEL_SWITCH_DELAY_MS / 1000}s...`
        );
        await sleep(MODEL_SWITCH_DELAY_MS);
        return generateStreamingResponse(
          query, retrievedChunks, history, onChunk, onDone,
          nextModelIndex, _cycleCount
        );
      } else if (_cycleCount < MAX_CYCLES) {
        // All models tried — wait one full RPM window, then do one more sweep
        console.warn(
          `[generator] All models rate limited (cycle ${_cycleCount + 1}/${MAX_CYCLES}). Waiting ${RETRY_BASE_DELAY_MS / 1000}s before retrying from primary...`
        );
        await sleep(RETRY_BASE_DELAY_MS);
        return generateStreamingResponse(
          query, retrievedChunks, history, onChunk, onDone,
          0, _cycleCount + 1
        );
      } else {
        // All models exhausted across all cycles — fail fast with a friendly error
        console.error(
          `[generator] Rate limit exhausted across all models and ${MAX_CYCLES + 1} cycle(s). Giving up.`
        );
        throw new RateLimitExhaustedError();
      }
    } else {
      throw error;
    }
  }
}
