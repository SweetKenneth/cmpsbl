/**
 * Infrastructure Six Module Terminal Handlers
 * MEMORY, RELAY, AUDIT, IDENTITY, ECONOMY, SANDBOX
 * ALL routed through pf-substrate edge function
 */

import { registerHandler } from './validate-registry';
import { bridge } from './substrate-bridge';
import { log } from '@/lib/system/log';

export function registerInfraModuleHandlers(): void {
  // ═══ MEMORY — Cognitive Loop Persistence ═══
  registerHandler('memory.status', bridge('memory', 'status'));
  registerHandler('memory.search', bridge('memory', 'search'));
  registerHandler('memory.ingest', bridge('memory', 'ingest'));
  registerHandler('memory.pipelines', bridge('memory', 'pipelines'));
  registerHandler('memory.health', bridge('memory', 'health'));
  // Cognitive loop commands (Phase 2 — unified persistence)
  registerHandler('memory.store', bridge('memory', 'store'));
  registerHandler('memory.stream', bridge('memory', 'stream'));
  registerHandler('memory.recall', bridge('memory', 'recall'));
  registerHandler('memory.prune', bridge('memory', 'prune'));

  registerHandler('memory.help', async () => ({
    success: true,
    formatted: [
      '', '┌─ MEMORY — Cognitive Loop Persistence ──────┐',
      '│  memory.status     Module health & vector stats │',
      '│  memory.store      Persist a memory to substrate│',
      '│  memory.stream     Recent memory chain           │',
      '│  memory.recall     Semantic memory recall        │',
      '│  memory.search     Semantic search               │',
      '│  memory.prune      Prune old memories            │',
      '│  memory.ingest     Ingest knowledge source       │',
      '│  memory.pipelines  List RAG pipelines            │',
      '│  memory.health     Index health score             │',
      '└───────────────────────────────────────────────┘', '',
    ],
  }));

  // ═══ RELAY ═══
  registerHandler('relay.status', bridge('relay', 'status'));
  registerHandler('relay.dispatch', bridge('relay', 'dispatch'));
  registerHandler('relay.deliveries', bridge('relay', 'deliveries'));
  registerHandler('relay.health', bridge('relay', 'health'));

  registerHandler('relay.help', async () => ({
    success: true,
    formatted: [
      '', '┌─ RELAY — Webhook Delivery ─────────────────┐',
      '│  relay.status      Module health & stats        │',
      '│  relay.dispatch    Send webhook                  │',
      '│  relay.deliveries  Recent delivery records       │',
      '│  relay.health      Delivery success rate         │',
      '└───────────────────────────────────────────────┘', '',
    ],
  }));

  // ═══ AUDIT ═══
  registerHandler('audit.status', bridge('audit', 'status'));
  registerHandler('audit.log', bridge('audit', 'log'));
  registerHandler('audit.verify', bridge('audit', 'verify'));
  registerHandler('audit.modules', bridge('audit', 'modules'));
  registerHandler('audit.health', bridge('audit', 'health'));

  registerHandler('audit.help', async () => ({
    success: true,
    formatted: [
      '', '┌─ AUDIT — Compliance Logging ───────────────┐',
      '│  audit.status    Module health & chain status    │',
      '│  audit.log       View recent audit entries       │',
      '│  audit.verify    Verify hash chain integrity     │',
      '│  audit.modules   List monitored modules          │',
      '│  audit.health    Chain validity score             │',
      '└───────────────────────────────────────────────┘', '',
    ],
  }));

  // ═══ IDENTITY ═══
  registerHandler('identity.status', bridge('identity', 'status'));
  registerHandler('identity.whoami', bridge('identity', 'whoami'));
  registerHandler('identity.register', bridge('identity', 'register'));
  registerHandler('identity.sign', bridge('identity', 'sign'));
  registerHandler('identity.health', bridge('identity', 'health'));

  registerHandler('identity.help', async () => ({
    success: true,
    formatted: [
      '', '┌─ IDENTITY — Actor Attribution ─────────────┐',
      '│  identity.status    Module health & actor stats  │',
      '│  identity.whoami    Current actor identity        │',
      '│  identity.register  Register new actor           │',
      '│  identity.sign      Sign an action               │',
      '│  identity.health    Identity service health       │',
      '└───────────────────────────────────────────────┘', '',
    ],
  }));

  // ═══ ECONOMY ═══
  registerHandler('economy.status', bridge('economy', 'status'));
  registerHandler('economy.spend', bridge('economy', 'spend'));
  registerHandler('economy.budgets', bridge('economy', 'budgets'));
  registerHandler('economy.health', bridge('economy', 'health'));

  registerHandler('economy.help', async () => ({
    success: true,
    formatted: [
      '', '┌─ ECONOMY — Cost Attribution ───────────────┐',
      '│  economy.status    Module health & spend stats   │',
      '│  economy.spend     Cost records & attribution    │',
      '│  economy.budgets   View budget configurations    │',
      '│  economy.health    Budget compliance score        │',
      '└───────────────────────────────────────────────┘', '',
    ],
  }));

  // ═══ SANDBOX ═══
  registerHandler('sandbox.status', bridge('sandbox', 'status'));
  registerHandler('sandbox.create', bridge('sandbox', 'create'));
  registerHandler('sandbox.list', bridge('sandbox', 'list'));
  registerHandler('sandbox.health', bridge('sandbox', 'health'));

  registerHandler('sandbox.help', async () => ({
    success: true,
    formatted: [
      '', '┌─ SANDBOX — Isolated Execution ─────────────┐',
      '│  sandbox.status    Module health & env stats     │',
      '│  sandbox.create    Create isolated environment   │',
      '│  sandbox.list      List all sandboxes            │',
      '│  sandbox.health    Isolation integrity score      │',
      '└───────────────────────────────────────────────┘', '',
    ],
  }));

  log.info('terminal', 'Infrastructure Six module handlers registered via substrate bridge', { count: 36 });
}
