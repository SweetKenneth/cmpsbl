/**
 * Clockless Habitat — State Resolver
 * vX.UI.ULTIMATE
 *
 * Resolves the unified habitat state from snapshot, temporal, integrity,
 * namespace, and spatial memory. Single source of truth for rendering.
 */

import { readTemporalState, type TemporalReading } from './temporalEngine';
import { applyNamespaceLens, type NamespaceContext, type NamespacedData } from './namespaceLens';
import { loadSpatialMemory, type SpatialState } from './spatialMemory';
import { getLastIntegrity, type HabitatIntegrity } from './integrityLayer';
import { buildDepthConfig, type DepthConfig } from './depthEngine';
import { checkAutoWatch, type DecodeUtterance } from './decodeInterface';

// ═══ Types ═════════════════════════════════════════════════════════

export interface HabitatState {
  temporal: TemporalReading;
  namespace: NamespacedData;
  spatial: SpatialState;
  integrity: HabitatIntegrity;
  depth: DepthConfig;
  autoWatchUtterance: DecodeUtterance | null;
  resolvedAt: string;
}

// ═══ Resolver ══════════════════════════════════════════════════════

export function resolveHabitatState(
  namespaceContext: NamespaceContext,
  globalView: boolean = false
): HabitatState {
  const temporal = readTemporalState();
  const namespace = applyNamespaceLens(namespaceContext, globalView);
  const spatial = loadSpatialMemory(namespaceContext.namespaceId);
  const integrity = getLastIntegrity();
  const depth = buildDepthConfig(
    temporal.state,
    temporal.depthCompression,
    namespace.isGlobalView
  );

  // Check autowatch
  const autoWatchUtterance = checkAutoWatch(
    integrity,
    temporal.escalationCount,
    temporal.repairVelocity
  );

  return {
    temporal,
    namespace,
    spatial,
    integrity,
    depth,
    autoWatchUtterance,
    resolvedAt: new Date().toISOString(),
  };
}
