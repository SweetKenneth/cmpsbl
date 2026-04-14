/**
 * Core Terminal Handlers
 * 5 foundational commands + cognitive aliases + whoami + engine activation
 * All routed through pf-substrate except help/clear (UI-only)
 */

import { registerHandler } from './validate-registry';
import { bridge, callSubstrate } from './substrate-bridge';

export function registerCoreHandlers(): void {
  // help — local UI formatting
  registerHandler('help', async () => ({
    success: true,
    output: 'Use `help <module>` for module-specific commands. Modules: core, system, brain, dream, memory, defense, nexus, cortex, encode, decode, vision, inclusive, integration, evolution, governance, economy, ripple, access, mesh, obs, analytics, power, seba',
  }));

  // status — real substrate status via pf-substrate
  registerHandler('status', bridge('core', 'status'));

  // version — real substrate version via pf-substrate
  registerHandler('version', bridge('system', 'version'));

  // clear — local UI action, no backend needed
  registerHandler('clear', async () => ({
    success: true,
    output: '',
  }));

  // audit — real audit via pf-substrate
  registerHandler('audit', bridge('audit', 'status'));

  // ═══ WHOAMI — Unified identity from substrate (Phase 3) ═══
  registerHandler('whoami', async () => {
    // Pull identity + subscription from pf-substrate in parallel
    const [identityResult, subResult] = await Promise.all([
      callSubstrate('identity', 'status'),
      callSubstrate('economy', 'status'),
    ]);

    const actor = (identityResult as Record<string, unknown>)?.data as Record<string, unknown> | undefined;
    const actorInfo = actor?.actor as Record<string, unknown> | undefined;
    const displayName = actorInfo?.display_name || 'Anonymous';
    const role = actorInfo?.role || 'user';
    const tier = actorInfo?.tier || 'free';
    const identityStrength = actor?.identity_strength || 'unknown';

    const econ = identityResult.success ? subResult : { success: false };
    const econData = (econ as Record<string, unknown>)?.diagnostics as Record<string, unknown> | undefined;
    const budget = econData?.budget || 'unknown';

    // Determine activated engines based on tier
    const tierEngines: Record<string, string[]> = {
      free: ['FAILSAFE', 'BEACON', 'PRIMITIVE'],
      creator: ['FAILSAFE', 'BEACON', 'PRIMITIVE', 'AUTOMATON', 'WRAITH'],
      studio: ['FAILSAFE', 'BEACON', 'PRIMITIVE', 'AUTOMATON', 'WRAITH', 'CORTEX', 'OBSIDIAN'],
      architect: ['FAILSAFE', 'BEACON', 'PRIMITIVE', 'AUTOMATON', 'WRAITH', 'CORTEX', 'OBSIDIAN', 'NEXUS', 'MONOLITH', 'ARCHITECT', 'RAPTOR'],
      governor: ['ALL — Full system authority'],
    };
    const activated = tierEngines[tier as string] || tierEngines.free;

    return {
      success: true,
      output: `
┌─ SUBSTRATE IDENTITY ─────────────────────────────────────────
│
│  Identity:    ${displayName}
│  Role:        ${String(role).toUpperCase()}
│  Tier:        ${String(tier).toUpperCase()}
│  Strength:    ${identityStrength}
│  Budget:      ${budget}
│
│  ┌─ ACTIVATED ENGINES ────────────────────────────────────
│  │  ${activated.join(' · ')}
│  └────────────────────────────────────────────────────────
│
│  40-Primitive Cognitive Infrastructure Substrate
│  CMPSBL® — where dreams come to adapt
│
└──────────────────────────────────────────────────────────────`,
    };
  });

  // ═══ ENGINE ACTIVATION STATUS (Phase 3) ═══
  registerHandler('engine.activated', async () => {
    const subResult = await callSubstrate('economy', 'status');
    const econ = subResult as Record<string, unknown>;
    const diagnostics = econ?.diagnostics as Record<string, unknown> | undefined;
    const tier = diagnostics?.tier || 'free';

    const tiers = [
      { name: 'FREE', engines: ['FAILSAFE', 'BEACON', 'PRIMITIVE'], unlocked: true },
      { name: 'CREATOR ($29)', engines: ['AUTOMATON', 'WRAITH'], unlocked: ['creator', 'studio', 'architect', 'governor'].includes(tier as string) },
      { name: 'STUDIO ($49)', engines: ['CORTEX', 'OBSIDIAN'], unlocked: ['studio', 'architect', 'governor'].includes(tier as string) },
      { name: 'ARCHITECT ($79)', engines: ['NEXUS', 'MONOLITH', 'ARCHITECT', 'RAPTOR'], unlocked: ['architect', 'governor'].includes(tier as string) },
    ];

    const lines = tiers.map(t => {
      const icon = t.unlocked ? '✅' : '🔒';
      return `│  ${icon} ${t.name.padEnd(20)} ${t.engines.join(', ')}`;
    });

    return {
      success: true,
      output: `
┌─ ENGINE ACTIVATION STATUS ──────────────────────────────────
│
${lines.join('\n')}
│
│  Use 'engine.list' for all engines
│  Use 'engine.run <id>' to execute an activated engine
│
└─────────────────────────────────────────────────────────────`,
    };
  });

  // ═══ COGNITIVE ALIASES (Phase 2) ═══
  registerHandler('remember', bridge('brain', 'remember'));
  registerHandler('recall', bridge('memory', 'recall'));
  registerHandler('stream', bridge('memory', 'stream'));
  registerHandler('discover', bridge('brain', 'explore'));
  registerHandler('think', bridge('brain', 'deep_think'));
  registerHandler('reflect', bridge('brain', 'reflect'));
  registerHandler('dream', bridge('dream', 'cycle'));
  registerHandler('synthesize', bridge('brain', 'synthesize'));

  // ═══ DOCTOR — Full 40-Primitive substrate connectivity validator (Phase 5) ═══
  // Usage: doctor         → full 40-primitive check
  //        doctor --quick  → organs-only fast check (12 primitives)
  //        doctor --engines → engines + agents only (16 primitives)
  registerHandler('doctor', async (args?: Record<string, unknown>) => {
    const rawArgs = (args?._args as string[]) || [];
    const isQuick = rawArgs.includes('--quick') || rawArgs.includes('-q');
    const isEngines = rawArgs.includes('--engines') || rawArgs.includes('-e');

    // 12 Organs + 12 Layers + 8 Engines + 8 Agents = 40 Primitives
    const ORGANS = [
      'core', 'system', 'brain', 'memory', 'dream', 'nerve',
      'identity', 'relay', 'audit', 'ripple', 'access', 'governance',
    ];
    const LAYERS = [
      'defense', 'immunity', 'intent', 'atlas', 'engineer', 'decode',
      'encode', 'vision', 'economy', 'sandbox', 'inclusive', 'medic',
    ];
    const ENGINES = [
      'cortex', 'nexus', 'evolution', 'conscience', 'sovereign',
      'shadow', 'reflex', 'compass',
    ];
    const AGENTS = [
      'beacon', 'watchtower', 'integration', 'dispatch',
      'marshal', 'pioneer', 'herald', 'overseer',
    ];

    // Select scope based on flags
    let modules: string[];
    let scopeLabel: string;
    if (isQuick) {
      modules = [...ORGANS];
      scopeLabel = '12 Organs (quick)';
    } else if (isEngines) {
      modules = [...ENGINES, ...AGENTS];
      scopeLabel = '16 Engines + Agents';
    } else {
      modules = [...ORGANS, ...LAYERS, ...ENGINES, ...AGENTS];
      scopeLabel = '40-Primitive architecture';
    }

    const results: Array<{ module: string; ok: boolean; latencyMs: number; error?: string }> = [];
    const startAll = Date.now();

    // Parallel health check across all substrate primitives
    const checks = await Promise.allSettled(
      modules.map(async (mod) => {
        const t0 = Date.now();
        const res = await callSubstrate(mod, 'status');
        return { module: mod, ok: res.success === true, latencyMs: Date.now() - t0 };
      })
    );

    for (const c of checks) {
      if (c.status === 'fulfilled') {
        results.push(c.value);
      } else {
        results.push({ module: 'unknown', ok: false, latencyMs: 0, error: c.reason?.message || 'Failed' });
      }
    }

    const healthy = results.filter(r => r.ok).length;
    const total = results.length;
    const avgLatency = Math.round(results.reduce((s, r) => s + r.latencyMs, 0) / total);
    const totalTime = Date.now() - startAll;
    const allGood = healthy === total;

    // Build categorized output
    const formatSection = (label: string, ids: string[]) => {
      const sectionResults = ids.map(id => results.find(r => r.module === id)).filter(Boolean) as typeof results;
      const sectionHealthy = sectionResults.filter(r => r.ok).length;
      const lines = sectionResults.map(r => {
        const icon = r.ok ? '✅' : '❌';
        const lat = `${r.latencyMs}ms`.padStart(6);
        return `│  │  ${icon} ${r.module.toUpperCase().padEnd(14)} ${lat}${r.error ? ` — ${r.error}` : ''}`;
      });
      return `│  ┌─ ${label} (${sectionHealthy}/${ids.length}) ${'─'.repeat(Math.max(1, 40 - label.length))}\n${lines.join('\n')}\n│  └${'─'.repeat(50)}`;
    };

    const sections = [
      formatSection('ORGANS', ORGANS),
      formatSection('LAYERS', LAYERS),
      formatSection('ENGINES', ENGINES),
      formatSection('AGENTS', AGENTS),
    ];

    return {
      success: true,
      output: `
┌─ SUBSTRATE DOCTOR ───────────────────────────────────────────
│
│  Status:       ${allGood ? '✅ ALL SYSTEMS NOMINAL' : `⚠️  ${healthy}/${total} HEALTHY`}
│  Primitives:   ${healthy}/${total} responding (40-Primitive architecture)
│  Avg Latency:  ${avgLatency}ms
│  Total Check:  ${totalTime}ms
│
${sections.join('\n│\n')}
│
│  Bridge:       pf-substrate (auto-bridge active)
│  Realtime:     brain_memories, cascade_dreams
│  Surfaces:     Web Terminal · CLI · API · Website
│
│  The substrate is ${allGood ? 'alive and unified across all 40 Primitives' : 'partially degraded'}.
│  CMPSBL® — where dreams come to adapt
│
└──────────────────────────────────────────────────────────────`,
    };
  });
}
