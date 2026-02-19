<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<title>IDENTITY Module — Deep Dive</title>
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

<h1>Module 18 — IDENTITY</h1>
<p><strong>Actor Attribution, Reputation, and Sessions</strong></p>
<p><strong>Layer 6 — Infrastructure</strong> · <strong>v10.5.1 ARCHITECT Epoch</strong></p>
<hr />

<h2>Purpose</h2>
<p>IDENTITY manages actor attribution — knowing exactly who or what is performing every action in the substrate. It handles user sessions, API key identities, system actor identities, cognitive agent identities, reputation scoring, and cross-agency identity portability.</p>

<h2>Capabilities</h2>
<table>
<tr><th>Capability</th><th>Description</th><th>Tier</th></tr>
<tr><td>Session Management</td><td>Create, validate, and expire user sessions</td><td>Free</td></tr>
<tr><td>API Key Identity</td><td>Map API keys to developer accounts</td><td>Free</td></tr>
<tr><td>Actor Resolution</td><td>Resolve any request to a specific actor identity</td><td>Free</td></tr>
<tr><td>Actor Reputation Scoring (v10.5.1)</td><td>Trust scores mapped to tiers (untrusted → elite)</td><td>Free</td></tr>
<tr><td>Session Context</td><td>Attach metadata to sessions (preferences, state)</td><td>Pro</td></tr>
<tr><td>Multi-Session Support</td><td>Users can have multiple active sessions</td><td>Pro</td></tr>
<tr><td>Cross-Agency Identity Portability (v10.5.1)</td><td>Signed JWT tokens for identity transfer between agencies</td><td>Pro</td></tr>
<tr><td>Cognitive Identity</td><td>Assign identities to AI agents within agencies</td><td>Enterprise</td></tr>
<tr><td>Identity Federation</td><td>Map external identity providers to substrate identities</td><td>Enterprise</td></tr>
<tr><td>Identity Analytics</td><td>Track actor behavior patterns over time</td><td>CMPSBL</td></tr>
<tr><td>Actor Impersonation (Admin)</td><td>Admins can act as another identity for debugging</td><td>CMPSBL</td></tr>
</table>

<h2>Actor Reputation System (v10.5.1)</h2>
<table>
<tr><th>Tier</th><th>Score Range</th><th>Privileges</th></tr>
<tr><td>untrusted</td><td>0.0–0.2</td><td>Read-only access, rate limited</td></tr>
<tr><td>basic</td><td>0.2–0.4</td><td>Standard operations</td></tr>
<tr><td>verified</td><td>0.4–0.6</td><td>Extended quotas</td></tr>
<tr><td>trusted</td><td>0.6–0.8</td><td>Reduced governance friction</td></tr>
<tr><td>elite</td><td>0.8–1.0</td><td>Priority routing, elevated limits</td></tr>
</table>
<p>Trust scores are updated based on:</p>
<ul>
<li>Successful operations (+0.01)</li>
<li>Security violations (-0.15)</li>
<li>Consistent usage patterns (+0.005/day)</li>
<li>Defense flags or blocks (-0.10)</li>
</ul>

<h2>Cross-Agency Identity Portability (v10.5.1)</h2>
<div class="card">
<pre>┌──────────────┐         ┌──────────────┐
│  Agency A     │ ──JWT──► │  Agency B     │
│  actor: user1 │         │  actor: user1 │
│  trust: 0.85  │         │  trust: 0.85  │
│  tier: elite  │         │  tier: elite  │
└──────────────┘         └──────────────┘</pre>
<p>Tokens include: actor_id, trust_score, tier, origin_agency, issued_at, expires_at, signature.</p>
</div>

<h2>Actor Types</h2>
<table>
<tr><th>Actor Type</th><th>Identifier</th><th>Example</th></tr>
<tr><td>Human User</td><td>user:{uuid}</td><td>Authenticated user via login</td></tr>
<tr><td>API Key</td><td>key:{key_prefix}</td><td>Developer accessing via API</td></tr>
<tr><td>System Module</td><td>system:{module_name}</td><td>DREAM performing autonomous operations</td></tr>
<tr><td>Cognitive Agent</td><td>agent:{cognitive_id}</td><td>Agency member executing a task</td></tr>
<tr><td>Anonymous</td><td>anon:{session_id}</td><td>Unauthenticated visitor (limited access)</td></tr>
</table>

<h2>Session Lifecycle</h2>
<div class="card">
<pre>Authentication (login / API key)
         │
         ▼
┌─────────────────┐
│  Identity         │  Resolve actor type, permissions, and trust tier
│  Resolution       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Session          │  Create session with TTL and metadata
│  Creation         │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Active           │  Session is valid for requests
│  Session          │  Refresh on activity, expire on TTL
└────────┬────────┘
         │
    On expiry or logout:
         ▼
┌─────────────────┐
│  Session          │  Clean up, log in AUDIT, update reputation
│  Termination      │
└─────────────────┘</pre>
</div>

<h2>Integration with Other Modules</h2>
<table>
<tr><th>Module</th><th>Integration</th></tr>
<tr><td>ACCESS</td><td>Validates API keys and resolves developer identity</td></tr>
<tr><td>AUDIT</td><td>Provides actor attribution for every logged event</td></tr>
<tr><td>BRAIN</td><td>Scopes memory access by actor identity; receives behavioral profiles via transfer</td></tr>
<tr><td>DEFENSE</td><td>Behavioral fingerprinting tied to actor identity; trust score informs threat assessment</td></tr>
<tr><td>RIPPLE</td><td>Emits identity.session_created, identity.session_expired, identity.trust_updated</td></tr>
</table>

<h2>Database Tables</h2>
<table>
<tr><th>Table</th><th>Purpose</th></tr>
<tr><td>identity_sessions</td><td>Active and historical session records</td></tr>
<tr><td>identity_actors</td><td>Registered actor identities, metadata, and trust scores</td></tr>
<tr><td>cognitive_registry</td><td>AI agent identity records</td></tr>
</table>

<hr />
<p><em>CMPSBL OS Substrate v10.5.1 — ARCHITECT Epoch</em><br />
<em>Kenneth E Sweet Jr · PromptFluid®</em><br />
<em>ORCID: XXXX-XXXX-XXXX-XXXX · DOI: 10.5281/zenodo.XXXXXXX</em><br />
<em>© 2025–2026 PromptFluid®. All rights reserved.</em></p>

</div>
</body>
</html>