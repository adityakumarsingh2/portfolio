# Articles RAG Chatbot — Technical Architecture 

> **Project Reference Document**  
> **System Scope**: Articles AI RAG (Retrieval-Augmented Generation) Chatbot System  
> **Core Stack**: React 18, TypeScript, Node.js / Express, Qdrant Vector DB, Gemini Embeddings (`gemini-embedding-001`), Gemini LLM Chain (`gemini-3.5-flash-lite` & `gemini-3.6-flash`), Framer Motion, Server-Sent Events (SSE).

---

## 🎯 Executive Summary & Architectural Overview

The **Articles RAG Chatbot** is a production-grade, state-of-the-art Retrieval-Augmented Generation system designed for technical knowledge bases. It allows readers to interact conversationally with Aditya's engineering articles, ask complex architecture questions, request summaries, compare technologies, and receive precise answers with verified source attributions.

```text
┌───────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                           INGESTION PIPELINE                                                      │
│                                                                                                                   │
│  [MDX Articles]        [MDX Parser]          [Section Chunker]        [Gemini Embedder]       [Qdrant Vector DB]  │
│  (content/articles/*.mdx) (mdx-parser.js)     (chunker.js)             (embedder.js)           (indexer.js)        │
│         │                   │                     │                        │                       │              │
│         └───────────────────┴─────────────────────┴────────────────────────┴───────────────────────┘              │
└───────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                     RETRIEVAL & GENERATION PIPELINE                                               │
│                                                                                                                   │
│  [User Query] ──> [Query Rewriter] ──> [Vector Search & RRF] ──> [Gemini LLM Chain] ──> [SSE Stream] ──> [RAG UI]   │
│  (useRAGChat.ts)  (query-processor.js) (retriever.js)            (generator.js)          (pipeline.js)   (RAGChatWidget.tsx)
└───────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 1. 📥 Ingestion & Indexing Pipeline

The ingestion pipeline converts raw Markdown/MDX technical articles into dense vector representations stored in the Qdrant Vector Database.

```text
                                         INGESTION FLOW
+---------------------------+      +---------------------------+      +---------------------------+
|   MDX File Parse          | ---> |  Section Chunking         | ---> | Context Enrichment        |
| (mdx-parser.js)           |      | (chunker.js)              |      | (chunker.js)              |
+---------------------------+      +---------------------------+      +---------------------------+
                                                                                    |
                                                                                    v
+---------------------------+      +---------------------------+      +---------------------------+
| Qdrant Vector DB Storage  | <--- | Incremental Hash Check    | <--- | Gemini Embeddings         |
| (indexer.js)              |      | (indexer.js)              |      | (embedder.js)             |
+---------------------------+      +---------------------------+      +---------------------------+
```

### 1.1 MDX Parsing ([mdx-parser.js](file:///c:/Users/Aditya%20Kumar%20Singh/OneDrive/Desktop/nodejspractice/1portfolio/server/modules/rag/ingestion/mdx-parser.js))
* **Frontmatter Extraction**: Reads YAML header metadata (title, category, tags, published date, difficulty, target audience).
* **Cleaning & Sanitization**: Strips raw JSX components, React import statements, custom HTML tags, and code fence noise to isolate semantic text.
* **Structural Decomposition**: Divides the document at `##` (h2) and `###` (h3) markdown heading boundaries into distinct logical sections.
* **MD5 Hashing**: Calculates an MD5 content hash of the raw article file to support fast incremental indexing.

### 1.2 Chunking Strategy ([chunker.js](file:///c:/Users/Aditya%20Kumar%20Singh/OneDrive/Desktop/nodejspractice/1portfolio/server/modules/rag/ingestion/chunker.js))
* **Section-Aware Boundaries**: Rather than arbitrary character slicing, chunking strictly respects section header boundaries.
* **Context Enrichment**: Prepends an explicit metadata context prefix to every chunk:
  ```text
  Article: "Building Production RAG Systems" | Section: "Vector Similarity Metrics"
  ```
  *Why?* Without this prefix, an isolated chunk describing "Cosine Distance vs Dot Product" loses the context of *which article* it originated from.
* **Token Sizing**:
  * Target Chunk Size: ~300 to 700 tokens (`MAX_CHUNK_CHARS = 2800`).
  * Minimum Chunk Cutoff: 80 characters (`MIN_CHUNK_CHARS = 80`).
