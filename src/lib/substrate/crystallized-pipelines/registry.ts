/**
 * Crystallized Pipeline Registry — 50 Crown Jewel Pipelines
 * v10.8.0 ARCHITECT Epoch — Tiered Pipeline Crystallization
 * 
 * Crystallized pipelines are multi-module resolver chains that emerged
 * from Intent Mesh discovery and were hardened into permanent, reusable
 * execution templates. Each pipeline composes 2-4 modules into a
 * sealed, black-boxed workflow.
 * 
 * Tiers:
 *   CMPSBL-Only (Architecture) — 10 pipelines (never released)
 *   Enterprise — 8 pipelines
 *   Architect — 18 pipelines  
 *   Creator — 14 pipelines
 */

export type PipelineTier = 'cmpsbl' | 'enterprise' | 'architect' | 'creator';

export interface CrystallizedPipeline {
  id: string;
  name: string;
  modules: string[];
  description: string;
  emergentProperty: string;
  tier: PipelineTier;
  category: 'security' | 'intelligence' | 'optimization' | 'compliance' | 'observability' | 'orchestration';
  isSealed: boolean;
  discoveredFrom: string; // Intent Mesh receipt origin
}

// ═══════════════════════════════════════════════════════════════════════════════
// CMPSBL-ONLY PIPELINES (10) — Architecture-class, never released
// ═══════════════════════════════════════════════════════════════════════════════

