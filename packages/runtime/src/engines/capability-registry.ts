/**
 * CMPSBL® Capability Registry — Declarative Behavior Catalog
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Phase 2: First-Class Attachments
 *
 * Every capability is a named, deterministic behavior contract.
 * The registry replaces the hardcoded switch in the orchestration engine
 * with a declarative, extensible catalog.
 *
 * Design constraints:
 *   - No capability can be registered twice (idempotent, first-write wins)
 *   - Action chains are immutable after registration
 *   - Unknown capabilities resolve to a safe default (log_only)
 *   - Registry is queryable for introspection/proof
 *
 * © CMPSBL® — All rights reserved.
 */

import type { OrchestrationAction, OrchestrationSignal } from './orchestration-engine';

// ═══════════════════════════════════════════════════════════════════════════════
// §1 — TYPES
// ═══════════════════════════════════════════════════════════════════════════════

/** A registered capability definition */
export interface CapabilityDefinition {
  /** Unique slug (e.g. 'defense_gate') */
  readonly slug: string;
  /** Human-readable description */
  readonly description: string;
  /** The primitive category this capability belongs to */
  readonly primitiveCategory: string;
  /** Default action chain when no policy overrides */
  readonly defaultActions: readonly OrchestrationAction[];
  /** Default signal to listen on when no policy.on is declared */
  readonly defaultSignal: OrchestrationSignal;
  /** Whether this capability includes enforcement (throws) */
  readonly enforces: boolean;
}

/** Input for registering a new capability */
export interface CapabilityRegistrationInput {
  readonly slug: string;
  readonly description: string;
  readonly primitiveCategory: string;
  readonly defaultActions: readonly OrchestrationAction[];
  readonly defaultSignal?: OrchestrationSignal;
  readonly enforces?: boolean;
}

/** Introspection summary */
export interface CapabilityRegistrySummary {
  readonly totalCapabilities: number;
  readonly enforcingCapabilities: number;
  readonly observingCapabilities: number;
  readonly categories: readonly string[];
}

// ═══════════════════════════════════════════════════════════════════════════════
// §2 — REGISTRY STORAGE
// ═══════════════════════════════════════════════════════════════════════════════

const registry = new Map<string, CapabilityDefinition>();

// ═══════════════════════════════════════════════════════════════════════════════
// §3 — REGISTRATION
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Register a capability definition. Idempotent — first write wins.
 * Returns true if newly registered, false if already existed.
 */
export function registerCapability(input: CapabilityRegistrationInput): boolean {
  if (registry.has(input.slug)) return false;

  const definition: CapabilityDefinition = {
    slug: input.slug,
    description: input.description,
    primitiveCategory: input.primitiveCategory,
    defaultActions: [...input.defaultActions],
    defaultSignal: input.defaultSignal ?? 'execution_started',
    enforces: input.enforces ?? input.defaultActions.includes('block_execution'),
  };

  registry.set(input.slug, definition);
  return true;
}

// ═══════════════════════════════════════════════════════════════════════════════
// §4 — RESOLUTION
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Resolve a capability slug to its default action chain.
 * Returns ['log_only'] for unknown capabilities (safe fallback).
 */
export function resolveCapabilityActions(slug: string): readonly OrchestrationAction[] {
  const def = registry.get(slug);
  return def ? def.defaultActions : ['log_only'];
}

/**
 * Resolve a capability slug to its default signal.
 * Returns 'execution_started' for unknown capabilities.
 */
export function resolveCapabilitySignal(slug: string): OrchestrationSignal {
  const def = registry.get(slug);
  return def ? def.defaultSignal : 'execution_started';
}

/**
 * Get a capability definition by slug, or undefined if not registered.
 */
export function getCapabilityDefinition(slug: string): CapabilityDefinition | undefined {
  return registry.get(slug);
}

/**
 * Check if a capability enforces (includes block_execution or similar terminal action).
 */
export function isEnforcingCapability(slug: string): boolean {
  const def = registry.get(slug);
  return def?.enforces ?? false;
}

// ═══════════════════════════════════════════════════════════════════════════════
// §5 — INTROSPECTION
// ═══════════════════════════════════════════════════════════════════════════════

/** Get all registered capability slugs */
export function getRegisteredCapabilities(): readonly string[] {
  return Array.from(registry.keys());
}