* **Sentence-Level Overlap**: If a section exceeds 2800 characters, it is split across multiple sub-chunks with a 2-sentence overlapping tail (`OVERLAP_SENTENCES = 2`) to preserve context across boundaries.
* **Introduction Summary Chunk**: Automatically synthesizes an `intro` chunk for every article containing the title, subtitle, and meta description.

### 1.3 Dense Embeddings ([embedder.js](file:///c:/Users/Aditya%20Kumar%20Singh/OneDrive/Desktop/nodejspractice/1portfolio/server/modules/rag/ingestion/embedder.js))
* **Model**: Google Gemini `gemini-embedding-001`.
* **Output Dimension**: **3072 dimensions** (dense floating-point vector).
* **Batch Processing**: Groups chunks into batches of 50 (`BATCH_SIZE = 50`) to optimize throughput.
* **Resilience**: Implements exponential backoff retry logic (up to 4 attempts) on HTTP `429` (rate limit) or `503` (service unavailable) responses.

### 1.4 Vector Database Indexing ([indexer.js](file:///c:/Users/Aditya%20Kumar%20Singh/OneDrive/Desktop/nodejspractice/1portfolio/server/modules/rag/ingestion/indexer.js))
* **Storage Engine**: Qdrant Vector Database (Collection: `articles_chunks`).
* **Distance Metric**: Cosine Similarity.
* **Incremental Upsert Strategy**:
  1. During indexing, the server fetches stored `article_hash` values from Qdrant.
  2. Unchanged articles (matching MD5 hash) are skipped completely.
  3. Modified articles have their old vector points deleted and re-indexed.
* **Deterministic Point IDs**: Chunk IDs (`slug-index`) are converted to deterministic UUID v4 values via MD5 hashing to eliminate point duplication in Qdrant.
* **Payload Indexes**: Creates payload indexes on `article_slug`, `category`, `tags`, and `article_hash` for sub-millisecond metadata filtering.

---

## 2. 🔍 Query Preprocessing & Retrieval Pipeline

```text
                                         RETRIEVAL FLOW
+---------------------------+      +---------------------------+      +---------------------------+
|  User Query Input         | ---> | LLM Standalone Rewriter   | ---> | Metadata Keyword Extractor|
| (useRAGChat.ts)           |      | (query-processor.js)      |      | (query-processor.js)      |
+---------------------------+      +---------------------------+      +---------------------------+
                                                                                    |
                                                                                    v
+---------------------------+      +---------------------------+      +---------------------------+
| Reciprocal Rank Fusion    | <--- | Metadata Keyword Boosting | <--- | Qdrant Vector Search      |
| (retriever.js)            |      | (retriever.js)            |      | (retriever.js)            |
+---------------------------+      +---------------------------+      +---------------------------+
```

### 2.1 Standalone Query Rewriting ([query-processor.js](file:///c:/Users/Aditya%20Kumar%20Singh/OneDrive/Desktop/nodejspractice/1portfolio/server/modules/rag/retrieval/query-processor.js))
In multi-turn chat, users frequently ask ambiguous follow-up questions such as *"How does it handle rate limits?"* or *"What are its main disadvantages?"*.

* **LLM Engine**: `gemini-3.5-flash-lite`.
* **Mechanism**: Inspects the last 4 turns of conversation history and rewrites pronouns (`it`, `this`, `that`, `they`, `the previous section`) into explicit technical entities.
* **Example**:
  * *Original User Query*: "What are its main advantages?"
  * *History Context*: Discussion about Qdrant Vector Database.
  * *Rewritten Standalone Query*: "What are the main advantages of Qdrant Vector Database?"

### 2.2 Metadata Feature Extraction ([query-processor.js](file:///c:/Users/Aditya%20Kumar%20Singh/OneDrive/Desktop/nodejspractice/1portfolio/server/modules/rag/retrieval/query-processor.js))
Extracted without external API calls by cross-referencing query strings against known engineering categories (`AI`, `System Design`, `Web Development`) and technical tags (`RAG`, `LLM`, `Qdrant`, `TypeScript`, `Node.js`).

