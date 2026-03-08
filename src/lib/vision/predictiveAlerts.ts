/**
 * VISION Predictive Alerts
 * ML-based alert prediction before issues occur
 */
 
 export type AlertPredictionType = 
   | 'memory_pressure'
   | 'rate_limit_breach'
   | 'error_surge'
   | 'latency_spike'
   | 'quota_exhaustion';
 
 export interface PredictedAlert {
   id: string;
   type: AlertPredictionType;
   probability: number;
   predicted_at: string;
   expected_occurrence: string;
   lead_time_minutes: number;
   confidence: number;
   factors: string[];
   recommendations: string[];
   prevented: boolean;
 }
 
 export interface TrendData {
   metric: string;
   values: number[];
   timestamps: string[];
   slope: number;
   acceleration: number;
 }
 
 export interface PredictionModel {
   type: AlertPredictionType;
   threshold: number;
   window_minutes: number;
   sensitivity: number;
 }
 
 // Prediction models configuration
 const predictionModels: Record<AlertPredictionType, PredictionModel> = {
   memory_pressure: { type: 'memory_pressure', threshold: 85, window_minutes: 15, sensitivity: 0.7 },
   rate_limit_breach: { type: 'rate_limit_breach', threshold: 80, window_minutes: 5, sensitivity: 0.8 },
   error_surge: { type: 'error_surge', threshold: 5, window_minutes: 10, sensitivity: 0.75 },
   latency_spike: { type: 'latency_spike', threshold: 2000, window_minutes: 5, sensitivity: 0.65 },
   quota_exhaustion: { type: 'quota_exhaustion', threshold: 90, window_minutes: 60, sensitivity: 0.9 },
 };
 
 // Active predictions (bounded)
 const MAX_ACTIVE_PREDICTIONS = 200;
 const activePredictions = new Map<string, PredictedAlert>();
 
 // Historical trends per metric (bounded)
 const MAX_METRIC_TRENDS = 100;
 const metricTrends = new Map<string, TrendData>();
 
 /**
  * Calculate linear regression slope
  */
 function calculateSlope(values: number[]): number {
   if (values.length < 2) return 0;
   
   const n = values.length;
   const xMean = (n - 1) / 2;
   const yMean = values.reduce((a, b) => a + b, 0) / n;
   
   let numerator = 0;
   let denominator = 0;
   
   for (let i = 0; i < n; i++) {
     numerator += (i - xMean) * (values[i] - yMean);
     denominator += (i - xMean) ** 2;
   }
   
   return denominator !== 0 ? numerator / denominator : 0;
 }
 
 /**
  * Record metric value for trend analysis
  */
 export function recordMetricValue(metric: string, value: number): TrendData {
   const now = new Date().toISOString();
   const existing = metricTrends.get(metric) ?? {
     metric,
     values: [],
     timestamps: [],
     slope: 0,
     acceleration: 0,
   };
 
   // Keep last 60 data points
   existing.values.push(value);
   existing.timestamps.push(now);
   
   if (existing.values.length > 60) {
     existing.values.shift();
     existing.timestamps.shift();
   }
 
   // Calculate slope
   const previousSlope = existing.slope;
   existing.slope = calculateSlope(existing.values);
   existing.acceleration = existing.slope - previousSlope;
 
  if (!metricTrends.has(metric) && metricTrends.size >= MAX_METRIC_TRENDS) {
    const oldest = metricTrends.keys().next().value;
    if (oldest) metricTrends.delete(oldest);
  }
  metricTrends.set(metric, existing);
  return existing;
 }
 
 /**
  * Predict if threshold will be breached
  */
 export function predictBreachTime(
   trend: TrendData,
   threshold: number
 ): { will_breach: boolean; minutes_until: number; confidence: number } {
   const currentValue = trend.values[trend.values.length - 1] ?? 0;
   
   if (currentValue >= threshold) {
     return { will_breach: true, minutes_until: 0, confidence: 1.0 };
   }
 
   if (trend.slope <= 0) {
     return { will_breach: false, minutes_until: -1, confidence: 0.8 };
   }
 
   // Simple linear projection
   const gap = threshold - currentValue;
   const minutesUntil = gap / trend.slope;
 
   // Confidence based on trend consistency
   const values = trend.values.slice(-10);
   const variance = values.length > 1
     ? values.reduce((sum, v) => sum + (v - currentValue) ** 2, 0) / values.length
     : 0;
   const confidence = Math.max(0.3, 1 - Math.min(0.7, variance / 1000));
 
   return {
     will_breach: minutesUntil <= 60,
     minutes_until: Math.round(minutesUntil),
     confidence,
   };
 }
 
 /**
  * Analyze trends and generate predictions
  */
 export function generatePredictions(): PredictedAlert[] {
   const predictions: PredictedAlert[] = [];
   const now = new Date();
 
   // Check memory pressure
   const memoryTrend = metricTrends.get('memory_usage');
   if (memoryTrend) {
     const model = predictionModels.memory_pressure;
     const prediction = predictBreachTime(memoryTrend, model.threshold);
     
     if (prediction.will_breach && prediction.confidence >= model.sensitivity) {
       const alert: PredictedAlert = {
         id: `pred_${Date.now()}_memory`,
         type: 'memory_pressure',
         probability: prediction.confidence,
         predicted_at: now.toISOString(),
         expected_occurrence: new Date(now.getTime() + prediction.minutes_until * 60000).toISOString(),
         lead_time_minutes: prediction.minutes_until,
         confidence: prediction.confidence,
         factors: [`Current: ${memoryTrend.values.at(-1)}%`, `Slope: ${memoryTrend.slope.toFixed(2)}/min`],
         recommendations: ['Clear caches', 'Reduce batch sizes', 'Scale resources'],
         prevented: false,
       };
        predictions.push(alert);
        if (activePredictions.size >= MAX_ACTIVE_PREDICTIONS) {
          const oldest = activePredictions.keys().next().value;
          if (oldest) activePredictions.delete(oldest);
        }
        activePredictions.set(alert.id, alert);
     }
   }
 
   // Check error surge
   const errorTrend = metricTrends.get('error_rate');
   if (errorTrend) {
     const model = predictionModels.error_surge;
     const prediction = predictBreachTime(errorTrend, model.threshold);
     
     if (prediction.will_breach && prediction.confidence >= model.sensitivity) {
       const alert: PredictedAlert = {
         id: `pred_${Date.now()}_error`,
         type: 'error_surge',
         probability: prediction.confidence,
         predicted_at: now.toISOString(),
         expected_occurrence: new Date(now.getTime() + prediction.minutes_until * 60000).toISOString(),
         lead_time_minutes: prediction.minutes_until,
         confidence: prediction.confidence,
         factors: [`Current rate: ${errorTrend.values.at(-1)}%`, `Acceleration: ${errorTrend.acceleration.toFixed(3)}`],
         recommendations: ['Check service health', 'Review recent deployments', 'Enable circuit breakers'],
         prevented: false,
       };
       predictions.push(alert);
       activePredictions.set(alert.id, alert);
     }
   }
 
   // Check latency spike
   const latencyTrend = metricTrends.get('avg_latency');
   if (latencyTrend) {
     const model = predictionModels.latency_spike;
     const prediction = predictBreachTime(latencyTrend, model.threshold);
     
     if (prediction.will_breach && prediction.confidence >= model.sensitivity) {
       const alert: PredictedAlert = {
         id: `pred_${Date.now()}_latency`,
         type: 'latency_spike',
         probability: prediction.confidence,
         predicted_at: now.toISOString(),
         expected_occurrence: new Date(now.getTime() + prediction.minutes_until * 60000).toISOString(),
         lead_time_minutes: prediction.minutes_until,
         confidence: prediction.confidence,
         factors: [`Current: ${latencyTrend.values.at(-1)}ms`, `Slope: ${latencyTrend.slope.toFixed(1)}ms/min`],
         recommendations: ['Add caching layer', 'Optimize queries', 'Scale horizontally'],
         prevented: false,
       };
       predictions.push(alert);
       activePredictions.set(alert.id, alert);
     }
   }
 
   return predictions;
 }
 
 /**
  * Get active predictions
  */
 export function getActivePredictions(filter?: {
   type?: AlertPredictionType;
   min_probability?: number;
 }): PredictedAlert[] {
   const now = Date.now();
   const predictions: PredictedAlert[] = [];
 
   for (const pred of activePredictions.values()) {
     // Remove stale predictions (past expected occurrence)
     if (new Date(pred.expected_occurrence).getTime() < now) {
       activePredictions.delete(pred.id);
       continue;
     }
 
     if (filter?.type && pred.type !== filter.type) continue;
     if (filter?.min_probability && pred.probability < filter.min_probability) continue;
 
     predictions.push(pred);
   }
 
   return predictions.sort((a, b) => b.probability - a.probability);
 }
 
 /**
  * Mark prediction as prevented
  */
 export function markPrevented(predictionId: string): boolean {
   const pred = activePredictions.get(predictionId);
   if (pred) {
     pred.prevented = true;
     return true;
   }
   return false;
 }
 
 /**
  * Get trend data for a metric
  */
 export function getTrend(metric: string): TrendData | undefined {
   return metricTrends.get(metric);
 }
 
 /**
  * Clear old trend data
  */
 export function clearOldTrends(olderThanMinutes: number = 120): number {
   const cutoff = Date.now() - olderThanMinutes * 60000;
   let cleared = 0;
 
   for (const [metric, trend] of metricTrends.entries()) {
     const latestTimestamp = trend.timestamps.at(-1);
     if (latestTimestamp && new Date(latestTimestamp).getTime() < cutoff) {
       metricTrends.delete(metric);
       cleared++;
     }
   }
 
   return cleared;
 }
 
 /**
  * Get prediction model configuration
  */
 export function getPredictionModels(): Record<AlertPredictionType, PredictionModel> {
   return { ...predictionModels };
 }
 
 /**
  * Update prediction model
  */
 export function updatePredictionModel(
   type: AlertPredictionType,
   updates: Partial<Omit<PredictionModel, 'type'>>
 ): PredictionModel {
   predictionModels[type] = { ...predictionModels[type], ...updates };
   return predictionModels[type];
 }