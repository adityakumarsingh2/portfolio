import { motion } from "framer-motion";
import { Code2, Palette, Database, Cloud, BookOpen, Wrench, Sparkles, ExternalLink } from "lucide-react";
import oracleCert from "@/assets/oracle-cert.png";
import nptelCloudCert from "@/assets/nptel-cloud-cert.png";
import nptelNetworkingCert from "@/assets/nptel-networking-cert.png";

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
  const certifications = [
    {
      title: "OCI 2025 Certified Foundation Associate",
      issuer: "Oracle",
      date: "Aug 2025",
      gradient: "from-red-500 to-orange-500",
      emoji: "☁️",
      link: "https://catalog-education.oracle.com/ords/certview/sharebadge?id=9DC2763D8B6786054E3DF258C1999F07DB5A0BF66C15CFA639399A0DC2C86D61",
      image: oracleCert,
    },
    {
      title: "Cloud Computing",
      issuer: "NPTEL · IIT Kharagpur",
      date: "Jul–Oct 2025",
      gradient: "from-blue-550 to-indigo-500",
      emoji: "🏅",
      link: "https://drive.google.com/file/d/187CFo6VbufxGicOaZHFFDU3OLRUGT-oz/view",
      image: nptelCloudCert,
    },
    {
      title: "Demystifying Networking",
      issuer: "NPTEL · IIT Bombay",
      date: "Jul–Aug 2025",
      gradient: "from-emerald-550 to-teal-500",
      emoji: "🏅",
      link: "https://drive.google.com/file/d/187CFo6VbufxGicOaZHFFDU3OLRUGT-oz/view",
      image: nptelNetworkingCert,
    },
  ];

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

          {/* Certifications - Optimized 3 Column Grid */}
          <motion.div
            className="mt-24"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <div className="text-center mb-12">
              <h3 className="font-display text-2xl md:text-3xl font-bold">
                <span className="text-gradient-warm">Certifications</span>
              </h3>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6">
              {certifications.map((cert, i) => (
                <motion.div
                  key={cert.title}
                  className="relative block card-elegant rounded-2xl overflow-hidden h-full transition-all duration-300 group hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary flex flex-col bg-card"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.5, delay: i * 0.12, ease: [0.25, 0.1, 0.25, 1] }}
                >
                  {/* Hover glow */}
                  <div className={`absolute -inset-0.5 bg-gradient-to-r ${cert.gradient} rounded-2xl blur-lg opacity-0 group-hover:opacity-15 transition-opacity duration-500`} />

                  {/* Top accent bar */}
                  <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${cert.gradient}`} />

                  {/* Certificate Image Frame - aspect ratio optimized */}
                  <div className="relative aspect-[1.5/1] w-full overflow-hidden bg-zinc-950/90 flex items-center justify-center p-2.5 border-b border-border/40 relative group/image">
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
                      className="absolute inset-0 flex items-center justify-center bg-[#0B0D13]/85 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"
                    >
                      <span className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-primary text-primary-foreground font-semibold text-xs shadow-md">
                        <ExternalLink className="w-3.5 h-3.5" />
                        Verify Credential
                      </span>
                    </a>
                  </div>

                  {/* Content - Optimized spacing */}
                  <div className="p-4 flex-1 flex flex-col justify-between relative z-10">
                    <div className="mb-3">
                      {/* Issuer & Date info */}
                      <div className="flex justify-between items-center mb-2">
                        <p className={`font-bold text-xs bg-gradient-to-r ${cert.gradient} bg-clip-text text-transparent`}>
                          {cert.issuer}
                        </p>
                        <span className="text-[10px] font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded border border-border/10">
                          {cert.date}
                        </span>
                      </div>

                      {/* Title */}
                      <h4 className="font-semibold text-xs text-left leading-snug line-clamp-2 min-h-[32px]">
                        {cert.title}
                      </h4>
                    </div>

                    {/* View Credential Link */}
                    <div className="pt-2.5 border-t border-border/20 flex justify-between items-center mt-3">
                      <a
                        href={cert.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-[10px] font-bold text-primary hover:underline"
                      >
                        <ExternalLink className="w-3 h-3" />
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
