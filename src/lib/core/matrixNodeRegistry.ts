/**
 * Matrix Node Registry — Read-Only Abstraction Layer
 * SPARTA Epoch v11.1 — Weighted integrity model over existing substrate
 * 
 * This registry maps existing substrate entities into Matrix Nodes
 * WITHOUT mutating any core structures, workers, or godfather builds.
 * It assigns sector groupings and per-node weights for deterministic
 * integrity calculation.
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

export type MatrixSector = 'core' | 'ccr' | 'ccl' | 'execution' | 'overlay';

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
 * Weight distribution across 24 Matrix Nodes, normalized to 1.0.
 * Sector weights: CORE=0.20, CCR=0.20, CCL=0.20, Execution=0.25, Overlay=0.15
 */
const NODE_DEFINITIONS: Omit<MatrixNode, 'health' | 'rawHealth' | 'breakerState' | 'failureCount' | 'lastRecovery'>[] = [
  // CORE Sector (1 node, 0.20 total)
  { id: 'core', label: 'CORE', sector: 'core', weight: 0.200, description: 'Kernel orchestration & boot authority' },

  // CCR Sector (4 nodes, 0.20 total = 0.05 each)
  { id: 'system', label: 'SYSTEM', sector: 'ccr', weight: 0.050, description: 'Lifecycle management zone' },
  { id: 'brain', label: 'BRAIN', sector: 'ccr', weight: 0.050, description: 'Reasoning & cognition zone' },
  { id: 'memory', label: 'MEMORY', sector: 'ccr', weight: 0.050, description: 'Tiered memory storage zone' },
  { id: 'dream', label: 'DREAM', sector: 'ccr', weight: 0.050, description: 'Dream synthesis zone' },

  // CCL Sector (5 nodes, 0.20 total = 0.04 each)
  { id: 'ripple', label: 'RIPPLE', sector: 'ccl', weight: 0.040, description: 'Signal & event bus' },
  { id: 'access', label: 'ACCESS', sector: 'ccl', weight: 0.040, description: 'Entitlements & API keys' },
  { id: 'identity', label: 'IDENTITY', sector: 'ccl', weight: 0.040, description: 'Session & role management' },
  { id: 'relay', label: 'RELAY', sector: 'ccl', weight: 0.040, description: 'Webhook dispatch' },
  { id: 'audit', label: 'AUDIT', sector: 'ccl', weight: 0.040, description: 'Integrity ledger' },

  // Execution Sector (9 nodes, 0.25 total ≈ 0.0278 each)
  { id: 'decode', label: 'DECODE', sector: 'execution', weight: 0.028, description: 'Epistemic interpreter' },
  { id: 'encode', label: 'ENCODE', sector: 'execution', weight: 0.028, description: 'Code generation pipeline' },
  { id: 'vision', label: 'VISION', sector: 'execution', weight: 0.028, description: 'Observability & telemetry' },
  { id: 'cortex', label: 'CORTEX', sector: 'execution', weight: 0.028, description: 'Autonomous orchestrator' },
  { id: 'nexus', label: 'NEXUS', sector: 'execution', weight: 0.028, description: 'AI provider routing' },
  { id: 'economy', label: 'ECONOMY', sector: 'execution', weight: 0.027, description: 'Metering & billing' },
  { id: 'sandbox', label: 'SANDBOX', sector: 'execution', weight: 0.027, description: 'Isolated execution' },
  { id: 'inclusive', label: 'INCLUSIVE', sector: 'execution', weight: 0.028, description: 'WCAG compatibility' },
  { id: 'integration', label: 'INTEGRATION', sector: 'execution', weight: 0.028, description: 'Dependency resolver' },

  // Overlay Sector (5 nodes, 0.15 total = 0.03 each)
  { id: 'defense', label: 'DEFENSE', sector: 'overlay', weight: 0.030, description: 'Security perimeter (outermost)' },
  { id: 'immunity', label: 'IMMUNITY', sector: 'overlay', weight: 0.030, description: 'Shadow training mesh' },
  { id: 'evolution', label: 'EVOLUTION', sector: 'overlay', weight: 0.030, description: 'Evolution lifecycle' },
  { id: 'intent', label: 'INTENT', sector: 'overlay', weight: 0.030, description: 'Capability discovery mesh' },
  { id: 'governance', label: 'GOVERNANCE', sector: 'overlay', weight: 0.030, description: 'Policy enforcement (innermost)' },
];

