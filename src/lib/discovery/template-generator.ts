/**
 * Template Generator — Autonomous Synthesis Template Creation
 * 
 * Randomly generates valid SynthesisTemplates from the combinatorial
 * module × category × capability space. Tracks retired combinations
 * to avoid re-testing exhausted configurations.
 */

import type { CJPIScoreBreakdown, DiscoveryCategory } from '@/lib/capabilities/synergies/discovery-epoch';

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export interface GeneratedTemplate {
  namePattern: string;
  descriptionPattern: string;
  category: DiscoveryCategory;
  modulePattern: string[];
  entryPattern: string;
  exitPattern: string;
  errorStrategy: 'retry' | 'skip' | 'abort' | 'rollback' | 'fallback';
  maxExecutionMs: number;
  baseBreakdown: CJPIScoreBreakdown;
  discoveredBy: string;
  rationale: string;
}

export interface GeneratorConfig {
  batchSize: number;         // how many templates per batch
  minModules: number;        // minimum modules in chain (2-5)
  maxModules: number;        // maximum modules in chain (2-5)
  minCjpiTarget: number;     // minimum CJPI to target (e.g. 80)
  biasHighValue: boolean;    // bias toward higher scoring combos
}

export interface RetiredCombo {
  hash: string;
  moduleChain: string[];
  category: string;
  retiredAt: number;
  totalRuns: number;
  totalDiscoveries: number;
}

// ═══════════════════════════════════════════════════════════════════════════════
// BUILDING BLOCKS
// ═══════════════════════════════════════════════════════════════════════════════

const MODULES = [
  // 38-node architecture (CORE, SYSTEM, CCR, OCG, Execution, ESZ, EPZ, EMZ, CSZ, Fields, Plane, Shell)
  'BRAIN', 'MEMORY', 'CORTEX', 'DREAM', 'NEXUS', 'DECODE',
  'DEFENSE', 'ACCESS', 'VISION', 'ANALYTICS', 'GOVERNANCE',
  'SYSTEM', 'EVOLUTION', 'INTEGRATION', 'NERVE', 'INCLUSIVE',
  'MODERNIZER', 'MEDIC', 'RIPPLE', 'AUDIT', 'IDENTITY',
  // Expansion zones: ESZ, EPZ, EMZ
  'SOVEREIGN', 'ORACLE', 'CONSCIENCE', 'PHANTOM', 'FORGE',
  'LINGUA', 'COMPASS', 'ECHO', 'TREATY', 'HARVEST', 'REFLEX',
];

const CATEGORIES: DiscoveryCategory[] = [
  'cognitive', 'evolution', 'security', 'routing', 'learning',
  'orchestration', 'integration', 'observability', 'governance',
  'compliance', 'prediction', 'ethics', 'privacy', 'synthesis',
  'localization', 'geospatial', 'simulation', 'contracts', 'acquisition', 'edge',
];

const ERROR_STRATEGIES = ['retry', 'skip', 'abort', 'rollback', 'fallback'] as const;

// Module affinity map — which modules naturally pair for each category
const CATEGORY_AFFINITY: Record<string, string[]> = {
  cognitive: ['BRAIN', 'CORTEX', 'MEMORY', 'DREAM', 'DECODE', 'ORACLE'],
  evolution: ['EVOLUTION', 'CORTEX', 'BRAIN', 'VISION', 'DREAM', 'ANALYTICS', 'FORGE'],
  security: ['DEFENSE', 'ACCESS', 'GOVERNANCE', 'AUDIT', 'SYSTEM', 'IDENTITY', 'PHANTOM'],
  routing: ['NEXUS', 'CORTEX', 'ANALYTICS', 'SYSTEM', 'GOVERNANCE', 'REFLEX'],
  learning: ['BRAIN', 'DREAM', 'CORTEX', 'MEMORY', 'EVOLUTION', 'ANALYTICS', 'ECHO'],
  orchestration: ['CORTEX', 'SYSTEM', 'ANALYTICS', 'NEXUS', 'VISION', 'NERVE', 'REFLEX'],
  integration: ['INTEGRATION', 'DECODE', 'NEXUS', 'BRAIN', 'VISION', 'LINGUA', 'TREATY'],
  observability: ['VISION', 'ANALYTICS', 'CORTEX', 'BRAIN', 'NERVE', 'ECHO'],
  governance: ['GOVERNANCE', 'BRAIN', 'DEFENSE', 'CORTEX', 'AUDIT', 'ACCESS', 'SOVEREIGN', 'CONSCIENCE'],
  compliance: ['SOVEREIGN', 'GOVERNANCE', 'AUDIT', 'DEFENSE', 'ACCESS', 'CONSCIENCE'],
  prediction: ['ORACLE', 'BRAIN', 'ANALYTICS', 'CORTEX', 'VISION', 'DREAM'],
  ethics: ['CONSCIENCE', 'GOVERNANCE', 'BRAIN', 'CORTEX', 'SOVEREIGN', 'AUDIT'],
  privacy: ['PHANTOM', 'DEFENSE', 'ACCESS', 'IDENTITY', 'SOVEREIGN', 'GOVERNANCE'],
  synthesis: ['FORGE', 'BRAIN', 'DREAM', 'CORTEX', 'EVOLUTION', 'INTEGRATION'],
  localization: ['LINGUA', 'DECODE', 'BRAIN', 'INTEGRATION', 'COMPASS'],
  geospatial: ['COMPASS', 'ANALYTICS', 'VISION', 'ORACLE', 'HARVEST'],
  simulation: ['ECHO', 'BRAIN', 'CORTEX', 'ORACLE', 'ANALYTICS', 'VISION'],
  contracts: ['TREATY', 'GOVERNANCE', 'SOVEREIGN', 'ACCESS', 'AUDIT'],
  acquisition: ['HARVEST', 'INTEGRATION', 'DECODE', 'ANALYTICS', 'VISION', 'COMPASS'],
  edge: ['REFLEX', 'NEXUS', 'SYSTEM', 'NERVE', 'CORTEX', 'ANALYTICS'],
};

