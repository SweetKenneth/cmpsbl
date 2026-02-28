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
  private history: Array<{ from: S; to: S; event: string; at: number }> = [];
  private listeners = new Set<(state: S, context: C) => void>();

  constructor(config: MachineConfig<S, C>) {
    this.id = config.id;
    this._state = config.initial;
    this._context = config.context;
    this.transitions = config.transitions;
  }

  get state(): S { return this._state; }
  get context(): C { return this._context; }

  /** Send an event to trigger a transition */
  send(event: string): boolean {
    const t = this.transitions.find(
      tr => tr.from === this._state && tr.event === event,
    );
    if (!t) return false;
    if (t.guard && !t.guard(this._context)) return false;

    const from = this._state;
    this._state = t.to;
    if (t.effect) this._context = t.effect(this._context);
    this.history.push({ from, to: t.to, event, at: Date.now() });
    if (this.history.length > 100) this.history.splice(0, 20);
    this.listeners.forEach(fn => fn(this._state, this._context));
    return true;
  }

  /** Check if an event can be sent in current state */
  can(event: string): boolean {
    return this.transitions.some(
      tr => tr.from === this._state && tr.event === event &&
        (!tr.guard || tr.guard(this._context)),
    );
  }

  /** Get available events from current state */
  availableEvents(): string[] {
    return this.transitions
      .filter(tr => tr.from === this._state)
      .map(tr => tr.event);
  }

  subscribe(fn: (state: S, context: C) => void): () => void {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  getHistory() { return [...this.history]; }

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
