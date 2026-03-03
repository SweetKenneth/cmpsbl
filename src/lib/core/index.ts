/**
 * CORE Module — Substrate Kernel (Standalone)
 * CORE is the first-class kernel that boots before all layers.
 *
 * Boot order (Vertical Spine):
 *   CORE → SYSTEM → CCR → Modules → INTEGRATION
 * 
 * Cross-cutting:
 *   OCG (Operational Compliance Grid) — right-side tap
 *   CLM — lateral intelligence branch
 *   Fields (EVOLUTION / IMMUNITY / INTENT) — permeate the spine
 *   Overlay Plane (GOVERNANCE) — supervisory blanket
 *   DEFENSE Shell — outer containment boundary
 *
 * CORE provides:
 * - Substrate boot sequence management
 * - Base configuration and constants
 * - Cross-module type definitions
 * - Module registry utilities
 * - Error boundary wrappers
 */

// ============ Constants ============

import { SUBSTRATE_VERSION as _SV, SUBSTRATE_CODENAME as _SC } from '@/lib/substrate/versions';
export const SUBSTRATE_VERSION = _SV;
export const SUBSTRATE_CODENAME = _SC;
export { MODULE_VERSIONS } from '@/lib/substrate/versions';
export const CORE_VERSION = _SV;
export const CORE_CODENAME = 'Foundation';

/**
 * All substrate entries — Field-Based Topology
 *
 * Spine (Vertical deterministic flow):
 *   CORE → SYSTEM → CCR (BRAIN, MEMORY, DREAM) → Modules → INTEGRATION
 *
 * Grid (Boundary enforcement):
 *   OCG Zones (5): RIPPLE, ACCESS, IDENTITY, RELAY, AUDIT
 *
 * Fields (System-wide transformation fabric):
 *   EVOLUTION, IMMUNITY, INTENT — permeate the entire spine
 *
 * Plane (Supervisory blanket):
 *   GOVERNANCE
 *
 * Shell (Outer containment boundary):
 *   DEFENSE
 *
 * Branch (Lateral intelligence):
 *   CLM
 *
 * Absorbed:
 *   modernizer → EVOLUTION field
 */
export const SUBSTRATE_MODULES = [
  // Kernel (boots first)
  'core',
  // SYSTEM (standalone layer, extracted from CCR)
  'system',
  // CCR Zones (backward compat — route to Layer 0, hot-swappable)
  'brain', 'memory', 'dream',
  // OCG Zones (Operational Compliance Grid — formerly CCL)
  'ripple', 'access', 'identity', 'relay', 'audit',
  // Absorbed (routes to evolution field)
  'modernizer',
  // 10 Public Modules (MEDIC + NERVE promoted from phantom → canonical)
  'decode', 'encode', 'vision', 'cortex', 'nexus', 'economy', 'sandbox', 'inclusive',
  'medic', 'nerve',
  // Fields (system-wide transformation fabric)
  'immunity', 'intent',
  // Overlay Plane (supervisory)
  'governance',
  // Shell (outer containment)
  'defense',
  // Module (boots last)
  'integration',
  // Expansion Modules (38-Node Architecture)
  'sovereign', 'oracle', 'conscience', 'forge',
  'lingua', 'compass', 'echo', 'treaty', 'harvest', 'reflex',
  // CSZ — Covert Systems Zone
  'evolution', 'shadow', 'phantom',
] as const;

// Public-facing entity count (CORE + 8 Modules + INTEGRATION)
export const PUBLIC_MODULE_COUNT = 12;
// Field count (system-wide transformation fabric)
export const FIELD_COUNT = 2;
// OCG Zone count (now includes NERVE)
export const OCG_ZONE_COUNT = 6;
// CCR Zone count (SYSTEM extracted)
export const CCR_ZONE_COUNT = 3;

// CCR Zone modules — SYSTEM extracted, now standalone
export const CCR_ZONE_MODULES = ['brain', 'memory', 'dream'] as const;

// OCG Zone modules (Operational Compliance Grid — formerly CCL)
export const OCG_ZONE_MODULES = ['ripple', 'access', 'identity', 'relay', 'audit'] as const;

// Absorbed (route to a field)
export const ABSORBED_FACADES = ['modernizer'] as const; // → evolution field

export type SubstrateModuleName = typeof SUBSTRATE_MODULES[number];

