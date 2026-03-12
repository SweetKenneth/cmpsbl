/**
 * CMPSBL® Mini-Runtime™ Discovery Engine
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Fully portable capability discovery reactor.
 * Powered by the CMPSBL® Mini-Runtime™ Engine — zero external dependencies.
 *
 * This is the same reactor that powers the CMPSBL Autonomous Software Foundry,
 * packaged for standalone operation outside the substrate.
 *
 * Usage:
 *   import { createRuntime } from './standalone-runtime';
 *   import { createDiscoveryEngine } from './standalone-discovery-engine';
 *
 *   const runtime = createRuntime();
 *   const engine = createDiscoveryEngine(runtime);
 *   const result = await engine.run({ dryRun: false, topN: 50 });
 *   console.log(result.discoveries); // fully scored & tiered pipeline artifacts
 *
 * © CMPSBL® — All rights reserved.
 */

import type {
  StandaloneRuntime,
  CJPIScoreBreakdown,
  DiscoveryCategory,
  CrystallizedTier,
  ErrorStrategy,
} from './standalone-runtime';

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export interface DiscoveryConfig {
  dryRun: boolean;
  topN?: number;
  minCjpi?: number;
  categories?: DiscoveryCategory[];
  injectedTemplates?: SynthesisTemplate[];
}

export interface SynthesisTemplate {
  namePattern: string;
  descriptionPattern: string;
  category: DiscoveryCategory;
  modulePattern: string[];
  entryPattern: string;
  exitPattern: string;
  errorStrategy: ErrorStrategy;
  maxExecutionMs: number;
  baseBreakdown: CJPIScoreBreakdown;
  discoveredBy: string;
  rationale: string;
}

export interface DiscoveryCandidate {
  id: string;
  name: string;
  description: string;
  category: DiscoveryCategory;
  moduleChain: string[];
  entryCapability: string;
  exitCapability: string;
  errorStrategy: ErrorStrategy;
  maxExecutionMs: number;
  cjpiBreakdown: CJPIScoreBreakdown;
  cjpi: number;
  tier: CrystallizedTier | null;
  synergyMultiplier: number;
  discoveredBy: string;
  rationale: string;
}

