<div align="center">

# Module 14 — CORTEX

### Meta-Orchestration and Proposal Evaluation

Layer 5 — Orchestrator

v9.3.0 ARCHITECT Epoch

</div>

---

## Purpose

CORTEX is the substrate's meta-orchestrator. It coordinates cross-module workflows, evaluates evolution proposals, manages synergy pipelines, and makes system-level decisions that no single module can make alone. If the substrate has a prefrontal cortex, this is it.

---

## Capabilities

| Capability | Description | Tier |
|-----------|-------------|------|
| Synergy Pipeline Execution | Orchestrate multi-module workflows | Free |
| Request Routing | Direct incoming requests to the appropriate module | Free |
| Proposal Evaluation | Risk-score and approve/reject evolution proposals | Pro |
| Pipeline Composition | Build custom synergy pipelines from capability catalog | Pro |
| Resource Allocation | Distribute processing capacity across competing requests | Enterprise |
| Priority Management | Dynamically adjust module priorities based on load | Enterprise |
| Session Reflection | Periodic review of all module activity to extract meta-insights | CMPSBL |
| Recursive Orchestration | Orchestration pipelines that optimize themselves | CMPSBL |
| Cognitive Coherence | Ensure all modules maintain consistent worldview | CMPSBL |

---

## Orchestration Architecture

```
                    Incoming Request
                          │
                          ▼
                  ┌───────────────┐
                  │    CORTEX      │
                  │   Classifier   │
                  └───────┬───────┘
                          │
            ┌─────────────┼─────────────┐
            │             │             │
            ▼             ▼             ▼
      Single Module   Synergy      System-Level
       Request       Pipeline      Operation
            │             │             │
            ▼             ▼             ▼
      Route to        Execute       Coordinate
      target module   pipeline      across layers
```

---

## Proposal Evaluation Framework

When MODERNIZER submits an evolution proposal, CORTEX evaluates it across five dimensions:

| Dimension | Weight | Description |
|-----------|--------|-------------|
| Safety | 0.30 | Can this change be fully reversed? What is the blast radius? |
| Impact | 0.25 | How much improvement does this deliver? |
| Coherence | 0.20 | Does this align with the substrate's current direction? |
| Complexity | 0.15 | How many modules and dependencies are affected? |
| Precedent | 0.10 | Have similar changes succeeded or failed before? |

Proposals scoring below 0.4 are rejected. Proposals between 0.4 and 0.7 require human approval. Proposals above 0.7 with low risk can be auto-approved (Enterprise tier and above).

---

## Synergy Pipeline Management

CORTEX manages the execution of synergy pipelines — multi-step workflows that chain capabilities across modules:

| Pipeline Phase | Responsibility |
|---------------|---------------|
| Intake | Validate pipeline definition and required capabilities |
| Planning | Determine execution order and parallelization opportunities |
| Execution | Run each step, passing outputs as inputs to the next |
| Monitoring | Track progress, latency, and cost per step |
| Completion | Aggregate results and emit completion event |
| Error Handling | Retry failed steps, skip optional steps, or abort pipeline |

---

## Session Reflection

CORTEX periodically (every 6 hours by default) performs a session reflection:

1. Collect activity summaries from all 21 modules
2. Identify cross-module patterns (e.g., BRAIN queries always followed by NEXUS calls)
3. Detect inefficiencies (e.g., redundant event emissions, unused capabilities)
4. Generate optimization suggestions for MODERNIZER
5. Update cognitive coherence model

---

## Integration with Other Modules

| Module | Integration |
|--------|------------|
| All 21 modules | Orchestrates cross-module workflows |
| MODERNIZER | Evaluates and authorizes evolution proposals |
| BRAIN | Stores orchestration patterns and reflection insights |
| DREAM | Receives creative pipeline suggestions from dream cycles |
| VISION | Provides performance data for orchestration optimization |
| RIPPLE | Emits `cortex.pipeline_started`, `cortex.reflection_complete` |
| AUDIT | Logs all orchestration decisions and proposal evaluations |

---

## Database Tables

| Table | Purpose |
|-------|---------|
| `cortex_pipelines` | Active and historical synergy pipeline definitions |
| `cortex_reflections` | Session reflection results and meta-insights |
| `cortex_evaluations` | Proposal evaluation scores and decisions |

---

<div align="center">

CMPSBL OS Substrate v9.3.0 — ARCHITECT Epoch

Kenneth E Sweet Jr · PromptFluid

ORCID: XXXX-XXXX-XXXX-XXXX · DOI: 10.5281/zenodo.XXXXXXX

© 2025–2026 PromptFluid. All rights reserved.

</div>
