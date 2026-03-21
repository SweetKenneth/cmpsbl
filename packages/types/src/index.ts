/**
 * @cmpsbl/types — Shared TypeScript Types
 * CMPSBL® Substrate Type Definitions
 *
 * © CMPSBL® — All rights reserved.
 */

// ═══════════════════════════════════════════════════════════════
// CJPI (Crown Jewel Performance Index)
// ═══════════════════════════════════════════════════════════════

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
  tier: CrystallizedTier;
}

export type CrystallizedTier = 'Mint' | 'Prime' | 'Relic' | 'Mythic' | 'Apex';

export type ProductTier = 'Raw' | 'Creator' | 'Architect' | 'Enterprise' | 'Apex';

// ═══════════════════════════════════════════════════════════════
// Manifest
// ═══════════════════════════════════════════════════════════════

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

// ═══════════════════════════════════════════════════════════════
// Runtime Contract
// ═══════════════════════════════════════════════════════════════

export type RuntimeMode = 'offline' | 'hybrid' | 'network';
export type BridgeType = 'network' | 'hybrid' | 'offline-fallback';
export type RuntimeType = 'substrate' | 'portable' | 'sealed';
export type FallbackReason = 'normal' | 'degraded' | 'offline';

export interface ChainManifest {
  id: string;
  name: string;
  description: string;
  modules: string[];
  cjpiScore: number;
  tier: string;
  category: string;
  sourceLanguage?: string;
  discoveredAt: string;
}

export interface ExecutionOptions {
  stageTimeoutMs?: number;
  continueOnFailure?: boolean;
  telemetry?: boolean;
}

export interface ChainResult {
  success: boolean;
  output: Record<string, unknown>;
  confidence: number;
  totalDurationMs: number;
  stagesCompleted: number;
  totalStages: number;
  runtimeMode: RuntimeMode;
  bridgeType: BridgeType;
}

export interface PrimitiveResult {
  success: boolean;
  output: unknown;
  confidence: number;
  durationMs: number;
  handler: string;
}

// ═══════════════════════════════════════════════════════════════
// Mesh / Intent Types
// ═══════════════════════════════════════════════════════════════

export interface MeshIntent {
  id: string;
  sourceModule: string;
  intentType: string;
  input: Record<string, unknown>;
  priority?: number;
  timestamp: string;
}

export interface MeshReceipt {
  id: string;
  intentId: string;
  sourceModule: string;
  intentType: string;
  resolverCount: number;
  status: 'success' | 'partial' | 'fail';
  durationMs: number;
  createdAt: string;
}

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

export type MeshSignalCategory =
  | 'acknowledgement' | 'approval' | 'confirmation' | 'denial'
  | 'processing' | 'completion' | 'warning' | 'escalation'
  | 'discovery' | 'heartbeat';

// ═══════════════════════════════════════════════════════════════
// Resolver Types
// ═══════════════════════════════════════════════════════════════

export interface ResolverDefinition {
  id: string;
  node: string;
  name: string;
  description: string;
  inputSchema?: Record<string, unknown>;
  outputSchema?: Record<string, unknown>;
}

export interface ResolverResponse {
  resolverId: string;
  node: string;
  success: boolean;
  output: unknown;
  confidence: number;
  durationMs: number;
}

// ═══════════════════════════════════════════════════════════════
// Engine SDK Types
// ═══════════════════════════════════════════════════════════════

export interface EngineCallOptions {
  depth?: 'shallow' | 'standard' | 'deep';
  stages?: string[];
  temperature?: number;
}

export interface EngineStageResult {
  stage: string;
  output: string;
  confidence: number;
  tokens: number;
  latency_ms: number;
}

export interface EngineResult {
  success: boolean;
  engine: string;
  action: string;
  result: string;
  confidence: number;
  pipeline: {
    stages: EngineStageResult[];
    total_tokens: number;
    total_latency_ms: number;
    depth: string;
  };
}

// ═══════════════════════════════════════════════════════════════
// Discovery / Pipeline Types
// ═══════════════════════════════════════════════════════════════

export type DiscoveryCategory =
  | 'analytics' | 'automation' | 'cognitive' | 'security'
  | 'optimization' | 'integration' | 'monitoring' | 'generation';

export interface DiscoveryPipeline {
  id: string;
  name: string;
  description: string;
  modules: string[];
  cjpi: number;
  tier: CrystallizedTier;
  category: DiscoveryCategory;
  discoveredAt: string;
  fingerprint: string;
}

// ═══════════════════════════════════════════════════════════════
// Node Types
// ═══════════════════════════════════════════════════════════════

export type SubstrateNode =
  | 'CORE' | 'BRAIN' | 'MEMORY' | 'NERVE' | 'DECODE' | 'ENCODE'
  | 'CORTEX' | 'DEFENSE' | 'ORACLE' | 'CONSCIENCE' | 'PHANTOM'
  | 'HARVEST' | 'EVOLUTION' | 'SHADOW' | 'IMMUNITY' | 'INTENT'
  | 'GOVERNANCE' | 'ATLAS' | 'FORGE' | 'LINGUA' | 'ECHO'
  | 'SOVEREIGN' | 'REFLEX' | 'TREATY' | 'ENGINEER' | 'COMPASS'
  | 'OBSERVER';

export interface NodeHealth {
  node: SubstrateNode;
  status: 'online' | 'degraded' | 'offline';
  resolverCount: number;
  lastHeartbeat: string;
}
