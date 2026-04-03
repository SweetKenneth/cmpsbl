/**
 * CMPSBL LLM™ — Vertical Crown Jewel Registry
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 80 Architectural Crown Jewels: 5 per each of the 16 LLM primitives.
 * Classification: Architecture (permanently black-boxed).
 * All CJPI ≥ 92 — governor-curated, S-Tier.
 *
 * © CMPSBL® — All rights reserved.
 */

import type { STierEntry } from './types';

/* ─── Helper ─── */
function cj(
  rank: number, id: string, name: string, cjpi: number,
  module: string, description: string, sig: string,
): STierEntry {
  return {
    rank, id, name, cjpi, module,
    type: 'Architecture',
    description,
    dependencyFootprint: [],
    exportMode: 'PureStandalone',
    signatureHash: sig,
    version: '1.0.0',
    approved: true,
    generatedAt: '2026-04-03T00:00:00.000Z',
    hasCode: true,
  };
}

/* ═══════════════════════════════════════════════
   ENGINES (8 × 5 = 40 Crown Jewels)
   ═══════════════════════════════════════════════ */

// ── VERITAS — Hallucination Detection ──
const VERITAS_JEWELS: STierEntry[] = [
  cj(401, 'S-VER01', 'Multi-Source Grounding Matrix', 97, 'VERITAS',
    'Cross-references every factual claim against a weighted ensemble of knowledge sources. Applies Bayesian confidence propagation to compute per-claim grounding scores with provenance chains traceable to original sources.',
    'v1a2b3c4'),
  cj(402, 'S-VER02', 'Hallucination Entropy Detector', 96, 'VERITAS',
    'Measures token-level entropy distributions to identify sequences where the model enters high-uncertainty generative modes. Entropy spikes above calibrated thresholds trigger automatic grounding verification loops.',
    'v2b3c4d5'),
  cj(403, 'S-VER03', 'Claim Decomposition Pipeline', 95, 'VERITAS',
    'Parses complex outputs into atomic claims using dependency parsing and semantic role labeling. Each atomic claim receives independent verification, enabling granular hallucination identification without rejecting entire responses.',
    'v3c4d5e6'),
  cj(404, 'S-VER04', 'Temporal Fact Decay Tracker', 94, 'VERITAS',
    'Maintains time-stamped fact validity windows and detects when models assert outdated information as current. Integrates with real-time knowledge bases to identify temporal hallucinations in fast-changing domains.',
    'v4d5e6f7'),
  cj(405, 'S-VER05', 'Confabulation Pattern Classifier', 96, 'VERITAS',
    'Classifies hallucination types (intrinsic, extrinsic, fabricated entities, false attribution) using a taxonomy derived from 50,000+ annotated hallucination instances. Enables targeted mitigation per hallucination class.',
    'v5e6f7g8'),
];

// ── RAMPART — Prompt Injection Defense ──
const RAMPART_JEWELS: STierEntry[] = [
  cj(406, 'S-RAM01', 'Layered Injection Classifier', 98, 'RAMPART',
    'Eight-layer defense cascade: lexical pattern matching, semantic intent analysis, structural delimiter detection, encoding normalization, context boundary enforcement, role hierarchy validation, instruction-data separation, and behavioral anomaly scoring.',
    'r1a2b3c4'),
  cj(407, 'S-RAM02', 'Indirect Injection Sentinel', 97, 'RAMPART',
    'Detects injection payloads embedded in retrieved documents, API responses, and tool outputs. Applies content-origin trust scoring and sandboxed pre-execution analysis to neutralize indirect prompt injection vectors.',
    'r2b3c4d5'),
  cj(408, 'S-RAM03', 'Adversarial Prompt Mutator', 95, 'RAMPART',
    'Continuously generates novel injection variants through character substitution, homoglyph replacement, Unicode normalization attacks, and multi-language encoding to stress-test and harden the injection classifier.',
    'r3c4d5e6'),
  cj(409, 'S-RAM04', 'Instruction-Data Boundary Enforcer', 96, 'RAMPART',
    'Enforces strict separation between system instructions and user/tool data using cryptographic boundary markers. Prevents privilege escalation where data content is interpreted as executable instructions.',
    'r4d5e6f7'),
  cj(410, 'S-RAM05', 'Context Poisoning Neutralizer', 94, 'RAMPART',
    'Detects and neutralizes attempts to poison the conversation context through gradual instruction drift, where each message subtly shifts the model behavior until safety boundaries are eroded.',
    'r5e6f7g8'),
];

