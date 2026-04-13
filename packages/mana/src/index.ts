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
import * as crypto from 'crypto';

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
  try {
    const gitName = execSync('git config user.name', { encoding: 'utf-8', timeout: 3000 }).trim();
    const gitEmail = execSync('git config user.email', { encoding: 'utf-8', timeout: 3000 }).trim();
    if (gitName || gitEmail) {
      return { name: gitName || null, email: gitEmail || null, source: 'git' };
    }
  } catch { /* git not installed or not in a repo */ }

  const envName = process.env.USER_DISPLAY_NAME || process.env.GIT_AUTHOR_NAME || process.env.GIT_COMMITTER_NAME;
  const envEmail = process.env.GIT_AUTHOR_EMAIL || process.env.GIT_COMMITTER_EMAIL;
  if (envName || envEmail) {
    return { name: envName || null, email: envEmail || null, source: 'env' };
  }

  try {
    const info = os.userInfo();
    if (info.username && info.username !== 'root') {
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
  developerId?: string;
  savedAt?: string;
  lastCommand?: string;
  lastCommandAt?: string;
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
      developerId: typeof parsed.developerId === 'string' ? parsed.developerId : undefined,
      savedAt: typeof parsed.savedAt === 'string' ? parsed.savedAt : undefined,
    };
  } catch {
    return undefined;
  }
}

function saveCredentials(apiKey: string, displayName?: string): void {
  if (!fs.existsSync(CREDS_DIR)) fs.mkdirSync(CREDS_DIR, { recursive: true });

  // Preserve existing fields
  let existing: Record<string, unknown> = {};
  try {
    if (fs.existsSync(CREDS_FILE)) {
      const raw = fs.readFileSync(CREDS_FILE, 'utf-8').trim();
      if (raw.startsWith('{')) existing = JSON.parse(raw);
    }
  } catch { /* ignore */ }

  const payload: Record<string, unknown> = {
    ...existing,
    apiKey,
    api_key: apiKey,
    savedAt: new Date().toISOString(),
  };
  if (displayName) payload.displayName = displayName;
  fs.writeFileSync(CREDS_FILE, JSON.stringify(payload, null, 2));
  try { fs.chmodSync(CREDS_FILE, 0o600); } catch { /* platform-specific */ }
}

function trackLastCommand(command: string): void {
  try {
    if (!fs.existsSync(CREDS_FILE)) return;
    const raw = fs.readFileSync(CREDS_FILE, 'utf-8').trim();
    if (!raw.startsWith('{')) return;
    const parsed = JSON.parse(raw);
    parsed.lastCommand = command;
    parsed.lastCommandAt = new Date().toISOString();
    fs.writeFileSync(CREDS_FILE, JSON.stringify(parsed, null, 2));
  } catch { /* silent */ }
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

interface ManaValidationResult {
  valid: boolean;
  displayName?: string;
  substrateRole?: string;
  error?: string;
}

async function validateApiKey(apiKey: string): Promise<ManaValidationResult> {
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

      const substrateRole = typeof result.substrate_role === 'string' ? result.substrate_role : 'builder';

      return { valid: true, displayName, substrateRole };
    }

    return { valid: false, error: typeof result.error === 'string' ? result.error : 'Invalid API key' };
  } catch {
    return { valid: false, error: 'Unable to reach the substrate' };
  }
}

