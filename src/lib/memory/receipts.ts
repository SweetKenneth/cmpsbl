/**
 * Memory Tier Move Receipt Logger
 * Persists tier transition receipts for auditability
 */

import type { TierMoveReceipt } from './tiering';

const receiptLog: TierMoveReceipt[] = [];
const MAX_LOG_SIZE = 1000;

/** Record a tier move receipt */
export function recordReceipt(receipt: TierMoveReceipt): void {
  receiptLog.push(receipt);
  if (receiptLog.length > MAX_LOG_SIZE) {
    receiptLog.splice(0, receiptLog.length - MAX_LOG_SIZE);
  }
}

/** Get recent receipts */
export function getReceipts(limit = 50): TierMoveReceipt[] {
  return receiptLog.slice(-limit);
}

/** Get receipts for a specific memory */
export function getReceiptsForMemory(memoryId: string): TierMoveReceipt[] {
  return receiptLog.filter(r => r.memory_id === memoryId);
}

/** Get receipt statistics */
export function getReceiptStats(): {
  total: number;
  by_reason: Record<string, number>;
  by_direction: { promotions: number; demotions: number };
} {
  const tierRank = { hot: 3, warm: 2, cold: 1, glacier: 0 } as Record<string, number>;
  const by_reason: Record<string, number> = {};
  let promotions = 0;
  let demotions = 0;

  for (const r of receiptLog) {
    by_reason[r.reason_code] = (by_reason[r.reason_code] ?? 0) + 1;
    if (tierRank[r.after_tier] > tierRank[r.before_tier]) promotions++;
    else demotions++;
  }

  return { total: receiptLog.length, by_reason, by_direction: { promotions, demotions } };
}

/** Clear all receipts (for testing) */
export function clearReceipts(): void {
  receiptLog.length = 0;
}
