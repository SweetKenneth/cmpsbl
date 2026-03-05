/**
 * Cross-Node Insight Sharing
 * Lateral sharing of validated heuristics between nodes.
 * Uses Gen-1 lineage tracking to prevent derivation chains from growing unbounded.
 */

import { emit } from '../events';

export interface SharedInsight {
  id: string;
  sourceNode: string;
  targetNodes: string[];
  insightType: 'heuristic' | 'pattern' | 'warning' | 'optimization';
  content: string;
  confidence: number;         // 0–1
  generation: number;         // Gen-0 = raw observation, Gen-1 = first derivation
  appliedBy: string[];        // Which nodes accepted the insight
  rejectedBy: string[];       // Which nodes rejected the insight
  sharedAt: string;
  expiresAt: string;          // Insights expire to prevent stale propagation
}

export interface InsightSharingConfig {
  maxGeneration: number;            // Max derivation depth (default 3)
  minConfidenceToShare: number;     // Minimum confidence to broadcast (default 0.7)
  insightTTLMs: number;            // Time-to-live for insights (default 24h)
  maxPendingInsights: number;      // Cap on pending insights per node
}

const DEFAULT_CONFIG: InsightSharingConfig = {
  maxGeneration: 3,
  minConfidenceToShare: 0.7,
  insightTTLMs: 24 * 60 * 60 * 1000, // 24 hours
  maxPendingInsights: 50,
};

const insightRegistry: SharedInsight[] = [];
const MAX_REGISTRY = 500;

let config = { ...DEFAULT_CONFIG };

/**
 * Share an insight from one node to target nodes.
 * Enforces generation cap and confidence threshold.
 */
export function shareInsight(
  sourceNode: string,
  targetNodes: string[],
  insightType: SharedInsight['insightType'],
  content: string,
  confidence: number,
  generation: number = 0,
): SharedInsight | null {
  const source = sourceNode.toUpperCase();
  const targets = targetNodes.map(t => t.toUpperCase());

  // Gate: generation depth
  if (generation > config.maxGeneration) {
    emit({
      module: source.toLowerCase(),
      event_type: 'insight_sharing_blocked',
      outcome: 'failed',
      data: { reason: 'generation_exceeded', generation, max: config.maxGeneration },
    });
    return null;
  }

  // Gate: confidence threshold
  if (confidence < config.minConfidenceToShare) {
    emit({
      module: source.toLowerCase(),
      event_type: 'insight_sharing_blocked',
      outcome: 'failed',
      data: { reason: 'confidence_below_threshold', confidence, threshold: config.minConfidenceToShare },
    });
    return null;
  }

  // Gate: pending insight cap
  const pendingForSource = insightRegistry.filter(
    i => i.sourceNode === source && i.appliedBy.length === 0 && i.rejectedBy.length === 0,
  );
  if (pendingForSource.length >= config.maxPendingInsights) {
    return null;
  }

  const now = Date.now();
  const insight: SharedInsight = {
    id: `ins-${now}-${Math.random().toString(36).slice(2, 8)}`,
    sourceNode: source,
    targetNodes: targets,
    insightType,
    content,
    confidence,
    generation,
    appliedBy: [],
    rejectedBy: [],
    sharedAt: new Date(now).toISOString(),
    expiresAt: new Date(now + config.insightTTLMs).toISOString(),
  };

  insightRegistry.push(insight);
  if (insightRegistry.length > MAX_REGISTRY) {
    insightRegistry.splice(0, insightRegistry.length - MAX_REGISTRY);
  }

  emit({
    module: source.toLowerCase(),
    event_type: 'insight_shared',
    outcome: 'succeeded',
    data: {
      insightId: insight.id,
      targetCount: targets.length,
      generation,
      confidence,
      type: insightType,
    },
  });

  return insight;
}

/**
 * Receive pending insights for a target node.
 * Returns non-expired, unapplied insights targeted at this node.
 */
export function receiveInsights(targetNode: string): SharedInsight[] {
  const target = targetNode.toUpperCase();
  const now = Date.now();

  return insightRegistry.filter(
    i =>
      i.targetNodes.includes(target) &&
      !i.appliedBy.includes(target) &&
      !i.rejectedBy.includes(target) &&
      new Date(i.expiresAt).getTime() > now,
  );
}

/**
 * Get the full insight registry (most recent first).
 */
export function getInsightRegistry(limit: number = 50): SharedInsight[] {
  return [...insightRegistry].reverse().slice(0, limit);
}
