/**
 * Intent Mesh — Terminal Handlers
 * v10.0.0 — mesh.* command namespace
 */

import { registerHandler } from './validate-registry';

export function registerMeshHandlers() {
  // ═══ mesh.status — Get mesh state ═══
  registerHandler('mesh.status', async () => {
    const { isMeshEnabled, MESH_MANIFEST, getMeshModules } = await import('@/lib/substrate/intent-mesh');
    const { getMeshStats } = await import('@/lib/substrate/intent-mesh');
    
    const enabled = isMeshEnabled();
    const modules = getMeshModules();
    const activeResolvers = MESH_MANIFEST.filter(r => r.enabled).length;
    const stats = await getMeshStats();
    
    return {
      success: true,
      data: {
        enabled,
        modules: modules.length,
        resolvers: { total: MESH_MANIFEST.length, active: activeResolvers },
        stats: {
          totalIntents: stats.totalIntents,
          successRate: `${(stats.successRate * 100).toFixed(1)}%`,
          avgLatencyMs: stats.avgDurationMs,
          topRoutes: stats.topRoutes.slice(0, 5),
        },
      },
    };
  });

  // ═══ mesh.toggle — Enable/disable mesh ═══
  registerHandler('mesh.toggle', async () => {
    const { isMeshEnabled, enableMesh, disableMesh } = await import('@/lib/substrate/intent-mesh');
    
    const wasEnabled = isMeshEnabled();
    if (wasEnabled) {
      disableMesh();
    } else {
      enableMesh();
    }
    
    return {
      success: true,
      data: {
        previousState: wasEnabled ? 'enabled' : 'disabled',
        newState: wasEnabled ? 'disabled' : 'enabled',
        message: wasEnabled ? 'Intent Mesh disabled (kill switch activated)' : 'Intent Mesh enabled',
      },
    };
  });

  // ═══ mesh.on — Enable mesh ═══
  registerHandler('mesh.on', async () => {
    const { enableMesh } = await import('@/lib/substrate/intent-mesh');
    enableMesh();
    return { success: true, data: { message: 'Intent Mesh enabled' } };
  });

  // ═══ mesh.off — Disable mesh (kill switch) ═══
  registerHandler('mesh.off', async () => {
    const { disableMesh } = await import('@/lib/substrate/intent-mesh');
    disableMesh();
    return { success: true, data: { message: 'Intent Mesh disabled (kill switch)' } };
  });

  // ═══ mesh.log — Get recent receipts ═══
  registerHandler('mesh.log', async () => {
    const { getRecentReceipts } = await import('@/lib/substrate/intent-mesh');
    const receipts = await getRecentReceipts(15);
    
    return {
      success: true,
      data: {
        count: receipts.length,
        receipts: receipts.map(r => ({
          intent: r.intent_type,
          source: r.source_module,
          resolvedBy: r.resolved_by,
          governance: r.governance_mode,
          success: r.success,
          durationMs: r.duration_ms,
        })),
      },
    };
  });

  // ═══ mesh.resolvers — List all resolvers ═══
  registerHandler('mesh.resolvers', async () => {
    const { MESH_MANIFEST, getMeshModules } = await import('@/lib/substrate/intent-mesh');
    const modules = getMeshModules();
    
    const byModule = modules.map(mod => ({
      module: mod,
      resolvers: MESH_MANIFEST
        .filter(r => r.module === mod)
        .map(r => ({ id: r.id, domains: r.domains, risk: r.risk, enabled: r.enabled })),
    }));
    
    return {
      success: true,
      data: { totalResolvers: MESH_MANIFEST.length, modules: byModule },
    };
  });

  // ═══ mesh.broadcast — Test broadcast an intent ═══
  registerHandler('mesh.broadcast', async () => {
    const { isMeshEnabled, broadcastIntent } = await import('@/lib/substrate/intent-mesh');
    
    if (!isMeshEnabled()) {
      return { success: false, error: 'Intent Mesh is disabled. Run mesh.on first.' };
    }
    
    const result = await broadcastIntent({
      sourceModule: 'DEFENSE',
      intentType: 'actor_enrichment',
      domains: ['security', 'identity', 'session'],
      input: { ip: '192.168.1.1', actor_id: 'test-actor' },
      governanceMode: 'read_only',
    });
    
    return {
      success: true,
      data: {
        intentId: result.intentId,
        resolversMatched: result.resolversMatched,
        resolversResponded: result.resolversResponded,
        durationMs: result.totalDurationMs,
        composedResult: result.composedResult,
        responses: result.responses.map(r => ({
          resolver: r.resolverId,
          module: r.module,
          success: r.success,
          durationMs: r.durationMs,
        })),
      },
    };
  });

  // ═══ mesh.help — Show mesh commands ═══
  registerHandler('mesh.help', async () => {
    return {
      success: true,
      data: {
        description: 'Intent Mesh — Emergent Module Intelligence (v10.0)',
        commands: {
          'mesh.status': 'Get mesh state, stats, and top routes',
          'mesh.toggle': 'Toggle mesh on/off (kill switch)',
          'mesh.on': 'Enable the intent mesh',
          'mesh.off': 'Disable the intent mesh (kill switch)',
          'mesh.log': 'View recent mesh receipts',
          'mesh.resolvers': 'List all module resolvers',
          'mesh.broadcast': 'Test broadcast a DEFENSE → actor_enrichment intent',
          'mesh.help': 'Show this help',
        },
      },
    };
  });
}
