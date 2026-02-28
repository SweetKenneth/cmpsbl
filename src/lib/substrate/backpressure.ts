/**
 * Backpressure Controller — Protects substrate from overload
 * Queues or rejects work when capacity is exceeded
 */

type BackpressureStrategy = 'queue' | 'drop' | 'throttle';

interface BackpressureConfig {
  maxConcurrent: number;
  maxQueued: number;
  strategy: BackpressureStrategy;
}

interface BackpressureState {
  active: number;
  queued: number;
  dropped: number;
  processed: number;
}

const state: BackpressureState = { active: 0, queued: 0, dropped: 0, processed: 0 };
const queue: Array<{ resolve: (go: boolean) => void }> = [];
let config: BackpressureConfig = { maxConcurrent: 20, maxQueued: 100, strategy: 'queue' };

export function configureBackpressure(c: Partial<BackpressureConfig>): void {
  config = { ...config, ...c };
}

/** Acquire a slot. Resolves true when ready, false if dropped. */
export async function acquire(): Promise<boolean> {
  if (state.active < config.maxConcurrent) {
    state.active++;
    return true;
  }

  if (config.strategy === 'drop') {
    state.dropped++;
    return false;
  }

  if (state.queued >= config.maxQueued) {
    state.dropped++;
    return false;
  }

  return new Promise<boolean>(resolve => {
    state.queued++;
    queue.push({ resolve });
  });
}

export function release(): void {
  state.active = Math.max(0, state.active - 1);
  state.processed++;

  if (queue.length > 0) {
    const next = queue.shift()!;
    state.queued--;
    state.active++;
    next.resolve(true);
  }
}

/** Execute with backpressure. Auto-acquires and releases. */
export async function withBackpressure<T>(fn: () => Promise<T>): Promise<T> {
  const allowed = await acquire();
  if (!allowed) throw new Error('Backpressure: request dropped');
  try {
    return await fn();
  } finally {
    release();
  }
}

export function getBackpressureState(): BackpressureState & { pressure: number } {
  return {
    ...state,
    pressure: config.maxConcurrent > 0
      ? Math.round(((state.active + state.queued) / (config.maxConcurrent + config.maxQueued)) * 100)
      : 0,
  };
}

export function resetBackpressure(): void {
  state.active = 0;
  state.queued = 0;
  state.dropped = 0;
  state.processed = 0;
  queue.length = 0;
}
