/**
 * Substrate Module Version Registry
 * v10.5.4 — ARCHITECT Epoch — Single source of truth for all module versions
 */

// Core module versions (all 21 modules)
export const MODULE_VERSIONS = {
  // Kernel Layer
  core: { version: '10.1.0', codename: 'Foundation', layer: 'Kernel' },
  ripple: { version: '10.1.0', codename: 'Cascade', layer: 'Kernel' },
  access: { version: '10.1.0', codename: 'Gatekeeper', layer: 'Kernel' },
  // Cognitive Layer
  brain: { version: '10.1.0', codename: 'Memoria', layer: 'Cognitive' },
  decode: { version: '10.1.0', codename: 'Interpreter', layer: 'Cognitive' },
  // Operational Layer
  nexus: { version: '10.1.0', codename: 'Router', layer: 'Operational' },
  dream: { version: '10.1.0', codename: 'Nocturne', layer: 'Operational' },
  defense: { version: '10.1.0', codename: 'Guardian', layer: 'Operational' },
  vision: { version: '10.1.0', codename: 'Vee', layer: 'Operational' },
  integration: { version: '10.1.0', codename: 'Bridge', layer: 'Operational' },
  // Administrative Layer
  system: { version: '10.1.0', codename: 'Production', layer: 'Administrative' },
  modernizer: { version: '10.1.0', codename: 'Architect', layer: 'Administrative' },
  inclusive: { version: '10.1.0', codename: 'Clarity', layer: 'Administrative' },
  // Orchestrator Layer
  cortex: { version: '10.1.0', codename: 'Orchestrator', layer: 'Orchestrator' },
  encode: { version: '10.1.0', codename: 'Genesis', layer: 'Orchestrator' },
  // Infrastructure Layer
  memory: { version: '10.1.0', codename: 'Vault', layer: 'Infrastructure' },
  relay: { version: '10.1.0', codename: 'Dispatch', layer: 'Infrastructure' },
  audit: { version: '10.1.0', codename: 'Ledger', layer: 'Infrastructure' },
  identity: { version: '10.1.0', codename: 'Provenance', layer: 'Infrastructure' },
  economy: { version: '10.1.0', codename: 'Treasury', layer: 'Infrastructure' },
  sandbox: { version: '10.1.0', codename: 'Crucible', layer: 'Infrastructure' },
} as const;

// Control plane versions
export const CONTROL_PLANE_VERSIONS = {
  atlas: { version: '10.1.0', codename: 'Prometheus', description: 'Centralized Control Plane' },
  seba: { version: '2.0.0', codename: 'Full Spectrum Autonomy', description: 'Self-Evolving Bounded Agent' },
  encode: { version: '10.1.0', codename: 'Genesis', description: 'Code Execution Intelligence' },
  clm: { version: '10.1.0', codename: 'Perpetual', description: 'Constant Learning Mode' },
} as const;

// Synergy Engine version
export const SYNERGY_VERSION = {
  version: '10.1.0',
  pipelines: 200,
  executors: 125,
  stierPipelines: 32,
} as const;

// Substrate version — reads from centralized Zustand store
import { getMetric } from '@/stores/publicMetricsStore';

export const SUBSTRATE_VERSION = getMetric('version');
export const SUBSTRATE_CODENAME = getMetric('codename');
export const SUBSTRATE_EPOCH = getMetric('epoch');
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
export function getModulesByLayer(layer: 'Kernel' | 'Cognitive' | 'Operational' | 'Administrative' | 'Orchestrator' | 'Infrastructure'): string[] {
  return Object.entries(MODULE_VERSIONS)
    .filter(([_, info]) => info.layer === layer)
    .map(([name]) => name);
}
