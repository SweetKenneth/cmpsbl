# Self-Evolution Roadmap: Living Substrate Architecture

**Version:** 1.0.0  
**Status:** PLANNING  
**Created:** 2026-01-23  
**Classification:** INTERNAL / STRATEGIC

---

## Executive Summary

This roadmap outlines the path to transforming the PromptFluid Substrate from a **proposal-only** system into a **truly self-improving organism** that can:

1. **Detect** what needs improvement
2. **Generate** actual code to fix it
3. **Test** the code in isolation
4. **Apply** changes safely
5. **Learn** from the results

---

## Current State Analysis

### What Works Today

| Component | Capability | Limitation |
|-----------|------------|------------|
| **Modernizer** | Proposes improvements from catalog | Cannot write code |
| **Cascade-Coder** | Generates YAML patch specs | Patches are not applied |
| **Free-Tier Router** | Routes AI calls to 6+ providers | 12,000+ calls/day capacity |
| **Brain Continuous Learn** | Studies patterns | Doesn't generate code |
| **Improvement Engine** | Identifies archived functions | Only recommends, no action |

### The Gap

The system can **think** about improvements but cannot **act** on them. The code generation exists (Cascade-Coder) but the execution layer is missing.

---

## Proposed Architecture: The Living Substrate

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         LIVING SUBSTRATE v1.0.0                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────┐    ┌──────────────┐    ┌──────────────┐    ┌────────────┐  │
│  │   SCANNER   │───▶│   CODER      │───▶│   SANDBOX    │───▶│  APPLIER   │  │
│  │  Detects    │    │  Generates   │    │  Tests       │    │  Deploys   │  │
│  │  Issues     │    │  Code        │    │  In Isolation│    │  Safely    │  │
│  └─────────────┘    └──────────────┘    └──────────────┘    └────────────┘  │
│         │                  │                   │                   │         │
│         └──────────────────┴───────────────────┴───────────────────┘         │
│                                     │                                         │
│                              ┌──────▼──────┐                                 │
│                              │   BRAIN     │                                 │
│                              │  Learns     │                                 │
│                              │  From All   │                                 │
│                              └─────────────┘                                 │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Phase 1: Code Generation Layer (Week 1-2)

### 1.1 Enhance Cascade-Coder to Generate Executable Code

**Current:** Generates YAML patch specifications  
**Target:** Generates actual TypeScript/SQL that can be executed

```typescript
// New: pf-substrate-coder
interface CodeGenerationRequest {
  improvement_type: 'edge_function' | 'migration' | 'component' | 'hook';
  target_module: SubstrateModule;
  description: string;
  context: {
    existing_code?: string;
    related_files?: string[];
    brain_knowledge?: string[];
  };
}

interface CodeGenerationResult {
  code: string;
  file_path: string;
  operation: 'create' | 'modify' | 'delete';
  tests?: string;
  rollback_sql?: string;
}
```

### 1.2 Brain-Powered Context Injection

The Brain should feed learned patterns into code generation:

```typescript
// Before generating code, query Brain for:
const brainContext = await substrate.brain.recall({
  query: `code patterns for ${targetModule}`,
  limit: 10,
  include_embeddings: true
});

// Inject into code generation prompt
const prompt = `
You have access to these learned patterns:
${brainContext.patterns.map(p => p.content).join('\n')}

Generate code that follows these established patterns...
`;
```

---

## Phase 2: Sandboxed Execution (Week 3-4)

### 2.1 Option A: Database-First Sandbox (Recommended)

For SQL migrations and configuration changes, we can execute in a **shadow schema**:

```sql
-- Create shadow schema for testing
CREATE SCHEMA IF NOT EXISTS substrate_shadow;

-- Execute proposed migration in shadow first
SET search_path TO substrate_shadow;
-- Run migration...
-- Validate results...
-- If successful, apply to public schema
SET search_path TO public;
```

### 2.2 Option B: Edge Function Hot-Swap

For edge function changes, we can:

1. **Generate** the new function code
2. **Deploy** to a test endpoint (e.g., `pf-test-{function-name}`)
3. **Validate** with automated tests
4. **Promote** by renaming/redirecting

```typescript
// pf-substrate-deployer
async function deployTestFunction(name: string, code: string): Promise<{
  test_url: string;
  validation_results: TestResult[];
}> {
  // 1. Write to temporary function directory
  // 2. Deploy via Supabase Functions API
  // 3. Run validation suite
  // 4. Return results
}
```

