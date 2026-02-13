# 07. Defense & Security Module

**CMPSBL OS Substrate — Internal Engineering Library**

---

## Security Architecture

The DEFENSE module is the **gatekeeper**. Every request passes through it before reaching any other module.

---

## API Key System

### Key Structure

```
Format: pf_{environment}_{random}

Examples:
- pf_live_a8f3k2m9p4x7... (production)
- pf_test_b2c4d6e8f0g1... (testing)

Components:
- Prefix: "pf_" (PromptFluid identifier)
- Environment: "live" or "test"
- Random: 24 characters, cryptographically secure
```

### Key Storage Secret

**We never store the full key.** Only:

```
Stored:
- key_prefix: "pf_live_a8f3" (first 12 chars for identification)
- key_hash: SHA-256(full_key + salt)

Verification:
1. User sends full key
2. We hash it with same salt
3. Compare to stored hash
4. If match → authenticated
```

This means if the database is compromised, attackers only get hashes—not usable keys.

---

## Rate Limiting

### Layered Limits

```
Layer 1: Per-Minute (burst protection)
─────────────────────────────────────
Default: 60 requests/minute
Premium: 300 requests/minute
Enterprise: 1000 requests/minute

Layer 2: Per-Day (quota protection)
────────────────────────────────────
Default: 1000 requests/day
Premium: 10,000 requests/day
Enterprise: 100,000 requests/day

Layer 3: Global (system protection)
───────────────────────────────────
All users combined: 10,000 requests/minute
Emergency brake at 50,000 requests/minute
```

### The Adaptive Secret

Rate limits **adjust based on behavior**:

```
Good behavior (no errors, reasonable patterns):
→ Limits gradually increase (up to 2x)

Bad behavior (many errors, suspicious patterns):
→ Limits gradually decrease (down to 0.5x)
→ Repeated bad behavior → temporary ban
```

---

## Threat Detection

### Patterns We Watch For

| Pattern | Detection | Response |
|---------|-----------|----------|
| Credential stuffing | Multiple failed auth attempts | Exponential backoff |
| Enumeration | Sequential ID requests | Block + alert |
| Injection | SQL/NoSQL patterns in input | Block + log |
| Scraping | High frequency, low variation | Throttle |
| DDoS | Traffic spike from single source | Rate limit + CAPTCHA |

### The Fingerprinting Secret

We create a **behavioral fingerprint** for each API key:

```
Fingerprint components:
- Typical request patterns (timing, frequency)
- Common endpoints used
- Average payload sizes
- Error rate baseline
- Geographic distribution

Anomaly detection:
If current behavior deviates >2 standard deviations
→ Flag for review
→ Optionally challenge (CAPTCHA, 2FA)
```

---

## Scope-Based Access Control

### Scope Hierarchy

```
Full Access
    │
    └── *:*
        ├── brain:* (all brain operations)
        │   ├── brain:read (recall, status)
        │   └── brain:write (store, forget)
        │
        ├── system:* (all system operations)
        │   ├── system:read (status, diagnostics)
        │   └── system:admin (backup, restore, heal)
        │
        ├── evolution:* (all evolution operations)
        │   ├── evolution:read (proposals, receipts)
        │   └── evolution:write (propose, apply)
        │
        └── ... (other modules follow same pattern)
```

### Default Scopes by Tier

| Tier | Default Scopes |
|------|----------------|
| Free | `brain:read`, `decode:*`, `system:read` |
| Pro | All `:read` scopes, `brain:write` |
| Enterprise | `*:*` (full access) |

---

## Audit Logging

**Everything is logged.** But smartly:

```
Always Logged:
- Authentication attempts (success/fail)
- Scope violations (attempted unauthorized access)
- Rate limit hits
- Error responses
- Admin operations

Never Logged (privacy):
- Full request bodies (only hashes)
- User content (only metadata)
- API keys (only prefixes)
```

### Log Retention

```
Security logs: 2 years (compliance)
Usage logs: 90 days (optimization)
Debug logs: 7 days (troubleshooting)
```

---

## Emergency Procedures

### Circuit Breaker States

```
DEFENSE module has its own circuit:

CLOSED: Normal operation
DEGRADED: Increased logging, stricter limits
LOCKDOWN: Only admin operations allowed
OFFLINE: All requests rejected (manual recovery only)
```

### Lockdown Triggers

1. **Automatic:** >1000 security events in 5 minutes
2. **Automatic:** Database connection lost
3. **Automatic:** AI provider auth failure
4. **Manual:** Admin command `defense.lockdown`

---

## Infrastructure Integration

### Adaptive Rate Limiting
- **Location:** `src/lib/substrate/adaptive-rate-limit/`
- **Purpose:** Dynamic rate limits that adapt to system pressure and tenant reputation
- **Features:** Token bucket with adaptive multiplier, pressure-based throttling
- **Tier:** Builder

### Persistent Rate Limiter
- **Location:** `src/lib/substrate/persistent-rate-limit/`
- **Purpose:** Cross-tab/instance rate limiting via localStorage + BroadcastChannel
- **Tier:** Builder

### Secret Rotation
- **Location:** `src/lib/substrate/secret-rotation/`
- **Purpose:** Automated credential cycling for external API keys
- **Tier:** Enterprise

---

*CMPSBL OS Substrate v9.1.0 — ARCHITECT Epoch — Internal Engineering Library*
*© 2025-2026 PromptFluid®. All rights reserved.*
