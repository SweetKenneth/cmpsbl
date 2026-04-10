/**
 * CMPSBL® Capability Activation Ledger Builder
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Constructs the per-artifact activation ledger from
 * pipeline stage outputs. This ledger is the SINGLE SOURCE
 * OF TRUTH for all downstream reporting and scoring.
 *
 * © CMPSBL® — All rights reserved.
 */

import type {
  CapabilityLedgerEntry,
  CapabilityActivationLedger,
  CapabilityState,
  LedgerSummary,
  BehavioralProbe,
} from './types';

// ═══════════════════════════════════════════════════════════════════════════════
// §1 — BUILDER INPUTS
// ═══════════════════════════════════════════════════════════════════════════════

/** Detection record from scan phase */
export interface DetectionRecord {
  readonly primitiveName: string;
  readonly targets: readonly string[];
  readonly confidence: number;
}

/** Generation record from generate phase */
export interface GenerationRecord {
  readonly primitiveName: string;
  readonly wrapperEmitted: boolean;
  readonly outputFile: string;
}

/** Binding record from bind phase */
export interface BindingRecord {
  readonly primitiveName: string;
  readonly boundTargets: readonly string[];
  readonly structurallyLinked: boolean;
}

/** Activation record from activate phase */
export interface ActivationRecord {
  readonly primitiveName: string;
  readonly hooksFiring: boolean;
  readonly executionPathConfirmed: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════════
// §2 — LEDGER CONSTRUCTION
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Build a capability activation ledger from pipeline stage outputs.
 *
 * Each primitive's state is computed from the highest confirmed stage.
 * Gaps are populated for every state NOT confirmed.
 */
export function buildLedger(
  fingerprintId: string,
  detections: readonly DetectionRecord[],
  generations: readonly GenerationRecord[],
  bindings: readonly BindingRecord[],
  activations: readonly ActivationRecord[],
  probes: readonly BehavioralProbe[],
): CapabilityActivationLedger {
  const generationMap = new Map(generations.map(g => [g.primitiveName, g]));
  const bindingMap = new Map(bindings.map(b => [b.primitiveName, b]));
  const activationMap = new Map(activations.map(a => [a.primitiveName, a]));
  const probeMap = new Map(probes.map(p => [p.primitiveName, p]));

  const entries: CapabilityLedgerEntry[] = detections.map(det => {
    const gen = generationMap.get(det.primitiveName);
    const bind = bindingMap.get(det.primitiveName);
    const act = activationMap.get(det.primitiveName);
    const probe = probeMap.get(det.primitiveName);

    const detected = true;
    const generated = gen?.wrapperEmitted ?? false;
    const bound = bind?.structurallyLinked ?? false;
    const activated = act?.hooksFiring === true && act?.executionPathConfirmed === true;
    const behaviorallyVerified = probe?.verified ?? false;

    const state = resolveState(detected, generated, bound, activated, behaviorallyVerified);
    const evidence = buildEvidence(det, gen, bind, act, probe);
    const gaps = buildGaps(det.primitiveName, detected, generated, bound, activated, behaviorallyVerified);

    return {
      name: det.primitiveName,
      detected,
      generated,
      bound,
      activated,
      behaviorallyVerified,
      state,
      targets: [...det.targets],
      evidence,
      gaps,
    };
  });

  const summary = computeSummary(entries);

  return {
    version: '1.0.0',
    fingerprintId,
    generatedAt: new Date().toISOString(),
    entries,
    summary,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// §3 — HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

function resolveState(
  _detected: boolean,
  generated: boolean,
  bound: boolean,
  activated: boolean,
  behaviorallyVerified: boolean,
): CapabilityState {
  // States are strictly ordered — return highest confirmed
  if (behaviorallyVerified) return 'behaviorally_verified';
  if (activated) return 'activated';
  if (bound) return 'bound';
  if (generated) return 'generated';
  return 'detected';
}

function buildEvidence(
  det: DetectionRecord,
  gen: GenerationRecord | undefined,
  bind: BindingRecord | undefined,
  act: ActivationRecord | undefined,
  probe: BehavioralProbe | undefined,
): string[] {
  const evidence: string[] = [];

  evidence.push(`Detected with confidence ${(det.confidence * 100).toFixed(0)}% on targets: ${det.targets.join(', ')}`);

  if (gen?.wrapperEmitted) {
    evidence.push(`L2 wrapper emitted in ${gen.outputFile}`);
  }

  if (bind?.structurallyLinked) {
    evidence.push(`Structurally bound to: ${bind.boundTargets.join(', ')}`);
  }

  if (act?.hooksFiring && act?.executionPathConfirmed) {
    evidence.push('Runtime activation confirmed — hooks firing in execution path');
  }

  if (probe?.verified) {
    evidence.push(`Behavioral verification: ${probe.evidence}`);
    for (const effect of probe.effects) {
      evidence.push(`Effect observed: ${effect.kind} — ${effect.description}`);
    }
  }

  return evidence;
}

function buildGaps(
  name: string,
  _detected: boolean,
  generated: boolean,
  bound: boolean,
  activated: boolean,
  behaviorallyVerified: boolean,
): string[] {
  const gaps: string[] = [];

  if (!generated) {
    gaps.push(`${name}: No L2 wrapper generated — primitive is detection-only`);
  }
  if (generated && !bound) {
    gaps.push(`${name}: Wrapper generated but not structurally bound to any target`);
  }
  if (bound && !activated) {
    gaps.push(`${name}: Structurally bound but no runtime activation detected — wrapper is structural only`);
  }
  if (activated && !behaviorallyVerified) {
    gaps.push(`${name}: Activated but no behavioral evidence — cannot confirm interception or state effects`);
  }

  return gaps;
}

function computeSummary(entries: readonly CapabilityLedgerEntry[]): LedgerSummary {
  return {
    totalDetected: entries.filter(e => e.detected).length,
    totalGenerated: entries.filter(e => e.generated).length,
    totalBound: entries.filter(e => e.bound).length,
    totalActivated: entries.filter(e => e.activated).length,
    totalBehaviorallyVerified: entries.filter(e => e.behaviorallyVerified).length,
  };
}
