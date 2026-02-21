<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<title>Infrastructure Systems — CMPSBL OS Substrate</title>
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

<h1>🏗️ Infrastructure Systems</h1>
<p><strong>CONFIDENTIAL — Trade Secret</strong></p>
<p><strong>v10.5.1 ARCHITECT Epoch</strong></p>
<hr />

<h2>Infrastructure Layer Modules</h2>
<p>The Infrastructure layer contains 6 specialized modules, all upgraded in v10.5.1 with CLM-driven enhancements:</p>
<table>
<tr><th>Module</th><th>Purpose</th><th>Boot Order</th><th>v10.5.1 Upgrades</th></tr>
<tr><td><strong>MEMORY</strong></td><td>Vector storage, RAG recall, embedding management</td><td>15</td><td>Staleness detection, relevance feedback</td></tr>
<tr><td><strong>RELAY</strong></td><td>Outbound webhooks, notifications, external delivery</td><td>16</td><td>HMAC signatures, adaptive retry</td></tr>
<tr><td><strong>AUDIT</strong></td><td>Immutable compliance logging, audit trails</td><td>17</td><td>SOC2/GDPR/HIPAA/ISO27001 templates, compression</td></tr>
<tr><td><strong>IDENTITY</strong></td><td>Actor attribution, session management, fingerprinting</td><td>18</td><td>Reputation scoring, cross-agency portability</td></tr>
<tr><td><strong>ECONOMY</strong></td><td>Cost tracking, budgeting, metering</td><td>19</td><td>Predictive forecasting, per-capability attribution</td></tr>
<tr><td><strong>SANDBOX</strong></td><td>Safe code execution, isolated runtime environments</td><td>20</td><td>Resource limit enforcement, snapshot/restore</td></tr>
</table>

<hr />

<h2>Cross-Cutting: CLM Engine v2.0</h2>
<p>All infrastructure modules are now serviced by the server-side CLM Engine running autonomously every 5 minutes:</p>
<div class="card">
<pre>┌──────────────────────────────────────────────┐
│  CLM Engine v2.0 (pf-clm-engine)             │
│  5-Phase Lifecycle — Every 5 Minutes          │
├──────────────────────────────────────────────┤
│  Phase 1: Cognitive Cycle (learn/reflect)     │
│  Phase 2: Module Self-Analysis (rotating)     │
│  Phase 3: Topic Study (10 domains)            │
│  Phase 4: Brain Transfer (→ all 21 modules)   │
│  Phase 5: Memory Consolidation (tier mgmt)    │
└──────────────────────────────────────────────┘</pre>
</div>

<h3>Budget &amp; Governance</h3>
<table>
<tr><th>Limit</th><th>Value</th></tr>
<tr><td>Max cycles/day</td><td>200</td></tr>
<tr><td>Max cycles/hour</td><td>12</td></tr>
<tr><td>Quiet hours</td><td>2am–6am UTC (reduced intensity)</td></tr>
<tr><td>Kill switch</td><td>Global disable via <code>clm_engine_enabled</code> flag</td></tr>
</table>

<hr />

<h2>MEMORY Module Internals</h2>

<h3>Vector Store Architecture</h3>
<div class="card">
<pre>Embedding Input → Dimension Reduction → Index → Store
                                          ↓
                              Query → ANN Search → Rank → Return</pre>
</div>

<table>
<tr><th>Parameter</th><th>Value</th></tr>
<tr><td>Vector dimensions</td><td>1536 (default), 768 (compact)</td></tr>
<tr><td>Index type</td><td>HNSW (Hierarchical Navigable Small World)</td></tr>
<tr><td>Distance metric</td><td>Cosine similarity</td></tr>
<tr><td>ANN recall@10</td><td>&gt; 95%</td></tr>
<tr><td>Max vectors</td><td>1,000,000 per tenant</td></tr>
</table>

<h3>Embedding Staleness Detection (v10.5.1)</h3>
<p>Tracks <code>embeddingVersion</code> on every vector. When model version advances:</p>
<ul>
<li>Stale vectors are flagged and queued for re-embedding</li>
<li>Re-embedding runs during CLM Phase 3</li>
<li>Staleness threshold: 20% triggers automatic re-embedding batch</li>
</ul>

<h3>Relevance Feedback Loop (v10.5.1)</h3>
<ul>
<li>EMA learning rate α = 0.1</li>
<li>Every retrieval adjusts <code>relevanceScore</code> based on utility feedback</li>
<li>Scores below 0.05 mark vectors as pruning candidates</li>
</ul>

<h3>RAG Pipeline</h3>
<div class="card">
<pre>Query → Embed → Vector Search (top-k=10) → Re-rank → Relevance Adjust → Context Assembly → LLM</pre>
</div>

<hr />

