/**
 * CMPSBL® VISION — Session Replay & Journey Reconstruction
 * Tracks user sessions, reconstructs journeys across authentication boundaries.
 */

export interface SessionEvent {
  id: string;
  sessionId: string;
  userId?: string;
  eventType: 'page_view' | 'feature_use' | 'login' | 'logout' | 'error' | 'action';
  page?: string;
  feature?: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export interface Session {
  id: string;
  userId?: string;
  fingerprint?: string;
  startedAt: string;
  endedAt?: string;
  durationMs: number;
  pageDepth: number;
  featuresUsed: string[];
  events: SessionEvent[];
}

export interface UserJourney {
  userId: string;
  sessions: Session[];
  totalSessions: number;
  totalDurationMs: number;
  milestones: JourneyMilestone[];
  engagementTrajectory: 'improving' | 'stable' | 'declining';
  funnelDropoffs: string[];
}

export interface JourneyMilestone {
  type: 'first_login' | 'first_feature' | 'return_visit' | 'power_user' | 'dormant_return';
  achievedAt: string;
  details?: string;
}

// Bounded in-memory session store
const MAX_SESSIONS = 500;
const MAX_EVENTS_PER_SESSION = 200;
const activeSessions = new Map<string, Session>();
const completedSessions: Session[] = [];

/**
 * Start a new session
 */
export function startSession(fingerprint?: string, userId?: string): Session {
  const session: Session = {
    id: `sess_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`,
    userId,
    fingerprint,
    startedAt: new Date().toISOString(),
    durationMs: 0,
    pageDepth: 0,
    featuresUsed: [],
    events: [],
  };

  if (activeSessions.size >= MAX_SESSIONS) {
    const oldest = activeSessions.keys().next().value;
    if (oldest) {
      const evicted = activeSessions.get(oldest)!;
      evicted.endedAt = new Date().toISOString();
      evicted.durationMs = new Date(evicted.endedAt).getTime() - new Date(evicted.startedAt).getTime();
      completedSessions.push(evicted);
      if (completedSessions.length > MAX_SESSIONS) completedSessions.shift();
      activeSessions.delete(oldest);
    }
  }

  activeSessions.set(session.id, session);
  return session;
}

/**
 * Record a session event
 */
export function recordSessionEvent(
  sessionId: string,
  eventType: SessionEvent['eventType'],
  details?: { page?: string; feature?: string; metadata?: Record<string, unknown> }
): SessionEvent | null {
  const session = activeSessions.get(sessionId);
  if (!session) return null;

  const event: SessionEvent = {
    id: `evt_${Date.now().toString(36)}`,
    sessionId,
    userId: session.userId,
    eventType,
    page: details?.page,
    feature: details?.feature,
    timestamp: new Date().toISOString(),
    metadata: details?.metadata,
  };

  if (session.events.length >= MAX_EVENTS_PER_SESSION) {
    session.events.shift();
  }
  session.events.push(event);

  if (eventType === 'page_view') session.pageDepth++;
  if (eventType === 'feature_use' && details?.feature && !session.featuresUsed.includes(details.feature)) {
    session.featuresUsed.push(details.feature);
  }

  session.durationMs = Date.now() - new Date(session.startedAt).getTime();
  return event;
}

/**
 * End a session
 */
export function endSession(sessionId: string): Session | null {
  const session = activeSessions.get(sessionId);
  if (!session) return null;

  session.endedAt = new Date().toISOString();
  session.durationMs = new Date(session.endedAt).getTime() - new Date(session.startedAt).getTime();

  activeSessions.delete(sessionId);
  completedSessions.push(session);
  if (completedSessions.length > MAX_SESSIONS) completedSessions.shift();

  return session;
}

/**
 * Reconstruct user journey across sessions
 */
export function reconstructJourney(userId: string): UserJourney {
  const allSessions = [
    ...completedSessions.filter(s => s.userId === userId),
    ...Array.from(activeSessions.values()).filter(s => s.userId === userId),
  ].sort((a, b) => new Date(a.startedAt).getTime() - new Date(b.startedAt).getTime());

  const milestones: JourneyMilestone[] = [];
  const allFeatures = new Set<string>();

  if (allSessions.length > 0) {
    milestones.push({ type: 'first_login', achievedAt: allSessions[0].startedAt });
  }
  if (allSessions.length >= 2) {
    milestones.push({ type: 'return_visit', achievedAt: allSessions[1].startedAt });
  }

  for (const s of allSessions) {
    for (const f of s.featuresUsed) {
      if (!allFeatures.has(f)) {
        allFeatures.add(f);
        if (allFeatures.size === 1) {
          milestones.push({ type: 'first_feature', achievedAt: s.startedAt, details: f });
        }
      }
    }
  }

  if (allFeatures.size >= 5) {
    milestones.push({ type: 'power_user', achievedAt: allSessions[allSessions.length - 1].startedAt });
  }

  // Detect dormant returns (gap > 7 days)
  for (let i = 1; i < allSessions.length; i++) {
    const gap = new Date(allSessions[i].startedAt).getTime() - new Date(allSessions[i - 1].endedAt || allSessions[i - 1].startedAt).getTime();
    if (gap > 7 * 24 * 60 * 60 * 1000) {
      milestones.push({ type: 'dormant_return', achievedAt: allSessions[i].startedAt });
    }
  }

  // Engagement trajectory
  let trajectory: UserJourney['engagementTrajectory'] = 'stable';
  if (allSessions.length >= 3) {
    const recent = allSessions.slice(-3);
    const durations = recent.map(s => s.durationMs);
    const slope = durations[2] - durations[0];
    trajectory = slope > 30000 ? 'improving' : slope < -30000 ? 'declining' : 'stable';
  }

  // Funnel dropoffs: pages visited but never followed by feature use
  const dropoffs: string[] = [];
  for (const s of allSessions) {
    const pages = s.events.filter(e => e.eventType === 'page_view').map(e => e.page!).filter(Boolean);
    if (pages.length > 0 && s.featuresUsed.length === 0) {
      dropoffs.push(pages[pages.length - 1]);
    }
  }

  return {
    userId,
    sessions: allSessions,
    totalSessions: allSessions.length,
    totalDurationMs: allSessions.reduce((sum, s) => sum + s.durationMs, 0),
    milestones,
    engagementTrajectory: trajectory,
    funnelDropoffs: [...new Set(dropoffs)],
  };
}

/**
 * Link anonymous session to authenticated user via fingerprint
 */
export function linkSessionsByFingerprint(fingerprint: string, userId: string): number {
  let linked = 0;

  for (const session of activeSessions.values()) {
    if (session.fingerprint === fingerprint && !session.userId) {
      session.userId = userId;
      linked++;
    }
  }
  for (const session of completedSessions) {
    if (session.fingerprint === fingerprint && !session.userId) {
      session.userId = userId;
      linked++;
    }
  }

  return linked;
}

/**
 * Get active session count
 */
export function getSessionStats(): {
  activeSessions: number;
  completedSessions: number;
  avgDurationMs: number;
  avgPageDepth: number;
} {
  const all = [...completedSessions, ...Array.from(activeSessions.values())];
  const durations = all.map(s => s.durationMs);
  const depths = all.map(s => s.pageDepth);

  return {
    activeSessions: activeSessions.size,
    completedSessions: completedSessions.length,
    avgDurationMs: durations.length > 0 ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length) : 0,
    avgPageDepth: depths.length > 0 ? Math.round((depths.reduce((a, b) => a + b, 0) / depths.length) * 10) / 10 : 0,
  };
}
