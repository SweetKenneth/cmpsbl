/**
 * CMPSBL® Primitive Governor Controls
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Admin-only controls for injecting, disabling, and managing
 * primitives in the runtime registry.
 *
 * © CMPSBL® — All rights reserved.
 */

import {
  registerPrimitive,
  getPrimitive,
  removePrimitive,
  listPrimitives,
  type PrimitiveDefinition,
  type PrimitiveHandler,
} from './primitive-registry';

export interface GovernorInjection {
  id: string;
  name: string;
  category?: string;
  handler: PrimitiveHandler;
  fallback?: PrimitiveHandler;
}

/**
 * Governor injects an external primitive into the runtime.
 * Marks source as 'external' for traceability.
 */
export function governorInjectPrimitive(def: GovernorInjection): boolean {
  if (!def.name || !def.handler) return false;

  registerPrimitive({
    id: def.id,
    name: def.name,
    category: def.category,
    handler: def.handler,
    fallback: def.fallback,
    source: 'external',
  });

  return true;
}

/**
 * Governor disables a primitive by removing its handler (soft disable).
 * The definition remains in registry but becomes non-executable.
 */
export function governorDisablePrimitive(name: string): boolean {
  const existing = getPrimitive(name);
  if (!existing) return false;

  registerPrimitive({
    ...existing,
    handler: undefined,
    fallback: undefined,
  });

  return true;
}

/**
 * Governor permanently removes a primitive from the registry.
 */
export function governorRemovePrimitive(name: string): boolean {
  return removePrimitive(name);
}

/**
 * Get summary of all registered primitives for governor dashboard.
 */
export function governorGetPrimitiveSummary(): Array<{
  name: string;
  id: string;
  source: string;
  category: string;
  hasHandler: boolean;
  hasFallback: boolean;
  successRate: number;
}> {
  return listPrimitives().map((p: PrimitiveDefinition) => ({
    name: p.name,
    id: p.id,
    source: p.source ?? 'unknown',
    category: p.category ?? 'uncategorized',
    hasHandler: !!p.handler,
    hasFallback: !!p.fallback,
    successRate: p.successRate ?? 0.5,
  }));
}
