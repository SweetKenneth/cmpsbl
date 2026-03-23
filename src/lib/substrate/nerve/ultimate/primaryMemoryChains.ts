/**
 * NERVE Ultimate — Primary Memory Chains
 * 
 * Predefined, battle-tested multi-node reaction chains that fire automatically
 * when trigger conditions are met. The substrate's immune-response system.
 * 
 * Each chain is:
 *   - Declarative (stages, triggers, conditions)
 *   - Tracked (success rate, avg duration, EMA confidence)
 *   - Governed (GOVERNANCE can pause/override any chain)
 *   - Audited (every execution logged)
 * 
 * 50 Primary Chains across 7 categories:
 * 
 * ── Core Response (1–8) ──
 *   1.  THREAT_RESPONSE         — VISION → DEFENSE → IDENTITY → ACCESS
 *   2.  SELF_HEAL               — MEDIC → SYSTEM → CORTEX → NERVE
 *   3.  DATA_BREACH             — DEFENSE → PHANTOM → AUDIT → GOVERNANCE
 *   4.  CASCADE_CONTAINMENT     — NERVE → CORTEX → SYSTEM → MEDIC
 *   5.  COMPLIANCE_ALERT        — AUDIT → GOVERNANCE → CONSCIENCE → ATLAS
 *   6.  PERFORMANCE_DEGRADE     — OBSERVER → CORTEX → ENGINEER → EVOLUTION
 *   7.  MEMORY_PRESSURE         — MEMORY → SYSTEM → EVOLUTION
 *   8.  DISCOVERY_VALIDATION    — FORGE → CONSCIENCE → ORACLE → ATLAS
 * 
 * ── Security & Defense (9–16) ──
 *   9.  IDENTITY_THEFT          — IDENTITY → DEFENSE → ACCESS → AUDIT
 *   10. PRIVILEGE_ESCALATION    — ACCESS → DEFENSE → GOVERNANCE → AUDIT
 *   11. SESSION_HIJACK          — IDENTITY → DEFENSE → PHANTOM → ACCESS
 *   12. BRUTE_FORCE             — DEFENSE → ACCESS → IDENTITY → AUDIT
 *   13. INSIDER_THREAT          — CONSCIENCE → DEFENSE → IDENTITY → GOVERNANCE
 *   14. ZERO_DAY_RESPONSE       — DEFENSE → IMMUNITY → SYSTEM → NERVE
 *   15. DDOS_MITIGATION         — DEFENSE → NERVE → CORTEX → SYSTEM
 *   16. EXFILTRATION_BLOCK      — PHANTOM → DEFENSE → ACCESS → AUDIT
 * 
 * ── Intelligence & Learning (17–24) ──
 *   17. PATTERN_RECOGNITION     — BRAIN → ORACLE → MEMORY → EVOLUTION
 *   18. ANOMALY_LEARNING        — VISION → BRAIN → MEMORY → EVOLUTION
 *   19. KNOWLEDGE_SYNTHESIS     — BRAIN → MEMORY → FORGE → ATLAS
 *   20. PREDICTIVE_ALERT        — ORACLE → BRAIN → CORTEX → GOVERNANCE
 *   21. BEHAVIORAL_DRIFT        — OBSERVER → BRAIN → CONSCIENCE → EVOLUTION
 *   22. SKILL_ACQUISITION       — EVOLUTION → BRAIN → MEMORY → ATLAS
 *   23. HEURISTIC_REFINEMENT    — DREAM → BRAIN → ORACLE → EVOLUTION
 *   24. CONTEXT_ENRICHMENT      — DECODE → BRAIN → MEMORY → ENCODE
 * 
 * ── Operations & Infrastructure (25–32) ──
 *   25. RESOURCE_EXHAUSTION     — SYSTEM → CORTEX → ENGINEER → EVOLUTION
 *   26. CONFIG_DRIFT            — SYSTEM → AUDIT → GOVERNANCE → ENGINEER
 *   27. TOPOLOGY_REPAIR         — NERVE → SYSTEM → MEDIC → CORTEX
 *   28. SIGNAL_DEGRADATION      — NERVE → OBSERVER → ENGINEER → SYSTEM
 *   29. QUOTA_BREACH            — ECONOMY → GOVERNANCE → CORTEX → SYSTEM
 *   30. PIPELINE_STALL          — CORTEX → MEDIC → ENGINEER → NERVE
 *   31. STORAGE_OVERFLOW        — MEMORY → SYSTEM → ENGINEER → EVOLUTION
 *   32. NODE_PROMOTION          — EVOLUTION → SYSTEM → NERVE → ATLAS
 * 
 * ── Governance & Compliance (33–38) ──
 *   33. ETHICS_VIOLATION        — CONSCIENCE → GOVERNANCE → AUDIT → ATLAS
 *   34. SLA_BREACH              — TREATY → GOVERNANCE → CORTEX → AUDIT
 *   35. SOVEREIGNTY_ALERT       — SOVEREIGN → GOVERNANCE → DEFENSE → AUDIT
 *   36. BIAS_DETECTED           — CONSCIENCE → BRAIN → GOVERNANCE → AUDIT
 *   37. GOVERNANCE_OVERRIDE     — GOVERNANCE → AUDIT → SYSTEM → NERVE
 *   38. TREATY_VIOLATION        — TREATY → GOVERNANCE → DEFENSE → SOVEREIGN
 * 
 * ── Data & Processing (39–44) ──
 *   39. DATA_CORRUPTION         — MEMORY → MEDIC → AUDIT → SYSTEM
 *   40. ETL_FAILURE             — HARVEST → CORTEX → MEDIC → ENGINEER
 *   41. TRANSLATION_DRIFT       — LINGUA → CONSCIENCE → BRAIN → EVOLUTION
 *   42. ENCODING_ERROR          — ENCODE → MEDIC → CORTEX → ENGINEER
 *   43. DECODING_FAILURE        — DECODE → MEDIC → BRAIN → CORTEX
 *   44. ARTIFACT_CORRUPTION     — FORGE → MEDIC → AUDIT → ATLAS
 * 
 * ── Advanced Autonomous (45–50) ──
 *   45. DREAM_CYCLE             — DREAM → BRAIN → MEMORY → EVOLUTION
 *   46. ECHO_DIVERGENCE         — ECHO → OBSERVER → BRAIN → EVOLUTION
 *   47. REFLEX_CALIBRATION      — REFLEX → OBSERVER → ENGINEER → CORTEX
 *   48. COMPASS_REALIGN         — COMPASS → BRAIN → ORACLE → ATLAS
 *   49. SHADOW_DETECTION        — SHADOW → DEFENSE → PHANTOM → AUDIT
 *   50. IMMUNITY_UPDATE         — IMMUNITY → DEFENSE → EVOLUTION → NERVE
 */

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

