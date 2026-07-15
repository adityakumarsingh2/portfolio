import { Link } from "react-router-dom";
import { ArrowLeft, MessageSquare, ExternalLink } from "lucide-react";

export function ArticleFooter() {
  return (
    <div className="mt-16 pt-12 border-t border-border/40 pb-4">
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
