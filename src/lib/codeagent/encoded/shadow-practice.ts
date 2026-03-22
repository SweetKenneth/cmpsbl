/**
 * Encoded Shadow Practice Engine
 * 
 * Auto-cycling practice mode where Encoded writes real code against
 * a shadow copy of actual substrate files. Changes are NEVER committed —
 * they exist only for learning, guard validation, and mastery scoring.
 * 
 * Cycle: Pick file → Read it → Generate improvement → Run guard → Score → Discard
 */

import { supabase } from '@/integrations/supabase/client';
import { runEncodedGuard, computeDiffStats, classifyChange, type GuardResult } from './guard';
import { extractAnchors } from './anchor';
import { recordOutcome, getOverallMastery, type PatternOutcome } from './feedback-loop';
import { EXPERT_PATTERNS, getRelevantPatterns, type ExpertPattern } from './expert-patterns';
import { secureGet, secureSet } from '@/lib/system/secureStorage';
import { ENCODED_SKILLS } from './skills';
import { readFileContextAsync } from '@/lib/codeagent/file-context';

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

export interface PracticeTask {
  id: string;
  file_path: string;
  original_code: string;
  task_type: PracticeTaskType;
  pattern?: ExpertPattern;
  prompt: string;
  created_at: string;
}

export type PracticeTaskType =
  | 'refactor'
  | 'add_types'
  | 'error_handling'
  | 'performance'
  | 'security'
  | 'documentation'
  | 'testing'
  | 'accessibility'
  | 'pattern_apply';

export interface PracticeResult {
  task: PracticeTask;
  generated_code: string | null;
  guard_result: GuardResult | null;
  score: number;
  passed_guard: boolean;
  patterns_applied: string[];
  lessons_learned: string[];
  duration_ms: number;
  timestamp: string;
}

export interface ShadowPracticeState {
  enabled: boolean;
  isRunning: boolean;
  cycleIntervalMs: number;
  totalPractices: number;
  totalPassed: number;
  totalBlocked: number;
  currentTask: string | null;
  lastPracticeAt: string | null;
  bestScore: number;
  averageScore: number;
  recentResults: PracticeResult[];
}

// ═══════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════

const STORAGE_KEY = 'encoded_shadow_practice_state';
const DEFAULT_CYCLE_MS = 10 * 60 * 1000;
const MAX_RECENT_RESULTS = 20;
const MAX_CODE_LENGTH = 5000;

const PRACTICE_TARGETS = [
  'src/lib/substrate/',
  'src/lib/codeagent/',
  'src/lib/evolve/',
  'src/lib/terminal/',
  'src/hooks/',
  'src/utils/',
  'src/components/',
];

const EXCLUDED_FILES = [
  'src/integrations/supabase/client.ts',
  'src/integrations/supabase/types.ts',
  'supabase/config.toml',
  '.env',
];

const TASK_WEIGHTS: Record<PracticeTaskType, number> = {
  refactor: 25,
  add_types: 20,
  error_handling: 20,
  performance: 15,
  security: 15,
  documentation: 10,
  testing: 15,
  accessibility: 10,
  pattern_apply: 25,
};

// ═══════════════════════════════════════════════════════════════
// VALIDATION RULES — Applied to generated code per task type
// ═══════════════════════════════════════════════════════════════

interface ValidationRule {
  name: string;
  check: (original: string, generated: string) => boolean;
  weight: number; // bonus points if passed
}

