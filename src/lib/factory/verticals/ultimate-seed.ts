/**
 * CMPSBL® ULTIMATE Vertical — Discovery Seed Engine (GENESIS)
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Generates 200 high-bias discoveries drawing from ALL 143 candidate
 * primitives across every vertical with no domain restriction.
 *
 * Key differences from vertical-specific seed engines:
 * - Longer chains (6–12 primitives)
 * - Higher base CJPI bias
 * - Cross-domain combinations no single vertical could produce
 * - Flagship tier — the highest-quality seed output in the substrate
 *
 * © CMPSBL® — All rights reserved.
 */

import { addDiscovery } from '../discovery-retirement';
import { routeDiscovery } from '../foundry-engine';
import { persistSeedDiscoveries, ensureSeedRun } from './seed-persistence';

// ═══════════════════════════════════════════════════════════════
// §1 — TYPES
// ═══════════════════════════════════════════════════════════════

export interface UltimateDiscovery {
  id: string;
  name: string;
  description: string;
  cjpiScore: number;
  primitiveChain: string[];
  tier: 'Raw' | 'Mint' | 'Prime' | 'Relic' | 'Mythic' | 'Apex';
  route: 'vault' | 'showroom' | 'junkyard';
  category: 'cross-domain-fusion' | 'universal-hardening' | 'meta-cognition' | 'autonomous-governance' | 'full-spectrum-defense' | 'convergent-intelligence' | 'infrastructure-synthesis' | 'emergent-capability';
  discoveredAt: string;
}

export interface UltimateSeedResult {
  runId: string;
  totalDiscoveries: number;
  vaultCount: number;
  showroomCount: number;
  junkyardCount: number;
  memoryStreamCount: number;
  discoveries: UltimateDiscovery[];
  completedAt: string;
}

// ═══════════════════════════════════════════════════════════════
// §2 — ALL 143 CANDIDATE PRIMITIVES
// ═══════════════════════════════════════════════════════════════

function seedRng(seed: number): () => number {
  let s = seed;
  return () => { s = (s * 1664525 + 1013904223) & 0x7fffffff; return s / 0x7fffffff; };
}

/** 24 Spine (12 Organs + 12 Layers) */
const SPINE_IDS = [
  'CORE', 'SYSTEM', 'BRAIN', 'MEMORY', 'NERVE', 'NEXUS',
  'IDENTITY', 'SOVEREIGN', 'ATLAS', 'MEDIC', 'RELAY', 'CONSCIENCE',
  'DEFENSE', 'IMMUNITY', 'GOVERNANCE', 'TREATY', 'EVOLUTION', 'REFLEX',
  'COMPASS', 'INTEGRATION', 'INTENT', 'ACCESS', 'BEACON', 'SHADOW',
];

/** 16 Core Expansion (8 Engines + 8 Agents) */
const CORE_EXPANSION = [
  'DREAM', 'HARVEST', 'FORGE', 'LINGUA', 'ECHO', 'PHANTOM', 'SANDBOX', 'RIPPLE',
  'ENCODE', 'DECODE', 'AUDIT', 'ECONOMY', 'INCLUSIVE', 'CORTEX', 'ORACLE', 'ENGINEER',
];

/** Cyber primitives */
const CYBER = [
  'WATCHTOWER', 'SHADE', 'AEGIS', 'CIPHER', 'RECON', 'VANGUARD',
  'BASTION', 'TEMPEST', 'PROWLER', 'ONYX', 'SPECTER', 'BLACKOUT',
  'TRACER', 'NOCTURNE', 'IRONCLAD', 'CITADEL',
];

/** Robotics primitives */
const ROBOTICS = [
  'SERVO', 'KINETIC', 'LIDAR', 'FABRICATOR', 'FLUX', 'VECTOR',
  'TENSOR', 'CALIBER', 'GRIPPER', 'SWARM', 'ENVIRON', 'MARSHAL',
  'DISPATCH', 'WELDER', 'INSPECTOR', 'PIONEER',
];

