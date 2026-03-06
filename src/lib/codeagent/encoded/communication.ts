/**
 * Encoded Communication Module — Clear, structured output formatting
 * Polished responses with consistent formatting
 */

/**
 * Status indicator types
 */
export type StatusLevel = 'success' | 'warning' | 'error' | 'info' | 'pending';

/**
 * Emoji/symbol mappings for terminal output
 */
const STATUS_SYMBOLS: Record<StatusLevel, string> = {
  success: '✓',
  warning: '⚠',
  error: '✗',
  info: '○',
  pending: '◐',
};

const STATUS_COLORS: Record<StatusLevel, string> = {
  success: 'text-green-400',
  warning: 'text-amber-400',
  error: 'text-red-400',
  info: 'text-blue-400',
  pending: 'text-gray-400',
};

/**
 * Format a status line
 */
export function formatStatus(level: StatusLevel, message: string): string {
  return `${STATUS_SYMBOLS[level]} ${message}`;
}

/**
 * Format a key-value pair for display
 */
export function formatKV(key: string, value: unknown, indent = 0): string {
  const pad = '  '.repeat(indent);
  const formatted = typeof value === 'object' ? JSON.stringify(value) : String(value);
  return `${pad}${key}: ${formatted}`;
}

/**
 * Format a section header
 */
export function formatHeader(title: string, char = '─'): string {
  const line = char.repeat(Math.max(0, 40 - title.length));
  return `┌${char}${char} ${title} ${line}┐`;
}

/**
 * Format a section footer
 */
export function formatFooter(char = '─'): string {
  return `└${'─'.repeat(44)}┘`;
}

/**
 * Format a progress bar
 */
export function formatProgressBar(current: number, max: number, width = 20): string {
  const percent = max > 0 ? current / max : 0;
  const filled = Math.round(percent * width);
  const empty = width - filled;
  return `[${'█'.repeat(filled)}${'░'.repeat(empty)}] ${Math.round(percent * 100)}%`;
}

/**
 * Format verification result for terminal display
 */
export interface VerificationDisplay {
  syntax_valid: boolean;
  anchors_preserved: boolean;
  narrative_clean: boolean;
  dangerous_patterns_clean: boolean;
  issues: string[];
}

export function formatVerification(v: VerificationDisplay): string[] {
  const lines: string[] = [];
  
  lines.push(formatHeader('VERIFICATION'));
  lines.push('');
  
  lines.push(`  Syntax         ${v.syntax_valid ? '✓ Valid' : '✗ Invalid'}`);
  lines.push(`  Anchors        ${v.anchors_preserved ? '✓ Preserved' : '✗ Modified'}`);
  lines.push(`  Narrative      ${v.narrative_clean ? '✓ Clean' : '✗ Detected'}`);
  lines.push(`  Security       ${v.dangerous_patterns_clean ? '✓ Safe' : '✗ Dangerous'}`);
  
  if (v.issues.length > 0) {
    lines.push('');
    lines.push('  Issues:');
    v.issues.slice(0, 5).forEach(issue => {
      lines.push(`    • ${issue}`);
    });
    if (v.issues.length > 5) {
      lines.push(`    ... and ${v.issues.length - 5} more`);
    }
  }
  
  lines.push('');
  lines.push(formatFooter());
  
  return lines;
}

/**
 * Format generation result for terminal display
 */
export interface GenerationDisplay {
  success: boolean;
  dry_run: boolean;
  file_path?: string;
  operation?: string;
  confidence?: number;
  provider?: string;
  model?: string;
  latency_ms?: number;
}

export function formatGeneration(g: GenerationDisplay): string[] {
  const lines: string[] = [];
  
  lines.push(formatHeader('GENERATION RESULT'));
  lines.push('');
  
  lines.push(`  Status     ${g.success ? '✓ SUCCESS' : '✗ FAILED'}`);
  lines.push(`  Mode       ${g.dry_run ? 'DRY RUN (preview)' : 'LIVE'}`);
  
  if (g.file_path) {
    lines.push(`  Target     ${g.file_path}`);
  }
  if (g.operation) {
    lines.push(`  Operation  ${g.operation.toUpperCase()}`);
  }
  if (g.confidence !== undefined) {
    lines.push(`  Confidence ${formatProgressBar(g.confidence, 1, 15)}`);
  }
  
  lines.push('');
  lines.push('  Provider Info:');
  if (g.provider) {
    lines.push(`    Provider   ${g.provider}`);
  }
  if (g.model) {
    lines.push(`    Model      ${g.model}`);
  }
  if (g.latency_ms !== undefined) {
    lines.push(`    Latency    ${g.latency_ms}ms`);
  }
  
  lines.push('');
  lines.push(formatFooter());
  
  return lines;
}

