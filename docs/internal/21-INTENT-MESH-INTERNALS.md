<div align="center">

# 🔒 Intent Mesh — Internal Architecture & Trade Secrets

### CMPSBL OS Substrate v10.0.0

**Classification:** CONFIDENTIAL — Trade Secrets  
**Sensitivity:** 🔴 Critical  
**Audience:** Founders · Lead Engineers · Authorized Investors (NDA)

</div>

---

> ⚠️ **This document contains proprietary algorithms, implementation details, and trade secrets.**
> Do not distribute outside of CMPSBL/PromptFluid without written authorization.

---

## 1. Why This Matters (Crown Jewel Status)

The Intent Mesh is classified as a **Crown Jewel** artifact because:

1. **No known prior art** — No competing system combines autonomous module discovery with governed composition and cryptographic auditability
2. **Exponential moat** — Each new resolver multiplies possible interaction paths (n×m combinatorial growth)
3. **Data flywheel** — Every receipt generates training data for future mesh optimization
4. **Patent-eligible** — The combination of capability advertisement, intent routing, risk gating, and receipt generation is novel

---

## 2. Implementation Internals

### 2.1 File Structure

```
src/lib/substrate/intent-mesh/
├── types.ts       — Type definitions (MeshResolver, MeshIntent, MeshResolution, MeshReceipt)
├── manifest.ts    — Capability manifest (20 resolvers, 11 modules)
├── router.ts      — Intent router (broadcast, resolve, compose, log)
├── toggle.ts      — Kill switch (Zustand + persist)
└── index.ts       — Public API surface
```

### 2.2 Router Algorithm (Trade Secret)

The router uses a **domain-intersection matching** algorithm:

1. Intent broadcasts with `domains: ['security', 'identity']`
2. Router scans all resolvers whose `domains` array **intersects** with the intent's domains
3. Source module is excluded (anti-self-query)
4. Risk gating filters based on governance mode
5. Remaining resolvers execute **in parallel** (all `read` risk = safe for concurrent execution)
6. Results are **merged** via `Object.assign` — last resolver wins for duplicate keys (deterministic due to manifest ordering)

**Critical Detail:** The merge strategy is intentionally simple (last-write-wins) to avoid complexity. Future versions may implement weighted merge based on resolver confidence scores.

### 2.3 Receipt Sanitization

Receipts undergo sanitization before database storage:
- Keys containing `password`, `secret`, `token`, `key`, `api_key` → `[REDACTED]`
- String values > 200 chars → truncated with `...`
- Receipts are fire-and-forget (non-blocking) to avoid latency impact

### 2.4 Resolver Execution (Current vs Future)

**Current (v10.0):** Resolvers return structured placeholders showing provenance (`[MODULE:output_key]`). This proves routing works without requiring live module endpoints.

**Future (v10.1+):** Resolvers will call actual module APIs or edge functions. The transition requires:
- Each module implementing a `resolve()` function matching its advertised schema
- The router calling module resolvers dynamically via the Engine Bus
- Response validation against declared `produces` schema

---

## 3. Governance Internals

### 3.1 Kill Switch Implementation

The kill switch uses Zustand with `persist` middleware to survive page reloads:

```typescript
// Non-hook version for library code (outside React components)
export function isMeshEnabled(): boolean {
  return useMeshToggle.getState().enabled;
}
```

This is checked at the top of `broadcastIntent()` — zero-cost exit when disabled.

### 3.2 Risk Escalation Path (Future)

Planned for v10.2:
1. `read` → No approval needed
2. `enrich` → Logged, may require human review in `governed` mode
3. `mutate` → Requires explicit human approval (dashboard prompt or terminal confirm)

---

## 4. Database Schema

```sql
CREATE TABLE public.mesh_intents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  intent_type TEXT NOT NULL,
  source_module TEXT NOT NULL,
  target_modules TEXT[] DEFAULT '{}',
  resolved_by TEXT[] DEFAULT '{}',
  input_summary JSONB DEFAULT '{}',
  output_summary JSONB DEFAULT '{}',
  governance_mode TEXT DEFAULT 'read_only',
  success BOOLEAN DEFAULT false,
  duration_ms INTEGER DEFAULT 0,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

**RLS:** Admin-only (SELECT/INSERT restricted to users with `admin` role via `has_role_text` RPC).

---

## 5. Strategic Roadmap

| Version | Feature | Status |
|---------|---------|--------|
| v10.0 | Core mesh + manifest + receipts | ✅ Shipped |
| v10.1 | Live resolver execution (actual module APIs) | 🔄 Planned |
| v10.2 | Risk escalation prompts | 🔄 Planned |
| v10.3 | Weighted merge with confidence scoring | 🔄 Planned |
| v10.4 | Self-evolving manifest (modules register dynamically) | 🔄 Research |
| v10.5 | Cross-substrate mesh (federated intent routing) | 🔄 Research |

---

## 6. Attack Surface Analysis

| Threat | Mitigation |
|--------|------------|
| Resolver spoofing | Manifest is compile-time constant; cannot be modified at runtime |
| Intent flooding | Rate limiting at router level (planned v10.2) |
| Data exfiltration via receipts | Input/output sanitization; sensitive keys redacted |
| Unauthorized mesh activation | Kill switch OFF by default; toggle persisted per-device |
| Cross-module privilege escalation | Risk gating blocks mutations in `read_only` mode |

---

<div align="center">

*CMPSBL OS Substrate v10.0.0 — Intent Mesh Internals — CONFIDENTIAL*

**Kenneth E Sweet Jr** · PromptFluid®  
ORCID: [XXXX-XXXX-XXXX-XXXX](https://orcid.org/XXXX-XXXX-XXXX-XXXX)  
DOI: [10.5281/zenodo.XXXXXXX](https://doi.org/10.5281/zenodo.XXXXXXX)

© 2025–2026 PromptFluid®. All rights reserved.

</div>
