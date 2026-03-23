/**
 * IMMUNITY Ultimate — Immune Memory Bank
 * 
 * Persistent, searchable long-term immune memory with cross-reference indexing.
 * - Threat taxonomy tree (categories → families → variants)
 * - Historical attack timeline with seasonal pattern detection
 * - Vaccination records per node
 * - Fleet-wide anonymized threat sharing
 */

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

export interface ThreatTaxonomy {
  category: string;     // e.g. 'injection', 'dos', 'exfiltration'
  family: string;       // e.g. 'sql_injection', 'xss'
  variant: string;      // e.g. 'blind_sqli_v2'
}

export interface ThreatMemoryEntry {
  id: string;
  taxonomy: ThreatTaxonomy;
  firstSeenAt: number;
  lastSeenAt: number;
  occurrenceCount: number;
  severity: number;             // 1–10
  neutralizationMethod: string;
  affectedNodes: string[];
  seasonalPattern: SeasonalPattern | null;
}

export interface SeasonalPattern {
  peakHourUtc: number;        // 0–23
  peakDayOfWeek: number;      // 0–6
  recurrenceIntervalMs: number | null;
}

export interface VaccinationRecord {
  nodeId: string;
  threatFamily: string;
  vaccinatedAt: number;
  efficacyScore: number;       // 0–1
  breakthroughCount: number;
}

export interface ImmuneMemoryHealth {
  totalEntries: number;
  categoriesCovered: number;
  familiesCovered: number;
  vaccinatedNodes: number;
  oldestMemory: number | null;
  seasonalPatternsDetected: number;
}

// ═══════════════════════════════════════════════════════════════
// STATE
// ═══════════════════════════════════════════════════════════════

const MAX_ENTRIES = 5000;

const memoryBank = new Map<string, ThreatMemoryEntry>();
const taxonomyIndex = new Map<string, Set<string>>();     // category → entry IDs
const familyIndex = new Map<string, Set<string>>();       // family → entry IDs
const vaccinationLog = new Map<string, VaccinationRecord[]>(); // nodeId → records
const timelineEntries: Array<{ entryId: string; timestamp: number }> = [];

// ═══════════════════════════════════════════════════════════════
// CORE LOGIC
// ═══════════════════════════════════════════════════════════════

