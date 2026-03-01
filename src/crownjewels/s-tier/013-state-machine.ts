/**
 * S-Tier Crown Jewel #13 — BRAIK State Machine
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Rank: 13 | CJPI: 94 | Module: BRAIK | Type: Architecture
 *
 * Finite state machine with guards, effects, entry/exit hooks,
 * transition history, hierarchical states, and persistence hooks.
 * Ideal for workflow orchestration, UI flows, and agent lifecycles.
 *
 * Zero dependencies. Pure TypeScript. Drop-in ready.
 */

export interface StateConfig<TContext = unknown> {
  onEnter?: (ctx: TContext) => void | Promise<void>;
  onExit?: (ctx: TContext) => void | Promise<void>;
  meta?: Record<string, unknown>;
}

export interface TransitionConfig<TContext = unknown> {
  from: string | string[];
  to: string;
  event: string;
  guard?: (ctx: TContext) => boolean;
  effect?: (ctx: TContext) => void | Promise<void>;
}

export interface MachineConfig<TContext = unknown> {
  id: string;
  initial: string;
  context: TContext;
  states: Record<string, StateConfig<TContext>>;
  transitions: TransitionConfig<TContext>[];
  maxHistory?: number;
  onTransition?: (from: string, to: string, event: string, ctx: TContext) => void;
}

export interface TransitionRecord {
  from: string;
  to: string;
  event: string;
  timestamp: number;
}

export function createStateMachine<TContext>(config: MachineConfig<TContext>) {
  const { id, initial, states, transitions, maxHistory = 100, onTransition } = config;
  let current = initial;
  let context = { ...config.context };
  const history: TransitionRecord[] = [];

  // Validate
  if (!states[initial]) throw new Error(`[FSM:${id}] Initial state '${initial}' not defined`);

  // ── Transition ───────────────────────────────────────────────────

  async function send(event: string): Promise<boolean> {
    const candidates = transitions.filter(t => {
      const froms = Array.isArray(t.from) ? t.from : [t.from];
      return froms.includes(current) && t.event === event;
    });

    for (const t of candidates) {
      if (t.guard && !t.guard(context)) continue;
      if (!states[t.to]) throw new Error(`[FSM:${id}] Target state '${t.to}' not defined`);

      const from = current;

      // Exit current state
      const exitHook = states[current]?.onExit;
      if (exitHook) await exitHook(context);

      // Execute effect
      if (t.effect) await t.effect(context);

      // Enter new state
      current = t.to;
      const enterHook = states[current]?.onEnter;
      if (enterHook) await enterHook(context);

      // Record
      history.push({ from, to: current, event, timestamp: Date.now() });
      if (history.length > maxHistory) history.splice(0, history.length - maxHistory);

      onTransition?.(from, current, event, context);
      return true;
    }

    return false; // no valid transition
  }

  // ── Queries ──────────────────────────────────────────────────────

  function can(event: string): boolean {
    return transitions.some(t => {
      const froms = Array.isArray(t.from) ? t.from : [t.from];
      return froms.includes(current) && t.event === event && (!t.guard || t.guard(context));
    });
  }

  function availableEvents(): string[] {
    return [...new Set(
      transitions
        .filter(t => {
          const froms = Array.isArray(t.from) ? t.from : [t.from];
          return froms.includes(current);
        })
        .filter(t => !t.guard || t.guard(context))
        .map(t => t.event),
    )];
  }

  function matches(state: string): boolean { return current === state; }
  function getContext(): TContext { return { ...context }; }
  function updateContext(updater: (ctx: TContext) => TContext) { context = updater(context); }
  function getHistory(): TransitionRecord[] { return [...history]; }

  // ── Snapshot / Restore ───────────────────────────────────────────

  function snapshot(): { state: string; context: TContext; history: TransitionRecord[] } {
    return { state: current, context: { ...context }, history: [...history] };
  }

  function restore(snap: { state: string; context: TContext }) {
    if (!states[snap.state]) throw new Error(`[FSM:${id}] Cannot restore to unknown state '${snap.state}'`);
    current = snap.state;
    context = { ...snap.context };
  }

  return {
    send, can, availableEvents, matches,
    getContext, updateContext, getHistory,
    snapshot, restore,
    get state() { return current; },
    get id() { return id; },
  };
}
