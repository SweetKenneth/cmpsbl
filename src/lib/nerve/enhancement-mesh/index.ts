/**
 * Enhancement Mesh v1.0.0 — "Ambient Intelligence Fabric"
 * 
 * Always-on substrate amplification layer.
 * 30 capabilities that run continuously on heartbeat intervals,
 * providing passive technological uplift to all 40 primitives.
 * 
 * Unlike activation rules (event-triggered), mesh amplifiers are
 * structurally always-active and cannot be disabled by governance modes.
 */

import { 
  type MeshAmplifier, 
  type AmplifierCategory,
  createAmplifier,
  runMeshHeartbeat,
  computeMeshUplift,
  getAmplifiersByCategory,
  getAllAmplifiers,
} from './meshAmplifier';

import {
  recordMeshTick,
  getMeshHealth,
  getMeshTelemetry,
  type MeshHealthReport,
} from './meshTelemetry';

// ─── Mesh Configuration ───────────────────────────────────────────

export interface EnhancementMeshEntry {
  capabilityId: string;
  name: string;
  category: AmplifierCategory;
  heartbeatIntervalMs: number;
  priority: number;       // 1 (highest) – 10 (lowest)
  alwaysOn: true;
  fanOutNodes: 'all';     // Always fans out to all 40 primitives
  description: string;
}

/**
 * The 30 always-on Enhancement Mesh capabilities.
 */
