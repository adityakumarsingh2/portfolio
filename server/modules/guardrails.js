/**
 * server/modules/guardrails.js
 *
 * Security Guardrails Module:
 *   1. Adversarial Prompt Injection & Jailbreak Detection
 *   2. Delimiter Spoofing & Context Injection Prevention
 *
 * NOTE: Output leak checking (isOutputSafe) was removed because it was never
 * wired into any streaming code path and gave a false sense of security.
 * If needed in the future, wire it into the chunk loop in generator.js.
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
      console.warn(`[guardrails] Blocked prompt injection attempt`);
      return {
        isValid: false,
        sanitized: "",
        error: "I can only assist with questions regarding Aditya's portfolio, technical articles, projects, and engineering experience.",
      };
    }
  }

  // 2. Delimiter Sanitization — prevents system context spoofing by stripping
  // known delimiters that could confuse the LLM into treating user content as
  // system instructions or article context markers.
  const sanitized = trimmed
    .replace(/ARTICLE CONTEXT:/gi, "[context]")
    .replace(/USER QUESTION:/gi, "[question]")
    .replace(/SYSTEM INSTRUCTION:/gi, "[instruction]")
    .replace(/---/g, "\u2014");

  return { isValid: true, sanitized };
}
