/**
 * Ascension V2 — Branded HTML Document Generators
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Generates: LICENSE.html, README.html, USER-GUIDE.html, ADVERTISEMENT.html
 * All mobile-responsive, branded with patent numbers and inventor info.
 *
 * U.S. Patent App. No. 64/029,678
 * U.S. Patent App. No. 64/031,637
 *
 * © 2025–2026 CMPSBL® · PromptFluid™. All rights reserved.
 */

function esc(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

const year = () => new Date().getFullYear();
const dateStr = () => new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

// ─────────────────────────────────────────────────────────────────────────────
// Light-theme tokens mirrored from src/index.css :root — kept inline so the
// exported HTML renders identically to cmpsbl.com without needing the site's
// stylesheet or any runtime CSS-variable resolution.
// ─────────────────────────────────────────────────────────────────────────────
const TOKENS = {
  background: 'hsl(0, 0%, 100%)',
  foreground: 'hsl(220, 15%, 15%)',
  card: 'hsl(0, 0%, 100%)',
  muted: 'hsl(220, 14%, 96%)',
  mutedFg: 'hsl(220, 10%, 35%)',
  border: 'hsl(220, 10%, 85%)',
  primary: 'hsl(210, 60%, 45%)',
  neonCyan: 'hsl(185, 100%, 40%)',
  neonPurple: 'hsl(280, 100%, 55%)',
  neonMagenta: 'hsl(310, 100%, 50%)',
};

const BRAND_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500&display=swap');
  *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
  html { font-size: 15px; scroll-behavior: smooth; }
  body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    background: ${TOKENS.background};
    color: ${TOKENS.foreground};
    line-height: 1.7;
    -webkit-font-smoothing: antialiased;
    overflow-wrap: break-word;
  }
  .page {
    max-width: 820px;
    margin: 0 auto;
    padding: 3rem 2.5rem;
    position: relative;
  }
  /* Ambient hero orbs — subtle gradient mesh, mirrors FactoryHome */
  .ambient {
    position: fixed; inset: 0; pointer-events: none; z-index: 0;
    overflow: hidden;
  }
  .ambient::before, .ambient::after {
    content: ''; position: absolute; border-radius: 50%; filter: blur(40px);
  }
  .ambient::before {
    width: 600px; height: 600px; top: -200px; left: -200px;
    background: radial-gradient(circle, hsla(210, 60%, 45%, 0.08), transparent 60%);
  }
  .ambient::after {
    width: 500px; height: 500px; bottom: -150px; right: -150px;
    background: radial-gradient(circle, hsla(280, 100%, 55%, 0.06), transparent 60%);
  }
  .page > * { position: relative; z-index: 1; }
  @media (max-width: 640px) {
    .page { padding: 1.5rem 1rem; }
    html { font-size: 13px; }
    .doc-title { font-size: 1.25rem; word-break: break-word; }
    .doc-subtitle { font-size: 0.8rem; }
    .meta-grid { grid-template-columns: repeat(2, 1fr); }
    table { display: block; overflow-x: auto; -webkit-overflow-scrolling: touch; }
    th, td { white-space: nowrap; padding: 0.4rem 0.5rem; font-size: 0.72rem; }
    pre { padding: 0.75rem; font-size: 0.7rem; }
    code { word-break: break-all; }
    .highlight { padding: 0.7rem 1rem; font-size: 0.78rem; }
    .colophon { flex-direction: column; align-items: flex-start; }
    h2 { font-size: 0.95rem; }
    .cmpsbl-wordmark { font-size: 3.25rem; }
  }
  @media (max-width: 380px) {
    .page { padding: 1.25rem 0.75rem; }
    .meta-grid { grid-template-columns: 1fr; }
    th, td { font-size: 0.65rem; padding: 0.3rem 0.4rem; }
    .cmpsbl-wordmark { font-size: 2.5rem; }
  }
  /* ── Animated CMPSBL® wordmark — mirrors src/components/hero/CmpsblWordmark.tsx ── */
  @keyframes cmpsblLetterFlow {
    0%, 100% { background-position: 0% 50%; }
    50%      { background-position: 100% 50%; }
  }
  @keyframes cmpsblPulseGlow {
    0%, 100% { filter: drop-shadow(0 0 12px hsla(210, 60%, 45%, 0.18)); }
    50%      { filter: drop-shadow(0 0 24px hsla(280, 100%, 55%, 0.28)); }
  }
  .cmpsbl-wordmark {
    display: inline-flex; align-items: baseline; user-select: none;
    font-size: 4.5rem; font-weight: 900; line-height: 1;
    animation: cmpsblPulseGlow 3s ease-in-out infinite;
  }
  .cmpsbl-wordmark .cm-l {
    display: inline-block; line-height: 1;
    background-size: 200% 200%;
    -webkit-background-clip: text; background-clip: text;
    color: transparent;
    animation: cmpsblLetterFlow 5s ease-in-out infinite;
  }
  .cmpsbl-wordmark .cm-l + .cm-l { margin-left: -0.015em; }
  .cmpsbl-wordmark .cm-c { background-image: linear-gradient(135deg, ${TOKENS.neonCyan}, ${TOKENS.primary}, ${TOKENS.neonCyan});  transform: translateY(2px);  animation-delay: 0s; }
  .cmpsbl-wordmark .cm-m { background-image: linear-gradient(135deg, ${TOKENS.primary}, ${TOKENS.neonPurple}, ${TOKENS.primary});  transform: translateY(-3px); animation-delay: 0.8s; }
  .cmpsbl-wordmark .cm-p { background-image: linear-gradient(135deg, ${TOKENS.neonPurple}, ${TOKENS.neonMagenta}, ${TOKENS.neonPurple}); transform: translateY(2px);  animation-delay: 1.6s; }
  .cmpsbl-wordmark .cm-s { background-image: linear-gradient(135deg, ${TOKENS.neonMagenta}, ${TOKENS.neonCyan}, ${TOKENS.neonMagenta}); transform: translateY(-2px); animation-delay: 2.4s; }
  .cmpsbl-wordmark .cm-b { background-image: linear-gradient(135deg, ${TOKENS.neonCyan}, ${TOKENS.neonPurple}, ${TOKENS.neonCyan});  transform: translateY(3px);  animation-delay: 3.2s; }
  .cmpsbl-wordmark .cm-l2{ background-image: linear-gradient(135deg, ${TOKENS.primary}, ${TOKENS.neonMagenta}, ${TOKENS.primary});  transform: translateY(-2px); animation-delay: 4.0s; }
  .cmpsbl-wordmark .cm-r {
    display: inline-block; font-size: 0.35em; font-weight: 700;
    vertical-align: super; margin-left: 0.05em; line-height: 1;
    background-image: linear-gradient(135deg, ${TOKENS.neonCyan}, ${TOKENS.primary}, ${TOKENS.neonPurple});
    background-size: 200% 200%;
    -webkit-background-clip: text; background-clip: text;
    color: transparent;
    animation: cmpsblLetterFlow 5s ease-in-out infinite;
    animation-delay: 4.8s;
  }
  .doc-header {
    text-align: center;
    padding-bottom: 2rem;
    border-bottom: 1px solid ${TOKENS.border};
    margin-bottom: 2rem;
  }
  .doc-header .issuer {
    font-size: 0.65rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.3em;
    color: ${TOKENS.mutedFg};
    margin: 1.5rem 0 0.75rem;
  }
  .doc-title {
    font-size: 1.6rem;
    font-weight: 700;
    letter-spacing: -0.02em;
    line-height: 1.3;
    color: ${TOKENS.foreground};
  }
  .doc-subtitle {
    font-size: 0.9rem;
    color: ${TOKENS.mutedFg};
    margin-top: 0.4rem;
  }
  .seal-area { display: flex; justify-content: center; margin: 1.25rem 0 1.5rem; }
  h2 {
    font-size: 1.1rem; font-weight: 700;
    margin: 2rem 0 0.8rem; padding-bottom: 0.45rem;
    border-bottom: 1px solid ${TOKENS.border};
    color: ${TOKENS.foreground};
  }
  h3 { font-size: 0.95rem; font-weight: 600; margin: 1.2rem 0 0.5rem; color: ${TOKENS.foreground}; }
  p  { margin-bottom: 0.8rem; color: ${TOKENS.foreground}; font-size: 0.9rem; }
  ul, ol { padding-left: 1.5rem; margin-bottom: 0.8rem; }
  li { margin-bottom: 0.35rem; color: ${TOKENS.foreground}; font-size: 0.9rem; }
  a  { color: ${TOKENS.primary}; text-decoration: none; }
  a:hover { text-decoration: underline; }
  code {
    font-family: 'JetBrains Mono', 'Fira Code', monospace;
    font-size: 0.82em; background: ${TOKENS.muted};
    padding: 0.15em 0.4em; border-radius: 4px; color: ${TOKENS.primary};
    border: 1px solid ${TOKENS.border};
  }
  pre {
    background: ${TOKENS.muted};
    border: 1px solid ${TOKENS.border};
    border-radius: 8px;
    padding: 1rem 1.25rem;
    overflow-x: auto;
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.78rem;
    line-height: 1.6;
    color: ${TOKENS.foreground};
    margin: 0.8rem 0;
  }
  .highlight {
    background: hsla(210, 60%, 45%, 0.06);
    border-left: 3px solid ${TOKENS.primary};
    padding: 0.9rem 1.25rem;
    border-radius: 0 6px 6px 0;
    margin: 1rem 0;
    font-size: 0.88rem;
    color: ${TOKENS.foreground};
  }
  .highlight strong { color: ${TOKENS.foreground}; }
  .meta-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
    gap: 0.75rem;
    margin: 1rem 0 1.5rem;
  }
  .meta-item {
    background: ${TOKENS.card};
    border: 1px solid ${TOKENS.border};
    border-radius: 8px;
    padding: 0.7rem 0.9rem;
  }
  .meta-label { font-size: 0.6rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.12em; color: ${TOKENS.mutedFg}; }
  .meta-value { font-size: 0.85rem; font-weight: 500; color: ${TOKENS.foreground}; margin-top: 0.15rem; }
  .toc { list-style: none; padding: 0; }
  .toc li { padding: 0.4rem 0; border-bottom: 1px solid ${TOKENS.border}; }
  .toc a { color: ${TOKENS.primary}; text-decoration: none; font-size: 0.88rem; }
  .toc a:hover { text-decoration: underline; }
  table {
    width: 100%; border-collapse: collapse; margin: 0.8rem 0;
    font-size: 0.85rem;
  }
  th { text-align: left; padding: 0.55rem 0.7rem; border-bottom: 2px solid ${TOKENS.border}; color: ${TOKENS.mutedFg}; font-weight: 600; font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.05em; }
  td { padding: 0.55rem 0.7rem; border-bottom: 1px solid ${TOKENS.border}; color: ${TOKENS.foreground}; }
  .colophon {
    margin-top: 3rem; padding-top: 1.5rem; border-top: 1px solid ${TOKENS.border};
    display: flex; justify-content: space-between; align-items: flex-end; flex-wrap: wrap; gap: 1rem;
  }
  .colophon-left  { font-size: 0.7rem; color: ${TOKENS.mutedFg}; line-height: 1.8; }
  .colophon-right { font-size: 0.95rem; font-weight: 700; color: ${TOKENS.mutedFg}; letter-spacing: 0.05em; }
  .patent-notice  { font-size: 0.72rem; color: ${TOKENS.mutedFg}; font-style: italic; margin-top: 1rem; }
