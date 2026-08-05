/**
 * modules/rag/session-store.js
 *
 * In-memory session store for conversation history.
 * Render is a persistent server (not serverless), so this works reliably.
 *
 * Each session stores:
 *   - history: array of { role: "user"|"assistant", text: string }
 *   - lastActivity: timestamp for TTL eviction
 *
 * Sessions auto-expire after SESSION_TTL_MS of inactivity.
 */

const SESSION_TTL_MS = 30 * 60 * 1000; // 30 minutes
const MAX_HISTORY_TURNS = 10; // keep last 10 messages per session
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000; // run cleanup every 5 minutes

const sessions = new Map();

/**
 * Get or create a session.
 * @param {string} sessionId - client-provided UUID
 * @returns {{ history: Array, lastActivity: number }}
 */
export function getSession(sessionId) {
  if (!sessions.has(sessionId)) {
    sessions.set(sessionId, {
      history: [],
      lastActivity: Date.now(),
    });
  }

  const session = sessions.get(sessionId);
  session.lastActivity = Date.now();
  return session;
}

/**
 * Add a message turn to a session's history.
 * @param {string} sessionId
 * @param {{ role: "user"|"assistant", text: string }} message
 */
export function appendToSession(sessionId, message) {
  const session = getSession(sessionId);
  session.history.push(message);

  // Trim to max history length (keep last N messages)
  if (session.history.length > MAX_HISTORY_TURNS) {
    session.history = session.history.slice(-MAX_HISTORY_TURNS);
  }

  session.lastActivity = Date.now();
}

/**
 * Get conversation history for a session.
 * @param {string} sessionId
 * @returns {Array<{ role: string, text: string }>}
 */
export function getHistory(sessionId) {
  return sessions.get(sessionId)?.history || [];
}

/**
 * Clear a session's history (e.g., user clicked "New conversation").
 * @param {string} sessionId
 */
export function clearSession(sessionId) {
  sessions.delete(sessionId);
}

/**
 * Periodically evict expired sessions to prevent memory growth.
 */
setInterval(() => {
  const now = Date.now();
  let evicted = 0;

  for (const [id, session] of sessions.entries()) {
    if (now - session.lastActivity > SESSION_TTL_MS) {
      sessions.delete(id);
      evicted++;
    }
  }

  if (evicted > 0) {
    console.log(`[session-store] Evicted ${evicted} expired sessions (${sessions.size} active)`);
  }
}, CLEANUP_INTERVAL_MS);

/**
 * Debug: get count of active sessions.
 */
export function getSessionCount() {
  return sessions.size;
}
