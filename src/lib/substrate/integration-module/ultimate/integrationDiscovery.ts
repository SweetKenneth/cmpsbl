/**
 * Integration Discovery & Auto-Connect
 * 
 * Discovers and self-configures new integrations from API specs,
 * manages an integration catalog, and validates connectivity.
 * 
 * @module integration/ultimate/integrationDiscovery
 * @version 9.0.0 — Babel Gate
 */

// ── Types ──────────────────────────────────────────────────────

export interface IntegrationTemplate {
  id: string;
  name: string;
  provider: string;
  specFormat: 'openapi' | 'graphql_sdl' | 'grpc_proto' | 'manual';
  baseUrl: string;
  authType: 'api_key' | 'oauth2' | 'basic' | 'none';
  endpoints: Array<{
    path: string;
    method: string;
    description: string;
  }>;
  capabilities: string[];
  createdAt: number;
  verified: boolean;
}

export interface CapabilityMatch {
  nodeId: string;
  nodeNeed: string;
  integrationId: string;
  matchedCapability: string;
  confidence: number;
}

export interface ConnectivityCheck {
  integrationId: string;
  reachable: boolean;
  latencyMs: number | null;
  authValid: boolean;
  permissionsValid: boolean;
  checkedAt: number;
  errors: string[];
}

// ── State ──────────────────────────────────────────────────────

const catalog = new Map<string, IntegrationTemplate>();
const capabilityMatches: CapabilityMatch[] = [];
const connectivityChecks = new Map<string, ConnectivityCheck>();

// ── Core ───────────────────────────────────────────────────────

/** Import an integration from an OpenAPI/Swagger spec */
export function importFromSpec(
  id: string,
  name: string,
  provider: string,
  baseUrl: string,
  authType: IntegrationTemplate['authType'],
  spec: { paths: Record<string, Record<string, { summary?: string }>> },
): IntegrationTemplate {
  const endpoints: IntegrationTemplate['endpoints'] = [];
  const capabilities: string[] = [];

  for (const [path, methods] of Object.entries(spec.paths)) {
    for (const [method, detail] of Object.entries(methods)) {
      endpoints.push({
        path,
        method: method.toUpperCase(),
        description: detail.summary ?? '',
      });
      // Infer capabilities from path segments
      const segments = path.split('/').filter(Boolean);
      for (const seg of segments) {
        if (!seg.startsWith('{') && !capabilities.includes(seg)) {
          capabilities.push(seg);
        }
      }
    }
  }

  const template: IntegrationTemplate = {
    id, name, provider, baseUrl, authType, endpoints, capabilities,
    specFormat: 'openapi', createdAt: Date.now(), verified: false,
  };
  catalog.set(id, template);
  return template;
}

/** Register a manual integration template */
export function registerTemplate(template: IntegrationTemplate): void {
  catalog.set(template.id, template);
}

/** Match integration capabilities to substrate node needs */
export function matchCapabilities(
  nodeNeeds: Array<{ nodeId: string; need: string }>,
): CapabilityMatch[] {
  const matches: CapabilityMatch[] = [];

  for (const { nodeId, need } of nodeNeeds) {
    const needLower = need.toLowerCase();
    for (const template of catalog.values()) {
      for (const cap of template.capabilities) {
        if (cap.toLowerCase().includes(needLower) || needLower.includes(cap.toLowerCase())) {
          const match: CapabilityMatch = {
            nodeId,
            nodeNeed: need,
            integrationId: template.id,
            matchedCapability: cap,
            confidence: cap.toLowerCase() === needLower ? 1.0 :
              needLower.includes(cap.toLowerCase()) ? 0.7 : 0.5,
          };
          matches.push(match);
        }
      }
    }
  }

  // Sort by confidence descending
  matches.sort((a, b) => b.confidence - a.confidence);
  capabilityMatches.push(...matches);
  return matches;
}

/** Record a connectivity pre-check result */
export function recordConnectivityCheck(check: ConnectivityCheck): void {
  connectivityChecks.set(check.integrationId, check);
}

/** Get connectivity status for an integration */
export function getConnectivityStatus(integrationId: string): ConnectivityCheck | undefined {
  return connectivityChecks.get(integrationId);
}

/** Get catalog */
export function getCatalog(): IntegrationTemplate[] {
  return Array.from(catalog.values());
}

/** Search catalog by capability */
export function searchByCapability(capability: string): IntegrationTemplate[] {
  const lower = capability.toLowerCase();
  return Array.from(catalog.values()).filter(t =>
    t.capabilities.some(c => c.toLowerCase().includes(lower))
  );
}

export function getDiscoveryHealth() {
  return {
    catalogSize: catalog.size,
    verifiedIntegrations: Array.from(catalog.values()).filter(t => t.verified).length,
    capabilityMatchesFound: capabilityMatches.length,
    connectivityChecksRun: connectivityChecks.size,
    healthyConnections: Array.from(connectivityChecks.values()).filter(c => c.reachable && c.authValid).length,
  };
}

export function resetDiscovery(): void {
  catalog.clear();
  capabilityMatches.length = 0;
  connectivityChecks.clear();
}
