<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<title>Confidence Gating — CRITICAL</title>
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

<h1>🔒 Confidence Gating</h1>
<p><strong>Memory Confidence Thresholds and Decay Curves — CRITICAL</strong></p>
<p><strong>Document 04</strong> · <strong>Classification: 🔴 CRITICAL — Core IP</strong></p>
<hr />

<p>⚠️ <strong>CRITICAL IP</strong> — Proprietary memory confidence system. Do not distribute.</p>

<h2>How Confidence Works</h2>
<p>Every memory in BRAIN has a confidence score (0.0–1.0). This score is not static — it changes over time based on reinforcement, decay, and contradiction.</p>

<h3>Initial Confidence</h3>
<table>
<tr><th>Source</th><th>Initial Confidence</th></tr>
<tr><td>User-provided fact</td><td>0.70</td></tr>
<tr><td>AI-generated insight</td><td>0.50</td></tr>
<tr><td>Dream-cycle hypothesis</td><td>0.30</td></tr>
<tr><td>Cross-validated knowledge</td><td>0.85</td></tr>
<tr><td>System observation</td><td>0.60</td></tr>
</table>

<h3>Reinforcement</h3>
<p>When a memory is validated by new evidence:</p>
<div class="card">
<pre>new_confidence = min(1.0, current_confidence + boost × (1 - current_confidence))

Default boost: 0.15</pre>
</div>
<p>The <code>(1 - current_confidence)</code> factor ensures diminishing returns — boosting a 0.5 confidence memory is more impactful than boosting a 0.95 confidence memory.</p>

<h3>Decay</h3>
<p>Memories decay over time if not accessed or reinforced:</p>
<div class="card">
<pre>decayed_confidence = confidence × e^(-λ × days_since_last_access)

Where:
  λ (lambda) = decay rate</pre>
</div>

<p><strong>Decay rates by memory type:</strong></p>
<table>
<tr><th>Memory Type</th><th>λ (decay rate)</th><th>Half-life</th></tr>
<tr><td>Episodic</td><td>0.023</td><td>~30 days</td></tr>
<tr><td>Semantic</td><td>0.0046</td><td>~150 days</td></tr>
<tr><td>Procedural</td><td>0.0023</td><td>~300 days</td></tr>
<tr><td>Meta-cognitive</td><td>0.0116</td><td>~60 days</td></tr>
</table>

<h3>Contradiction</h3>
<p>When conflicting information is encountered:</p>
<div class="card">
<pre>reduced_confidence = confidence × (1 - contradiction_strength)

Where:
  contradiction_strength = 0.0–1.0 (how directly it contradicts)</pre>
</div>

<h3>Gating Thresholds</h3>
<p>Confidence gates determine when memories are used:</p>
<table>
<tr><th>Threshold</th><th>Value</th><th>Behavior</th></tr>
<tr><td><strong>Recall gate</strong></td><td>≥ 0.30</td><td>Memory appears in query results</td></tr>
<tr><td><strong>Response gate</strong></td><td>≥ 0.50</td><td>Memory is included in AI context</td></tr>
<tr><td><strong>Assert gate</strong></td><td>≥ 0.70</td><td>Memory is stated as fact to users</td></tr>
<tr><td><strong>Teach gate</strong></td><td>≥ 0.85</td><td>Memory is used to train other systems</td></tr>
<tr><td><strong>Archive gate</strong></td><td>&lt; 0.10</td><td>Memory is moved to cold storage</td></tr>
</table>

<h3>Why This Is Critical IP</h3>
<p>The specific decay rates, boost values, and gating thresholds are the result of extensive tuning. They determine how the system balances recall (using everything it knows) vs. precision (only using what it's confident about). Getting this wrong produces either:</p>
<ul>
<li><strong>Too aggressive recall</strong> (low gates) → system confidently states unreliable information</li>
<li><strong>Too conservative recall</strong> (high gates) → system "forgets" useful information</li>
</ul>
<p>The current values represent the optimal balance discovered through production operation.</p>

<hr />
<p><em>INTERNAL USE ONLY</em><br />
<em>Kenneth E Sweet Jr · PromptFluid®</em><br />
<em>ORCID: XXXX-XXXX-XXXX-XXXX · DOI: 10.5281/zenodo.XXXXXXX</em></p>

</div>
</body>
</html>