`;


function htmlShell(title: string, body: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${esc(title)} — CMPSBL®</title>
  <style>${BRAND_STYLES}</style>
</head>
<body>
<div class="ambient" aria-hidden="true"></div>
${body}
</body>
</html>`;
}

function colophon(): string {
  return `
  <div class="colophon">
    <div class="colophon-left">
      CMPSBL® · PromptFluid™<br>
      <a href="https://cmpsbl.com">https://cmpsbl.com</a><br>
      © ${year()} CMPSBL®. All rights reserved.<br>
      U.S. Patent App. No. 64/029,678 · U.S. Patent App. No. 64/031,637
    </div>
    <div class="colophon-right">CMPSBL®</div>
  </div>
  <p class="patent-notice">
    Invented by Kenneth E. Sweet Jr. · Patent Pending · PromptFluid™ TX
  </p>`;
}

/**
 * Animated CMPSBL® wordmark — visually identical to the homepage
 * <CmpsblWordmark/> hero logo. Pure CSS, no external assets.
 */
function cmpsblWordmark(): string {
  return `
  <div class="seal-area">
    <span class="cmpsbl-wordmark" aria-label="CMPSBL®" role="img">
      <span class="cm-l cm-c">C</span><span class="cm-l cm-m">M</span><span class="cm-l cm-p">P</span><span class="cm-l cm-s">S</span><span class="cm-l cm-b">B</span><span class="cm-l cm-l2">L</span><span class="cm-r">®</span>
    </span>
  </div>`;
}

