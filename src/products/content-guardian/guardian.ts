/**
 * CONTENT-GUARDIAN v1.0.0 — Orchestrator
 * Autonomous Content Quality & Compliance Engine
 *
 * Pipeline: SCAN → QUALITY → TRIAGE → GOVERNANCE → REMEDIATE → REPORT → RECEIPT
 *
 * Media primitives: CRITIC, PALETTE, COMPLY, METRIC, PERSONA, STORYARC
 * Spine primitives: GOVERNANCE, CONSCIENCE, BEACON, COMPASS, AUDIT, SHADOW
 */

import type {
  ContentGuardianConfig,
  ContentGuardianReport,
  DetectedContentIssue,
  ContentContext,
} from './types';
import { DEFAULT_CONTENT_GUARDIAN_CONFIG } from './types';
import { runScan } from './scanner';
import { scoreAll } from './quality-scorer';
import { triageAll } from './triage';
import { evaluateAll } from './governance-gate';
import { executeAll } from './remediator';
import { generateReport } from './reporter';
import { ReceiptChain } from './receipts';

export class ContentGuardian {
  private config: ContentGuardianConfig;
  private receiptChain: ReceiptChain;
  private runCount = 0;
  private lastFindings: DetectedContentIssue[] = [];
  private reports: ContentGuardianReport[] = [];
  private intervalId: ReturnType<typeof setInterval> | null = null;

  constructor(config: Partial<ContentGuardianConfig> = {}) {
    this.config = { ...DEFAULT_CONTENT_GUARDIAN_CONFIG, ...config };
    this.receiptChain = new ReceiptChain();
  }

  async run(context: ContentContext): Promise<ContentGuardianReport> {
    const startedAt = new Date().toISOString();
    this.runCount++;

    // Phase 1: SCAN (PALETTE + COMPLY + PERSONA + STORYARC)
    const issues = runScan(context, this.config.enabledCategories, this.config.maxIssuesPerScan);

    if (this.config.enableReceipts) {
      await this.receiptChain.append('scan', { categories: this.config.enabledCategories }, { issueCount: issues.length });
    }

    // Phase 2: QUALITY SCORING (CRITIC)
    const qualityScores = scoreAll(
      context.content,
      context.brandProfile,
      context.audienceSegments,
      context.narrativeArc,
    );

    if (this.config.enableReceipts) {
      const avgScore = qualityScores.length > 0
        ? Math.round(qualityScores.reduce((s, q) => s + q.overallScore, 0) / qualityScores.length)
        : 0;
      await this.receiptChain.append('quality', { contentCount: context.content.length }, { averageScore: avgScore });
    }

    // Phase 3: TRIAGE (COMPASS)
    const triageResults = triageAll(issues, this.lastFindings);

    if (this.config.enableReceipts) {
      await this.receiptChain.append('triage', { issueCount: issues.length }, { autoRemediable: triageResults.filter(t => t.autoRemediable).length });
    }

    // Phase 4: GOVERNANCE GATE (GOVERNANCE + CONSCIENCE)
    const decisions = evaluateAll(issues, triageResults, this.config.governancePolicy);

    if (this.config.enableReceipts) {
      await this.receiptChain.append('governance', { issueCount: issues.length }, {
        approved: decisions.filter(d => d.verdict === 'approve').length,
        denied: decisions.filter(d => d.verdict === 'deny').length,
        review: decisions.filter(d => d.verdict === 'review_required').length,
      });
    }

    // Phase 5: REMEDIATE (SHADOW)
    let remediations: ReturnType<typeof executeAll> = [];
    if (this.config.enableAutoCorrect) {
      remediations = executeAll(issues, triageResults, decisions);

      if (this.config.enableReceipts) {
        await this.receiptChain.append('remediate', { attempted: remediations.length }, {
          corrected: remediations.filter(r => r.outcome === 'corrected').length,
          blocked: remediations.filter(r => r.outcome === 'blocked').length,
          failed: remediations.filter(r => r.outcome === 'failed').length,
        });
      }
    }

    // Phase 6: REPORT (BEACON + METRIC)
    const report = generateReport(
      this.runCount, startedAt, issues, triageResults, decisions,
      remediations, qualityScores, this.receiptChain.getHead(), this.lastFindings,
    );

    if (this.config.enableReceipts) {
      await this.receiptChain.append('report', { runNumber: this.runCount }, {
        status: report.status,
        healthScore: report.averageQualityScore,
        brandCompliance: report.brandComplianceRate,
      });
    }

    this.lastFindings = issues;
    this.reports.push(report);

    // BEACON health signal
    if (this.config.beaconHealthSignal) {
      this.emitHealthSignal(report);
    }

    return report;
  }

  startSchedule(contextProvider: () => ContentContext): void {
    if (this.intervalId) return;
    this.intervalId = setInterval(async () => {
      try {
        await this.run(contextProvider());
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        this.emitHealthSignal({ status: 'failed', error: errorMsg } as unknown as ContentGuardianReport);
      }
    }, this.config.cadenceMs);
  }

  stopSchedule(): void {
    if (this.intervalId) { clearInterval(this.intervalId); this.intervalId = null; }
  }

  getReports(): ContentGuardianReport[] { return [...this.reports]; }
  getLatestReport(): ContentGuardianReport | null { return this.reports.at(-1) ?? null; }
  getReceiptChain(): ReceiptChain { return this.receiptChain; }
  getRunCount(): number { return this.runCount; }
  getConfig(): ContentGuardianConfig { return { ...this.config }; }
  updateConfig(partial: Partial<ContentGuardianConfig>): void { this.config = { ...this.config, ...partial }; }

  private emitHealthSignal(report: ContentGuardianReport): void {
    const signal = {
      product: 'content-guardian',
      version: this.config.version,
      runNumber: this.runCount,
      status: report.status,
      contentScanned: report.totalContentScanned ?? 0,
      issuesFound: report.totalIssuesFound ?? 0,
      remediationsApplied: report.remediationsApplied ?? 0,
      brandComplianceRate: report.brandComplianceRate ?? 100,
      averageQualityScore: report.averageQualityScore ?? 0,
      receiptChainLength: this.receiptChain.getLength(),
      timestamp: new Date().toISOString(),
    };

    if (typeof globalThis !== 'undefined' && typeof CustomEvent !== 'undefined') {
      globalThis.dispatchEvent(new CustomEvent('content-guardian:health', { detail: signal }));
    }
  }
}
