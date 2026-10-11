import test from "node:test";
import assert from "node:assert/strict";
import { isValidSessionId } from "./session-id.js";

test("accepts UUID v4 session IDs", () => {
  assert.equal(isValidSessionId("0a1244ce-a2f8-4d74-a1a2-3a2a1d4a8f9f"), true);
});

test("accepts legacy rag session IDs", () => {
  assert.equal(isValidSessionId("rag-1791694562928-vrjgwgo0ucq"), true);
});

test("rejects malformed session IDs", () => {
  assert.equal(isValidSessionId("rag-invalid"), false);
  assert.equal(isValidSessionId("not-a-session-id"), false);
  assert.equal(isValidSessionId("../../etc/passwd"), false);
});