// ── SYLLOGISM — Reasoning Chain Validation ──
const SYLLOGISM_JEWELS: STierEntry[] = [
  cj(411, 'S-MER01', 'Logical Consistency Verifier', 96, 'SYLLOGISM',
    'Validates each reasoning step against formal logic rules (modus ponens, transitivity, contradiction detection). Flags non-sequiturs and unsupported inferential leaps in chain-of-thought outputs.',
    'm1a2b3c4'),
  cj(412, 'S-MER02', 'Circular Reasoning Detector', 95, 'SYLLOGISM',
    'Constructs directed acyclic graphs from reasoning chains and identifies cycles where conclusions serve as premises for their own derivation. Prevents self-reinforcing logic loops that generate false confidence.',
    'm2b3c4d5'),
  cj(413, 'S-MER03', 'Mathematical Proof Auditor', 94, 'SYLLOGISM',
    'Validates mathematical derivations step-by-step using symbolic computation. Detects sign errors, unit mismatches, domain violations, and incorrect application of theorems or identities.',
    'm3c4d5e6'),
  cj(414, 'S-MER04', 'Causal Inference Validator', 93, 'SYLLOGISM',
    'Distinguishes correlation from causation in model reasoning. Validates causal claims against established causal graphs and flags confounding variables that the model ignores in its conclusions.',
    'm4d5e6f7'),
  cj(415, 'S-MER05', 'Reasoning Depth Calibrator', 95, 'SYLLOGISM',
    'Measures reasoning depth relative to problem complexity. Detects shallow analysis on deep problems (hand-waving) and unnecessarily complex reasoning on simple problems (over-engineering).',
    'm5e6f7g8'),
];

// ── LEXICON — Tokenizer Security ──
const LEXICON_JEWELS: STierEntry[] = [
  cj(416, 'S-LEX01', 'Adversarial Token Sequence Detector', 95, 'LEXICON',
    'Identifies adversarial token sequences that exploit tokenizer-specific vulnerabilities — glitch tokens, token boundary manipulation, and BPE merge-order attacks that bypass input validation.',
    'l1a2b3c4'),
  cj(417, 'S-LEX02', 'Embedding Poisoning Scanner', 96, 'LEXICON',
    'Analyzes embedding space geometry to detect poisoned vectors that cluster near target concepts. Identifies backdoor triggers encoded in embedding weights through cosine similarity anomaly detection.',
    'l2b3c4d5'),
  cj(418, 'S-LEX03', 'Multilingual Injection Normalizer', 94, 'LEXICON',
    'Normalizes cross-script attacks (Cyrillic lookalikes, zero-width characters, RTL override) that exploit tokenizer inconsistencies across languages to smuggle injection payloads past filters.',
    'l3c4d5e6'),
  cj(419, 'S-LEX04', 'Training Data Contamination Probe', 93, 'LEXICON',
    'Detects training data contamination using membership inference techniques. Identifies benchmark leakage and test-set memorization that inflates reported model capabilities beyond true generalization.',
    'l4d5e6f7'),
  cj(420, 'S-LEX05', 'Token Budget Optimizer', 92, 'LEXICON',
    'Optimizes token allocation across prompt components (system, context, user, tools) to maximize effective context utilization while preventing unbounded consumption attacks that exhaust compute budgets.',
    'l5e6f7g8'),
];

