/**
 * HTML Artifact Generator
 * ━━━━━━━━━━━━━━━━━━━━━━━
 * Converts markdown-format export artifacts into beautifully styled HTML
 * matching the elegant-html-docs aesthetic. Mobile responsive.
 *
 * © 2025–2026 CMPSBL® · PromptFluid™. All rights reserved.
 */

function esc(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

const year = () => new Date().getFullYear();

const SHARED_STYLES = `
    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Inter:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');
    *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
    @page { size: A4; margin: 2cm 2.5cm; }
    body {
      font-family: 'Inter', -apple-system, sans-serif;
      background: #faf9f6;
      color: #1a1a1f;
      line-height: 1.75;
      font-size: 13px;
      -webkit-font-smoothing: antialiased;
      overflow-wrap: break-word;
    }
    .page {
      max-width: 740px;
      margin: 0 auto;
      padding: 3rem 4rem;
      background: white;
      min-height: 100vh;
      box-shadow: 0 1px 3px rgba(0,0,0,0.04), 0 20px 60px rgba(0,0,0,0.06);
    }
    @media print { body { background: white; } .page { box-shadow: none; padding: 0; max-width: 100%; } }
    @media (max-width: 680px) { .page { padding: 1.5rem 1.25rem; } }
    @media (max-width: 480px) { .page { padding: 1.25rem 1rem; } body { font-size: 12.5px; } }
    .doc-header {
      text-align: center;
      padding-bottom: 2rem;
      border-bottom: 2px solid #1a1a1f;
      margin-bottom: 2.5rem;
    }
    .doc-header .issuer {
      font-size: 0.6rem; font-weight: 600; text-transform: uppercase;
      letter-spacing: 0.3em; color: #9b9baa; margin-bottom: 1.5rem;
    }
    .doc-title {
      font-family: 'Cormorant Garamond', Georgia, serif;
      font-size: 1.6rem; font-weight: 600; letter-spacing: -0.01em; line-height: 1.25;
      word-break: break-word; hyphens: auto;
    }
    @media (max-width: 480px) { .doc-title { font-size: 1.35rem; } }
    .doc-subtitle {
      font-family: 'Cormorant Garamond', Georgia, serif;
      font-size: 1rem; font-style: italic; color: #6b6b78; margin-top: 0.5rem;
    }
    h2 {
      font-family: 'Cormorant Garamond', Georgia, serif;
      font-size: 1.15rem; font-weight: 600;
      margin: 2.2rem 0 0.8rem; padding-bottom: 0.4rem;
      border-bottom: 1px solid rgba(26,26,31,0.1);
    }
    h3 {
      font-family: 'Cormorant Garamond', Georgia, serif;
      font-size: 1rem; font-weight: 600; margin: 1.5rem 0 0.6rem;
    }
    p { margin-bottom: 0.9rem; color: #3a3a42; }
    ul, ol { margin: 0.5rem 0 1rem 1.5rem; color: #3a3a42; }
    li { margin-bottom: 0.35rem; }
    code {
      font-family: 'JetBrains Mono', monospace; font-size: 0.82em;
      background: #f0ede6; padding: 0.12em 0.4em; border-radius: 3px;
    }
    pre {
      background: #f8f7f4; border: 1px solid rgba(26,26,31,0.08); border-radius: 6px;
      padding: 1rem 1.25rem; overflow-x: auto; margin: 1rem 0;
      font-family: 'JetBrains Mono', monospace; font-size: 0.78rem; line-height: 1.7;
      color: #3a3a42; white-space: pre-wrap; word-wrap: break-word;
    }
    @media (max-width: 480px) { pre { padding: 0.75rem; font-size: 0.72rem; } }
    table {
      width: 100%; border-collapse: collapse; margin: 1rem 0;
      font-size: 0.85rem; overflow-x: auto; display: block;
    }
    @media (min-width: 680px) { table { display: table; } }
    thead th {
      text-align: left; font-size: 0.7rem; font-weight: 600; text-transform: uppercase;
      letter-spacing: 0.1em; color: #9b9baa; padding: 0.5rem 0.75rem;
      border-bottom: 2px solid rgba(26,26,31,0.1); white-space: nowrap;
    }
    td {
      padding: 0.5rem 0.75rem; border-bottom: 1px solid rgba(26,26,31,0.06);
      color: #3a3a42; vertical-align: top;
    }
    .highlight-box {
      background: #faf5e8; border-left: 3px solid #c9a84c;
      padding: 0.9rem 1.25rem; border-radius: 0 4px 4px 0; margin: 1rem 0;
      font-size: 0.88rem;
    }
    .info-box {
      background: #f0f5ff; border-left: 3px solid #5b8def;
      padding: 0.9rem 1.25rem; border-radius: 0 4px 4px 0; margin: 1rem 0;
      font-size: 0.88rem;
    }
    .warning-box {
      background: #fff8f0; border-left: 3px solid #e8913a;
      padding: 0.9rem 1.25rem; border-radius: 0 4px 4px 0; margin: 1rem 0;
      font-size: 0.88rem;
    }
    .support-box {
      background: #f8f8f6; border: 1px solid rgba(26,26,31,0.08); border-radius: 6px;
      padding: 1.25rem 1.5rem; margin: 1.5rem 0; text-align: center;
    }
    .support-box a { color: #5b8def; text-decoration: none; font-weight: 500; }
    .support-box a:hover { text-decoration: underline; }
    .colophon {
      margin-top: 3rem; padding-top: 2rem; border-top: 2px solid #1a1a1f;
      display: flex; justify-content: space-between; align-items: flex-end; flex-wrap: wrap; gap: 1rem;
    }
    .colophon-left { font-size: 0.72rem; color: #9b9baa; line-height: 1.8; }
    .colophon-right { font-family: 'Cormorant Garamond', Georgia, serif; font-size: 1.1rem; font-weight: 600; color: #9b9baa; }
    .ornament { text-align: center; font-size: 1.2rem; color: rgba(26,26,31,0.2); margin: 2rem 0; letter-spacing: 0.5em; }
    .checklist { list-style: none; padding: 0; }
    .checklist li { padding: 0.4rem 0; padding-left: 1.5rem; position: relative; }
    .checklist li::before { content: '☐'; position: absolute; left: 0; color: #9b9baa; }
`;

function htmlShell(title: string, subtitle: string, body: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${esc(title)} — CMPSBL®</title>
  <style>${SHARED_STYLES}</style>
</head>
<body>
<div class="page">
  <header class="doc-header">
    <div class="issuer">CMPSBL® · Export Documentation</div>
    <div class="doc-title">${esc(title)}</div>
    <div class="doc-subtitle">${esc(subtitle)}</div>
  </header>
${body}
  <div class="ornament">· · ·</div>
  <div class="support-box">
    <p style="margin-bottom:0.4rem;"><strong>Need help?</strong></p>
    <p style="margin-bottom:0.25rem;"><a href="mailto:support@cmpsbl.com">support@cmpsbl.com</a></p>
    <p style="font-size:0.8rem;color:#9b9baa;margin-bottom:0;"><a href="https://cmpsbl.com/developers">cmpsbl.com/developers</a> · <a href="https://github.com/SweetKenneth/cmpsbl-daily-drop">GitHub</a></p>
  </div>
  <footer class="colophon">
    <div class="colophon-left">
      Generated by the CMPSBL® Export System<br>
      https://cmpsbl.com<br>
      © ${year()} CMPSBL®. All rights reserved.
    </div>
    <div class="colophon-right">CMPSBL®</div>
  </footer>
</div>
</body>
</html>`;
}

// ─── Individual HTML generators ──────────────────────────────────────────────

export function generateErrorCodesHTML(): string {
  return htmlShell('Error Code Reference', 'CMPSBL® Sealed Runtime™ Diagnostic Codes', `
  <h2>Runtime Initialization Errors</h2>
  <table>
    <thead><tr><th>Code</th><th>Message</th><th>Cause</th><th>Fix</th></tr></thead>
    <tbody>
      <tr><td><code>CMPSBL_E001</code></td><td>Runtime initialization failed</td><td>Node.js version too old</td><td>Upgrade to Node.js 18+</td></tr>
      <tr><td><code>CMPSBL_E002</code></td><td>Manifest not found</td><td><code>manifest.json</code> missing</td><td>Re-download the export</td></tr>
      <tr><td><code>CMPSBL_E003</code></td><td>Manifest parse error</td><td>Corrupted manifest</td><td>Re-download; check for partial unzip</td></tr>
      <tr><td><code>CMPSBL_E004</code></td><td>Runtime version mismatch</td><td>Export from newer runtime</td><td>Re-export from CMPSBL</td></tr>
    </tbody>
  </table>

  <h2>Execution Errors</h2>
  <table>
    <thead><tr><th>Code</th><th>Message</th><th>Cause</th><th>Fix</th></tr></thead>
    <tbody>
      <tr><td><code>CMPSBL_E010</code></td><td>Pipeline creation failed</td><td>Runtime not initialized</td><td>Call <code>init()</code> first</td></tr>
      <tr><td><code>CMPSBL_E011</code></td><td>Execution timeout</td><td>Pipeline too long</td><td>Reduce input size or increase timeout</td></tr>
      <tr><td><code>CMPSBL_E012</code></td><td>Primitive chain broken</td><td>Required primitive unavailable</td><td>Run <code>npx cmpsbl-verify ./</code></td></tr>
      <tr><td><code>CMPSBL_E013</code></td><td>Invalid input format</td><td>Schema mismatch</td><td>Check manifest for input requirements</td></tr>
    </tbody>
  </table>

  <h2>Network Errors</h2>
  <table>
    <thead><tr><th>Code</th><th>Message</th><th>Cause</th><th>Fix</th></tr></thead>
    <tbody>
      <tr><td><code>CMPSBL_E020</code></td><td>Network timeout</td><td>Endpoint unreachable</td><td>Use <code>init({ offline: true })</code></td></tr>
      <tr><td><code>CMPSBL_E021</code></td><td>Authentication failed</td><td>Invalid/expired API key</td><td>Regenerate at cmpsbl.com/developers</td></tr>
      <tr><td><code>CMPSBL_E022</code></td><td>Rate limited</td><td>Too many requests</td><td>Wait and retry; or use offline mode</td></tr>
      <tr><td><code>CMPSBL_E023</code></td><td>Endpoint not found</td><td>Custom endpoint misconfigured</td><td>Verify <code>CMPSBL_ENDPOINT</code> URL</td></tr>
    </tbody>
  </table>

  <h2>Bridge Errors (Non-TypeScript)</h2>
  <table>
    <thead><tr><th>Code</th><th>Message</th><th>Cause</th><th>Fix</th></tr></thead>
    <tbody>
      <tr><td><code>CMPSBL_E030</code></td><td>Bridge connection refused</td><td>Service not running</td><td>Start: <code>npx tsx _runtime/standalone-runtime.ts --serve</code></td></tr>
      <tr><td><code>CMPSBL_E031</code></td><td>Bridge timeout</td><td>Service too slow</td><td>Check Node.js process health</td></tr>
      <tr><td><code>CMPSBL_E032</code></td><td>Subprocess failed</td><td><code>npx tsx</code> not found</td><td>Install: <code>npm install -g tsx</code></td></tr>
    </tbody>
  </table>

  <h2>Integrity Errors</h2>
  <table>
    <thead><tr><th>Code</th><th>Message</th><th>Cause</th><th>Fix</th></tr></thead>
    <tbody>
      <tr><td><code>CMPSBL_E040</code></td><td>Integrity check failed</td><td>Files modified after export</td><td>Re-download original export</td></tr>
      <tr><td><code>CMPSBL_E041</code></td><td>Fingerprint mismatch</td><td>Manifest fingerprint wrong</td><td>Do not edit <code>_runtime/</code> files</td></tr>
      <tr><td><code>CMPSBL_E042</code></td><td>Sealed component tampered</td><td>Black-box was altered</td><td>Re-download; sealed files cannot be edited</td></tr>
    </tbody>
  </table>
  `);
}

export function generateArchitectureHTML(name: string, kind: string): string {
  const isAscension = kind === 'ascension';
  return htmlShell('Architecture', `How ${esc(name)} integrates with your application`, `
  <h2>What's Transparent vs. Sealed</h2>
  <table>
    <thead><tr><th>Layer</th><th>What You See</th></tr></thead>
    <tbody>
      <tr><td><strong>✅ Transparent</strong></td><td>Input, Output, API (<code>init()</code>, <code>createPipeline()</code>, <code>execute()</code>), Config, Deterministic audit trail</td></tr>
      <tr><td><strong>⬛ Sealed</strong></td><td>CJPI weight allocations, Tier thresholds, Synergy multipliers, Discovery heuristics, 40-primitive deep effects</td></tr>
    </tbody>
  </table>

  ${isAscension ? `
  <h2>Dual-Layer Execution Model</h2>
  <pre>
┌─────────────────────────────────────────────────────────────┐
│                      YOUR APPLICATION                       │
│                                                             │
│   ┌─────────────────┐    ┌────────────────────────────┐    │
│   │  Layer 1         │    │  Layer 2                    │    │
│   │  YOUR CODE       │    │  COGNITIVE OVERLAY          │    │
│   │  (untouched)     │───→│  (discovered primitives)    │    │
│   └─────────────────┘    └────────────────────────────┘    │
│            │                          │                      │
│            └──────────┬───────────────┘                      │
│                       ▼                                      │
│            ┌─────────────────────┐                           │
│            │  SEALED RUNTIME™    │                           │
│            │  40 Primitives      │  ← Sealed (black-boxed)  │
│            │  CJPI Engine        │  ← Deterministic scoring │
│            │  Chain Executor     │  ← IP-protected          │
│            └─────────────────────┘                           │
│                       ▼                                      │
│            ┌─────────────────────┐                           │
│            │  OUTPUT             │                           │
│            │  Your result + CJPI │  ← Fully transparent     │
│            └─────────────────────┘                           │
└─────────────────────────────────────────────────────────────┘</pre>` : `
  <h2>Execution Flow</h2>
  <pre>
┌──────────────────────────────────────────────────────────┐
│                    YOUR APPLICATION                       │
│   Your Code ──→ CMPSBL Runtime ──→ Primitive Chain       │
│                                    P1 → P2 → P3 → ...   │
│                                          ▼               │
│                                    OUTPUT                │
│                                    result + CJPI + tier   │
└──────────────────────────────────────────────────────────┘</pre>`}

  <h2>Network Modes</h2>
  <table>
    <thead><tr><th>Mode</th><th>Network Calls</th><th>Latency</th><th>Best For</th></tr></thead>
    <tbody>
      <tr><td><strong>Offline</strong></td><td>0</td><td>&lt;2ms</td><td>Air-gapped, CI/CD, local dev</td></tr>
      <tr><td><strong>Hybrid</strong> (default)</td><td>0–1</td><td>2–50ms</td><td>Most production use cases</td></tr>
      <tr><td><strong>Network</strong></td><td>1 per execute</td><td>50–200ms</td><td>Full deep effects</td></tr>
    </tbody>
  </table>
  `);
}

export function generateBundleInfoHTML(name: string): string {
  return htmlShell('Bundle Size & Performance', `Technical specifications for ${esc(name)}`, `
  <h2>Size Estimates</h2>
  <table>
    <thead><tr><th>Component</th><th>Raw Size</th><th>Minified + Gzipped</th></tr></thead>
    <tbody>
      <tr><td><code>standalone-runtime.ts</code></td><td>~35 KB</td><td>~8 KB</td></tr>
      <tr><td><code>chain-executor.ts</code></td><td>~25 KB</td><td>~6 KB</td></tr>
      <tr><td><code>discovery-engine.ts</code></td><td>~15 KB</td><td>~4 KB</td></tr>
      <tr><td>Your capability code</td><td>Varies</td><td>Varies</td></tr>
      <tr><td><strong>Total overhead</strong></td><td><strong>~75 KB</strong></td><td><strong>~18 KB</strong></td></tr>
    </tbody>
  </table>

  <h2>Performance Characteristics</h2>
  <table>
    <thead><tr><th>Metric</th><th>Offline</th><th>Hybrid</th><th>Network</th></tr></thead>
    <tbody>
      <tr><td>First init</td><td>&lt;5ms</td><td>&lt;5ms</td><td>~50ms</td></tr>
      <tr><td>Pipeline execute</td><td>&lt;2ms</td><td>2–50ms</td><td>50–200ms</td></tr>
      <tr><td>Memory footprint</td><td>~2 MB</td><td>~2 MB</td><td>~3 MB</td></tr>
    </tbody>
  </table>

  <h2>Build Tool Compatibility</h2>
  <table>
    <thead><tr><th>Tool</th><th>Status</th><th>Notes</th></tr></thead>
    <tbody>
      <tr><td>Vite</td><td>✅</td><td>Works out of the box</td></tr>
      <tr><td>Webpack 5</td><td>✅</td><td>No special config</td></tr>
      <tr><td>esbuild</td><td>✅</td><td>Set <code>format: 'esm'</code></td></tr>
      <tr><td>Rollup</td><td>✅</td><td>No special config</td></tr>
      <tr><td>tsc</td><td>✅</td><td>Use <code>moduleResolution: 'bundler'</code></td></tr>
      <tr><td>Bun</td><td>✅</td><td>Native support</td></tr>
    </tbody>
  </table>
  `);
}

export function generateMonitoringHTML(name: string, slug: string): string {
  return htmlShell('Production Monitoring', `Monitoring guide for ${esc(name)}`, `
  <h2>Health Check Endpoint</h2>
  <pre>app.get('/health/cmpsbl', async (req, res) =&gt; {
  const start = Date.now();
  try {
    const { init, createPipeline } = await import('./_runtime/standalone-runtime');
    const instance = init({ offline: true });
    const pipeline = createPipeline(instance);
    const result = await pipeline.execute({ healthcheck: true });
    res.json({
      status: 'healthy',
      capability: '${esc(slug)}',
      latencyMs: Date.now() - start,
      cjpiScore: result.cjpiScore,
    });
  } catch (err) {
    res.status(503).json({ status: 'unhealthy', error: err.message });
  }
});</pre>

  <h2>What to Monitor</h2>
  <table>
    <thead><tr><th>Metric</th><th>Healthy Range</th><th>Alert If</th></tr></thead>
    <tbody>
      <tr><td><code>latencyMs</code></td><td>&lt;10ms (offline), &lt;200ms (hybrid)</td><td>&gt;500ms</td></tr>
      <tr><td><code>primitivesActive</code></td><td>Matches manifest chain</td><td>Drops to 0</td></tr>
      <tr><td><code>cjpiScore</code></td><td>Consistent across runs</td><td>Changes unexpectedly</td></tr>
      <tr><td>HTTP status</td><td>200</td><td>503</td></tr>
    </tbody>
  </table>

  <h2>Score Drift Detection</h2>
  <div class="warning-box">
    <strong>CJPI scores are deterministic.</strong> If scores change between runs with the same input,
    something in your environment has changed. Use the code below to detect drift.
  </div>
  <pre>const EXPECTED_SCORE = /* from your manifest */;
const TOLERANCE = 0.001;
const result = await pipeline.execute(referenceInput);
if (Math.abs(result.cjpiScore - EXPECTED_SCORE) &gt; TOLERANCE) {
  logger.error('CJPI score drift detected', {
    expected: EXPECTED_SCORE,
    actual: result.cjpiScore,
  });
}</pre>
  `);
}

export function generateLicenseFaqHTML(): string {
  return htmlShell('License FAQ', 'Frequently asked questions about CMPSBL® export licensing', `
  <h2>Can I use this in my commercial product?</h2>
  <p><strong>Yes.</strong> Your export is licensed for use in your products, both commercial and internal.</p>

  <h2>Can I include this in an open-source project?</h2>
  <p><strong>Yes, with conditions:</strong></p>
  <ul>
    <li>The <code>_runtime/</code> directory (Sealed Runtime™) remains sealed and unmodified</li>
    <li>You may NOT redistribute the Sealed Runtime as a standalone component</li>
    <li>You may include it as part of your larger application</li>
    <li>Credit CMPSBL® in your project's acknowledgments</li>
  </ul>

  <h2>Can I modify the sealed runtime files?</h2>
  <p><strong>No.</strong> Files in <code>_runtime/</code> are sealed artifacts. Modifying them will break integrity checks, produce incorrect scores, and void support guarantees.</p>
  <div class="info-box">
    <strong>You CAN modify:</strong> Your own source code (always), test files, and configuration (<code>.env</code>, <code>package.json</code>).
  </div>

  <h2>What happens if my subscription expires?</h2>
  <ul>
    <li><strong>Offline mode</strong> continues to work forever — exports are self-contained</li>
    <li><strong>Network/hybrid mode</strong> may lose access to deep effects</li>
    <li><strong>Re-export</strong> will require an active subscription</li>
  </ul>

  <h2>Who owns the outputs?</h2>
  <p><strong>You do.</strong> Any data, results, scores, or artifacts produced by running your export are your property.</p>
  `);
}

export function generateRemovalHTML(name: string, slug: string, kind: string): string {
  return htmlShell('Removal Guide', `How to cleanly remove ${esc(name)} — zero vendor lock-in`, `
  <div class="highlight-box">
    <strong>No vendor lock-in.</strong> Your original code is untouched. This guide shows how to cleanly remove all CMPSBL components.
  </div>

  <h2>Step 1: Find Integration Points</h2>
  <pre>grep -r "cmpsbl\\|@cmpsbl\\|standalone-runtime\\|createPipeline" ./src/ --include="*.ts" --include="*.tsx" --include="*.js"</pre>

  <h2>Step 2: Remove Imports</h2>
  <pre>// BEFORE (with CMPSBL)
import { init, createPipeline } from '@cmpsbl/${esc(slug)}';
const result = await pipeline.execute(data);

// AFTER (without CMPSBL)
const result = yourOriginalFunction(data);</pre>

  <h2>Step 3: Remove Files</h2>
  <pre>rm -rf ./src/lib/cmpsbl/${esc(slug)}/</pre>

  <h2>Step 4: Remove Environment Variables</h2>
  <pre># Remove from .env:
# CMPSBL_API_KEY=...
# CMPSBL_OFFLINE=...
# CMPSBL_ENDPOINT=...</pre>

  <h2>Step 5: Remove NPM Packages</h2>
  <pre>npm uninstall @cmpsbl/sdk @cmpsbl/test-harness @cmpsbl/cli</pre>

  <h2>Step 6: Verify Clean Removal</h2>
  <pre>grep -r "cmpsbl" ./src/ --include="*.ts" --include="*.tsx" --include="*.js"
npm run build  # Should succeed</pre>

  ${kind === 'ascension' ? `
  <h2>What You Keep</h2>
  <ul>
    <li><strong>Your original source code</strong> — Layer 1 was always your untouched code</li>
    <li>The cognitive overlay (Layer 2) was additive, never destructive</li>
    <li>Any insights the Ascension produced remain yours</li>
  </ul>` : `
  <h2>What You Keep</h2>
  <ul>
    <li>All your application code — CMPSBL was a drop-in augmentation</li>
    <li>Any outputs the export produced remain yours</li>
  </ul>`}
  `);
}

export function generateChangelogHTML(name: string, version: string, kind: string, score?: number, tier?: string, languages?: string[]): string {
  const date = new Date().toISOString().split('T')[0];
  return htmlShell('Changelog', `Version history for ${esc(name)}`, `
  <h2>[${esc(version)}] — ${date}</h2>

  <h3>Export Summary</h3>
  <table>
    <tbody>
      <tr><td><strong>Type</strong></td><td>${esc(kind)}</td></tr>
      <tr><td><strong>CJPI Score</strong></td><td>${score ?? 'N/A'}</td></tr>
      <tr><td><strong>Tier</strong></td><td>${esc(tier ?? 'N/A')}</td></tr>
      <tr><td><strong>Languages</strong></td><td>${esc(languages?.join(', ') || 'TypeScript')}</td></tr>
    </tbody>
  </table>

  <h3>What's Included</h3>
  <ul>
    <li>Sealed Runtime™ v1.x.x (standalone, offline-capable)</li>
    <li>Full primitive chain executor</li>
    <li>Integration guide with framework examples</li>
    <li>Pre-built test suite</li>
    <li>Quickstart script (<code>npx tsx quickstart.ts</code>)</li>
  </ul>
  `);
}

export function generateDiscoveryContextHTML(name: string, score?: number, tier?: string): string {
  return htmlShell('Discovery Context', `How ${esc(name)} was discovered`, `
  <h2>Origin: Memory Stream</h2>
  <p>This capability was surfaced by the <strong>Memory Stream</strong> — CMPSBL's autonomous 8-hour discovery cycle
  that identifies emergent patterns in the substrate's 40-primitive topology.</p>

  <h3>Capability Profile</h3>
  <table>
    <tbody>
      <tr><td><strong>CJPI Score</strong></td><td>${score ?? 'See manifest.json'}</td></tr>
      <tr><td><strong>Tier</strong></td><td>${esc(tier ?? 'See manifest.json')}</td></tr>
    </tbody>
  </table>

  <h2>Discovery vs. Engineered</h2>
  <table>
    <thead><tr><th>Aspect</th><th>Discovered (this)</th><th>Engineered</th></tr></thead>
    <tbody>
      <tr><td>Origin</td><td>Autonomous Memory Stream</td><td>Manually designed</td></tr>
      <tr><td>Validation</td><td>CJPI-scored, auto-classified</td><td>Human-reviewed</td></tr>
      <tr><td>Evolution</td><td>May improve in future cycles</td><td>Static</td></tr>
    </tbody>
  </table>

  <h2>Verifying the Discovery</h2>
  <pre>npx cmpsbl-verify ./
npx tsx quickstart.ts
git clone https://github.com/SweetKenneth/cmpsbl-daily-drop.git
npx cmpsbl-verify ./ --compare ./cmpsbl-daily-drop/drops/latest/</pre>
  `);
}

export function generateTierMigrationHTML(): string {
  return htmlShell('Tier Migration Guide', 'What happens when you upgrade or downgrade', `
  <h2>Upgrade Effects</h2>
  <table>
    <thead><tr><th>From → To</th><th>Effect</th><th>Action Needed</th></tr></thead>
    <tbody>
      <tr><td>Builder → Creator</td><td>No change to existing</td><td>Re-export for Creator features</td></tr>
      <tr><td>Creator → Architect</td><td>No change to existing</td><td>Re-export for Architect features</td></tr>
      <tr><td>Any downgrade</td><td>Existing exports keep working (offline)</td><td>Network mode may lose deep effects</td></tr>
    </tbody>
  </table>

  <h2>What Doesn't Change</h2>
  <ul>
    <li><strong>Offline mode</strong> always works, regardless of tier</li>
    <li><strong>CJPI scores</strong> are deterministic and don't change</li>
    <li><strong>Your original code</strong> is never modified</li>
    <li><strong>Existing test suites</strong> remain valid</li>
  </ul>

  <h2>What Changes</h2>
  <ul>
    <li><strong>Available languages</strong> may expand with higher tiers</li>
    <li><strong>Primitive chain depth</strong> may increase with Architect</li>
    <li><strong>Network mode</strong> deep effects depend on active subscription</li>
  </ul>
  `);
}

/**
 * Generate all HTML versions of the artifact suite.
 * Returns a Record of filename → HTML content.
 */
export interface HTMLArtifactsInput {
  name: string;
  slug: string;
  kind: string;
  version?: string;
  score?: number;
  tier?: string;
  languages?: string[];
}

export function generateHTMLArtifacts(input: HTMLArtifactsInput): Record<string, string> {
  return {
    'ERROR-CODES.html': generateErrorCodesHTML(),
    'ARCHITECTURE.html': generateArchitectureHTML(input.name, input.kind),
    'BUNDLE-INFO.html': generateBundleInfoHTML(input.name),
    'MONITORING.html': generateMonitoringHTML(input.name, input.slug),
    'LICENSE-FAQ.html': generateLicenseFaqHTML(),
    'REMOVAL.html': generateRemovalHTML(input.name, input.slug, input.kind),
    'CHANGELOG.html': generateChangelogHTML(input.name, input.version || '1.0.0', input.kind, input.score, input.tier, input.languages),
    'DISCOVERY-CONTEXT.html': generateDiscoveryContextHTML(input.name, input.score, input.tier),
    'TIER-MIGRATION.html': generateTierMigrationHTML(),
  };
}