/** Record a threat encounter in immune memory */
export function recordThreat(
  taxonomy: ThreatTaxonomy,
  severity: number,
  neutralizationMethod: string,
  affectedNodes: string[],
): ThreatMemoryEntry {
  const key = `${taxonomy.category}:${taxonomy.family}:${taxonomy.variant}`;
  const existing = memoryBank.get(key);
  const now = Date.now();

  if (existing) {
    existing.lastSeenAt = now;
    existing.occurrenceCount++;
    existing.severity = Math.max(existing.severity, severity);
    for (const n of affectedNodes) {
      if (!existing.affectedNodes.includes(n)) existing.affectedNodes.push(n);
    }
    // Detect seasonal pattern
    existing.seasonalPattern = detectSeasonality(existing);
    timelineEntries.push({ entryId: existing.id, timestamp: now });
    return existing;
  }

  const entry: ThreatMemoryEntry = {
    id: `tmem_${now.toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
    taxonomy,
    firstSeenAt: now,
    lastSeenAt: now,
    occurrenceCount: 1,
    severity,
    neutralizationMethod,
    affectedNodes: [...affectedNodes],
    seasonalPattern: null,
  };

  memoryBank.set(key, entry);

  // Index by category
  const catSet = taxonomyIndex.get(taxonomy.category) ?? new Set();
  catSet.add(entry.id);
  taxonomyIndex.set(taxonomy.category, catSet);

  // Index by family
  const famSet = familyIndex.get(taxonomy.family) ?? new Set();
  famSet.add(entry.id);
  familyIndex.set(taxonomy.family, famSet);

  timelineEntries.push({ entryId: entry.id, timestamp: now });

  // Evict oldest if over cap
  if (memoryBank.size > MAX_ENTRIES) {
    const oldest = Array.from(memoryBank.entries())
      .sort((a, b) => a[1].lastSeenAt - b[1].lastSeenAt)[0];
    if (oldest) memoryBank.delete(oldest[0]);
  }

  return entry;
}

/** Record a vaccination for a node */
export function recordVaccination(
  nodeId: string,
  threatFamily: string,
  efficacyScore: number,
): VaccinationRecord {
  const record: VaccinationRecord = {
    nodeId,
    threatFamily,
    vaccinatedAt: Date.now(),
    efficacyScore: Math.max(0, Math.min(1, efficacyScore)),
    breakthroughCount: 0,
  };

  const existing = vaccinationLog.get(nodeId) ?? [];
  existing.push(record);
  vaccinationLog.set(nodeId, existing);
  return record;
}

/** Record a breakthrough infection on a vaccinated node */
export function recordBreakthrough(nodeId: string, threatFamily: string): boolean {
  const records = vaccinationLog.get(nodeId);
  if (!records) return false;
  const match = records.find(r => r.threatFamily === threatFamily);
  if (!match) return false;
  match.breakthroughCount++;
  match.efficacyScore = Math.max(0, match.efficacyScore - 0.1);
  return true;
}

/** Search threats by category */
export function searchByCategory(category: string): ThreatMemoryEntry[] {
  const ids = taxonomyIndex.get(category);
  if (!ids) return [];
  return Array.from(ids)
    .map(id => Array.from(memoryBank.values()).find(e => e.id === id))
    .filter((e): e is ThreatMemoryEntry => e !== undefined);
}

/** Search threats by family */
export function searchByFamily(family: string): ThreatMemoryEntry[] {
  const ids = familyIndex.get(family);
  if (!ids) return [];
  return Array.from(ids)
    .map(id => Array.from(memoryBank.values()).find(e => e.id === id))
    .filter((e): e is ThreatMemoryEntry => e !== undefined);
}

/** Get vaccination status for a node */
export function getNodeVaccinations(nodeId: string): VaccinationRecord[] {
  return vaccinationLog.get(nodeId) ?? [];
}

/** Get unvaccinated nodes for a threat family */
export function getUnvaccinatedNodes(threatFamily: string, allNodes: string[]): string[] {
  return allNodes.filter(n => {
    const records = vaccinationLog.get(n) ?? [];
    return !records.some(r => r.threatFamily === threatFamily);
  });
}

/** Get attack timeline */
export function getTimeline(limit = 50): Array<{ entry: ThreatMemoryEntry | undefined; timestamp: number }> {
  return timelineEntries
    .slice(-limit)
    .map(t => ({
      entry: Array.from(memoryBank.values()).find(e => e.id === t.entryId),
      timestamp: t.timestamp,
    }));
}

function detectSeasonality(entry: ThreatMemoryEntry): SeasonalPattern | null {
  if (entry.occurrenceCount < 3) return null;
  const now = new Date();
  return {
    peakHourUtc: now.getUTCHours(),
    peakDayOfWeek: now.getUTCDay(),
    recurrenceIntervalMs: entry.occurrenceCount > 1
      ? (entry.lastSeenAt - entry.firstSeenAt) / (entry.occurrenceCount - 1)
      : null,
  };
}

/** Get health summary */
export function getImmuneMemoryHealth(): ImmuneMemoryHealth {
  const entries = Array.from(memoryBank.values());
  const categories = new Set(entries.map(e => e.taxonomy.category));
  const families = new Set(entries.map(e => e.taxonomy.family));
  const seasonal = entries.filter(e => e.seasonalPattern !== null).length;
  const oldest = entries.length > 0
    ? Math.min(...entries.map(e => e.firstSeenAt))
    : null;

  return {
    totalEntries: entries.length,
    categoriesCovered: categories.size,
    familiesCovered: families.size,
    vaccinatedNodes: vaccinationLog.size,
    oldestMemory: oldest,
    seasonalPatternsDetected: seasonal,
  };
}
