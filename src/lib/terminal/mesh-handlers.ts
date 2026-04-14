/**
 * Intent Mesh Terminal Handlers
 * ALL routed through pf-substrate edge function
 */

import { registerHandler } from './validate-registry';
import { bridge } from './substrate-bridge';
import { log } from '@/lib/system/log';

export function registerMeshHandlers(): void {
  registerHandler('mesh.status', bridge('mesh', 'status'));
  registerHandler('mesh.toggle', bridge('mesh', 'toggle'));
  registerHandler('mesh.on', bridge('mesh', 'on'));
  registerHandler('mesh.off', bridge('mesh', 'off'));
  registerHandler('mesh.log', bridge('mesh', 'log'));
  registerHandler('mesh.history', bridge('mesh', 'history'));
  registerHandler('mesh.replay', bridge('mesh', 'replay'));
  registerHandler('mesh.save', bridge('mesh', 'save'));
  registerHandler('mesh.pipelines', bridge('mesh', 'pipelines'));
  registerHandler('mesh.run', bridge('mesh', 'run'));
  registerHandler('mesh.resolvers', bridge('mesh', 'resolvers'));
  registerHandler('mesh.broadcast', bridge('mesh', 'broadcast'));
  registerHandler('mesh.refine', bridge('mesh', 'refine'));
  registerHandler('mesh.chains', bridge('mesh', 'chains'));
  registerHandler('mesh.chain.run', bridge('mesh', 'chain_run'));
  registerHandler('mesh.flush', bridge('mesh', 'flush'));
  registerHandler('mesh.discover.all', bridge('mesh', 'discover_all'));
  registerHandler('mesh.discover.module', bridge('mesh', 'discover_module'));
  registerHandler('mesh.scores', bridge('mesh', 'scores'));
  registerHandler('mesh.proposals', bridge('mesh', 'proposals'));
  registerHandler('mesh.schedule', bridge('mesh', 'schedule'));
  registerHandler('mesh.schedule.run', bridge('mesh', 'schedule_run'));
  registerHandler('mesh.schedule.stop', bridge('mesh', 'schedule_stop'));
  registerHandler('mesh.stats', bridge('mesh', 'stats'));
  registerHandler('mesh.health', bridge('mesh', 'health'));

  registerHandler('mesh.help', async () => ({
    success: true,
    formatted: [
      '', '┌─ MESH — Intent Resolution ─────────────────┐',
      '│  mesh.status       Mesh state & stats           │',
      '│  mesh.toggle       Enable/disable mesh           │',
      '│  mesh.on / mesh.off  Quick toggle               │',
      '│  mesh.log          Recent receipts               │',
      '│  mesh.history      Deep history                  │',
      '│  mesh.replay <id>  Replay receipt                │',
      '│  mesh.save <name>  Save as pipeline              │',
      '│  mesh.pipelines    Saved pipelines               │',
      '│  mesh.run <name>   Run saved pipeline            │',
      '│  mesh.resolvers    List all resolvers             │',
      '│  mesh.broadcast    Test broadcast                 │',
      '│  mesh.refine       Multi-turn refinement          │',
      '│  mesh.chains       Discover composite chains      │',
      '│  mesh.chain.run    Execute optimal chain          │',
      '│  mesh.discover.all Full module discovery          │',
      '│  mesh.scores       Intent quality leaderboard     │',
      '│  mesh.proposals    Pending module proposals       │',
      '│  mesh.schedule     Auto-scheduler config          │',
      '│  mesh.stats        Historical statistics          │',
      '│  mesh.health       Composite health score         │',
      '└───────────────────────────────────────────────┘', '',
    ],
  }));

  log.info('terminal', 'Mesh handlers registered via substrate bridge', { count: 26 });
}
