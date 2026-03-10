/**
 * S-Tier 110 — Billing Reconciliation Engine
 * ID: S-136 | CJPI: 89 | Module: ECONOMY
 * 
 * Automated billing reconciliation with discrepancy detection and correction.
 */

export interface BillingRecord {
  id: string;
  customerId: string;
  amount: number; // cents
  currency: string;
  description: string;
  source: 'usage' | 'subscription' | 'addon' | 'credit';
  period: string; // YYYY-MM
  timestamp: string;
}

export interface ReconciliationEntry {
  usageRecord: BillingRecord | null;
  billingRecord: BillingRecord | null;
  status: 'matched' | 'discrepancy' | 'missing_usage' | 'missing_billing' | 'amount_mismatch';
  discrepancyAmount: number;
}

export interface ReconciliationReport {
  period: string;
  totalUsageAmount: number;
  totalBilledAmount: number;
  discrepancyAmount: number;
  entries: ReconciliationEntry[];
  matchRate: number;
  status: 'clean' | 'discrepancies_found';
  generatedAt: string;
}

export class BillingReconciliationEngine {
  private reports: ReconciliationReport[] = [];

  reconcile(
    usageRecords: BillingRecord[],
    billingRecords: BillingRecord[],
    period: string
  ): ReconciliationReport {
    const entries: ReconciliationEntry[] = [];
    const matchedBilling = new Set<string>();

    // Match usage to billing
    for (const usage of usageRecords) {
      const match = billingRecords.find(b =>
        b.customerId === usage.customerId &&
        b.period === usage.period &&
        !matchedBilling.has(b.id)
      );

      if (match) {
        matchedBilling.add(match.id);
        const diff = Math.abs(match.amount - usage.amount);
        entries.push({
          usageRecord: usage,
          billingRecord: match,
          status: diff === 0 ? 'matched' : 'amount_mismatch',
          discrepancyAmount: match.amount - usage.amount,
        });
      } else {
        entries.push({
          usageRecord: usage,
          billingRecord: null,
          status: 'missing_billing',
          discrepancyAmount: -usage.amount,
        });
      }
    }

    // Find unmatched billing records
    for (const billing of billingRecords) {
      if (!matchedBilling.has(billing.id)) {
        entries.push({
          usageRecord: null,
          billingRecord: billing,
          status: 'missing_usage',
          discrepancyAmount: billing.amount,
        });
      }
    }

    const totalUsage = usageRecords.reduce((s, r) => s + r.amount, 0);
    const totalBilled = billingRecords.reduce((s, r) => s + r.amount, 0);
    const matched = entries.filter(e => e.status === 'matched').length;

    const report: ReconciliationReport = {
      period,
      totalUsageAmount: totalUsage,
      totalBilledAmount: totalBilled,
      discrepancyAmount: totalBilled - totalUsage,
      entries,
      matchRate: entries.length > 0 ? matched / entries.length : 1,
      status: entries.every(e => e.status === 'matched') ? 'clean' : 'discrepancies_found',
      generatedAt: new Date().toISOString(),
    };

    this.reports.push(report);
    return report;
  }

  getReports(): ReconciliationReport[] { return [...this.reports]; }

  getDiscrepancies(period?: string): ReconciliationEntry[] {
    const filtered = period ? this.reports.filter(r => r.period === period) : this.reports;
    return filtered.flatMap(r => r.entries.filter(e => e.status !== 'matched'));
  }
}
