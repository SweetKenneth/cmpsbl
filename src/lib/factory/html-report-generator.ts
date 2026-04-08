/**
 * HTML Ascension Report Generator
 * Generates branded, self-contained HTML documents for export
 * using the premium HTML wrapper for visual consistency.
 */

import type { RestorationReport } from './restoration-docs';
import { wrapPremiumHtml } from '@/lib/export/premium-html-wrapper';

/**
 * Generate a styled HTML Ascension report.
 * Self-contained — no external CSS or JS dependencies.
 * Uses the premium wrapper for site-consistent branding.
 */
export function generateHtmlReport(report: RestorationReport): string {
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
