# HOW TO BUILD ON CMPSBL®

**Version:** 1.0.0  
**Audience:** Developers  
**Classification:** Open

---

## What "Building" Means Here

Building on CMPSBL is not writing primitives from scratch — the 40 primitives already exist. Building means **composing, configuring, discovering, and packaging** unique cognitive artifacts that solve real problems.

Think of it like music production: you don't build the synthesizer — you play it. Your talent is in **what you compose**, not what you solder.

---

## The Five Creative Acts

### 1. COMPOSE — Wire Primitives Into Loadouts

A **loadout** is a named configuration of primitives that work together for a specific purpose. This is your primary creative surface.

```bash
cmpsbl forge --name "threat-analyst" --primitives BRAIN,DEFENSE,ORACLE,BEACON
```

**What makes a loadout yours:**
- Which primitives you select (out of 40)
- How you configure their parameters
- The order and weight you assign to each
- The governance constraints you set

**Example loadouts a developer might create:**
| Loadout | Primitives | Purpose |
|---------|-----------|---------|
| `contract-auditor` | TREATY, ORACLE, DEFENSE, RECALL | Analyze contracts for risk |
| `drift-hunter` | SHADOW, BEACON, SIGNAL, WATCH | Monitor production systems for behavioral drift |
| `dream-weaver` | DREAM, CORTEX, NEXUS, MEMORY | Generate sub-threshold creative synthesis |

There are **40-choose-N** possible loadout combinations. That's millions of unique configurations before you even touch parameters.

---

### 2. DISCOVER — Run Ascension on Your Own Code

Ascension transforms **your code** (Node 41) into something that collides with the 40-primitive matrix. The substrate discovers capabilities in your code that you may not have known existed.

```bash
cmpsbl ascend --input ./my-project --output ./discovered
```

**What comes out:**
- A CJPI score (Crown Jewel Performance Index)
- Discovered capabilities unique to YOUR code
- A collision report showing which primitives your code activated
- A certified artifact with a sealed runtime

**This is where talent shows.** Two developers can upload different codebases and get wildly different discovery results. The quality, structure, and architecture of your input code directly determines what the substrate finds.

---

### 3. CONFIGURE — Tune Parameters and Governance

Every primitive accepts configuration. Developers who understand the substrate deeply can tune:

- **Governance levels**: `manual` → `governed` → `bounded`
- **Execution thresholds**: When primitives activate
- **Memory retention**: How long cognitive state persists
- **Collaboration rules**: Which primitives can communicate

```bash
cmpsbl config set BRAIN.governance bounded
cmpsbl config set ORACLE.confidence_threshold 0.85
cmpsbl config set DEFENSE.alert_level elevated
```

**Two developers using the same primitives with different configurations produce fundamentally different behaviors.** This is like two guitarists playing the same instrument — the settings matter.

---

### 4. PACKAGE — Export Sealed Runtimes

A finished creation is a **sealed runtime artifact** — a portable, self-contained package that runs independently.

```bash
cmpsbl export --name "threat-analyst-v2" --format zip --targets typescript,python
```

**What's in the package:**
- `manifest.json` — CMPSBL manifest with CJPI, tier, modules
- `runtime/` — Executable cognitive runtime
- `config/` — Your custom parameters
- `tests/` — Validation harness
- `README.md` — Auto-generated documentation

**Export targets include:**
- TypeScript, Python, Rust, Go
- WASM for browser deployment
- Container images for cloud deployment
- Hardware description languages (VHDL, Verilog) for silicon

---

### 5. PUBLISH — List on the Marketplace

Your sealed runtime can be listed on the internal marketplace where other developers can purchase, fork, or build on top of it.

```bash
cmpsbl publish --artifact ./threat-analyst-v2.zip --price 79
```

