/**
 * CMPSBL® Premium HTML Wrapper v2.0
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Universal, mobile-first, light-theme HTML document shell matching
 * the CMPSBL® site branding (EARTHSIDE theme). Used by EVERY export
 * across all substrates. Zero external dependencies.
 *
 * Design principles:
 *   - Light theme with site neon accent colors
 *   - Mobile-first responsive (320px → 2K+)
 *   - Inter + JetBrains Mono system stack
 *   - No overlapping/off-screen elements at any viewport
 *   - Print-ready with @media print
 *   - Trust signals: guarantees, verification links, professional branding
 *
 * © 2025–2026 CMPSBL® · PromptFluid™. All rights reserved.
 */

export interface PremiumDocInput {
  title: string;
  subtitle?: string;
  serial?: string;
  fingerprint?: string;
  tier?: string;
  cjpi?: number;
  generatedAt?: string;
  bodyContent: string;
  /** Which substrate produced this */
  substrate?: string;
}

const TIER_COLORS: Record<string, string> = {
  apex: 'hsl(38 92% 50%)',
  mythic: 'hsl(280 100% 55%)',
  relic: 'hsl(38 92% 50%)',
  prime: 'hsl(210 60% 45%)',
  mint: 'hsl(145 65% 42%)',
  raw: 'hsl(220 10% 40%)',
  's-tier': 'hsl(38 92% 50%)',
  'a-tier': 'hsl(38 92% 50%)',
  meta: 'hsl(38 92% 50%)',
  elite: 'hsl(280 100% 55%)',
  pro: 'hsl(210 60% 45%)',
  core: 'hsl(185 100% 40%)',
  starter: 'hsl(220 10% 40%)',
  free: 'hsl(145 65% 42%)',
};

function tierColor(tier?: string): string {
  if (!tier) return 'hsl(210 60% 45%)';
  return TIER_COLORS[tier.toLowerCase()] || 'hsl(210 60% 45%)';
}

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/** Base64-encoded CMPSBL® "C" logo mark (~5KB) for self-contained HTML exports */
const LOGO_DATA_URI = 'data:image/webp;base64,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';

export function wrapPremiumHtml(input: PremiumDocInput): string {
  const accent = tierColor(input.tier);
  const date = input.generatedAt || new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const substrateLabel = input.substrate ? `${input.substrate.toUpperCase()} Substrate` : 'CMPSBL® Substrate';

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(input.title)} — CMPSBL®</title>
<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap');

:root {
  --accent: ${accent};
  --accent-bg: ${accent.replace(')', ' / 0.06)')};
  --accent-border: ${accent.replace(')', ' / 0.2)')};
  --primary: hsl(210 60% 45%);
  --primary-bg: hsl(210 60% 45% / 0.06);
  --primary-border: hsl(210 60% 45% / 0.15);
  --neon-cyan: hsl(185 100% 40%);
  --neon-magenta: hsl(310 100% 50%);
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
  --info: hsl(210 100% 50%);
}

/* ─── Reset & Base ─── */
*, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
html { font-size: 16px; -webkit-text-size-adjust: 100%; }
body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
  background: var(--bg);
  color: var(--text);
  line-height: 1.7;
  padding: 2rem;
  max-width: 860px;
  margin: 0 auto;
  -webkit-font-smoothing: antialiased;
  word-break: break-word;
  overflow-wrap: break-word;
}

/* ─── Typography ─── */
h1 { font-size: 1.625rem; font-weight: 800; line-height: 1.2; margin-bottom: 0.5rem; letter-spacing: -0.02em; color: var(--text); }
h2 {
  font-size: 1.125rem; font-weight: 700; margin: 2.5rem 0 0.75rem;
  padding-bottom: 0.625rem; border-bottom: 2px solid var(--border);
  display: flex; align-items: center; gap: 0.5rem; color: var(--text);
}
h3 { font-size: 1rem; font-weight: 600; margin: 1.5rem 0 0.5rem; color: var(--text); }
h4 { font-size: 0.875rem; font-weight: 600; margin: 1rem 0 0.375rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; }
p { color: var(--text-secondary); margin-bottom: 0.875rem; font-size: 0.9375rem; line-height: 1.7; }
strong { color: var(--text); font-weight: 600; }