### 2.3 Hybrid Retrieval & Dynamic Confidence Tiering ([retriever.js](file:///c:/Users/Aditya%20Kumar%20Singh/OneDrive/Desktop/nodejspractice/1portfolio/server/modules/rag/retrieval/retriever.js))
1. **Article Scoping**:
   * If the user is on the general Articles page (`/articles`), search queries all vector points in Qdrant.
   * If the user is reading a specific article (e.g. `/articles/building-rag-from-scratch`), Qdrant applies a strict payload filter:
     `filter: { must: [{ key: "article_slug", match: { value: articleSlug } }] }`.
2. **Dense Vector Search**: Fetches top 20 candidate chunks (`SEARCH_TOP_K = 20`) using cosine similarity.
3. **Dynamic Confidence Cutoffs**:
   To prevent LLM hallucinations on out-of-domain or nonsense questions, the retriever evaluates the top similarity score ($S_{top}$):
   * **High Confidence** ($S_{top} \ge 0.52$): Selects up to 4 chunks (cutoff score $\ge 0.45$).
   * **Medium Confidence** ($0.38 \le S_{top} < 0.52$): Selects up to 2 chunks (cutoff score $\ge 0.38$).
   * **Low Confidence** ($S_{top} < 0.38$): Returns **0 chunks**. The LLM is instructed to politely inform the user that the knowledge base does not cover the topic.
4. **Metadata Keyword Boosting**:
   Adds explicit score bonuses to candidate chunks:
   * Matching Tag Bonus: $+0.15$
   * Matching Category Bonus: $+0.20$
5. **Reciprocal Rank Fusion (RRF)**:
   Merges pure vector rank ($R_{vec}$) with metadata-boosted rank ($R_{meta}$) using the standard RRF formula:
   $$RRF\_Score(d) = \frac{1}{60 + R_{vec}(d)} + \frac{1}{60 + R_{meta}(d)}$$

---

## 3. ⚡ Generation, Model Rotation & Streaming

```text
                                         GENERATION FLOW
+---------------------------+      +---------------------------+      +---------------------------+
| System Prompt & Context   | ---> | Primary Model             | ---> | Fallback Model            |
| (generator.js)            |      | gemini-3.5-flash-lite     |      | gemini-3.6-flash          |
+---------------------------+      +---------------------------+      +---------------------------+
                                           (If HTTP 429)                            |
                                                                                    v
+---------------------------+      +---------------------------+      +---------------------------+
| 10-Min LRU Cache          | <--- | Server-Sent Events (SSE)  | <--- | Stream Intercept          |
| (pipeline.js)             |      | (routes/rag.js)           |      | (generator.js)            |
+---------------------------+      +---------------------------+      +---------------------------+
```

### 3.1 System Prompt & Persona ([generator.js](file:///c:/Users/Aditya%20Kumar%20Singh/OneDrive/Desktop/nodejspractice/1portfolio/server/modules/rag/generation/generator.js))
* **Persona**: Senior Software Architect & Conversational AI Mentor.
* **Strict Non-Citation Rule**: Prohibits raw inline text citations like `[SOURCE: ...]` or `According to Aditya's post...`. Attributions are handled purely by the frontend UI.
* **Decision-First Framework**: For technical comparisons, the response MUST state a decisive 1-sentence recommendation in sentence #1 before detailing trade-offs.
* **Adaptive Response Depth**:
  * **Concise Mode** (100–200 words): Triggered by simple definitions ("What is Redis?").
  * **Standard Mode** (250–450 words): Default for general technical questions.
  * **Deep Dive Mode** (600–1000 words): Triggered when explicit architecture deep dives are requested.

### 3.2 Resilience & Model Rotation Chain ([generator.js](file:///c:/Users/Aditya%20Kumar%20Singh/OneDrive/Desktop/nodejspractice/1portfolio/server/modules/rag/generation/generator.js))
To guarantee 99.9% uptime against API rate limits (HTTP `429`), the system implements a fallback model chain:
1. **Primary**: `gemini-3.5-flash-lite` (Low-latency, cost-efficient).
2. **Fallback**: `gemini-3.6-flash` (Switched automatically upon rate limiting).