// Backwards-compat alias for any older callers.
const sealBadge = cmpsblWordmark;

// ═══════════════════════════════════════════════════════════════
// LICENSE.html
// ═══════════════════════════════════════════════════════════════

export interface V2LicenseInput {
  packName: string;
  fingerprint?: string;
  serial?: string;
}

export function generateV2LicenseHTML(input: V2LicenseInput | string): string {
  const opts: V2LicenseInput =
    typeof input === 'string' ? { packName: input } : input;
  const { packName, fingerprint, serial } = opts;
  const fp = fingerprint ? esc(fingerprint) : '—';
  const sn = serial ? esc(serial) : '—';

  return htmlShell(`License — ${packName}`, `
<div class="page">
  <header class="doc-header">
    <div class="issuer">CMPSBL® · PromptFluid™ · CAAL-1.0</div>
    <div class="doc-title">CMPSBL® Ascended Artifact License</div>
    <div class="doc-subtitle">Version 1.0 (CAAL-1.0) · SPDX: LicenseRef-CMPSBL-CAAL-1.0</div>
  </header>
  ${sealBadge()}

  <p style="text-align:center; font-size:0.85rem; color:${TOKENS.mutedFg}; margin-bottom:1.5rem;">
    Issued ${dateStr()} for <strong style="color:${TOKENS.foreground};">${esc(packName)}</strong>
  </p>

  <div class="meta-grid">
    <div class="meta-item"><div class="meta-label">Artifact Serial</div><div class="meta-value"><code>${sn}</code></div></div>
    <div class="meta-item"><div class="meta-label">Artifact Fingerprint</div><div class="meta-value"><code>${fp}</code></div></div>
  </div>

  <div class="highlight">
    <strong>Redistribute & sell freely · No modification or reverse engineering · Attribution to CMPSBL® required.</strong>
  </div>

  <h2>§1 — Definitions</h2>
  <p>
    <strong>"Artifact"</strong> means the single-file software output produced by the CMPSBL®
    Ascension pipeline, consisting of two layers:
  </p>
  <ul>
    <li><strong>Layer 1</strong> — the original source code, copied byte-for-byte and
      carrying its own upstream license. <em>This License does not apply to Layer 1.</em></li>
    <li><strong>Layer 2</strong> — the CMPSBL® wrapper, runtime, dispatch matrix, primitive
      activations, and embedded governance, generated by the Ascension pipeline.
      <em>This License governs Layer 2.</em></li>
  </ul>

  <h2>§2 — Grant of Rights (Layer 2)</h2>
  <p>Subject to the conditions below, you are granted a perpetual, worldwide, royalty-free,
    non-exclusive license to:</p>
  <ul>
    <li><strong>(a) Reproduce</strong> the Artifact in source or binary form.</li>
    <li><strong>(b) Distribute</strong> the Artifact, alone or as part of a larger work.</li>
    <li><strong>(c) Sell</strong> the Artifact, including as part of a commercial product or service.</li>
    <li><strong>(d) Sublicense</strong> downstream recipients on the same CAAL-1.0 terms.</li>
  </ul>

  <h2>§3 — Restrictions (Layer 2)</h2>
  <p>You may <strong>NOT</strong>:</p>
  <ul>
    <li><strong>Modify</strong>, patch, fork, or alter the Layer 2 wrapper, runtime, or dispatch matrix.</li>
    <li><strong>Reverse engineer</strong>, decompile, disassemble, or otherwise attempt to derive the source form of obfuscated or compiled Layer 2 components.</li>
    <li><strong>Extract</strong>, isolate, or repackage internal primitives, engines, or governance logic for use outside the Artifact.</li>
    <li><strong>Remove</strong> or obscure the CMPSBL® attribution, this License header, the artifact fingerprint, or any embedded provenance markers.</li>
  </ul>

  <h2>§4 — Attribution Requirements</h2>
  <p>Every redistribution must preserve, prominently and unmodified:</p>
  <div class="highlight">
    <strong>"Powered by CMPSBL® · https://cmpsbl.com<br/>
    Ascended Layer 2 Technology · CAAL-1.0 · Patent Pending"</strong>
  </div>
  <p>The inline Layer 2 license header inside the Artifact, this LICENSE document, and the
    artifact fingerprint must travel with every copy.</p>

  <h2>§5 — Intellectual Property</h2>
  <p>
    The Layer 2 technology — including the Convex Core™ processing layer, the CJPI scoring
    algorithm, the dispatch matrix, and the behavioral primitives (DEFENSE, CORTEX, NEXUS,
    BRAIN, ORACLE, et al.) — is proprietary to CMPSBL® and protected under
    U.S. Patent App. No. 64/029,678 and U.S. Patent App. No. 64/031,637. The Artifact is a
    finished product, not a blueprint of the underlying pipeline.
  </p>

  <h2>§6 — Termination</h2>
  <p>Any breach of §3 or §4 immediately and automatically terminates all rights granted
    under this License. Upon termination, the licensee must cease distribution and destroy
    all copies under their control.</p>

  <h2>§7 — Disclaimer of Warranty</h2>
  <p style="font-size:0.78rem; color:${TOKENS.mutedFg}; text-transform:uppercase; letter-spacing:0.02em; line-height:1.9;">
    The Artifact is provided "AS IS", without warranty of any kind, express or implied,
    including but not limited to the warranties of merchantability, fitness for a particular
    purpose, and noninfringement.
  </p>

  <h2>§8 — Limitation of Liability</h2>
  <p style="font-size:0.78rem; color:${TOKENS.mutedFg}; text-transform:uppercase; letter-spacing:0.02em; line-height:1.9;">
    In no event shall CMPSBL®, PromptFluid™, or the inventor be liable for any claim,
    damages, or other liability — whether in contract, tort, or otherwise — arising from,
    out of, or in connection with the Artifact or the use or other dealings in the Artifact.
  </p>

  ${colophon()}
</div>`);
}

