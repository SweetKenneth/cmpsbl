/**
 * Spine & CCR Terminal Handlers — CORE, SYSTEM, BRAIN, DREAM
 * Registers governance-gated handlers for Spine + CCR nodes
 */

import { registerHandler } from './validate-registry';
import { log } from '@/lib/system/log';

export function registerSpineHandlers(): void {
  // ═══════════════════════════════════════════════════════
  // CORE (Kernel) — Standalone boot authority
  // ═══════════════════════════════════════════════════════

  registerHandler('core.status', async () => {
    const { core } = await import('@/lib/substrate');
    return await core.status();
  });

  registerHandler('core.pulse', async () => {
    const { core } = await import('@/lib/substrate');
    return await core.pulse();
  });

  registerHandler('core.boot', async () => {
    const { core } = await import('@/lib/substrate');
    return await core.boot();
  });

  registerHandler('core.schedule', async () => {
    return { success: false, error: 'Usage: core.schedule <module> <action> [delay]' };
  });

  registerHandler('core.jobs', async () => {
    const { core } = await import('@/lib/substrate');
    return await core.jobs();
  });

  registerHandler('core.process', async () => {
    const { core } = await import('@/lib/substrate');
    return await core.process();
  });

  registerHandler('core.config', async () => {
    const { core } = await import('@/lib/substrate');
    return await core.config();
  });

  registerHandler('core.shutdown', async () => {
    const { core } = await import('@/lib/substrate');
    return await core.shutdown();
  });

  // ═══════════════════════════════════════════════════════
  // SYSTEM — Lifecycle management, diagnostics
  // ═══════════════════════════════════════════════════════

  registerHandler('system.status', async () => {
    const { system } = await import('@/lib/substrate');
    return await system.status();
  });

  registerHandler('system.health', async () => {
    const { system } = await import('@/lib/substrate');
    return await system.health();
  });

  registerHandler('system.diagnostics', async () => {
    const { system } = await import('@/lib/substrate');
    return await system.diagnostics();
  });

  registerHandler('system.version', async () => {
    const { system } = await import('@/lib/substrate');
    return await system.version();
  });

  registerHandler('system.uptime', async () => {
    const { substrate } = await import('@/lib/substrate');
    return await substrate.invoke({ module: 'system', action: 'uptime' });
  });

  registerHandler('system.config', async () => {
    const { system } = await import('@/lib/substrate');
    return await system.config();
  });

  registerHandler('system.flags', async () => {
    const { substrate } = await import('@/lib/substrate');
    return await substrate.invoke({ module: 'system', action: 'flags' });
  });

  registerHandler('system.audit', async () => {
    const { system } = await import('@/lib/substrate');
    return await system.audit();
  });

  registerHandler('system.heal', async () => {
    return { success: false, error: 'Usage: system.heal <module>' };
  });

  registerHandler('system.restore', async () => {
    return { success: false, error: 'Usage: system.restore <checkpoint_id>' };
  });

  registerHandler('system.checkpoint', async () => {
    const { substrate } = await import('@/lib/substrate');
    return await substrate.invoke({ module: 'system', action: 'checkpoint' });
  });

  registerHandler('system.kill_switch', async () => {
    return { success: false, error: 'Usage: system.kill_switch <module> [reason]' };
  });

  registerHandler('system.dependencies', async () => {
    const { substrate } = await import('@/lib/substrate');
    return await substrate.invoke({ module: 'system', action: 'dependencies' });
  });

  registerHandler('system.registry', async () => {
    const { substrate } = await import('@/lib/substrate');
    return await substrate.invoke({ module: 'system', action: 'registry' });
  });

  registerHandler('system.modules', async () => {
    const { system } = await import('@/lib/substrate');
    return await system.modules();
  });

  // ═══════════════════════════════════════════════════════
  // BRAIN — Reasoning engine, reflection, forecasting
  // ═══════════════════════════════════════════════════════

  registerHandler('brain.status', async () => {
    const { brain } = await import('@/lib/substrate');
    return await brain.status();
  });

  registerHandler('brain.query', async () => {
    return { success: false, error: 'Usage: brain.query <question> [limit]' };
  });

  registerHandler('brain.remember', async () => {
    return { success: false, error: 'Usage: brain.remember <content> [type] [importance]' };
  });

  registerHandler('brain.recall', async () => {
    return { success: false, error: 'Usage: brain.recall <query> [limit]' };
  });

  registerHandler('brain.reflect', async () => {
    const { brain } = await import('@/lib/substrate');
    return await brain.reflect();
  });

  registerHandler('brain.dream', async () => {
    const { brain } = await import('@/lib/substrate');
    return await brain.dream();
  });

  registerHandler('brain.reinforce', async () => {
    return { success: false, error: 'Usage: brain.reinforce <memory_id> [strength]' };
  });

  registerHandler('brain.synthesize', async () => {
    const { brain } = await import('@/lib/substrate');
    return await brain.synthesize();
  });

  registerHandler('brain.optimize', async () => {
    const { brain } = await import('@/lib/substrate');
    return await brain.optimize('standard');
  });

  registerHandler('brain.tier', async () => {
    const { brain } = await import('@/lib/substrate');
    return await brain.tier('standard');
  });

  registerHandler('brain.prune', async () => {
    const { brain } = await import('@/lib/substrate');
    return await brain.prune(0.1);
  });

  registerHandler('brain.deep_think', async () => {
    return { success: false, error: 'Usage: brain.deep_think <topic> [depth]' };
  });

  registerHandler('brain.hypothesis_test', async () => {
    return { success: false, error: 'Usage: brain.hypothesis_test <hypothesis>' };
  });

  registerHandler('brain.cognitive_cycle', async () => {
    const { brain } = await import('@/lib/substrate');
    return await brain.cognitiveCycle();
  });

  registerHandler('brain.continuous_learn', async () => {
    const { brain } = await import('@/lib/substrate');
    return await brain.continuousLearn(true);
  });

  registerHandler('brain.graph_build', async () => {
    const { brain } = await import('@/lib/substrate');
    return await brain.graphBuild();
  });

  registerHandler('brain.graph_summary', async () => {
    const { brain } = await import('@/lib/substrate');
    return await brain.graphSummary();
  });

  registerHandler('brain.graph', async () => {
    const { brain } = await import('@/lib/substrate');
    return await brain.graph({ inspect: false, stats: false });
  });

  registerHandler('brain.curiosity', async () => {
    const { brain } = await import('@/lib/substrate');
    return await brain.curiosity();
  });

  registerHandler('brain.explore', async () => {
    return { success: false, error: 'Usage: brain.explore <topic>' };
  });

  registerHandler('brain.patterns', async () => {
    const { brain } = await import('@/lib/substrate');
    return await brain.patterns();
  });

  registerHandler('brain.session_reflection', async () => {
    const { brain } = await import('@/lib/substrate');
    return await brain.sessionReflection();
  });

  registerHandler('brain.coherence_check', async () => {
    const { brain } = await import('@/lib/substrate');
    return await brain.coherenceCheck();
  });

  registerHandler('brain.forecast', async () => {
    return { success: false, error: 'Usage: brain.forecast <domain> [horizon]' };
  });

  registerHandler('brain.forecast_eval', async () => {
    const { substrate } = await import('@/lib/substrate');
    return await substrate.invoke({ module: 'brain', action: 'forecast_eval' });
  });

  registerHandler('brain.causal', async () => {
    return { success: false, error: 'Usage: brain.causal <query_id>' };
  });

  registerHandler('brain.ethical', async () => {
    return { success: false, error: 'Usage: brain.ethical <proposed_action>' };
  });

  registerHandler('brain.self_critique', async () => {
    return { success: false, error: 'Usage: brain.self_critique <output> [output_type]' };
  });

  registerHandler('brain.systems_reason', async () => {
    return { success: false, error: 'Usage: brain.systems_reason <system> <issue>' };
  });

  registerHandler('brain.pattern_fusion', async () => {
    return { success: false, error: 'Usage: brain.pattern_fusion <pattern_ids>' };
  });

  registerHandler('brain.provenance', async () => {
    return { success: false, error: 'Usage: brain.provenance <memory_id>' };
  });

  registerHandler('brain.health', async () => {
    const { brain } = await import('@/lib/substrate');
    const status = await brain.status();
    return { success: true, data: { health: (status as any)?.data?.health || 100, module: 'BRAIN', layer: 'CCR' } };
  });

  // ═══════════════════════════════════════════════════════
  // DREAM — Synthesis, creative combination
  // ═══════════════════════════════════════════════════════

  registerHandler('dream.status', async () => {
    const { dream } = await import('@/lib/substrate');
    return await dream.status();
  });

  registerHandler('dream.mood', async () => {
    return { success: false, error: 'Usage: dream.mood [mood]' };
  });

  registerHandler('dream.cycle', async () => {
    const { dream } = await import('@/lib/substrate');
    return await dream.cycle();
  });

  registerHandler('dream.theme', async () => {
    return { success: false, error: 'Usage: dream.theme <topic>' };
  });

  registerHandler('dream.heuristics', async () => {
    const { dream } = await import('@/lib/substrate');
    return await dream.reflect();
  });

  registerHandler('dream.health', async () => {
    const { dream } = await import('@/lib/substrate');
    const status = await dream.status();
    return { success: true, data: { health: (status as any)?.data?.health || 100, module: 'DREAM', layer: 'CCR' } };
  });

  // ═══ HELP COMMANDS ═══

  registerHandler('core.help', async () => ({
    success: true,
    formatted: [
      '', '┌─ CORE — Kernel Authority ──────────────────┐',
      '│  core.status     Kernel status               │',
      '│  core.pulse      Heartbeat pulse              │',
      '│  core.boot       Boot sequence                │',
      '│  core.jobs       Scheduled jobs               │',
      '│  core.process    Process manager              │',
      '│  core.config     Kernel configuration         │',
      '│  core.shutdown   Graceful shutdown             │',
      '│  core.health     Health score                  │',
      '│  core.hardening  Hardening status (Foundation) │',
      '└───────────────────────────────────────────────┘', '',
    ],
  }));

  registerHandler('brain.help', async () => ({
    success: true,
    formatted: [
      '', '┌─ BRAIN — Reasoning Engine ─────────────────┐',
      '│  brain.status          Module status           │',
      '│  brain.query <q>       Query knowledge         │',
      '│  brain.remember <c>    Store memory            │',
      '│  brain.recall <q>      Recall memories         │',
      '│  brain.reflect         Reflection cycle        │',
      '│  brain.dream           Dream synthesis         │',
      '│  brain.synthesize      Pattern synthesis       │',
      '│  brain.optimize        Optimization cycle      │',
      '│  brain.patterns        Pattern analysis        │',
      '│  brain.graph           Knowledge graph         │',
      '│  brain.curiosity       Curiosity engine        │',
      '│  brain.forecast <d>    Domain forecasting      │',
      '│  brain.health          Health score            │',
      '│  brain.hardening       Hardening (Memoria)     │',
      '└───────────────────────────────────────────────┘', '',
    ],
  }));

  registerHandler('dream.help', async () => ({
    success: true,
    formatted: [
      '', '┌─ DREAM — Synthesis Engine ─────────────────┐',
      '│  dream.status     Module status               │',
      '│  dream.cycle      Dream cycle                  │',
      '│  dream.mood       Mood control                 │',
      '│  dream.theme <t>  Theme selection              │',
      '│  dream.heuristics Reflection heuristics        │',
      '│  dream.health     Health score                 │',
      '│  dream.hardening  Hardening (Nocturne)         │',
      '└───────────────────────────────────────────────┘', '',
    ],
  }));

  log.info('terminal', 'Spine & CCR handlers registered (CORE, SYSTEM, BRAIN, DREAM)', { count: 55 });
}
