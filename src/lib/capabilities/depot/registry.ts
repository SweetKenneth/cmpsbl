/**
 * Capabilities Depot — Registry
 * Metadata only, no execution logic, no runtime hooks
 * Used exclusively for UI, licensing, and downloads
 * 136+ Capabilities (22 S-tier, 10 Recursive, 18 Premium)
 */

import type { 
  CapabilityArtifact, 
  CapabilityCategory, 
  CapabilityFilters,
  CapabilityWithHistory,
  VersionHistoryEntry 
} from './types';
import { getTierFromPrice } from './pricing';
import { CAPABILITY_EXPANSION } from './registry-expansion';
import { CAPABILITY_ULTRA } from './registry-ultra';
import { STIER_CAPABILITIES } from './registry-stier';
import { RECURSIVE_CAPABILITIES } from './registry-recursive';
import { CAPABILITY_PREMIUM } from './registry-premium';

// === Core Capability Registry (Metadata Only) ===
const CORE_CAPABILITIES: CapabilityArtifact[] = [
  // === INTELLIGENCE CATEGORY ===
  {
    id: 'cap-causal-inference',
    slug: 'causal-inference',
    name: 'Causal Inference Engine',
    category: 'intelligence',
    description: 'Derive cause-effect relationships from correlated signals across modules',
    longDescription: 'Advanced causal inference engine that analyzes patterns across BRAIN, CLM, and NERVE modules to establish probabilistic cause-effect relationships. Implements Pearl\'s causal hierarchy for robust intervention analysis.',
    requiredModules: ['BRAIN', 'CLM', 'NERVE'],
    compatibleModules: ['SEBA', 'DREAM'],
    executorType: 'js',
    artifactFormat: 'zip',
    version: '1.2.0',
    checksum: 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0',
    releaseNotes: '## v1.2.0\n- Improved counterfactual analysis\n- Added intervention simulation\n- Performance optimizations for large datasets',
    governanceLevel: 'governed',
    executionMode: 'local_only',
    supportPolicy: 'unsupported',
    licenseRequired: true,
    priceUsd: 299,
    pricingTier: 'advanced',
    lastUpdated: '2025-01-28T00:00:00Z',
    releaseDate: '2024-09-15T00:00:00Z',
    downloads: 847,
    features: ['Counterfactual analysis', 'Intervention simulation', 'DAG visualization', 'Confidence scoring'],
    tags: ['causality', 'inference', 'analysis', 'ml'],
    difficulty: 'advanced',
    setupTimeMinutes: 30,
  },
  {
    id: 'cap-emergent-pattern',
    slug: 'emergent-pattern-detection',
    name: 'Emergent Pattern Detection',
    category: 'intelligence',
    description: 'Identify novel behavioral patterns that emerge from multi-agent interactions',
    requiredModules: ['CLM', 'NERVE', 'ATLAS'],
    executorType: 'js',
    artifactFormat: 'zip',
    version: '1.0.1',
    checksum: 'b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1',
    releaseNotes: '## v1.0.1\n- Fixed edge case in pattern clustering\n- Added temporal decay support',
    governanceLevel: 'governed',
    executionMode: 'local_only',
    supportPolicy: 'unsupported',
    licenseRequired: true,
    priceUsd: 199,
    pricingTier: 'advanced',
    lastUpdated: '2025-01-20T00:00:00Z',
    releaseDate: '2024-11-01T00:00:00Z',
    downloads: 423,
    features: ['Real-time detection', 'Anomaly classification', 'Pattern history'],
    tags: ['patterns', 'emergence', 'detection'],
    difficulty: 'intermediate',
    setupTimeMinutes: 20,
  },

  // === OPTIMIZATION CATEGORY ===
  {
    id: 'cap-capacity-forecast',
    slug: 'capacity-forecasting',
    name: 'Capacity Forecasting',
    category: 'optimization',
    description: 'Predict resource needs and optimize allocation ahead of demand spikes',
    requiredModules: ['NERVE', 'NEXUS'],
    executorType: 'js',
    artifactFormat: 'zip',
    version: '2.1.0',
    checksum: 'c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2',
    releaseNotes: '## v2.1.0\n- Added multi-horizon forecasting\n- Improved confidence intervals\n- New seasonality detection',
    governanceLevel: 'manual',
    executionMode: 'local_only',
    supportPolicy: 'unsupported',
    licenseRequired: true,
    priceUsd: 149,
    pricingTier: 'advanced',
    lastUpdated: '2025-01-25T00:00:00Z',
    releaseDate: '2024-06-01T00:00:00Z',
    downloads: 1203,
    features: ['Multi-horizon forecasting', 'Anomaly detection', 'Auto-scaling recommendations'],
    tags: ['capacity', 'forecasting', 'resources'],
    difficulty: 'intermediate',
    setupTimeMinutes: 15,
  },
  {
    id: 'cap-cost-optimizer',
    slug: 'cost-optimization-engine',
    name: 'Cost Optimization Engine',
    category: 'optimization',
    description: 'Minimize operational costs through intelligent resource and provider routing',
    requiredModules: ['NEXUS', 'ECONOMICS'],
    executorType: 'js',
    artifactFormat: 'zip',
    version: '1.5.0',
    checksum: 'd4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3',
    releaseNotes: '## v1.5.0\n- Added multi-provider cost comparison\n- Token budget optimization\n- Real-time spend tracking',
    governanceLevel: 'bounded',
    executionMode: 'local_only',
    supportPolicy: 'unsupported',
    licenseRequired: true,
    priceUsd: 299, // normalized from $499
    pricingTier: 'system',
    lastUpdated: '2025-01-15T00:00:00Z',
    releaseDate: '2024-08-01T00:00:00Z',
    downloads: 892,
    features: ['Provider arbitrage', 'Budget enforcement', 'Cost attribution'],
    tags: ['cost', 'optimization', 'economics'],
    difficulty: 'advanced',
    setupTimeMinutes: 45,
  },

  // === RESILIENCE CATEGORY ===
  {
    id: 'cap-predictive-healing',
    slug: 'predictive-healing',
    name: 'Predictive Healing',
    category: 'resilience',
    description: 'Anticipate and auto-remediate failures before they impact operations',
    requiredModules: ['NERVE', 'MEDIC', 'CLM'],
    executorType: 'edge',
    artifactFormat: 'zip',
    version: '1.3.0',
    checksum: 'e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4',
    releaseNotes: '## v1.3.0\n- Added failure prediction models\n- Improved remediation playbooks\n- Reduced false positive rate by 40%',
    governanceLevel: 'governed',
    executionMode: 'local_only',
    supportPolicy: 'unsupported',
    licenseRequired: true,
    priceUsd: 299, // normalized from $599
    pricingTier: 'system',
    lastUpdated: '2025-01-22T00:00:00Z',
    releaseDate: '2024-07-15T00:00:00Z',
    downloads: 567,
    features: ['Failure prediction', 'Auto-remediation', 'Health scoring', 'Incident prevention'],
    tags: ['healing', 'resilience', 'automation'],
    difficulty: 'advanced',
    setupTimeMinutes: 60,
  },
  {
    id: 'cap-chaos-resilience',
    slug: 'chaos-resilience',
    name: 'Chaos Resilience Framework',
    category: 'resilience',
    description: 'Simulate and recover from catastrophic failures with bounded chaos testing',
    requiredModules: ['NERVE', 'MEDIC', 'SEBA'],
    executorType: 'js',
    artifactFormat: 'zip',
    version: '1.1.0',
    checksum: 'f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5',
    releaseNotes: '## v1.1.0\n- Added bounded chaos modes\n- Improved recovery orchestration\n- New failure injection types',
    governanceLevel: 'bounded',
    executionMode: 'local_only',
    supportPolicy: 'unsupported',
    licenseRequired: true,
    priceUsd: 299, // normalized from $799
    pricingTier: 'system',
    lastUpdated: '2025-01-18T00:00:00Z',
    releaseDate: '2024-10-01T00:00:00Z',
    downloads: 312,
    features: ['Chaos engineering', 'Failure injection', 'Recovery validation'],
    tags: ['chaos', 'testing', 'resilience'],
    difficulty: 'expert',
    setupTimeMinutes: 90,
  },

  // === SECURITY CATEGORY ===
  {
    id: 'cap-threat-prediction',
    slug: 'threat-prediction',
    name: 'Threat Prediction System',
    category: 'security',
    description: 'Predict and preemptively block emerging attack vectors using behavioral analysis',
    requiredModules: ['AEGIS', 'CLM', 'NERVE'],
    executorType: 'edge',
    artifactFormat: 'zip',
    version: '2.0.0',
    checksum: 'g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6',
    releaseNotes: '## v2.0.0\n- Major rewrite with ML-based detection\n- Added zero-day pattern recognition\n- Improved threat intelligence integration',
    governanceLevel: 'bounded',
    executionMode: 'local_only',
    supportPolicy: 'unsupported',
    licenseRequired: true,
    priceUsd: 299, // normalized from $999
    pricingTier: 'system',
    lastUpdated: '2025-01-30T00:00:00Z',
    releaseDate: '2024-05-01T00:00:00Z',
    downloads: 1456,
    features: ['Behavioral analysis', 'Zero-day detection', 'Threat intelligence', 'Attack prediction'],
    tags: ['security', 'threats', 'prediction'],
    difficulty: 'expert',
    setupTimeMinutes: 120,
  },
  {
    id: 'cap-compliance-auto',
    slug: 'compliance-automation',
    name: 'Compliance Automation',
    category: 'security',
    description: 'Automatically enforce and audit compliance policies across the substrate',
    requiredModules: ['AEGIS', 'AUDIT', 'INCLUSIVE'],
    executorType: 'js',
    artifactFormat: 'zip',
    version: '1.4.0',
    checksum: 'h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7',
    releaseNotes: '## v1.4.0\n- Added GDPR compliance templates\n- SOC2 audit automation\n- Custom policy builder',
    governanceLevel: 'governed',
    executionMode: 'local_only',
    supportPolicy: 'unsupported',
    licenseRequired: true,
    priceUsd: 299, // normalized from $699
    pricingTier: 'system',
    lastUpdated: '2025-01-12T00:00:00Z',
    releaseDate: '2024-04-01T00:00:00Z',
    downloads: 734,
    features: ['Policy enforcement', 'Audit trails', 'Compliance reports', 'GDPR/SOC2 templates'],
    tags: ['compliance', 'audit', 'gdpr', 'soc2'],
    difficulty: 'intermediate',
    setupTimeMinutes: 45,
  },

  // === ACCESSIBILITY CATEGORY ===
  {
    id: 'cap-wcag-auditor',
    slug: 'wcag-auditor',
    name: 'WCAG Compliance Auditor',
    category: 'accessibility',
    description: 'Deep accessibility analysis with automated WCAG 2.2 compliance checking',
    requiredModules: ['INCLUSIVE'],
    executorType: 'js',
    artifactFormat: 'zip',
    version: '3.0.0',
    checksum: 'i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8',
    releaseNotes: '## v3.0.0\n- Full WCAG 2.2 support\n- Added AAA level checks\n- Improved remediation suggestions',
    governanceLevel: 'manual',
    executionMode: 'local_only',
    supportPolicy: 'unsupported',
    licenseRequired: true,
    priceUsd: 49,
    pricingTier: 'utility',
    lastUpdated: '2025-01-29T00:00:00Z',
    releaseDate: '2024-02-01T00:00:00Z',
    downloads: 2341,
    features: ['WCAG 2.2', 'Auto-fix suggestions', 'Accessibility scores'],
    tags: ['accessibility', 'wcag', 'a11y'],
    difficulty: 'beginner',
    setupTimeMinutes: 10,
  },

  // === AUTOMATION CATEGORY ===
  {
    id: 'cap-sla-guardian',
    slug: 'sla-guardian',
    name: 'SLA Guardian',
    category: 'automation',
    description: 'Monitor and enforce SLA commitments with automated escalation and reporting',
    requiredModules: ['NERVE', 'ECONOMICS'],
    executorType: 'js',
    artifactFormat: 'zip',
    version: '1.2.0',
    checksum: 'j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9',
    releaseNotes: '## v1.2.0\n- Added breach prediction\n- Improved escalation workflows\n- SLA dashboard widgets',
    governanceLevel: 'governed',
    executionMode: 'local_only',
    supportPolicy: 'unsupported',
    licenseRequired: true,
    priceUsd: 199, // normalized from $249
    pricingTier: 'advanced',
    lastUpdated: '2025-01-10T00:00:00Z',
    releaseDate: '2024-09-01T00:00:00Z',
    downloads: 623,
    features: ['SLA monitoring', 'Breach prediction', 'Auto-escalation', 'Reporting'],
    tags: ['sla', 'monitoring', 'automation'],
    difficulty: 'intermediate',
    setupTimeMinutes: 25,
  },
  {
    id: 'cap-resource-contention',
    slug: 'resource-contention-resolver',
    name: 'Resource Contention Resolver',
    category: 'automation',
    description: 'Intelligently resolve resource conflicts across competing module demands',
    requiredModules: ['NEXUS', 'ATLAS', 'SEBA'],
    executorType: 'js',
    artifactFormat: 'zip',
    version: '1.0.0',
    checksum: 'k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0',
    releaseNotes: '## v1.0.0\n- Initial release\n- Priority-based allocation\n- Deadlock prevention',
    governanceLevel: 'bounded',
    executionMode: 'local_only',
    supportPolicy: 'unsupported',
    licenseRequired: true,
    priceUsd: 199, // normalized from $349
    pricingTier: 'advanced',
    lastUpdated: '2025-01-05T00:00:00Z',
    releaseDate: '2025-01-05T00:00:00Z',
    downloads: 156,
    features: ['Conflict resolution', 'Priority queuing', 'Deadlock prevention'],
    tags: ['resources', 'contention', 'allocation'],
    difficulty: 'advanced',
    setupTimeMinutes: 35,
  },

  // === FLAGSHIP CAPABILITIES ===
  {
    id: 'cap-cognitive-mesh',
    slug: 'cognitive-mesh-orchestrator',
    name: 'Cognitive Mesh Orchestrator',
    category: 'intelligence',
    description: 'Enterprise-grade multi-agent coordination with distributed cognition and consensus',
    requiredModules: ['BRAIN', 'CLM', 'NERVE', 'ATLAS', 'SEBA', 'DREAM'],
    executorType: 'container',
    artifactFormat: 'container',
    version: '1.0.0',
    checksum: 'l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1',
    releaseNotes: '## v1.0.0\n- Full cognitive mesh implementation\n- Distributed consensus protocols\n- Multi-agent orchestration',
    governanceLevel: 'bounded',
    executionMode: 'local_only',
    supportPolicy: 'unsupported',
    licenseRequired: true,
    priceUsd: 299, // normalized from $2499
    pricingTier: 'flagship',
    lastUpdated: '2025-02-01T00:00:00Z',
    releaseDate: '2025-02-01T00:00:00Z',
    downloads: 47,
    features: ['Multi-agent coordination', 'Distributed cognition', 'Consensus protocols', 'Enterprise scale'],
    tags: ['enterprise', 'mesh', 'orchestration', 'flagship'],
    difficulty: 'expert',
    setupTimeMinutes: 180,
  },

  // === SYNERGY MEMORY CHAIN CAPABILITIES ===
  {
    id: 'syn-smart-recall',
    slug: 'smart-recall-synergy',
    name: 'Smart Recall Synergy',
    category: 'intelligence',
    description: 'BRAIN Organ memory lookup enhanced by DECODE Agent context understanding and DREAM Engine pattern matching',
    requiredModules: ['BRAIN', 'DECODE', 'DREAM'],
    executorType: 'js',
    artifactFormat: 'zip',
    version: '1.0.0',
    checksum: 'syn-sr-001-hash',
    releaseNotes: '## v1.0.0\n- Context-aware memory retrieval\n- Pattern-matched recall\n- Confidence scoring',
    governanceLevel: 'governed',
    executionMode: 'local_only',
    supportPolicy: 'unsupported',
    licenseRequired: true,
    priceUsd: 199,
    pricingTier: 'advanced',
    lastUpdated: '2025-02-01T00:00:00Z',
    releaseDate: '2025-02-01T00:00:00Z',
    downloads: 234,
    features: ['Context-aware recall', 'Pattern matching', 'Memory optimization'],
    tags: ['synergy', 'memory', 'recall', 'brain'],
    difficulty: 'intermediate',
    setupTimeMinutes: 20,
  },
  {
    id: 'syn-adaptive-routing',
    slug: 'adaptive-routing-synergy',
    name: 'Adaptive Routing Synergy',
    category: 'optimization',
    description: 'NEXUS provider selection optimized by VISION latency metrics and CORTEX cost analysis',
    requiredModules: ['NEXUS', 'VISION', 'CORTEX'],
    executorType: 'js',
    artifactFormat: 'zip',
    version: '1.0.0',
    checksum: 'syn-ar-001-hash',
    releaseNotes: '## v1.0.0\n- Dynamic provider routing\n- Latency-based optimization\n- Cost-aware selection',
    governanceLevel: 'governed',
    executionMode: 'local_only',
    supportPolicy: 'unsupported',
    licenseRequired: true,
    priceUsd: 199, // normalized from $249
    pricingTier: 'advanced',
    lastUpdated: '2025-02-01T00:00:00Z',
    releaseDate: '2025-02-01T00:00:00Z',
    downloads: 512,
    features: ['Provider arbitrage', 'Latency optimization', 'Cost routing'],
    tags: ['synergy', 'routing', 'optimization', 'nexus'],
    difficulty: 'intermediate',
    setupTimeMinutes: 25,
  },
  {
    id: 'syn-graceful-degradation',
    slug: 'graceful-degradation-synergy',
    name: 'Graceful Degradation Synergy',
    category: 'resilience',
    description: 'CORE fallback chain with DEFENSE circuit breakers and VISION health monitoring',
    requiredModules: ['CORE', 'DEFENSE', 'VISION'],
    executorType: 'js',
    artifactFormat: 'zip',
    version: '1.0.0',
    checksum: 'syn-gd-001-hash',
    releaseNotes: '## v1.0.0\n- Automated fallback chains\n- Circuit breaker integration\n- Health-based degradation',
    governanceLevel: 'governed',
    executionMode: 'local_only',
    supportPolicy: 'unsupported',
    licenseRequired: true,
    priceUsd: 299,
    pricingTier: 'advanced',
    lastUpdated: '2025-02-01T00:00:00Z',
    releaseDate: '2025-02-01T00:00:00Z',
    downloads: 389,
    features: ['Fallback chains', 'Circuit breakers', 'Health monitoring'],
    tags: ['synergy', 'resilience', 'fallback', 'defense'],
    difficulty: 'intermediate',
    setupTimeMinutes: 30,
  },
  {
    id: 'syn-cognitive-fusion',
    slug: 'cognitive-fusion-synergy',
    name: 'Cognitive Fusion Synergy',
    category: 'intelligence',
    description: 'NEXUS multi-provider reasoning fused with BRAIN memory and VISION performance data',
    requiredModules: ['NEXUS', 'BRAIN', 'VISION'],
    executorType: 'js',
    artifactFormat: 'zip',
    version: '1.0.0',
    checksum: 'syn-cf-001-hash',
    releaseNotes: '## v1.0.0\n- Multi-model fusion\n- Memory-enhanced reasoning\n- Performance-aware selection',
    governanceLevel: 'governed',
    executionMode: 'local_only',
    supportPolicy: 'unsupported',
    licenseRequired: true,
    priceUsd: 199, // normalized from $349
    pricingTier: 'advanced',
    lastUpdated: '2025-02-01T00:00:00Z',
    releaseDate: '2025-02-01T00:00:00Z',
    downloads: 278,
    features: ['Multi-model fusion', 'Memory integration', 'Performance optimization'],
    tags: ['synergy', 'cognition', 'fusion', 'reasoning'],
    difficulty: 'advanced',
    setupTimeMinutes: 35,
  },
  {
    id: 'syn-self-healing',
    slug: 'self-healing-synergy',
    name: 'Self-Healing Synergy',
    category: 'resilience',
    description: 'SYSTEM diagnostics trigger EVOLUTION auto-fixes validated by VISION regression checks',
    requiredModules: ['SYSTEM', 'EVOLUTION', 'VISION'],
    executorType: 'js',
    artifactFormat: 'zip',
    version: '1.0.0',
    checksum: 'syn-sh-001-hash',
    releaseNotes: '## v1.0.0\n- Automatic diagnostics\n- Self-repair capabilities\n- Regression validation',
    governanceLevel: 'bounded',
    executionMode: 'local_only',
    supportPolicy: 'unsupported',
    licenseRequired: true,
    priceUsd: 299, // normalized from $499
    pricingTier: 'system',
    lastUpdated: '2025-02-01T00:00:00Z',
    releaseDate: '2025-02-01T00:00:00Z',
    downloads: 198,
    features: ['Auto-diagnostics', 'Self-repair', 'Regression checks'],
    tags: ['synergy', 'healing', 'automation', 'resilience'],
    difficulty: 'advanced',
    setupTimeMinutes: 45,
  },
  {
    id: 'syn-threat-learning',
    slug: 'threat-learning-synergy',
    name: 'Threat Learning Synergy',
    category: 'security',
    description: 'DEFENSE events feed BRAIN pattern recognition for VISION anomaly detection',
    requiredModules: ['DEFENSE', 'BRAIN', 'VISION'],
    executorType: 'js',
    artifactFormat: 'zip',
    version: '1.0.0',
    checksum: 'syn-tl-001-hash',
    releaseNotes: '## v1.0.0\n- Threat pattern learning\n- Anomaly correlation\n- Adaptive detection',
    governanceLevel: 'governed',
    executionMode: 'local_only',
    supportPolicy: 'unsupported',
    licenseRequired: true,
    priceUsd: 199, // normalized from $399
    pricingTier: 'advanced',
    lastUpdated: '2025-02-01T00:00:00Z',
    releaseDate: '2025-02-01T00:00:00Z',
    downloads: 345,
    features: ['Pattern learning', 'Anomaly detection', 'Threat correlation'],
    tags: ['synergy', 'security', 'learning', 'threats'],
    difficulty: 'advanced',
    setupTimeMinutes: 40,
  },
  {
    id: 'syn-autonomous-evolution',
    slug: 'autonomous-evolution-synergy',
    name: 'Autonomous Evolution Synergy',
    category: 'automation',
    description: 'CORTEX evolution proposals enhanced by BRAIN learning history and EVOLUTION impact simulation',
    requiredModules: ['CORTEX', 'BRAIN', 'EVOLUTION', 'SEBA'],
    executorType: 'js',
    artifactFormat: 'zip',
    version: '1.0.0',
    checksum: 'syn-ae-001-hash',
    releaseNotes: '## v1.0.0\n- Evolution proposals\n- Impact simulation\n- Learning-enhanced decisions',
    governanceLevel: 'bounded',
    executionMode: 'local_only',
    supportPolicy: 'unsupported',
    licenseRequired: true,
    priceUsd: 299, // normalized from $1499
    pricingTier: 'flagship',
    lastUpdated: '2025-02-01T00:00:00Z',
    releaseDate: '2025-02-01T00:00:00Z',
    downloads: 89,
    features: ['Evolution proposals', 'Impact analysis', 'Bounded autonomy'],
    tags: ['synergy', 'evolution', 'autonomous', 'flagship'],
    difficulty: 'expert',
    setupTimeMinutes: 90,
  },
  {
    id: 'syn-end-to-end-reasoning',
    slug: 'end-to-end-reasoning-synergy',
    name: 'End-to-End Reasoning Synergy',
    category: 'intelligence',
    description: 'Full cognitive pipeline from DECODE intent through NEXUS reasoning to BRAIN memory persistence',
    requiredModules: ['DECODE', 'NEXUS', 'BRAIN', 'VISION'],
    executorType: 'js',
    artifactFormat: 'zip',
    version: '1.0.0',
    checksum: 'syn-e2e-001-hash',
    releaseNotes: '## v1.0.0\n- Complete reasoning pipeline\n- Intent-to-action flow\n- Memory persistence',
    governanceLevel: 'bounded',
    executionMode: 'local_only',
    supportPolicy: 'unsupported',
    licenseRequired: true,
    priceUsd: 299, // normalized from $1999
    pricingTier: 'flagship',
    lastUpdated: '2025-02-01T00:00:00Z',
    releaseDate: '2025-02-01T00:00:00Z',
    downloads: 67,
    features: ['Full pipeline', 'Intent parsing', 'Reasoning chain', 'Memory integration'],
    tags: ['synergy', 'reasoning', 'e2e', 'flagship'],
    difficulty: 'expert',
    setupTimeMinutes: 120,
  },
];

