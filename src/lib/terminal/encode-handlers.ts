/**
 * ENCODE Module Terminal Handlers
 * First-class module terminal commands
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

  // decode.inbox — CLM reports from all entities + zones
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

  // clm.run_all — Trigger CLM for all entities + zones
  registerHandler('clm.run_all', async () => {
    const { moduleCLM } = await import('@/lib/substrate/module-clm/index');
    const results = await moduleCLM.runAllModuleLearning();
    return {
      success: true,
      message: `CLM completed for ${results.length} entities`,
      data: {
        cyclesRun: results.length,
        totalEntities: results.length,
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

  // encode.run — Lightweight CLI endpoint
  registerHandler('encode.run', async (args?: string) => {
    const { executeEncodeCLI } = await import('@/lib/substrate/encode-module/orchestration');
    const parts = (args || '').trim().split(/\s+/);
    const command = (parts[0] || 'status') as any;
    const target = parts.slice(1).join(' ') || undefined;
    return executeEncodeCLI(command, target);
  });

  // encode.audit — Run repo + DB audit mode
  registerHandler('encode.audit', async () => {
    const { runAuditMode } = await import('@/lib/substrate/encode-module/orchestration');
    const snapshot = runAuditMode();
    return {
      success: true,
      data: {
        snapshot_id: snapshot.snapshot_id,
        modules: snapshot.module_registry.length,
        dependencies: snapshot.dependency_graph.length,
        utilities: snapshot.shared_utilities_index.length,
        escalation_paths: snapshot.escalation_paths.length,
      },
    };
  });

  // encode.approve — Unlock execution after audit
  registerHandler('encode.approve', async () => {
    const { approveExecution } = await import('@/lib/substrate/encode-module/orchestration');
    return approveExecution();
  });

  // encode.contract — Build awareness contract for a module
  registerHandler('encode.contract', async (args?: string) => {
    const { buildAwarenessContract } = await import('@/lib/substrate/encode-module/orchestration');
    const module = (args || '').trim() || 'encode';
    return { success: true, data: buildAwarenessContract(module) };
  });

  // encode.mode — Set ENCODE mode
  registerHandler('encode.mode', async (args?: string) => {
    const { setEncodeMode, getEncodeMode } = await import('@/lib/substrate/encode-module/orchestration');
    const mode = (args || '').trim();
    if (!mode) return { success: true, data: { current_mode: getEncodeMode() } };
    return setEncodeMode(mode as any);
  });

  // encode.patches — View patch history
  registerHandler('encode.patches', async () => {
    const { getPatchHistory } = await import('@/lib/substrate/encode-module/orchestration');
    const patches = getPatchHistory();
    return {
      success: true,
      data: {
        count: patches.length,
        patches: patches.map(p => ({
          id: p.id,
          file: p.file,
          operation: p.operation,
          applied: p.applied,
          created_at: p.created_at,
        })),
      },
    };
  });

  // encode.conversation — View conversation state
  registerHandler('encode.conversation', async () => {
    const { getConversationState } = await import('@/lib/substrate/encode-module/orchestration');
    const state = getConversationState();
    return {
      success: true,
      data: {
        session: state.sessionId,
        mode: state.current_mode,
        execution_locked: state.execution_locked,
        user_approval: state.user_approval,
        architecture_exists: state.architecture_map_exists,
        message_count: state.messages.length,
        recent_messages: state.messages.slice(-5).map(m => ({
          role: m.role,
          content: m.content.slice(0, 120),
          timestamp: m.timestamp,
        })),
      },
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
        '│         Orchestration Epoch                  │',
        '└─────────────────────────────────────────────┘',
        '',
        '  ── Core ──',
        '  encode.status        Module health & task stats',
        '  encode.queue         Current task queue from DECODE',
        '  encode.receipts      Completion receipts with BRAIN refs',
        '  encode.health        ENCODE module health score',
        '',
        '  ── Orchestration (v11) ──',
        '  encode.run <cmd>     CLI: scan|patch|refactor|guard|audit|status|approve|clear|history|diff',
        '  encode.audit         Run repo + DB audit (architecture snapshot)',
        '  encode.approve       Unlock execution after audit + review',
        '  encode.contract <m>  Build awareness contract for module',
        '  encode.mode <mode>   Set mode: conversation|audit|surgical|generation',
        '  encode.patches       View surgical patch history',
        '  encode.conversation  View conversation relay state',
        '',
        '  ── CLM ──',
        '  decode.inbox         CLM reports from all entities + zones',
        '  clm.run_all          Run CLM for all entities',
        '  clm.run <mod>        Run CLM for specific module',
        '',
        '  ── Execution Protocol ──',
        '  1. encode.audit → snapshot created',
        '  2. Submit intent → ENCODE reviews (no code yet)',
        '  3. encode.approve → execution unlocked',
        '  4. encode.mode surgical → create patches',
        '  5. Patches show BEFORE/AFTER/RATIONALE',
        '  6. Explicit apply_patch to write',
        '',
        '  ── Role Definitions ──',
        '  USER   = Strategic authority (approve/reject/direct)',
        '  DECODE = Intent translator (parse/relay/clarify)',
        '  ENCODE = Execution engine (analyze/generate/patch)',
        '',
      ],
    };
  });

  // encode.health
  registerHandler('encode.health', async () => {
    const { getEncodeHealth } = await import('@/lib/substrate/encode-module/index');
    return { success: true, data: { health: getEncodeHealth(), module: 'ENCODE', layer: 'Orchestrator' } };
  });

  // encode.navigate — Substrate Navigator: resolve intent to file targets
  registerHandler('encode.navigate', async (args?: string) => {
    const query = (args || '').trim();
    if (!query) {
      return {
        success: false,
        error: 'Usage: encode.navigate <intent>  — e.g. "rate limit BRAIN cognition"',
      };
    }
    const { navigateIntent } = await import('@/lib/codeagent/encoded/substrate-navigator');
    const result = navigateIntent(query);
    return {
      success: true,
      data: {
        modules: result.modules.map(m => ({ id: m.id, name: m.name, corePath: m.corePath })),
        concerns: result.concerns,
        tables: result.tables,
        targetFiles: result.targetFiles,
        conventionPaths: result.conventionPaths,
        impactChain: result.impactChain,
      },
      formatted: [
        '┌─────────────────────────────────────────┐',
        '│  SUBSTRATE NAVIGATOR                    │',
        '└─────────────────────────────────────────┘',
        '',
        result.summary,
        '',
        '── Convention Paths ──',
        ...Object.entries(result.conventionPaths).map(([k, v]) => `  ${k}: ${v}`),
      ],
    };
  });

  // encode.whereis — Quick "where does X live?" lookup
  registerHandler('encode.whereis', async (args?: string) => {
    const query = (args || '').trim();
    if (!query) {
      return { success: false, error: 'Usage: encode.whereis <module or concept>' };
    }
    const { whereIs } = await import('@/lib/codeagent/encoded/substrate-navigator');
    return {
      success: true,
      data: { query, result: whereIs(query) },
      formatted: [whereIs(query)],
    };
  });

  log.info('terminal', 'ENCODE module handlers registered', { count: 18 });
}
