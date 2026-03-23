/**
 * NEXUS — Provider Capability Matrix
 * Registry mapping each provider's supported features for constraint-aware routing.
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
}

const registry = new Map<string, ProviderProfile>();

// Built-in free-tier fleet
const BUILT_IN_PROVIDERS: ProviderProfile[] = [
  {
    providerId: 'groq',
    displayName: 'Groq',
    capabilities: new Set(['text-completion', 'chat', 'streaming', 'json-mode', 'code-generation']),
    maxContextTokens: 131072,
    maxOutputTokens: 8192,
    supportsStreaming: true,
    tier: 'free',
    models: ['llama-3.3-70b-versatile', 'llama-3.1-8b-instant', 'gemma2-9b-it'],
    rateLimitRPM: 30,
    rateLimitTPM: 15000,
  },
  {
    providerId: 'cerebras',
    displayName: 'Cerebras',
    capabilities: new Set(['text-completion', 'chat', 'streaming', 'code-generation']),
    maxContextTokens: 8192,
    maxOutputTokens: 4096,
    supportsStreaming: true,
    tier: 'free',
    models: ['llama3.1-8b', 'llama3.1-70b'],
    rateLimitRPM: 30,
    rateLimitTPM: 60000,
  },
  {
    providerId: 'sambanova',
    displayName: 'SambaNova',
    capabilities: new Set(['text-completion', 'chat', 'streaming']),
    maxContextTokens: 8192,
    maxOutputTokens: 4096,
    supportsStreaming: true,
    tier: 'free',
    models: ['Meta-Llama-3.1-8B-Instruct', 'Meta-Llama-3.1-70B-Instruct'],
    rateLimitRPM: 20,
    rateLimitTPM: 100000,
  },
  {
    providerId: 'openrouter-free',
    displayName: 'OpenRouter (Free)',
    capabilities: new Set(['text-completion', 'chat', 'streaming', 'vision', 'function-calling', 'json-mode']),
    maxContextTokens: 131072,
    maxOutputTokens: 8192,
    supportsStreaming: true,
    tier: 'free',
    models: ['google/gemini-2.0-flash-exp:free', 'deepseek/deepseek-r1:free'],
    rateLimitRPM: 20,
    rateLimitTPM: 200000,
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
