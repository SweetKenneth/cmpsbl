/**
 * Analytics Terminal Handlers
 * ALL routed through pf-substrate edge function
 */

import { registerHandler } from './validate-registry';
import { bridge } from './substrate-bridge';
import { log } from '@/lib/system/log';

export function registerAnalyticsHandlers(): void {
  registerHandler('analytics.summary', bridge('analytics', 'summary'));
  registerHandler('analytics.trend', bridge('analytics', 'trend'));
  registerHandler('analytics.correlate', bridge('analytics', 'correlate'));
  registerHandler('analytics.cost', bridge('analytics', 'cost'));
  registerHandler('analytics.events', bridge('analytics', 'events'));
  registerHandler('analytics.anomalies', bridge('analytics', 'anomalies'));

  registerHandler('analytics.help', async () => ({
    success: true,
    formatted: [
      '', '┌─ ANALYTICS — Enterprise Observability ─────┐',
      '│  analytics.summary     Full overview            │',
      '│  analytics.trend       Health trend (24h)        │',
      '│  analytics.correlate   Cross-source correlation  │',
      '│  analytics.cost        Cost attribution           │',
      '│  analytics.events      Admin analytics (24h)      │',
      '│  analytics.anomalies   Active anomalies           │',
      '└───────────────────────────────────────────────┘', '',
    ],
  }));

  log.info('terminal', 'Analytics handlers registered via substrate bridge', { count: 7 });
}
