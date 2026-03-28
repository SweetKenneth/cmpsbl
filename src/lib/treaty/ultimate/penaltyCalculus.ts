/**
 * TREATY Ultimate — Penalty Calculus Engine
 * Compound penalty computation with time-weighted accumulation,
 * grace periods, and penalty cap enforcement.
 */

export interface PenaltyLedgerEntry {
  id: string;
  contractId: string;
  partyId: string;
  penaltyType: 'flat' | 'percentage' | 'compound' | 'tiered';
  baseAmount: number;
  accruedAmount: number;
  gracePeriodEndsAt: number;
  accrualRate: number; // daily compound rate
  capAmount: number;
  isActive: boolean;
  triggeredAt: number;
  lastAccruedAt: number;
}

export interface PenaltySummary {
  contractId: string;
  totalAccrued: number;
  activeEntries: number;
  cappedEntries: number;
  inGracePeriod: number;
}

const MAX_ENTRIES = 1000;
const ledger: PenaltyLedgerEntry[] = [];
let entryCounter = 0;

export function createPenaltyEntry(
  contractId: string,
  partyId: string,
  baseAmount: number,
  opts?: {
    penaltyType?: PenaltyLedgerEntry['penaltyType'];
    accrualRate?: number;
    gracePeriodDays?: number;
    capMultiplier?: number;
  }
): PenaltyLedgerEntry {
  const now = Date.now();
  const graceDays = opts?.gracePeriodDays ?? 7;
  const capMultiplier = opts?.capMultiplier ?? 3;

  const entry: PenaltyLedgerEntry = {
    id: `penalty-${++entryCounter}`,
    contractId,
    partyId,
    penaltyType: opts?.penaltyType ?? 'compound',
    baseAmount,
    accruedAmount: 0,
    gracePeriodEndsAt: now + graceDays * 86400_000,
    accrualRate: opts?.accrualRate ?? 0.01, // 1% daily default
    capAmount: baseAmount * capMultiplier,
    isActive: true,
    triggeredAt: now,
    lastAccruedAt: now,
  };

  if (ledger.length >= MAX_ENTRIES) ledger.shift();
  ledger.push(entry);
  return entry;
}

export function accruePenalties(): number {
  const now = Date.now();
  let totalAccrued = 0;

  for (const entry of ledger) {
    if (!entry.isActive) continue;
    if (now < entry.gracePeriodEndsAt) continue;
    if (entry.accruedAmount >= entry.capAmount) continue;

    const daysSinceLastAccrual = (now - entry.lastAccruedAt) / 86400_000;
    if (daysSinceLastAccrual < 0.5) continue; // min half-day accrual interval

    let accrual: number;
    switch (entry.penaltyType) {
      case 'compound':
        accrual = (entry.baseAmount + entry.accruedAmount) * entry.accrualRate * daysSinceLastAccrual;
        break;
      case 'flat':
        accrual = entry.baseAmount * entry.accrualRate * daysSinceLastAccrual;
        break;
      case 'percentage':
        accrual = entry.baseAmount * entry.accrualRate;
        break;
      case 'tiered': {
        // Tiered: rate increases with accrual level
        const tier = entry.accruedAmount / entry.capAmount;
        const tierRate = entry.accrualRate * (1 + tier);
        accrual = entry.baseAmount * tierRate * daysSinceLastAccrual;
        break;
      }
    }

    entry.accruedAmount = Math.min(entry.accruedAmount + accrual, entry.capAmount);
    entry.lastAccruedAt = now;
    totalAccrued += accrual;
  }

  return Math.round(totalAccrued * 100) / 100;
}

export function waivePenalty(penaltyId: string): boolean {
  const entry = ledger.find(e => e.id === penaltyId);
  if (!entry) return false;
  entry.isActive = false;
  entry.accruedAmount = 0;
  return true;
}

export function getPenaltySummary(contractId: string): PenaltySummary {
  const entries = ledger.filter(e => e.contractId === contractId);
  const now = Date.now();
  return {
    contractId,
    totalAccrued: Math.round(entries.reduce((s, e) => s + e.accruedAmount, 0) * 100) / 100,
    activeEntries: entries.filter(e => e.isActive).length,
    cappedEntries: entries.filter(e => e.accruedAmount >= e.capAmount).length,
    inGracePeriod: entries.filter(e => e.isActive && now < e.gracePeriodEndsAt).length,
  };
}

export function getLedger(): PenaltyLedgerEntry[] { return [...ledger]; }
export function getPenaltyStats() {
  const active = ledger.filter(e => e.isActive);
  return {
    totalEntries: ledger.length,
    activeEntries: active.length,
    totalAccrued: Math.round(active.reduce((s, e) => s + e.accruedAmount, 0) * 100) / 100,
    cappedCount: active.filter(e => e.accruedAmount >= e.capAmount).length,
  };
}
