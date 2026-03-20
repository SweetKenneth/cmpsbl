/**
 * Standard Node Capabilities — Core Operations for All 40 Matrix Nodes
 * 
 * Surfaces 8 fundamental capabilities per uncovered node (15 nodes × 8 = 120).
 * These are standard operational capabilities intrinsic to each node's design,
 * distinct from Crown Jewel (high-value synergy) capabilities.
 * 
 * Covered nodes: ENGINEER, SHADOW, INTENT, NERVE, IMMUNITY, GOVERNANCE,
 *                AUDIT, IDENTITY, RELAY, ENCODE, ANALYTICS, ECONOMY,
 *                MEMORY, MEDIC, EVOLUTION
 */

import type { CapabilityDefinition, ModuleLayer } from './index';

// Use loose id typing since these extend beyond the original CapabilityId union
type StandardCapDef = Omit<CapabilityDefinition, 'id'> & { id: string };

// ============================================================================
// STANDARD NODE CAPABILITIES — 120 Total (15 Nodes × 8 Each)
// ============================================================================

export const STANDARD_NODE_CAPABILITIES: Record<string, StandardCapDef> = {

  // ═══════════════════════════════════════════════════════════════════════════
  // ENGINEER Node (8) — Autonomous Fleet Maintenance
  // ═══════════════════════════════════════════════════════════════════════════

  eng_health_poll: {
    id: 'eng_health_poll', name: 'Engine Health Poll',
    description: 'Polls all registered engines for heartbeat, latency, and error counters',
    modules: ['ENGINEER', 'VISION'], layer: 'Admin',
    userBenefit: 'Real-time visibility into engine fleet status',
    status: 'active', emergentFrom: 'engineer-core-v1', riskLevel: 'low', executionMode: 'sync',
  },
  eng_clm_trigger: {
    id: 'eng_clm_trigger', name: 'CLM Cycle Trigger',
    description: 'Initiates a Continuous Learning & Maintenance cycle across the fleet',
    modules: ['ENGINEER', 'BRAIN'], layer: 'Admin',
    userBenefit: 'Scheduled autonomous learning and upkeep',
    status: 'active', emergentFrom: 'engineer-core-v1', riskLevel: 'low', executionMode: 'async',
  },
  eng_proposal_submit: {
    id: 'eng_proposal_submit', name: 'Maintenance Proposal Submission',
    description: 'Submits non-disruptive repair or upgrade proposals for admin review',
    modules: ['ENGINEER', 'GOVERNANCE'], layer: 'Admin',
    userBenefit: 'Governed maintenance with human oversight',
    status: 'active', emergentFrom: 'engineer-core-v1', riskLevel: 'low', executionMode: 'async',
  },
  eng_dependency_check: {
    id: 'eng_dependency_check', name: 'Dependency Integrity Check',
    description: 'Validates inter-engine dependency graph for missing or circular references',
    modules: ['ENGINEER', 'SYSTEM'], layer: 'Admin',
    userBenefit: 'Prevent boot failures from broken dependencies',
    status: 'active', emergentFrom: 'engineer-core-v1', riskLevel: 'low', executionMode: 'sync',
  },
  eng_metric_collect: {
    id: 'eng_metric_collect', name: 'Fleet Metric Collector',
    description: 'Aggregates performance metrics from all engines into unified telemetry',
    modules: ['ENGINEER', 'ANALYTICS'], layer: 'Admin',
    userBenefit: 'Single source of truth for engine performance',
    status: 'active', emergentFrom: 'engineer-core-v1', riskLevel: 'low', executionMode: 'async',
  },
  eng_restart_engine: {
    id: 'eng_restart_engine', name: 'Engine Restart Controller',
    description: 'Performs graceful restart of a degraded engine with state preservation',
    modules: ['ENGINEER', 'CORE'], layer: 'Admin',
    userBenefit: 'Zero-downtime engine recovery',
    status: 'active', emergentFrom: 'engineer-core-v1', riskLevel: 'medium', executionMode: 'async',
  },
  eng_config_sync: {
    id: 'eng_config_sync', name: 'Engine Configuration Sync',
    description: 'Synchronizes engine configurations across all instances for consistency',
    modules: ['ENGINEER', 'SYSTEM'], layer: 'Admin',
    userBenefit: 'Consistent fleet configuration',
    status: 'active', emergentFrom: 'engineer-core-v1', riskLevel: 'low', executionMode: 'sync',
  },
  eng_report_generate: {
    id: 'eng_report_generate', name: 'Maintenance Report Generator',
    description: 'Generates human-readable maintenance reports with findings and recommendations',
    modules: ['ENGINEER', 'DECODE'], layer: 'Admin',
    userBenefit: 'Clear maintenance status at a glance',
    status: 'active', emergentFrom: 'engineer-core-v1', riskLevel: 'low', executionMode: 'async',
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // SHADOW Node (8) — Covert Parallel Validation
  // ═══════════════════════════════════════════════════════════════════════════

  shd_shadow_execute: {
    id: 'shd_shadow_execute', name: 'Shadow Execution',
    description: 'Runs a capability in shadow mode without affecting production state',
    modules: ['SHADOW', 'CORE'], layer: 'Operational',
    userBenefit: 'Test changes risk-free against live traffic',
    status: 'active', emergentFrom: 'shadow-core-v1', riskLevel: 'low', executionMode: 'async',
  },
  shd_divergence_check: {
    id: 'shd_divergence_check', name: 'Divergence Check',
    description: 'Compares shadow output against production output for discrepancies',
    modules: ['SHADOW', 'VISION'], layer: 'Operational',
    userBenefit: 'Detect regressions before they reach users',
    status: 'active', emergentFrom: 'shadow-core-v1', riskLevel: 'low', executionMode: 'sync',
  },
  shd_mesh_configure: {
    id: 'shd_mesh_configure', name: 'Shadow Mesh Configuration',
    description: 'Configures which modules participate in shadow runs and traffic ratios',
    modules: ['SHADOW', 'GOVERNANCE'], layer: 'Admin',
    userBenefit: 'Fine-grained control over shadow testing scope',
    status: 'active', emergentFrom: 'shadow-core-v1', riskLevel: 'low', executionMode: 'sync',
  },
  shd_replay: {
    id: 'shd_replay', name: 'Traffic Replay',
    description: 'Replays captured production traffic through shadow pipeline for validation',
    modules: ['SHADOW', 'MEMORY'], layer: 'Operational',
    userBenefit: 'Validate changes against real-world usage patterns',
    status: 'active', emergentFrom: 'shadow-core-v1', riskLevel: 'low', executionMode: 'async',
  },
  shd_verdict_emit: {
    id: 'shd_verdict_emit', name: 'Shadow Verdict Emitter',
    description: 'Emits pass/fail verdicts after shadow validation with confidence scores',
    modules: ['SHADOW', 'AUDIT'], layer: 'Operational',
    userBenefit: 'Clear go/no-go signals for promotion',
    status: 'active', emergentFrom: 'shadow-core-v1', riskLevel: 'low', executionMode: 'sync',
  },
  shd_state_isolate: {
    id: 'shd_state_isolate', name: 'State Isolation Barrier',
    description: 'Ensures shadow execution state is fully isolated from production',
    modules: ['SHADOW', 'DEFENSE'], layer: 'Kernel',
    userBenefit: 'Guaranteed no production side-effects',
    status: 'active', emergentFrom: 'shadow-core-v1', riskLevel: 'low', executionMode: 'sync',
  },
  shd_metric_capture: {
    id: 'shd_metric_capture', name: 'Shadow Metric Capture',
    description: 'Captures performance metrics during shadow runs for comparison',
    modules: ['SHADOW', 'ANALYTICS'], layer: 'Operational',
    userBenefit: 'Performance impact visibility before rollout',
    status: 'active', emergentFrom: 'shadow-core-v1', riskLevel: 'low', executionMode: 'async',
  },
  shd_promote_gate: {
    id: 'shd_promote_gate', name: 'Shadow Promotion Gate',
    description: 'Gates shadow-validated changes for promotion into production pipeline',
    modules: ['SHADOW', 'EVOLUTION'], layer: 'Operational',
    userBenefit: 'Only validated changes reach production',
    status: 'active', emergentFrom: 'shadow-core-v1', riskLevel: 'medium', executionMode: 'sync',
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // INTENT Node (8) — Purpose Resolution & Goal Tracking
  // ═══════════════════════════════════════════════════════════════════════════

  int_classify: {
    id: 'int_classify', name: 'Intent Classification',
    description: 'Classifies incoming requests into structured intent categories',
    modules: ['INTENT', 'DECODE'], layer: 'Cognitive',
    userBenefit: 'Accurate understanding of user goals',
    status: 'active', emergentFrom: 'intent-core-v1', riskLevel: 'low', executionMode: 'sync',
  },
  int_decompose: {
    id: 'int_decompose', name: 'Intent Decomposition',
    description: 'Breaks compound intents into atomic sub-intents with dependencies',
    modules: ['INTENT', 'CORTEX'], layer: 'Cognitive',
    userBenefit: 'Handle complex multi-part requests',
    status: 'active', emergentFrom: 'intent-core-v1', riskLevel: 'low', executionMode: 'sync',
  },
  int_confidence_score: {
    id: 'int_confidence_score', name: 'Intent Confidence Scoring',
    description: 'Scores confidence level for each classified intent with uncertainty bounds',
    modules: ['INTENT', 'BRAIN'], layer: 'Cognitive',
    userBenefit: 'Know when clarification is needed',
    status: 'active', emergentFrom: 'intent-core-v1', riskLevel: 'low', executionMode: 'sync',
  },
  int_slot_fill: {
    id: 'int_slot_fill', name: 'Slot Filling',
    description: 'Extracts and validates required parameters from user input for each intent',
    modules: ['INTENT', 'DECODE'], layer: 'Cognitive',
    userBenefit: 'Fewer follow-up questions needed',
    status: 'active', emergentFrom: 'intent-core-v1', riskLevel: 'low', executionMode: 'sync',
  },
  int_context_track: {
    id: 'int_context_track', name: 'Conversational Context Tracker',
    description: 'Tracks intent state across multi-turn conversations for continuity',
    modules: ['INTENT', 'MEMORY'], layer: 'Cognitive',
    userBenefit: 'Seamless multi-turn interactions',
    status: 'active', emergentFrom: 'intent-core-v1', riskLevel: 'low', executionMode: 'sync',
  },
  int_route: {
    id: 'int_route', name: 'Intent Router',
    description: 'Routes resolved intents to the appropriate module or capability for execution',
    modules: ['INTENT', 'NEXUS'], layer: 'Orchestrator',
    userBenefit: 'Right capability handles each request',
    status: 'active', emergentFrom: 'intent-core-v1', riskLevel: 'low', executionMode: 'sync',
  },
  int_disambiguate: {
    id: 'int_disambiguate', name: 'Intent Disambiguation',
    description: 'Resolves ambiguous intents using context, history, and probabilistic ranking',
    modules: ['INTENT', 'BRAIN'], layer: 'Cognitive',
    userBenefit: 'Correct interpretation even with vague input',
    status: 'active', emergentFrom: 'intent-core-v1', riskLevel: 'low', executionMode: 'sync',
  },
  int_goal_complete: {
    id: 'int_goal_complete', name: 'Goal Completion Tracker',
    description: 'Tracks whether the original user goal has been fully satisfied',
    modules: ['INTENT', 'VISION'], layer: 'Cognitive',
    userBenefit: 'Ensures requests are fully addressed',
    status: 'active', emergentFrom: 'intent-core-v1', riskLevel: 'low', executionMode: 'sync',
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // NERVE Node (8) — Inter-Node Signal Propagation
  // ═══════════════════════════════════════════════════════════════════════════

  nrv_signal_emit: {
    id: 'nrv_signal_emit', name: 'Signal Emission',
    description: 'Emits typed signals to target nodes with priority and TTL metadata',
    modules: ['NERVE', 'CORE'], layer: 'Kernel',
    userBenefit: 'Fast inter-module communication',
    status: 'active', emergentFrom: 'nerve-core-v1', riskLevel: 'low', executionMode: 'sync',
  },
  nrv_signal_receive: {
    id: 'nrv_signal_receive', name: 'Signal Receiver',
    description: 'Receives and deserializes incoming signals with validation and ordering',
    modules: ['NERVE', 'CORE'], layer: 'Kernel',
    userBenefit: 'Reliable message delivery between nodes',
    status: 'active', emergentFrom: 'nerve-core-v1', riskLevel: 'low', executionMode: 'sync',
  },
  nrv_heartbeat: {
    id: 'nrv_heartbeat', name: 'Heartbeat Monitor',
    description: 'Maintains heartbeat signals between connected nodes to detect failures',
    modules: ['NERVE', 'VISION'], layer: 'Kernel',
    userBenefit: 'Instant detection of node failures',
    status: 'active', emergentFrom: 'nerve-core-v1', riskLevel: 'low', executionMode: 'streaming',
  },
  nrv_backpressure: {
    id: 'nrv_backpressure', name: 'Backpressure Controller',
    description: 'Applies backpressure when downstream nodes are overloaded',
    modules: ['NERVE', 'CORE'], layer: 'Kernel',
    userBenefit: 'Prevents cascade overload across the mesh',
    status: 'active', emergentFrom: 'nerve-core-v1', riskLevel: 'low', executionMode: 'sync',
  },
  nrv_circuit_break: {
    id: 'nrv_circuit_break', name: 'Circuit Breaker',
    description: 'Opens circuit to failing nodes to prevent cascade failures',
    modules: ['NERVE', 'DEFENSE'], layer: 'Kernel',
    userBenefit: 'Fault isolation at the signal layer',
    status: 'active', emergentFrom: 'nerve-core-v1', riskLevel: 'medium', executionMode: 'sync',
  },
  nrv_topology_map: {
    id: 'nrv_topology_map', name: 'Topology Mapper',
    description: 'Maintains live map of node connections and signal routing paths',
    modules: ['NERVE', 'SYSTEM'], layer: 'Kernel',
    userBenefit: 'Visibility into signal routing topology',
    status: 'active', emergentFrom: 'nerve-core-v1', riskLevel: 'low', executionMode: 'sync',
  },
  nrv_priority_route: {
    id: 'nrv_priority_route', name: 'Priority Signal Router',
    description: 'Routes high-priority signals via shortest path, bypassing congested channels',
    modules: ['NERVE', 'NEXUS'], layer: 'Kernel',
    userBenefit: 'Critical signals always arrive first',
    status: 'active', emergentFrom: 'nerve-core-v1', riskLevel: 'low', executionMode: 'sync',
  },
  nrv_dedup: {
    id: 'nrv_dedup', name: 'Signal Deduplication',
    description: 'Deduplicates repeated signals using idempotency keys and time windows',
    modules: ['NERVE', 'RIPPLE'], layer: 'Kernel',
    userBenefit: 'No wasted compute on duplicate signals',
    status: 'active', emergentFrom: 'nerve-core-v1', riskLevel: 'low', executionMode: 'sync',
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // IMMUNITY Node (8) — Adaptive Defense Mesh
  // ═══════════════════════════════════════════════════════════════════════════

  imm_threat_detect: {
    id: 'imm_threat_detect', name: 'Threat Detection',
    description: 'Detects anomalous patterns using trained immune signatures',
    modules: ['IMMUNITY', 'DEFENSE'], layer: 'Operational',
    userBenefit: 'Adaptive threat detection that learns',
    status: 'active', emergentFrom: 'immunity-core-v1', riskLevel: 'low', executionMode: 'streaming',
  },
  imm_quarantine: {
    id: 'imm_quarantine', name: 'Quarantine Executor',
    description: 'Isolates compromised or malfunctioning modules into quarantine sandbox',
    modules: ['IMMUNITY', 'CORE'], layer: 'Operational',
    userBenefit: 'Contain threats without system-wide impact',
    status: 'active', emergentFrom: 'immunity-core-v1', riskLevel: 'high', executionMode: 'sync',
  },
  imm_signature_update: {
    id: 'imm_signature_update', name: 'Signature Update',
    description: 'Updates immune signature database with newly observed threat patterns',
    modules: ['IMMUNITY', 'BRAIN'], layer: 'Operational',
    userBenefit: 'Continuously improving threat recognition',
    status: 'active', emergentFrom: 'immunity-core-v1', riskLevel: 'low', executionMode: 'async',
  },
  imm_repair_dispatch: {
    id: 'imm_repair_dispatch', name: 'Repair Dispatcher',
    description: 'Dispatches repair routines to affected modules after threat neutralization',
    modules: ['IMMUNITY', 'ENGINEER'], layer: 'Operational',
    userBenefit: 'Automatic post-incident recovery',
    status: 'active', emergentFrom: 'immunity-core-v1', riskLevel: 'medium', executionMode: 'async',
  },
  imm_false_positive_filter: {
    id: 'imm_false_positive_filter', name: 'False Positive Filter',
    description: 'Filters false positive detections using historical accuracy data',
    modules: ['IMMUNITY', 'ANALYTICS'], layer: 'Operational',
    userBenefit: 'Fewer false alarms, higher signal quality',
    status: 'active', emergentFrom: 'immunity-core-v1', riskLevel: 'low', executionMode: 'sync',
  },
  imm_response_score: {
    id: 'imm_response_score', name: 'Response Effectiveness Scorer',
    description: 'Scores effectiveness of immune responses for future optimization',
    modules: ['IMMUNITY', 'VISION'], layer: 'Operational',
    userBenefit: 'Continuously better incident response',
    status: 'active', emergentFrom: 'immunity-core-v1', riskLevel: 'low', executionMode: 'async',
  },
  imm_memory_recall: {
    id: 'imm_memory_recall', name: 'Immune Memory Recall',
    description: 'Recalls previous threat encounters for faster pattern matching',
    modules: ['IMMUNITY', 'MEMORY'], layer: 'Cognitive',
    userBenefit: 'Instant recognition of known threats',
    status: 'active', emergentFrom: 'immunity-core-v1', riskLevel: 'low', executionMode: 'sync',
  },
  imm_cascade_halt: {
    id: 'imm_cascade_halt', name: 'Cascade Halt',
    description: 'Emergency halt propagation to stop cascading immune responses',
    modules: ['IMMUNITY', 'NERVE'], layer: 'Operational',
    userBenefit: 'Prevent overreaction to localized threats',
    status: 'active', emergentFrom: 'immunity-core-v1', riskLevel: 'high', executionMode: 'sync',
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // GOVERNANCE Node (8) — Policy & Rule Enforcement
  // ═══════════════════════════════════════════════════════════════════════════

  gov_policy_evaluate: {
    id: 'gov_policy_evaluate', name: 'Policy Evaluator',
    description: 'Evaluates actions against registered governance policies before execution',
    modules: ['GOVERNANCE', 'DEFENSE'], layer: 'Orchestrator',
    userBenefit: 'Every action checked against governance rules',
    status: 'active', emergentFrom: 'governance-core-v1', riskLevel: 'low', executionMode: 'sync',
  },
  gov_rule_register: {
    id: 'gov_rule_register', name: 'Rule Registration',
    description: 'Registers new governance rules with versioning and conflict detection',
    modules: ['GOVERNANCE', 'SYSTEM'], layer: 'Admin',
    userBenefit: 'Structured governance rule management',
    status: 'active', emergentFrom: 'governance-core-v1', riskLevel: 'low', executionMode: 'sync',
  },
  gov_approval_workflow: {
    id: 'gov_approval_workflow', name: 'Approval Workflow',
    description: 'Routes high-impact actions through multi-step approval workflows',
    modules: ['GOVERNANCE', 'CORTEX'], layer: 'Admin',
    userBenefit: 'Human oversight for critical decisions',
    status: 'active', emergentFrom: 'governance-core-v1', riskLevel: 'low', executionMode: 'async',
  },
  gov_compliance_check: {
    id: 'gov_compliance_check', name: 'Compliance Checker',
    description: 'Validates system state against compliance frameworks and policies',
    modules: ['GOVERNANCE', 'SOVEREIGN'], layer: 'Operational',
    userBenefit: 'Continuous compliance assurance',
    status: 'active', emergentFrom: 'governance-core-v1', riskLevel: 'low', executionMode: 'async',
  },
  gov_policy_version: {
    id: 'gov_policy_version', name: 'Policy Version Control',
    description: 'Maintains versioned history of all policy changes with rollback support',
    modules: ['GOVERNANCE', 'AUDIT'], layer: 'Admin',
    userBenefit: 'Full policy change history and rollback',
    status: 'active', emergentFrom: 'governance-core-v1', riskLevel: 'low', executionMode: 'sync',
  },
  gov_conflict_resolve: {
    id: 'gov_conflict_resolve', name: 'Policy Conflict Resolution',
    description: 'Detects and resolves conflicting governance policies using priority rules',
    modules: ['GOVERNANCE', 'BRAIN'], layer: 'Orchestrator',
    userBenefit: 'No contradictory governance rules',
    status: 'active', emergentFrom: 'governance-core-v1', riskLevel: 'medium', executionMode: 'sync',
  },
  gov_exception_grant: {
    id: 'gov_exception_grant', name: 'Exception Grant Manager',
    description: 'Manages temporary governance exceptions with expiry and audit trail',
    modules: ['GOVERNANCE', 'IDENTITY'], layer: 'Admin',
    userBenefit: 'Controlled flexibility within governance',
    status: 'active', emergentFrom: 'governance-core-v1', riskLevel: 'medium', executionMode: 'sync',
  },
  gov_enforcement_report: {
    id: 'gov_enforcement_report', name: 'Enforcement Report',
    description: 'Generates governance enforcement reports showing policy adherence rates',
    modules: ['GOVERNANCE', 'ANALYTICS'], layer: 'Admin',
    userBenefit: 'Governance transparency and metrics',
    status: 'active', emergentFrom: 'governance-core-v1', riskLevel: 'low', executionMode: 'async',
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // AUDIT Node (8) — Immutable Record & Forensic Trail
  // ═══════════════════════════════════════════════════════════════════════════

  aud_log_event: {
    id: 'aud_log_event', name: 'Audit Event Logger',
    description: 'Writes immutable audit entries with timestamp, actor, action, and outcome',
    modules: ['AUDIT', 'CORE'], layer: 'Kernel',
    userBenefit: 'Complete audit trail for every action',
    status: 'active', emergentFrom: 'audit-core-v1', riskLevel: 'low', executionMode: 'sync',
  },
  aud_query: {
    id: 'aud_query', name: 'Audit Query Engine',
    description: 'Searches audit logs with filtered queries across time ranges and actors',
    modules: ['AUDIT', 'DECODE'], layer: 'Admin',
    userBenefit: 'Fast forensic investigation',
    status: 'active', emergentFrom: 'audit-core-v1', riskLevel: 'low', executionMode: 'sync',
  },
  aud_integrity_verify: {
    id: 'aud_integrity_verify', name: 'Integrity Verifier',
    description: 'Verifies audit chain integrity using cryptographic hash validation',
    modules: ['AUDIT', 'DEFENSE'], layer: 'Kernel',
    userBenefit: 'Tamper-proof audit records',
    status: 'active', emergentFrom: 'audit-core-v1', riskLevel: 'low', executionMode: 'sync',
  },
  aud_retention_manage: {
    id: 'aud_retention_manage', name: 'Retention Manager',
    description: 'Manages audit log retention policies with automated archival and purge',
    modules: ['AUDIT', 'SYSTEM'], layer: 'Admin',
    userBenefit: 'Compliant retention without manual management',
    status: 'active', emergentFrom: 'audit-core-v1', riskLevel: 'medium', executionMode: 'async',
  },
  aud_export: {
    id: 'aud_export', name: 'Audit Export',
    description: 'Exports audit records in compliance-ready formats (CSV, JSON, PDF)',
    modules: ['AUDIT', 'ENCODE'], layer: 'Admin',
    userBenefit: 'Audit-ready documentation on demand',
    status: 'active', emergentFrom: 'audit-core-v1', riskLevel: 'low', executionMode: 'async',
  },
  aud_anomaly_flag: {
    id: 'aud_anomaly_flag', name: 'Audit Anomaly Flagger',
    description: 'Flags unusual patterns in audit logs that may indicate policy violations',
    modules: ['AUDIT', 'VISION'], layer: 'Operational',
    userBenefit: 'Early detection of policy violations',
    status: 'active', emergentFrom: 'audit-core-v1', riskLevel: 'low', executionMode: 'async',
  },
  aud_compliance_attest: {
    id: 'aud_compliance_attest', name: 'Compliance Attestation',
    description: 'Generates signed compliance attestations from audit data',
    modules: ['AUDIT', 'SOVEREIGN'], layer: 'Admin',
    userBenefit: 'Verifiable compliance proof',
    status: 'active', emergentFrom: 'audit-core-v1', riskLevel: 'low', executionMode: 'async',
  },
  aud_forensic_replay: {
    id: 'aud_forensic_replay', name: 'Forensic Replay',
    description: 'Replays sequences of audited actions to reconstruct incident timelines',
    modules: ['AUDIT', 'MEMORY'], layer: 'Admin',
    userBenefit: 'Full incident reconstruction',
    status: 'active', emergentFrom: 'audit-core-v1', riskLevel: 'low', executionMode: 'async',
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // IDENTITY Node (8) — Authentication & Trust Management
  // ═══════════════════════════════════════════════════════════════════════════

  idn_authenticate: {
    id: 'idn_authenticate', name: 'Authentication Handler',
    description: 'Validates identity credentials and issues session tokens',
    modules: ['IDENTITY', 'DEFENSE'], layer: 'Kernel',
    userBenefit: 'Secure identity verification',
    status: 'active', emergentFrom: 'identity-core-v1', riskLevel: 'low', executionMode: 'sync',
  },
  idn_session_manage: {
    id: 'idn_session_manage', name: 'Session Manager',
    description: 'Creates, validates, and expires sessions with configurable lifetimes',
    modules: ['IDENTITY', 'CORE'], layer: 'Kernel',
    userBenefit: 'Secure session lifecycle management',
    status: 'active', emergentFrom: 'identity-core-v1', riskLevel: 'low', executionMode: 'sync',
  },
  idn_permission_check: {
    id: 'idn_permission_check', name: 'Permission Checker',
    description: 'Evaluates role-based and attribute-based access permissions',
    modules: ['IDENTITY', 'GOVERNANCE'], layer: 'Kernel',
    userBenefit: 'Fine-grained access control',
    status: 'active', emergentFrom: 'identity-core-v1', riskLevel: 'low', executionMode: 'sync',
  },
  idn_credential_rotate: {
    id: 'idn_credential_rotate', name: 'Credential Rotation',
    description: 'Rotates credentials on schedule or on-demand with zero-downtime',
    modules: ['IDENTITY', 'SYSTEM'], layer: 'Admin',
    userBenefit: 'Always-fresh credentials without disruption',
    status: 'active', emergentFrom: 'identity-core-v1', riskLevel: 'medium', executionMode: 'async',
  },
  idn_trust_score: {
    id: 'idn_trust_score', name: 'Trust Scorer',
    description: 'Computes dynamic trust scores based on behavior, history, and context',
    modules: ['IDENTITY', 'BRAIN'], layer: 'Cognitive',
    userBenefit: 'Adaptive security based on trust signals',
    status: 'active', emergentFrom: 'identity-core-v1', riskLevel: 'low', executionMode: 'sync',
  },
  idn_federation: {
    id: 'idn_federation', name: 'Identity Federation',
    description: 'Federates identity across external providers with unified trust model',
    modules: ['IDENTITY', 'RELAY'], layer: 'Operational',
    userBenefit: 'Single identity across all systems',
    status: 'active', emergentFrom: 'identity-core-v1', riskLevel: 'medium', executionMode: 'async',
  },
  idn_audit_trail: {
    id: 'idn_audit_trail', name: 'Identity Audit Trail',
    description: 'Logs all identity operations for security auditing and compliance',
    modules: ['IDENTITY', 'AUDIT'], layer: 'Admin',
    userBenefit: 'Full identity operation history',
    status: 'active', emergentFrom: 'identity-core-v1', riskLevel: 'low', executionMode: 'async',
  },
  idn_mfa_orchestrate: {
    id: 'idn_mfa_orchestrate', name: 'MFA Orchestrator',
    description: 'Orchestrates multi-factor authentication flows with adaptive challenge selection',
    modules: ['IDENTITY', 'DECODE'], layer: 'Kernel',
    userBenefit: 'Strong authentication without friction',
    status: 'active', emergentFrom: 'identity-core-v1', riskLevel: 'low', executionMode: 'sync',
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // RELAY Node (8) — Cross-Boundary Message Transport
  // ═══════════════════════════════════════════════════════════════════════════

  rly_message_route: {
    id: 'rly_message_route', name: 'Message Router',
    description: 'Routes messages between internal modules and external endpoints',
    modules: ['RELAY', 'NEXUS'], layer: 'Kernel',
    userBenefit: 'Reliable cross-boundary message delivery',
    status: 'active', emergentFrom: 'relay-core-v1', riskLevel: 'low', executionMode: 'sync',
  },
  rly_protocol_bridge: {
    id: 'rly_protocol_bridge', name: 'Protocol Bridge',
    description: 'Translates between communication protocols (REST, gRPC, WebSocket, SSE)',
    modules: ['RELAY', 'ENCODE'], layer: 'Kernel',
    userBenefit: 'Connect any protocol seamlessly',
    status: 'active', emergentFrom: 'relay-core-v1', riskLevel: 'low', executionMode: 'sync',
  },
  rly_delivery_guarantee: {
    id: 'rly_delivery_guarantee', name: 'Delivery Guarantee',
    description: 'Ensures at-least-once or exactly-once message delivery with retry logic',
    modules: ['RELAY', 'CORE'], layer: 'Kernel',
    userBenefit: 'No lost messages',
    status: 'active', emergentFrom: 'relay-core-v1', riskLevel: 'low', executionMode: 'async',
  },
  rly_fan_out: {
    id: 'rly_fan_out', name: 'Fan-Out Dispatcher',
    description: 'Dispatches messages to multiple subscribers with configurable ordering',
    modules: ['RELAY', 'RIPPLE'], layer: 'Kernel',
    userBenefit: 'Efficient multi-target broadcasting',
    status: 'active', emergentFrom: 'relay-core-v1', riskLevel: 'low', executionMode: 'async',
  },
  rly_health_check: {
    id: 'rly_health_check', name: 'Relay Health Check',
    description: 'Monitors relay channel health with latency and error rate tracking',
    modules: ['RELAY', 'VISION'], layer: 'Operational',
    userBenefit: 'Visibility into communication health',
    status: 'active', emergentFrom: 'relay-core-v1', riskLevel: 'low', executionMode: 'streaming',
  },
  rly_rate_limit: {
    id: 'rly_rate_limit', name: 'Relay Rate Limiter',
    description: 'Applies per-channel rate limiting to prevent message flooding',
    modules: ['RELAY', 'ACCESS'], layer: 'Kernel',
    userBenefit: 'Protection against message storms',
    status: 'active', emergentFrom: 'relay-core-v1', riskLevel: 'low', executionMode: 'sync',
  },
  rly_encrypt_transit: {
    id: 'rly_encrypt_transit', name: 'Transit Encryption',
    description: 'Encrypts messages in transit with per-channel key management',
    modules: ['RELAY', 'DEFENSE'], layer: 'Kernel',
    userBenefit: 'Secure message transport',
    status: 'active', emergentFrom: 'relay-core-v1', riskLevel: 'low', executionMode: 'sync',
  },
  rly_dead_letter: {
    id: 'rly_dead_letter', name: 'Dead Letter Queue',
    description: 'Captures undeliverable messages for inspection and retry',
    modules: ['RELAY', 'AUDIT'], layer: 'Operational',
    userBenefit: 'No silently lost messages',
    status: 'active', emergentFrom: 'relay-core-v1', riskLevel: 'low', executionMode: 'async',
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // ENCODE Node (8) — Data Transformation & Schema Management
  // ═══════════════════════════════════════════════════════════════════════════

  enc_serialize: {
    id: 'enc_serialize', name: 'Data Serializer',
    description: 'Serializes structured data into wire formats (JSON, MessagePack, Protobuf)',
    modules: ['ENCODE', 'CORE'], layer: 'Kernel',
    userBenefit: 'Efficient data transport across boundaries',
    status: 'active', emergentFrom: 'encode-core-v1', riskLevel: 'low', executionMode: 'sync',
  },
  enc_deserialize: {
    id: 'enc_deserialize', name: 'Data Deserializer',
    description: 'Deserializes incoming wire data with schema validation and error recovery',
    modules: ['ENCODE', 'DEFENSE'], layer: 'Kernel',
    userBenefit: 'Safe ingestion of external data',
    status: 'active', emergentFrom: 'encode-core-v1', riskLevel: 'low', executionMode: 'sync',
  },
  enc_schema_validate: {
    id: 'enc_schema_validate', name: 'Schema Validator',
    description: 'Validates data against registered schemas with detailed error reporting',
    modules: ['ENCODE', 'GOVERNANCE'], layer: 'Operational',
    userBenefit: 'Catch malformed data at the boundary',
    status: 'active', emergentFrom: 'encode-core-v1', riskLevel: 'low', executionMode: 'sync',
  },
  enc_transform: {
    id: 'enc_transform', name: 'Data Transformer',
    description: 'Applies registered transformation rules to reshape data between schemas',
    modules: ['ENCODE', 'INTEGRATION'], layer: 'Operational',
    userBenefit: 'Automatic data mapping between systems',
    status: 'active', emergentFrom: 'encode-core-v1', riskLevel: 'low', executionMode: 'sync',
  },
  enc_compress: {
    id: 'enc_compress', name: 'Compression Engine',
    description: 'Compresses payloads with adaptive algorithm selection based on data type',
    modules: ['ENCODE', 'SYSTEM'], layer: 'Kernel',
    userBenefit: 'Reduced bandwidth and storage costs',
    status: 'active', emergentFrom: 'encode-core-v1', riskLevel: 'low', executionMode: 'sync',
  },
  enc_schema_evolve: {
    id: 'enc_schema_evolve', name: 'Schema Evolution Manager',
    description: 'Manages backward-compatible schema evolution with migration support',
    modules: ['ENCODE', 'EVOLUTION'], layer: 'Admin',
    userBenefit: 'Schema changes without breaking consumers',
    status: 'active', emergentFrom: 'encode-core-v1', riskLevel: 'medium', executionMode: 'async',
  },
  enc_sanitize: {
    id: 'enc_sanitize', name: 'Input Sanitizer',
    description: 'Sanitizes input data against injection attacks and encoding exploits',
    modules: ['ENCODE', 'DEFENSE'], layer: 'Kernel',
    userBenefit: 'Protection against encoding-based attacks',
    status: 'active', emergentFrom: 'encode-core-v1', riskLevel: 'low', executionMode: 'sync',
  },
  enc_format_negotiate: {
    id: 'enc_format_negotiate', name: 'Format Negotiation',
    description: 'Negotiates optimal data format between sender and receiver capabilities',
    modules: ['ENCODE', 'RELAY'], layer: 'Kernel',
    userBenefit: 'Best format automatically selected',
    status: 'active', emergentFrom: 'encode-core-v1', riskLevel: 'low', executionMode: 'sync',
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // ANALYTICS Node (8) — Metric Collection & Insight Generation
  // ═══════════════════════════════════════════════════════════════════════════

  anl_metric_ingest: {
    id: 'anl_metric_ingest', name: 'Metric Ingestion',
    description: 'Ingests metrics from all substrate nodes with timestamped buffering',
    modules: ['ANALYTICS', 'CORE'], layer: 'Operational',
    userBenefit: 'Comprehensive metric collection',
    status: 'active', emergentFrom: 'analytics-core-v1', riskLevel: 'low', executionMode: 'streaming',
  },
  anl_aggregate: {
    id: 'anl_aggregate', name: 'Metric Aggregator',
    description: 'Aggregates raw metrics into rollups at configurable time granularities',
    modules: ['ANALYTICS', 'SYSTEM'], layer: 'Operational',
    userBenefit: 'Efficient metric storage and querying',
    status: 'active', emergentFrom: 'analytics-core-v1', riskLevel: 'low', executionMode: 'async',
  },
  anl_anomaly_detect: {
    id: 'anl_anomaly_detect', name: 'Anomaly Detector',
    description: 'Detects statistical anomalies in metric streams using adaptive thresholds',
    modules: ['ANALYTICS', 'BRAIN'], layer: 'Operational',
    userBenefit: 'Early warning on unusual behavior',
    status: 'active', emergentFrom: 'analytics-core-v1', riskLevel: 'low', executionMode: 'async',
  },
  anl_trend_compute: {
    id: 'anl_trend_compute', name: 'Trend Computer',
    description: 'Computes trends and moving averages across metric dimensions',
    modules: ['ANALYTICS', 'ORACLE'], layer: 'Cognitive',
    userBenefit: 'See where metrics are heading',
    status: 'active', emergentFrom: 'analytics-core-v1', riskLevel: 'low', executionMode: 'async',
  },
  anl_dashboard_feed: {
    id: 'anl_dashboard_feed', name: 'Dashboard Data Feed',
    description: 'Provides real-time data feeds to dashboard components',
    modules: ['ANALYTICS', 'VISION'], layer: 'Operational',
    userBenefit: 'Live dashboard updates',
    status: 'active', emergentFrom: 'analytics-core-v1', riskLevel: 'low', executionMode: 'streaming',
  },
  anl_cohort_analyze: {
    id: 'anl_cohort_analyze', name: 'Cohort Analyzer',
    description: 'Segments metrics by cohort for comparative analysis',
    modules: ['ANALYTICS', 'DECODE'], layer: 'Cognitive',
    userBenefit: 'Understand behavior differences across groups',
    status: 'active', emergentFrom: 'analytics-core-v1', riskLevel: 'low', executionMode: 'async',
  },
  anl_export_report: {
    id: 'anl_export_report', name: 'Analytics Report Export',
    description: 'Exports analytics reports in multiple formats with scheduling',
    modules: ['ANALYTICS', 'ENCODE'], layer: 'Admin',
    userBenefit: 'Automated reporting delivery',
    status: 'active', emergentFrom: 'analytics-core-v1', riskLevel: 'low', executionMode: 'async',
  },
  anl_correlation_find: {
    id: 'anl_correlation_find', name: 'Correlation Finder',
    description: 'Discovers correlations between seemingly unrelated metric streams',
    modules: ['ANALYTICS', 'DREAM'], layer: 'Cognitive',
    userBenefit: 'Hidden insights from metric relationships',
    status: 'active', emergentFrom: 'analytics-core-v1', riskLevel: 'low', executionMode: 'async',
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // ECONOMY Node (8) — Resource Budgeting & Cost Management
  // ═══════════════════════════════════════════════════════════════════════════

  eco_cost_track: {
    id: 'eco_cost_track', name: 'Cost Tracker',
    description: 'Tracks per-operation costs across all modules in real-time',
    modules: ['ECONOMY', 'ANALYTICS'], layer: 'Operational',
    userBenefit: 'Know exactly what every operation costs',
    status: 'active', emergentFrom: 'economy-core-v1', riskLevel: 'low', executionMode: 'async',
  },
  eco_budget_enforce: {
    id: 'eco_budget_enforce', name: 'Budget Enforcer',
    description: 'Enforces spending limits with configurable thresholds and overage rules',
    modules: ['ECONOMY', 'GOVERNANCE'], layer: 'Operational',
    userBenefit: 'No surprise cost overruns',
    status: 'active', emergentFrom: 'economy-core-v1', riskLevel: 'medium', executionMode: 'sync',
  },
  eco_roi_compute: {
    id: 'eco_roi_compute', name: 'ROI Calculator',
    description: 'Computes return on investment for operations based on value and cost',
    modules: ['ECONOMY', 'VISION'], layer: 'Operational',
    userBenefit: 'Data-driven resource allocation',
    status: 'active', emergentFrom: 'economy-core-v1', riskLevel: 'low', executionMode: 'sync',
  },
  eco_quota_manage: {
    id: 'eco_quota_manage', name: 'Quota Manager',
    description: 'Manages resource quotas per module, user, and time period',
    modules: ['ECONOMY', 'ACCESS'], layer: 'Operational',
    userBenefit: 'Fair resource distribution',
    status: 'active', emergentFrom: 'economy-core-v1', riskLevel: 'low', executionMode: 'sync',
  },
  eco_billing_reconcile: {
    id: 'eco_billing_reconcile', name: 'Billing Reconciler',
    description: 'Reconciles internal cost tracking against external billing records',
    modules: ['ECONOMY', 'AUDIT'], layer: 'Admin',
    userBenefit: 'Accurate billing with no discrepancies',
    status: 'active', emergentFrom: 'economy-core-v1', riskLevel: 'low', executionMode: 'async',
  },
  eco_forecast_spend: {
    id: 'eco_forecast_spend', name: 'Spend Forecaster',
    description: 'Forecasts future spending based on usage trends and planned operations',
    modules: ['ECONOMY', 'ORACLE'], layer: 'Cognitive',
    userBenefit: 'Plan budgets with confidence',
    status: 'active', emergentFrom: 'economy-core-v1', riskLevel: 'low', executionMode: 'async',
  },
  eco_value_attribute: {
    id: 'eco_value_attribute', name: 'Value Attribution',
    description: 'Attributes business value back to specific operations and capabilities',
    modules: ['ECONOMY', 'BRAIN'], layer: 'Cognitive',
    userBenefit: 'Understand which features generate value',
    status: 'active', emergentFrom: 'economy-core-v1', riskLevel: 'low', executionMode: 'async',
  },
  eco_cost_optimize: {
    id: 'eco_cost_optimize', name: 'Cost Optimizer',
    description: 'Suggests cost-reduction opportunities without impacting quality',
    modules: ['ECONOMY', 'ENGINEER'], layer: 'Admin',
    userBenefit: 'Continuous cost efficiency improvements',
    status: 'active', emergentFrom: 'economy-core-v1', riskLevel: 'low', executionMode: 'async',
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // MEMORY Node (8) — Persistent Knowledge Store
  // ═══════════════════════════════════════════════════════════════════════════

  mem_store: {
    id: 'mem_store', name: 'Memory Store',
    description: 'Persists structured memories with metadata, tags, and expiry policies',
    modules: ['MEMORY', 'CORE'], layer: 'Kernel',
    userBenefit: 'Reliable knowledge persistence',
    status: 'active', emergentFrom: 'memory-core-v1', riskLevel: 'low', executionMode: 'sync',
  },
  mem_recall: {
    id: 'mem_recall', name: 'Memory Recall',
    description: 'Retrieves memories by semantic similarity, tag, or time range',
    modules: ['MEMORY', 'BRAIN'], layer: 'Cognitive',
    userBenefit: 'Fast access to relevant knowledge',
    status: 'active', emergentFrom: 'memory-core-v1', riskLevel: 'low', executionMode: 'sync',
  },
  mem_decay: {
    id: 'mem_decay', name: 'Memory Decay Manager',
    description: 'Applies configurable decay curves to reduce relevance of stale memories',
    modules: ['MEMORY', 'SYSTEM'], layer: 'Kernel',
    userBenefit: 'Fresh memories surface over stale ones',
    status: 'active', emergentFrom: 'memory-core-v1', riskLevel: 'low', executionMode: 'async',
  },
  mem_tier: {
    id: 'mem_tier', name: 'Memory Tiering',
    description: 'Moves memories between hot/warm/cold storage tiers based on access patterns',
    modules: ['MEMORY', 'ECONOMY'], layer: 'Kernel',
    userBenefit: 'Cost-efficient memory storage',
    status: 'active', emergentFrom: 'memory-core-v1', riskLevel: 'low', executionMode: 'async',
  },
  mem_index: {
    id: 'mem_index', name: 'Memory Indexer',
    description: 'Maintains semantic and keyword indexes for fast memory retrieval',
    modules: ['MEMORY', 'ENCODE'], layer: 'Kernel',
    userBenefit: 'Sub-millisecond memory lookups',
    status: 'active', emergentFrom: 'memory-core-v1', riskLevel: 'low', executionMode: 'async',
  },
  mem_consolidate: {
    id: 'mem_consolidate', name: 'Memory Consolidation',
    description: 'Merges fragmented memories into coherent knowledge units during idle time',
    modules: ['MEMORY', 'DREAM'], layer: 'Cognitive',
    userBenefit: 'Cleaner, more useful knowledge base',
    status: 'active', emergentFrom: 'memory-core-v1', riskLevel: 'low', executionMode: 'async',
  },
  mem_gc: {
    id: 'mem_gc', name: 'Memory Garbage Collection',
    description: 'Identifies and removes orphaned, expired, and superseded memories',
    modules: ['MEMORY', 'ENGINEER'], layer: 'Admin',
    userBenefit: 'No wasted storage on dead memories',
    status: 'active', emergentFrom: 'memory-core-v1', riskLevel: 'medium', executionMode: 'async',
  },
  mem_snapshot: {
    id: 'mem_snapshot', name: 'Memory Snapshot',
    description: 'Creates point-in-time snapshots of memory state for backup and restore',
    modules: ['MEMORY', 'AUDIT'], layer: 'Admin',
    userBenefit: 'Restorable knowledge state',
    status: 'active', emergentFrom: 'memory-core-v1', riskLevel: 'low', executionMode: 'async',
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // MEDIC Node (8) — Autonomous Diagnostics & Healing
  // ═══════════════════════════════════════════════════════════════════════════

  med_diagnose: {
    id: 'med_diagnose', name: 'System Diagnostics',
    description: 'Runs comprehensive diagnostic checks across all substrate nodes',
    modules: ['MEDIC', 'VISION'], layer: 'Admin',
    userBenefit: 'Complete system health assessment',
    status: 'active', emergentFrom: 'medic-core-v1', riskLevel: 'low', executionMode: 'async',
  },
  med_heal: {
    id: 'med_heal', name: 'Auto-Heal Executor',
    description: 'Applies automated healing routines for known failure patterns',
    modules: ['MEDIC', 'ENGINEER'], layer: 'Admin',
    userBenefit: 'Automatic recovery from known issues',
    status: 'active', emergentFrom: 'medic-core-v1', riskLevel: 'medium', executionMode: 'async',
  },
  med_quarantine: {
    id: 'med_quarantine', name: 'Module Quarantine',
    description: 'Quarantines failing modules to prevent cascade while preserving state',
    modules: ['MEDIC', 'CORE'], layer: 'Admin',
    userBenefit: 'Contain failures without data loss',
    status: 'active', emergentFrom: 'medic-core-v1', riskLevel: 'high', executionMode: 'sync',
  },
  med_symptom_collect: {
    id: 'med_symptom_collect', name: 'Symptom Collector',
    description: 'Collects error symptoms, stack traces, and anomaly signals for diagnosis',
    modules: ['MEDIC', 'ANALYTICS'], layer: 'Operational',
    userBenefit: 'Rich diagnostic data for troubleshooting',
    status: 'active', emergentFrom: 'medic-core-v1', riskLevel: 'low', executionMode: 'async',
  },
  med_prognosis: {
    id: 'med_prognosis', name: 'Health Prognosis',
    description: 'Predicts future health issues based on current symptom trajectories',
    modules: ['MEDIC', 'ORACLE'], layer: 'Cognitive',
    userBenefit: 'Preventive care before failures',
    status: 'active', emergentFrom: 'medic-core-v1', riskLevel: 'low', executionMode: 'async',
  },
  med_triage: {
    id: 'med_triage', name: 'Issue Triage',
    description: 'Prioritizes detected issues by severity, blast radius, and recoverability',
    modules: ['MEDIC', 'CORTEX'], layer: 'Operational',
    userBenefit: 'Most critical issues addressed first',
    status: 'active', emergentFrom: 'medic-core-v1', riskLevel: 'low', executionMode: 'sync',
  },
  med_health_report: {
    id: 'med_health_report', name: 'Health Report Generator',
    description: 'Generates comprehensive health reports with treatment recommendations',
    modules: ['MEDIC', 'DECODE'], layer: 'Admin',
    userBenefit: 'Clear health status with actionable advice',
    status: 'active', emergentFrom: 'medic-core-v1', riskLevel: 'low', executionMode: 'async',
  },
  med_vitals_monitor: {
    id: 'med_vitals_monitor', name: 'Vitals Monitor',
    description: 'Continuously monitors critical system vitals with configurable alerts',
    modules: ['MEDIC', 'NERVE'], layer: 'Operational',
    userBenefit: 'Always-on critical health monitoring',
    status: 'active', emergentFrom: 'medic-core-v1', riskLevel: 'low', executionMode: 'streaming',
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // EVOLUTION Node (8) — Mutation Governance & System Progression
  // ═══════════════════════════════════════════════════════════════════════════

  evo_proposal_create: {
    id: 'evo_proposal_create', name: 'Mutation Proposal Creator',
    description: 'Creates structured mutation proposals with impact analysis and rollback plan',
    modules: ['EVOLUTION', 'BRAIN'], layer: 'Admin',
    userBenefit: 'Safe, structured system evolution',
    status: 'active', emergentFrom: 'evolution-core-v1', riskLevel: 'low', executionMode: 'async',
  },
  evo_gate_evaluate: {
    id: 'evo_gate_evaluate', name: 'Promotion Gate Evaluator',
    description: 'Evaluates mutations against 7 promotion gates (Shadow → Production)',
    modules: ['EVOLUTION', 'SHADOW'], layer: 'Admin',
    userBenefit: 'Multi-stage safety validation',
    status: 'active', emergentFrom: 'evolution-core-v1', riskLevel: 'low', executionMode: 'sync',
  },
  evo_canary_deploy: {
    id: 'evo_canary_deploy', name: 'Canary Deployment',
    description: 'Deploys mutations to canary group with automated metric monitoring',
    modules: ['EVOLUTION', 'VISION'], layer: 'Admin',
    userBenefit: 'Low-risk incremental rollout',
    status: 'active', emergentFrom: 'evolution-core-v1', riskLevel: 'medium', executionMode: 'async',
  },
  evo_rollback: {
    id: 'evo_rollback', name: 'Mutation Rollback',
    description: 'Reverts a deployed mutation with full state restoration',
    modules: ['EVOLUTION', 'CORE'], layer: 'Admin',
    userBenefit: 'Instant undo for any change',
    status: 'active', emergentFrom: 'evolution-core-v1', riskLevel: 'high', executionMode: 'sync',
  },
  evo_mri_compute: {
    id: 'evo_mri_compute', name: 'MRI Score Computer',
    description: 'Computes Mutation Readiness Index for proposed changes',
    modules: ['EVOLUTION', 'ANALYTICS'], layer: 'Cognitive',
    userBenefit: 'Quantified readiness for each change',
    status: 'active', emergentFrom: 'evolution-core-v1', riskLevel: 'low', executionMode: 'sync',
  },
  evo_lineage_track: {
    id: 'evo_lineage_track', name: 'Mutation Lineage Tracker',
    description: 'Tracks full lineage of mutations from proposal through deployment',
    modules: ['EVOLUTION', 'AUDIT'], layer: 'Admin',
    userBenefit: 'Complete change history',
    status: 'active', emergentFrom: 'evolution-core-v1', riskLevel: 'low', executionMode: 'async',
  },
  evo_skill_progress: {
    id: 'evo_skill_progress', name: 'Skill Progression Tracker',
    description: 'Tracks 5-tier skill progression for mutation executors',
    modules: ['EVOLUTION', 'BRAIN'], layer: 'Cognitive',
    userBenefit: 'Improving mutation quality over time',
    status: 'active', emergentFrom: 'evolution-core-v1', riskLevel: 'low', executionMode: 'async',
  },
  evo_stabilization_check: {
    id: 'evo_stabilization_check', name: 'Stabilization Gate',
    description: 'Validates 12 stabilization gates including TSAC verdicts and integrity scores',
    modules: ['EVOLUTION', 'DEFENSE'], layer: 'Admin',
    userBenefit: 'Mutations only proceed when stable',
    status: 'active', emergentFrom: 'evolution-core-v1', riskLevel: 'low', executionMode: 'sync',
  },
};

// ── Summary & Helpers ──────────────────────────────────────────────────────

export const STANDARD_NODE_SUMMARY = {
  coveredNodes: [
    'ENGINEER', 'SHADOW', 'INTENT', 'NERVE', 'IMMUNITY', 'GOVERNANCE',
    'AUDIT', 'IDENTITY', 'RELAY', 'ENCODE', 'ANALYTICS', 'ECONOMY',
    'MEMORY', 'MEDIC', 'EVOLUTION',
  ] as const,
  capabilitiesPerNode: 8,
  totalCapabilities: 120,
  version: '11.1.0',
} as const;

/**
 * Get standard capabilities for a specific node
 */
export function getStandardCapabilitiesByNode(node: string) {
  return Object.values(STANDARD_NODE_CAPABILITIES).filter(cap =>
    cap.modules[0]?.toUpperCase() === node.toUpperCase()
  );
}

/**
 * Get all 120 standard node capabilities
 */
export function getAllStandardNodeCapabilities() {
  return Object.values(STANDARD_NODE_CAPABILITIES);
}

/**
 * Get full capability count across all registries
 * Main registry (120) + Crown Jewel Expansion (325) + Standard Node (120) = 565
 */
export function getTotalCapabilityCount() {
  return {
    mainRegistry: 120,
    crownJewelExpansion: 325,
    standardNode: 120,
    total: 565,
  };
}