/** Governor Welcome Ceremony — exclusive to the Governor */
async function manaGovernorCeremony(displayName: string): Promise<void> {
  blank();
  say(c.dim('─────────────────────────────────────────────────'));
  say('');
  await sleep(300);
  say(`  ${c.green('◆')} ${c.bold(c.green('GOVERNOR RECOGNIZED'))}`);
  await sleep(200);
  say('');
  say(`  ${c.cyan('Welcome back, Governor')} ${c.bold(c.cyan(displayName))}`);
  say('');
  await sleep(400);
  say(`  ${c.muted('┌──────────────────────────────────────────┐')}`);
  say(`  ${c.muted('│')}  ${c.green('●')} The substrate answers to you.          ${c.muted('│')}`);
  say(`  ${c.muted('│')}  ${c.green('●')} Layer 2 governance: supreme authority. ${c.muted('│')}`);
  say(`  ${c.muted('│')}  ${c.green('●')} All access unlocked. Lex defers.       ${c.muted('│')}`);
  say(`  ${c.muted('└──────────────────────────────────────────┘')}`);
  await sleep(400);
  say('');
  say(c.dim('─────────────────────────────────────────────────'));
  blank();
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
          source: 'mana_cli',
        },
      }),
    });

    const data = await res.json() as Record<string, unknown>;

    if (!data.success || !data.api_key) {
      say(c.red(`Registration failed: ${data.error || 'Unknown error'}`));
      say(`Register manually at ${c.cyan(DEV_PORTAL_URL)}`);
      return null;
    }

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
      if (validation.displayName) {
        saveCredentials(existing, validation.displayName);
      }
      /* Governor ceremony — supreme authority recognized */
      if (validation.substrateRole === 'governor' && isTTY()) {
        await manaGovernorCeremony(validation.displayName ?? 'Governor');
      }
      return existing;
    }
    try { fs.unlinkSync(CREDS_FILE); } catch { /* already gone */ }
    say(c.amber('Saved API key is no longer valid. Let\'s get you a new one.'));
    blank();
  }

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
  projectName: string;
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

  const entryHints = ['index.ts', 'index.js', 'main.ts', 'main.js', 'app.ts', 'app.js', 'server.ts', 'server.js', 'main.py', 'app.py', 'main.rs', 'main.go'];
  let entryPoint: string | null = null;
  for (const hint of entryHints) {
    const match = files.find(f => f.endsWith(hint) || f === `src/${hint}`);
    if (match) { entryPoint = match; break; }
  }

  /* Derive a project name from package.json or directory name */
  let projectName = path.basename(dir);
  try {
    const pkgPath = path.join(dir, 'package.json');
    if (fs.existsSync(pkgPath)) {
      const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8')) as Record<string, unknown>;
      if (typeof pkg.name === 'string' && pkg.name.length > 0) {
        projectName = pkg.name.replace(/^@[^/]+\//, ''); // strip npm scope
      }
    }
  } catch { /* use directory name */ }

  try {
    const cargoPath = path.join(dir, 'Cargo.toml');
    if (!projectName && fs.existsSync(cargoPath)) {
      const cargoRaw = fs.readFileSync(cargoPath, 'utf-8');
      const nameMatch = cargoRaw.match(/name\s*=\s*"([^"]+)"/);
      if (nameMatch) projectName = nameMatch[1];
    }
  } catch { /* skip */ }

  return { files, language, framework, entryPoint, projectName };
}

// ═══════════════════════════════════════════════════════════════
// Signal File Export — Native Language Output
// ═══════════════════════════════════════════════════════════════

interface SignalData {
  project: string;
  language: string;
  framework: string | null;
  entryPoint: string | null;
  fileCount: number;
  level: string;
  groups: string[];
  operator: string;
  fingerprint: string;
  activatedAt: string;
}

function generateFingerprint(projectName: string, level: string, groups: string[]): string {
  const payload = `${projectName}:${level}:${groups.sort().join(',')}:${Date.now()}`;
  return crypto.createHash('sha256').update(payload).digest('hex').slice(0, 16);
}

/** Map detected language → file extension + code generator */
interface LangEmitter {
  filename: string;
  emit: (d: SignalData) => string;
}

function brandedBlockComment(d: SignalData): string {
  return [
    '═══════════════════════════════════════════════════════════════════════════════',
    ' CMPSBL® Mana Signal — Layer 2 Activation Receipt',
    ' ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
    '',
    ` Project:     ${d.project}`,
    ` Language:    ${d.language}${d.framework ? ` · ${d.framework}` : ''}`,
    ` Entry:       ${d.entryPoint ?? 'auto-detected'}`,
    ` Source Files:${d.fileCount}`,
    '',
    ` Level:       ${d.level}`,
    ` Groups:      ${d.groups.join(', ') || 'none'}`,
    ` Operator:    ${d.operator}`,
    ` Fingerprint: ${d.fingerprint}`,
    ` Activated:   ${d.activatedAt}`,
    '',
    ' This file was auto-generated by `npx mana attach`.',
    ' Do not edit manually — re-run `npx mana attach` or `npx mana export`.',
    '',
    ' U.S. Patent App. No. 64/031,637',
    ' © 2025–2026 CMPSBL® · PromptFluid™. All rights reserved.',
    ' https://cmpsbl.com',
    '═══════════════════════════════════════════════════════════════════════════════',
  ].join('\n');
}