export interface DiscoveryRunResult {
  runId: string;
  status: 'completed' | 'failed';
  totalCandidates: number;
  acceptedCount: number;
  skippedCount: number;
  topFind: { name: string; cjpi: number } | null;
  discoveries: DiscoveryCandidate[];
  byCategory: Record<string, number>;
  byTier: Record<string, number>;
  dryRun: boolean;
  durationMs: number;
  error?: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// BUILT-IN SYNTHESIS TEMPLATES — 37 high-value pipeline patterns
// ═══════════════════════════════════════════════════════════════════════════════

const BUILTIN_TEMPLATES: SynthesisTemplate[] = [
  // ── COGNITIVE ──
  { namePattern: 'Adaptive Working Memory Controller', descriptionPattern: 'Dynamic working memory allocation based on task complexity and cognitive load estimation', category: 'cognitive', modulePattern: ['BRAIN', 'CORTEX', 'MEMORY'], entryPattern: 'working-memory-allocator', exitPattern: 'memory-controlled', errorStrategy: 'fallback', maxExecutionMs: 2000, baseBreakdown: { strategicLeverage: 90, recursionPotential: 88, crossNodeImpact: 85, composability: 88, governanceInfluence: 62, moatSensitivity: 90 }, discoveredBy: 'reactor', rationale: 'Working memory is the bottleneck for complex reasoning — adaptive allocation directly improves output quality' },
  { namePattern: 'Concept Drift Corrector', descriptionPattern: 'Detects and corrects semantic concept drift in long-running cognitive sessions', category: 'cognitive', modulePattern: ['BRAIN', 'VISION', 'CORTEX'], entryPattern: 'drift-monitor', exitPattern: 'drift-corrected', errorStrategy: 'retry', maxExecutionMs: 3000, baseBreakdown: { strategicLeverage: 88, recursionPotential: 82, crossNodeImpact: 80, composability: 82, governanceInfluence: 65, moatSensitivity: 88 }, discoveredBy: 'reactor', rationale: 'Concept drift degrades output quality over time — early detection prevents compounding errors' },
  { namePattern: 'Causal Reasoning Engine', descriptionPattern: 'Structured causal inference from observational data with counterfactual generation', category: 'cognitive', modulePattern: ['CORTEX', 'BRAIN', 'DREAM', 'VISION'], entryPattern: 'causal-graph-builder', exitPattern: 'causal-inference-complete', errorStrategy: 'skip', maxExecutionMs: 15000, baseBreakdown: { strategicLeverage: 95, recursionPotential: 92, crossNodeImpact: 88, composability: 82, governanceInfluence: 72, moatSensitivity: 96 }, discoveredBy: 'reactor', rationale: 'Causal reasoning is the frontier of AI intelligence — moves beyond correlation to true understanding' },
  { namePattern: 'Epistemic State Tracker', descriptionPattern: 'Tracks what the system knows, believes, and is uncertain about across all modules', category: 'cognitive', modulePattern: ['BRAIN', 'CORTEX', 'GOVERNANCE'], entryPattern: 'epistemic-scanner', exitPattern: 'epistemic-map-updated', errorStrategy: 'skip', maxExecutionMs: 5000, baseBreakdown: { strategicLeverage: 92, recursionPotential: 90, crossNodeImpact: 85, composability: 80, governanceInfluence: 78, moatSensitivity: 92 }, discoveredBy: 'reactor', rationale: 'Self-aware knowledge tracking prevents hallucination and enables calibrated confidence' },
  { namePattern: 'Analogical Transfer Engine', descriptionPattern: 'Cross-domain analogy discovery and structural mapping for novel problem solving', category: 'cognitive', modulePattern: ['DREAM', 'BRAIN', 'CORTEX'], entryPattern: 'analogy-finder', exitPattern: 'analogy-applied', errorStrategy: 'skip', maxExecutionMs: 10000, baseBreakdown: { strategicLeverage: 90, recursionPotential: 95, crossNodeImpact: 82, composability: 85, governanceInfluence: 58, moatSensitivity: 92 }, discoveredBy: 'reactor', rationale: 'Analogical reasoning is uniquely powerful for creative problem-solving and knowledge transfer' },

  // ── EVOLUTION ──
  { namePattern: 'Fitness Landscape Navigator', descriptionPattern: 'Maps and navigates the fitness landscape of system configurations for optimal evolution paths', category: 'evolution', modulePattern: ['EVOLUTION', 'VISION', 'BRAIN', 'CORTEX'], entryPattern: 'landscape-mapper', exitPattern: 'optimal-path-found', errorStrategy: 'rollback', maxExecutionMs: 20000, baseBreakdown: { strategicLeverage: 95, recursionPotential: 92, crossNodeImpact: 90, composability: 78, governanceInfluence: 80, moatSensitivity: 96 }, discoveredBy: 'reactor', rationale: 'Navigating fitness landscapes prevents local optima traps and accelerates system improvement' },
  { namePattern: 'Mutation Impact Simulator', descriptionPattern: 'Monte Carlo simulation of mutation outcomes across system state space', category: 'evolution', modulePattern: ['EVOLUTION', 'CORTEX', 'VISION'], entryPattern: 'mutation-simulator', exitPattern: 'impact-distribution', errorStrategy: 'skip', maxExecutionMs: 30000, baseBreakdown: { strategicLeverage: 92, recursionPotential: 85, crossNodeImpact: 90, composability: 75, governanceInfluence: 85, moatSensitivity: 92 }, discoveredBy: 'reactor', rationale: 'Simulation before execution dramatically reduces risk of harmful mutations' },
  { namePattern: 'Co-Evolutionary Synchronizer', descriptionPattern: 'Coordinates co-evolutionary dynamics between interdependent module populations', category: 'evolution', modulePattern: ['EVOLUTION', 'CORTEX', 'SYSTEM', 'GOVERNANCE'], entryPattern: 'co-evolution-tracker', exitPattern: 'co-evolution-synced', errorStrategy: 'rollback', maxExecutionMs: 15000, baseBreakdown: { strategicLeverage: 92, recursionPotential: 88, crossNodeImpact: 95, composability: 72, governanceInfluence: 85, moatSensitivity: 92 }, discoveredBy: 'reactor', rationale: 'Co-evolution between modules creates emergent capabilities impossible from isolated optimization' },
  { namePattern: 'Genetic Memory Archiver', descriptionPattern: 'Archives successful evolutionary strategies as reusable genetic templates', category: 'evolution', modulePattern: ['EVOLUTION', 'BRAIN', 'DREAM'], entryPattern: 'strategy-extractor', exitPattern: 'genetic-template-stored', errorStrategy: 'retry', maxExecutionMs: 8000, baseBreakdown: { strategicLeverage: 88, recursionPotential: 92, crossNodeImpact: 80, composability: 85, governanceInfluence: 68, moatSensitivity: 90 }, discoveredBy: 'reactor', rationale: 'Preserving winning strategies prevents re-discovery costs' },

  // ── SECURITY ──
  { namePattern: 'Cognitive Firewall', descriptionPattern: 'Deep inspection of cognitive operations for adversarial manipulation attempts', category: 'security', modulePattern: ['DEFENSE', 'BRAIN', 'CORTEX', 'GOVERNANCE'], entryPattern: 'cognitive-inspector', exitPattern: 'manipulation-blocked', errorStrategy: 'abort', maxExecutionMs: 1000, baseBreakdown: { strategicLeverage: 95, recursionPotential: 75, crossNodeImpact: 92, composability: 68, governanceInfluence: 95, moatSensitivity: 98 }, discoveredBy: 'reactor', rationale: 'Cognitive-layer attacks bypass traditional security — requires deep semantic inspection' },
  { namePattern: 'Supply Chain Integrity Verifier', descriptionPattern: 'Cryptographic verification of module provenance and dependency integrity', category: 'security', modulePattern: ['DEFENSE', 'SYSTEM', 'GOVERNANCE', 'AUDIT'], entryPattern: 'provenance-checker', exitPattern: 'integrity-verified', errorStrategy: 'abort', maxExecutionMs: 5000, baseBreakdown: { strategicLeverage: 90, recursionPotential: 62, crossNodeImpact: 90, composability: 68, governanceInfluence: 95, moatSensitivity: 92 }, discoveredBy: 'reactor', rationale: 'Software supply chain attacks are the fastest growing threat vector' },
  { namePattern: 'Deception Detection Network', descriptionPattern: 'Multi-signal deception detection with confidence scoring', category: 'security', modulePattern: ['DEFENSE', 'BRAIN', 'VISION'], entryPattern: 'deception-analyzer', exitPattern: 'deception-classified', errorStrategy: 'abort', maxExecutionMs: 2000, baseBreakdown: { strategicLeverage: 90, recursionPotential: 78, crossNodeImpact: 85, composability: 72, governanceInfluence: 88, moatSensitivity: 92 }, discoveredBy: 'reactor', rationale: 'Multi-signal detection is required for robust defense against sophisticated adversarial inputs' },

  // ── ROUTING ──
  { namePattern: 'Capability-Aware Load Balancer', descriptionPattern: 'Routes requests based on provider capability profiles', category: 'routing', modulePattern: ['NEXUS', 'BRAIN', 'VISION'], entryPattern: 'capability-matcher', exitPattern: 'capability-routed', errorStrategy: 'fallback', maxExecutionMs: 500, baseBreakdown: { strategicLeverage: 88, recursionPotential: 75, crossNodeImpact: 85, composability: 90, governanceInfluence: 62, moatSensitivity: 85 }, discoveredBy: 'reactor', rationale: 'Capability-aware routing outperforms round-robin' },
  { namePattern: 'Quality-of-Service Enforcer', descriptionPattern: 'Runtime QoS enforcement with priority queuing and resource reservation', category: 'routing', modulePattern: ['NEXUS', 'GOVERNANCE', 'SYSTEM'], entryPattern: 'qos-classifier', exitPattern: 'qos-enforced', errorStrategy: 'fallback', maxExecutionMs: 200, baseBreakdown: { strategicLeverage: 85, recursionPotential: 68, crossNodeImpact: 85, composability: 80, governanceInfluence: 82, moatSensitivity: 82 }, discoveredBy: 'reactor', rationale: 'QoS enforcement prevents priority inversion and ensures SLA compliance under load' },

  // ── LEARNING ──
  { namePattern: 'Meta-Learning Optimizer', descriptionPattern: 'Learns optimal learning strategies from learning history — learning to learn faster', category: 'learning', modulePattern: ['BRAIN', 'DREAM', 'CORTEX', 'EVOLUTION'], entryPattern: 'meta-learner', exitPattern: 'learning-strategy-optimized', errorStrategy: 'skip', maxExecutionMs: 15000, baseBreakdown: { strategicLeverage: 95, recursionPotential: 98, crossNodeImpact: 85, composability: 82, governanceInfluence: 65, moatSensitivity: 96 }, discoveredBy: 'reactor', rationale: 'Meta-learning is the ultimate force multiplier — every improvement compounds' },
  { namePattern: 'Knowledge Crystallization Engine', descriptionPattern: 'Converts fluid experiential knowledge into stable, reusable crystallized structures', category: 'learning', modulePattern: ['BRAIN', 'DREAM', 'MEMORY'], entryPattern: 'experience-distiller', exitPattern: 'knowledge-crystallized', errorStrategy: 'retry', maxExecutionMs: 10000, baseBreakdown: { strategicLeverage: 90, recursionPotential: 92, crossNodeImpact: 82, composability: 85, governanceInfluence: 62, moatSensitivity: 92 }, discoveredBy: 'reactor', rationale: 'Crystallized knowledge persists across sessions' },

  // ── ORCHESTRATION ──
  { namePattern: 'Elastic Pipeline Scaler', descriptionPattern: 'Auto-scales pipeline parallelism based on workload prediction and resource availability', category: 'orchestration', modulePattern: ['CORTEX', 'SYSTEM', 'ANALYTICS', 'NEXUS'], entryPattern: 'workload-predictor', exitPattern: 'pipeline-scaled', errorStrategy: 'fallback', maxExecutionMs: 2000, baseBreakdown: { strategicLeverage: 88, recursionPotential: 78, crossNodeImpact: 90, composability: 85, governanceInfluence: 68, moatSensitivity: 85 }, discoveredBy: 'reactor', rationale: 'Elastic scaling prevents both over-provisioning waste and under-provisioning bottlenecks' },
  { namePattern: 'Workflow Checkpoint Manager', descriptionPattern: 'Automatic checkpoint creation and restoration for long-running workflows', category: 'orchestration', modulePattern: ['CORTEX', 'SYSTEM', 'BRAIN'], entryPattern: 'checkpoint-creator', exitPattern: 'checkpoint-managed', errorStrategy: 'rollback', maxExecutionMs: 5000, baseBreakdown: { strategicLeverage: 88, recursionPotential: 72, crossNodeImpact: 85, composability: 82, governanceInfluence: 72, moatSensitivity: 85 }, discoveredBy: 'reactor', rationale: 'Checkpointing prevents total work loss from mid-pipeline failures' },

  // ── OBSERVABILITY ──
  { namePattern: 'Emergent Behavior Detector', descriptionPattern: 'Detects unexpected emergent behaviors from multi-module interactions via statistical anomaly detection', category: 'observability', modulePattern: ['VISION', 'ANALYTICS', 'CORTEX'], entryPattern: 'emergence-scanner', exitPattern: 'emergence-classified', errorStrategy: 'skip', maxExecutionMs: 8000, baseBreakdown: { strategicLeverage: 92, recursionPotential: 85, crossNodeImpact: 90, composability: 75, governanceInfluence: 78, moatSensitivity: 92 }, discoveredBy: 'reactor', rationale: 'Emergent behaviors can be both opportunities and risks' },
  { namePattern: 'Decision Explanation Generator', descriptionPattern: 'Generates human-readable explanations for autonomous decisions with confidence levels', category: 'observability', modulePattern: ['VISION', 'BRAIN', 'GOVERNANCE', 'DECODE'], entryPattern: 'decision-explainer', exitPattern: 'explanation-generated', errorStrategy: 'skip', maxExecutionMs: 5000, baseBreakdown: { strategicLeverage: 90, recursionPotential: 72, crossNodeImpact: 85, composability: 78, governanceInfluence: 92, moatSensitivity: 88 }, discoveredBy: 'reactor', rationale: 'Explainability is both a regulatory requirement and a trust-building necessity' },

  // ── GOVERNANCE ──
  { namePattern: 'Constitutional AI Guardian', descriptionPattern: 'Enforces constitutional constraints on autonomous behavior with graduated intervention', category: 'governance', modulePattern: ['GOVERNANCE', 'BRAIN', 'DEFENSE', 'CORTEX'], entryPattern: 'constitutional-checker', exitPattern: 'constitutional-verified', errorStrategy: 'abort', maxExecutionMs: 2000, baseBreakdown: { strategicLeverage: 95, recursionPotential: 78, crossNodeImpact: 92, composability: 70, governanceInfluence: 98, moatSensitivity: 95 }, discoveredBy: 'reactor', rationale: 'Constitutional constraints provide hard safety guarantees' },
  { namePattern: 'Risk Appetite Calibrator', descriptionPattern: 'Dynamic risk appetite adjustment based on operational context and stakes', category: 'governance', modulePattern: ['GOVERNANCE', 'BRAIN', 'ANALYTICS'], entryPattern: 'risk-context-analyzer', exitPattern: 'risk-appetite-set', errorStrategy: 'abort', maxExecutionMs: 2000, baseBreakdown: { strategicLeverage: 90, recursionPotential: 80, crossNodeImpact: 85, composability: 78, governanceInfluence: 92, moatSensitivity: 90 }, discoveredBy: 'reactor', rationale: 'Context-aware risk management improves both safety and performance' },

  // ── COMPLIANCE (SOVEREIGN) ──
  { namePattern: 'Jurisdiction Classifier', descriptionPattern: 'Auto-classifies data and operations by legal jurisdiction with regulatory mapping', category: 'compliance', modulePattern: ['SOVEREIGN', 'GOVERNANCE', 'ANALYTICS', 'AUDIT'], entryPattern: 'jurisdiction-scanner', exitPattern: 'jurisdiction-classified', errorStrategy: 'abort', maxExecutionMs: 3000, baseBreakdown: { strategicLeverage: 92, recursionPotential: 72, crossNodeImpact: 90, composability: 75, governanceInfluence: 95, moatSensitivity: 92 }, discoveredBy: 'reactor', rationale: 'Jurisdiction-aware operations are mandatory for global compliance' },
  { namePattern: 'Compliance Attestation Engine', descriptionPattern: 'Generates cryptographically signed compliance attestations with full audit provenance', category: 'compliance', modulePattern: ['SOVEREIGN', 'AUDIT', 'DEFENSE', 'GOVERNANCE'], entryPattern: 'attestation-builder', exitPattern: 'attestation-signed', errorStrategy: 'abort', maxExecutionMs: 2000, baseBreakdown: { strategicLeverage: 88, recursionPotential: 65, crossNodeImpact: 85, composability: 70, governanceInfluence: 98, moatSensitivity: 88 }, discoveredBy: 'reactor', rationale: 'Signed attestations provide non-repudiable compliance evidence' },

  // ── PREDICTION (ORACLE) ──
  { namePattern: 'Anomaly Prediction Network', descriptionPattern: 'Predicts anomalies before they occur using temporal pattern analysis and precursor detection', category: 'prediction', modulePattern: ['ORACLE', 'VISION', 'ANALYTICS', 'BRAIN'], entryPattern: 'precursor-detector', exitPattern: 'anomaly-predicted', errorStrategy: 'skip', maxExecutionMs: 8000, baseBreakdown: { strategicLeverage: 95, recursionPotential: 85, crossNodeImpact: 90, composability: 78, governanceInfluence: 72, moatSensitivity: 95 }, discoveredBy: 'reactor', rationale: 'Predicting anomalies transforms reactive monitoring into proactive prevention' },
  { namePattern: 'Bayesian Demand Forecaster', descriptionPattern: 'Probabilistic demand forecasting with uncertainty quantification', category: 'prediction', modulePattern: ['ORACLE', 'ANALYTICS', 'BRAIN', 'CORTEX'], entryPattern: 'demand-modeler', exitPattern: 'forecast-generated', errorStrategy: 'skip', maxExecutionMs: 15000, baseBreakdown: { strategicLeverage: 92, recursionPotential: 88, crossNodeImpact: 85, composability: 82, governanceInfluence: 68, moatSensitivity: 92 }, discoveredBy: 'reactor', rationale: 'Probabilistic forecasting enables better resource allocation than point estimates' },

  // ── ETHICS (CONSCIENCE) ──
  { namePattern: 'Ethical Impact Assessor', descriptionPattern: 'Multi-stakeholder ethical impact assessment with bias detection and fairness scoring', category: 'ethics', modulePattern: ['CONSCIENCE', 'BRAIN', 'GOVERNANCE', 'CORTEX'], entryPattern: 'ethics-scanner', exitPattern: 'impact-assessed', errorStrategy: 'abort', maxExecutionMs: 5000, baseBreakdown: { strategicLeverage: 92, recursionPotential: 78, crossNodeImpact: 90, composability: 72, governanceInfluence: 98, moatSensitivity: 92 }, discoveredBy: 'reactor', rationale: 'Ethical assessment prevents harm — mandatory for responsible autonomous operation' },

  // ── PRIVACY (PHANTOM) ──
  { namePattern: 'Differential Privacy Injector', descriptionPattern: 'Applies calibrated differential privacy noise while preserving statistical utility', category: 'privacy', modulePattern: ['PHANTOM', 'ANALYTICS', 'BRAIN', 'CORTEX'], entryPattern: 'privacy-calibrator', exitPattern: 'dp-noise-injected', errorStrategy: 'abort', maxExecutionMs: 3000, baseBreakdown: { strategicLeverage: 92, recursionPotential: 78, crossNodeImpact: 85, composability: 75, governanceInfluence: 90, moatSensitivity: 95 }, discoveredBy: 'reactor', rationale: 'Differential privacy provides mathematical guarantees against re-identification' },

  // ── SYNTHESIS (FORGE) ──
  { namePattern: 'Component Synthesis Engine', descriptionPattern: 'Generates new module components by recombining proven patterns from the capability registry', category: 'synthesis', modulePattern: ['FORGE', 'BRAIN', 'EVOLUTION', 'CORTEX'], entryPattern: 'pattern-combiner', exitPattern: 'component-synthesized', errorStrategy: 'rollback', maxExecutionMs: 15000, baseBreakdown: { strategicLeverage: 95, recursionPotential: 95, crossNodeImpact: 88, composability: 90, governanceInfluence: 65, moatSensitivity: 96 }, discoveredBy: 'reactor', rationale: 'Automated component synthesis — the system builds itself' },
  { namePattern: 'Cross-Domain Fusion Reactor', descriptionPattern: 'Fuses capabilities from disparate domains into novel hybrid pipelines', category: 'synthesis', modulePattern: ['FORGE', 'DREAM', 'CORTEX', 'INTEGRATION'], entryPattern: 'domain-analyzer', exitPattern: 'fusion-complete', errorStrategy: 'rollback', maxExecutionMs: 20000, baseBreakdown: { strategicLeverage: 92, recursionPotential: 92, crossNodeImpact: 90, composability: 85, governanceInfluence: 62, moatSensitivity: 95 }, discoveredBy: 'reactor', rationale: 'Cross-domain fusion creates capabilities no single domain could produce' },

  // ── SIMULATION (ECHO) ──
  { namePattern: 'Digital Twin Orchestrator', descriptionPattern: 'Creates and maintains digital twins for safe experimentation and regression testing', category: 'simulation', modulePattern: ['ECHO', 'SYSTEM', 'CORTEX', 'VISION'], entryPattern: 'twin-builder', exitPattern: 'twin-synchronized', errorStrategy: 'rollback', maxExecutionMs: 15000, baseBreakdown: { strategicLeverage: 92, recursionPotential: 88, crossNodeImpact: 90, composability: 82, governanceInfluence: 72, moatSensitivity: 92 }, discoveredBy: 'reactor', rationale: 'Digital twins enable risk-free experimentation' },
  { namePattern: 'Chaos Scenario Simulator', descriptionPattern: 'Simulates cascading failure scenarios to validate system resilience', category: 'simulation', modulePattern: ['ECHO', 'DEFENSE', 'SYSTEM', 'ANALYTICS'], entryPattern: 'chaos-injector', exitPattern: 'resilience-scored', errorStrategy: 'rollback', maxExecutionMs: 20000, baseBreakdown: { strategicLeverage: 90, recursionPotential: 82, crossNodeImpact: 92, composability: 75, governanceInfluence: 78, moatSensitivity: 90 }, discoveredBy: 'reactor', rationale: 'Proactive chaos engineering prevents cascading failures' },

  // ── CONTRACTS (TREATY) ──
  { namePattern: 'Machine-to-Machine Contract Broker', descriptionPattern: 'Negotiates, validates, and enforces SLAs between autonomous modules', category: 'contracts', modulePattern: ['TREATY', 'GOVERNANCE', 'ACCESS', 'AUDIT'], entryPattern: 'sla-negotiator', exitPattern: 'contract-enforced', errorStrategy: 'abort', maxExecutionMs: 3000, baseBreakdown: { strategicLeverage: 88, recursionPotential: 78, crossNodeImpact: 88, composability: 80, governanceInfluence: 92, moatSensitivity: 88 }, discoveredBy: 'reactor', rationale: 'Formal inter-module contracts prevent silent degradation' },

  // ── EDGE (REFLEX) ──
  { namePattern: 'Edge Decision Accelerator', descriptionPattern: 'Sub-millisecond decision routing at the edge with local model inference', category: 'edge', modulePattern: ['REFLEX', 'NEXUS', 'CORTEX', 'SYSTEM'], entryPattern: 'edge-classifier', exitPattern: 'edge-decision-made', errorStrategy: 'fallback', maxExecutionMs: 100, baseBreakdown: { strategicLeverage: 90, recursionPotential: 75, crossNodeImpact: 85, composability: 85, governanceInfluence: 62, moatSensitivity: 90 }, discoveredBy: 'reactor', rationale: 'Edge-first decisions eliminate network latency for time-critical operations' },
];

// ═══════════════════════════════════════════════════════════════════════════════
// DISCOVERY ENGINE FACTORY
// ═══════════════════════════════════════════════════════════════════════════════

export function createDiscoveryEngine(runtime: StandaloneRuntime) {
  const { storage, computeCJPI, autoAssignTier, computeSynergyMultiplier, computeStableId } = runtime;

  /**
   * Run the discovery reactor — generates, scores, tiers, deduplicates, and persists discoveries.
   * Fully standalone. No substrate required.
   */
  async function run(config: DiscoveryConfig): Promise<DiscoveryRunResult> {
    const startTime = Date.now();
    const runId = `run-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    // Acquire lock
    const locked = runtime.locks.acquire('discovery', runId);
    if (!locked) {
      return {
        runId, status: 'failed', totalCandidates: 0, acceptedCount: 0, skippedCount: 0,
        topFind: null, discoveries: [], byCategory: {}, byTier: {},
        dryRun: config.dryRun, durationMs: Date.now() - startTime,
        error: 'Another discovery run is in progress.',
      };
    }

    try {
      // Load known IDs for deduplication
      const existingDiscoveries = await storage.list<{ id: string }>('discoveries');
      const knownIds = new Set(existingDiscoveries.map(d => d.id));

      const existingPromotions = await storage.list<{ id: string; discoveryId: string }>('promotions');
      const promotedIds = new Set(existingPromotions.map(p => p.discoveryId));

      // Merge built-in + injected templates
      const allTemplates = [...BUILTIN_TEMPLATES, ...(config.injectedTemplates || [])];

      // Filter by category if specified
      const filteredTemplates = config.categories
        ? allTemplates.filter(t => config.categories!.includes(t.category))
        : allTemplates;

      // Generate candidates
      const candidates: DiscoveryCandidate[] = [];
      let skippedCount = 0;
      const minCjpi = config.minCjpi ?? 80;

      for (const template of filteredTemplates) {
        const stableId = computeStableId(template.namePattern, template.modulePattern, template.category);

        // Skip already known
        if (knownIds.has(stableId) || promotedIds.has(stableId)) {
          skippedCount++;
          continue;
        }

        const baseCjpi = computeCJPI(template.baseBreakdown);
        const synergy = computeSynergyMultiplier(template.modulePattern);
        const finalCjpi = Math.round(Math.min(100, baseCjpi * synergy) * 10) / 10;
        const tier = autoAssignTier(finalCjpi);

        if (finalCjpi < minCjpi) continue;

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
          synergyMultiplier: synergy,
          discoveredBy: template.discoveredBy,
          rationale: template.rationale,
        });
      }

      // Sort by CJPI descending
      candidates.sort((a, b) => b.cjpi - a.cjpi);

      // Apply topN limit
      const accepted = config.topN ? candidates.slice(0, config.topN) : candidates;

      // Compute stats
      const byCategory: Record<string, number> = {};
      const byTier: Record<string, number> = {};
      for (const c of accepted) {
        byCategory[c.category] = (byCategory[c.category] || 0) + 1;
        byTier[c.tier || 'untiered'] = (byTier[c.tier || 'untiered'] || 0) + 1;
      }

      const topFind = accepted.length > 0 ? { name: accepted[0].name, cjpi: accepted[0].cjpi } : null;

      // Persist (unless dry run)
      if (!config.dryRun) {
        // Persist run metadata
        await storage.put('runs', {
          id: runId,
          status: 'completed',
          totalCandidates: candidates.length,
          acceptedCount: accepted.length,
          topFind,
          durationMs: Date.now() - startTime,
          createdAt: new Date().toISOString(),
        });

        // Persist discoveries
        await storage.putMany('discoveries', accepted.map(c => ({
          id: c.id,
          runId,
          name: c.name,
          description: c.description,
          category: c.category,
          tier: c.tier,
          cjpi: c.cjpi,
          moduleChain: c.moduleChain,
          entryCapability: c.entryCapability,
          exitCapability: c.exitCapability,
          errorStrategy: c.errorStrategy,
          maxExecutionMs: c.maxExecutionMs,
          cjpiBreakdown: c.cjpiBreakdown,
          synergyMultiplier: c.synergyMultiplier,
          discoveredBy: c.discoveredBy,
          rationale: c.rationale,
          discoveredAt: new Date().toISOString(),
        })));

        // Auto-promote CJPI ≥ 90
        const promotable = accepted.filter(c => c.cjpi >= 90 && c.tier);
        if (promotable.length > 0) {
          await storage.putMany('promotions', promotable.map(c => ({
            id: `promo-${c.id}`,
            discoveryId: c.id,
            runId,
            name: c.name,
            cjpi: c.cjpi,
            tier: c.tier,
            moduleChain: c.moduleChain,
            promotedAt: new Date().toISOString(),
          })));
        }
      }

      return {
        runId,
        status: 'completed',
        totalCandidates: candidates.length,
        acceptedCount: accepted.length,
        skippedCount,
        topFind,
        discoveries: accepted,
        byCategory,
        byTier,
        dryRun: config.dryRun,
        durationMs: Date.now() - startTime,
      };
    } catch (err: unknown) {
      return {
        runId, status: 'failed', totalCandidates: 0, acceptedCount: 0, skippedCount: 0,
        topFind: null, discoveries: [], byCategory: {}, byTier: {},
        dryRun: config.dryRun, durationMs: Date.now() - startTime,
        error: err instanceof Error ? err.message : String(err),
      };
    } finally {
      runtime.locks.release('discovery');
    }
  }

  /** Get all previously discovered candidates */
  async function getDiscoveries(): Promise<DiscoveryCandidate[]> {
    return storage.list<DiscoveryCandidate>('discoveries');
  }

  /** Get promoted (CJPI ≥ 90) discoveries */
  async function getPromotions(): Promise<unknown[]> {
    return storage.list('promotions');
  }

  /** Get discovery run history */
  async function getRunHistory(): Promise<unknown[]> {
    return storage.list('runs');
  }

  /** Add custom templates for the next reactor run */
  function createTemplate(template: SynthesisTemplate): SynthesisTemplate {
    return template;
  }

  /** Get the built-in template count */
  function getBuiltinTemplateCount(): number {
    return BUILTIN_TEMPLATES.length;
  }

  return {
    run,
    getDiscoveries,
    getPromotions,
    getRunHistory,
    createTemplate,
    getBuiltinTemplateCount,
    BUILTIN_TEMPLATES,
  };
}
