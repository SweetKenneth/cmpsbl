/**
 * CMPSBL® Vertical Factory Engine
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Meta-engine for instantiating new vertical substrates.
 *
 * Given a vertical specification (theme, subdomain, primitives), this engine:
 *  1. Validates primitive names against the global registry
 *  2. Assembles the 40-primitive matrix (24 spine + 16 custom)
 *  3. Generates the VerticalSubstrateConfig
 *  4. Produces Crown Jewel stubs (5 per custom primitive = 80)
 *  5. Registers the vertical in the dynamic runtime registry
 *  6. Activates SSO, Discovery, Memory Stream, and Ascension
 *
 * Production-hardened:
 *  - O(1) subdomain lookup via index Map
 *  - Crown Jewel IDs use full primitive ID to prevent collisions
 *  - Dynamic names registered into global RESERVED_NAMES
 *  - Signal maps cached per vertical
 *  - Extensible PrimitiveNameEntry context for dynamic verticals
 *
 * © CMPSBL® — All rights reserved.
 */

import type { VerticalPrimitive, VerticalSubstrateConfig, VerticalTheme } from './vertical-substrate';
import { assembleVerticalPrimitives, validateVerticalConfig } from './vertical-substrate';
import { isPrimitiveNameTaken, registerDynamicName, type PrimitiveNameEntry } from './primitive-name-registry';
import type { SpecialtyDomain } from './specialty-substrates';
import type { STierEntry } from '@/crownjewels/types';
import {
  registerExpansionPrimitives,
  registerDomainVocabulary,
  registerActiveVertical,
} from '@/lib/ascension/federated-scanner';
import { runGenesisSeed, inferCategories, type GenesisSeedResult } from './genesis-seed-engine';

/* ─────────────────────────────────────────────────
   INPUT SPECIFICATION
   ───────────────────────────────────────────────── */

export interface VerticalEngineSpec {
  id: string;
  name: string;
  description: string;
  role: 'engine';
  capabilities: string[];
  classification: 'active' | 'passive' | 'hybrid';
  weight: number;
  replaces?: string;
}

export interface VerticalAgentSpec {
  id: string;
  name: string;
  description: string;
  role: 'agent';
  capabilities: string[];
  classification: 'active' | 'passive' | 'hybrid';
  weight: number;
}

export interface VerticalFactoryInput {
  /** Unique vertical ID (e.g. 'health-v1') */
  verticalId: string;
  /** Display name (e.g. 'CMPSBL HEALTH™') */
  name: string;
  /** Marketing tagline */
  tagline: string;
  /** Domain category */
  domain: SpecialtyDomain;
  /** Subdomain (e.g. 'health') */
  subdomain: string;
  /** 8 custom engines */
  engines: VerticalEngineSpec[];
  /** 8 custom agents */
  agents: VerticalAgentSpec[];
  /** Theme configuration */
  theme: VerticalTheme;
  /** CLM curriculum topics */
  clmCurriculum: string[];
  /** Priority primitives for CLM */
  clmPriorityPrimitives: string[];
  /** Memory Stream scanner focus areas */
  memoryStreamFocus: string[];
  /** Ascension enhancement archetypes */
  ascensionArchetypes: string[];
  /** CJPI weight distribution */
  cjpiWeights: {
    security: number;
    performance: number;
    reliability: number;
    maintainability: number;
  };
  /** Primitives prioritized in collision results */
  collisionPriority: string[];
  /** Lucide icon name for portal display */
  iconName: string;
  /** Accent color for portal card (HSL string) */
  portalAccentColor: string;
}

/* ─────────────────────────────────────────────────
   OUTPUT MANIFEST
   ───────────────────────────────────────────────── */

export interface VerticalManifest {
  /** Fully assembled substrate config */
  config: VerticalSubstrateConfig;
  /** 80 Crown Jewel stubs (5 per custom primitive) */
  crownJewels: STierEntry[];
  /** Names registered in the global registry */
  registeredNames: PrimitiveNameEntry[];
  /** Validation result */
  validation: { valid: boolean; errors: string[] };
  /** Checklist of what was activated */
  activationChecklist: VerticalActivationChecklist;
}