/**
 * Format agent status for terminal display
 */
export interface AgentStatusDisplay {
  mode: string;
  modeLabel: string;
  model: string;
  modelLabel: string;
  sebaIntegration: boolean;
  clmTraining: boolean;
  patternsLearned: number;
  executionsToday: number;
}

export function formatAgentStatus(s: AgentStatusDisplay): string[] {
  const lines: string[] = [];
  
  lines.push('');
  lines.push('┌─────────────────────────────────────────────┐');
  lines.push('│               ENCODED                      │');
  lines.push('│      Precision Code Generation Agent       │');
  lines.push('└─────────────────────────────────────────────┘');
  lines.push('');
  
  lines.push('  Configuration');
  lines.push('  ─────────────');
  lines.push(`    Mode       ${s.modeLabel}`);
  lines.push(`    Model      ${s.modelLabel}`);
  lines.push(`    SEBA       ${s.sebaIntegration ? 'Integrated' : 'Independent'}`);
  lines.push(`    CLM        ${s.clmTraining ? 'Learning' : 'Disabled'}`);
  lines.push('');
  
  lines.push('  Statistics');
  lines.push('  ──────────');
  lines.push(`    Patterns   ${s.patternsLearned} learned`);
  lines.push(`    Today      ${s.executionsToday} executions`);
  lines.push('');
  
  lines.push('  Policy Enforcement');
  lines.push('  ──────────────────');
  lines.push('    ✓ File read required before write');
  lines.push('    ✓ Anchor preservation enforced');
  lines.push('    ✓ Narrative patterns blocked');
  lines.push('    ✓ Dangerous code rejected');
  lines.push('    ✓ Fail-closed on violations');
  lines.push('');
  
  return lines;
}

/**
 * Format help output for terminal
 */
export function formatHelp(): string[] {
  const lines: string[] = [];
  
  lines.push('');
  lines.push('┌─────────────────────────────────────────────┐');
  lines.push('│         ENCODED COMMAND REFERENCE           │');
  lines.push('└─────────────────────────────────────────────┘');
  lines.push('');
  
  lines.push('  Status & Configuration');
  lines.push('  ──────────────────────');
  lines.push('    encoded.status        Full agent status');
  lines.push('    encoded.config        View configuration');
  lines.push('    encoded.skills        View skill proficiency');
  lines.push('');
  
  lines.push('  Execution Modes');
  lines.push('  ───────────────');
  lines.push('    encoded.dry_run       Preview-only (safest)');
  lines.push('    encoded.enable        Human approval required');
  lines.push('    encoded.semi_auto     Auto-approve low-risk');
  lines.push('');
  
  lines.push('  Code Operations');
  lines.push('  ───────────────');
  lines.push('    encoded.generate      Generate code from task');
  lines.push('    encoded.verify        Validate code safety');
  lines.push('    encoded.analyze       Analyze code quality');
  lines.push('');
  
  lines.push('  Learning & History');
  lines.push('  ──────────────────');
  lines.push('    encoded.patterns      Learned code patterns');
  lines.push('    encoded.history       Recent executions');
  lines.push('    encoded.metrics       Quality metrics');
  lines.push('');
  
  lines.push('  Model Configuration');
  lines.push('  ───────────────────');
  lines.push('    encoded.model.nexus   Use Nexus fleet (Groq→Cerebras→DeepSeek)');
  lines.push('    encoded.model.free    Use free-tier fallback');
  lines.push('');
  
  lines.push('  Integration');
  lines.push('  ───────────');
  lines.push('    encoded.seba.enable   Enable SEBA proposals');
  lines.push('    encoded.seba.disable  Disable SEBA');
  lines.push('');
  
  return lines;
}

/**
 * Create a structured response object
 */
export interface EncodedResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  formatted?: string[];
  warnings?: string[];
  error?: string;
}

export function createResponse<T>(
  success: boolean,
  options: {
    message?: string;
    data?: T;
    formatted?: string[];
    warnings?: string[];
    error?: string;
  } = {}
): EncodedResponse<T> {
  return {
    success,
    ...options,
  };
}
