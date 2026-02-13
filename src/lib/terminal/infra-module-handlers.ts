/**
 * Infrastructure Six Module Terminal Handlers
 * v9.2.0 ARCHITECT — Full terminal integration for MEMORY, RELAY, AUDIT, IDENTITY, ECONOMY, SANDBOX
 */

import { registerHandler } from './validate-registry';
import { log } from '@/lib/system/log';

export function registerInfraModuleHandlers(): void {
  // ═══════════════════════════════════════════════════════
  // MEMORY MODULE
  // ═══════════════════════════════════════════════════════

  registerHandler('memory.status', async () => {
    const { getMemoryModuleState, getMemoryModuleHealth } = await import('@/lib/substrate/memory-module/index');
    const state = getMemoryModuleState();
    return {
      success: true,
      data: {
        initialized: state.initialized,
        health: `${getMemoryModuleHealth()}%`,
        totalVectors: state.totalVectors,
        pipelines: state.pipelines.length,
        indexHealth: state.indexHealth,
        lastIngestion: state.lastIngestion || 'never',
      },
    };
  });

  registerHandler('memory.search', async () => {
    return { success: false, error: 'Usage: memory.search <query>', examples: ['memory.search "how does the event bus work?"'] };
  });

  registerHandler('memory.ingest', async () => {
    return { success: false, error: 'Usage: memory.ingest <source> <format>', examples: ['memory.ingest docs markdown'] };
  });

  registerHandler('memory.pipelines', async () => {
    const { getMemoryModuleState } = await import('@/lib/substrate/memory-module/index');
    return { success: true, data: { pipelines: getMemoryModuleState().pipelines } };
  });

  registerHandler('memory.health', async () => {
    const { getMemoryModuleHealth } = await import('@/lib/substrate/memory-module/index');
    return { success: true, data: { health: getMemoryModuleHealth(), module: 'MEMORY', layer: 'Infrastructure' } };
  });

  registerHandler('memory.help', async () => {
    return {
      success: true,
      formatted: [
        '',
        '┌─────────────────────────────────────────────┐',
        '│       MEMORY MODULE — Terminal Commands      │',
        '└─────────────────────────────────────────────┘',
        '',
        '  memory.status     Module health & vector stats',
        '  memory.search     Semantic search across vectors',
        '  memory.ingest     Ingest knowledge source',
        '  memory.pipelines  List RAG pipelines',
        '  memory.health     Index health score',
        '',
        '  MEMORY provides vector/RAG infrastructure for',
        '  BRAIN cognitive memory and cross-module recall.',
        '',
      ],
    };
  });

  // ═══════════════════════════════════════════════════════
  // RELAY MODULE
  // ═══════════════════════════════════════════════════════

  registerHandler('relay.status', async () => {
    const { getRelayState, getRelayHealth } = await import('@/lib/substrate/relay-module/index');
    const state = getRelayState();
    return {
      success: true,
      data: {
        initialized: state.initialized,
        health: `${getRelayHealth()}%`,
        totalDispatched: state.totalDispatched,
        totalDelivered: state.totalDelivered,
        totalFailed: state.totalFailed,
        pendingQueue: state.pendingQueue,
      },
    };
  });

  registerHandler('relay.dispatch', async () => {
    return { success: false, error: 'Usage: relay.dispatch <target> <payload>', examples: ['relay.dispatch https://api.example.com/webhook {"event":"test"}'] };
  });

  registerHandler('relay.deliveries', async () => {
    const { getRelayState } = await import('@/lib/substrate/relay-module/index');
    const state = getRelayState();
    return {
      success: true,
      data: {
        count: state.deliveries.length,
        deliveries: state.deliveries.slice(-20).map(d => ({
          id: d.id, target: d.target, status: d.status, attempts: d.attempts,
        })),
      },
    };
  });

  registerHandler('relay.health', async () => {
    const { getRelayHealth } = await import('@/lib/substrate/relay-module/index');
    return { success: true, data: { health: getRelayHealth(), module: 'RELAY', layer: 'Infrastructure' } };
  });

  registerHandler('relay.help', async () => {
    return {
      success: true,
      formatted: [
        '',
        '┌─────────────────────────────────────────────┐',
        '│        RELAY MODULE — Terminal Commands      │',
        '└─────────────────────────────────────────────┘',
        '',
        '  relay.status      Module health & delivery stats',
        '  relay.dispatch    Send webhook to target',
        '  relay.deliveries  List recent delivery records',
        '  relay.health      Delivery success rate',
        '',
        '  RELAY handles outbound webhooks, retry logic,',
        '  and circuit-breaking for all external delivery.',
        '',
      ],
    };
  });

  // ═══════════════════════════════════════════════════════
  // AUDIT MODULE
  // ═══════════════════════════════════════════════════════

  registerHandler('audit.status', async () => {
    const { getAuditState, getAuditHealth } = await import('@/lib/substrate/audit-module/index');
    const state = getAuditState();
    return {
      success: true,
      data: {
        initialized: state.initialized,
        health: `${getAuditHealth()}%`,
        totalEntries: state.totalEntries,
        chainValid: state.chainValid,
        modulesMonitored: state.modulesMonitored.length,
        lastEntry: state.lastEntry || 'none',
      },
    };
  });

  registerHandler('audit.log', async () => {
    const { getAuditLog } = await import('@/lib/substrate/audit-module/index');
    const entries = getAuditLog(20);
    return {
      success: true,
      data: {
        count: entries.length,
        entries: entries.map(e => ({
          id: e.id, module: e.module, action: e.action, actor: e.actor.id,
          resource: e.resource, timestamp: new Date(e.timestamp).toISOString(),
        })),
      },
    };
  });

  registerHandler('audit.verify', async () => {
    const { verifyAuditChain } = await import('@/lib/substrate/audit-module/index');
    const result = verifyAuditChain();
    return {
      success: true,
      data: { chainValid: result.valid, brokenAt: result.brokenAt },
      message: result.valid ? '✅ Audit chain integrity verified' : `❌ Chain broken at index ${result.brokenAt}`,
    };
  });

  registerHandler('audit.modules', async () => {
    const { getAuditState } = await import('@/lib/substrate/audit-module/index');
    return { success: true, data: { monitored: getAuditState().modulesMonitored } };
  });

  registerHandler('audit.health', async () => {
    const { getAuditHealth } = await import('@/lib/substrate/audit-module/index');
    return { success: true, data: { health: getAuditHealth(), module: 'AUDIT', layer: 'Infrastructure' } };
  });

  registerHandler('audit.help', async () => {
    return {
      success: true,
      formatted: [
        '',
        '┌─────────────────────────────────────────────┐',
        '│        AUDIT MODULE — Terminal Commands      │',
        '└─────────────────────────────────────────────┘',
        '',
        '  audit.status    Module health & chain status',
        '  audit.log       View recent audit entries',
        '  audit.verify    Verify hash chain integrity',
        '  audit.modules   List monitored modules',
        '  audit.health    Chain validity score',
        '',
        '  AUDIT provides immutable, cryptographically',
        '  chained compliance logging for ALL 21 modules.',
        '',
      ],
    };
  });

  // ═══════════════════════════════════════════════════════
  // IDENTITY MODULE
  // ═══════════════════════════════════════════════════════

  registerHandler('identity.status', async () => {
    const { getIdentityState, getIdentityHealth } = await import('@/lib/substrate/identity-module/index');
    const state = getIdentityState();
    return {
      success: true,
      data: {
        initialized: state.initialized,
        health: `${getIdentityHealth()}%`,
        currentActor: state.currentActor?.displayName || 'none',
        registeredActors: state.registeredActors,
        signaturesIssued: state.signaturesIssued,
        passkeyCount: state.passkeyCount,
        passwordlessEnforced: state.passwordlessEnforced,
      },
    };
  });

  registerHandler('identity.whoami', async () => {
    const { whoami } = await import('@/lib/substrate/identity-module/index');
    const actor = whoami();
    return {
      success: true,
      data: actor
        ? { id: actor.id, type: actor.type, name: actor.displayName, signature: actor.signature }
        : { message: 'No actor set — use identity.register to create one' },
    };
  });

  registerHandler('identity.register', async () => {
    return { success: false, error: 'Usage: identity.register <id> <type> <name>', examples: ['identity.register admin human "System Admin"'] };
  });

  registerHandler('identity.sign', async () => {
    return { success: false, error: 'Usage: identity.sign <actor_id> <action>', examples: ['identity.sign admin deploy.production'] };
  });

  registerHandler('identity.health', async () => {
    const { getIdentityHealth } = await import('@/lib/substrate/identity-module/index');
    return { success: true, data: { health: getIdentityHealth(), module: 'IDENTITY', layer: 'Infrastructure' } };
  });

  registerHandler('identity.help', async () => {
    return {
      success: true,
      formatted: [
        '',
        '┌─────────────────────────────────────────────┐',
        '│      IDENTITY MODULE — Terminal Commands     │',
        '└─────────────────────────────────────────────┘',
        '',
        '  identity.status    Module health & actor stats',
        '  identity.whoami    Current actor identity',
        '  identity.register  Register new actor',
        '  identity.sign      Sign an action',
        '  identity.health    Identity service health',
        '',
        '  IDENTITY provides universal human/agent/system',
        '  attribution with cryptographic signatures.',
        '',
      ],
    };
  });

  // ═══════════════════════════════════════════════════════
  // ECONOMY MODULE
  // ═══════════════════════════════════════════════════════

  registerHandler('economy.status', async () => {
    const { getEconomyState, getEconomyHealth } = await import('@/lib/substrate/economy-module/index');
    const state = getEconomyState();
    return {
      success: true,
      data: {
        initialized: state.initialized,
        health: `${getEconomyHealth()}%`,
        totalSpend: `${(state.totalSpendMillicents / 100000).toFixed(4)} USD`,
        todaySpend: `${(state.todaySpendMillicents / 100000).toFixed(4)} USD`,
        budgets: state.budgets.length,
        costRecords: state.costRecords.length,
        alertsFired: state.alertsFired,
      },
    };
  });

  registerHandler('economy.spend', async () => {
    const { getEconomyState } = await import('@/lib/substrate/economy-module/index');
    const state = getEconomyState();
    return {
      success: true,
      data: {
        total: state.totalSpendMillicents,
        today: state.todaySpendMillicents,
        records: state.costRecords.slice(-10).map(r => ({
          module: r.module, action: r.action, tokens: r.tokenCount, cost: r.costMillicents,
        })),
      },
    };
  });

  registerHandler('economy.budgets', async () => {
    const { getEconomyState } = await import('@/lib/substrate/economy-module/index');
    return { success: true, data: { budgets: getEconomyState().budgets } };
  });

  registerHandler('economy.health', async () => {
    const { getEconomyHealth } = await import('@/lib/substrate/economy-module/index');
    return { success: true, data: { health: getEconomyHealth(), module: 'ECONOMY', layer: 'Infrastructure' } };
  });

  registerHandler('economy.help', async () => {
    return {
      success: true,
      formatted: [
        '',
        '┌─────────────────────────────────────────────┐',
        '│       ECONOMY MODULE — Terminal Commands     │',
        '└─────────────────────────────────────────────┘',
        '',
        '  economy.status    Module health & spend stats',
        '  economy.spend     Cost records & attribution',
        '  economy.budgets   View budget configurations',
        '  economy.health    Budget compliance score',
        '',
        '  ECONOMY provides real-time cost attribution,',
        '  budget enforcement, and marketplace signals.',
        '',
      ],
    };
  });

  // ═══════════════════════════════════════════════════════
  // SANDBOX MODULE
  // ═══════════════════════════════════════════════════════

  registerHandler('sandbox.status', async () => {
    const { getSandboxState, getSandboxHealth } = await import('@/lib/substrate/sandbox-module/index');
    const state = getSandboxState();
    return {
      success: true,
      data: {
        initialized: state.initialized,
        health: `${getSandboxHealth()}%`,
        activeSandboxes: state.activeSandboxes,
        totalCreated: state.totalCreated,
        totalExecutions: state.totalExecutions,
        blockedExecutions: state.blockedExecutions,
      },
    };
  });

  registerHandler('sandbox.create', async () => {
    const { createSandbox } = await import('@/lib/substrate/sandbox-module/index');
    const env = createSandbox({ isolation: 'strict' });
    return { success: true, message: `Sandbox created: ${env.id}`, data: { id: env.id, isolation: env.isolationLevel, ttlMs: env.ttlMs } };
  });

  registerHandler('sandbox.list', async () => {
    const { getSandboxState } = await import('@/lib/substrate/sandbox-module/index');
    return { success: true, data: getSandboxState() };
  });

  registerHandler('sandbox.health', async () => {
    const { getSandboxHealth } = await import('@/lib/substrate/sandbox-module/index');
    return { success: true, data: { health: getSandboxHealth(), module: 'SANDBOX', layer: 'Infrastructure' } };
  });

  registerHandler('sandbox.help', async () => {
    return {
      success: true,
      formatted: [
        '',
        '┌─────────────────────────────────────────────┐',
        '│       SANDBOX MODULE — Terminal Commands     │',
        '└─────────────────────────────────────────────┘',
        '',
        '  sandbox.status    Module health & env stats',
        '  sandbox.create    Create isolated environment',
        '  sandbox.list      List all sandboxes',
        '  sandbox.health    Isolation integrity score',
        '',
        '  SANDBOX provides isolated execution environments',
        '  for safe code execution and speculative runs.',
        '',
      ],
    };
  });

  log.info('terminal', 'Infrastructure Six module handlers registered', { count: 30 });
}
