/**
 * CMPSBL® BRAIN — Hebbian Pathway Strengthening
 * "Neurons that fire together wire together"
 *
 * Tracks co-access patterns between memories and strengthens neural pathways.
 * Uses exponential moving average for pathway weight updates.
 * Integrates with associativeGraph for structural reinforcement.
 */

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export interface Pathway {
  id: string;
  nodes: string[];            // ordered memory IDs in the pathway
  weight: number;             // 0-1, EMA-smoothed
  activations: number;
  lastActivated: number;
  avgLatencyMs: number;       // average recall time along this pathway
  category: string;
}

export interface PathwayStats {
  totalPathways: number;
  strongPathways: number;     // weight > 0.5
  avgWeight: number;
  mostUsedPathway: string | null;
}

// ═══════════════════════════════════════════════════════════════════════════════
// ENGINE
// ═══════════════════════════════════════════════════════════════════════════════

const MAX_PATHWAYS = 2000;
const EMA_ALPHA = 0.15;       // smoothing factor for weight updates
const DECAY_RATE = 0.001;     // per-hour decay
const MIN_WEIGHT = 0.01;

class HebbianEngine {
  private pathways = new Map<string, Pathway>();
  private accessLog: Array<{ memoryId: string; timestamp: number }> = [];
  private windowMs = 5000;    // co-activation window (5 seconds)

  /**
   * Record a memory access. If other memories were accessed within
   * the co-activation window, strengthen the pathway between them.
   */
  recordAccess(memoryId: string, category: string = 'general', latencyMs: number = 0): string[] {
    const now = Date.now();

    // Find co-activated memories within the window
    const coActivated = this.accessLog
      .filter(a => now - a.timestamp < this.windowMs && a.memoryId !== memoryId)
      .map(a => a.memoryId);

    // Add to rolling log (bounded)
    this.accessLog.push({ memoryId, timestamp: now });
    if (this.accessLog.length > 200) this.accessLog = this.accessLog.slice(-100);

    // Strengthen pathways for each co-activated pair
    const strengthened: string[] = [];
    for (const coId of coActivated) {
      const pathId = this.strengthenPathway([memoryId, coId], category, latencyMs);
      strengthened.push(pathId);
    }

    return strengthened;
  }

  /**
   * Explicitly strengthen a pathway between ordered memory nodes.
   */
  strengthenPathway(nodes: string[], category: string = 'general', latencyMs: number = 0): string {
    const id = nodes.sort().join('→');
    const existing = this.pathways.get(id);

    if (existing) {
      // EMA weight update: w = α * 1.0 + (1 - α) * w_prev
      existing.weight = Math.min(1, EMA_ALPHA + (1 - EMA_ALPHA) * existing.weight);
      existing.activations++;
      existing.lastActivated = Date.now();
      existing.avgLatencyMs = EMA_ALPHA * latencyMs + (1 - EMA_ALPHA) * existing.avgLatencyMs;
    } else {
      this.pathways.set(id, {
        id,
        nodes,
        weight: EMA_ALPHA,
        activations: 1,
        lastActivated: Date.now(),
        avgLatencyMs: latencyMs,
        category,
      });
    }

    this.enforceCapacity();
    return id;
  }

  /**
   * Get strongest pathways from a memory (for predictive pre-fetch).
   */
  getStrongestPathways(memoryId: string, limit: number = 10): Pathway[] {
    const result: Pathway[] = [];
    for (const pw of this.pathways.values()) {
      if (pw.nodes.includes(memoryId)) result.push(pw);
    }
    result.sort((a, b) => b.weight - a.weight);
    return result.slice(0, limit);
  }

  /**
   * Predict next memories likely to be accessed based on pathway strength.
   * Returns memory IDs sorted by predicted probability.
   */
  predictNext(currentMemoryId: string, limit: number = 5): Array<{ memoryId: string; probability: number }> {
    const pathways = this.getStrongestPathways(currentMemoryId, 20);
    const predictions = new Map<string, number>();

    for (const pw of pathways) {
      for (const nodeId of pw.nodes) {
        if (nodeId === currentMemoryId) continue;
        const current = predictions.get(nodeId) || 0;
        predictions.set(nodeId, Math.max(current, pw.weight));
      }
    }

    return [...predictions.entries()]
      .map(([memoryId, probability]) => ({ memoryId, probability }))
      .sort((a, b) => b.probability - a.probability)
      .slice(0, limit);
  }

  /**
   * Apply temporal decay to all pathways.
   */
  applyDecay(): number {
    const now = Date.now();
    let pruned = 0;

    for (const [id, pw] of this.pathways) {
      const hoursSince = (now - pw.lastActivated) / 3600000;
      pw.weight *= Math.exp(-DECAY_RATE * hoursSince);

      if (pw.weight < MIN_WEIGHT) {
        this.pathways.delete(id);
        pruned++;
      }
    }

    return pruned;
  }

  /** Get stats */
  getStats(): PathwayStats {
    let totalWeight = 0;
    let strongCount = 0;
    let mostUsed: Pathway | null = null;

    for (const pw of this.pathways.values()) {
      totalWeight += pw.weight;
      if (pw.weight > 0.5) strongCount++;
      if (!mostUsed || pw.activations > mostUsed.activations) mostUsed = pw;
    }

    return {
      totalPathways: this.pathways.size,
      strongPathways: strongCount,
      avgWeight: this.pathways.size > 0 ? totalWeight / this.pathways.size : 0,
      mostUsedPathway: mostUsed?.id || null,
    };
  }

  /** Set co-activation window (ms) */
  setWindow(ms: number): void { this.windowMs = Math.max(1000, Math.min(30000, ms)); }

  clear(): void {
    this.pathways.clear();
    this.accessLog = [];
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// SINGLETON
// ═══════════════════════════════════════════════════════════════════════════════

let _engine: HebbianEngine | null = null;

export function getHebbianEngine(): HebbianEngine {
  if (!_engine) _engine = new HebbianEngine();
  return _engine;
}

export function resetHebbianEngine(): void {
  _engine = null;
}
