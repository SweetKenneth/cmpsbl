/**
 * ENGINEER — Bottleneck Topology Analyzer
 * Graph-based critical-path analysis across the 40-node mesh.
 * Identifies cascading bottleneck chains, not just single-node hotspots.
 * @module engineer/bottleneckTopologyAnalyzer
 * @version 9.0.0 — Foundry
 */

// ── Types ──────────────────────────────────────────────────────────────────

export interface NodeProfile {
  nodeId: string;
  latencyMs: number;
  cpuPercent: number;
  memoryPercent: number;
  ioPercent: number;
  queueDepth: number;
  dependencies: string[]; // downstream nodeIds
}

export type BottleneckType = 'compute-bound' | 'memory-bound' | 'io-bound' | 'queue-saturated' | 'cascading';

export interface BottleneckResult {
  nodeId: string;
  type: BottleneckType;
  severity: number;        // 0–100
  cascadeDepth: number;    // how many downstream nodes affected
  affectedNodes: string[];
  criticalPath: string[];
}

export interface TopologyAnalysis {
  bottlenecks: BottleneckResult[];
  criticalPath: string[];
  totalLatencyMs: number;
  hotspotCount: number;
}

// ── Constants ──────────────────────────────────────────────────────────────

const CPU_THRESHOLD = 80;
const MEMORY_THRESHOLD = 85;
const IO_THRESHOLD = 70;
const QUEUE_THRESHOLD = 100;

// ── Core ───────────────────────────────────────────────────────────────────

function classifyBottleneck(profile: NodeProfile): BottleneckType | null {
  if (profile.cpuPercent > CPU_THRESHOLD) return 'compute-bound';
  if (profile.memoryPercent > MEMORY_THRESHOLD) return 'memory-bound';
  if (profile.ioPercent > IO_THRESHOLD) return 'io-bound';
  if (profile.queueDepth > QUEUE_THRESHOLD) return 'queue-saturated';
  return null;
}

function computeSeverity(profile: NodeProfile): number {
  const factors = [
    Math.max(0, (profile.cpuPercent - CPU_THRESHOLD) / (100 - CPU_THRESHOLD)),
    Math.max(0, (profile.memoryPercent - MEMORY_THRESHOLD) / (100 - MEMORY_THRESHOLD)),
    Math.max(0, (profile.ioPercent - IO_THRESHOLD) / (100 - IO_THRESHOLD)),
    Math.min(1, profile.queueDepth / (QUEUE_THRESHOLD * 3)),
  ];
  return Math.round(Math.max(...factors) * 100);
}

function findCascade(
  nodeId: string,
  profileMap: Map<string, NodeProfile>,
  visited: Set<string>,
): string[] {
  if (visited.has(nodeId)) return [];
  visited.add(nodeId);
  const profile = profileMap.get(nodeId);
  if (!profile) return [];

  const affected: string[] = [];
  for (const dep of profile.dependencies) {
    affected.push(dep);
    affected.push(...findCascade(dep, profileMap, visited));
  }
  return affected;
}

function findCriticalPath(profiles: NodeProfile[]): string[] {
  // Longest latency path through the dependency graph
  const profileMap = new Map(profiles.map(p => [p.nodeId, p]));
  const memo = new Map<string, { latency: number; path: string[] }>();

  function longestPath(nodeId: string, visited: Set<string>): { latency: number; path: string[] } {
    if (memo.has(nodeId)) return memo.get(nodeId)!;
    if (visited.has(nodeId)) return { latency: 0, path: [] };
    visited.add(nodeId);

    const profile = profileMap.get(nodeId);
    if (!profile) return { latency: 0, path: [] };

    let best = { latency: 0, path: [] as string[] };
    for (const dep of profile.dependencies) {
      const sub = longestPath(dep, new Set(visited));
      if (sub.latency > best.latency) best = sub;
    }

    const result = {
      latency: profile.latencyMs + best.latency,
      path: [nodeId, ...best.path],
    };
    memo.set(nodeId, result);
    return result;
  }

  let criticalPath = { latency: 0, path: [] as string[] };
  for (const p of profiles) {
    const candidate = longestPath(p.nodeId, new Set());
    if (candidate.latency > criticalPath.latency) criticalPath = candidate;
  }
  return criticalPath.path;
}

export function analyzeTopology(profiles: NodeProfile[]): TopologyAnalysis {
  const profileMap = new Map(profiles.map(p => [p.nodeId, p]));
  const bottlenecks: BottleneckResult[] = [];

  for (const profile of profiles) {
    const type = classifyBottleneck(profile);
    if (!type) continue;

    const affected = findCascade(profile.nodeId, profileMap, new Set());
    bottlenecks.push({
      nodeId: profile.nodeId,
      type: affected.length > 2 ? 'cascading' : type,
      severity: computeSeverity(profile),
      cascadeDepth: affected.length,
      affectedNodes: affected,
      criticalPath: [profile.nodeId, ...affected.slice(0, 3)],
    });
  }

  bottlenecks.sort((a, b) => b.severity - a.severity);

  return {
    bottlenecks,
    criticalPath: findCriticalPath(profiles),
    totalLatencyMs: profiles.reduce((s, p) => s + p.latencyMs, 0),
    hotspotCount: bottlenecks.length,
  };
}
