/**
 * Natural Language Intent Parser — Ported from SimNap
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Translates natural language narratives into structured
 * system actions, SEBA proposals, or module commands.
 * 
 * Consumers: INTENT, DECODE, DREAM, NEXUS
 * Origin: dev-engine/intent.ts
 */

// ── Types ─────────────────────────────────────────────────────────

export type IntentCategory =
  | 'query'         // Information retrieval
  | 'command'       // Direct action
  | 'proposal'      // Suggest a change
  | 'diagnostic'    // Health / status check
  | 'configuration' // Settings change
  | 'creative'      // Generation / synthesis
  | 'navigation'    // Route / context switch
  | 'unknown';

export interface ParsedIntent {
  id: string;
  raw: string;
  category: IntentCategory;
  confidence: number;      // 0-1
  targetModule: string | null;
  action: string | null;
  parameters: Record<string, string | number | boolean>;
  slots: IntentSlot[];
  ambiguous: boolean;
  alternatives: Array<{ category: IntentCategory; confidence: number }>;
  parsedAt: number;
}

export interface IntentSlot {
  name: string;
  value: string;
  type: 'module' | 'action' | 'entity' | 'quantity' | 'timeframe' | 'flag';
  confidence: number;
}

export interface IntentPattern {
  pattern: RegExp;
  category: IntentCategory;
  extractors: SlotExtractor[];
  targetModule?: string;
  action?: string;
  priority: number;
}

type SlotExtractor = (match: RegExpMatchArray, input: string) => IntentSlot[];

// ── Module Keywords ───────────────────────────────────────────────

const MODULE_KEYWORDS: Record<string, string[]> = {
  DREAM:      ['dream', 'sleep', 'consolidat', 'nightmare', 'synthesis', 'nocturnal'],
  MEMORY:     ['memory', 'remember', 'recall', 'forget', 'store', 'retrieve', 'tier'],
  BRAIN:      ['brain', 'think', 'reason', 'process', 'cognitive', 'neuron'],
  NEXUS:      ['route', 'nexus', 'provider', 'model', 'fleet', 'ai call'],
  DEFENSE:    ['defend', 'defense', 'threat', 'security', 'block', 'firewall', 'attack'],
  VISION:     ['vision', 'monitor', 'observe', 'metric', 'dashboard', 'health'],
  ENGINEER:   ['engineer', 'build', 'deploy', 'infra', 'system', 'maintain'],
  EVOLUTION:  ['evolve', 'evolution', 'mutate', 'proposal', 'canary', 'rollback'],
  MEDIC:      ['medic', 'heal', 'diagnos', 'symptom', 'repair', 'triage'],
  ENCODE:     ['encode', 'generate', 'code', 'scaffold', 'patch', 'implement'],
  DECODE:     ['decode', 'parse', 'interpret', 'understand', 'translate'],
  ORACLE:     ['oracle', 'predict', 'forecast', 'anticipat', 'future', 'trend'],
  NERVE:      ['nerve', 'signal', 'event', 'heartbeat', 'circuit'],
  RELAY:      ['relay', 'webhook', 'forward', 'deliver', 'dispatch'],
  AUDIT:      ['audit', 'log', 'trail', 'compliance', 'record'],
  GOVERNANCE: ['governance', 'govern', 'policy', 'rule', 'approval'],
  IDENTITY:   ['identity', 'auth', 'user', 'session', 'token', 'permission'],
  IMMUNITY:   ['immun', 'anomaly', 'drift', 'baseline', 'quarantine'],
  SHADOW:     ['shadow', 'simulate', 'dry-run', 'sandbox', 'test run'],
  PHANTOM:    ['phantom', 'stealth', 'covert', 'hidden'],
  CLM:        ['clm', 'learn', 'training', 'knowledge', 'distill', 'topic'],
  CONSCIENCE: ['conscience', 'ethics', 'bias', 'fairness', 'moral'],
  ANALYTICS:  ['analytics', 'report', 'stat', 'chart', 'insight', 'data'],
  ECONOMY:    ['economy', 'cost', 'budget', 'roi', 'spending', 'quota'],
};

