/**
 * ENCODE Diff Simulation Engine — v1.0.0
 * Pre-apply diff simulation that projects patch impact on the codebase.
 * 
 * Projects:
 *   - Affected files (direct + transitive)
 *   - Import chain propagation
 *   - Type signature changes
 *   - Estimated blast radius
 * 
 * All analysis is static — no execution occurs.
 */

import type { PatchPlan, PatchArtifact } from './patchPlanValidator';

// ═══ Types ════════════════════════════════════════════════════════

export interface DiffSimulation {
  planId: string;
  directFiles: string[];
  transitiveFiles: string[];
  importChain: ImportLink[];
  typeChanges: TypeChange[];
  blastRadius: BlastRadius;
  riskAssessment: RiskAssessment;
  simulatedAt: string;
}

export interface ImportLink {
  from: string;
  to: string;
  type: 'import' | 're-export' | 'dynamic';
  affected: boolean;
}

export interface TypeChange {
  filePath: string;
  typeName: string;
  changeType: 'added' | 'removed' | 'modified';
  breaking: boolean;
}

export interface BlastRadius {
  directCount: number;
  transitiveCount: number;
  totalCount: number;
  severity: 'minimal' | 'contained' | 'moderate' | 'wide' | 'critical';
  percentage: number; // of total known files
}

export interface RiskAssessment {
  score: number; // 0-100 (higher = riskier)
  factors: RiskFactor[];
  recommendation: 'proceed' | 'review' | 'caution' | 'block';
}

export interface RiskFactor {
  factor: string;
  weight: number;
  detail: string;
}

// ═══ Import Graph (Static) ════════════════════════════════════════

// Known high-connectivity files that affect many downstream consumers
const HIGH_CONNECTIVITY_PATHS = new Set([
  'src/integrations/supabase/client.ts',
  'src/integrations/supabase/types.ts',
  'src/lib/substrate/events.ts',
  'src/lib/system/hardening.ts',
  'src/stores/decodeStore.ts',
  'src/lib/nexus/index.ts',
]);

const CRITICAL_PATHS = new Set([
  'src/core/',
  'src/lib/substrate/',
  'src/lib/system/',
  'supabase/',
]);

// ═══ Import Extraction ════════════════════════════════════════════

const IMPORT_PATTERN = /(?:import|export)\s+(?:[\s\S]*?)\s+from\s+['"]([^'"]+)['"]/g;
const DYNAMIC_IMPORT = /(?:require|import)\s*\(\s*['"]([^'"]+)['"]\s*\)/g;

function extractImports(content: string): Array<{ path: string; type: 'import' | 're-export' | 'dynamic' }> {
  const imports: Array<{ path: string; type: 'import' | 're-export' | 'dynamic' }> = [];

  let match: RegExpExecArray | null;

  IMPORT_PATTERN.lastIndex = 0;
  while ((match = IMPORT_PATTERN.exec(content)) !== null) {
    const line = content.slice(Math.max(0, match.index - 10), match.index);
    const type = line.includes('export') ? 're-export' as const : 'import' as const;
    imports.push({ path: match[1], type });
  }

  DYNAMIC_IMPORT.lastIndex = 0;
  while ((match = DYNAMIC_IMPORT.exec(content)) !== null) {
    imports.push({ path: match[1], type: 'dynamic' });
  }

  return imports;
}

// ═══ Type Change Detection ════════════════════════════════════════

const TYPE_PATTERN = /(?:export\s+)?(?:interface|type|enum|class)\s+(\w+)/g;

function detectTypeChanges(artifact: PatchArtifact): TypeChange[] {
  if (!artifact.content || !artifact.filePath) return [];

  const changes: TypeChange[] = [];
  TYPE_PATTERN.lastIndex = 0;

  let match: RegExpExecArray | null;
  while ((match = TYPE_PATTERN.exec(artifact.content)) !== null) {
    changes.push({
      filePath: artifact.filePath,
      typeName: match[1],
      changeType: artifact.operation === 'create' ? 'added' : 'modified',
      breaking: artifact.operation === 'delete',
    });
  }

  return changes;
}

