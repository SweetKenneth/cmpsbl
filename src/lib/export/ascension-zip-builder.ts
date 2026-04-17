/**
 * CMPSBL® Ascension ZIP Builder v2.0
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Enterprise-grade export builder for the Ascension Lab.
 * Generates a unified ZIP with professional folder structure,
 * premium-branded HTML docs, lifecycle artifacts, and Mana bridge data.
 *
 * Folder Structure:
 *   /src/             — Original + ascended source (dual-layer)
 *   /docs/            — Premium HTML guides & certificates
 *   /docs/guides/     — Detailed technical guides
 *   /verification/    — Ledger, proofs, test harness
 *   /reports/         — Machine-readable reports
 *   /lifecycle/       — Changelog, removal, bundle info
 *   /_runtime/        — Type definitions
 *
 * © CMPSBL® — All rights reserved.
 */

import type { RestorationReport } from '@/lib/factory/restoration-docs';
import type { PrimitiveRecommendation } from '@/lib/factory/scan-team';
import { generateRefurbishedCode as generateAscendedCode, generateLicense, getRefurbishedExtension as getAscendedExtension } from '@/lib/factory/generate-refurbished-code';
import { wrapPremiumDocPage } from './premium-html-wrapper';
import { wrapPremiumHtml, type PremiumDocInput } from './premium-html-wrapper';
import { generateUniversalUserGuide } from './universal-user-guide';
import { generateProofCertificate } from './proof-certificate';
import { serializeCmpsblManifest } from './cmpsbl-manifest';
import { generateIntegrationGuide } from './integration-guide-generator';
import { generateHtmlReport } from '@/lib/factory/html-report-generator';
import { generateExportArtifacts, generateDiscoveryContext } from './export-artifacts-generator';
import { generateCaalLicense, CAAL_VERSION } from '@/lib/licensing/caal-license';

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

function escHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function severityBadge(severity: string): string {
  const colors: Record<string, string> = {
    critical: 'background:hsl(0 70% 50%/0.1);color:hsl(0 70% 50%);border:1px solid hsl(0 70% 50%/0.2)',
    warning: 'background:hsl(38 92% 50%/0.1);color:hsl(38 70% 40%);border:1px solid hsl(38 92% 50%/0.2)',
    info: 'background:hsl(210 100% 50%/0.08);color:hsl(210 80% 40%);border:1px solid hsl(210 100% 50%/0.15)',
    hardened: 'background:hsl(145 65% 42%/0.1);color:hsl(145 65% 35%);border:1px solid hsl(145 65% 42%/0.2)',
    mitigated: 'background:hsl(210 60% 45%/0.1);color:hsl(210 60% 40%);border:1px solid hsl(210 60% 45%/0.2)',
  };
  return `<span style="display:inline-block;font-size:0.75rem;font-weight:600;padding:0.2rem 0.6rem;border-radius:0.375rem;${colors[severity] || colors.info}">${severity}</span>`;
}

// ═══════════════════════════════════════════════════════════════
// Premium Doc Builders — Enterprise HTML for every guide
// ═══════════════════════════════════════════════════════════════

function buildPipelineDetailsHtml(report: RestorationReport, fingerprint: string): string {
  const rows = report.pipelineDetails.map(p =>
    `<tr>
      <td style="font-weight:600">${p.order}</td>
      <td><strong>${escHtml(p.primitiveName)}</strong></td>
      <td>${escHtml(p.action)}</td>
      <td style="font-family:'JetBrains Mono',monospace;font-size:0.8125rem">${p.durationMs}ms</td>
    </tr>`
  ).join('\n');

  return wrapPremiumHtml({
    title: 'Pipeline Execution Details',
    subtitle: 'Step-by-step record of every primitive applied during Ascension',
    fingerprint,
    serial: report.id,
    tier: report.cjpiCertificate.tier,
    cjpi: report.cjpiCertificate.score,
    bodyContent: `
      <h2><span class="dot"></span> Execution Timeline</h2>
      <table>
        <thead><tr><th>#</th><th>Primitive</th><th>Action</th><th>Duration</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
      <div class="callout">
        <p><strong>Total Primitives:</strong> ${report.pipelineDetails.length} · 
        <strong>Total Time:</strong> ${report.pipelineDetails.reduce((s, p) => s + p.durationMs, 0)}ms</p>
      </div>
    `,
  });
}

