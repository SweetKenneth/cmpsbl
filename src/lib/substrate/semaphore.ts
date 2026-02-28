/**
 * Semaphore — Concurrency limiter for substrate resources
 * Controls how many operations can access a resource simultaneously
 */

export class Semaphore {
  private permits: number;
  private readonly max: number;
  private queue: Array<() => void> = [];
  private stats = { acquired: 0, released: 0, waiters: 0 };

  constructor(permits: number) {
    this.max = permits;
    this.permits = permits;
  }

  async acquire(): Promise<void> {
    if (this.permits > 0) {
      this.permits--;
      this.stats.acquired++;
      return;
    }

    this.stats.waiters++;
    return new Promise<void>(resolve => {
      this.queue.push(() => {
        this.stats.waiters--;
        this.stats.acquired++;
        resolve();
      });
    });
  }

  release(): void {
    this.stats.released++;
    if (this.queue.length > 0) {
      const next = this.queue.shift()!;
      next();
    } else {
      this.permits = Math.min(this.permits + 1, this.max);
    }
  }

  /** Execute with automatic acquire/release */
  async use<T>(fn: () => Promise<T>): Promise<T> {
    await this.acquire();
    try {
      return await fn();
    } finally {
      this.release();
    }
  }

  get available(): number { return this.permits; }
  get waiting(): number { return this.queue.length; }
  get capacity(): number { return this.max; }
  getStats() { return { ...this.stats, available: this.permits, waiting: this.queue.length }; }
}

/** Pre-built semaphores for common substrate resources */
export const aiSemaphore = new Semaphore(3);       // Max 3 concurrent AI calls
export const dbSemaphore = new Semaphore(10);       // Max 10 concurrent DB operations
export const webhookSemaphore = new Semaphore(5);   // Max 5 concurrent webhook deliveries
