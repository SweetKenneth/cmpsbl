# LNCHBL Tier Privilege Breakdown

**Reference Document for OS Dashboard & Engine Access Gating**
*CMPSBL → LNCHBL Mapping Guide*
*Date: 2026-02-24*

---

## Tier Mapping: CMPSBL ↔ LNCHBL

| CMPSBL Role   | LNCHBL Tier      | Price     | DB Role    |
|---------------|-------------------|-----------|------------|
| `free`        | Free (Starter)    | $0        | —          |
| `creator`     | Builder           | $49/mo    | `operator` |
| `architect`   | Pro               | $149/mo   | `moderator`|
| `governor`    | Enterprise        | $499/mo   | `admin`    |

**Hierarchy is inclusive**: Enterprise ⊇ Pro ⊇ Builder ⊇ Free.
A user at any tier inherits all privileges of tiers below.

---

## 1. OS Dashboard Sections

### 1.1 Dashboard Panels

| Panel / Section            | Free | Builder | Pro | Enterprise |
|---------------------------|------|---------|-----|------------|
| System Pulse (read-only)  | ✅   | ✅      | ✅  | ✅         |
| Module Status Grid        | ✅   | ✅      | ✅  | ✅         |
| Health Score Display       | ✅   | ✅      | ✅  | ✅         |
| Engine Bus Activity Feed   | ✅   | ✅      | ✅  | ✅         |
| Memory Tier Breakdown      | ❌   | ✅      | ✅  | ✅         |
| Telemetry Engine Metrics   | ❌   | ✅      | ✅  | ✅         |
| Cost Attribution Panel     | ❌   | ✅      | ✅  | ✅         |
| Latency Heatmap           | ❌   | ✅      | ✅  | ✅         |
| Dependency Graph Viz       | ❌   | ✅      | ✅  | ✅         |
| Anomaly Correlation        | ❌   | ❌      | ✅  | ✅         |
| Predictive Failure View    | ❌   | ❌      | ✅  | ✅         |
| SLA Monitor Dashboard      | ❌   | ❌      | ✅  | ✅         |
| Cross-Module Insight Fusion| ❌   | ❌      | ✅  | ✅         |
| Governor Controls          | ❌   | ❌      | ❌  | ✅         |
| System Audit Console       | ❌   | ❌      | ❌  | ✅         |
| Kill Switch Panel          | ❌   | ❌      | ❌  | ✅         |
| Fleet Orchestration View   | ❌   | ❌      | ❌  | ✅         |
| Compliance Report Gen      | ❌   | ❌      | ❌  | ✅         |

### 1.2 Interaction Permissions

| Action                    | Free | Builder | Pro | Enterprise |
|---------------------------|------|---------|-----|------------|
| View dashboards           | ✅   | ✅      | ✅  | ✅         |
| Click/interact controls   | ❌   | ✅      | ✅  | ✅         |
| Execute commands           | ❌   | ✅      | ✅  | ✅         |
| Modify settings            | ❌   | ❌      | ✅  | ✅         |
| System overrides           | ❌   | ❌      | ❌  | ✅         |

> **Implementation**: `useObserverMode()` hook provides `isObserverOnly`, `canInteract`, `canExecute`, `canModify` booleans. Free users see the dashboard but all controls are disabled with restriction toasts.

---

## 2. Terminal Commands by Tier

### 2.1 Free — Read-Only Status Commands

```
brain.status          — Memory tier status
decode.status         — Personality engine state
defense.status        — Threat detection status
nexus.status          — Router health
vision.status         — Accessibility state
dream.status          — Dream cycle state
system.pulse          — Full system health
system.version        — Substrate version
system.uptime         — Uptime counter
core.health           — Core health check
```

### 2.2 Builder ($49/mo) — Mutations & Operations

All Free commands plus:

```
brain.query <q>       — Search memories
brain.remember <c>    — Store memory
brain.recall <q>      — Retrieve memories
brain.reflect         — Daily reflection
brain.dream           — Dream cycle
brain.reinforce       — Boost confidence
decode.analyze        — Analyze personality
decode.profile        — Generate profile
defense.scan          — Run security scan
defense.audit         — Audit trail
nexus.route           — Route query
nexus.test            — Test provider
dream.submit          — Submit dream
dream.analyze         — Analyze dreams
system.events         — Event log query
```

### 2.3 Pro ($149/mo) — Advanced & Evolution

All Builder commands plus:

```
brain.synthesize      — Cross-domain synthesis
brain.tier [mode]     — Hot→warm→cold tiering
brain.optimize        — Compress memory
brain.prune [t]       — Remove low-value
defense.quarantine    — Quarantine threats
nexus.benchmark       — Provider benchmarks
nexus.rebalance       — Rebalance weights
system.flags          — System flag controls
system.budget         — Budget allocation
modernizer.status     — Modernizer state
modernizer.propose    — Submit proposals
cortex.status         — CORTEX readiness
```

### 2.4 Enterprise ($499/mo) — Dangerous & Admin

All Pro commands plus:

