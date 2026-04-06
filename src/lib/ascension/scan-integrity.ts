/**
 * CMPSBL® Scan Integrity & Enterprise Quality Layer
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Enterprise-grade scanning requires more than pattern matching.
 * This module adds the missing quality layers:
 *
 * 1. File Integrity Verification — hash-based dedup + tamper detection
 * 2. Scan Result Caching — avoid re-scanning unchanged files
 * 3. Supply Chain Signals — detect dependency manifest patterns
 * 4. Scan Confidence Calibration — adaptive threshold tuning
 * 5. Cross-File Aggregation — correlate findings across a codebase
 *
 * © CMPSBL® — All rights reserved.
 */

// ═══════════════════════════════════════════════════════════════════════════════
// §1 — FILE INTEGRITY & DEDUPLICATION
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * FNV-1a hash for fast file content fingerprinting.
 * Used for dedup and cache keying — not for cryptographic purposes.
 */
export function fnv1aHash(content: string): string {
  let hash = 0x811c9dc5; // FNV offset basis
  for (let i = 0; i < content.length; i++) {
    hash ^= content.charCodeAt(i);
    hash = (hash * 0x01000193) >>> 0; // FNV prime, unsigned
  }
  return hash.toString(16).padStart(8, '0');
}

export interface FileFingerprint {
  hash: string;
  byteLength: number;
  lineCount: number;
  filename: string;
  scannedAt: number;
}

/**
 * Generate a fingerprint for a source file.
 * Used to detect duplicates and track scan coverage.
 */