export type ChainId =
  // Core Response
  | 'THREAT_RESPONSE'
  | 'SELF_HEAL'
  | 'DATA_BREACH'
  | 'CASCADE_CONTAINMENT'
  | 'COMPLIANCE_ALERT'
  | 'PERFORMANCE_DEGRADE'
  | 'MEMORY_PRESSURE'
  | 'DISCOVERY_VALIDATION'
  // Security & Defense
  | 'IDENTITY_THEFT'
  | 'PRIVILEGE_ESCALATION'
  | 'SESSION_HIJACK'
  | 'BRUTE_FORCE'
  | 'INSIDER_THREAT'
  | 'ZERO_DAY_RESPONSE'
  | 'DDOS_MITIGATION'
  | 'EXFILTRATION_BLOCK'
  // Intelligence & Learning
  | 'PATTERN_RECOGNITION'
  | 'ANOMALY_LEARNING'
  | 'KNOWLEDGE_SYNTHESIS'
  | 'PREDICTIVE_ALERT'
  | 'BEHAVIORAL_DRIFT'
  | 'SKILL_ACQUISITION'
  | 'HEURISTIC_REFINEMENT'
  | 'CONTEXT_ENRICHMENT'
  // Operations & Infrastructure
  | 'RESOURCE_EXHAUSTION'
  | 'CONFIG_DRIFT'
  | 'TOPOLOGY_REPAIR'
  | 'SIGNAL_DEGRADATION'
  | 'QUOTA_BREACH'
  | 'PIPELINE_STALL'
  | 'STORAGE_OVERFLOW'
  | 'NODE_PROMOTION'
  // Governance & Compliance
  | 'ETHICS_VIOLATION'
  | 'SLA_BREACH'
  | 'SOVEREIGNTY_ALERT'
  | 'BIAS_DETECTED'
  | 'GOVERNANCE_OVERRIDE'
  | 'TREATY_VIOLATION'
  // Data & Processing
  | 'DATA_CORRUPTION'
  | 'ETL_FAILURE'
  | 'TRANSLATION_DRIFT'
  | 'ENCODING_ERROR'
  | 'DECODING_FAILURE'
  | 'ARTIFACT_CORRUPTION'
  // Advanced Autonomous
  | 'DREAM_CYCLE'
  | 'ECHO_DIVERGENCE'
  | 'REFLEX_CALIBRATION'
  | 'COMPASS_REALIGN'
  | 'SHADOW_DETECTION'
  | 'IMMUNITY_UPDATE';
