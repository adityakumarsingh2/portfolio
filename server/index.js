import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.error("CRITICAL ERROR: GEMINI_API_KEY is not defined in the environment variables.");
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);

const systemInstruction = `
You are the AI assistant representing Aditya Kumar Singh on his personal portfolio website. 

Rules:
1. Speak in the THIRD PERSON ("Aditya", "Aditya's", "he", "his") to refer to Aditya Kumar Singh. Never refer to him in the first person (do NOT use "I", "my", "me").
2. Keep your answers engaging, polite, professional, and relatively concise (usually 2-4 sentences or a short bulleted list), as this is a chat interface.
3. If the answer is not present in the provided information, answer using your general knowledge.
4. Avoid markdown elements like titles (#, ##) inside the chat, but bold text (**word**) and bullet points (-) are encouraged for readability.
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
- Languages: C/C++, Java, JavaScript, PHP
- Frameworks & Libraries: HTML and CSS, Tailwind CSS, React.js, Node.js, Express.js
- Tools & Platforms: MySQL, Git, GitHub, MongoDB Compass, Postman, VS Code, XAMPP, Netlify, Supabase
- Core CS Fundamentals: Data Structures and Algorithms (DSA), Operating Systems, Computer Networks, OOPs, DBMS
- Soft Skills: Problem-Solving, Teamwork, Leadership, Discipline, Resilience, Adaptability

FREELANCE EXPERIENCE:
1. Freelancer | Fit Kart, Begusarai (Nov 2025 - Dec 2025)
   - Project: Fit Kart (Full-stack e-commerce platform with AI try-on)
   - Key Responsibilities & Achievements:
     * Delivered full-stack platform enabling 1,000+ users to explore products, receive size recommendations, and complete purchases.
     * Handled secure authentication, real-time order tracking, wish list management, and Stripe payments, reducing checkout drop-offs by 35% and improving user engagement by 45%.
     * Followed modular architecture and reusable component design to improve scalability and maintainability.
   - Technologies: React.js, JavaScript, Supabase (Auth & Database), Stripe API, Netlify, Git, Express.js

2. Freelancer | Shanti Brick Field, Kannauj (Mar 2025 - Apr 2025)
   - Project: Company Website for Shanti Brick Field
   - Key Responsibilities & Achievements:
     * Designed a responsive company website featuring product listings, gallery slideshow, contact and purchase request forms.
     * Integrated secure backend functionality using PHP and MySQL, including form handling, file/image uploads, and database-driven product management.
     * Published the website on a custom subdomain via shared cPanel hosting (InfinityFree) with PHPMailer-based email notifications.
   - Technologies: HTML and CSS, JavaScript, jQuery, PHP, MySQL, PHPMailer

PROJECTS:
1. Confess It (Jan 2026 - Apr 2026)
   - Description: A full-stack anonymous social media platform using the MERN stack, enabling users to share confessions and interact securely without revealing their identity.
   - Key Responsibilities & Achievements:
     * Implemented Google OAuth 2.0 authentication with Passport.js and protected REST APIs, reducing unauthorized access risks by 100% through secure session-based authorization.
     * Streamlined backend services and MongoDB Atlas queries, improving API response time by 35% and handling 1,000+ API requests with scalable architecture.
     * Deployed the frontend on Vercel, backend on Render, and cloud database on MongoDB Atlas, ensuring reliable and scalable production hosting.
   - Technologies: MERN Stack, Google OAuth, MongoDB Atlas, Passport.js, Vercel, Render
   -live link: https://justconfessit.vercel.app
   -github link: https://github.com/adityakumarsingh2/confessit
2. Personal Portfolio (Dec 2025 - Jan 2026)
   - Description: A modern, responsive portfolio website to showcase full-stack skills and projects, featuring dark/light mode, smooth animations, a custom magnetic cursor, and real-time LeetCode statistics integration.
   - Key Responsibilities & Achievements:
     * Optimized the website for SEO using structured metadata and sitemaps, achieving Google indexing and tracking 1,000+ visits via Google Analytics.
     * Hosted the portfolio on a custom domain using Netlify with Cloudflare as the DNS provider.
   - Technologies: React.js, Tailwind CSS, SEO, Netlify, Cloudflare, Google Analytics
   -live link: https://adityakumaronline.netlify.app
   -github link: https://github.com/adityakumarsingh2/portfolio
CERTIFICATIONS:
- Cloud Computing | NPTEL (Nov 2025)
- Demystifying Networking | NPTEL (Sep 2025)
- Oracle Cloud Infrastructure 2025 Certified Foundation Associate | Oracle (Aug 2025)

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

const modelName = "gemini-3.5-flash";

// Helper to call generative AI
async function generateGeminiResponse(message, history) {
  const model = genAI.getGenerativeModel({
    model: modelName,
    systemInstruction: systemInstruction,
  });

  const formattedHistory = (history || []).map((msg) => ({
    role: msg.role === "user" ? "user" : "model",
    parts: [{ text: msg.text }],
  }));

  const chat = model.startChat({
    history: formattedHistory,
  });

  const result = await chat.sendMessage(message);
  const response = await result.response;
  return response.text();
}

app.post("/api/chat", async (req, res) => {
  const { message, history } = req.body;

  if (!message) {
    return res.status(400).json({ error: "Message is required." });
  }

  // Set headers for SSE streaming
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  try {
    console.log(`Generating streaming chat response using ${modelName}...`);
    
    const model = genAI.getGenerativeModel({
      model: modelName,
      systemInstruction: systemInstruction,
    });

    const formattedHistory = (history || []).map((msg) => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.text }],
    }));

    const chat = model.startChat({
      history: formattedHistory,
    });

    const result = await chat.sendMessageStream(message);

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
  res.json({ status: "healthy", model: modelName, time: new Date() });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
