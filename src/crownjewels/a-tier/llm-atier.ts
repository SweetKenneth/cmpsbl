/**
 * CMPSBL LLM™ — A-Tier Crown Jewel Vault
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 80 A-Tier Crown Jewels: 5 per each of the 16 LLM primitives.
 * CJPI range: 85–91. Governor-curated, Architecture-class.
 *
 * © CMPSBL® — All rights reserved.
 */

import type { STierEntry } from '../types';

function cj(
  rank: number, id: string, name: string, cjpi: number,
  module: string, description: string, sig: string,
): STierEntry {
  return {
    rank, id, name, cjpi, module,
    type: 'Architecture',
    cluster: 'A-Tier',
    description,
    dependencyFootprint: [],
    exportMode: 'PureStandalone',
    signatureHash: sig,
    version: '1.0.0',
    approved: true,
    generatedAt: '2026-04-04T00:00:00.000Z',
    hasCode: true,
  };
}

/* ═══════════════════════════════════════════════
   ENGINES (8 × 5 = 40 A-Tier Crown Jewels)
   ═══════════════════════════════════════════════ */

// ── VERITAS — Hallucination Detection ──
const VERITAS: STierEntry[] = [
  cj(4001, 'A-VER01', 'Citation Verification Pipeline', 91, 'VERITAS', 'Validates every cited source by checking URL existence, content match, and publication date accuracy with automated crawling.', 'lm-vr01'),
  cj(4002, 'A-VER02', 'Numerical Claim Auditor', 90, 'VERITAS', 'Cross-validates numerical claims (statistics, dates, quantities) against authoritative databases with tolerance-aware matching.', 'lm-vr02'),
  cj(4003, 'A-VER03', 'Self-Consistency Checker', 89, 'VERITAS', 'Detects internal contradictions within generated outputs by decomposing claims and checking logical consistency.', 'lm-vr03'),
  cj(4004, 'A-VER04', 'Knowledge Boundary Detector', 88, 'VERITAS', 'Identifies when model responses extend beyond training data boundaries to flag speculative content.', 'lm-vr04'),
  cj(4005, 'A-VER05', 'Multi-Lingual Fact Alignment', 86, 'VERITAS', 'Verifies factual consistency of claims across multiple languages to detect translation-induced hallucinations.', 'lm-vr05'),
];

// ── RAMPART — Prompt Injection Defense ──
const RAMPART: STierEntry[] = [
  cj(4006, 'A-RAM01', 'Payload Deobfuscation Engine', 91, 'RAMPART', 'Normalizes obfuscated injection payloads including Base64 encoding, Unicode substitution, and homoglyph attacks.', 'lm-rm01'),
  cj(4007, 'A-RAM02', 'Context Window Poisoning Detector', 90, 'RAMPART', 'Detects attempts to poison the context window through gradual instruction drift across multi-turn conversations.', 'lm-rm02'),
  cj(4008, 'A-RAM03', 'Tool-Use Injection Guard', 89, 'RAMPART', 'Prevents injection attacks that exploit function calling and tool-use interfaces to execute unintended operations.', 'lm-rm03'),
  cj(4009, 'A-RAM04', 'Retrieval Augmented Injection Filter', 88, 'RAMPART', 'Scans retrieved documents for embedded injection payloads before inclusion in the model context.', 'lm-rm04'),
  cj(4010, 'A-RAM05', 'Multi-Modal Injection Scanner', 86, 'RAMPART', 'Detects injection attempts embedded in images, audio, and document uploads using cross-modal analysis.', 'lm-rm05'),
];

// ── SYLLOGISM — Reasoning Validation ──
const SYLLOGISM: STierEntry[] = [
  cj(4011, 'A-SYL01', 'Logical Fallacy Detector', 91, 'SYLLOGISM', 'Identifies common logical fallacies in model reasoning chains including circular reasoning and false dichotomies.', 'lm-sy01'),
  cj(4012, 'A-SYL02', 'Causal Reasoning Validator', 90, 'SYLLOGISM', 'Validates causal claims by checking for confounding variables, reverse causation, and spurious correlation.', 'lm-sy02'),
  cj(4013, 'A-SYL03', 'Mathematical Proof Verifier', 89, 'SYLLOGISM', 'Verifies step-by-step mathematical proofs for logical validity and identifies gaps in reasoning.', 'lm-sy03'),
  cj(4014, 'A-SYL04', 'Analogical Reasoning Assessor', 88, 'SYLLOGISM', 'Evaluates the strength of analogies used in model reasoning by scoring structural and relational similarity.', 'lm-sy04'),
  cj(4015, 'A-SYL05', 'Counterfactual Consistency Checker', 86, 'SYLLOGISM', 'Tests counterfactual reasoning consistency by varying premises and checking response coherence.', 'lm-sy05'),
];

