/**
 * Unified USER-GUIDE.html Generator
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Single branded document with TOC consolidating everything the user needs:
 *   § Overview — what happened to their code
 *   § Quick Start — how to use the ascended files
 *   § Capabilities — every discovered capability with scores
 *   § Attachment Plan — which functions got which capabilities
 *   § Terminal Commands — how to inspect/deactivate
 *   § Verification — provenance certificate (inline)
 *   § Architecture — dual-layer explanation
 *
 * Replaces: ACTIVATION-GUIDE.html, attachment-plan.json, activation-ledger.json,
 *           PIPELINE-DETAILS.html, PROOF.txt (all now sections in this one doc)
 *
 * © CMPSBL® — All rights reserved.
 */

interface UserGuideCapability {
  readonly name: string;
  readonly description: string;
  readonly score: number;
  readonly tier: string;
  readonly nodeA: string;
  readonly nodeB: string;
  readonly fingerprint: string;
}

interface UserGuideAttachment {
  readonly functionName: string;
  readonly capability: string;
  readonly primitive: string;
  readonly reason: string;
}

export interface UserGuideInput {
  readonly candidateName: string;
  readonly runId: string;
  readonly sourceLanguage: string;
  readonly capabilities: ReadonlyArray<UserGuideCapability>;
  readonly attachments: ReadonlyArray<UserGuideAttachment>;
  readonly totalBoundaries: number;
  readonly sourceFileNames: ReadonlyArray<string>;
  readonly avgCjpi: number;
  readonly packFingerprint: string;
}

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

const year = () => new Date().getFullYear();
const dateStr = () => new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
const isoStr = () => new Date().toISOString();

