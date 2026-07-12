import { motion } from "framer-motion";
import { useState, useEffect } from "react";

interface TerminalTextProps {
  commands: Array<{
    prompt?: string;
    command: string;
    output?: string;
  }>;
  className?: string;
}

const TerminalText = ({ commands, className = "" }: TerminalTextProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showCursor, setShowCursor] = useState(true);

  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 530);
    return () => clearInterval(cursorInterval);
  }, []);

  return (
    <motion.div 
      className={`font-mono text-sm rounded-lg overflow-hidden border border-border/60 bg-card/90 backdrop-blur-sm ${className}`}
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      {/* Terminal Header */}
      <div className="flex items-center gap-2 px-4 py-2.5 bg-muted/50 border-b border-border/60">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-500/80" />
          <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
          <div className="w-3 h-3 rounded-full bg-green-500/80" />
        </div>
        <span className="text-muted-foreground text-xs ml-2 font-medium">terminal</span>
      </div>
      
      {/* Terminal Content */}
      <div className="p-4 space-y-2">
        {commands.map((cmd, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.2, duration: 0.3 }}
          >
            <div className="flex items-center gap-2">
              <span className="text-green-400">{cmd.prompt || "❯"}</span>
              <span className="text-foreground">{cmd.command}</span>
              {index === commands.length - 1 && showCursor && (
                <span className="inline-block w-2 h-4 bg-primary animate-pulse" />
              )}
            </div>
            {cmd.output && (
              <div className="text-muted-foreground ml-4 mt-1">{cmd.output}</div>
            )}
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default TerminalText;
