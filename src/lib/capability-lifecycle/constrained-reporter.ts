/**
 * CMPSBL® Constrained Report Generator
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Generates reports that are INCAPABLE of overclaiming.
 *
 * Hard rules:
 *   - NEVER claim runtime capability unless activated === true
 *   - NEVER claim mitigation/enforcement unless behaviorallyVerified === true
 *   - All claims are validated against the ledger before emission
 *
 * This module replaces ad-hoc report generation with
 * ledger-constrained, evidence-based output.
 *
 * © CMPSBL® — All rights reserved.
 */

import type {
  CapabilityActivationLedger,
  CapabilityLedgerEntry,
  DecomposedCJPI,
  ClaimLevel,
} from './types';
import {
  STATE_TO_MAX_CLAIM,
  SYSTEM_LIMITATIONS,
  computeDecomposedCJPI,
} from './types';

// ═══════════════════════════════════════════════════════════════════════════════
// §1 — REPORT TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export interface ConstrainedReport {
  readonly fingerprintId: string;
  readonly generatedAt: string;
  readonly pipelineVersion: '2.0.0';

  /** Decomposed CJPI — lifecycle-aware */
  readonly cjpi: DecomposedCJPI;

  /** Per-primitive capability summaries */
  readonly capabilities: readonly CapabilitySummary[];

  /** System limitations — always present */
  readonly limitations: readonly string[];

  /** Overall qualification label */
  readonly qualificationLabel: string;

  /** Aggregate gaps across all primitives */
  readonly aggregateGaps: readonly string[];
}

export interface CapabilitySummary {
  readonly primitiveName: string;
  readonly claimLevel: ClaimLevel;
  readonly statement: string;
  readonly evidence: readonly string[];
  readonly gaps: readonly string[];
}

// ═══════════════════════════════════════════════════════════════════════════════
// §2 — REPORT GENERATION
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Generate a constrained report from the activation ledger.
 *
 * Every claim is gated by the ledger entry's state.
 * No claim may exceed the evidence recorded in the ledger.
 */
export function generateConstrainedReport(
  ledger: CapabilityActivationLedger,
): ConstrainedReport {
  const cjpi = computeDecomposedCJPI(ledger);

  const capabilities: CapabilitySummary[] = ledger.entries.map(entry =>
    buildCapabilitySummary(entry),
  );

  const aggregateGaps = ledger.entries.flatMap(e => e.gaps);

  const qualificationLabel = buildQualificationLabel(cjpi, ledger);

  return {
    fingerprintId: ledger.fingerprintId,
    generatedAt: new Date().toISOString(),
    pipelineVersion: '2.0.0',
    cjpi,
    capabilities,
    limitations: [...SYSTEM_LIMITATIONS],
    qualificationLabel,
    aggregateGaps,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// §3 — CLAIM CONSTRUCTION
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Build a capability summary for a single ledger entry.
 * The statement is strictly constrained by the entry's state.
 */
function buildCapabilitySummary(entry: CapabilityLedgerEntry): CapabilitySummary {
  const claimLevel = STATE_TO_MAX_CLAIM[entry.state];
  const statement = buildStatement(entry, claimLevel);

  return {
    primitiveName: entry.name,
    claimLevel,
    statement,
    evidence: [...entry.evidence],
    gaps: [...entry.gaps],
  };
}

/**
 * Build a human-readable statement for a capability.
 * This is the ONLY place where claim language is generated.
 */
function buildStatement(entry: CapabilityLedgerEntry, level: ClaimLevel): string {
  switch (level) {
    case 'structural': {
      if (entry.bound) {
        return `${entry.name}: Wrapper generated and structurally bound to ${entry.targets.length} target(s). No runtime activation confirmed.`;
      }
      if (entry.generated) {
        return `${entry.name}: L2 orchestration code generated. Not yet bound to execution targets.`;
      }
      return `${entry.name}: Primitive detected in source analysis. No wrapper generated.`;
    }

    case 'runtime': {
      return `${entry.name}: Runtime activation confirmed — hooks firing in execution path for ${entry.targets.length} target(s). Behavioral verification pending.`;
    }

    case 'behavioral': {
      const effectCount = entry.evidence.filter(e => e.startsWith('Effect observed:')).length;
      return `${entry.name}: Behavior verified — ${effectCount} observable effect(s) confirmed. Enforcement active and proven.`;
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// §4 — QUALIFICATION LABELS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Build the headline qualification label.
 * This label appears on reports and certificates.
 *
 * The label MUST NOT imply runtime capability unless proven.
 */
function buildQualificationLabel(
  cjpi: DecomposedCJPI,
  ledger: CapabilityActivationLedger,
): string {
  const { summary } = ledger;

  if (summary.totalBehaviorallyVerified > 0 && cjpi.impliesRuntimeCapability) {
    const pct = Math.round((summary.totalBehaviorallyVerified / summary.totalDetected) * 100);
    return `CJPI ${cjpi.composite} — ${pct}% Behaviorally Verified`;
  }

  if (summary.totalActivated > 0) {
    const pct = Math.round((summary.totalActivated / summary.totalDetected) * 100);
    return `CJPI ${cjpi.composite} — ${pct}% Runtime Activated (behavioral verification pending)`;
  }

  if (summary.totalBound > 0) {
    return `CJPI ${cjpi.composite} — Structural Coverage (${summary.totalBound}/${summary.totalDetected} bound, runtime activation required)`;
  }

  return `CJPI ${cjpi.composite} — Detection Only (${summary.totalDetected} primitives identified, no runtime binding)`;
}
