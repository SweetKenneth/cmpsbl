/**
 * MEDIC — Health Aggregation Mesh
 * Hierarchical health computation: node → sector → zone → global.
 * Uses weighted EMA with configurable decay for recency bias.
 * @module medic/healthAggregationMesh
 * @version 9.0.0 — Surgeon
 */

// ── Types ──────────────────────────────────────────────────────────────────

export type AggregationLevel = 'node' | 'sector' | 'zone' | 'global';

export interface NodeHealth {
  nodeId: string;
  sector: string;
  zone: string;
  score: number;      // 0–100
  emaScore: number;
  timestamp: number;
  sampleCount: number;
}

export interface SectorHealth {
  sector: string;
  zone: string;
  score: number;
  nodeCount: number;
  degradedCount: number;
}

export interface ZoneHealth {
  zone: string;
  score: number;
  sectorCount: number;
  degradedSectors: number;
}

export interface GlobalHealth {
  score: number;
  zoneCount: number;
  totalNodes: number;
  degradedNodes: number;
  criticalNodes: number;
  timestamp: number;
}

// ── Constants ──────────────────────────────────────────────────────────────

const EMA_ALPHA = 0.25;
const DEGRADED_THRESHOLD = 60;
const CRITICAL_THRESHOLD = 30;

// ── State ──────────────────────────────────────────────────────────────────

const nodeHealthMap = new Map<string, NodeHealth>();

// ── Core ───────────────────────────────────────────────────────────────────

export function updateNodeHealth(
  nodeId: string,
  score: number,
  sector: string,
  zone: string,
): NodeHealth {
  const existing = nodeHealthMap.get(nodeId);
  const clamped = Math.max(0, Math.min(100, score));

  if (existing) {
    existing.emaScore = EMA_ALPHA * clamped + (1 - EMA_ALPHA) * existing.emaScore;
    existing.score = clamped;
    existing.timestamp = Date.now();
    existing.sampleCount++;
    return { ...existing };
  }

  const node: NodeHealth = {
    nodeId,
    sector,
    zone,
    score: clamped,
    emaScore: clamped,
    timestamp: Date.now(),
    sampleCount: 1,
  };
  nodeHealthMap.set(nodeId, node);
  return { ...node };
}

export function getNodeHealth(nodeId: string): NodeHealth | undefined {
  const n = nodeHealthMap.get(nodeId);
  return n ? { ...n } : undefined;
}

export function aggregateSector(sector: string): SectorHealth {
  const nodes = Array.from(nodeHealthMap.values()).filter(n => n.sector === sector);
  if (nodes.length === 0) {
    return { sector, zone: 'unknown', score: 100, nodeCount: 0, degradedCount: 0 };
  }

  const totalWeight = nodes.reduce((s, n) => s + n.sampleCount, 0) || 1;
  const weightedScore = nodes.reduce((s, n) => s + n.emaScore * (n.sampleCount / totalWeight), 0);

  return {
    sector,
    zone: nodes[0].zone,
    score: Math.round(weightedScore * 100) / 100,
    nodeCount: nodes.length,
    degradedCount: nodes.filter(n => n.emaScore < DEGRADED_THRESHOLD).length,
  };
}

export function aggregateZone(zone: string): ZoneHealth {
  const nodes = Array.from(nodeHealthMap.values()).filter(n => n.zone === zone);
  const sectors = [...new Set(nodes.map(n => n.sector))];
  const sectorHealths = sectors.map(aggregateSector);

  const score = sectorHealths.length > 0
    ? sectorHealths.reduce((s, sh) => s + sh.score, 0) / sectorHealths.length
    : 100;

  return {
    zone,
    score: Math.round(score * 100) / 100,
    sectorCount: sectorHealths.length,
    degradedSectors: sectorHealths.filter(s => s.score < DEGRADED_THRESHOLD).length,
  };
}

export function aggregateGlobal(): GlobalHealth {
  const all = Array.from(nodeHealthMap.values());
  const zones = [...new Set(all.map(n => n.zone))];
  const zoneHealths = zones.map(aggregateZone);

  const score = zoneHealths.length > 0
    ? zoneHealths.reduce((s, z) => s + z.score, 0) / zoneHealths.length
    : 100;

  return {
    score: Math.round(score * 100) / 100,
    zoneCount: zoneHealths.length,
    totalNodes: all.length,
    degradedNodes: all.filter(n => n.emaScore < DEGRADED_THRESHOLD).length,
    criticalNodes: all.filter(n => n.emaScore < CRITICAL_THRESHOLD).length,
    timestamp: Date.now(),
  };
}

export function getAllNodeHealths(): NodeHealth[] {
  return Array.from(nodeHealthMap.values()).map(n => ({ ...n }));
}

export function resetHealthMesh(): void {
  nodeHealthMap.clear();
}
