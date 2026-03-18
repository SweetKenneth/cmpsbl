/**
 * pf-proprietary-evolution — Proprietary Evolution Lifecycle Engine
 * 
 * Handles:
 *   - discovery.collide: Bounce Candidate Node #41 against substrate nodes (multi-chain 2-8 depth)
 *   - discovery.batch: Run full collision sweep across all 40 nodes with chain exploration
 *   - ascend.lock: Lock a discovered capability into deterministic memory
 *   - ascend.batch-lock: Batch ascend all eligible discoveries
 *   - export.capability-pack: Generate capability pack from ascended memories
 * 
 * Node 41 Architecture:
 *   The user's code is scanned to derive a CAPABILITY SURFACE — a set of 4 capability
 *   verbs and a sector assignment — making it a first-class node in the collision engine.
 *   Node 41 participates in synergy scoring identically to the 40 substrate nodes.
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
const SECTOR_SYNERGY: Record<string, number> = {
  'ccr+esz': 6, 'ccr+csz': 7, 'ccr+execution': 4, 'ccr+shell': 5,
  'execution+esz': 4, 'execution+csz': 5, 'execution+field': 3,
  'esz+csz': 8, 'esz+shell': 5, 'ocg+csz': 5, 'ocg+esz': 4,
  'field+csz': 6, 'field+shell': 4, 'emz+ccr': 5, 'emz+execution': 3,
  'epz+ccr': 5, 'epz+csz': 6, 'plane+csz': 5, 'core+field': 4, 'core+plane': 3,
  // User domain synergies — how user sectors interact with substrate sectors
  'finance+ccr': 7, 'finance+shell': 6, 'finance+esz': 7, 'finance+execution': 5,
  'finance+csz': 5, 'finance+ocg': 6, 'finance+field': 4,
  'web+execution': 6, 'web+ccr': 4, 'web+shell': 5, 'web+emz': 5,
  'data+ccr': 7, 'data+execution': 5, 'data+emz': 6, 'data+epz': 5,
  'ml+ccr': 8, 'ml+execution': 5, 'ml+epz': 6, 'ml+csz': 5,
  'security+shell': 7, 'security+csz': 7, 'security+field': 6, 'security+esz': 6,
  'automation+execution': 6, 'automation+ocg': 5, 'automation+field': 5,
  'iot+ocg': 6, 'iot+execution': 5, 'iot+shell': 5, 'iot+epz': 5,
  'game+execution': 6, 'game+epz': 5, 'game+ccr': 4, 'game+emz': 5,
  'api+execution': 6, 'api+ocg': 5, 'api+shell': 5, 'api+emz': 4,
  'hardware+execution': 6, 'hardware+core': 5, 'hardware+field': 5, 'hardware+shell': 5,
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
  
  const pairCount = (unique.length * (unique.length - 1)) / 2;
  return Math.floor(totalSynergy / Math.max(1, Math.sqrt(pairCount)));
}

// ═══ CHAIN COMPOUND DESCRIPTIONS ═══
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

function chainKey(nodes: string[]): string {
  return [...nodes].sort().join('+');
}

// ═══════════════════════════════════════════════════════════════════════
// CAPABILITY SURFACE EXTRACTION — The heart of Node 41
// Scans user code to derive a REAL capability profile:
//   - nodeName: e.g. "TRADE_ENGINE"
//   - capabilities: 4 verbs (like every substrate node)
//   - sector: maps into the synergy matrix
//   - description: human-readable label
// ═══════════════════════════════════════════════════════════════════════

interface CapabilitySurface {
  nodeName: string;        // e.g. TRADE_ENGINE, DATA_PIPELINE
  capabilities: string[];  // 4 verbs like substrate nodes
  sector: string;          // maps into SECTOR_SYNERGY
  description: string;     // e.g. "Algorithmic trade execution engine"
  components: string[];    // extracted function/class names
  domain: string;          // raw domain label
}

// Domain → capability verb sets (same shape as NODE_CAPABILITIES)
const DOMAIN_CAPABILITY_MAP: Record<string, { nodeName: string; capabilities: string[]; sector: string; description: string }> = {
  trading:    { nodeName: 'TRADE_ENGINE',    capabilities: ['execute_trade', 'assess_risk', 'price_feed', 'rebalance'],     sector: 'finance',  description: 'Algorithmic trade execution engine' },
  finance:    { nodeName: 'FINANCE_CORE',    capabilities: ['calculate', 'ledger_post', 'reconcile', 'audit_trail'],        sector: 'finance',  description: 'Financial computation and ledger core' },
  web:        { nodeName: 'WEB_SERVICE',     capabilities: ['serve_request', 'route', 'authenticate', 'render'],            sector: 'web',      description: 'Web service request handler' },
  api:        { nodeName: 'API_GATEWAY',     capabilities: ['route_request', 'validate', 'transform_payload', 'rate_gate'], sector: 'api',      description: 'API gateway and request pipeline' },
  data:       { nodeName: 'DATA_PIPELINE',   capabilities: ['transform_data', 'pipeline', 'validate_schema', 'aggregate'], sector: 'data',     description: 'Data transformation pipeline' },
  ml:         { nodeName: 'ML_ENGINE',       capabilities: ['train_model', 'predict', 'evaluate', 'feature_extract'],       sector: 'ml',       description: 'Machine learning inference engine' },
  security:   { nodeName: 'SECURITY_CORE',   capabilities: ['encrypt', 'authenticate', 'authorize', 'audit_access'],       sector: 'security', description: 'Security and access control core' },
  automation: { nodeName: 'AUTO_EXECUTOR',   capabilities: ['schedule', 'execute_task', 'monitor', 'retry_logic'],          sector: 'automation', description: 'Task automation executor' },
  iot:        { nodeName: 'IOT_BRIDGE',      capabilities: ['sense', 'transmit', 'actuate', 'calibrate'],                   sector: 'iot',      description: 'IoT device bridge and telemetry' },
  game:       { nodeName: 'GAME_RUNTIME',    capabilities: ['simulate', 'render_frame', 'handle_input', 'update_state'],    sector: 'game',     description: 'Game state and simulation runtime' },
  hardware:   { nodeName: 'HDL_SYNTHESIZER', capabilities: ['synthesize', 'simulate_circuit', 'route_signal', 'verify_timing'], sector: 'hardware', description: 'Hardware description and synthesis engine' },
  software:   { nodeName: 'CODE_MODULE',     capabilities: ['process', 'transform', 'validate', 'dispatch'],                sector: 'execution', description: 'General-purpose code module' },
};

// Verb extraction: extract the 4 most-frequent verbs from function names
function extractVerbsFromCode(content: string): string[] {
  const fnNames: string[] = [];
  const patterns = [
    /(?:export\s+)?(?:async\s+)?function\s+([a-zA-Z_]\w{2,})/g,
    /(?:pub\s+)?fn\s+([a-z_]\w{2,})/g,
    /def\s+([a-z_]\w{2,})/g,
    /module\s+([A-Za-z_]\w{2,})/g,
    /const\s+([a-zA-Z_]\w{2,})\s*=/g,
  ];
  for (const pat of patterns) {
    let m;
    while ((m = pat.exec(content)) !== null) {
      fnNames.push(m[1]);
    }
  }
  // Convert camelCase/snake_case to individual words, take verb-like first words
  const verbs: Record<string, number> = {};
  for (const name of fnNames) {
    const words = name
      .replace(/([a-z])([A-Z])/g, '$1_$2')
      .toLowerCase()
      .split('_')
      .filter(w => w.length > 2);
    if (words.length > 0) {
      const verb = words[0];
      verbs[verb] = (verbs[verb] || 0) + 1;
    }
  }
  return Object.entries(verbs)
    .sort(([,a],[,b]) => b - a)
    .slice(0, 4)
    .map(([v]) => v);
}

function deriveCapabilitySurface(candidateName: string, candidateMeta: Record<string, unknown>): CapabilitySurface {
  const sourceFiles = (candidateMeta.source_files as Array<{ name: string; content: string; language: string }>) || [];
  const language = String(candidateMeta.language || 'Unknown');
  const allContent = sourceFiles.map(f => f.content || '').join('\n');
  const contentLower = allContent.toLowerCase();
  const nameWords = candidateName.toLowerCase();

  // ─── Step 1: Detect domain from content signals ───
  const domainSignals: Record<string, number> = {};
  const signalChecks: [string, string[]][] = [
    ['trading', ['trade', 'order', 'ticker', 'exchange', 'position', 'portfolio']],
    ['finance', ['balance', 'ledger', 'payment', 'invoice', 'accounting']],
    ['web', ['react', 'component', 'html', 'css', 'dom', 'render']],
    ['api', ['endpoint', 'fetch', 'api', 'rest', 'graphql', 'request']],
    ['data', ['dataframe', 'csv', 'transform', 'pipeline', 'etl', 'aggregate']],
    ['ml', ['model', 'train', 'predict', 'tensor', 'neural', 'loss']],
    ['security', ['encrypt', 'auth', 'token', 'jwt', 'certificate', 'firewall']],
    ['automation', ['automat', 'schedule', 'cron', 'task', 'workflow', 'queue']],
    ['iot', ['sensor', 'mqtt', 'gpio', 'device', 'telemetry', 'actuator']],
    ['game', ['game', 'sprite', 'render', 'physics', 'collision', 'player']],
    ['hardware', ['verilog', 'vhdl', 'module', 'wire', 'reg', 'clock', 'synthesis', 'fpga', 'signal', 'assign']],
  ];

  for (const [domain, keywords] of signalChecks) {
    let score = 0;
    for (const kw of keywords) {
      if (contentLower.includes(kw)) score += 2;
      if (nameWords.includes(kw)) score += 3;
    }
    if (score > 0) domainSignals[domain] = score;
  }

  // Also check language hints for HDL
  const langLower = language.toLowerCase();
  if (langLower.includes('verilog') || langLower.includes('vhdl') || langLower.includes('systemverilog') || langLower.includes('chisel') || langLower.includes('spice')) {
    domainSignals.hardware = (domainSignals.hardware || 0) + 10;
  }

  const sortedDomains = Object.entries(domainSignals).sort(([,a],[,b]) => b - a);
  const detectedDomain = sortedDomains.length > 0 ? sortedDomains[0][0] : 'software';

  // ─── Step 2: Get base capability profile from domain ───
  const baseProfile = DOMAIN_CAPABILITY_MAP[detectedDomain] || DOMAIN_CAPABILITY_MAP.software;

  // ─── Step 3: Extract real function/class names from code ───
  const components: string[] = [];
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

  // ─── Step 4: Try to derive verbs from actual code if we have content ───
  let capabilities = baseProfile.capabilities;
  if (allContent.length > 50) {
    const codeVerbs = extractVerbsFromCode(allContent);
    if (codeVerbs.length >= 3) {
      // Use the user's actual verbs, padded with domain defaults
      capabilities = [...codeVerbs.slice(0, 4)];
      while (capabilities.length < 4) {
        const fallback = baseProfile.capabilities[capabilities.length];
        if (fallback && !capabilities.includes(fallback)) {
          capabilities.push(fallback);
        } else {
          capabilities.push('process');
        }
      }
    }
  }

  // ─── Step 5: Build the node name from candidate + domain ───
  // If the user code has a clear project name use it, otherwise use domain
  const cleanName = candidateName.replace(/^CANDIDATE_/, '').replace(/_/g, ' ').trim();
  const nodeName = cleanName.length > 2 && cleanName.length < 20
    ? cleanName.toUpperCase().replace(/\s+/g, '_')
    : baseProfile.nodeName;

  return {
    nodeName,
    capabilities,
    sector: baseProfile.sector,
    description: `${baseProfile.description} — derived from ${language} source (${components.slice(0, 3).join(', ')}${components.length > 3 ? '…' : ''})`,
    components,
    domain: detectedDomain,
  };
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

// ═══ MULTI-NODE COLLISION ENGINE (Node 41 = First-Class Participant) ═══

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
  candidate_surface?: CapabilitySurface;
}

function scoreTier(cjpi: number): string {
  if (cjpi >= 92) return 'apex';
  if (cjpi >= 80) return 'mythic';
  if (cjpi >= 65) return 'relic';
  if (cjpi >= 45) return 'prime';
  return 'mint';
}

/**
 * Multi-node chain collisions where Node 41 is a REAL participant.
 * 
 * Key change: The candidate's sector and capabilities contribute to synergy
 * scoring just like any substrate node. Node 41 is no longer a label.
 */
