/**
 * System Module Exports
 * v9.1.0 ARCHITECT — Administration, Healing, and Production Hardening
 */

// Error handling
export {
  createAppError,
  fromError,
  isAppError,
  isRetryableError,
  formatErrorForUI,
  type AppError,
  type ErrorCode,
} from './errors';

// Retry policy
export {
  withRetry,
  sleep,
  createRetryableOperation,
  calculateDelay,
  RetryPresets,
  type RetryConfig,
} from './retry';

// Logging
export { log } from './log';

// Tracing
export {
  generateTraceId,
  generateSpanId,
  createTraceContext,
  getContext,
  updateContext,
  endContext,
  cleanupOldTraces,
  withTrace,
  extractTraceId,
  getActiveTraceCount,
  type TraceContext,
} from './trace';

// Caching
export {
  cacheManager,
  CacheTTL,
  withCache,
  type CacheEntry,
} from './cache';

// Rate limiting
export {
  rateLimiter,
  RateLimitPresets,
  enforceRateLimit,
  type RateLimitConfig,
} from './rateLimit';

// Health monitoring
export {
  runHealthCheck,
  acknowledgeAlert,
  resolveAlert,
  getMonitoringState,
  getActiveAlerts,
  getAlertHistory,
  startMonitoring,
  stopMonitoring,
  getHealthSummary,
  type AlertSeverity,
  type AlertStatus,
  type HealthAlert,
  type AlertConfig,
  type MonitoringState,
} from './healthMonitoring';

// Predictive healing
export {
  runPredictiveAnalysis,
  schedulePreventiveHealing,
  executePendingHealing,
  getPredictiveHealingStatus,
  type HealthTrend,
  type HealingAction,
  type PredictiveAnalysis,
} from './predictiveHealing';

// Connection diagnostics
export { runConnectionDiagnostics } from './connectionDiagnostics';

// Reconnection utilities
export { forceReconnect } from './forceReconnect';

// Supabase-specific reconnection
export { reconnectSupabase } from './supabaseReconnect';

// Local/offline mode
export { getLocalModeStatus } from './localMode';

// Version info
export const SYSTEM_VERSION = '9.1.0';
export const SYSTEM_CODENAME = 'ARCHITECT';

export type SystemStatus = 'healthy' | 'degraded' | 'critical' | 'maintenance';

export interface SystemState {
  status: SystemStatus;
  monitoringActive: boolean;
  lastHealthCheck: string | null;
  activeAlerts: number;
}

let systemState: SystemState = {
  status: 'healthy',
  monitoringActive: false,
  lastHealthCheck: null,
  activeAlerts: 0,
};

export function getSystemState(): SystemState {
  return { ...systemState };
}

export function updateSystemState(updates: Partial<SystemState>): void {
  systemState = { ...systemState, ...updates };
}
 
 // Resource monitoring
 export * from './resourceMonitoring';
 
 // Audit logging
 export * from './auditLogging';
 
 // Dependency graph
 export * from './dependencyGraph';
 
 // Render loop guard (dev-only utility)
 export {
   useRenderGuard,
   resetRenderGuards,
   getRenderStats,
 } from './renderGuard';

// Resource monitor
export {
  collectMetrics as collectResourceMetrics,
  recordRequest as recordNetworkRequest,
  checkAlerts as checkResourceAlerts,
  getMetricsHistory as getResourceMetricsHistory,
  getMetricsSummary as getResourceMetricsSummary,
  type ResourceMetrics as SystemResourceMetrics,
  type MemoryMetrics as SystemMemoryMetrics,
  type PerformanceMetrics,
  type NetworkMetrics,
  type StorageMetrics as SystemStorageMetrics,
  type ResourceAlert as SystemResourceAlert,
} from './resourceMonitor';

// Performance profiler
export * from './performanceProfiler';
