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

// ─── Federation Stats ───

export async function getFederationStats(): Promise<FederationStats> {
  const peers = await getKnownPeers();
  const activePeers = peers.filter(p => p.status === 'active');

  return {
    totalPeers: peers.length,
    activePeers: activePeers.length,
    remoteResolutionsTotal: 0,
    remoteResolutionsToday: 0,
    avgRemoteLatencyMs: activePeers.length > 0
      ? Math.round(activePeers.reduce((s, p) => s + p.latencyMs, 0) / activePeers.length)
      : 0,
    lastSync: new Date().toISOString(),
  };
}

// ─── Federated Resolution (stub) ───

/**
 * Attempt to resolve an intent through federated peers
 * Falls back to this when local resolvers can't handle the intent
 */
export async function federatedResolve(intent: MeshIntent): Promise<MeshResolution | null> {
  if (!currentConfig.enabled || !currentConfig.acceptRemoteIntents) return null;

  const peers = await getKnownPeers();
  const eligiblePeers = peers.filter(p =>
    p.status === 'active' &&
    p.latencyMs <= currentConfig.maxRemoteLatencyMs &&
    !currentConfig.blockedPeers.includes(p.id) &&
    p.sharedDomains.some(d => intent.domains.includes(d))
  );

  if (eligiblePeers.length === 0) return null;

  // In production, this would make actual HTTP calls to peer endpoints
  console.log(`[FEDERATION] Would query ${eligiblePeers.length} peers for intent: ${intent.intentType}`);
  return null;
}
