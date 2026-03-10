/**
 * S-Tier 038 — Intent Disambiguation Engine
 * CJPI: 94 | Node: INTENT | ID: S-INT02
 *
 * Resolves ambiguous user intents by scoring candidate interpretations
 * against context signals, conversation history, and module affinity.
 */

export interface IntentCandidate {
  intent: string;
  module: string;         // target module
  baseConfidence: number; // 0-1 from classifier
  contextBoost?: number;  // additional boost from context
}

export interface DisambiguationContext {
  recentModules: string[];      // recently active modules
  conversationTopics: string[]; // recent topics
  userPreferences?: Record<string, number>;
}

export interface DisambiguationResult {
  topIntent: IntentCandidate;
  alternatives: IntentCandidate[];
  ambiguityScore: number; // 0 = clear, 1 = very ambiguous
  needsClarification: boolean;
  decidedAt: string;
}

const CLARIFICATION_THRESHOLD = 0.15; // If top two are within this gap, ask for clarification

export function disambiguate(
  candidates: IntentCandidate[],
  context: DisambiguationContext
): DisambiguationResult {
  if (candidates.length === 0) {
    throw new Error('No intent candidates provided');
  }

  // Score each candidate with context boosting
  const scored = candidates.map(c => {
    let score = c.baseConfidence;

    // Boost if module was recently active
    const recencyIdx = context.recentModules.indexOf(c.module);
    if (recencyIdx !== -1) {
      score += 0.1 * (1 - recencyIdx / context.recentModules.length);
    }

    // Boost if intent keywords match conversation topics
    const topicMatch = context.conversationTopics.filter(t =>
      c.intent.toLowerCase().includes(t.toLowerCase())
    ).length;
    score += topicMatch * 0.05;

    // User preference boost
    if (context.userPreferences?.[c.module]) {
      score += context.userPreferences[c.module] * 0.1;
    }

    return { ...c, baseConfidence: Math.min(1, score + (c.contextBoost ?? 0)) };
  });

  // Sort descending
  scored.sort((a, b) => b.baseConfidence - a.baseConfidence);

  const top = scored[0];
  const runner = scored[1];
  const gap = runner ? top.baseConfidence - runner.baseConfidence : 1;
  const ambiguityScore = 1 - gap;
  const needsClarification = gap < CLARIFICATION_THRESHOLD && scored.length > 1;

  return {
    topIntent: top,
    alternatives: scored.slice(1),
    ambiguityScore: Math.round(ambiguityScore * 100) / 100,
    needsClarification,
    decidedAt: new Date().toISOString(),
  };
}
