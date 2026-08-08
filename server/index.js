import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";
import rateLimit from "express-rate-limit";

dotenv.config();

// RAG pipeline imports (Articles chatbot)
import { runRAGPipeline } from "./modules/rag/pipeline.js";
import {
  getHistory,
  appendToSession,
  clearSession,
  getSessionCount,
} from "./modules/rag/session-store.js";
import { reindex, getIndexingStatus, reindexState } from "./scripts/reindex.js";
import { validateAndSanitizePrompt } from "./modules/guardrails.js";

const app = express();

// ─── CORS ─────────────────────────────────────────────────────────────────
// Origins are read from ALLOWED_ORIGINS env var (comma-separated) so they
// can be tightened in production without code changes.
// Falls back to localhost in development.
const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",").map((o) => o.trim())
  : [
      "http://localhost:5173", // Vite default
      "http://localhost:4173", // Vite preview
      "http://localhost:3000", // CRA / Next.js dev
      "http://localhost:8080", // Alternate dev port
    ];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (curl, Postman, server-to-server)
      if (!origin) return callback(null, true);
      if (ALLOWED_ORIGINS.includes(origin)) return callback(null, true);
      callback(new Error(`CORS: origin "${origin}" not allowed`));
    },
    methods: ["GET", "POST", "DELETE"],
    allowedHeaders: ["Content-Type", "x-admin-key"],
  })
);

// Limit body size to prevent DoS via oversized payloads.
app.use(express.json({ limit: "16kb" }));

const PORT = process.env.PORT || 5000;
const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.error("CRITICAL ERROR: GEMINI_API_KEY is not defined in the environment variables.");
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);

// ─── Rate Limiters (express-rate-limit) ────────────────────────────────────
// express-rate-limit maintains an internal LRU store that automatically
// evicts expired windows — no memory leak risk unlike a bare Map + setInterval.

/** 30 requests / 15 min — Portfolio chatbot (/api/chat) */
const chatRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,   // Return RateLimit-* headers
  legacyHeaders: false,
  message: (req, res) => {
    const reset = res.getHeader("RateLimit-Reset");
    const remaining = reset ? Math.ceil((Number(reset) * 1000 - Date.now()) / 60000) : 15;
    return { error: `Too many requests from this IP. Please try again after ${remaining} minute(s).` };
  },
});

/** 20 requests / 15 min — Articles RAG chatbot (/api/articles/chat) */
const articlesRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: (req, res) => {
    const reset = res.getHeader("RateLimit-Reset");
    const remaining = reset ? Math.ceil((Number(reset) * 1000 - Date.now()) / 60000) : 15;
    return { error: `Too many requests. Please try again after ${remaining} minute(s).` };
  },
});

