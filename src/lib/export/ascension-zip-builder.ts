/**
 * CMPSBL® Ascension ZIP Builder v3.0
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Streamlined export: source code, proof, manifest, license.
 * No bloated docs — just what developers need to drop back in their stack.
 *
 * Folder Structure:
 *   /src/             — Original + ascended source (dual-layer)
 *   /verification/    — CJPI certificate, test harness, Mana bridge
 *
 * © CMPSBL® — All rights reserved.
 */

import type { RestorationReport } from '@/lib/factory/restoration-docs';
import type { PrimitiveRecommendation } from '@/lib/factory/scan-team';
import { generateRefurbishedCode as generateAscendedCode, generateLicense, getRefurbishedExtension as getAscendedExtension } from '@/lib/factory/generate-refurbished-code';
import { generateProofCertificate } from './proof-certificate';
import { serializeCmpsblManifest } from './cmpsbl-manifest';

// ═══════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════

export interface AscensionZipInput {
  readonly code: string;
  readonly fileName: string | null;
  readonly report: RestorationReport;
  readonly selectedPrims: readonly PrimitiveRecommendation[];
  readonly detectedLang: string;
  readonly ascendedCode: string;
}

export interface AscensionZipResult {
  readonly blob: Blob;
  readonly zipName: string;
  readonly fileCount: number;
}

// ═══════════════════════════════════════════════════════════════
// Utilities
// ═══════════════════════════════════════════════════════════════

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

// ═══════════════════════════════════════════════════════════════
// Main ZIP Builder
// ═══════════════════════════════════════════════════════════════

