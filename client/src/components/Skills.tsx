import { motion } from "framer-motion";
import { Code2, Palette, Database, Cloud, BookOpen, Sparkles, ExternalLink } from "lucide-react";
import oracleCert from "@/assets/oracle-cert.png";
import nptelCloudCert from "@/assets/nptel-cloud-cert.png";
import nptelNetworkingCert from "@/assets/nptel-networking-cert.png";

const skillGroups = [
  {
    title: "AI & RAG Systems",
    icon: Sparkles,
    skills: ["LangChain", "Gemini API", "OpenAI", "Vector DBs", "RAG Pipelines"],
  },
  {
    title: "Languages",
    icon: Code2,
    skills: ["TypeScript", "JavaScript", "Python", "C/C++", "Java"],
  },
  {
    title: "Modern Frontend",
    icon: Palette,
    skills: ["React.js", "Next.js", "Tailwind CSS", "Redux Toolkit", "Framer Motion"],
  },
  {
    title: "Backend & DB",
    icon: Database,
    skills: ["Node.js", "Express.js", "MongoDB Atlas", "PostgreSQL", "REST APIs"],
  },
  {
    title: "CS Fundamentals",
    icon: BookOpen,
    skills: ["DSA (500+)", "System Design", "OS", "Networks", "DBMS"],
  },
  {
    title: "Cloud & DevOps",
    icon: Cloud,
    skills: ["Docker", "AWS", "Oracle Cloud", "Vercel", "Git/Linux"],
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.1, 0.25, 1] as const,
    },
  },
};

