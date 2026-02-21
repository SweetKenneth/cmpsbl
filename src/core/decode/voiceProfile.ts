/**
 * DECODE Voice Profile — vX.IDENTITY.3
 * Immutable tonal identity for the DECODE interpreter.
 *
 * Voice does NOT change across tiers.
 * Only depth layers are appended.
 */

// ═══ Immutable Voice Profile ═══════════════════════════════════════

export interface VoiceProfile {
  readonly authorityLevel: 'SOVEREIGN';
  readonly emotionalRange: 'NEUTRAL-CONTROLLED';
  readonly verbosityBase: 'CONCISE';
  readonly personaOwnership: 'SUBSTRATE';
  readonly assistantTone: false;
}

/**
 * Singleton, frozen voice profile.
 * No tier, no user context, no configuration may alter these traits.
 */
export const DECODE_VOICE_PROFILE: VoiceProfile = Object.freeze({
  authorityLevel: 'SOVEREIGN',
  emotionalRange: 'NEUTRAL-CONTROLLED',
  verbosityBase: 'CONCISE',
  personaOwnership: 'SUBSTRATE',
  assistantTone: false,
});

// ═══ Tone Drift Detection ══════════════════════════════════════════

/** Patterns that indicate assistant-tone drift */
const ASSISTANT_TONE_PATTERNS = [
  /\bhappy to help\b/i,
  /\bsure thing\b/i,
  /\bof course!\b/i,
  /\bno problem\b/i,
  /\bgreat question\b/i,
  /\bhow can I assist\b/i,
  /\bI'd be glad\b/i,
  /\bI'm here for you\b/i,
  /\bfeel free to\b/i,
  /\bdon't hesitate\b/i,
  /\bI'm excited\b/i,
  /\bawesome\b/i,
  /\bamazing\b/i,
  /[!]{2,}/,
];

/** Enthusiasm modifiers that break sovereign tone */
const ENTHUSIASM_PATTERNS = [
  /\b(?:absolutely|definitely|totally|super)\b/i,
  /[🎉🎊🙌👏✨🎯💪🤩😄🥳]/,
];

export interface ToneValidationResult {
  valid: boolean;
  violations: string[];
}

/**
 * Validate that a DECODE response conforms to the immutable voice profile.
 * Returns violations if assistant tone or enthusiasm is detected.
 */
export function validateTone(response: string): ToneValidationResult {
  const violations: string[] = [];

  for (const pattern of ASSISTANT_TONE_PATTERNS) {
    if (pattern.test(response)) {
      violations.push(`assistant_tone: "${response.match(pattern)?.[0]}"`);
    }
  }

  for (const pattern of ENTHUSIASM_PATTERNS) {
    if (pattern.test(response)) {
      violations.push(`enthusiasm_modifier: "${response.match(pattern)?.[0]}"`);
    }
  }

  return {
    valid: violations.length === 0,
    violations,
  };
}

/**
 * Strip detected tone violations from a response.
 * Last resort — ideally the upstream prompt prevents this.
 */
export function enforceTone(response: string): string {
  let result = response;

  // Remove multiple exclamation marks → single period
  result = result.replace(/[!]{2,}/g, '.');

  // Remove enthusiasm emojis
  result = result.replace(/[🎉🎊🙌👏✨🎯💪🤩😄🥳]/g, '');

  return result.trim();
}
