/**
 * MERCHANT Inventory — Curated collection of the best software across all substrates
 * 
 * This is the MERCHANT's active inventory, populated by scanning all vaults
 * and discovery engines across the ecosystem. Items rotate based on
 * Memory Stream discoveries and MERCHANT scan cycles.
 */

import type { MarketplaceItem, SourceSubstrate, SourceVault, ListingCategory } from './merchant-engine';
import { calculateMarketplacePrice, getMarketplaceTier, generateSlug } from './merchant-engine';

/** Seed inventory — representative of what MERCHANT discovers across the ecosystem */
export const MERCHANT_INVENTORY: MarketplaceItem[] = [
  // === PRIMARY SUBSTRATE ===
  createItem({
    title: 'Predictive Oracle Engine',
    subtitle: 'Multi-signal weighted prediction with confidence scoring',
    description: 'Production-grade forecasting engine that ingests weighted signals, applies Bayesian-inspired confidence calibration, and outputs actionable predictions with bounded uncertainty intervals. Used internally by CORTEX for resource planning.',
    painPoints: ['Unreliable forecasting', 'No confidence scores', 'Black-box predictions'],
    features: ['Weighted signal ingestion', 'Confidence calibration', 'Temporal decay', 'Anomaly detection'],
    substrate: 'primary', vault: 's-tier', sourceId: 'S-CJ185', category: 'meta-engine',
    cjpi: 91, chain: ['ORACLE', 'CORTEX', 'BRAIN'], tags: ['prediction', 'analytics', 'forecasting'],
  }),
  createItem({
    title: 'Recursive Capability Discoverer',
    subtitle: 'Discovers emergent capabilities through system introspection',
    description: 'Autonomously discovers new capabilities by recursively analyzing existing primitive compositions. Identifies complementary pairs that combine into novel functions not present in individual components.',
    painPoints: ['Manual capability mapping', 'Missed synergies', 'Static feature sets'],
    features: ['Recursive introspection', 'Composition discovery', 'Confidence scoring', 'Value estimation'],
    substrate: 'primary', vault: 's-tier', sourceId: 'S-CJ98', category: 'meta-engine',
    cjpi: 86, chain: ['ATLAS', 'BRAIN', 'CORTEX'], tags: ['discovery', 'composition', 'introspection'],
  }),
  createItem({
    title: 'Temporal Ripple Analyzer',
    subtitle: 'Blast-radius analysis for cascading system changes',
    description: 'Maps causal propagation of changes through interconnected systems. Calculates blast radius, identifies cascade chains, and provides risk-scored impact assessments before changes are applied.',
    painPoints: ['Unexpected side effects', 'Cascade failures', 'No impact visibility'],
    features: ['Blast radius mapping', 'Cascade detection', 'Risk scoring', 'What-if analysis'],
    substrate: 'primary', vault: 's-tier', sourceId: 'S-CJ186', category: 'analytics-engine',
    cjpi: 89, chain: ['RIPPLE', 'VISION', 'DEFENSE'], tags: ['impact', 'risk', 'cascade'],
  }),
  createItem({
    title: 'Event Storm Dampener',
    subtitle: 'Adaptive rate-limiting and event deduplication',
    description: 'Production hardened rate limiter with token-bucket algorithm, sliding window counters, and content-hash deduplication. Prevents event storms from overwhelming downstream systems while preserving critical signals.',
    painPoints: ['Event flooding', 'API rate limits', 'Duplicate processing'],
    features: ['Token bucket algorithm', 'Content deduplication', 'Adaptive throttling', 'Priority lanes'],
    substrate: 'primary', vault: 's-tier', sourceId: 'S-CJ224', category: 'defense-layer',
    cjpi: 90, chain: ['RIPPLE', 'DEFENSE', 'SYSTEM'], tags: ['rate-limiting', 'dedup', 'resilience'],
  }),
  createItem({
    title: 'Ethical Constraint Engine',
    subtitle: 'Policy-driven decision boundary enforcement',
    description: 'Enforces ethical guardrails on AI decision-making through configurable policy rules. Supports weighted multi-factor evaluation with audit trails and human-override mechanisms.',
    painPoints: ['Uncontrolled AI decisions', 'Compliance gaps', 'No audit trail'],
    features: ['Policy rules engine', 'Multi-factor scoring', 'Override protocols', 'Audit logging'],
    substrate: 'primary', vault: 's-tier', sourceId: 'S-CJ204', category: 'governance-tool',
    cjpi: 92, chain: ['GOVERNANCE', 'DEFENSE', 'AUDIT'], tags: ['ethics', 'compliance', 'guardrails'],
  }),
  createItem({
    title: 'Selective Amnesia Controller',
    subtitle: 'Intelligent data lifecycle management with retention policies',
    description: 'Manages data expiration across memory tiers with configurable retention policies. Supports importance-based preservation, GDPR-compliant data erasure, and selective forgetting to optimize memory utilization.',
    painPoints: ['Data hoarding', 'GDPR compliance', 'Memory bloat'],
    features: ['Retention policies', 'Importance scoring', 'GDPR erasure', 'Tier migration'],
    substrate: 'primary', vault: 's-tier', sourceId: 'S-CJ192', category: 'memory-chain',
    cjpi: 88, chain: ['MEMORY', 'BRAIN', 'GOVERNANCE'], tags: ['memory', 'gdpr', 'lifecycle'],
  }),

  // === CYBER SUBSTRATE ===
  createItem({
    title: 'Breach Penalty Calculator',
    subtitle: 'Automated regulatory penalty estimation for security breaches',
    description: 'Calculates estimated regulatory penalties across GDPR, CCPA, HIPAA, and SOX frameworks based on breach severity, affected records, and organizational compliance posture.',
    painPoints: ['Unknown breach costs', 'Multi-regulation compliance', 'No risk quantification'],
    features: ['Multi-framework support', 'Severity multipliers', 'Record-based scaling', 'Compliance offsets'],
    substrate: 'cyber', vault: 's-tier', sourceId: 'S-CY197', category: 'security-module',
    cjpi: 93, chain: ['PROWLER', 'CITADEL', 'GOVERNANCE'], tags: ['breach', 'penalty', 'compliance'],
  }),
  createItem({
    title: 'Stealth Operations Controller',
    subtitle: 'Covert signal routing with traffic obfuscation',
    description: 'Routes sensitive operations through encrypted channels with traffic pattern obfuscation, timing jitter, and decoy signal generation. Prevents adversarial traffic analysis.',
    painPoints: ['Signal interception', 'Traffic analysis attacks', 'Metadata leaks'],
    features: ['Channel encryption', 'Timing jitter', 'Decoy generation', 'Pattern obfuscation'],
    substrate: 'cyber', vault: 's-tier', sourceId: 'S-CY205', category: 'security-module',
    cjpi: 94, chain: ['SHADE', 'ONYX', 'DEFENSE'], tags: ['stealth', 'encryption', 'anti-surveillance'],
  }),
  createItem({
    title: 'Autoimmune Prevention Engine',
    subtitle: 'Prevents self-destructive defense responses',
    description: 'Monitors defensive systems for false positive cascades that could damage internal systems. Implements circuit breakers that distinguish genuine threats from friendly fire.',
    painPoints: ['False positive lockouts', 'Self-inflicted outages', 'Defense overreaction'],
    features: ['False positive detection', 'Circuit breakers', 'Friendly fire prevention', 'Escalation gates'],
    substrate: 'cyber', vault: 's-tier', sourceId: 'S-CY218', category: 'defense-layer',
    cjpi: 90, chain: ['CITADEL', 'DEFENSE', 'FAILSAFE'], tags: ['autoimmune', 'false-positive', 'resilience'],
  }),

  // === ROBOTICS SUBSTRATE ===
  createItem({
    title: 'Proximity Intelligence Engine',
    subtitle: 'Haversine-based spatial awareness with zone detection',
    description: 'Real-time proximity calculations using the Haversine formula for geospatial awareness. Supports zone boundary detection, proximity alerts, and spatial clustering for robotics coordination.',
    painPoints: ['No spatial awareness', 'Manual zone mapping', 'Collision risk'],
    features: ['Haversine distance', 'Zone detection', 'Proximity alerts', 'Spatial clustering'],
    substrate: 'robotics', vault: 's-tier', sourceId: 'S-RB195', category: 'robotics-controller',
    cjpi: 89, chain: ['SERVO', 'MARSHAL', 'DISPATCH'], tags: ['proximity', 'spatial', 'geofencing'],
  }),
  createItem({
    title: 'Mesh Topology Optimizer',
    subtitle: 'BFS-based network path optimization',
    description: 'Optimizes communication paths in multi-node robotic meshes using BFS pathfinding with weighted edges. Minimizes latency, detects network partitions, and auto-reroutes around failures.',
    painPoints: ['Network congestion', 'Path failures', 'Unoptimized routing'],
    features: ['BFS pathfinding', 'Weight optimization', 'Partition detection', 'Auto-rerouting'],
    substrate: 'robotics', vault: 's-tier', sourceId: 'S-RB199', category: 'robotics-controller',
    cjpi: 91, chain: ['DISPATCH', 'KINETIC', 'SYSTEM'], tags: ['mesh', 'routing', 'optimization'],
  }),

  // === QUANTUM SUBSTRATE ===
  createItem({
    title: 'Confidence Calibration Engine',
    subtitle: 'Platt-scaled probability calibration for model outputs',
    description: 'Applies Platt scaling and isotonic regression to calibrate model prediction probabilities. Ensures that a model reporting 80% confidence is actually correct 80% of the time.',
    painPoints: ['Overconfident models', 'Miscalibrated probabilities', 'Decision uncertainty'],
    features: ['Platt scaling', 'Isotonic regression', 'Calibration curves', 'Reliability diagrams'],
    substrate: 'quantum', vault: 's-tier', sourceId: 'S-QM212', category: 'quantum-optimizer',
    cjpi: 92, chain: ['HADRON', 'QUBIT', 'ORACLE'], tags: ['calibration', 'probability', 'confidence'],
  }),
  createItem({
    title: 'Cross-Border Transfer Arbiter',
    subtitle: 'Jurisdiction-aware data transfer compliance',
    description: 'Validates data transfers across jurisdictional boundaries against regulatory requirements (GDPR, CCPA, PIPL). Manages adequacy decisions, Standard Contractual Clauses, and Binding Corporate Rules.',
    painPoints: ['Cross-border violations', 'Data sovereignty', 'Transfer compliance'],
    features: ['Jurisdiction mapping', 'SCC management', 'Adequacy checking', 'BCR enforcement'],
    substrate: 'quantum', vault: 's-tier', sourceId: 'S-QM211', category: 'governance-tool',
    cjpi: 88, chain: ['HADRON', 'GOVERNANCE', 'DEFENSE'], tags: ['compliance', 'transfer', 'sovereignty'],
  }),

  // === LLM SUBSTRATE ===
  createItem({
    title: 'Polyglot Translation Matrix',
    subtitle: 'Fuzzy-matched multilingual translation engine',
    description: 'Translation engine with fuzzy string matching, context-aware phrase selection, and fallback chains. Supports dynamic terminology injection and domain-specific glossaries.',
    painPoints: ['Poor translations', 'Missing context', 'No domain terms'],
    features: ['Fuzzy matching', 'Context chains', 'Domain glossaries', 'Fallback languages'],
    substrate: 'llm', vault: 's-tier', sourceId: 'S-LM223', category: 'llm-toolkit',
    cjpi: 90, chain: ['ENVOY', 'VERITAS', 'DECODE'], tags: ['translation', 'multilingual', 'nlp'],
  }),
  createItem({
    title: 'Domain Terminology Forge',
    subtitle: 'Industry-specific vocabulary management',
    description: 'Manages domain-specific terminology with synonym resolution, acronym expansion, and contextual disambiguation. Enables LLMs to speak the language of your industry.',
    painPoints: ['Jargon misinterpretation', 'Acronym confusion', 'Domain blindness'],
    features: ['Term management', 'Synonym resolution', 'Acronym expansion', 'Context disambiguation'],
    substrate: 'llm', vault: 's-tier', sourceId: 'S-LM213', category: 'llm-toolkit',
    cjpi: 87, chain: ['VERITAS', 'DECODE', 'BRAIN'], tags: ['terminology', 'domain', 'vocabulary'],
  }),
  createItem({
    title: 'Universal Input Interpreter',
    subtitle: 'Multi-format input normalization and parsing',
    description: 'Normalizes inputs across JSON, XML, CSV, YAML, and natural language into a unified processing format. Handles malformed inputs gracefully with best-effort parsing and structured error reporting.',
    painPoints: ['Format fragmentation', 'Parsing errors', 'Input validation chaos'],
    features: ['Multi-format parsing', 'Best-effort recovery', 'Schema validation', 'Error reporting'],
    substrate: 'llm', vault: 's-tier', sourceId: 'S-LM206', category: 'integration-bridge',
    cjpi: 86, chain: ['DECODE', 'ENVOY', 'SYSTEM'], tags: ['parsing', 'input', 'normalization'],
  }),

  // === AGENCY SUBSTRATE ===
  createItem({
    title: 'Fair Negotiation Protocol',
    subtitle: 'Game-theory based multi-party negotiation engine',
    description: 'Implements Nash Equilibrium-seeking negotiation between autonomous agents. Supports Pareto-optimal outcome discovery, fairness constraints (Gini coefficient), and multi-round bidding with convergence detection.',
    painPoints: ['Unfair resource allocation', 'Deadlocked negotiations', 'Suboptimal outcomes'],
    features: ['Nash equilibrium seeking', 'Pareto optimization', 'Gini fairness', 'Convergence detection'],
    substrate: 'agency', vault: 's-tier', sourceId: 'S-AG208', category: 'agency-workflow',
    cjpi: 91, chain: ['OVERSEER', 'LIAISON', 'GOVERNANCE'], tags: ['negotiation', 'fairness', 'game-theory'],
  }),
  createItem({
    title: 'Cognitive Flame Graph',
    subtitle: 'Hierarchical execution profiling and bottleneck detection',
    description: 'Generates flame-graph style execution profiles for cognitive agent tasks. Identifies bottleneck spans, calculates critical path latency, and provides actionable optimization recommendations.',
    painPoints: ['Performance blind spots', 'Unknown bottlenecks', 'No profiling tools'],
    features: ['Flame graph generation', 'Critical path analysis', 'Bottleneck detection', 'Optimization hints'],
    substrate: 'agency', vault: 's-tier', sourceId: 'S-AG207', category: 'analytics-engine',
    cjpi: 89, chain: ['VISION', 'OVERSEER', 'SYSTEM'], tags: ['profiling', 'performance', 'flame-graph'],
  }),
  createItem({
    title: 'Gossip Protocol Engine',
    subtitle: 'Epidemic-style distributed state synchronization',
    description: 'Implements gossip protocol for eventually-consistent state propagation across distributed agent networks. Supports rumor spreading, anti-entropy repair, and partition-tolerant convergence.',
    painPoints: ['State inconsistency', 'Network partitions', 'Sync delays'],
    features: ['Gossip propagation', 'Anti-entropy', 'Partition tolerance', 'Convergence guarantees'],
    substrate: 'agency', vault: 's-tier', sourceId: 'S-AG220', category: 'agency-workflow',
    cjpi: 88, chain: ['LIAISON', 'DISPATCH', 'MEMORY'], tags: ['gossip', 'distributed', 'sync'],
  }),

  // === CROSS-SUBSTRATE DISCOVERIES ===
  createItem({
    title: 'Adaptive Interface Compiler',
    subtitle: 'Auto-generates UI schemas from data models',
    description: 'Inspects data schemas and generates optimized UI interface definitions including form layouts, validation rules, and accessibility annotations. Adapts to user device capabilities and preferences.',
    painPoints: ['Manual form building', 'No accessibility', 'Device fragmentation'],
    features: ['Schema inspection', 'UI generation', 'A11y annotations', 'Device adaptation'],
    substrate: 'primary', vault: 'discovery', sourceId: 'D-209', category: 'integration-bridge',
    cjpi: 85, chain: ['DECODE', 'INCLUSIVE', 'VISION'], tags: ['ui', 'forms', 'accessibility'],
  }),
  createItem({
    title: 'Progressive Migration Engine',
    subtitle: 'Zero-downtime schema and data migration',
    description: 'Manages progressive schema migrations with rollback capabilities, data backfill orchestration, and zero-downtime cutover. Supports canary deployments and percentage-based traffic splitting.',
    painPoints: ['Risky migrations', 'Downtime', 'Data loss fears'],
    features: ['Progressive rollout', 'Automatic rollback', 'Data backfill', 'Canary deployment'],
    substrate: 'primary', vault: 'discovery', sourceId: 'D-201', category: 'integration-bridge',
    cjpi: 87, chain: ['EVOLUTION', 'SYSTEM', 'FAILSAFE'], tags: ['migration', 'zero-downtime', 'deploy'],
  }),
  createItem({
    title: 'Predictive Intent Preloader',
    subtitle: 'Anticipates user actions and pre-fetches resources',
    description: 'Learns user navigation patterns and predictively preloads resources before they are requested. Reduces perceived latency by up to 60% through intelligent prefetching strategies.',
    painPoints: ['Slow page loads', 'User waiting', 'Wasted bandwidth'],
    features: ['Pattern learning', 'Predictive prefetch', 'Cache optimization', 'Bandwidth management'],
    substrate: 'llm', vault: 'discovery', sourceId: 'D-219', category: 'meta-engine',
    cjpi: 84, chain: ['BRAIN', 'MEMORY', 'DECODE'], tags: ['performance', 'prefetch', 'prediction'],
  }),
  createItem({
    title: 'Contract Evolution Mediator',
    subtitle: 'API versioning and backward compatibility manager',
    description: 'Manages API contract evolution across versions with automatic backward compatibility layers, deprecation scheduling, and client migration tooling.',
    painPoints: ['Breaking API changes', 'Version conflicts', 'Client migration'],
    features: ['Version management', 'Compatibility layers', 'Deprecation scheduling', 'Migration tools'],
    substrate: 'primary', vault: 'a-tier', sourceId: 'A-215', category: 'integration-bridge',
    cjpi: 83, chain: ['SYSTEM', 'EVOLUTION', 'DECODE'], tags: ['api', 'versioning', 'compatibility'],
  }),
];