// === Merged Registry (Recursive + S-Tier + Premium + Core + Expansion + Ultra) ===
// Recursive Self-Improvement capabilities first (highest value), then S-Tier, then Premium
export const CAPABILITY_REGISTRY: CapabilityArtifact[] = [
  ...RECURSIVE_CAPABILITIES,
  ...STIER_CAPABILITIES,
  ...CAPABILITY_PREMIUM,
  ...CORE_CAPABILITIES,
  ...CAPABILITY_EXPANSION,
  ...CAPABILITY_ULTRA,
];

// === Import unified pricing to sync prices ===
import { getStripeConfig } from './stripe-config';

/**
 * Apply Stripe config prices to a capability.
 * This ensures displayed prices match checkout prices.
 */
function applyUnifiedPricing(capability: CapabilityArtifact): CapabilityArtifact {
  const stripeConfig = getStripeConfig(capability.id);
  if (stripeConfig) {
    return {
      ...capability,
      priceUsd: stripeConfig.priceUsd,
      // Update pricing tier based on new price
      pricingTier: stripeConfig.priceUsd <= 49 ? 'utility' 
        : stripeConfig.priceUsd <= 149 ? 'advanced'
        : stripeConfig.priceUsd <= 299 ? 'system'
        : 'flagship',
    };
  }
  return capability;
}

