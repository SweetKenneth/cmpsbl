/**
 * pf-proprietary-evolution — Proprietary Evolution Lifecycle Engine
 * 
 * Handles:
 *   - discovery.collide: Bounce Candidate Auxiliary Node against substrate nodes (multi-chain 2-8 depth)
 *   - discovery.batch: Run full collision sweep across all 40 nodes with chain exploration
 *   - ascend.lock: Lock a discovered capability into deterministic memory
 *   - ascend.batch-lock: Batch ascend all eligible discoveries
 *   - export.capability-pack: Generate capability pack from ascended memories
 * 
 * Auxiliary Node Architecture:
 *   The user's code is scanned to derive a CAPABILITY SURFACE — a set of 4 capability
 *   verbs and a sector assignment — making it a first-class node in the collision engine.
 *   The Auxiliary Node participates in synergy scoring identically to the 40 substrate nodes.
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

// ═══ SUBSTRATE NODE MATRIX — Canonical 40 nodes from matrixNodeRegistry ═══
const SUBSTRATE_NODES = [
  'CORE','SYSTEM','BRAIN','MEMORY','DREAM',
  'RIPPLE','ACCESS','IDENTITY','RELAY','AUDIT','NERVE',
  'DECODE','ENCODE','VISION','CORTEX','NEXUS','ECONOMY','SANDBOX','INCLUSIVE','MEDIC','INTEGRATION',
  'SOVEREIGN','ORACLE','CONSCIENCE','TREATY',
  'COMPASS','ECHO','REFLEX',
  'FORGE','LINGUA','HARVEST',
  'EVOLUTION','SHADOW','PHANTOM',
  'IMMUNITY','INTENT',
  'GOVERNANCE','ATLAS','ENGINEER',
  'DEFENSE',
];

const VALID_NODES = new Set(SUBSTRATE_NODES);

// ═══ SECTOR MAPPING — Canonical 12-sector topology ═══
const NODE_SECTOR: Record<string, string> = {
  CORE: 'core', SYSTEM: 'system',
  BRAIN: 'ccr', MEMORY: 'ccr', DREAM: 'ccr',
  RIPPLE: 'ocg', ACCESS: 'ocg', IDENTITY: 'ocg', RELAY: 'ocg', AUDIT: 'ocg', NERVE: 'ocg',
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
};

// ═══ NODE CAPABILITY SIGNATURES — Canonical 40 nodes ═══
const NODE_CAPABILITIES: Record<string, string[]> = {
  CORE: ['boot', 'pulse', 'orchestrate', 'config'],
  SYSTEM: ['lifecycle', 'configure', 'diagnose', 'provision'],
  BRAIN: ['reasoning', 'inference', 'semantic_embed', 'context_window'],
  MEMORY: ['store', 'recall', 'semantic_search', 'consolidate'],
  DREAM: ['synthesize', 'heuristic_gen', 'compress', 'imagine'],
  RIPPLE: ['propagate', 'cascade_detect', 'event_bus', 'signal'],
  ACCESS: ['authenticate', 'authorize', 'entitle', 'api_key'],
  IDENTITY: ['resolve_user', 'session', 'role_map', 'entity'],
  RELAY: ['webhook', 'dispatch', 'retry', 'transform'],
  AUDIT: ['log_immutable', 'chain_custody', 'verify', 'anchor'],
  NERVE: ['signal', 'consensus', 'heartbeat', 'gate'],
  DECODE: ['parse', 'interpret', 'nlp_extract', 'intent_classify'],
  ENCODE: ['code_gen', 'transform', 'compile', 'optimize'],
  VISION: ['observe', 'telemetry', 'dashboard', 'render'],
  CORTEX: ['orchestrate', 'coordinate', 'priority_queue', 'workflow'],
  NEXUS: ['route_ai', 'failover', 'cost_track', 'provider_select'],
  ECONOMY: ['meter', 'bill', 'roi_calc', 'cost_track'],
  SANDBOX: ['isolate', 'execute', 'contain', 'teardown'],
  INCLUSIVE: ['wcag_check', 'accessibility', 'adapt', 'comply'],
  MEDIC: ['diagnose', 'repair', 'triage', 'health_check'],
  INTEGRATION: ['connect', 'dependency', 'resolve', 'bind'],
  SOVEREIGN: ['jurisdiction', 'data_residency', 'encrypt', 'audit_sovereign'],
  ORACLE: ['predict', 'forecast', 'bayesian_update', 'monte_carlo'],
  CONSCIENCE: ['bias_detect', 'ethics_score', 'fairness', 'transparency'],
  TREATY: ['negotiate', 'sla_enforce', 'contract', 'compliance'],
  COMPASS: ['navigate', 'locate', 'map', 'orient'],
  ECHO: ['replay', 'simulate', 'mirror', 'resonance'],
  REFLEX: ['react', 'edge_compute', 'preempt', 'cache_warm'],
  FORGE: ['template', 'scaffold', 'generate', 'instantiate'],
  LINGUA: ['translate', 'localize', 'detect_lang', 'glossary'],
  HARVEST: ['crawl', 'etl', 'deduplicate', 'enrich'],
  EVOLUTION: ['mutate', 'fitness_score', 'select', 'crossover'],
  SHADOW: ['diverge', 'shadow_mesh', 'verify', 'compare'],
  PHANTOM: ['anonymize', 'proxy', 'obfuscate', 'stealth_route'],
  IMMUNITY: ['resilience', 'adaptive_threshold', 'quarantine', 'recover'],
  INTENT: ['discover', 'route', 'resolve', 'dag_plan'],
  GOVERNANCE: ['policy', 'approve', 'audit_govern', 'escalate'],
  ATLAS: ['registry', 'control', 'capability_map', 'govern'],
  ENGINEER: ['maintain', 'optimize', 'upgrade', 'benchmark'],
  DEFENSE: ['threat_score', 'anomaly_detect', 'rate_limit', 'quarantine'],
};

const VALID_MODULES = new Set(['discovery', 'ascend', 'export']);
const VALID_ACTIONS: Record<string, Set<string>> = {
  discovery: new Set(['collide', 'batch']),
  ascend: new Set(['lock', 'batch-lock']),
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
  // ═══ Extended archetype coverage for remaining 21 nodes ═══
  'BRAIN+CORE': [
    { name: 'Cognitive_Bootstrap_Engine', desc: 'Wires reasoning directly into the system boot sequence — every startup cycle produces smarter initialization, turning cold starts into warm cognition.' },
  ],
  'BRAIN+SYSTEM': [
    { name: 'Intelligent_Lifecycle_Manager', desc: 'Applies multi-step reasoning to system provisioning and teardown — diagnoses configuration drift and self-corrects before failures cascade.' },
  ],
  'BRAIN+DREAM': [
    { name: 'Lucid_Reasoning_Synthesizer', desc: 'Combines deductive logic with generative heuristic synthesis — reasons about what exists, then imagines what could exist, producing novel solutions from structured thought.' },
  ],
  'BRAIN+RIPPLE': [
    { name: 'Cascading_Inference_Network', desc: 'Propagates reasoning conclusions through event chains — one insight triggers downstream inferences automatically, creating compounding intelligence waves.' },
  ],
  'BRAIN+ACCESS': [
    { name: 'Entitlement_Reasoning_Engine', desc: 'Applies contextual reasoning to access control decisions — goes beyond static roles to infer intent-aware permissions that adapt to behavioral patterns.' },
  ],
  'BRAIN+IDENTITY': [
    { name: 'Entity_Resolution_Intelligence', desc: 'Uses semantic reasoning to resolve ambiguous identities across systems — disambiguates users, sessions, and entities with probabilistic confidence scoring.' },
  ],
  'BRAIN+RELAY': [
    { name: 'Intelligent_Dispatch_Router', desc: 'Reasons about webhook payloads to determine optimal retry strategies and transformation paths — replaces blind dispatch with cognitive routing.' },
  ],
  'BRAIN+AUDIT': [
    { name: 'Forensic_Reasoning_Ledger', desc: 'Applies causal inference to immutable audit trails — reconstructs decision chains, identifies anomalous patterns, and generates compliance narratives from raw logs.' },
  ],
  'BRAIN+NERVE': [
    { name: 'Cognitive_Signal_Consensus', desc: 'Reasons about conflicting system signals to achieve intelligent consensus — resolves ambiguous heartbeats and gate conditions through weighted inference.' },
  ],
  'BRAIN+VISION': [
    { name: 'Observability_Intelligence_Layer', desc: 'Applies reasoning to telemetry streams to surface insights humans miss — transforms raw dashboards into narrative-driven system understanding.' },
  ],
  'BRAIN+NEXUS': [
    { name: 'Adaptive_AI_Router', desc: 'Reasons about model capabilities, cost profiles, and task complexity to dynamically select the optimal AI provider — intelligent routing that learns from every call.' },
  ],
  'BRAIN+ECONOMY': [
    { name: 'Cost_Aware_Cognition', desc: 'Applies reasoning to metering and billing data to optimize resource allocation — thinks about economic impact before committing compute, maximizing ROI per inference.' },
  ],
  'BRAIN+SANDBOX': [
    { name: 'Reasoned_Isolation_Engine', desc: 'Uses cognitive analysis to determine isolation boundaries — dynamically provisions sandboxes with just-right permissions based on inferred code behavior.' },
  ],
  'BRAIN+INCLUSIVE': [
    { name: 'Accessibility_Reasoning_Advisor', desc: 'Applies semantic understanding to UI structures, identifying accessibility barriers that automated WCAG checks miss — human-like reasoning about usability.' },
  ],
  'BRAIN+MEDIC': [
    { name: 'Diagnostic_Reasoning_Core', desc: 'Combines medical-style differential diagnosis with system health data — reasons through symptom trees to identify root causes, not just surface failures.' },
  ],
  'BRAIN+INTEGRATION': [
    { name: 'Dependency_Intelligence_Resolver', desc: 'Reasons about dependency graphs and version compatibility to predict integration failures before they occur — proactive dependency management.' },
  ],
  'BRAIN+SOVEREIGN': [
    { name: 'Sovereign_Data_Reasoner', desc: 'Applies jurisdictional reasoning to data flows — infers residency requirements, encryption needs, and sovereignty constraints from regulatory context.' },
  ],
  'BRAIN+INTENT': [
    { name: 'Intent_Comprehension_Engine', desc: 'Goes beyond action routing to understand the WHY behind requests — decomposes ambiguous intents into structured execution plans with confidence scoring.' },
  ],
  'BRAIN+GOVERNANCE': [
    { name: 'Policy_Reasoning_Enforcer', desc: 'Applies logical reasoning to governance policies — evaluates edge cases, resolves policy conflicts, and generates audit-ready justifications for every decision.' },
  ],
  'BRAIN+ATLAS': [
    { name: 'Capability_Intelligence_Map', desc: 'Reasons about the full capability surface to identify gaps, redundancies, and optimization paths — turns the registry into a strategic intelligence asset.' },
  ],
  'BRAIN+ENGINEER': [
    { name: 'Performance_Reasoning_Optimizer', desc: 'Applies causal reasoning to performance benchmarks — identifies optimization opportunities that profilers miss by understanding systemic bottleneck chains.' },
  ],
  'ORACLE+CORE': [
    { name: 'Predictive_Boot_Sequencer', desc: 'Forecasts system load patterns to pre-configure boot parameters — every startup is optimized based on predicted usage before the first request arrives.' },
  ],
  'ORACLE+SYSTEM': [
    { name: 'Lifecycle_Forecaster', desc: 'Predicts system degradation curves and maintenance windows — shifts lifecycle management from reactive scheduling to predictive optimization.' },
  ],
  'ORACLE+DREAM': [
    { name: 'Generative_Forecast_Engine', desc: 'Combines Bayesian prediction with synthetic scenario generation — imagines futures that historical data alone cannot predict, then scores their likelihood.' },
  ],
  'ORACLE+VISION': [
    { name: 'Predictive_Telemetry_Lens', desc: 'Forecasts system behavior from observability data — predicts failures, capacity exhaustion, and performance degradation before dashboards show red.' },
  ],
  'ORACLE+NEXUS': [
    { name: 'AI_Cost_Forecaster', desc: 'Predicts AI provider costs and latency across providers — routes requests to minimize spend while maintaining quality targets through forecast-driven selection.' },
  ],
  'ORACLE+ECONOMY': [
    { name: 'Revenue_Prediction_Engine', desc: 'Forecasts billing cycles, usage patterns, and revenue trajectories — turns metering data into financial intelligence with confidence intervals.' },
  ],
  'ORACLE+MEDIC': [
    { name: 'Predictive_Health_Monitor', desc: 'Forecasts system health degradation before symptoms appear — combines diagnostic baselines with trend analysis for preemptive self-healing.' },
  ],
  'ORACLE+INTENT': [
    { name: 'Intent_Prediction_Planner', desc: 'Predicts likely next actions from historical intent patterns — pre-computes execution plans for anticipated requests, reducing latency to near-zero.' },
  ],
  'ORACLE+GOVERNANCE': [
    { name: 'Compliance_Forecaster', desc: 'Predicts regulatory compliance risks before violations occur — models policy drift and generates early warnings with actionable remediation paths.' },
  ],
  'ORACLE+ATLAS': [
    { name: 'Capability_Growth_Predictor', desc: 'Forecasts which capabilities will be needed based on usage trends — enables proactive capability development guided by predicted demand.' },
  ],
  'ORACLE+ENGINEER': [
    { name: 'Performance_Degradation_Oracle', desc: 'Predicts performance regression from code and configuration changes — identifies optimization opportunities before they become critical bottlenecks.' },
  ],
  'DEFENSE+CORE': [
    { name: 'Hardened_Boot_Shield', desc: 'Wraps the system boot sequence with threat detection — validates every initialization step against known attack vectors before granting system control.' },
  ],
  'DEFENSE+SYSTEM': [
    { name: 'System_Perimeter_Guard', desc: 'Applies continuous threat scoring to lifecycle operations — prevents privilege escalation during provisioning and detects anomalous configuration changes.' },
  ],
  'DEFENSE+AUDIT': [
    { name: 'Tamper_Evident_Ledger', desc: 'Chains threat detection with immutable audit logging — every security event is cryptographically anchored, creating an unforgeable forensic record.' },
  ],
  'DEFENSE+SOVEREIGN': [
    { name: 'Sovereign_Security_Mesh', desc: 'Enforces jurisdiction-aware security policies — threat models adapt to data residency requirements and cross-border compliance constraints.' },
  ],
  'DEFENSE+GOVERNANCE': [
    { name: 'Governed_Threat_Response', desc: 'Routes security incidents through governance approval workflows — automated defense actions respect policy boundaries and generate compliance records.' },
  ],
  'CORTEX+ORACLE': [
    { name: 'Predictive_Workflow_Engine', desc: 'Orchestrates multi-step workflows guided by predictive modeling — re-prioritizes task queues based on forecasted outcomes, not just static rules.' },
  ],
  'CORTEX+MEMORY': [
    { name: 'Context_Aware_Orchestrator', desc: 'Orchestrates workflows with full historical context — recalls past execution patterns to optimize current task scheduling and resource allocation.' },
  ],
  'CORTEX+DEFENSE': [
    { name: 'Secure_Workflow_Orchestrator', desc: 'Wraps every orchestrated step with threat validation — ensures multi-step workflows cannot be hijacked or manipulated through intermediate state corruption.' },
  ],
  'CORTEX+EVOLUTION': [
    { name: 'Self_Optimizing_Orchestrator', desc: 'Applies evolutionary fitness scoring to workflow configurations — orchestration strategies mutate, compete, and the most efficient patterns survive.' },
  ],
};

function chainKey(nodes: string[]): string {
  return [...nodes].sort().join('+');
}

// ═══════════════════════════════════════════════════════════════════════
// CAPABILITY SURFACE EXTRACTION — The heart of the Auxiliary Node
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

// ═══ ARCHETYPE CLASSIFICATION — Active / Passive / Hybrid ═══
type SoftwareArchetype = 'active' | 'passive' | 'hybrid';

interface ArchetypeProfile {
  archetype: SoftwareArchetype;
  confidence: number;
  signals: string[];
}

/**
 * Classify uploaded code into an archetype for affinity filtering.
 * Active = agents, bots, daemons, workers (long-running, event-driven)
 * Passive = UIs, static sites, libraries (render-focused, no runtime loop)
 * Hybrid = APIs, services, CLI tools (request/response, mixed concerns)
 */