// Entity classification — new taxonomy
export type EntityType = 'kernel' | 'system-layer' | 'module' | 'field' | 'plane' | 'shell' | 'zone-ccr' | 'zone-ocg' | 'absorbed' | 'zone-esz' | 'zone-epz' | 'zone-emz' | 'zone-csz';

export const MODULE_ENTITY_TYPES: Record<SubstrateModuleName, EntityType> = {
  // Kernel (boots first)
  core: 'kernel',
  // SYSTEM (standalone layer between CORE and CCR)
  system: 'system-layer',
  // CCR Zones (SYSTEM extracted)
  brain: 'zone-ccr',
  memory: 'zone-ccr',
  dream: 'zone-ccr',
  // OCG Zones (Operational Compliance Grid — includes NERVE)
  ripple: 'zone-ocg',
  access: 'zone-ocg',
  identity: 'zone-ocg',
  relay: 'zone-ocg',
  audit: 'zone-ocg',
  nerve: 'zone-ocg',
  // Absorbed
  modernizer: 'absorbed',
  // Execution Modules
  decode: 'module',
  encode: 'module',
  vision: 'module',
  cortex: 'module',
  nexus: 'module',
  economy: 'module',
  sandbox: 'module',
  inclusive: 'module',
  medic: 'module',
  // Fields (system-wide transformation fabric)
  immunity: 'field',
  intent: 'field',
  // Overlay Plane (supervisory blanket)
  governance: 'plane',
  // Shell (outer containment boundary)
  defense: 'shell',
  // Module (boots last)
  integration: 'module',
  // Expansion Sovereignty Zone (ESZ)
  sovereign: 'zone-esz',
  oracle: 'zone-esz',
  conscience: 'zone-esz',
  treaty: 'zone-esz',
  // Expansion Perception Zone (EPZ)
  compass: 'zone-epz',
  echo: 'zone-epz',
  reflex: 'zone-epz',
  // Expansion Manufacturing Zone (EMZ)
  forge: 'zone-emz',
  lingua: 'zone-emz',
  phantom: 'zone-emz',
  harvest: 'zone-emz',
};

/**
 * Field order — system-wide transformation fabric (no hierarchy, permeate the spine)
 */
export const FIELD_ORDER = ['evolution', 'immunity', 'intent'] as const;

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
  current_phase: 'kernel' | 'system' | 'cognitive' | 'operational' | 'administrative' | 'complete';
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
    
    const entityType = MODULE_LAYERS[module];
    if (entityType === 'system-layer' && bootSequence.current_phase !== 'complete') {
      bootSequence.current_phase = 'system';
    }
    if ((entityType === 'zone-ccr' || entityType === 'zone-ocg') && bootSequence.current_phase !== 'complete') {
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
    // SYSTEM depends on CORE only
    system: ['core'],
    // CCR zones depend on CORE and SYSTEM
    brain: ['core', 'system'],
    memory: ['core', 'system'],
    dream: ['core', 'system'],
    // OCG zones depend on CORE
    ripple: ['core'],
    access: ['core'],
    identity: ['core'],
    relay: ['core'],
    audit: ['core'],
    // Absorbed
    modernizer: ['core'],
    // 10 Modules
    decode: ['core'],
    encode: ['core', 'decode'],
    vision: ['core'],
    cortex: ['core'],
    nexus: ['core'],
    economy: ['core'],
    sandbox: ['core'],
    inclusive: ['core'],
    medic: ['core', 'system', 'vision'],
    nerve: ['core', 'ripple', 'system'],
    // Fields
    evolution: ['core'],
    immunity: ['core', 'defense'],
    intent: ['core'],
    // Plane
    governance: ['core'],
    // Shell
    defense: ['core'],
    // Standalone
    integration: ['core'],
    // Expansion Modules (37-Node Architecture)
    sovereign: ['core', 'defense', 'access'],
    oracle: ['core', 'brain', 'vision'],
    conscience: ['core', 'defense'],
    phantom: ['core', 'defense', 'identity'],
    forge: ['core', 'encode'],
    lingua: ['core', 'decode', 'nexus'],
    compass: ['core', 'vision', 'brain'],
    echo: ['core', 'memory'],
    treaty: ['core', 'access'],
    harvest: ['core', 'memory', 'economy'],
    reflex: ['core', 'nexus', 'vision'],
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
 
 // Matrix Node Registry — read-only weighted integrity abstraction
 export * from './matrixNodeRegistry';
