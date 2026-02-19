<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<title>Architecture Internals — CONFIDENTIAL</title>
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

<h1>🔒 Architecture Internals</h1>
<p><strong>Complete Implementation Details — CONFIDENTIAL</strong></p>
<p><strong>Document 01</strong> · <strong>Classification: 🔴 HIGH — Trade Secrets</strong></p>
<hr />

<p>⚠️ <strong>CONFIDENTIAL</strong> — This document contains proprietary implementation details. Do not distribute outside of CMPSBL/PromptFluid without written authorization.</p>

<h2>1. Module Isolation — How It Actually Works</h2>
<p>The public documentation describes module isolation as "each module has its own circuit breaker." Here is the full implementation:</p>

<h3>Circuit Breaker State Machine</h3>
<p>Each module's circuit breaker follows a <strong>three-state model</strong>:</p>
<div class="card">
<pre>CLOSED (normal) ─── failure threshold hit ──→ OPEN (rejecting)
    ↑                                              │
    │                                         timeout expires
    │                                              │
    └──── success threshold hit ◄── HALF-OPEN (testing) ◄──┘</pre>
</div>

<p><strong>Internal thresholds</strong> (not public):</p>
<table>
<tr><th>Parameter</th><th>Value</th><th>Notes</th></tr>
<tr><td>Failure threshold</td><td>3 consecutive</td><td>Opens circuit after 3 failures</td></tr>
<tr><td>Recovery timeout</td><td>30 seconds</td><td>Time before HALF-OPEN test</td></tr>
<tr><td>Success threshold</td><td>2 consecutive</td><td>Closes circuit after 2 successes in HALF-OPEN</td></tr>
<tr><td>Health decay rate</td><td>-20 per failure</td><td><code>health = 100 - (consecutive_failures × 20)</code></td></tr>
</table>

<h3>Health Score Formula</h3>
<div class="card">
<pre>health_score = 100 - (consecutive_failures × 20)

Thresholds:
  healthy:  >= 70  (0-1 recent failures)
  degraded: >= 40  (2 recent failures)
  critical: < 40   (3+ recent failures → auto-heal)</pre>
</div>
<p>This formula is deliberately simple. Complexity in health scoring creates unpredictable healing behavior. The substrate prioritizes <em>predictable recovery</em> over <em>nuanced scoring</em>.</p>

<h2>2. The RIPPLE Event Bus — Implementation Secrets</h2>

<h3>Schema Validation Pipeline</h3>
<p>Every event passes through:</p>
<ol>
<li><strong>Type check</strong> — event name must be registered</li>
<li><strong>Schema validation</strong> — payload must match Zod schema</li>
<li><strong>Size check</strong> — payload must be &lt; 64KB</li>
<li><strong>Rate check</strong> — publisher cannot exceed 100 events/second</li>
<li><strong>Delivery</strong> — fan-out to all subscribers</li>
</ol>

<p><strong>Secret:</strong> If validation fails at <em>any</em> step, the event is silently dropped (publisher receives no error), logged to DEFENSE as a <code>ripple.event.rejected</code> meta-event, and the publishing module's health score is NOT affected.</p>
<p>This silent-drop design is critical. If publishers received errors for malformed events, they might retry — creating feedback loops that amplify failures.</p>

<h3>Event Priority System</h3>
<table>
<tr><th>Priority</th><th>Behavior</th><th>Examples</th></tr>
<tr><td><strong>Critical</strong></td><td>Delivered first, bypasses queue</td><td><code>system.health.critical</code>, <code>defense.threat.detected</code></td></tr>
<tr><td><strong>Normal</strong></td><td>Standard FIFO delivery</td><td><code>brain.memory.stored</code>, <code>evolution.proposed</code></td></tr>
<tr><td><strong>Background</strong></td><td>Delivered during idle time</td><td><code>dream.insight.generated</code>, <code>vision.trend.updated</code></td></tr>
</table>

