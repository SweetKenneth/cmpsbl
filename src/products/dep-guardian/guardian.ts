/**
 * DEP-GUARDIAN v1.0.0 — Orchestrator
 * Autonomous Dependency Health Monitor
 *
 * Composed from 4 Crown Jewel patterns + 9 Primitives.
 * Zero dependency on Convex Core.
 *
 * Pipeline: SCAN → TRIAGE → GOVERNANCE → UPGRADE → REPORT → RECEIPT
 *
 * Primitives exercised:
 *   ENGINEER  — drift detection, upgrade planning
 *   EVOLUTION — patch generation, version mutation
 *   SOVEREIGN — license compliance, policy classification
 *   COMPASS   — severity ordering, priority ranking
 *   DEFENSE   — vulnerability scanning
 *   CONSCIENCE— ethical preflight, supply-chain trust
 *   BEACON    — health signal emission
 *   SHADOW    — pre/post snapshot diffing
 *   REFLEX    — circuit breaker on cascading failures
 */

import type {
  GuardianConfig,
  GuardianReport,
  DetectedDepIssue,
  DependencyContext,
} from './types';
import { DEFAULT_GUARDIAN_CONFIG } from './types';
import { runScan } from './scanner';
import { triageAll } from './triage';
import { evaluateAll } from './governance-gate';
import { executeAll } from './upgrader';
import { generateReport } from './reporter';
import { ReceiptChain } from './receipts';

// ── Guardian Engine ────────────────────────────────────────────────────

export class DepGuardian {
  private config: GuardianConfig;
  private receiptChain: ReceiptChain;
  private runCount = 0;
  private lastFindings: DetectedDepIssue[] = [];
  private reports: GuardianReport[] = [];
  private intervalId: ReturnType<typeof setInterval> | null = null;

  constructor(config: Partial<GuardianConfig> = {}) {
    this.config = { ...DEFAULT_GUARDIAN_CONFIG, ...config };
    this.receiptChain = new ReceiptChain();
  }

  // ── Single Run ─────────────────────────────────────────────────────

  async run(context: DependencyContext): Promise<GuardianReport> {
    const startedAt = new Date().toISOString();
    this.runCount++;

    // Phase 1: SCAN (DEFENSE + ENGINEER + SOVEREIGN)
    const issues = runScan(
      context,
      this.config.enabledCategories,
      this.config.maxIssuesPerScan,
    );

    if (this.config.enableReceipts) {
      await this.receiptChain.append('scan', { categories: this.config.enabledCategories }, { issueCount: issues.length });
    }

    // Phase 2: TRIAGE (COMPASS)
    const triageResults = triageAll(issues, this.lastFindings);

    if (this.config.enableReceipts) {
      await this.receiptChain.append('triage', { issueCount: issues.length }, { autoUpgradeable: triageResults.filter(t => t.autoUpgradeable).length });
    }

    // Phase 3: GOVERNANCE GATE (SOVEREIGN + CONSCIENCE)
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

    // Phase 4: UPGRADE (EVOLUTION + SHADOW + REFLEX)
    let upgrades: ReturnType<typeof executeAll> = [];
    if (this.config.enableAutoUpgrade) {
      upgrades = executeAll(
        issues,
        triageResults,
        decisions,
        this.config.circuitBreakerThreshold,
        this.config.circuitBreakerCooldownMs,
      );

      if (this.config.enableReceipts) {
        await this.receiptChain.append('upgrade', {
          attempted: upgrades.length,
        }, {
          applied: upgrades.filter(u => u.outcome === 'applied').length,
          failed: upgrades.filter(u => u.outcome === 'failed').length,
          circuitBroken: upgrades.filter(u => u.circuitBreakerTripped).length,
        });
      }
    }

    // Phase 5: REPORT (BEACON)
    const report = generateReport(
      this.runCount,
      startedAt,
      context.dependencies,
      issues,
      triageResults,
      decisions,
      upgrades,
      this.receiptChain.getHead(),
      this.lastFindings,
      this.config.governancePolicy.blockedLicenses,
    );

    if (this.config.enableReceipts) {
      await this.receiptChain.append('report', { runNumber: this.runCount }, { status: report.status, healthScore: report.healthScore });
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

  startSchedule(contextProvider: () => DependencyContext): void {
    if (this.intervalId) return;

    this.intervalId = setInterval(async () => {
      try {
        const context = contextProvider();
        await this.run(context);
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        this.emitHealthSignal({
          status: 'failed',
          error: errorMsg,
        } as unknown as GuardianReport);
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

  getReports(): GuardianReport[] {
    return [...this.reports];
  }

  getLatestReport(): GuardianReport | null {
    return this.reports.length > 0 ? this.reports[this.reports.length - 1] : null;
  }

  getReceiptChain(): ReceiptChain {
    return this.receiptChain;
  }

  getRunCount(): number {
    return this.runCount;
  }

  getConfig(): GuardianConfig {
    return { ...this.config };
  }

  updateConfig(partial: Partial<GuardianConfig>): void {
    this.config = { ...this.config, ...partial };
  }

  // ── BEACON Signal ──────────────────────────────────────────────────

  private emitHealthSignal(report: GuardianReport): void {
    const signal = {
      product: 'dep-guardian',
      version: this.config.version,
      runNumber: this.runCount,
      status: report.status,
      totalDeps: report.totalDeps ?? 0,
      issuesFound: report.totalIssuesFound ?? 0,
      upgradesApplied: report.upgradesApplied ?? 0,
      healthScore: report.healthScore ?? 0,
      licenseCompliance: report.licenseCompliance?.complianceRate ?? 100,
      preventedCount: report.preventedIssues?.length ?? 0,
      receiptChainLength: this.receiptChain.getLength(),
      timestamp: new Date().toISOString(),
    };

    if (typeof globalThis !== 'undefined' && typeof CustomEvent !== 'undefined') {
      globalThis.dispatchEvent(new CustomEvent('guardian:health', { detail: signal }));
    }
  }
}
