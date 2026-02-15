/**
 * Cross-Module Affinity Matrix
 * v10.4.0 — Persistent affinity tracking with drift detection
 * 
 * Builds a persistent matrix showing which module pairs collaborate best.
 * Detects when affinities shift (drift) and alerts the discovery engine.
 * 
 * Data sources:
 * 1. Shared domains (structural affinity)
 * 2. Co-resolution frequency (behavioral affinity — from mesh_intents)
 * 3. Historical comparison (drift detection)
 */

import { supabase } from '@/integrations/supabase/client';
import { MESH_MANIFEST, getModuleResolvers } from './manifest';
import { analyzeModuleAffinity } from './discovery-engine';

// ─── Types ───

export interface AffinityEdge {
  moduleA: string;
  moduleB: string;
  structuralAffinity: number; // 0-1 based on shared domains
  behavioralAffinity: number; // 0-1 based on co-resolution frequency
  combinedScore: number;      // weighted composite
  sharedDomains: string[];
  coResolutionCount: number;
  trend: 'strengthening' | 'stable' | 'weakening' | 'new';
  drift: number;              // absolute change from previous snapshot
  lastUpdated: string;
}

export interface AffinityMatrix {
  edges: AffinityEdge[];
  moduleStrengths: Array<{ module: string; avgAffinity: number; connections: number; strongestPartner: string }>;
  clusters: Array<{ name: string; modules: string[]; cohesion: number }>;
  driftAlerts: Array<{ moduleA: string; moduleB: string; previousScore: number; currentScore: number; change: number }>;
  snapshotAt: string;
  totalModules: number;
}

export interface AffinitySnapshot {
  edges: Array<{ a: string; b: string; score: number }>;
  timestamp: string;
}

// ─── Matrix Builder ───

/**
 * Build the full cross-module affinity matrix from structural + behavioral data
 */
