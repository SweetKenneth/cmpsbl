/**
 * Observability Terminal Handlers
 * ALL routed through pf-substrate edge function
 */

import { registerHandler } from './validate-registry';
import { bridge } from './substrate-bridge';
import { log } from '@/lib/system/log';

export function registerObservabilityHandlers(): void {
  registerHandler('obs.summary', bridge('obs', 'summary'));
  registerHandler('obs.bridges', bridge('obs', 'bridges'));
  registerHandler('obs.latency', bridge('obs', 'latency'));
  registerHandler('obs.hotspots', bridge('obs', 'hotspots'));
  registerHandler('obs.telemetry', bridge('obs', 'telemetry'));
  registerHandler('obs.telemetry.errors', bridge('obs', 'telemetry_errors'));
  registerHandler('obs.telemetry.gov', bridge('obs', 'telemetry_gov'));
  registerHandler('obs.dlq', bridge('obs', 'dlq'));
  registerHandler('obs.health', bridge('obs', 'health'));

  registerHandler('obs.help', async () => ({
    success: true,
    formatted: [
      '', '┌─ OBSERVABILITY — Full Stack Telemetry ─────┐',
      '│  obs.summary            Full overview            │',
      '│  obs.bridges            Bridge activity           │',
      '│  obs.latency            Cross-node latency        │',
      '│  obs.hotspots           Error hotspot detection    │',
      '│  obs.telemetry          Telemetry engine state     │',
      '│  obs.telemetry.errors   Recent error events        │',
      '│  obs.telemetry.gov      Governance events          │',
      '│  obs.dlq                Dead letter queue           │',
      '│  obs.health             Composite health score      │',
      '└───────────────────────────────────────────────┘', '',
    ],
  }));

  log.info('terminal', 'Observability handlers registered via substrate bridge', { count: 10 });
}