// ── Action Keywords ───────────────────────────────────────────────

const ACTION_KEYWORDS: Record<string, string[]> = {
  status:     ['status', 'health', 'state', 'how is', 'check'],
  start:      ['start', 'begin', 'launch', 'boot', 'initiate', 'activate'],
  stop:       ['stop', 'halt', 'pause', 'shutdown', 'disable', 'deactivate'],
  scan:       ['scan', 'sweep', 'audit', 'inspect', 'analyze'],
  create:     ['create', 'make', 'generate', 'new', 'add', 'build'],
  delete:     ['delete', 'remove', 'purge', 'clear', 'wipe', 'drop'],
  update:     ['update', 'change', 'modify', 'edit', 'set', 'configure'],
  search:     ['search', 'find', 'lookup', 'query', 'locate'],
  list:       ['list', 'show', 'display', 'get all', 'enumerate'],
  heal:       ['heal', 'repair', 'fix', 'recover', 'restore'],
  promote:    ['promote', 'approve', 'accept', 'advance'],
  rollback:   ['rollback', 'revert', 'undo', 'restore previous'],
};

// ── Parser ────────────────────────────────────────────────────────

/**
 * Detect which module is being referenced
 */
function detectModule(input: string): { module: string; confidence: number } | null {
  const lower = input.toLowerCase();
  let bestMatch: { module: string; score: number } | null = null;

  for (const [mod, keywords] of Object.entries(MODULE_KEYWORDS)) {
    let score = 0;
    for (const kw of keywords) {
      if (lower.includes(kw)) score += kw.length;
    }
    if (score > 0 && (!bestMatch || score > bestMatch.score)) {
      bestMatch = { module: mod, score };
    }
  }

  if (!bestMatch) return null;
  const maxPossible = MODULE_KEYWORDS[bestMatch.module].reduce((s, k) => s + k.length, 0);
  return { module: bestMatch.module, confidence: Math.min(1, bestMatch.score / (maxPossible * 0.3)) };
}

/**
 * Detect which action is being requested
 */
function detectAction(input: string): { action: string; confidence: number } | null {
  const lower = input.toLowerCase();
  let bestMatch: { action: string; score: number } | null = null;

  for (const [action, keywords] of Object.entries(ACTION_KEYWORDS)) {
    let score = 0;
    for (const kw of keywords) {
      if (lower.includes(kw)) score += kw.length;
    }
    if (score > 0 && (!bestMatch || score > bestMatch.score)) {
      bestMatch = { action, score };
    }
  }

  if (!bestMatch) return null;
  return { action: bestMatch.action, confidence: Math.min(1, bestMatch.score / 10) };
}

/**
 * Detect intent category from input
 */
function detectCategory(input: string, action: string | null): { category: IntentCategory; confidence: number } {
  const lower = input.toLowerCase();

  const patterns: Array<{ cat: IntentCategory; signals: string[] }> = [
    { cat: 'query', signals: ['what', 'how', 'why', 'show me', 'tell me', 'status', 'list', '?'] },
    { cat: 'command', signals: ['start', 'stop', 'run', 'execute', 'do', 'trigger', 'fire'] },
    { cat: 'proposal', signals: ['should we', 'propose', 'suggest', 'consider', 'what if'] },
    { cat: 'diagnostic', signals: ['diagnose', 'health', 'check', 'test', 'debug', 'trace'] },
    { cat: 'configuration', signals: ['set', 'configure', 'enable', 'disable', 'toggle', 'change setting'] },
    { cat: 'creative', signals: ['generate', 'create', 'write', 'compose', 'dream up', 'synthesize'] },
    { cat: 'navigation', signals: ['go to', 'open', 'navigate', 'switch to', 'show'] },
  ];

  let best: { cat: IntentCategory; score: number } = { cat: 'unknown', score: 0 };

  for (const { cat, signals } of patterns) {
    let score = 0;
    for (const sig of signals) {
      if (lower.includes(sig)) score++;
    }
    if (score > best.score) best = { cat, score };
  }

  // Boost from action detection
  if (action) {
    if (['status', 'search', 'list'].includes(action)) best = { cat: 'query', score: best.score + 1 };
    if (['start', 'stop', 'delete'].includes(action)) best = { cat: 'command', score: best.score + 1 };
    if (['heal', 'scan'].includes(action)) best = { cat: 'diagnostic', score: best.score + 1 };
    if (['update'].includes(action)) best = { cat: 'configuration', score: best.score + 1 };
    if (['create'].includes(action)) best = { cat: 'creative', score: best.score + 1 };
  }

  return {
    category: best.cat,
    confidence: best.score > 0 ? Math.min(1, best.score / 3) : 0.1,
  };
}

