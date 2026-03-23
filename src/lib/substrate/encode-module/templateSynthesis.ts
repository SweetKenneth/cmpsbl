/**
 * ENCODE Template Synthesis Engine — v1.0.0
 * Learns from successful patch patterns and auto-generates new templates.
 * 
 * Process:
 *   1. Record successful patch outcomes
 *   2. Extract structural patterns (file shape, import pattern, code structure)
 *   3. Cluster similar patterns
 *   4. Synthesize reusable templates with confidence scoring
 */

import type { PatchPlan, PatchArtifact } from './patchPlanValidator';
import type { QualityReport } from './codeQualityScorer';

// ═══ Types ════════════════════════════════════════════════════════

export interface SynthesizedTemplate {
  id: string;
  name: string;
  description: string;
  surface: string;
  pattern: TemplatePattern;
  confidence: number;
  successCount: number;
  avgQualityScore: number;
  createdAt: string;
  lastUsedAt?: string;
}

export interface TemplatePattern {
  fileStructure: string[]; // e.g., ['types.ts', 'index.ts', 'utils.ts']
  importPatterns: string[]; // common import patterns
  codeStructure: CodeStructureHint[];
  conventions: string[];
}

export interface CodeStructureHint {
  type: 'export_function' | 'export_const' | 'interface' | 'type' | 'class' | 'enum';
  namePattern: string; // regex pattern for naming
  frequency: number; // how often this appears
}

export interface PatchOutcome {
  plan: PatchPlan;
  quality: QualityReport;
  success: boolean;
  surface: string;
  recordedAt: string;
}

// ═══ State ═════════════════════════════════════════════════════════

const outcomes: PatchOutcome[] = [];
const templates: SynthesizedTemplate[] = [];
const MAX_OUTCOMES = 500;
const MAX_TEMPLATES = 100;
const MIN_PATTERNS_FOR_SYNTHESIS = 3;
let templateCounter = 0;

// ═══ Pattern Extraction ═══════════════════════════════════════════

