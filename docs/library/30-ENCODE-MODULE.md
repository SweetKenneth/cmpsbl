# ENCODE Module

**CMPSBL® Substrate — Orchestrator Layer | v9.1.0 ARCHITECT Epoch (Module #21)**

---

## Overview

The **ENCODE** module is the substrate's code generation and transformation engine. It accepts intent from DECODE, generates production-quality code, scores it for confidence, and previews changes before application. ENCODE completes the USER → DECODE → ENCODE pipeline for intelligent code orchestration.

---

## Capabilities

| Capability | Description | Tier |
|-----------|-------------|------|
| **Code Generation** | Intent-to-code transformation | FREE |
| **Code Review** | Automated quality and security scoring | Builder |
| **Diff Preview** | Visual before/after change comparison | Builder |
| **Multi-Language** | TypeScript, Python, SQL, and more | Pro |
| **Batch Generation** | Multi-file coordinated generation | Pro |
| **Self-Improving Codegen** | Learning from applied/rejected proposals | Enterprise |

---

## Architecture

```
┌───────────────────────────────────┐
│          ENCODE MODULE            │
├───────────────────────────────────┤
│  Intent Parser (via DECODE)       │
│  ├── Natural language → spec      │
│  ├── Context assembly             │
│  └── Constraint extraction        │
├───────────────────────────────────┤
│  Code Generator                   │
│  ├── Template-based generation    │
│  ├── LLM-backed synthesis         │
│  └── Style/convention enforcement │
├───────────────────────────────────┤
│  Preview & Scoring                │
│  ├── Confidence scoring (0-1)     │
│  ├── Diff visualization           │
│  └── Sandbox validation           │
└───────────────────────────────────┘
```

---

## Pipeline: USER → DECODE → ENCODE

```
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│   USER   │ -> │  DECODE  │ -> │  ENCODE  │ -> │ PREVIEW  │
│  Request │    │  Intent  │    │ Generate │    │  Score   │
└──────────┘    └──────────┘    └──────────┘    └────┬─────┘
                                                     │
                                              ┌──────▼─────┐
                                              │   APPLY    │
                                              │ (on accept)│
                                              └────────────┘
```

---

## SDK Usage

```typescript
import { substrate } from '@cmpsbl/sdk';

// Generate code from intent
const result = await substrate.encode.generate({
  intent: 'Create a rate limiter with sliding window',
  language: 'typescript',
  context: { module: 'DEFENSE' }
});

// Preview changes
const preview = await substrate.encode.preview(result.id);
// → { diff, confidence: 0.91, files: ['src/lib/rate-limiter.ts'] }

// Apply after review
await substrate.encode.apply(result.id);
```

---

## Integration Points

| Module | Integration |
|--------|-------------|
| DECODE | Intent parsing feeds ENCODE generation |
| SANDBOX | Generated code tested in isolation |
| MODERNIZER | Evolution proposals use ENCODE for code synthesis |
| MEMORY | Code embeddings for similar snippet retrieval |
| VISION | Generation quality metrics and tracking |
| AUDIT | All generations and applications logged |

---

*CMPSBL® ENCODE Module — v9.1.0 ARCHITECT Epoch*
*© 2025-2026 PromptFluid®. All rights reserved.*
