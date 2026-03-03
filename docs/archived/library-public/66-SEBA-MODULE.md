# 66. Self-Evolving Bounded Agent (SEBA)

**CMPSBL OS Substrate — v1.0.0 Module Documentation**

---

## Document Metadata

| Field | Value |
|-------|-------|
| **Module Name** | Self-Evolving Bounded Agent (SEBA) |
| **Module Code** | SEBA |
| **Version** | v1.0.0 |
| **Status** | Production |
| **Classification** | Bounded Autonomy Framework |
| **Release Date** | February 2026 |

---

## Executive Summary

The **Self-Evolving Bounded Agent (SEBA)** represents the culmination of the substrate's cognitive architecture—a framework for genuine bounded autonomy that combines full cognitive analysis with evolution and governance systems.

SEBA implements a 5-phase cognitive-evolution pipeline:

1. **Cognizing** — Analyzes Memory, Learning, Imagination, and Reasoning for insights
2. **Proposing** — Maps insights to structured improvement proposals
3. **Evaluating** — Assesses risk and impact of proposed changes
4. **Gating** — Governance Guard evaluates safety and coherence
5. **Applying** — Executes approved evolutions with rollback capability

The result is an agent that can **autonomously propose and apply its own architectural improvements**, strictly bounded by governance constraints to ensure safety and coherence.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    SEBA PIPELINE (5-Phase Lifecycle)                    │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│   ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────┐ │
│   │ COGNIZE  │──▶│ PROPOSE  │──▶│ EVALUATE │──▶│   GATE   │──▶│APPLY │ │
│   └──────────┘   └──────────┘   └──────────┘   └──────────┘   └──────┘ │
│        │                                            │            │      │
│        ▼                                            ▼            ▼      │
│   ┌─────────────────────┐                    ┌───────────┐  ┌───────┐  │
│   │   Cognitive Layer   │                    │ Governance│  │Verify │  │
│   │  • Memory Core      │                    │   Guard   │  │  +    │  │
│   │  • Learning Engine  │                    │           │  │Rollback│  │
│   │  • Imagination      │                    │ Coherence │  │       │  │
│   │  • Reasoning Engine │                    │ + Ethics  │  └───────┘  │
│   └─────────────────────┘                    └───────────┘             │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Operating Modes

SEBA operates in five distinct modes, providing granular control over autonomy:

| Mode | Behavior | Use Case |
|------|----------|----------|
| **off** | SEBA is completely disabled | Maintenance, debugging |
| **observe** | Analyzes and logs, no proposals generated | Monitoring only |
| **advisory** | Generates proposals, requires human approval | Default safe mode |
| **governed** | Auto-executes if confidence ≥ threshold AND risk ≤ tolerance | Production autonomy |
| **autonomous** | Full autonomy within governance bounds | Requires explicit unlock |

### Mode Progression

```
off ──▶ observe ──▶ advisory ──▶ governed ──▶ autonomous
                                                   ▲
                                                   │
                                          Requires explicit
                                          unlock command
```

---

## Phase 1: Cognitive Analysis

The **Cognitive Analyzer** queries all cognitive engines to extract actionable insights.

### Insight Types

| Type | Source | Description |
|------|--------|-------------|
| `pattern` | Imagination | Recurring behavioral patterns detected |
| `anomaly` | Vision/Reasoning | Deviation from expected behavior |
| `opportunity` | Learning | Optimization opportunity identified |
| `degradation` | Memory/Learning | Performance degradation detected |
| `optimization` | All | Concrete improvement suggestion |

### Example Insight

```typescript
{
  id: "insight_abc123",
  type: "optimization",
  source_engine: "memory",
  title: "Memory consolidation efficiency low",
  description: "Short-term to long-term conversion rate is 23%, below target of 40%",
  evidence: [
    "Retention score dropped 12% over 7 days",
    "128 memories failed reinforcement threshold"
  ],
  confidence: 0.82,
  actionability: 0.91,
  urgency: "medium"
}
```

---

## Phase 2: Proposal Generation

The **Proposal Generator** transforms insights into structured improvement proposals.

### Improvement Categories

| Category | Description |
|----------|-------------|
| `memory_optimization` | Memory lifecycle improvements |
| `learning_enhancement` | Learning rate and feedback tuning |
| `reasoning_upgrade` | Causal mapping and hypothesis improvements |
| `governance_refinement` | Governance threshold adjustments |
| `performance_boost` | General performance optimizations |
| `error_recovery` | Automatic error pattern correction |
| `pattern_discovery` | New pattern recognition rules |
| `architecture_evolution` | Structural changes (high risk) |

