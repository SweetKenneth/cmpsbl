/**
 * S-Tier 105 — Forensic Replay Engine
 * ID: S-90 | CJPI: 89 | Module: AUDIT
 * 
 * Complete system state replay from audit trail for incident investigation.
 */

export interface AuditEvent {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  target: string;
  beforeState: Record<string, unknown> | null;
  afterState: Record<string, unknown> | null;
  metadata: Record<string, unknown>;
}

export interface ReplaySession {
  id: string;
  startTime: string;
  endTime: string;
  events: AuditEvent[];
  stateSnapshots: Map<string, Record<string, unknown>>;
  cursor: number;
}

export interface ReplayResult {
  currentEvent: AuditEvent | null;
  currentState: Record<string, Record<string, unknown>>;
  position: number;
  totalEvents: number;
  timestamp: string;
}

export class ForensicReplayEngine {
  private events: AuditEvent[] = [];

  ingestEvents(events: AuditEvent[]): void {
    this.events.push(...events);
    this.events.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }

  createSession(startTime: string, endTime: string): ReplaySession {
    const start = new Date(startTime).getTime();
    const end = new Date(endTime).getTime();
    const filtered = this.events.filter(e => {
      const t = new Date(e.timestamp).getTime();
      return t >= start && t <= end;
    });

    return {
      id: crypto.randomUUID(),
      startTime,
      endTime,
      events: filtered,
      stateSnapshots: new Map(),
      cursor: -1,
    };
  }

  stepForward(session: ReplaySession): ReplayResult {
    if (session.cursor < session.events.length - 1) {
      session.cursor++;
      const event = session.events[session.cursor];
      if (event.afterState) {
        session.stateSnapshots.set(event.target, event.afterState);
      }
    }

    return this.getState(session);
  }

  stepBackward(session: ReplaySession): ReplayResult {
    if (session.cursor >= 0) {
      const event = session.events[session.cursor];
      if (event.beforeState) {
        session.stateSnapshots.set(event.target, event.beforeState);
      }
      session.cursor--;
    }

    return this.getState(session);
  }

  seekTo(session: ReplaySession, position: number): ReplayResult {
    // Rebuild state from beginning to target position
    session.stateSnapshots.clear();
    session.cursor = -1;

    const target = Math.min(position, session.events.length - 1);
    for (let i = 0; i <= target; i++) {
      session.cursor = i;
      const event = session.events[i];
      if (event.afterState) {
        session.stateSnapshots.set(event.target, event.afterState);
      }
    }

    return this.getState(session);
  }

  search(session: ReplaySession, query: { actor?: string; action?: string; target?: string }): AuditEvent[] {
    return session.events.filter(e =>
      (!query.actor || e.actor === query.actor) &&
      (!query.action || e.action.includes(query.action)) &&
      (!query.target || e.target === query.target)
    );
  }

  private getState(session: ReplaySession): ReplayResult {
    const currentState: Record<string, Record<string, unknown>> = {};
    for (const [key, val] of session.stateSnapshots) {
      currentState[key] = { ...val };
    }

    return {
      currentEvent: session.cursor >= 0 ? session.events[session.cursor] : null,
      currentState,
      position: session.cursor,
      totalEvents: session.events.length,
      timestamp: new Date().toISOString(),
    };
  }
}
