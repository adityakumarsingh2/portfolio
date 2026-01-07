import { motion } from "framer-motion";
import { ArrowUpRight, Github, ExternalLink } from "lucide-react";
import fitkartPreview from "@/assets/fitkart-preview.png";
import shantiBrickfieldPreview from "@/assets/shanti-brickfield-preview.png";
import smartmatchPreview from "@/assets/smartmatch-preview.png";

const projects = [
  {
    number: "01",
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
    number: "02",
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
    number: "03",
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

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <span className="font-mono text-primary text-sm tracking-wider">
              <span className="text-blue-400">{"import "}</span>
              <span className="text-foreground">{"{ Projects }"}</span>
              <span className="text-blue-400">{" from "}</span>
              <span className="text-green-400">{"./portfolio"}</span>
            </span>
            <h2 className="font-display text-4xl md:text-5xl font-bold mt-4">
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
                      
                      {/* Live link overlay */}
                      {project.live && (
                        <a
                          href={project.live}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="absolute inset-0 flex items-center justify-center bg-background/90 opacity-0 group-hover/image:opacity-100 transition-opacity duration-300"
                        >
                          <span className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-primary-foreground font-semibold text-sm shadow-lg">
                            <ExternalLink className="w-4 h-4" />
                            View Live
                          </span>
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="lg:col-span-7 order-2 lg:order-2">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-3">
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
                      <span className="font-mono text-xs text-muted-foreground mt-2 md:mt-0">{project.period}</span>
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
