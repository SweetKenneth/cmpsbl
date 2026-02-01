/**
 * promptfluid® System Module v7.0.0
 * Administration, Healing, and Health Monitoring
 */

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
export const SYSTEM_VERSION = '7.0.0';
export const SYSTEM_CODENAME = 'Admin';

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
