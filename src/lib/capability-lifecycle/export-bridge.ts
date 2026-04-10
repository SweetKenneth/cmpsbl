/**
 * CMPSBL® Capability Lifecycle — Export Bridge
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Universal bridge for injecting capability lifecycle artifacts
 * (ledger + activation guide) into ANY export pipeline.
 *
 * Supported consumers:
 *   - Ascension ZIP generator (proprietary-evolution)
 *   - Product ZIP generator (Store engines/agents)
 *   - Federated vertical scanners
 *   - Product reporters (auto-sentinel, dep-guardian, etc.)
 *
 * © CMPSBL® — All rights reserved.
 */

import type { DetectionRecord, GenerationRecord, BindingRecord } from './ledger-builder';
import { buildLedger } from './ledger-builder';
import { generateActivationGuide, renderActivationGuideHtml } from './activation-guide';
import type { CapabilityActivationLedger } from './types';
import type { CapabilityActivationGuide } from './activation-guide';

// ═══════════════════════════════════════════════════════════════════════════════
// §1 — INPUT ADAPTERS
// ═══════════════════════════════════════════════════════════════════════════════

/** Minimal capability shape accepted from any export pipeline */
export interface ExportCapability {
  readonly name: string;
  readonly chain: readonly string[];
  readonly fingerprint: string;
  readonly tier?: string;
  readonly cjpiScore?: number;
  readonly capabilityType?: string;
}

/** Minimal product shape accepted from Store exports */
export interface ExportProduct {
  readonly name: string;
  readonly slug: string;
  readonly kind: 'engine' | 'agent';
  readonly tier: string;
  readonly capabilities?: readonly string[];
}

// ═══════════════════════════════════════════════════════════════════════════════
// §2 — ARTIFACT GENERATORS
// ═══════════════════════════════════════════════════════════════════════════════

export interface LifecycleExportArtifacts {
  readonly ledger: CapabilityActivationLedger;
  readonly guide: CapabilityActivationGuide;
  readonly guideHtml: string;
  readonly ledgerJson: string;
}

/**
 * Build lifecycle artifacts from Ascension capability exports.
 * Each capability's chain primitives become detected + generated + bound entries.
 */
export function buildAscensionLifecycleArtifacts(
  capabilities: readonly ExportCapability[],
  fingerprintId: string,
  sourceLanguage: string,
): LifecycleExportArtifacts {
  const primitiveTargets = new Map<string, string[]>();

  // Collect all primitives from all capability chains
  for (const cap of capabilities) {
    for (const primitive of cap.chain) {
      const normalized = primitive.toUpperCase().replace(/[^A-Z0-9_]/g, '');
      const existing = primitiveTargets.get(normalized) ?? [];
      if (!existing.includes(cap.name)) {
        existing.push(cap.name);
      }
      primitiveTargets.set(normalized, existing);
    }
  }

  const detections: DetectionRecord[] = Array.from(primitiveTargets.entries()).map(
    ([name, targets]) => ({ primitiveName: name, targets, confidence: 1.0 }),
  );

  const generations: GenerationRecord[] = detections.map(d => ({
    primitiveName: d.primitiveName,
    wrapperEmitted: true,
    outputFile: `layer2/${d.primitiveName.toLowerCase()}-wrapper`,
  }));

  const bindings: BindingRecord[] = detections.map(d => ({
    primitiveName: d.primitiveName,
    boundTargets: [...d.targets],
    structurallyLinked: true,
  }));

  const ledger = buildLedger(fingerprintId, detections, generations, bindings, [], []);
  const guide = generateActivationGuide(ledger, sourceLanguage);
  const guideHtml = renderActivationGuideHtml(guide);
  const ledgerJson = JSON.stringify(ledger, null, 2);

  return { ledger, guide, guideHtml, ledgerJson };
}

/**
 * Build lifecycle artifacts from Store product exports.
 * Product capabilities become detected primitives.
 */
export function buildProductLifecycleArtifacts(
  product: ExportProduct,
): LifecycleExportArtifacts {
  const capabilities = product.capabilities ?? [
    product.kind === 'engine' ? 'ENGINE' : 'AGENT',
    product.name,
  ];

  const fingerprintId = `${product.kind}-${product.slug}`;

  const detections: DetectionRecord[] = capabilities.map(cap => ({
    primitiveName: cap.toUpperCase().replace(/[^A-Z0-9_]/g, ''),
    targets: [product.slug],
    confidence: 1.0,
  }));

  const generations: GenerationRecord[] = detections.map(d => ({
    primitiveName: d.primitiveName,
    wrapperEmitted: true,
    outputFile: `_runtime/${d.primitiveName.toLowerCase()}-sealed`,
  }));

  const bindings: BindingRecord[] = detections.map(d => ({
    primitiveName: d.primitiveName,
    boundTargets: [product.slug],
    structurallyLinked: true,
  }));

  const ledger = buildLedger(fingerprintId, detections, generations, bindings, [], []);
  const guide = generateActivationGuide(ledger, 'typescript');
  const guideHtml = renderActivationGuideHtml(guide);
  const ledgerJson = JSON.stringify(ledger, null, 2);

  return { ledger, guide, guideHtml, ledgerJson };
}

/**
 * Build lifecycle detection records from federated scanner signals.
 * Used to feed scanner intelligence into the lifecycle model.
 */
export function buildScannerDetectionRecords(
  signals: Map<string, string[]>,
): DetectionRecord[] {
  return Array.from(signals.entries()).map(([primitive, targets]) => ({
    primitiveName: primitive,
    targets: [...targets],
    confidence: targets.length > 2 ? 1.0 : targets.length > 1 ? 0.85 : 0.7,
  }));
}

/**
 * Build lifecycle summary for product reporters.
 * Returns a compact summary that can be appended to report output.
 */
export function buildReporterLifecycleSummary(
  productName: string,
  primitives: readonly string[],
): {
  readonly ledgerSnapshot: CapabilityActivationLedger;
  readonly activePrimitives: number;
  readonly boundPrimitives: number;
  readonly gaps: readonly string[];
} {
  const detections: DetectionRecord[] = primitives.map(p => ({
    primitiveName: p,
    targets: [productName],
    confidence: 1.0,
  }));

  const generations: GenerationRecord[] = detections.map(d => ({
    primitiveName: d.primitiveName,
    wrapperEmitted: true,
    outputFile: `${productName}/${d.primitiveName.toLowerCase()}`,
  }));

  const bindings: BindingRecord[] = detections.map(d => ({
    primitiveName: d.primitiveName,
    boundTargets: [productName],
    structurallyLinked: true,
  }));

  // Product reporters have runtime activation evidence
  const activations = detections.map(d => ({
    primitiveName: d.primitiveName,
    hooksFiring: true,
    executionPathConfirmed: true,
  }));

  const ledger = buildLedger(`product-${productName}`, detections, generations, bindings, activations, []);

  return {
    ledgerSnapshot: ledger,
    activePrimitives: ledger.summary.totalActivated,
    boundPrimitives: ledger.summary.totalBound,
    gaps: ledger.entries.flatMap(e => e.gaps),
  };
}