// ═══ Core Simulator ═══════════════════════════════════════════════

/**
 * Simulate the impact of a patch plan
 */
export function simulateDiff(plan: PatchPlan, knownFileCount?: number): DiffSimulation {
  const directFiles = new Set<string>();
  const transitiveFiles = new Set<string>();
  const importChain: ImportLink[] = [];
  const typeChanges: TypeChange[] = [];
  const riskFactors: RiskFactor[] = [];

  // 1. Identify direct files
  for (const art of plan.artifacts) {
    if (art.filePath) {
      directFiles.add(art.filePath);
    }
  }

  // 2. Build import chain from artifact contents
  for (const art of plan.artifacts) {
    if (!art.content || !art.filePath) continue;

    const imports = extractImports(art.content);
    for (const imp of imports) {
      importChain.push({
        from: art.filePath,
        to: imp.path,
        type: imp.type,
        affected: true,
      });

      // Resolve transitive
      if (imp.path.startsWith('@/') || imp.path.startsWith('./') || imp.path.startsWith('../')) {
        transitiveFiles.add(imp.path);
      }
    }

    // 3. Detect type changes
    typeChanges.push(...detectTypeChanges(art));
  }

  // 4. Check high-connectivity impacts
  for (const file of directFiles) {
    if (HIGH_CONNECTIVITY_PATHS.has(file)) {
      riskFactors.push({
        factor: 'high_connectivity',
        weight: 25,
        detail: `${file} is a high-connectivity file — changes propagate widely`,
      });
    }

    for (const critical of CRITICAL_PATHS) {
      if (file.startsWith(critical)) {
        riskFactors.push({
          factor: 'critical_path',
          weight: 20,
          detail: `${file} is in critical path ${critical}`,
        });
        break;
      }
    }
  }

  // 5. Breaking type changes
  const breakingTypes = typeChanges.filter(t => t.breaking);
  if (breakingTypes.length > 0) {
    riskFactors.push({
      factor: 'breaking_types',
      weight: 30,
      detail: `${breakingTypes.length} breaking type change(s): ${breakingTypes.map(t => t.typeName).join(', ')}`,
    });
  }

  // 6. Destructive operations
  const deleteCount = plan.artifacts.filter(a => a.operation === 'delete').length;
  if (deleteCount > 0) {
    riskFactors.push({
      factor: 'destructive',
      weight: 15 * deleteCount,
      detail: `${deleteCount} file deletion(s)`,
    });
  }

  // 7. Large patch
  if (plan.artifacts.length > 10) {
    riskFactors.push({
      factor: 'large_patch',
      weight: 10,
      detail: `${plan.artifacts.length} artifacts — consider splitting`,
    });
  }

  // Calculate blast radius
  const totalKnown = knownFileCount || 500;
  const totalAffected = directFiles.size + transitiveFiles.size;
  const percentage = Math.round((totalAffected / totalKnown) * 100);

  const severity: BlastRadius['severity'] =
    percentage < 1 ? 'minimal' :
    percentage < 3 ? 'contained' :
    percentage < 10 ? 'moderate' :
    percentage < 25 ? 'wide' : 'critical';

  // Risk score
  const riskScore = Math.min(100, riskFactors.reduce((s, f) => s + f.weight, 0));
  const recommendation: RiskAssessment['recommendation'] =
    riskScore < 20 ? 'proceed' :
    riskScore < 40 ? 'review' :
    riskScore < 70 ? 'caution' : 'block';

  return {
    planId: plan.id,
    directFiles: [...directFiles],
    transitiveFiles: [...transitiveFiles],
    importChain,
    typeChanges,
    blastRadius: {
      directCount: directFiles.size,
      transitiveCount: transitiveFiles.size,
      totalCount: totalAffected,
      severity,
      percentage,
    },
    riskAssessment: {
      score: riskScore,
      factors: riskFactors,
      recommendation,
    },
    simulatedAt: new Date().toISOString(),
  };
}