/**
 * Extract slots (entities, quantities, timeframes)
 */
function extractSlots(input: string): IntentSlot[] {
  const slots: IntentSlot[] = [];
  const lower = input.toLowerCase();

  // Module slot
  const mod = detectModule(input);
  if (mod) {
    slots.push({ name: 'targetModule', value: mod.module, type: 'module', confidence: mod.confidence });
  }

  // Quantity patterns
  const qtyMatch = lower.match(/(\d+)\s*(entries|items|rows|records|results|minutes|hours|days|percent|%)/);
  if (qtyMatch) {
    slots.push({ name: 'quantity', value: qtyMatch[1], type: 'quantity', confidence: 0.9 });
    slots.push({ name: 'unit', value: qtyMatch[2], type: 'entity', confidence: 0.9 });
  }

  // Boolean flags
  if (lower.includes('force') || lower.includes('--force')) {
    slots.push({ name: 'force', value: 'true', type: 'flag', confidence: 0.95 });
  }
  if (lower.includes('dry-run') || lower.includes('dry run') || lower.includes('simulate')) {
    slots.push({ name: 'dryRun', value: 'true', type: 'flag', confidence: 0.9 });
  }

  // Timeframe
  const timeMatch = lower.match(/(?:last|past|within)\s+(\d+)\s*(minute|hour|day|week|month)s?/);
  if (timeMatch) {
    slots.push({ name: 'timeframe', value: `${timeMatch[1]} ${timeMatch[2]}s`, type: 'timeframe', confidence: 0.85 });
  }

  return slots;
}

/**
 * Parse a natural language input into a structured intent
 */
export function parseIntent(input: string): ParsedIntent {
  const moduleResult = detectModule(input);
  const actionResult = detectAction(input);
  const categoryResult = detectCategory(input, actionResult?.action ?? null);
  const slots = extractSlots(input);

  // Compute overall confidence
  const confidences = [
    categoryResult.confidence,
    moduleResult?.confidence ?? 0,
    actionResult?.confidence ?? 0,
  ];
  const avgConfidence = confidences.reduce((a, b) => a + b, 0) / confidences.length;

  // Detect ambiguity (multiple modules or low confidence)
  const ambiguous = avgConfidence < 0.4 || categoryResult.category === 'unknown';

  // Build parameters from slots
  const parameters: Record<string, string | number | boolean> = {};
  for (const slot of slots) {
    if (slot.type === 'flag') parameters[slot.name] = slot.value === 'true';
    else if (slot.type === 'quantity') parameters[slot.name] = parseInt(slot.value, 10);
    else parameters[slot.name] = slot.value;
  }

  return {
    id: crypto.randomUUID(),
    raw: input,
    category: categoryResult.category,
    confidence: avgConfidence,
    targetModule: moduleResult?.module ?? null,
    action: actionResult?.action ?? null,
    parameters,
    slots,
    ambiguous,
    alternatives: [],
    parsedAt: Date.now(),
  };
}

/**
 * Batch-parse multiple inputs
 */
export function parseIntents(inputs: string[]): ParsedIntent[] {
  return inputs.map(parseIntent);
}