/** LLM primitives */
const LLM = [
  'VERITAS', 'RAMPART', 'SYLLOGISM', 'LEXICON', 'CLARITY', 'FULCRUM',
  'TETHER', 'SIEVE', 'SKEPTIC', 'TRIBUNAL', 'HERALD', 'MIMIC',
  'LINEAGE', 'EMBARGO', 'GAUNTLET', 'CUSTODIAN',
];

/** Quantum primitives */
const QUANTUM = [
  'QUBIT', 'ENTANGLE', 'SUPERPOSE', 'DECOHERE', 'TELEPORT', 'ANNEAL',
  'TOPOLOGY', 'HADAMARD', 'GROVER', 'SHOR', 'MEASURE', 'SURFACE',
  'FIDELITY', 'LATTICE', 'BOSON', 'PHASE',
];

/** Agency primitives */
const AGENCY = [
  'MANDATE', 'OPERATOR', 'REASON', 'DELEGATE', 'RECONN', 'DIPLOMAT',
  'SCHOLAR', 'WARDEN', 'ANCHOR', 'SCRIBE', 'ENVOY', 'ROGUE',
  'OVERSEER', 'UPLINK', 'TOOLKIT', 'INCENTIVE',
];

/** Media primitives */
const MEDIA = [
  'CANVAS', 'LENS', 'STAGE', 'SCORE', 'FRAME', 'PALETTE',
  'MONTAGE', 'VOICE', 'RENDER', 'PIXEL', 'STUDIO', 'BROADCAST',
  'ARCHIVE', 'FILTER', 'TIMELINE', 'PUBLISHER',
];

/** All 143 primitives combined */
const ALL_PRIMITIVES = [
  ...SPINE_IDS, ...CORE_EXPANSION, ...CYBER, ...ROBOTICS,
  ...LLM, ...QUANTUM, ...AGENCY, ...MEDIA,
];

// ═══════════════════════════════════════════════════════════════
// §3 — CROSS-DOMAIN DISCOVERY TEMPLATES
// ═══════════════════════════════════════════════════════════════

interface DiscoveryTemplate {
  namePattern: string;
  descriptionPattern: string;
  category: UltimateDiscovery['category'];
  primaryPrimitives: string[];
  minChainLength: number;
  maxChainLength: number;
  cjpiBias: number;
}

