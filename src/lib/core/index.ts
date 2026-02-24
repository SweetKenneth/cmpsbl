/**
 * CORE Module — Substrate Kernel (Standalone)
 * Separated from CCR — CORE is the first-class kernel that boots before all layers.
 *
 * Boot order: CORE → CCR → CCL → Modules → Meshes → INTEGRATION
 *
 * CORE provides:
 * - Substrate boot sequence management
 * - Base configuration and constants
 * - Cross-module type definitions
 * - Module registry utilities
 * - Error boundary wrappers
 */

// ============ Constants ============

export const SUBSTRATE_VERSION = '11.1.0';
export const SUBSTRATE_CODENAME = 'SPARTA';
export const CORE_VERSION = '11.1.0';
export const CORE_CODENAME = 'Foundation';

/**
 * All substrate entries — 15 public + 9 Zones + 1 absorbed = 25 total
 *
 * Public (15):
 *   CORE (1) + Modules (8) + Meshes (5) + INTEGRATION (1)
 *
 * Zones (9) — surgically hot-swappable, circuit-breaker isolated:
 *   CCR Zones (4): system, brain, memory, dream
 *   CCL Zones (5): ripple, access, identity, relay, audit
 *
 * Absorbed:
 *   modernizer → EVOLUTION mesh
 */
export const SUBSTRATE_MODULES = [
  // Kernel (standalone)
  'core',
  // CCR Zones (backward compat — route to Layer 0, hot-swappable)
  'system', 'brain', 'memory', 'dream',
  // CCL Zones (backward compat — route to Layer 1, hot-swappable)
  'ripple', 'access', 'identity', 'relay', 'audit',
  // Absorbed (routes to evolution mesh)
  'modernizer',
  // 8 Public Modules
  'decode', 'encode', 'vision', 'cortex', 'nexus', 'economy', 'sandbox', 'inclusive',
  // 5 Meshes
  'defense', 'immunity', 'evolution', 'intent', 'governance',
  // Standalone
  'integration',
] as const;

// Public-facing entity count
export const PUBLIC_MODULE_COUNT = 15;
// Zone count
export const ZONE_COUNT = 9;

// CCR Zone modules (backed by CLOCKLESS_COGNITIVE_REALITY)
export const CCR_ZONE_MODULES = ['system', 'brain', 'memory', 'dream'] as const;

// CCL Zone modules (backed by CLOCKLESS_COGNITIVE_LUCIDITY)
export const CCL_ZONE_MODULES = ['ripple', 'access', 'identity', 'relay', 'audit'] as const;

// Absorbed (route to a mesh)
export const ABSORBED_FACADES = ['modernizer'] as const; // → evolution mesh

export type SubstrateModuleName = typeof SUBSTRATE_MODULES[number];

// Entity classification
export type EntityType = 'kernel' | 'module' | 'mesh' | 'standalone' | 'zone-ccr' | 'zone-ccl' | 'absorbed';

export const MODULE_ENTITY_TYPES: Record<SubstrateModuleName, EntityType> = {
  // Kernel
  core: 'kernel',
  // CCR Zones
  system: 'zone-ccr',
  brain: 'zone-ccr',
  memory: 'zone-ccr',
  dream: 'zone-ccr',
  // CCL Zones
  ripple: 'zone-ccl',
  access: 'zone-ccl',
  identity: 'zone-ccl',
  relay: 'zone-ccl',
  audit: 'zone-ccl',
  // Absorbed
  modernizer: 'absorbed',
  // 8 Public Modules
  decode: 'module',
  encode: 'module',
  vision: 'module',
  cortex: 'module',
  nexus: 'module',
  economy: 'module',
  sandbox: 'module',
  inclusive: 'module',
  // 5 Meshes
  defense: 'mesh',
  immunity: 'mesh',
  evolution: 'mesh',
  intent: 'mesh',
  governance: 'mesh',
  // Standalone
  integration: 'standalone',
};

// Legacy compat alias
export type ModuleLayer = EntityType;
export const MODULE_LAYERS = MODULE_ENTITY_TYPES;

// ============ Types ============

export interface ModuleStatus {
  module: SubstrateModuleName;
  version: string;
  health: number; // 0-100
  status: 'online' | 'degraded' | 'offline' | 'booting';
  lastPing: string | null;
  dependencies: SubstrateModuleName[];
}

export interface BootSequence {
  started_at: string;
  completed_at: string | null;
  modules_booted: SubstrateModuleName[];
  modules_failed: SubstrateModuleName[];
  current_phase: 'kernel' | 'cognitive' | 'operational' | 'administrative' | 'complete';
  success: boolean;
}

export interface CoreConfig {
  debug_mode: boolean;
  strict_governance: boolean;
  event_logging: boolean;
  performance_tracking: boolean;
  max_retry_attempts: number;
  default_timeout_ms: number;
}

// ============ State ============

let bootSequence: BootSequence | null = null;
let coreConfig: CoreConfig = {
  debug_mode: false,
  strict_governance: true,
  event_logging: true,
  performance_tracking: true,
  max_retry_attempts: 3,
  default_timeout_ms: 30000,
};

const moduleStatuses: Map<SubstrateModuleName, ModuleStatus> = new Map();

// ============ Boot Management ============

export function initializeBootSequence(): BootSequence {
  bootSequence = {
    started_at: new Date().toISOString(),
    completed_at: null,
    modules_booted: [],
    modules_failed: [],
    current_phase: 'kernel',
    success: false,
  };
  return bootSequence;
}

