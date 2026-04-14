/**
 * CMPSBL® Unified User Guide — HTML Generator
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Combines ALL export documentation into a single, enterprise-grade HTML document:
 *   - What You Received (package overview)
 *   - CJPI Score & Valuation
 *   - Capabilities Granted
 *   - Activation Tiers (Enhanced → Protected → Advanced)
 *   - Integration Guide (step-by-step)
 *   - Mana Attachment (optional persistent governance)
 *   - Vulnerability Assessment
 *   - Error Codes & Troubleshooting
 *   - Primitive Manifest
 *   - Testing & Verification
 *   - License Summary
 *
 * © CMPSBL® · PromptFluid™ · All rights reserved.
 */

import type { RestorationReport } from '@/lib/factory/restoration-docs';
import type { PrimitiveRecommendation } from '@/lib/factory/scan-team';

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap');

:root {
  --accent: hsl(210 60% 45%);
  --accent-bg: hsl(210 60% 45% / 0.06);
  --accent-border: hsl(210 60% 45% / 0.2);
  --primary: hsl(210 60% 45%);
  --primary-bg: hsl(210 60% 45% / 0.06);
  --primary-border: hsl(210 60% 45% / 0.15);
  --neon-cyan: hsl(185 100% 40%);
  --neon-purple: hsl(280 100% 55%);
  --bg: hsl(0 0% 100%);
  --surface: hsl(220 10% 97%);
  --surface-warm: hsl(220 10% 94%);
  --border: hsl(220 10% 88%);
  --border-subtle: hsl(220 10% 92%);
  --text: hsl(220 15% 15%);
  --text-secondary: hsl(220 10% 35%);
  --text-muted: hsl(220 10% 50%);
  --text-dim: hsl(220 10% 65%);
  --success: hsl(145 65% 42%);
  --warning: hsl(38 92% 50%);
  --error: hsl(0 70% 50%);
}

*, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
html { font-size: 16px; -webkit-text-size-adjust: 100%; scroll-behavior: smooth; }
body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
  background: var(--bg);
  color: var(--text);
  line-height: 1.7;
  padding: 2rem;
  max-width: 900px;
  margin: 0 auto;
  -webkit-font-smoothing: antialiased;
}
@media (max-width: 640px) { body { padding: 1rem; } }

/* Header */
.doc-header {
  text-align: center; padding: 2.5rem 1.5rem;
  border: 1px solid var(--border); border-radius: 1rem;
  background: linear-gradient(135deg, var(--surface), var(--bg));
  margin-bottom: 2rem; position: relative; overflow: hidden;
}
.doc-header::before {
  content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px;
  background: linear-gradient(90deg, var(--neon-cyan), var(--primary), var(--neon-purple));
}
.doc-issuer {
  font-size: 0.6875rem; letter-spacing: 0.2em; color: var(--text-dim);
  text-transform: uppercase; margin-bottom: 1rem; font-weight: 600;
}
.doc-title { font-size: 1.625rem; font-weight: 800; margin-bottom: 0.375rem; }
.doc-subtitle { font-size: 0.9375rem; color: var(--text-muted); margin-top: 0.5rem; }
.doc-serial {
  font-family: 'JetBrains Mono', monospace; font-size: 0.75rem;
  color: var(--primary); background: var(--primary-bg);
  border: 1px solid var(--primary-border); padding: 0.3rem 0.85rem;
  border-radius: 0.5rem; display: inline-block; margin-top: 0.75rem;
}
.doc-meta { display: flex; justify-content: center; gap: 1.5rem; margin-top: 1rem; flex-wrap: wrap; }
.doc-meta-item { font-size: 0.75rem; color: var(--text-dim); }
.doc-meta-item strong { color: var(--text-muted); font-weight: 600; }

