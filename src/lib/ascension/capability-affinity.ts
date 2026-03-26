/**
 * CMPSBL® Capability Affinity System
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Classifies uploaded software into archetypes, then selects
 * capabilities from a style-filtered, CJPI-weighted pool.
 *
 * Archetype detection → Style filtering → Weighted random selection
 *
 * © CMPSBL® — All rights reserved.
 */

// ═══════════════════════════════════════════════════════════════════════════════
// §1 — ARCHETYPES
// ═══════════════════════════════════════════════════════════════════════════════

export type SoftwareArchetype = 'active' | 'passive' | 'hybrid';

export type CapabilityStyle = 'action' | 'passive' | 'universal';

export interface ArchetypeSignal {
  keyword: string;
  weight: number;
  archetype: SoftwareArchetype;
}

/**
 * Signals used to classify uploaded code into an archetype.
 * Each keyword carries a weighted vote toward an archetype.
 */
const ARCHETYPE_SIGNALS: ArchetypeSignal[] = [
  // Active signals — agents, bots, workers, scrapers
  { keyword: 'agent', weight: 3, archetype: 'active' },
  { keyword: 'bot', weight: 3, archetype: 'active' },
  { keyword: 'worker', weight: 2, archetype: 'active' },
  { keyword: 'scraper', weight: 2, archetype: 'active' },
  { keyword: 'crawler', weight: 2, archetype: 'active' },
  { keyword: 'cron', weight: 2, archetype: 'active' },
  { keyword: 'daemon', weight: 2, archetype: 'active' },
  { keyword: 'scheduler', weight: 2, archetype: 'active' },
  { keyword: 'polling', weight: 1.5, archetype: 'active' },
  { keyword: 'setInterval', weight: 1.5, archetype: 'active' },
  { keyword: 'while(true)', weight: 2, archetype: 'active' },
  { keyword: 'for(;;)', weight: 2, archetype: 'active' },
  { keyword: 'async function', weight: 1, archetype: 'active' },
  { keyword: 'await', weight: 0.5, archetype: 'active' },
  { keyword: 'fetch(', weight: 1, archetype: 'active' },
  { keyword: 'callLLM', weight: 2, archetype: 'active' },
  { keyword: 'openai', weight: 1.5, archetype: 'active' },
  { keyword: 'anthropic', weight: 1.5, archetype: 'active' },
  { keyword: 'research', weight: 1, archetype: 'active' },
  { keyword: 'execute', weight: 1, archetype: 'active' },
  { keyword: 'process(', weight: 1, archetype: 'active' },

  // Passive signals — UIs, auth screens, dashboards, static apps
  { keyword: 'render', weight: 2, archetype: 'passive' },
  { keyword: 'component', weight: 2, archetype: 'passive' },
  { keyword: 'useState', weight: 2, archetype: 'passive' },
  { keyword: 'useEffect', weight: 1.5, archetype: 'passive' },
  { keyword: 'onClick', weight: 1.5, archetype: 'passive' },
  { keyword: 'className', weight: 1, archetype: 'passive' },
  { keyword: '<form', weight: 2, archetype: 'passive' },
  { keyword: '<input', weight: 1.5, archetype: 'passive' },
  { keyword: '<button', weight: 1, archetype: 'passive' },
  { keyword: 'login', weight: 1.5, archetype: 'passive' },
  { keyword: 'auth', weight: 1.5, archetype: 'passive' },
  { keyword: 'dashboard', weight: 1.5, archetype: 'passive' },
  { keyword: 'template', weight: 1, archetype: 'passive' },
  { keyword: 'style', weight: 0.5, archetype: 'passive' },
  { keyword: 'css', weight: 0.5, archetype: 'passive' },
  { keyword: 'html', weight: 1, archetype: 'passive' },

  // Hybrid signals — APIs, middleware, pipelines
  { keyword: 'middleware', weight: 2, archetype: 'hybrid' },
  { keyword: 'router', weight: 1.5, archetype: 'hybrid' },
  { keyword: 'express', weight: 2, archetype: 'hybrid' },
  { keyword: 'fastify', weight: 2, archetype: 'hybrid' },
  { keyword: 'app.get', weight: 1.5, archetype: 'hybrid' },
  { keyword: 'app.post', weight: 1.5, archetype: 'hybrid' },
  { keyword: 'pipeline', weight: 2, archetype: 'hybrid' },
  { keyword: 'transform', weight: 1, archetype: 'hybrid' },
  { keyword: 'stream', weight: 1.5, archetype: 'hybrid' },
  { keyword: 'req, res', weight: 2, archetype: 'hybrid' },
  { keyword: 'endpoint', weight: 1.5, archetype: 'hybrid' },
  { keyword: 'handler', weight: 1, archetype: 'hybrid' },
];