export async function buildAffinityMatrix(): Promise<AffinityMatrix> {
  // 1. Get structural affinities
  const structuralAffinities = await analyzeModuleAffinity();

  // 2. Get behavioral affinities from co-resolution in receipts
  const behavioral = await calculateBehavioralAffinity();

  // 3. Get previous snapshot for drift detection
  const previousSnapshot = await getLatestSnapshot();

  // 4. Build edges
  const edgeMap = new Map<string, AffinityEdge>();

  // Add structural edges
  for (const sa of structuralAffinities) {
    const key = [sa.moduleA, sa.moduleB].sort().join(':');
    edgeMap.set(key, {
      moduleA: sa.moduleA,
      moduleB: sa.moduleB,
      structuralAffinity: sa.affinityScore,
      behavioralAffinity: 0,
      combinedScore: sa.affinityScore * 0.4,
      sharedDomains: sa.sharedDomains,
      coResolutionCount: 0,
      trend: 'new',
      drift: 0,
      lastUpdated: new Date().toISOString(),
    });
  }

  // Merge behavioral data
  for (const ba of behavioral) {
    const key = [ba.moduleA, ba.moduleB].sort().join(':');
    const existing = edgeMap.get(key);
    if (existing) {
      existing.behavioralAffinity = ba.score;
      existing.coResolutionCount = ba.count;
      existing.combinedScore = existing.structuralAffinity * 0.4 + ba.score * 0.6;
    } else {
      edgeMap.set(key, {
        moduleA: ba.moduleA,
        moduleB: ba.moduleB,
        structuralAffinity: 0,
        behavioralAffinity: ba.score,
        combinedScore: ba.score * 0.6,
        sharedDomains: [],
        coResolutionCount: ba.count,
        trend: 'new',
        drift: 0,
        lastUpdated: new Date().toISOString(),
      });
    }
  }

  // 5. Calculate drift from previous snapshot
  const driftAlerts: AffinityMatrix['driftAlerts'] = [];
  if (previousSnapshot) {
    const prevMap = new Map(previousSnapshot.edges.map(e => [[e.a, e.b].sort().join(':'), e.score]));
    for (const [key, edge] of edgeMap) {
      const prevScore = prevMap.get(key);
      if (prevScore !== undefined) {
        edge.drift = Math.round((edge.combinedScore - prevScore) * 100) / 100;
        edge.trend = edge.drift > 0.1 ? 'strengthening'
                   : edge.drift < -0.1 ? 'weakening'
                   : 'stable';
        if (Math.abs(edge.drift) > 0.15) {
          driftAlerts.push({
            moduleA: edge.moduleA, moduleB: edge.moduleB,
            previousScore: prevScore, currentScore: edge.combinedScore,
            change: edge.drift,
          });
        }
      }
    }
  }

  const edges = [...edgeMap.values()].sort((a, b) => b.combinedScore - a.combinedScore);

  // 6. Module strength rankings
  const moduleScores = new Map<string, { total: number; count: number; strongest: string; strongestScore: number }>();
  for (const edge of edges) {
    for (const mod of [edge.moduleA, edge.moduleB]) {
      if (!moduleScores.has(mod)) moduleScores.set(mod, { total: 0, count: 0, strongest: '', strongestScore: 0 });
      const entry = moduleScores.get(mod)!;
      entry.total += edge.combinedScore;
      entry.count++;
      const partner = mod === edge.moduleA ? edge.moduleB : edge.moduleA;
      if (edge.combinedScore > entry.strongestScore) {
        entry.strongest = partner;
        entry.strongestScore = edge.combinedScore;
      }
    }
  }
  const moduleStrengths = [...moduleScores.entries()]
    .map(([module, s]) => ({
      module,
      avgAffinity: Math.round((s.total / Math.max(1, s.count)) * 100) / 100,
      connections: s.count,
      strongestPartner: s.strongest,
    }))
    .sort((a, b) => b.avgAffinity - a.avgAffinity);

  // 7. Detect clusters (modules with mutual high affinity)
  const clusters = detectClusters(edges);

  const matrix: AffinityMatrix = {
    edges,
    moduleStrengths,
    clusters,
    driftAlerts,
    snapshotAt: new Date().toISOString(),
    totalModules: moduleStrengths.length,
  };

  // Persist snapshot for future drift comparison
  await saveSnapshot(matrix);

  return matrix;
}

// ─── Behavioral Affinity ───

async function calculateBehavioralAffinity(): Promise<Array<{ moduleA: string; moduleB: string; score: number; count: number }>> {
  const { data } = await supabase
    .from('mesh_intents')
    .select('source_module, resolved_by')
    .eq('success', true)
    .order('created_at', { ascending: false })
    .limit(500);

  if (!data) return [];

  // Count co-resolution pairs
  const pairCounts = new Map<string, number>();
  for (const row of data) {
    const resolved = (row.resolved_by as string[]) || [];
    const allModules = [row.source_module, ...resolved];
    // Count each unique pair
    for (let i = 0; i < allModules.length; i++) {
      for (let j = i + 1; j < allModules.length; j++) {
        const key = [allModules[i], allModules[j]].sort().join(':');
        pairCounts.set(key, (pairCounts.get(key) || 0) + 1);
      }
    }
  }

  const maxCount = Math.max(1, ...pairCounts.values());
  return [...pairCounts.entries()].map(([key, count]) => {
    const [moduleA, moduleB] = key.split(':');
    return { moduleA, moduleB, score: Math.min(1, count / maxCount), count };
  });
}

// ─── Cluster Detection ───

