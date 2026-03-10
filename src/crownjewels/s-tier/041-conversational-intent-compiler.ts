/**
 * S-Tier 041 — Conversational Intent Compiler
 * CJPI: 94 | Node: INTENT | ID: S-SYN12
 *
 * Compiles multi-turn conversation sequences into structured intent programs.
 * Each "program" is a directed sequence of actions the substrate should execute.
 */

export interface ConversationTurn {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface IntentAction {
  action: string;
  module: string;
  params: Record<string, unknown>;
  confidence: number;
  derivedFrom: number; // turn index
}

export interface IntentProgram {
  id: string;
  actions: IntentAction[];
  compiledAt: string;
  turnCount: number;
  summary: string;
}

const ACTION_PATTERNS: Array<{ pattern: RegExp; action: string; module: string }> = [
  { pattern: /\b(search|find|look\s*up|query)\b/i, action: 'search', module: 'harvest' },
  { pattern: /\b(create|generate|build|make)\b/i, action: 'create', module: 'forge' },
  { pattern: /\b(analyze|examine|inspect|review)\b/i, action: 'analyze', module: 'vision' },
  { pattern: /\b(delete|remove|clear|drop)\b/i, action: 'delete', module: 'memory' },
  { pattern: /\b(predict|forecast|estimate)\b/i, action: 'predict', module: 'oracle' },
  { pattern: /\b(encrypt|protect|secure|lock)\b/i, action: 'secure', module: 'defense' },
  { pattern: /\b(schedule|plan|remind|timer)\b/i, action: 'schedule', module: 'system' },
  { pattern: /\b(connect|link|integrate|sync)\b/i, action: 'integrate', module: 'integration' },
];

let progSeq = 0;

export function compileIntentProgram(turns: ConversationTurn[]): IntentProgram {
  const actions: IntentAction[] = [];

  for (let i = 0; i < turns.length; i++) {
    const turn = turns[i];
    if (turn.role !== 'user') continue;

    for (const { pattern, action, module } of ACTION_PATTERNS) {
      const match = turn.content.match(pattern);
      if (match) {
        actions.push({
          action,
          module,
          params: { raw: turn.content, matchedKeyword: match[0] },
          confidence: 0.7 + (i / turns.length) * 0.2, // Later turns get higher confidence
          derivedFrom: i,
        });
      }
    }
  }

  // Deduplicate consecutive identical actions
  const deduped = actions.filter((a, idx) =>
    idx === 0 || a.action !== actions[idx - 1].action || a.module !== actions[idx - 1].module
  );

  return {
    id: `prog-${++progSeq}-${Date.now().toString(36)}`,
    actions: deduped,
    compiledAt: new Date().toISOString(),
    turnCount: turns.length,
    summary: deduped.length
      ? `${deduped.length} actions: ${deduped.map(a => `${a.module}.${a.action}`).join(' → ')}`
      : 'No actionable intents detected',
  };
}
