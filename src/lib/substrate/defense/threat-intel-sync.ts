/**
 * DEFENSE — Threat Intelligence Sync v1.0.0
 * Live feed ingestion from external abuse databases and CVE feeds.
 *
 * Features:
 *  - IOC (Indicators of Compromise) registry
 *  - CVE tracking and matching
 *  - Abuse IP database integration
 *  - Threat feed aggregation
 *  - Auto-expiration of stale indicators
 */

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export type IOCType = 'ip' | 'domain' | 'url' | 'hash' | 'email' | 'cve' | 'user_agent' | 'pattern';
export type ThreatLevel = 'critical' | 'high' | 'medium' | 'low';
export type FeedSource = 'manual' | 'abuse_db' | 'cve_feed' | 'internal' | 'community' | 'vendor';

export interface IOC {
  readonly id: string;
  readonly type: IOCType;
  readonly value: string;
  readonly valueHash: number;
  readonly threatLevel: ThreatLevel;
  readonly source: FeedSource;
  readonly description: string;
  readonly firstSeen: number;
  readonly lastUpdated: number;
  readonly expiresAt: number;
  readonly hitCount: number;
  readonly tags: readonly string[];
  readonly active: boolean;
}

export interface CVEEntry {
  readonly id: string;       // CVE-YYYY-NNNNN
  readonly severity: ThreatLevel;
  readonly description: string;
  readonly affectedComponents: readonly string[];
  readonly mitigated: boolean;
  readonly publishedAt: number;
  readonly addedAt: number;
}

export interface ThreatFeed {
  readonly id: string;
  readonly name: string;
  readonly source: FeedSource;
  readonly lastSync: number | null;
  readonly iocCount: number;
  readonly enabled: boolean;
  readonly syncIntervalMs: number;
}

export interface ThreatIntelMatch {
  readonly ioc: IOC;
  readonly matchedValue: string;
  readonly confidence: number;
}

export interface ThreatIntelStats {
  readonly totalIOCs: number;
  readonly activeIOCs: number;
  readonly iocsByType: Record<string, number>;
  readonly iocsByLevel: Record<string, number>;
  readonly totalCVEs: number;
  readonly feedCount: number;
  readonly lastSync: number | null;
  readonly totalHits: number;
}

// ═══════════════════════════════════════════════════════════════════════════════
// STATE
// ═══════════════════════════════════════════════════════════════════════════════

const MAX_IOCS = 10000;
const MAX_CVES = 500;
const DEFAULT_TTL_MS = 7 * 24 * 60 * 60_000; // 7 days

const iocRegistry = new Map<string, IOC & { hitCount: number }>();
const iocHashIndex = new Map<number, string[]>(); // hash → IOC ids
const cveRegistry = new Map<string, CVEEntry>();
const feedRegistry = new Map<string, ThreatFeed>();
let iocSeq = 0;

function fnv1a(input: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = (hash * 0x01000193) >>> 0;
  }
  return hash;
}

// ═══════════════════════════════════════════════════════════════════════════════
// IOC MANAGEMENT
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Add an Indicator of Compromise.
 */
export function addIOC(
  type: IOCType,
  value: string,
  threatLevel: ThreatLevel,
  source: FeedSource = 'manual',
  description = '',
  tags: string[] = [],
  ttlMs = DEFAULT_TTL_MS,
): IOC {
  const now = Date.now();
  const hash = fnv1a(value.toLowerCase());
  const id = `IOC-${(++iocSeq).toString(36).padStart(5, '0')}`;

  // Check for duplicate by hash
  const existing = iocHashIndex.get(hash);
  if (existing) {
    for (const existingId of existing) {
      const ioc = iocRegistry.get(existingId);
      if (ioc && ioc.type === type) {
        // Update existing
        const updated: IOC & { hitCount: number } = {
          ...ioc,
          threatLevel: severityMax(ioc.threatLevel, threatLevel),
          lastUpdated: now,
          expiresAt: now + ttlMs,
          hitCount: ioc.hitCount,
        };
        iocRegistry.set(existingId, updated);
        return updated;
      }
    }
  }

  const ioc: IOC & { hitCount: number } = {
    id,
    type,
    value: value.slice(0, 200),
    valueHash: hash,
    threatLevel,
    source,
    description: description.slice(0, 200),
    firstSeen: now,
    lastUpdated: now,
    expiresAt: now + ttlMs,
    hitCount: 0,
    tags: Object.freeze(tags),
    active: true,
  };

  iocRegistry.set(id, ioc);
  const hashList = iocHashIndex.get(hash) || [];
  hashList.push(id);
  iocHashIndex.set(hash, hashList);

  // Evict expired
  if (iocRegistry.size > MAX_IOCS) {
    evictExpiredIOCs();
  }

  return ioc;
}

/**
 * Bulk add IOCs from a feed.
 */
export function ingestFeed(
  feedId: string,
  iocs: Array<{ type: IOCType; value: string; threatLevel: ThreatLevel; description?: string; tags?: string[] }>,
  source: FeedSource = 'community',
): number {
  let added = 0;
  for (const ioc of iocs) {
    addIOC(ioc.type, ioc.value, ioc.threatLevel, source, ioc.description, ioc.tags);
    added++;
  }

  // Update feed sync time
  const feed = feedRegistry.get(feedId);
  if (feed) {
    feedRegistry.set(feedId, { ...feed, lastSync: Date.now(), iocCount: feed.iocCount + added });
  }

  return added;
}

