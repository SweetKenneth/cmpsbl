/**
 * Template Generation Policy — Pack-Aware Gating
 * 
 * Ensures the Template Generator cannot bypass pack entitlements.
 * At generation time:
 *   - If required packs are active → full template
 *   - Else → baseline-safe variant with capability requirement stubs
 * 
 * Internal only — never exposed on public surfaces.
 */

import { ARTIFACT_PACKS, type ArtifactPack } from '@/lib/quarry/types';

// ═══════════════════════════════════════════════════════════════════════════════
// COMPONENT → PACK MAPPING
// ═══════════════════════════════════════════════════════════════════════════════

/** Build a reverse index: component ID → pack IDs that contain it */
function buildComponentPackIndex(): Map<string, string[]> {
  const index = new Map<string, string[]>();
  for (const pack of ARTIFACT_PACKS) {
    for (const comp of pack.components) {
      const existing = index.get(comp) ?? [];
      existing.push(pack.id);
      index.set(comp, existing);
    }
    for (const cp of pack._crystallizedPipelines) {
      const existing = index.get(cp) ?? [];
      existing.push(pack.id);
      index.set(cp, existing);
    }
  }
  return index;
}

const COMPONENT_PACK_INDEX = buildComponentPackIndex();

// ═══════════════════════════════════════════════════════════════════════════════
// CATEGORY → REQUIRED COMPONENTS MAPPING
// ═══════════════════════════════════════════════════════════════════════════════

/** Maps template categories to the component IDs they may reference */
const CATEGORY_COMPONENT_MAP: Record<string, string[]> = {
  'Brain':        ['memory-tiering', 'recall-engine', 'contradiction-detector', 'spaced-repetition'],
  'Decode':       ['intent-parser', 'ambiguity-resolver', 'hypothesis-scorer'],
  'Defense':      ['threat-correlator', 'drift-detector', 'policy-enforcer', 'trust-scorer'],
  'Nexus':        ['data-router', 'format-transformer', 'health-aware-router'],
  'Vision':       ['insight-synthesizer', 'hypothesis-validator', 'cross-domain-fusion'],
  'Dream':        ['nocturnal-runner', 'memory-consolidator', 'pattern-evolver'],
  'System':       ['scheduler', 'batch-runner', 'event-pipeline', 'dedup-guard'],
  'Integration':  ['cognitive-registry', 'agent-skills', 'competency-tracker'],
  'Cortex':       ['context-optimizer', 'temporal-scorer', 'salience-ranker'],
};

// ═══════════════════════════════════════════════════════════════════════════════
// POLICY EVALUATION
// ═══════════════════════════════════════════════════════════════════════════════

export type GenerationMode = 'full' | 'degraded';

export interface TemplatePolicy {
  mode: GenerationMode;
  /** Pack IDs required for full generation */
  requiredPacks: string[];
  /** Pack IDs the user currently has active */
  activePacks: string[];
  /** Missing pack IDs (required but not active) */
  missingPacks: string[];
  /** Human-readable missing pack names */
  missingPackNames: string[];
}

/**
 * Evaluate template generation policy for a given category.
 * @param category - Template category (e.g., 'Brain', 'Defense')
 * @param activePackIds - Set of user's currently active pack IDs
 */
export function evaluateTemplatePolicy(
  category: string,
  activePackIds: Set<string>
): TemplatePolicy {
  const components = CATEGORY_COMPONENT_MAP[category] ?? [];

  // Collect unique required packs for this category
  const requiredPacks = new Set<string>();
  for (const comp of components) {
    const packs = COMPONENT_PACK_INDEX.get(comp) ?? [];
    for (const p of packs) requiredPacks.add(p);
  }

  const missingPacks: string[] = [];
  for (const packId of requiredPacks) {
    if (!activePackIds.has(packId)) {
      missingPacks.push(packId);
    }
  }

  const packNameMap = new Map(ARTIFACT_PACKS.map(p => [p.id, p.name]));

  return {
    mode: missingPacks.length === 0 ? 'full' : 'degraded',
    requiredPacks: [...requiredPacks],
    activePacks: [...requiredPacks].filter(p => activePackIds.has(p)),
    missingPacks,
    missingPackNames: missingPacks.map(id => packNameMap.get(id) ?? id),
  };
}

/**
 * Generate the capability requirements block for degraded templates.
 * Inserted as a comment header in generated code.
 */
export function generateRequirementsBlock(policy: TemplatePolicy): string {
  if (policy.mode === 'full') return '';

  const lines = [
    '// ═══════════════════════════════════════════════════════════════',
    '// CAPABILITY REQUIREMENTS',
    '// This template references pack-gated capabilities.',
    '// Activate the following packs to unlock full functionality:',
    '//',
    ...policy.missingPackNames.map(name => `//   → ${name}`),
    '//',
    '// Without these packs, stub implementations are provided below.',
    '// Visit /packs to manage your artifact activations.',
    '// ═══════════════════════════════════════════════════════════════',
    '',
  ];
  return lines.join('\n');
}

/**
 * Wrap a component reference in a PackGate-aware stub for degraded templates.
 */
export function generateStub(componentId: string): string {
  return [
    `// TODO: Requires pack activation for '${componentId}'`,
    `// Stub: returns baseline-safe fallback`,
    `function ${componentId.replace(/-/g, '_')}_stub(...args: unknown[]) {`,
    `  console.warn('[PackGate] ${componentId} requires an active capability pack.');`,
    `  return null;`,
    `}`,
  ].join('\n');
}

// ═══════════════════════════════════════════════════════════════════════════════
// AUDIT
// ═══════════════════════════════════════════════════════════════════════════════

export interface GenerationAuditEntry {
  timestamp: string;
  category: string;
  mode: GenerationMode;
  missingPackIds: string[];
  templateId?: string;
}

/** Build an audit entry for logging (caller is responsible for persistence) */
export function buildAuditEntry(
  category: string,
  policy: TemplatePolicy,
  templateId?: string
): GenerationAuditEntry {
  return {
    timestamp: new Date().toISOString(),
    category,
    mode: policy.mode,
    missingPackIds: policy.missingPacks,
    templateId,
  };
}