function detectClusters(edges: AffinityEdge[]): AffinityMatrix['clusters'] {
  const strongEdges = edges.filter(e => e.combinedScore >= 0.4);
  const adjacency = new Map<string, Set<string>>();

  for (const edge of strongEdges) {
    if (!adjacency.has(edge.moduleA)) adjacency.set(edge.moduleA, new Set());
    if (!adjacency.has(edge.moduleB)) adjacency.set(edge.moduleB, new Set());
    adjacency.get(edge.moduleA)!.add(edge.moduleB);
    adjacency.get(edge.moduleB)!.add(edge.moduleA);
  }

  const visited = new Set<string>();
  const clusters: AffinityMatrix['clusters'] = [];

  for (const [module] of adjacency) {
    if (visited.has(module)) continue;
    const cluster = new Set<string>();
    const queue = [module];
    while (queue.length > 0) {
      const current = queue.pop()!;
      if (visited.has(current)) continue;
      visited.add(current);
      cluster.add(current);
      for (const neighbor of adjacency.get(current) || []) {
        if (!visited.has(neighbor)) queue.push(neighbor);
      }
    }
    if (cluster.size >= 2) {
      const members = [...cluster];
      const clusterEdges = strongEdges.filter(e => cluster.has(e.moduleA) && cluster.has(e.moduleB));
      const cohesion = clusterEdges.length > 0
        ? clusterEdges.reduce((s, e) => s + e.combinedScore, 0) / clusterEdges.length
        : 0;
      clusters.push({
        name: members.slice(0, 3).join('-') + (members.length > 3 ? `+${members.length - 3}` : ''),
        modules: members,
        cohesion: Math.round(cohesion * 100) / 100,
      });
    }
  }

  return clusters.sort((a, b) => b.cohesion - a.cohesion);
}

// ─── Snapshot Persistence ───

async function getLatestSnapshot(): Promise<AffinitySnapshot | null> {
  const { data } = await supabase
    .from('mesh_discovery_runs')
    .select('summary')
    .eq('run_type', 'affinity_snapshot')
    .order('created_at', { ascending: false })
    .limit(1);

  if (!data?.[0]) return null;
  const summary = data[0].summary as any;
  return summary?.snapshot || null;
}

async function saveSnapshot(matrix: AffinityMatrix): Promise<void> {
  try {
    const snapshot: AffinitySnapshot = {
      edges: matrix.edges.map(e => ({ a: e.moduleA, b: e.moduleB, score: e.combinedScore })),
      timestamp: matrix.snapshotAt,
    };
    await supabase.from('mesh_discovery_runs').insert([{
      run_type: 'affinity_snapshot',
      gaps_found: matrix.driftAlerts.length,
      recommendations_generated: 0,
      capabilities_expanded: 0,
      modules_analyzed: matrix.totalModules,
      duration_ms: 0,
      summary: {
        text: `Affinity snapshot: ${matrix.edges.length} edges, ${matrix.clusters.length} clusters, ${matrix.driftAlerts.length} drift alerts`,
        snapshot,
        clusters: matrix.clusters,
        drift_alerts: matrix.driftAlerts,
      },
    } as any]);
  } catch { /* non-blocking */ }
}

/**
 * Get affinity summary for a specific module
 */
export async function getModuleAffinity(module: string): Promise<{
  partners: Array<{ module: string; score: number; sharedDomains: string[]; trend: string }>;
  cluster: string | null;
  avgAffinity: number;
}> {
  const matrix = await buildAffinityMatrix();
  const moduleEdges = matrix.edges.filter(e => e.moduleA === module || e.moduleB === module);
  const partners = moduleEdges.map(e => ({
    module: e.moduleA === module ? e.moduleB : e.moduleA,
    score: e.combinedScore,
    sharedDomains: e.sharedDomains,
    trend: e.trend,
  })).sort((a, b) => b.score - a.score);

  const cluster = matrix.clusters.find(c => c.modules.includes(module));

  return {
    partners,
    cluster: cluster?.name || null,
    avgAffinity: partners.length > 0
      ? Math.round(partners.reduce((s, p) => s + p.score, 0) / partners.length * 100) / 100
      : 0,
  };
}
