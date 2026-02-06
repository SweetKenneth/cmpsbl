/**
 * Substrate Module Version Registry
 * v7.5.3 — SYNERGY+ Epoch — Single source of truth for all module versions
 */

// Core module versions (all 14 modules)
export const MODULE_VERSIONS = {
  // Kernel Layer
  core: { version: '7.5.3', codename: 'Foundation', layer: 'Kernel' },
  ripple: { version: '7.5.3', codename: 'Cascade', layer: 'Kernel' },
  access: { version: '7.5.3', codename: 'Gatekeeper', layer: 'Kernel' },
  // Cognitive Layer
  brain: { version: '7.5.3', codename: 'Memoria', layer: 'Cognitive' },
  decode: { version: '7.5.3', codename: 'Interpreter', layer: 'Cognitive' },
  nexus: { version: '7.5.3', codename: 'Router', layer: 'Cognitive' },
  // Operational Layer
  dream: { version: '7.5.3', codename: 'Nocturne', layer: 'Operational' },
  defense: { version: '7.5.3', codename: 'Guardian', layer: 'Operational' },
  vision: { version: '7.5.3', codename: 'Vee', layer: 'Operational' },
  integration: { version: '7.5.3', codename: 'Bridge', layer: 'Operational' },
  // Administrative Layer
  system: { version: '7.5.3', codename: 'Production', layer: 'Administrative' },
  modernizer: { version: '7.5.3', codename: 'Architect', layer: 'Administrative' },
  inclusive: { version: '7.5.3', codename: 'Clarity', layer: 'Administrative' },
  // Orchestrator Layer
  cortex: { version: '7.5.3', codename: 'Orchestrator', layer: 'Orchestrator' },
} as const;

// Control plane versions
export const CONTROL_PLANE_VERSIONS = {
  atlas: { version: '7.5.3', codename: 'Prometheus', description: 'Centralized Control Plane' },
  seba: { version: '2.0.0', codename: 'Full Spectrum Autonomy', description: 'Self-Evolving Bounded Agent' },
  encoded: { version: '2.0.0', codename: 'Genesis', description: 'Implementation Executor' },
  clm: { version: '7.5.3', codename: 'Perpetual', description: 'Constant Learning Mode' },
} as const;

// Synergy Engine version
export const SYNERGY_VERSION = {
  version: '7.5.3',
  pipelines: 147,
  executors: 125,
  stierPipelines: 32,
} as const;

// Substrate version (SYNERGY+ Epoch)
export const SUBSTRATE_VERSION = '7.5.3';
export const SUBSTRATE_CODENAME = 'SYNERGY+';
export const SUBSTRATE_EPOCH = 'SYNERGY+';
export const SUBSTRATE_BUILD = `${SUBSTRATE_VERSION}-${new Date().toISOString().split('T')[0]}`;

// Get module version info
export function getModuleVersion(module: keyof typeof MODULE_VERSIONS): { version: string; codename: string; layer: string } {
  return MODULE_VERSIONS[module];
}

// Get all versions as flat object
export function getAllVersions(): Record<string, string> {
  const versions: Record<string, string> = {
    substrate: SUBSTRATE_VERSION,
    synergy_pipelines: String(SYNERGY_VERSION.pipelines),
    synergy_executors: String(SYNERGY_VERSION.executors),
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
  const [reqMajor, reqMinor = 0] = required.split('.').map(Number);
  const [actMajor, actMinor = 0] = actual.split('.').map(Number);
  return actMajor > reqMajor || (actMajor === reqMajor && actMinor >= reqMinor);
}

// Get layer modules
export function getModulesByLayer(layer: 'Kernel' | 'Cognitive' | 'Operational' | 'Administrative' | 'Orchestrator'): string[] {
  return Object.entries(MODULE_VERSIONS)
    .filter(([_, info]) => info.layer === layer)
    .map(([name]) => name);
}
