/**
 * Primitive Type Labels
 * Maps each substrate primitive to its category suffix for user-facing display.
 * e.g. "DREAM" → "DREAM Engine", "ENCODE" → "ENCODE Agent"
 */

const ORGANS = new Set([
  'CORE', 'SYSTEM', 'NERVE', 'RIPPLE', 'RELAY', 'IDENTITY',
  'ACCESS', 'NEXUS', 'AUDIT', 'INTEGRATION', 'BRAIN', 'MEMORY',
]);

const LAYERS = new Set([
  'DEFENSE', 'IMMUNITY', 'GOVERNANCE', 'INTENT', 'EVOLUTION',
  'INCLUSIVE', 'CONSCIENCE', 'TREATY',
]);

const ENGINES = new Set([
  'DREAM', 'CORTEX', 'ORACLE', 'FORGE', 'COMPASS', 'ATLAS',
  'ECONOMY', 'SANDBOX', 'MEDIC', 'REFLEX',
]);

const AGENTS = new Set([
  'ENCODE', 'DECODE', 'VISION', 'PHANTOM', 'LINGUA', 'ECHO',
  'HARVEST', 'SOVEREIGN', 'ENGINEER', 'OBSERVER',
]);

export type PrimitiveCategory = 'Organ' | 'Layer' | 'Engine' | 'Agent';

/** Get the category type for a primitive name */
export function getPrimitiveCategory(name: string): PrimitiveCategory {
  const upper = name.toUpperCase();
  if (ORGANS.has(upper)) return 'Organ';
  if (LAYERS.has(upper)) return 'Layer';
  if (ENGINES.has(upper)) return 'Engine';
  if (AGENTS.has(upper)) return 'Agent';
  return 'Engine'; // fallback for unknown
}

/** Format a primitive name with its category suffix, e.g. "DREAM Engine" */
export function labelPrimitive(name: string): string {
  return `${name.toUpperCase()} ${getPrimitiveCategory(name)}`;
}

/** Format a chain of primitives with labels, e.g. "BRAIN Organ → DREAM Engine → ECHO Agent" */
export function labelChain(chain: string[]): string {
  return chain.map(labelPrimitive).join(' → ');
}
