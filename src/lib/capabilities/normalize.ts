/**
 * Capability Output Normalizer
 * Output Shaping for Consistent Responses
 */

export interface NormalizedOutput<T = unknown> {
  data: T;
  confidence: number;
  metadata?: Record<string, unknown>;
}

/**
 * Normalize capability output to a consistent shape
 */
export function normalizeOutput<T = unknown>(raw: unknown): NormalizedOutput<T> {
  // Handle null/undefined
  if (raw === null || raw === undefined) {
    return {
      data: null as T,
      confidence: 0,
    };
  }
  
  // Already normalized
  if (isNormalizedOutput(raw)) {
    return raw as NormalizedOutput<T>;
  }
  
  // Has success/data shape (common edge function pattern)
  if (typeof raw === 'object' && raw !== null) {
    const obj = raw as Record<string, unknown>;
    
    // Pattern: { success: true, data: ... }
    if ('success' in obj && 'data' in obj) {
      return {
        data: obj.data as T,
        confidence: obj.success === true ? 1.0 : 0,
        metadata: extractMetadata(obj),
      };
    }
    
    // Pattern: { result: ..., confidence: ... }
    if ('result' in obj) {
      return {
        data: obj.result as T,
        confidence: typeof obj.confidence === 'number' ? obj.confidence : 1.0,
        metadata: extractMetadata(obj),
      };
    }
    
    // Pattern: { error: ... }
    if ('error' in obj && !('data' in obj)) {
      return {
        data: null as T,
        confidence: 0,
        metadata: { error: obj.error },
      };
    }
  }
  
  // Raw data, wrap as-is
  return {
    data: raw as T,
    confidence: 1.0,
  };
}

/**
 * Check if value is already normalized
 */
function isNormalizedOutput(value: unknown): boolean {
  if (typeof value !== 'object' || value === null) return false;
  const obj = value as Record<string, unknown>;
  return 'data' in obj && 'confidence' in obj && typeof obj.confidence === 'number';
}

/**
 * Extract metadata from raw response
 */
function extractMetadata(obj: Record<string, unknown>): Record<string, unknown> | undefined {
  const metadata: Record<string, unknown> = {};
  
  const metadataKeys = ['provider', 'timestamp', 'version', 'source', 'executionMs'];
  
  for (const key of metadataKeys) {
    if (key in obj) {
      metadata[key] = obj[key];
    }
  }
  
  return Object.keys(metadata).length > 0 ? metadata : undefined;
}

/**
 * Flatten nested data structures
 */
export function flattenData<T>(data: T, maxDepth = 3): T {
  if (maxDepth <= 0 || typeof data !== 'object' || data === null) {
    return data;
  }
  
  if (Array.isArray(data)) {
    return data.map(item => flattenData(item, maxDepth - 1)) as T;
  }
  
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data)) {
    result[key] = flattenData(value, maxDepth - 1);
  }
  
  return result as T;
}
