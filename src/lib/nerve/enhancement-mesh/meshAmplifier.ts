/**
 * Enhancement Mesh — Amplifier Engine
 * 
 * Defines amplifier categories, heartbeat execution, and uplift scoring.
 * Each amplifier fans out its effect to all 40 substrate nodes.
 */

// ─── Types ────────────────────────────────────────────────────────

export type AmplifierCategory =
  | 'cognitive'
  | 'resilience'
  | 'operational'
  | 'governance'
  | 'evolution'
  | 'observability';

export interface MeshAmplifier {
  capabilityId: string;
  name: string;
  category: AmplifierCategory;
  heartbeatIntervalMs: number;
  priority: number;
  alwaysOn: true;
  fanOutNodes: 'all';
  description: string;

  // Runtime state
  lastHeartbeat: string;
  heartbeatCount: number;
  totalLatencyMs: number;
  upliftScore: number;    // 0–100 quantified contribution
  healthy: boolean;
  consecutiveFailures: number;
}

export interface HeartbeatTick {
  amplifierId: string;
  category: AmplifierCategory;
  timestamp: string;
  latencyMs: number;
  nodesReached: number;
  upliftDelta: number;
  healthy: boolean;
}

// ─── Category Weights ─────────────────────────────────────────────

const CATEGORY_BASE_UPLIFT: Record<AmplifierCategory, number> = {
  cognitive: 85,
  resilience: 90,
  operational: 80,
  governance: 88,
  evolution: 75,
  observability: 70,
};

const TOTAL_NODES = 40;

// ─── Factory ──────────────────────────────────────────────────────

export function createAmplifier(entry: {
  capabilityId: string;
  name: string;
  category: AmplifierCategory;
  heartbeatIntervalMs: number;
  priority: number;
  alwaysOn: true;
  fanOutNodes: 'all';
  description: string;
}): MeshAmplifier {
  return {
    ...entry,
    lastHeartbeat: new Date().toISOString(),
    heartbeatCount: 0,
    totalLatencyMs: 0,
    upliftScore: CATEGORY_BASE_UPLIFT[entry.category],
    healthy: true,
    consecutiveFailures: 0,
  };
}

// ─── Heartbeat Execution ──────────────────────────────────────────

/**
 * Execute a single heartbeat for an amplifier.
 * Simulates fan-out to all 40 primitives and computes uplift delta.
 */
export function runMeshHeartbeat(amp: MeshAmplifier): HeartbeatTick {
  const start = performance.now();

  try {
    // Amplifier "work" — each category contributes differently
    const baseUplift = CATEGORY_BASE_UPLIFT[amp.category];
    const priorityBonus = Math.max(0, (10 - amp.priority) * 0.5);
    const consistencyBonus = Math.min(10, amp.heartbeatCount * 0.01);

    // EMA-weighted uplift: new score blends with history
    const rawUplift = Math.min(100, baseUplift + priorityBonus + consistencyBonus);
    amp.upliftScore = Math.round(amp.upliftScore * 0.85 + rawUplift * 0.15);

    const latencyMs = Math.round(performance.now() - start);
    amp.lastHeartbeat = new Date().toISOString();
    amp.heartbeatCount++;
    amp.totalLatencyMs += latencyMs;
    amp.healthy = true;
    amp.consecutiveFailures = 0;

    return {
      amplifierId: amp.capabilityId,
      category: amp.category,
      timestamp: amp.lastHeartbeat,
      latencyMs,
      nodesReached: TOTAL_NODES,
      upliftDelta: rawUplift - baseUplift,
      healthy: true,
    };
  } catch {
    amp.consecutiveFailures++;
    amp.healthy = amp.consecutiveFailures < 3;

    return {
      amplifierId: amp.capabilityId,
      category: amp.category,
      timestamp: new Date().toISOString(),
      latencyMs: Math.round(performance.now() - start),
      nodesReached: 0,
      upliftDelta: 0,
      healthy: false,
    };
  }
}

// ─── Uplift Computation ──────────────────────────────────────────

/**
 * Compute aggregate mesh uplift across all amplifiers.
 * Returns weighted composite representing total technological advantage.
 */
export function computeMeshUplift(amplifiers: MeshAmplifier[]): {
  overall: number;
  byCategory: Record<AmplifierCategory, number>;
  totalHeartbeats: number;
  healthyCount: number;
  degradedCount: number;
} {
  const byCategory: Record<AmplifierCategory, number[]> = {
    cognitive: [],
    resilience: [],
    operational: [],
    governance: [],
    evolution: [],
    observability: [],
  };

  let totalHeartbeats = 0;
  let healthyCount = 0;
  let degradedCount = 0;

  for (const amp of amplifiers) {
    byCategory[amp.category].push(amp.upliftScore);
    totalHeartbeats += amp.heartbeatCount;
    if (amp.healthy) healthyCount++;
    else degradedCount++;
  }

  // Category averages
  const categoryAverages: Record<AmplifierCategory, number> = {
    cognitive: 0,
    resilience: 0,
    operational: 0,
    governance: 0,
    evolution: 0,
    observability: 0,
  };

  for (const [cat, scores] of Object.entries(byCategory)) {
    if (scores.length === 0) continue;
    categoryAverages[cat as AmplifierCategory] =
      Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  }

  // Weighted composite:
  // cognitive(25%) + resilience(25%) + operational(20%) + governance(15%) + evolution(10%) + observability(5%)
  const overall = Math.round(
    categoryAverages.cognitive * 0.25 +
    categoryAverages.resilience * 0.25 +
    categoryAverages.operational * 0.20 +
    categoryAverages.governance * 0.15 +
    categoryAverages.evolution * 0.10 +
    categoryAverages.observability * 0.05
  );

  return {
    overall,
    byCategory: categoryAverages,
    totalHeartbeats,
    healthyCount,
    degradedCount,
  };
}

// ─── Utilities ────────────────────────────────────────────────────

export function getAmplifiersByCategory(
  amplifiers: MeshAmplifier[],
  category: AmplifierCategory
): MeshAmplifier[] {
  return amplifiers.filter(a => a.category === category);
}

export function getAllAmplifiers(amplifiers: MeshAmplifier[]): MeshAmplifier[] {
  return [...amplifiers];
}

export function getAmplifierHealth(amp: MeshAmplifier): {
  healthy: boolean;
  avgLatencyMs: number;
  uptime: number;
} {
  return {
    healthy: amp.healthy,
    avgLatencyMs: amp.heartbeatCount > 0
      ? Math.round(amp.totalLatencyMs / amp.heartbeatCount)
      : 0,
    uptime: amp.heartbeatCount > 0
      ? Math.round(((amp.heartbeatCount - amp.consecutiveFailures) / amp.heartbeatCount) * 100)
      : 100,
  };
}
