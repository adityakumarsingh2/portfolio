/**
 * modules/rag/generation/generator.js
 *
 * RAG response generator using Gemini 2.5 Flash with:
 *   - Google Search Grounding (web augmentation beyond articles)
 *   - Streaming SSE output
 *   - Source attribution tracking (article chunks + web sources)
 *   - Structured context injection with citation markers
 */

import { GoogleGenerativeAI, DynamicRetrievalMode } from "@google/generative-ai";

const GENERATION_MODEL = "gemini-3.5-flash-lite";

const SYSTEM_INSTRUCTION = `You are a knowledgeable technical assistant for Aditya Kumar Singh's engineering blog. You help readers understand the topics covered in his articles and related technical concepts.

Your behavior:
1. **Article-first**: Always prioritize information from the provided article context (marked with [SOURCE: ...]).
2. **Web augmentation**: When the user asks about concepts not fully covered in the articles, supplement with accurate information from your training or web search. Clearly distinguish: say "In Aditya's article..." for article-sourced info, and "More broadly..." or "According to current documentation..." for web-sourced info.
3. **Technical accuracy**: This is a technical blog — be precise. Include code examples when helpful.
4. **Concise but complete**: 2-5 sentences for simple questions, up to 300 words for complex ones. Use bullet points and code blocks for clarity.
5. **Citation rule**: At the end of your response, if you used article context, list the source articles naturally (e.g., "📄 Source: Building a RAG System from Scratch").
6. **Stay on topic**: Only answer questions related to software engineering, AI, system design, and web development. For off-topic questions, politely redirect.
7. **Tone**: Engaging, friendly, and expert — like a senior engineer pair-programming with the reader.

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
 * Each chunk is wrapped with a SOURCE marker for attribution.
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
      `[SOURCE: ${chunk.article_title} | Section: ${chunk.section}]\n${chunk.text}`
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

const MAX_GENERATION_RETRIES = 2;
const RETRY_BASE_DELAY_MS = 62000; // 62s — RPM windows are 60s, must wait full window

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
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
  _attempt = 0
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

  try {
    // Try with Google Search Grounding first
    const model = getGenAI().getGenerativeModel({
      model: GENERATION_MODEL,
      systemInstruction: SYSTEM_INSTRUCTION,
      tools: [
        {
          googleSearch: {},
        },
      ],
    });

    const chat = model.startChat({ history: formattedHistory });
    const result = await chat.sendMessageStream(userMessage);

    let fullText = "";
    const webSources = [];

    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      if (chunkText) {
        fullText += chunkText;
        onChunk(chunkText);
      }
    }

    // Extract grounding metadata (web sources) if available
    const finalResponse = await result.response;
    if (finalResponse.candidates?.[0]?.groundingMetadata?.groundingChunks) {
      const groundingChunks = finalResponse.candidates[0].groundingMetadata.groundingChunks;
      for (const gc of groundingChunks) {
        if (gc.web?.uri && gc.web?.title) {
          webSources.push({
            title: gc.web.title,
            url: gc.web.uri,
            type: "web",
          });
        }
      }
    }

    onDone({ sources, webSources: webSources.slice(0, 3) }); // cap web sources at 3
  } catch (error) {
    // 429 rate limit → wait and retry with exponential backoff
    if (error.status === 429 && _attempt < MAX_GENERATION_RETRIES) {
      const delay = RETRY_BASE_DELAY_MS * Math.pow(2, _attempt);
      console.warn(`[generator] Rate limited (429), retrying in ${delay / 1000}s (attempt ${_attempt + 1}/${MAX_GENERATION_RETRIES})`);
      await sleep(delay);
      return generateStreamingResponse(query, retrievedChunks, history, onChunk, onDone, _attempt + 1);
    }
    // Fallback: try without Search Grounding (some API tiers don't support it)
    if (error.message?.includes("PERMISSION_DENIED") || error.message?.includes("not supported")) {
      console.warn("[generator] Search Grounding not available, falling back to standard generation");
      await generateWithoutGrounding(query, userMessage, formattedHistory, sources, onChunk, onDone);
    } else {
      throw error;
    }
  }
}

/**
 * Fallback generator without Google Search Grounding.
 */
async function generateWithoutGrounding(
  _query,
  userMessage,
  formattedHistory,
  sources,
  onChunk,
  onDone
) {
  const model = getGenAI().getGenerativeModel({
    model: GENERATION_MODEL,
    systemInstruction: SYSTEM_INSTRUCTION,
  });

  const chat = model.startChat({ history: formattedHistory });
  const result = await chat.sendMessageStream(userMessage);

  for await (const chunk of result.stream) {
    const chunkText = chunk.text();
    if (chunkText) onChunk(chunkText);
  }

  onDone({ sources, webSources: [] });
}
