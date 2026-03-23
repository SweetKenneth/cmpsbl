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

  // ═══════════════════════════════════════════════════════════
  // SECURITY & DEFENSE (9–16)
  // ═══════════════════════════════════════════════════════════

  // ── 9. IDENTITY THEFT ──
  {
    id: 'IDENTITY_THEFT',
    name: 'Identity Theft Response',
    description: 'Detects identity impersonation → threat analysis → access revocation → forensic audit',
    trigger: {
      sourceNode: 'identity',
      signalType: 'impersonation_detected',
      condition: (p) => typeof p.confidenceScore === 'number' && (p.confidenceScore as number) > 80,
      description: 'IDENTITY detects impersonation with confidence > 80',
    },
    stages: [
      { order: 1, node: 'identity', action: 'freeze_identity', description: 'Freeze compromised identity and collect evidence', timeoutMs: 3_000, optional: false },
      { order: 2, node: 'defense', action: 'analyze_impersonation', description: 'Analyze attack vector and scope', timeoutMs: 8_000, optional: false,
        transform: (prev) => ({ frozenIdentity: prev.identityId, evidence: prev.evidence }) },
      { order: 3, node: 'access', action: 'revoke_all_sessions', description: 'Revoke all active sessions for compromised identity', timeoutMs: 5_000, optional: false,
        transform: (prev) => ({ identityId: prev.identityId, attackVector: prev.attackVector }) },
      { order: 4, node: 'audit', action: 'forensic_record', description: 'Record forensic trail of impersonation attempt', timeoutMs: 8_000, optional: false,
        transform: (prev) => ({ revokedSessions: prev.revokedSessions, identityId: prev.identityId }) },
    ],
    cooldownMs: 15_000,
    priority: 'critical',
    governanceOverridable: true,
    status: 'active',
  },

  // ── 10. PRIVILEGE ESCALATION ──
  {
    id: 'PRIVILEGE_ESCALATION',
    name: 'Privilege Escalation Block',
    description: 'Detects unauthorized privilege change → threat assess → governance alert → audit trail',
    trigger: {
      sourceNode: 'access',
      signalType: 'privilege_change_unauthorized',
      condition: (p) => p.escalationType === 'vertical' || p.escalationType === 'horizontal',
      description: 'ACCESS detects unauthorized privilege escalation',
    },
    stages: [
      { order: 1, node: 'access', action: 'rollback_privilege', description: 'Immediately rollback unauthorized privilege changes', timeoutMs: 3_000, optional: false },
      { order: 2, node: 'defense', action: 'assess_escalation', description: 'Determine if escalation is attack or misconfiguration', timeoutMs: 8_000, optional: false,
        transform: (prev) => ({ rolledBack: prev.rolledBack, affectedUser: prev.affectedUser }) },
      { order: 3, node: 'governance', action: 'escalation_alert', description: 'Alert governance with full escalation context', timeoutMs: 5_000, optional: false,
        transform: (prev) => ({ assessment: prev.assessment, severity: prev.severity }) },
      { order: 4, node: 'audit', action: 'log_escalation', description: 'Create tamper-proof audit entry', timeoutMs: 5_000, optional: false,
        transform: (prev) => ({ governanceAction: prev.action, incidentId: prev.incidentId }) },
    ],
    cooldownMs: 20_000,
    priority: 'critical',
    governanceOverridable: false,
    status: 'active',
  },

  // ── 11. SESSION HIJACK ──
  {
    id: 'SESSION_HIJACK',
    name: 'Session Hijack Intercept',
    description: 'Detects session anomaly → defense analysis → phantom scrub → access termination',
    trigger: {
      sourceNode: 'identity',
      signalType: 'session_anomaly',
      condition: (p) => typeof p.riskScore === 'number' && (p.riskScore as number) > 75,
      description: 'IDENTITY detects session anomaly with risk > 75',
    },
    stages: [
      { order: 1, node: 'identity', action: 'fingerprint_session', description: 'Capture session fingerprint and behavioral deviation', timeoutMs: 3_000, optional: false },
      { order: 2, node: 'defense', action: 'hijack_analysis', description: 'Correlate session with known hijack patterns', timeoutMs: 8_000, optional: false,
        transform: (prev) => ({ fingerprint: prev.fingerprint, deviation: prev.deviation }) },
      { order: 3, node: 'phantom', action: 'trace_origin', description: 'Trace hijack origin through network topology', timeoutMs: 10_000, optional: true,
        transform: (prev) => ({ hijackConfidence: prev.confidence, sessionId: prev.sessionId }) },
      { order: 4, node: 'access', action: 'terminate_session', description: 'Force-terminate hijacked session and block origin', timeoutMs: 3_000, optional: false,
        transform: (prev) => ({ sessionId: prev.sessionId, originIp: prev.originIp }) },
    ],
    cooldownMs: 15_000,
    priority: 'critical',
    governanceOverridable: true,
    status: 'active',
  },

  // ── 12. BRUTE FORCE ──
  {
    id: 'BRUTE_FORCE',
    name: 'Brute Force Mitigation',
    description: 'Brute force pattern → rate limit → identity lockout → audit',
    trigger: {
      sourceNode: 'defense',
      signalType: 'brute_force_detected',
      condition: (p) => typeof p.attemptCount === 'number' && (p.attemptCount as number) > 10,
      description: 'DEFENSE detects brute force with 10+ attempts',
    },
    stages: [
      { order: 1, node: 'defense', action: 'engage_rate_limit', description: 'Activate aggressive rate limiting on attack surface', timeoutMs: 2_000, optional: false },
      { order: 2, node: 'access', action: 'progressive_lockout', description: 'Apply progressive lockout to targeted accounts', timeoutMs: 3_000, optional: false,
        transform: (prev) => ({ rateLimitId: prev.rateLimitId, targetAccounts: prev.targetAccounts }) },
      { order: 3, node: 'identity', action: 'verify_targets', description: 'Verify targeted identities are not compromised', timeoutMs: 8_000, optional: true,
        transform: (prev) => ({ lockedAccounts: prev.lockedAccounts }) },
      { order: 4, node: 'audit', action: 'log_brute_force', description: 'Log brute force incident with full attack pattern', timeoutMs: 5_000, optional: false,
        transform: (prev) => ({ attackPattern: prev.attackPattern, mitigationResult: prev.mitigationResult }) },
    ],
    cooldownMs: 30_000,
    priority: 'high',
    governanceOverridable: true,
    status: 'active',
  },

  // ── 13. INSIDER THREAT ──
  {
    id: 'INSIDER_THREAT',
    name: 'Insider Threat Detection',
    description: 'Ethics flags behavioral anomaly → defense correlation → identity profiling → governance',
    trigger: {
      sourceNode: 'conscience',
      signalType: 'behavioral_anomaly',
      condition: (p) => p.anomalyType === 'insider' && typeof p.severity === 'number' && (p.severity as number) > 60,
      description: 'CONSCIENCE detects insider behavioral anomaly severity > 60',
    },
    stages: [
      { order: 1, node: 'conscience', action: 'profile_behavior', description: 'Build behavioral profile deviation report', timeoutMs: 10_000, optional: false },
      { order: 2, node: 'defense', action: 'correlate_actions', description: 'Correlate anomalous actions across system surfaces', timeoutMs: 12_000, optional: false,
        transform: (prev) => ({ behaviorProfile: prev.profile, deviationScore: prev.deviation }) },
      { order: 3, node: 'identity', action: 'enrich_actor_context', description: 'Enrich with full actor context and access history', timeoutMs: 8_000, optional: false,
        transform: (prev) => ({ correlations: prev.correlations, actorId: prev.actorId }) },
      { order: 4, node: 'governance', action: 'insider_escalation', description: 'Escalate with recommendation to governance', timeoutMs: 5_000, optional: false,
        transform: (prev) => ({ actorContext: prev.context, threatLevel: prev.threatLevel }) },
    ],
    cooldownMs: 120_000,
    priority: 'high',
    governanceOverridable: false,
    status: 'active',
  },

  // ── 14. ZERO DAY RESPONSE ──
  {
    id: 'ZERO_DAY_RESPONSE',
    name: 'Zero-Day Response',
    description: 'Unknown attack vector → immunity signature → system hardening → mesh alert',
    trigger: {
      sourceNode: 'defense',
      signalType: 'unknown_attack_vector',
      condition: (p) => p.knownSignature === false,
      description: 'DEFENSE encounters unknown attack with no matching signature',
    },
    stages: [
      { order: 1, node: 'defense', action: 'quarantine_vector', description: 'Isolate unknown attack vector and capture payload', timeoutMs: 3_000, optional: false },
      { order: 2, node: 'immunity', action: 'generate_signature', description: 'Generate new immunity signature from captured payload', timeoutMs: 15_000, optional: false,
        transform: (prev) => ({ capturedPayload: prev.payload, vector: prev.vector }) },
      { order: 3, node: 'system', action: 'emergency_harden', description: 'Apply emergency hardening to exposed surfaces', timeoutMs: 10_000, optional: false,
        transform: (prev) => ({ signature: prev.signature, exposedSurfaces: prev.surfaces }) },
      { order: 4, node: 'nerve', action: 'broadcast_alert', description: 'Broadcast zero-day alert across entire mesh', timeoutMs: 3_000, optional: false,
        transform: (prev) => ({ hardenedSurfaces: prev.surfaces, signatureId: prev.signatureId }) },
    ],
    cooldownMs: 10_000,
    priority: 'critical',
    governanceOverridable: false,
    status: 'active',
  },

  // ── 15. DDOS MITIGATION ──
  {
    id: 'DDOS_MITIGATION',
    name: 'DDoS Mitigation',
    description: 'Traffic flood → circuit breaking → load shedding → system stabilization',
    trigger: {
      sourceNode: 'defense',
      signalType: 'traffic_flood',
      condition: (p) => typeof p.requestsPerSecond === 'number' && (p.requestsPerSecond as number) > 1000,
      description: 'DEFENSE detects traffic flood exceeding 1000 req/s',
    },
    stages: [
      { order: 1, node: 'defense', action: 'activate_shield', description: 'Activate DDoS shield and begin traffic filtering', timeoutMs: 2_000, optional: false },
      { order: 2, node: 'nerve', action: 'circuit_break_edges', description: 'Circuit-break external-facing mesh edges', timeoutMs: 3_000, optional: false,
        transform: (prev) => ({ shieldId: prev.shieldId, filteredSources: prev.sources }) },
      { order: 3, node: 'cortex', action: 'emergency_shed', description: 'Shed all non-critical pipeline workloads', timeoutMs: 5_000, optional: false,
        transform: (prev) => ({ brokenEdges: prev.edges, activeLoad: prev.load }) },
      { order: 4, node: 'system', action: 'stabilize', description: 'Force system into minimal stable configuration', timeoutMs: 8_000, optional: false,
        transform: (prev) => ({ shedTasks: prev.tasks, remainingLoad: prev.load }) },
    ],
    cooldownMs: 30_000,
    priority: 'critical',
    governanceOverridable: true,
    status: 'active',
  },

  // ── 16. EXFILTRATION BLOCK ──
  {
    id: 'EXFILTRATION_BLOCK',
    name: 'Data Exfiltration Block',
    description: 'Unusual data flow → defense validation → access restriction → audit trail',
    trigger: {
      sourceNode: 'phantom',
      signalType: 'unusual_data_flow',
      condition: (p) => typeof p.volumeBytes === 'number' && (p.volumeBytes as number) > 10_000_000,
      description: 'PHANTOM detects unusual data flow exceeding 10MB',
    },
    stages: [
      { order: 1, node: 'phantom', action: 'trace_flow', description: 'Trace data flow path and identify exfiltration target', timeoutMs: 8_000, optional: false },
      { order: 2, node: 'defense', action: 'validate_exfiltration', description: 'Confirm exfiltration vs legitimate transfer', timeoutMs: 10_000, optional: false,
        transform: (prev) => ({ flowPath: prev.flowPath, destination: prev.destination }) },
      { order: 3, node: 'access', action: 'restrict_data_access', description: 'Restrict access to affected data surfaces', timeoutMs: 5_000, optional: false,
        transform: (prev) => ({ confirmed: prev.isExfiltration, affectedData: prev.data }) },
      { order: 4, node: 'audit', action: 'exfiltration_report', description: 'Generate complete exfiltration incident report', timeoutMs: 8_000, optional: false,
        transform: (prev) => ({ restrictions: prev.restrictions, flowPath: prev.flowPath }) },
    ],
    cooldownMs: 20_000,
    priority: 'critical',
    governanceOverridable: false,
    status: 'active',
  },

  // ═══════════════════════════════════════════════════════════
  // INTELLIGENCE & LEARNING (17–24)
  // ═══════════════════════════════════════════════════════════

  // ── 17. PATTERN RECOGNITION ──
  {
    id: 'PATTERN_RECOGNITION',
    name: 'Pattern Recognition Pipeline',
    description: 'Significant pattern → predictive modeling → memory consolidation → evolution adaptation',
    trigger: {
      sourceNode: 'brain',
      signalType: 'pattern_emerged',
      condition: (p) => typeof p.patternStrength === 'number' && (p.patternStrength as number) > 70,
      description: 'BRAIN detects emergent pattern with strength > 70',
    },
    stages: [
      { order: 1, node: 'brain', action: 'analyze_pattern', description: 'Deep analysis of emergent pattern structure', timeoutMs: 12_000, optional: false },
      { order: 2, node: 'oracle', action: 'model_prediction', description: 'Build predictive model from pattern data', timeoutMs: 15_000, optional: false,
        transform: (prev) => ({ pattern: prev.pattern, context: prev.context }) },
      { order: 3, node: 'memory', action: 'consolidate_pattern', description: 'Store pattern in long-term memory with cross-references', timeoutMs: 8_000, optional: false,
        transform: (prev) => ({ prediction: prev.prediction, pattern: prev.pattern }) },
      { order: 4, node: 'evolution', action: 'adapt_to_pattern', description: 'Adjust system behavior based on new pattern knowledge', timeoutMs: 10_000, optional: true,
        transform: (prev) => ({ memoryRef: prev.memoryRef, prediction: prev.prediction }) },
    ],
    cooldownMs: 60_000,
    priority: 'normal',
    governanceOverridable: true,
    status: 'active',
  },

  // ── 18. ANOMALY LEARNING ──
  {
    id: 'ANOMALY_LEARNING',
    name: 'Anomaly Learning Cycle',
    description: 'Resolved anomaly → reasoning analysis → memory storage → evolution adaptation',
    trigger: {
      sourceNode: 'vision',
      signalType: 'anomaly_resolved',
      condition: (p) => p.wasNovel === true,
      description: 'VISION resolves a novel anomaly not previously seen',
    },
    stages: [
      { order: 1, node: 'vision', action: 'extract_anomaly_signature', description: 'Extract signature and resolution path from resolved anomaly', timeoutMs: 8_000, optional: false },
      { order: 2, node: 'brain', action: 'reason_about_anomaly', description: 'Analyze why anomaly occurred and resolution effectiveness', timeoutMs: 12_000, optional: false,
        transform: (prev) => ({ signature: prev.signature, resolution: prev.resolution }) },
      { order: 3, node: 'memory', action: 'store_lesson', description: 'Store anomaly lesson in experiential memory', timeoutMs: 5_000, optional: false,
        transform: (prev) => ({ analysis: prev.analysis, lesson: prev.lesson }) },
      { order: 4, node: 'evolution', action: 'update_detectors', description: 'Update detection heuristics with new anomaly knowledge', timeoutMs: 10_000, optional: true,
        transform: (prev) => ({ memoryRef: prev.memoryRef, signature: prev.signature }) },
    ],
    cooldownMs: 30_000,
    priority: 'normal',
    governanceOverridable: true,
    status: 'active',
  },

  // ── 19. KNOWLEDGE SYNTHESIS ──
  {
    id: 'KNOWLEDGE_SYNTHESIS',
    name: 'Knowledge Synthesis',
    description: 'Knowledge threshold → memory synthesis → artifact creation → atlas registration',
    trigger: {
      sourceNode: 'brain',
      signalType: 'knowledge_threshold',
      condition: (p) => typeof p.relatedFacts === 'number' && (p.relatedFacts as number) >= 5,
      description: 'BRAIN accumulates 5+ related knowledge facts in a domain',
    },
    stages: [
      { order: 1, node: 'brain', action: 'synthesize_knowledge', description: 'Synthesize related facts into cohesive knowledge structure', timeoutMs: 15_000, optional: false },
      { order: 2, node: 'memory', action: 'create_knowledge_graph', description: 'Build knowledge graph connections from synthesis', timeoutMs: 10_000, optional: false,
        transform: (prev) => ({ synthesis: prev.synthesis, domain: prev.domain }) },
      { order: 3, node: 'forge', action: 'create_knowledge_artifact', description: 'Package knowledge into reusable artifact', timeoutMs: 12_000, optional: true,
        transform: (prev) => ({ graphRef: prev.graphRef, synthesis: prev.synthesis }) },
      { order: 4, node: 'atlas', action: 'register_knowledge', description: 'Register knowledge artifact in capability atlas', timeoutMs: 5_000, optional: false,
        transform: (prev) => ({ artifact: prev.artifact, domain: prev.domain }) },
    ],
    cooldownMs: 180_000,
    priority: 'normal',
    governanceOverridable: true,
    status: 'active',
  },

  // ── 20. PREDICTIVE ALERT ──
  {
    id: 'PREDICTIVE_ALERT',
    name: 'Predictive Alert',
    description: 'Oracle prediction → brain validation → cortex preemption → governance notification',
    trigger: {
      sourceNode: 'oracle',
      signalType: 'high_confidence_prediction',
      condition: (p) => typeof p.confidence === 'number' && (p.confidence as number) > 85 && p.category === 'risk',
      description: 'ORACLE high-confidence risk prediction > 85%',
    },
    stages: [
      { order: 1, node: 'oracle', action: 'elaborate_prediction', description: 'Elaborate prediction with supporting evidence and timeline', timeoutMs: 10_000, optional: false },
      { order: 2, node: 'brain', action: 'validate_prediction', description: 'Cross-validate prediction against reasoning models', timeoutMs: 12_000, optional: false,
        transform: (prev) => ({ prediction: prev.prediction, evidence: prev.evidence }) },
      { order: 3, node: 'cortex', action: 'preemptive_action', description: 'Execute preemptive pipeline adjustments', timeoutMs: 10_000, optional: true,
        transform: (prev) => ({ validated: prev.validated, urgency: prev.urgency }) },
      { order: 4, node: 'governance', action: 'prediction_alert', description: 'Alert governance with prediction and actions taken', timeoutMs: 5_000, optional: false,
        transform: (prev) => ({ prediction: prev.prediction, actionsTaken: prev.actions }) },
    ],
    cooldownMs: 120_000,
    priority: 'high',
    governanceOverridable: true,
    status: 'active',
  },

  // ── 21. BEHAVIORAL DRIFT ──
  {
    id: 'BEHAVIORAL_DRIFT',
    name: 'Behavioral Drift Correction',
    description: 'System behavior drifting → reasoning analysis → ethics check → evolution correction',
    trigger: {
      sourceNode: 'observer',
      signalType: 'behavioral_drift',
      condition: (p) => typeof p.driftMagnitude === 'number' && (p.driftMagnitude as number) > 0.3,
      description: 'OBSERVER detects behavioral drift magnitude > 0.3',
    },
    stages: [
      { order: 1, node: 'observer', action: 'measure_drift', description: 'Quantify drift vectors and affected behaviors', timeoutMs: 8_000, optional: false },
      { order: 2, node: 'brain', action: 'analyze_drift_cause', description: 'Determine root cause of behavioral drift', timeoutMs: 12_000, optional: false,
        transform: (prev) => ({ driftVectors: prev.vectors, magnitude: prev.magnitude }) },
      { order: 3, node: 'conscience', action: 'assess_drift_impact', description: 'Assess ethical implications of drift direction', timeoutMs: 8_000, optional: true,
        transform: (prev) => ({ cause: prev.cause, driftDirection: prev.direction }) },
      { order: 4, node: 'evolution', action: 'correct_drift', description: 'Apply corrective evolution to realign behavior', timeoutMs: 10_000, optional: false,
        transform: (prev) => ({ correction: prev.correction, ethicsCleared: prev.cleared }) },
    ],
    cooldownMs: 300_000,
    priority: 'high',
    governanceOverridable: true,
    status: 'active',
  },

  // ── 22. SKILL ACQUISITION ──
  {
    id: 'SKILL_ACQUISITION',
    name: 'Skill Acquisition',
    description: 'Skill gap identified → brain training → memory encoding → atlas registration',
    trigger: {
      sourceNode: 'evolution',
      signalType: 'skill_gap_identified',
      condition: (p) => typeof p.gapSeverity === 'number' && (p.gapSeverity as number) > 50,
      description: 'EVOLUTION identifies skill gap with severity > 50',
    },
    stages: [
      { order: 1, node: 'evolution', action: 'define_skill_target', description: 'Define target skill specification and acquisition path', timeoutMs: 10_000, optional: false },
      { order: 2, node: 'brain', action: 'acquire_skill', description: 'Execute skill acquisition through reasoning and practice', timeoutMs: 20_000, optional: false,
        transform: (prev) => ({ skillSpec: prev.spec, acquisitionPath: prev.path }) },
      { order: 3, node: 'memory', action: 'encode_skill', description: 'Encode acquired skill in procedural memory', timeoutMs: 8_000, optional: false,
        transform: (prev) => ({ acquiredSkill: prev.skill, proficiency: prev.proficiency }) },
      { order: 4, node: 'atlas', action: 'register_capability', description: 'Register new capability in system atlas', timeoutMs: 5_000, optional: false,
        transform: (prev) => ({ skill: prev.skill, memoryRef: prev.memoryRef }) },
    ],
    cooldownMs: 600_000,
    priority: 'normal',
    governanceOverridable: true,
    status: 'active',
  },

  // ── 23. HEURISTIC REFINEMENT ──
  {
    id: 'HEURISTIC_REFINEMENT',
    name: 'Heuristic Refinement',
    description: 'Dream produces heuristic → brain validation → oracle testing → evolution adoption',
    trigger: {
      sourceNode: 'dream',
      signalType: 'heuristic_generated',
      condition: (p) => typeof p.noveltyScore === 'number' && (p.noveltyScore as number) > 40,
      description: 'DREAM generates heuristic with novelty > 40',
    },
    stages: [
      { order: 1, node: 'dream', action: 'package_heuristic', description: 'Package heuristic with context and rationale', timeoutMs: 5_000, optional: false },
      { order: 2, node: 'brain', action: 'validate_heuristic', description: 'Validate heuristic against known reasoning models', timeoutMs: 12_000, optional: false,
        transform: (prev) => ({ heuristic: prev.heuristic, rationale: prev.rationale }) },
      { order: 3, node: 'oracle', action: 'test_heuristic', description: 'Run predictive testing against historical data', timeoutMs: 15_000, optional: true,
        transform: (prev) => ({ validated: prev.validated, heuristic: prev.heuristic }) },
      { order: 4, node: 'evolution', action: 'adopt_heuristic', description: 'Adopt validated heuristic into active configuration', timeoutMs: 8_000, optional: false,
        transform: (prev) => ({ testResults: prev.results, heuristic: prev.heuristic }) },
    ],
    cooldownMs: 300_000,
    priority: 'normal',
    governanceOverridable: true,
    status: 'active',
  },

  // ── 24. CONTEXT ENRICHMENT ──
  {
    id: 'CONTEXT_ENRICHMENT',
    name: 'Context Enrichment Pipeline',
    description: 'Complex input decoded → brain reasoning → memory augmentation → encoded output',
    trigger: {
      sourceNode: 'decode',
      signalType: 'complex_input',
      condition: (p) => typeof p.complexity === 'number' && (p.complexity as number) > 7,
      description: 'DECODE encounters input with complexity > 7',
    },
    stages: [
      { order: 1, node: 'decode', action: 'deep_parse', description: 'Deep parse input with semantic analysis', timeoutMs: 10_000, optional: false },
      { order: 2, node: 'brain', action: 'reason_context', description: 'Apply reasoning to enrich parsed context', timeoutMs: 15_000, optional: false,
        transform: (prev) => ({ parsedInput: prev.parsed, semantics: prev.semantics }) },
      { order: 3, node: 'memory', action: 'augment_context', description: 'Augment with relevant historical context from memory', timeoutMs: 8_000, optional: true,
        transform: (prev) => ({ enrichedContext: prev.context, reasoningChain: prev.chain }) },
      { order: 4, node: 'encode', action: 'generate_enriched', description: 'Generate output with full enriched context', timeoutMs: 12_000, optional: false,
        transform: (prev) => ({ fullContext: prev.context, augmentations: prev.augmentations }) },
    ],
    cooldownMs: 15_000,
    priority: 'normal',
    governanceOverridable: true,
    status: 'active',
  },

  // ═══════════════════════════════════════════════════════════
  // OPERATIONS & INFRASTRUCTURE (25–32)
  // ═══════════════════════════════════════════════════════════

  // ── 25. RESOURCE EXHAUSTION ──
  {
    id: 'RESOURCE_EXHAUSTION',
    name: 'Resource Exhaustion Response',
    description: 'Resource critically low → pipeline shedding → optimization → evolution adaptation',
    trigger: {
      sourceNode: 'system',
      signalType: 'resource_critical',
      condition: (p) => typeof p.utilizationPct === 'number' && (p.utilizationPct as number) > 90,
      description: 'SYSTEM resource utilization exceeds 90%',
    },
    stages: [
      { order: 1, node: 'system', action: 'identify_consumers', description: 'Identify top resource consumers and waste', timeoutMs: 5_000, optional: false },
      { order: 2, node: 'cortex', action: 'shed_non_critical', description: 'Shed non-critical pipeline workloads', timeoutMs: 5_000, optional: false,
        transform: (prev) => ({ topConsumers: prev.consumers, wasteReport: prev.waste }) },
      { order: 3, node: 'engineer', action: 'optimize_allocation', description: 'Optimize resource allocation across remaining workloads', timeoutMs: 10_000, optional: false,
        transform: (prev) => ({ shedTasks: prev.shedTasks, freedResources: prev.freed }) },
      { order: 4, node: 'evolution', action: 'adapt_thresholds', description: 'Adjust resource thresholds to prevent recurrence', timeoutMs: 8_000, optional: true,
        transform: (prev) => ({ optimization: prev.optimization, pattern: prev.pattern }) },
    ],
    cooldownMs: 120_000,
    priority: 'high',
    governanceOverridable: true,
    status: 'active',
  },

  // ── 26. CONFIG DRIFT ──
  {
    id: 'CONFIG_DRIFT',
    name: 'Configuration Drift Detection',
    description: 'Config change detected → audit verification → governance approval → engineer correction',
    trigger: {
      sourceNode: 'system',
      signalType: 'config_changed',
      condition: (p) => p.changeType === 'drift' || p.unauthorized === true,
      description: 'SYSTEM detects unauthorized or drifted configuration change',
    },
    stages: [
      { order: 1, node: 'system', action: 'snapshot_config', description: 'Capture current config state and compute diff', timeoutMs: 5_000, optional: false },
      { order: 2, node: 'audit', action: 'verify_change_auth', description: 'Verify if change was authorized via audit trail', timeoutMs: 8_000, optional: false,
        transform: (prev) => ({ diff: prev.diff, changeTimestamp: prev.timestamp }) },
      { order: 3, node: 'governance', action: 'approve_or_revert', description: 'Decision: approve drift or request reversion', timeoutMs: 10_000, optional: false,
        transform: (prev) => ({ authorized: prev.authorized, diff: prev.diff }) },
      { order: 4, node: 'engineer', action: 'apply_correction', description: 'Apply approved correction or enforce desired state', timeoutMs: 8_000, optional: false,
        transform: (prev) => ({ decision: prev.decision, targetState: prev.targetState }) },
    ],
    cooldownMs: 60_000,
    priority: 'high',
    governanceOverridable: true,
    status: 'active',
  },

  // ── 27. TOPOLOGY REPAIR ──
  {
    id: 'TOPOLOGY_REPAIR',
    name: 'Topology Repair',
    description: 'Mesh topology degraded → system isolation → medic diagnosis → cortex rerouting',
    trigger: {
      sourceNode: 'nerve',
      signalType: 'topology_degraded',
      condition: (p) => typeof p.disconnectedNodes === 'number' && (p.disconnectedNodes as number) >= 1,
      description: 'NERVE detects 1+ disconnected nodes in topology',
    },
    stages: [
      { order: 1, node: 'nerve', action: 'map_damage', description: 'Map full extent of topology damage', timeoutMs: 5_000, optional: false },
      { order: 2, node: 'system', action: 'isolate_damaged', description: 'Isolate damaged topology segments', timeoutMs: 5_000, optional: false,
        transform: (prev) => ({ damageMap: prev.damageMap, affectedEdges: prev.edges }) },
      { order: 3, node: 'medic', action: 'diagnose_connectivity', description: 'Diagnose root cause of connectivity loss', timeoutMs: 10_000, optional: false,
        transform: (prev) => ({ isolatedSegments: prev.segments }) },
      { order: 4, node: 'cortex', action: 'reroute_and_heal', description: 'Reroute affected pipelines and heal topology', timeoutMs: 12_000, optional: false,
        transform: (prev) => ({ diagnosis: prev.diagnosis, repairPlan: prev.plan }) },
    ],
    cooldownMs: 45_000,
    priority: 'high',
    governanceOverridable: true,
    status: 'active',
  },

  // ── 28. SIGNAL DEGRADATION ──
  {
    id: 'SIGNAL_DEGRADATION',
    name: 'Signal Degradation Response',
    description: 'Signal quality dropping → observer profiling → engineer repair → system verification',
    trigger: {
      sourceNode: 'nerve',
      signalType: 'signal_quality_low',
      condition: (p) => typeof p.qualityScore === 'number' && (p.qualityScore as number) < 50,
      description: 'NERVE signal quality drops below 50',
    },
    stages: [
      { order: 1, node: 'nerve', action: 'isolate_degraded_paths', description: 'Identify and isolate degraded signal paths', timeoutMs: 5_000, optional: false },
      { order: 2, node: 'observer', action: 'profile_degradation', description: 'Profile degradation pattern and contributing factors', timeoutMs: 8_000, optional: false,
        transform: (prev) => ({ degradedPaths: prev.paths, isolationResult: prev.result }) },
      { order: 3, node: 'engineer', action: 'repair_signal_path', description: 'Repair or replace degraded signal paths', timeoutMs: 12_000, optional: false,
        transform: (prev) => ({ profile: prev.profile, rootCause: prev.rootCause }) },
      { order: 4, node: 'system', action: 'verify_signal_health', description: 'Verify signal health post-repair', timeoutMs: 5_000, optional: false,
        transform: (prev) => ({ repairedPaths: prev.repairedPaths }) },
    ],
    cooldownMs: 60_000,
    priority: 'high',
    governanceOverridable: true,
    status: 'active',
  },

  // ── 29. QUOTA BREACH ──
  {
    id: 'QUOTA_BREACH',
    name: 'Quota Breach Response',
    description: 'Resource quota exceeded → governance notification → cortex throttling → system enforcement',
    trigger: {
      sourceNode: 'economy',
      signalType: 'quota_exceeded',
      condition: (p) => typeof p.overagePct === 'number' && (p.overagePct as number) > 10,
      description: 'ECONOMY detects quota overage exceeding 10%',
    },
    stages: [
      { order: 1, node: 'economy', action: 'assess_overage', description: 'Assess overage scope and cost impact', timeoutMs: 5_000, optional: false },
      { order: 2, node: 'governance', action: 'quota_decision', description: 'Governance decides: extend quota or enforce limit', timeoutMs: 8_000, optional: false,
        transform: (prev) => ({ overage: prev.overage, costImpact: prev.costImpact }) },
      { order: 3, node: 'cortex', action: 'throttle_pipelines', description: 'Throttle pipeline throughput to enforce limit', timeoutMs: 5_000, optional: false,
        transform: (prev) => ({ decision: prev.decision, limit: prev.newLimit }) },
      { order: 4, node: 'system', action: 'enforce_quota', description: 'System-level quota enforcement and monitoring', timeoutMs: 5_000, optional: false,
        transform: (prev) => ({ throttleResult: prev.result, enforcement: prev.enforcement }) },
    ],
    cooldownMs: 300_000,
    priority: 'high',
    governanceOverridable: true,
    status: 'active',
  },

  // ── 30. PIPELINE STALL ──
  {
    id: 'PIPELINE_STALL',
    name: 'Pipeline Stall Recovery',
    description: 'Pipeline stalled → medic diagnosis → engineer repair → nerve health check',
    trigger: {
      sourceNode: 'cortex',
      signalType: 'pipeline_stalled',
      condition: (p) => typeof p.stalledDurationMs === 'number' && (p.stalledDurationMs as number) > 30_000,
      description: 'CORTEX detects pipeline stalled for 30+ seconds',
    },
    stages: [
      { order: 1, node: 'cortex', action: 'capture_pipeline_state', description: 'Capture full pipeline state at point of stall', timeoutMs: 5_000, optional: false },
      { order: 2, node: 'medic', action: 'diagnose_stall', description: 'Diagnose stall root cause (deadlock, resource, dependency)', timeoutMs: 10_000, optional: false,
        transform: (prev) => ({ pipelineState: prev.state, stalledStage: prev.stage }) },
      { order: 3, node: 'engineer', action: 'unblock_pipeline', description: 'Apply fix to unblock stalled pipeline', timeoutMs: 12_000, optional: false,
        transform: (prev) => ({ diagnosis: prev.diagnosis, stallType: prev.stallType }) },
      { order: 4, node: 'nerve', action: 'verify_flow', description: 'Verify signal flow is restored post-repair', timeoutMs: 5_000, optional: true,
        transform: (prev) => ({ unblockedPipeline: prev.pipelineId }) },
    ],
    cooldownMs: 60_000,
    priority: 'high',
    governanceOverridable: true,
    status: 'active',
  },

  // ── 31. STORAGE OVERFLOW ──
  {
    id: 'STORAGE_OVERFLOW',
    name: 'Storage Overflow Prevention',
    description: 'Storage nearing capacity → system cleanup → engineer optimization → evolution policy',
    trigger: {
      sourceNode: 'memory',
      signalType: 'storage_warning',
      condition: (p) => typeof p.usagePct === 'number' && (p.usagePct as number) > 85,
      description: 'MEMORY storage usage exceeds 85%',
    },
    stages: [
      { order: 1, node: 'memory', action: 'identify_reclaimable', description: 'Identify reclaimable storage (expired, duplicate, cold)', timeoutMs: 10_000, optional: false },
      { order: 2, node: 'system', action: 'execute_cleanup', description: 'Execute storage cleanup of identified targets', timeoutMs: 15_000, optional: false,
        transform: (prev) => ({ reclaimable: prev.reclaimable, totalBytes: prev.totalBytes }) },
      { order: 3, node: 'engineer', action: 'optimize_storage', description: 'Apply storage optimization (compression, dedup)', timeoutMs: 12_000, optional: true,
        transform: (prev) => ({ freedBytes: prev.freedBytes, remainingUsage: prev.usage }) },
      { order: 4, node: 'evolution', action: 'adjust_retention', description: 'Adjust data retention policies to prevent recurrence', timeoutMs: 8_000, optional: true,
        transform: (prev) => ({ optimization: prev.optimization, usageAfter: prev.usage }) },
    ],
    cooldownMs: 600_000,
    priority: 'normal',
    governanceOverridable: true,
    status: 'active',
  },

  // ── 32. NODE PROMOTION ──
  {
    id: 'NODE_PROMOTION',
    name: 'Node Promotion Ceremony',
    description: 'Node upgrade ready → system integration → mesh reconnection → atlas registration',
    trigger: {
      sourceNode: 'evolution',
      signalType: 'upgrade_ready',
      condition: (p) => p.upgradeType === 'major' || p.upgradeType === 'promotion',
      description: 'EVOLUTION determines node ready for major upgrade or promotion',
    },
    stages: [
      { order: 1, node: 'evolution', action: 'prepare_upgrade', description: 'Prepare upgrade package and migration plan', timeoutMs: 10_000, optional: false },
      { order: 2, node: 'system', action: 'integrate_upgrade', description: 'Integrate upgrade into system with rollback plan', timeoutMs: 15_000, optional: false,
        transform: (prev) => ({ upgradePackage: prev.package, migrationPlan: prev.plan }) },
      { order: 3, node: 'nerve', action: 'reconnect_mesh', description: 'Reconnect upgraded node to mesh topology', timeoutMs: 8_000, optional: false,
        transform: (prev) => ({ integratedNode: prev.nodeId, rollbackPlan: prev.rollback }) },
      { order: 4, node: 'atlas', action: 'update_registry', description: 'Update capability atlas with new node capabilities', timeoutMs: 5_000, optional: false,
        transform: (prev) => ({ nodeId: prev.nodeId, newCapabilities: prev.capabilities }) },
    ],
    cooldownMs: 300_000,
    priority: 'normal',
    governanceOverridable: true,
    status: 'active',
  },

  // ═══════════════════════════════════════════════════════════
  // GOVERNANCE & COMPLIANCE (33–38)
  // ═══════════════════════════════════════════════════════════

  // ── 33. ETHICS VIOLATION ──
  {
    id: 'ETHICS_VIOLATION',
    name: 'Ethics Violation Response',
    description: 'Ethics violation → governance review → audit recording → atlas enforcement',
    trigger: {
      sourceNode: 'conscience',
      signalType: 'ethics_violation',
      condition: (p) => p.severity === 'high' || p.severity === 'critical',
      description: 'CONSCIENCE detects high/critical ethics violation',
    },
    stages: [
      { order: 1, node: 'conscience', action: 'compile_violation', description: 'Compile full ethics violation report with evidence', timeoutMs: 8_000, optional: false },
      { order: 2, node: 'governance', action: 'ethics_review', description: 'Governance review and corrective action determination', timeoutMs: 10_000, optional: false,
        transform: (prev) => ({ violation: prev.violation, evidence: prev.evidence }) },
      { order: 3, node: 'audit', action: 'record_ethics_event', description: 'Record tamper-proof ethics audit event', timeoutMs: 5_000, optional: false,
        transform: (prev) => ({ review: prev.review, action: prev.correctiveAction }) },
      { order: 4, node: 'atlas', action: 'enforce_restriction', description: 'Enforce capability restriction if warranted', timeoutMs: 5_000, optional: true,
        transform: (prev) => ({ auditRef: prev.auditRef, restriction: prev.restriction }) },
    ],
    cooldownMs: 60_000,
    priority: 'high',
    governanceOverridable: false,
    status: 'active',
  },

  // ── 34. SLA BREACH ──
  {
    id: 'SLA_BREACH',
    name: 'SLA Breach Response',
    description: 'SLA breach → governance escalation → cortex remediation → audit recording',
    trigger: {
      sourceNode: 'treaty',
      signalType: 'sla_breach',
      condition: (p) => typeof p.breachSeverity === 'number' && (p.breachSeverity as number) > 50,
      description: 'TREATY detects SLA breach with severity > 50',
    },
    stages: [
      { order: 1, node: 'treaty', action: 'assess_breach', description: 'Assess SLA breach scope, impact, and liability', timeoutMs: 8_000, optional: false },
      { order: 2, node: 'governance', action: 'sla_escalation', description: 'Escalate breach to governance for decision', timeoutMs: 10_000, optional: false,
        transform: (prev) => ({ breach: prev.breach, impact: prev.impact }) },
      { order: 3, node: 'cortex', action: 'remediate_sla', description: 'Execute remediation pipelines to restore SLA compliance', timeoutMs: 15_000, optional: false,
        transform: (prev) => ({ decision: prev.decision, targetSla: prev.targetSla }) },
      { order: 4, node: 'audit', action: 'log_sla_event', description: 'Log complete SLA breach and remediation event', timeoutMs: 5_000, optional: false,
        transform: (prev) => ({ remediation: prev.remediation, slaRestored: prev.restored }) },
    ],
    cooldownMs: 120_000,
    priority: 'high',
    governanceOverridable: true,
    status: 'active',
  },

  // ── 35. SOVEREIGNTY ALERT ──
  {
    id: 'SOVEREIGNTY_ALERT',
    name: 'Sovereignty Alert',
    description: 'Data sovereignty violation → governance review → defense containment → audit',
    trigger: {
      sourceNode: 'sovereign',
      signalType: 'jurisdiction_violation',
      condition: (p) => p.crossBorder === true,
      description: 'SOVEREIGN detects cross-border data jurisdiction violation',
    },
    stages: [
      { order: 1, node: 'sovereign', action: 'assess_violation', description: 'Assess data sovereignty violation scope', timeoutMs: 8_000, optional: false },
      { order: 2, node: 'governance', action: 'sovereignty_review', description: 'Review violation against sovereignty policies', timeoutMs: 10_000, optional: false,
        transform: (prev) => ({ violation: prev.violation, affectedData: prev.data }) },
      { order: 3, node: 'defense', action: 'contain_data_flow', description: 'Contain unauthorized cross-border data flows', timeoutMs: 8_000, optional: false,
        transform: (prev) => ({ decision: prev.decision, dataFlows: prev.flows }) },
      { order: 4, node: 'audit', action: 'sovereignty_record', description: 'Record sovereignty event for compliance', timeoutMs: 5_000, optional: false,
        transform: (prev) => ({ containment: prev.containment, policyRef: prev.policy }) },
    ],
    cooldownMs: 60_000,
    priority: 'critical',
    governanceOverridable: false,
    status: 'active',
  },

  // ── 36. BIAS DETECTED ──
  {
    id: 'BIAS_DETECTED',
    name: 'Bias Detection Response',
    description: 'Bias detected → brain analysis → governance decision → audit record',
    trigger: {
      sourceNode: 'conscience',
      signalType: 'bias_detected',
      condition: (p) => typeof p.biasScore === 'number' && (p.biasScore as number) > 40,
      description: 'CONSCIENCE detects bias score exceeding 40',
    },
    stages: [
      { order: 1, node: 'conscience', action: 'analyze_bias', description: 'Deep analysis of bias type, source, and scope', timeoutMs: 10_000, optional: false },
      { order: 2, node: 'brain', action: 'debias_reasoning', description: 'Apply debiasing to affected reasoning chains', timeoutMs: 12_000, optional: false,
        transform: (prev) => ({ biasType: prev.biasType, affectedOutputs: prev.outputs }) },
      { order: 3, node: 'governance', action: 'bias_decision', description: 'Governance review and corrective policy update', timeoutMs: 8_000, optional: false,
        transform: (prev) => ({ debiasResult: prev.result, remainingBias: prev.residual }) },
      { order: 4, node: 'audit', action: 'log_bias_event', description: 'Log bias detection and correction event', timeoutMs: 5_000, optional: false,
        transform: (prev) => ({ decision: prev.decision, correctionApplied: prev.applied }) },
    ],
    cooldownMs: 120_000,
    priority: 'high',
    governanceOverridable: false,
    status: 'active',
  },

  // ── 37. GOVERNANCE OVERRIDE ──
  {
    id: 'GOVERNANCE_OVERRIDE',
    name: 'Governance Override Execution',
    description: 'Governance override issued → audit recording → system enforcement → mesh notification',
    trigger: {
      sourceNode: 'governance',
      signalType: 'override_issued',
      condition: (p) => p.overrideType === 'emergency' || p.overrideType === 'policy',
      description: 'GOVERNANCE issues emergency or policy override',
    },
    stages: [
      { order: 1, node: 'governance', action: 'prepare_override', description: 'Prepare override with justification and scope', timeoutMs: 5_000, optional: false },
      { order: 2, node: 'audit', action: 'record_override', description: 'Record override in tamper-proof audit trail', timeoutMs: 5_000, optional: false,
        transform: (prev) => ({ override: prev.override, justification: prev.justification }) },
      { order: 3, node: 'system', action: 'apply_override', description: 'Apply override at system level', timeoutMs: 10_000, optional: false,
        transform: (prev) => ({ auditRef: prev.auditRef, overrideSpec: prev.spec }) },
      { order: 4, node: 'nerve', action: 'broadcast_override', description: 'Broadcast override notification across mesh', timeoutMs: 3_000, optional: false,
        transform: (prev) => ({ appliedOverride: prev.override, affectedNodes: prev.nodes }) },
    ],
    cooldownMs: 30_000,
    priority: 'critical',
    governanceOverridable: false,
    status: 'active',
  },

  // ── 38. TREATY VIOLATION ──
  {
    id: 'TREATY_VIOLATION',
    name: 'Treaty Violation Response',
    description: 'Treaty violation → governance adjudication → defense enforcement → sovereignty containment',
    trigger: {
      sourceNode: 'treaty',
      signalType: 'treaty_violated',
      condition: (p) => typeof p.violationSeverity === 'number' && (p.violationSeverity as number) > 60,
      description: 'TREATY detects violation with severity > 60',
    },
    stages: [
      { order: 1, node: 'treaty', action: 'compile_violation', description: 'Compile full treaty violation report', timeoutMs: 8_000, optional: false },
      { order: 2, node: 'governance', action: 'adjudicate_treaty', description: 'Governance adjudication of treaty violation', timeoutMs: 12_000, optional: false,
        transform: (prev) => ({ violation: prev.violation, parties: prev.parties }) },
      { order: 3, node: 'defense', action: 'enforce_treaty', description: 'Enforce treaty terms through system controls', timeoutMs: 10_000, optional: false,
        transform: (prev) => ({ adjudication: prev.adjudication, enforcement: prev.enforcement }) },
      { order: 4, node: 'sovereign', action: 'jurisdictional_update', description: 'Update jurisdictional boundaries based on violation', timeoutMs: 8_000, optional: true,
        transform: (prev) => ({ enforcementResult: prev.result, jurisdictions: prev.jurisdictions }) },
    ],
    cooldownMs: 120_000,
    priority: 'high',
    governanceOverridable: false,
    status: 'active',
  },

  // ═══════════════════════════════════════════════════════════
  // DATA & PROCESSING (39–44)
  // ═══════════════════════════════════════════════════════════

  // ── 39. DATA CORRUPTION ──
  {
    id: 'DATA_CORRUPTION',
    name: 'Data Corruption Response',
    description: 'Corruption detected → medic diagnosis → audit forensics → system restore',
    trigger: {
      sourceNode: 'memory',
      signalType: 'checksum_mismatch',
      condition: (p) => typeof p.corruptedEntries === 'number' && (p.corruptedEntries as number) >= 1,
      description: 'MEMORY detects checksum mismatch in stored data',
    },
    stages: [
      { order: 1, node: 'memory', action: 'quarantine_corrupted', description: 'Quarantine corrupted data entries', timeoutMs: 5_000, optional: false },
      { order: 2, node: 'medic', action: 'diagnose_corruption', description: 'Diagnose corruption cause (bit rot, write error, attack)', timeoutMs: 10_000, optional: false,
        transform: (prev) => ({ quarantined: prev.quarantined, checksums: prev.checksums }) },
      { order: 3, node: 'audit', action: 'corruption_forensics', description: 'Record forensic trail of data corruption event', timeoutMs: 8_000, optional: false,
        transform: (prev) => ({ diagnosis: prev.diagnosis, corruptionType: prev.type }) },
      { order: 4, node: 'system', action: 'restore_from_backup', description: 'Restore data from last known good backup', timeoutMs: 15_000, optional: false,
        transform: (prev) => ({ forensicRef: prev.ref, affectedKeys: prev.keys }) },
    ],
    cooldownMs: 60_000,
    priority: 'critical',
    governanceOverridable: true,
    status: 'active',
  },

  // ── 40. ETL FAILURE ──
  {
    id: 'ETL_FAILURE',
    name: 'ETL Failure Recovery',
    description: 'Data ingestion failed → pipeline diagnostics → medic repair → engineer hardening',
    trigger: {
      sourceNode: 'harvest',
      signalType: 'ingestion_failed',
      condition: (p) => typeof p.failureCount === 'number' && (p.failureCount as number) >= 3,
      description: 'HARVEST ingestion fails 3+ times consecutively',
    },
    stages: [
      { order: 1, node: 'harvest', action: 'capture_failure_context', description: 'Capture ETL failure context and partial results', timeoutMs: 5_000, optional: false },
      { order: 2, node: 'cortex', action: 'analyze_pipeline', description: 'Analyze pipeline stage that failed', timeoutMs: 10_000, optional: false,
        transform: (prev) => ({ failureContext: prev.context, failedStage: prev.stage }) },
      { order: 3, node: 'medic', action: 'repair_pipeline', description: 'Attempt pipeline repair and data recovery', timeoutMs: 15_000, optional: false,
        transform: (prev) => ({ analysis: prev.analysis, repairOptions: prev.options }) },
      { order: 4, node: 'engineer', action: 'harden_etl', description: 'Apply hardening to prevent recurrence', timeoutMs: 10_000, optional: true,
        transform: (prev) => ({ repairResult: prev.result, weakPoint: prev.weakPoint }) },
    ],
    cooldownMs: 120_000,
    priority: 'normal',
    governanceOverridable: true,
    status: 'active',
  },

  // ── 41. TRANSLATION DRIFT ──
  {
    id: 'TRANSLATION_DRIFT',
    name: 'Translation Drift Correction',
    description: 'Translation quality degrading → ethics review → brain recalibration → evolution update',
    trigger: {
      sourceNode: 'lingua',
      signalType: 'quality_degradation',
      condition: (p) => typeof p.qualityDelta === 'number' && (p.qualityDelta as number) < -15,
      description: 'LINGUA translation quality drops by 15+ points',
    },
    stages: [
      { order: 1, node: 'lingua', action: 'assess_quality', description: 'Assess translation quality degradation scope', timeoutMs: 8_000, optional: false },
      { order: 2, node: 'conscience', action: 'check_cultural_bias', description: 'Check if degradation introduces cultural bias', timeoutMs: 10_000, optional: true,
        transform: (prev) => ({ affectedLanguages: prev.languages, samples: prev.samples }) },
      { order: 3, node: 'brain', action: 'recalibrate_models', description: 'Recalibrate translation reasoning models', timeoutMs: 15_000, optional: false,
        transform: (prev) => ({ biasCheck: prev.biasCheck, degradationCause: prev.cause }) },
      { order: 4, node: 'evolution', action: 'update_lingua_config', description: 'Update LINGUA configuration with improvements', timeoutMs: 8_000, optional: false,
        transform: (prev) => ({ recalibration: prev.recalibration, newModels: prev.models }) },
    ],
    cooldownMs: 300_000,
    priority: 'normal',
    governanceOverridable: true,
    status: 'active',
  },

  // ── 42. ENCODING ERROR ──
  {
    id: 'ENCODING_ERROR',
    name: 'Encoding Error Recovery',
    description: 'Code generation error → medic diagnosis → pipeline restart → engineer fix',
    trigger: {
      sourceNode: 'encode',
      signalType: 'generation_error',
      condition: (p) => typeof p.errorRate === 'number' && (p.errorRate as number) > 5,
      description: 'ENCODE error rate exceeds 5%',
    },
    stages: [
      { order: 1, node: 'encode', action: 'collect_error_samples', description: 'Collect error samples and generation context', timeoutMs: 5_000, optional: false },
      { order: 2, node: 'medic', action: 'diagnose_encoding', description: 'Diagnose encoding failure patterns', timeoutMs: 10_000, optional: false,
        transform: (prev) => ({ samples: prev.samples, generationContext: prev.context }) },
      { order: 3, node: 'cortex', action: 'restart_generation', description: 'Restart affected generation pipelines', timeoutMs: 8_000, optional: false,
        transform: (prev) => ({ diagnosis: prev.diagnosis, fixableIssues: prev.issues }) },
      { order: 4, node: 'engineer', action: 'patch_encoder', description: 'Apply patches to encoding engine', timeoutMs: 12_000, optional: true,
        transform: (prev) => ({ restartResult: prev.result, patchTargets: prev.targets }) },
    ],
    cooldownMs: 60_000,
    priority: 'normal',
    governanceOverridable: true,
    status: 'active',
  },

  // ── 43. DECODING FAILURE ──
  {
    id: 'DECODING_FAILURE',
    name: 'Decoding Failure Response',
    description: 'Input parsing fails → medic diagnosis → brain fallback → cortex reroute',
    trigger: {
      sourceNode: 'decode',
      signalType: 'parse_failure',
      condition: (p) => typeof p.consecutiveFailures === 'number' && (p.consecutiveFailures as number) >= 3,
      description: 'DECODE fails parsing 3+ consecutive inputs',
    },
    stages: [
      { order: 1, node: 'decode', action: 'capture_failed_inputs', description: 'Capture failed inputs with error context', timeoutMs: 5_000, optional: false },
      { order: 2, node: 'medic', action: 'diagnose_parser', description: 'Diagnose parser failure root cause', timeoutMs: 10_000, optional: false,
        transform: (prev) => ({ failedInputs: prev.inputs, errorContext: prev.context }) },
      { order: 3, node: 'brain', action: 'fallback_parse', description: 'Attempt fallback parsing with reasoning engine', timeoutMs: 12_000, optional: true,
        transform: (prev) => ({ diagnosis: prev.diagnosis, parseStrategy: prev.strategy }) },
      { order: 4, node: 'cortex', action: 'reroute_decoding', description: 'Reroute inputs to alternative decoding pipeline', timeoutMs: 8_000, optional: false,
        transform: (prev) => ({ fallbackResult: prev.result, alternativePipeline: prev.pipeline }) },
    ],
    cooldownMs: 30_000,
    priority: 'normal',
    governanceOverridable: true,
    status: 'active',
  },

  // ── 44. ARTIFACT CORRUPTION ──
  {
    id: 'ARTIFACT_CORRUPTION',
    name: 'Artifact Corruption Response',
    description: 'Artifact integrity fails → medic repair → audit recording → atlas deregistration',
    trigger: {
      sourceNode: 'forge',
      signalType: 'artifact_integrity_fail',
      condition: (p) => p.integrityValid === false,
      description: 'FORGE artifact integrity verification fails',
    },
    stages: [
      { order: 1, node: 'forge', action: 'isolate_artifact', description: 'Isolate corrupted artifact and prevent distribution', timeoutMs: 3_000, optional: false },
      { order: 2, node: 'medic', action: 'assess_corruption', description: 'Assess artifact corruption and recoverability', timeoutMs: 10_000, optional: false,
        transform: (prev) => ({ artifactId: prev.artifactId, corruptionHash: prev.hash }) },
      { order: 3, node: 'audit', action: 'log_artifact_event', description: 'Log artifact corruption event for compliance', timeoutMs: 5_000, optional: false,
        transform: (prev) => ({ assessment: prev.assessment, recoverability: prev.recoverable }) },
      { order: 4, node: 'atlas', action: 'deregister_artifact', description: 'Remove corrupted artifact from capability atlas', timeoutMs: 5_000, optional: false,
        transform: (prev) => ({ auditRef: prev.auditRef, artifactId: prev.artifactId }) },
    ],
    cooldownMs: 30_000,
    priority: 'high',
    governanceOverridable: true,
    status: 'active',
  },

  // ═══════════════════════════════════════════════════════════
  // ADVANCED AUTONOMOUS (45–50)
  // ═══════════════════════════════════════════════════════════

  // ── 45. DREAM CYCLE ──
  {
    id: 'DREAM_CYCLE',
    name: 'Dream Cycle Integration',
    description: 'Dream produces insight → brain evaluation → memory storage → evolution integration',
    trigger: {
      sourceNode: 'dream',
      signalType: 'insight_produced',
      condition: (p) => typeof p.insightQuality === 'number' && (p.insightQuality as number) > 60,
      description: 'DREAM produces insight with quality > 60',
    },
    stages: [
      { order: 1, node: 'dream', action: 'package_insight', description: 'Package dream insight with rationale and evidence', timeoutMs: 8_000, optional: false },
      { order: 2, node: 'brain', action: 'evaluate_insight', description: 'Evaluate insight validity and applicability', timeoutMs: 12_000, optional: false,
        transform: (prev) => ({ insight: prev.insight, rationale: prev.rationale }) },
      { order: 3, node: 'memory', action: 'store_insight', description: 'Store validated insight in long-term memory', timeoutMs: 5_000, optional: false,
        transform: (prev) => ({ evaluatedInsight: prev.insight, validity: prev.validity }) },
      { order: 4, node: 'evolution', action: 'integrate_insight', description: 'Integrate insight into active system evolution', timeoutMs: 10_000, optional: true,
        transform: (prev) => ({ memoryRef: prev.ref, insight: prev.insight }) },
    ],
    cooldownMs: 180_000,
    priority: 'normal',
    governanceOverridable: true,
    status: 'active',
  },

  // ── 46. ECHO DIVERGENCE ──
  {
    id: 'ECHO_DIVERGENCE',
    name: 'Echo Divergence Response',
    description: 'Digital twin diverges → observer measurement → brain analysis → evolution correction',
    trigger: {
      sourceNode: 'echo',
      signalType: 'twin_diverged',
      condition: (p) => typeof p.divergencePct === 'number' && (p.divergencePct as number) > 15,
      description: 'ECHO digital twin diverges by 15%+ from live system',
    },
    stages: [
      { order: 1, node: 'echo', action: 'capture_divergence', description: 'Capture divergence state between twin and live', timeoutMs: 8_000, optional: false },
      { order: 2, node: 'observer', action: 'measure_impact', description: 'Measure impact of divergence on predictions', timeoutMs: 10_000, optional: false,
        transform: (prev) => ({ divergenceState: prev.state, delta: prev.delta }) },
      { order: 3, node: 'brain', action: 'analyze_divergence', description: 'Analyze root cause and significance of divergence', timeoutMs: 12_000, optional: false,
        transform: (prev) => ({ impact: prev.impact, divergenceType: prev.type }) },
      { order: 4, node: 'evolution', action: 'resync_twin', description: 'Resynchronize twin or accept divergence as new baseline', timeoutMs: 10_000, optional: false,
        transform: (prev) => ({ analysis: prev.analysis, recommendation: prev.recommendation }) },
    ],
    cooldownMs: 300_000,
    priority: 'normal',
    governanceOverridable: true,
    status: 'active',
  },

  // ── 47. REFLEX CALIBRATION ──
  {
    id: 'REFLEX_CALIBRATION',
    name: 'Reflex Calibration',
    description: 'Edge latency threshold exceeded → observer profiling → engineer tuning → cortex integration',
    trigger: {
      sourceNode: 'reflex',
      signalType: 'latency_threshold_exceeded',
      condition: (p) => typeof p.edgeLatencyMs === 'number' && (p.edgeLatencyMs as number) > 50,
      description: 'REFLEX edge computing latency exceeds 50ms',
    },
    stages: [
      { order: 1, node: 'reflex', action: 'profile_edge', description: 'Profile edge computing paths and identify bottlenecks', timeoutMs: 5_000, optional: false },
      { order: 2, node: 'observer', action: 'benchmark_reflex', description: 'Benchmark reflex paths against performance targets', timeoutMs: 8_000, optional: false,
        transform: (prev) => ({ edgeProfile: prev.profile, bottlenecks: prev.bottlenecks }) },
      { order: 3, node: 'engineer', action: 'tune_reflex', description: 'Tune reflex paths for optimal latency', timeoutMs: 12_000, optional: false,
        transform: (prev) => ({ benchmark: prev.benchmark, tuningTargets: prev.targets }) },
      { order: 4, node: 'cortex', action: 'update_routing', description: 'Update pipeline routing to leverage tuned reflex paths', timeoutMs: 8_000, optional: true,
        transform: (prev) => ({ tunedPaths: prev.paths, latencyImprovement: prev.improvement }) },
    ],
    cooldownMs: 120_000,
    priority: 'normal',
    governanceOverridable: true,
    status: 'active',
  },

  // ── 48. COMPASS REALIGN ──
  {
    id: 'COMPASS_REALIGN',
    name: 'Compass Realignment',
    description: 'Trend shift detected → brain analysis → oracle prediction → atlas update',
    trigger: {
      sourceNode: 'compass',
      signalType: 'trend_shift',
      condition: (p) => typeof p.shiftMagnitude === 'number' && (p.shiftMagnitude as number) > 25,
      description: 'COMPASS detects trend shift with magnitude > 25',
    },
    stages: [
      { order: 1, node: 'compass', action: 'analyze_shift', description: 'Analyze trend shift direction and drivers', timeoutMs: 10_000, optional: false },
      { order: 2, node: 'brain', action: 'contextualize_trend', description: 'Contextualize trend within broader knowledge', timeoutMs: 12_000, optional: false,
        transform: (prev) => ({ shift: prev.shift, drivers: prev.drivers }) },
      { order: 3, node: 'oracle', action: 'project_trend', description: 'Project trend forward and assess implications', timeoutMs: 15_000, optional: true,
        transform: (prev) => ({ context: prev.context, trendVector: prev.vector }) },
      { order: 4, node: 'atlas', action: 'update_landscape', description: 'Update capability landscape based on trend shift', timeoutMs: 5_000, optional: false,
        transform: (prev) => ({ projection: prev.projection, recommendations: prev.recommendations }) },
    ],
    cooldownMs: 600_000,
    priority: 'normal',
    governanceOverridable: true,
    status: 'active',
  },

  // ── 49. SHADOW DETECTION ──
  {
    id: 'SHADOW_DETECTION',
    name: 'Shadow Activity Detection',
    description: 'Shadow activity detected → defense assessment → phantom trace → audit recording',
    trigger: {
      sourceNode: 'shadow',
      signalType: 'shadow_activity',
      condition: (p) => typeof p.suspicionScore === 'number' && (p.suspicionScore as number) > 65,
      description: 'SHADOW detects suspicious activity with score > 65',
    },
    stages: [
      { order: 1, node: 'shadow', action: 'capture_shadow', description: 'Capture shadow activity fingerprint and context', timeoutMs: 5_000, optional: false },
      { order: 2, node: 'defense', action: 'assess_shadow_threat', description: 'Assess shadow activity threat level', timeoutMs: 10_000, optional: false,
        transform: (prev) => ({ shadowFingerprint: prev.fingerprint, context: prev.context }) },
      { order: 3, node: 'phantom', action: 'deep_trace', description: 'Deep trace shadow activity through system layers', timeoutMs: 15_000, optional: false,
        transform: (prev) => ({ threatLevel: prev.threatLevel, attackSurface: prev.surface }) },
      { order: 4, node: 'audit', action: 'record_shadow_event', description: 'Record shadow detection event with full trace', timeoutMs: 5_000, optional: false,
        transform: (prev) => ({ traceResult: prev.trace, evidenceChain: prev.evidence }) },
    ],
    cooldownMs: 60_000,
    priority: 'high',
    governanceOverridable: true,
    status: 'active',
  },

  // ── 50. IMMUNITY UPDATE ──
  {
    id: 'IMMUNITY_UPDATE',
    name: 'Immunity Signature Update',
    description: 'New threat signature → defense integration → evolution adaptation → mesh propagation',
    trigger: {
      sourceNode: 'immunity',
      signalType: 'new_signature',
      condition: (p) => typeof p.signatureCount === 'number' && (p.signatureCount as number) >= 1,
      description: 'IMMUNITY generates 1+ new threat signatures',
    },
    stages: [
      { order: 1, node: 'immunity', action: 'validate_signatures', description: 'Validate new signatures against false-positive database', timeoutMs: 10_000, optional: false },
      { order: 2, node: 'defense', action: 'integrate_signatures', description: 'Integrate validated signatures into defense system', timeoutMs: 8_000, optional: false,
        transform: (prev) => ({ validatedSignatures: prev.signatures, fpRate: prev.fpRate }) },
      { order: 3, node: 'evolution', action: 'adapt_detection', description: 'Adapt detection algorithms with new signature knowledge', timeoutMs: 10_000, optional: true,
        transform: (prev) => ({ integratedCount: prev.count, coverage: prev.coverage }) },
      { order: 4, node: 'nerve', action: 'propagate_update', description: 'Propagate signature update across entire mesh', timeoutMs: 5_000, optional: false,
        transform: (prev) => ({ updatedAlgorithms: prev.algorithms, signatureIds: prev.ids }) },
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
