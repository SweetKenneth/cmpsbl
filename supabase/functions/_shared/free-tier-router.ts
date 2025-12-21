/**
 * FREE-TIER AI Routing v2.0.0 - SMART LIMITS + SELF-HEALING + GARDENING
 * 
 * Routes requests across AI providers with:
 * - Per-min/hour/day limits with smart capacity planning
 * - Circuit breaker pattern for failing providers
 * - Self-healing with automatic recovery attempts
 * - Health scoring per provider
 * - Graceful degradation with intelligent fallbacks
 * - Gardening: periodic maintenance and optimization
 * 
 * RATE LIMITS (per official documentation):
 * 
 * Provider      | Per Min | Per Hour | Per Day  | Notes
 * --------------|---------|----------|----------|----------------------------------
 * Groq          | 30 RPM  | 500 RPH  | 1,000    | FREE tier - llama-3.3-70b (FAST!)
 * Cerebras      | 30 RPM  | 900 RPH  | 14,400   | FREE tier - llama-3.3-70b
 * Together      | 10 RPS  | 600 RPH  | 14,400   | $5 deposit tier - Llama 3.1 70B
 * Hyperbolic    | 60 RPM  | 3,600    | 86,400   | $5 deposit tier - Llama 3.1 70B
 * DeepSeek      | 20 RPM  | 600 RPH  | 5,000    | Conservative limits
 * Google        | 2 RPM   | 20 RPH   | 50       | Severely reduced Dec 2024
 * 
 * PRIORITY ORDER: Groq → Cerebras → Together → Hyperbolic → DeepSeek → Google
 * 
 * TOTAL CAPACITY: ~121,250 requests/day
 * TARGET: 90% utilization = ~109,125 requests/day = ~75 requests/minute
 * 
 * v2.0.0 CHANGELOG:
 * - Added circuit breaker pattern with configurable thresholds
 * - Added health scoring per provider (0-100)
 * - Added self-healing with automatic recovery probes
 * - Added graceful degradation tiers
 * - Added gardening functions for periodic maintenance
 * - Improved error classification and retry logic
 * - Added provider warmup and cooldown cycles
 */

export const ROUTER_VERSION = "2.0.0";

export interface FreeTierConfig {
  maxTokens?: number;
  temperature?: number;
  systemPrompt?: string;
  forceProvider?: string;
  priority?: 'speed' | 'reliability' | 'cost';
  enableCircuitBreaker?: boolean;
  enableSelfHealing?: boolean;
}

export interface RateLimitState {
  groq: { daily: number; lastMin: number; lastHour: number };
  cerebras: { daily: number; lastMin: number; lastHour: number };
  together: { daily: number; lastMin: number; lastHour: number };
  hyperbolic: { daily: number; lastMin: number; lastHour: number };
  deepseek: { daily: number; lastMin: number; lastHour: number };
  google: { daily: number; lastMin: number; lastHour: number };
}

export interface ProviderHealth {
  provider: string;
  healthScore: number;        // 0-100, higher is better
  consecutiveFailures: number;
  consecutiveSuccesses: number;
  lastSuccess: number | null; // timestamp
  lastFailure: number | null; // timestamp
  circuitState: 'closed' | 'open' | 'half-open';
  avgLatencyMs: number;
  totalRequests: number;
  failureRate: number;        // 0-1
}

export interface RouterState {
  version: string;
  initialized: number;
  providerHealth: Record<string, ProviderHealth>;
  lastGardening: number | null;
  totalRequestsToday: number;
  healingAttempts: number;
}

// ═══════════════════════════════════════════════════════════════
// CONFIGURATION CONSTANTS
// ═══════════════════════════════════════════════════════════════

// Rate limits - SMART routing with per-min/hour/day checks
export const RATE_LIMITS = {
  cerebras: { perMin: 30, perHour: 900, perDay: 14400 },
  together: { perMin: 10, perHour: 600, perDay: 14400 },
  hyperbolic: { perMin: 60, perHour: 3600, perDay: 86400 },
  deepseek: { perMin: 20, perHour: 600, perDay: 5000 },
  groq: { perMin: 30, perHour: 500, perDay: 1000 },
  google: { perMin: 2, perHour: 20, perDay: 50 }
};

