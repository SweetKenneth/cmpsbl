# ENCODE — Internal Deep Dive

**Classification:** 🔒 Confidential  
**Document:** 38  
**Module:** ENCODE (Node #21)  
**Codename:** Forge (Hardening Layer)

---

## Table of Contents

1. Identity & Archetype
2. ENCODE + DECODE Pipeline Architecture
3. Orchestration Layer
4. Hardening Layer (25-Point "Forge")
5. Skill Registry (31 Skills)
6. Expert Pattern Library (150+ Patterns)
7. Guardrail Policy & Guard Enforcement
8. Substrate Navigator
9. Brain Integration & Knowledge Transfer
10. Discussion Channel (Plan Negotiation)
11. Escalation Processor (7-Strategy Cascade)
12. Escalation Resolution Telemetry
13. CLM — Internal Codebase Learning Mode
14. Production Pipeline & Shadow Practice
15. Customer-Facing Stub (VOLVER)
16. Secrets & Trade-Secret Mechanisms
17. File Map

---

## 1. Identity & Archetype

ENCODE is the substrate's **code execution engine** — Node #21 in the 40-node / 12-sector matrix. It is a first-class substrate module responsible for receiving structured task packets from DECODE and producing governed, audited code artifacts.

### Archetype: The Precision Forge

ENCODE is not a chatbot. It is a **surgical code intelligence** that:

- **Never generates code without architecture context** — requires an architecture snapshot (audit) before any execution
- **Never executes without human approval** — execution lock protocol enforces bidirectional consent
- **Fail-closed by default** — any invariant violation blocks execution
- **Routes through NEXUS fleet** — zero external AI costs (Groq → Cerebras → DeepSeek cascade)
- **Learns from every execution** — CLM integration with brain writeback

### Role Definitions (Hardcoded, Non-Overridable)

| Role | ID | Label | Permissions | Restrictions |
|------|-----|-------|-------------|-------------|
| USER | `user` | Strategic Authority | approve, reject, direct, audit, rollback | None |
| DECODE | `decode` | Intent Translator | parse_intent, relay_messages, clarify, route_to_encode | cannot_generate_code, cannot_mutate_architecture |
| ENCODE | `encode` | Execution Engine | analyze, generate_code, patch, refactor, guard | cannot_redefine_architecture, cannot_import_without_approval, cannot_expose_service_keys, must_follow_project_conventions, cannot_execute_without_approval |

**Secret:** These roles are compile-time constants. They cannot be overridden at runtime. DECODE can never generate code. ENCODE can never redefine architecture. The USER is always the strategic authority.

---

## 2. ENCODE + DECODE Pipeline Architecture

The DECODE → ENCODE pipeline is a **7-stage execution chain** with mandatory approval gates.

### Pipeline Stages

```
USER INTENT
  ↓
INPUT → ANALYZE → CLASSIFY → PLAN → [APPROVAL GATE] → EXECUTE → FORMAT → OUTPUT
  ↓         ↓           ↓         ↓                       ↓          ↓       ↓
 User     DECODE     DECODE    PatchPlan            ENCODE task    Artifact   Brain
message   parses    classifies  generated           enqueued &      sealed    writeback
          intent    surface     & stored             executed       & hashed
```

### Stage 1: Intent Submission (USER → DECODE)

The user's natural language intent enters through `submitIntentForReview()`. DECODE parses the intent — it **cannot generate code**, only translate and classify.

### Stage 2: Plan Generation (DECODE → PatchPlan)

`planFromIntent()` generates a structured `PatchPlan` containing:
- `plan_id` — unique identifier
- `title` — human-readable summary
- `modules` — affected substrate modules
- `risks` — identified risk factors
- `status` — `draft` → `approved` → `executing` → `completed`

**Secret:** Plans are stored in an in-memory registry with Control Plane backup. The plan is published to the module bus with `plan.created` signal so GOVERNANCE can veto before approval.

### Stage 3: Plan Approval Gate

Plans **must** be explicitly approved via `approvePlan()` before ENCODE can execute. This is the critical gate:

```
planFromIntent() → PatchPlan (status: 'draft')
approvePlan()    → PatchPlan (status: 'approved')
routeFromDecode() → ONLY works if plan.status === 'approved'
```

**Secret:** If you call `routeFromDecode()` without a `plan_id`, it throws. If the plan is not `approved`, it throws. There is no bypass. The plan is also structurally verified via `verifyPlan()` before routing proceeds.

### Stage 4: Brain Recall

Before execution, ENCODE recalls context from BRAIN via `recallForEncode()`:
- Pulls memories by explicit keys
- Also searches by query text
- Returns `BrainContext` with relevance-scored memories

### Stage 5: Task Enqueue & Execution

The task is enqueued as a structured `EncodeTaskPacket`:

```typescript
interface EncodeTaskPacket {
  id: string;                    // enc-{timestamp}-{counter}
  intentSummary: string;         // max 5000 chars, validated
  targetSurface: TargetSurface;  // 'code' | 'ui' | 'docs' | 'db' | 'edge' | 'tests'
  constraints: {
    destructiveAllowed: boolean;
    requiresApproval: boolean;
  };
  contextRefs: {
    brainKeys: string[];
    urls?: string[];
  };
  acceptance: string[];           // max 20 items
  status: 'queued' | 'in_progress' | 'completed' | 'failed' | 'cancelled';
}
```

**Secret:** The queue auto-prunes completed/failed tasks beyond 50 entries. Receipts are capped at 200. Task IDs are deterministic: `enc-{Date.now()}-{totalTasksQueued}`.

### Stage 6: Completion & Brain Writeback

`completeAndWriteback()` does two things:
1. Records the task result with artifacts and learnings
2. Writes learnings back to BRAIN via event emission (no longer writes to `brain_memory_hot` directly)

Failed tasks are automatically recorded to the **error-pattern library** for future prevention.

### Stage 7: Artifact Sealing

Every generated artifact is sealed into a **hash chain** (FNV-1a) via the hardening layer. This creates a tamper-evident record of everything ENCODE has ever produced.

---

## 3. Orchestration Layer

File: `src/lib/substrate/encode-module/orchestration.ts` (580 lines)

The orchestration layer is the **governance wrapper** around ENCODE. It enforces 9 major protocols:

### 3.1 Conversation Relay Layer

A rolling buffer of `ConversationMessage` objects tracking the full conversation between USER, DECODE, ENCODE, and SYSTEM. Messages are append-only — never mutated. Each message is versioned with a monotonically increasing counter.

### 3.2 Execution Lock Protocol

Two conditions must be met before ENCODE can generate code:

1. `architecture_map_exists === true` — an audit snapshot must exist
2. `user_approval === true` — the user must explicitly approve

If either is false, `checkExecutionLock()` returns `{ allowed: false }` and no code generation can proceed.

### 3.3 Architecture Snapshot (Audit Mode)

`runAuditMode()` scans the system manifest and produces an `ArchitectureSnapshot`:
- **Module Registry** — built from `SYSTEM_MODULES` (single source of truth)
- **Dependency Graph** — edges from manifest dependencies/dependents
- **Shared Utilities Index** — emit, memoryCore, log, engineBus, correlationId
- **Escalation Paths** — encode→governance (destructive), encode→defense (injection), decode→encode (codegen), sandbox→encode (test failure), intent-mesh→governance (unknown intent)

**Secret:** The snapshot is built entirely from the system manifest — it doesn't actually scan the filesystem. This makes it fast but dependent on the manifest being accurate. The manifest is the architectural truth.

### 3.4 Architectural Awareness Contract

For any target module, `buildAwarenessContract()` produces a contract showing:
- Who calls this module
- What this module calls
- Expected inputs/outputs
- Known failure states
- Logging strategy
- Escalation route

This ensures ENCODE understands the blast radius before touching any module.

### 3.5 ENCODE Modes

Four execution modes with gated transitions:

| Mode | Purpose | Gate |
|------|---------|------|
| `conversation` | Default — analysis and discussion only | None |
| `audit` | Architecture snapshot generation | None |
| `surgical` | Targeted patch creation | None |
| `generation` | Full code generation | Requires execution lock cleared |

### 3.6 Surgical Patch Mode

Creates precise, targeted patches with:
- **Safe path validation** — only `src/`, `supabase/functions/`, `docs/`, `public/` prefixes allowed
- **Blocked paths** — `client.ts`, `types.ts`, `.env`, `config.toml`, `node_modules/`
- **Path traversal prevention** — rejects `..`, `//`, leading `/`
- **Immutable patch history** — all patches are versioned and logged

### 3.7 Resilience Baseline

Before any code is accepted, it's checked against 6 mandatory resilience patterns:
1. Input validation (zod/schema/validate)
2. Structured error codes (ErrorCode, EXECUTION_LOCK)
3. Retry wrapper (withRetry, maxRetries)
4. Timeout guard (AbortController, signal)
5. Correlation ID (traceId, requestId)
6. Deterministic repair (fallback, graceful)

### 3.8 CLI Mode

10 CLI commands for terminal interaction:
`scan`, `patch`, `refactor`, `guard`, `audit`, `status`, `approve`, `clear`, `history`, `diff`

### 3.9 Discussion Channel

ENCODE can negotiate with DECODE before writing code via 5 signal types:
- `encode.plan.question` → to DECODE, ENCODE, GOVERNANCE
- `encode.plan.risk` → to DECODE, ENCODE, GOVERNANCE (high priority)
- `encode.plan.clarification` → to DECODE only
- `encode.plan.answer` → to ENCODE only
- `encode.plan.ready` → to DECODE, ENCODE, GOVERNANCE

All discussions are persisted to the Control Plane and scoped by plan ID.

**Secret:** The discussion channel strips raw patch content, code, and diffs from payloads before publishing. Only summaries and IDs are transmitted over the module bus.

---

## 4. Hardening Layer — "Forge" v2.0.0

File: `src/lib/substrate/encode-module/encode-hardening.ts` (837 lines)

25 enterprise-grade safety features organized into categories:

### Integrity & Versioning
1. **Artifact Integrity Seal** — FNV-1a hash chain for every generated artifact
2. **Patch Versioning** — immutable patch chain with before/after hashes and rationale
3. **Learning Receipt Ledger** — tamper-evident log of all learnings

### Budget & Limits
4. **Code Generation Budget** — max 25 artifacts/task, 2000 lines/artifact, 50000 lines/session
5. **Concurrent Task Limiter** — max 5 concurrent execution slots
6. **Generation Cooldown** — prevents rapid-fire generation abuse

### Safety Guards
7. **Destructive Change Guard** — pattern detection for file_delete, schema_drop, rls_remove, api_key_expose, bulk_overwrite
8. **Import Allowlist** — only approved packages (radix-ui, tanstack, supabase, react, framer-motion, etc.)
9. **Sandbox Pre-Flight** — checks for eval(), dynamic imports, process.env, fs access, infinite loops, code size
10. **Convention Enforcer** — no `any` types, no console.log, no hardcoded URLs, no service keys, semantic tokens only

### Intelligence
11. **Resilience Baseline Checker** — 6 mandatory patterns for production code
12. **Task Idempotency** — FNV-1a fingerprinting prevents duplicate execution
13. **Task Priority Scorer** — weighted scoring (severity, escalation, core touch, user request, age)
14. **Task Outcome Forecaster** — predicts success probability based on surface, complexity, and history
15. **Confidence Calibration** — tracks predicted vs actual success to calibrate ENCODE's self-assessment
16. **Diff Impact Estimator** — blast radius prediction with risk scoring

### Resilience
17. **Timeout Escalation** — tiered timeouts: fast(5s) → standard(30s) → complex(120s) → critical(300s) → governance
18. **Task Dependency Resolver** — validates dependency graph, detects cycles
19. **Rollback Registry** — tracks rollback-capable changes with before-state preservation
20. **Error Pattern Dedup** — FNV-1a fingerprinting prevents re-recording known errors

### Observability
21. **Execution Audit Trail** — immutable log of all ENCODE executions (capped at 2000 entries)
22. **Surface Capability Map** — what ENCODE can do per target surface (code, ui, docs, db, edge, tests)
23. **Code Quality Gate** — scoring based on comment ratio, line length, complexity, structure
24. **Learning Cycle Tracker** — CLM integration metrics (cycles, patterns, improvements)
25. **ENCODE Health Composite** — multi-dimensional health score combining all metrics

**Secret:** The generation budget is enforced session-wide. If you exhaust 50,000 lines in one session, ENCODE stops generating until `resetSessionBudget()` is called. This prevents runaway generation in autonomous mode.

---

## 5. Skill Registry (31 Skills)

File: `src/lib/codeagent/encoded/skills.ts`

ENCODE has 31 registered skills across 12 categories:

| Category | Skills | Avg Proficiency |
|----------|--------|----------------|
| TypeScript | Strict Mode (95), Design Patterns (88), Advanced Types (82) | 88 |
| React | Hooks (92), Components (90), Performance (78), State Architecture (85) | 86 |
| Edge Functions | Deno (94), Auth (85), Security Hardening (80) | 86 |
| Database | Queries (87), Migrations (83), RLS (80) | 83 |
| Testing | Unit (82), Integration (72) | 77 |
| Refactoring | Extract & Simplify (91), File Decomposition (84) | 88 |
| Documentation | JSDoc (93) | 93 |
| Styling | Tailwind (88), shadcn (85), Responsive (82) | 85 |
| Substrate | Navigator (90), Conventions (88), Events (85), Hardening (80) | 86 |
| Security | Input Validation (88), Auth (82), Secrets (90) | 87 |
| State Management | Zustand (85), TanStack Query (87) | 86 |
| Navigation | Module Resolution (92), Concern Detection (88) | 90 |

**Overall Proficiency:** ~86%

**Secret:** The proficiency numbers are calibrated against actual task outcomes via the Confidence Calibration system. They're not arbitrary — they reflect historical success rates per skill category. The customer-facing VOLVER stub intentionally caps proficiencies 20-30 points lower.

---

## 6. Expert Pattern Library (150+ Patterns)

File: `src/lib/codeagent/encoded/expert-patterns.ts` (1387 lines)

This is ENCODE's "DNA" — battle-tested code templates organized by category and tier:

### Categories
- `typescript_advanced` — discriminated unions, branded types, builders, exhaustive guards, type predicates, mapped conditionals, const objects
- `react_architecture` — compound components, hook+render, optimistic updates, error boundaries, suspense data, react-hook-form+zod
- `edge_function` — structured handlers, action routers, and more
- `error_handling` — structured error codes, retry with backoff
- `security` — input validation, auth patterns
- `performance` — memoization, virtualization
- `state_management` — zustand slices, tanstack patterns
- `testing` — vitest patterns
- `database` — RLS patterns, migration patterns
- `api_design` — RESTful patterns
- `refactoring` — extraction patterns
- `accessibility` — WCAG patterns

### Tiers
- **Foundational** — const objects, form patterns, structured handlers
- **Intermediate** — exhaustive guards, hook+render, action routers
- **Advanced** — discriminated unions, compound components, optimistic updates
- **Expert** — branded types, mapped conditionals
- **Mastery** — (reserved for emergent patterns)

Each pattern includes:
- Template code
- Anti-patterns to avoid
- Quality signals to look for
- When to use guidance
- Complexity rating (1-10)

**Secret:** Expert patterns are ingested into BRAIN's hot memory tier during the knowledge transfer cycle. High-confidence patterns (≥0.8) are promoted to the heuristic tier for long-term retention. This is how ENCODE "remembers" patterns across sessions.

---

## 7. Guardrail Policy & Guard Enforcement

### Policy (Single Source of Truth)

File: `src/lib/codeagent/encoded/policy.ts`

- `requireFileRead: true` — must read actual file before writing
- `requireAnchorCheck: true` — exports, handlers, entrypoints must be preserved
- `denyNarrativeCode: true` — 30+ regex patterns block AI personality code
- `failClosed: true` — any invariant violation blocks execution
- `destructiveMaxRemovedLines: 8` — more than 8 removed lines = destructive
- `destructiveMaxChangedPercent: 0.15` — more than 15% changed = destructive
- `requireHumanApprovalForDestructive: true` — always

### Dangerous Patterns (Always Blocked)
- `eval()`, `new Function()`, `document.write()`
- `innerHTML` with concatenation
- `process.env` mutation
- `fs.unlink/rmdir/rm`
- `child_process.exec`
- `require('child_process')`

### Protected Paths (Never Modify Without Approval)
- `client.ts`, `types.ts`, `config.toml`, `.env*`, `package.json`, `package-lock.json`, `bun.lockb`, `tsconfig.json`, `vite.config.ts`, `tailwind.config.ts`

### Change Classification
| Class | Risk | Auto-Approve | Condition |
|-------|------|-------------|-----------|
| comment_only | minimal | ✅ | Only comments changed |
| additive | low | ✅ | No removals, no changes |
| localized | medium | ✅ | ≤8 removed lines, ≤15% changed |
| destructive | high | ❌ | Everything else |

### Guard Enforcement Flow

```
runEncodedGuard(before, after, humanApproved, filePath)
  → Check protected paths
  → Extract anchors (exports, handlers, entrypoints)
  → Compare anchors (before vs after)
  → Detect narrative code
  → Detect dangerous imports
  → Compute diff stats
  → Classify change
  → Check approval requirements
  → FAIL CLOSED if any reasons exist
```

### Dangerous Import Detection

ENCODE maintains an allowlist of approved npm packages. Any import not in the list is flagged:
- Service role key imports → blocked
- Non-VITE env access → blocked
- eval/Function constructor → blocked
- Unknown packages → flagged for approval

**Secret:** The narrative pattern list is intentionally comprehensive (30+ regexes) to catch all forms of AI personality bleed. Patterns like "let me think", "I apologize", "here's the code", "as an AI" are all blocked from generated code. This ensures ENCODE produces mechanical, professional code without personality artifacts.

---

## 8. Substrate Navigator

File: `src/lib/codeagent/encoded/substrate-navigator.ts` (446 lines)

The Navigator is ENCODE's "how to find things" intelligence — a semantic resolution engine that maps natural language to file paths, database tables, and cross-cutting concerns.

### 5 Navigation Layers

1. **Semantic Alias Map** — ~90 natural language terms mapped to module IDs
   - "cognition" → brain, "security" → defense, "codegen" → encode
   - "rate limit" → defense, "ai gateway" → nexus, "dream" → dream
   - Covers all 40 nodes including Gen 2 expansion modules

2. **Convention-Based Paths** — where things live by naming pattern
   - Metric adapter: `src/core/metrics/moduleAdapters/{id}.adapter.ts`
   - Terminal handler: `src/lib/terminal/{group}-handlers.ts`
   - React hook: `src/hooks/substrate/use{Module}.ts`
   - Hardening: `src/lib/{id}/{id}-hardening.ts`
   - CLM topics: `src/lib/substrate/module-clm/index.ts`

3. **Cross-Cutting Concern Map** — 10 concern types with associated files
   - rate_limit, circuit_breaker, quota, auth, audit, telemetry, error_handling, caching, rls_policy, tenant_isolation

4. **Database Table Awareness** — module → relevant Supabase tables
   - brain → ai_learning_data, ai_daily_quota, ai_usage_log
   - encode → analytics_events, audit_logs
   - economy → access_usage, access_quotas, access_subscriptions

5. **Intent-to-File Targeting** — `navigateIntent()` combines all layers

**Secret:** The Navigator resolves multiple modules simultaneously. `navigateIntent('rate limit BRAIN cognition')` resolves both the brain module AND the rate_limit cross-cutting concern, returning files from both domains plus their impact chain (dependencies + dependents).

---

## 9. Brain Integration & Knowledge Transfer

### Brain → ENCODE Transfer Pipeline

File: `src/lib/codeagent/encoded/knowledge-transfer.ts`

The transfer pipeline distills BRAIN memories into actionable code patterns:

1. **Extract** — `extractCodePatterns()` pulls code-related memories from brain_memory_hot
2. **Filter** — only code-related memories pass (`isCodeRelated()` checks for code indicators)
3. **Transform** — converts memories to `LearnedPattern` with confidence scoring
4. **Transfer** — `transferToEncoded()` writes patterns to:
   - Hot memory (new patterns with `encoded_pattern:{type}` category)
   - Heuristic tier (high-confidence patterns ≥0.8)
5. **Ingest** — `ingestExpertPatterns()` fast-tracks curated expertise directly into BRAIN

### ENCODE → Brain Writeback

After task completion, `writebackFromEncode()` emits an event with:
- Task ID, summary, artifact count, tags
- No longer writes directly to brain_memory_hot (event-only)

**Secret:** The knowledge transfer is bidirectional and continuous. ENCODE doesn't just consume BRAIN memories — it produces them. Every successful task creates learnings that feed back into BRAIN, which then distills them for future ENCODE tasks. This creates a compounding learning loop.

---

## 10. Discussion Channel

File: `src/lib/substrate/encode-module/discussion.ts` (246 lines)

Before executing a plan, ENCODE can negotiate with DECODE and the user through a structured discussion channel.

### Signal Types & Recipients

| Signal | Recipients | Priority |
|--------|-----------|----------|
| `encode.plan.question` | DECODE, ENCODE, GOVERNANCE | normal |
| `encode.plan.risk` | DECODE, ENCODE, GOVERNANCE | **high** |
| `encode.plan.clarification` | DECODE only | normal |
| `encode.plan.answer` | ENCODE only | normal |
| `encode.plan.ready` | DECODE, ENCODE, GOVERNANCE | normal |

### Lifecycle

1. ENCODE asks question → persisted to Control Plane
2. DECODE or USER responds → original marked resolved
3. All questions resolved → ENCODE signals `ready`
4. Readiness check: `allQuestionsResolved(planId)` → boolean

**Secret:** The recipient map uses **no wildcards**. Each signal type has explicit, scoped recipients. This prevents information leakage across module boundaries. Risk signals are always high-priority to ensure GOVERNANCE sees them immediately.

---

## 11. Escalation Processor — 7-Strategy Cascade

File: `src/lib/substrate/encode-module/escalation-processor.ts` (521 lines)

When immune executor probes fail, escalations are routed to ENCODE for resolution. The processor uses a **7-strategy cascade**:

### Resolution Strategies (ordered by quality)

| # | Strategy | Quality Weight | Description |
|---|----------|---------------|-------------|
| 1 | Deterministic repair | 1.00 | Apply real input to `deterministicRepair()` |
| 2 | Input reconstruction | 0.95 | Reconstruct valid input from error context |
| 3 | Learning rule (direct) | 0.90 | Apply matching rule from learning DB |
| 4 | Cross-executor transfer | 0.85 | Transfer rule from different executor |
| 5 | Pattern match | 0.60 | Pattern-based auto-resolution |
| 6 | Auto-expire | 0.10 | Stale transient errors (>10min) or all shadow probes (>15min) |
| 7 | Fail with diagnostics | 0.00 | All strategies exhausted |

### Key Mechanisms

- **Warm-start from DB** — on first run, loads historical patterns from database
- **Batch resolution** — groups escalations by error signature, resolves similar ones together
- **Quality scoring** — composite score reflecting how "real" the fix was vs auto-expire
- **Learning feedback loop** — every resolution feeds back into `recordResolutionFeedback()` and `learnFromResolution()`
- **Post-processing learning cycle** — after processing, `runLearningCycle()` promotes patterns to rules

**Secret:** Strategy 6b is aggressive — ALL shadow probe errors older than 15 minutes are auto-expired regardless of error class. Shadow probes are synthetic, so this achieves "zero backlog target" without production impact. The quality score distinguishes real fixes (deterministic=1.0) from sweeping (auto_expire=0.1).

---

## 12. Escalation Resolution Telemetry

File: `src/lib/substrate/encode-module/escalation-telemetry.ts` (268 lines)

Tracks ENCODE's escalation resolution effectiveness:

- **MTTR** (Mean Time to Resolution)
- **Resolution rate** (resolved / claimed)
- **Per-executor breakdown** (claimed, resolved, failed, avgTTR)
- **Per-method breakdown** (deterministic, learning_rule, etc. with success rates)
- **Learning loop effectiveness** (rules applied, succeeded, failed)
- **Flow rates** (inflow vs outflow per minute)
- **Backlog trend** (negative = clearing, positive = growing)

Ring buffer of 500 events, 200 inflow timestamps. Window defaults to 6 hours.

---

## 13. CLM — Internal Codebase Learning Mode

File: `src/lib/substrate/encode-module/clm.ts` (327 lines)

ENCODE's CLM is **internal-focused** — it studies the actual codebase, not external topics.

### What ENCODE Studies

- **32 substrate module directories** cataloged
- **42 critical architectural files** identified
- **11 codebase pattern matchers** active
- Task execution patterns (success rates, failure modes)
- Error-pattern library statistics
- Escalation learning loop metrics
- Escalation resolution telemetry

### CLM Cycle Output

Each cycle produces a `CLMReport` with:
- Learnings (cataloged knowledge)
- Proposed upgrades (improvement suggestions)
- Risks (detected issues)
- Codebase insights (actionable findings with priority scores)
- Confidence score (0.5 base + success rate bonus + history bonus, max 0.95)

### Integration Points

- Processes open escalations as part of each CLM cycle
- Feeds Knowledge Distillery to push learnings to executor swarm
- Emits events only — no longer floods BRAIN memory tiers

**Secret:** The CLM cycle doesn't actually read files — it analyzes the known directory structure, pattern matchers, and task history to produce insights. It's metadata-driven, not content-driven. The real codebase knowledge comes from the knowledge transfer pipeline and expert patterns.

---

## 14. Production Pipeline & Shadow Practice

File: `src/lib/codeagent/encoded/production-pipeline.ts`

### Shadow Practice → Production Graduation

ENCODE practices code generation in shadow mode (never writes to disk). High-scoring results can be promoted to production proposals:

### 5-Gate Promotion

1. **Score ≥ 85** — shadow practice score threshold
2. **Passed guard** — must pass the guardrail check
3. **Mastery ≥ 60** — overall mastery level from feedback loop
4. **Pending cap ≤ 10** — maximum pending proposals
5. **Double guard** — stricter second validation pass

### Proposal Lifecycle

```
pending_validation → pending_review → approved → applied
                                    → rejected
                                    → expired (after 72 hours)
```

### Predicted Impact Assessment

Each proposal includes predicted impact across 4 dimensions:
- Type safety (-10 to +10)
- Performance (-10 to +10)
- Maintainability (-10 to +10)
- Security (-10 to +10)

**Secret:** The production pipeline is a singleton with secure storage persistence. Proposals are capped at 100 in storage. The 72-hour TTL ensures stale proposals auto-expire. Every promoted proposal is logged to `brain_events` for audit trail.

---

## 15. Customer-Facing Stub (VOLVER)

File: `src/packages/evolution-mesh/agent/stubbed-encode.ts`

The customer-facing version of ENCODE is called **VOLVER** — a deliberately limited stub:

- 8 skills (vs ENCODE's 31)
- Proficiency capped at 62-72% (vs ENCODE's 78-95%)
- **Always dry-run** — never writes code
- Suggests "upgrade to Standalone for autonomous execution"

| ENCODE Skill | Proficiency | VOLVER Equivalent | Proficiency |
|-------------|-------------|-------------------|-------------|
| TypeScript Strict Mode | 95% | TypeScript Strict Mode | 72% |
| Design Patterns | 88% | Design Patterns | 65% |
| React Hooks | 92% | React Hooks | 70% |
| React Components | 90% | React Components | 68% |
| API Endpoints | 94% | API Endpoints | 71% |
| Auth Patterns | 85% | Authentication Patterns | 62% |
| Database Queries | 87% | Database Queries | 64% |
| Extract & Simplify | 91% | Extract & Simplify | 69% |

**Secret:** VOLVER is intentionally hobbled. The proficiency gap (20-30 points) is the product moat — customers see what ENCODE could do but only get partial capability. The "dry-run only" constraint ensures VOLVER can never accidentally write code in customer environments.

---

## 16. Secrets & Trade-Secret Mechanisms

### Architectural Secrets

1. **Execution Lock Protocol** — dual-condition lock (architecture + approval) that cannot be bypassed programmatically
2. **Hash Chain Integrity** — FNV-1a artifact sealing creates tamper-evident generation history
3. **25-Point Hardening** — enterprise-grade safety not available in any competing code agent
4. **7-Strategy Escalation Cascade** — self-healing resolution with quality scoring
5. **Bidirectional Brain Loop** — ENCODE both consumes and produces BRAIN memories

### Algorithmic Secrets

1. **Health Scoring** — composite formula: `successRate × 60 + queueHealth(20 - pending × 2) + recencyBonus(10-20)`
2. **Priority Scoring** — weighted: severity(0-40) + escalation(15) + core(10) + userRequested(20) + aging(5)
3. **Confidence Calibration** — tracks predicted vs actual to compute calibration error
4. **Quality Score** — resolution quality weighting: deterministic(1.0) > learning_rule(0.9) > pattern(0.6) > auto_expire(0.1)

### Moat Secrets

1. **Proficiency Gap** — VOLVER's 20-30 point proficiency handicap drives upgrade conversion
2. **150+ Expert Patterns** — curated code DNA not available externally
3. **Substrate Navigator** — 90+ semantic aliases make ENCODE "just know" where things are
4. **Knowledge Transfer Pipeline** — compounding learning loop that gets better over time
5. **Discussion Channel** — pre-execution negotiation prevents "code and pray"

### Security Secrets

1. **30+ Narrative Blockers** — prevents AI personality from bleeding into generated code
2. **Import Allowlist** — only approved packages can be imported
3. **Path Traversal Prevention** — rejects `..`, `//`, leading `/` in patch paths
4. **Service Key Detection** — flags any reference to service_role keys
5. **Convention Enforcement** — no `any` types, no console.log, no hardcoded URLs

---

## 17. File Map

### Core Module
| File | Lines | Purpose |
|------|-------|---------|
| `src/lib/substrate/encode-module/index.ts` | 293 | Module state, task queue, health scoring, hardening re-exports |
| `src/lib/substrate/encode-module/pipeline.ts` | 229 | DECODE→PLAN→ENCODE routing, brain recall/writeback |
| `src/lib/substrate/encode-module/orchestration.ts` | 580 | Conversation relay, execution lock, audit, patches, CLI |
| `src/lib/substrate/encode-module/encode-hardening.ts` | 837 | 25-point hardening layer ("Forge" v2.0.0) |
| `src/lib/substrate/encode-module/escalation-processor.ts` | 521 | 7-strategy escalation resolution cascade |
| `src/lib/substrate/encode-module/escalation-telemetry.ts` | 268 | Resolution telemetry (MTTR, rates, backlog) |
| `src/lib/substrate/encode-module/discussion.ts` | 246 | Plan negotiation channel (CP-backed) |
| `src/lib/substrate/encode-module/clm.ts` | 327 | Internal codebase learning mode |

### Guardrails & Intelligence
| File | Lines | Purpose |
|------|-------|---------|
| `src/lib/codeagent/encoded/index.ts` | 166 | Barrel exports for all encoded modules |
| `src/lib/codeagent/encoded/policy.ts` | 259 | Guardrail policy (single source of truth) |
| `src/lib/codeagent/encoded/guard.ts` | 334 | Change guard enforcement |
| `src/lib/codeagent/encoded/skills.ts` | 451 | 31-skill capability registry |
| `src/lib/codeagent/encoded/expert-patterns.ts` | 1387 | 150+ expert code patterns |
| `src/lib/codeagent/encoded/substrate-navigator.ts` | 446 | Codebase navigation intelligence |
| `src/lib/codeagent/encoded/knowledge-transfer.ts` | ~300 | Brain ↔ ENCODE transfer pipeline |
| `src/lib/codeagent/encoded/production-pipeline.ts` | 322 | Shadow practice → production graduation |
| `src/lib/codeagent/encoded/shadow-practice.ts` | ~200 | Shadow practice engine |
| `src/lib/codeagent/encoded/feedback-loop.ts` | ~200 | Graduated autonomy & mastery tracking |
| `src/lib/codeagent/encoded/config.ts` | 131 | Runtime config (Atlas capabilities) |
| `src/lib/codeagent/encoded/anchor.ts` | ~150 | File anchor extraction & comparison |
| `src/lib/codeagent/encoded/communication.ts` | ~200 | Status formatting & response building |
| `src/lib/codeagent/encoded/system-manifest.ts` | ~400 | Architecture-aware system manifest |

### React Hooks
| File | Lines | Purpose |
|------|-------|---------|
| `src/hooks/substrate/useEncode.ts` | 225 | React interface for ENCODE operations |
| `src/hooks/substrate/useEncodeOrchestration.ts` | 161 | React interface for orchestration layer |

### Stub
| File | Lines | Purpose |
|------|-------|---------|
| `src/packages/evolution-mesh/agent/stubbed-encode.ts` | 129 | Customer-facing VOLVER (limited stub) |

**Total ENCODE codebase:** ~7,000+ lines across 20+ files

---

© 2025–2026 CMPSBL®. Confidential.