**Marketplace differentiation signals:**
- **CJPI Score** — Higher scores indicate more sophisticated compositions
- **Tier** (Raw → Creator → Architect → Enterprise → Apex)
- **Primitive Coverage** — How many of the 40 primitives your artifact activates
- **Unique Capabilities** — Discoveries that no other artifact has
- **Download Count** — Community validation
- **Version History** — Active maintenance signals quality

---

## What Makes One Developer Better Than Another

| Signal | Beginner | Skilled | Expert |
|--------|----------|---------|--------|
| Loadout complexity | 2-3 primitives, defaults | 5-8 primitives, tuned | 10+ primitives, governance-bounded |
| Ascension score | Raw tier (CJPI < 35) | Architect tier (55-74) | Enterprise/Apex (75+) |
| Configuration depth | Defaults everywhere | Selective tuning | Full governance model |
| Export targets | TypeScript only | Multi-language | Hardware + silicon |
| Marketplace presence | Consumer | Seller | Ecosystem contributor |
| Discovery uniqueness | Common capabilities | Rare combinations | Novel collisions |

---

## The Builder Journey

```
Week 1: EXPLORE
  └─ Run `health`, `status`, `think`
  └─ Understand what the 40 primitives do
  └─ Complete the simulation (optional)

Week 2: COMPOSE
  └─ Create your first loadout with 3-4 primitives
  └─ Run it against test scenarios
  └─ Tune one or two parameters

Week 3: DISCOVER
  └─ Upload your own code to Ascension
  └─ Review the collision report
  └─ Identify unique capabilities

Week 4: PACKAGE & PUBLISH
  └─ Export your first sealed runtime
  └─ List it on the marketplace
  └─ Get feedback from other developers
```

---

## What a "Product" Looks Like

A finished CMPSBL product is a **cognitive artifact** — a loadout that has been:

1. ✅ Composed from specific primitives
2. ✅ Configured with intentional parameters
3. ✅ Validated through Ascension (CJPI scored)
4. ✅ Exported as a sealed runtime
5. ✅ Documented with use cases and integration guides

**Examples of products developers could build and sell:**

| Product | Description | Estimated Tier |
|---------|-------------|----------------|
| **Cognitive Threat Profiler** | Real-time threat analysis using DEFENSE + ORACLE + SIGNAL | Architect ($249) |
| **Contract Risk Engine** | Automated contract analysis with TREATY + RECALL + BEACON | Enterprise |
| **Drift Detection Suite** | Production monitoring via SHADOW + WATCH + FAILSAFE | Creator ($79) |
| **Memory-Augmented Agent** | Persistent cognitive agent using BRAIN + MEMORY + CORTEX | Architect ($249) |
| **Compliance Validator** | Governance enforcement with SOVEREIGN + TREATY + DEFENSE | Enterprise |

---

## How You Know It's Good

Your artifact is production-grade when:

- **CJPI ≥ 55** — Architect tier or above
- **All 4 requirements pass** — Circuit breaker, DEFENSE shield, graceful degradation, BEACON health signal
- **Governance is set** — Not running on defaults
- **Tests pass** — The exported harness validates
- **It solves a real problem** — Someone would pay for what it does

Your artifact is **differentiated** when:

- It uses a primitive combination no one else has published
- Its Ascension report shows unique capability discoveries
- It achieves a higher CJPI than competing artifacts in the same category
- It targets an export format others haven't (especially hardware)

---

## Quick Reference

| Action | Command |
|--------|---------|
| Create a loadout | `cmpsbl forge --name "name" --primitives A,B,C` |
| Run Ascension | `cmpsbl ascend --input ./code` |
| Check health | `cmpsbl health` |
| Configure a primitive | `cmpsbl config set PRIMITIVE.key value` |
| Export artifact | `cmpsbl export --name "name" --format zip` |
| Publish to marketplace | `cmpsbl publish --artifact ./file.zip` |
| View your score | `cmpsbl score` |
| Browse marketplace | `cmpsbl browse` |

---

© 2025–2026 CMPSBL® · PromptFluid™
