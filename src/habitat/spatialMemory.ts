/**
 * Clockless Habitat — Spatial Memory
 * vX.UI.ULTIMATE
 *
 * Persists camera position, zoom, focus, and cluster state per namespace.
 * Restored on load with smooth fade-in. No abrupt camera movement.
 */

// ═══ Types ═════════════════════════════════════════════════════════

export interface SpatialState {
  cameraPosition: [number, number, number];
  cameraZoomLevel: number;
  focusedNodeId: string | null;
  expandedClusters: string[];
  depthPreference: number; // 0 = default, negative = closer, positive = further
  globalZoomState: boolean;
  timestamp: string;
}

// ═══ Defaults ═════════════════════════════════════════════════════

const DEFAULT_SPATIAL: SpatialState = {
  cameraPosition: [0, 0, 8],
  cameraZoomLevel: 1,
  focusedNodeId: null,
  expandedClusters: [],
  depthPreference: 0,
  globalZoomState: false,
  timestamp: new Date().toISOString(),
};

// ═══ Storage Key ═══════════════════════════════════════════════════

function storageKey(namespaceId: string): string {
  return `habitat:spatial:${namespaceId}`;
}

// ═══ Throttled Write ══════════════════════════════════════════════

let writeTimer: ReturnType<typeof setTimeout> | null = null;
const WRITE_THROTTLE_MS = 2000;

function throttledWrite(key: string, state: SpatialState): void {
  if (writeTimer) clearTimeout(writeTimer);
  writeTimer = setTimeout(() => {
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch {
      // Storage full or unavailable — silent fail
    }
  }, WRITE_THROTTLE_MS);
}

// ═══ Public API ════════════════════════════════════════════════════

export function loadSpatialMemory(namespaceId: string): SpatialState {
  try {
    const raw = localStorage.getItem(storageKey(namespaceId));
    if (!raw) return { ...DEFAULT_SPATIAL };
    const parsed = JSON.parse(raw) as Partial<SpatialState>;
    return { ...DEFAULT_SPATIAL, ...parsed };
  } catch {
    return { ...DEFAULT_SPATIAL };
  }
}

export function saveSpatialMemory(namespaceId: string, state: SpatialState): void {
  throttledWrite(storageKey(namespaceId), {
    ...state,
    timestamp: new Date().toISOString(),
  });
}

export function updateSpatialMemory(
  namespaceId: string,
  update: Partial<SpatialState>
): SpatialState {
  const current = loadSpatialMemory(namespaceId);
  const next = { ...current, ...update, timestamp: new Date().toISOString() };
  saveSpatialMemory(namespaceId, next);
  return next;
}

export function resetSpatialMemory(namespaceId: string): SpatialState {
  const fresh = { ...DEFAULT_SPATIAL, timestamp: new Date().toISOString() };
  try {
    localStorage.removeItem(storageKey(namespaceId));
  } catch {
    // silent
  }
  return fresh;
}

export function getDefaultSpatial(): SpatialState {
  return { ...DEFAULT_SPATIAL };
}
