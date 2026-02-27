# Nexus Routing v4.0.0 (Free Stack Only)

## Overview
All AI model calls in PromptFluid route through the **Nexus Router v4.0.0** which uses only free-tier AI providers. This eliminates paid API dependencies and ensures cost-free operation.

## Architecture

```
User Request → pf-nexus-router → free-tier-router v4.0.0 → [6 Free Providers] → Response
                     ↓
                nexus_logs (analytics)
```

## Supported Providers (in fallback order)

All limits shown are at **80% of maximum** for reliability:

| # | Provider | Model | RPM (80%) | RPD (80%) | Status |
|---|----------|-------|-----------|-----------|--------|
| 1 | **Groq** | llama-3.3-70b-versatile | 24 | 800 | PRIMARY |
| 2 | **Cerebras** | llama-3.3-70b | 24 | 11,520 | Secondary |
| 3 | **SambaNova** | Meta-Llama-3.3-70B-Instruct | 32 | 32 | Tertiary (NEW!) |
| 4 | **Hyperbolic** | llama-3.1-70b | 48 | unlimited | Fallback |
| 5 | **DeepSeek** | deepseek-chat | 16 | unlimited | Fallback |
| 6 | **Together** | llama-3.1-70b-turbo | 480 | unlimited | Last resort ($5 tier) |

**Total Daily Capacity:** ~12,352+ calls/day (from limited providers)

## Rate Limit Details

### Official Limits (from provider documentation, Jan 2025)

| Provider | Official RPM | Official RPD | Our 80% RPM | Our 80% RPD |
|----------|--------------|--------------|-------------|-------------|
| Groq | 30 | 1,000 | 24 | 800 |
| Cerebras | 30 | 14,400 | 24 | 11,520 |
| SambaNova | 40 | 40 | 32 | 32 |
| Hyperbolic | 60 | unlimited | 48 | unlimited |
| DeepSeek | 20 | unlimited | 16 | unlimited |
| Together* | 600 | unlimited | 480 | unlimited |

*Together requires $5 credit card deposit for Tier 1 limits.

## Usage

### Edge Function to Edge Function
```typescript
const response = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/pf-nexus-router`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`
  },
  body: JSON.stringify({
    prompt: 'Your prompt here',
    systemPrompt: 'Optional system prompt',
    temperature: 0.7,
    maxTokens: 1200,
    metadata: { routeKey: 'function-name' }
  })
});

const { content, provider, model, routerVersion } = await response.json();
// routerVersion will be "4.0.0"
```

### From Client (via Supabase)
```typescript
const { data } = await supabase.functions.invoke('pf-nexus-router', {
  body: {
    prompt: 'Your prompt here',
    systemPrompt: 'Optional system prompt',
    temperature: 0.7,
    maxTokens: 1200
  }
});
```

## Cascade Budget Allocation

Cascade (improvement engine) uses **30%** of total daily capacity:
- Total: 12,352 calls/day
- Cascade budget: **3,705 calls/day**
- Previous (v3.0.0): 285 calls/day
- **Improvement: 13x increase**

## Analytics
All routing events are logged to `nexus_logs` table:
- Provider used
- Latency (ms)
- Token count (estimated)
- Success/failure status
- Route identifier
- Router version

View analytics at `/admin/nexus`

## CI Guard
The build will **fail** if Lovable AI references are detected:
- `LOVABLE_API_KEY` environment variable usage
- `ai.gateway.lovable.dev` URL references

This ensures the codebase stays on the free-tier stack.

## Troubleshooting

### All providers failed
- Check that API keys are configured in Supabase secrets
- Review `nexus_logs` for specific provider errors
- Verify network connectivity

### High latency
- Check `nexus_logs` to see which provider is being used
- Primary provider (Groq) should respond in <100ms
- If falling back to tertiary providers, may indicate quota issues

## API Keys Required
Configure these in Supabase Secrets:
- `GROQ_API_KEY` (primary)
- `CEREBRAS_API_KEY`
- `SAMBANOVA_API_KEY` (NEW)
- `HYPERBOLIC_API_KEY`
- `DEEPSEEK_API_KEY`
- `TOGETHER_API_KEY`

All have free tiers with generous rate limits.

## Changelog

### v4.0.0 (January 2025)
- CORRECTED rate limits from official documentation
- All limits now at 80% of maximum for reliability margin
- Added SambaNova as new provider (very fast inference)
- Cerebras FREE tier corrected: 30 RPM, 14,400 RPD (was incorrectly 950!)
- Cascade budget increased from 285 to 3,705 calls/day (13x improvement)

### v3.0.0 (December 2024)
- Added 15-second buffer to rate limits
- Enterprise-grade circuit breaker pattern
- Auto-healing with health probes
