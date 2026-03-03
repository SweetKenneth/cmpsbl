/**
 * Matrix Node Registry — Read-Only Abstraction Layer
 * 37-Node Field-Based Topology
 * 
 * Topology:
 *   Shell: DEFENSE (outer containment boundary)
 *   Plane: GOVERNANCE (supervisory blanket)
 *   Fields: EVOLUTION, IMMUNITY, INTENT (system-wide transformation fabric)
 *   Spine: CORE → SYSTEM → CCR → Modules → RESOLVERS
 *   Grid: OCG (Operational Compliance Grid — boundary enforcement)
 *   Branch: CLM (lateral intelligence)
 *   ESZ: Expansion Sovereignty Zone (SOVEREIGN, ORACLE, CONSCIENCE, TREATY)
 *   EPZ: Expansion Perception Zone (COMPASS, ECHO, REFLEX)
 *   EMZ: Expansion Manufacturing Zone (FORGE, LINGUA, PHANTOM, HARVEST)
 * 
 * Integrity Equation:
 *   matrixIntegrity = Σ(node.health × node.weight)
 *   where sum(node.weight) === 1.0
 * 
 * Breaker Behavior (read-only reflection):
 *   if breakerState === 'open': node.health = 0
 *   if breakerState === 'half-open': node.health = min(node.health, 50)
 */

import type { SubstrateModuleName } from './index';

// ============ Types ============

export type MatrixSector =
  | 'core' | 'system' | 'ccr' | 'ocg'
  | 'execution' | 'field' | 'plane' | 'shell'
  | 'esz' | 'epz' | 'emz';

export type BreakerState = 'closed' | 'half-open' | 'open' | 'rerouting';

export interface MatrixNode {
  id: SubstrateModuleName;
  label: string;
  sector: MatrixSector;
  weight: number;
  health: number; // 0-100, after breaker adjustment
  rawHealth: number; // Original health before breaker adjustment
  breakerState: BreakerState;
  failureCount: number;
  lastRecovery: string | null;
  description: string;
}

export interface MatrixIntegrityReport {
  /** Operational integrity = Σ(node.health × node.weight) */
  operational: number;
  /** Structural integrity = breaker coherence + registry parity */
  structural: number;
  /** Combined label */
  status: 'MATRIX STABLE' | 'MATRIX DEGRADED' | 'CRITICAL';
  /** Whether CRITICAL banner should show */
  isCritical: boolean;
  /** Per-sector breakdown */
  sectors: Record<MatrixSector, { health: number; nodeCount: number; weight: number }>;
  /** Total weight (should === 1.0) */
  totalWeight: number;
  /** Node count */
  nodeCount: number;
  /** Timestamp */
  timestamp: string;
}

// ============ Node Definitions ============

/** 
 * Weight distribution across 37 Matrix Nodes, normalized to 1.0.
 * 
 * Topology weights:
 *   CORE (Kernel)        = 0.120 (12%)
 *   SYSTEM (Standalone)  = 0.040 (4%)
 *   CCR (3 zones)        = 0.120 (12%)  — BRAIN, MEMORY, DREAM
 *   OCG (5 zones)        = 0.150 (15%)  — RIPPLE, ACCESS, IDENTITY, RELAY, AUDIT
 *   Execution (11 nodes) = 0.250 (25%)  — DECODE..INTEGRATION
 *   ESZ (4 nodes)        = 0.080 (8%)   — SOVEREIGN, ORACLE, CONSCIENCE, TREATY
 *   EPZ (3 nodes)        = 0.060 (6%)   — COMPASS, ECHO, REFLEX
 *   EMZ (4 nodes)        = 0.060 (6%)   — FORGE, LINGUA, PHANTOM, HARVEST
 *   Fields (3 nodes)     = 0.060 (6%)
 *   Plane (1 node)       = 0.030 (3%)
 *   Shell (1 node)       = 0.030 (3%)
 *   ─────────────────────────────────
 *   Total                = 1.000 (100%)
 */
