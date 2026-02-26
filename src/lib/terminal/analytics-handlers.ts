/**
 * Analytics Terminal Handlers — v11.5.2
 * SPARTA Epoch — analytics.* namespace for enterprise observability
 */

import { registerHandler } from './validate-registry';

export function registerAnalyticsHandlers(): void {
  registerHandler('analytics.summary', async () => {
    const { aggregateTelemetry } = await import('@/lib/substrate/telemetry-aggregator');
    const snapshot = await aggregateTelemetry();
    const lines = [
      `═══ ANALYTICS SUMMARY ═══`,
      `Health: ${snapshot.overall.healthScore}/100 | Modules: ${snapshot.overall.activeModules} | Error: ${snapshot.overall.errorRate.toFixed(2)}%`,
      `AI: ${snapshot.ai.totalCalls} calls, ${(snapshot.ai.successRate*100).toFixed(1)}% success, p95=${snapshot.ai.p95ResponseTime}ms`,
      `Access: ${snapshot.access.totalRequests} reqs, $${(snapshot.access.totalCostMillicents/100000).toFixed(4)}, trend=${snapshot.access.costTrend}`,
      `Brain: ${snapshot.brain.totalEvents} events, ${(snapshot.brain.successRate*100).toFixed(1)}% success`,
      `Immune: ${snapshot.immune.totalRuns} runs, ${snapshot.immune.escalations} escalations, ${(snapshot.immune.honestRepairRate*100).toFixed(1)}% repair`,
      `ENCODE: ${snapshot.encode.escalationsClaimed} claimed, ${(snapshot.encode.resolutionRate*100).toFixed(1)}% resolved`,
    ];
    if (snapshot.anomalies.length > 0) {
      lines.push(``, `Anomalies (${snapshot.anomalies.length}):`);
      for (const a of snapshot.anomalies) lines.push(`  [${a.severity.toUpperCase()}] ${a.source}: ${a.message}`);
    } else {
      lines.push(`✓ No anomalies`);
    }
    return lines.join('\n');
  });

  registerHandler('analytics.trend', async () => {
    const { getSnapshotTrend } = await import('@/lib/substrate/telemetry-aggregator');
    const trend = await getSnapshotTrend(24, 24);
    if (trend.length === 0) return 'No snapshot history yet. Snapshots persist every 10 minutes.';
    const lines = [`═══ HEALTH TREND (${trend.length} snapshots) ═══`];
    for (const t of trend) {
      lines.push(`${new Date(t.timestamp).toLocaleTimeString()}  health=${t.healthScore}  error=${t.errorRate.toFixed(1)}%  events=${t.totalEvents}`);
    }
    if (trend.length >= 2) {
      const delta = trend[trend.length-1].healthScore - trend[0].healthScore;
      lines.push(`Trend: ${delta > 5 ? '📈 Improving' : delta < -5 ? '📉 Degrading' : '➡️ Stable'} (${delta > 0 ? '+' : ''}${delta})`);
    }
    return lines.join('\n');
  });

  registerHandler('analytics.correlate', async () => {
    const { runCorrelationAnalysis } = await import('@/lib/analytics/cross-source-correlator');
    const report = await runCorrelationAnalysis(6);
    const lines = [`═══ CROSS-SOURCE CORRELATION ═══`, `Cascade Risk: ${report.cascadeRisk}%`];
    for (const [src, h] of Object.entries(report.sourceHealth)) {
      lines.push(`  ${h.status === 'healthy' ? '✓' : '⚠'} ${src.toUpperCase()}: ${h.status} (${h.metric.toFixed(0)}%)`);
    }
    if (report.signals.length > 0) {
      lines.push(``, `Signals (${report.signals.length}):`);
      for (const s of report.signals) lines.push(`  [${s.severity.toUpperCase()}] ${s.pattern}: ${s.description}`);
    } else {
      lines.push(`✓ No cross-source anomalies`);
    }
    return lines.join('\n');
  });

  registerHandler('analytics.cost', async () => {
    const { getGlobalCostSummary } = await import('@/lib/substrate/cost-attribution');
    const summary = await getGlobalCostSummary();
    const lines = [`═══ COST ATTRIBUTION ═══`, `Today: $${(summary.total_cost_today_cents/100).toFixed(2)} | Tokens: ${summary.total_tokens_today.toLocaleString()}`];
    const active = summary.modules.filter(m => m.tokens_today > 0).sort((a, b) => b.tokens_today - a.tokens_today);
    for (const m of active) lines.push(`  ${m.module}: ${m.tokens_today} tokens, $${(m.cost_today_cents/100).toFixed(2)}, ${m.budget_pct_used.toFixed(0)}% budget, ${m.trending}`);
    if (summary.alerts.length > 0) for (const a of summary.alerts) lines.push(`  ⚠ ${a.message}`);
    return lines.join('\n');
  });

  registerHandler('analytics.events', async () => {
    const { getAnalyticsSummary } = await import('@/hooks/admin/useAdminAnalytics');
    const summary = await getAnalyticsSummary(24);
    const lines = [`═══ ADMIN ANALYTICS (24h) ═══`, `Views: ${summary.pageViews} | Sessions: ${summary.uniqueSessions} | Errors: ${summary.errors}`];
    if (summary.topPages.length > 0) { lines.push(`Top pages:`); for (const p of summary.topPages.slice(0,5)) lines.push(`  ${p.views} views — ${p.page}`); }
    return lines.join('\n');
  });

  registerHandler('analytics.anomalies', async () => {
    const { aggregateTelemetry } = await import('@/lib/substrate/telemetry-aggregator');
    const snapshot = await aggregateTelemetry();
    if (snapshot.anomalies.length === 0) return '✓ No anomalies detected across all sources.';
    const lines = [`═══ ACTIVE ANOMALIES (${snapshot.anomalies.length}) ═══`];
    for (const a of snapshot.anomalies) lines.push(`[${a.severity.toUpperCase()}] ${a.source}/${a.metric}: ${a.message} (expected=${a.expected}, actual=${a.actual})`);
    return lines.join('\n');
  });
}
