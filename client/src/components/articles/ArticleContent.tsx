import React from "react";
import type { ComponentType } from "react";
import { MDXProvider } from "@mdx-js/react";
import { CodeBlock } from "./CodeBlock";
import { Info, AlertTriangle, CheckCircle } from "lucide-react";
import { mdxComponents } from "@/lib/mdx/components";

interface ArticleContentProps {
  content: string | ComponentType;
}

/**
 * Renders article content.
 * - MDX ComponentType → rendered via MDXProvider with our styled component map
 * - HTML string      → parsed by the existing parseContent() function (unchanged)
 */
export function ArticleContent({ content }: ArticleContentProps) {
  // ── MDX path (new) ───────────────────────────────────────────────────────
  if (typeof content !== "string") {
    const MDXContent = content as ComponentType;
    return (
      <MDXProvider components={mdxComponents}>
        <div className="article-prose">
          <MDXContent />
        </div>
      </MDXProvider>
    );
  }

  // ── Legacy HTML string path (unchanged) ──────────────────────────────────
  const rendered = parseContent(content as string);
  return (
    <div className="article-prose">
      {rendered}
    </div>
  );
}

function parseContent(html: string): React.ReactNode[] {
  // Pre-process: extract code blocks before any other parsing to preserve them
  const segments: { type: "html" | "code"; content: string; language?: string; filename?: string }[] = [];
  
  const codeBlockRegex = /<pre><code(?:\s+class="language-([^"]*)")?(?:\s+data-filename="([^"]*)")?>([\s\S]*?)<\/code><\/pre>/g;
  let lastIndex = 0;
  let match;

  while ((match = codeBlockRegex.exec(html)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ type: "html", content: html.slice(lastIndex, match.index) });
    }
    segments.push({
      type: "code",
      language: match[1] || "code",
      filename: match[2],
      content: decodeHTML(match[3]),
    });
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < html.length) {
    segments.push({ type: "html", content: html.slice(lastIndex) });
  }

  const nodes: React.ReactNode[] = [];
  
  segments.forEach((seg, si) => {
    if (seg.type === "code") {
      nodes.push(
        <CodeBlock
          key={`code-${si}`}
          code={seg.content}
          language={seg.language}
          filename={seg.filename}
        />
      );
    } else {
      nodes.push(...parseHTMLSegment(seg.content, si));
    }
  });

  return nodes;
}

function decodeHTML(str: string): string {
  return str
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function parseHTMLSegment(html: string, segIndex: number): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  
  // Split by top-level block elements
  const blockPattern = /<(h2|h3|p|ul|ol|blockquote|table|callout|figure|h4)[^>]*>([\s\S]*?)<\/\1>/g;
  let last = 0;
  let m;
  let idx = 0;

  while ((m = blockPattern.exec(html)) !== null) {
    const tag = m[1];
    const inner = m[2];
    const attrs = m[0].match(/id="([^"]*)"/)?.[1];
    const key = `${segIndex}-${tag}-${idx++}`;

    switch (tag) {
      case "h2":
        nodes.push(
          <h2
            key={key}
            id={attrs}
            className="font-display text-2xl md:text-3xl font-bold mt-14 mb-5 text-foreground scroll-mt-24 group"
          >
            <span className="text-primary/40 font-mono text-xl mr-2">##</span>
            <span dangerouslySetInnerHTML={{ __html: inner }} />
          </h2>
        );
        break;

      case "h3":
        nodes.push(
          <h3
            key={key}
            id={attrs}
            className="font-display text-xl md:text-2xl font-bold mt-10 mb-4 text-foreground scroll-mt-24"
          >
            <span className="text-primary/30 font-mono text-lg mr-2">###</span>
            <span dangerouslySetInnerHTML={{ __html: inner }} />
          </h3>
        );
        break;

      case "h4":
        nodes.push(
          <h4
            key={key}
            className="font-sans text-lg font-semibold mt-8 mb-3 text-foreground"
            dangerouslySetInnerHTML={{ __html: inner }}
          />
        );
        break;

      case "p":
        nodes.push(
          <p
            key={key}
            className="text-foreground/80 leading-8 mb-5 text-[1.05rem]"
            dangerouslySetInnerHTML={{ __html: renderInlineCode(inner) }}
          />
        );
        break;

      case "ul":
        nodes.push(
          <ul key={key} className="my-5 space-y-2 pl-0">
            {parseListItems(inner, "ul", key)}
          </ul>
        );
        break;

      case "ol":
        nodes.push(
          <ol key={key} className="my-5 space-y-2 pl-0 counter-reset-list">
            {parseListItems(inner, "ol", key)}
          </ol>
        );
        break;

      case "blockquote":
        nodes.push(
          <blockquote
            key={key}
            className="my-6 pl-5 border-l-2 border-primary/60 bg-muted/20 py-4 pr-4 rounded-r-lg italic text-foreground/70 text-[1.02rem] leading-8"
            dangerouslySetInnerHTML={{ __html: renderInlineCode(inner.replace(/<\/?p>/g, "")) }}
          />
        );
        break;

      case "table":
        nodes.push(<ArticleTable key={key} html={m[0]} />);
        break;

      case "callout": {
        const typeMatch = m[0].match(/type="([^"]*)"/);
        const calloutType = (typeMatch?.[1] ?? "info") as "info" | "warning" | "success";
        nodes.push(<Callout key={key} type={calloutType} html={inner} />);
        break;
      }

      default:
        break;
    }
    last = m.index + m[0].length;
  }

  return nodes;
}