function extractPattern(artifacts: PatchArtifact[]): TemplatePattern {
  const fileStructure = artifacts
    .map(a => a.filePath?.split('/').pop() || '')
    .filter(Boolean);

  const importPatterns: string[] = [];
  const codeStructure: CodeStructureHint[] = [];
  const conventions: string[] = [];

  for (const art of artifacts) {
    if (!art.content) continue;

    // Extract import patterns
    const imports = art.content.match(/import\s+.*?\s+from\s+['"]([^'"]+)['"]/g) || [];
    for (const imp of imports) {
      const from = imp.match(/from\s+['"]([^'"]+)['"]/)?.[1] || '';
      if (from.startsWith('@/') || from.startsWith('./')) {
        importPatterns.push(from);
      }
    }

    // Extract code structure hints
    const exportFns = art.content.match(/export\s+(async\s+)?function\s+(\w+)/g) || [];
    for (const fn of exportFns) {
      const name = fn.match(/function\s+(\w+)/)?.[1] || '';
      codeStructure.push({ type: 'export_function', namePattern: name, frequency: 1 });
    }

    const interfaces = art.content.match(/export\s+interface\s+(\w+)/g) || [];
    for (const iface of interfaces) {
      const name = iface.match(/interface\s+(\w+)/)?.[1] || '';
      codeStructure.push({ type: 'interface', namePattern: name, frequency: 1 });
    }

    // Detect conventions
    if (art.content.includes('Object.freeze')) conventions.push('immutable_constants');
    if (art.content.includes('readonly ')) conventions.push('readonly_properties');
    if (/\/\*\*[\s\S]*?\*\//.test(art.content)) conventions.push('jsdoc_comments');
    if (art.content.includes('export type')) conventions.push('explicit_type_exports');
  }

  return {
    fileStructure: [...new Set(fileStructure)],
    importPatterns: [...new Set(importPatterns)].slice(0, 10),
    codeStructure,
    conventions: [...new Set(conventions)],
  };
}

// ═══ Pattern Similarity ═══════════════════════════════════════════

function patternSimilarity(a: TemplatePattern, b: TemplatePattern): number {
  // File structure similarity (Jaccard)
  const filesA = new Set(a.fileStructure);
  const filesB = new Set(b.fileStructure);
  const fileIntersect = [...filesA].filter(f => filesB.has(f)).length;
  const fileUnion = new Set([...filesA, ...filesB]).size;
  const fileSim = fileUnion > 0 ? fileIntersect / fileUnion : 0;

  // Convention similarity
  const convA = new Set(a.conventions);
  const convB = new Set(b.conventions);
  const convIntersect = [...convA].filter(c => convB.has(c)).length;
  const convUnion = new Set([...convA, ...convB]).size;
  const convSim = convUnion > 0 ? convIntersect / convUnion : 0;

  // Structure type similarity
  const typesA = new Set(a.codeStructure.map(s => s.type));
  const typesB = new Set(b.codeStructure.map(s => s.type));
  const typeIntersect = [...typesA].filter(t => typesB.has(t)).length;
  const typeUnion = new Set([...typesA, ...typesB]).size;
  const typeSim = typeUnion > 0 ? typeIntersect / typeUnion : 0;

  return fileSim * 0.4 + convSim * 0.3 + typeSim * 0.3;
}

// ═══ Core API ═════════════════════════════════════════════════════

/**
 * Record a successful patch outcome for pattern learning
 */
export function recordOutcome(
  plan: PatchPlan,
  quality: QualityReport,
  success: boolean,
): void {
  outcomes.push({
    plan,
    quality,
    success,
    surface: plan.targetSurface,
    recordedAt: new Date().toISOString(),
  });

  if (outcomes.length > MAX_OUTCOMES) {
    outcomes.shift();
  }

  // Attempt synthesis after each new outcome
  if (success && quality.overall >= 70) {
    trySynthesis();
  }
}

/**
 * Attempt to synthesize new templates from accumulated patterns
 */
export function trySynthesis(): SynthesizedTemplate | null {
  const successfulOutcomes = outcomes.filter(o => o.success && o.quality.overall >= 60);
  if (successfulOutcomes.length < MIN_PATTERNS_FOR_SYNTHESIS) return null;

  // Group by surface
  const bySurface = new Map<string, PatchOutcome[]>();
  for (const o of successfulOutcomes) {
    const list = bySurface.get(o.surface) || [];
    list.push(o);
    bySurface.set(o.surface, list);
  }

  for (const [surface, group] of bySurface.entries()) {
    if (group.length < MIN_PATTERNS_FOR_SYNTHESIS) continue;

    // Extract patterns
    const patterns = group.map(o => extractPattern(o.plan.artifacts));

    // Find clusters of similar patterns
    for (let i = 0; i < patterns.length; i++) {
      const similar = patterns.filter((p, j) => j !== i && patternSimilarity(patterns[i], p) > 0.6);

      if (similar.length >= MIN_PATTERNS_FOR_SYNTHESIS - 1) {
        // Merge into a template
        const merged = mergePatterns([patterns[i], ...similar]);
        const avgQuality = group.reduce((s, o) => s + o.quality.overall, 0) / group.length;

        // Check if this template already exists
        const existingMatch = templates.find(t =>
          t.surface === surface && patternSimilarity(t.pattern, merged) > 0.8,
        );

        if (existingMatch) {
          existingMatch.successCount++;
          existingMatch.confidence = Math.min(1, existingMatch.confidence + 0.05);
          existingMatch.avgQualityScore = avgQuality;
          return existingMatch;
        }

        const template: SynthesizedTemplate = {
          id: `tpl_${++templateCounter}`,
          name: `${surface}_pattern_${templateCounter}`,
          description: `Auto-synthesized from ${similar.length + 1} successful ${surface} patches`,
          surface,
          pattern: merged,
          confidence: Math.min(1, 0.5 + (similar.length * 0.1)),
          successCount: similar.length + 1,
          avgQualityScore: avgQuality,
          createdAt: new Date().toISOString(),
        };

        templates.push(template);
        if (templates.length > MAX_TEMPLATES) templates.shift();

        return template;
      }
    }
  }

  return null;
}

function mergePatterns(patterns: TemplatePattern[]): TemplatePattern {
  const allFiles = new Map<string, number>();
  const allImports = new Map<string, number>();
  const allConventions = new Map<string, number>();

  for (const p of patterns) {
    for (const f of p.fileStructure) allFiles.set(f, (allFiles.get(f) || 0) + 1);
    for (const i of p.importPatterns) allImports.set(i, (allImports.get(i) || 0) + 1);
    for (const c of p.conventions) allConventions.set(c, (allConventions.get(c) || 0) + 1);
  }

  const threshold = patterns.length * 0.5;

  return {
    fileStructure: [...allFiles.entries()].filter(([, c]) => c >= threshold).map(([f]) => f),
    importPatterns: [...allImports.entries()].filter(([, c]) => c >= threshold).map(([i]) => i),
    codeStructure: patterns[0]?.codeStructure || [],
    conventions: [...allConventions.entries()].filter(([, c]) => c >= threshold).map(([c]) => c),
  };
}

/**
 * Get all synthesized templates
 */
export function getTemplates(surface?: string): SynthesizedTemplate[] {
  const filtered = surface ? templates.filter(t => t.surface === surface) : templates;
  return [...filtered].sort((a, b) => b.confidence - a.confidence);
}

/**
 * Find a matching template for a given plan
 */
export function findMatchingTemplate(plan: PatchPlan): SynthesizedTemplate | null {
  const pattern = extractPattern(plan.artifacts);

  let bestMatch: SynthesizedTemplate | null = null;
  let bestSim = 0;

  for (const tpl of templates) {
    if (tpl.surface !== plan.targetSurface) continue;
    const sim = patternSimilarity(tpl.pattern, pattern);
    if (sim > bestSim && sim > 0.6) {
      bestMatch = tpl;
      bestSim = sim;
    }
  }

  if (bestMatch) {
    bestMatch.lastUsedAt = new Date().toISOString();
  }

  return bestMatch;
}
