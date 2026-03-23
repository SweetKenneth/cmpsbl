/**
 * RIPPLE Event Bus
 * Hybrid Push/Pull Event Orchestrator
 * 
 * RIPPLE is the nervous system of the substrate:
 * - PUSH mode: Automatic event fan-out to subscribers
 * - PULL mode: Manual worker loop via ripple.work()
 * - Circuit breakers per subscriber
 * - Dead letter queue for failed events
 */

import { supabase } from '@/integrations/supabase/client';
import type { Json } from '@/integrations/supabase/types';

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export type EventStatus = 'pending' | 'processing' | 'succeeded' | 'failed' | 'dead_letter';
export type CircuitState = 'closed' | 'open' | 'half_open';
export type DeliveryMode = 'push' | 'pull';

export interface RippleEvent {
  id: string;
  type: string;
  source: string;
  payload: Record<string, unknown>;
  status: EventStatus;
  retryCount: number;
  maxRetries: number;
  createdAt: string;
  processedAt?: string;
  error?: string;
}

export interface Subscription {
  id: string;
  eventPattern: string; // e.g., 'brain.*', 'evolution.proposed', '*'
  handler: (event: RippleEvent) => Promise<void>;
  module: string;
  deliveryMode: DeliveryMode;
  circuitState: CircuitState;
  consecutiveFailures: number;
  lastFailure?: string;
}

export interface RippleState {
  initialized: boolean;
  pendingEvents: number;
  processedToday: number;
  failedToday: number;
  deadLetterCount: number;
  activeSubscriptions: number;
  circuitBreakers: Record<string, CircuitState>;
}

export interface PublishResult {
  success: boolean;
  eventId: string;
  subscribersNotified: number;
}

// ═══════════════════════════════════════════════════════════════════════════════
// RIPPLE EVENT BUS CLIENT
// ═══════════════════════════════════════════════════════════════════════════════

class RippleEventBus {
  private static instance: RippleEventBus;
  
  private subscriptions: Map<string, Subscription> = new Map();
  private eventQueue: RippleEvent[] = [];
  private deadLetterQueue: RippleEvent[] = [];
  private circuitBreakers: Map<string, { state: CircuitState; failures: number; lastFailure?: Date }> = new Map();
  
  private readonly MAX_QUEUE = 1000;
  private readonly MAX_DEAD_LETTER = 500;
  private readonly CIRCUIT_THRESHOLD = 5; // failures before opening circuit
  private readonly CIRCUIT_RESET_MS = 60000; // 1 minute half-open trial

  private state: RippleState = {
    initialized: false,
    pendingEvents: 0,
    processedToday: 0,
    failedToday: 0,
    deadLetterCount: 0,
    activeSubscriptions: 0,
    circuitBreakers: {},
  };

  private constructor() {
    this.state.initialized = true;
  }

  static getInstance(): RippleEventBus {
    if (!RippleEventBus.instance) {
      RippleEventBus.instance = new RippleEventBus();
    }
    return RippleEventBus.instance;
  }

  // ═══ PUBLISH ═══

  async publish(
    type: string,
    source: string,
    payload: Record<string, unknown>,
    options?: { maxRetries?: number }
  ): Promise<PublishResult> {
    const event: RippleEvent = {
      id: crypto.randomUUID(),
      type,
      source,
      payload,
      status: 'pending',
      retryCount: 0,
      maxRetries: options?.maxRetries ?? 3,
      createdAt: new Date().toISOString(),
    };

    // Add to queue
    this.eventQueue.push(event);
    if (this.eventQueue.length > this.MAX_QUEUE) {
      this.eventQueue.shift(); // Drop oldest
    }
    this.state.pendingEvents = this.eventQueue.filter(e => e.status === 'pending').length;

    // Persist to database via brain_events (ripple_events schema compatibility)
    try {
      await supabase.from('brain_events').insert({
        module: 'ripple',
        event_type: `bus.${event.type}`,
        data: {
          eventId: event.id,
          source: event.source,
          payload: event.payload,
          status: event.status,
          retryCount: event.retryCount,
          maxRetries: event.maxRetries,
        } as unknown as Json,
        outcome: 'published',
      });
    } catch {
      // Continue with in-memory queue
    }

    // Push mode: fan-out to subscribers
    const matchingSubscriptions = this.getMatchingSubscriptions(type);
    let notified = 0;

    for (const sub of matchingSubscriptions) {
      if (sub.deliveryMode === 'push' && this.isCircuitClosed(sub.id)) {
        try {
          await this.deliverToSubscriber(event, sub);
          notified++;
        } catch {
          this.recordSubscriberFailure(sub.id);
        }
      }
    }

    return { success: true, eventId: event.id, subscribersNotified: notified };
  }

