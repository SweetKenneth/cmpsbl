/**
 * CMPSBL® Inventory Layers — Aggregator
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Canonical 25-layer roster surfaced in the /store grid and Ascension V2
 * Enhance step. Every entry is a standalone CmpsblLayerDefinition; the
 * polyglot engine auto-renders all shipping languages with no per-layer
 * branching.
 *
 *   Defense & Security        — LLM Defense · Cyber Perimeter · Privacy · Topological · Honeypot
 *   Observability & Audit     — Layered Obs · Compliance Audit · Spectral · Conscience · Self-Healing Scanner
 *   Synthesis & Evolution     — Adaptive Forge · Symbolic · Sentinel · Reflex · Behavioral Biometrics
 *   Integration & Contracts   — Holographic · Emergent · Synthetic · Localization · Neural Broker
 *   Specialty Suite           — Multi-Model Consensus · Data Sovereignty · Adversarial Wargame
 *
 * Files registered in this index = files included in INVENTORY_LAYERS.
 * Anything outside this list is intentionally absent from the bundle.
 */
import type { CmpsblLayerDefinition } from '../types';

// ── Defense & Security (5) ─────────────────────────────────────────────────
import { LLM_DEFENSE_SUITE_LAYER } from './llm-defense-suite.layer';
import { CYBER_PERIMETER_SUITE_LAYER } from './cyber-perimeter-suite.layer';
import { PRIVACY_OBFUSCATION_LAYER } from './privacy-obfuscation.layer';
import { TOPOLOGICAL_SECURITY_SUITE_LAYER } from './topological-security-suite.layer';
import { HONEYPOT_INTELLIGENCE_LAYER } from './honeypot-intelligence.layer';

// ── Observability & Audit (5) ──────────────────────────────────────────────
import { LAYERED_OBSERVABILITY_SUITE_LAYER } from './layered-observability-suite.layer';
import { COMPLIANCE_AUDIT_LAYER } from './compliance-audit.layer';
import { SPECTRAL_AUDITOR_LAYER } from './spectral-auditor.layer';
import { PROBABILISTIC_CONSCIENCE_LAYER } from './probabilistic-conscience.layer';
import { SELF_HEALING_SCANNER_LAYER } from './self-healing-scanner.layer';

// ── Synthesis & Evolution (5) ──────────────────────────────────────────────
import { ADAPTIVE_FORGE_LAYER } from './adaptive-forge.layer';
import { SYMBOLIC_CRAFTER_LAYER } from './symbolic-crafter.layer';
import { SENTINEL_EVOLUTION_LAYER } from './sentinel-evolution.layer';
import { REFLEX_ORCHESTRATION_LAYER } from './reflex-orchestration.layer';
import { BEHAVIORAL_BIOMETRICS_LAYER } from './behavioral-biometrics.layer';

// ── Integration & Contracts (5) ────────────────────────────────────────────
import { HOLOGRAPHIC_INTEGRATION_SUITE_LAYER } from './holographic-integration-suite.layer';
import { EMERGENT_GATEWAY_LAYER } from './emergent-gateway.layer';
import { SYNTHETIC_CONTRACTS_LAYER } from './synthetic-contracts.layer';
import { LOCALIZATION_MESH_LAYER } from './localization-mesh.layer';
import { NEURAL_BROKER_LAYER } from './neural-broker.layer';

// ── Specialty Suite (5) ────────────────────────────────────────────────────
import { MULTI_MODEL_CONSENSUS_LAYER } from './multi-model-consensus.layer';
import { DATA_SOVEREIGNTY_PARTITIONER_LAYER } from './data-sovereignty-partitioner.layer';
import { ADVERSARIAL_WARGAME_LAYER } from './adversarial-wargame.layer';

export const INVENTORY_LAYERS: readonly CmpsblLayerDefinition[] = Object.freeze([
  // Defense & Security
  LLM_DEFENSE_SUITE_LAYER,
  CYBER_PERIMETER_SUITE_LAYER,
  PRIVACY_OBFUSCATION_LAYER,
  TOPOLOGICAL_SECURITY_SUITE_LAYER,
  HONEYPOT_INTELLIGENCE_LAYER,
  // Observability & Audit
  LAYERED_OBSERVABILITY_SUITE_LAYER,
  COMPLIANCE_AUDIT_LAYER,
  SPECTRAL_AUDITOR_LAYER,
  PROBABILISTIC_CONSCIENCE_LAYER,
  SELF_HEALING_SCANNER_LAYER,
  // Synthesis & Evolution
  ADAPTIVE_FORGE_LAYER,
  SYMBOLIC_CRAFTER_LAYER,
  SENTINEL_EVOLUTION_LAYER,
  REFLEX_ORCHESTRATION_LAYER,
  BEHAVIORAL_BIOMETRICS_LAYER,
  // Integration & Contracts
  HOLOGRAPHIC_INTEGRATION_SUITE_LAYER,
  EMERGENT_GATEWAY_LAYER,
  SYNTHETIC_CONTRACTS_LAYER,
  LOCALIZATION_MESH_LAYER,
  NEURAL_BROKER_LAYER,
  // Specialty Suite
  MULTI_MODEL_CONSENSUS_LAYER,
  DATA_SOVEREIGNTY_PARTITIONER_LAYER,
  ADVERSARIAL_WARGAME_LAYER,
]);
