/**
 * NEXUS — Provider Capability Matrix
 * Registry mapping each provider's supported features for constraint-aware routing.
 * 
 * Rate limits updated 2026-03-24 from official provider documentation.
 * Values reflect ACTUAL free-tier limits (not the 65% substrate allocation).
 */

export type ProviderCapability =
  | 'text-completion'
  | 'chat'
  | 'vision'
  | 'function-calling'
  | 'json-mode'
  | 'streaming'
  | 'embeddings'
  | 'code-generation'
  | 'long-context'
  | 'image-generation';

export interface ProviderProfile {
  providerId: string;
  displayName: string;
  capabilities: Set<ProviderCapability>;
  maxContextTokens: number;
  maxOutputTokens: number;
  supportsStreaming: boolean;
  tier: 'free' | 'paid' | 'premium';
  models: string[];
  rateLimitRPM: number;
  rateLimitTPM: number;
  rateLimitRPD: number;
}

const registry = new Map<string, ProviderProfile>();

// Built-in free-tier fleet — researched 2026-03-24
const BUILT_IN_PROVIDERS: ProviderProfile[] = [
  {
    providerId: 'groq-8b',
    displayName: 'Groq (8B Fast)',
    capabilities: new Set(['text-completion', 'chat', 'streaming', 'json-mode', 'code-generation']),
    maxContextTokens: 131072,
    maxOutputTokens: 8192,
    supportsStreaming: true,
    tier: 'free',
    models: ['llama-3.1-8b-instant'],
    rateLimitRPM: 30,
    rateLimitTPM: 6000,
    rateLimitRPD: 14400,
  },
  {
    providerId: 'groq',
    displayName: 'Groq (70B)',
    capabilities: new Set(['text-completion', 'chat', 'streaming', 'json-mode', 'code-generation']),
    maxContextTokens: 131072,
    maxOutputTokens: 8192,
    supportsStreaming: true,
    tier: 'free',
    models: ['llama-3.3-70b-versatile'],
    rateLimitRPM: 30,
    rateLimitTPM: 12000,
    rateLimitRPD: 1000,
  },
  {
    providerId: 'cerebras',
    displayName: 'Cerebras',
    capabilities: new Set(['text-completion', 'chat', 'streaming', 'code-generation']),
    maxContextTokens: 8192,
    maxOutputTokens: 4096,
    supportsStreaming: true,
    tier: 'free',
    models: ['llama3.1-8b', 'gpt-oss-120b', 'qwen-3-235b-a22b-instruct-2507'],
    rateLimitRPM: 30,
    rateLimitTPM: 60000,
    rateLimitRPD: 14400,
  },
  {
    providerId: 'google-aistudio',
    displayName: 'Google AI Studio',
    capabilities: new Set(['text-completion', 'chat', 'streaming', 'vision', 'json-mode', 'long-context', 'code-generation']),
    maxContextTokens: 1048576,
    maxOutputTokens: 8192,
    supportsStreaming: true,
    tier: 'free',
    models: ['gemini-2.0-flash', 'gemini-2.5-flash-lite'],
    rateLimitRPM: 10,
    rateLimitTPM: 250000,
    rateLimitRPD: 250,
  },
  {
    providerId: 'deepseek',
    displayName: 'DeepSeek',
    capabilities: new Set(['text-completion', 'chat', 'streaming', 'code-generation', 'function-calling']),
    maxContextTokens: 65536,
    maxOutputTokens: 8192,
    supportsStreaming: true,
    tier: 'free',
    models: ['deepseek-chat'],
    rateLimitRPM: 60,
    rateLimitTPM: 200000,
    rateLimitRPD: 50000,
  },
  {
    providerId: 'together',
    displayName: 'Together AI',
    capabilities: new Set(['text-completion', 'chat', 'streaming', 'code-generation']),
    maxContextTokens: 131072,
    maxOutputTokens: 8192,
    supportsStreaming: true,
    tier: 'free',
    models: ['meta-llama/Llama-3.3-70B-Instruct-Turbo'],
    rateLimitRPM: 60,
    rateLimitTPM: 200000,
    rateLimitRPD: 50000,
  },
  {
    providerId: 'openrouter-free',
    displayName: 'OpenRouter (Free)',
    capabilities: new Set(['text-completion', 'chat', 'streaming', 'vision', 'function-calling', 'json-mode']),
    maxContextTokens: 131072,
    maxOutputTokens: 8192,
    supportsStreaming: true,
    tier: 'free',
    models: ['meta-llama/llama-3.3-70b-instruct:free', 'deepseek/deepseek-r1:free', 'qwen/qwen3-235b-a22b:free'],
    rateLimitRPM: 20,
    rateLimitTPM: 200000,
    rateLimitRPD: 50,
  },
  {
    providerId: 'mistral',
    displayName: 'Mistral Studio',
    capabilities: new Set(['text-completion', 'chat', 'streaming', 'code-generation', 'function-calling']),
    maxContextTokens: 32768,
    maxOutputTokens: 8192,
    supportsStreaming: true,
    tier: 'free',
    models: ['mistral-small-latest'],
    rateLimitRPM: 2,
    rateLimitTPM: 500000,
    rateLimitRPD: 2880,
  },
  {
    providerId: 'cohere',
    displayName: 'Cohere (Trial)',
    capabilities: new Set(['text-completion', 'chat', 'streaming', 'embeddings']),
    maxContextTokens: 128000,
    maxOutputTokens: 4096,
    supportsStreaming: true,
    tier: 'free',
    models: ['command-r-plus', 'command-r'],
    rateLimitRPM: 20,
    rateLimitTPM: 100000,
    rateLimitRPD: 33,
  },
  {
    providerId: 'hyperbolic',
    displayName: 'Hyperbolic',
    capabilities: new Set(['text-completion', 'chat', 'streaming']),
    maxContextTokens: 8192,
    maxOutputTokens: 4096,
    supportsStreaming: true,
    tier: 'free',
    models: ['meta-llama/Llama-3.1-70B-Instruct'],
    rateLimitRPM: 30,
    rateLimitTPM: 100000,
    rateLimitRPD: 5000,
  },
  {
    providerId: 'sambanova',
    displayName: 'SambaNova',
    capabilities: new Set(['text-completion', 'chat', 'streaming']),
    maxContextTokens: 8192,
    maxOutputTokens: 4096,
    supportsStreaming: true,
    tier: 'free',
    models: ['Meta-Llama-3.3-70B-Instruct'],
    rateLimitRPM: 20,
    rateLimitTPM: 100000,
    rateLimitRPD: 20,
  },
];

