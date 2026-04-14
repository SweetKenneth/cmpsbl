/**
 * Power Center Terminal Handlers
 * ALL routed through pf-substrate edge function
 */

import { registerHandler } from './validate-registry';
import { bridge } from './substrate-bridge';
import { log } from '@/lib/system/log';

export function registerPowerHandlers(): void {
  registerHandler('power.status', bridge('power', 'status'));
  registerHandler('power.on', bridge('power', 'on'));
  registerHandler('power.off', bridge('power', 'off'));
  registerHandler('power.audit', bridge('power', 'audit'));

  registerHandler('power.help', async () => ({
    success: true,
    formatted: [
      '', '┌─ POWER — Meta Circuit Breaker ─────────────┐',
      '│  power.status   View all subsystem states       │',
      '│  power.on       Activate ALL subsystems          │',
      '│  power.off      Deactivate ALL subsystems        │',
      '│  power.audit    Run full production audit         │',
      '└───────────────────────────────────────────────┘', '',
    ],
  }));

  log.info('terminal', 'Power handlers registered via substrate bridge', { count: 5 });
}
