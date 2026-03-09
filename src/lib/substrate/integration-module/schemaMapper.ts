/**
 * INTEGRATION Module — Schema Mapper & Data Transformation
 * v11.0.0 "Conduit"
 *
 * Maps data between incompatible systems using composable transform steps.
 * Pipeline: validate → normalize → enrich → format
 */

import { boundArray, safeParse, validateStringInput } from '@/lib/system/hardening';

// ── Types ────────────────────────────────────────────────────────

export type TransformStepKind =
  | 'rename'    // rename fields
  | 'cast'      // type coercion
  | 'map'       // value mapping (enum → enum)
  | 'compute'   // derived field via expression
  | 'filter'    // drop fields
  | 'flatten'   // flatten nested objects
  | 'nest'      // wrap flat fields into nested structure
  | 'default'   // set defaults for missing fields
  | 'validate'  // schema validation gate
  | 'custom';   // user-defined transform fn

export interface TransformStep {
  kind: TransformStepKind;
  config: Record<string, unknown>;
  description?: string;
}

export interface SchemaMapping {
  id: string;
  name: string;
  sourceAdapter: string;
  targetAdapter: string;
  steps: TransformStep[];
  createdAt: string;
  updatedAt: string;
  version: number;
  usageCount: number;
  avgTransformMs: number;
  errorCount: number;
}

export interface TransformResult {
  success: boolean;
  data: Record<string, unknown> | null;
  errors: Array<{ step: number; kind: TransformStepKind; message: string }>;
  durationMs: number;
  stepsExecuted: number;
  stepsTotal: number;
}

export interface TransformBatchResult {
  total: number;
  succeeded: number;
  failed: number;
  results: TransformResult[];
  durationMs: number;
}

export interface ConflictResolution {
  field: string;
  sourceValue: unknown;
  targetValue: unknown;
  strategy: 'source_wins' | 'target_wins' | 'merge' | 'newest' | 'manual';
  resolvedValue: unknown;
  resolvedAt: string;
}

// ── Constants ────────────────────────────────────────────────────

const MAX_MAPPINGS = 100;
const MAX_STEPS_PER_MAPPING = 50;
const MAX_BATCH_SIZE = 1000;
const MAX_FIELD_DEPTH = 10;
const MAX_CONFLICTS_LOG = 500;

// ── In-Memory State ──────────────────────────────────────────────

const schemaMappings = new Map<string, SchemaMapping>();
const conflictLog: ConflictResolution[] = [];

// ── Mapping CRUD ─────────────────────────────────────────────────

