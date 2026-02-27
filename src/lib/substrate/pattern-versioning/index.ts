/**
 * Transfer Pattern Versioning
 * Tracks schema versions for expert patterns
 * 
 * Ensures backward compatibility and migration paths as
 * expert patterns evolve across substrate versions.
 */

export interface PatternVersion {
  id: string;
  patternId: string;
  version: string;        // semver
  schema: Record<string, unknown>;
  changelog: string;
  createdAt: number;
  deprecated: boolean;
  migratesFrom: string | null;  // previous version
}

export interface VersionedPattern {
  id: string;
  name: string;
  category: string;
  currentVersion: string;
  versions: PatternVersion[];
  totalMigrations: number;
  lastUpdated: number;
}

export interface MigrationResult {
  from: string;
  to: string;
  success: boolean;
  transformedFields: string[];
  droppedFields: string[];
  addedFields: string[];
}

const registry = new Map<string, VersionedPattern>();

/** Parse semver string */
function parseSemver(v: string): [number, number, number] {
  const [major = 0, minor = 0, patch = 0] = v.split('.').map(Number);
  return [major, minor, patch];
}

/** Compare semver: -1 if a < b, 0 if equal, 1 if a > b */
function compareSemver(a: string, b: string): number {
  const [aMaj, aMin, aPatch] = parseSemver(a);
  const [bMaj, bMin, bPatch] = parseSemver(b);
  if (aMaj !== bMaj) return aMaj - bMaj;
  if (aMin !== bMin) return aMin - bMin;
  return aPatch - bPatch;
}

/** Register a new pattern with initial version */
export function registerPattern(
  id: string,
  name: string,
  category: string,
  initialSchema: Record<string, unknown>
): VersionedPattern {
  const version: PatternVersion = {
    id: `${id}_v1.0.0`,
    patternId: id,
    version: '1.0.0',
    schema: initialSchema,
    changelog: 'Initial version',
    createdAt: Date.now(),
    deprecated: false,
    migratesFrom: null,
  };

  const pattern: VersionedPattern = {
    id,
    name,
    category,
    currentVersion: '1.0.0',
    versions: [version],
    totalMigrations: 0,
    lastUpdated: Date.now(),
  };

  registry.set(id, pattern);
  return pattern;
}

/** Add a new version to a pattern */
export function addVersion(
  patternId: string,
  newVersion: string,
  schema: Record<string, unknown>,
  changelog: string
): PatternVersion | null {
  const pattern = registry.get(patternId);
  if (!pattern) return null;

  // Validate version is newer
  if (compareSemver(newVersion, pattern.currentVersion) <= 0) {
    console.warn(`[pattern-versioning] ${newVersion} is not newer than ${pattern.currentVersion}`);
    return null;
  }

  const version: PatternVersion = {
    id: `${patternId}_v${newVersion}`,
    patternId,
    version: newVersion,
    schema,
    changelog,
    createdAt: Date.now(),
    deprecated: false,
    migratesFrom: pattern.currentVersion,
  };

  pattern.versions.push(version);
  pattern.currentVersion = newVersion;
  pattern.totalMigrations++;
  pattern.lastUpdated = Date.now();

  return version;
}

/** Migrate data from one version schema to another */
export function migrateData(
  patternId: string,
  data: Record<string, unknown>,
  fromVersion: string,
  toVersion: string
): MigrationResult {
  const pattern = registry.get(patternId);
  if (!pattern) {
    return { from: fromVersion, to: toVersion, success: false, transformedFields: [], droppedFields: [], addedFields: [] };
  }

  const fromSchema = pattern.versions.find(v => v.version === fromVersion)?.schema || {};
  const toSchema = pattern.versions.find(v => v.version === toVersion)?.schema || {};

  const fromKeys = new Set(Object.keys(fromSchema));
  const toKeys = new Set(Object.keys(toSchema));

  const addedFields = [...toKeys].filter(k => !fromKeys.has(k));
  const droppedFields = [...fromKeys].filter(k => !toKeys.has(k));
  const transformedFields = [...toKeys].filter(k => fromKeys.has(k) && fromSchema[k] !== toSchema[k]);

  // Apply migration: add new fields with defaults, remove dropped
  for (const field of addedFields) {
    data[field] = toSchema[field] ?? null;
  }
  for (const field of droppedFields) {
    delete data[field];
  }

  return {
    from: fromVersion,
    to: toVersion,
    success: true,
    transformedFields,
    droppedFields,
    addedFields,
  };
}

/** Deprecate a version */
export function deprecateVersion(patternId: string, version: string): boolean {
  const pattern = registry.get(patternId);
  if (!pattern) return false;
  const v = pattern.versions.find(pv => pv.version === version);
  if (v) { v.deprecated = true; return true; }
  return false;
}

/** Get pattern info */
export function getPattern(id: string): VersionedPattern | undefined {
  return registry.get(id);
}

/** List all patterns */
export function listPatterns(): VersionedPattern[] {
  return Array.from(registry.values());
}

/** Get versioning summary */
export function getVersioningSummary() {
  const all = listPatterns();
  return {
    totalPatterns: all.length,
    totalVersions: all.reduce((s, p) => s + p.versions.length, 0),
    totalMigrations: all.reduce((s, p) => s + p.totalMigrations, 0),
    deprecatedVersions: all.reduce((s, p) => s + p.versions.filter(v => v.deprecated).length, 0),
    avgVersionsPerPattern: all.length > 0
      ? (all.reduce((s, p) => s + p.versions.length, 0) / all.length).toFixed(1)
      : '0',
  };
}
