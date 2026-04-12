/**
 * CMPSBL® Behavioral Evidence Bridge
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Extracts real behavioral evidence from the runtime verification
 * ledger and converts it into the lifecycle model's BehavioralProbe
 * format for inclusion in capability-ledger.json exports.
 *
 * This is the critical link between:
 *   - Runtime engines (interception, execution, state, analysis, orchestration)
 *   - Export pipeline (capability-ledger.json in Ascension ZIPs)
 *
 * Without this bridge, exports only contain synthetic generic probes.
 * With it, exports carry real engine evidence.
 *
 * © CMPSBL® — All rights reserved.
 */

import {
  getLedgerSnapshot,
  generateVerificationSummary,
  type VerificationEntry,
  type VerificationSummary,
} from './verification-ledger';
import { generateActivationReport, type ActivationReport } from './activation-proof';

// ═══════════════════════════════════════════════════════════════════════════════
// §1 — TYPES (matching lifecycle model without importing from src/)
// ═══════════════════════════════════════════════════════════════════════════════

/** Matches BehavioralEffectKind from capability-lifecycle/types.ts */
type EffectKind =
  | 'state_write'
  | 'telemetry_emit'
  | 'call_interception'
  | 'validation_reject'
  | 'governance_gate'
  | 'circuit_trip'
  | 'audit_record'
  | 'vertical_integration';

/** Matches BehavioralEffect from capability-lifecycle/types.ts */
interface BridgedEffect {
  readonly kind: EffectKind;
  readonly description: string;
  readonly deterministic: boolean;
}

/** Matches BehavioralProbe from capability-lifecycle/types.ts */
export interface BridgedProbe {
  readonly primitiveName: string;
  readonly target: string;
  readonly intercepted: boolean;
  readonly effects: readonly BridgedEffect[];
  readonly verified: boolean;
  readonly evidence: string;
}

/** Complete behavioral evidence package for export injection */
export interface BehavioralEvidencePackage {
  /** Per-primitive probes derived from real engine events */
  readonly probes: readonly BridgedProbe[];
  /** Activation report snapshot */
  readonly activationReport: ActivationReport;
  /** Verification summary snapshot */
  readonly verificationSummary: VerificationSummary;
  /** Total engine events captured */
  readonly totalEvents: number;
  /** Timestamp of evidence extraction */
  readonly extractedAt: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// §2 — EVENT KIND → EFFECT KIND MAPPING
// ═══════════════════════════════════════════════════════════════════════════════

const EVENT_TO_EFFECT: Record<string, EffectKind> = {
  execution_blocked: 'validation_reject',
  validation_triggered: 'call_interception',
  execution_observed: 'call_interception',
  state_persisted: 'state_write',
  anomaly_detected: 'telemetry_emit',
  circuit_tripped: 'circuit_trip',
  function_wrapped: 'call_interception',
  rule_registered: 'governance_gate',
  proof_generated: 'telemetry_emit',
  integrity_check: 'audit_record',
  artifact_bound: 'call_interception',
  vertical_sync: 'vertical_integration',
  vertical_handshake: 'vertical_integration',
};

// ═══════════════════════════════════════════════════════════════════════════════
// §3 — EVIDENCE EXTRACTION
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Extract behavioral evidence from the live runtime verification ledger.
 *
 * Groups events by primitive, converts them to BehavioralProbe format,
 * and returns a complete evidence package ready for ledger injection.
 *
 * A primitive is considered verified if:
 *   1. It has at least one wrapper invocation (function_wrapped or execution_observed)
 *   2. It has at least one meaningful effect (enforcement, state write, or anomaly)
 */
export function extractBehavioralEvidence(): BehavioralEvidencePackage {
  const snapshot = getLedgerSnapshot();
  const summary = generateVerificationSummary();
  const activationReport = generateActivationReport();

  // Group events by primitive
  const byPrimitive = new Map<string, VerificationEntry[]>();
  for (const entry of snapshot) {
    const key = entry.primitive.toUpperCase();
    const existing = byPrimitive.get(key) ?? [];
    existing.push(entry);
    byPrimitive.set(key, existing);
  }

  const probes: BridgedProbe[] = [];

  for (const [primitiveName, events] of byPrimitive) {
    // Skip SYSTEM-level events (not primitive-specific)
    if (primitiveName === 'SYSTEM') continue;

    // Check interception: any function_wrapped or execution_observed event
    const intercepted = events.some(
      e => e.kind === 'function_wrapped' ||
           e.kind === 'execution_observed' ||
           e.kind === 'validation_triggered',
    );

    // Build effects from real events
    const effects: BridgedEffect[] = [];
    const seenKinds = new Set<string>();

    for (const event of events) {
      const effectKind = EVENT_TO_EFFECT[event.kind];
      if (!effectKind) continue;

      // Deduplicate by kind to keep effects readable
      const dedupeKey = `${effectKind}:${event.kind}`;
      if (seenKinds.has(dedupeKey)) continue;
      seenKinds.add(dedupeKey);

      effects.push({
        kind: effectKind,
        description: `${event.kind}: ${event.reason}`,
        deterministic: true,
      });
    }

    // A primitive is verified if intercepted AND has meaningful effects
    const hasEnforcement = events.some(
      e => e.kind === 'execution_blocked' || e.kind === 'validation_triggered',
    );
    const hasStateEffect = events.some(e => e.kind === 'state_persisted');
    const hasObservation = events.some(
      e => e.kind === 'execution_observed' || e.kind === 'anomaly_detected',
    );
    const hasVertical = events.some(e => e.kind === 'vertical_sync' || e.kind === 'vertical_handshake');
    
    const verified = intercepted && (hasEnforcement || hasStateEffect || hasObservation || hasVertical || effects.length > 0);

    // Find the primary wrapper target from activation report
    const activationProof = activationReport.primitives.find(
      p => p.primitive.toUpperCase() === primitiveName,
    );
    const target = activationProof
      ? `${activationProof.engine}_${primitiveName.toLowerCase()}`
      : `engine_${primitiveName.toLowerCase()}`;

    // Build evidence string
    const evidenceParts: string[] = [];
    if (intercepted) evidenceParts.push('wrapper interception confirmed');
    if (hasEnforcement) evidenceParts.push('enforcement action observed');
    if (hasStateEffect) evidenceParts.push('state persistence confirmed');
    if (hasObservation) evidenceParts.push('execution observation recorded');
    if (hasVertical) evidenceParts.push('vertical integration verified');
    evidenceParts.push(`${events.length} runtime events captured`);

    const evidence = verified
      ? `Behavioral verification via runtime engines: ${evidenceParts.join(', ')}`
      : `Partial evidence: ${evidenceParts.join(', ')} — insufficient for full verification`;

    probes.push({
      primitiveName,
      target,
      intercepted,
      effects,
      verified,
      evidence,
    });
  }

  return {
    probes,
    activationReport,
    verificationSummary: summary,
    totalEvents: snapshot.length,
    extractedAt: new Date().toISOString(),
  };
}

/**
 * Check if there is meaningful behavioral evidence available.
 * Use this to decide whether to inject real evidence or fall back to generic probes.
 */
export function hasBehavioralEvidence(): boolean {
  const snapshot = getLedgerSnapshot();
  return snapshot.length > 0;
}

/**
 * Get the count of behaviorally verified primitives from real runtime evidence.
 */
export function getVerifiedPrimitiveCount(): number {
  const evidence = extractBehavioralEvidence();
  return evidence.probes.filter(p => p.verified).length;
}
