/**
 * S-Tier 086 — Personality Adaptation Engine
 * CJPI: 91 | Node: DECODE | ID: S-110
 *
 * Adapts DECODE's communication style based on user interaction patterns.
 * Tracks tone preferences and adjusts formality, verbosity, and emoji usage.
 */

export interface PersonalityProfile {
  userId: string;
  formality: number;     // 0 (casual) → 1 (formal)
  verbosity: number;     // 0 (terse) → 1 (verbose)
  emojiFrequency: number; // 0 (none) → 1 (heavy)
  technicalDepth: number; // 0 (simple) → 1 (expert)
  interactions: number;
  lastUpdated: number;
}

const profiles = new Map<string, PersonalityProfile>();

export function getProfile(userId: string): PersonalityProfile {
  if (!profiles.has(userId)) {
    profiles.set(userId, {
      userId, formality: 0.5, verbosity: 0.5, emojiFrequency: 0.3,
      technicalDepth: 0.5, interactions: 0, lastUpdated: Date.now(),
    });
  }
  return profiles.get(userId)!;
}

export function updateFromInteraction(
  userId: string,
  signals: { usedEmoji?: boolean; messageLength?: number; usedTechnicalTerms?: boolean; usedSlang?: boolean }
): PersonalityProfile {
  const profile = getProfile(userId);
  const lr = 0.05; // learning rate

  if (signals.usedEmoji !== undefined) {
    profile.emojiFrequency += (signals.usedEmoji ? 1 : 0 - profile.emojiFrequency) * lr;
  }
  if (signals.messageLength !== undefined) {
    const verbTarget = Math.min(1, signals.messageLength / 500);
    profile.verbosity += (verbTarget - profile.verbosity) * lr;
  }
  if (signals.usedTechnicalTerms) {
    profile.technicalDepth = Math.min(1, profile.technicalDepth + lr);
  }
  if (signals.usedSlang) {
    profile.formality = Math.max(0, profile.formality - lr);
  }

  profile.interactions++;
  profile.lastUpdated = Date.now();
  return profile;
}

export function getStyleDirective(userId: string): string {
  const p = getProfile(userId);
  const parts: string[] = [];
  if (p.formality > 0.7) parts.push('formal tone');
  else if (p.formality < 0.3) parts.push('casual tone');
  if (p.verbosity > 0.7) parts.push('detailed explanations');
  else if (p.verbosity < 0.3) parts.push('concise responses');
  if (p.emojiFrequency > 0.5) parts.push('use emoji');
  if (p.technicalDepth > 0.7) parts.push('expert-level detail');
  return parts.length > 0 ? parts.join(', ') : 'balanced style';
}