/** Helper to create a marketplace item with calculated fields */
function createItem(input: {
  title: string;
  subtitle: string;
  description: string;
  painPoints: string[];
  features: string[];
  substrate: SourceSubstrate;
  vault: SourceVault;
  sourceId: string;
  category: ListingCategory;
  cjpi: number;
  chain: string[];
  tags: string[];
}): MarketplaceItem {
  const priceCents = calculateMarketplacePrice(input.cjpi, input.chain.length);
  const originalValueCents = input.cjpi * 150; // ECONOMY nominal per-point value
  
  return {
    id: `MKT-${input.sourceId}-${Date.now().toString(36).slice(-4)}`,
    slug: generateSlug(input.title),
    title: input.title,
    subtitle: input.subtitle,
    description: input.description,
    painPoints: input.painPoints,
    features: input.features,
    sourceSubstrate: input.substrate,
    sourceVault: input.vault,
    sourceId: input.sourceId,
    category: input.category,
    cjpiScore: input.cjpi,
    tier: getMarketplaceTier(input.cjpi),
    priceCents,
    originalValueCents,
    primitiveChain: input.chain,
    downloads: Math.floor(Math.random() * 500) + 50,
    rating: Number((4.0 + Math.random() * 0.9).toFixed(1)),
    isFeatured: input.cjpi >= 90,
    isNew: true,
    addedAt: new Date().toISOString(),
    lastVerifiedAt: new Date().toISOString(),
    version: '1.0.0',
    tags: input.tags,
  };
}

/** Get inventory summary statistics */
export function getInventoryStats(): {
  total: number;
  featured: number;
  avgPrice: string;
  substrates: number;
  categories: number;
} {
  const featured = MERCHANT_INVENTORY.filter(i => i.isFeatured).length;
  const avgCents = Math.round(
    MERCHANT_INVENTORY.reduce((sum, i) => sum + i.priceCents, 0) / MERCHANT_INVENTORY.length
  );
  const substrates = new Set(MERCHANT_INVENTORY.map(i => i.sourceSubstrate)).size;
  const categories = new Set(MERCHANT_INVENTORY.map(i => i.category)).size;

  return {
    total: MERCHANT_INVENTORY.length,
    featured,
    avgPrice: `$${(avgCents / 100).toFixed(0)}`,
    substrates,
    categories,
  };
}
