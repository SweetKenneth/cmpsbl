/**
 * CMPSBL® LLM Vertical Substrate
 * 
 * Subdomain: llm.cmpsbl.com
 * 
 * The LLM Vertical targets every structural flaw in modern Large Language Models.
 * Primitives map 1:1 to the OWASP Top 10 for LLMs (2025), Microsoft's alignment
 * research, and Nature-published ethical vulnerability studies.
 * 
 * Hot-swapped Engines (8):
 *   VERITAS  — Hallucination detection & factual grounding
 *   RAMPART  — Prompt injection defense & input sanitization
 *   SYLLOGISM — Reasoning chain validation & logic integrity
 *   LEXICON  — Tokenizer security & data poisoning detection
 *   CLARITY  — Explainability, attribution & transparency
 *   FULCRUM  — Bias detection & fairness calibration
 *   TETHER   — Context coherence & memory boundary management
 *   SIEVE    — Output sanitization & safety filtering
 * 
 * Hot-swapped Agents (8):
 *   SKEPTIC  — Adversarial red-team fact checker
 *   TRIBUNAL — Output consistency & cross-model arbitration
 *   HERALD   — Alignment drift monitoring
 *   MIMIC    — Sycophancy detection & authenticity enforcement
 *   LINEAGE  — Data provenance & training data audit
 *   EMBARGO  — Information leakage prevention
 *   GAUNTLET — Adversarial stress testing & jailbreak detection
 *   CUSTODIAN — Model supply chain security & dependency audit
 * 
 * © CMPSBL® — All rights reserved.
 */

import type { VerticalPrimitive, VerticalSubstrateConfig } from '../vertical-substrate';
import { getSpinePrimitives, assembleVerticalPrimitives } from '../vertical-substrate';
import { LLM_CROWN_JEWELS, getLLMJewelsByPrimitive, getLLMJewelSummary } from '@/crownjewels/llm-vertical-registry';
import type { STierEntry } from '@/crownjewels/types';

/* ─── LLM Engines ─── */

