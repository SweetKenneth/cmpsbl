/**
 * DECODE Governor Command Executor — v1.0.0
 * Unified command parser, permission gate, and async execution pipeline.
 * 
 * Wraps the existing governor-commands.ts and command-router.ts into
 * a single execution pipeline with:
 *   - Unified parsing (prefix-agnostic)
 *   - Permission gating (role-based)
 *   - Execution timing
 *   - Structured responses
 *   - Audit trail emission
 */

import type { IdentityRole } from '@/stores/decodeStore';

// ═══ Types ════════════════════════════════════════════════════════

export interface CommandDefinition {
  name: string;
  aliases: string[];
  description: string;
  requiredRole: IdentityRole;
  category: 'query' | 'mutation' | 'system' | 'meta';
  params?: Array<{ name: string; required: boolean; description: string }>;
}

export interface ParsedCommand {
  name: string;
  args: string[];
  rawArgs: string;
  prefix: string;
  valid: boolean;
  definition?: CommandDefinition;
}

export interface ExecutionResult {
  command: string;
  success: boolean;
  output: string;
  executionMs: number;
  permitted: boolean;
  denialReason?: string;
  timestamp: string;
}

// ═══ Command Registry ═════════════════════════════════════════════

const COMMAND_REGISTRY: CommandDefinition[] = [
  // Meta
  { name: 'help', aliases: ['?', 'commands'], description: 'List available commands', requiredRole: 'anonymous', category: 'meta' },
  { name: 'version', aliases: ['ver', 'v'], description: 'Substrate version info', requiredRole: 'anonymous', category: 'meta' },
  { name: 'clear', aliases: ['cls', 'reset'], description: 'Clear conversation', requiredRole: 'anonymous', category: 'system' },

  // Standard queries
  { name: 'status', aliases: ['stat'], description: 'System status overview', requiredRole: 'anonymous', category: 'query' },
  { name: 'memory', aliases: ['mem'], description: 'Memory tier overview', requiredRole: 'anonymous', category: 'query' },
  { name: 'mode', aliases: [], description: 'Current mode and identity', requiredRole: 'anonymous', category: 'query' },
  { name: 'capabilities', aliases: ['caps-list'], description: 'List active capabilities', requiredRole: 'anonymous', category: 'query' },
  { name: 'nodes', aliases: ['topology'], description: 'Substrate node topology', requiredRole: 'anonymous', category: 'query' },
  { name: 'clm', aliases: ['priorities'], description: 'CLM priority report', requiredRole: 'anonymous', category: 'query' },

  // Governor queries
  { name: 'govern', aliases: ['governance'], description: 'Live governance mode', requiredRole: 'governor', category: 'query' },
  { name: 'health', aliases: ['sys-health'], description: 'System health snapshots', requiredRole: 'governor', category: 'query' },
  { name: 'caps', aliases: ['atlas-caps'], description: 'Atlas capability registry', requiredRole: 'governor', category: 'query' },
  { name: 'comms', aliases: ['mesh'], description: 'Recent mesh communications', requiredRole: 'governor', category: 'query' },
  { name: 'nexus', aliases: ['fleet', 'ai'], description: 'AI fleet usage and costs', requiredRole: 'governor', category: 'query' },
  { name: 'budget', aliases: ['quota'], description: 'Daily AI quota status', requiredRole: 'governor', category: 'query' },
  { name: 'audit', aliases: ['logs'], description: 'Recent audit log entries', requiredRole: 'governor', category: 'query' },
  { name: 'intents', aliases: ['intent-log'], description: 'Intent mesh activity', requiredRole: 'governor', category: 'query' },

  // Governor mutations
  {
    name: 'set-mode', aliases: ['setmode'],
    description: 'Change governance mode',
    requiredRole: 'governor', category: 'mutation',
    params: [{ name: 'mode', required: true, description: 'ACTIVE | OBSERVE | LOCKDOWN | EVOLVE' }],
  },
  {
    name: 'enable', aliases: [],
    description: 'Enable a capability',
    requiredRole: 'governor', category: 'mutation',
    params: [{ name: 'key', required: true, description: 'Capability key to enable' }],
  },
  {
    name: 'disable', aliases: [],
    description: 'Disable a capability',
    requiredRole: 'governor', category: 'mutation',
    params: [{ name: 'key', required: true, description: 'Capability key to disable' }],
  },
  { name: 'gov-help', aliases: ['ghelp'], description: 'Governor command reference', requiredRole: 'governor', category: 'meta' },
];

