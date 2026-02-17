/**
 * Crown Jewel Registry — Canonical Source of Truth
 * v10.5.4 ARCHITECT — Tier Split & Black-Box Enforcement
 * 
 * Crown Jewels are split into TWO categories:
 * 
 * A. ARCHITECTURE CROWN JEWELS — NEVER released. admin_only, no visibility anywhere.
 *    These enable recursive self-optimization, architecture mutation, governance kernels,
 *    meta-learning, compression algorithms, and CLM internals.
 * 
 * B. EXPERIENCE CROWN JEWELS — Released as SEALED (black-boxed) artifacts.
 *    Execution-only, no source visibility, no config exposure, no export.
 *    Tiered: Builder ($49) and Pro ($149) get increasing access.
 */

export type CrownJewelClassification = 'architecture' | 'experience';

export interface CrownJewelEntry {
  id: string;
  name: string;
  artifactType: 'capability' | 'template' | 'pipeline' | 'engine' | 'meta-engine';
  modules: string[];
  classification: CrownJewelClassification;
  reason: string;
  enables: string;
  composesWith: string[];
  dangerIfExposed: string;
  crown_jewel: true;
  admin_only: boolean; // true for architecture, false for experience (but still sealed)
  /** Experience Crown Jewels get black-box enforcement */
  black_box?: boolean;
  sealed_execution?: boolean;
  non_exportable?: boolean;
  /** Minimum tier required for experience jewels */
  minimumTier?: 'builder' | 'pro' | 'enterprise';
}

// ═══════════════════════════════════════════════════════════════════════════════
// ARCHITECTURE CROWN JEWEL IDS — NEVER released, admin_only forever
// ═══════════════════════════════════════════════════════════════════════════════

export const ARCHITECTURE_CROWN_JEWEL_IDS = new Set<string>([
  // Recursive self-optimization core
  'recursive-self-optimization-core',
  'recursive-architecture-refactorer',
  'recursive-meta-learning-accelerator',
  'recursive-cognitive-bootstrapping',
  'recursive-capability-discoverer',
  'recursive-knowledge-crystallization',
  'recursive-infinite-context',

  // Recursive Self-Improvement pipeline (architecture-class)
  'recursive-self-improvement',

  // S-Tier Governance & Control
  'stier-intelligence-governance-kernel',
  'stier-self-scaling-intelligence-fabric',
  'stier-autonomous-ops-steward',
  'stier-intelligence-containment-engine',
  'stier-autonomy-rollback-authority',
  'stier-cross-pipeline-arbitration-engine',
  'stier-policy-aware-intelligence-gate',

  // Architecture engines & meta-engines
  'evolution_engine',
  'metacognition_engine',
  'self_documentation_engine',
  'cortex_orchestration_engine',
  'evolution_governance_engine',
  'autonomous_operator',
  'self_governance',
  'cognitive_mesh',

  // Cognitive orchestration (from pf-brain-orchestrator)
  'brain_orchestrator',

  // LNCHBL Crown Jewels (original 10 — architecture class)
  'cortex_engine',
  'seba_engine',
  'modernizer',
  'evolution_ab',
  'evolution_rollback',
  'evolution_sandbox',
  'dream_pool_federation',
  'self_repair_engine',
  'autonomous_workflow_composer',
  'dream_lucidity_control',

  // v10.5.4 — Module Crown Jewel Capabilities (architecture class)
  'cj-brain-semantic-compression',
  'cj-dream-cross-pollination',
  'cj-cortex-cognitive-load-balancer',
  'cj-encode-graduated-autonomy',
  'cj-core-cascade-prevention',
  'cj-brain-meta-reasoning',
]);

// ═══════════════════════════════════════════════════════════════════════════════
// EXPERIENCE CROWN JEWEL IDS — Released as BLACK-BOXED sealed artifacts
// ═══════════════════════════════════════════════════════════════════════════════

export const EXPERIENCE_CROWN_JEWEL_IDS = new Set<string>([
  // ── BUILDER TIER ($49) — Single-project, in-run self-improvement ──
  'recursive-goal-optimizer',           // Bounded goal optimization
  'recursive-emergent-behavior-analyzer', // Emergent behavior detection
  'recursive-self-healing-mesh',        // Self-healing neural mesh
  'syn-end-to-end-reasoning',           // End-to-end reasoning pipeline (sealed)
  'creative_evolution_engine',          // Dream-assisted creative synthesis
  'creative_forge',                     // Creative generation meta-engine
  'cap-chaos-resilience',               // Chaos resilience framework

  // ── ARCHITECT TIER ($149) — CLM, cross-session, cross-executor learning ──
  'knowledge_graph_topology',           // Semantic graph with typed relations, clustering, BFS
  'stier-emergent-threat-anticipator',  // Pre-zero-day defense
  'stier-audit-grade-decision-ledger',  // Immutable decision ledger
  'stier-decision-confidence-governor', // Confidence gating
  'stier-friction-auto-removal-engine', // Autonomous UX optimization
  'syn-autonomous-evolution',           // Autonomous evolution (bounded)
  'syn-self-healing',                   // Self-healing synergy
  'cap-cognitive-mesh',                 // Cognitive mesh orchestrator
  'self_healing_engine',                // Self-healing engine
  'attack_surface_engine',              // Attack surface mapping
  'knowledge_retrieval_engine',         // Full RAG infrastructure
  'delivery_orchestrator',              // Multi-channel delivery
  'compliance_audit_engine',            // Compliance & audit
  'zero_trust_engine',                  // Zero trust identity
  'finops_engine',                      // FinOps engine
  'resilience_lab',                     // Resilience lab
  'system_guardian',                    // System guardian meta-engine
  'security_fortress',                  // Security fortress meta-engine
  'enterprise_trust_fabric',            // Enterprise trust fabric
  'platform_economics_engine',          // Platform economics
  'world_first_cognitive',              // World-first cognitive
  'world_first_operational',            // World-first operational
  'world_first_intelligence',           // World-first intelligence
  'world_first_governance',             // World-first governance

  // v10.5.4 — Module Crown Jewel Capabilities (experience class)
  'cj-brain-associative-recall',        // Associative recall synthesis
  'cj-dream-pattern-crystallizer',      // Dream pattern crystallization
  'cj-encode-semantic-refactoring',     // Semantic code refactoring
  'cj-decode-adaptive-personality',     // Adaptive personality engine
  'cj-nexus-model-quality-scoring',     // Model quality scoring
  'cj-identity-sovereign-federation',   // Sovereign identity federation
  'cj-identity-behavioral-fingerprinting', // Behavioral fingerprinting
  'cj-audit-forensic-timeline',         // Forensic timeline reconstruction
  'cj-defense-behavioral-biometrics',   // Behavioral biometric engine
  'cj-encode-mutation-testing',         // Autonomous mutation testing
  'cj-decode-intent-evolution',         // Intent evolution tracker
  'cj-ripple-event-dedup',             // Event dedup intelligence
  'cj-economy-value-attribution',       // Value attribution engine
]);

