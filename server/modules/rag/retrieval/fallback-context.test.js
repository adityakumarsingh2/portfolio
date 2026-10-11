import test from "node:test";
import assert from "node:assert/strict";
import { getFallbackChunksForArticle, __resetFallbackArticleCacheForTests } from "./fallback-context.js";

test("returns fallback chunk for known article slug", () => {
  __resetFallbackArticleCacheForTests();
  const chunks = getFallbackChunksForArticle("building-rag-from-scratch");

  assert.equal(Array.isArray(chunks), true);
  assert.equal(chunks.length > 0, true);
  assert.equal(chunks[0].article_slug, "building-rag-from-scratch");
  assert.equal(typeof chunks[0].text, "string");
  assert.equal(chunks[0].text.length > 0, true);
});

test("returns empty array for unknown article slug", () => {
  __resetFallbackArticleCacheForTests();
  const chunks = getFallbackChunksForArticle("unknown-non-existent-slug");
  assert.deepEqual(chunks, []);
});

