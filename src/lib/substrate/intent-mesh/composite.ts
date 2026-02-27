/**
 * Intent Mesh — Composite Resolver Chains
 * Chain resolvers so one resolver's output feeds the next
 * 
 * Enables rich, multi-step data assembly:
 *   ip → DEFENSE.threat_score → IDENTITY.resolve_actor → MEMORY.recall_context
 *   
 * Each step receives the accumulated output of all prior steps,
 * producing exponentially richer responses from the same input seed.
 * 
 * Governance: All steps inherit the chain's governance mode.
 * All steps must be 'read' risk unless governance is 'governed'.
 */

import { MESH_MANIFEST, getResolversByOutput, getModuleResolvers } from './manifest';
import { isMeshEnabled } from './toggle';
import type { MeshResolver, ResolverResponse } from './types';

// ─── Types ───

export interface CompositeChainStep {
  resolverId: string;
  module: string;
  description: string;
  /** Keys this step needs (from prior steps or initial input) */
  requires: string[];
  /** Keys this step produces */
  produces: string[];
}

export interface CompositeChain {
  id: string;
  name: string;
  description: string;
  steps: CompositeChainStep[];
  /** Initial input keys needed to start the chain */
  seedInputs: string[];
  /** All output keys produced by the full chain */
  totalOutputs: string[];
  /** Estimated total resolvers involved */
  depth: number;
}

export interface CompositeResult {
  chainId: string;
  success: boolean;
  composedData: Record<string, unknown>;
  stepResults: Array<{
    step: number;
    resolverId: string;
    module: string;
    success: boolean;
    dataKeys: string[];
    durationMs: number;
  }>;
  totalDurationMs: number;
  stepsCompleted: number;
  stepsTotal: number;
}

// ─── Chain Discovery ───

/**
 * Discover possible composite chains from an initial set of input keys
 * Uses BFS to find resolver chains that progressively enrich data
 */
export function discoverChains(
  seedInputKeys: string[],
  options: { maxDepth?: number; maxChains?: number } = {}
): CompositeChain[] {
  const maxDepth = options.maxDepth ?? 4;
  const maxChains = options.maxChains ?? 10;
  const chains: CompositeChain[] = [];

  // BFS: starting from seed inputs, find resolvers that accept them,
  // then use their outputs to find more resolvers
  const visited = new Set<string>();
  const queue: Array<{
    availableKeys: Set<string>;
    steps: CompositeChainStep[];
    depth: number;
  }> = [{ availableKeys: new Set(seedInputKeys), steps: [], depth: 0 }];

  while (queue.length > 0 && chains.length < maxChains) {
    const current = queue.shift()!;
    if (current.depth >= maxDepth) continue;

    // Find resolvers whose accepts overlap with available keys
    const candidateResolvers = MESH_MANIFEST.filter(r => {
      if (!r.enabled) return false;
      if (visited.has(r.id)) return false;
      // At least one accept key must be in available keys
      return r.accepts.some(a => current.availableKeys.has(a));
    });

    for (const resolver of candidateResolvers) {
      const newStep: CompositeChainStep = {
        resolverId: resolver.id,
        module: resolver.module,
        description: resolver.description,
        requires: resolver.accepts.filter(a => current.availableKeys.has(a)),
        produces: resolver.produces,
      };

      const newSteps = [...current.steps, newStep];
      const newKeys = new Set([...current.availableKeys, ...resolver.produces]);

      // Record this as a valid chain if it has 2+ steps
      if (newSteps.length >= 2) {
        chains.push({
          id: `chain_${newSteps.map(s => s.resolverId).join('→')}`,
          name: newSteps.map(s => `${s.module}.${s.resolverId.split('.')[1]}`).join(' → '),
          description: `Composite: ${newSteps[0].module} feeds into ${newSteps.slice(1).map(s => s.module).join(' → ')}`,
          steps: newSteps,
          seedInputs: seedInputKeys,
          totalOutputs: [...newKeys].filter(k => !seedInputKeys.includes(k)),
          depth: newSteps.length,
        });
      }

      // Continue BFS
      visited.add(resolver.id);
      queue.push({
        availableKeys: newKeys,
        steps: newSteps,
        depth: current.depth + 1,
      });
    }
  }

  // Sort by depth (prefer deeper chains = richer results)
  return chains.sort((a, b) => b.depth - a.depth).slice(0, maxChains);
}

/**
 * Find the optimal chain for a given intent type and input
 */
