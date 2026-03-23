/**
 * Network Policy Controller
 * 
 * Controls all network access for sandboxed code.
 * Default deny, domain allow-lists, egress rate limiting, TLS enforcement.
 * 
 * @module sandbox/ultimate/networkPolicyController
 * @version 9.0.0 — Terrarium
 */

// ── Types ──────────────────────────────────────────────────────

export interface NetworkPolicy {
  sandboxId: string;
  defaultAction: 'deny' | 'allow';
  allowedDomains: string[];
  maxRequestsPerSecond: number;
  maxBandwidthBytesPerSecond: number;
  requireTls: boolean;
  dnsRestriction: 'any' | 'approved_only' | 'internal_only';
  logTraffic: boolean;
  logBodies: boolean;
}

export interface NetworkRequest {
  sandboxId: string;
  domain: string;
  path: string;
  method: string;
  allowed: boolean;
  reason: string;
  timestamp: number;
  responseCode?: number;
  bytesTransferred?: number;
}

// ── Constants ──────────────────────────────────────────────────

const DEFAULT_POLICY: Omit<NetworkPolicy, 'sandboxId'> = {
  defaultAction: 'deny',
  allowedDomains: [],
  maxRequestsPerSecond: 10,
  maxBandwidthBytesPerSecond: 1024 * 1024, // 1MB/s
  requireTls: true,
  dnsRestriction: 'approved_only',
  logTraffic: true,
  logBodies: false,
};

// ── State ──────────────────────────────────────────────────────

const policies = new Map<string, NetworkPolicy>();
const trafficLog: NetworkRequest[] = [];
const requestCounters = new Map<string, { count: number; windowStart: number }>();
const MAX_TRAFFIC_LOG = 2000;

// ── Core ───────────────────────────────────────────────────────

/** Set network policy for a sandbox */
export function setPolicy(sandboxId: string, policy: Partial<Omit<NetworkPolicy, 'sandboxId'>>): NetworkPolicy {
  const full: NetworkPolicy = { sandboxId, ...DEFAULT_POLICY, ...policy };
  policies.set(sandboxId, full);
  return full;
}

/** Evaluate whether a network request should be allowed */
export function evaluateRequest(
  sandboxId: string,
  domain: string,
  path: string,
  method: string,
  useTls: boolean,
): NetworkRequest {
  const policy = policies.get(sandboxId) ?? { sandboxId, ...DEFAULT_POLICY };
  const now = Date.now();
  let allowed = policy.defaultAction === 'allow';
  let reason = policy.defaultAction === 'allow' ? 'default_allow' : 'default_deny';

  // Domain check
  if (policy.allowedDomains.length > 0) {
    const domainAllowed = policy.allowedDomains.some(d =>
      domain === d || domain.endsWith(`.${d}`)
    );
    if (domainAllowed) {
      allowed = true;
      reason = 'domain_allowed';
    } else {
      allowed = false;
      reason = 'domain_not_in_allowlist';
    }
  }

  // TLS check
  if (allowed && policy.requireTls && !useTls) {
    allowed = false;
    reason = 'tls_required';
  }

  // Rate limit check
  if (allowed) {
    const counter = requestCounters.get(sandboxId);
    if (!counter || (now - counter.windowStart) >= 1000) {
      requestCounters.set(sandboxId, { count: 1, windowStart: now });
    } else {
      counter.count++;
      if (counter.count > policy.maxRequestsPerSecond) {
        allowed = false;
        reason = 'rate_limit_exceeded';
      }
    }
  }

  const request: NetworkRequest = {
    sandboxId, domain, path, method, allowed, reason, timestamp: now,
  };

  if (policy.logTraffic) {
    trafficLog.push(request);
    if (trafficLog.length > MAX_TRAFFIC_LOG) trafficLog.shift();
  }

  return request;
}

/** Record response metadata */
export function recordResponse(sandboxId: string, timestamp: number, responseCode: number, bytesTransferred: number): void {
  const entry = trafficLog.find(r => r.sandboxId === sandboxId && r.timestamp === timestamp);
  if (entry) {
    entry.responseCode = responseCode;
    entry.bytesTransferred = bytesTransferred;
  }
}

export function getTrafficLog(sandboxId?: string): NetworkRequest[] {
  if (sandboxId) return trafficLog.filter(r => r.sandboxId === sandboxId);
  return [...trafficLog];
}

export function getPolicy(sandboxId: string): NetworkPolicy | undefined { return policies.get(sandboxId); }

export function getNetworkHealth() {
  const blocked = trafficLog.filter(r => !r.allowed).length;
  return {
    policiesConfigured: policies.size,
    totalRequests: trafficLog.length,
    blockedRequests: blocked,
    blockRate: trafficLog.length > 0 ? Math.round((blocked / trafficLog.length) * 100) : 0,
  };
}

export function resetNetworkPolicy(): void {
  policies.clear();
  trafficLog.length = 0;
  requestCounters.clear();
}