export function fingerprintFile(code: string, filename: string): FileFingerprint {
  return {
    hash: fnv1aHash(code),
    byteLength: new TextEncoder().encode(code).length,
    lineCount: code.split('\n').length,
    filename,
    scannedAt: Date.now(),
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// §2 — SCAN RESULT CACHE
// ═══════════════════════════════════════════════════════════════════════════════

interface CachedScanResult {
  hash: string;
  result: unknown; // ScanResult — kept generic to avoid circular deps
  cachedAt: number;
  hitCount: number;
}

const MAX_CACHE_SIZE = 200;
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes
const _scanCache = new Map<string, CachedScanResult>();

/**
 * Check if a scan result exists in cache for this file hash.
 * Returns undefined if not cached or expired.
 */
export function getCachedScan(hash: string): unknown | undefined {
  const cached = _scanCache.get(hash);
  if (!cached) return undefined;

  if (Date.now() - cached.cachedAt > CACHE_TTL_MS) {
    _scanCache.delete(hash);
    return undefined;
  }

  cached.hitCount++;
  return cached.result;
}

/**
 * Store a scan result in cache.
 */
export function cacheScanResult(hash: string, result: unknown): void {
  if (_scanCache.size >= MAX_CACHE_SIZE) {
    // Evict oldest entry
    let oldestKey = '';
    let oldestTime = Infinity;
    for (const [key, val] of _scanCache) {
      if (val.cachedAt < oldestTime) {
        oldestTime = val.cachedAt;
        oldestKey = key;
      }
    }
    if (oldestKey) _scanCache.delete(oldestKey);
  }

  _scanCache.set(hash, {
    hash,
    result,
    cachedAt: Date.now(),
    hitCount: 0,
  });
}

/** Cache stats for observability */
export function getScanCacheStats(): {
  size: number;
  maxSize: number;
  totalHits: number;
} {
  let totalHits = 0;
  for (const v of _scanCache.values()) totalHits += v.hitCount;
  return { size: _scanCache.size, maxSize: MAX_CACHE_SIZE, totalHits };
}

/** Clear the scan cache */
export function clearScanCache(): void {
  _scanCache.clear();
}

// ═══════════════════════════════════════════════════════════════════════════════
// §3 — SUPPLY CHAIN / DEPENDENCY SIGNALS
// ═══════════════════════════════════════════════════════════════════════════════

export interface DependencySignal {
  /** Package manager detected */
  packageManager: string;
  /** Dependencies found */
  dependencies: string[];
  /** Whether lockfile is present (from filename hint) */
  hasLockfile: boolean;
  /** Security-relevant patterns detected */
  securitySignals: string[];
}

/** Detect dependency manifest patterns in source code */
export function detectDependencySignals(
  code: string,
  filename?: string,
): DependencySignal | null {
  const lower = code.toLowerCase();
  const fname = (filename ?? '').toLowerCase();

  // Package manager detection
  let packageManager = 'unknown';
  const deps: string[] = [];
  const securitySignals: string[] = [];

  // npm/yarn/pnpm (package.json)
  if (fname.includes('package.json') || /["']dependencies["']\s*:/.test(code)) {
    packageManager = 'npm';
    const depMatch = code.match(/"dependencies"\s*:\s*\{([^}]+)\}/);
    if (depMatch) {
      const entries = depMatch[1].match(/"([^"]+)"/g);
      if (entries) deps.push(...entries.filter((_, i) => i % 2 === 0).map(e => e.replace(/"/g, '')));
    }
  }

  // Python (requirements.txt, pyproject.toml, setup.py)
  if (fname.includes('requirements') || fname.includes('pyproject') || fname.includes('setup.py')) {
    packageManager = 'pip';
    const pyDeps = code.match(/^[\w-]+(?:==|>=|<=|~=|!=)/gm);
    if (pyDeps) deps.push(...pyDeps.map(d => d.replace(/[=<>!~]+$/, '')));
  }

  // Go (go.mod)
  if (fname.includes('go.mod') || /^module\s+\S+/m.test(code)) {
    packageManager = 'go';
    const goDeps = code.match(/^\t[\w./]+\s+v/gm);
    if (goDeps) deps.push(...goDeps.map(d => d.trim().split(/\s+/)[0]));
  }

  // Rust (Cargo.toml)
  if (fname.includes('cargo.toml') || /\[dependencies\]/i.test(code)) {
    packageManager = 'cargo';
    const rustDeps = code.match(/^[\w-]+\s*=/gm);
    if (rustDeps) deps.push(...rustDeps.map(d => d.replace(/\s*=$/, '')));
  }

  // Java (build.gradle, pom.xml)
  if (fname.includes('build.gradle') || fname.includes('pom.xml')) {
    packageManager = fname.includes('gradle') ? 'gradle' : 'maven';
  }

  // Security signals
  if (lower.includes('known_vulnerabilit') || lower.includes('cve-')) securitySignals.push('cve_reference');
  if (lower.includes('audit') || lower.includes('snyk') || lower.includes('dependabot')) securitySignals.push('dependency_audit');
  if (lower.includes('checksum') || lower.includes('integrity') || lower.includes('sha256')) securitySignals.push('integrity_check');
  if (lower.includes('pin') && (lower.includes('version') || lower.includes('hash'))) securitySignals.push('version_pinning');

  if (packageManager === 'unknown' && deps.length === 0) return null;

  const hasLockfile = /lock|\.lock|shrinkwrap/i.test(fname);

  return {
    packageManager,
    dependencies: [...new Set(deps)].slice(0, 100),
    hasLockfile,
    securitySignals,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// §4 — CROSS-FILE AGGREGATION
// ═══════════════════════════════════════════════════════════════════════════════

export interface AggregatedProfile {
  /** Total files scanned */
  fileCount: number;
  /** Unique file hashes (deduped count) */
  uniqueFiles: number;
  /** Dominant ecosystem across all files */
  dominantEcosystem: string;
  /** Capability coverage: archetype → best confidence across all files */
  capabilityCoverage: Record<string, number>;
  /** Capabilities present in 50%+ of files */
  pervasiveCapabilities: string[];
  /** Capabilities found in only 1 file */
  isolatedCapabilities: string[];
  /** Overall maturity score (0–100) */
  maturityScore: number;
}

/**
 * Aggregate scan results across multiple files into a codebase profile.
 * This is the enterprise-level view — individual file scans roll up
 * into a holistic capability map.
 */
export function aggregateProfile(
  results: Array<{
    filename: string;
    hash: string;
    ecosystem: string;
    matches: Array<{ archetypeId: string; confidence: number }>;
  }>,
): AggregatedProfile {
  const uniqueHashes = new Set(results.map(r => r.hash));
  const ecosystemCounts: Record<string, number> = {};
  const archetypeBest: Record<string, number> = {};
  const archetypeFileCount: Record<string, number> = {};

  for (const result of results) {
    ecosystemCounts[result.ecosystem] = (ecosystemCounts[result.ecosystem] ?? 0) + 1;

    for (const match of result.matches) {
      const existing = archetypeBest[match.archetypeId] ?? 0;
      archetypeBest[match.archetypeId] = Math.max(existing, match.confidence);
      archetypeFileCount[match.archetypeId] = (archetypeFileCount[match.archetypeId] ?? 0) + 1;
    }
  }

  // Dominant ecosystem
  let dominantEcosystem = 'unknown';
  let maxEcoCount = 0;
  for (const [eco, count] of Object.entries(ecosystemCounts)) {
    if (count > maxEcoCount) {
      maxEcoCount = count;
      dominantEcosystem = eco;
    }
  }

  // Pervasive vs isolated
  const halfFiles = results.length / 2;
  const pervasiveCapabilities = Object.entries(archetypeFileCount)
    .filter(([, count]) => count >= halfFiles)
    .map(([id]) => id);
  const isolatedCapabilities = Object.entries(archetypeFileCount)
    .filter(([, count]) => count === 1)
    .map(([id]) => id);

  // Maturity score: weighted average of best confidences across all archetypes
  const totalArchetypes = 25; // Known archetype count
  const coveredCount = Object.keys(archetypeBest).length;
  const avgConfidence = coveredCount > 0
    ? Object.values(archetypeBest).reduce((a, b) => a + b, 0) / coveredCount
    : 0;
  const coverageRatio = coveredCount / totalArchetypes;
  const maturityScore = Math.round((avgConfidence * 60 + coverageRatio * 40) * 100) / 100;

  return {
    fileCount: results.length,
    uniqueFiles: uniqueHashes.size,
    dominantEcosystem,
    capabilityCoverage: archetypeBest,
    pervasiveCapabilities,
    isolatedCapabilities,
    maturityScore,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// §5 — CONFIDENCE CALIBRATION
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Adaptive HIGH threshold.
 * Default: 0.40 (calibrated from 25-archetype corpus training).
 * Can be adjusted per-scan based on corpus density.
 */
export const DEFAULT_HIGH_THRESHOLD = 0.40;

/**
 * Compute an adjusted HIGH threshold based on corpus characteristics.
 * Denser corpora (more files per archetype) can afford a higher threshold.
 * Sparse corpora need a lower threshold to avoid false negatives.
 */
export function calibrateHighThreshold(
  filesPerArchetype: number,
  currentThreshold = DEFAULT_HIGH_THRESHOLD,
): number {
  if (filesPerArchetype >= 5) return Math.min(currentThreshold + 0.05, 0.55);
  if (filesPerArchetype >= 3) return currentThreshold;
  if (filesPerArchetype >= 2) return Math.max(currentThreshold - 0.03, 0.35);
  return Math.max(currentThreshold - 0.05, 0.30);
}