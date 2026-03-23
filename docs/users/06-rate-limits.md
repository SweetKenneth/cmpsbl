# 06 — Rate Limits & Quotas

---

## Tier Limits

| Resource | Free | Pro | Enterprise |
|----------|------|-----|-----------|
| Requests/minute | 10 | 60 | 300 |
| Requests/day | 100 | 5,000 | 50,000 |
| Tokens/day | 10,000 | 500,000 | 5,000,000 |
| Burst allowance | 2x for 10s | 3x for 30s | 5x for 60s |

## Rate Limit Headers

Every response includes:
```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1709312400
```

## What Happens at Limits

| Limit | Response | What to Do |
|-------|----------|-----------|
| Rate limit hit | HTTP 429 + `retry-after` header | Wait and retry |
| Token quota exhausted | Request rejected with quota status | Wait for reset or upgrade |
| Storage full | Write rejected | Archive data or upgrade |
| Feature locked | HTTP 403 with tier info | Upgrade plan |

## Best Practices

1. **Check headers** — monitor `X-RateLimit-Remaining` to avoid hitting limits
2. **Implement backoff** — exponential backoff on 429 responses
3. **Cache responses** — reduce duplicate calls for identical queries
4. **Batch requests** — use CORTEX memory chains to combine multiple operations
5. **Monitor usage** — check `/api/v1/economy/usage` regularly

## Grace Period

All tiers get a **10% buffer** for burst usage. This does not roll over. Crown Jewel capabilities and admin functions have no grace period.

---

© 2025–2026 CMPSBL®. All rights reserved.
