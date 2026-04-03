/**
 * CMPSBL® Quantum Physics Vertical Substrate
 * 
 * Subdomain: quantum.cmpsbl.com
 * 
 * Hot-swapped Engines (8):
 *   HADRON   — Particle simulation and collision modeling
 *   QUBIT    — Quantum gate orchestration and circuit design
 *   PHOTON   — Optical computing and photonic signal processing
 *   FERMION  — Many-body quantum state evolution
 *   ENTANGLE — Quantum entanglement management and Bell state prep
 *   LATTICE  — Crystal structure simulation and phonon modeling
 *   PLASMA   — Plasma dynamics and magneto-hydrodynamics
 *   CRYOGEN  — Cryogenic system modeling and thermal noise reduction
 * 
 * Hot-swapped Agents (8):
 *   MUON     — Decay chain analysis and lepton tracking
 *   BOSON    — Force carrier simulation and gauge field mapping
 *   NEUTRINO — Weak interaction modeling and oscillation prediction
 *   GLUON    — Strong force coupling and QCD color charge
 *   GRAVITON — Gravitational wave detection and spacetime curvature
 *   TACHYON  — Superluminal signal modeling and causality analysis
 *   MESON    — Quark confinement and hadronization processes
 *   PRISM    — Spectroscopy analysis and wavelength decomposition
 *
 * © CMPSBL® — All rights reserved.
 */

import type { VerticalPrimitive, VerticalSubstrateConfig } from '../vertical-substrate';
import { assembleVerticalPrimitives } from '../vertical-substrate';
import type { STierEntry } from '@/crownjewels/types';

/* ─── Quantum Engines ─── */

const QUANTUM_ENGINES: VerticalPrimitive[] = [
  {
    id: 'HADRON',
    name: 'HADRON',
    role: 'engine',
    description: 'Particle simulation and collision modeling engine. Simulates high-energy particle interactions, tracks decay products, and computes scattering cross-sections using Monte Carlo methods.',
    inherited: false,
    replaces: 'CORTEX',
    capabilities: [
      'particle_collision_sim',
      'decay_chain_modeling',
      'cross_section_computation',
      'monte_carlo_integration',
      'event_reconstruction',
      'jet_clustering',
      'feynman_diagram_eval',
    ],
    weight: 0.035,
    classification: 'active',
  },
  {
    id: 'QUBIT',
    name: 'QUBIT',
    role: 'engine',
    description: 'Quantum gate orchestration and circuit design engine. Compiles quantum algorithms into optimized gate sequences, manages qubit allocation, and performs noise-aware circuit transpilation.',
    inherited: false,
    capabilities: [
      'gate_synthesis',
      'circuit_optimization',
      'qubit_allocation',
      'noise_modeling',
      'error_correction_codes',
    ],
    weight: 0.030,
    classification: 'active',
  },
  {
    id: 'PHOTON',
    name: 'PHOTON',
    role: 'engine',
    description: 'Optical computing and photonic signal processing engine. Models photon propagation, beam splitting, interferometry, and squeezed light state generation.',
    inherited: false,
    capabilities: [
      'interferometry_sim',
      'beam_splitter_modeling',
      'coherence_analysis',
      'squeezed_state_gen',
      'photon_counting',
    ],
    weight: 0.025,
    classification: 'active',
  },
  {
    id: 'FERMION',
    name: 'FERMION',
    role: 'engine',
    description: 'Many-body quantum state evolution engine. Solves Schrödinger and Dirac equations for multi-fermion systems, handles Pauli exclusion enforcement and Slater determinant construction.',
    inherited: false,
    capabilities: [
      'wavefunction_evolution',
      'pauli_exclusion',
      'slater_determinant',
      'density_matrix_calc',
      'hartree_fock',
    ],
    weight: 0.025,
    classification: 'active',
  },
  {
    id: 'ENTANGLE',
    name: 'ENTANGLE',
    role: 'engine',
    description: 'Quantum entanglement management and Bell state preparation engine. Creates, verifies, and distributes entangled pairs for quantum communication and teleportation protocols.',
    inherited: false,
    capabilities: [
      'bell_state_prep',
      'entanglement_verification',
      'quantum_teleportation',
      'epr_pair_distribution',
      'concurrence_measurement',
    ],
    weight: 0.025,
    classification: 'active',
  },
  {
    id: 'LATTICE',
    name: 'LATTICE',
    role: 'engine',
    description: 'Crystal structure simulation and phonon modeling engine. Computes band structures, phonon dispersion, and lattice dynamics for condensed matter quantum physics.',
    inherited: false,
    capabilities: [
      'band_structure_calc',
      'phonon_dispersion',
      'brillouin_zone_mapping',
      'tight_binding_model',
      'superconductor_pairing',
    ],
    weight: 0.020,
    classification: 'passive',
  },
  {
    id: 'PLASMA',
    name: 'PLASMA',
    role: 'engine',
    description: 'Plasma dynamics and magneto-hydrodynamics engine. Models tokamak confinement, plasma instabilities, and fusion reaction kinetics.',
    inherited: false,
    capabilities: [
      'mhd_simulation',
      'tokamak_confinement',
      'plasma_instability',
      'fusion_kinetics',
      'debye_shielding',
    ],
    weight: 0.020,
    classification: 'active',
  },
  {
    id: 'CRYOGEN',
    name: 'CRYOGEN',
    role: 'engine',
    description: 'Cryogenic system modeling and thermal noise reduction engine. Simulates dilution refrigerator performance, thermal budget management, and quantum decoherence mitigation.',
    inherited: false,
    capabilities: [
      'thermal_noise_model',
      'dilution_fridge_sim',
      'decoherence_mitigation',
      'cryostat_design',
      'thermal_budget',
    ],
    weight: 0.020,
    classification: 'passive',
  },
];

