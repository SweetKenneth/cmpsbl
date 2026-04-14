/**
 * Hardening Terminal Handlers
 * ALL routed through pf-substrate edge function
 */

import { registerHandler } from './validate-registry';
import { bridge } from './substrate-bridge';
import { log } from '@/lib/system/log';

let registered = false;

const HARDENED_MODULES = [
  'core', 'system', 'cortex', 'encode', 'decode', 'vision', 'defense',
  'governance', 'brain', 'memory', 'dream', 'economy', 'immunity',
  'evolution', 'intent', 'engineer', 'atlas', 'audit', 'relay',
  'ripple', 'sandbox', 'inclusive',
  'sovereign', 'oracle', 'conscience', 'phantom', 'forge', 'lingua',
  'compass', 'echo', 'treaty', 'harvest', 'reflex', 'shadow',
];

export function registerHardeningHandlers(): void {
  if (registered) return;
  registered = true;

  // Unified overview
  registerHandler('hardening.status', bridge('hardening', 'status'));
  registerHandler('hardening.health', bridge('hardening', 'health'));
  registerHandler('hardening.grades', bridge('hardening', 'grades'));
  registerHandler('hardening.audit', bridge('hardening', 'audit'));
  registerHandler('hardening.versions', bridge('hardening', 'versions'));

  // Per-module hardening commands
  for (const mod of HARDENED_MODULES) {
    registerHandler(`${mod}.hardening`, bridge(mod, 'hardening'));
    registerHandler(`${mod}.hardening.health`, bridge(mod, 'hardening_health'));
  }

  // Module-specific extended hardening commands
  registerHandler('core.hardening.boot', bridge('core', 'hardening_boot'));
  registerHandler('core.hardening.watchdog', bridge('core', 'hardening_watchdog'));
  registerHandler('system.hardening.lifecycle', bridge('system', 'hardening_lifecycle'));
  registerHandler('system.hardening.heartbeats', bridge('system', 'hardening_heartbeats'));
  registerHandler('system.hardening.quarantine', bridge('system', 'hardening_quarantine'));
  registerHandler('system.hardening.canaries', bridge('system', 'hardening_canaries'));
  registerHandler('system.hardening.sla', bridge('system', 'hardening_sla'));
  registerHandler('system.hardening.boot_timing', bridge('system', 'hardening_boot_timing'));
  registerHandler('system.hardening.readiness', bridge('system', 'hardening_readiness'));
  registerHandler('cortex.hardening.sla', bridge('cortex', 'hardening_sla'));
  registerHandler('cortex.hardening.backpressure', bridge('cortex', 'hardening_backpressure'));
  registerHandler('encode.hardening.budget', bridge('encode', 'hardening_budget'));
  registerHandler('encode.hardening.quality', bridge('encode', 'hardening_quality'));
  registerHandler('decode.hardening.trust', bridge('decode', 'hardening_trust'));
  registerHandler('decode.hardening.sanitization', bridge('decode', 'hardening_sanitization'));
  registerHandler('vision.hardening.anomalies', bridge('vision', 'hardening_anomalies'));
  registerHandler('defense.hardening.fingerprint', bridge('defense', 'hardening_fingerprint'));
  registerHandler('governance.hardening.decisions', bridge('governance', 'hardening_decisions'));
  registerHandler('brain.hardening.beliefs', bridge('brain', 'hardening_beliefs'));
  registerHandler('brain.hardening.biases', bridge('brain', 'hardening_biases'));
  registerHandler('brain.hardening.cache', bridge('brain', 'hardening_cache'));
  registerHandler('memory.hardening.integrity', bridge('memory', 'hardening_integrity'));
  registerHandler('dream.hardening.boundaries', bridge('dream', 'hardening_boundaries'));
  registerHandler('economy.hardening.budget', bridge('economy', 'hardening_budget'));
  registerHandler('economy.hardening.alerts', bridge('economy', 'hardening_alerts'));
  registerHandler('immunity.hardening.mesh', bridge('immunity', 'hardening_mesh'));
  registerHandler('immunity.hardening.signatures', bridge('immunity', 'hardening_signatures'));
  registerHandler('evolution.hardening.gates', bridge('evolution', 'hardening_gates'));
  registerHandler('evolution.hardening.canary', bridge('evolution', 'hardening_canary'));
  registerHandler('intent.hardening.resolution', bridge('intent', 'hardening_resolution'));
  registerHandler('engineer.hardening.pipeline', bridge('engineer', 'hardening_pipeline'));
  registerHandler('atlas.hardening.capabilities', bridge('atlas', 'hardening_capabilities'));
  registerHandler('audit.hardening.chain', bridge('audit', 'hardening_chain'));
  registerHandler('relay.hardening.circuit', bridge('relay', 'hardening_circuit'));
  registerHandler('ripple.hardening.dlq', bridge('ripple', 'hardening_dlq'));
  registerHandler('sandbox.hardening.isolation', bridge('sandbox', 'hardening_isolation'));
  registerHandler('inclusive.hardening.compliance', bridge('inclusive', 'hardening_compliance'));

  registerHandler('hardening.help', async () => ({
    success: true,
    formatted: [
      '', '┌─ HARDENING — All Modules ──────────────────┐',
      '│  hardening.status    Overview all modules        │',
      '│  hardening.health    Aggregate health score       │',
      '│  hardening.grades    Grade breakdown              │',
      '│  hardening.audit     Chain audit                  │',
      '│  hardening.versions  Module version list          │',
      '│  <mod>.hardening     Module hardening status      │',
      '│  <mod>.hardening.health  Module health score      │',
      '└───────────────────────────────────────────────┘', '',
    ],
  }));

  log.info('terminal', 'Hardening handlers registered via substrate bridge', { count: HARDENED_MODULES.length * 2 + 40 });
}
