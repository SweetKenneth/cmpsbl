/**
 * Substrate Events Module
 * v10.5.4 — ARCHITECT Epoch Unified Event Emission and Query
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
