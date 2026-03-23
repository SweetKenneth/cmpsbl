/**
 * INTENT Ultimate — System 5: Priority Arbitration Matrix
 * 
 * When multiple intents compete, arbitrates: urgency scoring, resource-awareness,
 * dependency ordering, and starvation prevention.
 * 
 * @module intent/ultimate/priorityArbitrator
 */

// ── Types ────────────────────────────────────────────────────────

export type UrgencyLevel = 'critical' | 'high' | 'normal' | 'low' | 'background';

export interface QueuedIntent {
  id: string;
  intentType: string;
  sourceModule: string;
  urgency: UrgencyLevel;
  priority: number; // Computed composite score (0-100)
  enqueuedAt: string;
  waitTimeMs: number;
  resourceCost: number; // Estimated resource units (1-10)
  dependencies: string[]; // Other intent IDs this depends on
  starved: boolean;
  executedAt?: string;
}

export interface ArbitrationResult {
  ordered: QueuedIntent[];
  deferred: QueuedIntent[];
  starvedPromoted: number;
  totalInQueue: number;
  arbitratedAt: string;
}

// ── Constants ────────────────────────────────────────────────────

const URGENCY_WEIGHTS: Record<UrgencyLevel, number> = {
  critical:   100,
  high:       75,
  normal:     50,
  low:        25,
  background: 10,
};

const STARVATION_THRESHOLD_MS = 30_000; // 30s without execution
const MAX_CONCURRENT = 5;
const RESOURCE_BUDGET = 20; // Max resource units in flight

// ── State ────────────────────────────────────────────────────────

const intentQueue: QueuedIntent[] = [];
const executionLog: Array<{ intentId: string; completedAt: string }> = [];
const MAX_LOG = 500;

// ── Priority Scoring ─────────────────────────────────────────────

function computePriority(intent: QueuedIntent): number {
  const urgencyScore = URGENCY_WEIGHTS[intent.urgency];
  const waitBonus = Math.min(20, intent.waitTimeMs / 5000); // Up to +20 for waiting
  const starvationBonus = intent.starved ? 30 : 0;
  const costPenalty = intent.resourceCost * 2; // Expensive intents get slight penalty

  return Math.min(100, Math.round(urgencyScore + waitBonus + starvationBonus - costPenalty));
}

function updateWaitTimes(): void {
  const now = Date.now();
  for (const intent of intentQueue) {
    intent.waitTimeMs = now - new Date(intent.enqueuedAt).getTime();
    intent.starved = intent.waitTimeMs > STARVATION_THRESHOLD_MS;
    intent.priority = computePriority(intent);
  }
}

// ── Core API ────────────────────────────────────────────────────

/** Enqueue an intent for arbitration */
export function enqueueIntent(
  intentType: string,
  sourceModule: string,
  urgency: UrgencyLevel = 'normal',
  resourceCost: number = 3,
  dependencies: string[] = [],
): QueuedIntent {
  const intent: QueuedIntent = {
    id: crypto.randomUUID(),
    intentType,
    sourceModule,
    urgency,
    priority: URGENCY_WEIGHTS[urgency],
    enqueuedAt: new Date().toISOString(),
    waitTimeMs: 0,
    resourceCost: Math.max(1, Math.min(10, resourceCost)),
    dependencies,
    starved: false,
  };

  intentQueue.push(intent);
  return intent;
}

/** Arbitrate the queue and return execution order */
export function arbitrate(): ArbitrationResult {
  updateWaitTimes();

  // Sort by priority (highest first)
  const sorted = [...intentQueue].sort((a, b) => b.priority - a.priority);

  const ordered: QueuedIntent[] = [];
  const deferred: QueuedIntent[] = [];
  let resourcesUsed = 0;
  let starvedPromoted = 0;
  const selectedIds = new Set<string>();

  for (const intent of sorted) {
    // Check dependency satisfaction
    const depsSatisfied = intent.dependencies.every(depId => {
      return executionLog.some(l => l.intentId === depId) || selectedIds.has(depId);
    });

    if (!depsSatisfied) {
      deferred.push(intent);
      continue;
    }

    // Check resource budget
    if (ordered.length >= MAX_CONCURRENT || resourcesUsed + intent.resourceCost > RESOURCE_BUDGET) {
      // Exception: starved intents bypass resource limits
      if (intent.starved) {
        ordered.push(intent);
        selectedIds.add(intent.id);
        resourcesUsed += intent.resourceCost;
        starvedPromoted++;
      } else {
        deferred.push(intent);
      }
      continue;
    }

    ordered.push(intent);
    selectedIds.add(intent.id);
    resourcesUsed += intent.resourceCost;
    if (intent.starved) starvedPromoted++;
  }

  return {
    ordered,
    deferred,
    starvedPromoted,
    totalInQueue: intentQueue.length,
    arbitratedAt: new Date().toISOString(),
  };
}

/** Mark an intent as executed (remove from queue) */
export function markExecuted(intentId: string): void {
  const idx = intentQueue.findIndex(i => i.id === intentId);
  if (idx >= 0) {
    const intent = intentQueue.splice(idx, 1)[0];
    intent.executedAt = new Date().toISOString();
    executionLog.push({ intentId: intent.id, completedAt: intent.executedAt });
    if (executionLog.length > MAX_LOG) executionLog.splice(0, executionLog.length - MAX_LOG);
  }
}

/** Get current queue */
export function getQueue(): QueuedIntent[] {
  updateWaitTimes();
  return [...intentQueue].sort((a, b) => b.priority - a.priority);
}

/** Get arbitrator health */
export function getArbitratorHealth() {
  updateWaitTimes();
  const starved = intentQueue.filter(i => i.starved).length;
  return {
    queueDepth: intentQueue.length,
    starvedIntents: starved,
    avgWaitMs: intentQueue.length > 0
      ? Math.round(intentQueue.reduce((s, i) => s + i.waitTimeMs, 0) / intentQueue.length)
      : 0,
    totalExecuted: executionLog.length,
    resourceBudget: RESOURCE_BUDGET,
    maxConcurrent: MAX_CONCURRENT,
  };
}

/** Reset */
export function resetArbitrator(): void {
  intentQueue.length = 0;
  executionLog.length = 0;
}
