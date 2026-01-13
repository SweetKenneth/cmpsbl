# promptfluid® nexus routing

## Document Metadata

| Field | Value |
|-------|-------|
| Document ID | PF-NEXUS-001 |
| Version | v2026.01 |
| Last Updated | 2026-01-13 |
| Status | STABLE |
| Type | Cognitive Orchestration Substrate |
| Citation | Sweet Jr, K.E. (2026). promptfluid nexus routing. doi:10.5281/zenodo.XXXXXXX |

---

## 1. Introduction

promptfluid® is a cognitive orchestration substrate that provides routing, memory, learning cycles, observability, defense, and execution coordination for AI systems. It is model-agnostic, provider-agnostic, and runs on commodity cloud.

nexus is the AI gateway layer that abstracts multiple AI providers behind a unified interface. It provides intelligent routing, automatic fallback, response caching, and cost optimization for all AI operations within the promptfluid ecosystem.

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

---

## 3. Task Classification

### 3.1 Task Types

nexus automatically classifies requests based on content analysis:

| Task Type | Keywords | Primary Provider | Fallback Chain |
|-----------|----------|------------------|----------------|
| `reasoning` | analyze, explain, compare, evaluate | Groq | OpenAI → Anthropic |
| `creation` | write, generate, create, compose | OpenAI | Anthropic → Groq |
| `research` | search, find, current, recent | Perplexity | OpenAI → Groq |
| `sensitive` | ethics, policy, safety, legal | Anthropic | OpenAI |
| `code` | code, function, implement, debug | Groq | OpenAI |
| `general` | (default) | Groq | OpenAI → Anthropic |

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

---

## 5. Response Caching

### 5.1 Cache Strategy

nexus uses Redis for response caching with content-addressed storage:

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

---

## 7. Multi-Modal Support

### 7.1 Text Generation

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

### 7.3 Video Generation

```typescript
const response = await supabase.functions.invoke('pf-nexus-video', {
  body: {
    prompt: 'A rocket launching into space',
    duration: 5,
    aspect_ratio: '16:9'
  }
});
```

---

## 8. Observability

### 8.1 Metrics Dashboard

Available metrics:
- Requests per minute by provider
- Average latency by provider
- Cost per day/week/month
- Cache hit rate
- Error rate by provider
- Token usage trends

### 8.2 Alerting

Automatic alerts for:
- Provider error rate > 5%
- Latency > 2x baseline
- Daily cost > budget threshold
- Cache hit rate < 80%

---

## Contact & Licensing

**Founder:** Kenneth E Sweet Jr  
**Email:** promptfluid@gmail.com  
**Phone:** (760) FLUID-AI  
**Website:** https://promptfluid.com

For licensing inquiries regarding the promptfluid® substrate, contact promptfluid@gmail.com.

---

**promptfluid® — Cognitive Orchestration Substrate**  
**Copyright © 2025-2026 promptfluid. All rights reserved.**
