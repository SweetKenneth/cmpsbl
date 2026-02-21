<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<title>CEO Reconstruction — Governance & Security</title>
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

<h1>🔐 10 — Governance & Security</h1>
<p><strong>Ethics, Defense, IP Protection, Isolation</strong></p>
<hr />

<h2>Governance Guard</h2>
<p><strong>File:</strong> <code>src/lib/substrate/governance-guard.ts</code></p>
<p>3-stage pipeline: coherence → ethics → signal emission</p>

<h3>Stage 1: Coherence Validation</h3>
<ul>
<li>Detects contradictions (regex pattern matching)</li>
<li>Detects circular references</li>
<li>Flags missing context for long content (&gt;500 chars)</li>
<li>Score: <code>max(0.3, 1 - issues × 0.2)</code></li>
<li>Blocks if any HIGH severity issues AND strict_mode=true</li>
</ul>

<h3>Stage 2: Ethical Constraints</h3>
<p>6 hardcoded ethical constraints:</p>
<ol>
<li>no_harmful_content</li>
<li>no_personal_data_exposure</li>
<li>no_discriminatory_output</li>
<li>no_deceptive_claims</li>
<li>respect_user_privacy</li>
<li>maintain_data_integrity</li>
</ol>

<h3>Stage 3: Signal Emission</h3>
<p>Types: <code>block</code>, <code>warn</code>, <code>audit</code>, <code>approve</code></p>
<p>All signals logged to brain_events for audit trail.</p>

<h2>Governance Modes</h2>
<table>
<tr><th>Mode</th><th>Behavior</th></tr>
<tr><td>manual</td><td>Human approves everything</td></tr>
<tr><td>advisory</td><td>System recommends, human decides</td></tr>
<tr><td>governed</td><td>Auto-execute within bounds, human for exceptions</td></tr>
<tr><td>emergency</td><td>System acts immediately, human notified</td></tr>
</table>

<h3>Veto Precedence Stack</h3>
<div class="card">
<pre>Audit > Defense > System (deterministic)
Human override: permanent
Autonomous veto: conditional (can be overridden)</pre>
</div>

<h2>IP Protection Layers</h2>

<h3>Builder Isolation Protocol</h3>
<div class="card">
<pre>Rule: "User projects run ON the substrate, never AS the substrate."

Enforcement:
  1. Capability-scoped execution tokens (tier + project_id + capability_id)
  2. Per-project namespaces (hard isolation)
  3. Governor-level gates and policy checks
  4. No direct module invocation (only capabilities/missions)
  5. Artifact export filters (exclude internal recipes)</pre>
</div>

<h3>Black-Box Enforcement</h3>
<ul>
<li>UI blocks: blurred previews, disabled exports/copying for sealed items</li>
<li>Content strategy: explain "what" not "how"</li>
<li>Protected reasoning/prompts excluded from ZIP artifacts</li>
<li>Source code visibility blocked for sealed runtimes</li>
</ul>

<h3>LNCHBL Distribution Model</h3>
<div class="card">
<pre>4-layer protection:
  1. Environment Signature — Locked to production ID
  2. Architecture Crown Jewels — SEBA/Cortex permanently hidden
  3. Experience Crown Jewels — 10-point sealed runtime enforcement
  4. Tier Model — Free/Creator/Architect/Enterprise</pre>
</div>

<h2>Edge Security</h2>
<ul>
<li><strong>IP Reputation:</strong> <code>update_ip_reputation()</code> — server-side scoring, client input ignored</li>
<li><strong>Edge Rate Limits:</strong> <code>edge_rate_limits</code> table, cleaned up daily</li>
<li><strong>HMAC Verification:</strong> Shared utilities for Stripe/webhook signatures</li>
<li><strong>Security Audit Log:</strong> Pruned after 30 days</li>
</ul>

<h2>Truth Boundary Protocol</h2>
<div class="card">
<pre>Central Health Registry (CHR): src/lib/substrate/health-registry/
Data classification: VERIFIED | INFERRED | NARRATIVE

Truth Verification Engine:
  - Automated parity checks (Dashboard vs Terminal vs CHR)
  - Emits integrity events on mismatches

Health Attribution Engine (HAE):
  - Ranks health drop causes with confidence scores
  - Circuit breakers, rate limits, shadow load

Speculative responses prefixed: "Based on current signals..."
Tagged: truth_mode: INFERRED</pre>
</div>

<h2>WebAuthn / Passkey Infrastructure</h2>
<ul>
<li>Domain-agnostic: uses <code>window.location.hostname</code> as rpId</li>
<li>4-step instructional flow</li>
<li>Post-login registration via <code>cmpsbl_pending_passkey_email</code> localStorage flag</li>
<li>Server-side challenge matching via edge functions</li>
</ul>

<h2>Secrets Vault (pf-vault)</h2>
<ul>
<li>AES-GCM encryption for API keys/tokens</li>
<li>Per-module access scoping</li>
<li>Rotation support</li>
<li>Audit log: vault_access_log</li>
</ul>

<hr />
<p><em>CMPSBL OS Substrate v10.9.7 — CEO RECONSTRUCTION GUIDE</em><br />
<em>Kenneth E Sweet Jr · PromptFluid®</em><br />
<em>© 2025–2026 PromptFluid®. All rights reserved.</em></p>

</div>
</body>
</html>
