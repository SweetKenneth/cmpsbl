/**
 * Substrate Module Version Registry
 * All versions derive from the Zustand store — update once, reflects everywhere.
 */

import { getMetric } from '@/stores/publicMetricsStore';

// ─── Canonical version (single source of truth) ───────────────────────────────

/** Read version from Zustand store — never hardcode */
function v(): string { return getMetric('version'); }

export const SUBSTRATE_VERSION = v();
export const SUBSTRATE_CODENAME = getMetric('codename');
export const SUBSTRATE_EPOCH = getMetric('epoch');
export const SUBSTRATE_BUILD = `${v()}-${new Date().toISOString().split('T')[0]}`;

// ─── 10 Public Entities ────────────────────────────────────────────────────────

export const MODULE_VERSIONS = {
  core:        { get version() { return v(); }, codename: 'Foundation',   layer: 'Kernel',         type: 'kernel'  as const, hardening: '2.0.0', invokeLayer: '2.0.0-ironclad' },
  decode:      { get version() { return v(); }, codename: 'Interpreter',  layer: 'Cognitive',      type: 'module'  as const, hardening: '2.0.0' },
  encode:      { get version() { return v(); }, codename: 'Genesis',      layer: 'Orchestration',  type: 'module'  as const, hardening: '2.0.0' },
  vision:      { get version() { return v(); }, codename: 'Vee',          layer: 'Operational',    type: 'module'  as const, hardening: '2.0.0' },
  cortex:      { get version() { return v(); }, codename: 'Orchestrator', layer: 'Orchestration',  type: 'module'  as const, hardening: '2.0.0' },
  nexus:       { get version() { return v(); }, codename: 'Router',       layer: 'Orchestration',  type: 'module'  as const },
  economy:     { get version() { return v(); }, codename: 'Treasury',     layer: 'Infrastructure', type: 'module'  as const, hardening: '2.0.0' },
  sandbox:     { get version() { return v(); }, codename: 'Crucible',     layer: 'Infrastructure', type: 'module'  as const },
  inclusive:   { get version() { return v(); }, codename: 'Clarity',      layer: 'Operational',    type: 'module'  as const },
  integration: { get version() { return v(); }, codename: 'Bridge',       layer: 'Operational',    type: 'module'  as const },
};

// ─── 5 Mesh Overlays ──────────────────────────────────────────────────────────

export const MESH_VERSIONS = {
  defense:    { get version() { return v(); }, codename: 'Guardian',  order: 1, position: 'outermost'  as const, hardening: '2.0.0' },
  immunity:   { get version() { return v(); }, codename: 'Sentinel',  order: 2, position: 'outer'      as const },
  evolution:  { get version() { return v(); }, codename: 'Phoenix',   order: 3, position: 'middle'     as const },
  intent:     { get version() { return v(); }, codename: 'Compass',   order: 4, position: 'inner'      as const },
  governance: { get version() { return v(); }, codename: 'Arbiter',   order: 5, position: 'innermost'  as const, hardening: '2.0.0' },
};

// ─── 9 Zones ──────────────────────────────────────────────────────────────────

export const ZONE_VERSIONS = {
  system:   { get version() { return v(); }, codename: 'Production',  parent: 'CCR' as const, description: 'Administration & config', hardening: '2.0.0' },
  brain:    { get version() { return v(); }, codename: 'Memoria',     parent: 'CCR' as const, description: 'Reasoning & learning' },
  memory:   { get version() { return v(); }, codename: 'Vault',       parent: 'CCR' as const, description: 'Persistent storage & retrieval' },
  dream:    { get version() { return v(); }, codename: 'Nocturne',    parent: 'CCR' as const, description: 'Offline synthesis & evolution' },
  ripple:   { get version() { return v(); }, codename: 'Cascade',     parent: 'OCG' as const, description: 'Event bus & signal propagation' },
  access:   { get version() { return v(); }, codename: 'Gatekeeper',  parent: 'OCG' as const, description: 'API keys & rate limiting' },
  identity: { get version() { return v(); }, codename: 'Provenance',  parent: 'OCG' as const, description: 'Actor identity & trust' },
  relay:    { get version() { return v(); }, codename: 'Dispatch',    parent: 'OCG' as const, description: 'Webhook & outbound routing' },
  audit:    { get version() { return v(); }, codename: 'Ledger',      parent: 'OCG' as const, description: 'Immutable compliance logging' },
};

// ─── Absorbed ─────────────────────────────────────────────────────────────────

export const ABSORBED_VERSIONS = {
  modernizer: { get version() { return v(); }, codename: 'Architect', absorbedBy: 'evolution', description: 'Self-upgrade → EVOLUTION mesh' },
};

// ─── Control Planes ───────────────────────────────────────────────────────────

export const CONTROL_PLANE_VERSIONS = {
  atlas:  { get version() { return v(); }, codename: 'Prometheus',            description: 'Centralized Control Plane' },
  seba:   { get version() { return v(); }, codename: 'Full Spectrum Autonomy', description: 'Self-Evolving Bounded Agent' },
  encode: { get version() { return v(); }, codename: 'Genesis',               description: 'Code Execution Intelligence' },
  clm:    { get version() { return v(); }, codename: 'Perpetual',             description: 'Constant Learning Mode' },
};

// ─── Synergy Engine ───────────────────────────────────────────────────────────

export const SYNERGY_VERSION = {
  get version() { return v(); },
  pipelines: 300,
  executors: 125,
  stierPipelines: 32,
};

// ─── Utilities ────────────────────────────────────────────────────────────────

export function getModuleVersion(module: keyof typeof MODULE_VERSIONS): { version: string; codename: string; layer: string } {
  return MODULE_VERSIONS[module];
}

export function getAllVersions(): Record<string, string> {
  const versions: Record<string, string> = {
    substrate: v(),
    synergy_pipelines: String(SYNERGY_VERSION.pipelines),
    synergy_executors: String(SYNERGY_VERSION.executors),
  };
  for (const [module, info] of Object.entries(MODULE_VERSIONS)) {
    versions[module] = info.version;
  }
  for (const [plane, info] of Object.entries(CONTROL_PLANE_VERSIONS)) {
    versions[plane] = info.version;
  }
  return versions;
}

export function isVersionCompatible(required: string, actual: string): boolean {
  const [reqMajor, reqMinor = 0] = required.split('.').map(Number);
  const [actMajor, actMinor = 0] = actual.split('.').map(Number);
  return actMajor > reqMajor || (actMajor === reqMajor && actMinor >= reqMinor);
}

export function getModulesByLayer(layer: 'Kernel' | 'Cognitive' | 'Operational' | 'Orchestration' | 'Infrastructure'): string[] {
  return Object.entries(MODULE_VERSIONS)
    .filter(([_, info]) => info.layer === layer)
    .map(([name]) => name);
}

export function getMeshOrder(): string[] {
  return Object.entries(MESH_VERSIONS)
    .sort(([, a], [, b]) => a.order - b.order)
    .map(([name]) => name);
}

export function getZonesByParent(parent: 'CCR' | 'OCG'): string[] {
  return Object.entries(ZONE_VERSIONS)
    .filter(([_, info]) => info.parent === parent)
    .map(([name]) => name);
}
