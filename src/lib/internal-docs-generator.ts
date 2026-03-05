/**
 * Internal Documentation Generator — Memory Stream Themed HTML
 * Produces beautiful, downloadable HTML documents for internal substrate documentation.
 * All docs use the Memory Stream dark theme with cyan/violet identity.
 */

const THEME_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;900&family=JetBrains+Mono:wght@400;500&display=swap');

:root {
  --bg: #0a0e1a;
  --bg-card: #0f1629;
  --bg-accent: #141b2d;
  --border: #1a2744;
  --border-glow: rgba(34,211,238,0.15);
  --cyan: #22d3ee;
  --cyan-dim: rgba(34,211,238,0.10);
  --violet: #8b5cf6;
  --violet-dim: rgba(139,92,246,0.10);
  --magenta: #d946ef;
  --magenta-dim: rgba(217,70,239,0.08);
  --text: #e2e8f0;
  --text-muted: #94a3b8;
  --text-dim: #64748b;
  --emerald: #10b981;
  --amber: #f59e0b;
  --rose: #f43f5e;
  --sky: #38bdf8;
}

* { margin: 0; padding: 0; box-sizing: border-box; }

body {
  font-family: 'Inter', -apple-system, sans-serif;
  background: var(--bg);
  color: var(--text);
  line-height: 1.75;
  font-size: 15px;
  -webkit-font-smoothing: antialiased;
}

.doc-container { max-width: 900px; margin: 0 auto; padding: 60px 48px; }

/* ─── Cover ─── */
.cover {
  min-height: 90vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  position: relative;
  overflow: hidden;
}
.cover::before {
  content: '';
  position: absolute;
  top: 10%;
  left: -20%;
  width: 600px;
  height: 600px;
  background: radial-gradient(circle, var(--cyan-dim) 0%, transparent 65%);
  border-radius: 50%;
  pointer-events: none;
  animation: float 12s ease-in-out infinite;
}
.cover::after {
  content: '';
  position: absolute;
  bottom: 15%;
  right: -15%;
  width: 500px;
  height: 500px;
  background: radial-gradient(circle, var(--violet-dim) 0%, transparent 65%);
  border-radius: 50%;
  pointer-events: none;
  animation: float 15s ease-in-out infinite reverse;
}
@keyframes float {
  0%, 100% { transform: translate(0, 0); }
  50% { transform: translate(20px, -20px); }
}

.cover-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 18px;
  border: 1px solid var(--border);
  border-radius: 9999px;
  font-size: 10px;
  color: var(--cyan);
  margin-bottom: 36px;
  width: fit-content;
  text-transform: uppercase;
  letter-spacing: 3px;
  font-weight: 600;
  backdrop-filter: blur(8px);
}
.cover-badge .dot {
  width: 6px; height: 6px;
  background: var(--cyan);
  border-radius: 50%;
  animation: pulse 2s ease-in-out infinite;
  box-shadow: 0 0 8px var(--cyan);
}
@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }

.cover-classification {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 14px;
  border: 1px solid rgba(244,63,94,0.3);
  border-radius: 9999px;
  font-size: 10px;
  color: var(--rose);
  margin-bottom: 20px;
  width: fit-content;
  text-transform: uppercase;
  letter-spacing: 2px;
  font-weight: 600;
  background: rgba(244,63,94,0.06);
}

h1 {
  font-size: 56px;
  font-weight: 900;
  letter-spacing: -2.5px;
  margin-bottom: 16px;
  line-height: 1.05;
}
h1 .gradient {
  background: linear-gradient(135deg, var(--cyan), var(--violet), var(--magenta));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-size: 200% 200%;
  animation: gradientShift 6s ease-in-out infinite;
}
@keyframes gradientShift {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

.cover-subtitle {
  font-size: 20px;
  color: var(--text-muted);
  max-width: 620px;
  margin-bottom: 48px;
  line-height: 1.65;
  font-weight: 300;
}

.meta-line {
  font-size: 12px;
  color: var(--text-dim);
  line-height: 1.8;
}
.meta-line a { color: var(--cyan); text-decoration: none; }

/* ─── Headings ─── */
h2 {
  font-size: 28px;
  font-weight: 800;
  margin: 56px 0 20px;
  color: var(--text);
  letter-spacing: -0.5px;
  padding-bottom: 14px;
  border-bottom: 1px solid var(--border);
  position: relative;
}
h2::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 0;
  width: 60px;
  height: 2px;
  background: linear-gradient(90deg, var(--cyan), var(--violet));
  border-radius: 2px;
}

h3 {
  font-size: 18px;
  font-weight: 600;
  margin: 36px 0 12px;
  color: var(--cyan);
  letter-spacing: -0.3px;
}

h4 {
  font-size: 15px;
  font-weight: 600;
  margin: 24px 0 8px;
  color: var(--text);
}

p { margin: 12px 0; color: var(--text-muted); }
strong { color: var(--text); font-weight: 600; }

/* ─── Cards & Surfaces ─── */
.card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 28px;
  margin: 20px 0;
  transition: border-color 0.3s;
}
.card:hover { border-color: var(--border-glow); }

.card-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin: 24px 0;
}

.highlight {
  background: linear-gradient(135deg, var(--cyan-dim), var(--violet-dim));
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 32px;
  margin: 32px 0;
  position: relative;
  overflow: hidden;
}
.highlight::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 2px;
  background: linear-gradient(90deg, var(--cyan), var(--violet), var(--magenta));
}

.warning {
  background: rgba(245,158,11,0.06);
  border: 1px solid rgba(245,158,11,0.2);
  border-radius: 12px;
  padding: 20px 24px;
  margin: 20px 0;
  font-size: 14px;
}
.warning-label {
  color: var(--amber);
  font-weight: 700;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  margin-bottom: 8px;
}

.secret-box {
  background: rgba(244,63,94,0.04);
  border: 1px solid rgba(244,63,94,0.15);
  border-radius: 12px;
  padding: 20px 24px;
  margin: 20px 0;
  font-size: 14px;
}
.secret-label {
  color: var(--rose);
  font-weight: 700;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  margin-bottom: 8px;
}

/* ─── Code ─── */
code {
  font-family: 'JetBrains Mono', monospace;
  background: var(--bg-accent);
  padding: 2px 7px;
  border-radius: 5px;
  font-size: 13px;
  color: var(--cyan);
}

pre {
  background: var(--bg-accent);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 24px;
  margin: 20px 0;
  overflow-x: auto;
  position: relative;
}
pre::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--border-glow), transparent);
}
pre code {
  background: none;
  padding: 0;
  font-size: 13px;
  color: var(--text);
  line-height: 1.7;
}

/* ─── Tables ─── */
table {
  width: 100%;
  border-collapse: collapse;
  margin: 20px 0;
  font-size: 14px;
}
th {
  text-align: left;
  padding: 12px 16px;
  background: var(--bg-accent);
  color: var(--cyan);
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  font-weight: 600;
  border-bottom: 2px solid var(--border);
}
td {
  padding: 12px 16px;
  border-bottom: 1px solid var(--border);
  color: var(--text-muted);
}
tr:hover td { background: var(--bg-card); }

/* ─── Lists ─── */
.checklist { list-style: none; padding: 0; }
.checklist li {
  padding: 10px 0;
  font-size: 14px;
  color: var(--text-muted);
  display: flex;
  align-items: flex-start;
  gap: 12px;
}
.checklist li::before {
  content: '◈';
  color: var(--cyan);
  font-weight: 700;
  flex-shrink: 0;
  font-size: 12px;
  margin-top: 2px;
}

ul:not(.checklist) { padding-left: 24px; margin: 12px 0; }
ul:not(.checklist) li {
  padding: 4px 0;
  color: var(--text-muted);
  font-size: 14px;
}
ul:not(.checklist) li::marker { color: var(--text-dim); }

ol { padding-left: 24px; margin: 12px 0; }
ol li { padding: 4px 0; color: var(--text-muted); font-size: 14px; }

/* ─── TOC ─── */
.toc {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 32px;
  margin: 40px 0;
}
.toc h3 { color: var(--text); margin-top: 0; font-size: 14px; text-transform: uppercase; letter-spacing: 2px; }
.toc ol { padding-left: 20px; }
.toc li { padding: 6px 0; color: var(--text-muted); font-size: 14px; }
.toc a { color: var(--cyan); text-decoration: none; transition: color 0.2s; }
.toc a:hover { color: var(--text); }