/* ─── Lists ─── */
ul, ol { padding-left: 1.5rem; margin: 0.75rem 0 1rem; }
li { margin-bottom: 0.5rem; color: var(--text-secondary); font-size: 0.9375rem; line-height: 1.6; }
li::marker { color: var(--accent); }

/* ─── Code ─── */
code {
  font-family: 'JetBrains Mono', 'SF Mono', 'Fira Code', Consolas, monospace;
  font-size: 0.8125rem;
  background: var(--primary-bg);
  color: var(--primary);
  padding: 0.2rem 0.5rem;
  border-radius: 0.375rem;
  border: 1px solid var(--primary-border);
  word-break: keep-all;
  white-space: nowrap;
}
pre {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 0.75rem;
  padding: 1.125rem 1.25rem;
  font-size: 0.8125rem;
  overflow-x: auto;
  font-family: 'JetBrains Mono', 'SF Mono', Consolas, monospace;
  line-height: 1.6;
  margin: 0.75rem 0 1rem;
  color: var(--text);
  -webkit-overflow-scrolling: touch;
}
pre code { background: none; padding: 0; white-space: pre; word-break: normal; border: none; color: var(--text); }

/* ─── Header ─── */
.doc-header {
  text-align: center;
  padding: 2.5rem 1.5rem;
  border: 1px solid var(--border);
  border-radius: 1rem;
  background: linear-gradient(135deg, var(--surface), var(--bg));
  margin-bottom: 2rem;
  position: relative;
  overflow: hidden;
}
.doc-header::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 3px;
  background: linear-gradient(90deg, var(--neon-cyan), var(--primary), var(--neon-purple));
}
.doc-issuer {
  font-size: 0.6875rem;
  letter-spacing: 0.2em;
  color: var(--text-dim);
  text-transform: uppercase;
  margin-bottom: 1rem;
  font-weight: 600;
}
.doc-title { font-size: 1.625rem; font-weight: 800; margin-bottom: 0.375rem; color: var(--text); }
.doc-subtitle { font-size: 0.9375rem; color: var(--text-muted); margin-top: 0.5rem; font-weight: 400; }
.doc-serial {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.75rem;
  color: var(--primary);
  background: var(--primary-bg);
  border: 1px solid var(--primary-border);
  padding: 0.3rem 0.85rem;
  border-radius: 0.5rem;
  display: inline-block;
  margin-top: 0.75rem;
  font-weight: 500;
}
.doc-meta {
  display: flex;
  justify-content: center;
  gap: 1.5rem;
  margin-top: 1rem;
  flex-wrap: wrap;
}
.doc-meta-item { font-size: 0.75rem; color: var(--text-dim); }
.doc-meta-item strong { color: var(--text-muted); font-weight: 600; }

/* ─── Trust Banner ─── */
.trust-banner {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 1.25rem;
  padding: 1rem 1.25rem;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 0.75rem;
  margin-bottom: 2rem;
}
.trust-item {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--text-muted);
  white-space: nowrap;
}
.trust-dot {
  width: 6px; height: 6px;
  border-radius: 50%;
  flex-shrink: 0;
}
.trust-dot.green { background: var(--success); }
.trust-dot.blue { background: var(--primary); }
.trust-dot.cyan { background: var(--neon-cyan); }

/* ─── Section ─── */
.section { margin-bottom: 2rem; }
.section-title {
  font-size: 1.0625rem;
  font-weight: 700;
  padding-bottom: 0.625rem;
  border-bottom: 2px solid var(--border);
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--text);
}
.dot {
  width: 8px; height: 8px;
  border-radius: 50%;
  background: var(--accent);
  flex-shrink: 0;
}

/* ─── Cards ─── */
.card {
  border: 1px solid var(--border);
  border-radius: 0.75rem;
  padding: 1.125rem 1.25rem;
  background: var(--surface);
  margin-bottom: 0.75rem;
}
.card-label {
  font-size: 0.6875rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--text-dim);
  margin-bottom: 0.25rem;
  font-weight: 600;
}
.card-value { font-size: 1.375rem; font-weight: 800; color: var(--text); }

/* ─── Grids ─── */
.grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }
.grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 0.75rem; }
.grid-4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.75rem; }

