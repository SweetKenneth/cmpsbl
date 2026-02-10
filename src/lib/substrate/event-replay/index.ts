/**
 * Event Replay Engine
 * v1.0.0 — Replay historical events for debugging and state reconstruction
 * 
 * Records events in an append-only log and replays them
 * to reconstruct system state at any point in time.
 */

export interface ReplayableEvent {
  id: string;
  timestamp: number;
  moduleId: string;
  eventType: string;
  payload: unknown;
  sequenceNumber: number;
}

export interface ReplaySession {
  id: string;
  startSequence: number;
  endSequence: number;
  status: 'active' | 'completed' | 'paused';
  eventsReplayed: number;
  startedAt: number;
  completedAt: number | null;
}

const eventLog: ReplayableEvent[] = [];
const sessions: ReplaySession[] = [];
let sequenceCounter = 0;

export function recordEvent(moduleId: string, eventType: string, payload: unknown): ReplayableEvent {
  const event: ReplayableEvent = {
    id: `evt-${Date.now()}-${sequenceCounter}`,
    timestamp: Date.now(), moduleId, eventType, payload,
    sequenceNumber: sequenceCounter++,
  };
  eventLog.push(event);
  return event;
}

export function createReplaySession(startSequence: number, endSequence?: number): ReplaySession {
  const session: ReplaySession = {
    id: `replay-${Date.now()}`,
    startSequence,
    endSequence: endSequence ?? sequenceCounter - 1,
    status: 'active', eventsReplayed: 0,
    startedAt: Date.now(), completedAt: null,
  };
  sessions.push(session);
  return session;
}

export function getEventsInRange(start: number, end: number): ReplayableEvent[] {
  return eventLog.filter(e => e.sequenceNumber >= start && e.sequenceNumber <= end);
}

export function replaySession(sessionId: string): ReplayableEvent[] {
  const session = sessions.find(s => s.id === sessionId);
  if (!session || session.status !== 'active') return [];
  const events = getEventsInRange(session.startSequence, session.endSequence);
  session.eventsReplayed = events.length;
  session.status = 'completed';
  session.completedAt = Date.now();
  return events;
}

export function getEventsByModule(moduleId: string): ReplayableEvent[] {
  return eventLog.filter(e => e.moduleId === moduleId);
}

export function getEventCount(): number { return eventLog.length; }
export function getSessions(): ReplaySession[] { return [...sessions]; }
export function getLatestSequence(): number { return sequenceCounter - 1; }
