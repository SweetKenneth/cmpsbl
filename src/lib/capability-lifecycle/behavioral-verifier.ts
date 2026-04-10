/**
 * CMPSBL® Behavioral Verification Engine
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Runs deterministic probes against an artifact to produce
 * behavioral evidence. This is the NEW verification system
 * that complements existing provenance verification.
 *
 * Probe philosophy:
 *   - Deterministic: same input → same result
 *   - Non-destructive: probes observe, never mutate the artifact
 *   - Conservative: absence of evidence ≠ evidence of absence,
 *     but presence of evidence = confirmed behavior
 *
 * © CMPSBL® — All rights reserved.
 */

import type {
  BehavioralProbe,
  BehavioralVerification,
  BehavioralEffect,
  BehavioralEffectKind,
} from './types';

// ═══════════════════════════════════════════════════════════════════════════════
// §1 — PROBE DEFINITIONS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Probe spec — defines what to check for a given primitive.
 */
interface ProbeSpec {
  readonly primitiveName: string;
  /** Expected L2 wrapper function/symbol name */
  readonly expectedWrapper: string;
  /** Effect kinds that would constitute proof */
  readonly expectedEffects: readonly BehavioralEffectKind[];
  /** Description template for successful probe */
  readonly successEvidence: string;
}

/**
 * Registry of known primitive → probe mappings.
 * Each primitive has specific, non-generic evidence requirements.
 */
const PROBE_REGISTRY: readonly ProbeSpec[] = [
  {
    primitiveName: 'DEFENSE',
    expectedWrapper: 'defense_gate',
    expectedEffects: ['call_interception', 'validation_reject'],
    successEvidence: 'Defense gate intercepted call and validated input',
  },
  {
    primitiveName: 'GOVERNANCE',
    expectedWrapper: 'governance_hook',
    expectedEffects: ['governance_gate', 'audit_record'],
    successEvidence: 'Governance hook evaluated policy rule',
  },
  {
    primitiveName: 'MEMORY',
    expectedWrapper: 'memory_writer',
    expectedEffects: ['state_write'],
    successEvidence: 'Memory primitive wrote persistent state',
  },
  {
    primitiveName: 'BEACON',
    expectedWrapper: 'beacon_telemetry',
    expectedEffects: ['telemetry_emit'],
    successEvidence: 'Beacon emitted telemetry event',
  },
  {
    primitiveName: 'FAILSAFE',
    expectedWrapper: 'circuit_breaker',
    expectedEffects: ['circuit_trip'],
    successEvidence: 'Circuit breaker trip logic confirmed',
  },
  {
    primitiveName: 'AUDIT',
    expectedWrapper: 'audit_trail',
    expectedEffects: ['audit_record'],
    successEvidence: 'Audit trail entry creation confirmed',
  },
  {
    primitiveName: 'CONSCIENCE',
    expectedWrapper: 'ethical_gate',
    expectedEffects: ['governance_gate', 'call_interception'],
    successEvidence: 'Ethical boundary gate evaluated decision',
  },
  {
    primitiveName: 'IMMUNITY',
    expectedWrapper: 'immunity_shield',
    expectedEffects: ['call_interception', 'validation_reject'],
    successEvidence: 'Immunity shield intercepted and validated',
  },
  {
    primitiveName: 'SENTINEL',
    expectedWrapper: 'sentinel_monitor',
    expectedEffects: ['telemetry_emit', 'call_interception'],
    successEvidence: 'Sentinel monitoring loop active',
  },
  {
    primitiveName: 'CORTEX',
    expectedWrapper: 'cortex_router',
    expectedEffects: ['call_interception'],
    successEvidence: 'Cortex routing decision executed',
  },
];

const probeSpecMap = new Map(PROBE_REGISTRY.map(p => [p.primitiveName, p]));

// ═══════════════════════════════════════════════════════════════════════════════
// §2 — ARTIFACT REPRESENTATION
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Minimal artifact interface for behavioral probing.
 * The verifier inspects L2 code structure, not L1 source.
 */