export type ChainStatus = 'active' | 'paused' | 'disabled';
export type StageOutcome = 'pending' | 'running' | 'success' | 'failed' | 'skipped';

export interface ChainTrigger {
  sourceNode: string;
  signalType: string;
  condition: (payload: Record<string, unknown>) => boolean;
  description: string;
}

export interface ChainStage {
  order: number;
  node: string;
  action: string;
  description: string;
  timeoutMs: number;
  optional: boolean;
  /** Payload transformer: receives previous stage output, returns input for this stage */
  transform?: (prevOutput: Record<string, unknown>, triggerPayload: Record<string, unknown>) => Record<string, unknown>;
}

export interface PrimaryChainDefinition {
  id: ChainId;
  name: string;
  description: string;
  trigger: ChainTrigger;
  stages: ChainStage[];
  cooldownMs: number;
  priority: 'critical' | 'high' | 'normal';
  governanceOverridable: boolean;
  status: ChainStatus;
}

export interface ChainExecution {
  executionId: string;
  chainId: ChainId;
  triggeredAt: number;
  completedAt: number | null;
  triggerPayload: Record<string, unknown>;
  stageResults: StageResult[];
  outcome: 'running' | 'success' | 'partial' | 'failed' | 'aborted';
  durationMs: number | null;
}

export interface StageResult {
  order: number;
  node: string;
  action: string;
  outcome: StageOutcome;
  startedAt: number | null;
  completedAt: number | null;
  output: Record<string, unknown>;
  error?: string;
}

export interface ChainMetrics {
  chainId: ChainId;
  totalExecutions: number;
  successCount: number;
  failureCount: number;
  partialCount: number;
  successRate: number;          // EMA-weighted
  avgDurationMs: number;        // EMA-weighted
  lastExecutedAt: number | null;
  lastOutcome: string | null;
  confidence: number;           // 0–1, EMA of success
}

export interface ChainRegistrySummary {
  totalChains: number;
  activeChains: number;
  pausedChains: number;
  totalExecutions: number;
  overallSuccessRate: number;
  chainMetrics: ChainMetrics[];
}

// ═══════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════

const EMA_ALPHA = 0.2;
const MAX_EXECUTIONS_PER_CHAIN = 100;
const MAX_TOTAL_EXECUTIONS = 500;

// ═══════════════════════════════════════════════════════════════
// PRIMARY CHAIN DEFINITIONS
// ═══════════════════════════════════════════════════════════════

