/**
 * Minds Intelligence Layer — Version Snapshot Mechanism
 * Freeze current Mind version → sell snapshot.
 * Internal learning continues on INTERNAL_LEARNING branch.
 * Upgrades released as version increments.
 */

export interface MindSnapshot {
  id: string;
  mindSku: string;
  version: string;
  /** Frozen timestamp */
  frozenAt: number;
  /** Prompt scaffold hash (integrity check) */
  scaffoldHash: string;
  /** Research scope at freeze time */
  researchScopeFingerprint: string;
  /** Tool chain IDs available at freeze */
  toolChainIds: string[];
  /** Vocabulary entry count at freeze */
  vocabularySize: number;
  /** Tone defaults at freeze */
  defaultTone: string;
  /** Whether this snapshot is the current public release */
  isPublicRelease: boolean;
  /** Metadata */
  metadata: Record<string, string>;
}

export interface VersionLine {
  mindSku: string;
  currentPublic: string; // e.g., 'v1.0'
  internalHead: string;  // e.g., 'v1.0.3-dev'
  snapshots: MindSnapshot[];
  releaseHistory: Array<{
    version: string;
    releasedAt: number;
    changelog: string;
  }>;
}

/** Version lines per Mind */
const versionLines = new Map<string, VersionLine>();

/** Generate a simple hash for integrity checking */
function simpleHash(input: string): string {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit
  }
  return Math.abs(hash).toString(36);
}

/** Initialize a version line for a Mind */
export function initVersionLine(mindSku: string, currentVersion: string = 'v1.0'): VersionLine {
  const line: VersionLine = {
    mindSku,
    currentPublic: currentVersion,
    internalHead: currentVersion,
    snapshots: [],
    releaseHistory: [{
      version: currentVersion,
      releasedAt: Date.now(),
      changelog: 'Initial public release',
    }],
  };
  versionLines.set(mindSku, line);
  return line;
}

/** Create a snapshot (freeze) of the current Mind state */
export function createSnapshot(
  mindSku: string,
  config: {
    scaffoldContent: string;
    researchDomains: string[];
    toolChainIds: string[];
    vocabularySize: number;
    defaultTone: string;
  }
): MindSnapshot {
  const line = versionLines.get(mindSku) ?? initVersionLine(mindSku);

  const snapshot: MindSnapshot = {
    id: `${mindSku}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    mindSku,
    version: line.currentPublic,
    frozenAt: Date.now(),
    scaffoldHash: simpleHash(config.scaffoldContent),
    researchScopeFingerprint: simpleHash(config.researchDomains.join(',')),
    toolChainIds: [...config.toolChainIds],
    vocabularySize: config.vocabularySize,
    defaultTone: config.defaultTone,
    isPublicRelease: true,
    metadata: {},
  };

  line.snapshots.push(snapshot);
  return snapshot;
}

/** Bump internal version (learning continues) */
export function bumpInternalVersion(mindSku: string): string {
  const line = versionLines.get(mindSku);
  if (!line) return 'v1.0';

  // Parse and increment dev version
  const match = line.internalHead.match(/v(\d+)\.(\d+)(?:\.(\d+))?/);
  if (!match) return line.internalHead;

  const major = parseInt(match[1]);
  const minor = parseInt(match[2]);
  const patch = (parseInt(match[3] ?? '0')) + 1;

  line.internalHead = `v${major}.${minor}.${patch}-dev`;
  return line.internalHead;
}

/** Promote internal version to new public release */
export function promoteToPublic(
  mindSku: string,
  changelog: string
): { version: string; snapshot: MindSnapshot } | null {
  const line = versionLines.get(mindSku);
  if (!line) return null;

  // Bump minor version for public release
  const match = line.currentPublic.match(/v(\d+)\.(\d+)/);
  if (!match) return null;

  const major = parseInt(match[1]);
  const minor = parseInt(match[2]) + 1;
  const newVersion = `v${major}.${minor}`;

  line.currentPublic = newVersion;
  line.internalHead = newVersion;

  line.releaseHistory.push({
    version: newVersion,
    releasedAt: Date.now(),
    changelog,
  });

  // Auto-create snapshot
  const snapshot: MindSnapshot = {
    id: `${mindSku}-release-${newVersion}`,
    mindSku,
    version: newVersion,
    frozenAt: Date.now(),
    scaffoldHash: 'promoted',
    researchScopeFingerprint: 'promoted',
    toolChainIds: [],
    vocabularySize: 0,
    defaultTone: 'professional',
    isPublicRelease: true,
    metadata: { changelog },
  };

  line.snapshots.push(snapshot);
  return { version: newVersion, snapshot };
}

/** Get version line for a Mind */
export function getVersionLine(mindSku: string): VersionLine | null {
  return versionLines.get(mindSku) ?? null;
}

/** Get the current public version */
export function getCurrentPublicVersion(mindSku: string): string {
  return versionLines.get(mindSku)?.currentPublic ?? 'v1.0';
}

/** Get all snapshots for a Mind */
export function getSnapshots(mindSku: string): MindSnapshot[] {
  return versionLines.get(mindSku)?.snapshots ?? [];
}

/** Validate a snapshot's integrity */
export function validateSnapshot(
  snapshot: MindSnapshot,
  currentScaffoldContent: string
): { valid: boolean; drift: string[] } {
  const drift: string[] = [];
  const currentHash = simpleHash(currentScaffoldContent);

  if (currentHash !== snapshot.scaffoldHash) {
    drift.push('Prompt scaffold has drifted from snapshot');
  }

  return {
    valid: drift.length === 0,
    drift,
  };
}

/** Get release history for a Mind */
export function getReleaseHistory(mindSku: string): VersionLine['releaseHistory'] {
  return versionLines.get(mindSku)?.releaseHistory ?? [];
}
