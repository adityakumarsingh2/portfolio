import { useState, useEffect } from "react";
import { Menu, X, Download, Sun, Moon, Sparkles, BookOpen, Layers } from "lucide-react";
import { useTheme } from "next-themes";
import { Link, useLocation } from "react-router-dom";

const navLinks = [
  { name: "About", href: "#about" },
  { name: "Skills", href: "#skills" },
  { name: "Experience", href: "#experience" },
  { name: "Projects", href: "#projects" },
  { name: "Training", href: "#training" },
  { name: "Contact", href: "#contact" },
];

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [activeSection, setActiveSection] = useState("");
  const { theme, setTheme } = useTheme();
  const location = useLocation();
  const isArticlesRoute = location.pathname.startsWith("/articles");

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isArticlesRoute) return;

    let ticking = false;
    const sectionMeta: Array<{ id: string; top: number; bottom: number }> = [];

    const computeSectionMeta = () => {
      sectionMeta.length = 0;
      for (const link of navLinks) {
        const id = link.href.replace("#", "");
        const el = document.getElementById(id);
        if (!el) continue;
        const rect = el.getBoundingClientRect();
        const top = rect.top + window.scrollY;
        sectionMeta.push({ id, top, bottom: top + el.offsetHeight });
      }
    };

    const update = () => {
      const y = window.scrollY;
      setIsScrolled(y > 30);

      const scrollPosition = y + 120;
      let nextActive = "";
      for (const s of sectionMeta) {
        if (scrollPosition >= s.top && scrollPosition < s.bottom) {
          nextActive = s.id;
          break;
        }
      }
      if (y < 100) nextActive = "";
      setActiveSection(nextActive);

      ticking = false;
    };

    const handleScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    };

    const handleResize = () => {
      computeSectionMeta();
      handleScroll();
    };

    requestAnimationFrame(() => {
      computeSectionMeta();
      update();
    });

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleResize, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
    };
  }, [isArticlesRoute]);

  // Always update isScrolled even on articles routes
  useEffect(() => {
    const handleArticleScroll = () => {
      setIsScrolled(window.scrollY > 30);
    };
    window.addEventListener("scroll", handleArticleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleArticleScroll);
  }, []);

  const handleOpenRAGChat = () => {
    window.dispatchEvent(new CustomEvent("open-rag-chat"));
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-background/95 backdrop-blur-md border-b border-border/60 py-3.5 shadow-sm"
          : "bg-transparent py-5"
      }`}
    >
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="flex items-center justify-between">
          {/* Logo */}
          {isArticlesRoute ? (
            <div className="flex items-center gap-2.5">
              <Link
                to="/"
                className="font-mono text-xl font-bold group flex items-center cursor-pointer select-none"
                title="Go to Homepage"
              >
                <span className="text-purple-400">{"<"}</span>
                <span className="text-foreground group-hover:text-purple-400 transition-colors duration-200">
                  Aditya
                </span>
                <span className="text-purple-400">{" />"}</span>
              </Link>
              <span className="hidden sm:inline-flex px-2 py-0.5 text-[10px] font-mono font-bold tracking-wider uppercase rounded-md bg-purple-500/10 border border-purple-500/30 text-purple-400">
                ARTICLES
              </span>
            </div>
          ) : (
            <a
              href="#home"
              onClick={(e) => {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="font-mono text-xl font-bold group flex items-center cursor-pointer select-none"
            >
              <span className="text-purple-400">{"<"}</span>
              <span className="text-foreground group-hover:text-purple-400 transition-colors duration-200">
                Aditya
              </span>
              <span className="text-purple-400">{" />"}</span>
            </a>
          )}

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-6 xl:gap-8">
            {isArticlesRoute ? (
              <>
                <Link
                  to="/"
                  className="text-sm font-mono text-muted-foreground hover:text-foreground transition-colors duration-200 py-1"
                >
                  Home
                </Link>
                <Link
                  to="/articles"
                  className="text-sm font-mono text-foreground font-semibold relative py-1 flex items-center gap-1.5"
                >
                  <BookOpen className="w-3.5 h-3.5 text-purple-400" />
                  <span>All Articles</span>
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-400 rounded-full" />
                </Link>
                <a
                  href="/articles#latest-categories"
                  onClick={(e) => {
                    e.preventDefault();
                    if (location.pathname === "/articles") {
                      const el = document.getElementById("latest-categories");
                      if (el) {
                        const top = el.getBoundingClientRect().top + window.scrollY - 100;
                        window.scrollTo({ top, behavior: "smooth" });
                      }
                    } else {
                      window.location.href = "/articles#latest-categories";
                    }
                  }}
                  className="text-sm font-mono text-muted-foreground hover:text-foreground transition-colors duration-200 py-1 flex items-center gap-1.5 cursor-pointer"
                >
                  <Layers className="w-3.5 h-3.5 text-blue-400" />
                  <span>Categories & Series</span>
                </a>
              </>
            ) : (
              <>
                <Link
                  to="/articles"
                  className="text-sm font-mono text-muted-foreground hover:text-foreground transition-colors duration-200 relative py-1"
                >
                  Articles
                </Link>

                {navLinks.map((link) => {
                  const isActive = activeSection === link.href.replace("#", "");
                  return (
                    <a
                      key={link.name}
                      href={link.href}
                      onClick={(e) => {
                        e.preventDefault();
                        const element = document.querySelector(link.href);
                        if (element) {
                          element.scrollIntoView({ behavior: "smooth", block: "start" });
                        }
                      }}
                      className={`text-sm font-mono transition-colors duration-200 relative py-1 ${
                        isActive
                          ? "text-foreground font-semibold"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {link.name}
                      {isActive && (
                        <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-400 rounded-full" />
                      )}
                    </a>
                  );
                })}
              </>
            )}
          </div>

          {/* Right Controls */}
          <div className="hidden lg:flex items-center gap-3">
            {/* Interactive Ask AI Action Button on Articles Routes */}
            {isArticlesRoute && (
              <button
                onClick={handleOpenRAGChat}
                className="relative inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-card border-2 border-foreground hover:bg-secondary text-foreground text-xs font-mono font-bold transition-all duration-200 shadow-2xs hover:translate-y-[-1px] active:translate-y-[1px] group cursor-pointer mr-1"
                title="Ask Articles AI chatbot"
              >
                {/* Live indicator dot */}
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
                </span>

                <Sparkles className="w-3.5 h-3.5 text-amber-400 group-hover:rotate-12 transition-transform duration-200" />

                <span className="text-foreground tracking-wide font-mono">
                  <span className="text-purple-400 mr-1">{">"}</span>
                  Ask AI
                </span>
              </button>
            )}

            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2.5 rounded-xl bg-muted/50 hover:bg-muted border border-border/60 text-foreground transition-all duration-200"
              aria-label="Toggle theme"
              title="Switch theme"
            >
              {mounted &&
                (theme === "dark" ? (
                  <Sun className="w-4 h-4 text-amber-400" />
                ) : (
                  <Moon className="w-4 h-4 text-blue-500" />
                ))}
            </button>

            <a
              href="/AdityaResume.pdf"
              download="Aditya_Kumar_Singh_Resume.pdf"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-foreground text-background font-mono text-xs font-bold hover:bg-foreground/90 transition-all duration-200 shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Resume</span>
            </a>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 lg:hidden">
            {isArticlesRoute && (
              <button
                onClick={handleOpenRAGChat}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-purple-500/10 border border-purple-500/30 text-foreground font-mono text-xs font-bold mr-1"
              >
                <Sparkles className="w-3 h-3 text-amber-400 animate-pulse" />
                <span>AI</span>
              </button>
            )}

            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2 rounded-xl bg-muted/50 hover:bg-muted border border-border/60 text-foreground transition-all duration-200"
              aria-label="Toggle theme"
            >
              {mounted &&
                (theme === "dark" ? (
                  <Sun className="w-4 h-4 text-amber-400" />
                ) : (
                  <Moon className="w-4 h-4 text-blue-500" />
                ))}
            </button>

            <button
              className="p-2 rounded-xl bg-muted/50 hover:bg-muted border border-border/60 text-foreground"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="lg:hidden mt-4 pt-4 pb-6 border-t border-border/60 animate-fade">
            <div className="flex flex-col gap-2.5">
              {isArticlesRoute ? (
                <>
                  <Link
                    to="/"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-base font-mono py-1.5 px-3 rounded-lg text-muted-foreground hover:text-foreground"
                  >
                    Home
                  </Link>
                  <Link
                    to="/articles"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-base font-mono py-1.5 px-3 rounded-lg text-purple-400 font-semibold bg-muted/50 flex items-center gap-2"
                  >
                    <BookOpen className="w-4 h-4" />
                    <span>All Articles</span>
                  </Link>
                  <a
                    href="/articles#latest-categories"
                    onClick={(e) => {
                      e.preventDefault();
                      setIsMobileMenuOpen(false);
                      if (location.pathname === "/articles") {
                        const el = document.getElementById("latest-categories");
                        if (el) {
                          const top = el.getBoundingClientRect().top + window.scrollY - 100;
                          window.scrollTo({ top, behavior: "smooth" });
                        }
                      } else {
                        window.location.href = "/articles#latest-categories";
                      }
                    }}
                    className="text-base font-mono py-1.5 px-3 rounded-lg text-muted-foreground hover:text-foreground flex items-center gap-2"
                  >
                    <Layers className="w-4 h-4 text-blue-400" />
                    <span>Categories & Series</span>
                  </a>
                </>
              ) : (
                <>
                  <Link
                    to="/articles"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-base font-mono py-1.5 px-3 rounded-lg text-muted-foreground hover:text-foreground"
                  >
                    Articles
                  </Link>

                  {navLinks.map((link) => {
                    const isActive = activeSection === link.href.replace("#", "");
                    return (
                      <a
                        key={link.name}
                        href={link.href}
                        onClick={(e) => {
                          e.preventDefault();
                          setIsMobileMenuOpen(false);
                          const element = document.querySelector(link.href);
                          if (element) {
                            element.scrollIntoView({ behavior: "smooth", block: "start" });
                          }
                        }}
                        className={`text-base font-mono py-1.5 px-3 rounded-lg ${
                          isActive
                            ? "text-purple-400 font-semibold bg-muted/50"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {link.name}
                      </a>
                    );
                  })}
                </>
              )}

              <div className="mt-4 pt-4 border-t border-border/40">
                <a
                  href="/AdityaResume.pdf"
                  download="Aditya_Kumar_Singh_Resume.pdf"
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-foreground text-background font-mono text-xs font-bold"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Resume</span>
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