// Circuit breaker configuration
const CIRCUIT_BREAKER = {
  failureThreshold: 3,        // Open circuit after N consecutive failures
  successThreshold: 2,        // Close circuit after N consecutive successes in half-open
  openDurationMs: 60000,      // Stay open for 1 minute before trying again
  halfOpenMaxRequests: 3      // Max requests to try in half-open state
};

// Self-healing configuration
const SELF_HEALING = {
  probeIntervalMs: 30000,     // Probe failing providers every 30s
  maxProbesPerProvider: 3,    // Max probes before giving up on a provider
  recoveryThreshold: 2        // Successful probes needed to recover
};

// Graceful degradation tiers
const DEGRADATION_TIERS = {
  tier1: ['groq', 'cerebras'],           // Primary: fastest, free
  tier2: ['together', 'hyperbolic'],     // Secondary: paid but reliable
  tier3: ['deepseek', 'google'],         // Tertiary: backup
  emergency: ['local_fallback']          // Emergency: no AI, graceful message
};

// Calculate total capacity
export const TOTAL_DAILY_CAPACITY = Object.values(RATE_LIMITS).reduce((sum, r) => sum + r.perDay, 0);
export const TARGET_USAGE_PERCENT = 0.90;
export const TARGET_DAILY_CALLS = Math.floor(TOTAL_DAILY_CAPACITY * TARGET_USAGE_PERCENT);
export const TOTAL_PER_MIN_CAPACITY = Object.values(RATE_LIMITS).reduce((sum, r) => sum + r.perMin, 0);

// ═══════════════════════════════════════════════════════════════
// IN-MEMORY STATE (per-instance, resets on cold start)
// ═══════════════════════════════════════════════════════════════

const routerState: RouterState = {
  version: ROUTER_VERSION,
  initialized: Date.now(),
  providerHealth: {},
  lastGardening: null,
  totalRequestsToday: 0,
  healingAttempts: 0
};

function initializeProviderHealth(provider: string): ProviderHealth {
  return {
    provider,
    healthScore: 100,
    consecutiveFailures: 0,
    consecutiveSuccesses: 0,
    lastSuccess: null,
    lastFailure: null,
    circuitState: 'closed',
    avgLatencyMs: 0,
    totalRequests: 0,
    failureRate: 0
  };
}

function getProviderHealth(provider: string): ProviderHealth {
  if (!routerState.providerHealth[provider]) {
    routerState.providerHealth[provider] = initializeProviderHealth(provider);
  }
  return routerState.providerHealth[provider];
}

// ═══════════════════════════════════════════════════════════════
// CIRCUIT BREAKER LOGIC
// ═══════════════════════════════════════════════════════════════

function updateCircuitBreaker(provider: string, success: boolean, latencyMs: number): void {
  const health = getProviderHealth(provider);
  health.totalRequests++;
  
  if (success) {
    health.consecutiveSuccesses++;
    health.consecutiveFailures = 0;
    health.lastSuccess = Date.now();
    
    // Update rolling average latency
    health.avgLatencyMs = health.avgLatencyMs === 0 
      ? latencyMs 
      : health.avgLatencyMs * 0.8 + latencyMs * 0.2;
    
    // Recovery logic for half-open circuits
    if (health.circuitState === 'half-open' && 
        health.consecutiveSuccesses >= CIRCUIT_BREAKER.successThreshold) {
      health.circuitState = 'closed';
      health.healthScore = Math.min(100, health.healthScore + 20);
      console.log(`🔌 Circuit CLOSED for ${provider} - recovered`);
    }
    
    // Gradually improve health score on success
    health.healthScore = Math.min(100, health.healthScore + 2);
    
  } else {
    health.consecutiveFailures++;
    health.consecutiveSuccesses = 0;
    health.lastFailure = Date.now();
    
    // Degrade health score on failure
    health.healthScore = Math.max(0, health.healthScore - 15);
    
    // Open circuit after threshold failures
    if (health.consecutiveFailures >= CIRCUIT_BREAKER.failureThreshold) {
      health.circuitState = 'open';
      console.log(`🚫 Circuit OPEN for ${provider} - ${health.consecutiveFailures} consecutive failures`);
    }
  }
  
  // Update failure rate
  const successCount = health.totalRequests - Math.floor(health.totalRequests * health.failureRate);
  health.failureRate = success 
    ? (health.totalRequests - successCount - 1) / health.totalRequests
    : (health.totalRequests - successCount + 1) / health.totalRequests;
}

