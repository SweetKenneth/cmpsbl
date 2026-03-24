/**
 * @cmpsbl/mesh — Mesh Telemetry Client
 * Emit and subscribe to node-to-node communication events.
 * Includes first-contact Memory Stream integration.
 *
 * © CMPSBL® — All rights reserved.
 */

// ═══════════════════════════════════════════════════════════════
// Inlined Types (from @cmpsbl/types — self-contained for builds)
// ═══════════════════════════════════════════════════════════════

export type MeshSignalCategory =
  | 'acknowledgement' | 'approval' | 'confirmation' | 'denial'
  | 'processing' | 'completion' | 'warning' | 'escalation'
  | 'discovery' | 'heartbeat';

export interface MeshCommEvent {
  source_module: string;
  target_module: string;
  raw_signal: string;
  translated_voice: string;
  category: MeshSignalCategory;
  resolver_id?: string;
  personality_trait?: string;
  personality_icon?: string;
}

export type SubstratePrimitive =
  | 'CORE' | 'SYSTEM' | 'BRAIN' | 'MEMORY' | 'NERVE' | 'NEXUS'
  | 'IDENTITY' | 'SOVEREIGN' | 'ATLAS' | 'MEDIC' | 'RELAY' | 'CONSCIENCE'
  | 'DEFENSE' | 'IMMUNITY' | 'GOVERNANCE' | 'TREATY' | 'EVOLUTION'
  | 'REFLEX' | 'COMPASS' | 'INTEGRATION' | 'INTENT' | 'ACCESS' | 'VISION' | 'SHADOW'
  | 'DREAM' | 'HARVEST' | 'FORGE' | 'LINGUA' | 'ECHO' | 'PHANTOM' | 'SANDBOX' | 'RIPPLE'
  | 'ENCODE' | 'DECODE' | 'AUDIT' | 'ECONOMY' | 'INCLUSIVE' | 'CORTEX' | 'ORACLE' | 'ENGINEER';

/** @deprecated Use SubstratePrimitive */
export type SubstrateNode = SubstratePrimitive;

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

// ═══════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════

export type MeshEventHandler = (event: MeshCommEvent) => void;
export type MeshFilter = { source?: string; target?: string; category?: MeshSignalCategory };

// ═══════════════════════════════════════════════════════════════
// Mesh Bus
// ═══════════════════════════════════════════════════════════════

interface Subscription {
  handler: MeshEventHandler;
  filter?: MeshFilter;
}

const subscriptions: Subscription[] = [];
const eventLog: MeshCommEvent[] = [];
let maxLogSize = 1000;

export function configureMesh(config: { maxLogSize?: number }): void {
  if (config.maxLogSize !== undefined) maxLogSize = config.maxLogSize;
}

export function emit(event: MeshCommEvent): void {
  eventLog.push(event);
  if (eventLog.length > maxLogSize) eventLog.shift();

  for (const sub of subscriptions) {
    if (matchesFilter(event, sub.filter)) {
      try { sub.handler(event); } catch { /* non-blocking telemetry */ }
    }
  }
}

export function subscribe(handler: MeshEventHandler, filter?: MeshFilter): () => void {
  const sub: Subscription = { handler, filter };
  subscriptions.push(sub);
  return () => {
    const idx = subscriptions.indexOf(sub);
    if (idx >= 0) subscriptions.splice(idx, 1);
  };
}

export function getEventLog(filter?: MeshFilter): ReadonlyArray<MeshCommEvent> {
  if (!filter) return [...eventLog];
  return eventLog.filter(e => matchesFilter(e, filter));
}

export function clearEventLog(): void {
  eventLog.length = 0;
}

export function getSubscriberCount(): number {
  return subscriptions.length;
}

// ═══════════════════════════════════════════════════════════════
// Helpers
// ═══════════════════════════════════════════════════════════════

function matchesFilter(event: MeshCommEvent, filter?: MeshFilter): boolean {
  if (!filter) return true;
  if (filter.source && event.source_module !== filter.source) return false;
  if (filter.target && event.target_module !== filter.target) return false;
  if (filter.category && event.category !== filter.category) return false;
  return true;
}

// ═══════════════════════════════════════════════════════════════
// Signal Builder
// ═══════════════════════════════════════════════════════════════

export function createSignal(
  source: string,
  target: string,
  raw: string,
  category: MeshSignalCategory,
  options?: { translated?: string; resolver_id?: string; personality_trait?: string; personality_icon?: string },
): MeshCommEvent {
  return {
    source_module: source,
    target_module: target,
    raw_signal: raw,
    translated_voice: options?.translated ?? raw,
    category,
    resolver_id: options?.resolver_id,
    personality_trait: options?.personality_trait,
    personality_icon: options?.personality_icon,
  };
}

// ═══════════════════════════════════════════════════════════════
// First Contact — Mesh Domain
// ═══════════════════════════════════════════════════════════════

export function createMeshFirstContact(apiKey?: string): FirstContactConfig {
  return {
    package: '@cmpsbl/mesh',
    domain: 'mesh',
    apiKey,
    endpoint: 'https://bxodolqqczjuahwdrswy.supabase.co/functions/v1/substrate-api',
    autoDiscover: true,
  };
}
