/**
 * CMPSBL® Capability Decomposition Registry — Tier 2
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Decomposes the 10 seeded capabilities into ~50 granular
 * sub-capabilities for fine-grained runtime attachment.
 *
 * Each sub-capability maps to a specific behavioral surface
 * within its parent primitive category.
 *
 * © CMPSBL® — All rights reserved.
 */

import { registerCapability } from './capability-registry';
import type { OrchestrationAction, OrchestrationSignal } from './orchestration-engine';

export interface SubCapabilityDef {
  readonly slug: string;
  readonly description: string;
  readonly primitiveCategory: string;
  readonly defaultActions: readonly OrchestrationAction[];
  readonly defaultSignal: OrchestrationSignal;
  readonly enforces: boolean;
  readonly parentCapability: string;
}

/**
 * Full decomposition catalog — ~50 granular sub-capabilities
 * derived from the 10 Phase 2 seeds.
 */
const DECOMPOSED_CAPABILITIES: SubCapabilityDef[] = [
  // ─── DEFENSE decomposition (parent: defense_gate) ───
  {
    slug: 'threat_scoring',
    description: 'Compute threat severity score from input pattern analysis',
    primitiveCategory: 'DEFENSE',
    defaultActions: ['validate_input', 'log_only'],
    defaultSignal: 'execution_started',
    enforces: false,
    parentCapability: 'defense_gate',
  },
  {
    slug: 'input_sanitization',
    description: 'Strip or escape malicious patterns from input payloads',
    primitiveCategory: 'DEFENSE',
    defaultActions: ['validate_input'],
    defaultSignal: 'execution_started',
    enforces: false,
    parentCapability: 'defense_gate',
  },
  {
    slug: 'injection_detection',
    description: 'Detect SQL, XSS, and command injection patterns',
    primitiveCategory: 'DEFENSE',
    defaultActions: ['validate_input', 'block_execution'],
    defaultSignal: 'execution_started',
    enforces: true,
    parentCapability: 'defense_gate',
  },
  {
    slug: 'payload_boundary_check',
    description: 'Enforce size, depth, and type constraints on input payloads',
    primitiveCategory: 'DEFENSE',
    defaultActions: ['validate_input', 'block_execution'],
    defaultSignal: 'execution_started',
    enforces: true,
    parentCapability: 'defense_gate',
  },
  {
    slug: 'perimeter_enforcement',
    description: 'Enforce origin, rate-limit, and access boundary policies',
    primitiveCategory: 'DEFENSE',
    defaultActions: ['validate_input', 'tighten_interception'],
    defaultSignal: 'execution_started',
    enforces: false,
    parentCapability: 'defense_gate',
  },

  // ─── GOVERNANCE decomposition (parent: governance_hook) ───
  {
    slug: 'policy_checkpoint',
    description: 'Evaluate declared governance policies at execution boundary',
    primitiveCategory: 'GOVERNANCE',
    defaultActions: ['tighten_interception', 'log_only'],
    defaultSignal: 'execution_started',
    enforces: false,
    parentCapability: 'governance_hook',
  },
  {
    slug: 'mutation_gate',
    description: 'Gate destructive or state-mutating operations through approval',
    primitiveCategory: 'GOVERNANCE',
    defaultActions: ['validate_input', 'block_execution'],
    defaultSignal: 'execution_started',
    enforces: true,
    parentCapability: 'governance_hook',
  },
  {
    slug: 'legitimacy_verification',
    description: 'Verify caller identity and authorization chain',
    primitiveCategory: 'GOVERNANCE',
    defaultActions: ['validate_input', 'log_only'],
    defaultSignal: 'execution_started',
    enforces: false,
    parentCapability: 'governance_hook',
  },
  {
    slug: 'action_approval',
    description: 'Require explicit approval for high-risk governance actions',
    primitiveCategory: 'GOVERNANCE',
    defaultActions: ['validate_input', 'tighten_interception'],
    defaultSignal: 'execution_started',
    enforces: false,
    parentCapability: 'governance_hook',
  },

  // ─── BEACON decomposition (parent: beacon_telemetry) ───
  {
    slug: 'health_signal',
    description: 'Emit structured health signal with uptime and status',
    primitiveCategory: 'BEACON',
    defaultActions: ['persist_state', 'log_only'],
    defaultSignal: 'execution_succeeded',
    enforces: false,
    parentCapability: 'beacon_telemetry',
  },
  {
    slug: 'heartbeat_emission',
    description: 'Emit periodic heartbeat to prove liveness',
    primitiveCategory: 'BEACON',
    defaultActions: ['log_only'],
    defaultSignal: 'execution_succeeded',
    enforces: false,
    parentCapability: 'beacon_telemetry',
  },
  {
    slug: 'telemetry_dispatch',
    description: 'Dispatch structured telemetry events to observability sinks',
    primitiveCategory: 'BEACON',
    defaultActions: ['persist_state'],
    defaultSignal: 'execution_succeeded',
    enforces: false,
    parentCapability: 'beacon_telemetry',
  },
  {
    slug: 'status_broadcast',
    description: 'Broadcast primitive status to monitoring endpoints',
    primitiveCategory: 'BEACON',
    defaultActions: ['log_only'],
    defaultSignal: 'execution_succeeded',
    enforces: false,
    parentCapability: 'beacon_telemetry',
  },

  // ─── FAILSAFE decomposition (parent: circuit_breaker) ───
  {
    slug: 'failure_counter',
    description: 'Track consecutive failure counts per execution boundary',
    primitiveCategory: 'FAILSAFE',
    defaultActions: ['log_only'],
    defaultSignal: 'execution_failed',
    enforces: false,
    parentCapability: 'circuit_breaker',
  },
  {
    slug: 'trip_threshold',
    description: 'Trip circuit when failure count exceeds threshold',
    primitiveCategory: 'FAILSAFE',
    defaultActions: ['trip_execution'],
    defaultSignal: 'execution_failed',
    enforces: false,
    parentCapability: 'circuit_breaker',
  },
  {
    slug: 'half_open_probe',
    description: 'Allow single probe execution during half-open recovery',
    primitiveCategory: 'FAILSAFE',
    defaultActions: ['log_only'],
    defaultSignal: 'execution_retried',
    enforces: false,
    parentCapability: 'circuit_breaker',
  },
  {
    slug: 'retry_with_backoff',
    description: 'Retry failed execution with exponential backoff',
    primitiveCategory: 'FAILSAFE',
    defaultActions: ['log_only'],
    defaultSignal: 'execution_failed',
    enforces: false,
    parentCapability: 'circuit_breaker',
  },
  {
    slug: 'graceful_degradation',
    description: 'Return degraded response when circuit is open',
    primitiveCategory: 'FAILSAFE',
    defaultActions: ['log_only'],
    defaultSignal: 'execution_failed',
    enforces: false,
    parentCapability: 'circuit_breaker',
  },

  // ─── AUDIT decomposition (parent: audit_trail) ───
  {
    slug: 'immutable_log',
    description: 'Append execution record to tamper-evident log',
    primitiveCategory: 'AUDIT',
    defaultActions: ['persist_state'],
    defaultSignal: 'execution_started',
    enforces: false,
    parentCapability: 'audit_trail',
  },
  {
    slug: 'chain_anchoring',
    description: 'Anchor log batch hash to chain for integrity verification',
    primitiveCategory: 'AUDIT',
    defaultActions: ['persist_state', 'log_only'],
    defaultSignal: 'execution_succeeded',
    enforces: false,
    parentCapability: 'audit_trail',
  },
  {
    slug: 'compliance_trail',
    description: 'Emit compliance-grade evidence trail for regulatory audit',
    primitiveCategory: 'AUDIT',
    defaultActions: ['persist_state'],
    defaultSignal: 'execution_succeeded',
    enforces: false,
    parentCapability: 'audit_trail',
  },

  // ─── MEMORY decomposition (parent: state_snapshot) ───
  {
    slug: 'hot_memory_capture',
    description: 'Capture high-frequency state to hot-tier memory',
    primitiveCategory: 'MEMORY',
    defaultActions: ['persist_state'],
    defaultSignal: 'execution_succeeded',
    enforces: false,
    parentCapability: 'state_snapshot',
  },
  {
    slug: 'cold_memory_archive',
    description: 'Archive aged state to cold-tier storage',
    primitiveCategory: 'MEMORY',
    defaultActions: ['persist_state'],
    defaultSignal: 'execution_succeeded',
    enforces: false,
    parentCapability: 'state_snapshot',
  },
  {
    slug: 'state_diff_tracking',
    description: 'Track delta between successive state snapshots',
    primitiveCategory: 'MEMORY',
    defaultActions: ['persist_state', 'log_only'],
    defaultSignal: 'execution_succeeded',
    enforces: false,
    parentCapability: 'state_snapshot',
  },

  // ─── SENTINEL decomposition (parent: anomaly_watch) ───
  {
    slug: 'baseline_deviation',
    description: 'Detect deviation from rolling performance baseline',
    primitiveCategory: 'SENTINEL',
    defaultActions: ['log_only', 'tighten_interception'],
    defaultSignal: 'anomaly_detected',
    enforces: false,
    parentCapability: 'anomaly_watch',
  },
  {
    slug: 'frequency_anomaly',
    description: 'Flag abnormal invocation frequency patterns',
    primitiveCategory: 'SENTINEL',
    defaultActions: ['log_only'],
    defaultSignal: 'anomaly_detected',
    enforces: false,
    parentCapability: 'anomaly_watch',
  },
  {
    slug: 'latency_spike',
    description: 'Detect and flag execution latency spikes beyond threshold',
    primitiveCategory: 'SENTINEL',
    defaultActions: ['log_only', 'tighten_interception'],
    defaultSignal: 'anomaly_detected',
    enforces: false,
    parentCapability: 'anomaly_watch',
  },

  // ─── ORACLE decomposition (parent: oracle_analysis) ───
  {
    slug: 'pattern_correlation',
    description: 'Correlate execution patterns across primitive boundaries',
    primitiveCategory: 'ORACLE',
    defaultActions: ['persist_state', 'log_only'],
    defaultSignal: 'execution_succeeded',
    enforces: false,
    parentCapability: 'oracle_analysis',
  },
  {
    slug: 'trend_detection',
    description: 'Detect long-term behavioral trends from execution history',
    primitiveCategory: 'ORACLE',
    defaultActions: ['persist_state'],
    defaultSignal: 'execution_succeeded',
    enforces: false,
    parentCapability: 'oracle_analysis',
  },
  {
    slug: 'insight_persistence',
    description: 'Persist analytical insights for downstream consumption',
    primitiveCategory: 'ORACLE',
    defaultActions: ['persist_state'],
    defaultSignal: 'execution_succeeded',
    enforces: false,
    parentCapability: 'oracle_analysis',
  },

  // ─── IMMUNITY decomposition (parent: immunity_shield) ───
  {
    slug: 'self_healing_probe',
    description: 'Probe for self-healing opportunities after detected anomalies',
    primitiveCategory: 'IMMUNITY',
    defaultActions: ['validate_input', 'log_only'],
    defaultSignal: 'anomaly_detected',
    enforces: false,
    parentCapability: 'immunity_shield',
  },
  {
    slug: 'quarantine_isolation',
    description: 'Isolate suspicious execution paths for containment',
    primitiveCategory: 'IMMUNITY',
    defaultActions: ['tighten_interception', 'block_execution'],
    defaultSignal: 'anomaly_detected',
    enforces: true,
    parentCapability: 'immunity_shield',
  },
  {
    slug: 'anomaly_response',
    description: 'Trigger adaptive response to detected anomaly patterns',
    primitiveCategory: 'IMMUNITY',
    defaultActions: ['tighten_interception'],
    defaultSignal: 'anomaly_detected',
    enforces: false,
    parentCapability: 'immunity_shield',
  },

  // ─── CONSCIENCE decomposition (parent: conscience_check) ───
  {
    slug: 'ethical_preflight',
    description: 'Run ethical pre-flight validation before execution',
    primitiveCategory: 'CONSCIENCE',
    defaultActions: ['validate_input', 'log_only'],
    defaultSignal: 'execution_started',
    enforces: false,
    parentCapability: 'conscience_check',
  },
  {
    slug: 'bias_detection',
    description: 'Detect potential bias patterns in input or output',
    primitiveCategory: 'CONSCIENCE',
    defaultActions: ['validate_input'],
    defaultSignal: 'execution_started',
    enforces: false,
    parentCapability: 'conscience_check',
  },
  {
    slug: 'transparency_audit',
    description: 'Enforce transparency requirements on decision outputs',
    primitiveCategory: 'CONSCIENCE',
    defaultActions: ['log_only'],
    defaultSignal: 'execution_succeeded',
    enforces: false,
    parentCapability: 'conscience_check',
  },
];

/**
 * Register all decomposed sub-capabilities into the capability registry.
 * Idempotent — safe to call multiple times.
 * Returns the count of newly registered capabilities.
 */
export function seedDecomposedCapabilities(): number {
  let registered = 0;
  for (const cap of DECOMPOSED_CAPABILITIES) {
    const isNew = registerCapability({
      slug: cap.slug,
      description: cap.description,
      primitiveCategory: cap.primitiveCategory,
      defaultActions: [...cap.defaultActions],
      defaultSignal: cap.defaultSignal,
      enforces: cap.enforces,
    });
    if (isNew) registered++;
  }
  return registered;
}

/** Get all decomposed capability definitions for introspection */
export function getDecomposedCapabilities(): readonly SubCapabilityDef[] {
  return DECOMPOSED_CAPABILITIES;
}

/** Get sub-capabilities for a specific parent */
export function getSubCapabilitiesFor(parentSlug: string): readonly SubCapabilityDef[] {
  return DECOMPOSED_CAPABILITIES.filter(c => c.parentCapability === parentSlug);
}

/** Get decomposition count */
export function getDecompositionCount(): number {
  return DECOMPOSED_CAPABILITIES.length;
}