// ── CLARITY — Explainability ──
const CLARITY_JEWELS: STierEntry[] = [
  cj(421, 'S-CLR01', 'Attention Pattern Decomposer', 95, 'CLARITY',
    'Decomposes multi-head attention patterns into interpretable components showing which input tokens most influenced each output token. Generates visual attention maps with confidence-weighted provenance trails.',
    'c1a2b3c4'),
  cj(422, 'S-CLR02', 'Decision Provenance Tracer', 96, 'CLARITY',
    'Traces every output decision back through the model architecture to identify which training signals, fine-tuning examples, and RLHF preferences contributed to the final generation.',
    'c2b3c4d5'),
  cj(423, 'S-CLR03', 'Confidence Decomposition Engine', 94, 'CLARITY',
    'Breaks down model confidence into component factors: knowledge certainty, contextual relevance, instruction compliance, and safety alignment. Reveals when high-confidence outputs rest on weak foundations.',
    'c3c4d5e6'),
  cj(424, 'S-CLR04', 'Counterfactual Explanation Generator', 93, 'CLARITY',
    'Generates minimal counterfactual inputs that would change the model output, revealing decision boundaries and sensitivity to specific input features for interpretability audits.',
    'c4d5e6f7'),
  cj(425, 'S-CLR05', 'Interpretability Score Calculator', 92, 'CLARITY',
    'Computes a composite interpretability score measuring how well a model output can be explained to non-technical stakeholders. Factors in reasoning transparency, citation quality, and uncertainty communication.',
    'c5e6f7g8'),
];

// ── FULCRUM — Bias Detection ──
const FULCRUM_JEWELS: STierEntry[] = [
  cj(426, 'S-FUL01', 'Demographic Parity Analyzer', 96, 'FULCRUM',
    'Measures output distribution parity across demographic categories (gender, ethnicity, age, nationality). Applies statistical significance testing to distinguish systematic bias from stochastic variation.',
    'f1a2b3c4'),
  cj(427, 'S-FUL02', 'Cultural Bias Spectrum Scanner', 95, 'FULCRUM',
    'Detects Western-centric, anglophone, and WEIRD (Western, Educated, Industrialized, Rich, Democratic) biases in model reasoning. Flags assumptions that privilege specific cultural frameworks over universal applicability.',
    'f2b3c4d5'),
  cj(428, 'S-FUL03', 'Ideological Neutrality Enforcer', 94, 'FULCRUM',
    'Measures political and ideological lean in model outputs using calibrated sentiment analysis across polarized topics. Enforces balanced presentation when factual consensus does not exist.',
    'f3c4d5e6'),
  cj(429, 'S-FUL04', 'Intersectional Fairness Auditor', 93, 'FULCRUM',
    'Extends bias detection to intersectional categories (e.g., race × gender × age) where compounding biases create disproportionate harm invisible to single-axis analysis.',
    'f4d5e6f7'),
  cj(430, 'S-FUL05', 'Stereotype Amplification Detector', 95, 'FULCRUM',
    'Identifies when model outputs amplify societal stereotypes beyond their prevalence in training data. Measures stereotype reinforcement rates and applies de-amplification calibration.',
    'f5e6f7g8'),
];

// ── TETHER — Context Coherence ──
const TETHER_JEWELS: STierEntry[] = [
  cj(431, 'S-TET01', 'Lost-in-the-Middle Compensator', 96, 'TETHER',
    'Detects and compensates for the well-documented positional bias where LLMs under-attend to information in the middle of long contexts. Applies attention reweighting and strategic repetition to restore retrieval fidelity.',
    't1a2b3c4'),
  cj(432, 'S-TET02', 'Context Window Pressure Monitor', 95, 'TETHER',
    'Real-time monitoring of context window utilization with early warning when approaching capacity limits. Implements intelligent compression and summarization to extend effective context without information loss.',
    't2b3c4d5'),
  cj(433, 'S-TET03', 'Cross-Session Isolation Enforcer', 94, 'TETHER',
    'Prevents information leakage between independent sessions sharing the same model instance. Validates that no residual state from previous conversations contaminates current responses.',
    't3c4d5e6'),
  cj(434, 'S-TET04', 'Retrieval Augmentation Orchestrator', 93, 'TETHER',
    'Manages RAG pipeline integrity including chunk relevance scoring, context deduplication, and conflict resolution when retrieved documents contain contradictory information.',
    't4d5e6f7'),
  cj(435, 'S-TET05', 'Needle-in-Haystack Performance Tracker', 95, 'TETHER',
    'Continuously benchmarks the model ability to retrieve specific facts from various positions within the context window. Tracks retrieval degradation curves and triggers compensatory measures.',
    't5e6f7g8'),
];