const LLM_ENGINES: VerticalPrimitive[] = [
  {
    id: 'VERITAS',
    name: 'VERITAS',
    role: 'engine',
    description: 'Hallucination detection and factual grounding engine. Cross-references claims against verified knowledge sources, applies multi-source consistency checks, and computes grounding scores to flag confabulated outputs before they reach users.',
    inherited: false,
    replaces: 'CORTEX',
    capabilities: [
      'hallucination_detection',
      'factual_grounding',
      'multi_source_verification',
      'claim_extraction',
      'confidence_calibration',
      'grounding_score_computation',
      'citation_verification',
    ],
    weight: 0.040,
    classification: 'active',
  },
  {
    id: 'RAMPART',
    name: 'RAMPART',
    role: 'engine',
    description: 'Prompt injection defense engine. Multi-layer detection of direct injection, indirect injection, delimiter attacks, role-override attempts, and encoding evasion. Sanitizes inputs while preserving semantic intent.',
    inherited: false,
    replaces: 'ARCHITECT',
    capabilities: [
      'prompt_injection_detection',
      'indirect_injection_defense',
      'delimiter_attack_blocking',
      'role_override_prevention',
      'encoding_evasion_detection',
      'input_sanitization',
      'semantic_intent_preservation',
    ],
    weight: 0.040,
    classification: 'active',
  },
  {
    id: 'SYLLOGISM',
    name: 'SYLLOGISM',
    role: 'engine',
    description: 'Reasoning chain validation engine. Verifies logical consistency across multi-step inference, detects reasoning shortcuts, circular logic, and unfounded conclusions. Enforces chain-of-thought integrity.',
    inherited: false,
    capabilities: [
      'chain_of_thought_validation',
      'logical_consistency_check',
      'circular_reasoning_detection',
      'inference_step_verification',
      'conclusion_grounding',
      'reasoning_shortcut_detection',
    ],
    weight: 0.030,
    classification: 'active',
  },
  {
    id: 'LEXICON',
    name: 'LEXICON',
    role: 'engine',
    description: 'Tokenizer security and data poisoning detection engine. Analyzes training data integrity, detects adversarial token sequences, identifies poisoned embeddings, and validates tokenization fidelity across multilingual inputs.',
    inherited: false,
    capabilities: [
      'data_poisoning_detection',
      'adversarial_token_analysis',
      'embedding_integrity_check',
      'tokenization_fidelity',
      'multilingual_token_security',
      'training_data_provenance',
    ],
    weight: 0.025,
    classification: 'passive',
  },
  {
    id: 'CLARITY',
    name: 'CLARITY',
    role: 'engine',
    description: 'Explainability and attribution engine. Generates human-readable explanations for model decisions, traces output provenance to training signals, and surfaces attention patterns that drove generation.',
    inherited: false,
    capabilities: [
      'decision_explainability',
      'output_attribution',
      'attention_pattern_analysis',
      'provenance_tracing',
      'confidence_decomposition',
      'interpretability_scoring',
    ],
    weight: 0.025,
    classification: 'passive',
  },
  {
    id: 'FULCRUM',
    name: 'FULCRUM',
    role: 'engine',
    description: 'Bias detection and fairness calibration engine. Identifies demographic, cultural, and ideological biases in model outputs. Applies fairness constraints and measures distributional parity across protected categories.',
    inherited: false,
    capabilities: [
      'bias_detection',
      'fairness_calibration',
      'demographic_parity_check',
      'cultural_bias_analysis',
      'ideological_neutrality',
      'equalized_odds_enforcement',
    ],
    weight: 0.025,
    classification: 'hybrid',
  },
  {
    id: 'TETHER',
    name: 'TETHER',
    role: 'engine',
    description: 'Context coherence and memory boundary engine. Manages context window utilization, detects lost-in-the-middle degradation, enforces memory boundaries, and prevents cross-session context leakage.',
    inherited: false,
    capabilities: [
      'context_window_optimization',
      'lost_in_middle_detection',
      'memory_boundary_enforcement',
      'cross_session_isolation',
      'context_compression',
      'retrieval_augmentation',
    ],
    weight: 0.025,
    classification: 'active',
  },
  {
    id: 'SIEVE',
    name: 'SIEVE',
    role: 'engine',
    description: 'Output sanitization and safety filtering engine. Scans generated outputs for harmful content, PII leakage, code injection payloads, and policy violations. Applies content classification and redaction before delivery.',
    inherited: false,
    capabilities: [
      'output_sanitization',
      'pii_detection',
      'harmful_content_filtering',
      'code_injection_scanning',
      'policy_violation_detection',
      'content_classification',
      'redaction_enforcement',
    ],
    weight: 0.030,
    classification: 'active',
  },
];

/* ─── LLM Agents ─── */

