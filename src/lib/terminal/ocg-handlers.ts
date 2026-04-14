/**
 * OCG & Shell Terminal Handlers — RIPPLE, ACCESS, DEFENSE
 * ALL routed through pf-substrate edge function
 */

import { registerHandler } from './validate-registry';
import { bridge } from './substrate-bridge';
import { log } from '@/lib/system/log';

export function registerOCGHandlers(): void {
  // ═══ RIPPLE ═══
  registerHandler('ripple.status', bridge('ripple', 'status'));
  registerHandler('ripple.pulse', bridge('ripple', 'pulse'));
  registerHandler('ripple.topics', bridge('ripple', 'topics'));
  registerHandler('ripple.events', bridge('ripple', 'events'));
  registerHandler('ripple.publish', bridge('ripple', 'publish'));
  registerHandler('ripple.subscribe', bridge('ripple', 'subscribe'));
  registerHandler('ripple.enqueue', bridge('ripple', 'enqueue'));
  registerHandler('ripple.dequeue', bridge('ripple', 'dequeue'));
  registerHandler('ripple.dead_letter', bridge('ripple', 'dead_letter'));
  registerHandler('ripple.retry', bridge('ripple', 'retry'));
  registerHandler('ripple.metrics', bridge('ripple', 'metrics'));
  registerHandler('ripple.replay', bridge('ripple', 'replay'));
  registerHandler('ripple.jobs', bridge('ripple', 'jobs'));
  registerHandler('ripple.work', bridge('ripple', 'work'));
  registerHandler('ripple.drain', bridge('ripple', 'drain'));
  registerHandler('ripple.ack', bridge('ripple', 'ack'));
  registerHandler('ripple.nack', bridge('ripple', 'nack'));
  registerHandler('ripple.circuits', bridge('ripple', 'circuits'));
  registerHandler('ripple.health', bridge('ripple', 'health'));

  // ═══ ACCESS ═══
  registerHandler('access.status', bridge('access', 'status'));
  registerHandler('access.pulse', bridge('access', 'pulse'));
  registerHandler('access.create_key', bridge('access', 'create_key'));
  registerHandler('access.validate_key', bridge('access', 'validate_key'));
  registerHandler('access.revoke_key', bridge('access', 'revoke_key'));
  registerHandler('access.list_keys', bridge('access', 'list_keys'));
  registerHandler('access.usage', bridge('access', 'usage'));
  registerHandler('access.quota', bridge('access', 'quota'));
  registerHandler('access.subscription', bridge('access', 'subscription'));
  registerHandler('access.register', bridge('access', 'register'));
  registerHandler('access.bootstrap', bridge('access', 'bootstrap'));
  registerHandler('access.developer', bridge('access', 'developer'));
  registerHandler('access.developers', bridge('access', 'developers'));
  registerHandler('access.identity', bridge('access', 'identity'));
  registerHandler('access.entitlements', bridge('access', 'entitlements'));
  registerHandler('access.products', bridge('access', 'products'));
  registerHandler('access.health', bridge('access', 'health'));

  // ═══ DEFENSE ═══
  registerHandler('defense.status', bridge('defense', 'status'));
  registerHandler('defense.analyze', bridge('defense', 'analyze'));
  registerHandler('defense.verify', bridge('defense', 'verify'));
  registerHandler('defense.audit', bridge('defense', 'audit'));
  registerHandler('defense.scan', bridge('defense', 'scan'));
  registerHandler('defense.threats', bridge('defense', 'threats'));
  registerHandler('defense.quarantine', bridge('defense', 'quarantine'));
  registerHandler('defense.release', bridge('defense', 'release'));
  registerHandler('defense.rates', bridge('defense', 'rates'));
  registerHandler('defense.posture', bridge('defense', 'posture'));
  registerHandler('defense.health', bridge('defense', 'health'));

  // ═══ HELP (local UI) ═══
  registerHandler('ripple.help', async () => ({
    success: true, formatted: [
      '', '┌─ RIPPLE — Signal Bus ──────────────────────┐',
      '│  ripple.status     Module status               │',
      '│  ripple.pulse      Heartbeat                   │',
      '│  ripple.topics     Active topics                │',
      '│  ripple.events     Event log                    │',
      '│  ripple.dead_letter Dead letter queue           │',
      '│  ripple.metrics    Bus metrics                  │',
      '│  ripple.jobs       Job queue                    │',
      '│  ripple.circuits   Circuit breaker states       │',
      '│  ripple.health     Health score                 │',
      '└───────────────────────────────────────────────┘', '',
    ],
  }));

  registerHandler('access.help', async () => ({
    success: true, formatted: [
      '', '┌─ ACCESS — API & Entitlements ──────────────┐',
      '│  access.status       Module status              │',
      '│  access.list_keys    List API keys              │',
      '│  access.usage        Usage metrics              │',
      '│  access.subscription Subscription info          │',
      '│  access.developer    Developer profile          │',
      '│  access.entitlements Active entitlements        │',
      '│  access.products     Product catalog            │',
      '│  access.health       Health score               │',
      '└───────────────────────────────────────────────┘', '',
    ],
  }));

  registerHandler('defense.help', async () => ({
    success: true, formatted: [
      '', '┌─ DEFENSE — Outer Shell ────────────────────┐',
      '│  defense.status      Module status              │',
      '│  defense.analyze     Fingerprint analysis       │',
      '│  defense.audit       Security audit             │',
      '│  defense.scan        Threat scan                │',
      '│  defense.threats     Active threats             │',
      '│  defense.posture     Security posture           │',
      '│  defense.rates       Rate limit status          │',
      '│  defense.health      Health score               │',
      '└───────────────────────────────────────────────┘', '',
    ],
  }));

  log.info('terminal', 'OCG & Shell handlers registered via substrate bridge (RIPPLE, ACCESS, DEFENSE)', { count: 40 });
}
