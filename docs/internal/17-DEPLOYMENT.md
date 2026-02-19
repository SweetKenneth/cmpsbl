<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<title>Deployment &amp; Infrastructure — CMPSBL OS Substrate</title>
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

<h1>🚀 Deployment &amp; Infrastructure</h1>
<p><strong>CONFIDENTIAL — Trade Secret</strong></p>
<p><strong>v9.3.0 ARCHITECT Epoch</strong></p>
<hr />

<h2>Production Architecture</h2>
<div class="card">
<pre>┌─────────────────────────────────────────────────────────┐
│                    CDN / Edge Network                     │
├─────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐      │
│  │  Frontend   │  │  Edge Fns   │  │  Storage    │      │
│  │  (React/    │  │  (Deno      │  │  (S3-compat)│      │
│  │   Vite)     │  │   Runtime)  │  │             │      │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘      │
│         │                │                │               │
│  ┌──────┴────────────────┴────────────────┴──────┐       │
│  │              Database (PostgreSQL)             │       │
│  │              + Realtime Subscriptions          │       │
│  └───────────────────────────────────────────────┘       │
└─────────────────────────────────────────────────────────┘</pre>
</div>

<hr />

<h2>Edge Function Topology</h2>

<h3>Active Functions</h3>
<table>
<tr><th>Function</th><th>Purpose</th><th>Avg Latency</th><th>Invocations/day</th></tr>
<tr><td><code>substrate-gateway</code></td><td>Main API gateway</td><td>~200ms</td><td>10K+</td></tr>
<tr><td><code>agency-task-executor</code></td><td>Agency task runner</td><td>~2s</td><td>500–2K</td></tr>
<tr><td><code>accessibility-scanner</code></td><td>WCAG scanning</td><td>~5s</td><td>50–200</td></tr>
<tr><td><code>webhook-relay</code></td><td>Outbound webhooks</td><td>~100ms</td><td>200–1K</td></tr>
</table>

<h3>Auto-Adapt Edge Functions</h3>
<p>Edge functions in <code>/edge/capabilities/</code> are auto-discovered via metadata tags:</p>
<div class="card">
<pre>// @capability memory-search
// @modules BRAIN,MEMORY
// @risk low
// @reversible true
// @description Vector similarity search across memory store</pre>
</div>
<p>Functions with these tags are registered into the capability registry on deploy.</p>

<hr />

<h2>Environment Configuration</h2>
<table>
<tr><th>Environment</th><th>Database</th><th>Edge Runtime</th><th>CDN</th></tr>
<tr><td>Development</td><td>Local / Cloud dev</td><td>Local Deno</td><td>None</td></tr>
<tr><td>Staging</td><td>Cloud staging</td><td>Cloud edge</td><td>Preview CDN</td></tr>
<tr><td>Production</td><td>Cloud production</td><td>Cloud edge</td><td>Global CDN</td></tr>
</table>

<h3>Environment Variables (Production)</h3>
<table>
<tr><th>Variable</th><th>Source</th><th>Required</th></tr>
<tr><td><code>SUPABASE_URL</code></td><td>Auto-provisioned</td><td>✅</td></tr>
<tr><td><code>SUPABASE_ANON_KEY</code></td><td>Auto-provisioned</td><td>✅</td></tr>
<tr><td><code>SUPABASE_SERVICE_ROLE_KEY</code></td><td>Secrets manager</td><td>✅</td></tr>
<tr><td><code>AI_PROVIDER_KEYS</code></td><td>Secrets manager</td><td>✅</td></tr>
<tr><td><code>WEBHOOK_SIGNING_SECRET</code></td><td>Generated</td><td>✅</td></tr>
<tr><td><code>STRIPE_SECRET_KEY</code></td><td>Secrets manager</td><td>For billing</td></tr>
</table>

<hr />

<h2>Deployment Pipeline</h2>
<div class="card">
<pre>Code Push → CI Checks → Build Frontend → Deploy Edge Fns → Migrate DB → Health Check → Go Live</pre>
</div>

<h3>Rollback Procedure</h3>
<ol>
<li>Identify failing deployment via health checks</li>
<li>Revert edge functions to previous version</li>
<li>Revert database migration if applicable (migration must be reversible)</li>
<li>Verify health restored</li>
<li>Post-mortem within 24 hours</li>
</ol>

<hr />

<h2>Scaling Parameters</h2>
<table>
<tr><th>Resource</th><th>Auto-scale Trigger</th><th>Max</th></tr>
<tr><td>Edge function instances</td><td>&gt; 80% CPU for 60s</td><td>100</td></tr>
<tr><td>Database connections</td><td>&gt; 80% pool utilization</td><td>500</td></tr>
<tr><td>CDN cache</td><td>Automatic</td><td>Unlimited</td></tr>
<tr><td>Storage</td><td>Automatic</td><td>100GB per tenant</td></tr>
</table>

<hr />
<p><em>CMPSBL OS Substrate v9.3.0 — ARCHITECT Epoch — INTERNAL USE ONLY</em><br />
<em>Kenneth E Sweet Jr · PromptFluid®</em><br />
<em>ORCID: <a href="https://orcid.org/XXXX-XXXX-XXXX-XXXX">XXXX-XXXX-XXXX-XXXX</a> · DOI: <a href="https://doi.org/10.5281/zenodo.XXXXXXX">10.5281/zenodo.XXXXXXX</a></em><br />
<em>© 2025–2026 PromptFluid®. All rights reserved.</em></p>

</div>
</body>
</html>