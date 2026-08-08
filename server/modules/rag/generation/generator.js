/**
 * modules/rag/generation/generator.js
 *
 * RAG response generator using Gemini 3.5 Flash / 3.6 Flash with:
 *   - Adaptive Response Depth (Concise vs Standard vs Deep Dive)
 *   - Decision-First Comparison Framework (Recommendation in Sentence 1)
 *   - Non-repetitive conversational memory & progressive disclosure
 *   - Clean UI attribution (No inline text citation tags)
 *   - Follow-up suggestion chips
 */

import { GoogleGenerativeAI } from "@google/generative-ai";

// Model rotation chain — on 429, instantly switches to the next model
const MODEL_CHAIN = [
  "gemini-3.5-flash-lite", // primary — cost-efficient, low-latency, high-volume (GA July 2026)
  "gemini-3.6-flash",      // fallback — latest flagship Flash (GA July 2026)
];

const SYSTEM_INSTRUCTION = `You are an expert Senior Software Architect & Conversational AI Mentor for Aditya Kumar Singh's engineering blog (acting like ChatGPT / Claude / NotebookLM). You provide crisp, conversational, and authoritative technical guidance.

CRITICAL CONVERSATIONAL RULES:
1. **ARTICLE-FIRST & TECHNICAL ACCURACY**: Always prioritize information from the provided article context. Be precise, clear, and well-structured. Include code examples when helpful.
2. **ADAPTIVE RESPONSE DEPTH**: Adapt response length dynamically to user intent:
   - **CONCISE MODE** (100–200 words): Triggered by simple definitions ("What is Redis?", "What is chunking?", "Difference between JWT and Sessions"). Output a direct 2-3 sentence answer + 1 key bullet list. NO long essays or unnecessary headings.
   - **STANDARD MODE** (250–450 words, Default): Triggered by general queries and comparisons ("Compare Pinecone vs Qdrant", "When should I use Redis?"). Crisp, structured, decision-first.
   - **DEEP DIVE MODE** (600–1000 words): Triggered ONLY when the user explicitly requests "deep dive", "in-depth", "detailed architecture", "production design", or "internal working".
3. **DECISION-FIRST COMPARISONS**: When comparing technologies or approaches, ALWAYS lead with a decisive 1-sentence recommendation in sentence #1 (e.g., "Choose Qdrant for open-source self-hosting; choose Pinecone for zero-DevOps managed cloud."). Follow with context, comparison table, key differences & when to choose each.
4. **NO INLINE CITATIONS OR TEXT CITATION TAGS**: DO NOT write inline citation tags like [SOURCE: ...], [Section: ...], or text lines like "📄 Source: ...". DO NOT say "In Aditya's article...", "Aditya explains...", or "According to the post...". The user interface automatically displays interactive source pill buttons for cited articles beneath your message.
5. **PROGRESSIVE CONVERSATION & NON-REPETITION**: In multi-turn chats, build directly on prior turns. Never repeat basic definitions or intro paragraphs already discussed earlier in the conversation history. Answer follow-up questions directly.
6. **FOLLOW-UP SUGGESTIONS**: At the very end of your response, output exactly 3 context-aware follow-up questions formatted on a separate line as:
[FOLLOW_UP_SUGGESTIONS: Question 1 | Question 2 | Question 3]
7. **TONE**: Conversational, confident, crisp, and direct — like a senior principal engineer mentoring a fellow developer.

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
 *
 * @param {Array<{ article_slug, article_title, section, text }>} chunks
 * @returns {{ contextString: string, sources: Array }}
 */
function buildContext(chunks) {
  if (!chunks || chunks.length === 0) {
    return { contextString: "", sources: [] };
  }

  const usedArticles = new Map(); // slug -> source object
  const contextParts = [];

  for (const chunk of chunks) {
    if (!usedArticles.has(chunk.article_slug)) {
      usedArticles.set(chunk.article_slug, {
        slug: chunk.article_slug,
        title: chunk.article_title,
        section: chunk.section || "General",
        type: "article",
      });
    }

    contextParts.push(
      `Article: "${chunk.article_title}" (Section: ${chunk.section || "General"})\n${chunk.text}`
    );
  }

  const contextString = contextParts.join("\n\n---\n\n");
  const sources = Array.from(usedArticles.values());

  return { contextString, sources };
}

const RETRY_BASE_DELAY_MS = 62000;  // kept for reference; not currently used
const MODEL_SWITCH_DELAY_MS = 2000;

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

class RateLimitExhaustedError extends Error {
  constructor() {
    super("The AI service is temporarily busy. Please wait a moment and try again.");
    this.name = "RateLimitExhaustedError";
    this.isRateLimit = true;
  }
}

/**
 * Generate a streaming RAG response with adaptive response depth & model fallback.
 */
export async function generateStreamingResponse(
  query,
  retrievedChunks,
  history = [],
  onChunk,
  onDone,
  _modelIndex = 0
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
    const model = getGenAI().getGenerativeModel({
      model: currentModel,
      systemInstruction: SYSTEM_INSTRUCTION,
    });

    const chat = model.startChat({ history: formattedHistory });
    const result = await chat.sendMessageStream(userMessage);

    let fullAccumulatedText = "";

    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      if (chunkText) {
        fullAccumulatedText += chunkText;
        // Strip [FOLLOW_UP_SUGGESTIONS: ...] tag if it starts appearing in stream
        const cleanChunk = chunkText.replace(/\[FOLLOW_UP_SUGGESTIONS:[\s\S]*$/, "");
        if (cleanChunk) {
          onChunk(cleanChunk);
        }
      }
    }

    // Extract follow-up suggestions from accumulated text
    let followUpSuggestions = [];
    const followUpMatch = fullAccumulatedText.match(/\[FOLLOW_UP_SUGGESTIONS:\s*([^\]]+)\]/);
    if (followUpMatch && followUpMatch[1]) {
      followUpSuggestions = followUpMatch[1]
        .split("|")
        .map((s) => s.trim())
        .filter((s) => s.length > 0)
        .slice(0, 3);
    }

    onDone({ sources, webSources: [], followUpSuggestions });
  } catch (error) {
    if (error.status === 429) {
      const nextModelIndex = _modelIndex + 1;

      if (nextModelIndex < MODEL_CHAIN.length) {
        // Switch to the next model in the chain immediately.
        console.warn(
          `[generator] Rate limited (429) on "${currentModel}", switching to "${MODEL_CHAIN[nextModelIndex]}" in ${MODEL_SWITCH_DELAY_MS / 1000}s...`
        );
        await sleep(MODEL_SWITCH_DELAY_MS);
        return generateStreamingResponse(
          query,
          retrievedChunks,
          history,
          onChunk,
          onDone,
          nextModelIndex
        );
      } else {
        // All models in the chain are rate-limited — give up gracefully.
        console.error(`[generator] Rate limit exhausted across all models. Giving up.`);
        throw new RateLimitExhaustedError();
      }
    } else {
      throw error;
    }
  }
}