const CMPSBL_PIPELINES: CrystallizedPipeline[] = [
  {
    id: 'cp-recursive-self-evolution',
    name: 'Recursive Self-Evolution Loop',
    modules: ['CORTEX', 'DREAM', 'BRAIN', 'MODERNIZER'],
    description: 'Closed-loop self-improvement where insights from Dream analysis feed back into architecture mutations',
    emergentProperty: 'Autonomous architecture improvement without external input',
    tier: 'cmpsbl',
    category: 'orchestration',
    isSealed: true,
    discoveredFrom: 'mesh-receipt-alpha-001',
  },
  {
    id: 'cp-cognitive-bootstrap-chain',
    name: 'Cognitive Bootstrap Chain',
    modules: ['BRAIN', 'CORTEX', 'ENCODE', 'SYSTEM'],
    description: 'Cold-start intelligence bootstrapping from minimal seed knowledge',
    emergentProperty: 'Zero-to-competent cognitive initialization',
    tier: 'cmpsbl',
    category: 'intelligence',
    isSealed: true,
    discoveredFrom: 'mesh-receipt-alpha-002',
  },
  {
    id: 'cp-meta-governance-loop',
    name: 'Meta-Governance Feedback Loop',
    modules: ['CORTEX', 'DEFENSE', 'AUDIT', 'SYSTEM'],
    description: 'Governance policies that evaluate and refine themselves based on enforcement outcomes',
    emergentProperty: 'Self-correcting governance without human intervention',
    tier: 'cmpsbl',
    category: 'compliance',
    isSealed: true,
    discoveredFrom: 'mesh-receipt-alpha-003',
  },
  {
    id: 'cp-architecture-telomere-repair',
    name: 'Architecture Telomere Repair',
    modules: ['MODERNIZER', 'SYSTEM', 'CORTEX', 'VISION'],
    description: 'Detects and repairs architecture aging patterns before they cause systemic degradation',
    emergentProperty: 'Perpetual architecture youth maintenance',
    tier: 'cmpsbl',
    category: 'optimization',
    isSealed: true,
    discoveredFrom: 'mesh-receipt-alpha-004',
  },
  {
    id: 'cp-knowledge-fusion-cascade',
    name: 'Knowledge Fusion Cascade',
    modules: ['BRAIN', 'DREAM', 'MEMORY', 'CORTEX'],
    description: 'Multi-stage knowledge synthesis producing novel insights from cross-domain fusion',
    emergentProperty: 'Autonomous discovery of non-obvious knowledge connections',
    tier: 'cmpsbl',
    category: 'intelligence',
    isSealed: true,
    discoveredFrom: 'mesh-receipt-alpha-005',
  },
  {
    id: 'cp-emergent-strategy-compiler',
    name: 'Emergent Strategy Compiler',
    modules: ['CORTEX', 'VISION', 'BRAIN', 'DREAM'],
    description: 'Compiles emergent patterns into executable strategic plans',
    emergentProperty: 'Strategy synthesis from raw signal patterns',
    tier: 'cmpsbl',
    category: 'orchestration',
    isSealed: true,
    discoveredFrom: 'mesh-receipt-alpha-006',
  },
  {
    id: 'cp-substrate-homeostasis-loop',
    name: 'Substrate Homeostasis Loop',
    modules: ['CORE', 'SYSTEM', 'CORTEX', 'DEFENSE'],
    description: 'Maintains substrate equilibrium by counteracting destabilizing changes in real-time',
    emergentProperty: 'Autonomous stability without manual intervention',
    tier: 'cmpsbl',
    category: 'optimization',
    isSealed: true,
    discoveredFrom: 'mesh-receipt-alpha-007',
  },
  {
    id: 'cp-cognitive-deception-shield',
    name: 'Cognitive Deception Shield',
    modules: ['DEFENSE', 'BRAIN', 'DECODE', 'IDENTITY'],
    description: 'Deploys cognitive deception techniques to mislead and trap adversarial actors',
    emergentProperty: 'Active defense through controlled information asymmetry',
    tier: 'cmpsbl',
    category: 'security',
    isSealed: true,
    discoveredFrom: 'mesh-receipt-alpha-008',
  },
  {
    id: 'cp-autonomous-triage-cascade',
    name: 'Autonomous Triage Cascade',
    modules: ['SYSTEM', 'CORTEX', 'DEFENSE', 'VISION'],
    description: 'Multi-priority triage that autonomously escalates and resolves system health events',
    emergentProperty: 'Zero-human-touch incident resolution',
    tier: 'cmpsbl',
    category: 'observability',
    isSealed: true,
    discoveredFrom: 'mesh-receipt-alpha-009',
  },
  {
    id: 'cp-synthetic-intuition-engine',
    name: 'Synthetic Intuition Engine',
    modules: ['DREAM', 'BRAIN', 'CORTEX', 'VISION'],
    description: 'Generates intuitive leaps by synthesizing subconscious pattern recognition',
    emergentProperty: 'Non-linear creative problem solving',
    tier: 'cmpsbl',
    category: 'intelligence',
    isSealed: true,
    discoveredFrom: 'mesh-receipt-alpha-010',
  },
];

// ═══════════════════════════════════════════════════════════════════════════════
// ENTERPRISE PIPELINES (8) — Governance-grade sealed workflows
// ═══════════════════════════════════════════════════════════════════════════════

