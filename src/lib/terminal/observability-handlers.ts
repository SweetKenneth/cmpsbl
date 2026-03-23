/**
 * Observability Terminal Handlers
 * `obs.*` command namespace
 * 
 * Fills the gap: Telemetry, bridges, latency, DLQ, and error hotspots
 * had no terminal exposure. Now fully queryable.
 * 
 * Commands:
 *   obs.summary          — Full observability overview
 *   obs.bridges          — Bridge invocation activity & success rates
 *   obs.latency          — Cross-node handoff latency (avg, p95)
 *   obs.hotspots         — Error hotspot detection across nodes
 *   obs.telemetry        — Telemetry engine state & recent events
 *   obs.telemetry.errors — Recent error/critical telemetry events
 *   obs.telemetry.gov    — Governance blocks & overrides
 *   obs.dlq              — Dead letter queue depth & oldest items
 *   obs.health           — Composite observability health score
 *   obs.help             — Command reference
 */

import { registerHandler } from './validate-registry';
import { getMetric } from '@/stores/publicMetricsStore';

/**
 * Register all observability terminal commands
 */
export function registerObservabilityHandlers(): void {

  // ═══ OBS.SUMMARY — Full overview ═══
  registerHandler('obs.summary', async () => {
    const { observabilityMonitor } = await import('@/lib/substrate/observability-monitor');
    const summary = await observabilityMonitor.getSummary();
    return {
      success: true,
      data: summary,
      formatted: [
        '┌─────────────────────────────────────────────┐',
        '│       OBSERVABILITY SUMMARY                 │',
         `│       ${getMetric('epoch')}`.padEnd(46) + '│',
        '└─────────────────────────────────────────────┘',
        '',
        `  Health Score:      ${summary.healthScore}%`,
        `  Telemetry Events:  ${summary.totalTelemetryEvents}`,
        `  Error Rate:        ${summary.errorRate}%`,
        `  Bridge Calls:      ${summary.bridgeInvocations}`,
        `  Avg Bridge Lat:    ${summary.avgBridgeLatencyMs}ms`,
        `  Active Bridges:    ${summary.activeBridges.length}`,
        `  Error Hotspots:    ${summary.errorHotspots.length}`,
        `  Latency Paths:     ${summary.crossNodeLatencies.length}`,
        `  DLQ Depth:         ${summary.dlqDepth}`,
        '',
        '  Use obs.bridges / obs.latency / obs.hotspots for details.',
      ],
    };
  });

  // ═══ OBS.BRIDGES — Bridge activity ═══
  registerHandler('obs.bridges', async () => {
    const { observabilityMonitor } = await import('@/lib/substrate/observability-monitor');
    const activity = observabilityMonitor.getBridgeActivity(15);
    
    const lines = [
      '┌─────────────────────────────────────────────┐',
      '│       INTER-NODE BRIDGE ACTIVITY             │',
      '└─────────────────────────────────────────────┘',
      '',
    ];

    const bridges = Object.entries(activity.summary);
    if (bridges.length === 0) {
      lines.push('  No bridge invocations recorded yet.');
      lines.push('  Bridges fire on: health→governance escalations, confidence→evolution signals,');
      lines.push('  event→audit persistence, mesh→capability routing, synergy→memory recording.');
    } else {
      lines.push('  Bridge                  │ Calls │ Avg(ms) │ Success');
      lines.push('  ────────────────────────┼───────┼─────────┼────────');
      for (const [name, stats] of bridges) {
        const nm = name.padEnd(24);
        const ct = String(stats.count).padStart(5);
        const ms = String(stats.avgMs).padStart(7);
        const sr = `${stats.successRate}%`.padStart(7);
        lines.push(`  ${nm}│${ct} │${ms} │${sr}`);
      }
    }

    lines.push('');
    if (activity.recent.length > 0) {
      lines.push(`  Last ${activity.recent.length} invocations:`);
      for (const inv of activity.recent.slice(-5)) {
        const icon = inv.success ? '✓' : '✗';
        lines.push(`    ${icon} ${inv.bridge} (${inv.direction}) — ${inv.durationMs}ms @ ${inv.timestamp.slice(11, 19)}`);
      }
    }

    return { success: true, data: activity, formatted: lines };
  });

  // ═══ OBS.LATENCY — Cross-node latency ═══
  registerHandler('obs.latency', async () => {
    const { observabilityMonitor } = await import('@/lib/substrate/observability-monitor');
    const latencies = observabilityMonitor.getLatencies();

    const lines = [
      '┌─────────────────────────────────────────────┐',
      '│       CROSS-NODE LATENCY                     │',
      '└─────────────────────────────────────────────┘',
      '',
    ];

    if (latencies.length === 0) {
      lines.push('  No latency measurements recorded.');
      lines.push('  Latency is tracked on inter-primitive handoffs (DECODE→ENCODE, BRAIN→MEMORY, etc.)');
    } else {
      lines.push('  Path                          │ Avg(ms) │ P95(ms) │ Samples');
      lines.push('  ──────────────────────────────┼─────────┼─────────┼────────');
      for (const lat of latencies) {
        const path = `${lat.sourceNode}→${lat.targetNode}`.padEnd(30);
        const avg = String(lat.avgLatencyMs).padStart(7);
        const p95 = String(lat.p95LatencyMs).padStart(7);
        const cnt = String(lat.sampleCount).padStart(7);
        const warn = lat.p95LatencyMs > 500 ? ' ⚠' : '';
        lines.push(`  ${path}│${avg} │${p95} │${cnt}${warn}`);
      }
    }

    return { success: true, data: latencies, formatted: lines };
  });

  // ═══ OBS.HOTSPOTS — Error hotspot detection ═══
  registerHandler('obs.hotspots', async () => {
    const { observabilityMonitor } = await import('@/lib/substrate/observability-monitor');
    const hotspots = observabilityMonitor.getErrorHotspots(10);

    const lines = [
      '┌─────────────────────────────────────────────┐',
      '│       ERROR HOTSPOT ANALYSIS                 │',
      '└─────────────────────────────────────────────┘',
      '',
    ];

    if (hotspots.length === 0) {
      lines.push('  No error hotspots detected. Matrix operating cleanly.');
    } else {
      for (const hs of hotspots) {
        const severity = hs.errorRate > 10 ? '🔴' : hs.errorRate > 5 ? '🟡' : '🟢';
        lines.push(`  ${severity} ${hs.node}`);
        lines.push(`     Errors: ${hs.errorCount}  Rate: ${hs.errorRate}%  Last: ${hs.lastError.slice(0, 19)}`);
        if (hs.topErrorTypes.length > 0) {
          lines.push(`     Types: ${hs.topErrorTypes.join(', ')}`);
        }
        lines.push('');
      }
    }

    return { success: true, data: hotspots, formatted: lines };
  });

  // ═══ OBS.TELEMETRY — Telemetry engine state ═══
  registerHandler('obs.telemetry', async () => {
    const { telemetryEngine } = await import('@/lib/substrate/telemetry-engine');
    const state = telemetryEngine.getState();

    const lines = [
      '┌─────────────────────────────────────────────┐',
      '│       TELEMETRY ENGINE STATE                 │',
      '└─────────────────────────────────────────────┘',
      '',
      `  Total Events:     ${state.totalEvents}`,
      `  Session ID:       ${telemetryEngine.getSessionId().slice(0, 8)}...`,
      `  Last Event:       ${state.lastEventTimestamp || 'none'}`,
      '',
      '  By Severity:',
    ];

    for (const [sev, count] of Object.entries(state.eventsBySeverity)) {
      if (count > 0) lines.push(`    ${sev.padEnd(10)} ${count}`);
    }

    lines.push('', '  By Type (top 10):');
    const sortedTypes = Object.entries(state.eventsByType)
      .filter(([, c]) => c > 0)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10);
    for (const [type, count] of sortedTypes) {
      lines.push(`    ${type.padEnd(30)} ${count}`);
    }

    return { success: true, data: state, formatted: lines };
  });

  // ═══ OBS.TELEMETRY.ERRORS — Recent errors ═══
  registerHandler('obs.telemetry.errors', async () => {
    const { telemetryEngine } = await import('@/lib/substrate/telemetry-engine');
    const errors = telemetryEngine.getErrors(20);

    const lines = ['  Recent Errors & Critical Events:', ''];
    if (errors.length === 0) {
      lines.push('  No errors recorded this session.');
    } else {
      for (const e of errors.slice(-15)) {
        const time = e.timestamp.slice(11, 19);
        const src = e.source.module || e.source.engine || '?';
        const msg = e.payload.errorMessage?.slice(0, 60) || e.payload.errorCode || 'unknown';
        lines.push(`  [${time}] ${e.severity.toUpperCase().padEnd(8)} ${src.padEnd(16)} ${msg}`);
      }
    }

    return { success: true, data: errors, formatted: lines };
  });

  // ═══ OBS.TELEMETRY.GOV — Governance events ═══
  registerHandler('obs.telemetry.gov', async () => {
    const { telemetryEngine } = await import('@/lib/substrate/telemetry-engine');
    const govEvents = telemetryEngine.getGovernanceEvents(20);

    const lines = ['  Governance Blocks & Overrides:', ''];
    if (govEvents.length === 0) {
      lines.push('  No governance events this session.');
    } else {
      for (const e of govEvents) {
        const time = e.timestamp.slice(11, 19);
        const action = e.type === 'governance_block' ? '🛑 BLOCK' : '⚡ OVERRIDE';
        const mod = e.source.module || '?';
        const reason = (e.payload.metadata as Record<string, string>)?.reason || '';
        lines.push(`  [${time}] ${action}  ${mod.padEnd(14)} ${reason.slice(0, 50)}`);
      }
    }

    return { success: true, data: govEvents, formatted: lines };
  });

  // ═══ OBS.DLQ — Dead Letter Queue ═══
  registerHandler('obs.dlq', async () => {
    let dlqData = { depth: 0, oldest: null as string | null, pending: 0, exhausted: 0 };

    try {
      const { rippleDLQ } = await import('@/lib/substrate/ripple-dlq');
      const stats = rippleDLQ.getStats();
      const pending = rippleDLQ.getPending();
      dlqData = {
        depth: stats.totalEntries,
        oldest: pending.length > 0 ? pending[0].firstFailedAt : null,
        pending: stats.pendingRetry,
        exhausted: stats.exhausted,
      };
    } catch {
      // DLQ module may not be initialized
    }

    const lines = [
      '┌─────────────────────────────────────────────┐',
      '│       DEAD LETTER QUEUE (RIPPLE DLQ)         │',
      '└─────────────────────────────────────────────┘',
      '',
      `  Queue Depth:   ${dlqData.depth}`,
      `  Oldest Item:   ${dlqData.oldest || 'n/a'}`,
    ];

    if (dlqData.depth === 0) {
      lines.push('', '  ✓ Queue is empty. All events processed successfully.');
    } else {
      lines.push('', `  ⚠ ${dlqData.depth} unprocessed events. Review with obs.dlq.items`);
    }

    return { success: true, data: dlqData, formatted: lines };
  });

  // ═══ OBS.HEALTH — Composite health score ═══
  registerHandler('obs.health', async () => {
    const { observabilityMonitor } = await import('@/lib/substrate/observability-monitor');
    const summary = await observabilityMonitor.getSummary();

    const icon = summary.healthScore >= 90 ? '🟢' :
                 summary.healthScore >= 70 ? '🟡' :
                 summary.healthScore >= 50 ? '🟠' : '🔴';

    const lines = [
      '',
      `  ${icon} Observability Health: ${summary.healthScore}%`,
      '',
      '  Factors:',
      `    Error rate:          ${summary.errorRate}% ${summary.errorRate > 5 ? '⚠' : '✓'}`,
      `    Bridge failures:     ${summary.activeBridges.length > 0 ? 'monitored' : 'no data'} ${summary.errorHotspots.length === 0 ? '✓' : '⚠'}`,
      `    Slow latencies:      ${summary.crossNodeLatencies.filter(l => l.p95LatencyMs > 500).length} paths > 500ms ${summary.crossNodeLatencies.every(l => l.p95LatencyMs <= 500) ? '✓' : '⚠'}`,
      `    DLQ depth:           ${summary.dlqDepth} ${summary.dlqDepth === 0 ? '✓' : '⚠'}`,
      '',
    ];

    return { success: true, data: { healthScore: summary.healthScore, factors: summary }, formatted: lines };
  });

  // ═══ OBS.HELP — Command reference ═══
  registerHandler('obs.help', async () => {
    return {
      success: true,
      formatted: [
        '┌─────────────────────────────────────────────┐',
        '│       OBSERVABILITY COMMANDS                 │',
        `│       ${getMetric('epoch')}`.padEnd(46) + '│',
        '└─────────────────────────────────────────────┘',
        '',
        '  obs.summary            Full observability overview',
        '  obs.bridges            Inter-node bridge activity & success rates',
        '  obs.latency            Cross-node handoff latency (avg, p95)',
        '  obs.hotspots           Error hotspot detection across nodes',
        '  obs.telemetry          Telemetry engine state & counters',
        '  obs.telemetry.errors   Recent error/critical events',
        '  obs.telemetry.gov      Governance blocks & overrides',
        '  obs.dlq                Dead letter queue depth',
        '  obs.health             Composite observability health score',
        '',
      ],
    };
  });
}
