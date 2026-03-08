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
  | 'refactor'      // Improve existing code structure
  | 'add_types'     // Strengthen TypeScript types
  | 'error_handling' // Improve error handling
  | 'performance'   // Optimize performance
  | 'security'      // Harden security
  | 'documentation' // Add/improve documentation
  | 'testing'       // Write test cases
  | 'accessibility' // Improve a11y
  | 'pattern_apply' // Apply a specific expert pattern;

export interface PracticeResult {
  task: PracticeTask;
  generated_code: string | null;
  guard_result: GuardResult | null;
  score: number; // 0-100
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
const DEFAULT_CYCLE_MS = 10 * 60 * 1000; // 10 minutes default
const MAX_RECENT_RESULTS = 20;
const MAX_CODE_LENGTH = 5000; // Don't practice on huge files

// Files Encoded is allowed to practice on (shadow only)
const PRACTICE_TARGETS = [
  'src/lib/substrate/',
  'src/lib/codeagent/',
  'src/lib/evolve/',
  'src/lib/terminal/',
  'src/hooks/',
  'src/utils/',
  'src/components/',
];

// Files explicitly excluded from practice
const EXCLUDED_FILES = [
  'src/integrations/supabase/client.ts',
  'src/integrations/supabase/types.ts',
  'supabase/config.toml',
  '.env',
];

// Task type weights (higher = more likely to be selected)
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

  /**
   * Start auto-cycling shadow practice
   */
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

    // Run first cycle after short delay
    setTimeout(() => this.runPracticeCycle(), 3000);

