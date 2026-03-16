/**
 * Client-side Investor Deck Generator
 * Memory Stream themed — Signal → Silicon narrative
 */

const WORLD_FIRSTS = [
  { achievement: "Autonomous AI Dream State", description: "First AI system to enter an offline dream state for memory synthesis, consolidation, and creative recombination (Simnap & Cascade)", evidence: "Zenodo DOI: 10.5281/zenodo.18234910" },
  { achievement: "Self-Evolving Bounded Agent (SEBA)", description: "First verifiable self-improving AI system with cryptographic evolution stamps, rollback semantics, and human-in-the-loop governance", evidence: "Substrate v7.0.0+" },
  { achievement: "40-Node Memory Stream", description: "First complete cognitive operating system with 40 nodes across 12 sectors, 675+ capabilities, and 4 shielded expansion zones, operating as a unified Memory Stream", evidence: "Production-grade field-based topology" },
  { achievement: "Intent Mesh Crystallization", description: "First emergent capability discovery system where systems advertise, compose, and crystallize cross-system pipelines autonomously from the Memory Stream", evidence: "100+ crystallized pipelines" },
  { achievement: "Universal Brain Transfer Pipeline", description: "First system to automatically route memories from a central BRAIN to all systems based on relevance scoring and tag affinity", evidence: "CLM Engine v2.0" },
  { achievement: "DECODE → ENCODE Pipeline", description: "First governed natural-language-to-code execution pipeline where AI never receives raw input — all intent passes through normalization, enrichment, and safety gates", evidence: "v10.5.3" },
  { achievement: "Graduated Autonomy Framework", description: "First AI code execution system with mastery-based safety thresholds (Novice → Master), where destructive capability scales with demonstrated competence", evidence: "ENCODE system" },
  { achievement: "Cognitive Constant Learning Mode", description: "First 24/7 server-side autonomous learning system (5-phase lifecycle, 5-minute cycles) running independently of browser sessions", evidence: "CLM Engine v2.0" },
  { achievement: "Memory Tiering with Staleness Detection", description: "First AI memory system with hot/warm/cold tiering, embedding staleness tracking, and automated re-embedding when model versions advance", evidence: "MEMORY system" },
  { achievement: "Actor Reputation Scoring", description: "First AI identity system with trust scores (0.0–1.0) mapped to 5 reputation tiers with cross-agency identity portability via signed JWTs", evidence: "IDENTITY system" },
  { achievement: "Multi-Provider Fleet with Task Affinity", description: "First AI routing system with health-weighted multi-provider selection (5+ providers) and task-type-to-provider affinity mapping", evidence: "NEXUS Fleet v5.0" },
  { achievement: "AI Governance Reference Namespace", description: "First published namespace standard (AIGVRN v1.0) for unified AI governance terminology across 12 governance surfaces", evidence: "Zenodo DOI: 10.5281/zenodo.18209222" },
  { achievement: "Predictive Cost Forecasting for AI", description: "First system providing linear regression cost forecasting with confidence intervals and per-capability cost attribution for AI operations", evidence: "ECONOMY system" },
  { achievement: "Cascade Failure Prevention", description: "First AI system with proactive cascade failure detection across system dependency graphs, preventing chain-reaction outages", evidence: "RIPPLE Crown Jewel" },
];

