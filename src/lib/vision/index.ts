/**
 * CMPSBL® VISION "Vee" — Operative Perception Engine
 * 
 * Unified export for all Vision capabilities:
 * - Trace: Distributed tracing with causal chains
 * - Providers: AI provider analytics and skew detection
 * - Anomaly: Anomaly detection and classification
 * - Watchdog: Operative auto-action with guardrails
 * - Metrics: Real-time metric aggregation (existing)
 */

// Trace context utilities
export {
  type TraceContext,
  type TraceTimelineEntry,
  generateTraceId,
  generateSpanId,
  startTrace,
  nextSpan,
  attachTraceContext,
  extractTraceContext,
  buildTraceTimeline,
} from './trace';

// Provider analytics
export {
  type ProviderStats,
  type ProviderSkewResult,
  getProviderStats,
  getProviderSkew,
  getProviderAnalytics,
} from './providers';

// Anomaly detection
export {
  type Anomaly,
  type AnomalyAnalysisResult,
  analyzeWindow,
  getRecentAnomalies,
  resolveAnomaly,
  getAnomalyCounts,
} from './anomaly';

// Watchdog operative
export {
  type VisionMode,
  type WatchdogResult,
  getVisionMode,
  runVisionWatchdog,
} from './watchdog';

// Existing metric aggregation
export {
  type MetricPoint,
  type AggregatedMetric,
  type MetricAlert,
  recordMetric,
  getRealtimeMetrics,
  aggregateMetrics,
  getDashboardMetrics,
  checkMetricAlerts,
  getMetricTimeSeries,
  flushMetricsToDatabase,
} from './metricAggregation';

// SLA monitoring & capacity forecasting
export * from './slaMonitoring';
 
 // Alert management
 export * from './alertManagement';

// Predictive alerts
export * from './predictiveAlerts';

// Vision hardening layer
export * from './vision-hardening';

// Vision module version
export const VISION_VERSION = '2.0.0';
export const VISION_CODENAME = 'Vee';
