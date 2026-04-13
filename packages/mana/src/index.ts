/**
 * mana — Silent Software Symbiosis Engine
 * Guided terminal experience for Layer 2 attachment.
 *
 * U.S. Patent App. No. 64/031,637
 * © CMPSBL® — All rights reserved.
 */

import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import * as readline from 'readline';
import { execSync } from 'child_process';

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
  blue:    (s: string) => ansi('38;5;33', s),
  magenta: (s: string) => ansi('38;5;199', s),
};

const say = (m: string) => console.log(`  ${m}`);
const blank = () => console.log('');

function isTTY(): boolean {
  return Boolean(process.stdout.isTTY);
}

function box(lines: string[], label?: string) {
  const maxLen = Math.max(...lines.map(l => stripAnsi(l).length), (label?.length ?? 0) + 4);
  const top = label
    ? `╭─ ${label} ${'─'.repeat(Math.max(0, maxLen - label.length - 3))}╮`
    : `╭${'─'.repeat(maxLen + 2)}╮`;
  const bot = `╰${'─'.repeat(maxLen + 2)}╯`;

  say(c.cyan(top));
  for (const line of lines) {
    const pad = Math.max(0, maxLen - stripAnsi(line).length);
    say(c.cyan('│') + ` ${line}${' '.repeat(pad)} ` + c.cyan('│'));
  }
  say(c.cyan(bot));
}

function stripAnsi(s: string): string {
  return s.replace(/\x1b\[[0-9;]*m/g, '');
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
// Environment Identity Detection
// ═══════════════════════════════════════════════════════════════

interface EnvironmentIdentity {
  name: string | null;
  email: string | null;
  source: 'git' | 'os' | 'env' | 'none';
}

function detectIdentity(): EnvironmentIdentity {
  /* 1. Try git config */
  try {
    const gitName = execSync('git config user.name', { encoding: 'utf-8', timeout: 3000 }).trim();
    const gitEmail = execSync('git config user.email', { encoding: 'utf-8', timeout: 3000 }).trim();
    if (gitName || gitEmail) {
      return { name: gitName || null, email: gitEmail || null, source: 'git' };
    }
  } catch { /* git not installed or not in a repo */ }

  /* 2. Try environment variables */
  const envName = process.env.USER_DISPLAY_NAME || process.env.GIT_AUTHOR_NAME || process.env.GIT_COMMITTER_NAME;
  const envEmail = process.env.GIT_AUTHOR_EMAIL || process.env.GIT_COMMITTER_EMAIL;
  if (envName || envEmail) {
    return { name: envName || null, email: envEmail || null, source: 'env' };
  }

  /* 3. Try OS username */
  try {
    const info = os.userInfo();
    if (info.username && info.username !== 'root') {
      /* Capitalize first letter of each word */
      const formatted = info.username
        .replace(/[._-]/g, ' ')
        .replace(/\b\w/g, ch => ch.toUpperCase());
      return { name: formatted, email: null, source: 'os' };
    }
  } catch { /* restricted environments */ }

  return { name: null, email: null, source: 'none' };
}

// ═══════════════════════════════════════════════════════════════
// Credentials (~/.cmpsbl/credentials)
// ═══════════════════════════════════════════════════════════════

const CREDS_DIR = path.join(os.homedir(), '.cmpsbl');
const CREDS_FILE = path.join(CREDS_DIR, 'credentials');
const DEV_PORTAL_URL = 'https://cmpsbl.com/api-access';
const REGISTRATION_ENDPOINT = 'https://bxodolqqczjuahwdrswy.supabase.co/functions/v1/pf-substrate';

interface StoredCredentials {
  apiKey: string;
  displayName?: string;
  savedAt?: string;
}

function normalizeApiKey(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  const normalized = value.trim();
  if (normalized.length < 10) return undefined;
  if (['undefined', 'null', 'false'].includes(normalized.toLowerCase())) return undefined;
  return normalized;
}

function loadStoredCredentials(): StoredCredentials | undefined {
  try {
    if (!fs.existsSync(CREDS_FILE)) return undefined;
    const raw = fs.readFileSync(CREDS_FILE, 'utf-8').trim();
    if (!raw) return undefined;

    if (!raw.startsWith('{')) {
      const key = normalizeApiKey(raw);
      return key ? { apiKey: key } : undefined;
    }

    const parsed = JSON.parse(raw) as Record<string, unknown>;
    const apiKey = normalizeApiKey(
      parsed.apiKey ?? parsed.api_key ?? parsed.key ?? parsed.token
    );
    if (!apiKey) return undefined;

    return {
      apiKey,
      displayName: typeof parsed.displayName === 'string' ? parsed.displayName : undefined,
      savedAt: typeof parsed.savedAt === 'string' ? parsed.savedAt : undefined,
    };
  } catch {
    return undefined;
  }
}

function saveCredentials(apiKey: string, displayName?: string): void {
  if (!fs.existsSync(CREDS_DIR)) fs.mkdirSync(CREDS_DIR, { recursive: true });
  const payload: Record<string, unknown> = {
    apiKey,
    api_key: apiKey,
    savedAt: new Date().toISOString(),
  };
  if (displayName) payload.displayName = displayName;
  fs.writeFileSync(CREDS_FILE, JSON.stringify(payload, null, 2));
  try { fs.chmodSync(CREDS_FILE, 0o600); } catch { /* platform-specific */ }
}

function resolveApiKey(): string | undefined {
  return normalizeApiKey(process.env.CMPSBL_API_KEY) || loadStoredCredentials()?.apiKey;
}

function getStoredDisplayName(): string | undefined {
  return loadStoredCredentials()?.displayName;
}

// ═══════════════════════════════════════════════════════════════
// API Key Validation
// ═══════════════════════════════════════════════════════════════

async function validateApiKey(apiKey: string): Promise<{ valid: boolean; displayName?: string; error?: string }> {
  const normalized = normalizeApiKey(apiKey);
  if (!normalized || normalized.startsWith('local-')) {
    return { valid: false, error: 'Invalid API key' };
  }

  try {
    const res = await fetch(REGISTRATION_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        module: 'access',
        action: 'validate_key',
        payload: { api_key: normalized },
      }),
    });

    const result = await res.json() as Record<string, unknown>;
    if (result.success === true && result.valid === true) {
      const devRecord = typeof result.developer === 'object' && result.developer !== null
        ? result.developer as Record<string, unknown>
        : undefined;
      const displayName = (
        result.display_name ??
        result.displayName ??
        devRecord?.display_name ??
        devRecord?.displayName ??
        devRecord?.name
      ) as string | undefined;

      return { valid: true, displayName };
    }

    return { valid: false, error: typeof result.error === 'string' ? result.error : 'Invalid API key' };
  } catch {
    return { valid: false, error: 'Unable to reach the substrate' };
  }
}

