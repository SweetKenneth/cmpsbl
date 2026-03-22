/**
 * DEFENSE Anomaly Detector v9.1.0 ARCHITECT
 * Real-time behavioral anomaly detection and classification
 */
 
 export type AnomalyType = 
   | 'rate_spike'
   | 'geographic'
   | 'temporal'
   | 'behavioral'
   | 'credential'
   | 'payload';
 
 export type AnomalySeverity = 'low' | 'medium' | 'high' | 'critical';
 
 export interface AnomalySignal {
   id: string;
   type: AnomalyType;
   severity: AnomalySeverity;
   source: string;
   description: string;
   confidence: number;
   indicators: string[];
   detected_at: string;
   expires_at: string;
   metadata: Record<string, unknown>;
 }
 
 export interface AnomalyDetectorConfig {
   rate_spike_threshold: number;
   temporal_deviation_threshold: number;
   behavioral_score_threshold: number;
   signal_ttl_minutes: number;
 }
 
 export interface DetectionResult {
   is_anomaly: boolean;
   signals: AnomalySignal[];
   risk_score: number;
   recommended_action: 'allow' | 'challenge' | 'block' | 'monitor';
 }
 
 // Configuration
 let config: AnomalyDetectorConfig = {
   rate_spike_threshold: 3.0, // 3x normal rate
   temporal_deviation_threshold: 0.3, // 30% deviation from pattern
   behavioral_score_threshold: 0.6, // Below 0.6 is suspicious
   signal_ttl_minutes: 60,
 };
 
 // In-memory signal storage — bounded to prevent memory exhaustion
 const MAX_ACTIVE_SIGNALS = 2000;
 const MAX_BASELINES = 5000;
 const activeSignals = new Map<string, AnomalySignal>();
 
 // Baseline metrics per source
 const baselines = new Map<string, {
   avg_requests_per_minute: number;
   typical_hours: number[];
   known_ips: Set<string>;
   behavioral_score: number;
 }>();
 
 // Monotonic counter for unique IDs — avoids crypto/random overhead
 let signalCounter = 0;
 function generateSignalId(): string {
   return `sig_${Date.now()}_${(signalCounter++).toString(36)}`;
 }

 /** Evict oldest signal if over capacity */
 function boundSignals(): void {
   if (activeSignals.size > MAX_ACTIVE_SIGNALS) {
     const oldest = activeSignals.keys().next().value;
     if (oldest) activeSignals.delete(oldest);
   }
 }
 
 /**
  * Detect rate spike anomaly
  */
 export function detectRateSpike(
   source: string,
   current_rate: number,
   baseline_rate?: number
 ): AnomalySignal | null {
   const baseline = baseline_rate ?? baselines.get(source)?.avg_requests_per_minute ?? 10;
   const ratio = current_rate / Math.max(1, baseline);
 
   if (ratio >= config.rate_spike_threshold) {
     const severity: AnomalySeverity = 
       ratio >= 10 ? 'critical' :
       ratio >= 5 ? 'high' :
       ratio >= 3 ? 'medium' : 'low';
 
     const signal: AnomalySignal = {
       id: generateSignalId(),
       type: 'rate_spike',
       severity,
       source,
       description: `Request rate ${ratio.toFixed(1)}x above baseline`,
       confidence: Math.min(1, (ratio - config.rate_spike_threshold) / 5 + 0.7),
       indicators: [`current_rate=${current_rate}`, `baseline=${baseline}`, `ratio=${ratio.toFixed(2)}`],
       detected_at: new Date().toISOString(),
       expires_at: new Date(Date.now() + config.signal_ttl_minutes * 60000).toISOString(),
       metadata: { current_rate, baseline, ratio },
     };
 
     activeSignals.set(signal.id, signal);
     boundSignals();
     return signal;
   }
 
   return null;
 }
 
 /**
  * Detect temporal anomaly (requests at unusual times)
  */
 export function detectTemporalAnomaly(
   source: string,
   request_hour: number
 ): AnomalySignal | null {
   const baseline = baselines.get(source);
   const typical_hours = baseline?.typical_hours ?? [9, 10, 11, 12, 13, 14, 15, 16, 17];
 
   if (!typical_hours.includes(request_hour)) {
     const signal: AnomalySignal = {
       id: generateSignalId(),
       type: 'temporal',
       severity: 'low',
       source,
       description: `Request at unusual hour: ${request_hour}:00`,
       confidence: 0.5,
       indicators: [`hour=${request_hour}`, `typical_hours=${typical_hours.join(',')}`],
       detected_at: new Date().toISOString(),
       expires_at: new Date(Date.now() + config.signal_ttl_minutes * 60000).toISOString(),
       metadata: { request_hour, typical_hours },
     };
 
     activeSignals.set(signal.id, signal);
     boundSignals();
     return signal;
   }
 
   return null;
 }
 
 /**
  * Detect behavioral anomaly based on score
  */
 export function detectBehavioralAnomaly(
   source: string,
   behavioral_score: number,
   indicators: string[]
 ): AnomalySignal | null {
   if (behavioral_score < config.behavioral_score_threshold) {
     const severity: AnomalySeverity =
       behavioral_score < 0.2 ? 'critical' :
       behavioral_score < 0.4 ? 'high' :
       behavioral_score < 0.5 ? 'medium' : 'low';
 
     const signal: AnomalySignal = {
       id: generateSignalId(),
       type: 'behavioral',
       severity,
       source,
       description: `Behavioral score ${(behavioral_score * 100).toFixed(0)}% below threshold`,
       confidence: 1 - behavioral_score,
       indicators,
       detected_at: new Date().toISOString(),
       expires_at: new Date(Date.now() + config.signal_ttl_minutes * 60000).toISOString(),
       metadata: { behavioral_score },
     };
 
     activeSignals.set(signal.id, signal);
     boundSignals();
     return signal;
   }
 
   return null;
 }
 
 /**
  * Run comprehensive anomaly detection
  */
 export function analyzeForAnomalies(request: {
   source: string;
   ip?: string;
   current_rate?: number;
   behavioral_score?: number;
   indicators?: string[];
 }): DetectionResult {
   const signals: AnomalySignal[] = [];
   const hour = new Date().getHours();
 
   // Check rate spike
   if (request.current_rate !== undefined) {
     const rateSignal = detectRateSpike(request.source, request.current_rate);
     if (rateSignal) signals.push(rateSignal);
   }
 
   // Check temporal pattern
   const temporalSignal = detectTemporalAnomaly(request.source, hour);
   if (temporalSignal) signals.push(temporalSignal);
 
   // Check behavioral score
   if (request.behavioral_score !== undefined) {
     const behavioralSignal = detectBehavioralAnomaly(
       request.source,
       request.behavioral_score,
       request.indicators ?? []
     );
     if (behavioralSignal) signals.push(behavioralSignal);
   }
 
   // Calculate overall risk score
   const severityWeights: Record<AnomalySeverity, number> = {
     low: 0.1,
     medium: 0.3,
     high: 0.6,
     critical: 1.0,
   };
 
   const risk_score = signals.length > 0
     ? Math.min(1, signals.reduce((sum, s) => sum + severityWeights[s.severity] * s.confidence, 0))
     : 0;
 
   // Determine recommended action
   let recommended_action: DetectionResult['recommended_action'] = 'allow';
   if (risk_score >= 0.8) recommended_action = 'block';
   else if (risk_score >= 0.5) recommended_action = 'challenge';
   else if (risk_score >= 0.2) recommended_action = 'monitor';
 
   return {
     is_anomaly: signals.length > 0,
     signals,
     risk_score,
     recommended_action,
   };
 }
 
 /**
  * Get active signals
  */
 export function getActiveSignals(filter?: {
   type?: AnomalyType;
   severity?: AnomalySeverity;
   source?: string;
 }): AnomalySignal[] {
   const now = Date.now();
   const signals: AnomalySignal[] = [];
 
   for (const signal of activeSignals.values()) {
     if (new Date(signal.expires_at).getTime() < now) {
       activeSignals.delete(signal.id);
       continue;
     }
 
     if (filter?.type && signal.type !== filter.type) continue;
     if (filter?.severity && signal.severity !== filter.severity) continue;
     if (filter?.source && signal.source !== filter.source) continue;
 
     signals.push(signal);
   }
 
   return signals.sort((a, b) => 
     new Date(b.detected_at).getTime() - new Date(a.detected_at).getTime()
   );
 }
 
 /**
  * Update baseline for a source
  */
 export function updateBaseline(
   source: string,
   metrics: {
     avg_requests_per_minute?: number;
     typical_hours?: number[];
     known_ips?: string[];
     behavioral_score?: number;
   }
 ): void {
   const existing = baselines.get(source) ?? {
     avg_requests_per_minute: 10,
     typical_hours: [9, 10, 11, 12, 13, 14, 15, 16, 17],
     known_ips: new Set<string>(),
     behavioral_score: 0.8,
   };
 
   if (metrics.avg_requests_per_minute !== undefined) {
     existing.avg_requests_per_minute = metrics.avg_requests_per_minute;
   }
   if (metrics.typical_hours) {
     existing.typical_hours = metrics.typical_hours;
   }
  if (metrics.known_ips) {
    const MAX_KNOWN_IPS = 500;
    metrics.known_ips.forEach(ip => {
      if (existing.known_ips.size < MAX_KNOWN_IPS) {
        existing.known_ips.add(ip);
      }
    });
  }
   if (metrics.behavioral_score !== undefined) {
     existing.behavioral_score = metrics.behavioral_score;
   }
 
   baselines.set(source, existing);
   // Bound baselines map
   if (baselines.size > MAX_BASELINES) {
     const oldest = baselines.keys().next().value;
     if (oldest) baselines.delete(oldest);
   }
 }
 
 /**
  * Update detector configuration
  */