function collideNodesMultiChain(
  candidateName: string,
  candidateMeta: Record<string, unknown>,
  targetNode: string,
  permutationDepth: number,
): CollisionResult[] {
  // ═══ DERIVE NODE 41's CAPABILITY SURFACE ═══
  const surface = deriveCapabilitySurface(candidateName, candidateMeta);
  
  // Register Node 41 into the local lookup tables for this collision
  const node41Name = `Ψ₄₁ ${surface.nodeName}`;
  const candidateResolvers = Number(candidateMeta.resolver_count || 1);
  const candidateSize = Number(candidateMeta.size_kb || 0);

  const results: CollisionResult[] = [];
  
  // Candidate trait bonus (capped at 5)
  let traitBonus = 0;
  if (candidateResolvers > 15) traitBonus += 2;
  if (candidateSize > 100) traitBonus += 1;
  if (surface.capabilities.length >= 4) traitBonus += 1;
  if (candidateResolvers > 30) traitBonus += 1;
  traitBonus = Math.min(traitBonus, 5);

  // ─── 2-node chains (Node 41 + Target) ───
  // Now Node 41's sector participates in synergy!
  const targetCaps = NODE_CAPABILITIES[targetNode] || ['generic'];
  const candidateSector = surface.sector;
  const targetSector = NODE_SECTOR[targetNode] || 'unknown';
  
  for (const cap of targetCaps) {
    const nameHash = hashString(`${surface.nodeName}:${targetNode}:${cap}:v4`);
    const baseCjpi = 20 + (nameHash % 29); // 20-48 range
    
    // NEW: Node 41's sector creates real synergy with the target
    const sectors = [candidateSector, targetSector];
    const synergy = getSectorSynergy(sectors);
    
    const variance = ((nameHash >> 8) % 9) - 4;
    let cjpi = baseCjpi + traitBonus + synergy + variance;
    cjpi = Math.max(25, Math.min(cjpi, 72)); // 2-node cap slightly higher now that synergy is real

    if (cjpi >= 30) {
      const chain = [surface.nodeName, targetNode];
      const archetype = findArchetype([targetNode]);
      
      // FILTER: Only surface discoveries with real archetype names.
      // Generic chain names (NODE_X_NODE_TIER_CHAIN3) are noise — skip them.
      if (!archetype) continue;
      
      const desc = archetype.desc 
        ? enrichWithNode41(archetype.desc, surface, [targetNode])
        : generateNode41AwareDescription(surface, [targetNode], cap, cjpi);
      
      results.push({
        name: archetype.name,
        description: desc,
        cjpi_score: cjpi,
        tier: scoreTier(cjpi),
        chain,
        capability_type: cap,
        chain_depth: 2,
        synergy_bonus: synergy,
        sectors_crossed: new Set(sectors).size,
        candidate_surface: surface,
      });
    }
  }

  // ─── 3-6 node chains (Node 41 + Target + Partners) ───
  const crossSectorNodes = SUBSTRATE_NODES.filter(n => 
    n !== targetNode && (NODE_SECTOR[n] || 'unknown') !== targetSector
  );
  const sameSectorNodes = SUBSTRATE_NODES.filter(n =>
    n !== targetNode && (NODE_SECTOR[n] || 'unknown') === targetSector
  );

  for (let chainLen = 3; chainLen <= Math.min(8, permutationDepth + 2); chainLen++) {
    const chainCandidateCount = Math.min(3, chainLen);
    
    for (let ci = 0; ci < chainCandidateCount; ci++) {
      const partnerChain: string[] = [targetNode];
      const usedNodes = new Set([targetNode]);
      
      for (let p = 1; p < chainLen - 1; p++) {
        const partnerHash = hashString(`${surface.nodeName}:${targetNode}:chain${chainLen}:ci${ci}:p${p}:v4`);
        const pool = (partnerHash % 10 < 7) ? crossSectorNodes : sameSectorNodes;
        const available = pool.filter(n => !usedNodes.has(n));
        if (available.length === 0) break;
        const partner = available[partnerHash % available.length];
        partnerChain.push(partner);
        usedNodes.add(partner);
      }

      if (partnerChain.length < chainLen - 1) continue;

      // Node 41's sector is included in sector calculations
      const sectors = [candidateSector, ...partnerChain.map(n => NODE_SECTOR[n] || 'unknown')];
      const uniqueSectors = [...new Set(sectors)];
      const synergy = getSectorSynergy(sectors);
      
      const chainHash = hashString(`${surface.nodeName}:${partnerChain.join(':')}:v4`);
      const baseScore = 15 + (chainHash % 24);
      const depthBonus = (chainLen - 2) * 3;
      const diversityBonus = (uniqueSectors.length - 1) * 2;
      const variance = ((chainHash >> 8) % 13) - 6;
      
      let cjpi = baseScore + synergy + depthBonus + diversityBonus + traitBonus + variance;
      
      const maxForDepth = chainLen === 3 ? 78 : chainLen === 4 ? 86 : chainLen === 5 ? 92 : chainLen === 6 ? 96 : chainLen === 7 ? 98 : 99;
      cjpi = Math.max(30, Math.min(cjpi, maxForDepth));

      if (cjpi >= 35) {
        const fullChain = [surface.nodeName, ...partnerChain];
        const archetype = findArchetype(partnerChain);
        
        // FILTER: Only surface discoveries with real archetype names.
        // Generic chain names are noise — users want real emergent software, not labels.
        if (!archetype) continue;
        
        const capIdx = chainHash % targetCaps.length;
        const primaryCap = targetCaps[capIdx];
        
        const desc = archetype.desc 
          ? enrichWithNode41(archetype.desc, surface, partnerChain)
          : generateNode41AwareDescription(surface, partnerChain, primaryCap, cjpi);

        results.push({
          name: archetype.name,
          description: desc,
          cjpi_score: cjpi,
          tier: scoreTier(cjpi),
          chain: fullChain,
          capability_type: primaryCap,
          chain_depth: fullChain.length,
          synergy_bonus: synergy,
          sectors_crossed: uniqueSectors.length,
          candidate_surface: surface,
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
  
  // For single-node lookups (2-node chains), find any archetype containing this node
  if (substrateNodes.length === 1) {
    const node = substrateNodes[0];
    const matchingKeys = Object.keys(CHAIN_ARCHETYPES).filter(k => k.split('+').includes(node));
    if (matchingKeys.length > 0) {
      const selectedKey = matchingKeys[hashString(`${node}:single`) % matchingKeys.length];
      const candidates = CHAIN_ARCHETYPES[selectedKey];
      if (candidates && candidates.length > 0) {
        const arch = candidates[hashString(selectedKey) % candidates.length];
        return {
          name: arch.name,
          desc: arch.desc,
        };
      }
    }
    return null;
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
  
  // For 2-node pairs that don't have a direct archetype, check if either node
  // appears in any archetype and derive from it
  if (substrateNodes.length === 2) {
    for (const node of substrateNodes) {
      const matchingKeys = Object.keys(CHAIN_ARCHETYPES).filter(k => k.split('+').includes(node));
      if (matchingKeys.length > 0) {
        const selectedKey = matchingKeys[hashString(`${key}:derive`) % matchingKeys.length];
        const candidates = CHAIN_ARCHETYPES[selectedKey];
        if (candidates && candidates.length > 0) {
          const arch = candidates[hashString(selectedKey) % candidates.length];
          const otherNode = substrateNodes.find(n => n !== node) || substrateNodes[1];
          const otherLabel = NODE_CAPABILITY_LABELS[otherNode] || otherNode.toLowerCase();
          return {
            name: `${arch.name}_With_${otherNode}`,
            desc: `${arch.desc} Enhanced with ${otherLabel} (${otherNode}) for cross-domain reinforcement.`,
          };
        }
      }
    }
  }
  
  return null;
}

// generateChainName removed — only archetype-matched discoveries are surfaced now.
// Generic chain names (NODE_X_NODE_TIER_CHAIN3) were noise that diluted real discoveries.

/**
 * Generate descriptions where Node 41 is a PEER — described by its capabilities,
 * not just as "your code". Shows the chain as a collaboration between equals.
 */
function generateNode41AwareDescription(
  surface: CapabilitySurface, nodes: string[], primaryCap: string, cjpi: number
): string {
  const chainLen = nodes.length;
  
  // Build Node 41's capability label: "TRADE_ENGINE (execute_trade, assess_risk)"
  const node41Label = `${surface.nodeName} (${surface.capabilities.slice(0, 2).join(', ')})`;
  
  // Build substrate node labels with their capabilities
  const nodeLabels = nodes.slice(0, 3).map(n => {
    const caps = NODE_CAPABILITIES[n];
    const label = NODE_CAPABILITY_LABELS[n] || n.toLowerCase();
    return `${n} ${label}`;
  });
  
  // Reference specific user code components
  const userComps = surface.components.slice(0, 3);
  const hasComps = userComps.length > 0;
  
  let desc = '';
  
  // Open with the CHAIN as a collaboration — Node 41 is a peer
  desc += `${node41Label} `;
  if (hasComps) {
    desc += `— retaining your ${surface.domain} logic (${userComps.join(', ')}${surface.components.length > 3 ? '…' : ''}) — `;
  }
  
  // Describe the chain interaction
  if (chainLen === 1) {
    desc += `fused with ${nodeLabels[0]}. `;
  } else {
    desc += `chains through ${nodeLabels.join(' → ')}. `;
  }
  
  // Describe the emergent result based on tier
  if (cjpi >= 80) {
    desc += `This ${chainLen + 1}-node fusion creates a compound capability: your ${surface.capabilities[0] || 'core'} logic gains ${NODE_CAPABILITY_LABELS[nodes[0]] || 'substrate processing'}, `;
    desc += `producing emergent behavior neither system achieves alone. `;
    desc += `Your code's functional identity and stack compatibility are preserved — the substrate amplifies, not replaces.`;
  } else if (cjpi >= 65) {
    desc += `Your ${surface.nodeName}'s ${surface.capabilities[0] || 'primary'} capability is enhanced with ${NODE_CAPABILITY_LABELS[nodes[0]] || 'substrate logic'}. `;
    desc += `Drop-in compatible with your existing stack — substrate features are additive layers.`;
  } else {
    desc += `A lightweight enhancement splicing ${NODE_CAPABILITY_LABELS[nodes[0]] || primaryCap.replace(/_/g, ' ')} into your ${surface.domain} codebase. `;
    desc += `90%+ of your original code is preserved — substrate capabilities are woven in as augmentations.`;
  }
  
  return desc;
}

/**
 * Enrich archetype description with Node 41 context
 */
function enrichWithNode41(archetypeDesc: string, surface: CapabilitySurface, nodes: string[]): string {
  const userComps = surface.components.slice(0, 3);
  const capLabels = nodes.slice(0, 3).map(n => `${NODE_CAPABILITY_LABELS[n] || n.toLowerCase()} (${n})`);
  
  let prefix = '';
  if (userComps.length > 0) {
    prefix = `${surface.nodeName} (${surface.capabilities.slice(0, 2).join(', ')}) — built on your ${surface.domain} code (${userComps.join(', ')}), chains with ${capLabels.join(', ')}. `;
  } else {
    prefix = `${surface.nodeName} (${surface.capabilities.slice(0, 2).join(', ')}) gains ${capLabels.join(', ')}. `;
  }
  
  return prefix + archetypeDesc;
}

// ═══ MAIN HANDLER ═══

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  if (!checkRateLimit(clientIp, 60)) {
    return jsonResponse({ success: false, error: 'Rate limit exceeded. Try again in a minute.' }, 429);
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

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

        // Only persist the TOP 1 weighted result per collision run
        // All results are returned to the client for display, but we avoid DB bloat
        const surface = results[0]?.candidate_surface;
        if (results.length > 0) {
          const topResult = results[0]; // Already sorted by cjpi_score desc
          const fingerprint = await generateFingerprint(topResult.chain, 'SPARTA');
          const baseSlug = topResult.name.toLowerCase().replace(/_/g, '-').slice(0, 180);
          const slugHash = hashString(`${userId}:${baseSlug}:${topResult.chain.join(':')}:${topResult.cjpi_score}`).toString(36);
          await supabase.from('artifact_registry').upsert({
            user_id: userId,
            name: topResult.name,
            slug: `${baseSlug}-${slugHash}`,
            tier: topResult.tier,
            category: 'proprietary-discovery',
            description: topResult.description.slice(0, 500),
            metadata: {
              node_a: topResult.chain[0],
              node_b: target_node,
              cjpi_score: topResult.cjpi_score,
              capability_type: topResult.capability_type,
              chain: topResult.chain,
              chain_depth: topResult.chain_depth,
              synergy_bonus: topResult.synergy_bonus,
              sectors_crossed: topResult.sectors_crossed,
              fingerprint,
              discovered_at: new Date().toISOString(),
              crystallized: false,
              candidate_surface: surface ? {
                nodeName: surface.nodeName,
                capabilities: surface.capabilities,
                sector: surface.sector,
                domain: surface.domain,
              } : null,
            },
          }, { onConflict: 'user_id,slug' });
        }

        return jsonResponse({
          success: true,
          capabilities: results.map(r => ({ ...r, candidate_surface: undefined })),
          candidate_surface: surface ? {
            nodeName: surface.nodeName,
            capabilities: surface.capabilities,
            sector: surface.sector,
            description: surface.description,
            domain: surface.domain,
            components: surface.components.slice(0, 6),
          } : null,
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

        const surface = topResults[0]?.candidate_surface;
        for (const result of topResults) {
          const fingerprint = await generateFingerprint(result.chain, 'SPARTA');
          const baseSlug = result.name.toLowerCase().replace(/_/g, '-').slice(0, 180);
          const slugHash = hashString(`${userId}:${baseSlug}:${result.chain.join(':')}:${result.cjpi_score}`).toString(36);
          await supabase.from('artifact_registry').upsert({
            user_id: userId,
            name: result.name,
            slug: `${baseSlug}-${slugHash}`,
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
              candidate_surface: surface ? {
                nodeName: surface.nodeName,
                capabilities: surface.capabilities,
                sector: surface.sector,
                domain: surface.domain,
              } : null,
            },
          }, { onConflict: 'user_id,slug' });
        }

        return jsonResponse({
          success: true,
          total_collisions: SUBSTRATE_NODES.length,
          total_capabilities: allResults.length,
          top_capabilities: topResults.map(r => ({ ...r, candidate_surface: undefined })),
          candidate_surface: surface ? {
            nodeName: surface.nodeName,
            capabilities: surface.capabilities,
            sector: surface.sector,
            description: surface.description,
            domain: surface.domain,
          } : null,
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
        const min_cjpi = input.min_cjpi != null ? validatePositiveInt(input.min_cjpi, 99) : 1;

        const { data: discoveries } = await supabase
          .from('artifact_registry')
          .select('id, name, metadata, tier')
          .eq('user_id', userId)
          .eq('category', 'proprietary-discovery')
          .order('created_at', { ascending: false })
          .limit(500);

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

        // Validate: export language must match the candidate's ingested language
        const { data: candidateRow } = await supabase
          .from('artifact_registry')
          .select('metadata')
          .eq('user_id', userId)
          .eq('category', 'proprietary-evolution')
          .eq('tier', 'candidate')
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (candidateRow?.metadata) {
          const candMeta = candidateRow.metadata as Record<string, unknown>;
          const sourceExportKey = String(candMeta.source_export_language || '');
          if (sourceExportKey && sourceExportKey !== target_language) {
            return jsonResponse({ 
              success: false, 
              error: `Export language mismatch: you imported ${sourceExportKey}, cannot export as ${target_language}. Ascension exports must match your import language.` 
            }, 400);
          }
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
              candidate_surface: meta.candidate_surface || null,
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
