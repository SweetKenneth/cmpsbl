/**
 * CORE Module — Module Lifecycle Management
 * Hot reload, graceful shutdown, and dependency resolution
 */

import { SUBSTRATE_MODULES, type SubstrateModuleName, getModuleDependencies, markModuleBooted, markModuleFailed } from './index';
import { withTimeout } from '@/lib/system/hardening';

// Precomputed reverse dependency map — built once at module load
const DEPENDENTS_MAP: ReadonlyMap<SubstrateModuleName, readonly SubstrateModuleName[]> = (() => {
  const map = new Map<SubstrateModuleName, SubstrateModuleName[]>();
  for (const m of SUBSTRATE_MODULES) map.set(m, []);
  for (const m of SUBSTRATE_MODULES) {
    for (const dep of getModuleDependencies(m)) {
      map.get(dep)?.push(m);
    }
  }
  return map;
})();

// ============ Types ============

export type LifecyclePhase = 'unloaded' | 'loading' | 'initializing' | 'ready' | 'degraded' | 'stopping' | 'stopped' | 'error';

export interface ModuleLifecycle {
  module: SubstrateModuleName;
  phase: LifecyclePhase;
  load_time_ms: number;
  init_time_ms: number;
  error?: string;
  restart_count: number;
  last_restart?: string;
  health_checks_passed: number;
  health_checks_failed: number;
}

export interface LifecycleEvent {
  module: SubstrateModuleName;
  event: 'load' | 'init' | 'ready' | 'degrade' | 'stop' | 'restart' | 'error' | 'recover';
  timestamp: string;
  duration_ms?: number;
  details?: string;
}

export interface DependencyGraph {
  module: SubstrateModuleName;
  dependencies: SubstrateModuleName[];
  dependents: SubstrateModuleName[];
  load_order: number;
}

// ============ State ============

const lifecycles: Map<SubstrateModuleName, ModuleLifecycle> = new Map();
const lifecycleEvents: LifecycleEvent[] = [];
const moduleInitializers: Map<SubstrateModuleName, () => Promise<void>> = new Map();
const moduleCleanups: Map<SubstrateModuleName, () => Promise<void>> = new Map();

// ============ Lifecycle Operations ============

/**
 * Load a module
 */
export async function loadModule(module: SubstrateModuleName): Promise<{ success: boolean; error?: string }> {
  const startTime = Date.now();
  
  // Check dependencies
  const deps = getModuleDependencies(module);
  for (const dep of deps) {
    const depLifecycle = lifecycles.get(dep);
    if (!depLifecycle || depLifecycle.phase !== 'ready') {
      return { success: false, error: `Dependency ${dep} is not ready` };
    }
  }
  
  // Update lifecycle
  const lifecycle = getOrCreateLifecycle(module);
  lifecycle.phase = 'loading';
  lifecycles.set(module, lifecycle);
  
  recordEvent(module, 'load');
  
  try {
    // Simulate loading with timeout guard (30s max)
    await withTimeout(
      () => new Promise(resolve => setTimeout(resolve, 50)),
      30_000,
      `loadModule(${module})`
    );
    
    lifecycle.load_time_ms = Date.now() - startTime;
    lifecycle.phase = 'initializing';
    lifecycles.set(module, lifecycle);
    
    // Run initializer if registered (with 60s timeout)
    const initializer = moduleInitializers.get(module);
    if (initializer) {
      const initStart = Date.now();
      await withTimeout(initializer, 60_000, `init(${module})`);
      lifecycle.init_time_ms = Date.now() - initStart;
    }
    
    lifecycle.phase = 'ready';
    lifecycles.set(module, lifecycle);
    
    recordEvent(module, 'ready', Date.now() - startTime);
    markModuleBooted(module);
    
    return { success: true };
  } catch (error) {
    lifecycle.phase = 'error';
    lifecycle.error = String(error);
    lifecycles.set(module, lifecycle);
    
    recordEvent(module, 'error', undefined, String(error));
    markModuleFailed(module, String(error));
    
    return { success: false, error: String(error) };
  }
}

/**
 * Stop a module gracefully
 */