  // ═══ SUBSCRIBE ═══

  subscribe(
    eventPattern: string,
    module: string,
    handler: (event: RippleEvent) => Promise<void>,
    mode: DeliveryMode = 'push'
  ): string {
    const subscriptionId = crypto.randomUUID();
    
    const subscription: Subscription = {
      id: subscriptionId,
      eventPattern,
      handler,
      module,
      deliveryMode: mode,
      circuitState: 'closed',
      consecutiveFailures: 0,
    };

    this.subscriptions.set(subscriptionId, subscription);
    this.circuitBreakers.set(subscriptionId, { state: 'closed', failures: 0 });
    this.state.activeSubscriptions = this.subscriptions.size;

    return subscriptionId;
  }

  unsubscribe(subscriptionId: string): boolean {
    const deleted = this.subscriptions.delete(subscriptionId);
    this.circuitBreakers.delete(subscriptionId);
    this.state.activeSubscriptions = this.subscriptions.size;
    return deleted;
  }

  // ═══ PULL MODE ═══

  async work(module: string, limit: number = 10): Promise<RippleEvent[]> {
    // Find subscriptions for this module in pull mode
    const pullSubs = Array.from(this.subscriptions.values())
      .filter(s => s.module === module && s.deliveryMode === 'pull');

    if (pullSubs.length === 0) return [];

    // Get pending events matching any of the patterns
    const events: RippleEvent[] = [];
    
    for (const sub of pullSubs) {
      const matching = this.eventQueue
        .filter(e => e.status === 'pending' && this.matchesPattern(e.type, sub.eventPattern))
        .slice(0, limit - events.length);
      
      for (const event of matching) {
        event.status = 'processing';
        events.push(event);
      }

      if (events.length >= limit) break;
    }

    return events;
  }

  async ack(eventId: string): Promise<boolean> {
    const event = this.eventQueue.find(e => e.id === eventId);
    if (!event) return false;

    event.status = 'succeeded';
    event.processedAt = new Date().toISOString();
    this.state.processedToday++;
    this.state.pendingEvents = this.eventQueue.filter(e => e.status === 'pending').length;

    // Update in database
    try {
      await supabase.from('brain_events').insert({
        module: 'ripple',
        event_type: `bus.ack`,
        data: { eventId, status: 'succeeded', processedAt: event.processedAt } as unknown as Json,
        outcome: 'succeeded',
      });
    } catch {
      // Continue — ack is best-effort persistence
    }

    return true;
  }

  async nack(eventId: string, error: string): Promise<boolean> {
    const event = this.eventQueue.find(e => e.id === eventId);
    if (!event) return false;

    event.retryCount++;
    event.error = error;

    if (event.retryCount >= event.maxRetries) {
      event.status = 'dead_letter';
      this.deadLetterQueue.push(event);
      if (this.deadLetterQueue.length > this.MAX_DEAD_LETTER) {
        this.deadLetterQueue.shift();
      }
      this.state.deadLetterCount = this.deadLetterQueue.length;
    } else {
      event.status = 'pending'; // Re-queue for retry
    }

    this.state.failedToday++;
    this.state.pendingEvents = this.eventQueue.filter(e => e.status === 'pending').length;

    return true;
  }

  // ═══ REPLAY ═══

