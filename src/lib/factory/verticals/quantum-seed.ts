/**
 * CMPSBL® Quantum Vertical — Discovery Seed Engine
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Generates 200 high-bias discoveries using the quantum primitive matrix.
 * Routes:
 *   - Architecture-class (CJPI ≥ 95) → Vault (gated, S-Tier protected)
 *   - Showroom-class (CJPI 68–94)   → Showroom catalog
 *   - Raw-tier (CJPI < 68)          → Junkyard pool (free)
 *
 * All non-vault discoveries are also deposited into the Memory Stream pool.
 *
 * © CMPSBL® — All rights reserved.
 */

import { routeDiscovery } from '../foundry-engine';
import { routeDiscovery } from '../foundry-engine';
import { persistSeedDiscoveries, ensureSeedRun } from './seed-persistence';
import { getQuantumEngines, getQuantumAgents } from './quantum';

// ═══════════════════════════════════════════════════════════════
// §1 — TYPES
// ═══════════════════════════════════════════════════════════════

export interface QuantumDiscovery {
  id: string;
  name: string;
  description: string;
  cjpiScore: number;
  primitiveChain: string[];
  tier: 'Raw' | 'Mint' | 'Prime' | 'Relic' | 'Mythic' | 'Apex';
  route: 'vault' | 'showroom' | 'junkyard';
  category: 'architecture' | 'computation' | 'simulation' | 'measurement' | 'protocol' | 'optimization';
  discoveredAt: string;
}

export interface QuantumSeedResult {
  runId: string;
  totalDiscoveries: number;
  vaultCount: number;
  showroomCount: number;
  junkyardCount: number;
  memoryStreamCount: number;
  discoveries: QuantumDiscovery[];
  completedAt: string;
}

// ═══════════════════════════════════════════════════════════════
// §2 — DISCOVERY TEMPLATES
// ═══════════════════════════════════════════════════════════════

/** Seeded PRNG for reproducible discovery generation */
function seedRng(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}

const QUANTUM_PRIMITIVE_IDS = [
  ...getQuantumEngines().map(e => e.id),
  ...getQuantumAgents().map(a => a.id),
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
  category: QuantumDiscovery['category'];
  primaryPrimitives: string[];
  minChainLength: number;
  maxChainLength: number;
  cjpiBias: number; // Added to base score
}