// Pipeline name vocabulary
const ADJECTIVES = [
  'Adaptive', 'Autonomous', 'Recursive', 'Dynamic', 'Predictive',
  'Emergent', 'Distributed', 'Reactive', 'Proactive', 'Intelligent',
  'Self-Healing', 'Multi-Modal', 'Cross-Domain', 'Real-Time', 'Adversarial',
  'Elastic', 'Federated', 'Hierarchical', 'Zero-Shot', 'Meta-Cognitive',
  'Probabilistic', 'Streaming', 'Compositional', 'Context-Aware', 'Latent',
  'Temporal', 'Semantic', 'Structural', 'Causal', 'Spectral',
  'Hybrid', 'Neural', 'Symbolic', 'Bayesian', 'Heuristic',
];

const NOUNS: Record<string, string[]> = {
  cognitive: ['Reasoner', 'Synthesizer', 'Evaluator', 'Analyzer', 'Planner', 'Navigator', 'Interpreter', 'Predictor', 'Abstractor', 'Compressor'],
  evolution: ['Mutator', 'Selector', 'Recombinator', 'Optimizer', 'Calibrator', 'Accelerator', 'Navigator', 'Simulator', 'Archiver', 'Validator'],
  security: ['Shield', 'Sentinel', 'Guardian', 'Firewall', 'Auditor', 'Detector', 'Enforcer', 'Isolator', 'Scanner', 'Verifier'],
  routing: ['Router', 'Balancer', 'Dispatcher', 'Scheduler', 'Allocator', 'Classifier', 'Enforcer', 'Optimizer', 'Selector', 'Arbitrator'],
  learning: ['Learner', 'Crystallizer', 'Decomposer', 'Consolidator', 'Trainer', 'Distiller', 'Extractor', 'Amplifier', 'Tuner', 'Corrector'],
  orchestration: ['Orchestrator', 'Coordinator', 'Scheduler', 'Manager', 'Scaler', 'Resolver', 'Checkpointer', 'Controller', 'Sequencer', 'Harmonizer'],
  integration: ['Adapter', 'Translator', 'Normalizer', 'Bridge', 'Connector', 'Mapper', 'Transformer', 'Synchronizer', 'Mediator', 'Gateway'],
  observability: ['Monitor', 'Tracer', 'Profiler', 'Collector', 'Detector', 'Explainer', 'Dashboarder', 'Alerter', 'Correlator', 'Visualizer'],
  governance: ['Guardian', 'Enforcer', 'Auditor', 'Calibrator', 'Arbiter', 'Regulator', 'Validator', 'Tracker', 'Policy-Engine', 'Assessor'],
  compliance: ['Certifier', 'Regulator', 'Classifier', 'Enforcer', 'Inspector', 'Auditor', 'Validator', 'Reporter', 'Attestor', 'Checker'],
  prediction: ['Forecaster', 'Predictor', 'Estimator', 'Projector', 'Anticipator', 'Modeler', 'Simulator', 'Oracle', 'Diviner', 'Prophet'],
  ethics: ['Adjudicator', 'Evaluator', 'Arbiter', 'Guardian', 'Assessor', 'Reviewer', 'Counsel', 'Overseer', 'Conscience', 'Advisor'],
  privacy: ['Anonymizer', 'Redactor', 'Obfuscator', 'Shielder', 'Vault', 'Cloaker', 'Mask', 'Sanitizer', 'Encryptor', 'Guardian'],
  synthesis: ['Forger', 'Assembler', 'Composer', 'Generator', 'Constructor', 'Builder', 'Weaver', 'Fabricator', 'Crafter', 'Synthesist'],
  localization: ['Translator', 'Adapter', 'Localizer', 'Mapper', 'Converter', 'Interpreter', 'Bridge', 'Normalizer', 'Harmonizer', 'Transformer'],
  geospatial: ['Navigator', 'Mapper', 'Plotter', 'Tracker', 'Surveyor', 'Locator', 'Coordinator', 'Router', 'Cartographer', 'Atlas'],
  simulation: ['Simulator', 'Emulator', 'Modeler', 'Twin', 'Replicator', 'Projector', 'Sandbox', 'Mirror', 'Clone', 'Testbed'],
  contracts: ['Negotiator', 'Broker', 'Arbiter', 'Enforcer', 'Notary', 'Mediator', 'Ratifier', 'Witness', 'Executor', 'Steward'],
  acquisition: ['Harvester', 'Collector', 'Ingester', 'Scraper', 'Gatherer', 'Aggregator', 'Feeder', 'Extractor', 'Miner', 'Scout'],
  edge: ['Dispatcher', 'Actuator', 'Responder', 'Executor', 'Trigger', 'Relay', 'Accelerator', 'Processor', 'Handler', 'Reactor'],
};