const SkillCard = ({
  group,
}: {
  group: (typeof skillGroups)[0];
}) => {
  return (
    <motion.div
      className="relative group h-full"
      variants={itemVariants}
    >
      <div className="card-elegant card-glow p-6 md:p-8 h-full rounded-2xl border border-border/60 hover:border-foreground/30 transition-all duration-300 flex flex-col justify-between bg-card/70 shadow-sm">
        <div>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3.5">
              <div className="p-3 rounded-xl bg-muted/80 border border-border/80 text-foreground group-hover:bg-primary/10 group-hover:border-primary/30 group-hover:text-primary transition-all duration-300 shadow-2xs">
                <group.icon className="w-5 h-5 transition-colors duration-300" />
              </div>
              <div>
                <h3 className="font-display text-lg font-bold text-foreground tracking-tight group-hover:text-primary transition-colors duration-300">
                  {group.title}
                </h3>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2.5">
            {group.skills.map((skill) => (
              <span
                key={skill}
                className="px-3 py-1.5 rounded-lg bg-muted/60 hover:bg-muted border border-border/70 font-mono text-xs text-foreground/90 font-medium shadow-2xs hover:border-foreground/50 hover:text-foreground transition-all duration-200 cursor-default"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const Skills = () => {
  const certifications = [
    {
      title: "OCI 2025 Certified Foundation Associate",
      issuer: "Oracle",
      date: "Aug 2025",
      emoji: "☁️",
      link: "https://catalog-education.oracle.com/ords/certview/sharebadge?id=9DC2763D8B6786054E3DF258C1999F07DB5A0BF66C15CFA639399A0DC2C86D61",
      image: oracleCert,
    },
    {
      title: "Cloud Computing",
      issuer: "NPTEL · IIT Kharagpur",
      date: "Jul–Oct 2025",
      emoji: "🏅",
      link: "https://drive.google.com/file/d/187CFo6VbufxGicOaZHFFDU3OLRUGT-oz/view",
      image: nptelCloudCert,
    },
    {
      title: "Demystifying Networking",
      issuer: "NPTEL · IIT Bombay",
      date: "Jul–Aug 2025",
      emoji: "🏅",
      link: "https://drive.google.com/file/d/187CFo6VbufxGicOaZHFFDU3OLRUGT-oz/view",
      image: nptelNetworkingCert,
    },
  ];

  return (
    <section id="skills" className="section-padding relative overflow-hidden bg-background">
      {/* Background elements */}
      <div className="absolute inset-0 bg-grid opacity-20 pointer-events-none" />
      <div className="absolute top-1/4 right-0 w-96 h-96 rounded-full bg-primary/5 blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-0 w-72 h-72 rounded-full bg-primary/5 blur-3xl pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-4 shadow-sm">
              <Code2 className="w-4 h-4 text-primary" />
              <span className="font-mono text-xs font-semibold text-primary uppercase tracking-wider">Tech Arsenal</span>
            </div>
            <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mt-2">
              <span className="font-mono text-blue-400">{"import "}</span>
              <span className="text-foreground">{"{ Skills }"}</span>
              <span className="font-mono text-blue-400">{" from "}</span>
              <span className="text-green-400">{"'./production'"}</span>
            </h2>
            <p className="text-muted-foreground mt-4 max-w-xl mx-auto text-base leading-relaxed font-normal">
              A high-contrast overview of my technical stack, from scalable backend microservices and RAG intelligence to responsive frontend architectures.
            </p>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
          >
            {skillGroups.map((group) => (
              <SkillCard key={group.title} group={group} />
            ))}
          </motion.div>

          {/* Certifications Grid */}
          <motion.div
            className="mt-24"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <div className="text-center mb-12">
              <span className="font-mono text-xs text-primary font-semibold tracking-wider block mb-2 uppercase">
                {"// verified credentials"}
              </span>
              <h3 className="font-display text-3xl md:text-4xl font-bold text-foreground">
                Certifications <span className="text-gradient-warm">&</span> Accreditations
              </h3>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6 md:gap-8">
              {certifications.map((cert, i) => (
                <motion.div
                  key={cert.title}
                  className="relative block card-elegant card-glow rounded-2xl overflow-hidden h-full transition-all duration-300 group hover:border-foreground/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary flex flex-col bg-card/70 border border-border/60 shadow-sm"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.5, delay: i * 0.12, ease: [0.25, 0.1, 0.25, 1] }}
                >
                  {/* Certificate Image Frame */}
                  <div className="relative aspect-[1.5/1] w-full overflow-hidden bg-zinc-950 flex items-center justify-center p-3 border-b border-border/70 group/image">
                    <img
                      src={cert.image}
                      alt={`${cert.title} certificate`}
                      className="w-full h-full object-contain transition-transform duration-500 ease-out group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/40 via-transparent to-transparent pointer-events-none" />
                    
                    {/* Hover Verify Overlay */}
                    <a
                      href={cert.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute inset-0 flex items-center justify-center bg-background/90 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 backdrop-blur-xs"
                    >
                      <span className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-foreground text-background font-mono font-bold text-xs shadow-xl hover:bg-foreground/90 transition-all scale-95 group-hover:scale-100 duration-300">
                        <ExternalLink className="w-3.5 h-3.5" />
                        Verify Credential
                      </span>
                    </a>
                  </div>

                  {/* Content */}
                  <div className="p-6 flex-1 flex flex-col justify-between relative z-10 bg-card/70">
                    <div className="mb-4">
                      {/* Issuer & Date info */}
                      <div className="flex justify-between items-center mb-2.5">
                        <span className="font-mono text-xs font-bold text-primary tracking-wide uppercase">
                          {cert.issuer}
                        </span>
                        <span className="text-[11px] font-mono font-medium text-foreground/80 bg-muted px-2.5 py-0.5 rounded-md border border-border/60 shadow-2xs">
                          {cert.date}
                        </span>
                      </div>

                      {/* Title */}
                      <h4 className="font-display font-bold text-base text-foreground text-left leading-snug line-clamp-2 min-h-[44px] mt-1 group-hover:text-primary transition-colors">
                        {cert.title}
                      </h4>
                    </div>

                    {/* View Credential Link */}
                    <div className="pt-3.5 border-t border-border/60 flex justify-between items-center mt-2">
                      <a
                        href={cert.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-foreground/80 hover:text-primary transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        Verify Credential
                      </a>
                      <span className="text-base">{cert.emoji}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Skills;
