declare module '@cmpsbl/runtime' {
  export interface CJPIInput {
    novelty: number;
    utility: number;
    complexity: number;
    composability: number;
  }

  export interface CJPIScoreBreakdown {
    novelty: number;
    utility: number;
    complexity: number;
    composability: number;
    total: number;
    tier: string;
  }

  export interface CmpsblManifest {
    name: string;
    tier: string;
    cjpi: number;
    modules: string[];
    exported: string;
    runtime: string;
    targets: string[];
    version: string;
    category?: string;
    fingerprint?: string;
    source?: string;
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

  export type CeremonyPhase =
    | 'awakening'
    | 'handshake'
    | 'sector_boot'
    | 'mesh_bind'
    | 'memory_sync'
    | 'discovery_arm'
    | 'ceremony_complete';

  export interface CeremonyEvent {
    phase: CeremonyPhase;
    message: string;
    detail?: string;
    progress?: number;
    sector?: string;
    nodesOnline?: number;
    totalNodes?: number;
  }

  export interface FirstContactSession {
    userId: string;
    sessionId: string;
    package: string;
    domain: string;
    startedAt: string;
    memoryBound: boolean;
    discoveryActive: boolean;
    chains: MemoryChain[];
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

  export interface CaptureResult {
    success: boolean;
    chainId: string;
    message: string;
  }

  export interface ApplyResult {
    success: boolean;
    chainId: string;
    message: string;
    systemUpdated: boolean;
  }

  export type PackageDomain =
    | 'runtime'
    | 'intent'
    | 'mesh'
    | 'bridge'
    | 'discovery'
    | 'sdk'
    | 'cli'
    | 'react'
    | 'failsafe'
    | 'test-harness'
    | 'types';

  export interface DomainPattern {
    domain: PackageDomain;
    patterns: string[];
    scopes: string[];
  }

  export const DOMAIN_PATTERNS: Record<PackageDomain, DomainPattern>;

  export function computeCJPI(input: CJPIInput): CJPIScoreBreakdown;
  export function parseManifest(json: string): CmpsblManifest;
  export function generateManifest(input: {
    name: string;
    cjpi?: number;
    modules?: string[];
    targets?: string[];
    version?: string;
    category?: string;
    fingerprint?: string;
    source?: string;
  }): CmpsblManifest;

  export function initFirstContact(config: FirstContactConfig): Promise<FirstContactSession>;
  export function discoverMemory(
    input: DiscoveryInput,
    config: FirstContactConfig,
    pattern: DomainPattern,
  ): Promise<DiscoveryResult>;
  export function captureMemory(chainId: string, config?: FirstContactConfig): Promise<CaptureResult>;
  export function applyMemory(chainId: string, config?: FirstContactConfig): Promise<ApplyResult>;
  export function getMemoryStream(): MemoryChain[];
  export function getFirstContactSession(): FirstContactSession | null;
  export function endFirstContactSession(): void;
}