export const ENHANCEMENT_MESH_ENTRIES: EnhancementMeshEntry[] = [
  // ── Cognitive Amplifiers (7) ──────────────────────────────────
  {
    capabilityId: 'context_aware_memory_recall',
    name: 'Context-Aware Memory Recall',
    category: 'cognitive',
    heartbeatIntervalMs: 60_000,
    priority: 1,
    alwaysOn: true,
    fanOutNodes: 'all',
    description: 'Ambient context enrichment for every interaction across all nodes',
  },
  {
    capabilityId: 'semantic_similarity_ranker',
    name: 'Semantic Similarity Ranker',
    category: 'cognitive',
    heartbeatIntervalMs: 60_000,
    priority: 1,
    alwaysOn: true,
    fanOutNodes: 'all',
    description: 'Continuous semantic index maintenance for instant retrieval',
  },
  {
    capabilityId: 'knowledge_graph_navigator',
    name: 'Knowledge Graph Navigator',
    category: 'cognitive',
    heartbeatIntervalMs: 60_000,
    priority: 2,
    alwaysOn: true,
    fanOutNodes: 'all',
    description: 'Passive Hebbian pathway strengthening across knowledge structures',
  },
  {
    capabilityId: 'temporal_memory_scoring',
    name: 'Temporal Memory Scoring',
    category: 'cognitive',
    heartbeatIntervalMs: 60_000,
    priority: 2,
    alwaysOn: true,
    fanOutNodes: 'all',
    description: 'Time-weighted relevance scoring that stays fresh without triggers',
  },
  {
    capabilityId: 'cognitive_load_balancer',
    name: 'Cognitive Load Balancer',
    category: 'cognitive',
    heartbeatIntervalMs: 60_000,
    priority: 1,
    alwaysOn: true,
    fanOutNodes: 'all',
    description: 'Continuous reasoning distribution across cognitive subsystems',
  },
  {
    capabilityId: 'pattern_fusion_synthesis',
    name: 'Pattern Fusion Synthesis',
    category: 'cognitive',
    heartbeatIntervalMs: 60_000,
    priority: 3,
    alwaysOn: true,
    fanOutNodes: 'all',
    description: 'Cross-domain pattern matching running as ambient background process',
  },
  {
    capabilityId: 'adaptive_learning_personalization',
    name: 'Adaptive Learning Personalization',
    category: 'cognitive',
    heartbeatIntervalMs: 60_000,
    priority: 2,
    alwaysOn: true,
    fanOutNodes: 'all',
    description: 'Continuous user model refinement and personalization adaptation',
  },

  // ── Resilience Amplifiers (6) ─────────────────────────────────
  {
    capabilityId: 'fault_boundary_orchestrator',
    name: 'Fault Boundary Orchestrator',
    category: 'resilience',
    heartbeatIntervalMs: 60_000,
    priority: 1,
    alwaysOn: true,
    fanOutNodes: 'all',
    description: 'Continuous fault isolation — never sleeps, always ready',
  },
  {
    capabilityId: 'graceful_degradation_chain',
    name: 'Graceful Degradation Chain',
    category: 'resilience',
    heartbeatIntervalMs: 60_000,
    priority: 1,
    alwaysOn: true,
    fanOutNodes: 'all',
    description: 'Fallback paths pre-computed continuously for instant activation',
  },
  {
    capabilityId: 'realtime_security_hardening',
    name: 'Realtime Security Hardening',
    category: 'resilience',
    heartbeatIntervalMs: 60_000,
    priority: 1,
    alwaysOn: true,
    fanOutNodes: 'all',
    description: 'Security posture is always-on by nature — continuous hardening',
  },
  {
    capabilityId: 'resilience_orchestration',
    name: 'Resilience Orchestration',
    category: 'resilience',
    heartbeatIntervalMs: 60_000,
    priority: 1,
    alwaysOn: true,
    fanOutNodes: 'all',
    description: 'Self-healing readiness requiring continuous monitoring',
  },
  {
    capabilityId: 'distributed_lock_coordinator',
    name: 'Distributed Lock Coordinator',
    category: 'resilience',
    heartbeatIntervalMs: 60_000,
    priority: 2,
    alwaysOn: true,
    fanOutNodes: 'all',
    description: 'Structural deadlock prevention — not event-driven, always active',
  },
  {
    capabilityId: 'behavioral_drift_detection',
    name: 'Behavioral Drift Detection',
    category: 'resilience',
    heartbeatIntervalMs: 60_000,
    priority: 2,
    alwaysOn: true,
    fanOutNodes: 'all',
    description: 'Anomaly baselines updated continuously for drift detection',
  },

  // ── Operational Amplifiers (5) ────────────────────────────────
  {
    capabilityId: 'priority_queue_optimizer',
    name: 'Priority Queue Optimizer',
    category: 'operational',
    heartbeatIntervalMs: 120_000,
    priority: 2,
    alwaysOn: true,
    fanOutNodes: 'all',
    description: 'Constant task prioritization and queue optimization',
  },
  {
    capabilityId: 'provider_health_router',
    name: 'Provider Health Router',
    category: 'operational',
    heartbeatIntervalMs: 120_000,
    priority: 1,
    alwaysOn: true,
    fanOutNodes: 'all',
    description: 'Ambient provider scoring for instant routing decisions',
  },
  {
    capabilityId: 'event_correlation_engine',
    name: 'Event Correlation Engine',
    category: 'operational',
    heartbeatIntervalMs: 120_000,
    priority: 2,
    alwaysOn: true,
    fanOutNodes: 'all',
    description: 'Continuous event linking — no gaps in correlation',
  },
  {
    capabilityId: 'message_deduplication_guard',
    name: 'Message Deduplication Guard',
    category: 'operational',
    heartbeatIntervalMs: 120_000,
    priority: 1,
    alwaysOn: true,
    fanOutNodes: 'all',
    description: 'Structural deduplication infrastructure — always watching',
  },
  {
    capabilityId: 'latency_prediction_engine',
    name: 'Latency Prediction Engine',
    category: 'operational',
    heartbeatIntervalMs: 120_000,
    priority: 3,
    alwaysOn: true,
    fanOutNodes: 'all',
    description: 'Latency models requiring continuous data feed',
  },

  // ── Governance Amplifiers (4) ─────────────────────────────────
  {
    capabilityId: 'ethical_guardrails',
    name: 'Ethical Guardrails',
    category: 'governance',
    heartbeatIntervalMs: 180_000,
    priority: 1,
    alwaysOn: true,
    fanOutNodes: 'all',
    description: 'Non-negotiably always-on ethics evaluation across all operations',
  },
  {
    capabilityId: 'compliance_drift_detector',
    name: 'Compliance Drift Detector',
    category: 'governance',
    heartbeatIntervalMs: 180_000,
    priority: 2,
    alwaysOn: true,
    fanOutNodes: 'all',
    description: 'Continuous compliance baseline monitoring for drift',
  },
  {
    capabilityId: 'evolution_confidence_scoring',
    name: 'Evolution Confidence Scoring',
    category: 'governance',
    heartbeatIntervalMs: 180_000,
    priority: 2,
    alwaysOn: true,
    fanOutNodes: 'all',
    description: 'Pre-computed risk assessment for evolution proposals',
  },
  {
    capabilityId: 'predictive_issue_prevention',
    name: 'Predictive Issue Prevention',
    category: 'governance',
    heartbeatIntervalMs: 180_000,
    priority: 1,
    alwaysOn: true,
    fanOutNodes: 'all',
    description: 'Proactive issue detection — loses value if paused',
  },

  // ── Evolution Amplifiers (4) ──────────────────────────────────
  {
    capabilityId: 'continuous_improvement_engine',
    name: 'Continuous Improvement Engine',
    category: 'evolution',
    heartbeatIntervalMs: 300_000,
    priority: 2,
    alwaysOn: true,
    fanOutNodes: 'all',
    description: 'Self-improvement should never idle — always refining',
  },
  {
    capabilityId: 'active_learning_triggers',
    name: 'Active Learning Triggers',
    category: 'evolution',
    heartbeatIntervalMs: 300_000,
    priority: 3,
    alwaysOn: true,
    fanOutNodes: 'all',
    description: 'Continuous knowledge gap detection and learning opportunities',
  },
  {
    capabilityId: 'hypothesis_validation',
    name: 'Hypothesis Validation',
    category: 'evolution',
    heartbeatIntervalMs: 300_000,
    priority: 3,
    alwaysOn: true,
    fanOutNodes: 'all',
    description: 'Claim verification enriching all reasoning pathways',
  },
  {
    capabilityId: 'autonomous_quality_review',
    name: 'Autonomous Quality Review',
    category: 'evolution',
    heartbeatIntervalMs: 300_000,
    priority: 2,
    alwaysOn: true,
    fanOutNodes: 'all',
    description: 'Output quality checking running as ambient filter',
  },

  // ── Observability Amplifiers (4) ──────────────────────────────
  {
    capabilityId: 'health_trend_analyzer',
    name: 'Health Trend Analyzer',
    category: 'observability',
    heartbeatIntervalMs: 300_000,
    priority: 2,
    alwaysOn: true,
    fanOutNodes: 'all',
    description: 'Unbroken data streams for trend detection',
  },
  {
    capabilityId: 'metric_anomaly_forecaster',
    name: 'Metric Anomaly Forecaster',
    category: 'observability',
    heartbeatIntervalMs: 300_000,
    priority: 3,
    alwaysOn: true,
    fanOutNodes: 'all',
    description: 'Forecasting is meaningless with gaps — continuous prediction',
  },
  {
    capabilityId: 'subscription_health_monitor',
    name: 'Subscription Health Monitor',
    category: 'observability',
    heartbeatIntervalMs: 300_000,
    priority: 2,
    alwaysOn: true,
    fanOutNodes: 'all',
    description: 'Infrastructure-level subscription health monitoring',
  },
  {
    capabilityId: 'capacity_planning_advisor',
    name: 'Capacity Planning Advisor',
    category: 'observability',
    heartbeatIntervalMs: 300_000,
    priority: 3,
    alwaysOn: true,
    fanOutNodes: 'all',
    description: 'Capacity modeling running on continuous data',
  },
];

