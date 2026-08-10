import { motion } from "framer-motion";
import { ArrowUpRight, Github, ExternalLink, BookOpen, Sparkles, FileText } from "lucide-react";
import { Link } from "react-router-dom";
import fitkartPreview from "@/assets/fitkart-preview.png";
import shantiBrickfieldPreview from "@/assets/shanti-brickfield-preview.png";
import smartmatchPreview from "@/assets/smartmatch-preview.png";
import confessitPreview from "@/assets/confessit-preview.png";
import articlesPreview from "@/assets/articles-preview.svg";
import articleCoverAi from "@/assets/article-cover-ai.svg";

interface Project {
  number: string;
  title: string;
  subtitle: string;
  description: string;
  highlights: string[];
  technologies: string[];
  period: string;
  github?: string;
  live?: string;
  articleUrl?: string;
  image: string;
}

const projects: Project[] = [
  {
    number: "01",
    title: "LLM RAG Knowledge Base & Articles Platform",
    subtitle: "AI-Powered Engineering Knowledge Hub & RAG Pipeline",
    description:
      "An interactive full-stack engineering Knowledge Base and RAG platform featuring semantic vector search, MDX technical content pipeline, integrated AI assistant, and production LLM search engine.",
    highlights: [
      "Multi-stage hybrid retrieval pipeline combining Qdrant vector search and BM25 ranking",
      "Semantic document chunking & embedding generation with OpenAI and local Ollama models",
      "Cohere cross-encoder re-ranking layer delivering 40%+ precision improvement",
      "Full interactive studio AI assistant & MDX technical article publishing engine",
    ],
    technologies: ["React", "TypeScript", "RAG", "Qdrant", "OpenAI", "MDX"],
    period: "Jul 2026",
    github: "https://github.com/adityakumarsingh2",
    articleUrl: "/articles",
    image: articlesPreview,
  },
  {
    number: "02",
    title: "ConfessIt",
    subtitle: "Anonymous Confession Wall (MERN Stack)",
    description:
      "A full-stack anonymous confession platform where users authenticate via Google but interact with complete privacy. Features a dynamic trending algorithm and automated anonymous identity abstraction.",
    highlights: [
      "Anonymous identity system using random display names and avatar APIs",
      "Nested comment structure and real-time reaction updates for interactive engagement",
      "Engagement-based trending algorithm highlights active posts based on likes and comments",
      "Secure Google OAuth 2.0/Passport.js integration keeping real identity hidden",
    ],
    technologies: ["React", "Node.js", "Express", "MongoDB", "Passport.js"],
    period: "May – Jun 2026",
    github: "https://github.com/adityakumarsingh2",
    live: "https://justconfessit.vercel.app",
    image: confessitPreview,
  },
  {
    number: "03",
    title: "FitKart",
    subtitle: "AI-Powered Virtual Try-On E-Commerce",
    description:
      "Revolutionary e-commerce platform featuring AI-driven virtual try-on technology, enabling users to visualize clothing on themselves before purchase. Built with modern React stack for seamless user experience.",
    highlights: [
      "AI virtual try-on with 90%+ accuracy using computer vision",
      "Real-time clothing visualization reducing returns by 40%",
      "Responsive React frontend with Node.js microservices",
      "Integrated payment gateway with secure checkout flow",
    ],
    technologies: ["React", "Node.js", "TensorFlow", "MongoDB", "AWS"],
    period: "Nov – Dec 2025",
    github: "https://github.com/adityakumarsingh2/fitkart",
    live: "https://fitkartshop.netlify.app/",
    image: fitkartPreview,
  },
  {
    number: "04",
    title: "Set Intern",
    subtitle: "AI-Based Smart Internship Allocation",
    description:
      "Full-stack platform matching students with internships based on CV, LinkedIn activity, CGPA, and eligibility rules. Features ML-driven recommendations with 80% accuracy.",
    highlights: [
      "Scalable PHP backend with MySQL data management",
      "APIs with 95% reliability for seamless communication",
      "ML models for intelligent student-internship matching",
    ],
    technologies: ["PHP", "MySQL", "JavaScript", "ML"],
    period: "Jan – Apr 2025",
    github: "https://github.com/adityakumarsingh2/setintern",
    image: smartmatchPreview,
  },
  {
    number: "05",
    title: "Shanti Brick Field",
    subtitle: "Full-Stack Business Solution",
    description:
      "Complete e-commerce solution for Shanti Brick Field enabling customers to browse products, place orders, and contact the business seamlessly.",
    highlights: [
      "200+ product entries with automated processing",
      "60% reduction in manual order handling",
      "Deployed on Oracle Cloud Infrastructure",
    ],
    technologies: ["PHP", "MySQL", "jQuery", "OCI"],
    period: "Jan – Apr 2025",
    github: "https://github.com/adityakumarsingh2/shantibrickfield",
    live: "https://shantibrickfield.kesug.com/",
    image: shantiBrickfieldPreview,
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.25, 0.1, 0.25, 1] as const,
    },
  },
};