const NODE_DEFINITIONS: Omit<MatrixNode, 'health' | 'rawHealth' | 'breakerState' | 'failureCount' | 'lastRecovery'>[] = [
  // ─── CORE — Kernel (Spine root) ────────────────────────────────
  { id: 'core', label: 'CORE', sector: 'core', weight: 0.120, description: 'Kernel orchestration & boot authority' },

  // ─── SYSTEM — Standalone layer ─────────────────────────────────
  { id: 'system', label: 'SYSTEM', sector: 'system', weight: 0.040, description: 'Lifecycle management, configuration, diagnostics' },

  // ─── CCR — Cognitive Core Reality (3 zones, 0.12 total) ────────
  { id: 'brain', label: 'BRAIN', sector: 'ccr', weight: 0.040, description: 'Reasoning & cognition zone' },
  { id: 'memory', label: 'MEMORY', sector: 'ccr', weight: 0.040, description: 'Tiered memory storage zone' },
  { id: 'dream', label: 'DREAM', sector: 'ccr', weight: 0.040, description: 'Dream synthesis zone' },

  // ─── OCG — Operational Compliance Grid (5 nodes, 0.15 total) ───
  { id: 'ripple', label: 'RIPPLE', sector: 'ocg', weight: 0.030, description: 'Signal & event bus' },
  { id: 'access', label: 'ACCESS', sector: 'ocg', weight: 0.030, description: 'Entitlements & API keys' },
  { id: 'identity', label: 'IDENTITY', sector: 'ocg', weight: 0.030, description: 'Session & role management' },
  { id: 'relay', label: 'RELAY', sector: 'ocg', weight: 0.030, description: 'Webhook dispatch' },
  { id: 'audit', label: 'AUDIT', sector: 'ocg', weight: 0.030, description: 'Integrity ledger' },

  // ─── Execution Sector (11 nodes, 0.25 total) ───────────────────
  { id: 'decode', label: 'DECODE', sector: 'execution', weight: 0.023, description: 'Epistemic interpreter' },
  { id: 'encode', label: 'ENCODE', sector: 'execution', weight: 0.023, description: 'Code generation pipeline' },
  { id: 'vision', label: 'VISION', sector: 'execution', weight: 0.023, description: 'Observability & telemetry' },
  { id: 'cortex', label: 'CORTEX', sector: 'execution', weight: 0.023, description: 'Autonomous orchestrator' },
  { id: 'nexus', label: 'NEXUS', sector: 'execution', weight: 0.023, description: 'AI provider routing' },
  { id: 'economy', label: 'ECONOMY', sector: 'execution', weight: 0.022, description: 'Metering & billing' },
  { id: 'sandbox', label: 'SANDBOX', sector: 'execution', weight: 0.022, description: 'Isolated execution' },
  { id: 'inclusive', label: 'INCLUSIVE', sector: 'execution', weight: 0.022, description: 'WCAG compatibility' },
  { id: 'medic', label: 'MEDIC', sector: 'execution', weight: 0.023, description: 'Autonomous diagnostics & self-repair' },
  { id: 'nerve', label: 'NERVE', sector: 'execution', weight: 0.023, description: 'Inter-node signaling & consensus repair' },
  { id: 'integration', label: 'INTEGRATION', sector: 'execution', weight: 0.023, description: 'Dependency resolver (boots last)' },

  // ─── ESZ — Expansion Sovereignty Zone (4 nodes, 0.08 total) ────
  { id: 'sovereign', label: 'SOVEREIGN', sector: 'esz', weight: 0.020, description: 'Data sovereignty & jurisdictional compliance' },
  { id: 'oracle', label: 'ORACLE', sector: 'esz', weight: 0.020, description: 'Predictive modeling & probabilistic reasoning' },
  { id: 'conscience', label: 'CONSCIENCE', sector: 'esz', weight: 0.020, description: 'Ethical assessment & bias detection' },
  { id: 'treaty', label: 'TREATY', sector: 'esz', weight: 0.020, description: 'Contract negotiation & SLA enforcement' },

  // ─── EPZ — Expansion Perception Zone (3 nodes, 0.06 total) ─────
  { id: 'compass', label: 'COMPASS', sector: 'epz', weight: 0.020, description: 'Geospatial analysis & navigation' },
  { id: 'echo', label: 'ECHO', sector: 'epz', weight: 0.020, description: 'Digital twin simulation & replay' },
  { id: 'reflex', label: 'REFLEX', sector: 'epz', weight: 0.020, description: 'Edge computing orchestration' },

  // ─── EMZ — Expansion Manufacturing Zone (4 nodes, 0.06 total) ──
  { id: 'forge', label: 'FORGE', sector: 'emz', weight: 0.015, description: 'Artifact synthesis & manufacturing' },
  { id: 'lingua', label: 'LINGUA', sector: 'emz', weight: 0.015, description: 'Translation & localization' },
  { id: 'phantom', label: 'PHANTOM', sector: 'emz', weight: 0.015, description: 'Privacy protection & anonymization' },
  { id: 'harvest', label: 'HARVEST', sector: 'emz', weight: 0.015, description: 'Data acquisition & ETL pipelines' },

  // ─── Fields — System-wide transformation fabric ────────────────
  { id: 'evolution', label: 'EVOLUTION', sector: 'field', weight: 0.020, description: 'Evolution lifecycle field' },
  { id: 'immunity', label: 'IMMUNITY', sector: 'field', weight: 0.020, description: 'Resilience field' },
  { id: 'intent', label: 'INTENT', sector: 'field', weight: 0.020, description: 'Capability discovery field' },

  // ─── Plane — Supervisory blanket ───────────────────────────────
  { id: 'governance', label: 'GOVERNANCE', sector: 'plane', weight: 0.030, description: 'Policy enforcement overlay plane' },

  // ─── Shell — Outer containment boundary ────────────────────────
  { id: 'defense', label: 'DEFENSE', sector: 'shell', weight: 0.030, description: 'Outer containment shell' },
];

