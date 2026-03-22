/**
 * @cmpsbl/types — First Contact Type Definitions
 * Shared types for the unified first-contact experience across all @cmpsbl packages.
 *
 * © CMPSBL® — All rights reserved.
 */

// ═══════════════════════════════════════════════════════════════
// Memory Stream Types
// ═══════════════════════════════════════════════════════════════

export interface MemoryChain {
  id: string;
  pattern: string;
  adoption: string;
  status: 'new' | 'captured' | 'applied' | 'exported';
  discoveredAt: string;
  domain: string;
  confidence: number;
}

export interface MemoryStreamEntry {
  chain: MemoryChain;
  source: string;
  userId: string;
  sessionId: string;
}

// ═══════════════════════════════════════════════════════════════
// First Contact Session
// ═══════════════════════════════════════════════════════════════

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
  /** Package identifier (e.g., '@cmpsbl/sdk') */
  package: string;
  /** Domain for pattern detection */
  domain: string;
  /** API endpoint for Memory Stream */
  endpoint?: string;
  /** User API key */
  apiKey?: string;
  /** Auto-start discovery on init */
  autoDiscover?: boolean;
  /** Callback for discovered chains */
  onDiscovery?: (chain: MemoryChain) => void;
  /** Callback for boot sequence messages */
  onBoot?: (message: string) => void;
}

// ═══════════════════════════════════════════════════════════════
// Discovery Types
// ═══════════════════════════════════════════════════════════════

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

export interface ExportResult {
  success: boolean;
  chainId: string;
  format: 'json' | 'manifest' | 'bundle';
  data: Record<string, unknown>;
}

// ═══════════════════════════════════════════════════════════════
// Package Domain Definitions
// ═══════════════════════════════════════════════════════════════

export type PackageDomain =
  | 'runtime'        // @cmpsbl/runtime
  | 'intent'         // @cmpsbl/intent
  | 'mesh'           // @cmpsbl/mesh
  | 'bridge'         // @cmpsbl/bridge
  | 'discovery'      // @cmpsbl/discovery
  | 'sdk'            // @cmpsbl/sdk
  | 'cli'            // @cmpsbl/cli
  | 'react'          // @cmpsbl/react
  | 'failsafe'       // @cmpsbl/failsafe
  | 'test-harness'   // @cmpsbl/test-harness
  | 'types';         // @cmpsbl/types

export interface DomainPattern {
  domain: PackageDomain;
  patterns: string[];
  scopes: string[];
}

export const DOMAIN_PATTERNS: Record<PackageDomain, DomainPattern> = {
  runtime: {
    domain: 'runtime',
    patterns: ['Execution optimization pattern', 'Pipeline efficiency chain', 'State machine convergence'],
    scopes: ['Cross-runtime adoption', 'Multi-environment execution', 'Universal pipeline usage'],
  },
  intent: {
    domain: 'intent',
    patterns: ['Routing optimization pattern', 'Resolver convergence chain', 'Intent coordination signal'],
    scopes: ['Cross-module orchestration', 'Multi-resolver routing', 'System-wide intent coverage'],
  },
  mesh: {
    domain: 'mesh',
    patterns: ['Telemetry correlation pattern', 'Signal propagation chain', 'Node communication optimization'],
    scopes: ['Cross-node telemetry', 'System-wide observability', 'Multi-layer signal analysis'],
  },
  bridge: {
    domain: 'bridge',
    patterns: ['Language bridge optimization', 'Cross-runtime delegation chain', 'Polyglot execution pattern'],
    scopes: ['Multi-language adoption', 'Cross-runtime integration', 'Universal bridge coverage'],
  },
  discovery: {
    domain: 'discovery',
    patterns: ['Pipeline crystallization pattern', 'Architecture collision chain', 'Capability emergence signal'],
    scopes: ['Cross-system discovery', 'Multi-node collision analysis', 'Autonomous capability generation'],
  },
  sdk: {
    domain: 'sdk',
    patterns: ['API usage optimization', 'Engine coordination chain', 'Client integration pattern'],
    scopes: ['Cross-engine adoption', 'Multi-system integration', 'Developer workflow optimization'],
  },
  cli: {
    domain: 'cli',
    patterns: ['Command optimization pattern', 'Workflow automation chain', 'Infrastructure coordination signal'],
    scopes: ['Cross-project automation', 'Multi-environment management', 'Developer productivity gain'],
  },
  react: {
    domain: 'react',
    patterns: ['Component state correlation', 'Hook composition chain', 'UI-substrate binding pattern'],
    scopes: ['Cross-component adoption', 'Multi-view state management', 'Frontend-substrate integration'],
  },
  failsafe: {
    domain: 'failsafe',
    patterns: ['Recovery optimization pattern', 'Backup integrity chain', 'Migration reliability signal'],
    scopes: ['Cross-platform migration', 'Multi-environment backup', 'Disaster recovery automation'],
  },
  'test-harness': {
    domain: 'test-harness',
    patterns: ['Validation coverage pattern', 'Test convergence chain', 'Quality assurance signal'],
    scopes: ['Cross-module validation', 'Multi-layer test coverage', 'Automated quality assurance'],
  },
  types: {
    domain: 'types',
    patterns: ['Type safety pattern', 'Schema convergence chain', 'Contract validation signal'],
    scopes: ['Cross-package type safety', 'Multi-module schema coverage', 'Universal contract enforcement'],
  },
};
