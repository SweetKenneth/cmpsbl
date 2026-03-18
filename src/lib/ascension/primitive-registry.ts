/**
 * CMPSBL® Primitive Registry
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * In-memory registry for executable primitive handlers.
 * Maps extracted primitive names to callable handlers with fallback resolution.
 *
 * © CMPSBL® — All rights reserved.
 */

export type PrimitiveHandler = (input: unknown, context?: unknown) => Promise<unknown> | unknown;

export interface PrimitiveDefinition {
  id: string;
  name: string;
  category?: string;
  handler?: PrimitiveHandler;
  fallback?: PrimitiveHandler;
  source?: 'native' | 'generated' | 'external';
  successRate?: number;
}

const registry = new Map<string, PrimitiveDefinition>();

/**
 * Register a primitive handler definition.
 * Overwrites any existing entry with the same normalized name.
 */
export function registerPrimitive(def: PrimitiveDefinition): void {
  if (!def.name || typeof def.name !== 'string') return;
  registry.set(def.name.toLowerCase().trim(), { ...def });
}

/**
 * Retrieve a primitive definition by name (case-insensitive).
 */
export function getPrimitive(name: string): PrimitiveDefinition | null {
  return registry.get(name.toLowerCase().trim()) ?? null;
}

/**
 * List all registered primitive definitions.
 */
export function listPrimitives(): PrimitiveDefinition[] {
  return Array.from(registry.values());
}

/**
 * Remove a primitive by name. Returns true if it existed.
 */
export function removePrimitive(name: string): boolean {
  return registry.delete(name.toLowerCase().trim());
}

/**
 * Clear all registered primitives. Useful for testing.
 */
export function clearPrimitives(): void {
  registry.clear();
}

/**
 * Get registry size.
 */
export function getPrimitiveCount(): number {
  return registry.size;
}