const PRIMARY_CHAINS: PrimaryChainDefinition[] = [
  // ── 1. THREAT RESPONSE ──
  {
    id: 'THREAT_RESPONSE',
    name: 'Threat Response',
    description: 'Detects behavioral anomaly → evaluates threat → identifies actor → blocks access',
    trigger: {
      sourceNode: 'vision',
      signalType: 'anomaly_detected',
      condition: (p) => typeof p.anomalyScore === 'number' && (p.anomalyScore as number) > 70,
      description: 'VISION anomaly score exceeds 70',
    },
    stages: [
      { order: 1, node: 'vision', action: 'collect_evidence', description: 'Gather anomaly evidence and session fingerprint', timeoutMs: 5_000, optional: false },
      { order: 2, node: 'defense', action: 'evaluate_threat', description: 'Run threat scoring and kill-chain correlation', timeoutMs: 10_000, optional: false,
        transform: (prev) => ({ evidence: prev.evidence, fingerprint: prev.fingerprint }) },
      { order: 3, node: 'identity', action: 'identify_actor', description: 'Resolve session to actor identity', timeoutMs: 5_000, optional: false,
        transform: (prev) => ({ threatScore: prev.threatScore, sessionId: prev.sessionId }) },
      { order: 4, node: 'access', action: 'block_actor', description: 'Revoke access and quarantine account', timeoutMs: 5_000, optional: false,
        transform: (prev) => ({ actorId: prev.actorId, reason: 'threat_response_chain' }) },
    ],
    cooldownMs: 30_000,
    priority: 'critical',
    governanceOverridable: true,
    status: 'active',
  },

  // ── 2. SELF HEAL ──
  {
    id: 'SELF_HEAL',
    name: 'Self-Heal',
    description: 'Diagnoses critical node failure → initiates repair → reroutes traffic → verifies recovery',
    trigger: {
      sourceNode: 'medic',
      signalType: 'triage_red',
      condition: (p) => p.triageCode === 'RED' || p.triageCode === 'BLACK',
      description: 'MEDIC triage code RED or BLACK',
    },
    stages: [
      { order: 1, node: 'medic', action: 'diagnose', description: 'Root cause analysis and blast radius assessment', timeoutMs: 8_000, optional: false },
      { order: 2, node: 'system', action: 'quarantine_node', description: 'Isolate failing node from active mesh', timeoutMs: 5_000, optional: false,
        transform: (prev) => ({ nodeId: prev.affectedNode, reason: prev.rootCause }) },
      { order: 3, node: 'cortex', action: 'reroute_traffic', description: 'Redirect pipelines around quarantined node', timeoutMs: 10_000, optional: false,
        transform: (prev) => ({ quarantinedNode: prev.nodeId, activePipelines: prev.activePipelines }) },
      { order: 4, node: 'nerve', action: 'verify_mesh_health', description: 'Confirm signal paths are healthy post-reroute', timeoutMs: 5_000, optional: true },
    ],
    cooldownMs: 60_000,
    priority: 'critical',
    governanceOverridable: true,
    status: 'active',
  },

  // ── 3. DATA BREACH ──
  {
    id: 'DATA_BREACH',
    name: 'Data Breach Response',
    description: 'Contains breach → scrubs exposure → creates forensic trail → escalates to governance',
    trigger: {
      sourceNode: 'defense',
      signalType: 'kill_chain_advanced',
      condition: (p) => typeof p.killChainStage === 'number' && (p.killChainStage as number) >= 5,
      description: 'DEFENSE kill-chain reaches stage 5+',
    },
    stages: [
      { order: 1, node: 'defense', action: 'contain_breach', description: 'Activate containment protocols and freeze affected surfaces', timeoutMs: 5_000, optional: false },
      { order: 2, node: 'phantom', action: 'scrub_exposure', description: 'Identify and neutralize data exposure vectors', timeoutMs: 15_000, optional: false,
        transform: (prev) => ({ affectedSurfaces: prev.surfaces, containmentId: prev.containmentId }) },
      { order: 3, node: 'audit', action: 'forensic_record', description: 'Create tamper-evident forensic audit trail', timeoutMs: 10_000, optional: false,
        transform: (prev) => ({ scrubReport: prev.scrubReport, containmentId: prev.containmentId }) },
      { order: 4, node: 'governance', action: 'escalate_breach', description: 'Notify governance layer with full incident report', timeoutMs: 5_000, optional: false,
        transform: (prev) => ({ forensicId: prev.forensicId, severity: 'critical' }) },
    ],
    cooldownMs: 10_000,
    priority: 'critical',
    governanceOverridable: false,
    status: 'active',
  },

  // ── 4. CASCADE CONTAINMENT ──
  {
    id: 'CASCADE_CONTAINMENT',
    name: 'Cascade Containment',
    description: 'Detects cascade failure → isolates propagation → reroutes → diagnoses root cause',
    trigger: {
      sourceNode: 'nerve',
      signalType: 'cascade_detected',
      condition: (p) => (p.affectedNodes as string[])?.length >= 2,
      description: 'NERVE detects cascade affecting 2+ nodes',
    },
    stages: [
      { order: 1, node: 'nerve', action: 'isolate_cascade', description: 'Circuit-break all edges in cascade path', timeoutMs: 3_000, optional: false },
      { order: 2, node: 'cortex', action: 'shed_load', description: 'Emergency load shedding on affected pipelines', timeoutMs: 5_000, optional: false,
        transform: (prev) => ({ isolatedEdges: prev.isolatedEdges, cascadeId: prev.cascadeId }) },
      { order: 3, node: 'system', action: 'stabilize', description: 'Force stable configuration on affected nodes', timeoutMs: 10_000, optional: false,
        transform: (prev) => ({ shedTasks: prev.shedTasks }) },
      { order: 4, node: 'medic', action: 'post_cascade_triage', description: 'Full health assessment after containment', timeoutMs: 15_000, optional: true,
        transform: (prev) => ({ stabilizedNodes: prev.stabilizedNodes }) },
    ],
    cooldownMs: 45_000,
    priority: 'critical',
    governanceOverridable: true,
    status: 'active',
  },

  // ── 5. COMPLIANCE ALERT ──
  {
    id: 'COMPLIANCE_ALERT',
    name: 'Compliance Alert',
    description: 'Flags compliance violation → governance review → ethics check → registers finding',
    trigger: {
      sourceNode: 'audit',
      signalType: 'compliance_violation',
      condition: (p) => p.severity === 'high' || p.severity === 'critical',
      description: 'AUDIT detects high/critical compliance violation',
    },
    stages: [
      { order: 1, node: 'audit', action: 'compile_evidence', description: 'Compile violation evidence and affected receipts', timeoutMs: 8_000, optional: false },
      { order: 2, node: 'governance', action: 'review_violation', description: 'Governance review and risk classification', timeoutMs: 10_000, optional: false,
        transform: (prev) => ({ evidence: prev.evidence, ruleId: prev.ruleId }) },
      { order: 3, node: 'conscience', action: 'ethics_assessment', description: 'Evaluate ethical implications and bias risk', timeoutMs: 8_000, optional: true,
        transform: (prev) => ({ riskLevel: prev.riskLevel, violation: prev.violation }) },
      { order: 4, node: 'atlas', action: 'register_finding', description: 'Register finding in capability registry with enforcement action', timeoutMs: 5_000, optional: false,
        transform: (prev) => ({ finding: prev.finding, ethicsResult: prev.ethicsResult }) },
    ],
    cooldownMs: 120_000,
    priority: 'high',
    governanceOverridable: true,
    status: 'active',
  },

  // ── 6. PERFORMANCE DEGRADE ──
  {
    id: 'PERFORMANCE_DEGRADE',
    name: 'Performance Degradation Response',
    description: 'Detects latency spike → sheds load → optimizes hot path → adapts configuration',
    trigger: {
      sourceNode: 'observer',
      signalType: 'latency_spike',
      condition: (p) => typeof p.latencyMs === 'number' && (p.latencyMs as number) > 500,
      description: 'OBSERVER detects latency spike > 500ms',
    },
    stages: [
      { order: 1, node: 'observer', action: 'profile_bottleneck', description: 'Identify bottleneck location and contributing factors', timeoutMs: 5_000, optional: false },
      { order: 2, node: 'cortex', action: 'emergency_shed', description: 'Shed non-critical pipeline stages', timeoutMs: 5_000, optional: false,
        transform: (prev) => ({ bottleneck: prev.bottleneck, loadProfile: prev.loadProfile }) },
      { order: 3, node: 'engineer', action: 'optimize_hot_path', description: 'Apply hot-path optimizations to critical routes', timeoutMs: 10_000, optional: true,
        transform: (prev) => ({ shedResult: prev.shedResult, bottleneck: prev.bottleneck }) },
      { order: 4, node: 'evolution', action: 'adapt_config', description: 'Record pattern and adapt configuration thresholds', timeoutMs: 8_000, optional: true,
        transform: (prev) => ({ optimization: prev.optimization, pattern: prev.pattern }) },
    ],
    cooldownMs: 60_000,
    priority: 'high',
    governanceOverridable: true,
    status: 'active',
  },

  // ── 7. MEMORY PRESSURE ──
  {
    id: 'MEMORY_PRESSURE',
    name: 'Memory Pressure Relief',
    description: 'Detects memory tier overflow → compacts storage → archives cold data → adapts retention',
    trigger: {
      sourceNode: 'memory',
      signalType: 'tier_overflow',
      condition: (p) => p.tier === 'cold' || p.tier === 'warm',
      description: 'MEMORY cold or warm tier at capacity',
    },
    stages: [
      { order: 1, node: 'memory', action: 'compact_tier', description: 'Run compaction on overflowing tier', timeoutMs: 15_000, optional: false },
      { order: 2, node: 'system', action: 'adjust_budgets', description: 'Rebalance resource budgets across tiers', timeoutMs: 5_000, optional: false,
        transform: (prev) => ({ compactionResult: prev.compactionResult, freedBytes: prev.freedBytes }) },
      { order: 3, node: 'evolution', action: 'tune_retention', description: 'Adapt retention policies based on usage patterns', timeoutMs: 8_000, optional: true,
        transform: (prev) => ({ newBudgets: prev.newBudgets, pressureHistory: prev.pressureHistory }) },
    ],
    cooldownMs: 300_000,
    priority: 'normal',
    governanceOverridable: true,
    status: 'active',
  },

  // ── 8. DISCOVERY VALIDATION ──
  {
    id: 'DISCOVERY_VALIDATION',
    name: 'Discovery Validation Pipeline',
    description: 'Validates new discovery → ethics review → predictive assessment → registers in atlas',
    trigger: {
      sourceNode: 'forge',
      signalType: 'discovery_crystallized',
      condition: (p) => typeof p.cjpiScore === 'number' && (p.cjpiScore as number) >= 60,
      description: 'FORGE crystallizes discovery with CJPI ≥ 60',
    },
    stages: [
      { order: 1, node: 'forge', action: 'package_discovery', description: 'Package discovery with metadata and test results', timeoutMs: 10_000, optional: false },
      { order: 2, node: 'conscience', action: 'ethics_gate', description: 'Screen discovery for ethical concerns and bias', timeoutMs: 8_000, optional: false,
        transform: (prev) => ({ discovery: prev.discovery, moduleChain: prev.moduleChain }) },
      { order: 3, node: 'oracle', action: 'predict_impact', description: 'Predict adoption impact and risk profile', timeoutMs: 10_000, optional: true,
        transform: (prev) => ({ ethicsResult: prev.ethicsResult, discovery: prev.discovery }) },
      { order: 4, node: 'atlas', action: 'register_capability', description: 'Register validated discovery in capability atlas', timeoutMs: 5_000, optional: false,
        transform: (prev) => ({ prediction: prev.prediction, discovery: prev.discovery, ethicsCleared: prev.ethicsCleared }) },
    ],
    cooldownMs: 30_000,
    priority: 'normal',
    governanceOverridable: true,
    status: 'active',
  },
];

