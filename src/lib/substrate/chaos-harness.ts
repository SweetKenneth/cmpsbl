/**
 * Chaos Harness — Controlled failure injection for resilience testing
 * Only active when explicitly enabled via feature flag
 */

type ChaosType = 'latency' | 'error' | 'timeout' | 'corruption';

interface ChaosRule {
  id: string;
  type: ChaosType;
  target: string; // module name or '*'
  probability: number; // 0-1
  config: Record<string, unknown>;
  enabled: boolean;
}

const rules: ChaosRule[] = [];
let globalEnabled = false;
const stats = { injected: 0, skipped: 0 };

export function enableChaos(): void { globalEnabled = true; }
export function disableChaos(): void { globalEnabled = false; }
export function isChaosEnabled(): boolean { return globalEnabled; }

export function addRule(type: ChaosType, target: string, probability = 0.1, config: Record<string, unknown> = {}): string {
  const id = `chaos_${Date.now()}_${rules.length}`;
  rules.push({ id, type, target, probability, config, enabled: true });
  return id;
}

export function removeRule(id: string): void {
  const i = rules.findIndex(r => r.id === id);
  if (i >= 0) rules.splice(i, 1);
}

/** Apply chaos to a module invocation. Throws or delays if chaos triggers. */
export async function maybeInjectChaos(module: string): Promise<void> {
  if (!globalEnabled) return;

  for (const rule of rules) {
    if (!rule.enabled) continue;
    if (rule.target !== '*' && rule.target !== module) continue;
    if (Math.random() > rule.probability) { stats.skipped++; continue; }

    stats.injected++;

    switch (rule.type) {
      case 'latency': {
        const ms = (rule.config.maxMs as number) || 2000;
        await new Promise(r => setTimeout(r, Math.random() * ms));
        break;
      }
      case 'error':
        throw new Error(`[CHAOS] Injected error for ${module}`);
      case 'timeout':
        await new Promise(r => setTimeout(r, (rule.config.timeoutMs as number) || 30000));
        break;
      case 'corruption':
        // Signal corruption — caller should handle
        throw new Error(`[CHAOS] Data corruption injected for ${module}`);
    }
  }
}

export function getChaosStats() {
  return { ...stats, rules: rules.length, enabled: globalEnabled };
}

export function clearRules(): void {
  rules.length = 0;
}

export type { ChaosRule, ChaosType };
