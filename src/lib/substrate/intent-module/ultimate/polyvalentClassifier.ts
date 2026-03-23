/**
 * INTENT Ultimate — System 1: Polyvalent Intent Classifier
 * 
 * Multi-strategy classification with confidence-weighted voting.
 * Handles ambiguous, compound, implicit, and explicit intents.
 * 
 * @module intent/ultimate/polyvalentClassifier
 */

// ── Types ────────────────────────────────────────────────────────

export type ClassificationStrategy = 'keyword' | 'semantic' | 'contextual' | 'behavioral';

export interface ClassificationVote {
  strategy: ClassificationStrategy;
  intentType: string;
  confidence: number;
  weight: number;
  reasoning: string;
}

export interface IntentClassification {
  id: string;
  rawInput: string;
  resolvedIntent: string;
  confidence: number;
  isAmbiguous: boolean;
  isCompound: boolean;
  isImplicit: boolean;
  votes: ClassificationVote[];
  alternativeIntents: Array<{ type: string; confidence: number }>;
  classifiedAt: string;
}

interface StrategyConfig {
  weight: number;
  enabled: boolean;
  minConfidence: number;
}

// ── State ────────────────────────────────────────────────────────

const STRATEGY_CONFIGS: Record<ClassificationStrategy, StrategyConfig> = {
  keyword:     { weight: 0.15, enabled: true, minConfidence: 0.3 },
  semantic:    { weight: 0.35, enabled: true, minConfidence: 0.4 },
  contextual:  { weight: 0.30, enabled: true, minConfidence: 0.3 },
  behavioral:  { weight: 0.20, enabled: true, minConfidence: 0.2 },
};

const KEYWORD_MAP: Record<string, string[]> = {
  analysis:    ['analyze', 'examine', 'inspect', 'review', 'assess', 'evaluate', 'audit'],
  generation:  ['generate', 'create', 'build', 'produce', 'compose', 'write', 'craft'],
  query:       ['find', 'search', 'lookup', 'get', 'fetch', 'retrieve', 'list', 'show'],
  mutation:    ['update', 'change', 'modify', 'edit', 'alter', 'set', 'configure'],
  deletion:    ['delete', 'remove', 'purge', 'clear', 'destroy', 'wipe'],
  monitoring:  ['monitor', 'watch', 'observe', 'track', 'alert'],
  healing:     ['heal', 'repair', 'fix', 'restore', 'recover'],
  security:    ['secure', 'protect', 'defend', 'shield', 'encrypt', 'lock'],
  learning:    ['learn', 'train', 'teach', 'adapt', 'improve', 'evolve'],
  prediction:  ['predict', 'forecast', 'project', 'estimate', 'anticipate'],
};

const classificationHistory: IntentClassification[] = [];
const MAX_HISTORY = 500;

// ── Strategies ───────────────────────────────────────────────────

function keywordClassify(input: string): ClassificationVote[] {
  const lower = input.toLowerCase();
  const votes: ClassificationVote[] = [];

  for (const [intentType, keywords] of Object.entries(KEYWORD_MAP)) {
    const matches = keywords.filter(k => lower.includes(k));
    if (matches.length > 0) {
      const confidence = Math.min(0.95, 0.4 + (matches.length * 0.15));
      votes.push({
        strategy: 'keyword',
        intentType,
        confidence,
        weight: STRATEGY_CONFIGS.keyword.weight,
        reasoning: `Matched keywords: ${matches.join(', ')}`,
      });
    }
  }

  return votes;
}

function semanticClassify(input: string): ClassificationVote[] {
  const lower = input.toLowerCase();
  const votes: ClassificationVote[] = [];

  // Semantic pattern detection — epistemic verb analysis
  const epistemicPatterns: Record<string, { patterns: RegExp[]; confidence: number }> = {
    analysis:   { patterns: [/what is/i, /how does/i, /why did/i, /explain/i], confidence: 0.75 },
    query:      { patterns: [/show me/i, /where is/i, /list all/i, /how many/i], confidence: 0.8 },
    mutation:   { patterns: [/make it/i, /change.*to/i, /set.*as/i, /switch/i], confidence: 0.7 },
    generation: { patterns: [/give me/i, /i need/i, /create.*new/i, /add a/i], confidence: 0.7 },
    prediction: { patterns: [/what will/i, /what if/i, /forecast/i, /expect/i], confidence: 0.75 },
    healing:    { patterns: [/something.*wrong/i, /not working/i, /broken/i, /error/i], confidence: 0.65 },
  };

  for (const [intentType, config] of Object.entries(epistemicPatterns)) {
    const matchCount = config.patterns.filter(p => p.test(lower)).length;
    if (matchCount > 0) {
      votes.push({
        strategy: 'semantic',
        intentType,
        confidence: Math.min(0.95, config.confidence + (matchCount - 1) * 0.1),
        weight: STRATEGY_CONFIGS.semantic.weight,
        reasoning: `Matched ${matchCount} semantic pattern(s)`,
      });
    }
  }

  return votes;
}

