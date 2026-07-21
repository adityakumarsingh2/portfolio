# Aditya Kumar Singh — Personal Portfolio

> A premium, full-stack developer portfolio with an integrated AI chatbot powered by **Google Gemini Flash** — built to leave a lasting first impression.

🌐 **Live:** [adityakumaronline.netlify.app](https://adityakumaronline.netlify.app)

---

## ✨ Overview

This is not your average portfolio. It is a **production-grade, full-stack web application** built to showcase skills, freelance experience, projects, achievements, and LeetCode performance in an interactive and visually stunning way.

The portfolio features a **dark-mode-first design aesthetic** with editorial typography, glassmorphism-inspired card styles, smooth scroll animations, a custom magnetic cursor, and a fully integrated **AI assistant chatbot** — powered by Google's **Gemini Flash LLM** — that can answer questions about Aditya in real-time.

---

## 🗂️ Project Structure

```
1portfolio/
├── client/                  # Frontend — React + TypeScript + Vite
│   ├── src/
│   │   ├── components/      # All React UI components
│   │   │   ├── Hero.tsx         # Hero section + IDE card + Chatbot tab
│   │   │   ├── Chatbot.tsx      # Full AI chatbot UI (floating + inline)
│   │   │   ├── About.tsx        # About me section
│   │   │   ├── Skills.tsx       # Tech skills grid
│   │   │   ├── Projects.tsx     # Project showcase cards
│   │   │   ├── Experience.tsx   # Freelance experience timeline
│   │   │   ├── LeetCodeStats.tsx# Real-time LeetCode stats integration
│   │   │   ├── Contact.tsx      # Terminal-style contact section
│   │   │   ├── CustomCursor.tsx # Custom magnetic cursor
│   │   │   ├── Navbar.tsx       # Sticky navigation bar
│   │   │   ├── Footer.tsx       # Footer component
│   │   │   ├── PageLoader.tsx   # Animated page loader
│   │   │   ├── ScrollProgress.tsx# Scroll progress indicator
│   │   │   ├── RevealOnScroll.tsx# Scroll-triggered reveal animations
│   │   │   ├── articles/        # Article components
│   │   │   └── ...              # More UI components
│   │   ├── content/         # MDX content files
│   │   │   └── articles/    # Technical articles
│   │   ├── hooks/           # Custom React hooks
│   │   ├── lib/             # Utility functions
│   │   ├── pages/           # Page-level components
│   │   └── assets/          # Images and static assets
│   ├── index.html
│   ├── vite.config.ts
│   ├── tailwind.config.ts
│   └── package.json
│
└── server/                  # Backend — Node.js + Express
    ├── index.js             # Express server + Gemini API integration
    ├── .env                 # Environment variables (GEMINI_API_KEY, PORT)
    └── package.json
```

---

## 🤖 The AI Chatbot — Powered by Google Gemini Flash

One of the most unique features of this portfolio is its **built-in AI assistant** — a conversational chatbot that represents Aditya on the website.

Powered by **Google Gemini Flash**, the integration uses the official `@google/generative-ai` SDK and streams responses via Server-Sent Events (SSE).

### Key Chatbot Features
- **Real-Time Streaming:** Responses stream token-by-token for a snappy, native chat UI.
- **Context-Aware:** Multi-turn chat context and a carefully crafted system prompt (Aditya's resume) ensure accurate, personalized answers.
- **Secure & Rate-Limited:** Custom in-memory IP rate limiter (30 requests/15m) and strict CORS rules protect the backend API.
- **Dual UI Integration:** Available seamlessly inline inside the Hero IDE card and as a floating global widget.

---

## ✍️ Technical Articles (MDX Engine)

The portfolio features a dedicated section for in-depth engineering blogs and tutorials, powered by **MDX** (Markdown + JSX). This approach bridges the gap between readable markdown and interactive web components.

### Why MDX?
- **Interactive Content:** Standard markdown is enhanced with embedded React components for dynamic, interactive technical explanations.
- **Custom Components:** Features custom implementations like `CodeSnippet.tsx` for beautiful code blocks and syntax highlighting.
- **Metadata Handling:** Uses `gray-matter` for parsing frontmatter data (e.g., publish dates, reading time, and tags) to dynamically construct article metadata.
- **Typography & Styling:** Styled with `@tailwindcss/typography` (`prose` classes) to ensure elegant, highly readable editorial content in both dark and light modes.

---

## 🖥️ Frontend Tech Stack

| Technology | Purpose |
|---|---|
| **React 18** | UI framework with concurrent features |
| **TypeScript** | Type safety and better developer experience |
| **Vite** | Ultra-fast bundler and dev server |
| **Tailwind CSS v3** | Utility-first styling system |
| **Framer Motion** | Fluid animations, springs, and transitions |
| **MDX** | Markdown with JSX for technical articles |
| **shadcn/ui** | Accessible, composable UI components |
| **Radix UI** | Headless accessible UI primitives |
| **React Router v6** | Client-side routing |
| **TanStack Query** | Server state management and caching |
| **Recharts** | Data visualization for stats |
| **Three.js + React Three Fiber** | 3D rendering capabilities |
| **Lucide React** | Icon library |
| **React Hook Form + Zod** | Form handling and schema validation |
| **next-themes** | Dark/Light mode management |

---

## ⚙️ Backend Tech Stack

| Technology | Purpose |
|---|---|
| **Node.js** | JavaScript runtime |
| **Express.js** | HTTP server and routing framework |
| **@google/generative-ai** | Official Google Gemini SDK |
| **dotenv** | Environment variable management |
| **cors** | Cross-origin resource sharing middleware |
| **nodemon** | Hot-reload during development |

### API Endpoints

| Method | Route | Description |
|---|---|---|
| `POST` | `/api/chat` | Chatbot endpoint — sends message to Gemini, streams SSE response |
| `GET` | `/health` | Health check — returns server status, model name, timestamp |

---

## 🎨 Design System & Unique Specialties

### Theme
The portfolio uses a **monochromatic dark-first theme** built entirely on CSS custom properties (HSL variables), making it fully adaptable between dark and light modes with a single toggle. No third-party color libraries.

- **Color Palette:** Neutral monochrome (`--foreground`, `--background`, `--muted`) with emerald accents for availability/status indicators
- **Typography:** Display font for headings, `font-mono` for code/terminal elements — editorial + developer aesthetic combined
- **Intentional restraint** — every color and weight choice is purposeful, avoiding visual noise

### Unique Visual Elements

| Element | Description |
|---|---|
| **Fine grid background** | Subtle 80×80px CSS grid overlay with radial spotlights |
| **Noise texture overlay** | SVG fractal noise (feTurbulence) for organic grain and depth |
| **Architectural accent lines** | Thin vertical/horizontal rule lines for structural composition |
| **Editorial hero typography** | "Aditya Kumar" in light weight, "SINGH" in massive black — intentional contrast |
| **Animated underline** | Grows from 0 → 100% on the name via Framer Motion spring |
| **Scrolling tech ticker** | Infinite-loop tag strip of technologies at the bottom of the hero |
| **IDE window card** | macOS-style window with traffic light buttons, tab switcher, and live indicator |
| **Boot sequence animation** | Staggered terminal-style boot sequence on switching to the chat tab |
| **Magnetic cursor effect** | UI elements subtly pull toward the mouse cursor on hover |
| **Custom cursor** | Replaces the default OS cursor with a branded custom cursor |
| **Scroll indicator** | Vertical animated scroll cue with writing-mode text |

---

## 🚀 Features

- **AI Chatbot** — Ask anything about Aditya; powered by Google Gemini Flash with real-time token streaming
- **Dark / Light Mode** — System-aware toggle with smooth theme transition, persisted via `next-themes`
- **Articles Section** — A dedicated space for in-depth technical writings, built with MDX and custom components
- **Typing Effect** — Hero tagline cycles: Full Stack Developer → Cloud Enthusiast → DSA Enthusiast → Problem Solver
- **Scroll Progress Bar** — Visual read-progress indicator pinned at top of viewport
- **Reveal on Scroll** — All sections animate in as they enter the viewport using Framer Motion
- **Real-time LeetCode Stats** — Live integration with LeetCode public API (rank, problems, contest data)
- **Terminal-style Contact Section** — CLI-inspired contact form with typed command output feel
- **Projects Showcase** — Cards with live links, GitHub links, tech stack badges, and descriptions
- **Freelance Experience Timeline** — Detailed timeline of professional freelance engagements
- **Résumé Download** — One-click PDF download directly from the hero section
- **Back to Top Button** — Smooth scroll-to-top trigger
- **Page Loader** — Cinematic animated intro screen on first load
- **Fully Responsive** — Optimized layout for mobile, tablet, and widescreen desktop
- **SEO Optimized** — Structured metadata, XML sitemaps, Google indexed, Google Analytics

---

## 🔒 Security Practices

- **CORS Whitelist:** Only `*.netlify.app`, `*.vercel.app`, and `localhost` origins are accepted
- **Rate Limiting:** Custom in-memory IP-based rate limiter — 30 requests / 15 min, with automatic stale-entry cleanup every 10 minutes
- **Input Sanitization:** Message length capped at 600 chars, type-validated before LLM call
- **API Key Safety:** `GEMINI_API_KEY` lives exclusively in the server `.env` — never bundled or exposed to the client
- **Error Isolation:** Streaming errors are caught server-side and forwarded as SSE error events — no stack traces ever leak to the client

---

## 🏆 Achievements Highlighted in the Portfolio

- 🥇 **LeetCode Rank #1543** out of 30,700+ participants in Weekly Contest 470 (Oct 2025)
- 🏅 **Top 10** in CODE-A-HUNT Hackathon among 3,500+ participants at LPU (Mar 2024)
- 🥊 **1st Place** — KVS Regional Boxing Championship, West Bengal (Oct 2019)

---

## 📦 Getting Started

### Prerequisites

- **Node.js** 18+
- **npm** or **bun**
- A **Google Gemini API Key** — get one at [aistudio.google.com](https://aistudio.google.com)

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

# Create environment file
echo "GEMINI_API_KEY=your_api_key_here" > .env
echo "PORT=5000" >> .env

# Start development server
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

### 4. Build for Production

```bash
# Build frontend
cd client
npm run build

# Start backend
cd ../server
npm start
```

---

## 🌍 Deployment

| Layer | Platform |
|---|---|
| **Frontend** | [Netlify](https://netlify.com) — auto-deploys from GitHub |
| **Backend** | [Render](https://render.com) — Node.js web service |
| **DNS** | [Cloudflare](https://cloudflare.com) |
| **Analytics** | Google Analytics |

---

## 📬 Contact

| Channel | Details |
|---|---|
| **Email** | adityakumarsingh909@outlook.com |
| **LinkedIn** | [linkedin.com/in/adityakumarsingh2](https://linkedin.com/in/adityakumarsingh2) |
| **GitHub** | [github.com/adityakumarsingh2](https://github.com/adityakumarsingh2) |
| **Portfolio** | [adityakumaronline.netlify.app](https://adityakumaronline.netlify.app) |

---

## 📄 License

This project is open source and available under the **MIT License**.

---

<p align="center">
  Built with ❤️ by <strong>Aditya Kumar Singh</strong> — B.Tech CSE @ LPU
</p>