// Validate total weight === 1.0
const TOTAL_WEIGHT = NODE_DEFINITIONS.reduce((sum, n) => sum + n.weight, 0);
if (Math.abs(TOTAL_WEIGHT - 1.0) > 0.01) {
  console.warn(`[MatrixNodeRegistry] Weight sum is ${TOTAL_WEIGHT.toFixed(4)}, expected 1.0`);
}

// In-memory breaker states (read from substrate, never mutated directly)
const breakerStates = new Map<SubstrateModuleName, { state: BreakerState; failures: number; lastRecovery: string | null }>();

// ============ Public API ============

export function getNodeDefinitions() {
  return NODE_DEFINITIONS;
}

export function getNodeDefinition(id: SubstrateModuleName) {
  return NODE_DEFINITIONS.find(n => n.id === id) || null;
}

export function getNodesBySector(sector: MatrixSector) {
  return NODE_DEFINITIONS.filter(n => n.sector === sector);
}

export const SECTOR_LABELS: Record<MatrixSector, string> = {
  core: 'CORE Kernel',
  system: 'SYSTEM Layer',
  ccr: 'CCR (Cognitive Core Reality)',
  ocg: 'OCG (Operational Compliance Grid)',
  execution: 'Execution Sector',
  esz: 'ESZ (Expansion Sovereignty Zone)',
  epz: 'EPZ (Expansion Perception Zone)',
  emz: 'EMZ (Expansion Manufacturing Zone)',
  field: 'Fields (Transformation Fabric)',
  plane: 'Overlay Plane (Supervision)',
  shell: 'DEFENSE Shell (Containment)',
};

