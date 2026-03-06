/**
 * Cross-Instance Mesh Federation — v10.5.0
 * Enables multiple substrate instances to share resolver capabilities.
 * 
 * Architecture:
 * - Each instance publishes its resolver manifest to a shared registry
 * - Federated resolution falls back to remote resolvers when local ones can't resolve
 * - Capability exchange is governed by federation policies
 * 
 * NOTE: This is the foundation layer. Full cross-network resolution
 * requires external endpoint configuration (planned 2027 roadmap).
 */

import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { secureSet, secureGet } from '@/lib/system/secureStorage';
import { MESH_MANIFEST, getMeshModules } from './manifest';
import type { MeshIntent, MeshResolution } from './types';

// ─── Types ───

export interface FederationPeer {
  id: string;
  name: string;
  endpoint: string;
  status: 'active' | 'degraded' | 'offline';
  lastSeen: string;
  resolverCount: number;
  sharedDomains: string[];
  latencyMs: number;
  trustScore: number; // 0-1
}

export interface FederationConfig {
  enabled: boolean;
  instanceId: string;
  instanceName: string;
  publishManifest: boolean;
  acceptRemoteIntents: boolean;
  maxRemoteLatencyMs: number;
  trustedPeers: string[];
  blockedPeers: string[];
  sharedDomains: string[]; // domains we share externally
  privateDomains: string[]; // domains we keep local-only
}

export interface FederationStats {
  totalPeers: number;
  activePeers: number;
  remoteResolutionsTotal: number;
  remoteResolutionsToday: number;
  avgRemoteLatencyMs: number;
  lastSync: string;
}

// ─── Default Config ───

const DEFAULT_CONFIG: FederationConfig = {
  enabled: false,
  instanceId: crypto.randomUUID(),
  instanceName: 'Primary Substrate',
  publishManifest: false,
  acceptRemoteIntents: false,
  maxRemoteLatencyMs: 2000,
  trustedPeers: [],
  blockedPeers: [],
  sharedDomains: ['security', 'identity', 'performance', 'seo'],
  privateDomains: ['internal', 'admin', 'economy'],
};

let currentConfig: FederationConfig = { ...DEFAULT_CONFIG };

// ─── Config Management ───

export function getFederationConfig(): FederationConfig {
  return { ...currentConfig };
}

export function updateFederationConfig(updates: Partial<FederationConfig>): FederationConfig {
  currentConfig = { ...currentConfig, ...updates };
  try {
    secureSet('mesh_federation_config', currentConfig);
  } catch { /* non-blocking */ }
  return { ...currentConfig };
}

export function loadFederationConfig(): FederationConfig {
  try {
    const stored = secureGet<FederationConfig>('mesh_federation_config');
    if (stored) {
      currentConfig = { ...DEFAULT_CONFIG, ...stored };
    }
  } catch { /* Storage unavailable — use defaults */ }
  return { ...currentConfig };
}

// ─── Manifest Publishing ───

/**
 * Publish this instance's resolver manifest to the federation registry
 */
export async function publishManifest(): Promise<{ published: number; domains: string[] }> {
  if (!currentConfig.enabled || !currentConfig.publishManifest) {
    return { published: 0, domains: [] };
  }

  const sharedResolvers = MESH_MANIFEST.filter(r =>
    r.enabled &&
    r.domains.some(d => currentConfig.sharedDomains.includes(d)) &&
    !r.domains.some(d => currentConfig.privateDomains.includes(d))
  );

  const allDomains = [...new Set(sharedResolvers.flatMap(r => r.domains))];

  // In a full implementation, this would POST to a federation endpoint
  // For now, we persist locally and log the intent
  console.log(`[FEDERATION] Publishing ${sharedResolvers.length} resolvers across ${allDomains.length} domains`);

  return {
    published: sharedResolvers.length,
    domains: allDomains,
  };
}

// ─── Peer Discovery ───

/**
 * Get known federation peers.
 * Returns the local substrate as a self-referencing peer with live resolver data.
 * External peers are loaded from persistent storage when federation is enabled.
 */
