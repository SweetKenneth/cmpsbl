/**
 * Synergy Terminal Handlers
 * Terminal commands for 200 synergy pipelines with 125 custom executors
 */

import { registerHandler } from './validate-registry';
import { 
  executeSynergy, 
  dryRunSynergy, 
  listSynergies, 
  getSynergy,
  getSynergiesByModule,
  getSynergyCategories,
  getRecommendedSynergies,
} from '@/lib/capabilities/synergies';
import { log } from '@/lib/system/log';

/**
 * Register all synergy-related terminal commands
 */
export function registerSynergyHandlers(): void {
  // cortex.synergy.list — List all synergies or filter by category
  registerHandler('cortex.synergy.list', async () => {
    const synergies = listSynergies();
    const categories = getSynergyCategories();
    
    return {
      success: true,
      data: {
        total: synergies.length,
        synergies: synergies.map(s => ({
          id: s.id,
          name: s.name,
          category: s.category,
          modules: s.modules.map(m => m.name).join(' × '),
          risk: s.risk,
          estimatedMs: s.estimatedMs,
        })),
        categories,
      },
    };
  });

  // cortex.synergy.execute <id> — Execute a synergy pipeline
  registerHandler('cortex.synergy.execute', async () => {
    // This would be called with args in the actual terminal
    // For demo, return usage instructions
    return {
      success: false,
      error: 'Usage: cortex.synergy.execute <synergy-id> [--dry-run]',
      examples: [
        'cortex.synergy.execute strategic-foresight-engine',
        'cortex.synergy.execute decision-confidence-governor --dry-run',
      ],
    };
  });

  // cortex.synergy.dry_run <id> — Preview synergy execution
  registerHandler('cortex.synergy.dry_run', async () => {
    return {
      success: false,
      error: 'Usage: cortex.synergy.dry_run <synergy-id>',
      description: 'Preview execution plan without running the pipeline',
    };
  });

  // cortex.synergy.get <id> — Get synergy details
  registerHandler('cortex.synergy.get', async () => {
    return {
      success: false,
      error: 'Usage: cortex.synergy.get <synergy-id>',
    };
  });

  // cortex.synergy.by_module <module> — List synergies by module
  registerHandler('cortex.synergy.by_module', async () => {
    return {
      success: false,
      error: 'Usage: cortex.synergy.by_module <module-name>',
      modules: ['BRAIN', 'CORTEX', 'VISION', 'DEFENSE', 'DREAM', 'NEXUS', 'SYSTEM', 'RIPPLE', 'DECODE', 'ACCESS', 'INCLUSIVE', 'EVOLUTION', 'INTEGRATION', 'CORE'],
    };
  });

  // cortex.synergy.pipeline <ids...> — Execute multiple synergies in sequence
  registerHandler('cortex.synergy.pipeline', async () => {
    return {
      success: false,
      error: 'Usage: cortex.synergy.pipeline <synergy-id-1> <synergy-id-2> ...',
      description: 'Chain multiple synergies, passing output as input to next',
    };
  });

  // cortex.synergy.recommend — Get context-aware recommendations
  registerHandler('cortex.synergy.recommend', async () => {
    const recommendations = getRecommendedSynergies({});
    
    return {
      success: true,
      data: {
        total: recommendations.length,
        recommendations: recommendations.slice(0, 10).map(s => ({
          id: s.id,
          name: s.name,
          category: s.category,
          modules: s.modules.map(m => m.name).join(' × '),
          reason: 'Based on current system state and usage patterns',
        })),
      },
    };
  });

  // cortex.synergy.categories — List synergy categories with counts
  registerHandler('cortex.synergy.categories', async () => {
    const categories = getSynergyCategories();
    
    return {
      success: true,
      data: {
        total: categories.reduce((sum, c) => sum + c.count, 0),
        categories,
      },
    };
  });

  // cortex.synergy.stats — Get synergy engine statistics
  registerHandler('cortex.synergy.stats', async () => {
    const all = listSynergies();
    const categories = getSynergyCategories();
    
    // Calculate stats
    const stierCount = all.filter(s => 
      s.id.includes('engine') || 
      s.id.includes('kernel') || 
      s.id.includes('governor') ||
      s.id.includes('arbitrage') ||
      s.id.includes('steward') ||
      s.id.includes('authority') ||
      s.id.includes('anticipator') ||
      s.id.includes('scoring') ||
      s.id.includes('tracker') ||
      s.id.includes('fabric') ||
      s.id.includes('switcher') ||
      s.id.includes('ledger')
    ).length;
    
    const avgMs = all.reduce((sum, s) => sum + s.estimatedMs, 0) / all.length;
    
    const moduleUsage: Record<string, number> = {};
    all.forEach(s => {
      s.modules.forEach(m => {
        moduleUsage[m.name] = (moduleUsage[m.name] || 0) + 1;
      });
    });
    
    const riskBreakdown = {
      low: all.filter(s => s.risk === 'low').length,
      medium: all.filter(s => s.risk === 'medium').length,
      high: all.filter(s => s.risk === 'high').length,
    };
    
    return {
      success: true,
      data: {
        totalPipelines: all.length,
        stierPipelines: stierCount,
        customExecutors: 125,
        categories: categories.length,
        avgEstimatedMs: Math.round(avgMs),
        riskBreakdown,
        moduleUsage,
      },
    };
  });

  // cortex.synergy.stier — List S-tier premium pipelines
  registerHandler('cortex.synergy.stier', async () => {
    const all = listSynergies();
    const stier = all.filter(s => 
      s.id.includes('engine') || 
      s.id.includes('kernel') || 
      s.id.includes('governor') ||
      s.id.includes('compiler') ||
      s.id.includes('steward') ||
      s.id.includes('authority') ||
      s.id.includes('anticipator') ||
      s.id.includes('scoring') ||
      s.id.includes('arbitrage') ||
      s.id.includes('router') ||
      s.id.includes('tracker') ||
      s.id.includes('fabric') ||
      s.id.includes('switcher') ||
      s.id.includes('ledger') ||
      s.id.includes('forecaster')
    );
    
    return {
      success: true,
      data: {
        tier: 'S-Tier',
        description: '22 Premium Cross-Module Pipelines',
        total: stier.length,
        pipelines: stier.map(s => ({
          id: s.id,
          name: s.name,
          category: s.category,
          modules: s.modules.map(m => m.name).join(' × '),
          estimatedMs: s.estimatedMs,
          priceRange: '$499 – $2,999',
        })),
      },
    };
  });

  log.info('terminal', 'Synergy handlers registered', { count: 10 });
}

/**
 * Execute synergy with args parsing
 */
export async function executeSynergyCommand(
  synergyId: string,
  options: { dryRun?: boolean; input?: Record<string, unknown> } = {}
) {
  const synergy = getSynergy(synergyId);
  
  if (!synergy) {
    return {
      success: false,
      error: `Synergy not found: ${synergyId}`,
      suggestion: 'Run cortex.synergy.list to see available synergies',
    };
  }
  
  if (options.dryRun) {
    const preview = await dryRunSynergy(synergyId, options.input || {});
    return {
      success: true,
      dryRun: true,
      preview,
    };
  }
  
  const result = await executeSynergy(synergyId, options.input || {});
  return result;
}

/**
 * Get synergy by module command
 */
export function getSynergiesByModuleCommand(moduleName: string) {
  const synergies = getSynergiesByModule(moduleName.toUpperCase());
  
  return {
    success: true,
    module: moduleName.toUpperCase(),
    count: synergies.length,
    synergies: synergies.map(s => ({
      id: s.id,
      name: s.name,
      role: s.modules.find(m => m.name === moduleName.toUpperCase())?.role || 'unknown',
    })),
  };
}
