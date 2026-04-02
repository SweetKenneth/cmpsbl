/**
 * HTML Restoration Report Generator
 * Generates beautiful, self-contained HTML documents for export
 * instead of plain markdown files.
 */

import type { RestorationReport } from './restoration-docs';

/**
 * Generate a styled HTML refurbishment report.
 * Self-contained — no external CSS or JS dependencies.
 */
export function generateHtmlReport(report: RestorationReport): string {
  const tierColors: Record<string, string> = {
    Apex: '#8b5cf6',
    Mythic: '#a855f7',
    Relic: '#f59e0b',
    Prime: '#3b82f6',
    Mint: '#10b981',
    Raw: '#6b7280',
  };

  const tierColor = tierColors[report.cjpiCertificate.tier] || '#6366f1';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CMPSBL® Refurbishment Report — ${report.id}</title>
  <style>
    :root {
      --primary: ${tierColor};
      --bg: #0a0a0b;
      --surface: #141416;
      --border: #27272a;
      --text: #fafafa;
      --text-muted: #a1a1aa;
      --text-dim: #71717a;
      --success: #22c55e;
      --warning: #f59e0b;
      --error: #ef4444;
    }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
      background: var(--bg);
      color: var(--text);
      line-height: 1.6;
      padding: 2rem;
      max-width: 900px;
      margin: 0 auto;
    }
    .header {
      text-align: center;
      padding: 3rem 2rem;
      border: 1px solid var(--border);
      border-radius: 1rem;
      background: linear-gradient(135deg, var(--surface), var(--bg));
      margin-bottom: 2rem;
      position: relative;
      overflow: hidden;
    }
    .header::before {
      content: '';
      position: absolute;
      top: 0; left: 0; right: 0;
      height: 3px;
      background: linear-gradient(90deg, transparent, var(--primary), transparent);
    }
    .logo { font-size: 0.75rem; letter-spacing: 0.2em; color: var(--text-dim); text-transform: uppercase; margin-bottom: 1rem; }
    .report-title { font-size: 1.75rem; font-weight: 800; margin-bottom: 0.5rem; }
    .serial { font-family: monospace; font-size: 0.8rem; color: var(--primary); background: rgba(99,102,241,0.1); padding: 0.25rem 0.75rem; border-radius: 0.5rem; display: inline-block; }
    .section { margin-bottom: 2rem; }
    .section-title {
      font-size: 1.1rem;
      font-weight: 700;
      padding-bottom: 0.75rem;
      border-bottom: 1px solid var(--border);
      margin-bottom: 1rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .section-title .dot {
      width: 8px; height: 8px;
      border-radius: 50%;
      background: var(--primary);
    }
    .card {
      border: 1px solid var(--border);
      border-radius: 0.75rem;
      padding: 1rem 1.25rem;
      background: var(--surface);
      margin-bottom: 0.75rem;
    }
    .card-label { font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.1em; color: var(--text-dim); margin-bottom: 0.25rem; }
    .card-value { font-size: 1.5rem; font-weight: 800; }
    .badge {
      display: inline-block;
      font-size: 0.65rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      padding: 0.2rem 0.5rem;
      border-radius: 0.375rem;
    }
    .badge-critical { background: rgba(239,68,68,0.15); color: var(--error); }
    .badge-warning { background: rgba(245,158,11,0.15); color: var(--warning); }
    .badge-info { background: rgba(99,102,241,0.15); color: var(--primary); }
    .badge-hardened { background: rgba(34,197,94,0.15); color: var(--success); }
    .badge-mitigated { background: rgba(245,158,11,0.15); color: var(--warning); }
    .badge-monitor { background: rgba(99,102,241,0.1); color: var(--text-dim); }
    .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }
    .grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 0.75rem; }
    table { width: 100%; border-collapse: collapse; font-size: 0.85rem; }
    th { text-align: left; padding: 0.5rem 0.75rem; border-bottom: 1px solid var(--border); color: var(--text-dim); font-weight: 600; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; }
    td { padding: 0.5rem 0.75rem; border-bottom: 1px solid rgba(39,39,42,0.5); }
    code { font-family: 'SF Mono', 'Fira Code', monospace; font-size: 0.8rem; background: rgba(39,39,42,0.5); padding: 0.15rem 0.4rem; border-radius: 0.25rem; }
    pre { background: var(--surface); border: 1px solid var(--border); border-radius: 0.75rem; padding: 1rem; font-size: 0.8rem; overflow-x: auto; font-family: 'SF Mono', 'Fira Code', monospace; line-height: 1.5; }
    .step-row { display: flex; align-items: center; gap: 0.75rem; padding: 0.5rem 0; }
    .step-num { width: 28px; height: 28px; border-radius: 50%; background: rgba(99,102,241,0.15); color: var(--primary); display: flex; align-items: center; justify-content: center; font-size: 0.7rem; font-weight: 700; flex-shrink: 0; }
    .footer { text-align: center; padding: 2rem; color: var(--text-dim); font-size: 0.75rem; border-top: 1px solid var(--border); margin-top: 3rem; }
    @media (max-width: 640px) {
      body { padding: 1rem; }
      .grid-2, .grid-3 { grid-template-columns: 1fr; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">CMPSBL® Software Refurbishment Center</div>
    <h1 class="report-title">Refurbishment Report</h1>
    <div class="serial">${report.id}</div>
    <p style="margin-top: 0.75rem; color: var(--text-muted); font-size: 0.85rem;">
      Generated ${report.generatedAt.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
    </p>
  </div>

  <!-- CJPI Certificate -->
  <div class="section">
    <div class="section-title"><span class="dot"></span> CJPI Certificate</div>
    <div class="grid-3">
      <div class="card">
        <div class="card-label">Score</div>
        <div class="card-value" style="color: var(--primary)">${report.cjpiCertificate.score}</div>
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
      <code>${report.cjpiCertificate.fingerprint}</code>
    </div>
  </div>

  <!-- Pipeline -->
  <div class="section">
    <div class="section-title"><span class="dot"></span> Refurbishment Pipeline</div>
    ${report.pipelineDetails.map(step => `
    <div class="step-row">
      <div class="step-num">${step.order}</div>
      <div>
        <strong>${step.primitiveName}</strong>
        <span style="color: var(--text-dim); font-size: 0.8rem; margin-left: 0.5rem;">${step.durationMs}ms</span>
        <div style="color: var(--text-muted); font-size: 0.8rem;">${step.action}</div>
      </div>
    </div>`).join('')}
  </div>

  <!-- Vulnerability Assessment -->
  <div class="section">
    <div class="section-title"><span class="dot"></span> Vulnerability Assessment</div>
    <table>
      <thead><tr><th>Severity</th><th>Finding</th><th>Status</th></tr></thead>
      <tbody>
        ${report.vulnerabilityAssessment.map(v => `
        <tr>
          <td><span class="badge badge-${v.severity}">${v.severity}</span></td>
          <td><strong>${v.title}</strong><br><span style="color: var(--text-dim); font-size: 0.8rem;">${v.details}</span></td>
          <td><span class="badge badge-${v.status}">${v.status}</span></td>
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
      <p style="color: var(--text-muted); font-size: 0.85rem; margin-top: 0.25rem;">${cap.description}</p>
      <pre style="margin-top: 0.5rem;">${cap.usageExample.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>
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
          <td>${e.trigger}</td>
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
        <pre>${report.testingGuide.installCommand}</pre>
      </div>
      <div style="margin-bottom: 0.75rem;">
        <span class="card-label">Run Tests</span>
        <pre>${report.testingGuide.testCommand}</pre>
      </div>
      <ol style="padding-left: 1.25rem; font-size: 0.85rem; color: var(--text-muted);">
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
          <td><strong>${p.name}</strong></td>
          <td><span class="badge badge-info">${p.category}</span></td>
          <td style="color: var(--text-muted); font-size: 0.85rem;">${p.contribution}</td>
        </tr>`).join('')}
      </tbody>
    </table>
  </div>

  <div class="footer">
    <p><strong>CMPSBL®</strong> — Software Refurbishment Center</p>
    <p style="margin-top: 0.25rem;">Primitive chain: ${report.cjpiCertificate.primitiveChain.join(' → ')}</p>
    <p style="margin-top: 0.5rem; font-size: 0.7rem;">This document is a sealed artifact. Fingerprint-validated against the CMPSBL Merkle chain.</p>
  </div>
</body>
</html>`;
}
