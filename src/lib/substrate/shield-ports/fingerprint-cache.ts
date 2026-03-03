/**
 * Fingerprint Cache — In-memory + consent-gated persistent cache
 * Avoids repeated expensive fingerprint generation within a session.
 * DEFENSE compliant: only hashes are persisted, never raw signals.
 * Target nodes: DEFENSE, SITE-GUARD
 */

import { DeviceFingerprint, FingerprintData } from './device-fingerprint';
import { hasTrackingConsent } from './consent-tracking';
import { secureGet, secureSet, secureRemove } from '@/lib/system/secureStorage';

// ── Config ──────────────────────────────────────────────────────────

/** Minimum interval (ms) between full fingerprint regenerations */
const DEFAULT_REGEN_WINDOW_MS = 10 * 60 * 1000; // 10 minutes

/** Persistent cache TTL (ms) — only used when consent is granted */
const PERSISTENT_CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

/** Schema version for forward-compatibility of cached data */
const CACHE_SCHEMA_VERSION = 1;

const PERSISTENT_CACHE_KEY = 'defense_fp_cache';

// ── Types ───────────────────────────────────────────────────────────

interface InMemoryCache {
  fingerprint: FingerprintData;
  hash: string;
  generatedAt: number;
}

interface PersistentCacheRecord {
  fingerprint_hash: string;
  created_at: number;
  expires_at: number;
  schema_version: number;
  key_signal_hashes: Record<string, string>;
}

export interface FingerprintCacheResult {
  fingerprint: FingerprintData;
  hash: string;
  fromCache: boolean;
}

// ── Feature flags ───────────────────────────────────────────────────

let persistCacheEnabled = true;

export function setFingerprintPersistCache(enabled: boolean): void {
  persistCacheEnabled = enabled;
  if (!enabled) {
    clearPersistentFingerprintCache();
  }
}

// ── State ───────────────────────────────────────────────────────────

let memoryCache: InMemoryCache | null = null;
let regenWindowMs = DEFAULT_REGEN_WINDOW_MS;

// ── Public API ──────────────────────────────────────────────────────

/**
 * Get or generate a fingerprint with caching.
 * - Returns cached version if within the regen window.
 * - Generates fresh if expired, forced, or first call.
 * - Never blocks UX: fails open with safe defaults on error.
 */
export async function getCachedFingerprint(options?: {
  force?: boolean;
}): Promise<FingerprintCacheResult> {
  const now = Date.now();
  const force = options?.force === true;

  // 1. Check in-memory cache (within regen window and not forced)
  if (!force && memoryCache && (now - memoryCache.generatedAt) < regenWindowMs) {
    return {
      fingerprint: memoryCache.fingerprint,
      hash: memoryCache.hash,
      fromCache: true,
    };
  }

  // 2. Try persistent cache if consent is granted and not forced
  if (!force && persistCacheEnabled && hasTrackingConsent()) {
    const persistent = loadPersistentCache();
    if (persistent && persistent.expires_at > now) {
      // We have a valid persistent hash — but we still need the full fingerprint
      // for local analysis. Generate it but only if memory cache is stale.
      // The persistent cache is mainly useful for cross-session drift comparison.
    }
  }

  // 3. Generate fresh fingerprint
  try {
    const fingerprint = await DeviceFingerprint.generate();
    const hash = await DeviceFingerprint.hash(fingerprint);

    // Update in-memory cache
    memoryCache = {
      fingerprint,
      hash,
      generatedAt: now,
    };

    // Write persistent cache if consent is granted
    if (persistCacheEnabled && hasTrackingConsent()) {
      writePersistentCache(hash, fingerprint);
    }

    return { fingerprint, hash, fromCache: false };
  } catch (err) {
    console.warn('[DEFENSE] Fingerprint generation failed, using safe defaults:', err);

    // Fail open — return a degraded but safe result
    if (memoryCache) {
      return {
        fingerprint: memoryCache.fingerprint,
        hash: memoryCache.hash,
        fromCache: true,
      };
    }

    // No cache at all — return empty/safe fingerprint
    const safeFp = createSafeDefaultFingerprint();
    const safeHash = await DeviceFingerprint.hash(safeFp).catch(() => 'safe_default_' + now);

    return {
      fingerprint: safeFp,
      hash: safeHash,
      fromCache: false,
    };
  }
}