/** Get all registered capability definitions (immutable snapshot) */
export function getCapabilityDefinitions(): readonly CapabilityDefinition[] {
  return Array.from(registry.values());
}

/** Get capabilities for a specific primitive category */
export function getCapabilitiesForCategory(category: string): readonly CapabilityDefinition[] {
  return Array.from(registry.values()).filter(d => d.primitiveCategory === category);
}

/** Generate a summary of the registry for proof/audit */
export function getRegistrySummary(): CapabilityRegistrySummary {
  const defs = Array.from(registry.values());
  const categories = new Set(defs.map(d => d.primitiveCategory));

  return {
    totalCapabilities: defs.length,
    enforcingCapabilities: defs.filter(d => d.enforces).length,
    observingCapabilities: defs.filter(d => !d.enforces).length,
    categories: Array.from(categories).sort(),
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// §6 — RESET (TESTING ONLY)
// ═══════════════════════════════════════════════════════════════════════════════

export function resetCapabilityRegistry(): void {
  registry.clear();
}

// ═══════════════════════════════════════════════════════════════════════════════
// §7 — BUILT-IN CAPABILITIES (Phase 2 seed)
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Seed the registry with the core capability catalog.
 * Called once at module load — idempotent.
 */
function seedBuiltinCapabilities(): void {
  registerCapability({
    slug: 'defense_gate',
    description: 'Input validation and execution blocking for security boundaries',
    primitiveCategory: 'DEFENSE',
    defaultActions: ['validate_input', 'block_execution'],
    defaultSignal: 'execution_started',
    enforces: true,
  });

  registerCapability({
    slug: 'governance_hook',
    description: 'Policy enforcement checkpoint for governed execution paths',
    primitiveCategory: 'GOVERNANCE',
    defaultActions: ['tighten_interception'],
    defaultSignal: 'execution_started',
    enforces: false,
  });

  registerCapability({
    slug: 'beacon_telemetry',
    description: 'Health signal emission and state persistence for observability',
    primitiveCategory: 'BEACON',
    defaultActions: ['persist_state'],
    defaultSignal: 'execution_succeeded',
    enforces: false,
  });

  registerCapability({
    slug: 'circuit_breaker',
    description: 'Failure detection and execution tripping for resilience',
    primitiveCategory: 'FAILSAFE',
    defaultActions: ['trip_execution'],
    defaultSignal: 'execution_failed',
    enforces: false,
  });

  registerCapability({
    slug: 'audit_trail',
    description: 'Immutable execution record persistence for compliance',
    primitiveCategory: 'AUDIT',
    defaultActions: ['persist_state'],
    defaultSignal: 'execution_started',
    enforces: false,
  });

  registerCapability({
    slug: 'state_snapshot',
    description: 'Runtime state capture and persistence for memory primitives',
    primitiveCategory: 'MEMORY',
    defaultActions: ['persist_state'],
    defaultSignal: 'execution_succeeded',
    enforces: false,
  });

  registerCapability({
    slug: 'anomaly_watch',
    description: 'Anomaly detection and alerting for sentinel primitives',
    primitiveCategory: 'SENTINEL',
    defaultActions: ['log_only', 'tighten_interception'],
    defaultSignal: 'anomaly_detected',
    enforces: false,
  });

  registerCapability({
    slug: 'oracle_analysis',
    description: 'Deep analysis and insight persistence for oracle primitives',
    primitiveCategory: 'ORACLE',
    defaultActions: ['persist_state', 'log_only'],
    defaultSignal: 'execution_succeeded',
    enforces: false,
  });

  registerCapability({
    slug: 'immunity_shield',
    description: 'Self-healing validation and interception tightening',
    primitiveCategory: 'IMMUNITY',
    defaultActions: ['validate_input', 'tighten_interception'],
    defaultSignal: 'execution_started',
    enforces: false,
  });

  registerCapability({
    slug: 'conscience_check',
    description: 'Ethical boundary validation for conscience-governed paths',
    primitiveCategory: 'CONSCIENCE',
    defaultActions: ['validate_input', 'log_only'],
    defaultSignal: 'execution_started',
    enforces: false,
  });
}

/* Auto-seed on module load */
seedBuiltinCapabilities();