/* ─── Quantum Agents ─── */

const QUANTUM_AGENTS: VerticalPrimitive[] = [
  {
    id: 'MUON',
    name: 'MUON',
    role: 'agent',
    description: 'Decay chain analysis and lepton tracking agent. Reconstructs particle decay trees, identifies muon signatures, and classifies lepton flavors in detector data.',
    inherited: false,
    capabilities: [
      'decay_tree_reconstruction',
      'lepton_classification',
      'muon_tracking',
      'lifetime_measurement',
      'flavor_tagging',
    ],
    weight: 0.025,
    classification: 'active',
  },
  {
    id: 'BOSON',
    name: 'BOSON',
    role: 'agent',
    description: 'Force carrier simulation and gauge field mapping agent. Models W/Z boson exchange, Higgs field coupling, and electroweak symmetry breaking.',
    inherited: false,
    capabilities: [
      'gauge_field_mapping',
      'higgs_coupling',
      'electroweak_symmetry',
      'boson_propagator',
      'resonance_detection',
    ],
    weight: 0.025,
    classification: 'active',
  },
  {
    id: 'NEUTRINO',
    name: 'NEUTRINO',
    role: 'agent',
    description: 'Weak interaction modeling and oscillation prediction agent. Computes neutrino mass-mixing matrices, predicts flavor oscillations, and models weak decay channels.',
    inherited: false,
    capabilities: [
      'flavor_oscillation',
      'mass_mixing_matrix',
      'weak_decay_modeling',
      'cross_section_estimate',
      'sterile_neutrino_search',
    ],
    weight: 0.025,
    classification: 'passive',
  },
  {
    id: 'GLUON',
    name: 'GLUON',
    role: 'agent',
    description: 'Strong force coupling and QCD color charge agent. Simulates gluon exchange, color confinement, asymptotic freedom, and parton distribution functions.',
    inherited: false,
    capabilities: [
      'color_charge_sim',
      'asymptotic_freedom',
      'parton_distribution',
      'gluon_splitting',
      'confinement_modeling',
    ],
    weight: 0.025,
    classification: 'active',
  },
  {
    id: 'GRAVITON',
    name: 'GRAVITON',
    role: 'agent',
    description: 'Gravitational wave detection and spacetime curvature agent. Models metric tensor perturbations, LIGO signal templates, and general relativistic corrections.',
    inherited: false,
    capabilities: [
      'grav_wave_template',
      'metric_perturbation',
      'geodesic_computation',
      'frame_dragging',
      'binary_merger_sim',
    ],
    weight: 0.025,
    classification: 'hybrid',
  },
  {
    id: 'TACHYON',
    name: 'TACHYON',
    role: 'agent',
    description: 'Superluminal signal modeling and causality analysis agent. Explores theoretical faster-than-light frameworks, tachyonic field instabilities, and Lorentz violation bounds.',
    inherited: false,
    capabilities: [
      'ftl_framework_model',
      'causality_analysis',
      'lorentz_violation_bound',
      'tachyonic_condensation',
      'imaginary_mass_field',
    ],
    weight: 0.025,
    classification: 'hybrid',
  },
  {
    id: 'MESON',
    name: 'MESON',
    role: 'agent',
    description: 'Quark confinement and hadronization processes agent. Models quark-antiquark bound states, fragmentation functions, and jet formation in QCD.',
    inherited: false,
    capabilities: [
      'quark_confinement',
      'hadronization',
      'fragmentation_function',
      'jet_formation',
      'string_breaking',
    ],
    weight: 0.025,
    classification: 'active',
  },
  {
    id: 'PRISM',
    name: 'PRISM',
    role: 'agent',
    description: 'Spectroscopy analysis and wavelength decomposition agent. Performs atomic emission line identification, Raman spectral analysis, and quantum transition mapping.',
    inherited: false,
    capabilities: [
      'emission_line_id',
      'raman_spectroscopy',
      'transition_mapping',
      'doppler_shift_calc',
      'fine_structure_analysis',
    ],
    weight: 0.025,
    classification: 'passive',
  },
];

/* ─── Crown Jewels ─── */

