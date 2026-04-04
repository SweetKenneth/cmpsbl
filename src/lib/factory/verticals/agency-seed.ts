/**
 * CMPSBL® Agency Vertical — Discovery Seed Engine (GENESIS)
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Generates 200 high-bias discoveries using the agency primitive matrix.
 * Routes:
 *   - Architecture-class (CJPI ≥ 95) → Vault (gated, S-Tier protected)
 *   - Showroom-class (CJPI 68–94)   → Showroom catalog (100 target)
 *   - Raw-tier (CJPI < 68)          → Junkyard pool (100 target)
 *
 * All non-vault discoveries are also deposited into the Memory Stream pool.
 *
 * © CMPSBL® — All rights reserved.
 */

import { addDiscovery } from '../discovery-retirement';
import { routeDiscovery } from '../foundry-engine';
import { getAgencyEngines, getAgencyAgents } from './agency';

// ═══════════════════════════════════════════════════════════════
// §1 — TYPES
// ═══════════════════════════════════════════════════════════════

export interface AgencyDiscovery {
  id: string;
  name: string;
  description: string;
  cjpiScore: number;
  primitiveChain: string[];
  tier: 'Raw' | 'Mint' | 'Prime' | 'Relic' | 'Mythic' | 'Apex';
  route: 'vault' | 'showroom' | 'junkyard';
  category: 'autonomy' | 'collaboration' | 'research' | 'communication' | 'learning' | 'governance' | 'tooling' | 'resilience';
  discoveredAt: string;
}

export interface AgencySeedResult {
  runId: string;
  totalDiscoveries: number;
  vaultCount: number;
  showroomCount: number;
  junkyardCount: number;
  memoryStreamCount: number;
  discoveries: AgencyDiscovery[];
  completedAt: string;
}

// ═══════════════════════════════════════════════════════════════
// §2 — DISCOVERY TEMPLATES
// ═══════════════════════════════════════════════════════════════

function seedRng(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}

const AGENCY_PRIMITIVE_IDS = [
  ...getAgencyEngines().map(e => e.id),
  ...getAgencyAgents().map(a => a.id),
];

const SPINE_IDS = [
  'BRAIN', 'MEMORY', 'IDENTITY', 'CONSCIENCE', 'COMPASS', 'REFLEX',
  'ECHO', 'OBSERVER', 'LINGUA', 'HARVEST', 'PHANTOM', 'NERVE',
  'DEFENSE', 'GOVERNANCE', 'EVOLUTION', 'SHADOW', 'ORACLE', 'SOVEREIGN',
  'TREATY', 'RELAY', 'SANDBOX', 'SIMULATE', 'FORGE', 'IMMUNITY',
];

interface DiscoveryTemplate {
  namePattern: string;
  descriptionPattern: string;
  category: AgencyDiscovery['category'];
  primaryPrimitives: string[];
  minChainLength: number;
  maxChainLength: number;
  cjpiBias: number;
}

