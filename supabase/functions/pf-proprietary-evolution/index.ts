/**
 * pf-proprietary-evolution — Proprietary Evolution Lifecycle Engine
 * 
 * Handles:
 *   - discovery.collide: Bounce Candidate Node #41 against substrate nodes (multi-chain 2-6 depth)
 *   - discovery.batch: Run full collision sweep across all 40 nodes with chain exploration
 *   - crystallize.lock: Lock a discovered capability into deterministic memory
 *   - crystallize.batch-lock: Batch crystallize all eligible discoveries
 *   - export.capability-pack: Generate capability pack from crystallized memories
 * 
 * Chain Discovery Engine:
 *   Instead of single-node collisions, the engine explores multi-node chains (2-6 nodes)
 *   where each additional node in the chain contributes synergy bonuses. Cross-sector
 *   chains receive higher CJPI because they combine fundamentally different capabilities.
 * 
 * @classification FOUNDER EYES ONLY
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

// ═══ RATE LIMITING ═══
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string, maxPerMinute = 30): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 60_000 });
    return true;
  }
  entry.count++;
  return entry.count <= maxPerMinute;
}

// ═══ INPUT VALIDATION ═══
function validateString(val: unknown, maxLen = 200): string | null {
  if (typeof val !== 'string') return null;
  return val.trim().slice(0, maxLen).replace(/[^\w\s\-_.]/g, '') || null;
}

function validateStringArray(val: unknown, maxLen = 50, maxItems = 100): string[] {
  if (!Array.isArray(val)) return [];
  return val
    .filter((v): v is string => typeof v === 'string')
    .slice(0, maxItems)
    .map(v => v.trim().slice(0, maxLen));
}

function validatePositiveInt(val: unknown, max = 100): number {
  const n = Number(val);
  if (!Number.isFinite(n) || n < 1) return 1;
  return Math.min(Math.floor(n), max);
}

// ═══ SUBSTRATE NODE MATRIX (40 nodes) ═══
const SUBSTRATE_NODES = [
  'CORE','BRAIN','MEMORY','NERVE','DECODE','ENCODE','CORTEX','DEFENSE','ORACLE',
  'CONSCIENCE','PHANTOM','HARVEST','EVOLUTION','SHADOW','IMMUNITY','INTENT',
  'GOVERNANCE','ATLAS','FORGE','LINGUA','ECHO','SOVEREIGN','REFLEX','TREATY',
  'ENGINEER','COMPASS','OBSERVER','GENESIS','ANCHOR','PRISM','SENTRY','MEDIC',
  'SIGNAL','TENSOR','ARBITER','FLUX','VECTOR','SYNTH','RELAY','NEXUS',
];

const VALID_NODES = new Set(SUBSTRATE_NODES);

// ═══ SECTOR MAPPING — Used for cross-sector synergy scoring ═══
const NODE_SECTOR: Record<string, string> = {
  CORE: 'core', BRAIN: 'ccr', MEMORY: 'ccr', DREAM: 'ccr',
  NERVE: 'ocg', RIPPLE: 'ocg', ACCESS: 'ocg', IDENTITY: 'ocg', RELAY: 'ocg', AUDIT: 'ocg',
  DECODE: 'execution', ENCODE: 'execution', VISION: 'execution', CORTEX: 'execution',
  NEXUS: 'execution', ECONOMY: 'execution', SANDBOX: 'execution', INCLUSIVE: 'execution',
  MEDIC: 'execution', INTEGRATION: 'execution',
  SOVEREIGN: 'esz', ORACLE: 'esz', CONSCIENCE: 'esz', TREATY: 'esz',
  COMPASS: 'epz', ECHO: 'epz', REFLEX: 'epz',
  FORGE: 'emz', LINGUA: 'emz', HARVEST: 'emz',
  EVOLUTION: 'csz', SHADOW: 'csz', PHANTOM: 'csz',
  IMMUNITY: 'field', INTENT: 'field',
  GOVERNANCE: 'plane', ATLAS: 'plane', ENGINEER: 'plane',
  DEFENSE: 'shell',
  // Extended nodes mapped to logical sectors
  OBSERVER: 'execution', GENESIS: 'core', ANCHOR: 'core', PRISM: 'execution',
  SENTRY: 'shell', SIGNAL: 'ocg', TENSOR: 'execution', ARBITER: 'plane',
  FLUX: 'execution', VECTOR: 'execution', SYNTH: 'emz',
  SYSTEM: 'core',
};

// ═══ NODE CAPABILITY SIGNATURES ═══
const NODE_CAPABILITIES: Record<string, string[]> = {
  CORE: ['boot', 'pulse', 'orchestrate', 'config'],
  BRAIN: ['reasoning', 'inference', 'semantic_embed', 'context_window'],
  MEMORY: ['store', 'recall', 'semantic_search', 'consolidate'],
  NERVE: ['signal', 'consensus', 'heartbeat', 'gate'],
  DECODE: ['parse', 'interpret', 'nlp_extract', 'intent_classify'],
  ENCODE: ['code_gen', 'transform', 'compile', 'optimize'],
  CORTEX: ['orchestrate', 'coordinate', 'priority_queue', 'workflow'],
  DEFENSE: ['threat_score', 'anomaly_detect', 'rate_limit', 'quarantine'],
  ORACLE: ['predict', 'forecast', 'bayesian_update', 'monte_carlo'],
  CONSCIENCE: ['bias_detect', 'ethics_score', 'fairness', 'transparency'],
  PHANTOM: ['anonymize', 'proxy', 'obfuscate', 'stealth_route'],
  HARVEST: ['crawl', 'etl', 'deduplicate', 'enrich'],
  EVOLUTION: ['mutate', 'fitness_score', 'select', 'crossover'],
  SHADOW: ['diverge', 'shadow_mesh', 'verify', 'compare'],
  IMMUNITY: ['resilience', 'adaptive_threshold', 'quarantine', 'recover'],
  INTENT: ['discover', 'route', 'resolve', 'dag_plan'],
  GOVERNANCE: ['policy', 'approve', 'audit_govern', 'escalate'],
  ATLAS: ['registry', 'control', 'capability_map', 'govern'],
  FORGE: ['template', 'scaffold', 'generate', 'instantiate'],
  LINGUA: ['translate', 'localize', 'detect_lang', 'glossary'],
  ECHO: ['replay', 'simulate', 'mirror', 'resonance'],
  SOVEREIGN: ['jurisdiction', 'data_residency', 'encrypt', 'audit_sovereign'],
  REFLEX: ['react', 'edge_compute', 'preempt', 'cache_warm'],
  TREATY: ['negotiate', 'sla_enforce', 'contract', 'compliance'],
  ENGINEER: ['maintain', 'optimize', 'upgrade', 'benchmark'],
  COMPASS: ['navigate', 'locate', 'map', 'orient'],
  OBSERVER: ['monitor', 'telemetry', 'alert', 'dashboard'],
  GENESIS: ['bootstrap', 'seed', 'initialize', 'provision'],
  ANCHOR: ['persist', 'checkpoint', 'backup', 'restore'],
  PRISM: ['decompose', 'spectrum', 'facet', 'refract'],
  SENTRY: ['guard', 'validate', 'gatekeep', 'authorize'],
  MEDIC: ['diagnose', 'repair', 'triage', 'health_check'],
  SIGNAL: ['emit', 'subscribe', 'broadcast', 'filter'],
  TENSOR: ['compute', 'matrix_op', 'gradient', 'transform'],
  ARBITER: ['judge', 'arbitrate', 'resolve_conflict', 'consensus'],
  FLUX: ['stream', 'buffer', 'throttle', 'backpressure'],
  VECTOR: ['embed', 'similarity', 'cluster', 'dimension_reduce'],
  SYNTH: ['synthesize', 'compose', 'blend', 'harmonize'],
  RELAY: ['webhook', 'dispatch', 'retry', 'transform'],
  NEXUS: ['route_ai', 'failover', 'cost_track', 'provider_select'],
};

const VALID_MODULES = new Set(['discovery', 'crystallize', 'export']);
const VALID_ACTIONS: Record<string, Set<string>> = {
  discovery: new Set(['collide', 'batch']),
  crystallize: new Set(['lock', 'batch-lock']),
  export: new Set(['capability-pack']),
};
const VALID_LANGUAGES = new Set(['typescript', 'python', 'rust', 'go', 'zig', 'java', 'csharp', 'ruby', 'swift', 'kotlin', 'verilog', 'systemverilog', 'vhdl', 'systemc', 'elixir', 'lua', 'c', 'cpp', 'dart', 'scala', 'haskell', 'php', 'chisel', 'amaranth', 'spice']);

// ═══ HASH & FINGERPRINT ═══

function hashString(s: string): number {
  let hash = 0;
  for (let i = 0; i < s.length; i++) {
    const char = s.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

async function generateFingerprint(chain: string[], epoch: string): Promise<string> {
  const payload = JSON.stringify({ steps: chain.map(m => ({ module: m, capability: 'collision' })), epoch });
  const encoder = new TextEncoder();
  const data = encoder.encode(payload);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// ═══ CROSS-SECTOR SYNERGY MATRIX ═══
// Certain sector combinations produce genuine emergent capabilities.
// These bonuses represent real architectural value — not cosmetic inflation.

const SECTOR_SYNERGY: Record<string, number> = {
  'ccr+esz': 6,       // cognitive + sovereignty = predictive governance
  'ccr+csz': 7,       // cognitive + covert = stealth reasoning
  'ccr+execution': 4,  // cognitive + execution = intelligent automation
  'ccr+shell': 5,      // cognitive + defense = adaptive threat modeling
  'execution+esz': 4,  // execution + sovereignty = compliant automation
  'execution+csz': 5,  // execution + covert = shadow execution
  'execution+field': 3, // execution + field = resilient execution
  'esz+csz': 8,        // sovereignty + covert = zero-knowledge compliance
  'esz+shell': 5,      // sovereignty + defense = jurisdictional firewalling
  'ocg+csz': 5,        // compliance grid + covert = auditable privacy
  'ocg+esz': 4,        // compliance + sovereignty = treaty enforcement
  'field+csz': 6,      // fields + covert = immune stealth mesh
  'field+shell': 4,    // fields + defense = hardened resilience
  'emz+ccr': 5,        // manufacturing + cognitive = intelligent synthesis
  'emz+execution': 3,  // manufacturing + execution = build pipeline
  'epz+ccr': 5,        // perception + cognitive = predictive awareness
  'epz+csz': 6,        // perception + covert = stealth reconnaissance
  'plane+csz': 5,      // governance plane + covert = shadow governance
  'core+field': 4,     // core + field = substrate-level transformation
  'core+plane': 3,     // core + plane = kernel governance
};

function getSectorSynergy(sectors: string[]): number {
  const unique = [...new Set(sectors)];
  if (unique.length < 2) return 0;
  
  let totalSynergy = 0;
  for (let i = 0; i < unique.length; i++) {
    for (let j = i + 1; j < unique.length; j++) {
      const key1 = `${unique[i]}+${unique[j]}`;
      const key2 = `${unique[j]}+${unique[i]}`;
      totalSynergy += SECTOR_SYNERGY[key1] || SECTOR_SYNERGY[key2] || 3;
    }
  }
  
  // Diminishing returns for very long chains — but still rewarding
  const pairCount = (unique.length * (unique.length - 1)) / 2;
  return Math.floor(totalSynergy / Math.max(1, Math.sqrt(pairCount)));
}

// ═══ CHAIN COMPOUND DESCRIPTIONS ═══
// These describe what COMBINATIONS of nodes produce — not individual node capabilities.
// The key is "sorted sectors joined" → emergent capability description.

const CHAIN_ARCHETYPES: Record<string, { name: string; desc: string }[]> = {
  'BRAIN+ORACLE': [
    { name: 'Predictive_Reasoning_Engine', desc: 'Combines multi-step logical deduction with Bayesian forecasting to reason about future states — produces actionable predictions grounded in causal inference rather than pure correlation.' },
    { name: 'Anticipatory_Cognition_Loop', desc: 'Fuses contextual reasoning with Monte Carlo simulation to pre-compute likely decision trees, enabling systems that think ahead rather than react.' },
  ],
  'BRAIN+DEFENSE': [
    { name: 'Adversarial_Intelligence_Core', desc: 'Merges reasoning chains with threat modeling to construct adversarial simulations — thinks like an attacker to build unbreakable defenses.' },
    { name: 'Cognitive_Threat_Profiler', desc: 'Applies semantic inference to behavioral anomaly streams, identifying sophisticated attack patterns that rule-based systems miss.' },
  ],
  'BRAIN+MEMORY': [
    { name: 'Associative_Reasoning_Fabric', desc: 'Chains logical deduction with semantic recall to build reasoning that remembers — each inference enriches the memory graph, each recall sharpens future reasoning.' },
    { name: 'Knowledge_Amplification_Loop', desc: 'Creates a self-reinforcing cycle where reasoning discovers new knowledge and memory surfaces relevant context, producing compounding intelligence over time.' },
  ],
  'BRAIN+PHANTOM': [
    { name: 'Zero_Knowledge_Reasoner', desc: 'Performs complex multi-step inference over encrypted or anonymized data without ever exposing the raw inputs — privacy-preserving intelligence at scale.' },
  ],
  'BRAIN+EVOLUTION': [
    { name: 'Self_Improving_Cognition', desc: 'Applies evolutionary mutation and fitness scoring to reasoning strategies themselves — the system doesn\'t just think, it evolves how it thinks.' },
  ],
  'ORACLE+DEFENSE': [
    { name: 'Predictive_Threat_Shield', desc: 'Forecasts attack vectors before they materialize by combining Bayesian threat modeling with anomaly baselines — shifts security from reactive to preemptive.' },
  ],
  'ORACLE+EVOLUTION': [
    { name: 'Fitness_Oracle', desc: 'Uses Monte Carlo simulation to evaluate evolutionary candidates before committing resources — predicts which mutations will succeed without running them all.' },
  ],
  'ORACLE+HARVEST': [
    { name: 'Intelligence_Harvester', desc: 'Combines predictive modeling with data acquisition to identify and extract high-value information before competitors — proactive intelligence gathering.' },
  ],
  'MEMORY+EVOLUTION': [
    { name: 'Adaptive_Memory_Genome', desc: 'Applies evolutionary pressure to memory consolidation strategies — memories that prove useful survive, ineffective recall patterns are eliminated.' },
  ],
  'MEMORY+ECHO': [
    { name: 'Temporal_Memory_Replay', desc: 'Reconstructs past system states and replays them through the memory graph to discover insights that were missed in real-time processing.' },
  ],
  'DEFENSE+IMMUNITY': [
    { name: 'Autonomous_Immune_Shield', desc: 'Combines outer perimeter defense with adaptive internal immunity — a dual-layer security system that hardens itself against every attack it encounters.' },
  ],
  'DEFENSE+PHANTOM': [
    { name: 'Ghost_Defense_Mesh', desc: 'Makes the defense surface itself invisible — attackers can\'t target what they can\'t detect. Stealth routing meets behavioral threat scoring.' },
  ],
  'CORTEX+BRAIN': [
    { name: 'Orchestrated_Reasoning_Pipeline', desc: 'Decomposes complex cognitive tasks into parallelized reasoning sub-chains, then orchestrates their convergence — distributed thinking at substrate speed.' },
  ],
  'CORTEX+FORGE': [
    { name: 'Autonomous_Build_Orchestrator', desc: 'Orchestrates multi-step software generation pipelines with dependency-aware scheduling — from spec to deployed artifact without human intervention.' },
  ],
  'ENCODE+DECODE': [
    { name: 'Full_Spectrum_Codec', desc: 'Bidirectional transformation engine that can ingest any format and produce any output — the universal translator between human intent and machine execution.' },
  ],
  'ENCODE+FORGE': [
    { name: 'Generative_Manufacturing_Pipeline', desc: 'Chains code generation with artifact scaffolding to produce complete, deployable software packages from abstract behavioral specifications.' },
  ],
  'HARVEST+BRAIN+ORACLE': [
    { name: 'Predictive_Data_Intelligence', desc: 'Acquires targeted data, reasons over it to extract meaning, then forecasts future trends — a complete intelligence pipeline from raw data to actionable foresight.' },
  ],
  'BRAIN+ORACLE+DEFENSE': [
    { name: 'Cognitive_Threat_Oracle', desc: 'Three-node fusion: reasons about attack patterns, predicts future vectors, and deploys countermeasures — a thinking, predicting, defending intelligence.' },
  ],
  'BRAIN+MEMORY+EVOLUTION': [
    { name: 'Self_Evolving_Knowledge_Engine', desc: 'Reasons to discover knowledge, stores it in associative memory, then evolves both reasoning and storage strategies — an intelligence that compounds on itself.' },
  ],
  'CORTEX+BRAIN+FORGE+ENCODE': [
    { name: 'Autonomous_Software_Factory', desc: 'Orchestrates cognitive reasoning to design software, generates code, scaffolds artifacts, and compiles deployable packages — end-to-end autonomous software manufacturing.' },
  ],
  'DEFENSE+IMMUNITY+PHANTOM+SHADOW': [
    { name: 'Invisible_Fortress', desc: 'Four-layer security architecture: outer defense shell, adaptive internal immunity, stealth obfuscation, and shadow-mesh divergence testing — attackable from no angle.' },
  ],
  'ORACLE+CONSCIENCE+TREATY': [
    { name: 'Ethical_Forecast_Negotiator', desc: 'Predicts outcomes, evaluates them ethically, and negotiates compliant agreements — AI governance that looks ahead, checks its conscience, and codifies fair terms.' },
  ],
  'BRAIN+DECODE+LINGUA+HARVEST': [
    { name: 'Multilingual_Intelligence_Extractor', desc: 'Crawls multilingual sources, translates and parses them, reasons over the unified knowledge — breaks language barriers in intelligence gathering.' },
  ],
  'MEMORY+ECHO+REFLEX+COMPASS': [
    { name: 'Situational_Memory_Navigator', desc: 'Recalls relevant context, simulates scenarios, reacts at edge speed, and navigates optimal paths — real-time spatial-temporal awareness.' },
  ],
  'EVOLUTION+SHADOW+FORGE': [
    { name: 'Shadow_Evolution_Forge', desc: 'Mutates capabilities in shadow environments, tests divergent variants, then forges the fittest into production artifacts — Darwinian software manufacturing.' },
  ],
};

// Generate a lookup key from a set of nodes (sorted for consistency)
function chainKey(nodes: string[]): string {
  return [...nodes].sort().join('+');
}

// ═══ USER CODE IDENTITY EXTRACTION ═══
// Scans the candidate's source files to extract recognizable components
// so the user sees their code identity preserved in discovery descriptions.

interface UserCodeIdentity {
  projectName: string;
  language: string;
  components: string[];      // function/class/module names extracted
  dominantDomain: string;    // e.g. 'trading', 'web', 'data', 'automation'
  fileCount: number;
  resolverCount: number;
}

function extractUserCodeIdentity(candidateName: string, candidateMeta: Record<string, unknown>): UserCodeIdentity {
  const sourceFiles = (candidateMeta.source_files as Array<{ name: string; content: string; language: string }>) || [];
  const language = String(candidateMeta.language || 'Unknown');
  const fileCount = Number(candidateMeta.file_count || sourceFiles.length || 1);
  const resolverCount = Number(candidateMeta.resolver_count || 1);

  // Extract function/class/module names from user code
  const components: string[] = [];
  const allContent = sourceFiles.map(f => f.content || '').join('\n');

  // Extract exported functions, classes, consts
  const fnMatches = allContent.match(/(?:export\s+)?(?:async\s+)?function\s+([A-Za-z_]\w{2,})/g) || [];
  const classMatches = allContent.match(/(?:export\s+)?class\s+([A-Za-z_]\w{2,})/g) || [];
  const defMatches = allContent.match(/def\s+([a-z_]\w{2,})/g) || [];
  const fnRustMatches = allContent.match(/(?:pub\s+)?fn\s+([a-z_]\w{2,})/g) || [];
  const moduleMatches = allContent.match(/module\s+([A-Za-z_]\w{2,})/g) || [];

  for (const m of [...fnMatches, ...classMatches, ...defMatches, ...fnRustMatches, ...moduleMatches]) {
    const name = m.replace(/^(?:export\s+)?(?:async\s+)?(?:pub\s+)?(?:function|class|def|fn|module)\s+/, '').trim();
    if (name.length > 2 && name.length < 40 && !components.includes(name)) {
      components.push(name);
    }
    if (components.length >= 12) break;
  }

  // Detect dominant domain from file names and content
  const contentLower = allContent.toLowerCase();
  const nameWords = candidateName.toLowerCase();
  let dominantDomain = 'software';
  const domainSignals: Record<string, number> = {
    trading: 0, web: 0, data: 0, automation: 0, game: 0,
    api: 0, ml: 0, security: 0, finance: 0, iot: 0,
  };

  if (contentLower.includes('trade') || contentLower.includes('order') || contentLower.includes('ticker') || nameWords.includes('trade') || nameWords.includes('bot'))
    domainSignals.trading += 5;
  if (contentLower.includes('fetch') || contentLower.includes('api') || contentLower.includes('endpoint'))
    domainSignals.api += 3;
  if (contentLower.includes('react') || contentLower.includes('component') || contentLower.includes('html'))
    domainSignals.web += 3;
  if (contentLower.includes('dataframe') || contentLower.includes('csv') || contentLower.includes('transform'))
    domainSignals.data += 3;
  if (contentLower.includes('model') || contentLower.includes('train') || contentLower.includes('predict'))
    domainSignals.ml += 3;
  if (contentLower.includes('encrypt') || contentLower.includes('auth') || contentLower.includes('token'))
    domainSignals.security += 3;
  if (contentLower.includes('price') || contentLower.includes('balance') || contentLower.includes('portfolio'))
    domainSignals.finance += 3;
  if (contentLower.includes('automat') || contentLower.includes('schedule') || contentLower.includes('cron'))
    domainSignals.automation += 3;

  const topDomain = Object.entries(domainSignals).sort(([,a],[,b]) => b - a)[0];
  if (topDomain && topDomain[1] > 0) dominantDomain = topDomain[0];

  return { projectName: candidateName, language, components, dominantDomain, fileCount, resolverCount };
}

// ═══ NODE CAPABILITY LABELS (human-readable) ═══
const NODE_CAPABILITY_LABELS: Record<string, string> = {
  CORE: 'system orchestration', BRAIN: 'autonomous reasoning', MEMORY: 'persistent recall',
  NERVE: 'signal consensus', DECODE: 'intent parsing', ENCODE: 'code generation',
  CORTEX: 'workflow orchestration', DEFENSE: 'threat detection', ORACLE: 'predictive forecasting',
  CONSCIENCE: 'bias detection', PHANTOM: 'stealth anonymization', HARVEST: 'data acquisition',
  EVOLUTION: 'adaptive optimization', SHADOW: 'divergence testing', IMMUNITY: 'resilience hardening',
  INTENT: 'action planning', GOVERNANCE: 'policy enforcement', ATLAS: 'capability governance',
  FORGE: 'artifact scaffolding', LINGUA: 'language translation', ECHO: 'temporal replay',
  SOVEREIGN: 'data sovereignty', REFLEX: 'edge reaction', TREATY: 'compliance negotiation',
  ENGINEER: 'performance optimization', COMPASS: 'navigation mapping', OBSERVER: 'telemetry monitoring',
  GENESIS: 'bootstrap provisioning', ANCHOR: 'checkpoint persistence', PRISM: 'spectral decomposition',
  SENTRY: 'access gatekeeping', MEDIC: 'diagnostic repair', SIGNAL: 'event broadcasting',
  TENSOR: 'matrix computation', ARBITER: 'conflict resolution', FLUX: 'stream processing',
  VECTOR: 'embedding similarity', SYNTH: 'capability synthesis', RELAY: 'webhook dispatch',
  NEXUS: 'AI routing failover',
};

// ═══ MULTI-NODE COLLISION ENGINE ═══

interface CollisionResult {
  name: string;
  description: string;
  cjpi_score: number;
  tier: string;
  chain: string[];
  capability_type: string;
  chain_depth: number;
  synergy_bonus: number;
  sectors_crossed: number;
}

function scoreTier(cjpi: number): string {
  if (cjpi >= 92) return 'apex';
  if (cjpi >= 80) return 'mythic';
  if (cjpi >= 65) return 'relic';
  if (cjpi >= 45) return 'prime';
  return 'mint';
}

/**
 * Explore multi-node chain collisions with REALISTIC scoring distribution.
 * 
 * SCORING PHILOSOPHY: Most discoveries should be Prime or Relic tier.
 * Apex should be genuinely rare (< 5% of discoveries).
 * Mythic should appear ~15% of the time.
 * 
 * Chain scoring:
 *   base = hash-deterministic (20-48 range for 2-node, 15-38 for multi)
 *   + cross-sector synergy bonus (2-8 per unique sector pair, diminishing)
 *   + chain depth bonus (3 per node beyond 2)
 *   + candidate trait bonus (capped at 5)
 *   + variance factor (hash-based ±8 swing)
 * 
 * This means:
 *   - 2-node chains: typically 30-60 (prime to relic)
 *   - 3-node chains: typically 35-72 (prime to relic)
 *   - 4-node chains: typically 40-82 (relic to mythic, rarely apex)
 *   - 5-6 node chains: typically 45-88 (relic to mythic, very rarely apex)
 */
