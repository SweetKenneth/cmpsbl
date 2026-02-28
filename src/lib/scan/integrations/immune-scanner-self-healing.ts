/**
 * IMMUNE — Scanner Self-Healing (#39)
 * Wraps scanner modules in the IMMUNE repair layer so that
 * individual scanner phase failures are auto-repaired rather
 * than silently skipped.
 */

export interface ScannerHealingEvent {
  eventId: string;
  phase: string;
  module: string;
  errorType: string;
  errorMessage: string;
  repairAttempted: boolean;
  repairSucceeded: boolean;
  repairStrategy: string;
  fallbackUsed: boolean;
  timestamp: string;
}

export interface ScannerHealthReport {
  events: ScannerHealingEvent[];
  totalFailures: number;
  autoRepaired: number;
  fallbacksUsed: number;
  repairSuccessRate: number;
  unhealthyModules: string[];
  generatedAt: string;
}

const healingLog: ScannerHealingEvent[] = [];

/**
 * Wrap a scanner phase function with self-healing
 */
export function withSelfHealing<T>(
  phase: string,
  module: string,
  fn: () => T | Promise<T>,
  fallback: T,
): () => Promise<T> {
  return async () => {
    try {
      return await fn();
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      const strategy = selectRepairStrategy(err);

      const event: ScannerHealingEvent = {
        eventId: `heal_${healingLog.length + 1}`,
        phase,
        module,
        errorType: err.constructor.name,
        errorMessage: err.message.slice(0, 200),
        repairAttempted: strategy !== 'none',
        repairSucceeded: false,
        repairStrategy: strategy,
        fallbackUsed: false,
        timestamp: new Date().toISOString(),
      };

      // Attempt repair based on strategy
      if (strategy === 'retry') {
        try {
          const result = await fn();
          event.repairSucceeded = true;
          healingLog.push(event);
          return result;
        } catch {
          // Retry failed, fall through to fallback
        }
      }

      if (strategy === 'retry_with_backoff') {
        for (let attempt = 0; attempt < 2; attempt++) {
          await new Promise(r => setTimeout(r, (attempt + 1) * 500));
          try {
            const result = await fn();
            event.repairSucceeded = true;
            healingLog.push(event);
            return result;
          } catch {
            continue;
          }
        }
      }

      // All repair strategies exhausted — use fallback
      event.fallbackUsed = true;
      healingLog.push(event);
      return fallback;
    }
  };
}

/**
 * Get scanner health report
 */
export function getScannerHealthReport(): ScannerHealthReport {
  const autoRepaired = healingLog.filter(e => e.repairSucceeded).length;
  const moduleCounts = new Map<string, number>();
  for (const e of healingLog) {
    if (!e.repairSucceeded) {
      moduleCounts.set(e.module, (moduleCounts.get(e.module) ?? 0) + 1);
    }
  }

  return {
    events: [...healingLog],
    totalFailures: healingLog.length,
    autoRepaired,
    fallbacksUsed: healingLog.filter(e => e.fallbackUsed).length,
    repairSuccessRate: healingLog.length > 0 ? autoRepaired / healingLog.length : 1,
    unhealthyModules: [...moduleCounts.entries()].filter(([, c]) => c >= 3).map(([m]) => m),
    generatedAt: new Date().toISOString(),
  };
}

export function resetHealingLog(): void {
  healingLog.length = 0;
}

function selectRepairStrategy(error: Error): string {
  const msg = error.message.toLowerCase();
  if (msg.includes('timeout') || msg.includes('network')) return 'retry_with_backoff';
  if (msg.includes('rate limit') || msg.includes('429')) return 'retry_with_backoff';
  if (msg.includes('parse') || msg.includes('syntax')) return 'none'; // data error, can't retry
  return 'retry';
}
