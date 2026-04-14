/**
 * Encoded Terminal Handlers
 * ALL routed through pf-substrate edge function
 */

import { registerHandler } from './validate-registry';
import { bridge } from './substrate-bridge';
import { log } from '@/lib/system/log';

export function registerEncodedHandlers(): void {
  registerHandler('encoded.status', bridge('encoded', 'status'));
  registerHandler('encoded.config', bridge('encoded', 'config'));
  registerHandler('encoded.set_mode', bridge('encoded', 'set_mode'));
  registerHandler('encoded.dry_run', bridge('encoded', 'dry_run'));
  registerHandler('encoded.enable', bridge('encoded', 'enable'));
  registerHandler('encoded.semi_auto', bridge('encoded', 'semi_auto'));
  registerHandler('encoded.verify', bridge('encoded', 'verify'));
  registerHandler('encoded.generate', bridge('encoded', 'generate'));
  registerHandler('encoded.patterns', bridge('encoded', 'patterns'));
  registerHandler('encoded.history', bridge('encoded', 'history'));
  registerHandler('encoded.seba.enable', bridge('encoded', 'seba_enable'));
  registerHandler('encoded.seba.disable', bridge('encoded', 'seba_disable'));
  registerHandler('encoded.model.nexus', bridge('encoded', 'model_nexus'));
  registerHandler('encoded.model.free', bridge('encoded', 'model_free'));
  registerHandler('encoded.guard.test', bridge('encoded', 'guard_test'));
  registerHandler('encoded.skills', bridge('encoded', 'skills'));
  registerHandler('encoded.analyze', bridge('encoded', 'analyze'));
  registerHandler('encoded.metrics', bridge('encoded', 'metrics'));

  registerHandler('encoded.help', async () => ({
    success: true,
    formatted: [
      '', '┌─ ENCODED — Precision Code Agent ───────────┐',
      '│  encoded.status       Agent status               │',
      '│  encoded.config       Current configuration      │',
      '│  encoded.set_mode     Set execution mode          │',
      '│  encoded.dry_run      Enable dry-run mode         │',
      '│  encoded.enable       Enable human approval       │',
      '│  encoded.semi_auto    Semi-autonomous mode        │',
      '│  encoded.verify       Verify code                 │',
      '│  encoded.generate     Generate code (preview)     │',
      '│  encoded.patterns     Learned patterns            │',
      '│  encoded.history      Recent executions           │',
      '│  encoded.skills       Skill proficiency           │',
      '│  encoded.analyze      Code quality analysis       │',
      '│  encoded.metrics      Quality metrics             │',
      '│  encoded.seba.enable  Enable SEBA integration     │',
      '│  encoded.seba.disable Disable SEBA integration    │',
      '│  encoded.model.nexus  Use Nexus fleet             │',
      '│  encoded.model.free   Use free tier               │',
      '└───────────────────────────────────────────────┘', '',
    ],
  }));

  log.info('terminal', 'Encoded handlers registered via substrate bridge', { count: 19 });
}