function classifyArchetype(content: string, domain: string, language: string): ArchetypeProfile {
  const lower = content.toLowerCase();
  const signals: string[] = [];
  let activeScore = 0;
  let passiveScore = 0;

  // Active signals: long-running processes, event loops, state machines
  const activePatterns: [string, number][] = [
    ['setinterval', 3], ['settimeout', 2], ['event_loop', 4], ['while true', 4],
    ['cron', 3], ['schedule', 3], ['worker', 3], ['daemon', 4], ['agent', 3],
    ['queue', 2], ['consume', 2], ['subscribe', 3], ['websocket', 3],
    ['mqtt', 3], ['polling', 3], ['spawn', 2], ['async fn main', 3],
    ['tokio::spawn', 4], ['go func', 3], ['goroutine', 3],
    ['state_machine', 3], ['fsm', 2], ['transition', 2],
  ];
  for (const [pat, weight] of activePatterns) {
    if (lower.includes(pat)) { activeScore += weight; signals.push(`active:${pat}`); }
  }

  // Passive signals: rendering, UI frameworks, static content
  const passivePatterns: [string, number][] = [
    ['react', 3], ['component', 2], ['render', 3], ['<div', 3], ['<html', 4],
    ['css', 2], ['stylesheet', 3], ['dom', 2], ['usestate', 3], ['useeffect', 2],
    ['vue', 3], ['svelte', 3], ['template', 2], ['static', 2],
    ['export default', 1], ['display:', 2], ['font-size', 2],
  ];
  for (const [pat, weight] of passivePatterns) {
    if (lower.includes(pat)) { passiveScore += weight; signals.push(`passive:${pat}`); }
  }

  // Domain-level hints
  if (['web', 'game'].includes(domain)) passiveScore += 4;
  if (['automation', 'iot', 'ml'].includes(domain)) activeScore += 4;
  if (['api', 'data', 'security'].includes(domain)) { activeScore += 2; passiveScore += 2; }

  // Language hints
  const langLower = language.toLowerCase();
  if (['verilog', 'vhdl', 'systemverilog', 'chisel', 'spice'].some(l => langLower.includes(l))) {
    activeScore += 5; // HDL is inherently active (always-running circuits)
  }

  const total = activeScore + passiveScore;
  if (total === 0) return { archetype: 'hybrid', confidence: 0.5, signals };

  const activeRatio = activeScore / total;
  if (activeRatio > 0.65) return { archetype: 'active', confidence: activeRatio, signals };
  if (activeRatio < 0.35) return { archetype: 'passive', confidence: 1 - activeRatio, signals };
  return { archetype: 'hybrid', confidence: 0.5 + Math.abs(activeRatio - 0.5), signals };
}