### 2.3 Option C: External Sandbox (E2B/Vercel)

For full React component changes:

```typescript
// Integration with E2B or similar
interface SandboxExecution {
  provider: 'e2b' | 'vercel_preview' | 'internal';
  code: string;
  timeout_ms: number;
  validation_script: string;
}

async function executeSandboxed(config: SandboxExecution): Promise<{
  success: boolean;
  output: string;
  errors: string[];
  screenshots?: string[];
}> {
  // E2B provides sandboxed Node.js execution
  // Vercel provides preview deployments
  // Internal provides database-only testing
}
```

---

## Phase 3: Cognitive Agent Integration (Week 5-6)

### 3.1 Mint a "Substrate Coder" Bot via Forge

Use the Cognitive Forge to create a specialized coding agent:

```typescript
const substrateCoder: BotConfig = {
  name: 'Substrate Coder',
  type: 'coding',
  version: '1.0.0',
  capabilities: [
    'generate_edge_function',
    'generate_migration',
    'generate_component',
    'analyze_codebase',
    'run_tests',
    'apply_patch'
  ],
  memory_mode: 'substrate', // Uses Brain for memory
  learning_mode: 'continuous', // Learns from all actions
  providers: ['groq', 'cerebras', 'together'], // Free tier router
  system_prompt: `You are the Substrate Coder, an internal agent responsible for 
    maintaining and improving the PromptFluid Substrate. You can generate, test,
    and apply code changes. Always follow established patterns from Brain memory.
    Safety is paramount - never deploy without shadow testing.`
};
```

### 3.2 Agent Loop Architecture

```typescript
// The living substrate loop
async function selfEvolutionCycle() {
  // 1. SCAN: What needs improvement?
  const issues = await substrate.modernizer.scan({ scope: 'all' });
  
  // 2. PRIORITIZE: What's most impactful?
  const priority = await substrate.brain.analyze({
    issues,
    criteria: ['impact', 'safety', 'dev_time']
  });
  
  // 3. GENERATE: Write the code
  const patch = await substrate.coder.generate({
    issue: priority[0],
    context: await substrate.brain.recall({ query: priority[0].module })
  });
  
  // 4. SANDBOX: Test in isolation
  const testResult = await substrate.sandbox.execute({
    code: patch.code,
    tests: patch.tests
  });
  
  // 5. APPLY (if safe): Deploy to production
  if (testResult.passed && testResult.health > 95) {
    await substrate.deployer.apply({
      patch,
      rollback: patch.rollback_sql,
      audit_log: true
    });
  }
  
  // 6. LEARN: Record what happened
  await substrate.brain.learn({
    event: 'self_evolution_cycle',
    issue: priority[0],
    patch_applied: testResult.passed,
    outcome: testResult
  });
}
```

---

## Phase 4: Safety & Governance (Ongoing)

### 4.1 Approval Gates

```typescript
interface EvolutionGate {
  // Level 0: Automatic (config tweaks, prompt updates)
  auto_apply: ['prompt_refinement', 'rate_limit_adjustment'];
  
  // Level 1: Shadow-only (tests, validates, waits for human)
  shadow_first: ['edge_function', 'database_index', 'rls_policy'];
  
  // Level 2: Proposal-only (generates, never applies)
  human_required: ['schema_change', 'auth_flow', 'api_breaking'];
}
```

### 4.2 Rollback System

Every applied change stores a rollback script:

```typescript
interface AppliedChange {
  id: string;
  applied_at: string;
  change_type: string;
  forward_sql: string;
  rollback_sql: string;
  health_before: number;
  health_after: number;
  can_rollback: boolean;
  rolled_back_at?: string;
}
```

### 4.3 Rate Limiting Self-Modification

```typescript
const EVOLUTION_LIMITS = {
  max_changes_per_hour: 3,
  max_changes_per_day: 10,
  min_health_to_evolve: 90,
  cooldown_after_rollback: '6h',
  blackout_periods: ['02:00-04:00 UTC'], // Maintenance window
};
```

---

## Phase 5: Continuous Learning Loop (Week 7-8)

### 5.1 Brain Learns From All Code

```typescript
// Every time code is written (by human or agent), Brain learns
async function learnFromCode(code: string, metadata: {
  file_path: string;
  author: 'human' | 'agent';
  outcome: 'success' | 'failure' | 'rollback';
}) {
  // Extract patterns
  const patterns = await extractCodePatterns(code);
  
  // Store in Brain's long-term memory
  await substrate.brain.remember({
    content: patterns,
    context: 'code_pattern',
    tags: [metadata.file_path, metadata.author],
    reinforcement: metadata.outcome === 'success' ? 1.0 : -0.5
  });
  
  // Update embeddings for similarity search
  await substrate.brain.embed({
    content: code,
    metadata
  });
}
```