/* ─── Metrics ─── */
.metric-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 16px;
  margin: 24px 0;
}
.metric-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 20px;
  text-align: center;
}
.metric-value {
  font-size: 32px;
  font-weight: 800;
  letter-spacing: -1px;
  background: linear-gradient(135deg, var(--cyan), var(--violet));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
.metric-label {
  font-size: 11px;
  color: var(--text-dim);
  text-transform: uppercase;
  letter-spacing: 1.5px;
  margin-top: 6px;
}

/* ─── State machine ─── */
.state-flow {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  margin: 20px 0;
  padding: 24px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 12px;
}
.state-node {
  padding: 8px 18px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  font-family: 'JetBrains Mono', monospace;
}
.state-closed { background: rgba(16,185,129,0.12); color: var(--emerald); border: 1px solid rgba(16,185,129,0.25); }
.state-open { background: rgba(244,63,94,0.12); color: var(--rose); border: 1px solid rgba(244,63,94,0.25); }
.state-half { background: rgba(245,158,11,0.12); color: var(--amber); border: 1px solid rgba(245,158,11,0.25); }
.state-arrow { color: var(--text-dim); font-size: 18px; }

/* ─── Tier badges ─── */
.tier-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 12px;
  margin: 24px 0;
}
.tier-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 20px 16px;
  text-align: center;
  transition: border-color 0.3s, transform 0.2s;
}
.tier-card:hover { transform: translateY(-2px); }
.tier-name { font-size: 16px; font-weight: 800; margin-bottom: 4px; }
.tier-range { font-size: 12px; color: var(--text-dim); }
.tier-s { border-color: rgba(244,63,94,0.3); }
.tier-s .tier-name { color: var(--rose); }
.tier-a { border-color: rgba(139,92,246,0.3); }
.tier-a .tier-name { color: var(--violet); }
.tier-b { border-color: rgba(56,189,248,0.3); }
.tier-b .tier-name { color: var(--sky); }
.tier-c { border-color: rgba(245,158,11,0.3); }
.tier-c .tier-name { color: var(--amber); }
.tier-d { border-color: rgba(100,116,139,0.3); }
.tier-d .tier-name { color: var(--text-dim); }

/* ─── Footer ─── */
.doc-footer {
  text-align: center;
  padding: 48px 0 32px;
  font-size: 12px;
  color: var(--text-dim);
  border-top: 1px solid var(--border);
  margin-top: 64px;
}
.doc-footer .brand {
  font-weight: 800;
  letter-spacing: 2px;
  background: linear-gradient(135deg, var(--cyan), var(--violet));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  font-size: 14px;
}

/* ─── Stream lines (decorative) ─── */
.stream-line {
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--cyan-dim), var(--violet-dim), transparent);
  margin: 48px 0;
}

@media (max-width: 700px) {
  .doc-container { padding: 32px 20px; }
  h1 { font-size: 36px; }
  .card-grid, .metric-grid { grid-template-columns: 1fr; }
  .tier-grid { grid-template-columns: repeat(3, 1fr); }
}