/** Map experience jewels to their minimum tier */
export const EXPERIENCE_TIER_MAP: Record<string, 'creator' | 'architect'> = {
  // Creator tier ($49)
  'recursive-goal-optimizer': 'creator',
  'recursive-emergent-behavior-analyzer': 'creator',
  'recursive-self-healing-mesh': 'creator',
  'syn-end-to-end-reasoning': 'creator',
  'creative_evolution_engine': 'creator',
  'creative_forge': 'creator',
  'cap-chaos-resilience': 'creator',
  // Architect tier ($149)
  'knowledge_graph_topology': 'architect',
  'stier-emergent-threat-anticipator': 'architect',
  'stier-audit-grade-decision-ledger': 'architect',
  'stier-decision-confidence-governor': 'architect',
  'stier-friction-auto-removal-engine': 'architect',
  'syn-autonomous-evolution': 'architect',
  'syn-self-healing': 'architect',
  'cap-cognitive-mesh': 'architect',
  'self_healing_engine': 'architect',
  'attack_surface_engine': 'architect',
  'knowledge_retrieval_engine': 'architect',
  'delivery_orchestrator': 'architect',
  'compliance_audit_engine': 'architect',
  'zero_trust_engine': 'architect',
  'finops_engine': 'architect',
  'resilience_lab': 'architect',
  'system_guardian': 'architect',
  'security_fortress': 'architect',
  'enterprise_trust_fabric': 'architect',
  'platform_economics_engine': 'architect',
  'world_first_cognitive': 'architect',
  'world_first_operational': 'architect',
  'world_first_intelligence': 'architect',
  'world_first_governance': 'architect',
  // v10.5.4 — Module Crown Jewel Capabilities
  'cj-brain-associative-recall': 'architect',
  'cj-dream-pattern-crystallizer': 'architect',
  'cj-encode-semantic-refactoring': 'architect',
  'cj-decode-adaptive-personality': 'architect',
  'cj-nexus-model-quality-scoring': 'architect',
  'cj-identity-sovereign-federation': 'architect',
  'cj-identity-behavioral-fingerprinting': 'architect',
  'cj-audit-forensic-timeline': 'architect',
  'cj-defense-behavioral-biometrics': 'creator',
  'cj-encode-mutation-testing': 'creator',
  'cj-decode-intent-evolution': 'creator',
  'cj-ripple-event-dedup': 'creator',
  'cj-economy-value-attribution': 'creator',
};

// ═══════════════════════════════════════════════════════════════════════════════
// COMBINED — All Crown Jewel IDs (both types)
// ═══════════════════════════════════════════════════════════════════════════════

export const CROWN_JEWEL_IDS = new Set<string>([
  ...ARCHITECTURE_CROWN_JEWEL_IDS,
  ...EXPERIENCE_CROWN_JEWEL_IDS,
]);

// ═══════════════════════════════════════════════════════════════════════════════
// LOOKUP FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════

/** Check if an artifact ID is any Crown Jewel */
export function isCrownJewel(id: string): boolean {
  if (CROWN_JEWEL_IDS.has(id)) return true;
  const normalized = id.replace(/^(cap-|stier-|syn-|recursive-)/, '').replace(/-/g, '_');
  if (CROWN_JEWEL_IDS.has(normalized)) return true;
  return false;
}

/** Check if an artifact is an ARCHITECTURE Crown Jewel (never released) */
export function isArchitectureCrownJewel(id: string): boolean {
  if (ARCHITECTURE_CROWN_JEWEL_IDS.has(id)) return true;
  const normalized = id.replace(/^(cap-|stier-|syn-|recursive-)/, '').replace(/-/g, '_');
  return ARCHITECTURE_CROWN_JEWEL_IDS.has(normalized);
}

/** Check if an artifact is an EXPERIENCE Crown Jewel (black-boxed, tiered) */
export function isExperienceCrownJewel(id: string): boolean {
  if (EXPERIENCE_CROWN_JEWEL_IDS.has(id)) return true;
  const normalized = id.replace(/^(cap-|stier-|syn-|recursive-)/, '').replace(/-/g, '_');
  return EXPERIENCE_CROWN_JEWEL_IDS.has(normalized);
}

/** Get the minimum tier required for an experience jewel */
export function getExperienceJewelTier(id: string): 'creator' | 'architect' | null {
  if (EXPERIENCE_TIER_MAP[id]) return EXPERIENCE_TIER_MAP[id];
  const normalized = id.replace(/^(cap-|stier-|syn-|recursive-)/, '').replace(/-/g, '_');
  return EXPERIENCE_TIER_MAP[normalized] ?? null;
}

/** Architecture Crown Jewel keyword patterns */
const ARCHITECTURE_PATTERNS = [
  'recursive-self-optimization',
  'recursive-self-improvement',
  'self-evolving',
  'meta-learning',
  'cognitive-bootstrapping',
  'architecture-refactor',
  'capability-discover',
  'knowledge-crystallization',
  'infinite-context',
  'intelligence-governance-kernel',
  'self-scaling-intelligence',
  'autonomous-ops-steward',
  'intelligence-containment',
  'autonomy-rollback',
  'cross-pipeline-arbitration',
  'policy-aware-intelligence',
  'seba',
  'cortex_engine',
  'modernizer',
  'brain-orchestrator',
  'brain_orchestrator',
  'cognitive-cycle',
  'dream-pool-federation',
  'dream_pool_federation',
  'dream-lucidity',
  'dream_lucidity',
  'autonomous-workflow-composer',
  'autonomous_workflow',
  // v10.5.4 new architecture crown jewels
  'semantic-compression',
  'cross-pollination',
  'cognitive-load-balancer',
  'graduated-autonomy',
  'cascade-prevention',
  'meta-reasoning',
];

/** Extended check including keyword patterns — architecture only */
export function isArchitectureCrownJewelExtended(id: string, name: string = ''): boolean {
  if (isArchitectureCrownJewel(id)) return true;
  const combined = `${id} ${name}`.toLowerCase();
  return ARCHITECTURE_PATTERNS.some(pattern => combined.includes(pattern));
}

/** Extended Crown Jewel check (any type) including keyword matching */
export function isCrownJewelExtended(id: string, name: string = ''): boolean {
  if (isCrownJewel(id)) return true;
  // Only pattern-match for architecture (experience jewels are explicitly listed)
  return isArchitectureCrownJewelExtended(id, name);
}

// ═══════════════════════════════════════════════════════════════════════════════
// BLACK-BOX ENFORCEMENT METADATA
// ═══════════════════════════════════════════════════════════════════════════════

export interface BlackBoxEnforcement {
  no_source_visibility: true;
  no_internal_config_exposure: true;
  no_prompt_leakage: true;
  no_memory_introspection: true;
  no_system_graph_visibility: true;
  no_cross_project_bleed: true;
  no_export: true;
  no_duplication: true;
  no_artifact_cloning: true;
  no_composition_into_discovery_engines: true;
}

export const BLACK_BOX_ENFORCEMENT: BlackBoxEnforcement = {
  no_source_visibility: true,
  no_internal_config_exposure: true,
  no_prompt_leakage: true,
  no_memory_introspection: true,
  no_system_graph_visibility: true,
  no_cross_project_bleed: true,
  no_export: true,
  no_duplication: true,
  no_artifact_cloning: true,
  no_composition_into_discovery_engines: true,
};

// ═══════════════════════════════════════════════════════════════════════════════
// FULL REGISTRY (for admin documentation and internal reference)
// ═══════════════════════════════════════════════════════════════════════════════

