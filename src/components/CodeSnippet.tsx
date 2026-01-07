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
const highlightSyntax = (line: string) => {
  const keywords = ['const', 'let', 'var', 'function', 'return', 'import', 'export', 'from', 'if', 'else', 'for', 'while', 'class', 'interface', 'type', 'async', 'await'];
  const types = ['string', 'number', 'boolean', 'void', 'any', 'null', 'undefined'];
  
  let result = line;
  
  // This is a simplified version - in a real app, use a proper syntax highlighter
  keywords.forEach(keyword => {
    const regex = new RegExp(`\\b(${keyword})\\b`, 'g');
    result = result.replace(regex, `<span class="text-purple-400">$1</span>`);
  });
  
  types.forEach(type => {
    const regex = new RegExp(`\\b(${type})\\b`, 'g');
    result = result.replace(regex, `<span class="text-yellow-400">$1</span>`);
  });
  
  // Highlight strings
  result = result.replace(/(["'`].*?["'`])/g, '<span class="text-green-400">$1</span>');
  
  // Highlight comments
  result = result.replace(/(\/\/.*$)/g, '<span class="text-muted-foreground/60">$1</span>');
  
  return <span dangerouslySetInnerHTML={{ __html: result }} />;
};

export default CodeSnippet;
