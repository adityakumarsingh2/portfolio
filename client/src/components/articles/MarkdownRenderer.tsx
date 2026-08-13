/**
 * components/articles/MarkdownRenderer.tsx
 *
 * Rich Markdown renderer for Articles AI chat messages.
 * Supports:
 *   - GFM Markdown Tables (responsive container, dark styling, hover states)
 *   - Fenced Code Blocks (language badges, traffic lights, 1-click Copy button)
 *   - Task Lists (- [ ] / - [x])
 *   - Unordered & Ordered Lists (nested support)
 *   - Blockquotes
 *   - Headings (H1 - H3)
 *   - External Links
 *   - Inline Code & Formatting
 */

import React, { useState } from "react";
import { Copy, Check, CheckSquare, Square } from "lucide-react";

interface MarkdownRendererProps {
  content: string;
}

interface CodeBlockProps {
  code: string;
  language?: string;
}

function InlineCodeBlock({ code, language = "code" }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-3 rounded-xl overflow-hidden border border-white/10 bg-[#0d0d12] shadow-lg">
      {/* Header bar */}
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-white/10 bg-white/[0.04]">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
            <span className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
          </div>
          <span className="font-mono text-[0.68rem] text-muted-foreground/80 uppercase tracking-wider pl-1">
            {language}
          </span>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 font-mono text-[0.7rem] text-muted-foreground hover:text-foreground
            transition-colors px-2 py-0.5 rounded hover:bg-white/10"
          aria-label="Copy code snippet"
        >
          {copied ? (
            <>
              <Check className="w-3 h-3 text-emerald-400" />
              <span className="text-emerald-400">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Code content */}
      <pre className="overflow-x-auto p-3 text-[0.8rem] leading-5 font-mono text-violet-200/90">
        <code>{code}</code>
      </pre>
    </div>
  );
}

// Helper to parse GFM tables
interface TableData {
  headers: string[];
  rows: string[][];
}

function parseMarkdownTable(lines: string[]): TableData | null {
  if (lines.length < 2) return null;

  const parseRow = (line: string) =>
    line
      .trim()
      .replace(/^\||\|$/g, "")
      .split("|")
      .map((cell) => cell.trim());

  const headers = parseRow(lines[0]);
  const delimiterLine = lines[1].trim();

  // Validate delimiter line (e.g. |---|---|)
  if (!/^\|?\s*:?-+:?\s*(\|?\s*:?-+:?\s*)*\|?$/.test(delimiterLine)) {
    return null;
  }

  const rows = lines.slice(2).map(parseRow);
  return { headers, rows };
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  if (!content) return null;

  const lines = content.split("\n");
  const blocks: React.ReactNode[] = [];
  let i = 0;
  let key = 0;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    // 1. Fenced Code Blocks (```)
    if (trimmed.startsWith("```")) {
      const language = trimmed.slice(3).trim() || "code";
      const codeLines: string[] = [];
      i++;

      while (i < lines.length && !lines[i].trim().startsWith("```")) {
        codeLines.push(lines[i]);
        i++;
      }
      i++; // skip closing ```

      blocks.push(
        <InlineCodeBlock key={`code-${key++}`} code={codeLines.join("\n")} language={language} />
      );
      continue;
    }

    // 2. Markdown Tables (| col | col |)
    if (trimmed.startsWith("|") && trimmed.endsWith("|")) {
      const tableLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith("|")) {
        tableLines.push(lines[i]);
        i++;
      }

      const tableData = parseMarkdownTable(tableLines);
      if (tableData) {
        blocks.push(
          <div key={`table-${key++}`} className="my-3 overflow-x-auto rounded-xl border border-white/10 bg-white/[0.02]">
            <table className="w-full text-left border-collapse min-w-[320px]">
              <thead>
                <tr className="border-b border-white/15 bg-white/[0.06]">
                  {tableData.headers.map((header, idx) => (
                    <th key={idx} className="px-3.5 py-2 text-[0.78rem] font-semibold text-foreground">
                      <span dangerouslySetInnerHTML={{ __html: inlineFormat(header) }} />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {tableData.rows.map((row, rIdx) => (
                  <tr key={rIdx} className="hover:bg-white/[0.03] transition-colors">
                    {row.map((cell, cIdx) => (
                      <td key={cIdx} className="px-3.5 py-2 text-[0.78rem] text-foreground/85 leading-relaxed">
                        <span dangerouslySetInnerHTML={{ __html: inlineFormat(cell) }} />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
        continue;
      }
    }

    // 3. Horizontal Rules (--- or ***)
    if (/^([*_ -])\1{2,}$/.test(trimmed)) {
      blocks.push(<hr key={`hr-${key++}`} className="border-t border-white/10 my-3" />);
      i++;
      continue;
    }

    // 4. Headings (# H1, ## H2, ### H3)
    if (/^#{1,3}\s/.test(trimmed)) {
      const level = trimmed.indexOf(" ");
      const headingText = trimmed.slice(level + 1).trim();

      if (level === 1) {
        blocks.push(
          <h1 key={`h1-${key++}`} className="text-base font-bold text-foreground mt-3 mb-1.5">
            <span dangerouslySetInnerHTML={{ __html: inlineFormat(headingText) }} />
          </h1>
        );
      } else if (level === 2) {
        blocks.push(
          <h2 key={`h2-${key++}`} className="text-sm font-semibold text-foreground mt-2.5 mb-1">
            <span dangerouslySetInnerHTML={{ __html: inlineFormat(headingText) }} />
          </h2>
        );
      } else {
        blocks.push(
          <h3 key={`h3-${key++}`} className="text-[0.84rem] font-semibold text-foreground/90 mt-2 mb-1">
            <span dangerouslySetInnerHTML={{ __html: inlineFormat(headingText) }} />
          </h3>
        );
      }
      i++;
      continue;
    }

    // 5. Blockquotes (> quote)
    if (trimmed.startsWith(">")) {
      const quoteLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith(">")) {
        quoteLines.push(lines[i].trim().slice(1).trim());
        i++;
      }

      blocks.push(
        <blockquote
          key={`quote-${key++}`}
          className="border-l-2 border-violet-500/80 bg-violet-500/10 px-3.5 py-2 rounded-r-lg my-2
            text-foreground/80 italic text-[0.8rem] leading-relaxed"
        >
          <span dangerouslySetInnerHTML={{ __html: inlineFormat(quoteLines.join(" ")) }} />
        </blockquote>
      );
      continue;
    }

    // 6. Task Lists (- [ ] or - [x])
    if (/^[-*]\s+\[[ xX]\]\s/.test(trimmed)) {
      const isChecked = /^[-*]\s+\[[xX]\]\s/.test(trimmed);
      const taskText = trimmed.replace(/^[-*]\s+\[[ xX]\]\s/, "");

      blocks.push(
        <div key={`task-${key++}`} className="flex items-start gap-2 my-1 text-[0.82rem] leading-5.5 text-foreground/85">
          {isChecked ? (
            <CheckSquare className="w-3.5 h-3.5 text-emerald-400 mt-1 flex-shrink-0" />
          ) : (
            <Square className="w-3.5 h-3.5 text-muted-foreground mt-1 flex-shrink-0" />
          )}
          <span className={isChecked ? "line-through opacity-70" : ""} dangerouslySetInnerHTML={{ __html: inlineFormat(taskText) }} />
        </div>
      );
      i++;
      continue;
    }

    // 7. Lists (Unordered & Ordered)
    if (/^([-*•]|\d+\.)\s/.test(trimmed)) {
      const listItems: { text: string; isOrdered: boolean; number?: string }[] = [];

      while (i < lines.length && /^([-*•]|\d+\.)\s/.test(lines[i].trim())) {
        const itemLine = lines[i].trim();
        const ordMatch = itemLine.match(/^(\d+)\.\s+(.*)/);
        if (ordMatch) {
          listItems.push({ text: ordMatch[2], isOrdered: true, number: ordMatch[1] });
        } else {
          listItems.push({ text: itemLine.replace(/^[-*•]\s+/, ""), isOrdered: false });
        }
        i++;
      }

      blocks.push(
        <ul key={`list-${key++}`} className="my-2 space-y-1 pl-1">
          {listItems.map((item, idx) => (
            <li key={idx} className="flex items-start gap-2 text-[0.82rem] leading-5.5 text-foreground/85">
              {item.isOrdered ? (
                <span className="font-mono text-[0.72rem] font-medium text-violet-400 mt-0.5 flex-shrink-0 min-w-[16px]">
                  {item.number}.
                </span>
              ) : (
                <span className="mt-2 w-1.5 h-1.5 rounded-full bg-violet-400/80 flex-shrink-0" />
              )}
              <span dangerouslySetInnerHTML={{ __html: inlineFormat(item.text) }} />
            </li>
          ))}
        </ul>
      );
      continue;
    }

    // 8. Paragraphs / Normal Text
    if (trimmed) {
      blocks.push(
        <p key={`p-${key++}`} className="text-[0.82rem] leading-5.5 text-foreground/85 my-1.5">
          <span dangerouslySetInnerHTML={{ __html: inlineFormat(trimmed) }} />
        </p>
      );
    }

    i++;
  }

  return <div className="space-y-1">{blocks}</div>;
}

/** Formats inline elements: bold, italic, code pills, and links */
function inlineFormat(text: string): string {
  return text
    // Escaping HTML characters
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    // Restore escaped formatting tags
    .replace(/&lt;(\/?(?:strong|em|code|a|span)[^&]*)&gt;/g, "<$1>")
    // Bold (**text**)
    .replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold text-foreground">$1</strong>')
    // Inline code (`text`)
    .replace(/`([^`]+)`/g, '<code class="font-mono text-[0.76rem] px-1.5 py-0.5 rounded bg-violet-500/15 border border-violet-500/25 text-violet-300">$1</code>')
    // Italic (*text*)
    .replace(/\*([^*]+)\*/g, '<em class="italic text-foreground/90">$1</em>')
    // Markdown Links [text](url)
    .replace(
      /\[([^\]]+)\]\(([^)]+)\)/g,
      '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-violet-400 hover:text-violet-300 underline underline-offset-2 inline-flex items-center gap-0.5 transition-colors">$1</a>'
    );
}
