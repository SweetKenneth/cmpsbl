# 08. AI Router (NEXUS Module)

**CMPSBL OS Substrate — Internal Engineering Library**

---

## The Routing Secret

NEXUS is why the substrate has **99.9% AI uptime**. It doesn't rely on any single AI provider—it maintains a fallback chain of 7+ providers and routes intelligently.

---

## Provider Chain

```
PRIMARY CHAIN (in order of preference):
──────────────────────────────────────
1. Groq (llama-3.3-70b) ......... Fastest, primary choice
2. Cerebras ..................... Fast fallback
3. Together AI .................. Cost-effective fallback
4. DeepSeek ..................... Specialized tasks
5. OpenAI (GPT-4) ............... High-quality fallback
6. Anthropic (Claude) ........... Complex reasoning
7. Google (Gemini) .............. Final fallback
8. Local (if configured) ........ Offline fallback
```

---

## Routing Logic

### Primary Selection

```
For each request:
1. Check task type (reasoning, coding, creative, etc.)
2. Check payload size (some providers have limits)
3. Check current provider health scores
4. Check cost budget (if specified)
5. Select best available provider

Selection Formula:
score = (speed × 0.3) + (quality × 0.3) + (cost × 0.2) + (health × 0.2)
```

### Fallback Logic

```
If primary fails:
1. Log failure, update health score
2. Move to next provider in chain
3. Retry same request
4. If all fail: return graceful error

Failure Definition:
- HTTP 5xx errors
- Timeout (>30 seconds)
- Rate limit hit
- Invalid response format
```

---

## Health Scoring

Each provider maintains a health score:

```
health = 100 - (recent_failures × 20)

Updated on:
- Success: +5 (max 100)
- Failure: -20 (min 0)
- Timeout: -10

Recovery:
- Gradual +1 every 5 minutes if no activity
- Health < 30: provider temporarily removed from chain
- Health = 0: manual intervention required
```

---

## Cost Optimization

### Token Pricing (per 1M tokens)

| Provider | Input | Output | Notes |
|----------|-------|--------|-------|
| Groq | $0.05 | $0.10 | Best value for speed |
| Cerebras | $0.10 | $0.20 | Good balance |
| Together | $0.20 | $0.40 | Reliable fallback |
| DeepSeek | $0.14 | $0.28 | Good for code |
| OpenAI | $10.00 | $30.00 | Premium quality |
| Anthropic | $8.00 | $24.00 | Best reasoning |
| Gemini | $1.25 | $5.00 | Good multimodal |

### Budget Routing

```
If cost_budget specified:
1. Calculate estimated cost for each provider
2. Filter to providers within budget
3. Route to fastest within budget
4. If none in budget: return error with cost estimate
```

---

## Model Selection

### By Task Type

| Task | Preferred Model | Fallback |
|------|-----------------|----------|
| Fast chat | llama-3.3-70b (Groq) | llama (Cerebras) |
| Complex reasoning | Claude Opus | GPT-4 |
| Code generation | DeepSeek Coder | GPT-4 |
| Creative writing | Claude | GPT-4 |
| Data extraction | Gemini | GPT-4 |
| Embeddings | OpenAI ada-002 | Gemini |

### Context Window Management

```
If input exceeds model's context:
1. Try larger context model (GPT-4 128k, Claude 200k)
2. If still too large: chunk and process sequentially
3. Merge results with summary pass
```

---

## Caching Layer

**The speed secret:** Many requests are cached.

```
Cache Strategy:
─────────────
1. Hash the prompt (SHA-256)
2. Check cache for matching hash
3. If found and <24 hours old: return cached
4. If not found: call provider, cache result

Cache Exclusions:
- Requests with `no_cache: true`
- Requests with random/creative temperature >0.8
- Requests with user-specific context
- Streaming requests
```

---

## Streaming Support

For long-form generation:

```
Streaming Flow:
1. Open SSE connection to client
2. Call provider with stream: true
3. Forward chunks as received
4. Track token count in real-time
5. Close connection on completion

Streaming Fallback:
If provider doesn't support streaming:
→ Generate full response
→ Chunk artificially (100 tokens at a time)
→ Send with delays (simulated streaming)
```

---

## Rate Limit Coordination

```
Per-Provider Limits:
───────────────────
Groq: 30 req/min, 100k tokens/min
Cerebras: 60 req/min
Together: 60 req/min
OpenAI: Based on tier (10-10000 req/min)
Anthropic: Based on tier

Global Coordination:
When approaching any provider's limit:
→ Pre-emptively route to next provider
→ Prevents hitting hard limits
```

---

## v8.5.0 Infrastructure Integration

### Streaming Pipeline
- **Location:** `src/lib/substrate/streaming-pipeline/`
- **Purpose:** SSE-based partial response streaming for DECODE/NEXUS
- **Functions:** `createStream()`, `pipeStream()`, `closeStream()`
- **Tier:** Builder

### Persistent Rate Limiting (Provider-Level)
- Cross-tab synchronization for per-provider rate limits
- Prevents multi-tab users from exhausting provider quotas
- **Tier:** Builder

### NL Terminal Interface
- Natural language → structured NEXUS routing commands
- "Route this to the fastest provider" → `nexus.route --strategy=speed`
- **Tier:** Builder

---

*CMPSBL OS Substrate v8.5.0 — SYNERGY+ Epoch — Internal Engineering Library*
*© 2025-2026 PromptFluid®. All rights reserved.*
