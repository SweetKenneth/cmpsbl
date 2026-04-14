/**
 * Core Terminal Handlers
 * 5 foundational commands + cognitive aliases
 * All routed through pf-substrate except help/clear (UI-only)
 */

import { registerHandler } from './validate-registry';
import { bridge } from './substrate-bridge';

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