/* TOC */
.toc {
  background: var(--surface); border: 1px solid var(--border); border-radius: 0.75rem;
  padding: 1.5rem 2rem; margin-bottom: 2.5rem;
}
.toc-title { font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: var(--text-dim); margin-bottom: 0.75rem; }
.toc ol { counter-reset: toc; list-style: none; padding: 0; }
.toc li { counter-increment: toc; margin-bottom: 0.35rem; }
.toc a {
  text-decoration: none; color: var(--text-secondary); font-size: 0.875rem; font-weight: 500;
  display: flex; align-items: center; gap: 0.5rem;
  transition: color 0.15s;
}
.toc a:hover { color: var(--primary); }
.toc a::before { content: counter(toc) "."; color: var(--primary); font-weight: 700; font-size: 0.8rem; min-width: 1.5rem; }

/* Trust banner */
.trust-banner {
  display: flex; flex-wrap: wrap; justify-content: center; gap: 1.25rem;
  padding: 1rem 1.25rem; background: var(--surface);
  border: 1px solid var(--border); border-radius: 0.75rem; margin-bottom: 2rem;
}
.trust-item { display: flex; align-items: center; gap: 0.4rem; font-size: 0.75rem; font-weight: 500; color: var(--text-muted); }
.trust-dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }
.trust-dot.green { background: var(--success); }
.trust-dot.blue { background: var(--primary); }
.trust-dot.cyan { background: var(--neon-cyan); }

/* Sections */
h2 {
  font-size: 1.125rem; font-weight: 700; margin: 2.5rem 0 0.75rem;
  padding-bottom: 0.625rem; border-bottom: 2px solid var(--border);
  display: flex; align-items: center; gap: 0.5rem;
}
h3 { font-size: 1rem; font-weight: 600; margin: 1.5rem 0 0.5rem; }
h4 { font-size: 0.875rem; font-weight: 600; margin: 1rem 0 0.375rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; }
p { color: var(--text-secondary); margin-bottom: 0.875rem; font-size: 0.9375rem; line-height: 1.7; }
strong { color: var(--text); font-weight: 600; }
ul, ol { padding-left: 1.5rem; margin: 0.75rem 0 1rem; }
li { margin-bottom: 0.5rem; color: var(--text-secondary); font-size: 0.9375rem; line-height: 1.6; }
li::marker { color: var(--accent); }

/* Code */
code {
  font-family: 'JetBrains Mono', monospace; font-size: 0.8125rem;
  background: var(--primary-bg); color: var(--primary);
  padding: 0.2rem 0.5rem; border-radius: 0.375rem;
  border: 1px solid var(--primary-border);
}
pre {
  background: var(--surface); border: 1px solid var(--border);
  border-radius: 0.75rem; padding: 1.125rem 1.25rem;
  font-size: 0.8125rem; overflow-x: auto;
  font-family: 'JetBrains Mono', monospace; line-height: 1.6;
  margin: 0.75rem 0 1rem;
}
pre code { background: none; padding: 0; border: none; color: var(--text); }

/* Cards */
.card {
  border: 1px solid var(--border); border-radius: 0.75rem;
  padding: 1.125rem 1.25rem; background: var(--surface); margin-bottom: 1rem;
}
.card-header { font-weight: 600; margin-bottom: 0.5rem; }

/* Tables */
table { width: 100%; border-collapse: collapse; font-size: 0.875rem; margin: 0.75rem 0 1rem; }
th { text-align: left; font-weight: 600; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-dim); padding: 0.625rem 0.75rem; border-bottom: 2px solid var(--border); }
td { padding: 0.625rem 0.75rem; border-bottom: 1px solid var(--border-subtle); color: var(--text-secondary); }
tr:hover td { background: var(--surface); }

/* Badges */
.badge { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 0.7rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.02em; }
.badge-enhanced { background: hsl(210 60% 45% / 0.1); color: hsl(210 60% 45%); }
.badge-protected { background: hsl(145 65% 42% / 0.1); color: hsl(145 65% 42%); }
.badge-advanced { background: hsl(280 100% 55% / 0.1); color: hsl(280 100% 55%); }
.badge-critical { background: hsl(0 70% 50% / 0.1); color: hsl(0 70% 50%); }
.badge-warning { background: hsl(38 92% 50% / 0.1); color: hsl(38 92% 50%); }
.badge-info { background: hsl(210 100% 50% / 0.1); color: hsl(210 100% 50%); }
.badge-hardened { background: hsl(145 65% 42% / 0.1); color: hsl(145 65% 42%); }
.badge-mitigated { background: hsl(38 92% 50% / 0.1); color: hsl(38 92% 50%); }
.badge-monitor { background: hsl(210 100% 50% / 0.1); color: hsl(210 100% 50%); }

