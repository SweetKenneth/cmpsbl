# INTENT — Goal Resolution & Action Planning

> **Node ID:** `intent` · **Sector:** Mesh Overlay · **Generation:** 2 · **Node #36 of 40**
> **Codename:** *Compass* · **Classification:** FOUNDER EYES ONLY

---

## Executive Summary

INTENT resolves high-level goals into actionable plans. It owns intent classification, goal decomposition, action sequencing, and execution orchestration. INTENT bridges the gap between "what the user wants" and "what the system does."

---

## Capabilities

| Capability | Description |
|---|---|
| `classifyIntent` | Determine the category and parameters of user intent |
| `decompose` | Break complex goals into atomic actions |
| `sequence` | Order actions with dependency awareness |
| `orchestrate` | Coordinate multi-node execution plans |

---

## Architecture

### Intent Resolution Pipeline

```
┌─────────────────────────────────────────────────────────┐
│                INTENT Resolution Pipeline                │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  User Input                                              │
│      │                                                   │
│      ▼                                                   │
│  ┌─────────────┐                                        │
│  │ Classifier  │ ← DECODE personality layer              │
│  └─────────────┘                                        │
│      │                                                   │
│      ▼                                                   │
│  ┌─────────────┐                                        │
│  │ Decomposer  │ → Atomic action list                   │
│  └─────────────┘                                        │
│      │                                                   │
│      ▼                                                   │
│  ┌─────────────┐                                        │
│  │ Sequencer   │ → Dependency-ordered DAG               │
│  └─────────────┘                                        │
│      │                                                   │
│      ▼                                                   │
│  ┌─────────────┐                                        │
│  │ Orchestrator│ → CORTEX execution                     │
│  └─────────────┘                                        │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### Intent Classification Model

```typescript
interface ClassifiedIntent {
  category: 'query' | 'command' | 'navigation' | 'creation' | 'modification' | 'deletion';
  confidence: number;           // 0-1
  entities: Entity[];           // Extracted entities
  parameters: Record<string, unknown>;
  ambiguities: Ambiguity[];     // Unclear aspects requiring clarification
}

interface Entity {
  type: string;                 // 'user', 'resource', 'date', etc.
  value: string;
  span: [number, number];       // Position in original input
  confidence: number;
}
```

### Goal Decomposition Algorithm

```
decompose(goal):
  1. Identify goal type
     - Simple: Single action (return immediately)
     - Compound: Multiple independent actions
     - Sequential: Dependent action chain
     - Conditional: Branching based on intermediate results
  
  2. Extract sub-goals
     For compound/sequential goals:
       - Identify logical boundaries
       - Determine dependencies between sub-goals
       - Assign each sub-goal to appropriate node
  
  3. Build dependency graph
     - Nodes = atomic actions
     - Edges = "must complete before" relationships
  
  4. Return: ActionPlan with DAG structure
```

---

## Trade Secrets

### 1. Ambiguity Surfacing

Rather than guessing on ambiguous inputs, INTENT explicitly surfaces ambiguities:

```typescript
interface Ambiguity {
  aspect: string;               // What's unclear
  options: string[];            // Possible interpretations
  defaultChoice: number;        // Best guess index
  confidence: number;           // How sure we are of default
}
```

If ambiguity confidence < 0.7, INTENT requests clarification before proceeding.

### 2. Parallel Execution Detection

INTENT identifies independent sub-goals that can execute in parallel:

```
detectParallelism(actionPlan):
  1. Topological sort of action DAG
  2. Identify actions with no mutual dependencies
  3. Group into parallel execution sets
  4. Return: execution schedule with parallelism hints
```

### 3. Rollback Planning

Every action plan includes a rollback strategy:

```typescript
interface ActionPlan {
  actions: Action[];
  rollback: RollbackStrategy;   // How to undo if failure
}

type RollbackStrategy = 
  | { type: 'compensating'; actions: Action[] }  // Run reverse actions
  | { type: 'checkpoint'; restorePoint: string } // Restore from snapshot
  | { type: 'none' }                              // Idempotent, no rollback needed
```

---

## CLM Insights

| Insight | Threshold | Severity |
|---|---|---|
| `low_classification_confidence` | Avg < 0.7 | Medium |
| `high_ambiguity_rate` | >30% require clarification | Medium |
| `decomposition_depth` | >5 levels deep | Low |
| `parallelism_missed` | Independent actions run sequentially | Low |

---

## Integration with DECODE

INTENT works closely with DECODE:

```
DECODE (understands natural language)
    │
    ▼
INTENT (resolves to actionable plan)
    │
    ▼
CORTEX (executes the plan)
```

DECODE provides the semantic understanding; INTENT provides the action planning.

---

## CLM Learning Priorities

1. **Intent Pattern Recognition** — Learning common intent patterns for faster classification
2. **Optimal Decomposition Granularity** — Finding the right action size for efficient execution

---

*CMPSBL® Substrate — INTENT Node Deep Dive · Founder Eyes Only*
