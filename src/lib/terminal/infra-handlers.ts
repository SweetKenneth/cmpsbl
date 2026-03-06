/**
 * Infrastructure Terminal Handlers
 * Terminal commands for the 7 new infrastructure systems
 */

import { registerHandler } from './validate-registry';
import { log } from '@/lib/system/log';

/**
 * Register all infrastructure terminal commands
 */
export function registerInfraHandlers(): void {
  // ═══ CRON RUNNER ═══
  registerHandler('cron.list', async () => {
    const { cronRunner } = await import('@/lib/substrate/cron-runner');
    return { success: true, data: { jobs: cronRunner.list(), stats: cronRunner.stats() } };
  });

  registerHandler('cron.stats', async () => {
    const { cronRunner } = await import('@/lib/substrate/cron-runner');
    return { success: true, data: cronRunner.stats() };
  });

  registerHandler('cron.start', async () => {
    const { cronRunner } = await import('@/lib/substrate/cron-runner');
    cronRunner.start();
    return { success: true, message: 'Cron runner started', data: cronRunner.stats() };
  });

  registerHandler('cron.stop', async () => {
    const { cronRunner } = await import('@/lib/substrate/cron-runner');
    cronRunner.stop();
    return { success: true, message: 'Cron runner stopped' };
  });

  registerHandler('cron.trigger', async () => {
    return { success: false, error: 'Usage: cron.trigger <job-id>', examples: ['cron.trigger health-check', 'cron.trigger memory-gc'] };
  });

  registerHandler('cron.history', async () => {
    const { cronRunner } = await import('@/lib/substrate/cron-runner');
    return { success: true, data: { history: cronRunner.history(20) } };
  });

  registerHandler('cron.enable', async () => {
    return { success: false, error: 'Usage: cron.enable <job-id>' };
  });

  registerHandler('cron.disable', async () => {
    return { success: false, error: 'Usage: cron.disable <job-id>' };
  });

  // ═══ PERSISTENT RATE LIMITER ═══
  registerHandler('ratelimit.status', async () => {
    const { persistentRateLimiter } = await import('@/lib/substrate/persistent-rate-limit');
    return { success: true, data: persistentRateLimiter.stats() };
  });

  registerHandler('ratelimit.buckets', async () => {
    const { persistentRateLimiter } = await import('@/lib/substrate/persistent-rate-limit');
    return { success: true, data: { buckets: persistentRateLimiter.getAllBuckets() } };
  });

  registerHandler('ratelimit.cleanup', async () => {
    const { persistentRateLimiter } = await import('@/lib/substrate/persistent-rate-limit');
    return { success: true, data: persistentRateLimiter.cleanup() };
  });

  // ═══ ROLLBACK SNAPSHOTS ═══
  registerHandler('snapshot.list', async () => {
    const { rollbackSnapshots } = await import('@/lib/substrate/rollback-snapshots');
    return { success: true, data: { snapshots: rollbackSnapshots.list(), stats: rollbackSnapshots.stats() } };
  });

  registerHandler('snapshot.capture', async () => {
    const { rollbackSnapshots } = await import('@/lib/substrate/rollback-snapshots');
    const snap = await rollbackSnapshots.capture({ label: 'Manual snapshot', trigger: 'manual' });
    return { success: true, message: `Snapshot captured: ${snap.id}`, data: snap };
  });

  registerHandler('snapshot.stats', async () => {
    const { rollbackSnapshots } = await import('@/lib/substrate/rollback-snapshots');
    return { success: true, data: rollbackSnapshots.stats() };
  });

  registerHandler('snapshot.diff', async () => {
    return { success: false, error: 'Usage: snapshot.diff <snapshot-id>' };
  });

  registerHandler('snapshot.restore', async () => {
    return { success: false, error: 'Usage: snapshot.restore <snapshot-id>' };
  });

  registerHandler('snapshot.delete', async () => {
    return { success: false, error: 'Usage: snapshot.delete <snapshot-id>' };
  });

  registerHandler('snapshot.prune', async () => {
    const { rollbackSnapshots } = await import('@/lib/substrate/rollback-snapshots');
    const pruned = rollbackSnapshots.prune(7 * 24 * 60 * 60 * 1000);
    return { success: true, message: `Pruned ${pruned} old snapshots` };
  });

  // ═══ CAPABILITY ANALYTICS ═══
  registerHandler('cap.summary', async () => {
    const { capabilityAnalytics } = await import('@/lib/substrate/capability-analytics');
    return { success: true, data: capabilityAnalytics.summary(24) };
  });

  registerHandler('cap.top', async () => {
    const { capabilityAnalytics } = await import('@/lib/substrate/capability-analytics');
    const summary = capabilityAnalytics.summary(24);
    return { success: true, data: { top: summary.topCapabilities } };
  });

  registerHandler('cap.dead', async () => {
    const { capabilityAnalytics } = await import('@/lib/substrate/capability-analytics');
    return { success: true, data: { dead: capabilityAnalytics.getDeadCapabilities() } };
  });

  registerHandler('cap.rising', async () => {
    const { capabilityAnalytics } = await import('@/lib/substrate/capability-analytics');
    return { success: true, data: { rising: capabilityAnalytics.getRisingCapabilities() } };
  });

  registerHandler('cap.flush', async () => {
    const { capabilityAnalytics } = await import('@/lib/substrate/capability-analytics');
    return { success: true, data: capabilityAnalytics.flush() };
  });

  // ═══ STREAMING PIPELINE ═══
  registerHandler('stream.status', async () => {
    const { streamingPipeline } = await import('@/lib/substrate/streaming-pipeline');
    return { success: true, data: streamingPipeline.stats() };
  });

  registerHandler('stream.active', async () => {
    const { streamingPipeline } = await import('@/lib/substrate/streaming-pipeline');
    return { success: true, data: { sessions: streamingPipeline.getActiveSessions() } };
  });

  // ═══ FILE PROCESSING ═══
  registerHandler('file.status', async () => {
    const { fileProcessingPipeline } = await import('@/lib/substrate/file-processing');
    return { success: true, data: fileProcessingPipeline.stats() };
  });

  registerHandler('file.history', async () => {
    const { fileProcessingPipeline } = await import('@/lib/substrate/file-processing');
    return { success: true, data: { history: fileProcessingPipeline.getHistory() } };
  });

  registerHandler('file.formats', async () => {
    const { fileProcessingPipeline } = await import('@/lib/substrate/file-processing');
    return { success: true, data: { formats: fileProcessingPipeline.supportedFormats() } };
  });

  // ═══ NATURAL LANGUAGE TERMINAL ═══
  registerHandler('nl.parse', async () => {
    return { success: false, error: 'Usage: nl.parse <natural language query>' };
  });

  registerHandler('nl.intents', async () => {
    const { nlTerminal } = await import('@/lib/substrate/nl-terminal');
    return { success: true, data: { intents: nlTerminal.getKnownIntents() } };
  });

  registerHandler('nl.history', async () => {
    const { nlTerminal } = await import('@/lib/substrate/nl-terminal');
    return { success: true, data: { history: nlTerminal.history() } };
  });

  // ═══ SUBSYSTEM HEALTH & HEALING ═══
  registerHandler('system.subsystems', async () => {
    const { getSubsystemDiagnostics } = await import('@/lib/substrate/subsystem-health');
    const diag = getSubsystemDiagnostics();
    return { success: true, data: diag };
  });

  registerHandler('system.heal.intent_mesh', async () => {
    const { healSubsystem } = await import('@/lib/substrate/subsystem-health');
    return await healSubsystem('intent_mesh');
  });

  registerHandler('system.heal.autoblog', async () => {
    const { healSubsystem } = await import('@/lib/substrate/subsystem-health');
    return await healSubsystem('autoblog');
  });

  registerHandler('system.heal.seba', async () => {
    const { healSubsystem } = await import('@/lib/substrate/subsystem-health');
    return await healSubsystem('seba');
  });

  registerHandler('system.heal.shadow_mesh', async () => {
    const { healSubsystem } = await import('@/lib/substrate/subsystem-health');
    return await healSubsystem('shadow_mesh');
  });

  registerHandler('system.heal.event_stream', async () => {
    const { healSubsystem } = await import('@/lib/substrate/subsystem-health');
    return await healSubsystem('event_stream');
  });

  registerHandler('system.heal.all_subsystems', async () => {
    const { healAllSubsystems } = await import('@/lib/substrate/subsystem-health');
    const results = await healAllSubsystems();
    return { success: results.every(r => r.ok), data: results };
  });

  registerHandler('stream.status', async () => {
    const { getStreamStats } = await import('@/lib/substrate/module-bus/eventStream');
    const stats = getStreamStats();
    return {
      success: true,
      data: stats,
      formatted: `Event Stream Status\n` +
        `Buffer: ${stats.buffer_size}/${stats.max_size}\n` +
        `Health: ${stats.health.score}/100 (${stats.health.status})\n` +
        `Breaker: ${stats.breaker.state} (failures: ${stats.breaker.totalFailures})\n` +
        `Captured: ${stats.total_captured}\n` +
        `Dropped: ${stats.health.droppedSignals}\n` +
        `Persistence: ${stats.persistence_enabled ? 'ON' : 'OFF'}`,
    };
  });

  // ═══ DILIGENCE HARNESS ═══
  registerHandler('diligence.run', async () => {
    const { runDiligence } = await import('@/lib/diligence/run-diligence');
    const report = await runDiligence();
    return {
      success: true,
      data: report,
      formatted:
        `Diligence Harness\n` +
        `Total: ${report.summary.total}\n` +
        `PASS: ${report.summary.passed}\n` +
        `MINOR: ${report.summary.minor}\n` +
        `CRITICAL: ${report.summary.critical}\n\n` +
        `JSON:\n${JSON.stringify(report, null, 2)}`,
    };
  });

  log.info('terminal', 'Infrastructure + subsystem + diligence handlers registered', { count: 37 });
}
