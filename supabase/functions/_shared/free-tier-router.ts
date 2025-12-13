/**
 * FREE-TIER AI Routing - SMART LIMITS (Dec 2024)
 * Routes requests across AI providers with per-min/hour/day limits
 * 
 * RATE LIMITS (per official documentation):
 * 
 * Provider      | Per Min | Per Hour | Per Day  | Notes
 * --------------|---------|----------|----------|----------------------------------
 * Cerebras      | 30 RPM  | 900 RPH  | 14,400   | FREE tier - llama-3.3-70b
 * Together      | 10 RPS  | 600 RPH  | 14,400   | $5 deposit tier - Llama 3.1 70B
 * Hyperbolic    | 60 RPM  | 3,600    | 86,400   | $5 deposit tier - Llama 3.1 70B
 * Groq          | 30 RPM  | 500 RPH  | 1,000    | FREE tier - llama-3.3-70b
 * DeepSeek      | 20 RPM  | 600 RPH  | 5,000    | Conservative limits (officially unlimited)
 * Google        | 2 RPM   | 20 RPH   | 50       | Severely reduced Dec 2024
 * 
 * PRIORITY ORDER: Cerebras → Together → Hyperbolic → DeepSeek → Groq → Google
 * 
 * TOTAL CAPACITY: ~121,250 requests/day
 * TARGET: 90% utilization = ~109,125 requests/day = ~75 requests/minute
 */

export interface FreeTierConfig {
  maxTokens?: number;
  temperature?: number;
  systemPrompt?: string;
  forceProvider?: string;
}

export interface RateLimitState {
  groq: { daily: number; lastMin: number; lastHour: number };
  cerebras: { daily: number; lastMin: number; lastHour: number };
  together: { daily: number; lastMin: number; lastHour: number };
  hyperbolic: { daily: number; lastMin: number; lastHour: number };
  deepseek: { daily: number; lastMin: number; lastHour: number };
  google: { daily: number; lastMin: number; lastHour: number };
}

// Rate limits - SMART routing with per-min/hour/day checks
export const RATE_LIMITS = {
  // Cerebras: 30 RPM, 900 RPH, 14,400 RPD (FREE TIER - best free)
  cerebras: { perMin: 30, perHour: 900, perDay: 14400 },
  
  // Together: 600 RPM, 36K RPH (Tier 1 with $5 deposit)
  together: { perMin: 10, perHour: 600, perDay: 14400 },
  
  // Hyperbolic: 60 RPM basic tier (with $5 deposit)
  hyperbolic: { perMin: 60, perHour: 3600, perDay: 86400 },
  
  // DeepSeek: Conservative limits - officially "no limits" but we cap for reliability
  deepseek: { perMin: 20, perHour: 600, perDay: 5000 },
  
  // Groq: 30 RPM, 1,000 RPD for llama-3.3-70b-versatile (FREE TIER)
  groq: { perMin: 30, perHour: 500, perDay: 1000 },
  
  // Google: Severely reduced Dec 2024 - almost unusable
  google: { perMin: 2, perHour: 20, perDay: 50 }
};

// Calculate total capacity across all providers
export const TOTAL_DAILY_CAPACITY = Object.values(RATE_LIMITS).reduce((sum, r) => sum + r.perDay, 0);
// = 14,400 + 14,400 + 86,400 + 5,000 + 1,000 + 50 = 121,250

export const TARGET_USAGE_PERCENT = 0.90; // 90% target
export const TARGET_DAILY_CALLS = Math.floor(TOTAL_DAILY_CAPACITY * TARGET_USAGE_PERCENT);

// Per-minute capacity for smart routing
export const TOTAL_PER_MIN_CAPACITY = Object.values(RATE_LIMITS).reduce((sum, r) => sum + r.perMin, 0);
// = 30 + 10 + 60 + 20 + 30 + 2 = 152 RPM max

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
 * Select best provider based on SMART per-min/hour/day limits
 * Priority: Cerebras → Together → Hyperbolic → DeepSeek → Groq → Google
 */