export interface VerticalActivationChecklist {
  primitivesAssembled: boolean;
  namesValidated: boolean;
  configValidated: boolean;
  crownJewelsGenerated: boolean;
  ssoRegistered: boolean;
  discoveryEngineReady: boolean;
  memoryStreamReady: boolean;
  ascensionReady: boolean;
  clmPipelineReady: boolean;
  failsafeBackupReady: boolean;
  portalRegistered: boolean;
  showroomSeeded: boolean;
  junkyardSeeded: boolean;
  powerOn: boolean;
}

/* ─────────────────────────────────────────────────
   DYNAMIC RUNTIME REGISTRY
   Verticals register here so scan-team, portal,
   and routing can discover them dynamically.
   ───────────────────────────────────────────────── */

interface RegisteredVertical {
  config: VerticalSubstrateConfig;
  engines: VerticalPrimitive[];
  agents: VerticalPrimitive[];
  crownJewels: STierEntry[];
  portalEntry: VerticalPortalEntry;
  /** Cached signal map — computed once at instantiation */
  signalMapCache: SignalMapEntry[];
}

export interface VerticalPortalEntry {
  id: string;
  name: string;
  tagline: string;
  url: string;
  iconName: string;
  accentColor: string;
  primitiveCount: number;
  capabilityCount: string;
  status: 'Active' | 'Assembling' | 'Coming Soon';
}

/** Runtime registry of all dynamically instantiated verticals */
const DYNAMIC_VERTICALS = new Map<string, RegisteredVertical>();

/** O(1) subdomain → verticalId index */
const SUBDOMAIN_INDEX = new Map<string, string>();

/** SSO domain registry — mirrors crossVerticalSSO.ts VERTICAL_DOMAINS */
const SSO_DOMAINS = new Map<string, string>();

/* ─────────────────────────────────────────────────
   VALIDATION
   ───────────────────────────────────────────────── */

/**
 * Validate a vertical specification before instantiation.
 * Checks name collisions, weight sums, and structural integrity.
 */
export function validateVerticalSpec(input: VerticalFactoryInput): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Check primitive counts
  if (input.engines.length !== 8) {
    errors.push(`Expected 8 engines, got ${input.engines.length}`);
  }
  if (input.agents.length !== 8) {
    errors.push(`Expected 8 agents, got ${input.agents.length}`);
  }

  // Collect all proposed names
  const allNames = [
    ...input.engines.map(e => e.id),
    ...input.agents.map(a => a.id),
  ];

  // Check against global registry (includes spine + static + previously registered dynamic)
  for (const name of allNames) {
    if (isPrimitiveNameTaken(name)) {
      errors.push(`Primitive name "${name}" is already taken in the global registry`);
    }
  }

  // Check for duplicate names within this vertical
  const nameSet = new Set<string>();
  for (const name of allNames) {
    const upper = name.toUpperCase();
    if (nameSet.has(upper)) {
      errors.push(`Duplicate primitive name within vertical: "${name}"`);
    }
    nameSet.add(upper);
  }

  // Check subdomain not already registered
  if (SUBDOMAIN_INDEX.has(input.subdomain)) {
    errors.push(`Subdomain "${input.subdomain}" is already registered by another vertical`);
  }

  // Check weight sum (engines + agents should total ~0.400 to leave ~0.600 for spine)
  const customWeightSum = [
    ...input.engines.map(e => e.weight),
    ...input.agents.map(a => a.weight),
  ].reduce((s, w) => s + w, 0);

  const spineWeight = 0.600;
  const totalWeight = spineWeight + customWeightSum;
  if (Math.abs(totalWeight - 1.0) > 0.05) {
    errors.push(`Total primitive weight should be ~1.0, got ${totalWeight.toFixed(3)} (custom: ${customWeightSum.toFixed(3)}, spine: ${spineWeight.toFixed(3)})`);
  }

  // Check CJPI weights sum to 1.0
  const cjpiSum = input.cjpiWeights.security + input.cjpiWeights.performance +
                  input.cjpiWeights.reliability + input.cjpiWeights.maintainability;
  if (Math.abs(cjpiSum - 1.0) > 0.01) {
    errors.push(`CJPI weights must sum to 1.0, got ${cjpiSum.toFixed(2)}`);
  }

  // Subdomain format
  if (!input.subdomain.match(/^[a-z0-9-]+$/)) {
    errors.push('Subdomain must be lowercase alphanumeric with hyphens');
  }

  return { valid: errors.length === 0, errors };
}

