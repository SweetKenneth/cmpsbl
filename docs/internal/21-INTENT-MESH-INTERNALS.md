<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<title>Intent Mesh — Internal Architecture &amp; Trade Secrets</title>
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

<h1>🔒 Intent Mesh — Internal Architecture &amp; Trade Secrets</h1>
<p><strong>CMPSBL OS Substrate v10.1.0</strong></p>
<p><strong>Classification:</strong> CONFIDENTIAL — Trade Secrets<br />
<strong>Sensitivity:</strong> 🔴 Critical<br />
<strong>Audience:</strong> Founders · Lead Engineers · Authorized Investors (NDA)</p>
<hr />

<p>⚠️ <strong>This document contains proprietary algorithms, implementation details, and trade secrets.</strong> Do not distribute outside of CMPSBL/PromptFluid without written authorization.</p>

<hr />

<h2>1. Why This Matters (Crown Jewel Status)</h2>
<p>The Intent Mesh is classified as a <strong>Crown Jewel</strong> artifact because:</p>
<ol>
<li><strong>No known prior art</strong> — No competing system combines autonomous module discovery with governed composition, pipeline crystallization, and cryptographic auditability</li>
<li><strong>Exponential moat</strong> — Each new resolver multiplies possible interaction paths (n×m combinatorial growth)</li>
<li><strong>Data flywheel</strong> — Every receipt generates training data for future mesh optimization</li>
<li><strong>Self-learning loop</strong> — Crystallized pipelines are emergent knowledge codified back into the system</li>
<li><strong>Patent-eligible</strong> — The combination of capability advertisement, intent routing, risk gating, receipt generation, and pipeline crystallization is novel</li>
</ol>

<hr />

<h2>2. Implementation Internals</h2>

<h3>2.1 File Structure</h3>
<div class="card">
<pre>src/lib/substrate/intent-mesh/
├── types.ts       — Type definitions (MeshResolver, MeshIntent, MeshResolution, MeshReceipt)
├── manifest.ts    — Capability manifest (20 resolvers, 11 modules)
├── router.ts      — Intent router (broadcast, resolve, compose, log)
├── toggle.ts      — Kill switch (Zustand + persist)
├── pipelines.ts   — Pipeline crystallization (save, load, run, delete)
└── index.ts       — Public API surface</pre>
</div>

<h3>2.2 Router Algorithm (Trade Secret)</h3>
<p>The router uses a <strong>domain-intersection matching</strong> algorithm:</p>
<ol>
<li>Intent broadcasts with <code>domains: ['security', 'identity']</code></li>
<li>Router scans all resolvers whose <code>domains</code> array <strong>intersects</strong> with the intent's domains</li>
<li>Source module is excluded (anti-self-query)</li>
<li>Risk gating filters based on governance mode</li>
<li>Remaining resolvers execute <strong>in parallel</strong> (all <code>read</code> risk = safe for concurrent execution)</li>
<li>Results are <strong>merged</strong> via <code>Object.assign</code> — last resolver wins for duplicate keys (deterministic due to manifest ordering)</li>
</ol>
<p><strong>Critical Detail:</strong> The merge strategy is intentionally simple (last-write-wins) to avoid complexity. Future versions may implement weighted merge based on resolver confidence scores.</p>

<h3>2.3 Receipt Sanitization</h3>
<p>Receipts undergo sanitization before database storage:</p>
<ul>
<li>Keys containing <code>password</code>, <code>secret</code>, <code>token</code>, <code>key</code>, <code>api_key</code> → <code>[REDACTED]</code></li>
<li>String values &gt; 200 chars → truncated with <code>...</code></li>
<li>Receipts are fire-and-forget (non-blocking) to avoid latency impact</li>
</ul>

<h3>2.4 Realtime Subscription (v10.1 Trade Secret)</h3>
<p>The dashboard subscribes to Postgres realtime changes on <code>mesh_intents</code>:</p>
<div class="card">
<pre>supabase.channel('mesh-live')
  .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'mesh_intents' }, handler)
  .subscribe()</pre>
