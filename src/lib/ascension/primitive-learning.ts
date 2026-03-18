/**
 * CMPSBL® Primitive Learning Feedback
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Records primitive execution outcomes and updates success rates
 * for BRAIN learning integration. Uses exponential moving average
 * to weight recent performance more heavily.
 *
 * © CMPSBL® — All rights reserved.
 */

import { getPrimitive, registerPrimitive } from './primitive-registry';

/** EMA smoothing factor — higher = more weight on recent outcomes */
const ALPHA = 0.15;

/** Minimum sample count before success rate is considered reliable */
const MIN_SAMPLES = 3;

interface PrimitiveLearningRecord {
  totalExecutions: number;
  successes: number;
  failures: number;
  lastOutcome: boolean;
  lastUpdated: number;
}

const learningState = new Map<string, PrimitiveLearningRecord>();

/**
 * Record an execution outcome for a named primitive.
 * Updates the in-registry successRate via EMA.
 */
export function recordPrimitiveOutcome(name: string, success: boolean): void {
  const key = name.toLowerCase().trim();

  // Always track learning state, even for unregistered primitives

  // Update learning state
  const record = learningState.get(key) ?? {
    totalExecutions: 0,
    successes: 0,
    failures: 0,
    lastOutcome: true,
    lastUpdated: Date.now(),
  };

  record.totalExecutions++;
  if (success) record.successes++;
  else record.failures++;
  record.lastOutcome = success;
  record.lastUpdated = Date.now();
  learningState.set(key, record);

  // Compute EMA success rate
  const currentRate = existing.successRate ?? 0.5;
  const observation = success ? 1.0 : 0.0;
  const newRate = Math.round((currentRate * (1 - ALPHA) + observation * ALPHA) * 1000) / 1000;

  // Re-register with updated rate
  registerPrimitive({ ...existing, successRate: newRate });
}

/**
 * Get learning statistics for a primitive.
 */
export function getPrimitiveLearningStats(name: string): PrimitiveLearningRecord | null {
  return learningState.get(name.toLowerCase().trim()) ?? null;
}

/**
 * Check if a primitive has enough data to be considered reliable.
 */
export function isPrimitiveReliable(name: string): boolean {
  const record = learningState.get(name.toLowerCase().trim());
  if (!record) return false;
  return record.totalExecutions >= MIN_SAMPLES && (record.successes / record.totalExecutions) >= 0.6;
}

/**
 * Get all primitives ranked by success rate (descending).
 */
export function getRankedPrimitives(): Array<{ name: string; successRate: number; executions: number }> {
  const results: Array<{ name: string; successRate: number; executions: number }> = [];

  for (const [key, record] of learningState.entries()) {
    const def = getPrimitive(key);
    results.push({
      name: key,
      successRate: def?.successRate ?? 0.5,
      executions: record.totalExecutions,
    });
  }

  return results.sort((a, b) => b.successRate - a.successRate);
}

/**
 * Clear all learning state. Useful for testing.
 */
export function clearLearningState(): void {
  learningState.clear();
}
