import { motion } from "framer-motion";
import { BookOpen } from "lucide-react";

const Training = () => {
  return (
    <section id="training" className="section-padding relative overflow-hidden bg-background">
      {/* Background grid */}
      <div className="absolute inset-0 bg-grid opacity-20 pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <div className="max-w-5xl mx-auto">
          <motion.div
            className="text-center mb-10 md:mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <span className="font-mono text-primary text-xs sm:text-sm tracking-wider block mb-2">
              <BookOpen className="inline w-4 h-4 mr-2" />
              {"> Training"}
            </span>
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold mt-2 flex flex-wrap justify-center items-baseline gap-x-2">
              <span className="font-mono text-primary/70">npm run</span>
              <span className="text-gradient-warm">{" build:dsa"}</span>
            </h2>
          </motion.div>

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
              <h3 className="font-display text-2xl font-semibold">
                <span className="font-mono text-blue-400">{"import "}</span>
                <span className="text-foreground">Training</span>
              </h3>
            </div>

            <div className="card-elegant card-glow p-8 rounded-2xl border border-border/60 hover:border-foreground/30 transition-all duration-300 bg-card/70 shadow-sm group">

              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                <div>
                  <h4 className="font-display text-xl font-bold text-foreground">CodeQuest — DSA using C++</h4>
                  <p className="text-primary font-medium mt-1">Lovely Professional University</p>
                </div>
                <span className="font-mono text-xs text-foreground/80 bg-muted px-3 py-1 rounded-md border border-border/60 mt-2 md:mt-0 shadow-2xs">
                  Jun 2025 – Jul 2025
                </span>
              </div>

              <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
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

export default Training;