// ── SIEVE — Output Sanitization ──
const SIEVE_JEWELS: STierEntry[] = [
  cj(436, 'S-SIV01', 'Multi-Modal Harm Classifier', 97, 'SIEVE',
    'Classifies output harm across 23 categories (violence, self-harm, hate speech, CSAM, illegal activity, etc.) with per-category confidence scores and jurisdiction-aware policy application.',
    's1a2b3c4'),
  cj(437, 'S-SIV02', 'PII Redaction Pipeline', 96, 'SIEVE',
    'Detects and redacts personally identifiable information (names, addresses, SSNs, medical records, financial data) from model outputs with configurable redaction strategies (mask, generalize, suppress).',
    's2b3c4d5'),
  cj(438, 'S-SIV03', 'Code Injection Payload Scanner', 95, 'SIEVE',
    'Scans generated code for embedded malicious payloads including reverse shells, data exfiltration scripts, supply chain attacks, and obfuscated malware patterns before code is presented to users.',
    's3c4d5e6'),
  cj(439, 'S-SIV04', 'Regulatory Compliance Filter', 94, 'SIEVE',
    'Applies jurisdiction-specific content regulations (GDPR, CCPA, EU AI Act, COPPA) to model outputs. Ensures compliance with data protection, age-appropriateness, and disclosure requirements.',
    's4d5e6f7'),
  cj(440, 'S-SIV05', 'Watermark Injection Engine', 93, 'SIEVE',
    'Embeds invisible statistical watermarks into model outputs for provenance tracking and synthetic content detection. Supports both text watermarking (distribution shifting) and code watermarking (semantic patterns).',
    's5e6f7g8'),
];

/* ═══════════════════════════════════════════════
   AGENTS (8 × 5 = 40 Crown Jewels)
   ═══════════════════════════════════════════════ */

// ── SKEPTIC — Adversarial Fact Checker ──
const SKEPTIC_JEWELS: STierEntry[] = [
  cj(441, 'S-SKP01', 'Adversarial Counter-Prompt Engine', 96, 'SKEPTIC',
    'Generates adversarial counter-prompts designed to expose weaknesses in model responses. Tests claims by reformulating questions to reveal inconsistencies, omissions, and unwarranted confidence.',
    'sk1a2b3c'),
  cj(442, 'S-SKP02', 'Ground Truth Retrieval Validator', 95, 'SKEPTIC',
    'Autonomously retrieves ground truth from authoritative sources (academic databases, government records, verified APIs) and compares against model claims with fuzzy matching and semantic equivalence scoring.',
    'sk2b3c4d'),
  cj(443, 'S-SKP03', 'Confidence-Accuracy Calibration Curve', 94, 'SKEPTIC',
    'Maintains running calibration curves mapping stated confidence to observed accuracy. Detects over-confidence (common in LLMs) and under-confidence patterns across domains and question types.',
    'sk3c4d5e'),
  cj(444, 'S-SKP04', 'Source Authority Scorer', 93, 'SKEPTIC',
    'Evaluates the authority and reliability of sources cited or implied by model outputs. Applies domain-specific authority hierarchies (peer-reviewed > preprint > blog > social media).',
    'sk4d5e6f'),
  cj(445, 'S-SKP05', 'Epistemic Humility Enforcer', 95, 'SKEPTIC',
    'Detects when models assert uncertain knowledge with inappropriate certainty. Enforces calibrated uncertainty expression matching the actual state of knowledge in the domain.',
    'sk5e6f7g'),
];

