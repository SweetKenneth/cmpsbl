/**
 * Substrate Events Module
 * v7.0.0 — Unified event emission and query
 */

export { 
  emit, 
  emitStarted, 
  emitSucceeded, 
  emitFailed, 
  forceFlush,
  type SubstrateEvent,
  type EventOutcome,
  type EmitOptions,
} from './emit';

export {
  queryEvents,
  getRecentEvents,
  getModuleEvents,
  getTraceEvents,
  getEventStats,
  subscribeToEvents,
  invalidateEventCache,
  type EventRecord,
  type EventQueryOptions,
} from './query';