<h2>RELAY Module Internals</h2>

<h3>Webhook Delivery</h3>
<table>
<tr><th>Feature</th><th>Implementation</th></tr>
<tr><td>Retry policy</td><td>Adaptive exponential backoff with jitter (v10.5.1)</td></tr>
<tr><td>Signature</td><td>HMAC-SHA256 of timestamp + payload with per-endpoint secret (v10.5.1)</td></tr>
<tr><td>Timeout</td><td>10s per delivery attempt</td></tr>
<tr><td>Dead letter</td><td>After 5 failures, move to dead letter queue</td></tr>
<tr><td>Rate limit</td><td>100 deliveries/minute per endpoint</td></tr>
</table>

<h3>Signature Header Format (v10.5.1)</h3>
<div class="card">
<pre>X-Substrate-Signature: sha256={hmac}
X-Substrate-Timestamp: {unix_timestamp}</pre>
</div>

<h3>Notification Channels</h3>
<table>
<tr><th>Channel</th><th>Method</th><th>Integration</th></tr>
<tr><td>Webhook</td><td>HTTP POST</td><td>Direct</td></tr>
<tr><td>Email</td><td>SMTP/API</td><td>Via configured provider</td></tr>
<tr><td>In-app</td><td>RIPPLE event</td><td>Internal</td></tr>
</table>

<hr />

<h2>AUDIT Module Internals</h2>

<h3>Compliance Report Templates (v10.5.1)</h3>
<table>
<tr><th>Framework</th><th>Generator</th><th>Output Format</th></tr>
<tr><td>SOC2</td><td><code>audit.compliance_report('soc2')</code></td><td>JSON / Markdown</td></tr>
<tr><td>GDPR</td><td><code>audit.compliance_report('gdpr')</code></td><td>JSON / Markdown</td></tr>
<tr><td>HIPAA</td><td><code>audit.compliance_report('hipaa')</code></td><td>JSON / Markdown</td></tr>
<tr><td>ISO27001</td><td><code>audit.compliance_report('iso27001')</code></td><td>JSON / Markdown</td></tr>
</table>

<h3>Entry Compression (v10.5.1)</h3>
<table>
<tr><th>Age</th><th>Compression Level</th></tr>
<tr><td>&lt; 24h</td><td>Full detail (all state fields)</td></tr>
<tr><td>24h–7d</td><td>Verbose state fields nullified, hash preserved</td></tr>
<tr><td>&gt; 7d</td><td>Essential fields only (actor, action, timestamp, hash)</td></tr>
</table>

<h3>Log Schema</h3>
<div class="card">
<pre>interface AuditEntry {
  id: string;
  timestamp: string;        // ISO 8601, microsecond precision
  actor_id: string;         // From IDENTITY module
  actor_type: 'user' | 'system' | 'agent' | 'api_key';
  action: string;           // module.action format
  resource_type: string;
  resource_id: string;
  changes: {
    before: Record&lt;string, unknown&gt;;
    after: Record&lt;string, unknown&gt;;
  };
  metadata: {
    ip_address?: string;
    user_agent?: string;
    session_id?: string;
    request_id: string;
  };
  integrity_hash: string;   // SHA-256 chain hash
}</pre>
</div>

<h3>Immutability Guarantees</h3>
<ul>
<li>Entries are append-only — no UPDATE or DELETE operations</li>
<li>Each entry's <code>integrity_hash</code> = SHA-256(previous_hash + entry_data)</li>
<li>Chain verified on read: any tampering breaks the hash chain</li>
<li>Retention: 7 years minimum for compliance</li>
</ul>

<hr />

<h2>IDENTITY Module Internals</h2>

<h3>Actor Reputation System (v10.5.1)</h3>
<div class="card">
<pre>interface ActorReputation {
  actor_id: string;
  trust_score: number;       // 0.0–1.0
  tier: 'untrusted' | 'basic' | 'verified' | 'trusted' | 'elite';
  successful_ops: number;
  violations: number;
  last_updated: string;
}</pre>
</div>

<h3>Cross-Agency Portability (v10.5.1)</h3>
<p>Signed JWT tokens carry identity + reputation between agencies:</p>
<ul>
<li>Payload: <code>actor_id</code>, <code>trust_score</code>, <code>tier</code>, <code>origin_agency</code>, <code>issued_at</code>, <code>expires_at</code></li>
<li>Signature: HMAC-SHA256 with substrate-level secret</li>
</ul>

<h3>Actor Resolution</h3>
<div class="card">
<pre>Request → Extract Auth Token → Resolve User ID → Check Reputation → Enrich with Profile → Attach to Context</pre>
</div>

