/**
 * Capability Synthesis Reactor
 * One-click auto-discovery engine for Crown Jewel pipelines.
 * Generates, scores, tiers, ranks, deduplicates, and persists discoveries.
 */

import { supabase } from '@/integrations/supabase/client';
import {
  computeCJPI,
  autoAssignTier,
  type CJPIScoreBreakdown,
  type DiscoveryCategory,
  type CrystallizedTier,
} from '@/lib/capabilities/synergies/discovery-epoch';

import { sha256, canonicalizeJson } from '@/lib/control-plane/hash';

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export interface ReactorConfig {
  dryRun: boolean;
  exploratoryMode: boolean;
  topN?: number;
  scoringVersion?: string;
  /** Injected templates from the auto-generator (used alongside hardcoded ones) */
  injectedTemplates?: SynthesisTemplate[];
}

export interface ReactorCandidate {
  id: string; // stable hash
  name: string;
  description: string;
  category: DiscoveryCategory;
  moduleChain: string[];
  entryCapability: string;
  exitCapability: string;
  errorStrategy: string;
  maxExecutionMs: number;
  cjpiBreakdown: CJPIScoreBreakdown;
  cjpi: number;
  tier: CrystallizedTier | null;
  synergyMultiplier: number;
  discoveredBy: string;
  rationale: string;
}

