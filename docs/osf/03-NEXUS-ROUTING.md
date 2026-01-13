# PromptFluid Nexus: AI Gateway & Routing Layer

## Document Metadata

| Field | Value |
|-------|-------|
| Document ID | PF-NEXUS-001 |
| Version | 1.0.0 |
| Last Updated | 2026-01-13 |
| Status | STABLE |
| Citation | Sese, K. (2026). PromptFluid Nexus Routing. doi:10.5281/zenodo.XXXXXXX |

---

## 1. Introduction

Nexus is the AI gateway layer that abstracts multiple AI providers behind a unified interface. It provides intelligent routing, automatic fallback, response caching, and cost optimization for all AI operations within the PromptFluid ecosystem.

### 1.1 Design Goals

1. **Provider Agnosticism:** Applications don't know or care which provider handles their request
2. **Cost Optimization:** Automatic selection of cheapest provider meeting quality requirements
3. **Reliability:** Cascade fallback ensures high availability
4. **Performance:** Redis caching eliminates duplicate API calls
5. **Observability:** Complete cost and latency tracking

### 1.2 Supported Providers

| Provider | Models | Strengths | Use Cases |
|----------|--------|-----------|-----------|
| Groq | Llama 3.3 70B | Speed, cost | Primary reasoning |
| OpenAI | GPT-4o, GPT-4o-mini | Versatility | General synthesis |
| Anthropic | Claude 3.5 Sonnet/Haiku | Ethics, safety | Sensitive content |
| Perplexity | Sonar | Real-time web | Research, grounding |
| Lovable AI | Gemini 2.5 Flash | Vision, images | Image generation |
| Luma AI | Dream Machine | Video | Video synthesis |

---

## 2. Architecture

### 2.1 Request Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           NEXUS GATEWAY                                  │
│                                                                          │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────────────┐  │
│  │ Request  │ -> │  Cache   │ -> │  Route   │ -> │ Provider Select  │  │
│  │ Ingest   │    │  Check   │    │ Decision │    │ + Fallback       │  │
│  └──────────┘    └──────────┘    └──────────┘    └──────────────────┘  │
│       │               │               │                   │             │
│       │          ┌────┴────┐    ┌────┴────┐         ┌────┴────┐       │
│       │          │  HIT?   │    │  Task   │         │ Primary │       │
│       │          │ Return  │    │  Type   │         │ Groq    │       │
│       │          └─────────┘    │ Analysis│         ├─────────┤       │
│       │                         └─────────┘         │Secondary│       │
│       │                                             │ OpenAI  │       │
│       │                                             ├─────────┤       │
│       │                                             │Tertiary │       │
│       │                                             │Anthropic│       │
│       ▼                                             └─────────┘       │
│  ┌──────────────────────────────────────────────────────────────────┐ │
│  │                    RESPONSE PIPELINE                              │ │
│  │  Provider Response → Validation → Cache Store → Cost Log → Return │ │
│  └──────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
```

### 2.2 Routing Decision Tree

```
Request Received
      │
      ▼
┌─────────────────┐
│ Check Cache     │──── HIT ────> Return Cached Response
└────────┬────────┘
         │ MISS
         ▼
┌─────────────────┐
│ Analyze Task    │
│ Type            │
└────────┬────────┘
         │
    ┌────┴────┬────────────┬───────────────┐
    ▼         ▼            ▼               ▼
┌───────┐ ┌───────┐  ┌──────────┐  ┌────────────┐
│Reason │ │Create │  │ Research │  │ Sensitive  │
│       │ │       │  │          │  │            │
│ Groq  │ │OpenAI │  │Perplexity│  │ Anthropic  │
└───┬───┘ └───┬───┘  └────┬─────┘  └──────┬─────┘
    │         │           │               │
    └─────────┴───────────┴───────────────┘
                    │
                    ▼
            Primary Provider
                    │
               ┌────┴────┐
               │ Failed? │
               └────┬────┘
                    │ YES
                    ▼
            Secondary Provider
                    │
               ┌────┴────┐
               │ Failed? │
               └────┬────┘
                    │ YES
                    ▼
            Tertiary Provider