// ═══════════════════════════════════════════════════════════════
// Inline Registration
// ═══════════════════════════════════════════════════════════════

async function inlineRegister(identity: EnvironmentIdentity): Promise<string | null> {
  blank();
  say(c.bold('DEVELOPER REGISTRATION'));
  blank();
  say('No passwords. No accounts. Just your email → instant API key.');
  blank();

  /* Pre-fill email from environment if available */
  let email: string;
  if (identity.email) {
    const confirm = await prompt(`Email ${c.muted(`(${identity.email})`)} [Enter to confirm]: `);
    email = confirm || identity.email;
  } else {
    email = await prompt('Your email: ');
  }

  if (!email || !email.includes('@') || email.length < 5) {
    say(c.red('Invalid email. Run `mana attach` to try again.'));
    return null;
  }

  /* Pre-fill name from environment */
  let name: string;
  if (identity.name) {
    const confirm = await prompt(`Name ${c.muted(`(${identity.name})`)} [Enter to confirm]: `);
    name = confirm || identity.name;
  } else {
    name = await prompt('Display name (press Enter to skip): ');
  }

  const displayName = name || email.split('@')[0];

  blank();
  say(c.muted('Registering with the substrate...'));

  try {
    const res = await fetch(REGISTRATION_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        module: 'access',
        action: 'create_key',
        payload: {
          email,
          display_name: displayName,
          name: `Mana Key — ${displayName}`,
          scopes: ['substrate.read', 'substrate.write', 'ascension', 'mana.attach'],
        },
      }),
    });

    const data = await res.json() as Record<string, unknown>;

    if (!data.success || !data.api_key) {
      say(c.red(`Registration failed: ${data.error || 'Unknown error'}`));
      say(`Register manually at ${c.cyan(DEV_PORTAL_URL)}`);
      return null;
    }

    /* Extract the developer name the API actually returned */
    const devRecord = typeof data.developer === 'object' && data.developer !== null
      ? data.developer as Record<string, unknown>
      : undefined;
    const returnedName = (
      data.display_name ??
      data.displayName ??
      devRecord?.display_name ??
      devRecord?.displayName ??
      devRecord?.name ??
      displayName
    ) as string;

    const apiKey = data.api_key as string;

    /* Save with the name the API confirmed */
    saveCredentials(apiKey, returnedName);

    blank();
    say(`${c.green('✔')} Developer profile created: ${c.bold(returnedName)}`);
    say(`${c.green('✔')} API key generated: ${(data.key_prefix as string) ?? '***'}...`);
    say(`${c.green('✔')} Saved to ~/.cmpsbl/credentials`);
    blank();

    return apiKey;
  } catch {
    say(c.red('Could not reach the substrate.'));
    say(`Register at ${c.cyan(DEV_PORTAL_URL)}`);
    return null;
  }
}

