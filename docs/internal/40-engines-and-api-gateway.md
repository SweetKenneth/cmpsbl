# 40 — Composable Engines & Unified API Gateway

**Classification:** 🔒 INTERNAL — Trade Secret  
**Version:** v14.2.0 — MINDGAMES Epoch

---

## 1. Purpose

This document describes the Composable Engines product line — 54 productized AI engines built from S-Tier substrate capabilities — and the Unified API Gateway that delivers them to customers. This covers the engine registry, the API gateway architecture, the SDK, and the FAILSAFE standalone exception.

## 2. Engine Taxonomy

### 2.1 Tier Structure

| Tier | Count | Price | Description |
|------|-------|-------|-------------|
| META | 4 | $1,999.00 | Recursive super-engines chaining multiple S-tier engines |
| APEX | 10 | $999.00 | Premium single-domain engines with deep specialization |
| ELITE | 16 | $599.00 | High-capability engines for specific professional workflows |
| CORE | 24 | Included | Foundation engines available to all subscribers |

All engines receive a **40% discount** when bundled with an agent purchase.

### 2.2 META Engines (4-Stage Superpipelines)

META engines are the flagship products. Each chains 4 specialized S-tier engines in sequence:

| Engine | Codename | Pipeline | Actions |
|--------|----------|----------|---------|
| GODMIND | Cognitive Superpipeline | PANDORA → AXIOM → SYNAPSE → ECHO | reason, analyze, plan, evaluate |
| FORTRESS | Security Citadel | CITADEL → PHANTOM → IMMUNITY → SENTINEL | scan, assess, harden, verify |
| OMNISCIENT | Intelligence Nexus | ORACLE → HARVEST → COMPASS → ATLAS | predict, gather, navigate, govern |
| GENESIS | Creation Engine | FORGE → LINGUA → ENCODE → VISION | create, translate, implement, visualize |

### 2.3 Delivery Model

All engines except FAILSAFE are **hosted** — they run on the substrate and are accessed via the Unified API Gateway. Customers never receive source code for hosted engines.

**FAILSAFE** is the sole **standalone** engine — delivered as a self-contained edge function that customers deploy independently.

## 3. Unified API Gateway

### 3.1 Architecture

```
Customer Request
    ↓
POST /functions/v1/engine-api
    ↓
API Key Validation (X-Engine-Key header)
    ↓
Rate Limit Check (access_quotas)
    ↓
Engine Registry Lookup
    ↓
Multi-Stage Pipeline Execution (via NEXUS router)
    ↓
Response Aggregation
    ↓
Usage Logging (access_usage)
    ↓
JSON Response
```

### 3.2 Request Format

```json
{
  "engine": "godmind",
  "action": "reason",
  "input": "Analyze the competitive landscape...",
  "depth": "thorough",
  "options": {}
}
```

### 3.3 Response Format

```json
{
  "engine": "godmind",
  "action": "reason",
  "stages": [
    { "name": "PANDORA", "output": "...", "confidence": 0.92 },
    { "name": "AXIOM", "output": "...", "confidence": 0.88 },
    { "name": "SYNAPSE", "output": "...", "confidence": 0.91 },
    { "name": "ECHO", "output": "...", "confidence": 0.90 }
  ],
  "final_output": "...",
  "total_confidence": 0.90,
  "tokens_used": 4200,
  "latency_ms": 3400
}
```

### 3.4 Authentication

- API keys are validated against `access_api_keys` table
- Keys are matched by `key_prefix` (first 8 characters)
- Expired keys are rejected
- Inactive keys are rejected
- Scopes are checked for engine access permissions

### 3.5 Rate Limiting

| Check | Source | Action on Breach |
|-------|--------|-----------------|
| Per-minute limit | `access_api_keys.rate_limit_per_minute` | 429 response |
| Per-day limit | `access_api_keys.rate_limit_per_day` | 429 response |
| Quota tracking | `access_quotas` table | Usage recorded per day |

