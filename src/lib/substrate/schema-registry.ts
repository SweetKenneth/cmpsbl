/**
 * Schema Registry — Version tracking for substrate data schemas
 * Enables safe migrations and backward compatibility checks
 */

interface SchemaVersion {
  entity: string;
  version: number;
  fields: string[];
  fieldSet: Set<string>; // O(1) lookups for compatibility checks
  migrations: Array<{ from: number; to: number; transform: string }>;
  registeredAt: number;
}

const registry = new Map<string, SchemaVersion>();

export function registerSchema(entity: string, version: number, fields: string[]): void {
  const existing = registry.get(entity);
  if (existing && existing.version >= version) return;
  registry.set(entity, {
    entity,
    version,
    fields,
    fieldSet: new Set(fields),
    migrations: existing?.migrations || [],
    registeredAt: Date.now(),
  });
}

export function getSchemaVersion(entity: string): number {
  return registry.get(entity)?.version ?? 0;
}

export function getSchemaFields(entity: string): string[] {
  return registry.get(entity)?.fields ?? [];
}

export function isCompatible(entity: string, data: Record<string, unknown>): { compatible: boolean; missing: string[]; extra: string[] } {
  const schema = registry.get(entity);
  if (!schema) return { compatible: true, missing: [], extra: [] };

  const dataKeys = Object.keys(data);
  // Use Set for O(1) lookups instead of Array.includes
  const dataKeySet = new Set(dataKeys);
  const missing: string[] = [];
  for (const f of schema.fields) {
    if (!dataKeySet.has(f)) missing.push(f);
  }
  const extra: string[] = [];
  for (const k of dataKeys) {
    if (!schema.fieldSet.has(k)) extra.push(k);
  }

  return { compatible: missing.length === 0, missing, extra };
}

export function addMigration(entity: string, from: number, to: number, transform: string): void {
  const schema = registry.get(entity);
  if (schema) {
    schema.migrations.push({ from, to, transform });
  }
}

export function getAllSchemas(): SchemaVersion[] {
  return Array.from(registry.values());
}

// Pre-register core schemas
registerSchema('substrate_event', 1, ['id', 'module', 'action', 'timestamp', 'payload', 'outcome']);
registerSchema('health_log', 1, ['id', 'module', 'status', 'score', 'timestamp']);
registerSchema('evolution_receipt', 1, ['id', 'proposal_id', 'delta', 'applied_at', 'hash']);