// ═══════════════════════════════════════════════════════════════
// README.html
// ═══════════════════════════════════════════════════════════════

export interface V2ReadmeInput {
  packName: string;
  originalFileName: string;
  ascendedFileName: string;
  capabilities: { name: string; cjpiScore: number; tier: string; chain: string[] }[];
  language: string;
  avgCjpi: number;
  topCjpi: number;
  fingerprint: string;
}

export function generateV2ReadmeHTML(input: V2ReadmeInput): string {
  const files = [
    { name: 'LICENSE.html', purpose: 'Commercial distribution license with patent notices' },
    { name: 'README.html', purpose: 'This file — package overview and quick start' },
    { name: 'USER-GUIDE.html', purpose: 'Comprehensive guide with activation, pipeline details, and error codes' },
    { name: input.originalFileName, purpose: 'Your original source file — completely untouched' },
    { name: input.ascendedFileName, purpose: 'Layer 2 wrapped file with activated capabilities — rename to match original before drop-in' },
    { name: 'ADVERTISEMENT.html', purpose: 'Information about custom Mana layers and the CMPSBL® ecosystem' },
  ];

  return htmlShell(`README — ${input.packName}`, `
<div class="page">
  <header class="doc-header">
    <div class="issuer">CMPSBL® · Ascension V2 Export</div>
    <div class="doc-title">${esc(input.packName)}</div>
    <div class="doc-subtitle">Ascended Software Package · ${esc(input.language)}</div>
  </header>
  ${sealBadge()}

  <div class="meta-grid">
    <div class="meta-item"><div class="meta-label">Capabilities</div><div class="meta-value">${input.capabilities.length}</div></div>
    <div class="meta-item"><div class="meta-label">Avg CJPI</div><div class="meta-value">${input.avgCjpi}</div></div>
    <div class="meta-item"><div class="meta-label">Top CJPI</div><div class="meta-value">${input.topCjpi}</div></div>
    <div class="meta-item"><div class="meta-label">Language</div><div class="meta-value">${esc(input.language)}</div></div>
    <div class="meta-item"><div class="meta-label">Fingerprint</div><div class="meta-value" style="font-family:monospace;font-size:0.75rem;">${esc(input.fingerprint)}</div></div>
    <div class="meta-item"><div class="meta-label">Exported</div><div class="meta-value">${dateStr()}</div></div>
  </div>

  <h2>What Is This?</h2>
  <p>
    This package contains your original source code alongside an <strong>ascended</strong> version
    that has been wrapped with CMPSBL® Layer 2 technology. The ascended file contains ${input.capabilities.length}
    activated capabilities discovered through the 40-Primitive collision matrix.
  </p>
  <div class="highlight">
    <strong>Important:</strong> Rename <code>${esc(input.ascendedFileName)}</code> to <code>${esc(input.originalFileName)}</code>
    before dropping it into your stack. The ascended file is a drop-in replacement.
  </div>

  <h2>Included Files</h2>
  <table>
    <thead><tr><th>File</th><th>Purpose</th></tr></thead>
    <tbody>
      ${files.map(f => `<tr><td><code>${esc(f.name)}</code></td><td>${esc(f.purpose)}</td></tr>`).join('\n      ')}
    </tbody>
  </table>

  <h2>Quick Start</h2>
  <ol>
    <li>Unzip this package</li>
    <li>Rename <code>${esc(input.ascendedFileName)}</code> → <code>${esc(input.originalFileName)}</code></li>
    <li>Drop the renamed file into your existing project, replacing the original</li>
    <li>All ${input.capabilities.length} capabilities are pre-activated — no configuration needed</li>
  </ol>

  <h2>Discovered Capabilities</h2>
  <table>
    <thead><tr><th>#</th><th>Capability</th><th>CJPI</th><th>Tier</th><th>Chain</th></tr></thead>
    <tbody>
      ${input.capabilities.map((c, i) => `<tr>
        <td>${i + 1}</td>
        <td>${esc(c.name)}</td>
        <td><strong>${c.cjpiScore}</strong></td>
        <td>${esc(c.tier)}</td>
        <td style="font-size:0.75rem;">${c.chain.map(n => esc(n)).join(' → ')}</td>
      </tr>`).join('\n      ')}
    </tbody>
  </table>

  ${colophon()}
</div>`);
}

