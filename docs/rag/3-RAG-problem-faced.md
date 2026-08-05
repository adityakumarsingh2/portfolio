# Branch Walkthrough: `feature/articles-rag`

This walkthrough documents the technical design, implementation details, and features added to support the article-scoped RAG (Retrieval-Augmented Generation) pipeline, optimize resource usage, and handle Gemini API rate limits gracefully on Google AI Studio's free tier.

---

## 📖 Table of Contents
1. [Overview & Goal](#-overview--goal)
2. [Core Problems & Solutions](#-core-problems--solutions)
   - [Gemini API billing restriction (False 429s)](#1-gemini-api-billing-restriction-false-429s)
   - [Model Names Migration](#2-model-names-migration)
   - [Infinite Retry Loop & Cooldown](#3-infinite-retry-loop--cooldown)
   - [Article-Scoped Retrieval](#4-article-scoped-retrieval)
   - [Response Caching](#5-response-caching)
   - [Client-Side Error Propagation & Cooldown UI](#6-client-side-error-propagation--cooldown-ui)
3. [File-by-File Changes Summary](#-file-by-file-changes-summary)
4. [Testing & Verification](#-testing--verification)

---

## 🎯 Overview & Goal

The RAG chatbot on the portfolio website allows readers to query the author's technical articles. The goal of this branch was to:
1. Optimize pipeline performance by restricting vector retrieval to **only** the article page the user is currently viewing.
2. Resolve severe API issues where requests immediately failed with `429` (Rate Limited) errors on the Google Gemini API.
3. Cache identical queries to avoid unnecessary LLM calls.
4. Elevate the user experience by giving transparent error alerts and disabling chat inputs during rate-limit cooldowns.

---

## 🛠️ Core Problems & Solutions

### 1. Gemini API Billing Restriction (False 429s)
* **Problem**: The original code configured `googleSearch: {}` as a tool for Google Search Grounding. Under the Gemini API free tier, using search grounding results in an immediate HTTP `429 (Rate Limit)` instead of a permission error, causing all API requests to fail immediately.
* **Solution**: Removed search grounding tools from the model configuration in [generator.js](file:///c:/Users/Aditya%20Kumar%20Singh/OneDrive/Desktop/nodejspractice/1portfolio/server/modules/rag/generation/generator.js). The model now performs plain generation based solely on the article context.

### 2. Model Names Migration
* **Problem**: Deprecated or non-existent model names like `gemini-3.1-flash-lite` and `gemini-2.5-flash` caused API errors.
* **Solution**: Migrated to Generally Available (GA) Gemini 3 family models in [generator.js](file:///c:/Users/Aditya%20Kumar%20Singh/OneDrive/Desktop/nodejspractice/1portfolio/server/modules/rag/generation/generator.js) and [index.js](file:///c:/Users/Aditya%20Kumar%20Singh/OneDrive/Desktop/nodejspractice/1portfolio/server/index.js):
  * **Primary**: `gemini-3.5-flash-lite` (low latency, cost-effective).
  * **Fallback**: `gemini-3.6-flash` (latest flagship Flash).

### 3. Infinite Retry Loop & Cooldown
* **Problem**: The generator originally had an infinite retry loop with a 62-second wait time upon hitting rate limits. This caused requests to hang indefinitely.
* **Solution**: Added a `MAX_CYCLES = 0` policy to fail fast on rate limits, throwing a custom `RateLimitExhaustedError`. Included a 2-second switch delay (`MODEL_SWITCH_DELAY_MS = 2000`) between rotation models to prevent rapid consecutive rate limits.

### 4. Article-Scoped Retrieval
* **Problem**: The RAG pipeline retrieved chunks from *all* articles, increasing context size and processing time unnecessarily.
* **Solution**: Scoped retrieval to only the current article page.
  * The frontend extracts the article slug and passes it to the API.
  * [retriever.js](file:///c:/Users/Aditya%20Kumar%20Singh/OneDrive/Desktop/nodejspractice/1portfolio/server/modules/rag/retrieval/retriever.js) uses Qdrant's filter matching rules (`article_slug`) to search vectors within that article only.

### 5. Response Caching
* **Problem**: Repeating identical queries hit the Gemini API repeatedly, wasting RPM quota.
* **Solution**: Created a 10-minute in-memory `responseCache` in [pipeline.js](file:///c:/Users/Aditya%20Kumar%20Singh/OneDrive/Desktop/nodejspractice/1portfolio/server/modules/rag/pipeline.js). Cached items are stored with their corresponding article slugs. When hit, the cache stream-replays chunks instantly, mimicking the live API response.

### 6. Client-Side Error Propagation & Cooldown UI
* **Problem**: An inner `try-catch` swallowed server SSE error packets. In addition, the chat UI did not prevent users from sending messages when rate-limited.
* **Solution**:
  * Separated the JSON parsing try-catch from event dispatching inside [useRAGChat.ts](file:///c:/Users/Aditya%20Kumar%20Singh/OneDrive/Desktop/nodejspractice/1portfolio/client/src/hooks/useRAGChat.ts) to let errors propagate to the UI message bubbles.
  * Added a client-side 65-second countdown timer triggered by 429/busy errors.
  * The [RAGChatWidget.tsx](file:///c:/Users/Aditya%20Kumar%20Singh/OneDrive/Desktop/nodejspractice/1portfolio/client/src/components/articles/RAGChatWidget.tsx) disables inputs, shows countdown placeholders, and styles the container amber when locked.

---

## 🗂️ File-by-File Changes Summary

### Backend Changes

#### 📂 [server/modules/rag/generation/generator.js](file:///c:/Users/Aditya%20Kumar%20Singh/OneDrive/Desktop/nodejspractice/1portfolio/server/modules/rag/generation/generator.js)
* Configured `MODEL_CHAIN` array: `["gemini-3.5-flash-lite", "gemini-3.6-flash"]`.
* Stripped `tools: [{ googleSearch: {} }]` and removed fallback functions.
* Implemented `RateLimitExhaustedError` and set `MAX_CYCLES = 0` to fail fast.
* Added `MODEL_SWITCH_DELAY_MS` delay before model switching.

#### 📂 [server/modules/rag/pipeline.js](file:///c:/Users/Aditya%20Kumar%20Singh/OneDrive/Desktop/nodejspractice/1portfolio/server/modules/rag/pipeline.js)
* Built `responseCache` (Map) with `CACHE_TTL_MS` (10 minutes) and automated prune intervals.
* Added `articleSlug` to `runRAGPipeline` and forwarded it to `retrieve()`.
* Setup chunk accumulation to populate cache on successful response.

#### 📂 [server/modules/rag/retrieval/retriever.js](file:///c:/Users/Aditya%20Kumar%20Singh/OneDrive/Desktop/nodejspractice/1portfolio/server/modules/rag/retrieval/retriever.js)
* Updated `retrieve()` signature to accept `articleSlug`.
* Dynamically injected Qdrant filter parameter `article_slug` on search.
```javascript
if (articleSlug) {
  searchParams.filter = {
    must: [{ key: "article_slug", match: { value: articleSlug } }],
  };
}
```

#### 📂 [server/index.js](file:///c:/Users/Aditya%20Kumar%20Singh/OneDrive/Desktop/nodejspractice/1portfolio/server/index.js)
* Decoded `articleSlug` from the `req.body` inside `/api/articles/chat`.
* Updated portfolio chatbot model parameter `modelName` to `gemini-3.5-flash-lite`.

---

### Frontend Changes

#### 📂 [client/src/pages/ArticleDetail.tsx](file:///c:/Users/Aditya%20Kumar%20Singh/OneDrive/Desktop/nodejspractice/1portfolio/client/src/pages/ArticleDetail.tsx)
* Imported and rendered `<RAGChatWidget articleSlug={slug} />`.

#### 📂 [client/src/components/articles/RAGChatWidget.tsx](file:///c:/Users/Aditya%20Kumar%20Singh/OneDrive/Desktop/nodejspractice/1portfolio/client/src/components/articles/RAGChatWidget.tsx)
* Received `articleSlug` as a component prop.
* Bound user submission actions (`handleSend` and `handleSuggest`) to block when `cooldownSecondsLeft > 0`.
* Altered CSS styles, placeholder copy, and footer status to reflect countdown locks.

#### 📂 [client/src/hooks/useRAGChat.ts](file:///c:/Users/Aditya%20Kumar%20Singh/OneDrive/Desktop/nodejspractice/1portfolio/client/src/hooks/useRAGChat.ts)
* Added `articleSlug` support to hook arguments and output payload.
* Implemented automatic state clearing and session recreation when switching articles via `useEffect` tracking `articleSlug`.
* Extracted client-side countdown timer loop `startCooldown()`.
* Isolated JSON parsing so server-thrown SSE errors surface properly to the frontend.

---

## 🧪 Testing & Verification

### Scoping & Retrieval Verification
Upon starting the chatbot on `/articles/building-a-rag-system-from-scratch`, the backend output logs show:
```
[pipeline] Query: "What chunking strategies work best for RAG?..." [scoped to: building-a-rag-system-from-scratch]
[retriever] Scoped to article: "building-a-rag-system-from-scratch"
[retriever] Retrieved 6 chunks from 1 article(s) (scoped)
```

### Cache HIT Verification
Submitting the same question again should prompt a cache replay bypassing Gemini model calls:
```
[pipeline] Query: "What chunking strategies work best for RAG?..." [scoped to: building-a-rag-system-from-scratch]
[pipeline] Cache HIT — replaying cached response (1430 chars)
```

### Cooldown UI Verification
If a `429` error is thrown:
1. Server logs:
   ```
   [generator] Rate limit exhausted across all models and 1 cycle(s). Giving up.
   ```
2. Client intercepts error event and sets `cooldownSecondsLeft` to `65`.
3. Widget UI transforms:
   - Textarea placeholder: `Rate limited — ready in 65s…`
   - Footer warning: `⏳ API rate limited — ready in 65s`
   - Border colors turn amber and input actions are locked.