<h2>3. Request Routing — The Full Pipeline</h2>
<p>The public docs show an 8-step request flow. The actual pipeline has 14 steps:</p>
<div class="card">
<pre> 1. Request received (edge function)
 2. ACCESS — API key extraction and validation
 3. ACCESS — Rate limit check (per-key and global)
 4. ACCESS — Quota check (daily/monthly)
 5. DEFENSE — IP reputation check
 6. DEFENSE — Behavioral analysis (request fingerprinting)
 7. DEFENSE — Threat classification
 8. IDENTITY — Actor attribution (human vs agent vs system)
 9. DECODE — Intent classification
10. CORTEX — Route to target module(s)
11. TARGET MODULE — Execute operation
12. RIPPLE — Broadcast result events
13. ECONOMY — Record cost and usage
14. AUDIT — Write to immutable decision ledger</pre>
</div>
<p>Steps 5-7 run in parallel for performance. Steps 13-14 run asynchronously (fire-and-forget) so they don't impact response latency.</p>

<h2>4. Boot Sequence — Why This Order</h2>
<p>The boot order is not arbitrary. Each dependency is critical:</p>
<table>
<tr><th>Order</th><th>Module</th><th>Hard Dependency</th><th>What Breaks Without It</th></tr>
<tr><td>1</td><td>CORE</td><td>None</td><td>Everything — no config available</td></tr>
<tr><td>2</td><td>RIPPLE</td><td>CORE</td><td>No events — modules can't communicate</td></tr>
<tr><td>3</td><td>ACCESS</td><td>RIPPLE</td><td>No auth — all requests rejected</td></tr>
<tr><td>4</td><td>BRAIN</td><td>RIPPLE</td><td>No memory — cognitive ops fail silently</td></tr>
<tr><td>5</td><td>VISION</td><td>BRAIN</td><td>No observability — blind to system state</td></tr>
<tr><td>6</td><td>CORTEX</td><td>VISION, BRAIN</td><td>No orchestration — complex ops impossible</td></tr>
<tr><td>7</td><td>MODERNIZER</td><td>CORTEX</td><td>No evolution — system can't improve</td></tr>
<tr><td>8</td><td>DECODE</td><td>BRAIN</td><td>No NLP — natural language fails</td></tr>
<tr><td>9</td><td>DEFENSE</td><td>RIPPLE</td><td>No security — system exposed</td></tr>
<tr><td>10</td><td>NEXUS</td><td>DEFENSE</td><td>No AI routing — can't reach providers</td></tr>
<tr><td>11</td><td>DREAM</td><td>NEXUS, BRAIN</td><td>No autonomous learning</td></tr>
<tr><td>12</td><td>INTEGRATION</td><td>All core</td><td>No external connections</td></tr>
<tr><td>13</td><td>INCLUSIVE</td><td>INTEGRATION</td><td>No a11y scanning</td></tr>
<tr><td>14</td><td>SYSTEM</td><td>All</td><td>Health monitoring needs everything running</td></tr>
<tr><td>15-20</td><td>Infrastructure</td><td>SYSTEM</td><td>Vector, relay, audit, identity, economy, sandbox</td></tr>
<tr><td>21</td><td>ENCODE</td><td>All</td><td>Orchestrator needs everything</td></tr>
</table>

<p><strong>Critical insight:</strong> If RIPPLE fails during boot, the system enters <strong>degraded boot mode</strong> — modules communicate via direct function calls (bypassing the event bus) until RIPPLE recovers. This is the only exception to the "no direct calls" rule.</p>

<h2>5. Database Architecture</h2>

