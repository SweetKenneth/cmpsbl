<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<title>Evolution Engine & CLM — Complete Reconstruction Guide</title>
<style>
  body{font-family:Georgia,"Times New Roman",serif;font-size:11pt;line-height:1.4;color:#111;background:#fff;margin:0}
  .page{max-width:8.5in;margin:0 auto;padding:0.8in}
  h1{font-size:20pt;margin-bottom:0.3in}h2{font-size:14pt;margin-top:0.4in}h3{font-size:12pt;margin-top:0.25in}h4{font-size:11pt;margin-top:0.2in}
  p{margin-bottom:0.14in}ul,ol{margin-left:0.25in}
  table{width:100%;border-collapse:collapse;margin:0.2in 0}th,td{border:1px solid #ccc;padding:6px 8px}th{background:#f3f3f3;text-align:left}
  pre{background:#f8f8f8;border:1px solid #ddd;padding:12px;font-family:"Courier New",monospace;font-size:9pt;overflow-x:auto;white-space:pre;margin:0.15in 0}
  .card{border:1px solid #ddd;border-radius:10px;padding:0.2in;margin-bottom:0.25in}
  .danger{border-color:#e74c3c;background:#fdf2f2}
  hr{border:none;border-top:1px solid #ccc;margin:0.3in 0}
  @media print{@page{size:Letter;margin:0.8in}.card{break-inside:avoid}}
</style>
</head>
<body>
<div class="page">

<h1>🔒 Evolution Engine & Cognitive Lifecycle Manager (CLM)</h1>
<p><strong>Complete Reconstruction Guide — MAXIMUM CLASSIFICATION</strong></p>
<p><strong>Document 22</strong> · <strong>Classification: 🔴🔴 ULTRA-CRITICAL — Full Reconstruction Blueprint</strong></p>
<hr />

<div class="card danger">
<p>⚠️ <strong>ULTRA-CRITICAL — FULL RECONSTRUCTION BLUEPRINT</strong></p>
<p>This document contains every algorithm, formula, threshold, and architectural detail required to reconstruct the Evolution Engine and Cognitive Lifecycle Manager (CLM) from scratch. This document must NEVER leave the organization. Physical and digital distribution is strictly prohibited. If compromised, this single document enables a competitor to replicate the substrate's core self-improvement and cognitive capabilities.</p>
</div>

<hr />

<h1>PART I — EVOLUTION ENGINE (SEBA Framework)</h1>
<p>The Structured Evolution with Bounded Autonomy (SEBA) framework enables the substrate to propose, validate, apply, and roll back improvements to its own behavior — autonomously, safely, and verifiably.</p>

<h2>1. The Full 12-Step Pipeline</h2>
<p>The public documentation describes a 7-step lifecycle. The actual pipeline has 12 steps with internal gates:</p>

<div class="card">
<pre>Step  1: VISION detects opportunity (anomaly or trend in telemetry)
Step  2: VISION scores opportunity using opportunity_score formula
Step  3: MODERNIZER generates formal proposal with diff
Step  4: CORTEX checks governance bounds (autonomy tier, budget, safety)
Step  5: SANDBOX creates isolated test environment (full state snapshot)
Step  6: SANDBOX applies proposal in isolation
Step  7: SANDBOX runs regression suite (≥85% pass required)
Step  8: SANDBOX runs performance benchmark (≤10% degradation)
Step  9: CORTEX evaluates risk_score
Step 10: APPROVAL gate (per current autonomy tier)
Step 11: MODERNIZER applies to production
Step 12: MODERNIZER generates cryptographic evolution stamp</pre>
</div>

<h3>1.1 Step 2 — Opportunity Scoring</h3>
<div class="card">
<pre>opportunity_score = impact × confidence × feasibility

Where:
  impact      = estimated improvement magnitude (0.0–1.0)
  confidence  = certainty the opportunity exists (0.0–1.0)
  feasibility = likelihood the change will succeed (0.0–1.0)

Gate: opportunity_score ≥ 0.25 to proceed to Step 3
</pre>
</div>

<h3>1.2 Step 3 — Proposal Structure</h3>
<div class="card">
<pre>interface SEBAProposal {
  id: uuid;
  source: 'vision' | 'modernizer' | 'operator';
  type: 'prompt_optimization' | 'routing_adjustment' | 'memory_strategy'
      | 'defense_rule' | 'pipeline_restructure' | 'module_configuration';
  description: string;
  diff: {
    target_module: string;
    target_config_key: string;
    old_value: any;
    new_value: any;
  };
  predicted_impact: {
    metric: string;
    current_value: number;
    predicted_value: number;
    confidence: number;
  };
  risk_assessment: {
    scope_breadth: number;      // modules_affected / 21
    reversibility: number;      // 0.0 = fully reversible, 1.0 = irreversible
    estimated_blast_radius: string[];
  };
  rollback_plan: {
    snapshot_id: uuid;
    restore_steps: string[];
  };
  budget: {
    estimated_cost_usd: number;
    max_allowed_usd: number;    // Hard cap: $0.50 per evolution
  };
}</pre>
</div>

<h3>1.3 Step 4 — Governance Bound Check</h3>
<p>CORTEX validates the proposal against governance constraints before sandbox testing:</p>
<ul>
<li><strong>Autonomy tier check</strong> — Is the current tier authorized for this evolution type?</li>
<li><strong>Budget check</strong> — Does estimated cost exceed the $0.50/evolution cap?</li>
<li><strong>Daily quota check</strong> — Have we exceeded max proposals (10/day) or applications (3/day)?</li>
<li><strong>Cooldown check</strong> — If a rollback occurred in the last 6 hours, reject automatically.</li>
<li><strong>Immutability check</strong> — Does the proposal touch any immutable target?</li>
</ul>

<h4>Immutable Targets (NEVER modifiable by evolution)</h4>
<table>
<tr><th>Target</th><th>Reason</th></tr>
<tr><td>Governance rules</td><td>Meta-stability: system cannot modify its own constraints</td></tr>
<tr><td>Database schemas</td><td>Safety boundary: structural changes require human approval</td></tr>
<tr><td>Access control policies</td><td>Security boundary: privilege escalation prevention</td></tr>
<tr><td>Crown Jewel capabilities</td><td>Strategic boundary: core IP protection</td></tr>
<tr><td>Evolution rules themselves</td><td>Recursive safety: prevents self-modification of the modifier</td></tr>
</table>

<h3>1.4 Steps 5–6 — Sandbox Execution</h3>
<p>The sandbox creates a complete state snapshot before applying the proposal:</p>
<div class="card">
<pre>Snapshot contents:
  1. All module configurations (system_config table)
  2. All active system prompts (per-module prompt templates)
  3. All routing/scoring weights (provider weights, fallover priorities)
  4. All defense and governance rules
  5. Current health scores for all 21 modules

Sandbox applies the proposal's diff to the snapshot copy.
Tests run against the modified snapshot — never against production.</pre>
</div>

<h3>1.5 Step 7 — Regression Gate</h3>
<table>
<tr><th>Criterion</th><th>Threshold</th><th>Failure Action</th></tr>
<tr><td>Overall test pass rate</td><td>≥ 85%</td><td>Reject proposal</td></tr>
<tr><td>Previously-passing critical tests</td><td>0 failures allowed</td><td>Reject proposal</td></tr>
<tr><td>New capability coverage</td><td>≥ 1 test per new capability</td><td>Reject proposal</td></tr>
</table>

<h3>1.6 Step 8 — Performance Gate</h3>
<table>
<tr><th>Metric</th><th>Max Degradation</th></tr>
<tr><td>p95 latency</td><td>≤ 10% increase</td></tr>
<tr><td>Memory usage</td><td>≤ 5% increase</td></tr>
<tr><td>Error rate</td><td>≤ 1% increase</td></tr>
</table>

<h3>1.7 Step 9 — Risk Scoring</h3>
<div class="card">
<pre>risk_score = (1 - regression_pass_rate)   × 0.4
           + performance_degradation       × 0.3
           + scope_breadth                 × 0.2
           + reversibility_cost            × 0.1

Where:
  scope_breadth      = number_of_modules_affected / 21
  reversibility_cost = 0.0 (fully reversible) to 1.0 (irreversible)

Gate: risk_score > 0.6 → AUTOMATIC REJECTION</pre>
</div>

<h3>1.8 Step 10 — Approval Gate (Autonomy Tiers)</h3>

<h4>Tier Definitions</h4>
<table>
<tr><th>Tier</th><th>Authority</th><th>Human Role</th></tr>
<tr><td>Manual</td><td>Human approves all changes</td><td>Active approval required</td></tr>
<tr><td>Supervised</td><td>System acts, human reviews post-hoc</td><td>Post-hoc review within 24h</td></tr>
<tr><td>Autonomous</td><td>System acts within bounds</td><td>Notification only</td></tr>
</table>

<h4>Tier Transition Requirements</h4>
<table>
<tr><th>Transition</th><th>Requirement</th></tr>
<tr><td>Manual → Supervised</td><td>N consecutive successful evolutions, zero rollbacks</td></tr>
<tr><td>Supervised → Autonomous</td><td>M consecutive successes, human approval rate > 95%</td></tr>
<tr><td>Any → Manual</td><td>Critical failure, security incident, or manual override</td></tr>
</table>

<h4>CORTEX Proposal Decision Thresholds</h4>
<table>
<tr><th>Score Range</th><th>Decision</th></tr>
<tr><td>≥ 0.70</td><td>Auto-approve — execute immediately</td></tr>
<tr><td>0.40–0.69</td><td>Queue — schedule for next maintenance window</td></tr>
<tr><td>0.20–0.39</td><td>Review — flag for human review</td></tr>
<tr><td>&lt; 0.20</td><td>Reject — log reason and discard</td></tr>
</table>

<h4>CORTEX Scoring Matrix</h4>
<div class="card">
<pre>cortex_score = feasibility × 0.25
             + (1 - risk_score) × 0.25
             + impact × 0.30
             + alignment × 0.20</pre>
</div>

<h3>1.9 Step 12 — Evolution Stamp</h3>
<div class="card">
<pre>interface SEBAReceipt {
  stamp_id: uuid;
  run_id: uuid;
  plan_id: uuid;
  timestamp: ISO8601;
  proposer: string;           // 'vision' | 'modernizer' | operator_id
  approver: string;           // 'cortex_auto' | 'human:user_id'
  autonomy_tier: 'manual' | 'supervised' | 'autonomous';
  change_description: string;
  diff_hash: string;          // SHA-256 of the applied diff
  pre_state_hash: string;     // SHA-256 of full pre-evolution state
  post_state_hash: string;    // SHA-256 of full post-evolution state
  regression_results: {
    total_tests: number;
    passed: number;
    failed: number;
    pass_rate: number;
  };
  performance_delta: {
    latency_p95_change_pct: number;
    memory_change_pct: number;
    error_rate_change_pct: number;
  };
  risk_score: number;
  rollback_available: boolean;
  rollback_snapshot_id: uuid;
  health_delta: {
    pre_health: number;
    post_health: number;
  };
}</pre>
</div>

<h2>2. Evolution Types & Scheduling</h2>
<table>
<tr><th>Type</th><th>Frequency</th><th>Risk</th><th>Examples</th></tr>
<tr><td>Prompt optimization</td><td>Daily</td><td>Low</td><td>System prompt refinements, response templates</td></tr>
<tr><td>Routing adjustment</td><td>Weekly</td><td>Low</td><td>Provider weight changes, failover priorities</td></tr>
<tr><td>Memory strategy</td><td>Weekly</td><td>Medium</td><td>Decay rate tuning, reinforcement weights</td></tr>
<tr><td>Defense rule</td><td>As-needed</td><td>Medium</td><td>New threat signatures, threshold adjustments</td></tr>
<tr><td>Pipeline restructure</td><td>Monthly</td><td>High</td><td>Synergy pipeline step changes</td></tr>
<tr><td>Module configuration</td><td>Monthly</td><td>High</td><td>Module behavior parameter changes</td></tr>
</table>

<h2>3. Evolution Budget (Hard Limits)</h2>
<table>
<tr><th>Constraint</th><th>Limit</th><th>Period</th></tr>
<tr><td>Max proposals generated</td><td>10</td><td>Per day</td></tr>
<tr><td>Max proposals applied</td><td>3</td><td>Per day</td></tr>
<tr><td>Max rollbacks</td><td>2</td><td>Per day</td></tr>
<tr><td>Cooldown after rollback</td><td>6 hours</td><td>Per incident</td></tr>
<tr><td>Max cost per evolution</td><td>$0.50</td><td>Per evolution</td></tr>
<tr><td>Single active evolution</td><td>1</td><td>At any time (DB trigger enforced)</td></tr>
</table>

<h2>4. Rollback System</h2>
<p>Rollback is <strong>atomic</strong> — ALL snapshots are restored simultaneously. Partial rollback is deliberately not supported to prevent inconsistent state.</p>
<div class="card">
<pre>Rollback captures (before application):
  1. Config snapshot    — all module configurations
  2. Prompt snapshot    — all active system prompts
  3. Weight snapshot    — all routing/scoring weights
  4. Rule snapshot      — all defense and governance rules

Rollback triggers:
  - Manual operator command
  - Automated regression detection (health drops > 10% post-apply)
  - Governance override
  - CORTEX emergency (substrate health < 50)

Rollback preserves:
  - The evolution stamp (for audit trail)
  - The proposal record (for analysis)
  - Telemetry data (for learning)</pre>
</div>

<h2>5. Database Schema (Evolution Tables)</h2>
<div class="card">
<pre>-- Core evolution tracking
evolution_runs:
  run_id: uuid (PK)
  plan_id: uuid (FK → substrate_upgrade_plans)
  phase: 'planning' | 'shadow_applied' | 'production_applied' | 'verified' | 'aborted' | 'failed'
  triggered_by: text
  pre_state_hash: text
  post_state_hash: text
  diff_summary: jsonb
  regression_results: jsonb
  risk_score: numeric
  rollback_available: boolean
  created_at: timestamptz
  completed_at: timestamptz

-- Phase transition validation trigger:
  Cannot go backwards (except to failed/aborted)
  Cannot skip phases
  Only one active evolution run at a time

-- Upgrade plans (evolution proposals)
substrate_upgrade_plans:
  id: uuid (PK)
  scope: text
  priority: text
  status: text
  started_at: timestamptz
  plan_data: jsonb
  created_at: timestamptz
  updated_at: timestamptz

-- Evolution run history (denormalized for fast queries)
evolution_run_history:
  id: uuid (PK)
  run_id: uuid
  phase: text
  outcome: text
  details: jsonb
  created_at: timestamptz</pre>
</div>

<hr />

<h1>PART II — COGNITIVE LIFECYCLE MANAGER (CLM)</h1>
<p>The CLM is the overarching system that connects BRAIN (memory), DREAM (learning), VISION (observation), and MODERNIZER (evolution) into a continuous cognitive improvement loop.</p>

<h2>6. The Cognitive Loop</h2>
<div class="card">
<pre>  ┌─────────┐                                     ┌────────────┐
  │  VISION  │──── observes system performance ───►│   DREAM    │
  │(Module 9)│                                     │ (Module 6) │
  └─────────┘                                     └──────┬─────┘
       ▲                                                  │
       │                                    identifies patterns,
       │                                    generates insights
  observes improved                                       │
  performance                                             ▼
       │                                          ┌──────────────┐
       │                                          │    BRAIN     │
  ┌────┴────────┐                                 │  (Module 4)  │
  │   SYSTEM    │◄──── applies improvement ──────┤              │
  │ (improved)  │                                 │ stores new   │
  └─────────────┘                                 │ knowledge    │
       ▲                                          └──────┬───────┘
       │                                                  │
       │              ┌──────────────┐                    │
       └──────────────│ MODERNIZER   │◄───────────────────┘
                      │  (Module 5)  │   proposes improvements
                      │              │   based on accumulated
                      └──────────────┘   knowledge</pre>
</div>

<h2>7. BRAIN — Persistent Memory System</h2>

<h3>7.1 Memory Types</h3>
<table>
<tr><th>Type</th><th>Content</th><th>Decay Rate (λ)</th><th>Half-Life</th></tr>
<tr><td>Episodic</td><td>Events, interactions, conversations</td><td>0.023</td><td>~30 days</td></tr>
<tr><td>Semantic</td><td>Facts, configuration, learned patterns</td><td>0.0046</td><td>~150 days</td></tr>
<tr><td>Procedural</td><td>How-to knowledge, routing strategies</td><td>0.0023</td><td>~300 days</td></tr>
<tr><td>Meta-cognitive</td><td>Self-observations, capability assessments</td><td>0.0116</td><td>~60 days</td></tr>
</table>

<h3>7.2 Confidence System</h3>
<p>Every memory has a confidence score (0.0–1.0) that evolves through three mechanisms:</p>

<h4>Initial Confidence by Source</h4>
<table>
<tr><th>Source</th><th>Initial Confidence</th></tr>
<tr><td>User-provided fact</td><td>0.70</td></tr>
<tr><td>AI-generated insight</td><td>0.50</td></tr>
<tr><td>Dream-cycle hypothesis</td><td>0.30</td></tr>
<tr><td>Cross-validated knowledge</td><td>0.85</td></tr>
<tr><td>System observation</td><td>0.60</td></tr>
</table>

<h4>Reinforcement Formula</h4>
<div class="card">
<pre>new_confidence = min(1.0, current_confidence + boost × (1 - current_confidence))

Default boost: 0.15

The (1 - current_confidence) factor ensures diminishing returns:
  - Boosting 0.50 → 0.575 (large gain)
  - Boosting 0.95 → 0.9575 (small gain)</pre>
</div>

<h4>Temporal Decay Formula</h4>
<div class="card">
<pre>decayed_confidence = confidence × e^(-λ × days_since_last_access)

Where λ = decay rate (see Memory Types table above)</pre>
</div>

<h4>Contradiction Handling</h4>
<div class="card">
<pre>reduced_confidence = confidence × (1 - contradiction_strength)

Where contradiction_strength = 0.0–1.0 (directness of contradiction)</pre>
</div>

<h3>7.3 Confidence Gating Thresholds</h3>
<table>
<tr><th>Gate</th><th>Threshold</th><th>Behavior</th></tr>
<tr><td>Recall gate</td><td>≥ 0.30</td><td>Memory appears in query results</td></tr>
<tr><td>Response gate</td><td>≥ 0.50</td><td>Memory included in AI context window</td></tr>
<tr><td>Assert gate</td><td>≥ 0.70</td><td>Memory stated as fact to users</td></tr>
<tr><td>Teach gate</td><td>≥ 0.85</td><td>Memory used to train other systems</td></tr>
<tr><td>Archive gate</td><td>&lt; 0.10</td><td>Memory moved to cold storage</td></tr>
</table>

<h3>7.4 Value Score Formula (Core Prioritization Algorithm)</h3>
<div class="card">
<pre>value_score = (
  confidence × 0.35 +
  recency    × 0.25 +
  frequency  × 0.20 +
  impact     × 0.20
) × normalization_factor

normalization_factor = 1 / (1 + e^(-k × (raw_score - midpoint)))

Where:
  k = 6.0 (steepness parameter)
  midpoint = 0.5

Used by: BRAIN (recall), DREAM (insight ranking), MODERNIZER (proposal priority),
         CORTEX (task assignment), NEXUS (provider selection)</pre>
</div>

<h3>7.5 Memory Value Calculation (Database Function)</h3>
<div class="card">
<pre>memory_value = (importance_score × 0.4)
             + (recency_factor × 0.35)
             + (access_factor × 0.25)

Where:
  recency_factor = e^(-decay_rate × age_days)
  access_factor  = min(1.0, 0.3 + 0.1 × ln(max(1, access_count)))

Result clamped to [0.0, 1.0]</pre>
</div>

<h3>7.6 Knowledge Graphs</h3>
<p>BRAIN constructs knowledge graphs from stored memories, connecting related concepts with typed edges:</p>
<table>
<tr><th>Edge Type</th><th>Semantics</th></tr>
<tr><td>supports</td><td>Memory A provides evidence for Memory B</td></tr>
<tr><td>contradicts</td><td>Memory A conflicts with Memory B</td></tr>
<tr><td>derives_from</td><td>Memory A was synthesized from Memory B</td></tr>
<tr><td>temporal</td><td>Memory A occurred before/after Memory B</td></tr>
</table>

<h2>8. DREAM — Autonomous Learning (Dream State)</h2>

<h3>8.1 Dream Cycle Phases</h3>
<div class="card">
<pre>Phase 1: GATHER (NREM Stage 1)
  - Pull top memories by importance × recency + random sample
  - Working set: 35–50 memories
  - Selection bias toward recent high-importance + random exploration

Phase 2: SYNTHESIZE (NREM Stage 3 / slow-wave)
  Three strategies:
  a) Pattern Detection — recurring themes across semantically distant memories
  b) Contradiction Resolution — reconcile conflicts by evidence strength, recency, source reliability
  c) Gap Analysis — identify incomplete patterns, generate testable hypotheses

Phase 3: EVALUATE (REM)
  Multi-dimensional scoring (proprietary quality function):
  - Novelty: how different from existing knowledge
  - Confidence: evidence strength
  - Utility: predicted usefulness
  - Coherence: internal consistency
  
  Gating decisions:
  - Accept (commit to BRAIN)
  - Review (queue for re-evaluation)
  - Reject (discard)

Phase 4: COMMIT (consolidation)
  - Store accepted syntheses as new semantic memories in BRAIN
  - Initial confidence: 0.30 (dream-cycle hypothesis)
  - Reinforcement loop: successful use increases confidence over time</pre>
</div>

<h3>8.2 Dream Pool (Multi-Agent)</h3>
<table>
<tr><th>Mode</th><th>Scope</th><th>Privacy</th></tr>
<tr><td>Isolated</td><td>Each agent dreams independently</td><td>Full isolation</td></tr>
<tr><td>Shared</td><td>Synthesis outputs shared across agency</td><td>Output-only sharing</td></tr>
<tr><td>Collective</td><td>Joint working set from all agents</td><td>Full memory access within agency</td></tr>
</table>
<p>Pool participation requires explicit consent gating (agency_dream_consent table). Data sovereignty enforced via RLS.</p>

<h3>8.3 Dream Budget Governance</h3>
<ul>
<li>Only triggered during verified idle periods</li>
<li>Any incoming user interaction immediately interrupts the dream</li>
<li>Maximum compute time per cycle (configurable)</li>
<li>Maximum API calls per cycle</li>
<li>Maximum cost per cycle</li>
<li>Mandatory cool-down between cycles</li>
</ul>

<h3>8.4 Measured Outcomes (Production Telemetry)</h3>
<table>
<tr><th>Metric</th><th>Observed Value</th></tr>
<tr><td>Novel patterns discovered per hour</td><td>1–3</td></tr>
<tr><td>Contradiction resolution rate</td><td>&gt; 50%</td></tr>
<tr><td>Synthesis commit rate</td><td>30–60%</td></tr>
<tr><td>Memory quality improvement (confidence Δ)</td><td>+0.08 avg over 30 days</td></tr>
<tr><td>User-perceptible latency impact</td><td>None (async)</td></tr>
</table>

<h2>9. VISION — Self-Observation</h2>
<p>VISION provides real-time observability across all 21 modules:</p>
<ul>
<li>Health scores (weighted by module importance)</li>
<li>Response times (p50, p95, p99)</li>
<li>Error rates and error categorization</li>
<li>Resource utilization (memory, CPU, API quota)</li>
<li>SLA compliance tracking</li>
<li>Anomaly detection (rate spikes, temporal anomalies, behavioral shifts)</li>
</ul>

<h3>9.1 Anomaly Detection Algorithms</h3>
<div class="card">
<pre>Rate Spike Detection:
  spike = current_rate > baseline × spike_multiplier
  Default spike_multiplier: 3.0

Temporal Anomaly Detection:
  Uses time-of-day baselines with configurable sensitivity

Behavioral Anomaly Detection:
  Tracks deviation from learned behavioral patterns
  Severity: low | medium | high | critical</pre>
</div>

<h2>10. CORTEX — Orchestration</h2>

<h3>10.1 Workflow Execution (DAG Engine)</h3>
<div class="card">
<pre>Algorithm:
  1. Identify nodes with no dependencies (ready set)
  2. Execute ready nodes in parallel
  3. For each completed node:
     - If failed AND critical → abort entire DAG
     - If failed AND optional → skip all downstream
     - If succeeded → mark complete, add results to context
  4. Recalculate ready set (nodes whose dependencies are all met)
  5. Repeat until no ready nodes remain
  6. Return aggregated results</pre>
</div>

<h3>10.2 Module Health Aggregation</h3>
<div class="card">
<pre>substrate_health = Σ(module_health × module_weight) / Σ(module_weight)

Module weights by layer:
  Kernel (CORE, RIPPLE, ACCESS):                    1.5×
  Cognitive (BRAIN, DECODE, DREAM):                 1.3×
  Operational (DEFENSE, NEXUS, VISION, INTEGRATION): 1.0×
  Administrative (SYSTEM, MODERNIZER, INCLUSIVE):    0.8×
  Orchestrator (CORTEX):                             1.0×
  Infrastructure (MEMORY, RELAY, AUDIT, IDENTITY,    0.7×
                  ECONOMY, SANDBOX, ENCODE):

Health Decision Matrix:
  90–100: Normal operations
  70–89:  Enable adaptive throttling
  50–69:  Trigger system.heal, notify on-call
  30–49:  Graceful degradation mode
  < 30:   Emergency shutdown of non-essential modules</pre>
</div>

<h3>10.3 Task Assignment (Agency Mode)</h3>
<div class="card">
<pre>assignment_score = agent_skill_match    × 0.35
                 + agent_availability   × 0.25
                 + agent_success_rate   × 0.20
                 + agent_learning_gain  × 0.10
                 + load_balance_factor  × 0.10</pre>
</div>

<h2>11. Synergy Pipelines</h2>

<h3>11.1 Pipeline Structure</h3>
<div class="card">
<pre>SynergyPipeline:
  id, name, description
  steps: PipelineStep[]          // ordered
  error_strategy: abort | skip | retry | fallback
  max_duration_ms: number
  requires_modules: string[]
  tier_availability: string[]

PipelineStep:
  order: number
  module: string
  action: string
  input_mapping: Record<string, string>
  output_key: string
  timeout_ms: number
  optional: boolean
  retry_count: number</pre>
</div>

<h3>11.2 Pipeline Categories (300+ total)</h3>
<table>
<tr><th>Category</th><th>Count</th><th>Example Chain</th></tr>
<tr><td>Memory operations</td><td>35</td><td>remember → verify → associate</td></tr>
<tr><td>Analysis workflows</td><td>28</td><td>decode → brain.recall → nexus.analyze</td></tr>
<tr><td>Security sweeps</td><td>22</td><td>defense.scan → inclusive.validate → report</td></tr>
<tr><td>Evolution cycles</td><td>18</td><td>modernizer.propose → cortex.evaluate → system.apply</td></tr>
<tr><td>Observability</td><td>25</td><td>vision.collect → cortex.aggregate → brain.store</td></tr>
<tr><td>Agency operations</td><td>40</td><td>task.create → assign → execute → deliver</td></tr>
<tr><td>Integration flows</td><td>20</td><td>integration.connect → transform → deliver</td></tr>
<tr><td>Infrastructure</td><td>12</td><td>audit.log → relay.notify → economy.meter</td></tr>
<tr><td>Crystallized (tiered)</td><td>100+</td><td>High-value pre-optimized chains across all categories</td></tr>
</table>

<h3>11.3 Execution Engine</h3>
<div class="card">
<pre>For each step in pipeline.steps (ordered):
  1. Resolve input_mapping from accumulated context
  2. Check target module health (circuit breaker state)
  3. If module unhealthy:
     - If step.optional → skip, continue
     - If error_strategy == 'fallback' → use cached/default value
     - Else → abort pipeline
  4. Execute module.action with resolved inputs
  5. Store result under step.output_key in context
  6. Emit pipeline.step.completed to RIPPLE (event bus)
  7. If failed and step.retry_count > 0 → retry with exponential backoff

Backoff formula:
  delay_ms = min(100 × 2^attempt, 5000)</pre>
</div>

<h3>11.4 Dynamic Composition</h3>
<p>CORTEX can compose pipelines on-the-fly from DECODE intents:</p>
<ol>
<li>Parse user intent into required actions</li>
<li>Query module registry for available actions</li>
<li>Resolve dependencies between actions</li>
<li>Build DAG from dependency graph</li>
<li>Optimize: parallelize independent steps</li>
<li>Execute via standard pipeline engine</li>
</ol>
<p>Constraints: max 12 steps, max 3 parallel branches, 30-second timeout, all modules must be healthy.</p>

<hr />

<h1>PART III — CROSS-CUTTING SYSTEMS</h1>

<h2>12. Circuit Breaker System</h2>
<div class="card">
<pre>States:
  CLOSED    → Normal operation
  OPEN      → Module unhealthy, requests rejected
  HALF_OPEN → Testing recovery, limited requests accepted

Transitions:
  CLOSED → OPEN:      failure_count exceeds threshold
  OPEN → HALF_OPEN:   cooldown_period expires
  HALF_OPEN → CLOSED: test request succeeds
  HALF_OPEN → OPEN:   test request fails

Each of the 21 modules has an independent circuit breaker.
One module's failure does not affect others.</pre>
</div>

<h2>13. Truth Boundary Protocol</h2>
<p>Prevents AI agents from presenting speculation as verified telemetry:</p>
<div class="card">
<pre>Classification levels:
  VERIFIED  — Backed by real telemetry data from the Central Health Registry
  INFERRED  — Derived from patterns but not directly measured
  NARRATIVE — AI-generated interpretation (must be prefixed with disclaimer)

Rule: Dashboard, Terminal, and Module Voice must always show VERIFIED data.
      DECODE responses tagged with truth_mode: INFERRED must prefix with
      "Based on current signals..."

Parity Check: Truth Verification Engine automatically compares Dashboard,
              Terminal, and CHR for mismatches, emitting integrity events
              on divergence.</pre>
</div>

<h2>14. Telemetry Aggregation</h2>
<div class="card">
<pre>Sources:
  - ai_usage_log    → API call metrics, cost, latency
  - access_usage    → Developer API metering
  - brain_events    → Memory operations, dream cycles
  - defense_events  → Threat detection, bot blocking
  - agency_*        → Agent task execution, economics

Aggregation interval: 60 seconds
Stale threshold: 30 seconds
Central Health Registry (CHR) maintains the single source of truth.</pre>
</div>

<h2>15. IP Protection (Black-Box Enforcement)</h2>
<div class="card">
<pre>Crown Jewel inventory:
  - 168 high-tier capabilities (architecture-sensitive)
  - 100 crystallized pipelines (tiered)
  - Total: 299+ sensitive artifacts

Protection layers:
  1. Environment Signature — locked to production ID
  2. Architecture Crown Jewels — recursive engines permanently hidden
  3. Experience Crown Jewels — delivered as sealed runtimes with 10-point enforcement:
     - No source visibility
     - No prompt/memory leakage
     - No internal config exposure
     - No system graph visibility
     - No cross-project bleed
     - No exports
     - No duplication
     - No cloning
     - No composition into discovery engines
     - No reverse engineering via API probing
  4. 4-tier access model: Free, Creator, Architect, Enterprise</pre>
</div>

<hr />

<h1>PART IV — RECONSTRUCTION CHECKLIST</h1>
<p>To reconstruct the Evolution Engine and CLM from scratch, you need:</p>

<h3>Database Tables Required</h3>
<ol>
<li><code>evolution_runs</code> — with phase validation trigger and single-active constraint</li>
<li><code>evolution_run_history</code> — denormalized audit trail</li>
<li><code>substrate_upgrade_plans</code> — proposal storage</li>
<li><code>brain_memories</code> — with confidence, importance, decay fields</li>
<li><code>brain_events</code> — event log for cognitive operations</li>
<li><code>system_config</code> — module configurations</li>
<li><code>defense_events</code> — threat detection log</li>
<li><code>ai_usage_log</code> — API metering</li>
<li><code>lovable_ai_usage</code> — budget tracking with daily quotas</li>
<li><code>agency_dream_memory</code> — dream synthesis outputs</li>
<li><code>agency_dream_consent</code> — pool participation consent</li>
<li><code>dream_rate_limits</code> — dream cycle rate limiting</li>
<li><code>dream_learning_metrics</code> — learning quality tracking</li>
</ol>

<h3>Database Functions Required</h3>
<ol>
<li><code>validate_evolution_phase_transition()</code> — enforce sequential phases</li>
<li><code>check_single_active_evolution()</code> — one active run at a time</li>
<li><code>calculate_memory_value()</code> — value score computation</li>
<li><code>increment_lovable_ai_usage()</code> — budget tracking</li>
<li><code>resolve_evolution_run()</code> — flexible run lookup</li>
<li><code>resolve_upgrade_plan_id()</code> — flexible plan lookup</li>
<li><code>increment_dream_rate_limit()</code> — dream cycle rate limiting</li>
<li><code>upsert_dream_learning_metrics()</code> — learning quality tracking</li>
</ol>

<h3>Edge Functions Required</h3>
<ol>
<li><code>pf-substrate</code> — main substrate endpoint handling all module commands</li>
</ol>

<h3>Client-Side Modules Required</h3>
<ol>
<li>Evolution engine UI (Dashboard tab)</li>
<li>Terminal with substrate commands</li>
<li>Health registry + telemetry aggregator</li>
<li>Truth verification engine</li>
<li>Defense site-guard (client-side bot detection)</li>
<li>Anomaly detector</li>
<li>Circuit breaker manager</li>
</ol>

<h3>Critical Algorithms (in order of importance)</h3>
<ol>
<li>Value Score Formula (§7.4)</li>
<li>Confidence Gating Thresholds (§7.3)</li>
<li>Memory Decay Rates (§7.1)</li>
<li>Risk Score Formula (§1.7)</li>
<li>Opportunity Score (§1.1)</li>
<li>CORTEX Scoring Matrix (§1.8)</li>
<li>Module Health Aggregation weights (§10.2)</li>
<li>Task Assignment Score (§10.3)</li>
<li>Reinforcement Formula (§7.2)</li>
<li>Dream Quality Gating (§8.1 — EVALUATE phase)</li>
</ol>

<hr />
<p><em>CMPSBL OS Substrate v10.8.0 — ARCHITECT Epoch — ULTRA-CRITICAL INTERNAL USE ONLY</em><br />
<em>Kenneth E Sweet Jr · PromptFluid®</em><br />
<em>ORCID: <a href="https://orcid.org/0009-0001-4237-1243">0009-0001-4237-1243</a> · DOI: <a href="https://doi.org/10.5281/zenodo.18234909">10.5281/zenodo.18234909</a></em><br />
<em>© 2025–2026 PromptFluid®. All rights reserved.</em></p>

</div>
</body>
</html>
