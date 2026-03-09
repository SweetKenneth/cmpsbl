/**
 * RIPPLE Event Replay Engine — v1.0.0
 * Point-in-time event replay with filtering and transformation
 * 
 * Provides:
 * - Time-based replay from any point
 * - Event filtering by type, source, or custom predicate
 * - Replay speed control (1x to 100x)
 * - Transformation hooks for event mutation during replay
 */

import { supabase } from '@/integrations/supabase/client';
import { emit } from '@/lib/substrate/events';

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export interface ReplayEvent {
  id: string;
  type: string;
  source: string;
  payload: unknown;
  originalTimestamp: string;
  replayedAt?: string;
}

export interface ReplayConfig {
  fromTime: Date;
  toTime?: Date;
  eventTypes?: string[];
  sources?: string[];
  speed: number; // 1 = realtime, 10 = 10x speed, etc.
  maxEvents?: number;
  filter?: (event: ReplayEvent) => boolean;
  transform?: (event: ReplayEvent) => ReplayEvent;
}

export interface ReplaySession {
  id: string;
  config: ReplayConfig;
  status: 'pending' | 'running' | 'paused' | 'completed' | 'cancelled';
  eventsReplayed: number;
  eventsTotal: number;
  startedAt: string;
  completedAt?: string;
  currentPosition?: string;
  errors: ReplayError[];
}

export interface ReplayError {
  eventId: string;
  error: string;
  timestamp: string;
}

export interface ReplayProgress {
  sessionId: string;
  eventsReplayed: number;
  eventsTotal: number;
  percentComplete: number;
  currentEventTime?: string;
  estimatedTimeRemaining?: number;
}

// ═══════════════════════════════════════════════════════════════════════════════
// STATE
// ═══════════════════════════════════════════════════════════════════════════════

const activeSessions = new Map<string, ReplaySession>();
const sessionHandlers = new Map<string, (event: ReplayEvent) => Promise<void>>();

// Statistics
let totalReplays = 0;
let totalEventsReplayed = 0;

// ═══════════════════════════════════════════════════════════════════════════════
// SESSION MANAGEMENT
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Create a new replay session
 */
export function createReplaySession(
  config: ReplayConfig,
  handler: (event: ReplayEvent) => Promise<void>
): ReplaySession {
  const session: ReplaySession = {
    id: crypto.randomUUID(),
    config,
    status: 'pending',
    eventsReplayed: 0,
    eventsTotal: 0,
    startedAt: new Date().toISOString(),
    errors: [],
  };

  activeSessions.set(session.id, session);
  sessionHandlers.set(session.id, handler);
  totalReplays++;

  emit({
    module: 'ripple',
    event_type: 'replay_session_created',
    outcome: 'succeeded',
    data: { sessionId: session.id, fromTime: config.fromTime.toISOString() },
  });

  return session;
}

/**
 * Start or resume a replay session
 */
export async function startReplay(sessionId: string): Promise<void> {
  const session = activeSessions.get(sessionId);
  const handler = sessionHandlers.get(sessionId);

  if (!session || !handler) {
    throw new Error(`Replay session not found: ${sessionId}`);
  }

  if (session.status === 'running') {
    return; // Already running
  }

  session.status = 'running';

  try {
    await executeReplay(session, handler);
  } catch (error) {
    session.status = 'cancelled';
    session.errors.push({
      eventId: 'session',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    });
  }
}

/**
 * Pause a running replay
 */
export function pauseReplay(sessionId: string): boolean {
  const session = activeSessions.get(sessionId);
  if (!session || session.status !== 'running') return false;

  session.status = 'paused';
  return true;
}

/**
 * Cancel a replay session
 */
export function cancelReplay(sessionId: string): boolean {
  const session = activeSessions.get(sessionId);
  if (!session) return false;

  session.status = 'cancelled';
  session.completedAt = new Date().toISOString();
  return true;
}

/**
 * Get replay session status
 */
export function getReplaySession(sessionId: string): ReplaySession | null {
  return activeSessions.get(sessionId) || null;
}

/**
 * Get all active sessions
 */