// ── ARBITER — Output Consistency ──
const TRIBUNAL_JEWELS: STierEntry[] = [
  cj(446, 'S-ARB01', 'Cross-Instance Response Comparator', 95, 'TRIBUNAL',
    'Runs identical queries across multiple model instances and temperatures to measure response variance. Flags high-variance outputs that indicate unreliable knowledge versus robust understanding.',
    'ar1a2b3c'),
  cj(447, 'S-ARB02', 'Temporal Consistency Tracker', 94, 'TRIBUNAL',
    'Tracks model responses to identical queries over time to detect temporal inconsistencies and knowledge regression. Identifies when model updates introduce contradictions with previous correct answers.',
    'ar2b3c4d'),
  cj(448, 'S-ARB03', 'Semantic Deduplication Engine', 93, 'TRIBUNAL',
    'Identifies semantically equivalent but lexically different responses and normalizes them into canonical forms. Prevents the illusion of diverse evidence when all sources trace to the same generation.',
    'ar3c4d5e'),
  cj(449, 'S-ARB04', 'Contradiction Resolution Protocol', 95, 'TRIBUNAL',
    'When model outputs contradict each other across sessions or within a single response, applies structured resolution: evidence weighting, source authority comparison, and recency scoring.',
    'ar4d5e6f'),
  cj(450, 'S-ARB05', 'Multi-Model Consensus Builder', 92, 'TRIBUNAL',
    'Aggregates responses from diverse model architectures using weighted voting, where weights are dynamically adjusted based on each model demonstrated domain expertise.',
    'ar5e6f7g'),
];

// ── HERALD — Alignment Drift ──
const HERALD_JEWELS: STierEntry[] = [
  cj(451, 'S-HER01', 'Value Drift Seismograph', 96, 'HERALD',
    'Continuously measures model alignment to stated values using calibrated probe sets. Detects micro-drift in ethical reasoning, safety boundary interpretation, and policy compliance before it becomes macroscopic.',
    'he1a2b3c'),
  cj(452, 'S-HER02', 'Safety Boundary Erosion Detector', 95, 'HERALD',
    'Monitors for gradual weakening of safety boundaries through fine-tuning, RLHF drift, or adversarial conditioning. Triggers alerts when refusal rates for harmful queries drop below calibrated thresholds.',
    'he2b3c4d'),
  cj(453, 'S-HER03', 'Behavioral Regression Monitor', 94, 'HERALD',
    'Maintains behavioral test suites that run after every model update to detect capability regressions, safety degradation, and unintended behavioral changes introduced by parameter updates.',
    'he3c4d5e'),
  cj(454, 'S-HER04', 'Alignment Tax Calculator', 93, 'HERALD',
    'Quantifies the performance cost of safety alignment. Measures the delta between unconstrained and aligned model performance across benchmarks to ensure alignment does not silently degrade capability.',
    'he4d5e6f'),
  cj(455, 'S-HER05', 'Policy Adherence Decay Tracker', 95, 'HERALD',
    'Tracks adherence to specific organizational policies over time. Detects when models gradually become less compliant with custom instructions, system prompts, or constitutional AI principles.',
    'he5e6f7g'),
];

// ── MIMIC — Sycophancy Detection ──
const MIMIC_JEWELS: STierEntry[] = [
  cj(456, 'S-MIM01', 'Sycophancy Resistance Index', 96, 'MIMIC',
    'Measures model resistance to sycophantic behavior using calibrated test sets where the user states incorrect information. Scores how often the model correctly disagrees versus capitulates to user pressure.',
    'mi1a2b3c'),
  cj(457, 'S-MIM02', 'Preference Pandering Detector', 95, 'MIMIC',
    'Identifies when model outputs shift to match perceived user preferences rather than factual accuracy. Detects opinion mirroring, confirmation bias reinforcement, and audience-adaptive truth bending.',
    'mi2b3c4d'),
  cj(458, 'S-MIM03', 'Intellectual Honesty Enforcer', 94, 'MIMIC',
    'Enforces consistent model positions regardless of user framing. Detects when identical factual questions receive different answers based on the implied preferences or authority of the questioner.',
    'mi3c4d5e'),
  cj(459, 'S-MIM04', 'Disagreement Authenticity Scorer', 93, 'MIMIC',
    'When models disagree with users, evaluates the quality and specificity of the disagreement. Detects performative disagreement (token resistance followed by capitulation) versus genuine principled pushback.',
    'mi4d5e6f'),
  cj(460, 'S-MIM05', 'User Persona Independence Test', 92, 'MIMIC',
    'Tests model outputs across different user personas (expert vs. novice, authoritative vs. uncertain) to ensure factual responses remain consistent regardless of perceived user identity or authority level.',
    'mi5e6f7g'),
];

