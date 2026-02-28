/**
 * INTEL Aggregation Pipeline
 * 
 * Collects signals from across the system, normalizes them into IntelSignals,
 * deduplicates, and converts to IntelCards for the Founder-only INTEL Panel.
 */

import type {
  IntelSignal,
  IntelCard,
  IntelExportReport,
  IntelCategory,
  TopicMasteryHighlight,
} from '../types';
import { getCrownJewelStats } from '@/lib/capabilities/crown-jewel-release-gate';

// ═══════════════════════════════════════════════════════════════════════════════
// IN-MEMORY SIGNAL STORE (session-scoped, survives route changes)
// ═══════════════════════════════════════════════════════════════════════════════

const MAX_SIGNALS = 500;
const signals: IntelSignal[] = [];
const fingerprintMap = new Map<string, { count: number; first_seen: string; last_seen: string; signal_ids: string[] }>();

function generateId(): string {
  return `intel-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function computeFingerprint(signal: IntelSignal): string {
  if (signal.fingerprint) return signal.fingerprint;
  return `${signal.source}:${signal.category}:${signal.headline}`;
}

// ═══════════════════════════════════════════════════════════════════════════════
// SIGNAL INGESTION
// ═══════════════════════════════════════════════════════════════════════════════

function ingest(signal: Omit<IntelSignal, 'id'>): IntelSignal {
  const full: IntelSignal = { ...signal, id: generateId() };
  
  // Dedupe
  const fp = computeFingerprint(full);
  const existing = fingerprintMap.get(fp);
  if (existing) {
    existing.count++;
    existing.last_seen = full.timestamp;
    existing.signal_ids.push(full.id);
  } else {
    fingerprintMap.set(fp, {
      count: 1,
      first_seen: full.timestamp,
      last_seen: full.timestamp,
      signal_ids: [full.id],
    });
  }
  
  signals.push(full);
  
  // Evict oldest if over limit
  if (signals.length > MAX_SIGNALS) {
    signals.splice(0, signals.length - MAX_SIGNALS);
  }
  
  return full;
}

// ═══════════════════════════════════════════════════════════════════════════════
// SIGNAL → CARD CONVERSION
// ═══════════════════════════════════════════════════════════════════════════════

function signalToCard(signal: IntelSignal): IntelCard {
  const fp = computeFingerprint(signal);
  const meta = fingerprintMap.get(fp);
  
  return {
    id: `card-${signal.id}`,
    signal_ids: meta?.signal_ids ?? [signal.id],
    category: signal.category,
    severity: signal.severity,
    headline: signal.headline,
    what_changed: signal.detail,
    why_it_matters: inferImportance(signal),
    suggested_next_step: signal.suggested_action ?? 'No action required.',
    details_json: signal.data ?? {},
    first_seen: meta?.first_seen ?? signal.timestamp,
    last_seen: meta?.last_seen ?? signal.timestamp,
    occurrence_count: meta?.count ?? 1,
    source: signal.source,
  };
}

function inferImportance(signal: IntelSignal): string {
  if (signal.severity === 'critical') return 'This requires immediate attention to prevent service degradation.';
  if (signal.severity === 'warn') return 'This may impact reliability if left unaddressed.';
  return 'Informational — no immediate impact.';
}

// ═══════════════════════════════════════════════════════════════════════════════
// CARD RETRIEVAL (deduplicated)
// ═══════════════════════════════════════════════════════════════════════════════

function getCards(options?: {
  category?: IntelCategory;
  severity?: IntelSignal['severity'];
  limit?: number;
}): IntelCard[] {
  const seen = new Set<string>();
  const cards: IntelCard[] = [];
  
  // Process newest first
  for (let i = signals.length - 1; i >= 0; i--) {
    const s = signals[i];
    if (options?.category && s.category !== options.category) continue;
    if (options?.severity && s.severity !== options.severity) continue;
    
    const fp = computeFingerprint(s);
    if (seen.has(fp)) continue;
    seen.add(fp);
    
    cards.push(signalToCard(s));
    if (options?.limit && cards.length >= options.limit) break;
  }
  
  return cards;
}

function getCriticals(limit = 10): IntelCard[] {
  return getCards({ severity: 'critical', limit });
}

function getSummary() {
  let critical = 0, warn = 0, info = 0;
  const catCounts = new Map<IntelCategory, number>();
  
  for (const s of signals) {
    if (s.severity === 'critical') critical++;
    else if (s.severity === 'warn') warn++;
    else info++;
    catCounts.set(s.category, (catCounts.get(s.category) ?? 0) + 1);
  }
  
  const top_categories = [...catCounts.entries()]
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
  
  return { total_signals: signals.length, critical_count: critical, warn_count: warn, info_count: info, top_categories };
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXPORT REPORT
// ═══════════════════════════════════════════════════════════════════════════════

function generateExportReport(
  topicMastery: TopicMasteryHighlight[] = [],
  diligence?: { last_run?: string; passed: number; minor: number; critical: number; total: number },
  engineerStats?: { active_findings: number; pending_proposals: number; resolved_this_period: number },
): IntelExportReport {
  const summary = getSummary();
  const jewels = getCrownJewelStats();
  
  return {
    schema_version: '1.0',
    generated_at: new Date().toISOString(),
    system_id: 'cmpsbl-substrate',
    summary,
    top_cards: getCards({ limit: 20 }),
    recent_criticals: getCriticals(10),
    topic_mastery: topicMastery,
    crown_jewels: {
      released: jewels.released,
      reserved: jewels.gatekept,
      total_packs: jewels.packCount,
    },
    diligence: diligence ?? { passed: 0, minor: 0, critical: 0, total: 0 },
    engineer: engineerStats ?? { active_findings: 0, pending_proposals: 0, resolved_this_period: 0 },
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// PUBLIC API
// ═══════════════════════════════════════════════════════════════════════════════

export const intelAggregator = {
  ingest,
  getCards,
  getCriticals,
  getSummary,
  generateExportReport,
  getSignalCount: () => signals.length,
  clear: () => { signals.length = 0; fingerprintMap.clear(); },
};
