import { motion } from "framer-motion";
import { Code2, Palette, Database, Cloud, BookOpen, Wrench, Sparkles } from "lucide-react";

const skillGroups = [
  {
    title: "Languages",
    icon: Code2,
    gradient: "from-blue-500 to-cyan-400",
    skills: ["C/C++", "Java", "JavaScript", "PHP", "Python"],
  },
  {
    title: "Frontend",
    icon: Palette,
    gradient: "from-pink-500 to-rose-400",
    skills: ["HTML5", "CSS3", "Tailwind CSS", "React", "jQuery"],
  },
  {
    title: "Backend & DB",
    icon: Database,
    gradient: "from-emerald-500 to-green-400",
    skills: ["PHP", "MySQL", "XAMPP", "Node.js", "REST APIs"],
  },
  {
    title: "Cloud (OCI)",
    icon: Cloud,
    gradient: "from-orange-500 to-amber-400",
    skills: ["Compute", "Storage", "Networking", "IAM", "Autonomous DB"],
  },
  {
    title: "CS Fundamentals",
    icon: BookOpen,
    gradient: "from-violet-500 to-purple-400",
    skills: ["DSA", "OS", "Networks", "OOPs", "DBMS"],
  },
  {
    title: "Tools & DevOps",
    icon: Wrench,
    gradient: "from-yellow-500 to-lime-400",
    skills: ["Git", "GitHub", "VS Code", "Docker", "Linux"],
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
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

const SkillPill = ({ skill, index }: { skill: string; index: number }) => {
  return (
    <span 
      className="relative px-3 py-1.5 rounded-lg bg-background/80 border border-border/50 text-sm font-mono backdrop-blur-sm"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <span className="text-primary/60 mr-1">{"{"}</span>
      <span className="text-foreground">{skill}</span>
      <span className="text-primary/60 ml-1">{"}"}</span>
    </span>
  );
};

const SkillCard = ({
  group,
  index,
}: {
  group: (typeof skillGroups)[0];
  index: number;
}) => {
  return (
    <motion.div
      className="relative group"
      variants={itemVariants}
    >
      {/* Glow effect */}
      <div className={`absolute -inset-0.5 bg-gradient-to-r ${group.gradient} rounded-2xl blur-lg opacity-0 group-hover:opacity-20 transition-opacity duration-500`} />
      
      <div className="relative card-elegant p-6 h-full rounded-2xl overflow-hidden">
        {/* Gradient accent line */}
        <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${group.gradient}`} />
        
        {/* Background decoration */}
        <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${group.gradient} opacity-5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl`} />
        
        <div className="relative">
          <div className="flex items-center gap-3 mb-5">
            <div className={`p-2.5 rounded-xl bg-gradient-to-br ${group.gradient} shadow-lg`}>
              <group.icon className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <span className="font-mono text-xs text-muted-foreground block">{"// "}{group.title.toLowerCase()}</span>
              <h3 className="font-display text-lg font-bold">{group.title}</h3>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {group.skills.map((skill, i) => (
              <SkillPill key={skill} skill={skill} index={i} />
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const Skills = () => {
  return (
    <section id="skills" className="section-padding bg-card/30 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 bg-grid opacity-30" />
      <div className="absolute top-20 right-10 w-96 h-96 rounded-full bg-primary/5 blur-3xl" />
      <div className="absolute bottom-20 left-10 w-72 h-72 rounded-full bg-primary/5 blur-2xl" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="font-mono text-sm text-primary">Tech Arsenal</span>
            </div>
            <h2 className="font-display text-4xl md:text-5xl font-bold">
              <span className="font-mono text-blue-400">{"const "}</span>
              <span className="text-foreground">techStack</span>
              <span className="text-gradient-warm">{" = []"}</span>
            </h2>
            <p className="text-muted-foreground mt-4 max-w-xl mx-auto">
              A compact snapshot of the technologies I work with day-to-day.
            </p>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
          >
            {skillGroups.map((group, index) => (
              <SkillCard key={group.title} group={group} index={index} />
            ))}
          </motion.div>

          {/* Certifications */}
          <motion.div
            className="mt-20"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <div className="text-center mb-10">
              <h3 className="font-display text-2xl md:text-3xl font-bold">
                <span className="text-gradient-warm">Certifications</span>
              </h3>
            </div>
            
            <div className="grid md:grid-cols-3 gap-5">
              {[
                {
                  title: "OCI 2025 Certified Foundation Associate",
                  issuer: "Oracle",
                  date: "Aug 2025",
                  gradient: "from-red-500 to-orange-500",
                },
                { 
                  title: "Cloud Computing", 
                  issuer: "NPTEL", 
                  date: "Nov 2025",
                  gradient: "from-blue-500 to-indigo-500",
                },
                {
                  title: "Demystifying Networking",
                  issuer: "NPTEL",
                  date: "Sep 2025",
                  gradient: "from-emerald-500 to-teal-500",
                },
              ].map((cert, i) => (
                <motion.div
                  key={cert.title}
                  className="relative group"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.5, delay: i * 0.1, ease: [0.25, 0.1, 0.25, 1] }}
                >
                  <div className={`absolute -inset-0.5 bg-gradient-to-r ${cert.gradient} rounded-2xl blur-lg opacity-0 group-hover:opacity-20 transition-opacity duration-500`} />
                  
                  <div className="relative card-elegant p-6 text-center rounded-2xl overflow-hidden">
                    <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${cert.gradient}`} />
                    
                    <div className={`w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${cert.gradient} flex items-center justify-center shadow-lg`}>
                      <span className="text-2xl">🏆</span>
                    </div>
                    <p className="font-semibold text-sm mb-2 leading-tight">{cert.title}</p>
                    <p className={`font-bold text-sm bg-gradient-to-r ${cert.gradient} bg-clip-text text-transparent`}>{cert.issuer}</p>
                    <p className="text-muted-foreground text-xs font-mono mt-3 px-3 py-1 bg-muted/50 rounded-full inline-block">{cert.date}</p>
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
