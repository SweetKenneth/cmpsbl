/**
 * Minds Intelligence Layer — Adaptive Tone Calibration Engine
 * GATED: adaptive_tone_auto = OFF
 * Tracks tone preferences. Learning enabled.
 * Automatic shifting OFF by default. Manual selector visible.
 */

import { getEffectiveStatus } from './featureFlags';

export type TonePreset =
  | 'professional'
  | 'casual'
  | 'technical'
  | 'empathetic'
  | 'concise'
  | 'detailed'
  | 'academic'
  | 'creative';

export interface ToneProfile {
  /** Current active tone */
  activeTone: TonePreset;
  /** Learned preference weights */
  preferences: Record<TonePreset, number>;
  /** Total interactions tracked */
  interactionCount: number;
  /** Whether auto-calibration is active */
  autoCalibrate: boolean;
  /** Manual override (always respected) */
  manualOverride: TonePreset | null;
}

export interface ToneDirective {
  tone: TonePreset;
  systemInstruction: string;
  confidenceInChoice: number;
}

/** Tone instruction templates */
const TONE_INSTRUCTIONS: Record<TonePreset, string> = {
  professional: 'Use formal, business-appropriate language. Be precise and structured. Avoid colloquialisms.',
  casual: 'Use conversational, approachable language. Short sentences. Contractions welcome.',
  technical: 'Use precise technical terminology. Include specifications and implementation details. Assume domain expertise.',
  empathetic: 'Be warm and understanding. Acknowledge concerns. Use supportive language. Offer encouragement.',
  concise: 'Be extremely brief. Bullet points over paragraphs. No filler. Maximum information density.',
  detailed: 'Be thorough and comprehensive. Explain reasoning. Provide examples and edge cases.',
  academic: 'Use scholarly language. Cite evidence. Maintain objectivity. Formal structure with clear methodology.',
  creative: 'Be imaginative and engaging. Use vivid language. Experiment with format. Prioritize inspiration.',
};

/** Per-session tone profiles */
const profiles = new Map<string, ToneProfile>();

/** Get or create tone profile */
export function getToneProfile(sessionId: string): ToneProfile {
  let profile = profiles.get(sessionId);
  if (!profile) {
    profile = {
      activeTone: 'professional',
      preferences: {
        professional: 0.2,
        casual: 0.15,
        technical: 0.15,
        empathetic: 0.1,
        concise: 0.15,
        detailed: 0.1,
        academic: 0.05,
        creative: 0.1,
      },
      interactionCount: 0,
      autoCalibrate: false, // OFF by default
      manualOverride: null,
    };
    profiles.set(sessionId, profile);
  }
  return profile;
}

/** Set manual tone override */
export function setManualTone(sessionId: string, tone: TonePreset): void {
  const profile = getToneProfile(sessionId);
  profile.manualOverride = tone;
  profile.activeTone = tone;
}

/** Clear manual override */
export function clearManualTone(sessionId: string): void {
  const profile = getToneProfile(sessionId);
  profile.manualOverride = null;
}

/** Get tone directive for prompt assembly */
export function getToneDirective(sessionId: string): ToneDirective {
  const profile = getToneProfile(sessionId);

  // Manual override always wins
  if (profile.manualOverride) {
    return {
      tone: profile.manualOverride,
      systemInstruction: TONE_INSTRUCTIONS[profile.manualOverride],
      confidenceInChoice: 1.0,
    };
  }

  // Auto-calibration only if feature is ACTIVE
  const autoEnabled = getEffectiveStatus('adaptive_tone_auto') === 'ACTIVE';
  if (autoEnabled && profile.autoCalibrate && profile.interactionCount >= 5) {
    const best = Object.entries(profile.preferences)
      .sort(([, a], [, b]) => b - a)[0];

    return {
      tone: best[0] as TonePreset,
      systemInstruction: TONE_INSTRUCTIONS[best[0] as TonePreset],
      confidenceInChoice: Math.min(0.9, best[1]),
    };
  }

  // Default
  return {
    tone: profile.activeTone,
    systemInstruction: TONE_INSTRUCTIONS[profile.activeTone],
    confidenceInChoice: 0.5,
  };
}

/** Record a tone signal from user behavior (internal learning) */
export function recordToneSignal(
  sessionId: string,
  indicators: {
    messageLength: number;
    usesEmoji: boolean;
    usesJargon: boolean;
    questionCount: number;
    formality: 'formal' | 'informal' | 'neutral';
  }
): void {
  const profile = getToneProfile(sessionId);
  profile.interactionCount++;

  // Learning: adjust preference weights based on user signals
  const { messageLength, usesEmoji, usesJargon, formality } = indicators;

  if (formality === 'formal') {
    profile.preferences.professional += 0.02;
    profile.preferences.academic += 0.01;
    profile.preferences.casual -= 0.01;
  } else if (formality === 'informal') {
    profile.preferences.casual += 0.02;
    profile.preferences.creative += 0.01;
    profile.preferences.professional -= 0.01;
  }

  if (usesEmoji) {
    profile.preferences.casual += 0.01;
    profile.preferences.empathetic += 0.01;
  }

  if (usesJargon) {
    profile.preferences.technical += 0.02;
  }

  if (messageLength < 30) {
    profile.preferences.concise += 0.01;
  } else if (messageLength > 200) {
    profile.preferences.detailed += 0.01;
  }

  // Normalize weights
  const total = Object.values(profile.preferences).reduce((s, v) => s + Math.max(0, v), 0);
  if (total > 0) {
    for (const key of Object.keys(profile.preferences) as TonePreset[]) {
      profile.preferences[key] = Math.max(0, profile.preferences[key]) / total;
    }
  }
}

/** Get available tone presets for manual selector */
export function getAvailableTones(): Array<{ value: TonePreset; label: string; description: string }> {
  return [
    { value: 'professional', label: 'Professional', description: 'Formal, structured, business-ready' },
    { value: 'casual', label: 'Casual', description: 'Conversational and approachable' },
    { value: 'technical', label: 'Technical', description: 'Precise with domain terminology' },
    { value: 'empathetic', label: 'Empathetic', description: 'Warm, supportive, understanding' },
    { value: 'concise', label: 'Concise', description: 'Brief and information-dense' },
    { value: 'detailed', label: 'Detailed', description: 'Thorough with examples' },
    { value: 'academic', label: 'Academic', description: 'Scholarly with evidence' },
    { value: 'creative', label: 'Creative', description: 'Imaginative and engaging' },
  ];
}

/** Enable/disable auto-calibration */
export function setAutoCalibrate(sessionId: string, enabled: boolean): void {
  const profile = getToneProfile(sessionId);
  profile.autoCalibrate = enabled;
}