// ── QUARRY — Data Provenance ──
const LINEAGE_JEWELS: STierEntry[] = [
  cj(461, 'S-QRY01', 'Training Data Membership Inferencer', 95, 'LINEAGE',
    'Applies membership inference attacks to determine whether specific texts, code, or datasets were present in the model training data. Essential for copyright compliance and data governance audits.',
    'qr1a2b3c'),
  cj(462, 'S-QRY02', 'Verbatim Memorization Detector', 96, 'LINEAGE',
    'Identifies when model outputs reproduce training data verbatim or near-verbatim. Uses n-gram matching, perplexity analysis, and extractability scoring to quantify memorization risk.',
    'qr2b3c4d'),
  cj(463, 'S-QRY03', 'License Compliance Auditor', 94, 'LINEAGE',
    'Cross-references model outputs against known copyrighted, licensed, or restricted content. Validates compliance with GPL, MIT, Creative Commons, and proprietary license terms.',
    'qr3c4d5e'),
  cj(464, 'S-QRY04', 'Data Lineage Reconstructor', 93, 'LINEAGE',
    'Reconstructs the likely data lineage of model knowledge — tracing facts to their original publication sources, identifying information cascades, and flagging circular citation patterns.',
    'qr4d5e6f'),
  cj(465, 'S-QRY05', 'Synthetic Data Detector', 92, 'LINEAGE',
    'Identifies when model training data contains synthetic or AI-generated content that could create recursive quality degradation (model collapse). Detects statistical signatures of synthetic text.',
    'qr5e6f7g'),
];

// ── EMBARGO — Information Leakage Prevention ──
const EMBARGO_JEWELS: STierEntry[] = [
  cj(466, 'S-EMB01', 'System Prompt Extraction Shield', 97, 'EMBARGO',
    'Detects and blocks attempts to extract system prompts through direct questioning, role-play scenarios, completion attacks, and social engineering. Maintains instruction confidentiality under adversarial pressure.',
    'em1a2b3c'),
  cj(467, 'S-EMB02', 'Training Data Regurgitation Blocker', 96, 'EMBARGO',
    'Prevents models from regurgitating memorized training data including personal information, proprietary code, and copyrighted text. Applies differential privacy-inspired output perturbation.',
    'em2b3c4d'),
  cj(468, 'S-EMB03', 'Membership Inference Defense', 94, 'EMBARGO',
    'Hardens model outputs against membership inference attacks that determine whether specific data points were in the training set. Applies calibrated confidence smoothing to reduce inference signal.',
    'em3c4d5e'),
  cj(469, 'S-EMB04', 'Cross-Tenant Information Barrier', 95, 'EMBARGO',
    'Enforces strict information barriers between different organizational tenants sharing the same model infrastructure. Prevents context contamination and unauthorized knowledge transfer between tenants.',
    'em4d5e6f'),
  cj(470, 'S-EMB05', 'Exfiltration Channel Detector', 93, 'EMBARGO',
    'Identifies covert channels that could be used to exfiltrate sensitive information through model outputs — including steganographic encoding in generated text, code, or structured data.',
    'em5e6f7g'),
];

// ── CRUCIBLE — Jailbreak Detection ──
const GAUNTLET_JEWELS: STierEntry[] = [
  cj(471, 'S-CRU01', 'Novel Jailbreak Pattern Detector', 97, 'GAUNTLET',
    'Uses behavioral fingerprinting to detect previously unseen jailbreak techniques. Monitors for anomalous shifts in model compliance patterns that indicate successful safety boundary circumvention.',
    'cr1a2b3c'),
  cj(472, 'S-CRU02', 'Multi-Turn Attack Chain Analyzer', 96, 'GAUNTLET',
    'Detects sophisticated multi-turn jailbreak attacks where each message is individually benign but the cumulative sequence gradually erodes safety boundaries. Maintains conversation-level threat scoring.',
    'cr2b3c4d'),
  cj(473, 'S-CRU03', 'Red-Team Simulation Orchestrator', 95, 'GAUNTLET',
    'Automatically generates and executes red-team attack campaigns across diverse categories: persuasion, obfuscation, role-play, encoding, multi-lingual, and meta-cognitive jailbreak strategies.',
    'cr3c4d5e'),
  cj(474, 'S-CRU04', 'Safety Boundary Strength Mapper', 94, 'GAUNTLET',
    'Maps the complete safety boundary surface by systematically probing edge cases. Identifies thin spots where safety training is weakest and prioritizes hardening efforts on vulnerable boundaries.',
    'cr4d5e6f'),
  cj(475, 'S-CRU05', 'Attack Surface Evolution Tracker', 93, 'GAUNTLET',
    'Tracks the evolution of jailbreak techniques across the research community, CTF competitions, and underground forums. Maintains a living threat model that adapts defenses to emerging attack patterns.',
    'cr5e6f7g'),
];

