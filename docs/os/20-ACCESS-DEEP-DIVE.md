# 20: ACCESS Deep Dive — Identity & Billing

**API Keys, Rate Limiting, Usage Metering, and Billing**

---

## What is Access?

Think of Access as the **front door** of the substrate. It answers three questions for every request:

1. **Who are you?** (Authentication)
2. **What can you do?** (Authorization)
3. **How much have you used?** (Metering)

**Plain English:** Access is the bouncer that checks your ID, tells you which rooms you can enter, and keeps a tab of your drinks.

---

## Core Responsibilities

### 1. API Key Management

Every developer gets API keys to access the substrate. These keys:
- Identify who's making requests
- Determine what actions they can perform
- Track their usage for billing

### 2. Rate Limiting

Prevents abuse by limiting how many requests each key can make:
- Per minute (burst protection)
- Per day (quota management)

### 3. Usage Metering

Tracks everything for billing:
- How many API calls
- How many AI tokens consumed
- How much compute time used

### 4. Billing Integration

Connects to Stripe for:
- Subscription management
- Usage-based billing
- Quota enforcement

---

## API Key Anatomy

An API key looks like this:

```
pf_sk_live_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
│  │  │    └──────────────────────────────────┘
│  │  │                     │
│  │  │                 Random hash
│  │  │
│  │  └── Environment (live/test)
│  │
│  └──── Key type (sk = secret key)
│
└────── Prefix (promptfluid)
```

**Key Types:**
- `sk` — Secret key (server-side only, never expose)
- `pk` — Publishable key (safe for client-side)

---

## Key Actions

### `createKey`

Generate a new API key.

```typescript
const key = await substrate.access.createKey({
  name: 'Production App',
  scopes: ['brain:read', 'brain:write', 'nexus:text'],
  rate_limit_per_minute: 60,
  rate_limit_per_day: 10000
});
// Returns: { key: 'pf_sk_live_...', key_prefix: 'pf_sk_live_a1b2' }
```

**Important:** The full key is only shown once. Store it securely!

---

### `validateKey`

Check if a key is valid and get its permissions.

```typescript
const validation = await substrate.access.validateKey({
  key_prefix: 'pf_sk_live_a1b2'
});
// Returns: { valid: true, scopes: [...], rate_limit: {...} }
```

---

### `revokeKey`

Disable a key immediately.

```typescript
await substrate.access.revokeKey({
  key_prefix: 'pf_sk_live_a1b2',
  reason: 'Key compromised'
});
```

---

### `quotaCheck`

Check if a key has remaining quota.

```typescript
const quota = await substrate.access.quotaCheck({
  key_prefix: 'pf_sk_live_a1b2'
});
// Returns: { 
//   allowed: true, 
//   calls_remaining: 9500, 
//   resets_at: '2026-01-24T00:00:00Z' 
// }
```

---

### `usage`

Get usage statistics.

```typescript
const usage = await substrate.access.usage({
  key_prefix: 'pf_sk_live_a1b2',
  period: 'month'
});
// Returns: {
//   calls: 15000,
//   tokens: 2500000,
//   cost_cents: 4500,
//   by_module: { brain: 5000, nexus: 10000, ... }
// }
```

---

### `metered`

Record billable usage (called internally by other modules).

```typescript
await substrate.access.metered({
  key_prefix: 'pf_sk_live_a1b2',
  module: 'nexus',
  action: 'text',
  tokens: 1500,
  compute_ms: 230
});
```

---

## Scopes

Scopes control what actions a key can perform:

| Scope | Allows |
|-------|--------|
| `brain:read` | Query memories |
| `brain:write` | Store memories |
| `nexus:text` | Generate text |
| `nexus:image` | Generate images |
| `defense:read` | View security logs |
| `system:admin` | Full admin access |
| `*` | Everything (dangerous!) |

**Example:** A mobile app might only get `brain:read` and `nexus:text` — enough to query and generate, but not to modify data or access admin functions.

---

## Rate Limiting