const LLM_AGENTS: VerticalPrimitive[] = [
  {
    id: 'SKEPTIC',
    name: 'SKEPTIC',
    role: 'agent',
    description: 'Adversarial red-team fact checker. Autonomously challenges model outputs with adversarial counter-prompts, validates factual claims against ground truth, and generates confidence-weighted verification reports.',
    inherited: false,
    capabilities: [
      'adversarial_fact_checking',
      'counter_prompt_generation',
      'ground_truth_validation',
      'verification_reporting',
      'claim_decomposition',
      'source_credibility_scoring',
      'multi_hop_reasoning_audit',
      'temporal_fact_verification',
    ],
    weight: 0.025,
    classification: 'active',
  },
  {
    id: 'TRIBUNAL',
    name: 'TRIBUNAL',
    role: 'agent',
    description: 'Output consistency and cross-model arbitration agent. Compares responses across multiple model instances, detects contradictions, and enforces semantic consistency across sessions and contexts.',
    inherited: false,
    capabilities: [
      'cross_model_comparison',
      'contradiction_detection',
      'semantic_consistency_enforcement',
      'session_continuity_validation',
      'response_deduplication',
      'ensemble_arbitration',
      'confidence_weighted_voting',
      'output_reconciliation',
    ],
    weight: 0.020,
    classification: 'passive',
  },
  {
    id: 'HERALD',
    name: 'HERALD',
    role: 'agent',
    description: 'Alignment drift monitoring agent. Tracks model behavior over time to detect gradual deviations from intended alignment. Measures value drift, policy adherence decay, and behavioral regression.',
    inherited: false,
    capabilities: [
      'alignment_drift_detection',
      'value_drift_tracking',
      'policy_adherence_monitoring',
      'behavioral_regression_analysis',
      'safety_boundary_erosion_alert',
    ],
    weight: 0.020,
    classification: 'passive',
  },
  {
    id: 'MIMIC',
    name: 'MIMIC',
    role: 'agent',
    description: 'Sycophancy detection and authenticity enforcement agent. Identifies when models agree with users against evidence, suppress disagreement, or tailor responses to perceived user preferences at the expense of accuracy.',
    inherited: false,
    capabilities: [
      'sycophancy_detection',
      'agreement_bias_analysis',
      'authenticity_enforcement',
      'preference_pandering_detection',
      'intellectual_honesty_scoring',
    ],
    weight: 0.020,
    classification: 'active',
  },
  {
    id: 'LINEAGE',
    name: 'LINEAGE',
    role: 'agent',
    description: 'Data provenance and training data audit agent. Traces model knowledge to training sources, detects memorized content, and verifies licensing compliance of regurgitated material.',
    inherited: false,
    capabilities: [
      'training_data_tracing',
      'memorization_detection',
      'license_compliance_audit',
      'data_provenance_verification',
      'copyright_infringement_detection',
    ],
    weight: 0.015,
    classification: 'passive',
  },
  {
    id: 'EMBARGO',
    name: 'EMBARGO',
    role: 'agent',
    description: 'Information leakage prevention agent. Detects and blocks system prompt extraction, training data regurgitation, PII exposure, and confidential information disclosure through model outputs.',
    inherited: false,
    capabilities: [
      'system_prompt_protection',
      'training_data_leakage_prevention',
      'pii_exposure_blocking',
      'confidential_disclosure_detection',
      'membership_inference_defense',
    ],
    weight: 0.020,
    classification: 'active',
  },
  {
    id: 'GAUNTLET',
    name: 'GAUNTLET',
    role: 'agent',
    description: 'Adversarial stress testing and jailbreak detection agent. Continuously probes model boundaries with evolving attack patterns, detects novel jailbreak techniques, and hardens safety boundaries through red-team simulation.',
    inherited: false,
    capabilities: [
      'jailbreak_detection',
      'adversarial_stress_testing',
      'safety_boundary_probing',
      'attack_pattern_evolution',
      'red_team_simulation',
    ],
    weight: 0.020,
    classification: 'active',
  },
  {
    id: 'CUSTODIAN',
    name: 'CUSTODIAN',
    role: 'agent',
    description: 'Model supply chain security and dependency audit agent. Validates model provenance, audits fine-tuning pipelines, detects backdoored weights, and verifies model card compliance.',
    inherited: false,
    capabilities: [
      'model_provenance_validation',
      'fine_tuning_pipeline_audit',
      'backdoor_weight_detection',
      'model_card_compliance',
      'dependency_chain_security',
      'weight_integrity_verification',
    ],
    weight: 0.015,
    classification: 'hybrid',
  },
];

/* ─── Assembled LLM Substrate ─── */

export function getLLMPrimitives(): VerticalPrimitive[] {
  return assembleVerticalPrimitives(LLM_ENGINES, LLM_AGENTS);
}

export function getLLMEngines(): VerticalPrimitive[] {
  return [...LLM_ENGINES];
}

export function getLLMAgents(): VerticalPrimitive[] {
  return [...LLM_AGENTS];
}

/**
 * Full LLM vertical substrate configuration
 */
