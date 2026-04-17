/**
 * CMPSBL® Inventory Layers — Aggregator
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 13 specialty Crown Jewel Layers (Ranks 21–33) across the substrate's
 * advanced suites. Each is a standalone CmpsblLayerDefinition with full
 * TS + PY source blocks; the polyglot engine auto-renders all 9 shipping
 * languages with no per-layer branching.
 *
 *   Rank 21 · LLM Defense Suite              (RAMPART · VERITAS · TETHER · FULCRUM)
 *   Rank 22 · Cyber Perimeter Suite          (WATCHTOWER · AEGIS · BASTION · CIPHER)
 *   Rank 23 · Quantum Simulation Suite       (HADRON · QUBIT · ENTANGLE · LATTICE)
 *   Rank 24 · Robotics Control Suite         (FABRICATOR · SERVO · TENSOR · LIDAR)
 *   Rank 25 · Agency Orchestration Suite     (CONDUCTOR · ROSTER · LEDGER · BEACON)
 *   Rank 26 · Topological Security Suite     (KNOT · MANIFOLD · GEODESIC · BOUNDARY)
 *   Rank 27 · Layered Observability Suite    (PULSE · SPECTRUM · HORIZON · ORACLE)
 *   Rank 28 · Holographic Integration Suite  (PRISM · MIRROR · WEAVE · RESONATE)
 *   Rank 29 · Memory Compression Suite       (COMPACTOR · DEDUPE · CHUNKER · INDEX)
 *   Rank 30 · Federated Learning Suite       (GRADIENT · AGGREGATE · CLIP · DRIFT)
 *   Rank 31 · Edge Compute Suite             (SHARD · CACHE · BACKHAUL · GEOFENCE)
 *   Rank 32 · Stream Processing Suite        (TAP · WINDOW · JOIN · SINK)
 *   Rank 33 · Polyglot Lex Suite             (TOKEN · GRAMMAR · TRANSPILE · DIALECT)
 */
import type { CmpsblLayerDefinition } from '../types';

import { LLM_DEFENSE_SUITE_LAYER } from './llm-defense-suite.layer';
import { CYBER_PERIMETER_SUITE_LAYER } from './cyber-perimeter-suite.layer';
import { QUANTUM_SIMULATION_SUITE_LAYER } from './quantum-simulation-suite.layer';
import { ROBOTICS_CONTROL_SUITE_LAYER } from './robotics-control-suite.layer';
import { AGENCY_ORCHESTRATION_SUITE_LAYER } from './agency-orchestration-suite.layer';
import { TOPOLOGICAL_SECURITY_SUITE_LAYER } from './topological-security-suite.layer';
import { LAYERED_OBSERVABILITY_SUITE_LAYER } from './layered-observability-suite.layer';
import { HOLOGRAPHIC_INTEGRATION_SUITE_LAYER } from './holographic-integration-suite.layer';
import { MEMORY_COMPRESSION_SUITE_LAYER } from './memory-compression-suite.layer';
import { FEDERATED_LEARNING_SUITE_LAYER } from './federated-learning-suite.layer';
import { EDGE_COMPUTE_SUITE_LAYER } from './edge-compute-suite.layer';
import { STREAM_PROCESSING_SUITE_LAYER } from './stream-processing-suite.layer';
import { POLYGLOT_LEX_SUITE_LAYER } from './polyglot-lex-suite.layer';

export const INVENTORY_LAYERS: readonly CmpsblLayerDefinition[] = Object.freeze([
  LLM_DEFENSE_SUITE_LAYER,
  CYBER_PERIMETER_SUITE_LAYER,
  QUANTUM_SIMULATION_SUITE_LAYER,
  ROBOTICS_CONTROL_SUITE_LAYER,
  AGENCY_ORCHESTRATION_SUITE_LAYER,
  TOPOLOGICAL_SECURITY_SUITE_LAYER,
  LAYERED_OBSERVABILITY_SUITE_LAYER,
  HOLOGRAPHIC_INTEGRATION_SUITE_LAYER,
  MEMORY_COMPRESSION_SUITE_LAYER,
  FEDERATED_LEARNING_SUITE_LAYER,
  EDGE_COMPUTE_SUITE_LAYER,
  STREAM_PROCESSING_SUITE_LAYER,
  POLYGLOT_LEX_SUITE_LAYER,
]);
