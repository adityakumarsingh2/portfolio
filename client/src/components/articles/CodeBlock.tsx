import React, { useState } from "react";
import { Copy, Check, Code2, Terminal } from "lucide-react";

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

  const lines = code.replace(/\n$/, "").split("\n");

  return (
    <div className="group relative my-6 rounded-2xl overflow-hidden border border-white/10 bg-[hsl(240_10%_4%)] shadow-none transition-all duration-300">
      {/* Header bar — IDE Studio Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/10 bg-white/[0.03] font-mono text-xs select-none">
        <div className="flex items-center gap-3">
          {/* Traffic lights */}
          <div className="flex gap-1.5 items-center">
            <span className="w-3 h-3 rounded-full bg-red-500/80 shadow-[0_0_6px_rgba(239,68,68,0.35)]" />
            <span className="w-3 h-3 rounded-full bg-yellow-500/80 shadow-[0_0_6px_rgba(234,179,8,0.35)]" />
            <span className="w-3 h-3 rounded-full bg-green-500/80 shadow-[0_0_6px_rgba(34,197,94,0.35)]" />
          </div>

          {filename ? (
            <span className="text-foreground/80 font-medium flex items-center gap-1.5">
              <Code2 className="w-3.5 h-3.5 text-primary/80" />
              {filename}
            </span>
          ) : (
            <span className="text-muted-foreground/60 tracking-wider text-[11px] flex items-center gap-1">
              <Terminal className="w-3 h-3 text-primary/60" />
              {language.toLowerCase()}
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <span className="text-primary font-mono text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-primary/10 border border-primary/20">
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

      {/* Code Body with Line Numbers */}
      <div className="overflow-x-auto p-4 font-mono text-sm leading-relaxed">
        <table className="w-full border-collapse text-left">
          <tbody>
            {lines.map((line, idx) => (
              <tr key={idx} className="hover:bg-white/[0.03] transition-colors group/line">
                <td className="w-10 select-none text-right pr-4 text-xs text-muted-foreground/30 font-mono group-hover/line:text-muted-foreground/60 transition-colors border-r border-border/20 shrink-0">
                  {idx + 1}
                </td>
                <td className="pl-4 whitespace-pre font-mono">
                  {highlightTokens(line, language)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/** Professional multi-token syntax highlighting */
function highlightTokens(line: string, lang: string): React.ReactNode {
  if (!line || line.trim() === "") return <br />;

  // JSON
  if (lang === "json") {
    const jsonRegex = /("[\w-]+"(?=\s*:))|(".*?")|(\b\d+(?:\.\d+)?\b)|(\b(?:true|false|null)\b)/g;
    return tokenize(line, jsonRegex, (match, g1, g2, g3, g4) => {
      if (g1) return <span className="text-sky-300 font-medium">{g1}</span>;
      if (g2) return <span className="text-green-400">{g2}</span>;
      if (g3) return <span className="text-orange-400">{g3}</span>;
      if (g4) return <span className="text-purple-400 font-medium">{g4}</span>;
      return match;
    });
  }

  // Shell / Bash
  if (lang === "bash" || lang === "sh" || lang === "shell") {
    const bashRegex = /(#.*$)|(".*?"|'.*?')|(\b(?:npm|npx|node|python|git|docker|cd|mkdir|rm|cp|mv|cat|ls|echo|curl|pip|yarn|pnpm)\b)|(--?[\w-]+)/g;
    return tokenize(line, bashRegex, (match, g1, g2, g3, g4) => {
      if (g1) return <span className="text-muted-foreground/60 italic">{g1}</span>;
      if (g2) return <span className="text-green-400">{g2}</span>;
      if (g3) return <span className="text-yellow-400 font-semibold">{g3}</span>;
      if (g4) return <span className="text-orange-400">{g4}</span>;
      return match;
    });
  }

  // Multi-token Syntax Highlighting (Python, TypeScript, JavaScript, JSX, TSX, C++)
  const tokenRegex =
    /(\/\/.*$|#.*$)|(".*?"|'.*?'|`.*?`)|(@\w+)|(\b(?:def|class|return|import|from|as|with|yield|lambda|pass|raise|try|except|finally|assert|if|elif|else|for|while|in|is|not|and|or|const|let|var|function|async|await|type|interface|enum|extends|implements|export|default|new|delete|typeof|instanceof)\b)|(\b(?:str|int|float|bool|list|dict|set|tuple|object|bytes|List|Dict|Set|Tuple|Optional|Union|Any|Callable|Promise|Array|String|Number|Boolean|Record|Response|Request|ChatOpenAI|PromptTemplate|CorrectiveRAGAgent|RAGAS|TruLens|Qdrant|VectorStore)\b)|(\b[a-zA-Z_]\w*(?=\s*\())|(\b(?:True|False|None|true|false|null|undefined|NaN)\b)|(\b\d+(?:\.\d+)?\b)|(->|=>|==|!=|<=|>=|\+=|-=|\*=|\/=|&&|\|\||[=+*/%<>:])/g;

  return tokenize(
    line,
    tokenRegex,
    (match, g1, g2, g3, g4, g5, g6, g7, g8, g9) => {
      if (g1) return <span className="text-muted-foreground/60 italic">{g1}</span>; // Comments
      if (g2) return <span className="text-green-400">{g2}</span>; // Strings
      if (g3) return <span className="text-orange-400 font-medium">{g3}</span>; // Decorators
      if (g4) return <span className="text-purple-400 font-semibold">{g4}</span>; // Keywords
      if (g5) return <span className="text-sky-300 font-medium">{g5}</span>; // Built-in Types/Classes
      if (g6) return <span className="text-yellow-400 font-medium">{g6}</span>; // Functions/Methods
      if (g7) return <span className="text-orange-400 font-medium">{g7}</span>; // Booleans/Constants
      if (g8) return <span className="text-orange-400 font-medium">{g8}</span>; // Numbers
      if (g9) return <span className="text-primary/70">{g9}</span>; // Operators/Punctuation
      return <span className="text-foreground/90">{match}</span>;
    }
  );
}

function tokenize(
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
        <span key={`text-${lastIndex}`} className="text-foreground/90 font-mono">
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
      <span key={`text-${lastIndex}`} className="text-foreground/90 font-mono">
        {text.slice(lastIndex)}
      </span>
    );
  }

  return <>{result}</>;
}