export function markModuleBooted(module: SubstrateModuleName): void {
  if (!bootSequence) {
    initializeBootSequence();
  }
  
  if (bootSequence && !bootSequence.modules_booted.includes(module)) {
    bootSequence.modules_booted.push(module);
    
    const layer = MODULE_LAYERS[module];
    if (layer === 'administrative' && bootSequence.current_phase !== 'complete') {
      bootSequence.current_phase = 'administrative';
    }
  }
  
  moduleStatuses.set(module, {
    module,
    version: SUBSTRATE_VERSION,
    health: 100,
    status: 'online',
    lastPing: new Date().toISOString(),
    dependencies: getModuleDependencies(module),
  });
}

export function markModuleFailed(module: SubstrateModuleName, reason?: string): void {
  if (!bootSequence) {
    initializeBootSequence();
  }
  
  if (bootSequence && !bootSequence.modules_failed.includes(module)) {
    bootSequence.modules_failed.push(module);
  }
  
  moduleStatuses.set(module, {
    module,
    version: SUBSTRATE_VERSION,
    health: 0,
    status: 'offline',
    lastPing: null,
    dependencies: getModuleDependencies(module),
  });
  
  console.error(`[CORE] Module ${module} failed to boot: ${reason || 'Unknown error'}`);
}

export function completeBootSequence(): BootSequence | null {
  if (!bootSequence) return null;
  
  bootSequence.completed_at = new Date().toISOString();
  bootSequence.current_phase = 'complete';
  bootSequence.success = bootSequence.modules_failed.length === 0;
  
  return bootSequence;
}

export function getBootSequence(): BootSequence | null {
  return bootSequence ? { ...bootSequence } : null;
}

// ============ Module Registry ============

export function getModuleDependencies(module: SubstrateModuleName): SubstrateModuleName[] {
  const deps: Record<SubstrateModuleName, SubstrateModuleName[]> = {
    core: [],
    // CCR facades
    system: ['core'],
    brain: ['core'],
    memory: ['core'],
    dream: ['core'],
    // CCL facades
    ripple: ['core'],
    access: ['core'],
    identity: ['core'],
    relay: ['core'],
    audit: ['core'],
    // Absorbed
    modernizer: ['core'],
    // 8 Modules
    decode: ['core'],
    encode: ['core', 'decode'],
    vision: ['core'],
    cortex: ['core'],
    nexus: ['core'],
    economy: ['core'],
    sandbox: ['core'],
    inclusive: ['core'],
    // 5 Meshes
    defense: ['core'],
    immunity: ['core', 'defense'],
    evolution: ['core'],
    intent: ['core'],
    governance: ['core'],
    // Standalone
    integration: ['core'],
  };
  
  return deps[module] || [];
}

export function canModuleBoot(module: SubstrateModuleName): boolean {
  const deps = getModuleDependencies(module);
  return deps.every(dep => {
    const status = moduleStatuses.get(dep);
    return status?.status === 'online';
  });
}

export function getModuleStatuses(): ModuleStatus[] {
  return Array.from(moduleStatuses.values());
}

export function getModuleStatus(module: SubstrateModuleName): ModuleStatus | null {
  return moduleStatuses.get(module) || null;
}

export function updateModuleHealth(module: SubstrateModuleName, health: number): void {
  const status = moduleStatuses.get(module);
  if (status) {
    status.health = Math.max(0, Math.min(100, health));
    status.status = health >= 80 ? 'online' : health >= 50 ? 'degraded' : 'offline';
    status.lastPing = new Date().toISOString();
    moduleStatuses.set(module, status);
  }
}

// ============ Configuration ============

export function getCoreConfig(): CoreConfig {
  return { ...coreConfig };
}

export function updateCoreConfig(updates: Partial<CoreConfig>): CoreConfig {
  coreConfig = { ...coreConfig, ...updates };
  return getCoreConfig();
}

// ============ Utilities ============

export function isSubstrateReady(): boolean {
  return bootSequence?.success === true && bootSequence?.current_phase === 'complete';
}

export function getSubstrateHealth(): number {
  const statuses = getModuleStatuses();
  if (statuses.length === 0) return 0;
  
  const totalHealth = statuses.reduce((sum, s) => sum + s.health, 0);
  return Math.round(totalHealth / statuses.length);
}

export function getModulesByLayer(layer: ModuleLayer): SubstrateModuleName[] {
  return SUBSTRATE_MODULES.filter(m => MODULE_LAYERS[m] === layer);
}

export function getBootOrder(module: SubstrateModuleName): number {
  return SUBSTRATE_MODULES.indexOf(module);
}

// ============ Error Boundaries ============

export async function safeExecute<T>(
  module: SubstrateModuleName,
  operation: string,
  fn: () => Promise<T>,
  fallback?: T
): Promise<{ success: boolean; data?: T; error?: string }> {
  try {
    const data = await fn();
    return { success: true, data };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`[CORE] ${module}.${operation} failed: ${errorMessage}`);
    
    if (fallback !== undefined) {
      return { success: false, data: fallback, error: errorMessage };
    }
    
    return { success: false, error: errorMessage };
  }
}

export function initModule(module: SubstrateModuleName): void {
  if (!canModuleBoot(module)) {
    const deps = getModuleDependencies(module);
    const missing = deps.filter(d => !moduleStatuses.get(d) || moduleStatuses.get(d)?.status !== 'online');
    console.warn(`[CORE] Cannot boot ${module}: missing dependencies [${missing.join(', ')}]`);
    return;
  }
  
  markModuleBooted(module);
  console.log(`[CORE] Module ${module} initialized`);
}
 
 // Module lifecycle management
 export * from './moduleLifecycle';
 
 // Configuration management
 export * from './configManagement';
 
 // Health aggregator
 export * from './healthAggregator';
