/**
 * Synergy Terminal Handlers
 * ALL routed through pf-substrate edge function
 */

import { registerHandler } from './validate-registry';
import { bridge } from './substrate-bridge';
import { log } from '@/lib/system/log';

export function registerSynergyHandlers(): void {
  registerHandler('cortex.synergy.list', bridge('cortex', 'synergy_list'));
  registerHandler('cortex.synergy.execute', bridge('cortex', 'synergy_execute'));
  registerHandler('cortex.synergy.dry_run', bridge('cortex', 'synergy_dry_run'));
  registerHandler('cortex.synergy.get', bridge('cortex', 'synergy_get'));
  registerHandler('cortex.synergy.by_module', bridge('cortex', 'synergy_by_module'));
  registerHandler('cortex.synergy.pipeline', bridge('cortex', 'synergy_pipeline'));
  registerHandler('cortex.synergy.recommend', bridge('cortex', 'synergy_recommend'));
  registerHandler('cortex.synergy.categories', bridge('cortex', 'synergy_categories'));
  registerHandler('cortex.synergy.stats', bridge('cortex', 'synergy_stats'));
  registerHandler('cortex.synergy.stier', bridge('cortex', 'synergy_stier'));

  registerHandler('cortex.synergy.help', async () => ({
    success: true,
    formatted: [
      '', '┌─ SYNERGY — 200 Cross-Module Pipelines ─────┐',
      '│  cortex.synergy.list       All synergies         │',
      '│  cortex.synergy.execute    Execute pipeline       │',
      '│  cortex.synergy.dry_run    Preview execution      │',
      '│  cortex.synergy.get        Pipeline details       │',
      '│  cortex.synergy.by_module  Filter by module       │',
      '│  cortex.synergy.recommend  Context recommendations │',
      '│  cortex.synergy.categories Category breakdown      │',
      '│  cortex.synergy.stats      Engine statistics       │',
      '│  cortex.synergy.stier      S-tier pipelines        │',
      '└───────────────────────────────────────────────┘', '',
    ],
  }));

  log.info('terminal', 'Synergy handlers registered via substrate bridge', { count: 11 });
}