  async replay(eventId: string): Promise<boolean> {
    // Find in dead letter queue
    const idx = this.deadLetterQueue.findIndex(e => e.id === eventId);
    if (idx === -1) return false;

    const event = this.deadLetterQueue.splice(idx, 1)[0];
    event.status = 'pending';
    event.retryCount = 0;
    event.error = undefined;
    this.eventQueue.push(event);

    this.state.deadLetterCount = this.deadLetterQueue.length;
    this.state.pendingEvents = this.eventQueue.filter(e => e.status === 'pending').length;

    return true;
  }

  // ═══ DRAIN ═══

  async drain(module: string): Promise<number> {
    let drained = 0;
    
    for (const event of this.eventQueue) {
      if (event.source === module && event.status === 'pending') {
        event.status = 'dead_letter';
        this.deadLetterQueue.push(event);
        drained++;
      }
    }

    this.state.deadLetterCount = this.deadLetterQueue.length;
    this.state.pendingEvents = this.eventQueue.filter(e => e.status === 'pending').length;

    return drained;
  }

  // ═══ CIRCUIT BREAKER ═══

  private isCircuitClosed(subscriptionId: string): boolean {
    const cb = this.circuitBreakers.get(subscriptionId);
    if (!cb) return true;

    if (cb.state === 'closed') return true;
    
    if (cb.state === 'half_open') return true; // Allow trial
    
    if (cb.state === 'open' && cb.lastFailure) {
      // Check if enough time has passed to try half-open
      const elapsed = Date.now() - cb.lastFailure.getTime();
      if (elapsed > this.CIRCUIT_RESET_MS) {
        cb.state = 'half_open';
        this.updateCircuitState(subscriptionId, 'half_open');
        return true;
      }
    }

    return false;
  }

  private recordSubscriberFailure(subscriptionId: string): void {
    const cb = this.circuitBreakers.get(subscriptionId);
    if (!cb) return;

    cb.failures++;
    cb.lastFailure = new Date();

    if (cb.failures >= this.CIRCUIT_THRESHOLD) {
      cb.state = 'open';
      this.updateCircuitState(subscriptionId, 'open');
    }
  }

  private recordSubscriberSuccess(subscriptionId: string): void {
    const cb = this.circuitBreakers.get(subscriptionId);
    if (!cb) return;

    if (cb.state === 'half_open') {
      cb.state = 'closed';
      cb.failures = 0;
      this.updateCircuitState(subscriptionId, 'closed');
    }
  }

  private updateCircuitState(subscriptionId: string, state: CircuitState): void {
    const sub = this.subscriptions.get(subscriptionId);
    if (sub) {
      sub.circuitState = state;
    }
    this.state.circuitBreakers[subscriptionId] = state;
  }

  // ═══ HELPERS ═══

  private getMatchingSubscriptions(eventType: string): Subscription[] {
    return Array.from(this.subscriptions.values())
      .filter(s => this.matchesPattern(eventType, s.eventPattern));
  }

  private matchesPattern(eventType: string, pattern: string): boolean {
    if (pattern === '*') return true;
    if (pattern.endsWith('.*')) {
      const prefix = pattern.slice(0, -2);
      return eventType.startsWith(prefix);
    }
    return eventType === pattern;
  }

  private async deliverToSubscriber(event: RippleEvent, sub: Subscription): Promise<void> {
    try {
      await sub.handler(event);
      this.recordSubscriberSuccess(sub.id);
      await this.ack(event.id);
    } catch (error) {
      this.recordSubscriberFailure(sub.id);
      await this.nack(event.id, error instanceof Error ? error.message : 'Handler failed');
      throw error;
    }
  }

  // ═══ STATE ═══

  getState(): RippleState {
    return {
      ...this.state,
      pendingEvents: this.eventQueue.filter(e => e.status === 'pending').length,
      deadLetterCount: this.deadLetterQueue.length,
      activeSubscriptions: this.subscriptions.size,
    };
  }

  getJobs(status?: EventStatus, limit: number = 50): RippleEvent[] {
    let events = this.eventQueue;
    if (status) {
      events = events.filter(e => e.status === status);
    }
    return events.slice(-limit);
  }

