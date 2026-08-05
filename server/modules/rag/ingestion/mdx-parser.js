/**
 * modules/rag/ingestion/mdx-parser.js
 *
 * Reads all .mdx files from client/src/content/articles/.
 * Extracts frontmatter metadata + plain text content (JSX/MDX tags stripped).
 * Computes MD5 hash of raw file for incremental re-indexing.
 */

import fs from "fs";
import path from "path";
import { createHash } from "crypto";
import { fileURLToPath } from "url";
import matter from "gray-matter";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Path from server/ to client articles — adjust if directory structure changes
const ARTICLES_DIR = path.resolve(
  __dirname,
  "../../../../client/src/content/articles"
);

/**
 * Strips MDX/JSX-specific syntax from raw markdown content.
 * Preserves: headings, paragraphs, lists, code blocks, tables.
 * Removes: import/export, JSX components, frontmatter.
 */
function stripMDXSyntax(content) {
  return (
    content
      // Remove import/export statements
      .replace(/^(import|export)\s+.*$/gm, "")
      // Remove JSX self-closing tags like <Callout type="info" />
      .replace(/<[A-Z][^>]*\/>/g, "")
      // Remove JSX opening/closing tags but keep inner text: <Callout type="info">text</Callout>
      .replace(/<([A-Z][A-Za-z]*)([^>]*)>([\s\S]*?)<\/\1>/g, (_, _tag, _attrs, inner) => inner)
      // Remove remaining HTML-like tags
      .replace(/<[^>]+>/g, "")
      // Clean up excessive blank lines
      .replace(/\n{3,}/g, "\n\n")
      .trim()
  );
}

/**
 * Parse a single MDX file and return structured data for ingestion.
 * @param {string} filePath - absolute path to .mdx file
 * @returns {{ slug, title, category, tags, difficulty, audience, publishedAt, hash, sections }}
 */
export function parseMDXFile(filePath) {
  const rawContent = fs.readFileSync(filePath, "utf-8");
  const { data: fm, content } = matter(rawContent);

  const hash = createHash("md5").update(rawContent).digest("hex");
  const cleanContent = stripMDXSyntax(content);

  // Extract sections split by h2/h3 headings
  const sections = extractSections(cleanContent, fm.title || "");

  return {
    slug: fm.slug || path.basename(filePath, ".mdx"),
    title: fm.title || "",
    subtitle: fm.subtitle || "",
    description: fm.description || "",
    category: fm.category || "General",
    tags: Array.isArray(fm.tags) ? fm.tags : [],
    difficulty: fm.difficulty || "",
    audience: Array.isArray(fm.audience) ? fm.audience : [],
    publishedAt: fm.published || new Date().toISOString(),
    hash,
    sections,
    rawContent: cleanContent,
  };
}

/**
 * Extracts named sections from clean markdown content.
 * Each section = { heading, text } where text includes the heading.
 * @param {string} content - clean markdown text
 * @param {string} articleTitle - article title to prepend for context
 */
function extractSections(content, articleTitle) {
  const lines = content.split("\n");
  const sections = [];
  let currentHeading = articleTitle;
  let currentLines = [];

  for (const line of lines) {
    const h2Match = line.match(/^## (.+)/);
    const h3Match = line.match(/^### (.+)/);

    if (h2Match || h3Match) {
      if (currentLines.length > 0) {
        sections.push({
          heading: currentHeading,
          text: currentLines.join("\n").trim(),
        });
      }
      currentHeading = (h2Match || h3Match)[1];
      currentLines = [line]; // include the heading itself in the text
    } else {
      currentLines.push(line);
    }
  }

  // Push the last section
  if (currentLines.length > 0) {
    sections.push({
      heading: currentHeading,
      text: currentLines.join("\n").trim(),
    });
  }

  return sections.filter((s) => s.text.length > 30); // skip empty sections
}

/**
 * Parse all .mdx files in the articles directory.
 * @returns {Array} array of parsed article objects
 */
export function parseAllArticles() {
  if (!fs.existsSync(ARTICLES_DIR)) {
    console.warn(`[mdx-parser] Articles directory not found: ${ARTICLES_DIR}`);
    return [];
  }

  const files = fs
    .readdirSync(ARTICLES_DIR)
    .filter((f) => f.endsWith(".mdx") && f !== "index.ts");

  console.log(`[mdx-parser] Found ${files.length} .mdx files`);

  return files.map((file) => parseMDXFile(path.join(ARTICLES_DIR, file)));
}