### Proposal Structure

```typescript
interface ImprovementProposal {
  id: string;
  short_id: string;           // Human-readable ID (e.g., "SEBA-001")
  
  category: ImprovementCategory;
  title: string;
  description: string;
  rationale: string;
  
  target_modules: string[];
  estimated_impact: 'low' | 'medium' | 'high';
  risk_level: RiskLevel;
  confidence_score: number;   // 0-1
  
  proposed_actions: ProposedAction[];
  rollback_strategy: string;
  
  requires_human_approval: boolean;
}
```

---

## Phase 3: Risk Evaluation

Each proposal undergoes rigorous risk assessment.

### Risk Levels

| Level | Threshold | Auto-Execute | Description |
|-------|-----------|--------------|-------------|
| `minimal` | < 0.1 | ✅ Yes | Trivial config changes |
| `low` | 0.1-0.3 | ✅ Yes | Safe parameter adjustments |
| `medium` | 0.3-0.5 | ⚠️ Conditional | Requires high confidence |
| `high` | 0.5-0.7 | ❌ No | Requires human approval |
| `critical` | > 0.7 | ❌ No | Manual execution only |

### Risk Calculation

```
risk_score = base_risk 
           × action_count_factor 
           × (1 + reversibility_penalty)
           × module_sensitivity_weight
```

---

## Phase 4: Governance Gating

The **Governance Gate** integrates with the substrate's Governance Guard to ensure safety.

### Decision Types

| Decision | Meaning | Next Step |
|----------|---------|-----------|
| `approve` | Safe to execute | Proceed to Apply |
| `approve_with_conditions` | Safe with modifications | Apply modified version |
| `defer` | Insufficient data | Re-evaluate later |
| `reject` | Violates governance | Discard proposal |
| `escalate` | Requires human decision | Await approval |

### Auto-Execute Conditions

For a proposal to auto-execute, ALL conditions must be true:

1. ✅ `confidence_score >= auto_approve_threshold` (default: 0.85)
2. ✅ `risk_level <= risk_tolerance` (default: 'low')
3. ✅ Governance decision is `approve`
4. ✅ Mode is `governed` or `autonomous`
5. ✅ No active execution in progress
6. ✅ Daily execution limit not exceeded

---

## Phase 5: Evolution Execution

The **Evolution Executor** applies approved changes with full rollback capability.

### Execution Phases

```
shadow ──▶ production ──▶ verified
   │            │
   │            └──▶ rolled_back (if health drops)
   │
   └──▶ aborted (if shadow fails)
```

### Shadow Testing

Before production application, changes are tested in isolation:

1. Clone current state
2. Apply proposed actions
3. Run health checks
4. Compare metrics
5. If healthy, proceed to production

### Rollback Triggers

Automatic rollback occurs if:

- Health delta drops below -10 points
- Any action fails during application
- Verification checks fail
- Manual rollback requested

---

## Terminal Commands

SEBA provides a comprehensive terminal command set:

### Status & Control

| Command | Description | Example |
|---------|-------------|---------|
| `seba.status` | Show current state and mode | `seba.status` |
| `seba.enable` | Enable SEBA | `seba.enable` |
| `seba.disable` | Disable SEBA | `seba.disable` |
| `seba.mode` | Get/set operating mode | `seba.mode governed` |

### Cycle Operations

| Command | Description | Example |
|---------|-------------|---------|
| `seba.cycle` | Run complete SEBA cycle | `seba.cycle` |
| `seba.propose` | Generate proposals only | `seba.propose` |
| `seba.review` | View pending proposals | `seba.review` |

### Proposal Management

| Command | Description | Example |
|---------|-------------|---------|
| `seba.approve <id>` | Approve a proposal | `seba.approve SEBA-001` |
| `seba.reject <id>` | Reject a proposal | `seba.reject SEBA-001` |
| `seba.execute <id>` | Execute approved proposal | `seba.execute SEBA-001` |
| `seba.rollback <id>` | Rollback execution | `seba.rollback exec_abc` |

### Configuration

| Command | Description | Example |
|---------|-------------|---------|
| `seba.config` | View/update configuration | `seba.config` |
| `seba.thresholds` | Adjust safety thresholds | `seba.thresholds auto_approve 0.9` |
| `seba.history` | View evolution history | `seba.history 20` |

