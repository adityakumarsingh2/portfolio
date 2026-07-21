import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import mdx from "@mdx-js/rollup";
import remarkFrontmatter from "remark-frontmatter";
import remarkMdxFrontmatter from "remark-mdx-frontmatter";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import path from "path";
import { contentPipelinePlugin } from "./src/vite-plugins/content-pipeline";

export default defineConfig({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    // MDX must be processed BEFORE the React plugin
    {
      enforce: "pre",
      ...mdx({
        // Parse YAML frontmatter blocks
        remarkPlugins: [remarkFrontmatter, remarkMdxFrontmatter, remarkGfm],
        // Auto-generate heading IDs from text (rehype-slug)
        rehypePlugins: [rehypeSlug],
        // Use React JSX runtime
        jsxImportSource: "react",
        // Tell MDX to use our MDXProvider to resolve custom components
        providerImportSource: "@mdx-js/react",
      }),

    },
    react(),
    // Generates rss.xml / sitemap.xml / robots.txt at build time
    contentPipelinePlugin(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
