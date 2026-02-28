/**
 * Control Plane Configuration
 * Single toggle to enable/disable the entire Control Plane layer.
 */

import type { ControlPlaneConfig } from './types';
import { DEFAULT_CONTROL_PLANE_CONFIG } from './types';

const STORAGE_KEY = 'cmpsbl-control-plane-config';

let _config: ControlPlaneConfig = { ...DEFAULT_CONTROL_PLANE_CONFIG };

/** Load config from localStorage (if available) */
function loadConfig(): ControlPlaneConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return { ...DEFAULT_CONTROL_PLANE_CONFIG, ...JSON.parse(raw) };
    }
  } catch { /* use defaults */ }
  return { ...DEFAULT_CONTROL_PLANE_CONFIG };
}

_config = loadConfig();

export function getControlPlaneConfig(): ControlPlaneConfig {
  return { ..._config };
}

export function setControlPlaneConfig(partial: Partial<ControlPlaneConfig>): void {
  _config = { ..._config, ...partial };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(_config));
  } catch { /* silent */ }
}

export function isControlPlaneEnabled(): boolean {
  return _config.enabled;
}

/** Disable entire Control Plane — hides INTEL Panel, stops ENGINEER, reverts navigation */
export function disableControlPlane(): void {
  setControlPlaneConfig({
    enabled: false,
    intel_panel_enabled: false,
    engineer_scheduler_enabled: false,
  });
}

/** Enable entire Control Plane */
export function enableControlPlane(): void {
  setControlPlaneConfig({
    enabled: true,
    intel_panel_enabled: true,
    engineer_scheduler_enabled: true,
  });
}
