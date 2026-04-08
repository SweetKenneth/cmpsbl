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

/**
 * The canonical premium HTML wrapper.
 * Every export HTML document in the ecosystem MUST use this.
 */
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