const DISCOVERY_TEMPLATES: DiscoveryTemplate[] = [
  // ═══ ARCHITECTURE (high CJPI, vault candidates) ═══
  { namePattern: 'Quantum Error Surface Code Fabric', descriptionPattern: 'Autonomous surface code error correction with real-time syndrome decoding and logical qubit stabilization across {n}-qubit registers.', category: 'architecture', primaryPrimitives: ['QUBIT', 'ENTANGLE', 'DEFENSE'], minChainLength: 5, maxChainLength: 8, cjpiBias: 30 },
  { namePattern: 'Topological Qubit Lattice Architect', descriptionPattern: 'Designs fault-tolerant topological qubit arrangements with anyonic braiding protocols and non-abelian exchange statistics.', category: 'architecture', primaryPrimitives: ['LATTICE', 'QUBIT', 'FERMION'], minChainLength: 6, maxChainLength: 8, cjpiBias: 32 },
  { namePattern: 'Unified Field Theory Solver', descriptionPattern: 'Multi-scale solver coupling quantum chromodynamics with electroweak theory for beyond-Standard-Model exploration.', category: 'architecture', primaryPrimitives: ['GLUON', 'BOSON', 'GRAVITON'], minChainLength: 5, maxChainLength: 7, cjpiBias: 35 },
  { namePattern: 'Quantum Advantage Compiler', descriptionPattern: 'End-to-end quantum algorithm compiler that identifies quantum speedup opportunities and maps them to optimal gate sequences.', category: 'architecture', primaryPrimitives: ['QUBIT', 'HADRON', 'BRAIN'], minChainLength: 4, maxChainLength: 7, cjpiBias: 28 },
  { namePattern: 'Relativistic Quantum Field Engine', descriptionPattern: 'Full QFT propagator engine computing Feynman path integrals, renormalization group flows, and vacuum energy corrections.', category: 'architecture', primaryPrimitives: ['FERMION', 'BOSON', 'GLUON'], minChainLength: 6, maxChainLength: 8, cjpiBias: 33 },
  { namePattern: 'Quantum Cryptography Key Distribution Fabric', descriptionPattern: 'BB84 and E91 protocol implementations with decoy-state analysis, privacy amplification, and information-theoretic security proofs.', category: 'protocol', primaryPrimitives: ['ENTANGLE', 'PHOTON', 'DEFENSE'], minChainLength: 5, maxChainLength: 8, cjpiBias: 29 },
  { namePattern: 'Quantum Memory Network Orchestrator', descriptionPattern: 'Distributed quantum memory management with entanglement swapping, purification protocols, and coherence time optimization.', category: 'architecture', primaryPrimitives: ['ENTANGLE', 'CRYOGEN', 'MEMORY'], minChainLength: 5, maxChainLength: 7, cjpiBias: 30 },
  { namePattern: 'Variational Quantum Eigensolver Fabric', descriptionPattern: 'Hybrid quantum-classical VQE framework with adaptive ansatz construction, gradient estimation, and energy landscape mapping.', category: 'computation', primaryPrimitives: ['QUBIT', 'FERMION', 'LATTICE'], minChainLength: 5, maxChainLength: 8, cjpiBias: 27 },

  // ═══ COMPUTATION (mid-high CJPI) ═══
  { namePattern: 'Particle Decay Cascade Simulator', descriptionPattern: 'Full decay chain simulation with branching ratios, CP violation parameters, and detector acceptance modeling.', category: 'simulation', primaryPrimitives: ['HADRON', 'MUON', 'MESON'], minChainLength: 3, maxChainLength: 6, cjpiBias: 18 },
  { namePattern: 'Quantum Monte Carlo Integrator', descriptionPattern: 'Variational and diffusion Monte Carlo methods for many-body ground state calculations with importance sampling.', category: 'computation', primaryPrimitives: ['FERMION', 'HADRON', 'ORACLE'], minChainLength: 3, maxChainLength: 5, cjpiBias: 15 },
  { namePattern: 'Magneto-Hydrodynamic Plasma Solver', descriptionPattern: 'Resistive MHD solver for tokamak geometry with finite element methods and Grad-Shafranov equilibrium.', category: 'simulation', primaryPrimitives: ['PLASMA', 'LATTICE', 'SIMULATE'], minChainLength: 3, maxChainLength: 6, cjpiBias: 16 },
  { namePattern: 'Neutrino Mass Hierarchy Analyzer', descriptionPattern: 'PMNS matrix parameter fitting with matter effect corrections and mass ordering determination from oscillation data.', category: 'measurement', primaryPrimitives: ['NEUTRINO', 'BOSON', 'ORACLE'], minChainLength: 3, maxChainLength: 5, cjpiBias: 14 },
  { namePattern: 'Gravitational Lensing Calculator', descriptionPattern: 'Weak and strong lensing computations with mass distribution reconstruction from photometric surveys.', category: 'computation', primaryPrimitives: ['GRAVITON', 'PHOTON', 'OBSERVER'], minChainLength: 3, maxChainLength: 5, cjpiBias: 12 },
  { namePattern: 'Quantum Annealing Optimizer', descriptionPattern: 'Ising model embedding and quantum annealing schedule optimization for combinatorial problems.', category: 'optimization', primaryPrimitives: ['QUBIT', 'LATTICE', 'BRAIN'], minChainLength: 3, maxChainLength: 5, cjpiBias: 17 },
  { namePattern: 'Bose-Einstein Condensate Modeler', descriptionPattern: 'Gross-Pitaevskii equation solver for BEC dynamics with vortex lattice formation and superfluidity transitions.', category: 'simulation', primaryPrimitives: ['BOSON', 'CRYOGEN', 'FERMION'], minChainLength: 3, maxChainLength: 6, cjpiBias: 16 },
  { namePattern: 'Quantum Noise Characterizer', descriptionPattern: 'Benchmarks T1/T2 coherence times, gate fidelities, and cross-talk matrices for quantum processor calibration.', category: 'measurement', primaryPrimitives: ['CRYOGEN', 'QUBIT', 'BEACON'], minChainLength: 3, maxChainLength: 5, cjpiBias: 13 },

  // ═══ SIMULATION (mid CJPI) ═══
  { namePattern: 'Quark-Gluon Plasma Phase Mapper', descriptionPattern: 'Lattice QCD thermodynamics at finite temperature computing deconfinement phase transitions and chiral symmetry restoration.', category: 'simulation', primaryPrimitives: ['GLUON', 'PLASMA', 'HADRON'], minChainLength: 4, maxChainLength: 6, cjpiBias: 20 },
  { namePattern: 'Hawking Radiation Spectrum Calculator', descriptionPattern: 'Semi-classical black hole evaporation model computing particle emission spectra and information paradox metrics.', category: 'computation', primaryPrimitives: ['GRAVITON', 'TACHYON', 'PHOTON'], minChainLength: 3, maxChainLength: 5, cjpiBias: 18 },
  { namePattern: 'Superconductor Gap Equation Solver', descriptionPattern: 'BCS and Eliashberg gap equation solvers for conventional and unconventional superconductors with Tc prediction.', category: 'computation', primaryPrimitives: ['LATTICE', 'CRYOGEN', 'FERMION'], minChainLength: 3, maxChainLength: 5, cjpiBias: 14 },
  { namePattern: 'Quantum Walk Graph Explorer', descriptionPattern: 'Continuous and discrete quantum walk implementations on arbitrary graph topologies for search and transport.', category: 'computation', primaryPrimitives: ['QUBIT', 'ENTANGLE', 'SIMULATE'], minChainLength: 2, maxChainLength: 4, cjpiBias: 10 },
  { namePattern: 'Raman Spectral Fingerprint Engine', descriptionPattern: 'Automated Raman peak fitting, baseline correction, and molecular fingerprint matching against reference databases.', category: 'measurement', primaryPrimitives: ['PRISM', 'PHOTON', 'HARVEST'], minChainLength: 2, maxChainLength: 4, cjpiBias: 8 },
  { namePattern: 'Dirac Equation Relativistic Solver', descriptionPattern: 'Finite difference and spectral methods for the Dirac equation in external fields with spin-orbit coupling.', category: 'computation', primaryPrimitives: ['FERMION', 'GRAVITON', 'BRAIN'], minChainLength: 3, maxChainLength: 5, cjpiBias: 15 },
  { namePattern: 'Quantum State Tomography Suite', descriptionPattern: 'Maximum likelihood and Bayesian state reconstruction from measurement data for multi-qubit density matrices.', category: 'measurement', primaryPrimitives: ['QUBIT', 'PRISM', 'ORACLE'], minChainLength: 3, maxChainLength: 5, cjpiBias: 12 },

  // ═══ PROTOCOL (varied CJPI) ═══
  { namePattern: 'Quantum Repeater Chain Protocol', descriptionPattern: 'Nested entanglement purification and swapping protocol for extending quantum communication range beyond attenuation limits.', category: 'protocol', primaryPrimitives: ['ENTANGLE', 'PHOTON', 'RELAY'], minChainLength: 3, maxChainLength: 6, cjpiBias: 20 },
  { namePattern: 'Quantum Random Number Generator', descriptionPattern: 'Device-independent quantum randomness extraction with min-entropy certification and post-processing.', category: 'protocol', primaryPrimitives: ['PHOTON', 'ENTANGLE', 'DEFENSE'], minChainLength: 2, maxChainLength: 4, cjpiBias: 10 },
  { namePattern: 'Quantum Consensus Protocol', descriptionPattern: 'Byzantine-fault-tolerant consensus using quantum entanglement for distributed agreement with provable security.', category: 'protocol', primaryPrimitives: ['ENTANGLE', 'GOVERNANCE', 'TREATY'], minChainLength: 4, maxChainLength: 6, cjpiBias: 22 },

  // ═══ MEASUREMENT (lower CJPI, junkyard candidates) ═══
  { namePattern: 'Photon Counter Calibrator', descriptionPattern: 'Single photon detector efficiency calibration with dead time modeling and afterpulsing correction.', category: 'measurement', primaryPrimitives: ['PHOTON', 'PRISM'], minChainLength: 2, maxChainLength: 3, cjpiBias: 2 },
  { namePattern: 'Doppler Redshift Calculator', descriptionPattern: 'Spectral line Doppler shift computation for astrophysical velocity measurements and cosmological redshift.', category: 'measurement', primaryPrimitives: ['PRISM', 'GRAVITON'], minChainLength: 2, maxChainLength: 3, cjpiBias: 0 },
  { namePattern: 'Geiger Counter Signal Processor', descriptionPattern: 'Dead-time corrected count rate estimation with background subtraction for radiation dosimetry.', category: 'measurement', primaryPrimitives: ['MUON', 'BEACON'], minChainLength: 2, maxChainLength: 3, cjpiBias: -2 },
  { namePattern: 'Beta Spectrum Endpoint Fitter', descriptionPattern: 'Kurie plot construction and endpoint energy extraction for neutrino mass upper limit determination.', category: 'measurement', primaryPrimitives: ['NEUTRINO', 'MUON'], minChainLength: 2, maxChainLength: 3, cjpiBias: 0 },
  { namePattern: 'Phonon Dispersion Plotter', descriptionPattern: 'Computes and visualizes phonon dispersion curves along high-symmetry paths in the Brillouin zone.', category: 'simulation', primaryPrimitives: ['LATTICE', 'PRISM'], minChainLength: 2, maxChainLength: 3, cjpiBias: -3 },

  // ═══ OPTIMIZATION (varied CJPI) ═══
  { namePattern: 'QAOA Combinatorial Solver', descriptionPattern: 'Quantum Approximate Optimization Algorithm for MaxCut, SAT, and scheduling with variational parameter optimization.', category: 'optimization', primaryPrimitives: ['QUBIT', 'BRAIN', 'ORACLE'], minChainLength: 3, maxChainLength: 5, cjpiBias: 15 },
  { namePattern: 'Quantum Gradient Descent Engine', descriptionPattern: 'Parameter-shift rule gradient estimation for variational quantum circuits with adaptive learning rates.', category: 'optimization', primaryPrimitives: ['QUBIT', 'FERMION', 'EVOLUTION'], minChainLength: 3, maxChainLength: 5, cjpiBias: 12 },
  { namePattern: 'Adiabatic State Preparer', descriptionPattern: 'Adiabatic quantum computation schedule optimizer ensuring gap maintenance during Hamiltonian interpolation.', category: 'optimization', primaryPrimitives: ['QUBIT', 'LATTICE', 'SIMULATE'], minChainLength: 3, maxChainLength: 5, cjpiBias: 14 },
];

