/**
 * CMPSBL® BRAIN — Working Memory / Attention Mechanism
 * Short-term context window that tracks the active reasoning chain.
 *
 * Implements a capacity-limited buffer (Miller's 7±2) with:
 * - Priority-based eviction
 * - Automatic decay
 * - Context focus tracking
 * - Rehearsal (refreshing items to prevent decay)
 */

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export interface WorkingMemoryItem {
  id: string;
  content: string;
  context: string;
  priority: number;       // 0-1
  activations: number;    // rehearsal count
  addedAt: number;
  lastAccessed: number;
  decayRate: number;      // items/second of priority loss
  sourceMemoryId?: string; // link to long-term memory
}

export interface WorkingMemoryState {
  items: WorkingMemoryItem[];
  capacity: number;
  currentFocus: string | null;
  load: number;           // 0-1, how full the buffer is
  avgPriority: number;
}

// ═══════════════════════════════════════════════════════════════════════════════
// ENGINE
// ═══════════════════════════════════════════════════════════════════════════════

/** Miller's Law: 7 ± 2 chunks */
const DEFAULT_CAPACITY = 7;
const BASE_DECAY = 0.005;   // priority loss per second
const REHEARSAL_BOOST = 0.2; // priority boost per rehearsal

class WorkingMemoryEngine {
  private items = new Map<string, WorkingMemoryItem>();
  private capacity: number;
  private currentFocus: string | null = null;
  private itemCounter = 0;

  constructor(capacity: number = DEFAULT_CAPACITY) {
    this.capacity = capacity;
  }

  /**
   * Push an item into working memory.
   * If at capacity, evicts the lowest-priority decayed item.
   */
  push(content: string, context: string, options?: {
    priority?: number;
    decayRate?: number;
    sourceMemoryId?: string;
  }): WorkingMemoryItem {
    const now = Date.now();
    const id = `wm-${++this.itemCounter}`;

    const item: WorkingMemoryItem = {
      id,
      content: content.slice(0, 500), // Cap content size
      context,
      priority: options?.priority ?? 0.5,
      activations: 1,
      addedAt: now,
      lastAccessed: now,
      decayRate: options?.decayRate ?? BASE_DECAY,
      sourceMemoryId: options?.sourceMemoryId,
    };

    // Evict if at capacity
    if (this.items.size >= this.capacity) {
      this.evictLowest();
    }

    this.items.set(id, item);
    this.currentFocus = context;
    return item;
  }

  /**
   * Rehearse an item — refreshes it to prevent decay.
   */
  rehearse(itemId: string): boolean {
    const item = this.items.get(itemId);
    if (!item) return false;

    item.priority = Math.min(1, item.priority + REHEARSAL_BOOST);
    item.activations++;
    item.lastAccessed = Date.now();
    return true;
  }

  /**
   * Get the current working memory contents, with decay applied.
   */
  getContents(): WorkingMemoryItem[] {
    this.applyDecay();
    return [...this.items.values()].sort((a, b) => b.priority - a.priority);
  }

  /**
   * Get items relevant to a specific context.
   */
  getByContext(context: string): WorkingMemoryItem[] {
    this.applyDecay();
    return [...this.items.values()]
      .filter(item => item.context === context)
      .sort((a, b) => b.priority - a.priority);
  }

  /**
   * Focus attention on a specific context — boosts related items.
   */
  focus(context: string): number {
    this.currentFocus = context;
    let boosted = 0;
    for (const item of this.items.values()) {
      if (item.context === context) {
        item.priority = Math.min(1, item.priority + 0.1);
        item.lastAccessed = Date.now();
        boosted++;
      }
    }
    return boosted;
  }

  /**
   * Remove an item from working memory.
   */
  remove(itemId: string): boolean {
    return this.items.delete(itemId);
  }

  /**
   * Clear all items matching a context.
   */
  clearContext(context: string): number {
    let removed = 0;
    for (const [id, item] of this.items) {
      if (item.context === context) {
        this.items.delete(id);
        removed++;
      }
    }
    return removed;
  }

  /**
   * Get current state snapshot.
   */
  getState(): WorkingMemoryState {
    this.applyDecay();
    const items = [...this.items.values()];
    const totalPriority = items.reduce((s, i) => s + i.priority, 0);

    return {
      items: items.sort((a, b) => b.priority - a.priority),
      capacity: this.capacity,
      currentFocus: this.currentFocus,
      load: items.length / this.capacity,
      avgPriority: items.length > 0 ? totalPriority / items.length : 0,
    };
  }

  /** Set capacity (Miller's 7±2 range: 5-9) */
  setCapacity(n: number): void {
    this.capacity = Math.max(3, Math.min(12, n));
    while (this.items.size > this.capacity) this.evictLowest();
  }

  /** Apply decay and auto-evict items with zero priority */
  private applyDecay(): void {
    const now = Date.now();
    const toRemove: string[] = [];

    for (const [id, item] of this.items) {
      const secondsSince = (now - item.lastAccessed) / 1000;
      const decay = item.decayRate * secondsSince;
      item.priority = Math.max(0, item.priority - decay);

      // Auto-evict fully decayed items
      if (item.priority <= 0.001 && item.activations <= 1) {
        toRemove.push(id);
      }
    }

    for (const id of toRemove) this.items.delete(id);
  }

  /** Evict the lowest-priority item */
  private evictLowest(): void {
    let lowestId: string | null = null;
    let lowestPriority = Infinity;

    for (const [id, item] of this.items) {
      const effective = item.priority * (1 + item.activations * 0.1);
      if (effective < lowestPriority) {
        lowestPriority = effective;
        lowestId = id;
      }
    }

    if (lowestId) this.items.delete(lowestId);
  }

  clear(): void {
    this.items.clear();
    this.currentFocus = null;
    this.itemCounter = 0;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// SINGLETON
// ═══════════════════════════════════════════════════════════════════════════════

let _engine: WorkingMemoryEngine | null = null;

export function getWorkingMemory(): WorkingMemoryEngine {
  if (!_engine) _engine = new WorkingMemoryEngine();
  return _engine;
}

export function resetWorkingMemory(): void {
  _engine = null;
}