export function getActiveSessions(): ReplaySession[] {
  return Array.from(activeSessions.values()).filter(
    s => s.status === 'running' || s.status === 'paused'
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// REPLAY EXECUTION
// ═══════════════════════════════════════════════════════════════════════════════

async function executeReplay(
  session: ReplaySession,
  handler: (event: ReplayEvent) => Promise<void>
): Promise<void> {
  const { config } = session;

  // Fetch events from database
  let query = supabase
    .from('brain_events')
    .select('*')
    .eq('module', 'ripple')
    .gte('created_at', config.fromTime.toISOString())
    .order('created_at', { ascending: true });

  if (config.toTime) {
    query = query.lte('created_at', config.toTime.toISOString());
  }

  if (config.maxEvents) {
    query = query.limit(config.maxEvents);
  }

  const { data: events, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch events: ${error.message}`);
  }

  if (!events || events.length === 0) {
    session.status = 'completed';
    session.completedAt = new Date().toISOString();
    return;
  }

  session.eventsTotal = events.length;

  // Process events
  let lastEventTime: Date | null = null;

  for (const row of events) {
    // Check if paused or cancelled
    if (session.status !== 'running') break;

    const eventData = row.data as Record<string, unknown> | null;
    if (!eventData) continue;

    const replayEvent: ReplayEvent = {
      id: row.id,
      type: row.event_type || 'unknown',
      source: eventData.source as string || 'unknown',
      payload: eventData.payload || eventData,
      originalTimestamp: row.created_at || '',
    };

    // Apply filters
    if (config.eventTypes && !config.eventTypes.includes(replayEvent.type)) {
      continue;
    }

    if (config.sources && !config.sources.includes(replayEvent.source)) {
      continue;
    }

    if (config.filter && !config.filter(replayEvent)) {
      continue;
    }

    // Apply transformation
    const transformedEvent = config.transform
      ? config.transform(replayEvent)
      : replayEvent;

    // Simulate time delay based on speed
    if (lastEventTime && config.speed < 100) {
      const eventTime = new Date(transformedEvent.originalTimestamp);
      const timeDiff = eventTime.getTime() - lastEventTime.getTime();
      const adjustedDelay = Math.max(0, timeDiff / config.speed);

      if (adjustedDelay > 0 && adjustedDelay < 60000) {
        await sleep(Math.min(adjustedDelay, 1000)); // Cap at 1 second
      }
    }

    lastEventTime = new Date(transformedEvent.originalTimestamp);

    // Deliver event
    try {
      transformedEvent.replayedAt = new Date().toISOString();
      await handler(transformedEvent);
      session.eventsReplayed++;
      session.currentPosition = transformedEvent.originalTimestamp;
      totalEventsReplayed++;
    } catch (err) {
      session.errors.push({
        eventId: replayEvent.id,
        error: err instanceof Error ? err.message : 'Handler error',
        timestamp: new Date().toISOString(),
      });
    }
  }

  if (session.status === 'running') {
    session.status = 'completed';
  }
  session.completedAt = new Date().toISOString();

  emit({
    module: 'ripple',
    event_type: 'replay_session_completed',
    outcome: 'succeeded',
    data: {
      sessionId: session.id,
      eventsReplayed: session.eventsReplayed,
      errors: session.errors.length,
    },
  });
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ═══════════════════════════════════════════════════════════════════════════════
// QUICK REPLAY UTILITIES
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Replay events from the last N minutes
 */
export async function replayLastMinutes(
  minutes: number,
  handler: (event: ReplayEvent) => Promise<void>,
  options?: { speed?: number; eventTypes?: string[] }
): Promise<ReplaySession> {
  const fromTime = new Date(Date.now() - minutes * 60 * 1000);

  const session = createReplaySession(
    {
      fromTime,
      speed: options?.speed || 100,
      eventTypes: options?.eventTypes,
    },
    handler
  );

  await startReplay(session.id);
  return session;
}

/**
 * Replay a specific event by ID
 */
export async function replaySingleEvent(
  eventId: string,
  handler: (event: ReplayEvent) => Promise<void>
): Promise<boolean> {
  const { data, error } = await supabase
    .from('brain_events')
    .select('*')
    .eq('id', eventId)
    .single();

  if (error || !data) return false;

  const eventData = data.data as Record<string, unknown> | null;

  const replayEvent: ReplayEvent = {
    id: data.id,
    type: data.event_type || 'unknown',
    source: (eventData?.source as string) || 'unknown',
    payload: eventData?.payload || eventData,
    originalTimestamp: data.created_at || '',
    replayedAt: new Date().toISOString(),
  };

  await handler(replayEvent);
  totalEventsReplayed++;

  return true;
}

// ═══════════════════════════════════════════════════════════════════════════════
// STATISTICS
// ═══════════════════════════════════════════════════════════════════════════════

export interface ReplayStats {
  totalReplays: number;
  totalEventsReplayed: number;
  activeSessions: number;
  completedSessions: number;
  totalErrors: number;
}

export function getReplayStats(): ReplayStats {
  const sessions = Array.from(activeSessions.values());
  const totalErrors = sessions.reduce((sum, s) => sum + s.errors.length, 0);

  return {
    totalReplays,
    totalEventsReplayed,
    activeSessions: sessions.filter(s => s.status === 'running').length,
    completedSessions: sessions.filter(s => s.status === 'completed').length,
    totalErrors,
  };
}

/**
 * Cleanup old completed sessions
 */
export function cleanupSessions(olderThanMs: number = 3600000): number {
  const cutoff = Date.now() - olderThanMs;
  let cleaned = 0;

  for (const [id, session] of activeSessions) {
    if (
      (session.status === 'completed' || session.status === 'cancelled') &&
      session.completedAt &&
      new Date(session.completedAt).getTime() < cutoff
    ) {
      activeSessions.delete(id);
      sessionHandlers.delete(id);
      cleaned++;
    }
  }

  return cleaned;
}
