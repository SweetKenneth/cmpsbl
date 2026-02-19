<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<title>BRAIN Module — Internals</title>
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

<h1>🧠 BRAIN Module — Architecture Internals</h1>
<p><strong>CONFIDENTIAL — Trade Secret</strong></p>
<p><strong>v10.5.1 ARCHITECT Epoch</strong></p>
<hr />

<h2>Memory Architecture</h2>
<p>BRAIN implements a <strong>four-tier memory hierarchy</strong>, each tier with distinct persistence, retrieval, and decay characteristics.</p>

<h3>Tier Map</h3>
<table>
<tr><th>Tier</th><th>Type</th><th>Persistence</th><th>Max Entries</th><th>Retrieval</th><th>Decay Rate</th></tr>
<tr><td>T1</td><td><strong>Episodic</strong></td><td>Session-scoped</td><td>10,000</td><td>O(1) hash</td><td>λ = 0.023/day</td></tr>
<tr><td>T2</td><td><strong>Semantic</strong></td><td>Permanent</td><td>Unlimited</td><td>Vector similarity</td><td>λ = 0.0046/day</td></tr>
<tr><td>T3</td><td><strong>Procedural</strong></td><td>Permanent</td><td>5,000</td><td>Pattern match</td><td>None (reinforced)</td></tr>
<tr><td>T4</td><td><strong>Meta-cognitive</strong></td><td>Permanent</td><td>1,000</td><td>Graph traversal</td><td>λ = 0.001/day</td></tr>
</table>

<h3>Memory Record Schema (Internal)</h3>
<div class="card">
<pre>interface BrainRecord {
  id: string;                    // UUID v4
  content: string;               // Raw memory content
  memory_type: 'episodic' | 'semantic' | 'procedural' | 'meta';
  confidence: number;            // 0.0–1.0, see doc 04
  importance: number;            // 0.0–1.0, derived
  access_count: number;          // Retrieval counter
  last_accessed: string;         // ISO timestamp
  embedding_vector: number[];    // 1536-dim float32
  embeddingVersion: string;      // Model version tracker (v10.5.1)
  relevanceScore: number;        // EMA-adjusted relevance (v10.5.1)
  associations: string[];        // Related memory IDs
  source_module: string;         // Originating module
  tags: string[];                // Semantic tags
  decay_rate: number;            // Per-day decay constant
  created_at: string;
  updated_at: string;
}</pre>
</div>

<h2>Universal Brain Transfer Pipeline (v10.5.0+)</h2>
<p>BRAIN distributes knowledge to all 21 modules via relevance-based routing:</p>

<h3>Transfer Algorithm</h3>
<div class="card">
<pre>1. SELECT top 50 memories WHERE confidence > 0.3 AND last_accessed within 24h
2. FOR each memory:
   a. Score against each module's tag affinity map
   b. Route to modules with affinity score > 0.5
   c. Inject into brain_memory_hot with source attribution
3. UPDATE relevance scores via EMA feedback
4. LOG transfer receipt to AUDIT</pre>
</div>

<h3>Module Affinity Map</h3>
<table>
<tr><th>Module</th><th>Affinity Tags</th></tr>
<tr><td>DECODE</td><td><code>conversation</code>, <code>intent</code>, <code>epistemic</code>, <code>language</code></td></tr>
<tr><td>DEFENSE</td><td><code>threat</code>, <code>security</code>, <code>anomaly</code>, <code>behavioral</code></td></tr>
<tr><td>MEMORY</td><td><code>embedding</code>, <code>vector</code>, <code>staleness</code>, <code>retrieval</code></td></tr>
<tr><td>ECONOMY</td><td><code>cost</code>, <code>budget</code>, <code>pricing</code>, <code>usage</code></td></tr>
<tr><td>RELAY</td><td><code>delivery</code>, <code>webhook</code>, <code>notification</code>, <code>retry</code></td></tr>
<tr><td>AUDIT</td><td><code>compliance</code>, <code>logging</code>, <code>governance</code>, <code>chain</code></td></tr>
<tr><td>IDENTITY</td><td><code>actor</code>, <code>session</code>, <code>authentication</code>, <code>trust</code></td></tr>
<tr><td>SANDBOX</td><td><code>execution</code>, <code>isolation</code>, <code>resource</code>, <code>safety</code></td></tr>
</table>

<h2>Memory Consolidation Engine (v10.5.0+)</h2>
<p>Server-side consolidation runs every 5 minutes via CLM Engine:</p>

<h3>Promotion Logic (Warm → Hot)</h3>
<div class="card">
<pre>SELECT id FROM brain_memories
WHERE tier = 'warm'
  AND access_count > 10
  AND last_accessed > NOW() - INTERVAL '24 hours'
-- Move to brain_memory_hot</pre>
</div>

<h3>Demotion Logic (Hot → Warm)</h3>
<div class="card">
<pre>SELECT id FROM brain_memory_hot
WHERE last_accessed < NOW() - INTERVAL '48 hours'
  AND access_count < 3
-- Move to brain_memories (warm)</pre>
</div>

<h3>Pruning Logic (Cold Deletion)</h3>
<div class="card">
<pre>DELETE FROM brain_memories
WHERE tier = 'cold'
  AND confidence < 0.1
  AND created_at < NOW() - INTERVAL '30 days'</pre>
</div>

