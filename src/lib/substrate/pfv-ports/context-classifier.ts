/**
 * PFV Port → Context Classifier (Multi-Label)
 * Content-type-aware routing with primary + secondary classification
 * Benefits: DECODE, MEMORY, BRAIN
 * Source: CMPSBL Vision brain/contextClassifier.ts
 *
 * FIX: Now supports multi-label output instead of single-winner.
 * Mixed content (e.g. "code + plan") returns primary + secondaries.
 */

export type ContextType = 'code' | 'doc' | 'chat' | 'plan';

export interface ClassificationResult {
  /** Primary (highest-scoring) context */
  context: ContextType;
  confidence: number;
  suggestedPriority: number;
  suggestedTags: Record<string, any>;
  /** All contexts with their individual scores */
  scores: Record<ContextType, number>;
  /** Secondary contexts that also matched significantly */
  secondaryContexts: ContextType[];
  /** True if content matched multiple categories meaningfully */
  isMultiLabel: boolean;
}

const CODE_PATTERNS = [
  /function\s+\w+\s*\(/, /const\s+\w+\s*=/, /import\s+.*from/,
  /class\s+\w+/, /<\w+.*>/, /\{\s*[\w\s:]+\}/, /=>/, /console\./,
];

const DOC_PATTERNS = [
  /^#\s+\w+/m, /\*\*.*\*\*/, /documentation/i, /readme/i, /guide/i, /tutorial/i,
];

const CHAT_PATTERNS = [
  /^(user|assistant|system):/im, /\bask\b.*\bquestion\b/i,
  /\bhow\s+(do|can|should)\b/i, /\bwhat\s+is\b/i, /\bplease\b/i,
];

const PLAN_PATTERNS = [
  /roadmap/i, /milestone/i, /objective/i, /goal/i,
  /strategy/i, /architecture/i, /design/i,
];

const PRIORITY_MAP: Record<ContextType, number> = {
  code: 8, plan: 7, doc: 6, chat: 5,
};

/**
 * Secondary threshold: if a context scores >= this fraction of the winner,
 * it becomes a secondary label.
 */
const SECONDARY_THRESHOLD_RATIO = 0.5;

/**
 * Minimum absolute score for a context to be considered a secondary label.
 */
const SECONDARY_MIN_SCORE = 1;

/**
 * Classify content with multi-label support.
 *
 * Returns a primary context (highest score) plus any secondaries
 * that scored significantly. "code + plan" mixed content will produce:
 * { context: 'code', secondaryContexts: ['plan'], isMultiLabel: true }
 */
export function classifyContext(
  content: string,
  metadata?: Record<string, any>
): ClassificationResult {
  const patternSets: { context: ContextType; patterns: RegExp[] }[] = [
    { context: 'code', patterns: CODE_PATTERNS },
    { context: 'doc', patterns: DOC_PATTERNS },
    { context: 'chat', patterns: CHAT_PATTERNS },
    { context: 'plan', patterns: PLAN_PATTERNS },
  ];

  const scores: Record<ContextType, number> = { code: 0, doc: 0, chat: 0, plan: 0 };

  for (const { context, patterns } of patternSets) {
    for (const pattern of patterns) {
      if (pattern.test(content)) scores[context]++;
    }
    // Metadata hints give +2 bonus
    if (metadata?.type === context || metadata?.source?.includes(context)) {
      scores[context] += 2;
    }
  }

  const sorted = (Object.entries(scores) as [ContextType, number][])
    .sort((a, b) => b[1] - a[1]);

  const winner = sorted[0];
  const total = Object.values(scores).reduce((a, b) => a + b, 0);
  const confidence = total > 0 ? winner[1] / total : 0.5;

  // ── Multi-label detection ──
  const winnerScore = winner[1];
  const secondaryThreshold = Math.max(
    winnerScore * SECONDARY_THRESHOLD_RATIO,
    SECONDARY_MIN_SCORE
  );

  const secondaryContexts: ContextType[] = sorted
    .slice(1)
    .filter(([, score]) => score >= secondaryThreshold)
    .map(([ctx]) => ctx);

  const isMultiLabel = secondaryContexts.length > 0;

  const suggestedTags: Record<string, any> = {
    confidence,
    auto_classified: true,
    timestamp: new Date().toISOString(),
    multi_label: isMultiLabel,
  };

  if (isMultiLabel) {
    suggestedTags.secondary_contexts = secondaryContexts;
  }

  if (metadata) {
    suggestedTags.source_module = metadata.source_module || 'unknown';
    if (metadata.origin) suggestedTags.origin = metadata.origin;
    if (metadata.affects) suggestedTags.affects = metadata.affects;
  }

  return {
    context: winner[0],
    confidence,
    suggestedPriority: PRIORITY_MAP[winner[0]],
    suggestedTags,
    scores: { ...scores },
    secondaryContexts,
    isMultiLabel,
  };
}

/**
 * Extract goal reference from content
 */
export function extractGoalRef(
  content: string,
  defaultGoal: string = 'make CMPSBL profitable'
): string {
  const patterns = [/goal:\s*([^\n]+)/i, /objective:\s*([^\n]+)/i, /aim:\s*([^\n]+)/i, /target:\s*([^\n]+)/i];
  for (const pattern of patterns) {
    const match = content.match(pattern);
    if (match?.[1]) return match[1].trim();
  }
  return defaultGoal;
}

/**
 * Extract causal links (origin → affects chain)
 */
export function extractCausalLinks(metadata?: Record<string, any>): {
  origin?: string;
  affects?: string[];
} {
  return {
    origin: metadata?.origin,
    affects: Array.isArray(metadata?.affects) ? metadata.affects : undefined,
  };
}
