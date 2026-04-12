/**
 * CMPSBL® Scan-to-Policy Mapper — Phase 4
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Deterministic bridge: scan findings → runtime policies.
 *
 * Converts raw Ascension scan output into typed AttachmentEntries
 * with embedded OrchestrationPolicies — zero human interpretation.
 *
 * Pipeline:  ScanFinding[] → PolicyRecommendation[] → AttachmentEntry[]
 *
 * © CMPSBL® — All rights reserved.
 */

import type { AttachmentPolicy, OrchestrationAction, OrchestrationSignal } from './engines/orchestration-engine';
import { resolveEngine, type BehaviorEngine } from './engines/primitive-engine-map';

// ═══════════════════════════════════════════════════════════════════════════════
// §1 — INPUT TYPES (scanner-side contract)
// ═══════════════════════════════════════════════════════════════════════════════

/** Raw finding from any Ascension scan pass */
export interface ScanFinding {
  /** Detected function or symbol name */
  readonly functionName: string;
  /** Primitive that matched (e.g. 'DEFENSE', 'GOVERNANCE') */
  readonly primitive: string;
  /** Capability slug (e.g. 'defense_gate', 'circuit_breaker') */
  readonly capability: string;
  /** Why this was flagged */
  readonly reason: string;
  /** Scanner confidence 0–1 */
  readonly confidence: number;
  /** Optional: source line number */
  readonly line?: number;
  /** Optional: risk surface tags */
  readonly riskTags?: readonly string[];
}

// ═══════════════════════════════════════════════════════════════════════════════
// §2 — OUTPUT TYPES (runtime-side contract)
// ═══════════════════════════════════════════════════════════════════════════════

/** A fully resolved, behavior-ready policy recommendation */
export interface PolicyRecommendation {
  /** Target function */
  readonly functionName: string;
  /** Resolved engine archetype */
  readonly engine: BehaviorEngine;
  /** Primitive that drives this recommendation */
  readonly primitive: string;
  /** Capability slug */
  readonly capability: string;
  /** Generated policy — ready for CORTEX ingestion */
  readonly policy: AttachmentPolicy;
  /** Human-readable behavior description */
  readonly behaviorDescription: string;
  /** Priority (higher = evaluated first) */
  readonly priority: number;
  /** Whether this recommendation enforces (blocks) vs observes */
  readonly enforces: boolean;
  /** Original confidence from scanner */
  readonly confidence: number;
}

/** Full mapper output */
export interface ScanToPolicyResult {
  /** All recommendations, sorted by priority descending */
  readonly recommendations: readonly PolicyRecommendation[];
  /** Recommendations that enforce (block/gate) */
  readonly enforcingCount: number;
  /** Recommendations that observe (telemetry/audit) */
  readonly observingCount: number;
  /** Unique primitives referenced */
  readonly primitivesUsed: readonly string[];
  /** Unique engines activated */
  readonly enginesActivated: readonly string[];
  /** Findings that could not be mapped (unknown capability) */
  readonly unmapped: readonly ScanFinding[];
}

// ═══════════════════════════════════════════════════════════════════════════════
// §3 — CAPABILITY → POLICY TEMPLATES
// ═══════════════════════════════════════════════════════════════════════════════

interface PolicyTemplate {
  readonly signal: OrchestrationSignal;
  readonly actions: readonly OrchestrationAction[];
  readonly condition?: string;
  readonly enforces: boolean;
  readonly description: string;
  readonly basePriority: number;
}

/**
 * Deterministic mapping: capability slug → runtime policy template.
 * Every known capability has exactly one policy shape.
 */