export async function buildAscensionZip(input: AscensionZipInput): Promise<AscensionZipResult> {
  const { code, fileName, report, selectedPrims, detectedLang, ascendedCode } = input;
  const JSZipMod = await import('jszip');
  const JSZip = JSZipMod.default;
  const zip = new JSZip();

  const fingerprint = report.cjpiCertificate.fingerprint;
  const safeName = slugify(fileName?.replace(/\.[^.]+$/, '') || 'ascended');
  const refExt = getAscendedExtension(detectedLang);
  let fileCount = 0;

  // ── Fresh ascended code regeneration ──
  let freshAscended: string;
  try {
    freshAscended = selectedPrims.length > 0
      ? generateAscendedCode(code, [...selectedPrims], fingerprint, undefined, fileName ?? undefined)
      : ascendedCode;
  } catch (err) {
    throw new Error(`Layer 2 validation failed: ${err instanceof Error ? err.message : String(err)}`);
  }

  // ═══════════════════════════════════════════════════════════
  // /src/ — Dual-Layer Source (the main deliverable)
  // ═══════════════════════════════════════════════════════════

  zip.file('src/original-source.txt', code || '// No source provided');
  zip.file(`src/ascended-source${refExt}`, freshAscended || '// Ascended code not generated');
  fileCount += 2;

  // ═══════════════════════════════════════════════════════════
  // Root Files — Essentials only
  // ═══════════════════════════════════════════════════════════

  // README.md — Concise quick-start
  const year = new Date().getFullYear();
  zip.file('README.md', [
    `# CMPSBL® Ascended Code Package`,
    '',
    `**CJPI:** ${report.cjpiCertificate.score}/100 · **Tier:** ${report.cjpiCertificate.tier} · **Primitives:** ${report.primitiveManifest.length}`,
    `**Fingerprint:** \`${fingerprint}\` · **Language:** ${detectedLang || 'N/A'}`,
    '',
    '## What\'s Inside',
    '',
    '| Folder | Contents |',
    '|--------|----------|',
    '| `src/` | Original source (Layer 1) + ascended source (Layer 2) |',
    '| `verification/` | CJPI certificate, test harness, Mana attachment plan |',
    '',
    '## Dual-Layer Architecture',
    '',
    '- **Layer 1** — Your original code. Unchanged. Trusted.',
    '- **Layer 2** — CMPSBL cognitive overlay. Observes, enriches, augments. Never substitutes your logic.',
    '',
    '## Quick Start',
    '',
    `1. Copy \`src/ascended-source${refExt}\` into your project`,
    '2. Import the ascended version instead of your original file',
    '3. Your original code runs first — Layer 2 adds cognitive enrichment on top',
    '',
    '## Verify This Artifact',
    '',
    `- **Online:** [cmpsbl.com/verify/${fingerprint}](https://cmpsbl.com/verify/${fingerprint})`,
    `- **Local:** Run \`RUN_VERIFICATION.ts\` in the \`verification/\` folder`,
    '',
    '---',
    `© ${year} CMPSBL® — All rights reserved.`,
    'Inventor: Kenneth E. Sweet Jr. · U.S. Patent App. No. 64/029,678 · No. 64/031,637',
  ].join('\n'));
  fileCount++;

  // LICENSE
  zip.file('LICENSE.txt', generateLicense(report.id, fingerprint));
  fileCount++;

  // PROOF.txt — Verification certificate
  zip.file('PROOF.txt', generateProofCertificate({
    serial: report.id,
    fingerprint,
    tier: report.cjpiCertificate.tier,
    cjpi: report.cjpiCertificate.score,
    primitives: report.primitiveManifest.map(p => p.name),
    source: 'CMPSBL® Ascension Lab',
    language: detectedLang || undefined,
  }));
  fileCount++;

  // manifest.json
  zip.file('manifest.json', serializeCmpsblManifest({
    name: fileName?.replace(/\.[^.]+$/, '') || 'Ascended Code',
    cjpi: report.cjpiCertificate.score,
    primitives: report.primitiveManifest.map(p => p.name),
    targets: [detectedLang || 'typescript'],
    category: 'ascension',
    fingerprint,
    source: 'CMPSBL® Ascension Lab',
    serial: report.id,
  }));
  fileCount++;

  // ═══════════════════════════════════════════════════════════
  // /verification/ — Proofs & Test Harness
  // ═══════════════════════════════════════════════════════════

  zip.file('verification/cjpi-certificate.json', JSON.stringify(report.cjpiCertificate, null, 2));
  zip.file('verification/test-harness.config.json', JSON.stringify({
    serialNumber: report.id,
    fingerprint,
    configPath: report.testingGuide.configPath,
    primitives: report.primitiveManifest.map(p => p.name),
    testCommand: report.testingGuide.testCommand,
  }, null, 2));
  fileCount += 2;

  // Capability ledger + verification script (lifecycle artifacts)
  try {
    const lifecycleModule = await import('@/lib/capability-lifecycle/export-bridge');

    try {
      const runtimePath = 'packages/runtime/src/engines/behavioral-evidence-bridge';
      const runtimeModule = await import(/* @vite-ignore */ `../../${runtimePath}`).catch(() => null);
      if (runtimeModule?.hasBehavioralEvidence?.()) {
        const evidence = runtimeModule.extractBehavioralEvidence();
        lifecycleModule.injectRuntimeEvidence(evidence.probes);
      }
    } catch {
      // Runtime not available — generic probes used
    }

    const lifecycle = lifecycleModule.buildAscensionLifecycleArtifacts(
      report.primitiveManifest.map(p => ({
        chain: [p.name],
        fingerprint,
        name: p.name,
        description: p.contribution,
        archetype: 'Active' as const,
      })),
      fingerprint,
      detectedLang || 'typescript',
    );

    lifecycleModule.clearRuntimeEvidence();

    zip.file('verification/capability-ledger.json', lifecycle.ledgerJson);
    zip.file('verification/RUN_VERIFICATION.ts', lifecycleModule.generateVerificationScript(
      fingerprint,
      report.primitiveManifest.map(p => p.name),
    ));
    fileCount += 2;
  } catch {
    // Graceful degradation — lifecycle artifacts are supplementary
  }

  // ═══════════════════════════════════════════════════════════
  // Mana Bridge — Attachment Plan (if applicable)
  // ═══════════════════════════════════════════════════════════

  try {
    const { serializeAttachmentPlan, detectFunctionBoundaries, buildAttachmentPlan } = await import('@/lib/mana/findings-bridge');
    const { manifestToConfig, serializeConfig } = await import('@/lib/mana/manifest-consumer');

    const boundaries = detectFunctionBoundaries(code);
    const activePrimitives = new Set(report.primitiveManifest.map(p => p.name));
    const findings = buildAttachmentPlan(boundaries, activePrimitives);
    const plan = serializeAttachmentPlan(findings);

    zip.file('verification/mana-attachment-plan.json', JSON.stringify(plan, null, 2));
    fileCount++;

    if (plan.length > 0) {
      const manaConfig = manifestToConfig({
        source: fileName?.replace(/\.[^.]+$/, '') || 'ascended',
        language: detectedLang || 'typescript',
        cjpiScore: report.cjpiCertificate.score,
        fingerprint,
        attachmentPlan: plan,
        appliedPrimitives: report.primitiveManifest.map(p => p.name),
        exportedAt: new Date().toISOString(),
      });
      zip.file('mana.config.json', serializeConfig(manaConfig));
      fileCount++;
    }
  } catch {
    // Mana bridge is optional — graceful degradation
  }

  // ═══════════════════════════════════════════════════════════
  // Generate ZIP
  // ═══════════════════════════════════════════════════════════

  const blob = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE', compressionOptions: { level: 9 } });
  const zipName = `cmpsbl-${safeName}-${report.cjpiCertificate.tier.toLowerCase().replace(/[^a-z0-9]/g, '')}.zip`;

  return { blob, zipName, fileCount };
}