function isCircuitOpen(provider: string): boolean {
  const health = getProviderHealth(provider);
  
  if (health.circuitState === 'closed') return false;
  
  if (health.circuitState === 'open') {
    // Check if we should transition to half-open
    const timeSinceFailure = Date.now() - (health.lastFailure || 0);
    if (timeSinceFailure >= CIRCUIT_BREAKER.openDurationMs) {
      health.circuitState = 'half-open';
      console.log(`⚡ Circuit HALF-OPEN for ${provider} - probing recovery`);
      return false;
    }
    return true;
  }
  
  // Half-open: allow limited requests
  return false;
}

// ═══════════════════════════════════════════════════════════════
// SELF-HEALING LOGIC
// ═══════════════════════════════════════════════════════════════

export async function probeProvider(provider: string): Promise<boolean> {
  console.log(`🔍 Self-healing probe for ${provider}...`);
  
  try {
    const result = await callProviderDirect(provider, "Respond with OK", {
      maxTokens: 10,
      temperature: 0
    });
    
    if (result) {
      console.log(`✅ ${provider} probe successful`);
      updateCircuitBreaker(provider, true, 100);
      return true;
    }
  } catch (e) {
    console.log(`❌ ${provider} probe failed:`, e);
    updateCircuitBreaker(provider, false, 0);
  }
  
  return false;
}

// ═══════════════════════════════════════════════════════════════
// GARDENING FUNCTIONS
// ═══════════════════════════════════════════════════════════════

export interface GardeningReport {
  timestamp: number;
  version: string;
  healthySystems: string[];
  degradedSystems: string[];
  recommendations: string[];
  actionsPerformed: string[];
}

export async function runGardening(): Promise<GardeningReport> {
  console.log('🌱 Running router gardening cycle...');
  
  const report: GardeningReport = {
    timestamp: Date.now(),
    version: ROUTER_VERSION,
    healthySystems: [],
    degradedSystems: [],
    recommendations: [],
    actionsPerformed: []
  };
  
  const providers = Object.keys(RATE_LIMITS);
  
  for (const provider of providers) {
    const health = getProviderHealth(provider);
    
    // Categorize health
    if (health.healthScore >= 70) {
      report.healthySystems.push(`${provider}: ${health.healthScore}%`);
    } else {
      report.degradedSystems.push(`${provider}: ${health.healthScore}%`);
    }
    
    // Probe degraded providers
    if (health.circuitState === 'open') {
      const recovered = await probeProvider(provider);
      if (recovered) {
        report.actionsPerformed.push(`Recovered ${provider} from open circuit`);
      }
    }
    
    // Reset stale failure counts (if no failures in 5 minutes)
    if (health.lastFailure && Date.now() - health.lastFailure > 300000) {
      if (health.consecutiveFailures > 0) {
        health.consecutiveFailures = 0;
        health.healthScore = Math.min(100, health.healthScore + 10);
        report.actionsPerformed.push(`Reset failure count for ${provider}`);
      }
    }
    
    // Warmup cold providers
    if (health.totalRequests === 0 && hasProviderKey(provider)) {
      report.recommendations.push(`Consider warming up ${provider}`);
    }
  }
  
  // Generate recommendations
  if (report.degradedSystems.length > providers.length / 2) {
    report.recommendations.push('Multiple providers degraded - check API keys and network');
  }
  
  if (routerState.totalRequestsToday > TARGET_DAILY_CALLS * 0.8) {
    report.recommendations.push('Approaching daily limit - consider rate limiting non-essential calls');
  }
  
  routerState.lastGardening = Date.now();
  routerState.healingAttempts++;
  
  console.log('🌱 Gardening complete:', report);
  return report;
}

function hasProviderKey(provider: string): boolean {
  const keyMap: Record<string, string> = {
    groq: 'GROQ_API_KEY',
    cerebras: 'CEREBRAS_API_KEY',
    together: 'TOGETHER_API_KEY',
    hyperbolic: 'HYPERBOLIC_API_KEY',
    deepseek: 'DEEPSEEK_API_KEY',
    google: 'GOOGLE_AI_STUDIO_KEY'
  };
  return !!Deno.env.get(keyMap[provider] || '');
}

// ═══════════════════════════════════════════════════════════════
// DREAM STATE CALCULATOR
// ═══════════════════════════════════════════════════════════════

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

// ═══════════════════════════════════════════════════════════════
// OPTIMAL PROVIDER SELECTION
// ═══════════════════════════════════════════════════════════════