export function updateAnomalyConfig(updates: Partial<AnomalyDetectorConfig>): AnomalyDetectorConfig {
  // Guardrail: clamp all config values to safe ranges
  config = {
    ...config,
    rate_spike_threshold: Math.max(1.5, Math.min(20, updates.rate_spike_threshold ?? config.rate_spike_threshold)),
    temporal_deviation_threshold: Math.max(0.05, Math.min(0.95, updates.temporal_deviation_threshold ?? config.temporal_deviation_threshold)),
    behavioral_score_threshold: Math.max(0.1, Math.min(0.95, updates.behavioral_score_threshold ?? config.behavioral_score_threshold)),
    signal_ttl_minutes: Math.max(5, Math.min(1440, updates.signal_ttl_minutes ?? config.signal_ttl_minutes)),
  };
  return { ...config };
}
 
 /**
  * Clear all signals
  */
 export function clearSignals(): void {
   activeSignals.clear();
 }
 
 /**
  * Get anomaly detection stats
  */
 export function getAnomalyStats(): {
   active_signals: number;
   by_type: Record<AnomalyType, number>;
   by_severity: Record<AnomalySeverity, number>;
   sources_monitored: number;
 } {
   const signals = getActiveSignals();
   
   const byType: Record<AnomalyType, number> = {
     rate_spike: 0,
     geographic: 0,
     temporal: 0,
     behavioral: 0,
     credential: 0,
     payload: 0,
   };
 
   const bySeverity: Record<AnomalySeverity, number> = {
     low: 0,
     medium: 0,
     high: 0,
     critical: 0,
   };
 
   signals.forEach(s => {
     byType[s.type]++;
     bySeverity[s.severity]++;
   });
 
   return {
     active_signals: signals.length,
     by_type: byType,
     by_severity: bySeverity,
     sources_monitored: baselines.size,
   };
 }