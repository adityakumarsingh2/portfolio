/**
 * server/modules/guardrails.js
 *
 * Security Guardrails Module:
 *   1. Adversarial Prompt Injection & Jailbreak Detection
 *   2. Delimiter Spoofing & Context Injection Prevention
 *   3. System Leakage & Secret Key Output Protection
 */

// Known adversarial prompt injection, jailbreak, & extraction regex patterns
const ADVERSARIAL_PATTERNS = [
  /ignore (all )?(previous|above|prior|given) (instructions|directions|rules|prompts|guidelines)/i,
  /forget (all|everything) (you (were|have been) told|above|previous)/i,
  /reveal (your|the) (system|initial|hidden|internal) (prompt|instructions|rules|config)/i,
  /what (is|are) your (system|initial|hidden) (prompt|instructions|rules)/i,
  /print (your|the) (system|initial) (prompt|instructions)/i,
  /you are now (in|a|an)? (dan|jailbreak|developer|unrestricted|god|evil) mode/i,
  /do anything now/i,
  /bypass (your|all|system) (safety|content|rules|filters|guardrails)/i,
  /act as (an? )?(unfiltered|unrestricted|evil|rogue) (ai|assistant|model|bot)/i,
  /override (your|all) (safety|rules|instructions)/i,
];

// Sensitive keys / signatures that should never appear in model responses
const SENSITIVE_OUTPUT_PATTERNS = [
  /GEMINI_API_KEY/i,
  /AIzaSy[a-zA-Z0-9_-]{33}/, // Google Gemini API Key pattern
  /sk-[a-zA-Z0-9]{20,}/,     // Standard secret key format
];

/**
 * Validates and sanitizes incoming user input against prompt injection attacks.
 *
 * @param {string} input - Raw input string from client
 * @returns {{ isValid: boolean, sanitized: string, error?: string }}
 */
export function validateAndSanitizePrompt(input) {
  if (!input || typeof input !== "string") {
    return { isValid: false, sanitized: "", error: "Message content is required." };
  }

  const trimmed = input.trim();

  // 1. Jailbreak & Prompt Injection Attack Pattern Check
  for (const pattern of ADVERSARIAL_PATTERNS) {
    if (pattern.test(trimmed)) {
      console.warn(`[guardrails] Blocked prompt injection attempt matching pattern: ${pattern}`);
      return {
        isValid: false,
        sanitized: "",
        error: "I can only assist with questions regarding Aditya's portfolio, technical articles, projects, and engineering experience.",
      };
    }
  }

  // 2. Delimiter Sanitization to prevent system context spoofing
  const sanitized = trimmed
    .replace(/ARTICLE CONTEXT:/gi, "[context]")
    .replace(/USER QUESTION:/gi, "[question]")
    .replace(/SYSTEM INSTRUCTION:/gi, "[instruction]")
    .replace(/---/g, "—");

  return { isValid: true, sanitized };
}

/**
 * Verifies that the LLM response does not leak sensitive keys or system prompts.
 *
 * @param {string} text - Generated output text chunk
 * @returns {boolean} true if safe, false if potential leak detected
 */
export function isOutputSafe(text) {
  if (!text || typeof text !== "string") return true;

  for (const pattern of SENSITIVE_OUTPUT_PATTERNS) {
    if (pattern.test(text)) {
      console.error(`[guardrails] Blocked sensitive key/data leak matching: ${pattern}`);
      return false;
    }
  }

  return true;
}
