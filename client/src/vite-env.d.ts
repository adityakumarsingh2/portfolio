/// <reference types="vite/client" />

declare module "*.mdx" {
  import type { ComponentType } from "react";
  import type { ArticleFrontmatter } from "@/types/content";
  const Component: ComponentType;
  export default Component;
  export const frontmatter: ArticleFrontmatter;
}

