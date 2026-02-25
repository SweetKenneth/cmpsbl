# Hardening & Memory Safety — CMPSBL v11.1

## Classification: Technical Reference

---

## Overview

The CMPSBL substrate enforces **production-grade memory safety** across all 24 Matrix Nodes. Every in-memory collection is bounded, every input is validated, and every numeric parameter is clamped to safe ranges. This document describes the hardening patterns, their rationale, and their coverage.

---

## Hardening Primitives

Three core utility functions from `src/lib/system/hardening.ts` are used universally:

### `validateStringInput(value, options)`

Validates string inputs against length, pattern, and character constraints.

```typescript
interface StringValidationOptions {
  maxLength: number;     // Default: 1024
  minLength?: number;    // Default: 0
  pattern?: RegExp;      // Optional regex constraint
  trim?: boolean;        // Default: true
}
```

**Behavior**: Returns validated string or `null` on failure. Never throws.

### `clampNumber(value, min, max, fallback)`

Clamps numeric inputs to a safe range with a fallback for non-numeric values.

```typescript
clampNumber(value: unknown, min: number, max: number, fallback: number): number
```

**Behavior**: Returns `fallback` if input is `NaN`, `Infinity`, or non-numeric.

### `boundArray(array, maxLength)`

Trims an array to a maximum length, preserving the most recent entries (tail).

```typescript
boundArray<T>(array: T[], maxLength: number): T[]
```

**Behavior**: If `array.length > maxLength`, returns `array.slice(-maxLength)`.

---

## Coverage Matrix

### CORE Sector

| Node | Collections Bounded | Inputs Validated | Numerics Clamped |
|------|-------------------|-----------------|-----------------|
| CORE | Registry map (500) | Entity names (128 chars) | Health (0–100) |

### CCR Sector

| Node | Collections Bounded | Inputs Validated | Numerics Clamped |
|------|-------------------|-----------------|-----------------|
| SYSTEM | Config entries (200), snapshots (500) | Config keys (128), values (4096) | — |
| BRAIN | Event journal (10,000), chains (50 depth) | Prompts (100K), event types (256) | Confidence (0–1) |
| MEMORY | Vector store (10,000), feedback (1,000) | Memory keys (256) | Search limit (1–100) |
| DREAM | Dream pool (2,000), heuristics (5,000) | Dream content (10K), tags (50) | Confidence (0–1) |

### CCL Sector

| Node | Collections Bounded | Inputs Validated | Numerics Clamped |
|------|-------------------|-----------------|-----------------|
| RIPPLE | Event buffer (1,000/topic), subscribers (100) | Topic (256), payload (50KB) | — |
| ACCESS | Keys (10,000), quotas (365 days) | Key prefix (8), scopes (50) | Rate limits (1–10K) |
| IDENTITY | Actors (1,000), passkeys (20/actor) | Session token (512), role (64) | TTL (60–86400s) |
| RELAY | Deliveries (500), dead-letter (100) | URL (2048), payload (100KB) | Retry count (0–5) |
| AUDIT | Audit log (5,000 → auto-compress) | Action (256), entity (512) | — |

### Execution Sector

| Node | Collections Bounded | Inputs Validated | Numerics Clamped |
|------|-------------------|-----------------|-----------------|
| DECODE | Identity contexts (500 LRU) | Input text (100K) | — |
| ENCODE | Rule store (2,000), fix history (500) | Intent summary (5K) | Confidence (0–1) |
| VISION | Metric buffer (10,000) | Metric names (256) | Values (0–1B) |
| CORTEX | Active tasks (10), module list (25) | Task names (256) | Timeout (5K–120K ms) |
| NEXUS | Provider map (100), usage map (100) | Prompt (100K) | Temperature (0–2) |
| ECONOMY | Cost records (2,000) | Category (128) | Tokens (0–10M), cost (0–1M) |
| SANDBOX | Snapshots (50), executions (100) | Code (resource limits) | Timeout (1K–60K ms) |
| INCLUSIVE | Scan results (500), repairs (1,000) | URL (2048), selector (1024) | Score (0–100) |
| INTEGRATION | Bindings (200) | Module names (128) | — |

### Overlay Sector

| Node | Collections Bounded | Inputs Validated | Numerics Clamped |
|------|-------------------|-----------------|-----------------|
| DEFENSE | Signals (2,000), baselines (5,000) | IP (45), endpoint (2048), agent (512) | Risk score (0–1) |
| IMMUNITY | Shadow results (1,000), probes (100) | Probe target (256) | Success rate (0–1) |
| EVOLUTION | Proposals (500), scan results (1,000) | Proposal title (256) | Priority (1–10) |
| INTENT | Capability map (500), routes (200) | Action name (256) | Match score (0–1) |
| GOVERNANCE | Policies (200), audit entries (5,000) | Policy name (256), rationale (2048) | TTL (60–604800s) |

---

## Memory Budget

Worst-case memory consumption per node (assuming max bounded collections):

| Sector | Nodes | Est. Max Memory |
|--------|-------|----------------|
| CORE | 1 | ~2 MB |
| CCR | 4 | ~50 MB |
| CCL | 5 | ~30 MB |
| Execution | 9 | ~80 MB |
| Overlay | 5 | ~40 MB |
| **Total** | **24** | **~200 MB** |

This ensures the substrate operates comfortably within a 512 MB container.

---

## Eviction Strategies

| Strategy | Used By | Behavior |
|----------|---------|----------|
| **LRU** (Least Recently Used) | DECODE contexts, IDENTITY actors | Evicts least-recently-accessed entry |
| **Tail truncation** | Most bounded arrays | Keeps most recent N entries |
| **Auto-compression** | AUDIT log | Compresses + archives before truncation |
| **TTL expiry** | IDENTITY sessions, RELAY dead-letter | Entries expire after time limit |

---

## Validation Error Handling

All validation failures are handled silently — **no exceptions are thrown**:

- Invalid strings return `null` → caller skips operation
- Invalid numbers return `fallback` → operation proceeds with safe default
- Oversized arrays are truncated → no data loss notification (by design)

This prevents validation itself from becoming a denial-of-service vector.

---

*Technical Reference — CMPSBL v11.1 — SPARTA Epoch*
*© 2025–2026 PromptFluid®. All rights reserved.*
