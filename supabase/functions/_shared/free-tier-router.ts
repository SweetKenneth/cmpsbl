/**
 * FREE-ONLY AI Routing - VERIFIED RATE LIMITS (Dec 2024)
 * Routes requests across free-tier AI providers with accurate limits
 * 
 * VERIFIED RATE LIMITS (per official documentation):
 * 
 * Provider      | Per Min | Per Hour | Per Day  | Notes
 * --------------|---------|----------|----------|----------------------------------
 * Groq          | 30 RPM  | -        | 1,000    | llama-3.3-70b-versatile (free tier)
 * Cerebras      | 30 RPM  | 900 RPH  | 14,400   | llama-3.3-70b (free tier)
 * DeepSeek      | NO LIMIT| NO LIMIT | NO LIMIT | Official: "no rate limits"
 * Hyperbolic    | 60 RPM  | -        | ~8,640   | Basic tier with $1 promo credit
 * Google        | 2 RPM   | -        | 20       | Gemini 2.0 Flash (severely reduced)
 * Together      | 0       | 0        | 0        | REQUIRES $5 payment (NOT FREE)
 * 
 * PRIORITY ORDER: Cerebras (best free) → DeepSeek (unlimited) → Hyperbolic → Groq → Google
 * 
 * TOTAL FREE CAPACITY: ~24,060 requests/day (without Together)
 * TARGET: 90% utilization = ~21,654 requests/day = ~15 requests/minute
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

// VERIFIED Rate limits from official documentation (Dec 2024)
export const RATE_LIMITS = {
  // Cerebras: 30 RPM, 900 RPH, 14,400 RPD, 60K TPM, 1M TPD (FREE TIER)
  cerebras: { perMin: 30, perHour: 900, perDay: 14400 },
  
  // DeepSeek: NO rate limits per official docs - but we set soft limits to be safe
  deepseek: { perMin: 60, perHour: 3600, perDay: 50000 },
  
  // Hyperbolic: 60 RPM for Basic tier (with $1 promo credit)
  hyperbolic: { perMin: 60, perHour: 3600, perDay: 8640 },
  
  // Groq: 30 RPM, 1,000 RPD for llama-3.3-70b-versatile (FREE TIER)
  groq: { perMin: 30, perHour: 500, perDay: 1000 },
  
  // Google: Severely reduced - now ~20 RPD for free tier (Dec 2024 changes)
  google: { perMin: 2, perHour: 20, perDay: 20 },
  
  // Together: REQUIRES $5 credit card payment - NOT TRULY FREE
  // Set to 0 to skip this provider
  together: { perMin: 0, perHour: 0, perDay: 0 }
};

// Calculate actual free capacity (excluding Together which requires payment)
export const TOTAL_DAILY_CAPACITY = 
  RATE_LIMITS.cerebras.perDay + 
  RATE_LIMITS.deepseek.perDay + 
  RATE_LIMITS.hyperbolic.perDay + 
  RATE_LIMITS.groq.perDay + 
  RATE_LIMITS.google.perDay;
// = 14,400 + 50,000 + 8,640 + 1,000 + 20 = 74,060

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
 * Select best provider based on current usage and VERIFIED rate limits
 * Priority: Cerebras (best free limits) → DeepSeek (unlimited) → Hyperbolic → Groq → Google
 * Excludes Together (requires $5 payment)
 */
export function selectOptimalProvider(usage: RateLimitState): string {
  // Provider priority based on verified free tier limits (best first)
  const providers = [
    // Cerebras: Best free tier - 14,400 RPD, 30 RPM, 900 RPH
    { name: 'cerebras', limits: RATE_LIMITS.cerebras, current: usage.cerebras },
    // DeepSeek: Officially no rate limits
    { name: 'deepseek', limits: RATE_LIMITS.deepseek, current: usage.deepseek },
    // Hyperbolic: 60 RPM, ~8,640 RPD
    { name: 'hyperbolic', limits: RATE_LIMITS.hyperbolic, current: usage.hyperbolic },
    // Groq: Only 1,000 RPD free (not 14,400!)
    { name: 'groq', limits: RATE_LIMITS.groq, current: usage.groq },
    // Google: Severely limited - only 20 RPD now
    { name: 'google', limits: RATE_LIMITS.google, current: usage.google }
    // Together EXCLUDED - requires $5 credit card payment
  ];

  for (const p of providers) {
    // Skip providers with 0 limits (Together)
    if (p.limits.perDay === 0) continue;
    
    const dailyOk = p.current.daily < p.limits.perDay * 0.90; // 90% threshold
    const hourOk = p.limits.perHour ? p.current.lastHour < p.limits.perHour * 0.90 : true;
    const minOk = p.current.lastMin < Math.max(1, p.limits.perMin - 2); // Leave 2 req buffer
    
    if (dailyOk && hourOk && minOk) {
      return p.name;
    }
  }

  // All providers near limit - return first with any capacity
  for (const p of providers) {
    if (p.limits.perDay === 0) continue;
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
  
  // Provider execution order: Cerebras (best free) → DeepSeek (unlimited) → Hyperbolic → Groq → Google
  // Together EXCLUDED - requires $5 credit card payment
  const providerOrder = forceProvider 
    ? [forceProvider]
    : ['cerebras', 'deepseek', 'hyperbolic', 'groq', 'google'];
  
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

        case 'deepseek':
          if (!DEEPSEEK_API_KEY) continue;
          console.log('🥈 DeepSeek (UNLIMITED)...');
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

        case 'hyperbolic':
          if (!HYPERBOLIC_API_KEY) continue;
          console.log('🥉 Hyperbolic (8.6K/day)...');
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

        // Together EXCLUDED from rotation - requires $5 payment
        case 'together':
          console.log('⛔ Together AI SKIPPED (requires $5 payment)');
          continue;

        case 'google':
          if (!GOOGLE_AI_KEY) continue;
          console.log('🔻 Google AI Studio (20/day limit)...');
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
  
  throw new Error('All free providers exhausted or unavailable');
}
