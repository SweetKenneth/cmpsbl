<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<title>SANDBOX Module — Deep Dive</title>
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

<h1>Module 20 — SANDBOX</h1>
<p><strong>Safe Code Execution, Isolation, and Snapshots</strong></p>
<p><strong>Layer 6 — Infrastructure</strong> · <strong>v10.5.1 ARCHITECT Epoch</strong></p>
<hr />

<h2>Purpose</h2>
<p>SANDBOX provides isolated execution environments for untrusted or dynamically generated code. When the substrate needs to run user-provided scripts, evaluate generated code, or test evolution proposals, SANDBOX ensures that execution cannot affect the rest of the system. Now with enforced resource limits and state snapshot/restore capabilities.</p>

<h2>Capabilities</h2>
<table>
<tr><th>Capability</th><th>Description</th><th>Tier</th></tr>
<tr><td>Isolated Execution</td><td>Run code in a sandboxed environment with no system access</td><td>Free</td></tr>
<tr><td>Timeout Enforcement</td><td>Kill executions that exceed configured time limits</td><td>Free</td></tr>
<tr><td>Memory Limits</td><td>Restrict memory consumption per execution</td><td>Free</td></tr>
<tr><td>Resource Limit Enforcement (v10.5.1)</td><td>CPU, memory, execution time, and concurrency caps with hard enforcement</td><td>Free</td></tr>
<tr><td>Output Capture</td><td>Capture stdout, stderr, and return values</td><td>Pro</td></tr>
<tr><td>Resource Metering</td><td>Track CPU, memory, and I/O consumption per execution</td><td>Pro</td></tr>
<tr><td>Snapshot/Restore (v10.5.1)</td><td>Save and restore sandbox state (max 5 snapshots per sandbox)</td><td>Pro</td></tr>
<tr><td>Multi-Language Support</td><td>Execute JavaScript, TypeScript, and Python</td><td>Enterprise</td></tr>
<tr><td>Persistent Sandboxes</td><td>Sandboxes that maintain state across multiple executions</td><td>Enterprise</td></tr>
<tr><td>Network Isolation</td><td>Allow or deny network access per sandbox</td><td>CMPSBL</td></tr>
</table>

<h2>Resource Limit Enforcement (v10.5.1)</h2>
<table>
<tr><th>Resource</th><th>Default</th><th>Maximum</th><th>Enforcement</th></tr>
<tr><td>CPU time</td><td>5s</td><td>30s</td><td>Kill on exceed</td></tr>
<tr><td>Memory</td><td>128 MB</td><td>512 MB</td><td>OOM kill</td></tr>
<tr><td>Execution time</td><td>30s</td><td>5 min</td><td>Timeout kill</td></tr>
<tr><td>Concurrency</td><td>5</td><td>10</td><td>Queue overflow rejection</td></tr>
<tr><td>Output size</td><td>1 MB</td><td>10 MB</td><td>Truncation</td></tr>
</table>
<p>When a resource limit is hit, the execution is terminated immediately and the event is logged to AUDIT with the specific limit that was exceeded.</p>

<h2>Snapshot/Restore System (v10.5.1)</h2>
<div class="card">
<pre>Execute → Snapshot → Modify → Execute → Fail → Restore → Retry</pre>
<table>
<tr><th>Feature</th><th>Detail</th></tr>
<tr><td>Max snapshots per sandbox</td><td>5</td></tr>
<tr><td>Snapshot includes</td><td>Variables, function definitions, execution context</td></tr>
<tr><td>Snapshot size limit</td><td>10 MB</td></tr>
<tr><td>Auto-cleanup</td><td>Oldest snapshot removed when limit reached</td></tr>
</table>
</div>

<h2>Execution Model</h2>
<div class="card">
<pre>Code Submission
       │
       ▼
┌────────────────┐
│  Validation     │  Syntax check, size limits, banned patterns
└───────┬────────┘
        │
        ▼
┌────────────────┐
│  Resource       │  Apply CPU, memory, time, concurrency limits (v10.5.1)
│  Allocation     │
└───────┬────────┘
        │
        ▼
┌────────────────┐
│  Sandbox        │  Create isolated environment
│  Provisioning   │
└───────┬────────┘
        │
        ▼
┌────────────────┐
│  Execution      │  Run code with no access to host system
│                 │  Capture output and errors
└───────┬────────┘
        │
        ├─ Completed → Return results, optionally snapshot state
        │
        ├─ Timeout → Kill process, return timeout error
        │
        └─ Resource limit → Kill process, log to AUDIT, return limit error</pre>
</div>

<h2>Use Cases Within the Substrate</h2>
<table>
<tr><th>Use Case</th><th>Description</th></tr>
<tr><td>Evolution Testing</td><td>MODERNIZER tests proposed code changes before applying</td></tr>
<tr><td>Data Transformation</td><td>INTEGRATION runs user-defined data mapping scripts</td></tr>
<tr><td>Agency Task Execution</td><td>Agency agents execute generated code for research tasks</td></tr>
<tr><td>Dream Experiments</td><td>DREAM tests hypotheses generated during creative synthesis</td></tr>
<tr><td>Custom Logic</td><td>Users provide custom processing logic via the API</td></tr>
<tr><td>CLM Topic Study</td><td>CLM Engine runs sandboxed analysis during learning cycles</td></tr>
</table>

<h2>Integration with Other Modules</h2>
<table>
<tr><th>Module</th><th>Integration</th></tr>
<tr><td>MODERNIZER</td><td>Tests evolution proposals in sandbox before applying</td></tr>
<tr><td>INTEGRATION</td><td>Runs data transformation scripts</td></tr>
<tr><td>DREAM</td><td>Executes experimental code from dream cycles</td></tr>
<tr><td>ECONOMY</td><td>Tracks compute costs for sandbox executions</td></tr>
<tr><td>AUDIT</td><td>Logs all sandbox executions with input, output, resource usage, and limit violations</td></tr>
<tr><td>DEFENSE</td><td>Scans submitted code for malicious patterns</td></tr>
<tr><td>BRAIN</td><td>Receives execution safety heuristics via Brain Transfer</td></tr>
<tr><td>RIPPLE</td><td>Emits sandbox.execution_started, sandbox.execution_complete, sandbox.resource_limit_hit</td></tr>
</table>

<h2>Database Tables</h2>
<table>
<tr><th>Table</th><th>Purpose</th></tr>
<tr><td>sandbox_executions</td><td>Execution history with input, output, and resource metrics</td></tr>
<tr><td>sandbox_configs</td><td>Per-use-case sandbox configuration profiles</td></tr>
<tr><td>sandbox_snapshots</td><td>Saved sandbox state snapshots (v10.5.1)</td></tr>
</table>

<hr />
<p><em>CMPSBL OS Substrate v10.5.1 — ARCHITECT Epoch</em><br />
<em>Kenneth E Sweet Jr · PromptFluid®</em><br />
<em>ORCID: XXXX-XXXX-XXXX-XXXX · DOI: 10.5281/zenodo.XXXXXXX</em><br />
<em>© 2025–2026 PromptFluid®. All rights reserved.</em></p>

</div>
</body>
</html>