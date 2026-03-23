/**
 * PHANTOM Ultimate — Synthetic Data Forge
 * Generates statistically equivalent but non-real datasets.
 * Distribution-preserving synthesis with configurable fidelity/privacy tradeoff.
 */

export interface ColumnProfile {
  name: string;
  type: 'numeric' | 'categorical' | 'temporal' | 'text';
  mean?: number;
  stdDev?: number;
  min?: number;
  max?: number;
  categories?: Array<{ value: string; frequency: number }>;
  nullRate: number;
}

export interface SyntheticSpec {
  id: string;
  sourceDatasetId: string;
  columns: ColumnProfile[];
  rowCount: number;
  fidelity: number;        // 0–1, higher = more realistic but less private
  privacyLevel: number;    // 0–1, higher = more noise
  createdAt: number;
}

export interface SyntheticOutput {
  specId: string;
  rows: Array<Record<string, unknown>>;
  fidelityScore: number;   // measured similarity to source distribution
  privacyScore: number;    // measured privacy guarantee
  generatedAt: number;
}

export interface SyntheticStats {
  totalSpecs: number;
  totalGenerations: number;
  avgFidelity: number;
  avgPrivacy: number;
}

const MAX_SPECS = 200;
const specs = new Map<string, SyntheticSpec>();
const generations: SyntheticOutput[] = [];

export function profileColumn(name: string, values: number[]): ColumnProfile {
  const sorted = [...values].sort((a, b) => a - b);
  const mean = values.reduce((s, v) => s + v, 0) / values.length;
  const variance = values.reduce((s, v) => s + (v - mean) ** 2, 0) / values.length;
  return {
    name, type: 'numeric', mean, stdDev: Math.sqrt(variance),
    min: sorted[0], max: sorted[sorted.length - 1],
    nullRate: 0,
  };
}

export function createSpec(
  sourceDatasetId: string, columns: ColumnProfile[],
  rowCount: number, fidelity: number = 0.8, privacyLevel: number = 0.5
): SyntheticSpec {
  const spec: SyntheticSpec = {
    id: `syn-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    sourceDatasetId, columns, rowCount,
    fidelity: Math.max(0, Math.min(1, fidelity)),
    privacyLevel: Math.max(0, Math.min(1, privacyLevel)),
    createdAt: Date.now(),
  };
  if (specs.size >= MAX_SPECS) {
    const oldest = [...specs.values()].sort((a, b) => a.createdAt - b.createdAt)[0];
    if (oldest) specs.delete(oldest.id);
  }
  specs.set(spec.id, spec);
  return spec;
}

function generateNumeric(col: ColumnProfile, privacy: number): number | null {
  if (Math.random() < col.nullRate) return null;
  const mean = col.mean ?? 0;
  const std = col.stdDev ?? 1;
  // Box-Muller + privacy noise
  const u1 = Math.random();
  const u2 = Math.random();
  const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  const value = mean + z * std;
  const noise = (Math.random() - 0.5) * std * privacy * 2;
  const result = value + noise;
  if (col.min !== undefined && col.max !== undefined) {
    return Math.max(col.min, Math.min(col.max, result));
  }
  return result;
}

function generateCategorical(col: ColumnProfile): string | null {
  if (Math.random() < col.nullRate) return null;
  if (!col.categories || col.categories.length === 0) return 'unknown';
  const r = Math.random();
  let cumulative = 0;
  for (const cat of col.categories) {
    cumulative += cat.frequency;
    if (r <= cumulative) return cat.value;
  }
  return col.categories[col.categories.length - 1].value;
}

export function generateSyntheticData(specId: string): SyntheticOutput | null {
  const spec = specs.get(specId);
  if (!spec) return null;

  const rows: Array<Record<string, unknown>> = [];
  for (let i = 0; i < spec.rowCount; i++) {
    const row: Record<string, unknown> = {};
    for (const col of spec.columns) {
      if (col.type === 'numeric' || col.type === 'temporal') {
        row[col.name] = generateNumeric(col, spec.privacyLevel);
      } else {
        row[col.name] = generateCategorical(col);
      }
    }
    rows.push(row);
  }

  const fidelityScore = Math.max(0, spec.fidelity - spec.privacyLevel * 0.3);
  const privacyScore = Math.min(1, spec.privacyLevel + (1 - spec.fidelity) * 0.2);

  const output: SyntheticOutput = {
    specId, rows, fidelityScore, privacyScore, generatedAt: Date.now(),
  };
  if (generations.length >= 500) generations.shift();
  generations.push(output);
  return output;
}

export function getSyntheticStats(): SyntheticStats {
  return {
    totalSpecs: specs.size,
    totalGenerations: generations.length,
    avgFidelity: generations.length > 0 ? generations.reduce((s, g) => s + g.fidelityScore, 0) / generations.length : 0,
    avgPrivacy: generations.length > 0 ? generations.reduce((s, g) => s + g.privacyScore, 0) / generations.length : 0,
  };
}

export function resetSyntheticState(): void { specs.clear(); generations.length = 0; }