// Build lookup index
const commandIndex = new Map<string, CommandDefinition>();
for (const def of COMMAND_REGISTRY) {
  commandIndex.set(def.name, def);
  for (const alias of def.aliases) {
    commandIndex.set(alias, def);
  }
}

// ═══ Role Hierarchy ═══════════════════════════════════════════════

const ROLE_HIERARCHY: Record<IdentityRole, number> = {
  anonymous: 0,
  user: 1,
  creator: 2,
  architect: 3,
  governor: 4,
};

function hasPermission(userRole: IdentityRole, requiredRole: IdentityRole): boolean {
  return (ROLE_HIERARCHY[userRole] ?? 0) >= (ROLE_HIERARCHY[requiredRole] ?? 0);
}

// ═══ Parser ═══════════════════════════════════════════════════════

const COMMAND_PREFIXES = ['/', '>', ':'];

/**
 * Parse raw input into a structured command
 */
export function parseCommand(input: string): ParsedCommand {
  const trimmed = input.trim();
  const prefix = COMMAND_PREFIXES.find(p => trimmed.startsWith(p)) || '';

  if (!prefix) {
    return { name: '', args: [], rawArgs: '', prefix: '', valid: false };
  }

  const body = trimmed.slice(prefix.length).trim();
  const parts = body.split(/\s+/);
  const name = (parts[0] || '').toLowerCase();
  const args = parts.slice(1);

  const definition = commandIndex.get(name);

  return {
    name,
    args,
    rawArgs: args.join(' '),
    prefix,
    valid: !!definition,
    definition,
  };
}

/**
 * Check if input is a command
 */
export function isExecutableCommand(input: string): boolean {
  return COMMAND_PREFIXES.some(p => input.trim().startsWith(p));
}

// ═══ Permission Gate ══════════════════════════════════════════════

/**
 * Check if a command is permitted for the given role
 */
export function checkPermission(
  commandName: string,
  userRole: IdentityRole,
): { permitted: boolean; reason?: string } {
  const def = commandIndex.get(commandName);
  if (!def) {
    return { permitted: false, reason: `Unknown command: ${commandName}` };
  }

  if (!hasPermission(userRole, def.requiredRole)) {
    return {
      permitted: false,
      reason: `"${commandName}" requires ${def.requiredRole} role (current: ${userRole})`,
    };
  }

  return { permitted: true };
}

// ═══ Execution Pipeline ═══════════════════════════════════════════

// Audit log (in-memory ring buffer)
const executionLog: ExecutionResult[] = [];
const MAX_LOG = 100;

/**
 * Execute a parsed command with permission checking
 */
export async function executeCommand(
  parsed: ParsedCommand,
  userRole: IdentityRole,
  handler: (name: string, args: string[]) => Promise<string> | string,
): Promise<ExecutionResult> {
  const start = performance.now();

  // Permission check
  const perm = checkPermission(parsed.name, userRole);
  if (!perm.permitted) {
    const result: ExecutionResult = {
      command: parsed.name,
      success: false,
      output: `⛔ Access denied: ${perm.reason}`,
      executionMs: performance.now() - start,
      permitted: false,
      denialReason: perm.reason,
      timestamp: new Date().toISOString(),
    };
    logExecution(result);
    return result;
  }

  // Execute
  try {
    const output = await handler(parsed.name, parsed.args);
    const result: ExecutionResult = {
      command: parsed.name,
      success: true,
      output,
      executionMs: performance.now() - start,
      permitted: true,
      timestamp: new Date().toISOString(),
    };
    logExecution(result);
    return result;
  } catch (err) {
    const result: ExecutionResult = {
      command: parsed.name,
      success: false,
      output: `Error executing "${parsed.name}": ${err instanceof Error ? err.message : 'unknown error'}`,
      executionMs: performance.now() - start,
      permitted: true,
      timestamp: new Date().toISOString(),
    };
    logExecution(result);
    return result;
  }
}

function logExecution(result: ExecutionResult): void {
  executionLog.push(result);
  if (executionLog.length > MAX_LOG) executionLog.shift();
}

/**
 * Get execution audit log
 */
export function getExecutionLog(): ExecutionResult[] {
  return [...executionLog];
}

/**
 * Get all registered commands
 */
export function getRegisteredCommands(): CommandDefinition[] {
  return [...COMMAND_REGISTRY];
}

/**
 * Get commands available to a specific role
 */
export function getAvailableCommands(role: IdentityRole): CommandDefinition[] {
  return COMMAND_REGISTRY.filter(def => hasPermission(role, def.requiredRole));
}