export function selectOptimalProvider(usage: RateLimitState): string {
  // Provider priority - ordered by reliability and capacity
  const providers = [
    { name: 'cerebras', limits: RATE_LIMITS.cerebras, current: usage.cerebras },
    { name: 'together', limits: RATE_LIMITS.together, current: usage.together },
    { name: 'hyperbolic', limits: RATE_LIMITS.hyperbolic, current: usage.hyperbolic },
    { name: 'deepseek', limits: RATE_LIMITS.deepseek, current: usage.deepseek },
    { name: 'groq', limits: RATE_LIMITS.groq, current: usage.groq },
    { name: 'google', limits: RATE_LIMITS.google, current: usage.google }
  ];

  for (const p of providers) {
    // Check ALL three limits: per-min, per-hour, per-day
    const minOk = p.current.lastMin < p.limits.perMin - 2; // Leave 2 req buffer
    const hourOk = p.current.lastHour < p.limits.perHour * 0.85; // 85% threshold
    const dailyOk = p.current.daily < p.limits.perDay * 0.90; // 90% threshold
    
    if (minOk && hourOk && dailyOk) {
      return p.name;
    }
  }

  // Fallback: find any provider with remaining capacity
  for (const p of providers) {
    if (p.current.lastMin < p.limits.perMin && p.current.daily < p.limits.perDay) {
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
  
  // Provider execution order: Cerebras → Together → Hyperbolic → DeepSeek → Groq → Google
  const providerOrder = forceProvider 
    ? [forceProvider]
    : ['cerebras', 'together', 'hyperbolic', 'deepseek', 'groq', 'google'];
  
  for (const provider of providerOrder) {
    try {
      switch (provider) {
        case 'cerebras':
          if (!CEREBRAS_API_KEY) continue;
          console.log('🥇 Cerebras (PRIMARY - 14.4K/day)...');
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
          console.log('⚠️ Cerebras status:', cerebrasRes.status);
          break;

        case 'together':
          if (!TOGETHER_API_KEY) continue;
          console.log('🥈 Together AI (14.4K/day - $5 tier)...');
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
          console.log('⚠️ Together status:', togetherRes.status);
          break;

        case 'hyperbolic':
          if (!HYPERBOLIC_API_KEY) continue;
          console.log('🥉 Hyperbolic (86K/day - $5 tier)...');
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
          console.log('⚠️ Hyperbolic status:', hypRes.status);
          break;

        case 'deepseek':
          if (!DEEPSEEK_API_KEY) continue;
          console.log('🔄 DeepSeek (5K/day cap)...');
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
          console.log('⚠️ DeepSeek status:', dsRes.status);
          break;

        case 'groq':
          if (!GROQ_API_KEY) continue;
          console.log('🔄 Groq (1K/day only)...');
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

        case 'google':
          if (!GOOGLE_AI_KEY) continue;
          console.log('🔻 Google AI Studio (50/day limit)...');
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
          console.log('⚠️ Google status:', googleRes.status);
          break;
      }
    } catch (e) {
      console.log(`${provider} failed, trying next...`, e);
    }
  }
  
  // Final attempt: wait and retry with reduced rate limits
  console.log('⏳ All providers temporarily exhausted. Waiting 30s before final attempt...');
  await new Promise(r => setTimeout(r, 30000));
  
  // Try one more time with any available provider
  const fallbackProviders = ['deepseek', 'cerebras', 'hyperbolic'];
  for (const provider of fallbackProviders) {
    try {
      switch (provider) {
        case 'deepseek':
          if (!DEEPSEEK_API_KEY) continue;
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
        case 'cerebras':
          if (!CEREBRAS_API_KEY) continue;
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
        case 'hyperbolic':
          if (!HYPERBOLIC_API_KEY) continue;
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
      }
    } catch (e) {
      console.log(`Fallback ${provider} failed:`, e);
    }
  }
  
  throw new Error('All free providers exhausted - will retry next cycle');
}
