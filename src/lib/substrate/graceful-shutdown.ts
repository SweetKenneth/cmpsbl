/**
 * Graceful Shutdown Coordinator — Orderly teardown of substrate services
 * Ensures pending operations complete before cleanup
 */

type ShutdownHook = (signal: string) => Promise<void> | void;

interface ShutdownEntry {
  name: string;
  priority: number; // lower = runs first
  hook: ShutdownHook;
}

const hooks: ShutdownEntry[] = [];
let shuttingDown = false;
let shutdownPromise: Promise<void> | null = null;

export function registerShutdownHook(name: string, hook: ShutdownHook, priority = 50): void {
  hooks.push({ name, priority, hook });
  hooks.sort((a, b) => a.priority - b.priority);
}

export function isShuttingDown(): boolean {
  return shuttingDown;
}

export async function initiateShutdown(signal = 'manual'): Promise<void> {
  if (shuttingDown) return shutdownPromise!;

  shuttingDown = true;
  console.log(`[shutdown] Initiating graceful shutdown (signal: ${signal})`);

  shutdownPromise = (async () => {
    for (const entry of hooks) {
      try {
        console.log(`[shutdown] Running hook: ${entry.name}`);
        await Promise.race([
          entry.hook(signal),
          new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 5000)),
        ]);
      } catch (err) {
        console.error(`[shutdown] Hook "${entry.name}" failed:`, err);
      }
    }
    console.log('[shutdown] All hooks completed');
  })();

  return shutdownPromise;
}

/** Register browser beforeunload handler */
export function installBrowserHook(): () => void {
  const handler = (e: BeforeUnloadEvent) => {
    if (hooks.length > 0) {
      initiateShutdown('beforeunload');
      e.preventDefault();
    }
  };
  window.addEventListener('beforeunload', handler);
  return () => window.removeEventListener('beforeunload', handler);
}

export function getRegisteredHooks(): Array<{ name: string; priority: number }> {
  return hooks.map(h => ({ name: h.name, priority: h.priority }));
}
