/**
 * CMPSBL® Inventory Layers — Aggregator
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Canonical 25-layer roster mirroring the /store grid. Every entry is a
 * standalone CmpsblLayerDefinition with full TS + PY source blocks; the
 * polyglot engine auto-renders all 9 shipping languages with no per-layer
 * branching.
 *
 *   Defense / Privacy / Identity / Geo / Quantum / Robotics / Agency
 *   Defense & Security        — Topological · Spectral · Compliance · Conscience · Observability
 *   Synthesis & Evolution     — Self-Healing · Symbolic · Sentinel · Adaptive · Kinetic · Reflex · Resilient
 *   Integration & Contracts   — Holographic · Emergent · Synthetic · Localization · Neural Broker
 *
 * Files registered in this index = files included in INVENTORY_LAYERS.
 * Anything outside this list is intentionally absent from the bundle.
 */
import type { CmpsblLayerDefinition } from '../types';

// ── Currently registered (8) ────────────────────────────────────────────────
import { LLM_DEFENSE_SUITE_LAYER } from './llm-defense-suite.layer';
import { CYBER_PERIMETER_SUITE_LAYER } from './cyber-perimeter-suite.layer';
import { QUANTUM_SIMULATION_SUITE_LAYER } from './quantum-simulation-suite.layer';
import { ROBOTICS_CONTROL_SUITE_LAYER } from './robotics-control-suite.layer';
import { AGENCY_ORCHESTRATION_SUITE_LAYER } from './agency-orchestration-suite.layer';
import { TOPOLOGICAL_SECURITY_SUITE_LAYER } from './topological-security-suite.layer';
import { LAYERED_OBSERVABILITY_SUITE_LAYER } from './layered-observability-suite.layer';
import { HOLOGRAPHIC_INTEGRATION_SUITE_LAYER } from './holographic-integration-suite.layer';

// ── Batch A · Privacy / Identity / Geo / Audit / Conscience (6) ─────────────
import { PRIVACY_OBFUSCATION_LAYER } from './privacy-obfuscation.layer';
import { ZERO_TRUST_IDENTITY_LAYER } from './zero-trust-identity.layer';
import { GEOSPATIAL_INTELLIGENCE_LAYER } from './geospatial-intelligence.layer';
import { SPECTRAL_AUDITOR_LAYER } from './spectral-auditor.layer';
import { COMPLIANCE_AUDIT_LAYER } from './compliance-audit.layer';
import { PROBABILISTIC_CONSCIENCE_LAYER } from './probabilistic-conscience.layer';

// ── Batch B · Synthesis & Evolution (6) ─────────────────────────────────────
import { SELF_HEALING_SCANNER_LAYER } from './self-healing-scanner.layer';
import { SYMBOLIC_CRAFTER_LAYER } from './symbolic-crafter.layer';
import { SENTINEL_EVOLUTION_LAYER } from './sentinel-evolution.layer';
import { ADAPTIVE_FORGE_LAYER } from './adaptive-forge.layer';
import { KINETIC_SYNTHESIS_LAYER } from './kinetic-synthesis.layer';
import { REFLEX_ORCHESTRATION_LAYER } from './reflex-orchestration.layer';

// ── Batch C pending (5 layers) — registered in turn 3 ───────────────────────
// Resilient Evolution · Emergent Gateway · Synthetic Contracts
// Localization Mesh · Neural Broker

export const INVENTORY_LAYERS: readonly CmpsblLayerDefinition[] = Object.freeze([
  // Existing 8
  LLM_DEFENSE_SUITE_LAYER,
  CYBER_PERIMETER_SUITE_LAYER,
  QUANTUM_SIMULATION_SUITE_LAYER,
  ROBOTICS_CONTROL_SUITE_LAYER,
  AGENCY_ORCHESTRATION_SUITE_LAYER,
  TOPOLOGICAL_SECURITY_SUITE_LAYER,
  LAYERED_OBSERVABILITY_SUITE_LAYER,
  HOLOGRAPHIC_INTEGRATION_SUITE_LAYER,
  // Batch A (6)
  PRIVACY_OBFUSCATION_LAYER,
  ZERO_TRUST_IDENTITY_LAYER,
  GEOSPATIAL_INTELLIGENCE_LAYER,
  SPECTRAL_AUDITOR_LAYER,
  COMPLIANCE_AUDIT_LAYER,
  PROBABILISTIC_CONSCIENCE_LAYER,
  // Batch B (6)
  SELF_HEALING_SCANNER_LAYER,
  SYMBOLIC_CRAFTER_LAYER,
  SENTINEL_EVOLUTION_LAYER,
  ADAPTIVE_FORGE_LAYER,
  KINETIC_SYNTHESIS_LAYER,
  REFLEX_ORCHESTRATION_LAYER,
]);