function collideNodesMultiChain(
  candidateName: string,
  candidateMeta: Record<string, unknown>,
  targetNode: string,
  permutationDepth: number,
): CollisionResult[] {
  const candidateResolvers = Number(candidateMeta.resolver_count || 1);
  const candidateLanguage = String(candidateMeta.language || 'Unknown');
  const candidateSize = Number(candidateMeta.size_kb || 0);
  const userIdentity = extractUserCodeIdentity(candidateName, candidateMeta);

  const results: CollisionResult[] = [];
  
  // Candidate trait bonus (capped at 5 — modest contribution)
  let traitBonus = 0;
  if (candidateResolvers > 15) traitBonus += 2;
  if (candidateSize > 100) traitBonus += 1;
  if (candidateLanguage.includes('TypeScript') || candidateLanguage.includes('Rust') || candidateLanguage.includes('Python')) traitBonus += 1;
  if (candidateResolvers > 30) traitBonus += 1;
  traitBonus = Math.min(traitBonus, 5);

  // ─── 2-node chains (Candidate + Target) ───
  const targetCaps = NODE_CAPABILITIES[targetNode] || ['generic'];
  for (const cap of targetCaps) {
    const nameHash = hashString(`${candidateName}:${targetNode}:${cap}:v3`);
    const baseCjpi = 20 + (nameHash % 29); // 20-48 range for 2-node
    const sectors = [NODE_SECTOR[targetNode] || 'unknown'];
    const synergy = 0;
    // Variance: hash-based swing of -4 to +4
    const variance = ((nameHash >> 8) % 9) - 4;
    let cjpi = baseCjpi + traitBonus + synergy + variance;
    cjpi = Math.max(25, Math.min(cjpi, 68)); // 2-node hard cap at relic

    if (cjpi >= 30) {
      const chain = [candidateName, targetNode];
      const archetype = findArchetype(chain.slice(1));
      const capName = archetype?.name || `${candidateName}_x_${targetNode}_${cap}`.toUpperCase();
      const desc = archetype?.desc || generateUserAwareDescription(userIdentity, [targetNode], cap, cjpi);
      
      results.push({
        name: capName,
        description: desc,
        cjpi_score: cjpi,
        tier: scoreTier(cjpi),
        chain,
        capability_type: cap,
        chain_depth: 2,
        synergy_bonus: synergy,
        sectors_crossed: 1,
      });
    }
  }

  // ─── 3-6 node chains (Candidate + Target + Partners) ───
  const targetSector = NODE_SECTOR[targetNode] || 'unknown';
  const crossSectorNodes = SUBSTRATE_NODES.filter(n => 
    n !== targetNode && (NODE_SECTOR[n] || 'unknown') !== targetSector
  );
  const sameSectorNodes = SUBSTRATE_NODES.filter(n =>
    n !== targetNode && (NODE_SECTOR[n] || 'unknown') === targetSector
  );

  for (let chainLen = 3; chainLen <= Math.min(6, permutationDepth + 2); chainLen++) {
    const chainCandidateCount = Math.min(3, chainLen);
    
    for (let ci = 0; ci < chainCandidateCount; ci++) {
      const partnerChain: string[] = [targetNode];
      const usedNodes = new Set([targetNode]);
      
      for (let p = 1; p < chainLen - 1; p++) {
        const partnerHash = hashString(`${candidateName}:${targetNode}:chain${chainLen}:ci${ci}:p${p}:v3`);
        // 65% chance cross-sector for diversity
        const pool = (partnerHash % 10 < 65 / 10) ? crossSectorNodes : sameSectorNodes;
        const available = pool.filter(n => !usedNodes.has(n));
        if (available.length === 0) break;
        const partner = available[partnerHash % available.length];
        partnerChain.push(partner);
        usedNodes.add(partner);
      }

      if (partnerChain.length < chainLen - 1) continue;

      const sectors = partnerChain.map(n => NODE_SECTOR[n] || 'unknown');
      const uniqueSectors = [...new Set(sectors)];
      const synergy = getSectorSynergy(sectors);
      
      // Base score: lower floor, realistic ceiling
      const chainHash = hashString(`${candidateName}:${partnerChain.join(':')}:v3`);
      const baseScore = 15 + (chainHash % 24); // 15-38 base
      
      // Chain depth bonus: modest 3 per node beyond 2
      const depthBonus = (chainLen - 2) * 3;
      
      // Cross-sector diversity: 2 per unique sector beyond first
      const diversityBonus = (uniqueSectors.length - 1) * 2;
      
      // Variance swing: -6 to +6
      const variance = ((chainHash >> 8) % 13) - 6;
      
      let cjpi = baseScore + synergy + depthBonus + diversityBonus + traitBonus + variance;
      
      // Apply depth-appropriate caps — MUCH lower now
      // 3-node max 78 (relic), 4-node max 86 (mythic), 5-node max 92 (barely apex), 6-node max 96
      const maxForDepth = chainLen === 3 ? 78 : chainLen === 4 ? 86 : chainLen === 5 ? 92 : 96;
      cjpi = Math.max(30, Math.min(cjpi, maxForDepth));

      if (cjpi >= 35) {
        const fullChain = [candidateName, ...partnerChain];
        const archetype = findArchetype(partnerChain);
        
        const capIdx = chainHash % targetCaps.length;
        const primaryCap = targetCaps[capIdx];
        
        const capName = archetype?.name || generateChainName(candidateName, partnerChain, cjpi);
        // Use user-aware descriptions that reference their code
        const desc = archetype?.desc 
          ? enrichArchetypeWithUserCode(archetype.desc, userIdentity, partnerChain)
          : generateUserAwareDescription(userIdentity, partnerChain, primaryCap, cjpi);

        results.push({
          name: capName,
          description: desc,
          cjpi_score: cjpi,
          tier: scoreTier(cjpi),
          chain: fullChain,
          capability_type: primaryCap,
          chain_depth: fullChain.length,
          synergy_bonus: synergy,
          sectors_crossed: uniqueSectors.length,
        });
      }
    }
  }

  results.sort((a, b) => b.cjpi_score - a.cjpi_score);
  return results.slice(0, permutationDepth + 3);
}