// ═══ NODE AFFINITY — Hard-filter incompatible nodes, soft-weight borderline ═══

// Nodes that are INCOMPATIBLE with passive code (UI/static — no runtime loop)
const ACTIVE_ONLY_NODES = new Set(['DREAM', 'NEXUS', 'CORTEX', 'HARVEST', 'EVOLUTION', 'SANDBOX', 'PHANTOM', 'ECHO', 'REFLEX']);

// Nodes that are INCOMPATIBLE with active code (agents/daemons — no UI)
const PASSIVE_ONLY_NODES = new Set(['VISION', 'INCLUSIVE']);

// Nodes that get a synergy BOOST for specific archetypes
const ARCHETYPE_BOOST: Record<SoftwareArchetype, Record<string, number>> = {
  active: {
    DREAM: 3, CORTEX: 3, NEXUS: 2, HARVEST: 2, EVOLUTION: 3,
    REFLEX: 2, ECHO: 2, PHANTOM: 2, SANDBOX: 2, NERVE: 2,
  },
  passive: {
    VISION: 3, INCLUSIVE: 3, IDENTITY: 2, RELAY: 2, FORGE: 2,
    COMPASS: 2, LINGUA: 2, ACCESS: 2,
  },
  hybrid: {
    DEFENSE: 2, MEMORY: 2, BRAIN: 2, ORACLE: 2, AUDIT: 2,
    GOVERNANCE: 2, INTEGRATION: 2, INTENT: 2,
  },
};

