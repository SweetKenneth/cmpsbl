<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<title>CEO Reconstruction — Memory System</title>
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

<h1>🔐 09 — Cognitive Memory System</h1>
<p><strong>Tiered Memory, SM-2, Salience, Contradiction Detection</strong></p>
<hr />

<h2>Memory Lifecycle (5 Stages)</h2>
<div class="card">
<pre>1. INGEST  — Capture raw input, dedup guard, capacity guard
2. STORE   — Persist to hot/warm/cold tier table
3. INDEX   — Build knowledge graph edges
4. REFLECT — Generate insights from accumulated memories
5. RETRIEVE — Multi-strategy recall (fulltext, pattern, semantic, hybrid)</pre>
</div>

<h2>Memory Types</h2>
<p><code>doctrine</code>, <code>doctrine_integrated</code>, <code>reflection</code>, <code>preference</code>, <code>conversation</code>, <code>dream</code>, <code>general</code>, <code>insight</code>, <code>template</code>, <code>heuristic</code>, <code>error_pattern</code></p>

<h2>Tier Architecture</h2>
<table>
<tr><th>Tier</th><th>Table</th><th>Capacity</th><th>State</th><th>Purpose</th></tr>
<tr><td>HOT</td><td>brain_memory_hot</td><td>500 (90% cap = 450)</td><td>short_term</td><td>Immediate recall, highest value</td></tr>
<tr><td>WARM</td><td>brain_memory_warm</td><td>2,000</td><td>long_term</td><td>Frequently accessed, compressed</td></tr>
<tr><td>COLD</td><td>brain_memory_cold</td><td>10,000</td><td>latent</td><td>Rarely accessed, full content</td></tr>
<tr><td>ARCHIVE</td><td>brain_memory_archive</td><td>Unlimited</td><td>archived</td><td>Never deleted, capacity overflow</td></tr>
</table>

<h2>Tiering Flow (Database Function)</h2>
<div class="card">
<pre>run_memory_tiering(user_id, agent_id):
  1. PROMOTE: Warm → Hot (if hot < 90% AND value_score > 0.8 AND access_count > 3)
  2. DEMOTE HOT → WARM: Lowest value hot memories when over capacity
  3. DEMOTE WARM → COLD: When warm exceeds limit
  4. ARCHIVE COLD: Never delete — move to archive when cold exceeds limit
  5. Update brain_memory_meta with counts, limits, demotion/promotion stats</pre>
</div>

<h2>Ingestion Guards</h2>
<ul>
<li><strong>Dedup Guard:</strong> Prefix match (first 120 chars) against hot tier. If duplicate found → boost existing access_count instead of inserting</li>
<li><strong>Capacity Guard:</strong> If hot tier ≥ 90% capacity (450/500), auto-downgrade to warm</li>
<li><strong>CLM Confidence Cap:</strong> High-volume CLM data gets confidence capped at 0.55 to bias toward warm tier</li>
<li><strong>Hot Threshold:</strong> importance > 0.72 for hot (tightened from 0.6)</li>
</ul>

<h2>Retrieval Strategy</h2>
<div class="card">
<pre>retrieve(query):
  1. Select tables (all tiers or specific)
  2. Strategy 1: Full-text search (PostgreSQL websearch)
  3. Strategy 2: Pattern matching (ILIKE)
  4. Deduplicate across strategies
  5. Filter by type and confidence threshold (default: 0.3)
  6. Score: importance × 0.6 + access_count × 0.1 + confidence × 0.3
  7. Track recall hit/miss via track_memory_recall()
  8. Bump access_count/last_used on retrieved memories</pre>
</div>

<h2>Attention Mechanism</h2>
<p><strong>File:</strong> <code>src/lib/brain/attentionMechanism.ts</code></p>
<ul>
<li>Delegates to unified <code>calculateSalience()</code> from memory-core</li>
<li>Maintains in-memory attention focus stack with decay</li>
<li>Focus weight decays: <code>decayedWeight = weight × exp(-decay_rate × ageMinutes)</code></li>
<li>Default focus TTL: 30 minutes</li>
<li>Attended recall combines query context + active attention focuses</li>
</ul>

<h2>Contradiction Detection</h2>
<p><strong>Database Function:</strong> <code>detect_memory_contradictions()</code></p>
<ul>
<li>Uses pg_trgm similarity against hot tier user_fact/preference/identity memories</li>
<li>Flags contradictions when similarity is 0.3–0.85 (similar but different)</li>
<li>Records to brain_memory_contradictions table</li>
<li>Updates brain_memory_meta contradiction_count</li>
</ul>

<h2>Confidence Decay</h2>
<p><strong>Database Function:</strong> <code>apply_confidence_decay()</code></p>
<table>
<tr><th>Type</th><th>Decay Rate</th><th>Floor</th></tr>
<tr><td>episodic, interaction</td><td>−0.05 × age_days</td><td>0.05</td></tr>
<tr><td>semantic, user_fact</td><td>−0.005 × age_days</td><td>0.10</td></tr>
<tr><td>procedural, preference</td><td>−0.002 × age_days</td><td>0.15</td></tr>
<tr><td>warm tier (all)</td><td>Multiplicative (0.95–0.998 per cycle)</td><td>0.02</td></tr>
</table>

<h2>Metacognitive Assessment</h2>
<p><strong>Database Function:</strong> <code>run_metacognitive_assessment()</code></p>
<div class="card">
<pre>if recall_hit_rate > 0.8 → strategy = 'precision'
if recall_hit_rate > 0.5 → strategy = 'balanced'
else → strategy = 'exploration'

Updates: retrieval_strategy, recall_accuracy, avg_salience, last_strategy_adjustment</pre>
</div>

<h2>Key Source Files</h2>
<ul>
<li><code>src/lib/substrate/memory-core.ts</code> — Unified MemoryCore (882 lines)</li>
<li><code>src/lib/brain/attentionMechanism.ts</code> — Attention-weighted retrieval</li>
<li><code>src/lib/substrate/world-first/brain-enhancements.ts</code> — Enhanced memory ops</li>
</ul>

<hr />
<p><em>CMPSBL OS Substrate v10.9.7 — CEO RECONSTRUCTION GUIDE</em><br />
<em>Kenneth E Sweet Jr · PromptFluid®</em><br />
<em>© 2025–2026 PromptFluid®. All rights reserved.</em></p>

</div>
</body>
</html>