// ═══════════════════════════════════════════════════════════════
// §3 — SCORING
// ═══════════════════════════════════════════════════════════════

/** High-bias CJPI scoring formula */
function scoreCjpi(
  chainLength: number,
  bias: number,
  rand: () => number,
): number {
  // Base: 45-70 from chain length and randomization
  const chainBonus = chainLength * 5;
  const base = 45 + chainBonus + Math.floor(rand() * 15);
  const score = Math.min(100, Math.max(30, base + bias));
  return score;
}

function classifyTier(score: number): QuantumDiscovery['tier'] {
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

function buildChain(
  template: DiscoveryTemplate,
  rand: () => number,
): string[] {
  const chain = [...template.primaryPrimitives];
  const targetLen = template.minChainLength + Math.floor(rand() * (template.maxChainLength - template.minChainLength + 1));

  // Fill remaining slots from quantum + spine primitives
  const allPool = [...QUANTUM_PRIMITIVE_IDS, ...SPINE_IDS];
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
  'Autonomous', 'Adaptive', 'Recursive', 'Distributed', 'Coherent',
  'Resonant', 'Entangled', 'Polarized', 'Spectral', 'Relativistic',
  'Stochastic', 'Deterministic', 'Topological', 'Adiabatic', 'Holographic',
  'Supersymmetric', 'Perturbative', 'Non-perturbative', 'Renormalized', 'Emergent',
];

const VARIANT_SUFFIXES = [
  'Engine', 'Fabric', 'Protocol', 'Pipeline', 'Matrix',
  'Orchestrator', 'Analyzer', 'Resolver', 'Synthesizer', 'Composer',
  'Detector', 'Modeler', 'Optimizer', 'Calibrator', 'Reconstructor',
];

function generateVariantName(base: string, index: number, rand: () => number): string {
  if (index === 0) return base;
  const prefix = VARIANT_PREFIXES[Math.floor(rand() * VARIANT_PREFIXES.length)];
  const suffix = VARIANT_SUFFIXES[Math.floor(rand() * VARIANT_SUFFIXES.length)];
  // Create unique variant by combining prefix + core concept + suffix
  const core = base.split(' ').slice(0, 3).join(' ');
  return `${prefix} ${core} ${suffix}`;
}

// §6 — (Plan B Step 9: In-memory vault & pool removed — DB is source of truth)

// ═══════════════════════════════════════════════════════════════
// §7 — MAIN SEED ENGINE
// ═══════════════════════════════════════════════════════════════

const TOTAL_DISCOVERIES = 200;
const ARCHITECTURE_GATE_THRESHOLD = 95;

let _seedResult: QuantumSeedResult | null = null;

/**
 * Seed the quantum vertical with 200 discoveries.
 * Routes architecture-class (CJPI ≥ 95) to vault, rest to showroom/junkyard.
 * All non-vault discoveries deposited into Memory Stream pool.
 *
 * Idempotent — returns cached result on subsequent calls.
 */
export function seedQuantumDiscoveries(): QuantumSeedResult {
  if (_seedResult) return _seedResult;

  const runId = 'q-seed-' + Date.now().toString(36);
  const rand = seedRng(0xDEAD_BEEF_CAFE);
  const discoveries: QuantumDiscovery[] = [];

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
    const description = template.descriptionPattern.replace('{n}', String(chain.length * 4));

    const discovery: QuantumDiscovery = {
      id: `QDSC-${String(i + 1).padStart(3, '0')}`,
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

    // Route the discovery
    if (route === 'vault') {
      vaultCount++;
    } else {
      if (route === 'showroom') {
        showroomCount++;
      } else {
        junkyardCount++;
      }
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

  // Persist all discoveries to the unified database table (fire-and-forget)
  const seedRunId = runId;
  ensureSeedRun(seedRunId, 'quantum', TOTAL_DISCOVERIES).then(() => {
    const rows = discoveries.map(d => ({
      id: d.id,
      name: d.name,
      description: d.description,
      cjpiScore: d.cjpiScore,
      primitiveChain: d.primitiveChain,
      tier: d.tier,
      route: d.route,
      category: d.category,
      vertical: 'quantum',
      runId: seedRunId,
    }));
    persistSeedDiscoveries(rows, 'quantum', seedRunId);
  });

  return _seedResult;
}

/**
 * Get seed result without re-running (null if not yet seeded).
 */
export function getQuantumSeedResult(): QuantumSeedResult | null {
  return _seedResult;
}

/**
 * Get discovery distribution summary.
 */
export function getQuantumSeedSummary(): {
  total: number;
  vault: number;
  showroom: number;
  junkyard: number;
  memoryStream: number;
  byCategory: Record<string, number>;
  byTier: Record<string, number>;
} | null {
  if (!_seedResult) return null;

  const byCategory: Record<string, number> = {};
  const byTier: Record<string, number> = {};

  for (const d of _seedResult.discoveries) {
    byCategory[d.category] = (byCategory[d.category] ?? 0) + 1;
    byTier[d.tier] = (byTier[d.tier] ?? 0) + 1;
  }

  return {
    total: _seedResult.totalDiscoveries,
    vault: _seedResult.vaultCount,
    showroom: _seedResult.showroomCount,
    junkyard: _seedResult.junkyardCount,
    memoryStream: _seedResult.memoryStreamCount,
    byCategory,
    byTier,
  };
}

/**
 * Force re-seed (clears cached result). Use with caution.
 */
export function resetQuantumSeed(): void {
  _seedResult = null;
  QUANTUM_VAULT.clear();
  QUANTUM_MEMORY_STREAM_POOL.length = 0;
}