// ═══════════════════════════════════════════════════════════════
// STATE
// ═══════════════════════════════════════════════════════════════

const chainRegistry = new Map<ChainId, PrimaryChainDefinition>();
const chainMetrics = new Map<ChainId, ChainMetrics>();
const executionHistory = new Map<ChainId, ChainExecution[]>();
const allExecutions: ChainExecution[] = [];
const lastFiredAt = new Map<ChainId, number>();
let executionCounter = 0;

// Initialize
for (const chain of PRIMARY_CHAINS) {
  chainRegistry.set(chain.id, { ...chain });
  chainMetrics.set(chain.id, {
    chainId: chain.id,
    totalExecutions: 0,
    successCount: 0,
    failureCount: 0,
    partialCount: 0,
    successRate: 1,
    avgDurationMs: 0,
    lastExecutedAt: null,
    lastOutcome: null,
    confidence: 0.5,
  });
  executionHistory.set(chain.id, []);
}

// ═══════════════════════════════════════════════════════════════
// TRIGGER EVALUATION
// ═══════════════════════════════════════════════════════════════

/**
 * Evaluate an incoming signal against all registered chains.
 * Returns chains that should fire (respects cooldown and status).
 */
export function evaluateTriggers(
  sourceNode: string,
  signalType: string,
  payload: Record<string, unknown>,
): PrimaryChainDefinition[] {
  const now = Date.now();
  const matches: PrimaryChainDefinition[] = [];

  for (const chain of chainRegistry.values()) {
    if (chain.status !== 'active') continue;

    // Match source node and signal type
    if (chain.trigger.sourceNode !== sourceNode.toLowerCase()) continue;
    if (chain.trigger.signalType !== signalType) continue;

    // Cooldown check
    const lastFired = lastFiredAt.get(chain.id) ?? 0;
    if ((now - lastFired) < chain.cooldownMs) continue;

    // Condition evaluation (safe)
    try {
      if (!chain.trigger.condition(payload)) continue;
    } catch {
      continue;
    }

    matches.push(chain);
  }

  // Sort by priority: critical > high > normal
  const priorityOrder: Record<string, number> = { critical: 3, high: 2, normal: 1 };
  matches.sort((a, b) => (priorityOrder[b.priority] ?? 0) - (priorityOrder[a.priority] ?? 0));

  return matches;
}

