# 10. Integration Layer

**CMPSBL OS Substrate — Internal Engineering Library**

---

## Purpose

The INTEGRATION module handles all **external connections**—webhooks, third-party APIs, and data imports/exports.

---

## Adapter Pattern

Every external service uses an **adapter** that normalizes its interface:

```
External Service
      │
      ▼
┌─────────────┐
│   Adapter   │ ← Transforms external format to internal
├─────────────┤
│  - auth()   │ ← Handle service-specific auth
│  - fetch()  │ ← Get data from service
│  - push()   │ ← Send data to service
│  - webhook()│ ← Handle incoming webhooks
└─────────────┘
      │
      ▼
Internal Substrate Format
```

---

## Supported Integrations

### Payment Providers

| Service | Adapter | Capabilities |
|---------|---------|--------------|
| Stripe | `stripe-adapter` | Subscriptions, payments, webhooks |
| PayPal | `paypal-adapter` | One-time payments |

### Email Services

| Service | Adapter | Capabilities |
|---------|---------|--------------|
| Resend | `resend-adapter` | Transactional email |
| SendGrid | `sendgrid-adapter` | Marketing + transactional |

### AI Providers

| Service | Adapter | Capabilities |
|---------|---------|--------------|
| OpenAI | `openai-adapter` | Chat, embeddings, images |
| Anthropic | `anthropic-adapter` | Chat, analysis |
| Google | `google-adapter` | Chat, multimodal |
| Groq | `groq-adapter` | Fast inference |

### Data Sources

| Service | Adapter | Capabilities |
|---------|---------|--------------|
| RSS | `rss-adapter` | Feed parsing |
| Web Crawl | `crawl-adapter` | Page scraping |
| API | `generic-api-adapter` | Custom APIs |

---

## Webhook Handling

### Incoming Webhooks

```
External Service → /webhooks/{service}/{event}
                         │
                         ▼
               ┌─────────────────┐
               │ Verify Signature│ ← Each service has its own method
               └────────┬────────┘
                        │
                        ▼
               ┌─────────────────┐
               │ Parse Payload   │ ← Normalize to internal format
               └────────┬────────┘
                        │
                        ▼
               ┌─────────────────┐
               │ Route to Handler│ ← Based on event type
               └────────┬────────┘
                        │
                        ▼
               ┌─────────────────┐
               │ Process + Store │ ← Update relevant tables
               └────────┬────────┘
                        │
                        ▼
               ┌─────────────────┐
               │ Publish Event   │ ← RIPPLE notification
               └─────────────────┘
```

### Webhook Security

```
Verification by Service:
─────────────────────────
Stripe: HMAC-SHA256 signature in header
PayPal: Webhook ID verification
Resend: API key in header
Custom: Configurable (HMAC, API key, IP whitelist)
```

---

## Outgoing Requests

### Retry Logic

```
On failure:
1. Wait 1 second, retry
2. Wait 5 seconds, retry
3. Wait 30 seconds, retry
4. Wait 5 minutes, retry
5. Give up, log failure, alert

Exponential backoff with jitter:
delay = min(base × 2^attempt + random(0, 1000ms), max_delay)
```

### Circuit Breaker

Each external service has its own circuit breaker:

```
If 3 consecutive failures:
→ Circuit OPENS
→ No requests for 60 seconds
→ Then HALF-OPEN (one test request)
→ If success: CLOSE
→ If fail: Stay OPEN another 60 seconds
```

---

## Data Transformation

### Import Pipeline

```
External Data
      │
      ▼
┌─────────────┐
│ Validate    │ ← Schema validation
└─────┬───────┘
      │
      ▼
┌─────────────┐
│ Transform   │ ← Field mapping, type conversion
└─────┬───────┘
      │
      ▼
┌─────────────┐
│ Enrich      │ ← Add computed fields, relationships
└─────┬───────┘
      │
      ▼
┌─────────────┐
│ Store       │ ← Insert/update in database
└─────────────┘
```

### Export Pipeline

```
Internal Data
      │
      ▼
┌─────────────┐
│ Query       │ ← Fetch with filters
└─────┬───────┘
      │
      ▼
┌─────────────┐
│ Transform   │ ← Convert to external format
└─────┬───────┘
      │
      ▼
┌─────────────┐
│ Paginate    │ ← Chunk if large
└─────┬───────┘
      │
      ▼
┌─────────────┐
│ Deliver     │ ← Send to destination
└─────────────┘
```

---

## Secret Management

```
Secrets are:
- Stored encrypted in environment variables
- Never logged (even in debug mode)
- Rotated automatically when possible
- Scoped to specific integrations

Access Pattern:
integration.getSecret('STRIPE_SECRET_KEY')
→ Fetches from secure storage
→ Decrypts in memory
→ Never written to disk or logs
```

---

## v8.5.0 Infrastructure Integration

### Plugin SDK
- **Location:** `src/lib/substrate/plugin-sdk/`
- **Purpose:** Extension framework for third-party plugins with lifecycle management
- **Features:** Manifest registration, permission model, hook system, sandboxed execution
- **Tier:** Enterprise

### File Processing Pipeline
- **Location:** `src/lib/substrate/file-processing/`
- **Purpose:** CSV, JSON, Markdown, HTML ingestion with optional Brain routing
- **Functions:** `ingestFile()`, `getStatus()`, `getSupportedTypes()`
- **Tier:** Builder

---

*CMPSBL OS Substrate v9.1.0 — ARCHITECT Epoch — Internal Engineering Library*
*© 2025-2026 PromptFluid®. All rights reserved.*
