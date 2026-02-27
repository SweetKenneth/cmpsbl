# Evolution Mesh — Product Specification

## One-Liner
**A self-learning immune system for your software.** Drop it in, wrap your functions, and your codebase evolves its own defenses.

---

## Distribution Model
**SDK + Dashboard SaaS** — npm package ships the runtime; telemetry dashboard hosted on CMPSBL infrastructure.

## Target
**Framework-agnostic** — Any JavaScript/TypeScript async function. Express, Fastify, Next.js, Deno, Bun, plain Node.

---

## Core SDK (`@cmpsbl/evolution-mesh`)

### 1. `wrap(fn, config?)` — The Core Primitive
Wraps any async function with immune defense:
- **Preflight validation** — Schema-driven input checking
- **Archetype classification** — Categorizes bad inputs (injection, empty shell, type mismatch, etc.)
- **Deterministic repair** — 29+ non-AI repair strategies attempt to fix inputs
- **Safe-fail** — Garbage inputs rejected gracefully, never crash
- **Postcheck** — Output validation after execution
- **Telemetry** — Every execution tracked for learning

```typescript
import { wrap } from '@cmpsbl/evolution-mesh';

const protectedEndpoint = wrap(myHandler, {
  schema: {
    email: { type: 'string', required: true },
    age: { type: 'number' },
  },
});
```

### 2. Schema Validator
- Declarative field schemas (type, required, min/max, enum, default)
- **Input Archetypes**: well_formed, empty_shell, type_mismatch, missing_required, oversized, injection_attempt, shape_alien, partial_valid
- Injection detection (SQL, XSS, prototype pollution, path traversal)

### 3. Deterministic Repair Engine
29+ repair strategies that run without AI:
- NORMALIZE_NULLS, CLAMP_SIZE, JSON_FALLBACK, SANITIZE
- FLATTEN_ARRAY, SQL_SANITIZE, ENUM_CLAMP, COERCE_TYPE
- PROTO_GUARD, CONTROL_CHAR_STRIP, HTML_ANGLE_ENCODE
- PATH_TRAVERSAL_STRIP, ZERO_WIDTH_STRIP, URL_NORMALIZE
- EMOJI_FLOOD_COLLAPSE, WHITESPACE_NORMALIZE, and more

### 4. Shared Rule Registry
- Rules learned from successful repairs propagate across wrapped functions
- Cross-function learning: if function A learns to fix a type_mismatch, function B gets the rule too
- Rules have confidence scores — low performers auto-demote
- Category-based compatibility: security rules don't leak to content handlers

### 5. Shadow Mode
Test changes against real traffic without risk:
- **Shadow Run**: Execute candidate code path in parallel, compare results
- **Diff Generation**: Structured comparison of before/after behavior
- **Governed Promotion**: Only apply changes that pass all gates

### 6. Outcome Tracking
- Per-function success rates, repair rates, escalation counts
- Archetype distribution over time
- Performance decay detection (skills degrade without practice)

---

## SaaS Dashboard (Hosted)

The SDK ships a `<EvolutionDashboard />` React component (optional) and reports telemetry to `telemetry.cmpsbl.dev`:

- **Health Overview**: All wrapped functions, status, success rates
- **Repair Analytics**: Which strategies fire most, success rates
- **Learning Curve**: How the system improves over time
- **Alert Feed**: Escalations, critical failures, new attack patterns
- **Shadow Mode UI**: Run/review/promote from the browser

---

## Pricing Tiers

| Tier | Price | Wrapped Functions | Telemetry Retention | Dashboard |
|------|-------|-------------------|---------------------|-----------|
| **Open Source** | $0 | 5 | Local only | CLI only |
| **Pro** | $29/mo | 50 | 30 days | Full SaaS |
| **Team** | $99/mo | 250 | 90 days | Full + SSO |
| **Enterprise** | Custom | Unlimited | 1 year | Self-hosted option |

---

## npm Package Structure

```
@cmpsbl/evolution-mesh/
├── core/
│   ├── wrap.ts           — Main wrapper function
│   ├── preflight.ts      — Input validation
│   ├── postcheck.ts      — Output validation
│   └── safe-fail.ts      — Graceful failure handling
├── schema/
│   ├── validator.ts      — Schema-driven validation
│   ├── archetypes.ts     — Input archetype classification
│   └── types.ts          — FieldSchema, ValidationReport
├── repair/
│   ├── deterministic.ts  — 29+ repair strategies
│   ├── intelligent.ts    — Contextual repair selection
│   └── chains.ts         — Compositional repair pipelines
├── learning/
│   ├── rules.ts          — Shared rule registry
│   ├── propagation.ts    — Cross-function learning
│   └── decay.ts          — Performance decay tracking
├── shadow/
│   ├── probe.ts          — Shadow execution engine
│   ├── diff.ts           — Behavioral diff generation
│   └── promote.ts        — Governed promotion pipeline
├── telemetry/
│   ├── tracker.ts        — Local outcome tracking
│   ├── reporter.ts       — SaaS telemetry reporter
│   └── dashboard.tsx     — Optional React component
└── index.ts              — Public API surface
```

---

## Black-Box Protection

The SDK ships compiled/minified. Source maps excluded from npm.
Internal repair strategies and learning algorithms are trade secrets.
Dashboard component communicates via encrypted telemetry channel.

---

## API Surface (Public Exports)

```typescript
// Core
export { wrap, type WrapConfig } from './core/wrap';
export { defineSchema, type FieldSchema, type ExecutorSchema } from './schema/validator';
export type { InputArchetype, ValidationReport } from './schema/archetypes';

// Shadow Mode
export { shadow, diff, promote } from './shadow';

// Telemetry
export { EvolutionDashboard } from './telemetry/dashboard';
export { configure, type EvolutionConfig } from './config';

// Learning (read-only)
export { getRules, getPerformance } from './learning/rules';
```

---

## Competitive Positioning

| Feature | Evolution Mesh | Istio | Chaos Monkey | Zod |
|---------|---------------|-------|--------------|-----|
| Input validation | ✅ | ❌ | ❌ | ✅ |
| Auto-repair | ✅ | ❌ | ❌ | ❌ |
| Shadow testing | ✅ | ✅ | ✅ | ❌ |
| Self-learning | ✅ | ❌ | ❌ | ❌ |
| Governed promotion | ✅ | ❌ | ❌ | ❌ |
| Framework-agnostic | ✅ | ❌ (K8s only) | ❌ (infra) | ✅ |
| Zero config start | ✅ | ❌ | ❌ | ✅ |

---

## Tagline Options
- "Your code's immune system."
- "Software that evolves its own defenses."
- "The last resilience layer you'll ever need."