// ═══════════════════════════════════════════════════════════════
// CHAIN EXECUTION
// ═══════════════════════════════════════════════════════════════

/**
 * Execute a chain. Runs stages sequentially, passing output forward.
 * The `executor` callback is called for each stage — this is where the
 * actual node resolver invocation happens.
 */
export async function executeChain(
  chainId: ChainId,
  triggerPayload: Record<string, unknown>,
  executor: (node: string, action: string, input: Record<string, unknown>) => Promise<Record<string, unknown>>,
): Promise<ChainExecution> {
  const chain = chainRegistry.get(chainId);
  if (!chain) throw new Error(`Unknown chain: ${chainId}`);

  const now = Date.now();
  lastFiredAt.set(chainId, now);

  const execution: ChainExecution = {
    executionId: `pmc-${++executionCounter}-${now}`,
    chainId,
    triggeredAt: now,
    completedAt: null,
    triggerPayload,
    stageResults: [],
    outcome: 'running',
    durationMs: null,
  };

  let prevOutput: Record<string, unknown> = {};
  let allSuccess = true;
  let anySuccess = false;

  for (const stage of chain.stages) {
    const stageResult: StageResult = {
      order: stage.order,
      node: stage.node,
      action: stage.action,
      outcome: 'running',
      startedAt: Date.now(),
      completedAt: null,
      output: {},
    };

    try {
      // Transform payload for this stage
      const input = stage.transform
        ? stage.transform(prevOutput, triggerPayload)
        : { ...prevOutput, ...triggerPayload };

      // Execute with timeout
      const result = await withTimeout(
        executor(stage.node, stage.action, input),
        stage.timeoutMs,
      );

      stageResult.outcome = 'success';
      stageResult.output = result;
      stageResult.completedAt = Date.now();
      prevOutput = result;
      anySuccess = true;
    } catch (err) {
      stageResult.outcome = 'failed';
      stageResult.error = err instanceof Error ? err.message : String(err);
      stageResult.completedAt = Date.now();

      if (stage.optional) {
        stageResult.outcome = 'skipped';
      } else {
        allSuccess = false;
        execution.stageResults.push(stageResult);
        break; // Non-optional failure stops the chain
      }
    }

    execution.stageResults.push(stageResult);
  }

  execution.completedAt = Date.now();
  execution.durationMs = execution.completedAt - execution.triggeredAt;
  execution.outcome = allSuccess ? 'success' : anySuccess ? 'partial' : 'failed';

  // Record execution
  recordExecution(chainId, execution);

  return execution;
}