const Projects = () => {
  return (
    <section id="projects" className="section-padding bg-card/30 relative overflow-hidden">
      {/* Decorative elements (static) */}
      <div className="absolute top-1/4 left-0 w-72 h-72 rounded-full bg-primary/5 blur-3xl" />
      <div className="absolute bottom-1/4 right-0 w-96 h-96 rounded-full bg-primary/5 blur-3xl" />

      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="text-center mb-10 md:mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <span className="font-mono text-primary text-xs sm:text-sm tracking-wider flex flex-wrap justify-center gap-x-1">
              <span className="text-blue-400">{"import "}</span>
              <span className="text-foreground">{"{ Projects }"}</span>
              <span className="text-blue-400">{" from "}</span>
              <span className="text-green-400">{"./portfolio"}</span>
            </span>
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold mt-4 flex flex-wrap justify-center items-baseline gap-x-2">
              <span className="font-mono text-purple-400">{"const "}</span>
              <span className="text-foreground">FeaturedWork</span>
              <span className="text-blue-400">{": "}</span>
              <span className="text-gradient-warm">{"React.FC"}</span>
            </h2>
          </motion.div>

          <motion.div
            className="space-y-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
          >
            {projects.map((project) => (
              <motion.div
                key={project.title}
                className="card-elegant card-glow p-6 md:p-8 group"
                variants={itemVariants}
              >
                <div className="grid lg:grid-cols-12 gap-6 md:gap-8">
                  {/* Project Image */}
                  <div className="lg:col-span-5 order-1 lg:order-1">
                    <div className="relative rounded-xl overflow-hidden bg-muted/30 border border-border/50 aspect-video group/image">
                      <img
                        src={project.image}
                        alt={`${project.title} preview`}
                        className="w-full h-full object-cover object-top transition-transform duration-500 ease-out group-hover/image:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/20 to-transparent" />
                      
                      {/* Image hover overlays */}
                      {project.articleUrl ? (
                        <Link
                          to={project.articleUrl}
                          className="absolute inset-0 flex items-center justify-center bg-background/90 opacity-0 group-hover/image:opacity-100 transition-opacity duration-300"
                        >
                          <span className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-purple-600 text-white font-semibold text-sm hover:bg-purple-500 transition-colors">
                            <BookOpen className="w-4 h-4" />
                            Explore Knowledge Base
                          </span>
                        </Link>
                      ) : project.live ? (
                        <a
                          href={project.live}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="absolute inset-0 flex items-center justify-center bg-background/90 opacity-0 group-hover/image:opacity-100 transition-opacity duration-300"
                        >
                          <span className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-primary-foreground font-semibold text-sm">
                            <ExternalLink className="w-4 h-4" />
                            View Live
                          </span>
                        </a>
                      ) : null}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="lg:col-span-7 order-2 lg:order-2">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <span className="font-display text-3xl font-bold text-primary/30">
                            {project.number}
                          </span>
                          <h3 className="font-display text-xl md:text-2xl font-bold group-hover:text-primary transition-colors duration-300">
                            {project.title}
                          </h3>
                        </div>
                        <p className="text-primary font-medium text-sm">{project.subtitle}</p>
                      </div>
                      <span className="font-mono text-xs text-muted-foreground mt-2 sm:mt-0 sm:ml-4 flex-shrink-0">{project.period}</span>
                    </div>

                    <p className="text-muted-foreground text-sm mb-4 max-w-2xl">{project.description}</p>

                    <ul className="space-y-1.5 mb-5">
                      {project.highlights.map((highlight, i) => (
                        <li key={i} className="text-muted-foreground text-xs flex items-start gap-2">
                          <span className="w-1 h-1 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                          {highlight}
                        </li>
                      ))}
                    </ul>

                    <div className="flex flex-wrap items-center gap-3">
                      <div className="flex flex-wrap gap-1.5 flex-1">
                        {project.technologies.map((tech) => (
                          <span
                            key={tech}
                            className="px-2 py-0.5 rounded-md bg-muted/50 border border-border font-mono text-xs"
                          >
                            <span className="text-green-400/70">import</span>
                            <span className="text-foreground/80">{` { ${tech} }`}</span>
                          </span>
                        ))}
                      </div>

                      <div className="flex items-center gap-3">
                        {project.articleUrl && (
                          <Link
                            to={project.articleUrl}
                            className="inline-flex items-center gap-1.5 text-xs font-medium text-purple-400 hover:text-purple-300 transition-colors bg-purple-500/10 border border-purple-500/30 px-2.5 py-1 rounded-lg"
                          >
                            <BookOpen className="w-3.5 h-3.5" />
                            Knowledge Base
                          </Link>
                        )}
                        {project.live && (
                          <a
                            href={project.live}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary/80 transition-colors"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            Live
                          </a>
                        )}
                        {project.github && (
                          <a
                            href={project.github}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-primary transition-colors"
                          >
                            <Github className="w-3.5 h-3.5" />
                            Code
                            <ArrowUpRight className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* RAG & LLM Implementation Article Showcase Section */}
          <motion.div
            className="mt-14 card-elegant p-6 sm:p-8 md:p-10 relative overflow-hidden border border-purple-500/30 bg-gradient-to-br from-purple-950/30 via-background to-blue-950/20 rounded-2xl"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-purple-500/10 blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />

            <div className="relative z-10 grid lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-8 space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-purple-500/15 border border-purple-500/30 text-purple-300">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    FEATURED TECHNICAL ARTICLE & RAG CASE STUDY
                  </span>
                  <span className="text-xs font-mono text-muted-foreground">
                    12 min read • AI Engineering
                  </span>
                </div>

                <h3 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-foreground tracking-tight">
                  Building a Production RAG System from Scratch
                </h3>

                <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
                  Comprehensive guide breaking down every layer of a production Retrieval-Augmented Generation pipeline—covering chunking strategies, vector embeddings with OpenAI & Ollama, Qdrant similarity search, BM25 hybrid ranking, Cohere re-ranking, and prompt engineering.
                </p>

                <div className="flex flex-wrap gap-2 pt-1">
                  {["RAG Pipeline", "Vector DB", "Qdrant", "Hybrid Search", "Cohere Rerank", "Prompt Engineering"].map((tag) => (
                    <span
                      key={tag}
                      className="px-2.5 py-1 rounded-md bg-purple-500/10 border border-purple-500/20 font-mono text-xs text-purple-300"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-3">
                  <Link
                    to="/articles/building-rag-from-scratch"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-mono text-sm font-semibold transition-all duration-300 hover:scale-[1.02]"
                  >
                    <BookOpen className="w-4 h-4" />
                    Read Full RAG Article
                    <ArrowUpRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>

              <div className="lg:col-span-4">
                <Link
                  to="/articles/building-rag-from-scratch"
                  className="block group relative rounded-xl overflow-hidden border border-purple-500/30 bg-background/50 transition-all duration-300 hover:border-purple-400"
                >
                  <img
                    src={articleCoverAi}
                    alt="Building a RAG System from Scratch"
                    className="w-full h-48 sm:h-56 object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent opacity-80 group-hover:opacity-60 transition-opacity" />
                  <div className="absolute bottom-4 left-4 right-4 p-3 rounded-lg bg-background/90 backdrop-blur-md border border-border/50 text-xs font-mono flex items-center justify-between">
                    <span className="text-purple-300 font-semibold flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-purple-400" />
                      Read Case Study
                    </span>
                    <ArrowUpRight className="w-4 h-4 text-purple-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </div>
                </Link>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="text-center mt-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <a
              href="https://github.com/adityakumarsingh2"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full border-2 border-foreground/20 font-semibold hover:border-primary hover:text-primary transition-all duration-300"
            >
              <Github className="w-5 h-5" />
              See More on GitHub
              <ArrowUpRight className="w-4 h-4" />
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Projects;

