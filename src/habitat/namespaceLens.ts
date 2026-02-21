/**
 * Clockless Habitat — Namespace Lens
 * vX.UI.ULTIMATE
 *
 * All habitat data filtered through user-scoped namespace.
 * No cross-namespace bleed. Enterprise may zoom to global.
 */

import { getLatestSnapshot, type MetricSnapshot } from '@/core/metrics/snapshotEngine';
import { queryEvents, type SystemEvent } from '@/core/events/eventStore';
import type { UserTier } from '@/core/decode/depthResolver';

// ═══ Types ═════════════════════════════════════════════════════════

export interface NamespaceContext {
  namespaceId: string;
  userId: string;
  tier: UserTier;
  allowGlobalZoom: boolean;
}

export interface NamespacedData {
  namespace: NamespaceContext;
  modules: Record<string, import('@/core/metrics/metricsSchema').ModuleLiveMetrics>;
  events: SystemEvent[];
  healthIndex: number;
  activeSignals: number;
  isGlobalView: boolean;
}

// ═══ Namespace Module Mapping ═════════════════════════════════════

/** Maps user namespaces to modules they can observe */
const NAMESPACE_MODULE_MAP: Record<string, string[]> = {
  default: ['defense', 'nexus', 'ripple', 'memory', 'access', 'vision', 'shadowmesh'],
};

function getModulesForNamespace(namespaceId: string): string[] {
  return NAMESPACE_MODULE_MAP[namespaceId] ?? NAMESPACE_MODULE_MAP['default'];
}

// ═══ Lens ══════════════════════════════════════════════════════════

export function createNamespaceContext(
  userId: string,
  tier: UserTier = 'CREATOR',
  namespaceId: string = 'default'
): NamespaceContext {
  return {
    namespaceId,
    userId,
    tier,
    allowGlobalZoom: tier === 'ENTERPRISE',
  };
}

export function applyNamespaceLens(
  context: NamespaceContext,
  globalView: boolean = false
): NamespacedData {
  const snapshot = getLatestSnapshot();
  const isGlobal = globalView && context.allowGlobalZoom;
  const allowedModules = isGlobal
    ? Object.keys(snapshot?.modules ?? {})
    : getModulesForNamespace(context.namespaceId);

  // Filter modules
  const modules: NamespacedData['modules'] = {};
  if (snapshot) {
    for (const moduleId of allowedModules) {
      if (snapshot.modules[moduleId]) {
        modules[moduleId] = snapshot.modules[moduleId];
      }
    }
  }

  // Filter events
  const allEvents = queryEvents({ limit: 200 });
  const events = isGlobal
    ? allEvents
    : allEvents.filter(e => allowedModules.includes(e.module));

  // Compute namespace health
  const scores = Object.values(modules).map(m => m.healthScore);
  const healthIndex = scores.length > 0
    ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
    : 0;

  // Count active signals (events in last hour)
  const oneHourAgo = Date.now() - 3600_000;
  const activeSignals = events.filter(
    e => new Date(e.timestamp).getTime() >= oneHourAgo
  ).length;

  return {
    namespace: context,
    modules,
    events,
    healthIndex,
    activeSignals,
    isGlobalView: isGlobal,
  };
}
