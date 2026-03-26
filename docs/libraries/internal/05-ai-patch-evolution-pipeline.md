# 05 — AI-Driven Patch Evolution Pipeline

**Classification:** 🔒 GOVERNOR EYES ONLY

---

## 1. Overview

The substrate self-evolves through an **AI-Proposed, Human-Approved** model. Autonomous discovery identifies technical debt, optimization opportunities, and architectural improvements. The execution layer generates code patches via NEXUS (routing to **GPT-5 Nano** at ≤$0.05/run), which are validated in SHADOW environments before requiring human-in-the-loop approval. The system also autonomously **suggests new functions and features** via the Feature Suggestion Engine.

```
Discovery (CDM/CLM/Scanner)
  → Opportunity Identification
  → AI Patch Generation (NEXUS)
  → SEBA 7-Gate Validation
  → Shadow Execution
  → Governor Approval
  → Production Promotion
  → Post-Promotion Monitoring
```

---

## 2. Discovery Layer

### Sources of Evolution Candidates

| Source | What It Detects | Frequency |
|--------|----------------|-----------|
| **CDM** (Code Debt Monitor) | Tech debt, deprecated patterns, unused code | Continuous |
| **CLM** (Code Learning Module) | Optimization opportunities, pattern improvements | Per-cycle |
| **Scanner Orchestrator** | Security vulnerabilities, dependency issues | Scheduled + on-demand |
| **ENGINEER Node** | Cross-module optimization, architectural improvements | 76-engine sweep |
| **INTEL Node** | External signal enrichment, emerging best practices | Event-driven |
| **Omega Observer** | Entropy drift, regression detection, forward analysis | Continuous |

### Opportunity Scoring

Each candidate receives a priority score:

```
priority = 0.35 × severity
         + 0.25 × blast_radius_inverse
         + 0.20 × confidence
         + 0.10 × debt_age
         + 0.10 × module_health_impact
```

Candidates scoring ≥ 0.70 are eligible for AI patch generation.

---

## 3. AI Patch Generation

### Architecture

```
Candidate (from Discovery)
  → Patch Request Builder
  → NEXUS Model Router
  → GPT-5 Nano (≤$0.05/run) | GPT-5 Mini (fallback)
  → Structured Patch Response
  → Patch Validator
  → SEBA Pipeline Entry
```

### Patch Request Format

```typescript
interface PatchRequest {
  candidateId: string;
  category: 'fix' | 'refactor' | 'optimize' | 'security' | 'feature';
  context: {
    fileContents: string[];      // Relevant source files
    moduleName: string;          // Target module
    debtDescription: string;     // What needs fixing
    constraints: string[];       // Architectural constraints
    relatedModules: string[];    // Modules that might be affected
  };
  config: {
    model: string;               // e.g., 'openai/gpt-5'
    maxTokens: number;
    temperature: number;         // 0.1 for fixes, 0.3 for refactors
    dryRun: boolean;
  };
}
```

### Patch Response Format

```typescript
interface PatchResponse {
  patchId: string;
  changes: Array<{
    filePath: string;
    operation: 'modify' | 'create' | 'delete';
    diff: string;               // Unified diff format
    explanation: string;         // AI's reasoning
  }>;
  metadata: {
    model: string;
    tokensUsed: number;
    confidence: number;          // 0-1
    estimatedImpact: {
      healthDelta: number;
      debtReduction: number;
      riskLevel: 'low' | 'medium' | 'high';
    };
  };
  validationHints: string[];     // Suggested test cases
}
```

### Model Selection Strategy

| Category | Primary Model | Fallback | Temperature | Max Cost/Run |
|----------|--------------|----------|-------------|-------------|
| Security fix | GPT-5 Nano | GPT-5 Mini | 0.05 | $0.05 |
| Bug fix | GPT-5 Nano | GPT-5 Mini | 0.10 | $0.05 |
| Refactor | GPT-5 Nano | GPT-5 Mini | 0.15 | $0.05 |
| Optimization | GPT-5 Nano | GPT-5 Nano | 0.10 | $0.05 |
| Feature addition | GPT-5 Nano | GPT-5 Mini | 0.25 | $0.05 |
| Feature suggestion | GPT-5 Nano | GPT-5 Mini | 0.35 | $0.05 |

---

## 4. SEBA 7-Gate Validation

Every AI-generated patch must pass the full SEBA pipeline:

