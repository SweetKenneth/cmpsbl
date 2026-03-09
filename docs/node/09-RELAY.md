# RELAY — Cross-Node Message Routing & Protocol Translation

> **Node ID:** `relay` · **Sector:** OCG · **Generation:** 1 · **Node #9 of 40**
> **Codename:** *Bridge* · **Classification:** FOUNDER EYES ONLY

---

## Executive Summary

RELAY handles cross-node message routing, protocol translation, and message transformation. While RIPPLE provides the raw pub/sub bus, RELAY adds intelligent routing — determining the optimal path between nodes, translating message formats between incompatible protocols, and ensuring message delivery guarantees across sector boundaries.

---

## Architecture

### Message Routing

RELAY maintains a routing table derived from the Matrix Communication Bus topology:

```
routing_decision(from, to, payload):
  1. Check direct path (same sector) → use nodeSignal
  2. Check sector bridge (cross-sector) → use sectorBroadcast
  3. Check matrix broadcast (all nodes) → use matrixBroadcast
  4. If all paths fail → enqueue in DLQ with retry
```

### Protocol Translation

Nodes use different message formats. RELAY translates between:
- **Module Bus format** (internal): `{ module, event_type, data }`
- **Matrix Signal format** (topology-aware): `{ from, to, signal, payload, sector }`
- **External API format** (gateway): `{ action, params, auth }`

### Relay Hardening

The Relay Hardening layer (`relay-hardening.ts`) provides:
- Message size limits (100KB max payload)
- Rate limiting per source node (100 msg/sec)
- Circuit breaker per destination (trips after 5 consecutive failures)
- Payload sanitization (strip sensitive fields before cross-sector routing)

---

## Trade Secrets

### 1. Shortest-Path Routing

RELAY computes shortest paths using the topology adjacency matrix. Cross-sector messages traverse the minimum number of sector boundaries, reducing latency and failure probability.

### 2. Message Deduplication

RELAY uses the same idempotency key system as RIPPLE but with a separate 5,000-entry cache. This prevents duplicate messages when RIPPLE and RELAY both process the same signal (belt-and-suspenders deduplication).

### 3. Sector Isolation

Messages between sectors are validated at the boundary. A message from CSZ (Covert Systems Zone) to OCG (Operational Compliance Grid) must pass through RELAY's compliance check, ensuring covert operations don't leak into compliance audit trails.

---

## CLM Learning Priorities

1. **Route Optimization** — Learning which routing paths have lowest latency under different load conditions
2. **Protocol Evolution** — Adapting translation rules as node message formats evolve

---

*CMPSBL® Substrate — RELAY Node Deep Dive · Founder Eyes Only*
