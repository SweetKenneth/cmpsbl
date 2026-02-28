/**
 * Priority Queue — Substrate task scheduler with priority-based execution
 * Higher priority items are dequeued first
 */

interface QueueItem<T = unknown> {
  id: string;
  priority: number;
  data: T;
  enqueuedAt: number;
  deadline?: number;
}

export class PriorityQueue<T = unknown> {
  private heap: QueueItem<T>[] = [];
  private processed = 0;
  private dropped = 0;

  get size(): number { return this.heap.length; }

  enqueue(id: string, data: T, priority = 0, deadlineMs?: number): void {
    const item: QueueItem<T> = {
      id,
      priority,
      data,
      enqueuedAt: Date.now(),
      deadline: deadlineMs ? Date.now() + deadlineMs : undefined,
    };
    this.heap.push(item);
    this.bubbleUp(this.heap.length - 1);
  }

  dequeue(): QueueItem<T> | null {
    if (this.heap.length === 0) return null;
    // Drop expired items
    while (this.heap.length > 0 && this.heap[0].deadline && this.heap[0].deadline < Date.now()) {
      this.swap(0, this.heap.length - 1);
      this.heap.pop();
      this.dropped++;
      if (this.heap.length > 0) this.sinkDown(0);
    }
    if (this.heap.length === 0) return null;
    const item = this.heap[0];
    const last = this.heap.pop()!;
    if (this.heap.length > 0) {
      this.heap[0] = last;
      this.sinkDown(0);
    }
    this.processed++;
    return item;
  }

  peek(): QueueItem<T> | null {
    return this.heap[0] ?? null;
  }

  stats() {
    return { size: this.size, processed: this.processed, dropped: this.dropped };
  }

  clear(): void { this.heap = []; }

  private bubbleUp(i: number): void {
    while (i > 0) {
      const parent = Math.floor((i - 1) / 2);
      if (this.heap[parent].priority >= this.heap[i].priority) break;
      this.swap(i, parent);
      i = parent;
    }
  }

  private sinkDown(i: number): void {
    const len = this.heap.length;
    while (true) {
      let largest = i;
      const left = 2 * i + 1;
      const right = 2 * i + 2;
      if (left < len && this.heap[left].priority > this.heap[largest].priority) largest = left;
      if (right < len && this.heap[right].priority > this.heap[largest].priority) largest = right;
      if (largest === i) break;
      this.swap(i, largest);
      i = largest;
    }
  }

  private swap(a: number, b: number): void {
    [this.heap[a], this.heap[b]] = [this.heap[b], this.heap[a]];
  }
}

/** Singleton for substrate task scheduling */
export const substrateQueue = new PriorityQueue();

// ── Backward-compatible named exports expected by useMatrixResilience ──

const completedTasks: Array<{ id: string; data: unknown; completedAt: number }> = [];
let maxConcurrent = 5;

export function enqueue(id: string, data: unknown, priority = 0, deadlineMs?: number): void {
  substrateQueue.enqueue(id, data, priority, deadlineMs);
}

export function dequeue(): QueueItem | null {
  return substrateQueue.dequeue();
}

export function complete(id: string): void {
  completedTasks.push({ id, data: null, completedAt: Date.now() });
  if (completedTasks.length > 200) completedTasks.splice(0, 50);
}

export function getQueueState() {
  return {
    ...substrateQueue.stats(),
    maxConcurrent,
    pending: substrateQueue.size,
    next: substrateQueue.peek(),
  };
}

export function clearQueue(): void {
  substrateQueue.clear();
}

export function setMaxConcurrent(n: number): void {
  maxConcurrent = Math.max(1, n);
}

export function getCompletedTasks() {
  return [...completedTasks];
}