    // Then auto-cycle
    this.intervalId = setInterval(() => {
      this.runPracticeCycle();
    }, cycle);
  }

  /**
   * Stop auto-cycling
   */
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

  /**
   * Update cycle interval (in minutes)
   */
  setCycleMinutes(minutes: number): void {
    const ms = Math.max(2, minutes) * 60 * 1000; // Minimum 2 minutes
    this.state.cycleIntervalMs = ms;
    this.persistState();

    // Restart if running
    if (this.intervalId) {
      this.stop();
      this.start(ms);
    }
  }

  /**
   * Get current state
   */
  getState(): ShadowPracticeState {
    return { ...this.state };
  }

  // ═══════════════════════════════════════════════════════════════
  // PRACTICE CYCLE
  // ═══════════════════════════════════════════════════════════════

  /**
   * Run a single practice cycle
   * 1. Pick a real file from the substrate
   * 2. Choose a practice task type
   * 3. Generate improved code via Nexus
   * 4. Run the Encoded Guard against it
   * 5. Score the result and feed back into mastery
   * 6. DISCARD the code — never commit
   */
  async runPracticeCycle(): Promise<PracticeResult | null> {
    if (this.state.isRunning) {
      console.log('[Shadow Practice] Already running a cycle');
      return null;
    }

    this.state.isRunning = true;
    this.state.currentTask = 'initializing';
    const startTime = Date.now();

    try {
      // 1. Pick a target file
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
        false, // Never auto-approve in practice
        task.file_path
      );

      // 6. Score the practice
      const score = this.scorePractice(task, generatedCode, guardResult);

      // 7. Record outcome to feedback loop
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

      // 8. Build result (code is ephemeral — NEVER stored for commit)
      const result: PracticeResult = {
        task,
        generated_code: null, // Intentionally null — shadow only, no persistence
        guard_result: guardResult,
        score,
        passed_guard: guardResult.ok,
        patterns_applied: pattern ? [pattern.id] : [],
        lessons_learned: this.extractLessons(guardResult),
        duration_ms: Date.now() - startTime,
        timestamp: new Date().toISOString(),
      };

      // 9. Update stats
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

      // 10. Log to brain_events for audit
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
  // FILE SELECTION
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

      // Extract unique file paths from events
      const filePaths = new Set<string>();
      events?.forEach(e => {
        const path = (e.data as any)?.file_path;
        if (path && typeof path === 'string') {
          filePaths.add(path);
        }
      });

      // Also add known substrate paths as synthetic targets
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

      // Pick a random valid file
      const candidates = Array.from(filePaths).filter(p => {
        const isTarget = PRACTICE_TARGETS.some(t => p.startsWith(t));
        const isExcluded = EXCLUDED_FILES.includes(p);
        return isTarget && !isExcluded;
      });

      if (candidates.length === 0) return null;

      // Weighted random selection (prefer files not recently practiced)
      const picked = candidates[Math.floor(Math.random() * candidates.length)];

      // For shadow practice, we generate a representative code snippet
      // based on the file's known structure (we can't read actual files client-side)
      const content = this.generateRepresentativeCode(picked);

      return { path: picked, content };
    } catch {
      return null;
    }
  }

  /**
   * Generate representative code for a file path
   * Since we're client-side, we create realistic practice material
   * based on the file's known role in the substrate
   */
  private generateRepresentativeCode(filePath: string): string {
    if (filePath.includes('guard')) {
      return `/**
 * Guard module — validates changes before write
 */
import { type ChangeClass } from './policy';

export function validateChange(before: string, after: string): { ok: boolean; reasons: string[] } {
  const reasons: string[] = [];
  if (!before && !after) reasons.push('Empty change');
  // TODO: Add more validation
  return { ok: reasons.length === 0, reasons };
}`;
    }

    if (filePath.includes('hook') || filePath.includes('use')) {
      return `/**
 * React hook for substrate integration
 */
import { useState, useEffect } from 'react';

export function useSubstrateData(moduleId: string) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    supabase.functions.invoke('pf-nexus-router', {
      body: { action: 'substrate_query', moduleId }
    })
      .then(({ data: d }) => setData(d))
      .catch(setError)
      .finally(() => setLoading(false));
  }, [moduleId]);

  return { data, loading, error };
}`;
    }

    if (filePath.includes('executor') || filePath.includes('engine')) {
      return `/**
 * Execution engine for substrate operations
 */
export interface ExecutionResult {
  success: boolean;
  data?: any;
  error?: string;
}

export async function execute(task: { id: string; type: string; payload: any }): Promise<ExecutionResult> {
  try {
    const result = await processTask(task);
    return { success: true, data: result };
  } catch (err) {
    return { success: false, error: String(err) };
  }
}

async function processTask(task: any): Promise<any> {
  // Process based on type
  switch (task.type) {
    case 'analyze': return analyzeCode(task.payload);
    case 'transform': return transformCode(task.payload);
    default: throw new Error('Unknown task type: ' + task.type);
  }
}`;
    }

    // Generic TypeScript module
    return `/**
 * Substrate utility module
 */

export interface ModuleConfig {
  enabled: boolean;
  name: string;
  version: string;
}

export function createModule(config: ModuleConfig) {
  if (!config.name) throw new Error('Module name required');
  
  return {
    ...config,
    start: () => console.log(config.name + ' started'),
    stop: () => console.log(config.name + ' stopped'),
    getStatus: () => ({ running: config.enabled, name: config.name }),
  };
}

export function validateConfig(config: any): config is ModuleConfig {
  return config && typeof config.name === 'string' && typeof config.enabled === 'boolean';
}`;
  }

  // ═══════════════════════════════════════════════════════════════
  // TASK SELECTION
  // ═══════════════════════════════════════════════════════════════

  private selectTaskType(): PracticeTaskType {
    const mastery = getOverallMastery();
    const types = Object.entries(TASK_WEIGHTS) as [PracticeTaskType, number][];

    // Adjust weights based on mastery — practice weaknesses more
    const adjusted = types.map(([type, weight]) => {
      // If mastery is high, focus more on advanced tasks
      if (mastery > 70 && ['security', 'performance', 'pattern_apply'].includes(type)) {
        return [type, weight * 1.5] as [PracticeTaskType, number];
      }
      // If mastery is low, focus on fundamentals
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
          temperature: 0.3, // Low temperature for precise code
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

      // Strip markdown fences if present
      code = code.replace(/^```(?:typescript|ts|tsx|javascript|js)?\n?/gm, '').replace(/```$/gm, '').trim();

      return code || null;
    } catch (error) {
      console.error('[Shadow Practice] Code generation failed:', error);
      return null;
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // SCORING
  // ═══════════════════════════════════════════════════════════════

  private scorePractice(task: PracticeTask, generated: string, guard: GuardResult): number {
    let score = 0;

    // Guard pass = 40 points base
    if (guard.ok) score += 40;

    // Anchors preserved = 20 points
    if (guard.anchorsPreserved) score += 20;

    // Low risk = 10 points
    if (guard.risk === 'minimal' || guard.risk === 'low') score += 10;
    else if (guard.risk === 'medium') score += 5;

    // Change classification bonus
    if (guard.changeClass === 'additive') score += 10;
    else if (guard.changeClass === 'localized') score += 15;
    else if (guard.changeClass === 'comment_only') score += 5;

    // Code quality heuristics
    if (generated.length > 0) {
      // Has proper TypeScript types (not any)
      if (!generated.includes(': any') && !generated.includes('as any')) score += 5;
      
      // Has error handling
      if (generated.includes('try') && generated.includes('catch')) score += 5;
      
      // Has JSDoc
      if (generated.includes('/**') && generated.includes('*/')) score += 5;
      
      // Reasonable size (not bloated)
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

  private extractLessons(guard: GuardResult): string[] {
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

    if (guard.ok && guard.warnings.length === 0) {
      lessons.push('Clean pass — code met all guard requirements');
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
    } catch { /* Storage unavailable — use defaults */ }

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
      // Don't persist generated code in results (shadow-only)
      const toSave = {
        ...this.state,
        recentResults: this.state.recentResults.map(r => ({
          ...r,
          generated_code: null,
          task: { ...r.task, original_code: '[redacted]', prompt: '[redacted]' },
        })),
      };
      secureSet(STORAGE_KEY, toSave);
    } catch { /* Storage pressure — practice state is recoverable */ }
  }

  // ═══════════════════════════════════════════════════════════════
  // STATUS
  // ═══════════════════════════════════════════════════════════════

  /**
   * Get formatted status for terminal/display
   */
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