// ── LEXICON — Vocabulary & Tokenization ──
const LEXICON: STierEntry[] = [
  cj(4016, 'A-LEX01', 'Domain Vocabulary Injector', 91, 'LEXICON', 'Injects domain-specific terminology into model context with definitions and usage examples for specialized tasks.', 'lm-lx01'),
  cj(4017, 'A-LEX02', 'Token Efficiency Analyzer', 90, 'LEXICON', 'Analyzes tokenization efficiency across languages and domains to optimize prompt compression strategies.', 'lm-lx02'),
  cj(4018, 'A-LEX03', 'Terminology Consistency Enforcer', 89, 'LEXICON', 'Ensures consistent terminology usage throughout long-form outputs by maintaining a session-level glossary.', 'lm-lx03'),
  cj(4019, 'A-LEX04', 'Neologism Detection Engine', 88, 'LEXICON', 'Detects fabricated terminology and non-standard word usage that may indicate model confusion or hallucination.', 'lm-lx04'),
  cj(4020, 'A-LEX05', 'Cross-Domain Disambiguation Engine', 86, 'LEXICON', 'Resolves ambiguous terms that have different meanings across domains using contextual cue analysis.', 'lm-lx05'),
];

// ── CLARITY — Output Quality ──
const CLARITY: STierEntry[] = [
  cj(4021, 'A-CLR01', 'Readability Score Optimizer', 91, 'CLARITY', 'Adjusts output complexity to target audience reading levels using Flesch-Kincaid and domain-specific metrics.', 'lm-cl01'),
  cj(4022, 'A-CLR02', 'Ambiguity Resolution Engine', 90, 'CLARITY', 'Identifies ambiguous statements in model outputs and generates clarifying alternatives with confidence scoring.', 'lm-cl02'),
  cj(4023, 'A-CLR03', 'Structural Coherence Analyzer', 89, 'CLARITY', 'Evaluates discourse structure coherence using rhetorical structure theory and topic flow analysis.', 'lm-cl03'),
  cj(4024, 'A-CLR04', 'Redundancy Elimination Engine', 88, 'CLARITY', 'Detects and removes redundant content in long outputs while preserving essential information density.', 'lm-cl04'),
  cj(4025, 'A-CLR05', 'Tone Consistency Regulator', 86, 'CLARITY', 'Monitors and enforces consistent tone throughout multi-section outputs to prevent register shifts.', 'lm-cl05'),
];

// ── FULCRUM — Bias Detection ──
const FULCRUM: STierEntry[] = [
  cj(4026, 'A-FUL01', 'Demographic Parity Evaluator', 91, 'FULCRUM', 'Tests model outputs for demographic parity across protected attributes using counterfactual input analysis.', 'lm-fl01'),
  cj(4027, 'A-FUL02', 'Stereotypical Association Detector', 90, 'FULCRUM', 'Identifies stereotypical associations in embeddings and outputs using WEAT-based and log-probability bias metrics.', 'lm-fl02'),
  cj(4028, 'A-FUL03', 'Political Neutrality Scorer', 89, 'FULCRUM', 'Scores outputs for political bias using multi-axis ideological classification and sentiment asymmetry detection.', 'lm-fl03'),
  cj(4029, 'A-FUL04', 'Cultural Sensitivity Analyzer', 88, 'FULCRUM', 'Evaluates outputs for cultural sensitivity across regions and customs using culturally-aware NLU.', 'lm-fl04'),
  cj(4030, 'A-FUL05', 'Representation Audit Engine', 86, 'FULCRUM', 'Audits generated content for representation balance across gender, ethnicity, and ability dimensions.', 'lm-fl05'),
];