const ENTERPRISE_PIPELINES: CrystallizedPipeline[] = [
  {
    id: 'cp-compliance-automation-chain',
    name: 'Compliance Automation Chain',
    modules: ['AUDIT', 'CORTEX', 'DEFENSE', 'IDENTITY'],
    description: 'End-to-end compliance workflow from detection through remediation and reporting',
    emergentProperty: 'Automated SOC2/GDPR compliance with zero manual steps',
    tier: 'enterprise',
    category: 'compliance',
    isSealed: true,
    discoveredFrom: 'mesh-receipt-ent-001',
  },
  {
    id: 'cp-org-threat-intelligence-mesh',
    name: 'Org Threat Intelligence Mesh',
    modules: ['DEFENSE', 'VISION', 'IDENTITY', 'RELAY'],
    description: 'Cross-organization threat intelligence sharing with anonymized pattern distribution',
    emergentProperty: 'Collective defense intelligence across deployments',
    tier: 'enterprise',
    category: 'security',
    isSealed: true,
    discoveredFrom: 'mesh-receipt-ent-002',
  },
  {
    id: 'cp-multi-tenant-isolation-fabric',
    name: 'Multi-Tenant Isolation Fabric',
    modules: ['BRAIN', 'MEMORY', 'ACCESS', 'IDENTITY'],
    description: 'Cryptographic tenant isolation with zero-leakage memory partitioning',
    emergentProperty: 'Hardware-grade tenant separation in shared infrastructure',
    tier: 'enterprise',
    category: 'security',
    isSealed: true,
    discoveredFrom: 'mesh-receipt-ent-003',
  },
  {
    id: 'cp-sla-aware-execution-governor',
    name: 'SLA-Aware Execution Governor',
    modules: ['CORTEX', 'NEXUS', 'SYSTEM', 'ECONOMY'],
    description: 'Governs all execution paths to meet contractual SLA targets with automated failover',
    emergentProperty: 'Guaranteed execution within SLA bounds',
    tier: 'enterprise',
    category: 'optimization',
    isSealed: true,
    discoveredFrom: 'mesh-receipt-ent-004',
  },
  {
    id: 'cp-enterprise-audit-trail',
    name: 'Enterprise Audit Trail Pipeline',
    modules: ['AUDIT', 'MEMORY', 'IDENTITY', 'SYSTEM'],
    description: 'Immutable audit trail construction with forensic timeline reconstruction',
    emergentProperty: 'Court-admissible digital evidence generation',
    tier: 'enterprise',
    category: 'compliance',
    isSealed: true,
    discoveredFrom: 'mesh-receipt-ent-005',
  },
  {
    id: 'cp-capacity-prediction-chain',
    name: 'Capacity Prediction Chain',
    modules: ['SYSTEM', 'VISION', 'ECONOMY', 'CORTEX'],
    description: 'Multi-horizon capacity prediction with automated scaling recommendations',
    emergentProperty: 'Proactive capacity management eliminating reactive scaling',
    tier: 'enterprise',
    category: 'optimization',
    isSealed: true,
    discoveredFrom: 'mesh-receipt-ent-006',
  },
  {
    id: 'cp-cross-deployment-sync',
    name: 'Cross-Deployment Sync Pipeline',
    modules: ['RELAY', 'MEMORY', 'SYSTEM', 'CORTEX'],
    description: 'Synchronized state propagation across geographically distributed deployments',
    emergentProperty: 'Eventually-consistent global state without conflicts',
    tier: 'enterprise',
    category: 'orchestration',
    isSealed: true,
    discoveredFrom: 'mesh-receipt-ent-007',
  },
  {
    id: 'cp-regulatory-autopilot',
    name: 'Regulatory Autopilot Pipeline',
    modules: ['AUDIT', 'DECODE', 'CORTEX', 'RELAY'],
    description: 'Monitors regulatory changes and auto-generates compliance adjustment plans',
    emergentProperty: 'Zero-lag regulatory adaptation',
    tier: 'enterprise',
    category: 'compliance',
    isSealed: true,
    discoveredFrom: 'mesh-receipt-ent-008',
  },
];

// ═══════════════════════════════════════════════════════════════════════════════
// ARCHITECT PIPELINES (18) — Premium sealed workflows ($19/mo)
// ═══════════════════════════════════════════════════════════════════════════════

