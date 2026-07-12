import { useState, useEffect } from "react";
import { Menu, X, Download, Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes";

const navLinks = [
  { name: "About", href: "#about" },
  { name: "Skills", href: "#skills" },
  { name: "Experience", href: "#experience" },
  { name: "Projects", href: "#projects" },
  { name: "Contact", href: "#contact" },
];

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [activeSection, setActiveSection] = useState("");
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    let ticking = false;

    const sectionMeta: Array<{ id: string; top: number; bottom: number }> = [];

    const computeSectionMeta = () => {
      sectionMeta.length = 0;
      for (const link of navLinks) {
        const id = link.href.replace('#', '');
        const el = document.getElementById(id);
        if (!el) continue;
        const rect = el.getBoundingClientRect();
        const top = rect.top + window.scrollY;
        sectionMeta.push({ id, top, bottom: top + el.offsetHeight });
      }
    };

    const update = () => {
      const y = window.scrollY;
      setIsScrolled(y > 50);

      const scrollPosition = y + 100;
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

    // Defer initial layout reads to after first paint
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
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled 
          ? "bg-background/90 backdrop-blur-md border-b border-border/50 py-3" 
          : "bg-transparent py-5"
      }`}
    >
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between">
          {/* Logo - React style */}
          <a 
            href="#home" 
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="font-mono text-xl font-bold group"
          >
            <span className="text-blue-400">{"<"}</span>
            <span className="group-hover:text-primary transition-colors">Aditya</span>
            <span className="text-blue-400">{" />"}</span>
          </a>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => {
              const isActive = activeSection === link.href.replace('#', '');
              return (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={(e) => {
                    e.preventDefault();
                    const element = document.querySelector(link.href);
                    if (element) {
                      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                  }}
                  className={`transition-colors duration-300 font-medium relative group ${
                    isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {link.name}
                  <span 
                    className={`absolute -bottom-1 left-0 h-0.5 bg-primary transition-all duration-300 ${
                      isActive ? 'w-full' : 'w-0 group-hover:w-full'
                    }`} 
                  />
                </a>
              );
            })}
            
            {/* Theme Toggle */}
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2.5 rounded-full bg-secondary border border-border hover:border-primary hover:text-primary transition-all duration-300"
              aria-label="Toggle theme"
            >
              {mounted && (theme === 'dark' ? (
                <Sun className="w-4 h-4" />
              ) : (
                <Moon className="w-4 h-4" />
              ))}
            </button>
            
            <a 
              href="/AdityaResume.pdf" 
              download="Aditya_Kumar_Singh_Resume.pdf"
              className="btn-primary inline-flex items-center gap-2 text-sm py-2.5 px-5"
            >
              <Download className="w-4 h-4" />
              Resume
            </a>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-foreground"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden pt-6 pb-4 animate-fade">
            <div className="flex flex-col gap-4">
              {navLinks.map((link) => {
                const isActive = activeSection === link.href.replace('#', '');
                return (
                  <a
                    key={link.name}
                    href={link.href}
                    onClick={(e) => {
                      e.preventDefault();
                      setIsMobileMenuOpen(false);
                      const element = document.querySelector(link.href);
                      if (element) {
                        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }
                    }}
                    className={`transition-colors duration-300 font-medium text-lg py-2 ${
                      isActive ? 'text-primary' : 'text-muted-foreground hover:text-primary'
                    }`}
                  >
                    {link.name}
                  </a>
                );
              })}
              <div className="flex items-center gap-4 mt-2">
                <button
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  className="p-2.5 rounded-full bg-secondary border border-border hover:border-primary hover:text-primary transition-all duration-300"
                  aria-label="Toggle theme"
                >
                  {mounted && (theme === 'dark' ? (
                    <Sun className="w-4 h-4" />
                  ) : (
                    <Moon className="w-4 h-4" />
                  ))}
                </button>
                <a 
                  href="/AdityaResume.pdf" 
                  download="Aditya_Kumar_Singh_Resume.pdf"
                  className="btn-primary inline-flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Resume
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
