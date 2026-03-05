/**
 * Revalidation Policies — State-dependent TTL for coalesced responses
 */

export interface RevalidationPolicy {
  pattern: RegExp;           // URL pattern
  ttl_ms: number;            // max age before revalidation required
  state_dependent: boolean;  // if true, requires revalidation token
  description: string;
}

export const DEFAULT_POLICIES: RevalidationPolicy[] = [
  {
    pattern: /\/rest\/v1\//,
    ttl_ms: 5_000,             // DB queries: 5s
    state_dependent: true,
    description: 'Database queries — state-dependent, short TTL',
  },
  {
    pattern: /\/functions\/v1\//,
    ttl_ms: 10_000,            // Edge functions: 10s
    state_dependent: true,
    description: 'Edge function calls — may mutate state',
  },
  {
    pattern: /\/auth\//,
    ttl_ms: 0,                 // Auth: never coalesce
    state_dependent: true,
    description: 'Auth endpoints — never cache',
  },
  {
    pattern: /\/storage\//,
    ttl_ms: 60_000,            // Storage: 1 min
    state_dependent: false,
    description: 'Storage reads — relatively stable',
  },
];

/** Find the matching revalidation policy for a URL */
export function findPolicy(url: string): RevalidationPolicy | null {
  return DEFAULT_POLICIES.find(p => p.pattern.test(url)) ?? null;
}

/** Check if a cached response needs revalidation */
export function needsRevalidation(
  cachedAt: number,
  policy: RevalidationPolicy | null,
  nowMs: number = Date.now()
): boolean {
  if (!policy) return false; // No policy = no revalidation needed
  if (policy.ttl_ms === 0) return true; // Always revalidate
  return nowMs - cachedAt >= policy.ttl_ms;
}