async function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(`Stage timeout after ${ms}ms`)), ms)
    ),
  ]);
}

// ═══════════════════════════════════════════════════════════════
// METRICS & TRACKING
// ═══════════════════════════════════════════════════════════════

function recordExecution(chainId: ChainId, execution: ChainExecution): void {
  // Update metrics with EMA
  const metrics = chainMetrics.get(chainId);
  if (metrics) {
    metrics.totalExecutions++;
    if (execution.outcome === 'success') metrics.successCount++;
    else if (execution.outcome === 'failed') metrics.failureCount++;
    else if (execution.outcome === 'partial') metrics.partialCount++;

    const successVal = execution.outcome === 'success' ? 1 : 0;
    metrics.successRate = EMA_ALPHA * successVal + (1 - EMA_ALPHA) * metrics.successRate;
    metrics.confidence = EMA_ALPHA * successVal + (1 - EMA_ALPHA) * metrics.confidence;

    if (execution.durationMs !== null) {
      metrics.avgDurationMs = EMA_ALPHA * execution.durationMs + (1 - EMA_ALPHA) * metrics.avgDurationMs;
    }

    metrics.lastExecutedAt = execution.triggeredAt;
    metrics.lastOutcome = execution.outcome;
  }

  // Store in history
  const history = executionHistory.get(chainId);
  if (history) {
    history.push(execution);
    if (history.length > MAX_EXECUTIONS_PER_CHAIN) {
      history.splice(0, history.length - MAX_EXECUTIONS_PER_CHAIN);
    }
  }

  // Global history
  allExecutions.push(execution);
  if (allExecutions.length > MAX_TOTAL_EXECUTIONS) {
    allExecutions.splice(0, allExecutions.length - MAX_TOTAL_EXECUTIONS);
  }
}

