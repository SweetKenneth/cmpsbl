# 19 — Crystallized Memories

**Version:** Documentation Epoch 041  
**Classification:** Public  
**Last Updated:** 2026-03-16

---

## Purpose

This document defines Crystallized Memories — the deterministic, portable capability artifacts produced by the CMPSBL crystallization process.

---

## 1. What Is a Crystallized Memory?

A Crystallized Memory is a standalone software artifact produced when the Memory Stream discovers a valuable execution path and converts it into a portable, deterministic capability. It is the primary output of the CMPSBL discovery and crystallization pipeline.

Crystallized Memories are not raw data or logs. They are working software — deterministic implementations that reproduce a discovered capability independently of the full substrate.

---

## 2. How They Are Created

```
System Activity → Memory Stream Observation → Pattern Recognition → CJPI Scoring (≥ 68) → Sampling → Condensing → Crystallizing → Crystallized Memory
```

### Scoring Gate

Only discoveries scoring 68+ on the CJPI (Composable Judgment & Performance Index) qualify for crystallization. Below this threshold, discoveries remain Raw-tier observations.

### Crystallization Phases

1. **Sampling** — Isolate the execution path and record node interactions
2. **Condensing** — Resolve dependencies and compress the execution graph
3. **Crystallizing** — Generate the final artifact with Mini Runtime and documentation

---

## 3. What a Crystallized Memory Contains

| Component | Description |
|---|---|
| Implementation | Capability code in up to 25 target languages |
| Mini Runtime™ | Zero-dependency runtime reproducing substrate contracts |
| README | Functional description, use cases, distribution channels |
| License | Usage terms |
| Technical Dossier | Architecture, valuation, dependency map |
| Test Bench | Verification suite |
| Build Config | Build configuration for target environment |
| Manifest | CJPI score, provenance, estimated value |

---

## 4. Crystallized Memories vs. Ascended Memories

**Crystallized Memory** is the general concept — any capability artifact produced through crystallization.

**Ascended Memory** is a specific class of crystallized memory produced through the Ascension process, where developer software participates in discovery cycles.

| Property | Crystallized Memory | Ascended Memory |
|---|---|---|
| Source | Substrate self-discovery | Developer code + substrate |
| Provenance | Substrate nodes only | Dual (developer + substrate) |
| Process | Memory Stream | Ascension lifecycle |
| Output | Identical format | Identical format |

Ascended Memories are crystallized memories. They follow the same format, scoring, and export process. The distinction is in how they were discovered.

---

## 5. Tier Classification

| Tier | CJPI | Export Languages |
|---|---|---|
| Apex (96–100) | Highest value | All 25 |
| Mythic (94–95) | Exceptional | All 25 |
| Relic (90–93) | Premium | Software + HDL |
| Prime (80–89) | High quality | Major software languages |
| Mint (68–79) | Quality baseline | Entry-level languages |

---

## 6. Standalone Execution

Every Crystallized Memory runs independently. The bundled Mini Runtime reproduces required substrate contracts (CJPI scoring, saga orchestration, FSMs, node interfaces). No network connection to CMPSBL is required after export.

---

## Related Documents

- [Ascension](20-ascension.md)
- [Capability Export System](05-capability-export-system.md)
- [Mini Runtime](06-mini-runtime.md)
- [Memory Stream](04-memory-stream.md)

---

© 2025–2026 PromptFluid®. All rights reserved.
