/**
 * Governance Terminal Handlers — gov.* command namespace
 * ALL routed through pf-substrate edge function
 */

import { registerHandler } from './validate-registry';
import { bridge } from './substrate-bridge';
import { log } from '@/lib/system/log';

export function registerGovernanceHandlers(): void {
  registerHandler('gov.mode', bridge('governance', 'mode'));
  registerHandler('gov.vetoes', bridge('governance', 'vetoes'));
  registerHandler('gov.compliance', bridge('governance', 'compliance'));
  registerHandler('gov.drift', bridge('governance', 'drift'));
  registerHandler('gov.transitions', bridge('governance', 'transitions'));
  registerHandler('gov.signals', bridge('governance', 'signals'));
  registerHandler('gov.lifecycle', bridge('governance', 'lifecycle'));
  registerHandler('gov.summary', bridge('governance', 'summary'));
  registerHandler('governance.status', bridge('governance', 'status'));
  registerHandler('governance.health', bridge('governance', 'health'));

  registerHandler('gov.help', async () => ({
    success: true,
    formatted: [
      '', '┌─ GOVERNANCE — Control Plane ───────────────┐',
      '│  gov.mode         Current mode & subsystems    │',
      '│  gov.vetoes       Active vetoes                │',
      '│  gov.compliance   Compliance audit             │',
      '│  gov.drift        Drift analysis               │',
      '│  gov.transitions  Available transitions        │',
      '│  gov.signals      Signal arbitration history   │',
      '│  gov.lifecycle    Veto lifecycle states        │',
      '│  gov.summary      Full posture overview        │',
      '│  governance.status  Quick status               │',
      '│  governance.health  Health score               │',
      '│  governance.hardening  Hardening (Magistrate)  │',
      '└───────────────────────────────────────────────┘', '',
    ],
  }));

  log.info('terminal', 'Governance handlers registered via substrate bridge', { count: 11 });
}