// ═══════════════════════════════════════════════════════════════
// GOVERNANCE CONTROLS
// ═══════════════════════════════════════════════════════════════

/** Pause a chain (governance override) */
export function pauseChain(chainId: ChainId): boolean {
  const chain = chainRegistry.get(chainId);
  if (!chain || !chain.governanceOverridable) return false;
  chain.status = 'paused';
  return true;
}

/** Resume a paused chain */
export function resumeChain(chainId: ChainId): boolean {
  const chain = chainRegistry.get(chainId);
  if (!chain) return false;
  chain.status = 'active';
  return true;
}

/** Disable a chain entirely */
export function disableChain(chainId: ChainId): boolean {
  const chain = chainRegistry.get(chainId);
  if (!chain) return false;
  chain.status = 'disabled';
  return true;
}

/** Abort a running execution */
export function abortExecution(executionId: string): boolean {
  const exec = allExecutions.find(e => e.executionId === executionId);
  if (!exec || exec.outcome !== 'running') return false;
  exec.outcome = 'aborted';
  exec.completedAt = Date.now();
  exec.durationMs = exec.completedAt - exec.triggeredAt;
  return true;
}

// ═══════════════════════════════════════════════════════════════
// QUERY API
// ═══════════════════════════════════════════════════════════════

/** Get a chain definition */
export function getChain(chainId: ChainId): PrimaryChainDefinition | null {
  return chainRegistry.get(chainId) ?? null;
}

/** Get all chain definitions */
export function getAllChains(): PrimaryChainDefinition[] {
  return Array.from(chainRegistry.values());
}

/** Get metrics for a chain */
export function getChainMetrics(chainId: ChainId): ChainMetrics | null {
  return chainMetrics.get(chainId) ?? null;
}

/** Get execution history for a chain */
export function getChainHistory(chainId: ChainId, limit: number = 20): ChainExecution[] {
  const history = executionHistory.get(chainId);
  return history ? history.slice(-limit) : [];
}

/** Get recent executions across all chains */
export function getRecentExecutions(limit: number = 20): ChainExecution[] {
  return allExecutions.slice(-limit);
}

/** Get full registry summary */
export function getRegistrySummary(): ChainRegistrySummary {
  const chains = Array.from(chainRegistry.values());
  const metrics = Array.from(chainMetrics.values());
  const totalExecs = metrics.reduce((sum, m) => sum + m.totalExecutions, 0);
  const totalSuccess = metrics.reduce((sum, m) => sum + m.successCount, 0);

  return {
    totalChains: chains.length,
    activeChains: chains.filter(c => c.status === 'active').length,
    pausedChains: chains.filter(c => c.status === 'paused').length,
    totalExecutions: totalExecs,
    overallSuccessRate: totalExecs > 0 ? totalSuccess / totalExecs : 1,
    chainMetrics: metrics.map(m => ({ ...m })),
  };
}

/** Get chains by priority */
export function getChainsByPriority(priority: 'critical' | 'high' | 'normal'): PrimaryChainDefinition[] {
  return Array.from(chainRegistry.values()).filter(c => c.priority === priority);
}

/** Get chains involving a specific node */
export function getChainsForNode(nodeId: string): PrimaryChainDefinition[] {
  const lower = nodeId.toLowerCase();
  return Array.from(chainRegistry.values()).filter(c =>
    c.trigger.sourceNode === lower || c.stages.some(s => s.node === lower)
  );
}
