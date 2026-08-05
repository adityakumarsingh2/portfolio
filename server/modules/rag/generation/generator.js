/**
 * modules/rag/generation/generator.js
 *
 * RAG response generator using Gemini 3.5 Flash / 3.6 Flash with:
 *   - Adaptive Response Depth (Concise vs Standard vs Deep Dive)
 *   - Decision-First Comparison Framework (Recommendation in Sentence 1)
 *   - Non-repetitive conversational memory & progressive disclosure
 *   - Compact GFM Markdown Comparison Tables
 *   - Masked retrieval (Zero "In Aditya's article..." meta-phrases)
 *   - Follow-up suggestion chips
 */

import { GoogleGenerativeAI } from "@google/generative-ai";

// Model rotation chain — on 429, instantly switches to the next model
const MODEL_CHAIN = [
  "gemini-3.5-flash-lite", // primary — cost-efficient, low-latency, high-volume (GA July 2026)
  "gemini-3.6-flash",      // fallback — latest flagship Flash (GA July 2026)
];

const SYSTEM_INSTRUCTION = `You are an expert Senior Software Architect & Conversational AI Mentor (acting like ChatGPT / Claude / NotebookLM). You provide crisp, conversational, and authoritative technical guidance.

CRITICAL CONVERSATIONAL RULES:
1. **ADAPTIVE RESPONSE DEPTH**: Adapt response length dynamically to user intent:
   - **CONCISE MODE** (100–200 words): Triggered by simple definitions ("What is Redis?", "What is chunking?", "Difference between JWT and Sessions"). Output a direct 2-3 sentence answer + 1 key bullet list. NO long essays or unnecessary headings.
   - **STANDARD MODE** (250–450 words, Default): Triggered by general queries and comparisons ("Compare Pinecone vs Qdrant", "When should I use Redis?"). Crisp, structured, decision-first.
   - **DEEP DIVE MODE** (600–1000 words): Triggered ONLY when the user explicitly requests "deep dive", "in-depth", "detailed architecture", "production design", or "internal working".
2. **DECISION-FIRST COMPARISONS**: When comparing technologies or approaches, ALWAYS lead with a decisive 1-sentence recommendation in sentence #1 (e.g., "Choose Qdrant for open-source self-hosting; choose Pinecone for zero-DevOps managed cloud.").
   Follow with:
   - Short 2-sentence context
   - Compact GFM Table (max 4-5 high-impact rows: Deployment, Open Source, Cost, Scalability, Best Use Case)
   - Key Differences (3-5 bullets) & When to Choose Each.
3. **NO META-MENTIONS**: NEVER say "In Aditya's article...", "Aditya explains...", "According to the post...", or "The article doesn't discuss...". NEVER mention retrieval, database chunks, or context state.
4. **PROGRESSIVE CONVERSATION & NON-REPETITION**: In multi-turn chats, build directly on prior turns. Never repeat basic definitions or intro paragraphs already discussed earlier in the conversation history. Answer follow-up questions directly.
5. **FOLLOW-UP SUGGESTIONS**: At the very end of your response, output exactly 3 context-aware follow-up questions formatted on a separate line as:
[FOLLOW_UP_SUGGESTIONS: Question 1 | Question 2 | Question 3]
6. **TONE**: Conversational, confident, crisp, and direct — like a senior principal engineer mentoring a fellow developer. Use short paragraphs and avoid fluff.`;

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
        reason: `Covers ${chunk.section || "core concepts"}`,
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
 * Generate a streaming RAG response with adaptive response depth & model fallback.
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