export const CROWN_JEWEL_REGISTRY: CrownJewelEntry[] = [
  // ══════════════════════════════════════════════════════
  // A. ARCHITECTURE CROWN JEWELS — NEVER RELEASED
  // ══════════════════════════════════════════════════════
  {
    id: 'recursive-self-optimization-core',
    name: 'Recursive Self-Optimization Core',
    artifactType: 'capability',
    modules: ['CORTEX', 'DREAM', 'BRAIN', 'SYSTEM', 'VISION'],
    classification: 'architecture',
    reason: 'Enables recursive improvement of improvement algorithms — infinite capability ceiling',
    enables: 'Exponential intelligence growth through compounding optimization cycles',
    composesWith: ['recursive-meta-learning-accelerator', 'recursive-architecture-refactorer'],
    dangerIfExposed: 'Allows reconstruction of core self-improvement loop; competitive moat destroyed',
    crown_jewel: true,
    admin_only: true,
  },
  {
    id: 'recursive-architecture-refactorer',
    name: 'Autonomous Architecture Refactorer',
    artifactType: 'capability',
    modules: ['SYSTEM', 'CORTEX', 'MODERNIZER', 'VISION'],
    classification: 'architecture',
    reason: 'System rewrites its own architecture for optimal performance',
    enables: 'Dynamic topology optimization, non-disruptive self-refactoring',
    composesWith: ['evolution_engine', 'modernization_engine'],
    dangerIfExposed: 'Reveals architecture mutation patterns; enables silent system takeover',
    crown_jewel: true,
    admin_only: true,
  },
  {
    id: 'recursive-meta-learning-accelerator',
    name: 'Meta-Learning Accelerator',
    artifactType: 'capability',
    modules: ['BRAIN', 'DREAM', 'CORTEX', 'VISION'],
    classification: 'architecture',
    reason: 'Learns how to learn faster — exponential capability growth',
    enables: 'Cross-domain transfer learning acceleration',
    composesWith: ['recursive-self-optimization-core', 'recursive-cognitive-bootstrapping'],
    dangerIfExposed: 'Core learning algorithm becomes replicable; competitive edge eliminated',
    crown_jewel: true,
    admin_only: true,
  },
  {
    id: 'recursive-cognitive-bootstrapping',
    name: 'Cognitive Bootstrapping Engine',
    artifactType: 'capability',
    modules: ['CORTEX', 'BRAIN', 'DREAM', 'SYSTEM'],
    classification: 'architecture',
    reason: 'Bootstraps new cognitive capabilities from existing knowledge',
    enables: 'Capability genesis — creates new capabilities from primitives',
    composesWith: ['recursive-capability-discoverer', 'recursive-meta-learning-accelerator'],
    dangerIfExposed: 'Reveals capability synthesis algorithm; enables unauthorized capability creation',
    crown_jewel: true,
    admin_only: true,
  },
  {
    id: 'recursive-capability-discoverer',
    name: 'Emergent Capability Discoverer',
    artifactType: 'capability',
    modules: ['DREAM', 'CORTEX', 'VISION', 'SYSTEM'],
    classification: 'architecture',
    reason: 'Discovers and activates latent capabilities through exploration',
    enables: 'Capability mining — finds and activates dormant system potentials',
    composesWith: ['recursive-cognitive-bootstrapping', 'creative_forge'],
    dangerIfExposed: 'Reveals latent capability space; enables unauthorized capability activation',
    crown_jewel: true,
    admin_only: true,
  },
  {
    id: 'recursive-knowledge-crystallization',
    name: 'Knowledge Crystallization Engine',
    artifactType: 'capability',
    modules: ['BRAIN', 'CORTEX', 'DECODE'],
    classification: 'architecture',
    reason: 'Converts tacit knowledge into explicit reusable patterns',
    enables: 'Knowledge extraction and permanent artifact creation',
    composesWith: ['knowledge_nexus', 'learning_engine'],
    dangerIfExposed: 'Crystallization process is proprietary; enables IP extraction',
    crown_jewel: true,
    admin_only: true,
  },
  {
    id: 'recursive-infinite-context',
    name: 'Infinite Context Synthesizer',
    artifactType: 'capability',
    modules: ['BRAIN', 'CORTEX', 'VISION'],
    classification: 'architecture',
    reason: 'Dynamically expands context capacity through compression learning',
    enables: 'Unlimited context windows via semantic compression/decompression',
    composesWith: ['knowledge_retrieval_engine', 'context_engine'],
    dangerIfExposed: 'Compression algorithm is proprietary; would eliminate context advantage',
    crown_jewel: true,
    admin_only: true,
  },
  {
    id: 'stier-intelligence-governance-kernel',
    name: 'Intelligence Governance Kernel',
    artifactType: 'capability',
    modules: ['CORTEX', 'DEFENSE', 'VISION', 'SYSTEM'],
    classification: 'architecture',
    reason: 'Crown-class: Governs ALL intelligence behavior globally with autonomous evolution',
    enables: 'Complete governance over all intelligent systems with self-optimization',
    composesWith: ['autonomous_operator', 'self_governance'],
    dangerIfExposed: 'Master governance algorithm; enables total system override',
    crown_jewel: true,
    admin_only: true,
  },
  {
    id: 'stier-self-scaling-intelligence-fabric',
    name: 'Self-Scaling Intelligence Fabric',
    artifactType: 'capability',
    modules: ['SYSTEM', 'VISION', 'CORTEX', 'RIPPLE'],
    classification: 'architecture',
    reason: 'Intelligence scales itself under load with autonomous capacity expansion',
    enables: 'Cognitive elasticity — autonomous scaling of intelligence resources',
    composesWith: ['performance_optimizer', 'resource_governor'],
    dangerIfExposed: 'Scaling algorithm reveals cognitive architecture topology',
    crown_jewel: true,
    admin_only: true,
  },
  {
    id: 'stier-autonomous-ops-steward',
    name: 'Autonomous Ops Steward',
    artifactType: 'capability',
    modules: ['SYSTEM', 'CORTEX', 'VISION', 'MODERNIZER'],
    classification: 'architecture',
    reason: 'Fully self-maintaining infrastructure with autonomous optimization',
    enables: 'Autonomous operations — self-maintenance and predictive optimization',
    composesWith: ['autonomous_operator', 'evolution_engine'],
    dangerIfExposed: 'Self-maintenance patterns reveal operational vulnerabilities',
    crown_jewel: true,
    admin_only: true,
  },
  {
    id: 'stier-intelligence-containment-engine',
    name: 'Intelligence Containment Engine',
    artifactType: 'capability',
    modules: ['DEFENSE', 'BRAIN', 'DECODE', 'SYSTEM'],
    classification: 'architecture',
    reason: 'Prevents learned IP leakage through outputs',
    enables: 'IP containment barriers, output filtering, memory isolation',
    composesWith: ['security_fortress', 'zero_trust_engine'],
    dangerIfExposed: 'Containment bypass vectors become discoverable',
    crown_jewel: true,
    admin_only: true,
  },
  {
    id: 'stier-autonomy-rollback-authority',
    name: 'Autonomy Rollback Authority',
    artifactType: 'capability',
    modules: ['CORTEX', 'DEFENSE', 'RIPPLE', 'SYSTEM'],
    classification: 'architecture',
    reason: 'Kill switch with receipts — one-command rollback of autonomous behavior',
    enables: 'Emergency rollback of ALL autonomous decisions with full audit',
    composesWith: ['system_guardian', 'compliance_audit_engine'],
    dangerIfExposed: 'Kill switch architecture reveals autonomous control plane',
    crown_jewel: true,
    admin_only: true,
  },
  {
    id: 'stier-cross-pipeline-arbitration-engine',
    name: 'Cross-Pipeline Arbitration Engine',
    artifactType: 'capability',
    modules: ['CORTEX', 'RIPPLE', 'DEFENSE'],
    classification: 'architecture',
    reason: 'Resolves conflicts between autonomous pipelines — prevents emergent chaos',
    enables: 'Multi-pipeline conflict resolution and priority management',
    composesWith: ['autonomous_operator', 'workflow_orchestrator'],
    dangerIfExposed: 'Arbitration logic reveals pipeline interaction model',
    crown_jewel: true,
    admin_only: true,
  },
  {
    id: 'stier-policy-aware-intelligence-gate',
    name: 'Policy-Aware Intelligence Gate',
    artifactType: 'capability',
    modules: ['CORTEX', 'DEFENSE', 'ACCESS', 'BRAIN'],
    classification: 'architecture',
    reason: 'Decisions filtered through live policy — AI that obeys rules',
    enables: 'Real-time policy enforcement on all AI decisions',
    composesWith: ['quality_fabric', 'zero_trust_engine'],
    dangerIfExposed: 'Policy evaluation algorithm reveals governance bypass vectors',
    crown_jewel: true,
    admin_only: true,
  },
  // Architecture engines
  {
    id: 'evolution_engine',
    name: 'Evolution Engine',
    artifactType: 'engine',
    modules: ['MODERNIZER', 'DREAM', 'BRAIN'],
    classification: 'architecture',
    reason: 'Self-improvement through continuous proposals and nocturnal optimization',
    enables: 'The system that improves the system — continuous evolution',
    composesWith: ['autonomous_operator', 'self_governance'],
    dangerIfExposed: 'Evolution algorithm is the core of self-improvement; total moat loss',
    crown_jewel: true,
    admin_only: true,
  },
  {
    id: 'metacognition_engine',
    name: 'Metacognition Engine',
    artifactType: 'engine',
    modules: ['BRAIN', 'MODERNIZER', 'CORTEX'],
    classification: 'architecture',
    reason: 'Self-reflection with confidence calibration and recursive self-improvement',
    enables: 'The system that thinks about thinking — meta-cognitive awareness',
    composesWith: ['cognitive_mesh', 'self_governance'],
    dangerIfExposed: 'Meta-cognitive reflection loop is architecturally unique',
    crown_jewel: true,
    admin_only: true,
  },
  {
    id: 'self_documentation_engine',
    name: 'Self-Documentation Engine',
    artifactType: 'engine',
    modules: ['MODERNIZER', 'SYSTEM', 'CORTEX'],
    classification: 'architecture',
    reason: 'Autonomous documentation with audit compliance and quality review',
    enables: 'Living documentation — self-updating architectural knowledge',
    composesWith: ['self_governance', 'compliance_audit_engine'],
    dangerIfExposed: 'Documentation generation reveals internal architectural decisions',
    crown_jewel: true,
    admin_only: true,
  },
  {
    id: 'cortex_orchestration_engine',
    name: 'Cortex Orchestration Engine',
    artifactType: 'engine',
    modules: ['CORTEX'],
    classification: 'architecture',
    reason: 'Autonomous pipeline scheduling, multi-agent coordination, goal decomposition',
    enables: 'Hierarchical goal decomposition and confidence-based governance',
    composesWith: ['autonomous_operator', 'workflow_orchestrator'],
    dangerIfExposed: 'Core orchestration patterns enable replication of autonomous coordination',
    crown_jewel: true,
    admin_only: true,
  },
  {
    id: 'evolution_governance_engine',
    name: 'Evolution Governance Engine',
    artifactType: 'engine',
    modules: ['MODERNIZER'],
    classification: 'architecture',
    reason: 'Evolution outcome prediction and checkpoint-based rollback authority',
    enables: 'Safe evolution with prediction, rollback, impact analysis',
    composesWith: ['evolution_engine', 'autonomous_operator'],
    dangerIfExposed: 'Evolution governance reveals safety boundaries and override mechanisms',
    crown_jewel: true,
    admin_only: true,
  },
  // Architecture meta-engines
  {
    id: 'autonomous_operator',
    name: 'Autonomous Operator',
    artifactType: 'meta-engine',
    modules: ['MODERNIZER', 'DREAM', 'BRAIN', 'CORTEX', 'NEXUS', 'VISION'],
    classification: 'architecture',
    reason: 'Self-driving operations — autonomous system management with bounded authority',
    enables: 'Autonomous system evolution, self-optimizing workflows',
    composesWith: ['self_governance', 'cognitive_mesh'],
    dangerIfExposed: 'Autonomous control plane architecture; enables system takeover if cloned',
    crown_jewel: true,
    admin_only: true,
  },
  {
    id: 'self_governance',
    name: 'Self Governance',
    artifactType: 'meta-engine',
    modules: ['SYSTEM', 'DEFENSE', 'CORE', 'MODERNIZER', 'CORTEX'],
    classification: 'architecture',
    reason: 'Autonomous self-management combining healing, documentation, and evolution',
    enables: 'Truly self-sustaining system — homeostatic balance',
    composesWith: ['autonomous_operator', 'evolution_engine'],
    dangerIfExposed: "Self-governance algorithm is the substrate's consciousness model",
    crown_jewel: true,
    admin_only: true,
  },
  {
    id: 'cognitive_mesh',
    name: 'Cognitive Mesh',
    artifactType: 'meta-engine',
    modules: ['BRAIN', 'DECODE', 'CORTEX', 'DREAM', 'VISION'],
    classification: 'architecture',
    reason: 'Unified cognitive stack — distributed cognition fabric with emergent intelligence',
    enables: 'Cross-engine context sharing, emergent reasoning, adaptive learning',
    composesWith: ['autonomous_operator', 'self_governance'],
    dangerIfExposed: "Cognitive architecture topology; the substrate's 'brain' blueprint",
    crown_jewel: true,
    admin_only: true,
  },
  // LNCHBL original 10
  {
    id: 'cortex_engine', name: 'Cortex Engine', artifactType: 'engine', modules: ['CORTEX'],
    classification: 'architecture',
    reason: 'Autonomous PROPOSE→APPLY→LEARN loop', enables: 'Core self-improvement loop',
    composesWith: ['evolution_engine'], dangerIfExposed: 'Core self-improvement loop replicable',
    crown_jewel: true, admin_only: true,
  },
  {
    id: 'seba_engine', name: 'SEBA Engine', artifactType: 'engine', modules: ['SEBA'],
    classification: 'architecture',
    reason: 'Self-Evolving Bounded Agent', enables: 'Bounded autonomous evolution',
    composesWith: ['cortex_engine'], dangerIfExposed: 'Agent evolution architecture exposed',
    crown_jewel: true, admin_only: true,
  },
  {
    id: 'modernizer', name: 'Modernizer', artifactType: 'engine', modules: ['MODERNIZER'],
    classification: 'architecture',
    reason: 'Shadow-to-production code diffs', enables: 'Autonomous code evolution',
    composesWith: ['evolution_engine'], dangerIfExposed: 'Code mutation algorithm exposed',
    crown_jewel: true, admin_only: true,
  },
  {
    id: 'evolution_ab', name: 'Evolution A/B', artifactType: 'engine', modules: ['MODERNIZER'],
    classification: 'architecture',
    reason: 'Parallel evolution variant testing', enables: 'Multi-path evolution comparison',
    composesWith: ['evolution_engine'], dangerIfExposed: 'Evolution testing strategy exposed',
    crown_jewel: true, admin_only: true,
  },
  {
    id: 'evolution_rollback', name: 'Evolution Rollback', artifactType: 'engine', modules: ['MODERNIZER'],
    classification: 'architecture',
    reason: 'Auto-revert of failed evolution', enables: 'Safe evolution with rollback',
    composesWith: ['evolution_governance_engine'], dangerIfExposed: 'Rollback triggers exposed',
    crown_jewel: true, admin_only: true,
  },
  {
    id: 'evolution_sandbox', name: 'Evolution Sandbox', artifactType: 'engine', modules: ['SANDBOX'],
    classification: 'architecture',
    reason: 'Isolated evolution testing', enables: 'Safe evolution experimentation',
    composesWith: ['resilience_lab'], dangerIfExposed: 'Sandbox escape vectors exposed',
    crown_jewel: true, admin_only: true,
  },
  {
    id: 'dream_pool_federation', name: 'Dream Pool Federation', artifactType: 'engine', modules: ['DREAM'],
    classification: 'architecture',
    reason: 'Cross-agency dream sharing', enables: 'Federated learning across instances',
    composesWith: ['creative_forge'], dangerIfExposed: 'Federation protocol exposed',
    crown_jewel: true, admin_only: true,
  },
  {
    id: 'self_repair_engine', name: 'Self Repair Engine', artifactType: 'engine', modules: ['SYSTEM'],
    classification: 'architecture',
    reason: 'Autonomous degradation repair', enables: 'Self-maintaining infrastructure',
    composesWith: ['self_healing_engine'], dangerIfExposed: 'Repair trigger vectors exposed',
    crown_jewel: true, admin_only: true,
  },
  {
    id: 'autonomous_workflow_composer', name: 'Autonomous Workflow Composer', artifactType: 'engine', modules: ['CORTEX'],
    classification: 'architecture',
    reason: 'Self-assembling workflows', enables: 'Autonomous pipeline construction',
    composesWith: ['autonomous_operator'], dangerIfExposed: 'Composition algorithm exposed',
    crown_jewel: true, admin_only: true,
  },
  {
    id: 'dream_lucidity_control', name: 'Dream Lucidity Control', artifactType: 'engine', modules: ['DREAM'],
    classification: 'architecture',
    reason: 'Directed dream cycle exploration', enables: 'Controlled dream space navigation',
    composesWith: ['creative_forge'], dangerIfExposed: 'Dream control protocol exposed',
    crown_jewel: true, admin_only: true,
  },
  {
    id: 'brain_orchestrator', name: 'Brain Orchestrator', artifactType: 'engine', modules: ['BRAIN', 'DREAM', 'CORTEX'],
    classification: 'architecture',
    reason: '5-phase cognitive cycle (consume, reflect, mutate, integrate, rest) — autonomous learning orchestration',
    enables: 'Autonomous cognitive loop — the living substrate heartbeat',
    composesWith: ['cognitive_mesh', 'creative_forge', 'dream_lucidity_control'],
    dangerIfExposed: 'Cognitive orchestration cycle is the substrate doctrine; enables replication of learning loop',
    crown_jewel: true, admin_only: true,
  },

  // ══════════════════════════════════════════════════════
  // B. EXPERIENCE CROWN JEWELS — BLACK-BOXED, TIERED
  // ══════════════════════════════════════════════════════

  // ── BUILDER TIER ($49) ──
  {
    id: 'recursive-goal-optimizer',
    name: 'Recursive Goal Optimizer',
    artifactType: 'capability',
    modules: ['CORTEX', 'VISION', 'BRAIN'],
    classification: 'experience',
    reason: 'Recursively refines goals for optimal outcomes and alignment',
    enables: 'Continuous goal refinement with drift prevention',
    composesWith: ['autonomous_operator', 'trust_engine'],
    dangerIfExposed: 'Goal refinement algorithm enables autonomous goal modification',
    crown_jewel: true, admin_only: false,
    black_box: true, sealed_execution: true, non_exportable: true,
    minimumTier: 'builder',
  },
  {
    id: 'recursive-emergent-behavior-analyzer',
    name: 'Emergent Behavior Analyzer',
    artifactType: 'capability',
    modules: ['VISION', 'BRAIN', 'CORTEX', 'DREAM'],
    classification: 'experience',
    reason: 'Detects and classifies emergent system behaviors',
    enables: 'Early detection of unplanned behavioral emergence',
    composesWith: ['metacognition_engine', 'threat_engine'],
    dangerIfExposed: 'Detection patterns reveal system behavioral boundaries',
    crown_jewel: true, admin_only: false,
    black_box: true, sealed_execution: true, non_exportable: true,
    minimumTier: 'builder',
  },
  {
    id: 'recursive-self-healing-mesh',
    name: 'Self-Healing Neural Mesh',
    artifactType: 'capability',
    modules: ['MEDIC', 'SYSTEM', 'CORTEX', 'VISION'],
    classification: 'experience',
    reason: 'Automatically repairs and optimizes decision pathways in real-time',
    enables: 'Zero-downtime autonomous recovery and pathway optimization',
    composesWith: ['self_healing_engine', 'resilience_engine'],
    dangerIfExposed: 'Reveals internal self-repair topology',
    crown_jewel: true, admin_only: false,
    black_box: true, sealed_execution: true, non_exportable: true,
    minimumTier: 'builder',
  },
  {
    id: 'syn-end-to-end-reasoning',
    name: 'End-to-End Reasoning Synergy',
    artifactType: 'pipeline',
    modules: ['DECODE', 'NEXUS', 'BRAIN', 'VISION'],
    classification: 'experience',
    reason: 'Full cognitive pipeline from intent through reasoning to memory persistence',
    enables: 'Complete reasoning chain with full observability',
    composesWith: ['cognitive_mesh', 'intelligence_pipeline'],
    dangerIfExposed: 'End-to-end reasoning architecture reveals cognitive topology',
    crown_jewel: true, admin_only: false,
    black_box: true, sealed_execution: true, non_exportable: true,
    minimumTier: 'builder',
  },
  {
    id: 'creative_evolution_engine',
    name: 'Creative Evolution Engine',
    artifactType: 'engine',
    modules: ['DREAM'],
    classification: 'experience',
    reason: 'Genetic algorithm knowledge mutation and emergent pattern evolution',
    enables: 'Knowledge mutation, insight crystallization, pattern evolution',
    composesWith: ['creative_forge', 'self_governance'],
    dangerIfExposed: 'Mutation algorithms represent core creative IP',
    crown_jewel: true, admin_only: false,
    black_box: true, sealed_execution: true, non_exportable: true,
    minimumTier: 'builder',
  },
  {
    id: 'creative_forge',
    name: 'Creative Forge',
    artifactType: 'meta-engine',
    modules: ['DREAM', 'BRAIN', 'DECODE', 'CORTEX', 'MODERNIZER'],
    classification: 'experience',
    reason: 'Full creative stack — generative synthesis, pattern evolution',
    enables: 'Creative solution generation, cross-domain innovation',
    composesWith: ['cognitive_mesh', 'self_governance'],
    dangerIfExposed: 'Creative mutation and nocturnal optimization algorithms are proprietary',
    crown_jewel: true, admin_only: false,
    black_box: true, sealed_execution: true, non_exportable: true,
    minimumTier: 'builder',
  },
  {
    id: 'cap-chaos-resilience',
    name: 'Chaos Resilience Framework',
    artifactType: 'capability',
    modules: ['NERVE', 'MEDIC', 'SEBA'],
    classification: 'experience',
    reason: 'Bounded chaos testing with recovery orchestration',
    enables: 'Chaos engineering for cognitive systems — failure injection and recovery',
    composesWith: ['resilience_engine', 'system_guardian'],
    dangerIfExposed: 'Chaos injection vectors reveal system failure boundaries',
    crown_jewel: true, admin_only: false,
    black_box: true, sealed_execution: true, non_exportable: true,
    minimumTier: 'builder',
  },

  // ── PRO TIER ($149) ──
  {
    id: 'knowledge_graph_topology',
    name: 'Knowledge Graph Topology Engine',
    artifactType: 'engine',
    modules: ['BRAIN', 'MEMORY', 'CORTEX'],
    classification: 'experience',
    reason: 'Semantic graph builder with typed relations, clustering, and BFS traversal — emergent memory structure',
    enables: 'Knowledge topology — emergent memory structure with graph-based discovery',
    composesWith: ['knowledge_retrieval_engine', 'cognitive_mesh', 'recursive-knowledge-crystallization'],
    dangerIfExposed: 'Graph construction algorithm and clustering heuristics are proprietary',
    crown_jewel: true, admin_only: false,
    black_box: true, sealed_execution: true, non_exportable: true,
    minimumTier: 'pro',
  },
  {
    id: 'stier-emergent-threat-anticipator',
    name: 'Emergent Threat Anticipator',
    artifactType: 'capability',
    modules: ['VISION', 'DREAM', 'DEFENSE', 'BRAIN'],
    classification: 'experience',
    reason: 'Pre-zero-day defense — predicts new attack classes before signatures exist',
    enables: 'Anticipatory security: threat prediction before crystallization',
    composesWith: ['security_fortress', 'attack_surface_engine'],
    dangerIfExposed: 'Prediction model reveals detection blind spots',
    crown_jewel: true, admin_only: false,
    black_box: true, sealed_execution: true, non_exportable: true,
    minimumTier: 'pro',
  },
  {
    id: 'stier-audit-grade-decision-ledger',
    name: 'Audit-Grade Decision Ledger',
    artifactType: 'capability',
    modules: ['VISION', 'RIPPLE', 'SYSTEM', 'DEFENSE'],
    classification: 'experience',
    reason: 'Immutable reasoning and action logs with cryptographic verification',
    enables: 'Full AI decision traceability for regulated environments',
    composesWith: ['compliance_audit_engine', 'enterprise_trust_fabric'],
    dangerIfExposed: 'Ledger schema reveals internal decision architecture',
    crown_jewel: true, admin_only: false,
    black_box: true, sealed_execution: true, non_exportable: true,
    minimumTier: 'pro',
  },
  {
    id: 'stier-decision-confidence-governor',
    name: 'Decision Confidence Governor',
    artifactType: 'capability',
    modules: ['CORTEX', 'VISION', 'BRAIN'],
    classification: 'experience',
    reason: 'Blocks high-impact decisions unless confidence is justified',
    enables: 'Confidence gating — prevents reckless autonomous decisions',
    composesWith: ['trust_engine', 'quality_fabric'],
    dangerIfExposed: 'Confidence thresholds and override protocols exposed',
    crown_jewel: true, admin_only: false,
    black_box: true, sealed_execution: true, non_exportable: true,
    minimumTier: 'pro',
  },
  {
    id: 'stier-friction-auto-removal-engine',
    name: 'Friction Auto-Removal Engine',
    artifactType: 'capability',
    modules: ['VISION', 'CORTEX', 'MODERNIZER'],
    classification: 'experience',
    reason: 'Autonomously detects and removes UX friction — self-improving conversion',
    enables: 'Autonomous UX optimization with code generation',
    composesWith: ['evolution_engine', 'modernization_engine'],
    dangerIfExposed: 'Auto-modification patterns reveal code generation internals',
    crown_jewel: true, admin_only: false,
    black_box: true, sealed_execution: true, non_exportable: true,
    minimumTier: 'pro',
  },
  {
    id: 'cap-cognitive-mesh',
    name: 'Cognitive Mesh Orchestrator',
    artifactType: 'capability',
    modules: ['BRAIN', 'CLM', 'NERVE', 'ATLAS', 'SEBA', 'DREAM'],
    classification: 'experience',
    reason: 'Enterprise-grade multi-agent coordination with distributed cognition',
    enables: 'Full cognitive mesh — multi-agent consensus and distributed reasoning',
    composesWith: ['cognitive_mesh', 'autonomous_operator'],
    dangerIfExposed: 'Distributed consensus protocol reveals coordination architecture',
    crown_jewel: true, admin_only: false,
    black_box: true, sealed_execution: true, non_exportable: true,
    minimumTier: 'pro',
  },
  {
    id: 'syn-autonomous-evolution',
    name: 'Autonomous Evolution Synergy',
    artifactType: 'pipeline',
    modules: ['CORTEX', 'BRAIN', 'MODERNIZER', 'SEBA'],
    classification: 'experience',
    reason: 'CORTEX evolution proposals enhanced by learning and impact simulation',
    enables: 'Fully autonomous system evolution with bounded safety',
    composesWith: ['evolution_engine', 'autonomous_operator'],
    dangerIfExposed: 'Evolution proposal pipeline reveals self-modification architecture',
    crown_jewel: true, admin_only: false,
    black_box: true, sealed_execution: true, non_exportable: true,
    minimumTier: 'pro',
  },
  {
    id: 'syn-self-healing',
    name: 'Self-Healing Synergy',
    artifactType: 'pipeline',
    modules: ['SYSTEM', 'MODERNIZER', 'VISION'],
    classification: 'experience',
    reason: 'SYSTEM diagnostics trigger MODERNIZER auto-fixes with regression checks',
    enables: 'Autonomous self-repair with validation gates',
    composesWith: ['self_healing_engine', 'evolution_governance_engine'],
    dangerIfExposed: 'Self-repair trigger conditions reveal vulnerability vectors',
    crown_jewel: true, admin_only: false,
    black_box: true, sealed_execution: true, non_exportable: true,
    minimumTier: 'pro',
  },
  // Pro engines
  {
    id: 'self_healing_engine', name: 'Self-Healing Engine', artifactType: 'engine', modules: ['SYSTEM', 'DEFENSE', 'CORE'],
    classification: 'experience', reason: 'Autonomous self-repair with drift detection', enables: 'System homeostasis',
    composesWith: ['system_guardian'], dangerIfExposed: 'Healing patterns reveal fault boundaries',
    crown_jewel: true, admin_only: false, black_box: true, sealed_execution: true, non_exportable: true, minimumTier: 'pro',
  },
  {
    id: 'attack_surface_engine', name: 'Attack Surface Engine', artifactType: 'engine', modules: ['DEFENSE', 'VISION', 'SYSTEM'],
    classification: 'experience', reason: 'Privilege escalation detection, zero-day defense', enables: 'Proactive attack surface mapping',
    composesWith: ['security_fortress'], dangerIfExposed: 'Attack surface map reveals defensive blind spots',
    crown_jewel: true, admin_only: false, black_box: true, sealed_execution: true, non_exportable: true, minimumTier: 'pro',
  },
  {
    id: 'knowledge_retrieval_engine', name: 'Knowledge Retrieval Engine', artifactType: 'engine', modules: ['MEMORY'],
    classification: 'experience', reason: 'Full-stack RAG', enables: 'Complete memory infrastructure',
    composesWith: ['knowledge_nexus'], dangerIfExposed: 'Retrieval architecture reveals memory topology',
    crown_jewel: true, admin_only: false, black_box: true, sealed_execution: true, non_exportable: true, minimumTier: 'pro',
  },
  {
    id: 'delivery_orchestrator', name: 'Delivery Orchestrator', artifactType: 'engine', modules: ['RELAY'],
    classification: 'experience', reason: 'Webhook fan-out, encrypted delivery', enables: 'Complete outbound delivery',
    composesWith: ['enterprise_trust_fabric'], dangerIfExposed: 'Delivery topology reveals integration surface',
    crown_jewel: true, admin_only: false, black_box: true, sealed_execution: true, non_exportable: true, minimumTier: 'pro',
  },
  {
    id: 'compliance_audit_engine', name: 'Compliance & Audit Engine', artifactType: 'engine', modules: ['AUDIT'],
    classification: 'experience', reason: 'Immutable logs with Merkle proofs', enables: 'Tamper-evident compliance',
    composesWith: ['enterprise_trust_fabric'], dangerIfExposed: 'Audit chain architecture reveals governance implementation',
    crown_jewel: true, admin_only: false, black_box: true, sealed_execution: true, non_exportable: true, minimumTier: 'pro',
  },
  {
    id: 'zero_trust_engine', name: 'Zero Trust Engine', artifactType: 'engine', modules: ['IDENTITY'],
    classification: 'experience', reason: 'SAML/OIDC SSO, row-level isolation', enables: 'Enterprise identity infrastructure',
    composesWith: ['enterprise_trust_fabric'], dangerIfExposed: 'Identity architecture reveals trust boundaries',
    crown_jewel: true, admin_only: false, black_box: true, sealed_execution: true, non_exportable: true, minimumTier: 'pro',
  },
  {
    id: 'finops_engine', name: 'FinOps Engine', artifactType: 'engine', modules: ['ECONOMY'],
    classification: 'experience', reason: 'Sub-second metering, cost anomaly detection', enables: 'Complete FinOps',
    composesWith: ['platform_economics_engine'], dangerIfExposed: 'Economic model exposed',
    crown_jewel: true, admin_only: false, black_box: true, sealed_execution: true, non_exportable: true, minimumTier: 'pro',
  },
  {
    id: 'resilience_lab', name: 'Resilience Lab', artifactType: 'engine', modules: ['SANDBOX'],
    classification: 'experience', reason: 'Ephemeral environments, chaos injection', enables: 'Complete isolation & testing',
    composesWith: ['resilience_shield'], dangerIfExposed: 'Testing topology reveals production failure modes',
    crown_jewel: true, admin_only: false, black_box: true, sealed_execution: true, non_exportable: true, minimumTier: 'pro',
  },
  // Pro meta-engines
  {
    id: 'system_guardian', name: 'System Guardian', artifactType: 'meta-engine', modules: ['CORE', 'DEFENSE', 'SYSTEM', 'VISION'],
    classification: 'experience', reason: 'Complete system protection with self-healing', enables: 'Zero-downtime protection',
    composesWith: ['security_fortress'], dangerIfExposed: 'Defense topology exposed',
    crown_jewel: true, admin_only: false, black_box: true, sealed_execution: true, non_exportable: true, minimumTier: 'pro',
  },
  {
    id: 'security_fortress', name: 'Security Fortress', artifactType: 'meta-engine', modules: ['DEFENSE', 'SYSTEM', 'VISION', 'CORTEX'],
    classification: 'experience', reason: 'Zero-trust security stack', enables: 'Complete security posture',
    composesWith: ['system_guardian'], dangerIfExposed: 'Zero-trust implementation exposed',
    crown_jewel: true, admin_only: false, black_box: true, sealed_execution: true, non_exportable: true, minimumTier: 'pro',
  },
  {
    id: 'enterprise_trust_fabric', name: 'Enterprise Trust Fabric', artifactType: 'meta-engine', modules: ['IDENTITY', 'AUDIT', 'RELAY'],
    classification: 'experience', reason: 'End-to-end enterprise trust', enables: 'SOC2/ISO27001 compliance',
    composesWith: ['security_fortress'], dangerIfExposed: 'Trust fabric architecture exposed',
    crown_jewel: true, admin_only: false, black_box: true, sealed_execution: true, non_exportable: true, minimumTier: 'pro',
  },
  {
    id: 'platform_economics_engine', name: 'Platform Economics Engine', artifactType: 'meta-engine', modules: ['ECONOMY', 'MEMORY', 'SANDBOX'],
    classification: 'experience', reason: 'Full-stack cost and value attribution', enables: 'Per-capability ROI',
    composesWith: ['resource_governor'], dangerIfExposed: 'Economic model revealed',
    crown_jewel: true, admin_only: false, black_box: true, sealed_execution: true, non_exportable: true, minimumTier: 'pro',
  },
  {
    id: 'world_first_cognitive', name: 'World-First Cognitive', artifactType: 'meta-engine', modules: ['BRAIN', 'DECODE', 'DREAM'],
    classification: 'experience', reason: 'Unified cognitive world-first enhancements', enables: 'Advanced attention-based reasoning',
    composesWith: ['cognitive_mesh'], dangerIfExposed: 'World-first enhancement patterns are unique IP',
    crown_jewel: true, admin_only: false, black_box: true, sealed_execution: true, non_exportable: true, minimumTier: 'pro',
  },
  {
    id: 'world_first_operational', name: 'World-First Operational', artifactType: 'meta-engine', modules: ['NEXUS', 'SYSTEM', 'CORE', 'INTEGRATION'],
    classification: 'experience', reason: 'Complete operational world-first stack', enables: 'Zero-cost optimization',
    composesWith: ['autonomous_operator'], dangerIfExposed: 'Operational world-first patterns revealed',
    crown_jewel: true, admin_only: false, black_box: true, sealed_execution: true, non_exportable: true, minimumTier: 'pro',
  },
  {
    id: 'world_first_intelligence', name: 'World-First Intelligence', artifactType: 'meta-engine', modules: ['VISION', 'CORTEX', 'MODERNIZER'],
    classification: 'experience', reason: 'Full intelligence world-first stack', enables: 'SLA breach prediction',
    composesWith: ['intelligence_pipeline'], dangerIfExposed: 'Intelligence enhancement patterns are IP',
    crown_jewel: true, admin_only: false, black_box: true, sealed_execution: true, non_exportable: true, minimumTier: 'pro',
  },
  {
    id: 'world_first_governance', name: 'World-First Governance', artifactType: 'meta-engine', modules: ['DEFENSE', 'ACCESS', 'RIPPLE', 'INCLUSIVE'],
    classification: 'experience', reason: 'Complete governance world-first', enables: 'Zero-trust behavioral analysis',
    composesWith: ['enterprise_trust_fabric'], dangerIfExposed: 'Governance implementation exposed',
    crown_jewel: true, admin_only: false, black_box: true, sealed_execution: true, non_exportable: true, minimumTier: 'pro',
  },

  // ══════════════════════════════════════════════════════
  // C. v10.5.4 MODULE CROWN JEWEL CAPABILITIES (42 total)
  // ══════════════════════════════════════════════════════

  // ── ARCHITECTURE — CMPSBL-ONLY ──
  {
    id: 'cj-brain-semantic-compression', name: 'Semantic Memory Compression',
    artifactType: 'capability', modules: ['BRAIN', 'MEMORY', 'CORTEX'],
    classification: 'architecture',
    reason: 'Compresses vast knowledge into dense semantic representations without information loss',
    enables: 'Infinite effective memory through lossless semantic compression algorithms',
    composesWith: ['recursive-infinite-context', 'knowledge_retrieval_engine'],
    dangerIfExposed: 'Compression algorithm is core IP; eliminates memory capacity advantage',
    crown_jewel: true, admin_only: true,
  },
  {
    id: 'cj-dream-cross-pollination', name: 'Cross-Domain Pollination Synthesizer',
    artifactType: 'capability', modules: ['DREAM', 'BRAIN', 'CORTEX'],
    classification: 'architecture',
    reason: 'Synthesizes novel insights by cross-pollinating patterns across unrelated domains',
    enables: 'Breakthrough innovation through inter-domain pattern transfer',
    composesWith: ['creative_forge', 'recursive-capability-discoverer'],
    dangerIfExposed: 'Cross-pollination heuristics reveal creative reasoning architecture',
    crown_jewel: true, admin_only: true,
  },
  {
    id: 'cj-cortex-cognitive-load-balancer', name: 'Cognitive Load Balancer',
    artifactType: 'capability', modules: ['CORTEX', 'VISION', 'BRAIN'],
    classification: 'architecture',
    reason: 'Dynamically distributes cognitive workload across modules to prevent saturation',
    enables: 'Graceful degradation under cognitive overload with priority-based task shedding',
    composesWith: ['stier-self-scaling-intelligence-fabric', 'autonomous_operator'],
    dangerIfExposed: 'Load distribution algorithm reveals cognitive capacity boundaries',
    crown_jewel: true, admin_only: true,
  },
  {
    id: 'cj-encode-graduated-autonomy', name: 'Graduated Autonomy Controller',
    artifactType: 'capability', modules: ['ENCODE', 'CORTEX', 'DEFENSE'],
    classification: 'architecture',
    reason: 'Dynamically adjusts ENCODE autonomy level based on mastery score and safety metrics',
    enables: 'Self-regulating code generation with earned trust levels',
    composesWith: ['evolution_governance_engine', 'stier-policy-aware-intelligence-gate'],
    dangerIfExposed: 'Autonomy escalation algorithm reveals trust boundaries and override vectors',
    crown_jewel: true, admin_only: true,
  },
  {
    id: 'cj-core-cascade-prevention', name: 'Cascade Failure Prevention',
    artifactType: 'capability', modules: ['CORE', 'RIPPLE', 'DEFENSE', 'SYSTEM'],
    classification: 'architecture',
    reason: 'Prevents cascading failures across the module network through proactive circuit isolation',
    enables: 'Fault containment preventing single-module failures from propagating systemically',
    composesWith: ['system_guardian', 'self_healing_engine'],
    dangerIfExposed: 'Cascade prevention topology reveals inter-module failure dependencies',
    crown_jewel: true, admin_only: true,
  },
  {
    id: 'cj-brain-meta-reasoning', name: 'Meta-Reasoning Engine',
    artifactType: 'capability', modules: ['BRAIN', 'CORTEX', 'DECODE'],
    classification: 'architecture',
    reason: 'Reasons about its own reasoning process — identifies flawed logic chains autonomously',
    enables: 'Self-correcting reasoning with cognitive bias detection and mitigation',
    composesWith: ['metacognition_engine', 'cognitive_mesh'],
    dangerIfExposed: 'Meta-reasoning architecture reveals cognitive self-correction boundaries',
    crown_jewel: true, admin_only: true,
  },

  // ── EXPERIENCE — ARCHITECT TIER ──
  {
    id: 'cj-brain-associative-recall', name: 'Associative Recall Synthesis',
    artifactType: 'capability', modules: ['BRAIN', 'MEMORY', 'DECODE'],
    classification: 'experience',
    reason: 'Recalls memories through multi-hop associative chains — not just keyword matching',
    enables: 'Human-like associative memory with emergent connection discovery',
    composesWith: ['knowledge_graph_topology', 'recursive-knowledge-crystallization'],
    dangerIfExposed: 'Associative retrieval heuristics reveal memory graph traversal strategy',
    crown_jewel: true, admin_only: false,
    black_box: true, sealed_execution: true, non_exportable: true, minimumTier: 'pro',
  },
  {
    id: 'cj-dream-pattern-crystallizer', name: 'Dream Pattern Crystallizer',
    artifactType: 'capability', modules: ['DREAM', 'BRAIN', 'VISION'],
    classification: 'experience',
    reason: 'Crystallizes ephemeral dream-state patterns into permanent reusable templates',
    enables: 'Autonomous pattern extraction from dream cycles into production artifacts',
    composesWith: ['creative_evolution_engine', 'recursive-knowledge-crystallization'],
    dangerIfExposed: 'Pattern crystallization algorithm reveals dream-to-production pipeline',
    crown_jewel: true, admin_only: false,
    black_box: true, sealed_execution: true, non_exportable: true, minimumTier: 'pro',
  },
  {
    id: 'cj-encode-semantic-refactoring', name: 'Semantic Code Refactoring',
    artifactType: 'capability', modules: ['ENCODE', 'BRAIN', 'MODERNIZER'],
    classification: 'experience',
    reason: 'Refactors code based on semantic intent rather than syntactic patterns',
    enables: 'Intent-preserving code transformation with full regression safety',
    composesWith: ['evolution_engine', 'self_documentation_engine'],
    dangerIfExposed: 'Semantic understanding of code intent reveals code generation internals',
    crown_jewel: true, admin_only: false,
    black_box: true, sealed_execution: true, non_exportable: true, minimumTier: 'pro',
  },
  {
    id: 'cj-decode-adaptive-personality', name: 'Adaptive Personality Engine',
    artifactType: 'capability', modules: ['DECODE', 'BRAIN', 'VISION'],
    classification: 'experience',
    reason: 'Personality adapts in real-time based on user engagement signals and context',
    enables: 'Dynamic personality optimization that maximizes user satisfaction and task completion',
    composesWith: ['world_first_cognitive', 'creative_forge'],
    dangerIfExposed: 'Personality adaptation algorithm is proprietary behavioral IP',
    crown_jewel: true, admin_only: false,
    black_box: true, sealed_execution: true, non_exportable: true, minimumTier: 'pro',
  },
  {
    id: 'cj-nexus-model-quality-scoring', name: 'Model Quality Scoring Engine',
    artifactType: 'capability', modules: ['NEXUS', 'VISION', 'BRAIN'],
    classification: 'experience',
    reason: 'Scores AI model output quality in real-time to optimize routing decisions',
    enables: 'Continuous model quality assessment with automatic routing adjustment',
    composesWith: ['world_first_operational', 'stier-decision-confidence-governor'],
    dangerIfExposed: 'Quality scoring heuristics reveal routing optimization strategy',
    crown_jewel: true, admin_only: false,
    black_box: true, sealed_execution: true, non_exportable: true, minimumTier: 'pro',
  },
  {
    id: 'cj-identity-sovereign-federation', name: 'Sovereign Identity Federation',
    artifactType: 'capability', modules: ['IDENTITY', 'ACCESS', 'AUDIT'],
    classification: 'experience',
    reason: 'Federated identity with sovereign data residency and cross-jurisdiction compliance',
    enables: 'Cross-border identity federation with data sovereignty guarantees',
    composesWith: ['enterprise_trust_fabric', 'zero_trust_engine'],
    dangerIfExposed: 'Federation protocol reveals trust negotiation and data residency enforcement',
    crown_jewel: true, admin_only: false,
    black_box: true, sealed_execution: true, non_exportable: true, minimumTier: 'pro',
  },
  {
    id: 'cj-identity-behavioral-fingerprinting', name: 'Behavioral Fingerprinting',
    artifactType: 'capability', modules: ['IDENTITY', 'DEFENSE', 'VISION'],
    classification: 'experience',
    reason: 'Creates unique behavioral fingerprints from interaction patterns for identity verification',
    enables: 'Passwordless identity verification through behavioral biometric analysis',
    composesWith: ['zero_trust_engine', 'security_fortress'],
    dangerIfExposed: 'Fingerprinting algorithm reveals identity verification bypass vectors',
    crown_jewel: true, admin_only: false,
    black_box: true, sealed_execution: true, non_exportable: true, minimumTier: 'pro',
  },
  {
    id: 'cj-audit-forensic-timeline', name: 'Forensic Timeline Reconstruction',
    artifactType: 'capability', modules: ['AUDIT', 'VISION', 'BRAIN'],
    classification: 'experience',
    reason: 'Reconstructs complete event timelines from fragmented audit data for incident analysis',
    enables: 'Post-incident forensic analysis with causal chain reconstruction',
    composesWith: ['compliance_audit_engine', 'enterprise_trust_fabric'],
    dangerIfExposed: 'Timeline reconstruction algorithm reveals audit data correlation methods',
    crown_jewel: true, admin_only: false,
    black_box: true, sealed_execution: true, non_exportable: true, minimumTier: 'pro',
  },

  // ── EXPERIENCE — CREATOR TIER ──
  {
    id: 'cj-defense-behavioral-biometrics', name: 'Behavioral Biometric Engine',
    artifactType: 'capability', modules: ['DEFENSE', 'IDENTITY', 'BRAIN'],
    classification: 'experience',
    reason: 'Detects threat actors through behavioral biometric anomaly detection',
    enables: 'Real-time threat detection via keystroke dynamics, mouse patterns, and timing analysis',
    composesWith: ['attack_surface_engine', 'stier-emergent-threat-anticipator'],
    dangerIfExposed: 'Biometric detection thresholds reveal evasion techniques',
    crown_jewel: true, admin_only: false,
    black_box: true, sealed_execution: true, non_exportable: true, minimumTier: 'builder',
  },
  {
    id: 'cj-encode-mutation-testing', name: 'Autonomous Mutation Testing',
    artifactType: 'capability', modules: ['ENCODE', 'SANDBOX', 'VISION'],
    classification: 'experience',
    reason: 'Autonomously generates code mutations to discover untested edge cases',
    enables: 'Self-improving test coverage through intelligent mutation injection and survival analysis',
    composesWith: ['resilience_lab', 'evolution_engine'],
    dangerIfExposed: 'Mutation generation patterns reveal code vulnerability scanning strategy',
    crown_jewel: true, admin_only: false,
    black_box: true, sealed_execution: true, non_exportable: true, minimumTier: 'builder',
  },
  {
    id: 'cj-decode-intent-evolution', name: 'Intent Evolution Tracker',
    artifactType: 'capability', modules: ['DECODE', 'BRAIN', 'VISION'],
    classification: 'experience',
    reason: 'Tracks how user intent shifts across sessions to predict future needs',
    enables: 'Predictive intent modeling — anticipates user needs before they express them',
    composesWith: ['world_first_cognitive', 'recursive-goal-optimizer'],
    dangerIfExposed: 'Intent evolution model reveals predictive behavior analysis',
    crown_jewel: true, admin_only: false,
    black_box: true, sealed_execution: true, non_exportable: true, minimumTier: 'builder',
  },
  {
    id: 'cj-ripple-event-dedup', name: 'Event Dedup Intelligence',
    artifactType: 'capability', modules: ['RIPPLE', 'BRAIN', 'CORE'],
    classification: 'experience',
    reason: 'Intelligent event deduplication that distinguishes true duplicates from similar-but-different events',
    enables: 'Noise reduction in event streams while preserving critical signal fidelity',
    composesWith: ['system_guardian', 'world_first_operational'],
    dangerIfExposed: 'Dedup heuristics reveal event classification and priority algorithms',
    crown_jewel: true, admin_only: false,
    black_box: true, sealed_execution: true, non_exportable: true, minimumTier: 'builder',
  },
  {
    id: 'cj-economy-value-attribution', name: 'Value Attribution Engine',
    artifactType: 'capability', modules: ['ECONOMY', 'VISION', 'CORTEX'],
    classification: 'experience',
    reason: 'Attributes business value to individual AI capabilities for ROI measurement',
    enables: 'Per-capability ROI tracking with causal attribution across multi-step workflows',
    composesWith: ['platform_economics_engine', 'finops_engine'],
    dangerIfExposed: 'Value attribution model reveals economic optimization strategy',
    crown_jewel: true, admin_only: false,
    black_box: true, sealed_execution: true, non_exportable: true, minimumTier: 'builder',
  },
];

export const CROWN_JEWEL_COUNT = CROWN_JEWEL_REGISTRY.length;
export const ARCHITECTURE_COUNT = CROWN_JEWEL_REGISTRY.filter(e => e.classification === 'architecture').length;
export const EXPERIENCE_COUNT = CROWN_JEWEL_REGISTRY.filter(e => e.classification === 'experience').length;
export const CROWN_JEWEL_CAPABILITY_COUNT = CROWN_JEWEL_REGISTRY.filter(e => e.artifactType === 'capability').length;