const DISCOVERY_TEMPLATES: DiscoveryTemplate[] = [
  // ═══ CROSS-DOMAIN FUSION (highest CJPI — vault candidates) ═══
  { namePattern: 'Cyber-Physical Convergence Engine', descriptionPattern: 'Fuses cyber threat detection with robotic perception to create unified attack surface awareness spanning digital and physical domains simultaneously.', category: 'cross-domain-fusion', primaryPrimitives: ['WATCHTOWER', 'LIDAR', 'AEGIS', 'ENVIRON', 'DEFENSE'], minChainLength: 8, maxChainLength: 12, cjpiBias: 32 },
  { namePattern: 'Quantum-Hardened LLM Reasoning Chain', descriptionPattern: 'Applies quantum error correction principles to LLM reasoning chains, creating verifiably consistent multi-step inference with decoherence-resistant logic paths.', category: 'cross-domain-fusion', primaryPrimitives: ['SYLLOGISM', 'ENTANGLE', 'VERITAS', 'SURFACE', 'FIDELITY'], minChainLength: 8, maxChainLength: 12, cjpiBias: 30 },
  { namePattern: 'Autonomous Agency-Media Production Pipeline', descriptionPattern: 'End-to-end autonomous content production combining agent research, LLM synthesis, and media rendering into a single governed pipeline.', category: 'cross-domain-fusion', primaryPrimitives: ['MANDATE', 'RECONN', 'LEXICON', 'CANVAS', 'RENDER', 'PUBLISHER'], minChainLength: 9, maxChainLength: 12, cjpiBias: 31 },
  { namePattern: 'Full-Spectrum Intelligence Fabric', descriptionPattern: 'Unified intelligence layer spanning cyber reconnaissance, quantum sensing, robotic perception, and LLM analysis for comprehensive situational awareness.', category: 'cross-domain-fusion', primaryPrimitives: ['RECON', 'QUBIT', 'LIDAR', 'SYLLOGISM', 'BRAIN', 'ATLAS'], minChainLength: 9, maxChainLength: 12, cjpiBias: 33 },

  // ═══ UNIVERSAL HARDENING (high CJPI) ═══
  { namePattern: 'Universal Dual-Layer Hardening Compiler', descriptionPattern: 'Applies the Convex Core dual-layer architecture to arbitrary codebases across all verticals, wrapping source in generated runtime protection without modification.', category: 'universal-hardening', primaryPrimitives: ['FORGE', 'DEFENSE', 'IMMUNITY', 'EVOLUTION', 'GOVERNANCE'], minChainLength: 8, maxChainLength: 12, cjpiBias: 30 },
  { namePattern: 'Cross-Vertical Security Posture Unifier', descriptionPattern: 'Normalizes security policies across cyber, robotics, and LLM substrates into a single enforceable posture with cross-domain threat propagation analysis.', category: 'universal-hardening', primaryPrimitives: ['CITADEL', 'BASTION', 'RAMPART', 'DEFENSE', 'GOVERNANCE'], minChainLength: 8, maxChainLength: 11, cjpiBias: 28 },
  { namePattern: 'Substrate-Wide Evolution Orchestrator', descriptionPattern: 'Coordinates EVOLUTION patches across all 143 primitives with dependency analysis, rollback capabilities, and substrate-wide regression testing.', category: 'universal-hardening', primaryPrimitives: ['EVOLUTION', 'GOVERNANCE', 'BEACON', 'SYSTEM', 'CORE'], minChainLength: 7, maxChainLength: 10, cjpiBias: 29 },
  { namePattern: 'Autonomous Vulnerability Remediation Engine', descriptionPattern: 'Combines cyber vulnerability scanning with automated code hardening and robotic safety verification for self-healing infrastructure.', category: 'universal-hardening', primaryPrimitives: ['RECON', 'FORGE', 'MEDIC', 'INSPECTOR', 'EVOLUTION'], minChainLength: 8, maxChainLength: 11, cjpiBias: 27 },

  // ═══ META-COGNITION (high CJPI) ═══
  { namePattern: 'Recursive Self-Improvement Compiler', descriptionPattern: 'Meta-cognitive engine that evaluates its own discovery quality, identifies scoring blind spots, and generates corrective calibration patches.', category: 'meta-cognition', primaryPrimitives: ['BRAIN', 'CONSCIENCE', 'EVOLUTION', 'SKEPTIC', 'MEMORY'], minChainLength: 7, maxChainLength: 10, cjpiBias: 26 },
  { namePattern: 'Cross-Substrate Learning Transfer Pipeline', descriptionPattern: 'Extracts transferable patterns from one vertical substrate and applies them to others through structured generalization and domain adaptation.', category: 'meta-cognition', primaryPrimitives: ['SCHOLAR', 'BRAIN', 'MEMORY', 'MIMIC', 'INTEGRATION'], minChainLength: 7, maxChainLength: 10, cjpiBias: 24 },
  { namePattern: 'Discovery Quality Meta-Evaluator', descriptionPattern: 'Scores the quality of the discovery engine itself by analyzing CJPI distribution, primitive coverage, and cross-vertical discovery diversity.', category: 'meta-cognition', primaryPrimitives: ['TRIBUNAL', 'VERITAS', 'BRAIN', 'AUDIT'], minChainLength: 6, maxChainLength: 9, cjpiBias: 22 },

  // ═══ AUTONOMOUS GOVERNANCE (mid-high CJPI) ═══
  { namePattern: 'Substrate-Wide Policy Harmonizer', descriptionPattern: 'Detects policy conflicts across verticals and generates harmonized governance rules that maintain domain-specific requirements while ensuring global consistency.', category: 'autonomous-governance', primaryPrimitives: ['GOVERNANCE', 'TREATY', 'CONSCIENCE', 'SOVEREIGN'], minChainLength: 6, maxChainLength: 9, cjpiBias: 20 },
  { namePattern: 'Multi-Vertical Compliance Auditor', descriptionPattern: 'Automated compliance verification spanning cyber regulations, robotics safety standards, LLM content policies, and data sovereignty requirements.', category: 'autonomous-governance', primaryPrimitives: ['AUDIT', 'WARDEN', 'TRIBUNAL', 'GOVERNANCE'], minChainLength: 6, maxChainLength: 8, cjpiBias: 18 },
  { namePattern: 'Autonomous Access Control Fabric', descriptionPattern: 'Dynamic access control spanning all verticals with role-based, attribute-based, and context-aware policies enforced at the primitive level.', category: 'autonomous-governance', primaryPrimitives: ['ACCESS', 'IDENTITY', 'SOVEREIGN', 'DEFENSE'], minChainLength: 6, maxChainLength: 8, cjpiBias: 17 },

  // ═══ FULL-SPECTRUM DEFENSE (mid CJPI) ═══
  { namePattern: 'Unified Threat Response Orchestrator', descriptionPattern: 'Coordinates incident response across cyber, physical, and AI domains with unified playbooks, evidence correlation, and cross-domain containment.', category: 'full-spectrum-defense', primaryPrimitives: ['AEGIS', 'DEFENSE', 'IMMUNITY', 'BASTION'], minChainLength: 6, maxChainLength: 9, cjpiBias: 16 },
  { namePattern: 'Adversarial Resilience Testing Framework', descriptionPattern: 'Comprehensive adversarial testing spanning prompt injection, network attacks, physical intrusion, and supply chain compromise scenarios.', category: 'full-spectrum-defense', primaryPrimitives: ['SHADE', 'GAUNTLET', 'PROWLER', 'SPECTER'], minChainLength: 5, maxChainLength: 8, cjpiBias: 14 },
  { namePattern: 'Cross-Domain Anomaly Correlation Engine', descriptionPattern: 'Detects correlated anomalies across network traffic, robotic sensor data, LLM output quality, and quantum circuit fidelity metrics.', category: 'full-spectrum-defense', primaryPrimitives: ['WATCHTOWER', 'INSPECTOR', 'SKEPTIC', 'BEACON'], minChainLength: 5, maxChainLength: 8, cjpiBias: 13 },

  // ═══ CONVERGENT INTELLIGENCE (mid CJPI) ═══
  { namePattern: 'Multi-Modal Intelligence Synthesizer', descriptionPattern: 'Fuses intelligence signals from text, code, sensor data, and quantum measurements into unified situational assessments.', category: 'convergent-intelligence', primaryPrimitives: ['BRAIN', 'LEXICON', 'LIDAR', 'MEASURE'], minChainLength: 5, maxChainLength: 8, cjpiBias: 15 },
  { namePattern: 'Collective Memory Federation', descriptionPattern: 'Federated learning across vertical substrates that shares anonymized patterns while preserving domain-specific IP isolation.', category: 'convergent-intelligence', primaryPrimitives: ['MEMORY', 'RELAY', 'TREATY', 'ANCHOR'], minChainLength: 5, maxChainLength: 7, cjpiBias: 12 },

  // ═══ INFRASTRUCTURE SYNTHESIS (lower-mid CJPI) ═══
  { namePattern: 'Cross-Vertical Primitive Orchestrator', descriptionPattern: 'Runtime orchestration layer that composes primitives from multiple verticals into novel capability chains not possible within any single substrate.', category: 'infrastructure-synthesis', primaryPrimitives: ['INTEGRATION', 'CORE', 'SYSTEM'], minChainLength: 4, maxChainLength: 7, cjpiBias: 10 },
  { namePattern: 'Universal Telemetry Aggregation Layer', descriptionPattern: 'Collects and normalizes health signals from all verticals into a unified observability dashboard with cross-substrate correlation.', category: 'infrastructure-synthesis', primaryPrimitives: ['BEACON', 'MEDIC', 'RELAY'], minChainLength: 4, maxChainLength: 6, cjpiBias: 8 },
  { namePattern: 'Substrate Resource Scheduler', descriptionPattern: 'Global resource allocation across vertical substrates with priority queuing, preemption, and SLA-aware scheduling.', category: 'infrastructure-synthesis', primaryPrimitives: ['DISPATCH', 'SYSTEM', 'ECONOMY'], minChainLength: 3, maxChainLength: 5, cjpiBias: 5 },

  // ═══ EMERGENT CAPABILITY (lower CJPI, junkyard candidates) ═══
  { namePattern: 'Serendipity Discovery Accelerator', descriptionPattern: 'Intentionally explores low-probability primitive combinations to discover emergent capabilities invisible to targeted search strategies.', category: 'emergent-capability', primaryPrimitives: ['DREAM', 'PHANTOM', 'ROGUE'], minChainLength: 3, maxChainLength: 5, cjpiBias: 2 },
  { namePattern: 'Primitive Interaction Graph Mapper', descriptionPattern: 'Maps pairwise interaction strengths between all 143 primitives to identify unexplored high-potential combinations for future discovery runs.', category: 'emergent-capability', primaryPrimitives: ['ATLAS', 'BRAIN'], minChainLength: 2, maxChainLength: 4, cjpiBias: 0 },
  { namePattern: 'Dormant Capability Excavator', descriptionPattern: 'Scans existing codebases for latent primitive affinities that were never explicitly activated, surfacing hidden capability potential.', category: 'emergent-capability', primaryPrimitives: ['HARVEST', 'PHANTOM'], minChainLength: 2, maxChainLength: 3, cjpiBias: -2 },
];

