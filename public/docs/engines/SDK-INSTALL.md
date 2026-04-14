# CMPSBL® Engine SDK — Universal Installation Guide

**Version:** 1.0.0  
**License:** Per-engine perpetual license  
**Delivery:** Hosted API + Copy-paste SDK  
**Runtime:** CMPSBL® Convex Core™ Processing Layer  

---

## How Engines Work

All CMPSBL® Engines run on the CMPSBL Substrate — a secured, hosted runtime. You interact with engines through a single API endpoint using the **CMPSBL® Engine SDK**, a zero-dependency TypeScript client you copy into your project.

**Exception:** FAILSAFE is the only standalone engine — it deploys as a self-contained edge function directly into your own infrastructure. See [FAILSAFE instructions](#failsafe-standalone-engine) below.

---

## Quick Start

### 1. Get Your API Key

Visit [cmpsbl.com/api-access](https://cmpsbl.com/api-access), create a developer account, and generate an API key with the `engines` scope.

### 2. Copy the SDK

Copy `cmpsbl-engine-sdk.ts` into your project:

```
your-project/src/lib/cmpsbl-engine-sdk.ts
```

### 3. Use It

```typescript
import { Engine } from './lib/cmpsbl-engine-sdk';

const engine = new Engine('your-api-key');

// Call any engine by slug:
const result = await engine.call('cortex', 'reason', 'Analyze this market opportunity');

// Or use typed helpers for META engines:
const r = await engine.cortex.reason('Strategic implications of vertical AI');

console.log(r.result);      // Final answer
console.log(r.confidence);   // 0-1 score
console.log(r.pipeline);     // Per-stage breakdown
```

---

## API Reference

### `engine.call(slug, action, input, context?, options?)`

The universal method — works with all 54 engines.

| Parameter | Type | Description |
|-----------|------|-------------|
| `slug` | `string` | Engine name (e.g., `'cortex'`, `'sentinel'`, `'cortex'`) |
| `action` | `string` | Engine-specific action (e.g., `'reason'`, `'scan'`, `'predict'`) |
| `input` | `string` | The primary input text |
| `context` | `object?` | Optional context passed to the engine pipeline |
| `options` | `object?` | Processing options (see below) |

### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `depth` | `'shallow' \| 'standard' \| 'deep'` | `'standard'` | Processing depth — affects token budget and thoroughness |
| `stages` | `string[]?` | all | Limit which pipeline stages run (engine-specific stage names) |
| `temperature` | `number` | `0.7` | AI temperature (0–1) |

### Response Shape

```typescript
{
  success: boolean;
  engine: string;         // Engine codename
  action: string;         // Action performed
  result: string;         // Final output from last pipeline stage
  confidence: number;     // 0-1 confidence score
  pipeline: {
    stages: [{
      stage: string;      // Stage name (e.g., 'REASON')
      output: string;     // Stage output
      confidence: number; // Stage confidence
      tokens: number;     // Tokens used
      latency_ms: number; // Stage latency
    }];
    total_tokens: number;
    total_latency_ms: number;
    depth: string;
  };
}
```

---

## Error Handling

```typescript
import { Engine, EngineAPIError } from './lib/cmpsbl-engine-sdk';

const engine = new Engine('your-api-key');

try {
  const result = await engine.call('cortex', 'reason', 'Your input here');
  console.log(result.result);
} catch (err) {
  if (err instanceof EngineAPIError) {
    switch (err.status) {
      case 401: console.error('Invalid API key'); break;
      case 403: console.error('Key missing engine scope'); break;
      case 429: console.error('Rate limit exceeded — retry later'); break;
      default:  console.error('Engine error:', err.message);
    }
  }
}
```

---

## Engine Catalog

### META Engines ($1,999 · 4-stage superpipelines)

| Engine | Actions | Pipeline |
|--------|---------|----------|
| **CORTEX** | reason, analyze, plan, evaluate | REASON → AXIOM → SYNAPSE → ECHO |
| **DEFENSE** | defend, audit, harden, assess | SHIELD → GUARD → HARDEN → ASSESS |
| **ORACLE** | predict, fuse, optimize, synthesize | PREDICT → FUSE → OPTIMIZE → SYNTHESIZE |
| **GOVERNANCE** | govern, audit, comply, automate | GOVERN → AUDIT → COMPLY → AUTOMATE |

### APEX Engines ($999 · 2-stage pipelines)

| Engine | Actions |
|--------|---------|
| SENTINEL | scan, defend, monitor, respond |
| PHANTOM | heal, failover, monitor, recover |
| NEXUS | route, optimize, balance, evaluate |
| PRISM | search, extract, map, query |
| GENESIS | triage, recover, analyze, prevent |
| GOVERN | govern, audit, comply, gate |
| COLOSSUS | orchestrate, scale, optimize, command |
| HARBINGER | predict, detect, contain, neutralize |
| PROMETHEUS | evolve, mutate, validate, improve |
| PREDICT | predict, forecast, analyze, simulate |
| LEVIATHAN | remember, recall, synchronize, predict |
| CHIMERA | adapt, personalize, detect, reshape |
| TITAN | stabilize, consensus, optimize, regulate |
| WRAITH | test, mutate, shadow, rollback |
| APEX ONE | decide, explain, forecast, optimize |
| REASON | hypothesize, plan, explore, bootstrap |
| ASSESS | heal, isolate, fallback, repair |
| SPECTER | stealth, trap, unmask, verify |
| ATLAS | weave, search, compress, translate |
| SHIELD | guard, sanitize, validate, veto |
| OBELISK | audit, verify, attest, replay |
| PHOENIX | triage, transplant, diagnose, predict |
| NEXUS PRIME | consensus, route, optimize, prioritize |
| CHRONOS | reason, trace, simulate, precompute |
| AUTOMATE | compose, resolve, decompose, schedule |
| AXIOM | prove, solve, deduce, infer |
| OPTIMIZE | optimize, budget, arbitrage, detect |
| GUARD | enforce, isolate, propagate, arbitrate |
| SYNAPSE | relay, bridge, thread, route |
| HARDEN | chaos, mutate, simulate, stress |
| ECHO | track, learn, calibrate, correct |
| FUSE | fuse, correlate, synthesize, denoise |
| COMPLY | checkpoint, migrate, synchronize, compact |
| AUDIT | evaluate, detect, audit, align |
| SYNTHESIZE | genesis, evolve, harden, forge |

### ELITE Engines ($599 · 2-stage pipelines)

| Engine | Actions |
|--------|---------|
| CORTEX | orchestrate, delegate, coordinate, balance |
| FORGE | generate, refactor, test, analyze |
| ORACLE | predict, detect, process, forecast |
| VANGUARD | distribute, cache, process, route |
| CONDUCTOR | pipeline, stream, track, evolve |
| ARBITER | route, limit, version, shape |
| MIRAGE | route, aggregate, match, scale |

### CORE Engines ($199 · single-stage)

| Engine | Actions |
|--------|---------|
| AUTOMATON | automate, schedule, trigger, compose |
| CATALYST | publish, source, decouple, replay |
| BEACON | monitor, trace, log, alert |
| BASTION | balance, route, failover, scale |
| CIPHER | cache, invalidate, tier, evict |
| MERIDIAN | deliver, optimize, route, purge |
| AEGIS | govern, authenticate, rotate, audit |

---

## Typed Meta-Engine Helpers

META engines have typed proxy objects with autocomplete:

```typescript
// CORTEX
await engine.cortex.reason('...');
await engine.cortex.analyze('...');
await engine.cortex.hypothesize('...');  // REASON stage only
await engine.cortex.deepReason('...');    // Full pipeline, deep mode

// DEFENSE
await engine.defense.defend('...');
await engine.defense.harden('...');

// ORACLE
await engine.oracle.predict('...');
await engine.oracle.fuse('...');

// GOVERNANCE
await engine.governance.govern('...');
await engine.governance.comply('...');
```

For all other engines, use the universal `engine.call()` method.

---

## FAILSAFE — Standalone Engine

FAILSAFE is the **only standalone engine** in the CMPSBL arsenal. Unlike all other engines that run on the hosted CMPSBL Substrate, FAILSAFE deploys as a self-contained edge function directly into your own infrastructure.

**No API key or SDK needed.** See `public/docs/engines/failsafe/INSTALL.md` for deployment instructions.

---

## Rate Limits

| Tier | Daily Calls | Tokens/Day |
|------|------------|------------|
| Free | 50 | 50,000 |
| Studio | 500 | 500,000 |
| Creator | 2,000 | 2,000,000 |
| Architect | 10,000 | 10,000,000 |

Rate limits are per-API-key. Contact sales for enterprise limits.

---

© 2025–2026 CMPSBL®. All rights reserved.
