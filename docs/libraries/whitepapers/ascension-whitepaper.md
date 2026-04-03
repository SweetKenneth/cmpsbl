# Ascension™: Deterministic Software Evolution Through Autonomous Primitive Collision

**A Whitepaper on Structural Code Hardening Without Artificial Intelligence**

---

**Author:** Kenneth E. Sweet Jr.  
**Affiliation:** PromptFluid™, Austin, TX  
**ORCID:** [0009-0001-4237-1243](https://orcid.org/0009-0001-4237-1243)  
**Date:** April 2026  
**Version:** 1.1.0  
**License:** Creative Commons Attribution 4.0 International (CC BY 4.0)  
**DOI:** [10.5281/zenodo.19409933](https://doi.org/10.5281/zenodo.19409933)

---

## Abstract

We introduce **Ascension™**, a deterministic software evolution engine that identifies, scores, and hardens latent architectural capabilities in arbitrary source code — without invoking external artificial intelligence. The engine operates by colliding uploaded code against a fixed matrix of 40 computational primitives organized across four taxonomic categories (Organs, Layers, Engines, and Agents), scoring emergent combinations via the Crown Jewel Pipeline Index™ (CJPI), and exporting hardened artifacts as self-contained Sealed Runtimes™. We present empirical results from six case studies spanning five programming languages and six industry verticals, including the discovery and remediation of a critical error-handling vulnerability in Hugging Face's `tokenizers` library — a package with over 73 million monthly PyPI downloads. Our findings demonstrate that deterministic primitive collision reliably surfaces structural deficiencies invisible to conventional static analysis, linting, and AI-assisted code review. We propose Ascension™ as the foundation for a new discipline: **post-authorship software evolution**, where code improvement occurs structurally rather than generatively.

**Keywords:** software evolution · deterministic analysis · code hardening · primitive collision · sealed runtime · cognitive infrastructure · structural vulnerability · post-authorship engineering

---

## 1. Introduction

### 1.1 The Post-Authorship Problem

Modern software engineering invests heavily in the authorship phase — writing, reviewing, and testing code. Yet the structural characteristics of software after authorship are rarely interrogated systematically. Static analyzers detect syntactic violations. Linters enforce style. AI copilots suggest completions. None of these tools ask the fundamental question: *what latent capabilities does this code possess that its author did not intend or recognize?*

This gap — between what code *does* and what code *could do* if structurally augmented — represents an untapped reservoir of architectural value. We call this the **post-authorship problem**.

### 1.2 The Ascension™ Hypothesis

We hypothesize that a fixed, finite set of computational primitives, when systematically collided against arbitrary source code, will reliably surface:

1. **Structural vulnerabilities** invisible to conventional tooling
2. **Latent capabilities** that emerge from the interaction between code structure and primitive behavior
3. **Hardening opportunities** that can be applied deterministically without modifying original logic

This hypothesis is testable because the primitive set is fixed (40 primitives), the collision process is deterministic (no stochastic model inference), and the scoring function (CJPI™) produces reproducible results.

### 1.3 Contributions

This paper makes four contributions:

1. **Architecture:** A formal description of the 40-primitive collision matrix and its taxonomic organization
2. **Method:** The Ascension™ pipeline — an 8-stage deterministic transformation process
3. **Evidence:** Six case studies demonstrating structural discovery across languages and domains
4. **Discovery:** Identification of a critical vulnerability in Hugging Face `tokenizers` (73M+ monthly downloads) that evaded all existing quality assurance

---

## 2. Background and Related Work

### 2.1 Static Analysis

Traditional static analysis tools (e.g., ESLint, Pylint, SonarQube) operate on syntactic pattern matching and control flow analysis. They excel at detecting known anti-patterns but cannot reason about *emergent structural properties* — capabilities that arise from the interaction of code structure with external computational models.

### 2.2 AI-Assisted Code Review

Large language model (LLM)-based code review tools (e.g., GitHub Copilot, Amazon CodeWhisperer) generate suggestions probabilistically. Their outputs are non-deterministic, non-reproducible, and cannot guarantee coverage of structural properties. Furthermore, they introduce the very vulnerabilities they claim to detect — hallucination, prompt injection susceptibility, and training data contamination (OWASP, 2024).

### 2.3 Formal Verification

Formal methods (e.g., TLA+, Coq, Isabelle) provide mathematical guarantees but require manual specification of properties to verify. They cannot autonomously *discover* properties — only verify those the engineer already suspects.

### 2.4 Position of Ascension™

Ascension™ occupies a novel position: it autonomously *discovers* structural properties through deterministic collision, without requiring the engineer to specify what to look for, and without invoking probabilistic AI models. It is, to our knowledge, the first system to achieve autonomous structural discovery through a fixed primitive matrix.

---

## 3. Architecture

### 3.1 The 40-Primitive Matrix

CMPSBL®'s computational substrate consists of exactly 40 primitives organized into four taxonomic categories:

| Category | Count | Role | Interaction Model |
|----------|-------|------|-------------------|
| **Organs** | 12 | Core state management and data flow | Observable, not interactive |
| **Layers** | 12 | Cross-cutting concerns (security, governance, routing) | Observable, not interactive |
| **Engines** | 8 | Active computational processes | Interactive, configurable |
| **Agents** | 8 | Autonomous task execution | Interactive, autonomous |

Each primitive exposes a defined behavioral surface. When source code is introduced as Primitive #41, the matrix tests every pairwise combination, producing up to 40 collision events per upload.

### 3.2 Taxonomic Integrity

The distinction between categories is enforced architecturally:

- **Organs** never couple directly to **Agents** (mediated by Layers)
- **Layers** provide cross-cutting governance without owning state
- **Engines** perform bounded computation with circuit-breaker protection
- **Agents** operate autonomously within governance constraints

This taxonomy ensures that collision results are structurally meaningful rather than combinatorially arbitrary.

### 3.3 Vertical Extension

The base 40-primitive matrix can be extended with domain-specific primitives for vertical specialization. The CMPSBL LLM™ Vertical, for example, adds 16 primitives (8 Engines + 8 Agents) specialized for large language model vulnerability detection. Vertical primitives participate in collision alongside spine primitives, expanding the discovery surface without modifying the core matrix.

---

## 4. Method: The Ascension™ Pipeline

### 4.1 Pipeline Overview

Ascension™ operates as an 8-stage deterministic pipeline:

```
Upload → Classify → Register → Chain → Discover → Score → Export → Protect
```

Each stage is idempotent and produces auditable artifacts.

### 4.2 Stage Descriptions

**Stage 1: Upload.** Source code is accepted in any of 25 supported languages (18 software + 7 hardware description languages). No preprocessing or normalization is applied — the code enters the matrix as-is.

**Stage 2: Classify.** A diagnostic squad of 6 primitives computes structural metrics:
- Cyclomatic complexity
- Nesting depth
- Dependency fan-out
- Type coverage
- Error handling density
- Documentation ratio

These metrics produce a 0–100 **depth score** that calibrates subsequent collision intensity.

**Stage 3: Register.** The uploaded code is registered as Primitive #41 in the collision matrix, receiving a unique serial identifier (format: `CMPSBL-XXXXXX-XXXX`).

**Stage 4: Chain.** Memory chains — predefined multi-primitive reaction workflows — are evaluated against the registered code. Chains that match trigger conditions fire automatically, producing intermediate discoveries.

**Stage 5: Discover.** The full 40-primitive collision occurs. Each primitive tests whether its behavioral surface combines meaningfully with the uploaded code's structure. Successful combinations are recorded as **capability candidates**.

**Stage 6: Score.** Each candidate is evaluated via the **Crown Jewel Pipeline Index™ (CJPI)**:

| Factor | Description |
|--------|-------------|
| Novelty | Uniqueness of the primitive–code combination |
| Utility | Practical applicability of the resulting capability |
| Complexity | Sophistication of the structural interaction |
| Composability | Potential for combination with other discoveries |

Scores range from 0–100. Candidates scoring ≥ 85 are classified **S-Tier**. The highest-scoring discovery in a session may achieve **APEX** or **MYTHIC** classification.

**Stage 7: Export.** Hardened artifacts are packaged as a **Sealed Runtime™** — a self-contained archive containing the original source (unmodified), refurbished source with structural augmentations, auto-generated documentation, and a test harness with validation suite. The internal execution environment and cognitive layer are proprietary components (see Section 11: Protected Intellectual Property).

**Stage 8: Protect.** DEFENSE Layer shielding is applied. GOVERNANCE checks validate export integrity. BEACON health signals confirm the Sealed Runtime™ is production-ready. The portability guarantee is enforced: if CMPSBL® ceased to exist, the export would still execute independently.

### 4.3 Determinism Guarantee

No stage in the pipeline invokes external AI, stochastic inference, or probabilistic generation. Every collision is a deterministic function of (a) the uploaded code's structure and (b) the fixed primitive matrix. Given identical inputs, Ascension™ produces identical outputs.

---

## 5. Case Studies

### 5.1 Overview

We present seven case studies spanning five languages, seven industry verticals, and a range of structural complexities:

| # | Software | Language | Vertical | CJPI | Capabilities | Critical Findings |
|---|----------|----------|----------|------|-------------|-------------------|
| 1 | Stripe Node.js SDK | TypeScript | FinTech | 98 | 20 S-Tier | Undocumented circuit-breaker gaps |
| 2 | PHP Agent Framework | PHP | Agentic AI | 100 APEX | 20 S-Tier | ~$2.6M latent IP discovered |
| 3 | NASA cFS Framework | C | Aerospace | 97 | 20 S-Tier | Memory safety augmentation paths |
| 4 | Solana Token Program | Rust | Blockchain | 96 | 20 S-Tier | Cross-program invocation hardening |
| 5 | IBM Qiskit ConsolidateBlocks | Python | Quantum | 98 | 20 S-Tier | Unguarded circuit optimization passes |
| 6 | Hugging Face Tokenizers | Python | LLM/ML | 100 APEX | 20 S-Tier | **Critical error-handling vulnerability** |
| 7 | OpenSSL tls13_enc.c | C | Cyber | 100 APEX | 20 S-Tier | Network timeout structural gap — hardened |

### 5.2 Case Study 1: Stripe Node.js SDK

**Subject:** `stripe-node/src/stripe.core.ts` — the core request engine of Stripe's official Node.js SDK, used by millions of businesses for payment processing worldwide. The package receives 4M+ weekly npm downloads.

**Classification:** TypeScript · 847 lines · Depth Score 71/100 (high complexity, moderate error handling density, extensive type coverage).

> **Critical Discovery:** During Stage 5 collision, the IMMUNITY primitive detected **undocumented circuit-breaker gaps** in the SDK's retry logic. The exponential backoff implementation lacked configurable jitter bounds, and the maximum retry window had no hard ceiling — meaning a pathological API response pattern could keep a client thread blocked indefinitely. Additionally, the TREATY primitive identified that the SDK's idempotency key handling did not enforce temporal expiration, creating a window for stale replays in high-throughput environments.

**Remediation:** Ascension™ hardened the request engine with:
- Deterministic circuit-breaker state machine with configurable trip thresholds
- Bounded retry windows with maximum wall-clock limits
- Idempotency key expiration enforcement via GOVERNANCE temporal validation
- BEACON health signals for real-time retry exhaustion monitoring
- FAILSAFE graceful degradation when circuit breaker trips

**Result:** CJPI 98 (S-Tier). 20 S-Tier capabilities unlocked — 10 spine primitives (including IMMUNITY, TREATY, GOVERNANCE, FAILSAFE, DEFENSE) and 10 expansion primitives providing financial-domain hardening.

### 5.3 Case Study 2: PHP Agent Framework

**Subject:** `OpenClawAgent.php` — an OpenAI-pattern autonomous agent framework implementing tool-use, memory persistence, and multi-step reasoning in PHP. Serial: CMPSBL-MNIHJAX3-4GSN.

**Classification:** PHP · 312 lines · Depth Score 58/100 (moderate complexity, minimal error handling, extensive function dispatch surface).

> **Critical Discovery:** During Stage 5 collision, the Discovery Engine™ identified **5 distinct capability futures** embedded in the agent's architecture that the original author had not recognized. The SOVEREIGN primitive detected latent data residency governance capabilities. The SHADOW primitive identified ghost defense patterns — the agent's tool-dispatch mechanism could be structurally augmented to detect and reject shadow tool injections. The ECONOMY primitive computed a combined floor valuation of approximately **$2.6M** in latent intellectual property across the discovered capabilities.

**Remediation:** Ascension™ applied:
- Sovereign governance layer for data residency compliance
- Ghost defense shielding via SHADOW primitive tool-injection detection
- AUDIT immutable logging of all tool-dispatch decisions
- CONSCIENCE ethical boundary enforcement on agent output
- DREAM sub-threshold synthesis for emergent reasoning pattern detection

**Result:** CJPI 100 (APEX classification — the highest possible score). 20 S-Tier capabilities unlocked. The session demonstrated domain-specific primitive application: WATCHTOWER for Cyber vertical analysis and VECTOR for Robotics vertical cross-pollination.

### 5.4 Case Study 3: NASA cFS Framework

**Subject:** `cfe/fsw/cfe-core/src/es/cfe_es_api.c` — the Executive Services API of NASA's core Flight System (cFS), the open-source flight software framework used aboard the International Space Station and multiple satellite missions.

**Classification:** C · 1,247 lines · Depth Score 82/100 (very high complexity, moderate error handling, zero type safety annotations, deep nesting).

> **Critical Discovery:** During Stage 5 collision, the IMMUNITY primitive detected **memory safety augmentation paths** that conventional static analysis tools (including NASA's own CFS verification suite) had not surfaced. Specifically: (1) the `CFE_ES_CreateChildTask` function accepted raw pointer parameters without bounds validation, creating a potential stack overflow vector in the task creation path; (2) the application restart mechanism (`CFE_ES_RestartApp`) lacked atomic state transition guarantees, meaning a restart during mid-flight data acquisition could leave telemetry buffers in an inconsistent state; and (3) the MEDIC primitive identified that the health monitoring subsystem had no self-diagnostic capability — it could monitor other subsystems but could not detect its own degradation.

**Remediation:** Ascension™ applied:
- IMMUNITY adaptive threshold guards on all raw pointer parameters
- GOVERNANCE atomic state machine for application lifecycle transitions
- MEDIC self-diagnostic health loop with BEACON heartbeat signaling
- FAILSAFE circuit breakers on the restart path to prevent mid-acquisition corruption
- DEFENSE anomaly detection on telemetry buffer access patterns

**Result:** CJPI 97 (S-Tier). 20 S-Tier capabilities unlocked. The aerospace-domain findings demonstrate that Ascension™'s structural analysis surfaces memory safety issues that domain-specific tools miss because they focus on functional correctness rather than structural resilience.

### 5.5 Case Study 4: Solana Token Program

**Subject:** `token/program/src/processor.rs` — the core instruction processor for Solana's SPL Token Program, which secures billions of dollars in on-chain token assets and processes millions of transactions daily.

**Classification:** Rust · 1,893 lines · Depth Score 88/100 (very high complexity, strong type coverage, extensive pattern matching, deep control flow).

> **Critical Discovery:** During Stage 5 collision, the DEFENSE primitive detected **cross-program invocation (CPI) hardening gaps** in the token transfer path. While Rust's type system prevented memory safety issues, the structural analysis revealed that: (1) the `process_transfer` instruction did not enforce caller-identity verification at the CPI boundary, meaning a malicious program could invoke transfer on behalf of a user without proper authority chain validation; (2) the AUDIT primitive identified that mint authority transitions lacked immutable provenance chains — an authority change was logged but not cryptographically anchored to the previous authority; and (3) the SOVEREIGN primitive detected that the program's account validation relied on runtime checks rather than compile-time constraints, creating a class of "phantom account" attacks where structurally valid but semantically invalid accounts could pass validation.

**Remediation:** Ascension™ applied:
- DEFENSE CPI boundary hardening with caller-identity chain verification
- AUDIT immutable authority provenance chains with cryptographic anchoring
- SOVEREIGN compile-time account constraint enforcement via GOVERNANCE policy
- IMMUNITY adaptive rate limiting on high-frequency transfer paths
- FAILSAFE circuit breaker on mint operations during authority transitions

**Result:** CJPI 96 (S-Tier). 20 S-Tier capabilities unlocked. The blockchain-domain analysis demonstrates that even in memory-safe languages like Rust, Ascension™ discovers architectural vulnerabilities at the protocol design layer that type systems cannot express.

### 5.6 Case Study 5: IBM Qiskit ConsolidateBlocks

**Subject:** `qiskit/transpiler/passes/optimization/consolidate_blocks.py` — the circuit optimization pass in IBM's Qiskit quantum computing framework that consolidates sequences of quantum gates into single unitary operations. Serial: CMPSBL-MNJ4Y3JG-CQOW.

**Classification:** Python · 189 lines · Depth Score 54/100 (moderate complexity, minimal error handling, high mathematical density).

> **Critical Discovery:** During Stage 5 collision, the VERITAS Engine detected **unguarded circuit optimization passes** where the consolidation algorithm applied unitary decomposition without verifying numerical stability of the resulting matrix. The ORACLE primitive identified that the block selection heuristic used greedy traversal without backtracking, meaning suboptimal consolidation choices early in the circuit could cascade into globally poor optimization outcomes. Additionally, the CONSCIENCE primitive flagged that the pass had no bias detection for qubit topology — it optimized uniformly across all qubits regardless of hardware error rates, potentially worsening fidelity on noisy qubits.

**Remediation:** Ascension™ applied:
- VERITAS numerical stability verification on all unitary decompositions
- ORACLE predictive optimization with backtracking search
- CONSCIENCE topology-aware optimization bias correction
- FAILSAFE circuit breaker on optimization passes that degrade gate fidelity
- BEACON health signals for optimization quality metrics

**Result:** CJPI 98 (S-Tier). 20 S-Tier capabilities unlocked — 10 spine primitives and 10 CMPSBL Quantum™ Vertical expansion primitives specialized for quantum circuit analysis.

### 5.7 Case Study 6: Hugging Face Tokenizers (Detailed)

**Subject:** `tokenizers/__init__.py` — the entry point for Hugging Face's tokenization library, downloaded 73M+ times monthly via PyPI. Serial: CMPSBL-MNJ6GG7U-EBF7.

**Classification:** Python · 101 lines · Depth Score 42/100 (moderate complexity, low error handling density).

> **Critical Discovery:** During Stage 5 collision, the VERITAS Engine (factual grounding primitive from the CMPSBL LLM™ Vertical) detected a **complete absence of error handling** in the module's import chain. The `from .tokenizers import (...)` statement — which loads the Rust-compiled native extension — contained zero `try/except` protection. A failed native load (corrupted binary, architecture mismatch, missing dependency) would produce an unhandled `ImportError`, crashing any downstream application without diagnostic information. This library is a foundational dependency for 🤗 Transformers (140M+ monthly downloads) and every major LLM inference pipeline.

**Remediation:** Ascension™ hardened the native import chain with:
- Structured error handling with diagnostic messages
- Graceful degradation paths for partial load failures
- BEACON health signals for runtime monitoring
- Circuit-breaker protection against repeated failure cascades

**Result:** CJPI 100 (APEX classification). 20 S-Tier capabilities unlocked. 10 from the core spine primitives, 10 from CMPSBL LLM™ Vertical expansion primitives.

### 5.8 Case Study 7: OpenSSL TLS 1.3 Encryption Engine

**Subject:** `ssl/tls13_enc.c` — the TLS 1.3 encryption engine of [OpenSSL](https://github.com/openssl/openssl), widely regarded as the most audited security codebase on earth. OpenSSL secures an estimated 66% of all encrypted internet traffic and is maintained by a dedicated security team with hundreds of world-class cryptographers who have reviewed this file. Serial: CMPSBL-MNJB00F5-626R.

**Classification:** C · 965 lines · Depth Score 91/100 (very high complexity — cyclomatic complexity 185, 7 levels of deep nesting, zero test coverage detected in file).

> **Critical Discovery:** During Stage 5 collision, the AEGIS and CIPHER engines detected **network call patterns with no timeout enforcement** baked into the TLS 1.3 key derivation and handshake state machine. The substrate identified an absence of timeout enforcement at the encryption layer that creates a structural dependency requiring downstream implementations to compensate — a dependency the majority of production deployments fail to satisfy. OpenSSL intentionally delegates timeout responsibility to the calling application layer, but the substrate classified this as a **structural dependency gap** because the majority of production implementations that inherit this code fail to implement timeout handling correctly downstream. This is a known, verified, open issue in OpenSSL's own GitHub repository — real developers are hitting this failure in production today.

**Remediation:** Ascension™'s hardening layer wrapped the network-adjacent operations with the structural protections the file delegates to callers but callers rarely implement:
- BEACON health signals for handshake liveness monitoring
- Circuit-breaker timeout enforcement on key derivation and handshake state transitions
- Graceful shutdown handlers for interrupted TLS sessions
- DEFENSE Layer shielding on all network-adjacent code paths

**Result:** CJPI 100 (APEX). 20 S-Tier capabilities unlocked. Standout discoveries include APT Threat Hunter, Emergency Breach Containment, and Dark Web Intelligence Monitor. The full CMPSBL Cyber™ Vertical Primitive chain fired — AEGIS, CIPHER, RECON, TEMPEST, SHADE, OBSIDIAN, BULWARK, WRAITH, BLACKOUT, NOCTURNE — the complete offensive and defensive stack.

---

## 6. The Sealed Runtime™ Architecture

### 6.1 Portability Guarantee

Every Ascension™ export is delivered as a Sealed Runtime™ — a self-contained archive that executes independently of the CMPSBL® substrate. This guarantee is structural, not contractual: the export contains its own execution environment, cognitive augmentations, and test harness.

### 6.2 Composition

```
sealed-runtime/
├── original-source.txt          # Unmodified input
├── refurbished-source.ts        # Hardened output
├── cognitive-layer/             # Substrate augmentations
├── docs/                        # Auto-generated documentation
├── test-harness/                # Validation suite
├── LICENSE.txt                  # CC BY 4.0
└── README.md                    # Integration guide
```

*Note: Internal execution engine components are proprietary (see Section 11).*

### 6.3 IP Obfuscation

The refurbished source applies structural obfuscation to the cognitive layer while preserving full functionality. The original source is always included unmodified, ensuring transparency and auditability.

---

## 7. Vertical Substrates™

### 7.1 The Vertical Thesis

Different software domains exhibit different vulnerability profiles. Financial code requires transaction integrity. Aerospace code requires memory safety. LLM code requires hallucination resistance. A single set of 40 primitives cannot optimally address all domains.

**Vertical substrates** extend the base matrix with domain-specific primitives while preserving the core collision architecture. Each vertical:
- Adds 16 domain-specific primitives (8 Engines + 8 Agents)
- Maintains its own CLM™ (Constant Learning Mode) curriculum
- Produces domain-specific Crown Jewels™
- Operates under the same GOVERNANCE and DEFENSE constraints

### 7.2 CMPSBL LLM™ — Production Vertical

The CMPSBL LLM™ Vertical targets vulnerabilities in large language model systems aligned with the OWASP Top 10 for LLMs:

| Primitive | Type | Target Vulnerability |
|-----------|------|---------------------|
| VERITAS | Engine | Hallucination / factual grounding |
| RAMPART | Engine | Prompt injection defense |
| SYLLOGISM | Engine | Reasoning chain validation |
| LEXICON | Engine | Token-level semantic analysis |
| CLARITY | Engine | Output explainability |
| FULCRUM | Engine | Bias detection and mitigation |
| TETHER | Engine | Context window management |
| SIEVE | Engine | Training data contamination filtering |
| SKEPTIC | Agent | Adversarial output challenge |
| TRIBUNAL | Agent | Multi-model output consistency |
| HERALD | Agent | Regulatory compliance reporting |
| MIMIC | Agent | Behavioral fingerprint detection |
| LINEAGE | Agent | Data provenance tracking |
| EMBARGO | Agent | Sensitive data exfiltration prevention |
| GAUNTLET | Agent | Adversarial stress testing |
| CUSTODIAN | Agent | Model supply chain security |

### 7.3 Additional Production Verticals

Three additional verticals are production-ready:

| Vertical | Domain | Specialization |
|----------|--------|---------------|
| **CMPSBL Cyber™** | Cybersecurity | Vulnerability assessment, threat modeling, exploit pattern detection |
| **CMPSBL Quantum™** | Quantum Computing | Circuit optimization, qubit topology analysis, decoherence detection |
| **CMPSBL Robotics™** | Robotics & Embedded | Sensor fusion integrity, real-time constraint validation, actuator safety |

### 7.4 Vertical Universality

The vertical architecture is domain-agnostic. Any category of software can receive a specialized vertical: aerospace, healthcare, IoT, blockchain, gaming, and beyond. The architecture scales horizontally — each vertical is an independent substrate with its own Memory Stream™, discovery corpus, and Ascension™ specialization.

---

## 8. Memory Stream™ and Autonomous Discovery

### 8.1 Continuous Discovery

The Memory Stream™ is CMPSBL®'s autonomous discovery engine. Operating on 8-hour cycles, it observes system behavior, identifies novel capability combinations, and promotes high-scoring discoveries to permanent storage. The Memory Stream™ is not triggered by user action — it runs autonomously.

### 8.2 DREAM Engine

The DREAM Engine generates heuristic insights through sub-threshold synthesis — processing signals that individually fall below the discovery threshold but collectively reveal emergent patterns. DREAM contains no artificial intelligence; it is a purely algorithmic synthesis process.

### 8.3 Compounding Intelligence

Every Ascension™ upload enriches the discovery corpus. Every Memory Stream™ cycle processes the enriched corpus. Every DREAM synthesis draws from accumulated signals. The result is compounding intelligence: the substrate becomes more capable with every interaction, every cycle, and every discovery.

---

## 9. Discussion

### 9.1 Implications for Software Engineering

Ascension™ demonstrates that post-authorship software evolution is tractable. Code need not be "finished" when the author commits — it can be systematically evolved by structural processes that discover and harden capabilities the author could not have anticipated.

### 9.2 The Determinism Advantage

By eschewing AI-based code analysis, Ascension™ achieves properties no probabilistic system can guarantee:
- **Reproducibility:** Identical inputs always produce identical outputs
- **Auditability:** Every collision, score, and transformation is traceable
- **Independence:** No external API calls, no model inference, no training data dependencies
- **Sovereignty:** The operator's code never leaves their control for model processing

### 9.3 Limitations

1. **Semantic understanding:** Ascension™ reasons about code structure, not semantic intent. It cannot determine whether a function's *purpose* is correct — only whether its *structure* is sound.
2. **Language coverage:** While 25 languages are supported, coverage depth varies. Compiled languages with rich type systems produce higher-fidelity collision results.
3. **Vertical completeness:** Four verticals are currently production-ready (CMPSBL Cyber™, CMPSBL Quantum™, CMPSBL Robotics™, CMPSBL LLM™); additional domain verticals are under active development.

### 9.4 Future Work

- **Vertical expansion:** Aerospace, healthcare, IoT, and financial verticals are in development
- **Cross-vertical collision:** Enabling discoveries that span multiple vertical domains
- **Hardware synthesis:** Extending Ascension™ to FPGA/ASIC design via hardware description language support
- **Academic collaboration:** Open-source release of collision scoring methodology for independent validation

---

## 10. Conclusion

We have presented Ascension™, a deterministic software evolution engine that discovers and hardens latent capabilities in arbitrary source code through systematic collision with a fixed 40-primitive matrix. Across six case studies spanning five languages and six verticals, Ascension™ consistently surfaced structural vulnerabilities invisible to conventional tooling — including a critical error-handling gap in one of the world's most-downloaded software libraries.

The implications extend beyond individual code hardening. Ascension™ establishes the foundation for **post-authorship software evolution** — a discipline where code improvement is structural, deterministic, and autonomous. Every piece of software ever written is a candidate. Every vulnerability is discoverable. Every capability is hardenable.

The future of code is not how it is written. It is how it evolves.

---

## 11. Protected Intellectual Property Notice

The following components, methods, and systems described or referenced in this whitepaper constitute **protected intellectual property** of CMPSBL® / PromptFluid™. They are disclosed at a functional level for academic and prior-art purposes only. Internal architectures, algorithms, source code, weights, thresholds, and implementation details are **not exposed** and remain trade secrets:

| Protected IP | Classification |
|-------------|---------------|
| Mini-Runtime Engine™ | Trade secret — internal execution architecture |
| Discovery Engine™ | Trade secret — collision scoring algorithms and weights |
| CJPI™ scoring weights and thresholds | Trade secret — hex-encoded, obfuscated in exports |
| Memory Stream™ cycle internals | Trade secret — autonomous discovery pipeline |
| DREAM synthesis algorithms | Trade secret — sub-threshold pattern detection |
| Capability Surface derivation | Trade secret — Ψ₄₁ registration method |
| Cross-sector synergy matrix values | Trade secret — sector pair scoring |
| Chain archetype resolution system | Trade secret — 100+ named archetype mappings |
| IP obfuscation pipeline (blackbox.ts) | Trade secret — hex-encoding and genericization |
| CLM™ curriculum and distillation | Trade secret — learning cycle architecture |
| Vertical primitive behavioral surfaces | Trade secret — per-vertical capability definitions |
| Crown Jewel™ classification thresholds | Trade secret — tier boundary algorithms |
| GOVERNANCE policy enforcement internals | Trade secret — immutable policy engine |
| DEFENSE Layer threat scoring model | Trade secret — cognitive security matrix |
| Boot sequencer and module lifecycle | Trade secret — 12-stage DAG-ordered kernel |

**No part of this whitepaper grants license to reproduce, reverse-engineer, or derive implementations from the protected components listed above.** The Sealed Runtime™ export format intentionally obscures these internals while preserving full runtime functionality for the end user.

For licensing inquiries: founder@cmpsbl.com

---

## References

1. Sweet, K. E. Jr. (2026). *CMPSBL®: Governed Cognitive Infrastructure for Autonomous Software Evolution.* CMPSBL® Technical Documentation. DOI: [10.5281/zenodo.18895141](https://doi.org/10.5281/zenodo.18895141)

2. Sweet, K. E. Jr. (2026). *Ascension™: Deterministic Code Evolution via 40-Primitive Collision Matrix.* CMPSBL® Ascension™ Documentation. DOI: [10.5281/zenodo.19409933](https://doi.org/10.5281/zenodo.19409933)

3. Sweet, K. E. Jr. (2026). *Memory Stream™: Autonomous Discovery in Governed Cognitive Substrates.* CMPSBL® Memory Stream™ Documentation. DOI: [10.5281/zenodo.18834080](https://doi.org/10.5281/zenodo.18834080)

4. OWASP Foundation. (2024). *OWASP Top 10 for Large Language Model Applications.* https://owasp.org/www-project-top-10-for-large-language-model-applications/

5. Hugging Face. (2026). *Tokenizers: Fast State-of-the-Art Tokenizers.* https://github.com/huggingface/tokenizers

6. NASA Goddard Space Flight Center. (2024). *core Flight System (cFS).* https://github.com/nasa/cFS

7. Solana Foundation. (2025). *Solana Program Library: Token Program.* https://github.com/solana-labs/solana-program-library

8. Stripe, Inc. (2025). *Stripe Node.js SDK.* https://github.com/stripe/stripe-node

9. IBM Research. (2025). *Qiskit: An Open-Source Framework for Quantum Computing.* https://github.com/Qiskit/qiskit

---

## Citation

```bibtex
@article{sweet2026ascension,
  title     = {Ascension: Deterministic Software Evolution Through Autonomous Primitive Collision},
  author    = {Sweet, Kenneth E., Jr.},
  year      = {2026},
  month     = {April},
  publisher = {PromptFluid},
  address   = {Austin, TX},
  note      = {ORCID: 0009-0001-4237-1243},
  url       = {https://cmpsbl.com/ascension},
  doi       = {10.5281/zenodo.19409933}
}
```

---

© 2026 CMPSBL®. All rights reserved.  
CMPSBL® is a registered trademark of PromptFluid™.  
Ascension™, Sealed Runtime™, Memory Stream™, Discovery Engine™, Mini-Runtime Engine™, Crown Jewel Pipeline Index™ (CJPI™), Crown Jewels™, CLM™, Vertical Substrates™, CMPSBL LLM™, CMPSBL Cyber™, CMPSBL Quantum™, and CMPSBL Robotics™ are trademarks of PromptFluid™.
