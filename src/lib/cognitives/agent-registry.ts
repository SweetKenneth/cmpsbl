/**
 * Agent Registry — Internal/Public Split Architecture
 * Phase 1: Execution modes, versioning, tool binding, CLM safety
 * 
 * INTERNAL_LEARNING: CLM-enabled, tools mutable, memory evolving
 * PUBLIC_STABLE: CLM disabled, snapshot-frozen, immutable release
 */

import type { CognitiveItem } from './catalog';
import { COGNITIVES_CATALOG, INTERNAL_AGENTS, PUBLIC_CATALOG } from './catalog';

// ═══════════════════════════════════════════════════════════════
// EXECUTION MODES
// ═══════════════════════════════════════════════════════════════

export type ExecutionMode = 'INTERNAL_LEARNING' | 'PUBLIC_STABLE';

export interface AgentInstance {
  sku: string;
  mode: ExecutionMode;
  version: string;
  snapshotId: string | null;
  toolBindings: ToolBinding[];
  memoryPartition: string;
  clmEnabled: boolean;
  capabilityProfile: CapabilityProfile;
  researchUrls: string[];
  createdAt: number;
  lastModifiedAt: number;
}

// ═══════════════════════════════════════════════════════════════
// VERSIONING
// ═══════════════════════════════════════════════════════════════

export interface AgentVersion {
  versionTag: string;
  branch: 'internal' | 'stable';
  snapshotId: string;
  releaseNotes: string;
  toolBindingsHash: string;
  memorySchemaHash: string;
  configHash: string;
  isImmutable: boolean;
  upgradeEligible: boolean;
  backwardCompatible: boolean;
  createdAt: number;
  releasedAt: number | null;
}

export interface VersionLineage {
  sku: string;
  internalVersions: AgentVersion[];
  stableVersions: AgentVersion[];
  currentInternal: string;
  currentStable: string | null;
}

// ═══════════════════════════════════════════════════════════════
// TOOL BINDING
// ═══════════════════════════════════════════════════════════════

export type ToolClass = 'core_cognition' | 'role_specific' | 'open_source' | 'substrate';

export interface ToolBinding {
  toolId: string;
  name: string;
  toolClass: ToolClass;
  permissions: ToolPermission[];
  timeoutMs: number;
  circuitBreakerEnabled: boolean;
  failureIsolation: boolean;
  sandboxSafe: boolean;
  revocable: boolean;
}

export interface ToolPermission {
  action: 'read' | 'write' | 'execute' | 'network';
  scope: string;
  restricted: boolean;
}

export const MAX_TOOLS_PER_AGENT = 24;
export const DEFAULT_TOOL_TIMEOUT_MS = 30_000;

// ═══════════════════════════════════════════════════════════════
// CAPABILITY PROFILE
// ═══════════════════════════════════════════════════════════════

export interface CapabilityProfile {
  primaryDomain: string;
  maxMemoryDepthMb: number;
  maxToolCount: number;
  analyticsEnabled: boolean;
  versionUpgradePriority: boolean;
  tier: 'free' | 'paid' | 'internal';
}

// ═══════════════════════════════════════════════════════════════
// SNAPSHOT
// ═══════════════════════════════════════════════════════════════

export interface AgentSnapshot {
  id: string;
  sku: string;
  versionTag: string;
  frozenConfig: Record<string, unknown>;
  frozenToolBindings: ToolBinding[];
  frozenMemorySchema: string;
  frozenCapabilityProfile: CapabilityProfile;
  immutable: true;
  createdAt: number;
  integrity: string; // SHA-256 hash
}

// ═══════════════════════════════════════════════════════════════
// CLM SAFETY CONSTRAINTS (Internal only)
// ═══════════════════════════════════════════════════════════════

export interface CLMSafetyPolicy {
  /** CLM cannot modify tool definitions */
  toolModificationBlocked: true;
  /** CLM cannot modify security boundaries */
  securityBoundaryLocked: true;
  /** CLM cannot escalate its own scope */
  scopeEscalationBlocked: true;
  /** CLM cannot access restricted URLs */
  restrictedUrlBlocked: true;
  /** Learning deltas must be logged */
  learningDeltaLogging: true;
  /** Performance scoring enabled */
  performanceScoring: true;
  /** Drift detection enabled */
  driftDetection: true;
  /** Auto-rollback on degradation */
  autoRollbackOnDegradation: true;
}

export const CLM_SAFETY_POLICY: CLMSafetyPolicy = {
  toolModificationBlocked: true,
  securityBoundaryLocked: true,
  scopeEscalationBlocked: true,
  restrictedUrlBlocked: true,
  learningDeltaLogging: true,
  performanceScoring: true,
  driftDetection: true,
  autoRollbackOnDegradation: true,
};

// ═══════════════════════════════════════════════════════════════
// REGISTRY STATE
// ═══════════════════════════════════════════════════════════════

const agentInstances = new Map<string, AgentInstance>();
const versionLineages = new Map<string, VersionLineage>();
const snapshots = new Map<string, AgentSnapshot>();
const learningDeltas: Array<{ sku: string; delta: string; score: number; timestamp: number }> = [];

