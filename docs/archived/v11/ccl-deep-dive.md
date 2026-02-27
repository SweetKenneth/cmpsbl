# OCG Deep Dive — Operational Compliance Grid

## Classification: Technical Reference — CMPSBL v11.5

---

## Overview

The **Operational Compliance Grid (OCG)** provides high-performance infrastructure services for the entire substrate. Operating as a right-side Grid tapped off the Vertical Spine, it enforces boundary compliance (event routing, entitlements, session management, webhooks, and integrity logging) consumed by all downstream Execution surfaces and Fields.

OCG zones are **invisible** in the public entity registry but fully monitored via System Integrity and GOAL telemetry.

---

## Zone Architecture

### RIPPLE Zone

**Weight**: 0.040 | **Sector**: OCG | **Boot Order**: 1st in OCG

| Responsibility | Implementation |
|---------------|----------------|
| Signal/event bus | Pub/sub event distribution across all zones |
| Inter-zone communication | Decoupled messaging with topic-based routing |
| Event replay | Bounded event history for late subscribers |
| Backpressure | Automatic throttling under load |

**Key Invariants**:
- Events are delivered at-least-once (idempotency required at consumers)
- Topic subscriptions are lazy-initialized on first publish
- Event replay buffer is bounded (last 1,000 events per topic)

**Hardening**:
- Payload ceiling: 50KB per event to prevent memory bloat
- Topic names validated: 1–256 chars, alphanumeric + dots
- Subscriber count per topic bounded to 100

**Event Schema**:
```typescript
interface RippleEvent {
  id: string;          // UUID v4
  topic: string;       // e.g., "brain.reflection.complete"
  payload: unknown;    // <= 50KB serialized
  timestamp: number;   // Unix ms
  source: string;      // Originating zone/node
  correlationId?: string;
}
```

---

### ACCESS Zone

**Weight**: 0.040 | **Sector**: OCG | **Boot Order**: 2nd in OCG

| Responsibility | Implementation |
|---------------|----------------|
| API entitlements | Developer key management and validation |
| Rate limiting | Per-key and per-IP rate enforcement |
| Usage metering | Quota tracking with daily rollover |
| Product catalog | Capability-to-entitlement mapping |

**Key Invariants**:
- API keys are stored as salted SHA-256 hashes — plaintext never persisted
- Rate limits are enforced at the zone boundary before downstream dispatch
- Usage quotas roll over at midnight UTC

**Hardening**:
- Key prefix validated: 8-char alphanumeric
- Scope arrays bounded to 50 entries
- Rate limit values clamped: 1–10,000 per minute, 1–1,000,000 per day

**Tiering Model**:

| Tier | Monthly Quota | Rate Limit/min | Products |
|------|--------------|----------------|----------|
| Free | 1,000 calls | 10 | Basic capabilities |
| Developer | 50,000 calls | 100 | Standard capabilities |
| Professional | 500,000 calls | 500 | All capabilities |
| Enterprise | Unlimited | 2,000 | All + priority routing |

---

### IDENTITY Zone

**Weight**: 0.040 | **Sector**: OCG | **Boot Order**: 3rd in OCG

| Responsibility | Implementation |
|---------------|----------------|
| Session management | Stateful session tracking with TTL |
| Role resolution | Permission-based access control |
| Actor registry | Bounded registry of system actors |
| Passkey management | Multi-credential support per actor |

**Key Invariants**:
- Sessions expire after configurable TTL (default: 24 hours)
- Role resolution is deterministic — same input always produces same permissions
- Actor registry is append-only with soft-delete

**Hardening**:
- Actor limit: 1,000 entries with LRU eviction
- Passkeys per actor: maximum 20
- Session tokens validated: 1–512 chars
- Role names validated: 1–64 chars, lowercase alphanumeric + underscores

---

### RELAY Zone

**Weight**: 0.040 | **Sector**: OCG | **Boot Order**: 4th in OCG

| Responsibility | Implementation |
|---------------|----------------|
| Webhook dispatch | HTTP POST delivery to registered endpoints |
| External integrations | Third-party service connectivity |
| Retry logic | Exponential backoff with dead-letter queue |
| Delivery tracking | Per-webhook delivery status and timing |

**Key Invariants**:
- Webhooks are dispatched asynchronously — never blocking the calling zone
- Failed deliveries retry with exponential backoff (1s, 2s, 4s, 8s, max 60s)
- Dead-letter queue preserves undeliverable payloads for manual review

**Hardening**:
- Delivery log bounded to 500 entries
- Dispatch targets validated: 1–2,048 chars, must be valid URL format
- Payload size limit: 100KB per webhook
- Maximum retry count: 5 before dead-letter

---

### AUDIT Zone

**Weight**: 0.040 | **Sector**: OCG | **Boot Order**: 5th in OCG (last)

| Responsibility | Implementation |
|---------------|----------------|
| Integrity ledger | Append-only hash-chained audit log |
| Compliance logging | Structured records for regulatory review |
| Tamper detection | Hash chain verification on read |
| Auto-compression | Automatic log compression at threshold |

**Key Invariants**:
- Audit records are immutable once written — no updates, no deletes
- Hash chain: each record includes SHA-256 of previous record
- Compression triggers at 5,000 entries to preserve memory

**Hardening**:
- Audit log bounded to 5,000 entries with auto-compression
- Hash chain integrity verified on every read operation
- Log entry fields validated: action (1–256 chars), entity (1–512 chars)

**Hash Chain Structure**:
```
Record N:
  id: uuid_v4
  action: "identity.session.create"
  entity: "actor:abc123"
  timestamp: 1706000000000
  metadata: { ... }
  prevHash: SHA-256(Record N-1)
  hash: SHA-256(id + action + entity + timestamp + prevHash)
```

---

## OCG Health Aggregation

OCG health is the weighted average of its five zones:

```
ocg_health = (RIPPLE + ACCESS + IDENTITY + RELAY + AUDIT) / 5
```

OCG contributes 20% to global Matrix Integrity.

---

## Cross-Spine Dependencies

```
CCR ←→ OCG Communication:
  BRAIN → RIPPLE (event emission)
  DREAM → RELAY (external synthesis triggers)
  MEMORY → AUDIT (recall audit trails)
  SYSTEM → ACCESS (entitlement validation)

OCG → Execution:
  RIPPLE → all surfaces (event delivery)
  ACCESS → NEXUS (API key validation before routing)
  IDENTITY → CORTEX (session context for orchestration)
  RELAY → INTEGRATION (webhook registration)
  AUDIT → VISION (audit visualization)
```

---

*Technical Reference — CMPSBL v11.5 — SPARTA Epoch*
*© 2025–2026 PromptFluid®. All rights reserved.*