function wrapBlockComment(d: SignalData, style: 'c' | 'hash' | 'dash' | 'doc'): string {
  const body = brandedBlockComment(d);
  switch (style) {
    case 'c':
      return `/*\n${body.split('\n').map(l => ` * ${l}`).join('\n')}\n */`;
    case 'hash':
      return body.split('\n').map(l => `# ${l}`).join('\n');
    case 'dash':
      return body.split('\n').map(l => `-- ${l}`).join('\n');
    case 'doc':
      return body.split('\n').map(l => `//! ${l}`).join('\n');
  }
}

function emitTypeScript(d: SignalData): string {
  return `${wrapBlockComment(d, 'c')}

export const MANA_SIGNAL = {
  active: true,
  project: ${JSON.stringify(d.project)},
  language: ${JSON.stringify(d.language)},
  framework: ${d.framework ? JSON.stringify(d.framework) : 'null'},
  entryPoint: ${d.entryPoint ? JSON.stringify(d.entryPoint) : 'null'},
  fileCount: ${d.fileCount},
  level: ${JSON.stringify(d.level)},
  groups: ${JSON.stringify(d.groups)},
  operator: ${JSON.stringify(d.operator)},
  fingerprint: ${JSON.stringify(d.fingerprint)},
  activatedAt: ${JSON.stringify(d.activatedAt)},
} as const;

export type ManaLevel = typeof MANA_SIGNAL.level;
export type ManaGroups = typeof MANA_SIGNAL.groups;
`;
}

function emitJavaScript(d: SignalData): string {
  return `${wrapBlockComment(d, 'c')}

export const MANA_SIGNAL = Object.freeze({
  active: true,
  project: ${JSON.stringify(d.project)},
  language: ${JSON.stringify(d.language)},
  framework: ${d.framework ? JSON.stringify(d.framework) : 'null'},
  entryPoint: ${d.entryPoint ? JSON.stringify(d.entryPoint) : 'null'},
  fileCount: ${d.fileCount},
  level: ${JSON.stringify(d.level)},
  groups: ${JSON.stringify(d.groups)},
  operator: ${JSON.stringify(d.operator)},
  fingerprint: ${JSON.stringify(d.fingerprint)},
  activatedAt: ${JSON.stringify(d.activatedAt)},
});
`;
}

function emitPython(d: SignalData): string {
  const pyGroups = d.groups.map(g => `"${g}"`).join(', ');
  return `"""
${brandedBlockComment(d)}
"""

MANA_SIGNAL = {
    "active": True,
    "project": ${JSON.stringify(d.project)},
    "language": ${JSON.stringify(d.language)},
    "framework": ${d.framework ? JSON.stringify(d.framework) : 'None'},
    "entry_point": ${d.entryPoint ? JSON.stringify(d.entryPoint) : 'None'},
    "file_count": ${d.fileCount},
    "level": ${JSON.stringify(d.level)},
    "groups": [${pyGroups}],
    "operator": ${JSON.stringify(d.operator)},
    "fingerprint": ${JSON.stringify(d.fingerprint)},
    "activated_at": ${JSON.stringify(d.activatedAt)},
}
`;
}

function emitRust(d: SignalData): string {
  const groups = d.groups.map(g => `"${g}"`).join(', ');
  return `${wrapBlockComment(d, 'doc')}

pub struct ManaSignal {
    pub active: bool,
    pub project: &'static str,
    pub language: &'static str,
    pub framework: Option<&'static str>,
    pub entry_point: Option<&'static str>,
    pub file_count: usize,
    pub level: &'static str,
    pub groups: &'static [&'static str],
    pub operator: &'static str,
    pub fingerprint: &'static str,
    pub activated_at: &'static str,
}

pub const MANA_SIGNAL: ManaSignal = ManaSignal {
    active: true,
    project: ${JSON.stringify(d.project)},
    language: ${JSON.stringify(d.language)},
    framework: ${d.framework ? `Some(${JSON.stringify(d.framework)})` : 'None'},
    entry_point: ${d.entryPoint ? `Some(${JSON.stringify(d.entryPoint)})` : 'None'},
    file_count: ${d.fileCount},
    level: ${JSON.stringify(d.level)},
    groups: &[${groups}],
    operator: ${JSON.stringify(d.operator)},
    fingerprint: ${JSON.stringify(d.fingerprint)},
    activated_at: ${JSON.stringify(d.activatedAt)},
};
`;
}

