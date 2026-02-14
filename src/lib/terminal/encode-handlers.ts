/**
 * ENCODE Module Terminal Handlers
 * v9.1.0 ARCHITECT — First-class module terminal commands
 */

import { registerHandler } from './validate-registry';
import { log } from '@/lib/system/log';

export function registerEncodeModuleHandlers(): void {
  // encode.status — Module health and state
  registerHandler('encode.status', async () => {
    const { getEncodeState, getEncodeHealth } = await import('@/lib/substrate/encode-module/index');
    const state = getEncodeState();
    const health = getEncodeHealth();
    return {
      success: true,
      data: {
        initialized: state.initialized,
        health: `${health}%`,
        tasksQueued: state.totalTasksQueued,
        tasksCompleted: state.totalTasksCompleted,
        tasksFailed: state.totalTasksFailed,
        lastRun: state.lastRunAt || 'never',
        queueDepth: state.taskQueue.length,
        receiptCount: state.receipts.length,
      },
    };
  });

  // encode.queue — View current task queue
  registerHandler('encode.queue', async () => {
    const { getTaskQueue } = await import('@/lib/substrate/encode-module/index');
    const queue = getTaskQueue();
    return {
      success: true,
      data: {
        count: queue.length,
        tasks: queue.map(t => ({
          id: t.id,
          status: t.status,
          surface: t.targetSurface,
          intent: t.intentSummary.slice(0, 80),
          queued: t.createdAt,
        })),
      },
    };
  });

  // encode.receipts — View completion receipts
  registerHandler('encode.receipts', async () => {
    const { getReceipts } = await import('@/lib/substrate/encode-module/index');
    const receipts = getReceipts(20);
    return {
      success: true,
      data: {
        count: receipts.length,
        receipts: receipts.map(r => ({
          taskId: r.taskId,
          success: r.success,
          artifacts: r.artifacts.length,
          learnings: r.learnings.length,
          brainReceipt: r.brainReceiptId || 'none',
          completed: r.completedAt,
          ms: r.executionMs,
        })),
      },
    };
  });

  // decode.inbox — CLM reports from ALL 21 modules
  registerHandler('decode.inbox', async () => {
    const { moduleCLM } = await import('@/lib/substrate/module-clm/index');
    const feed = await moduleCLM.getFeed(50);
    return {
      success: true,
      data: {
        totalReports: feed.length,
        reports: feed.map(r => ({
          module: r.moduleId.toUpperCase(),
          title: r.title,
          type: r.analysisType,
          confidence: r.confidence,
          priority: r.priority,
          timestamp: r.createdAt,
        })),
      },
    };
  });

  // clm.run_all — Trigger CLM for ALL 21 modules
  registerHandler('clm.run_all', async () => {
    const { moduleCLM } = await import('@/lib/substrate/module-clm/index');
    const results = await moduleCLM.runAllModuleLearning();
    return {
      success: true,
      message: `CLM completed for ${results.length} of 21 modules`,
      data: {
        cyclesRun: results.length,
        totalModules: 21,
        modules: results.map(r => ({
          module: r.moduleId.toUpperCase(),
          title: r.title,
          confidence: r.confidence,
          priority: r.priority,
        })),
      },
    };
  });

  // clm.run <module> — Trigger CLM for a single module
  registerHandler('clm.run', async () => {
    return {
      success: false,
      error: 'Usage: clm.run <module>',
      examples: [
        'clm.run core', 'clm.run ripple', 'clm.run access',
        'clm.run brain', 'clm.run decode', 'clm.run dream',
        'clm.run defense', 'clm.run nexus', 'clm.run vision', 'clm.run integration',
        'clm.run system', 'clm.run modernizer', 'clm.run inclusive',
        'clm.run cortex', 'clm.run encode',
        'clm.run memory', 'clm.run relay', 'clm.run audit',
        'clm.run identity', 'clm.run economy', 'clm.run sandbox',
      ],
    };
  });

  // encode.help
  registerHandler('encode.help', async () => {
    return {
      success: true,
      formatted: [
        '',
        '┌─────────────────────────────────────────────┐',
        '│       ENCODE MODULE — Terminal Commands      │',
        '│       v9.3.0 ARCHITECT Epoch                 │',
        '└─────────────────────────────────────────────┘',
        '',
        '  encode.status    Module health & task stats',
        '  encode.queue     Current task queue from DECODE',
        '  encode.receipts  Completion receipts with BRAIN refs',
        '  encode.health    ENCODE module health score',
        '  decode.inbox     CLM reports from ALL 21 modules',
        '  clm.run_all      Run CLM for all 21 modules',
        '  clm.run <mod>    Run CLM for specific module',
        '',
        '  ENCODE receives structured task packets from',
        '  DECODE only. Talk to DECODE to direct ENCODE.',
        '',
        '  Integration points:',
        '  ├── DECODE → routes intent to ENCODE',
        '  ├── BRAIN  → context recall & knowledge writeback',
        '  ├── MEMORY → code embedding & snippet retrieval',
        '  ├── AUDIT  → all generations & applications logged',
        '  ├── VISION → quality metrics & tracking',
        '  └── SANDBOX → generated code tested in isolation',
        '',
      ],
    };
  });

  // encode.health
  registerHandler('encode.health', async () => {
    const { getEncodeHealth } = await import('@/lib/substrate/encode-module/index');
    return { success: true, data: { health: getEncodeHealth(), module: 'ENCODE', layer: 'Orchestrator' } };
  });

  log.info('terminal', 'ENCODE module handlers registered', { count: 8 });
}
