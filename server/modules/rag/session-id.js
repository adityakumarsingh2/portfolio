/**
 * modules/rag/session-id.js
 *
 * Shared session ID validation for Articles RAG routes.
 * Preferred format: UUID v4.
 * Legacy compatibility: rag-{timestamp}-{base36} IDs from older frontend clients.
 */

const UUID_V4_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const LEGACY_RAG_SESSION_ID_RE = /^rag-\d{10,}-[a-z0-9]+$/i;

export function isValidSessionId(sessionId) {
  return (
    typeof sessionId === "string" &&
    (UUID_V4_RE.test(sessionId) || LEGACY_RAG_SESSION_ID_RE.test(sessionId))
  );
}

export function redactSessionId(sessionId) {
  if (typeof sessionId !== "string" || !sessionId) return "<missing>";
  if (sessionId.length <= 12) return sessionId;
  return `${sessionId.slice(0, 8)}...${sessionId.slice(-4)}`;
}

