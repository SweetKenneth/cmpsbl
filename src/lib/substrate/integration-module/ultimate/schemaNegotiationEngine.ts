/**
 * Schema Negotiation Engine
 * 
 * Handles version mismatches, content negotiation, field mapping,
 * and backward compatibility shims between the substrate and external APIs.
 * 
 * @module integration/ultimate/schemaNegotiationEngine
 * @version 9.0.0 — Babel Gate
 */

// ── Types ──────────────────────────────────────────────────────

export type SerializationFormat = 'json' | 'messagepack' | 'protobuf' | 'xml' | 'csv';

export interface FieldMapping {
  source: string;
  target: string;
  transform?: 'rename' | 'reshape' | 'merge' | 'split' | 'cast';
  castTo?: 'string' | 'number' | 'boolean';
}

export interface VersionAdapter {
  integrationId: string;
  fromVersion: string;
  toVersion: string;
  mappings: FieldMapping[];
  createdAt: number;
}

export interface NegotiationResult {
  selectedFormat: SerializationFormat;
  apiVersion: string;
  adapterApplied: boolean;
  fieldsMapped: number;
}

export interface SchemaEvolution {
  integrationId: string;
  version: string;
  changes: Array<{ field: string; changeType: string; timestamp: number }>;
}

// ── State ──────────────────────────────────────────────────────

const versionAdapters = new Map<string, VersionAdapter[]>();
const fieldMappings = new Map<string, FieldMapping[]>();
const evolutionHistory: SchemaEvolution[] = [];

// ── Core ───────────────────────────────────────────────────────

/** Negotiate the best serialization format */
export function negotiateFormat(
  supported: SerializationFormat[],
  preferred: SerializationFormat[] = ['json', 'messagepack', 'protobuf'],
): SerializationFormat {
  for (const pref of preferred) {
    if (supported.includes(pref)) return pref;
  }
  return supported[0] ?? 'json';
}

/** Register a version adapter */
export function registerAdapter(adapter: VersionAdapter): void {
  const key = adapter.integrationId;
  const existing = versionAdapters.get(key) ?? [];
  existing.push(adapter);
  versionAdapters.set(key, existing);
}

/** Find the best adapter chain for a version transition */
export function findAdapter(integrationId: string, fromVersion: string, toVersion: string): VersionAdapter | null {
  const adapters = versionAdapters.get(integrationId) ?? [];
  return adapters.find(a => a.fromVersion === fromVersion && a.toVersion === toVersion) ?? null;
}

/** Apply field mappings to a payload */
export function applyMappings(payload: Record<string, unknown>, mappings: FieldMapping[]): Record<string, unknown> {
  const result: Record<string, unknown> = { ...payload };

  for (const mapping of mappings) {
    const value = result[mapping.source];
    if (value === undefined) continue;

    switch (mapping.transform) {
      case 'rename':
        result[mapping.target] = value;
        delete result[mapping.source];
        break;
      case 'cast':
        if (mapping.castTo === 'string') result[mapping.target] = String(value);
        else if (mapping.castTo === 'number') result[mapping.target] = Number(value);
        else if (mapping.castTo === 'boolean') result[mapping.target] = Boolean(value);
        if (mapping.source !== mapping.target) delete result[mapping.source];
        break;
      case 'split':
        if (typeof value === 'string') {
          const parts = value.split(',');
          result[mapping.target] = parts;
          if (mapping.source !== mapping.target) delete result[mapping.source];
        }
        break;
      default:
        result[mapping.target] = value;
        if (mapping.source !== mapping.target) delete result[mapping.source];
    }
  }

  return result;
}

/** Register field mappings for an integration */
export function setFieldMappings(integrationId: string, mappings: FieldMapping[]): void {
  fieldMappings.set(integrationId, mappings);
}

/** Get field mappings */
export function getFieldMappings(integrationId: string): FieldMapping[] {
  return fieldMappings.get(integrationId) ?? [];
}

/** Record a schema evolution event */
export function recordEvolution(integrationId: string, version: string, changes: Array<{ field: string; changeType: string }>): void {
  evolutionHistory.push({
    integrationId, version,
    changes: changes.map(c => ({ ...c, timestamp: Date.now() })),
  });
}

export function getEvolutionHistory(integrationId?: string): SchemaEvolution[] {
  if (integrationId) return evolutionHistory.filter(e => e.integrationId === integrationId);
  return [...evolutionHistory];
}

export function getSchemaNegotiationHealth() {
  return {
    registeredAdapters: Array.from(versionAdapters.values()).reduce((s, a) => s + a.length, 0),
    fieldMappingSets: fieldMappings.size,
    evolutionEvents: evolutionHistory.length,
  };
}

export function resetSchemaNegotiation(): void {
  versionAdapters.clear();
  fieldMappings.clear();
  evolutionHistory.length = 0;
}