### Command Aliases

For faster terminal access:

| Alias | Expansion |
|-------|-----------|
| `ss` | `seba.status` |
| `sc` | `seba.cycle` |
| `sm` | `seba.mode` |
| `sp` | `seba.propose` |
| `sr` | `seba.review` |
| `sh` | `seba.history` |

---

## React Integration

SEBA provides comprehensive React hooks for UI integration.

### Basic Usage

```typescript
import { useSEBA } from '@/hooks/useSEBA';

function SEBADashboard() {
  const { 
    state, 
    runCycle, 
    isCycleRunning,
    mode,
    approve,
    reject 
  } = useSEBA();

  return (
    <div>
      <p>Mode: {mode}</p>
      <p>Phase: {state?.current_phase}</p>
      <p>Cycles: {state?.total_cycles}</p>
      
      <button onClick={runCycle} disabled={isCycleRunning}>
        {isCycleRunning ? 'Running...' : 'Run Cycle'}
      </button>
    </div>
  );
}
```

### Available Hooks

| Hook | Purpose |
|------|---------|
| `useSEBA()` | Comprehensive hook with all operations |
| `useSEBAState()` | Agent state only |
| `useSEBAConfig()` | Configuration only |
| `useSEBACycle()` | Cycle execution |
| `useSEBACommand()` | Generic command execution |
| `useSEBAPropose()` | Proposal generation |
| `useSEBAReview()` | Pending proposals |
| `useSEBADecision()` | Approve/reject operations |
| `useSEBAExecute()` | Execute proposals |
| `useSEBARollback()` | Rollback executions |
| `useSEBAHistory()` | Evolution history |

---

## Configuration

### Default Configuration

```typescript
{
  mode: 'advisory',
  enabled: true,
  
  auto_approve_threshold: 0.85,    // Minimum confidence for auto-approval
  risk_tolerance: 'low',           // Maximum risk for auto-execution
  min_confidence_for_proposal: 0.6,
  
  max_proposals_per_cycle: 3,
  max_executions_per_day: 10,
  cooldown_after_failure_ms: 300000, // 5 minutes
  
  require_human_approval_for_high_risk: true,
  log_all_proposals: true,
  
  enabled_categories: [
    'memory_optimization',
    'learning_enhancement',
    'performance_boost',
    'error_recovery',
  ],
  excluded_modules: [],
}
```

### Configuration Updates

```typescript
// Via terminal
seba.config auto_approve_threshold=0.9

// Via React hook
const { updateConfig } = useSEBA();
await updateConfig({ auto_approve_threshold: 0.9 });
```

---

## Safety Guarantees

SEBA is designed with multiple safety layers:

### 1. Mode Restrictions

- **Autonomous mode** requires explicit unlock
- Default mode is **advisory** (human approval required)

### 2. Governance Integration

- All proposals pass through the Governance Guard
- Ethical and coherence checks are mandatory
- High-risk proposals always require human approval

### 3. Execution Safety

- Shadow testing before production
- Automatic rollback on health degradation
- Daily execution limits enforced

### 4. Audit Trail

- Every action is logged with full context
- Audit entries include phase, action, details, and outcome
- Complete lineage from insight to execution

---

## Audit Trail Structure

```typescript
interface SEBAAuditEntry {
  timestamp: string;
  phase: SEBAPhase;
  action: string;
  details: Record<string, unknown>;
  outcome: 'success' | 'warning' | 'error' | 'blocked';
}
```

### Example Audit Log

```json
[
  {
    "timestamp": "2026-02-01T10:00:00Z",
    "phase": "cognizing",
    "action": "Cycle started",
    "details": { "cycle_id": "abc-123" },
    "outcome": "success"
  },
  {
    "timestamp": "2026-02-01T10:00:01Z",
    "phase": "cognizing",
    "action": "Cognitive analysis complete",
    "details": { "insights_found": 3 },
    "outcome": "success"
  },
  {
    "timestamp": "2026-02-01T10:00:02Z",
    "phase": "proposing",
    "action": "Proposals generated",
    "details": { "proposals_count": 2 },
    "outcome": "success"
  },
  {
    "timestamp": "2026-02-01T10:00:03Z",
    "phase": "gating",
    "action": "Governance decision",
    "details": { "proposal_id": "SEBA-001", "decision": "approve" },
    "outcome": "success"
  }
]
```

