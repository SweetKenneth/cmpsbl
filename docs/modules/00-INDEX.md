<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<title>CMPSBL OS Substrate — Module Deep Dives</title>
<style>
  body{font-family:Georgia,"Times New Roman",serif;font-size:11pt;line-height:1.4;color:#111;background:#fff;margin:0}
  .page{max-width:8.5in;margin:0 auto;padding:0.8in}
  h1{font-size:20pt;margin-bottom:0.3in}
  h2{font-size:14pt;margin-top:0.4in}
  h3{font-size:12pt;margin-top:0.25in}
  p{margin-bottom:0.14in}
  ul,ol{margin-left:0.25in}
  table{width:100%;border-collapse:collapse;margin:0.2in 0}
  th,td{border:1px solid #ccc;padding:6px 8px}
  th{background:#f3f3f3;text-align:left}
  .card{border:1px solid #ddd;border-radius:10px;padding:0.2in;margin-bottom:0.25in}
  hr{border:none;border-top:1px solid #ccc;margin:0.3in 0}
  a{color:#333;text-decoration:underline}
  @media print{@page{size:Letter;margin:0.8in}.card{break-inside:avoid}}
</style>
</head>
<body>
<div class="page">

<h1>CMPSBL OS Substrate — Module Deep Dives</h1>
<p><strong>Complete Reference for All 21 Modules</strong></p>
<p><strong>v10.5.4 ARCHITECT Epoch</strong></p>
<hr />

<h2>Module Map</h2>

<p>The substrate consists of <strong>21 modules</strong> across <strong>6 architectural layers</strong>, each with a specific role in the cognitive operating system.</p>

<div class="card">
<h3>Layer 1 — Kernel</h3>
<table>
<tr><th>Doc</th><th>Module</th><th>Purpose</th></tr>
<tr><td><a href="./01-CORE.md">01</a></td><td><strong>CORE</strong></td><td>Foundation primitives, health, lifecycle</td></tr>
<tr><td><a href="./02-RIPPLE.md">02</a></td><td><strong>RIPPLE</strong></td><td>Event bus, message routing, job queue</td></tr>
<tr><td><a href="./03-ACCESS.md">03</a></td><td><strong>ACCESS</strong></td><td>Authentication, API keys, entitlements</td></tr>
</table>
</div>

<div class="card">
<h3>Layer 2 — Cognitive</h3>
<table>
<tr><th>Doc</th><th>Module</th><th>Purpose</th></tr>
<tr><td><a href="./04-BRAIN.md">04</a></td><td><strong>BRAIN</strong></td><td>Four-tier memory system with Universal Brain Transfer Pipeline</td></tr>
<tr><td><a href="./05-DECODE.md">05</a></td><td><strong>DECODE</strong></td><td>Natural language → structured intent</td></tr>
<tr><td><a href="./06-DREAM.md">06</a></td><td><strong>DREAM</strong></td><td>Autonomous learning, creative synthesis</td></tr>
</table>
</div>

<div class="card">
<h3>Layer 3 — Operational</h3>
<table>
<tr><th>Doc</th><th>Module</th><th>Purpose</th></tr>
<tr><td><a href="./07-DEFENSE.md">07</a></td><td><strong>DEFENSE</strong></td><td>Security perimeter, threat detection</td></tr>
<tr><td><a href="./08-NEXUS.md">08</a></td><td><strong>NEXUS</strong></td><td>AI fleet routing (v5.0.0), cost optimization</td></tr>
<tr><td><a href="./09-VISION.md">09</a></td><td><strong>VISION</strong></td><td>Observability, metrics, trend analysis</td></tr>
<tr><td><a href="./10-INTEGRATION.md">10</a></td><td><strong>INTEGRATION</strong></td><td>External system adapters</td></tr>
</table>
</div>

<div class="card">
<h3>Layer 4 — Administrative</h3>
<table>
<tr><th>Doc</th><th>Module</th><th>Purpose</th></tr>
<tr><td><a href="./11-SYSTEM.md">11</a></td><td><strong>SYSTEM</strong></td><td>Lifecycle orchestration, backup/restore</td></tr>
<tr><td><a href="./12-MODERNIZER.md">12</a></td><td><strong>MODERNIZER</strong></td><td>Evolution engine, self-improvement (SEBA)</td></tr>
<tr><td><a href="./13-INCLUSIVE.md">13</a></td><td><strong>INCLUSIVE</strong></td><td>Accessibility, WCAG compliance</td></tr>
</table>
</div>

<div class="card">
<h3>Layer 5 — Orchestrator</h3>
<table>
<tr><th>Doc</th><th>Module</th><th>Purpose</th></tr>
<tr><td><a href="./14-CORTEX.md">14</a></td><td><strong>CORTEX</strong></td><td>Meta-orchestration, proposal evaluation</td></tr>
<tr><td><a href="./22-ENCODE.md">22</a></td><td><strong>ENCODE</strong></td><td>Governed code execution engine, DECODE→ENCODE pipeline, CLM</td></tr>
</table>
</div>

<div class="card">
<h3>Layer 6 — Infrastructure</h3>
<table>
<tr><th>Doc</th><th>Module</th><th>Purpose</th></tr>
<tr><td><a href="./15-MEMORY.md">15</a></td><td><strong>MEMORY</strong></td><td>Vector store, RAG, embeddings, staleness detection</td></tr>
<tr><td><a href="./16-RELAY.md">16</a></td><td><strong>RELAY</strong></td><td>Webhooks, HMAC signatures, adaptive retry</td></tr>
<tr><td><a href="./17-AUDIT.md">17</a></td><td><strong>AUDIT</strong></td><td>Immutable compliance logging, SOC2/GDPR/HIPAA/ISO27001 reports</td></tr>
<tr><td><a href="./18-IDENTITY.md">18</a></td><td><strong>IDENTITY</strong></td><td>Actor attribution, reputation scoring, cross-agency portability</td></tr>
<tr><td><a href="./19-ECONOMY.md">19</a></td><td><strong>ECONOMY</strong></td><td>Cost tracking, predictive forecasting, per-capability attribution</td></tr>
<tr><td><a href="./20-SANDBOX.md">20</a></td><td><strong>SANDBOX</strong></td><td>Safe code execution, resource limits, state snapshots</td></tr>
</table>
</div>

<div class="card">
<h3>Reference</h3>
<table>
<tr><th>Doc</th><th>Type</th><th>Purpose</th></tr>
<tr><td><a href="./21-USER-MANUAL.md">21</a></td><td><strong>User Manual</strong></td><td>Complete usage guide</td></tr>
</table>
</div>

<hr />

<h2>Cross-Cutting Systems (v10.5.4)</h2>

<table>
<tr><th>System</th><th>Description</th></tr>
<tr><td><strong>CLM Engine v2.0</strong></td><td>Server-side 24/7 autonomous learning (5-minute cycles via cron)</td></tr>
<tr><td><strong>Brain Transfer Pipeline</strong></td><td>Universal knowledge distribution from BRAIN to all 21 modules</td></tr>
<tr><td><strong>Memory Consolidation</strong></td><td>Automated hot/warm/cold tiering with promotion, demotion, and pruning</td></tr>
<tr><td><strong>Nexus Fleet v5.0.0</strong></td><td>Multi-provider AI routing with health-weighted selection and RPM governance</td></tr>
<tr><td><strong>Intent Mesh</strong></td><td>60+ crystallized pipelines via emergent capability discovery and composition</td></tr>
<tr><td><strong>DECODE → ENCODE</strong></td><td>Governed natural-language-to-code pipeline with graduated autonomy</td></tr>
<tr><td><strong>Crown Jewels</strong></td><td>21 Crown Jewel capabilities — one per module across all tiers</td></tr>
<tr><td><strong>Truth Verification</strong></td><td>Automated parity checks between Dashboard, Terminal, and Registry</td></tr>
<tr><td><strong>Telemetry Aggregator</strong></td><td>Unified observability across usage, access, and brain event tables</td></tr>
</table>

<hr />

<p><em>CMPSBL OS Substrate v10.8.0 — ARCHITECT Epoch</em></p>
<p><strong>Kenneth E Sweet Jr</strong> · PromptFluid®<br />
ORCID: <a href="https://orcid.org/0009-0001-4237-1243">0009-0001-4237-1243</a><br />
DOI: <a href="https://doi.org/10.5281/zenodo.18234909">10.5281/zenodo.18234909</a></p>
<p>© 2025–2026 PromptFluid®. All rights reserved.</p>

</div>
</body>
</html>
