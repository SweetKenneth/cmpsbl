/**
 * Ring Buffer — Fixed-size circular buffer for log/metric streams
 * O(1) push, constant memory, no GC pressure
 */

export class RingBuffer<T> {
  private buffer: (T | undefined)[];
  private head = 0;
  private _size = 0;
  readonly capacity: number;

  constructor(capacity: number) {
    this.capacity = capacity;
    this.buffer = new Array(capacity);
  }

  push(item: T): void {
    this.buffer[this.head] = item;
    this.head = (this.head + 1) % this.capacity;
    if (this._size < this.capacity) this._size++;
  }

  get size(): number { return this._size; }
  get isFull(): boolean { return this._size === this.capacity; }

  /** Get item at logical index (0 = oldest) */
  at(index: number): T | undefined {
    if (index < 0 || index >= this._size) return undefined;
    const realIndex = (this.head - this._size + index + this.capacity) % this.capacity;
    return this.buffer[realIndex];
  }

  /** Get the most recent item */
  latest(): T | undefined {
    if (this._size === 0) return undefined;
    return this.buffer[(this.head - 1 + this.capacity) % this.capacity];
  }

  /** Get all items oldest-first */
  toArray(): T[] {
    const result: T[] = [];
    for (let i = 0; i < this._size; i++) {
      result.push(this.at(i)!);
    }
    return result;
  }

  /** Get last N items (newest first) */
  tail(n: number): T[] {
    const count = Math.min(n, this._size);
    const result: T[] = [];
    for (let i = this._size - 1; i >= this._size - count; i--) {
      result.push(this.at(i)!);
    }
    return result;
  }

  /** Apply a function to all items */
  forEach(fn: (item: T, index: number) => void): void {
    for (let i = 0; i < this._size; i++) {
      fn(this.at(i)!, i);
    }
  }

  /** Find items matching a predicate — single-pass, no intermediate array */
  filter(fn: (item: T) => boolean): T[] {
    const result: T[] = [];
    for (let i = 0; i < this._size; i++) {
      const item = this.at(i)!;
      if (fn(item)) result.push(item);
    }
    return result;
  }

  /** Count items matching a predicate — O(n) no allocation */
  count(fn: (item: T) => boolean): number {
    let c = 0;
    for (let i = 0; i < this._size; i++) {
      if (fn(this.at(i)!)) c++;
    }
    return c;
  }

  clear(): void {
    this.buffer = new Array(this.capacity);
    this.head = 0;
    this._size = 0;
  }
}

/** Pre-built buffers for common substrate streams */
export const logRing = new RingBuffer<{ ts: number; msg: string; level: string }>(1000);
export const metricRing = new RingBuffer<{ ts: number; module: string; value: number }>(2000);