.dot { width: 8px; height: 8px; border-radius: 50%; background: var(--accent); flex-shrink: 0; }

/* Severity indicator */
.severity-bar { display: flex; gap: 0.5rem; margin: 0.75rem 0; }
.severity-segment { height: 4px; border-radius: 2px; flex: 1; }

/* Tier cards */
.tier-card {
  border: 1px solid var(--border); border-radius: 0.75rem;
  padding: 1.25rem 1.5rem; margin-bottom: 1rem;
  background: var(--surface); position: relative; overflow: hidden;
}
.tier-card::before {
  content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px;
}
.tier-card.enhanced::before { background: var(--primary); }
.tier-card.protected::before { background: var(--success); }
.tier-card.advanced::before { background: var(--neon-purple); }
.tier-name { font-weight: 700; font-size: 1rem; margin-bottom: 0.25rem; }
.tier-desc { font-size: 0.875rem; color: var(--text-secondary); margin-bottom: 0.75rem; }
.tier-caps { font-size: 0.8125rem; color: var(--text-muted); }

/* Footer */
.doc-footer {
  margin-top: 3rem; padding-top: 2rem; border-top: 2px solid var(--border);
  text-align: center; font-size: 0.75rem; color: var(--text-dim); line-height: 1.8;
}
`;

interface UnifiedGuideInput {
  fileName: string;
  detectedLang: string;
  report: RestorationReport;
  selectedPrims: readonly PrimitiveRecommendation[];
  ascendedExt: string;
}

export function generateUnifiedGuideHTML(input: UnifiedGuideInput): string {
  const { fileName, detectedLang, report, selectedPrims, ascendedExt } = input;
  const { cjpiCertificate: cert, primitiveManifest, pipelineDetails, newCapabilities, vulnerabilityAssessment, errorCodes, testingGuide } = report;
  const year = new Date().getFullYear();
  const date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const safeName = esc(fileName || 'Your Code');

  const sections = [
    'What You Received',
    'CJPI Score & Classification',
    'Capabilities Granted',
    'Activation Tiers',
    'Integration Guide',
    'Mana Attachment (Optional)',
    'Pipeline Details',
    'Vulnerability Assessment',
    'Error Codes & Troubleshooting',
    'Primitive Manifest',
    'Testing & Verification',
    'Upgrading & Terminal Commands',
    'License Summary',
    'Support & Resources',
  ];

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${safeName} — CMPSBL® User Guide</title>
<style>${CSS}</style>
</head>
<body>

<!-- ═══ HEADER ═══ -->
<div class="doc-header">
  <div class="doc-issuer">CMPSBL® · Governed Cognitive Infrastructure · PromptFluid™</div>
  <div class="doc-title">Ascended Code — User Guide</div>
  <div class="doc-subtitle">${safeName} · ${esc(detectedLang)} · ${esc(cert.tier)} Tier</div>
  <div class="doc-serial">${esc(cert.fingerprint)}</div>
  <div class="doc-meta">
    <div class="doc-meta-item"><strong>CJPI</strong> ${cert.score}/100</div>
    <div class="doc-meta-item"><strong>Primitives</strong> ${primitiveManifest.length}</div>
    <div class="doc-meta-item"><strong>Exported</strong> ${date}</div>
    <div class="doc-meta-item"><strong>Serial</strong> ${esc(cert.serialNumber)}</div>
  </div>
</div>

<!-- ═══ TRUST BANNER ═══ -->
<div class="trust-banner">
  <div class="trust-item"><div class="trust-dot green"></div> Layer 1 Original Preserved</div>
  <div class="trust-item"><div class="trust-dot blue"></div> Layer 2 Governance Active</div>
  <div class="trust-item"><div class="trust-dot cyan"></div> Enhanced Mode Pre-Activated</div>
</div>

<!-- ═══ TABLE OF CONTENTS ═══ -->
<div class="toc">
  <div class="toc-title">Table of Contents</div>
  <ol>
    ${sections.map((s, i) => `<li><a href="#section-${i + 1}">${esc(s)}</a></li>`).join('\n    ')}
  </ol>
</div>

<!-- ═══ 1. WHAT YOU RECEIVED ═══ -->
<h2 id="section-1"><span class="dot"></span> 1. What You Received</h2>
<p>This export contains your <strong>Ascended Code Package</strong> — a dual-layer architecture where your original code (Layer 1) is preserved byte-identical while CMPSBL® governance (Layer 2) wraps around it to provide cognitive enrichment, observability, and protection.</p>

<table>
  <thead><tr><th>File</th><th>Purpose</th></tr></thead>
  <tbody>
    <tr><td><code>src/original-source.txt</code></td><td>Your original source code — unchanged, byte-identical</td></tr>
    <tr><td><code>src/ascended-source${esc(ascendedExt)}</code></td><td>Layer 2 wrapped version with runtime, governance, and Enhanced mode pre-activated</td></tr>
    <tr><td><code>USER-GUIDE.html</code></td><td>This document — everything you need</td></tr>
    <tr><td><code>LICENSE.html</code></td><td>Commercial distribution license</td></tr>
    <tr><td><code>README.html</code></td><td>Quick-start overview</td></tr>
    <tr><td><code>manifest.json</code></td><td>Machine-readable artifact metadata</td></tr>
    <tr><td><code>PROOF.txt</code></td><td>Cryptographic verification certificate</td></tr>
    <tr><td><code>restoration-report.json</code></td><td>Full technical scan results</td></tr>
  </tbody>
</table>

<div class="card">
  <div class="card-header">Dual-Layer Architecture</div>
  <p><strong>Layer 1 (Your Code)</strong> — Your original source runs first. It is never modified, rewritten, or refactored. SHA-256 provable identity with your uploaded source.</p>
  <p><strong>Layer 2 (CMPSBL® Governance)</strong> — Wraps around Layer 1 to provide circuit breakers, health signals, persistent memory, event propagation, identity resolution, and more. All capabilities are composable and removable.</p>
</div>

<!-- ═══ 2. CJPI SCORE ═══ -->
<h2 id="section-2"><span class="dot"></span> 2. CJPI Score & Classification</h2>
<p>Your code was analyzed by the CMPSBL® 40-Primitive substrate matrix. The <strong>Crown Jewel Performance Index (CJPI)</strong> measures structural sophistication, capability density, and governance readiness.</p>

<div class="card">
  <table>
    <tr><td><strong>CJPI Score</strong></td><td>${cert.score}/100</td></tr>
    <tr><td><strong>Tier</strong></td><td>${esc(cert.tier)}</td></tr>
    <tr><td><strong>Fingerprint</strong></td><td><code>${esc(cert.fingerprint)}</code></td></tr>
    <tr><td><strong>Primitive Chain</strong></td><td>${cert.primitiveChain.map(p => `<code>${esc(p)}</code>`).join(' → ')}</td></tr>
    <tr><td><strong>Discovery Date</strong></td><td>${date}</td></tr>
  </table>
</div>

<h4>Tier Scale</h4>
<table>
  <thead><tr><th>Tier</th><th>CJPI Range</th><th>Classification</th></tr></thead>
  <tbody>
    <tr><td>Raw</td><td>0–67</td><td>Foundational — basic governance attachment</td></tr>
    <tr><td>Mint</td><td>68–79</td><td>Emerging — moderate cognitive density</td></tr>
    <tr><td>Prime</td><td>80–89</td><td>Production-grade — strong substrate alignment</td></tr>
    <tr><td>Relic</td><td>90–93</td><td>Rare — high primitive affinity</td></tr>
    <tr><td>Mythic</td><td>94–99</td><td>Exceptional — near-complete substrate resonance</td></tr>
    <tr><td>Apex</td><td>100</td><td>Perfect — maximum cognitive saturation</td></tr>
  </tbody>
</table>

<!-- ═══ 3. CAPABILITIES ═══ -->
<h2 id="section-3"><span class="dot"></span> 3. Capabilities Granted</h2>
<p>The following capabilities were discovered through collision testing of your code against the substrate matrix. Each represents a behavioral pattern that emerged from the intersection of your proprietary logic and the CMPSBL® cognitive architecture.</p>

${newCapabilities.map(cap => `
<div class="card">
  <div class="card-header">${esc(cap.name)}</div>
  <p>${esc(cap.description)}</p>
  <pre><code>${esc(cap.usageExample)}</code></pre>
