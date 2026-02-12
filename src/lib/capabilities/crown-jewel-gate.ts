/**
 * Crown Jewel Gate — Enterprise-only content gating
 * Checks if a capability, template, or pipeline is a Crown Jewel
 * and should hide code/details behind an Enterprise upgrade prompt.
 */

import { CROWN_JEWEL_IDS } from '@/config/lnchbl-tier-map';

/** Crown Jewel capability IDs that are Enterprise-gated */
const CROWN_JEWEL_KEYWORDS = [
  'seba', 'modernizer', 'cortex', 'evolution', 'dream-pool-federation',
  'self-repair', 'autonomous-workflow', 'dream-lucidity',
  'self-evolving', 'recursive', 'self-improvement',
  'autonomous-evolution', 'self-healing',
];

/** Check if a capability ID maps to a Crown Jewel */
export function isCrownJewelCapability(capId: string): boolean {
  // Direct match against tier map IDs
  const normalized = capId.replace(/^cap-/, '').replace(/-/g, '_');
  if (CROWN_JEWEL_IDS.includes(normalized)) return true;
  
  // Keyword match for registry IDs that reference Crown Jewel concepts
  const lower = capId.toLowerCase();
  return CROWN_JEWEL_KEYWORDS.some(kw => lower.includes(kw));
}

/** Check if a template is Crown Jewel (self-improvement related) */
export function isCrownJewelTemplate(templateId: string, name: string): boolean {
  const combined = `${templateId} ${name}`.toLowerCase();
  return CROWN_JEWEL_KEYWORDS.some(kw => combined.includes(kw));
}

/** Check if a pipeline is Crown Jewel */
export function isCrownJewelPipeline(pipelineId: string, name: string): boolean {
  const combined = `${pipelineId} ${name}`.toLowerCase();
  return CROWN_JEWEL_KEYWORDS.some(kw => combined.includes(kw));
}

/** Check any item type */
export function isCrownJewelItem(id: string, name: string = ''): boolean {
  return isCrownJewelCapability(id) || isCrownJewelTemplate(id, name) || isCrownJewelPipeline(id, name);
}
