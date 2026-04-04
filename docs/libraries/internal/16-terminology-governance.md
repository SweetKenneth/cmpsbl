# Terminology Governance

**Classification:** 📋 STAFF REFERENCE

---

## Purpose

This document disambiguates CMPSBL® internal terminology to prevent confusion between **substrate primitives** (architectural building blocks) and **consumer products** (purchasable items in the Showroom).

---

## Core Distinction

### Primitives (Internal Architecture)

Primitives are the 40 autonomous components that form the substrate's architecture. They are organized into a **12-12-8-8 matrix**:

| Category | Count | Role | Nature |
|----------|-------|------|--------|
| **Organs** | 12 | Vital core infrastructure | Always running, invisible to users |
| **Layers** | 12 | Ambient overlays | Always-on protection, governance, observation |
| **Engines** | 8 | Processing powerhouses | Invoked for heavy computation |
| **Agents** | 8 | Autonomous actors | Self-directed, goal-oriented workers |

**Key fact:** The labels "Engine" and "Agent" are borrowed from consumer terminology for clarity. Internally, all 40 are equally **primitives** — they are nodes in the substrate matrix, not products for sale. The categorization (Organ/Layer/Engine/Agent) describes their *behavioral pattern*, not their commercial status.

### Products (Consumer Offerings)

Products are purchasable items sold through the Showroom and Restoration Shop. Examples include:

- **FAILSAFE** — Circuit breaker injection engine (Product, not a primitive)
- **BEACON** — Health monitoring engine (Product)
- **AUTOMATON** — Workflow automation engine (Product)
- **WRAITH** — IP obfuscation agent (Product)
- **OBSIDIAN** — Deep structural integrity agent (Product)
- **MONOLITH** — Monolithic decomposition agent (Product)
- **RAPTOR** — Rapid response agent (Product)
- **PRIMITIVE** — Base-level guard agent (Product)
- **ARCHITECT** — Ascension-tier engine (Product)

Products are standalone capabilities that users purchase. They are **not** part of the 40-primitive matrix.

---

## The Canonical 40 Primitives

### 12 Organs (Vital Core)
CORE · SYSTEM · BRAIN · MEMORY · NERVE · NEXUS · IDENTITY · SOVEREIGN · ATLAS · MEDIC · RELAY · CONSCIENCE

### 12 Layers (Ambient Overlays)
DEFENSE · IMMUNITY · GOVERNANCE · TREATY · EVOLUTION · REFLEX · COMPASS · INTEGRATION · INTENT · ACCESS · VISION · SHADOW

### 8 Engines (Processing Power)
DREAM · HARVEST · FORGE · LINGUA · ECHO · PHANTOM · SANDBOX · RIPPLE

### 8 Agents (Autonomous Actors)
ENCODE · DECODE · AUDIT · ECONOMY · INCLUSIVE · CORTEX · ORACLE · ENGINEER

---

## Vertical Substrate Model

Vertical substrates follow the same 40-primitive matrix. The architecture uses a **Spine + Expansion** model:

### Spine (24 primitives — identical across all substrates)
- 12 Organs — inherited, never swapped
- 12 Layers — inherited, never swapped

### Expansion (16 primitives — swapped per vertical)
- 8 Engines — replaced with domain-specific equivalents
- 8 Agents — replaced with domain-specific equivalents

Each vertical substrate's expansion primitives are **unique to that vertical** and must not collide with any other substrate's names. The Global Primitive Name Registry (`primitive-name-registry.ts`) enforces this.

### Active Vertical Substrates

