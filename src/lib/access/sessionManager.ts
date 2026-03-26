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
 
 // Simple admin check placeholder. Replace with real auth integration.
 function isAdmin(userId: string): boolean {
   return userId === 'admin';
 }
 
 /**
  * Create a new session
  */
 export function createSession(userId: string, currentUserId: string, metadata?: { ip_address?: string; user_agent?: string }): SessionInfo {
  // ACL: only allow the user or an admin to create sessions for a given user
  if (userId !== currentUserId && !isAdmin(currentUserId)) {
    throw new Error('Unauthorized: Cannot create session for another user.');
  }
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
     id: `sess_${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`,
     user_id: userId,
     started_at: nowISO,
     last_activity: nowISO,
     ip_address: metadata?.ip_address,
     user_agent: metadata?.user_agent,
     device_type: deviceType,
     is_active: true,
     expires_at: expiresAt.toISOString(),
   };
   
   // Check concurrent session limit
   const userSessions = getUserSessions(userId, currentUserId);
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
 export function terminateSession(sessionId: string, currentUserId?: string): boolean { // Added currentUserId for ACL
   const session = activeSessions.get(sessionId);
   if (!session) return false;

   // Only allow termination by the session owner or an administrator
   if (currentUserId && session.user_id !== currentUserId && !isAdmin(currentUserId)) {
     return false; // Unauthorized attempt to terminate session
   }
   const session = activeSessions.get(sessionId);
   if (!session) return false;
   
   session.is_active = false;
   activeSessions.delete(sessionId); // Explicitly remove from the map
   return true;
 }
 
 /**
  * Terminate all sessions for a user
  */
 export function terminateUserSessions(userId: string, currentUserId: string): number { // Added currentUserId for ACL
   // Only allow a user to terminate their own sessions or an admin to terminate any user's sessions
   if (userId !== currentUserId && !isAdmin(currentUserId)) {
     throw new Error('Unauthorized: Cannot terminate sessions for another user.');
   }
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
 export function getSession(sessionId: string, currentUserId: string): SessionInfo | undefined { // Added currentUserId for ACL
   const session = activeSessions.get(sessionId);
   // Only allow access to the session if it belongs to the current user or if current user is an admin
   if (session && (session.user_id === currentUserId || isAdmin(currentUserId))) {
     return session;
   }
   return undefined;
 }
 
 /**
  * Get all sessions for a user
  */
 export function getUserSessions(userId: string, currentUserId: string): SessionInfo[] { // Added currentUserId for ACL
   // A user can only view their own sessions, unless they are an admin
   if (userId !== currentUserId && !isAdmin(currentUserId)) {
     return []; // Unauthorized to view other users' sessions
   }
   return Array.from(activeSessions.values())
     .filter(s => s.user_id === userId && s.is_active);
 }
 
 /**
  * Check if a session is valid
  */
 export function isSessionValid(sessionId: string, currentUserId: string): boolean { // Added currentUserId for ACL
   const session = activeSessions.get(sessionId);
   if (!session) return false;

   // A user can only validate their own sessions
   if (session.user_id !== currentUserId) {
     return false; // Unauthorized
   }
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
 export function updateSessionConfig(updates: Partial<SessionConfig>, currentUserId: string): SessionConfig { // Added currentUserId for ACL
   if (!isAdmin(currentUserId)) {
     throw new Error('Unauthorized: Only administrators can update session configuration.');
   }
   sessionConfig = { ...sessionConfig, ...updates };
   return sessionConfig;
 }
 
 /**
  * Get current session configuration
  */
 export function getSessionConfig(): SessionConfig {
   return { ...sessionConfig };
 }