/**
 * RELAY Ultimate — Message Enricher
 * Automatic context injection for routed messages.
 * Source node health, sector metadata, routing hop count, delivery attempt.
 */

export interface EnrichmentContext {
  sourceNodeHealth: number;
  sourceSector: string;
  targetSector: string;
  hopCount: number;
  deliveryAttempt: number;
  routeScore: number;
  enrichedAt: number;
  relayVersion: string;
}

export interface EnrichedMessage {
  id: string;
  originalPayload: Record<string, unknown>;
  enrichedPayload: Record<string, unknown>;
  context: EnrichmentContext;
  fieldCount: number;
  enrichedAt: number;
}

export interface EnricherStats {
  totalEnriched: number;
  avgFieldsAdded: number;
  avgHopCount: number;
}

const MAX_HISTORY = 500;
const history: EnrichedMessage[] = [];
const RELAY_VERSION = '9.0.0';

export function enrichMessage(
  payload: Record<string, unknown>,
  context: {
    sourceNodeHealth?: number;
    sourceSector?: string;
    targetSector?: string;
    hopCount?: number;
    deliveryAttempt?: number;
    routeScore?: number;
  }
): EnrichedMessage {
  const enrichmentContext: EnrichmentContext = {
    sourceNodeHealth: context.sourceNodeHealth ?? 100,
    sourceSector: context.sourceSector ?? 'unknown',
    targetSector: context.targetSector ?? 'unknown',
    hopCount: context.hopCount ?? 1,
    deliveryAttempt: context.deliveryAttempt ?? 1,
    routeScore: context.routeScore ?? 1,
    enrichedAt: Date.now(),
    relayVersion: RELAY_VERSION,
  };

  const enrichedPayload: Record<string, unknown> = {
    ...payload,
    __relay_context: enrichmentContext,
  };

  const msg: EnrichedMessage = {
    id: `enr-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    originalPayload: payload,
    enrichedPayload,
    context: enrichmentContext,
    fieldCount: Object.keys(enrichmentContext).length,
    enrichedAt: Date.now(),
  };

  if (history.length >= MAX_HISTORY) history.shift();
  history.push(msg);
  return msg;
}

export function getEnricherStats(): EnricherStats {
  return {
    totalEnriched: history.length,
    avgFieldsAdded: history.length > 0 ? history.reduce((s, m) => s + m.fieldCount, 0) / history.length : 0,
    avgHopCount: history.length > 0 ? history.reduce((s, m) => s + m.context.hopCount, 0) / history.length : 0,
  };
}

export function resetEnricherState(): void { history.length = 0; }
