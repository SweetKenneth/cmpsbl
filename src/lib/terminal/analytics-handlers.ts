/**
 * Analytics Terminal Handlers — v11.5.2
 * SPARTA Epoch — analytics.* namespace for enterprise observability
 */

import { registerHandler } from './validate-registry';

export function registerAnalyticsHandlers(): void {
  // analytics.summary — Full telemetry snapshot
  registerHandler({
    command: 'analytics.summary',
    description: 'Full substrate telemetry snapshot with anomaly signals',
    handler: async () => {
      const { aggregateTelemetry } = await import('@/lib/substrate/telemetry-aggregator');
      const snapshot = await aggregateTelemetry();

      const lines = [
        `═══ ANALYTICS SUMMARY ═══`,
        `Timestamp: ${snapshot.timestamp}`,
        `Health Score: ${snapshot.overall.healthScore}/100`,
        `Active Modules: ${snapshot.overall.activeModules}`,
        `Error Rate: ${(snapshot.overall.errorRate).toFixed(2)}%`,
        `Last Activity: ${snapshot.overall.lastActivity || 'none'}`,
        ``,
        `── AI ──`,
        `  Calls: ${snapshot.ai.totalCalls} | Tokens: ${snapshot.ai.totalTokens.toLocaleString()}`,
        `  Success: ${(snapshot.ai.successRate * 100).toFixed(1)}% | Avg: ${snapshot.ai.avgResponseTime}ms | p95: ${snapshot.ai.p95ResponseTime}ms`,
        `  Top Provider: ${snapshot.ai.topProvider || 'none'}`,
        ``,
        `── ACCESS ──`,
        `  Requests: ${snapshot.access.totalRequests} | Unique Keys: ${snapshot.access.uniqueKeys}`,
        `  Cost: $${(snapshot.access.totalCostMillicents / 100000).toFixed(4)} | Trend: ${snapshot.access.costTrend}`,
        `  Top Module: ${snapshot.access.topModule || 'none'}`,
        ``,
        `── BRAIN ──`,
        `  Events: ${snapshot.brain.totalEvents} | Success: ${(snapshot.brain.successRate * 100).toFixed(1)}%`,
        `  Top Module: ${snapshot.brain.topModule || 'none'}`,
        `  Last Event: ${snapshot.brain.lastEventAt || 'none'}`,
        ``,
        `── IMMUNE ──`,
        `  Runs: ${snapshot.immune.totalRuns} | Repairs: ${snapshot.immune.repairSuccesses}`,
        `  Escalations: ${snapshot.immune.escalations} | Safe Fails: ${snapshot.immune.safeFailures}`,
        `  Repair Rate: ${(snapshot.immune.honestRepairRate * 100).toFixed(1)}%`,
        ``,
        `── ENCODE ──`,
        `  Claimed: ${snapshot.encode.escalationsClaimed} | Resolved: ${snapshot.encode.escalationsResolved}`,
        `  Resolution Rate: ${(snapshot.encode.resolutionRate * 100).toFixed(1)}%`,
      ];

      if (snapshot.anomalies.length > 0) {
        lines.push(``, `── ANOMALIES (${snapshot.anomalies.length}) ──`);
        for (const a of snapshot.anomalies) {
          lines.push(`  [${a.severity.toUpperCase()}] ${a.source}: ${a.message}`);
        }
      } else {
        lines.push(``, `✓ No anomalies detected`);
      }

      return { output: lines.join('\n'), status: 'success' as const };
    },
  });

  // analytics.trend — Historical health trend
  registerHandler({
    command: 'analytics.trend',
    description: 'Historical telemetry trend (last 24h)',
    handler: async () => {
      const { getSnapshotTrend } = await import('@/lib/substrate/telemetry-aggregator');
      const trend = await getSnapshotTrend(24, 24);

      if (trend.length === 0) {
        return { output: 'No snapshot history yet. Snapshots persist every 10 minutes.', status: 'success' as const };
      }

      const lines = [
        `═══ HEALTH TREND (${trend.length} snapshots, 24h) ═══`,
        `Time                    Health  Error%  Events  Modules`,
        `──────────────────────  ──────  ──────  ──────  ───────`,
      ];

      for (const t of trend) {
        const time = new Date(t.timestamp).toLocaleTimeString();
        lines.push(
          `${time.padEnd(22)}  ${String(t.healthScore).padStart(6)}  ${t.errorRate.toFixed(1).padStart(6)}  ${String(t.totalEvents).padStart(6)}  ${String(t.activeModules).padStart(7)}`
        );
      }

      // Trend direction
      if (trend.length >= 2) {
        const first = trend[0].healthScore;
        const last = trend[trend.length - 1].healthScore;
        const delta = last - first;
        const direction = delta > 5 ? '📈 Improving' : delta < -5 ? '📉 Degrading' : '➡️ Stable';
        lines.push(``, `Trend: ${direction} (${delta > 0 ? '+' : ''}${delta} points)`);
      }

      return { output: lines.join('\n'), status: 'success' as const };
    },
  });

  // analytics.correlate — Cross-source correlation analysis
  registerHandler({
    command: 'analytics.correlate',
    description: 'Cross-source correlation analysis (AI×Brain×Immune×Access)',
    handler: async () => {
      const { runCorrelationAnalysis } = await import('@/lib/analytics/cross-source-correlator');
      const report = await runCorrelationAnalysis(6);

      const lines = [
        `═══ CROSS-SOURCE CORRELATION ═══`,
        `Window: ${report.windowHours}h | Cascade Risk: ${report.cascadeRisk}%`,
        ``,
        `── Source Health ──`,
      ];

      for (const [source, health] of Object.entries(report.sourceHealth)) {
        const icon = health.status === 'healthy' ? '✓' : health.status === 'degraded' ? '⚠' : '✗';
        lines.push(`  ${icon} ${source.toUpperCase()}: ${health.status} (${health.metric.toFixed(0)}%)`);
      }

      if (report.signals.length > 0) {
        lines.push(``, `── Signals (${report.signals.length}) ──`);
        for (const s of report.signals) {
          lines.push(`  [${s.severity.toUpperCase()}] ${s.pattern}: ${s.description}`);
          lines.push(`    Sources: ${s.sources.join(', ')} | Confidence: ${(s.confidence * 100).toFixed(0)}%`);
        }
      } else {
        lines.push(``, `✓ No cross-source anomalies detected`);
      }

      return { output: lines.join('\n'), status: 'success' as const };
    },
  });

  // analytics.cost — Cost attribution summary
  registerHandler({
    command: 'analytics.cost',
    description: 'Per-module cost attribution and budget status',
    handler: async () => {
      const { getGlobalCostSummary } = await import('@/lib/substrate/cost-attribution');
      const summary = await getGlobalCostSummary();

      const lines = [
        `═══ COST ATTRIBUTION ═══`,
        `Today: $${(summary.total_cost_today_cents / 100).toFixed(2)} | Tokens: ${summary.total_tokens_today.toLocaleString()}`,
        ``,
        `Module          Tokens     Cost     Budget%  Trend`,
        `──────────────  ─────────  ───────  ───────  ─────`,
      ];

      const active = summary.modules.filter(m => m.tokens_today > 0);
      for (const m of active.sort((a, b) => b.tokens_today - a.tokens_today)) {
        lines.push(
          `${m.module.padEnd(14)}  ${String(m.tokens_today).padStart(9)}  $${(m.cost_today_cents / 100).toFixed(2).padStart(6)}  ${m.budget_pct_used.toFixed(0).padStart(6)}%  ${m.trending}`
        );
      }

      if (summary.alerts.length > 0) {
        lines.push(``, `── Alerts (${summary.alerts.length}) ──`);
        for (const a of summary.alerts) {
          lines.push(`  [${a.type}] ${a.message}`);
        }
      }

      return { output: lines.join('\n'), status: 'success' as const };
    },
  });

  // analytics.events — Recent admin analytics events
  registerHandler({
    command: 'analytics.events',
    description: 'Recent admin analytics events and page views',
    handler: async () => {
      const { getAnalyticsSummary } = await import('@/hooks/admin/useAdminAnalytics');
      const summary = await getAnalyticsSummary(24);

      const lines = [
        `═══ ADMIN ANALYTICS (24h) ═══`,
        `Page Views: ${summary.pageViews}`,
        `Unique Sessions: ${summary.uniqueSessions}`,
        `Errors: ${summary.errors}`,
      ];

      if (summary.topPages.length > 0) {
        lines.push(``, `── Top Pages ──`);
        for (const p of summary.topPages.slice(0, 5)) {
          lines.push(`  ${p.views.toString().padStart(4)} views  ${p.page}`);
        }
      }

      if (summary.topActions.length > 0) {
        lines.push(``, `── Top Actions ──`);
        for (const a of summary.topActions.slice(0, 5)) {
          lines.push(`  ${a.count.toString().padStart(4)}x  ${a.action}`);
        }
      }

      return { output: lines.join('\n'), status: 'success' as const };
    },
  });

  // analytics.anomalies — Current anomaly signals only
  registerHandler({
    command: 'analytics.anomalies',
    description: 'Active anomaly signals across all telemetry sources',
    handler: async () => {
      const { aggregateTelemetry } = await import('@/lib/substrate/telemetry-aggregator');
      const snapshot = await aggregateTelemetry();

      if (snapshot.anomalies.length === 0) {
        return { output: '✓ No anomalies detected across all sources.', status: 'success' as const };
      }

      const lines = [`═══ ACTIVE ANOMALIES (${snapshot.anomalies.length}) ═══`];
      for (const a of snapshot.anomalies) {
        lines.push(`[${a.severity.toUpperCase()}] ${a.source}/${a.metric}`);
        lines.push(`  ${a.message}`);
        lines.push(`  Expected: ${a.expected} | Actual: ${a.actual}`);
        lines.push(``);
      }

      return { output: lines.join('\n'), status: 'success' as const };
    },
  });
}