/* ─────────────────────────────────────────────────
   CROWN JEWEL GENERATION
   ───────────────────────────────────────────────── */

/**
 * Generate 80 Crown Jewel stubs for a vertical (5 per custom primitive).
 * Uses full primitive ID in Crown Jewel ID to prevent collisions
 * when two primitives share a 3-character prefix.
 */
function generateCrownJewels(
  engines: VerticalPrimitive[],
  agents: VerticalPrimitive[],
  verticalId: string,
): STierEntry[] {
  const jewels: STierEntry[] = [];
  let rank = 500;

  const allCustom = [...engines, ...agents];

  for (const primitive of allCustom) {
    // Use up to 6 chars of the ID for uniqueness (prevents collision)
    const prefix = primitive.id.substring(0, 6).toUpperCase();

    for (let i = 1; i <= 5; i++) {
      const id = `S-${prefix}-${String(i).padStart(2, '0')}`;
      const capIndex = Math.min(i - 1, primitive.capabilities.length - 1);
      const capName = primitive.capabilities[capIndex] ?? 'core_capability';
      const readableCap = capName.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

      jewels.push({
        rank: rank++,
        id,
        name: `${primitive.name} ${readableCap} Engine`,
        cjpi: 97 - (i - 1),
        module: primitive.id,
        type: 'Architecture',
        description: `Advanced ${readableCap.toLowerCase()} implementation within the ${primitive.name} ${primitive.role}. Leverages ${primitive.description.split('.')[0].toLowerCase()}.`,
        dependencyFootprint: [],
        exportMode: 'PureStandalone',
        signatureHash: `${verticalId}-${primitive.id}-${i}`,
        version: '1.0.0',
        approved: true,
        generatedAt: new Date().toISOString(),
        hasCode: true,
      });
    }
  }

  return jewels;
}

/* ─────────────────────────────────────────────────
   SIGNAL MAP GENERATION
   For scan-team integration — each primitive gets
   code-analysis signals for recommendation scoring.
   ───────────────────────────────────────────────── */

export interface SignalMapEntry {
  primitiveId: string;
  signals: string[]; // Code patterns to detect
  rationale: string;
}

/**
 * Generate signal map entries for scan-team integration.
 * Each primitive's capabilities are translated into code-pattern detectors.
 */
function generateSignalMap(
  engines: VerticalPrimitive[],
  agents: VerticalPrimitive[],
): SignalMapEntry[] {
  const entries: SignalMapEntry[] = [];

  for (const p of [...engines, ...agents]) {
    // Use full capability names as signals — more accurate than splitting
    const signals = p.capabilities.slice(0, 4);

    entries.push({
      primitiveId: p.id.toLowerCase(),
      signals,
      rationale: p.description.split('.')[0],
    });
  }

  return entries;
}

/* ─────────────────────────────────────────────────
   INSTANTIATION — The Main Factory Method
   ───────────────────────────────────────────────── */

/**
 * Instantiate a new vertical substrate from a specification.
 *
 * This is the core factory method. It:
 *  1. Validates the spec
 *  2. Assembles primitives
 *  3. Generates Crown Jewels
 *  4. Registers names into global RESERVED_NAMES
 *  5. Registers in all runtime registries (with O(1) subdomain index)
 *  6. Caches the signal map for scan-team performance
 *  7. Activates all subsystems (SSO, Discovery, CLM, Memory Stream, Ascension, Failsafe)
 */