function buildCapabilitiesHtml(report: RestorationReport, fingerprint: string): string {
  const cards = report.newCapabilities.map(c => `
    <div class="card">
      <h3>${escHtml(c.name)}</h3>
      <p>${escHtml(c.description)}</p>
      <h4>Usage Example</h4>
      <pre><code>${escHtml(c.usageExample)}</code></pre>
    </div>
  `).join('\n');

  return wrapPremiumHtml({
    title: 'New Capabilities Unlocked',
    subtitle: `${report.newCapabilities.length} capabilities discovered and activated through Ascension`,
    fingerprint,
    tier: report.cjpiCertificate.tier,
    cjpi: report.cjpiCertificate.score,
    bodyContent: `
      <h2><span class="dot"></span> Capability Catalog</h2>
      ${cards}
    `,
  });
}

function buildTestingGuideHtml(report: RestorationReport, fingerprint: string): string {
  const steps = report.testingGuide.steps.map((s, i) =>
    `<li><strong>Step ${i + 1}:</strong> ${escHtml(s)}</li>`
  ).join('\n');

  return wrapPremiumHtml({
    title: 'Testing Guide',
    subtitle: 'Verify your ascended code works correctly in your environment',
    fingerprint,
    tier: report.cjpiCertificate.tier,
    cjpi: report.cjpiCertificate.score,
    bodyContent: `
      <h2><span class="dot"></span> Quick Start</h2>
      <div class="grid-2">
        <div class="card"><div class="card-label">Install</div><pre><code>${escHtml(report.testingGuide.installCommand)}</code></pre></div>
        <div class="card"><div class="card-label">Run Tests</div><pre><code>${escHtml(report.testingGuide.testCommand)}</code></pre></div>
      </div>
      <h2><span class="dot"></span> Verification Steps</h2>
      <ol>${steps}</ol>
      <div class="callout">
        <p><strong>Config Path:</strong> <code>${escHtml(report.testingGuide.configPath)}</code></p>
      </div>
    `,
  });
}

function buildErrorCodesHtml(report: RestorationReport, fingerprint: string): string {
  const cards = report.errorCodes.map(e => `
    <div class="card">
      <h3><code>${escHtml(e.code)}</code></h3>
      <p><strong>Trigger:</strong> ${escHtml(e.trigger)}</p>
      <p><strong>Resolution:</strong> ${escHtml(e.resolution)}</p>
    </div>
  `).join('\n');

  return wrapPremiumHtml({
    title: 'Error Codes Reference',
    subtitle: 'Every error code your ascended code can emit, with resolution steps',
    fingerprint,
    tier: report.cjpiCertificate.tier,
    cjpi: report.cjpiCertificate.score,
    bodyContent: `
      <h2><span class="dot"></span> Error Catalog</h2>
      ${cards}
      <div class="callout">
        <p>If you encounter an unlisted error, use your fingerprint ID (<code>${escHtml(fingerprint)}</code>) with DECODE for instant support.</p>
      </div>
    `,
  });
}

function buildVulnerabilityHtml(report: RestorationReport, fingerprint: string): string {
  const rows = report.vulnerabilityAssessment.map(v => `
    <div class="card" style="border-left:3px solid ${v.severity === 'critical' ? 'hsl(0 70% 50%)' : v.severity === 'warning' ? 'hsl(38 92% 50%)' : 'hsl(210 60% 45%)'}">
      <div style="display:flex;align-items:center;gap:0.5rem;flex-wrap:wrap;margin-bottom:0.5rem">
        <h3 style="margin:0">${escHtml(v.title)}</h3>
        ${severityBadge(v.severity)}
        ${severityBadge(v.status)}
      </div>
      <p>${escHtml(v.details)}</p>
    </div>
  `).join('\n');

  const critCount = report.vulnerabilityAssessment.filter(v => v.severity === 'critical').length;
  const warnCount = report.vulnerabilityAssessment.filter(v => v.severity === 'warning').length;
  const fixedCount = report.vulnerabilityAssessment.filter(v => v.status === 'hardened' || v.status === 'mitigated').length;

  return wrapPremiumHtml({
    title: 'Vulnerability Assessment',
    subtitle: `${report.vulnerabilityAssessment.length} findings analyzed · ${fixedCount} addressed`,
    fingerprint,
    tier: report.cjpiCertificate.tier,
    cjpi: report.cjpiCertificate.score,
    bodyContent: `
      <div class="grid-2" style="margin-bottom:1.5rem">
        <div class="card"><div class="card-label">Critical</div><div class="card-value" style="color:hsl(0 70% 50%)">${critCount}</div></div>
        <div class="card"><div class="card-label">Warnings</div><div class="card-value" style="color:hsl(38 70% 40%)">${warnCount}</div></div>
      </div>
      <h2><span class="dot"></span> Detailed Findings</h2>
      ${rows}
    `,
  });
}