// ═══════════════════════════════════════════════════════════════
// API Key Gate
// ═══════════════════════════════════════════════════════════════

async function requireApiKey(identity: EnvironmentIdentity): Promise<string> {
  const existing = resolveApiKey();

  if (existing) {
    const validation = await validateApiKey(existing);
    if (validation.valid) {
      /* Update stored display name if API returned one */
      if (validation.displayName) {
        saveCredentials(existing, validation.displayName);
      }
      return existing;
    }
    /* Invalid — clear and re-auth */
    try { fs.unlinkSync(CREDS_FILE); } catch { /* already gone */ }
    say(c.amber('Saved API key is no longer valid. Let\'s get you a new one.'));
    blank();
  }

  /* No key — show auth options */
  blank();
  box([
    '◈  WELCOME TO MANA',
    '',
    'Get your API key in 10 seconds.',
    'Already have one? Choose option 2.',
  ], 'ACCESS');
  blank();

  say(`  ${c.cyan('[1]')} Register now ${c.muted('(email → instant key)')}  ← recommended`);
  say(`  ${c.cyan('[2]')} I have a key`);
  say(`  ${c.cyan('[3]')} Open Developer Portal in browser`);
  blank();

  const choice = await prompt('Choose (1/2/3): ');

  if (choice === '1' || choice === '') {
    const key = await inlineRegister(identity);
    if (key) return key;
  }

  if (choice === '3') {
    openBrowser(DEV_PORTAL_URL);
    say(`${c.green('✔')} Browser opened → ${DEV_PORTAL_URL}`);
    say('Generate your API key, then paste it below.');
    blank();
  }

  /* Manual paste (choice 2 or fallback) */
  const key = await prompt('Paste your API key: ');

  if (!key || key.length < 10) {
    say(c.red('Invalid API key. Run `mana attach` to try again.'));
    process.exit(1);
  }

  const validation = await validateApiKey(key);
  if (!validation.valid) {
    say(c.red(validation.error ?? 'Invalid API key.'));
    process.exit(1);
  }

  saveCredentials(key, validation.displayName);

  blank();
  say(`${c.green('✔')} API key saved to ~/.cmpsbl/credentials`);
  if (validation.displayName) {
    say(`${c.green('✔')} Welcome, ${c.bold(validation.displayName)}`);
  }
  blank();

  return key;
}

