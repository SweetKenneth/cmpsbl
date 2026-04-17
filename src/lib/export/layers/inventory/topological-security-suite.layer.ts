/**
 * CMPSBL® Inventory Layer — Topological Security Suite
 * Primitives: KNOT · MANIFOLD · GEODESIC · BOUNDARY
 *
 *   KNOT      → cycle detector over a directed call graph
 *   MANIFOLD  → trust-region check (point inside an axis-aligned region)
 *   GEODESIC  → shortest path in a small adjacency map (BFS, unweighted)
 *   BOUNDARY  → policy boundary gate — denies calls that cross forbidden edges
 *
 * Auto-wire installs a BOUNDARY pre-flight: if the caller passes an
 * `_cmpsbl_caller` and `_cmpsbl_forbidden_edges`, any forbidden edge from
 * the caller into the target capability throws before execution.
 */
import type { CmpsblLayerDefinition } from '../types';

const TS = `
// ╔═══════════════════════════════════════════════════════════════════════════════╗
// ║  ASCENSION LAYER — Topological Security Suite (proprietary).                  ║
// ╚═══════════════════════════════════════════════════════════════════════════════╝

// ── KNOT · cycle detector ───────────────────────────────────────────────────
export function cmpsbl_tss_knot_has_cycle(graph: Record<string, string[]>): boolean {
  const WHITE = 0, GRAY = 1, BLACK = 2;
  const color: Record<string, number> = {};
  for (const n of Object.keys(graph)) color[n] = WHITE;
  function dfs(n: string): boolean {
    color[n] = GRAY;
    for (const m of graph[n] ?? []) {
      const c = color[m] ?? WHITE;
      if (c === GRAY) return true;
      if (c === WHITE && dfs(m)) return true;
    }
    color[n] = BLACK;
    return false;
  }
  for (const n of Object.keys(graph)) if (color[n] === WHITE && dfs(n)) return true;
  return false;
}

// ── MANIFOLD · axis-aligned trust region ────────────────────────────────────
export type CmpsblRegion = { min: number[]; max: number[] };
export function cmpsbl_tss_manifold_inside(region: CmpsblRegion, point: number[]): boolean {
  if (point.length !== region.min.length) return false;
  for (let i = 0; i < point.length; i++) {
    if (point[i] < region.min[i] || point[i] > region.max[i]) return false;
  }
  return true;
}

// ── GEODESIC · BFS shortest path ────────────────────────────────────────────
export function cmpsbl_tss_geodesic_path(graph: Record<string, string[]>, src: string, dst: string): string[] | null {
  if (src === dst) return [src];
  const visited = new Set<string>([src]);
  const parent: Record<string, string> = {};
  const queue: string[] = [src];
  while (queue.length) {
    const u = queue.shift()!;
    for (const v of graph[u] ?? []) {
      if (visited.has(v)) continue;
      visited.add(v);
      parent[v] = u;
      if (v === dst) {
        const path = [v];
        let cur = v;
        while (cur !== src) { cur = parent[cur]; path.push(cur); }
        return path.reverse();
      }
      queue.push(v);
    }
  }
  return null;
}

// ── BOUNDARY · forbidden-edge gate ──────────────────────────────────────────
export function cmpsbl_tss_boundary_allowed(forbidden: Array<[string, string]>, from: string, to: string): boolean {
  for (const [a, b] of forbidden) if (a === from && b === to) return false;
  return true;
}
`;