export async function stopModule(module: SubstrateModuleName): Promise<{ success: boolean; error?: string }> {
  const lifecycle = lifecycles.get(module);
  if (!lifecycle) {
    return { success: false, error: 'Module not found' };
  }
  
  // Check dependents
  const dependents = getDependents(module);
  const activeDependents = dependents.filter(d => {
    const l = lifecycles.get(d);
    return l && ['ready', 'degraded'].includes(l.phase);
  });
  
  if (activeDependents.length > 0) {
    return { success: false, error: `Active dependents: ${activeDependents.join(', ')}` };
  }
  
  lifecycle.phase = 'stopping';
  lifecycles.set(module, lifecycle);
  
  recordEvent(module, 'stop');
  
  try {
    // Run cleanup if registered (with 30s timeout to prevent hung shutdowns)
    const cleanup = moduleCleanups.get(module);
    if (cleanup) {
      await withTimeout(cleanup, 30_000, `cleanup(${module})`);
    }
    
    lifecycle.phase = 'stopped';
    lifecycles.set(module, lifecycle);
    
    return { success: true };
  } catch (error) {
    lifecycle.phase = 'error';
    lifecycle.error = String(error);
    lifecycles.set(module, lifecycle);
    
    return { success: false, error: String(error) };
  }
}

/**
 * Restart a module
 */
export async function restartModule(module: SubstrateModuleName): Promise<{ success: boolean; error?: string }> {
  const stopResult = await stopModule(module);
  if (!stopResult.success && !stopResult.error?.includes('not found')) {
    return stopResult;
  }
  
  const lifecycle = getOrCreateLifecycle(module);
  lifecycle.restart_count++;
  lifecycle.last_restart = new Date().toISOString();
  lifecycles.set(module, lifecycle);
  
  recordEvent(module, 'restart');
  
  return loadModule(module);
}

/**
 * Hot reload a module (reload without stopping dependents)
 */
export async function hotReloadModule(module: SubstrateModuleName): Promise<{ success: boolean; downtime_ms: number }> {
  const startTime = Date.now();
  
  const lifecycle = lifecycles.get(module);
  
  // Mark as degraded during reload
  if (lifecycle) {
    lifecycle.phase = 'degraded';
    lifecycles.set(module, lifecycle);
  }
  
  // Perform reload
  const result = await loadModule(module);
  
  const downtime = Date.now() - startTime;
  
  if (!result.success && lifecycle) {
    // Reload failed — mark as error (don't log misleading 'recover')
    recordEvent(module, 'error', downtime, `Hot reload failed: ${result.error}`);
  }
  
  return { success: result.success, downtime_ms: downtime };
}

// ============ Dependency Resolution ============

/**
 * Get dependency graph for a module
 */
export function getDependencyGraph(module: SubstrateModuleName): DependencyGraph {
  return {
    module,
    dependencies: getModuleDependencies(module),
    dependents: getDependents(module),
    load_order: SUBSTRATE_MODULES.indexOf(module) + 1,
  };
}

/**
 * Get all modules that depend on this one
 */
export function getDependents(module: SubstrateModuleName): SubstrateModuleName[] {
  return SUBSTRATE_MODULES.filter(m => getModuleDependencies(m).includes(module));
}

/**
 * Resolve load order for multiple modules
 */
export function resolveLoadOrder(modules: SubstrateModuleName[]): SubstrateModuleName[] {
  const resolved: SubstrateModuleName[] = [];
  const pending = new Set(modules);
  
  let maxIterations = modules.length * modules.length; // O(n²) safety bound
  while (pending.size > 0 && maxIterations-- > 0) {
    const prevSize = resolved.length;
    for (const module of pending) {
      const deps = getModuleDependencies(module);
      const depsResolved = deps.every(d => !pending.has(d) || resolved.includes(d));
      
      if (depsResolved) {
        resolved.push(module);
        pending.delete(module);
      }
    }
    
    // Detect stall — no progress this iteration
    if (resolved.length === prevSize) {
      console.warn(`[moduleLifecycle] Circular dependency detected in: ${Array.from(pending).join(', ')}`);
      // Append remaining in original order to avoid dropping modules
      for (const m of modules) {
        if (pending.has(m)) resolved.push(m);
      }
      break;
    }
  }
  
  return resolved;
}

