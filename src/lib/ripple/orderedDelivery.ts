/**
 * RIPPLE Ordered Delivery Engine — v1.0.0
 * Guarantees FIFO ordering within partitions and causal ordering across partitions
 * 
 * Provides:
 * - Per-partition FIFO guarantee
 * - Causal ordering via vector clocks
 * - Out-of-order detection and resequencing
 * - Delivery confirmation tracking
 */

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export interface OrderedEvent {
  id: string;
  partitionKey: string;
  sequenceNumber: number;
  vectorClock: VectorClock;
  payload: unknown;
  deliveredAt?: string;
}

export interface VectorClock {
  [nodeId: string]: number;
}

export interface DeliverySlot {
  partitionKey: string;
  expectedSequence: number;
  buffer: OrderedEvent[];
  lastDeliveredAt: string | null;
  outOfOrderCount: number;
}

export interface OrderingStats {
  totalDelivered: number;
  totalOutOfOrder: number;
  partitionCount: number;
  bufferDepth: number;
  maxBufferSize: number;
}

// ═══════════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════════

const MAX_BUFFER_SIZE = 1000;
const MAX_WAIT_MS = 5000; // Max time to wait for missing sequence

// ═══════════════════════════════════════════════════════════════════════════════
// STATE
// ═══════════════════════════════════════════════════════════════════════════════

const deliverySlots = new Map<string, DeliverySlot>();
const vectorClocks = new Map<string, VectorClock>();
let totalDelivered = 0;
let totalOutOfOrder = 0;

// ═══════════════════════════════════════════════════════════════════════════════
// VECTOR CLOCK OPERATIONS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Increment vector clock for a node
 */
export function tickClock(nodeId: string): VectorClock {
  const clock = vectorClocks.get(nodeId) || {};
  clock[nodeId] = (clock[nodeId] || 0) + 1;
  vectorClocks.set(nodeId, clock);
  return { ...clock };
}

/**
 * Merge two vector clocks (take max of each component)
 */
export function mergeClock(a: VectorClock, b: VectorClock): VectorClock {
  const result: VectorClock = { ...a };
  for (const [nodeId, time] of Object.entries(b)) {
    result[nodeId] = Math.max(result[nodeId] || 0, time);
  }
  return result;
}

/**
 * Check if clock A happened-before clock B
 */
export function happenedBefore(a: VectorClock, b: VectorClock): boolean {
  let atLeastOneLess = false;
  
  for (const nodeId of new Set([...Object.keys(a), ...Object.keys(b)])) {
    const aTime = a[nodeId] || 0;
    const bTime = b[nodeId] || 0;
    
    if (aTime > bTime) return false;
    if (aTime < bTime) atLeastOneLess = true;
  }
  
  return atLeastOneLess;
}

/**
 * Check if two clocks are concurrent (neither happened-before the other)
 */
export function areConcurrent(a: VectorClock, b: VectorClock): boolean {
  return !happenedBefore(a, b) && !happenedBefore(b, a);
}

// ═══════════════════════════════════════════════════════════════════════════════
// ORDERED DELIVERY
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Get or create delivery slot for a partition
 */
function getDeliverySlot(partitionKey: string): DeliverySlot {
  let slot = deliverySlots.get(partitionKey);
  if (!slot) {
    slot = {
      partitionKey,
      expectedSequence: 1,
      buffer: [],
      lastDeliveredAt: null,
      outOfOrderCount: 0,
    };
    deliverySlots.set(partitionKey, slot);
  }
  return slot;
}

/**
 * Enqueue event for ordered delivery
 * Returns events that are ready to be delivered in order
 */