### 3.3 Server-Sent Events (SSE) & Response Caching ([pipeline.js](file:///c:/Users/Aditya%20Kumar%20Singh/OneDrive/Desktop/nodejspractice/1portfolio/server/modules/rag/pipeline.js) & [routes/rag.js](file:///c:/Users/Aditya%20Kumar%20Singh/OneDrive/Desktop/nodejspractice/1portfolio/server/routes/rag.js))
* **SSE Endpoint**: `POST /api/rag/chat`
* **Real-time Streaming**: Response tokens are pushed immediately to the client via `res.write('data: ...\n\n')`.
* **LRU Response Cache**:
  * Caches completed answers for 10 minutes (`CACHE_TTL_MS = 600,000`).
  * Cache key: Normalized standalone query + sorted retrieved chunk article slugs.
  * If a user or reader clicks the same prompt chip again, the server replays the cached stream instantly without hitting Gemini API.

---

## 4. 🎨 Frontend UI & 3-Column Split Studio Architecture

```text
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                        ARTICLE DETAIL PAGE (SPLIT STUDIO VIEW) [ArticleDetail.tsx]                     │
│                                                                                                        │
│  ┌──────────────────────────┐  ┌─────────────────────────────────┐  ┌───────────────────────────────┐  │
│  │   LEFT SIDEBAR           │  │        CENTER COLUMN            │  │        RIGHT SIDEBAR          │  │
│  │ (TableOfContents.tsx)    │  │     (ArticleContent.tsx)        │  │     (RAGChatWidget.tsx)       │  │
│  │                          │  │                                 │  │                               │  │
│  │  - Intro                 │  │  # Building RAG Systems         │  │  [Bot Response]               │  │
│  │  - Chunking              │  │  Deep dive into vector...       │  │  [Source Pills]               │  │
│  │  - Vector DBs            │  │                                 │  │  [Follow-Up Chips]            │  │
│  └──────────────────────────┘  └─────────────────────────────────┘  └───────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

### 4.1 Dual-Mode RAG Widget ([RAGChatWidget.tsx](file:///c:/Users/Aditya%20Kumar%20Singh/OneDrive/Desktop/nodejspractice/1portfolio/client/src/components/articles/RAGChatWidget.tsx))
1. **Floating General Mode**: Renders as a floating button/window on `/articles` general listing page.
2. **Embedded Split Studio Mode**: On `/articles/:slug`, opening the chatbot transitions the page into a 3-column split view studio:
   * Left Column: Subtopics Table of Contents ([TableOfContents.tsx](file:///c:/Users/Aditya%20Kumar%20Singh/OneDrive/Desktop/nodejspractice/1portfolio/client/src/components/articles/TableOfContents.tsx)).
   * Center Column: Primary Article Content ([ArticleContent.tsx](file:///c:/Users/Aditya%20Kumar%20Singh/OneDrive/Desktop/nodejspractice/1portfolio/client/src/components/articles/ArticleContent.tsx)).
   * Right Column: Embedded RAG Chatbot Panel ([RAGChatWidget.tsx](file:///c:/Users/Aditya%20Kumar%20Singh/OneDrive/Desktop/nodejspractice/1portfolio/client/src/components/articles/RAGChatWidget.tsx)).

### 4.2 Top-Alignment Smooth Scroll Behavior
Unlike traditional chat widgets that scroll to the *bottom* of long responses (hiding the beginning of the answer), the Articles chatbot features **ChatGPT-style top-alignment scrolling**:
* When a bot response begins generating, the chat container smoothly aligns to the **top** of the newly created response bubble.
* Readers can immediately begin reading the answer from line 1 while remaining text streams in smoothly below.

---

## 🎓 Viva Presentation Master Q&A (Cheat Sheet)

### Q1: What is RAG and why did you use it instead of fine-tuning an LLM?
> **Answer**:  
> RAG (Retrieval-Augmented Generation) combines external vector search retrieval with generative LLM synthesis. I chose RAG over fine-tuning because:
> 1. **Zero Hallucination Control**: Fine-tuning bakes knowledge into model weights where it can still hallucinate. RAG grounds answers strictly in real-time retrieved article chunks.
> 2. **Instant Updates**: Adding or updating an article takes seconds (re-indexing vectors in Qdrant via [indexer.js](file:///c:/Users/Aditya%20Kumar%20Singh/OneDrive/Desktop/nodejspractice/1portfolio/server/modules/rag/ingestion/indexer.js)) versus hours of costly LLM fine-tuning retraining.
> 3. **Source Attribution**: RAG allows us to return precise article source links alongside generated answers.

---

### Q2: How does your chunking strategy work, and why not split by fixed character length?
> **Answer**:  
> Fixed character chunking breaks mid-sentence or mid-code block, destroying semantic context. My pipeline in [chunker.js](file:///c:/Users/Aditya%20Kumar%20Singh/OneDrive/Desktop/nodejspractice/1portfolio/server/modules/rag/ingestion/chunker.js) uses **heading-aware section chunking** (`##` and `###` boundaries in MDX). Each chunk is enriched with a context prefix (`Article: Title | Section: Heading`). If a section exceeds 2800 characters (~700 tokens), it splits with a 2-sentence tail overlap to prevent context loss across boundaries.

