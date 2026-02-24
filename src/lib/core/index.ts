/**
 * CORE Module — Substrate Foundation Layer
 * v10.5.4 — ARCHITECT Epoch Kernel Bootstrap & Base Utilities
 * 
 * The foundational module that provides:
 * - Substrate boot sequence management
 * - Base configuration and constants
 * - Cross-module type definitions
 * - Module registry utilities
 * - Error boundary wrappers
 */

// ============ Constants ============

export const SUBSTRATE_VERSION = '10.1.0';
export const SUBSTRATE_CODENAME = 'ARCHITECT';
export const CORE_VERSION = '10.1.0';
export const CORE_CODENAME = 'Foundation';

// All substrate modules — public (12) + CCR facades (5) + CCL facades (4) = 21 entries for backward compat
// Public registry reports 12. CCR facades route to Layer 0, CCL facades route to Layer 1.
export const SUBSTRATE_MODULES = [
  'core', 'system', 'brain', 'memory', 'dream', // CCR facades (backward compat)
  'ripple', 'access', 'identity', 'relay',       // CCL facades (backward compat)
  'decode', 'encode', 'defense', 'nexus', 'vision',
  'modernizer', 'integration', 'inclusive', 'cortex', 'audit', 'economy', 'sandbox',
] as const;

// Public-facing module count
export const PUBLIC_MODULE_COUNT = 12;

// CCR facade modules (backed by CLOCKLESS_COGNITIVE_REALITY)
export const CCR_FACADE_MODULES = ['core', 'system', 'brain', 'memory', 'dream'] as const;

// CCL facade modules (backed by CLOCKLESS_COGNITIVE_LUCIDITY)
export const CCL_FACADE_MODULES = ['ripple', 'access', 'identity', 'relay'] as const;

export type SubstrateModuleName = typeof SUBSTRATE_MODULES[number];

// Module layer classification
export type ModuleLayer = 'kernel' | 'cognitive' | 'operational' | 'administrative' | 'orchestrator' | 'infrastructure';

export const MODULE_LAYERS: Record<SubstrateModuleName, ModuleLayer> = {
  // CCR facades
  core: 'kernel',
  system: 'administrative',
  brain: 'cognitive',
  memory: 'infrastructure',
  dream: 'cognitive',
  identity: 'infrastructure',
  // 16 public modules
  decode: 'cognitive',
  encode: 'orchestrator',
  defense: 'operational',
  nexus: 'cognitive',
  vision: 'cognitive',
  ripple: 'kernel',
  access: 'kernel',
  modernizer: 'administrative',
  integration: 'operational',
  inclusive: 'administrative',
  cortex: 'orchestrator',
  relay: 'infrastructure',
  audit: 'infrastructure',
  economy: 'infrastructure',
  sandbox: 'infrastructure',
};

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

/**
 * Initialize the substrate boot sequence
 */
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

/**
 * Mark a module as booted
 */
export function markModuleBooted(module: SubstrateModuleName): void {
  if (!bootSequence) {
    initializeBootSequence();
  }
  
  if (bootSequence && !bootSequence.modules_booted.includes(module)) {
    bootSequence.modules_booted.push(module);
    
    // Update phase
    const layer = MODULE_LAYERS[module];
    if (layer === 'administrative' && bootSequence.current_phase !== 'complete') {
      bootSequence.current_phase = 'administrative';
    }
  }
  
  // Update module status
  moduleStatuses.set(module, {
    module,
    version: SUBSTRATE_VERSION,
    health: 100,
    status: 'online',
    lastPing: new Date().toISOString(),
    dependencies: getModuleDependencies(module),
  });
}

/**
 * Mark a module as failed
 */
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

/**
 * Complete the boot sequence
 */
export function completeBootSequence(): BootSequence | null {
  if (!bootSequence) return null;
  
  bootSequence.completed_at = new Date().toISOString();
  bootSequence.current_phase = 'complete';
  bootSequence.success = bootSequence.modules_failed.length === 0;
  
  return bootSequence;
}

/**
 * Get current boot sequence status
 */
export function getBootSequence(): BootSequence | null {
  return bootSequence ? { ...bootSequence } : null;
}

// ============ Module Registry ============

/**
 * Get module dependencies
 */
export function getModuleDependencies(module: SubstrateModuleName): SubstrateModuleName[] {
  const deps: Record<SubstrateModuleName, SubstrateModuleName[]> = {
    core: [],
    ripple: ['core'],
    access: ['core', 'ripple'],
    brain: ['core', 'ripple', 'access'],
    vision: ['brain'],
    cortex: ['brain', 'vision'],
    modernizer: ['cortex'],
    decode: ['brain'],
    defense: ['access'],
    nexus: ['defense'],
    dream: ['nexus'],
    integration: ['defense'],
    inclusive: ['integration'],
    system: ['vision'],
    memory: ['core', 'brain'],
    relay: ['core', 'ripple'],
    audit: ['core', 'access'],
    identity: ['core', 'access'],
    economy: ['core', 'nexus'],
    sandbox: ['core', 'defense'],
    encode: ['cortex', 'brain'],
  };
  
  return deps[module] || [];
}

/**
 * Check if a module can boot (all dependencies are online)
 */
export function canModuleBoot(module: SubstrateModuleName): boolean {
  const deps = getModuleDependencies(module);
  return deps.every(dep => {
    const status = moduleStatuses.get(dep);
    return status?.status === 'online';
  });
}

/**
 * Get all module statuses
 */
export function getModuleStatuses(): ModuleStatus[] {
  return Array.from(moduleStatuses.values());
}

/**
 * Get status for a specific module
 */
export function getModuleStatus(module: SubstrateModuleName): ModuleStatus | null {
  return moduleStatuses.get(module) || null;
}

/**
 * Update module health
 */
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

/**
 * Get core configuration
 */
export function getCoreConfig(): CoreConfig {
  return { ...coreConfig };
}

/**
 * Update core configuration
 */
export function updateCoreConfig(updates: Partial<CoreConfig>): CoreConfig {
  coreConfig = { ...coreConfig, ...updates };
  return getCoreConfig();
}

// ============ Utilities ============

/**
 * Check if substrate is fully booted
 */
export function isSubstrateReady(): boolean {
  return bootSequence?.success === true && bootSequence?.current_phase === 'complete';
}

/**
 * Get substrate health score (0-100)
 */
export function getSubstrateHealth(): number {
  const statuses = getModuleStatuses();
  if (statuses.length === 0) return 0;
  
  const totalHealth = statuses.reduce((sum, s) => sum + s.health, 0);
  return Math.round(totalHealth / statuses.length);
}

/**
 * Get modules by layer
 */
export function getModulesByLayer(layer: ModuleLayer): SubstrateModuleName[] {
  return SUBSTRATE_MODULES.filter(m => MODULE_LAYERS[m] === layer);
}

/**
 * Get boot order index for a module
 */
export function getBootOrder(module: SubstrateModuleName): number {
  return SUBSTRATE_MODULES.indexOf(module);
}

// ============ Error Boundaries ============

/**
 * Safe module execution wrapper
 */
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

/**
 * Module initialization helper
 */
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