const DISCOVERY_TEMPLATES: DiscoveryTemplate[] = [
  // ═══ AUTONOMY (high CJPI, vault candidates) ═══
  { namePattern: 'Zero-Direction Mission Completion Engine', descriptionPattern: 'End-to-end autonomous mission execution from a single objective statement with self-monitoring, error recovery, and quality assurance loops.', category: 'autonomy', primaryPrimitives: ['MANDATE', 'OPERATOR', 'REASON'], minChainLength: 5, maxChainLength: 8, cjpiBias: 30 },
  { namePattern: 'Adaptive Strategy Pivot Architecture', descriptionPattern: 'Real-time strategy recalculation when initial approaches fail, using multi-path exploration and outcome prediction models.', category: 'autonomy', primaryPrimitives: ['OPERATOR', 'REASON', 'ROGUE'], minChainLength: 5, maxChainLength: 8, cjpiBias: 28 },
  { namePattern: 'Self-Correcting Task Orchestrator', descriptionPattern: 'Autonomous task pipeline with built-in self-correction checkpoints, rollback capabilities, and progressive verification gates.', category: 'autonomy', primaryPrimitives: ['MANDATE', 'SENTINEL', 'DELEGATE'], minChainLength: 6, maxChainLength: 8, cjpiBias: 32 },
  { namePattern: 'Autonomous Research-to-Action Pipeline', descriptionPattern: 'Full pipeline from research gathering through analysis to actionable deliverable production with minimal human intervention.', category: 'autonomy', primaryPrimitives: ['RECONN', 'REASON', 'SCRIBE'], minChainLength: 5, maxChainLength: 7, cjpiBias: 29 },

  // ═══ COLLABORATION (high CJPI) ═══
  { namePattern: 'Multi-Agent Swarm Intelligence Fabric', descriptionPattern: 'Distributed decision-making framework where agent teams collaboratively solve problems through structured debate, evidence sharing, and consensus convergence.', category: 'collaboration', primaryPrimitives: ['DIPLOMAT', 'UPLINK', 'DELEGATE'], minChainLength: 5, maxChainLength: 8, cjpiBias: 30 },
  { namePattern: 'Dynamic Team Assembly Engine', descriptionPattern: 'Automated team formation that composes optimal agent groups based on mission requirements, skill complementarity, and collaboration chemistry.', category: 'collaboration', primaryPrimitives: ['DIPLOMAT', 'DELEGATE', 'SCHOLAR'], minChainLength: 5, maxChainLength: 7, cjpiBias: 27 },
  { namePattern: 'Knowledge Sharing Mesh Protocol', descriptionPattern: 'Peer-to-peer knowledge distribution network ensuring discoveries from one agent are immediately available to all relevant team members.', category: 'collaboration', primaryPrimitives: ['UPLINK', 'ANCHOR', 'SCHOLAR'], minChainLength: 4, maxChainLength: 7, cjpiBias: 25 },
  { namePattern: 'Collaborative Problem Decomposition Matrix', descriptionPattern: 'Multi-agent problem decomposition where agents collectively break complex challenges into optimally-sized sub-problems matched to individual strengths.', category: 'collaboration', primaryPrimitives: ['MANDATE', 'DIPLOMAT', 'DELEGATE'], minChainLength: 5, maxChainLength: 7, cjpiBias: 26 },

  // ═══ RESEARCH (mid-high CJPI) ═══
  { namePattern: 'Deep Research Synthesis Engine', descriptionPattern: 'Multi-source research aggregation with source credibility scoring, temporal relevance weighting, and structured insight extraction.', category: 'research', primaryPrimitives: ['RECONN', 'REASON', 'BRAIN'], minChainLength: 4, maxChainLength: 6, cjpiBias: 20 },
  { namePattern: 'Competitive Intelligence Scanner', descriptionPattern: 'Automated market analysis pipeline monitoring public signals, extracting competitive patterns, and producing actionable intelligence briefs.', category: 'research', primaryPrimitives: ['RECONN', 'SCRIBE', 'ORACLE'], minChainLength: 3, maxChainLength: 5, cjpiBias: 16 },
  { namePattern: 'Citation-Verified Knowledge Graph Builder', descriptionPattern: 'Constructs knowledge graphs from research with full citation chains, source authority scoring, and contradiction detection.', category: 'research', primaryPrimitives: ['RECONN', 'ANCHOR', 'MEMORY'], minChainLength: 4, maxChainLength: 6, cjpiBias: 18 },
  { namePattern: 'Evidence-Based Decision Support System', descriptionPattern: 'Research-driven decision support that gathers evidence, evaluates credibility, and presents structured analyses with confidence intervals.', category: 'research', primaryPrimitives: ['RECONN', 'REASON', 'HERALD'], minChainLength: 4, maxChainLength: 6, cjpiBias: 17 },

  // ═══ COMMUNICATION (mid CJPI) ═══
  { namePattern: 'Audience-Adaptive Report Generator', descriptionPattern: 'Generates reports with automatically adjusted complexity, terminology, and detail level based on recipient expertise analysis.', category: 'communication', primaryPrimitives: ['SCRIBE', 'HERALD', 'REASON'], minChainLength: 3, maxChainLength: 5, cjpiBias: 14 },
  { namePattern: 'Multi-Channel Notification Orchestrator', descriptionPattern: 'Intelligent notification routing across channels with priority-based batching, user preference learning, and alert fatigue prevention.', category: 'communication', primaryPrimitives: ['HERALD', 'UPLINK', 'INCENTIVE'], minChainLength: 3, maxChainLength: 5, cjpiBias: 12 },
  { namePattern: 'Professional Writing Coach', descriptionPattern: 'Real-time writing improvement engine that suggests structural improvements, tone adjustments, and clarity enhancements.', category: 'communication', primaryPrimitives: ['SCRIBE', 'SCHOLAR', 'INCENTIVE'], minChainLength: 3, maxChainLength: 5, cjpiBias: 10 },

  // ═══ LEARNING (mid CJPI) ═══
  { namePattern: 'Skill Transfer Learning Pipeline', descriptionPattern: 'Extracts transferable patterns from completed tasks and applies them to new domains through structured generalization.', category: 'learning', primaryPrimitives: ['SCHOLAR', 'BRAIN', 'MEMORY'], minChainLength: 3, maxChainLength: 5, cjpiBias: 15 },
  { namePattern: 'Curriculum Auto-Generator', descriptionPattern: 'Dynamically generates personalized learning paths based on skill gaps, mission history, and peer performance benchmarks.', category: 'learning', primaryPrimitives: ['SCHOLAR', 'INCENTIVE', 'MANDATE'], minChainLength: 3, maxChainLength: 5, cjpiBias: 13 },
  { namePattern: 'Few-Shot Skill Acquisition Engine', descriptionPattern: 'Rapid skill learning from minimal examples using pattern extraction, analogy mapping, and progressive complexity exposure.', category: 'learning', primaryPrimitives: ['SCHOLAR', 'ROGUE', 'REASON'], minChainLength: 3, maxChainLength: 5, cjpiBias: 14 },
  { namePattern: 'Reward Signal Optimization Loop', descriptionPattern: 'Closed-loop reward function tuning that measures behavioral impact of incentive changes and auto-calibrates reinforcement parameters.', category: 'learning', primaryPrimitives: ['INCENTIVE', 'SCHOLAR', 'SENTINEL'], minChainLength: 3, maxChainLength: 5, cjpiBias: 11 },

  // ═══ GOVERNANCE (mid CJPI) ═══
  { namePattern: 'Governed Autonomy Boundary System', descriptionPattern: 'Dynamic safety boundary enforcement preventing agents from exceeding authorized scope while maximizing operational freedom.', category: 'governance', primaryPrimitives: ['WARDEN', 'GOVERNANCE', 'DEFENSE'], minChainLength: 4, maxChainLength: 6, cjpiBias: 20 },
  { namePattern: 'Action Audit Chain Engine', descriptionPattern: 'Tamper-evident audit trail for all agent actions with context capture, enabling compliance reporting and forensic review.', category: 'governance', primaryPrimitives: ['WARDEN', 'AUDIT', 'ANCHOR'], minChainLength: 3, maxChainLength: 5, cjpiBias: 16 },

  // ═══ TOOLING (varied CJPI) ═══
  { namePattern: 'Multi-Tool Chain Composer', descriptionPattern: 'Automatically sequences multiple API calls into coherent workflows with data transformation, error handling, and retry logic.', category: 'tooling', primaryPrimitives: ['TOOLKIT', 'MANDATE', 'REASON'], minChainLength: 3, maxChainLength: 5, cjpiBias: 15 },
  { namePattern: 'API Discovery and Matching Engine', descriptionPattern: 'Runtime capability scanner that indexes available tools, matches them to current task requirements, and recommends optimal selections.', category: 'tooling', primaryPrimitives: ['TOOLKIT', 'RECONN', 'SCHOLAR'], minChainLength: 3, maxChainLength: 5, cjpiBias: 12 },
  { namePattern: 'Tool Call Error Recovery System', descriptionPattern: 'Robust error handling for failed tool calls with parameter mutation, alternative tool selection, and partial result extraction.', category: 'tooling', primaryPrimitives: ['TOOLKIT', 'SENTINEL', 'OPERATOR'], minChainLength: 3, maxChainLength: 5, cjpiBias: 10 },

  // ═══ RESILIENCE (lower CJPI, junkyard candidates) ═══
  { namePattern: 'Fleet Circuit Breaker Network', descriptionPattern: 'Distributed circuit breaker implementation preventing cascade failures across the agent fleet with configurable trip thresholds.', category: 'resilience', primaryPrimitives: ['SENTINEL', 'DEFENSE'], minChainLength: 2, maxChainLength: 4, cjpiBias: 8 },
  { namePattern: 'Agent State Reconstruction Tool', descriptionPattern: 'Rebuilds agent state from persistent checkpoints after unexpected failures with minimal context loss.', category: 'resilience', primaryPrimitives: ['SENTINEL', 'ANCHOR'], minChainLength: 2, maxChainLength: 3, cjpiBias: 4 },
  { namePattern: 'Degraded Mode Capability Shedder', descriptionPattern: 'Priority-based feature shedding during system stress ensuring core mission capabilities remain available.', category: 'resilience', primaryPrimitives: ['SENTINEL', 'MANDATE'], minChainLength: 2, maxChainLength: 3, cjpiBias: 2 },
  { namePattern: 'Health Telemetry Aggregator', descriptionPattern: 'Lightweight telemetry collection for agent health metrics with EMA smoothing and anomaly flagging.', category: 'resilience', primaryPrimitives: ['SENTINEL', 'BEACON'], minChainLength: 2, maxChainLength: 3, cjpiBias: 0 },
  { namePattern: 'Task Timeout Watchdog', descriptionPattern: 'Configurable timeout enforcement for long-running agent tasks with graceful cancellation and partial result salvage.', category: 'resilience', primaryPrimitives: ['OPERATOR', 'SENTINEL'], minChainLength: 2, maxChainLength: 3, cjpiBias: -2 },
  { namePattern: 'Memory Pressure Relief Valve', descriptionPattern: 'Automatic memory management during high-load scenarios with LRU eviction and importance-weighted retention.', category: 'resilience', primaryPrimitives: ['ANCHOR', 'MEMORY'], minChainLength: 2, maxChainLength: 3, cjpiBias: -3 },
];