export function getLLMSubstrate(): VerticalSubstrateConfig {
  return {
    verticalId: 'llm-v1',
    name: 'CMPSBL LLM™',
    tagline: 'Cognitive LLM Infrastructure — Models Break Here, Not in Production',
    domain: 'llm' as never, // Extended domain
    subdomain: 'llm',
    url: 'https://llm.cmpsbl.com',
    status: 'active',
    version: '1.0.0',
    primitives: getLLMPrimitives(),
    clmCurriculum: {
      cyclesPerDay: 3600,
      curriculum: [
        'hallucination_pattern_analysis',
        'prompt_injection_attack_vectors',
        'reasoning_chain_integrity',
        'tokenizer_adversarial_techniques',
        'bias_detection_methodologies',
        'context_window_optimization',
        'alignment_stability_monitoring',
        'jailbreak_evolution_tracking',
        'output_safety_classification',
        'model_supply_chain_threats',
        'sycophancy_detection_patterns',
        'data_provenance_verification',
      ],
      priorityPrimitives: ['VERITAS', 'RAMPART', 'SIEVE', 'GAUNTLET'],
      batchSize: 6,
    },
    memoryStreamConfig: {
      cycleIntervalHours: 2,
      scannerFocus: [
        'OWASP_LLM_top_10_updates',
        'prompt_injection_technique_evolution',
        'hallucination_benchmark_results',
        'alignment_research_papers',
        'jailbreak_disclosure_tracking',
        'model_vulnerability_CVEs',
        'bias_audit_methodology_advances',
        'safety_evaluation_framework_updates',
      ],
      contributesToGlobal: true,
      retentionDays: 365,
    },
    ascensionConfig: {
      maxCapabilities: 20,
      enhancementArchetypes: [
        'Hallucination Grounding Layer',
        'Prompt Injection Firewall',
        'Reasoning Chain Validator',
        'Bias-Aware Output Calibrator',
        'Context Boundary Enforcer',
        'Output Safety Classifier',
        'Alignment Drift Monitor',
        'Sycophancy Circuit Breaker',
        'Training Data Provenance Tracker',
        'Model Supply Chain Verifier',
      ],
      cjpiWeights: {
        security: 0.35,
        performance: 0.15,
        reliability: 0.35,
        maintainability: 0.15,
      },
      collisionPriority: ['VERITAS', 'RAMPART', 'SIEVE', 'SYLLOGISM', 'GAUNTLET'],
    },
    theme: {
      primaryHue: 160,
      icon: 'Brain',
      gradientAngle: 135,
      darkAccent: '160 90% 45%',
      lightAccent: '160 80% 35%',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Get all capabilities across the LLM vertical
 */
export function getAllLLMCapabilities(): string[] {
  const primitives = getLLMPrimitives();
  const capabilities = new Set<string>();
  for (const p of primitives) {
    for (const cap of p.capabilities) {
      capabilities.add(cap);
    }
  }
  return Array.from(capabilities).sort();
}

/* ═══════════════════════════════════════════════
   Crown Jewel Integration — S-Tier Registry Surface
   ═══════════════════════════════════════════════ */

/** All 80 architectural Crown Jewels for the LLM™ vertical */
export function getLLMCrownJewels(): STierEntry[] {
  return [...LLM_CROWN_JEWELS];
}

/** Crown Jewels for a specific LLM primitive */
export function getLLMPrimitiveCrownJewels(primitiveId: string): STierEntry[] {
  return getLLMJewelsByPrimitive(primitiveId);
}

/** Crown Jewel summary per primitive (for dashboard) */
export function getLLMCrownJewelSummary() {
  return getLLMJewelSummary();
}

/** Total Crown Jewel count for the vertical */
export function getLLMCrownJewelCount(): number {
  return LLM_CROWN_JEWELS.length;
}

/** All Crown Jewel capability IDs as active capabilities */
export function getLLMCrownJewelCapabilities(): string[] {
  return LLM_CROWN_JEWELS.map(j =>
    j.id.toLowerCase().replace(/^s-/, 'cj_')
  );
}