<h2>Normalization Pipeline</h2>
<p>Every memory passes through a 5-stage normalization pipeline before storage:</p>
<div class="card">
<pre>Raw Input → Deduplicate → Normalize → Embed → Score → Store</pre>
</div>

<h3>Stage Details</h3>
<table>
<tr><th>Stage</th><th>Operation</th><th>Secret Algorithm</th></tr>
<tr><td>1. <strong>Deduplicate</strong></td><td>Cosine similarity check</td><td>Threshold: <strong>0.92</strong> — above this, memories merge.</td></tr>
<tr><td>2. <strong>Normalize</strong></td><td>Content standardization</td><td>Lowercase, strip noise, resolve pronouns.</td></tr>
<tr><td>3. <strong>Embed</strong></td><td>Generate vector</td><td>1536-dimension embedding via NEXUS.</td></tr>
<tr><td>4. <strong>Score</strong></td><td>Initial confidence</td><td>Value Score Formula (see doc 03).</td></tr>
<tr><td>5. <strong>Store</strong></td><td>Write to DB</td><td>Emit <code>memory.stored</code> event to RIPPLE.</td></tr>
</table>

<h3>Deduplication Merge Logic</h3>
<div class="card">
<pre>When similarity ≥ 0.92:
merged_confidence = max(existing.confidence, new.confidence) + 0.05
merged_access_count = existing.access_count + 1
merged_content = new.content  // Newer content wins
merged_associations = union(existing.associations, new.associations)</pre>
</div>

<h2>Retrieval Algorithm</h2>
<p>BRAIN retrieval uses a <strong>weighted multi-signal ranking</strong>:</p>
<div class="card">
<pre>retrieval_score = (
    cosine_similarity × 0.40
  + recency_score    × 0.25
  + access_frequency × 0.15
  + importance       × 0.20
)</pre>
</div>
<p>Post-ranking, results are adjusted by <code>relevanceScore</code> (EMA feedback, v10.5.1).</p>

<h3>Retrieval Limits</h3>
<table>
<tr><th>Context</th><th>Max Results</th><th>Timeout</th></tr>
<tr><td>Direct query</td><td>10</td><td>50ms</td></tr>
<tr><td>Context enrichment</td><td>5</td><td>30ms</td></tr>
<tr><td>Dream synthesis</td><td>25</td><td>200ms</td></tr>
<tr><td>Cross-module</td><td>3</td><td>20ms</td></tr>
<tr><td>Brain Transfer</td><td>50</td><td>500ms</td></tr>
</table>

<h2>Association Graph</h2>
<p>BRAIN maintains an internal <strong>association graph</strong> connecting related memories:</p>
<ul>
<li><strong>Edge weight</strong> = co-occurrence frequency × relevance score</li>
<li><strong>Max edges per node</strong> = 20 (pruned by lowest weight)</li>
<li><strong>Graph traversal depth</strong> = 3 hops maximum for any single retrieval</li>
<li><strong>Pruning schedule</strong> = Every 1,000 new memories, prune edges with weight &lt; 0.1</li>
</ul>

<h3>Graph Topology Metrics</h3>
<table>
<tr><th>Metric</th><th>Target</th><th>Alert Threshold</th></tr>
<tr><td>Average degree</td><td>4–8</td><td>&lt; 2 or &gt; 15</td></tr>
<tr><td>Clustering coefficient</td><td>0.3–0.6</td><td>&lt; 0.1</td></tr>
<tr><td>Largest component %</td><td>&gt; 80%</td><td>&lt; 50%</td></tr>
</table>

<h2>Reinforcement Mechanics</h2>
<p>When a memory is successfully used:</p>
<div class="card">
<pre>new_confidence = min(1.0, current_confidence + boost × (1 - current_confidence))</pre>
</div>

<table>
<tr><th>Outcome</th><th>Boost</th></tr>
<tr><td>Direct retrieval success</td><td>0.05</td></tr>
<tr><td>Used in successful task</td><td>0.10</td></tr>
<tr><td>Cross-referenced by DREAM</td><td>0.03</td></tr>
<tr><td>User explicitly confirmed</td><td>0.15</td></tr>
<tr><td>Contradicted by new data</td><td>-0.20</td></tr>
<tr><td>Relevance feedback positive</td><td>+0.05 (EMA)</td></tr>
<tr><td>Relevance feedback negative</td><td>-0.05 (EMA)</td></tr>
</table>

<h2>Garbage Collection</h2>
<table>
<tr><th>Condition</th><th>Action</th></tr>
<tr><td>confidence < 0.05</td><td>Delete</td></tr>
<tr><td>Not accessed in 90 days AND confidence < 0.2</td><td>Archive</td></tr>
<tr><td>Contradicted 3+ times</td><td>Flag for review</td></tr>
<tr><td>Orphan (no associations, no access in 30 days)</td><td>Soft delete</td></tr>
<tr><td>Cold + confidence < 0.1 + age > 30 days</td><td>Server-side pruning via CLM</td></tr>
</table>

<hr />
<p><em>CMPSBL OS Substrate v10.5.1 — ARCHITECT Epoch — INTERNAL USE ONLY</em><br />
<em>Kenneth E Sweet Jr · PromptFluid®</em><br />
<em>ORCID: XXXX-XXXX-XXXX-XXXX · DOI: 10.5281/zenodo.XXXXXXX</em><br />
<em>© 2025–2026 PromptFluid®. All rights reserved.</em></p>

</div>
</body>
</html>
