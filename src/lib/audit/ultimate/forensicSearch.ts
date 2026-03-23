/**
 * AUDIT — Audit Trail Forensic Search
 * Full-text and structured search across receipt chain with filters.
 * Returns ranked results with contextual evidence windows.
 * @module audit/forensicSearch
 * @version 9.0.0 — Sentinel
 */

import type { AuditReceipt, ReceiptType } from '../receipts';

// ── Types ──────────────────────────────────────────────────────────────────

export interface ForensicSearchQuery {
  text?: string;
  actor?: string;
  type?: ReceiptType;
  startTime?: number;
  endTime?: number;
  metadataKey?: string;
  metadataValue?: string;
  limit?: number;
}

export interface ForensicSearchResult {
  receipt: AuditReceipt;
  relevanceScore: number;
  context: {
    before: AuditReceipt | null;
    after: AuditReceipt | null;
  };
  matchReasons: string[];
}

export interface ForensicSearchResponse {
  query: ForensicSearchQuery;
  results: ForensicSearchResult[];
  totalMatches: number;
  searchDurationMs: number;
}

// ── Core ───────────────────────────────────────────────────────────────────

export function forensicSearch(
  receipts: AuditReceipt[],
  query: ForensicSearchQuery,
): ForensicSearchResponse {
  const start = performance.now();
  const limit = query.limit ?? 50;
  const scored: ForensicSearchResult[] = [];

  for (let i = 0; i < receipts.length; i++) {
    const r = receipts[i];
    const matchReasons: string[] = [];
    let score = 0;

    // Actor filter
    if (query.actor) {
      if (r.actor === query.actor) {
        score += 3;
        matchReasons.push(`actor=${query.actor}`);
      } else continue;
    }

    // Type filter
    if (query.type) {
      if (r.type === query.type) {
        score += 3;
        matchReasons.push(`type=${query.type}`);
      } else continue;
    }

    // Time range filter
    const rTime = new Date(r.timestamp).getTime();
    if (query.startTime && rTime < query.startTime) continue;
    if (query.endTime && rTime > query.endTime) continue;
    if (query.startTime || query.endTime) {
      score += 1;
      matchReasons.push('within time range');
    }

    // Metadata key/value filter
    if (query.metadataKey) {
      const val = r.metadata[query.metadataKey];
      if (val === undefined) continue;
      score += 2;
      matchReasons.push(`metadata.${query.metadataKey} present`);
      if (query.metadataValue && String(val) === query.metadataValue) {
        score += 2;
        matchReasons.push(`metadata.${query.metadataKey}=${query.metadataValue}`);
      }
    }

    // Full-text search
    if (query.text) {
      const haystack = JSON.stringify(r).toLowerCase();
      const needle = query.text.toLowerCase();
      if (haystack.includes(needle)) {
        score += 2;
        matchReasons.push(`text match: "${query.text}"`);
      } else continue;
    }

    // If no filters matched at all, skip
    if (matchReasons.length === 0 && (query.actor || query.type || query.text || query.metadataKey)) continue;

    scored.push({
      receipt: r,
      relevanceScore: score,
      context: {
        before: i > 0 ? receipts[i - 1] : null,
        after: i < receipts.length - 1 ? receipts[i + 1] : null,
      },
      matchReasons,
    });
  }

  scored.sort((a, b) => b.relevanceScore - a.relevanceScore);

  return {
    query,
    results: scored.slice(0, limit),
    totalMatches: scored.length,
    searchDurationMs: Math.round((performance.now() - start) * 100) / 100,
  };
}
