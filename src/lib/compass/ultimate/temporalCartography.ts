/**
 * COMPASS Ultimate — Temporal Cartography
 * Timeline reasoning engine. Tracks event sequences, detects temporal anomalies,
 * and builds causal timelines across primitives.
 */

export interface TemporalEvent {
  id: string;
  nodeId: string;
  eventType: string;
  timestamp: number;
  causalParentId?: string;
  metadata?: Record<string, unknown>;
}

export interface Timeline {
  id: string;
  label: string;
  events: TemporalEvent[];
  anomalies: TemporalAnomaly[];
  span: { start: number; end: number };
}

export interface TemporalAnomaly {
  type: 'out_of_order' | 'gap' | 'burst' | 'retrograde';
  eventId: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  detectedAt: number;
}

export interface CausalChain {
  rootEventId: string;
  chain: TemporalEvent[];
  depth: number;
}

export interface TemporalStats {
  totalEvents: number;
  totalTimelines: number;
  totalAnomalies: number;
  avgEventsPerTimeline: number;
  anomalyRate: number;
}

const MAX_EVENTS = 5000;
const MAX_TIMELINES = 100;
const GAP_THRESHOLD = 60_000; // 1 min gap = anomaly
const BURST_THRESHOLD = 10;   // 10 events in 1 second

const events: TemporalEvent[] = [];
const timelines = new Map<string, Timeline>();

export function recordEvent(
  nodeId: string, eventType: string,
  causalParentId?: string, metadata?: Record<string, unknown>
): TemporalEvent {
  const evt: TemporalEvent = {
    id: `evt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    nodeId, eventType, timestamp: Date.now(),
    causalParentId, metadata,
  };
  if (events.length >= MAX_EVENTS) events.shift();
  events.push(evt);
  return evt;
}

export function buildTimeline(label: string, nodeFilter?: string, timeRange?: { start: number; end: number }): Timeline {
  let filtered = [...events];
  if (nodeFilter) filtered = filtered.filter(e => e.nodeId === nodeFilter);
  if (timeRange) filtered = filtered.filter(e => e.timestamp >= timeRange.start && e.timestamp <= timeRange.end);
  filtered.sort((a, b) => a.timestamp - b.timestamp);

  const anomalies = detectAnomalies(filtered);

  const timeline: Timeline = {
    id: `tl-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    label, events: filtered, anomalies,
    span: {
      start: filtered.length > 0 ? filtered[0].timestamp : 0,
      end: filtered.length > 0 ? filtered[filtered.length - 1].timestamp : 0,
    },
  };

  if (timelines.size >= MAX_TIMELINES) {
    const oldest = [...timelines.values()].sort((a, b) => a.span.end - b.span.end)[0];
    if (oldest) timelines.delete(oldest.id);
  }
  timelines.set(timeline.id, timeline);
  return timeline;
}

function detectAnomalies(sorted: TemporalEvent[]): TemporalAnomaly[] {
  const anomalies: TemporalAnomaly[] = [];

  for (let i = 1; i < sorted.length; i++) {
    const gap = sorted[i].timestamp - sorted[i - 1].timestamp;

    // Out of order (shouldn't happen with sort, but check causal parents)
    if (sorted[i].causalParentId) {
      const parent = sorted.find(e => e.id === sorted[i].causalParentId);
      if (parent && parent.timestamp > sorted[i].timestamp) {
        anomalies.push({
          type: 'retrograde', eventId: sorted[i].id,
          description: `Event occurs before its causal parent`,
          severity: 'high', detectedAt: Date.now(),
        });
      }
    }

    // Gap detection
    if (gap > GAP_THRESHOLD) {
      anomalies.push({
        type: 'gap', eventId: sorted[i].id,
        description: `${(gap / 1000).toFixed(1)}s gap in timeline`,
        severity: gap > GAP_THRESHOLD * 5 ? 'high' : 'medium',
        detectedAt: Date.now(),
      });
    }
  }

  // Burst detection
  for (let i = 0; i < sorted.length; i++) {
    let burstEnd = i;
    while (burstEnd < sorted.length - 1 && sorted[burstEnd + 1].timestamp - sorted[i].timestamp < 1000) burstEnd++;
    if (burstEnd - i >= BURST_THRESHOLD) {
      anomalies.push({
        type: 'burst', eventId: sorted[i].id,
        description: `${burstEnd - i + 1} events in < 1 second`,
        severity: 'medium', detectedAt: Date.now(),
      });
      i = burstEnd; // skip past burst
    }
  }

  return anomalies;
}

export function traceCausalChain(eventId: string): CausalChain {
  const chain: TemporalEvent[] = [];
  let current = events.find(e => e.id === eventId);

  while (current && chain.length < 50) {
    chain.push(current);
    if (!current.causalParentId) break;
    current = events.find(e => e.id === current!.causalParentId);
    if (chain.includes(current!)) break; // cycle protection
  }

  return { rootEventId: chain.length > 0 ? chain[chain.length - 1].id : eventId, chain, depth: chain.length };
}

export function getTemporalStats(): TemporalStats {
  const tls = [...timelines.values()];
  const totalAnomalies = tls.reduce((s, t) => s + t.anomalies.length, 0);
  const totalTlEvents = tls.reduce((s, t) => s + t.events.length, 0);

  return {
    totalEvents: events.length,
    totalTimelines: tls.length,
    totalAnomalies,
    avgEventsPerTimeline: tls.length > 0 ? totalTlEvents / tls.length : 0,
    anomalyRate: totalTlEvents > 0 ? totalAnomalies / totalTlEvents : 0,
  };
}

export function resetTemporalState(): void {
  events.length = 0;
  timelines.clear();
}