/* ─── Tables ─── */
table { width: 100%; border-collapse: collapse; font-size: 0.875rem; margin: 0.75rem 0; }
thead th {
  text-align: left;
  padding: 0.625rem 0.75rem;
  border-bottom: 2px solid var(--border);
  color: var(--text-muted);
  font-weight: 600;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  background: var(--surface);
}
td {
  padding: 0.625rem 0.75rem;
  border-bottom: 1px solid var(--border-subtle);
  color: var(--text-secondary);
  font-size: 0.875rem;
  word-break: keep-all;
}
tr:last-child td { border-bottom: none; }

/* ─── Badges ─── */
.badge {
  display: inline-block;
  font-size: 0.6875rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 0.2rem 0.55rem;
  border-radius: 0.375rem;
  margin-right: 0.25rem;
}
.badge-accent { background: var(--accent-bg); color: var(--accent); border: 1px solid var(--accent-border); }
.badge-success { background: hsl(145 65% 42% / 0.08); color: var(--success); border: 1px solid hsl(145 65% 42% / 0.2); }
.badge-warning { background: hsl(38 92% 50% / 0.08); color: var(--warning); border: 1px solid hsl(38 92% 50% / 0.2); }
.badge-error { background: hsl(0 70% 50% / 0.08); color: var(--error); border: 1px solid hsl(0 70% 50% / 0.2); }
.badge-info { background: hsl(210 60% 45% / 0.08); color: var(--primary); border: 1px solid var(--primary-border); }
.badge-muted { background: var(--surface); color: var(--text-dim); border: 1px solid var(--border); }

/* ─── Steps ─── */
.step-row { display: flex; align-items: flex-start; gap: 0.75rem; padding: 0.75rem 0; border-bottom: 1px solid var(--border-subtle); }
.step-row:last-child { border-bottom: none; }
.step-num {
  width: 32px; height: 32px;
  border-radius: 50%;
  background: var(--primary-bg);
  border: 1px solid var(--primary-border);
  color: var(--primary);
  display: flex; align-items: center; justify-content: center;
  font-size: 0.75rem; font-weight: 700; flex-shrink: 0;
}
.step-content { flex: 1; min-width: 0; }
.step-label { font-weight: 600; color: var(--text); font-size: 0.9375rem; }
.step-detail { color: var(--text-muted); font-size: 0.8125rem; margin-top: 0.25rem; }

/* ─── Callouts ─── */
.callout {
  border: 1px solid var(--border);
  border-left: 3px solid var(--primary);
  border-radius: 0.5rem;
  padding: 1rem 1.25rem;
  background: var(--surface);
  margin: 1rem 0;
}
.callout p { color: var(--text-secondary); }
.callout-warning { border-left-color: var(--warning); background: hsl(38 92% 50% / 0.04); }
.callout-error { border-left-color: var(--error); background: hsl(0 70% 50% / 0.04); }
.callout-success { border-left-color: var(--success); background: hsl(145 65% 42% / 0.04); }

/* ─── Guarantees ─── */
.guarantee-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.75rem;
  margin: 1rem 0;
}
.guarantee-card {
  text-align: center;
  padding: 1.25rem 1rem;
  border: 1px solid var(--border);
  border-radius: 0.75rem;
  background: var(--surface);
}
.guarantee-icon { font-size: 1.25rem; margin-bottom: 0.5rem; }
.guarantee-label { font-size: 0.75rem; font-weight: 700; color: var(--text); text-transform: uppercase; letter-spacing: 0.05em; }
.guarantee-desc { font-size: 0.6875rem; color: var(--text-muted); margin-top: 0.25rem; line-height: 1.5; }