function buildPrimitiveManifestHtml(report: RestorationReport, fingerprint: string): string {
  const rows = report.primitiveManifest.map(p =>
    `<tr><td><strong>${escHtml(p.name)}</strong></td><td>${severityBadge(p.category)}</td><td>${escHtml(p.contribution)}</td></tr>`
  ).join('\n');

  const byCategory = ['Organ', 'Layer', 'Engine', 'Agent'].map(cat => {
    const count = report.primitiveManifest.filter(p => p.category === cat).length;
    return `<div class="card"><div class="card-label">${cat}s</div><div class="card-value">${count}</div></div>`;
  }).join('\n');

  return wrapPremiumHtml({
    title: 'Primitive Manifest',
    subtitle: `${report.primitiveManifest.length} primitives applied to your code`,
    fingerprint,
    tier: report.cjpiCertificate.tier,
    cjpi: report.cjpiCertificate.score,
    bodyContent: `
      <div class="grid-2" style="margin-bottom:1.5rem">${byCategory}</div>
      <h2><span class="dot"></span> Full Manifest</h2>
      <table>
        <thead><tr><th>Primitive</th><th>Category</th><th>Contribution</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
    `,
  });
}

function buildCjpiCertificateHtml(report: RestorationReport, fingerprint: string, detectedLang: string): string {
  const cert = report.cjpiCertificate;
  const year = new Date().getFullYear();
  const humanDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  return wrapPremiumHtml({
    title: 'CJPI Certificate',
    subtitle: 'Crown Jewel Performance Index — Certified Score',
    fingerprint,
    serial: report.id,
    tier: cert.tier,
    cjpi: cert.score,
    bodyContent: `
      <div style="text-align:center;padding:2rem 0 1rem">
        <div style="font-size:5rem;font-weight:900;line-height:1;color:var(--text)">${cert.score}</div>
        <div style="font-size:0.75rem;color:var(--text-muted);margin-top:0.25rem;font-family:'JetBrains Mono',monospace">out of 100</div>
        <div style="display:inline-block;margin-top:1rem;padding:0.5rem 1.5rem;border-radius:2rem;font-size:0.8125rem;font-weight:800;letter-spacing:0.15em;text-transform:uppercase;background:var(--accent-bg);color:var(--accent);border:1px solid var(--accent-border)">${cert.tier}</div>
      </div>

      <h2><span class="dot"></span> Artifact Identity</h2>
      <div class="grid-2">
        <div class="card"><div class="card-label">Serial Number</div><div class="card-value" style="font-size:0.8125rem;font-family:'JetBrains Mono',monospace">${escHtml(cert.serialNumber)}</div></div>
        <div class="card"><div class="card-label">Fingerprint ID</div><div class="card-value" style="font-size:0.8125rem;font-family:'JetBrains Mono',monospace">${escHtml(fingerprint)}</div></div>
        <div class="card"><div class="card-label">Source Language</div><div class="card-value">${escHtml(detectedLang)}</div></div>
        <div class="card"><div class="card-label">Certified Date</div><div class="card-value">${humanDate}</div></div>
      </div>

      <h2><span class="dot"></span> Primitives Applied</h2>
      <table>
        <thead><tr><th>#</th><th>Primitive</th><th>Category</th><th>Contribution</th></tr></thead>
        <tbody>${report.primitiveManifest.map((p, i) =>
          `<tr><td>${i + 1}</td><td><strong>${escHtml(p.name)}</strong></td><td>${escHtml(p.category)}</td><td>${escHtml(p.contribution)}</td></tr>`
        ).join('\n')}</tbody>
      </table>

      <h2><span class="dot"></span> Verification</h2>
      <p><strong>Online:</strong> <a href="https://cmpsbl.com/verify/${fingerprint}" target="_blank">https://cmpsbl.com/verify/${fingerprint}</a></p>
      <p><strong>Local:</strong> Run <code>RUN_VERIFICATION.ts</code> in the <code>/verification/</code> folder</p>

      <h2><span class="dot"></span> Intellectual Property</h2>
      <p>Inventor: <strong>Kenneth E. Sweet Jr.</strong><br/>
      U.S. Patent App. No. 64/029,678 · No. 64/031,637<br/>
      Parent: PromptFluid™ TX</p>
      <p style="font-size:0.75rem;color:var(--text-dim);margin-top:2rem">© ${year} CMPSBL® — All rights reserved.</p>
    `,
  });
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
  // Root Files
  // ═══════════════════════════════════════════════════════════

  // README.html — Premium branded overview
  const year = new Date().getFullYear();
  const readmeBody = [
    `<div class="grid-2" style="margin-bottom:1.5rem;">`,
    `<div class="card"><div class="card-label">Serial</div><div class="card-value" style="font-size:0.875rem;font-family:'JetBrains Mono',monospace;">${report.id}</div></div>`,
    `<div class="card"><div class="card-label">Fingerprint</div><div class="card-value" style="font-size:0.875rem;font-family:'JetBrains Mono',monospace;">${fingerprint}</div></div>`,
    `<div class="card"><div class="card-label">CJPI Score</div><div class="card-value">${report.cjpiCertificate.score}/100 <span class="badge badge-accent">${report.cjpiCertificate.tier}</span></div></div>`,
    `<div class="card"><div class="card-label">Primitives</div><div class="card-value">${report.primitiveManifest.length} applied</div></div>`,
    `<div class="card"><div class="card-label">Language</div><div class="card-value">${detectedLang || 'N/A'}</div></div>`,
    `<div class="card"><div class="card-label">Generated</div><div class="card-value" style="font-size:0.875rem;">${new Date().toISOString().slice(0, 10)}</div></div>`,
    `</div>`,
    `<h2><span class="dot"></span> What's Inside</h2>`,
    `<table><thead><tr><th>Folder</th><th>Contents</th></tr></thead><tbody>`,
    `<tr><td><code>src/</code></td><td>Original source (Layer 1) + ascended source (Layer 2)</td></tr>`,
    `<tr><td><code>docs/</code></td><td>User guide, integration guide, architecture, install wizard</td></tr>`,
    `<tr><td><code>docs/guides/</code></td><td>Pipeline details, capabilities, testing, error codes, vulnerability assessment, primitive manifest, CJPI certificate</td></tr>`,
    `<tr><td><code>verification/</code></td><td>Capability ledger, verification script, test harness config</td></tr>`,
    `<tr><td><code>reports/</code></td><td>Branded Ascension report (HTML) + machine-readable report (JSON)</td></tr>`,
    `<tr><td><code>lifecycle/</code></td><td>Changelog, removal guide, bundle info, license FAQ</td></tr>`,
    `<tr><td><code>_runtime/</code></td><td>TypeScript type definitions</td></tr>`,
    `</tbody></table>`,
    `<h2><span class="dot"></span> Quick Start</h2>`,
    `<pre><code>npx tsx quickstart.ts</code></pre>`,
    `<h2><span class="dot"></span> Verify This Artifact</h2>`,
    `<p><strong>Online:</strong> <a href="https://cmpsbl.com/verify/${fingerprint}" target="_blank">cmpsbl.com/verify/${fingerprint}</a></p>`,
    `<p><strong>Local:</strong> <code>npx tsx verification/RUN_VERIFICATION.ts</code></p>`,
    `<h2><span class="dot"></span> Intellectual Property</h2>`,
    `<p>Inventor: <strong>Kenneth E. Sweet Jr.</strong><br/>`,
    `U.S. Patent App. No. 64/029,678 · No. 64/031,637</p>`,
    `<p style="font-size:0.8125rem;color:var(--text-dim)">© ${year} CMPSBL® — All rights reserved.</p>`,
  ].join('\n');

  zip.file('README.html', wrapPremiumHtml({
    title: 'CMPSBL® Ascended Code Package',
    subtitle: `${report.primitiveManifest.length} primitives · ${report.cjpiCertificate.tier} tier · CJPI ${report.cjpiCertificate.score}/100`,
    fingerprint,
    serial: report.id,
    tier: report.cjpiCertificate.tier,
    cjpi: report.cjpiCertificate.score,
    bodyContent: readmeBody,
  }));
  fileCount++;

  // ── Official CAAL-1.0 license — both inline header (in Layer 2) and these
  //    two top-level files (HTML for humans, plain text for tooling/SPDX).
  const caalText = generateCaalLicense({ fingerprint, serial: report.id });
  zip.file('LICENSE', caalText);
  zip.file(
    'LICENSE.html',
    wrapPremiumDocPage(
      `CMPSBL® Ascended Artifact License v${CAAL_VERSION} (CAAL-${CAAL_VERSION})`,
      caalText,
    ),
  );
  fileCount += 2;

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
  // /src/ — Dual-Layer Source
  // ═══════════════════════════════════════════════════════════

  zip.file('src/original-source.txt', code || '// No source provided');
  zip.file(`src/ascended-source${refExt}`, freshAscended || '// Ascended code not generated');
  fileCount += 2;

  // ═══════════════════════════════════════════════════════════
  // /docs/ — Premium HTML Documentation
  // ═══════════════════════════════════════════════════════════

  zip.file('docs/USER-GUIDE.html', generateUniversalUserGuide({
    name: fileName?.replace(/\.[^.]+$/, '') || 'Ascended Code',
    slug: `ascended-${report.id}`,
    kind: 'ascension',
    tier: report.cjpiCertificate.tier,
    cjpi: report.cjpiCertificate.score,
    fingerprint,
    modules: report.primitiveManifest.map(p => p.name),
  }));
  fileCount++;

  // INTEGRATION.html — premium conversion from markdown
  const integrationMd = generateIntegrationGuide({
    kind: 'ascension',
    name: fileName?.replace(/\.[^.]+$/, '') || 'Ascended Code',
    slug: safeName,
    languages: [detectedLang || 'typescript'],
    systemChain: report.primitiveManifest.map(p => p.name),
    score: report.cjpiCertificate.score,
    category: 'ascension',
  });
  const integrationBody = integrationMd
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    .replace(/^## (.+)$/gm, '<h2><span class="dot"></span> $1</h2>')
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^> (.+)$/gm, '<div class="callout"><p>$1</p></div>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>\n?)+/g, (m) => `<ul>${m}</ul>`)
    .replace(/```(\w*)\n([\s\S]*?)```/g, (_m, _lang, c) => `<pre><code>${escHtml(c.trim())}</code></pre>`)
    .replace(/\n{2,}/g, '\n')
    .replace(/^(?!<[a-z])(.*[^\n])$/gm, (m) => m.trim() ? `<p>${m}</p>` : '');
  zip.file('docs/INTEGRATION.html', wrapPremiumHtml({
    title: 'Integration Guide',
    subtitle: 'Step-by-step deployment instructions for your ascended code',
    fingerprint,
    tier: report.cjpiCertificate.tier,
    cjpi: report.cjpiCertificate.score,
    bodyContent: integrationBody,
  }));
  fileCount++;

  // ── /docs/guides/ — Detailed premium HTML guides ──

  zip.file('docs/guides/pipeline-details.html', buildPipelineDetailsHtml(report, fingerprint));
  zip.file('docs/guides/new-capabilities.html', buildCapabilitiesHtml(report, fingerprint));
  zip.file('docs/guides/testing-guide.html', buildTestingGuideHtml(report, fingerprint));
  zip.file('docs/guides/error-codes.html', buildErrorCodesHtml(report, fingerprint));
  zip.file('docs/guides/vulnerability-assessment.html', buildVulnerabilityHtml(report, fingerprint));
  zip.file('docs/guides/primitive-manifest.html', buildPrimitiveManifestHtml(report, fingerprint));
  zip.file('docs/guides/cjpi-certificate.html', buildCjpiCertificateHtml(report, fingerprint, detectedLang));
  fileCount += 7;

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

  // Lifecycle artifacts (capability ledger, activation guide, verification script)
  try {
    const lifecycleModule = await import('@/lib/capability-lifecycle/export-bridge');

    // Inject real behavioral evidence from runtime engines if available
    try {
      // Dynamic import — runtime package may not be available in all environments
      const runtimePath = 'packages/runtime/src/engines/behavioral-evidence-bridge';
      const runtimeModule = await import(/* @vite-ignore */ `../../${runtimePath}`).catch(() => null);
      if (runtimeModule?.hasBehavioralEvidence?.()) {
        const evidence = runtimeModule.extractBehavioralEvidence();
        lifecycleModule.injectRuntimeEvidence(evidence.probes);
      }
    } catch {
      // Runtime not available — will use generic probes (graceful degradation)
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

    // Clean up injected evidence after use
    lifecycleModule.clearRuntimeEvidence();

    zip.file('verification/capability-ledger.json', lifecycle.ledgerJson);
    zip.file('docs/ACTIVATION-GUIDE.html', lifecycle.guideHtml);
    zip.file('verification/RUN_VERIFICATION.ts', lifecycleModule.generateVerificationScript(
      fingerprint,
      report.primitiveManifest.map(p => p.name),
    ));
    fileCount += 3;
  } catch {
    // Graceful degradation — lifecycle artifacts are supplementary
  }

  // ═══════════════════════════════════════════════════════════
  // /reports/ — Machine-readable & HTML reports
  // ═══════════════════════════════════════════════════════════

  zip.file('reports/ascension-report.html', generateHtmlReport(report));
  zip.file('reports/restoration-report.json', JSON.stringify(report, null, 2));
  fileCount += 2;

  // ═══════════════════════════════════════════════════════════
  // Supplementary artifacts from export-artifacts-generator
  // ═══════════════════════════════════════════════════════════

  try {
    const supplementary = generateExportArtifacts({
      kind: 'ascension',
      name: fileName?.replace(/\.[^.]+$/, '') || 'Ascended Code',
      slug: safeName,
      version: '1.0.0',
      score: report.cjpiCertificate.score,
      tier: report.cjpiCertificate.tier,
      languages: [detectedLang || 'typescript'],
      systemChain: report.primitiveManifest.map(p => p.name),
      category: 'ascension',
    });

    // Map supplementary artifacts to enterprise folder structure
    const folderMap: Record<string, string> = {
      'quickstart.ts': 'quickstart.ts',
      'package.json': 'package.json',
      '.env.example': '.env.example',
      'CHANGELOG.md': 'lifecycle/CHANGELOG.md',
      'ERROR-CODES.md': 'lifecycle/ERROR-CODES.md',
      'REMOVAL.md': 'lifecycle/REMOVAL.md',
      'BUNDLE-INFO.md': 'lifecycle/BUNDLE-INFO.md',
      'ARCHITECTURE.md': 'docs/ARCHITECTURE.md',
      'LICENSE-FAQ.md': 'lifecycle/LICENSE-FAQ.md',
      'MONITORING.md': 'docs/MONITORING.md',
      '_runtime/runtime.d.ts': '_runtime/runtime.d.ts',
      'docs/html/install-wizard.html': 'docs/INSTALL-WIZARD.html',
    };

    for (const [srcPath, content] of Object.entries(supplementary)) {
      const destPath = folderMap[srcPath] || srcPath;
      zip.file(destPath, content);
      fileCount++;
    }
  } catch {
    // Non-critical — supplementary artifacts are optional
  }

  // ═══════════════════════════════════════════════════════════
  // Mana Bridge — Deployment Config + Attachment Plan
  // ═══════════════════════════════════════════════════════════

  try {
    const { serializeAttachmentPlan, detectFunctionBoundaries, buildAttachmentPlan } = await import('@/lib/mana/findings-bridge');
    const { manifestToConfig, serializeConfig, summarizeDeployment } = await import('@/lib/mana/manifest-consumer');
    const { generateExampleConfig } = await import('@/lib/mana/config');

    // Build attachment plan from actual source code function boundaries
    const boundaries = detectFunctionBoundaries(code);
    const activePrimitives = new Set(report.primitiveManifest.map(p => p.name));
    const findings = buildAttachmentPlan(boundaries, activePrimitives);
    const plan = serializeAttachmentPlan(findings);

    zip.file('verification/mana-attachment-plan.json', JSON.stringify(plan, null, 2));
    fileCount++;

    // Generate deployable mana.config.json — closes the scan→deploy loop
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

      // Deployment summary
      const summary = summarizeDeployment(manaConfig);
      zip.file('verification/mana-deployment-summary.json', JSON.stringify(summary, null, 2));
      fileCount++;
    }
  } catch {
    // Mana bridge is optional — graceful degradation
  }

  // ═══════════════════════════════════════════════════════════
  // Generate ZIP
  // ═══════════════════════════════════════════════════════════

  const blob = await zip.generateAsync({ type: 'blob' });
  const zipName = `cmpsbl-${safeName}-${report.cjpiCertificate.tier.toLowerCase().replace(/[^a-z0-9]/g, '')}.zip`;

  return { blob, zipName, fileCount };
}
