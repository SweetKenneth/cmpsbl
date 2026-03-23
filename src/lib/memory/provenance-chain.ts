/**
 * CMPSBL® MEMORY — Memory Provenance Chain
 * Complete audit trail of a memory's lifecycle.
 *
 * Tracks: creation → access → merge → promotion → compression → archival
 * Each event is immutable once recorded (append-only log).
 *
 * Enables: "Show me the full history of this memory"
 */

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export interface ProvenanceEvent {
  eventId: string;
  memoryId: string;
  eventType: ProvenanceEventType;
  timestamp: number;
  actor: string;           // system component that triggered the event
  beforeState?: ProvenanceSnapshot;
  afterState?: ProvenanceSnapshot;
  metadata?: Record<string, unknown>;
}

export type ProvenanceEventType =
  | 'created' | 'accessed' | 'updated' | 'merged'
  | 'promoted' | 'demoted' | 'compressed' | 'deduplicated'
  | 'archived' | 'restored' | 'deleted' | 'tagged'
  | 'contradiction_detected' | 'interference_detected'
  | 'valence_assigned' | 'episode_linked';

export interface ProvenanceSnapshot {
  tier?: string;
  valueScore?: number;
  accessCount?: number;
  contentLength?: number;
  tags?: string[];
}

export interface ProvenanceChain {
  memoryId: string;
  events: ProvenanceEvent[];
  createdAt: number;
  lastEventAt: number;
  eventCount: number;
  currentTier?: string;
  lifespanHours: number;
}

export interface ProvenanceStats {
  totalMemories: number;
  totalEvents: number;
  avgEventsPerMemory: number;
  eventTypeDistribution: Record<string, number>;
  avgLifespanHours: number;
}

// ═══════════════════════════════════════════════════════════════════════════════
// ENGINE
// ═══════════════════════════════════════════════════════════════════════════════

const MAX_MEMORIES = 5000;
const MAX_EVENTS_PER_MEMORY = 100;

let eventCounter = 0;

class ProvenanceEngine {
  private chains = new Map<string, ProvenanceEvent[]>();

  /**
   * Record a provenance event for a memory.
   */
  record(
    memoryId: string,
    eventType: ProvenanceEventType,
    actor: string,
    options?: {
      beforeState?: ProvenanceSnapshot;
      afterState?: ProvenanceSnapshot;
      metadata?: Record<string, unknown>;
    }
  ): ProvenanceEvent {
    const event: ProvenanceEvent = {
      eventId: `prov-${++eventCounter}`,
      memoryId,
      eventType,
      timestamp: Date.now(),
      actor,
      beforeState: options?.beforeState,
      afterState: options?.afterState,
      metadata: options?.metadata,
    };

    if (!this.chains.has(memoryId)) this.chains.set(memoryId, []);
    const chain = this.chains.get(memoryId)!;
    chain.push(event);

    // Cap events per memory
    if (chain.length > MAX_EVENTS_PER_MEMORY) {
      chain.splice(0, chain.length - MAX_EVENTS_PER_MEMORY);
    }

    this.enforceCapacity();
    return event;
  }

  /**
   * Get the full provenance chain for a memory.
   */
  getChain(memoryId: string): ProvenanceChain | null {
    const events = this.chains.get(memoryId);
    if (!events || events.length === 0) return null;

    const createdAt = events[0].timestamp;
    const lastEventAt = events[events.length - 1].timestamp;
    const lastEvent = events[events.length - 1];

    return {
      memoryId,
      events: [...events],
      createdAt,
      lastEventAt,
      eventCount: events.length,
      currentTier: lastEvent.afterState?.tier,
      lifespanHours: (lastEventAt - createdAt) / 3600000,
    };
  }

  /**
   * Get events of a specific type across all memories.
   */
  getEventsByType(eventType: ProvenanceEventType, limit: number = 50): ProvenanceEvent[] {
    const results: ProvenanceEvent[] = [];
    for (const events of this.chains.values()) {
      for (const event of events) {
        if (event.eventType === eventType) results.push(event);
      }
    }
    results.sort((a, b) => b.timestamp - a.timestamp);
    return results.slice(0, limit);
  }

  /**
   * Get recent events across all memories.
   */
  getRecentEvents(limit: number = 50): ProvenanceEvent[] {
    const all: ProvenanceEvent[] = [];
    for (const events of this.chains.values()) {
      all.push(...events);
    }
    all.sort((a, b) => b.timestamp - a.timestamp);
    return all.slice(0, limit);
  }

  /**
   * Trace the tier journey of a memory.
   */
  getTierHistory(memoryId: string): Array<{ tier: string; timestamp: number; reason: ProvenanceEventType }> {
    const events = this.chains.get(memoryId);
    if (!events) return [];

    const tierChanges: Array<{ tier: string; timestamp: number; reason: ProvenanceEventType }> = [];
    for (const event of events) {
      if (event.afterState?.tier && (tierChanges.length === 0 || tierChanges[tierChanges.length - 1].tier !== event.afterState.tier)) {
        tierChanges.push({
          tier: event.afterState.tier,
          timestamp: event.timestamp,
          reason: event.eventType,
        });
      }
    }

    return tierChanges;
  }

  /**
   * Find memories that have been most active (most provenance events).
   */
  getMostActive(limit: number = 20): Array<{ memoryId: string; eventCount: number; lastEvent: number }> {
    return [...this.chains.entries()]
      .map(([memoryId, events]) => ({
        memoryId,
        eventCount: events.length,
        lastEvent: events[events.length - 1]?.timestamp || 0,
      }))
      .sort((a, b) => b.eventCount - a.eventCount)
      .slice(0, limit);
  }

  getStats(): ProvenanceStats {
    const allEvents: ProvenanceEvent[] = [];
    const typeCounts: Record<string, number> = {};
    let totalLifespan = 0;

    for (const events of this.chains.values()) {
      allEvents.push(...events);
      for (const e of events) {
        typeCounts[e.eventType] = (typeCounts[e.eventType] || 0) + 1;
      }
      if (events.length > 0) {
        totalLifespan += (events[events.length - 1].timestamp - events[0].timestamp) / 3600000;
      }
    }

    return {
      totalMemories: this.chains.size,
      totalEvents: allEvents.length,
      avgEventsPerMemory: this.chains.size > 0 ? allEvents.length / this.chains.size : 0,
      eventTypeDistribution: typeCounts,
      avgLifespanHours: this.chains.size > 0 ? totalLifespan / this.chains.size : 0,
    };
  }

  private enforceCapacity(): void {
    if (this.chains.size <= MAX_MEMORIES) return;
    // Remove oldest chains with fewest events
    const sorted = [...this.chains.entries()]
      .map(([id, events]) => ({ id, events, lastEvent: events[events.length - 1]?.timestamp || 0 }))
      .sort((a, b) => a.lastEvent - b.lastEvent);
    const excess = this.chains.size - MAX_MEMORIES;
    for (let i = 0; i < excess; i++) this.chains.delete(sorted[i].id);
  }

  clear(): void {
    this.chains.clear();
    eventCounter = 0;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// SINGLETON
// ═══════════════════════════════════════════════════════════════════════════════

let _engine: ProvenanceEngine | null = null;

export function getProvenanceEngine(): ProvenanceEngine {
  if (!_engine) _engine = new ProvenanceEngine();
  return _engine;
}

export function resetProvenanceEngine(): void {
  _engine = null;
}
