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
  .card{border:1px solid #ddd;border-radius:10px;padding:0.2in;margin-bottom:0.25in}
  hr{border:none;border-top:1px solid #ccc;margin:0.3in 0}
  @media print{@page{size:Letter;margin:0.8in}.card{break-inside:avoid}}
</style>
</head>
<body>
<div class="page">

<h1>Deployment Model</h1>
<p><strong>CMPSBL OS Substrate v10.5.1 — ARCHITECT Epoch</strong></p>
<p>DOI: <a href="https://doi.org/10.5281/zenodo.XXXXXXX">10.5281/zenodo.XXXXXXX</a><br />
Author: Kenneth E Sweet Jr (ORCID: <a href="https://orcid.org/XXXX-XXXX-XXXX-XXXX">XXXX-XXXX-XXXX-XXXX</a>)</p>
<hr />

<h2>12. Deployment Model</h2>

<h3>12.1 Infrastructure Requirements</h3>

<p>The substrate operates on commodity cloud infrastructure:</p>

<table>
<tr><th>Component</th><th>Technology</th><th>Purpose</th></tr>
<tr><td>Database</td><td>PostgreSQL 15+ with pgvector</td><td>Persistent storage, RLS, real-time</td></tr>
<tr><td>Edge Runtime</td><td>Deno-compatible platform</td><td>Module logic, API handlers</td></tr>
<tr><td>Client</td><td>TypeScript / React</td><td>Terminal UI, admin dashboard</td></tr>
<tr><td>AI Providers</td><td>External (BYOK)</td><td>LLM inference</td></tr>
</table>

<h3>12.2 BYOK Model</h3>

<p>The substrate follows a Bring Your Own Keys model. Users provide their own infrastructure, AI provider API keys, and deployment environment. No compute resources are included. This ensures complete data sovereignty.</p>

<h3>12.3 Deployment Topology</h3>

<p>The system follows a three-tier architecture: client (browser) → edge functions (Deno) → database (PostgreSQL) with external AI provider connections from the edge layer. All communication uses HTTPS/TLS.</p>

<h3>12.4 Data Sovereignty</h3>

<p>All data remains within the user's own infrastructure. The substrate does not transmit data to any external system other than the user-configured AI providers for inference requests.</p>

<hr />

<p><em>CMPSBL OS Substrate v10.5.1 — Academic Documentation</em><br />
<em>Kenneth E Sweet Jr · ORCID: <a href="https://orcid.org/XXXX-XXXX-XXXX-XXXX">XXXX-XXXX-XXXX-XXXX</a></em><br />
<em>DOI: <a href="https://doi.org/10.5281/zenodo.XXXXXXX">10.5281/zenodo.XXXXXXX</a></em><br />
<em>© 2025–2026 PromptFluid®. All rights reserved.</em></p>

</div>
</body>
</html>