export function updateBreakerState(
  id: SubstrateModuleName,
  state: BreakerState,
  failures: number = 0
): void {
  const existing = breakerStates.get(id);
  breakerStates.set(id, {
    state,
    failures,
    lastRecovery: state === 'closed' && existing?.state !== 'closed'
      ? new Date().toISOString()
      : existing?.lastRecovery || null,
  });
}

export function getBreakerState(id: SubstrateModuleName): { state: BreakerState; failures: number; lastRecovery: string | null } {
  return breakerStates.get(id) || { state: 'closed', failures: 0, lastRecovery: null };
}

function applyBreakerAdjustment(rawHealth: number, breakerState: BreakerState): number {
  switch (breakerState) {
    case 'open': return 0;
    case 'half-open': return Math.min(rawHealth, 50);
    case 'rerouting': return Math.min(rawHealth, 85);
    case 'closed': return rawHealth;
    default: return rawHealth;
  }
}

export function buildMatrixNodes(healthData: Record<string, boolean | number>): MatrixNode[] {
  return NODE_DEFINITIONS.map(def => {
    const raw = healthData[def.id];
    const rawHealth = typeof raw === 'number' ? raw : (raw === false ? 0 : 100);
    const breaker = getBreakerState(def.id);
    const health = applyBreakerAdjustment(rawHealth, breaker.state);

    return {
      ...def,
      rawHealth,
      health,
      breakerState: breaker.state,
      failureCount: breaker.failures,
      lastRecovery: breaker.lastRecovery,
    };
  });
}

export function calculateIntegrity(nodes: MatrixNode[]): MatrixIntegrityReport {
  const operational = Math.round(
    nodes.reduce((sum, n) => sum + n.health * n.weight, 0)
  );

  const closedBreakers = nodes.filter(n => n.breakerState === 'closed').length;
  const breakerCoherence = Math.round((closedBreakers / nodes.length) * 100);
  const weightSum = nodes.reduce((s, n) => s + n.weight, 0);
  const weightCoherence = Math.abs(weightSum - 1.0) < 0.01 ? 100 : Math.max(0, 100 - Math.abs(weightSum - 1.0) * 1000);
  const structural = Math.round((breakerCoherence * 0.7 + weightCoherence * 0.3));

  const coreNode = nodes.find(n => n.id === 'core');
  const isCritical = operational < 40 || coreNode?.breakerState === 'open';

  const status: MatrixIntegrityReport['status'] = isCritical
    ? 'CRITICAL'
    : operational < 80
      ? 'MATRIX DEGRADED'
      : 'MATRIX STABLE';

  const allSectors: MatrixSector[] = ['core', 'system', 'ccr', 'ocg', 'execution', 'esz', 'epz', 'emz', 'field', 'plane', 'shell'];
  const sectors = {} as Record<MatrixSector, { health: number; nodeCount: number; weight: number }>;
  for (const sector of allSectors) {
    const sectorNodes = nodes.filter(n => n.sector === sector);
    const sectorWeight = sectorNodes.reduce((s, n) => s + n.weight, 0);
    const sectorHealth = sectorNodes.length > 0
      ? Math.round(sectorNodes.reduce((s, n) => s + n.health, 0) / sectorNodes.length)
      : 0;
    sectors[sector] = { health: sectorHealth, nodeCount: sectorNodes.length, weight: sectorWeight };
  }

  return {
    operational,
    structural,
    status,
    isCritical,
    sectors,
    totalWeight: Math.round(weightSum * 1000) / 1000,
    nodeCount: nodes.length,
    timestamp: new Date().toISOString(),
  };
}

export function getIntegrityEquation(): string {
  return 'Matrix Integrity = Σ(node.health × node.weight) where Σ(weight) = 1.0';
}

export function getTotalWeight(): number {
  return Math.round(TOTAL_WEIGHT * 1000) / 1000;
}
