# 12: Nexus Deep Dive — The AI Routing Gateway

**How the Substrate Connects to Multiple AI Providers**

---

## What Is Nexus?

Nexus is the "switchboard" that connects the substrate to multiple AI providers. Instead of being locked into one AI service (like OpenAI only), Nexus can:

1. **Route requests** to the best provider for each task
2. **Fail over** if one provider is down
3. **Optimize costs** by choosing cheaper options when possible
4. **Cache responses** to avoid redundant API calls
5. **Monitor performance** of all providers

Think of it as a smart router that always finds the best path for your AI requests.

---

## Why Does This Matter?

### Problem: Provider Lock-in

If you build with OpenAI only:
- OpenAI raises prices → You pay more
- OpenAI has an outage → Your app breaks
- OpenAI deprecates a model → You rewrite code
- A better model appears elsewhere → You can't use it

### Solution: Provider Agnosticism

With Nexus:
- Any provider raises prices → Switch to another
- Any provider has an outage → Automatic failover
- Any model is deprecated → Route to replacement
- Better model appears → Add it to your options

**Plain English:** You're never trapped. You always have options.

---

## Supported Providers

### Free-Tier Providers (v5.0.0 Router)

The substrate's primary backbone uses 8 free-tier providers with ~16,000+ calls/day capacity:

| Provider | Daily Limit | RPM | Strengths | Role in Cascade |
|----------|-------------|-----|-----------|-----------------|
| **Cerebras** | 13,680 | 228 | Ultra-fast, high volume | Primary (handles bulk) |
| **Groq** | 1,000 | 30 | Fastest inference | Speed priority |
| **OpenRouter** | 1,000 | 20 | Model variety | Fallback |
| **Novita** | 500 | 60 | Good balance | Secondary |
| **SambaNova** | 240 | 10 | Enterprise-grade | Quality fallback |
| **Hyperbolic** | 120 | 10 | Specialized models | Tertiary |
| **DeepSeek** | 100 | 10 | Code generation | Code tasks |
| **Together AI** | 60 | 60 | Open models | Last resort |

**Total Free Capacity:** ~16,700 requests/day @ $0.00 cost

### Premium Providers (Bring Your Own Key)

| Provider | Strengths | Best For |
|----------|-----------|----------|
| **OpenAI** | Quality + ecosystem | Complex reasoning |
| **Google Gemini** | Multimodal, long context | Image + text tasks |
| **Anthropic Claude** | Safety + reasoning | Careful analysis |
| **Perplexity** | Web search integrated | Current information |

### Lovable AI Models (When Available)

When running in Lovable Cloud, additional premium models are available:

| Model | Capability | Best For |
|-------|------------|----------|
| **google/gemini-2.5-pro** | Top reasoning, multimodal | Heavy reasoning + visuals |
| **google/gemini-3-pro-preview** | Next-gen Gemini | Latest capabilities |
| **google/gemini-2.5-flash** | Balanced cost/quality | General tasks |
| **google/gemini-2.5-flash-lite** | Fastest, cheapest | Simple workloads |
| **openai/gpt-5** | Powerful all-rounder | Accuracy-critical tasks |
| **openai/gpt-5-mini** | Lower cost, strong reasoning | Balanced workloads |
| **openai/gpt-5-nano** | Speed + cost optimized | High-volume tasks |
| **openai/gpt-5.2** | Enhanced reasoning | Complex problem-solving |

---

## How Routing Works

### Request Flow

```
User Request: "Summarize this document"
      │
      ▼
┌─────────────────────────────────────────┐
│              NEXUS ROUTER                │
│                                         │
│  1. Classify task type                  │
│  2. Check cache                         │
│  3. Select best provider                │
│  4. Execute request                     │
│  5. Cache response                      │
│  6. Return result                       │
│                                         │
└─────────────────────────────────────────┘
      │
      ▼
   Response: "The document discusses..."
```

### Task Classification

Nexus automatically classifies each request:

| Task Type | Description | Preferred Providers |
|-----------|-------------|---------------------|
| **reasoning** | Complex analysis | OpenAI, Anthropic |
| **creation** | Content generation | OpenAI, Google |
| **code** | Programming tasks | DeepSeek, OpenAI |
| **research** | Information gathering | Perplexity |
| **chat** | Conversational | Groq (speed) |
| **summary** | Condensing content | Any (cost-optimize) |
| **translation** | Language conversion | Google |

### Provider Selection Logic

