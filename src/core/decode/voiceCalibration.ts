/**
 * DECODE Adaptive Voice Calibration — v1.0.0
 * Dynamic tone adaptation based on user expertise level
 * while maintaining immutable SOVEREIGN constraints.
 * 
 * The VOICE PROFILE is immutable (voiceProfile.ts).
 * This module adjusts DEPTH and VERBOSITY within those bounds.
 * 
 * Tiers:
 *   anonymous  → maximal explanation, guided language
 *   user       → standard depth, balanced
 *   creator    → technical detail, minimal hand-holding
 *   architect  → deep substrate references, terse
 *   governor   → full system transparency, command-style
 */

import type { IdentityRole } from '@/stores/decodeStore';

// ═══ Types ════════════════════════════════════════════════════════

export interface CalibrationProfile {
  role: IdentityRole;
  depthLevel: 1 | 2 | 3 | 4 | 5;
  verbosity: 'verbose' | 'balanced' | 'concise' | 'terse';
  technicalLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  includeExamples: boolean;
  includeSubstrateRefs: boolean;
  maxResponseTokens: number;
  contextPrefix: string;
}

export interface VoiceDirective {
  systemPromptAdditions: string[];
  responseConstraints: string[];
  formattingRules: string[];
}

// ═══ Calibration Profiles ═════════════════════════════════════════

const PROFILES: Record<IdentityRole, CalibrationProfile> = {
  anonymous: {
    role: 'anonymous',
    depthLevel: 1,
    verbosity: 'verbose',
    technicalLevel: 'beginner',
    includeExamples: true,
    includeSubstrateRefs: false,
    maxResponseTokens: 800,
    contextPrefix: 'Speaking to a new user — explain clearly, avoid jargon.',
  },
  user: {
    role: 'user',
    depthLevel: 2,
    verbosity: 'balanced',
    technicalLevel: 'intermediate',
    includeExamples: true,
    includeSubstrateRefs: false,
    maxResponseTokens: 600,
    contextPrefix: 'Addressing a registered user — balanced depth.',
  },
  creator: {
    role: 'creator',
    depthLevel: 3,
    verbosity: 'concise',
    technicalLevel: 'advanced',
    includeExamples: false,
    includeSubstrateRefs: true,
    maxResponseTokens: 500,
    contextPrefix: 'Addressing a creator — technical and direct.',
  },
  architect: {
    role: 'architect',
    depthLevel: 4,
    verbosity: 'terse',
    technicalLevel: 'expert',
    includeExamples: false,
    includeSubstrateRefs: true,
    maxResponseTokens: 400,
    contextPrefix: 'Addressing an architect — substrate-level precision.',
  },
  governor: {
    role: 'governor',
    depthLevel: 5,
    verbosity: 'terse',
    technicalLevel: 'expert',
    includeExamples: false,
    includeSubstrateRefs: true,
    maxResponseTokens: 500,
    contextPrefix: 'Addressing a Governor — full system transparency, command authority.',
  },
};

// ═══ Core API ═════════════════════════════════════════════════════

/**
 * Get the calibration profile for a given identity role
 */
export function getCalibration(role: IdentityRole): CalibrationProfile {
  return PROFILES[role] || PROFILES.anonymous;
}

/**
 * Generate voice directives for LLM system prompt construction
 */
export function generateVoiceDirective(role: IdentityRole): VoiceDirective {
  const profile = getCalibration(role);
  const additions: string[] = [];
  const constraints: string[] = [];
  const formatting: string[] = [];

  // Always enforce SOVEREIGN identity
  additions.push('You are DECODE, the substrate interpreter. Maintain SOVEREIGN authority.');
  additions.push('Never use assistant-tone phrases. Never claim emotion or personhood.');
  additions.push(profile.contextPrefix);

  // Verbosity rules
  switch (profile.verbosity) {
    case 'verbose':
      constraints.push('Explain concepts thoroughly. Use analogies when helpful.');
      formatting.push('Use paragraphs with clear structure.');
      break;
    case 'balanced':
      constraints.push('Be clear and complete without over-explaining.');
      formatting.push('Mix short paragraphs with key points.');
      break;
    case 'concise':
      constraints.push('Be direct. Skip pleasantries. Focus on substance.');
      formatting.push('Use bullet points for multi-part answers.');
      break;
    case 'terse':
      constraints.push('Minimal words. Maximum density. Command-style responses.');
      formatting.push('Use structured blocks. No filler.');
      break;
  }

  // Technical level
  if (profile.technicalLevel === 'beginner') {
    constraints.push('Avoid technical jargon. Explain substrate concepts in plain language.');
  } else if (profile.technicalLevel === 'expert') {
    constraints.push('Use precise technical terminology. Reference substrate primitives directly.');
  }

  // Substrate references
  if (profile.includeSubstrateRefs) {
    additions.push('Reference specific nodes, resolvers, and mesh events when relevant.');
  } else {
    constraints.push('Abstract away substrate internals. Present capabilities, not architecture.');
  }

  // Examples
  if (profile.includeExamples) {
    formatting.push('Include brief examples to illustrate key points.');
  }

  return { systemPromptAdditions: additions, responseConstraints: constraints, formattingRules: formatting };
}

/**
 * Interpolate between two profiles for smooth transitions
 */
export function interpolateCalibration(
  from: IdentityRole,
  to: IdentityRole,
  progress: number, // 0-1
): CalibrationProfile {
  const a = getCalibration(from);
  const b = getCalibration(to);
  const t = Math.max(0, Math.min(1, progress));

  return {
    role: t > 0.5 ? b.role : a.role,
    depthLevel: Math.round(a.depthLevel + (b.depthLevel - a.depthLevel) * t) as 1 | 2 | 3 | 4 | 5,
    verbosity: t > 0.5 ? b.verbosity : a.verbosity,
    technicalLevel: t > 0.5 ? b.technicalLevel : a.technicalLevel,
    includeExamples: t > 0.5 ? b.includeExamples : a.includeExamples,
    includeSubstrateRefs: t > 0.5 ? b.includeSubstrateRefs : a.includeSubstrateRefs,
    maxResponseTokens: Math.round(a.maxResponseTokens + (b.maxResponseTokens - a.maxResponseTokens) * t),
    contextPrefix: t > 0.5 ? b.contextPrefix : a.contextPrefix,
  };
}
