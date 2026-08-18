/**
 * client/scripts/generate-sitemap.js
 * Standalone Node.js script to generate sitemap.xml, rss.xml, and robots.txt
 * from article frontmatter in src/content/articles/*.mdx.
 *
 * Usage: node scripts/generate-sitemap.js
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import matter from "gray-matter";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SITE_URL = "https://adityakumarsingh.tech";
const AUTHOR_NAME = "Aditya Kumar Singh";
const AUTHOR_EMAIL = "adityakumarsingh909@outlook.com";

function slugify(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function generateSitemap(articles) {
  const published = articles.filter((a) => !a.draft);

  const categories = [...new Set(published.map((a) => a.category))];
  const series = [
    ...new Set(published.filter((a) => a.series).map((a) => a.series)),
  ];

  const articleEntries = published
    .map((a) => {
      const lastmod = (a.updated || a.published || "").split("T")[0];
      return `
  <url>
    <loc>${SITE_URL}/articles/${a.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`;
    })
    .join("");

  const categoryEntries = categories
    .map(
      (cat) => `
  <url>
    <loc>${SITE_URL}/articles/category/${slugify(cat)}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`
    )
    .join("");

  const seriesEntries = series
    .map(
      (s) => `
  <url>
    <loc>${SITE_URL}/articles/series/${slugify(s)}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`
    )
    .join("");

  const today = new Date().toISOString().split("T")[0];

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">

  <url>
    <loc>${SITE_URL}/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>1.0</priority>
  </url>

  <url>
    <loc>${SITE_URL}/articles</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
${articleEntries}
${categoryEntries}
${seriesEntries}
</urlset>`;
}

function main() {
  const rootDir = path.resolve(__dirname, "..");
  const articlesDir = path.join(rootDir, "src", "content", "articles");
  const publicDir = path.join(rootDir, "public");
  const distDir = path.join(rootDir, "dist");

  if (!fs.existsSync(articlesDir)) {
    console.error(`[generate-sitemap] Articles directory not found at ${articlesDir}`);
    process.exit(1);
  }

  const files = fs.readdirSync(articlesDir).filter((f) => f.endsWith(".mdx"));
  const articles = files
    .map((file) => {
      const raw = fs.readFileSync(path.join(articlesDir, file), "utf-8");
      const { data } = matter(raw);
      if (!data.slug) {
        data.slug = file.replace(/\.mdx$/, "");
      }
      return data;
    })
    .filter((a) => !a.draft);

  const xmlContent = generateSitemap(articles);

  const targets = [publicDir];
  if (fs.existsSync(distDir)) {
    targets.push(distDir);
  }

  for (const target of targets) {
    if (!fs.existsSync(target)) {
      fs.mkdirSync(target, { recursive: true });
    }
    fs.writeFileSync(path.join(target, "sitemap.xml"), xmlContent, "utf-8");
    console.log(`[generate-sitemap] ✔ Wrote sitemap.xml to ${target}`);
  }

  console.log(`[generate-sitemap] Successfully processed ${articles.length} articles.`);
}

main();
