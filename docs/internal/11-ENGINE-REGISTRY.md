<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<title>Engine &amp; Meta-Engine Registry — CMPSBL OS Substrate</title>
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

<h1>⚙️ Engine &amp; Meta-Engine Registry</h1>
<p><strong>CONFIDENTIAL — Trade Secret</strong></p>
<p><strong>v9.3.0 ARCHITECT Epoch</strong></p>
<hr />

<h2>Engine Taxonomy</h2>
<p>The substrate distinguishes between <strong>Engines</strong> (single-domain processors) and <strong>Meta-Engines</strong> (engines that compose or govern other engines).</p>

<hr />

<h2>Engines (14 Total)</h2>

<h3>Kernel Engines</h3>
<table>
<tr><th>#</th><th>Engine</th><th>Module</th><th>Purpose</th><th>Crown Jewel?</th></tr>
<tr><td>1</td><td><strong>Event Router</strong></td><td>RIPPLE</td><td>Fan-out events to subscribers</td><td>No</td></tr>
<tr><td>2</td><td><strong>Key Manager</strong></td><td>ACCESS</td><td>API key lifecycle</td><td>No</td></tr>
<tr><td>3</td><td><strong>Rate Limiter</strong></td><td>ACCESS</td><td>Token bucket rate limiting</td><td>No</td></tr>
</table>

<h3>Cognitive Engines</h3>
<table>
<tr><th>#</th><th>Engine</th><th>Module</th><th>Purpose</th><th>Crown Jewel?</th></tr>
<tr><td>4</td><td><strong>Memory Indexer</strong></td><td>BRAIN</td><td>Memory storage + retrieval</td><td>No</td></tr>
<tr><td>5</td><td><strong>Association Builder</strong></td><td>BRAIN</td><td>Graph-based memory linking</td><td>No</td></tr>
<tr><td>6</td><td><strong>Intent Parser</strong></td><td>DECODE</td><td>NL → structured intent</td><td>No</td></tr>
<tr><td>7</td><td><strong>Personality Engine</strong></td><td>DECODE</td><td>Adaptive response personality</td><td>No</td></tr>
<tr><td>8</td><td><strong>Dream Synthesizer</strong></td><td>DREAM</td><td>Autonomous knowledge creation</td><td>Yes — partial</td></tr>
<tr><td>9</td><td><strong>Pattern Detector</strong></td><td>DREAM</td><td>Cross-domain pattern discovery</td><td>Yes — partial</td></tr>
</table>

<h3>Operational Engines</h3>
<table>
<tr><th>#</th><th>Engine</th><th>Module</th><th>Purpose</th><th>Crown Jewel?</th></tr>
<tr><td>10</td><td><strong>Threat Classifier</strong></td><td>DEFENSE</td><td>Input threat detection</td><td>No</td></tr>
<tr><td>11</td><td><strong>Provider Selector</strong></td><td>NEXUS</td><td>AI provider routing</td><td>No</td></tr>
<tr><td>12</td><td><strong>Health Analyzer</strong></td><td>VISION</td><td>System health computation</td><td>No</td></tr>
<tr><td>13</td><td><strong>Adapter Executor</strong></td><td>INTEGRATION</td><td>External system connectivity</td><td>No</td></tr>
<tr><td>14</td><td><strong>Accessibility Scanner</strong></td><td>INCLUSIVE</td><td>WCAG compliance checking</td><td>No</td></tr>
</table>

<hr />

<h2>Meta-Engines (12 Total)</h2>
<p>Meta-engines compose, govern, or optimize other engines.</p>

