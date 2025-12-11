/**
 * FREE-ONLY AI Routing - MAXIMIZED FOR 90% DAILY USAGE
 * Routes requests across 6 free providers with zero paid APIs
 * Groq (PRIMARY) → Cerebras → Together → Hyperbolic → DeepSeek → Google
 * 
 * Rate limits per provider:
 * - Groq: 30 req/min, 14,400 req/day (PRIMARY)
 * - Cerebras: 30 req/min, 14,400 req/day
 * - Together: 20 req/min, 10,000 req/day
 * - Hyperbolic: 15 req/min, 8,000 req/day
 * - DeepSeek: 10 req/min, 5,000 req/day
 * - Google: 10 req/min, 550 req/day (reserved for user chat)
 * 
 * TOTAL CAPACITY: ~52,350 requests/day
 * TARGET: 90% utilization = ~47,115 requests/day = ~32.7 requests/minute
 */

export interface FreeTierConfig {
  maxTokens?: number;
  temperature?: number;
  systemPrompt?: string;
  forceProvider?: string;
}

export interface RateLimitState {
  groq: { daily: number; lastMin: number };
  cerebras: { daily: number; lastMin: number };
  together: { daily: number; lastMin: number };
  hyperbolic: { daily: number; lastMin: number };
  deepseek: { daily: number; lastMin: number };
  google: { daily: number; lastMin: number };
}

// Rate limits - maximize usage!
export const RATE_LIMITS = {
  groq: { perMin: 30, perDay: 14400 },
  cerebras: { perMin: 30, perDay: 14400 },
  together: { perMin: 20, perDay: 10000 },
  hyperbolic: { perMin: 15, perDay: 8000 },
  deepseek: { perMin: 10, perDay: 5000 },
  google: { perMin: 10, perDay: 550 }
};

export const TOTAL_DAILY_CAPACITY = Object.values(RATE_LIMITS).reduce((sum, r) => sum + r.perDay, 0);
export const TARGET_USAGE_PERCENT = 0.90; // 90% target
export const TARGET_DAILY_CALLS = Math.floor(TOTAL_DAILY_CAPACITY * TARGET_USAGE_PERCENT);

/**
 * Dream State Calculator
 * 25% chance during 2-5am (deep dream hours)
 * 5% chance at all other times
 */
export function shouldEnterDreamState(): { enter: boolean; dreamType: string; probability: number } {
  const hour = new Date().getUTCHours();
  const isDreamHours = hour >= 2 && hour < 5;
  const probability = isDreamHours ? 0.25 : 0.05;
  const roll = Math.random();
  
  return {
    enter: roll < probability,
    dreamType: isDreamHours ? 'deep' : 'light',
    probability
  };
}

/**
 * Select best provider based on current usage and rate limits
 */
export function selectOptimalProvider(usage: RateLimitState): string {
  // Provider priority with rate limit checks
  const providers = [
    { name: 'groq', limits: RATE_LIMITS.groq, current: usage.groq },
    { name: 'cerebras', limits: RATE_LIMITS.cerebras, current: usage.cerebras },
    { name: 'together', limits: RATE_LIMITS.together, current: usage.together },
    { name: 'hyperbolic', limits: RATE_LIMITS.hyperbolic, current: usage.hyperbolic },
    { name: 'deepseek', limits: RATE_LIMITS.deepseek, current: usage.deepseek },
    { name: 'google', limits: RATE_LIMITS.google, current: usage.google }
  ];

  for (const p of providers) {
    const dailyOk = p.current.daily < p.limits.perDay * 0.95; // 95% threshold
    const minOk = p.current.lastMin < p.limits.perMin - 2; // Leave 2 req buffer
    if (dailyOk && minOk) {
      return p.name;
    }
  }

  // All providers near limit - return first with any capacity
  for (const p of providers) {
    if (p.current.daily < p.limits.perDay && p.current.lastMin < p.limits.perMin) {
      return p.name;
    }
  }

  return 'exhausted';
}

/**
 * Calculate calls remaining today across all providers
 */
export function getCallsRemaining(usage: RateLimitState): number {
  const totalUsed = usage.groq.daily + usage.cerebras.daily + 
    usage.together.daily + usage.hyperbolic.daily + 
    usage.deepseek.daily + usage.google.daily;
  return TOTAL_DAILY_CAPACITY - totalUsed;
}

/**
 * Calculate minutes until reset (midnight UTC)
 */
export function getMinutesUntilReset(): number {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setUTCHours(24, 0, 0, 0);
  return Math.floor((midnight.getTime() - now.getTime()) / 60000);
}

/**
 * Calculate required calls per minute to hit 90% target
 */
export function getRequiredCallsPerMinute(usage: RateLimitState): number {
  const remaining = TARGET_DAILY_CALLS - (
    usage.groq.daily + usage.cerebras.daily + 
    usage.together.daily + usage.hyperbolic.daily + 
    usage.deepseek.daily + usage.google.daily
  );
  const minutesLeft = getMinutesUntilReset();
  if (minutesLeft <= 0) return 0;
  return Math.ceil(remaining / minutesLeft);
}

