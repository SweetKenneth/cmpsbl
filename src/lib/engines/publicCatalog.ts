/**
 * Public Engine Catalog
 * Exposes engine registry data with visibility filtering
 * 
 * Source of truth: ENGINE_REGISTRY + META_ENGINE_REGISTRY
 */

import { ENGINE_REGISTRY, listEngines } from '@/lib/substrate/engines/registry';
import { META_ENGINE_REGISTRY, listMetaEngines } from '@/lib/substrate/engines/meta/registry';
import { 
  getEngineMonetization, 
  getMetaEngineMonetization,
  type EngineVisibility,
  type SubscriptionPlan,
} from '@/lib/commerce/enginePricing';
import type { EngineDefinition } from '@/lib/substrate/engines/types';
import type { MetaEngineDefinition } from '@/lib/substrate/engines/meta/types';

// ============================================================================
// PUBLIC ENGINE TYPES
// ============================================================================

export interface PublicEngine {
  id: string;
  name: string;
  description: string;
  category: string;
  layer: string;
  synergyMultiplier: number;
  complexityScore: number;
  capabilityCount: number;
  visibility: EngineVisibility;
  requiredPlan: SubscriptionPlan;
  isInternal: boolean;
  primaryModules: string[];
  averageLatencyMs: number;
}

export interface PublicMetaEngine {
  id: string;
  name: string;
  description: string;
  category: string;
  compoundSynergyMultiplier: number;
  complexityScore: number;
  enginesOrchestrated: number;
  totalCapabilities: number;
  visibility: EngineVisibility;
  requiredPlan: SubscriptionPlan;
  isInternal: boolean;
  orchestrationMode: string;
  useCases: string[];
  engineIds: string[];
}

// ============================================================================
// CATALOG FUNCTIONS
// ============================================================================

/**
 * Get all public engines (excludes internal showcase)
 */
export function getPublicEngines(): PublicEngine[] {
  return listEngines()
    .map(engine => engineToPublic(engine))
    .filter(e => !e.isInternal)
    .sort((a, b) => {
      // Sort by visibility tier, then by name
      const tierOrder: Record<EngineVisibility, number> = {
        free: 0, standard: 1, advanced: 2, meta: 3, enterprise: 4, internal: 5
      };
      const tierDiff = tierOrder[a.visibility] - tierOrder[b.visibility];
      return tierDiff !== 0 ? tierDiff : a.name.localeCompare(b.name);
    });
}

/**
 * Get all public meta-engines (excludes internal showcase)
 */
export function getPublicMetaEngines(): PublicMetaEngine[] {
  return listMetaEngines()
    .map(meta => metaEngineToPublic(meta))
    .filter(m => !m.isInternal)
    .sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Get internal engines for showcase (platform self-improvement)
 */
export function getInternalEnginesShowcase(): PublicEngine[] {
  return listEngines()
    .map(engine => engineToPublic(engine))
    .filter(e => e.isInternal);
}

/**
 * Get internal meta-engines for showcase
 */
export function getInternalMetaEnginesShowcase(): PublicMetaEngine[] {
  return listMetaEngines()
    .map(meta => metaEngineToPublic(meta))
    .filter(m => m.isInternal);
}

/**
 * Get engines by category
 */
export function getEnginesByCategory(category: string): PublicEngine[] {
  return getPublicEngines().filter(e => e.category === category);
}

/**
 * Get all unique engine categories
 */
export function getEngineCategories(): string[] {
  const categories = new Set<string>();
  listEngines().forEach(e => categories.add(e.category));
  return Array.from(categories).sort();
}

/**
 * Get catalog summary stats
 */
export function getCatalogSummary() {
  const allEngines = listEngines();
  const allMetaEngines = listMetaEngines();
  const publicEngines = getPublicEngines();
  const publicMetaEngines = getPublicMetaEngines();
  
  return {
    totalEngines: allEngines.length,
    publicEngines: publicEngines.length,
    internalEngines: allEngines.length - publicEngines.length,
    totalMetaEngines: allMetaEngines.length,
    publicMetaEngines: publicMetaEngines.length,
    internalMetaEngines: allMetaEngines.length - publicMetaEngines.length,
    categories: getEngineCategories().length,
    totalCapabilities: 379,
    freeEngines: publicEngines.filter(e => e.visibility === 'free').length,
    freeMetaEngines: publicMetaEngines.filter(m => m.visibility === 'free').length,
    standardEngines: publicEngines.filter(e => e.visibility === 'standard').length,
    advancedEngines: publicEngines.filter(e => e.visibility === 'advanced').length,
  };
}

// ============================================================================
// CONVERTERS
// ============================================================================

function engineToPublic(engine: EngineDefinition): PublicEngine {
  const monetization = getEngineMonetization(engine.id);
  
  return {
    id: engine.id,
    name: engine.name,
    description: engine.description,
    category: engine.category,
    layer: engine.layer,
    synergyMultiplier: engine.synergyMultiplier,
    complexityScore: engine.complexityScore,
    capabilityCount: engine.capabilities.length,
    visibility: monetization.visibility,
    requiredPlan: monetization.requiredPlan,
    isInternal: monetization.isInternal,
    primaryModules: engine.primaryModules,
    averageLatencyMs: engine.averageLatencyMs,
  };
}

function metaEngineToPublic(meta: MetaEngineDefinition): PublicMetaEngine {
  const monetization = getMetaEngineMonetization(meta.id);
  
  return {
    id: meta.id,
    name: meta.name,
    description: meta.description,
    category: meta.category,
    compoundSynergyMultiplier: meta.compoundSynergyMultiplier,
    complexityScore: meta.complexityScore,
    enginesOrchestrated: meta.engines.length,
    totalCapabilities: meta.totalCapabilities,
    visibility: monetization.visibility,
    requiredPlan: monetization.requiredPlan,
    isInternal: monetization.isInternal,
    orchestrationMode: meta.orchestrationMode,
    useCases: meta.useCases,
    engineIds: meta.engines,
  };
}
