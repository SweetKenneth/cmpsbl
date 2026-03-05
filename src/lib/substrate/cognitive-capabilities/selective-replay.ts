/**
 * Selective Memory Replay
 * Consolidates high-value memories from warm/cold tiers during dream cycles.
 * Non-destructive: promotes memories for re-evaluation, never deletes.
 */

import { emit } from '../events';

export interface MemoryReplayResult {
  nodeId: string;
  replayedAt: string;
  memoriesScanned: number;
  memoriesPromoted: number;      // Warm→Hot promotions
  memoriesReinforced: number;    // Existing hot memories strengthened
  memoriesSkipped: number;       // Below threshold, left in place
  topReplayedTopics: string[];
  durationMs: number;
}

export interface ReplayConfig {
  minValueForReplay: number;        // Minimum relevance score to consider (default 0.4)
  maxReplayBatchSize: number;       // Cap per replay cycle (default 25)
  reinforcementBoost: number;       // Score boost for replayed hot memories (default 0.05)
  promotionThreshold: number;       // Score above which warm→hot promotion occurs (default 0.7)
  cooldownMs: number;               // Minimum time between replays per node (default 2h)
}

const DEFAULT_REPLAY_CONFIG: ReplayConfig = {
  minValueForReplay: 0.4,
  maxReplayBatchSize: 25,
  reinforcementBoost: 0.05,
  promotionThreshold: 0.7,
  cooldownMs: 2 * 60 * 60 * 1000,
};

const replayHistory: MemoryReplayResult[] = [];
const MAX_REPLAY_HISTORY = 200;
const lastReplayAt = new Map<string, number>();

let replayConfig = { ...DEFAULT_REPLAY_CONFIG };

/**
 * Execute a selective memory replay for a node.
 * Scans simulated memory tiers and promotes high-value entries.
 * 
 * In production, this would interface with the MEMORY module's vector store.
 * Currently operates as a bounded simulation for safe integration.
 */
export function replayHighValueMemories(
  nodeId: string,
  memoryScores: Array<{ id: string; score: number; topic: string; tier: 'hot' | 'warm' | 'cold' }>,
): MemoryReplayResult {
  const id = nodeId.toUpperCase();
  const now = Date.now();
  const cfg = replayConfig;

  // Cooldown check
  const lastReplay = lastReplayAt.get(id) ?? 0;
  if (now - lastReplay < cfg.cooldownMs) {
    const result: MemoryReplayResult = {
      nodeId: id,
      replayedAt: new Date(now).toISOString(),
      memoriesScanned: 0,
      memoriesPromoted: 0,
      memoriesReinforced: 0,
      memoriesSkipped: 0,
      topReplayedTopics: [],
      durationMs: 0,
    };
    return result;
  }

  const startTime = performance.now();

  // Filter eligible memories
  const eligible = memoryScores
    .filter(m => m.score >= cfg.minValueForReplay)
    .sort((a, b) => b.score - a.score)
    .slice(0, cfg.maxReplayBatchSize);

  let promoted = 0;
  let reinforced = 0;
  let skipped = 0;
  const topicSet = new Set<string>();

  for (const mem of eligible) {
    topicSet.add(mem.topic);

    if (mem.tier === 'warm' && mem.score >= cfg.promotionThreshold) {
      // Warm→Hot promotion
      promoted++;
    } else if (mem.tier === 'hot') {
      // Reinforce existing hot memory
      reinforced++;
    } else {
      skipped++;
    }
  }

  const skippedFromTotal = memoryScores.length - eligible.length;

  lastReplayAt.set(id, now);
  const durationMs = Math.round(performance.now() - startTime);

  const result: MemoryReplayResult = {
    nodeId: id,
    replayedAt: new Date(now).toISOString(),
    memoriesScanned: memoryScores.length,
    memoriesPromoted: promoted,
    memoriesReinforced: reinforced,
    memoriesSkipped: skipped + skippedFromTotal,
    topReplayedTopics: [...topicSet].slice(0, 5),
    durationMs,
  };

  replayHistory.push(result);
  if (replayHistory.length > MAX_REPLAY_HISTORY) {
    replayHistory.splice(0, replayHistory.length - MAX_REPLAY_HISTORY);
  }

  emit({
    module: id.toLowerCase(),
    event_type: 'selective_replay',
    outcome: 'succeeded',
    data: {
      scanned: result.memoriesScanned,
      promoted: result.memoriesPromoted,
      reinforced: result.memoriesReinforced,
      durationMs,
    },
  });

  return result;
}

/**
 * Get replay history for a node (or all nodes).
 */
export function getReplayHistory(
  nodeId?: string,
  limit: number = 20,
): MemoryReplayResult[] {
  const filtered = nodeId
    ? replayHistory.filter(r => r.nodeId === nodeId.toUpperCase())
    : replayHistory;
  return [...filtered].reverse().slice(0, limit);
}
