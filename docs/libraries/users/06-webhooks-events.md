# Webhooks & Events

---

> **CMPSBL®** — Governed Cognitive Infrastructure · PromptFluid™
> U.S. Patent App. No. 64/029,678 · 64/031,637


## Available Events

| Event | Trigger |
|-------|---------|
| `memory.crystallized` | Memory Stream crystallization complete |
| `discovery.found` | New memory chain discovery detected |
| `quota.warning` | Quota at 80% utilization |
| `quota.exceeded` | Quota exhausted |
| `security.incident` | DEFENSE Layer detected threat |
| `evolution.promoted` | EVOLUTION Layer promoted a change to production |
| `agent.task_complete` | Cognitive agent completed a task |
| `chain.fired` | A memory chain was triggered |

## Payload Format

```json
{
  "event": "memory.crystallized",
  "timestamp": "2026-03-20T12:00:00Z",
  "data": {
    "memory_id": "uuid",
    "pattern": "API usage optimization",
    "status": "crystallized"
  },
  "signature": "hmac-sha256-signature"
}
```

## Signature Verification

Webhooks are signed with HMAC-SHA256. Always verify before processing:

```javascript
const crypto = require('crypto');

function verifyWebhook(payload, signature, secret) {
  const expected = crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(payload))
    .digest('hex');
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expected)
  );
}
```

## Best Practices

- Always verify signatures before processing
- Respond with 200 within 5 seconds (process async)
- Implement idempotency — webhooks may be retried
- Log webhook payloads for debugging
- Use the `request_id` field for correlation with API calls

---

**CMPSBL®** · Governed Cognitive Infrastructure
Protected under U.S. Patent App. No. 64/029,678 (Ascension™ Discovery) & 64/031,637 (Mana™ Silent Symbiosis)
© 2025–2026 CMPSBL® · PromptFluid™ · All rights reserved.