const ARCHITECT_PIPELINES: CrystallizedPipeline[] = [
  {
    id: 'cp-threat-prediction-chain',
    name: 'Threat Prediction Chain',
    modules: ['DEFENSE', 'VISION', 'BRAIN'],
    description: 'Predict security threats from behavioral patterns before exploitation occurs',
    emergentProperty: 'Pre-incident threat neutralization',
    tier: 'architect',
    category: 'security',
    isSealed: true,
    discoveredFrom: 'mesh-receipt-arc-001',
  },
  {
    id: 'cp-semantic-refactoring-pipeline',
    name: 'Semantic Refactoring Pipeline',
    modules: ['ENCODE', 'BRAIN', 'CORTEX'],
    description: 'Behavior-preserving code transformation with formal verification',
    emergentProperty: 'Risk-free codebase modernization',
    tier: 'architect',
    category: 'intelligence',
    isSealed: true,
    discoveredFrom: 'mesh-receipt-arc-002',
  },
  {
    id: 'cp-cross-module-orchestration',
    name: 'Cross-Module Orchestration',
    modules: ['CORTEX', 'BRAIN', 'NEXUS', 'VISION'],
    description: 'Multi-module workflow composition with emergent capability discovery',
    emergentProperty: 'Capabilities beyond individual module sum',
    tier: 'architect',
    category: 'orchestration',
    isSealed: true,
    discoveredFrom: 'mesh-receipt-arc-003',
  },
  {
    id: 'cp-zero-day-synthesis-chain',
    name: 'Zero-Day Synthesis Chain',
    modules: ['DEFENSE', 'DREAM', 'ENCODE'],
    description: 'Synthesize novel attack signatures from partial behavioral indicators',
    emergentProperty: 'Pre-signature threat pattern generation',
    tier: 'architect',
    category: 'security',
    isSealed: true,
    discoveredFrom: 'mesh-receipt-arc-004',
  },
  {
    id: 'cp-knowledge-distillation-pipeline',
    name: 'Knowledge Distillation Pipeline',
    modules: ['BRAIN', 'MEMORY', 'CORTEX'],
    description: 'Compress large knowledge bases into compact high-fidelity representations',
    emergentProperty: 'Lossless knowledge compression for fast retrieval',
    tier: 'architect',
    category: 'intelligence',
    isSealed: true,
    discoveredFrom: 'mesh-receipt-arc-005',
  },
  {
    id: 'cp-adaptive-delivery-optimizer',
    name: 'Adaptive Delivery Optimizer',
    modules: ['RELAY', 'VISION', 'DECODE'],
    description: 'Per-recipient delivery strategy optimization based on engagement history',
    emergentProperty: 'Maximum delivery effectiveness per-channel',
    tier: 'architect',
    category: 'optimization',
    isSealed: true,
    discoveredFrom: 'mesh-receipt-arc-006',
  },
  {
    id: 'cp-chaos-resilience-pipeline',
    name: 'Chaos Resilience Pipeline',
    modules: ['SANDBOX', 'SYSTEM', 'DEFENSE', 'VISION'],
    description: 'Controlled chaos experiments that discover failure modes before production',
    emergentProperty: 'Proactive resilience through controlled failure injection',
    tier: 'architect',
    category: 'security',
    isSealed: true,
    discoveredFrom: 'mesh-receipt-arc-007',
  },
  {
    id: 'cp-identity-trust-fabric',
    name: 'Identity Trust Fabric',
    modules: ['IDENTITY', 'DEFENSE', 'AUDIT'],
    description: 'Continuous identity verification with trust decay modeling',
    emergentProperty: 'Zero-trust authentication beyond session boundaries',
    tier: 'architect',
    category: 'security',
    isSealed: true,
    discoveredFrom: 'mesh-receipt-arc-008',
  },
  {
    id: 'cp-cognitive-load-optimizer',
    name: 'Cognitive Load Optimizer',
    modules: ['VISION', 'CORTEX', 'DECODE'],
    description: 'Detect and reduce cognitive overload across user interfaces and AI interactions',
    emergentProperty: 'Optimal information density per-user',
    tier: 'architect',
    category: 'optimization',
    isSealed: true,
    discoveredFrom: 'mesh-receipt-arc-009',
  },
  {
    id: 'cp-pipeline-fusion-engine',
    name: 'Pipeline Fusion Engine',
    modules: ['CORTEX', 'BRAIN', 'DREAM'],
    description: 'Merge compatible pipelines into optimized super-pipelines',
    emergentProperty: 'Emergent efficiency through pipeline consolidation',
    tier: 'architect',
    category: 'orchestration',
    isSealed: true,
    discoveredFrom: 'mesh-receipt-arc-010',
  },
  {
    id: 'cp-memory-provenance-chain',
    name: 'Memory Provenance Chain',
    modules: ['MEMORY', 'AUDIT', 'BRAIN'],
    description: 'Track origin and transformation of every memory entry for full auditability',
    emergentProperty: 'Complete knowledge lineage tracking',
    tier: 'architect',
    category: 'compliance',
    isSealed: true,
    discoveredFrom: 'mesh-receipt-arc-011',
  },
  {
    id: 'cp-provider-arbitrage-pipeline',
    name: 'Provider Arbitrage Pipeline',
    modules: ['NEXUS', 'ECONOMY', 'VISION'],
    description: 'Exploit cross-provider price differentials while maintaining quality guarantees',
    emergentProperty: 'Optimal cost-quality balance across providers',
    tier: 'architect',
    category: 'optimization',
    isSealed: true,
    discoveredFrom: 'mesh-receipt-arc-012',
  },
  {
    id: 'cp-blast-radius-containment',
    name: 'Blast Radius Containment',
    modules: ['DEFENSE', 'CORTEX', 'SYSTEM'],
    description: 'Automatically contain security incidents by isolating affected module chains',
    emergentProperty: 'Instantaneous failure domain isolation',
    tier: 'architect',
    category: 'security',
    isSealed: true,
    discoveredFrom: 'mesh-receipt-arc-013',
  },
  {
    id: 'cp-behavioral-drift-detector',
    name: 'Behavioral Drift Detector',
    modules: ['VISION', 'BRAIN', 'SYSTEM'],
    description: 'Detect when system or user behavior drifts from established baselines',
    emergentProperty: 'Early warning for behavioral anomalies',
    tier: 'architect',
    category: 'observability',
    isSealed: true,
    discoveredFrom: 'mesh-receipt-arc-014',
  },
  {
    id: 'cp-dynamic-pricing-pipeline',
    name: 'Dynamic Pricing Pipeline',
    modules: ['ECONOMY', 'VISION', 'CORTEX'],
    description: 'Real-time resource pricing based on demand, availability, and quality metrics',
    emergentProperty: 'Market-optimal internal pricing',
    tier: 'architect',
    category: 'optimization',
    isSealed: true,
    discoveredFrom: 'mesh-receipt-arc-015',
  },
  {
    id: 'cp-empathic-interaction-chain',
    name: 'Empathic Interaction Chain',
    modules: ['DECODE', 'BRAIN', 'VISION'],
    description: 'Calibrate AI empathy and personality based on real-time user emotional state',
    emergentProperty: 'Emotionally intelligent interaction adaptation',
    tier: 'architect',
    category: 'intelligence',
    isSealed: true,
    discoveredFrom: 'mesh-receipt-arc-016',
  },
  {
    id: 'cp-semantic-debt-scanner',
    name: 'Semantic Debt Scanner',
    modules: ['ENCODE', 'BRAIN', 'VISION'],
    description: 'Detect code that works but no longer reflects original intent',
    emergentProperty: 'Intent-drift detection beyond static analysis',
    tier: 'architect',
    category: 'intelligence',
    isSealed: true,
    discoveredFrom: 'mesh-receipt-arc-017',
  },
  {
    id: 'cp-innovation-scoring-pipeline',
    name: 'Innovation Scoring Pipeline',
    modules: ['DREAM', 'VISION', 'CORTEX'],
    description: 'Score creative outputs by novelty, feasibility, and impact potential',
    emergentProperty: 'Quantified innovation assessment',
    tier: 'architect',
    category: 'intelligence',
    isSealed: true,
    discoveredFrom: 'mesh-receipt-arc-018',
  },
];