</div>
<p><strong>Key design decision:</strong> Only <code>INSERT</code> events are subscribed — receipts are immutable. This avoids unnecessary change tracking and reduces realtime bandwidth.</p>

<h3>2.5 Pipeline Crystallization Algorithm (v10.1 Trade Secret)</h3>
<p>The crystallization process extracts a <strong>replayable configuration</strong> from a receipt:</p>
<ol>
<li>User identifies a successful receipt (via dashboard hover or <code>mesh.save</code>)</li>
<li>System extracts: <code>source_module</code>, <code>intent_type</code>, <code>domains</code>, <code>governance_mode</code>, <code>resolver_chain</code>, <code>input_template</code></li>
<li>Configuration stored in <code>mesh_saved_pipelines</code> with foreign key to originating receipt</li>
<li>Replay calls <code>broadcastIntent()</code> with the stored configuration</li>
<li>Run counter incremented on each execution (fire-and-forget update)</li>
</ol>
<p><strong>Critical Insight:</strong> The crystallization preserves the <em>intent configuration</em>, not the <em>resolver results</em>. This means replaying a pipeline may produce different results if the resolver manifest or module state has changed — this is <strong>by design</strong>, as it allows pipelines to evolve with the system.</p>

<h3>2.6 Resolver Execution (Current vs Future)</h3>
<p><strong>Current (v10.0–10.1):</strong> Resolvers return structured placeholders showing provenance (<code>[MODULE:output_key]</code>). This proves routing works without requiring live module endpoints.</p>
<p><strong>Future (v10.2+):</strong> Resolvers will call actual module APIs or edge functions. The transition requires:</p>
<ul>
<li>Each module implementing a <code>resolve()</code> function matching its advertised schema</li>
<li>The router calling module resolvers dynamically via the Engine Bus</li>
<li>Response validation against declared <code>produces</code> schema</li>
</ul>

<hr />

<h2>3. Governance Internals</h2>

<h3>3.1 Kill Switch Implementation</h3>
<p>The kill switch uses Zustand with <code>persist</code> middleware to survive page reloads:</p>
<div class="card">
<pre>// Non-hook version for library code (outside React components)
export function isMeshEnabled(): boolean {
  return useMeshToggle.getState().enabled;
}</pre>
</div>
<p>This is checked at the top of <code>broadcastIntent()</code> — zero-cost exit when disabled.</p>

<h3>3.2 Risk Escalation Path (Future)</h3>
<p>Planned for v10.3:</p>
<ol>
<li><code>read</code> → No approval needed</li>
<li><code>enrich</code> → Logged, may require human review in <code>governed</code> mode</li>
<li><code>mutate</code> → Requires explicit human approval (dashboard prompt or terminal confirm)</li>
</ol>

<hr />

<h2>4. Database Schema</h2>

<h3>4.1 mesh_intents (v10.0)</h3>
<div class="card">
<pre>CREATE TABLE public.mesh_intents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  intent_type TEXT NOT NULL,
  source_module TEXT NOT NULL,
  target_modules TEXT[] DEFAULT '{}',
  resolved_by TEXT[] DEFAULT '{}',
  input_summary JSONB DEFAULT '{}',
  output_summary JSONB DEFAULT '{}',
  governance_mode TEXT DEFAULT 'read_only',
  success BOOLEAN DEFAULT false,
  duration_ms INTEGER DEFAULT 0,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
-- Realtime enabled, RLS: admin-only</pre>
</div>

