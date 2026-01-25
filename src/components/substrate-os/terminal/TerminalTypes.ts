/**
 * Terminal Type Definitions
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
export const BOOT_MESSAGES = [
  '▓▓▓▓▓▓▓▓▓▓ promptfluid® substrate os v5.5.0',
  '┌ BOOTSTRAP ──────────────────────────────',
  '│ core ............. ok',
  '│ ripple ........... ok',
  '│ access ........... ok',
  '│ brain ............ ok',
  '│ vision ........... ok',
  '│ cortex ........... ok (mode: manual)',
  '│ modernizer ....... ok',
  '│ decode ........... ok',
  '│ defense .......... ok',
  '│ nexus ............ ok',
  '│ dream ............ ok',
  '│ integration ...... ok',
  '└ READY',
  '────────────────────────────────────────',
  '13 modules | 250+ commands | health: 100%',
  'type \'help\' for commands • \'cortex.status\' for orchestrator',
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