function contextualClassify(input: string, context?: Record<string, unknown>): ClassificationVote[] {
  const votes: ClassificationVote[] = [];
  if (!context) return votes;

  // Context signals influence classification
  const recentFailure = context.recentFailure as boolean | undefined;
  const activeSession = context.activeSession as string | undefined;
  const lastIntent = context.lastIntent as string | undefined;

  if (recentFailure) {
    votes.push({
      strategy: 'contextual',
      intentType: 'healing',
      confidence: 0.5,
      weight: STRATEGY_CONFIGS.contextual.weight,
      reasoning: 'Recent failure detected — healing intent likely',
    });
  }

  if (lastIntent) {
    // Follow-up patterns
    const followUpMap: Record<string, string> = {
      analysis: 'mutation',
      query: 'analysis',
      generation: 'query',
    };
    const followUp = followUpMap[lastIntent];
    if (followUp) {
      votes.push({
        strategy: 'contextual',
        intentType: followUp,
        confidence: 0.4,
        weight: STRATEGY_CONFIGS.contextual.weight,
        reasoning: `Follow-up to previous ${lastIntent} intent`,
      });
    }
  }

  return votes;
}

function behavioralClassify(input: string): ClassificationVote[] {
  const votes: ClassificationVote[] = [];

  // Analyze recent history for behavioral patterns
  const recentClassifications = classificationHistory.slice(-20);
  if (recentClassifications.length < 3) return votes;

  const intentCounts: Record<string, number> = {};
  for (const c of recentClassifications) {
    intentCounts[c.resolvedIntent] = (intentCounts[c.resolvedIntent] || 0) + 1;
  }

  // Most frequent recent intent gets a behavioral boost
  const sorted = Object.entries(intentCounts).sort((a, b) => b[1] - a[1]);
  if (sorted.length > 0 && sorted[0][1] >= 3) {
    votes.push({
      strategy: 'behavioral',
      intentType: sorted[0][0],
      confidence: 0.35,
      weight: STRATEGY_CONFIGS.behavioral.weight,
      reasoning: `Behavioral pattern: ${sorted[0][0]} seen ${sorted[0][1]} times recently`,
    });
  }

  return votes;
}

// ── Core API ────────────────────────────────────────────────────

/** Classify an intent using all 4 strategies with weighted voting */
export function classifyIntent(
  input: string,
  context?: Record<string, unknown>,
): IntentClassification {
  const allVotes: ClassificationVote[] = [];

  // Run all enabled strategies
  if (STRATEGY_CONFIGS.keyword.enabled) allVotes.push(...keywordClassify(input));
  if (STRATEGY_CONFIGS.semantic.enabled) allVotes.push(...semanticClassify(input, ));
  if (STRATEGY_CONFIGS.contextual.enabled) allVotes.push(...contextualClassify(input, context));
  if (STRATEGY_CONFIGS.behavioral.enabled) allVotes.push(...behavioralClassify(input));

  // Aggregate votes by intent type using weighted confidence
  const aggregated: Record<string, { totalWeightedConfidence: number; totalWeight: number; votes: ClassificationVote[] }> = {};

  for (const vote of allVotes) {
    if (!aggregated[vote.intentType]) {
      aggregated[vote.intentType] = { totalWeightedConfidence: 0, totalWeight: 0, votes: [] };
    }
    aggregated[vote.intentType].totalWeightedConfidence += vote.confidence * vote.weight;
    aggregated[vote.intentType].totalWeight += vote.weight;
    aggregated[vote.intentType].votes.push(vote);
  }

  // Rank intent types
  const ranked = Object.entries(aggregated)
    .map(([type, data]) => ({
      type,
      confidence: data.totalWeight > 0 ? data.totalWeightedConfidence / data.totalWeight : 0,
      votes: data.votes,
    }))
    .sort((a, b) => b.confidence - a.confidence);

  // Determine classification
  const winner = ranked[0] || { type: 'unknown', confidence: 0, votes: [] };
  const isAmbiguous = ranked.length > 1 && (ranked[0].confidence - ranked[1].confidence) < 0.15;
  const isCompound = ranked.filter(r => r.confidence > 0.5).length > 1;
  const isImplicit = allVotes.every(v => v.strategy !== 'keyword');

  const classification: IntentClassification = {
    id: crypto.randomUUID(),
    rawInput: input,
    resolvedIntent: winner.type,
    confidence: Math.round(winner.confidence * 1000) / 1000,
    isAmbiguous,
    isCompound,
    isImplicit,
    votes: allVotes,
    alternativeIntents: ranked.slice(1, 4).map(r => ({ type: r.type, confidence: Math.round(r.confidence * 1000) / 1000 })),
    classifiedAt: new Date().toISOString(),
  };

  // Store in history
  classificationHistory.push(classification);
  if (classificationHistory.length > MAX_HISTORY) classificationHistory.splice(0, classificationHistory.length - MAX_HISTORY);

  return classification;
}

/** Get classification history */
export function getClassificationHistory(): IntentClassification[] {
  return [...classificationHistory];
}

/** Get classifier health */
export function getClassifierHealth() {
  const recent = classificationHistory.slice(-50);
  const ambiguousRate = recent.length > 0
    ? recent.filter(c => c.isAmbiguous).length / recent.length
    : 0;
  const avgConfidence = recent.length > 0
    ? recent.reduce((s, c) => s + c.confidence, 0) / recent.length
    : 0;

  return {
    totalClassifications: classificationHistory.length,
    recentAmbiguousRate: Math.round(ambiguousRate * 100),
    averageConfidence: Math.round(avgConfidence * 1000) / 1000,
    strategiesEnabled: Object.values(STRATEGY_CONFIGS).filter(s => s.enabled).length,
  };
}

/** Reset classifier state */
export function resetClassifier(): void {
  classificationHistory.length = 0;
}
