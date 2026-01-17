# promptfluid® Substrate — Security Model

**v2026.01 — Security Architecture and Best Practices**

---

## Security Overview

The substrate implements defense-in-depth security across multiple layers:

1. **API Security** — Authentication, rate limiting, input validation
2. **Data Security** — Encryption, RLS policies, access control
3. **Runtime Security** — Sandboxed execution, secret management
4. **Operational Security** — Audit logging, anomaly detection, threat analysis

---

## Authentication

### JWT-Based Authentication

All authenticated endpoints require a valid JWT token:

```
Authorization: Bearer <jwt-token>
```

The substrate validates:
- Token signature (using Supabase JWT secret)
- Token expiration
- User claims and permissions

### Public vs Authenticated Endpoints

| Endpoint | Auth Required | Notes |
|----------|---------------|-------|
| `*/status` | No | Health checks always public |
| `vision/health` | No | System health monitoring |
| `vision/pulse` | No | Lightweight heartbeat |
| `dream/feed` | No | Rate-limited public submission |
| All other actions | Yes | Require valid JWT |

---

## Authorization

### Permission Model

The substrate uses role-based access control:

| Role | Permissions |
|------|-------------|
| **Anonymous** | Public endpoints only |
| **User** | Read + write own data, standard actions |
| **Admin** | Full access, system configuration |

### Row-Level Security (RLS)

All database tables implement RLS policies:

```sql
-- Example: Users can only access their own memories
CREATE POLICY "Users can view own memories"
ON brain_memories
FOR SELECT
USING (auth.uid() = user_id);
```

---

## Rate Limiting

### Limit Configuration

| Scope | Limit | Window |
|-------|-------|--------|
| IP (general) | 100 requests | 5 minutes |
| IP (chat) | 20 requests | 5 minutes |
| IP (dream feed) | 15 requests | 5 minutes |
| Authenticated user | 500 requests | 5 minutes |
| Daily per account | 5,000 requests | 24 hours |

### Rate Limit Response

```json
{
  "success": false,
  "error": "Rate limit exceeded",
  "code": "RATE_LIMIT_EXCEEDED",
  "retry_after": 300
}
```

### Monitoring Rate Limits

```typescript
import { defense } from '@/lib/substrate';

const limits = await defense.limits();
console.log(limits.data.current_usage);
console.log(limits.data.limits);
```

---

## Input Validation

### Request Validation

All requests are validated for:
- Required fields (`module`, `action`)
- Valid module names
- Valid action names for module
- Payload type correctness
- Field length limits
- Content sanitization

### Payload Sanitization

User-provided content is sanitized:
- HTML entities escaped
- Script tags removed
- SQL injection patterns blocked
- XSS vectors neutralized

### Dream Content Validation

Dream submissions undergo additional validation:
- Content length limits (50-5000 chars)
- Profanity/abuse filtering
- PII detection and redaction
- Spam/bot detection

---

## Bot Detection

### Defense Module

The `defense` module provides comprehensive bot detection:

```typescript
const analysis = await defense.analyze({
  fingerprint: browserFingerprint,
  userAgent: navigator.userAgent,
  ip: clientIP
});

if (analysis.data.is_bot) {
  // Block or challenge
}
```

### Detection Signals

| Signal | Weight | Description |
|--------|--------|-------------|
| Canvas fingerprint | High | Browser rendering consistency |
| WebGL fingerprint | High | Graphics capabilities |
| User agent analysis | Medium | Browser/device patterns |
| Behavioral patterns | High | Mouse/keyboard timing |
| IP reputation | Medium | Historical IP behavior |
| Request patterns | High | Rate/timing anomalies |

### Risk Scoring

Requests receive a risk score (0-100):
- **0-20**: Low risk, allow
- **21-50**: Medium risk, monitor
- **51-80**: High risk, challenge
- **81-100**: Very high risk, block

---

## IP Reputation

### Reputation System

Every IP is scored based on historical behavior:

```typescript
const reputation = await defense.reputation('192.168.1.1');
// Returns: { score: 85, classification: 'trusted', ... }
```

### Score Factors

| Factor | Impact |
|--------|--------|
| Successful requests | +1 per 10 requests |
| Failed auth attempts | -5 each |
| Rate limit violations | -10 each |
| Bot detection triggers | -15 each |
| Blocked requests | -20 each |
| Time since last issue | +1 per day (max +30) |

### Classifications

| Score | Classification |
|-------|----------------|
| 80-100 | Trusted |
| 60-79 | Normal |
| 40-59 | Suspicious |
| 20-39 | Risky |
| 0-19 | Blocked |