```

---

## 3. Task Classification

### 3.1 Task Types

Nexus automatically classifies requests based on content analysis:

| Task Type | Keywords | Primary Provider | Fallback Chain |
|-----------|----------|------------------|----------------|
| `reasoning` | analyze, explain, compare, evaluate | Groq | OpenAI → Anthropic |
| `creation` | write, generate, create, compose | OpenAI | Anthropic → Groq |
| `research` | search, find, current, recent | Perplexity | OpenAI → Groq |
| `sensitive` | ethics, policy, safety, legal | Anthropic | OpenAI |
| `code` | code, function, implement, debug | Groq | OpenAI |
| `general` | (default) | Groq | OpenAI → Anthropic |

### 3.2 Classification Algorithm

```typescript
function classifyTask(prompt: string): TaskType {
  const lowerPrompt = prompt.toLowerCase();
  
  const patterns: Record<TaskType, string[]> = {
    reasoning: ['analyze', 'explain', 'compare', 'evaluate', 'why', 'how'],
    creation: ['write', 'generate', 'create', 'compose', 'draft'],
    research: ['search', 'find', 'current', 'recent', 'news', 'latest'],
    sensitive: ['ethics', 'policy', 'safety', 'legal', 'medical', 'financial'],
    code: ['code', 'function', 'implement', 'debug', 'program', 'script']
  };
  
  for (const [type, keywords] of Object.entries(patterns)) {
    if (keywords.some(kw => lowerPrompt.includes(kw))) {
      return type as TaskType;
    }
  }
  
  return 'general';
}
```

---

## 4. Fallback Cascade

### 4.1 Fallback Hierarchy

```
Level 1: Groq (Llama 3.3 70B)
    │
    ├── Timeout: 30s
    ├── Retry: 1
    └── On Failure ▼

Level 2: OpenAI (GPT-4o-mini)
    │
    ├── Timeout: 45s
    ├── Retry: 1
    └── On Failure ▼

Level 3: Anthropic (Claude 3.5 Haiku)
    │
    ├── Timeout: 60s
    ├── Retry: 1
    └── On Failure ▼

Level 4: Perplexity (Sonar)
    │
    ├── Timeout: 60s
    ├── Retry: 0
    └── On Failure → Return Error
```

### 4.2 Failure Conditions

A provider "fails" when:
- HTTP error (4xx, 5xx)
- Timeout exceeded
- Rate limit reached (429)
- Invalid response format
- Content policy violation

### 4.3 Retry Logic

```typescript
async function invokeWithFallback(
  prompt: string,
  providers: Provider[],
  attempt: number = 0
): Promise<AIResponse> {
  if (attempt >= providers.length) {
    throw new Error('All providers exhausted');
  }
  
  const provider = providers[attempt];
  
  try {
    const response = await invokeProvider(provider, prompt, {
      timeout: provider.timeout,
      retries: provider.retries
    });
    
    // Log success
    await logProviderUsage(provider, response, 'success');
    
    return response;
    
  } catch (error) {
    // Log failure
    await logProviderUsage(provider, null, 'failure', error);
    
    // Try next provider
    return invokeWithFallback(prompt, providers, attempt + 1);
  }
}
```

---

## 5. Response Caching

### 5.1 Cache Strategy

Nexus uses Redis for response caching with content-addressed storage:

```typescript
function generateCacheKey(request: AIRequest): string {
  const normalized = {
    prompt: request.prompt.toLowerCase().trim(),
    model: request.model,
    temperature: request.temperature || 0.7,
    maxTokens: request.maxTokens || 1000
  };
  
  return crypto
    .createHash('sha256')
    .update(JSON.stringify(normalized))
    .digest('hex');
}
```

### 5.2 Cache Configuration

| Setting | Value | Rationale |
|---------|-------|-----------|
| TTL | 90 days | Balance freshness with cost savings |
| Max Size | 10GB | Sufficient for typical workloads |
| Eviction | LRU | Least recently used evicted first |
| Compression | Enabled | 40-60% storage reduction |

### 5.3 Cache Invalidation

Cache is invalidated when:
- TTL expires
- Manual invalidation via admin API
- Model version changes
- Content flagged as stale by Brain

---

## 6. Cost Optimization

### 6.1 Provider Cost Comparison

| Provider | Model | Cost per 1M Input Tokens | Cost per 1M Output Tokens |
|----------|-------|--------------------------|---------------------------|
| Groq | Llama 3.3 70B | $0.59 | $0.79 |
| OpenAI | GPT-4o-mini | $0.15 | $0.60 |
| OpenAI | GPT-4o | $2.50 | $10.00 |
| Anthropic | Claude 3.5 Haiku | $0.25 | $1.25 |
| Anthropic | Claude 3.5 Sonnet | $3.00 | $15.00 |
| Perplexity | Sonar | $1.00 | $1.00 |

### 6.2 Cost Tracking Schema

```sql
CREATE TABLE ai_usage_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider TEXT NOT NULL,
  model TEXT,
  tokens_used INTEGER,
  cost DECIMAL(10, 6),
  response_time_ms INTEGER,
  success BOOLEAN,
  category TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### 6.3 Budget Controls