const CAPABILITY_VERBS = [
  'analyze', 'synthesize', 'detect', 'classify', 'transform', 'validate',
  'optimize', 'route', 'monitor', 'enforce', 'resolve', 'predict',
  'correlate', 'aggregate', 'decompose', 'compress', 'expand', 'evaluate',
  'prioritize', 'schedule', 'checkpoint', 'rollback', 'audit', 'trace',
  'profile', 'alert', 'notify', 'archive', 'restore', 'simulate',
];

const RATIONALE_PATTERNS = [
  'Addresses a critical gap in {category} by combining {modules} for unprecedented cross-module synergy',
  'Novel {category} pipeline that leverages {modules} to create emergent capabilities beyond individual modules',
  'Fills unexplored topology between {modules} — high composability potential for downstream pipelines',
  'Strategic combination of {modules} enables {category} operations that no single module can achieve alone',
  'Cross-cutting {category} capability using {modules} creates defensive depth through module diversity',
  'Unique {modules} synthesis enables proactive {category} that prevents issues before they manifest',
  'Combines {modules} in a previously untested topology — potential for S-Tier discovery',
  'Bridges {modules} for {category} workflows, enabling zero-latency handoffs between module boundaries',
];

// ═══════════════════════════════════════════════════════════════════════════════
// RANDOM HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function pickN<T>(arr: T[], n: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
}

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randScore(min: number, max: number): number {
  // Bell-curve bias toward middle-high values
  const r1 = Math.random();
  const r2 = Math.random();
  const avg = (r1 + r2) / 2; // central tendency
  return Math.round(min + avg * (max - min));
}

function comboHash(modules: string[], category: string): string {
  return `${modules.sort().join('+')}|${category}`;
}

