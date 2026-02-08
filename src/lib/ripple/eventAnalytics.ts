/**
 * RIPPLE Event Analytics
 * v8.0.0 — SYNERGY+ Epoch Event stream analysis and pattern detection
 */
 
 import { ripple, type RippleEvent, type EventStatus } from './index';
 
 // Event analytics
 export interface EventAnalytics {
   totalEvents: number;
   eventsByType: Record<string, number>;
   eventsBySource: Record<string, number>;
   eventsByStatus: Record<EventStatus, number>;
   avgProcessingTime: number;
   peakHour: number;
   eventVelocity: number; // events per minute
   errorRate: number;
 }
 
 // Event pattern
 export interface EventPattern {
   patternId: string;
   sequence: string[];
   frequency: number;
   avgInterval: number;
   lastOccurrence: string;
 }
 
 // Event correlation
 export interface EventCorrelation {
   eventA: string;
   eventB: string;
   correlation: number; // -1 to 1
   avgDelay: number; // ms between events
   sampleSize: number;
 }
 
 // Time window for analysis
 export type TimeWindow = '1h' | '6h' | '24h' | '7d' | '30d';
 
 // Event buffer for analysis
 const eventBuffer: Array<{
   type: string;
   source: string;
   timestamp: number;
   processingTime: number;
   status: EventStatus;
 }> = [];
 const MAX_BUFFER_SIZE = 10000;
 
 // Pattern detection state
 const detectedPatterns = new Map<string, EventPattern>();
 
 /**
  * Record an event for analytics
  */
 export function recordEventForAnalytics(
   event: RippleEvent,
   processingTime: number
 ): void {
   eventBuffer.push({
     type: event.type,
     source: event.source,
     timestamp: Date.now(),
     processingTime,
     status: event.status,
   });
   
   // Evict old entries
   if (eventBuffer.length > MAX_BUFFER_SIZE) {
     eventBuffer.shift();
   }
   
   // Detect patterns
   detectPatterns();
 }
 
 /**
  * Get event analytics for a time window
  */
 export function getEventAnalytics(window: TimeWindow = '24h'): EventAnalytics {
   const windowMs = getWindowMs(window);
   const cutoff = Date.now() - windowMs;
   
   const relevantEvents = eventBuffer.filter(e => e.timestamp >= cutoff);
   
   if (relevantEvents.length === 0) {
     return {
       totalEvents: 0,
       eventsByType: {},
       eventsBySource: {},
       eventsByStatus: { pending: 0, processing: 0, succeeded: 0, failed: 0, dead_letter: 0 },
       avgProcessingTime: 0,
       peakHour: 0,
       eventVelocity: 0,
       errorRate: 0,
     };
   }
   
   // Aggregate by type
   const eventsByType: Record<string, number> = {};
   const eventsBySource: Record<string, number> = {};
   const eventsByStatus: Record<EventStatus, number> = { 
     pending: 0, processing: 0, succeeded: 0, failed: 0, dead_letter: 0 
   };
   const hourCounts: Record<number, number> = {};
   
   let totalProcessingTime = 0;
   let failedCount = 0;
   
   for (const event of relevantEvents) {
     eventsByType[event.type] = (eventsByType[event.type] || 0) + 1;
     eventsBySource[event.source] = (eventsBySource[event.source] || 0) + 1;
     eventsByStatus[event.status] = (eventsByStatus[event.status] || 0) + 1;
     
     totalProcessingTime += event.processingTime;
     
     if (event.status === 'failed' || event.status === 'dead_letter') {
       failedCount++;
     }
     
     const hour = new Date(event.timestamp).getHours();
     hourCounts[hour] = (hourCounts[hour] || 0) + 1;
   }
   
   // Find peak hour
   const peakHour = Object.entries(hourCounts)
     .sort((a, b) => b[1] - a[1])[0]?.[0] || 0;
   
   // Calculate velocity (events per minute)
   const windowMinutes = windowMs / (60 * 1000);
   const eventVelocity = relevantEvents.length / windowMinutes;
   
   return {
     totalEvents: relevantEvents.length,
     eventsByType,
     eventsBySource,
     eventsByStatus,
     avgProcessingTime: totalProcessingTime / relevantEvents.length,
     peakHour: Number(peakHour),
     eventVelocity,
     errorRate: failedCount / relevantEvents.length,
   };
 }
 
 /**
  * Detect event patterns
  */
 function detectPatterns(): void {
   if (eventBuffer.length < 10) return;
   
   // Look for repeating sequences
   const recentTypes = eventBuffer.slice(-50).map(e => e.type);
   
   // Find 2-event sequences
   for (let i = 0; i < recentTypes.length - 1; i++) {
     const sequence = [recentTypes[i], recentTypes[i + 1]];
     const patternKey = sequence.join('->');
     
     const existing = detectedPatterns.get(patternKey);
     if (existing) {
       existing.frequency++;
       existing.lastOccurrence = new Date().toISOString();
     } else {
       detectedPatterns.set(patternKey, {
         patternId: `pattern_${patternKey}`,
         sequence,
         frequency: 1,
         avgInterval: 0,
         lastOccurrence: new Date().toISOString(),
       });
     }
   }
   
   // Prune rare patterns
   for (const [key, pattern] of detectedPatterns.entries()) {
     if (pattern.frequency < 3) {
       detectedPatterns.delete(key);
     }
   }
 }
 
 /**
  * Get detected event patterns
  */
 export function getEventPatterns(minFrequency: number = 5): EventPattern[] {
   return Array.from(detectedPatterns.values())
     .filter(p => p.frequency >= minFrequency)
     .sort((a, b) => b.frequency - a.frequency);
 }
 
 /**
  * Find event correlations
  */
 export function findCorrelations(
   eventType: string,
   window: TimeWindow = '24h'
 ): EventCorrelation[] {
   const windowMs = getWindowMs(window);
   const cutoff = Date.now() - windowMs;
   
   const relevantEvents = eventBuffer.filter(e => e.timestamp >= cutoff);
   const targetEvents = relevantEvents.filter(e => e.type === eventType);
   
   if (targetEvents.length < 5) return [];
   
   const correlations: EventCorrelation[] = [];
   const otherTypes = new Set(relevantEvents.map(e => e.type).filter(t => t !== eventType));
   
   for (const otherType of otherTypes) {
     const otherEvents = relevantEvents.filter(e => e.type === otherType);
     
     // Calculate correlation based on temporal proximity
     let correlated = 0;
     let totalDelay = 0;
     
     for (const target of targetEvents) {
       const nearby = otherEvents.find(o => 
         Math.abs(o.timestamp - target.timestamp) < 60000 // within 1 minute
       );
       
       if (nearby) {
         correlated++;
         totalDelay += Math.abs(nearby.timestamp - target.timestamp);
       }
     }
     
     if (correlated >= 3) {
       correlations.push({
         eventA: eventType,
         eventB: otherType,
         correlation: correlated / targetEvents.length,
         avgDelay: totalDelay / correlated,
         sampleSize: correlated,
       });
     }
   }
   
   return correlations.sort((a, b) => b.correlation - a.correlation);
 }
 
 /**
  * Get event velocity over time (for charts)
  */
 export function getVelocityTimeSeries(
   window: TimeWindow = '24h',
   buckets: number = 24
 ): Array<{ timestamp: string; count: number; velocity: number }> {
   const windowMs = getWindowMs(window);
   const bucketSize = windowMs / buckets;
   const cutoff = Date.now() - windowMs;
   
   const series: Array<{ timestamp: string; count: number; velocity: number }> = [];
   
   for (let i = 0; i < buckets; i++) {
     const bucketStart = cutoff + (i * bucketSize);
     const bucketEnd = bucketStart + bucketSize;
     
     const count = eventBuffer.filter(e => 
       e.timestamp >= bucketStart && e.timestamp < bucketEnd
     ).length;
     
     series.push({
       timestamp: new Date(bucketStart).toISOString(),
       count,
       velocity: count / (bucketSize / 60000), // per minute
     });
   }
   
   return series;
 }
 
 /**
  * Get anomalous event spikes
  */
 export function detectAnomalies(window: TimeWindow = '24h'): Array<{
   timestamp: string;
   type: string;
   expected: number;
   actual: number;
   deviation: number;
 }> {
   const analytics = getEventAnalytics(window);
   const velocity = getVelocityTimeSeries(window);
   
   // Calculate average and std dev
   const counts = velocity.map(v => v.count);
   const avg = counts.reduce((a, b) => a + b, 0) / counts.length;
   const variance = counts.reduce((sum, c) => sum + Math.pow(c - avg, 2), 0) / counts.length;
   const stdDev = Math.sqrt(variance);
   
   // Find anomalies (more than 2 standard deviations from mean)
   const anomalies: Array<{
     timestamp: string;
     type: string;
     expected: number;
     actual: number;
     deviation: number;
   }> = [];
   
   for (const bucket of velocity) {
     const deviation = (bucket.count - avg) / (stdDev || 1);
     if (Math.abs(deviation) > 2) {
       anomalies.push({
         timestamp: bucket.timestamp,
         type: deviation > 0 ? 'spike' : 'drop',
         expected: avg,
         actual: bucket.count,
         deviation,
       });
     }
   }
   
   return anomalies;
 }
 
 /**
  * Helper to convert time window to milliseconds
  */
 function getWindowMs(window: TimeWindow): number {
   switch (window) {
     case '1h': return 60 * 60 * 1000;
     case '6h': return 6 * 60 * 60 * 1000;
     case '24h': return 24 * 60 * 60 * 1000;
     case '7d': return 7 * 24 * 60 * 60 * 1000;
     case '30d': return 30 * 24 * 60 * 60 * 1000;
     default: return 24 * 60 * 60 * 1000;
   }
 }
 
 /**
  * Clear analytics buffer
  */
 export function clearAnalyticsBuffer(): void {
   eventBuffer.length = 0;
   detectedPatterns.clear();
 }