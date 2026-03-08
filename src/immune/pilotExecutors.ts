/**
 * IMMUNITY — Universal Executor Registry & Immune Wrapping
 * 
 * ALL executors are immune-wrapped via createImmuneAwareRegister().
 * Known executors use explicit metadata, unknown ones use inferExecutorMeta().
 * This ensures every executor is protected by the Immunity Mesh by default.
 */

import type { SynergyExecutor } from '@/lib/capabilities/synergies/types';
import { wrapExecutor } from './wrapExecutor';

/**
 * Module metadata for each executor — used for scoping, stub creation, and learning
 */
export interface ExecutorModuleMeta {
  module: string;
  scope: string;
  /** Functional category for cross-executor learning grouping */
  category: 'ui_adaptation' | 'content_analysis' | 'content_validation' | 'cognitive_processing' | 'event_routing' | 'governance' | 'orchestration' | 'infrastructure' | 'intelligence' | 'security' | 'optimization' | 'autonomy';
}

/**
 * Full executor fleet — ALL executors are now shadow-wrapped.
 * Phase 2: Scaled from 35 pilot → full fleet coverage.
 * 
 * Categories:
 *   INCLUSIVE (7), COGNITIVE (5), OPERATIONAL (5), ORCHESTRATOR (4),
 *   INFRASTRUCTURE (7), INTELLIGENCE (7) — original 35 pilot
 *   + ALL registered synergy executors (v7.0–v7.5.3) + S-tier (22)
 */
export const PILOT_EXECUTORS = [
  // ═══ ORIGINAL 35 PILOT ═══
  // INCLUSIVE (7)
  'adaptive-ui',
  'cognitive-load-optimization',
  'comprehensive-accessibility-audit',
  'personalized-accessibility-engine',
  'inclusive-content',
  'contrast-ratio-analyzer',
  'focus-management-engine',
  // COGNITIVE (5)
  'reasoning-engine',
  'learning-engine',
  'imagination-engine',
  'semantic-analysis-engine',
  'context-window-manager',
  // OPERATIONAL (5)
  'relay-event-dispatcher',
  'economy-cost-tracker',
  'audit-compliance-check',
  'rate-limiter-engine',
  'telemetry-aggregator',
  // ORCHESTRATOR (4)
  'mesh-pipeline-resolver',
  'seba-proposal-evaluator',
  'workflow-orchestrator',
  'dependency-resolver',
  // INFRASTRUCTURE (7)
  'memory-consolidation-engine',
  'identity-verification-engine',
  'sandbox-isolation-guard',
  'encode-task-scheduler',
  'cache-invalidation-engine',
  'config-propagation-engine',
  'health-check-coordinator',
  // INTELLIGENCE (7)
  'dream-pattern-synthesizer',
  'decode-intent-classifier',
  'vision-anomaly-detector',
  'sentiment-drift-analyzer',
  'temporal-pattern-engine',
  'correlation-discovery-engine',
  'signal-noise-separator',

  // ═══ v7.0 EXECUTORS (5) ═══
  'external-api-intelligence',
  'entitlement-aware-routing',
  'autonomous-evolution',
  'end-to-end-reasoning',
  'bounded-autonomy-guard',

  // ═══ v7.1 EXECUTORS (8 — cognitive-load-optimization already above) ═══
  'contextual-preload',
  'semantic-deduplication',
  'behavioral-fingerprinting',
  'zero-trust-validation',
  'workflow-synthesis',
  'multi-agent-coordination',
  'hypothesis-testing',
  'knowledge-distillation',

  // ═══ v7.2 EXECUTORS (10) ═══
  'capacity-forecasting',
  'cost-optimization-engine',
  'causal-inference',
  'emergent-pattern-detection',
  'threat-prediction',
  'compliance-automation',
  'predictive-healing',
  'chaos-resilience',
  'sla-guardian',
  'resource-contention-resolver',

  // ═══ v7.3 EXECUTORS (22) ═══
  'recursive-self-improvement',
  'temporal-reasoning',
  'counterfactual-analysis',
  'semantic-bridge',
  'goal-decomposition',
  'autonomous-repair',
  'proactive-scaling',
  'cross-modal-synthesis',
  'consensus-reasoning',
  'attack-surface-mapping',
  'privilege-escalation-detection',
  'data-exfiltration-guard',
  'token-budget-optimizer',
  'response-quality-calibration',
  'cache-coherence',
  'blast-radius-containment',
  'state-checkpoint-recovery',
  'dependency-health-cascade',
  'cross-team-coordination',
  'pipeline-orchestration',
  'universal-design-synthesis',
  'adaptive-personalization',

  // ═══ v7.4 EXECUTORS (21 — comprehensive-accessibility-audit already above) ═══
  'holistic-system-insight',
  'meta-cognitive-reflection',
  'neural-symbolic-fusion',
  'cognitive-load-balancer',
  'intent-evolution-chain',
  'zero-day-defense',
  'comprehensive-audit-trail',
  'adaptive-threat-response',
  'distributed-recovery-orchestration',
  'intelligent-failover-chain',
  'cognitive-state-preservation',
  'full-stack-evolution',
  'multi-modal-task-routing',
  'adaptive-workflow-engine',
  'predictive-resource-allocation',
  'intelligent-batch-processing',
  'cost-aware-routing',
  'adaptive-content-transformation',
  'self-documenting-evolution',
  'intelligent-deprecation-manager',
  'autonomous-optimization-loop',

  // ═══ v7.5.2 EXECUTORS (15) ═══
  'external-data-enrichment',
  'api-intelligence-layer',
  'creative-threat-modeling',
  'accessibility-event-stream',
  'config-optimization-learning',
  'entitlement-evolution',
  'proactive-maintenance-engine',
  'resource-demand-imagination',
  'accessible-ai-generation',
  'security-posture-evolution',
  'semantic-event-enrichment',
  'distributed-config-sync',
  'predictive-evolution-engine',
  'api-entitlement-fortress',
  'cognitive-accessibility-profiler',

  // ═══ v7.5.3 EXECUTORS (12) ═══
  'meta-learning-orchestrator',
  'intent-accessibility-synthesis',
  'threat-intelligence-mesh',
  'resource-governance-engine',
  'reasoning-quality-amplifier',
  'secure-evolution-pipeline',
  'external-api-guardian',
  'creative-problem-solver',
  'usage-pattern-intelligence',
  'adaptive-configuration-intelligence',
  'event-driven-orchestration',

  // ═══ ORIGINAL 8 SYNERGIES ═══
  'smart-recall',
  'adaptive-routing',
  'graceful-degradation',
  'learning-acceleration',
  'cascade-prevention',
  'anomaly-correlation',
  'cognitive-fusion',
  'intent-amplification',

  // ═══ S-TIER EXECUTORS (22) ═══
  'strategic-foresight-engine',
  'decision-confidence-governor',
  'explainable-intelligence-compiler',
  'autonomous-ops-steward',
  'autonomy-budget-manager',
  'autonomy-rollback-authority',
  'intelligence-containment-engine',
  'emergent-threat-anticipator',
  'behavioral-trust-scoring',
  'autonomous-cost-arbitrage-engine',
  'value-weighted-reasoning-router',
  'waste-detection-intelligence',
  'intent-drift-tracker',
  'adaptive-product-brain',
  'friction-auto-removal-engine',
  'cross-pipeline-arbitration-engine',
  'capability-impact-forecaster',
  'self-scaling-intelligence-fabric',
  'regulatory-mode-switcher',
  'audit-grade-decision-ledger',
  'policy-aware-intelligence-gate',
  'intelligence-governance-kernel',
] as const;

