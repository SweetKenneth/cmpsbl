<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<title>Key Capabilities — CMPSBL® v10.5.4</title>
<style>
@page { size: letter; margin: 0.8in; }
body { font-family: Georgia, 'Times New Roman', serif; font-size: 11pt; line-height: 1.5; color: #1a1a1a; max-width: 7in; margin: auto; }
h1 { font-size: 20pt; border-bottom: 2px solid #1a1a1a; padding-bottom: 4pt; }
h2 { font-size: 14pt; margin-top: 18pt; }
h3 { font-size: 12pt; }
table { width: 100%; border-collapse: collapse; margin: 10pt 0; font-size: 10pt; }
th, td { border: 1px solid #ccc; padding: 5pt 8pt; text-align: left; }
th { background: #f5f5f5; font-weight: bold; }
.card { border: 1px solid #e0e0e0; border-radius: 4pt; padding: 10pt 14pt; margin: 10pt 0; break-inside: avoid; }
pre { background: #f8f8f8; padding: 8pt; font-size: 9pt; border-radius: 3pt; overflow-x: auto; }
code { font-family: 'Courier New', monospace; font-size: 9pt; }
blockquote { border-left: 3pt solid #ccc; margin-left: 0; padding-left: 12pt; color: #555; }
</style>
</head>
<body>

<h1>Key Capabilities</h1>
<p><strong>What CMPSBL® Does — Technical Overview v10.5.4</strong></p>

<h2>Quick Start: Persistent Memory</h2>
<pre><code>import { withPersistentMemory } from '@cmpsbl/memory';

const agent = withPersistentMemory({
  agentId: 'my-agent',
  scope: 'project'
});

const context = await agent.getContext(userMessage);</code></pre>
<p><a href="/docs/persistent-memory">Persistent Memory Quickstart →</a></p>

<h2>Capability Matrix</h2>
<table>
<tr><th>Capability</th><th>Module</th><th>Description</th></tr>
<tr><td>Persistent Memory</td><td>BRAIN</td><td>Multi-tier storage, semantic recall, automatic compression</td></tr>
<tr><td>Self-Learning</td><td>DREAM</td><td>Autonomous overnight learning, pattern synthesis</td></tr>
<tr><td>AI Routing</td><td>NEXUS</td><td>Multi-provider routing, fallback chains, cost optimization</td></tr>
<tr><td>Security</td><td>DEFENSE</td><td>Rate limiting, bot detection, threat intelligence</td></tr>
<tr><td>Observability</td><td>VISION</td><td>Real-time dashboards, health monitoring, telemetry</td></tr>
<tr><td>Self-Evolution</td><td>MODERNIZER</td><td>Code proposals, confidence gating, auto-upgrades</td></tr>
<tr><td>Intent Parsing</td><td>DECODE</td><td>Natural language interpretation, command routing</td></tr>
<tr><td>Orchestration</td><td>CORTEX</td><td>Policy intent, autonomous decision-making</td></tr>
<tr><td>Accessibility</td><td>INCLUSIVE</td><td>WCAG scanning, auto-repair, compliance reporting</td></tr>
<tr><td>Identity</td><td>IDENTITY</td><td>Passwordless WebAuthn, actor attribution, sessions</td></tr>
<tr><td>Cross-Module Synergies</td><td>CORTEX</td><td>200 pipelines, 125 executors, 171+ deployed actions</td></tr>
</table>

<div class="card">
<h2>1. Persistent Memory (BRAIN)</h2>
<table>
<tr><th>Tier</th><th>Capacity</th><th>Retention</th><th>Use Case</th></tr>
<tr><td><strong>Hot</strong></td><td>127 records</td><td>7 days</td><td>Recent context, active sessions</td></tr>
<tr><td><strong>Warm</strong></td><td>2,000 records</td><td>30 days</td><td>Frequently accessed, intermediate recall</td></tr>
<tr><td><strong>Cold</strong></td><td>200 records</td><td>Forever</td><td>Compressed patterns, long-term knowledge</td></tr>
<tr><td><strong>Legacy</strong></td><td>Unlimited</td><td>Forever</td><td>Archived, rarely accessed</td></tr>
</table>
<ul>
<li><strong>Semantic Search</strong> — Find memories by meaning, not keywords</li>
<li><strong>Automatic Compression</strong> — Old memories compressed, not lost</li>
<li><strong>Value Scoring</strong> — Frequently accessed memories score higher</li>
<li><strong>Protected Memory</strong> — Core identity and principles locked with 1.0 value, zero decay</li>
</ul>
</div>

<div class="card">
<h2>2. Self-Learning (DREAM)</h2>
<table>
<tr><th>Phase</th><th>What Happens</th></tr>
<tr><td><strong>Collect</strong></td><td>Gather interactions from the day</td></tr>
<tr><td><strong>Analyze</strong></td><td>Find patterns, successes, failures</td></tr>
<tr><td><strong>Synthesize</strong></td><td>Generate improved heuristics</td></tr>
<tr><td><strong>Apply</strong></td><td>Update system with new learnings</td></tr>
</table>
</div>

<div class="card">
<h2>3. Multi-Provider AI Routing (NEXUS)</h2>
<table>
<tr><th>Provider</th><th>Status</th></tr>
<tr><td>OpenAI</td><td>✓ Supported</td></tr>
<tr><td>Anthropic</td><td>✓ Supported</td></tr>
<tr><td>Google AI</td><td>✓ Supported</td></tr>
<tr><td>Mistral</td><td>✓ Supported</td></tr>
<tr><td>Open Source</td><td>✓ Supported</td></tr>
</table>
<ul>
<li><strong>Automatic Fallback</strong> — If one fails, route to another</li>
<li><strong>Cost Optimization</strong> — Route to cheapest provider for the task</li>
<li><strong>Quality Routing</strong> — Route complex tasks to best models</li>
</ul>
</div>

<div class="card">
<h2>4. Security (DEFENSE)</h2>
<table>
<tr><th>Layer</th><th>Protection</th></tr>
<tr><td><strong>Rate Limiting</strong></td><td>Prevent abuse and DoS</td></tr>
<tr><td><strong>Bot Detection</strong></td><td>Behavioral fingerprinting</td></tr>
<tr><td><strong>Input Sanitization</strong></td><td>Block injection attacks</td></tr>
<tr><td><strong>Audit Logging</strong></td><td>Complete trail of all actions</td></tr>
</table>
</div>

<div class="card">
<h2>5. Observability (VISION)</h2>
<table>
<tr><th>Dashboard</th><th>Shows</th></tr>
<tr><td><strong>Health</strong></td><td>System status, uptime, errors</td></tr>
<tr><td><strong>Performance</strong></td><td>Latency, throughput, costs</td></tr>
<tr><td><strong>Learning</strong></td><td>Memory growth, pattern adoption</td></tr>
<tr><td><strong>Security</strong></td><td>Threats blocked, anomalies</td></tr>
</table>
</div>

<div class="card">
<h2>6. Self-Evolution (MODERNIZER)</h2>
<table>
<tr><th>Phase</th><th>Description</th></tr>
<tr><td><strong>Scan</strong></td><td>Identify improvement opportunities</td></tr>
<tr><td><strong>Propose</strong></td><td>Generate code change proposals</td></tr>
<tr><td><strong>Gate</strong></td><td>Human review for high-impact changes</td></tr>
<tr><td><strong>Apply</strong></td><td>Automatic deployment of approved changes</td></tr>
</table>
</div>

<div class="card">
<h2>7. Accessibility (INCLUSIVE)</h2>
<table>
<tr><th>Feature</th><th>Description</th></tr>
<tr><td><strong>WCAG Scanning</strong></td><td>Automated A, AA, AAA compliance checks</td></tr>
<tr><td><strong>Auto-Repair</strong></td><td>Intelligent fix generation for common issues</td></tr>
<tr><td><strong>Validation</strong></td><td>Regression detection on repairs</td></tr>
<tr><td><strong>Reporting</strong></td><td>Compliance reports in JSON or Markdown</td></tr>
</table>
</div>

<h2>Integration Patterns</h2>
<h3>REST API</h3>
<pre><code>POST /api/substrate
{
  "module": "brain",
  "action": "remember",
  "payload": { "content": "User prefers dark mode" }
}</code></pre>

<h3>SDK (TypeScript)</h3>
<pre><code>import { substrate } from '@cmpsbl/sdk';

await substrate.brain.remember('User prefers dark mode');
const response = await substrate.nexus.route('Hello');

// Execute synergy pipeline
const result = await substrate.cortex.synergy.execute('smart-recall', {
  query: 'user preferences'
});</code></pre>

<h2>Next Steps</h2>
<ul>
<li><a href="./04-USE-CASES.md">Use Cases</a> — See it in action</li>
<li><a href="./05-ARCHITECTURE.md">Architecture</a> — Deep technical dive</li>
<li><a href="./06-GETTING-STARTED.md">Getting Started</a> — Start building</li>
<li><a href="./09-SYNERGY-CAPABILITIES.md">Synergy Capabilities</a> — Full synergy reference</li>
</ul>

<p><em>CMPSBL® v10.5.4 — Cognitive Infrastructure for Production AI</em></p>

</body>
</html>