// ═══════════════════════════════════════════════════════════════════════════════
// §2 — SUBSTRATE CAPABILITIES WITH STYLE TAGS
// ═══════════════════════════════════════════════════════════════════════════════

export interface SubstrateCapability {
  id: string;
  primitive: string;
  name: string;
  description: string;
  /** Which archetype styles this capability is compatible with */
  styles: CapabilityStyle[];
  /** Base CJPI affinity weight (higher = more likely to be selected) */
  baseWeight: number;
  /** What this capability adds, phrased for investors */
  investorValue: string;
}

export const SUBSTRATE_CAPABILITIES: SubstrateCapability[] = [
  // ── ACTION capabilities (agents, bots, workers) ──
  {
    id: 'dream-states',
    primitive: 'DREAM',
    name: 'Autonomous Learning Cycles',
    description: 'Agent enters background DREAM states to consolidate learnings, discover optimization patterns, and self-improve between active sessions.',
    styles: ['action'],
    baseWeight: 92,
    investorValue: 'Agent improves autonomously — no human retraining required.',
  },
  {
    id: 'nexus-routing',
    primitive: 'NEXUS',
    name: 'Model-Agnostic AI Routing',
    description: 'Routes each AI call to the optimal provider based on task type, latency, and cost. Automatic fallback across 12+ providers.',
    styles: ['action'],
    baseWeight: 95,
    investorValue: 'Zero vendor lock-in. Automatic cost optimization across all AI providers.',
  },
  {
    id: 'memory-persistence',
    primitive: 'MEMORY',
    name: 'Persistent Semantic Memory',
    description: 'Agent remembers past interactions, research, and decisions across sessions with TTL-controlled retention.',
    styles: ['action'],
    baseWeight: 90,
    investorValue: 'Eliminates redundant API calls. Up to 90% cost reduction on repeated work.',
  },
  {
    id: 'echo-amplification',
    primitive: 'ECHO',
    name: 'Signal Pattern Amplification',
    description: 'Detects recurring patterns in agent behavior and amplifies successful strategies while dampening failure patterns.',
    styles: ['action'],
    baseWeight: 78,
    investorValue: 'Agent gets measurably better over time through pattern recognition.',
  },
  {
    id: 'oracle-prediction',
    primitive: 'ORACLE',
    name: 'Predictive Task Planning',
    description: 'Bayesian prediction network anticipates likely next tasks and pre-fetches resources, reducing latency by 40-60%.',
    styles: ['action'],
    baseWeight: 82,
    investorValue: 'Agents anticipate what's needed next — faster response, lower cost.',
  },
  {
    id: 'cortex-orchestration',
    primitive: 'CORTEX',
    name: 'Multi-Step Task Orchestration',
    description: 'DAG-based execution engine decomposes complex goals into parallel sub-tasks with dependency resolution.',
    styles: ['action'],
    baseWeight: 88,
    investorValue: 'Complex workflows execute in parallel — 3-5x faster than sequential.',
  },
  {
    id: 'harvest-data',
    primitive: 'HARVEST',
    name: 'Autonomous Data Ingestion',
    description: 'Thermal-aware crawler swarm discovers and ingests relevant data sources with DNA-profiling for quality.',
    styles: ['action'],
    baseWeight: 75,
    investorValue: 'Agent builds its own knowledge base from the live web.',
  },

  // ── PASSIVE capabilities (UIs, dashboards, static apps) ──
  {
    id: 'identity-binding',
    primitive: 'IDENTITY',
    name: 'Session Identity Binding',
    description: 'Binds authenticated sessions with fingerprinting, device attestation, and behavioral biometrics.',
    styles: ['passive'],
    baseWeight: 88,
    investorValue: 'Enterprise-grade auth hardening with zero additional code.',
  },
  {
    id: 'vision-accessibility',
    primitive: 'VISION',
    name: 'Accessibility Compliance Scanner',
    description: 'Continuous WCAG 2.1 AA scanning with auto-fix suggestions for color contrast, focus traps, and ARIA labels.',
    styles: ['passive'],
    baseWeight: 80,
    investorValue: 'Automatic ADA compliance — avoids lawsuits ($50K+ per violation).',
  },
  {
    id: 'inclusive-i18n',
    primitive: 'INCLUSIVE',
    name: 'Inclusive Internationalization',
    description: 'RTL layout support, cultural sensitivity checks, and automated translation pipeline for 40+ locales.',
    styles: ['passive'],
    baseWeight: 72,
    investorValue: 'Instant global market access without localization teams.',
  },
  {
    id: 'relay-realtime',
    primitive: 'RELAY',
    name: 'Real-Time State Sync',
    description: 'WebSocket-backed state synchronization across browser tabs, devices, and server with conflict resolution.',
    styles: ['passive'],
    baseWeight: 85,
    investorValue: 'Multi-device, real-time experience with zero custom infrastructure.',
  },
  {
    id: 'integration-bridge',
    primitive: 'INTEGRATION',
    name: 'External Service Bridge',
    description: 'Pre-built connectors for 50+ SaaS services with OAuth flow management and webhook orchestration.',
    styles: ['passive'],
    baseWeight: 78,
    investorValue: 'Plugs into existing business tools without custom integration work.',
  },

  // ── UNIVERSAL capabilities (all archetypes) ──
  {
    id: 'defense-scoring',
    primitive: 'DEFENSE',
    name: 'Threat Detection & Rate Limiting',
    description: 'O(1) trie-based threat scoring on every request. Prompt injection, abuse patterns, and DDoS protection.',
    styles: ['action', 'passive', 'universal'],
    baseWeight: 96,
    investorValue: 'Enterprise security layer. Every input scored before execution.',
  },
  {
    id: 'governance-policy',
    primitive: 'GOVERNANCE',
    name: 'Policy & Cost Governance',
    description: 'Enforces per-operation cost budgets, content policies, and compliance rules before any action executes.',
    styles: ['action', 'passive', 'universal'],
    baseWeight: 93,
    investorValue: 'Structural cost control and compliance — not just prompt instructions.',
  },
  {
    id: 'audit-chain',
    primitive: 'AUDIT',
    name: 'Hash-Chained Audit Trail',
    description: 'Every operation logged in a tamper-proof, hash-chained audit ledger with cryptographic integrity verification.',
    styles: ['action', 'passive', 'universal'],
    baseWeight: 91,
    investorValue: 'Enterprise compliance ready. SOC 2, HIPAA audit requirements met.',
  },
  {
    id: 'immunity-healing',
    primitive: 'IMMUNITY',
    name: 'Self-Healing Error Recovery',
    description: 'Autonomous repair cycles detect degradation, isolate failures, and apply governed patches in shadow mode.',
    styles: ['action', 'passive', 'universal'],
    baseWeight: 86,
    investorValue: 'Software that fixes itself. 99.99% uptime without on-call engineers.',
  },
  {
    id: 'reflex-recovery',
    primitive: 'REFLEX',
    name: 'Instant Failure Response',
    description: 'Sub-millisecond circuit breakers, automatic retry with exponential backoff, and graceful degradation paths.',
    styles: ['action', 'passive', 'universal'],
    baseWeight: 84,
    investorValue: 'Never crashes. Degrades gracefully under any failure condition.',
  },
  {
    id: 'evolution-mutation',
    primitive: 'EVOLUTION',
    name: 'Governed Self-Improvement',
    description: 'AI-proposed code mutations validated through a 7-gate SEBA pipeline before promotion to production.',
    styles: ['action', 'passive', 'universal'],
    baseWeight: 80,
    investorValue: 'Software evolves itself — safely, with human approval gates.',
  },
];


