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

  // === KILLER ADDITIONS — PRIMARY ===
  createItem({
    title: 'Autonomous Healing Orchestrator',
    subtitle: 'Self-repairing infrastructure with zero human intervention',
    description: 'Detects degraded subsystems, isolates failures, and orchestrates multi-step recovery sequences autonomously. Learns from past incidents to prevent recurrence through pattern-matched prophylactic fixes.',
    painPoints: ['Manual incident response', 'Cascading failures', 'Mean-time-to-recovery hours'],
    features: ['Auto-detection', 'Isolation protocols', 'Recovery playbooks', 'Incident learning'],
    substrate: 'primary', vault: 's-tier', sourceId: 'S-CJ301', category: 'meta-engine',
    cjpi: 96, chain: ['FAILSAFE', 'DEFENSE', 'EVOLUTION', 'SYSTEM'], tags: ['self-healing', 'resilience', 'automation'],
  }),
  createItem({
    title: 'Recursive Value Extractor',
    subtitle: 'Uncovers hidden value in underutilized system capabilities',
    description: 'Deep-scans existing primitive compositions to identify dormant value chains—capabilities that exist but are never invoked. Quantifies opportunity cost and auto-generates activation plans.',
    painPoints: ['Wasted capability', 'Unknown features', 'ROI blind spots'],
    features: ['Dormancy detection', 'Value quantification', 'Activation planning', 'Usage heatmaps'],
    substrate: 'primary', vault: 's-tier', sourceId: 'S-CJ302', category: 'analytics-engine',
    cjpi: 90, chain: ['ATLAS', 'BRAIN', 'VISION'], tags: ['value', 'optimization', 'discovery'],
  }),
  createItem({
    title: 'Cognitive Load Balancer',
    subtitle: 'Distributes reasoning workloads across agent pools',
    description: 'Intelligently partitions complex cognitive tasks across available agent capacity using work-stealing algorithms and cognitive-cost estimation. Prevents any single agent from becoming a bottleneck.',
    painPoints: ['Agent overload', 'Uneven distribution', 'Throughput limits'],
    features: ['Work-stealing', 'Cost estimation', 'Queue balancing', 'Backpressure management'],
    substrate: 'primary', vault: 's-tier', sourceId: 'S-CJ303', category: 'meta-agent',
    cjpi: 93, chain: ['CORTEX', 'DISPATCH', 'SYSTEM'], tags: ['load-balancing', 'throughput', 'distribution'],
  }),
  createItem({
    title: 'Zero-Knowledge Proof Validator',
    subtitle: 'Privacy-preserving verification without data exposure',
    description: 'Validates claims about data properties without revealing the underlying data. Implements zk-SNARK-inspired proof verification for access control, age verification, and credential checking.',
    painPoints: ['Data exposure during verification', 'Privacy violations', 'Trust without proof'],
    features: ['ZK proof verification', 'Credential checking', 'Privacy preservation', 'Audit compatibility'],
    substrate: 'primary', vault: 's-tier', sourceId: 'S-CJ304', category: 'security-module',
    cjpi: 95, chain: ['DEFENSE', 'GOVERNANCE', 'AUDIT'], tags: ['zero-knowledge', 'privacy', 'verification'],
  }),
  createItem({
    title: 'Emergent Pattern Synthesizer',
    subtitle: 'Discovers novel patterns from cross-domain signal fusion',
    description: 'Fuses signals from disparate domains to identify emergent patterns invisible to single-domain analysis. Uses information-theoretic measures to quantify pattern novelty and significance.',
    painPoints: ['Siloed analysis', 'Missed cross-domain insights', 'Pattern blindness'],
    features: ['Cross-domain fusion', 'Novelty scoring', 'Significance testing', 'Pattern cataloging'],
    substrate: 'primary', vault: 's-tier', sourceId: 'S-CJ305', category: 'meta-engine',
    cjpi: 94, chain: ['BRAIN', 'ORACLE', 'VISION', 'ATLAS'], tags: ['emergence', 'patterns', 'fusion'],
  }),

  // === KILLER ADDITIONS — CYBER ===
  createItem({
    title: 'Threat Genome Sequencer',
    subtitle: 'DNA-style threat classification and lineage tracking',
    description: 'Decomposes attack vectors into constituent "genes"—TTPs, IOCs, and behavioral signatures—then maps lineage to known threat families. Predicts mutation paths for proactive defense.',
    painPoints: ['Unknown threat variants', 'No attack lineage', 'Reactive-only defense'],
    features: ['TTP decomposition', 'Lineage mapping', 'Mutation prediction', 'Family classification'],
    substrate: 'cyber', vault: 's-tier', sourceId: 'S-CY301', category: 'security-module',
    cjpi: 96, chain: ['PROWLER', 'WATCHTOWER', 'SHADE', 'CITADEL'], tags: ['threat-intel', 'genomics', 'prediction'],
  }),
  createItem({
    title: 'Phantom Decoy Network',
    subtitle: 'AI-generated honeypot infrastructure at scale',
    description: 'Deploys realistic decoy services, databases, and endpoints that are indistinguishable from production. Captures attacker TTPs in high-fidelity while wasting adversary resources.',
    painPoints: ['No early warning', 'Attackers reach real systems', 'No adversary intelligence'],
    features: ['Decoy generation', 'TTP capture', 'Attacker profiling', 'Resource exhaustion'],
    substrate: 'cyber', vault: 's-tier', sourceId: 'S-CY302', category: 'defense-layer',
    cjpi: 95, chain: ['SHADE', 'ONYX', 'PROWLER'], tags: ['honeypot', 'deception', 'threat-intel'],
  }),
  createItem({
    title: 'Cryptographic Agility Layer',
    subtitle: 'Hot-swap encryption algorithms without downtime',
    description: 'Enables runtime rotation of cryptographic algorithms across the entire stack. Supports post-quantum migration, key ceremony automation, and algorithm deprecation with zero-downtime cutover.',
    painPoints: ['Crypto algorithm lock-in', 'Post-quantum unpreparedness', 'Key rotation complexity'],
    features: ['Algorithm hot-swap', 'Post-quantum support', 'Key ceremony automation', 'Deprecation management'],
    substrate: 'cyber', vault: 's-tier', sourceId: 'S-CY303', category: 'security-module',
    cjpi: 94, chain: ['CITADEL', 'DEFENSE', 'EVOLUTION'], tags: ['cryptography', 'post-quantum', 'agility'],
  }),
  createItem({
    title: 'Behavioral Biometric Authenticator',
    subtitle: 'Continuous identity verification through usage patterns',
    description: 'Verifies user identity continuously through behavioral signals—typing cadence, navigation patterns, interaction timing—without interrupting workflow. Detects session hijacking in real-time.',
    painPoints: ['Session hijacking', 'Static credentials', 'User friction'],
    features: ['Behavioral analysis', 'Continuous verification', 'Hijack detection', 'Zero-friction auth'],
    substrate: 'cyber', vault: 's-tier', sourceId: 'S-CY304', category: 'security-module',
    cjpi: 91, chain: ['WATCHTOWER', 'PROWLER', 'BRAIN'], tags: ['biometrics', 'authentication', 'behavioral'],
  }),
  createItem({
    title: 'Supply Chain Integrity Verifier',
    subtitle: 'Cryptographic provenance for every dependency',
    description: 'Verifies the integrity and provenance of every software dependency from source to deployment. Detects supply chain attacks, typosquatting, and compromised packages before they enter the build pipeline.',
    painPoints: ['Supply chain attacks', 'Compromised dependencies', 'No provenance tracking'],
    features: ['Provenance verification', 'Typosquatting detection', 'Build integrity', 'SBOM generation'],
    substrate: 'cyber', vault: 's-tier', sourceId: 'S-CY305', category: 'defense-layer',
    cjpi: 93, chain: ['CITADEL', 'GOVERNANCE', 'AUDIT'], tags: ['supply-chain', 'sbom', 'integrity'],
  }),

  // === KILLER ADDITIONS — ROBOTICS ===
  createItem({
    title: 'Swarm Consensus Arbiter',
    subtitle: 'Byzantine fault-tolerant consensus for robot swarms',
    description: 'Achieves consensus across heterogeneous robot swarms despite communication failures and adversarial units. Implements practical BFT with sub-second finality for real-time coordination.',
    painPoints: ['Swarm disagreement', 'Byzantine actors', 'Coordination failure'],
    features: ['BFT consensus', 'Sub-second finality', 'Heterogeneous support', 'Adversary tolerance'],
    substrate: 'robotics', vault: 's-tier', sourceId: 'S-RB301', category: 'robotics-controller',
    cjpi: 95, chain: ['MARSHAL', 'DISPATCH', 'GOVERNANCE'], tags: ['swarm', 'consensus', 'bft'],
  }),
  createItem({
    title: 'Kinematic Chain Solver',
    subtitle: 'Real-time inverse kinematics for articulated systems',
    description: 'Solves inverse kinematics for multi-joint articulated systems in real-time using gradient descent with constraint satisfaction. Supports collision avoidance and workspace boundary enforcement.',
    painPoints: ['Joint limit violations', 'Slow IK solving', 'Collision risk'],
    features: ['Inverse kinematics', 'Collision avoidance', 'Joint constraints', 'Real-time solving'],
    substrate: 'robotics', vault: 's-tier', sourceId: 'S-RB302', category: 'robotics-controller',
    cjpi: 92, chain: ['SERVO', 'KINETIC', 'MARSHAL'], tags: ['kinematics', 'motion-planning', 'articulation'],
  }),
  createItem({
    title: 'Predictive Maintenance Oracle',
    subtitle: 'Failure prediction before degradation becomes visible',
    description: 'Monitors vibration signatures, thermal profiles, and operational telemetry to predict component failures days before they manifest. Schedules maintenance windows to minimize operational disruption.',
    painPoints: ['Unexpected breakdowns', 'Costly downtime', 'Reactive maintenance'],
    features: ['Vibration analysis', 'Thermal profiling', 'Failure prediction', 'Maintenance scheduling'],
    substrate: 'robotics', vault: 's-tier', sourceId: 'S-RB303', category: 'analytics-engine',
    cjpi: 93, chain: ['ORACLE', 'SERVO', 'FAILSAFE'], tags: ['maintenance', 'prediction', 'reliability'],
  }),
  createItem({
    title: 'Terrain Adaptation Controller',
    subtitle: 'Dynamic locomotion adjustment for variable surfaces',
    description: 'Adapts locomotion parameters in real-time based on surface analysis—friction coefficients, gradient detection, and obstacle classification. Enables robust navigation across unpredictable terrain.',
    painPoints: ['Terrain-related failures', 'Static locomotion', 'Surface uncertainty'],
    features: ['Surface analysis', 'Friction adaptation', 'Gradient detection', 'Obstacle classification'],
    substrate: 'robotics', vault: 's-tier', sourceId: 'S-RB304', category: 'robotics-controller',
    cjpi: 90, chain: ['KINETIC', 'SERVO', 'DISPATCH'], tags: ['terrain', 'locomotion', 'adaptation'],
  }),
  createItem({
    title: 'Multi-Sensor Fusion Engine',
    subtitle: 'Kalman-filtered sensor integration for precise state estimation',
    description: 'Fuses data from LIDAR, cameras, IMUs, and proprioceptive sensors using extended Kalman filtering. Produces a unified, noise-reduced state estimate that exceeds any single sensor\'s accuracy.',
    painPoints: ['Sensor disagreement', 'Noise accumulation', 'Single-sensor fragility'],
    features: ['Kalman filtering', 'Multi-modal fusion', 'Noise reduction', 'Confidence estimation'],
    substrate: 'robotics', vault: 's-tier', sourceId: 'S-RB305', category: 'robotics-controller',
    cjpi: 94, chain: ['SERVO', 'BRAIN', 'VISION'], tags: ['sensor-fusion', 'kalman', 'state-estimation'],
  }),

  // === KILLER ADDITIONS — QUANTUM ===
  createItem({
    title: 'Entanglement State Manager',
    subtitle: 'Lifecycle management for quantum entangled pairs',
    description: 'Manages the complete lifecycle of entangled quantum states—creation, distribution, purification, and measurement. Tracks Bell-state fidelity and triggers re-entanglement when coherence drops below threshold.',
    painPoints: ['Entanglement loss', 'State tracking complexity', 'Fidelity degradation'],
    features: ['State lifecycle', 'Bell-state monitoring', 'Purification protocols', 'Re-entanglement triggers'],
    substrate: 'quantum', vault: 's-tier', sourceId: 'S-QM301', category: 'quantum-optimizer',
    cjpi: 95, chain: ['QUBIT', 'HADRON', 'MEMORY'], tags: ['entanglement', 'quantum-state', 'fidelity'],
  }),
  createItem({
    title: 'Decoherence Shield Protocol',
    subtitle: 'Active noise suppression for quantum computation',
    description: 'Implements dynamical decoupling sequences and error-suppression protocols to extend quantum coherence times. Adapts pulse sequences in real-time based on measured noise spectra.',
    painPoints: ['Rapid decoherence', 'Environmental noise', 'Short coherence times'],
    features: ['Dynamical decoupling', 'Noise spectroscopy', 'Adaptive sequences', 'Coherence extension'],
    substrate: 'quantum', vault: 's-tier', sourceId: 'S-QM302', category: 'defense-layer',
    cjpi: 96, chain: ['HADRON', 'DEFENSE', 'FAILSAFE'], tags: ['decoherence', 'noise', 'quantum-protection'],
  }),
  createItem({
    title: 'Quantum Error Correction Engine',
    subtitle: 'Surface-code inspired logical qubit stabilization',
    description: 'Implements topological error correction using surface-code inspired stabilizer measurements. Detects and corrects bit-flip and phase-flip errors while maintaining logical qubit integrity.',
    painPoints: ['Quantum bit errors', 'Phase flips', 'Logical qubit instability'],
    features: ['Surface codes', 'Stabilizer measurement', 'Bit-flip correction', 'Phase-flip correction'],
    substrate: 'quantum', vault: 's-tier', sourceId: 'S-QM303', category: 'quantum-optimizer',
    cjpi: 97, chain: ['QUBIT', 'HADRON', 'DEFENSE', 'FAILSAFE'], tags: ['qec', 'error-correction', 'surface-code'],
  }),
  createItem({
    title: 'Superposition Decision Tree',
    subtitle: 'Quantum-inspired parallel hypothesis evaluation',
    description: 'Evaluates multiple decision branches simultaneously using quantum-inspired superposition principles. Collapses to optimal decisions through measurement-like scoring with interference-based pruning.',
    painPoints: ['Sequential decision-making', 'Combinatorial explosion', 'Suboptimal choices'],
    features: ['Parallel evaluation', 'Interference pruning', 'Collapse scoring', 'Branch weighting'],
    substrate: 'quantum', vault: 's-tier', sourceId: 'S-QM304', category: 'meta-engine',
    cjpi: 91, chain: ['HADRON', 'BRAIN', 'ORACLE'], tags: ['decision-tree', 'superposition', 'optimization'],
  }),

  // === KILLER ADDITIONS — LLM ===
  createItem({
    title: 'Hallucination Detection Grid',
    subtitle: 'Multi-pass factual verification for LLM outputs',
    description: 'Cross-references LLM outputs against grounded knowledge bases using entailment scoring, source attribution, and confidence-weighted fact-checking. Flags unsupported claims with severity grades.',
    painPoints: ['AI hallucinations', 'Unverified claims', 'Trust erosion'],
    features: ['Entailment scoring', 'Source attribution', 'Severity grading', 'Claim decomposition'],
    substrate: 'llm', vault: 's-tier', sourceId: 'S-LM301', category: 'llm-toolkit',
    cjpi: 96, chain: ['VERITAS', 'SKEPTIC', 'TRIBUNAL'], tags: ['hallucination', 'fact-checking', 'verification'],
  }),
  createItem({
    title: 'Prompt Injection Firewall',
    subtitle: 'Defense-in-depth against adversarial prompt attacks',
    description: 'Multi-layer defense against prompt injection, jailbreaking, and instruction hijacking. Uses canary tokens, output filtering, and semantic similarity to detect manipulation attempts.',
    painPoints: ['Prompt injection attacks', 'Jailbreak exploits', 'Instruction hijacking'],
    features: ['Canary tokens', 'Output filtering', 'Semantic analysis', 'Attack classification'],
    substrate: 'llm', vault: 's-tier', sourceId: 'S-LM302', category: 'security-module',
    cjpi: 95, chain: ['RAMPART', 'DEFENSE', 'VERITAS'], tags: ['prompt-injection', 'security', 'firewall'],
  }),
  createItem({
    title: 'Semantic Drift Monitor',
    subtitle: 'Detects meaning shift in model outputs over time',
    description: 'Tracks semantic consistency of model outputs across deployments by embedding comparison, distribution shift detection, and concept drift quantification. Alerts when model behavior deviates from baseline.',
    painPoints: ['Silent model degradation', 'Meaning drift', 'Undetected behavior change'],
    features: ['Embedding comparison', 'Distribution tracking', 'Drift quantification', 'Baseline management'],
    substrate: 'llm', vault: 's-tier', sourceId: 'S-LM303', category: 'analytics-engine',
    cjpi: 91, chain: ['VERITAS', 'VISION', 'MEMORY'], tags: ['semantic-drift', 'monitoring', 'model-quality'],
  }),
  createItem({
    title: 'Token Economy Optimizer',
    subtitle: 'Minimize token spend while maximizing output quality',
    description: 'Optimizes prompt construction, response caching, and model routing to minimize token consumption without sacrificing output quality. Includes cost attribution and budget enforcement per workflow.',
    painPoints: ['Runaway API costs', 'Token waste', 'No cost visibility'],
    features: ['Prompt optimization', 'Response caching', 'Cost attribution', 'Budget enforcement'],
    substrate: 'llm', vault: 's-tier', sourceId: 'S-LM304', category: 'meta-engine',
    cjpi: 89, chain: ['DECODE', 'BRAIN', 'SYSTEM'], tags: ['cost', 'optimization', 'tokens'],
  }),

  // === KILLER ADDITIONS — AGENCY ===
  createItem({
    title: 'Autonomous Budget Allocator',
    subtitle: 'Self-adjusting resource allocation based on ROI signals',
    description: 'Dynamically reallocates compute, memory, and API budgets across agent tasks based on real-time ROI measurements. Implements Kelly Criterion-inspired position sizing for resource bets.',
    painPoints: ['Static budgets', 'Resource waste', 'No ROI-based allocation'],
    features: ['Kelly sizing', 'ROI tracking', 'Dynamic reallocation', 'Budget enforcement'],
    substrate: 'agency', vault: 's-tier', sourceId: 'S-AG301', category: 'agency-workflow',
    cjpi: 92, chain: ['OVERSEER', 'MANDATE', 'SYSTEM'], tags: ['budget', 'allocation', 'roi'],
  }),
  createItem({
    title: 'Delegation Authority Chain',
    subtitle: 'Cryptographically verifiable task delegation with revocation',
    description: 'Implements a chain-of-authority model where task delegation creates verifiable capability tokens. Supports fine-grained permission scoping, time-bounded delegation, and instant revocation.',
    painPoints: ['Unauthorized actions', 'No delegation audit', 'Permission sprawl'],
    features: ['Capability tokens', 'Permission scoping', 'Time-bounded delegation', 'Revocation chains'],
    substrate: 'agency', vault: 's-tier', sourceId: 'S-AG302', category: 'governance-tool',
    cjpi: 93, chain: ['DELEGATE', 'MANDATE', 'GOVERNANCE'], tags: ['delegation', 'authority', 'capability'],
  }),
  createItem({
    title: 'Conflict Resolution Matrix',
    subtitle: 'Multi-strategy dispute resolution for competing agents',
    description: 'Resolves conflicts between autonomous agents using a portfolio of strategies—voting, auction, arbitration, and mediation. Selects resolution strategy based on conflict type, urgency, and stakeholder count.',
    painPoints: ['Agent deadlocks', 'Resource contention', 'Unresolved disputes'],
    features: ['Strategy portfolio', 'Urgency-based selection', 'Stakeholder weighting', 'Resolution logging'],
    substrate: 'agency', vault: 's-tier', sourceId: 'S-AG303', category: 'agency-workflow',
    cjpi: 90, chain: ['LIAISON', 'OVERSEER', 'GOVERNANCE'], tags: ['conflict', 'resolution', 'arbitration'],
  }),
  createItem({
    title: 'Collective Intelligence Aggregator',
    subtitle: 'Wisdom-of-crowds synthesis from distributed agent insights',
    description: 'Aggregates insights from multiple specialized agents using Delphi-method inspired iterative refinement. Weights contributions by agent competency scores and domain relevance to produce ensemble decisions.',
    painPoints: ['Single-agent bias', 'No ensemble decisions', 'Expertise silos'],
    features: ['Delphi method', 'Competency weighting', 'Iterative refinement', 'Ensemble synthesis'],
    substrate: 'agency', vault: 's-tier', sourceId: 'S-AG304', category: 'meta-agent',
    cjpi: 94, chain: ['OPERATOR', 'LIAISON', 'BRAIN', 'OVERSEER'], tags: ['collective', 'ensemble', 'wisdom'],
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
  
  /** Deterministic hash for stable IDs and seeded values */
  const hash = input.title.split('').reduce((h, c) => ((h << 5) - h + c.charCodeAt(0)) | 0, 0);
  const absHash = Math.abs(hash);
  const stableDownloads = 50 + (absHash % 451);
  const stableRating = Number((4.0 + ((absHash % 90) / 100)).toFixed(1));

  return {
    id: `MKT-${input.sourceId}`,
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
    downloads: stableDownloads,
    rating: stableRating,
    isFeatured: input.cjpi >= 90,
    isNew: true,
    addedAt: new Date().toISOString(),
    lastVerifiedAt: new Date().toISOString(),
    version: '1.0.0',
    tags: input.tags,
  };
}

/**
 * Deterministically select the current "free item" based on the 8-hour MERCHANT scan window.
 * Rotates every 8 hours so there's always exactly one free item in the store.
 */
export function getFreeItemIndex(inventory: MarketplaceItem[]): number {
  if (inventory.length === 0) return -1;
  const EIGHT_HOURS_MS = 8 * 60 * 60 * 1000;
  const windowIndex = Math.floor(Date.now() / EIGHT_HOURS_MS);
  return windowIndex % inventory.length;
}

/** Apply the free item override — sets one item to $0 */
export function applyFreeItemRotation(inventory: MarketplaceItem[]): MarketplaceItem[] {
  const idx = getFreeItemIndex(inventory);
  if (idx < 0) return inventory;
  return inventory.map((item, i) =>
    i === idx
      ? { ...item, priceCents: 0, isFeatured: true, tags: [...item.tags.filter(t => t !== 'free-drop'), 'free-drop'] }
      : item
  );
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
