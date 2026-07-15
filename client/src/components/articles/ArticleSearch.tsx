import { useRef, useEffect, useState } from "react";
import { Search, X, Clock, TrendingUp } from "lucide-react";
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
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  
  const popularSearches = ["RAG", "System Design", "React", "TypeScript", "API Design"];

  // Load recent searches
  useEffect(() => {
    const saved = localStorage.getItem("recent_article_searches");
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved).slice(0, 3));
      } catch (e) {
        // Ignore
      }
    }
  }, []);

  const saveRecentSearch = (search: string) => {
    if (!search.trim()) return;
    const updated = [search, ...recentSearches.filter(s => s !== search)].slice(0, 3);
    setRecentSearches(updated);
    localStorage.setItem("recent_article_searches", JSON.stringify(updated));
  };

  const handleSelectSearch = (term: string) => {
    onChange(term);
    saveRecentSearch(term);
    setIsFocused(false);
    inputRef.current?.blur();
  };


  // Keyboard shortcut: / to focus
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "/" && document.activeElement !== inputRef.current) {
        e.preventDefault();
        inputRef.current?.focus();
      }
      if (e.key === "Escape") {
        onChange("");
        setIsFocused(false);
        inputRef.current?.blur();
      }
      if (e.key === "Enter" && document.activeElement === inputRef.current) {
        saveRecentSearch(value);
        setIsFocused(false);
        inputRef.current?.blur();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onChange, value, recentSearches]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative group z-50">
      <Search className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors duration-200 ${isFocused ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground/70'}`} />

      <input
        ref={inputRef}
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setIsFocused(true)}
        placeholder={placeholder}
        className={`w-full h-14 pl-12 pr-24 bg-card/90 border text-foreground placeholder:text-muted-foreground focus:outline-none transition-all duration-300 text-base font-sans backdrop-blur-xl ${
          isFocused ? 'rounded-t-2xl rounded-b-none border-primary/50 shadow-[0_0_30px_hsl(var(--primary)/0.1)]' : 'rounded-2xl border-border/60 hover:border-border'
        }`}
        aria-label="Search articles"
        id="article-search"
        autoComplete="off"
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
        {!value && !isFocused && (
          <kbd className="hidden sm:flex items-center gap-1 px-2 py-1 rounded-md bg-muted/50 border border-border/40 font-mono text-xs text-muted-foreground">
            /
          </kbd>
        )}
      </div>

      {/* Dropdown Panel */}
      <AnimatePresence>
        {isFocused && !value && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 right-0 bg-card/95 backdrop-blur-xl border border-t-0 border-primary/30 rounded-b-2xl shadow-[0_20px_40px_hsl(var(--primary)/0.1)] overflow-hidden"
          >
            <div className="p-2">
              {/* Recent Searches */}
              {recentSearches.length > 0 && (
                <div className="mb-2">
                  <div className="px-3 py-2 text-xs font-mono text-muted-foreground uppercase tracking-wider">
                    Recent
                  </div>
                  {recentSearches.map((term) => (
                    <button
                      key={`recent-${term}`}
                      onClick={() => handleSelectSearch(term)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-foreground/80 hover:text-foreground hover:bg-muted/50 rounded-lg transition-colors text-left"
                    >
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      {term}
                    </button>
                  ))}
                </div>
              )}

              {/* Popular Searches */}
              <div>
                <div className="px-3 py-2 text-xs font-mono text-muted-foreground uppercase tracking-wider">
                  Popular
                </div>
                {popularSearches.map((term) => (
                  <button
                    key={`popular-${term}`}
                    onClick={() => handleSelectSearch(term)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-foreground/80 hover:text-foreground hover:bg-muted/50 rounded-lg transition-colors text-left"
                  >
                    <TrendingUp className="w-4 h-4 text-muted-foreground" />
                    {term}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
