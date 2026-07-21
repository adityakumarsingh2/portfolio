import React from "react";
import { motion } from "framer-motion";

interface CodeSnippetProps {
  code: string;
  language?: string;
  showLineNumbers?: boolean;
  animate?: boolean;
}

const CodeSnippet = ({ 
  code, 
  language = "tsx", 
  showLineNumbers = true,
  animate = true 
}: CodeSnippetProps) => {
  const lines = code.split('\n');
  
  return (
    <motion.div 
      className="font-mono text-xs sm:text-sm rounded-lg overflow-hidden border border-border/60 bg-card/80 backdrop-blur-sm"
      initial={animate ? { opacity: 0, y: 10 } : undefined}
      whileInView={animate ? { opacity: 1, y: 0 } : undefined}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      {/* Terminal Header */}
      <div className="flex items-center gap-2 px-4 py-2 bg-muted/50 border-b border-border/60">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-500/70" />
          <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
          <div className="w-3 h-3 rounded-full bg-green-500/70" />
        </div>
        <span className="text-muted-foreground text-xs ml-2">{language}</span>
      </div>
      
      {/* Code Content */}
      <div className="p-4 overflow-x-auto">
        {lines.map((line, index) => (
          <motion.div 
            key={index}
            className="flex"
            initial={animate ? { opacity: 0, x: -10 } : undefined}
            whileInView={animate ? { opacity: 1, x: 0 } : undefined}
            viewport={{ once: true }}
            transition={{ delay: index * 0.05, duration: 0.3 }}
          >
            {showLineNumbers && (
              <span className="text-muted-foreground/50 w-8 select-none text-right mr-4">
                {index + 1}
              </span>
            )}
            <span className="text-foreground/90 whitespace-pre">
              {highlightSyntax(line)}
            </span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

// Simple syntax highlighting
const highlightSyntax = (line: string): React.ReactNode => {
  // Group 1: comments (//...)
  // Group 2: strings ("..." or '...' or `...`)
  // Group 3: keywords
  // Group 4: types
  const regex = /(\/\/.*$)|(["'`].*?["'`])|(\b(?:const|let|var|function|return|import|export|from|if|else|for|while|class|interface|type|async|await)\b)|(\b(?:string|number|boolean|void|any|null|undefined)\b)/g;

  return tokenizeAndRender(line, regex, (match, g1, g2, g3, g4) => {
    if (g1) return <span className="text-muted-foreground/60">{g1}</span>;
    if (g2) return <span className="text-green-400">{g2}</span>;
    if (g3) return <span className="text-purple-400">{g3}</span>;
    if (g4) return <span className="text-yellow-400">{g4}</span>;
    return match;
  });
};

function tokenizeAndRender(
  text: string,
  regex: RegExp,
  renderToken: (match: string, ...groups: (string | undefined)[]) => React.ReactNode
): React.ReactNode {
  const result: React.ReactNode[] = [];
  let lastIndex = 0;
  let match;

  regex.lastIndex = 0;

  while ((match = regex.exec(text)) !== null) {
    const matchIndex = match.index;
    const matchText = match[0];

    if (matchIndex > lastIndex) {
      result.push(text.slice(lastIndex, matchIndex));
    }

    const groups = match.slice(1);
    result.push(
      <React.Fragment key={matchIndex}>
        {renderToken(matchText, ...groups)}
      </React.Fragment>
    );

    lastIndex = regex.lastIndex;

    if (matchText.length === 0) {
      regex.lastIndex++;
    }
  }

  if (lastIndex < text.length) {
    result.push(text.slice(lastIndex));
  }

  return <>{result}</>;
}

export default CodeSnippet;
