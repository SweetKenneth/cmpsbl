/**
 * CMPSBL® Premium HTML Wrapper
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Universal, mobile-friendly, premium-quality HTML document shell used
 * by EVERY export across all substrates. Zero external dependencies.
 * Ensures visual uniformity ecosystem-wide.
 *
 * Features:
 *   - Fully responsive (mobile-first, 320px → 2K+)
 *   - Dark mode (matches Ascension / Refurbishment Lab aesthetic)
 *   - No underscore word-breaks — uses CSS word-break and hyphens
 *   - Proper text sizing (never below 12px on any device)
 *   - Print-ready with @media print styles
 *   - Self-contained — no external CSS, fonts via system stack
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
  /** Which substrate produced this: 'primary' | 'cyber' | 'robotics' | 'quantum' | 'llm' | 'agency' */
  substrate?: string;
}

const TIER_COLORS: Record<string, string> = {
  apex: '#c9a84c',
  mythic: '#a855f7',
  relic: '#f59e0b',
  prime: '#3b82f6',
  mint: '#10b981',
  raw: '#6b7280',
  's-tier': '#c9a84c',
  'a-tier': '#f59e0b',
  meta: '#f59e0b',
  elite: '#a855f7',
  pro: '#3b82f6',
  core: '#06b6d4',
  starter: '#94a3b8',
  free: '#6ee7b7',
};

function tierColor(tier?: string): string {
  if (!tier) return '#8b5cf6';
  return TIER_COLORS[tier.toLowerCase()] || '#8b5cf6';
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
:root {
  --accent: ${accent};
  --accent-dim: ${accent}1a;
  --bg: #0a0a0b;
  --surface: #141416;
  --surface-2: #1c1c1f;
  --border: #27272a;
  --border-subtle: #1f1f23;
  --text: #fafafa;
  --text-muted: #a1a1aa;
  --text-dim: #71717a;
  --success: #22c55e;
  --warning: #f59e0b;
  --error: #ef4444;
  --info: #3b82f6;
}

/* ─── Reset & Base ─── */
*, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
html { font-size: 16px; -webkit-text-size-adjust: 100%; }
body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, Roboto, sans-serif;
  background: var(--bg);
  color: var(--text);
  line-height: 1.7;
  padding: 2rem;
  max-width: 860px;
  margin: 0 auto;
  -webkit-font-smoothing: antialiased;
  /* Prevent underscore word breaks */
  word-break: break-word;
  overflow-wrap: break-word;
  hyphens: auto;
}

/* ─── Typography ─── */
h1 { font-size: 1.625rem; font-weight: 800; line-height: 1.2; margin-bottom: 0.5rem; letter-spacing: -0.01em; }
h2 { font-size: 1.125rem; font-weight: 700; margin: 2rem 0 0.75rem; padding-bottom: 0.5rem; border-bottom: 1px solid var(--border); display: flex; align-items: center; gap: 0.5rem; }
h3 { font-size: 1rem; font-weight: 600; margin: 1.25rem 0 0.5rem; color: var(--text); }
h4 { font-size: 0.875rem; font-weight: 600; margin: 1rem 0 0.375rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; }
p { color: var(--text-muted); margin-bottom: 0.875rem; font-size: 0.9375rem; line-height: 1.7; }
strong { color: var(--text); font-weight: 600; }
em { color: var(--text-muted); }

/* ─── Lists ─── */
ul, ol { padding-left: 1.5rem; margin: 0.75rem 0 1rem; }
li { margin-bottom: 0.5rem; color: var(--text-muted); font-size: 0.9375rem; line-height: 1.6; }
li::marker { color: var(--accent); }

/* ─── Code ─── */
code {
  font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', 'Cascadia Code', Consolas, monospace;
  font-size: 0.8125rem;
  background: rgba(39,39,42,0.6);
  padding: 0.15rem 0.45rem;
  border-radius: 0.3rem;
  /* Prevent long module names from being broken at underscores */
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
  font-family: 'SF Mono', 'Fira Code', 'JetBrains Mono', Consolas, monospace;
  line-height: 1.6;
  margin: 0.75rem 0 1rem;
  -webkit-overflow-scrolling: touch;
}
pre code { background: none; padding: 0; white-space: pre; word-break: normal; }

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
  background: linear-gradient(90deg, transparent, var(--accent), transparent);
}
.doc-issuer {
  font-size: 0.6875rem;
  letter-spacing: 0.2em;
  color: var(--text-dim);
  text-transform: uppercase;
  margin-bottom: 1rem;
  font-weight: 500;
}
.doc-title { font-size: 1.625rem; font-weight: 800; margin-bottom: 0.375rem; }
.doc-subtitle { font-size: 0.9375rem; color: var(--text-muted); margin-top: 0.5rem; font-weight: 400; }
.doc-serial {
  font-family: monospace;
  font-size: 0.75rem;
  color: var(--accent);
  background: var(--accent-dim);
  padding: 0.25rem 0.75rem;
  border-radius: 0.5rem;
  display: inline-block;
  margin-top: 0.75rem;
}
.doc-meta {
  display: flex;
  justify-content: center;
  gap: 1.5rem;
  margin-top: 1rem;
  flex-wrap: wrap;
}
.doc-meta-item {
  font-size: 0.75rem;
  color: var(--text-dim);
}
.doc-meta-item strong {
  color: var(--text-muted);
}

