/**
 * INTENT Ultimate — System 7: Contextual Amplification Layer
 * 
 * Enriches raw input with signals from MEMORY, BRAIN, DECODE, IDENTITY,
 * and COMPASS. Transforms minimal user input into high-fidelity intent.
 * 
 * @module intent/ultimate/contextAmplifier
 */

// ── Types ────────────────────────────────────────────────────────

export type ContextSource = 'memory' | 'brain' | 'decode' | 'identity' | 'compass' | 'session';

export interface ContextSignal {
  source: ContextSource;
  key: string;
  value: unknown;
  relevance: number; // 0-1
  freshness: number; // 0-1 (1 = just generated)
  addedAt: string;
}

export interface AmplifiedIntent {
  id: string;
  originalInput: string;
  originalTokenCount: number;
  amplifiedContext: ContextSignal[];
  amplificationRatio: number; // How much richer the context is
  totalRelevance: number;
  amplifiedAt: string;
}

interface AmplificationRule {
  source: ContextSource;
  triggerPatterns: RegExp[];
  signalGenerator: (input: string) => ContextSignal[];
  priority: number;
}

// ── State ────────────────────────────────────────────────────────

const amplificationHistory: AmplifiedIntent[] = [];
const MAX_HISTORY = 300;
const sessionContext: Map<string, unknown> = new Map();

// ── Amplification Rules ──────────────────────────────────────────

const AMPLIFICATION_RULES: AmplificationRule[] = [
  {
    source: 'memory',
    triggerPatterns: [/.*/], // Always try memory enrichment
    priority: 1,
    signalGenerator: (input) => {
      const signals: ContextSignal[] = [];
      // Provide conversation history context
      const recentAmps = amplificationHistory.slice(-5);
      if (recentAmps.length > 0) {
        signals.push({
          source: 'memory',
          key: 'recent_intents',
          value: recentAmps.map(a => a.originalInput).slice(-3),
          relevance: 0.7,
          freshness: 0.9,
          addedAt: new Date().toISOString(),
        });
      }
      return signals;
    },
  },
  {
    source: 'brain',
    triggerPatterns: [/analyze|think|reason|understand|explain/i],
    priority: 2,
    signalGenerator: (input) => [{
      source: 'brain',
      key: 'reasoning_mode',
      value: 'deep_analysis',
      relevance: 0.8,
      freshness: 1.0,
      addedAt: new Date().toISOString(),
    }],
  },
  {
    source: 'decode',
    triggerPatterns: [/.*/], // Always apply decode context
    priority: 3,
    signalGenerator: (input) => {
      const wordCount = input.split(/\s+/).length;
      const complexity = wordCount > 20 ? 'high' : wordCount > 8 ? 'medium' : 'low';
      return [{
        source: 'decode',
        key: 'input_complexity',
        value: complexity,
        relevance: 0.6,
        freshness: 1.0,
        addedAt: new Date().toISOString(),
      }];
    },
  },
  {
    source: 'identity',
    triggerPatterns: [/.*/],
    priority: 4,
    signalGenerator: () => {
      const signals: ContextSignal[] = [];
      const role = sessionContext.get('user_role');
      if (role) {
        signals.push({
          source: 'identity',
          key: 'user_role',
          value: role,
          relevance: 0.5,
          freshness: 0.8,
          addedAt: new Date().toISOString(),
        });
      }
      return signals;
    },
  },
  {
    source: 'compass',
    triggerPatterns: [/trend|direction|future|predict|forecast/i],
    priority: 5,
    signalGenerator: () => [{
      source: 'compass',
      key: 'trend_context',
      value: 'temporal_analysis_available',
      relevance: 0.7,
      freshness: 0.9,
      addedAt: new Date().toISOString(),
    }],
  },
  {
    source: 'session',
    triggerPatterns: [/.*/],
    priority: 6,
    signalGenerator: () => {
      const signals: ContextSignal[] = [];
      for (const [key, value] of sessionContext) {
        signals.push({
          source: 'session',
          key,
          value,
          relevance: 0.4,
          freshness: 0.7,
          addedAt: new Date().toISOString(),
        });
      }
      return signals.slice(0, 5); // Max 5 session signals
    },
  },
];

// ── Core API ────────────────────────────────────────────────────

/** Amplify an intent input with contextual signals */
export function amplifyIntent(input: string): AmplifiedIntent {
  const signals: ContextSignal[] = [];

  // Run all matching amplification rules
  for (const rule of AMPLIFICATION_RULES.sort((a, b) => a.priority - b.priority)) {
    const matches = rule.triggerPatterns.some(p => p.test(input));
    if (matches) {
      const ruleSignals = rule.signalGenerator(input);
      signals.push(...ruleSignals);
    }
  }

  // Filter by relevance threshold
  const relevantSignals = signals
    .filter(s => s.relevance > 0.2)
    .sort((a, b) => b.relevance - a.relevance)
    .slice(0, 15); // Max 15 context signals

  const originalTokenCount = input.split(/\s+/).length;
  const totalRelevance = relevantSignals.length > 0
    ? Math.round((relevantSignals.reduce((s, sig) => s + sig.relevance, 0) / relevantSignals.length) * 1000) / 1000
    : 0;

  const amplified: AmplifiedIntent = {
    id: crypto.randomUUID(),
    originalInput: input,
    originalTokenCount,
    amplifiedContext: relevantSignals,
    amplificationRatio: relevantSignals.length > 0 ? Math.round((relevantSignals.length / Math.max(1, originalTokenCount)) * 100) / 100 : 0,
    totalRelevance,
    amplifiedAt: new Date().toISOString(),
  };

  amplificationHistory.push(amplified);
  if (amplificationHistory.length > MAX_HISTORY) amplificationHistory.splice(0, amplificationHistory.length - MAX_HISTORY);

  return amplified;
}

/** Set session context for future amplification */
export function setSessionContext(key: string, value: unknown): void {
  sessionContext.set(key, value);
}

/** Clear session context */
export function clearSessionContext(): void {
  sessionContext.clear();
}

/** Get amplification health */
export function getAmplifierHealth() {
  const recent = amplificationHistory.slice(-50);
  return {
    totalAmplifications: amplificationHistory.length,
    avgSignalsPerIntent: recent.length > 0
      ? Math.round((recent.reduce((s, a) => s + a.amplifiedContext.length, 0) / recent.length) * 10) / 10
      : 0,
    avgRelevance: recent.length > 0
      ? Math.round((recent.reduce((s, a) => s + a.totalRelevance, 0) / recent.length) * 1000) / 1000
      : 0,
    sessionContextKeys: sessionContext.size,
    sourcesActive: new Set(AMPLIFICATION_RULES.map(r => r.source)).size,
  };
}

/** Reset */
export function resetAmplifier(): void {
  amplificationHistory.length = 0;
  sessionContext.clear();
}
