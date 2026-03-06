/**
 * Patch Plan Generator — DECODE PLAN stage
 * Transforms classified intent into a structured PatchPlan for review.
 */

import type { PatchPlan, PatchChange } from './types';

export interface IntentContext {
  summary: string;
  modules?: string[];
  changes?: PatchChange[];
  risks?: string[];
  questions?: string[];
  targetSurface?: string;
  destructiveAllowed?: boolean;
}

/**
 * Generate a PatchPlan from a classified intent.
 * This is called during the PLAN stage of the DECODE pipeline.
 */
export function generatePatchPlan(intent: IntentContext): PatchPlan {
  const id = `plan-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

  // Infer modules from intent if not provided
  const modules = intent.modules ?? inferModules(intent.summary);

  // Infer risks from intent characteristics
  const risks = intent.risks ?? inferRisks(intent);

  return {
    plan_id: id,
    created_at: new Date().toISOString(),
    title: intent.summary?.slice(0, 120) || 'Generated plan',
    intent: typeof intent === 'string' ? intent : JSON.stringify(intent),
    modules,
    changes: intent.changes ?? [],
    risks,
    questions: intent.questions ?? [],
    status: 'draft',
  };
}

/**
 * Infer which modules an intent affects based on keyword analysis.
 */
function inferModules(summary: string): string[] {
  const moduleKeywords: Record<string, string[]> = {
    ENCODE: ['code', 'generate', 'patch', 'refactor', 'build', 'implement'],
    DECODE: ['interpret', 'parse', 'classify', 'intent', 'understand', 'personality', 'conversation'],
    BRAIN: ['memory', 'recall', 'remember', 'learn', 'knowledge', 'clm', 'cognition'],
    DEFENSE: ['security', 'threat', 'guard', 'protect', 'rate limit', 'firewall', 'bot'],
    NEXUS: ['route', 'provider', 'model', 'ai', 'llm', 'fleet'],
    EVOLUTION: ['evolve', 'mutate', 'improve', 'upgrade', 'modernize', 'canary', 'seba'],
    SYSTEM: ['config', 'setting', 'system', 'boot', 'health', 'heartbeat'],
    VISION: ['scan', 'monitor', 'observe', 'watch', 'detect', 'telemetry', 'analytics', 'metric'],
    CORTEX: ['orchestrate', 'coordinate', 'pipeline', 'workflow'],
    MEMORY: ['store', 'persist', 'cache', 'retrieve', 'gc', 'tier'],
    ECONOMY: ['cost', 'budget', 'pricing', 'billing', 'marketplace', 'revenue', 'quota'],
    SANDBOX: ['sandbox', 'isolat', 'safe execution', 'speculative'],
    INCLUSIVE: ['accessibility', 'wcag', 'a11y', 'inclusive'],
    GOVERNANCE: ['governance', 'ethics', 'veto', 'epistemic', 'coherence'],
    IMMUNITY: ['resilience', 'self-healing', 'shadow training', 'gap classification'],
    INTENT: ['goal', 'resolution', 'decompos'],
    MEDIC: ['diagnostic', 'self-repair', 'health check', 'failure forecast'],
    NERVE: ['signal', 'heartbeat', 'consensus', 'partition', 'state sync'],
    INTEGRATION: ['oauth', 'webhook', 'connector', 'third party', 'external'],
    IDENTITY: ['passkey', 'identity', 'device trust', 'cryptographic'],
    ACCESS: ['api key', 'developer', 'subscription', 'entitlement'],
    AUDIT: ['audit', 'receipt', 'trail', 'tamper', 'merkle'],
    RELAY: ['relay', 'inter-module', 'communication'],
    DREAM: ['dream', 'synthesis', 'consolidation', 'subconscious'],
    SOVEREIGN: ['sovereignty', 'gdpr', 'ccpa', 'jurisdiction', 'residency'],
    ORACLE: ['prediction', 'bayesian', 'monte carlo', 'forecast'],
    FORGE: ['forge', 'artifact', 'template', 'manufacture'],
    LINGUA: ['translat', 'localizat', 'i18n', 'multi-language'],
    PHANTOM: ['privacy', 'anonymiz', 'pii', 'mask'],
    HARVEST: ['etl', 'ingestion', 'data acquisition', 'pipeline'],
  };

  const lower = summary.toLowerCase();
  const matched: string[] = [];

  for (const [mod, keywords] of Object.entries(moduleKeywords)) {
    if (keywords.some(kw => lower.includes(kw))) {
      matched.push(mod);
    }
  }

  return matched.length > 0 ? matched : ['SYSTEM'];
}

/**
 * Infer risks from intent characteristics.
 */
function inferRisks(intent: IntentContext): string[] {
  const risks: string[] = [];

  if (intent.destructiveAllowed) {
    risks.push('Destructive changes permitted — data loss possible');
  }

  if (intent.changes?.some(c => c.type === 'delete')) {
    risks.push('Plan includes file deletions');
  }

  if (intent.modules && intent.modules.length > 3) {
    risks.push(`Cross-cutting change affects ${intent.modules.length} modules — high coordination risk`);
  }

  const summary = intent.summary?.toLowerCase() ?? '';
  if (summary.includes('auth') || summary.includes('security') || summary.includes('rls')) {
    risks.push('Touches security-sensitive subsystem');
  }

  return risks;
}
