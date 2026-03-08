/**
 * OCG & Shell Terminal Handlers — RIPPLE, ACCESS, DEFENSE
 * Registers governance-gated handlers for OCG Grid + Shell nodes
 * 
 * Note: IDENTITY, RELAY, AUDIT are registered in infra-module-handlers.ts
 */

import { registerHandler } from './validate-registry';
import { log } from '@/lib/system/log';

export function registerOCGHandlers(): void {
  // ═══════════════════════════════════════════════════════
  // RIPPLE — Signal/event bus, inter-zone communication
  // ═══════════════════════════════════════════════════════

  registerHandler('ripple.status', async () => {
    const { ripple } = await import('@/lib/substrate');
    return await ripple.status();
  });

  registerHandler('ripple.pulse', async () => {
    const { ripple } = await import('@/lib/substrate');
    return await ripple.pulse();
  });

  registerHandler('ripple.topics', async () => {
    const { ripple } = await import('@/lib/substrate');
    return await ripple.topics();
  });

  registerHandler('ripple.events', async () => {
    return { success: false, error: 'Usage: ripple.events [topic] [limit]' };
  });

  registerHandler('ripple.publish', async () => {
    return { success: false, error: 'Usage: ripple.publish <topic> <event_type> [payload]' };
  });

  registerHandler('ripple.subscribe', async () => {
    return { success: false, error: 'Usage: ripple.subscribe <topic> <module> <action>' };
  });

  registerHandler('ripple.enqueue', async () => {
    return { success: false, error: 'Usage: ripple.enqueue <queue> <payload>' };
  });

  registerHandler('ripple.dequeue', async () => {
    return { success: false, error: 'Usage: ripple.dequeue <queue>' };
  });

  registerHandler('ripple.dead_letter', async () => {
    const { ripple } = await import('@/lib/substrate');
    return await ripple.deadLetter();
  });

  registerHandler('ripple.retry', async () => {
    return { success: false, error: 'Usage: ripple.retry <job_id>' };
  });

  registerHandler('ripple.metrics', async () => {
    const { ripple } = await import('@/lib/substrate');
    return await ripple.metrics();
  });

  registerHandler('ripple.replay', async () => {
    return { success: false, error: 'Usage: ripple.replay <topic> [limit]' };
  });

  registerHandler('ripple.jobs', async () => {
    const { ripple } = await import('@/lib/substrate');
    return await ripple.jobs({});
  });

  registerHandler('ripple.work', async () => {
    const { ripple } = await import('@/lib/substrate');
    return await ripple.work(undefined, true);
  });

  registerHandler('ripple.drain', async () => {
    return { success: false, error: 'Usage: ripple.drain [queue]' };
  });

  registerHandler('ripple.ack', async () => {
    return { success: false, error: 'Usage: ripple.ack <job_id>' };
  });

  registerHandler('ripple.nack', async () => {
    return { success: false, error: 'Usage: ripple.nack <job_id> [reason]' };
  });

  registerHandler('ripple.circuits', async () => {
    const { ripple } = await import('@/lib/substrate');
    return await ripple.circuits();
  });

  registerHandler('ripple.health', async () => {
    const { ripple } = await import('@/lib/substrate');
    const status = await ripple.status();
    return { success: true, data: { health: (status as any)?.data?.health || 100, module: 'RIPPLE', layer: 'OCG' } };
  });

  // ═══════════════════════════════════════════════════════
  // ACCESS — API entitlements, developer keys, rate limiting
  // ═══════════════════════════════════════════════════════

  registerHandler('access.status', async () => {
    const { access } = await import('@/lib/substrate');
    return await access.status();
  });

  registerHandler('access.pulse', async () => {
    const { access } = await import('@/lib/substrate');
    return await access.pulse();
  });

  registerHandler('access.create_key', async () => {
    return { success: false, error: 'Usage: access.create_key [name] [scopes...]' };
  });

  registerHandler('access.validate_key', async () => {
    return { success: false, error: 'Usage: access.validate_key <api_key>' };
  });

  registerHandler('access.revoke_key', async () => {
    return { success: false, error: 'Usage: access.revoke_key <key_id>' };
  });

  registerHandler('access.list_keys', async () => {
    const { access } = await import('@/lib/substrate');
    return await access.listKeys();
  });

  registerHandler('access.usage', async () => {
    const { access } = await import('@/lib/substrate');
    return await access.getUsage({});
  });

  registerHandler('access.quota', async () => {
    return { success: false, error: 'Usage: access.quota [product_code]' };
  });

  registerHandler('access.subscription', async () => {
    const { access } = await import('@/lib/substrate');
    return await access.subscription();
  });

  registerHandler('access.register', async () => {
    return { success: false, error: 'Usage: access.register [display_name]' };
  });

  registerHandler('access.bootstrap', async () => {
    const { access } = await import('@/lib/substrate');
    return await access.bootstrap();
  });

  registerHandler('access.developer', async () => {
    const { access } = await import('@/lib/substrate');
    return await access.developer();
  });

  registerHandler('access.developers', async () => {
    const { access } = await import('@/lib/substrate');
    return await access.developers();
  });

  registerHandler('access.identity', async () => {
    const { access } = await import('@/lib/substrate');
    return await access.identity();
  });

  registerHandler('access.entitlements', async () => {
    const { access } = await import('@/lib/substrate');
    return await access.entitlements();
  });

  registerHandler('access.products', async () => {
    const { access } = await import('@/lib/substrate');
    return await access.products();
  });

  registerHandler('access.health', async () => {
    const { access } = await import('@/lib/substrate');
    const status = await access.status();
    return { success: true, data: { health: (status as any)?.data?.health || 100, module: 'ACCESS', layer: 'OCG' } };
  });

  // ═══════════════════════════════════════════════════════
  // DEFENSE (Shell) — Outer containment boundary
  // ═══════════════════════════════════════════════════════

  registerHandler('defense.status', async () => {
    const { defense } = await import('@/lib/substrate');
    return await defense.status();
  });

  registerHandler('defense.analyze', async () => {
    return { success: false, error: 'Usage: defense.analyze <fingerprint> [ip]' };
  });

  registerHandler('defense.verify', async () => {
    return { success: false, error: 'Usage: defense.verify <action_id>' };
  });

  registerHandler('defense.audit', async () => {
    const { substrate } = await import('@/lib/substrate');
    return await substrate.invoke({ module: 'defense', action: 'audit' });
  });

  registerHandler('defense.scan', async () => {
    const { substrate } = await import('@/lib/substrate');
    return await substrate.invoke({ module: 'defense', action: 'scan' });
  });

  registerHandler('defense.threats', async () => {
    const { substrate } = await import('@/lib/substrate');
    return await substrate.invoke({ module: 'defense', action: 'threats' });
  });

  registerHandler('defense.quarantine', async () => {
    return { success: false, error: 'Usage: defense.quarantine <entity_id>' };
  });

  registerHandler('defense.release', async () => {
    return { success: false, error: 'Usage: defense.release <entity_id>' };
  });

  registerHandler('defense.rates', async () => {
    const { substrate } = await import('@/lib/substrate');
    return await substrate.invoke({ module: 'defense', action: 'rates' });
  });

  registerHandler('defense.posture', async () => {
    const { defense } = await import('@/lib/substrate');
    return await defense.posture();
  });

  registerHandler('defense.health', async () => {
    const { defense } = await import('@/lib/substrate');
    const status = await defense.status();
    return { success: true, data: { health: (status as any)?.data?.health || 100, module: 'DEFENSE', layer: 'Shell' } };
  });

  // ═══ HELP COMMANDS ═══

  registerHandler('ripple.help', async () => ({
    success: true,
    formatted: [
      '', '┌─ RIPPLE — Signal Bus ──────────────────────┐',
      '│  ripple.status     Module status               │',
      '│  ripple.pulse      Heartbeat                   │',
      '│  ripple.topics     Active topics                │',
      '│  ripple.events     Event log                    │',
      '│  ripple.publish    Publish event                │',
      '│  ripple.dead_letter Dead letter queue           │',
      '│  ripple.metrics    Bus metrics                  │',
      '│  ripple.jobs       Job queue                    │',
      '│  ripple.circuits   Circuit breaker states       │',
      '│  ripple.health     Health score                 │',
      '│  ripple.hardening  Hardening (Tsunami)          │',
      '└───────────────────────────────────────────────┘', '',
    ],
  }));

  registerHandler('access.help', async () => ({
    success: true,
    formatted: [
      '', '┌─ ACCESS — API & Entitlements ──────────────┐',
      '│  access.status       Module status              │',
      '│  access.pulse        Heartbeat                  │',
      '│  access.list_keys    List API keys              │',
      '│  access.usage        Usage metrics              │',
      '│  access.subscription Subscription info          │',
      '│  access.developer    Developer profile          │',
      '│  access.entitlements Active entitlements        │',
      '│  access.products     Product catalog            │',
      '│  access.health       Health score               │',
      '│  access.hardening    Hardening status           │',
      '└───────────────────────────────────────────────┘', '',
    ],
  }));

  registerHandler('defense.help', async () => ({
    success: true,
    formatted: [
      '', '┌─ DEFENSE — Outer Shell ────────────────────┐',
      '│  defense.status      Module status              │',
      '│  defense.analyze     Fingerprint analysis       │',
      '│  defense.audit       Security audit             │',
      '│  defense.scan        Threat scan                │',
      '│  defense.threats     Active threats             │',
      '│  defense.posture     Security posture           │',
      '│  defense.rates       Rate limit status          │',
      '│  defense.health      Health score               │',
      '│  defense.hardening   Hardening (Fortress)       │',
      '└───────────────────────────────────────────────┘', '',
    ],
  }));

  log.info('terminal', 'OCG & Shell handlers registered (RIPPLE, ACCESS, DEFENSE)', { count: 40 });
}
