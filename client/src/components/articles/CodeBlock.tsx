import React, { useState } from "react";
import { Copy, Check } from "lucide-react";

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
    <div className="group relative my-6 rounded-xl overflow-hidden border border-border bg-[hsl(240_10%_6%)]">
      {/* Header bar */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border/60 bg-[hsl(240_10%_8%)]">
        <div className="flex items-center gap-3">
          {/* Traffic lights */}
          <div className="flex gap-1.5">
            <span className="w-3 h-3 rounded-full bg-red-500/70" />
            <span className="w-3 h-3 rounded-full bg-yellow-500/70" />
            <span className="w-3 h-3 rounded-full bg-green-500/70" />
          </div>
          {filename && (
            <span className="font-mono text-xs text-muted-foreground">{filename}</span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs text-muted-foreground/60 uppercase tracking-wider">
            {language}
          </span>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 font-mono text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded-md hover:bg-muted/50"
            aria-label="Copy code"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-green-400" />
                <span className="text-green-400">Copied</span>
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

      {/* Code content */}
      <pre className="overflow-x-auto p-5 text-sm leading-relaxed">
        <code className={`language-${language} font-mono`}>
          {renderSyntaxHighlight(code, language)}
        </code>
      </pre>
    </div>
  );
}

/** Lightweight syntax highlighting via regex — no heavy library needed */
function renderSyntaxHighlight(code: string, language: string): React.ReactNode {
  if (!["javascript", "typescript", "python", "json", "bash"].includes(language)) {
    return <span className="text-foreground/90">{code}</span>;
  }

  const lines = code.split("\n");
  return (
    <>
      {lines.map((line, i) => (
        <span key={i}>
          {highlightLine(line, language)}
          {i < lines.length - 1 && "\n"}
        </span>
      ))}
    </>
  );
}

function highlightLine(line: string, lang: string): React.ReactNode {
  // Simple keyword highlighting
  if (lang === "json") {
    // Group 1: key, Group 2: string, Group 3: number, Group 4: boolean/null
    const jsonRegex = /("[\w-]+"(?=\s*:))|(".*?")|(\b\d+\b)|(\b(?:true|false|null)\b)/g;
    return tokenizeAndRender(line, jsonRegex, (match, g1, g2, g3, g4) => {
      if (g1) return <span className="text-blue-400">{g1}</span>;
      if (g2) return <span className="text-green-400">{g2}</span>;
      if (g3) return <span className="text-orange-400">{g3}</span>;
      if (g4) return <span className="text-purple-400">{g4}</span>;
      return match;
    });
  }

  // General code highlighting (javascript, typescript, python, bash)
  // Group 1: comments (//... or #...)
  // Group 2: strings ("..." or '...' or `...`)
  // Group 3: keywords
  // Group 4: numbers
  const codeRegex = /(\/\/.*$|#.*$)|(".*?"|'.*?'|`.*?`)|(\b(?:import|export|from|const|let|var|function|async|await|return|if|else|for|while|class|interface|type|extends|implements|default|new|throw|try|catch|finally|of|in|and|or|not|def|self|print|with|as|yield)\b)|(\b\d+\b)/g;

  return tokenizeAndRender(line, codeRegex, (match, g1, g2, g3, g4) => {
    if (g1) return <span className="text-muted-foreground/60 italic">{g1}</span>;
    if (g2) return <span className="text-green-400">{g2}</span>;
    if (g3) return <span className="text-purple-400">{g3}</span>;
    if (g4) return <span className="text-orange-400">{g4}</span>;
    return match;
  });
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
