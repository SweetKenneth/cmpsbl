/**
 * Synergy Pipeline Registry — Static Descriptive Map
 * Read-Only, Non-Executable
 * 
 * This registry documents emergent capabilities from module intersections.
 * It is DESCRIPTIVE ONLY — no execution paths derive from this file.
 */

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

export type PipelineStatus = 'descriptive_only' | 'observed' | 'theoretical' | 'deprecated';

export type ModuleName = 
  | 'CORE' | 'RIPPLE' | 'ACCESS'      // Kernel
  | 'BRAIN' | 'DECODE' | 'DREAM'       // Cognitive
  | 'DEFENSE' | 'NEXUS' | 'VISION'     // Operational
  | 'SYSTEM' | 'EVOLUTION' | 'INTEGRATION' | 'INCLUSIVE'  // Administrative
  | 'CORTEX';                          // Orchestrator

export interface SynergyPipeline {
  readonly id: string;
  readonly name: string;
  readonly modules: readonly ModuleName[];
  readonly description: string;
  readonly emergentProperty: string;
  readonly status: PipelineStatus;
  readonly documentedAt: string;
}

// ═══════════════════════════════════════════════════════════════
// REGISTRY (IMMUTABLE)
// ═══════════════════════════════════════════════════════════════

/**
 * Canonical Synergy Pipeline Registry
 * 
 * IMPORTANT: This is a READ-ONLY descriptive map.
 * - No schedulers reference this
 * - No automation derives from this
 * - No execution paths are defined here
 */
export const SYNERGY_PIPELINES: readonly SynergyPipeline[] = Object.freeze([
  {
    id: 'SEP-001',
    name: 'Autonomous Evolution',
    modules: ['DREAM', 'BRAIN', 'EVOLUTION', 'CORTEX'] as const,
    description: 'Learning-to-evolution loop where insights flow from consumption to capability expansion',
    emergentProperty: 'Self-directed capability expansion',
    status: 'descriptive_only',
    documentedAt: '2025-01-30',
  },
  {
    id: 'SEP-002',
    name: 'Governed Self-Healing',
    modules: ['VISION', 'SYSTEM', 'CORE'] as const,
    description: 'Anomaly detection triggers stability protocols within governance bounds',
    emergentProperty: 'Autonomous stability maintenance',
    status: 'descriptive_only',
    documentedAt: '2025-01-30',
  },
  {
    id: 'SEP-003',
    name: 'Human Compatibility',
    modules: ['INCLUSIVE'] as const, // Wraps any output module
    description: 'Universal accessibility transformation for all output-producing modules',
    emergentProperty: 'Universal accessibility without per-module implementation',
    status: 'descriptive_only',
    documentedAt: '2025-01-30',
  },
  {
    id: 'SEP-004',
    name: 'Behavioral Drift Prevention',
    modules: ['BRAIN', 'DREAM', 'SYSTEM'] as const,
    description: 'Memory consolidation patterns monitored to prevent accumulated drift',
    emergentProperty: 'Long-term behavioral consistency',
    status: 'descriptive_only',
    documentedAt: '2025-01-30',
  },
  {
    id: 'SEP-005',
    name: 'Threat Response',
    modules: ['DEFENSE', 'VISION', 'SYSTEM', 'CORE'] as const,
    description: 'Layered defense with rapid threat containment across modules',
    emergentProperty: 'Millisecond threat isolation',
    status: 'descriptive_only',
    documentedAt: '2025-01-30',
  },
] as const);

// ═══════════════════════════════════════════════════════════════
// LOOKUP UTILITIES (READ-ONLY)
// ═══════════════════════════════════════════════════════════════

/**
 * Get pipeline by ID (read-only lookup)
 */
export function getPipelineById(id: string): SynergyPipeline | undefined {
  return SYNERGY_PIPELINES.find(p => p.id === id);
}

/**
 * Get all pipelines involving a specific module (read-only)
 */
export function getPipelinesByModule(module: ModuleName): readonly SynergyPipeline[] {
  return SYNERGY_PIPELINES.filter(p => p.modules.includes(module));
}

/**
 * Get pipeline names as a simple list
 */
export function getPipelineNames(): readonly string[] {
  return SYNERGY_PIPELINES.map(p => p.name);
}

/**
 * Export registry version for documentation — wired to store
 */
import { SUBSTRATE_VERSION as _PV } from '@/lib/substrate/versions';
export const PIPELINE_REGISTRY_VERSION = _PV;
export const PIPELINE_REGISTRY_STATUS = 'descriptive_only' as const;
export const PIPELINE_REGISTRY_COUNT = 300 as const; // 200 synergy + 100 crystallized