function renderInlineCode(html: string): string {
  return html.replace(
    /<code>(.*?)<\/code>/g,
    '<code class="font-mono text-sm px-1.5 py-0.5 rounded bg-muted border border-border/60 text-green-400">$1</code>'
  );
}

function parseListItems(html: string, type: "ul" | "ol", parentKey: string): React.ReactNode[] {
  const liPattern = /<li>([\s\S]*?)<\/li>/g;
  const items: React.ReactNode[] = [];
  let m;
  let i = 0;
  while ((m = liPattern.exec(html)) !== null) {
    if (type === "ul") {
      items.push(
        <li key={`${parentKey}-li-${i++}`} className="flex items-start gap-3 text-foreground/80 leading-7">
          <span className="mt-2.5 w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: "var(--gradient-warm)" }} />
          <span dangerouslySetInnerHTML={{ __html: renderInlineCode(m[1]) }} />
        </li>
      );
    } else {
      const num = i + 1;
      items.push(
        <li key={`${parentKey}-li-${i++}`} className="flex items-start gap-3 text-foreground/80 leading-7">
          <span className="font-mono text-sm text-primary/60 flex-shrink-0 mt-0.5 w-6 text-right">{num}.</span>
          <span dangerouslySetInnerHTML={{ __html: renderInlineCode(m[1]) }} />
        </li>
      );
    }
  }
  return items;
}

function ArticleTable({ html }: { html: string }) {
  return (
    <div className="my-8 overflow-x-auto rounded-xl border border-border">
      <table
        className="w-full text-sm text-left"
        dangerouslySetInnerHTML={{
          __html: html
            .replace(/<table[^>]*>/, "")
            .replace(/<\/table>/, "")
            .replace(/<thead>/g, '<thead class="bg-muted/50">')
            .replace(/<th>/g, '<th class="px-4 py-3 font-semibold text-foreground border-b border-border">')
            .replace(/<td>/g, '<td class="px-4 py-3 text-foreground/80 border-b border-border/40">'),
        }}
      />
    </div>
  );
}

const calloutConfig = {
  info: {
    icon: Info,
    bg: "bg-blue-500/10",
    border: "border-blue-500/30",
    iconColor: "text-blue-400",
    label: "Note",
  },
  warning: {
    icon: AlertTriangle,
    bg: "bg-yellow-500/10",
    border: "border-yellow-500/30",
    iconColor: "text-yellow-400",
    label: "Warning",
  },
  success: {
    icon: CheckCircle,
    bg: "bg-green-500/10",
    border: "border-green-500/30",
    iconColor: "text-green-400",
    label: "Tip",
  },
};

function Callout({ type, html }: { type: "info" | "warning" | "success"; html: string }) {
  const cfg = calloutConfig[type];
  const Icon = cfg.icon;
  return (
    <div className={`my-6 flex gap-4 p-5 rounded-xl border ${cfg.bg} ${cfg.border}`}>
      <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${cfg.iconColor}`} />
      <div
        className="text-foreground/80 leading-7 text-[0.95rem]"
        dangerouslySetInnerHTML={{ __html: renderInlineCode(html) }}
      />
    </div>
  );
}