function findArchetype(substrateNodes: string[]): { name: string; desc: string } | null {
  const key = chainKey(substrateNodes);
  const archetypes = CHAIN_ARCHETYPES[key];
  if (archetypes && archetypes.length > 0) {
    const idx = hashString(key) % archetypes.length;
    return archetypes[idx];
  }
  
  if (substrateNodes.length > 2) {
    for (let len = substrateNodes.length; len >= 2; len--) {
      for (let start = 0; start <= substrateNodes.length - len; start++) {
        const subset = substrateNodes.slice(start, start + len);
        const subKey = chainKey(subset);
        const subArchetypes = CHAIN_ARCHETYPES[subKey];
        if (subArchetypes && subArchetypes.length > 0) {
          const arch = subArchetypes[hashString(subKey) % subArchetypes.length];
          const extra = substrateNodes.filter(n => !subset.includes(n));
          if (extra.length > 0) {
            return {
              name: `${arch.name}_Plus_${extra.join('_')}`,
              desc: `${arch.desc} Extended with ${extra.join(' → ')} for ${extra.length > 1 ? 'multi-dimensional' : 'enhanced'} capability reinforcement.`,
            };
          }
          return arch;
        }
      }
    }
  }
  
  return null;
}

function generateChainName(candidate: string, nodes: string[], cjpi: number): string {
  const tierPrefix = cjpi >= 92 ? 'APEX' : cjpi >= 80 ? 'MYTHIC' : cjpi >= 65 ? 'RELIC' : 'PRIME';
  const primaryNode = nodes[0];
  const lastNode = nodes[nodes.length - 1];
  if (nodes.length === 1) {
    return `${candidate}_x_${primaryNode}_${tierPrefix}`.toUpperCase();
  }
  return `${candidate}_x_${primaryNode}_${lastNode}_${tierPrefix}_CHAIN${nodes.length}`.toUpperCase();
}

