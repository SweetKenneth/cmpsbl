/**
 * S-Tier 065 — Intent Chaining Engine
 * CJPI: 93 | Node: INTENT | ID: S-INT03
 *
 * Chains multiple resolved intents into sequential execution plans.
 * Handles dependencies between chained intents.
 */

export interface ChainedIntent {
  id: string;
  intent: string;
  module: string;
  dependsOn: string[]; // intent IDs that must complete first
  status: 'pending' | 'running' | 'done' | 'failed';
  result?: unknown;
}

export interface IntentChain {
  id: string;
  intents: ChainedIntent[];
  status: 'pending' | 'running' | 'done' | 'failed';
  createdAt: number;
}

let chainSeq = 0;

export function createChain(intents: Omit<ChainedIntent, 'status' | 'result'>[]): IntentChain {
  return {
    id: `chain-${++chainSeq}`,
    intents: intents.map(i => ({ ...i, status: 'pending' as const })),
    status: 'pending',
    createdAt: Date.now(),
  };
}

export function getReady(chain: IntentChain): ChainedIntent[] {
  const doneIds = new Set(chain.intents.filter(i => i.status === 'done').map(i => i.id));
  return chain.intents.filter(i =>
    i.status === 'pending' && i.dependsOn.every(d => doneIds.has(d))
  );
}

export function markDone(chain: IntentChain, intentId: string, result?: unknown): void {
  const intent = chain.intents.find(i => i.id === intentId);
  if (intent) { intent.status = 'done'; intent.result = result; }
  if (chain.intents.every(i => i.status === 'done')) chain.status = 'done';
}

export function markFailed(chain: IntentChain, intentId: string): void {
  const intent = chain.intents.find(i => i.id === intentId);
  if (intent) intent.status = 'failed';
  chain.status = 'failed';
}

export function getProgress(chain: IntentChain): { done: number; total: number; pct: number } {
  const done = chain.intents.filter(i => i.status === 'done').length;
  return { done, total: chain.intents.length, pct: Math.round((done / chain.intents.length) * 100) };
}