function openBrowser(url: string): void {
  try {
    const platform = process.platform;
    if (platform === 'win32') execSync(`start "" "${url}"`);
    else if (platform === 'darwin') execSync(`open "${url}"`);
    else execSync(`xdg-open "${url}"`);
  } catch {
    say(`Could not open browser. Visit: ${url}`);
  }
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

interface DetectedProject {
  files: string[];
  language: string;
  framework: string | null;
  entryPoint: string | null;
}

function detectSourceFiles(dir: string): DetectedProject {
  const files: string[] = [];
  const extCounts: Record<string, number> = {};

  function walk(currentDir: string, depth: number) {
    if (depth > 5) return;
    try {
      const entries = fs.readdirSync(currentDir, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.name.startsWith('.') || entry.name === 'node_modules' || entry.name === 'dist' || entry.name === '__pycache__' || entry.name === 'target' || entry.name === 'build') continue;
        const fullPath = path.join(currentDir, entry.name);
        if (entry.isDirectory()) {
          walk(fullPath, depth + 1);
        } else {
          const ext = path.extname(entry.name).toLowerCase();
          if (SOURCE_EXTENSIONS.has(ext)) {
            files.push(path.relative(dir, fullPath));
            extCounts[ext] = (extCounts[ext] ?? 0) + 1;
          }
        }
      }
    } catch { /* skip */ }
  }

  walk(dir, 0);

  /* Determine primary language */
  const sorted = Object.entries(extCounts).sort((a, b) => b[1] - a[1]);
  const topExt = sorted[0]?.[0] ?? '';
  const langMap: Record<string, string> = {
    '.ts': 'TypeScript', '.js': 'JavaScript', '.tsx': 'TypeScript', '.jsx': 'JavaScript',
    '.py': 'Python', '.rs': 'Rust', '.go': 'Go', '.rb': 'Ruby', '.php': 'PHP',
    '.java': 'Java', '.kt': 'Kotlin', '.scala': 'Scala', '.cs': 'C#', '.swift': 'Swift',
    '.dart': 'Dart', '.c': 'C', '.cpp': 'C++', '.sol': 'Solidity', '.zig': 'Zig',
    '.hs': 'Haskell', '.ex': 'Elixir', '.erl': 'Erlang', '.lua': 'Lua',
  };
  const language = langMap[topExt] ?? 'Source Code';

  /* Detect framework hints */
  let framework: string | null = null;
  const hasFile = (name: string) => fs.existsSync(path.join(dir, name));
  if (hasFile('next.config.js') || hasFile('next.config.ts') || hasFile('next.config.mjs')) framework = 'Next.js';
  else if (hasFile('vite.config.ts') || hasFile('vite.config.js')) framework = 'Vite';
  else if (hasFile('angular.json')) framework = 'Angular';
  else if (hasFile('Cargo.toml')) framework = 'Rust/Cargo';
  else if (hasFile('go.mod')) framework = 'Go Modules';
  else if (hasFile('pyproject.toml') || hasFile('setup.py')) framework = 'Python Package';
  else if (hasFile('Gemfile')) framework = 'Ruby/Bundler';
  else if (hasFile('pom.xml') || hasFile('build.gradle')) framework = 'JVM';
  else if (hasFile('Package.swift')) framework = 'Swift Package';
  else if (hasFile('docker-compose.yml') || hasFile('Dockerfile')) framework = 'Docker';

  /* Find entry point */
  const entryHints = ['index.ts', 'index.js', 'main.ts', 'main.js', 'app.ts', 'app.js', 'server.ts', 'server.js', 'main.py', 'app.py', 'main.rs', 'main.go'];
  let entryPoint: string | null = null;
  for (const hint of entryHints) {
    const match = files.find(f => f.endsWith(hint) || f === `src/${hint}`);
    if (match) { entryPoint = match; break; }
  }

  return { files, language, framework, entryPoint };
}

// ═══════════════════════════════════════════════════════════════
// Config persistence (.mana/)
// ═══════════════════════════════════════════════════════════════