// ═══════════════════════════════════════════════════════════════════════════════
// §3 — ARCHETYPE DETECTION
// ═══════════════════════════════════════════════════════════════════════════════

export interface ArchetypeDetectionResult {
  archetype: SoftwareArchetype;
  confidence: number;
  scores: Record<SoftwareArchetype, number>;
  signals: { keyword: string; archetype: SoftwareArchetype; weight: number }[];
  label: string;
}

/**
 * Classifies source code into a software archetype via weighted keyword voting.
 */
export function detectArchetype(sourceCode: string): ArchetypeDetectionResult {
  const lower = sourceCode.toLowerCase();
  const scores: Record<SoftwareArchetype, number> = { active: 0, passive: 0, hybrid: 0 };
  const matchedSignals: ArchetypeDetectionResult['signals'] = [];

  for (const signal of ARCHETYPE_SIGNALS) {
    if (lower.includes(signal.keyword.toLowerCase())) {
      scores[signal.archetype] += signal.weight;
      matchedSignals.push(signal);
    }
  }

  const total = scores.active + scores.passive + scores.hybrid;
  if (total === 0) {
    return {
      archetype: 'hybrid',
      confidence: 0.5,
      scores,
      signals: [],
      label: 'Unknown (defaulting to Hybrid)',
    };
  }

  // Winner-take-all with confidence
  const entries = Object.entries(scores) as [SoftwareArchetype, number][];
  entries.sort((a, b) => b[1] - a[1]);
  const [winner, winnerScore] = entries[0];
  const confidence = winnerScore / total;

  const labels: Record<SoftwareArchetype, string> = {
    active: 'Active Agent / Bot / Worker',
    passive: 'UI / Dashboard / Static App',
    hybrid: 'API / Middleware / Pipeline',
  };

  return {
    archetype: winner,
    confidence: Math.round(confidence * 100) / 100,
    scores,
    signals: matchedSignals,
    label: labels[winner],
  };
}


