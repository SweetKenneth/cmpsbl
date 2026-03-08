/**
 * Decode Voice Guardrails
 * 
 * Modifies Decode's output layer to prevent narrative overreach
 * while preserving its distinctive voice.
 * 
 * Rules:
 * - Prohibit precise percentages unless tagged [MEASURED]
 * - Require explicit labeling of examples as [REPRESENTATIVE_EXAMPLE]
 * - Add automatic clarification when inference is used
 * - Preserve Decode's narrative tone and responsiveness
 */

import { 
  enforceResponsePolicy, 
  type PolicyResult, 
  type ProvenanceTag 
} from './decode-response-policy';
import { sanitizeClocklessTerminology } from '../decode/clockless-identity';

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export interface VoiceGuardrailResult {
  output: string;
  policy: PolicyResult;
  clarifications_added: string[];
  tone_preserved: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════════
// GUARDRAIL PATTERNS
// ═══════════════════════════════════════════════════════════════════════════════

// Patterns that indicate illustrative/example content
const EXAMPLE_INDICATORS = [
  /for\s+(?:example|instance)/gi,
  /such\s+as/gi,
  /e\.g\./gi,
  /imagine\s+(?:a|that|if)/gi,
  /consider\s+(?:a|the|this)/gi,
  /suppose\s+(?:we|you|that)/gi,
  /let's\s+say/gi,
  /hypothetically/gi,
];

// Inference language that should be flagged
const INFERENCE_INDICATORS = [
  /(?:this|it)\s+(?:suggests?|implies?|indicates?)/gi,
  /(?:likely|probably|possibly|potentially)/gi,
  /(?:appears?\s+to|seems?\s+to)/gi,
  /based\s+on\s+(?:patterns?|observations?|trends?)/gi,
  /(?:we|I)\s+(?:can|might)\s+(?:infer|deduce|conclude)/gi,
];

// Clarification suffixes
const INFERENCE_CLARIFICATION = ' — this observation is inferred from patterns, not directly measured.';
const EXAMPLE_CLARIFICATION = ' [REPRESENTATIVE_EXAMPLE]';

// ═══════════════════════════════════════════════════════════════════════════════
// VOICE GUARDRAIL ENGINE
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Apply voice guardrails to Decode output.
 * Enforces epistemic discipline while preserving narrative tone.
 */
export function applyVoiceGuardrails(rawOutput: string): VoiceGuardrailResult {
  const clarifications: string[] = [];
  let output = rawOutput;

  // Step 0: Sanitize deprecated terminology (World Engine → Cognitive Reality, etc.)
  output = sanitizeClocklessTerminology(output);

  // Step 1: Run epistemic policy enforcement
  const policy = enforceResponsePolicy(output);
  output = policy.cleaned;

  // Step 2: Auto-tag example content
  const sentences = output.split(/(?<=[.!?])\s+/);
  const taggedSentences = sentences.map(sentence => {
    // Check for example indicators without existing tags
    for (const pattern of EXAMPLE_INDICATORS) {
      // Must create fresh regex per test — /g regexes are stateful across calls
      const fresh = new RegExp(pattern.source, pattern.flags);
      if (fresh.test(sentence) && !sentence.includes('[REPRESENTATIVE_EXAMPLE]')) {
        clarifications.push(`Example content tagged: "${sentence.substring(0, 50)}..."`);
        return sentence.trimEnd() + EXAMPLE_CLARIFICATION;
      }
    }
    return sentence;
  });
  output = taggedSentences.join(' ');

  // Step 3: Add clarification for inference language (first occurrence per paragraph)
  const paragraphs = output.split('\n\n');
  const clarifiedParagraphs = paragraphs.map(para => {
    let hasInference = false;
    for (const pattern of INFERENCE_INDICATORS) {
      // Fresh regex to avoid /g statefulness
      const fresh = new RegExp(pattern.source, pattern.flags);
      if (fresh.test(para) && !para.includes('[INFERRED]') && !para.includes('[MEASURED]')) {
        hasInference = true;
        break;
      }
    }
    if (hasInference) {
      clarifications.push(`Inference clarification added to paragraph`);
      return para.trimEnd() + INFERENCE_CLARIFICATION;
    }
    return para;
  });
  output = clarifiedParagraphs.join('\n\n');

  return {
    output,
    policy,
    clarifications_added: clarifications,
    tone_preserved: true, // guardrails are additive, not destructive
  };
}

/**
 * Quick check if output needs guardrail processing.
 * Short responses or purely conversational output may skip.
 */
export function needsGuardrails(text: string): boolean {
  // Skip very short responses (conversational)
  if (text.length < 100) return false;
  
  // Skip if no numeric or metric content
  const hasMetrics = /\d+/.test(text);
  const hasExamples = EXAMPLE_INDICATORS.some(p => { p.lastIndex = 0; return p.test(text); });
  const hasInference = INFERENCE_INDICATORS.some(p => { p.lastIndex = 0; return p.test(text); });

  return hasMetrics || hasExamples || hasInference;
}

/**
 * Format a claim with proper provenance for Decode's voice
 */
export function voiceTaggedClaim(claim: string, tag: ProvenanceTag): string {
  switch (tag) {
    case 'MEASURED':
      return `${claim} [MEASURED]`;
    case 'INFERRED':
      return `${claim} — inferred from observed patterns [INFERRED]`;
    case 'DESIGN_INTENT':
      return `${claim} — as designed [DESIGN_INTENT]`;
    case 'REPRESENTATIVE_EXAMPLE':
      return `${claim} — illustrative [REPRESENTATIVE_EXAMPLE]`;
  }
}
