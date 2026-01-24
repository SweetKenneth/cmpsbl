# CodeAgent Deep Dive — The Self-Evolving Coding Engine

> **Document Version:** v3.0.0  
> **Last Updated:** 2026-01-24  
> **Classification:** Internal Technical Reference

---

## Table of Contents

1. [What is the CodeAgent?](#what-is-the-codeagent)
2. [Why Does It Exist?](#why-does-it-exist)
3. [Architecture Overview](#architecture-overview)
4. [The 6-Stage Workflow](#the-6-stage-workflow)
5. [Learning & Memory System](#learning--memory-system)
6. [Intelligence Modules](#intelligence-modules)
7. [Deployment Pipeline](#deployment-pipeline)
8. [Circuit Breakers & Resilience](#circuit-breakers--resilience)
9. [Integration Points](#integration-points)
10. [Monitoring & Health](#monitoring--health)
11. [Technical Reference](#technical-reference)

---

## What is the CodeAgent?

The **CodeAgent** is the Substrate's autonomous coding engine. It writes, validates, and deploys code changes to improve itself—without human intervention. Think of it as a programmer that:

- **Never sleeps** — runs 24/7 learning cycles
- **Never forgets** — every success and failure is recorded
- **Gets smarter** — uses past outcomes to improve future decisions
- **Can undo mistakes** — full rollback capability for any change

### Plain English Version

Imagine you hired a junior developer who works around the clock. Every time they write code, they remember what worked and what didn't. Over time, they become an expert on YOUR specific system. That's CodeAgent.

---

## Why Does It Exist?

Traditional AI coding assistants have a critical flaw: **they forget everything between sessions**. They:

- Make the same mistakes repeatedly
- Don't learn from your codebase patterns
- Can't improve themselves
- Require constant human oversight

CodeAgent solves this through **persistent learning**:

| Traditional AI | CodeAgent |
|---------------|-----------|
| Stateless (forgets) | Stateful (remembers) |
| Generic patterns | Your-codebase patterns |
| Human-initiated | Autonomous + Human |
| No rollback | Full rollback history |
| No self-improvement | Continuous self-improvement |

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        CODEAGENT v3.0.0                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────────────────┐ │
│  │  WORKFLOW   │  │   LEARNING   │  │    INTELLIGENCE        │ │
│  │   ENGINE    │◄─┤    ENGINE    │◄─┤      MODULES           │ │
│  │             │  │              │  │                        │ │
│  │ • Discuss   │  │ • Outcomes   │  │ • AST Analyzer         │ │
│  │ • Read      │  │ • Patterns   │  │ • Dependency Graph     │ │
│  │ • Think     │  │ • Errors     │  │ • Test Generator       │ │
│  │ • Write     │  │ • Heuristics │  │ • Style Enforcer       │ │
│  │ • Confirm   │  │              │  │ • Performance Check    │ │
│  │ • Deploy    │  │              │  │ • Multi-Project Sync   │ │
│  └──────┬──────┘  └──────┬───────┘  └────────────────────────┘ │
│         │                │                                      │
│         ▼                ▼                                      │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                    BRAIN MEMORY LAYER                       ││
│  │                                                             ││
│  │   brain_memories ◄─► brain_events ◄─► learning_patterns    ││
│  │         ▲                 ▲                   ▲             ││
│  │         │                 │                   │             ││
│  │   Hot Memory         Events Log         Pattern Store       ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                 │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                    RESILIENCE LAYER                         ││
│  │                                                             ││
│  │   Circuit Breakers ─► Rollback System ─► Shadow Mode        ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Layer Breakdown

1. **Workflow Engine** — Orchestrates the 6-stage coding process
2. **Learning Engine** — Persists outcomes and retrieves patterns
3. **Intelligence Modules** — AST analysis, testing, style checking
4. **Brain Memory Layer** — Long-term storage for learned knowledge
5. **Resilience Layer** — Circuit breakers, rollback, failsafes

---

## The 6-Stage Workflow

CodeAgent follows a strict workflow modeled after expert human developers:

### Stage 1: DISCUSS 💬
**Purpose:** Clarify requirements before writing code

- Parses user intent (what module? what change type?)
- Asks clarifying questions when ambiguous
- Shows impact preview before proceeding
- Gets approval for high-risk changes

```typescript
// Example: Intent parsing
{
  module: 'brain',
  changeType: 'edge_function',
  complexity: 'medium',
  riskLevel: 'low'
}
```

### Stage 2: READ 📖
**Purpose:** Gather context before writing

- Identifies related files
- Checks dependencies
- Queries Brain for relevant knowledge
- Loads existing code for context

```typescript
// Related files detected
[
  'src/lib/substrate.ts',
  'src/hooks/useSubstrate.ts',
  'supabase/functions/pf-substrate/index.ts'
]
```

### Stage 3: THINK 🧠
**Purpose:** Analyze impact and plan changes

- Calculates blast radius (what could break?)
- Identifies risks
- Selects appropriate patterns
- Runs pre-flight assessment

```typescript
// Risk assessment
{
  impactedModules: ['brain', 'substrate'],
  risks: ['Brain module changes may affect learning'],
  patterns: ['cors-headers', 'error-handling']
}
```

### Stage 4: WRITE ✍️
**Purpose:** Generate the actual code

- Uses templates for consistency
- Applies learned patterns
- Follows style guide
- Includes error handling by default

### Stage 5: CONFIRM ✅
**Purpose:** Validate before deployment

- Syntax validation
- AST analysis
- Style checking
- Performance heuristics
- Security patterns check

### Stage 6: DEPLOY 🚀
**Purpose:** Apply changes safely

- Records rollback point
- Runs deployment pipeline
- Logs outcome
- **Triggers learning cycle**

---

## Learning & Memory System

This is what makes CodeAgent truly unique. Every action feeds the learning loop:

### How Learning Works

```
┌────────────────────────────────────────────────────────────────┐
│                   24/7 LEARNING CYCLE                          │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│   1. CODE ACTION                                               │
│      │                                                         │
│      ▼                                                         │
│   2. OUTCOME RECORDED ─────────┐                               │
│      │                         │                               │
│      │ success ───► brain_memories (confidence ↑)              │
│      │ failure ───► error_patterns (resolution stored)         │
│      │ rollback ──► rollback_history (prevention rule)         │
│      │                                                         │
│      ▼                         │                               │
│   3. PATTERN EXTRACTION ◄──────┘                               │
│      │                                                         │
│      │ • What code patterns succeeded?                         │
│      │ • What error signatures appeared?                       │
│      │ • What style rules were enforced?                       │
│      │                                                         │
│      ▼                                                         │
│   4. KNOWLEDGE UPDATE                                          │
│      │                                                         │
│      │ • learning_patterns table updated                       │
│      │ • Confidence scores adjusted                            │
│      │ • Recommendations generated                             │
│      │                                                         │
│      ▼                                                         │
│   5. NEXT ACTION (smarter)                                     │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

### Learning Storage

| Table | Purpose | TTL |
|-------|---------|-----|
| `brain_memories` | Core knowledge, patterns | Permanent |
| `brain_memory_hot` | Active, high-priority insights | 7 days |
| `learning_patterns` | Extracted patterns with confidence | Permanent |
| `brain_events` | Event log for learning triggers | 30 days |
| `codeagent_outcomes` | Success/failure outcomes | Permanent |

### The Learning Engine (`learning-engine.ts`)

```typescript
// Every code action triggers learning
async function learnFromCodeAction(action: CodeAction): Promise<void> {
  // 1. Record the outcome
  await recordOutcome(action);
  
  // 2. Extract patterns from success/failure
  const patterns = await extractPatterns(action);
  
  // 3. Update confidence scores
  await updateConfidence(patterns);
  
  // 4. Store for future retrieval
  await persistLearning(patterns);
  
  // 5. Log for analytics
  await logLearningEvent(action, patterns);
}
```

### Continuous Improvement

The system runs autonomous learning cycles:

- **Every 15 minutes:** Process recent outcomes
- **Every 6 hours:** Synthesize knowledge clusters
- **Every 24 hours:** Deep reflection and consolidation
- **On demand:** User-triggered learning cycles

---

## Intelligence Modules

CodeAgent v3.0 includes 8 intelligence modules:

### 1. AST Analyzer (`ast-analyzer.ts`)
Parses TypeScript into Abstract Syntax Trees for:
- Function detection
- Export analysis
- Type compatibility checking
- Complexity metrics

### 2. Dependency Graph (`dependency-graph.ts`)
Maps project architecture:
- Import/export relationships
- Circular dependency detection
- Impact analysis for changes

### 3. Test Generator (`test-generator.ts`)
Creates test suites automatically:
- Vitest templates
- Hook testing patterns
- Component test scaffolds

### 4. Error Patterns (`error-patterns.ts`)
Learns from failures:
- Stack signature normalization
- Resolution matching
- Prevention rule generation

### 5. Style Enforcer (`style-enforcer.ts`)
Ensures code consistency:
- PascalCase components
- Import ordering
- Complexity limits
- Naming conventions

### 6. Performance Heuristics (`performance-heuristics.ts`)
Detects anti-patterns:
- Unmemoized callbacks in loops
- Heavy imports
- Missing React.memo
- Inline object creation in renders

### 7. Multi-Project Sync (`multi-project.ts`)
Cross-project learning:
- Pattern sharing
- Knowledge synchronization
- Success rate tracking

### 8. PR Queue (`pr-queue.ts`)
Patch management:
- Unified diff generation
- Approval workflows
- Change queuing

---

## Deployment Pipeline

6-stage validation before any code goes live:

```
┌──────┐   ┌──────┐   ┌───────┐   ┌──────┐   ┌──────────┐   ┌────────┐
│Syntax│──►│ AST  │──►│ Style │──►│ Perf │──►│ Security │──►│ Deploy │
│Check │   │Verify│   │ Check │   │Check │   │  Audit   │   │        │
└──────┘   └──────┘   └───────┘   └──────┘   └──────────┘   └────────┘
   ▲                                                              │
   │                                                              │
   └──────────────── Rollback on failure ◄────────────────────────┘
```

### Stage Details

1. **Syntax** — TypeScript compilation check
2. **AST** — Structure validation, no dangling exports
3. **Style** — Naming, imports, complexity
4. **Performance** — React best practices
5. **Security** — Forbidden patterns, auth checks
6. **Deploy** — Apply with rollback point

---

## Circuit Breakers & Resilience

CodeAgent won't fail catastrophically:

### Circuit Breaker Pattern

```typescript
// 3 failures = circuit opens for 60 seconds
if (failures >= 3) {
  circuitState = 'open';
  setTimeout(() => circuitState = 'half-open', 60000);
}
```

### Rollback System

Every change is recorded for instant reversal:

```typescript
interface ChangeRecord {
  id: string;
  beforeState: string;
  afterState: string;
  appliedAt: Date;
  canRollback: boolean;
}
```

### Shadow Mode

When edge functions are unavailable, CodeAgent uses in-browser templates to continue operating.

---

## Integration Points

### Brain Module
- Stores learned patterns
- Retrieves relevant knowledge
- Hot memory for active insights

### Modernizer Module
- Triggers CodeAgent for auto-improvements
- Feeds scan results for learning
- Uses CodeAgent for headless deployments

### Nexus Module
- Routes AI calls through free-tier optimization
- Logs usage for learning analytics

### Vision Module
- Displays CodeAgent health metrics
- Shows learning progress
- Circuit breaker status

---

## Monitoring & Health

### Health Metrics

| Metric | Healthy | Degraded | Down |
|--------|---------|----------|------|
| Coder Service | >80% | 50-80% | <50% |
| Sandbox Service | >80% | 50-80% | <50% |
| Brain Service | >80% | 50-80% | <50% |
| Learning Rate | >10/day | 5-10/day | <5/day |

### Observable via Terminal

```bash
# Check CodeAgent status
codeagent.status

# View learning metrics
codeagent.learning

# Force learning cycle
codeagent.learn

# Reset circuits
codeagent.reset
```

---

## Technical Reference

### Key Files

| File | Purpose |
|------|---------|
| `src/lib/codeagent/executor.ts` | Main execution orchestration |
| `src/lib/codeagent/workflow.ts` | 6-stage workflow engine |
| `src/lib/codeagent/learning-engine.ts` | 24/7 learning system |
| `src/lib/codeagent/circuit-breaker.ts` | Resilience patterns |
| `src/lib/codeagent/rollback.ts` | Change history & reversal |
| `src/lib/codeagent/shadow-mode.ts` | Offline capability |
| `src/lib/codeagent/discussion.ts` | Pre-coding clarification |
| `src/lib/codeagent/pr-queue.ts` | Patch management |
| `src/lib/codeagent/deploy-pipeline.ts` | 6-stage deploy |
| `src/components/substrate-os/CodeAgentTab.tsx` | UI interface |

### Database Tables

```sql
-- Core learning storage
brain_memories (content, memory_type, confidence, metadata)
brain_events (event_type, module, data, outcome)
learning_patterns (pattern_name, confidence, recommendations)
codeagent_outcomes (action_type, outcome, code_hash, learned_at)
```

### Environment Variables

None required — CodeAgent uses the Substrate's Brain and Nexus for AI calls.

---

## Summary

The CodeAgent is the Substrate's self-improvement engine. Unlike traditional AI assistants that forget everything, CodeAgent:

1. **Learns continuously** from every action
2. **Gets smarter** over time with your specific codebase
3. **Never breaks** thanks to circuit breakers and rollback
4. **Works autonomously** while still allowing human oversight

It represents the core of the Substrate's ability to **evolve itself** without constant human intervention.

---

*For questions about CodeAgent integration, see the [Modernizer Complete Guide](./15-MODERNIZER-COMPLETE-GUIDE.md) or reach out to the Substrate team.*
