/**
 * Terminal Type Definitions
 * v8.5.0 — SYNERGY+ Epoch Terminal Configuration (340+ commands)
 */

export interface CommandResult {
  id: string;
  command: string;
  status: 'pending' | 'success' | 'error';
  output?: string;
  timestamp: Date;
  duration?: number;
}

export interface TerminalSession {
  id: string;
  startedAt: Date;
  commandCount: number;
  successCount: number;
  errorCount: number;
}

export type TerminalTheme = 'dark' | 'light' | 'matrix' | 'biohack';

export interface TerminalConfig {
  theme: TerminalTheme;
  showTimestamps: boolean;
  maxHistoryLength: number;
  autoscroll: boolean;
  showLineNumbers: boolean;
}

export const DEFAULT_CONFIG: TerminalConfig = {
  theme: 'dark',
  showTimestamps: true,
  maxHistoryLength: 100,
  autoscroll: true,
  showLineNumbers: false,
};

// Terminal personality messages
// Uses dynamic boot screen from TerminalBootScreen.ts
// This is the fallback for legacy compatibility
export const BOOT_MESSAGES = [
  '',
  '  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓',
  '  ▓  PROMPTFLUID® SUBSTRATE OS v8.5.0   ▓',
  '  ▓  SYNERGY+ Epoch Cognitive OS        ▓',
  '  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓',
  '',
  '  ┌─ BOOTSTRAP ───────────────────────────┐',
  '  │                                       │',
  '  │  ⬢ KERNEL                             │',
  '  │    ◉ core     ◉ ripple    ◉ access    │',
  '  │                                       │',
  '  │  ◈ COGNITIVE                          │',
  '  │    ◉ brain    ◉ decode    ◉ dream     │',
  '  │                                       │',
  '  │  ◆ OPERATIONS                         │',
  '  │    ◉ defense  ◉ nexus     ◉ vision    │',
  '  │                                       │',
  '  │  ◇ ADMIN                              │',
  '  │    ◉ system   ◉ modernizer            │',
  '  │    ◉ inclusive                        │',
  '  │                                       │',
  '  │  ★ ORCHESTRATOR                       │',
  '  │    ◉ cortex   ◉ integration           │',
  '  │                                       │',
  '  └───────────────────────────────────────┘',
  '',
  '  ◉ 14 modules operational',
  '  ◉ 340+ commands available',
  '  ◉ 147 synergy pipelines | 125 executors',
  '  ◉ Health: 100%',
  '',
  '  Type \'help\' for commands',
  '',
];

export const PERSONALITY_RESPONSES = {
  greeting: [
    'standing by for orders...',
    'neural pathways ready.',
    'cognitive substrate: online.',
    'awaiting input...',
    'ready to process.',
  ],
  success: [
    'operation complete.',
    'task executed successfully.',
    'neural pathways confirmed.',
    'cognitive loop closed.',
    'execution verified.',
  ],
  error: [
    'anomaly detected.',
    'pathway failed.',
    'cognitive disruption.',
    'attempting recovery...',
    'error in processing.',
  ],
  thinking: [
    'processing neural patterns...',
    'traversing knowledge graph...',
    'synthesizing insights...',
    'cognitive cycle in progress...',
    'analyzing substrate data...',
  ],
};

export function getRandomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}
