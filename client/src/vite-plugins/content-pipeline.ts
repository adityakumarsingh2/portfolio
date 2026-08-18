/**
 * vite-plugins/content-pipeline.ts
 * Custom Vite plugin — runs at dev, build, and HMR file changes to generate:
 *   public/rss.xml & dist/rss.xml
 *   public/sitemap.xml & dist/sitemap.xml
 *   public/robots.txt & dist/robots.txt
 *
 * Reads frontmatter from all *.mdx articles using gray-matter.
 * Single source of truth: src/content/articles/*.mdx
 */

import type { Plugin, ResolvedConfig } from "vite";
import fs from "fs";
import path from "path";
import matter from "gray-matter";
import {
  generateRssFeed,
  generateSitemap,
  generateRobots,
} from "../lib/rss/generator";
import type { ArticleFrontmatter } from "../types/content";

export function executeContentPipeline(root: string, outDir?: string) {
  const articlesDir = path.join(root, "src", "content", "articles");
  const publicDir = path.join(root, "public");

  // ── 1. Read all MDX frontmatter ─────────────────────────────────────
  let articles: ArticleFrontmatter[] = [];
  try {
    if (fs.existsSync(articlesDir)) {
      const files = fs
        .readdirSync(articlesDir)
        .filter((f) => f.endsWith(".mdx"));

      articles = files
        .map((file) => {
          const raw = fs.readFileSync(path.join(articlesDir, file), "utf-8");
          const { data } = matter(raw);
          // Derive slug from filename if not specified in frontmatter
          if (!data.slug) {
            data.slug = file.replace(/\.mdx$/, "");
          }
          return data as ArticleFrontmatter;
        })
        .filter((a) => !a.draft);
    }
  } catch (err) {
    console.warn("[content-pipeline] Could not read articles dir:", err);
  }

  const sitemapXml = generateSitemap(articles);
  const rssXml = generateRssFeed(articles);
  const robotsTxt = generateRobots();

  // Target directories to write generated files to
  const targets = [publicDir];
  if (outDir && outDir !== publicDir) {
    targets.push(outDir);
  }

  for (const target of targets) {
    if (!fs.existsSync(target)) {
      try {
        fs.mkdirSync(target, { recursive: true });
      } catch (e) {
        continue;
      }
    }

    try {
      fs.writeFileSync(path.join(target, "sitemap.xml"), sitemapXml, "utf-8");
      fs.writeFileSync(path.join(target, "rss.xml"), rssXml, "utf-8");
      fs.writeFileSync(path.join(target, "robots.txt"), robotsTxt, "utf-8");
    } catch (err) {
      console.error(`[content-pipeline] Error writing files to ${target}:`, err);
    }
  }

  console.log(
    `[content-pipeline] ✔ Content pipeline complete (${articles.length} articles processed)`
  );
}

export function contentPipelinePlugin(): Plugin {
  let config: ResolvedConfig;

  return {
    name: "content-pipeline",

    configResolved(resolvedConfig) {
      config = resolvedConfig;
    },

    buildStart() {
      const root = config.root;
      executeContentPipeline(root);
    },

    handleHotUpdate({ file }) {
      if (file.endsWith(".mdx") && file.includes("src/content/articles")) {
        console.log(`[content-pipeline] MDX article change detected (${path.basename(file)}), updating sitemap...`);
        executeContentPipeline(config.root);
      }
    },

    closeBundle() {
      const root = config.root;
      const outDir = path.resolve(root, config.build.outDir ?? "dist");
      executeContentPipeline(root, outDir);
    },
  };
}