```
For each request:
1. What task type is this?
2. Which providers support it?
3. Which are currently healthy?
4. Which is fastest? Cheapest?
5. Is there a cached response?

Select the best option based on:
- User priority (speed vs cost vs quality)
- Current provider health
- Request characteristics
```

---

## Nexus Actions Explained

### `nexus.route` — Send to Best Provider

**What it does:** Automatically routes a request to the optimal provider.

**Example:**
```
nexus.route {
  prompt: "Explain quantum computing to a 10-year-old",
  systemPrompt: "You are a friendly science teacher",
  temperature: 0.7
}

Response:
{
  result: "Imagine you have a magic coin that can be...",
  provider: "groq",
  model: "llama-3-70b",
  latency_ms: 234,
  tokens: { input: 45, output: 312 },
  cost_cents: 0.02,
  cached: false
}
```

### `nexus.text` — Generate Text

**What it does:** Generates text with optional model preference.

**Example:**
```
nexus.text {
  prompt: "Write a haiku about programming",
  model: "gpt-4o"  // Optional: specific model
}

Response:
{
  text: "Code flows like water\nBugs surface, then disappear\nShip it, Friday night",
  provider: "openai",
  model: "gpt-4o",
  tokens: { input: 12, output: 24 }
}
```

### `nexus.image` — Generate Images

**What it does:** Creates images from text descriptions.

**Example:**
```
nexus.image {
  prompt: "A robot teaching a classroom of children",
  size: "1024x1024"
}

Response:
{
  image_url: "https://...",
  provider: "openai",
  model: "dall-e-3",
  cost_cents: 4.0
}
```

### `nexus.status` — Provider Health

**What it does:** Shows the health of all connected providers.

**Example:**
```
nexus.status

Provider Health Matrix
═══════════════════════════════════════════

Provider     │ Status  │ Latency │ Success │ Queue
─────────────┼─────────┼─────────┼─────────┼──────
Groq         │ HEALTHY │ 45ms    │ 99.8%   │ 0
Cerebras     │ HEALTHY │ 78ms    │ 99.5%   │ 12
OpenAI       │ HEALTHY │ 234ms   │ 99.9%   │ 3
Google       │ DEGRADED│ 890ms   │ 95.2%   │ 45
Anthropic    │ HEALTHY │ 312ms   │ 99.7%   │ 1
Together     │ HEALTHY │ 156ms   │ 98.9%   │ 0
DeepSeek     │ HEALTHY │ 123ms   │ 99.1%   │ 2
Perplexity   │ HEALTHY │ 445ms   │ 99.4%   │ 0

Active Fallback Chain:
Groq → Cerebras → OpenAI → Anthropic
```

### `nexus.providers` — Available Models

**What it does:** Lists all available models across providers.

**Example:**
```
nexus.providers

Available Models
═══════════════════════════════════════════

Text Generation:
├── groq/llama-3-70b (fastest, free tier)
├── groq/mixtral-8x7b (balanced)
├── openai/gpt-4o (highest quality)
├── openai/gpt-4o-mini (cost-effective)
├── anthropic/claude-3-opus (careful reasoning)
├── google/gemini-pro (multimodal)
└── deepseek/deepseek-coder (code-focused)

Image Generation:
├── openai/dall-e-3 (highest quality)
├── google/imagen (fast)
└── together/stable-diffusion-xl (open source)

Embeddings:
├── openai/text-embedding-3-large (best quality)
└── google/textembedding-gecko (balanced)
```

---

## The Fallback Cascade

When a provider fails, Nexus automatically tries the next one:

```
Request: "Generate a story"
      │
      ▼
┌──────────────┐
│    Groq      │ ← Try first (fastest)
└───────┬──────┘
        │ ✗ Failed (rate limit)
        ▼
┌──────────────┐
│   Cerebras   │ ← Try second
└───────┬──────┘
        │ ✓ Success!
        ▼
   [Return Response]
```

### Cascade Configuration

```
Default Cascade (Speed Priority):
1. Groq (0-50ms timeout)
2. Cerebras (50-200ms timeout)
3. OpenAI (200-500ms timeout)
4. Anthropic (500-1000ms timeout)

Quality Priority Cascade:
1. OpenAI (0-500ms timeout)
2. Anthropic (500-1000ms timeout)
3. Google (1000-2000ms timeout)

Cost Priority Cascade:
1. Together (free tier first)
2. Groq (free tier)
3. Cerebras (free tier)
4. DeepSeek (low cost)
```

---

## Response Caching

Nexus caches responses to avoid redundant API calls:

### How Caching Works

```
Request: "What is 2+2?"
      │
      ▼
┌──────────────────────────────────────────┐
│            CACHE CHECK                   │
│                                          │
│  Hash: sha256(prompt + params)           │
│  Found: YES                              │
│  Age: 2 hours (within TTL)               │
│                                          │
└──────────────────────────────────────────┘
      │
      ▼
   Return cached response (0 API cost, <5ms)
```

### Cache Settings

| Setting | Default | Description |
|---------|---------|-------------|
| **TTL** | 24 hours | How long to keep cached responses |
| **Max Size** | 10 GB | Maximum cache storage |
| **Eviction** | LRU | Least Recently Used removed first |

### What Gets Cached

✓ Identical prompts with identical parameters
✓ Semantic matches (similar meaning)
✗ Time-sensitive queries ("what time is it")
✗ Personalized responses (user-specific data)
✗ Random outputs (temperature > 0.5)

---

## Cost Optimization

Nexus helps minimize AI costs:

### Cost Comparison

| Provider | Model | Cost per 1M tokens |
|----------|-------|-------------------|
| Groq | Llama-3-70B | $0.00 (free tier) |
| Cerebras | Llama-3-70B | $0.00 (free tier) |
| Together | Mixtral-8x7B | $0.60 |
| OpenAI | GPT-4o-mini | $0.15 |
| OpenAI | GPT-4o | $5.00 |
| Anthropic | Claude-3-Opus | $15.00 |

### Optimization Strategies

**1. Free Tier First**
```
For non-critical tasks:
→ Route to free tier providers (Groq, Cerebras)
→ Only escalate if quality insufficient
```

**2. Model Matching**
```
Simple task (classification): Use smallest model
Complex task (analysis): Use larger model
→ Don't overpay for simple tasks
```

**3. Caching**
```
Repeated queries: Serve from cache
→ 0 cost for identical requests
```

**4. Batching**
```
Multiple small requests: Combine into one
→ Fewer API calls = lower cost
```

---

## Rate Limit Management

Nexus manages rate limits across all providers:

### How It Works

```
Provider Rate Limits:
├── Groq: 1,000 req/day, 30 req/min
├── Cerebras: 960 req/day, 32 req/min
├── OpenAI: No daily limit, 500 req/min
└── Together: No daily limit, 100 req/min

Current Usage (past 24h):
├── Groq: 756/1,000 (75.6%)
├── Cerebras: 423/960 (44.1%)
├── OpenAI: 1,234 requests
└── Together: 567 requests

Nexus Strategy:
→ Spread load across providers
→ Never hit limits on any single provider
→ Escalate to paid tiers if needed
```

---

## Nexus Health & Status

```
substrate:// nexus.status

Nexus Module Status
═══════════════════════════════════════════

Health Score: 97%

Provider Summary:
├── Total providers: 8
├── Healthy: 7
├── Degraded: 1 (Google - high latency)
└── Down: 0

Routing Statistics (24h):
├── Total requests: 12,456
├── Cached responses: 3,234 (26%)
├── Fallback triggers: 45 (0.4%)
├── Average latency: 187ms
└── Total cost: $12.34

Model Usage:
├── groq/llama-3-70b: 5,234 requests
├── cerebras/llama-3-70b: 3,456 requests
├── openai/gpt-4o-mini: 2,345 requests
└── openai/gpt-4o: 234 requests

Cost Savings:
├── Cache hits saved: $45.67
├── Free tier usage saved: $234.56
└── Total savings: $280.23
```

---

## Common Questions

### "How do I prioritize a specific provider?"

Set priority in your request:
```
nexus.route {
  prompt: "...",
  priority: "openai"  // Try OpenAI first
}
```

### "Can I use my own API keys?"

Yes, BYOK (Bring Your Own Key) is supported:
```
nexus.config {
  openai_api_key: "sk-...",
  anthropic_api_key: "..."
}
```

### "What if all providers are down?"

Nexus will return an error with:
- Which providers were tried
- Why each failed
- Estimated recovery time

### "How do I see cost breakdown?"

```
nexus.route_stats

Cost Breakdown (7 days):
├── Groq: $0.00 (free tier)
├── Cerebras: $0.00 (free tier)
├── OpenAI: $67.89
├── Anthropic: $23.45
├── Google: $12.34
└── Total: $103.68
```

---

## Next Document

→ [13-VISION-DEEP-DIVE.md](./13-VISION-DEEP-DIVE.md) — How the observability system monitors everything
