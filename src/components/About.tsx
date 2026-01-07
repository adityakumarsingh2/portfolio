import { motion, Variants } from "framer-motion";
import { GraduationCap, Trophy, Code2 } from "lucide-react";
import LeetCodeStats from "./LeetCodeStats";

const leftCardVariants: Variants = {
  hidden: { opacity: 0, x: -30 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: { delay: i * 0.1, duration: 0.4 }
  })
};

const rightCardVariants: Variants = {
  hidden: { opacity: 0, x: 30 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: { delay: i * 0.1, duration: 0.4 }
  })
};

const About = () => {
  return (
    <section id="about" className="section-padding relative overflow-hidden">
      {/* Static Background decoration */}
      <div className="absolute inset-0 bg-dots opacity-10" />
      
      <div className="container mx-auto px-6 relative z-10">
        {/* Section Header */}
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="font-mono text-primary text-sm tracking-wider">
            <span className="text-blue-400">{"import "}</span>
            <span className="text-foreground">{"{ Developer }"}</span>
            <span className="text-blue-400">{" from "}</span>
            <span className="text-green-400">"@/about"</span>
          </span>
          <h2 className="font-display text-4xl md:text-5xl font-bold mt-4">
            <span className="font-mono text-purple-400 text-3xl">{"const "}</span>
            <span className="text-foreground">AboutMe</span>
            <span className="text-blue-400">{": "}</span>
            <span className="text-gradient-warm">React.FC</span>
          </h2>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Left Column - Background, Education, What I Do, then Achievements */}
          <div className="space-y-5">
            {/* Background */}
            <motion.div
              custom={0}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              variants={leftCardVariants}
              className="bg-muted/30 rounded-lg p-5 border-l-2 border-primary/50 font-mono text-sm"
            >
              <span className="text-green-400">{"// Background"}</span>
              <p className="text-muted-foreground mt-2 leading-relaxed">
                I'm a <span className="text-foreground font-medium">Computer Science student</span> with 
                hands-on experience in full-stack development and cloud technologies. Passionate about 
                building scalable applications that solve real-world problems.
              </p>
            </motion.div>

            {/* Education Card */}
            <motion.div
              custom={1}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              variants={leftCardVariants}
              className="card-elegant card-glow p-6 transition-all duration-300"
            >
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-blue-500/10">
                  <GraduationCap className="w-6 h-6 text-blue-500" />
                </div>
                <div>
                  <h3 className="font-display text-xl font-semibold mb-2">Education</h3>
                  <p className="text-primary font-medium">Lovely Professional University</p>
                  <p className="text-muted-foreground">B.Tech Computer Science & Engineering</p>
                  <p className="text-muted-foreground">CGPA: 7.00</p>
                  <p className="text-sm text-muted-foreground mt-2 font-mono">Aug 2023 – Present</p>
                </div>
              </div>
            </motion.div>

            {/* Achievements Card - at bottom of left column */}
            <motion.div
              custom={3}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              variants={leftCardVariants}
              className="card-elegant card-glow p-6 transition-all duration-300"
            >
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-amber-500/10">
                  <Trophy className="w-6 h-6 text-amber-500" />
                </div>
                <div className="flex-1">
                  <h3 className="font-display text-xl font-semibold mb-3">Achievements</h3>
                  <ul className="space-y-3 text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 flex-shrink-0" />
                      <span>
                        <span className="text-foreground font-medium">Rank 1543 / 30.7k+</span> — LeetCode Contest 470 
                        <span className="font-mono text-xs text-muted-foreground/70 ml-1">(Oct 2025)</span>
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                      <span>
                        <span className="text-foreground font-medium">Top 10 / 3.5k+</span> — CODE-A-HUNT Hackathon 
                        <span className="font-mono text-xs text-muted-foreground/70 ml-1">(Mar 2024)</span>
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2 flex-shrink-0" />
                      <span>
                        <span className="text-foreground font-medium">1st Place</span> — KVS Regional Boxing 
                        <span className="font-mono text-xs text-muted-foreground/70 ml-1">(Oct 2019)</span>
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Column - What I Do, LeetCode Stats & Fun Fact */}
          <div className="space-y-5">
            {/* What I Do Card */}
            <motion.div
              custom={0}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              variants={rightCardVariants}
              className="card-elegant card-glow p-6 transition-all duration-300"
            >
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-green-500/10">
                  <Code2 className="w-6 h-6 text-green-500" />
                </div>
                <div className="flex-1">
                  <h3 className="font-display text-xl font-semibold mb-3">What I Do</h3>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <p className="flex items-center gap-2">
                      <span className="text-blue-400 font-mono">→</span>
                      Building e-commerce & AI-powered applications
                    </p>
                    <p className="flex items-center gap-2">
                      <span className="text-green-400 font-mono">→</span>
                      Full-stack development with React & Node.js
                    </p>
                    <p className="flex items-center gap-2">
                      <span className="text-purple-400 font-mono">→</span>
                      Cloud deployment on AWS & Oracle Cloud
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* LeetCode Stats Widget */}
            <LeetCodeStats />

            {/* Fun Fact */}
            <motion.div
              custom={0}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              variants={rightCardVariants}
              className="bg-muted/30 rounded-lg p-5 border-l-2 border-yellow-400/50 font-mono text-sm"
            >
              <span className="text-yellow-400">{"// Fun Fact"}</span>
              <p className="text-muted-foreground mt-2 leading-relaxed">
                When I'm not coding, you'll find me at hackathons or sharpening my 
                competitive programming skills. Also — I'm a regional boxing champion! 🥊
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;