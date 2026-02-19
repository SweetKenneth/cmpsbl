<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<title>CORE Module — Deep Dive</title>
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

<h1>⚡ CORE Module — Deep Dive</h1>
<p><strong>Layer:</strong> Kernel · <strong>Boot Order:</strong> 1 · <strong>Dependencies:</strong> None</p>
<p><strong>v9.3.0 ARCHITECT Epoch</strong></p>
<hr />

<h2>Purpose</h2>
<p>CORE is the <strong>foundation primitive</strong> of the substrate. It boots first, provides the module registry, health infrastructure, circuit breaker framework, and the shared runtime that every other module depends on.</p>
<p>Nothing in the substrate runs without CORE.</p>

<h2>Capabilities</h2>
<table>
<tr><th>Capability</th><th>Description</th></tr>
<tr><td>Module Registry</td><td>Central catalog of all 21 modules — metadata, dependencies, health</td></tr>
<tr><td>Health Framework</td><td>Standardized health scoring across all modules</td></tr>
<tr><td>Circuit Breakers</td><td>Failure isolation with automatic recovery</td></tr>
<tr><td>Boot Graph</td><td>Dependency-ordered startup sequencing</td></tr>
<tr><td>Event Foundation</td><td>Base event types and RIPPLE integration hooks</td></tr>
<tr><td>Configuration</td><td>Substrate-wide settings and feature flags</td></tr>
</table>

<h2>Architecture</h2>

<div class="card">
<h3>Boot Sequence</h3>
<p>CORE initializes in this order:</p>
<pre>1. Load configuration
2. Initialize module registry (empty)
3. Start health monitoring
4. Initialize circuit breaker framework
5. Register CORE itself
6. Emit core.started event
7. Begin boot graph resolution for remaining modules</pre>
</div>

<div class="card">
<h3>Module Registry Schema</h3>
<p>Every module registers with CORE using this structure:</p>
<pre>interface ModuleRegistration {
  name: string;              // e.g., "CORE"
  layer: string;             // e.g., "kernel"
  version: string;           // SemVer
  bootOrder: number;         // 1–21
  dependencies: string[];    // Module names this depends on
  capabilities: string[];    // What this module provides
  status: 'booting' | 'healthy' | 'degraded' | 'failed';
  healthScore: number;       // 0–100
}</pre>
</div>

<h2>Health Scoring</h2>
<p>CORE computes health for every module using a standardized formula:</p>
<pre>module_health = 100 - (consecutive_failures × 20)</pre>

<table>
<tr><th>Health Score</th><th>Status</th><th>Behavior</th></tr>
<tr><td>80–100</td><td>healthy</td><td>Normal operations</td></tr>
<tr><td>40–79</td><td>degraded</td><td>Reduced functionality, alerts triggered</td></tr>
<tr><td>1–39</td><td>critical</td><td>Circuit breaker opens, heal attempted</td></tr>
<tr><td>0</td><td>failed</td><td>Module isolated, dependents notified</td></tr>
</table>

<div class="card">
<h3>Substrate-Wide Health</h3>
<pre>substrate_health = Σ(module_health × layer_weight) / Σ(layer_weight)</pre>
<p>Layer weights: Kernel 1.5×, Cognitive 1.3×, Operational 1.0×, Administrative 0.8×, Orchestrator 1.0×, Infrastructure 0.7×</p>
</div>

<h2>Circuit Breaker Framework</h2>
<p>CORE provides the circuit breaker primitive used by all modules:</p>

<div class="card">
<h3>States</h3>
<pre>┌────────┐   failure_threshold   ┌────────┐   recovery_timeout   ┌───────────┐
│ CLOSED │ ─────────────────────►│  OPEN  │ ──────────────────►│ HALF-OPEN │
│        │◄──────────────────────│        │◄──────────────────── │           │
└────────┘   success_threshold   └────────┘   failure in test    └───────────┘</pre>
</div>

<h3>Parameters</h3>
<table>
<tr><th>Parameter</th><th>Default</th><th>Configurable</th></tr>
<tr><td>failure_threshold</td><td>3 consecutive</td><td>Yes</td></tr>
<tr><td>recovery_timeout</td><td>30,000 ms</td><td>Yes</td></tr>
<tr><td>success_threshold</td><td>2 successes in half-open</td><td>Yes</td></tr>
<tr><td>monitoring_window</td><td>60,000 ms</td><td>Yes</td></tr>
</table>

<h2>Terminal Commands</h2>
<table>
<tr><th>Command</th><th>Description</th><th>Example Output</th></tr>
<tr><td>core.status</td><td>Module status summary</td><td>{ status: "healthy", uptime: "4h 23m" }</td></tr>
<tr><td>core.health</td><td>Health scores for all modules</td><td>Table of 21 modules with scores</td></tr>
<tr><td>core.modules</td><td>List registered modules</td><td>Module names, layers, boot order</td></tr>
<tr><td>core.modules --full</td><td>Full registry dump</td><td>Complete metadata for all modules</td></tr>
<tr><td>core.circuit</td><td>Circuit breaker states</td><td>Per-module circuit states</td></tr>
<tr><td>core.config</td><td>Current configuration</td><td>Active feature flags and settings</td></tr>
</table>

<h2>Events Emitted</h2>
<table>
<tr><th>Event</th><th>When</th><th>Payload</th></tr>
<tr><td>core.started</td><td>CORE finishes booting</td><td>{ version, timestamp }</td></tr>
<tr><td>core.module_registered</td><td>A module registers</td><td>{ module, layer, bootOrder }</td></tr>
<tr><td>core.health_changed</td><td>Any module health changes</td><td>{ module, oldScore, newScore }</td></tr>
<tr><td>core.circuit_opened</td><td>Circuit breaker opens</td><td>{ module, failures, reason }</td></tr>
<tr><td>core.circuit_closed</td><td>Circuit breaker recovers</td><td>{ module, recoveryTime }</td></tr>
</table>

<h2>Performance</h2>
<table>
<tr><th>Metric</th><th>Value</th></tr>
<tr><td>Boot time</td><td>&lt; 2ms</td></tr>
<tr><td>Health check (single module)</td><td>&lt; 1ms</td></tr>
<tr><td>Health check (all 21 modules)</td><td>&lt; 10ms</td></tr>
<tr><td>Circuit breaker state change</td><td>&lt; 1ms</td></tr>
<tr><td>Memory footprint</td><td>~2MB</td></tr>
</table>

<h2>Dependencies &amp; Dependents</h2>
<pre>CORE has no dependencies (it IS the foundation).

Every module depends on CORE:
  CORE ← RIPPLE ← ACCESS
  CORE ← BRAIN ← DECODE
  CORE ← BRAIN ← DREAM
  ... (all 20 other modules)</pre>

<hr />
<p><em>CMPSBL OS Substrate v9.3.0 — ARCHITECT Epoch</em><br />
<em>Kenneth E Sweet Jr · PromptFluid®</em><br />
<em>ORCID: <a href="https://orcid.org/XXXX-XXXX-XXXX-XXXX">XXXX-XXXX-XXXX-XXXX</a> · DOI: <a href="https://doi.org/10.5281/zenodo.XXXXXXX">10.5281/zenodo.XXXXXXX</a></em><br />
<em>© 2025–2026 PromptFluid®. All rights reserved.</em></p>

</div>
</body>
</html>