// ═══════════════════════════════════════════════════════════════
// §4 — SCORING (boosted for Ultimate tier)
// ═══════════════════════════════════════════════════════════════

function scoreCjpi(chainLength: number, bias: number, rand: () => number): number {
  // Ultimate gets a +5 base bonus for cross-domain synergy
  const chainBonus = chainLength * 5;
  const base = 50 + chainBonus + Math.floor(rand() * 12);
  return Math.min(100, Math.max(35, base + bias));
}

function classifyTier(score: number): UltimateDiscovery['tier'] {
  if (score === 100) return 'Apex';
  if (score >= 94) return 'Mythic';
  if (score >= 90) return 'Relic';
  if (score >= 80) return 'Prime';
  if (score >= 68) return 'Mint';
  return 'Raw';
}

// ═══════════════════════════════════════════════════════════════
// §5 — CHAIN BUILDER (draws from all 143)
// ═══════════════════════════════════════════════════════════════

function buildChain(template: DiscoveryTemplate, rand: () => number): string[] {
  const chain = [...template.primaryPrimitives];
  const targetLen = template.minChainLength + Math.floor(rand() * (template.maxChainLength - template.minChainLength + 1));
  while (chain.length < targetLen) {
    const candidate = ALL_PRIMITIVES[Math.floor(rand() * ALL_PRIMITIVES.length)];
    if (!chain.includes(candidate)) chain.push(candidate);
  }
  return chain;
}