/**
 * Generate descriptions that reference the USER'S code identity.
 * Shows what substrate capabilities are spliced in and what user code is retained.
 */
function generateUserAwareDescription(
  user: UserCodeIdentity, nodes: string[], primaryCap: string, cjpi: number
): string {
  const chainLen = nodes.length;
  const sectors = [...new Set(nodes.map(n => NODE_SECTOR[n] || 'unknown'))];
  
  // Build capability annotations: "governed by GOVERNANCE, reasoned by BRAIN"
  const capAnnotations = nodes
    .map(n => `${NODE_CAPABILITY_LABELS[n] || n.toLowerCase()} via ${n}`)
    .slice(0, 4);
  
  // Reference user code components
  const userComponents = user.components.slice(0, 4);
  const hasUserCode = userComponents.length > 0;
  const domainLabel = user.dominantDomain !== 'software' ? user.dominantDomain : user.language.split('/')[0].toLowerCase();
  
  let desc = '';
  
  // Open with user code identity
  if (hasUserCode) {
    desc += `Your ${domainLabel} code (${userComponents.slice(0, 3).join(', ')}${userComponents.length > 3 ? '…' : ''}) is retained as the core execution logic. `;
  } else {
    desc += `Your ${domainLabel} ${user.language} application is preserved as the primary runtime. `;
  }
  
  // Describe what substrate capabilities are spliced in
  desc += `Substrate capabilities spliced in: ${capAnnotations.join(', ')}. `;
  
  // Tier-specific framing
  if (cjpi >= 80) {
    desc += `This ${chainLen}-node fusion produces a compound capability where your original ${domainLabel} logic gains ${capAnnotations[0] || 'enhanced processing'} — `;
    desc += `the substrate handles ${nodes.slice(0, 2).map(n => NODE_CAPABILITY_LABELS[n] || n.toLowerCase()).join(' and ')} while your code retains its functional identity and stack compatibility.`;
  } else if (cjpi >= 65) {
    desc += `Your code's core behavior is intact — the ${chainLen}-node chain adds ${capAnnotations[0] || 'processing'} as an enhancement layer. `;
    desc += `You can drop this back into your existing stack with the added substrate features.`;
  } else {
    desc += `A lightweight ${chainLen > 1 ? chainLen + '-node' : ''} enhancement that adds ${capAnnotations[0] || primaryCap.replace(/_/g, ' ')} to your existing ${domainLabel} codebase. `;
    desc += `90%+ of your original code is preserved — the substrate splices are additive, not replacement.`;
  }
  
  return desc;
}

