import { Link } from "react-router-dom";
import { ArrowLeft, Sparkles, ExternalLink, BookOpen, CheckCircle2, HelpCircle, Cpu } from "lucide-react";

export function ArticleFooter() {
  const triggerAI = (query: string) => {
    window.dispatchEvent(
      new CustomEvent("open-rag-chat", {
        detail: { query },
      })
    );
  };

  const AI_PROMPTS = [
    { label: "Summarize this article", icon: BookOpen, query: "Summarize this article" },
    { label: "List key learnings & takeaways", icon: CheckCircle2, query: "List key learnings & takeaways" },
    { label: "What problem does this solve?", icon: HelpCircle, query: "What core problem does this article solve?" },
    { label: "Explain technical architecture", icon: Cpu, query: "Explain the technical architecture" },
  ];

  return (
    <div className="mt-16 pt-12 border-t border-border/40 pb-4">
      {/* ── AI ASSISTANT PROMPT BAR ───────────────────────────────────────── */}
      <div className="mb-12 p-5 rounded-2xl bg-card border-2 border-foreground shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 rounded-lg bg-secondary border border-foreground flex items-center justify-center text-foreground shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-yellow-500 animate-pulse" />
          </div>
          <div>
            <h4 className="text-sm font-bold font-mono text-foreground">Ask Articles AI About This Article</h4>
            <p className="text-xs text-muted-foreground font-mono">Click a quick prompt to instantly analyze this article with AI</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4">
          {AI_PROMPTS.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.label}
                type="button"
                onClick={() => triggerAI(item.query)}
                className="flex items-center gap-2 text-xs font-mono text-left px-3.5 py-2.5 rounded-xl border border-foreground/60 bg-secondary/60 hover:bg-secondary hover:border-foreground hover:translate-y-[-1px] transition-all duration-200 shadow-2xs active:translate-y-[1px] text-foreground cursor-pointer group"
              >
                <Icon className="w-3.5 h-3.5 text-blue-400 flex-shrink-0 group-hover:scale-110 transition-transform" />
                <span className="flex-1 font-semibold">{item.label}</span>
                <span className="text-blue-400 opacity-60 group-hover:opacity-100">{">"}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="font-mono text-xs text-primary/60 mb-6 uppercase tracking-widest">
        {"// end of article"}
      </div>
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h3 className="text-lg font-display font-semibold mb-2">Thanks for reading.</h3>
          <p className="text-sm text-muted-foreground flex flex-wrap items-center gap-2">
            Found something inaccurate?
            <a 
              href="mailto:contact@adityakumarsingh.com?subject=Article%20Feedback" 
              className="text-primary hover:underline underline-offset-4 inline-flex items-center gap-1"
            >
              Suggest an edit <ExternalLink className="w-3 h-3" />
            </a>
          </p>
        </div>
        
        <Link
          to="/articles"
          className="inline-flex items-center justify-center gap-2 font-mono text-sm px-5 py-2.5 rounded-lg border border-border/40 bg-card/50 hover:bg-muted/50 hover:border-primary/30 transition-all text-muted-foreground hover:text-foreground shrink-0"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Knowledge Base
        </Link>
      </div>
    </div>
  );
}