@media print {
  body { background: #fff; color: #1a1a2e; }
  .cover::before, .cover::after { display: none; }
  code { color: #0891b2; background: #f1f5f9; }
  .card, pre, .toc, .highlight { border-color: #e2e8f0; background: #f8fafc; }
  th { background: #f1f5f9; color: #0891b2; }
  td { border-color: #e2e8f0; color: #475569; }
  .metric-value { color: #0891b2; -webkit-text-fill-color: #0891b2; }
  h1 .gradient { -webkit-text-fill-color: #0891b2; }
}
`;

function wrapDoc(title: string, classification: string, body: string): string {
  const date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${title} — CMPSBL® Internal Documentation</title>
<style>${THEME_CSS}</style>
</head>
<body>
${body}
<div class="doc-container">
  <div class="doc-footer">
    <div class="brand">CMPSBL®</div>
    <p style="margin-top:8px;">Signal → Silicon · Memory Stream Internal Documentation</p>
    <p style="margin-top:4px;">Generated ${date} · Classification: ${classification}</p>
    <p style="margin-top:4px;">© 2025–2026 CMPSBL®. All rights reserved. Confidential — Trade Secret.</p>
  </div>
</div>
</body>
</html>`;
}

// ═══════════════════════════════════════════════════════════════
// 1. AUTONOMOUS FOUNDRY
// ═══════════════════════════════════════════════════════════════

export function generateFoundryDoc(): string {
  return wrapDoc('Autonomous Software Foundry', 'TRADE SECRET', `
<div class="doc-container cover">
  <div class="cover-classification">🔒 Internal — Trade Secret</div>
  <div class="cover-badge"><div class="dot"></div> Document 20 · Memory Stream Architecture</div>
  <h1>Autonomous Software<br/><span class="gradient">Foundry</span></h1>
  <p class="cover-subtitle">
    The substrate's recursive capability discovery and manufacturing system.
    A closed-loop reactor that crystallizes latent capabilities from the 38-node topology
    into scored, tiered, deduplicated software discoveries.
  </p>
  <p class="meta-line">
    CMPSBL® Memory Stream · IRONCLAD Epoch<br/>
    DOI Published · Investor-Visible Architecture
  </p>
</div>

<div class="doc-container">
  <div class="toc">
    <h3>Contents</h3>
    <ol>
      <li><a href="#purpose">Purpose & Scope</a></li>
      <li><a href="#architecture">Reactor Architecture</a></li>
      <li><a href="#cjpi">CJPI Scoring Model</a></li>
      <li><a href="#module-discovery">Module Self-Discovery</a></li>
      <li><a href="#vault">S-Tier Vault Integration</a></li>
      <li><a href="#standalone">Standalone Packaging</a></li>
      <li><a href="#metrics">Production Metrics</a></li>
      <li><a href="#classification">Security Classification</a></li>
    </ol>
  </div>

  <h2 id="purpose">1. Purpose & Scope</h2>
  <p>The Autonomous Software Foundry is the substrate's <strong>Crown Jewel</strong> — a recursive capability discovery and manufacturing system. Once triggered, it operates without human intervention until the exploration space is exhausted or the time budget expires.</p>

  <div class="highlight">
    <p style="font-size:17px;font-weight:300;line-height:1.8;">
      <strong style="color:var(--cyan);">Signal → Silicon:</strong> The Foundry transforms raw topology signals into
      production-grade software discoveries. Each discovery is scored, tiered, deduplicated, and
      persisted to the S-Tier Vault — creating a verifiable ledger of autonomous software production.
    </p>
  </div>

  <h3>What the Foundry Does</h3>
  <ul class="checklist">
    <li><strong>Discovers</strong> latent capabilities by combinatorially exploring the 38-node topology</li>
    <li><strong>Scores</strong> each discovered capability using CJPI (Crown Jewel Pipeline Index)</li>
    <li><strong>Tiers</strong> discoveries into Apex / Mythic / Relic / Prime / Mint quality bands</li>
    <li><strong>Ranks</strong> discoveries within each tier by composite score</li>
    <li><strong>Deduplicates</strong> semantically equivalent discoveries (cosine &gt; 0.92)</li>
    <li><strong>Persists</strong> validated discoveries to the S-Tier Vault (governor-only access)</li>
  </ul>

  <div class="stream-line"></div>

  <h2 id="architecture">2. Reactor Architecture</h2>
  <h3>Core Loop</h3>
  <pre><code>while (budget_remaining && candidates_exist) {
  candidate = generate_candidate(topology, module_combinations)
  score     = cjpi_score(candidate)
  tier      = auto_tier(score)

  if (!is_duplicate(candidate, existing_discoveries)) {
    persist(candidate, score, tier)
  }
}</code></pre>

  <h3>Key Parameters</h3>
  <table>
    <tr><th>Parameter</th><th>Value</th><th>Description</th></tr>
    <tr><td>Exploration breadth</td><td>38 nodes × combinatorial chains</td><td>Full topology coverage</td></tr>
    <tr><td>Scoring</td><td>CJPI (4-factor composite)</td><td>Novelty, utility, complexity, composability</td></tr>
    <tr><td>Deduplication</td><td>Cosine &gt; 0.92 = duplicate</td><td>Semantic similarity threshold</td></tr>
    <tr><td>Time budget</td><td>8–12 hours (full sweep)</td><td>Configurable per reactor run</td></tr>
  </table>

  <h3>Candidate Generation Strategy</h3>
  <div class="card">
    <p><strong>Depth 2:</strong> All pairwise module combinations (38 × 37 = 1,406 pairs)</p>
    <p><strong>Depth 3:</strong> Filtered triples — high-affinity pairs extended by one hop</p>
    <p><strong>Depth 4–5:</strong> Only extends from top-scoring depth-3 chains</p>
    <p style="margin-top:12px;font-size:13px;color:var(--text-dim);">
      This pruning strategy keeps the search space manageable (~50,000 evaluable candidates)
      while ensuring coverage of the full topology.
    </p>
  </div>

  <div class="stream-line"></div>

  <h2 id="cjpi">3. CJPI Scoring Model</h2>
  <p>The Crown Jewel Pipeline Index is a 0–100 composite score derived from four weighted factors:</p>

  <table>
    <tr><th>Factor</th><th>Weight</th><th>Description</th></tr>
    <tr><td>Novelty</td><td><code>0.25</code></td><td>Distance from existing capabilities in semantic space</td></tr>
    <tr><td>Utility</td><td><code>0.30</code></td><td>Practical value heuristic based on module composition</td></tr>
    <tr><td>Complexity</td><td><code>0.20</code></td><td>Sophistication of the module chain (depth × diversity)</td></tr>
    <tr><td>Composability</td><td><code>0.25</code></td><td>Ability to chain with other capabilities</td></tr>
  </table>

  <pre><code>CJPI = (0.25 × novelty + 0.30 × utility + 0.20 × complexity + 0.25 × composability) × 100</code></pre>

  <h3>Tier Thresholds</h3>
  <div class="tier-grid">
    <div class="tier-card tier-s"><div class="tier-name">Apex</div><div class="tier-range">CJPI ≥ 85</div></div>
    <div class="tier-card tier-a"><div class="tier-name">Mythic</div><div class="tier-range">CJPI ≥ 70</div></div>
    <div class="tier-card tier-b"><div class="tier-name">Relic</div><div class="tier-range">CJPI ≥ 55</div></div>
    <div class="tier-card tier-c"><div class="tier-name">Prime</div><div class="tier-range">CJPI ≥ 40</div></div>
    <div class="tier-card tier-d"><div class="tier-name">Mint</div><div class="tier-range">CJPI &lt; 40</div></div>
  </div>

  <div class="secret-box">
    <div class="secret-label">🔒 Trade Secret</div>
    <p style="margin:0;color:var(--text-muted);font-size:14px;">
      CJPI weights, utility heuristic factors, and threshold values are internal.
      Utility heuristics include bonuses for NEXUS routing (+0.15), BRAIN/MEMORY cognitive (+0.10),
      DEFENSE security (+0.10), and cross-zone chains (+0.20).
    </p>
  </div>

  <div class="stream-line"></div>

  <h2 id="module-discovery">4. Module Self-Discovery</h2>
  <p>Beyond the reactor's combinatorial search, each module runs its own introspective discovery process:</p>

  <ol>
    <li>Module enumerates all registered actions</li>
    <li>Runs each action with synthetic inputs</li>
    <li>Observes emergent behaviors (unexpected output patterns)</li>
    <li>Reports emergent capabilities to the reactor for scoring</li>
    <li>CJPI scoring is applied to self-discovered capabilities identically</li>
  </ol>

  <div class="card">
    <h4>Emergent Capability Definition</h4>
    <p>An "emergent capability" is an action that:</p>
    <ul class="checklist">
      <li>Produces output significantly different from its documented behavior</li>
      <li>Chains with another module's action to produce a novel combined effect</li>
      <li>Demonstrates learning — output quality improves with repeated invocation</li>
    </ul>
  </div>

  <div class="stream-line"></div>

  <h2 id="vault">5. S-Tier Vault Integration</h2>
  <p>The S-Tier Vault is the governor-only repository of validated Apex discoveries.
  Discoveries flow from the reactor → vault → export system.</p>

  <div class="card-grid">
    <div class="card">
      <h4 style="margin-top:0;">Registry</h4>
      <p>Paginated list with real-time search, tier filtering, score range slider, and inline detail expansion.</p>
    </div>
    <div class="card">
      <h4 style="margin-top:0;">Export</h4>
      <p>ZIP packages with manifest, standalone runtime, standalone discovery engine, and README.</p>
    </div>
  </div>

  <div class="stream-line"></div>

  <h2 id="standalone">6. Standalone Packaging</h2>
  <p>A fully portable version of the discovery reactor operates without the full substrate:</p>
  <ul class="checklist">
    <li>Packaged as a single TypeScript file</li>
    <li>Pairs with standalone runtime for CJPI scoring</li>
    <li>Can re-score, re-tier, and re-rank any discovery manifest</li>
    <li>Included in every S-Tier Vault ZIP export</li>
  </ul>

  <div class="stream-line"></div>

  <h2 id="metrics">7. Production Metrics</h2>
  <div class="metric-grid">
    <div class="metric-card"><div class="metric-value">1,143+</div><div class="metric-label">Total Discoveries</div></div>
    <div class="metric-card"><div class="metric-value">~120</div><div class="metric-label">Apex-Tier</div></div>
    <div class="metric-card"><div class="metric-value">130/hr</div><div class="metric-label">Discovery Rate</div></div>
    <div class="metric-card"><div class="metric-value">89.2</div><div class="metric-label">Avg CJPI (Apex)</div></div>
    <div class="metric-card"><div class="metric-value">400+</div><div class="metric-label">Unique Chains</div></div>
  </div>

  <div class="stream-line"></div>

  <h2 id="classification">8. Security Classification</h2>
  <table>
    <tr><th>Component</th><th>Classification</th></tr>
    <tr><td>Reactor source code</td><td><strong style="color:var(--rose);">Trade Secret</strong> — never exposed</td></tr>
    <tr><td>CJPI scoring formula</td><td><strong style="color:var(--rose);">Trade Secret</strong> — weights internal</td></tr>
    <tr><td>S-Tier Vault</td><td><strong style="color:var(--amber);">Governor-only</strong> — no public API</td></tr>
    <tr><td>Discovery Engine</td><td>Included in exports (obfuscated)</td></tr>
    <tr><td>Foundry existence & metrics</td><td><strong style="color:var(--emerald);">Public</strong> — DOI published</td></tr>
    <tr><td>Memory Stream page</td><td><strong style="color:var(--emerald);">Public</strong> — proof metrics only</td></tr>
  </table>
</div>
  `);
}

// ═══════════════════════════════════════════════════════════════
// 2. DISCOVERY ENGINE INTERNALS
// ═══════════════════════════════════════════════════════════════

export function generateDiscoveryEngineDoc(): string {
  return wrapDoc('Discovery Engine Internals', 'TRADE SECRET', `
<div class="doc-container cover">
  <div class="cover-classification">🔒 Internal — Trade Secret</div>
  <div class="cover-badge"><div class="dot"></div> Document 21 · Reactor Architecture</div>
  <h1>Discovery<br/><span class="gradient">Engine</span></h1>
  <p class="cover-subtitle">
    The recursive reactor at the heart of the Autonomous Software Foundry.
    The substrate's most commercially sensitive algorithm after the SEBA promotion pipeline.
  </p>
  <p class="meta-line">
    CMPSBL® Memory Stream · IRONCLAD Epoch<br/>
    Crown Jewel Pipeline Index · Structural Fingerprinting
  </p>
</div>

<div class="doc-container">
  <div class="toc">
    <h3>Contents</h3>
    <ol>
      <li><a href="#reactor">Reactor Architecture</a></li>
      <li><a href="#candidates">Candidate Generation</a></li>
      <li><a href="#dedup">Semantic Deduplication</a></li>
      <li><a href="#cjpi-detail">CJPI Scoring Detail</a></li>
      <li><a href="#fingerprinting">Structural Fingerprinting</a></li>
      <li><a href="#self-discovery">Module Self-Discovery</a></li>
      <li><a href="#standalone">Standalone Packaging</a></li>
      <li><a href="#performance">Performance Characteristics</a></li>
      <li><a href="#integration">Integration Points</a></li>
    </ol>
  </div>

  <h2 id="reactor">1. Reactor Architecture</h2>
  <h3>Core Loop</h3>
  <pre><code>Input:  38-node topology graph
Output: Scored, tiered, deduplicated capability manifest

1. Generate candidate pool from module combinations (depth 2–5)
2. For each candidate:
   a. Compute semantic signature (embedding hash)
   b. Compute structural fingerprint (SHA-256, epoch-scoped)
   c. Check deduplication index (cosine > 0.92 = skip)
   d. Score via CJPI (4-factor weighted composite)
   e. Auto-tier based on score thresholds
   f. Persist to discovery table with immutable fingerprint
3. Rank within each tier
4. Emit discovery event to RIPPLE</code></pre>

  <div class="stream-line"></div>

  <h2 id="candidates">2. Candidate Generation</h2>
  <p>Candidates are generated by walking the dependency graph with progressive pruning:</p>

  <div class="card">
    <table>
      <tr><th>Depth</th><th>Strategy</th><th>Candidate Volume</th></tr>
      <tr><td>2</td><td>All pairwise module combinations</td><td>~1,406 pairs</td></tr>
      <tr><td>3</td><td>High-affinity pairs extended by one hop</td><td>~8,000 triples</td></tr>
      <tr><td>4–5</td><td>Only extends from top-scoring depth-3</td><td>~40,000 chains</td></tr>
    </table>
    <p style="margin-top:12px;font-size:13px;color:var(--text-dim);">
      Total evaluable space: ~50,000 candidates. Pruning ensures coverage without combinatorial explosion.
    </p>
  </div>

  <div class="stream-line"></div>

  <h2 id="dedup">3. Semantic Deduplication</h2>
  <p>Each candidate receives a semantic signature for deduplication:</p>

  <pre><code>signature = embed(name + description + module_chain.join('→'))</code></pre>

  <table>
    <tr><th>Cosine Similarity</th><th>Classification</th><th>Action</th></tr>
    <tr><td>&gt; 0.92</td><td><strong style="color:var(--rose);">Duplicate</strong></td><td>Skip entirely</td></tr>
    <tr><td>0.80–0.92</td><td><strong style="color:var(--amber);">Variant</strong></td><td>Persist with <code>variant_of</code> reference</td></tr>
    <tr><td>&lt; 0.80</td><td><strong style="color:var(--emerald);">Novel</strong></td><td>Persist as new discovery</td></tr>
  </table>

  <div class="stream-line"></div>

  <h2 id="cjpi-detail">4. CJPI Scoring Detail</h2>

  <div class="secret-box">
    <div class="secret-label">🔒 Trade Secret — Scoring Formula</div>
    <pre style="border:none;margin:12px 0 0;background:transparent;padding:0;"><code>novelty      = 1 - max(cosine_similarity(candidate, existing_set))
utility      = heuristic_utility_score(description, module_chain)
complexity   = chain_depth × dependency_diversity × integration_score
composability = count(compatible_extensions) / max_possible_extensions

CJPI = (0.25 × novelty + 0.30 × utility + 0.20 × complexity + 0.25 × composability) × 100</code></pre>
  </div>

  <h3>Utility Heuristic Factors</h3>
  <table>
    <tr><th>Condition</th><th>Bonus</th></tr>
    <tr><td>Presence of NEXUS (routing)</td><td><code>+0.15</code></td></tr>
    <tr><td>Presence of BRAIN/MEMORY (cognitive)</td><td><code>+0.10</code></td></tr>
    <tr><td>Presence of DEFENSE (security)</td><td><code>+0.10</code></td></tr>
    <tr><td>Cross-zone chains (e.g., ESZ→EMZ)</td><td><code>+0.20</code></td></tr>
  </table>

  <div class="stream-line"></div>

  <h2 id="fingerprinting">5. Structural Fingerprinting</h2>
  <p>Every discovery receives an immutable SHA-256 structural fingerprint derived from its pipeline architecture:</p>

  <div class="highlight">
    <p style="font-size:15px;line-height:1.8;margin:0;">
      <strong style="color:var(--cyan);">Identity Rule:</strong> Fingerprint = SHA-256(canonical({steps, epoch})).
      Steps are ordered, capability-aware <code>PipelineStep[]</code>.
      CJPI, name, and category are <strong>excluded</strong> from identity.
      Epoch defaults to <code>SPARTA</code> and is configurable without code changes.
    </p>
  </div>

  <h3>Fingerprint Properties</h3>
  <ul class="checklist">
    <li><strong>Immutable:</strong> Once set, never overwritten. SQL guard: <code>WHERE pipeline_fingerprint IS NULL</code></li>
    <li><strong>Deterministic:</strong> Recursive key sorting ensures identical hashes across environments</li>
    <li><strong>Epoch-scoped:</strong> Epoch rotation (SPARTA → ATHENA → TITAN) invalidates all fingerprints</li>
    <li><strong>Cryptographic:</strong> WebCrypto SHA-256 only — no fallback hashing allowed</li>
  </ul>

  <div class="stream-line"></div>

  <h2 id="self-discovery">6. Module Self-Discovery</h2>
  <ol>
    <li>Module enumerates all registered actions</li>
    <li>Runs each action with synthetic inputs</li>
    <li>Observes emergent behaviors (unexpected output patterns)</li>
    <li>Reports emergent capabilities to the reactor for scoring</li>
    <li>CJPI scoring applied identically to self-discovered capabilities</li>
  </ol>

  <div class="stream-line"></div>

  <h2 id="standalone">7. Standalone Packaging</h2>
  <div class="card-grid">
    <div class="card">
      <h4 style="margin-top:0;">Standalone Runtime</h4>
      <p>Micro-substrate providing CJPI scoring, auto-tiering, and sequential chain execution. Zero external dependencies.</p>
    </div>
    <div class="card">
      <h4 style="margin-top:0;">Standalone Discovery Engine</h4>
      <p>Portable reactor that can ingest a manifest and re-score/re-tier. Included in every Vault ZIP export.</p>
    </div>
  </div>

  <div class="stream-line"></div>

  <h2 id="performance">8. Performance Characteristics</h2>
  <div class="metric-grid">
    <div class="metric-card"><div class="metric-value">500/s</div><div class="metric-label">Candidate Gen Rate</div></div>
    <div class="metric-card"><div class="metric-value">~2ms</div><div class="metric-label">CJPI Latency</div></div>
    <div class="metric-card"><div class="metric-value">~5ms</div><div class="metric-label">Dedup Check</div></div>
    <div class="metric-card"><div class="metric-value">8–12h</div><div class="metric-label">Full Sweep</div></div>
    <div class="metric-card"><div class="metric-value">~30m</div><div class="metric-label">Incremental Sweep</div></div>
  </div>

  <div class="stream-line"></div>

  <h2 id="integration">9. Integration Points</h2>
  <table>
    <tr><th>System</th><th>Role</th></tr>
    <tr><td>RIPPLE</td><td>Discovery events emitted for real-time streaming</td></tr>
    <tr><td>AUDIT</td><td>All discoveries logged to immutable Merkle audit chain</td></tr>
    <tr><td>ECONOMY</td><td>Cost tracking for AI-assisted scoring</td></tr>
    <tr><td>CORTEX</td><td>Pipeline orchestration for multi-step discovery chains</td></tr>
    <tr><td>GOVERNANCE</td><td>Policy validation of discovered capabilities</td></tr>
  </table>
</div>
  `);
}

// ═══════════════════════════════════════════════════════════════
// 3. PROPRIETARY ALGORITHMS
// ═══════════════════════════════════════════════════════════════

export function generateAlgorithmsDoc(): string {
  return wrapDoc('Proprietary Algorithms', 'TRADE SECRET', `
<div class="doc-container cover">
  <div class="cover-classification">🔒 Internal — Trade Secret</div>
  <div class="cover-badge"><div class="dot"></div> Document 02 · Algorithmic Foundations</div>
  <h1>Proprietary<br/><span class="gradient">Algorithms</span></h1>
  <p class="cover-subtitle">
    The mathematical and logical foundations that drive substrate behavior.
    Every scoring model, computation contract, and state machine documented
    in a single authoritative reference.
  </p>
  <p class="meta-line">CMPSBL® Memory Stream · Signal → Silicon</p>
</div>

<div class="doc-container">
  <div class="toc">
    <h3>Contents</h3>
    <ol>
      <li><a href="#integrity">3-Lane Integrity Scoring</a></li>
      <li><a href="#clockless">Clockless Execution Model</a></li>
      <li><a href="#sm2">SM-2 Spaced Repetition + RPS</a></li>
      <li><a href="#memory-tiers">Memory Tier Architecture</a></li>
      <li><a href="#breakers">Circuit Breaker State Machine</a></li>
      <li><a href="#cascade">Cascade Containment</a></li>
      <li><a href="#merkle">Merkle Audit Chain</a></li>
      <li><a href="#routing">Cognitive Load Balancing</a></li>
      <li><a href="#evolution">Evolution Confidence Scoring</a></li>
      <li><a href="#coalescing">Request Deduplication</a></li>
      <li><a href="#health">SLO-Based Health Grading</a></li>
    </ol>
  </div>

  <h2 id="integrity">1. 3-Lane Integrity Scoring</h2>
  <p>The substrate uses a 3-lane integrity model replacing the legacy single-scalar WMI:</p>

  <div class="card-grid">
    <div class="card" style="border-left:3px solid var(--emerald);">
      <h4 style="margin-top:0;color:var(--emerald);">Availability</h4>
      <p>Uptime + breaker penalties + quarantine status</p>
    </div>
    <div class="card" style="border-left:3px solid var(--cyan);">
      <h4 style="margin-top:0;color:var(--cyan);">Correctness</h4>
      <p>Error rate + validation failures + contradiction signals</p>
    </div>
  </div>
  <div class="card" style="border-left:3px solid var(--violet);max-width:calc(50% - 8px);">
    <h4 style="margin-top:0;color:var(--violet);">Performance</h4>
    <p>P95 + P99 latency + regression against baseline</p>
  </div>

  <pre><code>// Default mode: weighted (prevents transient single-lane false degradation)
total = 0.40 × correctness + 0.35 × availability + 0.25 × performance

// Safe Mode escalation forces pessimistic:
total = min(availability, correctness, performance)</code></pre>

  <h3>Weight Invariants</h3>
  <ul class="checklist">
    <li>Weight sum must equal exactly <code>1.000</code> — build fails if violated</li>
    <li>Per-module weight capped at ≤ <code>0.25</code> unless <code>CORE_KERNEL_EXCEPTION=true</code></li>
    <li>Blast radius factor: <code>weight_boost = 1 + (fanout / max_fanout) × 0.15</code></li>
  </ul>

  <div class="stream-line"></div>

  <h2 id="clockless">2. Clockless Execution Model</h2>
  <p>The system operates on a demand-pulled, event-driven execution model. <strong>No timers, no cron jobs, no fixed polling intervals.</strong></p>

  <div class="highlight">
    <ul class="checklist" style="margin:0;">
      <li><strong>No idle compute cost</strong> — systems only activate when work exists</li>
      <li><strong>Deterministic health accounting</strong> — computed from actual events, not timer ticks</li>
      <li><strong>Event-driven scheduler pump</strong> — triggers on enqueue, completion, budget reset, or breaker change</li>
      <li><strong>Priority classes:</strong> user &gt; safety &gt; governance &gt; evolution &gt; maintenance</li>
    </ul>
  </div>

  <h3>Budget Envelopes</h3>
  <table>
    <tr><th>Envelope</th><th>Description</th></tr>
    <tr><td><code>tokens_per_min</code></td><td>Token throughput limit per priority class</td></tr>
    <tr><td><code>ms_per_min</code></td><td>Compute time budget per priority class</td></tr>
    <tr><td><code>provider_cost_per_day</code></td><td>Cost ceiling per priority class per day</td></tr>
  </table>

  <div class="stream-line"></div>

  <h2 id="sm2">3. SM-2 Spaced Repetition + RPS</h2>

  <h3>SM-2 Core Algorithm</h3>
  <pre><code>After each recall attempt:
  if quality ≥ 3:
    if repetitions == 0: interval = 1
    if repetitions == 1: interval = 6
    else: interval = interval × easeFactor
    repetitions += 1
  else:
    repetitions = 0
    interval = 1

  easeFactor = max(1.3, easeFactor + (0.1 - (5 - quality) × (0.08 + (5 - quality) × 0.02)))</code></pre>

  <h3>Recall Priority Score (RPS)</h3>
  <pre><code>RPS = α×recency + β×use_frequency + γ×link_centrality + δ×task_relevance - ε×staleness</code></pre>

  <p>Tier promotion/demotion is decided by <strong>SM-2 + RPS + credibility + contradictions</strong> combined.
  Source credibility weighting: receipts/audit-verified &gt; system telemetry &gt; user notes &gt; inferred.</p>

  <div class="stream-line"></div>

  <h2 id="memory-tiers">4. Memory Tier Architecture</h2>
  <table>
    <tr><th>Tier</th><th>Label</th><th>Access Pattern</th><th>Retention</th></tr>
    <tr><td>0</td><td>Hot</td><td>&lt; 10ms, in-memory</td><td>Active session</td></tr>
    <tr><td>1</td><td>Warm</td><td>&lt; 100ms, indexed DB</td><td>30–90 days</td></tr>
    <tr><td>2</td><td>Cold</td><td>&lt; 1s, archived</td><td>1 year</td></tr>
    <tr><td>3</td><td>Glacier</td><td>On-demand retrieval</td><td>Indefinite, summary-indexed</td></tr>
  </table>

  <h3>Decay & Contradiction Rules</h3>
  <ul class="checklist">
    <li>Confidence below <code>0.30</code> → <code>hidden_by_default = true</code> (retrievable with override + warning)</li>
    <li>Decay formula: <code>confidence = initial × e^(-λt)</code></li>
    <li>Contradiction detected → confidence drop + <code>contradicted = true</code> flag</li>
    <li>All tier moves emit receipts with reason_code, actor, and evidence to <code>memory_tier_receipts</code></li>
  </ul>

  <div class="stream-line"></div>

  <h2 id="breakers">5. Circuit Breaker State Machine</h2>

  <div class="state-flow">
    <div class="state-node state-closed">CLOSED</div>
    <div class="state-arrow">→</div>
    <div class="state-node state-open">OPEN</div>
    <div class="state-arrow">→</div>
    <div class="state-node state-half">HALF-OPEN</div>
    <div class="state-arrow">→</div>
    <div class="state-node state-closed">CLOSED</div>
  </div>

  <table>
    <tr><th>Parameter</th><th>Default</th><th>Description</th></tr>
    <tr><td>failureThreshold</td><td>3</td><td>Sliding-window failures to trip</td></tr>
    <tr><td>successThreshold</td><td>2</td><td>Successes in half-open to close</td></tr>
    <tr><td>openDurationMs</td><td>60,000</td><td>With exponential backoff (cap 15min)</td></tr>
    <tr><td>halfOpenMaxConcurrent</td><td>1</td><td>Max concurrent probes in half-open</td></tr>
  </table>

  <h3>Failure Classification</h3>
  <div class="card-grid">
    <div class="card" style="border-left:3px solid var(--rose);">
      <h4 style="margin-top:0;">Countable (trips breaker)</h4>
      <p>Timeouts, 5xx responses, network failures</p>
    </div>
    <div class="card" style="border-left:3px solid var(--emerald);">
      <h4 style="margin-top:0;">Excluded (does NOT trip)</h4>
      <p>4xx bad input, validation errors</p>
    </div>
  </div>

  <p>Trip metadata persisted: <code>trip_cause</code>, <code>last_error_signature</code>,
  <code>downstream_service</code>, <code>estimated_blast_radius</code>.</p>

  <div class="stream-line"></div>

  <h2 id="cascade">6. Cascade Containment</h2>

  <table>
    <tr><th>Severity</th><th>Scope</th><th>Response</th></tr>
    <tr><td><strong style="color:var(--amber);">S1 — Local</strong></td><td>2–3 systems</td><td>Isolate origin + open downstream breakers</td></tr>
    <tr><td><strong style="color:var(--rose);">S2 — Multi-Sector</strong></td><td>Cross-sector</td><td>Freeze evolution + degrade non-essential</td></tr>
    <tr><td><strong style="color:var(--magenta);">S3 — Systemic</strong></td><td>CORE + others</td><td><strong>Safe Mode:</strong> read-only + minimal routes + lock spend</td></tr>
  </table>

  <div class="warning">
    <div class="warning-label">⚠ Safe Mode</div>
    <p style="margin:0;color:var(--text-muted);">
      S3 cascades trigger Safe Mode automatically. Governor-only toggle.
      Disables evolution, locks provider spend, enforces read-only on non-critical paths.
      State persisted in <code>substrate_safe_mode</code> table.
    </p>
  </div>

  <div class="stream-line"></div>

  <h2 id="merkle">7. Merkle Audit Chain</h2>
  <p>Tamper-evident, cryptographic logging of all governance decisions and system receipts.</p>

  <pre><code>// Typed receipt schema
{ type, actor, inputs_hash, outputs_hash, policy_version, timestamp, metadata }

// Chain verification: recompute from genesis
prevHash = GENESIS_HASH
for receipt in chain:
    if receipt.prev_hash ≠ prevHash: FAIL
    prevHash = SHA-256(receipt)</code></pre>

  <h3>Multi-Anchor Head Storage</h3>
  <p>Chain head stored in two redundant anchors (primary + redundant) in <code>audit_chain_anchors</code>.
  Verification checks anchor consistency alongside hash-chain integrity.</p>

  <div class="stream-line"></div>

  <h2 id="routing">8. Cognitive Load Balancing</h2>
  <p>Constraints-first routing with failover ladder and anti-oscillation:</p>

  <ol>
    <li><strong>Hard constraints filter:</strong> context window, policy/tool requirements, budget ceiling, provider health minimum</li>
    <li><strong>Score remaining candidates</strong> (health × cost × affinity × latency weighted composite)</li>
    <li><strong>Sticky routing TTL:</strong> pin chosen provider per task-type + session to prevent oscillation</li>
    <li><strong>Failover ladder:</strong> retry same → switch provider → degrade task (summarize / lower-cost model)</li>
  </ol>

  <pre><code>routeScore(provider, task) = 
  healthWeight × provider.healthScore
  + costWeight × (1 - provider.normalizedCost)
  + affinityWeight × provider.taskAffinity[task.type]
  + latencyWeight × (1 - provider.normalizedLatency)</code></pre>

  <div class="stream-line"></div>

  <h2 id="evolution">9. Evolution Confidence Scoring</h2>
  <table>
    <tr><th>Factor</th><th>Weight</th><th>Source</th></tr>
    <tr><td>Pre/post integrity delta</td><td><code>0.30</code></td><td>3-lane integrity scan</td></tr>
    <tr><td>Governance compliance</td><td><code>0.25</code></td><td>GOVERNANCE evaluation</td></tr>
    <tr><td>Error rate change</td><td><code>0.20</code></td><td>VISION telemetry</td></tr>
    <tr><td>Performance regression</td><td><code>0.15</code></td><td>Latency metrics</td></tr>
    <tr><td>Security impact</td><td><code>0.10</code></td><td>DEFENSE assessment</td></tr>
  </table>

  <h3>Promotion Rules</h3>
  <table>
    <tr><th>Confidence</th><th>Action</th></tr>
    <tr><td>≥ 0.80</td><td>Auto-promote eligible (except critical classes)</td></tr>
    <tr><td>0.60–0.79</td><td>Requires governor review</td></tr>
    <tr><td>&lt; 0.60</td><td>Rejected, logged for analysis</td></tr>
  </table>

  <div class="secret-box">
    <div class="secret-label">🔒 Two-Man Rule — Critical Classes</div>
    <p style="margin:0;color:var(--text-muted);font-size:14px;">
      Classes <code>core</code>, <code>auth</code>, <code>billing</code>, <code>governance</code> are never auto-promoted
      even if confidence ≥ 0.80. Requires explicit governor approval + second reviewer signature.
      Evidence bundle (tests, diff stats, telemetry deltas, security scan, rollback plan) is mandatory.
    </p>
  </div>

  <div class="stream-line"></div>

  <h2 id="coalescing">10. Request Deduplication (Coalescing)</h2>
  <p>Auth-aware coalescing prevents duplicate in-flight requests:</p>

  <pre><code>hash = SHA-256(model + messages + parameters + auth_scope + tool_permissions + tenant_id)</code></pre>

  <table>
    <tr><th>Category</th><th>TTL</th></tr>
    <tr><td>Chat responses</td><td>5 minutes</td></tr>
    <tr><td>System queries</td><td>2 hours</td></tr>
    <tr><td>Static lookups</td><td>24 hours</td></tr>
  </table>
  <p>State-dependent responses (live DB data, time-sensitive) use short TTL or require revalidation token.</p>

  <div class="stream-line"></div>

  <h2 id="health">11. SLO-Based Health Grading</h2>

  <div class="tier-grid">
    <div class="tier-card tier-s"><div class="tier-name">A</div><div class="tier-range">Within SLO, low burn</div></div>
    <div class="tier-card tier-a"><div class="tier-name">B</div><div class="tier-range">Within SLO, normal</div></div>
    <div class="tier-card tier-b"><div class="tier-name">C</div><div class="tier-range">SLO met, burn elevated</div></div>
    <div class="tier-card tier-c"><div class="tier-name">D</div><div class="tier-range">SLO at risk</div></div>
    <div class="tier-card tier-d"><div class="tier-name">F</div><div class="tier-range">SLO violated</div></div>
  </div>

  <h3>SLO Specs (Per System, Configurable)</h3>
  <table>
    <tr><th>Metric</th><th>Default Target</th></tr>
    <tr><td>Uptime</td><td>99.9%</td></tr>
    <tr><td>Error rate</td><td>&lt; 1%</td></tr>
    <tr><td>P95 latency</td><td>&lt; 500ms</td></tr>
    <tr><td>P99 latency</td><td>&lt; 2000ms</td></tr>
    <tr><td>Error budget window</td><td>24h</td></tr>
  </table>

  <p>Burn-rate tracking across multi-window (5m, 1h, 24h). MTTR tracked per system from incident open → resolved.</p>
</div>
  `);
}

// ═══════════════════════════════════════════════════════════════
// 4. TRADE SECRETS & MOAT
// ═══════════════════════════════════════════════════════════════

export function generateTradeSecretsDoc(): string {
  return wrapDoc('Trade Secrets & Competitive Moat', 'TRADE SECRET', `
<div class="doc-container cover">
  <div class="cover-classification">🔒 Internal — Trade Secret</div>
  <div class="cover-badge"><div class="dot"></div> Document 03 · Strategic Intelligence</div>
  <h1>Trade Secrets &<br/><span class="gradient">Competitive Moat</span></h1>
  <p class="cover-subtitle">
    The strategic differentiators that constitute the substrate's competitive moat.
    Technical proof points — not marketing language — that make the system difficult to replicate.
  </p>
  <p class="meta-line">CMPSBL® Memory Stream · Signal → Silicon</p>
</div>

<div class="doc-container">
  <div class="toc">
    <h3>Contents</h3>
    <ol>
      <li><a href="#crown-jewels">Crown Jewels</a></li>
      <li><a href="#moat">Competitive Moat Components</a></li>
      <li><a href="#ip">IP Protection Enforcement</a></li>
      <li><a href="#thresholds">Internal Threshold Defaults</a></li>
      <li><a href="#comparison">Strategic Differentiators</a></li>
      <li><a href="#handling">Handling Policy</a></li>
    </ol>
  </div>

  <h2 id="crown-jewels">1. Crown Jewels</h2>

  <h3>Architectural Crown Jewels</h3>
  <table>
    <tr><th>Secret</th><th>Description</th><th>Strategic Value</th></tr>
    <tr><td>Clockless execution</td><td>Event-driven, demand-pulled, no timers</td><td>Eliminates idle compute, prevents false health signals</td></tr>
    <tr><td>3-Lane Integrity</td><td>Availability × Correctness × Performance</td><td>Mathematically deterministic system health</td></tr>
    <tr><td>38-node topology</td><td>12-sector architecture with field permeation</td><td>No competitor has this topological completeness</td></tr>
    <tr><td>Governance-gated evolution</td><td>SEBA with 7-gate promotion + two-man rule</td><td>Autonomous improvement with safety guarantees</td></tr>
    <tr><td>Autonomous Foundry</td><td>Recursive capability discovery reactor</td><td>Self-manufacturing software — DOI published</td></tr>
  </table>

  <h3>Experience Crown Jewels</h3>
  <table>
    <tr><th>Secret</th><th>Protection Level</th></tr>
    <tr><td>Composable Cognitives reasoning prompts</td><td>Black-boxed, sealed runtime</td></tr>
    <tr><td>SEBA/CORTEX recursive self-improvement</td><td>Permanently hidden from all tiers</td></tr>
    <tr><td>Memory graph embedding strategies</td><td>Service-role write only, authenticated read</td></tr>
    <tr><td>Foundry reactor source</td><td><strong style="color:var(--rose);">Trade secret — never exposed</strong></td></tr>
    <tr><td>Discovery Engine CJPI model</td><td><strong style="color:var(--rose);">Trade secret — weights internal</strong></td></tr>
    <tr><td>S-Tier Vault + export adapter</td><td>Governor-only, no public API</td></tr>
    <tr><td>Standalone Discovery Engine</td><td>Included in exports (obfuscated)</td></tr>
  </table>

  <div class="stream-line"></div>

  <h2 id="moat">2. Competitive Moat Components</h2>

  <h3>Constant Learning Compounding</h3>
  <div class="highlight">
    <pre style="border:none;background:transparent;padding:0;margin:0;"><code>Knowledge_value(t) = K₀ × (1 + learning_rate)^t - decay_losses(t)</code></pre>
    <p style="margin-top:12px;font-size:14px;">
      The longer the system runs, the more valuable it becomes.
      SM-2 spaced repetition + DREAM cycle optimization + evolution receipt chain
      create an exponential advantage that competitors cannot bootstrap.
    </p>
  </div>

  <h3>Governance-Gated Autonomy</h3>
  <ul class="checklist">
    <li>Proposals generated autonomously (SEBA)</li>
    <li>Validation is deterministic (7-gate pipeline)</li>
    <li>Promotion requires confidence ≥ 0.80</li>
    <li>Critical classes require two-man rule (governor + second reviewer)</li>
    <li>Rollback automatic if post-deployment health drops</li>
    <li>All decisions immutably audited via Merkle chain</li>
  </ul>

  <h3>Leader-Gated Persistence</h3>
  <div class="card">
    <p>Only the leader instance writes periodic snapshots. Non-leaders can request manual flush
    but do not run schedule loops. Cluster-safe state management without external coordination services.</p>
  </div>

  <div class="stream-line"></div>

  <h2 id="ip">3. IP Protection Enforcement</h2>

  <h3>Black-Box Protocol (10-Point)</h3>
  <div class="card">
    <ol>
      <li>❌ Source code visibility</li>
      <li>❌ Prompt/memory leakage</li>
      <li>❌ Internal configuration exposure</li>
      <li>❌ System graph visibility</li>
      <li>❌ Cross-project bleed</li>
      <li>❌ Exports of sealed items</li>
      <li>❌ Duplication</li>
      <li>❌ Cloning</li>
      <li>❌ Composition into discovery engines</li>
      <li>❌ Reverse engineering via API probing</li>
    </ol>
  </div>

  <h3>Environment Signature Lock</h3>
  <p>Substrate systems validate the deployment environment ID on initialization.
  Systems will not boot in unauthorized projects.</p>

  <div class="stream-line"></div>

  <h2 id="thresholds">4. Internal Threshold Defaults</h2>

  <div class="secret-box">
    <div class="secret-label">🔒 Do Not Externalize</div>
    <table style="margin-top:12px;">
      <tr><th>Parameter</th><th>Value</th><th>System</th></tr>
      <tr><td>Circuit breaker failure threshold</td><td>3</td><td>ALL</td></tr>
      <tr><td>Circuit breaker open duration</td><td>60s (+ exponential backoff)</td><td>ALL</td></tr>
      <tr><td>SM-2 minimum ease factor</td><td>1.3</td><td>MEMORY</td></tr>
      <tr><td>Memory confidence gate</td><td>0.30</td><td>BRAIN</td></tr>
      <tr><td>Evolution promotion confidence</td><td>0.80</td><td>EVOLUTION</td></tr>
      <tr><td>Integrity health minimum</td><td>60%</td><td>SYSTEM</td></tr>
      <tr><td>Cascade detection window</td><td>30s</td><td>RIPPLE</td></tr>
      <tr><td>Cascade system threshold</td><td>3</td><td>RIPPLE</td></tr>
      <tr><td>Cache TTL (chat)</td><td>5min</td><td>NEXUS</td></tr>
      <tr><td>Cache TTL (system)</td><td>2h</td><td>NEXUS</td></tr>
      <tr><td>Backpressure critical depth</td><td>200</td><td>SCHEDULER</td></tr>
      <tr><td>Budget envelope reset</td><td>Per-minute</td><td>SCHEDULER</td></tr>
    </table>
  </div>

  <div class="stream-line"></div>

  <h2 id="comparison">5. Strategic Differentiators</h2>
  <table>
    <tr><th>Differentiator</th><th>CMPSBL</th><th>Typical AI Platforms</th></tr>
    <tr><td>Persistent memory</td><td>✅ SM-2 + RPS tiered, no resets</td><td>❌ Session-scoped</td></tr>
    <tr><td>Self-evolution</td><td>✅ Governed, audited, two-man rule</td><td>❌ Manual updates only</td></tr>
    <tr><td>Multi-provider routing</td><td>✅ 14-provider fleet + constraints</td><td>❌ Single provider</td></tr>
    <tr><td>Cryptographic audit</td><td>✅ Merkle chain + anchored heads</td><td>❌ Plain text logs</td></tr>
    <tr><td>Offline optimization</td><td>✅ DREAM cycles</td><td>❌ None</td></tr>
    <tr><td>Circuit isolation</td><td>✅ Per-system breakers + backoff</td><td>❌ Global or none</td></tr>
    <tr><td>Governance plane</td><td>✅ Self-referential + Safe Mode</td><td>❌ Manual review</td></tr>
    <tr><td>Cascade containment</td><td>✅ 3-severity + Safe Mode</td><td>❌ None</td></tr>
    <tr><td>Structural identity</td><td>✅ SHA-256 pipeline fingerprints</td><td>❌ None</td></tr>
  </table>

  <div class="stream-line"></div>

  <h2 id="handling">6. Handling Policy</h2>
  <ul class="checklist">
    <li><strong>Record</strong> strategic differentiators with technical proof points, not marketing language</li>
    <li><strong>Promote</strong> to non-secret docs only after explicit governor review</li>
    <li><strong>Preserve</strong> deterministic examples and constraints for reproducibility</li>
    <li><strong>Rotate</strong> any threshold that becomes externally known</li>
  </ul>
</div>
  `);
}

// ═══════════════════════════════════════════════════════════════
// 5. S-TIER VAULT INTERNALS
// ═══════════════════════════════════════════════════════════════

export function generateVaultDoc(): string {
  return wrapDoc('S-Tier Vault Internals', 'TRADE SECRET', `
<div class="doc-container cover">
  <div class="cover-classification">🔒 Internal — Trade Secret</div>
  <div class="cover-badge"><div class="dot"></div> Document 22 · Vault Architecture</div>
  <h1>S-Tier<br/><span class="gradient">Vault</span></h1>
  <p class="cover-subtitle">
    The governor-only repository of validated Apex discoveries.
    Architecture, data model, export capabilities, and universal adapter
    for 25 target languages.
  </p>
  <p class="meta-line">CMPSBL® Memory Stream · IRONCLAD Epoch</p>
</div>

<div class="doc-container">
  <div class="toc">
    <h3>Contents</h3>
    <ol>
      <li><a href="#access">Access Control</a></li>
      <li><a href="#data">Data Architecture</a></li>
      <li><a href="#ui">Vault UI</a></li>
      <li><a href="#export">Export System</a></li>
      <li><a href="#adapter">Universal Export Adapter</a></li>
      <li><a href="#security">Security Measures</a></li>
    </ol>
  </div>

  <h2 id="access">1. Access Control</h2>
  <table>
    <tr><th>Level</th><th>Access</th></tr>
    <tr><td>Public</td><td><strong style="color:var(--rose);">None</strong> — no public API, no public route</td></tr>
    <tr><td>Authenticated users</td><td><strong style="color:var(--rose);">None</strong> — not visible in navigation</td></tr>
    <tr><td>Governor (Admin)</td><td><strong style="color:var(--emerald);">Full access</strong> at <code>/admin/s-tier-vault</code></td></tr>
    <tr><td>System (Internal)</td><td>Write access via discovery reactor</td></tr>
  </table>

  <div class="stream-line"></div>

  <h2 id="data">2. Data Architecture</h2>
  <h3>Primary Table: <code>crown_jewel_discoveries</code></h3>
  <table>
    <tr><th>Column</th><th>Type</th><th>Purpose</th></tr>
    <tr><td>id</td><td>UUID</td><td>Primary key</td></tr>
    <tr><td>name</td><td>text</td><td>Human-readable discovery name</td></tr>
    <tr><td>description</td><td>text</td><td>Detailed description</td></tr>
    <tr><td>module_chain</td><td>text[]</td><td>Ordered contributing systems</td></tr>
    <tr><td>pipeline_steps</td><td>jsonb</td><td>Structural step definitions</td></tr>
    <tr><td>pipeline_fingerprint</td><td>text</td><td>Immutable SHA-256 identity</td></tr>
    <tr><td>cjpi_score</td><td>numeric(5,2)</td><td>0–100 composite score</td></tr>
    <tr><td>tier</td><td>text</td><td>Apex / Mythic / Relic / Prime / Mint</td></tr>
    <tr><td>category</td><td>text</td><td>Functional grouping</td></tr>
    <tr><td>status</td><td>text</td><td>discovered / validated / promoted / archived</td></tr>
    <tr><td>metadata</td><td>jsonb</td><td>Scoring factors, variant refs</td></tr>
  </table>

  <div class="stream-line"></div>

  <h2 id="ui">3. Vault UI</h2>
  <div class="card-grid">
    <div class="card">
      <h4 style="margin-top:0;">Registry Tab</h4>
      <ul>
        <li>Paginated discovery list</li>
        <li>Real-time search (name, description, chain)</li>
        <li>Tier badge filtering</li>
        <li>Score range slider</li>
        <li>Inline detail expansion</li>
      </ul>
    </div>
    <div class="card">
      <h4 style="margin-top:0;">Analytics Tab</h4>
      <ul>
        <li>Tier distribution chart (donut)</li>
        <li>Discovery rate over time (line)</li>
        <li>System frequency heatmap</li>
        <li>Cross-zone chain analysis</li>
        <li>CJPI score distribution histogram</li>
      </ul>
    </div>
  </div>

  <div class="stream-line"></div>

  <h2 id="export">4. Export System</h2>
  <h3>ZIP Package Structure</h3>
  <pre><code>cmpsbl-vault-export-{timestamp}/
├── manifest.json                    # Complete discovery data
├── _discovery-engine/
│   ├── standalone-runtime.ts        # CJPI scoring + orchestration
│   ├── standalone-discovery-engine.ts  # Portable reactor
│   └── README.md
└── metadata.json                    # Export metadata + fingerprint</code></pre>

  <h3>Verification Panel</h3>
  <ul class="checklist">
    <li>Total discovery count (live from database)</li>
    <li>Tier distribution percentages</li>
    <li>SHA-256 hash of the full manifest</li>
    <li>Last reactor run timestamp</li>
    <li>RLS enforcement confirmation</li>
  </ul>

  <div class="stream-line"></div>

  <h2 id="adapter">5. Universal Export Adapter</h2>

  <h3>Software Languages (18)</h3>
  <div class="card">
    <p>TypeScript · JavaScript · Python · Rust · Go · Java · Kotlin · Swift · C# · C++ · Ruby · PHP · Dart · Scala · Elixir · Haskell · Lua · R</p>
  </div>

  <h3>Hardware/HDL Targets (7)</h3>
  <div class="card">
    <p>VHDL · Verilog · SystemVerilog · Chisel · SpinalHDL · Clash · Amaranth</p>
  </div>

  <h3>Export Process</h3>
  <ol>
    <li>Read discovery manifest entry</li>
    <li>Map system chain to target language primitives</li>
    <li>Generate language-specific scaffold with CJPI metadata</li>
    <li>Package with build configuration (Makefile, package.json, Cargo.toml, etc.)</li>
    <li>Include standalone runtime (TypeScript native, others generate stubs)</li>
  </ol>

  <div class="stream-line"></div>

  <h2 id="security">6. Security Measures</h2>
  <ul class="checklist">
    <li>All vault queries use RLS with admin role check</li>
    <li>Export downloads are audit-logged</li>
    <li>ZIP exports include license file asserting proprietary rights</li>
    <li>No vault data is included in public API responses</li>
    <li>Discovery reactor writes use service-role credentials</li>
    <li>Pipeline fingerprints are immutable — never overwritten</li>
  </ul>
</div>
  `);
}

// ═══════════════════════════════════════════════════════════════
// 6. SECURITY INTERNALS
// ═══════════════════════════════════════════════════════════════

export function generateSecurityDoc(): string {
  return wrapDoc('Security Internals', 'CONFIDENTIAL', `
<div class="doc-container cover">
  <div class="cover-classification">🔒 Internal — Confidential</div>
  <div class="cover-badge"><div class="dot"></div> Document 08 · DEFENSE Shell Architecture</div>
  <h1>Security<br/><span class="gradient">Internals</span></h1>
  <p class="cover-subtitle">
    The DEFENSE shell, threat detection, attack prevention, data protection,
    and intelligence gathering capabilities. Fortress v2.0.0 — 25 hardening features
    across five security domains.
  </p>
  <p class="meta-line">CMPSBL® Memory Stream · Signal → Silicon</p>
</div>

<div class="doc-container">
  <div class="toc">
    <h3>Contents</h3>
    <ol>
      <li><a href="#defense">DEFENSE Shell Architecture</a></li>
      <li><a href="#edge">Edge Function Security</a></li>
      <li><a href="#rls">RLS Policies</a></li>
      <li><a href="#honeypots">Honeypot Registry</a></li>
      <li><a href="#reputation">IP Reputation Scoring</a></li>
      <li><a href="#blackbox">Black-Box Enforcement</a></li>
    </ol>
  </div>

  <h2 id="defense">1. DEFENSE Shell Architecture</h2>
  <p>The DEFENSE shell is the outermost containment boundary. It implements 25 hardening features across five domains:</p>

  <h3>Identity & Fraud Detection</h3>
  <table>
    <tr><th>Feature</th><th>Description</th></tr>
    <tr><td>Geo-velocity detection</td><td>Flags logins from geographically impossible locations</td></tr>
    <tr><td>Impossible travel detection</td><td>Calculates if physical travel between origins was possible</td></tr>
    <tr><td>Request fingerprinting (FNV-1a)</td><td>Unique per-client fingerprint from request characteristics</td></tr>
    <tr><td>Session binding validation</td><td>Session tokens bound to originating client fingerprint</td></tr>
  </table>

  <h3>Attack Prevention</h3>
  <table>
    <tr><th>Feature</th><th>Description</th></tr>
    <tr><td>Honeypot Registry</td><td>15 decoy paths that log and analyze any access</td></tr>
    <tr><td>Progressive challenge escalation</td><td>Passive → PoW → CAPTCHA as suspicion increases</td></tr>
    <tr><td>Replay Attack Guard</td><td>Nonce + TTL validation prevents request replay</td></tr>
    <tr><td>Rate limiting</td><td>Per-IP, per-endpoint, per-API-key</td></tr>
    <tr><td>IP Reputation System</td><td>Behavioral scoring with dynamic classification</td></tr>
  </table>

  <h3>Data Protection</h3>
  <table>
    <tr><th>Feature</th><th>Description</th></tr>
    <tr><td>PII egress filtering</td><td>Scans outbound for SSN, credit card, password patterns</td></tr>
    <tr><td>Server header cloaking</td><td>Removes/replaces server/version headers</td></tr>
    <tr><td>Secret hash enforcement</td><td>Webhooks use <code>secret_hash</code> not cleartext</td></tr>
  </table>

  <h3>Intelligence</h3>
  <table>
    <tr><th>Feature</th><th>Description</th></tr>
    <tr><td>Payload entropy analysis</td><td>Detects obfuscated threats by entropy measurement</td></tr>
    <tr><td>Threat feed ingestion</td><td>External threat intelligence for known-bad indicators</td></tr>
    <tr><td>Behavioral fingerprinting</td><td>Velocity/timing variance identifies automation</td></tr>
  </table>

  <h3>Observability</h3>
  <table>
    <tr><th>Feature</th><th>Description</th></tr>
    <tr><td>Defense Posture Score</td><td>A–F grade based on overall security health</td></tr>
    <tr><td>Attack surface mapping</td><td>Catalogs all endpoints and protection levels</td></tr>
    <tr><td>Tamper-evident audit signer</td><td>Hash-chains audit entries (Merkle chain)</td></tr>
  </table>

  <div class="stream-line"></div>

  <h2 id="edge">2. Edge Function Security</h2>

  <h3>HMAC Verification</h3>
  <pre><code>signature = HMAC-SHA256(secret, timestamp + "." + body)</code></pre>

  <h3>Edge Rate Limiting</h3>
  <p>Per-function, per-IP rate limit tracking via <code>edge_rate_limits</code> table.
  Automatic cleanup of records older than 24 hours.</p>

  <div class="stream-line"></div>

  <h2 id="rls">3. RLS Policies (Critical Tables)</h2>
  <table>
    <tr><th>Table</th><th>Policy</th></tr>
    <tr><td>cognitive_orders</td><td>User-scoped: <code>auth.uid() = user_id</code></td></tr>
    <tr><td>brain_events</td><td>User-scoped: <code>auth.uid() = user_id</code></td></tr>
    <tr><td>brain_embeddings</td><td>Authenticated read, service_role write</td></tr>
    <tr><td>brain_classifier_models</td><td>Authenticated read, service_role write</td></tr>
    <tr><td>brain_drift_log</td><td>Authenticated read, service_role write</td></tr>
    <tr><td>ai_usage_log</td><td>Authenticated read (dashboard reporting)</td></tr>
    <tr><td>Control plane tables</td><td>RLS-protected, tenant-scoped</td></tr>
    <tr><td>Substrate scheduler/breaker</td><td>Service-role only</td></tr>
    <tr><td>Audit chain anchors</td><td>Service-role write, authenticated read</td></tr>
  </table>

  <div class="stream-line"></div>

  <h2 id="honeypots">4. Honeypot Registry</h2>
  <p>15 decoy paths. Any access is logged and the IP is flagged:</p>
  <pre><code>/admin
/wp-admin
/wp-login.php
/.env
/config.php
/phpinfo.php
/api/v1/debug
/api/v1/internal
/.git/config
/server-status
/.htaccess
/backup.sql
/database.sql
/api/v1/admin/users
/api/v1/admin/config</code></pre>

  <div class="stream-line"></div>

  <h2 id="reputation">5. IP Reputation Scoring</h2>

  <pre><code>reputation = base_score
  - (honeypot_hits × 20)
  - (rate_limit_violations × 5)
  - (replay_attempts × 15)
  - (impossible_travel × 25)
  + (successful_requests × 0.1)</code></pre>

  <table>
    <tr><th>Score</th><th>Classification</th><th>Action</th></tr>
    <tr><td>80–100</td><td><strong style="color:var(--emerald);">Trusted</strong></td><td>Normal access</td></tr>
    <tr><td>50–79</td><td>Neutral</td><td>Standard monitoring</td></tr>
    <tr><td>20–49</td><td><strong style="color:var(--amber);">Suspicious</strong></td><td>Enhanced monitoring, tightened limits</td></tr>
    <tr><td>0–19</td><td><strong style="color:var(--rose);">Hostile</strong></td><td>Block or CAPTCHA challenge</td></tr>
  </table>

  <div class="stream-line"></div>

  <h2 id="blackbox">6. Black-Box Enforcement</h2>
  <p>High-value artifacts follow the 10-point enforcement interface. Security implications:</p>
  <ul class="checklist">
    <li>No source code visibility for sealed items</li>
    <li>No prompt or memory leakage from cognitives</li>
    <li>No internal configuration exposure via API</li>
    <li>No cross-project data bleed</li>
    <li>Environment signature lock prevents unauthorized deployment</li>
    <li>Pipeline fingerprints are cryptographic and immutable</li>
  </ul>
</div>
  `);
}

// ═══════════════════════════════════════════════════════════════
// DOWNLOAD HELPERS
// ═══════════════════════════════════════════════════════════════

function triggerDownload(html: string, filename: string) {
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

const dateSlug = () => new Date().toISOString().split('T')[0];

export function downloadFoundryDoc() {
  triggerDownload(generateFoundryDoc(), `CMPSBL-Foundry-Internal-${dateSlug()}.html`);
}

export function downloadDiscoveryEngineDoc() {
  triggerDownload(generateDiscoveryEngineDoc(), `CMPSBL-Discovery-Engine-Internal-${dateSlug()}.html`);
}

export function downloadAlgorithmsDoc() {
  triggerDownload(generateAlgorithmsDoc(), `CMPSBL-Algorithms-Internal-${dateSlug()}.html`);
}

export function downloadTradeSecretsDoc() {
  triggerDownload(generateTradeSecretsDoc(), `CMPSBL-Trade-Secrets-Internal-${dateSlug()}.html`);
}

export function downloadVaultDoc() {
  triggerDownload(generateVaultDoc(), `CMPSBL-Vault-Internal-${dateSlug()}.html`);
}

export function downloadSecurityDoc() {
  triggerDownload(generateSecurityDoc(), `CMPSBL-Security-Internal-${dateSlug()}.html`);
}

export function downloadAllInternalDocs() {
  downloadFoundryDoc();
  setTimeout(() => downloadDiscoveryEngineDoc(), 200);
  setTimeout(() => downloadAlgorithmsDoc(), 400);
  setTimeout(() => downloadTradeSecretsDoc(), 600);
  setTimeout(() => downloadVaultDoc(), 800);
  setTimeout(() => downloadSecurityDoc(), 1000);
}

/** All available internal documents */
export const INTERNAL_DOCS = [
  { id: 'foundry', title: 'Autonomous Software Foundry', docNumber: '20', download: downloadFoundryDoc },
  { id: 'discovery-engine', title: 'Discovery Engine Internals', docNumber: '21', download: downloadDiscoveryEngineDoc },
  { id: 'algorithms', title: 'Proprietary Algorithms', docNumber: '02', download: downloadAlgorithmsDoc },
  { id: 'trade-secrets', title: 'Trade Secrets & Competitive Moat', docNumber: '03', download: downloadTradeSecretsDoc },
  { id: 'vault', title: 'S-Tier Vault Internals', docNumber: '22', download: downloadVaultDoc },
  { id: 'security', title: 'Security Internals', docNumber: '08', download: downloadSecurityDoc },
] as const;
