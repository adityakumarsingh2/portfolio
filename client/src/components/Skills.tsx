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

const SkillPill = ({ skill }: { skill: string }) => {
  return (
    <span className="px-2.5 py-1 rounded-md bg-muted/40 hover:bg-muted border border-border/40 font-mono text-xs text-foreground/80 hover:text-foreground transition-all duration-200 cursor-default">
      {skill}
    </span>
  );
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
      <div className="card-elegant card-glow p-6 md:p-8 h-full rounded-2xl border border-border/40 hover:border-border transition-all duration-300 flex flex-col justify-between bg-card/50">
        <div>
          <div className="flex items-center gap-3.5 mb-6">
            <div className="p-2.5 rounded-xl bg-primary/5 border border-border/30 text-foreground group-hover:bg-primary/10 group-hover:border-border/60 transition-all duration-300">
              <group.icon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display text-lg font-bold text-foreground group-hover:text-primary transition-colors duration-300">
                {group.title}
              </h3>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {group.skills.map((skill) => (
              <SkillPill key={skill} skill={skill} />
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
            <span className="font-mono text-primary text-sm tracking-wider block mb-2">
              <Code2 className="inline w-4 h-4 mr-2" />
              {">"} Technical Arsenal
            </span>
            <h2 className="font-display text-4xl md:text-5xl font-bold mt-2">
              <span className="font-mono text-primary/70">npx</span>
              <span className="text-gradient-warm">{" skills-check"}</span>
            </h2>
            <p className="text-muted-foreground mt-4 max-w-xl mx-auto text-sm md:text-base">
              A curated breakdown of my production toolkit, from high-concurrency backend services and RAG architectures to modern frontend frameworks.
            </p>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
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
              <span className="font-mono text-xs text-muted-foreground tracking-wider block mb-2 uppercase">
                {"// verified credentials"}
              </span>
              <h3 className="font-display text-3xl md:text-4xl font-bold text-foreground">
                Certifications <span className="text-gradient-warm">&</span> Accreditations
              </h3>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6">
              {certifications.map((cert, i) => (
                <motion.div
                  key={cert.title}
                  className="relative block card-elegant card-glow rounded-2xl overflow-hidden h-full transition-all duration-300 group hover:border-border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary flex flex-col bg-card/60 border border-border/40"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.5, delay: i * 0.12, ease: [0.25, 0.1, 0.25, 1] }}
                >
                  {/* Certificate Image Frame */}
                  <div className="relative aspect-[1.5/1] w-full overflow-hidden bg-zinc-950/90 flex items-center justify-center p-2.5 border-b border-border/40 group/image">
                    <img
                      src={cert.image}
                      alt={`${cert.title} certificate`}
                      className="w-full h-full object-contain transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/30 via-transparent to-transparent pointer-events-none" />
                    
                    {/* Hover Verify Overlay */}
                    <a
                      href={cert.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute inset-0 flex items-center justify-center bg-background/90 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"
                    >
                      <span className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-foreground text-background font-semibold text-xs shadow-md hover:bg-foreground/90 transition-colors">
                        <ExternalLink className="w-3.5 h-3.5" />
                        Verify Credential
                      </span>
                    </a>
                  </div>

                  {/* Content */}
                  <div className="p-5 flex-1 flex flex-col justify-between relative z-10">
                    <div className="mb-3">
                      {/* Issuer & Date info */}
                      <div className="flex justify-between items-center mb-2">
                        <p className="font-mono text-xs font-semibold text-muted-foreground group-hover:text-foreground transition-colors">
                          {cert.issuer}
                        </p>
                        <span className="text-[10px] font-mono text-muted-foreground bg-muted/50 px-2 py-0.5 rounded border border-border/40">
                          {cert.date}
                        </span>
                      </div>

                      {/* Title */}
                      <h4 className="font-semibold text-sm text-foreground text-left leading-snug line-clamp-2 min-h-[36px] mt-1">
                        {cert.title}
                      </h4>
                    </div>

                    {/* View Credential Link */}
                    <div className="pt-3 border-t border-border/30 flex justify-between items-center mt-3">
                      <a
                        href={cert.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-mono font-medium text-foreground/70 hover:text-foreground transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        Verify Credential
                      </a>
                      <span className="text-sm">{cert.emoji}</span>
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
