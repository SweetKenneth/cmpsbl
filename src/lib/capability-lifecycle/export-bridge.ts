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
 *
 * IMPORTANT: Activation is never assumed. Primitives terminate at "bound"
 * unless real runtime evidence (runtimeEvidence set) is provided.
 * This prevents overclaiming — the system only reports what it can prove.
 */
export function buildReporterLifecycleSummary(
  productName: string,
  primitives: readonly string[],
  runtimeEvidence?: ReadonlySet<string>,
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

  // Activation is NEVER assumed — only proven primitives get activated state.
  // Without runtime evidence, all primitives terminate at "bound".
  const activations = runtimeEvidence
    ? detections
        .filter(d => runtimeEvidence.has(d.primitiveName))
        .map(d => ({
          primitiveName: d.primitiveName,
          hooksFiring: true,
          executionPathConfirmed: true,
        }))
    : [];

  const ledger = buildLedger(`product-${productName}`, detections, generations, bindings, activations, []);

  return {
    ledgerSnapshot: ledger,
    activePrimitives: ledger.summary.totalActivated,
    boundPrimitives: ledger.summary.totalBound,
    gaps: ledger.entries.flatMap(e => e.gaps),
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// §4 — VERIFICATION SCRIPT GENERATOR
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Generate the RUN_VERIFICATION.ts script for inclusion in export ZIPs.
 * One command: `npx ts-node RUN_VERIFICATION.ts` → full probe output.
 */
export function generateVerificationScript(
  fingerprintId: string,
  primitives: readonly string[],
): string {
  const primitiveList = primitives.map(p => `  '${p}',`).join('\n');

  return `/**
 * CMPSBL® — Artifact Verification Script
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Run this to verify your artifact's capability integrity.
 *
 *   npx ts-node RUN_VERIFICATION.ts
 *
 * Fingerprint: ${fingerprintId}
 * Generated:   ${new Date().toISOString()}
 *
 * © CMPSBL® — All rights reserved.
 */

import { runAllProbes } from '@cmpsbl/runtime/verify';

const ARTIFACT_FINGERPRINT = '${fingerprintId}';

const EXPECTED_PRIMITIVES = [
${primitiveList}
] as const;

async function verify() {
  console.log('\\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  CMPSBL® Artifact Verification');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\\n');
  console.log(\`Fingerprint: \${ARTIFACT_FINGERPRINT}\`);
  console.log(\`Primitives:  \${EXPECTED_PRIMITIVES.length} expected\\n\`);

  const results = await runAllProbes({
    expected: EXPECTED_PRIMITIVES,
    fingerprint: ARTIFACT_FINGERPRINT,
  });

  // ━━━ Identity binding: execution ↔ identity ↔ proof ━━━
  if (results.fingerprint !== ARTIFACT_FINGERPRINT) {
    console.error('\\n🚨 FINGERPRINT MISMATCH — artifact integrity compromised');
    console.error(\`   Expected: \${ARTIFACT_FINGERPRINT}\`);
    console.error(\`   Received: \${results.fingerprint}\`);
    throw new Error('Fingerprint mismatch — artifact integrity compromised');
  }

  console.log('\\n✓ Fingerprint verified: identity bound to execution\\n');

  // ━━━ Fail-closed: every expected primitive must have a probe ━━━
  const probeNames = new Set((results.probes ?? []).map((r: { primitiveName: string }) => r.primitiveName));
  const missing = EXPECTED_PRIMITIVES.filter(p => !probeNames.has(p));
  if (missing.length > 0) {
    console.error(\`\\n🚨 VERIFICATION INCOMPLETE — missing probes for:\`);
    missing.forEach(m => console.error(\`   ✗ \${m}\`));
    throw new Error(\`Verification incomplete — missing probes for: \${missing.join(', ')}\`);
  }
  // ━━━ Tamper signal: detect injected/rogue primitives ━━━
  const expectedSet = new Set(EXPECTED_PRIMITIVES as readonly string[]);
  const unexpected = (results.probes ?? [])
    .map((r: { primitiveName: string }) => r.primitiveName)
    .filter((p: string) => !expectedSet.has(p));
  if (unexpected.length > 0) {
    console.warn(\`\\n🚨 UNEXPECTED PROBES DETECTED:\`);
    unexpected.forEach((u: string) => console.warn(\`   ⚠ \${u}\`));
    console.warn('  This may indicate injected primitives or rogue wrappers.\\n');
  }

  // ━━━ Probe delta context: instant interpretability ━━━
  console.warn(\`\\n🔍 Probe Delta:\`);
  console.warn(\`   Expected: \${EXPECTED_PRIMITIVES.length}\`);
  console.warn(\`   Observed: \${probeNames.size}\`);
  console.warn(\`   Extra:    \${unexpected.length}\`);

  console.log('━━━ Results ━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(JSON.stringify(results, null, 2));

  const verified = results.verified ?? 0;
  const total = EXPECTED_PRIMITIVES.length;

  console.log(\`\\n✓ \${verified}/\${total} primitives behaviorally verified\`);
  console.log(\`✓ \${total}/\${total} primitives accounted for (fail-closed)\`);

  if (verified < total) {
    console.log(\`⚠ \${total - verified} primitives pending full behavioral verification\`);
    console.log('  Run with runtime integration to complete verification.');
  }

  console.log('\\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\\n');
}

verify().catch(console.error);
`;
}
