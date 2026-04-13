/**
 * mana — Silent Software Symbiosis Engine
 * Guided terminal experience for Layer 2 attachment.
 *
 * U.S. Patent App. No. 64/031,637
 * © CMPSBL® — All rights reserved.
 */

import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';

// ═══════════════════════════════════════════════════════════════
// ANSI helpers (zero-dependency)
// ═══════════════════════════════════════════════════════════════

const NO_COLOR = Boolean(process.env.NO_COLOR);

function ansi(code: string, text: string): string {
  if (NO_COLOR) return text;
  return `\x1b[${code}m${text}\x1b[0m`;
}

const c = {
  cyan:    (s: string) => ansi('38;5;37', s),
  green:   (s: string) => ansi('38;5;35', s),
  amber:   (s: string) => ansi('38;5;214', s),
  purple:  (s: string) => ansi('38;5;135', s),
  red:     (s: string) => ansi('38;5;196', s),
  muted:   (s: string) => ansi('38;5;242', s),
  bold:    (s: string) => ansi('1', s),
  dim:     (s: string) => ansi('2', s),
  white:   (s: string) => ansi('38;5;255', s),
};

const say = (m: string) => console.log(`  ${m}`);
const blank = () => console.log('');

function box(lines: string[], label?: string) {
  const maxLen = Math.max(...lines.map(l => l.length), (label?.length ?? 0) + 4);
  const top = label
    ? `╭─ ${label} ${'─'.repeat(Math.max(0, maxLen - label.length - 3))}╮`
    : `╭${'─'.repeat(maxLen + 2)}╮`;
  const bot = `╰${'─'.repeat(maxLen + 2)}╯`;

  say(c.cyan(top));
  for (const line of lines) {
    say(c.cyan('│') + ` ${line}${' '.repeat(Math.max(0, maxLen - line.length))} ` + c.cyan('│'));
  }
  say(c.cyan(bot));
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function prompt(question: string): Promise<string> {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise(resolve => {
    rl.question(`  ${question}`, (answer: string) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

// ═══════════════════════════════════════════════════════════════
// Capability Levels
// ═══════════════════════════════════════════════════════════════

type CapabilityLevel = 'safe' | 'enhanced' | 'protected' | 'advanced';

interface LevelConfig {
  name: string;
  description: string;
  groups: string[];
}

const LEVELS: Record<CapabilityLevel, LevelConfig> = {
  safe: {
    name: 'Safe',
    description: 'Minimal protection — basic validation + telemetry',
    groups: ['observability'],
  },
  enhanced: {
    name: 'Enhanced',
    description: 'Adds observability + stability — recommended for most users',
    groups: ['observability', 'performance'],
  },
  protected: {
    name: 'Protected',
    description: 'Full defense + governance — blocks unsafe execution paths',
    groups: ['defense', 'observability', 'governance', 'performance'],
  },
  advanced: {
    name: 'Advanced',
    description: 'Fine-grained control over capability groups',
    groups: [],
  },
};

const CAPABILITY_GROUPS = [
  { key: 'defense',       label: 'Defense',       description: 'Threat detection, circuit breakers, execution blocking' },
  { key: 'observability', label: 'Observability', description: 'Telemetry, health signals, runtime tracing' },
  { key: 'memory',        label: 'Memory',        description: 'Persistent recall, session history, knowledge retention' },
  { key: 'governance',    label: 'Governance',    description: 'Policy enforcement, compliance checks, audit trails' },
  { key: 'performance',   label: 'Performance',   description: 'Caching, optimization hints, resource efficiency' },
];

// ═══════════════════════════════════════════════════════════════
// File Detection
// ═══════════════════════════════════════════════════════════════

const SOURCE_EXTENSIONS = new Set([
  '.ts', '.js', '.tsx', '.jsx', '.py', '.rs', '.go', '.rb', '.php',
  '.java', '.kt', '.scala', '.cs', '.fs', '.swift', '.dart', '.c',
  '.cpp', '.h', '.hpp', '.lua', '.ex', '.exs', '.erl', '.hs',
  '.ml', '.sol', '.vy', '.move', '.cairo', '.zig', '.nim', '.cr',
  '.d', '.jl', '.r', '.pl', '.pm', '.clj', '.cljs', '.elm',
  '.purs', '.rkt', '.scm', '.lisp', '.f90', '.f95', '.f03',
  '.vhd', '.vhdl', '.v', '.sv', '.glsl', '.hlsl', '.wgsl',
  '.cu', '.cl', '.metal', '.tf', '.hcl', '.proto', '.sql',
  '.graphql', '.prisma', '.wat', '.wast', '.sh', '.bash', '.zsh',
  '.fish', '.bat', '.ps1', '.coffee', '.groovy',
]);

function detectSourceFiles(dir: string): string[] {
  const files: string[] = [];

  function walk(currentDir: string, depth: number) {
    if (depth > 4) return;
    try {
      const entries = fs.readdirSync(currentDir, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.name.startsWith('.') || entry.name === 'node_modules' || entry.name === 'dist') continue;
        const fullPath = path.join(currentDir, entry.name);
        if (entry.isDirectory()) {
          walk(fullPath, depth + 1);
        } else if (SOURCE_EXTENSIONS.has(path.extname(entry.name).toLowerCase())) {
          files.push(path.relative(dir, fullPath));
        }
      }
    } catch {
      /* permission or read error — skip */
    }
  }

  walk(dir, 0);
  return files;
}

// ═══════════════════════════════════════════════════════════════
// Config persistence (~/.mana/ or .mana/ in project)
// ═══════════════════════════════════════════════════════════════

interface ManaConfig {
  level: CapabilityLevel;
  groups: string[];
  attachedFiles: string[];
  attachedAt: string;
  version: string;
}

const CONFIG_DIR = '.mana';
const CONFIG_FILE = path.join(CONFIG_DIR, 'config.json');

function saveConfig(config: ManaConfig): void {
  if (!fs.existsSync(CONFIG_DIR)) fs.mkdirSync(CONFIG_DIR, { recursive: true });
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
}

function loadConfig(): ManaConfig | null {
  try {
    if (!fs.existsSync(CONFIG_FILE)) return null;
    return JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf-8')) as ManaConfig;
  } catch {
    return null;
  }
}

// ═══════════════════════════════════════════════════════════════
// Screens
// ═══════════════════════════════════════════════════════════════

async function screenDetection(fileCount: number): Promise<void> {
  blank();
  box([
    'Ascension has detected that your file now has a second layer.',
    '',
    'This layer enhances and protects your code without modifying it.',
  ], 'MANA');
  blank();
  say(c.muted(`${fileCount} source file${fileCount === 1 ? '' : 's'} detected.`));
  blank();
  await sleep(800);
}

async function screenLevelSelection(): Promise<CapabilityLevel> {
  say(c.bold('Choose your activation level:'));
  blank();
  say(`  ${c.cyan('1.')} ${c.bold('Safe')}`);
  say(`     ${c.muted('Minimal protection — basic validation + telemetry')}`);
  blank();
  say(`  ${c.green('2.')} ${c.bold('Enhanced')} ${c.muted('(recommended)')}`);
  say(`     ${c.muted('Adds observability + stability')}`);
  blank();
  say(`  ${c.amber('3.')} ${c.bold('Protected')}`);
  say(`     ${c.muted('Full defense + governance — blocks unsafe execution paths')}`);
  blank();
  say(`  ${c.purple('4.')} ${c.bold('Advanced Configuration')}`);
  say(`     ${c.muted('Fine-grained control over capability groups')}`);
  blank();

  const answer = await prompt('Select level (1-4): ');
  const map: Record<string, CapabilityLevel> = { '1': 'safe', '2': 'enhanced', '3': 'protected', '4': 'advanced' };
  const level = map[answer];

  if (!level) {
    say(c.amber('Defaulting to Enhanced.'));
    return 'enhanced';
  }

  return level;
}

async function screenAdvancedConfig(): Promise<string[]> {
  blank();
  say(c.bold('Advanced Configuration'));
  say(c.muted('Toggle capability groups on/off.'));
  blank();

  const enabled: string[] = [];

  for (const group of CAPABILITY_GROUPS) {
    const answer = await prompt(`Enable ${c.bold(group.label)}? ${c.muted(`(${group.description})`)} [Y/n]: `);
    const yes = !answer || answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes';
    if (yes) {
      enabled.push(group.key);
      say(`  ${c.green('✔')} ${group.label} enabled`);
    } else {
      say(`  ${c.muted('–')} ${group.label} skipped`);
    }
  }

  blank();
  return enabled;
}

async function screenConfirmation(level: CapabilityLevel, groups: string[], fileCount: number): Promise<void> {
  blank();
  box([
    'Ascension is now active.',
    '',
    'Your file is running with a secondary layer.',
    'Original code remains unchanged.',
  ], 'ACTIVE');
  blank();

  say(`  ${c.muted('Level:')}    ${c.bold(LEVELS[level].name)}`);
  say(`  ${c.muted('Groups:')}   ${groups.length > 0 ? groups.join(', ') : 'none'}`);
  say(`  ${c.muted('Files:')}    ${fileCount}`);
  blank();

  say(c.muted('To return to this menu at any time:'));
  blank();
  say(`  ${c.cyan('@cmpsbl/config')}`);
  blank();
}

// ═══════════════════════════════════════════════════════════════
// Commands
// ═══════════════════════════════════════════════════════════════

async function commandAttach(): Promise<void> {
  const cwd = process.cwd();
  const files = detectSourceFiles(cwd);

  if (files.length === 0) {
    blank();
    say(c.red('No source files detected in this directory.'));
    say(c.muted('Run this command from a project with source code.'));
    blank();
    process.exit(1);
  }

  await screenDetection(files.length);

  const level = await screenLevelSelection();

  let groups: string[];
  if (level === 'advanced') {
    groups = await screenAdvancedConfig();
  } else {
    groups = [...LEVELS[level].groups];
  }

  const config: ManaConfig = {
    level,
    groups,
    attachedFiles: files.slice(0, 50),
    attachedAt: new Date().toISOString(),
    version: '1.0.0',
  };

  saveConfig(config);

  await screenConfirmation(level, groups, files.length);
}

async function commandConfig(): Promise<void> {
  const existing = loadConfig();

  if (!existing) {
    say(c.amber('No active Mana configuration found.'));
    say(c.muted('Run `npx mana attach` first.'));
    return;
  }

  blank();
  say(c.bold('Current Configuration'));
  blank();
  say(`  ${c.muted('Level:')}       ${c.bold(LEVELS[existing.level].name)}`);
  say(`  ${c.muted('Groups:')}      ${existing.groups.join(', ') || 'none'}`);
  say(`  ${c.muted('Files:')}       ${existing.attachedFiles.length}`);
  say(`  ${c.muted('Attached:')}    ${existing.attachedAt}`);
  blank();

  const answer = await prompt('Reconfigure? [y/N]: ');
  if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
    await commandAttach();
  }
}

async function commandStatus(): Promise<void> {
  const config = loadConfig();

  if (!config) {
    say(c.muted('No active Mana layer. Run `npx mana attach` to begin.'));
    return;
  }

  blank();
  box([
    `Level: ${LEVELS[config.level].name}`,
    `Groups: ${config.groups.join(', ') || 'none'}`,
    `Files: ${config.attachedFiles.length}`,
    `Since: ${config.attachedAt}`,
  ], 'MANA STATUS');
  blank();
}

async function commandDetach(): Promise<void> {
  if (!fs.existsSync(CONFIG_FILE)) {
    say(c.muted('No active Mana layer to detach.'));
    return;
  }

  const answer = await prompt('Detach the secondary layer? Your code is never modified. [y/N]: ');
  if (answer.toLowerCase() !== 'y' && answer.toLowerCase() !== 'yes') {
    say(c.muted('Cancelled.'));
    return;
  }

  try {
    fs.unlinkSync(CONFIG_FILE);
    try { fs.rmdirSync(CONFIG_DIR); } catch { /* not empty or already gone */ }
  } catch {
    /* already gone */
  }

  blank();
  say(c.green('✔ Layer detached. Original code was never modified.'));
  blank();
}

function commandHelp(): void {
  blank();
  box(['Silent Software Symbiosis'], 'MANA');
  blank();
  say(c.bold('Commands:'));
  blank();
  say(`  ${c.cyan('mana attach')}    Detect files and activate Layer 2`);
  say(`  ${c.cyan('mana config')}    View or change activation level`);
  say(`  ${c.cyan('mana status')}    Show current layer status`);
  say(`  ${c.cyan('mana detach')}    Remove the secondary layer`);
  say(`  ${c.cyan('mana help')}      Show this help`);
  blank();
  say(c.muted('Your original code is never modified.'));
  blank();
}

// ═══════════════════════════════════════════════════════════════
// Entry
// ═══════════════════════════════════════════════════════════════

export async function run(args: string[]): Promise<void> {
  const command = args[0]?.toLowerCase();

  switch (command) {
    case 'attach':
      return commandAttach();
    case 'config':
      return commandConfig();
    case 'status':
      return commandStatus();
    case 'detach':
      return commandDetach();
    case 'help':
    case '--help':
    case '-h':
      return commandHelp();
    case undefined:
      /* No command — show help */
      return commandHelp();
    default:
      say(c.amber(`Unknown command: ${command}`));
      return commandHelp();
  }
}