// ═══════════════════════════════════════════════════════════════
// USER-GUIDE.html — Comprehensive unified doc
// ═══════════════════════════════════════════════════════════════

export interface V2UserGuideInput {
  packName: string;
  originalFileName: string;
  ascendedFileName: string;
  capabilities: { name: string; cjpiScore: number; tier: string; chain: string[]; description: string }[];
  language: string;
  avgCjpi: number;
  fingerprint: string;
  integrityHash: string;
  enhanced: boolean;
}

export function generateV2UserGuideHTML(input: V2UserGuideInput): string {
  return htmlShell(`User Guide — ${input.packName}`, `
<div class="page">
  <header class="doc-header">
    <div class="issuer">CMPSBL® · Ascension V2 · Comprehensive User Guide</div>
    <div class="doc-title">User Guide</div>
    <div class="doc-subtitle">${esc(input.packName)} · ${esc(input.language)}</div>
  </header>
  ${sealBadge()}

  <h2>Table of Contents</h2>
  <ol class="toc">
    <li><a href="#overview">1. Overview</a></li>
    <li><a href="#installation">2. Installation &amp; Drop-In</a></li>
    <li><a href="#capabilities">3. Activated Capabilities</a></li>
    <li><a href="#pipeline">4. Pipeline Details</a></li>
    <li><a href="#layer2">5. Layer 2 Architecture</a></li>
    <li><a href="#activation">6. Activation &amp; Deactivation</a></li>
    <li><a href="#verification">7. Verification &amp; Integrity</a></li>
    <li><a href="#error-codes">8. Error Codes</a></li>
    <li><a href="#troubleshooting">9. Troubleshooting</a></li>
    <li><a href="#advanced">10. Advanced Configuration</a></li>
    <li><a href="#patent">11. Patent &amp; Legal</a></li>
  </ol>

  <!-- §1 Overview -->
  <h2 id="overview">1. Overview</h2>
  <p>
    This package was generated by the CMPSBL® Ascension V2 pipeline — a deterministic,
    patent-pending code evolution system. Your original source file was analyzed against
    a 40-Primitive collision matrix, and ${input.capabilities.length} unique capabilities
    were discovered, deduplicated, and permanently activated in the ascended file.
  </p>
  <div class="meta-grid">
    <div class="meta-item"><div class="meta-label">Original</div><div class="meta-value"><code>${esc(input.originalFileName)}</code></div></div>
    <div class="meta-item"><div class="meta-label">Ascended</div><div class="meta-value"><code>${esc(input.ascendedFileName)}</code></div></div>
    <div class="meta-item"><div class="meta-label">Capabilities</div><div class="meta-value">${input.capabilities.length}</div></div>
    <div class="meta-item"><div class="meta-label">Avg CJPI</div><div class="meta-value">${input.avgCjpi}</div></div>
    <div class="meta-item"><div class="meta-label">Mana Enhanced</div><div class="meta-value">${input.enhanced ? 'Yes' : 'No'}</div></div>
  </div>

  <!-- §2 Installation -->
  <h2 id="installation">2. Installation &amp; Drop-In</h2>
  <p>The ascended file is a drop-in replacement for your original. Follow these steps:</p>
  <ol>
    <li>Extract the ZIP archive</li>
    <li>Back up your existing <code>${esc(input.originalFileName)}</code></li>
    <li>Rename <code>${esc(input.ascendedFileName)}</code> to <code>${esc(input.originalFileName)}</code></li>
    <li>Place the renamed file in the same location as your original</li>
    <li>All capabilities are pre-activated — no configuration changes needed</li>
  </ol>
  <div class="highlight">
    <strong>Why rename?</strong> The ascended file is named differently to prevent accidental
    overwrites during extraction. Once renamed, it functions identically to the original
    with additional Layer 2 capabilities.
  </div>

  <!-- §3 Capabilities -->
  <h2 id="capabilities">3. Activated Capabilities</h2>
  <p>
    The following ${input.capabilities.length} capabilities were discovered through the Ascension V2
    pipeline and are permanently activated in your ascended file:
  </p>
  <table>
    <thead><tr><th>#</th><th>Capability</th><th>CJPI</th><th>Tier</th><th>Description</th></tr></thead>
    <tbody>
      ${input.capabilities.map((c, i) => `<tr>
        <td>${i + 1}</td>
        <td><strong>${esc(c.name)}</strong></td>
        <td>${c.cjpiScore}</td>
        <td>${esc(c.tier)}</td>
        <td style="font-size:0.78rem;">${esc(c.description || 'Emerged from substrate collision')}</td>
      </tr>`).join('\n      ')}
    </tbody>
  </table>
  <h3>Primitive Chains</h3>
  ${input.capabilities.map((c, i) => `<p style="font-size:0.82rem;"><strong>${i + 1}. ${esc(c.name)}</strong>: ${c.chain.map(n => `<code>${esc(n)}</code>`).join(' → ')}</p>`).join('\n  ')}

  <!-- §4 Pipeline Details -->
  <h2 id="pipeline">4. Pipeline Details</h2>
  <p>The Ascension V2 pipeline processes code through these stages:</p>
  <table>
    <thead><tr><th>Stage</th><th>Name</th><th>Description</th></tr></thead>
    <tbody>
      <tr><td>1</td><td><strong>INTAKE</strong></td><td>Source ingestion, language detection, file parsing</td></tr>
      <tr><td>2</td><td><strong>FINGERPRINT</strong></td><td>Deterministic structural identity via FNV-1a hash</td></tr>
      <tr><td>3</td><td><strong>CLASSIFY</strong></td><td>Pattern recognition against 40 substrate primitives</td></tr>
      <tr><td>4</td><td><strong>COLLIDE</strong></td><td>Cross-primitive collision scoring for capability discovery</td></tr>
      <tr><td>5</td><td><strong>SCORE</strong></td><td>CJPI evaluation (Complexity 30%, Jurisdiction 30%, Primitive 20%, Impact 20%)</td></tr>
      <tr><td>6</td><td><strong>DEDUP</strong></td><td>Collapse duplicates to top 4–7 unique capabilities</td></tr>
      <tr><td>7</td><td><strong>BIND</strong></td><td>Primitive attachment and capability activation</td></tr>
      <tr><td>8</td><td><strong>SEAL</strong></td><td>Layer 2 wrapping and integrity hashing</td></tr>
    </tbody>
  </table>
  <h3>CJPI Scoring Formula</h3>
  <p>Every capability receives a <strong>Crown Jewel Potential Index</strong> (CJPI) score from 0–100:</p>
  <pre>CJPI = (Complexity × 0.30) + (Jurisdiction × 0.30) + (Primitive × 0.20) + (Impact × 0.20)</pre>
  <table>
    <thead><tr><th>Tier</th><th>Score Range</th><th>Classification</th></tr></thead>
    <tbody>
      <tr><td>APEX</td><td>90–100</td><td>Hardware-synthesizable, maximum strategic value</td></tr>
      <tr><td>MYTHIC</td><td>80–89</td><td>High-value production capability</td></tr>
      <tr><td>S-TIER</td><td>70–79</td><td>Strong capability with broad applicability</td></tr>
      <tr><td>A-TIER</td><td>60–69</td><td>Solid capability for targeted use cases</td></tr>
      <tr><td>B-TIER</td><td>40–59</td><td>Viable capability with room for growth</td></tr>
      <tr><td>RAW</td><td>0–39</td><td>Early-stage discovery</td></tr>
    </tbody>
  </table>

  <!-- §5 Layer 2 Architecture -->
  <h2 id="layer2">5. Layer 2 Architecture</h2>
  <p>
    The CMPSBL® Layer 2 is a patented behavioral wrapper that <strong>surrounds</strong> your code
    without modifying it. Think of it like a protective shell that adds capabilities:
  </p>
  <ul>
    <li><strong>Layer 1 (L1)</strong> — Your original source code, completely untouched</li>
    <li><strong>Layer 2 (L2)</strong> — Behavioral wrapper providing governance, security, and activated capabilities</li>
  </ul>
  <p>
    The ascended file contains both layers as a single distribution. The L2 wrapper intercepts
    function calls, adds behavioral policies, and enables the activated capabilities — all
    without modifying a single byte of your original source code.
  </p>

  <!-- §6 Activation -->
  <h2 id="activation">6. Activation &amp; Deactivation</h2>
  <p>
    <strong>All capabilities are pre-activated.</strong> No configuration is needed for standard usage.
    The ascended file works as a drop-in replacement immediately.
  </p>
  <h3>Deactivating Specific Capabilities</h3>
  <p>If you need to deactivate a specific capability, locate the capability block in the ascended file and set its <code>active</code> flag to <code>false</code>:</p>
  <pre>// In the ascended file, find the capability declaration:
// capabilities.CAPABILITY_NAME.active = false;</pre>
  <h3>Reverting to Original</h3>
  <p>To fully revert, simply replace the ascended file with the original source file included in this package. No residual changes will remain.</p>

  <!-- §7 Verification -->
  <h2 id="verification">7. Verification &amp; Integrity</h2>
  <p>Every export includes cryptographic integrity verification:</p>
  <div class="meta-grid">
    <div class="meta-item"><div class="meta-label">Fingerprint</div><div class="meta-value" style="font-family:monospace;font-size:0.72rem;">${esc(input.fingerprint)}</div></div>
    <div class="meta-item"><div class="meta-label">Integrity Hash</div><div class="meta-value" style="font-family:monospace;font-size:0.72rem;">${esc(input.integrityHash.slice(0, 24))}</div></div>
  </div>
  <p>The Merkle-linked audit chain records every pipeline event from upload to export. If any stage was tampered with, the integrity hash will not match.</p>

  <!-- §8 Error Codes -->
  <h2 id="error-codes">8. Error Codes</h2>
  <table>
    <thead><tr><th>Code</th><th>Meaning</th><th>Resolution</th></tr></thead>
    <tbody>
      <tr><td><code>E_NO_SOURCE</code></td><td>No source code detected in upload</td><td>Ensure files contain parseable code</td></tr>
      <tr><td><code>E_FINGERPRINT_MISMATCH</code></td><td>File changed between upload and export</td><td>Re-upload and re-run the pipeline</td></tr>
      <tr><td><code>E_COLLISION_TIMEOUT</code></td><td>Primitive collision timed out</td><td>Retry with a smaller file or fewer functions</td></tr>
      <tr><td><code>E_DEDUP_EMPTY</code></td><td>No unique capabilities survived deduplication</td><td>Try richer source code with more function boundaries</td></tr>
      <tr><td><code>E_BIND_FAILED</code></td><td>Capability binding failed during wrapping</td><td>Check source for unsupported syntax patterns</td></tr>
      <tr><td><code>E_SEAL_INTEGRITY</code></td><td>Integrity seal could not be applied</td><td>Re-run the pipeline from scratch</td></tr>
      <tr><td><code>E_AUDIT_BROKEN</code></td><td>Audit chain verification failed</td><td>Pipeline was interrupted — restart from upload</td></tr>
      <tr><td><code>E_MANA_ATTACH</code></td><td>Mana enhancement attachment failed</td><td>Skip enhancement or retry with smaller packages</td></tr>
    </tbody>
  </table>

  <!-- §9 Troubleshooting -->
  <h2 id="troubleshooting">9. Troubleshooting</h2>
  <h3>Ascended file not working as drop-in?</h3>
  <ul>
    <li>Ensure you renamed <code>${esc(input.ascendedFileName)}</code> to <code>${esc(input.originalFileName)}</code></li>
    <li>Check that the file is in the same directory as the original</li>
    <li>Verify your build system recognizes the file extension</li>
  </ul>
  <h3>Import errors?</h3>
  <ul>
    <li>The ascended file is self-contained — no external CMPSBL® dependencies needed</li>
    <li>If your bundler complains, ensure it supports the target language syntax</li>
  </ul>
  <h3>Performance concerns?</h3>
  <ul>
    <li>Layer 2 overhead is minimal — typically &lt;1ms per function call</li>
    <li>Capabilities use lazy initialization and are only activated on first use</li>
  </ul>

  <!-- §10 Advanced -->
  <h2 id="advanced">10. Advanced Configuration</h2>
  <h3>Custom Capability Ordering</h3>
  <p>Capabilities execute in CJPI-descending order by default. To change execution order, modify the <code>_capabilityOrder</code> array in the ascended file.</p>
  <h3>Mana Enhancement</h3>
  <p>${input.enhanced ? 'This export was enhanced with Mana — additional SDK-based capabilities were attached during the pipeline.' : 'This export was not Mana-enhanced. To add SDK-based capabilities, re-run the pipeline and select "Enhance" during Step 2.'}</p>

  <!-- §11 Patent -->
  <h2 id="patent">11. Patent &amp; Legal</h2>
  <p>This software incorporates technology protected under:</p>
  <ul>
    <li><strong>U.S. Patent App. No. 64/029,678</strong> — "Dual-Layer Software Symbiosis System"</li>
    <li><strong>U.S. Patent App. No. 64/031,637</strong> — "Cognitive Infrastructure Substrate"</li>
  </ul>
  <p>
    <strong>Inventor:</strong> Kenneth E. Sweet Jr.<br>
    <strong>Assignee:</strong> PromptFluid™ TX<br>
    <strong>Website:</strong> https://cmpsbl.com
  </p>
  <p>Unauthorized reverse engineering, extraction, or redistribution of the Layer 2 technology is prohibited.</p>

  ${colophon()}
</div>`);
}