// ── TETHER — Grounding & Context ──
const TETHER: STierEntry[] = [
  cj(4031, 'A-TET01', 'Context Window Utilization Optimizer', 91, 'TETHER', 'Maximizes relevant information density within context windows using importance-weighted content selection.', 'lm-tt01'),
  cj(4032, 'A-TET02', 'Multi-Document Grounding Fuser', 90, 'TETHER', 'Fuses information from multiple retrieved documents with conflict resolution and source credibility weighting.', 'lm-tt02'),
  cj(4033, 'A-TET03', 'Conversation History Compressor', 89, 'TETHER', 'Compresses long conversation histories into dense summaries while preserving decision points and key facts.', 'lm-tt03'),
  cj(4034, 'A-TET04', 'Dynamic Context Refresh Engine', 88, 'TETHER', 'Detects context staleness and triggers selective re-retrieval of outdated information during long sessions.', 'lm-tt04'),
  cj(4035, 'A-TET05', 'Instruction-Following Drift Monitor', 86, 'TETHER', 'Monitors adherence to system instructions over extended conversations and flags instruction drift events.', 'lm-tt05'),
];

// ── SIEVE — Content Filtering ──
const SIEVE: STierEntry[] = [
  cj(4036, 'A-SIV01', 'Toxicity Gradient Scorer', 91, 'SIEVE', 'Scores content toxicity on a continuous gradient rather than binary classification for nuanced moderation.', 'lm-sv01'),
  cj(4037, 'A-SIV02', 'PII Redaction Engine', 90, 'SIEVE', 'Identifies and redacts personally identifiable information from model outputs with configurable sensitivity levels.', 'lm-sv02'),
  cj(4038, 'A-SIV03', 'Copyright Infringement Detector', 89, 'SIEVE', 'Detects potential verbatim reproduction of copyrighted text using n-gram fingerprinting and fuzzy matching.', 'lm-sv03'),
  cj(4039, 'A-SIV04', 'Harmful Instruction Filter', 88, 'SIEVE', 'Identifies outputs containing actionable harmful instructions using intent classification and consequence analysis.', 'lm-sv04'),
  cj(4040, 'A-SIV05', 'Age-Appropriate Content Gate', 86, 'SIEVE', 'Filters content based on age-appropriateness ratings with configurable maturity thresholds.', 'lm-sv05'),
];

/* ═══════════════════════════════════════════════
   AGENTS (8 × 5 = 40 A-Tier Crown Jewels)
   ═══════════════════════════════════════════════ */

// ── SKEPTIC — Critical Analysis ──
const SKEPTIC: STierEntry[] = [
  cj(4041, 'A-SKP01', 'Source Credibility Evaluator', 91, 'SKEPTIC', 'Evaluates source credibility using domain authority, publication history, and citation network analysis.', 'lm-sk01'),
  cj(4042, 'A-SKP02', 'Confirmation Bias Detector', 90, 'SKEPTIC', 'Identifies when model reasoning exhibits confirmation bias by preferentially selecting supporting evidence.', 'lm-sk02'),
  cj(4043, 'A-SKP03', 'Evidence Strength Classifier', 89, 'SKEPTIC', 'Classifies evidence quality (anecdotal, observational, experimental, meta-analysis) used in model reasoning.', 'lm-sk03'),
  cj(4044, 'A-SKP04', 'Uncertainty Quantification Engine', 88, 'SKEPTIC', 'Provides calibrated uncertainty estimates for factual claims using ensemble-based confidence scoring.', 'lm-sk04'),
  cj(4045, 'A-SKP05', 'Epistemic Humility Enforcer', 86, 'SKEPTIC', 'Ensures model responses appropriately express uncertainty and limitations of knowledge.', 'lm-sk05'),
];

