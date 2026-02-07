/**
 * Debug Mode Kill-Switch
 * v1.0.0 — Temporarily disable all background activity
 * 
 * This module provides a central toggle to disable:
 * - All polling intervals
 * - Realtime subscriptions
 * - Background writes (learning logs, metrics)
 * - Auto-refresh cycles
 * 
 * Usage:
 *   import { debugMode } from '@/lib/debug-mode';
 *   debugMode.enable();  // Disable all background activity
 *   debugMode.disable(); // Re-enable everything
 *   debugMode.isEnabled(); // Check current state
 */

interface DebugModeState {
  enabled: boolean;
  enabledAt: string | null;
  disabledFeatures: string[];
}

const STORAGE_KEY = 'substrate_debug_mode';

// Persistent state
let state: DebugModeState = {
  enabled: false,
  enabledAt: null,
  disabledFeatures: [],
};

// Load from localStorage on init
function loadState(): void {
  if (typeof window === 'undefined') return;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      state = JSON.parse(stored);
      if (state.enabled) {
        console.warn('[DebugMode] 🔴 DEBUG MODE ACTIVE — Background activity disabled');
      }
    }
  } catch {
    // Silent fail
  }
}

function saveState(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Silent fail
  }
}

/**
 * Enable debug mode — disables all background activity
 */
function enable(): void {
  state = {
    enabled: true,
    enabledAt: new Date().toISOString(),
    disabledFeatures: [
      'polling-intervals',
      'realtime-subscriptions',
      'learning-collector',
      'metrics-flush',
      'background-writes',
      'auto-refresh',
      'telemetry-log',
    ],
  };
  saveState();
  console.warn('[DebugMode] 🔴 DEBUG MODE ENABLED');
  console.warn('[DebugMode] Disabled features:', state.disabledFeatures);
  console.warn('[DebugMode] To re-enable: debugMode.disable() or localStorage.removeItem("substrate_debug_mode")');
}

/**
 * Disable debug mode — re-enables all background activity
 */
function disable(): void {
  state = {
    enabled: false,
    enabledAt: null,
    disabledFeatures: [],
  };
  saveState();
  console.log('[DebugMode] 🟢 DEBUG MODE DISABLED — Background activity restored');
  console.log('[DebugMode] Refresh the page to fully restore all features');
}

/**
 * Check if debug mode is enabled
 */
function isEnabled(): boolean {
  return state.enabled;
}

/**
 * Get full debug state
 */
function getState(): DebugModeState {
  return { ...state };
}

/**
 * Check if a specific feature should be disabled
 */
function shouldDisable(feature: string): boolean {
  if (!state.enabled) return false;
  return state.disabledFeatures.includes(feature) || state.disabledFeatures.includes('all');
}

/**
 * Guard function - returns true if operation should proceed
 * Use this to wrap polling, subscriptions, and writes
 */
function allowPolling(): boolean {
  return !shouldDisable('polling-intervals');
}

function allowRealtime(): boolean {
  return !shouldDisable('realtime-subscriptions');
}

function allowWrites(): boolean {
  return !shouldDisable('background-writes');
}

function allowLearning(): boolean {
  return !shouldDisable('learning-collector');
}

function allowMetrics(): boolean {
  return !shouldDisable('metrics-flush');
}

function allowAutoRefresh(): boolean {
  return !shouldDisable('auto-refresh');
}

function allowTelemetry(): boolean {
  return !shouldDisable('telemetry-log');
}

// Initialize on load
loadState();

// Export as singleton
export const debugMode = {
  enable,
  disable,
  isEnabled,
  getState,
  shouldDisable,
  // Convenience guards
  allowPolling,
  allowRealtime,
  allowWrites,
  allowLearning,
  allowMetrics,
  allowAutoRefresh,
  allowTelemetry,
};

// Expose globally for console access
if (typeof window !== 'undefined') {
  (window as any).debugMode = debugMode;
}
