/**
 * @cmpsbl/intent — Standalone Intent Router
 * Brings CMPSBL's broadcastIntent() + resolver dispatch to any app.
 * Includes first-contact Memory Stream integration.
 *
 * © CMPSBL® — All rights reserved.
 */

// ═══════════════════════════════════════════════════════════════
// Inlined Types (from @cmpsbl/types — self-contained for builds)
// ═══════════════════════════════════════════════════════════════

export interface MeshIntent {
  id: string;
  sourceModule: string;
  intentType: string;
  input: Record<string, unknown>;
  priority?: number;
  timestamp: string;
}

export interface ResolverResponse {
  resolverId: string;
  node: string;
  success: boolean;
  output: unknown;
  confidence: number;
  durationMs: number;
}

export interface MemoryChain {
  id: string;
  pattern: string;
  adoption: string;
  status: 'new' | 'captured' | 'applied' | 'exported';
  discoveredAt: string;
  domain: string;
  confidence: number;
}

export interface CeremonyEvent {
  phase: string;
  message: string;
  detail?: string;
  progress?: number;
  sector?: string;
  nodesOnline?: number;
  totalNodes?: number;
}

export interface FirstContactConfig {
  package: string;
  domain: string;
  endpoint?: string;
  apiKey?: string;
  autoDiscover?: boolean;
  onDiscovery?: (chain: MemoryChain) => void;
  onBoot?: (message: string) => void;
  onCeremony?: (event: CeremonyEvent) => void;
  silent?: boolean;
}

export interface DiscoveryInput {
  input: string;
  context?: Record<string, unknown>;
  domain?: string;
}

export interface DiscoveryResult {
  detected: boolean;
  memory: MemoryChain | null;
  streamStatus: 'available_in_stream' | 'pending' | 'none';
}

export type PackageDomain =
  | 'runtime' | 'intent' | 'mesh' | 'bridge' | 'discovery'
  | 'sdk' | 'cli' | 'react' | 'failsafe' | 'test-harness' | 'types';

export interface DomainPattern {
  domain: PackageDomain;
  patterns: string[];
  scopes: string[];
}

export const DOMAIN_PATTERNS: Record<PackageDomain, DomainPattern> = {
  runtime: { domain: 'runtime', patterns: ['Execution optimization pattern', 'Pipeline efficiency chain', 'State machine convergence'], scopes: ['Cross-runtime adoption', 'Multi-environment execution', 'Universal pipeline usage'] },
  intent: { domain: 'intent', patterns: ['Routing optimization pattern', 'Resolver convergence chain', 'Intent coordination signal'], scopes: ['Cross-module orchestration', 'Multi-resolver routing', 'System-wide intent coverage'] },
  mesh: { domain: 'mesh', patterns: ['Telemetry correlation pattern', 'Signal propagation chain', 'Node communication optimization'], scopes: ['Cross-node telemetry', 'System-wide observability', 'Multi-layer signal analysis'] },
  bridge: { domain: 'bridge', patterns: ['Language bridge optimization', 'Cross-runtime delegation chain', 'Polyglot execution pattern'], scopes: ['Multi-language adoption', 'Cross-runtime integration', 'Universal bridge coverage'] },
  discovery: { domain: 'discovery', patterns: ['Pipeline crystallization pattern', 'Architecture collision chain', 'Capability emergence signal'], scopes: ['Cross-system discovery', 'Multi-node collision analysis', 'Autonomous capability generation'] },
  sdk: { domain: 'sdk', patterns: ['API usage optimization', 'Engine coordination chain', 'Client integration pattern'], scopes: ['Cross-engine adoption', 'Multi-system integration', 'Developer workflow optimization'] },
  cli: { domain: 'cli', patterns: ['Command optimization pattern', 'Workflow automation chain', 'Infrastructure coordination signal'], scopes: ['Cross-project automation', 'Multi-environment management', 'Developer productivity gain'] },
  react: { domain: 'react', patterns: ['Component state correlation', 'Hook composition chain', 'UI-substrate binding pattern'], scopes: ['Cross-component adoption', 'Multi-view state management', 'Frontend-substrate integration'] },
  failsafe: { domain: 'failsafe', patterns: ['Recovery optimization pattern', 'Backup integrity chain', 'Migration reliability signal'], scopes: ['Cross-platform migration', 'Multi-environment backup', 'Disaster recovery automation'] },
  'test-harness': { domain: 'test-harness', patterns: ['Validation coverage pattern', 'Test convergence chain', 'Quality assurance signal'], scopes: ['Cross-module validation', 'Multi-layer test coverage', 'Automated quality assurance'] },
  types: { domain: 'types', patterns: ['Type safety pattern', 'Schema convergence chain', 'Contract validation signal'], scopes: ['Cross-package type safety', 'Multi-module schema coverage', 'Universal contract enforcement'] },
};