export type PilotExecutorId = typeof PILOT_EXECUTORS[number];

/**
 * Explicit module metadata for original 35 pilot executors.
 * All other executors get auto-inferred metadata via inferExecutorMeta().
 */
const EXPLICIT_META: Partial<Record<PilotExecutorId, ExecutorModuleMeta>> = {
  // INCLUSIVE
  'adaptive-ui':                       { module: 'INCLUSIVE',       scope: 'adaptive-ui',                    category: 'ui_adaptation' },
  'cognitive-load-optimization':       { module: 'INCLUSIVE',       scope: 'cognitive-load-optimization',    category: 'content_analysis' },
  'comprehensive-accessibility-audit': { module: 'INCLUSIVE',       scope: 'comprehensive-accessibility-audit', category: 'content_validation' },
  'personalized-accessibility-engine': { module: 'INCLUSIVE',       scope: 'personalized-accessibility-engine', category: 'ui_adaptation' },
  'inclusive-content':                 { module: 'INCLUSIVE',       scope: 'inclusive-content',              category: 'content_validation' },
  'contrast-ratio-analyzer':           { module: 'INCLUSIVE',       scope: 'contrast-ratio-analyzer',        category: 'content_analysis' },
  'focus-management-engine':           { module: 'INCLUSIVE',       scope: 'focus-management-engine',        category: 'ui_adaptation' },
  // COGNITIVE
  'reasoning-engine':                  { module: 'COGNITIVE',      scope: 'reasoning-engine',               category: 'cognitive_processing' },
  'learning-engine':                   { module: 'COGNITIVE',      scope: 'learning-engine',                category: 'cognitive_processing' },
  'imagination-engine':                { module: 'COGNITIVE',      scope: 'imagination-engine',             category: 'cognitive_processing' },
  'semantic-analysis-engine':          { module: 'COGNITIVE',      scope: 'semantic-analysis-engine',       category: 'cognitive_processing' },
  'context-window-manager':            { module: 'COGNITIVE',      scope: 'context-window-manager',         category: 'cognitive_processing' },
  // OPERATIONAL
  'relay-event-dispatcher':            { module: 'OPERATIONAL',    scope: 'relay-event-dispatcher',         category: 'event_routing' },
  'economy-cost-tracker':              { module: 'OPERATIONAL',    scope: 'economy-cost-tracker',           category: 'governance' },
  'audit-compliance-check':            { module: 'OPERATIONAL',    scope: 'audit-compliance-check',         category: 'content_validation' },
  'rate-limiter-engine':               { module: 'OPERATIONAL',    scope: 'rate-limiter-engine',            category: 'governance' },
  'telemetry-aggregator':              { module: 'OPERATIONAL',    scope: 'telemetry-aggregator',           category: 'event_routing' },
  // ORCHESTRATOR
  'mesh-pipeline-resolver':            { module: 'ORCHESTRATOR',   scope: 'mesh-pipeline-resolver',         category: 'orchestration' },
  'seba-proposal-evaluator':           { module: 'ORCHESTRATOR',   scope: 'seba-proposal-evaluator',        category: 'governance' },
  'workflow-orchestrator':             { module: 'ORCHESTRATOR',   scope: 'workflow-orchestrator',          category: 'orchestration' },
  'dependency-resolver':               { module: 'ORCHESTRATOR',   scope: 'dependency-resolver',            category: 'orchestration' },
  // INFRASTRUCTURE
  'memory-consolidation-engine':       { module: 'INFRASTRUCTURE', scope: 'memory-consolidation-engine',    category: 'infrastructure' },
  'identity-verification-engine':      { module: 'INFRASTRUCTURE', scope: 'identity-verification-engine',   category: 'infrastructure' },
  'sandbox-isolation-guard':           { module: 'INFRASTRUCTURE', scope: 'sandbox-isolation-guard',        category: 'infrastructure' },
  'encode-task-scheduler':             { module: 'INFRASTRUCTURE', scope: 'encode-task-scheduler',          category: 'infrastructure' },
  'cache-invalidation-engine':         { module: 'INFRASTRUCTURE', scope: 'cache-invalidation-engine',      category: 'infrastructure' },
  'config-propagation-engine':         { module: 'INFRASTRUCTURE', scope: 'config-propagation-engine',      category: 'infrastructure' },
  'health-check-coordinator':          { module: 'INFRASTRUCTURE', scope: 'health-check-coordinator',       category: 'infrastructure' },
  // INTELLIGENCE
  'dream-pattern-synthesizer':         { module: 'INTELLIGENCE',   scope: 'dream-pattern-synthesizer',      category: 'intelligence' },
  'decode-intent-classifier':          { module: 'INTELLIGENCE',   scope: 'decode-intent-classifier',       category: 'intelligence' },
  'vision-anomaly-detector':           { module: 'INTELLIGENCE',   scope: 'vision-anomaly-detector',        category: 'intelligence' },
  'sentiment-drift-analyzer':          { module: 'INTELLIGENCE',   scope: 'sentiment-drift-analyzer',       category: 'intelligence' },
  'temporal-pattern-engine':           { module: 'INTELLIGENCE',   scope: 'temporal-pattern-engine',        category: 'intelligence' },
  'correlation-discovery-engine':      { module: 'INTELLIGENCE',   scope: 'correlation-discovery-engine',   category: 'intelligence' },
  'signal-noise-separator':            { module: 'INTELLIGENCE',   scope: 'signal-noise-separator',         category: 'intelligence' },
};

