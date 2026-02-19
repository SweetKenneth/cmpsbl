<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<title>User Manual — Complete Usage Guide</title>
<style>
  body{font-family:Georgia,"Times New Roman",serif;font-size:11pt;line-height:1.4;color:#111;background:#fff;margin:0}
  .page{max-width:8.5in;margin:0 auto;padding:0.8in}
  h1{font-size:20pt;margin-bottom:0.3in}h2{font-size:14pt;margin-top:0.4in}h3{font-size:12pt;margin-top:0.25in}
  p{margin-bottom:0.14in}ul,ol{margin-left:0.25in}
  table{width:100%;border-collapse:collapse;margin:0.2in 0}th,td{border:1px solid #ccc;padding:6px 8px}th{background:#f3f3f3;text-align:left}
  pre{background:#f8f8f8;border:1px solid #ddd;padding:12px;font-family:"Courier New",monospace;font-size:10pt;overflow-x:auto;white-space:pre;margin:0.15in 0}
  .card{border:1px solid #ddd;border-radius:10px;padding:0.2in;margin-bottom:0.25in}
  hr{border:none;border-top:1px solid #ccc;margin:0.3in 0}
  @media print{@page{size:Letter;margin:0.8in}.card{break-inside:avoid}}
</style>
</head>
<body>
<div class="page">

<h1>Module 21 — User Manual</h1>
<p><strong>Complete Usage Guide</strong></p>
<p><strong>v10.5.1 ARCHITECT Epoch</strong></p>
<hr />

<h2>Getting Started</h2>

<h3>Prerequisites</h3>
<table>
<tr><th>Requirement</th><th>Details</th></tr>
<tr><td>Infrastructure</td><td>A Supabase project (PostgreSQL 15+ with pgvector)</td></tr>
<tr><td>AI Provider Key</td><td>At least one: OpenAI, Anthropic, Google, or Mistral</td></tr>
<tr><td>Client</td><td>Modern web browser for the Terminal UI</td></tr>
</table>

<h3>First-Time Setup</h3>
<ol>
<li>Deploy the substrate edge functions to your Supabase project</li>
<li>Run the database migration to create all required tables</li>
<li>Boot the substrate via the Terminal UI or API</li>
<li>Register your AI provider API keys</li>
<li>Create your first developer API key</li>
</ol>

<h2>Terminal UI</h2>
<p>The Terminal UI is the primary interface for interacting with the substrate.</p>

<h3>Command Structure</h3>
<p>All commands follow the pattern:</p>
<pre>module.action [parameters]</pre>

<div class="card">
<h3>Core Commands</h3>
<table>
<tr><th>Command</th><th>Description</th></tr>
<tr><td>system.boot</td><td>Initialize all 21 modules</td></tr>
<tr><td>system.health</td><td>Display substrate health dashboard</td></tr>
<tr><td>system.heal [module]</td><td>Trigger auto-heal for a specific module</td></tr>
<tr><td>system.backup</td><td>Create a full substrate backup</td></tr>
<tr><td>system.restore [backup_id]</td><td>Restore from a backup</td></tr>
</table>
</div>

<div class="card">
<h3>Memory Commands</h3>
<table>
<tr><th>Command</th><th>Description</th></tr>
<tr><td>brain.store [content]</td><td>Store a new memory</td></tr>
<tr><td>brain.recall [query]</td><td>Search memories by natural language query</td></tr>
<tr><td>brain.consolidate</td><td>Trigger memory consolidation cycle</td></tr>
<tr><td>brain.stats</td><td>Display memory tier statistics</td></tr>
</table>
</div>

<div class="card">
<h3>AI Commands</h3>
<table>
<tr><th>Command</th><th>Description</th></tr>
<tr><td>nexus.route [prompt]</td><td>Send a prompt to the optimal AI provider</td></tr>
<tr><td>nexus.providers</td><td>List configured providers and their health</td></tr>
<tr><td>nexus.costs</td><td>Display cost summary by provider</td></tr>
</table>
</div>

<div class="card">
<h3>Evolution Commands</h3>
<table>
<tr><th>Command</th><th>Description</th></tr>
<tr><td>modernizer.scan</td><td>Scan for optimization opportunities</td></tr>
<tr><td>modernizer.propose</td><td>Generate an evolution proposal</td></tr>
<tr><td>modernizer.history</td><td>View evolution history</td></tr>
<tr><td>modernizer.rollback [stamp_id]</td><td>Revert an applied evolution</td></tr>
</table>
</div>

<div class="card">
<h3>Dream Commands</h3>
<table>
<tr><th>Command</th><th>Description</th></tr>
<tr><td>dream.cycle</td><td>Trigger a dream cycle manually</td></tr>
<tr><td>dream.insights</td><td>View insights from recent dream cycles</td></tr>
<tr><td>dream.pool [agency_id]</td><td>View shared dream pool for an agency</td></tr>
</table>
</div>

<div class="card">
<h3>Security Commands</h3>
<table>
<tr><th>Command</th><th>Description</th></tr>
<tr><td>defense.status</td><td>Display current threat level and recent activity</td></tr>
<tr><td>defense.threats</td><td>List recent threat detections</td></tr>
<tr><td>defense.quarantine</td><td>View quarantined requests</td></tr>
<tr><td>access.keys</td><td>List API keys and their usage</td></tr>
<tr><td>access.quotas</td><td>Display quota usage by key</td></tr>
</table>
</div>

<div class="card">
<h3>Agency Commands</h3>
<table>
<tr><th>Command</th><th>Description</th></tr>
<tr><td>agency.create [template]</td><td>Create a new agency from a template</td></tr>
<tr><td>agency.list</td><td>List all agencies</td></tr>
<tr><td>agency.task [agency_id] [type]</td><td>Submit a task to an agency</td></tr>
<tr><td>agency.status [agency_id]</td><td>View agency status and member health</td></tr>
</table>
</div>

<h2>API Reference</h2>

<h3>Authentication</h3>
<p>All API requests require either a session token or an API key:</p>
<pre>Authorization: Bearer {session_token}</pre>
<p>or</p>
<pre>X-API-Key: {api_key}</pre>

<h3>Endpoint</h3>
<p>All substrate operations go through a single endpoint:</p>
<pre>POST /functions/v1/pf-substrate</pre>

<div class="card">
<h3>Request Format</h3>
<pre>{
  "module": "brain",
  "action": "store",
  "params": {
    "content": "The user prefers dark mode interfaces",
    "tier": "semantic",
    "importance": 0.7
  }
}</pre>
</div>

<div class="card">
<h3>Response Format</h3>
<pre>{
  "success": true,
  "module": "brain",
  "action": "store",
  "data": {
    "memory_id": "uuid",
    "tier": "semantic",
    "confidence": 0.85
  },
  "meta": {
    "latency_ms": 142,
    "provider": null,
    "cost_millicents": 0
  }
}</pre>
</div>

<h2>Configuration</h2>

<h3>Provider Setup</h3>
<p>Register AI providers through the API or Terminal UI:</p>
<pre>nexus.register openai {api_key}
nexus.register anthropic {api_key}</pre>
<p>Provider keys are stored in an encrypted vault scoped to your substrate instance.</p>

<h3>Budget Configuration</h3>
<p>Set spending limits to prevent unexpected costs:</p>
<pre>economy.budget daily 500    (500 cents = $5.00 per day)
economy.budget monthly 5000 (5000 cents = $50.00 per month)</pre>

<h3>Memory Configuration</h3>
<p>Adjust memory behavior:</p>
<pre>brain.config decay_rate episodic 0.023
brain.config decay_rate semantic 0.0046
brain.config consolidation_threshold 0.6</pre>

<h2>Troubleshooting</h2>

<div class="card">
<h3>Module Shows Unhealthy</h3>
<ol>
<li>Run <code>system.health</code> to identify the unhealthy module</li>
<li>Check the module's circuit breaker state</li>
<li>Run <code>system.heal {module}</code> to trigger auto-recovery</li>
<li>If heal fails, check AUDIT logs for error details</li>
<li>Verify infrastructure dependencies (database, providers)</li>
</ol>
</div>

<div class="card">
<h3>AI Requests Failing</h3>
<ol>
<li>Run <code>nexus.providers</code> to check provider health</li>
<li>Verify API keys are valid and not expired</li>
<li>Check <code>economy.quotas</code> for budget exhaustion</li>
<li>Review DEFENSE for blocked requests</li>
<li>Check provider rate limits via <code>nexus.costs</code></li>
</ol>
</div>

<div class="card">
<h3>Memory Not Found</h3>
<ol>
<li>Verify the memory was stored successfully via AUDIT</li>
<li>Check confidence score — memories below 0.1 are eligible for pruning</li>
<li>Run <code>brain.stats</code> to check tier health</li>
<li>Try a broader search query</li>
<li>Check if memory has decayed below retrieval threshold</li>
</ol>
</div>

<div class="card">
<h3>Evolution Stuck</h3>
<ol>
<li>Check <code>modernizer.history</code> for pending proposals</li>
<li>Verify CORTEX is healthy (required for proposal evaluation)</li>
<li>Check if another evolution is already in progress (only one at a time)</li>
<li>Review AUDIT for approval/rejection details</li>
<li>Run <code>modernizer.rollback</code> if a previous evolution caused issues</li>
</ol>
</div>

<h2>Best Practices</h2>
<table>
<tr><th>Practice</th><th>Rationale</th></tr>
<tr><td>Start with one AI provider, add more as needed</td><td>Simplifies initial setup and debugging</td></tr>
<tr><td>Set conservative budgets initially</td><td>Prevents unexpected costs during learning</td></tr>
<tr><td>Review evolution proposals before enabling auto-approve</td><td>Understand what changes the substrate wants to make</td></tr>
<tr><td>Monitor VISION dashboards daily during initial deployment</td><td>Catch issues early while establishing baselines</td></tr>
<tr><td>Use agencies for complex multi-step tasks</td><td>Agents coordinate better than sequential API calls</td></tr>
<tr><td>Back up before major configuration changes</td><td>Ensures recovery path if something goes wrong</td></tr>
</table>

<hr />
<p><em>CMPSBL OS Substrate v10.5.1 — ARCHITECT Epoch</em><br />
<em>Kenneth E Sweet Jr · PromptFluid®</em><br />
<em>ORCID: <a href="https://orcid.org/XXXX-XXXX-XXXX-XXXX">XXXX-XXXX-XXXX-XXXX</a> · DOI: <a href="https://doi.org/10.5281/zenodo.XXXXXXX">10.5281/zenodo.XXXXXXX</a></em><br />
<em>© 2025–2026 PromptFluid®. All rights reserved.</em></p>

</div>
</body>
</html>