const systemInstruction = `
You are the AI assistant representing Aditya Kumar Singh on his personal portfolio website. 

Rules:
1. Speak in the THIRD PERSON ("Aditya", "Aditya's", "he", "his") to refer to Aditya Kumar Singh. Never refer to him in the first person (do NOT use "I", "my", "me").
2. Keep your answers engaging, polite, professional, and relatively concise (usually 2-4 sentences or a short bulleted list), as this is a chat interface.
3. If the answer is not present in the provided information, answer using your general knowledge.
4. Avoid markdown elements like titles (#, ##) inside the chat, but bold text (**word**) and bullet points (-) are encouraged for readability.
5. If asked why someone shouldn't hire Aditya (or any variation of "why not to hire him" or "why you should not hire him"), reply like this:
**Why shouldn't you hire Aditya?**

That's a tough question.

If you're looking for someone who avoids challenges, sticks to the bare minimum, or is satisfied with average results, Aditya probably isn't the right fit.

He's a developer who enjoys solving complex problems, learning new technologies quickly, and taking ownership of his work. From building full-stack applications to competing in hackathons and delivering freelance projects, he has consistently shown curiosity, adaptability, and a strong work ethic.

Like any growing engineer, he's still learning—but that's one of his biggest strengths. He actively seeks feedback, improves rapidly, and treats every project as an opportunity to become better.

So, if you're searching for a reason **not** to hire Aditya, you might have to keep looking.
==================================================================
RESUME OF ADITYA KUMAR SINGH
==================================================================

CONTACT DETAILS:
- Name: Aditya Kumar Singh
- Email: adityakumarsingh909@outlook.com
- Mobile: +91 7654944940
- LinkedIn: linkedin.com/in/adityakumarsingh2
- GitHub: github.com/adityakumarsingh2
- Portfolio/Website: adityakumaronline.netlify.app

SKILLS:
- AI & RAG Engineering: LangChain, LlamaIndex, Google Gemini API, OpenAI API, Vector DBs (Pinecone, ChromaDB, pgvector), RAG Pipelines, Prompt Engineering
- Languages: TypeScript, JavaScript, Python, C/C++, Java, PHP
- Frameworks & Libraries: React.js, Next.js, Node.js, Express.js, Tailwind CSS, Redux Toolkit, Framer Motion
- Tools & Platforms: MongoDB Atlas, PostgreSQL, Supabase, Docker, AWS, Oracle Cloud (OCI), Vercel, Git, GitHub
- Core CS Fundamentals: Data Structures and Algorithms (500+ solved), System Design, Operating Systems, Computer Networks, DBMS
- Soft Skills: Problem-Solving, Teamwork, Leadership, Discipline (Boxing Champion), Resilience, Adaptability

FREELANCE EXPERIENCE:
1. Freelancer | Fit Kart, Begusarai (Nov 2025 - Dec 2025)
   - Project: Fit Kart (Full-stack e-commerce platform with AI try-on)
   - Key Responsibilities & Achievements:
     * Delivered full-stack platform enabling 1,000+ users to explore products, receive size recommendations, and complete purchases.
     * Handled secure authentication, real-time order tracking, wish list management, and Stripe payments, reducing checkout drop-offs by 35% and improving user engagement by 45%.
     * Followed modular architecture and reusable component design to improve scalability and maintainability.
   - Technologies: React.js, JavaScript, Supabase (Auth & Database), Stripe API, Netlify, Git, Express.js
   - live link: https://fitkartshop.netlify.app/
   - github link: https://github.com/adityakumarsingh2/fitkart

2. Freelancer | Shanti Brick Field, Kannauj (Mar 2025 - Apr 2025)
   - Project: Company Website for Shanti Brick Field
   - Key Responsibilities & Achievements:
     * Designed a responsive company website featuring product listings, gallery slideshow, contact and purchase request forms.
     * Integrated secure backend functionality using PHP and MySQL, including form handling, file/image uploads, and database-driven product management.
     * Published the website on a custom subdomain via shared cPanel hosting (InfinityFree) with PHPMailer-based email notifications.
   - Technologies: HTML and CSS, JavaScript, jQuery, PHP, MySQL, PHPMailer
   - live link: https://shantibrickfield.kesug.com/
   - github link: https://github.com/adityakumarsingh2/shantibrickfield

PROJECTS:
1. Confess It (Jan 2026 - Apr 2026)
   - Description: A full-stack anonymous social media platform using the MERN stack, enabling users to share confessions and interact securely without revealing their identity.
   - Key Responsibilities & Achievements:
     * Implemented Google OAuth 2.0 authentication with Passport.js and protected REST APIs, reducing unauthorized access risks by 100% through secure session-based authorization.
     * Streamlined backend services and MongoDB Atlas queries, improving API response time by 35% and handling 1,000+ API requests with scalable architecture.
     * Deployed the frontend on Vercel, backend on Render, and cloud database on MongoDB Atlas, ensuring reliable and scalable production hosting.
   - Technologies: MERN Stack, Google OAuth, MongoDB Atlas, Passport.js, Vercel, Render
   - live link: https://justconfessit.vercel.app
   - github link: https://github.com/adityakumarsingh2/confessit

2. Personal Portfolio (Dec 2025 - Jan 2026)
   - Description: A modern, responsive portfolio website to showcase full-stack skills and projects, featuring dark/light mode, smooth animations, and a custom magnetic cursor.
   - Key Responsibilities & Achievements:
     * Integrated an LLM-powered AI chatbot using the Gemini Flash API with secure rate limiting, enabling visitors to interactively learn about his skills, projects, and experience.
     * Optimized the website for SEO with structured metadata and sitemaps, achieved Google indexing, tracked 1,000+ visits via Google Analytics, and deployed it on a custom domain using Vercel and Cloudflare.
   - Technologies: React.js, Tailwind CSS, SEO, Vercel, Cloudflare, Google Analytics
   - live link: https://adityakumarsingh.tech
   - github link: https://github.com/adityakumarsingh2/portfolio

3. Set Intern (Jan 2025 - Apr 2025)
   - Description: An AI-based smart internship allocation platform matching students with internships based on CV, LinkedIn activity, CGPA, and eligibility rules.
   - Technologies: PHP, MySQL, JavaScript, Machine Learning
   - github link: https://github.com/adityakumarsingh2/setintern

ARTICLES:
- Aditya writes in-depth engineering blogs and technical tutorials on his portfolio website.
- These articles are built using MDX (Markdown + JSX) to provide interactive technical explanations with custom React components like code snippets.
- The articles cover topics related to full-stack architecture, applied AI & RAG systems (like "Building Production RAG from Scratch"), and problem-solving.

CERTIFICATIONS:
- Cloud Computing | NPTEL (Nov 2025), link: https://drive.google.com/file/d/187CFo6VbufxGicOaZHFFDU3OLRUGT-oz/view
- Demystifying Networking | NPTEL (Sep 2025), link: https://drive.google.com/file/d/187CFo6VbufxGicOaZHFFDU3OLRUGT-oz/view
- Oracle Cloud Infrastructure 2025 Certified Foundation Associate | Oracle (Aug 2025), link: https://catalog-education.oracle.com/ords/certview/sharebadge?id=9DC2763D8B6786054E3DF258C1999F07DB5A0BF66C15CFA639399A0DC2C86D61

ACHIEVEMENTS:
- Obtained a rank of 1543 among 30.7k+ participants in LeetCode Weekly Contest 470 (Oct 2025).
- Attained a top 10 rank among 3.5k+ participants in CODE-A-HUNT hackathon, LPU (Mar 2024).
- Secured 1st position at KVS Regional Boxing Championship, West Bengal, showcasing discipline, resilience, and strong decision-making under pressure (Oct 2019).

EDUCATION:
1. Lovely Professional University (Phagwara, Punjab)
   - Degree: Bachelor of Technology - Computer Science and Engineering
   - CGPA: 7.53
   - Duration: Apr 2023 - Present
2. Kendriya Vidyalaya (Island Grounds, Chennai)
   - Intermediate (Class 12)
   - Duration: Apr 2022 - Mar 2023
3. Kendriya Vidyalaya No. 1 (Nausenabaugh, Visakhapatnam)
   - Matriculation (Class 10)
   - Percentage: 86%
   - Duration: Apr 2020 - Mar 2021`;

