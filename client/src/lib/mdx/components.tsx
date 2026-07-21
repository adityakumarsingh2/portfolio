/**
 * lib/mdx/components.tsx
 * MDX component map — maps HTML elements and custom components to
 * the exact same styled React elements produced by ArticleContent.tsx.
 *
 * Registered via <MDXProvider components={mdxComponents}> in ArticleContent.
 * Custom components (Callout) are resolved from this map — no imports needed in MDX files.
 */

import React from "react";
import type { PropsWithChildren } from "react";
import type { MDXComponents } from "mdx/types";
import { Info, AlertTriangle, CheckCircle } from "lucide-react";
import { CodeBlock } from "@/components/articles/CodeBlock";

// ---------------------------------------------------------------------------
// List type context — lets <li> know whether it's inside <ul> or <ol>
// ---------------------------------------------------------------------------
const ListTypeCtx = React.createContext<"ul" | "ol">("ul");

// ---------------------------------------------------------------------------
// Callout component — available in all MDX files via MDXProvider
// ---------------------------------------------------------------------------
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

interface CalloutProps {
  type?: "info" | "warning" | "success";
  children: React.ReactNode;
}

export function Callout({ type = "info", children }: CalloutProps) {
  const cfg = calloutConfig[type] ?? calloutConfig.info;
  const Icon = cfg.icon;
  return (
    <div className={`my-6 flex gap-4 p-5 rounded-xl border ${cfg.bg} ${cfg.border}`}>
      <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${cfg.iconColor}`} />
      <div className="text-foreground/80 leading-7 text-[0.95rem]">{children}</div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Ordered list — enumerates children so <li> can display 1. 2. 3.
// ---------------------------------------------------------------------------
function OL({ children }: PropsWithChildren) {
  let counter = 0;
  const numbered = React.Children.map(children, (child) => {
    if (React.isValidElement(child)) {
      counter++;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return React.cloneElement(child as React.ReactElement<any>, {
        ...(child.props as object),
        _listType: "ol",
        _listNum: counter,
      });
    }
    return child;
  });
  return (
    <ListTypeCtx.Provider value="ol">
      <ol className="my-5 space-y-2 pl-0">{numbered}</ol>
    </ListTypeCtx.Provider>
  );
}

// ---------------------------------------------------------------------------
// List item — styled differently for ul vs ol
// ---------------------------------------------------------------------------
interface LiProps {
  children?: React.ReactNode;
  _listType?: "ul" | "ol";
  _listNum?: number;
}

function LI({ children, _listType, _listNum }: LiProps) {
  const ctxType = React.useContext(ListTypeCtx);
  const isOl = _listType === "ol" || ctxType === "ol";

  if (isOl && _listNum !== undefined) {
    return (
      <li className="flex items-start gap-3 text-foreground/80 leading-7">
        <span className="font-mono text-sm text-primary/60 flex-shrink-0 mt-0.5 w-6 text-right">
          {_listNum}.
        </span>
        <span>{children}</span>
      </li>
    );
  }

  return (
    <li className="flex items-start gap-3 text-foreground/80 leading-7">
      <span
        className="mt-2.5 w-1.5 h-1.5 rounded-full flex-shrink-0"
        style={{ background: "var(--gradient-warm, oklch(75% 0.18 60))" }}
      />
      <span>{children}</span>
    </li>
  );
}

// ---------------------------------------------------------------------------
// Pre / Code block — delegates to existing CodeBlock component
// ---------------------------------------------------------------------------
interface PreProps {
  children?: React.ReactElement<{ className?: string; children?: string }>;
}

function Pre({ children }: PreProps) {
  const codeEl = children as React.ReactElement<{
    className?: string;
    children?: string;
  }>;
  const className = codeEl?.props?.className ?? "";
  const language = className.replace("language-", "") || "code";
  const code = String(codeEl?.props?.children ?? "").replace(/\n$/, "");
  return <CodeBlock code={code} language={language} />;
}

// ---------------------------------------------------------------------------
// Table components
// ---------------------------------------------------------------------------
function Table({ children }: PropsWithChildren) {
  return (
    <div className="my-8 overflow-x-auto rounded-xl border border-border">
      <table className="w-full text-sm text-left">{children}</table>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main MDX component map
// ---------------------------------------------------------------------------
export const mdxComponents: MDXComponents = {
  // Headings — exact same classes as ArticleContent.tsx parser
  h2: ({ id, children }: { id?: string; children?: React.ReactNode }) => (
    <h2
      id={id}
      className="font-display text-2xl md:text-3xl font-bold mt-14 mb-5 text-foreground scroll-mt-24 group"
    >
      <span className="text-primary/40 font-mono text-xl mr-2">##</span>
      <span>{children}</span>
    </h2>
  ),
  h3: ({ id, children }: { id?: string; children?: React.ReactNode }) => (
    <h3
      id={id}
      className="font-display text-xl md:text-2xl font-bold mt-10 mb-4 text-foreground scroll-mt-24"
    >
      <span className="text-primary/30 font-mono text-lg mr-2">###</span>
      <span>{children}</span>
    </h3>
  ),
  h4: ({ children }: { children?: React.ReactNode }) => (
    <h4 className="font-sans text-lg font-semibold mt-8 mb-3 text-foreground">
      {children}
    </h4>
  ),

  // Paragraph
  p: ({ children }: { children?: React.ReactNode }) => (
    <p className="text-foreground/80 leading-8 mb-5 text-[1.05rem]">{children}</p>
  ),

  // Lists
  ul: ({ children }: PropsWithChildren) => (
    <ListTypeCtx.Provider value="ul">
      <ul className="my-5 space-y-2 pl-0">{children}</ul>
    </ListTypeCtx.Provider>
  ),
  ol: OL,
  li: LI,

  // Blockquote
  blockquote: ({ children }: PropsWithChildren) => (
    <blockquote className="my-6 pl-5 border-l-2 border-primary/60 bg-muted/20 py-4 pr-4 rounded-r-lg italic text-foreground/70 text-[1.02rem] leading-8">
      {children}
    </blockquote>
  ),

  // Inline code
  code: ({ children }: { children?: React.ReactNode }) => (
    <code className="font-mono text-sm px-1.5 py-0.5 rounded bg-muted border border-border/60 text-green-400">
      {children}
    </code>
  ),

  // Code block (pre > code)
  pre: Pre,

  // Table
  table: Table,
  thead: ({ children }: PropsWithChildren) => (
    <thead className="bg-muted/50">{children}</thead>
  ),
  tbody: ({ children }: PropsWithChildren) => <tbody>{children}</tbody>,
  tr: ({ children }: PropsWithChildren) => <tr>{children}</tr>,
  th: ({ children }: PropsWithChildren) => (
    <th className="px-4 py-3 font-semibold text-foreground border-b border-border">
      {children}
    </th>
  ),
  td: ({ children }: PropsWithChildren) => (
    <td className="px-4 py-3 text-foreground/80 border-b border-border/40">
      {children}
    </td>
  ),

  // Horizontal rule
  hr: () => <hr className="my-10 border-border/40" />,

  // Strong / Em
  strong: ({ children }: { children?: React.ReactNode }) => (
    <strong className="font-semibold text-foreground">{children}</strong>
  ),

  // Custom components — available in all MDX files without imports
  Callout,
};
