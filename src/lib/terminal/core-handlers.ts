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
  // Bare commands route to their substrate module counterparts
  // so "remember foo" = "brain.remember foo" = "memory.store foo"
  registerHandler('remember', bridge('brain', 'remember'));
  registerHandler('recall', bridge('memory', 'recall'));
  registerHandler('stream', bridge('memory', 'stream'));
  registerHandler('discover', bridge('brain', 'explore'));
  registerHandler('think', bridge('brain', 'deep_think'));
  registerHandler('reflect', bridge('brain', 'reflect'));
  registerHandler('dream', bridge('dream', 'cycle'));
  registerHandler('synthesize', bridge('brain', 'synthesize'));
}
