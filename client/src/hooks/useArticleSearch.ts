import { useState, useMemo } from "react";
import type { ArticleCategory, SortOption } from "@/types/article";
import { filterArticles, articles } from "@/content/articles";

export function useArticleSearch() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<ArticleCategory>("All");
  const [sort, setSort] = useState<SortOption>("newest");

  const results = useMemo(
    () => filterArticles(query, category, sort),
    [query, category, sort]
  );

  const featuredInResults = useMemo(
    () => results.find((a) => a.featured),
    [results]
  );

  const latestInResults = useMemo(
    () => results.filter((a) => !a.featured),
    [results]
  );

  const isFiltering = query.trim().length > 0 || category !== "All";
  const totalCount = articles.length;

  function reset() {
    setQuery("");
    setCategory("All");
    setSort("newest");
  }

  return {
    query,
    setQuery,
    category,
    setCategory,
    sort,
    setSort,
    results,
    featuredInResults,
    latestInResults,
    isFiltering,
    totalCount,
    reset,
  };
}
