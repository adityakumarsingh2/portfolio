# Articles RAG Chatbot — Walkthrough

## ✅ What Was Built

### Backend (server/)

| File | Purpose |
|---|---|
| [mdx-parser.js](file:///c:/Users/Aditya%20Kumar%20Singh/OneDrive/Desktop/nodejspractice/1portfolio/server/modules/rag/ingestion/mdx-parser.js) | Reads all `.mdx` files, strips JSX, extracts frontmatter + sections, computes MD5 hash |
| [chunker.js](file:///c:/Users/Aditya%20Kumar%20Singh/OneDrive/Desktop/nodejspractice/1portfolio/server/modules/rag/ingestion/chunker.js) | Splits articles at `##`/`###` boundaries with context-prefix enrichment |
| [embedder.js](file:///c:/Users/Aditya%20Kumar%20Singh/OneDrive/Desktop/nodejspractice/1portfolio/server/modules/rag/ingestion/embedder.js) | Gemini `text-embedding-004` (768-dim), batch + exponential backoff retry |
| [indexer.js](file:///c:/Users/Aditya%20Kumar%20Singh/OneDrive/Desktop/nodejspractice/1portfolio/server/modules/rag/ingestion/indexer.js) | Qdrant collection management, payload indexes, hash-based incremental upsert |
| [query-processor.js](file:///c:/Users/Aditya%20Kumar%20Singh/OneDrive/Desktop/nodejspractice/1portfolio/server/modules/rag/retrieval/query-processor.js) | Standalone query rewriter (resolves "it", "that example") + keyword extractor |
| [retriever.js](file:///c:/Users/Aditya%20Kumar%20Singh/OneDrive/Desktop/nodejspractice/1portfolio/server/modules/rag/retrieval/retriever.js) | Dense vector search + metadata boosting + Reciprocal Rank Fusion |
| [generator.js](file:///c:/Users/Aditya%20Kumar%20Singh/OneDrive/Desktop/nodejspractice/1portfolio/server/modules/rag/generation/generator.js) | Gemini 2.5 Flash + Google Search Grounding + streaming + source attribution |
| [pipeline.js](file:///c:/Users/Aditya%20Kumar%20Singh/OneDrive/Desktop/nodejspractice/1portfolio/server/modules/rag/pipeline.js) | Orchestrator: query-processor → retriever → generator |
| [session-store.js](file:///c:/Users/Aditya%20Kumar%20Singh/OneDrive/Desktop/nodejspractice/1portfolio/server/modules/rag/session-store.js) | In-memory session store with 30-min TTL eviction |
| [reindex.js](file:///c:/Users/Aditya%20Kumar%20Singh/OneDrive/Desktop/nodejspractice/1portfolio/server/scripts/reindex.js) | Standalone reindex script + startup trigger + state for status endpoint |
| [index.js](file:///c:/Users/Aditya%20Kumar%20Singh/OneDrive/Desktop/nodejspractice/1portfolio/server/index.js) | **Modified** — added `/api/articles/chat`, `/api/articles/reindex`, `/api/articles/status`, `/api/articles/session/:id` |

### Frontend (client/src/)

| File | Purpose |
|---|---|
| [useRAGChat.ts](file:///c:/Users/Aditya%20Kumar%20Singh/OneDrive/Desktop/nodejspractice/1portfolio/client/src/hooks/useRAGChat.ts) | SSE consumer, session management, message state, source attribution |
| [RAGChatWidget.tsx](file:///c:/Users/Aditya%20Kumar%20Singh/OneDrive/Desktop/nodejspractice/1portfolio/client/src/components/articles/RAGChatWidget.tsx) | Floating widget with streaming, markdown, source pills, suggestions |
| [App.tsx](file:///c:/Users/Aditya%20Kumar%20Singh/OneDrive/Desktop/nodejspractice/1portfolio/client/src/App.tsx) | **Modified** — `ArticlesLayout` wrapper mounts `<RAGChatWidget />` on all `/articles/*` routes |

---

## 🚀 Setup Steps (Required Before Running)

### Step 1: Install server dependencies

```bash
cd server
npm install
```

This installs `@qdrant/js-client-rest` and `gray-matter` that were added to `package.json`.

### Step 2: Create a Qdrant Cloud cluster

1. Go to **https://cloud.qdrant.io** → sign up (free)
2. Create a cluster → choose **Free tier** (1 GB, enough for 50+ articles)
3. Copy your **Cluster URL** (looks like `https://abc123.cloud.qdrant.io`)
4. Create an **API key** in the dashboard

### Step 3: Fill in `server/.env`

```env
QDRANT_URL=https://YOUR-CLUSTER-ID.cloud.qdrant.io
QDRANT_API_KEY=your_actual_qdrant_api_key
REINDEX_ADMIN_KEY=any_secret_you_choose
```

### Step 4: Add the same env vars to Render

In your Render service dashboard → **Environment** → add:
- `QDRANT_URL`
- `QDRANT_API_KEY`
- `REINDEX_ADMIN_KEY`

### Step 5: Test locally

```bash
# Terminal 1 — start server
cd server && npm run dev

# Terminal 2 — start client
cd client && npm run dev
```

On server start you'll see:
```
Server is running on port 5000
=== [reindex] Starting article indexing pipeline ===
[mdx-parser] Found 4 .mdx files
[chunker] "Building a RAG System..." → 7 chunks (avg 380 tokens)
[embedder] Embedding 28 chunks using text-embedding-004...
[indexer] ✓ Indexed "Building a RAG System..." (7 chunks)
[startup] Reindex complete: { indexed: 4, skipped: 0, total: 4, durationMs: 18420 }
```

Then go to `/articles` — you'll see the **Articles AI** button (bottom-right, violet/indigo).

---

## 🔍 Verify It Works

### Check index status
```
GET http://localhost:5000/api/articles/status
```
Should return `pointsCount > 0`.

### Test chat
Open `/articles` → click "Articles AI" → ask: *"What chunking strategies are covered in the articles?"*

You should get:
- Streaming response with content from the RAG article
- Source pill: `📄 Building a RAG System from Scratch`
- Possibly `🌐 Web` sources if Gemini uses Search Grounding

### Test follow-up (conversation memory)
1. Ask: *"What's the difference between Qdrant and Pinecone?"*
2. Then ask: *"Which one did Aditya choose and why?"*
The query rewriter resolves "which one" from context → retrieval still works.

### Test auto-reindex (once deployed)
Add a new `.mdx` file to `client/src/content/articles/` → push to git → Render redeploys → server starts → new article is automatically indexed within ~30s.

---

## 📡 API Endpoints Added

| Method | Route | Description |
|---|---|---|
| `POST` | `/api/articles/chat` | RAG chat — SSE stream, body: `{ query, sessionId }` |
| `DELETE` | `/api/articles/session/:id` | Clear conversation session |
| `POST` | `/api/articles/reindex` | Trigger re-index (header: `x-admin-key`) |
| `GET` | `/api/articles/status` | Index health + session count |

---

## 🎨 UI Design

The widget is visually distinct from the portfolio chatbot:
- **Color**: Violet/Indigo gradient (vs the portfolio's foreground/secondary theme)
- **Position**: Bottom-right (same corner — they don't overlap since the widget only shows on `/articles/*` routes, and the main chatbot only shows on `/`)
- **Label**: "Articles AI" with `BookOpen` icon
- **Sources**: Article sources shown as violet pills, web sources as sky-blue pills with external link
