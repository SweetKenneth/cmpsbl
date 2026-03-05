/**
 * Entropy Tracker — System Complexity & Stability Measurement
 * 
 * Tracks system entropy across mutations.
 * Entropy increases when:
 * - Complexity rises (more changes, more targets)
 * - Instability increases (health drops, breakers open)
 * - Error rate rises
 * 
 * Entropy reduction indicates successful improvement.
 * 
 * Entropy Score: 0 = perfectly ordered, 100 = maximum disorder
 */

import type { MutationChange } from './mutation-pipeline';
import { getAllNodeStates } from './registry';

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

export interface EntropySnapshot {
  mutationId: string;
  timestamp: number;
  score: number; // 0–100
  components: EntropyComponent[];
  delta: number; // Change from previous snapshot (negative = improvement)
  trend: 'improving' | 'stable' | 'degrading';
}

export interface EntropyComponent {
  name: string;
  value: number; // 0–100
  weight: number;
}

// ═══════════════════════════════════════════════════════════════
// STATE
// ═══════════════════════════════════════════════════════════════

const history: EntropySnapshot[] = [];
const MAX_HISTORY = 200;

// ═══════════════════════════════════════════════════════════════
// COMPUTATION
// ═══════════════════════════════════════════════════════════════

export function trackEntropy(
  mutationId: string,
  changes: MutationChange[]
): EntropySnapshot {
  const components: EntropyComponent[] = [];
  const nodes = getAllNodeStates();

  // Component 1: Change complexity (more changes = more entropy)
  const changeComplexity = Math.min(100, changes.length * 10);
  components.push({ name: 'Change Complexity', value: changeComplexity, weight: 0.25 });

  // Component 2: System instability (health-based)
  const avgHealth = nodes.length > 0
    ? nodes.reduce((sum, n) => sum + n.health, 0) / nodes.length
    : 100;
  const instability = 100 - avgHealth;
  components.push({ name: 'System Instability', value: instability, weight: 0.30 });

  // Component 3: Breaker disorder (open breakers = entropy)
  const openBreakers = nodes.filter(n => n.breakerState === 'open' || n.breakerState === 'half-open').length;
  const breakerEntropy = nodes.length > 0
    ? (openBreakers / nodes.length) * 100
    : 0;
  components.push({ name: 'Breaker Disorder', value: breakerEntropy, weight: 0.20 });

  // Component 4: Error density
  const totalOps = nodes.reduce((sum, n) => sum + n.opsCount, 0);
  const totalErrors = nodes.reduce((sum, n) => sum + n.errorCount, 0);
  const errorDensity = totalOps > 0 ? Math.min(100, (totalErrors / totalOps) * 500) : 0;
  components.push({ name: 'Error Density', value: errorDensity, weight: 0.25 });

  // Weighted score
  const score = Math.round(
    components.reduce((sum, c) => sum + c.value * c.weight, 0)
  );

  // Delta from previous
  const prevScore = history.length > 0 ? history[history.length - 1].score : score;
  const delta = score - prevScore;

  // Trend determination
  let trend: EntropySnapshot['trend'] = 'stable';
  if (history.length >= 3) {
    const recent = history.slice(-3).map(h => h.score);
    const avgRecent = recent.reduce((a, b) => a + b, 0) / recent.length;
    if (score < avgRecent - 2) trend = 'improving';
    else if (score > avgRecent + 2) trend = 'degrading';
  }

  const snapshot: EntropySnapshot = {
    mutationId,
    timestamp: Date.now(),
    score,
    components,
    delta,
    trend,
  };

  history.push(snapshot);
  if (history.length > MAX_HISTORY) history.shift();

  return snapshot;
}

/** Get entropy history */
export function getEntropyHistory(limit = 50): EntropySnapshot[] {
  return history.slice(-limit);
}

/** Get current entropy score (latest snapshot) */
export function getCurrentEntropy(): number {
  return history.length > 0 ? history[history.length - 1].score : 0;
}

/** Get entropy trend direction */
export function getEntropyTrend(): 'improving' | 'stable' | 'degrading' {
  return history.length > 0 ? history[history.length - 1].trend : 'stable';
}
