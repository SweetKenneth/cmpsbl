/**
 * CMPSBL® DREAM — Subconscious Priority Queue
 * Prioritizes memory pairs for dream synthesis based on knowledge gap urgency
 * and cross-module demand signals.
 */

export interface PriorityItem {
  id: string;
  memoryId: string;
  domain: string;
  priority: number; // higher = more urgent
  demandSignals: DemandSignal[];
  enqueuedAt: string;
  processedAt: string | null;
}

export interface DemandSignal {
  sourceModule: string;
  signalType: 'knowledge_gap' | 'error_pattern' | 'optimization_hint' | 'user_request';
  urgency: number; // 1-10
  description: string;
  timestamp: string;
}

// Min-heap-like priority queue (sorted array, bounded)
const MAX_QUEUE_SIZE = 500;
const queue: PriorityItem[] = [];
const demandAccumulator = new Map<string, DemandSignal[]>(); // domain → signals

/**
 * Emit a demand signal from any module
 */
export function emitDemandSignal(signal: DemandSignal, targetDomain: string): void {
  const signals = demandAccumulator.get(targetDomain) || [];
  signals.push(signal);
  if (signals.length > 50) signals.shift();
  demandAccumulator.set(targetDomain, signals);

  // Boost priority of queued items matching this domain
  for (const item of queue) {
    if (item.domain === targetDomain) {
      item.priority += signal.urgency * 0.5;
      item.demandSignals.push(signal);
    }
  }

  // Re-sort
  queue.sort((a, b) => b.priority - a.priority);
}

/**
 * Enqueue a memory for dream processing
 */
export function enqueue(
  memoryId: string,
  domain: string,
  basePriority: number = 5
): PriorityItem {
  // Check if already queued
  const existing = queue.find(q => q.memoryId === memoryId);
  if (existing) {
    existing.priority = Math.max(existing.priority, basePriority);
    queue.sort((a, b) => b.priority - a.priority);
    return existing;
  }

  // Incorporate accumulated demand signals
  const domainSignals = demandAccumulator.get(domain) || [];
  const demandBoost = domainSignals.reduce((sum, s) => sum + s.urgency * 0.3, 0);

  const item: PriorityItem = {
    id: `pq_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 5)}`,
    memoryId,
    domain,
    priority: basePriority + demandBoost,
    demandSignals: [...domainSignals.slice(-5)],
    enqueuedAt: new Date().toISOString(),
    processedAt: null,
  };

  queue.push(item);
  queue.sort((a, b) => b.priority - a.priority);

  // Cap size
  if (queue.length > MAX_QUEUE_SIZE) {
    queue.splice(MAX_QUEUE_SIZE);
  }

  return item;
}

/**
 * Dequeue the highest-priority item
 */
export function dequeue(): PriorityItem | null {
  const item = queue.shift();
  if (item) {
    item.processedAt = new Date().toISOString();
  }
  return item || null;
}

/**
 * Dequeue a batch of top-priority items
 */
export function dequeueBatch(count: number): PriorityItem[] {
  const batch = queue.splice(0, count);
  const now = new Date().toISOString();
  for (const item of batch) {
    item.processedAt = now;
  }
  return batch;
}

/**
 * Peek at top items without removing
 */
export function peek(count: number = 5): PriorityItem[] {
  return queue.slice(0, count);
}

/**
 * Get queue stats
 */
export function getQueueStats(): {
  size: number;
  avgPriority: number;
  topDomains: Array<{ domain: string; count: number; avgPriority: number }>;
  pendingDemandSignals: number;
} {
  const domainMap = new Map<string, { count: number; totalPriority: number }>();
  let totalPriority = 0;

  for (const item of queue) {
    totalPriority += item.priority;
    const d = domainMap.get(item.domain) || { count: 0, totalPriority: 0 };
    d.count++;
    d.totalPriority += item.priority;
    domainMap.set(item.domain, d);
  }

  const topDomains = Array.from(domainMap.entries())
    .map(([domain, stats]) => ({
      domain,
      count: stats.count,
      avgPriority: Math.round((stats.totalPriority / stats.count) * 10) / 10,
    }))
    .sort((a, b) => b.avgPriority - a.avgPriority)
    .slice(0, 5);

  let totalSignals = 0;
  for (const signals of demandAccumulator.values()) {
    totalSignals += signals.length;
  }

  return {
    size: queue.length,
    avgPriority: queue.length > 0 ? Math.round((totalPriority / queue.length) * 10) / 10 : 0,
    topDomains,
    pendingDemandSignals: totalSignals,
  };
}