```sql
CREATE TABLE ai_daily_quota (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider TEXT NOT NULL,
  date DATE DEFAULT CURRENT_DATE,
  calls_used INTEGER DEFAULT 0,
  calls_budget INTEGER DEFAULT 1000,
  tokens_used INTEGER DEFAULT 0,
  category TEXT,
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

Daily quotas prevent runaway costs:
- Hard limit: Request rejected when quota exceeded
- Soft limit: Warning logged, fallback to cheaper provider
- Reset: Quotas reset at midnight UTC

---

## 7. Multi-Modal Support

### 7.1 Text Generation

Standard text generation through `pf-nexus-text`:

```typescript
const response = await supabase.functions.invoke('pf-nexus-text', {
  body: {
    prompt: 'Explain quantum computing',
    task_type: 'reasoning',
    max_tokens: 500,
    temperature: 0.7
  }
});
```

### 7.2 Image Generation

Image generation through `pf-nexus-image`:

```typescript
const response = await supabase.functions.invoke('pf-nexus-image', {
  body: {
    prompt: 'A futuristic city at sunset',
    width: 1024,
    height: 1024,
    style: 'photorealistic'
  }
});
```

Providers:
- **Lovable AI (Gemini Flash):** Default for most images
- **Stability AI (SDXL):** High-quality artistic images
- **DALL-E 3:** When OpenAI-specific style needed

### 7.3 Video Generation

Video generation through `pf-nexus-video`:

```typescript
const response = await supabase.functions.invoke('pf-nexus-video', {
  body: {
    prompt: 'A rocket launching into space',
    duration: 5,
    aspect_ratio: '16:9'
  }
});
```

Providers:
- **Luma AI (Dream Machine):** Primary video generation
- **Runway ML:** Alternative for specific styles

---

## 8. Edge Function Implementation

### 8.1 Core Gateway Function

```typescript
// supabase/functions/pf-nexus-router/index.ts

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const PROVIDER_HIERARCHY = ['groq', 'openai', 'anthropic', 'perplexity'];

serve(async (req) => {
  const { prompt, task_type, options } = await req.json();
  
  // Check cache first
  const cacheKey = generateCacheKey({ prompt, ...options });
  const cached = await checkCache(cacheKey);
  if (cached) {
    return new Response(JSON.stringify(cached), {
      headers: { 'X-Cache': 'HIT' }
    });
  }
  
  // Classify task if not specified
  const taskType = task_type || classifyTask(prompt);
  
  // Get provider chain for task type
  const providers = getProviderChain(taskType);
  
  // Execute with fallback
  const response = await invokeWithFallback(prompt, providers, options);
  
  // Cache response
  await cacheResponse(cacheKey, response);
  
  // Log usage
  await logUsage(response);
  
  return new Response(JSON.stringify(response));
});
```

---

## 9. Observability

### 9.1 Logging Schema

```sql
CREATE TABLE nexus_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider TEXT NOT NULL,
  route_key TEXT DEFAULT 'default',
  status TEXT NOT NULL,
  latency_ms INTEGER NOT NULL,
  token_count INTEGER DEFAULT 0,
  cost_usd_est DECIMAL(10, 6) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### 9.2 Metrics Dashboard

Available metrics in Vision dashboard:
- Requests per minute by provider
- Average latency by provider
- Cost per day/week/month
- Cache hit rate
- Error rate by provider
- Token usage trends

### 9.3 Alerting

Automatic alerts for:
- Provider error rate > 5%
- Latency > 2x baseline
- Daily cost > budget threshold
- Cache hit rate < 80%

---

## 10. Extension Points

### 10.1 Adding New Providers

To add a new AI provider:

1. Create provider adapter:

```typescript
// adapters/newprovider.ts
export async function invokeNewProvider(
  prompt: string,
  options: ProviderOptions
): Promise<AIResponse> {
  // Implementation
}
```

2. Register in provider registry:

```typescript
// registry.ts
PROVIDERS['newprovider'] = {
  name: 'New Provider',
  invoke: invokeNewProvider,
  timeout: 30000,
  retries: 1,
  costPerToken: { input: 0.001, output: 0.002 }
};
```

3. Add to fallback chains as appropriate

### 10.2 Custom Routing Rules

Override default routing with custom rules:

```typescript
await supabase.functions.invoke('pf-nexus-router', {
  body: {
    prompt: 'My prompt',
    routing: {
      force_provider: 'anthropic',
      skip_cache: true,
      custom_timeout: 60000
    }
  }
});
```

---

## 11. Performance Benchmarks

### 11.1 Latency Comparison

| Provider | P50 Latency | P95 Latency | P99 Latency |
|----------|-------------|-------------|-------------|
| Groq | 180ms | 450ms | 800ms |
| OpenAI | 350ms | 900ms | 1500ms |
| Anthropic | 400ms | 1000ms | 1800ms |
| Perplexity | 600ms | 1500ms | 2500ms |

### 11.2 Cache Performance

- Cache hit rate: 85-92%
- Cache lookup latency: 2-5ms
- Effective cost reduction: 40-60%

---

## References

1. Groq API Documentation. https://console.groq.com/docs
2. OpenAI API Reference. https://platform.openai.com/docs
3. Anthropic API Documentation. https://docs.anthropic.com
4. Perplexity API. https://docs.perplexity.ai

---

**Document Status:** STABLE  
**Next Review:** 2026-07-13