---

## Performance Characteristics

| Metric | Typical Value | Notes |
|--------|---------------|-------|
| Cognitive analysis | 100-500ms | Depends on data volume |
| Proposal generation | 50-200ms | Per insight |
| Governance evaluation | 20-100ms | Per proposal |
| Shadow execution | 200-1000ms | Depends on actions |
| Production execution | 100-500ms | Per action |
| Full cycle | 500-3000ms | End-to-end |

---

## Best Practices

### 1. Start in Advisory Mode

Begin with `advisory` mode to understand what SEBA proposes before enabling auto-execution.

### 2. Review Proposals Regularly

Even in governed mode, periodically review the history to understand evolution patterns.

### 3. Tune Thresholds Gradually

Start with conservative thresholds and adjust based on observed behavior:

```bash
# Start conservative
seba.thresholds auto_approve 0.9
seba.thresholds risk low

# After confidence builds
seba.thresholds auto_approve 0.85
seba.thresholds risk medium
```

### 4. Monitor Health Delta

Watch the health delta in execution results—negative trends indicate problems.

### 5. Use Rollback Liberally

When in doubt, rollback. SEBA maintains full state snapshots for safe recovery.

---

## Integration with Other Modules

SEBA integrates deeply with the substrate:

| Module | Integration |
|--------|-------------|
| **BRAIN** | Memory Core, Learning Engine, Reasoning Engine queries |
| **MODERNIZER** | Evolution lifecycle coordination |
| **VISION** | Health metrics and observability |
| **GOVERNANCE** | Safety and coherence gating |
| **TELEMETRY** | Audit trail and event logging |
| **CLM** | Continuous learning coordination |

---

## Comparison: SEBA vs MODERNIZER

| Feature | MODERNIZER | SEBA |
|---------|------------|------|
| **Focus** | Code/config evolution | Cognitive improvement |
| **Analysis** | Static analysis + LLM | Full cognitive pipeline |
| **Scope** | Infrastructure changes | Self-improvement |
| **Governance** | Circuit breaker | Full governance gate |
| **Autonomy** | 3 modes | 5 modes |
| **Rollback** | Plan-based | Action-level |

SEBA and MODERNIZER are complementary:
- MODERNIZER evolves the **infrastructure**
- SEBA evolves the **cognitive capabilities**

---

## Proposal Persistence

### Overview

SEBA proposals are persisted to the `evolution_proposals` database table, ensuring proposals survive restarts and can be reviewed through Atlas or terminal commands.

### Proposal Store

```typescript
import { ProposalStore } from '@/lib/substrate/seba';

// Save a proposal
await ProposalStore.save(proposal);

// Get pending proposals
const pending = await ProposalStore.getPending();

// Update proposal status
await ProposalStore.updateStatus('SEBA-001', 'approved');

// Get proposal by ID
const proposal = await ProposalStore.getById('SEBA-001');
```

### Proposal Lifecycle

```
┌────────────┐    ┌──────────┐    ┌──────────┐    ┌───────────┐
│  pending   │───▶│ approved │───▶│ executed │───▶│ verified  │
└────────────┘    └──────────┘    └──────────┘    └───────────┘
       │                │                │
       └────────────────┴────────────────┘
                        │
                  ┌─────┴─────┐
                  │  rejected │
                  └───────────┘
```

### Database Schema

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `short_id` | VARCHAR | Human-readable ID (e.g., SEBA-001) |
| `category` | VARCHAR | Improvement category |
| `title` | VARCHAR | Proposal title |
| `description` | TEXT | Full description |
| `status` | ENUM | pending/approved/rejected/executed/verified |
| `confidence_score` | FLOAT | 0-1 confidence |
| `risk_level` | VARCHAR | minimal/low/medium/high/critical |
| `proposed_actions` | JSONB | Array of proposed actions |
| `created_at` | TIMESTAMPTZ | Creation time |
| `updated_at` | TIMESTAMPTZ | Last update |

---

## Evolution Stamps (Traceability)

### Overview

Every code change applied by SEBA generates a cryptographically verifiable **Evolution Stamp**. This provides irrefutable proof that the substrate is modifying its own code.

### Stamp Structure

```typescript
interface EvolutionStamp {
  stamp_id: string;      // Unique stamp identifier
  proposal_id: string;   // Source proposal
  execution_id: string;  // Execution record
  files_modified: string[];
  change_hash: string;   // SHA-256 of changes
  applied_at: string;    // ISO timestamp
  applied_by: 'seba' | 'human';
}
```