</div>`).join('\n')}

<!-- ═══ 4. ACTIVATION TIERS ═══ -->
<h2 id="section-4"><span class="dot"></span> 4. Activation Tiers</h2>
<p>Your ascended code ships with <strong>Enhanced mode pre-activated</strong>. You can upgrade to higher tiers for additional governance capabilities.</p>

<div class="tier-card enhanced">
  <div class="tier-name">🔵 Enhanced <span class="badge badge-enhanced">Pre-Activated</span></div>
  <div class="tier-desc">Observability + Performance — included at no extra cost</div>
  <div class="tier-caps">
    <strong>Includes:</strong> Persistent Memory · State Recovery · Event Bus · Signal Propagation · Behavioral Mapping · Intent Tracing · Message Relay · Delivery Guarantees · Health Monitoring · Circuit Breakers
  </div>
</div>

<div class="tier-card protected">
  <div class="tier-name">🟢 Protected</div>
  <div class="tier-desc">Defense + Governance — production-grade security hardening</div>
  <div class="tier-caps">
    <strong>Adds:</strong> Identity Resolution · Session Binding · Learning Engine · Adaptive Patterns · Anomaly Detection · Threat Scoring · Input Sanitization · Rate Limiting · Governance Checks · Policy Enforcement
  </div>
  <p style="margin-top: 0.75rem; font-size: 0.8125rem;">Activate via: <code>npx mana attach --level protected</code> or at <a href="https://cmpsbl.com/ascension" style="color: var(--primary);">cmpsbl.com/ascension</a></p>
</div>

<div class="tier-card advanced">
  <div class="tier-name">🟣 Advanced</div>
  <div class="tier-desc">Full substrate — maximum cognitive enrichment</div>
  <div class="tier-caps">
    <strong>Adds:</strong> DREAM Synthesis · EVOLUTION Patching · SANDBOX Isolation · APEX Orchestration · Recursive Re-Ingestion · Cross-Layer Telemetry · Federated Governance · Custom Vertical Binding
  </div>
  <p style="margin-top: 0.75rem; font-size: 0.8125rem;">Activate via: <code>npx mana attach --level advanced</code> or at <a href="https://cmpsbl.com/ascension" style="color: var(--primary);">cmpsbl.com/ascension</a></p>
</div>

<!-- ═══ 5. INTEGRATION ═══ -->
<h2 id="section-5"><span class="dot"></span> 5. Integration Guide</h2>

<h3>Step 1 — Drop the Ascended File Into Your Project</h3>
<p>Copy <code>src/ascended-source${esc(ascendedExt)}</code> into your project directory. This file contains your original source code (Layer 1) plus the CMPSBL® governance matrix (Layer 2) — all in one file.</p>

<h3>Step 2 — Use It as a Drop-In Replacement</h3>
<p>The ascended file preserves your original code's interface exactly. Import or require the ascended version instead of your original file — everything works the same, with cognitive enrichment running silently on top.</p>

${detectedLang === 'python' ? `
<pre><code># Python — drop-in replacement
# Before:  from my_module import my_function
# After:   from ascended_source import my_function
#
# Your functions work identically — Layer 2 adds governance
# (circuit breakers, health signals, telemetry) around them.
from ascended_source import *