/* ─── Footer ─── */
.doc-footer {
  text-align: center;
  padding: 2rem 1rem;
  color: var(--text-dim);
  font-size: 0.75rem;
  border-top: 2px solid var(--border);
  margin-top: 3rem;
  line-height: 1.8;
}
.doc-footer strong { color: var(--text-muted); }
.doc-footer-brand {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}
.doc-footer-brand-mark {
  font-weight: 800;
  font-size: 0.875rem;
  color: var(--text);
  letter-spacing: -0.01em;
}
.doc-footer-tagline {
  font-size: 0.6875rem;
  color: var(--text-dim);
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

/* ─── Responsive ─── */
@media (max-width: 680px) {
  body { padding: 1rem; font-size: 0.9375rem; }
  .doc-header { padding: 2rem 1.25rem; }
  .doc-title { font-size: 1.375rem; }
  .grid-2, .grid-3, .grid-4, .guarantee-grid { grid-template-columns: 1fr; }
  table { font-size: 0.8125rem; }
  thead th, td { padding: 0.5rem; }
  pre { padding: 0.875rem; font-size: 0.75rem; }
  .doc-meta { gap: 0.75rem; }
  .trust-banner { gap: 0.75rem; padding: 0.75rem 1rem; }
}
@media (max-width: 400px) {
  body { padding: 0.75rem; }
  .doc-header { padding: 1.5rem 1rem; border-radius: 0.75rem; }
  .doc-title { font-size: 1.25rem; }
  h2 { font-size: 1rem; }
  .card { padding: 0.875rem 1rem; }
}

/* ─── Print ─── */
@media print {
  body { background: white; color: hsl(220 15% 15%); padding: 0; max-width: 100%; }
  .doc-header { background: none; }
  .doc-header::before { display: none; }
  .trust-banner { display: none; }
  .card, .callout { background: hsl(220 10% 98%); }
  .badge { border: 1px solid currentColor; }
  @page { margin: 2cm; }
}
</style>
</head>
<body>

<div class="doc-header">
  <div class="doc-issuer">${esc(substrateLabel)} · Software Export</div>
  <h1 class="doc-title">${esc(input.title)}</h1>
  ${input.subtitle ? `<p class="doc-subtitle">${esc(input.subtitle)}</p>` : ''}
  ${input.serial ? `<div class="doc-serial">${esc(input.serial)}</div>` : ''}
  <div class="doc-meta">
    ${input.tier ? `<span class="doc-meta-item"><strong>Tier:</strong> ${esc(input.tier)}</span>` : ''}
    ${input.cjpi != null ? `<span class="doc-meta-item"><strong>CJPI:</strong> ${input.cjpi}/100</span>` : ''}
    <span class="doc-meta-item"><strong>Generated:</strong> ${esc(date)}</span>
  </div>
  ${input.fingerprint ? `<div style="margin-top:0.5rem;font-size:0.6875rem;color:var(--text-dim)">Fingerprint: <code style="font-size:0.625rem">${esc(input.fingerprint)}</code></div>` : ''}
</div>

<div class="trust-banner">
  <div class="trust-item"><span class="trust-dot green"></span> Zero Dependencies</div>
  <div class="trust-item"><span class="trust-dot blue"></span> Convex Core™ Sealed</div>
  <div class="trust-item"><span class="trust-dot cyan"></span> Fingerprint Verified</div>
  <div class="trust-item"><span class="trust-dot green"></span> Production Grade</div>
</div>

${input.bodyContent}

<div class="guarantee-grid">
  <div class="guarantee-card">
    <div class="guarantee-icon">🛡️</div>
    <div class="guarantee-label">IP Protected</div>
    <div class="guarantee-desc">Trade-secret sealed with Convex Core™ obfuscation</div>
  </div>
  <div class="guarantee-card">
    <div class="guarantee-icon">⚡</div>
    <div class="guarantee-label">Zero Config</div>
    <div class="guarantee-desc">Standalone artifact — copy, import, run</div>
  </div>
  <div class="guarantee-card">
    <div class="guarantee-icon">🔬</div>
    <div class="guarantee-label">Verified</div>
    <div class="guarantee-desc">Every export validated by the L2 pipeline gate</div>
  </div>
</div>

<div class="doc-footer">
  <div class="doc-footer-brand">
    <span class="doc-footer-brand-mark">CMPSBL®</span>
  </div>
  <div class="doc-footer-tagline">Governed Cognitive Infrastructure</div>
  <p style="margin-top:0.75rem">© ${new Date().getFullYear()} PromptFluid™. All rights reserved.</p>
  <p style="margin-top:0.375rem;font-size:0.625rem;color:var(--text-dim)">
    This document is a sealed export artifact. Verify at cmpsbl.com/verify · Redistribution prohibited.
  </p>
</div>

</body>
</html>`;
}

/**
 * Simplified wrapper for quick doc pages.
 */
export function wrapPremiumDocPage(title: string, bodyContent: string, options?: {
  tier?: string;
  serial?: string;
  substrate?: string;
}): string {
  return wrapPremiumHtml({
    title,
    bodyContent,
    tier: options?.tier,
    serial: options?.serial,
    substrate: options?.substrate,
  });
}
