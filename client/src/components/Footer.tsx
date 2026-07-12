import { motion } from "framer-motion";
import { Github, Linkedin, Mail, Terminal } from "lucide-react";

const Footer = () => {
  return (
    <motion.footer 
      className="py-12 border-t border-border bg-card/30"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
    >
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto">
          {/* Terminal-style footer */}
          <div className="font-mono text-sm mb-8">
            <div className="flex items-center gap-2 text-muted-foreground mb-4">
              <Terminal className="w-4 h-4 text-primary" />
              <span className="text-green-400">~</span>
              <span>/portfolio</span>
            </div>
            
            <motion.div 
              className="space-y-2 text-muted-foreground"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
            >
              <p>
                <span className="text-blue-400">{"import "}</span>
                <span className="text-foreground">{"{ Developer }"}</span>
                <span className="text-blue-400">{" from "}</span>
                <span className="text-green-400">"@aditya/portfolio"</span>;
              </p>
              <p>
                <span className="text-purple-400">const</span>{" "}
                <span className="text-foreground">status</span> = {" "}
                <span className="text-green-400">"Open to opportunities"</span>;
              </p>
              <p>
                <span className="text-purple-400">export default</span>{" "}
                <span className="text-yellow-400">Developer</span>;
              </p>
            </motion.div>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <a 
                href="https://github.com/adityakumarsingh2" 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-muted/50 border border-border hover:border-primary hover:text-primary transition-all"
              >
                <Github className="w-4 h-4" />
              </a>
              <a 
                href="https://linkedin.com/in/adityakumarsingh2" 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-muted/50 border border-border hover:border-primary hover:text-primary transition-all"
              >
                <Linkedin className="w-4 h-4" />
              </a>
              <a 
                href="mailto:adityakumarsingh909@outlook.com"
                className="p-2 rounded-lg bg-muted/50 border border-border hover:border-primary hover:text-primary transition-all"
              >
                <Mail className="w-4 h-4" />
              </a>
            </div>
            
            <p className="font-mono text-xs text-muted-foreground">
              <span className="text-primary/60">{"/* "}</span>
              © {new Date().getFullYear()} Aditya Kumar Singh • Built with React & ❤️
              <span className="text-primary/60">{" */"}</span>
            </p>
          </div>
        </div>
      </div>
    </motion.footer>
  );
};

export default Footer;