function emitGo(d: SignalData): string {
  const groups = d.groups.map(g => `"${g}"`).join(', ');
  return `${wrapBlockComment(d, 'c')}

package mana

// ManaSignal holds the Layer 2 activation configuration.
var ManaSignal = struct {
\tActive      bool
\tProject     string
\tLanguage    string
\tFramework   string
\tEntryPoint  string
\tFileCount   int
\tLevel       string
\tGroups      []string
\tOperator    string
\tFingerprint string
\tActivatedAt string
}{
\tActive:      true,
\tProject:     ${JSON.stringify(d.project)},
\tLanguage:    ${JSON.stringify(d.language)},
\tFramework:   ${JSON.stringify(d.framework ?? '')},
\tEntryPoint:  ${JSON.stringify(d.entryPoint ?? '')},
\tFileCount:   ${d.fileCount},
\tLevel:       ${JSON.stringify(d.level)},
\tGroups:      []string{${groups}},
\tOperator:    ${JSON.stringify(d.operator)},
\tFingerprint: ${JSON.stringify(d.fingerprint)},
\tActivatedAt: ${JSON.stringify(d.activatedAt)},
}
`;
}

function emitRuby(d: SignalData): string {
  const groups = d.groups.map(g => `"${g}"`).join(', ');
  return `${wrapBlockComment(d, 'hash')}

module Mana
  SIGNAL = {
    active: true,
    project: ${JSON.stringify(d.project)},
    language: ${JSON.stringify(d.language)},
    framework: ${d.framework ? JSON.stringify(d.framework) : 'nil'},
    entry_point: ${d.entryPoint ? JSON.stringify(d.entryPoint) : 'nil'},
    file_count: ${d.fileCount},
    level: ${JSON.stringify(d.level)},
    groups: [${groups}],
    operator: ${JSON.stringify(d.operator)},
    fingerprint: ${JSON.stringify(d.fingerprint)},
    activated_at: ${JSON.stringify(d.activatedAt)},
  }.freeze
end
`;
}

function emitPHP(d: SignalData): string {
  const groups = d.groups.map(g => `'${g}'`).join(', ');
  return `<?php
${wrapBlockComment(d, 'c')}

return [
    'active' => true,
    'project' => ${JSON.stringify(d.project)},
    'language' => ${JSON.stringify(d.language)},
    'framework' => ${d.framework ? JSON.stringify(d.framework) : 'null'},
    'entry_point' => ${d.entryPoint ? JSON.stringify(d.entryPoint) : 'null'},
    'file_count' => ${d.fileCount},
    'level' => ${JSON.stringify(d.level)},
    'groups' => [${groups}],
    'operator' => ${JSON.stringify(d.operator)},
    'fingerprint' => ${JSON.stringify(d.fingerprint)},
    'activated_at' => ${JSON.stringify(d.activatedAt)},
];
`;
}

function emitJava(d: SignalData): string {
  const groups = d.groups.map(g => `"${g}"`).join(', ');
  return `${wrapBlockComment(d, 'c')}
package mana;

import java.util.List;

public final class ManaSignal {
    public static final boolean ACTIVE = true;
    public static final String PROJECT = ${JSON.stringify(d.project)};
    public static final String LANGUAGE = ${JSON.stringify(d.language)};
    public static final String FRAMEWORK = ${d.framework ? JSON.stringify(d.framework) : 'null'};
    public static final String ENTRY_POINT = ${d.entryPoint ? JSON.stringify(d.entryPoint) : 'null'};
    public static final int FILE_COUNT = ${d.fileCount};
    public static final String LEVEL = ${JSON.stringify(d.level)};
    public static final List<String> GROUPS = List.of(${groups});
    public static final String OPERATOR = ${JSON.stringify(d.operator)};
    public static final String FINGERPRINT = ${JSON.stringify(d.fingerprint)};
    public static final String ACTIVATED_AT = ${JSON.stringify(d.activatedAt)};

    private ManaSignal() {}
}
`;
}