# All your original exports are available unchanged
result = my_function(your_input)
</code></pre>` : detectedLang === 'php' ? `
<pre><code>// PHP — drop-in replacement
// Before:  require_once 'my_module.php';
// After:   require_once 'ascended-source.php';
//
// Your functions/classes work identically — Layer 2 adds
// governance (circuit breakers, health signals, telemetry) around them.
require_once __DIR__ . '/ascended-source.php';

// All your original exports are available unchanged
$result = my_function($your_input);
</code></pre>` : `
<pre><code>// TypeScript / JavaScript — drop-in replacement
// Before:  import { myFunction } from './my-module';
// After:   import { myFunction } from './ascended-source';
//
// Your functions work identically — Layer 2 adds governance
// (circuit breakers, health signals, telemetry) around them.
import { myFunction } from './ascended-source';

// All your original exports are available unchanged
const result = myFunction(yourInput);
</code></pre>`}

<div class="card">
  <div class="card-header">What the Ascended File Contains</div>
  <p><strong>Top of file:</strong> Layer 2 governance matrix — runtime imports, primitive guards, compiled dispatch tables, and Mana attachment manifest. These wrap around your functions silently.</p>
  <p><strong>Bottom of file:</strong> Your original source code — byte-identical, unmodified. Clearly marked with <code>ORIGINAL SOURCE (UNMODIFIED — LAYER 1)</code> comments.</p>
  <p><strong>Result:</strong> Your code runs first. Layer 2 observes, enriches, and protects without changing behavior.</p>
</div>

<h3>Step 3 — Verify the Artifact</h3>
<pre><code># Online verification
https://cmpsbl.com/verify/${esc(cert.fingerprint)}

# CLI verification
cmpsbl verify ${esc(cert.fingerprint)}</code></pre>

<h3>Step 4 — Framework Integration</h3>
<p>The ascended file works as a <strong>drop-in replacement</strong>. Your original code runs first (Layer 1), then CMPSBL® governance wraps around it (Layer 2). No framework changes, no migrations, no rebuilds.</p>

<div class="card">
  <p><strong>Express/Node:</strong> Replace your middleware require with the ascended version</p>
  <p><strong>Django/Flask:</strong> Import from the ascended module instead of your original</p>
  <p><strong>Any framework:</strong> The ascended file exports the same interface as your original code</p>
</div>

<!-- ═══ 6. MANA ═══ -->
<h2 id="section-6"><span class="dot"></span> 6. Mana Attachment (Optional)</h2>
<p><strong>Mana</strong> is the persistent governance layer. While the ascended file works standalone, Mana provides continuous protection, automatic updates, and cross-project telemetry.</p>

<h3>Quick Attach</h3>
<pre><code># Install and attach (no global install needed)
npx mana attach

# The CLI will:
# 1. Detect your project structure
# 2. Authenticate your identity
# 3. Ask your preferred capability level (Enhanced / Protected / Advanced)
# 4. Generate a mana.config.json
# 5. Export a branded signal file for your language</code></pre>

<h3>Change Capability Level</h3>
<pre><code># View current level
mana status

# Upgrade to Protected
mana config --level protected

# Upgrade to Advanced
mana config --level advanced

# Downgrade back to Enhanced
mana config --level enhanced</code></pre>

<h3>Terminal Commands</h3>
<table>
  <thead><tr><th>Command</th><th>Description</th></tr></thead>
  <tbody>
    <tr><td><code>mana attach</code></td><td>Detect project, authenticate, activate Layer 2</td></tr>
    <tr><td><code>mana status</code></td><td>Show current layer status and active capabilities</td></tr>
    <tr><td><code>mana config</code></td><td>View or change your activation level</td></tr>
    <tr><td><code>mana export</code></td><td>Re-export the signal file</td></tr>
    <tr><td><code>mana detach</code></td><td>Remove the secondary layer (code untouched)</td></tr>
  </tbody>
</table>

<!-- ═══ 7. PIPELINE ═══ -->
<h2 id="section-7"><span class="dot"></span> 7. Pipeline Details</h2>
<p>Your code was processed through ${pipelineDetails.length} primitive stages. Each primitive contributed a specific hardening or enrichment operation.</p>

<table>
  <thead><tr><th>#</th><th>Primitive</th><th>Action</th><th>Duration</th></tr></thead>
  <tbody>
    ${pipelineDetails.map(p => `<tr><td>${p.order}</td><td><code>${esc(p.primitiveName)}</code></td><td>${esc(p.action)}</td><td>${p.durationMs}ms</td></tr>`).join('\n    ')}
  </tbody>
</table>

<!-- ═══ 8. VULNERABILITIES ═══ -->
<h2 id="section-8"><span class="dot"></span> 8. Vulnerability Assessment</h2>
<p>The substrate scanned your code for structural vulnerabilities and applied hardening where applicable.</p>

${vulnerabilityAssessment.length === 0 ? '<div class="card"><p>No vulnerabilities detected. Your code passed all structural integrity checks.</p></div>' :
vulnerabilityAssessment.map(v => `
<div class="card">
  <div class="card-header">
    <span class="badge badge-${v.severity}">${esc(v.severity)}</span>
    ${esc(v.title)}
    <span class="badge badge-${v.status}" style="margin-left: 0.5rem;">${esc(v.status)}</span>
  </div>
  <p>${esc(v.details)}</p>
