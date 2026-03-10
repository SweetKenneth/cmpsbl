/**
 * Recursive Self-Improvement Capabilities — Registry
 * 10 Ultra-Premium Recursive Self-Improvement Artifacts
 * Highest-value capabilities in the Depot
 *
 */

import type { CapabilityArtifact } from './types';
import { RECURSIVE_STRIPE_CONFIG } from './stripe-recursive';

/**
 * Recursive Self-Improvement Capability Registry
 * Ordered by price tier (highest first)
 */
export const RECURSIVE_CAPABILITIES: CapabilityArtifact[] = [
  // ═══════════════════════════════════════════════════════════════════════════
  // 👑 APEX TIER — The Singularity Capabilities ($6,999)
  // ═══════════════════════════════════════════════════════════════════════════

  {
    id: 'recursive-self-optimization-core',
    slug: 'recursive-self-optimization-core',
    name: 'Recursive Self-Optimization Core',
    category: 'intelligence',
    description: 'APEX: System recursively improves its own improvement algorithms — infinite capability ceiling',
    longDescription: `The crown jewel of self-improvement. This capability enables a system to not just improve itself, but to improve the algorithms it uses to improve itself. Creates a compounding intelligence spiral with carefully bounded recursion limits.

**Why This Matters:**
- Traditional AI improves linearly; this improves exponentially
- Each optimization cycle makes the next cycle more effective
- Bounded recursion prevents runaway scenarios

**Buyer Persona:** Strategic AI Leadership, Research Labs, Advanced R&D`,
    requiredModules: ['CORTEX', 'DREAM', 'BRAIN', 'SYSTEM', 'VISION'],
    compatibleModules: ['DEFENSE', 'ATLAS', 'DECODE'],
    executorType: 'container',
    artifactFormat: 'container',
    version: '1.0.0',
    checksum: 'recursive-rso-apex-001',
    releaseNotes: '## v1.0.0 — APEX Release\n- Recursive optimization core\n- Bounded recursion limits\n- Meta-improvement algorithms\n- Safety interlocks',
    governanceLevel: 'governed',
    executionMode: 'local_only',
    supportPolicy: 'licensed_support',
    licenseRequired: true,
    priceUsd: RECURSIVE_STRIPE_CONFIG['recursive-self-optimization-core'].priceUsd,
    pricingTier: 'flagship',
    lastUpdated: '2025-02-02T00:00:00Z',
    releaseDate: '2025-02-02T00:00:00Z',
    downloads: 3,
    features: [
      'Recursive optimization',
      'Meta-improvement algorithms',
      'Bounded recursion limits',
      'Exponential capability growth',
      'Safety interlocks',
    ],
    tags: ['apex', 'recursive', 'self-improvement', 'singularity', 'crown-class'],
    difficulty: 'expert',
    setupTimeMinutes: 480,
    buyerPersona: 'Strategic AI Leadership, Research Labs',
    salesPitch: 'The system that improves itself improving itself.',
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 🔥 CROWN-CLASS — Architecture & Meta-Learning ($4,999 - $5,999)
  // ═══════════════════════════════════════════════════════════════════════════

  {
    id: 'recursive-architecture-refactorer',
    slug: 'recursive-architecture-refactorer',
    name: 'Autonomous Architecture Refactorer',
    category: 'intelligence',
    description: 'Self-improvement: Rewrites its own architecture for optimal performance — dynamic topology',
    longDescription: `The system that redesigns itself. This capability allows intelligent systems to analyze their own architecture and autonomously refactor it for improved performance, reduced latency, and better resource utilization.

**Key Differentiators:**
- Topology-aware optimization
- Module dependency analysis
- Non-disruptive refactoring
- Performance regression guards`,
    requiredModules: ['SYSTEM', 'CORTEX', 'EVOLUTION', 'VISION'],
    compatibleModules: ['DREAM', 'BRAIN', 'ATLAS'],
    executorType: 'container',
    artifactFormat: 'container',
    version: '1.0.0',
    checksum: 'recursive-aar-crown-001',
    releaseNotes: '## v1.0.0 — Crown-Class\n- Autonomous architecture analysis\n- Self-refactoring protocols\n- Topology optimization\n- Regression guards',
    governanceLevel: 'governed',
    executionMode: 'local_only',
    supportPolicy: 'licensed_support',
    licenseRequired: true,
    priceUsd: RECURSIVE_STRIPE_CONFIG['recursive-architecture-refactorer'].priceUsd,
    pricingTier: 'flagship',
    lastUpdated: '2025-02-02T00:00:00Z',
    releaseDate: '2025-02-02T00:00:00Z',
    downloads: 5,
    features: [
      'Architecture analysis',
      'Autonomous refactoring',
      'Topology optimization',
      'Performance guards',
      'Dependency management',
    ],
    tags: ['crown-class', 'architecture', 'self-improvement', 'refactoring'],
    difficulty: 'expert',
    setupTimeMinutes: 360,
    buyerPersona: 'Platform Architecture, Advanced DevOps',
    salesPitch: 'Systems that redesign themselves.',
  },
  {
    id: 'recursive-meta-learning-accelerator',
    slug: 'recursive-meta-learning-accelerator',
    name: 'Meta-Learning Accelerator',
    category: 'intelligence',
    description: 'Self-improvement: Learns how to learn faster — exponential capability growth curves',
    longDescription: `Beyond regular learning lies meta-learning: learning how to learn. This capability accelerates all other learning processes by continuously optimizing the learning algorithms themselves.

**Compounding Returns:**
- Each learning cycle informs the next
- Patterns in learning become leverage points
- Transfer learning across domains`,
    requiredModules: ['BRAIN', 'DREAM', 'CORTEX', 'VISION'],
    compatibleModules: ['SYSTEM', 'DECODE'],
    executorType: 'container',
    artifactFormat: 'container',
    version: '1.0.0',
    checksum: 'recursive-mla-crown-001',
    releaseNotes: '## v1.0.0\n- Meta-learning protocols\n- Learning acceleration\n- Cross-domain transfer\n- Pattern leverage',
    governanceLevel: 'bounded',
    executionMode: 'local_only',
    supportPolicy: 'licensed_support',
    licenseRequired: true,
    priceUsd: RECURSIVE_STRIPE_CONFIG['recursive-meta-learning-accelerator'].priceUsd,
    pricingTier: 'flagship',
    lastUpdated: '2025-02-02T00:00:00Z',
    releaseDate: '2025-02-02T00:00:00Z',
    downloads: 8,
    features: [
      'Meta-learning algorithms',
      'Learning acceleration',
      'Cross-domain transfer',
      'Pattern recognition',
      'Capability compounding',
    ],
    tags: ['crown-class', 'meta-learning', 'self-improvement', 'acceleration'],
    difficulty: 'expert',
    setupTimeMinutes: 300,
    buyerPersona: 'AI Research, ML Leadership',
    salesPitch: 'Learn how to learn faster.',
  },
  {
    id: 'recursive-cognitive-bootstrapping',
    slug: 'recursive-cognitive-bootstrapping',
    name: 'Cognitive Bootstrapping Engine',
    category: 'intelligence',
    description: 'Self-improvement: Bootstraps new cognitive capabilities from existing knowledge base',
    longDescription: `Create new capabilities from existing ones. This engine identifies gaps in cognitive coverage and synthesizes new capabilities by combining and extending existing knowledge patterns.

**Capability Genesis:**
- Gap analysis in cognitive coverage
- Synthesis from existing primitives
- Validation before activation
- Gradual capability rollout`,
    requiredModules: ['CORTEX', 'BRAIN', 'DREAM', 'SYSTEM'],
    compatibleModules: ['VISION', 'DECODE'],
    executorType: 'container',
    artifactFormat: 'container',
    version: '1.0.0',
    checksum: 'recursive-cbe-crown-001',
    releaseNotes: '## v1.0.0\n- Capability bootstrapping\n- Gap analysis\n- Knowledge synthesis\n- Rollout protocols',
    governanceLevel: 'governed',
    executionMode: 'local_only',
    supportPolicy: 'licensed_support',
    licenseRequired: true,
    priceUsd: RECURSIVE_STRIPE_CONFIG['recursive-cognitive-bootstrapping'].priceUsd,
    pricingTier: 'flagship',
    lastUpdated: '2025-02-02T00:00:00Z',
    releaseDate: '2025-02-02T00:00:00Z',
    downloads: 12,
    features: [
      'Capability synthesis',
      'Gap analysis',
      'Knowledge combination',
      'Validation protocols',
      'Gradual rollout',
    ],
    tags: ['crown-class', 'bootstrapping', 'self-improvement', 'synthesis'],
    difficulty: 'expert',
    setupTimeMinutes: 240,
    buyerPersona: 'AI Platform Teams, Research',
    salesPitch: 'Create new capabilities from existing knowledge.',
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // ⚡ ENTERPRISE — Self-Healing & Context ($3,799 - $4,499)
  // ═══════════════════════════════════════════════════════════════════════════

  {
    id: 'recursive-self-healing-mesh',
    slug: 'recursive-self-healing-mesh',
    name: 'Self-Healing Neural Mesh',
    category: 'resilience',
    description: 'Self-improvement: Automatically repairs and optimizes decision pathways in real-time',
    longDescription: `Decision pathways degrade over time. This mesh continuously monitors, repairs, and optimizes neural pathways for peak cognitive performance. Self-healing without human intervention.

**Autonomous Recovery:**
- Pathway degradation detection
- Automatic repair protocols
- Performance optimization
- Zero-downtime healing`,
    requiredModules: ['MEDIC', 'SYSTEM', 'CORTEX', 'VISION'],
    compatibleModules: ['BRAIN', 'DEFENSE'],
    executorType: 'container',
    artifactFormat: 'container',
    version: '1.0.0',
    checksum: 'recursive-shm-enterprise-001',
    releaseNotes: '## v1.0.0\n- Self-healing protocols\n- Pathway optimization\n- Degradation detection\n- Zero-downtime repairs',
    governanceLevel: 'bounded',
    executionMode: 'local_only',
    supportPolicy: 'licensed_support',
    licenseRequired: true,
    priceUsd: RECURSIVE_STRIPE_CONFIG['recursive-self-healing-mesh'].priceUsd,
    pricingTier: 'flagship',
    lastUpdated: '2025-02-02T00:00:00Z',
    releaseDate: '2025-02-02T00:00:00Z',
    downloads: 18,
    features: [
      'Self-healing',
      'Pathway repair',
      'Performance optimization',
      'Zero-downtime',
      'Autonomous recovery',
    ],
    tags: ['enterprise', 'self-healing', 'neural', 'resilience'],
    difficulty: 'advanced',
    setupTimeMinutes: 180,
    buyerPersona: 'SRE, Platform Reliability',
    salesPitch: 'Systems that heal themselves.',
  },
  {
    id: 'recursive-infinite-context',
    slug: 'recursive-infinite-context',
    name: 'Infinite Context Synthesizer',
    category: 'intelligence',
    description: 'Self-improvement: Dynamically expands context capacity through compression learning',
    longDescription: `Context windows are a bottleneck. This synthesizer learns to compress and decompress context on-the-fly, effectively creating infinite context capacity through intelligent compression algorithms.

**Unlimited Context:**
- Lossy and lossless compression
- Priority-based retention
- Dynamic expansion/contraction
- Semantic preservation`,
    requiredModules: ['BRAIN', 'CORTEX', 'VISION'],
    compatibleModules: ['DREAM', 'DECODE'],
    executorType: 'container',
    artifactFormat: 'container',
    version: '1.0.0',
    checksum: 'recursive-ics-enterprise-001',
    releaseNotes: '## v1.0.0\n- Context compression\n- Dynamic expansion\n- Priority retention\n- Semantic preservation',
    governanceLevel: 'bounded',
    executionMode: 'local_only',
    supportPolicy: 'licensed_support',
    licenseRequired: true,
    priceUsd: RECURSIVE_STRIPE_CONFIG['recursive-infinite-context'].priceUsd,
    pricingTier: 'flagship',
    lastUpdated: '2025-02-02T00:00:00Z',
    releaseDate: '2025-02-02T00:00:00Z',
    downloads: 24,
    features: [
      'Context compression',
      'Dynamic expansion',
      'Priority retention',
      'Semantic preservation',
      'Infinite capacity',
    ],
    tags: ['enterprise', 'context', 'compression', 'self-improvement'],
    difficulty: 'advanced',
    setupTimeMinutes: 150,
    buyerPersona: 'LLM Operations, Platform Teams',
    salesPitch: 'No more context limits.',
  },
  {
    id: 'recursive-capability-discoverer',
    slug: 'recursive-capability-discoverer',
    name: 'Emergent Capability Discoverer',
    category: 'intelligence',
    description: 'Self-improvement: Discovers and activates latent capabilities through exploration',
    longDescription: `Hidden capabilities lie dormant in complex systems. This discoverer actively explores the capability space, identifies latent potentials, and safely activates them through controlled experimentation.

**Capability Mining:**
- Latent capability detection
- Safe activation protocols
- Controlled experimentation
- Capability validation`,
    requiredModules: ['DREAM', 'CORTEX', 'VISION', 'SYSTEM'],
    compatibleModules: ['BRAIN', 'DEFENSE'],
    executorType: 'container',
    artifactFormat: 'container',
    version: '1.0.0',
    checksum: 'recursive-ecd-enterprise-001',
    releaseNotes: '## v1.0.0\n- Capability discovery\n- Safe activation\n- Controlled exploration\n- Validation protocols',
    governanceLevel: 'governed',
    executionMode: 'local_only',
    supportPolicy: 'licensed_support',
    licenseRequired: true,
    priceUsd: RECURSIVE_STRIPE_CONFIG['recursive-capability-discoverer'].priceUsd,
    pricingTier: 'flagship',
    lastUpdated: '2025-02-02T00:00:00Z',
    releaseDate: '2025-02-02T00:00:00Z',
    downloads: 15,
    features: [
      'Capability discovery',
      'Latent detection',
      'Safe activation',
      'Exploration protocols',
      'Validation',
    ],
    tags: ['enterprise', 'discovery', 'exploration', 'self-improvement'],
    difficulty: 'advanced',
    setupTimeMinutes: 180,
    buyerPersona: 'AI Research, Platform Innovation',
    salesPitch: 'Find capabilities you didnt know you had.',
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 🧠 PLATFORM — Knowledge & Optimization ($2,999 - $3,499)
  // ═══════════════════════════════════════════════════════════════════════════

  {
    id: 'recursive-knowledge-crystallization',
    slug: 'recursive-knowledge-crystallization',
    name: 'Knowledge Crystallization Engine',
    category: 'intelligence',
    description: 'Self-improvement: Converts tacit knowledge into explicit, reusable patterns',
    longDescription: `Tacit knowledge is hidden gold. This engine extracts implicit knowledge patterns and crystallizes them into explicit, documented, and reusable artifacts that persist beyond individual interactions.

**Knowledge Extraction:**
- Tacit-to-explicit conversion
- Pattern crystallization
- Documentation generation
- Reusable artifact creation`,
    requiredModules: ['BRAIN', 'CORTEX', 'DECODE'],
    compatibleModules: ['DREAM', 'VISION'],
    executorType: 'js',
    artifactFormat: 'zip',
    version: '1.0.0',
    checksum: 'recursive-kce-platform-001',
    releaseNotes: '## v1.0.0\n- Knowledge extraction\n- Pattern crystallization\n- Documentation generation\n- Artifact creation',
    governanceLevel: 'bounded',
    executionMode: 'local_only',
    supportPolicy: 'licensed_support',
    licenseRequired: true,
    priceUsd: RECURSIVE_STRIPE_CONFIG['recursive-knowledge-crystallization'].priceUsd,
    pricingTier: 'flagship',
    lastUpdated: '2025-02-02T00:00:00Z',
    releaseDate: '2025-02-02T00:00:00Z',
    downloads: 32,
    features: [
      'Knowledge extraction',
      'Pattern crystallization',
      'Documentation',
      'Artifact creation',
      'Persistence',
    ],
    tags: ['platform', 'knowledge', 'crystallization', 'self-improvement'],
    difficulty: 'intermediate',
    setupTimeMinutes: 120,
    buyerPersona: 'Knowledge Management, Platform Teams',
    salesPitch: 'Turn hidden knowledge into reusable assets.',
  },
  {
    id: 'recursive-goal-optimizer',
    slug: 'recursive-goal-optimizer',
    name: 'Recursive Goal Optimizer',
    category: 'intelligence',
    description: 'Self-improvement: Recursively refines goals for optimal outcomes and alignment',
    longDescription: `Goals drift. This optimizer continuously refines objectives based on outcomes, ensuring alignment between stated goals and actual results. Recursive refinement creates ever-more-precise targeting.

**Goal Refinement:**
- Outcome-based adjustment
- Alignment verification
- Recursive refinement loops
- Drift prevention`,
    requiredModules: ['CORTEX', 'VISION', 'BRAIN'],
    compatibleModules: ['DREAM', 'SYSTEM'],
    executorType: 'js',
    artifactFormat: 'zip',
    version: '1.0.0',
    checksum: 'recursive-rgo-platform-001',
    releaseNotes: '## v1.0.0\n- Goal refinement\n- Alignment verification\n- Recursive loops\n- Drift prevention',
    governanceLevel: 'governed',
    executionMode: 'local_only',
    supportPolicy: 'licensed_support',
    licenseRequired: true,
    priceUsd: RECURSIVE_STRIPE_CONFIG['recursive-goal-optimizer'].priceUsd,
    pricingTier: 'flagship',
    lastUpdated: '2025-02-02T00:00:00Z',
    releaseDate: '2025-02-02T00:00:00Z',
    downloads: 28,
    features: [
      'Goal refinement',
      'Alignment verification',
      'Recursive optimization',
      'Drift prevention',
      'Outcome tracking',
    ],
    tags: ['platform', 'goals', 'optimization', 'self-improvement'],
    difficulty: 'intermediate',
    setupTimeMinutes: 90,
    buyerPersona: 'Strategy, Product Management',
    salesPitch: 'Goals that refine themselves.',
  },
  {
    id: 'recursive-prompt-optimizer',
    slug: 'recursive-prompt-optimizer',
    name: 'Autonomous Prompt Optimizer',
    category: 'automation',
    description: 'Self-improvement: Self-optimizes prompt templates for maximum effectiveness',
    longDescription: `Prompts are the interface to intelligence. This optimizer continuously refines prompt templates based on outcome metrics, discovering more effective formulations through systematic experimentation.

**Prompt Evolution:**
- A/B testing at scale
- Outcome correlation
- Template refinement
- Effectiveness maximization`,
    requiredModules: ['CORTEX', 'BRAIN', 'VISION'],
    compatibleModules: ['DREAM', 'DECODE'],
    executorType: 'js',
    artifactFormat: 'zip',
    version: '1.0.0',
    checksum: 'recursive-apo-platform-001',
    releaseNotes: '## v1.0.0\n- Prompt optimization\n- A/B testing\n- Outcome correlation\n- Template evolution',
    governanceLevel: 'bounded',
    executionMode: 'local_only',
    supportPolicy: 'licensed_support',
    licenseRequired: true,
    priceUsd: RECURSIVE_STRIPE_CONFIG['recursive-prompt-optimizer'].priceUsd,
    pricingTier: 'flagship',
    lastUpdated: '2025-02-02T00:00:00Z',
    releaseDate: '2025-02-02T00:00:00Z',
    downloads: 45,
    features: [
      'Prompt optimization',
      'A/B testing',
      'Outcome correlation',
      'Template evolution',
      'Effectiveness metrics',
    ],
    tags: ['platform', 'prompts', 'optimization', 'self-improvement'],
    difficulty: 'intermediate',
    setupTimeMinutes: 60,
    buyerPersona: 'Prompt Engineers, LLM Ops',
    salesPitch: 'Prompts that optimize themselves.',
  },
];

// Get all recursive capabilities
export function getAllRecursiveCapabilities(): CapabilityArtifact[] {
  return RECURSIVE_CAPABILITIES;
}

// Get recursive capability by ID
export function getRecursiveCapabilityById(id: string): CapabilityArtifact | undefined {
  return RECURSIVE_CAPABILITIES.find(cap => cap.id === id);
}

// Get apex tier capabilities (highest price)
export function getApexCapabilities(): CapabilityArtifact[] {
  return RECURSIVE_CAPABILITIES.filter(cap => cap.tags?.includes('apex'));
}

// Get count
export function getRecursiveCapabilityCount(): number {
  return RECURSIVE_CAPABILITIES.length;
}
