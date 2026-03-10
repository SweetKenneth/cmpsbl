/**
 * Execution Layer Terminal Handlers
 * DECODE, NEXUS, VISION, CORTEX, INCLUSIVE, INTEGRATION, EVOLUTION
 * 
 * Note: ENCODE is in encode-handlers.ts, ECONOMY/SANDBOX in infra-module-handlers.ts
 */

import { registerHandler } from './validate-registry';
import { log } from '@/lib/system/log';

export function registerExecutionHandlers(): void {
  // ═══════════════════════════════════════════════════════
  // DECODE — Intent translator
  // ═══════════════════════════════════════════════════════

  registerHandler('decode.status', async () => {
    const { decode } = await import('@/lib/substrate');
    return await decode.status();
  });

  registerHandler('decode.interpret', async () => {
    return { success: false, error: 'Usage: decode.interpret <text>' };
  });

  registerHandler('decode.personality', async () => {
    const { decode } = await import('@/lib/substrate');
    return await decode.personality.get();
  });

  registerHandler('decode.personality_set', async () => {
    return { success: false, error: 'Usage: decode.personality_set <profile_id>' };
  });

  registerHandler('decode.personality_detect', async () => {
    return { success: false, error: 'Usage: decode.personality_detect <text>' };
  });

  registerHandler('decode.personality_lock', async () => {
    const { decode } = await import('@/lib/substrate');
    return await decode.personality.lock();
  });

  registerHandler('decode.personality_unlock', async () => {
    const { decode } = await import('@/lib/substrate');
    return await decode.personality.unlock();
  });

  registerHandler('decode.health', async () => {
    const { decode } = await import('@/lib/substrate');
    const status = await decode.status();
    return { success: true, data: { health: (status as any)?.data?.health || 100, module: 'DECODE', layer: 'Execution' } };
  });

  // ═══════════════════════════════════════════════════════
  // NEXUS — AI router
  // ═══════════════════════════════════════════════════════

  registerHandler('nexus.status', async () => {
    const { nexus } = await import('@/lib/substrate');
    return await nexus.status();
  });

  registerHandler('nexus.query', async () => {
    return { success: false, error: 'Usage: nexus.query <prompt>' };
  });

  registerHandler('nexus.routes', async () => {
    const { nexus } = await import('@/lib/substrate');
    return await nexus.routeStats();
  });

  registerHandler('nexus.budget', async () => {
    const { substrate } = await import('@/lib/substrate');
    return await substrate.invoke({ module: 'nexus', action: 'budget' });
  });

  registerHandler('nexus.providers', async () => {
    const { nexus } = await import('@/lib/substrate');
    return await nexus.providers();
  });

  registerHandler('nexus.health', async () => {
    const { nexus } = await import('@/lib/substrate');
    const status = await nexus.status();
    return { success: true, data: { health: (status as any)?.data?.health || 100, module: 'NEXUS', layer: 'Execution' } };
  });

  // ═══════════════════════════════════════════════════════
  // VISION — Perception engine
  // ═══════════════════════════════════════════════════════

  registerHandler('vision.status', async () => {
    const { vision } = await import('@/lib/substrate');
    return await vision.status();
  });

  registerHandler('vision.scan', async () => {
    return { success: false, error: 'Usage: vision.scan <url>' };
  });

  registerHandler('vision.screenshot', async () => {
    return { success: false, error: 'Usage: vision.screenshot <url>' };
  });

  registerHandler('vision.accessibility', async () => {
    return { success: false, error: 'Usage: vision.accessibility <url>' };
  });

  registerHandler('vision.health', async () => {
    const { vision } = await import('@/lib/substrate');
    const status = await vision.status();
    return { success: true, data: { health: (status as any)?.data?.health || 100, module: 'VISION', layer: 'Execution' } };
  });

  // ═══════════════════════════════════════════════════════
  // CORTEX — Orchestrator
  // ═══════════════════════════════════════════════════════

  registerHandler('cortex.status', async () => {
    const { cortex } = await import('@/lib/substrate');
    return await cortex.status();
  });

  registerHandler('cortex.pipeline', async () => {
    return { success: false, error: 'Usage: cortex.pipeline <pipeline_id>' };
  });

  registerHandler('cortex.pipelines', async () => {
    const { substrate } = await import('@/lib/substrate');
    return await substrate.invoke({ module: 'cortex', action: 'pipelines' });
  });

  registerHandler('cortex.cognitive', async () => {
    const { substrate } = await import('@/lib/substrate');
    return await substrate.invoke({ module: 'cortex', action: 'cognitive' });
  });

  registerHandler('cortex.health', async () => {
    const { cortex } = await import('@/lib/substrate');
    const status = await cortex.status();
    return { success: true, data: { health: (status as any)?.data?.health || 100, module: 'CORTEX', layer: 'Execution' } };
  });

  // ═══════════════════════════════════════════════════════
  // INCLUSIVE — Accessibility & compliance
  // ═══════════════════════════════════════════════════════

  registerHandler('inclusive.status', async () => {
    const { inclusive } = await import('@/lib/substrate');
    return await inclusive.status();
  });

  registerHandler('inclusive.scan', async () => {
    return { success: false, error: 'Usage: inclusive.scan <url>' };
  });

  registerHandler('inclusive.report', async () => {
    const { inclusive } = await import('@/lib/substrate');
    return await inclusive.report('latest');
  });

  registerHandler('inclusive.health', async () => {
    const { inclusive } = await import('@/lib/substrate');
    const status = await inclusive.status();
    return { success: true, data: { health: (status as any)?.data?.health || 100, module: 'INCLUSIVE', layer: 'Execution' } };
  });

  // ═══════════════════════════════════════════════════════
  // INTEGRATION — Enterprise adapters
  // ═══════════════════════════════════════════════════════

  registerHandler('integration.status', async () => {
    const { integration } = await import('@/lib/substrate');
    return await integration.status();
  });

  registerHandler('integration.pulse', async () => {
    const { integration } = await import('@/lib/substrate');
    return await integration.pulse();
  });

  registerHandler('integration.adapters', async () => {
    const { integration } = await import('@/lib/substrate');
    return await integration.adapters();
  });

  registerHandler('integration.connections', async () => {
    const { integration } = await import('@/lib/substrate');
    return await integration.connections();
  });

  registerHandler('integration.discovered', async () => {
    const { integration } = await import('@/lib/substrate');
    return await integration.discovered();
  });

  registerHandler('integration.mapped_commands', async () => {
    return { success: false, error: 'Usage: integration.mapped_commands [adapter_id]' };
  });

  registerHandler('integration.policies', async () => {
    const { integration } = await import('@/lib/substrate');
    return await integration.policies();
  });

  registerHandler('integration.audit_log', async () => {
    const { integration } = await import('@/lib/substrate');
    return await integration.auditLog({});
  });

  registerHandler('integration.connect', async () => {
    return { success: false, error: 'Usage: integration.connect <type> <name> <config>' };
  });

  registerHandler('integration.disconnect', async () => {
    return { success: false, error: 'Usage: integration.disconnect <connection_id>' };
  });

  registerHandler('integration.health', async () => {
    const { integration } = await import('@/lib/substrate');
    const status = await integration.status();
    return { success: true, data: { health: (status as any)?.data?.health || 100, module: 'INTEGRATION', layer: 'Execution' } };
  });

  // ═══════════════════════════════════════════════════════
  // EVOLUTION — Self-Improvement Engine (legacy modernizer.* aliases kept for backward compat)
  // ═══════════════════════════════════════════════════════

  registerHandler('modernizer.status', async () => {
    const { evolutionClient } = await import('@/lib/substrate');
    return await evolutionClient.status();
  });

  registerHandler('modernizer.scan', async () => {
    const { evolutionClient } = await import('@/lib/substrate');
    return await evolutionClient.scan();
  });

  registerHandler('modernizer.propose', async () => {
    return { success: false, error: 'Usage: evolution.propose <description>' };
  });

  registerHandler('modernizer.apply', async () => {
    return { success: false, error: 'Usage: evolution.apply <plan_id>' };
  });

  registerHandler('modernizer.verify', async () => {
    return { success: false, error: 'Usage: evolution.verify <run_id>' };
  });

  registerHandler('modernizer.plans', async () => {
    const { evolutionClient } = await import('@/lib/substrate');
    return await evolutionClient.jobs();
  });

  registerHandler('modernizer.runs', async () => {
    const { substrate } = await import('@/lib/substrate');
    return await substrate.invoke({ module: 'evolution', action: 'runs' });
  });

  registerHandler('modernizer.health', async () => {
    const { evolutionClient } = await import('@/lib/substrate');
    const status = await evolutionClient.status();
    return { success: true, data: { health: (status as any)?.data?.health || 100, module: 'EVOLUTION', layer: 'Execution' } };
  });

  // ═══ HELP COMMANDS ═══

  registerHandler('decode.help', async () => ({
    success: true,
    formatted: [
      '', '┌─ DECODE — Intent Translator ───────────────┐',
      '│  decode.status           Module status          │',
      '│  decode.interpret <t>    Parse intent           │',
      '│  decode.personality      Current personality    │',
      '│  decode.personality_set  Set personality        │',
      '│  decode.inbox            CLM inbox              │',
      '│  decode.health           Health score           │',
      '│  decode.hardening        Hardening (Cipher)     │',
      '└───────────────────────────────────────────────┘', '',
    ],
  }));

  registerHandler('nexus.help', async () => ({
    success: true,
    formatted: [
      '', '┌─ NEXUS — AI Router ────────────────────────┐',
      '│  nexus.status     Module status                │',
      '│  nexus.query <p>  Route AI query               │',
      '│  nexus.routes     Route statistics             │',
      '│  nexus.budget     Budget status                │',
      '│  nexus.providers  Provider fleet               │',
      '│  nexus.health     Health score                 │',
      '└───────────────────────────────────────────────┘', '',
    ],
  }));

  registerHandler('vision.help', async () => ({
    success: true,
    formatted: [
      '', '┌─ VISION — Perception Engine ───────────────┐',
      '│  vision.status          Module status           │',
      '│  vision.scan <url>      Scan URL               │',
      '│  vision.screenshot      Screenshot URL         │',
      '│  vision.accessibility   A11y scan              │',
      '│  vision.health          Health score           │',
      '│  vision.hardening       Hardening (Sentinel)   │',
      '└───────────────────────────────────────────────┘', '',
    ],
  }));

  registerHandler('cortex.help', async () => ({
    success: true,
    formatted: [
      '', '┌─ CORTEX — Orchestrator ────────────────────┐',
      '│  cortex.status     Module status               │',
      '│  cortex.pipeline   Pipeline details            │',
      '│  cortex.pipelines  List all pipelines          │',
      '│  cortex.cognitive  Cognitive cycle             │',
      '│  cortex.health     Health score                │',
      '│  cortex.hardening  Hardening (Conductor)       │',
      '│  cortex.synergy.*  200 synergy pipelines       │',
      '└───────────────────────────────────────────────┘', '',
    ],
  }));

  registerHandler('inclusive.help', async () => ({
    success: true,
    formatted: [
      '', '┌─ INCLUSIVE — Accessibility ─────────────────┐',
      '│  inclusive.status   Module status               │',
      '│  inclusive.scan     Accessibility scan          │',
      '│  inclusive.report   Latest report               │',
      '│  inclusive.health   Health score                │',
      '│  inclusive.hardening Hardening (Clarity)        │',
      '└───────────────────────────────────────────────┘', '',
    ],
  }));

  registerHandler('integration.help', async () => ({
    success: true,
    formatted: [
      '', '┌─ INTEGRATION — Enterprise Adapters ────────┐',
      '│  integration.status      Module status          │',
      '│  integration.pulse       Heartbeat              │',
      '│  integration.adapters    Adapter registry       │',
      '│  integration.connections Active connections     │',
      '│  integration.discovered  Discovered services    │',
      '│  integration.policies    Policies               │',
      '│  integration.audit_log   Audit trail            │',
      '│  integration.health      Health score           │',
      '└───────────────────────────────────────────────┘', '',
    ],
  }));

  registerHandler('modernizer.help', async () => ({
    success: true,
    formatted: [
      '', '┌─ EVOLUTION — Self-Improvement Engine ──────┐',
      '│  evolution.status    Node status                │',
      '│  evolution.scan      Scan for upgrades          │',
      '│  evolution.propose   Propose evolution           │',
      '│  evolution.apply     Apply evolution              │',
      '│  evolution.verify    Verify run                  │',
      '│  evolution.plans     List plans                  │',
      '│  evolution.runs      Execution history           │',
      '│  evolution.health    Health score                │',
      '└───────────────────────────────────────────────┘', '',
    ],
  }));

  log.info('terminal', 'Execution layer handlers registered (DECODE, NEXUS, VISION, CORTEX, INCLUSIVE, INTEGRATION, EVOLUTION)', { count: 50 });
}
