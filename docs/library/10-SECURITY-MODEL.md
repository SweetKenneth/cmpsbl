<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<title>Security Model — CMPSBL OS Substrate</title>
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

<h1>Security Model</h1>
<p><strong>Defense-in-Depth</strong></p>
<table>
<tr><td><strong>Document</strong></td><td>10 — Security Model</td></tr>
<tr><td><strong>Classification</strong></td><td>Library — No Trade Secrets</td></tr>
<tr><td><strong>DOI</strong></td><td><a href="https://doi.org/10.5281/zenodo.XXXXXXX">10.5281/zenodo.XXXXXXX</a></td></tr>
</table>
<hr />

<h2>Security Philosophy</h2>
<p>Security is not a module — it is a property of the entire system. While DEFENSE is the dedicated security module, security controls are applied at every layer:</p>
<table>
<tr><th>Layer</th><th>Security Control</th></tr>
<tr><td><strong>Kernel</strong></td><td>API key validation, rate limiting, quota enforcement</td></tr>
<tr><td><strong>Cognitive</strong></td><td>Memory access scoping, proposal validation</td></tr>
<tr><td><strong>Operational</strong></td><td>Threat detection, behavioral analysis, bot filtering</td></tr>
<tr><td><strong>Administrative</strong></td><td>Health monitoring, incident detection</td></tr>
<tr><td><strong>Infrastructure</strong></td><td>Audit logging, actor attribution, isolated execution</td></tr>
<tr><td><strong>Orchestrator</strong></td><td>Pipeline authorization, cross-module access control</td></tr>
</table>

<hr />

<div class="card">
<h2>DEFENSE Module</h2>

<h3>Threat Detection</h3>
<table>
<tr><th>Check</th><th>Description</th></tr>
<tr><td><strong>IP Reputation</strong></td><td>Known bad actors, tor exit nodes, datacenter IPs</td></tr>
<tr><td><strong>Behavioral Analysis</strong></td><td>Request fingerprinting, anomaly detection</td></tr>
<tr><td><strong>Rate Anomalies</strong></td><td>Sudden traffic spikes, distributed attacks</td></tr>
<tr><td><strong>Payload Analysis</strong></td><td>Injection attempts, malformed data</td></tr>
<tr><td><strong>Bot Detection</strong></td><td>Automated traffic identification</td></tr>
</table>

<h3>Response Actions</h3>
<table>
<tr><th>Action</th><th>When Used</th></tr>
<tr><td><strong>Allow</strong></td><td>Request passes all checks</td></tr>
<tr><td><strong>Throttle</strong></td><td>Suspicious but not confirmed threat</td></tr>
<tr><td><strong>Challenge</strong></td><td>Requires additional verification</td></tr>
<tr><td><strong>Block</strong></td><td>Confirmed threat</td></tr>
<tr><td><strong>Quarantine</strong></td><td>Sophisticated attack, preserved for analysis</td></tr>
</table>

<h3>Incident Response</h3>
<ol>
<li>Immediate blocking of the source</li>
<li>Incident record created in AUDIT</li>
<li>Pattern stored in BRAIN for future recognition</li>
<li>Alert sent to SYSTEM</li>
<li>Related requests reviewed for lateral movement</li>
</ol>
</div>

<hr />

<h2>Access Control</h2>
<p><strong>Hierarchical RBAC:</strong> Scoped API keys, rate limits, quota enforcement, and subscription tier gating.</p>
<p><strong>Crown Jewel Protection:</strong> 54 capabilities classified as Crown Jewels are excluded from all external tiers — not visible in any API catalog, not accessible through any subscription plan, admin-only in the UI.</p>

<hr />

<h2>Data Protection</h2>
<ul>
<li><strong>Row-Level Security</strong> — database tables enforce per-user data isolation</li>
<li><strong>Encryption at rest</strong> — all stored data is encrypted</li>
<li><strong>Encryption in transit</strong> — all API communication uses TLS</li>
<li><strong>Secrets vault</strong> — API keys stored in AES-GCM encrypted vault with per-module scoping</li>
</ul>

<hr />

<h2>Audit Trail</h2>
<p>AUDIT provides immutable, tamper-evident logging of all security-relevant events. The ledger supports chain-of-custody verification for regulatory compliance.</p>

<hr />

<p><em>CMPSBL OS Substrate v9.1.0 — Library Documentation</em><br />
<em>Kenneth E Sweet Jr · ORCID: <a href="https://orcid.org/XXXX-XXXX-XXXX-XXXX">XXXX-XXXX-XXXX-XXXX</a></em><br />
<em>DOI: <a href="https://doi.org/10.5281/zenodo.XXXXXXX">10.5281/zenodo.XXXXXXX</a></em><br />
<em>© 2025–2026 PromptFluid®. All rights reserved.</em></p>

</div>
</body>
</html>