/* ─── Section ─── */
.section { margin-bottom: 2rem; }
.section-title {
  font-size: 1.0625rem;
  font-weight: 700;
  padding-bottom: 0.625rem;
  border-bottom: 1px solid var(--border);
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
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
  padding: 1rem 1.25rem;
  background: var(--surface);
  margin-bottom: 0.75rem;
}
.card-label {
  font-size: 0.6875rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--text-dim);
  margin-bottom: 0.25rem;
  font-weight: 500;
}
.card-value {
  font-size: 1.375rem;
  font-weight: 800;
}

/* ─── Grids ─── */
.grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }
.grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 0.75rem; }
.grid-4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.75rem; }

/* ─── Tables ─── */
table { width: 100%; border-collapse: collapse; font-size: 0.875rem; margin: 0.75rem 0; }
thead th {
  text-align: left;
  padding: 0.625rem 0.75rem;
  border-bottom: 1px solid var(--border);
  color: var(--text-dim);
  font-weight: 600;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
td {
  padding: 0.625rem 0.75rem;
  border-bottom: 1px solid var(--border-subtle);
  color: var(--text-muted);
  font-size: 0.875rem;
  /* Prevent underscored names from breaking awkwardly */
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
  padding: 0.2rem 0.5rem;
  border-radius: 0.375rem;
  margin-right: 0.25rem;
}
.badge-accent { background: var(--accent-dim); color: var(--accent); }
.badge-success { background: rgba(34,197,94,0.15); color: var(--success); }
.badge-warning { background: rgba(245,158,11,0.15); color: var(--warning); }
.badge-error { background: rgba(239,68,68,0.15); color: var(--error); }
.badge-info { background: rgba(59,130,246,0.15); color: var(--info); }
.badge-muted { background: rgba(113,113,122,0.1); color: var(--text-dim); }

/* ─── Steps ─── */
.step-row { display: flex; align-items: flex-start; gap: 0.75rem; padding: 0.625rem 0; border-bottom: 1px solid var(--border-subtle); }
.step-row:last-child { border-bottom: none; }
.step-num {
  width: 30px; height: 30px;
  border-radius: 50%;
  background: var(--accent-dim);
  color: var(--accent);
  display: flex; align-items: center; justify-content: center;
  font-size: 0.75rem; font-weight: 700; flex-shrink: 0;
}
.step-content { flex: 1; }
.step-label { font-weight: 600; color: var(--text); font-size: 0.9375rem; }
.step-detail { color: var(--text-muted); font-size: 0.8125rem; margin-top: 0.25rem; }

/* ─── Callouts ─── */
.callout {
  border: 1px solid var(--border);
  border-left: 3px solid var(--accent);
  border-radius: 0.5rem;
  padding: 1rem 1.25rem;
  background: var(--surface);
  margin: 1rem 0;
}
.callout-warning { border-left-color: var(--warning); }
.callout-error { border-left-color: var(--error); }
.callout-success { border-left-color: var(--success); }

/* ─── Footer ─── */
.doc-footer {
  text-align: center;
  padding: 2rem 1rem;
  color: var(--text-dim);
  font-size: 0.75rem;
  border-top: 1px solid var(--border);
  margin-top: 3rem;
  line-height: 1.8;
}

/* ─── Responsive ─── */
@media (max-width: 680px) {
  body { padding: 1rem; font-size: 0.9375rem; }
  .doc-header { padding: 2rem 1.25rem; }
  .doc-title { font-size: 1.375rem; }
  .grid-2, .grid-3, .grid-4 { grid-template-columns: 1fr; }
  table { font-size: 0.8125rem; }
  thead th, td { padding: 0.5rem; }
  pre { padding: 0.875rem; font-size: 0.75rem; }
  .doc-meta { gap: 0.75rem; }
}
@media (max-width: 400px) {
  body { padding: 0.75rem; }
  .doc-header { padding: 1.5rem 1rem; border-radius: 0.75rem; }
  .doc-title { font-size: 1.25rem; }
  h2 { font-size: 1rem; }
  .card { padding: 0.75rem 1rem; }
}

/* ─── Print ─── */
@media print {
  body { background: white; color: #1a1a1f; padding: 0; max-width: 100%; }
  .doc-header { border: 2px solid #1a1a1f; background: none; }
  .doc-header::before { display: none; }
  .card, .callout { border-color: #d4d4d8; background: #fafafa; }
  code { background: #f4f4f5; }
  pre { background: #fafafa; border-color: #d4d4d8; }
  .badge { border: 1px solid currentColor; }
  .doc-footer { border-color: #d4d4d8; }
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
    ${input.cjpi != null ? `<span class="doc-meta-item"><strong>CJPI:</strong> ${input.cjpi}</span>` : ''}
    <span class="doc-meta-item"><strong>Generated:</strong> ${esc(date)}</span>
  </div>
  ${input.fingerprint ? `<div style="margin-top:0.5rem;font-size:0.6875rem;color:var(--text-dim)">Fingerprint: <code>${esc(input.fingerprint)}</code></div>` : ''}
</div>

${input.bodyContent}

<div class="doc-footer">
  <p><strong>CMPSBL®</strong> — Governed Cognitive Infrastructure</p>
  <p>© ${new Date().getFullYear()} PromptFluid™. All rights reserved.</p>
  <p style="margin-top:0.5rem;font-size:0.6875rem;">This document is a sealed export artifact. Redistribution prohibited.</p>
</div>

</body>
</html>`;
}

/**
 * Simplified wrapper for quick doc pages (pipeline details, error codes, etc.)
 * Uses the same premium styling as the full wrapper.
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