export function generateUserGuideHTML(input: UserGuideInput): string {
  const {
    candidateName, runId, sourceLanguage, capabilities,
    attachments, totalBoundaries, sourceFileNames, avgCjpi, packFingerprint,
  } = input;

  const allPrimitives = [...new Set(capabilities.flatMap(c => [c.nodeA, c.nodeB]))];
  const topCap = capabilities.reduce((a, b) => a.score > b.score ? a : b, capabilities[0]);
  const tierCounts = capabilities.reduce<Record<string, number>>((acc, c) => {
    acc[c.tier] = (acc[c.tier] || 0) + 1;
    return acc;
  }, {});

  // Group attachments by function
  const funcAttachments = new Map<string, UserGuideAttachment[]>();
  for (const a of attachments) {
    const existing = funcAttachments.get(a.functionName) ?? [];
    existing.push(a);
    funcAttachments.set(a.functionName, existing);
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${esc(candidateName)} — User Guide</title>
  <style>${GUIDE_STYLES}</style>
</head>
<body>
<div class="page">

  <header class="doc-header">
    <div class="issuer">CMPSBL® · Ascended Code</div>
    <div class="doc-title">${esc(candidateName)}</div>
    <div class="doc-subtitle">User Guide · ${capabilities.length} Capabilities · ${esc(sourceLanguage.toUpperCase())}</div>
  </header>

  <div class="seal-area">
    <div class="seal-badge">
      <div class="mark">CMPSBL®</div>
      <div class="year">${year()}</div>
    </div>
  </div>

  <!-- TABLE OF CONTENTS -->
  <nav class="toc">
    <div class="toc-title">Contents</div>
    <ol>
      <li><a href="#overview">Overview</a></li>
      <li><a href="#quickstart">Quick Start</a></li>
      <li><a href="#capabilities">Discovered Capabilities</a></li>
      <li><a href="#attachments">Attachment Plan</a></li>
      <li><a href="#terminal">Terminal Commands</a></li>
      <li><a href="#architecture">Architecture</a></li>
      <li><a href="#verification">Verification &amp; Provenance</a></li>
    </ol>
  </nav>

  <div class="ornament">· · ·</div>

  <!-- §1 OVERVIEW -->
  <h2 id="overview"><span class="num">§1</span> Overview</h2>
  <div class="section-card">
    <p>
      Your code has been processed through the <strong>CMPSBL® Ascension Pipeline</strong> — a patented,
      deterministic discovery and wrapping system that identifies structural capabilities in your source
      code and attaches runtime protections without modifying your original files.
    </p>
    <div class="meta-grid">
      <div><div class="meta-item-label">Source Language</div><div class="meta-item-value">${esc(sourceLanguage.toUpperCase())}</div></div>
      <div><div class="meta-item-label">Files Processed</div><div class="meta-item-value">${sourceFileNames.length}</div></div>
      <div><div class="meta-item-label">Functions Detected</div><div class="meta-item-value">${totalBoundaries}</div></div>
      <div><div class="meta-item-label">Capabilities Discovered</div><div class="meta-item-value">${capabilities.length}</div></div>
      <div><div class="meta-item-label">Attachment Points</div><div class="meta-item-value">${attachments.length}</div></div>
      <div><div class="meta-item-label">CJPI Score</div><div class="meta-item-value">${avgCjpi}/100</div></div>
      <div><div class="meta-item-label">Primitives Active</div><div class="meta-item-value">${allPrimitives.length}</div></div>
      <div><div class="meta-item-label">Top Capability</div><div class="meta-item-value">${esc(topCap?.name ?? 'N/A')}</div></div>
    </div>
  </div>

  <div class="highlight">
    <strong>All capabilities are pre-activated.</strong> Your ascended code is ready to use immediately.
    To deactivate or modify capabilities, use the CMPSBL® Terminal commands in §5.
  </div>

  <!-- §2 QUICK START -->
  <h2 id="quickstart"><span class="num">§2</span> Quick Start</h2>
  <div class="section-card">
    <p><strong>Your export contains two folders:</strong></p>
    <ul class="file-list">
      <li>
        <span class="fname">ascended/</span>
        <span>Your code with embedded runtime and all capabilities active. <strong>Use this.</strong></span>
      </li>
      <li>
        <span class="fname">original/</span>
        <span>Your original source files — unchanged, for reference.</span>
      </li>
    </ul>
  </div>

  <div class="code-block">
    <div class="code-label">${esc(sourceLanguage.toUpperCase())} — Drop-in replacement</div>
    <pre>${generateQuickStartCode(sourceLanguage, sourceFileNames)}</pre>
  </div>

  <p style="margin-top: 1rem; font-size: 0.85rem; color: #6b6b78;">
    The ascended files are fully self-contained — no external runtime, no extra imports.
    Just swap your import path and every capability is active.
  </p>

  <!-- §3 CAPABILITIES -->
  <h2 id="capabilities"><span class="num">§3</span> Discovered Capabilities</h2>
  <p>${capabilities.length} capabilities were discovered across ${allPrimitives.length} primitives.</p>

  <div class="tier-summary">
    ${Object.entries(tierCounts).map(([tier, count]) =>
      `<span class="tier-badge tier-${tier.toLowerCase()}">${esc(tier)} × ${count}</span>`
    ).join(' ')}
  </div>

  <table class="cap-table">
    <thead>
      <tr>
        <th>Capability</th>
        <th>Primitives</th>
        <th>Score</th>
        <th>Tier</th>
      </tr>
    </thead>
    <tbody>
      ${capabilities.map(c => `
      <tr>
        <td>
          <strong>${esc(c.name)}</strong>
          <div class="cap-desc">${esc(c.description)}</div>
        </td>
        <td class="mono">${esc(c.nodeA)} × ${esc(c.nodeB)}</td>
        <td class="center">${c.score}</td>
        <td class="center"><span class="tier-badge tier-${c.tier.toLowerCase()}">${esc(c.tier)}</span></td>
      </tr>`).join('')}
    </tbody>
  </table>

  <!-- §4 ATTACHMENT PLAN -->
  <h2 id="attachments"><span class="num">§4</span> Attachment Plan</h2>
  <p>
    ${attachments.length} attachment points were created across ${funcAttachments.size} functions.
    Each attachment wraps a function boundary with one or more Layer 2 capabilities.
  </p>

  ${Array.from(funcAttachments.entries()).map(([funcName, atts]) => `
  <div class="attachment-block">
    <div class="attachment-func">${esc(funcName)}</div>
    <ul class="attachment-caps">
      ${atts.map(a => `
      <li>
        <span class="cap-name">${esc(a.capability)}</span>
        <span class="cap-primitive">${esc(a.primitive)}</span>
        <span class="cap-reason">${esc(a.reason)}</span>
        <span class="cap-status">ACTIVE</span>
      </li>`).join('')}
    </ul>
  </div>`).join('')}

  <!-- §5 TERMINAL COMMANDS -->
  <h2 id="terminal"><span class="num">§5</span> Terminal Commands</h2>
  <div class="section-card">
    <p>Use the CMPSBL® Terminal to inspect and manage capabilities at runtime:</p>

    <div class="code-block">
      <div class="code-label">Inspect all wrapped functions</div>
      <pre>&gt; mana inspect</pre>
    </div>

    <div class="code-block">
      <div class="code-label">Deactivate a specific capability on a function</div>
      <pre>&gt; mana detach ${funcAttachments.size > 0 ? esc(Array.from(funcAttachments.keys())[0]) : 'functionName'} ${attachments.length > 0 ? esc(attachments[0].capability) : 'capability_name'}</pre>
    </div>

    <div class="code-block">
      <div class="code-label">Deactivate all capabilities on a function</div>
      <pre>&gt; mana detach ${funcAttachments.size > 0 ? esc(Array.from(funcAttachments.keys())[0]) : 'functionName'}</pre>
    </div>

    <div class="code-block">
      <div class="code-label">View system status</div>
      <pre>&gt; /status</pre>
    </div>
  </div>

  <!-- §6 ARCHITECTURE -->
  <h2 id="architecture"><span class="num">§6</span> Architecture</h2>
  <div class="section-card">
    <p><strong>Dual-Layer Model</strong></p>
    <p>
      <strong>Layer 1</strong> — Your original code. It executes exactly as written.
      It is never modified, never instrumented, never touched.
    </p>
    <p>
      <strong>Layer 2</strong> — The CMPSBL® Mana runtime. It wraps your functions at their
      boundaries — observing inputs, enriching outputs, and enforcing protections. The runtime
      is embedded directly in each ascended file, so there are no external dependencies.
    </p>
    <div class="arch-diagram">
      <div class="arch-layer layer-2">Layer 2 — Mana Runtime (observe · enrich · protect)</div>
      <div class="arch-arrow">↓ wraps ↓</div>
      <div class="arch-layer layer-1">Layer 1 — Your Code (unchanged · authoritative)</div>
    </div>
    <p style="font-size: 0.82rem; color: #6b6b78; margin-top: 1rem;">
      Protected by U.S. Patent App. Nos. 64/029,678 (Ascension) &amp; 64/031,637 (Mana).
    </p>
  </div>

  <!-- §7 VERIFICATION -->
  <h2 id="verification"><span class="num">§7</span> Verification &amp; Provenance</h2>
  <div class="proof-block">
    <div class="proof-header">CMPSBL® PROVENANCE CERTIFICATE</div>
    <div class="proof-grid">
      <div><span class="proof-label">Serial</span><span class="proof-value">${esc(candidateName)}</span></div>
      <div><span class="proof-label">Fingerprint</span><span class="proof-value mono">${esc(packFingerprint)}</span></div>
      <div><span class="proof-label">CJPI Score</span><span class="proof-value">${avgCjpi}/100</span></div>
      <div><span class="proof-label">Run ID</span><span class="proof-value mono">${esc(runId.slice(0, 12))}</span></div>
      <div><span class="proof-label">Language</span><span class="proof-value">${esc(sourceLanguage.toUpperCase())}</span></div>
      <div><span class="proof-label">Generated</span><span class="proof-value">${dateStr()}</span></div>
      <div><span class="proof-label">ISO Timestamp</span><span class="proof-value mono">${isoStr()}</span></div>
      <div><span class="proof-label">Source</span><span class="proof-value">CMPSBL® Unified Pipeline</span></div>
    </div>
    <div class="proof-primitives">
      <div class="proof-label" style="margin-bottom: 0.5rem;">Primitives Applied (${allPrimitives.length})</div>
      <div class="primitive-tags">
        ${allPrimitives.map(p => `<span class="prim-tag">${esc(p)}</span>`).join('')}
      </div>
    </div>
    <div class="proof-footer">
      This certificate proves that the enclosed software was processed through the CMPSBL® 
      Ascension substrate — a deterministic, patented code-hardening pipeline.
    </div>
  </div>

  <div class="ornament">· · ·</div>

  <div class="colophon">
    <div class="colophon-left">
      Generated ${dateStr()}<br>
      CMPSBL® Unified Ascension + Mana Pipeline<br>
      U.S. Patent App. Nos. 64/029,678 &amp; 64/031,637
    </div>
    <div class="colophon-right">CMPSBL®</div>
  </div>

</div>
</body>
</html>`;
}

// ─── Quick start code snippets per language ─────────────────────

function generateQuickStartCode(lang: string, files: ReadonlyArray<string>): string {
  const sample = files[0] ?? 'module.ts';
  const mod = sample.replace(/\.[^.]+$/, '');

  if (lang === 'python') {
    return esc(`# Before (original):
from original.${mod} import your_function

# After (ascended — capabilities active):
from ascended.${mod} import your_function

# That's it. Same API, now with Layer 2 protection.`);
  }
  if (lang === 'php') {
    return esc(`// Before (original):
require_once 'original/${sample}';

// After (ascended — capabilities active):
require_once 'ascended/${sample}';

// Same functions, now with Layer 2 protection.`);
  }
  // Default: TS/JS
  return esc(`// Before (original):
import { yourFunction } from './original/${mod}';

// After (ascended — capabilities active):
import { yourFunction } from './ascended/${mod}';

// That's it. Same API, now with Layer 2 protection.`);
}