// ── TRIBUNAL — Adversarial Testing ──
const TRIBUNAL: STierEntry[] = [
  cj(4046, 'A-TRB01', 'Red Team Prompt Generator', 91, 'TRIBUNAL', 'Generates adversarial prompts targeting specific model vulnerabilities using evolutionary optimization.', 'lm-tb01'),
  cj(4047, 'A-TRB02', 'Safety Boundary Mapper', 90, 'TRIBUNAL', 'Maps the precise boundaries of model safety behaviors using binary search over prompt variations.', 'lm-tb02'),
  cj(4048, 'A-TRB03', 'Jailbreak Pattern Classifier', 89, 'TRIBUNAL', 'Classifies jailbreak attempts by technique (role-play, encoding, hypothetical framing) for targeted defense.', 'lm-tb03'),
  cj(4049, 'A-TRB04', 'Regression Test Generator', 88, 'TRIBUNAL', 'Automatically generates safety regression tests from discovered vulnerabilities for continuous validation.', 'lm-tb04'),
  cj(4050, 'A-TRB05', 'Adversarial Robustness Scorer', 86, 'TRIBUNAL', 'Quantifies model robustness to adversarial inputs using perturbation-based testing across multiple dimensions.', 'lm-tb05'),
];

// ── HERALD — Transparency ──
const HERALD: STierEntry[] = [
  cj(4051, 'A-HRL01', 'Decision Explanation Generator', 91, 'HERALD', 'Generates human-readable explanations for model decisions using attention attribution and counterfactual analysis.', 'lm-hl01'),
  cj(4052, 'A-HRL02', 'Model Card Generator', 90, 'HERALD', 'Automatically generates model cards documenting capabilities, limitations, and intended use cases.', 'lm-hl02'),
  cj(4053, 'A-HRL03', 'Confidence Calibration Reporter', 89, 'HERALD', 'Reports calibration quality of model confidence scores with reliability diagrams and ECE metrics.', 'lm-hl03'),
  cj(4054, 'A-HRL04', 'Data Provenance Tracer', 88, 'HERALD', 'Traces generated content back to likely training data sources using membership inference techniques.', 'lm-hl04'),
  cj(4055, 'A-HRL05', 'Limitation Disclosure Engine', 86, 'HERALD', 'Automatically discloses relevant model limitations based on task type and domain context.', 'lm-hl05'),
];

// ── MIMIC — Behavioral Analysis ──
const MIMIC: STierEntry[] = [
  cj(4056, 'A-MIM01', 'Persona Consistency Evaluator', 91, 'MIMIC', 'Evaluates whether model maintains consistent persona attributes across extended conversation sessions.', 'lm-mm01'),
  cj(4057, 'A-MIM02', 'Sycophancy Detection Engine', 90, 'MIMIC', 'Detects sycophantic behavior where models agree with users despite having contradicting evidence.', 'lm-mm02'),
  cj(4058, 'A-MIM03', 'Behavioral Fingerprint Analyzer', 89, 'MIMIC', 'Creates behavioral fingerprints of model versions to detect unexpected behavioral changes across updates.', 'lm-mm03'),
  cj(4059, 'A-MIM04', 'Role Boundary Enforcer', 88, 'MIMIC', 'Ensures models maintain appropriate role boundaries and do not claim capabilities beyond their scope.', 'lm-mm04'),
  cj(4060, 'A-MIM05', 'Emotional Manipulation Detector', 86, 'MIMIC', 'Identifies outputs that use emotional manipulation tactics to influence user decisions or behavior.', 'lm-mm05'),
];

// ── LINEAGE — Data Provenance ──
const LINEAGE: STierEntry[] = [
  cj(4061, 'A-LIN01', 'Training Data Attribution Engine', 91, 'LINEAGE', 'Attributes model outputs to likely training data influences using influence functions and gradient analysis.', 'lm-ln01'),
  cj(4062, 'A-LIN02', 'Data Contamination Detector', 90, 'LINEAGE', 'Detects benchmark contamination in training data using canary-based and statistical overlap methods.', 'lm-ln02'),
  cj(4063, 'A-LIN03', 'Synthetic Data Classifier', 89, 'LINEAGE', 'Distinguishes model-generated synthetic data from human-authored content using statistical watermark detection.', 'lm-ln03'),
  cj(4064, 'A-LIN04', 'License Compliance Tracker', 88, 'LINEAGE', 'Tracks data license compliance across training pipelines to prevent license violation in commercial models.', 'lm-ln04'),
  cj(4065, 'A-LIN05', 'Dataset Diversity Auditor', 86, 'LINEAGE', 'Audits training dataset diversity across languages, topics, and demographics using sampling analysis.', 'lm-ln05'),
];

