# Aditya Kumar Singh — Personal Portfolio

> A premium, production-grade full-stack developer portfolio with an integrated **AI chatbot** and a full **RAG-powered Articles engine** — built to leave a lasting first impression.

🌐 **Live:** [adityakumarsingh.tech](https://adityakumarsingh.tech)

---

## ✨ Overview

This is not your average portfolio. It is a **production-grade, full-stack web application** built to showcase skills, freelance experience, projects, achievements, and GitHub activity in an interactive and visually stunning way.

The portfolio features a **dark-mode-first design aesthetic** with editorial typography, glassmorphism-inspired card styles, smooth scroll animations, a custom magnetic cursor, and two fully integrated AI systems:

1. **Portfolio AI Chatbot** — powered by Google Gemini Flash, answers visitor questions about Aditya in real-time with streaming responses.
2. **Articles RAG Chatbot** — a Retrieval-Augmented Generation (RAG) pipeline grounded in Aditya's actual article content, with semantic vector search via Qdrant, model fallback chaining, session memory, and follow-up suggestion chips.

---

## 🗂️ Project Structure

```
1portfolio/
├── client/                        # Frontend — React 18 + TypeScript + Vite
│   ├── src/
│   │   ├── components/
│   │   │   ├── Hero.tsx               # Hero section + IDE card + Chatbot tab
│   │   │   ├── Chatbot.tsx            # Portfolio AI chatbot (floating + inline)
│   │   │   ├── About.tsx              # About me section
│   │   │   ├── Skills.tsx             # Tech skills grid
│   │   │   ├── Projects.tsx           # Project showcase cards
│   │   │   ├── Experience.tsx         # Freelance experience timeline
│   │   │   ├── GitHubHeatmap.tsx      # Real-time GitHub contribution heatmap
│   │   │   ├── Contact.tsx            # Terminal-style contact section
│   │   │   ├── CustomCursor.tsx       # Magnetic custom cursor
│   │   │   ├── Navbar.tsx             # Sticky navigation bar
│   │   │   ├── Footer.tsx             # Footer component
│   │   │   ├── PageLoader.tsx         # Cinematic animated intro loader
│   │   │   ├── ScrollProgress.tsx     # Read-progress indicator bar
│   │   │   ├── RevealOnScroll.tsx     # Scroll-triggered reveal animations
│   │   │   └── articles/
│   │   │       ├── RAGChatWidget.tsx      # Articles RAG chatbot UI + SSE client
│   │   │       ├── MayIHelpYouPopup.tsx   # "May I help you?" animated speech-bubble nudge
│   │   │       ├── ArticleContent.tsx     # MDX article renderer
│   │   │       ├── TableOfContents.tsx    # Floating auto-generated ToC
│   │   │       ├── MarkdownRenderer.tsx   # Custom MDX component overrides
│   │   │       ├── ArticleSearch.tsx      # Debounced live search + category filter
│   │   │       ├── ArticleCard.tsx        # Article listing card
│   │   │       ├── FeaturedArticle.tsx    # Featured hero article card
│   │   │       ├── ReadingProgress.tsx    # Per-article scroll progress bar
│   │   │       ├── RelatedArticles.tsx    # Related content widget
│   │   │       ├── PrevNextNav.tsx        # Article ←/→ navigation
│   │   │       ├── ArticleFooter.tsx      # Article footer section
│   │   │       ├── ArticleMeta.tsx        # Date, read-time, tags metadata
│   │   │       ├── ArticleBreadcrumb.tsx  # Breadcrumb navigation
│   │   │       ├── ArticleShare.tsx       # Social share buttons
│   │   │       ├── ArticleGrid.tsx        # Article grid layout
│   │   │       ├── CategoryFilter.tsx     # Category filter chips
│   │   │       └── CodeBlock.tsx          # Syntax-highlighted code blocks
│   │   ├── hooks/
│   │   │   ├── useRAGChat.ts          # Articles RAG chat state + SSE stream logic
│   │   │   ├── useReadingProgress.ts  # rAF-throttled scroll progress hook
│   │   │   ├── useArticleSearch.ts    # Single-pass memoised article filter hook
│   │   │   ├── useTableOfContents.ts  # Auto-generates ToC from article headings
│   │   │   ├── useParallax.ts         # Parallax scroll effect hook
│   │   │   └── use-mobile.tsx         # Responsive breakpoint hook
│   │   ├── content/
│   │   │   └── articles/              # MDX article source files + metadata
│   │   ├── pages/
│   │   │   ├── Index.tsx              # Portfolio homepage
│   │   │   ├── Articles.tsx           # Articles listing page
│   │   │   └── ArticleDetail.tsx      # Split-view article reader + RAG chatbot
│   │   ├── lib/
│   │   │   └── utils.ts               # Shared utilities (incl. scrollToNearestUpperHeading)
│   │   └── types/
│   │       └── article.ts             # Article TypeScript types
│   ├── index.html
│   ├── vite.config.ts
│   └── package.json
│
└── server/                        # Backend — Node.js + Express
    ├── index.js                   # Main server: Gemini chat + RAG routes + security
    ├── .env                       # Local secrets (never commit — see .env.example)
    ├── .env.example               # Safe-to-commit env var template
    ├── package.json
    └── modules/
        ├── guardrails.js          # Prompt injection & jailbreak detection
        └── rag/
            ├── pipeline.js            # RAG orchestrator (query → retrieve → generate)
            ├── session-store.js       # In-memory conversation session store (TTL-evicted)
            ├── ingestion/
            │   ├── mdx-parser.js      # Parses MDX article files + frontmatter
            │   ├── chunker.js         # Splits articles into overlapping text chunks
            │   ├── embedder.js        # Embeds chunks via Gemini Embedding API
            │   └── indexer.js         # Upserts vectors into Qdrant (hash-diff aware)
            ├── retrieval/
            │   ├── query-processor.js # Standalone query rewriter + metadata extractor
            │   └── retriever.js       # Qdrant semantic vector retriever
            └── generation/
                └── generator.js       # Gemini streaming generator with model fallback
```

---

## 🤖 Portfolio AI Chatbot

The floating chatbot on the portfolio homepage is a **conversational AI assistant** representing Aditya on the website.

### Features
- **Real-time Streaming** — Responses stream token-by-token via Server-Sent Events (SSE).
- **Context-Aware** — Multi-turn history with a carefully crafted system prompt containing Aditya's full résumé.
- **Gemini-powered** — Uses `gemini-3.5-flash-lite` (Google's cost-efficient, low-latency model).
- **Dual Integration** — Available inline inside the Hero IDE card and as a floating global widget.
- **"May I Help You?" Nudge** — Animated speech-bubble pop-up appears after 4.5s, auto-dismisses after 6s with a progress bar, then loops every 20s until dismissed or chat is opened.
- **Singleton Model** — `getGenerativeModel()` is called once at startup, not per-request.

---

## 📚 Articles RAG Chatbot

The articles section features a dedicated **Retrieval-Augmented Generation (RAG)** chatbot grounded entirely in Aditya's actual article content.

### RAG Pipeline Architecture

```
User Query
    │
    ▼
[Guardrails]           ← Prompt injection / jailbreak detection
    │
    ▼
[Query Processor]      ← Rewrites follow-up references ("it", "this") into standalone queries
    │                     Extracts category/tag hints for retrieval boosting
    ▼
[Retriever]            ← Semantic vector search in Qdrant Cloud
    │                     Scores chunks by cosine similarity + metadata boosting
    ▼
[Response Cache]       ← 10-minute TTL in-memory cache (identical query = no Gemini call)
    │
    ▼
[Generator]            ← Gemini streaming with adaptive response depth:
    │                     Concise (100-200w) / Standard (250-450w) / Deep Dive (600-1000w)
    │                     Auto model fallback: gemini-3.5-flash-lite → gemini-3.6-flash
    ▼
[SSE Stream]           ← Streamed to client in real-time chunks
    │
    ▼
[Follow-up Chips]      ← 3 context-aware follow-up suggestions extracted from response
```

### RAG Features
- **Article-scoped retrieval** — In the article detail view, the chatbot can be optionally scoped to only retrieve from the currently open article.
- **Session memory** — Conversation history stored in-memory per session (TTL: 30 min, max 10 turns), auto-evicted every 5 minutes.
- **Hash-based incremental indexing** — Only re-indexes articles whose content has changed since the last run.
- **Model fallback chain** — On Gemini 429 rate limits, instantly switches to the next model in the chain with a 2-second delay.
- **"May I Help You?" Nudge** — Same animated pop-up system as the portfolio chatbot, with a 35-second repeat loop.
- **Scroll-aware expansion** — Opening the chatbot automatically scrolls to the nearest heading above the current viewport position.

---

## 🖥️ Frontend Tech Stack

| Technology | Purpose |
|---|---|
| **React 18** | UI framework with concurrent features |
| **TypeScript** | Type safety and developer experience |
| **Vite** | Ultra-fast bundler and dev server |
| **Tailwind CSS v3** | Utility-first styling system |
| **Framer Motion** | Fluid animations, springs, and transitions |
| **MDX** | Markdown with JSX for interactive technical articles |
| **shadcn/ui + Radix UI** | Accessible, composable UI primitives |
| **React Router v6** | Client-side routing |
| **TanStack Query** | Server state management and caching |
| **Lucide React** | Icon library |
| **React Hook Form + Zod** | Form handling and schema validation |
| **next-themes** | Dark/Light mode management |

---

## ⚙️ Backend Tech Stack

| Technology | Purpose |
|---|---|
| **Node.js 18+** | JavaScript runtime |
| **Express.js** | HTTP server and routing |
| **@google/generative-ai** | Official Google Gemini SDK (chat + embeddings) |
| **express-rate-limit** | LRU-backed rate limiting (no memory leak) |
| **Qdrant** (`@qdrant/js-client-rest`) | Vector database for RAG semantic search |
| **gray-matter** | MDX frontmatter parsing |
| **dotenv** | Environment variable management |
| **cors** | CORS middleware |
| **nodemon** | Hot-reload during development |

---

## 🔌 API Endpoints

| Method | Route | Auth | Description |
|---|---|---|---|
| `POST` | `/api/chat` | — | Portfolio chatbot — streams Gemini SSE response |
| `POST` | `/api/articles/chat` | — | RAG chatbot — semantic search + Gemini SSE stream |
| `DELETE` | `/api/articles/session/:sessionId` | — | Clear a conversation session (UUID v4 validated) |
| `POST` | `/api/articles/reindex` | `x-admin-key` | Trigger full article re-indexing pipeline |
| `GET` | `/api/articles/status` | `x-admin-key` | Indexing status + Qdrant collection stats |
| `GET` | `/health` | — | Server health check |

---

## 🎨 Design System & Visual Specialties

### Theme
**Monochromatic dark-first** built entirely on CSS custom properties (HSL variables), toggling cleanly between dark and light mode with no third-party color libraries.

- **Palette:** Neutral monochrome with emerald status accents
- **Typography:** Display weight headings + `font-mono` for code/terminal — editorial × developer
- **Intentional restraint** — every color and weight choice is purposeful

### Signature Visual Elements

| Element | Description |
|---|---|
| **Fine grid background** | Subtle 80×80px CSS grid overlay with radial spotlights |
| **Noise texture overlay** | SVG fractal noise (`feTurbulence`) for organic grain and depth |
| **Editorial hero typography** | "Aditya Kumar" light weight, "SINGH" massive black — intentional contrast |
| **Animated name underline** | Grows 0 → 100% via Framer Motion spring on load |
| **Scrolling tech ticker** | Infinite-loop technology tag strip at the bottom of the hero |
| **IDE window card** | macOS-style window with traffic lights, tab switcher, and live indicator |
| **Boot sequence animation** | Staggered terminal-style boot on switching to the chat tab |
| **Magnetic cursor** | UI elements subtly pull toward the mouse on hover |
| **Custom cursor** | Branded cursor replacing the OS default |
| **Split-view article reader** | Desktop article detail renders as a two-pane layout: article + floating RAG chat |
| **"May I Help You?" bubble** | Framer Motion speech-bubble pop-up above chatbot button with auto-dismiss + progress bar |

---

## 🚀 Features

- **Portfolio AI Chatbot** — Ask anything about Aditya; Gemini Flash with real-time token streaming
- **Articles RAG Chatbot** — Grounded AI assistant for technical articles with semantic search, session memory, follow-up chips, and model fallback
- **Technical Articles Engine** — MDX-powered in-depth engineering blogs with live search, category filters, ToC, reading progress, and related articles
- **Dark / Light Mode** — System-aware toggle persisted via `next-themes`
- **Animated "May I Help You?" Pop-up** — Speech bubble nudge with auto-dismiss countdown and repeat loop
- **Scroll-Aware Chat Expansion** — Chat opening scrolls to nearest article heading for context continuity
- **Typing Effect** — Hero tagline cycles: Full Stack Engineer → AI & LLM Engineer → RAG Systems Architect → Competitive Programmer
- **Real-time GitHub Heatmap** — Live GitHub contribution API integration (commits, streak, repos)
- **Terminal-style Contact Section** — CLI-inspired contact form
- **Projects Showcase** — Live links, GitHub links, tech stack badges
- **Freelance Experience Timeline** — Professional engagements timeline
- **Résumé Download** — One-click PDF download from hero section
- **Page Loader** — Cinematic animated intro screen on first load
- **Fully Responsive** — Optimized for mobile, tablet, and widescreen desktop
- **SEO Optimized** — Structured metadata, XML sitemaps, Google Analytics

---

## 🔒 Security

| Layer | Implementation |
|---|---|
| **Prompt Injection Defense** | Pattern-matching guardrail blocks jailbreak/extraction attempts (`guardrails.js`) |
| **Delimiter Sanitization** | Strips system-context delimiters from user input to prevent context spoofing |
| **Rate Limiting** | `express-rate-limit` — 30 req/15 min for `/api/chat`, 20 req/15 min for RAG chat (LRU-backed, no memory leak) |
| **Body Size Limit** | `express.json({ limit: "16kb" })` — rejects oversized payloads before they reach routes |
| **Input Validation** | Message length capped (600 chars chat, 800 chars RAG), type-checked |
| **CORS Allowlist** | `ALLOWED_ORIGINS` env-var driven — only configured origins accepted; dev fallback to localhost ports |
| **Admin Key Guard** | `/api/articles/reindex` and `/api/articles/status` require `x-admin-key` header — always requires key (no silent bypass) |
| **SessionId Validation** | UUID v4 regex enforced on `DELETE /api/articles/session/:sessionId` |
| **API Key Safety** | All secrets live exclusively in server `.env` — never bundled or exposed to the client |
| **Error Isolation** | Streaming errors forwarded as SSE error events — no stack traces leak to the client |

---

## 📦 Getting Started

### Prerequisites

- **Node.js** 18+
- **npm**
- A **Google Gemini API Key** — [aistudio.google.com](https://aistudio.google.com)
- A **Qdrant Cloud** cluster (free tier) — [cloud.qdrant.io](https://cloud.qdrant.io) *(required for the Articles RAG chatbot only)*

### 1. Clone the Repository

```bash
git clone https://github.com/adityakumarsingh2/portfolio.git
cd portfolio
```

### 2. Setup the Server (Backend)

```bash
cd server

# Install dependencies
npm install

# Copy the env template and fill in your secrets
cp .env.example .env
# Edit .env with your GEMINI_API_KEY, QDRANT_URL, QDRANT_API_KEY, REINDEX_ADMIN_KEY, ALLOWED_ORIGINS

# Start development server (hot-reload)
npm run dev
```

### 3. Setup the Client (Frontend)

```bash
cd ../client

# Install dependencies
npm install

# Start Vite dev server
npm run dev
```

The frontend runs at `http://localhost:5173` and the backend at `http://localhost:5000`.

### 4. Index Articles (RAG)

After the server starts, articles are automatically indexed on startup if `QDRANT_URL` is set.
To manually trigger a re-index:

```bash
curl -X POST http://localhost:5000/api/articles/reindex \
  -H "x-admin-key: your_reindex_admin_key"
```

### 5. Build for Production

```bash
# Build frontend
cd client && npm run build

# Start backend
cd ../server && npm start
```

---

## 🌍 Deployment

| Layer | Platform |
|---|---|
| **Frontend** | [Netlify](https://netlify.com) — auto-deploys from GitHub |
| **Backend** | [Render](https://render.com) — Node.js web service |
| **Vector DB** | [Qdrant Cloud](https://cloud.qdrant.io) — managed vector store |
| **DNS** | [Cloudflare](https://cloudflare.com) |
| **Analytics** | Google Analytics |

> Set the `ALLOWED_ORIGINS` env var on Render to your production domain(s) (e.g., `https://adityakumarsingh.tech,https://www.adityakumarsingh.tech`).

---

## 🏆 Achievements

- 🥇 **LeetCode Rank #1543** out of 30,700+ participants — Weekly Contest 470 (Oct 2025)
- 🏅 **Top 10** in CODE-A-HUNT Hackathon among 3,500+ participants at LPU (Mar 2024)
- 🥊 **1st Place** — KVS Regional Boxing Championship, West Bengal (Oct 2019)

---

## 📬 Contact

| Channel | Details |
|---|---|
| **Email** | adityakumarsingh909@outlook.com |
| **LinkedIn** | [linkedin.com/in/adityakumarsingh2](https://linkedin.com/in/adityakumarsingh2) |
| **GitHub** | [github.com/adityakumarsingh2](https://github.com/adityakumarsingh2) |
| **Portfolio** | [adityakumarsingh.tech](https://adityakumarsingh.tech) |

---

## 📄 License

This project is open source and available under the **MIT License**.

---

<p align="center">
  Built with ❤️ by <strong>Aditya Kumar Singh</strong> — B.Tech CSE @ LPU
</p>
