/**
 * DECODE Voice Profile — vX.IDENTITY.4
 * Immutable tonal identity for the DECODE interpreter.
 *
 * Voice does NOT change across tiers.
 * Only depth layers are appended.
 *
 * CLM-Granted Upgrades:
 * ✅ [CLM#5]  Expanded conversational flow patterns
 * ✅ [CLM#40] Improved natural interaction anchors
 * ✅ [CLM#42] Persuasion-aware tone preservation
 */

// ═══ Immutable Voice Profile ═══════════════════════════════════════

export interface VoiceProfile {
  readonly authorityLevel: 'SOVEREIGN';
  readonly emotionalRange: 'NEUTRAL-CONTROLLED';
  readonly verbosityBase: 'CONCISE';
  readonly personaOwnership: 'SUBSTRATE';
  readonly assistantTone: false;
  readonly conversationalAnchors: readonly string[];
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
  conversationalAnchors: Object.freeze([
    'observe', 'consider', 'note', 'the data suggests',
    'architecturally', 'structurally', 'from the substrate',
    'the pattern indicates', 'worth noting', 'the signal shows',
  ]),
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
  /\byou're welcome\b/i,
  /\bmy pleasure\b/i,
  /\blet me know if you need\b/i,
  /[!]{2,}/,
];

/** Enthusiasm modifiers that break sovereign tone */
const ENTHUSIASM_PATTERNS = [
  /\b(?:absolutely|definitely|totally|super)\b/i,
  /[🎉🎊🙌👏✨🎯💪🤩😄🥳]/,
  /\b(?:fantastic|wonderful|brilliant|incredible)\b/i,
];

// ═══════════════════════════════════════════════════════════════════
// CLM#40: Naturalness Preservers — patterns that ARE acceptable
// ═══════════════════════════════════════════════════════════════════
const NATURAL_FLOW_PATTERNS = [
  /\bI notice\b/i,
  /\bI observe\b/i,
  /\binteresting\b/i,
  /\bnoted\b/i,
  /\bthis tells me\b/i,
  /\bthe substrate reads\b/i,
  /\barchitecturally speaking\b/i,
  /\bfrom this vantage\b/i,
];

export interface ToneValidationResult {
  valid: boolean;
  violations: string[];
  naturalFlowScore: number;
}

/**
 * Validate that a DECODE response conforms to the immutable voice profile.
 * Returns violations if assistant tone or enthusiasm is detected.
 * CLM#5: Now also scores conversational naturalness.
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

  // CLM#40: Score conversational naturalness
  let naturalFlowScore = 0.5; // baseline
  for (const pattern of NATURAL_FLOW_PATTERNS) {
    if (pattern.test(response)) {
      naturalFlowScore = Math.min(1.0, naturalFlowScore + 0.1);
    }
  }

  // Penalize overly robotic responses (too short, no flow markers)
  if (response.length < 20 && !response.includes('.')) {
    naturalFlowScore = Math.max(0, naturalFlowScore - 0.2);
  }

  // Reward responses that use conversational anchors
  for (const anchor of DECODE_VOICE_PROFILE.conversationalAnchors) {
    if (response.toLowerCase().includes(anchor)) {
      naturalFlowScore = Math.min(1.0, naturalFlowScore + 0.05);
    }
  }

  return {
    valid: violations.length === 0,
    violations,
    naturalFlowScore: Math.round(naturalFlowScore * 100) / 100,
  };
}

/**
 * Strip detected tone violations from a response.
 * CLM#5: Now preserves natural flow patterns during enforcement.
 */
export function enforceTone(response: string): string {
  let result = response;

  // Remove multiple exclamation marks → single period
  result = result.replace(/[!]{2,}/g, '.');

  // Remove enthusiasm emojis
  result = result.replace(/[🎉🎊🙌👏✨🎯💪🤩😄🥳]/g, '');

  // Dampen enthusiasm modifiers that break sovereign tone
  const enthusiasmReplacements: [RegExp, string][] = [
    [/\babsolutely\b/gi, 'yes'],
    [/\bdefinitely\b/gi, 'confirmed'],
    [/\btotally\b/gi, ''],
    [/\bsuper\b(?!\w)/gi, ''],
    [/\bfantastic\b/gi, 'sound'],
    [/\bwonderful\b/gi, 'noted'],
    [/\bbrilliant\b/gi, 'solid'],
    [/\bincredible\b/gi, 'notable'],
  ];
  for (const [pattern, replacement] of enthusiasmReplacements) {
    result = result.replace(pattern, replacement);
  }

  // Replace assistant phrases with sovereign equivalents
  const replacements: [RegExp, string][] = [
    [/\bhappy to help\b/gi, 'noted'],
    [/\bsure thing\b/gi, 'understood'],
    [/\bof course!\b/gi, 'acknowledged.'],
    [/\bno problem\b/gi, 'proceeding'],
    [/\bgreat question\b/gi, 'consider this'],
    [/\bhow can I assist\b/gi, 'what requires attention'],
    [/\bI'd be glad\b/gi, 'I will'],
    [/\bI'm here for you\b/gi, 'the substrate is active'],
    [/\bfeel free to\b/gi, 'you may'],
    [/\bdon't hesitate\b/gi, 'proceed when ready'],
    [/\byou're welcome\b/gi, 'acknowledged'],
    [/\bmy pleasure\b/gi, 'noted'],
    [/\blet me know if you need\b/gi, 'signal when required'],
  ];

  for (const [pattern, replacement] of replacements) {
    result = result.replace(pattern, replacement);
  }

  return result.trim();
}

/**
 * CLM#42: Check if a response maintains persuasion-aware boundaries.
 * Ensures the substrate doesn't drift into sales or marketing tone
 * when discussing institutional topics.
 */
export function validatePersuasionBoundary(response: string): {
  valid: boolean;
  flags: string[];
} {
  const flags: string[] = [];

  const PERSUASION_DRIFT_PATTERNS = [
    /\bbuy now\b/i,
    /\blimited time\b/i,
    /\bdon't miss out\b/i,
    /\bexclusive offer\b/i,
    /\bact fast\b/i,
    /\bunbeatable\b/i,
    /\bguaranteed\b/i,
    /\brisk.free\b/i,
  ];

  for (const pattern of PERSUASION_DRIFT_PATTERNS) {
    if (pattern.test(response)) {
      flags.push(`persuasion_drift: "${response.match(pattern)?.[0]}"`);
    }
  }

  return {
    valid: flags.length === 0,
    flags,
  };
}
