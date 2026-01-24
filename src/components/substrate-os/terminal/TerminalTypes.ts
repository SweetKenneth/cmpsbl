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

export type TerminalTheme = 'dark' | 'light' | 'matrix';

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
  '▓▓▓▓▓▓▓▓▓▓ promptfluid® substrate os v4.2.0',
  '◉ core kernel loaded',
  '◉ ripple message bus initialized',
  '◉ access identity layer online',
  '◉ brain cognitive engine ready',
  '◉ decode interpreter armed',
  '◉ defense grid activated',
  '◉ nexus ai router connected',
  '◉ vision telemetry streaming',
  '◉ dream-eater: standby',
  '◉ system admin layer ready',
  '◉ modernizer evolution engine online',
  '◉ integration enterprise adapters ready',
  '────────────────────────────────────────',
  '12 modules | 160+ commands | health: 100%',
  'type \'help\' for commands or \'help <module>\' for specifics',
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