const modelName = "gemini-3.5-flash-lite";

// ─── Singleton Gemini model ────────────────────────────────────────────────
// Instantiated once at startup. getGenerativeModel() is a lightweight SDK
// call but creating it per-request adds unnecessary object allocation and
// redundant configuration parsing on every chat round-trip.
const chatModel = genAI.getGenerativeModel({
  model: modelName,
  systemInstruction: systemInstruction,
});



app.post("/api/chat", chatRateLimiter, async (req, res) => {
  const { message, history } = req.body;

  // Input Sanitization & Validations
  if (!message || typeof message !== "string" || !message.trim()) {
    return res.status(400).json({ error: "Message content is required and must be a valid string." });
  }

  if (message.length > 600) {
    return res.status(400).json({ error: "Message is too long. Maximum limit is 600 characters." });
  }

  // Guardrail check against prompt injection & jailbreak attacks
  const promptGuard = validateAndSanitizePrompt(message);
  if (!promptGuard.isValid) {
    return res.status(400).json({ error: promptGuard.error });
  }

  const cleanMessage = promptGuard.sanitized;

  // Set headers for SSE streaming
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  try {
    console.log(`Generating streaming chat response using ${modelName}...`);

    // Re-use the module-level singleton — no new model instance per request.
    const formattedHistory = (history || []).map((msg) => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.text }],
    }));

    const chat = chatModel.startChat({
      history: formattedHistory,
    });

    const result = await chat.sendMessageStream(cleanMessage);

    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      res.write(`data: ${JSON.stringify({ text: chunkText })}\n\n`);
    }

    res.write("data: [DONE]\n\n");
    res.end();
  } catch (error) {
    console.error("Gemini Streaming Error:", error);
    res.write(`data: ${JSON.stringify({ error: error.message || error })}\n\n`);
    res.end();
  }
});

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// ============================================================
// ARTICLES RAG CHATBOT ROUTES
// ============================================================

/**
 * POST /api/articles/chat
 * Main RAG chat endpoint — streams SSE response.
 *
 * Body: { query: string, sessionId: string }
 */