const POLICY_TEMPLATES: Record<string, PolicyTemplate> = {
  defense_gate: {
    signal: 'execution_started',
    actions: ['validate_input', 'block_execution'],
    condition: 'input_is_string',
    enforces: true,
    description: 'Validates input at function boundary; blocks if injection patterns detected',
    basePriority: 100,
  },
  governance_hook: {
    signal: 'execution_started',
    actions: ['validate_input', 'log_only'],
    enforces: false,
    description: 'Audits state mutation; logs governance event for provenance trail',
    basePriority: 90,
  },
  circuit_breaker: {
    signal: 'execution_failed',
    actions: ['trip_execution'],
    enforces: true,
    description: 'Trips circuit on failure; prevents cascade into upstream callers',
    basePriority: 95,
  },
  audit_trail: {
    signal: 'execution_succeeded',
    actions: ['log_only'],
    enforces: false,
    description: 'Records execution provenance for audit chain',
    basePriority: 50,
  },
  beacon_telemetry: {
    signal: 'execution_succeeded',
    actions: ['log_only'],
    enforces: false,
    description: 'Emits telemetry observation for health monitoring',
    basePriority: 30,
  },
  shadow_rule: {
    signal: 'execution_started',
    actions: ['validate_input', 'block_execution'],
    condition: 'input_is_string',
    enforces: true,
    description: 'Enforces auth boundary shadow rule; blocks unauthorized access patterns',
    basePriority: 98,
  },
  dream_synthesis: {
    signal: 'execution_succeeded',
    actions: ['persist_state'],
    enforces: false,
    description: 'Persists execution outcome for sub-threshold synthesis',
    basePriority: 40,
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// §4 — MAPPER CORE
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Map scan findings to behavior-ready policy recommendations.
 *
 * Deterministic: same findings always produce same recommendations.
 * No AI, no heuristics — pure template resolution.
 */
export function mapFindingsToPolicy(findings: readonly ScanFinding[]): ScanToPolicyResult {
  const recommendations: PolicyRecommendation[] = [];
  const unmapped: ScanFinding[] = [];
  const primitivesUsed = new Set<string>();
  const enginesUsed = new Set<string>();

  for (const finding of findings) {
    const template = POLICY_TEMPLATES[finding.capability];

    if (!template) {
      unmapped.push(finding);
      continue;
    }

    const engine = resolveEngine(finding.primitive);
    primitivesUsed.add(finding.primitive);
    enginesUsed.add(engine);

    const policy: AttachmentPolicy = {
      on: template.signal,
      ...(template.condition ? { condition: template.condition } : {}),
      then: template.actions.length === 1 ? template.actions[0] : template.actions,
    };

    // Priority scales with confidence — high-confidence findings evaluated first
    const priority = Math.round(template.basePriority * finding.confidence);

    recommendations.push({
      functionName: finding.functionName,
      engine,
      primitive: finding.primitive,
      capability: finding.capability,
      policy,
      behaviorDescription: template.description,
      priority,
      enforces: template.enforces,
      confidence: finding.confidence,
    });
  }

  // Sort: enforcing first, then by priority descending
  recommendations.sort((a, b) => {
    if (a.enforces !== b.enforces) return a.enforces ? -1 : 1;
    return b.priority - a.priority;
  });

  const enforcingCount = recommendations.filter(r => r.enforces).length;

  return {
    recommendations,
    enforcingCount,
    observingCount: recommendations.length - enforcingCount,
    primitivesUsed: [...primitivesUsed].sort(),
    enginesActivated: [...enginesUsed].sort(),
    unmapped,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// §5 — ATTACHMENT ENTRY SERIALIZER
// ═══════════════════════════════════════════════════════════════════════════════

/** Typed attachment entry with embedded policy — ready for artifact-initializer */
export interface PolicyAttachmentEntry {
  readonly functionName: string;
  readonly capability: string;
  readonly primitive: string;
  readonly policy: AttachmentPolicy;
}

/**
 * Convert policy recommendations into artifact-embeddable attachment entries.
 * This is the final output format consumed by `activate()` in Phase 3.
 */
export function recommendationsToAttachments(
  recommendations: readonly PolicyRecommendation[],
): PolicyAttachmentEntry[] {
  return recommendations.map(r => ({
    functionName: r.functionName,
    capability: r.capability,
    primitive: r.primitive,
    policy: r.policy,
  }));
}

/**
 * Convenience: scan findings → attachment entries in one call.
 * This is the Phase 4 entry point: scan output goes in, runtime-ready config comes out.
 */
export function scanToAttachments(findings: readonly ScanFinding[]): {
  attachments: PolicyAttachmentEntry[];
  result: ScanToPolicyResult;
} {
  const result = mapFindingsToPolicy(findings);
  const attachments = recommendationsToAttachments(result.recommendations);
  return { attachments, result };
}
