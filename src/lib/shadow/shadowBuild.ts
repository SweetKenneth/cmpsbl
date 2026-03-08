/**
 * Shadow Build Engine — Dual-Mode Training (v1.0)
 * 
 * Instead of only adversarial probing, executors practice on REALISTIC tasks:
 * 1. Replay — shadow-replay recent real executor invocations with mutations
 * 2. Synthetic — generate domain-appropriate scenarios per executor archetype
 * 3. ENCODE — reuse shadow practice task generation patterns
 * 
 * Results feed into full auto-learning: promote rules, adjust confidence,
 * cross-executor propagation. All shadow-build results are scored but
 * never committed to production.
 */

import type { SynergyExecutionContext, SynergyResult } from '@/lib/capabilities/synergies/types';
import { getSynergyExecutor } from '@/lib/capabilities/synergies/registry';
import { isShadowMeshEnabled } from '@/lib/system/flags';
import { PILOT_EXECUTORS, EXECUTOR_MODULE_META, type PilotExecutorId } from '@/immune/pilotExecutors';
import { getExecutorSeedInput } from './mutate';
import { contributeRule, recordSharedRuleOutcome, findApplicableRules } from '@/immune/shared-rule-registry';
import { updateHealthRegistry } from '@/lib/substrate/health-registry';
import { appendEvent } from '@/core/events/eventStore';
import { log } from '@/lib/system/log';

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

