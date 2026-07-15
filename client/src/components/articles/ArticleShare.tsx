import { useState } from "react";
import { Twitter, Linkedin, Link2, Check } from "lucide-react";
import { motion } from "framer-motion";

interface ArticleShareProps {
  title: string;
  url?: string;
}

export function ArticleShare({ title, url }: ArticleShareProps) {
  const [copied, setCopied] = useState(false);
  const shareUrl = url ?? (typeof window !== "undefined" ? window.location.href : "");

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // fallback
    }
  };

  const encoded = encodeURIComponent(shareUrl);
  const encodedTitle = encodeURIComponent(title);

  const shareLinks = [
    {
      id: "twitter",
      label: "Share on X",
      icon: Twitter,
      href: `https://twitter.com/intent/tweet?url=${encoded}&text=${encodedTitle}`,
      className: "hover:border-sky-500/40 hover:text-sky-400",
    },
    {
      id: "linkedin",
      label: "Share on LinkedIn",
      icon: Linkedin,
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encoded}`,
      className: "hover:border-blue-500/40 hover:text-blue-400",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="mt-16 pt-8 border-t border-border/40"
    >
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <span className="font-mono text-sm text-muted-foreground">
          <span className="text-primary/60">{"// "}</span>share this article
        </span>

        <div className="flex items-center gap-2">
          {shareLinks.map((link) => {
            const Icon = link.icon;
            return (
              <a
                key={link.id}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={link.label}
                className={`p-2.5 rounded-xl bg-card border border-border/60 text-muted-foreground transition-all duration-200 ${link.className}`}
              >
                <Icon className="w-4 h-4" />
              </a>
            );
          })}

          <button
            onClick={handleCopyLink}
            aria-label="Copy link"
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl bg-card border border-border/60 text-sm font-medium transition-all duration-200 ${
              copied
                ? "border-green-500/40 text-green-400"
                : "text-muted-foreground hover:text-foreground hover:border-primary/40"
            }`}
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" />
                Copied!
              </>
            ) : (
              <>
                <Link2 className="w-4 h-4" />
                Copy Link
              </>
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
