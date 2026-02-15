<div align="center">

# Module 16 — RELAY

### Webhooks and Outbound Notifications

Layer 6 — Infrastructure

v10.5.1 ARCHITECT Epoch

</div>

---

## Purpose

RELAY handles all outbound communication from the substrate — webhooks, email notifications, Slack messages, and custom delivery channels. It ensures reliable delivery with retry logic, deduplication, delivery tracking, and cryptographic signature verification.

---

## Capabilities

| Capability | Description | Tier |
|-----------|-------------|------|
| Webhook Delivery | Send HTTP POST payloads to configured endpoints | Free |
| Delivery Tracking | Track delivery status (pending, sent, failed, confirmed) | Free |
| Retry Logic | Exponential backoff with configurable max attempts | Free |
| HMAC-SHA256 Signature Verification (v10.5.1) | Cryptographically sign all outbound webhooks for payload integrity | Free |
| Adaptive Retry Backoff (v10.5.1) | Jitter-based exponential backoff preventing thundering herd | Free |
| Email Notifications | Send templated emails via configured SMTP or API | Pro |
| Delivery Deduplication | Prevent duplicate deliveries using idempotency keys | Pro |
| Multi-Channel Routing | Route notifications to appropriate channels by type | Pro |
| Slack Integration | Send notifications to Slack channels and DMs | Enterprise |
| Custom Channels | Register custom delivery adapters | Enterprise |
| Delivery Analytics | Track delivery rates, latency, and failure patterns | CMPSBL |
| Smart Batching | Aggregate rapid-fire events into digest notifications | CMPSBL |

---

## Webhook Signature Verification (v10.5.1)

All outbound webhooks are now signed using HMAC-SHA256:

```
Signature = HMAC-SHA256(endpoint_secret, timestamp + "." + payload_json)

Headers sent:
  X-Substrate-Signature: sha256={signature}
  X-Substrate-Timestamp: {unix_timestamp}
```

Receivers can verify payload integrity by recomputing the HMAC and comparing signatures.

---

## Adaptive Retry Backoff (v10.5.1)

Retry delays now include randomized jitter to prevent thundering herd:

| Attempt | Base Delay | Jitter Range | Effective Delay |
|---------|-----------|-------------|-----------------|
| 1 | Immediate | — | 0s |
| 2 | 30s | ±15s | 15–45s |
| 3 | 2min | ±60s | 1–3min |
| 4 | 15min | ±5min | 10–20min |
| 5 | 1hr | ±15min | 45min–1h15min |
| Final | — | — | Mark permanently failed, alert operator |

---

## Delivery Flow

```
Event triggers notification
         │
         ▼
┌─────────────────┐
│  Channel Router  │  Determine delivery channel(s) based on event type
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Template Engine │  Apply notification template with event data
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Deduplication   │  Check idempotency key to prevent duplicate sends
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  HMAC Signing    │  Sign payload with endpoint secret (v10.5.1)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Delivery        │  Send via appropriate adapter (HTTP, SMTP, Slack API)
└────────┬────────┘
         │
         ├─ Success → Mark delivered, log in AUDIT
         │
         └─ Failure → Queue for adaptive retry with jitter
```

---

## Integration with Other Modules

| Module | Integration |
|--------|------------|
| RIPPLE | Subscribes to events that trigger notifications |
| INTEGRATION | Uses external adapters for delivery (Slack, email providers) |
| AUDIT | Logs all delivery attempts and outcomes |
| DEFENSE | Validates webhook endpoints before registration |
| ECONOMY | Tracks notification costs (email API charges) |
| BRAIN | Receives delivery reliability heuristics via Brain Transfer |

---

## Database Tables

| Table | Purpose |
|-------|---------|
| `relay_webhooks` | Registered webhook endpoints and configurations |
| `relay_deliveries` | Delivery attempt log with status tracking |
| `relay_templates` | Notification templates by channel and event type |

---

<div align="center">

CMPSBL OS Substrate v10.5.1 — ARCHITECT Epoch

Kenneth E Sweet Jr · PromptFluid

ORCID: XXXX-XXXX-XXXX-XXXX · DOI: 10.5281/zenodo.XXXXXXX

© 2025–2026 PromptFluid. All rights reserved.

</div>
