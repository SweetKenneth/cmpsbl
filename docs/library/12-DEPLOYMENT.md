<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<title>Deployment Model — CMPSBL OS Substrate</title>
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
  .card{border:1px solid #ddd;border-radius:10px;padding:0.2in;margin-bottom:0.25in}
  hr{border:none;border-top:1px solid #ccc;margin:0.3in 0}
  @media print{@page{size:Letter;margin:0.8in}.card{break-inside:avoid}}
</style>
</head>
<body>
<div class="page">

<h1>Deployment Model</h1>
<table>
<tr><td><strong>Document</strong></td><td>12 — Deployment</td></tr>
<tr><td><strong>Classification</strong></td><td>Library — No Trade Secrets</td></tr>
<tr><td><strong>DOI</strong></td><td><a href="https://doi.org/10.5281/zenodo.XXXXXXX">10.5281/zenodo.XXXXXXX</a></td></tr>
</table>
<hr />

<h2>Infrastructure Requirements</h2>
<p>The substrate runs on commodity cloud infrastructure. No specialized hardware is required.</p>
<table>
<tr><th>Component</th><th>Technology</th><th>Purpose</th></tr>
<tr><td><strong>Database</strong></td><td>PostgreSQL (Supabase)</td><td>Persistent storage, RLS, real-time subscriptions</td></tr>
<tr><td><strong>Edge Functions</strong></td><td>Deno (Supabase Edge Functions)</td><td>Module logic, API handlers</td></tr>
<tr><td><strong>Client</strong></td><td>TypeScript / React</td><td>Terminal UI, admin dashboard</td></tr>
<tr><td><strong>AI Providers</strong></td><td>BYOK (Bring Your Own Keys)</td><td>LLM inference</td></tr>
</table>

<h3>Minimum Requirements</h3>
<table>
<tr><th>Resource</th><th>Minimum</th></tr>
<tr><td>Database</td><td>PostgreSQL 15+ with pgvector extension</td></tr>
<tr><td>Edge Runtime</td><td>Deno-compatible edge function platform</td></tr>
<tr><td>Storage</td><td>1GB+ for memory and audit logs</td></tr>
<tr><td>AI API Keys</td><td>At least one provider (OpenAI, Anthropic, Google, or Mistral)</td></tr>
</table>

<hr />

<h2>BYOK Model</h2>
<p>The substrate is <strong>Bring Your Own Keys</strong>. No compute resources, AI model access, or infrastructure are included. You provide your own cloud infrastructure, AI provider API keys, and deployment domain. This ensures complete data sovereignty.</p>

<hr />

<h2>Deployment Topology</h2>
<pre>
┌─────────────────────────────────────────┐
│              Client (Browser)            │
│         Terminal UI / Admin Dashboard    │
└─────────────┬───────────────────────────┘
              │ HTTPS
┌─────────────▼───────────────────────────┐
│          Edge Functions (Deno)           │
│     pf-substrate (unified endpoint)     │
│     21 module handlers                  │
└─────────────┬───────────────────────────┘
              │ SQL / REST
┌─────────────▼───────────────────────────┐
│         PostgreSQL (Supabase)            │
│   ~40 tables · RLS · Real-time          │
└─────────────┬───────────────────────────┘
              │ HTTPS
┌─────────────▼───────────────────────────┐
│         AI Providers (External)          │
│   OpenAI · Anthropic · Google · Mistral │
└─────────────────────────────────────────┘
</pre>

<hr />

<p><em>CMPSBL OS Substrate v9.1.0 — Library Documentation</em><br />
<em>Kenneth E Sweet Jr · ORCID: <a href="https://orcid.org/XXXX-XXXX-XXXX-XXXX">XXXX-XXXX-XXXX-XXXX</a></em><br />
<em>DOI: <a href="https://doi.org/10.5281/zenodo.XXXXXXX">10.5281/zenodo.XXXXXXX</a></em><br />
<em>© 2025–2026 PromptFluid®. All rights reserved.</em></p>

</div>
</body>
</html>
