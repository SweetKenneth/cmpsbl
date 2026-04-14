/**
 * Spine & CCR Terminal Handlers — CORE, SYSTEM, BRAIN, DREAM
 * ALL routed through pf-substrate edge function
 */

import { registerHandler } from './validate-registry';
import { bridge } from './substrate-bridge';
import { log } from '@/lib/system/log';

export function registerSpineHandlers(): void {
  // ═══════════════════════════════════════════════════════
  // CORE (Kernel) — Standalone boot authority
  // ═══════════════════════════════════════════════════════

  registerHandler('core.status', bridge('core', 'status'));
  registerHandler('core.pulse', bridge('core', 'pulse'));
  registerHandler('core.boot', bridge('core', 'boot'));
  registerHandler('core.schedule', bridge('core', 'schedule'));
  registerHandler('core.jobs', bridge('core', 'jobs'));
  registerHandler('core.process', bridge('core', 'process'));
  registerHandler('core.config', bridge('core', 'config'));
  registerHandler('core.shutdown', bridge('core', 'shutdown'));

  // ═══════════════════════════════════════════════════════
  // SYSTEM — Lifecycle management, diagnostics
  // ═══════════════════════════════════════════════════════

  registerHandler('system.status', bridge('system', 'status'));
  registerHandler('system.health', bridge('system', 'health'));
  registerHandler('system.diagnostics', bridge('system', 'diagnostics'));
  registerHandler('system.version', bridge('system', 'version'));
  registerHandler('system.uptime', bridge('system', 'uptime'));
  registerHandler('system.config', bridge('system', 'config'));
  registerHandler('system.flags', bridge('system', 'flags'));
  registerHandler('system.audit', bridge('system', 'audit'));
  registerHandler('system.heal', bridge('system', 'heal'));
  registerHandler('system.restore', bridge('system', 'restore'));
  registerHandler('system.checkpoint', bridge('system', 'checkpoint'));
  registerHandler('system.kill_switch', bridge('system', 'kill_switch'));
  registerHandler('system.dependencies', bridge('system', 'dependencies'));
  registerHandler('system.registry', bridge('system', 'registry'));
  registerHandler('system.modules', bridge('system', 'modules'));

  // ═══════════════════════════════════════════════════════
  // BRAIN — Reasoning engine, reflection, forecasting
  // ═══════════════════════════════════════════════════════

  registerHandler('brain.status', bridge('brain', 'status'));
  registerHandler('brain.query', bridge('brain', 'query'));
  registerHandler('brain.remember', bridge('brain', 'remember'));
  registerHandler('brain.recall', bridge('brain', 'recall'));
  registerHandler('brain.reflect', bridge('brain', 'reflect'));
  registerHandler('brain.dream', bridge('brain', 'dream'));
  registerHandler('brain.reinforce', bridge('brain', 'reinforce'));
  registerHandler('brain.synthesize', bridge('brain', 'synthesize'));
  registerHandler('brain.optimize', bridge('brain', 'optimize'));
  registerHandler('brain.tier', bridge('brain', 'tier'));
  registerHandler('brain.prune', bridge('brain', 'prune'));
  registerHandler('brain.deep_think', bridge('brain', 'deep_think'));
  registerHandler('brain.hypothesis_test', bridge('brain', 'hypothesis_test'));
  registerHandler('brain.cognitive_cycle', bridge('brain', 'cognitive_cycle'));
  registerHandler('brain.continuous_learn', bridge('brain', 'continuous_learn'));
  registerHandler('brain.graph_build', bridge('brain', 'graph_build'));
  registerHandler('brain.graph_summary', bridge('brain', 'graph_summary'));
  registerHandler('brain.graph', bridge('brain', 'graph'));
  registerHandler('brain.curiosity', bridge('brain', 'curiosity'));
  registerHandler('brain.explore', bridge('brain', 'explore'));
  registerHandler('brain.patterns', bridge('brain', 'patterns'));
  registerHandler('brain.session_reflection', bridge('brain', 'session_reflection'));
  registerHandler('brain.coherence_check', bridge('brain', 'coherence_check'));
  registerHandler('brain.forecast', bridge('brain', 'forecast'));
  registerHandler('brain.forecast_eval', bridge('brain', 'forecast_eval'));
  registerHandler('brain.causal', bridge('brain', 'causal'));
  registerHandler('brain.ethical', bridge('brain', 'ethical'));
  registerHandler('brain.self_critique', bridge('brain', 'self_critique'));
  registerHandler('brain.systems_reason', bridge('brain', 'systems_reason'));
  registerHandler('brain.pattern_fusion', bridge('brain', 'pattern_fusion'));
  registerHandler('brain.provenance', bridge('brain', 'provenance'));
  registerHandler('brain.health', bridge('brain', 'health'));

  // ═══════════════════════════════════════════════════════
  // DREAM — Synthesis, creative combination
  // ═══════════════════════════════════════════════════════

  registerHandler('dream.status', bridge('dream', 'status'));
  registerHandler('dream.mood', bridge('dream', 'mood'));
  registerHandler('dream.cycle', bridge('dream', 'cycle'));
  registerHandler('dream.theme', bridge('dream', 'theme'));
  registerHandler('dream.heuristics', bridge('dream', 'heuristics'));
  registerHandler('dream.health', bridge('dream', 'health'));

  // ═══ HELP COMMANDS (local UI formatting) ═══

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

  log.info('terminal', 'Spine & CCR handlers registered via substrate bridge (CORE, SYSTEM, BRAIN, DREAM)', { count: 55 });
}