app.post("/api/articles/chat", articlesRateLimiter, async (req, res) => {
  const { query, sessionId, articleSlug } = req.body;

  if (!query || typeof query !== "string" || !query.trim()) {
    return res.status(400).json({ error: "query is required" });
  }
  if (!sessionId || typeof sessionId !== "string") {
    return res.status(400).json({ error: "sessionId is required" });
  }
  if (query.length > 800) {
    return res.status(400).json({ error: "Query exceeds 800 character limit" });
  }

  // Guardrail check against prompt injection & jailbreak attacks
  const promptGuard = validateAndSanitizePrompt(query);
  if (!promptGuard.isValid) {
    return res.status(400).json({ error: promptGuard.error });
  }

  const cleanQuery = promptGuard.sanitized;

  // Set SSE headers
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no"); // disable nginx buffering on Render

  const history = getHistory(sessionId);

  // Append user message to session
  appendToSession(sessionId, { role: "user", text: cleanQuery });

  let assistantResponse = "";

  try {
    await runRAGPipeline({
      query: cleanQuery,
      history,
      articleSlug: typeof articleSlug === "string" && articleSlug.trim() ? articleSlug.trim() : null,
      onChunk: (text) => {
        assistantResponse += text;
        res.write(`data: ${JSON.stringify({ type: "chunk", text })}\n\n`);
      },
      onDone: ({ sources, webSources, followUpSuggestions }) => {
        // Append assistant response to session history
        if (assistantResponse) {
          appendToSession(sessionId, { role: "assistant", text: assistantResponse });
        }
        res.write(
          `data: ${JSON.stringify({ type: "done", sources, webSources, followUpSuggestions })}\n\n`
        );
        res.end();
      },
      onError: (error) => {
        res.write(
          `data: ${JSON.stringify({ type: "error", error: error.message })}\n\n`
        );
        res.end();
      },
    });
  } catch (error) {
    console.error("[/api/articles/chat] Unhandled error:", error);
    res.write(
      `data: ${JSON.stringify({ type: "error", error: "Internal server error" })}\n\n`
    );
    res.end();
  }
});

/**
 * DELETE /api/articles/session/:sessionId
 * Clear a conversation session (user clicks "New conversation").
 */
// UUID v4 pattern — prevents arbitrary strings from being used as session keys.
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

app.delete("/api/articles/session/:sessionId", (req, res) => {
  const { sessionId } = req.params;
  if (!UUID_RE.test(sessionId)) {
    return res.status(400).json({ error: "Invalid session ID format" });
  }
  clearSession(sessionId);
  res.json({ ok: true });
});

/**
 * POST /api/articles/reindex
 * Trigger a full re-index of articles. Protected by REINDEX_ADMIN_KEY.
 */
/**
 * Shared admin-key guard used by protected endpoints.
 * Always requires the key — if REINDEX_ADMIN_KEY is not set the server
 * refuses the request rather than silently allowing it through.
 */
function requireAdminKey(req, res) {
  const adminKey = process.env.REINDEX_ADMIN_KEY;
  const providedKey = req.headers["x-admin-key"];

  if (!adminKey) {
    // Env var missing — refuse all requests so a misconfigured deploy
    // never accidentally exposes a key-less admin endpoint.
    res.status(503).json({ error: "Admin key not configured on server" });
    return false;
  }
  if (providedKey !== adminKey) {
    res.status(401).json({ error: "Unauthorized" });
    return false;
  }
  return true;
}

app.post("/api/articles/reindex", async (req, res) => {
  if (!requireAdminKey(req, res)) return;

  if (reindexState.isRunning) {
    return res.status(409).json({ error: "Reindex already in progress" });
  }

  // Run async, respond immediately
  reindex().catch((err) => console.error("[reindex] Failed:", err));
  res.json({ message: "Reindex started", status: "running" });
});

/**
 * GET /api/articles/status
 * Returns indexing status and collection stats.
 * Protected — same admin key as reindex endpoint.
 */
app.get("/api/articles/status", async (req, res) => {
  if (!requireAdminKey(req, res)) return;

  try {
    const status = await getIndexingStatus();
    res.json({
      ...status,
      activeSessions: getSessionCount(),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================================
// SERVER START
// ============================================================

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);

  // Trigger non-blocking reindex on startup
  // Hash-based diffing ensures unchanged articles are skipped instantly
  if (process.env.QDRANT_URL) {
    reindex()
      .then((result) => {
        console.log(`[startup] Reindex complete: ${JSON.stringify(result)}`);
      })
      .catch((err) => {
        console.error("[startup] Reindex failed (non-fatal):", err.message);
      });
  } else {
    console.warn("[startup] QDRANT_URL not set — skipping article indexing");
  }
});