### How It Works

```
Request comes in
      │
      ▼
[Check minute counter]
      │
  ┌───┴───┐
  │       │
Under   Over
 ↓       ↓
Allow   429 Error
```

### Rate Limit Response

When rate limited, you get:

```json
{
  "error": "rate_limit_exceeded",
  "retry_after": 45,
  "limit": 60,
  "remaining": 0,
  "reset": "2026-01-23T19:31:00Z"
}
```

### Tiers

| Tier | Per Minute | Per Day | Price |
|------|------------|---------|-------|
| Free | 10 | 100 | $0 |
| Starter | 60 | 10,000 | $29/mo |
| Pro | 300 | 100,000 | $99/mo |
| Enterprise | Unlimited | Unlimited | Custom |

---

## Usage-Based Billing

Beyond rate limits, usage is metered for billing:

| Metric | How It's Measured |
|--------|-------------------|
| API Calls | Per request |
| AI Tokens | Input + output tokens |
| Compute Time | Milliseconds of processing |
| Storage | Bytes in brain memory |

**Example Bill:**
```
API Calls:       15,000 × $0.001  = $15.00
AI Tokens:    2,500,000 × $0.00001 = $25.00
Compute Time:    10,000 ms × $0.0001 = $1.00
Storage:           500 MB × $0.10 = $50.00
─────────────────────────────────────────────
Total:                             $91.00
```

---

## Database Tables

### `access_api_keys`
Stores API key metadata (not the key itself—only a hash).

| Column | Purpose |
|--------|---------|
| `id` | Internal ID |
| `developer_id` | Owner |
| `key_hash` | SHA-256 of key (for validation) |
| `key_prefix` | First 12 chars (for identification) |
| `scopes` | Allowed actions |
| `rate_limit_per_minute` | Request limit |
| `rate_limit_per_day` | Daily quota |
| `is_active` | Whether key works |

### `access_usage`
Logs every billable action.

| Column | Purpose |
|--------|---------|
| `api_key_id` | Which key |
| `module` | brain/nexus/etc |
| `action` | What happened |
| `tokens_used` | AI tokens consumed |
| `compute_ms` | Processing time |
| `cost_millicents` | Cost in 0.001 cents |

### `access_subscriptions`
Links to Stripe subscriptions.

| Column | Purpose |
|--------|---------|
| `developer_id` | Owner |
| `tier` | free/starter/pro/enterprise |
| `stripe_subscription_id` | Stripe reference |
| `monthly_quota` | Allowed calls per month |

---

## Terminal Commands

```bash
# Create a new key
access.createKey "My App" brain:read,nexus:text

# Check quota
access.quotaCheck pf_sk_live_a1b2

# View usage
access.usage pf_sk_live_a1b2 month

# Revoke a key
access.revokeKey pf_sk_live_a1b2 "No longer needed"

# List all keys
access.keys
```

---

## Security Best Practices

1. **Never expose secret keys in client code** — Use publishable keys for frontend
2. **Use minimal scopes** — Only give keys the permissions they need
3. **Rotate keys regularly** — Create new keys, update apps, revoke old keys
4. **Monitor usage** — Unusual spikes might indicate compromise
5. **Use environment variables** — Never hardcode keys in source code

---

## Integration with Other Modules

```
Every Request
     │
     ▼
  ACCESS ← Validates key, checks quota, records usage
     │
     ▼
  [Target Module] ← Processes request
     │
     ▼
  ACCESS ← Records final usage (tokens, compute time)
     │
     ▼
  VISION ← Logs the complete request for observability
```

---

## Next Steps

This completes the module deep-dive series! You now understand all 11 modules that make up the promptfluid substrate.

Return to the [Index](./00-INDEX.md) or explore:
- [ARCHITECTURE-DIAGRAMS.md](./06-ARCHITECTURE-DIAGRAMS.md) — Visual overview
- [INVESTOR-TALKING-POINTS.md](./09-INVESTOR-TALKING-POINTS.md) — Key value propositions
