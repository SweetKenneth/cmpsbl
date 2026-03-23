/**
 * RIPPLE Event Schema Registry — v9.0.0 "Tsunami"
 * 
 * Type-safe event contracts — publishers declare payload schemas.
 * Runtime validation catching malformed events before fan-out.
 * Schema versioning with backward-compatibility checks.
 */

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export type SchemaFieldType = 'string' | 'number' | 'boolean' | 'object' | 'array' | 'any';

export interface SchemaField {
  name: string;
  type: SchemaFieldType;
  required: boolean;
  description?: string;
  validator?: (value: unknown) => boolean;
}

export interface EventSchema {
  id: string;
  eventType: string;
  version: number;
  fields: SchemaField[];
  description: string;
  registeredBy: string;
  registeredAt: string;
  deprecated: boolean;
  deprecatedBy?: number;     // Version that replaces this
  validationEnabled: boolean;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  schemaVersion: number;
  validatedAt: string;
}

export interface ValidationError {
  field: string;
  expected: string;
  received: string;
  message: string;
}

export interface SchemaRegistryStats {
  totalSchemas: number;
  activeSchemas: number;
  deprecatedSchemas: number;
  validationsPerformed: number;
  validationFailures: number;
  failureRate: number;
}

// ═══════════════════════════════════════════════════════════════════════════════
// STATE
// ═══════════════════════════════════════════════════════════════════════════════

const schemas = new Map<string, EventSchema[]>(); // eventType → versions
let validationsPerformed = 0;
let validationFailures = 0;

// ═══════════════════════════════════════════════════════════════════════════════
// CORE ENGINE
// ═══════════════════════════════════════════════════════════════════════════════

/** Register a new event schema (or new version of existing). */
export function registerSchema(
  eventType: string,
  fields: SchemaField[],
  description: string,
  registeredBy: string,
  validationEnabled: boolean = true
): EventSchema {
  const versions = schemas.get(eventType) ?? [];
  const nextVersion = versions.length > 0
    ? Math.max(...versions.map(s => s.version)) + 1
    : 1;

  const schema: EventSchema = {
    id: `${eventType}@v${nextVersion}`,
    eventType,
    version: nextVersion,
    fields,
    description,
    registeredBy,
    registeredAt: new Date().toISOString(),
    deprecated: false,
    validationEnabled,
  };

  // Deprecate previous version
  if (versions.length > 0) {
    const prev = versions[versions.length - 1];
    prev.deprecated = true;
    prev.deprecatedBy = nextVersion;
  }

  versions.push(schema);
  schemas.set(eventType, versions);

  return schema;
}

/** Get the latest schema for an event type. */
export function getLatestSchema(eventType: string): EventSchema | null {
  const versions = schemas.get(eventType);
  if (!versions || versions.length === 0) return null;
  return versions[versions.length - 1];
}

/** Get a specific schema version. */
export function getSchemaVersion(eventType: string, version: number): EventSchema | null {
  const versions = schemas.get(eventType);
  return versions?.find(s => s.version === version) ?? null;
}

/** Get all versions of a schema. */
export function getSchemaHistory(eventType: string): EventSchema[] {
  return schemas.get(eventType) ?? [];
}

