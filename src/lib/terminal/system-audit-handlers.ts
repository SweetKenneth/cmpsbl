/**
 * System Audit Terminal Handlers
 * ALL routed through pf-substrate edge function
 */

import { registerHandler } from './validate-registry';
import { bridge } from './substrate-bridge';
import { log } from '@/lib/system/log';

export function registerSystemAuditHandlers(): void {
  registerHandler('system.audit', bridge('system', 'audit'));
  registerHandler('system.repair', bridge('system', 'repair'));
  registerHandler('system.health', bridge('system', 'health'));
  registerHandler('system.fix', bridge('system', 'fix'));

  registerHandler('system.help', async () => ({
    success: true,
    formatted: [
      '', '┌─ SYSTEM — Audit & Self-Repair ─────────────┐',
      '│  system.audit    Full subsystem audit            │',
      '│  system.repair   Self-repair loop (3 attempts)   │',
      '│  system.fix      Audit + auto-repair in one      │',
      '│  system.health   Quick composite health check    │',
      '└───────────────────────────────────────────────┘', '',
    ],
  }));

  log.info('terminal', 'System audit handlers registered via substrate bridge', { count: 5 });
}