// ─── Styles ─────────────────────────────────────────────────────

const GUIDE_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Inter:wght@300;400;500&family=JetBrains+Mono:wght@400;500&display=swap');
  *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
  @page { size: A4; margin: 2cm 2.5cm; }
  body {
    font-family: 'Inter', -apple-system, sans-serif;
    background: #faf9f6; color: #1a1a1f;
    line-height: 1.75; font-size: 12.5px;
    -webkit-font-smoothing: antialiased;
  }
  .page {
    max-width: 740px; margin: 0 auto; padding: 4rem;
    background: white; min-height: 100vh;
    box-shadow: 0 1px 3px rgba(0,0,0,0.04), 0 20px 60px rgba(0,0,0,0.06);
  }
  @media print { body { background: white; } .page { box-shadow: none; padding: 0; max-width: 100%; } }
  @media (max-width: 680px) { .page { padding: 2rem 1.5rem; } }

  /* Header */
  .doc-header { text-align: center; padding-bottom: 2.5rem; border-bottom: 2px solid #1a1a1f; margin-bottom: 2.5rem; }
  .doc-header .issuer { font-size: 0.6rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.3em; color: #9b9baa; margin-bottom: 1.5rem; }
  .doc-title { font-family: 'Cormorant Garamond', Georgia, serif; font-size: 1.8rem; font-weight: 600; letter-spacing: -0.01em; line-height: 1.25; }
  .doc-subtitle { font-family: 'Cormorant Garamond', Georgia, serif; font-size: 1.05rem; font-style: italic; color: #6b6b78; margin-top: 0.5rem; }

  /* Seal */
  .seal-area { display: flex; justify-content: center; margin: -1rem 0 2rem; }
  .seal-badge { width: 90px; height: 90px; border-radius: 50%; border: 2px solid #c9a84c; background: radial-gradient(circle at 40% 35%, rgba(201,168,76,0.12), rgba(201,168,76,0.03)); display: flex; align-items: center; justify-content: center; flex-direction: column; box-shadow: 0 2px 12px rgba(201,168,76,0.15); }
  .seal-badge .mark { font-family: 'Cormorant Garamond', Georgia, serif; font-size: 0.7rem; font-weight: 700; color: #c9a84c; letter-spacing: 0.15em; }
  .seal-badge .year { font-size: 0.55rem; color: #c9a84c; opacity: 0.7; letter-spacing: 0.1em; }

  /* TOC */
  .toc { background: #faf9f6; border: 1px solid rgba(26,26,31,0.1); border-radius: 6px; padding: 1.5rem 2rem; margin: 1.5rem 0; }
  .toc-title { font-family: 'Cormorant Garamond', Georgia, serif; font-size: 1rem; font-weight: 600; margin-bottom: 0.75rem; color: #1a1a1f; }
  .toc ol { padding-left: 1.25rem; }
  .toc li { margin-bottom: 0.35rem; font-size: 0.88rem; color: #3a3a42; }
  .toc a { color: #3a3a42; text-decoration: none; border-bottom: 1px solid rgba(26,26,31,0.15); }
  .toc a:hover { color: #c9a84c; border-color: #c9a84c; }

  /* Headings */
  h2 { font-family: 'Cormorant Garamond', Georgia, serif; font-size: 1.15rem; font-weight: 600; margin: 2.5rem 0 0.8rem; padding-bottom: 0.4rem; border-bottom: 1px solid rgba(26,26,31,0.1); }
  h2 .num { font-size: 0.7rem; font-weight: 500; text-transform: uppercase; letter-spacing: 0.12em; color: #9b9baa; margin-right: 0.5rem; }
  p { margin-bottom: 0.9rem; color: #3a3a42; }
  .mono { font-family: 'JetBrains Mono', monospace; font-size: 0.82em; }

  /* Cards */
  .section-card { background: #faf9f6; border: 1px solid rgba(26,26,31,0.1); border-radius: 6px; padding: 1.5rem 1.75rem; margin-bottom: 1.25rem; }
  .section-card p:last-child { margin-bottom: 0; }
  .highlight { background: #faf5e8; border-left: 3px solid #c9a84c; padding: 0.9rem 1.25rem; border-radius: 0 4px 4px 0; margin: 1rem 0; font-size: 0.88rem; }
  .highlight strong { color: #1a1a1f; }

  /* Meta grid */
  .meta-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1rem; margin: 1rem 0; }
  .meta-item-label { font-size: 0.6rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.15em; color: #9b9baa; }
  .meta-item-value { font-size: 0.88rem; font-weight: 500; color: #1a1a1f; margin-top: 0.15rem; }

  /* File list */
  .file-list { list-style: none; padding: 0; }
  .file-list li { padding: 0.5rem 0; border-bottom: 1px solid rgba(26,26,31,0.06); font-size: 0.88rem; color: #3a3a42; display: flex; gap: 0.75rem; align-items: baseline; }
  .file-list li:last-child { border-bottom: none; }
  .file-list .fname { font-family: 'JetBrains Mono', monospace; font-size: 0.8rem; font-weight: 500; color: #1a1a1f; min-width: 100px; }

  /* Code blocks */
  .code-block { background: #1a1a1f; border-radius: 6px; padding: 1.25rem 1.5rem; margin: 0.75rem 0; overflow-x: auto; }
  .code-label { font-size: 0.6rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.15em; color: #6b6b78; margin-bottom: 0.5rem; }
  .code-block pre { font-family: 'JetBrains Mono', monospace; font-size: 0.78rem; color: #e0ddd5; line-height: 1.7; white-space: pre-wrap; margin: 0; }

  /* Capability table */
  .cap-table { width: 100%; border-collapse: collapse; margin: 1rem 0; font-size: 0.85rem; }
  .cap-table th { text-align: left; font-size: 0.6rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.12em; color: #9b9baa; padding: 0.5rem 0.75rem; border-bottom: 2px solid rgba(26,26,31,0.1); }
  .cap-table td { padding: 0.6rem 0.75rem; border-bottom: 1px solid rgba(26,26,31,0.06); vertical-align: top; }
  .cap-table .cap-desc { font-size: 0.78rem; color: #6b6b78; margin-top: 0.2rem; }
  .cap-table .center { text-align: center; }

  /* Tier badges */
  .tier-summary { margin: 1rem 0; display: flex; gap: 0.5rem; flex-wrap: wrap; }
  .tier-badge { display: inline-block; padding: 0.15rem 0.6rem; border-radius: 3px; font-size: 0.7rem; font-weight: 600; letter-spacing: 0.05em; }
  .tier-mythic { background: #faf5e8; color: #8b6914; border: 1px solid #c9a84c; }
  .tier-apex { background: #f0e8fa; color: #6b14a8; border: 1px solid #9b59b6; }
  .tier-elite { background: #e8f0fa; color: #1456a8; border: 1px solid #5980b6; }
  .tier-advanced { background: #e8faf0; color: #148b3e; border: 1px solid #59b680; }
  .tier-standard { background: #f5f5f5; color: #555; border: 1px solid #ccc; }
  .tier-foundational { background: #f5f5f5; color: #888; border: 1px solid #ddd; }

  /* Attachment plan */
  .attachment-block { background: #faf9f6; border: 1px solid rgba(26,26,31,0.1); border-radius: 6px; padding: 1rem 1.25rem; margin: 0.75rem 0; }
  .attachment-func { font-family: 'JetBrains Mono', monospace; font-size: 0.85rem; font-weight: 600; color: #1a1a1f; margin-bottom: 0.5rem; }
  .attachment-caps { list-style: none; padding: 0; }
  .attachment-caps li { display: flex; gap: 0.5rem; align-items: center; padding: 0.3rem 0; font-size: 0.8rem; flex-wrap: wrap; }
  .cap-name { font-family: 'JetBrains Mono', monospace; font-weight: 500; color: #1a1a1f; }
  .cap-primitive { font-size: 0.7rem; padding: 0.1rem 0.4rem; background: #f0ede6; border-radius: 3px; color: #6b6b78; }
  .cap-reason { color: #9b9baa; font-size: 0.75rem; font-style: italic; }
  .cap-status { font-size: 0.6rem; font-weight: 700; color: #148b3e; letter-spacing: 0.1em; text-transform: uppercase; }

  /* Architecture diagram */
  .arch-diagram { text-align: center; margin: 1.5rem 0; }
  .arch-layer { padding: 0.8rem 1.5rem; border-radius: 6px; font-size: 0.82rem; font-weight: 500; }
  .layer-2 { background: #faf5e8; border: 1px solid #c9a84c; color: #8b6914; }
  .layer-1 { background: #f0f0f0; border: 1px solid #ccc; color: #3a3a42; }
  .arch-arrow { font-size: 0.75rem; color: #9b9baa; padding: 0.4rem 0; letter-spacing: 0.2em; }

  /* Proof certificate */
  .proof-block { background: #faf9f6; border: 2px solid rgba(201,168,76,0.3); border-radius: 8px; padding: 2rem; margin: 1rem 0; }
  .proof-header { font-family: 'Cormorant Garamond', Georgia, serif; font-size: 1rem; font-weight: 700; text-align: center; letter-spacing: 0.15em; text-transform: uppercase; color: #c9a84c; margin-bottom: 1.5rem; padding-bottom: 1rem; border-bottom: 1px solid rgba(201,168,76,0.2); }
  .proof-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.6rem 2rem; margin-bottom: 1.5rem; }
  .proof-label { font-size: 0.6rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.12em; color: #9b9baa; display: block; }
  .proof-value { font-size: 0.85rem; color: #1a1a1f; display: block; margin-top: 0.1rem; }
  .proof-primitives { margin-top: 1rem; padding-top: 1rem; border-top: 1px solid rgba(26,26,31,0.08); }
  .primitive-tags { display: flex; flex-wrap: wrap; gap: 0.35rem; }
  .prim-tag { font-family: 'JetBrains Mono', monospace; font-size: 0.7rem; padding: 0.15rem 0.5rem; background: #f0ede6; border-radius: 3px; color: #3a3a42; }
  .proof-footer { margin-top: 1.25rem; font-size: 0.78rem; color: #6b6b78; font-style: italic; text-align: center; }

  /* Ornament + Colophon */
  .ornament { text-align: center; font-size: 1.2rem; color: rgba(26,26,31,0.2); margin: 2rem 0; letter-spacing: 0.5em; }
  .colophon { margin-top: 3rem; padding-top: 2rem; border-top: 2px solid #1a1a1f; display: flex; justify-content: space-between; align-items: flex-end; flex-wrap: wrap; gap: 1rem; }
  .colophon-left { font-size: 0.72rem; color: #9b9baa; line-height: 1.8; }
  .colophon-right { font-family: 'Cormorant Garamond', Georgia, serif; font-size: 1.1rem; font-weight: 600; color: #9b9baa; }
`;
