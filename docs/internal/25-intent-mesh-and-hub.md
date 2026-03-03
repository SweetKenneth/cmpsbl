# 25 — INTENT Mesh & Hub

**Classification:** 🔒 INTERNAL  
**Version:** v13.1.0 — IRONCLAD Epoch

---

## 1. Purpose

INTENT is a Field-layer module that permeates the entire substrate. It classifies user intent, routes context to the appropriate modules, tracks goal completion, and orchestrates cross-module collaboration through the Intent Mesh — the substrate's "social graph" for modules.

## 2. Architecture

### 2.1 Layer Classification

INTENT is a **Field** — it does not sit in a single sector but permeates all layers. It has two primary subsystems:

| Subsystem | Role |
|-----------|------|
| Intent Mesh | Cross-module collaboration fabric (affinity matrix, pattern recognition, discovery) |
| Intent Hub | Centralized message bus translating technical signals into human-readable governance requests |

### 2.2 File Structure

```
src/lib/substrate/intent-mesh/
├── index.ts              — Barrel exports
├── types.ts              — Type definitions
├── router.ts             — Intent classification and routing
├── intent-hub.ts         — Centralized message bus for governance translation
├── affinity-matrix.ts    — Module co-resolution tracking
├── pattern-recognition.ts — Emergent pattern detection
├── module-discovery.ts   — Module self-discovery engine
├── discovery-engine.ts   — Capability discovery reactor integration
├── intent-scoring.ts     — Intent quality and confidence scoring
├── auto-scheduler.ts     — Automatic intent scheduling
├── clm-feedback.ts       — CLM feedback integration
├── composite.ts          — Cross-module composite capabilities
├── live-gap-execution.ts — Real-time gap filling
├── manifest.ts           — Intent mesh manifest
├── mesh-federation.ts    — Cross-instance mesh coordination
├── mesh-health-monitor.ts — Mesh health monitoring
├── pipelines.ts          — Intent pipeline orchestration
├── refinement.ts         — Intent refinement and clarification
├── toggle.ts             — Intent mesh enable/disable
└── intent-hardening.ts   — Security hardening
```

## 3. Intent Classification & Routing

### 3.1 Classification

Every user input is classified by intent type:

| Intent Type | Description | Primary Handlers |
|-------------|-------------|-----------------|
| query | Information retrieval | DECODE, BRAIN, MEMORY |
| generate | Content creation | ENCODE, FORGE, NEXUS |
| analyze | Data analysis | VISION, ORACLE, CORTEX |
| manage | System administration | GOVERNANCE, ATLAS |
| learn | Knowledge acquisition | BRAIN, MEMORY, DREAM |
| secure | Security operations | DEFENSE, PHANTOM |

### 3.2 Routing

Classified intents are routed to the optimal module combination based on:
1. Intent type → primary handler mapping
2. Affinity matrix → best co-handler selection
3. Current health scores → fallback if primary is degraded
4. Context window → appropriate provider selection via NEXUS

## 4. Affinity Matrix

The Affinity Matrix is a Crown Jewel (CJPI: 95, S-Tier).

### 4.1 How It Works

A weighted adjacency matrix tracking how frequently and successfully modules co-resolve intents:

```
Matrix[A][B] = success_count(A,B) / total_co_invocations(A,B) × recency_weight
```

- **High-affinity pairs** are pre-warmed for faster composition
- **Low-affinity pairs with high potential** are flagged for capability gap analysis
- The matrix evolves continuously — every intent resolution updates edge weights

### 4.2 Uses

- Predicts which capability compositions will succeed before attempting them
- Powers the Module Self-Discovery Engine
- Feeds ORACLE's capability forecasting
- Used by the Foundry reactor for candidate prioritization

## 5. Intent Hub

### 5.1 Purpose

The Intent Hub is the translation layer between technical system signals and human-readable governance requests:

```
Technical Signal → Intent Hub → Human-Readable Message → ATLAS Inbox
```

### 5.2 Message Model

| Field | Description |
|-------|-------------|
| `id` | Unique message ID |
| `source_node` | Originating module |
| `target_node` | Destination (usually ATLAS) |
| `type` | proposal, alert, status, request |
| `payload` | Structured data |
| `human_summary` | Natural language explanation |
| `impact_assessment` | Business impact description |
| `urgency` | low, medium, high, critical |

### 5.3 Stats

The Hub tracks operational metrics:
- Total messages processed
- Pending count
- Messages by node
- Messages by type

## 6. Pattern Recognition Engine

Another Crown Jewel (CJPI: 91, S-Tier).

Detects emergent patterns in intent resolution:
- Recurring module combinations that weren't explicitly designed
- Degradation patterns that predict failures before they occur
- Usage patterns that suggest new capability opportunities

## 7. Module Self-Discovery

Each module can autonomously discover its own latent capabilities through the Intent Mesh:

1. Enumerate registered actions
2. Test action combinations with synthetic inputs
3. Observe emergent behaviors
4. Report to the discovery reactor for CJPI scoring

This is the same mechanism that powers the Autonomous Software Foundry's module-level discovery.

## 8. Security (Intent Hardening)

- All intent classifications are logged to AUDIT
- Adversarial intent detection prevents prompt injection
- Rate limiting on intent classification prevents DoS
- Intent routing decisions are governance-auditable

---

## Revision History

| Date | Author | Change |
|------|--------|--------|
| 2026-03-03 | System | Initial INTENT Mesh & Hub internal documentation — v13.1.0 |

---

© 2025–2026 PromptFluid®. Confidential.