// ═══════════════════════════════════════════════════════════════
// §3 — SCORING
// ═══════════════════════════════════════════════════════════════

function scoreCjpi(chainLength: number, bias: number, rand: () => number): number {
  const chainBonus = chainLength * 5;
  const base = 45 + chainBonus + Math.floor(rand() * 15);
  return Math.min(100, Math.max(30, base + bias));
}

function classifyTier(score: number): AgencyDiscovery['tier'] {
  if (score === 100) return 'Apex';
  if (score >= 94) return 'Mythic';
  if (score >= 90) return 'Relic';
  if (score >= 80) return 'Prime';
  if (score >= 68) return 'Mint';
  return 'Raw';
}

// ═══════════════════════════════════════════════════════════════
// §4 — CHAIN BUILDER
// ═══════════════════════════════════════════════════════════════

function buildChain(template: DiscoveryTemplate, rand: () => number): string[] {
  const chain = [...template.primaryPrimitives];
  const targetLen = template.minChainLength + Math.floor(rand() * (template.maxChainLength - template.minChainLength + 1));
  const allPool = [...AGENCY_PRIMITIVE_IDS, ...SPINE_IDS];
  while (chain.length < targetLen) {
    const candidate = allPool[Math.floor(rand() * allPool.length)];
    if (!chain.includes(candidate)) {
      chain.push(candidate);
    }
  }
  return chain;
}

