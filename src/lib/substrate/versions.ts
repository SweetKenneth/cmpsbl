/**
 * Substrate Module Version Registry
 * v7.0.0 — Single source of truth for all module versions
 */

// Core module versions
export const MODULE_VERSIONS = {
  core: { version: '7.0.0', codename: 'Foundation' },
  ripple: { version: '7.0.0', codename: 'Cascade' },
  access: { version: '7.0.0', codename: 'Gatekeeper' },
  brain: { version: '7.0.0', codename: 'Memoria' },
  vision: { version: '2.0.0', codename: 'Vee' },
  cortex: { version: '7.0.0', codename: 'Orchestrator' },
  modernizer: { version: '7.0.0', codename: 'Architect' },
  decode: { version: '7.0.0', codename: 'Interpreter' },
  defense: { version: '7.0.0', codename: 'Guardian' },
  nexus: { version: '7.0.0', codename: 'Router' },
  dream: { version: '7.0.0', codename: 'Nocturne' },
  integration: { version: '7.0.0', codename: 'Bridge' },
  inclusive: { version: '7.0.0', codename: 'Clarity' },
  system: { version: '7.0.0', codename: 'Production' },
} as const;

// Control plane versions
export const CONTROL_PLANE_VERSIONS = {
  atlas: { version: '7.0.0', codename: 'Prometheus' },
  seba: { version: '7.0.0', codename: 'Autonomy' },
  encoded: { version: '7.0.0', codename: 'Genesis' },
  clm: { version: '7.0.0', codename: 'Perpetual' },
} as const;

// Substrate version
export const SUBSTRATE_VERSION = '7.0.0';
export const SUBSTRATE_CODENAME = 'Olympus';
export const SUBSTRATE_BUILD = `${SUBSTRATE_VERSION}-${new Date().toISOString().split('T')[0]}`;

// Get module version info
export function getModuleVersion(module: keyof typeof MODULE_VERSIONS): { version: string; codename: string } {
  return MODULE_VERSIONS[module];
}

// Get all versions as flat object
export function getAllVersions(): Record<string, string> {
  const versions: Record<string, string> = {
    substrate: SUBSTRATE_VERSION,
  };
  
  for (const [module, info] of Object.entries(MODULE_VERSIONS)) {
    versions[module] = info.version;
  }
  
  for (const [plane, info] of Object.entries(CONTROL_PLANE_VERSIONS)) {
    versions[plane] = info.version;
  }
  
  return versions;
}

// Version check utilities
export function isVersionCompatible(required: string, actual: string): boolean {
  const [reqMajor] = required.split('.').map(Number);
  const [actMajor] = actual.split('.').map(Number);
  return actMajor >= reqMajor;
}