export interface ShadowBuildTask {
  id: string;
  executor: string;
  source: 'replay' | 'synthetic' | 'encode';
  input: Record<string, unknown>;
  description: string;
  expectedOutcome?: 'success' | 'partial' | 'failure';
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface ShadowBuildResult {
  task: ShadowBuildTask;
  outcome: 'success' | 'partial_success' | 'learned_failure' | 'unhandled_failure';
  durationMs: number;
  skillsLearned: string[];
  rulesApplied: string[];
  confidence: number;
  error?: string;
}

export interface ShadowBuildReport {
  executor: string;
  mode: 'shadow_build';
  totalTasks: number;
  results: ShadowBuildResult[];
  summary: {
    success: number;
    partialSuccess: number;
    learnedFailure: number;
    unhandledFailure: number;
    skillsGained: number;
    rulesContributed: number;
  };
  skillsDeveloped: SkillRecord[];
}

export interface SkillRecord {
  name: string;
  category: string;
  proficiency: number;  // 0-1
  source: 'shadow_build';
  learnedAt: number;
  practiceCount: number;
  lastPracticedAt: number;
}

// ═══════════════════════════════════════════════════════════════
// SKILL TRACKER (in-memory, auto-learning)
// ═══════════════════════════════════════════════════════════════

const skillRegistry = new Map<string, SkillRecord>();

function recordSkill(executor: string, skillName: string, success: boolean) {
  const key = `${executor}::${skillName}`;
  const existing = skillRegistry.get(key);
  
  if (existing) {
    existing.practiceCount++;
    existing.lastPracticedAt = Date.now();
    // EMA update: proficiency converges toward actual performance
    existing.proficiency = existing.proficiency * 0.8 + (success ? 1 : 0) * 0.2;
  } else {
    skillRegistry.set(key, {
      name: skillName,
      category: EXECUTOR_MODULE_META[executor as PilotExecutorId]?.category ?? 'unknown',
      proficiency: success ? 0.6 : 0.2,
      source: 'shadow_build',
      learnedAt: Date.now(),
      practiceCount: 1,
      lastPracticedAt: Date.now(),
    });
  }
}

export function getSkillsForExecutor(executor: string): SkillRecord[] {
  return Array.from(skillRegistry.entries())
    .filter(([key]) => key.startsWith(`${executor}::`))
    .map(([, skill]) => skill)
    .sort((a, b) => b.proficiency - a.proficiency);
}

export function getAllSkills(): Map<string, SkillRecord[]> {
  const byExecutor = new Map<string, SkillRecord[]>();
  for (const [key, skill] of skillRegistry) {
    const executor = key.split('::')[0];
    if (!byExecutor.has(executor)) byExecutor.set(executor, []);
    byExecutor.get(executor)!.push(skill);
  }
  return byExecutor;
}

export function getSkillStats() {
  const skills = Array.from(skillRegistry.values());
  const total = skills.length;
  const avgProficiency = total > 0 ? skills.reduce((s, sk) => s + sk.proficiency, 0) / total : 0;
  const recentlyLearned = skills.filter(s => Date.now() - s.learnedAt < 3600000).length;
  const highProficiency = skills.filter(s => s.proficiency >= 0.8).length;
  const categories = new Set(skills.map(s => s.category));
  
  return {
    totalSkills: total,
    avgProficiency,
    recentlyLearned,
    highProficiency,
    categoriesCovered: categories.size,
    topSkills: skills.sort((a, b) => b.proficiency - a.proficiency).slice(0, 10),
    newSkills: skills.sort((a, b) => b.learnedAt - a.learnedAt).slice(0, 10),
  };
}

// ═══════════════════════════════════════════════════════════════
// TASK GENERATORS
// ═══════════════════════════════════════════════════════════════

function generateSyntheticTasks(executor: string): ShadowBuildTask[] {
  const seed = getExecutorSeedInput(executor);
  const meta = EXECUTOR_MODULE_META[executor as PilotExecutorId];
  const tasks: ShadowBuildTask[] = [];
  const id = () => `sb_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;

  // Task 1: Normal operation — should succeed
  tasks.push({
    id: id(), executor, source: 'synthetic',
    input: { ...seed },
    description: `Standard ${meta?.module ?? 'GENERIC'} operation`,
    expectedOutcome: 'success', difficulty: 'easy',
  });

  // Task 2: Slightly mutated — tests resilience
  const mutated = { ...seed };
  const keys = Object.keys(mutated);
  if (keys.length > 0) {
    const key = keys[Math.floor(Math.random() * keys.length)];
    mutated[key] = typeof mutated[key] === 'string' 
      ? (mutated[key] as string).toUpperCase() 
      : String(mutated[key]);
  }
  tasks.push({
    id: id(), executor, source: 'synthetic',
    input: mutated,
    description: `Mutated field in ${meta?.module ?? 'GENERIC'} context`,
    expectedOutcome: 'success', difficulty: 'medium',
  });

  // Task 3: Missing optional field — should handle gracefully
  const partial = { ...seed };
  const optionalKeys = keys.filter(k => k !== 'content' && k !== 'target' && k !== 'query');
  if (optionalKeys.length > 0) {
    delete partial[optionalKeys[0]];
  }
  tasks.push({
    id: id(), executor, source: 'synthetic',
    input: partial,
    description: `Missing optional field test`,
    expectedOutcome: 'success', difficulty: 'easy',
  });

  // Task 4: Edge case values
  tasks.push({
    id: id(), executor, source: 'synthetic',
    input: { ...seed, content: seed.content ?? 'Test', _extra: 'unexpected_field' },
    description: `Extra unknown field tolerance`,
    expectedOutcome: 'success', difficulty: 'medium',
  });

  // Task 5: Complex realistic scenario
  tasks.push({
    id: id(), executor, source: 'synthetic',
    input: {
      ...seed,
      content: 'A realistic multi-sentence input that tests the executor\'s ability to handle natural language with varied punctuation, numbers (42), and special chars: @#$.',
      metadata: { source: 'shadow_build', timestamp: new Date().toISOString() },
    },
    description: `Complex realistic scenario`,
    expectedOutcome: 'success', difficulty: 'hard',
  });

  // Task 6: Type boundary test — string number
  tasks.push({
    id: id(), executor, source: 'synthetic',
    input: { ...seed, priority: '3', threshold: '0.8' },
    description: `String-encoded numeric values`,
    expectedOutcome: 'success', difficulty: 'medium',
  });

  return tasks;
}

function generateReplayTasks(executor: string): ShadowBuildTask[] {
  // Replay tasks simulate real invocations with slight variations
  const seed = getExecutorSeedInput(executor);
  const id = () => `rb_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
  
  const variations = [
    { ...seed, _replay: true, _variation: 'original' },
    { ...seed, _replay: true, _variation: 'lowercase', content: typeof seed.content === 'string' ? seed.content.toLowerCase() : seed.content },
    { ...seed, _replay: true, _variation: 'trimmed', content: typeof seed.content === 'string' ? `  ${seed.content}  ` : seed.content },
  ];

  return variations.map((input, i) => ({
    id: id(), executor, source: 'replay' as const,
    input,
    description: `Replay variant ${i + 1}: ${(input as any)._variation}`,
    expectedOutcome: 'success' as const,
    difficulty: 'easy' as const,
  }));
}

function generateEncodeTasks(executor: string): ShadowBuildTask[] {
  // ENCODE-style practice tasks: improvement-oriented
  const seed = getExecutorSeedInput(executor);
  const meta = EXECUTOR_MODULE_META[executor as PilotExecutorId];
  const id = () => `et_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;

  return [
    {
      id: id(), executor, source: 'encode',
      input: { ...seed, _encode_task: 'optimize_throughput' },
      description: `ENCODE: Optimize ${meta?.module ?? 'module'} throughput`,
      expectedOutcome: 'success', difficulty: 'hard',
    },
    {
      id: id(), executor, source: 'encode',
      input: { ...seed, _encode_task: 'reduce_latency', target: 'performance' },
      description: `ENCODE: Reduce processing latency`,
      expectedOutcome: 'partial', difficulty: 'hard',
    },
  ];
}

// ═══════════════════════════════════════════════════════════════
// SHADOW BUILD RUNNER
// ═══════════════════════════════════════════════════════════════

export async function runShadowBuild(executorName: string): Promise<ShadowBuildReport> {
  const executor = getSynergyExecutor(executorName);
  if (!executor) {
    return {
      executor: executorName, mode: 'shadow_build', totalTasks: 0,
      results: [], summary: { success: 0, partialSuccess: 0, learnedFailure: 0, unhandledFailure: 0, skillsGained: 0, rulesContributed: 0 },
      skillsDeveloped: [],
    };
  }

  // Generate tasks from all three sources
  const tasks = [
    ...generateSyntheticTasks(executorName),
    ...generateReplayTasks(executorName),
    ...generateEncodeTasks(executorName),
  ];

  const results: ShadowBuildResult[] = [];
  const summary = { success: 0, partialSuccess: 0, learnedFailure: 0, unhandledFailure: 0, skillsGained: 0, rulesContributed: 0 };

  for (const task of tasks) {
    const ctx: SynergyExecutionContext = {
      synergyId: executorName,
      input: task.input,
      caller: 'shadow.build',
      traceId: task.id,
      dryRun: true, // Shadow builds are always dry-run
    };

    const start = performance.now();
    const rulesApplied: string[] = [];
    const skillsLearned: string[] = [];

    try {
      const result: SynergyResult = await executor(ctx);
      const durationMs = Math.round(performance.now() - start);

      if (result.success) {
        // Successful build — record skill
        const skillName = `${task.source}_${task.difficulty}`;
        recordSkill(executorName, skillName, true);
        skillsLearned.push(skillName);

        results.push({
          task, outcome: 'success', durationMs, skillsLearned, rulesApplied,
          confidence: result.confidence ?? 0.9,
        });
        summary.success++;
        summary.skillsGained++;
      } else if (result.error?.includes('[immune]')) {
        // Immune system intervened
        if (result.error.includes('Repair succeeded')) {
          // Partial success — learned from repair
          const repairSkill = `repair_${task.difficulty}`;
          recordSkill(executorName, repairSkill, true);
          skillsLearned.push(repairSkill);

          // Auto-contribute rule if repair was novel
          const applicableRules = findApplicableRules(executorName);
          if (applicableRules.length < 5) {
            contributeRule(
              executorName,
              `shadow_build_${task.source}`,
              task.difficulty,
              0.75,
              `Learned from shadow-build: ${task.description}`,
            );
            summary.rulesContributed++;
          }

          results.push({
            task, outcome: 'partial_success', durationMs, skillsLearned, rulesApplied,
            confidence: 0.7, error: result.error,
          });
          summary.partialSuccess++;
          summary.skillsGained++;
        } else {
          // Safe-fail — learned what doesn't work
          const failSkill = `handle_${task.difficulty}_failure`;
          recordSkill(executorName, failSkill, false);
          skillsLearned.push(failSkill);

          results.push({
            task, outcome: 'learned_failure', durationMs, skillsLearned, rulesApplied,
            confidence: 0.3, error: result.error,
          });
          summary.learnedFailure++;
        }
      } else {
        // Non-immune failure
        results.push({
          task, outcome: 'learned_failure', durationMs, skillsLearned, rulesApplied,
          confidence: 0.2, error: result.error,
        });
        summary.learnedFailure++;
      }
    } catch (err) {
      const durationMs = Math.round(performance.now() - start);
      results.push({
        task, outcome: 'unhandled_failure', durationMs, skillsLearned: [], rulesApplied: [],
        confidence: 0, error: err instanceof Error ? err.message : 'unknown',
      });
      summary.unhandledFailure++;
    }
  }

  // Record shadow-build event
  const correlationId = crypto.randomUUID();
  appendEvent('PROBE_REPAIRED', `shadow:${executorName}`, executorName, 'building', 
    `${summary.success}/${tasks.length} success`, correlationId);

  // Update health registry
  const totalFails = summary.learnedFailure + summary.unhandledFailure;
  updateHealthRegistry(`shadow:${executorName}`, totalFails > 0 ? 'shadow_event' : 'healthy',
    totalFails > 0 ? 'shadow_event' : 'boot',
    'synthetic_shadow_event',
    {
      detail: `Build: ${summary.success} ok, ${summary.partialSuccess} partial, ${summary.learnedFailure} learned, ${summary.unhandledFailure} unhandled`,
      score_override: Math.round(100 * (summary.success + summary.partialSuccess * 0.7) / Math.max(1, tasks.length)),
    }
  );

  log.info('shadow', `Shadow build: ${executorName} — ${summary.success}/${tasks.length} success, ${summary.skillsGained} skills, ${summary.rulesContributed} rules`);

  return {
    executor: executorName,
    mode: 'shadow_build',
    totalTasks: tasks.length,
    results,
    summary,
    skillsDeveloped: getSkillsForExecutor(executorName),
  };
}

/**
 * Run shadow builds for ALL executors.
 */
export async function runAllShadowBuilds(): Promise<ShadowBuildReport[]> {
  if (!(await isShadowMeshEnabled())) return [];
  
  const executors = [...PILOT_EXECUTORS]; // Build-train all registered pilot executors
  log.info('shadow', `Shadow build sweep: ${executors.length} executors`);

  const reports: ShadowBuildReport[] = [];
  for (const name of executors) {
    reports.push(await runShadowBuild(name));
  }
  return reports;
}
