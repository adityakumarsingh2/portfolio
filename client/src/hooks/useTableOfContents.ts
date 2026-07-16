import { useEffect, useState, useRef } from "react";
import type { ComponentType } from "react";

export interface TocItem {
  id: string;
  text: string;
  level: 2 | 3;
}

/**
 * Parses article content for h2/h3 headings and tracks the active section.
 *
 * Supports two content modes:
 * - string (legacy HTML)  → DOMParser extracts headings from the HTML string
 * - ComponentType (MDX)   → IntersectionObserver scans the rendered .article-prose DOM
 *
 * The active-heading tracking (IntersectionObserver) is identical in both modes.
 */
export function useTableOfContents(content: string | ComponentType) {
  const [items, setItems] = useState<TocItem[]>([]);
  const [activeId, setActiveId] = useState<string>("");
  const observerRef = useRef<IntersectionObserver | null>(null);

  // ── 1. Extract heading items ───────────────────────────────────────────────
  useEffect(() => {
    if (typeof content === "string") {
      // Legacy HTML string path — parse headings from the HTML string itself
      const parser = new DOMParser();
      const doc = parser.parseFromString(content, "text/html");
      const headings = Array.from(doc.querySelectorAll("h2, h3"));
      const tocItems: TocItem[] = headings
        .filter((h) => h.id)
        .map((h) => ({
          id: h.id,
          text: h.textContent ?? "",
          level: parseInt(h.tagName[1]) as 2 | 3,
        }));
      setItems(tocItems);
    } else {
      // MDX path — headings are real DOM nodes (IDs set by rehype-slug after render).
      // Brief timeout allows the MDX component to mount before we query the DOM.
      const timer = setTimeout(() => {
        const container = document.querySelector(".article-prose");
        if (!container) return;
        const headings = Array.from(
          container.querySelectorAll<HTMLElement>("h2[id], h3[id]")
        );
        const tocItems: TocItem[] = headings.map((h) => ({
          id: h.id,
          // Strip the "##" / "###" prefix spans added by mdxComponents
          text: h.querySelector("span:last-child")?.textContent ?? h.textContent ?? "",
          level: parseInt(h.tagName[1]) as 2 | 3,
        }));
        setItems(tocItems);
      }, 80);
      return () => clearTimeout(timer);
    }
  }, [content]);

  // ── 2. Track active heading via IntersectionObserver ─────────────────────
  useEffect(() => {
    if (items.length === 0) return;

    observerRef.current?.disconnect();

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

        if (visible.length > 0) {
          setActiveId(visible[0].target.id);
        }
      },
      {
        rootMargin: "-80px 0px -60% 0px",
        threshold: 0,
      }
    );

    items.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observerRef.current?.observe(el);
    });

    return () => observerRef.current?.disconnect();
  }, [items]);

  return { items, activeId };
}
