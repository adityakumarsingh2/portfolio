import { motion } from "framer-motion";
import { Briefcase, BookOpen, Terminal, ExternalLink } from "lucide-react";
import fitkartPreview from "@/assets/fitkart-preview.png";
import shantiBrickfieldPreview from "@/assets/shanti-brickfield-preview.png";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 25 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.25, 0.1, 0.25, 1] as const,
    },
  },
};

const experiences = [
  {
    title: "Freelance Full Stack Developer",
    company: "FitKart, Begusarai",
    period: "Nov 2025 – Dec 2025",
    live: "https://fitkartshop.netlify.app/",
    image: fitkartPreview,
    highlights: [
      "Delivered a full-stack e-commerce platform with AI try-on, serving 1,000+ users",
      "Implemented secure authentication, real-time order tracking, and Stripe payments",
      "Reduced checkout drop-offs by 35% and improved user engagement by 45%",
      "Followed modular architecture and reusable component design",
    ],
    technologies: ["React.js", "Tailwind CSS", "Supabase", "Stripe", "React Query"],
  },
  {
    title: "Freelance Full Stack Developer",
    company: "Shanti Brick Field, Kannauj",
    period: "Jan 2025 – Apr 2025",
    live: "https://shantibrickfield.kesug.com/",
    image: shantiBrickfieldPreview,
    highlights: [
      "Designed a full-stack company website for product browsing and order placement",
      "Handled 200+ product entries and reduced manual order processing by 60%",
      "Achieved 40% rise in operational efficiency through automation",
      "Deployed on Oracle Cloud Infrastructure with custom subdomain",
    ],
    technologies: ["HTML", "CSS", "JavaScript", "jQuery", "PHP", "MySQL", "OCI"],
  },
];

const Experience = () => {
  return (
    <section id="experience" className="section-padding relative overflow-hidden">
      {/* Background grid (static) */}
      <div className="absolute inset-0 bg-grid opacity-20" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-5xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <span className="font-mono text-primary text-sm tracking-wider">
              <Terminal className="inline w-4 h-4 mr-2" />
              {">"} My Journey
            </span>
            <h2 className="font-display text-4xl md:text-5xl font-bold mt-4">
              <span className="font-mono text-primary/70">git log</span>
              <span className="text-gradient-warm">{" --oneline"}</span>
            </h2>
          </motion.div>

          {/* Work Experience */}
          <motion.div
            className="mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2.5 rounded-xl bg-primary/10">
                <Briefcase className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-display text-2xl font-semibold">
                <span className="font-mono text-blue-400">{"export const "}</span>
                <span className="text-foreground">WorkExperience</span>
              </h3>
            </div>

            <motion.div
              className="space-y-6"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
            >
              {experiences.map((exp) => (
                <motion.div
                  key={exp.company}
                  className="card-elegant card-glow p-6 md:p-8 relative overflow-hidden group"
                  variants={itemVariants}
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />

                  <div className="relative grid md:grid-cols-12 gap-6">
                    {/* Image */}
                    <div className="md:col-span-4">
                      <div className="relative rounded-xl overflow-hidden bg-muted/30 border border-border/50 aspect-video group/image">
                        <img
                          src={exp.image}
                          alt={`${exp.company} preview`}
                          className="w-full h-full object-cover object-top transition-transform duration-500 ease-out group-hover/image:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/20 to-transparent" />
                      </div>
                    </div>

                    {/* Content */}
                    <div className="md:col-span-8">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-3">
                        <div>
                          <h4 className="font-display text-lg font-semibold">{exp.title}</h4>
                          <p className="text-primary font-medium text-sm">{exp.company}</p>
                        </div>
                        <span className="font-mono text-xs text-muted-foreground mt-2 md:mt-0">
                          {exp.period}
                        </span>
                      </div>

                      <ul className="space-y-2 mb-4">
                        {exp.highlights.map((item, i) => (
                          <li key={i} className="text-muted-foreground text-sm flex items-start gap-2">
                            <span className="w-1 h-1 rounded-full bg-primary mt-2 flex-shrink-0" />
                            {item}
                          </li>
                        ))}
                      </ul>

                      <div className="flex flex-wrap items-center gap-3 mb-4">
                        {exp.technologies.map((tech) => (
                          <span
                            key={tech}
                            className="px-2 py-0.5 rounded-md bg-muted/50 border border-border font-mono text-xs"
                          >
                            <span className="text-blue-400">{"import "}</span>
                            <span className="text-foreground">{tech}</span>
                          </span>
                        ))}
                      </div>

                      {/* View Website Button */}
                      <a
                        href={exp.live}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30 text-primary font-medium text-sm hover:bg-primary hover:text-primary-foreground transition-all duration-300"
                      >
                        <ExternalLink className="w-4 h-4" />
                        View Website
                      </a>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* Training */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: 0.1, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2.5 rounded-xl bg-primary/10">
                <BookOpen className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-display text-2xl font-semibold">Training</h3>
            </div>

            <div className="card-elegant card-glow p-8">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                <div>
                  <h4 className="font-display text-xl font-semibold">CodeQuest — DSA using C++</h4>
                  <p className="text-primary font-medium">Lovely Professional University</p>
                </div>
                <span className="font-mono text-sm text-muted-foreground mt-2 md:mt-0">
                  Jun 2025 – Jul 2025
                </span>
              </div>

              <p className="text-muted-foreground">
                Strengthened DSA fundamentals with arrays, linked lists, stacks, queues, trees, graphs,
                sorting, and searching. Gained hands-on experience in writing optimized, clean, and modular C++ code.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Experience;