// Validate total weight === 1.0
const TOTAL_WEIGHT = NODE_DEFINITIONS.reduce((sum, n) => sum + n.weight, 0);
if (Math.abs(TOTAL_WEIGHT - 1.0) > 0.01) {
  console.warn(`[MatrixNodeRegistry] Weight sum is ${TOTAL_WEIGHT.toFixed(4)}, expected 1.0`);
}

// In-memory breaker states (read from substrate, never mutated directly)
const breakerStates = new Map<SubstrateModuleName, { state: BreakerState; failures: number; lastRecovery: string | null }>();

// ============ Public API ============

/**
 * Get all Matrix Node definitions (static metadata)
 */
export function getNodeDefinitions() {
  return NODE_DEFINITIONS;
}

/**
 * Get a single node definition
 */
export function getNodeDefinition(id: SubstrateModuleName) {
  return NODE_DEFINITIONS.find(n => n.id === id) || null;
}

/**
 * Get nodes by sector
 */
export function getNodesBySector(sector: MatrixSector) {
  return NODE_DEFINITIONS.filter(n => n.sector === sector);
}

/**
 * Get sector labels
 */
export const SECTOR_LABELS: Record<MatrixSector, string> = {
  core: 'CORE Sector',
  ccr: 'CCR Sector',
  ccl: 'CCL Sector',
  execution: 'Execution Sector',
  overlay: 'Overlay Sector',
};

/**
 * Update breaker state for a node (called from health polling, read-only reflection)
 */
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

/**
 * Get breaker state for a node
 */
export function getBreakerState(id: SubstrateModuleName): { state: BreakerState; failures: number; lastRecovery: string | null } {
  return breakerStates.get(id) || { state: 'closed', failures: 0, lastRecovery: null };
}

/**
 * Apply breaker adjustment to raw health
 */
function applyBreakerAdjustment(rawHealth: number, breakerState: BreakerState): number {
  switch (breakerState) {
    case 'open': return 0;
    case 'half-open': return Math.min(rawHealth, 50);
    case 'rerouting': return Math.min(rawHealth, 85);
    case 'closed': return rawHealth;
    default: return rawHealth;
  }
}

/**
 * Build full Matrix Node array from health data
 */
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

/**
 * Calculate Matrix Integrity Report
 * 
 * Operational = Σ(node.health × node.weight)
 * Structural = breaker coherence + registry parity
 * CRITICAL if operational < 40 OR CORE breaker open
 */
export function calculateIntegrity(nodes: MatrixNode[]): MatrixIntegrityReport {
  // Operational integrity
  const operational = Math.round(
    nodes.reduce((sum, n) => sum + n.health * n.weight, 0)
  );

  // Structural integrity: % of nodes with closed breakers + weight coherence
  const closedBreakers = nodes.filter(n => n.breakerState === 'closed').length;
  const breakerCoherence = Math.round((closedBreakers / nodes.length) * 100);
  const weightSum = nodes.reduce((s, n) => s + n.weight, 0);
  const weightCoherence = Math.abs(weightSum - 1.0) < 0.01 ? 100 : Math.max(0, 100 - Math.abs(weightSum - 1.0) * 1000);
  const structural = Math.round((breakerCoherence * 0.7 + weightCoherence * 0.3));

  // CRITICAL trigger: operational < 40 OR CORE breaker open
  const coreNode = nodes.find(n => n.id === 'core');
  const isCritical = operational < 40 || coreNode?.breakerState === 'open';

  const status: MatrixIntegrityReport['status'] = isCritical
    ? 'CRITICAL'
    : operational < 80
      ? 'MATRIX DEGRADED'
      : 'MATRIX STABLE';

  // Sector breakdown
  const sectors = {} as Record<MatrixSector, { health: number; nodeCount: number; weight: number }>;
  for (const sector of ['core', 'ccr', 'ccl', 'execution', 'overlay'] as MatrixSector[]) {
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

/**
 * Get the integrity equation as a display string
 */
export function getIntegrityEquation(): string {
  return 'Matrix Integrity = Σ(node.health × node.weight) where Σ(weight) = 1.0';
}

/**
 * Get total weight (for validation display)
 */
export function getTotalWeight(): number {
  return Math.round(TOTAL_WEIGHT * 1000) / 1000;
}
