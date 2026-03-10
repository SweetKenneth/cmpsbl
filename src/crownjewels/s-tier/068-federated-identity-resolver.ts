/**
 * S-Tier 068 — Federated Identity Resolver
 * CJPI: 93 | Node: IDENTITY | ID: S-IDN02
 *
 * Resolves user/system identity across multiple identity sources.
 * Merges partial identity claims into a unified profile.
 */

export interface IdentityClaim {
  source: string;         // e.g. 'auth', 'session', 'api_key'
  userId: string | null;
  roles: string[];
  attributes: Record<string, unknown>;
  confidence: number;     // 0-1
  expiresAt: number | null;
}

export interface ResolvedIdentity {
  userId: string | null;
  roles: string[];
  attributes: Record<string, unknown>;
  sources: string[];
  confidence: number;
  resolvedAt: string;
}

export function resolveIdentity(claims: IdentityClaim[]): ResolvedIdentity {
  if (claims.length === 0) {
    return { userId: null, roles: [], attributes: {}, sources: [], confidence: 0, resolvedAt: new Date().toISOString() };
  }

  // Filter expired claims
  const now = Date.now();
  const valid = claims.filter(c => !c.expiresAt || c.expiresAt > now);
  if (valid.length === 0) {
    return { userId: null, roles: [], attributes: {}, sources: [], confidence: 0, resolvedAt: new Date().toISOString() };
  }

  // Highest-confidence claim for userId
  const sorted = [...valid].sort((a, b) => b.confidence - a.confidence);
  const userId = sorted.find(c => c.userId)?.userId ?? null;

  // Merge roles (union)
  const roles = [...new Set(valid.flatMap(c => c.roles))];

  // Merge attributes (highest confidence wins per key)
  const attributes: Record<string, unknown> = {};
  for (const claim of sorted) {
    for (const [key, value] of Object.entries(claim.attributes)) {
      if (!(key in attributes)) attributes[key] = value;
    }
  }

  const avgConfidence = valid.reduce((s, c) => s + c.confidence, 0) / valid.length;

  return {
    userId,
    roles,
    attributes,
    sources: valid.map(c => c.source),
    confidence: Math.round(avgConfidence * 100) / 100,
    resolvedAt: new Date().toISOString(),
  };
}