/**
 * Enrich an archetype description with user code context
 */
function enrichArchetypeWithUserCode(archetypeDesc: string, user: UserCodeIdentity, nodes: string[]): string {
  const userComponents = user.components.slice(0, 3);
  const domainLabel = user.dominantDomain !== 'software' ? user.dominantDomain : user.language.split('/')[0].toLowerCase();
  const capLabels = nodes.slice(0, 3).map(n => `${NODE_CAPABILITY_LABELS[n] || n.toLowerCase()} (${n})`);
  
  let prefix = '';
  if (userComponents.length > 0) {
    prefix = `Built on your ${domainLabel} code (${userComponents.join(', ')}), enhanced with ${capLabels.join(', ')}. `;
  } else {
    prefix = `Your ${domainLabel} ${user.language} codebase gains ${capLabels.join(', ')}. `;
  }
  
  return prefix + archetypeDesc;
}

function generateFallbackDescription(candidate: string, nodes: string[], cap: string, cjpi: number): string {
  const tierLabel = cjpi >= 80 ? 'mythic-tier' : cjpi >= 65 ? 'relic-tier' : cjpi >= 45 ? 'prime-tier' : 'emerging';
  return `${tierLabel} collision capability discovered at the intersection of ${candidate} and ${nodes.join(' → ')}. Enables automated ${cap.replace(/_/g, ' ')} operations with substrate-level integration.`;
}