</div>`).join('\n')}

<!-- ═══ 9. ERROR CODES ═══ -->
<h2 id="section-9"><span class="dot"></span> 9. Error Codes & Troubleshooting</h2>
<p>These error codes may appear in the <code>_cmpsbl</code> overlay of your execution results.</p>

<table>
  <thead><tr><th>Code</th><th>Trigger</th><th>Resolution</th></tr></thead>
  <tbody>
    ${errorCodes.map(e => `<tr><td><code>${esc(e.code)}</code></td><td>${esc(e.trigger)}</td><td>${esc(e.resolution)}</td></tr>`).join('\n    ')}
  </tbody>
</table>

<h3>Common Issues</h3>
<div class="card">
  <p><strong>"Module not found"</strong> — Ensure the ascended file is in the same directory as your project entry point.</p>
  <p><strong>"Fingerprint mismatch"</strong> — The file has been modified. Re-download from your CMPSBL® account or re-run Ascension.</p>
  <p><strong>"Circuit breaker tripped"</strong> — Automatic recovery via FAILSAFE. No action needed — the system self-heals.</p>
  <p><strong>"Governance check failed"</strong> — The operation exceeds your current activation tier. Upgrade via <code>mana config --level protected</code>.</p>
</div>

<!-- ═══ 10. PRIMITIVE MANIFEST ═══ -->
<h2 id="section-10"><span class="dot"></span> 10. Primitive Manifest</h2>
<p>These ${primitiveManifest.length} primitives were activated during Ascension. Each contributes a specific capability to the Layer 2 governance matrix.</p>

<table>
  <thead><tr><th>Primitive</th><th>Category</th><th>Contribution</th></tr></thead>
  <tbody>
    ${primitiveManifest.map(p => `<tr><td><code>${esc(p.name)}</code></td><td>${esc(p.category)}</td><td>${esc(p.contribution)}</td></tr>`).join('\n    ')}
  </tbody>
</table>

<!-- ═══ 11. TESTING ═══ -->
<h2 id="section-11"><span class="dot"></span> 11. Testing & Verification</h2>

<h3>Automated Testing</h3>
<pre><code>${esc(testingGuide.installCommand)}
${esc(testingGuide.testCommand)}</code></pre>

<h3>Step-by-Step</h3>
<ol>
  ${testingGuide.steps.map(s => `<li>${esc(s)}</li>`).join('\n  ')}
</ol>

<h3>Online Verification</h3>
<p>Visit <a href="https://cmpsbl.com/verify/${esc(cert.fingerprint)}" style="color: var(--primary);">cmpsbl.com/verify/${esc(cert.fingerprint)}</a> to verify this artifact's authenticity and provenance.</p>

<!-- ═══ 12. TERMINAL ═══ -->
<h2 id="section-12"><span class="dot"></span> 12. Upgrading & Terminal Commands</h2>

<h3>CLI Commands</h3>
<pre><code># Ascend a new file
cmpsbl ascend my-file.py

# Export full artifact package
cmpsbl ascend my-file.py --export

# Verify any fingerprint
cmpsbl verify ${esc(cert.fingerprint)}

# Check ascension status
cmpsbl ascension status</code></pre>

<h3>Re-Exporting</h3>
<p>To re-export with updated capabilities, visit <a href="https://cmpsbl.com/ascension" style="color: var(--primary);">cmpsbl.com/ascension</a> or run <code>cmpsbl ascend --export</code> from the CLI. Each export generates fresh artifacts with the latest engine logic.</p>

<h3>Changing Activation Level After Export</h3>
<pre><code># Your ascended file ships with Enhanced mode.
# To change the pre-loaded capability set:

# Option 1: Via Mana (recommended)
npx mana attach --level protected

# Option 2: Via the Ascension Lab on the website
# Visit cmpsbl.com/ascension → re-ascend with different tier

# Option 3: Via CLI
cmpsbl config set activation-level protected</code></pre>

<!-- ═══ 13. LICENSE ═══ -->
<h2 id="section-13"><span class="dot"></span> 13. License Summary</h2>
<div class="card">
  <p><strong>Grant:</strong> Non-exclusive, worldwide right to use, modify, and integrate this software into derivative works. You may commercially distribute derivative works.</p>
  <p><strong>Attribution:</strong> All distributions must include: "Built with the CMPSBL® Substrate — https://cmpsbl.com"</p>
  <p><strong>Runtime:</strong> The CMPSBL® runtime embedded in the ascended file may not be extracted, reverse-engineered, or redistributed independently.</p>
  <p><strong>Preservation:</strong> The LICENSE file must be included in all distributions.</p>
  <p style="font-size: 0.8125rem; color: var(--text-dim);">See <code>LICENSE.html</code> for the full legal text.</p>
</div>

<!-- ═══ 14. SUPPORT ═══ -->
<h2 id="section-14"><span class="dot"></span> 14. Support & Resources</h2>
<table>
  <tbody>
    <tr><td><strong>Website</strong></td><td><a href="https://cmpsbl.com" style="color: var(--primary);">cmpsbl.com</a></td></tr>
    <tr><td><strong>Ascension Lab</strong></td><td><a href="https://cmpsbl.com/ascension" style="color: var(--primary);">cmpsbl.com/ascension</a></td></tr>
    <tr><td><strong>Verify Artifact</strong></td><td><a href="https://cmpsbl.com/verify/${esc(cert.fingerprint)}" style="color: var(--primary);">cmpsbl.com/verify/${esc(cert.fingerprint)}</a></td></tr>
    <tr><td><strong>Documentation</strong></td><td><a href="https://cmpsbl.com/docs/system" style="color: var(--primary);">cmpsbl.com/docs/system</a></td></tr>
    <tr><td><strong>DECODE Terminal</strong></td><td><a href="https://cmpsbl.com/decode" style="color: var(--primary);">cmpsbl.com/decode</a></td></tr>
    <tr><td><strong>Support</strong></td><td><a href="mailto:support@cmpsbl.com" style="color: var(--primary);">support@cmpsbl.com</a></td></tr>
    <tr><td><strong>CLI</strong></td><td><code>npm install -g @cmpsbl/cli</code></td></tr>
    <tr><td><strong>Mana</strong></td><td><code>npx mana attach</code></td></tr>
  </tbody>
</table>

<!-- ═══ FOOTER ═══ -->
<div class="doc-footer">
  <p>Inventor: Kenneth E. Sweet Jr.</p>
  <p>U.S. Patent App. No. 64/029,678 · No. 64/031,637</p>
  <p>© ${year} CMPSBL® · PromptFluid™ · All rights reserved.</p>
  <p style="margin-top: 0.5rem;">Governed Cognitive Infrastructure</p>
</div>

</body>
</html>`;
}