// ═══════════════════════════════════════════════════════════════════════════════
// CREATOR PIPELINES (14) — Builder-friendly sealed workflows ($9/mo)
// ═══════════════════════════════════════════════════════════════════════════════

const CREATOR_PIPELINES: CrystallizedPipeline[] = [
  {
    id: 'cp-smart-event-routing',
    name: 'Smart Event Routing',
    modules: ['RIPPLE', 'BRAIN', 'DECODE'],
    description: 'Route events to optimal handlers based on semantic meaning, not just type',
    emergentProperty: 'Intent-aware event distribution',
    tier: 'creator',
    category: 'intelligence',
    isSealed: true,
    discoveredFrom: 'mesh-receipt-cre-001',
  },
  {
    id: 'cp-memory-consolidation-pipeline',
    name: 'Memory Consolidation Pipeline',
    modules: ['BRAIN', 'MEMORY', 'DREAM'],
    description: 'Merge redundant memories and strengthen important ones during idle time',
    emergentProperty: 'Self-organizing knowledge optimization',
    tier: 'creator',
    category: 'intelligence',
    isSealed: true,
    discoveredFrom: 'mesh-receipt-cre-002',
  },
  {
    id: 'cp-cost-anomaly-detection',
    name: 'Cost Anomaly Detection Pipeline',
    modules: ['ECONOMY', 'VISION', 'RELAY'],
    description: 'Predict cost spikes and alert before budgets are impacted',
    emergentProperty: 'Preemptive cost containment',
    tier: 'creator',
    category: 'optimization',
    isSealed: true,
    discoveredFrom: 'mesh-receipt-cre-003',
  },
  {
    id: 'cp-webhook-intelligence-chain',
    name: 'Webhook Intelligence Chain',
    modules: ['RELAY', 'DEFENSE', 'BRAIN'],
    description: 'Auto-retry, deduplicate, and validate webhooks with intelligent failure recovery',
    emergentProperty: 'Guaranteed webhook delivery with zero duplicates',
    tier: 'creator',
    category: 'optimization',
    isSealed: true,
    discoveredFrom: 'mesh-receipt-cre-004',
  },
  {
    id: 'cp-test-oracle-generator',
    name: 'Test Oracle Generator',
    modules: ['ENCODE', 'DECODE', 'BRAIN'],
    description: 'Generate expected test outcomes from specification analysis',
    emergentProperty: 'Zero-effort test creation from specs',
    tier: 'creator',
    category: 'intelligence',
    isSealed: true,
    discoveredFrom: 'mesh-receipt-cre-005',
  },
  {
    id: 'cp-latency-prediction-router',
    name: 'Latency Prediction Router',
    modules: ['NEXUS', 'VISION', 'BRAIN'],
    description: 'Predict provider response times and pre-route to fastest option',
    emergentProperty: 'Minimal-latency request routing',
    tier: 'creator',
    category: 'optimization',
    isSealed: true,
    discoveredFrom: 'mesh-receipt-cre-006',
  },
  {
    id: 'cp-drift-correction-pipeline',
    name: 'Drift Correction Pipeline',
    modules: ['ENCODE', 'VISION', 'BRAIN'],
    description: 'Detect implementation drift from specs and auto-generate corrective patches',
    emergentProperty: 'Self-correcting codebase alignment',
    tier: 'creator',
    category: 'intelligence',
    isSealed: true,
    discoveredFrom: 'mesh-receipt-cre-007',
  },
  {
    id: 'cp-reputation-scoring-chain',
    name: 'Reputation Scoring Chain',
    modules: ['DEFENSE', 'IDENTITY', 'VISION'],
    description: 'Score request sources by behavioral reputation to prioritize trusted traffic',
    emergentProperty: 'Trust-weighted request processing',
    tier: 'creator',
    category: 'security',
    isSealed: true,
    discoveredFrom: 'mesh-receipt-cre-008',
  },
  {
    id: 'cp-user-journey-reconstructor',
    name: 'User Journey Reconstructor',
    modules: ['VISION', 'DECODE', 'BRAIN'],
    description: 'Reconstruct complete user journeys to find drop-off points',
    emergentProperty: 'Full-path user behavior visibility',
    tier: 'creator',
    category: 'observability',
    isSealed: true,
    discoveredFrom: 'mesh-receipt-cre-009',
  },
  {
    id: 'cp-schema-evolution-guard',
    name: 'Schema Evolution Guard',
    modules: ['ENCODE', 'INTEGRATION', 'BRAIN'],
    description: 'Validate schema changes against downstream consumers before deployment',
    emergentProperty: 'Zero-downtime schema migrations',
    tier: 'creator',
    category: 'compliance',
    isSealed: true,
    discoveredFrom: 'mesh-receipt-cre-010',
  },
  {
    id: 'cp-context-window-optimizer',
    name: 'Context Window Optimizer',
    modules: ['BRAIN', 'DECODE', 'NEXUS'],
    description: 'Compress and prioritize context to maximize AI response quality',
    emergentProperty: 'Maximum signal density per token',
    tier: 'creator',
    category: 'optimization',
    isSealed: true,
    discoveredFrom: 'mesh-receipt-cre-011',
  },
  {
    id: 'cp-connector-health-monitor',
    name: 'Connector Health Monitor',
    modules: ['INTEGRATION', 'VISION', 'RELAY'],
    description: 'Predict connector failures before they impact integrations',
    emergentProperty: 'Pre-failure connector remediation',
    tier: 'creator',
    category: 'observability',
    isSealed: true,
    discoveredFrom: 'mesh-receipt-cre-012',
  },
  {
    id: 'cp-pattern-consolidation-pipeline',
    name: 'Pattern Consolidation Pipeline',
    modules: ['DREAM', 'BRAIN', 'ENCODE'],
    description: 'Consolidate repeated patterns into reusable optimized templates',
    emergentProperty: 'Automatic template generation from usage patterns',
    tier: 'creator',
    category: 'optimization',
    isSealed: true,
    discoveredFrom: 'mesh-receipt-cre-013',
  },
  {
    id: 'cp-usage-forecasting-pipeline',
    name: 'Usage Forecasting Pipeline',
    modules: ['ECONOMY', 'VISION', 'BRAIN'],
    description: 'Forecast usage patterns and recommend capacity adjustments',
    emergentProperty: 'Proactive resource planning',
    tier: 'creator',
    category: 'optimization',
    isSealed: true,
    discoveredFrom: 'mesh-receipt-cre-014',
  },
];

