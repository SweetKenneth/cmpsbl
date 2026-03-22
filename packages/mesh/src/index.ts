/**
 * @cmpsbl/mesh — Mesh Telemetry Client
 * Emit and subscribe to node-to-node communication events.
 * Includes first-contact Memory Stream integration.
 *
 * © CMPSBL® — All rights reserved.
 */

import type { MeshCommEvent, MeshSignalCategory, SubstrateNode, FirstContactConfig } from '@cmpsbl/types';

export type { MeshCommEvent, MeshSignalCategory, SubstrateNode };

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
    endpoint: 'https://api.cmpsbl.com/v1/substrate',
    autoDiscover: true,
  };
}