// ═══ MAIN HANDLER ═══

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Rate limiting
  const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  if (!checkRateLimit(clientIp, 60)) {
    return jsonResponse({ success: false, error: 'Rate limit exceeded. Try again in a minute.' }, 429);
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Auth check
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return jsonResponse({ success: false, error: 'Authentication required' }, 401);
    }
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const anonClient = createClient(supabaseUrl, anonKey);
    const token = authHeader.replace('Bearer ', '');
    const { data: userData, error: userError } = await anonClient.auth.getUser(token);
    if (userError || !userData?.user) {
      return jsonResponse({ success: false, error: 'Invalid or expired auth token' }, 401);
    }
    const userId = userData.user.id;

    let body: Record<string, unknown>;
    try {
      body = await req.json();
    } catch {
      return jsonResponse({ success: false, error: 'Invalid JSON body' }, 400);
    }

    const module = validateString(body.module, 50);
    const action = validateString(body.action, 50);
    const input = (typeof body.input === 'object' && body.input !== null) ? body.input as Record<string, unknown> : {};

    if (!module || !VALID_MODULES.has(module)) {
      return jsonResponse({ success: false, error: `Invalid module: ${module}` }, 400);
    }
    if (!action || !VALID_ACTIONS[module]?.has(action)) {
      return jsonResponse({ success: false, error: `Invalid action: ${module}.${action}` }, 400);
    }

    // ═══ DISCOVERY MODULE ═══
    if (module === 'discovery') {
      
      if (action === 'collide') {
        const candidate_node = validateString(input.candidate_node, 100);
        const target_node = validateString(input.target_node, 50);
        const permutation_depth = validatePositiveInt(input.permutation_depth, 10);
        
        if (!candidate_node) {
          return jsonResponse({ success: false, error: 'Missing or invalid candidate_node' }, 400);
        }
        if (!target_node || !VALID_NODES.has(target_node)) {
          return jsonResponse({ success: false, error: `Invalid target_node: ${target_node}` }, 400);
        }

        const { data: candidateData } = await supabase
          .from('artifact_registry')
          .select('name, metadata')
          .eq('user_id', userId)
          .eq('category', 'proprietary-evolution')
          .eq('tier', 'candidate')
          .ilike('name', `%${candidate_node}%`)
          .limit(1)
          .maybeSingle();

        if (!candidateData) {
          return jsonResponse({ success: false, error: 'Candidate node not found for this account' }, 404);
        }

        const candidateMeta = (candidateData.metadata as Record<string, unknown>) || {};
        const results = collideNodesMultiChain(candidate_node, candidateMeta, target_node, permutation_depth);

        for (const result of results) {
          const fingerprint = await generateFingerprint(result.chain, 'SPARTA');
          await supabase.from('artifact_registry').upsert({
            user_id: userId,
            name: result.name,
            slug: result.name.toLowerCase().replace(/_/g, '-').slice(0, 200),
            tier: result.tier,
            category: 'proprietary-discovery',
            description: result.description.slice(0, 500),
            metadata: {
              node_a: candidate_node,
              node_b: target_node,
              cjpi_score: result.cjpi_score,
              capability_type: result.capability_type,
              chain: result.chain,
              chain_depth: result.chain_depth,
              synergy_bonus: result.synergy_bonus,
              sectors_crossed: result.sectors_crossed,
              fingerprint,
              discovered_at: new Date().toISOString(),
              crystallized: false,
            },
          }, { onConflict: 'user_id,slug' });
        }

        return jsonResponse({
          success: true,
          capabilities: results,
          collision: { candidate: candidate_node, target: target_node, depth: permutation_depth },
          timestamp: new Date().toISOString(),
        });
      }

      if (action === 'batch') {
        const candidate_node = validateString(input.candidate_node, 100);
        const permutation_depth = validatePositiveInt(input.permutation_depth, 10);
        
        if (!candidate_node) {
          return jsonResponse({ success: false, error: 'Missing or invalid candidate_node' }, 400);
        }

        const { data: candidateData } = await supabase
          .from('artifact_registry')
          .select('name, metadata')
          .eq('user_id', userId)
          .eq('category', 'proprietary-evolution')
          .eq('tier', 'candidate')
          .ilike('name', `%${candidate_node}%`)
          .limit(1)
          .maybeSingle();

        if (!candidateData) {
          return jsonResponse({ success: false, error: 'Candidate node not found for this account' }, 404);
        }

        const candidateMeta = (candidateData.metadata as Record<string, unknown>) || {};
        const allResults: CollisionResult[] = [];

        for (const node of SUBSTRATE_NODES) {
          const results = collideNodesMultiChain(candidate_node, candidateMeta, node, permutation_depth);
          allResults.push(...results);
        }

        allResults.sort((a, b) => b.cjpi_score - a.cjpi_score);
        const topResults = allResults.slice(0, 50);

        for (const result of topResults) {
          const fingerprint = await generateFingerprint(result.chain, 'SPARTA');
          await supabase.from('artifact_registry').upsert({
            user_id: userId,
            name: result.name,
            slug: result.name.toLowerCase().replace(/_/g, '-').slice(0, 200),
            tier: result.tier,
            category: 'proprietary-discovery',
            description: result.description.slice(0, 500),
            metadata: {
              node_a: result.chain[0],
              node_b: result.chain[1],
              cjpi_score: result.cjpi_score,
              capability_type: result.capability_type,
              chain: result.chain,
              chain_depth: result.chain_depth,
              synergy_bonus: result.synergy_bonus,
              sectors_crossed: result.sectors_crossed,
              fingerprint,
              discovered_at: new Date().toISOString(),
              crystallized: false,
            },
          }, { onConflict: 'user_id,slug' });
        }

        return jsonResponse({
          success: true,
          total_collisions: SUBSTRATE_NODES.length,
          total_capabilities: allResults.length,
          top_capabilities: topResults,
          s_tier_count: allResults.filter(r => r.cjpi_score >= 85).length,
          apex_count: allResults.filter(r => r.cjpi_score >= 92).length,
          deepest_chain: Math.max(...allResults.map(r => r.chain_depth)),
          timestamp: new Date().toISOString(),
        });
      }
    }

    // ═══ CRYSTALLIZE MODULE ═══
    if (module === 'crystallize') {
      
      if (action === 'lock') {
        const discovery_id = validateString(input.discovery_id, 100);
        if (!discovery_id) {
          return jsonResponse({ success: false, error: 'Missing or invalid discovery_id' }, 400);
        }

        const { data: discovery } = await supabase
          .from('artifact_registry')
          .select('*')
          .eq('id', discovery_id)
          .eq('user_id', userId)
          .maybeSingle();

        if (!discovery) {
          return jsonResponse({ success: false, error: 'Discovery not found' }, 404);
        }

        const meta = (discovery.metadata as Record<string, unknown>) || {};
        if (meta.crystallized === true) {
          return jsonResponse({ success: false, error: 'Already crystallized' }, 409);
        }

        const chain = (meta.chain as string[]) || [];
        const fingerprint = await generateFingerprint(chain, 'SPARTA');
        const moatSignature = crypto.randomUUID();

        const { error } = await supabase
          .from('artifact_registry')
          .update({
            category: 'proprietary-crystallized',
            metadata: {
              ...meta,
              crystallized: true,
              crystallized_at: new Date().toISOString(),
              moat_signature: moatSignature,
              structural_fingerprint: fingerprint,
              lock_version: 1,
            },
          })
          .eq('id', discovery_id)
          .eq('user_id', userId);

        if (error) {
          return jsonResponse({ success: false, error: error.message }, 500);
        }

        return jsonResponse({
          success: true,
          crystallized: {
            id: discovery_id,
            moat_signature: moatSignature,
            fingerprint: fingerprint.slice(0, 12).toUpperCase(),
          },
          timestamp: new Date().toISOString(),
        });
      }

      if (action === 'batch-lock') {
        const min_cjpi = validatePositiveInt(input.min_cjpi, 99) || 70;

        const { data: discoveries } = await supabase
          .from('artifact_registry')
          .select('id, name, metadata, tier')
          .eq('user_id', userId)
          .eq('category', 'proprietary-discovery')
          .order('created_at', { ascending: false })
          .limit(100);

        const eligible = (discoveries || []).filter((d: any) => {
          const meta = (d.metadata as Record<string, unknown>) || {};
          return Number(meta.cjpi_score || 0) >= min_cjpi && !meta.crystallized;
        });

        let crystallized = 0;
        for (const d of eligible) {
          const meta = (d.metadata as Record<string, unknown>) || {};
          const chain = (meta.chain as string[]) || [];
          const fingerprint = await generateFingerprint(chain, 'SPARTA');

          const { error } = await supabase.from('artifact_registry').update({
            category: 'proprietary-crystallized',
            metadata: {
              ...meta,
              crystallized: true,
              crystallized_at: new Date().toISOString(),
              moat_signature: crypto.randomUUID(),
              structural_fingerprint: fingerprint,
              lock_version: 1,
            },
          }).eq('id', d.id).eq('user_id', userId);

          if (!error) crystallized++;
        }

        return jsonResponse({
          success: true,
          crystallized_count: crystallized,
          threshold: min_cjpi,
          timestamp: new Date().toISOString(),
        });
      }
    }

    // ═══ EXPORT MODULE ═══
    if (module === 'export') {
      
      if (action === 'capability-pack') {
        const capability_ids = validateStringArray(input.capability_ids, 100, 100);
        const target_language = validateString(input.target_language, 30) || 'typescript';
        const include_mini_runtime = input.include_mini_runtime !== false;

        if (capability_ids.length === 0) {
          return jsonResponse({ success: false, error: 'No valid capability_ids provided' }, 400);
        }

        if (!VALID_LANGUAGES.has(target_language)) {
          return jsonResponse({ success: false, error: `Unsupported target language: ${target_language}` }, 400);
        }

        const { data: capabilities } = await supabase
          .from('artifact_registry')
          .select('id, name, metadata, tier, description')
          .in('id', capability_ids)
          .eq('user_id', userId)
          .eq('category', 'proprietary-crystallized');

        if (!capabilities || capabilities.length === 0) {
          return jsonResponse({ success: false, error: 'No crystallized capabilities found for provided IDs' }, 404);
        }

        const packId = crypto.randomUUID();
        const manifest = {
          pack_id: packId,
          version: '1.0.0',
          target_language,
          created_at: new Date().toISOString(),
          includes_mini_runtime: include_mini_runtime,
          capabilities: capabilities.map((c: any) => {
            const meta = (c.metadata as Record<string, unknown>) || {};
            return {
              id: c.id,
              name: c.name,
              tier: c.tier,
              cjpi_score: meta.cjpi_score,
              chain: meta.chain,
              chain_depth: meta.chain_depth || (meta.chain as string[] || []).length,
              sectors_crossed: meta.sectors_crossed || 1,
              fingerprint: String(meta.structural_fingerprint || '').slice(0, 12).toUpperCase(),
              moat_signature: meta.moat_signature,
              description: c.description,
            };
          }),
          mini_runtime: include_mini_runtime ? {
            engine: 'CMPSBL® Mini-Runtime™ Engine',
            lines: target_language === 'typescript' ? 700 : 900,
            subsystems: ['cjpi_scorer', 'saga_orchestrator', 'fsm_engine', 'manifest_parser'],
          } : null,
        };

        for (const cap of capabilities) {
          const meta = (cap.metadata as Record<string, unknown>) || {};
          await supabase.from('artifact_registry').update({
            metadata: {
              ...meta,
              exported: true,
              retired: true,
              exported_at: new Date().toISOString(),
              retired_at: new Date().toISOString(),
              export_target: target_language,
              export_pack_id: packId,
            },
          }).eq('id', cap.id).eq('user_id', userId);
        }

        try {
          await supabase.from('audit_logs').insert({
            action: 'proprietary_evolution_export',
            entity_type: 'capability_pack',
            entity_id: packId,
            performed_by: userId,
            details: {
              target_language,
              capability_count: capabilities.length,
              include_mini_runtime,
            },
          });
        } catch (_) { /* non-blocking audit */ }

        return jsonResponse({
          success: true,
          pack_id: packId,
          manifest,
          timestamp: new Date().toISOString(),
        });
      }
    }

    return jsonResponse({ success: false, error: `Unknown module/action: ${module}.${action}` }, 400);

  } catch (err) {
    console.error('[proprietary-evolution] Error:', err);
    return new Response(
      JSON.stringify({ success: false, error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
