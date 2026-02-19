<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<title>Value Score Formula — CRITICAL</title>
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

<h1>🔒 Value Score Formula</h1>
<p><strong>Proprietary Scoring Algorithm — CRITICAL</strong></p>
<p><strong>Document 03</strong> · <strong>Classification: 🔴 CRITICAL — Core IP</strong></p>
<hr />

<p>⚠️ <strong>CRITICAL IP</strong> — This is the proprietary scoring algorithm. Do not distribute.</p>

<h2>The Value Score Formula</h2>
<p>The Value Score determines how the substrate prioritizes memories, capabilities, and evolution proposals. It is the single most important proprietary algorithm in the system.</p>

<h3>Formula</h3>
<div class="card">
<pre>value_score = (
  confidence × confidence_weight +
  recency × recency_weight +
  frequency × frequency_weight +
  impact × impact_weight
) × normalization_factor</pre>
</div>

<h3>Parameters</h3>
<table>
<tr><th>Parameter</th><th>Range</th><th>Description</th><th>Default Weight</th></tr>
<tr><td><code>confidence</code></td><td>0.0–1.0</td><td>How reliable the item is</td><td>0.35</td></tr>
<tr><td><code>recency</code></td><td>0.0–1.0</td><td>How recently it was used/validated</td><td>0.25</td></tr>
<tr><td><code>frequency</code></td><td>0.0–1.0</td><td>How often it's accessed</td><td>0.20</td></tr>
<tr><td><code>impact</code></td><td>0.0–1.0</td><td>How much it affects outcomes</td><td>0.20</td></tr>
</table>

<h3>Normalization</h3>
<p>The normalization factor ensures scores remain in the 0.0–1.0 range regardless of input distribution. The specific normalization algorithm uses a sigmoid-based curve that prevents extreme values from dominating.</p>
<div class="card">
<pre>normalization_factor = 1 / (1 + e^(-k * (raw_score - midpoint)))

Where:
  k = steepness parameter (default: 6.0)
  midpoint = 0.5</pre>
</div>

<h3>Where It's Used</h3>
<table>
<tr><th>System</th><th>Application</th></tr>
<tr><td>BRAIN</td><td>Memory prioritization for recall</td></tr>
<tr><td>DREAM</td><td>Insight ranking during dream cycles</td></tr>
<tr><td>MODERNIZER</td><td>Evolution proposal priority</td></tr>
<tr><td>CORTEX</td><td>Task assignment scoring</td></tr>
<tr><td>NEXUS</td><td>Provider selection weighting</td></tr>
</table>

<h3>Why This Matters</h3>
<p>This formula is the "secret sauce" that makes the substrate's decisions feel intelligent. Without it, the system would have no way to distinguish important information from noise, or high-value improvements from low-value ones.</p>
<p><strong>If a competitor obtained this formula AND the weight values AND the normalization algorithm</strong>, they could replicate the substrate's decision-making quality. This is why it is classified as Crown Jewel IP.</p>

<hr />
<p><em>INTERNAL USE ONLY</em><br />
<em>Kenneth E Sweet Jr · PromptFluid®</em><br />
<em>ORCID: XXXX-XXXX-XXXX-XXXX · DOI: 10.5281/zenodo.XXXXXXX</em></p>

</div>
</body>
</html>
