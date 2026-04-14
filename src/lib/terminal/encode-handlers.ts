/**
 * ENCODE Module Terminal Handlers
 * ALL routed through pf-substrate edge function
 */

import { registerHandler } from './validate-registry';
import { bridge } from './substrate-bridge';
import { log } from '@/lib/system/log';

export function registerEncodeModuleHandlers(): void {
  registerHandler('encode.status', bridge('encode', 'status'));
  registerHandler('encode.queue', bridge('encode', 'queue'));
  registerHandler('encode.receipts', bridge('encode', 'receipts'));
  registerHandler('encode.run', bridge('encode', 'run'));
  registerHandler('encode.audit', bridge('encode', 'audit'));
  registerHandler('encode.approve', bridge('encode', 'approve'));
  registerHandler('encode.contract', bridge('encode', 'contract'));
  registerHandler('encode.mode', bridge('encode', 'mode'));
  registerHandler('encode.patches', bridge('encode', 'patches'));
  registerHandler('encode.conversation', bridge('encode', 'conversation'));
  registerHandler('encode.navigate', bridge('encode', 'navigate'));
  registerHandler('encode.whereis', bridge('encode', 'whereis'));
  registerHandler('encode.health', bridge('encode', 'health'));

  // CLM commands
  registerHandler('decode.inbox', bridge('decode', 'inbox'));
  registerHandler('clm.run_all', bridge('clm', 'run_all'));
  registerHandler('clm.run', bridge('clm', 'run'));

  registerHandler('encode.help', async () => ({
    success: true,
    formatted: [
      '', '┌─ ENCODE — Orchestration Engine ────────────┐',
      '│  encode.status        Module health & stats      │',
      '│  encode.queue         Current task queue          │',
      '│  encode.receipts      Completion receipts         │',
      '│  encode.run <cmd>     CLI endpoint                │',
      '│  encode.audit         Repo + DB audit             │',
      '│  encode.approve       Unlock execution            │',
      '│  encode.contract <m>  Awareness contract          │',
      '│  encode.mode <mode>   Set mode                    │',
      '│  encode.patches       Patch history               │',
      '│  encode.navigate <q>  Resolve intent → targets    │',
      '│  encode.whereis <q>   Quick lookup                │',
      '│  encode.health        Health score                │',
      '│  decode.inbox         CLM reports                 │',
      '│  clm.run_all          Run CLM for all entities    │',
      '│  clm.run <mod>        Run CLM for module          │',
      '└───────────────────────────────────────────────┘', '',
    ],
  }));

  log.info('terminal', 'ENCODE module handlers registered via substrate bridge', { count: 17 });
}