| Vertical | Subdomain | Engines | Agents |
|----------|-----------|---------|--------|
| **Core CMPSBL** | cmpsbl.com | DREAM, HARVEST, FORGE, LINGUA, ECHO, PHANTOM, SANDBOX, RIPPLE | ENCODE, DECODE, AUDIT, ECONOMY, INCLUSIVE, CORTEX, ORACLE, ENGINEER |
| **Cyber** | security.cmpsbl.com | WATCHTOWER, SHADE, AEGIS, CIPHER, RECON, VANGUARD, BASTION, TEMPEST | PROWLER, ONYX, SPECTER, BLACKOUT, TRACER, NOCTURNE, IRONCLAD, CITADEL |
| **Robotics** | robotics.cmpsbl.com | SERVO, KINETIC, LIDAR, FABRICATOR, FLUX, VECTOR, TENSOR, CALIBER | GRIPPER, SWARM, ENVIRON, MARSHAL, DISPATCH, WELDER, INSPECTOR, PIONEER |
| **Quantum** | quantum.cmpsbl.com | HADRON, QUBIT, PHOTON, FERMION, ENTANGLE, LATTICE, PLASMA, CRYOGEN | MUON, BOSON, NEUTRINO, GLUON, GRAVITON, TACHYON, MESON, PRISM |
| **LLM** | llm.cmpsbl.com | VERITAS, RAMPART, SYLLOGISM, LEXICON, CLARITY, FULCRUM, TETHER, SIEVE | SKEPTIC, TRIBUNAL, HERALD, MIMIC, LINEAGE, EMBARGO, GAUNTLET, CUSTODIAN |
| **Agency** | agency.cmpsbl.com | MANDATE, DELEGATE, RECONN, UPLINK, SCRIBE, INCENTIVE, REASON, TOOLKIT | OPERATOR, OVERSEER, LIAISON, SCHOLAR, ENVOY, WARDEN, ROGUE, ANCHOR |

---

## Why the Terminology Overlap Exists

The Engine/Agent labels were deliberately borrowed from consumer product terminology so that customers see a consistent vocabulary:

> "Look — the substrate uses Engines and Agents, and I can buy Engines and Agents in the store. These must be the same powerful primitives."

This builds customer confidence. But internally, we must always distinguish:

- **Substrate primitive** = architectural node in the 40-primitive matrix
- **Store product** = purchasable capability in the Showroom/Restoration Shop

They share category labels (Engine, Agent) but are fundamentally different things.

---

## Naming Rules

1. **No primitive name may match a store product name** — FAILSAFE, WRAITH, etc. are product names, not primitives
2. **No primitive name may appear in more than one substrate** — enforced by the Global Name Registry
3. **Spine primitives are immutable** — the 24 Organs + Layers never change across verticals
4. **Expansion primitives must be unique per vertical** — checked at vertical instantiation time
5. **No vertical primitive may match any Spine codename** — e.g., "Bulwark" is DEFENSE's codename, so BULWARK cannot be a vertical primitive (renamed to CITADEL)
6. **No name may be reused across ANY context** — primitives, codenames, products, and verticals all draw from one global namespace

### Codename Collision Renames (Historical)

These vertical primitives were renamed because they collided with Spine codenames:

| Original | Collided With | Renamed To | Vertical |
|----------|--------------|------------|----------|
| BULWARK | DEFENSE Layer codename "Bulwark" | **CITADEL** | Cyber |
| GUARDIAN | SOVEREIGN Organ codename "Guardian" | **MARSHAL** | Robotics |
| CONDUCTOR | NERVE Organ codename "Conductor" | **DISPATCH** | Robotics |
| DIPLOMAT | TREATY Layer codename "Diplomat" | **LIAISON** | Agency |
| SENTINEL | IDENTITY Organ codename "Sentinel" | **OVERSEER** | Agency |

### Known Product-Primitive Name Overlaps (Flagged)

Two store products share names with canonical primitives. This is intentional for marketing purposes but must never cause internal confusion:

| Name | As Primitive | As Product |
|------|-------------|-----------|
| CORTEX | Agent #38 — Multi-step pipeline orchestration | $129 Store Engine |
| NEXUS | Organ #6 — AI provider routing | $159 Store Engine |

**Rule:** When "CORTEX" or "NEXUS" appears in code, it ALWAYS refers to the **primitive**. Store products are referenced by their product IDs, never by name in substrate logic.

---

## Banned Terminology (in code and docs)

| ❌ Don't Say | ✅ Say Instead |
|-------------|---------------|
| 40-node | 40-Primitive |
| Modules | Primitives |
| Nodes (generic) | Primitives / Organs / Layers / Engines / Agents |
| Mesh | Layers |
| MODERNIZER | EVOLUTION |
| framework / system / platform | substrate |
| our team | we / CMPSBL |
| triggered (Memory Stream) | runs autonomously |

---

## Source of Truth

| Artifact | Location |
|----------|----------|
| Canonical 40 | `/architecture` page on cmpsbl.com |
| Internal spec | `docs/libraries/internal/15-primitive-specifications.md` |
| Public reference | `docs/libraries/public/03-the-40-primitives.md` |
| Name registry (code) | `src/lib/factory/primitive-name-registry.ts` |
| Scan team catalog (code) | `src/lib/factory/scan-team.ts` |
| This document | `docs/libraries/internal/16-terminology-governance.md` |

---

© 2025–2026 CMPSBL®. Staff Reference.
