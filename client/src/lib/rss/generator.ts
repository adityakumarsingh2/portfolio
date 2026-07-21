/**
 * lib/rss/generator.ts
 * Generates a valid RSS 2.0 feed from article frontmatter.
 * Called by the content-pipeline Vite plugin at build time.
 * Future CMS adapters only need to supply the same ArticleFrontmatter shape.
 */

import type { ArticleFrontmatter } from "@/types/content";

const SITE_URL = "https://adityakumarsingh.tech";
const AUTHOR_NAME = "Aditya Kumar Singh";
const AUTHOR_EMAIL = "adityakumarsingh909@outlook.com";

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function rfc822(isoDate: string): string {
  return new Date(isoDate).toUTCString();
}

export function generateRssFeed(articles: ArticleFrontmatter[]): string {
  const published = articles
    .filter((a) => !a.draft)
    .sort(
      (a, b) =>
        new Date(b.published).getTime() - new Date(a.published).getTime()
    );

  const lastBuildDate = published[0]
    ? rfc822(published[0].published)
    : new Date().toUTCString();

  const items = published
    .map((a) => {
      const url = `${SITE_URL}/articles/${a.slug}`;
      const image = a.coverImage
        ? `${SITE_URL}${a.coverImage}`
        : `${SITE_URL}/og-image.png`;
      return `
    <item>
      <title>${escapeXml(a.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <description>${escapeXml(a.description)}</description>
      <pubDate>${rfc822(a.published)}</pubDate>
      <author>${escapeXml(AUTHOR_EMAIL)} (${escapeXml(AUTHOR_NAME)})</author>
      <category>${escapeXml(a.category)}</category>
      ${a.tags?.map((t) => `<category>${escapeXml(t)}</category>`).join("\n      ") ?? ""}
      <enclosure url="${image}" type="image/png" length="0"/>
    </item>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
  xmlns:atom="http://www.w3.org/2005/Atom"
  xmlns:content="http://purl.org/rss/1.0/modules/content/"
  xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>${escapeXml(AUTHOR_NAME)} — Engineering Knowledge Base</title>
    <link>${SITE_URL}</link>
    <description>Engineering articles, AI research, system design, and full-stack development by ${escapeXml(AUTHOR_NAME)}.</description>
    <language>en-us</language>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
    <managingEditor>${escapeXml(AUTHOR_EMAIL)} (${escapeXml(AUTHOR_NAME)})</managingEditor>
    <webMaster>${escapeXml(AUTHOR_EMAIL)} (${escapeXml(AUTHOR_NAME)})</webMaster>
    <atom:link href="${SITE_URL}/rss.xml" rel="self" type="application/rss+xml"/>
    <image>
      <url>${SITE_URL}/og-image.png</url>
      <title>${escapeXml(AUTHOR_NAME)}</title>
      <link>${SITE_URL}</link>
    </image>
${items}
  </channel>
</rss>`;
}

export function generateSitemap(articles: ArticleFrontmatter[]): string {
  const published = articles.filter((a) => !a.draft);

  // Derive unique categories and series from articles
  const categories = [...new Set(published.map((a) => a.category))];
  const series = [
    ...new Set(published.filter((a) => a.series).map((a) => a.series!)),
  ];

  const categorySlug = (cat: string) =>
    cat.toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]/g, "");

  const seriesSlug = (s: string) =>
    s.toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]/g, "");

  const articleEntries = published
    .map((a) => {
      const lastmod = a.updated || a.published;
      return `
  <url>
    <loc>${SITE_URL}/articles/${a.slug}</loc>
    <lastmod>${lastmod.split("T")[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`;
    })
    .join("");

  const categoryEntries = categories
    .map(
      (cat) => `
  <url>
    <loc>${SITE_URL}/articles/category/${categorySlug(cat)}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`
    )
    .join("");

  const seriesEntries = series
    .map(
      (s) => `
  <url>
    <loc>${SITE_URL}/articles/series/${seriesSlug(s)}</loc>
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

export function generateRobots(): string {
  return `User-agent: *
Allow: /
Disallow: /api/

Sitemap: ${SITE_URL}/sitemap.xml
`;
}
