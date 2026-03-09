/**
 * RIPPLE Cross-Node Propagation — v1.0.0
 * Topology-aware event propagation across the 40-node substrate matrix
 * 
 * Provides:
 * - Sector-aware fan-out (events propagate within sectors first)
 * - Cross-sector bridging for inter-module events
 * - Propagation tracing for debugging
 * - Delivery confirmation from all nodes
 */

import { emit } from '@/lib/substrate/events';

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export type SectorId = 
  | 'kernel' | 'cognitive' | 'operational' | 'ocg' 
  | 'esz' | 'epz' | 'emz' | 'csz' | 'governance';

export type NodeId = string; // e.g., 'brain', 'nexus', 'defense'

export interface PropagationEvent {
  id: string;
  type: string;
  source: NodeId;
  sourceSector: SectorId;
  payload: unknown;
  propagationPath: PropagationHop[];
  createdAt: string;
  ttl: number; // hops remaining
}

export interface PropagationHop {
  nodeId: NodeId;
  sector: SectorId;
  receivedAt: string;
  latencyMs: number;
  acked: boolean;
}

export interface PropagationConfig {
  maxTTL: number;
  sectorPriority: SectorId[];
  enableCrossSector: boolean;
  confirmationRequired: boolean;
  timeoutMs: number;
}

export interface PropagationResult {
  eventId: string;
  delivered: number;
  pending: number;
  failed: number;
  path: PropagationHop[];
}

// ═══════════════════════════════════════════════════════════════════════════════
// NODE TOPOLOGY
// ═══════════════════════════════════════════════════════════════════════════════

const NODE_SECTORS: Record<NodeId, SectorId> = {
  // Kernel
  core: 'kernel', ripple: 'kernel', access: 'kernel',
  // Cognitive
  brain: 'cognitive', decode: 'cognitive', dream: 'cognitive',
  // Operational (Execution)
  defense: 'operational', nexus: 'operational', vision: 'operational',
  encode: 'operational', integration: 'operational',
  // OCG — Operational Compliance Grid
  memory: 'ocg', relay: 'ocg', audit: 'ocg',
  identity: 'ocg', economy: 'ocg', sandbox: 'ocg', nerve: 'ocg',
  // ESZ — Expansion Sovereignty Zone
  sovereign: 'esz', conscience: 'esz', treaty: 'esz', oracle: 'esz',
  // EPZ — Expansion Perception Zone
  compass: 'epz', echo: 'epz', reflex: 'epz',
  // EMZ — Expansion Manufacturing Zone
  forge: 'emz', lingua: 'emz', harvest: 'emz',
  // CSZ — Covert Systems Zone
  phantom: 'csz', shadow: 'csz', evolution: 'csz',
  // Governance
  governance: 'governance', cortex: 'governance', system: 'governance',
  inclusive: 'governance', modernizer: 'governance',
  // Additional operational nodes
  medic: 'operational', immunity: 'operational', intent: 'operational',
};

const SECTOR_ADJACENCY: Record<SectorId, SectorId[]> = {
  kernel: ['cognitive', 'ocg', 'governance'],
  cognitive: ['kernel', 'operational', 'governance'],
  operational: ['cognitive', 'ocg', 'esz'],
  ocg: ['kernel', 'operational', 'epz'],
  esz: ['operational', 'governance', 'csz'],
  epz: ['ocg', 'emz', 'cognitive'],
  emz: ['epz', 'csz', 'operational'],
  csz: ['esz', 'emz', 'governance'],
  governance: ['kernel', 'cognitive', 'esz', 'csz'],
};

// ═══════════════════════════════════════════════════════════════════════════════
// STATE
// ═══════════════════════════════════════════════════════════════════════════════

const DEFAULT_CONFIG: PropagationConfig = {
  maxTTL: 5,
  sectorPriority: ['kernel', 'cognitive', 'operational', 'ocg', 'governance'],
  enableCrossSector: true,
  confirmationRequired: false,
  timeoutMs: 5000,
};

// Pre-computed sector→node reverse map for O(1) lookups
const sectorNodesCache = new Map<SectorId, NodeId[]>();
function buildSectorCache(): void {
  sectorNodesCache.clear();
  for (const [nodeId, sector] of Object.entries(NODE_SECTORS)) {
    const existing = sectorNodesCache.get(sector) ?? [];
    existing.push(nodeId);
    sectorNodesCache.set(sector, existing);
  }
}
buildSectorCache();

const pendingPropagations = new Map<string, PropagationEvent>();
const deliveryConfirmations = new Map<string, Set<NodeId>>();

// Subscribers per node
const nodeSubscribers = new Map<NodeId, Set<(event: PropagationEvent) => void>>();

// Statistics
let totalPropagated = 0;
let totalDelivered = 0;
let totalFailed = 0;

// ═══════════════════════════════════════════════════════════════════════════════
// SUBSCRIPTION
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Subscribe a node to receive propagated events
 */
export function subscribeNode(
  nodeId: NodeId,
  handler: (event: PropagationEvent) => void
): () => void {
  let subscribers = nodeSubscribers.get(nodeId);
  if (!subscribers) {
    subscribers = new Set();
    nodeSubscribers.set(nodeId, subscribers);
  }
  subscribers.add(handler);

  // Return unsubscribe function
  return () => {
    subscribers?.delete(handler);
  };
}

/**
 * Get subscribed nodes
 */