const VALIDATION_RULES: Record<PracticeTaskType, ValidationRule[]> = {
  refactor: [
    { name: 'reduced_nesting', check: (_o, g) => (g.match(/\{/g)?.length ?? 0) <= (_o.match(/\{/g)?.length ?? 0) + 2, weight: 5 },
    { name: 'no_god_functions', check: (_o, g) => !g.split('\n').some((_l, i, arr) => { const fn = arr.slice(i, i + 60).join('\n'); return /^(export\s+)?(async\s+)?function/.test(fn) && fn.split('\n').length > 50; }), weight: 5 },
    { name: 'helper_extraction', check: (o, g) => (g.match(/function\s+\w+/g)?.length ?? 0) >= (o.match(/function\s+\w+/g)?.length ?? 0), weight: 5 },
    { name: 'consistent_naming', check: (_o, g) => !(/const\s+[a-z]+[A-Z]\w*\s*=/.test(g) && /const\s+[a-z]+_[a-z]+\s*=/.test(g)), weight: 3 },
  ],
  add_types: [
    { name: 'no_any', check: (_o, g) => !g.includes(': any') && !g.includes('as any'), weight: 10 },
    { name: 'no_unknown_cast', check: (_o, g) => !g.includes('as unknown as'), weight: 5 },
    { name: 'has_type_guards', check: (_o, g) => /function\s+is[A-Z]\w*|:\s*\w+\s+is\s+\w+/.test(g), weight: 5 },
    { name: 'return_types', check: (_o, g) => { const fns = g.match(/function\s+\w+\s*\([^)]*\)\s*:/g); return (fns?.length ?? 0) > 0; }, weight: 5 },
    { name: 'generic_usage', check: (_o, g) => /<[A-Z]\w*>/.test(g), weight: 3 },
  ],
  error_handling: [
    { name: 'try_catch_present', check: (_o, g) => g.includes('try') && g.includes('catch'), weight: 8 },
    { name: 'no_empty_catch', check: (_o, g) => !/catch\s*\([^)]*\)\s*\{\s*\}/.test(g), weight: 5 },
    { name: 'typed_errors', check: (_o, g) => /class\s+\w+Error\s+extends\s+Error|instanceof\s+\w+Error/.test(g), weight: 5 },
    { name: 'error_context', check: (_o, g) => /new\s+Error\s*\(`[^`]*\$\{/.test(g) || /new\s+Error\s*\('[^']*'.*\+/.test(g), weight: 3 },
    { name: 'finally_cleanup', check: (_o, g) => g.includes('finally'), weight: 3 },
  ],
  performance: [
    { name: 'memoization', check: (_o, g) => /useMemo|useCallback|memo\(|\.memoize|Map\(\)/.test(g), weight: 8 },
    { name: 'early_return', check: (o, g) => (g.match(/return\s/g)?.length ?? 0) >= (o.match(/return\s/g)?.length ?? 0), weight: 3 },
    { name: 'no_nested_loops', check: (_o, g) => { const loops = g.match(/\b(for|while)\b/g)?.length ?? 0; return loops <= 3; }, weight: 5 },
    { name: 'lazy_evaluation', check: (_o, g) => /lazy|defer|requestIdleCallback|queueMicrotask/.test(g), weight: 3 },
    { name: 'batch_operations', check: (_o, g) => /Promise\.all|Promise\.allSettled|batch/.test(g), weight: 5 },
  ],
  security: [
    { name: 'input_validation', check: (_o, g) => /zod|z\.string|z\.object|validate|sanitize/.test(g), weight: 10 },
    { name: 'no_eval', check: (_o, g) => !g.includes('eval(') && !g.includes('Function('), weight: 8 },
    { name: 'no_innerHTML', check: (_o, g) => !g.includes('innerHTML') && !g.includes('dangerouslySetInnerHTML'), weight: 5 },
    { name: 'auth_check', check: (_o, g) => /auth\.uid|getUser|session|authenticated/.test(g), weight: 5 },
    { name: 'no_secrets_hardcoded', check: (_o, g) => !/(?:api_key|secret|password)\s*=\s*['"][^'"]{8,}['"]/.test(g), weight: 8 },
  ],
  documentation: [
    { name: 'jsdoc_present', check: (_o, g) => g.includes('/**') && g.includes('*/'), weight: 8 },
    { name: 'param_docs', check: (_o, g) => /@param/.test(g), weight: 5 },
    { name: 'returns_docs', check: (_o, g) => /@returns/.test(g), weight: 5 },
    { name: 'example_docs', check: (_o, g) => /@example/.test(g), weight: 3 },
    { name: 'module_header', check: (_o, g) => /^\/\*\*[\s\S]*?\*\//.test(g.trim()), weight: 3 },
  ],
  testing: [
    { name: 'describe_block', check: (_o, g) => g.includes('describe('), weight: 8 },
    { name: 'it_or_test', check: (_o, g) => /\bit\(|test\(/.test(g), weight: 8 },
    { name: 'expect_assertions', check: (_o, g) => g.includes('expect('), weight: 8 },
    { name: 'edge_cases', check: (_o, g) => /null|undefined|empty|edge|boundary|zero|negative/.test(g), weight: 5 },
    { name: 'async_tests', check: (_o, g) => /async\s.*(?:it|test)\(/.test(g) || /await\s+expect/.test(g), weight: 3 },
  ],
  accessibility: [
    { name: 'aria_attrs', check: (_o, g) => /aria-/.test(g), weight: 8 },
    { name: 'role_attrs', check: (_o, g) => /role=/.test(g), weight: 5 },
    { name: 'sr_only', check: (_o, g) => /sr-only|visually-hidden|screenReader/.test(g), weight: 5 },
    { name: 'keyboard_nav', check: (_o, g) => /onKeyDown|onKeyPress|tabIndex|focus/.test(g), weight: 5 },
    { name: 'alt_text', check: (_o, g) => /alt=/.test(g), weight: 3 },
  ],
  pattern_apply: [
    { name: 'structure_improved', check: (o, g) => g.length >= o.length * 0.8, weight: 5 },
    { name: 'no_regressions', check: (o, g) => { const oExports = o.match(/export\s+(const|function|class|type|interface)\s+\w+/g)?.length ?? 0; const gExports = g.match(/export\s+(const|function|class|type|interface)\s+\w+/g)?.length ?? 0; return gExports >= oExports; }, weight: 10 },
    { name: 'pattern_markers', check: (_o, g) => /Pattern:|@pattern|implements|extends/.test(g), weight: 3 },
    { name: 'composability', check: (_o, g) => /compose|pipe|chain|builder|factory/.test(g), weight: 3 },
  ],
};

// ═══════════════════════════════════════════════════════════════
// SHADOW PRACTICE ENGINE
// ═══════════════════════════════════════════════════════════════

class ShadowPracticeEngine {
  private static instance: ShadowPracticeEngine;
  private state: ShadowPracticeState;
  private intervalId: ReturnType<typeof setInterval> | null = null;

  private constructor() {
    this.state = this.loadState();
  }

  static getInstance(): ShadowPracticeEngine {
    if (!ShadowPracticeEngine.instance) {
      ShadowPracticeEngine.instance = new ShadowPracticeEngine();
    }
    return ShadowPracticeEngine.instance;
  }

  // ═══════════════════════════════════════════════════════════════
  // LIFECYCLE
  // ═══════════════════════════════════════════════════════════════

  start(intervalMs?: number): void {
    if (this.intervalId) {
      console.log('[Shadow Practice] Already running');
      return;
    }

    const cycle = intervalMs || this.state.cycleIntervalMs || DEFAULT_CYCLE_MS;
    this.state.enabled = true;
    this.state.cycleIntervalMs = cycle;
    this.persistState();

    console.log(`[Shadow Practice] 🎯 Starting auto-cycle every ${cycle / 60000} minutes`);

    setTimeout(() => this.runPracticeCycle(), 3000);

    this.intervalId = setInterval(() => {
      this.runPracticeCycle();
    }, cycle);
  }

  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.state.enabled = false;
    this.state.isRunning = false;
    this.persistState();
    console.log('[Shadow Practice] ⏹️ Stopped');
  }

  setCycleMinutes(minutes: number): void {
    const ms = Math.max(2, minutes) * 60 * 1000;
    this.state.cycleIntervalMs = ms;
    this.persistState();

    if (this.intervalId) {
      this.stop();
      this.start(ms);
    }
  }

  getState(): ShadowPracticeState {
    return { ...this.state };
  }

  // ═══════════════════════════════════════════════════════════════
  // PRACTICE CYCLE
  // ═══════════════════════════════════════════════════════════════

  async runPracticeCycle(): Promise<PracticeResult | null> {
    if (this.state.isRunning) {
      console.log('[Shadow Practice] Already running a cycle');
      return null;
    }

    this.state.isRunning = true;
    this.state.currentTask = 'initializing';
    const startTime = Date.now();

    try {
      // 1. Pick a target file — uses real file content
      const fileData = await this.pickTargetFile();
      if (!fileData) {
        console.log('[Shadow Practice] No suitable target file found');
        return null;
      }

      // 2. Choose task type and pattern
      const taskType = this.selectTaskType();
      const pattern = taskType === 'pattern_apply' ? this.selectPattern(fileData.content) : undefined;

      // 3. Build the practice task
      const task: PracticeTask = {
        id: crypto.randomUUID(),
        file_path: fileData.path,
        original_code: fileData.content,
        task_type: taskType,
        pattern,
        prompt: this.buildPracticePrompt(fileData.content, fileData.path, taskType, pattern),
        created_at: new Date().toISOString(),
      };

      this.state.currentTask = `${taskType}: ${fileData.path}`;

      // 4. Generate improved code via Nexus
      const generatedCode = await this.generateCode(task);
      if (!generatedCode) {
        return this.recordFailure(task, startTime, 'Code generation failed');
      }

      // 5. Run the Encoded Guard
      const guardResult = runEncodedGuard(
        task.original_code,
        generatedCode,
        false,
        task.file_path
      );

      // 6. Run validation rules for the task type
      const validationScore = this.runValidationRules(task.task_type, task.original_code, generatedCode);

      // 7. Score the practice (guard + validation)
      const score = this.scorePractice(task, generatedCode, guardResult, validationScore);

      // 8. Record outcome to feedback loop
      const outcome: PatternOutcome = {
        pattern_id: pattern?.id || `practice_${taskType}`,
        pattern_type: taskType,
        outcome: guardResult.ok ? 'success' : 'blocked',
        guard_result: {
          changeClass: guardResult.changeClass,
          risk: guardResult.risk,
          reasons: guardResult.reasons,
          warnings: guardResult.warnings,
        },
        mastery_category: taskType,
        execution_time_ms: Date.now() - startTime,
        timestamp: new Date().toISOString(),
      };
      await recordOutcome(outcome);

      // 9. Build result (code is ephemeral — NEVER stored for commit)
      const result: PracticeResult = {
        task,
        generated_code: null,
        guard_result: guardResult,
        score,
        passed_guard: guardResult.ok,
        patterns_applied: pattern ? [pattern.id] : [],
        lessons_learned: this.extractLessons(guardResult, task.task_type, task.original_code, generatedCode),
        duration_ms: Date.now() - startTime,
        timestamp: new Date().toISOString(),
      };

      // 10. Update stats
      this.state.totalPractices++;
      if (guardResult.ok) this.state.totalPassed++;
      else this.state.totalBlocked++;
      this.state.lastPracticeAt = result.timestamp;
      this.state.bestScore = Math.max(this.state.bestScore, score);
      this.updateAverageScore(score);
      this.state.recentResults = [
        result,
        ...this.state.recentResults.slice(0, MAX_RECENT_RESULTS - 1),
      ];

      // 11. Log to brain_events for audit
      await this.logPractice(result);

      const emoji = guardResult.ok ? '✅' : '🔒';
      console.log(
        `[Shadow Practice] ${emoji} ${taskType} on ${fileData.path} — Score: ${score}/100 ${
          guardResult.ok ? '(PASSED)' : `(BLOCKED: ${guardResult.reasons[0] || 'guard'})`
        }`
      );

      return result;

    } catch (error) {
      console.error('[Shadow Practice] ❌ Cycle failed:', error);
      return null;
    } finally {
      this.state.isRunning = false;
      this.state.currentTask = null;
      this.persistState();
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // FILE SELECTION — Real content via file-context async reader
  // ═══════════════════════════════════════════════════════════════

  private async pickTargetFile(): Promise<{ path: string; content: string } | null> {
    try {
      // Query brain_events for recently-touched substrate files
      const { data: events } = await supabase
        .from('brain_events')
        .select('data')
        .eq('module', 'encoded')
        .order('created_at', { ascending: false })
        .limit(50);

      const filePaths = new Set<string>();
      events?.forEach(e => {
        const path = (e.data as any)?.file_path;
        if (path && typeof path === 'string') {
          filePaths.add(path);
        }
      });

      // Add known substrate paths
      const syntheticTargets = [
        'src/lib/substrate/memory-core.ts',
        'src/lib/substrate/learning-engine.ts',
        'src/lib/substrate/module-bus.ts',
        'src/lib/codeagent/encoded/guard.ts',
        'src/lib/codeagent/encoded/skills.ts',
        'src/lib/codeagent/encoded/expert-patterns.ts',
        'src/lib/evolve/shadow-executor.ts',
        'src/lib/evolve/shadow-store.ts',
        'src/hooks/useEncoded.ts',
        'src/utils/sleep.ts',
      ];
      syntheticTargets.forEach(p => filePaths.add(p));

      const candidates = Array.from(filePaths).filter(p => {
        const isTarget = PRACTICE_TARGETS.some(t => p.startsWith(t));
        const isExcluded = EXCLUDED_FILES.includes(p);
        return isTarget && !isExcluded;
      });

      if (candidates.length === 0) return null;

      // Shuffle and try candidates until we get real content
      const shuffled = candidates.sort(() => Math.random() - 0.5);

      for (const candidate of shuffled.slice(0, 5)) {
        const ctx = await readFileContextAsync(candidate);
        if (ctx.content && ctx.content.length > 20 && ctx.content.length <= MAX_CODE_LENGTH) {
          return { path: candidate, content: ctx.content };
        }
      }

      return null;
    } catch {
      return null;
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // TASK SELECTION
  // ═══════════════════════════════════════════════════════════════

  private selectTaskType(): PracticeTaskType {
    const mastery = getOverallMastery();
    const types = Object.entries(TASK_WEIGHTS) as [PracticeTaskType, number][];

    const adjusted = types.map(([type, weight]) => {
      if (mastery > 70 && ['security', 'performance', 'pattern_apply'].includes(type)) {
        return [type, weight * 1.5] as [PracticeTaskType, number];
      }
      if (mastery < 40 && ['refactor', 'add_types', 'error_handling'].includes(type)) {
        return [type, weight * 1.5] as [PracticeTaskType, number];
      }
      return [type, weight] as [PracticeTaskType, number];
    });

    const totalWeight = adjusted.reduce((sum, [, w]) => sum + w, 0);
    let random = Math.random() * totalWeight;

    for (const [type, weight] of adjusted) {
      random -= weight;
      if (random <= 0) return type;
    }

    return 'refactor';
  }

  private selectPattern(code: string): ExpertPattern | undefined {
    const relevant = getRelevantPatterns(code);
    if (relevant.length === 0) return EXPERT_PATTERNS[Math.floor(Math.random() * EXPERT_PATTERNS.length)];
    return relevant[Math.floor(Math.random() * relevant.length)];
  }

  // ═══════════════════════════════════════════════════════════════
  // CODE GENERATION
  // ═══════════════════════════════════════════════════════════════

  private buildPracticePrompt(
    code: string,
    filePath: string,
    taskType: PracticeTaskType,
    pattern?: ExpertPattern
  ): string {
    const taskInstructions: Record<PracticeTaskType, string> = {
      refactor: 'Refactor this code to improve readability, reduce complexity, and follow clean code principles. Extract helpers, reduce nesting, improve naming.',
      add_types: 'Strengthen the TypeScript types. Replace any/unknown with specific types, add type guards, use discriminated unions, add branded types where appropriate.',
      error_handling: 'Improve error handling. Add try/catch blocks, create domain-specific error types, ensure errors never leak internals, add proper logging.',
      performance: 'Optimize performance. Add memoization, reduce unnecessary re-renders, optimize loops, add debouncing/throttling where needed.',
      security: 'Harden security. Add input validation with Zod, sanitize outputs, check for injection vulnerabilities, ensure proper auth checks.',
      documentation: 'Add comprehensive JSDoc documentation. Document all exports, parameters, return types, edge cases, and usage examples.',
      testing: 'Write comprehensive unit tests for this module using Vitest. Cover happy paths, edge cases, error conditions, and boundary values.',
      accessibility: 'Improve accessibility. Add ARIA attributes, ensure keyboard navigation, add proper labels, check color contrast, add screen reader support.',
      pattern_apply: pattern
        ? `Apply the "${pattern.name}" pattern to this code.\n\nPattern description: ${pattern.description}\n\nTemplate:\n${pattern.template}\n\nAvoid these anti-patterns: ${pattern.antiPatterns.join(', ')}`
        : 'Apply a relevant expert pattern to improve this code.',
    };

    return `You are Encoded, an elite code-writing agent practicing on shadow copies of real substrate files.

**CRITICAL**: You are in SHADOW PRACTICE MODE. Your output will be validated by the Encoded Guard but NEVER committed. This is pure learning.

**File**: ${filePath}
**Task**: ${taskType.replace('_', ' ').toUpperCase()}

**Instructions**: ${taskInstructions[taskType]}

**Rules**:
1. Preserve ALL exports, handlers, and entrypoints (anchors)
2. Do NOT add narrative language ("as an AI", "I'm sorry", etc.)
3. Keep the same file structure and module boundaries
4. Write production-grade TypeScript/React code
5. Changes should be localized — don't rewrite the entire file

**Original Code**:
\`\`\`typescript
${code}
\`\`\`

Return ONLY the improved code. No explanations, no markdown fences, just the code.`;
  }

  private async generateCode(task: PracticeTask): Promise<string | null> {
    try {
      const { data, error } = await supabase.functions.invoke('pf-nexus-router', {
        body: {
          prompt: task.prompt,
          systemPrompt: 'You are Encoded, an elite code implementation agent. Output ONLY code, no explanations.',
          maxTokens: 2000,
          temperature: 0.3,
          metadata: {
            routeKey: 'encoded-shadow-practice',
            taskId: task.id,
            taskType: task.task_type,
            filePath: task.file_path,
          },
        },
      });

      if (error) throw error;

      let code = data?.content || data?.response || '';
      code = code.replace(/^```(?:typescript|ts|tsx|javascript|js)?\n?/gm, '').replace(/```$/gm, '').trim();

      return code || null;
    } catch (error) {
      console.error('[Shadow Practice] Code generation failed:', error);
      return null;
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // VALIDATION
  // ═══════════════════════════════════════════════════════════════

  /**
   * Run task-type-specific validation rules against generated code.
   * Returns a bonus score (0-30) based on rule compliance.
   */
  private runValidationRules(taskType: PracticeTaskType, original: string, generated: string): number {
    const rules = VALIDATION_RULES[taskType] || [];
    let bonus = 0;

    for (const rule of rules) {
      try {
        if (rule.check(original, generated)) {
          bonus += rule.weight;
        }
      } catch {
        // Rule threw — skip, don't penalize
      }
    }

    return Math.min(30, bonus); // Cap at 30 bonus points
  }

  // ═══════════════════════════════════════════════════════════════
  // SCORING
  // ═══════════════════════════════════════════════════════════════

  private scorePractice(task: PracticeTask, generated: string, guard: GuardResult, validationBonus: number): number {
    let score = 0;

    // Guard pass = 30 points base
    if (guard.ok) score += 30;

    // Anchors preserved = 15 points
    if (guard.anchorsPreserved) score += 15;

    // Low risk = 10 points
    if (guard.risk === 'minimal' || guard.risk === 'low') score += 10;
    else if (guard.risk === 'medium') score += 5;

    // Change classification bonus
    if (guard.changeClass === 'additive') score += 5;
    else if (guard.changeClass === 'localized') score += 10;
    else if (guard.changeClass === 'comment_only') score += 3;

    // Validation rule bonus (up to 30)
    score += validationBonus;

    // Reasonable size (not bloated)
    if (generated.length > 0) {
      const sizeRatio = generated.length / task.original_code.length;
      if (sizeRatio >= 0.8 && sizeRatio <= 1.5) score += 5;
    }

    // Warnings penalty
    score -= guard.warnings.length * 2;

    return Math.max(0, Math.min(100, score));
  }

  // ═══════════════════════════════════════════════════════════════
  // LESSONS
  // ═══════════════════════════════════════════════════════════════

  private extractLessons(guard: GuardResult, taskType: PracticeTaskType, original: string, generated: string): string[] {
    const lessons: string[] = [];

    if (!guard.anchorsPreserved) {
      lessons.push('Must preserve all structural anchors (exports, handlers, entrypoints)');
    }

    for (const reason of guard.reasons) {
      if (reason.includes('Narrative')) {
        lessons.push('Avoid personality/narrative language in code');
      }
      if (reason.includes('Destructive')) {
        lessons.push('Keep changes localized — avoid large-scale removals');
      }
      if (reason.includes('Protected')) {
        lessons.push('Some files are protected and require explicit approval');
      }
      if (reason.includes('Anchor')) {
        lessons.push('Never remove exports or handlers without approval');
      }
    }

    // Add validation-based lessons
    const rules = VALIDATION_RULES[taskType] || [];
    for (const rule of rules) {
      try {
        if (!rule.check(original, generated)) {
          const readableName = rule.name.replace(/_/g, ' ');
          lessons.push(`Validation failed: ${readableName}`);
        }
      } catch { /* skip */ }
    }

    if (guard.ok && guard.warnings.length === 0 && lessons.length === 0) {
      lessons.push('Clean pass — code met all guard and validation requirements');
    }

    return lessons;
  }

  // ═══════════════════════════════════════════════════════════════
  // LOGGING & PERSISTENCE
  // ═══════════════════════════════════════════════════════════════

  private recordFailure(task: PracticeTask, startTime: number, reason: string): PracticeResult {
    const result: PracticeResult = {
      task,
      generated_code: null,
      guard_result: null,
      score: 0,
      passed_guard: false,
      patterns_applied: [],
      lessons_learned: [reason],
      duration_ms: Date.now() - startTime,
      timestamp: new Date().toISOString(),
    };

    this.state.totalPractices++;
    this.state.totalBlocked++;
    this.state.recentResults = [result, ...this.state.recentResults.slice(0, MAX_RECENT_RESULTS - 1)];

    return result;
  }

  private async logPractice(result: PracticeResult): Promise<void> {
    try {
      await supabase.from('brain_events').insert({
        module: 'encoded',
        event_type: 'shadow_practice_completed',
        data: {
          task_id: result.task.id,
          file_path: result.task.file_path,
          task_type: result.task.task_type,
          pattern_id: result.task.pattern?.id,
          score: result.score,
          passed_guard: result.passed_guard,
          change_class: result.guard_result?.changeClass,
          risk: result.guard_result?.risk,
          lessons: result.lessons_learned,
          duration_ms: result.duration_ms,
        },
        outcome: result.passed_guard ? 'success' : 'failure',
      });
    } catch {
      // Non-blocking
    }
  }

  private updateAverageScore(newScore: number): void {
    const n = this.state.totalPractices;
    if (n <= 1) {
      this.state.averageScore = newScore;
    } else {
      this.state.averageScore = ((this.state.averageScore * (n - 1)) + newScore) / n;
    }
  }

  private loadState(): ShadowPracticeState {
    try {
      const stored = secureGet<ShadowPracticeState>(STORAGE_KEY);
      if (stored) return stored;
    } catch { /* defaults */ }

    return {
      enabled: false,
      isRunning: false,
      cycleIntervalMs: DEFAULT_CYCLE_MS,
      totalPractices: 0,
      totalPassed: 0,
      totalBlocked: 0,
      currentTask: null,
      lastPracticeAt: null,
      bestScore: 0,
      averageScore: 0,
      recentResults: [],
    };
  }

  private persistState(): void {
    try {
      const toSave = {
        ...this.state,
        recentResults: this.state.recentResults.map(r => ({
          ...r,
          generated_code: null,
          task: { ...r.task, original_code: '[redacted]', prompt: '[redacted]' },
        })),
      };
      secureSet(STORAGE_KEY, toSave);
    } catch { /* recoverable */ }
  }

  // ═══════════════════════════════════════════════════════════════
  // STATUS
  // ═══════════════════════════════════════════════════════════════

  getStatus(): string {
    const s = this.state;
    const passRate = s.totalPractices > 0
      ? ((s.totalPassed / s.totalPractices) * 100).toFixed(1)
      : '0.0';

    return [
      `🎯 Shadow Practice Engine`,
      `   Enabled: ${s.enabled ? '✅' : '❌'}`,
      `   Running: ${s.isRunning ? '🔄' : '⏸️'}`,
      `   Cycle: Every ${s.cycleIntervalMs / 60000} min`,
      `   Total: ${s.totalPractices} | Passed: ${s.totalPassed} | Blocked: ${s.totalBlocked}`,
      `   Pass Rate: ${passRate}%`,
      `   Best Score: ${s.bestScore}/100`,
      `   Avg Score: ${s.averageScore.toFixed(1)}/100`,
      `   Current: ${s.currentTask || 'idle'}`,
      `   Last: ${s.lastPracticeAt || 'never'}`,
    ].join('\n');
  }
}

// ═══════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════

export const shadowPractice = ShadowPracticeEngine.getInstance();

/**
 * Explicitly initialize shadow practice auto-resume.
 * Call this from your app bootstrap — NOT as a module side effect.
 */
export function initShadowPractice(): void {
  if (typeof window === 'undefined') return;
  const state = shadowPractice.getState();
  if (state.enabled) {
    console.log('[Shadow Practice] 🎯 Auto-resuming shadow practice...');
    shadowPractice.start(state.cycleIntervalMs);
  }
}
