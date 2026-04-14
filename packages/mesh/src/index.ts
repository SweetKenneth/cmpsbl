/**
 * ┌──────────────────────────────────────────────────────────────┐
 * │  CMPSBL® Mesh — Governed Cognitive Infrastructure           │
 * │  Primitive-to-primitive telemetry & signal substrate.        │
 * │                                                              │
 * │  U.S. Patent App. No. 64/029,678 · 64/031,637               │
 * │  https://cmpsbl.com · npm i @cmpsbl/cli                      │
 * │  © 2025–2026 CMPSBL® · PromptFluid™                         │
 * └──────────────────────────────────────────────────────────────┘
 */

// ═══════════════════════════════════════════════════════════════
// Inlined Types (from @cmpsbl/types — self-contained for builds)
// ═══════════════════════════════════════════════════════════════

export type MeshSignalCategory =
  | 'acknowledgement' | 'approval' | 'confirmation' | 'denial'
  | 'processing' | 'completion' | 'warning' | 'escalation'
  | 'discovery' | 'heartbeat';

/** Primitive-to-primitive communication event */
export interface MeshCommEvent {
  /** Source primitive identifier */
  source_primitive: string;
  /** Target primitive identifier */
  target_primitive: string;
  raw_signal: string;
  translated_voice: string;
  category: MeshSignalCategory;
  resolver_id?: string;
  personality_trait?: string;
  personality_icon?: string;
  /** @deprecated Use source_primitive */
  source_module?: string;
  /** @deprecated Use target_primitive */
  target_module?: string;
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
  // Normalize: populate deprecated fields for backward compat
  if (event.source_primitive && !event.source_module) event.source_module = event.source_primitive;
  if (event.target_primitive && !event.target_module) event.target_module = event.target_primitive;
  // And vice versa for legacy callers
  if (event.source_module && !event.source_primitive) event.source_primitive = event.source_module;
  if (event.target_module && !event.target_primitive) event.target_primitive = event.target_module;

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
  const src = event.source_primitive ?? event.source_module ?? '';
  const tgt = event.target_primitive ?? event.target_module ?? '';
  if (filter.source && src !== filter.source) return false;
  if (filter.target && tgt !== filter.target) return false;
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
    source_primitive: source,
    target_primitive: target,
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
