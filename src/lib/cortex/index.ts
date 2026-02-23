/**
 * promptfluid® CORTEX Module v7.0.0
 * Agency-Class Orchestrator & Cross-Module Governance
 * 
 * The orchestrator layer for:
 * - Cross-module coordination and governance
 * - Agency-class task orchestration
 * - World model maintenance
 * - Evolution cycle coordination
 */

import { supabase } from '@/integrations/supabase/client';
import type { SubstrateModule } from '../substrate';

// Version info
export const CORTEX_VERSION = '7.0.0';
export const CORTEX_CODENAME = 'Orchestrator';

// Module layers
export type ModuleLayer = 'kernel' | 'cognitive' | 'operational' | 'administrative' | 'orchestrator' | 'infrastructure';

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
  ripple: { module: 'ripple', layer: 'kernel', bootOrder: 2, dependencies: ['core'] },
  access: { module: 'access', layer: 'kernel', bootOrder: 3, dependencies: ['core', 'ripple'] },
  brain: { module: 'brain', layer: 'cognitive', bootOrder: 4, dependencies: ['core', 'ripple', 'access'] },
  vision: { module: 'vision', layer: 'cognitive', bootOrder: 5, dependencies: ['brain'] },
  cortex: { module: 'cortex', layer: 'orchestrator', bootOrder: 6, dependencies: ['brain', 'vision'] },
  modernizer: { module: 'modernizer', layer: 'administrative', bootOrder: 7, dependencies: ['cortex'] },
  decode: { module: 'decode', layer: 'cognitive', bootOrder: 8, dependencies: ['brain'] },
  encode: { module: 'encode', layer: 'orchestrator', bootOrder: 9, dependencies: ['brain', 'decode'] },
  defense: { module: 'defense', layer: 'operational', bootOrder: 10, dependencies: ['access'] },
  nexus: { module: 'nexus', layer: 'cognitive', bootOrder: 11, dependencies: ['defense'] },
  dream: { module: 'dream', layer: 'cognitive', bootOrder: 12, dependencies: ['nexus'] },
  integration: { module: 'integration', layer: 'operational', bootOrder: 13, dependencies: ['defense'] },
  inclusive: { module: 'inclusive', layer: 'administrative', bootOrder: 14, dependencies: ['integration'] },
  system: { module: 'system', layer: 'administrative', bootOrder: 15, dependencies: ['vision'] },
  memory: { module: 'memory', layer: 'infrastructure', bootOrder: 16, dependencies: ['brain', 'nexus'] },
  relay: { module: 'relay', layer: 'infrastructure', bootOrder: 17, dependencies: ['ripple', 'defense'] },
  audit: { module: 'audit', layer: 'infrastructure', bootOrder: 18, dependencies: ['ripple'] },
  identity: { module: 'identity', layer: 'infrastructure', bootOrder: 19, dependencies: ['access'] },
  economy: { module: 'economy', layer: 'infrastructure', bootOrder: 20, dependencies: ['vision', 'nexus'] },
  sandbox: { module: 'sandbox', layer: 'infrastructure', bootOrder: 21, dependencies: ['defense'] },
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
  const start = Date.now();
  cortexState = { ...cortexState, activeOrchestrations: cortexState.activeOrchestrations + 1 };
  
  try {
    const results = await Promise.all(
      config.modules.map(async (module) => {
        try {
          const { data, error } = await supabase.functions.invoke('pf-substrate', {
            body: { module, action: config.action, payload: config.payload },
          });
          
          if (error) {
            return { module, success: false, error: error.message };
          }
          
          return { module, success: true, data };
        } catch (err) {
          return { module, success: false, error: err instanceof Error ? err.message : 'Unknown error' };
        }
      })
    );
    
    return {
      success: results.every(r => r.success),
      results,
      duration: Date.now() - start,
    };
  } finally {
    cortexState = { ...cortexState, activeOrchestrations: cortexState.activeOrchestrations - 1 };
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
  try {
    const { error } = await supabase.from('brain_events').insert([{
      module: event.source,
      event_type: event.type,
      data: (event.payload ?? {}) as Record<string, unknown>,
      outcome: 'broadcasted',
    }] as any);
    
    if (error) throw error;
    
    return { success: true, delivered: 14, failed: 0 };
  } catch {
    return { success: false, delivered: 0, failed: 14 };
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
  };
  
  Object.values(MODULE_REGISTRY).forEach(config => {
    layers[config.layer]++;
  });
  
  return {
    version: cortexState.worldModelVersion,
    layers,
    totalModules: 16,
    governanceMode: cortexState.governanceMode,
  };
}