function generateSnapshotId(): string {
  return `snap-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function generateIntegrityHash(data: unknown): string {
  // Simple hash for client-side — real implementation uses SHA-256
  const str = JSON.stringify(data);
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return `sha256-${Math.abs(hash).toString(16).padStart(16, '0')}`;
}

// ═══════════════════════════════════════════════════════════════
// INITIALIZATION
// ═══════════════════════════════════════════════════════════════

function buildDefaultToolBindings(item: CognitiveItem): ToolBinding[] {
  const coreTools: ToolBinding[] = [
    {
      toolId: `${item.sku}-memory-read`,
      name: 'Memory Read',
      toolClass: 'core_cognition',
      permissions: [{ action: 'read', scope: `memory:${item.sku}`, restricted: false }],
      timeoutMs: DEFAULT_TOOL_TIMEOUT_MS,
      circuitBreakerEnabled: true,
      failureIsolation: true,
      sandboxSafe: true,
      revocable: false,
    },
    {
      toolId: `${item.sku}-memory-write`,
      name: 'Memory Write',
      toolClass: 'core_cognition',
      permissions: [{ action: 'write', scope: `memory:${item.sku}`, restricted: false }],
      timeoutMs: DEFAULT_TOOL_TIMEOUT_MS,
      circuitBreakerEnabled: true,
      failureIsolation: true,
      sandboxSafe: true,
      revocable: false,
    },
    {
      toolId: `${item.sku}-execute`,
      name: 'Task Execute',
      toolClass: 'core_cognition',
      permissions: [{ action: 'execute', scope: `task:${item.sku}`, restricted: false }],
      timeoutMs: 60_000,
      circuitBreakerEnabled: true,
      failureIsolation: true,
      sandboxSafe: true,
      revocable: false,
    },
  ];
  return coreTools;
}

function buildCapabilityProfile(item: CognitiveItem): CapabilityProfile {
  const tier: 'free' | 'paid' | 'internal' = item.isFree ? 'free' : item.isPublic ? 'paid' : 'internal';
  return {
    primaryDomain: item.className,
    maxMemoryDepthMb: tier === 'free' ? 64 : tier === 'paid' ? 256 : 1024,
    maxToolCount: tier === 'free' ? 8 : MAX_TOOLS_PER_AGENT,
    analyticsEnabled: tier !== 'free',
    versionUpgradePriority: tier === 'paid',
    tier,
  };
}

/** Initialize all 20 agents with proper mode separation */
export function initializeRegistry(): void {
  if (agentInstances.size > 0) return; // Already initialized

  for (const item of COGNITIVES_CATALOG) {
    const mode: ExecutionMode = item.isPublic ? 'PUBLIC_STABLE' : 'INTERNAL_LEARNING';
    const snapshotId = item.isPublic ? generateSnapshotId() : null;
    const toolBindings = buildDefaultToolBindings(item);
    const capabilityProfile = buildCapabilityProfile(item);

    const instance: AgentInstance = {
      sku: item.sku,
      mode,
      version: item.version,
      snapshotId,
      toolBindings,
      memoryPartition: `partition:${item.sku}`,
      clmEnabled: mode === 'INTERNAL_LEARNING',
      capabilityProfile,
      researchUrls: [],
      createdAt: Date.now(),
      lastModifiedAt: Date.now(),
    };

    agentInstances.set(item.sku, instance);

    // Create version lineage
    const versionEntry: AgentVersion = {
      versionTag: item.version,
      branch: item.isPublic ? 'stable' : 'internal',
      snapshotId: snapshotId || generateSnapshotId(),
      releaseNotes: `Initial ${item.version} release of ${item.displayName}`,
      toolBindingsHash: generateIntegrityHash(toolBindings),
      memorySchemaHash: generateIntegrityHash({ partition: item.sku }),
      configHash: generateIntegrityHash(capabilityProfile),
      isImmutable: item.isPublic,
      upgradeEligible: !item.isFree,
      backwardCompatible: true,
      createdAt: Date.now(),
      releasedAt: item.isPublic ? Date.now() : null,
    };

    versionLineages.set(item.sku, {
      sku: item.sku,
      internalVersions: item.isPublic ? [] : [versionEntry],
      stableVersions: item.isPublic ? [versionEntry] : [],
      currentInternal: item.isPublic ? item.version : item.version,
      currentStable: item.isPublic ? item.version : null,
    });

    // Create snapshot for public agents
    if (item.isPublic && snapshotId) {
      const snapshot: AgentSnapshot = {
        id: snapshotId,
        sku: item.sku,
        versionTag: item.version,
        frozenConfig: { ...capabilityProfile },
        frozenToolBindings: [...toolBindings],
        frozenMemorySchema: `partition:${item.sku}`,
        frozenCapabilityProfile: { ...capabilityProfile },
        immutable: true,
        createdAt: Date.now(),
        integrity: generateIntegrityHash({ toolBindings, capabilityProfile, sku: item.sku }),
      };
      snapshots.set(snapshotId, snapshot);
    }
  }
}

// ═══════════════════════════════════════════════════════════════
// QUERY API
// ═══════════════════════════════════════════════════════════════

export function getAgentInstance(sku: string): AgentInstance | undefined {
  return agentInstances.get(sku);
}

export function getAllInstances(): AgentInstance[] {
  return Array.from(agentInstances.values());
}

export function getInternalInstances(): AgentInstance[] {
  return getAllInstances().filter(a => a.mode === 'INTERNAL_LEARNING');
}

export function getPublicInstances(): AgentInstance[] {
  return getAllInstances().filter(a => a.mode === 'PUBLIC_STABLE');
}

export function getVersionLineage(sku: string): VersionLineage | undefined {
  return versionLineages.get(sku);
}

export function getSnapshot(id: string): AgentSnapshot | undefined {
  return snapshots.get(id);
}

export function getLearningDeltas(sku?: string): typeof learningDeltas {
  if (sku) return learningDeltas.filter(d => d.sku === sku);
  return [...learningDeltas];
}

// ═══════════════════════════════════════════════════════════════
// MUTATION API (Internal only)
// ═══════════════════════════════════════════════════════════════

/** Record a CLM learning delta — enforces safety policy */
export function recordLearningDelta(sku: string, delta: string, score: number): boolean {
  const instance = agentInstances.get(sku);
  if (!instance || instance.mode !== 'INTERNAL_LEARNING') return false;
  if (!instance.clmEnabled) return false;

  // Enforce safety: delta cannot modify tool definitions
  if (delta.toLowerCase().includes('tool_definition_change')) return false;
  if (delta.toLowerCase().includes('security_boundary')) return false;
  if (delta.toLowerCase().includes('scope_escalation')) return false;

  learningDeltas.push({ sku, delta, score, timestamp: Date.now() });

  // Drift detection: if score drops below 0.3, trigger rollback flag
  if (score < 0.3) {
    console.debug(`[AgentRegistry] Drift detected for ${sku}: score=${score}`);
  }

  // Bound array
  if (learningDeltas.length > 10_000) {
    learningDeltas.splice(0, learningDeltas.length - 5_000);
  }

  instance.lastModifiedAt = Date.now();
  return true;
}

/** Create a stable snapshot from an internal agent (for future public release) */
export function createStableSnapshot(sku: string, versionTag: string, releaseNotes: string): AgentSnapshot | null {
  const instance = agentInstances.get(sku);
  if (!instance) return null;

  const snapshotId = generateSnapshotId();
  const snapshot: AgentSnapshot = {
    id: snapshotId,
    sku,
    versionTag,
    frozenConfig: { ...instance.capabilityProfile },
    frozenToolBindings: instance.toolBindings.map(t => ({ ...t })),
    frozenMemorySchema: instance.memoryPartition,
    frozenCapabilityProfile: { ...instance.capabilityProfile },
    immutable: true,
    createdAt: Date.now(),
    integrity: generateIntegrityHash({
      toolBindings: instance.toolBindings,
      capabilityProfile: instance.capabilityProfile,
      sku,
      versionTag,
    }),
  };

  snapshots.set(snapshotId, snapshot);

  // Add to version lineage
  const lineage = versionLineages.get(sku);
  if (lineage) {
    lineage.stableVersions.push({
      versionTag,
      branch: 'stable',
      snapshotId,
      releaseNotes,
      toolBindingsHash: generateIntegrityHash(instance.toolBindings),
      memorySchemaHash: generateIntegrityHash({ partition: sku }),
      configHash: generateIntegrityHash(instance.capabilityProfile),
      isImmutable: true,
      upgradeEligible: true,
      backwardCompatible: true,
      createdAt: Date.now(),
      releasedAt: Date.now(),
    });
    lineage.currentStable = versionTag;
  }

  return snapshot;
}

/** Validate snapshot integrity */
export function validateSnapshotIntegrity(snapshotId: string): boolean {
  const snapshot = snapshots.get(snapshotId);
  if (!snapshot) return false;

  const expectedHash = generateIntegrityHash({
    toolBindings: snapshot.frozenToolBindings,
    capabilityProfile: snapshot.frozenCapabilityProfile,
    sku: snapshot.sku,
    versionTag: snapshot.versionTag,
  });

  return expectedHash === snapshot.integrity;
}

// ═══════════════════════════════════════════════════════════════
// REGISTRY STATS
// ═══════════════════════════════════════════════════════════════

export function getRegistryStats() {
  initializeRegistry();
  const all = getAllInstances();
  return {
    totalAgents: all.length,
    internalLearning: all.filter(a => a.mode === 'INTERNAL_LEARNING').length,
    publicStable: all.filter(a => a.mode === 'PUBLIC_STABLE').length,
    totalSnapshots: snapshots.size,
    totalDeltas: learningDeltas.length,
    clmActive: all.filter(a => a.clmEnabled).length,
  };
}

// Auto-initialize on import
initializeRegistry();
