# 08 — Security Internals

**Classification:** 🔒 INTERNAL

---

## 1. Purpose

This document describes the internal security mechanisms of the DEFENSE shell and supporting security infrastructure. It covers threat detection, attack prevention, data protection, and intelligence gathering capabilities.

## 2. DEFENSE Shell Architecture (Fortress v2.0.0)

The DEFENSE shell is the outermost containment boundary of the substrate. It implements 25 hardening features organized into five domains:

### 2.1 Identity & Fraud Detection

| Feature | Description |
|---------|-------------|
| Geo-velocity detection | Flags logins from geographically impossible locations based on time between requests |
| Impossible travel detection | Calculates if a user could have physically traveled between two request origins |
| Request fingerprinting (FNV-1a) | Creates a unique fingerprint per client using request characteristics |
| Session binding validation | Ensures session tokens are bound to the originating client fingerprint |

### 2.2 Attack Prevention

| Feature | Description |
|---------|-------------|
| Honeypot Registry | 15 decoy paths that log and analyze any access attempts |
| Progressive challenge escalation | Escalates from passive monitoring → PoW challenges → CAPTCHA as suspicion increases |
| Replay Attack Guard | Nonce + TTL validation prevents request replay attacks |
| Rate limiting | Per-IP, per-endpoint, per-API-key rate limits |
| IP Reputation System | `update_ip_reputation()` — tracks and scores IP addresses based on behavior history |

### 2.3 Data Protection

| Feature | Description |
|---------|-------------|
| PII egress filtering | Scans outbound responses for SSN, credit card, and password patterns |
| Server header cloaking | Removes or replaces server/version headers to prevent fingerprinting |
| Secret hash enforcement | Webhook configurations use `secret_hash` instead of cleartext secrets |

### 2.4 Intelligence

| Feature | Description |
|---------|-------------|
| Payload entropy analysis | Detects obfuscated threats by measuring entropy of request payloads |
| Threat feed ingestion | Ingests external threat intelligence feeds for known-bad indicators |
| Behavioral fingerprinting | Analyzes request velocity and timing variance to identify automated patterns |

### 2.5 Observability

| Feature | Description |
|---------|-------------|
| Defense Posture Score | A–F grade based on overall security health |
| Attack surface mapping | Catalogs all exposed endpoints and their protection levels |
| Tamper-evident audit trail signer | Hash-chains audit entries to prevent log tampering |

## 3. Edge Function Security

### HMAC Verification

All inter-service communication uses HMAC-SHA256 signature verification:

```
signature = HMAC-SHA256(secret, timestamp + "." + body)
```

### Stripe Signature Verification

Checkout functions verify Stripe webhook signatures using the shared utility.

### Fallback Origin Mechanism

Public-facing checkout functions implement a fallback origin to ensure valid redirect URLs when the `Origin` header is absent:

```
origin = request.headers.get('origin') || FALLBACK_ORIGIN
```

### Edge Rate Limiting

| Table | Purpose |
|-------|---------|
| `edge_rate_limits` | Per-function, per-IP rate limit tracking |

## 4. RLS Policies (Critical Tables)

| Table | Policy |
|-------|--------|
| `cognitive_orders` | User-scoped: `auth.uid() = user_id` |
| `brain_events` | User-scoped: `auth.uid() = user_id` |
| `brain_embeddings` | Authenticated read, service_role write |
| `brain_classifier_models` | Authenticated read, service_role write |
| `brain_drift_log` | Authenticated read, service_role write |
| `brain_maintenance_log` | Authenticated read, service_role write |
| `ai_usage_log` | Authenticated read (dashboard reporting) |
| Control plane tables (10) | RLS-protected, tenant-scoped |

## 5. Honeypot Paths

The following 15 paths are decoys. Any access is logged and the IP is flagged:

```
/admin
/wp-admin
/wp-login.php
/.env
/config.php
/phpinfo.php
/api/v1/debug
/api/v1/internal
/.git/config
/server-status
/.htaccess
/backup.sql
/database.sql
/api/v1/admin/users
/api/v1/admin/config
```

## 6. IP Reputation Scoring

```
reputation_score = base_score
  - (honeypot_hits × 20)
  - (rate_limit_violations × 5)
  - (replay_attempts × 15)
  - (impossible_travel × 25)
  + (successful_requests × 0.1)
```

| Score | Classification | Action |
|-------|---------------|--------|
| 80–100 | Trusted | Normal access |
| 50–79 | Neutral | Standard monitoring |
| 20–49 | Suspicious | Enhanced monitoring, rate limits tightened |
| 0–19 | Hostile | Block or CAPTCHA challenge |

## 7. Black-Box Enforcement

High-value artifacts are protected by the 10-point enforcement interface (see doc 03). Security implications:

- No source code visibility for sealed items
- No prompt or memory leakage from cognitives
- No internal configuration exposure via API
- No cross-project data bleed
- Environment signature lock prevents unauthorized deployment

---

## Revision History

| Date | Author | Change |
|------|--------|--------|
| 2026-03-01 | System | Initial security internals documentation |

---

© 2025–2026 CMPSBL®. Confidential.