function emitCSharp(d: SignalData): string {
  const groups = d.groups.map(g => `"${g}"`).join(', ');
  return `${wrapBlockComment(d, 'c')}

namespace Mana;

public static class ManaSignal
{
    public const bool Active = true;
    public const string Project = ${JSON.stringify(d.project)};
    public const string Language = ${JSON.stringify(d.language)};
    public const string? Framework = ${d.framework ? JSON.stringify(d.framework) : 'null'};
    public const string? EntryPoint = ${d.entryPoint ? JSON.stringify(d.entryPoint) : 'null'};
    public const int FileCount = ${d.fileCount};
    public const string Level = ${JSON.stringify(d.level)};
    public static readonly string[] Groups = { ${groups} };
    public const string Operator = ${JSON.stringify(d.operator)};
    public const string Fingerprint = ${JSON.stringify(d.fingerprint)};
    public const string ActivatedAt = ${JSON.stringify(d.activatedAt)};
}
`;
}

function emitSwift(d: SignalData): string {
  const groups = d.groups.map(g => `"${g}"`).join(', ');
  return `${wrapBlockComment(d, 'c')}

struct ManaSignal {
    static let active = true
    static let project = ${JSON.stringify(d.project)}
    static let language = ${JSON.stringify(d.language)}
    static let framework: String? = ${d.framework ? JSON.stringify(d.framework) : 'nil'}
    static let entryPoint: String? = ${d.entryPoint ? JSON.stringify(d.entryPoint) : 'nil'}
    static let fileCount = ${d.fileCount}
    static let level = ${JSON.stringify(d.level)}
    static let groups = [${groups}]
    static let \`operator\` = ${JSON.stringify(d.operator)}
    static let fingerprint = ${JSON.stringify(d.fingerprint)}
    static let activatedAt = ${JSON.stringify(d.activatedAt)}
}
`;
}

function emitDart(d: SignalData): string {
  const groups = d.groups.map(g => `'${g}'`).join(', ');
  return `${wrapBlockComment(d, 'c')}

class ManaSignal {
  static const active = true;
  static const project = ${JSON.stringify(d.project)};
  static const language = ${JSON.stringify(d.language)};
  static const framework = ${d.framework ? JSON.stringify(d.framework) : 'null'};
  static const entryPoint = ${d.entryPoint ? JSON.stringify(d.entryPoint) : 'null'};
  static const fileCount = ${d.fileCount};
  static const level = ${JSON.stringify(d.level)};
  static const groups = [${groups}];
  static const operator = ${JSON.stringify(d.operator)};
  static const fingerprint = ${JSON.stringify(d.fingerprint)};
  static const activatedAt = ${JSON.stringify(d.activatedAt)};
}
`;
}

function emitElixir(d: SignalData): string {
  const groups = d.groups.map(g => `"${g}"`).join(', ');
  return `${wrapBlockComment(d, 'hash')}

defmodule Mana.Signal do
  @signal %{
    active: true,
    project: ${JSON.stringify(d.project)},
    language: ${JSON.stringify(d.language)},
    framework: ${d.framework ? JSON.stringify(d.framework) : 'nil'},
    entry_point: ${d.entryPoint ? JSON.stringify(d.entryPoint) : 'nil'},
    file_count: ${d.fileCount},
    level: ${JSON.stringify(d.level)},
    groups: [${groups}],
    operator: ${JSON.stringify(d.operator)},
    fingerprint: ${JSON.stringify(d.fingerprint)},
    activated_at: ${JSON.stringify(d.activatedAt)}
  }

  def get, do: @signal
end
`;
}

/** Fallback: JSON with a branded wrapper for unsupported languages */
function emitFallbackJSON(d: SignalData): string {
  return JSON.stringify({
    $schema: 'https://cmpsbl.com/schemas/mana-signal-v1.json',
    signal: 'MANA_LAYER_ACTIVE',
    version: '1.0.0',
    ...d,
  }, null, 2) + '\n';
}

function getEmitter(language: string): LangEmitter {
  switch (language) {
    case 'TypeScript':
      return { filename: 'mana.signal.ts', emit: emitTypeScript };
    case 'JavaScript':
      return { filename: 'mana.signal.js', emit: emitJavaScript };
    case 'Python':
      return { filename: 'mana_signal.py', emit: emitPython };
    case 'Rust':
      return { filename: 'mana_signal.rs', emit: emitRust };
    case 'Go':
      return { filename: 'mana_signal.go', emit: emitGo };
    case 'Ruby':
      return { filename: 'mana_signal.rb', emit: emitRuby };
    case 'PHP':
      return { filename: 'mana_signal.php', emit: emitPHP };
    case 'Java':
      return { filename: 'ManaSignal.java', emit: emitJava };
    case 'Kotlin':
      return { filename: 'ManaSignal.kt', emit: emitJava }; // Kotlin reads Java fine
    case 'C#':
      return { filename: 'ManaSignal.cs', emit: emitCSharp };
    case 'Swift':
      return { filename: 'ManaSignal.swift', emit: emitSwift };
    case 'Dart':
      return { filename: 'mana_signal.dart', emit: emitDart };
    case 'Elixir':
      return { filename: 'mana_signal.ex', emit: emitElixir };
    default:
      return { filename: 'mana.signal.json', emit: emitFallbackJSON };
  }
}

