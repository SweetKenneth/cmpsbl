<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<title>MEMORY Module — Deep Dive</title>
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

<h1>Module 15 — MEMORY</h1>
<p><strong>Vector Store, RAG, and Embeddings</strong></p>
<p><strong>Layer 6 — Infrastructure</strong> · <strong>v10.5.1 ARCHITECT Epoch</strong></p>
<hr />

<h2>Purpose</h2>
<p>MEMORY provides the substrate's vector storage and retrieval infrastructure. It manages embeddings, powers semantic search, and enables Retrieval-Augmented Generation (RAG) across the entire system. While BRAIN manages what to remember, MEMORY manages how to store and find it.</p>

<h2>Capabilities</h2>
<table>
<tr><th>Capability</th><th>Description</th><th>Tier</th></tr>
<tr><td>Embedding Generation</td><td>Convert text to vector embeddings via NEXUS providers</td><td>Free</td></tr>
<tr><td>Semantic Search</td><td>Find memories by meaning, not just keywords</td><td>Free</td></tr>
<tr><td>Vector Storage</td><td>Store and index high-dimensional embeddings</td><td>Free</td></tr>
<tr><td>RAG Pipeline</td><td>Retrieve relevant context and inject into AI prompts</td><td>Pro</td></tr>
<tr><td>Hybrid Search</td><td>Combine semantic similarity with keyword and metadata filters</td><td>Pro</td></tr>
<tr><td>Embedding Staleness Detection (v10.5.1)</td><td>Track embedding model versions and flag stale vectors for re-embedding</td><td>Pro</td></tr>
<tr><td>Relevance Feedback Loop (v10.5.1)</td><td>EMA-based relevance scoring that adjusts retrieval weights based on utility</td><td>Pro</td></tr>
<tr><td>Embedding Updates</td><td>Re-embed content when models improve</td><td>Enterprise</td></tr>
<tr><td>Cross-User Search</td><td>Search across user boundaries (admin only)</td><td>Enterprise</td></tr>
<tr><td>Knowledge Graph Construction</td><td>Build relationship graphs from embedding clusters</td><td>CMPSBL</td></tr>
<tr><td>Embedding Compression</td><td>Reduce storage requirements while preserving retrieval quality</td><td>CMPSBL</td></tr>
</table>

<h2>Architecture</h2>
<div class="card">
<pre>┌──────────────────────────────────────────┐
│              MEMORY Module                │
├──────────────┬───────────────────────────┤
│  Embedding    │  Vector Index             │
│  Engine       │  (pgvector)              │
│              │                           │
│  Text → Vec  │  Similarity search        │
│  via NEXUS   │  HNSW indexing            │
│              │  Cosine distance           │
├──────────────┴───────────────────────────┤
│           RAG Pipeline                    │
│                                          │
│  Query → Embed → Search → Rank → Inject  │
│                                          │
│  Retrieves top-k relevant chunks and     │
│  injects them into the AI prompt context │
├──────────────────────────────────────────┤
│     Embedding Health (v10.5.1)           │
│                                          │
│  Staleness Detection → Version Tracking  │
│  Relevance Feedback → EMA Scoring        │
└──────────────────────────────────────────┘</pre>
</div>

<h2>Embedding Staleness Detection (v10.5.1)</h2>
<table>
<tr><th>Field</th><th>Description</th></tr>
<tr><td>embeddingVersion</td><td>Model version used to generate the vector</td></tr>
<tr><td>currentVersion</td><td>Latest available embedding model version</td></tr>
<tr><td>staleCount</td><td>Number of vectors needing re-embedding</td></tr>
<tr><td>stalePercentage</td><td>Proportion of stale vectors in the store</td></tr>
</table>
<p>When staleness exceeds 20%, MEMORY automatically queues re-embedding jobs via the CLM Engine.</p>

<h2>Relevance Feedback Loop (v10.5.1)</h2>
<div class="card">
<pre>Retrieval → Was result useful? → EMA adjustment
                                    │
                                    ├── Useful: relevanceScore += α × (1 - current)
                                    └── Not useful: relevanceScore -= α × current</pre>
<table>
<tr><th>Parameter</th><th>Value</th></tr>
<tr><td>α (learning rate)</td><td>0.1</td></tr>
<tr><td>Initial relevance</td><td>0.5</td></tr>
<tr><td>Minimum threshold</td><td>0.05 (below = candidate for pruning)</td></tr>
</table>
</div>

<h2>RAG Pipeline Steps</h2>
<table>
<tr><th>Step</th><th>Description</th><th>Configurable</th></tr>
<tr><td>Query Embedding</td><td>Convert user query to vector</td><td>Model selection</td></tr>
<tr><td>Candidate Retrieval</td><td>Find top-N similar vectors</td><td>N (default: 20)</td></tr>
<tr><td>Re-Ranking</td><td>Score candidates by relevance, recency, and confidence</td><td>Weights</td></tr>
<tr><td>Relevance Feedback</td><td>Apply EMA-adjusted relevance scores (v10.5.1)</td><td>Learning rate</td></tr>
<tr><td>Context Assembly</td><td>Format retrieved chunks for prompt injection</td><td>Template</td></tr>
<tr><td>Token Budget</td><td>Ensure context fits within model's context window</td><td>Max tokens</td></tr>
</table>

<h2>Vector Index Configuration</h2>
<table>
<tr><th>Parameter</th><th>Default</th><th>Description</th></tr>
<tr><td>Dimensions</td><td>1536</td><td>Matches OpenAI ada-002 embeddings</td></tr>
<tr><td>Index Type</td><td>HNSW</td><td>Hierarchical Navigable Small World graph</td></tr>
<tr><td>Distance Metric</td><td>Cosine</td><td>Cosine similarity for normalized vectors</td></tr>
<tr><td>ef_construction</td><td>64</td><td>Index build quality parameter</td></tr>
<tr><td>m</td><td>16</td><td>Maximum connections per node</td></tr>
</table>

<h2>Integration with Other Modules</h2>
<table>
<tr><th>Module</th><th>Integration</th></tr>
<tr><td>BRAIN</td><td>Stores and retrieves memory embeddings; receives staleness signals via Brain Transfer</td></tr>
<tr><td>NEXUS</td><td>Routes embedding generation to appropriate AI provider</td></tr>
<tr><td>DECODE</td><td>Semantic search for intent matching</td></tr>
<tr><td>DREAM</td><td>Embeds dream insights for future retrieval</td></tr>
<tr><td>CORTEX</td><td>RAG context injection for orchestration decisions</td></tr>
<tr><td>RIPPLE</td><td>Emits memory.embedded, memory.search_complete, memory.stale_detected</td></tr>
<tr><td>CLM Engine</td><td>Server-side re-embedding and relevance recalculation every 5 minutes</td></tr>
</table>

<h2>Database Tables</h2>
<table>
<tr><th>Table</th><th>Purpose</th></tr>
<tr><td>memory_vectors</td><td>Vector embeddings with metadata and embeddingVersion</td></tr>
<tr><td>memory_chunks</td><td>Source text chunks before embedding</td></tr>
<tr><td>memory_indexes</td><td>Index configuration and statistics</td></tr>
</table>

<hr />
<p><em>CMPSBL OS Substrate v10.5.1 — ARCHITECT Epoch</em><br />
<em>Kenneth E Sweet Jr · PromptFluid®</em><br />
<em>ORCID: XXXX-XXXX-XXXX-XXXX · DOI: 10.5281/zenodo.XXXXXXX</em><br />
<em>© 2025–2026 PromptFluid®. All rights reserved.</em></p>

</div>
</body>
</html>