/**
 * Event Bridge & Transformation Pipeline
 * 
 * Universal event ingestion and transformation layer for connecting
 * external event streams to the substrate's NERVE signal network.
 * 
 * @module integration/ultimate/eventBridge
 * @version 9.0.0 — Babel Gate
 */

// ── Types ──────────────────────────────────────────────────────

export type IngestionMethod = 'webhook' | 'polling' | 'sse' | 'websocket';

export interface EventSource {
  id: string;
  integrationId: string;
  method: IngestionMethod;
  enabled: boolean;
  pollIntervalMs?: number;
  lastEventAt: number | null;
  eventCount: number;
}

export interface FilterRule {
  field: string;
  operator: 'equals' | 'contains' | 'gt' | 'lt' | 'exists' | 'not_exists';
  value: unknown;
  action: 'include' | 'exclude';
}

export interface TransformationPipeline {
  sourceId: string;
  filters: FilterRule[];
  /** Field mappings: external field → substrate signal field */
  fieldMap: Record<string, string>;
  /** Static enrichment data added to every event */
  enrichment: Record<string, unknown>;
  targetSignalType: string;
  targetNode: string;
}

export interface NormalizedEvent {
  sourceId: string;
  originalPayload: unknown;
  normalizedPayload: Record<string, unknown>;
  signalType: string;
  targetNode: string;
  timestamp: number;
  traceId: string;
}

// ── State ──────────────────────────────────────────────────────

const sources = new Map<string, EventSource>();
const pipelines = new Map<string, TransformationPipeline>();
const eventHistory: NormalizedEvent[] = [];
const MAX_HISTORY = 500;
let eventCounter = 0;

// ── Core ───────────────────────────────────────────────────────

/** Register an event source */
export function registerSource(source: Omit<EventSource, 'lastEventAt' | 'eventCount'>): EventSource {
  const full: EventSource = { ...source, lastEventAt: null, eventCount: 0 };
  sources.set(source.id, full);
  return full;
}

/** Register a transformation pipeline */
export function registerPipeline(pipeline: TransformationPipeline): void {
  pipelines.set(pipeline.sourceId, pipeline);
}

/** Process an incoming external event through the pipeline */
export function processEvent(sourceId: string, rawPayload: unknown): NormalizedEvent | null {
  const source = sources.get(sourceId);
  if (!source || !source.enabled) return null;

  const pipeline = pipelines.get(sourceId);
  if (!pipeline) return null;

  // Apply filters
  if (!passesFilters(rawPayload, pipeline.filters)) return null;

  // Apply field mappings
  const mapped: Record<string, unknown> = {};
  if (rawPayload && typeof rawPayload === 'object') {
    const raw = rawPayload as Record<string, unknown>;
    for (const [externalField, signalField] of Object.entries(pipeline.fieldMap)) {
      if (raw[externalField] !== undefined) {
        mapped[signalField] = raw[externalField];
      }
    }
  }

  // Apply enrichment
  for (const [key, value] of Object.entries(pipeline.enrichment)) {
    mapped[key] = value;
  }

  const event: NormalizedEvent = {
    sourceId,
    originalPayload: rawPayload,
    normalizedPayload: mapped,
    signalType: pipeline.targetSignalType,
    targetNode: pipeline.targetNode,
    timestamp: Date.now(),
    traceId: `evt-${++eventCounter}`,
  };

  // Update source stats
  source.lastEventAt = event.timestamp;
  source.eventCount++;

  // Store in history
  eventHistory.push(event);
  if (eventHistory.length > MAX_HISTORY) eventHistory.shift();

  return event;
}

function passesFilters(payload: unknown, filters: FilterRule[]): boolean {
  if (!payload || typeof payload !== 'object') return filters.length === 0;
  const obj = payload as Record<string, unknown>;

  for (const filter of filters) {
    const value = obj[filter.field];
    let matches = false;

    switch (filter.operator) {
      case 'equals': matches = value === filter.value; break;
      case 'contains': matches = typeof value === 'string' && value.includes(String(filter.value)); break;
      case 'gt': matches = typeof value === 'number' && value > (filter.value as number); break;
      case 'lt': matches = typeof value === 'number' && value < (filter.value as number); break;
      case 'exists': matches = value !== undefined && value !== null; break;
      case 'not_exists': matches = value === undefined || value === null; break;
    }

    if (filter.action === 'exclude' && matches) return false;
    if (filter.action === 'include' && !matches) return false;
  }

  return true;
}

/** Replay historical events through updated pipelines */
export function replayEvents(sourceId: string, since?: number): NormalizedEvent[] {
  const relevantEvents = eventHistory.filter(e =>
    e.sourceId === sourceId && (!since || e.timestamp >= since)
  );
  const results: NormalizedEvent[] = [];
  for (const evt of relevantEvents) {
    const reprocessed = processEvent(sourceId, evt.originalPayload);
    if (reprocessed) results.push(reprocessed);
  }
  return results;
}

export function getEventBridgeHealth() {
  return {
    totalSources: sources.size,
    activeSources: Array.from(sources.values()).filter(s => s.enabled).length,
    totalPipelines: pipelines.size,
    eventsProcessed: eventCounter,
    historySize: eventHistory.length,
  };
}

export function resetEventBridge(): void {
  sources.clear();
  pipelines.clear();
  eventHistory.length = 0;
  eventCounter = 0;
}
