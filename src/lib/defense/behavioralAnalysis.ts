/**
 * DEFENSE Behavioral Analysis
 * User and entity behavior analytics for threat detection
 */
 
 import { supabase } from '@/integrations/supabase/client';
 
 // Behavior profile
 export interface BehaviorProfile {
   entityId: string;
   entityType: 'user' | 'api_key' | 'ip' | 'session';
   normalPatterns: NormalPattern[];
   riskScore: number;
   lastUpdated: string;
   eventCount: number;
   anomalyCount: number;
 }
 
 // Normal behavior pattern
 export interface NormalPattern {
   patternType: string;
   baseline: number;
   stdDev: number;
   sampleSize: number;
 }
 
 // Behavioral anomaly
 export interface BehavioralAnomaly {
   id: string;
   entityId: string;
   anomalyType: AnomalyType;
   severity: 'low' | 'medium' | 'high' | 'critical';
   description: string;
   deviation: number;
   timestamp: string;
   resolved: boolean;
 }
 
 // Anomaly types
 export type AnomalyType = 
   | 'velocity_spike'
   | 'unusual_time'
   | 'geo_impossible'
   | 'resource_abuse'
   | 'auth_pattern'
   | 'data_exfil';
 
 // Behavior event
 export interface BehaviorEvent {
   entityId: string;
   entityType: BehaviorProfile['entityType'];
   action: string;
   resource: string;
   timestamp: number;
   metadata?: Record<string, unknown>;
 }
 
 // In-memory state — bounded
 const MAX_PROFILES = 5000;
 const MAX_RECENT_EVENTS_KEYS = 5000;
 const behaviorProfiles = new Map<string, BehaviorProfile>();
 const recentEvents = new Map<string, BehaviorEvent[]>();
 const anomalies: BehavioralAnomaly[] = [];
 const MAX_EVENTS_PER_ENTITY = 1000;
 const MAX_ANOMALIES = 500;
 // Index: entityId → count of unresolved anomalies (avoids O(n) scans)
 const unresolvedCounts = new Map<string, number>();
 
 /**
  * Record a behavior event
  */
 export function recordBehavior(event: BehaviorEvent): void {
   const key = `${event.entityType}:${event.entityId}`;
   
   // Get or create event list
   let events = recentEvents.get(key);
   if (!events) {
     events = [];
     recentEvents.set(key, events);
     // Bound the map itself
     if (recentEvents.size > MAX_RECENT_EVENTS_KEYS) {
       const oldest = recentEvents.keys().next().value;
       if (oldest) recentEvents.delete(oldest);
     }
   }
   
   events.push(event);
   
   // Limit buffer size
   if (events.length > MAX_EVENTS_PER_ENTITY) {
     events.shift();
   }
   
   // Update profile
   updateProfile(event.entityId, event.entityType, events);
   
   // Check for anomalies
   detectAnomalies(event, events);
 }
 
 /**
  * Update behavior profile
  */
 function updateProfile(
   entityId: string,
   entityType: BehaviorProfile['entityType'],
   events: BehaviorEvent[]
 ): void {
   const key = `${entityType}:${entityId}`;
   
   // Calculate patterns from events
   const patterns = calculatePatterns(events);
   
    const profile: BehaviorProfile = {
      entityId,
      entityType,
      normalPatterns: patterns,
      riskScore: calculateRiskScore(entityId),
      lastUpdated: new Date().toISOString(),
      eventCount: events.length,
      anomalyCount: unresolvedCounts.get(entityId) || 0,
   };
   
   behaviorProfiles.set(key, profile);
   // Bound profiles map
   if (behaviorProfiles.size > MAX_PROFILES) {
     const oldest = behaviorProfiles.keys().next().value;
     if (oldest) behaviorProfiles.delete(oldest);
   }
 }
 
 /**
  * Calculate normal patterns from events
  */
 function calculatePatterns(events: BehaviorEvent[]): NormalPattern[] {
   const patterns: NormalPattern[] = [];
   
   // Calculate request velocity pattern
   if (events.length >= 10) {
     const intervals: number[] = [];
     for (let i = 1; i < events.length; i++) {
       intervals.push(events[i].timestamp - events[i - 1].timestamp);
     }
     
     const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
     const variance = intervals.reduce((sum, i) => sum + Math.pow(i - avgInterval, 2), 0) / intervals.length;
     
     patterns.push({
       patternType: 'request_velocity',
       baseline: avgInterval,
       stdDev: Math.sqrt(variance),
       sampleSize: intervals.length,
     });
   }
   
   // Calculate hourly activity pattern
   const hourCounts: number[] = new Array(24).fill(0);
   events.forEach(e => {
     const hour = new Date(e.timestamp).getHours();
     hourCounts[hour]++;
   });
   
   const avgHourly = hourCounts.reduce((a, b) => a + b, 0) / 24;
   const hourlyVariance = hourCounts.reduce((sum, c) => sum + Math.pow(c - avgHourly, 2), 0) / 24;
   
   patterns.push({
     patternType: 'hourly_activity',
     baseline: avgHourly,
     stdDev: Math.sqrt(hourlyVariance),
     sampleSize: events.length,
   });
   
   return patterns;
 }
 
 /**
  * Detect behavioral anomalies
  */
 function detectAnomalies(event: BehaviorEvent, history: BehaviorEvent[]): void {
   const key = `${event.entityType}:${event.entityId}`;
   const profile = behaviorProfiles.get(key);
   
   if (!profile || profile.normalPatterns.length === 0) return;
   
   // Check velocity anomaly
   const velocityPattern = profile.normalPatterns.find(p => p.patternType === 'request_velocity');
   if (velocityPattern && history.length >= 2) {
     const lastInterval = event.timestamp - history[history.length - 2].timestamp;
     const deviation = (velocityPattern.baseline - lastInterval) / (velocityPattern.stdDev || 1);
     
     if (Math.abs(deviation) > 3) {
       createAnomaly(event.entityId, 'velocity_spike', deviation, 
         `Request velocity ${deviation > 0 ? 'spike' : 'drop'} detected`);
     }
   }
   
   // Check unusual time
   const hourPattern = profile.normalPatterns.find(p => p.patternType === 'hourly_activity');
   if (hourPattern && hourPattern.sampleSize >= 50) {
     const currentHour = new Date(event.timestamp).getHours();
     const hourActivity = history.filter(e => 
       new Date(e.timestamp).getHours() === currentHour
     ).length;
     
     if (hourActivity === 1 && hourPattern.baseline > 5) {
       createAnomaly(event.entityId, 'unusual_time', 0,
         `Activity at unusual hour: ${currentHour}:00`);
     }
   }
 }
 
 /**
  * Create a behavioral anomaly
  */
 function createAnomaly(
   entityId: string,
   type: AnomalyType,
   deviation: number,
   description: string
 ): BehavioralAnomaly {
   const severity = calculateAnomalySeverity(type, deviation);
   
   const anomaly: BehavioralAnomaly = {
     id: `anomaly_${Date.now()}_${entityId}`,
     entityId,
     anomalyType: type,
     severity,
     description,
     deviation,
     timestamp: new Date().toISOString(),
     resolved: false,
   };
   
    anomalies.push(anomaly);
    unresolvedCounts.set(entityId, (unresolvedCounts.get(entityId) || 0) + 1);
    
    // Limit history — decrement index for evicted entry
    if (anomalies.length > MAX_ANOMALIES) {
      const evicted = anomalies.shift()!;
      if (!evicted.resolved) {
        const c = unresolvedCounts.get(evicted.entityId) || 1;
        if (c <= 1) unresolvedCounts.delete(evicted.entityId);
        else unresolvedCounts.set(evicted.entityId, c - 1);
      }
    }
   
   // Log to database
   logAnomaly(anomaly);
   
   return anomaly;
 }
 
 /**
  * Calculate anomaly severity
  */
 function calculateAnomalySeverity(
   type: AnomalyType,
   deviation: number
 ): BehavioralAnomaly['severity'] {
   const absDeviation = Math.abs(deviation);
   
   // Type-based severity modifiers
   const typeSeverity: Record<AnomalyType, number> = {
     velocity_spike: 1,
     unusual_time: 0.5,
     geo_impossible: 2,
     resource_abuse: 1.5,
     auth_pattern: 1.5,
     data_exfil: 2,
   };
   
   const score = absDeviation * typeSeverity[type];
   
   if (score > 8) return 'critical';
   if (score > 5) return 'high';
   if (score > 3) return 'medium';
   return 'low';
 }
 
 /**
  * Calculate entity risk score
  */
 // Severity scores hoisted — avoid re-creating per call
 const SEVERITY_SCORES: Record<BehavioralAnomaly['severity'], number> = {
   low: 10, medium: 25, high: 50, critical: 100,
 };

 function calculateRiskScore(entityId: string): number {
   const count = unresolvedCounts.get(entityId) || 0;
   if (count === 0) return 0;
   
   // Only scan anomalies matching this entity
   let totalScore = 0;
   for (let i = anomalies.length - 1; i >= 0 && totalScore < 100; i--) {
     const a = anomalies[i];
     if (a.entityId === entityId && !a.resolved) {
       totalScore += SEVERITY_SCORES[a.severity];
     }
   }
   
   return Math.min(100, totalScore);
 }
 
 /**
  * Get behavior profile
  */
 export function getProfile(
   entityId: string,
   entityType: BehaviorProfile['entityType']
 ): BehaviorProfile | null {
   return behaviorProfiles.get(`${entityType}:${entityId}`) || null;
 }
 
 /**
  * Get all profiles
  */
 export function getAllProfiles(): BehaviorProfile[] {
   return Array.from(behaviorProfiles.values());
 }
 
 /**
  * Get anomalies
  */
 export function getAnomalies(options?: {
   entityId?: string;
   type?: AnomalyType;
   unresolved?: boolean;
   limit?: number;
 }): BehavioralAnomaly[] {
   let result = [...anomalies];
   
   if (options?.entityId) {
     result = result.filter(a => a.entityId === options.entityId);
   }
   if (options?.type) {
     result = result.filter(a => a.anomalyType === options.type);
   }
   if (options?.unresolved) {
     result = result.filter(a => !a.resolved);
   }
   
   result.sort((a, b) => 
     new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
   );
   
   return options?.limit ? result.slice(0, options.limit) : result;
 }
 
 /**
  * Resolve an anomaly
  */
 export function resolveAnomaly(anomalyId: string): boolean {
   const anomaly = anomalies.find(a => a.id === anomalyId);
   if (anomaly) {
     anomaly.resolved = true;
     return true;
   }
   return false;
 }
 
 /**
  * Log anomaly to database
  */
 async function logAnomaly(anomaly: BehavioralAnomaly): Promise<void> {
   try {
     await supabase.from('brain_events').insert({
       event_type: `behavior.${anomaly.anomalyType}`,
       module: 'defense',
       data: {
         anomaly_id: anomaly.id,
         entity_id: anomaly.entityId,
         severity: anomaly.severity,
         deviation: anomaly.deviation,
       },
     } as never);
   } catch {
     // Silent fail
   }
 }
 
 /**
  * Get behavior summary
  */
 export function getBehaviorSummary(): {
   profiles: number;
   totalEvents: number;
   unresolvedAnomalies: number;
   highRiskEntities: number;
 } {
   const profiles = getAllProfiles();
   
   return {
     profiles: profiles.length,
     totalEvents: profiles.reduce((sum, p) => sum + p.eventCount, 0),
     unresolvedAnomalies: anomalies.filter(a => !a.resolved).length,
     highRiskEntities: profiles.filter(p => p.riskScore > 50).length,
   };
 }