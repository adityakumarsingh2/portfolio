import { useRef, useEffect } from "react";
import { Search, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ArticleSearchProps {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}

export function ArticleSearch({
  value,
  onChange,
  placeholder = "Search articles, topics, technologies…",
}: ArticleSearchProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut: / to focus
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "/" && document.activeElement !== inputRef.current) {
        e.preventDefault();
        inputRef.current?.focus();
      }
      if (e.key === "Escape") {
        onChange("");
        inputRef.current?.blur();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onChange]);

  return (
    <div className="relative group">
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground transition-colors duration-200 group-focus-within:text-primary" />

      <input
        ref={inputRef}
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full h-14 pl-12 pr-24 rounded-2xl bg-card/80 border border-border/60 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/60 transition-all duration-300 text-base font-sans backdrop-blur-sm"
        aria-label="Search articles"
        id="article-search"
      />

      {/* Right side */}
      <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
        <AnimatePresence>
          {value && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.15 }}
              onClick={() => {
                onChange("");
                inputRef.current?.focus();
              }}
              className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </motion.button>
          )}
        </AnimatePresence>
        {!value && (
          <kbd className="hidden sm:flex items-center gap-1 px-2 py-1 rounded-md bg-muted/50 border border-border/40 font-mono text-xs text-muted-foreground">
            /
          </kbd>
        )}
      </div>
    </div>
  );
}
