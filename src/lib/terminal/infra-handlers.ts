/**
 * Infrastructure Terminal Handlers
 * ALL routed through pf-substrate edge function
 */

import { registerHandler } from './validate-registry';
import { bridge } from './substrate-bridge';
import { log } from '@/lib/system/log';

export function registerInfraHandlers(): void {
  // ═══ CRON RUNNER ═══
  registerHandler('cron.list', bridge('cron', 'list'));
  registerHandler('cron.stats', bridge('cron', 'stats'));
  registerHandler('cron.start', bridge('cron', 'start'));
  registerHandler('cron.stop', bridge('cron', 'stop'));
  registerHandler('cron.trigger', bridge('cron', 'trigger'));
  registerHandler('cron.history', bridge('cron', 'history'));
  registerHandler('cron.enable', bridge('cron', 'enable'));
  registerHandler('cron.disable', bridge('cron', 'disable'));

  // ═══ PERSISTENT RATE LIMITER ═══
  registerHandler('ratelimit.status', bridge('ratelimit', 'status'));
  registerHandler('ratelimit.buckets', bridge('ratelimit', 'buckets'));
  registerHandler('ratelimit.cleanup', bridge('ratelimit', 'cleanup'));

  // ═══ ROLLBACK SNAPSHOTS ═══
  registerHandler('snapshot.list', bridge('snapshot', 'list'));
  registerHandler('snapshot.capture', bridge('snapshot', 'capture'));
  registerHandler('snapshot.stats', bridge('snapshot', 'stats'));
  registerHandler('snapshot.diff', bridge('snapshot', 'diff'));
  registerHandler('snapshot.restore', bridge('snapshot', 'restore'));
  registerHandler('snapshot.delete', bridge('snapshot', 'delete'));
  registerHandler('snapshot.prune', bridge('snapshot', 'prune'));

  // ═══ CAPABILITY ANALYTICS ═══
  registerHandler('cap.summary', bridge('cap', 'summary'));
  registerHandler('cap.top', bridge('cap', 'top'));
  registerHandler('cap.dead', bridge('cap', 'dead'));
  registerHandler('cap.rising', bridge('cap', 'rising'));
  registerHandler('cap.flush', bridge('cap', 'flush'));

  // ═══ STREAMING PIPELINE ═══
  registerHandler('stream.status', bridge('stream', 'status'));
  registerHandler('stream.active', bridge('stream', 'active'));

  // ═══ FILE PROCESSING ═══
  registerHandler('file.status', bridge('file', 'status'));
  registerHandler('file.history', bridge('file', 'history'));
  registerHandler('file.formats', bridge('file', 'formats'));

  // ═══ NATURAL LANGUAGE TERMINAL ═══
  registerHandler('nl.parse', bridge('nl', 'parse'));
  registerHandler('nl.intents', bridge('nl', 'intents'));
  registerHandler('nl.history', bridge('nl', 'history'));

  // ═══ SUBSYSTEM HEALTH & HEALING ═══
  registerHandler('system.subsystems', bridge('system', 'subsystems'));
  registerHandler('system.heal.intent_mesh', bridge('system', 'heal_intent_mesh'));
  registerHandler('system.heal.autoblog', bridge('system', 'heal_autoblog'));
  registerHandler('system.heal.seba', bridge('system', 'heal_seba'));
  registerHandler('system.heal.shadow_mesh', bridge('system', 'heal_shadow_mesh'));
  registerHandler('system.heal.event_stream', bridge('system', 'heal_event_stream'));
  registerHandler('system.heal.discovery_engine', bridge('system', 'heal_discovery_engine'));
  registerHandler('system.heal.all_subsystems', bridge('system', 'heal_all_subsystems'));

  // ═══ EVENT STREAM ═══
  registerHandler('eventstream.status', bridge('eventstream', 'status'));

  // ═══ DILIGENCE ═══
  registerHandler('diligence.run', bridge('diligence', 'run'));

  log.info('terminal', 'Infrastructure handlers registered via substrate bridge', { count: 42 });
}
