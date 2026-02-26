# Release Gate — CMPSBL Substrate

## Overview

The Release Gate is a 10-pass pre-release validation framework that ensures every deployment meets production-readiness standards. It produces a structured JSON report and human-readable markdown summary.

## Quick Start

```bash
# Standard gate (8 required passes + 2 gated optional)
bun src/release/releaseGate.ts

# Strict mode (all 10 passes enabled)
RELEASE_GATE_COST=1 RELEASE_GATE_CHAOS=1 bun src/release/releaseGate.ts
```

## The 10 Passes

| # | Pass | Required | Description |
|---|------|----------|-------------|
| 1 | **BUILD / COMPILE** | ✅ Yes | TypeScript type check + Vite production build |
| 2 | **UNIT TESTS** | ✅ Yes | Runs vitest suite in CI mode |
| 3 | **INTEGRATION** | ✅ Yes | Cross-module smoke tests (RIPPLE, safeExecute, withTimeout, terminal, errors, retry) |
| 4 | **REGRESSION / INVARIANTS** | ✅ Yes | Core invariant checks (health clamping, timeout enforcement, error coherence, trace uniqueness, bound arrays) |
| 5 | **PERFORMANCE** | ✅ Yes | Baseline latency regression detection with auto-baseline creation |
| 6 | **SECURITY** | ✅ Yes | Secret scan, dependency audit, webhook hash check, UI password audit |
| 7 | **OBSERVABILITY** | ✅ Yes | Error boundary, production log guard, telemetry pipeline verification |
| 8 | **COST / ECONOMY** | ⏭️ Gated | Cost cap and spike detection (requires `RELEASE_GATE_COST=1`) |
| 9 | **DEPLOYMENT / ROLLBACK** | ✅ Yes | Rollback plan, canary docs, feature toggle verification |
| 10 | **CHAOS / FAILURE SIM** | ⏭️ Gated | Failure injection: timeouts, rapid failures, malformed input (requires `RELEASE_GATE_CHAOS=1`) |

## Pass / Fail / Skip

- **PASS** — The check succeeded. All assertions met.
- **FAIL** — The check found a violation. If the pass is required, the gate blocks release.
- **SKIP** — The pass is gated behind an env var and was not enabled.

### Gate Verdict

The gate exits `0` (success) only if **all required passes are PASS**. Optional gated passes can SKIP without blocking.

Exit codes:
- `0` — All required passes passed. Release approved.
- `1` — One or more required passes failed. Release blocked.
- `2` — The runner itself crashed (infrastructure failure).

## Report Output

Reports are written to `/reports/release/`:

- **JSON**: `release-gate-<timestamp>-<gitsha>.json` — Machine-readable full report
- **Markdown**: `latest.md` — Human-readable summary with scoreboard

### JSON Report Schema

```json
{
  "version": "1.0.0",
  "timestamp": "ISO-8601",
  "gitSha": "abc1234",
  "gitBranch": "main",
  "environment": "local | ci",
  "passes": [
    {
      "pass": 1,
      "name": "BUILD / COMPILE",
      "status": "PASS | FAIL | SKIP",
      "required": true,
      "durationMs": 1234,
      "notes": ["..."],
      "artifacts": ["..."]
    }
  ],
  "summary": {
    "total": 10,
    "passed": 8,
    "failed": 0,
    "skipped": 2,
    "allRequiredPassed": true,
    "totalDurationMs": 5000
  }
}
```

## CI Integration

The release gate runs automatically on PR and main branch pushes:

```yaml
# .github/workflows/test.yml
- name: Release Gate
  run: bun src/release/releaseGate.ts

# Strict mode (optional)
- name: Release Gate (Strict)
  env:
    RELEASE_GATE_COST: "1"
    RELEASE_GATE_CHAOS: "1"
  run: bun src/release/releaseGate.ts
```

## Gated Optional Passes

Passes 8 (COST) and 10 (CHAOS) are gated behind environment variables:

- **`RELEASE_GATE_COST=1`** — Enables the cost/economy analysis pass
- **`RELEASE_GATE_CHAOS=1`** — Enables the chaos/failure simulation pass

These passes SKIP by default. Enable them for comprehensive pre-release validation:

```bash
RELEASE_GATE_COST=1 RELEASE_GATE_CHAOS=1 bun src/release/releaseGate.ts
```

## Performance Baselines

On the first successful run, Pass 5 creates a performance baseline at `reports/release/perf-baseline.json`. Subsequent runs compare against this baseline with a 50% regression tolerance. To reset baselines, delete the file and re-run.

## Architecture

```
src/release/
├── releaseGate.ts          # Main orchestrator (entry point)
├── types.ts                # Shared types (PassResult, ReleaseReport)
├── report.ts               # JSON + Markdown report generation
└── passes/
    ├── index.ts             # Barrel export
    ├── build-pass.ts        # Pass 1: Build / Compile
    ├── unit-test-pass.ts    # Pass 2: Unit Tests
    ├── integration-pass.ts  # Pass 3: Integration
    ├── regression-pass.ts   # Pass 4: Regression / Invariants
    ├── performance-pass.ts  # Pass 5: Performance
    ├── security-pass.ts     # Pass 6: Security
    ├── observability-pass.ts# Pass 7: Observability
    ├── cost-pass.ts         # Pass 8: Cost / Economy (gated)
    ├── deployment-pass.ts   # Pass 9: Deployment / Rollback
    └── chaos-pass.ts        # Pass 10: Chaos / Failure Sim (gated)
```

---

*CMPSBL Substrate — SPARTA Epoch*
*© 2025–2026 PromptFluid®. All rights reserved.*