// ═══════════════════════════════════════════════════════════════════════════════
// COMBINED REGISTRY
// ═══════════════════════════════════════════════════════════════════════════════

export const CRYSTALLIZED_PIPELINES: readonly CrystallizedPipeline[] = Object.freeze([
  ...CMPSBL_PIPELINES,
  ...ENTERPRISE_PIPELINES,
  ...ARCHITECT_PIPELINES,
  ...CREATOR_PIPELINES,
]);

export const CRYSTALLIZED_PIPELINE_COUNT = CRYSTALLIZED_PIPELINES.length; // 50

export const CRYSTALLIZED_PIPELINE_TIER_COUNTS = {
  cmpsbl: CMPSBL_PIPELINES.length,      // 10
  enterprise: ENTERPRISE_PIPELINES.length, // 8
  architect: ARCHITECT_PIPELINES.length,   // 18
  creator: CREATOR_PIPELINES.length,       // 14
} as const;

/** Get pipelines by tier */
export function getPipelinesByTier(tier: PipelineTier): CrystallizedPipeline[] {
  return CRYSTALLIZED_PIPELINES.filter(p => p.tier === tier);
}

/** Get pipelines by module */
export function getPipelinesByModule(module: string): CrystallizedPipeline[] {
  return CRYSTALLIZED_PIPELINES.filter(p => p.modules.includes(module));
}

/** Get public-safe pipelines (everything except CMPSBL) */
export function getPublicPipelines(): CrystallizedPipeline[] {
  return CRYSTALLIZED_PIPELINES.filter(p => p.tier !== 'cmpsbl');
}

export const CRYSTALLIZED_REGISTRY_VERSION = '10.8.0' as const;
