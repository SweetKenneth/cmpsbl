# Audit System — Internal Documentation

## Overview

The CMPSBL Substrate includes a multi-layer audit and verification framework located at `src/lib/audit/`. This framework validates production readiness across the entire stack.

---

## Components

### 1. Production Audit Engine (`audit-runner.ts`)
The original audit engine that orchestrates category-specific checks (build, runtime, routes, imports, hooks, modules, terminal, supabase, UI, a11y, SEO, docs). Produces an `AuditReport` with severity-graded findings and a hard pass/fail gate.

### 2. Audit Checks (`checks/`)
Eight specialized check modules:
- `system-manifest.ts` — System manifest validation
- `routes.ts` — Route contract verification
- `terminal.ts` — Terminal command registry validation
- `modules.ts` — Module health checks
- `seo.ts` — SEO metadata validation
- `ui-contracts.ts` — UI component contract checks
- `hooks-contracts.ts` — React hooks contract validation
- `supabase-contracts.ts` — Database contract verification

### 3. Substrate Health Check (`substrate-health-check.ts`)
A first-class internal integrity primitive (ID: `substrate_health_check`) that validates **structural coherence** rather than feature correctness. It verifies:
- Filesystem & structure integrity (21 modules)
- Import & reference resolution
- Terminal & capability wiring
- Route integrity
- Registry consistency (50 crystallized pipelines)
- Edge function presence (54+ active)
- Database & security behavior (RLS enforcement)
- Runtime render sanity

**Key distinction:** The Health Check validates that the system is *coherent and governed*. The Audit Engine validates that the system is *production-ready*. They are complementary, not redundant.

See: `docs/internal/SUBSTRATE-HEALTH-CHECK.md` for full specification.

---

## Usage

```typescript
// Production Audit (feature/quality gate)
import { runFullAudit } from '@/lib/audit';

// Structural Health Check (integrity gate)
import { runSubstrateHealthCheck } from '@/lib/audit/substrate-health-check';
```