export function initCapabilityMatrix(): void {
  for (const p of BUILT_IN_PROVIDERS) {
    registry.set(p.providerId, p);
  }
}

export function getProviderProfile(providerId: string): ProviderProfile | undefined {
  return registry.get(providerId);
}

export function registerProvider(profile: ProviderProfile): void {
  registry.set(profile.providerId, profile);
}

export function findProvidersByCapability(
  required: ProviderCapability[],
  minContextTokens = 0
): ProviderProfile[] {
  return Array.from(registry.values()).filter(p => {
    const hasAllCaps = required.every(cap => p.capabilities.has(cap));
    const hasContext = p.maxContextTokens >= minContextTokens;
    return hasAllCaps && hasContext;
  });
}

export function findBestProvider(
  required: ProviderCapability[],
  preferTier: 'free' | 'paid' | 'premium' = 'free'
): ProviderProfile | undefined {
  const candidates = findProvidersByCapability(required);
  const tierOrder = { free: 0, paid: 1, premium: 2 };
  const preferIdx = tierOrder[preferTier];

  return candidates.sort((a, b) => {
    const da = Math.abs(tierOrder[a.tier] - preferIdx);
    const db = Math.abs(tierOrder[b.tier] - preferIdx);
    if (da !== db) return da - db;
    return b.maxContextTokens - a.maxContextTokens;
  })[0];
}

export function listAllProviders(): ProviderProfile[] {
  return Array.from(registry.values());
}

// Auto-init
initCapabilityMatrix();
