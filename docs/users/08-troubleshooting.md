# 08 — Troubleshooting

---

## Common Errors

| Error | Cause | Fix |
|-------|-------|-----|
| `UNAUTHORIZED` (401) | Invalid or missing API key | Check key prefix (`pf_live_` vs `pf_test_`) |
| `FORBIDDEN` (403) | Key lacks scope for this module | Generate a new key with the right scopes |
| `RATE_LIMITED` (429) | Too many requests | Wait for `retry-after`, implement backoff |
| `SERVICE_UNAVAILABLE` (503) | Module circuit breaker open | Wait — auto-recovery runs every 30s |
| `PROVIDER_ERROR` (502) | AI provider is down | NEXUS auto-failover should handle; retry |
| `TIMEOUT` (504) | Request took too long | Reduce payload size or increase `timeout_ms` |

## Debugging Steps

1. **Check the response** — error code and message tell you what happened
2. **Check rate limits** — look at `X-RateLimit-Remaining` header
3. **Check your plan** — some modules require Pro or Enterprise
4. **Check provider health** — 502 errors may be temporary
5. **Check `request_id`** — include it when contacting support

## Module-Specific Issues

### DECODE returns unexpected results
- Check input encoding (UTF-8 required)
- Verify payload structure matches the expected format
- Try with a simpler input to isolate the issue

### MEMORY returns empty
- Verify the key exists: use `retrieve` before assuming data is missing
- Check your plan — Free tier is session-only
- Data may have been demoted to a colder tier

### CORTEX pipeline fails mid-execution
- Check each step independently
- Verify all referenced modules are within your plan's access
- Check for timeout — complex memory chains may need higher `timeout_ms`

## Getting Help

- **Free**: Community forums
- **Pro**: Email support (24h response)
- **Enterprise**: Dedicated support channel (4h response)

Always include your `request_id` when reporting issues.

---

© 2025–2026 CMPSBL®. All rights reserved.