---

## Anomaly Detection

### Statistical Analysis

The substrate monitors for statistical anomalies:

```typescript
const anomalies = await defense.anomalyProbe(24);
```

### Detected Patterns

- Request rate spikes
- Unusual geographic patterns
- API usage pattern changes
- Error rate increases
- Authentication failures
- Resource consumption spikes

---

## Secret Management

### Secret Storage

All secrets are stored in Supabase encrypted secrets:

```bash
supabase secrets set API_KEY=value
```

### Secret Access

Edge functions access secrets via environment variables:

```typescript
const apiKey = Deno.env.get('API_KEY');
```

### Secret Rotation

Recommended rotation schedule:
- API keys: Every 90 days
- JWT secrets: Every 180 days
- Database passwords: Every 90 days

---

## Audit Logging

### Logged Events

| Event Type | Data Captured |
|------------|---------------|
| Authentication | User, timestamp, success/failure, IP |
| Authorization | User, resource, action, allowed/denied |
| Data access | User, table, operation, record IDs |
| Configuration | User, setting, old/new value |
| Security events | Type, severity, details, remediation |

### Querying Audit Logs

```typescript
import { system } from '@/lib/substrate';

const logs = await system.audit({
  since: '2026-01-10',
  action_type: 'security',
  limit: 100
});
```

### Log Retention

- Security logs: 365 days
- Access logs: 90 days
- Operational logs: 30 days

---

## Data Protection

### Encryption

| Layer | Encryption |
|-------|------------|
| In transit | TLS 1.3 |
| At rest | AES-256 |
| Backups | AES-256 |
| Secrets | AES-256 + HSM |

### Data Classification

| Classification | Examples | Protection |
|----------------|----------|------------|
| Public | Health status, version | None required |
| Internal | Metrics, logs | Auth required |
| Confidential | Memories, conversations | Auth + RLS |
| Restricted | Secrets, credentials | Encrypted + limited access |

---

## Security Posture Assessment

### Posture Check

```typescript
const posture = await defense.posture();
```

Returns:
```json
{
  "overall_risk": "low",
  "active_threats": 0,
  "blocked_ips": 12,
  "anomalies_24h": 0,
  "recommendations": []
}
```

---

## Incident Response

### Automated Response

The substrate can automatically:
- Block high-risk IPs
- Rate limit suspicious users
- Alert administrators
- Trigger emergency shutdown

### Emergency Shutdown

```typescript
// Admin only
await system.shutdown({ confirm: true, reason: 'security_incident' });
```

### Self-Healing

```typescript
// Attempt automated remediation
await system.heal({ target: 'defense', force: true });
```

---

## Security Best Practices

### For Developers

1. **Always validate user input** — Never trust client data
2. **Use parameterized queries** — Prevent SQL injection
3. **Implement proper error handling** — Don't leak internal details
4. **Log security events** — Maintain audit trail
5. **Rotate secrets regularly** — Limit exposure window

### For Operators

1. **Monitor security dashboards** — Watch for anomalies
2. **Review audit logs** — Identify patterns
3. **Keep systems updated** — Apply security patches
4. **Test disaster recovery** — Verify backup/restore
5. **Conduct security reviews** — Regular assessments

### For Users

1. **Use strong passwords** — 12+ characters, mixed case
2. **Enable 2FA** — When available
3. **Report suspicious activity** — Alert administrators
4. **Don't share credentials** — One account per person
5. **Log out when done** — Especially on shared devices

---

## Compliance

### Data Handling

The substrate is designed to support compliance with:
- GDPR (data protection, right to erasure)
- CCPA (California privacy rights)
- SOC 2 (security controls)
- HIPAA (with proper configuration)

### Data Retention

Configure data retention via settings:

```typescript
await system.config({
  key: 'data_retention_days',
  value: 90
});
```

### Data Export

Users can export their data:

```typescript
await system.backup({
  include_data: true,
  user_id: 'user-uuid',
  format: 'json'
});
```

### Data Deletion

Users can request data deletion:

```typescript
await brain.forget({
  user_id: 'user-uuid',
  permanent: true
});
```

---

## Security Contact

Report security vulnerabilities to:

| Channel | Contact |
|---------|---------|
| Email | security@promptfluid.com |
| Response SLA | 24 hours |

---

**promptfluid® — The Cognitive Substrate OS**  
**Copyright © 2025-2026 promptfluid. All rights reserved.**