  getDeadLetterQueue(limit: number = 50): RippleEvent[] {
    return this.deadLetterQueue.slice(-limit);
  }

  getSubscriptions(): Subscription[] {
    return Array.from(this.subscriptions.values());
  }
}

// Singleton export
export const ripple = RippleEventBus.getInstance();

// Re-export types
export type { RippleEventBus };

// Version info
export const RIPPLE_VERSION = '9.0.0';
export const RIPPLE_CODENAME = 'Tsunami';

// Batch events & replay
export {
  batchPublish,
  publishWithRetry,
  replayEvents,
  getEventFromHistory,
  searchEventHistory,
  getSubscriptionHealth,
  recordDelivery,
  clearHistory,
  type BatchEventItem,
  type BatchPublishResult,
  type EventReplayOptions,
  type EventReplayResult,
  type SubscriptionHealth,
} from './batchEvents';
 
// Event analytics
export {
  recordEventForAnalytics,
  getEventAnalytics,
  getEventPatterns,
  findCorrelations,
  type EventAnalytics,
  type EventPattern,
  type EventCorrelation,
  type TimeWindow,
} from './eventAnalytics';

// ═══════════════════════════════════════════════════════════════════════════════
// v8.0.0 TEMPEST ENHANCEMENTS
// ═══════════════════════════════════════════════════════════════════════════════

// Persistent Event Store (exactly-once, event sourcing)
export {
  appendEvent,
  readFromSequence,
  readByTimeRange,
  updateConsumerPosition,
  getConsumerPosition,
  getAllConsumerPositions,
  getConsumerLag,
  compactExpiredEvents,
  getEventStoreStats,
  resetSequences,
  computePartition,
  type PersistedEvent,
  type EventCursor,
  type StreamPosition,
  type EventStoreStats,
} from './persistentEventStore';

// Ordered Delivery Engine (FIFO + causal ordering)
export {
  tickClock,
  mergeClock,
  happenedBefore,
  areConcurrent,
  enqueueForOrdering,
  forceDelivery,
  getStalePartitions,
  checkCausalOrder,
  getOrderingStats,
  getPartitionStats,
  getAllPartitionStats,
  resetOrderingState,
  type OrderedEvent,
  type VectorClock,
  type DeliverySlot,
  type OrderingStats,
} from './orderedDelivery';

// Cross-Node Propagation (topology-aware fan-out)
export {
  subscribeNode,
  getSubscribedNodes,
  propagate,
  confirmDelivery,
  getConfirmations,
  broadcastToSector,
  getPropagationStats,
  getSectorTopology,
  resetPropagationState,
  type SectorId,
  type NodeId,
  type PropagationEvent,
  type PropagationHop,
  type PropagationConfig,
  type PropagationResult,
  type PropagationStats,
} from './crossNodePropagation';

// Event Replay Engine (point-in-time replay)
export {
  createReplaySession,
  startReplay,
  pauseReplay,
  cancelReplay,
  getReplaySession,
  getActiveSessions,
  replayLastMinutes,
  replaySingleEvent,
  getReplayStats,
  cleanupSessions,
  type ReplayEvent,
  type ReplayConfig,
  type ReplaySession,
  type ReplayProgress,
  type ReplayStats,
} from './eventReplayEngine';

// ═══════════════════════════════════════════════════════════════════════════════
// v9.0.0 TSUNAMI — ULTIMATE FORM
// ═══════════════════════════════════════════════════════════════════════════════

// Priority Preemption Engine
export {
  enqueueSignal,
  dequeueNext,
  dequeueBatch,
  recordDeliveryTime,
  startBatchProcessing,
  endBatchProcessing,
  shouldPreempt,
  getCurrentBatchPriority,
  getTotalQueueDepth,
  peekNext,
  purgeExpired,
  getPreemptionStats,
  resetPreemptionState,
  type SignalPriority,
  type PrioritizedSignal,
  type PreemptionStats,
} from './ultimate/priorityPreemption';

