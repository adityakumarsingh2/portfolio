import type { Article } from "@/types/article";

// ---------------------------------------------------------------------------
// Cover images — premium SVGs bundled directly by Vite
// ---------------------------------------------------------------------------
import coverAi from "@/assets/article-cover-ai.svg";
import coverSystemDesign from "@/assets/article-cover-system-design.svg";
import coverWebDev from "@/assets/article-cover-webdev.svg";

export const articlesData: Article[] = [
  // ─── FEATURED: AI / RAG ────────────────────────────────────────────────────
  {
    slug: "building-rag-from-scratch",
    title: "Building a RAG System from Scratch",
    subtitle: "A deep-dive into Retrieval-Augmented Generation: embeddings, vector databases, and production-ready pipelines",
    excerpt:
      "RAG is transforming how AI applications handle knowledge. In this guide, I break down every layer of a production RAG pipeline—from chunking strategies and embedding models to vector search, re-ranking, and LLM prompt engineering.",
    content: `
<h2 id="what-is-rag">What is RAG?</h2>
<p>Retrieval-Augmented Generation (RAG) is an AI architecture that combines a retrieval system with a generative language model. Instead of relying solely on parametric knowledge baked into LLM weights, RAG queries an external knowledge base at inference time, fetching relevant context that is then injected into the prompt.</p>
<p>This approach solves two fundamental problems: hallucination and knowledge staleness. By grounding the model's responses in retrieved documents, we get factually accurate, up-to-date answers without costly fine-tuning.</p>

<h2 id="architecture-overview">Architecture Overview</h2>
<p>A production RAG system has five core stages:</p>
<ul>
<li><strong>Document ingestion</strong> — parsing, cleaning, and chunking raw documents</li>
<li><strong>Embedding generation</strong> — transforming text chunks into dense vector representations</li>
<li><strong>Vector storage</strong> — indexing embeddings in a vector database for similarity search</li>
<li><strong>Retrieval</strong> — finding the most relevant chunks for a given query</li>
<li><strong>Generation</strong> — feeding retrieved context to an LLM and returning the response</li>
</ul>

<h2 id="chunking-strategies">Chunking Strategies</h2>
<p>The quality of your RAG system lives and dies by your chunking strategy. Chunks that are too small lose semantic context. Chunks that are too large introduce noise and hit token limits.</p>
<p>I've tested four strategies in production:</p>

<h3 id="fixed-size-chunking">1. Fixed-Size Chunking</h3>
<p>The simplest approach: split documents into chunks of N tokens with M tokens of overlap.</p>

<pre><code class="language-python" data-filename="chunker.py">def fixed_size_chunk(text: str, chunk_size: int = 512, overlap: int = 64) -> list[str]:
    tokens = tokenizer.encode(text)
    chunks = []
    start = 0
    while start < len(tokens):
        end = min(start + chunk_size, len(tokens))
        chunk = tokenizer.decode(tokens[start:end])
        chunks.append(chunk)
        start += chunk_size - overlap
    return chunks</code></pre>

<p>Works well for uniform documents. Falls apart with structured content like markdown or code.</p>

<h3 id="semantic-chunking">2. Semantic Chunking</h3>
<p>Group sentences by embedding similarity, creating chunks that are semantically coherent rather than arbitrarily split. Requires an embedding call per sentence, so it's slower but produces significantly better retrieval quality.</p>

<h2 id="embedding-models">Choosing an Embedding Model</h2>
<p>The embedding model determines how well semantic similarity maps to your domain. My current recommendations:</p>

<callout type="info">
<strong>For general-purpose RAG:</strong> Use <code>text-embedding-3-small</code> (OpenAI) — 1536 dimensions, excellent cost/performance ratio at $0.02/1M tokens.
</callout>

<callout type="warning">
<strong>For privacy-sensitive deployments:</strong> Run <code>nomic-embed-text</code> or <code>mxbai-embed-large</code> locally via Ollama. Comparable quality to proprietary models, zero data egress.
</callout>

<h2 id="vector-databases">Vector Databases</h2>
<p>Your choice of vector database significantly impacts latency and scalability. Here's a quick comparison of the top options:</p>

<table>
<thead><tr><th>Database</th><th>Hosting</th><th>Latency (p99)</th><th>Best For</th></tr></thead>
<tbody>
<tr><td>Pinecone</td><td>Managed</td><td>~50ms</td><td>Production, scale-up</td></tr>
<tr><td>Weaviate</td><td>Self/Managed</td><td>~30ms</td><td>Hybrid search</td></tr>
<tr><td>Qdrant</td><td>Self/Managed</td><td>~20ms</td><td>High-throughput</td></tr>
<tr><td>ChromaDB</td><td>Self</td><td>~10ms</td><td>Prototyping</td></tr>
<tr><td>pgvector</td><td>PostgreSQL</td><td>~80ms</td><td>Existing Postgres</td></tr>
</tbody>
</table>

<h2 id="retrieval-pipeline">The Retrieval Pipeline</h2>
<p>Naive vector search retrieves the top-K chunks by cosine similarity. This works for simple cases but fails with complex queries that require multi-hop reasoning or where common terms dominate the embedding space.</p>

<h3 id="hybrid-search">Hybrid Search</h3>
<p>Combine dense vector search with sparse BM25 retrieval using Reciprocal Rank Fusion (RRF):</p>

<pre><code class="language-python" data-filename="retriever.py">def hybrid_retrieve(query: str, k: int = 10) -> list[Document]:
    # Dense retrieval
    query_embedding = embed(query)
    dense_results = vector_store.similarity_search(query_embedding, k=k*2)
    
    # Sparse retrieval (BM25)
    sparse_results = bm25_index.search(query, k=k*2)
    
    # Reciprocal Rank Fusion
    return rrf_merge(dense_results, sparse_results, k=k)</code></pre>

<h3 id="reranking">Re-ranking</h3>
<p>After initial retrieval, pass results through a cross-encoder re-ranker (e.g., Cohere Rerank or <code>cross-encoder/ms-marco-MiniLM-L-6-v2</code>). Re-rankers are slower but dramatically improve precision because they compute query-document relevance jointly rather than independently.</p>

<h2 id="prompt-engineering">Prompt Engineering for RAG</h2>
<p>The prompt template is where retrieval quality meets generation quality. Key principles:</p>
<ul>
<li>Inject retrieved context before the user query, not after</li>
<li>Explicitly instruct the model to answer only from context</li>
<li>Include a fallback: "If the answer is not in the context, say so"</li>
<li>Add source attribution instructions for verifiability</li>
</ul>

<pre><code class="language-python" data-filename="prompts.py">RAG_PROMPT = """You are a precise technical assistant. Answer the question using ONLY the context provided below.
If the answer cannot be found in the context, respond with: "I don't have enough information to answer that."

CONTEXT:
{context}

QUESTION: {query}

ANSWER:"""</code></pre>

<h2 id="production-considerations">Production Considerations</h2>
<callout type="success">
<strong>Performance wins I've shipped:</strong> Query caching with Redis (semantic deduplication reduces LLM calls by ~40%), async embedding generation pipelines, streaming responses with <code>async for chunk in llm.stream(prompt)</code>.
</callout>

<h2 id="whats-next">What's Next</h2>
<p>In Part 2, I'll cover advanced topics: agentic RAG with multi-step retrieval, graph RAG for relationship-heavy domains, and evaluation frameworks (RAGAS, TruLens) for measuring retrieval quality in production.</p>
<p>If you're building a RAG system, reach out — I'm happy to talk architecture.</p>
    `.trim(),
    coverImage: coverAi,
    publishedDate: "2026-07-10T00:00:00.000Z",
    updatedDate: "2026-07-14T00:00:00.000Z",
    category: "AI",
    tags: ["RAG", "LLM", "Vector DB", "Python", "AI Engineering", "Embeddings"],
    readingTime: 12,
    featured: true,
    draft: false,
    seoTitle: "Building a RAG System from Scratch | Aditya Kumar Singh",
    seoDescription:
      "A comprehensive guide to building production-ready Retrieval-Augmented Generation (RAG) systems — covering chunking, embeddings, vector databases, hybrid search, and prompt engineering.",
    ogImage: coverAi,
    author: {
      name: "Aditya Kumar Singh",
      title: "Full-Stack Engineer & AI Builder",
    },
  },

  // ─── SYSTEM DESIGN ────────────────────────────────────────────────────────
  {
    slug: "designing-scalable-apis",
    title: "Designing Scalable APIs: Patterns I've Learned the Hard Way",
    subtitle: "From REST anti-patterns to production-grade API design: rate limiting, versioning, pagination, and error handling",
    excerpt:
      "After building APIs for apps serving thousands of users, I've learned that the difference between a good API and a great one isn't features—it's the 20% of decisions that prevent you from being paged at 3am.",
    content: `
<h2 id="the-api-contract">The API as a Contract</h2>
<p>An API is a promise to your consumers. Break that promise—change a field name, remove an endpoint, alter error formats—and you break every client that depends on you. The principles in this article are all about making promises you can keep.</p>

<h2 id="versioning-strategy">Versioning Strategy</h2>
<p>The most common mistake: shipping v1 with no versioning plan, then scrambling when you need breaking changes. Here are the three main approaches:</p>

<table>
<thead><tr><th>Strategy</th><th>Example</th><th>Pros</th><th>Cons</th></tr></thead>
<tbody>
<tr><td>URI versioning</td><td><code>/api/v1/users</code></td><td>Explicit, cacheable</td><td>URL pollution</td></tr>
<tr><td>Header versioning</td><td><code>Accept: application/vnd.api+json;v=1</code></td><td>Clean URLs</td><td>Harder to test in browser</td></tr>
<tr><td>Query param</td><td><code>/api/users?version=1</code></td><td>Simple</td><td>Often forgotten</td></tr>
</tbody>
</table>

<p>I use URI versioning for public APIs and header versioning for internal microservice communication. Consistency matters more than which you choose.</p>

<h2 id="rate-limiting">Rate Limiting That Doesn't Hurt Good Users</h2>
<p>Naive rate limiting (global fixed window) punishes legitimate burst traffic. Instead, implement token bucket or sliding window per user/IP:</p>

<pre><code class="language-javascript" data-filename="rateLimit.js">import { RateLimiter } from 'limiter';

const limiters = new Map();

function getRateLimiter(userId) {
  if (!limiters.has(userId)) {
    // 100 requests per minute, refill smoothly
    limiters.set(userId, new RateLimiter({ 
      tokensPerInterval: 100, 
      interval: 'minute' 
    }));
  }
  return limiters.get(userId);
}

async function rateLimitMiddleware(req, res, next) {
  const limiter = getRateLimiter(req.userId);
  const remaining = await limiter.removeTokens(1);
  
  res.setHeader('X-RateLimit-Remaining', Math.max(0, remaining));
  res.setHeader('X-RateLimit-Reset', Date.now() + 60000);
  
  if (remaining < 0) {
    return res.status(429).json({
      error: 'rate_limit_exceeded',
      message: 'Too many requests. Please retry after 60 seconds.',
      retryAfter: 60
    });
  }
  next();
}</code></pre>

<h2 id="error-handling">Consistent Error Responses</h2>
<p>Nothing is more frustrating than an API that returns different error shapes on every endpoint. Define a single error envelope and stick to it:</p>

<pre><code class="language-json" data-filename="error-response.json">{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "The request body contains invalid fields.",
    "details": [
      {
        "field": "email",
        "message": "Must be a valid email address",
        "value": "not-an-email"
      }
    ],
    "requestId": "req_01HX9KPQX7Z...",
    "timestamp": "2026-07-10T14:23:11.000Z",
    "docs": "https://docs.yourapi.com/errors/VALIDATION_ERROR"
  }
}</code></pre>

<callout type="info">
Always include a <code>requestId</code> in every response — both success and error. This single field saves hours of debugging when correlating logs across services.
</callout>

<h2 id="pagination">Pagination Done Right</h2>
<p>Offset pagination (<code>?page=5&limit=20</code>) is an anti-pattern for large datasets. As data changes, pages shift, causing duplicate or missing items. Use cursor-based pagination instead:</p>

<pre><code class="language-javascript" data-filename="pagination.js">// Cursor-based pagination
async function getUsers(cursor, limit = 20) {
  const users = await db.users
    .where('id', '>', decodeCursor(cursor))
    .orderBy('id', 'asc')
    .limit(limit + 1) // fetch one extra to know if there's a next page
    .get();
  
  const hasNextPage = users.length > limit;
  const items = hasNextPage ? users.slice(0, limit) : users;
  
  return {
    data: items,
    pagination: {
      hasNextPage,
      nextCursor: hasNextPage ? encodeCursor(items[items.length - 1].id) : null,
      count: items.length
    }
  };
}</code></pre>

<h2 id="idempotency">Idempotency Keys</h2>
<p>For any state-mutating operation (payments, order creation, resource allocation), require clients to send an idempotency key. Store results keyed by this value and return cached responses on duplicate requests:</p>

<callout type="warning">
Without idempotency keys, network retries can double-charge customers or create duplicate orders. This is non-negotiable for any financial or high-stakes mutation.
</callout>

<h2 id="observability">Observability from Day One</h2>
<p>Log structured JSON with: <code>requestId</code>, <code>userId</code>, <code>endpoint</code>, <code>method</code>, <code>statusCode</code>, <code>durationMs</code>, <code>errorCode</code>. Ship these to a log aggregator (Loki, Datadog, CloudWatch). Add metrics for p50/p95/p99 latency per endpoint. Set up alerts on error rate spikes.</p>

<p>If you can't answer "what's my 95th percentile latency on POST /orders?" within 30 seconds of being asked, your observability is insufficient.</p>

<h2 id="conclusion">The 3am Test</h2>
<p>For every API decision, ask: "Will I regret this at 3am when something goes wrong?" Versioning, idempotency, structured errors, and observability all pass this test. Clever shortcuts rarely do.</p>
    `.trim(),
    coverImage: coverSystemDesign,
    publishedDate: "2026-07-01T00:00:00.000Z",
    category: "System Design",
    tags: ["API Design", "REST", "Node.js", "Backend", "System Design", "Rate Limiting"],
    readingTime: 9,
    featured: false,
    draft: false,
    seoTitle: "Designing Scalable APIs: Patterns I've Learned the Hard Way | Aditya Kumar Singh",
    seoDescription:
      "Production-grade API design patterns covering versioning, rate limiting, cursor pagination, idempotency keys, error handling, and observability.",
    author: {
      name: "Aditya Kumar Singh",
      title: "Full-Stack Engineer & AI Builder",
    },
  },

  // ─── WEB DEVELOPMENT ──────────────────────────────────────────────────────
  {
    slug: "full-stack-architecture-2026",
    title: "Full-Stack Architecture in 2026: What's Actually Worth Learning",
    subtitle: "Cutting through the hype: the technologies, patterns, and mental models that matter for building production web applications today",
    excerpt:
      "The JavaScript ecosystem moves fast. After building four production apps this year, here's my opinionated take on what's genuinely valuable versus what's just trend-chasing.",
    content: `
<h2 id="the-paradox">The Paradox of Choice</h2>
<p>Ask ten developers how to build a full-stack app in 2026 and you'll get twelve different answers. Next.js or Remix? Prisma or Drizzle? REST or tRPC? GraphQL or just... REST again? The tooling landscape has never been richer—or more overwhelming.</p>
<p>After building ConfessIt, FitKart, and several other production applications this year, I've developed strong opinions about what actually matters. Here's my current take.</p>

<h2 id="the-stack">My Current Stack and Why</h2>
<p>For most applications, I reach for:</p>
<ul>
<li><strong>Frontend:</strong> React 18 + Vite + TypeScript + TailwindCSS</li>
<li><strong>Backend:</strong> Node.js + Express (or Hono for edge) + TypeScript</li>
<li><strong>Database:</strong> PostgreSQL + Prisma ORM (or MongoDB for document-heavy apps)</li>
<li><strong>Auth:</strong> Passport.js or Lucia v3 for sessions, Clerk for OAuth-heavy apps</li>
<li><strong>Deployment:</strong> Vercel (frontend) + Railway/Render (backend)</li>
</ul>

<callout type="info">
This isn't a recommendation to copy my stack. The right stack depends on your team's experience, the problem domain, and your scaling requirements. But these tools earn their place by being boring in the right ways.
</callout>

<h2 id="react-still-dominates">React Still Dominates (And Will for Years)</h2>
<p>Despite the rise of Svelte, Solid, Qwik, and Astro, React remains the dominant choice for complex application UIs in 2026. Not because it's the best in every benchmark, but because of the ecosystem:</p>
<ul>
<li>Every UI library ships React-first</li>
<li>The largest talent pool</li>
<li>React Server Components are maturing and genuinely useful</li>
<li>The mental model of components + hooks has proven itself at scale</li>
</ul>
<p>If you're building something where SEO is critical and interactivity is secondary, consider Astro. For everything else, React remains the pragmatic choice.</p>

<h2 id="typescript-is-mandatory">TypeScript is Non-Negotiable</h2>
<p>I used to think TypeScript was optional for small projects. I was wrong. Even solo projects benefit enormously from TypeScript:</p>

<pre><code class="language-typescript" data-filename="api.ts">// Without TypeScript: you find this bug in production
async function getUser(id) {
  const user = await db.users.findOne(id);
  return user.profile.avatar; // TypeError: Cannot read properties of undefined
}

// With TypeScript: you find it at compile time
async function getUser(id: string): Promise<User> {
  const user = await db.users.findOne(id);
  // TypeScript forces you to handle the null case
  if (!user) throw new NotFoundError('User not found');
  return user;
}</code></pre>

<p>The upfront cost of typing is always less than the downstream cost of production bugs. Enable <code>strict: true</code> from day one.</p>

<h2 id="server-state-management">Server State is Different from Client State</h2>
<p>The biggest architectural mistake I see in React apps: putting everything in global client state (Redux, Zustand) when most of it is server state. Server state has different characteristics:</p>
<ul>
<li>It's owned by the server, not the client</li>
<li>It can become stale</li>
<li>Multiple components may need the same data</li>
<li>It needs loading and error states</li>
</ul>
<p>TanStack Query (React Query) handles server state beautifully. Keep client state (UI toggles, form state) local with <code>useState</code> or <code>useReducer</code>. Don't reach for Zustand until you have genuinely complex cross-component client state.</p>

<h2 id="css-in-2026">CSS in 2026</h2>
<p>TailwindCSS has won. The utility-first approach is now mainstream, the ecosystem is mature, and the DX advantages compound over time. Stop debating it and learn the utility classes.</p>

<callout type="warning">
One thing Tailwind doesn't solve: design consistency. You still need a design system. Define your color palette, typography scale, spacing system, and component variants as Tailwind config tokens, not ad-hoc classes scattered across components.
</callout>

<h2 id="what-to-ignore">Things That Are Overhyped Right Now</h2>
<p>Some honest takes on trends worth approaching carefully:</p>
<ul>
<li><strong>Micro-frontends:</strong> Solve organizational problems, not technical ones. Most teams don't need them.</li>
<li><strong>GraphQL:</strong> Still adds complexity faster than it adds value for most apps. REST + tRPC handles 95% of use cases better.</li>
<li><strong>Edge-first everything:</strong> Edge functions are brilliant for auth middleware and A/B testing. For database-backed APIs, you still need a regional server close to your database.</li>
</ul>

<h2 id="what-actually-matters">What Actually Matters</h2>
<p>After all the framework churn, the skills that produce the best engineers are timeless:</p>
<ol>
<li>Understanding HTTP deeply — caching, methods, status codes, headers</li>
<li>Database design — normalization, indexing, query planning</li>
<li>System design fundamentals — CAP theorem, consistency models, distributed systems basics</li>
<li>Security — OWASP top 10, authentication/authorization patterns</li>
<li>Performance intuition — where bottlenecks actually are vs. where you assume they are</li>
</ol>

<p>The specific tools will change. These fundamentals won't.</p>

<h2 id="final-thought">Final Thought</h2>
<p>Build things. Ship them. Learn from production. No tutorial, blog post, or YouTube series—including this one—substitutes for the feedback loop of real users interacting with your code. Pick a stack, commit to it long enough to feel its sharp edges, then make informed decisions.</p>
    `.trim(),
    coverImage: coverWebDev,
    publishedDate: "2026-06-20T00:00:00.000Z",
    category: "Web Development",
    tags: ["React", "TypeScript", "Full-Stack", "Architecture", "Node.js", "TailwindCSS"],
    readingTime: 8,
    featured: false,
    draft: false,
    seoTitle: "Full-Stack Architecture in 2026: What's Actually Worth Learning | Aditya Kumar Singh",
    seoDescription:
      "An opinionated guide to full-stack development in 2026: the technologies, patterns, and mental models worth investing in, and the hype worth ignoring.",
    author: {
      name: "Aditya Kumar Singh",
      title: "Full-Stack Engineer & AI Builder",
    },
  },
];