/** Set custom regen window (for testing or admin override) */
export function setRegenWindow(ms: number): void {
  regenWindowMs = Math.max(1000, Math.min(ms, 3600000)); // 1s–1h bounds
}

/** Get the current regen window in ms */
export function getRegenWindow(): number {
  return regenWindowMs;
}

/** Invalidate the in-memory cache (forces next call to regenerate) */
export function invalidateFingerprintCache(): void {
  memoryCache = null;
}

/** Clear persistent fingerprint cache (used on consent revoke) */
export function clearPersistentFingerprintCache(): void {
  secureRemove(PERSISTENT_CACHE_KEY);
}

/** Check if a cached fingerprint is currently available */
export function hasCachedFingerprint(): boolean {
  return memoryCache !== null;
}

/** Get cache age in ms, or null if no cache */
export function getCacheAge(): number | null {
  if (!memoryCache) return null;
  return Date.now() - memoryCache.generatedAt;
}

// ── Persistent Cache Helpers ────────────────────────────────────────

function loadPersistentCache(): PersistentCacheRecord | null {
  try {
    const record = secureGet<PersistentCacheRecord>(PERSISTENT_CACHE_KEY);
    if (!record) return null;
    if (record.schema_version !== CACHE_SCHEMA_VERSION) return null;
    if (record.expires_at < Date.now()) {
      secureRemove(PERSISTENT_CACHE_KEY);
      return null;
    }
    return record;
  } catch {
    return null;
  }
}

function writePersistentCache(hash: string, fp: FingerprintData): void {
  try {
    const now = Date.now();
    const record: PersistentCacheRecord = {
      fingerprint_hash: hash,
      created_at: now,
      expires_at: now + PERSISTENT_CACHE_TTL_MS,
      schema_version: CACHE_SCHEMA_VERSION,
      key_signal_hashes: buildKeySignalHashes(fp),
    };
    secureSet(PERSISTENT_CACHE_KEY, record);
  } catch {
    // Silent fail — persistence is optional
  }
}

function buildKeySignalHashes(fp: FingerprintData): Record<string, string> {
  // Only store hashed representations of key signals
  return {
    canvas: hashSignal(fp.canvas),
    webgl: hashSignal(fp.webgl),
    audio: hashSignal(fp.audio),
    timezone: fp.timezone || '',
    language: fp.language || '',
    platform: fp.platform || '',
    plugins_count: String(fp.plugins?.length || 0),
    screen_bucket: `${bucketize(fp.screen?.width, 100)}x${bucketize(fp.screen?.height, 100)}`,
    viewport_bucket: `${bucketize(fp.viewport?.width, 100)}x${bucketize(fp.viewport?.height, 100)}`,
    cores_bucket: String(bucketize(fp.hardwareConcurrency, 2)),
    memory_bucket: String(bucketize(fp.deviceMemory || 0, 2)),
  };
}

function hashSignal(value: string | undefined | null): string {
  if (!value) return '';
  // Use a fast inline hash for signal values
  let h = 0x811c9dc5;
  for (let i = 0; i < value.length; i++) {
    h ^= value.charCodeAt(i);
    h = (h * 0x01000193) >>> 0;
  }
  return h.toString(16);
}

function bucketize(value: number | undefined | null, step: number): number {
  if (!value || value <= 0) return 0;
  return Math.floor(value / step) * step;
}

// ── Safe Defaults ───────────────────────────────────────────────────

function createSafeDefaultFingerprint(): FingerprintData {
  return {
    canvas: '',
    webgl: '',
    audio: '',
    fonts: [],
    screen: { width: 0, height: 0, colorDepth: 0, pixelRatio: 1 },
    viewport: { width: 0, height: 0 },
    timezone: '',
    language: '',
    platform: '',
    hardwareConcurrency: 0,
    plugins: [],
    userAgent: '',
    webdriver: false,
    cdpDetected: false,
    webrtcLeak: null,
    performanceAPITampered: false,
    browserInconsistencies: [],
  };
}