/**
 * Auto-infer module metadata from executor name when not explicitly mapped.
 * Uses keyword heuristics to assign module + category.
 */
function inferExecutorMeta(id: string): ExecutorModuleMeta {
  const lower = id.toLowerCase();

  // Security / Trust / Defense
  if (/threat|security|trust|defense|zero-day|attack|exfiltration|containment|privilege|fortress/.test(lower))
    return { module: 'SECURITY', scope: id, category: 'security' };

  // Autonomy / Evolution / Self-improvement
  if (/autonom|evolution|self-|recursive|rollback-authority/.test(lower))
    return { module: 'AUTONOMY', scope: id, category: 'autonomy' };

  // Cost / Optimization / Budget / Efficiency
  if (/cost|budget|waste|optimization|resource-(?:contention|demand|governance)/.test(lower))
    return { module: 'OPTIMIZATION', scope: id, category: 'optimization' };

  // Orchestration / Pipeline / Workflow / Coordination
  if (/orchestr|pipeline|workflow|coordination|arbitration|routing|failover|batch/.test(lower))
    return { module: 'ORCHESTRATOR', scope: id, category: 'orchestration' };

  // Intelligence / Reasoning / Cognitive / Learning / Inference
  if (/reasoning|cognitive|learning|inference|intelligence|foresight|insight|reflection|neural|fusion|hypothesis|knowledge|meta-learning|quality-amplifier/.test(lower))
    return { module: 'COGNITIVE', scope: id, category: 'cognitive_processing' };

  // Governance / Compliance / Audit / Policy / Regulatory
  if (/compliance|audit|governance|policy|regulatory|ledger|deprecation|documenting/.test(lower))
    return { module: 'GOVERNANCE', scope: id, category: 'governance' };

  // Inclusive / Accessibility / Content / UX / Personalization
  if (/accessibility|inclusive|adaptive-ui|content|personali|design|friction|product-brain|drift-tracker/.test(lower))
    return { module: 'INCLUSIVE', scope: id, category: 'ui_adaptation' };

  // Infrastructure / Cache / Config / Recovery / Scaling / Health / State
  if (/cache|config|recovery|scaling|health|state|checkpoint|maintenance|preload|dedup|fingerprint|resilience|capacity|healing|sla|guardian|forecaster|fabric/.test(lower))
    return { module: 'INFRASTRUCTURE', scope: id, category: 'infrastructure' };

  // Event / Telemetry / Monitoring / Enrichment / Stream
  if (/event|telemetry|monitoring|enrichment|stream|relay|dispatch|semantic-event/.test(lower))
    return { module: 'OPERATIONAL', scope: id, category: 'event_routing' };

  // Intelligence / Pattern / Anomaly / Signal / Correlation / Prediction
  if (/pattern|anomaly|signal|correlation|prediction|prediction|vision|sentiment|temporal|dream|decode|bridge|counterfactual|causal|emergent|creative/.test(lower))
    return { module: 'INTELLIGENCE', scope: id, category: 'intelligence' };

  // Fallback: generic operational
  return { module: 'OPERATIONAL', scope: id, category: 'infrastructure' };
}