export async function callFreeTierAI(
  prompt: string,
  config: FreeTierConfig = {}
): Promise<{ content: string; model: string; provider: string }> {
  
  const { maxTokens = 800, temperature = 0.2, systemPrompt = '', forceProvider } = config;
  
  const GROQ_API_KEY = Deno.env.get('GROQ_API_KEY');
  const CEREBRAS_API_KEY = Deno.env.get('CEREBRAS_API_KEY');
  const GOOGLE_AI_KEY = Deno.env.get('GOOGLE_AI_STUDIO_KEY');
  const TOGETHER_API_KEY = Deno.env.get('TOGETHER_API_KEY');
  const DEEPSEEK_API_KEY = Deno.env.get('DEEPSEEK_API_KEY');
  const HYPERBOLIC_API_KEY = Deno.env.get('HYPERBOLIC_API_KEY');
  
  // Provider execution order (GROQ PRIMARY)
  const providerOrder = forceProvider 
    ? [forceProvider]
    : ['groq', 'cerebras', 'together', 'hyperbolic', 'deepseek', 'google'];
  
  for (const provider of providerOrder) {
    try {
      switch (provider) {
        case 'groq':
          if (!GROQ_API_KEY) continue;
          console.log('🚀 Groq (Primary Provider)...');
          const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${GROQ_API_KEY}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
              model: 'llama-3.3-70b-versatile',
              messages: systemPrompt
                ? [{ role: 'system', content: systemPrompt }, { role: 'user', content: prompt }]
                : [{ role: 'user', content: prompt }],
              temperature,
              max_tokens: maxTokens,
            }),
          });
          if (groqRes.ok) {
            const data = await groqRes.json();
            return { content: data.choices[0].message.content, model: 'llama-3.3-70b-versatile', provider: 'groq' };
          }
          console.log('⚠️ Groq status:', groqRes.status);
          break;

        case 'cerebras':
          if (!CEREBRAS_API_KEY) continue;
          console.log('🔄 Cerebras (Secondary)...');
          const cerebrasRes = await fetch('https://api.cerebras.ai/v1/chat/completions', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${CEREBRAS_API_KEY}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
              model: 'llama-3.3-70b',
              messages: systemPrompt
                ? [{ role: 'system', content: systemPrompt }, { role: 'user', content: prompt }]
                : [{ role: 'user', content: prompt }],
              temperature,
              max_tokens: maxTokens,
            }),
          });
          if (cerebrasRes.ok) {
            const data = await cerebrasRes.json();
            return { content: data.choices[0].message.content, model: 'llama-3.3-70b', provider: 'cerebras' };
          }
          break;

        case 'together':
          if (!TOGETHER_API_KEY) continue;
          console.log('🔄 Together AI...');
          const togetherRes = await fetch('https://api.together.xyz/v1/chat/completions', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${TOGETHER_API_KEY}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
              model: 'meta-llama/Llama-3.1-70B-Instruct-Turbo',
              messages: systemPrompt
                ? [{ role: 'system', content: systemPrompt }, { role: 'user', content: prompt }]
                : [{ role: 'user', content: prompt }],
              temperature,
              max_tokens: maxTokens,
            }),
          });
          if (togetherRes.ok) {
            const data = await togetherRes.json();
            return { content: data.choices[0].message.content, model: 'llama-3.1-70b-turbo', provider: 'together' };
          }
          break;

        case 'hyperbolic':
          if (!HYPERBOLIC_API_KEY) continue;
          console.log('🔄 Hyperbolic...');
          const hypRes = await fetch('https://api.hyperbolic.xyz/v1/chat/completions', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${HYPERBOLIC_API_KEY}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
              model: 'meta-llama/Llama-3.1-70B-Instruct',
              messages: systemPrompt
                ? [{ role: 'system', content: systemPrompt }, { role: 'user', content: prompt }]
                : [{ role: 'user', content: prompt }],
              temperature,
              max_tokens: maxTokens,
            }),
          });
          if (hypRes.ok) {
            const data = await hypRes.json();
            return { content: data.choices[0].message.content, model: 'llama-3.1-70b', provider: 'hyperbolic' };
          }
          break;

        case 'deepseek':
          if (!DEEPSEEK_API_KEY) continue;
          console.log('🔄 DeepSeek...');
          const dsRes = await fetch('https://api.deepseek.com/v1/chat/completions', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${DEEPSEEK_API_KEY}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
              model: 'deepseek-chat',
              messages: systemPrompt
                ? [{ role: 'system', content: systemPrompt }, { role: 'user', content: prompt }]
                : [{ role: 'user', content: prompt }],
              temperature,
              max_tokens: maxTokens,
            }),
          });
          if (dsRes.ok) {
            const data = await dsRes.json();
            return { content: data.choices[0].message.content, model: 'deepseek-chat', provider: 'deepseek' };
          }
          break;

        case 'google':
          if (!GOOGLE_AI_KEY) continue;
          console.log('🔄 Google AI Studio...');
          const fullPrompt = systemPrompt ? `${systemPrompt}\n\n${prompt}` : prompt;
          const googleRes = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-goog-api-key': GOOGLE_AI_KEY },
            body: JSON.stringify({
              contents: [{ parts: [{ text: fullPrompt }] }],
              generationConfig: { temperature, maxOutputTokens: maxTokens }
            }),
          });
          if (googleRes.ok) {
            const data = await googleRes.json();
            return { content: data.candidates[0].content.parts[0].text, model: 'gemini-2.0-flash', provider: 'google' };
          }
          break;
      }
    } catch (e) {
      console.log(`${provider} failed, trying next...`, e);
    }
  }
  
  throw new Error('All 6 free providers exhausted or unavailable');
}
