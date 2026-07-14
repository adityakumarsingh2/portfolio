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
│   │   │   └── ...              # More UI components
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

### How It Works

The chatbot is powered by **Google Gemini Flash** (`gemini-3.1-flash-lite`), a fast and efficient large language model (LLM) from Google DeepMind. The integration uses the official **`@google/generative-ai`** Node.js SDK.

```
User Message
     │
     ▼
React Frontend (Chatbot.tsx)
     │  POST /api/chat  (message + conversation history)
     ▼
Express Backend (server/index.js)
     │  Rate Limiter → Validation → Gemini SDK
     ▼
Google Gemini Flash API (gemini-3.1-flash-lite)
     │  Server-Sent Events (SSE) streaming response
     ▼
Frontend streams & renders tokens in real-time
```

### Key Chatbot Features

| Feature | Details |
|---|---|
| **LLM Model** | `gemini-3.1-flash-lite` (Google Gemini Flash) |
| **Streaming** | Server-Sent Events (SSE) — response streams token by token |
| **Conversation History** | Full multi-turn chat context sent on every request |
| **System Prompt** | Aditya's complete resume is embedded as system context |
| **Rate Limiting** | Custom in-memory limiter — 30 requests per 15-minute window per IP |
| **Input Validation** | Max 600 characters, type-checked, sanitized |
| **CORS Security** | Whitelist-based CORS — only trusted origins allowed |
| **Persona** | Speaks in third-person ("Aditya is…", "He has…") — professional & engaging |
| **Two UIs** | Inline inside the Hero IDE card + floating chatbot widget |

### System Instruction Design

The chatbot's personality and knowledge are defined by a carefully crafted **system instruction** baked into every API call. It contains:

- Aditya's full resume (skills, projects, education, certifications, achievements)
- Behavioral rules: third-person voice, concise answers, professional tone
- Formatting preferences: bullet points for readability, no markdown headers
- Fallback rule: use general knowledge if specific info isn't available

### Google Gemini Flash — Why This Model?

```js
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({
  model: "gemini-3.1-flash-lite",
  systemInstruction: systemInstruction, // Full resume context
});

// Multi-turn chat with real-time SSE streaming
const chat = model.startChat({ history: formattedHistory });
const result = await chat.sendMessageStream(message);
for await (const chunk of result.stream) {
  res.write(`data: ${JSON.stringify({ text: chunk.text() })}\n\n`);
}
```

The **Gemini Flash** model was specifically chosen for its:
- ⚡ **Speed** — extremely low latency ideal for real-time chat UX
- 💰 **Cost efficiency** — lightweight without sacrificing quality
- 🧠 **Multi-turn awareness** — handles long conversation histories natively
- 📄 **Large context window** — fits the entire resume as system-level context

---

## 🖥️ Frontend Tech Stack

| Technology | Purpose |
|---|---|
| **React 18** | UI framework with concurrent features |
| **TypeScript** | Type safety and better developer experience |
| **Vite** | Ultra-fast bundler and dev server |
| **Tailwind CSS v3** | Utility-first styling system |
| **Framer Motion** | Fluid animations, springs, and transitions |
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
