import type { TocItem } from "@/hooks/useTableOfContents";

interface TableOfContentsProps {
  items: TocItem[];
  activeId: string;
}

export function TableOfContents({ items, activeId }: TableOfContentsProps) {
  if (items.length === 0) return null;

  const handleClick = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - 96;
    window.scrollTo({ top, behavior: "smooth" });
  };

  return (
    <aside className="hidden xl:block sticky top-24 self-start w-64 shrink-0">
      <div className="card-elegant p-5">
        <div className="flex items-center gap-2 mb-4">
          <span className="font-mono text-xs text-primary/60">{"// "}</span>
          <span className="font-mono text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            On this page
          </span>
        </div>

        <nav aria-label="Table of contents">
          <ul className="space-y-0.5">
            {items.map((item) => {
              const isActive = activeId === item.id;
              return (
                <li key={item.id}>
                  <button
                    onClick={() => handleClick(item.id)}
                    className={`w-full text-left text-sm transition-all duration-200 rounded-lg px-3 py-1.5 ${
                      item.level === 3 ? "pl-6" : ""
                    } ${
                      isActive
                        ? "text-primary font-medium bg-primary/8"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                    }`}
                  >
                    {isActive && (
                      <span
                        className="inline-block w-1 h-1 rounded-full mr-2 mb-0.5"
                        style={{ background: "var(--gradient-warm)" }}
                      />
                    )}
                    {item.text}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </aside>
  );
}
