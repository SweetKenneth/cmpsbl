/**
 * Event Replay — Record and replay substrate events for debugging
 * Captures event streams and enables time-travel debugging
 */

interface ReplayEvent {
  id: string;
  timestamp: number;
  module: string;
  action: string;
  payload: unknown;
  outcome?: 'success' | 'failure';
  durationMs?: number;
}

interface ReplaySession {
  id: string;
  startedAt: number;
  events: ReplayEvent[];
  metadata?: Record<string, unknown>;
}

let activeSession: ReplaySession | null = null;
const sessions: ReplaySession[] = [];
/** O(1) session lookup by ID */
const sessionIndex = new Map<string, ReplaySession>();
const MAX_SESSIONS = 10;
const MAX_EVENTS_PER_SESSION = 500;

let idCounter = 0;
function nextId(): string {
  return `evt_${Date.now()}_${++idCounter}`;
}

export function startRecording(metadata?: Record<string, unknown>): string {
  const id = `session_${Date.now()}`;
  activeSession = { id, startedAt: Date.now(), events: [], metadata };
  return id;
}

export function stopRecording(): ReplaySession | null {
  if (!activeSession) return null;
  const session = { ...activeSession };
  sessions.push(session);
  sessionIndex.set(session.id, session);
  if (sessions.length > MAX_SESSIONS) {
    const evicted = sessions.shift()!;
    sessionIndex.delete(evicted.id);
  }
  activeSession = null;
  return session;
}

export function recordEvent(module: string, action: string, payload: unknown, outcome?: ReplayEvent['outcome'], durationMs?: number): void {
  if (!activeSession) return;
  if (activeSession.events.length >= MAX_EVENTS_PER_SESSION) return;
  activeSession.events.push({
    id: nextId(),
    timestamp: Date.now(),
    module,
    action,
    payload,
    outcome,
    durationMs,
  });
}

export function isRecording(): boolean {
  return activeSession !== null;
}

/** O(1) session lookup */
export function getSession(sessionId: string): ReplaySession | undefined {
  return sessionIndex.get(sessionId);
}

export function getAllSessions(): ReplaySession[] {
  return [...sessions];
}

/** Replay events through a handler with original timing */
export async function replay(
  sessionId: string,
  handler: (event: ReplayEvent) => Promise<void> | void,
  speedMultiplier = 1,
): Promise<void> {
  const session = getSession(sessionId);
  if (!session || session.events.length === 0) return;

  for (let i = 0; i < session.events.length; i++) {
    const event = session.events[i];
    if (i > 0) {
      const gap = event.timestamp - session.events[i - 1].timestamp;
      await new Promise(r => setTimeout(r, gap / speedMultiplier));
    }
    await handler(event);
  }
}

/** Filter events by module or action */
export function filterEvents(sessionId: string, filter: { module?: string; action?: string }): ReplayEvent[] {
  const session = getSession(sessionId);
  if (!session) return [];
  return session.events.filter(e =>
    (!filter.module || e.module === filter.module) &&
    (!filter.action || e.action === filter.action)
  );
}
