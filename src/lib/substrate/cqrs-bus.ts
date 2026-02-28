/**
 * CQRS Event Bus — Command/Query Responsibility Segregation
 * Separates write commands from read queries with event-driven sync
 */

type CommandHandler<T = unknown> = (payload: T) => Promise<unknown>;
type QueryHandler<T = unknown, R = unknown> = (query: T) => Promise<R>;
type EventHandler = (event: BusEvent) => void;

interface BusEvent {
  type: string;
  payload: unknown;
  timestamp: number;
  source: string;
}

const commandHandlers = new Map<string, CommandHandler>();
const queryHandlers = new Map<string, QueryHandler>();
const eventSubscribers = new Map<string, Set<EventHandler>>();
const eventLog: BusEvent[] = [];
const MAX_LOG = 500;

/** Register a command handler (write side) */
export function registerCommand(name: string, handler: CommandHandler): void {
  commandHandlers.set(name, handler);
}

/** Register a query handler (read side) */
export function registerQuery<T, R>(name: string, handler: QueryHandler<T, R>): void {
  queryHandlers.set(name, handler as QueryHandler);
}

/** Dispatch a command. Emits an event on success. */
export async function dispatch(command: string, payload: unknown, source = 'system'): Promise<unknown> {
  const handler = commandHandlers.get(command);
  if (!handler) throw new Error(`No handler for command: ${command}`);

  const result = await handler(payload);

  const event: BusEvent = { type: `${command}.completed`, payload: result, timestamp: Date.now(), source };
  eventLog.push(event);
  if (eventLog.length > MAX_LOG) eventLog.splice(0, 100);

  eventSubscribers.get(event.type)?.forEach(fn => fn(event));
  eventSubscribers.get('*')?.forEach(fn => fn(event));

  return result;
}

/** Execute a query (read side) */
export async function query<R = unknown>(name: string, params?: unknown): Promise<R> {
  const handler = queryHandlers.get(name);
  if (!handler) throw new Error(`No handler for query: ${name}`);
  return handler(params) as Promise<R>;
}

/** Subscribe to events */
export function subscribe(eventType: string, handler: EventHandler): () => void {
  if (!eventSubscribers.has(eventType)) eventSubscribers.set(eventType, new Set());
  eventSubscribers.get(eventType)!.add(handler);
  return () => eventSubscribers.get(eventType)?.delete(handler);
}

export function getEventLog(since?: number): BusEvent[] {
  return since ? eventLog.filter(e => e.timestamp >= since) : [...eventLog];
}

export function getRegisteredCommands(): string[] {
  return Array.from(commandHandlers.keys());
}

export function getRegisteredQueries(): string[] {
  return Array.from(queryHandlers.keys());
}
