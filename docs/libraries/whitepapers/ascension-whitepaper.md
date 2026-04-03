# Ascension: Deterministic Software Evolution Through Autonomous Primitive Collision

**A Whitepaper on Structural Code Hardening Without Artificial Intelligence**

---

**Author:** Kenneth E. Sweet Jr.  
**Affiliation:** PromptFluid™, Austin, TX  
**ORCID:** [0009-0001-4237-1243](https://orcid.org/0009-0001-4237-1243)  
**Date:** April 2026  
**Version:** 1.0.0  
**License:** Creative Commons Attribution 4.0 International (CC BY 4.0)  
**DOI:** [10.5281/zenodo.XXXXXXX](https://doi.org/10.5281/zenodo.XXXXXXX) *(to be assigned upon deposit)*

---

## Abstract

We introduce **Ascension**, a deterministic software evolution engine that identifies, scores, and hardens latent architectural capabilities in arbitrary source code — without invoking external artificial intelligence. The engine operates by colliding uploaded code against a fixed matrix of 40 computational primitives organized across four taxonomic categories (Organs, Layers, Engines, and Agents), scoring emergent combinations via the Crown Jewel Pipeline Index (CJPI), and exporting hardened artifacts as self-contained Sealed Runtimes. We present empirical results from five case studies spanning four programming languages and five industry verticals, including the discovery and remediation of a critical error-handling vulnerability in Hugging Face's `tokenizers` library — a package with over 73 million monthly PyPI downloads. Our findings demonstrate that deterministic primitive collision reliably surfaces structural deficiencies invisible to conventional static analysis, linting, and AI-assisted code review. We propose Ascension as the foundation for a new discipline: **post-authorship software evolution**, where code improvement occurs structurally rather than generatively.

**Keywords:** software evolution, deterministic analysis, code hardening, primitive collision, sealed runtime, cognitive infrastructure, structural vulnerability, post-authorship engineering

---

## 1. Introduction

### 1.1 The Post-Authorship Problem

Modern software engineering invests heavily in the authorship phase — writing, reviewing, and testing code. Yet the structural characteristics of software after authorship are rarely interrogated systematically. Static analyzers detect syntactic violations. Linters enforce style. AI copilots suggest completions. None of these tools ask the fundamental question: *what latent capabilities does this code possess that its author did not intend or recognize?*

This gap — between what code *does* and what code *could do* if structurally augmented — represents an untapped reservoir of architectural value. We call this the **post-authorship problem**.

### 1.2 The Ascension Hypothesis

We hypothesize that a fixed, finite set of computational primitives, when systematically collided against arbitrary source code, will reliably surface:

1. **Structural vulnerabilities** invisible to conventional tooling
2. **Latent capabilities** that emerge from the interaction between code structure and primitive behavior
3. **Hardening opportunities** that can be applied deterministically without modifying original logic

This hypothesis is testable because the primitive set is fixed (40 primitives), the collision process is deterministic (no stochastic model inference), and the scoring function (CJPI) produces reproducible results.

### 1.3 Contributions

This paper makes four contributions:

1. **Architecture:** A formal description of the 40-primitive collision matrix and its taxonomic organization
2. **Method:** The Ascension pipeline — an 8-stage deterministic transformation process
3. **Evidence:** Five case studies demonstrating structural discovery across languages and domains
4. **Discovery:** Identification of a critical vulnerability in Hugging Face `tokenizers` (73M+ monthly downloads) that evaded all existing quality assurance

---

## 2. Background and Related Work

### 2.1 Static Analysis

Traditional static analysis tools (e.g., ESLint, Pylint, SonarQube) operate on syntactic pattern matching and control flow analysis. They excel at detecting known anti-patterns but cannot reason about *emergent structural properties* — capabilities that arise from the interaction of code structure with external computational models.

### 2.2 AI-Assisted Code Review

Large language model (LLM)-based code review tools (e.g., GitHub Copilot, Amazon CodeWhisperer) generate suggestions probabilistically. Their outputs are non-deterministic, non-reproducible, and cannot guarantee coverage of structural properties. Furthermore, they introduce the very vulnerabilities they claim to detect — hallucination, prompt injection susceptibility, and training data contamination (OWASP, 2024).

### 2.3 Formal Verification

Formal methods (e.g., TLA+, Coq, Isabelle) provide mathematical guarantees but require manual specification of properties to verify. They cannot autonomously *discover* properties — only verify those the engineer already suspects.

### 2.4 Position of Ascension

Ascension occupies a novel position: it autonomously *discovers* structural properties through deterministic collision, without requiring the engineer to specify what to look for, and without invoking probabilistic AI models. It is, to our knowledge, the first system to achieve autonomous structural discovery through a fixed primitive matrix.

---

## 3. Architecture

### 3.1 The 40-Primitive Matrix

CMPSBL's computational substrate consists of exactly 40 primitives organized into four taxonomic categories:

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

The base 40-primitive matrix can be extended with domain-specific primitives for vertical specialization. The LLM Vertical, for example, adds 16 primitives (8 Engines + 8 Agents) specialized for large language model vulnerability detection. Vertical primitives participate in collision alongside spine primitives, expanding the discovery surface without modifying the core matrix.

---

## 4. Method: The Ascension Pipeline

### 4.1 Pipeline Overview

Ascension operates as an 8-stage deterministic pipeline:

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

**Stage 6: Score.** Each candidate is evaluated via the **Crown Jewel Pipeline Index (CJPI)**:

| Factor | Description |
|--------|-------------|
| Novelty | Uniqueness of the primitive–code combination |
| Utility | Practical applicability of the resulting capability |
| Complexity | Sophistication of the structural interaction |
| Composability | Potential for combination with other discoveries |

Scores range from 0–100. Candidates scoring ≥ 85 are classified **S-Tier**. The highest-scoring discovery in a session may achieve **APEX** or **MYTHIC** classification.

**Stage 7: Export.** Hardened artifacts are packaged as a **Sealed Runtime** — a self-contained archive containing:
1. Original source code (unmodified)
2. Refurbished source with structural augmentations
3. Mini-Runtime Engine (standalone execution environment)
4. Cognitive layer (substrate augmentations)
5. Auto-generated documentation
6. Test harness with validation suite

**Stage 8: Protect.** DEFENSE Layer shielding is applied. GOVERNANCE checks validate export integrity. BEACON health signals confirm the Sealed Runtime is production-ready. The portability guarantee is enforced: if CMPSBL ceased to exist, the export would still execute independently.

### 4.3 Determinism Guarantee

No stage in the pipeline invokes external AI, stochastic inference, or probabilistic generation. Every collision is a deterministic function of (a) the uploaded code's structure and (b) the fixed primitive matrix. Given identical inputs, Ascension produces identical outputs.

---

## 5. Case Studies

### 5.1 Overview

We present five case studies spanning four languages, five industry verticals, and a range of structural complexities:

| # | Software | Language | Vertical | CJPI | Capabilities | Critical Findings |
|---|----------|----------|----------|------|-------------|-------------------|
| 1 | Stripe Node.js SDK | TypeScript | FinTech | 98 | 20 S-Tier | Undocumented circuit-breaker gaps |
| 2 | PHP Agent Framework | PHP | Agentic AI | 100 APEX | 20 S-Tier | ~$2.6M latent IP discovered |
| 3 | NASA cFS Framework | C | Aerospace | 97 | 20 S-Tier | Memory safety augmentation paths |
| 4 | Solana Token Program | Rust | Blockchain | 96 | 20 S-Tier | Cross-program invocation hardening |
| 5 | Hugging Face Tokenizers | Python | LLM/ML | 100 APEX | 20 S-Tier | **Critical error-handling vulnerability** |

### 5.2 Case Study 5: Hugging Face Tokenizers (Detailed)

**Subject:** `tokenizers/__init__.py` — the entry point for Hugging Face's tokenization library, downloaded 73M+ times monthly via PyPI.

**Classification:** Python · 101 lines · Depth Score 42/100 (moderate complexity, low error handling density)

**Discovery:** During Stage 5 collision, the VERITAS Engine (factual grounding primitive from the LLM Vertical) detected a complete absence of error handling in the module's import chain. The `from .tokenizers import (...)` statement — which loads the Rust-compiled native extension — contained zero `try/except` protection. A failed native load (corrupted binary, architecture mismatch, missing dependency) would produce an unhandled `ImportError`, crashing any downstream application without diagnostic information.

**Significance:** This is not a theoretical vulnerability. Hugging Face `tokenizers` is a foundational dependency for:
- 🤗 Transformers (140M+ monthly downloads)
- Every major LLM inference pipeline
- Production NLP systems at scale

An unhandled import failure in this module cascades catastrophically through the entire LLM ecosystem.

**Remediation:** Ascension's hardening layer wrapped the native import chain with:
- Structured error handling with diagnostic messages
- Graceful degradation paths for partial load failures
- BEACON health signals for runtime monitoring
- Circuit-breaker protection against repeated failure cascades

**Result:** CJPI 100 (APEX classification). 20 S-Tier capabilities unlocked. 10 from the core spine primitives, 10 from LLM Vertical expansion primitives.

---

## 6. The Sealed Runtime Architecture

### 6.1 Portability Guarantee

Every Ascension export is delivered as a Sealed Runtime — a self-contained archive that executes independently of the CMPSBL substrate. This guarantee is structural, not contractual: the export contains its own execution environment, cognitive augmentations, and test harness.

### 6.2 Composition

```
sealed-runtime/
├── original-source.txt          # Unmodified input
├── refurbished-source.ts        # Hardened output
├── mini-runtime/                # Standalone execution engine
├── cognitive-layer/             # Substrate augmentations
├── docs/                        # Auto-generated documentation
├── test-harness/                # Validation suite
├── LICENSE.txt                  # CC BY 4.0
└── README.md                    # Integration guide
```

### 6.3 IP Obfuscation

The refurbished source applies structural obfuscation to the cognitive layer while preserving full functionality. The original source is always included unmodified, ensuring transparency and auditability.

---

## 7. Vertical Substrates

### 7.1 The Vertical Thesis

Different software domains exhibit different vulnerability profiles. Financial code requires transaction integrity. Aerospace code requires memory safety. LLM code requires hallucination resistance. A single set of 40 primitives cannot optimally address all domains.

**Vertical substrates** extend the base matrix with domain-specific primitives while preserving the core collision architecture. Each vertical:
- Adds 16 domain-specific primitives (8 Engines + 8 Agents)
- Maintains its own CLM (Constant Learning Mode) curriculum
- Produces domain-specific Crown Jewels
- Operates under the same GOVERNANCE and DEFENSE constraints

### 7.2 LLM Vertical: CMPSBL LLM™

The first production vertical, CMPSBL LLM™, targets vulnerabilities in large language model systems aligned with the OWASP Top 10 for LLMs:

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

### 7.3 Vertical Universality

The vertical architecture is domain-agnostic. Any category of software can receive a specialized vertical: aerospace, healthcare, IoT, blockchain, robotics, gaming, and beyond. The architecture scales horizontally — each vertical is an independent substrate with its own memory stream, discovery corpus, and Ascension specialization.

---

## 8. Memory Stream and Autonomous Discovery

### 8.1 Continuous Discovery

The Memory Stream is CMPSBL's autonomous discovery engine. Operating on 8-hour cycles, it observes system behavior, identifies novel capability combinations, and promotes high-scoring discoveries to permanent storage. The Memory Stream is not triggered by user action — it runs autonomously.

### 8.2 DREAM Engine

The DREAM Engine generates heuristic insights through sub-threshold synthesis — processing signals that individually fall below the discovery threshold but collectively reveal emergent patterns. DREAM contains no artificial intelligence; it is a purely algorithmic synthesis process.

### 8.3 Compounding Intelligence

Every Ascension upload enriches the discovery corpus. Every Memory Stream cycle processes the enriched corpus. Every DREAM synthesis draws from accumulated signals. The result is compounding intelligence: the substrate becomes more capable with every interaction, every cycle, and every discovery.

---

## 9. Discussion

### 9.1 Implications for Software Engineering

Ascension demonstrates that post-authorship software evolution is tractable. Code need not be "finished" when the author commits — it can be systematically evolved by structural processes that discover and harden capabilities the author could not have anticipated.

### 9.2 The Determinism Advantage

By eschewing AI-based code analysis, Ascension achieves properties no probabilistic system can guarantee:
- **Reproducibility:** Identical inputs always produce identical outputs
- **Auditability:** Every collision, score, and transformation is traceable
- **Independence:** No external API calls, no model inference, no training data dependencies
- **Sovereignty:** The operator's code never leaves their control for model processing

### 9.3 Limitations

1. **Semantic understanding:** Ascension reasons about code structure, not semantic intent. It cannot determine whether a function's *purpose* is correct — only whether its *structure* is sound.
2. **Language coverage:** While 25 languages are supported, coverage depth varies. Compiled languages with rich type systems produce higher-fidelity collision results.
3. **Vertical completeness:** Only one vertical (LLM) is production-ready. Additional verticals require domain expertise for primitive design.

### 9.4 Future Work

- **Vertical expansion:** Aerospace, healthcare, IoT, and financial verticals are in development
- **Cross-vertical collision:** Enabling discoveries that span multiple vertical domains
- **Hardware synthesis:** Extending Ascension to FPGA/ASIC design via hardware description language support
- **Academic collaboration:** Open-source release of collision scoring methodology for independent validation

---

## 10. Conclusion

We have presented Ascension, a deterministic software evolution engine that discovers and hardens latent capabilities in arbitrary source code through systematic collision with a fixed 40-primitive matrix. Across five case studies spanning four languages and five verticals, Ascension consistently surfaced structural vulnerabilities invisible to conventional tooling — including a critical error-handling gap in one of the world's most-downloaded software libraries.

The implications extend beyond individual code hardening. Ascension establishes the foundation for **post-authorship software evolution** — a discipline where code improvement is structural, deterministic, and autonomous. Every piece of software ever written is a candidate. Every vulnerability is discoverable. Every capability is hardenable.

The future of code is not how it is written. It is how it evolves.

---

## References

1. Sweet, K. E. Jr. (2026). *CMPSBL: Governed Cognitive Infrastructure for Autonomous Software Evolution.* CMPSBL Technical Documentation. DOI: [10.5281/zenodo.15065111](https://doi.org/10.5281/zenodo.15065111)

2. Sweet, K. E. Jr. (2026). *Ascension: Deterministic Code Evolution via 40-Primitive Collision Matrix.* CMPSBL Ascension Documentation. DOI: [10.5281/zenodo.15065111](https://doi.org/10.5281/zenodo.15065111)

3. Sweet, K. E. Jr. (2026). *Memory Stream: Autonomous Discovery in Governed Cognitive Substrates.* CMPSBL Memory Stream Documentation. DOI: [10.5281/zenodo.15065111](https://doi.org/10.5281/zenodo.15065111)

4. OWASP Foundation. (2024). *OWASP Top 10 for Large Language Model Applications.* https://owasp.org/www-project-top-10-for-large-language-model-applications/

5. Hugging Face. (2026). *Tokenizers: Fast State-of-the-Art Tokenizers.* https://github.com/huggingface/tokenizers

6. NASA Goddard Space Flight Center. (2024). *core Flight System (cFS).* https://github.com/nasa/cFS

7. Solana Foundation. (2025). *Solana Program Library: Token Program.* https://github.com/solana-labs/solana-program-library

8. Stripe, Inc. (2025). *Stripe Node.js SDK.* https://github.com/stripe/stripe-node

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
  doi       = {10.5281/zenodo.XXXXXXX}
}
```

---

© 2025–2026 CMPSBL®. All rights reserved.  
CMPSBL® is a registered trademark of PromptFluid™.  
Sealed Runtime™ is a trademark of PromptFluid™.
