<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<title>DREAM Module — Internals</title>
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

<h1>💤 DREAM Module — Autonomous Learning Internals</h1>
<p><strong>CONFIDENTIAL — Trade Secret</strong></p>
<p><strong>v9.3.0 ARCHITECT Epoch</strong></p>
<hr />

<h2>Overview</h2>
<p>DREAM operates during idle cycles to synthesize new knowledge from existing memories, identify patterns, and generate improvement proposals. It is the substrate's <strong>autonomous learning engine</strong>.</p>

<h2>Dream Cycle Architecture</h2>
<p>A complete dream cycle consists of 4 phases:</p>
<div class="card">
<pre>┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│  GATHER  │───►│ SYNTHESIZE│───►│ EVALUATE │───►│  COMMIT  │
│          │    │          │    │          │    │          │
│ Pull     │    │ Cross-   │    │ Score &  │    │ Store or │
│ memories │    │ reference│    │ gate     │    │ discard  │
└──────────┘    └──────────┘    └──────────┘    └──────────┘</pre>
</div>

<h3>Phase 1: GATHER</h3>
<ul>
<li>Pull top 25 memories by importance × recency</li>
<li>Pull 10 random memories for serendipity (controlled randomness)</li>
<li>Pull all memories tagged with unresolved contradictions</li>
<li><strong>Total working set</strong>: 35–50 memories per cycle</li>
</ul>

<h3>Phase 2: SYNTHESIZE</h3>
<p>The synthesis engine applies three strategies:</p>
<table>
<tr><th>Strategy</th><th>Description</th><th>Weight</th></tr>
<tr><td><strong>Pattern Detection</strong></td><td>Identify recurring themes across unrelated memories</td><td>0.40</td></tr>
<tr><td><strong>Contradiction Resolution</strong></td><td>Attempt to reconcile conflicting memories</td><td>0.35</td></tr>
<tr><td><strong>Gap Analysis</strong></td><td>Identify knowledge gaps from partial patterns</td><td>0.25</td></tr>
</table>

<h3>Phase 3: EVALUATE</h3>
<p>Each synthesis output is scored:</p>
<div class="card">
<pre>dream_score = (
    novelty        × 0.30
  + confidence     × 0.25
  + utility        × 0.25
  + coherence      × 0.20
)</pre>
</div>
<ul>
<li><strong>Gate threshold</strong>: dream_score ≥ 0.35 → proceed to COMMIT</li>
<li><strong>Auto-reject</strong>: dream_score &lt; 0.15 → discard immediately</li>
<li><strong>Review zone</strong>: 0.15–0.35 → queue for next cycle re-evaluation</li>
</ul>

<h3>Phase 4: COMMIT</h3>
<ul>
<li>Approved syntheses become new semantic memories in BRAIN</li>
<li>Initial confidence = dream_score × 0.8 (discounted)</li>
<li>Source tagged as <code>dream_synthesis</code></li>
<li>Emit <code>dream.committed</code> to RIPPLE</li>
</ul>

<h2>Dream Pool (Agency Mode)</h2>
<p>When operating in agency context, DREAM supports <strong>pooled dreaming</strong>:</p>
<table>
<tr><th>Pool Mode</th><th>Behavior</th></tr>
<tr><td><code>isolated</code></td><td>Each agent dreams independently</td></tr>
<tr><td><code>shared</code></td><td>Synthesis outputs shared across agency</td></tr>
<tr><td><code>collective</code></td><td>Joint working set from all agents</td></tr>
</table>

<h3>Consent Gating</h3>
<p>Dream pool sharing requires explicit consent via <code>agency_dream_consent</code>:</p>
<ul>
<li><code>allow_global_pooling</code> — share with other agencies</li>
<li><code>allow_heuristic_sharing</code> — share learned heuristics</li>
<li><code>allow_template_sharing</code> — share operational templates</li>
<li><code>exclude_domains</code> — domain-level exclusion list</li>
</ul>

<h2>Scheduling</h2>
<table>
<tr><th>Parameter</th><th>Value</th></tr>
<tr><td>Minimum idle time before trigger</td><td>30 seconds</td></tr>
<tr><td>Maximum cycle duration</td><td>5 seconds</td></tr>
<tr><td>Cycles per hour (max)</td><td>12</td></tr>
<tr><td>Cool-down between cycles</td><td>5 minutes</td></tr>
<tr><td>Emergency interrupt</td><td>Any user input</td></tr>
</table>

<h2>Creative Synthesis Engine</h2>
<p>The creative synthesis engine is DREAM's most proprietary component:</p>

<h3>Cross-Domain Bridging</h3>
<ol>
<li>Select two memories from different domains</li>
<li>Extract abstract structure from each</li>
<li>Attempt structural mapping (analogy detection)</li>
<li>If mapping confidence > 0.4, generate bridge hypothesis</li>
<li>Test bridge against existing knowledge base</li>
<li>If no contradictions, score and gate</li>
</ol>

<h3>Heuristic Generation</h3>
<p>DREAM can generate operational heuristics from patterns:</p>
<div class="card">
<pre>IF pattern occurs ≥ 3 times
  AND outcomes are consistent (variance < 0.2)
  AND no contradicting evidence exists
THEN generate heuristic with confidence = avg_outcome_score × 0.7</pre>
</div>
<p>Heuristics are stored as procedural memories in BRAIN T3.</p>

<h2>Metrics</h2>
<table>
<tr><th>Metric</th><th>Target</th><th>Alert</th></tr>
<tr><td>Synthesis rate</td><td>2–5 per cycle</td><td>&lt; 1</td></tr>
<tr><td>Commit rate</td><td>30–60% of syntheses</td><td>&lt; 10%</td></tr>
<tr><td>Novel pattern discovery</td><td>1+ per hour</td><td>0 for 6 hours</td></tr>
<tr><td>Contradiction resolution rate</td><td>&gt; 50%</td><td>&lt; 20%</td></tr>
</table>

<hr />
<p><em>CMPSBL OS Substrate v10.8.0 — ARCHITECT Epoch — INTERNAL USE ONLY</em><br />
<em>Kenneth E Sweet Jr · PromptFluid®</em><br />
<em>ORCID: <a href="https://orcid.org/0009-0001-4237-1243">0009-0001-4237-1243</a> · DOI: <a href="https://doi.org/10.5281/zenodo.18234909">10.5281/zenodo.18234909</a></em><br />
<em>© 2025–2026 PromptFluid®. All rights reserved.</em></p>

</div>
</body>
</html>
