/**
 * HARVEST Ultimate — Schema Cartographer
 * Maps schema evolution over time, detects drift, auto-generates migration
 * transforms when sources change shape.
 */

export type FieldType = 'string' | 'number' | 'boolean' | 'null' | 'array' | 'object' | 'mixed';

export interface SchemaField {
  name: string;
  type: FieldType;
  nullable: boolean;
  frequency: number; // 0–1 how often this field appears
}

export interface SchemaSnapshot {
  id: string;
  sourceId: string;
  fields: SchemaField[];
  sampleSize: number;
  capturedAt: number;
  hash: string;
}

export interface SchemaDrift {
  sourceId: string;
  fromSnapshotId: string;
  toSnapshotId: string;
  addedFields: string[];
  removedFields: string[];
  typeChanges: Array<{ field: string; from: FieldType; to: FieldType }>;
  severity: 'none' | 'minor' | 'major' | 'breaking';
  detectedAt: number;
}

export interface MigrationTransform {
  id: string;
  sourceId: string;
  driftId: string;
  operations: MigrationOp[];
  generatedAt: number;
}

export type MigrationOp =
  | { type: 'add_field'; field: string; defaultValue: unknown }
  | { type: 'remove_field'; field: string }
  | { type: 'cast_field'; field: string; from: FieldType; to: FieldType }
  | { type: 'rename_field'; from: string; to: string };

export interface CartographerStats {
  totalSnapshots: number;
  totalDrifts: number;
  totalMigrations: number;
  breakingDrifts: number;
}

const MAX_SNAPSHOTS = 500;
const MAX_DRIFTS = 200;

const snapshots: SchemaSnapshot[] = [];
const drifts: SchemaDrift[] = [];
const migrations: MigrationTransform[] = [];

function hashFields(fields: SchemaField[]): string {
  const sig = fields.map(f => `${f.name}:${f.type}:${f.nullable}`).sort().join('|');
  let h = 0;
  for (let i = 0; i < sig.length; i++) {
    h = ((h << 5) - h + sig.charCodeAt(i)) | 0;
  }
  return `sch-${(h >>> 0).toString(36)}`;
}

function inferFieldType(values: unknown[]): FieldType {
  const types = new Map<string, number>();
  for (const v of values) {
    const t = v === null ? 'null' : Array.isArray(v) ? 'array' : typeof v;
    types.set(t, (types.get(t) ?? 0) + 1);
  }
  const total = values.length;
  for (const [t, c] of types) {
    if (c / total >= 0.8) return t as FieldType;
  }
  return 'mixed';
}

export function captureSchema(sourceId: string, records: Record<string, unknown>[]): SchemaSnapshot {
  const sample = records.slice(0, 200);
  const fieldMap = new Map<string, unknown[]>();

  for (const rec of sample) {
    for (const [k, v] of Object.entries(rec)) {
      if (!fieldMap.has(k)) fieldMap.set(k, []);
      fieldMap.get(k)!.push(v);
    }
  }

  const fields: SchemaField[] = [];
  for (const [name, vals] of fieldMap) {
    fields.push({
      name,
      type: inferFieldType(vals),
      nullable: vals.some(v => v === null || v === undefined),
      frequency: vals.length / sample.length,
    });
  }

  const snap: SchemaSnapshot = {
    id: `snap-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    sourceId, fields, sampleSize: sample.length,
    capturedAt: Date.now(), hash: hashFields(fields),
  };

  if (snapshots.length >= MAX_SNAPSHOTS) snapshots.shift();
  snapshots.push(snap);

  // Detect drift against previous snapshot for same source
  const prev = [...snapshots].reverse().find(s => s.sourceId === sourceId && s.id !== snap.id);
  if (prev && prev.hash !== snap.hash) {
    detectDrift(sourceId, prev, snap);
  }

  return snap;
}

function detectDrift(sourceId: string, from: SchemaSnapshot, to: SchemaSnapshot): SchemaDrift {
  const fromFields = new Set(from.fields.map(f => f.name));
  const toFields = new Set(to.fields.map(f => f.name));

  const added = [...toFields].filter(f => !fromFields.has(f));
  const removed = [...fromFields].filter(f => !toFields.has(f));
  const typeChanges: SchemaDrift['typeChanges'] = [];

  for (const ff of from.fields) {
    const tf = to.fields.find(f => f.name === ff.name);
    if (tf && tf.type !== ff.type) {
      typeChanges.push({ field: ff.name, from: ff.type, to: tf.type });
    }
  }

  const severity: SchemaDrift['severity'] =
    removed.length > 0 || typeChanges.length > 0 ? 'breaking'
    : added.length > 3 ? 'major'
    : added.length > 0 ? 'minor'
    : 'none';

  const drift: SchemaDrift = {
    sourceId, fromSnapshotId: from.id, toSnapshotId: to.id,
    addedFields: added, removedFields: removed, typeChanges,
    severity, detectedAt: Date.now(),
  };

  if (drifts.length >= MAX_DRIFTS) drifts.shift();
  drifts.push(drift);

  // Auto-generate migration
  if (severity !== 'none') {
    generateMigration(sourceId, drift);
  }

  return drift;
}

function generateMigration(sourceId: string, drift: SchemaDrift): MigrationTransform {
  const ops: MigrationOp[] = [];

  for (const field of drift.addedFields) {
    ops.push({ type: 'add_field', field, defaultValue: null });
  }
  for (const field of drift.removedFields) {
    ops.push({ type: 'remove_field', field });
  }
  for (const tc of drift.typeChanges) {
    ops.push({ type: 'cast_field', field: tc.field, from: tc.from, to: tc.to });
  }

  const migration: MigrationTransform = {
    id: `mig-${Date.now()}`,
    sourceId,
    driftId: `${drift.fromSnapshotId}->${drift.toSnapshotId}`,
    operations: ops,
    generatedAt: Date.now(),
  };

  migrations.push(migration);
  return migration;
}

export function getCartographerStats(): CartographerStats {
  return {
    totalSnapshots: snapshots.length,
    totalDrifts: drifts.length,
    totalMigrations: migrations.length,
    breakingDrifts: drifts.filter(d => d.severity === 'breaking').length,
  };
}

export function getRecentDrifts(limit: number = 10): SchemaDrift[] {
  return drifts.slice(-limit);
}

export function resetCartographerState(): void {
  snapshots.length = 0;
  drifts.length = 0;
  migrations.length = 0;
}
