/**
 * NERVE Ultimate — Cascade Failure Detector
 * Detects propagating failures across topology edges.
 * Uses temporal correlation and topology adjacency to identify cascades.
 */

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

export interface FailureEvent {
  nodeId: string;
  type: 'circuit_open' | 'node_dead' | 'backpressure_critical' | 'latency_spike';
  timestamp: number;
  metadata?: Record<string, unknown>;
}

export interface CascadeDetection {
  cascadeId: string;
  originNode: string;
  affectedNodes: string[];
  propagationPath: string[];
  detectedAt: number;
  durationMs: number;
  severity: 'minor' | 'moderate' | 'severe' | 'catastrophic';
  eventCount: number;
  status: 'active' | 'contained' | 'resolved';
}

export interface CascadeStats {
  totalCascades: number;
  activeCascades: number;
  avgAffectedNodes: number;
  avgDurationMs: number;
  worstCascadeSize: number;
}

// ═══════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════

const CASCADE_WINDOW_MS = 30_000;       // Failures within 30s may be correlated
const MIN_CASCADE_SIZE = 2;             // At least 2 nodes for a cascade
const MAX_EVENTS = 1_000;
const MAX_CASCADES = 200;

// ═══════════════════════════════════════════════════════════════
// STATE
// ═══════════════════════════════════════════════════════════════

const failureEvents: FailureEvent[] = [];
const cascades = new Map<string, CascadeDetection>();
const adjacencyMap = new Map<string, Set<string>>();
let cascadeCounter = 0;

// ═══════════════════════════════════════════════════════════════
// TOPOLOGY
// ═══════════════════════════════════════════════════════════════

/** Register an edge in the topology for cascade propagation analysis */
export function registerEdge(from: string, to: string): void {
  if (!adjacencyMap.has(from)) adjacencyMap.set(from, new Set());
  if (!adjacencyMap.has(to)) adjacencyMap.set(to, new Set());
  adjacencyMap.get(from)!.add(to);
  adjacencyMap.get(to)!.add(from);
}

/** Bulk-register edges from topology */
export function registerTopology(edges: Array<{ from: string; to: string }>): void {
  for (const edge of edges) {
    registerEdge(edge.from, edge.to);
  }
}

// ═══════════════════════════════════════════════════════════════
// CORE API
// ═══════════════════════════════════════════════════════════════

/** Report a failure event and check for cascade */
export function reportFailure(event: FailureEvent): CascadeDetection | null {
  failureEvents.push(event);
  if (failureEvents.length > MAX_EVENTS) {
    failureEvents.splice(0, failureEvents.length - MAX_EVENTS);
  }

  // Check if this failure extends an existing active cascade
  for (const cascade of cascades.values()) {
    if (cascade.status !== 'active') continue;
    if ((event.timestamp - cascade.detectedAt) > CASCADE_WINDOW_MS * 2) continue;

    // Check if the failing node is adjacent to any node in the cascade
    const isAdjacent = cascade.affectedNodes.some(n => {
      const neighbors = adjacencyMap.get(n);
      return neighbors?.has(event.nodeId);
    });

    if (isAdjacent && !cascade.affectedNodes.includes(event.nodeId)) {
      cascade.affectedNodes.push(event.nodeId);
      cascade.propagationPath.push(event.nodeId);
      cascade.eventCount++;
      cascade.durationMs = event.timestamp - cascade.detectedAt;
      cascade.severity = classifySeverity(cascade.affectedNodes.length);
      return { ...cascade };
    }
  }

  // Check for new cascade: are there recent failures in adjacent nodes?
  const recentFailures = failureEvents.filter(
    e => (event.timestamp - e.timestamp) < CASCADE_WINDOW_MS && e.nodeId !== event.nodeId
  );

  const adjacentFailures = recentFailures.filter(e => {
    const neighbors = adjacencyMap.get(event.nodeId);
    return neighbors?.has(e.nodeId);
  });

  if (adjacentFailures.length >= MIN_CASCADE_SIZE - 1) {
    // New cascade detected
    const affectedNodes = [
      ...new Set([event.nodeId, ...adjacentFailures.map(e => e.nodeId)]),
    ];

    const cascade: CascadeDetection = {
      cascadeId: `cascade-${++cascadeCounter}-${Date.now()}`,
      originNode: adjacentFailures[0].nodeId, // Earliest failure is likely origin
      affectedNodes,
      propagationPath: [adjacentFailures[0].nodeId, event.nodeId],
      detectedAt: event.timestamp,
      durationMs: event.timestamp - adjacentFailures[0].timestamp,
      severity: classifySeverity(affectedNodes.length),
      eventCount: affectedNodes.length,
      status: 'active',
    };

    cascades.set(cascade.cascadeId, cascade);

    // Enforce max cascades
    if (cascades.size > MAX_CASCADES) {
      const oldest = Array.from(cascades.keys())[0];
      cascades.delete(oldest);
    }

    return { ...cascade };
  }

  return null;
}

function classifySeverity(affectedCount: number): CascadeDetection['severity'] {
  if (affectedCount >= 10) return 'catastrophic';
  if (affectedCount >= 5) return 'severe';
  if (affectedCount >= 3) return 'moderate';
  return 'minor';
}

/** Mark a cascade as contained or resolved */
export function updateCascadeStatus(
  cascadeId: string,
  status: 'contained' | 'resolved',
): boolean {
  const cascade = cascades.get(cascadeId);
  if (!cascade) return false;
  cascade.status = status;
  return true;
}

/** Get all active cascades */
export function getActiveCascades(): CascadeDetection[] {
  return Array.from(cascades.values()).filter(c => c.status === 'active');
}

/** Get a specific cascade */
export function getCascade(cascadeId: string): CascadeDetection | null {
  const c = cascades.get(cascadeId);
  return c ? { ...c } : null;
}

/** Get all cascades */
export function getAllCascades(): CascadeDetection[] {
  return Array.from(cascades.values()).map(c => ({ ...c }));
}

/** Get cascade statistics */
export function getCascadeStats(): CascadeStats {
  const all = Array.from(cascades.values());
  const active = all.filter(c => c.status === 'active');
  const avgNodes = all.length > 0
    ? all.reduce((sum, c) => sum + c.affectedNodes.length, 0) / all.length
    : 0;
  const avgDuration = all.length > 0
    ? all.reduce((sum, c) => sum + c.durationMs, 0) / all.length
    : 0;
  const worst = all.reduce((max, c) => Math.max(max, c.affectedNodes.length), 0);

  return {
    totalCascades: all.length,
    activeCascades: active.length,
    avgAffectedNodes: Math.round(avgNodes * 10) / 10,
    avgDurationMs: Math.round(avgDuration),
    worstCascadeSize: worst,
  };
}
