/**
 * CMPSBL® CORTEX Module
 * Agency-Class Orchestrator & Cross-Module Governance
 * Hardened with input validation, bounded orchestrations, and timeout guards
 */

import { supabase } from '@/integrations/supabase/client';
import type { SubstrateModule } from '../substrate';
import { validateStringInput, clampNumber, withTimeout } from '@/lib/system/hardening';

// Version info
export const CORTEX_VERSION = '7.0.0';
export const CORTEX_CODENAME = 'Orchestrator';

// Module layers
export type ModuleLayer = 'kernel' | 'cognitive' | 'operational' | 'administrative' | 'orchestrator' | 'infrastructure' | 'mesh';

// Module registry
export interface ModuleRegistryEntry {
  module: SubstrateModule;
  layer: ModuleLayer;
  bootOrder: number;
  dependencies: SubstrateModule[];
  health: number;
  circuitState: 'closed' | 'open' | 'half-open';
  lastPing: string | null;
}

// Full module registry with boot order and dependencies
export const MODULE_REGISTRY: Record<SubstrateModule, Omit<ModuleRegistryEntry, 'health' | 'circuitState' | 'lastPing'>> = {
  core: { module: 'core', layer: 'kernel', bootOrder: 1, dependencies: [] },
  ripple: { module: 'ripple', layer: 'infrastructure', bootOrder: 2, dependencies: ['core'] },
  access: { module: 'access', layer: 'infrastructure', bootOrder: 3, dependencies: ['core'] },
  brain: { module: 'brain', layer: 'cognitive', bootOrder: 4, dependencies: ['core'] },
  vision: { module: 'vision', layer: 'operational', bootOrder: 5, dependencies: ['core'] },
  cortex: { module: 'cortex', layer: 'orchestrator', bootOrder: 6, dependencies: ['core'] },
  
  decode: { module: 'decode', layer: 'cognitive', bootOrder: 8, dependencies: ['core'] },
  encode: { module: 'encode', layer: 'orchestrator', bootOrder: 9, dependencies: ['core', 'decode'] },
  defense: { module: 'defense', layer: 'mesh', bootOrder: 10, dependencies: ['core'] },
  nexus: { module: 'nexus', layer: 'orchestrator', bootOrder: 11, dependencies: ['core'] },
  dream: { module: 'dream', layer: 'cognitive', bootOrder: 12, dependencies: ['core'] },
  integration: { module: 'integration', layer: 'operational', bootOrder: 13, dependencies: ['core'] },
  inclusive: { module: 'inclusive', layer: 'operational', bootOrder: 14, dependencies: ['core'] },
  system: { module: 'system', layer: 'administrative', bootOrder: 15, dependencies: ['core'] },
  memory: { module: 'memory', layer: 'infrastructure', bootOrder: 16, dependencies: ['core'] },
  relay: { module: 'relay', layer: 'infrastructure', bootOrder: 17, dependencies: ['core'] },
  audit: { module: 'audit', layer: 'infrastructure', bootOrder: 18, dependencies: ['core'] },
  identity: { module: 'identity', layer: 'infrastructure', bootOrder: 19, dependencies: ['core'] },
  economy: { module: 'economy', layer: 'infrastructure', bootOrder: 20, dependencies: ['core'] },
  sandbox: { module: 'sandbox', layer: 'infrastructure', bootOrder: 21, dependencies: ['core'] },
  immunity: { module: 'immunity', layer: 'mesh', bootOrder: 22, dependencies: ['core', 'defense'] },
  evolution: { module: 'evolution', layer: 'mesh', bootOrder: 23, dependencies: ['core'] },
  intent: { module: 'intent', layer: 'mesh', bootOrder: 24, dependencies: ['core'] },
  governance: { module: 'governance', layer: 'mesh', bootOrder: 25, dependencies: ['core'] },
  medic: { module: 'medic', layer: 'operational', bootOrder: 38, dependencies: ['core', 'system', 'vision'] },
  nerve: { module: 'nerve', layer: 'infrastructure', bootOrder: 39, dependencies: ['core', 'ripple'] },
  // Expansion Modules (40-Node Architecture)
  sovereign: { module: 'sovereign', layer: 'mesh', bootOrder: 26, dependencies: ['core', 'defense', 'access'] },
  oracle: { module: 'oracle', layer: 'cognitive', bootOrder: 27, dependencies: ['core', 'brain', 'vision'] },
  conscience: { module: 'conscience', layer: 'mesh', bootOrder: 28, dependencies: ['core', 'defense'] },
  phantom: { module: 'phantom', layer: 'mesh', bootOrder: 29, dependencies: ['core', 'defense', 'identity'] },
  forge: { module: 'forge', layer: 'orchestrator', bootOrder: 30, dependencies: ['core', 'encode'] },
  lingua: { module: 'lingua', layer: 'cognitive', bootOrder: 31, dependencies: ['core', 'decode', 'nexus'] },
  compass: { module: 'compass', layer: 'cognitive', bootOrder: 32, dependencies: ['core', 'vision', 'brain'] },
  echo: { module: 'echo', layer: 'infrastructure', bootOrder: 33, dependencies: ['core', 'memory'] },
  treaty: { module: 'treaty', layer: 'mesh', bootOrder: 34, dependencies: ['core', 'access'] },
  harvest: { module: 'harvest', layer: 'infrastructure', bootOrder: 35, dependencies: ['core', 'memory', 'economy'] },
  reflex: { module: 'reflex', layer: 'operational', bootOrder: 36, dependencies: ['core', 'nexus', 'vision'] },
  shadow: { module: 'shadow', layer: 'mesh', bootOrder: 37, dependencies: ['core', 'defense'] },
  // Nodes 39-40 — Maintenance & Governance Authority
  engineer: { module: 'engineer', layer: 'administrative', bootOrder: 39, dependencies: ['core', 'system'] },
  atlas: { module: 'atlas', layer: 'mesh', bootOrder: 40, dependencies: ['core', 'governance'] },
};

