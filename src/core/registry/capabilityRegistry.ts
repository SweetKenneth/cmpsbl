/**
 * CORE — Capability Registry
 * Central catalog of all node capabilities with capability hashing.
 * Enables dynamic routing and integrity verification.
 * Ultimate Form v1.0.0
 */

export interface Capability {
  id: string;                // e.g., 'defense.threat_score'
  moduleId: string;          // e.g., 'defense'
  name: string;              // Human-readable
  category: string;          // e.g., 'security', 'analytics', 'orchestration'
  version: string;           // Semver
  enabled: boolean;
  hash: string;              // Integrity hash of capability definition
  registeredAt: string;
  metadata?: Record<string, unknown>;
}

export interface CapabilityLookupResult {
  capability: Capability;
  available: boolean;
  reason?: string;
}

const capabilities = new Map<string, Capability>();
const moduleIndex = new Map<string, Set<string>>();
const categoryIndex = new Map<string, Set<string>>();

/**
 * Generate a deterministic hash for capability integrity.
 */
function hashCapability(cap: Omit<Capability, 'hash' | 'registeredAt'>): string {
  const payload = `${cap.id}:${cap.moduleId}:${cap.version}:${cap.category}`;
  let hash = 0;
  for (let i = 0; i < payload.length; i++) {
    const char = payload.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return `cap_${Math.abs(hash).toString(16).padStart(8, '0')}`;
}

/**
 * Register a capability.
 */
export function registerCapability(
  cap: Omit<Capability, 'hash' | 'registeredAt'>
): Capability {
  const full: Capability = {
    ...cap,
    hash: hashCapability(cap),
    registeredAt: new Date().toISOString(),
  };

  capabilities.set(cap.id, full);

  // Update module index
  if (!moduleIndex.has(cap.moduleId)) moduleIndex.set(cap.moduleId, new Set());
  moduleIndex.get(cap.moduleId)!.add(cap.id);

  // Update category index
  if (!categoryIndex.has(cap.category)) categoryIndex.set(cap.category, new Set());
  categoryIndex.get(cap.category)!.add(cap.id);

  return full;
}

/**
 * Lookup a capability by ID.
 */
export function lookupCapability(capId: string): CapabilityLookupResult | null {
  const cap = capabilities.get(capId);
  if (!cap) return null;

  return {
    capability: cap,
    available: cap.enabled,
    reason: cap.enabled ? undefined : 'Capability is disabled',
  };
}

/**
 * Get all capabilities for a module.
 */
export function getModuleCapabilities(moduleId: string): Capability[] {
  const ids = moduleIndex.get(moduleId);
  if (!ids) return [];
  return Array.from(ids).map(id => capabilities.get(id)!).filter(Boolean);
}

/**
 * Get all capabilities in a category.
 */
export function getCategoryCapabilities(category: string): Capability[] {
  const ids = categoryIndex.get(category);
  if (!ids) return [];
  return Array.from(ids).map(id => capabilities.get(id)!).filter(Boolean);
}

/**
 * Find capabilities matching a functional query.
 */
export function findCapabilities(query: {
  moduleId?: string;
  category?: string;
  enabledOnly?: boolean;
}): Capability[] {
  let results = Array.from(capabilities.values());

  if (query.moduleId) results = results.filter(c => c.moduleId === query.moduleId);
  if (query.category) results = results.filter(c => c.category === query.category);
  if (query.enabledOnly) results = results.filter(c => c.enabled);

  return results;
}

/**
 * Verify integrity of a capability by re-hashing.
 */
export function verifyCapabilityIntegrity(capId: string): { valid: boolean; expected: string; actual: string } | null {
  const cap = capabilities.get(capId);
  if (!cap) return null;

  const expected = hashCapability(cap);
  return { valid: cap.hash === expected, expected, actual: cap.hash };
}

/**
 * Generate a composite hash of all capabilities for system integrity.
 */
export function getSystemCapabilityHash(): string {
  const sorted = Array.from(capabilities.values())
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(c => c.hash)
    .join(':');

  let hash = 0;
  for (let i = 0; i < sorted.length; i++) {
    hash = ((hash << 5) - hash) + sorted.charCodeAt(i);
    hash |= 0;
  }
  return `sys_${Math.abs(hash).toString(16).padStart(8, '0')}`;
}

export function getAllCapabilities(): Capability[] {
  return Array.from(capabilities.values());
}

export function getCapabilityCount(): number {
  return capabilities.size;
}

export function getCategories(): string[] {
  return Array.from(categoryIndex.keys());
}
