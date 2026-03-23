# Getting Started

---

## 1. Create an Account

Sign up at cmpsbl.ai. Free tier gives you immediate access to core primitives.

## 2. Get Your API Key

After signup, generate an API key from your dashboard. Keys are prefixed:
- `pf_live_` — Production access
- `pf_test_` — Development/staging access

## 3. Authenticate

Include your key in every request:

```
Authorization: Bearer pf_live_xxxxxxxxxxxxx
```

## 4. Your First API Call

```bash
curl -X POST https://api.cmpsbl.ai/api/v1/decode/process \
  -H "Authorization: Bearer pf_live_xxx" \
  -H "Content-Type: application/json" \
  -d '{"action": "process", "payload": {"input": "Hello, CMPSBL"}}'
```

### Response

```json
{
  "success": true,
  "data": { "output": "..." },
  "metadata": {
    "request_id": "uuid",
    "primitive": "DECODE",
    "latency_ms": 245,
    "tokens_used": 42
  }
}
```

## 5. Available Primitives (API)

| Primitive | What It Does | Endpoint |
|-----------|-------------|----------|
| DECODE Agent | Understand natural language | `/api/v1/decode/process` |
| ENCODE Agent | Generate code and content | `/api/v1/encode/generate` |
| NEXUS Engine | Route to optimal AI provider | `/api/v1/nexus/route` |
| CORTEX Engine | Multi-step orchestration | `/api/v1/cortex/pipeline` |
| MEMORY Organ | Store and retrieve data | `/api/v1/memory/store` |
| VISION Agent | Telemetry and analysis | `/api/v1/vision/analyze` |
| FORGE Engine | Generate artifacts | `/api/v1/forge/generate` |
| LINGUA Agent | Translation | `/api/v1/lingua/translate` |
| ORACLE Engine | Predictions | `/api/v1/oracle/predict` |

## 6. Check Your Usage

```bash
curl -X POST https://api.cmpsbl.ai/api/v1/economy/usage \
  -H "Authorization: Bearer pf_live_xxx"
```

## 7. Next Steps

- Read the [API Reference](02-api-reference.md) for full endpoint documentation
- Explore the [Primitives Guide](03-primitives-guide.md) to understand each primitive
- Set up [Webhooks](06-webhooks-events.md) for async notifications
- Install the [CLI & SDK](07-cli-and-sdk.md) for local development

---

© 2025–2026 CMPSBL®. All rights reserved.