// ═══════════════════════════════════════════════════════════════
// §5 — VARIANT NAME GENERATOR
// ═══════════════════════════════════════════════════════════════

const VARIANT_PREFIXES = [
  'Autonomous', 'Adaptive', 'Recursive', 'Distributed', 'Governed',
  'Collaborative', 'Proactive', 'Resilient', 'Predictive', 'Structured',
  'Continuous', 'Deterministic', 'Intelligent', 'Self-Healing', 'Dynamic',
  'Fleet-Wide', 'Mission-Critical', 'Skill-Aware', 'Context-Preserving', 'Reward-Driven',
];

const VARIANT_SUFFIXES = [
  'Engine', 'Fabric', 'Protocol', 'Pipeline', 'Matrix',
  'Orchestrator', 'Analyzer', 'Framework', 'System', 'Coordinator',
  'Network', 'Controller', 'Optimizer', 'Accelerator', 'Layer',
];

function generateVariantName(base: string, index: number, rand: () => number): string {
  if (index === 0) return base;
  const prefix = VARIANT_PREFIXES[Math.floor(rand() * VARIANT_PREFIXES.length)];
  const suffix = VARIANT_SUFFIXES[Math.floor(rand() * VARIANT_SUFFIXES.length)];
  const core = base.split(' ').slice(0, 3).join(' ');
  return `${prefix} ${core} ${suffix}`;
}

// ═══════════════════════════════════════════════════════════════
// §6 — VAULT & MEMORY STREAM POOL
// ═══════════════════════════════════════════════════════════════

const AGENCY_VAULT = new Map<string, AgencyDiscovery>();
const AGENCY_MEMORY_STREAM_POOL: AgencyDiscovery[] = [];

