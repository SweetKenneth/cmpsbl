<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>INTENT — Compass Prime | CMPSBL® Substrate</title>
  <link rel="stylesheet" href="theme.css">
</head>
<body>
  <header class="doc-header">
    <div class="node-badge">Node #36</div>
    <h1>INTENT</h1>
    <p class="subtitle">Executive Function — "Compass Prime" v9.0.0</p>
    <div class="meta">
      <span class="sector">Mesh Overlay</span>
      <span class="codename">Compass Prime</span>
      <span class="generation">Ultimate</span>
    </div>
  </header>

  <main class="doc-content">
    <section>
      <h2>Executive Summary</h2>
      <p>INTENT v9.0.0 "Compass Prime" is the substrate's Executive Function — the intelligent bridge between "what was said" and "what the system does." It owns the full intent lifecycle: classification, decomposition, amplification, arbitration, orchestration, execution, verification, and predictive pre-resolution. Every user interaction passes through INTENT's 10 integrated systems.</p>
    </section>

    <section>
      <h2>Architecture Overview</h2>
      <pre><code>User Input
    │
    ▼
[1] Polyvalent Classifier   ← 4-strategy weighted voting
    │
    ▼
[3] Ambiguity Resolver       ← Surfaces unknowns, learns patterns
    │
    ▼
[7] Contextual Amplifier     ← Enriches from MEMORY/BRAIN/DECODE/IDENTITY/COMPASS
    │
    ▼
[2] Goal Decomposer          → DAG of atomic actions
    │
    ▼
[5] Priority Arbitrator      → Urgency scoring + starvation prevention
    │
    ▼
[9] Cross-Primitive Orchestrator  → Capacity-aware routing
    │
    ▼
[6] Rollback Planner         → Compensating/checkpoint/idempotent strategies
    │
    ▼
[8] Execution Telemetry      → Full lifecycle tracking (11 phases)
    │
    ▼
[4] Intent Memory            → Hebbian learning on intent→outcome edges
    │
    ▼
[10] Speculative Pre-Resolver → Predicts next intent from n-gram sequences</code></pre>
    </section>

    <section>
      <h2>System 1: Polyvalent Intent Classifier</h2>
      <p>Multi-strategy classification with confidence-weighted voting across 4 strategies:</p>
      <ul>
        <li><strong>Keyword</strong> (15% weight) — Direct keyword matching against 10 intent domains</li>
        <li><strong>Semantic</strong> (35% weight) — Epistemic verb pattern analysis (RegExp-based NLU)</li>
        <li><strong>Contextual</strong> (30% weight) — Session history, recent failures, follow-up patterns</li>
        <li><strong>Behavioral</strong> (20% weight) — Frequency analysis of recent intent stream</li>
      </ul>
      <p>Outputs: resolved intent type, confidence score, ambiguity/compound/implicit flags, and ranked alternatives.</p>
    </section>

    <section>
      <h2>System 2: Goal Decomposition Engine (DAG)</h2>
      <p>Transforms complex goals into dependency-ordered Directed Acyclic Graphs using Kahn's topological sort.</p>
      <ul>
        <li><strong>Goal Types</strong>: Simple (1 action), Compound (independent), Sequential (dependent chain), Conditional (branching)</li>
        <li><strong>Parallel Detection</strong>: Groups actions with no mutual dependencies into concurrent execution sets</li>
        <li><strong>Critical Path</strong>: Identifies the longest path through the DAG for timeline estimation</li>
        <li><strong>Status Tracking</strong>: Per-action lifecycle (pending → ready → executing → completed/failed/skipped)</li>
      </ul>
    </section>

    <section>
      <h2>System 3: Ambiguity Resolution Protocol</h2>
      <p>When classification confidence &lt; 0.7, surfaces structured disambiguation reports rather than guessing.</p>
      <ul>
        <li><strong>4 Ambiguity Types</strong>: Semantic, Referential, Structural, Contextual</li>
        <li><strong>Ranked Options</strong>: Up to 4 disambiguation options with confidence scores</li>
        <li><strong>Pattern Learning</strong>: EMA-weighted success rate tracking per pattern; auto-resolves after 3+ successful resolutions with &gt;80% success rate</li>
      </ul>
    </section>

    <section>
      <h2>System 4: Intent Memory & Pattern Recognition</h2>
      <p>Hebbian learning on intent→resolver-chain edges with temporal decay.</p>
      <ul>
        <li><strong>Strengthening</strong>: Successful resolutions increase edge weight by 0.1 × (1 - current_weight)</li>
        <li><strong>Weakening</strong>: Failures decrease edge weight by 0.05</li>
        <li><strong>Decay</strong>: Exponential decay per hour (e^(-0.001 × hours)), auto-prunes weak edges</li>
        <li><strong>Prediction</strong>: Predicts best resolver chain for any intent type based on Hebbian weights</li>
      </ul>
    </section>

    <section>
      <h2>System 5: Priority Arbitration Matrix</h2>
      <p>When multiple intents compete, arbitrates using composite priority scoring:</p>
      <ul>
        <li><strong>Urgency Weights</strong>: Critical (100), High (75), Normal (50), Low (25), Background (10)</li>
        <li><strong>Wait Bonus</strong>: Up to +20 for time spent waiting</li>
        <li><strong>Starvation Prevention</strong>: +30 bonus after 30s wait; starved intents bypass resource limits</li>
        <li><strong>Resource Budgets</strong>: Max 5 concurrent, 20 resource units in flight</li>
        <li><strong>Dependency Ordering</strong>: Defers intents whose dependencies aren't satisfied</li>
      </ul>
    </section>

    <section>
      <h2>System 6: Rollback Planning Engine</h2>
      <p>Every action plan ships with a rollback strategy:</p>
      <ul>
        <li><strong>Compensating</strong>: Run reverse actions to undo effects</li>
        <li><strong>Checkpoint</strong>: Restore from captured state snapshot</li>
        <li><strong>Idempotent</strong>: No rollback needed — action is safe to replay</li>
        <li><strong>None</strong>: Non-reversible action (acknowledged)</li>
      </ul>
      <p>Rollback steps execute in reverse order of original execution.</p>
    </section>

    <section>
      <h2>System 7: Contextual Amplification Layer</h2>
      <p>Enriches raw user input with contextual signals from 6 sources:</p>
      <ul>
        <li><strong>MEMORY</strong>: Recent intent history, conversation context</li>
        <li><strong>BRAIN</strong>: Reasoning mode activation for analytical intents</li>
        <li><strong>DECODE</strong>: Input complexity assessment (low/medium/high)</li>
        <li><strong>IDENTITY</strong>: User role and session context</li>
        <li><strong>COMPASS</strong>: Trend analysis availability for predictive intents</li>
        <li><strong>Session</strong>: Active session variables (max 5 signals)</li>
      </ul>
      <p>Filters by relevance threshold (&gt;0.2), caps at 15 context signals per amplification.</p>
    </section>

    <section>
      <h2>System 8: Execution Telemetry & Feedback Loop</h2>
      <p>Full lifecycle tracking through 11 phases:</p>
      <pre><code>received → classified → decomposed → amplified → arbitrated → 