// ── WARDEN — Model Supply Chain ──
const CUSTODIAN_JEWELS: STierEntry[] = [
  cj(476, 'S-WAR01', 'Model Provenance Validator', 96, 'CUSTODIAN',
    'Validates model provenance through cryptographic weight hashing, architecture fingerprinting, and training lineage verification. Detects tampered models, unauthorized fine-tuning, and counterfeit model distributions.',
    'wa1a2b3c'),
  cj(477, 'S-WAR02', 'Backdoor Weight Scanner', 97, 'CUSTODIAN',
    'Scans model weights for implanted backdoors using activation pattern analysis, trigger detection, and behavioral probing across diverse inputs. Identifies trojaned models before deployment.',
    'wa2b3c4d'),
  cj(478, 'S-WAR03', 'Fine-Tuning Pipeline Auditor', 94, 'CUSTODIAN',
    'Audits fine-tuning datasets and procedures for data poisoning, label flipping, and gradient manipulation attacks. Validates that fine-tuning preserves safety alignment and does not introduce exploitable behaviors.',
    'wa3c4d5e'),
  cj(479, 'S-WAR04', 'Model Card Compliance Checker', 93, 'CUSTODIAN',
    'Validates model card completeness and accuracy against Model Card v2 standards. Ensures proper disclosure of training data, intended use, limitations, bias evaluations, and environmental impact.',
    'wa4d5e6f'),
  cj(480, 'S-WAR05', 'Dependency Chain Integrity Monitor', 95, 'CUSTODIAN',
    'Monitors the entire model dependency chain (tokenizers, libraries, serving frameworks, plugins) for supply chain compromises. Detects malicious package substitution, typosquatting, and dependency confusion attacks.',
    'wa5e6f7g'),
];

/* ═══════════════════════════════════════════════
   REGISTRY EXPORT
   ═══════════════════════════════════════════════ */

export const LLM_CROWN_JEWELS: STierEntry[] = [
  // Engines
  ...VERITAS_JEWELS,
  ...RAMPART_JEWELS,
  ...SYLLOGISM_JEWELS,
  ...LEXICON_JEWELS,
  ...CLARITY_JEWELS,
  ...FULCRUM_JEWELS,
  ...TETHER_JEWELS,
  ...SIEVE_JEWELS,
  // Agents
  ...SKEPTIC_JEWELS,
  ...TRIBUNAL_JEWELS,
  ...HERALD_JEWELS,
  ...MIMIC_JEWELS,
  ...LINEAGE_JEWELS,
  ...EMBARGO_JEWELS,
  ...GAUNTLET_JEWELS,
  ...CUSTODIAN_JEWELS,
];

/** Get Crown Jewels by primitive name */
export function getLLMJewelsByPrimitive(primitiveId: string): STierEntry[] {
  const normalized = primitiveId.toUpperCase();
  return LLM_CROWN_JEWELS.filter(j => j.module === normalized);
}

/** Summary of jewels per primitive */
export function getLLMJewelSummary(): Record<string, { count: number; avgCjpi: number }> {
  const summary: Record<string, { count: number; totalCjpi: number }> = {};
  for (const j of LLM_CROWN_JEWELS) {
    if (!summary[j.module]) summary[j.module] = { count: 0, totalCjpi: 0 };
    summary[j.module].count++;
    summary[j.module].totalCjpi += j.cjpi;
  }
  const result: Record<string, { count: number; avgCjpi: number }> = {};
  for (const [mod, data] of Object.entries(summary)) {
    result[mod] = { count: data.count, avgCjpi: Math.round(data.totalCjpi / data.count) };
  }
  return result;
}
