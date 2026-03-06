/**
 * Intent Mesh — Terminal Handlers
 * mesh.* command namespace
 * Adds: module self-discovery, intent scoring, auto-scheduler, proposals
 */

import { registerHandler } from './validate-registry';

export function registerMeshHandlers() {
  // ═══ mesh.status — Get mesh state ═══
  registerHandler('mesh.status', async () => {
    const { isMeshEnabled, MESH_MANIFEST, getMeshModules, getMeshStats } = await import('@/lib/substrate/intent-mesh');
    
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
    wasEnabled ? disableMesh() : enableMesh();
    return {
      success: true,
      data: {
        previousState: wasEnabled ? 'enabled' : 'disabled',
        newState: wasEnabled ? 'disabled' : 'enabled',
        message: wasEnabled ? 'Intent Mesh disabled (kill switch activated)' : 'Intent Mesh enabled',
      },
    };
  });

  // ═══ mesh.on / mesh.off ═══
  registerHandler('mesh.on', async () => {
    const { enableMesh } = await import('@/lib/substrate/intent-mesh');
    enableMesh();
    return { success: true, data: { message: 'Intent Mesh enabled' } };
  });

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
          id: r.id,
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

  // ═══ mesh.history [n] — Deep history with output data ═══
  registerHandler('mesh.history', async (args?: string) => {
    const { getRecentReceipts } = await import('@/lib/substrate/intent-mesh');
    const limit = parseInt(args || '25', 10);
    const receipts = await getRecentReceipts(Math.min(limit, 100));
    
    return {
      success: true,
      data: {
        count: receipts.length,
        limit,
        history: receipts.map(r => ({
          id: r.id,
          intent: r.intent_type,
          source: r.source_module,
          resolvedBy: r.resolved_by,
          targetModules: r.target_modules,
          governance: r.governance_mode,
          success: r.success,
          durationMs: r.duration_ms,
          inputSummary: r.input_summary,
          outputSummary: r.output_summary,
          error: r.error_message,
        })),
      },
    };
  });

  // ═══ mesh.replay <id> — Replay a specific receipt's intent ═══
  registerHandler('mesh.replay', async (args?: string) => {
    if (!args?.trim()) {
      return { success: false, error: 'Usage: mesh.replay <receipt_id>. Get IDs from mesh.history.' };
    }
    
    const { isMeshEnabled, broadcastIntent, getRecentReceipts } = await import('@/lib/substrate/intent-mesh');
    
    if (!isMeshEnabled()) {
      return { success: false, error: 'Intent Mesh is disabled. Run mesh.on first.' };
    }
    
    const receiptId = args.trim();
    const receipts = await getRecentReceipts(100);
    const receipt = receipts.find(r => r.id === receiptId || r.id?.startsWith(receiptId));
    
    if (!receipt) {
      return { success: false, error: `Receipt '${receiptId}' not found. Run mesh.history to see available IDs.` };
    }
    
    const result = await broadcastIntent({
      sourceModule: receipt.source_module,
      intentType: receipt.intent_type,
      domains: receipt.target_modules || [],
      input: (receipt.input_summary || {}) as Record<string, unknown>,
      governanceMode: (receipt.governance_mode as 'read_only' | 'governed' | 'emergency') || 'read_only',
    });
    
    return {
      success: true,
      data: {
        replayedFrom: receiptId,
        newIntentId: result.intentId,
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

  // ═══ mesh.save <name> — Save latest successful receipt as pipeline ═══
  registerHandler('mesh.save', async (args?: string) => {
    const name = args?.trim();
    if (!name) {
      return { success: false, error: 'Usage: mesh.save <pipeline_name>. Saves the most recent successful receipt as a reusable pipeline.' };
    }

    const { getRecentReceipts } = await import('@/lib/substrate/intent-mesh');
    const { savePipelineFromReceipt } = await import('@/lib/substrate/intent-mesh/pipelines');
    
    const receipts = await getRecentReceipts(10);
    const successfulReceipt = receipts.find(r => r.success && r.resolved_by && r.resolved_by.length > 0);
    
    if (!successfulReceipt) {
      return { success: false, error: 'No successful receipts found to save. Run mesh.broadcast first.' };
    }
    
    const pipeline = await savePipelineFromReceipt(successfulReceipt, name);
    
    return {
      success: true,
      data: {
        message: `Pipeline "${name}" crystallized from mesh discovery`,
        pipeline: {
          id: pipeline?.id,
          name: pipeline?.name,
          source: pipeline?.source_module,
          intentType: pipeline?.intent_type,
          resolverChain: pipeline?.resolver_chain,
          governance: pipeline?.governance_mode,
        },
      },
    };
  });

  // ═══ mesh.pipelines — List saved pipelines ═══
  registerHandler('mesh.pipelines', async () => {
    const { getSavedPipelines } = await import('@/lib/substrate/intent-mesh/pipelines');
    const pipelines = await getSavedPipelines();
    
    return {
      success: true,
      data: {
        count: pipelines.length,
        pipelines: pipelines.map(p => ({
          id: p.id,
          name: p.name,
          source: p.source_module,
          intentType: p.intent_type,
          resolverChain: p.resolver_chain,
          governance: p.governance_mode,
          runs: p.run_count,
          active: p.is_active,
        })),
      },
    };
  });

  // ═══ mesh.run <name_or_id> — Run a saved pipeline ═══
  registerHandler('mesh.run', async (args?: string) => {
    if (!args?.trim()) {
      return { success: false, error: 'Usage: mesh.run <pipeline_name_or_id>. See mesh.pipelines for available.' };
    }
    
    const { isMeshEnabled } = await import('@/lib/substrate/intent-mesh');
    if (!isMeshEnabled()) {
      return { success: false, error: 'Intent Mesh is disabled. Run mesh.on first.' };
    }
    
    const { getSavedPipelines, runSavedPipeline } = await import('@/lib/substrate/intent-mesh/pipelines');
    const pipelines = await getSavedPipelines();
    const query = args.trim().toLowerCase();
    const pipeline = pipelines.find(p => 
      p.id === query || 
      p.id.startsWith(query) || 
      p.name.toLowerCase() === query ||
      p.name.toLowerCase().includes(query)
    );
    
    if (!pipeline) {
      return { success: false, error: `Pipeline '${args.trim()}' not found. Run mesh.pipelines to see available.` };
    }
    
    const result = await runSavedPipeline(pipeline);
    
    return {
      success: true,
      data: {
        pipeline: pipeline.name,
        intentId: result.intentId,
        resolversMatched: result.resolversMatched,
        resolversResponded: result.resolversResponded,
        durationMs: result.totalDurationMs,
        composedResult: result.composedResult,
      },
    };
  });

  // ═══ mesh.resolvers — List all resolvers ═══
  registerHandler('mesh.resolvers', async () => {
    const { MESH_MANIFEST, getMeshModules } = await import('@/lib/substrate/intent-mesh');
    const modules = getMeshModules();
    const byModule = modules.map(mod => ({
      module: mod,
      resolvers: MESH_MANIFEST.filter(r => r.module === mod).map(r => ({ id: r.id, domains: r.domains, risk: r.risk, enabled: r.enabled })),
    }));
    return { success: true, data: { totalResolvers: MESH_MANIFEST.length, modules: byModule } };
  });

  // ═══ mesh.broadcast — Test broadcast ═══
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
          resolver: r.resolverId, module: r.module, success: r.success, durationMs: r.durationMs,
        })),
      },
    };
  });

  // ═══ mesh.refine — Multi-turn refined broadcast ═══
  registerHandler('mesh.refine', async (args?: string) => {
    const { isMeshEnabled, resolveWithRefinement } = await import('@/lib/substrate/intent-mesh');
    if (!isMeshEnabled()) {
      return { success: false, error: 'Intent Mesh is disabled. Run mesh.on first.' };
    }
    
    const maxTurns = parseInt(args || '3', 10);
    const result = await resolveWithRefinement({
      sourceModule: 'DEFENSE',
      intentType: 'actor_enrichment',
      domains: ['security', 'identity', 'session'],
      input: { ip: '192.168.1.1', actor_id: 'test-actor' },
      governanceMode: 'read_only',
    }, { maxTurns });

    return {
      success: true,
      data: {
        totalTurns: result.totalTurns,
        improved: result.improved,
        totalResolversUsed: result.totalResolversUsed,
        totalDurationMs: result.totalDurationMs,
        dataKeysCollected: Object.keys(result.composedResult).filter(k => !k.startsWith('_')).length,
        turns: result.turns,
        composedResult: result.composedResult,
      },
    };
  });

  // ═══ mesh.chains — Discover composite resolver chains ═══
  registerHandler('mesh.chains', async (args?: string) => {
    const { discoverChains, getChainSummary } = await import('@/lib/substrate/intent-mesh');
    
    if (args?.trim()) {
      // Discover chains for specific seed inputs
      const seeds = args.split(',').map(s => s.trim());
      const chains = discoverChains(seeds, { maxDepth: 4, maxChains: 10 });
      return {
        success: true,
        data: {
          seedInputs: seeds,
          chainsFound: chains.length,
          chains: chains.map(c => ({
            name: c.name,
            depth: c.depth,
            steps: c.steps.map(s => s.resolverId),
            outputs: c.totalOutputs.length,
          })),
        },
      };
    }
    
    const summary = getChainSummary();
    return {
      success: true,
      data: {
        totalChains: summary.totalChains,
        maxDepth: summary.maxDepth,
        uniqueModules: summary.uniqueModules,
        topChains: summary.topChains,
        hint: 'Run mesh.chains <key1,key2> to discover chains for specific inputs (e.g., mesh.chains ip,actor_id)',
      },
    };
  });

  // ═══ mesh.chain.run <seed_keys> — Execute the optimal chain for given inputs ═══
  registerHandler('mesh.chain.run', async (args?: string) => {
    if (!args?.trim()) {
      return { success: false, error: 'Usage: mesh.chain.run <key1,key2> — e.g., mesh.chain.run ip,actor_id' };
    }
    
    const { isMeshEnabled, findOptimalChain, executeChain } = await import('@/lib/substrate/intent-mesh');
    if (!isMeshEnabled()) {
      return { success: false, error: 'Intent Mesh is disabled. Run mesh.on first.' };
    }
    
    const seeds = args.split(',').map(s => s.trim());
    const chain = findOptimalChain('enrichment', seeds);
    
    if (!chain) {
      return { success: false, error: `No composite chains found for inputs: ${seeds.join(', ')}` };
    }
    
    const input: Record<string, unknown> = {};
    for (const key of seeds) input[key] = `test-${key}`;
    
    const result = await executeChain(chain, input);
    
    return {
      success: true,
      data: {
        chainName: chain.name,
        stepsCompleted: `${result.stepsCompleted}/${result.stepsTotal}`,
        totalDurationMs: result.totalDurationMs,
        dataKeysProduced: Object.keys(result.composedData).filter(k => !k.startsWith('_')).length,
        steps: result.stepResults,
        composedData: result.composedData,
      },
    };
  });

  // ═══ mesh.flush — Force-flush pending gap signals ═══
  registerHandler('mesh.flush', async () => {
    const { flushGapDetection } = await import('@/lib/substrate/intent-mesh');
    await flushGapDetection();
    return { success: true, data: { message: 'Gap detection buffer flushed to discovery engine' } };
  });

  // ═══ mesh.discover.all — Run self-discovery for all entities ═══
  registerHandler('mesh.discover.all', async () => {
    const { runAllModuleDiscovery, persistProposals } = await import('@/lib/substrate/intent-mesh');
    const result = await runAllModuleDiscovery();
    const allProposals = result.moduleResults.flatMap(r => r.proposals);
    const persisted = await persistProposals(allProposals.slice(0, 20));
    return {
      success: true,
      data: {
        modulesScanned: result.moduleResults.length,
        totalProposals: result.totalProposals,
        persisted,
        durationMs: result.durationMs,
        topModules: result.moduleResults
          .filter(r => r.proposals.length > 0)
          .sort((a, b) => b.proposals.length - a.proposals.length)
          .slice(0, 5)
          .map(r => ({ module: r.module, proposals: r.proposals.length, findings: r.introspectionFindings.length })),
      },
    };
  });

  // ═══ mesh.discover <module> — Self-discovery for one module ═══
  registerHandler('mesh.discover.module', async (args?: string) => {
    if (!args?.trim()) return { success: false, error: 'Usage: mesh.discover.module <MODULE_NAME>' };
    const { runModuleDiscovery, persistProposals } = await import('@/lib/substrate/intent-mesh');
    const result = await runModuleDiscovery(args.trim());
    if (result.proposals.length > 0) await persistProposals(result.proposals);
    return {
      success: true,
      data: {
        module: result.module,
        proposals: result.proposals.map(p => ({ id: p.proposedResolverId, method: p.discoveryMethod, confidence: p.confidenceScore, description: p.description })),
        introspection: result.introspectionFindings,
        gapResponses: result.gapResponses,
        durationMs: result.durationMs,
      },
    };
  });

  // ═══ mesh.scores — Intent quality leaderboard ═══
  registerHandler('mesh.scores', async () => {
    const { getIntentLeaderboard } = await import('@/lib/substrate/intent-mesh');
    const board = await getIntentLeaderboard();
    return {
      success: true,
      data: {
        topIntents: board.topIntents.slice(0, 5).map(s => ({ intent: s.intentType, source: s.sourceModule, score: s.overallScore, trend: s.trend })),
        worstIntents: board.worstIntents.slice(0, 5).map(s => ({ intent: s.intentType, source: s.sourceModule, score: s.overallScore, trend: s.trend })),
        moduleRankings: board.moduleRankings.slice(0, 10),
      },
    };
  });

  // ═══ mesh.proposals — View pending module proposals ═══
  registerHandler('mesh.proposals', async () => {
    const { getPendingRecommendations } = await import('@/lib/substrate/intent-mesh');
    const recs = await getPendingRecommendations();
    return {
      success: true,
      data: {
        count: recs.length,
        proposals: recs.slice(0, 15).map(r => ({ resolver: r.proposedResolverId, module: r.targetModule, confidence: r.confidenceScore, description: r.proposedDescription })),
      },
    };
  });

  // ═══ mesh.approve <resolver_id> — Approve a proposal ═══
  registerHandler('mesh.approve', async (args?: string) => {
    if (!args?.trim()) return { success: false, error: 'Usage: mesh.approve <resolver_id>' };
    const { approveProposal } = await import('@/lib/substrate/intent-mesh');
    const ok = await approveProposal(args.trim());
    return { success: ok, data: { message: ok ? `Approved and added: ${args.trim()}` : 'Proposal not found or already applied' } };
  });

  // ═══ mesh.reject <resolver_id> — Reject a proposal ═══
  registerHandler('mesh.reject', async (args?: string) => {
    if (!args?.trim()) return { success: false, error: 'Usage: mesh.reject <resolver_id>' };
    const { rejectProposal } = await import('@/lib/substrate/intent-mesh');
    const ok = await rejectProposal(args.trim());
    return { success: ok, data: { message: ok ? `Rejected: ${args.trim()}` : 'Proposal not found' } };
  });

  // ═══ mesh.scheduler — View/control auto-expansion scheduler ═══
  registerHandler('mesh.scheduler', async (args?: string) => {
    const { meshScheduler } = await import('@/lib/substrate/intent-mesh');
    if (args?.trim() === 'start') { meshScheduler.start(); return { success: true, data: { message: 'Scheduler started' } }; }
    if (args?.trim() === 'stop') { meshScheduler.stop(); return { success: true, data: { message: 'Scheduler stopped' } }; }
    if (args?.trim() === 'run') { const r = await meshScheduler.runOnce(); return { success: true, data: { message: 'Full cycle complete', ...r } }; }
    return { success: true, data: meshScheduler.getState() };
  });

  // ═══ mesh.clm.feedback — Run CLM feedback loop from scoring data ═══
  registerHandler('mesh.clm.feedback', async () => {
    const { runCLMFeedbackLoop } = await import('@/lib/substrate/intent-mesh');
    const result = await runCLMFeedbackLoop();
    return {
      success: true,
      data: {
        modulesUpdated: result.modulesUpdated,
        insightsGenerated: result.insightsGenerated,
        insights: result.insights.slice(0, 10).map(i => ({
          module: i.module,
          priority: i.priority,
          topic: i.topic.slice(0, 120),
        })),
      },
    };
  });

  // ═══ mesh.clm.summary — Get CLM feedback summary ═══
  registerHandler('mesh.clm.summary', async () => {
    const { getCLMFeedbackSummary } = await import('@/lib/substrate/intent-mesh');
    return { success: true, data: getCLMFeedbackSummary() };
  });

  // ═══ mesh.live.gaps — Run live gap execution against real DB data ═══
  registerHandler('mesh.live.gaps', async () => {
    const { runLiveGapExecution } = await import('@/lib/substrate/intent-mesh');
    const report = await runLiveGapExecution();
    return {
      success: true,
      data: {
        totalAnalyzed: report.totalIntentsAnalyzed,
        gapsFound: report.gapsFound,
        criticalGaps: report.criticalGaps,
        proposalsGenerated: report.proposalsGenerated,
        durationMs: report.durationMs,
        topGaps: report.gaps.slice(0, 8).map(g => ({
          intent: g.intentType, source: g.sourceModule, severity: g.severity,
          failureRate: g.failureRate, missing: g.missingModules,
          proposal: g.autoProposal ? g.autoProposal.resolverId : null,
        })),
        moduleResponseRates: report.moduleResponseRates.slice(0, 10),
      },
    };
  });

  // ═══ mesh.affinity.matrix — Build full affinity matrix with drift detection ═══
  registerHandler('mesh.affinity.matrix', async () => {
    const { buildAffinityMatrix } = await import('@/lib/substrate/intent-mesh');
    const matrix = await buildAffinityMatrix();
    return {
      success: true,
      data: {
        totalEdges: matrix.edges.length,
        clusters: matrix.clusters,
        driftAlerts: matrix.driftAlerts,
        topConnections: matrix.edges.slice(0, 10).map(e => ({
          pair: `${e.moduleA} ↔ ${e.moduleB}`,
          score: e.combinedScore,
          structural: e.structuralAffinity,
          behavioral: e.behavioralAffinity,
          trend: e.trend,
          sharedDomains: e.sharedDomains.slice(0, 4),
        })),
        moduleStrengths: matrix.moduleStrengths.slice(0, 10),
      },
    };
  });

  // ═══ mesh.affinity <module> — Get affinity for specific module ═══
  registerHandler('mesh.affinity.module', async (args?: string) => {
    if (!args?.trim()) return { success: false, error: 'Usage: mesh.affinity.module <MODULE_NAME>' };
    const { getModuleAffinity } = await import('@/lib/substrate/intent-mesh');
    const result = await getModuleAffinity(args.trim().toUpperCase());
    return {
      success: true,
      data: {
        module: args.trim().toUpperCase(),
        avgAffinity: result.avgAffinity,
        cluster: result.cluster,
        partners: result.partners.slice(0, 10),
      },
    };
  });

  // ═══ mesh.patterns — Detect intent patterns and suggest pipelines ═══
  registerHandler('mesh.patterns', async () => {
    const { detectPatterns } = await import('@/lib/substrate/intent-mesh');
    const report = await detectPatterns();
    return {
      success: true,
      data: {
        patternsFound: report.patternsFound,
        coOccurrence: report.coOccurrencePatterns.slice(0, 5).map(p => ({
          intents: p.intents, frequency: p.frequency, confidence: p.confidence,
        })),
        sequential: report.sequentialPatterns.slice(0, 5).map(p => ({
          chain: p.intents.join(' → '), frequency: p.frequency, avgIntervalMs: p.avgIntervalMs,
        })),
        collaboration: report.collaborationPatterns.slice(0, 5).map(p => ({
          modules: p.modules, frequency: p.frequency, intents: p.intents.length,
        })),
        pipelineSuggestions: report.pipelineSuggestions.slice(0, 5),
        analyzedReceipts: report.analyzedReceipts,
        durationMs: report.durationMs,
      },
    };
  });

  // ═══ mesh.discover.advanced — Run all three advanced discovery phases ═══
  registerHandler('mesh.discover.advanced', async () => {
    const { meshScheduler } = await import('@/lib/substrate/intent-mesh');
    const result = await meshScheduler.runOnce();
    return {
      success: true,
      data: {
        message: 'Full advanced discovery cycle complete',
        ...result,
      },
    };
  });

  // ═══ mesh.help — Full command reference ═══
  registerHandler('mesh.help', async () => {
    return {
      success: true,
      data: {
        description: 'Intent Mesh — Emergent Module Intelligence',
        commands: {
          'mesh.status': 'Get mesh state, stats, and top routes',
          'mesh.toggle': 'Toggle mesh on/off (kill switch)',
          'mesh.on / mesh.off': 'Enable/disable the intent mesh',
          'mesh.log': 'View recent mesh receipts (compact)',
          'mesh.history [n]': 'Deep history with input/output data',
          'mesh.replay <id>': 'Replay a specific receipt\'s intent',
          'mesh.save <name>': 'Save receipt as reusable pipeline',
          'mesh.pipelines': 'List saved/crystallized pipelines',
          'mesh.run <name>': 'Run a saved pipeline',
          'mesh.resolvers': 'List all module resolvers',
          'mesh.broadcast': 'Test broadcast DEFENSE → actor_enrichment',
          'mesh.refine [n]': 'Multi-turn refined broadcast',
          'mesh.chains [keys]': 'Discover composite resolver chains',
          'mesh.chain.run <keys>': 'Execute optimal chain',
          'mesh.flush': 'Force-flush pending gap signals',
          'mesh.discover': 'Run discovery cycle (gaps → recommendations)',
          'mesh.discover.all': 'Run self-discovery for all 9 modules',
          'mesh.discover.module <name>': 'Run self-discovery for one module',
          'mesh.discover.advanced': 'Run all advanced discovery phases',
          'mesh.scores': 'Intent quality leaderboard',
          'mesh.proposals': 'View pending module proposals',
          'mesh.approve <id>': 'Approve a proposal → add to manifest',
          'mesh.reject <id>': 'Reject a proposal',
          'mesh.scheduler [start|stop|run]': 'Auto-expansion scheduler',
          'mesh.clm.feedback': 'Run CLM feedback loop from scoring → learning',
          'mesh.clm.summary': 'View CLM feedback summary across modules',
          'mesh.live.gaps': '🆕 Live gap execution against real DB receipts',
          'mesh.affinity.matrix': '🆕 Full cross-module affinity matrix with drift',
          'mesh.affinity.module <name>': '🆕 Affinity partners for one module',
          'mesh.patterns': '🆕 Detect intent patterns & pipeline suggestions',
          'mesh.gaps': 'View open capability gaps',
          'mesh.recommendations': 'View pending recommendations',
          'mesh.expand': 'Apply high-confidence recommendations',
          'mesh.affinity': 'Cross-module connection density (legacy)',
          'mesh.help': 'Show this help',
        },
      },
    };
  });
}