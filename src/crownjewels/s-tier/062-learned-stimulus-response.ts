/**
 * S-Tier 062 — Learned Stimulus-Response Engine
 * CJPI: 93 | Node: REFLEX | ID: S-RFX02
 *
 * Learns from past stimulus→response pairs to auto-handle recurring events.
 * Uses frequency-weighted matching for fast edge-case responses.
 */

export interface StimulusResponse {
  stimulus: string;
  response: string;
  module: string;
  successCount: number;
  failCount: number;
  lastUsed: number;
}

const memory = new Map<string, StimulusResponse>();

export function learn(stimulus: string, response: string, module: string, success: boolean): void {
  const key = `${module}::${stimulus}`;
  const existing = memory.get(key);
  if (existing) {
    if (success) existing.successCount++; else existing.failCount++;
    existing.lastUsed = Date.now();
    existing.response = response; // update to latest
  } else {
    memory.set(key, {
      stimulus, response, module,
      successCount: success ? 1 : 0,
      failCount: success ? 0 : 1,
      lastUsed: Date.now(),
    });
  }
}

export function recall(stimulus: string, module?: string): StimulusResponse | null {
  // Exact match
  if (module) {
    const exact = memory.get(`${module}::${stimulus}`);
    if (exact && exact.successCount > exact.failCount) return exact;
  }

  // Best match across modules
  let best: StimulusResponse | null = null;
  let bestScore = 0;
  for (const [, sr] of memory) {
    if (sr.stimulus !== stimulus) continue;
    if (module && sr.module !== module) continue;
    const score = sr.successCount / (sr.successCount + sr.failCount + 1);
    if (score > bestScore) { best = sr; bestScore = score; }
  }
  return best;
}

export function getMemorySize(): number { return memory.size; }
export function clearMemory(): void { memory.clear(); }
export function getAllResponses(): StimulusResponse[] { return [...memory.values()]; }