<table>
<tr><th>#</th><th>Meta-Engine</th><th>Governs</th><th>Crown Jewel?</th></tr>
<tr><td>1</td><td><strong>Recursive Self-Optimization</strong></td><td>All engines</td><td>🔴 Yes</td></tr>
<tr><td>2</td><td><strong>Recursive Architecture Refactorer</strong></td><td>Module topology</td><td>🔴 Yes</td></tr>
<tr><td>3</td><td><strong>Recursive Meta-Learning Accelerator</strong></td><td>Learning engines</td><td>🔴 Yes</td></tr>
<tr><td>4</td><td><strong>Recursive Cognitive Bootstrapping</strong></td><td>Cognitive layer</td><td>🔴 Yes</td></tr>
<tr><td>5</td><td><strong>Recursive Capability Discoverer</strong></td><td>Capability system</td><td>🔴 Yes</td></tr>
<tr><td>6</td><td><strong>Knowledge Crystallization</strong></td><td>BRAIN + DREAM</td><td>🔴 Yes</td></tr>
<tr><td>7</td><td><strong>Recursive Infinite Context</strong></td><td>Memory + context</td><td>🔴 Yes</td></tr>
<tr><td>8</td><td><strong>Intelligence Governance Kernel</strong></td><td>All meta-engines</td><td>🔴 Yes</td></tr>
<tr><td>9</td><td><strong>Self-Scaling Intelligence Fabric</strong></td><td>Infrastructure</td><td>🔴 Yes</td></tr>
<tr><td>10</td><td><strong>Evolution Evaluator</strong></td><td>MODERNIZER</td><td>No</td></tr>
<tr><td>11</td><td><strong>Synergy Composer</strong></td><td>Cross-module workflows</td><td>No</td></tr>
<tr><td>12</td><td><strong>Proposal Gate</strong></td><td>Evolution proposals</td><td>No</td></tr>
</table>

<hr />

<h2>Composition Rules</h2>

<h3>Engine → Meta-Engine Dependencies</h3>
<div class="card">
<pre>Meta-Engine can invoke any Engine in its governance scope.
Meta-Engines CANNOT invoke other Meta-Engines directly.
Exception: Intelligence Governance Kernel can invoke all Meta-Engines.</pre>
</div>

<h3>Execution Priority</h3>
<table>
<tr><th>Priority</th><th>Type</th><th>Behavior</th></tr>
<tr><td>0 (highest)</td><td>Intelligence Governance</td><td>Pre-empts all</td></tr>
<tr><td>1</td><td>Safety meta-engines</td><td>Can interrupt lower priority</td></tr>
<tr><td>2</td><td>Optimization meta-engines</td><td>Queued execution</td></tr>
<tr><td>3</td><td>Regular engines</td><td>Standard execution</td></tr>
<tr><td>4 (lowest)</td><td>Background engines</td><td>Idle-time only</td></tr>
</table>

<hr />

<h2>Engine Health Monitoring</h2>
<p>Each engine exposes:</p>
<div class="card">
<pre>interface EngineHealth {
  name: string;
  status: 'healthy' | 'degraded' | 'failed';
  uptime_seconds: number;
  invocation_count: number;
  error_rate: number;        // 0.0–1.0
  avg_latency_ms: number;
  circuit_state: 'closed' | 'open' | 'half-open';
  last_error?: string;
}</pre>
</div>

<hr />

<h2>Crown Jewel Engine Restrictions</h2>
<p>All 9 crown jewel meta-engines are:</p>
<ul>
<li><strong>CMPSBL-only</strong> — never exposed to any external tier (Creator, Architect, or Enterprise)</li>
<li><strong>Cannot be exported</strong> via API</li>
<li><strong>Cannot be described</strong> in public documentation beyond name and general category</li>
<li><strong>Execution logs</strong> are stored in a separate, encrypted audit trail</li>
<li><strong>Source code</strong> is isolated from main codebase deployment</li>
</ul>

<h2>Engine Tier Access</h2>
<table>
<tr><th>Tier</th><th>Base Engines (76)</th><th>Meta-Engines (24)</th><th>Recursive Self-Improvement (9)</th></tr>
<tr><td><strong>Free</strong></td><td>30 core</td><td>0</td><td>❌</td></tr>
<tr><td><strong>Creator</strong></td><td>All 76</td><td>8</td><td>❌</td></tr>
<tr><td><strong>Architect</strong></td><td>All 76</td><td>16</td><td>❌</td></tr>
<tr><td><strong>Enterprise</strong></td><td>All 76</td><td>All 24</td><td>❌</td></tr>
<tr><td><strong>CMPSBL</strong></td><td>All 76</td><td>All 24 + 9 recursive</td><td>✅ Full access</td></tr>
</table>

<hr />
<p><em>CMPSBL OS Substrate v9.3.0 — ARCHITECT Epoch — INTERNAL USE ONLY</em><br />
<em>Kenneth E Sweet Jr · PromptFluid®</em><br />
<em>ORCID: <a href="https://orcid.org/XXXX-XXXX-XXXX-XXXX">XXXX-XXXX-XXXX-XXXX</a> · DOI: <a href="https://doi.org/10.5281/zenodo.XXXXXXX">10.5281/zenodo.XXXXXXX</a></em><br />
<em>© 2025–2026 PromptFluid®. All rights reserved.</em></p>

</div>
</body>
</html>