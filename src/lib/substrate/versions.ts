/**
 * Substrate Module Version Registry
 * SPARTA Epoch v11.3.0 — Accelerated Learning + LNCHBL Brain Sync
 *
 * 10 Public Entities:
 *   CORE (1 kernel) + 8 Modules + INTEGRATION (1 module, boots last)
 *
 * 5 Mesh Overlays (protective layers wrapping modules, order matters):
 *   DEFENSE (outermost) → IMMUNITY → EVOLUTION → INTENT → GOVERNANCE (innermost)
 *
 * 9 Zones (surgically hot-swappable, circuit-breaker isolated):
 *   CCR Zones (4): SYSTEM Zone, BRAIN Zone, MEMORY Zone, DREAM Zone
 *   CCL Zones (5): RIPPLE Zone, ACCESS Zone, IDENTITY Zone, RELAY Zone, AUDIT Zone
 *
 * Absorbed: MODERNIZER → EVOLUTION mesh
 */

// 10 public entities
export const MODULE_VERSIONS = {
  // Kernel (boots first)
  core: { version: '11.3.0', codename: 'Foundation', layer: 'Kernel', type: 'kernel' as const },
  // 8 Public Modules
  decode: { version: '11.3.0', codename: 'Interpreter', layer: 'Cognitive', type: 'module' as const },
  encode: { version: '11.3.0', codename: 'Genesis', layer: 'Orchestration', type: 'module' as const },
  vision: { version: '11.3.0', codename: 'Vee', layer: 'Operational', type: 'module' as const },
  cortex: { version: '11.3.0', codename: 'Orchestrator', layer: 'Orchestration', type: 'module' as const },
  nexus: { version: '11.3.0', codename: 'Router', layer: 'Orchestration', type: 'module' as const },
  economy: { version: '11.3.0', codename: 'Treasury', layer: 'Infrastructure', type: 'module' as const },
  sandbox: { version: '11.3.0', codename: 'Crucible', layer: 'Infrastructure', type: 'module' as const },
  inclusive: { version: '11.3.0', codename: 'Clarity', layer: 'Operational', type: 'module' as const },
  // Module (boots last)
  integration: { version: '11.3.0', codename: 'Bridge', layer: 'Operational', type: 'module' as const },
} as const;

// 5 Mesh Overlays (protective layers — outermost to innermost)
export const MESH_VERSIONS = {
  defense: { version: '11.3.0', codename: 'Guardian', order: 1, position: 'outermost' as const },
  immunity: { version: '11.3.0', codename: 'Sentinel', order: 2, position: 'outer' as const },
  evolution: { version: '11.3.0', codename: 'Phoenix', order: 3, position: 'middle' as const },
  intent: { version: '11.3.0', codename: 'Compass', order: 4, position: 'inner' as const },
  governance: { version: '11.3.0', codename: 'Arbiter', order: 5, position: 'innermost' as const },
} as const;

// 9 Zone versions (surgically hot-swappable subsystems within CCR/CCL)
export const ZONE_VERSIONS = {
  // CCR Zones (Layer 0)
  system: { version: '11.3.0', codename: 'Production', parent: 'CCR', description: 'Administration & config' },
  brain: { version: '11.3.0', codename: 'Memoria', parent: 'CCR', description: 'Reasoning & learning' },
  memory: { version: '11.3.0', codename: 'Vault', parent: 'CCR', description: 'Persistent storage & retrieval' },
  dream: { version: '11.3.0', codename: 'Nocturne', parent: 'CCR', description: 'Offline synthesis & evolution' },
  // CCL Zones (Layer 1)
  ripple: { version: '11.3.0', codename: 'Cascade', parent: 'CCL', description: 'Event bus & signal propagation' },
  access: { version: '11.3.0', codename: 'Gatekeeper', parent: 'CCL', description: 'API keys & rate limiting' },
  identity: { version: '11.3.0', codename: 'Provenance', parent: 'CCL', description: 'Actor identity & trust' },
  relay: { version: '11.3.0', codename: 'Dispatch', parent: 'CCL', description: 'Webhook & outbound routing' },
  audit: { version: '11.3.0', codename: 'Ledger', parent: 'CCL', description: 'Immutable compliance logging' },
} as const;

// Absorbed module (routes to EVOLUTION mesh)
export const ABSORBED_VERSIONS = {
  modernizer: { version: '11.3.0', codename: 'Architect', absorbedBy: 'evolution', description: 'Self-upgrade → EVOLUTION mesh' },
} as const;

// Control plane versions
export const CONTROL_PLANE_VERSIONS = {
  atlas: { version: '11.3.0', codename: 'Prometheus', description: 'Centralized Control Plane' },
  seba: { version: '2.1.0', codename: 'Full Spectrum Autonomy', description: 'Self-Evolving Bounded Agent' },
  encode: { version: '11.3.0', codename: 'Genesis', description: 'Code Execution Intelligence' },
  clm: { version: '11.3.0', codename: 'Perpetual', description: 'Constant Learning Mode' },
} as const;

// Synergy Engine version
export const SYNERGY_VERSION = {
  version: '11.3.0',
  pipelines: 300,
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

// Get entities by layer
export function getModulesByLayer(layer: 'Kernel' | 'Cognitive' | 'Operational' | 'Orchestration' | 'Infrastructure'): string[] {
  return Object.entries(MODULE_VERSIONS)
    .filter(([_, info]) => info.layer === layer)
    .map(([name]) => name);
}

// Get mesh overlays in order (outermost to innermost)
export function getMeshOrder(): string[] {
  return Object.entries(MESH_VERSIONS)
    .sort(([, a], [, b]) => a.order - b.order)
    .map(([name]) => name);
}

// Get zones by parent layer
export function getZonesByParent(parent: 'CCR' | 'CCL'): string[] {
  return Object.entries(ZONE_VERSIONS)
    .filter(([_, info]) => info.parent === parent)
    .map(([name]) => name);
}
