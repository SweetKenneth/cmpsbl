/**
 * Control Plane Instance Identity
 * Stable per-tab/session instance ID + env/tenant resolution.
 */

let _instanceId: string | null = null;

export function getInstanceId(): string {
  if (!_instanceId) {
    _instanceId = typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : `inst-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  }
  return _instanceId;
}

export function getEnv(): string {
  // Check VITE_ENV first
  try {
    const env = import.meta.env?.VITE_ENV;
    if (env) return env;
  } catch { /* ignore */ }

  // Hostname heuristic
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    if (host === 'localhost' || host === '127.0.0.1') return 'dev';
    if (host.includes('staging') || host.includes('preview')) return 'staging';
  }
  return 'prod';
}

export function getTenantId(): string {
  return 'global';
}
