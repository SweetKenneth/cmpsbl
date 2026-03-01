/**
 * System Module Exports
 * Administration, Healing, and Production Hardening
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

// Secure storage
export {
  secureSet,
  secureGet,
  secureRemove,
  migrateLegacyKey,
} from './secureStorage';

// Version info
import { getMetric } from '@/stores/publicMetricsStore';
export const SYSTEM_VERSION = getMetric('version');
export const SYSTEM_CODENAME = getMetric('codename');

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

// Governance control plane
export {
  getSubsystemState,
  getAffectedSubsystems,
  GOVERNANCE_MODE_META,
  type GovernanceMode,
  type GovernanceModeRecord,
  type GovernanceAuditEntry,
  type SubsystemState,
} from './governance';

// Governance gate (subsystem flag wrapper)
export {
  isSubsystemAllowed,
  isSubsystemEnabled,
  invalidateGovernanceCache,
} from './governanceGate';

// Hardening utilities
export {
  withTimeout,
  clampNumber,
  validateStringInput,
  safeParse,
  boundArray,
  safeExecute,
  deepFreeze,
  sanitizeText,
  fnv1aHash,
  debounce,
} from './hardening';

// Uptime tracking
export {
  getUptimeMs,
  getUptimeFormatted,
  getBootTimestamp,
  getUptimeReport,
} from './uptimeTracker';

// Memory pressure detection
export {
  detectMemoryPressure,
  shouldShedLoad,
  type PressureLevel,
  type MemoryPressureReport,
} from './memoryPressure';

// System hardening v2.0.0 — "Bastion"
export {
  SYSTEM_HARDENING_VERSION,
  SYSTEM_HARDENING_CODENAME,
  sealBootStep,
  verifyBootChain,
  getBootChain,
  registerConfigSchema,
  validateConfig,
  recordConfigChange,
  getConfigAuditTrail,
  verifyConfigAuditChain,
  captureDiagnosticSnapshot,
  getSnapshots,
  getSnapshotById,
  reportModuleHealth,
  getAggregatedHealth,
  transitionPhase,
  getCurrentPhase,
  getPhaseHistory,
  registerShutdownTask,
  executeShutdown,
  declareModuleDependency,
  validateBootOrder,
  detectDependencyCycles,
  registerHeartbeat,
  recordHeartbeat,
  checkHeartbeats,
  setResourceQuota,
  acquireResourceSlot,
  releaseResourceSlot,
  getQuotaStatus,
  setCanaryFlag,
  isCanaryEnabled,
  getCanaryFlags,
  scheduleMaintenanceWindow,
  isInMaintenanceWindow,
  addCompatibilityRule,
  checkCompatibility,
  onDiagnosticEvent,
  emitDiagnosticEvent,
  getDiagnosticEventLog,
  detectConfigDrift,
  recordBootTiming,
  getBootTimings,
  getBootTimingSummary,
  evaluateEscalation,
  lockHotReload,
  unlockHotReload,
  isHotReloadLocked,
  captureRegistrySnapshot,
  compareRegistrySnapshots,
  registerReadinessCheck,
  runReadinessChecks,
  setSamplingRate,
  getSamplingRate,
  shouldSample,
  adaptSamplingRate,
  quarantineModule,
  releaseFromQuarantine,
  isQuarantined,
  getQuarantinedModules,
  snapshotConfig,
  rollbackConfig,
  getConfigSnapshots,
  defineSLA,
  recordSLASample,
  getSLACompliance,
  isSLABreached,
  calculateSystemHealth,
  type SystemGrade,
  type SystemHealthComposite,
} from './system-hardening';