### 3.6 Pipeline Execution

For multi-stage engines (META tier), stages execute sequentially:

1. Stage 1 receives the raw user input
2. Stages 2–N receive the raw input PLUS all prior stage outputs
3. Each stage runs through NEXUS with its own system prompt
4. All stage outputs are collected and returned
5. The final stage's output becomes `final_output`

**Failure handling:** If any stage fails, the pipeline returns a partial result with the failed stage marked and all successful prior stages included.

## 4. Engine SDK

### 4.1 File: `public/docs/engines/cmpsbl-engine-sdk.ts`

The SDK is a **zero-dependency TypeScript client** shipped to customers:

```typescript
const engine = cmpsbl({ apiKey: 'ek_...' });

// Typed META engine access
const result = await engine.godmind.reason('Analyze this...');

// Universal engine access
const result = await engine.call('sentinel', 'monitor', 'Check for...');
```

### 4.2 SDK Features

| Feature | Description |
|---------|-------------|
| Auto-retry | 3 attempts with exponential backoff |
| Typed proxies | `.godmind`, `.fortress`, `.omniscient`, `.genesis` |
| Universal method | `.call(slug, action, input, options)` |
| Error handling | Typed error codes (auth, rate_limit, engine_error) |
| Full catalog | `CMPSBL_ENGINE_CATALOG` constant with all 54 engines |

## 5. FAILSAFE — Standalone Exception

### 5.1 Why Standalone

FAILSAFE is the **only** engine delivered as standalone code because:
- It must function during substrate outages (by definition)
- It cannot depend on the API gateway being available
- Customers deploy it to their own infrastructure

### 5.2 Delivery

- Self-contained Deno edge function
- Zero external dependencies
- Includes: full system backup, health diagnostics, restore instructions
- Deployed via the customer's own edge function runtime

### 5.3 Documentation

FAILSAFE ships with its own `INSTALL.md` covering:
- Deployment to Deno Deploy, Supabase Edge Functions, or Cloudflare Workers
- Environment variable configuration
- Cron-based automated backup scheduling

## 6. Engine Registry Architecture

### 6.1 Internal Registry (`engine-api/index.ts`)

Each engine is defined with:
- `slug` — URL-safe identifier
- `codename` — Display name
- `stages[]` — Pipeline stage definitions with system prompts
- `actions[]` — Permitted action types
- `description` — Human-readable description

### 6.2 Adding New Engines

To add a new engine:
1. Define the engine entry in `ENGINE_REGISTRY`
2. Add stage definitions with specialized system prompts
3. Update the SDK catalog (`CMPSBL_ENGINE_CATALOG`)
4. Update the Engines page UI (`src/pages/Engines.tsx`)
5. Update the `SDK-INSTALL.md` documentation

No database migration required — the registry is code-defined.

## 7. Security

| Concern | Mitigation |
|---------|-----------|
| Source code exposure | Hosted engines never expose source. FAILSAFE is the sole exception. |
| API key leakage | Keys are hashed in storage, matched by prefix only |
| Prompt extraction | System prompts are server-side only, never returned in responses |
| Rate abuse | Per-minute and per-day limits enforced at gateway level |
| Cross-tenant isolation | API key scopes enforce engine-level access control |

## 8. Commercial Model

| Feature | Details |
|---------|---------|
| Individual purchase | Full price per tier |
| Agent bundle discount | 40% off when purchased with an agent |
| Free tier engines | CORE engines included with any subscription |
| Usage-based billing | Token consumption tracked in `access_usage` |
| Quota management | Monthly quotas per subscription tier |

---

## Revision History

| Date | Author | Change |
|------|--------|--------|
| 2026-03-12 | System | Initial Engines & API Gateway documentation — v14.2.0 |

---

© 2025–2026 PromptFluid®. Confidential — Trade Secret.