/**
 * Register a threat feed.
 */
export function registerFeed(
  id: string,
  name: string,
  source: FeedSource,
  syncIntervalMs = 60 * 60_000,
): ThreatFeed {
  const feed: ThreatFeed = {
    id,
    name,
    source,
    lastSync: null,
    iocCount: 0,
    enabled: true,
    syncIntervalMs,
  };
  feedRegistry.set(id, feed);
  return feed;
}

// ═══════════════════════════════════════════════════════════════════════════════
// MATCHING
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Check an input against the IOC registry.
 */
export function matchIOCs(input: string, type?: IOCType): readonly ThreatIntelMatch[] {
  const matches: ThreatIntelMatch[] = [];
  if (!input || input.length < 3) return matches;

  const normalized = input.toLowerCase();
  const inputHash = fnv1a(normalized);

  // Direct hash match
  const directIds = iocHashIndex.get(inputHash);
  if (directIds) {
    for (const id of directIds) {
      const ioc = iocRegistry.get(id);
      if (ioc && ioc.active && (!type || ioc.type === type) && Date.now() < ioc.expiresAt) {
        ioc.hitCount++;
        matches.push({ ioc, matchedValue: input, confidence: 1.0 });
      }
    }
  }

  // Substring scan for IPs, domains, URLs
  if (matches.length === 0) {
    for (const ioc of iocRegistry.values()) {
      if (!ioc.active || Date.now() >= ioc.expiresAt) continue;
      if (type && ioc.type !== type) continue;
      if ((ioc.type === 'ip' || ioc.type === 'domain' || ioc.type === 'url') &&
          normalized.includes(ioc.value.toLowerCase())) {
        ioc.hitCount++;
        matches.push({ ioc, matchedValue: ioc.value, confidence: 0.9 });
      }
    }
  }

  return Object.freeze(matches.slice(0, 20));
}

/**
 * Check an IP against known bad IPs.
 */
export function checkIP(ip: string): ThreatIntelMatch | null {
  const matches = matchIOCs(ip, 'ip');
  return matches[0] || null;
}

// ═══════════════════════════════════════════════════════════════════════════════
// CVE TRACKING
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Add a CVE entry.
 */
export function addCVE(
  id: string,
  severity: ThreatLevel,
  description: string,
  affectedComponents: string[] = [],
): CVEEntry {
  const entry: CVEEntry = Object.freeze({
    id,
    severity,
    description: description.slice(0, 300),
    affectedComponents: Object.freeze(affectedComponents),
    mitigated: false,
    publishedAt: Date.now(),
    addedAt: Date.now(),
  });
  cveRegistry.set(id, entry);
  if (cveRegistry.size > MAX_CVES) {
    const oldest = cveRegistry.keys().next().value;
    if (oldest) cveRegistry.delete(oldest);
  }
  return entry;
}

/**
 * Mark a CVE as mitigated.
 */
export function mitigateCVE(cveId: string): boolean {
  const entry = cveRegistry.get(cveId);
  if (!entry) return false;
  cveRegistry.set(cveId, { ...entry, mitigated: true });
  return true;
}

/**
 * Get unmitigated CVEs.
 */
export function getActiveCVEs(): readonly CVEEntry[] {
  return Object.freeze(
    Array.from(cveRegistry.values())
      .filter(c => !c.mitigated)
      .sort((a, b) => {
        const order: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 };
        return (order[a.severity] || 4) - (order[b.severity] || 4);
      })
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAINTENANCE
// ═══════════════════════════════════════════════════════════════════════════════

function evictExpiredIOCs(): void {
  const now = Date.now();
  for (const [id, ioc] of iocRegistry) {
    if (now >= ioc.expiresAt) {
      iocRegistry.delete(id);
      const hashList = iocHashIndex.get(ioc.valueHash);
      if (hashList) {
        const filtered = hashList.filter(x => x !== id);
        if (filtered.length > 0) iocHashIndex.set(ioc.valueHash, filtered);
        else iocHashIndex.delete(ioc.valueHash);
      }
    }
  }
}

function severityMax(a: ThreatLevel, b: ThreatLevel): ThreatLevel {
  const order: Record<ThreatLevel, number> = { critical: 3, high: 2, medium: 1, low: 0 };
  return order[a] >= order[b] ? a : b;
}

/**
 * Get threat intelligence stats.
 */
export function getThreatIntelStats(): ThreatIntelStats {
  const byType: Record<string, number> = {};
  const byLevel: Record<string, number> = {};
  let active = 0;
  let totalHits = 0;
  const now = Date.now();

  for (const ioc of iocRegistry.values()) {
    byType[ioc.type] = (byType[ioc.type] || 0) + 1;
    byLevel[ioc.threatLevel] = (byLevel[ioc.threatLevel] || 0) + 1;
    if (ioc.active && now < ioc.expiresAt) active++;
    totalHits += ioc.hitCount;
  }

  let lastSync: number | null = null;
  for (const feed of feedRegistry.values()) {
    if (feed.lastSync && (!lastSync || feed.lastSync > lastSync)) lastSync = feed.lastSync;
  }

  return {
    totalIOCs: iocRegistry.size,
    activeIOCs: active,
    iocsByType: byType,
    iocsByLevel: byLevel,
    totalCVEs: cveRegistry.size,
    feedCount: feedRegistry.size,
    lastSync,
    totalHits,
  };
}
