/**
 * HTML Ascension Report Generator
 * Generates branded, self-contained HTML documents for export
 * using the premium HTML wrapper for visual consistency.
 *
 * v2.0.0 — Now includes lifecycle-aware constrained reporting
 * and decomposed CJPI breakdown.
 */

import type { RestorationReport } from './restoration-docs';
import { wrapPremiumHtml } from '@/lib/export/premium-html-wrapper';
import { buildAscensionLifecycleArtifacts } from '@/lib/capability-lifecycle/export-bridge';
import { generateConstrainedReport } from '@/lib/capability-lifecycle/constrained-reporter';
import { computeDecomposedCJPI } from '@/lib/capability-lifecycle/types';

/**
 * Generate a styled HTML Ascension report.
 * Self-contained — no external CSS or JS dependencies.
 * Uses the premium wrapper for site-consistent branding.
 *
 * v2.0.0: Includes lifecycle-constrained capability reporting
 * and decomposed CJPI to prevent overclaiming.
 */
export function generateHtmlReport(report: RestorationReport): string {
  // Build lifecycle artifacts for constrained reporting
  const fingerprint = report.cjpiCertificate.fingerprint;
  const lifecycle = buildAscensionLifecycleArtifacts(
    report.primitiveManifest.map(p => ({
      chain: [p.name],
      fingerprint,
      name: p.name,
      description: p.contribution,
      archetype: 'Active' as const,
    })),
    fingerprint,
    'typescript',
  );

  const constrained = generateConstrainedReport(lifecycle.ledger);
  const decomposed = computeDecomposedCJPI(lifecycle.ledger);

  const bodyContent = `
  <!-- CJPI Certificate -->
  <div class="section">
    <div class="section-title"><span class="dot"></span> CJPI Certificate</div>
    <div class="grid-3">
      <div class="card">
        <div class="card-label">Score</div>
        <div class="card-value" style="color: var(--accent)">${report.cjpiCertificate.score}</div>
      </div>
      <div class="card">
        <div class="card-label">Tier</div>
        <div class="card-value">${report.cjpiCertificate.tier}</div>
      </div>
      <div class="card">
        <div class="card-label">Primitives Applied</div>
        <div class="card-value">${report.primitiveManifest.length}</div>
      </div>
    </div>
    <div class="card" style="margin-top: 0.5rem;">
      <div class="card-label">Fingerprint</div>
      <code style="font-size: 0.75rem">${report.cjpiCertificate.fingerprint}</code>
    </div>
  </div>

  <!-- Decomposed CJPI (Lifecycle-Aware) -->
  <div class="section">
    <div class="section-title"><span class="dot"></span> Decomposed CJPI Breakdown</div>
    <div class="card">
      <div class="card-label">Qualification</div>
      <div class="card-value" style="font-size: 0.85rem; color: var(--text)">${constrained.qualificationLabel}</div>
    </div>
    <div class="grid-3" style="margin-top: 0.5rem;">
      <div class="card">
        <div class="card-label">Structural (25%)</div>
        <div class="card-value">${decomposed.structuralScore}</div>
      </div>
      <div class="card">
        <div class="card-label">Binding (25%)</div>
        <div class="card-value">${decomposed.bindingScore}</div>
      </div>
      <div class="card">
        <div class="card-label">Activation (25%)</div>
        <div class="card-value">${decomposed.activationScore}</div>
      </div>
    </div>
    <div class="grid-3" style="margin-top: 0.5rem;">
      <div class="card">
        <div class="card-label">Behavioral (20%)</div>
        <div class="card-value">${decomposed.behavioralScore}</div>
      </div>
      <div class="card">
        <div class="card-label">Security (5%)</div>
        <div class="card-value">${decomposed.securityScore}</div>
      </div>
      <div class="card">
        <div class="card-label">Composite</div>
        <div class="card-value" style="color: var(--accent)">${decomposed.composite}</div>
      </div>
    </div>
    ${!decomposed.impliesRuntimeCapability ? `
    <div class="card" style="margin-top: 0.5rem; border-color: var(--warning, #f59e0b);">
      <div class="card-label" style="color: var(--warning, #f59e0b)">⚠ Structural Only</div>
      <p style="color: var(--text-muted); font-size: 0.8rem; margin: 0.25rem 0 0 0;">
        This score reflects structural coverage. Runtime behavior requires explicit activation and integration by the consuming application.
      </p>
    </div>` : ''}
  </div>

  <!-- Lifecycle-Constrained Capabilities -->
  <div class="section">
    <div class="section-title"><span class="dot"></span> Capability Lifecycle Status</div>
    <table>
      <thead><tr><th>Primitive</th><th>Claim Level</th><th>Status</th></tr></thead>
      <tbody>
        ${constrained.capabilities.map(cap => `
        <tr>
          <td><strong style="color:var(--text)">${cap.primitiveName}</strong></td>
          <td><span class="badge badge-${cap.claimLevel === 'behavioral' ? 'success' : cap.claimLevel === 'runtime' ? 'warning' : 'info'}">${cap.claimLevel}</span></td>
          <td style="color: var(--text-muted); font-size: 0.85rem;">${cap.statement}</td>
        </tr>`).join('')}
      </tbody>
    </table>
    ${constrained.aggregateGaps.length > 0 ? `
    <div class="card" style="margin-top: 0.5rem;">
      <div class="card-label">Gaps (${constrained.aggregateGaps.length})</div>
      <ul style="font-size: 0.8rem; color: var(--text-muted); padding-left: 1rem; margin: 0.25rem 0 0 0;">
        ${constrained.aggregateGaps.slice(0, 10).map(g => `<li>${g}</li>`).join('')}
        ${constrained.aggregateGaps.length > 10 ? `<li>...and ${constrained.aggregateGaps.length - 10} more</li>` : ''}
      </ul>
    </div>` : ''}
  </div>

  <!-- Ascension Pipeline -->
  <div class="section">
    <div class="section-title"><span class="dot"></span> Ascension Pipeline</div>
    ${report.pipelineDetails.map(step => `
    <div class="step-row">
      <div class="step-num">${step.order}</div>
      <div class="step-content">
        <div class="step-label">${step.primitiveName}</div>
        <div class="step-detail">${step.action} · ${step.durationMs}ms</div>
      </div>
    </div>`).join('')}
  </div>

  <!-- Structural Assessment -->
  <div class="section">
    <div class="section-title"><span class="dot"></span> Structural Assessment</div>
    <table>
      <thead><tr><th>Severity</th><th>Finding</th><th>Status</th></tr></thead>
      <tbody>
        ${report.vulnerabilityAssessment.map(v => `
        <tr>
          <td><span class="badge badge-${v.severity === 'critical' ? 'error' : v.severity === 'warning' ? 'warning' : 'info'}">${v.severity}</span></td>
          <td><strong style="color:var(--text)">${v.title}</strong><br><span style="color: var(--text-muted); font-size: 0.8rem;">${v.details}</span></td>
          <td><span class="badge badge-${v.status === 'hardened' ? 'success' : v.status === 'mitigated' ? 'warning' : 'muted'}">${v.status}</span></td>
        </tr>`).join('')}
      </tbody>
    </table>
  </div>

  <!-- New Capabilities -->
  <div class="section">
    <div class="section-title"><span class="dot"></span> New Capabilities</div>
    ${report.newCapabilities.map(cap => `
    <div class="card">
      <strong>${cap.name}</strong>
      <p style="color: var(--text-muted); font-size: 0.85rem; margin-top: 0.375rem; margin-bottom: 0.5rem;">${cap.description}</p>
      <pre style="margin-top: 0.5rem; margin-bottom: 0;">${cap.usageExample.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>
    </div>`).join('')}
  </div>

  <!-- Error Codes -->
  <div class="section">
    <div class="section-title"><span class="dot"></span> Error Codes</div>
    <table>
      <thead><tr><th>Code</th><th>Trigger</th><th>Resolution</th></tr></thead>
      <tbody>
        ${report.errorCodes.map(e => `
        <tr>
          <td><code>${e.code}</code></td>
          <td style="color:var(--text-secondary)">${e.trigger}</td>
          <td style="color: var(--text-muted);">${e.resolution}</td>
        </tr>`).join('')}
      </tbody>
    </table>
  </div>

  <!-- Testing Guide -->
  <div class="section">
    <div class="section-title"><span class="dot"></span> Testing Guide</div>
    <div class="card">
      <div style="margin-bottom: 0.75rem;">
        <span class="card-label">Install</span>
        <pre style="margin-bottom:0">${report.testingGuide.installCommand}</pre>
      </div>
      <div style="margin-bottom: 0.75rem;">
        <span class="card-label">Run Tests</span>
        <pre style="margin-bottom:0">${report.testingGuide.testCommand}</pre>
      </div>
      <ol style="padding-left: 1.25rem; font-size: 0.85rem; color: var(--text-muted); margin-bottom: 0;">
        ${report.testingGuide.steps.map(s => `<li style="margin-bottom: 0.5rem;">${s.replace(/</g, '&lt;')}</li>`).join('')}
      </ol>
    </div>
  </div>

  <!-- Primitive Manifest -->
  <div class="section">
    <div class="section-title"><span class="dot"></span> Primitive Manifest</div>
    <table>
      <thead><tr><th>Primitive</th><th>Category</th><th>Contribution</th></tr></thead>
      <tbody>
        ${report.primitiveManifest.map(p => `
        <tr>
          <td><strong style="color:var(--text)">${p.name}</strong></td>
          <td><span class="badge badge-info">${p.category}</span></td>
          <td style="color: var(--text-muted); font-size: 0.85rem;">${p.contribution}</td>
        </tr>`).join('')}
      </tbody>
    </table>
  </div>

  <!-- System Limitations -->
  <div class="section">
    <div class="section-title"><span class="dot"></span> System Limitations</div>
    <div class="card">
      <ul style="font-size: 0.8rem; color: var(--text-muted); padding-left: 1rem; margin: 0;">
        ${constrained.limitations.map(l => `<li style="margin-bottom: 0.375rem;">${l}</li>`).join('')}
      </ul>
    </div>
  </div>
  `;

  return wrapPremiumHtml({
    title: 'Ascension Report',
    subtitle: `Serial: ${report.id} · ${report.primitiveManifest.length} primitives applied`,
    serial: report.id,
    fingerprint: report.cjpiCertificate.fingerprint,
    tier: report.cjpiCertificate.tier,
    cjpi: report.cjpiCertificate.score,
    generatedAt: report.generatedAt.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
    bodyContent,
  });
}
