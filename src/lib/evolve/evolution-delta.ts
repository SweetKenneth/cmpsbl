/**
 * Evolution Delta Computation Engine
 * Computes structured deltas between pre and post evolution metrics
 */

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

export interface EvolutionMetrics {
  health_score: number;
  audit_percent: number;
  debt_flags_count: number;
  open_circuit_count: number;
  memory_total_vectors: number;
  entropy_score: number;
}

export interface EvolutionDelta {
  health_delta: number;
  audit_delta: number;
  debt_delta: number;
  circuit_delta: number;
  memory_growth_delta: number;
  entropy_delta: number;
  net_improvement: boolean;
  computed_at: string;
}

// ═══════════════════════════════════════════════════════════════
// DELTA COMPUTATION
// ═══════════════════════════════════════════════════════════════

/**
 * Compute structured delta between pre and post evolution metrics
 */
export function computeEvolutionDelta(
  pre: EvolutionMetrics,
  post: EvolutionMetrics
): EvolutionDelta {
  const health_delta = post.health_score - pre.health_score;
  const audit_delta = post.audit_percent - pre.audit_percent;
  const debt_delta = post.debt_flags_count - pre.debt_flags_count;
  const circuit_delta = post.open_circuit_count - pre.open_circuit_count;
  const memory_growth_delta = post.memory_total_vectors - pre.memory_total_vectors;
  const entropy_delta = post.entropy_score - pre.entropy_score;

  // Net improvement: health up, debt down, entropy stable or down
  const net_improvement =
    health_delta >= 0 &&
    debt_delta <= 0 &&
    entropy_delta <= 0.1; // Allow small entropy increase

  return {
    health_delta,
    audit_delta,
    debt_delta,
    circuit_delta,
    memory_growth_delta,
    entropy_delta,
    net_improvement,
    computed_at: new Date().toISOString(),
  };
}

/**
 * Create empty metrics (zero state)
 */
export function createEmptyMetrics(): EvolutionMetrics {
  return {
    health_score: 0,
    audit_percent: 0,
    debt_flags_count: 0,
    open_circuit_count: 0,
    memory_total_vectors: 0,
    entropy_score: 0,
  };
}

/**
 * Extract metrics from a scan result
 */
export function extractMetricsFromScan(scanResult: {
  system_snapshot?: { health_overall?: number };
  code_health?: { stability_score?: number };
  system_state?: {
    circuit_states?: { evolution_circuit?: string };
    detected_anomalies?: unknown[];
  };
  edge_analysis?: { risk_flags?: unknown[] };
  proposals?: unknown[];
}): EvolutionMetrics {
  const health = scanResult.system_snapshot?.health_overall ?? scanResult.code_health?.stability_score ?? 0;
  const circuitOpen = scanResult.system_state?.circuit_states?.evolution_circuit === 'open' ? 1 : 0;
  const anomalyCount = scanResult.system_state?.detected_anomalies?.length ?? 0;
  const riskCount = scanResult.edge_analysis?.risk_flags?.length ?? 0;
  const proposalCount = scanResult.proposals?.length ?? 0;

  // Entropy = normalized measure of system disorder
  const entropy = Math.min(1, (anomalyCount * 0.15 + riskCount * 0.1 + proposalCount * 0.05));

  return {
    health_score: health,
    audit_percent: health > 0 ? Math.min(100, health * 1.05) : 0,
    debt_flags_count: riskCount + proposalCount,
    open_circuit_count: circuitOpen,
    memory_total_vectors: 0, // Populated by caller if available
    entropy_score: entropy,
  };
}

/**
 * Validate that a delta meets completion requirements
 */
export function isDeltaValid(delta: EvolutionDelta): boolean {
  return (
    typeof delta.health_delta === 'number' &&
    typeof delta.entropy_delta === 'number' &&
    typeof delta.computed_at === 'string' &&
    delta.computed_at.length > 0
  );
}
