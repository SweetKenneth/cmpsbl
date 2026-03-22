# 07 — Webhooks & Events

---

## Available Events

| Event | Trigger |
|-------|---------|
| `memory.crystallized` | Memory stream crystallization complete |
| `discovery.found` | New pipeline discovery detected |
| `quota.warning` | Quota at 80% utilization |
| `quota.exceeded` | Quota exhausted |
| `security.incident` | DEFENSE detected threat |

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

---

© 2025–2026 PromptFluid®. All rights reserved.
