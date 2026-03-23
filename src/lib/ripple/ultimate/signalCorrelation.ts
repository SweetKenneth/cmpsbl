/**
 * RIPPLE Signal Correlation Engine — v9.0.0 "Tsunami"
 * 
 * Tracks causal chains across the substrate: eventA → eventB → eventC.
 * Temporal windowing links events within configurable windows.
 * Builds live dependency graphs showing which publishers trigger which cascades.
 */

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export interface CorrelatedSignal {
  id: string;
  type: string;
  source: string;
  timestamp: number;
  correlationId: string;
  causationId: string | null; // ID of the event that caused this one
  depth: number;
}

export interface CausalChain {
  correlationId: string;
  rootEvent: string;
  rootSource: string;
  chain: CorrelatedSignal[];
  depth: number;
  totalDuration: number;
  startedAt: number;
  completedAt: number;
}

export interface DependencyEdge {
  fromType: string;
  fromSource: string;
  toType: string;
  toSource: string;
  count: number;
  avgDelayMs: number;
  lastSeen: number;
}

export interface CorrelationStats {
  totalSignalsTracked: number;
  activeChainsCount: number;
  completedChainsCount: number;
  maxChainDepth: number;
  avgChainLength: number;
  uniqueEdges: number;
  hotPaths: DependencyEdge[];
}

// ═══════════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════════

const DEFAULT_WINDOW_MS = 2000;       // 2s temporal window
const MAX_CHAIN_DEPTH = 20;
const MAX_SIGNALS = 10000;
const MAX_CHAINS = 1000;
const MAX_EDGES = 2000;
const CHAIN_TIMEOUT_MS = 30000;       // 30s — chain considered complete

// ═══════════════════════════════════════════════════════════════════════════════
// STATE
// ═══════════════════════════════════════════════════════════════════════════════

const signalLog: CorrelatedSignal[] = [];
const activeChains = new Map<string, CausalChain>();
const completedChains: CausalChain[] = [];
const dependencyGraph = new Map<string, DependencyEdge>();
let temporalWindowMs = DEFAULT_WINDOW_MS;

// ═══════════════════════════════════════════════════════════════════════════════
// CORE ENGINE
// ═══════════════════════════════════════════════════════════════════════════════

function edgeKey(fromType: string, fromSource: string, toType: string, toSource: string): string {
  return `${fromSource}:${fromType}→${toSource}:${toType}`;
}

/** Track a new signal and auto-correlate with recent signals. */
export function trackSignal(
  id: string,
  type: string,
  source: string,
  explicitCorrelationId?: string,
  explicitCausationId?: string
): CorrelatedSignal {
  const now = Date.now();

  // Find potential cause within temporal window
  let causationId = explicitCausationId ?? null;
  let correlationId = explicitCorrelationId ?? id;
  let depth = 0;

  if (!explicitCausationId) {
    // Look backward for recent signals that could be the cause
    for (let i = signalLog.length - 1; i >= Math.max(0, signalLog.length - 100); i--) {
      const prev = signalLog[i];
      if (now - prev.timestamp <= temporalWindowMs && prev.source !== source) {
        causationId = prev.id;
        correlationId = prev.correlationId;
        depth = prev.depth + 1;
        break;
      }
    }
  } else {
    // Find the explicit cause
    const cause = signalLog.find(s => s.id === explicitCausationId);
    if (cause) {
      correlationId = cause.correlationId;
      depth = cause.depth + 1;
    }
  }

  if (depth > MAX_CHAIN_DEPTH) {
    depth = MAX_CHAIN_DEPTH; // Cap depth
  }

  const signal: CorrelatedSignal = {
    id,
    type,
    source,
    timestamp: now,
    correlationId,
    causationId,
    depth,
  };

  signalLog.push(signal);
  if (signalLog.length > MAX_SIGNALS) {
    signalLog.splice(0, signalLog.length - MAX_SIGNALS);
  }

  // Update chain
  updateChain(signal);

  // Update dependency graph
  if (causationId) {
    const cause = signalLog.find(s => s.id === causationId);
    if (cause) {
      updateDependencyEdge(cause.type, cause.source, type, source, now - cause.timestamp);
    }
  }

  return signal;
}