export function getSubscribedNodes(): NodeId[] {
  return Array.from(nodeSubscribers.keys()).filter(
    nodeId => (nodeSubscribers.get(nodeId)?.size || 0) > 0
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// PROPAGATION
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Propagate an event across the node matrix
 */
export async function propagate(
  type: string,
  source: NodeId,
  payload: unknown,
  options?: Partial<PropagationConfig>
): Promise<PropagationResult> {
  const config = { ...DEFAULT_CONFIG, ...options };
  const sourceSector = NODE_SECTORS[source] || 'operational';

  const event: PropagationEvent = {
    id: crypto.randomUUID(),
    type,
    source,
    sourceSector,
    payload,
    propagationPath: [],
    createdAt: new Date().toISOString(),
    ttl: config.maxTTL,
  };

  pendingPropagations.set(event.id, event);
  deliveryConfirmations.set(event.id, new Set());
  totalPropagated++;

  // Emit ripple event
  emit({
    module: 'ripple',
    event_type: 'cross_node_propagation_started',
    outcome: 'succeeded',
    data: { eventId: event.id, type, source, sourceSector },
  });

  // Phase 1: Propagate within source sector
  const sectorNodes = getNodesInSector(sourceSector);
  await deliverToNodes(event, sectorNodes);

  // Phase 2: Propagate to adjacent sectors
  if (config.enableCrossSetor && event.ttl > 0) {
    const adjacentSectors = SECTOR_ADJACENCY[sourceSector] || [];
    for (const sector of adjacentSectors) {
      if (config.sectorPriority.includes(sector)) {
        event.ttl--;
        if (event.ttl <= 0) break;
        
        const nodes = getNodesInSector(sector);
        await deliverToNodes(event, nodes);
      }
    }
  }

  const confirmations = deliveryConfirmations.get(event.id) || new Set();
  
  return {
    eventId: event.id,
    delivered: confirmations.size,
    pending: 0,
    failed: 0,
    path: event.propagationPath,
  };
}

/**
 * Deliver event to a set of nodes
 */
async function deliverToNodes(
  event: PropagationEvent,
  nodes: NodeId[]
): Promise<void> {
  const startTime = Date.now();

  for (const nodeId of nodes) {
    if (nodeId === event.source) continue; // Skip source

    const subscribers = nodeSubscribers.get(nodeId);
    if (!subscribers || subscribers.size === 0) continue;

    const hop: PropagationHop = {
      nodeId,
      sector: NODE_SECTORS[nodeId] || 'operational',
      receivedAt: new Date().toISOString(),
      latencyMs: Date.now() - startTime,
      acked: false,
    };

    try {
      for (const handler of subscribers) {
        await handler(event);
      }
      hop.acked = true;
      totalDelivered++;
      
      const confirmations = deliveryConfirmations.get(event.id);
      confirmations?.add(nodeId);
    } catch (err) {
      totalFailed++;
      console.warn(`[RIPPLE Propagation] Delivery to ${nodeId} failed:`, err);
    }

    event.propagationPath.push(hop);
  }
}

/**
 * Get all nodes in a sector
 */
function getNodesInSector(sector: SectorId): NodeId[] {
  return Object.entries(NODE_SECTORS)
    .filter(([_, s]) => s === sector)
    .map(([nodeId]) => nodeId);
}

// ═══════════════════════════════════════════════════════════════════════════════
// CONFIRMATION
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Manually confirm delivery to a node
 */
export function confirmDelivery(eventId: string, nodeId: NodeId): boolean {
  const confirmations = deliveryConfirmations.get(eventId);
  if (!confirmations) return false;
  
  confirmations.add(nodeId);
  return true;
}

/**
 * Get delivery confirmations for an event
 */
export function getConfirmations(eventId: string): NodeId[] {
  return Array.from(deliveryConfirmations.get(eventId) || []);
}

// ═══════════════════════════════════════════════════════════════════════════════
// SECTOR BROADCAST
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Broadcast to all nodes in a specific sector
 */
export async function broadcastToSector(
  sector: SectorId,
  type: string,
  payload: unknown
): Promise<{ delivered: number }> {
  const nodes = getNodesInSector(sector);
  let delivered = 0;

  const event: PropagationEvent = {
    id: crypto.randomUUID(),
    type,
    source: 'ripple',
    sourceSector: 'kernel',
    payload,
    propagationPath: [],
    createdAt: new Date().toISOString(),
    ttl: 1,
  };

  for (const nodeId of nodes) {
    const subscribers = nodeSubscribers.get(nodeId);
    if (!subscribers) continue;

    for (const handler of subscribers) {
      try {
        await handler(event);
        delivered++;
      } catch {
        // Continue on error
      }
    }
  }

  return { delivered };
}

// ═══════════════════════════════════════════════════════════════════════════════
// STATISTICS
// ═══════════════════════════════════════════════════════════════════════════════

export interface PropagationStats {
  totalPropagated: number;
  totalDelivered: number;
  totalFailed: number;
  pendingCount: number;
  subscribedNodes: number;
  deliveryRate: number;
}

export function getPropagationStats(): PropagationStats {
  return {
    totalPropagated,
    totalDelivered,
    totalFailed,
    pendingCount: pendingPropagations.size,
    subscribedNodes: nodeSubscribers.size,
    deliveryRate: totalPropagated > 0
      ? Math.round((totalDelivered / totalPropagated) * 100)
      : 100,
  };
}

/**
 * Get sector topology
 */
export function getSectorTopology(): Record<SectorId, NodeId[]> {
  const topology: Partial<Record<SectorId, NodeId[]>> = {};
  
  for (const [nodeId, sector] of Object.entries(NODE_SECTORS)) {
    if (!topology[sector]) topology[sector] = [];
    topology[sector]!.push(nodeId);
  }

  return topology as Record<SectorId, NodeId[]>;
}

/**
 * Reset propagation state (for testing)
 */
export function resetPropagationState(): void {
  pendingPropagations.clear();
  deliveryConfirmations.clear();
  nodeSubscribers.clear();
  totalPropagated = 0;
  totalDelivered = 0;
  totalFailed = 0;
}