---

### Q3: What vector database and embedding model are you using?
> **Answer**:  
> I use **Qdrant Vector Database** ([indexer.js](file:///c:/Users/Aditya%20Kumar%20Singh/OneDrive/Desktop/nodejspractice/1portfolio/server/modules/rag/ingestion/indexer.js)) with **Cosine Distance** indexing 3072-dimensional vectors generated by Google's **`gemini-embedding-001`** model ([embedder.js](file:///c:/Users/Aditya%20Kumar%20Singh/OneDrive/Desktop/nodejspractice/1portfolio/server/modules/rag/ingestion/embedder.js)). Qdrant provides sub-millisecond payload filtering (`article_slug`, `category`, `tags`) and supports deterministic hash-based incremental indexing.

---

### Q4: How do you handle follow-up questions in multi-turn conversation?
> **Answer**:  
> Through a two-stage process in [query-processor.js](file:///c:/Users/Aditya%20Kumar%20Singh/OneDrive/Desktop/nodejspractice/1portfolio/server/modules/rag/retrieval/query-processor.js):
> 1. Before retrieval, a lightweight LLM (`gemini-3.5-flash-lite`) rewrites multi-turn queries containing pronouns ("it", "this", "that") into fully explicit, standalone questions using the last 4 turns of history.
> 2. The standalone query is then embedded and retrieved against Qdrant, ensuring high vector recall.

---

### Q5: How do you prevent the LLM from answering off-topic questions?
> **Answer**:  
> Through **Dynamic Confidence Tiering** in [retriever.js](file:///c:/Users/Aditya%20Kumar%20Singh/OneDrive/Desktop/nodejspractice/1portfolio/server/modules/rag/retrieval/retriever.js):
> If the top vector similarity score in Qdrant is below `0.38`, the retriever marks the query as Low Confidence and returns 0 chunks. The LLM system prompt in [generator.js](file:///c:/Users/Aditya%20Kumar%20Singh/OneDrive/Desktop/nodejspractice/1portfolio/server/modules/rag/generation/generator.js) then instructs the bot to politely inform the user that the blog knowledge base does not cover that topic, completely preventing off-topic hallucinations.

---

### Q6: How is hybrid search implemented in your system?
> **Answer**:  
> The system in [retriever.js](file:///c:/Users/Aditya%20Kumar%20Singh/OneDrive/Desktop/nodejspractice/1portfolio/server/modules/rag/retrieval/retriever.js) combines dense vector semantic search with metadata keyword boosting using **Reciprocal Rank Fusion (RRF)**:
> 1. Qdrant performs dense cosine vector search.
> 2. Metadata processor adds $+0.15$ bonus for tag matches and $+0.20$ for category matches.
> 3. RRF formula $RRF(d) = \frac{1}{60 + R_{vec}} + \frac{1}{60 + R_{meta}}$ fuses the two ranked lists to select the optimal top 6 chunks.

---

### Q7: What happens if Gemini API hits rate limits during generation?
> **Answer**:  
> The server implements an automated **Model Rotation Chain** in [generator.js](file:///c:/Users/Aditya%20Kumar%20Singh/OneDrive/Desktop/nodejspractice/1portfolio/server/modules/rag/generation/generator.js). If `gemini-3.5-flash-lite` returns HTTP `429` (rate limit), the generator seamlessly falls back to `gemini-3.6-flash` within 2 seconds without dropping the user's connection.

---

### Q8: How does the frontend handle streaming and UI alignment?
> **Answer**:  
> The backend streams text tokens over **Server-Sent Events (SSE)** ([routes/rag.js](file:///c:/Users/Aditya%20Kumar%20Singh/OneDrive/Desktop/nodejspractice/1portfolio/server/routes/rag.js)). The React frontend ([useRAGChat.ts](file:///c:/Users/Aditya%20Kumar%20Singh/OneDrive/Desktop/nodejspractice/1portfolio/client/src/hooks/useRAGChat.ts)) parses the stream buffer in real-time. To ensure an executive reading experience, when a new bot bubble appears, the chat window applies ChatGPT-style top-alignment scrolling ([RAGChatWidget.tsx](file:///c:/Users/Aditya%20Kumar%20Singh/OneDrive/Desktop/nodejspractice/1portfolio/client/src/components/articles/RAGChatWidget.tsx)), positioning the top of the answer at the top of the viewport while text streams smoothly below.

---

## 🛠️ Summary File Reference Map

| Component | File Path | Key Responsibilities |
|---|---|---|
| **MDX Parser** | [mdx-parser.js](file:///c:/Users/Aditya%20Kumar%20Singh/OneDrive/Desktop/nodejspractice/1portfolio/server/modules/rag/ingestion/mdx-parser.js) | Strips frontmatter/JSX, extracts headings, computes MD5 hash |
| **Chunker** | [chunker.js](file:///c:/Users/Aditya%20Kumar%20Singh/OneDrive/Desktop/nodejspractice/1portfolio/server/modules/rag/ingestion/chunker.js) | Heading-aware chunking, context prefixing, tail sentence overlap |
| **Embedder** | [embedder.js](file:///c:/Users/Aditya%20Kumar%20Singh/OneDrive/Desktop/nodejspractice/1portfolio/server/modules/rag/ingestion/embedder.js) | Gemini `gemini-embedding-001` (3072-dim), batching, backoff retry |
| **Indexer** | [indexer.js](file:///c:/Users/Aditya%20Kumar%20Singh/OneDrive/Desktop/nodejspractice/1portfolio/server/modules/rag/ingestion/indexer.js) | Qdrant collection creation, payload indexing, incremental upsert |
| **Query Processor** | [query-processor.js](file:///c:/Users/Aditya%20Kumar%20Singh/OneDrive/Desktop/nodejspractice/1portfolio/server/modules/rag/retrieval/query-processor.js) | LLM standalone query rewriting, metadata tag extraction |
| **Retriever** | [retriever.js](file:///c:/Users/Aditya%20Kumar%20Singh/OneDrive/Desktop/nodejspractice/1portfolio/server/modules/rag/retrieval/retriever.js) | Vector search, article scoping, confidence cutoffs, RRF fusion |
| **Generator** | [generator.js](file:///c:/Users/Aditya%20Kumar%20Singh/OneDrive/Desktop/nodejspractice/1portfolio/server/modules/rag/generation/generator.js) | System prompt, model rotation chain, SSE streaming, follow-ups |
| **Pipeline** | [pipeline.js](file:///c:/Users/Aditya%20Kumar%20Singh/OneDrive/Desktop/nodejspractice/1portfolio/server/modules/rag/pipeline.js) | Orchestrates retrieval + generation, 10-min response LRU cache |
| **Chat Hook** | [useRAGChat.ts](file:///c:/Users/Aditya%20Kumar%20Singh/OneDrive/Desktop/nodejspractice/1portfolio/client/src/hooks/useRAGChat.ts) | React SSE connection, message state, session management |
| **Chat Widget UI** | [RAGChatWidget.tsx](file:///c:/Users/Aditya%20Kumar%20Singh/OneDrive/Desktop/nodejspractice/1portfolio/client/src/components/articles/RAGChatWidget.tsx) | Dual-mode floating/embedded UI, top-scroll alignment, source pills |
| **Split Studio View** | [ArticleDetail.tsx](file:///c:/Users/Aditya%20Kumar%20Singh/OneDrive/Desktop/nodejspractice/1portfolio/client/src/pages/ArticleDetail.tsx) | 3-column studio split layout state and Framer Motion transitions |