```
system.restore        — Full system restore
system.wipe           — Data wipe operations
system.kill           — Kill switch activation
system.override       — Flag overrides
brain.reset           — Full memory reset
defense.lockdown      — Full lockdown mode
cortex.execute        — CORTEX execution
modernizer.apply      — Apply modernizer patches
access.revoke         — Revoke API keys
access.admin          — Admin operations
```

> **Implementation**: `meetsRequiredTier(userTier, requiredTier)` in `TerminalCommands.ts`. Commands display tier badges (○ FREE, ◆ CREATOR, ★ ARCHITECT, ◉ GOVERNOR). Denied commands show restriction toast.

---

## 3. Engine Capabilities by Tier

### 3.1 Free — Core Cognitive Loop (18 capabilities)

| Engine / Capability            | Category        |
|-------------------------------|-----------------|
| MEMORY Engine                  | cognitive       |
| Learning Engine                | cognitive       |
| Context Engine                 | cognitive       |
| Personality Engine (DECODE)    | cognitive       |
| Conversation Auto-Store        | cognitive       |
| NEXUS Engine                   | integration     |
| Audio Experience Engine        | experience      |
| Engine Bus                     | infrastructure  |
| State Engine                   | infrastructure  |
| Event System                   | infrastructure  |
| Semantic Search                | intelligence    |
| CLM (Basic)                    | cognitive       |
| Hot Reload Orchestrator        | infrastructure  |
| Conversation Analytics         | cognitive       |
| Emotion Baseline Detector      | cognitive       |
| NEXUS Health Monitor           | integration     |
| Dream Feeder API               | experience      |
| MEMORY Playground              | experience      |

### 3.2 Builder ($49/mo) — Hardening & Observability (27 capabilities)

| Engine / Capability            | Category        |
|-------------------------------|-----------------|
| Circuit Breaker                | reliability     |
| Boot Health Gates              | reliability     |
| Regression Testing             | reliability     |
| Auto Regression Trigger        | reliability     |
| Telemetry Engine               | observability   |
| Cost Attribution               | observability   |
| Self-Benchmark                 | observability   |
| Health Dashboard API           | observability   |
| Correlation ID Propagation     | observability   |
| MEMORY GC                      | memory          |
| GC Scheduler                   | memory          |
| MEMORY Deduplication           | memory          |
| Module Communication Bus       | communication   |
| Realtime Bridge                | communication   |
| Brain Transfer Pipeline        | intelligence    |
| Pattern Effectiveness Scoring  | intelligence    |
| Pattern Versioning             | intelligence    |
| Adaptive Rate Limiting         | reliability     |
| Structured Error Recovery      | reliability     |
| Event Replay Buffer            | reliability     |
| Latency Heatmap                | observability   |
| Dependency Graph Visualizer    | observability   |
| MEMORY Compaction Engine       | memory          |
| Signal Priority Queue          | communication   |
| Config Snapshot & Restore      | infrastructure  |
| Audit Trail (Lite)             | observability   |
| Evolution Receipts             | observability   |

### 3.3 Pro ($149/mo) — Intelligence & Operations (24 capabilities)

| Engine / Capability            | Category        |
|-------------------------------|-----------------|
| Reasoning Engine               | intelligence    |
| Imagination Engine             | intelligence    |
| Knowledge Map                  | intelligence    |
| Anomaly Correlation            | intelligence    |
| Incident Timeline              | intelligence    |
| Predictive Failure Detection   | intelligence    |
| Adaptive Budget Allocation     | operations      |
| Cost Forecasting               | operations      |
| Load Shedding                  | operations      |
| Governance Guard               | governance      |
| Multi-Tenant Isolation         | platform        |
| Capability Gate Middleware     | platform        |
| Dynamic Pipeline Composition   | operations      |
| Federated MEMORY Sync          | memory          |
| Associative Recall             | intelligence    |
| Hypothesis Generator           | intelligence    |
| Cognitive Load Balancer        | operations      |
| Intent Disambiguation          | intelligence    |
| Context Compression            | intelligence    |
| SLA Monitor                    | operations      |
| Canary Deployment Gate         | platform        |
| Resource Quota Engine          | operations      |
| Cross-Module Insight Fusion    | intelligence    |
| Adaptive Timeout Manager       | operations      |

### 3.4 Enterprise ($499/mo) — Self-Improvement & Full Platform (58 capabilities)

**Self-Improvement (Non-Recursive)**

| Engine / Capability            | Category          |
|-------------------------------|-------------------|
| Impact Replay                  | self-improvement  |
| Dream → Proposal Pipeline      | self-improvement  |
| Multi-Step Dream Chains        | self-improvement  |
| Knowledge Auto-Fill            | self-improvement  |
| Hot-Swap Engine Deployment     | self-improvement  |
| Deprecation Lifecycle          | self-improvement  |
| Evolution Impact Forecast      | self-improvement  |
| Evolution Lineage Tracker      | self-improvement  |
| Cognitive Debt Analyzer        | self-improvement  |

**Platform & Security**