<h3>Table Organization</h3>
<p>The substrate uses ~40 tables organized by module:</p>
<table>
<tr><th>Prefix</th><th>Module</th><th>Key Tables</th></tr>
<tr><td><code>access_</code></td><td>ACCESS</td><td><code>api_keys</code>, <code>developers</code>, <code>subscriptions</code>, <code>usage</code>, <code>quotas</code></td></tr>
<tr><td><code>agency_</code></td><td>CORTEX</td><td><code>agencies</code>, <code>members</code>, <code>tasks</code>, <code>task_logs</code>, <code>dream_memory</code></td></tr>
<tr><td><code>ai_</code></td><td>NEXUS</td><td><code>usage_log</code>, <code>learning_data</code>, <code>daily_quota</code></td></tr>
<tr><td><code>audit_</code></td><td>AUDIT</td><td><code>audit_logs</code></td></tr>
<tr><td><code>atlas_</code></td><td>SYSTEM</td><td><code>atlas_capabilities</code></td></tr>
<tr><td><code>cognitive_</code></td><td>BRAIN</td><td><code>cognitive_registry</code></td></tr>
<tr><td><code>accessibility_</code></td><td>INCLUSIVE</td><td><code>accessibility_scans</code></td></tr>
<tr><td><code>autoblog_</code></td><td>DREAM</td><td><code>queue</code>, <code>drafts</code>, <code>runs</code>, <code>settings</code></td></tr>
<tr><td><code>auto_blog_</code></td><td>DREAM</td><td><code>posts</code>, <code>schedule</code></td></tr>
</table>

<h3>RLS Policy Pattern</h3>
<div class="card">
<pre>-- Users can only read their own data
CREATE POLICY "select_own" ON table
  FOR SELECT USING (auth.uid() = user_id);

-- Users can only insert their own data
CREATE POLICY "insert_own" ON table
  FOR INSERT WITH CHECK (auth.uid() = user_id);</pre>
</div>
<p><strong>Exception:</strong> Agency tables use <code>agency_id</code> scoping via membership lookups, not direct <code>user_id</code> matching.</p>

<h2>6. Performance Secrets</h2>

<h3>Response Time Budget</h3>
<table>
<tr><th>Phase</th><th>Budget</th><th>Notes</th></tr>
<tr><td>AUTH + DEFENSE</td><td>50ms</td><td>Cached — rarely hits DB</td></tr>
<tr><td>DECODE (intent)</td><td>100ms</td><td>Local classification, no AI call</td></tr>
<tr><td>CORTEX (routing)</td><td>10ms</td><td>Lookup only</td></tr>
<tr><td>TARGET MODULE</td><td>5000ms max</td><td>AI calls dominate this</td></tr>
<tr><td>RIPPLE (events)</td><td>Async</td><td>Does not block response</td></tr>
<tr><td>AUDIT</td><td>Async</td><td>Does not block response</td></tr>
</table>
<p><strong>Total p95 target:</strong> &lt; 5200ms for AI-involved operations, &lt; 200ms for non-AI operations.</p>

<h3>Caching Strategy</h3>
<table>
<tr><th>Layer</th><th>Cache</th><th>TTL</th><th>Hit Rate</th></tr>
<tr><td>API Key validation</td><td>In-memory</td><td>5 min</td><td>~95%</td></tr>
<tr><td>Rate limit counters</td><td>localStorage + BroadcastChannel</td><td>Real-time</td><td>N/A</td></tr>
<tr><td>Module health scores</td><td>In-memory</td><td>10 sec</td><td>~99%</td></tr>
<tr><td>BRAIN memory queries</td><td>Supabase Edge Cache</td><td>1 min</td><td>~60%</td></tr>
</table>

<hr />
<p><em>CMPSBL OS Substrate v9.1.0 — ARCHITECT Epoch — INTERNAL USE ONLY</em><br />
<em>Kenneth E Sweet Jr · PromptFluid®</em><br />
<em>ORCID: XXXX-XXXX-XXXX-XXXX · DOI: 10.5281/zenodo.XXXXXXX</em><br />
<em>© 2025–2026 PromptFluid®. All rights reserved.</em></p>

</div>
</body>
</html>
