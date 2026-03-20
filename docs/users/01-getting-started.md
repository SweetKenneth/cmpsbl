# 01 — Getting Started

---

## 1. Create an Account

Sign up at cmpsbl.ai. Free tier gives you immediate access to core modules.

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
    "module": "DECODE",
    "latency_ms": 245,
    "tokens_used": 42
  }
}
```

## 5. Available Modules

| Module | What It Does | Endpoint |
|--------|-------------|----------|
| DECODE | Understand natural language | `/api/v1/decode/process` |
| ENCODE | Generate code and content | `/api/v1/encode/generate` |
| NEXUS | Route to optimal AI provider | `/api/v1/nexus/route` |
| CORTEX | Multi-step orchestration | `/api/v1/cortex/pipeline` |
| MEMORY | Store and retrieve data | `/api/v1/memory/store` |
| VISION | Telemetry and analysis | `/api/v1/vision/analyze` |
| FORGE | Generate artifacts | `/api/v1/forge/generate` |
| LINGUA | Translation | `/api/v1/lingua/translate` |
| ORACLE | Predictions | `/api/v1/oracle/predict` |

## 6. Check Your Usage

```bash
curl -X POST https://api.cmpsbl.ai/api/v1/economy/usage \
  -H "Authorization: Bearer pf_live_xxx"
```

## 7. Next Steps

- Read the [API Reference](02-api-reference.md) for full endpoint documentation
- Explore [Modules Guide](03-modules-guide.md) to understand each module
- Set up [Webhooks](07-webhooks-events.md) for async notifications

---

© 2025–2026 PromptFluid®. All rights reserved.