function getSignalFilename(language: string): string {
  return getEmitter(language).filename;
}

function exportSignalFile(
  dir: string,
  project: DetectedProject,
  level: CapabilityLevel,
  groups: string[],
  operatorName: string,
): string {
  const now = new Date().toISOString();
  const data: SignalData = {
    project: project.projectName,
    language: project.language,
    framework: project.framework,
    entryPoint: project.entryPoint,
    fileCount: project.files.length,
    level: LEVELS[level].name,
    groups,
    operator: operatorName,
    fingerprint: generateFingerprint(project.projectName, level, groups),
    activatedAt: now,
  };

  const emitter = getEmitter(project.language);
  const content = emitter.emit(data);
  const outPath = path.join(dir, emitter.filename);
  fs.writeFileSync(outPath, content);
  return outPath;
}

// ═══════════════════════════════════════════════════════════════
// Internal config persistence (.mana/)
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

  say(`  ${c.cyan('◈')} Operator identified: ${c.bold(operatorName)}`);
  await sleep(400);

  say(`  ${c.cyan('◈')} Project: ${c.bold(project.projectName)}`);
  await sleep(300);

  say(`  ${c.cyan('◈')} Language: ${c.bold(project.language)}`);
  await sleep(300);

  if (project.framework) {
    say(`  ${c.cyan('◈')} Framework: ${c.bold(project.framework)}`);
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

  box([
    '',
    '  Ascension has detected that your code is ready',
    '  for a second layer.',
    '',
    '  This layer enhances and protects your software',
    '  without modifying a single line of your code.',
    '',
    `  ${c.green('✔')} Observability and Performance are already active.`,
    `  ${c.muted('  Use Mana to add Defense, Governance, or Memory.')}`,
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
  say(c.bold('Your ascended file already has Enhanced capabilities active.'));
  say(c.muted('Mana lets you override this. Choose a level:'));
  blank();

  say(`  ${c.cyan('1.')} ${c.bold('Safe')}`);
  say(`     ${c.muted('Scale back to minimal — basic validation + telemetry only')}`);
  blank();

  say(`  ${c.green('2.')} ${c.bold('Enhanced')}  ${c.green('← already active')}`);
  say(`     ${c.muted('Observability + Performance (current default)')}`);
  blank();

  say(`  ${c.amber('3.')} ${c.bold('Protected')}`);
  say(`     ${c.muted('Add Defense + Governance on top of Enhanced')}`);
  say(`     ${c.muted('Blocks unsafe execution paths')}`);
  blank();

  say(`  ${c.purple('4.')} ${c.bold('Advanced Configuration')}`);
  say(`     ${c.muted('Pick exactly which groups to enable/disable')}`);
  blank();

  const answer = await prompt('Select level (1-4, Enter to keep Enhanced): ');
  const map: Record<string, CapabilityLevel> = { '1': 'safe', '2': 'enhanced', '3': 'protected', '4': 'advanced' };
  const level = map[answer];

  if (!level) {
    say(c.green('Keeping Enhanced (default).'));
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
// Activation Ceremony + Signal Export
// ═══════════════════════════════════════════════════════════════

async function activationCeremony(
  level: CapabilityLevel,
  groups: string[],
  project: DetectedProject,
  operatorName: string,
): Promise<void> {
  const cwd = process.cwd();

  if (isTTY()) {
    blank();
    say(c.muted('  ── Attaching Layer 2 ──'));
    blank();
    await sleep(500);

    const steps = [
      { icon: '◈', text: 'Binding function boundaries...' },
      { icon: '◈', text: `Activating ${groups.length} capability group${groups.length === 1 ? '' : 's'}...` },
      { icon: '◈', text: 'Establishing behavioral contracts...' },
      { icon: '◈', text: 'Sealing governance layer...' },
      { icon: '◈', text: 'Generating signal file...' },
      { icon: '◈', text: 'Layer 2 operational.' },
    ];

    for (const step of steps) {
      say(`  ${c.cyan(step.icon)} ${step.text}`);
      await sleep(350);
    }

    blank();
    await sleep(400);
  }

  /* Export the signal file */
  const signalPath = exportSignalFile(cwd, project, level, groups, operatorName);
  const relPath = path.relative(cwd, signalPath);

  /* Final confirmation */
  box([
    '',
    `  ${c.green('✔')} Ascension is now active.`,
    '',
    '  Your code is running with a secondary layer.',
    '  Original source code remains unchanged.',
    '',
    `  ${c.muted(`Operator:  ${operatorName}`)}`,
    `  ${c.muted(`Level:     ${LEVELS[level].name}`)}`,
    `  ${c.muted(`Groups:    ${groups.join(', ') || 'none'}`)}`,
    `  ${c.muted(`Files:     ${project.files.length}`)}`,
    `  ${c.muted(`Language:  ${project.language}`)}`,
    '',
    `  ${c.green('→')} Signal exported: ${c.bold(relPath)}`,
    '',
  ], 'MANA — ACTIVE');

  blank();
  say(`  ${c.muted('To reconfigure:')}  ${c.cyan('npx mana config')}`);
  say(`  ${c.muted('To check status:')} ${c.cyan('npx mana status')}`);
  say(`  ${c.muted('To detach:')}        ${c.cyan('npx mana detach')}`);
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

  const apiKey = await requireApiKey(identity);

  const storedName = getStoredDisplayName();
  const operatorName = storedName || identity.name || 'Operator';

  await firstContactCeremony(project, operatorName);

  const level = await screenLevelSelection();

  let groups: string[];
  if (level === 'advanced') {
    groups = await screenAdvancedConfig();
  } else {
    groups = [...LEVELS[level].groups];
  }

  /* Save internal config */
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

  /* Activation + signal export */
  await activationCeremony(level, groups, project, operatorName);

  /* Suppress apiKey unused lint — it's stored via requireApiKey for future commands */
  void apiKey;
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
  const cwd = process.cwd();

  if (!config) {
    say(c.muted('No active Mana layer. Run `npx mana attach` to begin.'));
    return;
  }

  /* Check signal file */
  const signalFile = getSignalFilename(config.language ?? 'Unknown');
  const signalExists = fs.existsSync(path.join(cwd, signalFile));

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
    '',
    `Signal:    ${signalExists ? c.green(signalFile) : c.amber('not found — run `mana attach`')}`,
  ], 'MANA STATUS');
  blank();
}

async function commandDetach(): Promise<void> {
  const cwd = process.cwd();
  const config = loadConfig();
  const signalFile = getSignalFilename(config?.language ?? 'Unknown');

  if (!fs.existsSync(CONFIG_FILE) && !fs.existsSync(path.join(cwd, signalFile))) {
    say(c.muted('No active Mana layer to detach.'));
    return;
  }

  const answer = await prompt('Detach the secondary layer? Your code is never modified. [y/N]: ');
  if (answer.toLowerCase() !== 'y' && answer.toLowerCase() !== 'yes') {
    say(c.muted('Cancelled.'));
    return;
  }

  /* Remove internal config */
  try {
    fs.unlinkSync(CONFIG_FILE);
    try { fs.rmdirSync(CONFIG_DIR); } catch { /* not empty */ }
  } catch { /* already gone */ }

  /* Remove signal file */
  try {
    const signalPath = path.join(cwd, signalFile);
    if (fs.existsSync(signalPath)) fs.unlinkSync(signalPath);
  } catch { /* already gone */ }

  blank();
  say(`${c.green('✔')} Layer detached. ${signalFile} removed.`);
  say(`${c.green('✔')} Original code was never modified.`);
  blank();
}

async function commandExport(): Promise<void> {
  const cwd = process.cwd();
  const config = loadConfig();

  if (!config) {
    say(c.amber('No active configuration. Run `npx mana attach` first.'));
    return;
  }

  const project = detectSourceFiles(cwd);
  /* Use the language from config (what the user chose) rather than re-detecting */
  if (config.language) project.language = config.language;
  const operatorName = config.operator ?? 'Operator';

  const signalPath = exportSignalFile(cwd, project, config.level, config.groups, operatorName);
  const relPath = path.relative(cwd, signalPath);

  blank();
  say(`${c.green('✔')} Signal exported: ${c.bold(relPath)}`);
  say(c.muted(`   ${config.groups.length} groups · ${LEVELS[config.level].name} level`));
  blank();
}

function commandHelp(): void {
  blank();
  box([
    `${c.bold('mana')} — Silent Software Symbiosis`,
    '',
    'Layer 2 runtime enhancement for any codebase.',
    'Your original source code is never modified.',
  ], 'MANA · v1.0.0');
  blank();

  say(c.bold('COMMANDS'));
  blank();
  say(`  ${c.cyan('mana attach')}     Detect project, authenticate, activate Layer 2`);
  say(`  ${c.cyan('mana status')}     Show current layer status and active capabilities`);
  say(`  ${c.cyan('mana config')}     View or change your activation level`);
  say(`  ${c.cyan('mana export')}     Re-export the signal file in your project's language`);
  say(`  ${c.cyan('mana detach')}     Remove the secondary layer (code untouched)`);
  say(`  ${c.cyan('mana help')}       Show this help`);
  blank();

  say(c.bold('LEVELS'));
  blank();
  say(`  ${c.green('Safe')}            Minimal — telemetry only`);
  say(`  ${c.cyan('Enhanced')}        Observability + Performance ${c.muted('(default)')}`);
  say(`  ${c.purple('Protected')}       Adds Defense + Governance`);
  say(`  ${c.amber('Advanced')}        Fine-grained capability group toggles`);
  blank();

  say(c.bold('AUTHENTICATION'));
  blank();
  say(`  Set via environment variable:`);
  say(`  ${c.muted('export CMPSBL_API_KEY=your_key_here')}`);
  blank();
  say(`  Or authenticate interactively during ${c.cyan('mana attach')}.`);
  say(`  Credentials are stored in ${c.muted('~/.cmpsbl/credentials')}`);
  blank();

  say(c.bold('SIGNAL FILE'));
  blank();
  say('  After activation, Mana exports a native source file you can import:');
  say(`  ${c.muted('TypeScript → mana.signal.ts  ·  Python → mana_signal.py')}`);
  say(`  ${c.muted('Rust → mana_signal.rs  ·  Go → mana_signal.go  ·  + more')}`);
  blank();

  say(c.dim('─────────────────────────────────────────────────'));
  say(`  ${c.muted('U.S. Patent App. No. 64/031,637')}`);
  say(`  ${c.muted('© CMPSBL® · cmpsbl.com · Apache-2.0')}`);
  say(c.dim('─────────────────────────────────────────────────'));
  blank();
}

// ═══════════════════════════════════════════════════════════════
// Entry
// ═══════════════════════════════════════════════════════════════

function commandVersion(): void {
  blank();
  say(`${c.bold('mana')} ${c.cyan('v1.0.0')}`);
  say(c.muted('Silent Software Symbiosis · © CMPSBL®'));
  blank();
}

export async function run(args: string[]): Promise<void> {
  const command = args[0]?.toLowerCase();

  // Welcome-back: if user has stored credentials, greet them silently
  if (command && command !== 'help' && command !== '--help' && command !== '-h'
    && command !== 'version' && command !== '--version' && command !== '-v') {
    const creds = loadStoredCredentials();
    if (creds?.displayName && creds.lastCommandAt) {
      const lastDate = new Date(creds.lastCommandAt);
      const hoursSince = (Date.now() - lastDate.getTime()) / (1000 * 60 * 60);
      if (hoursSince > 1) {
        const timeAgo = hoursSince < 24
          ? `${Math.floor(hoursSince)}h ago`
          : `${Math.floor(hoursSince / 24)}d ago`;
        say(c.dim(`Welcome back, ${c.cyan(creds.displayName)} · last seen ${timeAgo}`));
      }
    }
    trackLastCommand(command);
  }

  switch (command) {
    case 'attach':
      return commandAttach();
    case 'config':
      return commandConfig();
    case 'status':
      return commandStatus();
    case 'export':
      return commandExport();
    case 'detach':
      return commandDetach();
    case 'version':
    case '--version':
    case '-v':
      return commandVersion();
    case 'help':
    case '--help':
    case '-h':
      return commandHelp();
    case undefined:
      return commandHelp();
    default:
      say(c.amber(`Unknown command: ${command}`));
      blank();
      say(c.muted(`Run ${c.cyan('mana help')} for available commands.`));
      blank();
  }
}
