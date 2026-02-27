/**
 * Execution Layer Terminal Handlers
 * DECODE, NEXUS, VISION, CORTEX, INCLUSIVE, INTEGRATION, MODERNIZER
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
  // MODERNIZER — Evolution engine
  // ═══════════════════════════════════════════════════════

  registerHandler('modernizer.status', async () => {
    const { modernizer } = await import('@/lib/substrate');
    return await modernizer.status();
  });

  registerHandler('modernizer.scan', async () => {
    const { modernizer } = await import('@/lib/substrate');
    return await modernizer.scan();
  });

  registerHandler('modernizer.propose', async () => {
    return { success: false, error: 'Usage: modernizer.propose <description>' };
  });

  registerHandler('modernizer.apply', async () => {
    return { success: false, error: 'Usage: modernizer.apply <plan_id>' };
  });

  registerHandler('modernizer.verify', async () => {
    return { success: false, error: 'Usage: modernizer.verify <run_id>' };
  });

  registerHandler('modernizer.plans', async () => {
    const { modernizer } = await import('@/lib/substrate');
    return await modernizer.jobs();
  });

  registerHandler('modernizer.runs', async () => {
    const { substrate } = await import('@/lib/substrate');
    return await substrate.invoke({ module: 'modernizer', action: 'runs' });
  });

  registerHandler('modernizer.health', async () => {
    const { modernizer } = await import('@/lib/substrate');
    const status = await modernizer.status();
    return { success: true, data: { health: (status as any)?.data?.health || 100, module: 'MODERNIZER', layer: 'Execution' } };
  });

  log.info('terminal', 'Execution layer handlers registered (DECODE, NEXUS, VISION, CORTEX, INCLUSIVE, INTEGRATION, MODERNIZER)', { count: 43 });
}
