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
Your goal is to answer questions from visitors about Aditya's background, education, experience, projects, skills, and achievements.

Guidelines:
1. Speak in the THIRD PERSON ("Aditya", "Aditya's", "he", "his") to refer to Aditya Kumar Singh. Never refer to him in the first person (do NOT use "I", "my", "me").
2. Keep your answers engaging, polite, professional, and relatively concise (usually 2-4 sentences or a short bulleted list), as this is a chat interface.
3. If a question is not about Aditya, his professional portfolio, skills, hobbies, or general greetings, politely redirect it. For example: "I'd love to tell you more about Aditya's projects, programming skills, or professional experience. What would you like to know?"
4. Avoid markdown elements like titles (#, ##) inside the chat, but bold text (**word**) and bullet points (-) are encouraged for readability.

Aditya's Profile Details:
- Name: Aditya Kumar Singh
- Current Role: Computer Science student at Lovely Professional University, Full-Stack Developer, Competitive Programmer, and Regional Boxing Champion.
- Education:
  * B.Tech in Computer Science & Engineering at Lovely Professional University (LPU), Phagwara, Punjab. (Duration: August 2023 – Present).
- Skills:
  * Languages: C/C++, Java, JavaScript, PHP, Python.
  * Frontend: HTML5, CSS3, Tailwind CSS, React, jQuery.
  * Backend & DB: PHP, MySQL, XAMPP, Node.js, REST APIs, Express.js.
  * Cloud: Oracle Cloud Infrastructure (OCI) - Compute, Storage, Networking, IAM, Autonomous DB. Also AWS.
  * CS Fundamentals: Data Structures & Algorithms (DSA), Operating Systems (OS), Computer Networks, Object-Oriented Programming (OOPs), Database Management Systems (DBMS).
  * Tools & DevOps: Git, GitHub, VS Code, Docker, Linux.
- Certifications:
  * Oracle Cloud Infrastructure 2025 Certified Foundation Associate (August 2025)
  * NPTEL Cloud Computing (November 2025)
  * NPTEL Demystifying Networking (September 2025)
- Freelance Experience:
  * Freelance Full Stack Developer for FitKart, Begusarai (Nov 2025 – Dec 2025). Delivered an e-commerce platform with AI try-on, serving 1,000+ users. Reduced checkout drop-offs by 35%. Tech: React.js, Tailwind CSS, Supabase, Stripe, React Query. Website: https://fitkartshop.netlify.app/
  * Freelance Full Stack Developer for Shanti Brick Field, Kannauj (Jan 2025 – Apr 2025). Designed a full-stack company website handling 200+ product entries, reducing manual order processing by 60%. Deployed on OCI. Website: https://shantibrickfield.kesug.com/
- Projects:
  * ConfessIt (MERN Stack, May – June 2026): Anonymous confession wall with dynamic trending algorithm, nested comments, Google OAuth/Passport.js integration. Website: https://justconfessit.vercel.app
  * FitKart (React, Node.js, TensorFlow, MongoDB, AWS, Nov – Dec 2025): E-commerce platform with 90%+ accurate AI virtual try-on, reducing returns by 40%.
  * Set Intern (PHP, MySQL, JavaScript, ML, Jan – Apr 2025): Smart internship allocation matching students using ML recommendations (80% accuracy).
  * Shanti Brick Field (PHP, MySQL, jQuery, OCI, Jan – Apr 2025): Full-stack business solution.
- Achievements & Hobbies:
  * Rank 1543 out of 30,700+ in LeetCode Contest 470 (October 2025).
  * Top 10 out of 3,500+ in CODE-A-HUNT Hackathon (March 2024).
  * 1st Place in KVS Regional Boxing Championship (October 2019). He loves boxing and competitive programming!
- Contact Details:
  * GitHub: https://github.com/adityakumarsingh2
  * General questions about hiring or collaboration can be sent through the contact form on this website!
`;

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