routed → executing → executed → verified | failed | rolled_back</code></pre>
      <ul>
        <li><strong>Per-Phase Duration</strong>: Tracks time spent in each phase</li>
        <li><strong>Snapshots</strong>: Periodic aggregate snapshots with P95 duration, phase breakdown, success rate</li>
        <li><strong>Feedback Loop</strong>: Success/failure data feeds back into classifier and memory systems</li>
      </ul>
    </section>

    <section>
      <h2>System 9: Cross-Primitive Orchestration Protocol</h2>
      <p>Capacity-aware intent routing across 26 substrate nodes:</p>
      <ul>
        <li><strong>Node Capability Map</strong>: Maps 26 primitives to 52 capability domains</li>
        <li><strong>Composite Scoring</strong>: Capability match (30) + Health (15) - Load penalty (10) - Degradation penalty (15-30)</li>
        <li><strong>Fallback Chain</strong>: Top 3 fallback primitives pre-computed per route</li>
        <li><strong>Parallel Grouping</strong>: Routes to different primitives grouped for concurrent execution</li>
        <li><strong>Real-Time Capacity</strong>: Integrates with NERVE health data for live node status</li>
      </ul>
    </section>

    <section>
      <h2>System 10: Speculative Pre-Resolution</h2>
      <p>Predicts the most likely next intent based on behavioral patterns:</p>
      <ul>
        <li><strong>N-Gram Learning</strong>: Learns 2-gram and 3-gram intent sequences from the stream</li>
        <li><strong>Confidence Gating</strong>: Only pre-stages when confidence &gt; 0.5</li>
        <li><strong>TTL Management</strong>: Pre-resolutions expire after 60s if unused</li>
        <li><strong>Hit Rate Tracking</strong>: Measures prediction accuracy and average lead time</li>
        <li><strong>Pipeline Pre-Staging</strong>: Pre-warms resolver chains before user even sends the request</li>
      </ul>
    </section>

    <section>
      <h2>Unified Health Assessment</h2>
      <pre><code>overallHealth = (
  classifierConfidence × 0.25 +
  telemetrySuccessRate × 0.25 +
  orchestratorNetworkHealth × 0.25 +
  preResolverHitRate × 0.25
)</code></pre>
    </section>

    <section>
      <h2>Integration Chain</h2>
      <pre><code>DECODE (parses user input)
    │
    ▼
INTENT (classifies, decomposes, orchestrates)
    │
    ├──→ BRAIN (reasoning enrichment)
    ├──→ MEMORY (context retrieval)
    ├──→ COMPASS (trend signals)
    ├──→ CORTEX (pipeline execution)
    │
    ▼
ENCODE (generates response)</code></pre>
    </section>

    <section>
      <h2>Auto-Activation Rules</h2>
      <ul>
        <li><strong>ACT_038</strong> (T4): Intent Amplification Tuning — re-calibrates routing weights when resolution accuracy drops</li>
      </ul>
    </section>
  </main>

  <footer class="doc-footer">
    <p>CMPSBL® Substrate — INTENT "Compass Prime" v9.0.0 · Founder Eyes Only</p>
  </footer>
</body>
</html>