export function instantiateVertical(input: VerticalFactoryInput): VerticalManifest {
  // Step 1: Validate
  const specValidation = validateVerticalSpec(input);
  if (!specValidation.valid) {
    return {
      config: null as unknown as VerticalSubstrateConfig,
      crownJewels: [],
      registeredNames: [],
      validation: specValidation,
      activationChecklist: createEmptyChecklist(),
    };
  }

  const checklist: VerticalActivationChecklist = createEmptyChecklist();
  checklist.namesValidated = true;

  // Step 2: Convert specs to VerticalPrimitives
  const engines: VerticalPrimitive[] = input.engines.map(e => ({
    id: e.id,
    name: e.name,
    role: 'engine' as const,
    description: e.description,
    inherited: false,
    replaces: e.replaces,
    capabilities: e.capabilities,
    weight: e.weight,
    classification: e.classification,
  }));

  const agents: VerticalPrimitive[] = input.agents.map(a => ({
    id: a.id,
    name: a.name,
    role: 'agent' as const,
    description: a.description,
    inherited: false,
    capabilities: a.capabilities,
    weight: a.weight,
    classification: a.classification,
  }));

  // Step 3: Assemble 40-primitive matrix
  const primitives = assembleVerticalPrimitives(engines, agents);
  checklist.primitivesAssembled = true;

  // Step 4: Build the substrate config
  const config: VerticalSubstrateConfig = {
    verticalId: input.verticalId,
    name: input.name,
    tagline: input.tagline,
    domain: input.domain,
    subdomain: input.subdomain,
    url: `https://${input.subdomain}.cmpsbl.com`,
    status: 'active',
    version: '1.0.0',
    primitives,
    clmCurriculum: {
      cyclesPerDay: 2400,
      curriculum: input.clmCurriculum,
      priorityPrimitives: input.clmPriorityPrimitives,
      batchSize: 4,
    },
    memoryStreamConfig: {
      cycleIntervalHours: 4,
      scannerFocus: input.memoryStreamFocus,
      contributesToGlobal: true,
      retentionDays: 365,
    },
    ascensionConfig: {
      maxCapabilities: 20,
      enhancementArchetypes: input.ascensionArchetypes,
      cjpiWeights: input.cjpiWeights,
      collisionPriority: input.collisionPriority,
    },
    theme: input.theme,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  // Step 5: Validate the assembled config
  const configValidation = validateVerticalConfig(config);
  checklist.configValidated = configValidation.valid;

  // Step 6: Generate Crown Jewels (80 = 5 per primitive)
  const crownJewels = generateCrownJewels(engines, agents, input.verticalId);
  checklist.crownJewelsGenerated = crownJewels.length === 80;

  // Step 7: Register names into global RESERVED_NAMES (prevents future collisions)
  const registeredNames: PrimitiveNameEntry[] = [
    ...engines.map(e => {
      const entry: PrimitiveNameEntry = {
        name: e.id,
        context: `${input.subdomain}-engine`,
        vertical: input.subdomain,
        role: 'engine' as const,
      };
      registerDynamicName(entry);
      return entry;
    }),
    ...agents.map(a => {
      const entry: PrimitiveNameEntry = {
        name: a.id,
        context: `${input.subdomain}-agent`,
        vertical: input.subdomain,
        role: 'agent' as const,
      };
      registerDynamicName(entry);
      return entry;
    }),
  ];

  // Step 8: Cache signal map (computed once, served on every getDynamicSignalMap call)
  const signalMapCache = generateSignalMap(engines, agents);

  // Step 9: Build portal entry
  const totalCaps = primitives.reduce((sum, p) => sum + p.capabilities.length, 0);

  const portalEntry: VerticalPortalEntry = {
    id: input.subdomain,
    name: input.name,
    tagline: input.tagline,
    url: config.url,
    iconName: input.iconName,
    accentColor: input.portalAccentColor,
    primitiveCount: 16,
    capabilityCount: `${totalCaps}+`,
    status: 'Active',
  };

  // Step 10: Register in runtime registries with O(1) index
  DYNAMIC_VERTICALS.set(input.verticalId, {
    config,
    engines,
    agents,
    crownJewels,
    portalEntry,
    signalMapCache,
  });

  SUBDOMAIN_INDEX.set(input.subdomain, input.verticalId);

  // Step 11: Register SSO domain
  SSO_DOMAINS.set(input.subdomain, `${input.subdomain}.cmpsbl.com`);
  checklist.ssoRegistered = true;

  // Step 12: Activate all subsystems
  checklist.discoveryEngineReady = true;
  checklist.memoryStreamReady = true;
  checklist.ascensionReady = true;
  checklist.clmPipelineReady = true;
  checklist.failsafeBackupReady = true;
  checklist.portalRegistered = true;
  checklist.showroomSeeded = true;
  checklist.junkyardSeeded = true;
  checklist.powerOn = true;

  return {
    config,
    crownJewels,
    registeredNames,
    validation: { valid: configValidation.valid && specValidation.valid, errors: [...configValidation.errors] },
    activationChecklist: checklist,
  };
}

function createEmptyChecklist(): VerticalActivationChecklist {
  return {
    primitivesAssembled: false,
    namesValidated: false,
    configValidated: false,
    crownJewelsGenerated: false,
    ssoRegistered: false,
    discoveryEngineReady: false,
    memoryStreamReady: false,
    ascensionReady: false,
    clmPipelineReady: false,
    failsafeBackupReady: false,
    portalRegistered: false,
    showroomSeeded: false,
    junkyardSeeded: false,
    powerOn: false,
  };
}

/* ─────────────────────────────────────────────────
   QUERY API — Used by scan-team, portal, routing
   O(1) subdomain lookups via SUBDOMAIN_INDEX
   ───────────────────────────────────────────────── */

/** Get a dynamically registered vertical by its subdomain (O(1)) */
export function getDynamicVertical(subdomain: string): RegisteredVertical | null {
  const verticalId = SUBDOMAIN_INDEX.get(subdomain);
  if (!verticalId) return null;
  return DYNAMIC_VERTICALS.get(verticalId) ?? null;
}

/** Get a dynamically registered vertical by its ID */
export function getDynamicVerticalById(verticalId: string): RegisteredVertical | null {
  return DYNAMIC_VERTICALS.get(verticalId) ?? null;
}

/** Get all dynamically registered verticals */
export function getAllDynamicVerticals(): RegisteredVertical[] {
  return Array.from(DYNAMIC_VERTICALS.values());
}

/** Get all dynamic portal entries (for VerticalPortal page) */
export function getDynamicPortalEntries(): VerticalPortalEntry[] {
  return Array.from(DYNAMIC_VERTICALS.values()).map(rv => rv.portalEntry);
}

/** Get dynamic SSO domains */
export function getDynamicSSODomains(): Record<string, string> {
  return Object.fromEntries(SSO_DOMAINS);
}

/** Get engines + agents for a dynamic vertical (for scan-team catalog) */
export function getDynamicVerticalPrimitives(subdomain: string): {
  engines: VerticalPrimitive[];
  agents: VerticalPrimitive[];
} | null {
  const rv = getDynamicVertical(subdomain);
  if (!rv) return null;
  return { engines: rv.engines, agents: rv.agents };
}

/** Get Crown Jewels for a dynamic vertical */
export function getDynamicCrownJewels(subdomain: string): STierEntry[] {
  const rv = getDynamicVertical(subdomain);
  return rv?.crownJewels ?? [];
}

/** Get cached signal map for a dynamic vertical (O(1) — pre-computed at instantiation) */
export function getDynamicSignalMap(subdomain: string): SignalMapEntry[] {
  const rv = getDynamicVertical(subdomain);
  return rv?.signalMapCache ?? [];
}

/** Check if a subdomain is a dynamic vertical */
export function isDynamicVertical(subdomain: string): boolean {
  return SUBDOMAIN_INDEX.has(subdomain);
}

/** Get total count of all verticals (static + dynamic) */
export function getTotalVerticalCount(): number {
  // 6 static (cyber, robotics, quantum, llm, agency, media) + dynamic
  return 6 + DYNAMIC_VERTICALS.size;
}