export async function getKnownPeers(): Promise<FederationPeer[]> {
  if (!currentConfig.enabled) return [];

  const peers: FederationPeer[] = [];

  // 1. Always include self as the local substrate peer
  const localModules = getMeshModules();
  const enabledResolvers = MESH_MANIFEST.filter(r => r.enabled);
  const localDomains = [...new Set(enabledResolvers.flatMap(r => r.domains))];

  peers.push({
    id: currentConfig.instanceId,
    name: currentConfig.instanceName,
    endpoint: 'local',
    status: 'active',
    lastSeen: new Date().toISOString(),
    resolverCount: enabledResolvers.length,
    sharedDomains: localDomains.filter(d => currentConfig.sharedDomains.includes(d)),
    latencyMs: 0,
    trustScore: 1.0,
  });

  // 2. Load any externally-registered peers from secure storage
  try {
    const stored = secureGet<FederationPeer[]>('mesh_federation_peers');
    if (stored && Array.isArray(stored)) {
      for (const peer of stored) {
        // Skip stale peers (offline > 24h)
        const lastSeen = new Date(peer.lastSeen).getTime();
        if (Date.now() - lastSeen > 24 * 60 * 60 * 1000) {
          peer.status = 'offline';
        }
        peers.push(peer);
      }
    }
  } catch { /* Storage unavailable — local peer only */ }

  return peers;
}

// ─── Peer Validation ───

const federationPeerSchema = z.object({
  id: z.string().min(1).max(128),
  name: z.string().min(1).max(256),
  endpoint: z.string().min(1).max(512),
  status: z.enum(['active', 'degraded', 'offline']),
  lastSeen: z.string().datetime(),
  resolverCount: z.number().int().min(0).max(10000),
  sharedDomains: z.array(z.string().max(64)).max(50),
  latencyMs: z.number().min(0).max(60000),
  trustScore: z.number().min(0).max(1),
});

// ─── Peer Management ───

/**
 * Register an external federation peer. Validated and persisted to secure storage.
 * Rejects malformed or oversized peer data.
 */
export function registerPeer(peer: FederationPeer): { success: boolean; error?: string } {
  const parsed = federationPeerSchema.safeParse(peer);
  if (!parsed.success) {
    return { success: false, error: `Invalid peer data: ${parsed.error.issues.map(i => i.message).join(', ')}` };
  }

  const stored = secureGet<FederationPeer[]>('mesh_federation_peers') ?? [];

  // Cap total external peers to prevent storage bloat
  if (stored.length >= 50 && !stored.find(p => p.id === peer.id)) {
    return { success: false, error: 'Maximum peer limit (50) reached' };
  }

  const existing = stored.findIndex(p => p.id === peer.id);
  if (existing >= 0) {
    stored[existing] = parsed.data as FederationPeer;
  } else {
    stored.push(parsed.data as FederationPeer);
  }
  secureSet('mesh_federation_peers', stored);
  return { success: true };
}

/**
 * Remove a federation peer by ID.
 */
export function removePeer(peerId: string): boolean {
  if (!peerId || peerId.length > 128) return false;
  const stored = secureGet<FederationPeer[]>('mesh_federation_peers') ?? [];
  const filtered = stored.filter(p => p.id !== peerId);
  if (filtered.length === stored.length) return false;
  secureSet('mesh_federation_peers', filtered);
  return true;
}

// ─── Federation Stats ───

export async function getFederationStats(): Promise<FederationStats> {
  const peers = await getKnownPeers();
  const remotePeers = peers.filter(p => p.endpoint !== 'local');
  const activePeers = remotePeers.filter(p => p.status === 'active');

  return {
    totalPeers: remotePeers.length,
    activePeers: activePeers.length,
    remoteResolutionsTotal: 0,
    remoteResolutionsToday: 0,
    avgRemoteLatencyMs: activePeers.length > 0
      ? Math.round(activePeers.reduce((s, p) => s + p.latencyMs, 0) / activePeers.length)
      : 0,
    lastSync: new Date().toISOString(),
  };
}

// ─── Federated Resolution ───

/**
 * Attempt to resolve an intent through federated peers.
 * Filters to remote, active, non-blocked peers with matching domains.
 * Returns null when no eligible remote peers are available —
 * actual cross-network HTTP resolution requires external endpoint setup.
 */
export async function federatedResolve(intent: MeshIntent): Promise<MeshResolution | null> {
  if (!currentConfig.enabled || !currentConfig.acceptRemoteIntents) return null;

  const peers = await getKnownPeers();
  const eligiblePeers = peers.filter(p =>
    p.endpoint !== 'local' &&
    p.status === 'active' &&
    p.latencyMs <= currentConfig.maxRemoteLatencyMs &&
    !currentConfig.blockedPeers.includes(p.id) &&
    p.sharedDomains.some(d => intent.domains.includes(d))
  );

  if (eligiblePeers.length === 0) return null;

  // Cross-network HTTP resolution requires external endpoint configuration.
  // Log the routing decision for observability.
  console.log(`[FEDERATION] ${eligiblePeers.length} eligible remote peers for intent: ${intent.intentType} — awaiting endpoint config`);
  return null;
}