<table>
<tr><th>Identity Source</th><th>Priority</th><th>Method</th></tr>
<tr><td>JWT token</td><td>1</td><td>Decode and verify</td></tr>
<tr><td>API key</td><td>2</td><td>Hash lookup</td></tr>
<tr><td>Session cookie</td><td>3</td><td>Session store lookup</td></tr>
<tr><td>Fingerprint</td><td>4</td><td>Device/browser fingerprinting</td></tr>
<tr><td>Anonymous</td><td>5</td><td>Generate ephemeral ID</td></tr>
</table>

<hr />

<h2>ECONOMY Module Internals</h2>

<h3>Predictive Cost Forecasting (v10.5.1)</h3>
<div class="card">
<pre>interface CostForecast {
  dailyForecast: number;     // millicents
  weeklyForecast: number;
  monthlyForecast: number;
  confidenceInterval: number; // ± range at 95%
  trendDirection: 'increasing' | 'stable' | 'decreasing';
  anomalyFlag: boolean;      // True if >2σ deviation
}</pre>
</div>
<p>Forecasts recalculated hourly by CLM Engine using linear regression on 30-day historical data.</p>

<h3>Per-Capability Attribution (v10.5.1)</h3>
<p>Every capability now tracks: <code>totalCalls</code>, <code>totalCost</code>, <code>avgCostPerCall</code>, <code>avgTokensPerCall</code>, <code>trend</code>.</p>

<h3>Cost Tracking</h3>
<div class="card">
<pre>interface EconomyEvent {
  module: string;
  action: string;
  capability: string;        // v10.5.1
  tokens_used: number;
  compute_ms: number;
  cost_millicents: number;
  developer_id: string;
  api_key_id: string;
  product_code: string;
}</pre>
</div>

<h3>Budget Enforcement</h3>
<table>
<tr><th>Check</th><th>Trigger</th><th>Response</th></tr>
<tr><td>Daily budget</td><td>cost &gt; daily_limit × 0.9</td><td>Warning email</td></tr>
<tr><td>Daily budget</td><td>cost &gt; daily_limit</td><td>Block non-essential requests</td></tr>
<tr><td>Monthly budget</td><td>cost &gt; monthly_limit × 0.8</td><td>Alert + throttle</td></tr>
<tr><td>Per-request</td><td>estimated &gt; max_request_cost</td><td>Reject with explanation</td></tr>
<tr><td>Forecast anomaly</td><td>&gt;2σ deviation</td><td>Alert + investigation</td></tr>
</table>

<hr />

<h2>SANDBOX Module Internals</h2>

<h3>Resource Limit Enforcement (v10.5.1)</h3>
<table>
<tr><th>Resource</th><th>Default</th><th>Max</th><th>Enforcement</th></tr>
<tr><td>CPU time</td><td>5s</td><td>30s</td><td>Kill</td></tr>
<tr><td>Memory</td><td>128MB</td><td>512MB</td><td>OOM kill</td></tr>
<tr><td>Execution time</td><td>30s</td><td>5min</td><td>Timeout kill</td></tr>
<tr><td>Concurrency</td><td>5</td><td>10</td><td>Queue rejection</td></tr>
<tr><td>Output</td><td>1MB</td><td>10MB</td><td>Truncation</td></tr>
</table>

<h3>Snapshot/Restore (v10.5.1)</h3>
<ul>
<li>Max 5 snapshots per sandbox</li>
<li>Includes: variables, function definitions, execution context</li>
<li>Auto-cleanup: oldest removed when limit reached</li>
</ul>

<h3>Execution Environment</h3>
<table>
<tr><th>Feature</th><th>Specification</th></tr>
<tr><td>Runtime</td><td>Isolated V8 isolate (Deno-based)</td></tr>
<tr><td>Network access</td><td>Allowlisted domains only</td></tr>
<tr><td>File system</td><td>No access</td></tr>
</table>

<h3>Security Boundary</h3>
<div class="card">
<pre>User Code → Parse → AST Safety Check → Resource Allocation → Sandbox Execute → Output Sanitize → Return</pre>
</div>
<p>AST safety check rejects:</p>
<ul>
<li><code>eval()</code>, <code>Function()</code> constructors</li>
<li>Prototype pollution patterns</li>
<li>Infinite loop detection (static analysis)</li>
<li>Import of non-allowlisted modules</li>
</ul>

<hr />
<p><em>CMPSBL OS Substrate v10.8.0 — ARCHITECT Epoch — INTERNAL USE ONLY</em><br />
<em>Kenneth E Sweet Jr · PromptFluid®</em><br />
<em>ORCID: <a href="https://orcid.org/0009-0001-4237-1243">0009-0001-4237-1243</a> · DOI: <a href="https://doi.org/10.5281/zenodo.18234909">10.5281/zenodo.18234909</a></em><br />
<em>© 2025–2026 PromptFluid®. All rights reserved.</em></p>

</div>
</body>
</html>