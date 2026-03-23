/**
 * RELAY Ultimate — Message Compressor
 * Delta encoding for sequential updates. Compression ratio tracking.
 * Adaptive threshold — compress only when beneficial.
 */

export interface CompressionResult {
  id: string;
  originalSize: number;
  compressedSize: number;
  ratio: number;              // compressed/original (lower = better)
  method: 'delta' | 'dedup_fields' | 'none';
  beneficial: boolean;
  compressedAt: number;
}

export interface CompressionStats {
  totalCompressions: number;
  avgRatio: number;
  totalBytesSaved: number;
  beneficialRate: number;
  byMethod: Record<string, number>;
}

const MIN_COMPRESS_SIZE = 256;   // Don't bother under 256 bytes
const BENEFIT_THRESHOLD = 0.85;  // Must save at least 15%
const MAX_HISTORY = 500;
const MAX_DELTAS = 200;

const history: CompressionResult[] = [];
const deltaBaselines = new Map<string, string>(); // destination → last payload JSON

export function compress(
  destination: string, payload: Record<string, unknown>
): { result: CompressionResult; outputPayload: Record<string, unknown> } {
  const serialized = JSON.stringify(payload);
  const originalSize = serialized.length;

  // Too small to bother
  if (originalSize < MIN_COMPRESS_SIZE) {
    const result = recordResult(originalSize, originalSize, 'none', false);
    return { result, outputPayload: payload };
  }

  // Try delta encoding against previous payload to same destination
  const baseline = deltaBaselines.get(destination);
  if (baseline) {
    const baseObj = JSON.parse(baseline) as Record<string, unknown>;
    const delta: Record<string, unknown> = {};
    let deltaCount = 0;

    for (const [key, value] of Object.entries(payload)) {
      if (JSON.stringify(baseObj[key]) !== JSON.stringify(value)) {
        delta[key] = value;
        deltaCount++;
      }
    }

    // Check for removed keys
    for (const key of Object.keys(baseObj)) {
      if (!(key in payload)) {
        delta[`__removed_${key}`] = true;
        deltaCount++;
      }
    }

    const deltaSize = JSON.stringify(delta).length;
    const ratio = deltaSize / originalSize;

    if (ratio < BENEFIT_THRESHOLD && deltaCount > 0) {
      // Update baseline
      if (deltaBaselines.size >= MAX_DELTAS) {
        const oldest = [...deltaBaselines.keys()][0];
        if (oldest) deltaBaselines.delete(oldest);
      }
      deltaBaselines.set(destination, serialized);
      const result = recordResult(originalSize, deltaSize, 'delta', true);
      return { result, outputPayload: { __delta: true, __baseline_hash: fnvHash(baseline), ...delta } };
    }
  }

  // Try field deduplication (remove null/undefined/empty string fields)
  const deduped: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(payload)) {
    if (value !== null && value !== undefined && value !== '') {
      deduped[key] = value;
    }
  }
  const dedupSize = JSON.stringify(deduped).length;
  const dedupRatio = dedupSize / originalSize;

  // Update baseline for future delta
  if (deltaBaselines.size >= MAX_DELTAS) {
    const oldest = [...deltaBaselines.keys()][0];
    if (oldest) deltaBaselines.delete(oldest);
  }
  deltaBaselines.set(destination, serialized);

  if (dedupRatio < BENEFIT_THRESHOLD) {
    const result = recordResult(originalSize, dedupSize, 'dedup_fields', true);
    return { result, outputPayload: deduped };
  }

  const result = recordResult(originalSize, originalSize, 'none', false);
  return { result, outputPayload: payload };
}

function fnvHash(input: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = (hash * 0x01000193) >>> 0;
  }
  return hash.toString(16).padStart(8, '0');
}

function recordResult(originalSize: number, compressedSize: number, method: CompressionResult['method'], beneficial: boolean): CompressionResult {
  const result: CompressionResult = {
    id: `cmp-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    originalSize, compressedSize,
    ratio: originalSize > 0 ? compressedSize / originalSize : 1,
    method, beneficial, compressedAt: Date.now(),
  };
  if (history.length >= MAX_HISTORY) history.shift();
  history.push(result);
  return result;
}

export function getCompressionStats(): CompressionStats {
  const byMethod: Record<string, number> = {};
  let totalSaved = 0;
  for (const h of history) {
    byMethod[h.method] = (byMethod[h.method] ?? 0) + 1;
    if (h.beneficial) totalSaved += h.originalSize - h.compressedSize;
  }
  return {
    totalCompressions: history.length,
    avgRatio: history.length > 0 ? history.reduce((s, h) => s + h.ratio, 0) / history.length : 1,
    totalBytesSaved: totalSaved,
    beneficialRate: history.length > 0 ? history.filter(h => h.beneficial).length / history.length : 0,
    byMethod,
  };
}

export function resetCompressorState(): void { history.length = 0; deltaBaselines.clear(); }