| Gate | AI Patch Specifics |
|------|-------------------|
| 1. Schema | Verify patch doesn't break DB migrations or type contracts |
| 2. Behavioral | Shadow-run with real inputs, compare output equivalence ≥ 95% |
| 3. TSAC | Semantic truth preservation check, divergence < 0.05 |
| 4. Performance | Latency regression < 10%, bundle size delta < 2% |
| 5. Error Rate | Zero new errors during shadow execution |
| 6. GOVERNANCE | Governor reviews patch diff + AI reasoning in Evolution CC |
| 7. Security | DEFENSE node scans for injection, privilege escalation, data leaks |

### Additional AI-Specific Gates

| Check | Threshold | Purpose |
|-------|-----------|---------|
| **Hallucination Guard** | Import validation | Ensure AI doesn't reference non-existent modules |
| **Pattern Conformity** | AST comparison | Verify patch follows existing codebase conventions |
| **Blast Radius** | ≤ 3 modules | Reject patches that touch too many unrelated systems |
| **Anchor Preservation** | Hash match | Critical file anchors must remain intact |

---

## 5. Shadow Execution

AI patches undergo isolated shadow execution:

1. **Sandbox Deploy** — Patch applied to isolated shadow environment
2. **Input Replay** — Real production inputs replayed against shadow
3. **Output Comparison** — Shadow vs. production output diffed
4. **Performance Profiling** — Latency, memory, CPU measured
5. **Stability Soak** — Minimum 10 cycles over 30+ minutes

### Divergence Scoring

```
divergence = 0.50 × output_div + 0.30 × latency_div + 0.20 × error_div
```

- < 0.05: Pass → promotion eligible
- 0.05–0.15: Review required → Governor notified
- > 0.15: Fail → patch rejected with deviation report

---

## 6. Governor Approval Workflow

### Evolution Control Center (`/evolution`)

The Evolution CC is the governance surface where the Governor reviews and approves AI-generated patches. It is **PIN-protected** (access code: gate-specific) and provides:

1. **Patch Queue** — Pending AI patches with diff viewer
2. **AI Reasoning Panel** — Model's explanation for each change
3. **Impact Preview** — Projected health delta, debt reduction, risk level
4. **Shadow Results** — Full divergence report from shadow execution
5. **One-Click Actions** — Approve, Reject, Request More Shadow Cycles
6. **Rollback History** — Previous promotions with instant rollback

### Approval Flow

```
AI Patch Generated
  → Appears in Evolution CC Patch Queue
  → Governor reviews diff + reasoning
  → [Approve] → Promotion to production
  → 30-min Ironclad monitoring
  → Stable? → Complete ✓
  → Unstable? → Auto-rollback + Governor alert
```

---

## 7. Rollback & Recovery

### Automatic Rollback Triggers (Post-Promotion)

- Error rate > 5% within 5 minutes
- CORE integrity drops below 0.700
- Any spine module enters circuit-breaker open
- Scanner detects new critical vulnerability
- Entropy score spikes > 0.3 above baseline

### Manual Rollback

- One-click via Evolution CC
- Snapshot restore + WAL replay
- Dry-run impact preview before execution
- Full audit trail in AUDIT node

---

## 8. AI Patch Budget & Quotas

| Metric | Daily Limit | Purpose |
|--------|------------|---------|
| Patch generation calls | 50 | Cost control |
| Total tokens | 500K | Budget cap |
| Max patches per module | 5 | Blast radius control |
| Shadow cycles per patch | 10–50 | Confidence building |

Budget tracked via `ai_daily_quota` table, category: `evolution`.

---

## 9. Telemetry & Audit Trail

Every AI patch is fully auditable:

```
evolution_runs       — Cycle metadata and status
evolution_receipts   — Gate-by-gate pass/fail results
audit_logs          — Governor approval/rejection with reasoning
ai_usage_log        — Model, tokens, cost per generation
mesh_comms          — Inter-node signals during evolution
```

---

## 10. Security Considerations

1. **No autonomous promotion** — All patches require Governor approval
2. **Model output sanitization** — AI responses stripped of executable code outside diff format
3. **Import validation** — Every import in generated code verified against project dependency tree
4. **RLS enforcement** — Evolution tables restricted to admin/governor role
5. **Rate limiting** — Patch generation rate-limited to prevent abuse
6. **Audit chain** — Cryptographic receipt chain for all evolution actions

---

## 11. Interface Access

| Surface | Route | Protection |
|---------|-------|-----------|
| Evolution Control Center | `/evolution` | PIN Gate (6-digit) |
| Admin Evolution Mesh | `/admin/evolution` | AdminRoute (role-based) |
| Proprietary Evolution | `/x` | PIN Gate (separate code) |

The Evolution CC supports a debug bypass mechanism for automated tooling access (URL parameter-based sessionStorage flag), enabling AI assistants to capture screenshots and perform design reviews without PIN entry.

---

© 2025–2026 CMPSBL®. Governor Eyes Only.
