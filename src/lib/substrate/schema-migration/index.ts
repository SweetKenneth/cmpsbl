/**
 * Schema Migration Engine
 * v1.0.0 — Versioned schema migration for cognitive data structures
 * 
 * Manages schema versioning, migration plans, and data transformation
 * when substrate data structures evolve between versions.
 */

export interface SchemaMigration {
  id: string;
  fromVersion: string;
  toVersion: string;
  description: string;
  transformations: SchemaTransformation[];
  status: 'pending' | 'applied' | 'rolled_back' | 'failed';
  createdAt: number;
  appliedAt: number | null;
}

export interface SchemaTransformation {
  type: 'add_field' | 'remove_field' | 'rename_field' | 'change_type' | 'add_index';
  target: string;
  details: Record<string, string>;
}

const migrations: SchemaMigration[] = [];
let currentVersion = '1.0.0';

export function createMigration(fromVersion: string, toVersion: string, description: string, transformations: SchemaTransformation[]): SchemaMigration {
  const m: SchemaMigration = {
    id: `migration-${Date.now()}`,
    fromVersion, toVersion, description, transformations,
    status: 'pending', createdAt: Date.now(), appliedAt: null,
  };
  migrations.push(m);
  return m;
}

export function applyMigration(migrationId: string): boolean {
  const m = migrations.find(x => x.id === migrationId);
  if (!m || m.status !== 'pending' || m.fromVersion !== currentVersion) return false;
  m.status = 'applied';
  m.appliedAt = Date.now();
  currentVersion = m.toVersion;
  return true;
}

export function rollbackMigration(migrationId: string): boolean {
  const m = migrations.find(x => x.id === migrationId);
  if (!m || m.status !== 'applied') return false;
  m.status = 'rolled_back';
  currentVersion = m.fromVersion;
  return true;
}

export function getMigrations(): SchemaMigration[] { return [...migrations]; }
export function getCurrentVersion(): string { return currentVersion; }
export function getPendingMigrations(): SchemaMigration[] { return migrations.filter(m => m.status === 'pending'); }
