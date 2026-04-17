/**
 * CMPSBL® Inventory Layer — Edge Compute Suite
 * Primitives: SHARD · CACHE · BACKHAUL · GEOFENCE
 *
 *   SHARD     → consistent-hash node selection (FNV-1a mod N)
 *   CACHE     → tiny LRU with O(1) get/set
 *   BACKHAUL  → exponential-backoff schedule generator
 *   GEOFENCE  → great-circle distance + radius gate (haversine, km)
 *
 * Auto-wire applies a SHARD pin per call: identical capability+input pairs
 * always route through the same logical shard ID, exposed as
 * `_cmpsbl_shard_id` in the result for downstream pinning.
 */
import type { CmpsblLayerDefinition } from '../types';

const TS = `
// ╔═══════════════════════════════════════════════════════════════════════════════╗
// ║  ASCENSION LAYER — Edge Compute Suite (proprietary).                          ║
// ╚═══════════════════════════════════════════════════════════════════════════════╝

// ── SHARD · FNV-1a mod N ────────────────────────────────────────────────────
export function cmpsbl_ecs_shard_pick(key: string, n: number): number {
  if (n <= 0) return 0;
  let h = 0x811c9dc5;
  for (let i = 0; i < key.length; i++) {
    h ^= key.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h % n;
}

// ── CACHE · O(1) LRU ────────────────────────────────────────────────────────
export class CmpsblLru<V> {
  private cap: number;
  private map = new Map<string, V>();
  constructor(capacity: number) { this.cap = Math.max(1, capacity); }
  get(k: string): V | undefined {
    if (!this.map.has(k)) return undefined;
    const v = this.map.get(k)!;
    this.map.delete(k);
    this.map.set(k, v);
    return v;
  }
  set(k: string, v: V): void {
    if (this.map.has(k)) this.map.delete(k);
    this.map.set(k, v);
    if (this.map.size > this.cap) {
      const firstKey = this.map.keys().next().value as string;
      this.map.delete(firstKey);
    }
  }
  size(): number { return this.map.size; }
}

// ── BACKHAUL · backoff schedule ─────────────────────────────────────────────
export function cmpsbl_ecs_backhaul_schedule(attempts: number, baseMs: number = 100, capMs: number = 30000): number[] {
  const out: number[] = [];
  for (let i = 0; i < attempts; i++) {
    const delay = Math.min(capMs, baseMs * Math.pow(2, i));
    out.push(delay);
  }
  return out;
}

// ── GEOFENCE · haversine km + radius gate ───────────────────────────────────
export function cmpsbl_ecs_geofence_dist_km(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}
export function cmpsbl_ecs_geofence_inside(centerLat: number, centerLon: number, radiusKm: number, lat: number, lon: number): boolean {
  return cmpsbl_ecs_geofence_dist_km(centerLat, centerLon, lat, lon) <= radiusKm;
}
`;

const PY = `
# ╔═══════════════════════════════════════════════════════════════════════════════╗
# ║  ASCENSION LAYER — Edge Compute Suite (proprietary).                          ║
# ╚═══════════════════════════════════════════════════════════════════════════════╝

import math
from collections import OrderedDict
from typing import List

def cmpsbl_ecs_shard_pick(key: str, n: int) -> int:
    if n <= 0: return 0
    h = 0x811c9dc5
    for ch in key:
        h ^= ord(ch)
        h = (h * 0x01000193) & 0xFFFFFFFF
    return h % n

class CmpsblLru:
    def __init__(self, capacity: int):
        self.cap = max(1, capacity)
        self.map: "OrderedDict[str, object]" = OrderedDict()
    def get(self, k: str):
        if k not in self.map: return None
        self.map.move_to_end(k)
        return self.map[k]
    def set(self, k: str, v) -> None:
        if k in self.map: self.map.move_to_end(k)
        self.map[k] = v
        if len(self.map) > self.cap:
            self.map.popitem(last=False)
    def size(self) -> int:
        return len(self.map)

def cmpsbl_ecs_backhaul_schedule(attempts: int, base_ms: int = 100, cap_ms: int = 30000) -> List[int]:
    return [min(cap_ms, base_ms * (2 ** i)) for i in range(attempts)]

def cmpsbl_ecs_geofence_dist_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    R = 6371
    rad = math.radians
    dLat = rad(lat2 - lat1)
    dLon = rad(lon2 - lon1)
    a = math.sin(dLat / 2) ** 2 + math.cos(rad(lat1)) * math.cos(rad(lat2)) * math.sin(dLon / 2) ** 2
    return 2 * R * math.asin(math.sqrt(a))

def cmpsbl_ecs_geofence_inside(center_lat: float, center_lon: float, radius_km: float, lat: float, lon: float) -> bool:
    return cmpsbl_ecs_geofence_dist_km(center_lat, center_lon, lat, lon) <= radius_km
`;

const WIRE_TS = `
const _cmpsbl_ecs_shards = 16;
const _cmpsbl_raw_execute_ecs = cmpsbl_execute;
cmpsbl_execute = function cmpsbl_execute_ecs(capabilityName: string, input: Record<string, unknown>): ExecutionResult {
  const key = capabilityName + ':' + (typeof input._cmpsbl_route_key === 'string' ? input._cmpsbl_route_key : '');
  const shardId = cmpsbl_ecs_shard_pick(key, _cmpsbl_ecs_shards);
  const result = _cmpsbl_raw_execute_ecs(capabilityName, input);
  if (result && typeof result === 'object' && !Array.isArray(result)) {
    return { ...(result as Record<string, unknown>), _cmpsbl_shard_id: shardId } as ExecutionResult;
  }
  return result;
};`;

const WIRE_PY = `
_cmpsbl_ecs_shards = 16
_cmpsbl_raw_execute_ecs = cmpsbl_execute
def cmpsbl_execute(capability_name: str, input_data: dict) -> dict:
    """Execute under Edge Compute Suite (consistent-hash shard pin)."""
    key = capability_name + ':' + str(input_data.get('_cmpsbl_route_key', ''))
    shard_id = cmpsbl_ecs_shard_pick(key, _cmpsbl_ecs_shards)
    result = _cmpsbl_raw_execute_ecs(capability_name, input_data)
    if isinstance(result, dict):
        return { **result, "_cmpsbl_shard_id": shard_id }
    return result`;

export const EDGE_COMPUTE_SUITE_LAYER: CmpsblLayerDefinition = {
  id: 'edge-compute-suite',
  name: 'Edge Compute Suite',
  crownJewelRank: 31,
  cjpi: 88,
  module: 'EDGE',
  description: 'SHARD consistent-hash + CACHE LRU + BACKHAUL exponential backoff + GEOFENCE haversine gate.',
  priceCents: 7900,
  tsCode: TS,
  pyCode: PY,
  autoWire: {
    wrapperName: 'cmpsbl_ecs_shard_pick',
    behavior: 'Pins each call to a deterministic shard id and stamps it onto the result for downstream affinity.',
    tsWire: WIRE_TS,
    pyWire: WIRE_PY,
  },
};
