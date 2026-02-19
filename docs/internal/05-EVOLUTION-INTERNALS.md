<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<title>Evolution Engine Internals — CRITICAL</title>
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

<h1>🔒 Evolution Engine Internals</h1>
<p><strong>How Self-Improvement Actually Works — CRITICAL</strong></p>
<p><strong>Document 05</strong> · <strong>Classification: 🔴 CRITICAL — Core IP</strong></p>
<hr />

<p>⚠️ <strong>CRITICAL IP</strong> — Full evolution engine implementation. Do not distribute.</p>

<h2>The Evolution Pipeline (Internal)</h2>
<p>Public docs describe a 7-step lifecycle. The actual pipeline has 12 steps:</p>
<div class="card">
<pre> 1. VISION detects opportunity (anomaly or trend)
 2. VISION scores opportunity (impact × confidence × feasibility)
 3. MODERNIZER generates proposal with diff
 4. CORTEX checks governance bounds
 5. SANDBOX creates isolated test environment
 6. SANDBOX applies proposal in isolation
 7. SANDBOX runs regression suite (>85% pass required)
 8. SANDBOX runs performance benchmark (no >10% degradation)
 9. CORTEX evaluates risk score
10. APPROVAL (per autonomy tier)
11. MODERNIZER applies to production
12. MODERNIZER generates evolution stamp</pre>
</div>

<h3>Internal Step Details</h3>

<p><strong>Step 2 — Opportunity Scoring:</strong></p>
<div class="card">
<pre>opportunity_score = impact × confidence × feasibility

Where:
  impact = estimated improvement (0.0–1.0)
  confidence = how certain the opportunity exists (0.0–1.0)
  feasibility = how likely the change will succeed (0.0–1.0)

Threshold: opportunity_score >= 0.25 to proceed</pre>
</div>

<p><strong>Step 7 — Regression Gate:</strong></p>
<ul>
<li>Minimum 85% of existing tests must pass</li>
<li>No previously-passing critical tests may fail</li>
<li>New capabilities must include at least one test</li>
</ul>

<p><strong>Step 8 — Performance Gate:</strong></p>
<ul>
<li>p95 latency may not increase by more than 10%</li>
<li>Memory usage may not increase by more than 5%</li>
<li>Error rate may not increase by more than 1%</li>
</ul>

<p><strong>Step 9 — Risk Score:</strong></p>
<div class="card">
<pre>risk_score = (1 - regression_pass_rate) × 0.4 +
             performance_degradation × 0.3 +
             scope_breadth × 0.2 +
             reversibility_cost × 0.1

Where:
  scope_breadth = number_of_modules_affected / 21
  reversibility_cost = 0.0 (fully reversible) to 1.0 (irreversible)</pre>
</div>
<p>Evolutions with <code>risk_score > 0.6</code> are automatically rejected.</p>

<h3>Evolution Types</h3>
<table>
<tr><th>Type</th><th>Frequency</th><th>Risk</th><th>Examples</th></tr>
<tr><td><strong>Prompt optimization</strong></td><td>Daily</td><td>Low</td><td>System prompt refinements</td></tr>
<tr><td><strong>Routing adjustment</strong></td><td>Weekly</td><td>Low</td><td>Provider weight changes</td></tr>
<tr><td><strong>Memory strategy</strong></td><td>Weekly</td><td>Medium</td><td>Decay rate tuning</td></tr>
<tr><td><strong>Defense rule</strong></td><td>As-needed</td><td>Medium</td><td>New threat signatures</td></tr>
<tr><td><strong>Pipeline restructure</strong></td><td>Monthly</td><td>High</td><td>Synergy pipeline changes</td></tr>
<tr><td><strong>Module configuration</strong></td><td>Monthly</td><td>High</td><td>Module behavior changes</td></tr>
</table>

<h3>Rollback Implementation</h3>
<p>Rollback captures full system state before application:</p>
<ol>
<li><strong>Config snapshot</strong> — all module configurations</li>
<li><strong>Prompt snapshot</strong> — all active system prompts</li>
<li><strong>Weight snapshot</strong> — all routing/scoring weights</li>
<li><strong>Rule snapshot</strong> — all defense and governance rules</li>
</ol>
<p>Rollback atomically restores ALL snapshots. Partial rollback is deliberately not supported to prevent inconsistent state.</p>

<h3>Evolution Budget</h3>
<table>
<tr><th>Constraint</th><th>Limit</th><th>Period</th></tr>
<tr><td>Max proposals</td><td>10</td><td>Per day</td></tr>
<tr><td>Max applications</td><td>3</td><td>Per day</td></tr>
<tr><td>Max rollbacks</td><td>2</td><td>Per day</td></tr>
<tr><td>Cooldown after rollback</td><td>6 hours</td><td>Per incident</td></tr>
<tr><td>Max cost per evolution</td><td>$0.50</td><td>Per evolution</td></tr>
</table>

<hr />
<p><em>INTERNAL USE ONLY</em><br />
<em>Kenneth E Sweet Jr · PromptFluid®</em><br />
<em>ORCID: XXXX-XXXX-XXXX-XXXX · DOI: 10.5281/zenodo.XXXXXXX</em></p>

</div>
</body>
</html>