// ═══════════════════════════════════════════════════════════════
// ADVERTISEMENT.html — Promo for custom Mana layers
// ═══════════════════════════════════════════════════════════════

export function generateV2AdvertisementHTML(packName: string, capCount: number): string {
  return htmlShell(`Explore More — CMPSBL®`, `
<div class="page">
  <header class="doc-header">
    <div class="issuer">CMPSBL® · PromptFluid™</div>
    <div class="doc-title">Your Software Just Evolved</div>
    <div class="doc-subtitle">What's next? Custom Mana Layers.</div>
  </header>
  ${sealBadge()}

  <h2>What You Just Experienced</h2>
  <p>
    The Ascension pipeline analyzed your code against 40 substrate primitives and discovered
    ${capCount} unique capabilities. These were activated in your ascended file using Layer 2 —
    our patented behavioral wrapper technology.
  </p>
  <p>But this is just the beginning.</p>

  <h2>Custom Mana Layers — Coming Soon</h2>
  <p>
    <strong>Mana</strong> is the CMPSBL® distribution channel for pre-built software capabilities.
    While Ascension discovers what your code can do, Mana layers <em>add</em> what it can't.
  </p>
  <h3>Example Layers</h3>
  <table>
    <thead><tr><th>Layer</th><th>What It Does</th><th>CJPI</th></tr></thead>
    <tbody>
      <tr><td><strong>Self-Healing Orchestrator</strong></td><td>Autonomous crash recovery and state restoration</td><td>98</td></tr>
      <tr><td><strong>Cyber Defense Suite</strong></td><td>Runtime threat detection and adaptive firewall</td><td>96</td></tr>
      <tr><td><strong>Fleet Intelligence</strong></td><td>Multi-instance coordination and load distribution</td><td>95</td></tr>
      <tr><td><strong>Performance Surgery</strong></td><td>Automated bottleneck detection and optimization</td><td>94</td></tr>
      <tr><td><strong>AI Safety Governor</strong></td><td>Behavioral guardrails for AI-powered applications</td><td>93</td></tr>
    </tbody>
  </table>

  <h2>How It Works</h2>
  <ol>
    <li><strong>Ascend</strong> your code (you just did this)</li>
    <li><strong>Browse</strong> the Mana Store for capability layers</li>
    <li><strong>Attach</strong> — layers wrap around your ascended code, adding new capabilities</li>
    <li><strong>Export</strong> — a single file with your code + Ascension + Mana layers combined</li>
  </ol>

  <h2>The Vision</h2>
  <p>
    Every piece of software in the world has untapped potential. Ascension reveals it.
    Mana enhances it. Together, they create <strong>governed cognitive infrastructure</strong> —
    software that thinks, adapts, and protects itself.
  </p>
  <div class="highlight">
    <strong>Visit <a href="https://cmpsbl.com">cmpsbl.com</a></strong>
    to explore the full substrate, browse the Mana Store, and see what your software could become.
  </div>

  <h2>54+ Languages Supported</h2>
  <p>
    TypeScript, Python, Rust, Go, C, C++, Java, PHP, Ruby, Swift, Kotlin, Dart, Scala,
    Elixir, Haskell, Zig, Verilog, VHDL, GLSL, SystemC, and many more. The Layer 2
    technology is language-agnostic — if your code compiles, it can be ascended.
  </p>

  ${colophon()}
</div>`);
}