function toKebab(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

// ═══════════════════════════════════════════════════════════════════════════════
// GENERATOR ENGINE
// ═══════════════════════════════════════════════════════════════════════════════

const retiredCombos = new Map<string, RetiredCombo>();

export function getRetiredCombos(): RetiredCombo[] {
  return Array.from(retiredCombos.values());
}

export function retireCombo(modules: string[], category: string, totalRuns: number, totalDiscoveries: number): void {
  const hash = comboHash(modules, category);
  retiredCombos.set(hash, {
    hash,
    moduleChain: modules,
    category,
    retiredAt: Date.now(),
    totalRuns,
    totalDiscoveries,
  });
}

export function isComboRetired(modules: string[], category: string): boolean {
  return retiredCombos.has(comboHash(modules, category));
}

export function getRetiredCount(): number {
  return retiredCombos.size;
}

export function clearRetired(): void {
  retiredCombos.clear();
}

/** Generate a single random template */
function generateOneTemplate(category: DiscoveryCategory, moduleCount: number, biasHigh: boolean): GeneratedTemplate {
  // Pick modules — bias toward category-affine modules
  const affine = CATEGORY_AFFINITY[category] || MODULES;
  const nonAffine = MODULES.filter(m => !affine.includes(m));

  // 70% chance each module comes from affine pool
  const selectedModules: string[] = [];
  const usedModules = new Set<string>();

  while (selectedModules.length < moduleCount) {
    const pool = Math.random() < 0.7 ? affine : nonAffine;
    const candidates = pool.filter(m => !usedModules.has(m));
    if (candidates.length === 0) {
      const fallback = MODULES.filter(m => !usedModules.has(m));
      if (fallback.length === 0) break;
      const m = pick(fallback);
      usedModules.add(m);
      selectedModules.push(m);
    } else {
      const m = pick(candidates);
      usedModules.add(m);
      selectedModules.push(m);
    }
  }

  // Generate name
  const adj = pick(ADJECTIVES);
  const nouns = NOUNS[category] || NOUNS.cognitive;
  const noun = pick(nouns);
  const name = `${adj} ${noun}`;

  // Generate capabilities
  const entryVerb = pick(CAPABILITY_VERBS);
  const exitVerb = pick(CAPABILITY_VERBS.filter(v => v !== entryVerb));
  const entryPattern = `${toKebab(adj)}-${entryVerb}`;
  const exitPattern = `${exitVerb}-complete`;

  // Generate CJPI scores
  const minScore = biasHigh ? 75 : 60;
  const maxScore = biasHigh ? 98 : 95;
  const breakdown: CJPIScoreBreakdown = {
    strategicLeverage: randScore(minScore, maxScore),
    recursionPotential: randScore(minScore - 5, maxScore),
    crossNodeImpact: randScore(minScore - 5, maxScore),
    composability: randScore(minScore - 5, maxScore),
    governanceInfluence: randScore(Math.max(50, minScore - 15), maxScore - 5),
    moatSensitivity: randScore(minScore, maxScore),
  };

  // Description
  const desc = `${adj} ${category} pipeline combining ${selectedModules.join(', ')} for cross-module ${entryVerb} and ${exitVerb} operations`;

  // Rationale
  const rationaleTemplate = pick(RATIONALE_PATTERNS);
  const rationale = rationaleTemplate
    .replace('{category}', category)
    .replace('{modules}', selectedModules.join(' × '))
    .replace('{modules}', selectedModules.join(' × '));

  // Execution time — more modules = more time
  const maxExecOptions = [1000, 2000, 3000, 5000, 8000, 10000, 15000];
  const maxExecutionMs = maxExecOptions[Math.min(selectedModules.length - 1, maxExecOptions.length - 1)];

  return {
    namePattern: name,
    descriptionPattern: desc,
    category,
    modulePattern: selectedModules,
    entryPattern,
    exitPattern,
    errorStrategy: pick([...ERROR_STRATEGIES]),
    maxExecutionMs,
    baseBreakdown: breakdown,
    discoveredBy: 'auto-generator',
    rationale,
  };
}

/** Generate a batch of random templates, avoiding retired combos */
export function generateTemplateBatch(config: Partial<GeneratorConfig> = {}): GeneratedTemplate[] {
  const cfg: GeneratorConfig = {
    batchSize: config.batchSize ?? 20,
    minModules: config.minModules ?? 2,
    maxModules: config.maxModules ?? 5,
    minCjpiTarget: config.minCjpiTarget ?? 80,
    biasHighValue: config.biasHighValue ?? true,
  };

  const templates: GeneratedTemplate[] = [];
  const seenHashes = new Set<string>();
  let attempts = 0;
  const maxAttempts = cfg.batchSize * 10; // prevent infinite loops

  while (templates.length < cfg.batchSize && attempts < maxAttempts) {
    attempts++;
    const category = pick(CATEGORIES);
    const moduleCount = randInt(cfg.minModules, cfg.maxModules);
    const template = generateOneTemplate(category, moduleCount, cfg.biasHighValue);

    // Skip retired combos
    if (isComboRetired(template.modulePattern, template.category)) continue;

    // Skip duplicate combos within this batch
    const hash = comboHash(template.modulePattern, template.category);
    if (seenHashes.has(hash)) continue;
    seenHashes.add(hash);

    // Quick CJPI estimate — skip if too low
    const estCjpi = template.baseBreakdown.strategicLeverage * 0.30 +
      template.baseBreakdown.recursionPotential * 0.20 +
      template.baseBreakdown.crossNodeImpact * 0.15 +
      template.baseBreakdown.composability * 0.15 +
      template.baseBreakdown.governanceInfluence * 0.10 +
      template.baseBreakdown.moatSensitivity * 0.10;
    if (estCjpi < cfg.minCjpiTarget - 10) continue; // allow some margin for synergy multiplier

    templates.push(template);
  }

  return templates;
}

/** Get stats about the generator's state */
export function getGeneratorStats() {
  const retired = getRetiredCombos();
  const totalPossibleCombos = Math.pow(MODULES.length, 3) * CATEGORIES.length; // rough estimate
  return {
    retiredCount: retired.length,
    totalModules: MODULES.length,
    totalCategories: CATEGORIES.length,
    estimatedCombos: totalPossibleCombos,
    exploredPercent: retired.length > 0 ? ((retired.length / totalPossibleCombos) * 100).toFixed(2) + '%' : '0%',
    totalDiscoveriesFromRetired: retired.reduce((s, r) => s + r.totalDiscoveries, 0),
    topRetiredByDiscoveries: [...retired].sort((a, b) => b.totalDiscoveries - a.totalDiscoveries).slice(0, 5),
  };
}