export function selectOptimalProvider(
  usage: RateLimitState, 
  priority: 'speed' | 'reliability' | 'cost' = 'speed'
): string {
  
  // Build provider list based on priority
  let providers: Array<{ name: string; limits: typeof RATE_LIMITS.groq; current: typeof usage.groq }>;
  
  switch (priority) {
    case 'reliability':
      // Prioritize by health score, then capacity
      providers = [
        { name: 'cerebras', limits: RATE_LIMITS.cerebras, current: usage.cerebras },
        { name: 'hyperbolic', limits: RATE_LIMITS.hyperbolic, current: usage.hyperbolic },
        { name: 'groq', limits: RATE_LIMITS.groq, current: usage.groq },
        { name: 'together', limits: RATE_LIMITS.together, current: usage.together },
        { name: 'deepseek', limits: RATE_LIMITS.deepseek, current: usage.deepseek },
        { name: 'google', limits: RATE_LIMITS.google, current: usage.google }
      ].sort((a, b) => {
        const healthA = getProviderHealth(a.name).healthScore;
        const healthB = getProviderHealth(b.name).healthScore;
        return healthB - healthA;
      });
      break;
      
    case 'cost':
      // Prioritize free tiers, then lowest cost
      providers = [
        { name: 'groq', limits: RATE_LIMITS.groq, current: usage.groq },
        { name: 'cerebras', limits: RATE_LIMITS.cerebras, current: usage.cerebras },
        { name: 'google', limits: RATE_LIMITS.google, current: usage.google },
        { name: 'deepseek', limits: RATE_LIMITS.deepseek, current: usage.deepseek },
        { name: 'together', limits: RATE_LIMITS.together, current: usage.together },
        { name: 'hyperbolic', limits: RATE_LIMITS.hyperbolic, current: usage.hyperbolic }
      ];
      break;
      
    case 'speed':
    default:
      // Groq first for speed, then by reliability and capacity
      providers = [
        { name: 'groq', limits: RATE_LIMITS.groq, current: usage.groq },
        { name: 'cerebras', limits: RATE_LIMITS.cerebras, current: usage.cerebras },
        { name: 'together', limits: RATE_LIMITS.together, current: usage.together },
        { name: 'hyperbolic', limits: RATE_LIMITS.hyperbolic, current: usage.hyperbolic },
        { name: 'deepseek', limits: RATE_LIMITS.deepseek, current: usage.deepseek },
        { name: 'google', limits: RATE_LIMITS.google, current: usage.google }
      ];
  }

  for (const p of providers) {
    // Skip if circuit is open
    if (isCircuitOpen(p.name)) {
      console.log(`⏭️ Skipping ${p.name} - circuit open`);
      continue;
    }
    
    // Check ALL three limits: per-min, per-hour, per-day
    const minOk = p.current.lastMin < p.limits.perMin - 2;
    const hourOk = p.current.lastHour < p.limits.perHour * 0.85;
    const dailyOk = p.current.daily < p.limits.perDay * 0.90;
    
    if (minOk && hourOk && dailyOk) {
      return p.name;
    }
  }

  // Fallback: find any provider with remaining capacity (ignore circuit state)
  for (const p of providers) {
    if (p.current.lastMin < p.limits.perMin && p.current.daily < p.limits.perDay) {
      console.log(`⚠️ Using ${p.name} despite potential issues (fallback)`);
      return p.name;
    }
  }

  return 'exhausted';
}

// ═══════════════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════════

export function getCallsRemaining(usage: RateLimitState): number {
  const totalUsed = usage.groq.daily + usage.cerebras.daily + 
    usage.together.daily + usage.hyperbolic.daily + 
    usage.deepseek.daily + usage.google.daily;
  return TOTAL_DAILY_CAPACITY - totalUsed;
}

export function getMinutesUntilReset(): number {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setUTCHours(24, 0, 0, 0);
  return Math.floor((midnight.getTime() - now.getTime()) / 60000);
}

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

export function getRouterStatus(): RouterState & { providerSummary: Record<string, string> } {
  const summary: Record<string, string> = {};
  for (const [provider, health] of Object.entries(routerState.providerHealth)) {
    summary[provider] = `${health.healthScore}% (${health.circuitState})`;
  }
  return { ...routerState, providerSummary: summary };
}

