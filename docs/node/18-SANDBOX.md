# SANDBOX — Isolated Execution & Safety Assessment

> **Node ID:** `sandbox` · **Sector:** Execution · **Generation:** 1 · **Node #18 of 40**
> **Codename:** *Cage* · **Classification:** FOUNDER EYES ONLY

---

## Executive Summary

SANDBOX provides isolated execution environments for untrusted operations. It owns safe code evaluation, operation safety assessment, determinism verification, and blast radius containment. Any operation that could have side effects — executing user-provided logic, testing mutations, validating configurations — runs through SANDBOX.

---

## Intent Mesh Capabilities

| Capability | Description |
|---|---|
| `sandbox.safe_eval` | Safely evaluate code or expressions in isolation |
| `sandbox.safety_assessment` | Assess safety and determinism of a proposed operation |

---

## Architecture

### Isolation Model

```
safe_eval(code, context):
  1. Parse code for disallowed patterns:
     - Network access (fetch, XMLHttpRequest, WebSocket)
     - File system access (fs, path)
     - Process manipulation (process, child_process)
     - Global mutation (window, document, globalThis)
  2. Wrap in sandboxed execution context:
     - Frozen global scope
     - No prototype chain access
     - Timeout enforcement (default: 5,000ms)
     - Memory cap (16MB heap)
  3. Execute with result capture
  4. Return { result, sideEffects: [], deterministic: boolean }
```

### Safety Assessment

```
safety_assessment(operation):
  Factors:
    - Has side effects? (writes, mutations, network)
    - Deterministic? (same input → same output)
    - Reversible? (can be undone if it fails)
    - Blast radius? (how many systems affected)
    - Privilege required? (anonymous, auth, admin)
  
  Safety score: 0 (dangerous) → 100 (completely safe)
  
  Classification:
    ≥ 90: safe (auto-approve)
    70–89: cautious (execute with monitoring)
    50–69: risky (require confirmation)
    < 50: dangerous (require admin approval)
```

### Blast Radius Containment

```
containment(operation):
  1. Identify all modules the operation touches
  2. Build blast radius graph (direct + transitive dependencies)
  3. If blast radius > 5 modules → escalate to CORTEX
  4. If blast radius includes CORE or IDENTITY → require admin
  5. Execute with rollback points at each module boundary
```

---

## Trade Secrets

### 1. Frozen Global Scope

Sandboxed code executes against a frozen copy of the global scope. `Object.freeze()` is applied recursively to prevent prototype pollution, property injection, and scope escape attacks.

### 2. Determinism Verification

SANDBOX runs operations twice with identical inputs. If outputs differ, the operation is classified as non-deterministic. Non-deterministic operations receive a lower safety score and require higher privilege to execute.

### 3. Rollback Points

Every side-effecting operation within a sandbox creates a rollback point. If the operation fails at any stage, SANDBOX can unwind to the last clean state. This uses a copy-on-write strategy to minimize memory overhead.

---

## CLM Learning Priorities

1. **Safety Pattern Learning** — Building a corpus of safe vs. dangerous operation patterns
2. **Blast Radius Prediction** — Improving transitive dependency analysis for accurate containment

---

*CMPSBL® Substrate — SANDBOX Node Deep Dive · Founder Eyes Only*
