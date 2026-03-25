/**
 * State Machine — Deterministic state management for substrate workflows
 * Type-safe transitions with guards and side effects
 */

type TransitionGuard<C> = (context: C) => boolean;
type TransitionEffect<C> = (context: C) => C;

interface Transition<S extends string, C> {
  from: S;
  to: S;
  event: string;
  guard?: TransitionGuard<C>;
  effect?: TransitionEffect<C>;
}

interface MachineConfig<S extends string, C> {
  id: string;
  initial: S;
  context: C;
  transitions: Transition<S, C>[];
}

export class StateMachine<S extends string, C> {
  readonly id: string;
  private _state: S;
  private _context: C;
  private transitions: Transition<S, C>[];
  /** Pre-indexed transitions by (state, event) for O(1) lookup */
  private transitionIndex: Map<string, Transition<S, C>>;
  private history: Array<{ from: S; to: S; event: string; at: number }> = [];
  private readonly HISTORY_CAP = 100;
  private listeners = new Set<(state: S, context: C) => void>();

  constructor(config: MachineConfig<S, C>) {
    this.id = config.id;
    this._state = config.initial;
    this._context = config.context;
    this.transitions = config.transitions;
    // Build index for O(1) transition lookup
    this.transitionIndex = new Map();
    for (const t of config.transitions) {
      const key = `${t.from}::${t.event}`;
      if (!this.transitionIndex.has(key)) {
        this.transitionIndex.set(key, t);
      }
    }
  }

  get state(): S { return this._state; }
  get context(): C { return this._context; }

  /** Send an event to trigger a transition */
  send(event: string): boolean {
    const t = this.transitionIndex.get(`${this._state}::${event}`);
    if (!t) return false;
    if (t.guard && !t.guard(this._context)) return false;

    const from = this._state;
    this._state = t.to;
    if (t.effect) this._context = t.effect(this._context);
    this.history.push({ from, to: t.to, event, at: Date.now() });
    // Amortized trim
    if (this.history.length > this.HISTORY_CAP * 1.25) {
      this.history.splice(0, this.history.length - this.HISTORY_CAP);
    }
    for (const fn of this.listeners) fn(this._state, this._context);
    return true;
  }

  /** Check if an event can be sent in current state */
  can(event: string): boolean {
    const t = this.transitionIndex.get(`${this._state}::${event}`);
    return !!t && (!t.guard || t.guard(this._context));
  }

  /** Get available events from current state */
  availableEvents(): string[] {
    const result: string[] = [];
    for (const t of this.transitions) {
      if (t.from === this._state) result.push(t.event);
    }
    return result;
  }

  subscribe(fn: (state: S, context: C) => void): () => void {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  getHistory() { return this.history.slice(); }

  reset(initial?: S, context?: C): void {
    this._state = initial ?? this._state;
    if (context) this._context = context;
    this.history = [];
  }
}

/** Factory function */
export function createMachine<S extends string, C>(config: MachineConfig<S, C>): StateMachine<S, C> {
  return new StateMachine(config);
}