// ═══════════════════════════════════════════════════════════════
// §6 — VARIANT NAME GENERATOR
// ═══════════════════════════════════════════════════════════════

const VARIANT_PREFIXES = [
  'Omnidomain', 'Universal', 'Convergent', 'Substrate-Wide', 'Cross-Vertical',
  'Autonomous', 'Recursive', 'Full-Spectrum', 'Meta-Cognitive', 'Emergent',
  'Sovereign', 'Governing', 'Deterministic', 'Self-Evolving', 'Unified',
  'Holistic', 'Federated', 'Transcendent', 'Compound', 'Apex-Grade',
];

const VARIANT_SUFFIXES = [
  'Engine', 'Fabric', 'Protocol', 'Compiler', 'Matrix',
  'Orchestrator', 'Synthesizer', 'Architecture', 'System', 'Nexus',
  'Constellation', 'Controller', 'Unifier', 'Accelerator', 'Substrate',
];

function generateVariantName(base: string, index: number, rand: () => number): string {
  if (index === 0) return base;
  const prefix = VARIANT_PREFIXES[Math.floor(rand() * VARIANT_PREFIXES.length)];
  const suffix = VARIANT_SUFFIXES[Math.floor(rand() * VARIANT_SUFFIXES.length)];
  const core = base.split(' ').slice(0, 3).join(' ');
  return `${prefix} ${core} ${suffix}`;
}

// ═══════════════════════════════════════════════════════════════
// §7 — VAULT & MEMORY STREAM POOL
// ═══════════════════════════════════════════════════════════════

const ULTIMATE_VAULT = new Map<string, UltimateDiscovery>();
const ULTIMATE_MEMORY_STREAM_POOL: UltimateDiscovery[] = [];