<h3>4.2 mesh_saved_pipelines (v10.1)</h3>
<div class="card">
<pre>CREATE TABLE public.mesh_saved_pipelines (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  source_module TEXT NOT NULL,
  intent_type TEXT NOT NULL,
  domains TEXT[] DEFAULT '{}',
  governance_mode TEXT DEFAULT 'read_only',
  resolver_chain TEXT[] DEFAULT '{}',
  input_template JSONB DEFAULT '{}',
  discovered_from UUID REFERENCES mesh_intents(id),
  is_active BOOLEAN DEFAULT true,
  run_count INTEGER DEFAULT 0,
  last_run_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
-- Realtime enabled, RLS: admin manage / public read</pre>
</div>

<hr />

<h2>5. Strategic Roadmap</h2>
<table>
<tr><th>Version</th><th>Feature</th><th>Status</th></tr>
<tr><td>v10.0</td><td>Core mesh + manifest + receipts</td><td>✅ Shipped</td></tr>
<tr><td>v10.1</td><td>Live realtime feed + replay + pipeline crystallization</td><td>✅ Shipped</td></tr>
<tr><td>v10.2</td><td>Live resolver execution (actual module APIs)</td><td>🔄 Planned</td></tr>
<tr><td>v10.3</td><td>Risk escalation prompts + weighted merge</td><td>🔄 Planned</td></tr>
<tr><td>v10.4</td><td>Self-evolving manifest (modules register dynamically)</td><td>🔄 Research</td></tr>
<tr><td>v10.5</td><td>Cross-substrate mesh (federated intent routing)</td><td>🔄 Research</td></tr>
<tr><td>v10.6</td><td>Pipeline auto-optimization (ML-driven chain reordering)</td><td>🔄 Research</td></tr>
</table>

<hr />

<h2>6. Attack Surface Analysis</h2>
<table>
<tr><th>Threat</th><th>Mitigation</th></tr>
<tr><td>Resolver spoofing</td><td>Manifest is compile-time constant; cannot be modified at runtime</td></tr>
<tr><td>Intent flooding</td><td>Rate limiting at router level (planned v10.3)</td></tr>
<tr><td>Data exfiltration via receipts</td><td>Input/output sanitization; sensitive keys redacted</td></tr>
<tr><td>Unauthorized mesh activation</td><td>Kill switch OFF by default; toggle persisted per-device</td></tr>
<tr><td>Cross-module privilege escalation</td><td>Risk gating blocks mutations in <code>read_only</code> mode</td></tr>
<tr><td>Pipeline poisoning</td><td>Pipelines inherit governance mode from source receipt; <code>read_only</code> enforced by default</td></tr>
<tr><td>Replay amplification</td><td>Run counter tracked; rate limiting on pipeline execution (planned v10.3)</td></tr>
</table>

<hr />

<h2>7. Terminal Command Internals (13 Commands)</h2>
<p>The terminal handler (<code>src/lib/terminal/mesh-handlers.ts</code>) registers 13 commands in the <code>mesh.*</code> namespace. Key implementation details:</p>
<ul>
<li><strong><code>mesh.replay</code></strong>: Looks up receipt by ID or prefix match, reconstructs the original intent, broadcasts via <code>broadcastIntent()</code>, generates a new receipt linking back to the original</li>
<li><strong><code>mesh.save</code></strong>: Finds the most recent successful receipt with non-empty <code>resolved_by</code>, extracts configuration, inserts into <code>mesh_saved_pipelines</code></li>
<li><strong><code>mesh.run</code></strong>: Fuzzy-matches pipeline by name (case-insensitive substring) or ID prefix, calls <code>runSavedPipeline()</code> which broadcasts and increments run counter</li>
</ul>

<hr />
<p><em>CMPSBL OS Substrate v10.8.0 — Intent Mesh Internals — CONFIDENTIAL</em><br />
<em>Kenneth E Sweet Jr · PromptFluid®</em><br />
<em>ORCID: <a href="https://orcid.org/0009-0001-4237-1243">0009-0001-4237-1243</a> · DOI: <a href="https://doi.org/10.5281/zenodo.18234909">10.5281/zenodo.18234909</a></em><br />
<em>© 2025–2026 PromptFluid®. All rights reserved.</em></p>

</div>
</body>
</html>