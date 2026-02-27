# Knowledge Distillation Engine

**Substrate Layer:** Intelligence · Brain  
**Budget:** 1,500 AI calls/day  
**Schedule:** Every 4 hours (3 staggered passes per cycle, 6 cycles/day = 18 passes)

---

## Overview

The Knowledge Distillation Engine accelerates BRAIN training by compressing accumulated memories, extracting reasoning patterns from high-tier models, and generalizing domain-specific learnings across modules. It operates as an autonomous background process, converting raw experiential data into dense, reusable knowledge artifacts.

---

## Three Distillation Techniques

### 1. Memory Crystallization (40% budget — 600 calls/day)

**Purpose:** Compress clusters of related memories into dense "Knowledge Crystals."

| Property | Value |
|----------|-------|
| Teacher Model | `google/gemini-2.5-pro` |
| Student Model | `google/gemini-2.5-flash-lite` |
| Input | Hot/Warm/Cold memory clusters |
| Output | `brain_knowledge_crystals` records |
| Compression Target | 5:1 minimum ratio |

**Process:**
1. Identify memory clusters by module, context, and semantic similarity
2. Teacher model analyzes cluster and distills into a single dense crystal
3. Crystal is tagged with source references, confidence, and domain
4. Original memories remain intact — crystals serve as fast-lookup summaries

### 2. Teacher-Student Routing (33% budget — 500 calls/day)

**Purpose:** Capture pro-model reasoning traces and distill into compact patterns for fast models.

| Property | Value |
|----------|-------|
| Teacher Model | `google/gemini-2.5-pro` |
| Student Model | `google/gemini-2.5-flash-lite` |
| Input | Complex reasoning prompts from substrate operations |
| Output | `brain_reasoning_traces` records |
| Goal | Token savings >40% on repeated reasoning patterns |

**Process:**
1. Teacher model processes a complex reasoning chain (decision trees, pattern matching)
2. Reasoning trace is captured with full prompt-response pair
3. Distilled pattern is extracted — compact enough for the student model to apply directly
4. On subsequent similar queries, student model uses the distilled pattern instead of invoking the teacher

### 3. Cross-Module Transfer (27% budget — 400 calls/day)

**Purpose:** Generalize domain-specific learnings into heuristics shareable across modules.

| Property | Value |
|----------|-------|
| Teacher Model | `google/gemini-2.5-pro` |
| Student Model | `google/gemini-2.5-flash-lite` |
| Input | Module-specific learnings and success patterns |
| Output | `brain_transfer_heuristics` records |
| Goal | Prevent knowledge siloing between modules |

**Process:**
1. Analyze high-confidence learnings from a source module
2. Teacher model generalizes the domain-specific insight into a transferable heuristic
3. Heuristic is scored for applicability across target modules
4. Applied to target modules with success tracking

---

## Database Schema

| Table | Purpose |
|-------|---------|
| `brain_knowledge_crystals` | Compressed memory summaries with source references |
| `brain_reasoning_traces` | Teacher reasoning chains distilled into student patterns |
| `brain_transfer_heuristics` | Generalized cross-module heuristics |
| `brain_distillation_runs` | Run tracking, budget accounting, performance metrics |

---

## Cron Schedule

| Job | Technique | Schedule |
|-----|-----------|----------|
| `pf-distillation-engine-cycle` | Memory Crystallization | `:00` every 4h |
| `pf-distillation-teacher-student` | Teacher-Student Routing | `:15` every 4h |
| `pf-distillation-cross-module` | Cross-Module Transfer | `:30` every 4h |

Staggered by 15 minutes to avoid budget collisions and distribute load.

---

## Budget Governor Integration

The distillation engine respects the Cognitive Budget Governor. Each technique has a daily call ceiling:

```
crystallization:   600 calls/day
teacher_student:   500 calls/day
cross_module:      400 calls/day
────────────────────────────
total:           1,500 calls/day
```

Budget usage is tracked per-run in `brain_distillation_runs` and surfaced via the `status` action.

---

## Metrics & Observability

Each distillation run records:
- **Calls used** against daily budget
- **Crystals / traces / heuristics created**
- **Compression ratio** (average across crystals)
- **Confidence** (average across all outputs)
- **Duration** in milliseconds
- **Error state** with message if failed

---

## Relationship to Evolution Mesh

The Distillation Engine feeds directly into the Evolution Mesh's Knowledge Distillery:
- **Knowledge Crystals** inform executor training curricula
- **Reasoning Traces** accelerate executor decision-making on familiar patterns
- **Transfer Heuristics** prevent knowledge siloing between specialty domains

This creates a feedback loop: Evolution generates experiences → Distillation compresses them → Executors train faster → Evolution produces higher-quality mutations.

---

*CMPSBL OS Substrate — Knowledge Distillation Engine*  
*© 2025-2026 PromptFluid®. All rights reserved.*