export function generateInvestorDeckHTML(): string {
  const date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  
  const worldFirstsRows = WORLD_FIRSTS.map(wf => `
    <tr>
      <td style="padding:12px 16px;border-bottom:1px solid #1a2744;font-weight:600;color:#e2e8f0;white-space:nowrap;">${wf.achievement}</td>
      <td style="padding:12px 16px;border-bottom:1px solid #1a2744;color:#94a3b8;">${wf.description}</td>
      <td style="padding:12px 16px;border-bottom:1px solid #1a2744;color:#22d3ee;font-size:13px;">${wf.evidence}</td>
    </tr>
  `).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>CMPSBL® — Investor Deck · Signal → Silicon | ${date}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;900&display=swap');
  
  :root {
    --bg: #0a0e1a;
    --bg-card: #0f1629;
    --bg-accent: #141b2d;
    --border: #1a2744;
    --cyan: #22d3ee;
    --cyan-dim: rgba(34,211,238,0.15);
    --violet: #8b5cf6;
    --violet-dim: rgba(139,92,246,0.12);
    --text: #e2e8f0;
    --text-muted: #94a3b8;
    --text-dim: #64748b;
    --emerald: #10b981;
    --amber: #f59e0b;
  }
  
  * { margin: 0; padding: 0; box-sizing: border-box; }
  
  body {
    font-family: 'Inter', -apple-system, sans-serif;
    background: var(--bg);
    color: var(--text);
    line-height: 1.6;
  }
  
  .page {
    max-width: 900px;
    margin: 0 auto;
    padding: 60px 40px;
    page-break-after: always;
  }
  
  .cover {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    justify-content: center;
    position: relative;
  }
  
  .cover::before {
    content: '';
    position: absolute;
    top: 20%;
    left: -10%;
    width: 400px;
    height: 400px;
    background: radial-gradient(circle, var(--cyan-dim) 0%, transparent 70%);
    border-radius: 50%;
    pointer-events: none;
  }
  
  .cover::after {
    content: '';
    position: absolute;
    bottom: 25%;
    right: -5%;
    width: 350px;
    height: 350px;
    background: radial-gradient(circle, var(--violet-dim) 0%, transparent 70%);
    border-radius: 50%;
    pointer-events: none;
  }
  
  .cover-badge {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 6px 16px;
    border: 1px solid var(--border);
    border-radius: 9999px;
    font-size: 11px;
    color: var(--cyan);
    margin-bottom: 32px;
    width: fit-content;
    text-transform: uppercase;
    letter-spacing: 2px;
    font-weight: 600;
  }
  
  .cover-badge .dot {
    width: 6px; height: 6px;
    background: var(--cyan);
    border-radius: 50%;
    animation: pulse 2s ease-in-out infinite;
  }
  
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.3; }
  }
  
  h1 { font-size: 48px; font-weight: 300; letter-spacing: -1px; margin-bottom: 16px; }
  h1 span { font-weight: 900; background: linear-gradient(135deg, var(--cyan), var(--violet)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
  h2 { font-size: 28px; font-weight: 600; margin-bottom: 24px; color: var(--text); border-bottom: 1px solid var(--border); padding-bottom: 12px; }
  h3 { font-size: 18px; font-weight: 600; margin-bottom: 12px; color: var(--cyan); }
  
  .subtitle { font-size: 18px; color: var(--text-muted); max-width: 600px; margin-bottom: 40px; }
  .stream-tag { font-size: 13px; color: var(--violet); font-weight: 500; letter-spacing: 1px; margin-bottom: 8px; }
  
  .meta-line { font-size: 13px; color: var(--text-dim); margin-top: 40px; }
  .meta-line a { color: var(--cyan); text-decoration: none; }
  
  .metrics-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
    margin: 32px 0;
  }
  
  .metric-card {
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 24px 16px;
    text-align: center;
  }
  
  .metric-value { font-size: 32px; font-weight: 700; color: var(--cyan); }
  .metric-label { font-size: 12px; color: var(--text-muted); margin-top: 4px; text-transform: uppercase; letter-spacing: 1px; }
  
  table {
    width: 100%;
    border-collapse: collapse;
    margin: 16px 0 32px;
    font-size: 14px;
  }
  
  th {
    text-align: left;
    padding: 12px 16px;
    background: var(--bg-accent);
    color: var(--cyan);
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 1px;
    border-bottom: 2px solid var(--border);
  }
  
  .card-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin: 24px 0; }
  
  .info-card {
    background: var(--bg-card);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 24px;
  }
  
  .info-card h3 { margin-bottom: 8px; }
  .info-card p { font-size: 14px; color: var(--text-muted); }
  
  .highlight-box {
    background: linear-gradient(135deg, rgba(34,211,238,0.08), rgba(139,92,246,0.08));
    border: 1px solid var(--border);
    border-radius: 16px;
    padding: 32px;
    margin: 32px 0;
  }
  
  .checklist { list-style: none; padding: 0; }
  .checklist li { padding: 8px 0; font-size: 14px; color: var(--text-muted); display: flex; align-items: center; gap: 10px; }
  .checklist li::before { content: '✓'; color: var(--emerald); font-weight: 700; }
  
  .signal-flow {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 16px;
    margin: 32px 0;
    font-size: 16px;
    font-weight: 600;
  }
  .signal-flow .arrow { color: var(--cyan); font-size: 20px; }
  .signal-flow .node { background: var(--bg-card); border: 1px solid var(--border); padding: 12px 24px; border-radius: 12px; }
  .signal-flow .node.active { border-color: var(--cyan); color: var(--cyan); }
  
  .footer {
    text-align: center;
    padding: 40px;
    font-size: 12px;
    color: var(--text-dim);
    border-top: 1px solid var(--border);
  }
  
  @media print {
    body { background: #fff; color: #1a1a2e; }
    .cover::before, .cover::after { display: none; }
    .metric-value { color: #0891b2; }
    th { color: #0891b2; background: #f1f5f9; }
    .info-card, .metric-card { border-color: #e2e8f0; }
  }
</style>
</head>
<body>

<!-- COVER -->
<div class="page cover">
  <div class="cover-badge"><div class="dot"></div> Confidential — Investor Materials</div>
  <p class="stream-tag">SIGNAL → SILICON</p>
  <h1><span>CMPSBL®</span></h1>
  <h1 style="font-size:32px;margin-bottom:8px;">The Memory Stream</h1>
  <p class="subtitle">The continuous substrate of evolving software systems. 40 nodes across 12 sectors. 675+ capabilities. 14 documented industry firsts. Raw signal enters — production-grade software crystallizes out.</p>
  
  <div class="signal-flow">
    <div class="node active">Signal</div>
    <div class="arrow">→</div>
    <div class="node">Stream</div>
    <div class="arrow">→</div>
    <div class="node">Crystallize</div>
    <div class="arrow">→</div>
    <div class="node active">Silicon</div>
  </div>
  
  <p class="meta-line">
    Generated ${date}<br/>
    <a href="https://cmpsbl.com">cmpsbl.com</a> · Kenneth E. Sweet Jr., Founder
  </p>
</div>

<!-- METRICS -->
<div class="page">
  <h2>The Memory Stream — At a Glance</h2>
  <div class="metrics-grid">
    <div class="metric-card"><div class="metric-value">38</div><div class="metric-label">Stream Nodes</div></div>
    <div class="metric-card"><div class="metric-value">675+</div><div class="metric-label">Capabilities</div></div>
    <div class="metric-card"><div class="metric-value">14</div><div class="metric-label">World Firsts</div></div>
    <div class="metric-card"><div class="metric-value">12</div><div class="metric-label">Sectors</div></div>
  </div>

  <h2>Investment Thesis</h2>
  <div class="highlight-box">
    <p style="font-size:18px;font-weight:300;color:var(--text);line-height:1.8;">
      CMPSBL is building the Memory Stream — a cognitive operating system where raw AI signals <strong style="color:var(--cyan);">crystallize</strong> into production-grade software. 
      Systems that <strong style="color:var(--cyan);">remember</strong>, <strong style="color:var(--cyan);">learn</strong>, and <strong style="color:var(--cyan);">evolve</strong>. 
      The infrastructure layer for the next generation of AI applications — from software to silicon.
    </p>
  </div>

  <div class="card-grid">
    <div class="info-card">
      <h3>The Problem</h3>
      <p>Every company building AI solves the same infrastructure problems — memory, learning, security, routing — costing $500K–$2M+ each time. No persistent state. No self-improvement. No governed execution.</p>
    </div>
    <div class="info-card">
      <h3>The Memory Stream Solution</h3>
      <p>A continuous substrate where intelligence crystallizes into deployable pipelines. Persistent memory, self-evolution, multi-provider routing, enterprise security — production-ready from the stream.</p>
    </div>
  </div>
</div>

<!-- WORLD FIRSTS -->
<div class="page">
  <h2>14 Documented World Firsts</h2>
  <p style="font-size:14px;color:var(--text-dim);margin-bottom:24px;font-style:italic;">
    To the best of our knowledge, the following are industry firsts achieved by CMPSBL® through the Memory Stream substrate. We welcome any evidence of prior art.
  </p>
  <table>
    <thead>
      <tr>
        <th>Achievement</th>
        <th>Description</th>
        <th>Evidence</th>
      </tr>
    </thead>
    <tbody>${worldFirstsRows}</tbody>
  </table>
</div>

<!-- SIGNAL → SILICON PIPELINE -->
<div class="page">
  <h2>Signal → Silicon Pipeline</h2>
  <p style="color:var(--text-muted);margin-bottom:24px;">Crystallized pipelines unlock export languages based on quality score — culminating in hardware description languages at the highest tiers.</p>
  
  <table>
    <thead><tr><th>CJPI Score</th><th>Tier</th><th>Export Languages</th></tr></thead>
    <tbody>
      <tr><td style="padding:12px 16px;border-bottom:1px solid var(--border);color:var(--emerald);font-weight:600;">68+</td><td style="padding:12px 16px;border-bottom:1px solid var(--border);color:var(--text);">Tier 1 · Mint</td><td style="padding:12px 16px;border-bottom:1px solid var(--border);color:var(--text-muted);">PHP, Ruby, Lua, Dart, Swift, Kotlin</td></tr>
      <tr><td style="padding:12px 16px;border-bottom:1px solid var(--border);color:var(--cyan);font-weight:600;">78+</td><td style="padding:12px 16px;border-bottom:1px solid var(--border);color:var(--text);">Tier 2 · Prime</td><td style="padding:12px 16px;border-bottom:1px solid var(--border);color:var(--text-muted);">TypeScript, Python, Go, Java, C#</td></tr>
      <tr><td style="padding:12px 16px;border-bottom:1px solid var(--border);color:var(--amber);font-weight:600;">86+</td><td style="padding:12px 16px;border-bottom:1px solid var(--border);color:var(--text);">Tier 3 · Relic</td><td style="padding:12px 16px;border-bottom:1px solid var(--border);color:var(--text-muted);">Rust, C, C++, Zig, Scala, Haskell, Elixir</td></tr>
      <tr><td style="padding:12px 16px;border-bottom:1px solid var(--border);color:var(--violet);font-weight:600;">94+</td><td style="padding:12px 16px;border-bottom:1px solid var(--border);color:var(--text);">Tier 4 · Silicon</td><td style="padding:12px 16px;border-bottom:1px solid var(--border);color:var(--cyan);">Verilog, VHDL, SPICE</td></tr>
    </tbody>
  </table>
  
  <div class="highlight-box">
    <h3 style="color:var(--text);margin-bottom:12px;">The "Silicon" Endgame</h3>
    <p style="color:var(--text-muted);">At the highest quality tier (94+ CJPI), crystallized pipelines can be materialized into hardware description languages — Verilog, VHDL, and SPICE. This is not hypothetical. This is the literal Signal → Silicon pathway: raw intelligence that becomes physical hardware.</p>
  </div>

  <h2>Business Model</h2>
  <table>
    <thead><tr><th>Revenue Stream</th><th>Model</th><th>Gross Margin</th></tr></thead>
    <tbody>
      <tr><td style="padding:12px 16px;border-bottom:1px solid var(--border);color:var(--text);font-weight:600;">Memory Stream SaaS</td><td style="padding:12px 16px;border-bottom:1px solid var(--border);color:var(--text-muted);">Monthly subscriptions (Free → $79/mo) with pipeline packs</td><td style="padding:12px 16px;border-bottom:1px solid var(--border);color:var(--emerald);">90%+</td></tr>
      <tr><td style="padding:12px 16px;border-bottom:1px solid var(--border);color:var(--text);font-weight:600;">CMPSBL Local Licensing</td><td style="padding:12px 16px;border-bottom:1px solid var(--border);color:var(--text-muted);">Standalone substrate (Free → Enterprise)</td><td style="padding:12px 16px;border-bottom:1px solid var(--border);color:var(--emerald);">90%+</td></tr>
      <tr><td style="padding:12px 16px;border-bottom:1px solid var(--border);color:var(--text);font-weight:600;">Pipeline Marketplace</td><td style="padding:12px 16px;border-bottom:1px solid var(--border);color:var(--text-muted);">Revenue share on crystallized pipelines</td><td style="padding:12px 16px;border-bottom:1px solid var(--border);color:var(--emerald);">80%</td></tr>
      <tr><td style="padding:12px 16px;border-bottom:1px solid var(--border);color:var(--text);font-weight:600;">Sealed Engine Licensing</td><td style="padding:12px 16px;border-bottom:1px solid var(--border);color:var(--text-muted);">20 black-boxed runtimes from highest-tier pipelines</td><td style="padding:12px 16px;border-bottom:1px solid var(--border);color:var(--emerald);">95%</td></tr>
    </tbody>
  </table>

  <h2>Revenue Projections</h2>
  <table>
    <thead><tr><th>Year</th><th>ARR Target</th><th>Customers</th></tr></thead>
    <tbody>
      <tr><td style="padding:12px 16px;border-bottom:1px solid var(--border);color:var(--text);">2026</td><td style="padding:12px 16px;border-bottom:1px solid var(--border);color:var(--cyan);font-weight:600;">$500K</td><td style="padding:12px 16px;border-bottom:1px solid var(--border);color:var(--text-muted);">20</td></tr>
      <tr><td style="padding:12px 16px;border-bottom:1px solid var(--border);color:var(--text);">2027</td><td style="padding:12px 16px;border-bottom:1px solid var(--border);color:var(--cyan);font-weight:600;">$3M</td><td style="padding:12px 16px;border-bottom:1px solid var(--border);color:var(--text-muted);">80</td></tr>
      <tr><td style="padding:12px 16px;border-bottom:1px solid var(--border);color:var(--text);">2028</td><td style="padding:12px 16px;border-bottom:1px solid var(--border);color:var(--cyan);font-weight:600;">$15M</td><td style="padding:12px 16px;border-bottom:1px solid var(--border);color:var(--text-muted);">300</td></tr>
      <tr><td style="padding:12px 16px;border-bottom:1px solid var(--border);color:var(--text);">2029</td><td style="padding:12px 16px;border-bottom:1px solid var(--border);color:var(--cyan);font-weight:600;">$50M</td><td style="padding:12px 16px;border-bottom:1px solid var(--border);color:var(--text-muted);">800</td></tr>
    </tbody>
  </table>
</div>

<!-- MOATS & TEAM -->
<div class="page">
  <h2>Compounding Moats</h2>
  <div class="card-grid">
    <div class="info-card">
      <h3>Memory Stream Architecture</h3>
      <p>40 nodes across 12 sectors designed as a unified, evolving substrate — extremely hard to replicate. The architecture compounds.</p>
    </div>
    <div class="info-card">
      <h3>Self-Evolution (SEBA)</h3>
      <p>The stream improves its own systems with cryptographic stamps. The technical gap widens daily — autonomously.</p>
    </div>
    <div class="info-card">
      <h3>Accumulated Crystallization</h3>
      <p>Every crystallized pipeline enriches the stream. Patterns from CLM Engine compound over time — can't be recreated quickly.</p>
    </div>
    <div class="info-card">
      <h3>Signal → Silicon Pathway</h3>
      <p>The only platform where software intelligence can materialize into hardware descriptions. Unique market position.</p>
    </div>
  </div>

  <h2 style="margin-top:48px;">Technical Milestones</h2>
  <ul class="checklist">
    <li>40-node Memory Stream: 12 sectors with 675+ capabilities</li>
    <li>Self-evolution engine operational (SEBA) with cryptographic stamps</li>
    <li>Multi-provider AI routing (NEXUS Fleet v5.0)</li>
    <li>Memory Stream crystallization with quality floor enforcement (68+)</li>
    <li>Pipeline tier system: Mint → Prime → Relic → Mythic → Apex</li>
    <li>Signal → Silicon export pipeline (Tier 4: Verilog, VHDL, SPICE)</li>
    <li>Autonomous learning cycles (CLM Engine v2.0)</li>
    <li>Intent Mesh distributed crystallization (100+ pipelines)</li>
    <li>ENCODE governed code execution with graduated autonomy</li>
    <li>Universal Brain Transfer Pipeline</li>
    <li>Memory consolidation with staleness detection</li>
    <li>AI Governance Namespace (AIGVRN v1.0) published</li>
    <li>20 Sealed Engines crystallized from highest-tier pipelines</li>
  </ul>

  <h2 style="margin-top:48px;">Leadership</h2>
  <div class="info-card" style="margin-top:16px;">
    <h3 style="color:var(--text);">Kenneth E. Sweet Jr.</h3>
    <p><strong>Founder & Chief Cognitive Engineer</strong></p>
    <p style="margin-top:8px;">Creator and architect of the 40-node Memory Stream substrate. Deep expertise in cognitive systems, AI infrastructure, and the Signal → Silicon pipeline.</p>
    <p style="margin-top:8px;">ORCID: 0009-0001-4237-1243</p>
  </div>

  <h2 style="margin-top:48px;">Contact</h2>
  <div class="info-card" style="margin-top:16px;">
    <p><strong>Email:</strong> Dev@CMPSBL.com</p>
    <p><strong>Phone:</strong> (760) FLUID-AI</p>
    <p><strong>Web:</strong> <a href="https://cmpsbl.com" style="color:var(--cyan);text-decoration:none;">cmpsbl.com</a></p>
  </div>
</div>

<div class="footer">
  <p>CMPSBL® — Signal → Silicon · The Memory Stream</p>
  <p style="margin-top:4px;">Confidential — For Investor Evaluation · © 2025–2026 CMPSBL®</p>
</div>

</body>
</html>`;
}

export function downloadInvestorDeck() {
  const html = generateInvestorDeckHTML();
  const filename = `CMPSBL-Investor-Deck-${new Date().toISOString().split('T')[0]}.html`;
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
