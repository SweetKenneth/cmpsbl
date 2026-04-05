/**
 * AUTO-SENTINEL v1.0.0 — Orchestrator
 * Autonomous Codebase Health Guardian
 *
 * Composed from 6 Crown Jewel patterns + 4 Primitives.
 * Zero dependency on Convex Core.
 *
 * Pipeline: SCAN → TRIAGE → GOVERNANCE → EXECUTE → REPORT → RECEIPT
 */

import type {
  SentinelConfig,
  SentinelReport,
  DetectedIssue,
  ScanContext,
} from './types';
import { DEFAULT_SENTINEL_CONFIG } from './types';
import { runScan } from './scanner';
import { triageAll } from './triage';
import { evaluateAll } from './governance-gate';
import { executeAll } from './executor';
import { generateReport } from './reporter';
import { ReceiptChain } from './receipts';

// ── Sentinel Engine ────────────────────────────────────────────────────

export class AutoSentinel {
  private config: SentinelConfig;
  private receiptChain: ReceiptChain;
  private runCount = 0;
  private lastFindings: DetectedIssue[] = [];
  private reports: SentinelReport[] = [];
  private intervalId: ReturnType<typeof setInterval> | null = null;

  constructor(config: Partial<SentinelConfig> = {}) {
    this.config = { ...DEFAULT_SENTINEL_CONFIG, ...config };
    this.receiptChain = new ReceiptChain();
  }

  // ── Single Run ─────────────────────────────────────────────────────

  async run(context: ScanContext): Promise<SentinelReport> {
    const startedAt = new Date().toISOString();
    this.runCount++;

    // Phase 1: SCAN
    const issues = runScan(
      context,
      this.config.enabledCategories,
      this.config.maxIssuesPerScan,
    );

    if (this.config.enableReceipts) {
      await this.receiptChain.append('scan', { categories: this.config.enabledCategories }, { issueCount: issues.length });
    }

    // Phase 2: TRIAGE
    const triageResults = triageAll(issues, this.lastFindings);

    if (this.config.enableReceipts) {
      await this.receiptChain.append('triage', { issueCount: issues.length }, { autoFixable: triageResults.filter(t => t.autoFixable).length });
    }

    // Phase 3: GOVERNANCE GATE
    const decisions = evaluateAll(
      issues,
      triageResults,
      this.config.governancePolicy,
    );

    if (this.config.enableReceipts) {
      await this.receiptChain.append('governance', { issueCount: issues.length }, {
        approved: decisions.filter(d => d.verdict === 'approve').length,
        denied: decisions.filter(d => d.verdict === 'deny').length,
        review: decisions.filter(d => d.verdict === 'review_required').length,
      });
    }

    // Phase 4: EXECUTE (immune-wrapped)
    let fixes = [];
    if (this.config.enableAutoFix) {
      fixes = executeAll(issues, triageResults, decisions);

      if (this.config.enableReceipts) {
        await this.receiptChain.append('fix', {
          attempted: fixes.length,
        }, {
          applied: fixes.filter(f => f.outcome === 'applied').length,
          failed: fixes.filter(f => f.outcome === 'failed').length,
        });
      }
    }

    // Phase 5: REPORT
    const report = generateReport(
      this.runCount,
      startedAt,
      issues,
      triageResults,
      decisions,
      fixes,
      this.receiptChain.getHead(),
      this.lastFindings,
    );

    if (this.config.enableReceipts) {
      await this.receiptChain.append('report', { runNumber: this.runCount }, { status: report.status });
    }

    // Store for next run's recurrence detection
    this.lastFindings = issues;
    this.reports.push(report);

    // BEACON health signal
    if (this.config.beaconHealthSignal) {
      this.emitHealthSignal(report);
    }

    return report;
  }

  // ── Scheduled Cadence ──────────────────────────────────────────────

  startSchedule(contextProvider: () => ScanContext): void {
    if (this.intervalId) return;

    this.intervalId = setInterval(async () => {
      try {
        const context = contextProvider();
        await this.run(context);
      } catch (err) {
        // Sentinel must never crash on schedule — degrade gracefully
        const errorMsg = err instanceof Error ? err.message : String(err);
        this.emitHealthSignal({
          status: 'failed',
          error: errorMsg,
        } as unknown as SentinelReport);
      }
    }, this.config.cadenceMs);
  }

  stopSchedule(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  // ── Accessors ──────────────────────────────────────────────────────

  getReports(): SentinelReport[] {
    return [...this.reports];
  }

  getLatestReport(): SentinelReport | null {
    return this.reports.length > 0 ? this.reports[this.reports.length - 1] : null;
  }

  getReceiptChain(): ReceiptChain {
    return this.receiptChain;
  }

  getRunCount(): number {
    return this.runCount;
  }

  getConfig(): SentinelConfig {
    return { ...this.config };
  }

  updateConfig(partial: Partial<SentinelConfig>): void {
    this.config = { ...this.config, ...partial };
  }

  // ── BEACON Signal ──────────────────────────────────────────────────

  private emitHealthSignal(report: SentinelReport): void {
    // BEACON pattern: structured health signal for external monitoring
    const signal = {
      product: 'auto-sentinel',
      version: this.config.version,
      runNumber: this.runCount,
      status: report.status,
      issuesFound: report.totalIssuesFound ?? 0,
      fixesApplied: report.fixesApplied ?? 0,
      preventedCount: report.preventedIssues?.length ?? 0,
      receiptChainLength: this.receiptChain.getLength(),
      timestamp: new Date().toISOString(),
    };

    // Emit as custom event for external consumers
    if (typeof globalThis !== 'undefined' && typeof CustomEvent !== 'undefined') {
      globalThis.dispatchEvent(new CustomEvent('sentinel:health', { detail: signal }));
    }
  }
}