// ============ Health Monitoring ============

/**
 * Run health check for a module
 */
export async function runModuleHealthCheck(module: SubstrateModuleName): Promise<boolean> {
  const lifecycle = lifecycles.get(module);
  if (!lifecycle) return false;
  
  try {
    // Basic health check - verify phase is ready
    const isHealthy = lifecycle.phase === 'ready';
    
    if (isHealthy) {
      lifecycle.health_checks_passed++;
    } else {
      lifecycle.health_checks_failed++;
    }
    
    lifecycles.set(module, lifecycle);
    
    return isHealthy;
  } catch {
    lifecycle.health_checks_failed++;
    lifecycles.set(module, lifecycle);
    return false;
  }
}

/**
 * Get module lifecycle status
 */
export function getModuleLifecycle(module: SubstrateModuleName): ModuleLifecycle | null {
  return lifecycles.get(module) || null;
}

/**
 * Get all lifecycle statuses
 */
export function getAllLifecycles(): ModuleLifecycle[] {
  return Array.from(lifecycles.values());
}

// ============ Registration ============

/**
 * Register module initializer
 */
export function registerInitializer(module: SubstrateModuleName, fn: () => Promise<void>): void {
  moduleInitializers.set(module, fn);
}

/**
 * Register module cleanup
 */
export function registerCleanup(module: SubstrateModuleName, fn: () => Promise<void>): void {
  moduleCleanups.set(module, fn);
}

// ============ Events ============

/**
 * Get lifecycle events
 */
export function getLifecycleEvents(options?: {
  module?: SubstrateModuleName;
  event?: LifecycleEvent['event'];
  limit?: number;
}): LifecycleEvent[] {
  let events = [...lifecycleEvents];
  
  if (options?.module) {
    events = events.filter(e => e.module === options.module);
  }
  
  if (options?.event) {
    events = events.filter(e => e.event === options.event);
  }
  
  events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  
  return options?.limit ? events.slice(0, options.limit) : events;
}

// ============ Bulk Operations ============

/**
 * Load all modules in correct order
 */
export async function loadAllModules(): Promise<{
  success: boolean;
  loaded: SubstrateModuleName[];
  failed: SubstrateModuleName[];
}> {
  const loaded: SubstrateModuleName[] = [];
  const failed: SubstrateModuleName[] = [];
  
  for (const module of SUBSTRATE_MODULES) {
    const result = await loadModule(module);
    if (result.success) {
      loaded.push(module);
    } else {
      failed.push(module);
    }
  }
  
  return { success: failed.length === 0, loaded, failed };
}

/**
 * Graceful shutdown all modules
 */
export async function shutdownAllModules(): Promise<{
  stopped: SubstrateModuleName[];
  errors: string[];
}> {
  const stopped: SubstrateModuleName[] = [];
  const errors: string[] = [];
  
  // Shutdown in reverse order
  const reverseOrder = [...SUBSTRATE_MODULES].reverse();
  
  for (const module of reverseOrder) {
    const result = await stopModule(module);
    if (result.success) {
      stopped.push(module);
    } else if (result.error) {
      errors.push(`${module}: ${result.error}`);
    }
  }
  
  return { stopped, errors };
}

// ============ Helpers ============

function getOrCreateLifecycle(module: SubstrateModuleName): ModuleLifecycle {
  return lifecycles.get(module) || {
    module,
    phase: 'unloaded',
    load_time_ms: 0,
    init_time_ms: 0,
    restart_count: 0,
    health_checks_passed: 0,
    health_checks_failed: 0,
  };
}

function recordEvent(
  module: SubstrateModuleName,
  event: LifecycleEvent['event'],
  duration_ms?: number,
  details?: string
): void {
  lifecycleEvents.push({
    module,
    event,
    timestamp: new Date().toISOString(),
    duration_ms,
    details,
  });
  
  // Trim oldest events when exceeding cap — O(1) amortized via threshold check
  if (lifecycleEvents.length > 1200) {
    lifecycleEvents.splice(0, lifecycleEvents.length - 1000);
  }
}