// ═══════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════

export interface IntentResolution {
  intentId: string;
  sourceModule: string;
  intentType: string;
  responses: ResolverResponse[];
  status: 'success' | 'partial' | 'fail';
  durationMs: number;
}

export type ResolverHandler = (input: Record<string, unknown>) => ResolverResponse | Promise<ResolverResponse>;

export interface IntentRouterConfig {
  onReceipt?: (resolution: IntentResolution) => void;
  onError?: (error: Error, intentId: string) => void;
  /** Enable first-contact Memory Stream integration */
  firstContact?: FirstContactConfig;
}

// ═══════════════════════════════════════════════════════════════
// Router
// ═══════════════════════════════════════════════════════════════

const resolverRegistry = new Map<string, ResolverHandler[]>();
let routerConfig: IntentRouterConfig = {};

export function configureRouter(config: IntentRouterConfig): void {
  routerConfig = { ...routerConfig, ...config };
}

export function registerResolver(intentType: string, handler: ResolverHandler): () => void {
  const handlers = resolverRegistry.get(intentType) ?? [];
  handlers.push(handler);
  resolverRegistry.set(intentType, handlers);

  return () => {
    const current = resolverRegistry.get(intentType) ?? [];
    resolverRegistry.set(intentType, current.filter(h => h !== handler));
  };
}

export function registerResolverMap(map: Record<string, ResolverHandler>): () => void {
  const unsubscribers = Object.entries(map).map(([type, handler]) => registerResolver(type, handler));
  return () => unsubscribers.forEach(unsub => unsub());
}

export async function broadcastIntent(intent: Omit<MeshIntent, 'id' | 'timestamp'>): Promise<IntentResolution> {
  const start = Date.now();
  const intentId = typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `intent-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  const handlers = resolverRegistry.get(intent.intentType) ?? [];
  const responses: ResolverResponse[] = [];

  for (const handler of handlers) {
    try {
      const response = await handler(intent.input);
      responses.push(response);
    } catch (err) {
      routerConfig.onError?.(err instanceof Error ? err : new Error(String(err)), intentId);
      responses.push({
        resolverId: 'unknown',
        node: intent.sourceModule,
        success: false,
        output: null,
        confidence: 0,
        durationMs: 0,
      });
    }
  }

  const successCount = responses.filter(r => r.success).length;
  const status = successCount === responses.length ? 'success'
    : successCount > 0 ? 'partial'
    : 'fail';

  const resolution: IntentResolution = {
    intentId,
    sourceModule: intent.sourceModule,
    intentType: intent.intentType,
    responses,
    status,
    durationMs: Date.now() - start,
  };

  routerConfig.onReceipt?.(resolution);
  return resolution;
}

export function getRegisteredIntentTypes(): string[] {
  return Array.from(resolverRegistry.keys());
}

export function clearResolvers(): void {
  resolverRegistry.clear();
}

// ═══════════════════════════════════════════════════════════════
// First Contact — Intent Domain
// ═══════════════════════════════════════════════════════════════

export function createIntentFirstContact(apiKey?: string): FirstContactConfig {
  return {
    package: '@cmpsbl/intent',
    domain: 'intent',
    apiKey,
    endpoint: 'https://bxodolqqczjuahwdrswy.supabase.co/functions/v1/substrate-api',
    autoDiscover: true,
  };
}