export interface ReactorRunResult {
  runId: string;
  status: 'completed' | 'failed';
  totalCandidates: number;
  acceptedCount: number;
  topFind: { name: string; cjpi: number } | null;
  discoveries: ReactorCandidate[];
  byCategory: Record<string, number>;
  byTier: Record<string, number>;
  dryRun: boolean;
  durationMs: number;
  error?: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// CANONICAL MODULES — used for combinatorial synthesis
// ═══════════════════════════════════════════════════════════════════════════════

const CANONICAL_MODULES = [
  // 40-node architecture (CORE, SYSTEM, CCR, OCG, Execution, ESZ, EPZ, EMZ, CSZ, Fields, Plane, Shell)
  'BRAIN', 'MEMORY', 'CORTEX', 'DREAM', 'NEXUS', 'DECODE',
  'DEFENSE', 'ACCESS', 'VISION', 'ANALYTICS', 'GOVERNANCE',
  'SYSTEM', 'EVOLUTION', 'INTEGRATION', 'NERVE', 'INCLUSIVE',
  'MODERNIZER', 'MEDIC', 'RIPPLE', 'AUDIT', 'IDENTITY',
  // Expansion zones: ESZ, EPZ, EMZ
  'SOVEREIGN', 'ORACLE', 'CONSCIENCE', 'PHANTOM', 'FORGE',
  'LINGUA', 'COMPASS', 'ECHO', 'TREATY', 'HARVEST', 'REFLEX',
];

const CATEGORIES: DiscoveryCategory[] = [
  'cognitive', 'evolution', 'security', 'routing', 'learning',
  'orchestration', 'integration', 'observability', 'governance',
  'compliance', 'prediction', 'ethics', 'privacy', 'synthesis',
  'localization', 'geospatial', 'simulation', 'contracts', 'acquisition', 'edge',
];

const ERROR_STRATEGIES = ['retry', 'skip', 'abort', 'rollback', 'fallback'] as const;

// ═══════════════════════════════════════════════════════════════════════════════
// SYNTHESIS TEMPLATES — high-value pipeline patterns
// ═══════════════════════════════════════════════════════════════════════════════

export interface SynthesisTemplate {
  namePattern: string;
  descriptionPattern: string;
  category: DiscoveryCategory;
  modulePattern: string[]; // module slots
  entryPattern: string;
  exitPattern: string;
  errorStrategy: typeof ERROR_STRATEGIES[number];
  maxExecutionMs: number;
  baseBreakdown: CJPIScoreBreakdown;
  discoveredBy: string;
  rationale: string;
}

const SYNTHESIS_TEMPLATES: SynthesisTemplate[] = [
  // === COGNITIVE ===
  { namePattern: 'Adaptive Working Memory Controller', descriptionPattern: 'Dynamic working memory allocation based on task complexity and cognitive load estimation', category: 'cognitive', modulePattern: ['BRAIN', 'CORTEX', 'MEMORY'], entryPattern: 'working-memory-allocator', exitPattern: 'memory-controlled', errorStrategy: 'fallback', maxExecutionMs: 2000, baseBreakdown: { strategicLeverage: 90, recursionPotential: 88, crossNodeImpact: 85, composability: 88, governanceInfluence: 62, moatSensitivity: 90 }, discoveredBy: 'reactor', rationale: 'Working memory is the bottleneck for complex reasoning — adaptive allocation directly improves output quality' },
  { namePattern: 'Concept Drift Corrector', descriptionPattern: 'Detects and corrects semantic concept drift in long-running cognitive sessions', category: 'cognitive', modulePattern: ['BRAIN', 'VISION', 'CORTEX'], entryPattern: 'drift-monitor', exitPattern: 'drift-corrected', errorStrategy: 'retry', maxExecutionMs: 3000, baseBreakdown: { strategicLeverage: 88, recursionPotential: 82, crossNodeImpact: 80, composability: 82, governanceInfluence: 65, moatSensitivity: 88 }, discoveredBy: 'reactor', rationale: 'Concept drift degrades output quality over time — early detection prevents compounding errors' },
  { namePattern: 'Causal Reasoning Engine', descriptionPattern: 'Structured causal inference from observational data with counterfactual generation', category: 'cognitive', modulePattern: ['CORTEX', 'BRAIN', 'DREAM', 'VISION'], entryPattern: 'causal-graph-builder', exitPattern: 'causal-inference-complete', errorStrategy: 'skip', maxExecutionMs: 15000, baseBreakdown: { strategicLeverage: 95, recursionPotential: 92, crossNodeImpact: 88, composability: 82, governanceInfluence: 72, moatSensitivity: 96 }, discoveredBy: 'reactor', rationale: 'Causal reasoning is the frontier of AI intelligence — moves beyond correlation to true understanding' },
  { namePattern: 'Epistemic State Tracker', descriptionPattern: 'Tracks what the system knows, believes, and is uncertain about across all modules', category: 'cognitive', modulePattern: ['BRAIN', 'CORTEX', 'GOVERNANCE'], entryPattern: 'epistemic-scanner', exitPattern: 'epistemic-map-updated', errorStrategy: 'skip', maxExecutionMs: 5000, baseBreakdown: { strategicLeverage: 92, recursionPotential: 90, crossNodeImpact: 85, composability: 80, governanceInfluence: 78, moatSensitivity: 92 }, discoveredBy: 'reactor', rationale: 'Self-aware knowledge tracking prevents hallucination and enables calibrated confidence' },
  { namePattern: 'Analogical Transfer Engine', descriptionPattern: 'Cross-domain analogy discovery and structural mapping for novel problem solving', category: 'cognitive', modulePattern: ['DREAM', 'BRAIN', 'CORTEX'], entryPattern: 'analogy-finder', exitPattern: 'analogy-applied', errorStrategy: 'skip', maxExecutionMs: 10000, baseBreakdown: { strategicLeverage: 90, recursionPotential: 95, crossNodeImpact: 82, composability: 85, governanceInfluence: 58, moatSensitivity: 92 }, discoveredBy: 'reactor', rationale: 'Analogical reasoning is uniquely powerful for creative problem-solving and knowledge transfer' },

  // === EVOLUTION ===
  { namePattern: 'Fitness Landscape Navigator', descriptionPattern: 'Maps and navigates the fitness landscape of system configurations for optimal evolution paths', category: 'evolution', modulePattern: ['EVOLUTION', 'VISION', 'BRAIN', 'CORTEX'], entryPattern: 'landscape-mapper', exitPattern: 'optimal-path-found', errorStrategy: 'rollback', maxExecutionMs: 20000, baseBreakdown: { strategicLeverage: 95, recursionPotential: 92, crossNodeImpact: 90, composability: 78, governanceInfluence: 80, moatSensitivity: 96 }, discoveredBy: 'reactor', rationale: 'Navigating fitness landscapes prevents local optima traps and accelerates system improvement' },
  { namePattern: 'Mutation Impact Simulator', descriptionPattern: 'Monte Carlo simulation of mutation outcomes across system state space', category: 'evolution', modulePattern: ['EVOLUTION', 'CORTEX', 'VISION'], entryPattern: 'mutation-simulator', exitPattern: 'impact-distribution', errorStrategy: 'skip', maxExecutionMs: 30000, baseBreakdown: { strategicLeverage: 92, recursionPotential: 85, crossNodeImpact: 90, composability: 75, governanceInfluence: 85, moatSensitivity: 92 }, discoveredBy: 'reactor', rationale: 'Simulation before execution dramatically reduces risk of harmful mutations' },
  { namePattern: 'Evolutionary Pressure Calibrator', descriptionPattern: 'Dynamically adjusts selection pressure based on population diversity and convergence rate', category: 'evolution', modulePattern: ['EVOLUTION', 'ANALYTICS', 'BRAIN'], entryPattern: 'pressure-analyzer', exitPattern: 'pressure-calibrated', errorStrategy: 'skip', maxExecutionMs: 5000, baseBreakdown: { strategicLeverage: 88, recursionPotential: 90, crossNodeImpact: 82, composability: 80, governanceInfluence: 72, moatSensitivity: 88 }, discoveredBy: 'reactor', rationale: 'Balancing exploration vs exploitation is critical for sustainable evolution' },
  { namePattern: 'Co-Evolutionary Synchronizer', descriptionPattern: 'Coordinates co-evolutionary dynamics between interdependent module populations', category: 'evolution', modulePattern: ['EVOLUTION', 'CORTEX', 'SYSTEM', 'GOVERNANCE'], entryPattern: 'co-evolution-tracker', exitPattern: 'co-evolution-synced', errorStrategy: 'rollback', maxExecutionMs: 15000, baseBreakdown: { strategicLeverage: 92, recursionPotential: 88, crossNodeImpact: 95, composability: 72, governanceInfluence: 85, moatSensitivity: 92 }, discoveredBy: 'reactor', rationale: 'Co-evolution between modules creates emergent capabilities impossible from isolated optimization' },
  { namePattern: 'Genetic Memory Archiver', descriptionPattern: 'Archives successful evolutionary strategies as reusable genetic templates for future mutations', category: 'evolution', modulePattern: ['EVOLUTION', 'BRAIN', 'DREAM'], entryPattern: 'strategy-extractor', exitPattern: 'genetic-template-stored', errorStrategy: 'retry', maxExecutionMs: 8000, baseBreakdown: { strategicLeverage: 88, recursionPotential: 92, crossNodeImpact: 80, composability: 85, governanceInfluence: 68, moatSensitivity: 90 }, discoveredBy: 'reactor', rationale: 'Preserving winning strategies prevents re-discovery costs and accelerates future evolution cycles' },

  // === SECURITY ===
  { namePattern: 'Cognitive Firewall', descriptionPattern: 'Deep inspection of cognitive operations for adversarial manipulation attempts', category: 'security', modulePattern: ['DEFENSE', 'BRAIN', 'CORTEX', 'GOVERNANCE'], entryPattern: 'cognitive-inspector', exitPattern: 'manipulation-blocked', errorStrategy: 'abort', maxExecutionMs: 1000, baseBreakdown: { strategicLeverage: 95, recursionPotential: 75, crossNodeImpact: 92, composability: 68, governanceInfluence: 95, moatSensitivity: 98 }, discoveredBy: 'reactor', rationale: 'Cognitive-layer attacks bypass traditional security — requires deep semantic inspection' },
  { namePattern: 'Supply Chain Integrity Verifier', descriptionPattern: 'Cryptographic verification of module provenance and dependency integrity', category: 'security', modulePattern: ['DEFENSE', 'SYSTEM', 'GOVERNANCE', 'AUDIT'], entryPattern: 'provenance-checker', exitPattern: 'integrity-verified', errorStrategy: 'abort', maxExecutionMs: 5000, baseBreakdown: { strategicLeverage: 90, recursionPotential: 62, crossNodeImpact: 90, composability: 68, governanceInfluence: 95, moatSensitivity: 92 }, discoveredBy: 'reactor', rationale: 'Software supply chain attacks are the fastest growing threat vector — proactive verification is essential' },
  { namePattern: 'Runtime Sandboxing Orchestrator', descriptionPattern: 'Dynamic sandboxing of untrusted operations with graduated privilege escalation', category: 'security', modulePattern: ['DEFENSE', 'SYSTEM', 'ACCESS'], entryPattern: 'sandbox-creator', exitPattern: 'sandboxed-execution-complete', errorStrategy: 'abort', maxExecutionMs: 3000, baseBreakdown: { strategicLeverage: 92, recursionPotential: 70, crossNodeImpact: 88, composability: 75, governanceInfluence: 90, moatSensitivity: 90 }, discoveredBy: 'reactor', rationale: 'Sandboxing prevents blast radius from untrusted code while maintaining system throughput' },
  { namePattern: 'Deception Detection Network', descriptionPattern: 'Multi-signal deception detection across input channels with confidence scoring', category: 'security', modulePattern: ['DEFENSE', 'BRAIN', 'VISION'], entryPattern: 'deception-analyzer', exitPattern: 'deception-classified', errorStrategy: 'abort', maxExecutionMs: 2000, baseBreakdown: { strategicLeverage: 90, recursionPotential: 78, crossNodeImpact: 85, composability: 72, governanceInfluence: 88, moatSensitivity: 92 }, discoveredBy: 'reactor', rationale: 'Adversarial inputs are increasingly sophisticated — multi-signal detection is required for robust defense' },

  // === ROUTING ===
  { namePattern: 'Capability-Aware Load Balancer', descriptionPattern: 'Routes requests based on provider capability profiles rather than simple load metrics', category: 'routing', modulePattern: ['NEXUS', 'BRAIN', 'VISION'], entryPattern: 'capability-matcher', exitPattern: 'capability-routed', errorStrategy: 'fallback', maxExecutionMs: 500, baseBreakdown: { strategicLeverage: 88, recursionPotential: 75, crossNodeImpact: 85, composability: 90, governanceInfluence: 62, moatSensitivity: 85 }, discoveredBy: 'reactor', rationale: 'Capability-aware routing outperforms round-robin by matching task requirements to provider strengths' },
  { namePattern: 'Speculative Execution Router', descriptionPattern: 'Pre-emptive request dispatch to multiple providers with first-response selection', category: 'routing', modulePattern: ['NEXUS', 'CORTEX', 'ANALYTICS'], entryPattern: 'speculative-dispatcher', exitPattern: 'fastest-selected', errorStrategy: 'fallback', maxExecutionMs: 100, baseBreakdown: { strategicLeverage: 85, recursionPotential: 72, crossNodeImpact: 82, composability: 85, governanceInfluence: 55, moatSensitivity: 82 }, discoveredBy: 'reactor', rationale: 'Speculative execution trades compute for latency — critical for real-time interactions' },
  { namePattern: 'Quality-of-Service Enforcer', descriptionPattern: 'Runtime QoS enforcement with priority queuing and resource reservation', category: 'routing', modulePattern: ['NEXUS', 'GOVERNANCE', 'SYSTEM'], entryPattern: 'qos-classifier', exitPattern: 'qos-enforced', errorStrategy: 'fallback', maxExecutionMs: 200, baseBreakdown: { strategicLeverage: 85, recursionPotential: 68, crossNodeImpact: 85, composability: 80, governanceInfluence: 82, moatSensitivity: 82 }, discoveredBy: 'reactor', rationale: 'QoS enforcement prevents priority inversion and ensures SLA compliance under load' },

  // === LEARNING ===
  { namePattern: 'Meta-Learning Optimizer', descriptionPattern: 'Learns optimal learning strategies from learning history — learning to learn faster', category: 'learning', modulePattern: ['BRAIN', 'DREAM', 'CORTEX', 'EVOLUTION'], entryPattern: 'meta-learner', exitPattern: 'learning-strategy-optimized', errorStrategy: 'skip', maxExecutionMs: 15000, baseBreakdown: { strategicLeverage: 95, recursionPotential: 98, crossNodeImpact: 85, composability: 82, governanceInfluence: 65, moatSensitivity: 96 }, discoveredBy: 'reactor', rationale: 'Meta-learning is the ultimate force multiplier — every improvement compounds across all future learning' },
  { namePattern: 'Knowledge Crystallization Engine', descriptionPattern: 'Converts fluid experiential knowledge into stable, reusable crystallized knowledge structures', category: 'learning', modulePattern: ['BRAIN', 'DREAM', 'MEMORY'], entryPattern: 'experience-distiller', exitPattern: 'knowledge-crystallized', errorStrategy: 'retry', maxExecutionMs: 10000, baseBreakdown: { strategicLeverage: 90, recursionPotential: 92, crossNodeImpact: 82, composability: 85, governanceInfluence: 62, moatSensitivity: 92 }, discoveredBy: 'reactor', rationale: 'Crystallized knowledge persists across sessions and is reusable across contexts — the foundation of institutional memory' },
  { namePattern: 'Skill Decomposition Analyzer', descriptionPattern: 'Breaks complex skills into learnable sub-skills with dependency ordering', category: 'learning', modulePattern: ['CORTEX', 'BRAIN', 'ANALYTICS'], entryPattern: 'skill-decomposer', exitPattern: 'skill-tree-generated', errorStrategy: 'skip', maxExecutionMs: 8000, baseBreakdown: { strategicLeverage: 85, recursionPotential: 88, crossNodeImpact: 80, composability: 85, governanceInfluence: 58, moatSensitivity: 85 }, discoveredBy: 'reactor', rationale: 'Decomposition enables targeted skill development and identifies bottleneck prerequisites' },

  // === ORCHESTRATION ===
  { namePattern: 'Elastic Pipeline Scaler', descriptionPattern: 'Auto-scales pipeline parallelism based on workload prediction and resource availability', category: 'orchestration', modulePattern: ['CORTEX', 'SYSTEM', 'ANALYTICS', 'NEXUS'], entryPattern: 'workload-predictor', exitPattern: 'pipeline-scaled', errorStrategy: 'fallback', maxExecutionMs: 2000, baseBreakdown: { strategicLeverage: 88, recursionPotential: 78, crossNodeImpact: 90, composability: 85, governanceInfluence: 68, moatSensitivity: 85 }, discoveredBy: 'reactor', rationale: 'Elastic scaling prevents both over-provisioning waste and under-provisioning bottlenecks' },
  { namePattern: 'Dependency Resolution Optimizer', descriptionPattern: 'Optimal dependency resolution with circular dependency detection and lazy evaluation', category: 'orchestration', modulePattern: ['CORTEX', 'SYSTEM', 'VISION'], entryPattern: 'dependency-resolver', exitPattern: 'dependencies-resolved', errorStrategy: 'abort', maxExecutionMs: 3000, baseBreakdown: { strategicLeverage: 88, recursionPotential: 75, crossNodeImpact: 90, composability: 88, governanceInfluence: 70, moatSensitivity: 85 }, discoveredBy: 'reactor', rationale: 'Dependency resolution failures cascade — optimal resolution prevents systemic failures' },
  { namePattern: 'Workflow Checkpoint Manager', descriptionPattern: 'Automatic checkpoint creation and restoration for long-running multi-stage workflows', category: 'orchestration', modulePattern: ['CORTEX', 'SYSTEM', 'BRAIN'], entryPattern: 'checkpoint-creator', exitPattern: 'checkpoint-managed', errorStrategy: 'rollback', maxExecutionMs: 5000, baseBreakdown: { strategicLeverage: 88, recursionPotential: 72, crossNodeImpact: 85, composability: 82, governanceInfluence: 72, moatSensitivity: 85 }, discoveredBy: 'reactor', rationale: 'Checkpointing prevents total work loss from mid-pipeline failures — essential for long-running operations' },

  // === OBSERVABILITY ===
  { namePattern: 'Cognitive Telemetry Collector', descriptionPattern: 'Deep telemetry collection from cognitive operations including reasoning traces and attention maps', category: 'observability', modulePattern: ['VISION', 'BRAIN', 'CORTEX', 'ANALYTICS'], entryPattern: 'cognitive-telemetry', exitPattern: 'telemetry-collected', errorStrategy: 'skip', maxExecutionMs: 2000, baseBreakdown: { strategicLeverage: 88, recursionPotential: 78, crossNodeImpact: 88, composability: 82, governanceInfluence: 72, moatSensitivity: 88 }, discoveredBy: 'reactor', rationale: 'Cognitive operations are opaque without specialized telemetry — enables debugging and optimization' },
  { namePattern: 'Emergent Behavior Detector', descriptionPattern: 'Detects unexpected emergent behaviors from multi-module interactions via statistical anomaly detection', category: 'observability', modulePattern: ['VISION', 'ANALYTICS', 'CORTEX'], entryPattern: 'emergence-scanner', exitPattern: 'emergence-classified', errorStrategy: 'skip', maxExecutionMs: 8000, baseBreakdown: { strategicLeverage: 92, recursionPotential: 85, crossNodeImpact: 90, composability: 75, governanceInfluence: 78, moatSensitivity: 92 }, discoveredBy: 'reactor', rationale: 'Emergent behaviors can be both opportunities and risks — early detection enables appropriate response' },
  { namePattern: 'Decision Explanation Generator', descriptionPattern: 'Generates human-readable explanations for autonomous system decisions with confidence levels', category: 'observability', modulePattern: ['VISION', 'BRAIN', 'GOVERNANCE', 'DECODE'], entryPattern: 'decision-explainer', exitPattern: 'explanation-generated', errorStrategy: 'skip', maxExecutionMs: 5000, baseBreakdown: { strategicLeverage: 90, recursionPotential: 72, crossNodeImpact: 85, composability: 78, governanceInfluence: 92, moatSensitivity: 88 }, discoveredBy: 'reactor', rationale: 'Explainability is both a regulatory requirement and a trust-building necessity' },

  // === GOVERNANCE ===
  { namePattern: 'Constitutional AI Guardian', descriptionPattern: 'Enforces constitutional constraints on autonomous behavior with graduated intervention', category: 'governance', modulePattern: ['GOVERNANCE', 'BRAIN', 'DEFENSE', 'CORTEX'], entryPattern: 'constitutional-checker', exitPattern: 'constitutional-verified', errorStrategy: 'abort', maxExecutionMs: 2000, baseBreakdown: { strategicLeverage: 95, recursionPotential: 78, crossNodeImpact: 92, composability: 70, governanceInfluence: 98, moatSensitivity: 95 }, discoveredBy: 'reactor', rationale: 'Constitutional constraints provide hard safety guarantees that cannot be overridden by optimization pressure' },
  { namePattern: 'Delegation Authority Chain', descriptionPattern: 'Tracks and enforces delegation of authority with revocation and audit trail', category: 'governance', modulePattern: ['GOVERNANCE', 'ACCESS', 'AUDIT'], entryPattern: 'delegation-tracker', exitPattern: 'delegation-enforced', errorStrategy: 'abort', maxExecutionMs: 1000, baseBreakdown: { strategicLeverage: 88, recursionPotential: 65, crossNodeImpact: 85, composability: 72, governanceInfluence: 95, moatSensitivity: 88 }, discoveredBy: 'reactor', rationale: 'Authority delegation without tracking creates accountability gaps — audit trails are essential' },
  { namePattern: 'Risk Appetite Calibrator', descriptionPattern: 'Dynamic risk appetite adjustment based on operational context, time pressure, and stakes', category: 'governance', modulePattern: ['GOVERNANCE', 'BRAIN', 'ANALYTICS'], entryPattern: 'risk-context-analyzer', exitPattern: 'risk-appetite-set', errorStrategy: 'abort', maxExecutionMs: 2000, baseBreakdown: { strategicLeverage: 90, recursionPotential: 80, crossNodeImpact: 85, composability: 78, governanceInfluence: 92, moatSensitivity: 90 }, discoveredBy: 'reactor', rationale: 'Static risk thresholds are suboptimal — context-aware risk management improves both safety and performance' },

  // === INTEGRATION ===
  { namePattern: 'Protocol Adaptation Layer', descriptionPattern: 'Dynamic protocol translation between heterogeneous integration endpoints', category: 'integration', modulePattern: ['INTEGRATION', 'DECODE', 'NEXUS'], entryPattern: 'protocol-detector', exitPattern: 'protocol-adapted', errorStrategy: 'retry', maxExecutionMs: 3000, baseBreakdown: { strategicLeverage: 85, recursionPotential: 68, crossNodeImpact: 88, composability: 90, governanceInfluence: 62, moatSensitivity: 82 }, discoveredBy: 'reactor', rationale: 'Protocol heterogeneity is the primary integration barrier — adaptive translation eliminates it' },
  { namePattern: 'Integration Health Scorecard', descriptionPattern: 'Continuous health scoring of all integration points with degradation prediction', category: 'integration', modulePattern: ['INTEGRATION', 'VISION', 'ANALYTICS'], entryPattern: 'integration-monitor', exitPattern: 'health-scorecard', errorStrategy: 'skip', maxExecutionMs: 5000, baseBreakdown: { strategicLeverage: 82, recursionPotential: 70, crossNodeImpact: 85, composability: 80, governanceInfluence: 68, moatSensitivity: 80 }, discoveredBy: 'reactor', rationale: 'Integration failures are the most common production incident type — proactive monitoring prevents outages' },
  { namePattern: 'Data Format Normalizer', descriptionPattern: 'Automatic detection and normalization of heterogeneous data formats into canonical schema', category: 'integration', modulePattern: ['INTEGRATION', 'DECODE', 'BRAIN'], entryPattern: 'format-detector', exitPattern: 'format-normalized', errorStrategy: 'fallback', maxExecutionMs: 2000, baseBreakdown: { strategicLeverage: 82, recursionPotential: 65, crossNodeImpact: 82, composability: 88, governanceInfluence: 55, moatSensitivity: 78 }, discoveredBy: 'reactor', rationale: 'Data format inconsistency causes silent data corruption — normalization ensures semantic integrity' },

  // === COMPLIANCE (SOVEREIGN) ===
  { namePattern: 'Jurisdiction Classifier', descriptionPattern: 'Auto-classifies data and operations by legal jurisdiction with regulatory mapping', category: 'compliance', modulePattern: ['SOVEREIGN', 'GOVERNANCE', 'ANALYTICS', 'AUDIT'], entryPattern: 'jurisdiction-scanner', exitPattern: 'jurisdiction-classified', errorStrategy: 'abort', maxExecutionMs: 3000, baseBreakdown: { strategicLeverage: 92, recursionPotential: 72, crossNodeImpact: 90, composability: 75, governanceInfluence: 95, moatSensitivity: 92 }, discoveredBy: 'reactor', rationale: 'Jurisdiction-aware operations are mandatory for global compliance — automated classification prevents violations' },
  { namePattern: 'Regulatory Change Tracker', descriptionPattern: 'Monitors and propagates regulatory changes across module policies in real-time', category: 'compliance', modulePattern: ['SOVEREIGN', 'GOVERNANCE', 'BRAIN', 'RIPPLE'], entryPattern: 'regulation-monitor', exitPattern: 'policy-updated', errorStrategy: 'abort', maxExecutionMs: 5000, baseBreakdown: { strategicLeverage: 90, recursionPotential: 78, crossNodeImpact: 88, composability: 72, governanceInfluence: 95, moatSensitivity: 90 }, discoveredBy: 'reactor', rationale: 'Regulatory lag creates liability — real-time tracking ensures continuous compliance' },
  { namePattern: 'Compliance Attestation Engine', descriptionPattern: 'Generates cryptographically signed compliance attestations with full audit provenance', category: 'compliance', modulePattern: ['SOVEREIGN', 'AUDIT', 'DEFENSE', 'GOVERNANCE'], entryPattern: 'attestation-builder', exitPattern: 'attestation-signed', errorStrategy: 'abort', maxExecutionMs: 2000, baseBreakdown: { strategicLeverage: 88, recursionPotential: 65, crossNodeImpact: 85, composability: 70, governanceInfluence: 98, moatSensitivity: 88 }, discoveredBy: 'reactor', rationale: 'Signed attestations provide non-repudiable compliance evidence for auditors and regulators' },

  // === PREDICTION (ORACLE) ===
  { namePattern: 'Bayesian Demand Forecaster', descriptionPattern: 'Probabilistic demand forecasting using Bayesian inference with uncertainty quantification', category: 'prediction', modulePattern: ['ORACLE', 'ANALYTICS', 'BRAIN', 'CORTEX'], entryPattern: 'demand-modeler', exitPattern: 'forecast-generated', errorStrategy: 'skip', maxExecutionMs: 15000, baseBreakdown: { strategicLeverage: 92, recursionPotential: 88, crossNodeImpact: 85, composability: 82, governanceInfluence: 68, moatSensitivity: 92 }, discoveredBy: 'reactor', rationale: 'Probabilistic forecasting with uncertainty bounds enables better resource allocation than point estimates' },
  { namePattern: 'Anomaly Prediction Network', descriptionPattern: 'Predicts anomalies before they occur using temporal pattern analysis and precursor detection', category: 'prediction', modulePattern: ['ORACLE', 'VISION', 'ANALYTICS', 'BRAIN'], entryPattern: 'precursor-detector', exitPattern: 'anomaly-predicted', errorStrategy: 'skip', maxExecutionMs: 8000, baseBreakdown: { strategicLeverage: 95, recursionPotential: 85, crossNodeImpact: 90, composability: 78, governanceInfluence: 72, moatSensitivity: 95 }, discoveredBy: 'reactor', rationale: 'Predicting anomalies before they manifest transforms reactive monitoring into proactive prevention' },
  { namePattern: 'Capacity Planning Oracle', descriptionPattern: 'Long-horizon capacity planning using Monte Carlo simulation and trend extrapolation', category: 'prediction', modulePattern: ['ORACLE', 'ANALYTICS', 'SYSTEM', 'EVOLUTION'], entryPattern: 'capacity-modeler', exitPattern: 'capacity-plan-generated', errorStrategy: 'skip', maxExecutionMs: 20000, baseBreakdown: { strategicLeverage: 88, recursionPotential: 80, crossNodeImpact: 85, composability: 75, governanceInfluence: 72, moatSensitivity: 88 }, discoveredBy: 'reactor', rationale: 'Capacity planning prevents both costly over-provisioning and dangerous under-provisioning' },

  // === ETHICS (CONSCIENCE) ===
  { namePattern: 'Ethical Impact Assessor', descriptionPattern: 'Multi-stakeholder ethical impact assessment with bias detection and fairness scoring', category: 'ethics', modulePattern: ['CONSCIENCE', 'BRAIN', 'GOVERNANCE', 'CORTEX'], entryPattern: 'ethics-scanner', exitPattern: 'impact-assessed', errorStrategy: 'abort', maxExecutionMs: 5000, baseBreakdown: { strategicLeverage: 92, recursionPotential: 78, crossNodeImpact: 90, composability: 72, governanceInfluence: 98, moatSensitivity: 92 }, discoveredBy: 'reactor', rationale: 'Ethical assessment prevents harm and builds trust — mandatory for responsible autonomous operation' },
  { namePattern: 'Bias Gradient Detector', descriptionPattern: 'Continuous monitoring for emergent bias patterns across cognitive and decision pipelines', category: 'ethics', modulePattern: ['CONSCIENCE', 'VISION', 'ANALYTICS', 'BRAIN'], entryPattern: 'bias-monitor', exitPattern: 'bias-report-generated', errorStrategy: 'skip', maxExecutionMs: 8000, baseBreakdown: { strategicLeverage: 90, recursionPotential: 82, crossNodeImpact: 88, composability: 75, governanceInfluence: 95, moatSensitivity: 90 }, discoveredBy: 'reactor', rationale: 'Bias can emerge from module interactions even when individual modules are unbiased — cross-cutting detection is essential' },

  // === PRIVACY (PHANTOM) ===
  { namePattern: 'Data Minimization Enforcer', descriptionPattern: 'Enforces data minimization principles by tracking and pruning unnecessary data retention', category: 'privacy', modulePattern: ['PHANTOM', 'GOVERNANCE', 'AUDIT', 'MEMORY'], entryPattern: 'retention-scanner', exitPattern: 'data-minimized', errorStrategy: 'abort', maxExecutionMs: 5000, baseBreakdown: { strategicLeverage: 90, recursionPotential: 72, crossNodeImpact: 88, composability: 70, governanceInfluence: 95, moatSensitivity: 90 }, discoveredBy: 'reactor', rationale: 'Data minimization is a core GDPR principle — automated enforcement prevents accumulation of unnecessary PII' },
  { namePattern: 'Differential Privacy Injector', descriptionPattern: 'Applies calibrated differential privacy noise to analytics outputs while preserving statistical utility', category: 'privacy', modulePattern: ['PHANTOM', 'ANALYTICS', 'BRAIN', 'CORTEX'], entryPattern: 'privacy-calibrator', exitPattern: 'dp-noise-injected', errorStrategy: 'abort', maxExecutionMs: 3000, baseBreakdown: { strategicLeverage: 92, recursionPotential: 78, crossNodeImpact: 85, composability: 75, governanceInfluence: 90, moatSensitivity: 95 }, discoveredBy: 'reactor', rationale: 'Differential privacy provides mathematical guarantees against re-identification — critical for sensitive data analytics' },

  // === SYNTHESIS (FORGE) ===
  { namePattern: 'Component Synthesis Engine', descriptionPattern: 'Generates new module components by recombining proven patterns from the capability registry', category: 'synthesis', modulePattern: ['FORGE', 'BRAIN', 'EVOLUTION', 'CORTEX'], entryPattern: 'pattern-combiner', exitPattern: 'component-synthesized', errorStrategy: 'rollback', maxExecutionMs: 15000, baseBreakdown: { strategicLeverage: 95, recursionPotential: 95, crossNodeImpact: 88, composability: 90, governanceInfluence: 65, moatSensitivity: 96 }, discoveredBy: 'reactor', rationale: 'Automated component synthesis is the ultimate force multiplier — the system builds itself' },
  { namePattern: 'Cross-Domain Fusion Reactor', descriptionPattern: 'Fuses capabilities from disparate domains into novel hybrid pipelines', category: 'synthesis', modulePattern: ['FORGE', 'DREAM', 'CORTEX', 'INTEGRATION'], entryPattern: 'domain-analyzer', exitPattern: 'fusion-complete', errorStrategy: 'rollback', maxExecutionMs: 20000, baseBreakdown: { strategicLeverage: 92, recursionPotential: 92, crossNodeImpact: 90, composability: 85, governanceInfluence: 62, moatSensitivity: 95 }, discoveredBy: 'reactor', rationale: 'Cross-domain fusion creates capabilities that no single domain could produce — emergent innovation' },

  // === LOCALIZATION (LINGUA) ===
  { namePattern: 'Semantic Translation Bridge', descriptionPattern: 'Context-preserving semantic translation across natural languages with domain-specific terminology', category: 'localization', modulePattern: ['LINGUA', 'DECODE', 'BRAIN', 'CORTEX'], entryPattern: 'context-extractor', exitPattern: 'translation-complete', errorStrategy: 'fallback', maxExecutionMs: 5000, baseBreakdown: { strategicLeverage: 85, recursionPotential: 75, crossNodeImpact: 85, composability: 88, governanceInfluence: 62, moatSensitivity: 85 }, discoveredBy: 'reactor', rationale: 'Semantic translation preserves meaning where literal translation fails — essential for global deployment' },

  // === GEOSPATIAL (COMPASS) ===
  { namePattern: 'Geospatial Risk Mapper', descriptionPattern: 'Maps operational risks to geographic regions with real-time threat overlay and jurisdiction awareness', category: 'geospatial', modulePattern: ['COMPASS', 'ANALYTICS', 'SOVEREIGN', 'DEFENSE'], entryPattern: 'geo-risk-scanner', exitPattern: 'risk-map-generated', errorStrategy: 'skip', maxExecutionMs: 8000, baseBreakdown: { strategicLeverage: 88, recursionPotential: 75, crossNodeImpact: 85, composability: 78, governanceInfluence: 82, moatSensitivity: 88 }, discoveredBy: 'reactor', rationale: 'Geographic risk varies dramatically — spatial awareness enables targeted mitigation strategies' },

  // === SIMULATION (ECHO) ===
  { namePattern: 'Digital Twin Orchestrator', descriptionPattern: 'Creates and maintains digital twins of system components for safe experimentation and regression testing', category: 'simulation', modulePattern: ['ECHO', 'SYSTEM', 'CORTEX', 'VISION'], entryPattern: 'twin-builder', exitPattern: 'twin-synchronized', errorStrategy: 'rollback', maxExecutionMs: 15000, baseBreakdown: { strategicLeverage: 92, recursionPotential: 88, crossNodeImpact: 90, composability: 82, governanceInfluence: 72, moatSensitivity: 92 }, discoveredBy: 'reactor', rationale: 'Digital twins enable risk-free experimentation — test mutations before production deployment' },
  { namePattern: 'Chaos Scenario Simulator', descriptionPattern: 'Simulates cascading failure scenarios to validate system resilience and recovery procedures', category: 'simulation', modulePattern: ['ECHO', 'DEFENSE', 'SYSTEM', 'ANALYTICS'], entryPattern: 'chaos-injector', exitPattern: 'resilience-scored', errorStrategy: 'rollback', maxExecutionMs: 20000, baseBreakdown: { strategicLeverage: 90, recursionPotential: 82, crossNodeImpact: 92, composability: 75, governanceInfluence: 78, moatSensitivity: 90 }, discoveredBy: 'reactor', rationale: 'Proactive chaos engineering prevents cascading failures that reactive monitoring cannot catch' },

  // === CONTRACTS (TREATY) ===
  { namePattern: 'Machine-to-Machine Contract Broker', descriptionPattern: 'Negotiates, validates, and enforces service-level agreements between autonomous modules', category: 'contracts', modulePattern: ['TREATY', 'GOVERNANCE', 'ACCESS', 'AUDIT'], entryPattern: 'sla-negotiator', exitPattern: 'contract-enforced', errorStrategy: 'abort', maxExecutionMs: 3000, baseBreakdown: { strategicLeverage: 88, recursionPotential: 78, crossNodeImpact: 88, composability: 80, governanceInfluence: 92, moatSensitivity: 88 }, discoveredBy: 'reactor', rationale: 'Formal inter-module contracts prevent silent degradation and enable automated accountability' },

  // === ACQUISITION (HARVEST) ===
  { namePattern: 'Intelligent Data Harvester', descriptionPattern: 'Autonomous data acquisition with quality scoring, deduplication, and provenance tracking', category: 'acquisition', modulePattern: ['HARVEST', 'INTEGRATION', 'BRAIN', 'ANALYTICS'], entryPattern: 'source-scanner', exitPattern: 'data-harvested', errorStrategy: 'retry', maxExecutionMs: 10000, baseBreakdown: { strategicLeverage: 88, recursionPotential: 80, crossNodeImpact: 82, composability: 85, governanceInfluence: 68, moatSensitivity: 88 }, discoveredBy: 'reactor', rationale: 'Quality data acquisition is the foundation of all intelligence — automated harvesting with provenance tracking ensures data integrity' },

  // === EDGE (REFLEX) ===
  { namePattern: 'Edge Decision Accelerator', descriptionPattern: 'Sub-millisecond decision routing at the edge with local model inference and central sync', category: 'edge', modulePattern: ['REFLEX', 'NEXUS', 'CORTEX', 'SYSTEM'], entryPattern: 'edge-classifier', exitPattern: 'edge-decision-made', errorStrategy: 'fallback', maxExecutionMs: 100, baseBreakdown: { strategicLeverage: 90, recursionPotential: 75, crossNodeImpact: 85, composability: 85, governanceInfluence: 62, moatSensitivity: 90 }, discoveredBy: 'reactor', rationale: 'Edge-first decisions eliminate network latency for time-critical operations while maintaining central coordination' },
  { namePattern: 'Reflex Arc Coordinator', descriptionPattern: 'Coordinated edge responses across distributed nodes with eventual consistency guarantees', category: 'edge', modulePattern: ['REFLEX', 'NERVE', 'SYSTEM', 'ANALYTICS'], entryPattern: 'reflex-dispatcher', exitPattern: 'arc-coordinated', errorStrategy: 'fallback', maxExecutionMs: 200, baseBreakdown: { strategicLeverage: 88, recursionPotential: 78, crossNodeImpact: 88, composability: 82, governanceInfluence: 65, moatSensitivity: 88 }, discoveredBy: 'reactor', rationale: 'Distributed reflex arcs enable system-wide reactive behavior without central bottleneck latency' },

  // === RIPPLE (EVENT PROPAGATION) — v1.1.0 Discovery ===
  { namePattern: 'Causal Chain Reconstructor', descriptionPattern: 'Retroactive reconstruction of causal event chains from distributed logs with temporal ordering and fork-point detection', category: 'observability', modulePattern: ['RIPPLE', 'VISION', 'ANALYTICS', 'AUDIT'], entryPattern: 'causal-tracer', exitPattern: 'chain-reconstructed', errorStrategy: 'skip', maxExecutionMs: 10000, baseBreakdown: { strategicLeverage: 92, recursionPotential: 85, crossNodeImpact: 90, composability: 80, governanceInfluence: 78, moatSensitivity: 92 }, discoveredBy: 'reactor', rationale: 'Causal chain reconstruction transforms post-incident analysis from guesswork into deterministic replay' },
  { namePattern: 'Event Storm Dampener', descriptionPattern: 'Adaptive throttling and deduplication for cascading event storms with priority-based triage', category: 'orchestration', modulePattern: ['RIPPLE', 'NERVE', 'SYSTEM', 'GOVERNANCE'], entryPattern: 'storm-detector', exitPattern: 'storm-dampened', errorStrategy: 'fallback', maxExecutionMs: 500, baseBreakdown: { strategicLeverage: 90, recursionPotential: 78, crossNodeImpact: 92, composability: 82, governanceInfluence: 75, moatSensitivity: 88 }, discoveredBy: 'reactor', rationale: 'Event storms are the #1 cause of cascading failures — dampening at the propagation layer prevents systemic collapse' },
  { namePattern: 'Ripple Effect Forecaster', descriptionPattern: 'Predicts downstream ripple effects of state mutations before they propagate using causal graph simulation', category: 'prediction', modulePattern: ['RIPPLE', 'ORACLE', 'CORTEX', 'VISION'], entryPattern: 'ripple-simulator', exitPattern: 'effect-forecast', errorStrategy: 'skip', maxExecutionMs: 8000, baseBreakdown: { strategicLeverage: 95, recursionPotential: 88, crossNodeImpact: 92, composability: 78, governanceInfluence: 72, moatSensitivity: 95 }, discoveredBy: 'reactor', rationale: 'Predicting ripple effects before propagation enables preemptive intervention — fundamentally changes reactive to proactive' },

  // === INCLUSIVE (ACCESSIBILITY INTELLIGENCE) — v1.1.0 Discovery ===
  { namePattern: 'Accessibility Compliance Enforcer', descriptionPattern: 'Continuous WCAG/ADA compliance enforcement with automatic remediation suggestions and regression prevention', category: 'compliance', modulePattern: ['INCLUSIVE', 'GOVERNANCE', 'VISION', 'AUDIT'], entryPattern: 'a11y-scanner', exitPattern: 'compliance-enforced', errorStrategy: 'skip', maxExecutionMs: 5000, baseBreakdown: { strategicLeverage: 90, recursionPotential: 72, crossNodeImpact: 88, composability: 78, governanceInfluence: 95, moatSensitivity: 88 }, discoveredBy: 'reactor', rationale: 'Accessibility compliance is both a legal requirement and a market differentiator — automated enforcement prevents regressions' },
  { namePattern: 'Adaptive Modality Switcher', descriptionPattern: 'Real-time interface modality switching between visual, auditory, haptic, and simplified modes based on user capability detection', category: 'integration', modulePattern: ['INCLUSIVE', 'DECODE', 'BRAIN', 'INTEGRATION'], entryPattern: 'modality-detector', exitPattern: 'modality-switched', errorStrategy: 'fallback', maxExecutionMs: 2000, baseBreakdown: { strategicLeverage: 88, recursionPotential: 78, crossNodeImpact: 85, composability: 90, governanceInfluence: 72, moatSensitivity: 88 }, discoveredBy: 'reactor', rationale: 'Modality adaptation makes the substrate accessible to users with any capability profile — universal design at runtime' },

  // === OBSERVABILITY (DEEP SYSTEM TELEMETRY) — v1.1.0 Discovery ===
  { namePattern: 'Cognitive Flame Graph Generator', descriptionPattern: 'Generates flame graphs of cognitive execution paths showing time allocation across reasoning stages and model invocations', category: 'observability', modulePattern: ['OBSERVABILITY', 'CORTEX', 'BRAIN', 'ANALYTICS'], entryPattern: 'execution-profiler', exitPattern: 'flame-graph-generated', errorStrategy: 'skip', maxExecutionMs: 5000, baseBreakdown: { strategicLeverage: 92, recursionPotential: 82, crossNodeImpact: 88, composability: 85, governanceInfluence: 70, moatSensitivity: 92 }, discoveredBy: 'reactor', rationale: 'Flame graphs for cognitive pipelines are unprecedented — enables performance optimization of thought processes' },
  { namePattern: 'SLO Burn-Rate Alerter', descriptionPattern: 'Multi-window SLO burn-rate monitoring with adaptive alert thresholds and fatigue-resistant notification routing', category: 'observability', modulePattern: ['OBSERVABILITY', 'ANALYTICS', 'NERVE', 'GOVERNANCE'], entryPattern: 'slo-monitor', exitPattern: 'burn-rate-evaluated', errorStrategy: 'skip', maxExecutionMs: 2000, baseBreakdown: { strategicLeverage: 90, recursionPotential: 75, crossNodeImpact: 88, composability: 82, governanceInfluence: 85, moatSensitivity: 88 }, discoveredBy: 'reactor', rationale: 'Burn-rate alerting prevents SLO breaches hours before they happen — multi-window analysis eliminates false positives' },
  { namePattern: 'Topology-Aware Trace Correlator', descriptionPattern: 'Correlates distributed traces using substrate topology awareness for automatic span stitching across module boundaries', category: 'observability', modulePattern: ['OBSERVABILITY', 'VISION', 'SYSTEM', 'NERVE'], entryPattern: 'trace-correlator', exitPattern: 'trace-stitched', errorStrategy: 'skip', maxExecutionMs: 3000, baseBreakdown: { strategicLeverage: 90, recursionPotential: 78, crossNodeImpact: 92, composability: 85, governanceInfluence: 68, moatSensitivity: 90 }, discoveredBy: 'reactor', rationale: 'Topology-aware correlation eliminates the broken-trace problem that plagues traditional distributed tracing' },

  // === ANALYTICS (ANALYTICAL INTELLIGENCE) — v1.1.0 Discovery ===
  { namePattern: 'Autonomous Dimension Discovery', descriptionPattern: 'Automatically discovers meaningful analytical dimensions from raw event streams without predefined schemas', category: 'learning', modulePattern: ['ANALYTICS', 'BRAIN', 'CORTEX', 'DREAM'], entryPattern: 'dimension-miner', exitPattern: 'dimensions-discovered', errorStrategy: 'skip', maxExecutionMs: 15000, baseBreakdown: { strategicLeverage: 94, recursionPotential: 90, crossNodeImpact: 85, composability: 88, governanceInfluence: 62, moatSensitivity: 94 }, discoveredBy: 'reactor', rationale: 'Schema-free dimension discovery eliminates the biggest bottleneck in analytics — humans deciding what to measure' },
  { namePattern: 'Cohort Migration Tracker', descriptionPattern: 'Tracks user cohort migrations between behavioral segments with transition probability modeling and churn prediction', category: 'prediction', modulePattern: ['ANALYTICS', 'ORACLE', 'BRAIN', 'VISION'], entryPattern: 'cohort-scanner', exitPattern: 'migration-mapped', errorStrategy: 'skip', maxExecutionMs: 10000, baseBreakdown: { strategicLeverage: 90, recursionPotential: 82, crossNodeImpact: 85, composability: 82, governanceInfluence: 68, moatSensitivity: 90 }, discoveredBy: 'reactor', rationale: 'Cohort migration prediction is the holy grail of product analytics — knowing where users are headed before they arrive' },

  // === CROSS-MODULE SYNERGY DISCOVERIES — v1.1.0 ===
  { namePattern: 'Oracle-Ripple Precognition Chain', descriptionPattern: 'Fuses ORACLE probabilistic forecasting with RIPPLE causal propagation to predict downstream effects before events occur', category: 'prediction', modulePattern: ['ORACLE', 'RIPPLE', 'CORTEX', 'NERVE'], entryPattern: 'precognition-scanner', exitPattern: 'preemptive-action-dispatched', errorStrategy: 'rollback', maxExecutionMs: 5000, baseBreakdown: { strategicLeverage: 96, recursionPotential: 90, crossNodeImpact: 95, composability: 78, governanceInfluence: 72, moatSensitivity: 96 }, discoveredBy: 'reactor', rationale: 'Combining prediction with causal propagation creates genuine precognition — the system acts before events arrive' },
  { namePattern: 'Forge-Evolution Capability Genesis', descriptionPattern: 'Closed-loop capability creation where FORGE synthesizes and EVOLUTION pressure-tests through fitness evaluation', category: 'synthesis', modulePattern: ['FORGE', 'EVOLUTION', 'CORTEX', 'GOVERNANCE'], entryPattern: 'genesis-trigger', exitPattern: 'capability-born', errorStrategy: 'rollback', maxExecutionMs: 30000, baseBreakdown: { strategicLeverage: 96, recursionPotential: 98, crossNodeImpact: 90, composability: 82, governanceInfluence: 78, moatSensitivity: 98 }, discoveredBy: 'reactor', rationale: 'A system that breeds its own capabilities is the ultimate competitive moat — self-evolving architecture' },
  { namePattern: 'Conscience-Phantom Ethical Stealth Arbiter', descriptionPattern: 'Resolves tension between ethical transparency and operational privacy via graduated disclosure protocols', category: 'ethics', modulePattern: ['CONSCIENCE', 'PHANTOM', 'GOVERNANCE', 'AUDIT'], entryPattern: 'ethics-privacy-resolver', exitPattern: 'disclosure-calibrated', errorStrategy: 'abort', maxExecutionMs: 3000, baseBreakdown: { strategicLeverage: 92, recursionPotential: 80, crossNodeImpact: 90, composability: 72, governanceInfluence: 98, moatSensitivity: 95 }, discoveredBy: 'reactor', rationale: 'The ethics-privacy tension is unsolved in the industry — graduated disclosure is a novel resolution' },
  { namePattern: 'Harvest-Lingua Intelligence Miner', descriptionPattern: 'Cross-lingual data acquisition with real-time semantic translation for global intelligence harvesting', category: 'acquisition', modulePattern: ['HARVEST', 'LINGUA', 'BRAIN', 'ANALYTICS'], entryPattern: 'multilingual-harvester', exitPattern: 'intelligence-harvested', errorStrategy: 'retry', maxExecutionMs: 15000, baseBreakdown: { strategicLeverage: 90, recursionPotential: 82, crossNodeImpact: 88, composability: 85, governanceInfluence: 65, moatSensitivity: 90 }, discoveredBy: 'reactor', rationale: 'Language barriers lock out 80% of global intelligence — cross-lingual harvesting unlocks it' },
  { namePattern: 'Echo-Defense Adversarial Wargame', descriptionPattern: 'Automated adversarial wargames combining ECHO simulation with DEFENSE threat models for security stress-testing', category: 'simulation', modulePattern: ['ECHO', 'DEFENSE', 'CORTEX', 'ANALYTICS'], entryPattern: 'wargame-initializer', exitPattern: 'wargame-scored', errorStrategy: 'rollback', maxExecutionMs: 30000, baseBreakdown: { strategicLeverage: 92, recursionPotential: 85, crossNodeImpact: 92, composability: 75, governanceInfluence: 80, moatSensitivity: 92 }, discoveredBy: 'reactor', rationale: 'Automated wargaming discovers vulnerabilities that static analysis and manual pen-testing miss entirely' },
];

// ═══════════════════════════════════════════════════════════════════════════════
// STABLE HASH — deterministic dedup key
// ═══════════════════════════════════════════════════════════════════════════════

export function computeStableHash(name: string, moduleChain: string[], category: string): string {
  const payload = `${name}|${moduleChain.sort().join(',')}|${category}`;
  let hash = 0;
  for (let i = 0; i < payload.length; i++) {
    hash = ((hash << 5) - hash) + payload.charCodeAt(i);
    hash |= 0;
  }
  return `disc-${Math.abs(hash).toString(16).padStart(8, '0')}`;
}

// ═══════════════════════════════════════════════════════════════════════════════
// SYNERGY MULTIPLIER — bonus for cross-category module chains
// ═══════════════════════════════════════════════════════════════════════════════

function computeSynergyMultiplier(moduleChain: string[]): number {
  const uniqueModules = new Set(moduleChain);
  if (uniqueModules.size >= 4) return 1.15;
  if (uniqueModules.size >= 3) return 1.08;
  return 1.0;
}

// ═══════════════════════════════════════════════════════════════════════════════
// CONCURRENCY LOCK
// ═══════════════════════════════════════════════════════════════════════════════

export async function acquireDiscoveryLock(userId: string): Promise<boolean> {
  const nowIso = new Date().toISOString();
  const nextExpiryIso = new Date(Date.now() + 5 * 60 * 1000).toISOString();

  const { data: current, error: readError } = await supabase
    .from('discovery_lock')
    .select('id, locked_by, expires_at')
    .eq('id', 'global')
    .maybeSingle();

  if (readError) {
    console.error('Failed to read discovery lock:', readError);
    return false;
  }

  // Self-heal missing global lock row
  if (!current) {
    const { error: initError } = await supabase
      .from('discovery_lock')
      .insert({ id: 'global', locked_by: null, locked_at: null, expires_at: null });

    if (initError) {
      console.error('Failed to initialize discovery lock row:', initError);
      return false;
    }
  }

  const lockHeldByOther = !!current?.locked_by
    && current.locked_by !== userId
    && !!current.expires_at
    && new Date(current.expires_at) > new Date();

  if (lockHeldByOther) {
    return false;
  }

  const { error: claimError } = await supabase
    .from('discovery_lock')
    .update({
      locked_by: userId,
      locked_at: nowIso,
      expires_at: nextExpiryIso,
    })
    .eq('id', 'global');

  if (claimError) {
    console.error('Failed to claim discovery lock:', claimError);
    return false;
  }

  return true;
}

export async function releaseDiscoveryLock(): Promise<void> {
  await supabase
    .from('discovery_lock')
    .update({ locked_by: null, locked_at: null, expires_at: null })
    .eq('id', 'global');
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN REACTOR
// ═══════════════════════════════════════════════════════════════════════════════

export async function runReactor(config: ReactorConfig, userId: string): Promise<ReactorRunResult> {
  const startTime = Date.now();

  // 1. Acquire lock
  const locked = await acquireDiscoveryLock(userId);
  if (!locked) {
    return {
      runId: '', status: 'failed', totalCandidates: 0, acceptedCount: 0,
      topFind: null, discoveries: [], byCategory: {}, byTier: {},
      dryRun: config.dryRun, durationMs: Date.now() - startTime,
      error: 'Another discovery run is in progress. Please wait.',
    };
  }

  try {
    // 2. Fetch already-promoted discovery IDs to skip rediscovery
    const { data: existingPromotions } = await supabase
      .from('vault_promotions')
      .select('discovery_id');
    const promotedIds = new Set((existingPromotions ?? []).map((p: any) => p.discovery_id));

    // 3. Fetch already-discovered IDs (across all runs)
    const { data: existingDiscoveries } = await supabase
      .from('discoveries')
      .select('id');
    const knownIds = new Set((existingDiscoveries ?? []).map((d: any) => d.id));

    // 4. Generate candidates from templates, skipping already-known ones
    // 4. Generate candidates from templates (hardcoded + injected), skipping already-known ones
    const allTemplates = [...SYNTHESIS_TEMPLATES, ...(config.injectedTemplates || [])];
    const candidates: ReactorCandidate[] = [];
    let skippedCount = 0;
    for (const template of allTemplates) {
      const stableId = computeStableHash(template.namePattern, template.modulePattern, template.category);

      // Skip if already promoted to vault or already discovered
      if (promotedIds.has(stableId) || knownIds.has(stableId)) {
        skippedCount++;
        continue;
      }

      const baseCjpi = computeCJPI(template.baseBreakdown);
      const synergyMultiplier = computeSynergyMultiplier(template.modulePattern);
      const finalCjpi = Math.round(Math.min(100, baseCjpi * synergyMultiplier) * 10) / 10;
      const tier = autoAssignTier(finalCjpi);

      // Only accept 80+ pipelines
      if (finalCjpi < 80) continue;

      candidates.push({
        id: stableId,
        name: template.namePattern,
        description: template.descriptionPattern,
        category: template.category,
        moduleChain: template.modulePattern,
        entryCapability: template.entryPattern,
        exitCapability: template.exitPattern,
        errorStrategy: template.errorStrategy,
        maxExecutionMs: template.maxExecutionMs,
        cjpiBreakdown: template.baseBreakdown,
        cjpi: finalCjpi,
        tier,
        synergyMultiplier,
        discoveredBy: template.discoveredBy,
        rationale: template.rationale,
      });
    }

    console.log(`[Reactor] Skipped ${skippedCount} already-known discoveries, ${candidates.length} new candidates`);

    // 4. Sort by CJPI descending
    candidates.sort((a, b) => b.cjpi - a.cjpi);

    // 5. Apply topN limit
    const accepted = config.topN ? candidates.slice(0, config.topN) : candidates;

    // 6. Compute stats
    const byCategory: Record<string, number> = {};
    const byTier: Record<string, number> = {};
    for (const c of accepted) {
      byCategory[c.category] = (byCategory[c.category] || 0) + 1;
      byTier[c.tier || 'untiered'] = (byTier[c.tier || 'untiered'] || 0) + 1;
    }

    const topFind = accepted.length > 0 ? { name: accepted[0].name, cjpi: accepted[0].cjpi } : null;

    // 7. Persist run
    const { data: run, error: runError } = await supabase
      .from('discovery_runs')
      .insert({
        status: 'completed',
        total_candidates: candidates.length,
        accepted_count: accepted.length,
        top_find_name: topFind?.name,
        top_find_cjpi: topFind?.cjpi,
        scoring_version: config.scoringVersion || '1.0',
        dry_run: config.dryRun,
        exploratory_mode: config.exploratoryMode,
        finished_at: new Date().toISOString(),
        created_by: userId,
        logs: [{ event: 'reactor_complete', candidates: candidates.length, accepted: accepted.length, skipped: skippedCount }],
      })
      .select()
      .single();

    if (runError || !run) throw new Error(`Failed to create run: ${runError?.message}`);

    // 8. Persist discoveries (if not dry run, or always for audit)
    if (accepted.length > 0) {
      const rows = accepted.map(c => ({
        id: c.id,
        run_id: run.id,
        name: c.name,
        description: c.description,
        category: c.category,
        tier: c.tier,
        cjpi: c.cjpi,
        synergy_multiplier: c.synergyMultiplier,
        components: JSON.parse(JSON.stringify({ entry: c.entryCapability, exit: c.exitCapability })),
        module_chain: c.moduleChain,
        rationale: c.rationale,
        provenance: `Reactor v${config.scoringVersion || '1.0'} — ${config.exploratoryMode ? 'exploratory' : 'deterministic'}`,
        error_strategy: c.errorStrategy,
        max_execution_ms: c.maxExecutionMs,
        cjpi_breakdown: JSON.parse(JSON.stringify(c.cjpiBreakdown)),
        discovered_by: c.discoveredBy,
        written_to_registry: !config.dryRun,
      }));

      const { error: discError } = await supabase.from('discoveries').upsert(rows, { onConflict: 'id' });
      if (discError) console.error('Failed to persist discoveries:', discError);

      // 9. AUTO-PROMOTE — discoveries with CJPI ≥ 90 are promoted to vault_promotions
      if (!config.dryRun) {
        const promotable = accepted.filter(c => c.cjpi >= 90 && c.tier);
        if (promotable.length > 0) {
          const promotionRows = promotable.map(c => ({
            discovery_id: c.id,
            run_id: run.id,
            name: c.name,
            cjpi: c.cjpi,
            tier: c.tier,
            module_chain: c.moduleChain,
            description: c.description,
            category: c.category,
            promoted_at: new Date().toISOString(),
            export_ready: true,
            status: 'promoted',
          }));
          const { error: promoError } = await supabase
            .from('vault_promotions' as any)
            .upsert(promotionRows, { onConflict: 'discovery_id' });
          if (promoError) console.error('Failed to promote to vault:', promoError);
          else console.log(`Auto-promoted ${promotable.length} discoveries to vault (CJPI ≥ 90)`);
        }
      }
    }

    // 10. POST-DISCOVERY LEARNING — feed accepted discoveries into substrate learning systems
    if (!config.dryRun && accepted.length > 0) {
      try {
        const { feedDiscoveriesToLearning } = await import('./learning-bridge');
        const learningResult = feedDiscoveriesToLearning(accepted, run.id, config.dryRun);
        console.log(`[Reactor] Learning bridge: ${learningResult.domainLearnings} domain learnings, ${learningResult.rulesContributed} rules contributed, ${learningResult.synergyOutcomesRecorded} synergy outcomes`);
      } catch (err) {
        console.warn('[Reactor] Learning bridge failed (non-critical):', err);
      }
    }

    return {
      runId: run.id,
      status: 'completed',
      totalCandidates: candidates.length,
      acceptedCount: accepted.length,
      topFind,
      discoveries: accepted,
      byCategory,
      byTier,
      dryRun: config.dryRun,
      durationMs: Date.now() - startTime,
    };
  } catch (err: any) {
    return {
      runId: '', status: 'failed', totalCandidates: 0, acceptedCount: 0,
      topFind: null, discoveries: [], byCategory: {}, byTier: {},
      dryRun: config.dryRun, durationMs: Date.now() - startTime,
      error: err.message,
    };
  } finally {
    await releaseDiscoveryLock();
  }
}