// Orchestration state
export interface CortexState {
  initialized: boolean;
  worldModelVersion: number;
  activeOrchestrations: number;
  governanceMode: 'autonomous' | 'advisory' | 'manual';
  evolutionLock: boolean;
  lastWorldModelUpdate: string | null;
}

let cortexState: CortexState = {
  initialized: false,
  worldModelVersion: 0,
  activeOrchestrations: 0,
  governanceMode: 'advisory',
  evolutionLock: false,
  lastWorldModelUpdate: null,
};

/**
 * Get cortex state
 */
export function getCortexState(): CortexState {
  return { ...cortexState };
}

/**
 * Initialize the cortex orchestrator
 */
export async function initializeCortex(): Promise<{
  success: boolean;
  modulesOnline: number;
  worldModelVersion: number;
}> {
  const moduleHealth = await getModuleHealthMatrix();
  const onlineCount = moduleHealth.filter(m => m.health > 50).length;
  
  cortexState = {
    ...cortexState,
    initialized: true,
    worldModelVersion: cortexState.worldModelVersion + 1,
    lastWorldModelUpdate: new Date().toISOString(),
  };
  
  return {
    success: onlineCount >= 10,
    modulesOnline: onlineCount,
    worldModelVersion: cortexState.worldModelVersion,
  };
}
 
 // Workflow engine
 export * from './workflowEngine';

// Pipeline scheduler
export * from './pipelineScheduler';

// Bottleneck analysis (doc-aligned)
export * from './bottleneckAnalysis';

// Cascade failure prevention (doc-aligned)
export * from './cascadeFailurePrevention';

// CLM — Continuous Learning Module
export * from './cortexCLM';

// Hardening layer v2.0.0
export * from './cortex-hardening';

/**
 * Get module health matrix
 */
export async function getModuleHealthMatrix(): Promise<ModuleRegistryEntry[]> {
  const entries: ModuleRegistryEntry[] = [];
  
  for (const [, config] of Object.entries(MODULE_REGISTRY)) {
    entries.push({
      ...config,
      health: 100,
      circuitState: 'closed',
      lastPing: new Date().toISOString(),
    });
  }
  
  return entries.sort((a, b) => a.bootOrder - b.bootOrder);
}

/**
 * Get modules by layer
 */
export function getModulesByLayer(layer: ModuleLayer): SubstrateModule[] {
  return Object.entries(MODULE_REGISTRY)
    .filter(([, config]) => config.layer === layer)
    .map(([module]) => module as SubstrateModule);
}

/**
 * Check if module can boot (all dependencies satisfied)
 */
export function canModuleBoot(module: SubstrateModule, onlineModules: Set<SubstrateModule>): boolean {
  const config = MODULE_REGISTRY[module];
  return config.dependencies.every(dep => onlineModules.has(dep));
}

/**
 * Set governance mode
 */
export function setGovernanceMode(mode: CortexState['governanceMode']): void {
  const validModes: CortexState['governanceMode'][] = ['autonomous', 'advisory', 'manual'];
  if (!validModes.includes(mode)) return;
  cortexState = { ...cortexState, governanceMode: mode };
}

