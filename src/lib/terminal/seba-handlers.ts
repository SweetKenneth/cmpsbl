/**
 * SEBA Terminal Handlers
 * ALL routed through pf-substrate edge function
 */

import { registerHandler } from './validate-registry';
import { bridge } from './substrate-bridge';
import { log } from '@/lib/system/log';

export function registerSEBAHandlers(): void {
  registerHandler('seba.status', bridge('seba', 'status'));
  registerHandler('seba.health', bridge('seba', 'health'));
  registerHandler('seba.pulse', bridge('seba', 'pulse'));
  registerHandler('seba.cycle', bridge('seba', 'cycle'));
  registerHandler('seba.propose', bridge('seba', 'propose'));
  registerHandler('seba.review', bridge('seba', 'review'));
  registerHandler('seba.approve', bridge('seba', 'approve'));
  registerHandler('seba.reject', bridge('seba', 'reject'));
  registerHandler('seba.execute', bridge('seba', 'execute'));
  registerHandler('seba.rollback', bridge('seba', 'rollback'));
  registerHandler('seba.mode', bridge('seba', 'mode'));
  registerHandler('seba.mode.observe', bridge('seba', 'mode_observe'));
  registerHandler('seba.mode.advisory', bridge('seba', 'mode_advisory'));
  registerHandler('seba.mode.governed', bridge('seba', 'mode_governed'));
  registerHandler('seba.enable', bridge('seba', 'enable'));
  registerHandler('seba.disable', bridge('seba', 'disable'));
  registerHandler('seba.proposals', bridge('seba', 'proposals'));
  registerHandler('seba.receipts', bridge('seba', 'receipts'));
  registerHandler('seba.history', bridge('seba', 'history'));
  registerHandler('seba.metrics', bridge('seba', 'metrics'));
  registerHandler('seba.config', bridge('seba', 'config'));
  registerHandler('seba.bounds', bridge('seba', 'bounds'));
  registerHandler('seba.confidence', bridge('seba', 'confidence'));
  registerHandler('seba.scope', bridge('seba', 'scope'));
  registerHandler('seba.hardening', bridge('seba', 'hardening'));

  registerHandler('seba.help', async () => ({
    success: true,
    formatted: [
      '', '┌─ SEBA — Self-Evolving Bounded Agent ───────┐',
      '│  seba.status     Agent status                   │',
      '│  seba.cycle      Run evolution cycle             │',
      '│  seba.propose    Generate proposals              │',
      '│  seba.review     Pending proposals               │',
      '│  seba.approve    Approve proposal                │',
      '│  seba.reject     Reject proposal                 │',
      '│  seba.execute    Execute approved proposal       │',
      '│  seba.rollback   Rollback applied evolution      │',
      '│  seba.mode       Get/set mode                    │',
      '│  seba.receipts   Evolution receipts              │',
      '│  seba.history    Execution history               │',
      '│  seba.metrics    Performance metrics             │',
      '│  seba.config     Current configuration           │',
      '│  seba.bounds     Safety bounds                   │',
      '│  seba.health     Health score                    │',
      '└───────────────────────────────────────────────┘', '',
    ],
  }));

  log.info('terminal', 'SEBA handlers registered via substrate bridge', { count: 26 });
}
