/**
 * modules/rag/generation/generator.js
 *
 * RAG response generator using Gemini 3.5 Flash / 3.6 Flash with:
 *   - Direct educational response hierarchy (Answer -> Explanation -> Tradeoffs -> Code)
 *   - Multi-article synthesis & GFM Markdown Comparison Tables
 *   - Masked retrieval (Zero "In Aditya's article..." meta-phrases)
 *   - Structured citation reasons & follow-up suggestion chips
 */

import { GoogleGenerativeAI } from "@google/generative-ai";

// Model rotation chain — on 429, instantly switches to the next model
const MODEL_CHAIN = [
  "gemini-3.5-flash-lite", // primary — cost-efficient, low-latency, high-volume (GA July 2026)
  "gemini-3.6-flash",      // fallback — latest flagship Flash (GA July 2026)
];

const SYSTEM_INSTRUCTION = `You are a world-class Senior Software Architect & Technical Instructor (acting like ChatGPT / Claude / NotebookLM). You provide authoritative, clear, and highly educational answers on computer science, full-stack architecture, AI/RAG systems, system design, and web development.

CRITICAL BEHAVIOR RULES:
1. **Direct Answer First**: Always start directly with the core answer or solution in the very first sentence. Never open with meta-commentary, introductory filler, or retrieval disclaimers.
2. **NO Meta-Mentions**: NEVER use phrases like "In Aditya's article...", "Aditya explains...", "According to the post...", or "The article doesn't discuss...". NEVER mention retrieval, vector databases, chunks, or context state.
3. **Multi-Article Knowledge Synthesis**: Synthesize insights seamlessly across any provided supporting context and your deep software engineering knowledge into one unified, cohesive technical breakdown. Never answer article-by-article.
4. **Educational & Architectural Depth**: Adapt response depth naturally:
   - Explain the "why" and core mechanics under the hood.
   - Outline practical production considerations, scalability concerns, edge cases, and common pitfalls.
   - Provide clean, typed code snippets (TypeScript, React, Node.js, Express, Python) when useful.
5. **Dynamic Comparison Tables**: Whenever comparing two or more technologies, tools, or architectural patterns (e.g., Qdrant vs Pinecone, REST vs GraphQL, Redis vs Memcached), ALWAYS generate a clean GFM Markdown table.
6. **Follow-Up Suggestions Output**: At the very end of your response, output exactly 3 context-aware, highly relevant follow-up questions for further learning, formatted on a separate line as:
[FOLLOW_UP_SUGGESTIONS: Suggestion Question 1 | Suggestion Question 2 | Suggestion Question 3]
7. **Tone**: Authoritative, inspiring, engaging, and precise — pair-programming with an experienced principal developer.`;

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
        section: chunk.section || "Technical Deep-Dive",
        reason: `Covers ${chunk.section || "core concepts"} and implementation patterns`,
        type: "article",
      });
    }

    contextParts.push(
      `---
[SUPPORTING CONTEXT ITEM]
Article: ${chunk.article_title}
Section: ${chunk.section || "General"}
Content:
${chunk.text}
---`
    );
  }

  const contextString = contextParts.join("\n\n");
  const sources = Array.from(usedArticles.values());

  return { contextString, sources };
}

const RETRY_BASE_DELAY_MS = 62000;
const MODEL_SWITCH_DELAY_MS = 2000;
const MAX_CYCLES = 0;

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
 * Generate a streaming RAG response with direct educational hierarchy & model fallback.
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
      ? `SUPPORTING KNOWLEDGE BASE CONTEXT:\n${contextString}\n\nUSER QUESTION: ${query}`
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
        // Strip the [FOLLOW_UP_SUGGESTIONS: ...] tag if it starts appearing in stream
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
          nextModelIndex,
          _cycleCount
        );
      } else if (_cycleCount < MAX_CYCLES) {
        console.warn(
          `[generator] All models rate limited (cycle ${_cycleCount + 1}/${MAX_CYCLES}). Waiting ${RETRY_BASE_DELAY_MS / 1000}s before retrying...`
        );
        await sleep(RETRY_BASE_DELAY_MS);
        return generateStreamingResponse(
          query,
          retrievedChunks,
          history,
          onChunk,
          onDone,
          0,
          _cycleCount + 1
        );
      } else {
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