// === Get All Capabilities (with unified pricing) ===
export function getAllCapabilities(): CapabilityArtifact[] {
  return CAPABILITY_REGISTRY.map(applyUnifiedPricing);
}

// === Get Capability by ID (with unified pricing) ===
export function getCapabilityById(id: string): CapabilityArtifact | undefined {
  const capability = CAPABILITY_REGISTRY.find(c => c.id === id);
  return capability ? applyUnifiedPricing(capability) : undefined;
}

// === Get Capability by Slug (with unified pricing) ===
export function getCapabilityBySlug(slug: string): CapabilityArtifact | undefined {
  const capability = CAPABILITY_REGISTRY.find(c => c.slug === slug);
  return capability ? applyUnifiedPricing(capability) : undefined;
}

// === Get Capabilities by Category (with unified pricing) ===
export function getCapabilitiesByCategory(category: CapabilityCategory): CapabilityArtifact[] {
  return CAPABILITY_REGISTRY
    .filter(c => c.category === category)
    .map(applyUnifiedPricing);
}

// === Filter Capabilities (with unified pricing) ===
export function filterCapabilities(filters: CapabilityFilters): CapabilityArtifact[] {
  // Apply unified pricing first
  let results = CAPABILITY_REGISTRY.map(applyUnifiedPricing);

  // Category filter
  if (filters.category) {
    results = results.filter(c => c.category === filters.category);
  }

  // Executor type filter
  if (filters.executorType) {
    results = results.filter(c => c.executorType === filters.executorType);
  }

  // Pricing tier filter
  if (filters.pricingTier) {
    results = results.filter(c => c.pricingTier === filters.pricingTier);
  }

  // Search filter
  if (filters.search) {
    const search = filters.search.toLowerCase();
    results = results.filter(c => 
      c.name.toLowerCase().includes(search) ||
      c.description.toLowerCase().includes(search) ||
      c.tags?.some(t => t.toLowerCase().includes(search))
    );
  }

  // Tags filter
  if (filters.tags && filters.tags.length > 0) {
    results = results.filter(c => 
      filters.tags!.some(tag => c.tags?.includes(tag))
    );
  }

  // Sorting
  if (filters.sortBy) {
    results.sort((a, b) => {
      let comparison = 0;
      switch (filters.sortBy) {
        case 'price':
          comparison = a.priceUsd - b.priceUsd;
          break;
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'downloads':
          comparison = (b.downloads || 0) - (a.downloads || 0);
          break;
        case 'lastUpdated':
          comparison = new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime();
          break;
      }
      return filters.sortOrder === 'desc' ? -comparison : comparison;
    });
  }

  return results;
}

// === Get Category Stats ===
export function getCategoryStats(): Record<CapabilityCategory, number> {
  const stats: Record<CapabilityCategory, number> = {
    intelligence: 0,
    optimization: 0,
    resilience: 0,
    security: 0,
    accessibility: 0,
    automation: 0,
    orchestration: 0,
  };

  for (const cap of CAPABILITY_REGISTRY) {
    stats[cap.category]++;
  }

  return stats;
}

// === Get Total Count ===
export function getTotalCapabilityCount(): number {
  return CAPABILITY_REGISTRY.length;
}
