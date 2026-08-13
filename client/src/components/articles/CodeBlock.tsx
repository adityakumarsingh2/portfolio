import React, { useState } from "react";
import { Copy, Check, Code2 } from "lucide-react";

interface CodeBlockProps {
  code: string;
  language?: string;
  filename?: string;
}

export function CodeBlock({ code, language = "code", filename }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="group relative my-6 rounded-2xl overflow-hidden border border-border/60 bg-card/90 backdrop-blur-sm shadow-md transition-all duration-300 hover:border-primary/40 hover:shadow-[0_8px_30px_hsl(15_85%_55%/0.12)]">
      {/* Header bar — signature portfolio glassmorphic terminal header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/50 bg-muted/40 font-mono text-xs">
        <div className="flex items-center gap-3">
          {/* Traffic lights with subtle ambient glow */}
          <div className="flex gap-1.5 items-center">
            <span className="w-3 h-3 rounded-full bg-red-500/80 shadow-[0_0_8px_rgba(239,68,68,0.35)]" />
            <span className="w-3 h-3 rounded-full bg-yellow-500/80 shadow-[0_0_8px_rgba(234,179,8,0.35)]" />
            <span className="w-3 h-3 rounded-full bg-green-500/80 shadow-[0_0_8px_rgba(34,197,94,0.35)]" />
          </div>

          {filename ? (
            <span className="text-muted-foreground font-medium flex items-center gap-1.5">
              <Code2 className="w-3.5 h-3.5 text-primary/60" />
              {filename}
            </span>
          ) : (
            <span className="text-muted-foreground/60 tracking-wider">code.terminal</span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <span className="text-primary/70 uppercase tracking-widest text-[11px] font-semibold bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full">
            {language}
          </span>

          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all duration-200 px-2.5 py-1 rounded-lg border border-transparent hover:border-primary/20"
            aria-label="Copy code"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-green-400" />
                <span className="text-green-400 font-semibold">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Code content body — obsidian dark background with portfolio syntax theme */}
      <pre className="overflow-x-auto p-5 text-sm leading-relaxed bg-[hsl(240_10%_4%)] selection:bg-primary/20">
        <code className={`language-${language} font-mono`}>
          {renderSyntaxHighlight(code, language)}
        </code>
      </pre>
    </div>
  );
}

/** Syntax highlighting mapped directly to portfolio signature theme tokens */
function renderSyntaxHighlight(code: string, language: string): React.ReactNode {
  const lines = code.split("\n");
  return (
    <>
      {lines.map((line, i) => (
        <span key={i} className="border-0 bg-transparent block">
          {highlightLine(line, language)}
          {i < lines.length - 1 && "\n"}
        </span>
      ))}
    </>
  );
}

function highlightLine(line: string, lang: string): React.ReactNode {
  // JSON Highlighting
  if (lang === "json") {
    const jsonRegex = /("[\w-]+"(?=\s*:))|(".*?")|(\b\d+(?:\.\d+)?\b)|(\b(?:true|false|null)\b)/g;
    return tokenizeAndRender(line, jsonRegex, (match, g1, g2, g3, g4) => {
      if (g1) return <span className="text-sky-300 font-medium">{g1}</span>;
      if (g2) return <span className="text-green-400">{g2}</span>;
      if (g3) return <span className="text-orange-400">{g3}</span>;
      if (g4) return <span className="text-purple-400 font-medium">{g4}</span>;
      return match;
    });
  }

  // Bash / Shell Highlighting
  if (lang === "bash" || lang === "sh" || lang === "shell") {
    const bashRegex = /(#.*$)|(".*?"|'.*?')|(\b(?:npm|npx|node|python|git|docker|cd|mkdir|rm|cp|mv|cat|ls|echo|curl|pip|yarn|pnpm)\b)|(--?[\w-]+)/g;
    return tokenizeAndRender(line, bashRegex, (match, g1, g2, g3, g4) => {
      if (g1) return <span className="text-muted-foreground/60 italic">{g1}</span>;
      if (g2) return <span className="text-green-400">{g2}</span>;
      if (g3) return <span className="text-yellow-400 font-semibold">{g3}</span>;
      if (g4) return <span className="text-orange-400">{g4}</span>;
      return match;
    });
  }

  // General Programming (Python, TypeScript, JavaScript, JSX, TSX, C++)
  // Group 1: Comments (#... or //...)
  // Group 2: Strings ("...", '...', `...`)
  // Group 3: Decorators (@decorator)
  // Group 4: Keywords (def, return, class, const, let, etc.)
  // Group 5: Built-in Types & Classes (str, int, List, Dict, etc.)
  // Group 6: Function & Method calls (function_name() or obj.method())
  // Group 7: Constants & Booleans (True, False, None, null, etc.)
  // Group 8: Numbers
  // Group 9: Operators & Punctuation (->, =>, ==, !=, =, +, -, etc.)
  const codeRegex =
    /(\/\/.*$|#.*$)|(".*?"|'.*?'|`.*?`)|(@\w+)|(\b(?:def|class|return|import|from|as|with|yield|lambda|pass|raise|try|except|finally|assert|if|elif|else|for|while|in|is|not|and|or|const|let|var|function|async|await|type|interface|enum|extends|implements|export|default|new|delete|typeof|instanceof)\b)|(\b(?:str|int|float|bool|list|dict|set|tuple|object|bytes|List|Dict|Set|Tuple|Optional|Union|Any|Callable|Promise|Array|String|Number|Boolean|Record|Response|Request|ChatOpenAI|PromptTemplate|CorrectiveRAGAgent|RAGAS|TruLens|Qdrant|VectorStore)\b)|(\b[a-zA-Z_]\w*(?=\s*\())|(\b(?:True|False|None|true|false|null|undefined|NaN)\b)|(\b\d+(?:\.\d+)?\b)|(->|=>|==|!=|<=|>=|\+=|-=|\*=|\/=|&&|\|\||[=+*/%<>:])/g;

  return tokenizeAndRender(
    line,
    codeRegex,
    (match, g1, g2, g3, g4, g5, g6, g7, g8, g9) => {
      if (g1) return <span className="text-muted-foreground/60 italic">{g1}</span>;
      if (g2) return <span className="text-green-400">{g2}</span>;
      if (g3) return <span className="text-orange-400 font-medium">{g3}</span>;
      if (g4) return <span className="text-purple-400 font-semibold">{g4}</span>;
      if (g5) return <span className="text-sky-300 font-medium">{g5}</span>;
      if (g6) return <span className="text-yellow-400 font-medium">{g6}</span>;
      if (g7) return <span className="text-orange-400 font-medium">{g7}</span>;
      if (g8) return <span className="text-orange-400 font-medium">{g8}</span>;
      if (g9) return <span className="text-primary/70">{g9}</span>;
      return <span className="text-foreground/90">{match}</span>;
    }
  );
}

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
      result.push(
        <span key={`text-${lastIndex}`} className="text-foreground/90">
          {text.slice(lastIndex, matchIndex)}
        </span>
      );
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
    result.push(
      <span key={`text-${lastIndex}`} className="text-foreground/90">
        {text.slice(lastIndex)}
      </span>
    );
  }

  return <>{result}</>;
}
