/**
 * DECODE Terminal Command Router
 * Intercepts prefixed messages (/, >, :) and returns system responses
 * before LLM routing — saves tokens for simple queries.
 */

import { NODE_CLM_PRIORITIES, getCLMPrioritySummary, getNodesBySector } from '@/lib/substrate/clm/node-priorities';

export interface CommandResponse {
  handled: boolean;
  output: string;
}

const COMMAND_PREFIXES = ['/', '>', ':'];

/** Check if input is a terminal command */
export function isCommand(input: string): boolean {
  const trimmed = input.trim();
  return COMMAND_PREFIXES.some(p => trimmed.startsWith(p));
}

/** Strip prefix and normalize */
function parseCommand(input: string): string {
  return input.trim().slice(1).trim().toLowerCase();
}

/** Route a command and return a terminal-style response */
export function routeCommand(
  input: string,
  context: {
    mode: string;
    identityRole: string;
    capabilities: Array<{ id: string; label: string }>;
    connectionStatus: string;
    messageCount: number;
  }
): CommandResponse {
  if (!isCommand(input)) return { handled: false, output: '' };

  const cmd = parseCommand(input);
  const handler = COMMANDS[cmd];

  if (!handler) {
    return {
      handled: true,
      output: formatBlock('UNKNOWN COMMAND', [
        `"${cmd}" is not a recognized command.`,
        '',
        'Type /help to see available commands.',
      ]),
    };
  }

  return { handled: true, output: handler(context) };
}

// ─── Command Definitions ────────────────────────────────────────

type CommandContext = {
  mode: string;
  identityRole: string;
  capabilities: Array<{ id: string; label: string }>;
  connectionStatus: string;
  messageCount: number;
};

type CommandHandler = (ctx: CommandContext) => string;

const COMMANDS: Record<string, CommandHandler> = {
  help: () => formatBlock('DECODE COMMANDS', [
    '/help          — show this list',
    '/status        — system status',
    '/memory        — memory tier overview',
    '/mode          — current mode + identity',
    '/clear         — clear conversation',
    '/capabilities  — list active capabilities',
    '/nodes         — substrate node count',
    '/clm           — CLM priority report',
    '/version       — substrate version',
    '',
    'Prefix with /  >  or  :',
    'Non-command messages route to LLM.',
  ]),

  status: (ctx) => formatBlock('DECODE SYSTEM STATUS', [
    `interface:     online`,
    `mode:          ${ctx.mode}`,
    `identity:      ${ctx.identityRole}`,
    `capabilities:  ${ctx.capabilities.map(c => c.label).join(' · ') || 'none'}`,
    `memory tier:   HOT`,
    `connection:    ${ctx.connectionStatus}`,
    `latency:       nominal`,
  ]),

  memory: () => formatBlock('MEMORY TIER OVERVIEW', [
    'HOT    — active session context (in-memory)',
    'WARM   — recent interactions (session storage)',
    'COLD   — persistent user memory (database)',
    'LEGACY — archived / deprecated entries',
    '',
    'Current: HOT active',
  ]),

  mode: (ctx) => formatBlock('DECODE MODE', [
    `mode:          ${ctx.mode}`,
    `identity:      ${ctx.identityRole}`,
    `capabilities:  ${ctx.capabilities.map(c => c.label).join(' · ') || 'none'}`,
    '',
    'Available modes: assistant · support · builder · governor',
    ctx.identityRole !== 'governor'
      ? 'Governor mode requires IDENTITY verification.'
      : 'Governor mode: accessible.',
  ]),

  clear: () => '__CLEAR__',

  capabilities: (ctx) => formatBlock('ACTIVE CAPABILITIES', [
    ...ctx.capabilities.map(c => `  ▸ ${c.label}`),
    '',
    ctx.identityRole === 'governor'
      ? 'Governor capabilities unlocked.'
      : 'Standard capability set active.',
  ]),

  nodes: () => {
    const summary = getCLMPrioritySummary();
    const sectors = ['CORE', 'SYSTEM', 'CCR', 'OCG', 'Execution', 'ESZ', 'EPZ', 'EMZ', 'CSZ', 'Fields', 'Plane', 'Shell'];
    const sectorLines = sectors.map(s => {
      const nodes = getNodesBySector(s);
      return `  ${s.padEnd(12)} ${nodes.map(n => n.displayName).join(' · ')}`;
    });
    return formatBlock('SUBSTRATE TOPOLOGY', [
      `Nodes:         ${summary.totalNodes}`,
      `Sectors:       ${summary.sectors.length}`,
      `CLM Caps:      ${summary.totalCapabilities}`,
      `Acknowledged:  ${summary.acknowledged}/${summary.totalNodes}`,
      `Gen-1 Nodes:   ${summary.generation1Count}`,
      `Gen-2 Nodes:   ${summary.generation2Count}`,
      '',
      ...sectorLines,
      '',
      'All nodes acknowledged and operational.',
    ]);
  },

  clm: () => {
    const sectors = ['CORE', 'SYSTEM', 'CCR', 'OCG', 'Execution', 'ESZ', 'EPZ', 'EMZ', 'CSZ', 'Fields', 'Plane', 'Shell'];
    const lines: string[] = [];
    for (const s of sectors) {
      const nodes = getNodesBySector(s);
      if (nodes.length === 0) continue;
      lines.push(`── ${s} ──`);
      for (const n of nodes) {
        lines.push(`  ${n.displayName.padEnd(12)} ✓ acknowledged`);
        for (const p of n.priorities) {
          lines.push(`    ▸ ${p.capability.replace('clm_', '')} (p=${p.priority})`);
        }
      }
      lines.push('');
    }
    const summary = getCLMPrioritySummary();
    return formatBlock(`CLM PRIORITY REPORT — ${summary.totalNodes} NODES`, [
      `Total capabilities: ${summary.totalCapabilities}`,
      `All nodes acknowledged: ${summary.acknowledged === summary.totalNodes ? 'YES' : 'NO'}`,
      '',
      ...lines,
    ]);
  },

  version: () => formatBlock('SUBSTRATE', [
    'CMPSBL® Substrate OS',
    'MINDGAMES Epoch',
    'The Era of Users & Memory Stream',
    '40 Primitives · 4 Categories',
  ]),
};

// ─── Formatting ─────────────────────────────────────────────────

function formatBlock(title: string, lines: string[]): string {
  const divider = '─'.repeat(Math.max(title.length, 24));
  return [
    `\`\`\``,
    title,
    divider,
    ...lines,
    `\`\`\``,
  ].join('\n');
}