| Engine / Capability            | Category        |
|-------------------------------|-----------------|
| Module Capability Discovery    | platform        |
| Orchestrator Engine            | platform        |
| Support Bot Engine             | platform        |
| Encoded Code Validation        | platform        |
| Plugin SDK                     | platform        |
| Sandbox Engine                 | platform        |
| Saga Engine                    | platform        |
| Policy Access Engine           | security        |
| Prompt Safety Engine           | security        |
| Zero Trust Mesh                | security        |
| Resilience Shield Meta-Engine  | platform        |
| Fleet Orchestration            | platform        |
| Capability Marketplace         | platform        |
| Multi-Agent Negotiation        | platform        |
| Runtime Schema Migration       | platform        |
| Agent Mesh                     | platform        |

**Intelligence & Governance**

| Engine / Capability            | Category        |
|-------------------------------|-----------------|
| Deep Cognition Engine          | intelligence    |
| Dialogue Engine                | intelligence    |
| Deep Cognition Nexus Meta      | intelligence    |
| Knowledge Graph Federation     | intelligence    |
| Cognitive Replay Debugger      | intelligence    |
| Adaptive Personality Tuning    | cognitive       |
| Observability Engine           | observability   |
| Technical Debt Engine          | evolution       |
| Compliance Report Generator    | governance      |
| Semantic Versioning Engine     | governance      |
| Governance Workflow Engine     | governance      |
| Cost Anomaly Detector          | operations      |
| Cross-Tenant Analytics         | operations      |
| Intelligent Cache Engine       | performance     |
| Capability Health Score        | observability   |
| Substrate Telemetry Export     | observability   |
| Parity Enforcement             | enterprise      |
| CLM (Full Spectrum)            | enterprise      |
| Archived Capability Adapters   | enterprise      |
| Custom Engine Registration     | enterprise      |

**World-First Orchestrations (Enterprise Only)**

| Bundle                         | Count |
|-------------------------------|-------|
| World-First: Cognitive         | 14    |
| World-First: Operational       | 14    |
| World-First: Intelligence      | 14    |
| World-First: Governance        | 14    |

---

## 4. Crown Jewels — CMPSBL-ONLY (Never Distributed)

These 10 recursive self-improvement capabilities are **permanently excluded** from all LNCHBL tiers:

| Capability                     | Why Excluded                                    |
|-------------------------------|------------------------------------------------|
| CORTEX Engine                  | Autonomous PROPOSE→APPLY→LEARN loop            |
| SEBA Engine                    | Self-Evolving Bounded Agent                     |
| Modernizer                     | Shadow-to-production code diffs                 |
| Evolution A/B                  | Parallel evolution variant testing              |
| Evolution Rollback             | Auto-revert of failed evolution                 |
| Evolution Sandbox              | Isolated evolution testing                      |
| Dream Pool Federation          | Cross-agency dream sharing                      |
| Self-Repair Engine             | Autonomous degradation repair                   |
| Autonomous Workflow Composer   | Self-assembling workflows                       |
| Dream Lucidity Control         | Directed dream cycle exploration                |

> **Enforcement**: `isCrownJewel()` check in `lnchbl-tier-map.ts` returns `true` for these IDs. `isCapabilityAvailable()` always returns `false` regardless of tier.

---

## 5. Capability Gate Implementation

### Runtime Enforcement Flow

```
User Action
  → guardAction(action, requiredTier)
    → meetsRequiredTier(currentTier, requiredTier)
      → ✅ Execute  OR  ❌ showRestrictionToast()
```

### Key Files to Replicate

| File                                          | Purpose                          |
|----------------------------------------------|----------------------------------|
| `src/hooks/useUserRole.ts`                    | Role detection (DB → tier map)   |
| `src/hooks/useObserverMode.ts`                | UI permission guards             |
| `src/config/lnchbl-tier-map.ts`               | Capability → tier definitions    |
| `src/lib/substrate/capability-gate/index.ts`  | Runtime gate middleware          |
| `src/components/substrate-os/terminal/TerminalCommands.ts` | Per-command tier gating |

### Role Detection Priority (useUserRole)

```
1. has_role_text('admin')    → enterprise (governor)
2. has_role_text('moderator') → pro (architect)
3. has_role_text('operator')  → builder (creator)
4. access_subscriptions.tier  → map tier string
5. Default                    → free
```

### UI Enforcement Patterns

```tsx
// Disable controls for free users
const { canInteract, guardAction } = useObserverMode();

<Button
  disabled={!canInteract}
  onClick={guardAction(() => executeAction(), 'builder')}
>
  Run Engine
</Button>

// Show restriction toast on denied click
const { showRestrictionToast } = useObserverMode();
if (!canModify) showRestrictionToast('pro');
```

---

## 6. Summary Counts

| Tier        | New Capabilities | Cumulative | Price    |
|-------------|-----------------|------------|----------|
| Free        | 18              | 18         | $0       |
| Builder     | 27              | 45         | $49/mo   |
| Pro         | 24              | 69         | $149/mo  |
| Enterprise  | 58              | 127        | $499/mo  |
| Crown Jewel | 10              | —          | CMPSBL   |

**Total distributed capabilities**: 127
**Total with Crown Jewels**: 137

---

*CMPSBL OS Substrate — ARCHITECT Epoch*
*© 2025–2026 PromptFluid®. All rights reserved.*
