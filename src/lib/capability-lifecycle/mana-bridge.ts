/**
 * CMPSBL® Mana → Capability Lifecycle Bridge
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Converts Mana attachment data into capability lifecycle
 * records so the activation guide can be auto-generated
 * during export.
 *
 * © CMPSBL® — All rights reserved.
 */

import type { ManaManifest, AttachmentPoint } from '@/lib/mana/types';
import type { DetectionRecord, GenerationRecord, BindingRecord } from './ledger-builder';
import { buildLedger } from './ledger-builder';
import { generateActivationGuide, renderActivationGuideHtml } from './activation-guide';
import type { CapabilityActivationLedger, CapabilityActivationGuide } from './index';

// ═══════════════════════════════════════════════════════════════════════════════
// §1 — CAPABILITY NAME MAPPING
// ═══════════════════════════════════════════════════════════════════════════════

/** Map Mana capability slugs to canonical primitive names */
const CAPABILITY_TO_PRIMITIVE: Record<string, string> = {
  defense_gate: 'DEFENSE',
  input_sanitizer: 'DEFENSE',
  threat_scorer: 'DEFENSE',
  rate_limiter: 'DEFENSE',
  payload_validator: 'DEFENSE',
  injection_guard: 'DEFENSE',
  beacon_telemetry: 'BEACON',
  latency_profiler: 'BEACON',
  error_tracker: 'BEACON',
  throughput_meter: 'BEACON',
  dependency_mapper: 'BEACON',
  governance_hook: 'GOVERNANCE',
  mutation_guard: 'GOVERNANCE',
  policy_enforcer: 'GOVERNANCE',
  consent_gate: 'GOVERNANCE',
  compliance_check: 'GOVERNANCE',
  access_controller: 'GOVERNANCE',
  circuit_breaker: 'FAILSAFE',
  retry_handler: 'FAILSAFE',
  timeout_guard: 'FAILSAFE',
  bulkhead_isolator: 'FAILSAFE',
  fallback_provider: 'FAILSAFE',
  audit_trail: 'AUDIT',
  call_logger: 'AUDIT',
  state_snapshot: 'AUDIT',
  forensic_recorder: 'AUDIT',
  shadow_rule: 'SHADOW',
  output_filter: 'SHADOW',
  data_masker: 'SHADOW',
  dream_synthesis: 'DREAM',
  anomaly_detector: 'DREAM',
  drift_monitor: 'DREAM',
} as const;

function toPrimitiveName(capability: string): string {
  return CAPABILITY_TO_PRIMITIVE[capability] ?? capability.toUpperCase().replace(/_/g, ' ');
}

// ═══════════════════════════════════════════════════════════════════════════════
// §2 — RECORD BUILDERS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Group attachment points by primitive and extract unique target functions.
 */
function groupByPrimitive(points: ReadonlyArray<AttachmentPoint>): Map<string, string[]> {
  const map = new Map<string, string[]>();
  for (const point of points) {
    const name = toPrimitiveName(point.capability);
    const existing = map.get(name) ?? [];
    if (!existing.includes(point.functionName)) {
      existing.push(point.functionName);
    }
    map.set(name, existing);
  }
  return map;
}

function buildDetections(grouped: Map<string, string[]>): DetectionRecord[] {
  return Array.from(grouped.entries()).map(([name, targets]) => ({
    primitiveName: name,
    targets,
    confidence: 1.0,
  }));
}

function buildGenerations(grouped: Map<string, string[]>): GenerationRecord[] {
  return Array.from(grouped.keys()).map(name => ({
    primitiveName: name,
    wrapperEmitted: true,
    outputFile: `layer2/${name.toLowerCase()}-wrapper`,
  }));
}

function buildBindings(grouped: Map<string, string[]>): BindingRecord[] {
  return Array.from(grouped.entries()).map(([name, targets]) => ({
    primitiveName: name,
    boundTargets: targets,
    structurallyLinked: true,
  }));
}

// ═══════════════════════════════════════════════════════════════════════════════
// §3 — PUBLIC API
// ═══════════════════════════════════════════════════════════════════════════════

export interface ManaActivationArtifacts {
  readonly ledger: CapabilityActivationLedger;
  readonly guide: CapabilityActivationGuide;
  readonly guideHtml: string;
  readonly ledgerJson: string;
}

/**
 * Generate activation guide artifacts from Mana attachment data.
 *
 * For Mana exports, primitives terminate at the "bound" state —
 * activation and behavioral verification require the consuming
 * application to integrate and execute the artifact.
 */
export function generateManaActivationArtifacts(
  manifest: ManaManifest,
  fingerprintId: string,
  sourceLanguage: string,
): ManaActivationArtifacts {
  const grouped = groupByPrimitive(manifest.attachmentPoints);

  const detections = buildDetections(grouped);
  const generations = buildGenerations(grouped);
  const bindings = buildBindings(grouped);

  // Mana exports terminate at "bound" — no runtime activation data
  const activations: never[] = [];
  const probes: never[] = [];

  const ledger = buildLedger(fingerprintId, detections, generations, bindings, activations, probes);
  const guide = generateActivationGuide(ledger, sourceLanguage);
  const guideHtml = renderActivationGuideHtml(guide);
  const ledgerJson = JSON.stringify(ledger, null, 2);

  return { ledger, guide, guideHtml, ledgerJson };
}