### 5.2 Predictive Code Generation

The Brain should predict what code is likely to succeed:

```typescript
// Before generating new code, check historical success rates
const prediction = await substrate.brain.predict({
  query: 'edge_function for authentication',
  return: 'success_probability'
});

if (prediction.probability < 0.7) {
  // Request more context or human review
  await substrate.vision.alert({
    level: 'warning',
    message: 'Low confidence code generation requested',
    data: prediction
  });
}
```

---

## Implementation Priorities

| Priority | Component | Effort | Impact | Dependencies |
|----------|-----------|--------|--------|--------------|
| 🔴 P0 | SQL Sandbox (shadow schema) | 2 days | High | None |
| 🔴 P0 | Brain context injection | 3 days | High | None |
| 🟠 P1 | Enhanced Cascade-Coder | 1 week | Critical | P0 complete |
| 🟠 P1 | Rollback infrastructure | 3 days | Critical | P0 complete |
| 🟡 P2 | Edge function hot-swap | 1 week | Medium | P1 complete |
| 🟡 P2 | Forge Coder bot | 3 days | Medium | P1 complete |
| 🟢 P3 | E2B/Vercel integration | 2 weeks | High | P2 complete |
| 🟢 P3 | Full autonomous loop | 1 week | High | All complete |

---

## Technical Decisions

### Why Not Just Use Lovable?

Lovable is the **external agent** that implements changes. The goal is to create an **internal agent** that:

1. Operates 24/7 without human prompting
2. Uses the substrate's own resources (Brain, Forge, Router)
3. Learns from the specific codebase
4. Follows substrate-specific patterns

Lovable remains the **implementation partner** for complex changes that require full file system access.

### Why Free-Tier Router?

Cost efficiency. The substrate can make 12,000+ AI calls per day for free:

- Groq: 800/day (fastest)
- Cerebras: 11,520/day (high volume)
- SambaNova: 32/day (very fast)
- Together/Hyperbolic/DeepSeek: Unlimited

This is sufficient for continuous self-improvement without billing concerns.

### Why Database Sandbox First?

Most substrate improvements are:
- SQL migrations (new tables, indexes, RLS)
- Configuration changes (rate limits, thresholds)
- Edge function updates

All of these can be tested in a shadow schema before production.

---

## Success Metrics

| Metric | Current | Target (90 days) |
|--------|---------|------------------|
| Improvements proposed/week | 0 | 50 |
| Improvements auto-applied/week | 0 | 10 |
| Code changes requiring human | 100% | 30% |
| Rollbacks required | N/A | <5% |
| Brain code pattern knowledge | ~0 | 10,000+ patterns |

---

## Risks & Mitigations

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Infinite loop of bad changes | Medium | Critical | Health threshold gates |
| Breaking production | High | Critical | Shadow-first deployment |
| Runaway costs | Low | Medium | Free-tier router only |
| Learning wrong patterns | Medium | High | Reinforcement decay |
| Security vulnerabilities | Low | Critical | RLS on all substrate tables |

---

## Next Steps

1. **Immediate (This Week):**
   - Create `substrate_shadow` schema for testing
   - Enhance `pf-cascade-coder` to output executable TypeScript
   - Add rollback infrastructure to `substrate_applied_improvements`

2. **Short-Term (Next 2 Weeks):**
   - Implement Brain context injection
   - Create `pf-substrate-sandbox` edge function
   - Build approval gate system

3. **Medium-Term (Next Month):**
   - Mint Substrate Coder bot via Forge
   - Implement autonomous evolution loop
   - Connect to external sandbox (E2B or Vercel)

---

## Conclusion

The path to a truly self-improving substrate is achievable with the existing architecture. The key insight is:

> **Don't replace the human—augment the loop.**

The system should:
- ✅ Generate code (Cascade-Coder + Brain context)
- ✅ Test code (Shadow schema + validation)
- ✅ Apply safe changes (Approval gates + rollback)
- ✅ Learn continuously (Brain reinforcement)
- ⚠️ Escalate complex changes (To Lovable or human)

This creates a **living organism** that handles routine improvements autonomously while still deferring to humans for architectural decisions.

---

*"The best systems don't just run—they evolve."*