### Mandatory Code Comments

When SEBA modifies code, it inserts a **mandatory traceability comment**:

```typescript
// [SEBA-EVOLUTION] stamp_id: SEBA-abc123-def456 | proposal: SEBA-001 | applied: 2026-02-02T12:00:00Z
```

This comment:
- **Cannot be removed** without triggering integrity alerts
- **Links back** to the original proposal and execution
- **Provides audit trail** for code archaeology

### Stamp Verification

```typescript
import { EvolutionStampStore } from '@/lib/substrate/seba';

// Verify a stamp exists
const isValid = await EvolutionStampStore.verify('SEBA-abc123-def456');

// Get all stamps for a proposal
const stamps = await EvolutionStampStore.getByProposal('SEBA-001');

// Get stamp by file
const fileStamps = await EvolutionStampStore.getByFile('src/lib/substrate/brain/memory-core.ts');
```

### Terminal Commands

| Command | Description |
|---------|-------------|
| `seba.stamps` | List recent evolution stamps |
| `seba.stamp <stamp_id>` | View stamp details |
| `seba.verify <stamp_id>` | Verify stamp integrity |
| `seba.stamps --proposal <id>` | List stamps for proposal |
| `seba.stamps --file <path>` | List stamps for file |

### Database Storage

Stamps are logged to `brain_events` with:

```json
{
  "module": "seba",
  "event_type": "evolution_stamp",
  "data": {
    "stamp_id": "SEBA-abc123-def456",
    "proposal_id": "SEBA-001",
    "execution_id": "exec-789",
    "change_hash": "sha256:abcd1234...",
    "files_modified": ["src/lib/substrate/brain/memory-core.ts"]
  },
  "outcome": "success"
}
```

### Observability Integration

Evolution stamps integrate with the VISION module for real-time observability:

- Stamps appear in the System Intelligence Feed
- Health dashboards show evolution activity
- Alerts trigger on stamp verification failures

---

## Future Roadmap

### v1.1.0 (Planned)
- Multi-agent coordination
- Cross-instance learning
- Proposal voting mechanisms

### v1.2.0 (Planned)
- Predictive evolution
- Pattern library sharing
- External API hooks

---

## API Reference

### TypeScript Types

```typescript
// Core types
export type SEBAPhase = 'idle' | 'cognizing' | 'proposing' | 'evaluating' | 'gating' | 'applying' | 'verifying' | 'complete' | 'blocked' | 'failed';
export type SEBAMode = 'off' | 'observe' | 'advisory' | 'governed' | 'autonomous';
export type ImprovementCategory = 'memory_optimization' | 'learning_enhancement' | 'reasoning_upgrade' | 'governance_refinement' | 'performance_boost' | 'error_recovery' | 'pattern_discovery' | 'architecture_evolution';
export type RiskLevel = 'minimal' | 'low' | 'medium' | 'high' | 'critical';

// Main interfaces
export interface SEBAState { ... }
export interface SEBACycleResult { ... }
export interface ImprovementProposal { ... }
export interface GovernanceDecision { ... }
export interface EvolutionExecution { ... }
export interface SEBAConfig { ... }
```

### Imports

```typescript
import { 
  sebaAgent,
  SEBAAgent,
  CognitiveAnalyzer,
  ProposalGenerator,
  GovernanceGate,
  EvolutionExecutor,
  DEFAULT_SEBA_CONFIG,
  type SEBAState,
  type SEBACycleResult,
  type ImprovementProposal,
} from '@/lib/substrate/seba';

import { useSEBA } from '@/hooks/useSEBA';
```

---

## Troubleshooting

### "SEBA is disabled"
Run `seba.enable` to activate the agent.

### "Mode is off"
Set a valid mode: `seba.mode advisory`

### "Autonomous mode requires unlock"
Autonomous mode is intentionally restricted. Use `governed` mode instead, which provides auto-execution within safety bounds.

### "Governance rejected proposal"
Check the rejection reasons in the audit log. Common causes:
- High risk level
- Low coherence score
- Ethical concerns

### "Rollback failed"
Rollback snapshots expire after 24 hours. For older executions, manual intervention is required.

---

*SEBA v1.0.0 — Self-Evolving Bounded Agent*
*The substrate that improves itself, safely.*

*© 2025-2026 PromptFluid®. All rights reserved.*