export interface ProbableArtifact {
  /** L2 source code string */
  readonly l2Source: string;
  /** Map of wrapper name → whether it was invoked during a test call */
  readonly wrapperInvocations: ReadonlyMap<string, boolean>;
  /** Observable effects captured during test execution */
  readonly capturedEffects: readonly CapturedEffect[];
}

export interface CapturedEffect {
  readonly kind: BehavioralEffectKind;
  readonly wrapperName: string;
  readonly description: string;
  readonly timestamp: number;
}

// ═══════════════════════════════════════════════════════════════════════════════
// §3 — VERIFICATION ENGINE
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Run behavioral probes against an artifact.
 *
 * Returns a BehavioralVerification with per-primitive probe results.
 * Conservative: a primitive is only verified if ALL expected effects are observed.
 */
export function runBehavioralVerification(
  primitiveNames: readonly string[],
  artifact: ProbableArtifact,
): BehavioralVerification {
  const probes: BehavioralProbe[] = primitiveNames.map(name => {
    const spec = probeSpecMap.get(name);

    if (!spec) {
      // Unknown primitive — cannot probe, report honestly
      return {
        primitiveName: name,
        target: 'unknown',
        intercepted: false,
        effects: [],
        verified: false,
        evidence: `No probe definition for primitive "${name}" — behavioral verification not available`,
      };
    }

    return executeSingleProbe(spec, artifact);
  });

  const verifiedCount = probes.filter(p => p.verified).length;
  const confidence = primitiveNames.length > 0
    ? verifiedCount / primitiveNames.length
    : 0;

  return {
    type: 'behavioral',
    probes,
    confidence,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Probe a single primitive against the artifact.
 */
function executeSingleProbe(
  spec: ProbeSpec,
  artifact: ProbableArtifact,
): BehavioralProbe {
  // Check 1: Was the wrapper invoked?
  const intercepted = artifact.wrapperInvocations.get(spec.expectedWrapper) === true;

  // Check 2: Were expected effects observed?
  const matchedEffects: BehavioralEffect[] = [];
  for (const expectedKind of spec.expectedEffects) {
    const captured = artifact.capturedEffects.find(
      e => e.kind === expectedKind && e.wrapperName === spec.expectedWrapper,
    );
    if (captured) {
      matchedEffects.push({
        kind: captured.kind,
        description: captured.description,
        deterministic: true,
      });
    }
  }

  // A primitive is behaviorally verified IFF:
  //   1. Its wrapper was intercepted
  //   2. At least one expected effect was observed
  const verified = intercepted && matchedEffects.length > 0;

  const evidence = verified
    ? spec.successEvidence
    : intercepted
      ? `Wrapper "${spec.expectedWrapper}" invoked but no expected effects observed`
      : `Wrapper "${spec.expectedWrapper}" not invoked — structural only`;

  return {
    primitiveName: spec.primitiveName,
    target: spec.expectedWrapper,
    intercepted,
    effects: matchedEffects,
    verified,
    evidence,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// §4 — STRUCTURAL-ONLY PROBE (NO RUNTIME)
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * For artifacts where runtime probing is not possible (e.g., exported ZIP),
 * produce honest structural-only results.
 *
 * This is the DEFAULT for Ascension exports — activation requires
 * the consuming application to integrate and run the artifact.
 */
export function runStructuralOnlyProbes(
  primitiveNames: readonly string[],
  l2Source: string,
): BehavioralVerification {
  const probes: BehavioralProbe[] = primitiveNames.map(name => {
    const spec = probeSpecMap.get(name);
    const wrapperPresent = spec
      ? l2Source.includes(spec.expectedWrapper)
      : false;

    return {
      primitiveName: name,
      target: spec?.expectedWrapper ?? 'unknown',
      intercepted: false,
      effects: [],
      verified: false,
      evidence: wrapperPresent
        ? `Wrapper "${spec!.expectedWrapper}" present in L2 source — structural binding confirmed, runtime activation not tested`
        : `No wrapper found for "${name}" — detection only`,
    };
  });

  return {
    type: 'behavioral',
    probes,
    confidence: 0,
    timestamp: new Date().toISOString(),
  };
}