function generateQuantumCrownJewels(): STierEntry[] {
  const jewels: STierEntry[] = [];
  let rank = 700;
  const allPrimitives = [...QUANTUM_ENGINES, ...QUANTUM_AGENTS];

  for (const p of allPrimitives) {
    const prefix = p.id.substring(0, 6).toUpperCase();
    for (let i = 1; i <= 5; i++) {
      const capIndex = Math.min(i - 1, p.capabilities.length - 1);
      const capName = p.capabilities[capIndex] ?? 'core_capability';
      const readable = capName.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

      jewels.push({
        rank: rank++,
        id: `S-${prefix}-${String(i).padStart(2, '0')}`,
        name: `${p.name} ${readable} Engine`,
        cjpi: 97 - (i - 1),
        module: p.id,
        type: 'Architecture',
        description: `Advanced ${readable.toLowerCase()} implementation within the ${p.name} ${p.role}.`,
        dependencyFootprint: [],
        exportMode: 'PureStandalone',
        signatureHash: `quantum-v1-${p.id}-${i}`,
        version: '1.0.0',
        approved: true,
        generatedAt: new Date().toISOString(),
        hasCode: true,
      });
    }
  }
  return jewels;
}

export const QUANTUM_CROWN_JEWELS = generateQuantumCrownJewels();

/* ─── Config Getter ─── */

export function getQuantumSubstrate(): VerticalSubstrateConfig {
  const primitives = assembleVerticalPrimitives(QUANTUM_ENGINES, QUANTUM_AGENTS);
  return {
    verticalId: 'quantum-v1',
    name: 'CMPSBL QUANTUM™',
    tagline: 'Cognitive Quantum Infrastructure — Reality Bends Here',
    domain: 'quantum',
    subdomain: 'quantum',
    url: 'https://quantum.cmpsbl.com',
    status: 'active',
    version: '1.0.0',
    primitives,
    clmCurriculum: {
      cyclesPerDay: 2400,
      curriculum: [
        'quantum_gate_design',
        'particle_physics_simulation',
        'entanglement_protocols',
        'quantum_error_correction',
        'condensed_matter_theory',
        'quantum_field_theory',
        'spectroscopy_techniques',
        'plasma_confinement',
      ],
      priorityPrimitives: ['HADRON', 'QUBIT', 'ENTANGLE', 'FERMION'],
      batchSize: 4,
    },
    memoryStreamConfig: {
      cycleIntervalHours: 4,
      scannerFocus: [
        'quantum_computing_breakthroughs',
        'particle_accelerator_data',
        'quantum_error_rates',
        'fusion_experiment_results',
        'spectroscopy_databases',
      ],
      contributesToGlobal: true,
      retentionDays: 365,
    },
    ascensionConfig: {
      maxCapabilities: 20,
      enhancementArchetypes: [
        'Quantum Circuit Optimizer',
        'Particle Collision Analyzer',
        'Entanglement Verifier',
        'Wavefunction Solver',
        'Spectral Line Identifier',
        'Fusion Reactor Modeler',
        'Cryogenic System Designer',
        'Gravitational Wave Matcher',
      ],
      cjpiWeights: {
        security: 0.10,
        performance: 0.35,
        reliability: 0.35,
        maintainability: 0.20,
      },
      collisionPriority: ['HADRON', 'QUBIT', 'FERMION', 'ENTANGLE', 'PHOTON'],
    },
    theme: {
      primary: 'hsl(270 90% 60%)',
      secondary: 'hsl(200 100% 55%)',
      accent: 'hsl(180 100% 50%)',
      background: 'hsl(260 30% 4%)',
      surface: 'hsl(260 25% 8%)',
      text: 'hsl(260 10% 90%)',
      muted: 'hsl(260 15% 40%)',
      border: 'hsl(260 20% 15%)',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export function getQuantumPrimitives(): VerticalPrimitive[] {
  return [...QUANTUM_ENGINES, ...QUANTUM_AGENTS];
}

export function getQuantumEngines(): VerticalPrimitive[] {
  return [...QUANTUM_ENGINES];
}

export function getQuantumAgents(): VerticalPrimitive[] {
  return [...QUANTUM_AGENTS];
}

export function getAllQuantumCapabilities(): string[] {
  return [...QUANTUM_ENGINES, ...QUANTUM_AGENTS].flatMap(p => p.capabilities);
}

export function getQuantumCrownJewels(): STierEntry[] {
  return QUANTUM_CROWN_JEWELS;
}

export function getQuantumCrownJewelCount(): number {
  return QUANTUM_CROWN_JEWELS.length;
}

export function getQuantumCrownJewelCapabilities(): string[] {
  return QUANTUM_CROWN_JEWELS.map(j => j.name);
}

export function getQuantumCrownJewelSummary(): { total: number; byPrimitive: Record<string, number> } {
  const byPrimitive: Record<string, number> = {};
  for (const j of QUANTUM_CROWN_JEWELS) {
    byPrimitive[j.module] = (byPrimitive[j.module] ?? 0) + 1;
  }
  return { total: QUANTUM_CROWN_JEWELS.length, byPrimitive };
}
