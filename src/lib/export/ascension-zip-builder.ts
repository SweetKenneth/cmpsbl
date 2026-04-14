/**
 * CMPSBL® Ascension ZIP Builder v4.0
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Enterprise-grade export: Layer 2 wrapped source, branded HTML docs, verification proofs.
 *
 * Package Structure:
 *   src/original-source.txt        — Layer 1 (unchanged)
 *   src/ascended-source.*          — Layer 2 (wrapped with runtime + Enhanced mode)
 *   USER-GUIDE.html                — Unified documentation (all sections, TOC)
 *   LICENSE.html                   — Branded commercial license
 *   README.html                    — Quick-start overview
 *   manifest.json                  — Machine-readable metadata
 *   PROOF.txt                      — Cryptographic verification certificate
 *   restoration-report.json        — Full technical scan report
 *   test-harness.config.json       — Test configuration
 *   capability-ledger.json         — Lifecycle ledger (when available)
 *   RUN_VERIFICATION.ts            — Verification script (when available)
 *
 * © CMPSBL® · PromptFluid™ — All rights reserved.
 */

import type { RestorationReport } from '@/lib/factory/restoration-docs';
import type { PrimitiveRecommendation } from '@/lib/factory/scan-team';
import { generateRefurbishedCode as generateAscendedCode, generateLicense, getRefurbishedExtension as getAscendedExtension } from '@/lib/factory/generate-refurbished-code';
import { generateProofCertificate } from './proof-certificate';
import { serializeCmpsblManifest } from './cmpsbl-manifest';
import { generateLicenseHTML, generateReadmeHTML } from './elegant-html-docs';
import { generateUnifiedGuideHTML } from './unified-guide-html';

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

  // ── Fresh Layer 2 code regeneration ──
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
  // HTML Documents — Enterprise-Grade Branded Output
  // ═══════════════════════════════════════════════════════════

  // Unified User Guide — single document with ALL information + TOC
  const guideHTML = generateUnifiedGuideHTML({
    fileName: fileName || 'Ascended Code',
    detectedLang: detectedLang || 'typescript',
    report,
    selectedPrims,
    ascendedExt: refExt,
  });
  zip.file('USER-GUIDE.html', guideHTML);
  fileCount++;

  // LICENSE.html — Branded commercial license
  const licenseHTML = generateLicenseHTML(fileName?.replace(/\.[^.]+$/, '') || 'Ascended Code');
  zip.file('LICENSE.html', licenseHTML);
  fileCount++;

  // README.html — Quick-start overview
  const readmeHTML = generateReadmeHTML({
    name: fileName?.replace(/\.[^.]+$/, '') || 'Ascended Code',
    description: `CJPI ${report.cjpiCertificate.score}/100 · ${report.cjpiCertificate.tier} Tier · ${report.primitiveManifest.length} Primitives · ${detectedLang || 'TypeScript'}`,
    category: 'Ascension',
    modules: report.primitiveManifest.map(p => p.name),
    files: [
      { name: `src/ascended-source${refExt}`, purpose: 'Layer 2 wrapped code — Enhanced mode pre-activated' },
      { name: 'src/original-source.txt', purpose: 'Your original source code — byte-identical, unchanged' },
      { name: 'USER-GUIDE.html', purpose: 'Complete documentation — activation, integration, capabilities, troubleshooting' },
      { name: 'LICENSE.html', purpose: 'CMPSBL® Commercial Distribution License' },
      { name: 'manifest.json', purpose: 'Machine-readable artifact metadata' },
      { name: 'PROOF.txt', purpose: 'Cryptographic verification certificate' },
    ],
    quickStart: [
      `1. Copy src/ascended-source${refExt} into your project`,
      '2. Import the ascended version instead of your original file',
      '3. Your original code runs first — Layer 2 adds cognitive enrichment on top',
      '',
      `Verify: https://cmpsbl.com/verify/${fingerprint}`,
    ].join('\n'),
  });
  zip.file('README.html', readmeHTML);
  fileCount++;

  // ═══════════════════════════════════════════════════════════
  // Machine-Readable Metadata
  // ═══════════════════════════════════════════════════════════

  // restoration-report.json — Full scan data
  zip.file('restoration-report.json', JSON.stringify(report, null, 2));
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

  // test-harness.config.json
  zip.file('test-harness.config.json', JSON.stringify({
    serialNumber: report.id,
    fingerprint,
    configPath: report.testingGuide.configPath,
    primitives: report.primitiveManifest.map(p => p.name),
    testCommand: report.testingGuide.testCommand,
  }, null, 2));
  fileCount++;

  // ═══════════════════════════════════════════════════════════
  // Lifecycle Artifacts — Capability Ledger & Verification
  // ═══════════════════════════════════════════════════════════

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

    zip.file('capability-ledger.json', lifecycle.ledgerJson);
    zip.file('RUN_VERIFICATION.ts', lifecycleModule.generateVerificationScript(
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