const PY = `
# ╔═══════════════════════════════════════════════════════════════════════════════╗
# ║  ASCENSION LAYER — Topological Security Suite (proprietary).                  ║
# ╚═══════════════════════════════════════════════════════════════════════════════╝

from typing import Dict, List, Optional, Tuple
from collections import deque

def cmpsbl_tss_knot_has_cycle(graph: Dict[str, List[str]]) -> bool:
    WHITE, GRAY, BLACK = 0, 1, 2
    color = { n: WHITE for n in graph.keys() }
    def dfs(n: str) -> bool:
        color[n] = GRAY
        for m in graph.get(n, []):
            c = color.get(m, WHITE)
            if c == GRAY: return True
            if c == WHITE and dfs(m): return True
        color[n] = BLACK
        return False
    for n in list(graph.keys()):
        if color.get(n, WHITE) == WHITE and dfs(n): return True
    return False

def cmpsbl_tss_manifold_inside(region: dict, point: List[float]) -> bool:
    mn, mx = region["min"], region["max"]
    if len(point) != len(mn): return False
    for i, p in enumerate(point):
        if p < mn[i] or p > mx[i]: return False
    return True

def cmpsbl_tss_geodesic_path(graph: Dict[str, List[str]], src: str, dst: str) -> Optional[List[str]]:
    if src == dst: return [src]
    visited = { src }
    parent: Dict[str, str] = {}
    q = deque([src])
    while q:
        u = q.popleft()
        for v in graph.get(u, []):
            if v in visited: continue
            visited.add(v)
            parent[v] = u
            if v == dst:
                path = [v]
                cur = v
                while cur != src:
                    cur = parent[cur]
                    path.append(cur)
                return list(reversed(path))
            q.append(v)
    return None

def cmpsbl_tss_boundary_allowed(forbidden: List[Tuple[str, str]], frm: str, to: str) -> bool:
    for a, b in forbidden:
        if a == frm and b == to: return False
    return True
`;

const WIRE_TS = `
const _cmpsbl_raw_execute_tss = cmpsbl_execute;
cmpsbl_execute = function cmpsbl_execute_tss(capabilityName: string, input: Record<string, unknown>): ExecutionResult {
  const caller = typeof input._cmpsbl_caller === 'string' ? input._cmpsbl_caller : null;
  const forbidden = Array.isArray(input._cmpsbl_forbidden_edges) ? input._cmpsbl_forbidden_edges as Array<[string, string]> : null;
  if (caller && forbidden && !cmpsbl_tss_boundary_allowed(forbidden, caller, capabilityName)) {
    throw new Error(\`[CMPSBL:Topology:\${capabilityName}] BOUNDARY denied — \${caller} → \${capabilityName}\`);
  }
  return _cmpsbl_raw_execute_tss(capabilityName, input);
};`;

const WIRE_PY = `
_cmpsbl_raw_execute_tss = cmpsbl_execute
def cmpsbl_execute(capability_name: str, input_data: dict) -> dict:
    """Execute under Topological Security Suite (BOUNDARY pre-flight)."""
    caller = input_data.get('_cmpsbl_caller')
    forbidden = input_data.get('_cmpsbl_forbidden_edges')
    if isinstance(caller, str) and isinstance(forbidden, list):
        if not cmpsbl_tss_boundary_allowed(forbidden, caller, capability_name):
            raise RuntimeError(f"[CMPSBL:Topology:{capability_name}] BOUNDARY denied — {caller} -> {capability_name}")
    return _cmpsbl_raw_execute_tss(capability_name, input_data)`;

export const TOPOLOGICAL_SECURITY_SUITE_LAYER: CmpsblLayerDefinition = {
  id: 'topological-security-suite',
  name: 'Topological Security Suite',
  crownJewelRank: 26,
  cjpi: 91,
  module: 'TOPOLOGY',
  description: 'KNOT cycle detector + MANIFOLD trust region + GEODESIC BFS path + BOUNDARY forbidden-edge gate.',
  priceCents: 8900,
  tsCode: TS,
  pyCode: PY,
  autoWire: {
    wrapperName: 'cmpsbl_tss_boundary_allowed',
    behavior: 'Pre-flight denies execution when caller→target traverses a forbidden edge.',
    tsWire: WIRE_TS,
    pyWire: WIRE_PY,
  },
};