/**
 * Filter substrate nodes based on archetype. Returns filtered list for batch collisions.
 * Hard filter: skip obviously incompatible nodes.
 * The remaining nodes get soft-weighted via ARCHETYPE_BOOST in scoring.
 */
function filterNodesByArchetype(archetype: SoftwareArchetype): string[] {
  if (archetype === 'hybrid') return SUBSTRATE_NODES; // Hybrid gets everything

  const excludeSet = archetype === 'active' ? PASSIVE_ONLY_NODES : ACTIVE_ONLY_NODES;
  return SUBSTRATE_NODES.filter(n => !excludeSet.has(n));
}

function getArchetypeBoost(archetype: SoftwareArchetype, node: string): number {
  return ARCHETYPE_BOOST[archetype]?.[node] || 0;
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

// ═══ NODE CAPABILITY LABELS — Canonical 40 nodes (human-readable) ═══
const NODE_CAPABILITY_LABELS: Record<string, string> = {
  CORE: 'system orchestration', SYSTEM: 'lifecycle management', BRAIN: 'autonomous reasoning',
  MEMORY: 'persistent recall', DREAM: 'synthesis imagination',
  RIPPLE: 'event propagation', ACCESS: 'entitlement control', IDENTITY: 'entity resolution',
  RELAY: 'webhook dispatch', AUDIT: 'integrity ledger', NERVE: 'signal consensus',
  DECODE: 'intent parsing', ENCODE: 'code generation', VISION: 'observability rendering',
  CORTEX: 'workflow orchestration', NEXUS: 'AI routing failover', ECONOMY: 'cost metering',
  SANDBOX: 'isolated execution', INCLUSIVE: 'accessibility compliance', MEDIC: 'diagnostic repair',
  INTEGRATION: 'dependency resolution',
  SOVEREIGN: 'data sovereignty', ORACLE: 'predictive forecasting', CONSCIENCE: 'bias detection',
  TREATY: 'compliance negotiation',
  COMPASS: 'navigation mapping', ECHO: 'temporal replay', REFLEX: 'edge reaction',
  FORGE: 'artifact scaffolding', LINGUA: 'language translation', HARVEST: 'data acquisition',
  EVOLUTION: 'adaptive optimization', SHADOW: 'divergence testing', PHANTOM: 'stealth anonymization',
  IMMUNITY: 'resilience hardening', INTENT: 'action planning',
  GOVERNANCE: 'policy enforcement', ATLAS: 'capability governance', ENGINEER: 'performance optimization',
  DEFENSE: 'threat detection',
};

// ═══ MULTI-NODE COLLISION ENGINE (Auxiliary Node = First-Class Participant) ═══

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
 * Multi-node chain collisions where the Auxiliary Node is a REAL participant.
 * 
 * Key change: The candidate's sector and capabilities contribute to synergy
 * scoring just like any substrate node. the Auxiliary Node is no longer a label.
 */
function collideNodesMultiChain(
  candidateName: string,
  candidateMeta: Record<string, unknown>,
  targetNode: string,
  permutationDepth: number,
  softwareArchetype?: SoftwareArchetype,
): CollisionResult[] {
  // ═══ DERIVE NODE 41's CAPABILITY SURFACE ═══
  const surface = deriveCapabilitySurface(candidateName, candidateMeta);
  
  // Register the Auxiliary Node into the local lookup tables for this collision
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

  // ─── 2-node chains (Auxiliary Node + Target) ───
  // Now the Auxiliary Node's sector participates in synergy!
  const targetCaps = NODE_CAPABILITIES[targetNode] || ['generic'];
  const candidateSector = surface.sector;
  const targetSector = NODE_SECTOR[targetNode] || 'unknown';
  
  for (const cap of targetCaps) {
    const nameHash = hashString(`${surface.nodeName}:${targetNode}:${cap}:v4`);
    const baseCjpi = 20 + (nameHash % 29); // 20-48 range
    
    // NEW: the Auxiliary Node's sector creates real synergy with the target
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

  // ─── 3-6 node chains (Auxiliary Node + Target + Partners) ───
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

      // the Auxiliary Node's sector is included in sector calculations
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
 * Generate descriptions where the Auxiliary Node is a PEER — described by its capabilities,
 * not just as "your code". Shows the chain as a collaboration between equals.
 */
function generateNode41AwareDescription(
  surface: CapabilitySurface, nodes: string[], primaryCap: string, cjpi: number
): string {
  const chainLen = nodes.length;
  
  // Build the Auxiliary Node's capability label: "TRADE_ENGINE (execute_trade, assess_risk)"
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
  
  // Open with the CHAIN as a collaboration — the Auxiliary Node is a peer
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
 * Enrich archetype description with Auxiliary Node context
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
              ascended: false,
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
              ascended: false,
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

    // ═══ ASCEND MODULE ═══
    if (module === 'ascend') {
      
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
        if (meta.ascended === true) {
          return jsonResponse({ success: false, error: 'Already ascended' }, 409);
        }

        const chain = (meta.chain as string[]) || [];
        const fingerprint = await generateFingerprint(chain, 'SPARTA');
        const moatSignature = crypto.randomUUID();

        const { error } = await supabase
          .from('artifact_registry')
          .update({
            category: 'proprietary-ascended',
            metadata: {
              ...meta,
              ascended: true,
              ascended_at: new Date().toISOString(),
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
          ascended: {
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
          return Number(meta.cjpi_score || 0) >= min_cjpi && !meta.ascended;
        });

        let ascended = 0;
        for (const d of eligible) {
          const meta = (d.metadata as Record<string, unknown>) || {};
          const chain = (meta.chain as string[]) || [];
          const fingerprint = await generateFingerprint(chain, 'SPARTA');

          const { error } = await supabase.from('artifact_registry').update({
            category: 'proprietary-ascended',
            metadata: {
              ...meta,
              ascended: true,
              ascended_at: new Date().toISOString(),
              moat_signature: crypto.randomUUID(),
              structural_fingerprint: fingerprint,
              lock_version: 1,
            },
          }).eq('id', d.id).eq('user_id', userId);

          if (!error) ascended++;
        }

        return jsonResponse({
          success: true,
          ascended_count: ascended,
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
          .eq('category', 'proprietary-ascended');

        if (!capabilities || capabilities.length === 0) {
          return jsonResponse({ success: false, error: 'No ascended capabilities found for provided IDs' }, 404);
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
