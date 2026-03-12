/**
 * Client-side User Guide Generator
 * Generates a downloadable HTML user guide themed with Memory Stream identity
 */

export function generateUserGuideHTML(): string {
  const date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>CMPSBL® — Memory Stream User Guide | ${date}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;900&family=JetBrains+Mono:wght@400;500&display=swap');
  
  :root {
    --bg: #0a0e1a;
    --bg-card: #0f1629;
    --bg-accent: #141b2d;
    --border: #1a2744;
    --cyan: #22d3ee;
    --cyan-dim: rgba(34,211,238,0.12);
    --violet: #8b5cf6;
    --violet-dim: rgba(139,92,246,0.12);
    --text: #e2e8f0;
    --text-muted: #94a3b8;
    --text-dim: #64748b;
    --emerald: #10b981;
    --amber: #f59e0b;
    --sky: #38bdf8;
    --primary: #22d3ee;
  }
  
  * { margin: 0; padding: 0; box-sizing: border-box; }
  
  body {
    font-family: 'Inter', -apple-system, sans-serif;
    background: var(--bg);
    color: var(--text);
    line-height: 1.7;
    font-size: 15px;
  }
  
  .page { max-width: 860px; margin: 0 auto; padding: 60px 40px; }
  
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
    top: 15%;
    left: -15%;
    width: 500px;
    height: 500px;
    background: radial-gradient(circle, var(--cyan-dim) 0%, transparent 70%);
    border-radius: 50%;
    pointer-events: none;
  }
  
  .cover::after {
    content: '';
    position: absolute;
    bottom: 20%;
    right: -10%;
    width: 400px;
    height: 400px;
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
  
  @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
  
  h1 { font-size: 52px; font-weight: 900; letter-spacing: -2px; margin-bottom: 16px; line-height: 1.1; }
  h1 span { font-weight: 900; background: linear-gradient(135deg, var(--cyan), var(--violet)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
  h2 { font-size: 26px; font-weight: 700; margin: 48px 0 20px; color: var(--text); border-bottom: 1px solid var(--border); padding-bottom: 12px; }
  h3 { font-size: 18px; font-weight: 600; margin: 32px 0 12px; color: var(--cyan); }
  h4 { font-size: 15px; font-weight: 600; margin: 20px 0 8px; color: var(--text); }
  
  .subtitle { font-size: 20px; color: var(--text-muted); max-width: 600px; margin-bottom: 40px; line-height: 1.6; }
  
  .meta-line { font-size: 12px; color: var(--text-dim); margin-top: 48px; }
  .meta-line a { color: var(--cyan); text-decoration: none; }
  
  .toc { background: var(--bg-card); border: 1px solid var(--border); border-radius: 16px; padding: 32px; margin: 32px 0; }
  .toc h3 { color: var(--text); margin-top: 0; }
  .toc ol { padding-left: 20px; }
  .toc li { padding: 6px 0; color: var(--text-muted); font-size: 14px; }
  .toc a { color: var(--cyan); text-decoration: none; }
  .toc a:hover { text-decoration: underline; }
  
  .card { background: var(--bg-card); border: 1px solid var(--border); border-radius: 12px; padding: 24px; margin: 16px 0; }
  .card-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin: 24px 0; }
  
  .step { background: var(--bg-card); border: 1px solid var(--border); border-radius: 12px; padding: 24px; margin: 16px 0; position: relative; padding-left: 64px; }
  .step-num { position: absolute; left: 20px; top: 24px; width: 32px; height: 32px; background: linear-gradient(135deg, var(--cyan), var(--violet)); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 14px; color: white; }
  
  code { font-family: 'JetBrains Mono', monospace; background: var(--bg-accent); padding: 2px 6px; border-radius: 4px; font-size: 13px; color: var(--cyan); }
  
  pre { background: var(--bg-accent); border: 1px solid var(--border); border-radius: 12px; padding: 20px; margin: 16px 0; overflow-x: auto; }
  pre code { background: none; padding: 0; font-size: 13px; color: var(--text); line-height: 1.6; }
  
  .highlight { background: linear-gradient(135deg, var(--cyan-dim), var(--violet-dim)); border: 1px solid var(--border); border-radius: 16px; padding: 32px; margin: 32px 0; }
  
  .tier-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 12px; margin: 20px 0; }
  .tier-card { background: var(--bg-card); border: 1px solid var(--border); border-radius: 10px; padding: 16px; text-align: center; }
  .tier-name { font-size: 14px; font-weight: 700; margin-bottom: 4px; }
  .tier-range { font-size: 12px; color: var(--text-dim); }
  
  .checklist { list-style: none; padding: 0; }
  .checklist li { padding: 8px 0; font-size: 14px; color: var(--text-muted); display: flex; align-items: flex-start; gap: 10px; }
  .checklist li::before { content: '◉'; color: var(--cyan); font-weight: 700; flex-shrink: 0; }
  
  .warning { background: rgba(245,158,11,0.08); border: 1px solid rgba(245,158,11,0.25); border-radius: 12px; padding: 20px; margin: 16px 0; }
  .warning::before { content: '⚠ '; color: var(--amber); font-weight: 700; }
  
  .footer { text-align: center; padding: 40px; font-size: 12px; color: var(--text-dim); border-top: 1px solid var(--border); }
  
  table { width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 14px; }
  th { text-align: left; padding: 10px 14px; background: var(--bg-accent); color: var(--cyan); font-size: 11px; text-transform: uppercase; letter-spacing: 1px; border-bottom: 2px solid var(--border); }
  td { padding: 10px 14px; border-bottom: 1px solid var(--border); color: var(--text-muted); }
  
  @media print {
    body { background: #fff; color: #1a1a2e; }
    .cover::before, .cover::after { display: none; }
    code { color: #0891b2; background: #f1f5f9; }
    .card, .step, .toc, pre { border-color: #e2e8f0; background: #f8fafc; }
  }
</style>
</head>
<body>

<!-- COVER -->
<div class="page cover">
  <div class="cover-badge"><div class="dot"></div> Memory Stream User Guide</div>
  <h1>The <span>Memory Stream</span></h1>
  <h1 style="font-size:32px;font-weight:300;margin-bottom:12px;">Signal → Silicon</h1>
  <p class="subtitle">
    A comprehensive guide to the CMPSBL® Memory Stream — the continuous substrate of evolving software systems. 
    Learn to crystallize pipelines, manage your vault, and harness the full power of the cognitive substrate.
  </p>
  <p class="meta-line">
    Generated ${date}<br/>
    <a href="https://cmpsbl.com">cmpsbl.com</a> · CMPSBL® Memory Stream Documentation
  </p>
</div>

<!-- TABLE OF CONTENTS -->
<div class="page">
  <div class="toc">
    <h3>Contents</h3>
    <ol>
      <li><a href="#overview">What is the Memory Stream?</a></li>
      <li><a href="#getting-started">Getting Started</a></li>
      <li><a href="#crystallization">Crystallizing Pipelines</a></li>
      <li><a href="#tiers">Pipeline Tiers & Quality</a></li>
      <li><a href="#vault">Your Vault</a></li>
      <li><a href="#pipeline-packs">Pipeline Packs & Slots</a></li>
      <li><a href="#export">Materializing (Exporting) Pipelines</a></li>
      <li><a href="#substrate-os">The Substrate OS Dashboard</a></li>
      <li><a href="#terminal">Memory Stream Terminal</a></li>
      <li><a href="#workspace">Builder Workspace</a></li>
      <li><a href="#architecture">40-Node Architecture</a></li>
      <li><a href="#faq">FAQ</a></li>
    </ol>
  </div>

  <h2 id="overview">1. What is the Memory Stream?</h2>
  <p>The Memory Stream is a continuous substrate of evolving software systems. It is not a marketplace, not a template gallery — it is a <strong>living production environment</strong> where real software systems crystallize from raw signals.</p>
  
  <div class="highlight">
    <p style="font-size:18px;font-weight:300;line-height:1.8;">
      <strong style="color:var(--cyan);">Signal → Silicon:</strong> Raw intelligence enters the stream as signal. 
      The substrate samples, scores, and crystallizes viable pipelines — production-grade software 
      you can export, deploy, and own. Every pull is real. Every pipeline is scored.
    </p>
  </div>

  <h3>Core Concepts</h3>
  <ul class="checklist">
    <li><strong>Crystallization</strong> — The process of extracting a viable pipeline from the Memory Stream</li>
    <li><strong>Pipeline</strong> — A scored, tiered piece of production software crystallized from the stream</li>
    <li><strong>Vault</strong> — Your personal inventory of crystallized pipelines</li>
    <li><strong>Quality Floor</strong> — Every pipeline scores 68+ (CJPI score). No filler. Only stable systems survive.</li>
    <li><strong>Materialization</strong> — Exporting a pipeline into the CMPSBL® Mini-Runtime™ Engine you own</li>
  </ul>
</div>

<!-- GETTING STARTED -->
<div class="page">
  <h2 id="getting-started">2. Getting Started</h2>
  <p>Follow these steps to begin crystallizing from the Memory Stream:</p>
  
  <div class="step">
    <div class="step-num">1</div>
    <h4>Create Your Account</h4>
    <p>Sign up at <a href="https://cmpsbl.com/auth" style="color:var(--cyan);">cmpsbl.com/auth</a>. Free accounts get immediate access to crystallization, 3 pipeline slots, and the full substrate terminal.</p>
  </div>

  <div class="step">
    <div class="step-num">2</div>
    <h4>Enter the Stream</h4>
    <p>Navigate to the Memory Stream page. You'll see the MemoryRiver visualization — a flowing representation of the substrate's evolving software systems.</p>
  </div>

  <div class="step">
    <div class="step-num">3</div>
    <h4>Crystallize Your First Pipeline</h4>
    <p>Click <strong>"Crystallize Pipeline"</strong>. The engine samples the stream, condenses the topology, and crystallizes a viable pipeline. Every result scores 68+ and includes full provenance.</p>
  </div>

  <div class="step">
    <div class="step-num">4</div>
    <h4>Review in Your Vault</h4>
    <p>Switch to the Vault tab to see all your crystallized pipelines. Each shows its CJPI score, tier, name, and materialization options.</p>
  </div>

  <h3>Free Tier Includes</h3>
  <ul class="checklist">
    <li>Unlimited crystallization attempts</li>
    <li>3 pipeline slots for active packs</li>
    <li>Full vault access with persistent storage</li>
    <li>12 core terminal commands</li>
    <li>Builder workspace with SDK templates</li>
    <li>Tier 1 export languages (PHP, Ruby, Lua, Dart, Swift, Kotlin)</li>
  </ul>
</div>

<!-- TIERS -->
<div class="page">
  <h2 id="crystallization">3. Crystallizing Pipelines</h2>
  <p>Crystallization is the core action in the Memory Stream. When you crystallize:</p>
  <ol style="padding-left:20px;margin:16px 0;">
    <li style="padding:4px 0;color:var(--text-muted);">The engine <strong>samples</strong> the Memory Stream for viable candidates</li>
    <li style="padding:4px 0;color:var(--text-muted);">It <strong>condenses</strong> the topology — filtering and scoring</li>
    <li style="padding:4px 0;color:var(--text-muted);">A pipeline <strong>crystallizes</strong> with a CJPI score (68–100)</li>
  </ol>
  
  <div class="warning">The quality floor is enforced at 68. Any signal below this threshold is discarded. You will never receive a low-quality pipeline.</div>

  <h2 id="tiers">4. Pipeline Tiers & Quality</h2>
  <p>Every crystallized pipeline is assigned a tier based on its CJPI (Crown Jewel Pipeline Index) score:</p>
  
  <div class="tier-grid">
    <div class="tier-card">
      <div class="tier-name" style="color:var(--emerald);">Mint</div>
      <div class="tier-range">68 – 79</div>
    </div>
    <div class="tier-card">
      <div class="tier-name" style="color:var(--sky);">Prime</div>
      <div class="tier-range">80 – 89</div>
    </div>
    <div class="tier-card">
      <div class="tier-name" style="color:var(--amber);">Relic</div>
      <div class="tier-range">90 – 93</div>
    </div>
    <div class="tier-card">
      <div class="tier-name" style="color:var(--violet);">Mythic</div>
      <div class="tier-range">94 – 99</div>
    </div>
    <div class="tier-card">
      <div class="tier-name" style="color:var(--cyan);">Apex</div>
      <div class="tier-range">100</div>
    </div>
  </div>

  <h3>Export Languages by Tier</h3>
  <table>
    <thead><tr><th>Score</th><th>Tier</th><th>Available Languages</th></tr></thead>
    <tbody>
      <tr><td>68+</td><td style="color:var(--emerald);font-weight:600;">Tier 1</td><td>PHP, Ruby, Lua, Dart, Swift, Kotlin</td></tr>
      <tr><td>78+</td><td style="color:var(--sky);font-weight:600;">Tier 2</td><td>TypeScript, Python, Go, Java, C#</td></tr>
      <tr><td>86+</td><td style="color:var(--amber);font-weight:600;">Tier 3</td><td>Rust, C, C++, Zig, Scala, Haskell, Elixir</td></tr>
      <tr><td>94+</td><td style="color:var(--violet);font-weight:600;">Tier 4</td><td>Verilog, VHDL, SPICE (Hardware / Silicon)</td></tr>
    </tbody>
  </table>
  <p style="font-size:13px;color:var(--text-dim);">Hardware/HDL exports are strictly hidden for pipelines below 94. This is the "Signal → Silicon" pathway.</p>
</div>

<!-- VAULT & PACKS -->
<div class="page">
  <h2 id="vault">5. Your Vault</h2>
  <p>The Vault is your personal, persistent inventory of crystallized pipelines. It is:</p>
  <ul class="checklist">
    <li><strong>Per-user isolated</strong> — Enforced via Row-Level Security. Only you see your vault.</li>
    <li><strong>Persistent</strong> — Pipelines are stored permanently until you choose to discard them.</li>
    <li><strong>Searchable</strong> — Filter by tier, score, name, or crystallization date.</li>
  </ul>

  <h2 id="pipeline-packs">6. Pipeline Packs & Slots</h2>
  <p>Pipeline Packs are curated capability bundles that extend what you can do with the substrate.</p>
  
  <div class="card">
    <h4>How Packs Work</h4>
    <ul class="checklist">
      <li>24 pipeline packs across 6 strategic domains</li>
      <li>Each pack uses exactly 1 slot when activated</li>
      <li>Free plan includes 3 slots. Upgrade for more.</li>
      <li>Activation is atomic and server-enforced — no race conditions</li>
      <li>Swap packs anytime — deactivate one, activate another</li>
    </ul>
  </div>

  <h2 id="export">7. Materializing Pipelines</h2>
  <p><strong>Materialization</strong> is the process of exporting a crystallized pipeline into the CMPSBL® Mini-Runtime™ Engine you own. Every materialized pipeline includes:</p>
  <ul class="checklist">
    <li>The <strong>CMPSBL® Mini-Runtime™ Engine</strong> — portable runtime</li>
    <li>A functional <strong>test harness</strong></li>
    <li>Full <strong>provenance metadata</strong> (CJPI score, crystallization timestamp, tier)</li>
    <li>Language-appropriate <strong>build configuration</strong></li>
  </ul>
</div>

<!-- SUBSTRATE OS -->
<div class="page">
  <h2 id="substrate-os">8. The Substrate OS Dashboard</h2>
  <p>The dashboard is your command center for the entire 40-node substrate. Key surfaces:</p>
  
  <div class="card-grid">
    <div class="card">
      <h4 style="color:var(--cyan);margin-top:0;">Command Center</h4>
      <p style="font-size:13px;color:var(--text-muted);">Health ring, 4 KPI cards, and the interactive 12-sector topology map showing all node statuses.</p>
    </div>
    <div class="card">
      <h4 style="color:var(--amber);margin-top:0;">INTENT Hub</h4>
      <p style="font-size:13px;color:var(--text-muted);">50-message scrollable feed of system-driven requests with Reply, Approve, Reject, and Acknowledge actions.</p>
    </div>
    <div class="card">
      <h4 style="color:var(--emerald);margin-top:0;">Stream Controls</h4>
      <p style="font-size:13px;color:var(--text-muted);">Direct entry points for Auto-Heal, Backup, Terminal, and the Memory Stream crystallization workspace.</p>
    </div>
    <div class="card">
      <h4 style="color:var(--violet);margin-top:0;">Stream Security</h4>
      <p style="font-size:13px;color:var(--text-muted);">DEFENSE analytics, immunity mesh, audit logs, patch authoring, and backup/restore.</p>
    </div>
  </div>

  <h2 id="terminal">9. Memory Stream Terminal</h2>
  <p>The terminal is a full command-line interface to the substrate. Commands are tiered by your subscription:</p>
  
  <table>
    <thead><tr><th>Tier</th><th>Commands</th><th>Access Level</th></tr></thead>
    <tbody>
      <tr><td>Free</td><td style="color:var(--cyan);font-weight:600;">12 core</td><td>status, memory recall, crystallize, sdk init, help, and more</td></tr>
      <tr><td>Operator</td><td style="color:var(--sky);font-weight:600;">38</td><td>All free + defense, audit, evolution, dream controls</td></tr>
      <tr><td>Governor</td><td style="color:var(--violet);font-weight:600;">66 (all)</td><td>Absolute control — every system command and function</td></tr>
    </tbody>
  </table>

  <h3>Key Commands</h3>
  <pre><code>status              # Show substrate health and active nodes
memory recall       # Query persistent memory
crystallize         # Trigger a pipeline crystallization
sdk init [template] # Initialize SDK with MEMORY, DECODE, DEFENSE, or NEXUS
help                # List available commands for your tier
topology            # Display 12-sector node map
budget status       # View stream budget governance</code></pre>
</div>

<!-- WORKSPACE & ARCHITECTURE -->
<div class="page">
  <h2 id="workspace">10. Builder Workspace</h2>
  <p>The Workspace (<code>/workspace</code>) is your personal development environment on the substrate. It includes:</p>
  <ul class="checklist">
    <li><strong>SDK Templates</strong> — Pre-built starter templates for MEMORY, DECODE, DEFENSE, and NEXUS</li>
    <li><strong>In-browser Terminal</strong> — Full terminal access with your tier's command set</li>
    <li><strong>Pipeline Slot Management</strong> — View and manage your active pipeline packs</li>
    <li><strong>Memory Stream Access</strong> — Quick-link to the crystallization workspace</li>
  </ul>

  <h2 id="architecture">11. 40-Node Architecture</h2>
  <p>The substrate operates across 40 nodes organized into 12 sectors:</p>
  
  <table>
    <thead><tr><th>Sector</th><th>Systems</th><th>Purpose</th></tr></thead>
    <tbody>
      <tr><td>CORE</td><td>Core, System</td><td>Kernel orchestration & scheduling</td></tr>
      <tr><td>CCR</td><td>BRAIN, MEMORY, DREAM</td><td>Clockless Cognitive Reality — learning & recall</td></tr>
      <tr><td>OCG</td><td>RIPPLE, ACCESS, IDENTITY, RELAY, AUDIT, NERVE</td><td>Operational Compliance Grid</td></tr>
      <tr><td>Execution</td><td>DECODE, ENCODE, VISION, CORTEX, NEXUS, ECONOMY, SANDBOX, INCLUSIVE, MEDIC, INTEGRATION</td><td>Runtime execution layer</td></tr>
      <tr><td>ESZ</td><td>SOVEREIGN, ORACLE, CONSCIENCE, TREATY</td><td>Ethical Sovereignty Zone</td></tr>
      <tr><td>EPZ</td><td>COMPASS, ECHO, REFLEX</td><td>Environmental Perception Zone</td></tr>
      <tr><td>EMZ</td><td>FORGE, LINGUA, PHANTOM, HARVEST</td><td>Emergent Manufacturing Zone</td></tr>
      <tr><td>CSZ</td><td>EVOLUTION, SHADOW, PHANTOM</td><td>Cognitive Shadow Zone</td></tr>
      <tr><td>Field</td><td>IMMUNITY, INTENT</td><td>Field-level adaptive defense</td></tr>
      <tr><td>Plane</td><td>GOVERNANCE</td><td>Policy enforcement plane</td></tr>
      <tr><td>Shell</td><td>DEFENSE</td><td>Outermost security shell</td></tr>
    </tbody>
  </table>
  <p style="margin-top:12px;font-size:13px;color:var(--text-dim);">675+ capabilities · Σw = 1.000 · All weights normalized</p>
</div>

<!-- FAQ -->
<div class="page">
  <h2 id="faq">12. Frequently Asked Questions</h2>
  
  <h4>Is the Memory Stream a game?</h4>
  <p style="color:var(--text-muted);margin-bottom:20px;">No. Every crystallized pipeline is real, production-grade software. The stream is a controlled sampling process, not a randomized loot system.</p>

  <h4>What does the quality floor mean?</h4>
  <p style="color:var(--text-muted);margin-bottom:20px;">Every pipeline scores 68+ on the CJPI (Crown Jewel Pipeline Index). Signals below this threshold are discarded before they reach you. No filler, no padding.</p>

  <h4>Can I export to hardware languages?</h4>
  <p style="color:var(--text-muted);margin-bottom:20px;">Yes — but only for pipelines scoring 94+ (Mythic/Apex tier). Hardware languages (Verilog, VHDL, SPICE) are the "Silicon" end of Signal → Silicon and require the highest quality threshold.</p>

  <h4>What happens when my slots are full?</h4>
  <p style="color:var(--text-muted);margin-bottom:20px;">You can deactivate an existing pack to free a slot, or upgrade your plan for additional capacity. Activation is atomic — the system prevents overflows.</p>

  <h4>Is my vault private?</h4>
  <p style="color:var(--text-muted);margin-bottom:20px;">Yes. Your vault is isolated via Row-Level Security (RLS) with user_id = auth.uid(). No other user can see or access your crystallized pipelines.</p>

  <h4>What is the NEXUS router?</h4>
  <p style="color:var(--text-muted);margin-bottom:20px;">NEXUS is the multi-provider AI routing system. It health-weights across providers (OpenAI, Anthropic, Google, etc.) and selects the optimal path based on task type, latency, cost, and quality constraints.</p>

  <h4>How does the terminal tier system work?</h4>
  <p style="color:var(--text-muted);margin-bottom:20px;">Free users get 12 core commands. Operators unlock 38. Governors get all 66 commands with absolute substrate control. Free users are first-class citizens — core capabilities are never paywalled.</p>

  <h4>What is Signal → Silicon?</h4>
  <p style="color:var(--text-muted);margin-bottom:20px;">It's the core narrative of CMPSBL. Raw intelligence (signal) enters the Memory Stream, gets crystallized into production software (pipelines), and at the highest tiers, can be materialized into hardware description languages — literally becoming silicon.</p>

  <div class="highlight" style="margin-top:40px;">
    <h3 style="margin-top:0;color:var(--text);">Need Help?</h3>
    <p>Email: <a href="mailto:Dev@CMPSBL.com" style="color:var(--cyan);">Dev@CMPSBL.com</a></p>
    <p>Phone: (760) FLUID-AI</p>
    <p>Documentation: <a href="https://cmpsbl.com/documentation" style="color:var(--cyan);">cmpsbl.com/documentation</a></p>
    <p>Developer Portal: <a href="https://cmpsbl.com/developers" style="color:var(--cyan);">cmpsbl.com/developers</a></p>
  </div>
</div>

<div class="footer">
  <p>CMPSBL® — Signal → Silicon</p>
  <p style="margin-top:4px;">Memory Stream User Guide · © 2025–2026 CMPSBL®</p>
</div>

</body>
</html>`;
}

export function downloadUserGuide() {
  const html = generateUserGuideHTML();
  const filename = `CMPSBL-Memory-Stream-User-Guide-${new Date().toISOString().split('T')[0]}.html`;
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