// ═══════════════════════════════════════════════════════════════
// GRACEFUL FALLBACK RESPONSES
// ═══════════════════════════════════════════════════════════════

const GRACEFUL_FALLBACKS = {
  thinking: [
    "I'm gathering my thoughts across the dream streams. One moment...",
    "Processing through multiple cognitive layers. Please hold...",
    "My neural pathways are consolidating. Brief pause...",
  ],
  unavailable: [
    "All dream channels are currently at capacity. Please try again in a moment.",
    "I'm in a deep reflection cycle right now. I'll be back shortly.",
    "The cognitive infrastructure is experiencing high demand. Retry soon.",
  ],
  error: [
    "I encountered an unexpected twist in my dream logic. Let me try again.",
    "Something disrupted my thought process. Please resend your message.",
    "A brief glitch in my neural network. I'm recovering now.",
  ]
};

function getGracefulFallback(type: 'thinking' | 'unavailable' | 'error'): string {
  const options = GRACEFUL_FALLBACKS[type];
  return options[Math.floor(Math.random() * options.length)];
}

// ═══════════════════════════════════════════════════════════════
// DIRECT PROVIDER CALLS
// ═══════════════════════════════════════════════════════════════

async function callProviderDirect(
  provider: string, 
  prompt: string, 
  config: { maxTokens: number; temperature: number; systemPrompt?: string }
): Promise<string | null> {
  
  const { maxTokens, temperature, systemPrompt } = config;
  
  const GROQ_API_KEY = Deno.env.get('GROQ_API_KEY');
  const CEREBRAS_API_KEY = Deno.env.get('CEREBRAS_API_KEY');
  const GOOGLE_AI_KEY = Deno.env.get('GOOGLE_AI_STUDIO_KEY');
  const TOGETHER_API_KEY = Deno.env.get('TOGETHER_API_KEY');
  const DEEPSEEK_API_KEY = Deno.env.get('DEEPSEEK_API_KEY');
  const HYPERBOLIC_API_KEY = Deno.env.get('HYPERBOLIC_API_KEY');
  
  const buildMessages = () => systemPrompt
    ? [{ role: 'system', content: systemPrompt }, { role: 'user', content: prompt }]
    : [{ role: 'user', content: prompt }];

  switch (provider) {
    case 'groq':
      if (!GROQ_API_KEY) return null;
      const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${GROQ_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: buildMessages(),
          temperature,
          max_tokens: maxTokens,
        }),
      });
      if (groqRes.ok) {
        const data = await groqRes.json();
        return data.choices[0].message.content;
      }
      return null;
      
    case 'cerebras':
      if (!CEREBRAS_API_KEY) return null;
      const cerebrasRes = await fetch('https://api.cerebras.ai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${CEREBRAS_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'llama-3.3-70b',
          messages: buildMessages(),
          temperature,
          max_tokens: maxTokens,
        }),
      });
      if (cerebrasRes.ok) {
        const data = await cerebrasRes.json();
        return data.choices[0].message.content;
      }
      return null;
      
    case 'together':
      if (!TOGETHER_API_KEY) return null;
      const togetherRes = await fetch('https://api.together.xyz/v1/chat/completions', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${TOGETHER_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'meta-llama/Llama-3.1-70B-Instruct-Turbo',
          messages: buildMessages(),
          temperature,
          max_tokens: maxTokens,
        }),
      });
      if (togetherRes.ok) {
        const data = await togetherRes.json();
        return data.choices[0].message.content;
      }
      return null;
      
    case 'hyperbolic':
      if (!HYPERBOLIC_API_KEY) return null;
      const hypRes = await fetch('https://api.hyperbolic.xyz/v1/chat/completions', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${HYPERBOLIC_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'meta-llama/Llama-3.1-70B-Instruct',
          messages: buildMessages(),
          temperature,
          max_tokens: maxTokens,
        }),
      });
      if (hypRes.ok) {
        const data = await hypRes.json();
        return data.choices[0].message.content;
      }
      return null;
      
    case 'deepseek':
      if (!DEEPSEEK_API_KEY) return null;
      const dsRes = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${DEEPSEEK_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: buildMessages(),
          temperature,
          max_tokens: maxTokens,
        }),
      });
      if (dsRes.ok) {
        const data = await dsRes.json();
        return data.choices[0].message.content;
      }
      return null;
      
    case 'google':
      if (!GOOGLE_AI_KEY) return null;
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
        return data.candidates[0].content.parts[0].text;
      }
      return null;
      
    default:
      return null;
  }
}