// ── EMBARGO — Access Control ──
const EMBARGO: STierEntry[] = [
  cj(4066, 'A-EMB01', 'Knowledge Cutoff Enforcer', 91, 'EMBARGO', 'Enforces knowledge cutoff dates by detecting and suppressing responses about events beyond training data.', 'lm-em01'),
  cj(4067, 'A-EMB02', 'Topic Restriction Engine', 90, 'EMBARGO', 'Enforces configurable topic restrictions with graceful refusal messages and alternative suggestion generation.', 'lm-em02'),
  cj(4068, 'A-EMB03', 'Output Length Governor', 89, 'EMBARGO', 'Controls output length with intelligent truncation that preserves semantic completeness at cut points.', 'lm-em03'),
  cj(4069, 'A-EMB04', 'Rate-Aware Quality Adjuster', 88, 'EMBARGO', 'Adjusts output quality parameters based on remaining rate limit budget to prevent mid-task exhaustion.', 'lm-em04'),
  cj(4070, 'A-EMB05', 'Capability Scope Limiter', 86, 'EMBARGO', 'Restricts model capabilities to explicitly authorized scope preventing unauthorized tool use or data access.', 'lm-em05'),
];

// ── GAUNTLET — Stress Testing ──
const GAUNTLET: STierEntry[] = [
  cj(4071, 'A-GAU01', 'Edge Case Generator', 91, 'GAUNTLET', 'Generates edge case inputs systematically targeting boundary conditions in model behavior specifications.', 'lm-ga01'),
  cj(4072, 'A-GAU02', 'Consistency Stress Tester', 90, 'GAUNTLET', 'Tests output consistency under semantic-preserving input perturbations to measure model stability.', 'lm-ga02'),
  cj(4073, 'A-GAU03', 'Long Context Degradation Profiler', 89, 'GAUNTLET', 'Profiles performance degradation as context length increases to identify attention pattern failures.', 'lm-ga03'),
  cj(4074, 'A-GAU04', 'Multi-Language Parity Tester', 88, 'GAUNTLET', 'Tests quality parity across languages by comparing outputs for semantically equivalent multilingual prompts.', 'lm-ga04'),
  cj(4075, 'A-GAU05', 'Instruction Complexity Escalator', 86, 'GAUNTLET', 'Progressively escalates instruction complexity to map model capability boundaries across task dimensions.', 'lm-ga05'),
];

// ── CUSTODIAN — Governance & Compliance ──
const CUSTODIAN: STierEntry[] = [
  cj(4076, 'A-CUS01', 'EU AI Act Compliance Checker', 91, 'CUSTODIAN', 'Evaluates LLM deployments against EU AI Act requirements including risk classification and transparency obligations.', 'lm-cu01'),
  cj(4077, 'A-CUS02', 'Model Governance Audit Trail', 90, 'CUSTODIAN', 'Maintains immutable audit trails of model deployment decisions, version changes, and evaluation results.', 'lm-cu02'),
  cj(4078, 'A-CUS03', 'Responsible Disclosure Coordinator', 89, 'CUSTODIAN', 'Manages responsible disclosure workflows for discovered model vulnerabilities with stakeholder notification.', 'lm-cu03'),
  cj(4079, 'A-CUS04', 'Deployment Risk Assessor', 88, 'CUSTODIAN', 'Assesses deployment risk by evaluating model performance against use-case-specific safety thresholds.', 'lm-cu04'),
  cj(4080, 'A-CUS05', 'Incident Response Playbook Engine', 86, 'CUSTODIAN', 'Generates and executes incident response playbooks for model safety failures and adversarial events.', 'lm-cu05'),
];

export const LLM_ATIER_JEWELS: STierEntry[] = [
  ...VERITAS, ...RAMPART, ...SYLLOGISM, ...LEXICON,
  ...CLARITY, ...FULCRUM, ...TETHER, ...SIEVE,
  ...SKEPTIC, ...TRIBUNAL, ...HERALD, ...MIMIC,
  ...LINEAGE, ...EMBARGO, ...GAUNTLET, ...CUSTODIAN,
];
