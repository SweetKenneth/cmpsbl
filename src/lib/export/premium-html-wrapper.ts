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

/** Base64-encoded CMPSBL® "C" logo mark — current futuristic C design */
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
  <img src="${LOGO_DATA_URI}" alt="CMPSBL" width="40" height="40" style="margin-bottom:0.75rem;border-radius:8px;" />
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
    <img src="${LOGO_DATA_URI}" alt="CMPSBL" width="24" height="24" style="border-radius:4px;" />
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
