# Articles RAG Chatbot — Industry-Grade Implementation Plan

## Overview

Add a production-quality RAG chatbot to the portfolio's articles section. When a user asks a question on any article page (or the articles index), the system:
1. **Retrieves** the most semantically relevant chunks from across all articles using Qdrant
2. **Augments** with live web search via Gemini's native Google Search Grounding
3. **Generates** a streamed, source-attributed answer

The portfolio chatbot on the homepage remains **untouched**.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (React/Vite)                    │
│                                                                 │
│  ArticlesRAGChat widget (global, floating on /articles/*) ────► │
│    - Session management (UUID per tab)                          │
│    - Streaming SSE consumer                                     │
│    - Source citation renderer                                   │
└───────────────────────────┬─────────────────────────────────────┘
                            │  POST /api/articles/chat (SSE)
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                    BACKEND (Express / Render)                   │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  RAG Pipeline Orchestrator                               │   │
│  │                                                          │   │
│  │  1. Query Processor                                      │   │
│  │     ├─ Standalone query rewriter (multi-turn context)    │   │
│  │     └─ Embed query → Gemini text-embedding-004           │   │
│  │                                                          │   │
│  │  2. Hybrid Retriever (Qdrant)                            │   │
│  │     ├─ Dense search  (top-20 by cosine similarity)       │   │
│  │     ├─ Sparse/keyword filter (tags + category payload)   │   │
│  │     └─ Reciprocal Rank Fusion → top-6 chunks             │   │
│  │                                                          │   │
│  │  3. Re-ranker (Gemini LLM cross-attention)               │   │
│  │     └─ Score and re-order top-6 by query relevance       │   │
│  │                                                          │   │
│  │  4. Context Assembler                                    │   │
│  │     └─ Build prompt with chunks + source metadata        │   │
│  │                                                          │   │
│  │  5. Generator (Gemini 2.5 Flash)                         │   │
│  │     ├─ Google Search Grounding enabled (web augment)     │   │
│  │     ├─ Streaming SSE response                            │   │
│  │     └─ Source citation in response                       │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Ingestion Pipeline (triggered on deploy)                │   │
│  │                                                          │   │
│  │  MDX Files → Parse → Chunk → Embed → Upsert to Qdrant    │   │
│  │             (hash-based incremental re-index)            │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Session Store (in-memory Map + TTL)                     │   │
│  │  Conversation history per session UUID (30 min TTL)      │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────┬───────────────────────────────┘
                                  │
              ┌───────────────────▼──────────────────┐
              │        Qdrant Cloud (Free tier)       │
              │                                       │
              │  Collection: articles_chunks          │
              │  ├─ Dense vector: 768-dim             │
              │  │  (Gemini text-embedding-004)       │
              │  └─ Payload per point:                │
              │     {                                 │
              │       chunk_id, article_slug,         │
              │       article_title, section_heading, │
              │       text, tags, category,           │
              │       difficulty, chunk_index,        │
              │       article_hash                    │
              │     }                                 │
              └───────────────────────────────────────┘
```

---

## Key Technical Decisions & Rationale

| Decision | Choice | Why |
|---|---|---|
| **Vector DB** | Qdrant Cloud (free tier) | User familiarity, best-in-class performance, excellent JS client, payload filtering without extra index |
| **Embeddings** | Gemini `text-embedding-004` (768-dim) | Already have key, excellent quality, free tier sufficient for 4–50 articles |
| **Hybrid Search** | Dense + payload keyword filter + RRF | Qdrant's native sparse vector requires `fastembed` setup — payload filtering gives 80% of the benefit with 0 extra infra |
| **Re-ranking** | Gemini LLM-based (zero-shot) | No Cohere API needed; for a small corpus (4-50 articles), an LLM score pass is sufficient and free |
| **Web Grounding** | Gemini native Search Grounding | Built into the SDK, requires zero extra API keys |
| **Generation model** | `gemini-2.5-flash` | Best streaming latency + quality for chat |
| **Chunking** | Markdown-aware (by heading sections) | MDX has natural boundaries (h2/h3); preserves semantic coherence |
| **Auto re-index** | On server start + Render deploy hook endpoint | Zero CI/CD setup needed; hash-based diff means unchanged articles are skipped |
| **Session store** | In-memory Map with TTL | Render is a persistent server (not serverless), so in-memory is fine |

---

## Open Questions

> [!IMPORTANT]
> **Do you have a Qdrant Cloud account?** If yes, we'll use your existing cluster URL + API key. If no, I'll include the sign-up steps — the free tier is 1GB storage which is more than enough for 50+ chunked articles.

> [!IMPORTANT]
> **Chat UI placement:** I'm planning a floating chat button (bottom-right) that appears on all `/articles/*` routes, similar to your portfolio chatbot but styled differently. Should it also appear on the `/articles` listing page, or only on individual article pages (`/articles/:slug`)?

> [!NOTE]
> **Re-ranking cost:** The LLM-based re-ranking step adds ~1 extra Gemini API call per user query. At free tier limits this is fine, but for high-traffic I can switch to a local cross-encoder or skip re-ranking. For now, including it as it is a major quality improvement.

---

## Proposed Changes

### ─────────────────────────────
### Backend — Server Module Restructure

The existing `server/index.js` is kept fully intact. New code goes into a `modules/` directory.

#### [NEW] `server/modules/rag/ingestion/mdx-parser.js`
Reads all `.mdx` files from `client/src/content/articles/`. Extracts:
- Frontmatter (slug, title, category, tags, difficulty)
- Raw text content (strips JSX/MDX syntax, preserves prose + code blocks)
- Section headings for chunk boundary detection
- MD5 hash of file contents (for incremental re-indexing)

#### [NEW] `server/modules/rag/ingestion/chunker.js`
Markdown-aware chunker. Splits articles at `## ` and `### ` heading boundaries. Each chunk includes:
- Parent heading context prepended to text (for better embedding quality)
- Article title prepended (context injection)
- Overlap: last 2 sentences of previous chunk appended to start of next

Targeting: 300–600 token chunks.

#### [NEW] `server/modules/rag/ingestion/embedder.js`
Batch-embeds chunks using Gemini `text-embedding-004`. Respects the API's batch limit (100 per call). Implements exponential backoff on 429s.

#### [NEW] `server/modules/rag/ingestion/indexer.js`
- Creates `articles_chunks` collection in Qdrant if it doesn't exist (768 dims, cosine distance)
- Compares stored `article_hash` payload with current file hash → skips unchanged articles
- Deletes old points for changed articles by slug filter, then upserts fresh points
- Stores indexing metadata in a `_meta` collection (last run timestamp, article count)

#### [NEW] `server/modules/rag/retrieval/retriever.js`
1. Embeds the (rewritten) query
2. Calls Qdrant `search` with `top_k=20`, `with_payload=true`
3. Applies keyword boosting: if query contains tags/category names matching Qdrant payload, boost those scores +0.15
4. Runs RRF fusion on semantic rank + keyword rank
5. Returns top-6 deduplicated chunks

#### [NEW] `server/modules/rag/retrieval/query-processor.js`
- **Standalone query rewriter**: Takes last 3 conversation turns + current query, uses Gemini to produce a self-contained search query (resolves "it", "that article", "the previous example" etc.)
- Extracts likely article category/tags from query for metadata boosting

#### [NEW] `server/modules/rag/generation/generator.js`
- Assembles context string from top-6 chunks with source attribution tags
- Sends to Gemini 2.5 Flash with:
  - Google Search Grounding tool enabled
  - System instruction (articles assistant persona, citation rules)
  - Streaming enabled
- Parses grounding metadata from response to extract web sources

#### [NEW] `server/modules/rag/pipeline.js`
Orchestrator that wires together: query-processor → retriever → generator. Single `runRAGPipeline(query, sessionHistory)` function consumed by the route.

#### [NEW] `server/modules/rag/session-store.js`
In-memory session store:
- `Map<sessionId, { history: Message[], lastActivity: timestamp }>`
- LRU eviction + 30-min TTL cleanup interval

#### [NEW] `server/scripts/reindex.js`
Standalone script (`node scripts/reindex.js`) that runs the full ingestion pipeline. Called:
1. On `server/index.js` startup (async, non-blocking)
2. Via the `/api/articles/reindex` admin endpoint

#### [MODIFY] `server/index.js`
Add two new routes (portfolio chatbot unchanged):
```
POST  /api/articles/chat      → RAG pipeline → streaming SSE
POST  /api/articles/reindex   → Admin-key protected re-index trigger
GET   /api/articles/status    → Index health (article count, last indexed, etc.)
```
Add startup trigger: `reindex()` called on server start (non-blocking).

#### [MODIFY] `server/package.json`
Add dependencies:
- `@qdrant/js-client-rest` — Qdrant SDK
- `gray-matter` — frontmatter parsing for MDX files
- `remark` + `remark-mdx` + `remark-strip-markdown` — MDX → plain text
- `crypto` (built-in Node) — MD5 hashing

---

### ─────────────────────────────
### Frontend — Articles RAG Chat Widget

#### [NEW] `client/src/components/articles/RAGChatWidget.tsx`
Floating chat panel component:
- Trigger button: bottom-right, distinct from portfolio chatbot (different icon + label "Ask about Articles")
- Expandable chat panel with conversation history
- **Source citations**: Each response shows clickable source pills ("From: Building RAG from Scratch", "From: web search")
- Typing indicator (animated dots while streaming)
- Session ID generated once per component mount (UUID)
- Sends: `{ query, sessionId }` to `/api/articles/chat`
- Receives SSE stream: `{ text }` chunks + `{ sources }` final event

#### [MODIFY] `client/src/App.tsx`
Mount `<RAGChatWidget />` inside the `/articles` route subtree (appears on `/articles` and `/articles/:slug`).

#### [NEW] `client/src/hooks/useRAGChat.ts`
Custom hook encapsulating:
- Session ID management (persisted in `sessionStorage`)
- SSE stream consumption
- Message history state
- Source state (extracted from final SSE event)
- Loading / error states

---

### ─────────────────────────────
### Qdrant Collection Schema

```
Collection: articles_chunks
├─ Vector config: { size: 768, distance: Cosine }
└─ Point schema (payload):
   {
     chunk_id:        string,   // "{slug}-{chunk_index}"
     article_slug:    string,   // "building-rag-from-scratch"
     article_title:   string,   // "Building a RAG System from Scratch"
     section:         string,   // "Chunking Strategies > Fixed-Size Chunking"
     text:            string,   // actual chunk text (300–600 tokens)
     tags:            string[], // ["RAG", "LLM", "Vector DB"]
     category:        string,   // "AI"
     difficulty:      string,   // "Intermediate"
     chunk_index:     number,   // position within article
     article_hash:    string,   // MD5 of full MDX file (for incremental updates)
     published_at:    string,   // ISO date
   }
```

---

### ─────────────────────────────
### Environment Variables

New env vars needed in `server/.env` and Render dashboard:
```
QDRANT_URL=https://xxxx.cloud.qdrant.io
QDRANT_API_KEY=your_qdrant_api_key
REINDEX_ADMIN_KEY=a_secret_string_you_choose
```
`GEMINI_API_KEY` already exists — reused for both embeddings and generation.

---

## Data Flow: User Query → Response

```
User: "What's the difference between Qdrant and Pinecone?"
        │
        ▼
1. Query Processor
   ├─ Session history: [] (first message)
   ├─ No rewrite needed (self-contained query)
   └─ Extracted tags: ["Qdrant", "Pinecone", "Vector DB"]

2. Retriever
   ├─ Embed query → 768-dim vector
   ├─ Qdrant search (top-20 cosine) → 20 chunks
   ├─ Tag boost: chunks with tag "Vector DB" get +0.15
   └─ RRF → top-6: [vector-db-table section, retrieval-pipeline section, ...]

3. Generator
   ├─ Context assembled:
   │  [SOURCE: building-rag-from-scratch / Vector Databases]
   │  "Your choice of vector database significantly impacts latency..."
   │  | Pinecone | Managed | ~50ms | Production |
   │  | Qdrant   | Self/Managed | ~20ms | High-throughput |
   │
   ├─ Google Search Grounding: ON
   └─ Gemini generates: "According to Aditya's article on RAG, Qdrant offers...
                         [web: Qdrant benchmarks show...] [source: building-rag-from-scratch]"

4. SSE Stream → Frontend renders with source pills
```

---

## Auto Re-indexing Flow

```
New article added to client/src/content/articles/new-article.mdx
        │
        ▼
git push → Render redeploys → server starts
        │
        ▼
server/index.js startup → reindex() [async, non-blocking]
        │
        ▼
indexer.js: for each .mdx file:
  ├─ Compute MD5 hash
  ├─ Query Qdrant for existing points with article_slug
  │  └─ Compare stored article_hash with current hash
  │     ├─ SAME → skip (no API calls, zero cost)
  │     └─ DIFFERENT (or new) → delete old points → chunk → embed → upsert
        │
        ▼
New article is searchable within ~30s of deploy
```

---

## Verification Plan

### During Development
- Unit test chunker with each MDX file → verify chunk count and text quality
- Test embedding pipeline with 1 article → verify Qdrant upsert
- Test retrieval: manually verify top-k results for known queries
- Test re-indexing: modify one article → verify only that article is re-indexed

### After Integration
- `GET /api/articles/status` → confirm all articles indexed
- Test chat: queries that should hit article content vs queries that need web grounding
- Test multi-turn: follow-up questions that require query rewriting
- Verify streaming in browser
- Verify source citations appear correctly in UI

### Manual
- Load `/articles/building-rag-from-scratch` → open RAG chat widget → ask 3 questions → confirm quality + sources
- Add a new test MDX file → redeploy → confirm it's queryable within 60 seconds