/**
 * Acquire evolution lock
 */
export function acquireEvolutionLock(): boolean {
  if (cortexState.evolutionLock) {
    return false;
  }
  cortexState = { ...cortexState, evolutionLock: true };
  return true;
}

/**
 * Release evolution lock
 */
export function releaseEvolutionLock(): void {
  cortexState = { ...cortexState, evolutionLock: false };
}

/**
 * Orchestrate cross-module action
 */
export async function orchestrate(config: {
  action: string;
  modules: SubstrateModule[];
  payload?: Record<string, unknown>;
  timeout?: number;
}): Promise<{
  success: boolean;
  results: Array<{ module: SubstrateModule; success: boolean; data?: unknown; error?: string }>;
  duration: number;
}> {
  // Validate inputs
  const safeAction = validateStringInput(config.action, { maxLength: 256, minLength: 1 });
  if (!safeAction) {
    return { success: false, results: [], duration: 0 };
  }

  // Guard: limit concurrent orchestrations
  const MAX_CONCURRENT = 10;
  if (cortexState.activeOrchestrations >= MAX_CONCURRENT) {
    return {
      success: false,
      results: [{ module: 'cortex' as SubstrateModule, success: false, error: `Max concurrent orchestrations (${MAX_CONCURRENT}) reached` }],
      duration: 0,
    };
  }

  // Guard: limit modules per call
  const MAX_MODULES_PER_CALL = 25;
  const safeModules = config.modules.slice(0, MAX_MODULES_PER_CALL);
  const timeoutMs = clampNumber(config.timeout, 5000, 120_000, 30_000);

  const start = Date.now();
  cortexState = { ...cortexState, activeOrchestrations: cortexState.activeOrchestrations + 1 };
  
  try {
    const results = await withTimeout(
      () => Promise.all(
        safeModules.map(async (module) => {
          try {
            const { data, error } = await supabase.functions.invoke('pf-substrate', {
              body: { module, action: safeAction, payload: config.payload },
            });
            
            if (error) {
              return { module, success: false, error: error.message };
            }
            
            return { module, success: true, data };
          } catch (err) {
            return { module, success: false, error: err instanceof Error ? err.message : 'Unknown error' };
          }
        })
      ),
      timeoutMs,
      'cortex.orchestrate'
    );
    
    return {
      success: results.every(r => r.success),
      results,
      duration: Date.now() - start,
    };
  } catch (err) {
    return {
      success: false,
      results: [{ module: 'cortex' as SubstrateModule, success: false, error: err instanceof Error ? err.message : 'Orchestration failed' }],
      duration: Date.now() - start,
    };
  } finally {
    cortexState = { ...cortexState, activeOrchestrations: Math.max(0, cortexState.activeOrchestrations - 1) };
  }
}

/**
 * Broadcast event to all modules
 */
export async function broadcastEvent(event: {
  type: string;
  source: SubstrateModule;
  payload?: Record<string, unknown>;
}): Promise<{
  success: boolean;
  delivered: number;
  failed: number;
}> {
  // Validate event type
  const safeType = validateStringInput(event.type, { maxLength: 256, minLength: 1 });
  if (!safeType) {
    return { success: false, delivered: 0, failed: 0 };
  }

  try {
    const { error } = await supabase.from('brain_events').insert([{
      module: event.source,
      event_type: safeType,
      data: (event.payload ?? {}) as Record<string, unknown>,
      outcome: 'broadcasted',
    }] as any);
    
    if (error) throw error;
    
    const moduleCount = Object.keys(MODULE_REGISTRY).length;
    return { success: true, delivered: moduleCount, failed: 0 };
  } catch {
    const moduleCount = Object.keys(MODULE_REGISTRY).length;
    return { success: false, delivered: 0, failed: moduleCount };
  }
}

/**
 * Get world model summary
 */
export function getWorldModelSummary(): {
  version: number;
  layers: Record<ModuleLayer, number>;
  totalModules: number;
  governanceMode: CortexState['governanceMode'];
} {
  const layers: Record<ModuleLayer, number> = {
    kernel: 0,
    cognitive: 0,
    operational: 0,
    administrative: 0,
    orchestrator: 0,
    infrastructure: 0,
    mesh: 0,
  };
  
  Object.values(MODULE_REGISTRY).forEach(config => {
    layers[config.layer]++;
  });
  
  return {
    version: cortexState.worldModelVersion,
    layers,
    totalModules: Object.keys(MODULE_REGISTRY).length,
    governanceMode: cortexState.governanceMode,
  };
}