export function getAgencyVault(): AgencyDiscovery[] {
  return Array.from(AGENCY_VAULT.values());
}

export function getAgencyVaultCount(): number {
  return AGENCY_VAULT.size;
}

export function getAgencyMemoryStreamPool(): AgencyDiscovery[] {
  return [...AGENCY_MEMORY_STREAM_POOL];
}

export function getAgencyMemoryStreamCount(): number {
  return AGENCY_MEMORY_STREAM_POOL.length;
}

// ═══════════════════════════════════════════════════════════════
// §7 — MAIN SEED ENGINE (GENESIS)
// ═══════════════════════════════════════════════════════════════

const TOTAL_DISCOVERIES = 200;
const ARCHITECTURE_GATE_THRESHOLD = 95;

let _seedResult: AgencySeedResult | null = null;

/**
 * Seed the agency vertical with 200 discoveries via the GENESIS Engine.
 * Routes architecture-class (CJPI ≥ 95) to vault, rest to showroom/junkyard.
 * All non-vault discoveries deposited into Memory Stream pool.
 *
 * Idempotent — returns cached result on subsequent calls.
 */
export function seedAgencyDiscoveries(): AgencySeedResult {
  if (_seedResult) return _seedResult;

  const runId = 'ag-seed-' + Date.now().toString(36);
  const rand = seedRng(0xA6E4_CAFE);
  const discoveries: AgencyDiscovery[] = [];

  let vaultCount = 0;
  let showroomCount = 0;
  let junkyardCount = 0;
  let memoryStreamCount = 0;
  let templateIdx = 0;

  for (let i = 0; i < TOTAL_DISCOVERIES; i++) {
    const template = DISCOVERY_TEMPLATES[templateIdx % DISCOVERY_TEMPLATES.length];
    const variantIndex = Math.floor(templateIdx / DISCOVERY_TEMPLATES.length);
    templateIdx++;

    const chain = buildChain(template, rand);
    const cjpiScore = scoreCjpi(chain.length, template.cjpiBias, rand);
    const tier = classifyTier(cjpiScore);
    const route = cjpiScore >= ARCHITECTURE_GATE_THRESHOLD ? 'vault' : routeDiscovery(cjpiScore);

    const name = generateVariantName(template.namePattern, variantIndex, rand);
    const description = template.descriptionPattern;

    const discovery: AgencyDiscovery = {
      id: `ADSC-${String(i + 1).padStart(3, '0')}`,
      name,
      description,
      cjpiScore,
      primitiveChain: chain,
      tier,
      route,
      category: template.category,
      discoveredAt: new Date().toISOString(),
    };

    discoveries.push(discovery);

    if (route === 'vault') {
      AGENCY_VAULT.set(discovery.id, discovery);
      vaultCount++;
    } else {
      addDiscovery(
        discovery.id,
        discovery.name,
        discovery.description,
        discovery.cjpiScore,
        discovery.primitiveChain,
      );

      if (route === 'showroom') {
        showroomCount++;
      } else {
        junkyardCount++;
      }

      AGENCY_MEMORY_STREAM_POOL.push(discovery);
      memoryStreamCount++;
    }
  }

  _seedResult = {
    runId,
    totalDiscoveries: TOTAL_DISCOVERIES,
    vaultCount,
    showroomCount,
    junkyardCount,
    memoryStreamCount,
    discoveries,
    completedAt: new Date().toISOString(),
  };

  return _seedResult;
}

/** Get cached seed result */
export function getAgencySeedResult(): AgencySeedResult | null {
  return _seedResult;
}

/** Summary for dashboard display */
export function getAgencySeedSummary(): { total: number; vault: number; showroom: number; junkyard: number; memoryStream: number } {
  if (!_seedResult) return { total: 0, vault: 0, showroom: 0, junkyard: 0, memoryStream: 0 };
  return {
    total: _seedResult.totalDiscoveries,
    vault: _seedResult.vaultCount,
    showroom: _seedResult.showroomCount,
    junkyard: _seedResult.junkyardCount,
    memoryStream: _seedResult.memoryStreamCount,
  };
}

/** Reset — useful for testing */
export function resetAgencySeed(): void {
  _seedResult = null;
  AGENCY_VAULT.clear();
  AGENCY_MEMORY_STREAM_POOL.length = 0;
}
