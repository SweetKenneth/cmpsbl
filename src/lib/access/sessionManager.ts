/**
 * ACCESS Session Manager
 * Secure session lifecycle and tracking
 */
 
 // import { supabase } from '@/integrations/supabase/client'; // Not used in this file
 
 // Session types
 export interface SessionInfo {
   id: string;
   user_id: string;
   started_at: string;
   last_activity: string;
   ip_address?: string;
   user_agent?: string;
   device_type: 'desktop' | 'mobile' | 'tablet' | 'unknown';
   is_active: boolean;
   expires_at: string;
 }
 
 export interface SessionConfig {
   idle_timeout_minutes: number;
   max_session_duration_hours: number;
   concurrent_sessions_limit: number;
   require_re_auth_for_sensitive: boolean;
 }
 
 // Default configuration
 const DEFAULT_SESSION_CONFIG: SessionConfig = {
   idle_timeout_minutes: 30,
   max_session_duration_hours: 24,
   concurrent_sessions_limit: 5,
   require_re_auth_for_sensitive: true,
 };
 
 // In-memory session tracking
 const activeSessions = new Map<string, SessionInfo>();
 let sessionConfig = { ...DEFAULT_SESSION_CONFIG };
 
 /**
  * Create a new session
  */
 export function createSession(userId: string, metadata?: {
   ip_address?: string;
   user_agent?: string;
 }): SessionInfo {
   const now = new Date();
   const expiresAt = new Date(now.getTime() + sessionConfig.max_session_duration_hours * 60 * 60 * 1000);
   
   // Detect device type from user agent
   let deviceType: SessionInfo['device_type'] = 'unknown';
   if (metadata?.user_agent) {
     const ua = metadata.user_agent.toLowerCase();
     if (/mobile|android|iphone|ipad/i.test(ua)) {
       deviceType = /ipad|tablet/i.test(ua) ? 'tablet' : 'mobile';
     } else {
       deviceType = 'desktop';
     }
   }
   
   const session: SessionInfo = {
     id: `sess_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
     user_id: userId,
     started_at: now.toISOString(),
     last_activity: now.toISOString(),
     ip_address: metadata?.ip_address,
     user_agent: metadata?.user_agent,
     device_type: deviceType,
     is_active: true,
     expires_at: expiresAt.toISOString(),
   };
   
   // Check concurrent session limit
   const userSessions = getUserSessions(userId);
   if (userSessions.length >= sessionConfig.concurrent_sessions_limit) {
     // Terminate oldest existing session to make room for the new one
     const oldestActiveSession = userSessions
       .filter(s => s.id !== session.id) // Exclude the new session if it somehow gets included prematurely or accidentally for other reasons
       .sort((a, b) => new Date(a.started_at).getTime() - new Date(b.started_at).getTime())[0];

     if (oldestActiveSession) {
       terminateSession(oldestActiveSession.id); // Use the existing termination logic
     }
   }
   
   activeSessions.set(session.id, session);
   return session;
 }
 
 /**
  * Update session activity
  */
 export function touchSession(sessionId: string): boolean {
   const session = activeSessions.get(sessionId);
   if (!session || !session.is_active) return false;
   
   // Check if expired
   if (new Date(session.expires_at) < new Date()) {
     session.is_active = false;
     return false;
   }
   
   session.last_activity = new Date().toISOString();
   return true;
 }
 
 /**
  * Terminate a session
  */
 export function terminateSession(sessionId: string): boolean {
   const session = activeSessions.get(sessionId);
   if (!session) return false;
   
   session.is_active = false;
   activeSessions.delete(sessionId); // Explicitly remove from the map
   return true;
 }
 
 /**
  * Terminate all sessions for a user
  */
 export function terminateUserSessions(userId: string): number {
   let count = 0;
   
   const sessionIdsToTerminate: string[] = [];
   for (const [sessionId, session] of activeSessions.entries()) {
     if (session.user_id === userId && session.is_active) {
       sessionIdsToTerminate.push(sessionId);
     }
   }
   for (const sessionId of sessionIdsToTerminate) {
     if (terminateSession(sessionId)) { // Use the robust termination logic
       count++;
     }
   }

   return count;
 }
 
 /**
  * Get session by ID
  */
 export function getSession(sessionId: string): SessionInfo | undefined {
   return activeSessions.get(sessionId);
 }
 
 /**
  * Get all sessions for a user
  */
 export function getUserSessions(userId: string): SessionInfo[] {
   return Array.from(activeSessions.values())
     .filter(s => s.user_id === userId && s.is_active);
 }
 
 /**
  * Check if a session is valid
  */
 export function isSessionValid(sessionId: string): boolean {
   const session = activeSessions.get(sessionId);
   if (!session || !session.is_active) return false;
   
   // Check expiration
   if (new Date(session.expires_at) < new Date()) {
     session.is_active = false;
     return false;
   }
   
   // Check idle timeout
   const lastActivity = new Date(session.last_activity);
   const idleMs = Date.now() - lastActivity.getTime();
   const maxIdleMs = sessionConfig.idle_timeout_minutes * 60 * 1000;
   
   if (idleMs > maxIdleMs) {
     terminateSession(sessionId); // Use unified termination logic
     return false;
   }
   
   return true;
 }
 
 /**
  * Cleanup expired sessions
  */
 export function cleanupExpiredSessions(): number {
   let cleaned = 0;
   const now = new Date();
   
   const sessionIdsToClean: string[] = [];
   for (const [sessionId, session] of activeSessions.entries()) {
     // A session is 'cleanable' if it's explicitly inactive or past its expiry date
     if (!session.is_active || new Date(session.expires_at) < now) {
        sessionIdsToClean.push(sessionId);
     }
   }
   for (const sessionId of sessionIdsToClean) {
     if (terminateSession(sessionId)) { // Use the unified termination logic
       cleaned++;
     }
   }
   
   return cleaned;
 }
 
 /**
  * Get session statistics
  */
 export function getSessionStats(): {
   total_active: number;
   by_device: Record<string, number>;
   avg_duration_minutes: number;
 } {
   const active = Array.from(activeSessions.values()).filter(s => s.is_active);
   
   const byDevice: Record<string, number> = {};
   let totalDuration = 0;
   
   for (const session of active) {
     byDevice[session.device_type] = (byDevice[session.device_type] || 0) + 1;
     
     const start = new Date(session.started_at).getTime();
     const lastActivity = new Date(session.last_activity).getTime();
     totalDuration += (lastActivity - start) / 60000;
   }
   
   return {
     total_active: active.length,
     by_device: byDevice,
     avg_duration_minutes: active.length > 0 ? Math.round(totalDuration / active.length) : 0.0, // Explicitly 0.0 for consistency, or just 0 is fine
   };
 }
 
 /**
  * Update session configuration
  */
 export function updateSessionConfig(updates: Partial<SessionConfig>): SessionConfig {
   sessionConfig = { ...sessionConfig, ...updates };
   return sessionConfig;
 }
 
 /**
  * Get current session configuration
  */
 export function getSessionConfig(): SessionConfig {
   return { ...sessionConfig };
 }