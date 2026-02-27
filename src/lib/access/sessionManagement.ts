/**
 * ACCESS Module — Session Management
 * Session lifecycle, invalidation, and security
 */

import { supabase } from '@/integrations/supabase/client';

// ============ Types ============

export interface Session {
  id: string;
  user_id: string;
  device_fingerprint?: string;
  ip_address?: string;
  user_agent?: string;
  location?: {
    country?: string;
    city?: string;
  };
  created_at: string;
  last_activity_at: string;
  expires_at: string;
  is_current: boolean;
  risk_score: number;
}

export interface SessionPolicy {
  max_concurrent_sessions: number;
  session_timeout_minutes: number;
  require_reauthentication_for_sensitive: boolean;
  allow_remember_me: boolean;
  enforce_single_device: boolean;
}

export interface SessionActivity {
  session_id: string;
  action: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

// ============ State ============

const activeSessions: Map<string, Session> = new Map();
const sessionActivities: Map<string, SessionActivity[]> = new Map();

const defaultPolicy: SessionPolicy = {
  max_concurrent_sessions: 5,
  session_timeout_minutes: 60,
  require_reauthentication_for_sensitive: true,
  allow_remember_me: true,
  enforce_single_device: false,
};

// ============ Session Operations ============

/**
 * Create a new session
 */
export async function createSession(
  userId: string,
  options?: {
    device_fingerprint?: string;
    ip_address?: string;
    user_agent?: string;
    remember_me?: boolean;
  }
): Promise<{ success: boolean; session?: Session; error?: string }> {
  try {
    // Check concurrent session limit
    const userSessions = getUserSessions(userId);
    if (userSessions.length >= defaultPolicy.max_concurrent_sessions) {
      if (defaultPolicy.enforce_single_device) {
        // Invalidate oldest session
        const oldest = userSessions.sort((a, b) => 
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        )[0];
        await invalidateSession(oldest.id);
      } else {
        return { success: false, error: 'Maximum concurrent sessions reached' };
      }
    }
    
    const sessionId = `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 
      (options?.remember_me ? 30 * 24 * 60 : defaultPolicy.session_timeout_minutes) * 60 * 1000
    );
    
    const session: Session = {
      id: sessionId,
      user_id: userId,
      device_fingerprint: options?.device_fingerprint,
      ip_address: options?.ip_address,
      user_agent: options?.user_agent,
      created_at: now.toISOString(),
      last_activity_at: now.toISOString(),
      expires_at: expiresAt.toISOString(),
      is_current: true,
      risk_score: calculateRiskScore(options),
    };
    
    activeSessions.set(sessionId, session);
    
    // Log session creation
    await logSessionEvent(sessionId, 'session_created', { userId });
    
    return { success: true, session };
  } catch (error) {
    console.error('Error creating session:', error);
    return { success: false, error: String(error) };
  }
}

/**
 * Get session by ID
 */
export function getSession(sessionId: string): Session | null {
  const session = activeSessions.get(sessionId);
  if (!session) return null;
  
  // Check expiration
  if (new Date() > new Date(session.expires_at)) {
    activeSessions.delete(sessionId);
    return null;
  }
  
  return session;
}

/**
 * Get all sessions for a user
 */
export function getUserSessions(userId: string): Session[] {
  const sessions: Session[] = [];
  const now = new Date();
  
  for (const [id, session] of activeSessions.entries()) {
    if (session.user_id === userId) {
      // Clean up expired
      if (new Date(session.expires_at) <= now) {
        activeSessions.delete(id);
        continue;
      }
      sessions.push(session);
    }
  }
  
  return sessions.sort((a, b) => 
    new Date(b.last_activity_at).getTime() - new Date(a.last_activity_at).getTime()
  );
}

/**
 * Update session activity
 */
export function touchSession(sessionId: string): boolean {
  const session = activeSessions.get(sessionId);
  if (!session) return false;
  
  session.last_activity_at = new Date().toISOString();
  activeSessions.set(sessionId, session);
  
  return true;
}

/**
 * Invalidate a session
 */
export async function invalidateSession(sessionId: string): Promise<boolean> {
  const session = activeSessions.get(sessionId);
  if (!session) return false;
  
  activeSessions.delete(sessionId);
  
  await logSessionEvent(sessionId, 'session_invalidated', {
    user_id: session.user_id,
  });
  
  return true;
}

/**
 * Invalidate all sessions for a user
 */
export async function invalidateAllUserSessions(userId: string): Promise<number> {
  let count = 0;
  
  for (const [id, session] of activeSessions.entries()) {
    if (session.user_id === userId) {
      activeSessions.delete(id);
      count++;
    }
  }
  
  await logSessionEvent('system', 'all_sessions_invalidated', {
    user_id: userId,
    count,
  });
  
  return count;
}

// ============ Session Security ============

/**
 * Validate session for sensitive operation
 */
export function validateForSensitiveOperation(
  sessionId: string,
  operation: string
): { valid: boolean; reason?: string } {
  const session = getSession(sessionId);
  
  if (!session) {
    return { valid: false, reason: 'Session not found or expired' };
  }
  
  // Check if reauthentication is required
  if (defaultPolicy.require_reauthentication_for_sensitive) {
    const lastActivity = new Date(session.last_activity_at);
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    
    if (lastActivity < fiveMinutesAgo) {
      return { valid: false, reason: 'Reauthentication required for sensitive operation' };
    }
  }
  
  // Check risk score
  if (session.risk_score > 70) {
    return { valid: false, reason: 'Session risk score too high' };
  }
  
  return { valid: true };
}

/**
 * Flag session as suspicious
 */
export async function flagSuspiciousSession(
  sessionId: string,
  reason: string
): Promise<boolean> {
  const session = activeSessions.get(sessionId);
  if (!session) return false;
  
  session.risk_score = Math.min(100, session.risk_score + 30);
  activeSessions.set(sessionId, session);
  
  await logSessionEvent(sessionId, 'session_flagged_suspicious', {
    reason,
    new_risk_score: session.risk_score,
  });
  
  return true;
}

/**
 * Detect session hijacking attempt
 */
export function detectHijackingAttempt(
  sessionId: string,
  currentFingerprint: string,
  currentIp: string
): { suspected: boolean; reasons: string[] } {
  const session = getSession(sessionId);
  if (!session) {
    return { suspected: false, reasons: [] };
  }
  
  const reasons: string[] = [];
  
  // Check fingerprint mismatch
  if (session.device_fingerprint && session.device_fingerprint !== currentFingerprint) {
    reasons.push('Device fingerprint mismatch');
  }
  
  // Check IP change (simple check - could be enhanced with geolocation)
  if (session.ip_address && session.ip_address !== currentIp) {
    reasons.push('IP address changed');
  }
  
  return {
    suspected: reasons.length > 0,
    reasons,
  };
}

// ============ Session Policy ============

/**
 * Get session policy
 */
export function getSessionPolicy(): SessionPolicy {
  return { ...defaultPolicy };
}

/**
 * Update session policy
 */
export function updateSessionPolicy(updates: Partial<SessionPolicy>): SessionPolicy {
  Object.assign(defaultPolicy, updates);
  return { ...defaultPolicy };
}

// ============ Analytics ============

/**
 * Get session statistics
 */
export function getSessionStats(): {
  total_active: number;
  unique_users: number;
  avg_session_age_minutes: number;
  high_risk_sessions: number;
  sessions_by_device: Record<string, number>;
} {
  const now = new Date();
  const userSet = new Set<string>();
  let totalAge = 0;
  let highRisk = 0;
  const deviceCounts: Record<string, number> = {};
  
  for (const session of activeSessions.values()) {
    userSet.add(session.user_id);
    
    const ageMs = now.getTime() - new Date(session.created_at).getTime();
    totalAge += ageMs / (60 * 1000);
    
    if (session.risk_score > 70) highRisk++;
    
    const device = extractDevice(session.user_agent);
    deviceCounts[device] = (deviceCounts[device] || 0) + 1;
  }
  
  return {
    total_active: activeSessions.size,
    unique_users: userSet.size,
    avg_session_age_minutes: activeSessions.size > 0 ? totalAge / activeSessions.size : 0,
    high_risk_sessions: highRisk,
    sessions_by_device: deviceCounts,
  };
}

/**
 * Get session activity log
 */
export function getSessionActivityLog(sessionId: string): SessionActivity[] {
  return sessionActivities.get(sessionId) || [];
}

// ============ Helpers ============

function calculateRiskScore(options?: { ip_address?: string; user_agent?: string }): number {
  let score = 20; // Base risk
  
  // Add risk for missing info
  if (!options?.ip_address) score += 10;
  if (!options?.user_agent) score += 10;
  
  // Check for known risky patterns
  if (options?.user_agent?.includes('curl') || options?.user_agent?.includes('wget')) {
    score += 20;
  }
  
  return Math.min(100, score);
}

function extractDevice(userAgent?: string): string {
  if (!userAgent) return 'unknown';
  if (userAgent.includes('Mobile')) return 'mobile';
  if (userAgent.includes('Tablet')) return 'tablet';
  return 'desktop';
}

async function logSessionEvent(
  sessionId: string,
  action: string,
  metadata?: Record<string, unknown>
): Promise<void> {
  const activity: SessionActivity = {
    session_id: sessionId,
    action,
    timestamp: new Date().toISOString(),
    metadata,
  };
  
  // Store locally
  const activities = sessionActivities.get(sessionId) || [];
  activities.push(activity);
  sessionActivities.set(sessionId, activities.slice(-100)); // Keep last 100
  
  // Log to database
  try {
    await supabase.from('brain_events').insert([{
      module: 'access',
      event_type: action,
      data: { session_id: sessionId, ...metadata },
      outcome: 'logged',
    }]);
  } catch (error) {
    console.error('Failed to log session event:', error);
  }
}