export function createSchemaMapping(params: {
  name: string;
  sourceAdapter: string;
  targetAdapter: string;
  steps: TransformStep[];
}): { success: boolean; mapping?: SchemaMapping; error?: string } {
  if (schemaMappings.size >= MAX_MAPPINGS) {
    return { success: false, error: `Mapping limit reached (${MAX_MAPPINGS})` };
  }
  if (!validateStringInput(params.name, { minLength: 1, maxLength: 200 })) {
    return { success: false, error: 'Invalid mapping name' };
  }
  if (params.steps.length > MAX_STEPS_PER_MAPPING) {
    return { success: false, error: `Too many steps (max ${MAX_STEPS_PER_MAPPING})` };
  }

  const id = `sm_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const mapping: SchemaMapping = {
    id,
    name: params.name,
    sourceAdapter: params.sourceAdapter,
    targetAdapter: params.targetAdapter,
    steps: params.steps.slice(0, MAX_STEPS_PER_MAPPING),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    version: 1,
    usageCount: 0,
    avgTransformMs: 0,
    errorCount: 0,
  };
  schemaMappings.set(id, mapping);
  return { success: true, mapping };
}

export function getSchemaMapping(id: string): SchemaMapping | null {
  return schemaMappings.get(id) ?? null;
}

export function listSchemaMappings(adapterId?: string): SchemaMapping[] {
  const all = Array.from(schemaMappings.values());
  if (adapterId) return all.filter(m => m.sourceAdapter === adapterId || m.targetAdapter === adapterId);
  return all;
}

export function updateSchemaMapping(id: string, updates: { name?: string; steps?: TransformStep[] }): {
  success: boolean; error?: string;
} {
  const mapping = schemaMappings.get(id);
  if (!mapping) return { success: false, error: 'Mapping not found' };

  if (updates.name) mapping.name = updates.name;
  if (updates.steps) {
    if (updates.steps.length > MAX_STEPS_PER_MAPPING) {
      return { success: false, error: `Too many steps (max ${MAX_STEPS_PER_MAPPING})` };
    }
    mapping.steps = updates.steps;
  }
  mapping.updatedAt = new Date().toISOString();
  mapping.version++;
  return { success: true };
}

export function deleteSchemaMapping(id: string): { success: boolean; error?: string } {
  if (!schemaMappings.has(id)) return { success: false, error: 'Mapping not found' };
  schemaMappings.delete(id);
  return { success: true };
}

// ── Transform Execution ──────────────────────────────────────────

export function executeTransform(
  mappingId: string,
  data: Record<string, unknown>
): TransformResult {
  const start = Date.now();
  const mapping = schemaMappings.get(mappingId);

  if (!mapping) {
    return { success: false, data: null, errors: [{ step: -1, kind: 'validate', message: 'Mapping not found' }], durationMs: 0, stepsExecuted: 0, stepsTotal: 0 };
  }

  let current: Record<string, unknown> = { ...data };
  const errors: TransformResult['errors'] = [];
  let stepsExecuted = 0;

  for (let i = 0; i < mapping.steps.length; i++) {
    const step = mapping.steps[i];
    try {
      current = applyStep(current, step);
      stepsExecuted++;
    } catch (err) {
      errors.push({
        step: i,
        kind: step.kind,
        message: err instanceof Error ? err.message : String(err),
      });
      // Continue pipeline — partial results with annotations
    }
  }

  const durationMs = Date.now() - start;
  mapping.usageCount++;
  mapping.avgTransformMs = mapping.avgTransformMs === 0
    ? durationMs
    : mapping.avgTransformMs * 0.9 + durationMs * 0.1;
  if (errors.length > 0) mapping.errorCount++;

  return {
    success: errors.length === 0,
    data: current,
    errors,
    durationMs,
    stepsExecuted,
    stepsTotal: mapping.steps.length,
  };
}

export function executeBatchTransform(
  mappingId: string,
  records: Record<string, unknown>[]
): TransformBatchResult {
  const start = Date.now();
  const capped = records.slice(0, MAX_BATCH_SIZE);
  const results = capped.map(r => executeTransform(mappingId, r));

  return {
    total: capped.length,
    succeeded: results.filter(r => r.success).length,
    failed: results.filter(r => !r.success).length,
    results,
    durationMs: Date.now() - start,
  };
}

// ── Step Execution ───────────────────────────────────────────────

function applyStep(data: Record<string, unknown>, step: TransformStep): Record<string, unknown> {
  const result = { ...data };
  const cfg = step.config;

  switch (step.kind) {
    case 'rename': {
      const fieldMap = cfg.fields as Record<string, string> | undefined;
      if (fieldMap) {
        for (const [oldKey, newKey] of Object.entries(fieldMap)) {
          if (oldKey in result) {
            result[newKey] = result[oldKey];
            delete result[oldKey];
          }
        }
      }
      return result;
    }

    case 'cast': {
      const casts = cfg.fields as Record<string, string> | undefined;
      if (casts) {
        for (const [field, targetType] of Object.entries(casts)) {
          if (field in result) {
            result[field] = castValue(result[field], targetType);
          }
        }
      }
      return result;
    }

    case 'map': {
      const field = cfg.field as string;
      const valueMap = cfg.values as Record<string, unknown> | undefined;
      if (field && valueMap && field in result) {
        const key = String(result[field]);
        if (key in valueMap) result[field] = valueMap[key];
      }
      return result;
    }

    case 'filter': {
      const keep = cfg.keep as string[] | undefined;
      const drop = cfg.drop as string[] | undefined;
      if (keep) {
        const filtered: Record<string, unknown> = {};
        for (const k of keep) {
          if (k in result) filtered[k] = result[k];
        }
        return filtered;
      }
      if (drop) {
        for (const k of drop) delete result[k];
      }
      return result;
    }

    case 'default': {
      const defaults = cfg.values as Record<string, unknown> | undefined;
      if (defaults) {
        for (const [k, v] of Object.entries(defaults)) {
          if (!(k in result) || result[k] === null || result[k] === undefined) {
            result[k] = v;
          }
        }
      }
      return result;
    }

    case 'flatten': {
      return flattenObject(result, (cfg.separator as string) ?? '.', 0);
    }

    case 'nest': {
      const target = cfg.target as string;
      const fields = cfg.fields as string[];
      if (target && fields) {
        const nested: Record<string, unknown> = {};
        for (const f of fields) {
          if (f in result) {
            nested[f] = result[f];
            delete result[f];
          }
        }
        result[target] = nested;
      }
      return result;
    }

    case 'compute': {
      const field = cfg.field as string;
      const expr = cfg.expression as string;
      if (field && expr) {
        // Simple expression: concatenation, arithmetic
        result[field] = evaluateSimpleExpression(expr, result);
      }
      return result;
    }

    case 'validate': {
      const required = cfg.required as string[] | undefined;
      if (required) {
        for (const f of required) {
          if (!(f in result) || result[f] === null || result[f] === undefined) {
            throw new Error(`Validation failed: missing required field "${f}"`);
          }
        }
      }
      return result;
    }

    case 'custom':
    default:
      return result;
  }
}

// ── Helpers ──────────────────────────────────────────────────────

function castValue(value: unknown, targetType: string): unknown {
  switch (targetType) {
    case 'string': return String(value ?? '');
    case 'number': return Number(value) || 0;
    case 'boolean': return Boolean(value);
    case 'date': return new Date(String(value)).toISOString();
    case 'json': return typeof value === 'string' ? safeParse(value) ?? value : value;
    default: return value;
  }
}

function flattenObject(obj: Record<string, unknown>, sep: string, depth: number): Record<string, unknown> {
  if (depth >= MAX_FIELD_DEPTH) return obj;
  const result: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      const nested = flattenObject(v as Record<string, unknown>, sep, depth + 1);
      for (const [nk, nv] of Object.entries(nested)) {
        result[`${k}${sep}${nk}`] = nv;
      }
    } else {
      result[k] = v;
    }
  }
  return result;
}

function evaluateSimpleExpression(expr: string, data: Record<string, unknown>): unknown {
  // Template literal substitution: "{{first_name}} {{last_name}}"
  return expr.replace(/\{\{(\w+)\}\}/g, (_, key) => String(data[key] ?? ''));
}

// ── Conflict Resolution ──────────────────────────────────────────

export function resolveConflict(
  field: string,
  sourceValue: unknown,
  targetValue: unknown,
  strategy: ConflictResolution['strategy']
): ConflictResolution {
  let resolvedValue: unknown;

  switch (strategy) {
    case 'source_wins': resolvedValue = sourceValue; break;
    case 'target_wins': resolvedValue = targetValue; break;
    case 'newest':
      resolvedValue = typeof sourceValue === 'string' && typeof targetValue === 'string'
        ? (new Date(sourceValue) > new Date(targetValue) ? sourceValue : targetValue)
        : sourceValue;
      break;
    case 'merge':
      if (typeof sourceValue === 'object' && typeof targetValue === 'object') {
        resolvedValue = { ...(targetValue as object), ...(sourceValue as object) };
      } else {
        resolvedValue = sourceValue;
      }
      break;
    case 'manual':
    default:
      resolvedValue = sourceValue;
  }

  const resolution: ConflictResolution = {
    field,
    sourceValue,
    targetValue,
    strategy,
    resolvedValue,
    resolvedAt: new Date().toISOString(),
  };

  conflictLog.push(resolution);
  if (conflictLog.length > MAX_CONFLICTS_LOG) {
    conflictLog.splice(0, conflictLog.length - MAX_CONFLICTS_LOG);
  }

  return resolution;
}

export function getConflictLog(): ConflictResolution[] {
  return [...conflictLog];
}

// ── Mapper Stats ─────────────────────────────────────────────────

export function getMapperStats(): {
  totalMappings: number;
  totalTransforms: number;
  totalErrors: number;
  avgTransformMs: number;
  conflictsResolved: number;
} {
  const all = listSchemaMappings();
  const totalTransforms = all.reduce((s, m) => s + m.usageCount, 0);
  const totalErrors = all.reduce((s, m) => s + m.errorCount, 0);
  const avgTransformMs = all.length > 0
    ? Math.round(all.reduce((s, m) => s + m.avgTransformMs, 0) / all.length)
    : 0;

  return {
    totalMappings: all.length,
    totalTransforms,
    totalErrors,
    avgTransformMs,
    conflictsResolved: conflictLog.length,
  };
}

// ── Reset (testing) ──────────────────────────────────────────────

export function _resetMapper(): void {
  schemaMappings.clear();
  conflictLog.length = 0;
}