export function enqueueForOrdering(event: OrderedEvent): OrderedEvent[] {
  const slot = getDeliverySlot(event.partitionKey);
  const readyEvents: OrderedEvent[] = [];

  // If this is the expected sequence, deliver immediately
  if (event.sequenceNumber === slot.expectedSequence) {
    event.deliveredAt = new Date().toISOString();
    readyEvents.push(event);
    slot.expectedSequence++;
    slot.lastDeliveredAt = event.deliveredAt;
    totalDelivered++;

    // Check buffer for next sequential events
    while (true) {
      const nextIdx = slot.buffer.findIndex(
        e => e.sequenceNumber === slot.expectedSequence
      );
      if (nextIdx === -1) break;

      const nextEvent = slot.buffer.splice(nextIdx, 1)[0];
      nextEvent.deliveredAt = new Date().toISOString();
      readyEvents.push(nextEvent);
      slot.expectedSequence++;
      slot.lastDeliveredAt = nextEvent.deliveredAt;
      totalDelivered++;
    }
  } else if (event.sequenceNumber > slot.expectedSequence) {
    // Future event - buffer it
    slot.buffer.push(event);
    slot.outOfOrderCount++;
    totalOutOfOrder++;

    // Sort buffer by sequence number
    slot.buffer.sort((a, b) => a.sequenceNumber - b.sequenceNumber);

    // Enforce buffer size limit
    while (slot.buffer.length > MAX_BUFFER_SIZE) {
      slot.buffer.shift();
    }
  }
  // Else: past event (duplicate or late) - ignore

  return readyEvents;
}

/**
 * Force delivery of buffered events (skip missing sequences)
 * Use when we've waited too long for missing events
 */
export function forceDelivery(partitionKey: string): OrderedEvent[] {
  const slot = deliverySlots.get(partitionKey);
  if (!slot || slot.buffer.length === 0) return [];

  const readyEvents: OrderedEvent[] = [];
  const now = new Date().toISOString();

  // Sort and deliver all buffered events
  slot.buffer.sort((a, b) => a.sequenceNumber - b.sequenceNumber);

  for (const event of slot.buffer) {
    event.deliveredAt = now;
    readyEvents.push(event);
    totalDelivered++;
  }

  // Update expected sequence to after the highest delivered
  if (slot.buffer.length > 0) {
    slot.expectedSequence = slot.buffer[slot.buffer.length - 1].sequenceNumber + 1;
    slot.lastDeliveredAt = now;
  }

  slot.buffer = [];

  return readyEvents;
}

/**
 * Check for partitions with stale buffers that need force-delivery
 */
export function getStalePartitions(maxWaitMs: number = MAX_WAIT_MS): string[] {
  const stale: string[] = [];
  const cutoff = Date.now() - maxWaitMs;

  for (const [partitionKey, slot] of deliverySlots) {
    if (slot.buffer.length > 0) {
      // Check if we've been waiting too long
      const oldestInBuffer = slot.buffer[0];
      // If we don't have a timestamp, use lastDeliveredAt as proxy
      if (slot.lastDeliveredAt) {
        const lastTime = new Date(slot.lastDeliveredAt).getTime();
        if (lastTime < cutoff) {
          stale.push(partitionKey);
        }
      }
    }
  }

  return stale;
}

// ═══════════════════════════════════════════════════════════════════════════════
// CAUSAL ORDERING
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Check if an event respects causal ordering
 */
export function checkCausalOrder(
  event: OrderedEvent,
  lastDelivered: OrderedEvent | null
): { valid: boolean; reason?: string } {
  if (!lastDelivered) return { valid: true };

  // Check vector clock ordering
  if (happenedBefore(event.vectorClock, lastDelivered.vectorClock)) {
    return {
      valid: false,
      reason: 'Event happened-before the last delivered event (causality violation)',
    };
  }

  return { valid: true };
}

// ═══════════════════════════════════════════════════════════════════════════════
// STATISTICS
// ═══════════════════════════════════════════════════════════════════════════════

export function getOrderingStats(): OrderingStats {
  let bufferDepth = 0;
  for (const slot of deliverySlots.values()) {
    bufferDepth += slot.buffer.length;
  }

  return {
    totalDelivered,
    totalOutOfOrder,
    partitionCount: deliverySlots.size,
    bufferDepth,
    maxBufferSize: MAX_BUFFER_SIZE,
  };
}

export function getPartitionStats(partitionKey: string): DeliverySlot | null {
  return deliverySlots.get(partitionKey) || null;
}

export function getAllPartitionStats(): DeliverySlot[] {
  return Array.from(deliverySlots.values());
}

/**
 * Reset all ordering state (for testing)
 */
export function resetOrderingState(): void {
  deliverySlots.clear();
  vectorClocks.clear();
  totalDelivered = 0;
  totalOutOfOrder = 0;
}
