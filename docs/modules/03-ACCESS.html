<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<title>ACCESS Module — Deep Dive</title>
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
  pre{background:#f8f8f8;border:1px solid #ddd;padding:12px;font-family:"Courier New",monospace;font-size:10pt;overflow-x:auto;white-space:pre;margin:0.15in 0}
  .card{border:1px solid #ddd;border-radius:10px;padding:0.2in;margin-bottom:0.25in}
  hr{border:none;border-top:1px solid #ccc;margin:0.3in 0}
  @media print{@page{size:Letter;margin:0.8in}.card{break-inside:avoid}}
</style>
</head>
<body>
<div class="page">

<h1>🔑 ACCESS Module — Deep Dive</h1>
<p><strong>Layer:</strong> Kernel · <strong>Boot Order:</strong> 3 · <strong>Dependencies:</strong> CORE, RIPPLE</p>
<p><strong>v9.3.0 ARCHITECT Epoch</strong></p>
<hr />

<h2>Purpose</h2>
<p>ACCESS manages <strong>identity, authentication, API keys, entitlements, rate limiting, and usage metering</strong> for the substrate. It is the gatekeeper — every external request must pass through ACCESS before reaching any module.</p>

<h2>Capabilities</h2>
<table>
<tr><th>Capability</th><th>Description</th></tr>
<tr><td>API Key Management</td><td>Generation, validation, rotation, revocation</td></tr>
<tr><td>Rate Limiting</td><td>Per-key and global request throttling</td></tr>
<tr><td>Usage Metering</td><td>Token consumption, cost tracking, quota enforcement</td></tr>
<tr><td>Entitlements</td><td>Tier-based feature access control</td></tr>
<tr><td>Developer Management</td><td>Developer registration, profiles</td></tr>
<tr><td>Subscription Management</td><td>Plan tiers, billing integration</td></tr>
</table>

<h2>API Key Architecture</h2>

<div class="card">
<h3>Key Structure</h3>
<pre>pf_live_aBcDeFgHiJkLmNoPqRsTuVwX
│  │     │
│  │     └─ 24 characters of cryptographic random
│  └─ Environment: live or test
└─ Prefix: pf (PromptFluid)</pre>
</div>

<div class="card">
<h3>Key Lifecycle</h3>
<pre>┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│ Generate │───►│  Active  │───►│ Rotating │───►│ Revoked  │
│          │    │          │    │ (grace)  │    │          │
└──────────┘    └──────┬───┘    └──────────┘    └──────────┘
                       │
                       └───► Expired (auto-revoke)</pre>
<ul>
<li>Keys are hashed (SHA-256) server-side — raw key shown only once at creation</li>
<li>Grace period during rotation: old key valid for 24 hours after new key generated</li>
<li>Expiration: configurable, default none</li>
</ul>
</div>

<h3>Security Properties</h3>
<table>
<tr><th>Property</th><th>Implementation</th></tr>
<tr><td>Storage</td><td>SHA-256 hash only (raw never stored)</td></tr>
<tr><td>Prefix stored</td><td>Yes (for identification without decryption)</td></tr>
<tr><td>Rotation</td><td>New key generated, old key has 24h grace period</td></tr>
<tr><td>Revocation</td><td>Immediate — hash deleted from active set</td></tr>
</table>

<h2>Rate Limiting</h2>

<div class="card">
<h3>Algorithm: Token Bucket</h3>
<pre>Each key maintains two buckets:
  - Per-minute bucket (burst capacity)
  - Per-day bucket (sustained capacity)

On request:
  1. Check per-minute bucket → if empty, reject (429)
  2. Check per-day bucket → if empty, reject (429)
  3. Consume one token from each bucket
  4. Process request</pre>
</div>

<h3>Default Limits by Tier</h3>
<table>
<tr><th>Tier</th><th>Requests/Minute</th><th>Requests/Day</th><th>Burst Allowance</th></tr>
<tr><td>Free</td><td>20</td><td>1,000</td><td>5 extra</td></tr>
<tr><td>Pro</td><td>200</td><td>50,000</td><td>50 extra</td></tr>
<tr><td>Enterprise</td><td>2,000</td><td>Unlimited</td><td>500 extra</td></tr>
</table>

<h3>Adaptive Throttling</h3>
<p>When substrate health drops below 70%:</p>
<ul>
<li>All rate limits reduced by 30%</li>
<li>Burst allowances suspended</li>
<li>Non-essential endpoints return 503</li>
</ul>

<h2>Usage Metering</h2>
<p>Every request is metered across multiple dimensions:</p>
<table>
<tr><th>Dimension</th><th>Tracking</th></tr>
<tr><td>API calls</td><td>Count per key per day</td></tr>
<tr><td>Tokens consumed</td><td>Input + output tokens per request</td></tr>
<tr><td>Compute time</td><td>Edge function execution time (ms)</td></tr>
<tr><td>Cost</td><td>Calculated in millicents (1/10th cent)</td></tr>
</table>

<h3>Cost Calculation</h3>
<pre>request_cost = (
    tokens_used × token_rate
  + compute_ms × compute_rate
  + base_request_cost
)</pre>
<p>Where rates vary by tier and provider used.</p>

<h2>Scope System</h2>
<p>Scopes control what actions an API key can perform:</p>
<pre>Scope Hierarchy:
  *:*                     ← Full access (all modules, all actions)
  ├── brain:*             ← All BRAIN operations
  │   ├── brain:read      ← Read-only BRAIN access
  │   └── brain:write     ← Write BRAIN access
  ├── system:*            ← All SYSTEM operations
  │   ├── system:read     ← Read-only system info
  │   └── system:admin    ← Administrative actions
  ├── agency:*            ← All agency operations
  │   ├── agency:manage   ← Create/configure agencies
  │   └── agency:execute  ← Run agency tasks
  └── ... (all 21 modules follow this pattern)</pre>

<h2>Product Catalog</h2>
<p>ACCESS manages a product catalog for entitlement management:</p>
<table>
<tr><th>Product Code</th><th>Name</th><th>Category</th></tr>
<tr><td>substrate-core</td><td>Core Substrate Access</td><td>Platform</td></tr>
<tr><td>brain-premium</td><td>Enhanced Memory Features</td><td>Cognitive</td></tr>
<tr><td>nexus-priority</td><td>Priority AI Routing</td><td>Operational</td></tr>
<tr><td>agency-base</td><td>Base Agency Package</td><td>Agency</td></tr>
<tr><td>agency-premium</td><td>Premium Agency Features</td><td>Agency</td></tr>
<tr><td>integration-enterprise</td><td>Enterprise Adapters</td><td>Integration</td></tr>
<tr><td>accessibility-pro</td><td>Professional A11y Scanning</td><td>Compliance</td></tr>
</table>

<h2>Terminal Commands</h2>
<table>
<tr><th>Command</th><th>Description</th></tr>
<tr><td>access.status</td><td>Module status</td></tr>
<tr><td>access.register</td><td>Register new developer</td></tr>
<tr><td>access.create_key</td><td>Generate new API key</td></tr>
<tr><td>access.revoke</td><td>Revoke an API key</td></tr>
<tr><td>access.keys</td><td>List keys for a developer</td></tr>
<tr><td>access.entitlements</td><td>View developer entitlements</td></tr>
<tr><td>access.products</td><td>List available products</td></tr>
<tr><td>access.usage</td><td>Usage report (by key, by day)</td></tr>
<tr><td>access.quota</td><td>Current quota status</td></tr>
</table>

<h2>Events Emitted</h2>
<table>
<tr><th>Event</th><th>When</th></tr>
<tr><td>access.key_created</td><td>New API key generated</td></tr>
<tr><td>access.key_revoked</td><td>API key revoked</td></tr>
<tr><td>access.rate_limited</td><td>Request rejected by rate limiter</td></tr>
<tr><td>access.quota_warning</td><td>80% of daily quota consumed</td></tr>
<tr><td>access.quota_exceeded</td><td>Daily quota fully consumed</td></tr>
</table>

<h2>Performance</h2>
<table>
<tr><th>Metric</th><th>Value</th></tr>
<tr><td>Boot time</td><td>~5ms</td></tr>
<tr><td>Key validation</td><td>&lt; 2ms</td></tr>
<tr><td>Rate limit check</td><td>&lt; 1ms</td></tr>
<tr><td>Usage logging</td><td>&lt; 3ms (async)</td></tr>
<tr><td>Scope resolution</td><td>&lt; 1ms</td></tr>
</table>

<hr />
<p><em>CMPSBL OS Substrate v10.8.0 — ARCHITECT Epoch</em><br />
<em>Kenneth E Sweet Jr · PromptFluid®</em><br />
<em>ORCID: <a href="https://orcid.org/0009-0001-4237-1243">0009-0001-4237-1243</a> · DOI: <a href="https://doi.org/10.5281/zenodo.18234909">10.5281/zenodo.18234909</a></em><br />
<em>© 2025–2026 PromptFluid®. All rights reserved.</em></p>

</div>
</body>
</html>