// ═══════════════════════════════════════════════════════════════════════════════
// §4 — CAPABILITY POOL FILTERING + WEIGHTED SELECTION
// ═══════════════════════════════════════════════════════════════════════════════

export interface AffinitySelection {
  selected: SubstrateCapability[];
  pool: SubstrateCapability[];
  excluded: SubstrateCapability[];
  archetype: ArchetypeDetectionResult;
}

/**
 * Filters the capability pool by archetype compatibility,
 * then selects `count` capabilities using CJPI-weighted random sampling.
 */
export function selectCapabilities(
  archetype: SoftwareArchetype,
  count: number = 6,
  seed?: number
): AffinitySelection {
  const detection = { archetype } as ArchetypeDetectionResult;

  // Filter: keep capabilities whose styles include the archetype or 'universal'
  const styleMap: Record<SoftwareArchetype, CapabilityStyle[]> = {
    active: ['action', 'universal'],
    passive: ['passive', 'universal'],
    hybrid: ['action', 'passive', 'universal'],
  };
  const allowedStyles = styleMap[archetype];

  const pool: SubstrateCapability[] = [];
  const excluded: SubstrateCapability[] = [];

  for (const cap of SUBSTRATE_CAPABILITIES) {
    const hasMatch = cap.styles.some(s => allowedStyles.includes(s));
    if (hasMatch) {
      pool.push(cap);
    } else {
      excluded.push(cap);
    }
  }

  // Weighted random selection from pool
  const selected = weightedSample(pool, Math.min(count, pool.length), seed);

  return { selected, pool, excluded, archetype: detection };
}

/**
 * Full pipeline: detect archetype from source → filter pool → select capabilities
 */
export function classifyAndSelect(
  sourceCode: string,
  count: number = 6,
  seed?: number
): AffinitySelection {
  const detection = detectArchetype(sourceCode);
  const result = selectCapabilities(detection.archetype, count, seed);
  return { ...result, archetype: detection };
}


// ═══════════════════════════════════════════════════════════════════════════════
// §5 — WEIGHTED SAMPLING
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Weighted random sampling without replacement.
 * Higher baseWeight = higher probability of selection.
 */
function weightedSample(
  items: SubstrateCapability[],
  count: number,
  seed?: number
): SubstrateCapability[] {
  if (items.length <= count) return [...items];

  // Seeded PRNG for reproducibility in demos
  let rng = seed !== undefined ? seededRandom(seed) : Math.random;
  const remaining = [...items];
  const selected: SubstrateCapability[] = [];

  for (let i = 0; i < count; i++) {
    const totalWeight = remaining.reduce((sum, c) => sum + c.baseWeight, 0);
    let roll = rng() * totalWeight;

    for (let j = 0; j < remaining.length; j++) {
      roll -= remaining[j].baseWeight;
      if (roll <= 0) {
        selected.push(remaining[j]);
        remaining.splice(j, 1);
        break;
      }
    }
  }

  return selected;
}

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return s / 2147483647;
  };
}
