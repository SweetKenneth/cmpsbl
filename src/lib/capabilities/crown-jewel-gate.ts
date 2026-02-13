/**
 * Crown Jewel Gate — Strategic Asset Protection
 * v9.2.0 ARCHITECT Epoch — Discovery & Lockdown
 * 
 * Single entry point for all Crown Jewel checks.
 * Delegates to the canonical crown-jewel-registry for all lookups.
 */

import { isCrownJewel, isCrownJewelExtended, CROWN_JEWEL_IDS } from './crown-jewel-registry';

/** Check if a capability ID maps to a Crown Jewel */
export function isCrownJewelCapability(capId: string): boolean {
  return isCrownJewelExtended(capId);
}

/** Check if a template is Crown Jewel */
export function isCrownJewelTemplate(templateId: string, name: string): boolean {
  return isCrownJewelExtended(templateId, name);
}

/** Check if a pipeline is Crown Jewel */
export function isCrownJewelPipeline(pipelineId: string, name: string): boolean {
  return isCrownJewelExtended(pipelineId, name);
}

/** Check if an engine is Crown Jewel */
export function isCrownJewelEngine(engineId: string): boolean {
  return isCrownJewel(engineId);
}

/** Check if a meta-engine is Crown Jewel */
export function isCrownJewelMetaEngine(metaEngineId: string): boolean {
  return isCrownJewel(metaEngineId);
}

/** Check any item type — unified gate */
export function isCrownJewelItem(id: string, name: string = ''): boolean {
  return isCrownJewelExtended(id, name);
}

// Re-export for backward compatibility
export { CROWN_JEWEL_IDS, isCrownJewel, isCrownJewelExtended };
