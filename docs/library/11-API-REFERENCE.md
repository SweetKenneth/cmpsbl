<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<title>API Reference — CMPSBL OS Substrate</title>
<style>
  body{font-family:Georgia,"Times New Roman",serif;font-size:11pt;line-height:1.4;color:#111;background:#fff;margin:0}
  .page{max-width:8.5in;margin:0 auto;padding:0.8in}
  h1{font-size:20pt;margin-bottom:0.3in}
  h2{font-size:14pt;margin-top:0.4in}
  h3{font-size:12pt;margin-top:0.25in}
  p{margin-bottom:0.14in}
  table{width:100%;border-collapse:collapse;margin:0.2in 0}
  th,td{border:1px solid #ccc;padding:6px 8px}
  th{background:#f3f3f3;text-align:left}
  pre{background:#f8f8f8;border:1px solid #ddd;padding:12px;font-size:9pt;overflow-x:auto;border-radius:6px}
  code{font-family:monospace;font-size:10pt}
  .card{border:1px solid #ddd;border-radius:10px;padding:0.2in;margin-bottom:0.25in}
  hr{border:none;border-top:1px solid #ccc;margin:0.3in 0}
  @media print{@page{size:Letter;margin:0.8in}.card{break-inside:avoid}}
</style>
</head>
<body>
<div class="page">

<h1>API Reference</h1>
<p><strong>Public API Surface for All 21 Modules</strong></p>
<table>
<tr><td><strong>Document</strong></td><td>11 — API Reference</td></tr>
<tr><td><strong>Classification</strong></td><td>Library — No Trade Secrets</td></tr>
<tr><td><strong>DOI</strong></td><td><a href="https://doi.org/10.5281/zenodo.XXXXXXX">10.5281/zenodo.XXXXXXX</a></td></tr>
</table>
<hr />

<h2>Unified Endpoint</h2>
<pre>
POST /functions/v1/pf-substrate
Content-Type: application/json
Authorization: Bearer &lt;api-key&gt;

{
  "module": "&lt;module-name&gt;",
  "action": "&lt;action-name&gt;",
  "payload": { ... }
}
</pre>

<h3>Response Format</h3>
<pre>
{
  "success": true,
  "module": "brain",
  "action": "query",
  "data": { ... },
  "metadata": {
    "duration_ms": 142,
    "tokens_used": 0,
    "cost_millicents": 0
  }
}
</pre>

<h3>Error Format</h3>
<pre>
{
  "success": false,
  "error": "RATE_LIMIT_EXCEEDED",
  "message": "API key rate limit exceeded. Retry after 60 seconds.",
  "retry_after": 60
}
</pre>

<hr />

<h2>Module Actions Reference</h2>

<div class="card">
<h3>CORE</h3>
<table>
<tr><th>Action</th><th>Parameters</th><th>Description</th></tr>
<tr><td><code>health</code></td><td>—</td><td>System-wide health report</td></tr>
<tr><td><code>config</code></td><td><code>key?: string</code></td><td>Get configuration value(s)</td></tr>
<tr><td><code>status</code></td><td>—</td><td>Boot status of all modules</td></tr>
</table>
</div>

<div class="card">
<h3>BRAIN</h3>
<table>
<tr><th>Action</th><th>Parameters</th><th>Description</th></tr>
<tr><td><code>query</code></td><td><code>query_text, limit?</code></td><td>Search memories</td></tr>
<tr><td><code>remember</code></td><td><code>content, memory_type, confidence?</code></td><td>Store new memory</td></tr>
<tr><td><code>reflect</code></td><td>—</td><td>Trigger reflection cycle</td></tr>
<tr><td><code>reinforce</code></td><td><code>memory_id, boost?</code></td><td>Boost memory confidence</td></tr>
<tr><td><code>learn</code></td><td><code>content, source?</code></td><td>Ingest new knowledge</td></tr>
<tr><td><code>session_reflection</code></td><td><code>hours?</code></td><td>Cross-module session reflection</td></tr>
<tr><td><code>graph_summary</code></td><td>—</td><td>Knowledge graph structure</td></tr>
</table>
</div>

<div class="card">
<h3>NEXUS</h3>
<table>
<tr><th>Action</th><th>Parameters</th><th>Description</th></tr>
<tr><td><code>route</code></td><td><code>task, prompt, context?</code></td><td>Route to optimal AI provider</td></tr>
<tr><td><code>providers</code></td><td>—</td><td>List available providers and health</td></tr>
<tr><td><code>estimate_cost</code></td><td><code>task, tokens?</code></td><td>Estimate request cost</td></tr>
</table>
</div>

<div class="card">
<h3>DEFENSE</h3>
<table>
<tr><th>Action</th><th>Parameters</th><th>Description</th></tr>
<tr><td><code>analyze_threat</code></td><td><code>request_data</code></td><td>Analyze request for threats</td></tr>
<tr><td><code>report</code></td><td><code>period?</code></td><td>Security incident report</td></tr>
<tr><td><code>behavioral_scan</code></td><td><code>actor_id</code></td><td>Behavioral analysis</td></tr>
</table>
</div>

<div class="card">
<h3>MODERNIZER</h3>
<table>
<tr><th>Action</th><th>Parameters</th><th>Description</th></tr>
<tr><td><code>propose</code></td><td><code>description, category</code></td><td>Propose evolution</td></tr>
<tr><td><code>validate</code></td><td><code>proposal_id</code></td><td>Validate proposal</td></tr>
<tr><td><code>apply</code></td><td><code>proposal_id</code></td><td>Apply validated evolution</td></tr>
<tr><td><code>rollback</code></td><td><code>stamp_id</code></td><td>Rollback applied evolution</td></tr>
<tr><td><code>history</code></td><td><code>limit?</code></td><td>Evolution history</td></tr>
</table>
</div>

<div class="card">
<h3>DECODE</h3>
<table>
<tr><th>Action</th><th>Parameters</th><th>Description</th></tr>
<tr><td><code>parse</code></td><td><code>input</code></td><td>Parse natural language input</td></tr>
<tr><td><code>generate</code></td><td><code>prompt, context?</code></td><td>Generate response</td></tr>
<tr><td><code>detect_intent</code></td><td><code>input</code></td><td>Classify user intent</td></tr>
</table>
</div>

<div class="card">
<h3>DREAM / VISION / SYSTEM / ACCESS / RIPPLE</h3>
<p>These modules follow the same invocation pattern. See the <a href="../substrate/MODULE-ACTIONS-REGISTRY.md">Module Actions Registry</a> for the complete action reference.</p>
</div>

<hr />

<h2>Authentication</h2>
<p>All requests require a valid API key: <code>Authorization: Bearer pf_live_xxxxxxxxxxxx</code></p>
<p>Keys are scoped to specific modules and actions. Attempting to access a module outside the key's scope returns <code>403 FORBIDDEN</code>.</p>

<hr />

<h2>Rate Limits</h2>
<table>
<tr><th>Plan</th><th>Requests/Minute</th><th>Requests/Day</th></tr>
<tr><td>Free</td><td>10</td><td>500</td></tr>
<tr><td>Pro</td><td>100</td><td>10,000</td></tr>
<tr><td>Enterprise</td><td>1,000</td><td>100,000</td></tr>
</table>

<hr />

<p><em>CMPSBL OS Substrate v9.1.0 — Library Documentation</em><br />
<em>Kenneth E Sweet Jr · ORCID: <a href="https://orcid.org/XXXX-XXXX-XXXX-XXXX">XXXX-XXXX-XXXX-XXXX</a></em><br />
<em>DOI: <a href="https://doi.org/10.5281/zenodo.XXXXXXX">10.5281/zenodo.XXXXXXX</a></em><br />
<em>© 2025–2026 PromptFluid®. All rights reserved.</em></p>

</div>
</body>
</html>
