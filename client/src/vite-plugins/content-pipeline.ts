/**
 * vite-plugins/content-pipeline.ts
 * Custom Vite plugin — runs at build time to generate:
 *   dist/rss.xml
 *   dist/sitemap.xml
 *   dist/robots.txt
 *
 * Reads frontmatter from all *.mdx articles using gray-matter
 * (no React, no bundling required — pure Node.js).
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

export function contentPipelinePlugin(): Plugin {
  let config: ResolvedConfig;

  return {
    name: "content-pipeline",

    // Only run during production builds (not dev server)
    apply: "build",

    configResolved(resolvedConfig) {
      config = resolvedConfig;
    },

    closeBundle() {
      const root = config.root; // client/
      const outDir = path.resolve(root, config.build.outDir ?? "dist");
      const articlesDir = path.join(root, "src", "content", "articles");

      // ── 1. Read all MDX frontmatter ─────────────────────────────────────
      let articles: ArticleFrontmatter[] = [];
      try {
        const files = fs
          .readdirSync(articlesDir)
          .filter((f) => f.endsWith(".mdx"));

        articles = files
          .map((file) => {
            const raw = fs.readFileSync(path.join(articlesDir, file), "utf-8");
            const { data } = matter(raw);
            // Derive slug from filename if not in frontmatter
            if (!data.slug) {
              data.slug = file.replace(/\.mdx$/, "");
            }
            return data as ArticleFrontmatter;
          })
          .filter((a) => !a.draft);
      } catch (err) {
        console.warn("[content-pipeline] Could not read articles dir:", err);
      }

      // ── 2. Ensure output directory exists ───────────────────────────────
      if (!fs.existsSync(outDir)) {
        console.warn(`[content-pipeline] Output dir ${outDir} not found, skipping.`);
        return;
      }

      // ── 3. Write RSS ─────────────────────────────────────────────────────
      try {
        fs.writeFileSync(
          path.join(outDir, "rss.xml"),
          generateRssFeed(articles),
          "utf-8"
        );
        console.log("[content-pipeline] ✔ rss.xml generated");
      } catch (err) {
        console.error("[content-pipeline] Failed to write rss.xml:", err);
      }

      // ── 4. Write Sitemap ─────────────────────────────────────────────────
      try {
        fs.writeFileSync(
          path.join(outDir, "sitemap.xml"),
          generateSitemap(articles),
          "utf-8"
        );
        console.log("[content-pipeline] ✔ sitemap.xml generated");
      } catch (err) {
        console.error("[content-pipeline] Failed to write sitemap.xml:", err);
      }

      // ── 5. Write robots.txt ──────────────────────────────────────────────
      try {
        fs.writeFileSync(
          path.join(outDir, "robots.txt"),
          generateRobots(),
          "utf-8"
        );
        console.log("[content-pipeline] ✔ robots.txt generated");
      } catch (err) {
        console.error("[content-pipeline] Failed to write robots.txt:", err);
      }

      console.log(
        `[content-pipeline] ✔ Content pipeline complete (${articles.length} articles processed)`
      );
    },
  };
}