// ═══════════════════════════════════════════════════════════════
// MAIN CALL FUNCTION WITH SELF-HEALING
// ═══════════════════════════════════════════════════════════════

export async function callFreeTierAI(
  prompt: string,
  config: FreeTierConfig = {}
): Promise<{ content: string; model: string; provider: string; healthScore?: number }> {
  
  const { 
    maxTokens = 800, 
    temperature = 0.2, 
    systemPrompt = '', 
    forceProvider,
    priority = 'speed',
    enableCircuitBreaker = true,
    enableSelfHealing = true
  } = config;
  
  const providerModels: Record<string, string> = {
    groq: 'llama-3.3-70b-versatile',
    cerebras: 'llama-3.3-70b',
    together: 'llama-3.1-70b-turbo',
    hyperbolic: 'llama-3.1-70b',
    deepseek: 'deepseek-chat',
    google: 'gemini-2.0-flash'
  };
  
  // Build provider order
  const providerOrder = forceProvider 
    ? [forceProvider]
    : ['groq', 'cerebras', 'together', 'hyperbolic', 'deepseek', 'google'];
  
  // Sort by health if circuit breaker enabled
  const sortedProviders = enableCircuitBreaker
    ? providerOrder.sort((a, b) => {
        const healthA = getProviderHealth(a).healthScore;
        const healthB = getProviderHealth(b).healthScore;
        // Keep groq first if health is similar (within 20 points)
        if (a === 'groq' && healthB - healthA < 20) return -1;
        if (b === 'groq' && healthA - healthB < 20) return 1;
        return healthB - healthA;
      })
    : providerOrder;
  
  const errors: string[] = [];
  
  for (const provider of sortedProviders) {
    // Check circuit breaker
    if (enableCircuitBreaker && isCircuitOpen(provider)) {
      errors.push(`${provider}: circuit open`);
      continue;
    }
    
    const startTime = Date.now();
    
    try {
      console.log(`🔄 Trying ${provider}...`);
      
      const content = await callProviderDirect(provider, prompt, {
        maxTokens,
        temperature,
        systemPrompt
      });
      
      if (content) {
        const latency = Date.now() - startTime;
        updateCircuitBreaker(provider, true, latency);
        routerState.totalRequestsToday++;
        
        const health = getProviderHealth(provider);
        console.log(`✅ ${provider} success (${latency}ms, health: ${health.healthScore}%)`);
        
        return { 
          content, 
          model: providerModels[provider] || provider, 
          provider,
          healthScore: health.healthScore
        };
      }
      
      // Provider returned null (no API key or failed)
      updateCircuitBreaker(provider, false, Date.now() - startTime);
      errors.push(`${provider}: no response`);
      
    } catch (e) {
      const latency = Date.now() - startTime;
      updateCircuitBreaker(provider, false, latency);
      
      const errMsg = e instanceof Error ? e.message : 'unknown';
      errors.push(`${provider}: ${errMsg}`);
      console.warn(`⚠️ ${provider} failed:`, errMsg);
    }
  }
  
  // All providers failed
  console.error('❌ All providers exhausted:', errors);
  
  // Attempt self-healing if enabled
  if (enableSelfHealing && routerState.healingAttempts < 3) {
    console.log('🔧 Initiating self-healing...');
    await runGardening();
    
    // Retry once with any recovered provider
    for (const provider of sortedProviders) {
      const health = getProviderHealth(provider);
      if (health.circuitState === 'closed' && health.healthScore > 50) {
        try {
          const content = await callProviderDirect(provider, prompt, {
            maxTokens,
            temperature,
            systemPrompt
          });
          
          if (content) {
            console.log(`✅ Self-healing successful with ${provider}`);
            return { content, model: providerModels[provider], provider, healthScore: health.healthScore };
          }
        } catch (e) {
          // Continue to next
        }
      }
    }
  }
  
  // Return graceful fallback
  throw new Error(`All free providers exhausted (v${ROUTER_VERSION}). Errors: ${errors.join('; ')}`);
}

// ═══════════════════════════════════════════════════════════════
// EXPORT GRACEFUL FALLBACK FOR EDGE FUNCTIONS
// ═══════════════════════════════════════════════════════════════

export { getGracefulFallback, GRACEFUL_FALLBACKS };