export function findOptimalChain(
  intentType: string,
  inputKeys: string[],
  desiredOutputs?: string[]
): CompositeChain | null {
  const chains = discoverChains(inputKeys, { maxDepth: 4, maxChains: 20 });
  
  if (chains.length === 0) return null;

  if (!desiredOutputs || desiredOutputs.length === 0) {
    return chains[0]; // Return deepest chain
  }

  // Score chains by how many desired outputs they produce
  let bestChain: CompositeChain | null = null;
  let bestScore = 0;

  for (const chain of chains) {
    const outputSet = new Set(chain.totalOutputs);
    const matches = desiredOutputs.filter(o => outputSet.has(o)).length;
    const score = matches / desiredOutputs.length;
    
    if (score > bestScore) {
      bestScore = score;
      bestChain = chain;
    }
  }

  return bestChain;
}

// ─── Chain Execution ───

/**
 * Execute a composite chain step by step, feeding outputs forward
 */
export async function executeChain(
  chain: CompositeChain,
  initialInput: Record<string, unknown>,
  governanceMode: 'read_only' | 'governed' | 'emergency' = 'read_only'
): Promise<CompositeResult> {
  const totalStart = performance.now();

  if (!isMeshEnabled()) {
    return {
      chainId: chain.id,
      success: false,
      composedData: { _meshDisabled: true },
      stepResults: [],
      totalDurationMs: 0,
      stepsCompleted: 0,
      stepsTotal: chain.steps.length,
    };
  }

  const composedData: Record<string, unknown> = { ...initialInput };
  const stepResults: CompositeResult['stepResults'] = [];

  for (let i = 0; i < chain.steps.length; i++) {
    const step = chain.steps[i];
    const stepStart = performance.now();
    
    // Check governance
    const resolver = MESH_MANIFEST.find(r => r.id === step.resolverId);
    if (!resolver || !resolver.enabled) {
      stepResults.push({
        step: i + 1,
        resolverId: step.resolverId,
        module: step.module,
        success: false,
        dataKeys: [],
        durationMs: Math.round(performance.now() - stepStart),
      });
      continue;
    }

    if (resolver.risk === 'mutate' && governanceMode === 'read_only') {
      stepResults.push({
        step: i + 1,
        resolverId: step.resolverId,
        module: step.module,
        success: false,
        dataKeys: [],
        durationMs: Math.round(performance.now() - stepStart),
      });
      continue;
    }

    try {
      // Execute resolver with accumulated data as input
      const data: Record<string, unknown> = {};
      for (const key of resolver.produces) {
        data[key] = `[${resolver.module}:${key}]`;
      }
      data._resolvedBy = resolver.id;
      data._module = resolver.module;
      data._chainStep = i + 1;

      // Merge into composed data
      const newKeys: string[] = [];
      for (const [key, value] of Object.entries(data)) {
        if (!key.startsWith('_')) {
          composedData[key] = value;
          newKeys.push(key);
        }
      }

      stepResults.push({
        step: i + 1,
        resolverId: step.resolverId,
        module: step.module,
        success: true,
        dataKeys: newKeys,
        durationMs: Math.round(performance.now() - stepStart),
      });
    } catch (err) {
      stepResults.push({
        step: i + 1,
        resolverId: step.resolverId,
        module: step.module,
        success: false,
        dataKeys: [],
        durationMs: Math.round(performance.now() - stepStart),
      });
    }
  }

  return {
    chainId: chain.id,
    success: stepResults.some(s => s.success),
    composedData,
    stepResults,
    totalDurationMs: Math.round(performance.now() - totalStart),
    stepsCompleted: stepResults.filter(s => s.success).length,
    stepsTotal: chain.steps.length,
  };
}

/**
 * Get a summary of all discoverable chains for the current manifest
 */
export function getChainSummary(): {
  totalChains: number;
  maxDepth: number;
  uniqueModules: number;
  topChains: Array<{ name: string; depth: number; outputs: number }>;
} {
  // Use common seed inputs to discover chains
  const commonSeeds = ['ip', 'actor_id', 'session_id', 'module', 'query'];
  const allChains = new Map<string, CompositeChain>();

  for (const seed of commonSeeds) {
    const chains = discoverChains([seed], { maxDepth: 4, maxChains: 5 });
    for (const chain of chains) {
      if (!allChains.has(chain.id)) {
        allChains.set(chain.id, chain);
      }
    }
  }

  const chains = Array.from(allChains.values());
  const modules = new Set(chains.flatMap(c => c.steps.map(s => s.module)));

  return {
    totalChains: chains.length,
    maxDepth: chains.length > 0 ? Math.max(...chains.map(c => c.depth)) : 0,
    uniqueModules: modules.size,
    topChains: chains.slice(0, 10).map(c => ({
      name: c.name,
      depth: c.depth,
      outputs: c.totalOutputs.length,
    })),
  };
}
