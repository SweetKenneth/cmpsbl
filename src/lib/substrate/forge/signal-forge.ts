/**
 * FORGE Primitive — Signal Forge (Template Synthesis Engine)
 * 
 * Registers the autonomous template generator as a first-class FORGE primitive.
 * Exposes batch synthesis, combo retirement tracking, and generator statistics
 * as capabilities within the FORGE node's manufacturing pipeline.
 * 
 * This primitive wraps the combinatorial template-generator engine
 * (31 modules × 20 categories) and surfaces it through the standard
 * FORGE artifact synthesis interface.
 */

import {
  generateTemplateBatch,
  getGeneratorStats,
  getRetiredCombos,
  retireCombo,
  isComboRetired,
  clearRetired,
  type GeneratedTemplate,
  type GeneratorConfig,
  type RetiredCombo,
} from '@/lib/discovery/template-generator';

// ═══════════════════════════════════════════════════════════════════════════════
// PRIMITIVE ID & METADATA
// ═══════════════════════════════════════════════════════════════════════════════

export const SIGNAL_FORGE_PRIMITIVE = {
  id: 'forge.signal-forge',
  name: 'SIGNAL FORGE',
  node: 'FORGE',
  category: 'synthesis',
  priority: 92,
  description:
    'Autonomous template synthesis engine. Generates production-ready pipeline templates ' +
    'from the combinatorial module × category × capability space with CJPI validation, ' +
    'combo retirement tracking, and exhaustion-aware batch generation.',
  capabilities: [
    'template_synthesis',
    'combo_retirement',
    'batch_generation',
    'cjpi_validation',
    'topology_exploration',
  ],
} as const;

// ═══════════════════════════════════════════════════════════════════════════════
// FORGE-COMPATIBLE INTERFACE
// ═══════════════════════════════════════════════════════════════════════════════

export interface ForgeSignalRequest {
  batchSize?: number;
  minModules?: number;
  maxModules?: number;
  minCjpiTarget?: number;
  biasHighValue?: boolean;
}

export interface ForgeSignalResult {
  templates: GeneratedTemplate[];
  stats: ReturnType<typeof getGeneratorStats>;
  batchId: string;
  forgedAt: number;
  executionMs: number;
}

/**
 * Execute a SIGNAL FORGE synthesis run through the FORGE node interface.
 * Returns a batch of unique, CJPI-validated pipeline templates.
 */
export function forgeSignalBatch(request: ForgeSignalRequest = {}): ForgeSignalResult {
  const start = performance.now();

  const config: Partial<GeneratorConfig> = {
    batchSize: request.batchSize ?? 12,
    minModules: request.minModules ?? 2,
    maxModules: request.maxModules ?? 5,
    minCjpiTarget: request.minCjpiTarget ?? 80,
    biasHighValue: request.biasHighValue ?? true,
  };

  const templates = generateTemplateBatch(config);
  const executionMs = Math.round(performance.now() - start);

  return {
    templates,
    stats: getGeneratorStats(),
    batchId: `sf-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
    forgedAt: Date.now(),
    executionMs,
  };
}

/**
 * Retire a module×category combination so the FORGE avoids re-synthesizing it.
 */
export function forgeRetireCombo(
  modules: string[],
  category: string,
  totalRuns: number,
  totalDiscoveries: number,
): void {
  retireCombo(modules, category, totalRuns, totalDiscoveries);
}

/**
 * Check if a specific combination has been retired from the FORGE.
 */
export function forgeIsComboRetired(modules: string[], category: string): boolean {
  return isComboRetired(modules, category);
}

/**
 * Get all retired combinations from the FORGE.
 */
export function forgeGetRetired(): RetiredCombo[] {
  return getRetiredCombos();
}

/**
 * Reset the retirement registry — use with caution.
 */
export function forgeClearRetired(): void {
  clearRetired();
}

/**
 * Get FORGE Signal statistics for the observability layer.
 */
export function forgeSignalStats() {
  return {
    primitive: SIGNAL_FORGE_PRIMITIVE,
    generator: getGeneratorStats(),
  };
}