/** Validate a payload against the latest schema. */
export function validatePayload(
  eventType: string,
  payload: Record<string, unknown>
): ValidationResult {
  validationsPerformed++;
  const schema = getLatestSchema(eventType);

  if (!schema) {
    // No schema registered — pass through
    return {
      valid: true,
      errors: [],
      schemaVersion: 0,
      validatedAt: new Date().toISOString(),
    };
  }

  if (!schema.validationEnabled) {
    return {
      valid: true,
      errors: [],
      schemaVersion: schema.version,
      validatedAt: new Date().toISOString(),
    };
  }

  const errors: ValidationError[] = [];

  for (const field of schema.fields) {
    const value = payload[field.name];

    // Required check
    if (field.required && (value === undefined || value === null)) {
      errors.push({
        field: field.name,
        expected: field.type,
        received: 'undefined',
        message: `Required field '${field.name}' is missing`,
      });
      continue;
    }

    if (value === undefined || value === null) continue;

    // Type check
    if (field.type !== 'any') {
      const actualType = Array.isArray(value) ? 'array' : typeof value;
      if (actualType !== field.type) {
        errors.push({
          field: field.name,
          expected: field.type,
          received: actualType,
          message: `Field '${field.name}' expected ${field.type}, got ${actualType}`,
        });
      }
    }

    // Custom validator
    if (field.validator && !field.validator(value)) {
      errors.push({
        field: field.name,
        expected: 'custom validation',
        received: String(value),
        message: `Field '${field.name}' failed custom validation`,
      });
    }
  }

  if (errors.length > 0) validationFailures++;

  return {
    valid: errors.length === 0,
    errors,
    schemaVersion: schema.version,
    validatedAt: new Date().toISOString(),
  };
}

/** Check backward compatibility between two versions. */
export function checkCompatibility(eventType: string, fromVersion: number, toVersion: number): {
  compatible: boolean;
  breakingChanges: string[];
} {
  const from = getSchemaVersion(eventType, fromVersion);
  const to = getSchemaVersion(eventType, toVersion);

  if (!from || !to) {
    return { compatible: false, breakingChanges: ['Schema version not found'] };
  }

  const breakingChanges: string[] = [];
  const fromFields = new Map(from.fields.map(f => [f.name, f]));

  for (const toField of to.fields) {
    const fromField = fromFields.get(toField.name);

    if (toField.required && !fromField) {
      breakingChanges.push(`New required field '${toField.name}' added`);
    }

    if (fromField && fromField.type !== toField.type) {
      breakingChanges.push(`Field '${toField.name}' type changed from ${fromField.type} to ${toField.type}`);
    }
  }

  // Check removed fields
  for (const fromField of from.fields) {
    const toField = to.fields.find(f => f.name === fromField.name);
    if (!toField && fromField.required) {
      breakingChanges.push(`Required field '${fromField.name}' was removed`);
    }
  }

  return {
    compatible: breakingChanges.length === 0,
    breakingChanges,
  };
}

/** Deprecate a schema. */
export function deprecateSchema(eventType: string, version: number): boolean {
  const schema = getSchemaVersion(eventType, version);
  if (!schema) return false;
  schema.deprecated = true;
  return true;
}

/** Toggle validation for a schema. */
export function setValidationEnabled(eventType: string, enabled: boolean): boolean {
  const schema = getLatestSchema(eventType);
  if (!schema) return false;
  schema.validationEnabled = enabled;
  return true;
}

// ═══════════════════════════════════════════════════════════════════════════════
// REPORTING
// ═══════════════════════════════════════════════════════════════════════════════

/** Get all registered event types. */
export function getRegisteredEventTypes(): string[] {
  return Array.from(schemas.keys());
}

/** Get all active (non-deprecated) schemas. */
export function getActiveSchemas(): EventSchema[] {
  const active: EventSchema[] = [];
  for (const versions of schemas.values()) {
    const latest = versions[versions.length - 1];
    if (latest && !latest.deprecated) active.push(latest);
  }
  return active;
}

export function getSchemaRegistryStats(): SchemaRegistryStats {
  let total = 0;
  let active = 0;
  let deprecated = 0;
  for (const versions of schemas.values()) {
    total += versions.length;
    for (const s of versions) {
      if (s.deprecated) deprecated++;
      else active++;
    }
  }

  return {
    totalSchemas: total,
    activeSchemas: active,
    deprecatedSchemas: deprecated,
    validationsPerformed,
    validationFailures,
    failureRate: validationsPerformed > 0
      ? Math.round((validationFailures / validationsPerformed) * 10000) / 100
      : 0,
  };
}

export function resetSchemaRegistry(): void {
  schemas.clear();
  validationsPerformed = 0;
  validationFailures = 0;
}