/**
 * Full metadata registry — explicit for pilot executors, auto-inferred for the rest.
 * This is built once at module load time.
 */
export const EXECUTOR_MODULE_META: Record<PilotExecutorId, ExecutorModuleMeta> = (() => {
  const meta = {} as Record<PilotExecutorId, ExecutorModuleMeta>;
  for (const id of PILOT_EXECUTORS) {
    meta[id] = EXPLICIT_META[id] ?? inferExecutorMeta(id);
  }
  return meta;
})();

/** Check if an executor is in the pilot set */
export function isPilotExecutor(id: string): id is PilotExecutorId {
  return (PILOT_EXECUTORS as readonly string[]).includes(id);
}

/** Get module metadata for an executor */
export function getExecutorMeta(id: string): ExecutorModuleMeta | undefined {
  return EXECUTOR_MODULE_META[id as PilotExecutorId];
}

/** Get all executors in a given category (for cross-learning) */
export function getExecutorsByCategory(category: ExecutorModuleMeta['category']): PilotExecutorId[] {
  return (Object.entries(EXECUTOR_MODULE_META) as [PilotExecutorId, ExecutorModuleMeta][])
    .filter(([, meta]) => meta.category === category)
    .map(([id]) => id);
}

/** Wrapped executor cache for probe access */
const wrappedCache = new Map<string, SynergyExecutor>();

/**
 * Intercept registration: wrap ALL executors with immune layer.
 * Universal wrapping — no executor bypasses the Immunity Mesh.
 * Known executors use explicit metadata, unknown ones use inferExecutorMeta().
 */
export function createImmuneAwareRegister(
  originalRegisterFn: (id: string, executor: SynergyExecutor) => void,
): (id: string, executor: SynergyExecutor) => void {
  return (id: string, executor: SynergyExecutor) => {
    // Resolve metadata: explicit for known executors, inferred for new ones
    const meta = isPilotExecutor(id)
      ? EXECUTOR_MODULE_META[id]
      : inferExecutorMeta(id);

    const wrapped = wrapExecutor(executor, id, {
      module: meta.module,
      scope: meta.scope,
    });
    wrappedCache.set(id, wrapped);
    originalRegisterFn(id, wrapped);
  };
}

/** Get a wrapped executor by name (for probeMini) */
export function getWrappedExecutor(id: string): SynergyExecutor | undefined {
  return wrappedCache.get(id);
}
