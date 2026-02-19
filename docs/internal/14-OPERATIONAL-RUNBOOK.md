<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<title>Operational Runbook — CMPSBL OS Substrate</title>
<style>
  body{font-family:Georgia,"Times New Roman",serif;font-size:11pt;line-height:1.4;color:#111;background:#fff;margin:0}
  .page{max-width:8.5in;margin:0 auto;padding:0.8in}
  h1{font-size:20pt;margin-bottom:0.3in}h2{font-size:14pt;margin-top:0.4in}h3{font-size:12pt;margin-top:0.25in}
  p{margin-bottom:0.14in}ul,ol{margin-left:0.25in}
  table{width:100%;border-collapse:collapse;margin:0.2in 0}th,td{border:1px solid #ccc;padding:6px 8px}th{background:#f3f3f3;text-align:left}
  pre{background:#f8f8f8;border:1px solid #ddd;padding:12px;font-family:"Courier New",monospace;font-size:10pt;overflow-x:auto;white-space:pre;margin:0.15in 0}
  code{font-family:"Courier New",monospace;font-size:10pt}
  .card{border:1px solid #ddd;border-radius:10px;padding:0.2in;margin-bottom:0.25in}
  hr{border:none;border-top:1px solid #ccc;margin:0.3in 0}
  @media print{@page{size:Letter;margin:0.8in}.card{break-inside:avoid}}
</style>
</head>
<body>
<div class="page">

<h1>🔒 Operational Runbook</h1>
<table>
<tr><td><strong>Document</strong></td><td>14 — Operational Runbook</td></tr>
<tr><td><strong>Classification</strong></td><td>🟡 MEDIUM</td></tr>
</table>
<hr />

<h2>Daily Operations</h2>

<h3>Morning Checklist</h3>
<ol>
<li>Check system health: <code>system.health_check</code></li>
<li>Review overnight dream cycle results: <code>dream.insights</code></li>
<li>Check for pending evolution proposals: <code>modernizer.history</code></li>
<li>Review security incidents: <code>defense.report</code></li>
<li>Check quota usage: <code>access.usage</code></li>
<li>Review cost report: <code>economy.report</code> (if available)</li>
</ol>

<h3>Module Health Response</h3>
<table>
<tr><th>Health Score</th><th>Action</th></tr>
<tr><td>70–100</td><td>No action needed</td></tr>
<tr><td>40–69</td><td>Monitor closely, check logs for root cause</td></tr>
<tr><td>&lt; 40</td><td>Auto-heal should trigger; if not, run <code>system.heal</code> manually</td></tr>
<tr><td>0</td><td>Module is down — check edge function deployment, restart if needed</td></tr>
</table>

<hr />

<h2>Troubleshooting Guide</h2>

<div class="card">
<h3>"Module X is degraded"</h3>
<ol>
<li>Check the module's health: <code>system.health_check</code></li>
<li>Check recent errors in VISION: <code>vision.alerts</code></li>
<li>Check if circuit breaker is open: look for <code>circuit.opened</code> events in RIPPLE</li>
<li>If auto-heal hasn't triggered, run: <code>system.heal { module: "X" }</code></li>
</ol>
</div>

<div class="card">
<h3>"AI responses are slow"</h3>
<ol>
<li>Check NEXUS provider health: <code>nexus.providers</code></li>
<li>Check if a provider is failing (triggering failover): look for <code>nexus.fallback.triggered</code> events</li>
<li>Check rate limits: <code>access.quota</code></li>
<li>Consider switching primary provider weights</li>
</ol>
</div>

<div class="card">
<h3>"Memory queries return nothing"</h3>
<ol>
<li>Check BRAIN health: <code>brain.status</code></li>
<li>Verify memories exist: <code>brain.query { query_text: "test", limit: 5 }</code></li>
<li>Check confidence gates — memories below 0.30 won't appear</li>
<li>Check if decay has archived old memories</li>
</ol>
</div>

<div class="card">
<h3>"Evolution was applied and things broke"</h3>
<ol>
<li>Identify the last evolution stamp: <code>modernizer.history { limit: 1 }</code></li>
<li>Rollback immediately: <code>modernizer.rollback { stamp_id: "..." }</code></li>
<li>Review the proposal to understand what changed</li>
<li>File the rollback as data for future evolution scoring</li>
</ol>
</div>

<hr />

<h2>Incident Response</h2>

<h3>Severity Levels</h3>
<table>
<tr><th>Level</th><th>Definition</th><th>Response Time</th></tr>
<tr><td><strong>P0 — Critical</strong></td><td>System down, no workaround</td><td>Immediate</td></tr>
<tr><td><strong>P1 — High</strong></td><td>Major feature broken</td><td>&lt; 1 hour</td></tr>
<tr><td><strong>P2 — Medium</strong></td><td>Feature degraded, workaround exists</td><td>&lt; 4 hours</td></tr>
<tr><td><strong>P3 — Low</strong></td><td>Minor issue, no impact on operations</td><td>Next business day</td></tr>
</table>

<h3>P0 Response Procedure</h3>
<ol>
<li>Check if auto-heal is running — if yes, wait 30 seconds</li>
<li>If auto-heal hasn't resolved, manually restart the affected module</li>
<li>If module restart fails, check edge function deployment status</li>
<li>If deployment is healthy, check database connectivity</li>
<li>If database is healthy, check AI provider connectivity</li>
<li>Document the incident in AUDIT</li>
</ol>

<hr />

<h2>Key Commands Quick Reference</h2>
<table>
<tr><th>Command</th><th>What It Does</th></tr>
<tr><td><code>system.health_check</code></td><td>Full system diagnostic</td></tr>
<tr><td><code>system.heal { module: "X" }</code></td><td>Auto-heal specific module</td></tr>
<tr><td><code>brain.status</code></td><td>BRAIN module stats</td></tr>
<tr><td><code>brain.query { query_text: "..." }</code></td><td>Search memories</td></tr>
<tr><td><code>nexus.providers</code></td><td>List provider health</td></tr>
<tr><td><code>defense.report</code></td><td>Security incident report</td></tr>
<tr><td><code>modernizer.history</code></td><td>Evolution history</td></tr>
<tr><td><code>modernizer.rollback { stamp_id: "..." }</code></td><td>Roll back evolution</td></tr>
<tr><td><code>dream.insights</code></td><td>Recent dream insights</td></tr>
<tr><td><code>vision.alerts</code></td><td>Active system alerts</td></tr>
</table>

<hr />
<p><em>INTERNAL USE ONLY</em><br />
<em>Kenneth E Sweet Jr · PromptFluid®</em><br />
<em>ORCID: <a href="https://orcid.org/XXXX-XXXX-XXXX-XXXX">XXXX-XXXX-XXXX-XXXX</a> · DOI: <a href="https://doi.org/10.5281/zenodo.XXXXXXX">10.5281/zenodo.XXXXXXX</a></em></p>

</div>
</body>
</html>