function updateChain(signal: CorrelatedSignal): void {
  const existing = activeChains.get(signal.correlationId);

  if (existing) {
    existing.chain.push(signal);
    existing.depth = Math.max(existing.depth, signal.depth);
    existing.completedAt = signal.timestamp;
    existing.totalDuration = signal.timestamp - existing.startedAt;
  } else {
    const chain: CausalChain = {
      correlationId: signal.correlationId,
      rootEvent: signal.type,
      rootSource: signal.source,
      chain: [signal],
      depth: signal.depth,
      totalDuration: 0,
      startedAt: signal.timestamp,
      completedAt: signal.timestamp,
    };
    activeChains.set(signal.correlationId, chain);

    if (activeChains.size > MAX_CHAINS) {
      // Finalize oldest
      const oldest = Array.from(activeChains.entries())
        .sort(([, a], [, b]) => a.startedAt - b.startedAt)[0];
      if (oldest) finalizeChain(oldest[0]);
    }
  }
}

function updateDependencyEdge(
  fromType: string, fromSource: string,
  toType: string, toSource: string,
  delayMs: number
): void {
  const key = edgeKey(fromType, fromSource, toType, toSource);
  const existing = dependencyGraph.get(key);

  if (existing) {
    existing.count++;
    existing.avgDelayMs = 0.2 * delayMs + 0.8 * existing.avgDelayMs;
    existing.lastSeen = Date.now();
  } else {
    if (dependencyGraph.size >= MAX_EDGES) {
      // Evict least-seen
      const lru = Array.from(dependencyGraph.entries())
        .sort(([, a], [, b]) => a.lastSeen - b.lastSeen)[0];
      if (lru) dependencyGraph.delete(lru[0]);
    }

    dependencyGraph.set(key, {
      fromType,
      fromSource,
      toType,
      toSource,
      count: 1,
      avgDelayMs: delayMs,
      lastSeen: Date.now(),
    });
  }
}

/** Finalize an active chain (move to completed). */
export function finalizeChain(correlationId: string): CausalChain | null {
  const chain = activeChains.get(correlationId);
  if (!chain) return null;

  activeChains.delete(correlationId);
  completedChains.push(chain);

  if (completedChains.length > MAX_CHAINS) {
    completedChains.splice(0, completedChains.length - MAX_CHAINS);
  }

  return chain;
}

/** Finalize chains that have been inactive beyond timeout. */
export function finalizeStaleChains(): number {
  const now = Date.now();
  let finalized = 0;

  for (const [id, chain] of activeChains.entries()) {
    if (now - chain.completedAt > CHAIN_TIMEOUT_MS) {
      finalizeChain(id);
      finalized++;
    }
  }

  return finalized;
}

/** Get a specific causal chain. */
export function getChain(correlationId: string): CausalChain | null {
  return activeChains.get(correlationId)
    ?? completedChains.find(c => c.correlationId === correlationId)
    ?? null;
}

/** Get active causal chains. */
export function getActiveChains(limit: number = 20): CausalChain[] {
  return Array.from(activeChains.values())
    .sort((a, b) => b.startedAt - a.startedAt)
    .slice(0, limit);
}

/** Get completed causal chains. */
export function getCompletedChains(limit: number = 20): CausalChain[] {
  return completedChains.slice(-limit);
}

/** Get the full dependency graph. */
export function getDependencyGraph(): DependencyEdge[] {
  return Array.from(dependencyGraph.values());
}

/** Get hot paths — most frequently traversed edges. */
export function getHotPaths(limit: number = 10): DependencyEdge[] {
  return Array.from(dependencyGraph.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

/** Set the temporal correlation window. */
export function setTemporalWindow(ms: number): void {
  temporalWindowMs = Math.max(50, Math.min(ms, 30000));
}

// ═══════════════════════════════════════════════════════════════════════════════
// STATS
// ═══════════════════════════════════════════════════════════════════════════════

export function getCorrelationStats(): CorrelationStats {
  const allChains = [
    ...Array.from(activeChains.values()),
    ...completedChains,
  ];
  const maxDepth = allChains.reduce((max, c) => Math.max(max, c.depth), 0);
  const avgLength = allChains.length > 0
    ? allChains.reduce((s, c) => s + c.chain.length, 0) / allChains.length
    : 0;

  return {
    totalSignalsTracked: signalLog.length,
    activeChainsCount: activeChains.size,
    completedChainsCount: completedChains.length,
    maxChainDepth: maxDepth,
    avgChainLength: Math.round(avgLength * 10) / 10,
    uniqueEdges: dependencyGraph.size,
    hotPaths: getHotPaths(5),
  };
}

export function resetCorrelationState(): void {
  signalLog.length = 0;
  activeChains.clear();
  completedChains.length = 0;
  dependencyGraph.clear();
  temporalWindowMs = DEFAULT_WINDOW_MS;
}
