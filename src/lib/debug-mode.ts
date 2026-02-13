/**
 * Debug Mode Kill-Switch
 * v9.1.0 ARCHITECT — Granular control over background activity
 * 
 * Usage:
 *   debugMode.enable();           // Disable ALL background activity
 *   debugMode.disable();          // Re-enable ALL activity
 *   debugMode.enableOnly(['polling-intervals']); // Enable ONLY polling
 *   debugMode.disableFeature('realtime-subscriptions'); // Disable specific feature
 *   debugMode.enableFeature('polling-intervals');  // Enable specific feature
 */

type FeatureName = 
  | 'polling-intervals'
  | 'realtime-subscriptions'
  | 'learning-collector'
  | 'metrics-flush'
  | 'background-writes'
  | 'auto-refresh'
  | 'telemetry-log'
  | 'module-status-polling';

interface DebugModeState {
  enabled: boolean;
  enabledAt: string | null;
  disabledFeatures: FeatureName[];
}

const ALL_FEATURES: FeatureName[] = [
  'polling-intervals',
  'realtime-subscriptions', 
  'learning-collector',
  'metrics-flush',
  'background-writes',
  'auto-refresh',
  'telemetry-log',
  'module-status-polling',
];

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
        console.warn('[DebugMode] Disabled:', state.disabledFeatures.join(', '));
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
    disabledFeatures: [...ALL_FEATURES],
  };
  saveState();
  console.warn('[DebugMode] 🔴 DEBUG MODE ENABLED — ALL features disabled');
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
  console.log('[DebugMode] 🟢 DEBUG MODE DISABLED — All features restored');
  console.log('[DebugMode] Refresh the page to fully restore all features');
}

/**
 * Enable ONLY specific features (keeps debug mode on, disables everything else)
 */
function enableOnly(features: FeatureName[]): void {
  state = {
    enabled: true,
    enabledAt: state.enabledAt || new Date().toISOString(),
    disabledFeatures: ALL_FEATURES.filter(f => !features.includes(f)),
  };
  saveState();
  console.warn('[DebugMode] 🟡 PARTIAL MODE — Only enabled:', features.join(', '));
  console.warn('[DebugMode] Still disabled:', state.disabledFeatures.join(', '));
}

/**
 * Enable a specific feature (remove from disabled list)
 */
function enableFeature(feature: FeatureName): void {
  state.disabledFeatures = state.disabledFeatures.filter(f => f !== feature);
  if (state.disabledFeatures.length === 0) {
    state.enabled = false;
    state.enabledAt = null;
  }
  saveState();
  console.log(`[DebugMode] ✅ Enabled: ${feature}`);
  console.log('[DebugMode] Still disabled:', state.disabledFeatures.length ? state.disabledFeatures.join(', ') : 'none');
}

/**
 * Disable a specific feature (add to disabled list)
 */
function disableFeature(feature: FeatureName): void {
  if (!state.disabledFeatures.includes(feature)) {
    state.disabledFeatures.push(feature);
  }
  state.enabled = true;
  state.enabledAt = state.enabledAt || new Date().toISOString();
  saveState();
  console.warn(`[DebugMode] ❌ Disabled: ${feature}`);
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
 * Get list of all available features
 */
function getAllFeatures(): FeatureName[] {
  return [...ALL_FEATURES];
}

/**
 * Check if a specific feature should be disabled
 */
function shouldDisable(feature: string): boolean {
  if (!state.enabled) return false;
  return state.disabledFeatures.includes(feature as FeatureName);
}

/**
 * Guard functions - returns true if operation should proceed
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

function allowModulePolling(): boolean {
  return !shouldDisable('module-status-polling');
}

// Initialize on load
loadState();

// Export as singleton
export const debugMode = {
  enable,
  disable,
  enableOnly,
  enableFeature,
  disableFeature,
  isEnabled,
  getState,
  getAllFeatures,
  shouldDisable,
  // Convenience guards
  allowPolling,
  allowRealtime,
  allowWrites,
  allowLearning,
  allowMetrics,
  allowAutoRefresh,
  allowTelemetry,
  allowModulePolling,
};

// Expose globally for console access
if (typeof window !== 'undefined') {
  (window as any).debugMode = debugMode;
}