// Per-Subscriber Adaptive Backpressure
export {
  registerSubscriber,
  unregisterSubscriber,
  canDeliver,
  getWindowSize,
  recordDeliverySuccess,
  recordDeliveryFailure,
  markPending,
  decayHealthScores,
  getSubscriberProfile,
  getAllProfiles,
  getBackpressureReport,
  updateBackpressureConfig,
  resetBackpressureState,
  type SubscriberProfile,
  type ThrottleLevel,
  type BackpressureConfig,
  type BackpressureReport,
} from './ultimate/subscriberBackpressure';

// DLQ Forensics Engine
export {
  recordDLQEvent,
  checkBypass,
  prepareReplay,
  removeDLQEntry,
  createBypassRoute,
  removeBypassRoute,
  getDLQEntries,
  getFailurePatterns,
  getBypassRoutes,
  getForensicsReport,
  resetForensicsState,
  type DLQEntry,
  type FailurePattern,
  type BypassRoute,
  type ForensicsReport,
} from './ultimate/dlqForensics';

// Signal Correlation Engine
export {
  trackSignal,
  finalizeChain,
  finalizeStaleChains,
  getChain,
  getActiveChains,
  getCompletedChains,
  getDependencyGraph,
  getHotPaths,
  setTemporalWindow,
  getCorrelationStats,
  resetCorrelationState,
  type CorrelatedSignal,
  type CausalChain,
  type DependencyEdge,
  type CorrelationStats,
} from './ultimate/signalCorrelation';

// Topic Topology Optimizer
export {
  recordPublish,
  recordSubscription,
  recordUnsubscription,
  recordFanOut,
  calculateOverlaps,
  getConsolidationSuggestions,
  getTopicProfile,
  getAllTopicProfiles,
  getTopologyReport,
  resetTopologyState,
  type TopicProfile,
  type TopologyReport,
  type ConsolidationSuggestion,
} from './ultimate/topicTopology';

// Event Schema Registry
export {
  registerSchema,
  getLatestSchema,
  getSchemaVersion,
  getSchemaHistory,
  validatePayload,
  checkCompatibility,
  deprecateSchema,
  setValidationEnabled,
  getRegisteredEventTypes,
  getActiveSchemas,
  getSchemaRegistryStats,
  resetSchemaRegistry,
  type SchemaFieldType,
  type SchemaField,
  type EventSchema,
  type ValidationResult,
  type ValidationError,
  type SchemaRegistryStats,
} from './ultimate/schemaRegistry';

// Cascade Storm Detection
export {
  recordEvent,
  isThrottled,
  throttleTopic,
  releaseThrottle,
  resolveAlert,
  tickAll,
  getActiveAlerts,
  getAlertHistory,
  getTopicVelocity,
  getStormDetectionStats,
  resetStormDetectionState,
  type StormSeverity,
  type StormAlert,
  type TopicVelocity,
  type StormDetectionStats,
} from './ultimate/stormDetection';

// Event Enrichment Pipeline
export {
  registerHook,
  unregisterHook,
  setHookEnabled,
  runPreDeliveryPipeline,
  runPostDeliveryPipeline,
  registerSystemHooks,
  getHook,
  getAllHooks,
  getEnrichmentStats,
  resetEnrichmentState,
  type HookPhase,
  type EnrichmentHook,
  type EnrichmentContext,
  type EnrichmentResult,
  type EnrichmentStats,
} from './ultimate/enrichmentPipeline';

// Live Telemetry Feed
export {
  recordPublishEvent,
  updateSubscriberLag,
  removeSubscriberLag,
  getThroughputMetrics,
  getTopicLatencies,
  getSubscriberLags,
  getHeatmap,
  getTelemetrySnapshot,
  resetTelemetryState,
  type ThroughputMetrics,
  type TopicLatency,
  type SubscriberLag,
  type HeatmapEntry,
  type TelemetrySnapshot,
} from './ultimate/telemetryFeed';

// Ultimate Form Lifecycle API
export {
  init as initUltimate,
  health as ultimateHealth,
  runCLM as ultimateCLM,
  resilience as ultimateResilience,
  resetAll as resetUltimate,
  type RippleUltimateHealth,
} from './ultimate';
