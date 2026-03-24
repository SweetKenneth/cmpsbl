/**
 * @cmpsbl/intent — Standalone Intent Router
 * Brings CMPSBL's broadcastIntent() + resolver dispatch to any app.
 * Includes first-contact Memory Stream integration.
 *
 * © CMPSBL® — All rights reserved.
 */

import type { MeshIntent, ResolverResponse, FirstContactConfig, DiscoveryInput, DiscoveryResult } from '@cmpsbl/types';
import { DOMAIN_PATTERNS } from '@cmpsbl/types';

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

export { DOMAIN_PATTERNS } from '@cmpsbl/types';

export function createIntentFirstContact(apiKey?: string): FirstContactConfig {
  return {
    package: '@cmpsbl/intent',
    domain: 'intent',
    apiKey,
    endpoint: 'https://bxodolqqczjuahwdrswy.supabase.co/functions/v1/substrate-api',
    autoDiscover: true,
  };
}
