/**
 * S-Tier 052 — Intent Classification Engine
 * CJPI: 93 | Node: DECODE | ID: S-131
 *
 * Keyword-and-pattern-based intent classifier for DECODE inputs.
 * Maps user utterances to substrate actions.
 */

export interface ClassifiedIntent {
  intent: string;
  module: string;
  confidence: number;
  matchedKeywords: string[];
}

export interface ClassificationResult {
  input: string;
  topIntent: ClassifiedIntent | null;
  candidates: ClassifiedIntent[];
  classifiedAt: string;
}

interface IntentRule {
  intent: string;
  module: string;
  keywords: string[];
  boost: number;
}

const RULES: IntentRule[] = [
  { intent: 'status_check', module: 'system', keywords: ['status', 'health', 'running', 'uptime'], boost: 0 },
  { intent: 'search', module: 'harvest', keywords: ['search', 'find', 'lookup', 'query', 'where'], boost: 0 },
  { intent: 'create', module: 'forge', keywords: ['create', 'generate', 'build', 'new', 'make'], boost: 0 },
  { intent: 'analyze', module: 'vision', keywords: ['analyze', 'examine', 'inspect', 'review', 'check'], boost: 0 },
  { intent: 'predict', module: 'oracle', keywords: ['predict', 'forecast', 'estimate', 'project'], boost: 0 },
  { intent: 'remember', module: 'memory', keywords: ['remember', 'save', 'store', 'note', 'bookmark'], boost: 0 },
  { intent: 'secure', module: 'defense', keywords: ['secure', 'protect', 'encrypt', 'lock', 'shield'], boost: 0 },
  { intent: 'route', module: 'nexus', keywords: ['route', 'send', 'forward', 'delegate', 'assign'], boost: 0 },
  { intent: 'learn', module: 'brain', keywords: ['learn', 'understand', 'explain', 'teach', 'how'], boost: 0 },
  { intent: 'evolve', module: 'evolution', keywords: ['evolve', 'improve', 'optimize', 'upgrade', 'mutate'], boost: 0 },
];

export function classifyIntent(input: string): ClassificationResult {
  const lower = input.toLowerCase();
  const words = lower.split(/\s+/);

  const candidates: ClassifiedIntent[] = [];

  for (const rule of RULES) {
    const matched = rule.keywords.filter(kw => words.some(w => w.includes(kw)));
    if (matched.length === 0) continue;

    const confidence = Math.min(1, (matched.length / rule.keywords.length) * 0.8 + rule.boost + 0.1);
    candidates.push({
      intent: rule.intent,
      module: rule.module,
      confidence: Math.round(confidence * 100) / 100,
      matchedKeywords: matched,
    });
  }

  candidates.sort((a, b) => b.confidence - a.confidence);

  return {
    input,
    topIntent: candidates[0] ?? null,
    candidates,
    classifiedAt: new Date().toISOString(),
  };
}