// ─── Mesh Initialization ──────────────────────────────────────────

let meshActive = false;
let meshIntervals: ReturnType<typeof setInterval>[] = [];
const amplifiers: MeshAmplifier[] = [];

/**
 * Initialize the Enhancement Mesh.
 * Registers all 30 amplifiers and starts heartbeat intervals.
 * Returns teardown function.
 */
export function initEnhancementMesh(): () => void {
  if (meshActive) {
    console.warn('[EnhancementMesh] Already active — skipping re-init');
    return () => {};
  }

  // Register all 30 amplifiers
  for (const entry of ENHANCEMENT_MESH_ENTRIES) {
    const amp = createAmplifier(entry);
    amplifiers.push(amp);
  }

  // Group by heartbeat interval for efficient scheduling
  const intervalGroups = new Map<number, MeshAmplifier[]>();
  for (const amp of amplifiers) {
    const interval = amp.heartbeatIntervalMs;
    if (!intervalGroups.has(interval)) intervalGroups.set(interval, []);
    intervalGroups.get(interval)!.push(amp);
  }

  // Start heartbeat intervals per group
  for (const [intervalMs, amps] of intervalGroups.entries()) {
    const id = setInterval(() => {
      for (const amp of amps) {
        const tick = runMeshHeartbeat(amp);
        recordMeshTick(amp.capabilityId, amp.category, tick);
      }
    }, intervalMs);
    meshIntervals.push(id);
  }

  meshActive = true;

  console.log(
    `[EnhancementMesh] v1.0.0 "Ambient Intelligence Fabric" — ${amplifiers.length} amplifiers active, ` +
    `${intervalGroups.size} heartbeat groups, fan-out: all 40 primitives`
  );

  // Return teardown
  return () => {
    for (const id of meshIntervals) clearInterval(id);
    meshIntervals = [];
    amplifiers.length = 0;
    meshActive = false;
    console.log('[EnhancementMesh] Torn down');
  };
}

// ─── Public API ───────────────────────────────────────────────────

export function isEnhancementMeshActive(): boolean {
  return meshActive;
}

export function getEnhancementMeshEntries(): EnhancementMeshEntry[] {
  return [...ENHANCEMENT_MESH_ENTRIES];
}

export function getEnhancementMeshStats() {
  const health = getMeshHealth();
  const uplift = computeMeshUplift(amplifiers);
  const telemetry = getMeshTelemetry();

  return {
    active: meshActive,
    amplifierCount: amplifiers.length,
    categories: {
      cognitive: getAmplifiersByCategory(amplifiers, 'cognitive').length,
      resilience: getAmplifiersByCategory(amplifiers, 'resilience').length,
      operational: getAmplifiersByCategory(amplifiers, 'operational').length,
      governance: getAmplifiersByCategory(amplifiers, 'governance').length,
      evolution: getAmplifiersByCategory(amplifiers, 'evolution').length,
      observability: getAmplifiersByCategory(amplifiers, 'observability').length,
    },
    uplift,
    health,
    telemetry,
    version: '1.0.0',
    codename: 'Ambient Intelligence Fabric',
  };
}

export { type MeshAmplifier, type AmplifierCategory } from './meshAmplifier';
export { type MeshHealthReport } from './meshTelemetry';