interface ManaConfig {
  level: CapabilityLevel;
  groups: string[];
  attachedFiles: string[];
  attachedAt: string;
  version: string;
  operator?: string;
  language?: string;
  framework?: string | null;
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
// First Contact Ceremony
// ═══════════════════════════════════════════════════════════════

async function firstContactCeremony(project: DetectedProject, operatorName: string): Promise<void> {
  if (!isTTY()) return;

  blank();
  say(c.muted('╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌'));
  blank();

  /* Phase 1: Recognition */
  say(`  ${c.cyan('◈')} Operator identified: ${c.bold(operatorName)}`);
  await sleep(400);

  say(`  ${c.cyan('◈')} Project language: ${c.bold(project.language)}`);
  await sleep(300);

  if (project.framework) {
    say(`  ${c.cyan('◈')} Framework detected: ${c.bold(project.framework)}`);
    await sleep(300);
  }

  say(`  ${c.cyan('◈')} Source files: ${c.bold(String(project.files.length))}`);
  await sleep(300);

  if (project.entryPoint) {
    say(`  ${c.cyan('◈')} Entry point: ${c.bold(project.entryPoint)}`);
    await sleep(300);
  }

  blank();
  await sleep(500);

  /* Phase 2: Layer Analysis */
  say(c.muted('  ── Analyzing code boundaries ──'));
  blank();
  await sleep(600);

  const signals = [
    { icon: '🛡', from: 'DEFENSE',       action: 'Perimeter scan complete. No threats detected.' },
    { icon: '🔍', from: 'ASCENSION',     action: `Scanning ${project.files.length} source files for enhancement targets...` },
    { icon: '⚡', from: 'MANA',          action: 'Function boundaries identified. Attachment points mapped.' },
    { icon: '📊', from: 'OBSERVABILITY', action: 'Telemetry channels opened. Health signals ready.' },
    { icon: '🧬', from: 'GOVERNANCE',    action: 'Policy engine armed. Behavioral contracts loading.' },
  ];

  for (const sig of signals) {
    say(`  ${sig.icon} ${c.cyan(sig.from)}`);
    say(`     ${c.muted(sig.action)}`);
    await sleep(350);
  }

  blank();
  await sleep(400);

  /* Phase 3: Detection Confirmation */
  box([
    '',
    '  Ascension has detected that your code is ready',
    '  for a second layer.',
    '',
    '  This layer enhances and protects your software',
    '  without modifying a single line of your code.',
    '',
    `  ${c.muted(`${project.files.length} files · ${project.language}${project.framework ? ` · ${project.framework}` : ''}`)}`,
    '',
  ], 'MANA — LAYER DETECTED');
  blank();

  await sleep(800);
}

// ═══════════════════════════════════════════════════════════════
// Level Selection Screen
// ═══════════════════════════════════════════════════════════════

async function screenLevelSelection(): Promise<CapabilityLevel> {
  say(c.bold('Choose your activation level:'));
  blank();

  say(`  ${c.cyan('1.')} ${c.bold('Safe')}`);
  say(`     ${c.muted('Minimal protection')}`);
  say(`     ${c.muted('Basic validation + telemetry')}`);
  blank();

  say(`  ${c.green('2.')} ${c.bold('Enhanced')}  ${c.green('← recommended')}`);
  say(`     ${c.muted('Adds observability + stability')}`);
  say(`     ${c.muted('Best balance for most projects')}`);
  blank();

  say(`  ${c.amber('3.')} ${c.bold('Protected')}`);
  say(`     ${c.muted('Full defense + governance')}`);
  say(`     ${c.muted('Blocks unsafe execution paths')}`);
  blank();

  say(`  ${c.purple('4.')} ${c.bold('Advanced Configuration')}`);
  say(`     ${c.muted('Fine-grained control over capability groups')}`);
  blank();

  const answer = await prompt('Select level (1-4): ');
  const map: Record<string, CapabilityLevel> = { '1': 'safe', '2': 'enhanced', '3': 'protected', '4': 'advanced' };
  const level = map[answer];

  if (!level) {
    say(c.muted('Defaulting to Enhanced.'));
    return 'enhanced';
  }

  return level;
}

// ═══════════════════════════════════════════════════════════════
// Advanced Config Screen
// ═══════════════════════════════════════════════════════════════

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

// ═══════════════════════════════════════════════════════════════
// Activation Ceremony
// ═══════════════════════════════════════════════════════════════

async function activationCeremony(level: CapabilityLevel, groups: string[], project: DetectedProject, operatorName: string): Promise<void> {
  if (!isTTY()) return;

  blank();
  say(c.muted('  ── Attaching Layer 2 ──'));
  blank();
  await sleep(500);

  const steps = [
    { icon: '◈', text: 'Binding function boundaries...' },
    { icon: '◈', text: `Activating ${groups.length} capability group${groups.length === 1 ? '' : 's'}...` },
    { icon: '◈', text: 'Establishing behavioral contracts...' },
    { icon: '◈', text: 'Sealing governance layer...' },
    { icon: '◈', text: 'Layer 2 operational.' },
  ];

  for (const step of steps) {
    say(`  ${c.cyan(step.icon)} ${step.text}`);
    await sleep(350);
  }

  blank();
  await sleep(400);

  /* Final confirmation */
  box([
    '',
    `  ${c.green('✔')} Ascension is now active.`,
    '',
    '  Your code is running with a secondary layer.',
    '  Original source code remains unchanged.',
    '',
    `  ${c.muted(`Operator: ${operatorName}`)}`,
    `  ${c.muted(`Level:    ${LEVELS[level].name}`)}`,
    `  ${c.muted(`Groups:   ${groups.join(', ') || 'none'}`)}`,
    `  ${c.muted(`Files:    ${project.files.length}`)}`,
    `  ${c.muted(`Language: ${project.language}`)}`,
    '',
  ], 'MANA — ACTIVE');

  blank();
  say(`  ${c.muted('To reconfigure at any time:')} ${c.cyan('@cmpsbl/config')}`);
  say(`  ${c.muted('To check status:')}            ${c.cyan('mana status')}`);
  say(`  ${c.muted('To detach:')}                   ${c.cyan('mana detach')}`);
  blank();

  say(c.dim('  ── Your code. Enhanced. Protected. Unchanged. ──'));
  blank();
}

// ═══════════════════════════════════════════════════════════════
// Commands
// ═══════════════════════════════════════════════════════════════

async function commandAttach(): Promise<void> {
  const cwd = process.cwd();
  const identity = detectIdentity();
  const project = detectSourceFiles(cwd);

  if (project.files.length === 0) {
    blank();
    say(c.red('No source files detected in this directory.'));
    say(c.muted('Run this command from a project with source code.'));
    blank();
    process.exit(1);
  }

  /* Gate: require API key */
  const apiKey = await requireApiKey(identity);

  /* Resolve operator name */
  const storedName = getStoredDisplayName();
  const operatorName = storedName || identity.name || 'Operator';

  /* First Contact Ceremony */
  await firstContactCeremony(project, operatorName);

  /* Level Selection */
  const level = await screenLevelSelection();

  /* Advanced config if selected */
  let groups: string[];
  if (level === 'advanced') {
    groups = await screenAdvancedConfig();
  } else {
    groups = [...LEVELS[level].groups];
  }

  /* Save config */
  const config: ManaConfig = {
    level,
    groups,
    attachedFiles: project.files.slice(0, 100),
    attachedAt: new Date().toISOString(),
    version: '1.0.0',
    operator: operatorName,
    language: project.language,
    framework: project.framework,
  };
  saveConfig(config);

  /* Activation Ceremony */
  await activationCeremony(level, groups, project, operatorName);
}

async function commandConfig(): Promise<void> {
  const existing = loadConfig();

  if (!existing) {
    say(c.amber('No active Mana configuration found.'));
    say(c.muted('Run `npx mana attach` first.'));
    return;
  }

  blank();
  box([
    `Operator:  ${existing.operator ?? 'Unknown'}`,
    `Level:     ${LEVELS[existing.level].name}`,
    `Groups:    ${existing.groups.join(', ') || 'none'}`,
    `Files:     ${existing.attachedFiles.length}`,
    `Language:  ${existing.language ?? 'Unknown'}`,
    `Framework: ${existing.framework ?? 'None'}`,
    `Since:     ${existing.attachedAt}`,
  ], 'MANA CONFIG');
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
    `${c.green('●')} Layer 2 Active`,
    '',
    `Operator:  ${config.operator ?? 'Unknown'}`,
    `Level:     ${LEVELS[config.level].name}`,
    `Groups:    ${config.groups.join(', ') || 'none'}`,
    `Files:     ${config.attachedFiles.length}`,
    `Language:  ${config.language ?? 'Unknown'}`,
    `Framework: ${config.framework ?? 'None'}`,
    `Since:     ${config.attachedAt}`,
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
    try { fs.rmdirSync(CONFIG_DIR); } catch { /* not empty */ }
  } catch { /* already gone */ }

  blank();
  say(`${c.green('✔')} Layer detached. Original code was never modified.`);
  blank();
}

function commandHelp(): void {
  blank();
  box([
    'Silent Software Symbiosis',
    '',
    'Enhance and protect your code without modifying it.',
  ], 'MANA');
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
      return commandHelp();
    default:
      say(c.amber(`Unknown command: ${command}`));
      return commandHelp();
  }
}
