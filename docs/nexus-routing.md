# Nexus Routing (Free Stack Only)

## Overview
All AI model calls in PromptFluid route through the **Nexus Router** which uses only free-tier AI providers. This eliminates paid API dependencies and ensures cost-free operation.

## Architecture

```
User Request → pf-nexus-router → free-tier-router → [6 Free Providers] → Response
                     ↓
                nexus_logs (analytics)
```

## Supported Providers (in fallback order)
1. **Google AI Studio** (gemini-2.5-flash-lite) - Primary
2. **Cerebras** (llama-3.3-70b) - Secondary
3. **Groq** (llama-3.3-70b-versatile) - Tertiary
4. **Together AI** (llama-3.1-70b-turbo)
5. **DeepSeek** (deepseek-chat)
6. **Hyperbolic** (llama-3.1-70b) - Last resort

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

const { content, provider, model } = await response.json();
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

## Analytics
All routing events are logged to `nexus_logs` table:
- Provider used
- Latency (ms)
- Token count (estimated)
- Success/failure status
- Route identifier

View analytics at `/admin/nexus`

## CI Guard
The build will **fail** if Lovable AI references are detected:
- `LOVABLE_API_KEY` environment variable usage
- `ai.gateway.lovable.dev` URL references

This ensures the codebase stays on the free-tier stack.

## Migration Guide
If you need to add AI to a new function:

**❌ WRONG:**
```typescript
const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
  headers: { 'Authorization': `Bearer ${Deno.env.get('LOVABLE_API_KEY')}` }
});
```

**✅ CORRECT:**
```typescript
const response = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/pf-nexus-router`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`
  },
  body: JSON.stringify({ prompt: 'Your prompt' })
});
```

## Troubleshooting

### All providers failed
- Check that API keys are configured in Supabase secrets
- Review `nexus_logs` for specific provider errors
- Verify network connectivity

### High latency
- Check `nexus_logs` to see which provider is being used
- Primary provider (Google) should respond in <2s
- If falling back to tertiary providers, may indicate quota issues

## API Keys Required
Configure these in Supabase Secrets:
- `GOOGLE_AI_STUDIO_KEY`
- `CEREBRAS_API_KEY`
- `GROQ_API_KEY`
- `TOGETHER_API_KEY`
- `DEEPSEEK_API_KEY`
- `HYPERBOLIC_API_KEY`

All have free tiers with generous rate limits.
