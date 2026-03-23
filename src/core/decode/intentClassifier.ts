/**
 * DECODE Intent Classification Pipeline — v1.0.0
 * Real-time NLU that classifies user input into epistemic verbs
 * (describe/interpret/reflect/pattern/project) before routing.
 * 
 * Replaces manual intent hints with automatic classification.
 * Uses a weighted multi-signal approach: keyword matching,
 * syntactic structure, and contextual cues.
 */

// ═══ Types ════════════════════════════════════════════════════════

export type EpistemicVerb = 'describe' | 'interpret' | 'reflect' | 'pattern' | 'project';
export type CommandVerb = 'query' | 'mutate' | 'navigate' | 'govern' | 'meta';

export interface ClassificationResult {
  epistemic: EpistemicVerb;
  command: CommandVerb;
  confidence: number;
  signals: ClassificationSignal[];
  alternatives: Array<{ verb: EpistemicVerb; confidence: number }>;
}

export interface ClassificationSignal {
  source: 'keyword' | 'syntax' | 'context' | 'entity';
  weight: number;
  detail: string;
}

// ═══ Signal Patterns ══════════════════════════════════════════════

const EPISTEMIC_KEYWORDS: Record<EpistemicVerb, RegExp[]> = {
  describe: [
    /\b(what|show|display|list|tell me about|describe|explain)\b/i,
    /\b(overview|summary|status|info|details)\b/i,
    /^what('?s| is| are)\b/i,
  ],
  interpret: [
    /\b(why|how come|what does .+ mean|analyze|interpret|meaning)\b/i,
    /\b(significance|implication|reason|cause)\b/i,
    /\b(understand|make sense of)\b/i,
  ],
  reflect: [
    /\b(think about|reflect|consider|review|assess|evaluate)\b/i,
    /\b(looking back|in retrospect|how did|what went)\b/i,
    /\b(lesson|insight|takeaway|learning)\b/i,
  ],
  pattern: [
    /\b(pattern|trend|recurring|correlation|frequency)\b/i,
    /\b(similar to|reminds me|like before|same as)\b/i,
    /\b(detect|identify|spot|notice .+ pattern)\b/i,
  ],
  project: [
    /\b(predict|forecast|expect|anticipate|will|future)\b/i,
    /\b(what if|scenario|projection|outlook|trajectory)\b/i,
    /\b(going to|likely|probability)\b/i,
  ],
};

const COMMAND_KEYWORDS: Record<CommandVerb, RegExp[]> = {
  query: [
    /\b(show|get|check|list|find|search|read|fetch)\b/i,
    /^(what|where|who|when|which|how many)\b/i,
  ],
  mutate: [
    /\b(create|add|update|delete|remove|set|change|modify|enable|disable)\b/i,
    /\b(deploy|launch|start|stop|restart|reset)\b/i,
  ],
  navigate: [
    /\b(go to|navigate|open|switch to|show me)\b/i,
    /\b(dashboard|page|view|screen|panel)\b/i,
  ],
  govern: [
    /\b(govern|lockdown|override|audit|approve|reject)\b/i,
    /^\/(govern|set-mode|enable|disable|health|caps|budget)/i,
  ],
  meta: [
    /\b(help|version|about|who are you|what can you)\b/i,
    /^\/(help|version|clear|status)/i,
  ],
};

// ═══ Syntactic Signals ════════════════════════════════════════════

function detectSyntacticSignals(input: string): ClassificationSignal[] {
  const signals: ClassificationSignal[] = [];

  // Questions → describe or interpret
  if (/\?$/.test(input.trim())) {
    signals.push({ source: 'syntax', weight: 0.15, detail: 'interrogative form' });
  }

  // Imperatives → describe or mutate
  if (/^[A-Z][a-z]+\s/.test(input.trim()) && !/\?$/.test(input.trim())) {
    signals.push({ source: 'syntax', weight: 0.1, detail: 'imperative form' });
  }

  // Conditional → project
  if (/\b(if|when|should|could|would)\b/i.test(input)) {
    signals.push({ source: 'syntax', weight: 0.2, detail: 'conditional/hypothetical' });
  }

  // Past tense → reflect
  if (/\b(was|were|did|had|went|happened)\b/i.test(input)) {
    signals.push({ source: 'syntax', weight: 0.2, detail: 'past tense markers' });
  }

  // Comparative → pattern
  if (/\b(more|less|compared|versus|vs|than|between)\b/i.test(input)) {
    signals.push({ source: 'syntax', weight: 0.15, detail: 'comparative structure' });
  }

  return signals;
}

// ═══ Classifier ═══════════════════════════════════════════════════

/**
 * Classify input into epistemic and command verbs
 */
export function classifyIntent(
  input: string,
  contextHints?: { recentIntents?: string[]; moduleContext?: string },
): ClassificationResult {
  const scores: Record<EpistemicVerb, number> = {
    describe: 0,
    interpret: 0,
    reflect: 0,
    pattern: 0,
    project: 0,
  };

  const commandScores: Record<CommandVerb, number> = {
    query: 0,
    mutate: 0,
    navigate: 0,
    govern: 0,
    meta: 0,
  };

  const signals: ClassificationSignal[] = [];

  // 1. Keyword matching (weight: 0.5)
  for (const [verb, patterns] of Object.entries(EPISTEMIC_KEYWORDS) as [EpistemicVerb, RegExp[]][]) {
    for (const pattern of patterns) {
      if (pattern.test(input)) {
        const signal: ClassificationSignal = {
          source: 'keyword',
          weight: 0.5,
          detail: `${verb}: matched "${input.match(pattern)?.[0]}"`,
        };
        signals.push(signal);
        scores[verb] += 0.5;
      }
    }
  }

  for (const [verb, patterns] of Object.entries(COMMAND_KEYWORDS) as [CommandVerb, RegExp[]][]) {
    for (const pattern of patterns) {
      if (pattern.test(input)) {
        commandScores[verb] += 0.5;
      }
    }
  }

  // 2. Syntactic signals (weight: varies)
  const syntactic = detectSyntacticSignals(input);
  signals.push(...syntactic);

  for (const sig of syntactic) {
    if (sig.detail.includes('conditional')) scores.project += sig.weight;
    if (sig.detail.includes('past tense')) scores.reflect += sig.weight;
    if (sig.detail.includes('comparative')) scores.pattern += sig.weight;
    if (sig.detail.includes('interrogative')) scores.describe += sig.weight * 0.5;
    if (sig.detail.includes('imperative')) scores.describe += sig.weight * 0.3;
  }

  // 3. Context boost (weight: 0.15)
  if (contextHints?.recentIntents?.length) {
    const last = contextHints.recentIntents[contextHints.recentIntents.length - 1];
    if (last in scores) {
      scores[last as EpistemicVerb] += 0.15;
      signals.push({
        source: 'context',
        weight: 0.15,
        detail: `continuity boost for "${last}"`,
      });
    }
  }

  // 4. Default: if no strong signal, default to describe
  const maxScore = Math.max(...Object.values(scores));
  if (maxScore === 0) {
    scores.describe = 0.3;
  }

  // Select winner
  const sorted = (Object.entries(scores) as [EpistemicVerb, number][])
    .sort((a, b) => b[1] - a[1]);

  const winner = sorted[0];
  const total = sorted.reduce((s, [, v]) => s + v, 0) || 1;
  const confidence = winner[1] / total;

  // Command verb
  const commandSorted = (Object.entries(commandScores) as [CommandVerb, number][])
    .sort((a, b) => b[1] - a[1]);

  return {
    epistemic: winner[0],
    command: commandSorted[0][0],
    confidence: Math.round(confidence * 100) / 100,
    signals,
    alternatives: sorted.slice(1, 3).map(([verb, score]) => ({
      verb,
      confidence: Math.round((score / total) * 100) / 100,
    })),
  };
}

/**
 * Quick classification — returns just the epistemic verb
 */
export function quickClassify(input: string): EpistemicVerb {
  return classifyIntent(input).epistemic;
}