export function getUltimateVault(): UltimateDiscovery[] { return Array.from(ULTIMATE_VAULT.values()); }
export function getUltimateVaultCount(): number { return ULTIMATE_VAULT.size; }
export function getUltimateMemoryStreamPool(): UltimateDiscovery[] { return [...ULTIMATE_MEMORY_STREAM_POOL]; }
export function getUltimateMemoryStreamCount(): number { return ULTIMATE_MEMORY_STREAM_POOL.length; }

// ═══════════════════════════════════════════════════════════════
// §8 — MAIN SEED ENGINE (GENESIS)
// ═══════════════════════════════════════════════════════════════

const TOTAL_DISCOVERIES = 200;
const ARCHITECTURE_GATE_THRESHOLD = 95;
let _seedResult: UltimateSeedResult | null = null;

export function seedUltimateDiscoveries(): UltimateSeedResult {
  if (_seedResult) return _seedResult;

  const runId = 'ul-seed-' + Date.now().toString(36);
  const rand = seedRng(0xULT1_CAFE);
  const discoveries: UltimateDiscovery[] = [];
  let vaultCount = 0, showroomCount = 0, junkyardCount = 0, memoryStreamCount = 0;
  let templateIdx = 0;

  for (let i = 0; i < TOTAL_DISCOVERIES; i++) {
    const template = DISCOVERY_TEMPLATES[templateIdx % DISCOVERY_TEMPLATES.length];
    const variantIndex = Math.floor(templateIdx / DISCOVERY_TEMPLATES.length);
    templateIdx++;

    const chain = buildChain(template, rand);
    const cjpiScore = scoreCjpi(chain.length, template.cjpiBias, rand);
    const tier = classifyTier(cjpiScore);
    const route = cjpiScore >= ARCHITECTURE_GATE_THRESHOLD ? 'vault' : routeDiscovery(cjpiScore);

    const discovery: UltimateDiscovery = {
      id: `UDSC-${String(i + 1).padStart(3, '0')}`,
      name: generateVariantName(template.namePattern, variantIndex, rand),
      description: template.descriptionPattern,
      cjpiScore, primitiveChain: chain, tier, route,
      category: template.category,
      discoveredAt: new Date().toISOString(),
    };

    discoveries.push(discovery);
    if (route === 'vault') { ULTIMATE_VAULT.set(discovery.id, discovery); vaultCount++; }
    else {
      addDiscovery(discovery.id, discovery.name, discovery.description, discovery.cjpiScore, discovery.primitiveChain);
      if (route === 'showroom') showroomCount++; else junkyardCount++;
      ULTIMATE_MEMORY_STREAM_POOL.push(discovery); memoryStreamCount++;
    }
  }

  _seedResult = { runId, totalDiscoveries: TOTAL_DISCOVERIES, vaultCount, showroomCount, junkyardCount, memoryStreamCount, discoveries, completedAt: new Date().toISOString() };

  const seedRunId = `ul-seed-${Date.now().toString(36)}`;
  ensureSeedRun(seedRunId, 'ultimate', TOTAL_DISCOVERIES).then(() => {
    const rows = discoveries.map(d => ({ id: d.id, name: d.name, description: d.description, cjpiScore: d.cjpiScore, primitiveChain: d.primitiveChain, tier: d.tier, route: d.route, category: d.category, vertical: 'ultimate', runId: seedRunId }));
    persistSeedDiscoveries(rows, 'ultimate', seedRunId);
  });

  return _seedResult;
}

export function getUltimateSeedResult(): UltimateSeedResult | null { return _seedResult; }
export function getUltimateSeedSummary() {
  if (!_seedResult) return { total: 0, vault: 0, showroom: 0, junkyard: 0, memoryStream: 0 };
  return { total: _seedResult.totalDiscoveries, vault: _seedResult.vaultCount, showroom: _seedResult.showroomCount, junkyard: _seedResult.junkyardCount, memoryStream: _seedResult.memoryStreamCount };
}
export function resetUltimateSeed(): void { _seedResult = null; ULTIMATE_VAULT.clear(); ULTIMATE_MEMORY_STREAM_POOL.length = 0; }
