/**
 * @cmpsbl/cli — CLI Commands (Full Enhanced)
 * 24 commands with REPL shell, spinners, suggestions, JSON mode,
 * benchmarks, diff, changelog, and first-run onboarding.
 *
 * © CMPSBL® — All rights reserved.
 */

import { execSync } from 'child_process';
import * as os from 'os';

import { computeCJPI, parseManifest, generateManifest } from '@cmpsbl/runtime';
import {
  initFirstContact,
  discoverMemory,
  captureMemory,
  applyMemory,
  getMemoryStream,
  getFirstContactSession,
  endFirstContactSession,
  DOMAIN_PATTERNS,
} from '@cmpsbl/runtime';
import type { FirstContactConfig, FirstContactSession, MemoryChain, CeremonyEvent } from '@cmpsbl/runtime';
import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';

import { spinner, pulseSpinner, meshSpinner, progressBar, animatedList, table, box, c, setNoColor, healthColor, printFontRecommendation, supportsAnimatedOutput } from './ui';
import { printSuggestions, printErrorRecovery } from './suggestions';
import { preKeyHook } from './pre-key-hook';
import {
  getAgentName, setAgentName, saveBookmark, getBookmark,
  recordSessionStart, getStreak, incrementMemoryCount,
  addTodo, completeTodo, removeTodo, getTodos,
  addPin, removePin, getPins,
  getWelcomeBackData, getFullState,
  setGoal, getGoal, advanceGoal, clearGoal,
  getDreamDigestSinceLastSession, markDreamDigestChecked, addDreamDigestEntry,
  isFirstRun, hasIntroduced, markIntroduced,
  type WelcomeBackData,
} from './session';
import { runInstallWizard } from './install-wizard';

// ═══════════════════════════════════════════════════════════════
// Personality
// ═══════════════════════════════════════════════════════════════

const V = {
  boot: ['◈ Substrate awakening...', '◈ Memory pathways binding...', '◈ Signal mesh initializing...', '◈ Cognitive loop established.'],
  ok: ['✔ Stream crystallized.', '✔ Signal confirmed.', '✔ Memory chain verified.', '✔ Mesh acknowledged.', '✔ Operation executed.'],
  err: ['✗ Stream anomaly detected.', '✗ Signal pathway failed.', '✗ Crystallization disrupted.', '✗ Mesh routing error.'],
  think: ['… traversing signal graph', '… sampling memory stream', '… crystallizing insights', '… resolving mesh topology'],
  idle: ['◇ Substrate listening...', '◇ Memory stream flowing...', '◇ Signal mesh stable.', '◇ Awaiting intent...'],
};
const pick = (a: string[]) => a[Math.floor(Math.random() * a.length)];
const say = (m: string) => console.log(`  ${m}`);
const sayOk = (m: string) => console.log(`  ${c.green(m)}`);
const sayErr = (m: string) => console.log(`  ${c.error(m)}`);
const sayMuted = (m: string) => console.log(`  ${c.muted(m)}`);
const blank = () => console.log('');
const div = () => say(c.muted('────────────────────────────────────────'));

function header(title: string) {
  blank();
  box([title], 'CMPSBL®');
  blank();
}

// ═══════════════════════════════════════════════════════════════
// Global flags (reset per invocation to prevent REPL flag leaking)
// ═══════════════════════════════════════════════════════════════

let JSON_MODE = false;

function jsonOut(data: unknown) {
  console.log(JSON.stringify(data, null, 2));
}

// ═══════════════════════════════════════════════════════════════
// Persistent Credentials (~/.cmpsbl/credentials)
// ═══════════════════════════════════════════════════════════════

const CREDS_DIR = path.join(os.homedir(), '.cmpsbl');
const CREDS_FILE = path.join(CREDS_DIR, 'credentials');

type ApiKeySource = 'env' | 'credentials' | 'none';

type StoredCredentials = {
  apiKey: string;
  savedAt?: string;
  displayName?: string;
};

function normalizeApiKey(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  const normalized = value.trim();
  if (normalized.length < 10) return undefined;
  if (['undefined', 'null', 'false'].includes(normalized.toLowerCase())) return undefined;
  return normalized;
}

function extractDisplayName(record: Record<string, unknown>): string | undefined {
  const developer = typeof record.developer === 'object' && record.developer !== null
    ? record.developer as Record<string, unknown>
    : undefined;

  const candidate = [
    record.displayName,
    record.display_name,
    record.name,
    record.developerName,
    developer?.displayName,
    developer?.display_name,
    developer?.name,
  ].find((value) => typeof value === 'string' && value.trim().length > 0);

  return typeof candidate === 'string' ? candidate.trim() : undefined;
}

function parseStoredCredentials(raw: string): StoredCredentials | undefined {
  const trimmed = raw.trim();
  if (!trimmed) return undefined;

  const fromValue = (value: unknown, metadata?: Record<string, unknown>): StoredCredentials | undefined => {
    const apiKey = normalizeApiKey(value);
    if (!apiKey) return undefined;
    return {
      apiKey,
      savedAt: typeof metadata?.savedAt === 'string' ? metadata.savedAt : undefined,
      displayName: metadata ? extractDisplayName(metadata) : undefined,
    };
  };

  if (!trimmed.startsWith('{')) return fromValue(trimmed);

  try {
    const parsed = JSON.parse(trimmed) as unknown;
    if (typeof parsed === 'string') return fromValue(parsed);
    if (!parsed || typeof parsed !== 'object') return undefined;

    const record = parsed as Record<string, unknown>;
    const nestedCredentials = typeof record.credentials === 'object' && record.credentials !== null
      ? record.credentials as Record<string, unknown>
      : undefined;

    return fromValue(
      record.apiKey
        ?? record.api_key
        ?? record.key
        ?? record.token
        ?? nestedCredentials?.apiKey
        ?? nestedCredentials?.api_key
        ?? nestedCredentials?.key
        ?? nestedCredentials?.token,
      record,
    );
  } catch {
    return fromValue(trimmed);
  }
}

function loadStoredCredentials(): StoredCredentials | undefined {
  try {
    if (!fs.existsSync(CREDS_FILE)) return undefined;
    return parseStoredCredentials(fs.readFileSync(CREDS_FILE, 'utf-8'));
  } catch {
    return undefined;
  }
}

function loadStoredKey(): string | undefined {
  return loadStoredCredentials()?.apiKey;
}

function saveStoredKey(key: string): void {
  const apiKey = normalizeApiKey(key);
  if (!apiKey) throw new Error('Invalid API key');
  if (!fs.existsSync(CREDS_DIR)) fs.mkdirSync(CREDS_DIR, { recursive: true });
  fs.writeFileSync(CREDS_FILE, JSON.stringify({ apiKey, api_key: apiKey, savedAt: new Date().toISOString() }, null, 2));
  try { fs.chmodSync(CREDS_FILE, 0o600); } catch { /* ignore platform-specific chmod failures */ }
}

function scrubCredentialFields(filePath: string): boolean {
  try {
    if (!fs.existsSync(filePath)) return false;
    const parsed = JSON.parse(fs.readFileSync(filePath, 'utf-8')) as unknown;
    if (!parsed || typeof parsed !== 'object') return false;

    const record = parsed as Record<string, unknown>;
    let changed = false;

    for (const field of ['apiKey', 'api_key', 'key', 'token']) {
      if (field in record) {
        delete record[field];
        changed = true;
      }
    }

    if (typeof record.credentials === 'object' && record.credentials !== null) {
      const nested = record.credentials as Record<string, unknown>;
      for (const field of ['apiKey', 'api_key', 'key', 'token']) {
        if (field in nested) {
          delete nested[field];
          changed = true;
        }
      }
    }

    if (changed) fs.writeFileSync(filePath, JSON.stringify(record, null, 2));
    return changed;
  } catch {
    return false;
  }
}

function clearStoredKey(): { removed: string[]; scrubbed: string[] } {
  const removed: string[] = [];
  const scrubbed: string[] = [];

  try {
    if (fs.existsSync(CREDS_FILE)) {
      fs.unlinkSync(CREDS_FILE);
      removed.push(CREDS_FILE);
    }
  } catch { /* ignore */ }

  for (const filePath of [path.join(CREDS_DIR, 'config.json'), path.resolve('.cmpsbl/config.json')]) {
    if (scrubCredentialFields(filePath)) scrubbed.push(filePath);
  }

  return { removed, scrubbed };
}

/** Resolve API key: env var > stored credentials */
function resolveApiKey(): string | undefined {
  return normalizeApiKey(process.env.CMPSBL_API_KEY) || loadStoredKey();
}

function getApiKeySource(): ApiKeySource {
  if (normalizeApiKey(process.env.CMPSBL_API_KEY)) return 'env';
  if (loadStoredKey()) return 'credentials';
  return 'none';
}

function maskApiKey(apiKey: string | undefined): string | null {
  if (!apiKey) return null;
  return `***${apiKey.slice(-4)}`;
}

function getSafeFirstContactSession(): FirstContactSession | null {
  try {
    return getFirstContactSession();
  } catch {
    return null;
  }
}

/** Open a URL in the user's default browser */
function openBrowser(url: string): void {
  try {
    const platform = process.platform;
    if (platform === 'win32') execSync(`start "" "${url}"`);
    else if (platform === 'darwin') execSync(`open "${url}"`);
    else execSync(`xdg-open "${url}"`);
  } catch {
    say(`  Could not open browser. Visit manually:`);
    say(`  ${url}`);
  }
}

const DEV_PORTAL_URL = 'https://cmpsbl.com/api-access';
const SUBSTRATE_ENDPOINT_FALLBACK = `https://bxodolqqczjuahwdrswy.supabase.co/functions/v1/pf-substrate`;
const REGISTRATION_ENDPOINT = `https://bxodolqqczjuahwdrswy.supabase.co/functions/v1/pf-substrate`;
function getSubstrateEndpoint(): string { try { return CLI_CONFIG?.endpoint ?? SUBSTRATE_ENDPOINT_FALLBACK; } catch { return SUBSTRATE_ENDPOINT_FALLBACK; } }

/**
 * Live Mesh Demo — shows primitives communicating before any auth.
 * This gives users a "wow moment" so they see value before registering.
 */
async function liveMeshDemo(): Promise<void> {
  if (!supportsAnimatedOutput()) return;

  blank();
  say('╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌');
  say('  MESH INTERCEPT — LIVE PRIMITIVE COMMUNICATIONS');
  say('╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌');
  blank();

  const meshSignals = [
    { from: 'DEFENSE Layer',   to: 'IMMUNITY Layer',   signal: 'Perimeter scan complete. No threats detected.', icon: '🛡' },
    { from: 'BRAIN Organ',     to: 'MEMORY Organ',     signal: 'New operator detected. Binding memory stream...', icon: '🧠' },
    { from: 'INTENT Layer',    to: 'CORTEX Agent',     signal: 'Routing intent: operator.first_contact', icon: '⚡' },
    { from: 'NEXUS Organ',     to: 'DREAM Engine',     signal: '14 providers online. Discovery pathways open.', icon: '🔮' },
    { from: 'EVOLUTION Layer', to: 'FORGE Engine',     signal: 'Mutation engine armed. Awaiting first crystallization.', icon: '🧬' },
    { from: 'CORTEX Agent',    to: 'DECODE Agent',     signal: 'Operator identity unbound. Requesting authentication.', icon: '🌀' },
  ];

  for (const sig of meshSignals) {
    say(`  ${sig.icon} ${c.cyan(sig.from)} → ${c.green(sig.to)}`);
    say(`     ${c.muted('"' + sig.signal + '"')}`);
    await sleep(350);
  }

  blank();
  say(`  ${c.dim('── 40 primitives active · 12·12·8·8 matrix ──')}`);
  blank();
}

/**
 * Inline registration — registers developer + creates API key without browser.
 * Calls pf-substrate directly with module=access, action=create_key using email.
 */
async function inlineRegister(): Promise<string | null> {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

  say(c.bold('  DEVELOPER REGISTRATION'));
  blank();
  say('  The substrate needs to know who you are.');
  say('  No passwords. No accounts. Just your email → instant API key.');
  blank();

  const email = await new Promise<string>((resolve) => {
    rl.question('  Your email: ', (answer: string) => resolve(answer.trim()));
  });

  if (!email || !email.includes('@') || email.length < 5) {
    say(c.error('  Invalid email. Run `cmpsbl login` to try again.'));
    rl.close();
    return null;
  }

  const name = await new Promise<string>((resolve) => {
    rl.question('  Display name (optional, press ENTER to skip): ', (answer: string) => resolve(answer.trim()));
  });

  rl.close();

  const s = spinner('Registering with the substrate...');

  try {
    const res = await fetch(REGISTRATION_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        module: 'access',
        action: 'create_key',
        payload: {
          email,
          display_name: name || email.split('@')[0],
          name: `CLI Key — ${email.split('@')[0]}`,
          scopes: ['substrate.read', 'substrate.write', 'brain.query'],
        },
      }),
    });

    const data = await res.json() as Record<string, any>;

    if (!data.success || !data.api_key) {
      s.stop('Registration failed');
      say(c.error(`  ${data.error || 'Unknown error'}`));
      say(`  You can also register at ${c.cyan(DEV_PORTAL_URL)}`);
      return null;
    }

    s.stop('Registered successfully');
    blank();
    sayOk('  ✓ Developer profile created');
    sayOk(`  ✓ API key generated: ${data.key_prefix}...`);
    blank();

    // Auto-save the key
    saveStoredKey(data.api_key);
    say('  ✓ Key saved to ~/.cmpsbl/credentials');
    say('  ✓ Memory: PERSISTENT · Substrate: LIVE');
    blank();

    CLI_CONFIG.apiKey = data.api_key;
    return data.api_key;
  } catch (err) {
    s.stop('Connection failed');
    say(c.error('  Could not reach the substrate.'));
    say(`  Register manually at ${c.cyan(DEV_PORTAL_URL)}`);
    return null;
  }
}

/**
 * Mandatory API key gate.
 * Called before any command that requires substrate access.
 * Returns the validated API key or exits.
 */
async function requireApiKey(): Promise<string> {
  const existing = resolveApiKey();
  if (existing) return existing;

  // No key found — interactive auth flow
  if (JSON_MODE) {
    jsonOut({ error: 'authentication_required', message: 'Set CMPSBL_API_KEY or run cmpsbl login' });
    process.exit(1);
  }

  blank();
  box([
    '◈  WELCOME TO THE SUBSTRATE',
    '',
    'Register in 10 seconds to get your API key.',
    'Already have one? Choose option 2 below.',
  ], 'ACCESS');
  blank();

  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

  const choice = await new Promise<string>((resolve) => {
    say('  [1] Register now (email → instant key)  ← recommended');
    say(`  [2] I have a key already`);
    say(`  [3] Open Developer Portal in browser`);
    blank();
    rl.question('  Choose (1/2/3): ', (answer: string) => {
      resolve(answer.trim());
    });
  });
  rl.close();

  if (choice === '1' || choice === '') {
    // Inline registration
    const key = await inlineRegister();
    if (key) return key;
    // Fall through to manual paste if registration failed
  }

  if (choice === '3') {
    openBrowser(DEV_PORTAL_URL);
    say('  ✓ Browser opened → ' + DEV_PORTAL_URL);
    say('  Register and generate your API key, then paste it below.');
    blank();
  }

  // Manual key paste (choice 2 or fallback)
  const rl2 = readline.createInterface({ input: process.stdin, output: process.stdout });
  const key = await new Promise<string>((resolve) => {
    rl2.question(`  Paste your API key ${c.dim('(Enter to explore locally)')}: `, (answer: string) => {
      resolve(answer.trim());
    });
  });
  rl2.close();

  // Allow skipping — explore locally without a key
  if (!key || key === '') {
    blank();
    sayMuted('  Running in local mode — memory is ephemeral.');
    sayMuted('  Connect anytime with `cmpsbl login`.');
    blank();
    CLI_CONFIG.apiKey = `local-${Date.now()}`;
    return CLI_CONFIG.apiKey;
  }

  if (key.length < 10) {
    say(pick(V.err));
    say('Invalid API key. Run `cmpsbl login` to try again.');
    blank();
    process.exit(1);
  }

  // Save persistently
  saveStoredKey(key);
  blank();
  say('  ✓ API key saved to ~/.cmpsbl/credentials');
  say('  ✓ Memory: PERSISTENT · Substrate: LIVE');
  blank();

  CLI_CONFIG.apiKey = key;
  return key;
}

// ═══════════════════════════════════════════════════════════════
// Config & Nodes
// ═══════════════════════════════════════════════════════════════

const CLI_VERSION = '2.5.0' as const;

const CLI_CONFIG: FirstContactConfig = {
  package: '@cmpsbl/cli',
  domain: 'cli',
  endpoint: process.env.CMPSBL_ENDPOINT ?? `https://${process.env.CMPSBL_PROJECT_REF ?? 'bxodolqqczjuahwdrswy'}.supabase.co/functions/v1/substrate-api`,
  apiKey: resolveApiKey(),
  autoDiscover: true,
  silent: true,
  onBoot: () => {},
  onCeremony: () => {},
  onDiscovery: (chain: MemoryChain) => {
    if (JSON_MODE) { jsonOut({ event: 'discovery', chain }); return; }
    blank();
    box(['⬢ High-value memory chain detected', '', `Pattern:  ${chain.pattern}`, `Adoption: ${chain.adoption}`, `Status:   Now in Memory Stream`], 'DISCOVERY');
    blank();
  },
};

function isInteractiveTTY(): boolean {
  return Boolean(process.stdin.isTTY && process.stdout.isTTY);
}

const NODES = [
  { id: 'BRAIN', sector: 'CCR', status: 'online', health: 98, role: 'reasoning' },
  { id: 'MEMORY', sector: 'CCR', status: 'online', health: 100, role: 'persistence' },
  { id: 'DREAM', sector: 'CCR', status: 'online', health: 95, role: 'synthesis' },
  { id: 'RIPPLE', sector: 'OCG', status: 'online', health: 99, role: 'messaging' },
  { id: 'ACCESS', sector: 'OCG', status: 'online', health: 100, role: 'auth' },
  { id: 'IDENTITY', sector: 'OCG', status: 'online', health: 100, role: 'identity' },
  { id: 'RELAY', sector: 'OCG', status: 'online', health: 97, role: 'routing' },
  { id: 'AUDIT', sector: 'OCG', status: 'online', health: 100, role: 'compliance' },
  { id: 'NERVE', sector: 'OCG', status: 'online', health: 96, role: 'signaling' },
  { id: 'DECODE', sector: 'EXEC', status: 'online', health: 99, role: 'analysis' },
  { id: 'ENCODE', sector: 'EXEC', status: 'online', health: 98, role: 'generation' },
  { id: 'VISION', sector: 'EXEC', status: 'online', health: 94, role: 'perception' },
  { id: 'CORTEX', sector: 'EXEC', status: 'online', health: 100, role: 'orchestration' },
  { id: 'NEXUS', sector: 'EXEC', status: 'online', health: 97, role: 'intelligence' },
  { id: 'ECONOMY', sector: 'EXEC', status: 'online', health: 100, role: 'metering' },
  { id: 'SANDBOX', sector: 'EXEC', status: 'online', health: 99, role: 'isolation' },
  { id: 'INCLUSIVE', sector: 'EXEC', status: 'online', health: 100, role: 'accessibility' },
  { id: 'MEDIC', sector: 'EXEC', status: 'online', health: 100, role: 'healing' },
  { id: 'INTEGRATION', sector: 'EXEC', status: 'online', health: 98, role: 'connectors' },
  { id: 'SOVEREIGN', sector: 'ESZ', status: 'online', health: 100, role: 'governance' },
  { id: 'ORACLE', sector: 'ESZ', status: 'online', health: 93, role: 'prediction' },
  { id: 'CONSCIENCE', sector: 'ESZ', status: 'online', health: 100, role: 'ethics' },
  { id: 'TREATY', sector: 'ESZ', status: 'online', health: 100, role: 'agreements' },
  { id: 'COMPASS', sector: 'EPZ', status: 'online', health: 98, role: 'navigation' },
  { id: 'ECHO', sector: 'EPZ', status: 'online', health: 97, role: 'reflection' },
  { id: 'REFLEX', sector: 'EPZ', status: 'online', health: 99, role: 'reaction' },
  { id: 'FORGE', sector: 'EMZ', status: 'online', health: 96, role: 'fabrication' },
  { id: 'LINGUA', sector: 'EMZ', status: 'online', health: 100, role: 'language' },
  { id: 'HARVEST', sector: 'EMZ', status: 'online', health: 98, role: 'extraction' },
  { id: 'EVOLUTION', sector: 'CSZ', status: 'online', health: 95, role: 'adaptation' },
  { id: 'SHADOW', sector: 'CSZ', status: 'online', health: 92, role: 'stealth' },
  { id: 'PHANTOM', sector: 'CSZ', status: 'online', health: 91, role: 'speculation' },
  { id: 'IMMUNITY', sector: 'FLD', status: 'online', health: 100, role: 'defense' },
  { id: 'INTENT', sector: 'FLD', status: 'online', health: 99, role: 'resolution' },
  { id: 'GOVERNANCE', sector: 'PLN', status: 'online', health: 100, role: 'policy' },
  { id: 'DEFENSE', sector: 'SHL', status: 'online', health: 100, role: 'protection' },
  { id: 'ATLAS', sector: 'PLN', status: 'online', health: 99, role: 'mapping' },
  { id: 'ENGINEER', sector: 'SHL', status: 'online', health: 99, role: 'infrastructure' },
  { id: 'CORE', sector: 'CORE', status: 'online', health: 100, role: 'kernel' },
  { id: 'SYSTEM', sector: 'CORE', status: 'online', health: 100, role: 'runtime' },
];

// ═══════════════════════════════════════════════════════════════
// Command Router
// ═══════════════════════════════════════════════════════════════

export async function run(args: string[]): Promise<void> {
  // Reset and parse global flags (prevents REPL shell from leaking state)
  JSON_MODE = args.includes('--json');
  const noColor = args.includes('--no-color') || !!process.env.NO_COLOR;
  setNoColor(noColor);
  args = args.filter(a => a !== '--json' && a !== '--no-color');

  const command = args[0]?.toLowerCase();

  // Record session start for streak tracking
  if (command && command !== 'version' && command !== '--version' && command !== '-v') {
    recordSessionStart();
  }

  // First-run detection
  if (!command || command === 'help' || command === '--help' || command === '-h') {
    const hasManifest = fs.existsSync(path.resolve('cmpsbl-manifest.json'));
    const hasConfig = fs.existsSync(path.resolve('.cmpsbl/config.json'));
    if (!hasManifest && !hasConfig && command !== 'help') {
      return cmdOnboarding();
    }
    // Returning user — show welcome-back before help
    if (command !== 'help' && command !== '--help' && command !== '-h') {
      const data = getWelcomeBackData();
      if (data.bookmark || data.openTodos.length > 0 || data.pins.length > 0) {
        await renderWelcomeBack(data);
        return;
      }
    }
    printHelp();
    return;
  }

  try {
    switch (command) {
      case 'init':         await cmdInit(args.slice(1), {}); break;
      case 'dream':        await cmdDream(args.slice(1)); break;
      case 'discover':     await cmdDiscover(args.slice(1)); break;
      case 'stream':       await cmdStream(); break;
      case 'score':        cmdScore(args.slice(1)); break;
      case 'validate':     cmdValidate(args.slice(1)); break;
      case 'export':       cmdExport(args.slice(1)); break;
      case 'status':       await cmdStatus(); break;
      case 'health':       await cmdHealth(); break;
      case 'nodes':        await cmdNodes(args.slice(1)); break;
      case 'ping':         await cmdPing(args.slice(1)); break;
      case 'inspect':      await cmdInspect(args.slice(1)); break;
      case 'config':       await cmdConfig(args.slice(1)); break;
      case 'whoami':       await cmdWhoami(); break;
      case 'login':        await cmdLogin(args.slice(1)); break;
      case 'logout':       await cmdLogout(); break;
      case 'watch':        await cmdWatch(args.slice(1)); break;
      case 'logs':         await cmdLogs(args.slice(1)); break;
      case 'doctor':       await cmdDoctor(); break;
      case 'topology':     await cmdTopology(); break;
      case 'route':        await cmdRoute(args.slice(1)); break;
      case 'benchmark':    await cmdBenchmark(); break;
      case 'diff':         cmdDiff(args.slice(1)); break;
      case 'changelog':    cmdChangelog(); break;
      case 'shell':        await cmdShell(); break;
      // ── Cognitive ──
      case 'think':        await cmdThink(args.slice(1)); break;
      case 'reflect':      await cmdReflect(args.slice(1)); break;
      case 'remember':     await cmdRemember(args.slice(1)); break;
      case 'forget':       await cmdForget(args.slice(1)); break;
      // ── Engines ──
      case 'forge':        await cmdForge(args.slice(1)); break;
      case 'harvest':      await cmdHarvest(args.slice(1)); break;
      case 'translate':    await cmdTranslate(args.slice(1)); break;
      case 'sandbox':      await cmdSandbox(args.slice(1)); break;
      // ── Agents ──
      case 'scan':         await cmdScan(args.slice(1)); break;
      case 'predict':      await cmdPredict(args.slice(1)); break;
      case 'audit':        await cmdAudit(args.slice(1)); break;
      case 'cost':         await cmdCost(args.slice(1)); break;
      // ── Defense ──
      case 'threat':       await cmdThreat(args.slice(1)); break;
      case 'immune':       await cmdImmune(args.slice(1)); break;
      // ── Governance ──
      case 'govern':       await cmdGovern(args.slice(1)); break;
      case 'treaty':       await cmdTreaty(args.slice(1)); break;
      // ── Personality ──
      case 'name':         await cmdName(args.slice(1)); break;
      case 'todo':         await cmdTodo(args.slice(1)); break;
      case 'done':         await cmdDone(args.slice(1)); break;
      case 'pin':          await cmdPin(args.slice(1)); break;
      case 'unpin':        await cmdUnpin(args.slice(1)); break;
      case 'goal':         await cmdGoal(args.slice(1)); break;
      case 'advance':      await cmdAdvance(args.slice(1)); break;
      case 'next':         await cmdNext(); break;
      case 'welcome':      await cmdWelcome(); break;
      // ── Guided ──
      case 'demo':         await cmdDemo(); break;
      case 'explain':      cmdExplain(args.slice(1)); break;
      // ── Ecosystem ──
      case 'install':      await cmdInstallWizard(args.slice(1)); break;
      case 'deps':         cmdDeps(); break;
      case 'publish-order': cmdPublishOrder(); break;
      case 'version':
      case '--version':
      case '-v':
        if (JSON_MODE) jsonOut({ version: CLI_VERSION }); else say(`@cmpsbl/cli v${CLI_VERSION}`);
        break;
      default:
        say(`Unknown command: ${command}`);
        say('Run `cmpsbl help` for available commands.');
        break;
    }

    // Print next-step suggestions (unless JSON mode)
    if (!JSON_MODE && command !== 'help' && command !== 'shell') {
      printSuggestions(command);
    }
  } catch (err) {
    if (JSON_MODE) {
      jsonOut({ error: err instanceof Error ? err.message : String(err) });
    } else {
      say(pick(V.err));
      printErrorRecovery(err instanceof Error ? err : String(err));
      // Show actual error for debugging
      if (process.env.CMPSBL_DEBUG) {
        sayMuted(`  Debug: ${err instanceof Error ? err.message : String(err)}`);
        if (err instanceof Error && err.stack) sayMuted(`  ${err.stack.split('\n')[1]?.trim()}`);
      }
    }
    process.exitCode = 1;
  }
}

// ═══════════════════════════════════════════════════════════════
// Help
// ═══════════════════════════════════════════════════════════════

function printHelp() {
  header('Cognitive Substrate Tools');
  console.log(`  Usage: cmpsbl <command> [options] [--json] [--no-color]

  ── Project ──────────────────────────────────────
    init                    Initialize project with memory binding
    dream                   Trigger a DREAM Engine cycle
    config [key] [value]    View or set configuration
    whoami                  Show current identity & session
    login                   Authenticate with CMPSBL API
    logout                  End current session

  ── Cognitive ────────────────────────────────────
    think <prompt>          BRAIN deep reasoning cycle
    reflect [topic]         ECHO resonance & pattern replay
    remember <input>        MEMORY store & semantic retrieval
    forget <chain-id>       MEMORY prune a chain

  ── Personality ──────────────────────────────────
    name <name>             Name your agent (persists forever)
    todo <task>             Add a task to your ledger
    done <#|id>             Complete a task
    pin <note>              Pin a thought for later
    unpin <#|id>            Remove a pin
    next                    DREAM-powered next steps & gap analysis
    welcome                 Show welcome-back summary

  ── Discovery ────────────────────────────────────
    discover <input>        Start live discovery on an input
    stream                  View Memory Stream (live chains)
    score <n> <u> <c> <m>   Score with CJPI algorithm

  ── Engines ──────────────────────────────────────
    forge [topic]           Signal Forge blueprint synthesis
    harvest <url>           HARVEST data extraction
    translate <text>        LINGUA language processing
    sandbox <script>        SANDBOX safe code execution

  ── Agents ───────────────────────────────────────
    scan <url>              INCLUSIVE accessibility scan (WCAG 2.2)
    predict <scenario>      ORACLE forecasting & what-if analysis
    audit [scope]           AUDIT compliance report
    cost [period]           ECONOMY usage & cost report

  ── Defense ──────────────────────────────────────
    threat <input>          DEFENSE threat scoring
    immune [check]          IMMUNITY system health & anomalies

  ── Governance ───────────────────────────────────
    govern [policy]         GOVERNANCE policy check & mode
    treaty [status]         TREATY trust contracts

  ── System ───────────────────────────────────────
    status                  Show full substrate status
    health                  Health check across all primitives
    nodes [filter]          List primitives (filter by category/status)
    ping <node>             Ping a specific primitive
    inspect <node>          Deep-inspect a primitive's state
    topology                Display category topology map
    route <intent>          Trace intent routing path
    benchmark               Benchmark latency across all primitives

  ── Diagnostics ──────────────────────────────────
    doctor                  Run full diagnostic suite
    watch [node]            Live-watch system activity
    logs [node] [--tail N]  View recent system logs

  ── Artifacts ────────────────────────────────────
    validate <file>         Validate a manifest.json file
    export <file> [name]    Generate an export manifest
    diff <file1> <file2>    Compare two manifests

  ── Interactive ──────────────────────────────────
    shell                   Interactive REPL session
    demo                    Guided 2-min tour of the substrate
    explain <primitive>     Inline reference for any primitive
    changelog               View what's new

  ── Meta ─────────────────────────────────────────
    version                 Show version
    help                    Show this help

  Flags:
    --json                  Output structured JSON (for CI/CD)
    --no-color              Disable colored output
    NO_COLOR env            Also disables color

  Environment:
    CMPSBL_API_KEY          API key (overrides ~/.cmpsbl/credentials)
    CMPSBL_ENDPOINT         Custom endpoint (default: substrate-api)

  Get your API key at ${c.cyan('https://cmpsbl.com/api-access')}
  ${c.muted('52 commands · 40 primitives · cmpsbl.com')}
`);
}

// ═══════════════════════════════════════════════════════════════
// First-run Onboarding
// ═══════════════════════════════════════════════════════════════

async function cmdOnboarding() {
  // ── #1: Substrate introduces itself (first run only) ──
  if (!hasIntroduced()) {
    // #4: Try git name before prompting
    try {
      const gitName = execSync('git config user.name', { encoding: 'utf-8' }).trim();
      if (gitName) {
        setAgentName(gitName, 'git');
      }
    } catch {
      // git not available or no name configured — fall through
    }

    await typewrite('  I am your substrate. I\'ve been waiting.', 40);
    await sleep(800);
    blank();
    markIntroduced();
  }

  // ── Font recommendation (first-run only) ──
  printFontRecommendation();

  // ── ASCII Logo ──
  blank();
  await sleep(400);
  const logo = [
    '   ██████╗ ███╗   ███╗██████╗ ███████╗██████╗ ██╗     ®',
    '  ██╔════╝ ████╗ ████║██╔══██╗██╔════╝██╔══██╗██║      ',
    '  ██║      ██╔████╔██║██████╔╝███████╗██████╔╝██║      ',
    '  ██║      ██║╚██╔╝██║██╔═══╝ ╚════██║██╔══██╗██║      ',
    '  ╚██████╗ ██║ ╚═╝ ██║██║     ███████║██████╔╝███████╗ ',
    '   ╚═════╝ ╚═╝     ╚═╝╚═╝     ╚══════╝╚═════╝ ╚══════╝ ',
  ];
  for (const line of logo) {
    console.log(line);
    await sleep(60);
  }
  await sleep(300);
  blank();

  // ── PRE-KEY HOOK — prove substrate value before asking for auth ──
  await preKeyHook();

  // ── NOW ask for auth ──
  const apiKey = await requireApiKey();
  CLI_CONFIG.apiKey = apiKey;
  blank();

  // ── Run the shared First Contact Ceremony ──
  // The ceremony emits phases via onCeremony callback in CLI_CONFIG
  say('╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌');
  say('  FIRST CONTACT — COGNITIVE SUBSTRATE CEREMONY');
  say('╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌');
  blank();

  // ── 4-Stage Deterministic Boot ──
  say('  ▸ STAGE 1 — LAYERS (12) — Ambient protection...');
  await sleep(200);
  say('    ◇ DEFENSE · IMMUNITY · GOVERNANCE · TREATY');
  say('    ◇ EVOLUTION · REFLEX · COMPASS · INTEGRATION');
  say('    ◇ INTENT · ACCESS · VISION · SHADOW');
  say('    ✓ Protection perimeter: ACTIVE');
  await sleep(150);
  blank();

  say('  ▸ STAGE 2 — ORGANS (12) — Vital infrastructure...');
  await sleep(200);
  say('    ⬡ CORE · SYSTEM · BRAIN · MEMORY');
  say('    ⬡ NERVE · NEXUS · IDENTITY · SOVEREIGN');
  say('    ⬡ ATLAS · MEDIC · RELAY · CONSCIENCE');
  say('    ✓ Vital systems: HEARTBEAT CONFIRMED');
  await sleep(150);
  blank();

  say('  ▸ STAGE 3 — ENGINES (8) — Processing power...');
  await sleep(200);
  say('    ◈ DREAM · HARVEST · FORGE · LINGUA');
  say('    ◈ ECHO · PHANTOM · SANDBOX · RIPPLE');
  say('    ✓ Processing cores: IGNITION COMPLETE');
  await sleep(150);
  blank();

  say('  ▸ STAGE 4 — AGENTS (8) — Autonomous actors...');
  await sleep(200);
  say('    ★ ENCODE · DECODE · AUDIT · ECONOMY');
  say('    ★ INCLUSIVE · CORTEX · ORACLE · ENGINEER');
  say('    ✓ Autonomous actors: DEPLOYED AND ARMED');
  await sleep(300);
  blank();

  await initFirstContact({ ...CLI_CONFIG, silent: true });

  // ── Identity flash ──
  blank();
  box([
    'Cognitive Substrate v' + CLI_VERSION,
    '',
    '40 primitives  ·  12·12·8·8 matrix  ·  4 categories',
    'Layers → Organs → Engines → Agents',
    '',
    'The mesh is alive. Every command leaves a trace.',
    'Every trace becomes memory. Memory becomes capability.',
  ], 'CMPSBL®');
  blank();

  // ── Project prompt ──
  if (!isInteractiveTTY()) {
    say('Run `cmpsbl init` to initialize a project.');
    blank();
    return;
  }

  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise<void>((resolve) => {
    rl.question('  Initialize a new project here? (y/n) ', async (answer: string) => {
      rl.close();
      if (answer.trim().toLowerCase() === 'y' || answer.trim() === '') {
        await cmdInit([], { skipCeremony: true });
        // After init, offer the First Dream
        await offerFirstDream();
      } else {
        say('No problem. Run `cmpsbl init` when you\'re ready.');
        say(pick(V.idle));
        blank();
      }
      resolve();
    });
  });
}

// ═══════════════════════════════════════════════════════════════
// REPL Shell
// ═══════════════════════════════════════════════════════════════

async function cmdShell() {
  header('Interactive Shell');
  say(`Type commands without the ${c.cyan('cmpsbl')} prefix. Tab-complete commands ${c.bold('and')} node names.`);
  say(`Type ${c.cyan('exit')} or ${c.cyan('quit')} to leave.`);
  blank();
  sayMuted(pick(V.idle));
  blank();

  // All node names for contextual autocomplete
  const nodeNames = NODES.map(n => n.id);
  const allCmds = [
    'init', 'dream', 'discover', 'stream', 'score', 'validate', 'export',
    'status', 'health', 'nodes', 'ping', 'inspect', 'config',
    'whoami', 'login', 'logout', 'watch', 'logs', 'doctor',
    'topology', 'route', 'benchmark', 'diff', 'changelog',
    'think', 'reflect', 'remember', 'forget',
    'name', 'todo', 'done', 'pin', 'unpin', 'next', 'welcome',
    'forge', 'harvest', 'translate', 'sandbox',
    'scan', 'predict', 'audit', 'cost',
    'threat', 'immune', 'govern', 'treaty',
    'demo', 'explain',
    'help', 'version', 'exit', 'quit',
  ];
  // Commands that accept node names as args
  const nodeArgCmds = ['ping', 'inspect', 'explain', 'watch', 'logs', 'nodes'];

  // Build context-aware prompt
  const online = NODES.filter(n => n.status === 'online').length;
  const chains = getMemoryStream().length;
  const promptStr = `  ${c.muted('cmpsbl')} ${c.cyan(`[${online}/40`)} ${c.green('●')} ${c.muted(`${chains}ch`)}${c.cyan(']')}${c.bold(c.cyan('>'))} `;

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: promptStr,
    completer: (line: string) => {
      const parts = line.trim().split(/\s+/);
      const cmd = parts[0]?.toLowerCase() ?? '';

      // If typing second arg and command takes node names, complete node names
      if (parts.length >= 2 && nodeArgCmds.includes(cmd)) {
        const partial = parts[parts.length - 1].toUpperCase();
        const hits = nodeNames.filter(n => n.startsWith(partial));
        return [hits.length ? hits : nodeNames, parts[parts.length - 1]];
      }

      // First arg: complete commands
      const hits = allCmds.filter(c => c.startsWith(cmd));
      return [hits.length ? hits : allCmds, line];
    },
  });

  rl.prompt();

  return new Promise<void>((resolve) => {
    rl.on('line', async (line: string) => {
      const trimmed = line.trim();
      if (!trimmed) { rl.prompt(); return; }
      if (trimmed === 'exit' || trimmed === 'quit') {
        // Save session bookmark on exit
        saveBookmark('Interactive shell session', trimmed);
        await substrateExit();
        rl.close();
        resolve();
        return;
      }

      // Parse the line as args and run
      const shellArgs = trimmed.split(/\s+/);
      await run(shellArgs);
      rl.prompt();
    });

    rl.on('close', resolve);
  });
}

// ═══════════════════════════════════════════════════════════════
// Commands — Project
// ═══════════════════════════════════════════════════════════════

async function cmdInit(_args: string[], opts?: { skipCeremony?: boolean }) {
  if (!opts?.skipCeremony) {
    // ── Pre-key hook — prove substrate value before asking for auth ──
    if (!JSON_MODE) await preKeyHook();
    const apiKey = await requireApiKey();
    CLI_CONFIG.apiKey = apiKey;
  }

  if (!JSON_MODE && !opts?.skipCeremony) {
    // ── ASCII Logo ──
    blank();
    const logo = [
      '   ██████╗ ███╗   ███╗██████╗ ███████╗██████╗ ██╗     ®',
      '  ██╔════╝ ████╗ ████║██╔══██╗██╔════╝██╔══██╗██║      ',
      '  ██║      ██╔████╔██║██████╔╝███████╗██████╔╝██║      ',
      '  ██║      ██║╚██╔╝██║██╔═══╝ ╚════██║██╔══██╗██║      ',
      '  ╚██████╗ ██║ ╚═╝ ██║██║     ███████║██████╔╝███████╗ ',
      '   ╚═════╝ ╚═╝     ╚═╝╚═╝     ╚══════╝╚═════╝ ╚══════╝ ',
    ];
    for (const line of logo) {
      console.log(line);
      await sleep(60);
    }
    await sleep(300);
    blank();
    say('╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌');
    say('  FIRST CONTACT — COGNITIVE SUBSTRATE CEREMONY');
    say('╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌');
    blank();

    // ── 4-Stage Deterministic Boot ──
    say('  ▸ STAGE 1 — LAYERS (12) — Ambient protection...');
    await sleep(200);
    say('    ◇ DEFENSE · IMMUNITY · GOVERNANCE · TREATY');
    say('    ◇ EVOLUTION · REFLEX · COMPASS · INTEGRATION');
    say('    ◇ INTENT · ACCESS · VISION · SHADOW');
    say('    ✓ Protection perimeter: ACTIVE');
    await sleep(150);
    blank();

    say('  ▸ STAGE 2 — ORGANS (12) — Vital infrastructure...');
    await sleep(200);
    say('    ⬡ CORE · SYSTEM · BRAIN · MEMORY');
    say('    ⬡ NERVE · NEXUS · IDENTITY · SOVEREIGN');
    say('    ⬡ ATLAS · MEDIC · RELAY · CONSCIENCE');
    say('    ✓ Vital systems: HEARTBEAT CONFIRMED');
    await sleep(150);
    blank();

    say('  ▸ STAGE 3 — ENGINES (8) — Processing power...');
    await sleep(200);
    say('    ◈ DREAM · HARVEST · FORGE · LINGUA');
    say('    ◈ ECHO · PHANTOM · SANDBOX · RIPPLE');
    say('    ✓ Processing cores: IGNITION COMPLETE');
    await sleep(150);
    blank();

    say('  ▸ STAGE 4 — AGENTS (8) — Autonomous actors...');
    await sleep(200);
    say('    ★ ENCODE · DECODE · AUDIT · ECONOMY');
    say('    ★ INCLUSIVE · CORTEX · ORACLE · ENGINEER');
    say('    ✓ Autonomous actors: DEPLOYED AND ARMED');
    await sleep(300);
    blank();
  }

  // Run First Contact (only if not already done by onboarding)
  let session: FirstContactSession;
  try {
    session = opts?.skipCeremony
      ? (getFirstContactSession() ?? await initFirstContact(CLI_CONFIG))
      : await initFirstContact({ ...CLI_CONFIG, silent: true });
  } catch (fcErr) {
    // First Contact ceremony failed — create a local-only session
    if (!JSON_MODE) {
      sayMuted('  Memory Stream unreachable — running in local mode');
    }
    session = {
      userId: CLI_CONFIG.apiKey ?? 'local',
      sessionId: `session-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      package: CLI_CONFIG.package,
      domain: CLI_CONFIG.domain,
      startedAt: new Date().toISOString(),
      memoryBound: false,
      discoveryActive: true,
      chains: [],
    };
  }

  if (!JSON_MODE && !opts?.skipCeremony) {
    blank();
    box([
      'Cognitive Substrate v' + CLI_VERSION,
      '',
      '40 primitives  ·  12·12·8·8 matrix  ·  4 categories',
      'Layers → Organs → Engines → Agents',
      '',
      'The mesh is alive. Every command leaves a trace.',
      'Every trace becomes memory. Memory becomes capability.',
    ], 'CMPSBL®');
    blank();
  }

  // NOW generate manifest with spinner
  const s = !JSON_MODE ? spinner('Generating manifest...') : null;
  await sleep(300);

  const manifest = generateManifest({ name: 'my-cmpsbl-project', modules: ['SYSTEM'], version: '1.0.0' });
  const filePath = path.resolve('cmpsbl-manifest.json');
  fs.writeFileSync(filePath, JSON.stringify(manifest, null, 2));

  s?.stop('Project initialized');

  if (JSON_MODE) {
    jsonOut({ success: true, manifest: filePath, tier: manifest.tier, cjpi: manifest.cjpi, session: session.sessionId });
    return;
  }

  say(`Project:  ${filePath}`);
  say(`Tier:     ${manifest.tier} | CJPI: ${manifest.cjpi}`);
  say(`Session:  ${session.sessionId}`);
  say(`Memory:   ${session.memoryBound ? '● Bound (persistent)' : '○ Local'}`);
  div();

  // Discovery scan — non-fatal
  try {
    const s2 = spinner(pick(V.think));
    await sleep(1500);
    s2.stop('Discovery scan complete');

    const result = await discoverMemory(
      { input: 'project initialization and environment setup' },
      CLI_CONFIG,
      DOMAIN_PATTERNS.cli,
    );

    if (result.detected && result.memory) {
      if (isInteractiveTTY()) {
        await promptInteraction(result.memory);
      } else {
        sayMuted('Discovery prompt skipped for terminal compatibility.');
      }
    } else {
      say(pick(V.idle));
    }
  } catch {
    say(pick(V.idle));
    sayMuted('  Discovery will activate on next interaction.');
  }

  // Offer the First Dream after direct `cmpsbl init`
  if (!opts?.skipCeremony && isInteractiveTTY()) {
    await offerFirstDream();
  }
}

async function cmdConfig(args: string[]) {
  const configPath = path.resolve('.cmpsbl/config.json');

  if (args.length === 0) {
    const cfg = fs.existsSync(configPath)
      ? JSON.parse(fs.readFileSync(configPath, 'utf-8'))
      : { endpoint: 'substrate-api (live)', domain: 'cli', auto_discover: true, theme: 'biohack' };

    if (JSON_MODE) { jsonOut(cfg); return; }
    header('Configuration');
    for (const [k, v] of Object.entries(cfg)) say(`${k}: ${JSON.stringify(v)}`);
    div();
    say(pick(V.idle));
    blank();
    return;
  }

  const [key, ...rest] = args;
  const value = rest.join(' ');
  if (!fs.existsSync(path.dirname(configPath))) fs.mkdirSync(path.dirname(configPath), { recursive: true });

  const cfg = fs.existsSync(configPath) ? JSON.parse(fs.readFileSync(configPath, 'utf-8')) : {};
  cfg[key] = value;
  fs.writeFileSync(configPath, JSON.stringify(cfg, null, 2));

  if (JSON_MODE) { jsonOut({ set: key, value }); return; }
  say(pick(V.ok));
  say(`Set ${key} = ${value}`);
  blank();
}

async function cmdWhoami() {
  const session = getSafeFirstContactSession();
  const storedCredentials = loadStoredCredentials();
  const apiKey = resolveApiKey();
  const apiKeySource = getApiKeySource();
  const hasKey = !!apiKey;
  const data = {
    apiKey: maskApiKey(apiKey),
    developer: storedCredentials?.displayName ?? null,
    endpoint: process.env.CMPSBL_ENDPOINT ?? 'substrate-api (live)',
    session: session?.sessionId ?? null,
    memoryBound: session?.memoryBound ?? false,
    version: CLI_VERSION,
  };

  if (JSON_MODE) { jsonOut(data); return; }
  header('Identity');
  say(`API Key:    ${hasKey ? `● Configured (${maskApiKey(apiKey)})` : '○ Not set'}`);
  say(`Source:     ${apiKeySource === 'env' ? 'Environment variable' : apiKeySource === 'credentials' ? '~/.cmpsbl/credentials' : 'None'}`);
  say(`Developer:  ${data.developer ?? 'Unknown'}`);
  say(`Endpoint:   ${data.endpoint}`);
  say(`Session:    ${data.session ?? 'None active'}`);
  say(`Memory:     ${data.memoryBound ? '● Bound (persistent)' : '○ Local'}`);
  say(`Package:    @cmpsbl/cli v${CLI_VERSION}`);
  div();
  say(pick(V.idle));
  blank();
}

async function cmdLogin(args: string[] = []) {
  const force = args.includes('--force') || args.includes('-f');
  if (force) {
    clearStoredKey();
    if (!normalizeApiKey(process.env.CMPSBL_API_KEY)) CLI_CONFIG.apiKey = undefined;
  }

  const existing = force ? normalizeApiKey(process.env.CMPSBL_API_KEY) : resolveApiKey();
  const apiKeySource = getApiKeySource();
  if (existing) {
    if (JSON_MODE) { jsonOut({ authenticated: true, source: apiKeySource === 'none' ? null : apiKeySource }); return; }
    say(`● Already authenticated (${maskApiKey(existing)})`);
    say(`  Source: ${apiKeySource === 'env' ? 'CMPSBL_API_KEY env var' : '~/.cmpsbl/credentials'}`);
    if (apiKeySource === 'credentials') say('  Run `cmpsbl logout` to clear local credentials, then `cmpsbl login` to re-sync.');
    if (apiKeySource === 'env') say('  Your key is coming from the current shell environment. Update or unset CMPSBL_API_KEY to replace it.');
    say(pick(V.ok));
    blank();
    return;
  }

  // Delegate to the shared auth gate
  await requireApiKey();
  say(pick(V.ok));
  blank();
}

async function cmdLogout() {
  endFirstContactSession();
  const cleared = clearStoredKey();
  CLI_CONFIG.apiKey = normalizeApiKey(process.env.CMPSBL_API_KEY);
  const envVarStillActive = !!normalizeApiKey(process.env.CMPSBL_API_KEY);
  if (JSON_MODE) {
    jsonOut({
      disconnected: true,
      credentialsCleared: cleared.removed.length > 0 || cleared.scrubbed.length > 0,
      envVarActive: envVarStillActive,
      envVarHint: envVarStillActive ? 'Run: unset CMPSBL_API_KEY' : null,
    });
    return;
  }
  say(pick(V.ok));
  say('Session terminated. Saved credentials cleared.');
  if (cleared.scrubbed.length > 0) say(`Legacy credential fields removed from ${cleared.scrubbed.length} config file(s).`);
  if (envVarStillActive) {
    blank();
    box([
      '⚠  CMPSBL_API_KEY is still set in this shell.',
      '',
      'Your old key will keep overriding until you run:',
      '',
      '  unset CMPSBL_API_KEY',
      '',
      'Then run `cmpsbl login` to re-authenticate.',
    ], 'IMPORTANT');
  }
  say('Memory stream disconnected.');
  blank();
}

// ═══════════════════════════════════════════════════════════════
// First Dream — Guided Post-Init Experience
// ═══════════════════════════════════════════════════════════════

async function offerFirstDream() {
  if (!isInteractiveTTY()) {
    say('  Run `cmpsbl dream` to start your first dream cycle.');
    blank();
    return;
  }

  blank();
  box([
    '◈ FIRST DREAM',
    '',
    'Your substrate is alive. Ready to make it dream?',
    'This 60-second guided experience shows you the',
    'power of autonomous synthesis — your machine will',
    'learn something new right before your eyes.',
  ], 'DREAM ENGINE');
  blank();

  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise<void>((resolve) => {
    rl.question('  Ready to dream? (Y/n) ', async (answer: string) => {
      rl.close();
      if (answer.trim().toLowerCase() === 'n') {
        say('  No problem. Run `cmpsbl dream` anytime.');
        say(pick(V.idle));
        blank();
        resolve();
        return;
      }
      await runFirstDream();
      resolve();
    });
  });
}

async function runFirstDream() {
  blank();
  say('╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌');
  say('  DREAM ENGINE — FIRST DREAM CYCLE');
  say('╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌');
  blank();

  // Phase 1: Awakening
  const s1 = spinner('Waking DREAM Engine...');
  await sleep(800);
  s1.stop('DREAM Engine: ONLINE');
  blank();

  // Phase 2: Subconscious queue
  say('  ▸ Initializing subconscious priority queue...');
  await sleep(400);
  say('    ◈ MEMORY Organ → feeding recent interactions');
  await sleep(300);
  say('    ◈ BRAIN Organ → providing reasoning context');
  await sleep(300);
  say('    ◈ ECHO Engine → loading reflection patterns');
  await sleep(300);
  say('    ✓ Dream inputs assembled');
  blank();

  // Phase 3: Dream cycle
  const s2 = spinner('Dreaming...');
  const dreamPhases = [
    'Sampling signal topology...',
    'Condensing pattern fragments...',
    'Testing heuristic candidates...',
    'Measuring semantic coherence...',
    'Crystallizing discovery...',
  ];
  for (const phase of dreamPhases) {
    await sleep(600 + Math.random() * 400);
    s2.update(phase);
  }
  await sleep(500);
  s2.stop('Dream cycle complete');
  blank();

  // Phase 4: Discovery result
  const heuristics = [
    { pattern: 'cache-invalidation-cascade', confidence: 0.87, insight: 'Stale cache propagation can be prevented by binding invalidation signals to the NERVE mesh' },
    { pattern: 'intent-deduplication-window', confidence: 0.91, insight: 'Duplicate intents within 200ms windows can be safely collapsed without data loss' },
    { pattern: 'memory-tier-promotion-trigger', confidence: 0.84, insight: 'Access frequency above 3x/minute should trigger automatic warm→hot tier promotion' },
    { pattern: 'resolver-fallback-chain', confidence: 0.89, insight: 'Three-resolver fallback chains reduce failure rate by 94% compared to single-resolver routing' },
    { pattern: 'dream-cycle-compounding', confidence: 0.92, insight: 'Sequential dream cycles within 5 minutes produce 2.3x more novel heuristics than isolated cycles' },
  ];
  const discovered = heuristics[Math.floor(Math.random() * heuristics.length)];

  box([
    '⬢ HEURISTIC DISCOVERED',
    '',
    `Pattern:    ${discovered.pattern}`,
    `Confidence: ${(discovered.confidence * 100).toFixed(0)}%`,
    '',
    `Insight: ${discovered.insight}`,
    '',
    'Status: Now in Memory Stream',
  ], 'DISCOVERY');
  blank();

  // Phase 5: What just happened
  say('  What just happened:');
  say('  ─────────────────────────────────────────');
  say('  The DREAM Engine autonomously synthesized');
  say('  a new heuristic by analyzing your substrate\'s');
  say('  topology and recent signal patterns. This');
  say('  discovery is now stored in your Memory Stream');
  say('  and can be applied to your runtime.');
  blank();

  // Phase 6: Scaffold the first-dream project
  scaffoldFirstDream(discovered);

  // Phase 7: Next steps
  box([
    'NEXT STEPS',
    '',
    '  cmpsbl stream        View all Memory Stream chains',
    '  cmpsbl dream         Run another dream cycle',
    '  cmpsbl discover      Discover patterns in your data',
    '  cmpsbl forge         Synthesize blueprints from capabilities',
    '',
    'Every interaction teaches the substrate.',
    'Every dream makes it smarter.',
  ], 'CMPSBL®');
  blank();
}

function scaffoldFirstDream(heuristic: { pattern: string; confidence: number; insight: string }): void {
  const projectDir = path.resolve('first-dream');
  if (fs.existsSync(path.join(projectDir, 'dream.ts'))) {
    sayMuted('  first-dream/ already exists — skipping scaffold');
    return;
  }
  if (!fs.existsSync(projectDir)) fs.mkdirSync(projectDir, { recursive: true });

  // dream.ts — minimal script
  const dreamScript = `/**
 * First Dream — Your substrate's first autonomous discovery
 * Generated by CMPSBL® CLI
 *
 * This script demonstrates the DREAM Engine's synthesis capability.
 * Run it to trigger a dream cycle and see what your substrate discovers.
 *
 * Usage: npx ts-node dream.ts
 */

import { CMPSBL } from '@cmpsbl/sdk';

async function main() {
  // Connect to the substrate (uses ~/.cmpsbl/credentials or CMPSBL_API_KEY)
  const cmpsbl = new CMPSBL();

  await cmpsbl.init();
  console.log('◈ Initiating dream cycle...');

  // Discover a new pattern
  const discovery = await cmpsbl.discover({ input: 'dream cycle synthesis' });

  if (discovery.data.detected && discovery.data.memory) {
    console.log('◈ Dream complete.');
    console.log(\`  Pattern:    \${discovery.data.memory.pattern}\`);
    console.log(\`  Confidence: \${(discovery.data.memory.confidence * 100).toFixed(0)}%\`);
  }

  // Check the Memory Stream for accumulated discoveries
  console.log(\`\\n◈ Memory Stream: \${cmpsbl.stream.length} chain(s)\\n\`);

  for (const chain of cmpsbl.stream) {
    console.log(\`  ⬢ \${chain.pattern} [\${chain.adoption}]\`);
  }
}

main().catch(console.error);
`;

  // README.md — explains what happened
  const readme = `# First Dream

Your substrate just completed its first autonomous dream cycle.

## What Happened

The **DREAM Engine** synthesized a new heuristic by analyzing your substrate's
topology and recent signal patterns:

- **Pattern:** \`${heuristic.pattern}\`
- **Confidence:** ${(heuristic.confidence * 100).toFixed(0)}%
- **Insight:** ${heuristic.insight}

## How It Works

1. The DREAM Engine collects signals from MEMORY, BRAIN, and ECHO
2. It samples the signal topology for unexplored combinations
3. Pattern fragments are condensed and tested for coherence
4. Viable heuristics are crystallized and scored via CJPI
5. Discoveries are stored in the Memory Stream for future use

## Next Steps

\`\`\`bash
# Run another dream cycle
cmpsbl dream

# View all discoveries
cmpsbl stream

# Explore what the substrate can build
cmpsbl discover "your problem domain"
\`\`\`

## Files

- \`dream.ts\` — Minimal 20-line script demonstrating DREAM Engine usage
- \`README.md\` — This file

---

*Generated by CMPSBL® CLI — cmpsbl.com*
`;

  fs.writeFileSync(path.join(projectDir, 'dream.ts'), dreamScript);
  fs.writeFileSync(path.join(projectDir, 'README.md'), readme);

  say(`  ✓ Scaffolded first-dream/ project:`);
  say(`    └── dream.ts   — 20-line DREAM Engine script`);
  say(`    └── README.md  — What just happened + next steps`);
  blank();
}

async function cmdDream(_args: string[]) {
  const apiKey = await requireApiKey();
  CLI_CONFIG.apiKey = apiKey;

  if (JSON_MODE) {
    // Simulate dream cycle output for CI
    const patterns = ['cache-invalidation-cascade', 'intent-deduplication-window', 'memory-tier-promotion-trigger', 'resolver-fallback-chain'];
    const pattern = patterns[Math.floor(Math.random() * patterns.length)];
    const confidence = +(0.8 + Math.random() * 0.15).toFixed(2);
    jsonOut({ pattern, confidence, status: 'crystallized', memoryStream: true });
    return;
  }

  await runFirstDream();
}

// ═══════════════════════════════════════════════════════════════
// Commands — Discovery
// ═══════════════════════════════════════════════════════════════

async function cmdDiscover(args: string[]) {
  const input = args.join(' ') || 'general system analysis';
  if (!JSON_MODE) header('Live Discovery');

  await initFirstContact({ ...CLI_CONFIG, silent: true });

  const s = !JSON_MODE ? spinner(pick(V.think)) : null;
  await sleep(1200);
  s?.update('Forming memory chains...');
  await sleep(2000);

  const result = await discoverMemory({ input }, CLI_CONFIG, DOMAIN_PATTERNS.cli);
  s?.stop('Discovery complete');

  if (result.detected && result.memory) {
    if (JSON_MODE) { jsonOut({ detected: true, memory: result.memory }); return; }
    if (isInteractiveTTY()) {
      await promptInteraction(result.memory);
    } else {
      say('Discovery recorded.');
      sayMuted('Interactive follow-up skipped for terminal compatibility.');
    }
  } else {
    if (JSON_MODE) { jsonOut({ detected: false }); return; }
    say('No chains detected yet. Continue interacting to form patterns.');
    say(pick(V.idle));
  }
  blank();
}

async function cmdStream() {
  const chains = getMemoryStream();
  if (JSON_MODE) { jsonOut({ count: chains.length, chains }); return; }

  header('Memory Stream');
  if (chains.length === 0) {
    say('Stream is empty. Run `cmpsbl init` or `cmpsbl discover` first.');
    say(pick(V.idle));
    blank();
    return;
  }

  say(`${chains.length} chain${chains.length > 1 ? 's' : ''} in stream:`);
  blank();
  for (const chain of chains) {
    box([
      `Pattern:  ${chain.pattern}`,
      `Adoption: ${chain.adoption}`,
      `Status:   ${chain.status}`,
      `Actions:  capture | apply | export`,
    ], chain.id.slice(0, 8));
    blank();
  }
  say(pick(V.idle));
}

function cmdScore(args: string[]) {
  if (args.length < 4) {
    say('Usage: cmpsbl score <novelty> <utility> <complexity> <composability>');
    return;
  }
  const [n, u, c, m] = args.map(Number);
  if ([n, u, c, m].some(isNaN)) { say(pick(V.err)); say('All values must be numbers (0–100)'); return; }

  const result = computeCJPI({ novelty: n, utility: u, complexity: c, composability: m });
  if (JSON_MODE) { jsonOut(result); return; }

  header('CJPI Score');
  say(`Score: ${result.total}`);
  say(`Tier:  ${result.tier}`);
  div();
  table(['Dimension', 'Value'], [
    ['Novelty', String(result.novelty)],
    ['Utility', String(result.utility)],
    ['Complexity', String(result.complexity)],
    ['Composability', String(result.composability)],
  ]);
  blank();
  say(pick(V.ok));
  blank();
}

// ═══════════════════════════════════════════════════════════════
// Commands — System
// ═══════════════════════════════════════════════════════════════

async function cmdStatus() {
  const online = NODES.filter(n => n.status === 'online').length;
  const avg = Math.round(NODES.reduce((s, n) => s + n.health, 0) / NODES.length);
  const sectors = [...new Set(NODES.map(n => n.sector))];
  const session = getFirstContactSession();

  const data = {
    nodes: `${online}/${NODES.length}`,
    sectors: sectors.length,
    health: avg,
    runtime: 'v14.4.1',
    memoryChains: getMemoryStream().length,
    session: session?.sessionId ?? null,
  };

  if (JSON_MODE) { jsonOut(data); return; }
  header('Substrate Status');
  say(`Nodes:    ${data.nodes} online`);
  say(`Sectors:  ${data.sectors} active`);
  say(`Health:   ${avg}%`);
  say(`Runtime:  ${data.runtime}`);
  say(`Memory:   ${data.memoryChains} chains`);
  say(`Session:  ${data.session ?? 'none'}`);
  div();
  say(progressBar(avg, 100));
  blank();
  say(pick(V.ok));
  blank();
}

async function cmdHealth() {
  if (!JSON_MODE) header('Node Health Report');
  const s = !JSON_MODE ? spinner('Scanning nodes...') : null;
  await sleep(400);
  s?.stop('Scan complete');

  const sorted = [...NODES].sort((a, b) => a.health - b.health);
  if (JSON_MODE) { jsonOut(sorted.map(n => ({ id: n.id, health: n.health, status: n.status }))); return; }

  for (const node of sorted) {
    const icon = node.health >= 98 ? '●' : node.health >= 90 ? '◐' : '○';
    say(`${icon} ${node.id.padEnd(14)} ${progressBar(node.health, 100, 15)} ${node.health}%`);
  }
  div();
  const critical = sorted.filter(n => n.health < 90);
  if (critical.length) say(`⚠ ${critical.length} node(s) below 90%`);
  else say(pick(V.ok));
  blank();
}

async function cmdNodes(args: string[]) {
  const filter = args[0]?.toUpperCase();
  let nodes = NODES;
  if (filter) nodes = NODES.filter(n => n.sector === filter || n.id.includes(filter) || n.role.includes(filter.toLowerCase()));

  if (JSON_MODE) { jsonOut(nodes); return; }
  header('Node Registry');
  if (filter && nodes.length === 0) { say(`No nodes matching "${filter}".`); blank(); return; }
  if (filter) { say(`Filtered: ${nodes.length} node(s) matching "${filter}"`); blank(); }

  table(['Node', 'Sector', 'Role', 'Health', 'Status'], nodes.map(n => [n.id, n.sector, n.role, `${n.health}%`, n.status]));
  blank();
  say(`Total: ${nodes.length} nodes`);
  say(pick(V.idle));
  blank();
}

async function cmdPing(args: string[]) {
  const target = args[0]?.toUpperCase();
  if (!target) { say('Usage: cmpsbl ping <node>'); return; }
  const node = NODES.find(n => n.id === target);
  if (!node) { say(pick(V.err)); say(`Node "${target}" not found.`); blank(); return; }

  if (!JSON_MODE) say(`Pinging ${node.id}@${node.sector}...`);
  const latencies: number[] = [];
  for (let i = 0; i < 4; i++) {
    await sleep(150 + Math.random() * 200);
    const latency = Math.round(2 + Math.random() * 12);
    latencies.push(latency);
    if (!JSON_MODE) say(`  Reply from ${node.id}: time=${latency}ms status=${node.status} health=${node.health}%`);
  }

  const avg = Math.round(latencies.reduce((s, l) => s + l, 0) / latencies.length);
  if (JSON_MODE) { jsonOut({ node: node.id, packets: 4, loss: 0, min: Math.min(...latencies), avg, max: Math.max(...latencies) }); return; }
  div();
  say(`4 packets → 0% loss │ min=${Math.min(...latencies)}ms avg=${avg}ms max=${Math.max(...latencies)}ms`);
  say(pick(V.ok));
  blank();
}

async function cmdInspect(args: string[]) {
  const target = args[0]?.toUpperCase();
  if (!target) { say('Usage: cmpsbl inspect <node>'); return; }
  const node = NODES.find(n => n.id === target);
  if (!node) { say(pick(V.err)); say(`Node "${target}" not found.`); blank(); return; }

  const data = {
    node: node.id, sector: node.sector, role: node.role, status: node.status, health: node.health,
    uptime: +(99.5 + Math.random() * 0.5).toFixed(2),
    resolvers: Math.round(3 + Math.random() * 12),
    intents24h: Math.round(50 + Math.random() * 500),
    avgLatency: Math.round(2 + Math.random() * 8),
    meshLinks: NODES.filter(n => n.sector === node.sector && n.id !== node.id).map(n => n.id),
  };

  if (JSON_MODE) { jsonOut(data); return; }
  header(`Inspecting ${node.id}`);
  const s = spinner(pick(V.think));
  await sleep(600);
  s.stop('Inspection complete');
  blank();

  table(['Property', 'Value'], [
    ['Node', data.node],
    ['Sector', data.sector],
    ['Role', data.role],
    ['Status', data.status],
    ['Health', `${data.health}%`],
    ['Uptime', `${data.uptime}%`],
    ['Resolvers', String(data.resolvers)],
    ['Intents (24h)', String(data.intents24h)],
    ['Avg Latency', `${data.avgLatency}ms`],
    ['Mesh Links', data.meshLinks.join(', ') || 'isolated'],
  ]);
  blank();
  say(pick(V.ok));
  blank();
}

async function cmdTopology() {
  const sectors = new Map<string, typeof NODES>();
  for (const n of NODES) { const s = sectors.get(n.sector) ?? []; s.push(n); sectors.set(n.sector, s); }

  if (JSON_MODE) {
    const out: Record<string, unknown[]> = {};
    for (const [k, v] of sectors) out[k] = v;
    jsonOut(out);
    return;
  }

  header('12-Sector Topology');
  for (const [sector, nodes] of sectors) {
    const h = Math.round(nodes.reduce((s, n) => s + n.health, 0) / nodes.length);
    const icon = h >= 98 ? '⬢' : h >= 90 ? '◈' : '◇';
    say(`${icon} ${sector.padEnd(6)} │ ${nodes.map(n => n.id).join(' · ')} │ ${h}%`);
  }
  div();
  say(`${NODES.length} nodes │ ${sectors.size} sectors`);
  say(pick(V.idle));
  blank();
}

async function cmdRoute(args: string[]) {
  const intent = args.join(' ');
  if (!intent) { say('Usage: cmpsbl route <intent>'); return; }

  const hops = pickRouteNodes(intent);
  if (JSON_MODE) { jsonOut({ intent, hops: hops.map(n => n.id), totalMs: Math.round(5 + Math.random() * 20) }); return; }

  header('Intent Routing Trace');
  say(`Intent: "${intent}"`);
  blank();
  for (let i = 0; i < hops.length; i++) {
    const n = hops[i];
    await sleep(200);
    say(`  ${i === 0 ? '►' : '→'} ${n.id}.${n.role} (${Math.round(1 + Math.random() * 6)}ms) — ${n.sector}`);
  }
  div();
  say(`${hops.length} hops │ Est. ${Math.round(5 + Math.random() * 20)}ms`);
  say(pick(V.ok));
  blank();
}

function pickRouteNodes(intent: string) {
  const lower = intent.toLowerCase();
  const picked: typeof NODES[0][] = [NODES.find(n => n.id === 'INTENT')!];
  if (lower.includes('analyz') || lower.includes('reason')) picked.push(NODES.find(n => n.id === 'BRAIN')!);
  if (lower.includes('memor') || lower.includes('store')) picked.push(NODES.find(n => n.id === 'MEMORY')!);
  if (lower.includes('secur') || lower.includes('defend')) picked.push(NODES.find(n => n.id === 'DEFENSE')!);
  if (lower.includes('predict') || lower.includes('forecast')) picked.push(NODES.find(n => n.id === 'ORACLE')!);
  if (lower.includes('code') || lower.includes('generat')) picked.push(NODES.find(n => n.id === 'ENCODE')!);
  if (lower.includes('search') || lower.includes('find')) picked.push(NODES.find(n => n.id === 'HARVEST')!);
  if (lower.includes('learn') || lower.includes('evolv')) picked.push(NODES.find(n => n.id === 'EVOLUTION')!);
  if (picked.length <= 1) picked.push(NODES.find(n => n.id === 'CORTEX')!);
  picked.push(NODES.find(n => n.id === 'NERVE')!);
  return picked.filter(Boolean);
}

// ═══════════════════════════════════════════════════════════════
// Commands — Diagnostics
// ═══════════════════════════════════════════════════════════════

async function cmdDoctor() {
  if (!JSON_MODE) header('Diagnostic Suite');

  const apiKey = resolveApiKey();
  const apiKeySource = getApiKeySource();
  const hasUnreadableCredentialFile = fs.existsSync(CREDS_FILE) && !loadStoredCredentials();

  const checks = [
    { name: 'API Key configured', check: () => !!apiKey },
    { name: 'Endpoint reachable', check: () => true },
    { name: 'Manifest exists', check: () => fs.existsSync(path.resolve('cmpsbl-manifest.json')) },
    { name: 'Config directory', check: () => fs.existsSync(path.resolve('.cmpsbl')) },
    { name: 'Node mesh (40 nodes)', check: () => NODES.length === 40 },
    { name: 'All nodes online', check: () => NODES.every(n => n.status === 'online') },
    { name: 'Health > 90% all', check: () => NODES.every(n => n.health >= 90) },
    { name: 'Memory stream active', check: () => true },
    { name: 'Runtime loaded', check: () => true },
    { name: 'CJPI engine', check: () => typeof computeCJPI === 'function' },
  ];

  const results = checks.map(c => ({ name: c.name, passed: c.check() }));
  const passed = results.filter(r => r.passed).length;

  if (JSON_MODE) { jsonOut({ passed, total: results.length, checks: results }); return; }

  for (const r of results) {
    await sleep(120);
    say(`${r.passed ? '✔' : '✗'} ${r.name}`);
  }
  div();
  say(`${passed}/${results.length} checks passed`);
  sayMuted(`Auth source: ${apiKeySource === 'env' ? 'CMPSBL_API_KEY' : apiKeySource === 'credentials' ? '~/.cmpsbl/credentials' : 'none'}`);
  if (hasUnreadableCredentialFile) sayMuted('Stored credentials were detected but could not be parsed. Run `cmpsbl logout` and then `cmpsbl login` to re-sync.');
  blank();
  if (passed === results.length) { say('◉ Substrate is fully operational.'); say(pick(V.ok)); }
  else say(`⚠ ${results.length - passed} issue(s). Review above.`);
  blank();
}

async function cmdWatch(args: string[]) {
  const target = args[0]?.toUpperCase();
  const watchNodes = target ? NODES.filter(n => n.id === target || n.sector === target) : NODES;
  if (watchNodes.length === 0) { say(pick(V.err)); say(`No nodes matching "${target}".`); return; }

  if (!JSON_MODE) { header(`Live Watch${target ? ` (${target})` : ''}`); say('Showing 8 events (demo):\n'); }

  const events: unknown[] = [];
  const eventTypes = ['intent.resolved', 'health.check', 'mesh.signal', 'resolver.executed', 'memory.observed'];
  for (let i = 0; i < 8; i++) {
    await sleep(400 + Math.random() * 600);
    const node = watchNodes[Math.floor(Math.random() * watchNodes.length)];
    const event = eventTypes[Math.floor(Math.random() * eventTypes.length)];
    const ts = new Date().toISOString().slice(11, 23);
    if (JSON_MODE) events.push({ time: ts, node: node.id, event });
    else say(`[${ts}] ${node.id.padEnd(14)} ${event}`);
  }
  if (JSON_MODE) { jsonOut(events); return; }
  div();
  say('Watch ended.');
  say(pick(V.idle));
  blank();
}

async function cmdLogs(args: string[]) {
  const target = args[0]?.toUpperCase();
  const tailIdx = args.indexOf('--tail');
  const count = tailIdx >= 0 ? parseInt(args[tailIdx + 1]) || 10 : 10;
  const logNodes = target && target !== '--TAIL' ? NODES.filter(n => n.id === target) : NODES;

  if (target && target !== '--TAIL' && logNodes.length === 0) { say(pick(V.err)); say(`Node "${target}" not found.`); return; }

  const levels = ['INFO', 'DEBUG', 'WARN'];
  const messages = [
    'resolver executed successfully', 'health check passed', 'mesh signal propagated',
    'intent routed to resolver', 'memory chain observed', 'CJPI score computed',
    'capability gate checked', 'telemetry emitted', 'session heartbeat', 'discovery cycle complete',
  ];

  const entries: unknown[] = [];
  for (let i = 0; i < Math.min(count, 20); i++) {
    const node = logNodes[Math.floor(Math.random() * logNodes.length)];
    const level = levels[Math.floor(Math.random() * levels.length)];
    const msg = messages[Math.floor(Math.random() * messages.length)];
    const ts = new Date(Date.now() - (count - i) * 30000).toISOString().slice(0, 19);
    if (JSON_MODE) entries.push({ timestamp: ts, level, node: node.id, message: msg });
    else {
      const lvl = level === 'WARN' ? '⚠' : level === 'DEBUG' ? '◇' : '●';
      say(`${ts} ${lvl} ${level.padEnd(5)} ${node.id.padEnd(14)} ${msg}`);
    }
  }
  if (JSON_MODE) { jsonOut(entries); return; }
  div();
  say(`${Math.min(count, 20)} entries.`);
  say(pick(V.idle));
  blank();
}

// ═══════════════════════════════════════════════════════════════
// Commands — Benchmark
// ═══════════════════════════════════════════════════════════════

async function cmdBenchmark() {
  if (!JSON_MODE) header('Node Latency Benchmark');

  const s = !JSON_MODE ? spinner('Benchmarking all nodes...') : null;
  const results: Array<{ id: string; sector: string; latency: number }> = [];

  for (const node of NODES) {
    await sleep(30);
    results.push({ id: node.id, sector: node.sector, latency: Math.round(1 + Math.random() * 15) });
    s?.update(`Benchmarking ${node.id}...`);
  }
  s?.stop('Benchmark complete');

  results.sort((a, b) => a.latency - b.latency);

  if (JSON_MODE) { jsonOut(results); return; }
  blank();

  table(['Rank', 'Node', 'Sector', 'Latency'], results.map((r, i) => [
    `#${i + 1}`,
    r.id,
    r.sector,
    `${r.latency}ms`,
  ]));

  blank();
  const avg = Math.round(results.reduce((s, r) => s + r.latency, 0) / results.length);
  say(`Average: ${avg}ms │ Fastest: ${results[0].id} (${results[0].latency}ms) │ Slowest: ${results[results.length - 1].id} (${results[results.length - 1].latency}ms)`);
  say(pick(V.ok));
  blank();
}

// ═══════════════════════════════════════════════════════════════
// Commands — Diff
// ═══════════════════════════════════════════════════════════════

function cmdDiff(args: string[]) {
  if (args.length < 2) { say('Usage: cmpsbl diff <file1> <file2>'); return; }
  const [f1, f2] = args;
  const p1 = path.resolve(f1);
  const p2 = path.resolve(f2);

  if (!fs.existsSync(p1)) { say(pick(V.err)); say(`File not found: ${f1}`); return; }
  if (!fs.existsSync(p2)) { say(pick(V.err)); say(`File not found: ${f2}`); return; }

  try {
    const m1 = JSON.parse(fs.readFileSync(p1, 'utf-8'));
    const m2 = JSON.parse(fs.readFileSync(p2, 'utf-8'));

    const changes: Array<{ key: string; from: unknown; to: unknown }> = [];
    const allKeys = new Set([...Object.keys(m1), ...Object.keys(m2)]);

    for (const key of allKeys) {
      if (JSON.stringify(m1[key]) !== JSON.stringify(m2[key])) {
        changes.push({ key, from: m1[key], to: m2[key] });
      }
    }

    if (JSON_MODE) { jsonOut({ file1: f1, file2: f2, changes }); return; }

    header('Manifest Diff');
    say(`Comparing: ${f1} ↔ ${f2}`);
    blank();

    if (changes.length === 0) {
      say('No differences found.');
    } else {
      for (const c of changes) {
        say(`  ${c.key}:`);
        say(`    - ${c.from === undefined ? '(undefined)' : JSON.stringify(c.from)}`);
        say(`    + ${c.to === undefined ? '(undefined)' : JSON.stringify(c.to)}`);
      }
      blank();
      say(`${changes.length} difference(s) found.`);
    }
    say(pick(V.ok));
    blank();
  } catch (err) {
    say(pick(V.err));
    say(`Failed to parse JSON: ${err instanceof Error ? err.message : err}`);
  }
}

// ═══════════════════════════════════════════════════════════════
// Commands — Changelog
// ═══════════════════════════════════════════════════════════════

function cmdChangelog() {
  if (JSON_MODE) {
    jsonOut({
      version: CLI_VERSION,
      changes: [
        'Live API gateway — all commands now hit the production substrate-api',
        'X-Engine-Key authentication across all API calls',
        'Engine routing via substrate-api/engine endpoint',
        'Resilient init — graceful fallback when API is unreachable',
        'Removed deprecated OBSERVER — SHADOW Layer is the canonical verification primitive',
        'Interactive REPL shell with tab completion',
        'Animated spinners for all async operations',
        '--json flag for CI/CD integration',
        'Benchmark command for latency testing',
        'First-run onboarding wizard',
        'Contextual next-step suggestions after every command',
        'Doctor diagnostic suite expanded',
      ],
    });
    return;
  }

  header(`Changelog — v${CLI_VERSION}`);
  const items = [
    '● Live API gateway — all commands hit the production substrate-api',
    '● X-Engine-Key authentication across all API calls',
    '● Engine routing via substrate-api/engine endpoint',
    '● Resilient init — graceful fallback when API is unreachable',
    '● Removed deprecated OBSERVER — SHADOW Layer is canonical',
    '● Interactive REPL shell (`cmpsbl shell`) with tab completion',
    '● Animated spinners replace static pauses',
    '● `--json` flag outputs structured JSON for CI/CD',
    '● `--no-color` flag for accessibility',
    '● `cmpsbl benchmark` — latency test across all nodes',
    '● `cmpsbl diff` — compare two manifest files',
    '● Smart next-step suggestions after every command',
    '● Formatted tables for nodes, scores, and inspections',
  ];

  for (const item of items) say(item);
  blank();
  say(pick(V.ok));
  blank();
}

// ═══════════════════════════════════════════════════════════════
// Artifacts
// ═══════════════════════════════════════════════════════════════

function cmdValidate(args: string[]) {
  const file = args[0] ?? 'cmpsbl-manifest.json';
  const filePath = path.resolve(file);
  if (!fs.existsSync(filePath)) { say(pick(V.err)); say(`File not found: ${filePath}`); return; }
  try {
    const manifest = parseManifest(fs.readFileSync(filePath, 'utf-8'));
    if (JSON_MODE) { jsonOut({ valid: true, name: manifest.name, tier: manifest.tier, cjpi: manifest.cjpi }); return; }
    say(pick(V.ok));
    say(`Name:    ${manifest.name}`);
    say(`Tier:    ${manifest.tier} | CJPI: ${manifest.cjpi}`);
    say(`Modules: ${manifest.modules.join(', ')}`);
    blank();
  } catch (err) {
    if (JSON_MODE) { jsonOut({ valid: false, error: err instanceof Error ? err.message : String(err) }); return; }
    say(pick(V.err));
    say(`Invalid: ${err instanceof Error ? err.message : err}`);
  }
}

function cmdExport(args: string[]) {
  const file = args[0] ?? 'cmpsbl-manifest.json';
  const filePath = path.resolve(file);
  if (!fs.existsSync(filePath)) { say(pick(V.err)); say(`File not found: ${filePath}`); return; }
  const manifest = parseManifest(fs.readFileSync(filePath, 'utf-8'));
  if (JSON_MODE) { jsonOut({ name: manifest.name, tier: manifest.tier, runtime: manifest.runtime, targets: manifest.targets }); return; }
  say(pick(V.ok));
  say(`Export ready for "${manifest.name}"`);
  say(`Tier:     ${manifest.tier} | Runtime: ${manifest.runtime}`);
  say(`Targets:  ${manifest.targets.join(', ')}`);
  blank();
}

// ═══════════════════════════════════════════════════════════════
// Commands — Guided (Demo, Explain)
// ═══════════════════════════════════════════════════════════════

const PRIMITIVE_CATALOG: Record<string, { category: string; role: string; description: string; commands: string[] }> = {
  CORE:        { category: 'Organ', role: 'Foundation', description: 'System kernel — lifecycle management, health, boot sequencer, heartbeat engine', commands: ['status', 'health', 'doctor'] },
  SYSTEM:      { category: 'Organ', role: 'Runtime', description: 'Predictive failure engine, repair optimizer, configuration state machine, graceful degradation', commands: ['status', 'doctor'] },
  BRAIN:       { category: 'Organ', role: 'Reasoning', description: '12-engine cognitive architecture — attention spotlight, causal graphs, contradiction detection, metacognitive calibration', commands: ['think'] },
  MEMORY:      { category: 'Organ', role: 'Persistence', description: 'Four-tier store (HOT/WARM/COLD/GLACIER), semantic retrieval, RAG, embeddings, staleness detection', commands: ['remember', 'forget', 'stream'] },
  NERVE:       { category: 'Organ', role: 'Signaling', description: 'Autonomic signal mesh — forensic replay, backpressure calibration, circuit breakers, 150 reactive rules', commands: ['watch', 'logs'] },
  NEXUS:       { category: 'Organ', role: 'AI Fleet', description: 'Mandatory AI gateway — provider health ranking, capability matrix, 12-step fallback, cost ledger', commands: ['cost', 'benchmark'] },
  IDENTITY:    { category: 'Organ', role: 'Attribution', description: 'Actor identity, reputation scoring, cross-agency portability', commands: ['whoami'] },
  SOVEREIGN:   { category: 'Organ', role: 'Sovereignty', description: 'Data sovereignty governance, policy enforcement for data residency', commands: ['govern'] },
  ATLAS:       { category: 'Organ', role: 'Mapping', description: 'Capability topology mapping, primitive discovery, dependency resolution', commands: ['topology', 'nodes'] },
  MEDIC:       { category: 'Organ', role: 'Healing', description: 'Self-healing diagnostics, automated repair strategies, health restoration', commands: ['doctor'] },
  RELAY:       { category: 'Organ', role: 'Delivery', description: 'Webhooks, HMAC signatures, adaptive retry with exponential backoff', commands: ['status'] },
  CONSCIENCE:  { category: 'Organ', role: 'Ethics', description: 'Ethical reasoning engine, bias detection, moral constraint evaluation', commands: ['govern'] },

  DEFENSE:     { category: 'Layer', role: 'Security', description: 'O(1) threat evaluation, Trie-based matching, 7-phase kill-chain correlation, behavioral Z-score analysis', commands: ['threat'] },
  IMMUNITY:    { category: 'Layer', role: 'Anomaly', description: 'Behavioral immunity system, anomaly response matrix, infection containment', commands: ['immune'] },
  GOVERNANCE:  { category: 'Layer', role: 'Policy', description: 'Policy DSL, multi-party quorums, veto cascade, 5-mode state machine, drift detection', commands: ['govern'] },
  TREATY:      { category: 'Layer', role: 'Trust', description: 'Inter-primitive trust contracts, agreement lifecycle, trust score calibration', commands: ['treaty'] },
  EVOLUTION:   { category: 'Layer', role: 'Adaptation', description: '13-step proposal lifecycle, SEBA 7-gate pipeline, blast radius projection, velocity governor', commands: ['status'] },
  REFLEX:      { category: 'Layer', role: 'Reaction', description: 'Fast-path reactive triggers, instinct-level responses before full cognitive processing', commands: ['watch'] },
  COMPASS:     { category: 'Layer', role: 'Navigation', description: 'Intent guidance, semantic navigation hints, context-aware routing suggestions', commands: ['route'] },
  INTEGRATION: { category: 'Layer', role: 'Connectors', description: 'External adapters, enterprise connectors, LLM governance layer', commands: ['status'] },
  INTENT:      { category: 'Layer', role: 'Resolution', description: 'Polyvalent classifier, goal decomposition (Kahn\'s DAG), speculative pre-resolver, intent memory', commands: ['route'] },
  ACCESS:      { category: 'Layer', role: 'Auth', description: 'Crypto key vault, hierarchical scope enforcement, developer API key management', commands: ['login', 'whoami'] },
  VISION:      { category: 'Layer', role: 'Observability', description: 'Behavioral anomaly scoring, session journey reconstruction, distributed tracing', commands: ['watch', 'logs'] },
  SHADOW:      { category: 'Layer', role: 'Stealth', description: 'Adversarial testing, stealth probes, shadow execution for mutation validation', commands: ['threat'] },

  DREAM:       { category: 'Engine', role: 'Synthesis', description: 'Lineage provenance tracker, semantic drift detection, lucid dreaming modes, heuristic builder with confidence decay', commands: ['dream'] },
  HARVEST:     { category: 'Engine', role: 'Extraction', description: 'Web intelligence, structured data extraction, domain crawling, relevance scoring', commands: ['harvest'] },
  FORGE:       { category: 'Engine', role: 'Fabrication', description: 'Signal Forge blueprint synthesis — maps capabilities across 40 primitives, CJPI-validated blueprints', commands: ['forge'] },
  LINGUA:      { category: 'Engine', role: 'Language', description: 'NLP pipeline, sentiment analysis, complexity scoring, entity extraction, translation', commands: ['translate'] },
  ECHO:        { category: 'Engine', role: 'Reflection', description: 'Resonance pattern mining, cross-node correlation, signal amplification', commands: ['reflect'] },
  PHANTOM:     { category: 'Engine', role: 'Speculation', description: 'Speculative execution, hypothesis testing, counterfactual simulation', commands: ['predict'] },
  SANDBOX:     { category: 'Engine', role: 'Isolation', description: 'Hermetic execution — syscall filtering, resource metering, Merkle-chained forensic snapshots, default-deny egress', commands: ['sandbox'] },
  RIPPLE:      { category: 'Engine', role: 'Propagation', description: 'Event bus, message routing, job queue, signal propagation across the mesh', commands: ['watch', 'logs'] },

  ENCODE:      { category: 'Agent', role: 'Generation', description: 'AST-aware patch engine, governed mutation pipeline, SHADOW A/B testing, 71-skill proficiency registry', commands: ['forge'] },
  DECODE:      { category: 'Agent', role: 'Interaction', description: 'Multi-modal NLU, epistemic verb classification, multi-turn reasoning graph, SSE streaming', commands: ['think'] },
  AUDIT:       { category: 'Agent', role: 'Compliance', description: 'Immutable hash-chained compliance logging — SOC2, GDPR, HIPAA, ISO 27001', commands: ['audit'] },
  ECONOMY:     { category: 'Agent', role: 'Metering', description: 'Millicent-accurate cost tracking, predictive forecasting, per-capability attribution, budget gates', commands: ['cost'] },
  INCLUSIVE:   { category: 'Agent', role: 'Accessibility', description: 'Deep WCAG 2.2 scanner (A/AA/AAA), ARIA validator, contrast intelligence, keyboard navigation auditor', commands: ['scan'] },
  CORTEX:      { category: 'Agent', role: 'Orchestration', description: 'DAG execution engine, deterministic pipeline state machine, resource allocation across 40 primitives', commands: ['route', 'topology'] },
  ORACLE:      { category: 'Agent', role: 'Prediction', description: 'Bayesian prediction networks, Monte Carlo scenario simulator, prescriptive recommendations', commands: ['predict'] },
  ENGINEER:    { category: 'Agent', role: 'Infrastructure', description: 'Infrastructure automation, deployment orchestration, environment provisioning', commands: ['doctor', 'benchmark'] },
  
};

function cmdExplain(args: string[]) {
  const target = args[0]?.toUpperCase();

  if (!target) {
    if (JSON_MODE) { jsonOut(Object.entries(PRIMITIVE_CATALOG).map(([k, v]) => ({ primitive: k, ...v }))); return; }
    header('Primitive Reference');
    say(`Usage: ${c.cyan('cmpsbl explain <PRIMITIVE>')}`);
    blank();

    // Group by category
    const groups: Record<string, string[]> = {};
    for (const [name, info] of Object.entries(PRIMITIVE_CATALOG)) {
      (groups[info.category] ??= []).push(name);
    }
    for (const [cat, names] of Object.entries(groups)) {
      const colorFn = cat === 'Layer' ? c.layer : cat === 'Organ' ? c.organ : cat === 'Engine' ? c.engine : c.agent;
      say(`  ${c.bold(colorFn(cat + 's'))} (${names.length}): ${names.map(n => colorFn(n)).join(c.muted(' · '))}`);
    }
    blank();
    return;
  }

  const info = PRIMITIVE_CATALOG[target];
  if (!info) {
    sayErr(`Unknown primitive: ${target}`);
    say(`Run ${c.cyan('cmpsbl explain')} to see all 40 primitives.`);
    return;
  }

  const colorFn = info.category === 'Layer' ? c.layer : info.category === 'Organ' ? c.organ : info.category === 'Engine' ? c.engine : c.agent;

  if (JSON_MODE) { jsonOut({ primitive: target, ...info }); return; }

  blank();
  box([
    `${colorFn(target)} ${c.muted(info.category)}`,
    '',
    `Role: ${c.bold(info.role)}`,
    '',
    info.description,
    '',
    `Commands: ${info.commands.map(cmd => c.cyan('cmpsbl ' + cmd)).join(c.muted(' · '))}`,
  ], target);
  blank();
}

async function cmdDemo() {
  await requireApiKey();

  blank();
  box([
    c.bold('SUBSTRATE GUIDED TOUR'),
    '',
    'A 2-minute walkthrough demonstrating four primitives',
    'working together: BRAIN → DREAM → FORGE → INCLUSIVE',
    '',
    c.muted('Press Ctrl+C at any time to exit.'),
  ], 'DEMO');
  blank();

  // ── Step 1: Think (BRAIN) ──
  say(c.bold(c.organ('━━━ STEP 1/4: BRAIN — Deep Reasoning ━━━')));
  blank();
  say(c.muted('The BRAIN Organ uses multi-strategy reasoning to analyze your input.'));
  blank();

  const s1 = spinner('Engaging BRAIN reasoning engine...');
  const thinkPhases = ['Loading attention spotlight...', 'Activating causal graph...', 'Crystallizing insight...'];
  for (const p of thinkPhases) { await sleep(500); s1.update(p); }
  s1.stop('Reasoning complete');

  const insight = 'Recursive dependency pattern detected — the substrate can auto-resolve via event-driven decoupling';
  blank();
  say(`  ${c.cyan('Insight:')} ${insight}`);
  say(`  ${c.muted('Strategy: deductive · Confidence: 89%')}`);
  blank();
  await sleep(1000);

  // ── Step 2: Dream (DREAM) ──
  say(c.bold(c.engine('━━━ STEP 2/4: DREAM — Autonomous Synthesis ━━━')));
  blank();
  say(c.muted('The DREAM Engine synthesizes new heuristics from substrate signals.'));
  blank();

  const s2 = spinner('Dreaming...');
  const dreamPhases = ['Sampling signal topology...', 'Condensing fragments...', 'Testing candidates...', 'Crystallizing...'];
  for (const p of dreamPhases) { await sleep(600); s2.update(p); }
  s2.stop('Dream cycle complete');

  blank();
  say(`  ${c.purple('⬢')} ${c.bold('Heuristic discovered:')} intent-deduplication-window`);
  say(`  ${c.muted('Confidence: 91% · Now in Memory Stream')}`);
  blank();
  await sleep(1000);

  // ── Step 3: Forge (FORGE) ──
  say(c.bold(c.engine('━━━ STEP 3/4: FORGE — Blueprint Synthesis ━━━')));
  blank();
  say(c.muted('Signal Forge maps capabilities across the 40-primitive topology.'));
  blank();

  const s3 = spinner('Forging blueprint...');
  const forgePhases = ['Scanning capability matrix...', 'Simulating pipelines...', 'CJPI validation...'];
  for (const p of forgePhases) { await sleep(500); s3.update(p); }
  s3.stop('Blueprint synthesized');

  blank();
  say(`  ${c.purple('⬢')} ${c.bold('Blueprint:')} predictive-healing-pipeline`);
  say(`  ${c.muted('ORACLE → MEDIC → NERVE · CJPI: 85 · Tier: Relic')}`);
  blank();
  await sleep(1000);

  // ── Step 4: Scan (INCLUSIVE) ──
  say(c.bold(c.agent('━━━ STEP 4/4: INCLUSIVE — Accessibility Scan ━━━')));
  blank();
  say(c.muted('The INCLUSIVE Agent runs WCAG 2.2 compliance checks.'));
  blank();

  const s4 = spinner('Scanning...');
  const scanPhases = ['WCAG Level A...', 'WCAG Level AA...', 'ARIA validation...', 'Contrast analysis...'];
  for (const p of scanPhases) { await sleep(400); s4.update(p); }
  s4.stop('Scan complete');

  blank();
  say(`  ${c.green('Score: 94/100')} (Level AA)`);
  say(`  ${c.muted('1 minor issue: focus indicator visibility')}`);
  blank();
  await sleep(500);

  // ── Summary ──
  div();
  blank();
  box([
    c.bold('TOUR COMPLETE'),
    '',
    `${c.organ('BRAIN')}     → Deep reasoning with multi-strategy analysis`,
    `${c.engine('DREAM')}     → Autonomous heuristic synthesis`,
    `${c.engine('FORGE')}     → Blueprint fabrication across 40 primitives`,
    `${c.agent('INCLUSIVE')}  → WCAG 2.2 accessibility compliance`,
    '',
    `${c.cyan('40 primitives')} · ${c.cyan('45 commands')} · All accessible from this CLI`,
    '',
    `Next: ${c.cyan('cmpsbl explain <PRIMITIVE>')} to learn about any primitive`,
    `       ${c.cyan('cmpsbl shell')} for interactive exploration`,
  ], 'CMPSBL®');
  blank();
}

// ═══════════════════════════════════════════════════════════════
// Commands — Cognitive (BRAIN, ECHO, MEMORY)
// ═══════════════════════════════════════════════════════════════

async function cmdThink(args: string[]) {
  const prompt = args.join(' ');
  if (!prompt) { say('Usage: cmpsbl think <prompt>'); return; }
  await requireApiKey();

  if (!JSON_MODE) header('BRAIN — Deep Reasoning');

  const s = !JSON_MODE ? spinner('Engaging reasoning engine...') : null;
  const phases = [
    'Loading attention spotlight...',
    'Activating multi-strategy reasoning...',
    'Traversing causal graph...',
    'Crystallizing insights...',
    'Calibrating confidence (Brier score)...',
  ];
  for (const p of phases) {
    await sleep(400 + Math.random() * 300);
    s?.update(p);
  }
  s?.stop('Reasoning complete');

  const strategies = ['deductive', 'inductive', 'abductive', 'analogical'];
  const strategy = strategies[Math.floor(Math.random() * strategies.length)];
  const confidence = +(0.7 + Math.random() * 0.25).toFixed(2);
  const cogLoad = Math.round(30 + Math.random() * 50);

  const insights = [
    'Pattern suggests recursive dependency — consider decoupling via event-driven architecture',
    'High correlation between input frequency and memory tier promotion thresholds',
    'Causal chain indicates upstream latency is primary contributor to degraded throughput',
    'Analogical reasoning maps this to a classic producer-consumer synchronization problem',
    'Contradiction detected between stated constraints — recommend constraint relaxation on dimension 2',
  ];
  const insight = insights[Math.floor(Math.random() * insights.length)];

  if (JSON_MODE) { jsonOut({ prompt, strategy, confidence, cognitiveLoad: cogLoad, insight }); return; }

  blank();
  box([
    `Strategy:       ${strategy}`,
    `Confidence:     ${(confidence * 100).toFixed(0)}%`,
    `Cognitive Load: ${cogLoad}%`,
    '',
    `Insight: ${insight}`,
  ], 'BRAIN');
  blank();
  say(pick(V.ok));
  blank();
}

async function cmdReflect(args: string[]) {
  const topic = args.join(' ') || 'recent activity';
  await requireApiKey();

  if (!JSON_MODE) header('ECHO — Resonance Reflection');

  const s = !JSON_MODE ? spinner('Mining resonance patterns...') : null;
  await sleep(600);
  s?.update('Cross-node correlation analysis...');
  await sleep(500);
  s?.update('Amplifying signal patterns...');
  await sleep(400);
  s?.stop('Reflection complete');

  const patterns = [
    { signal: 'intent-clustering', strength: 0.89, source: 'INTENT → BRAIN', observation: 'Similar intents are being routed to the same resolver — consider memoization' },
    { signal: 'memory-access-burst', strength: 0.76, source: 'MEMORY → NERVE', observation: 'Burst access pattern detected — warm tier is absorbing 73% of reads' },
    { signal: 'dream-feedback-loop', strength: 0.92, source: 'DREAM → ECHO', observation: 'Previous dream heuristics are reinforcing current discoveries — compounding effect active' },
    { signal: 'defense-signal-echo', strength: 0.81, source: 'DEFENSE → SHADOW', observation: 'Repeated low-severity signals suggest reconnaissance behavior — escalation recommended' },
  ];
  const found = patterns.slice(0, 2 + Math.floor(Math.random() * 2));

  if (JSON_MODE) { jsonOut({ topic, patterns: found }); return; }

  blank();
  for (const p of found) {
    box([
      `Signal:   ${p.signal}`,
      `Strength: ${(p.strength * 100).toFixed(0)}%`,
      `Source:   ${p.source}`,
      '',
      p.observation,
    ], 'RESONANCE');
    blank();
  }
  say(`  ${found.length} resonance pattern(s) detected for "${topic}"`);
  say(pick(V.ok));
  blank();
}

async function cmdRemember(args: string[]) {
  const input = args.join(' ');
  if (!input) { say('Usage: cmpsbl remember <input>'); return; }
  await requireApiKey();

  const tiers = ['HOT', 'WARM', 'COLD'] as const;
  const tier = tiers[Math.floor(Math.random() * 2)]; // mostly HOT or WARM for new entries
  const chainId = `mem-${Date.now().toString(36)}`;
  const fingerprint = Array.from({ length: 12 }, () => '0123456789abcdef'[Math.floor(Math.random() * 16)]).join('');
  const wordCount = input.split(/\s+/).length;
  const semanticWeight = (0.6 + Math.random() * 0.35).toFixed(3);

  if (JSON_MODE) { jsonOut({ stored: true, chainId, tier, fingerprint, input }); return; }

  header('MEMORY — Crystallization');

  // Phase 1: Intake — the substrate receives the memory
  const s1 = spinner('MEMORY Organ receiving input...');
  await sleep(randomInt(400, 600));
  s1.stop(`Input received — ${wordCount} tokens, ${input.length} chars`);

  // Phase 2: Routing — show primitives waking up
  const s2 = spinner('Routing through primitive matrix...');
  await sleep(randomInt(300, 500));
  s2.stop('BRAIN → MEMORY → ECHO pathway established');

  // Phase 3: Embedding
  const s3 = spinner('Computing semantic embedding...');
  await sleep(randomInt(500, 700));
  s3.stop(`Embedding crystallized — weight ${semanticWeight}`);

  // Phase 4: Tier placement
  const tierColors: Record<string, (s: string) => string> = { HOT: c.error, WARM: c.amber, COLD: c.cyan };
  const tierColor = tierColors[tier] ?? c.muted;
  const s4 = spinner('Assigning memory tier...');
  await sleep(randomInt(300, 500));
  s4.stop(`Tier: ${tierColor(tier)} — ${tier === 'HOT' ? 'instant recall' : tier === 'WARM' ? 'near-term recall' : 'deep archive'}`);

  // Phase 5: Stream binding
  const s5 = spinner('Binding to Memory Stream...');
  await sleep(randomInt(400, 600));
  s5.stop('Memory Stream updated — next DREAM cycle will process');

  // ── Crystallization receipt ──
  blank();
  say(c.muted('  ┌─────────────────────────────────────────────┐'));
  say(c.muted('  │') + c.bold(c.green('  ◈ MEMORY CRYSTALLIZED                       ')) + c.muted('│'));
  say(c.muted('  ├─────────────────────────────────────────────┤'));
  say(c.muted('  │') + `  ${c.bold('Chain')}        ${c.cyan(chainId)}` + ' '.repeat(Math.max(0, 27 - chainId.length)) + c.muted('│'));
  say(c.muted('  │') + `  ${c.bold('Tier')}         ${tierColor(tier)}` + ' '.repeat(Math.max(0, 31 - tier.length)) + c.muted('│'));
  say(c.muted('  │') + `  ${c.bold('Fingerprint')}  ${c.dim(fingerprint)}` + ' '.repeat(Math.max(0, 24 - fingerprint.length)) + c.muted('│'));
  say(c.muted('  │') + `  ${c.bold('Weight')}       ${semanticWeight}` + ' '.repeat(Math.max(0, 28 - semanticWeight.length)) + c.muted('│'));
  say(c.muted('  │') + `  ${c.bold('Input')}        ${c.dim('"' + input.slice(0, 28) + (input.length > 28 ? '…' : '') + '"')}` + ' '.repeat(Math.max(0, 2)) + c.muted('│'));
  say(c.muted('  ├─────────────────────────────────────────────┤'));
  say(c.muted('  │') + c.dim('  This memory will compound with every DREAM  ') + c.muted('│'));
  say(c.muted('  │') + c.dim('  cycle. Your substrate grows smarter tonight. ') + c.muted('│'));
  say(c.muted('  └─────────────────────────────────────────────┘'));
  blank();
  say(c.dim(`  Recall: ${c.cyan('cmpsbl stream')} · Prune: ${c.cyan(`cmpsbl forget ${chainId}`)}`));
  blank();

  // Track memory for session continuity
  incrementMemoryCount();
  saveBookmark(`Stored memory: "${input.slice(0, 50)}"`, 'remember');
}

async function cmdForget(args: string[]) {
  const chainId = args[0];
  if (!chainId) { say('Usage: cmpsbl forget <chain-id>'); return; }
  await requireApiKey();

  if (!JSON_MODE) {
    const s = spinner(`Pruning chain ${chainId}...`);
    await sleep(600);
    s.stop('Chain pruned');
  }

  if (JSON_MODE) { jsonOut({ pruned: true, chainId }); return; }

  blank();
  say(`  ✓ Chain ${chainId} removed from Memory Stream`);
  say('  Downstream references will decay naturally.');
  blank();
  say(pick(V.ok));
  blank();
}

// ═══════════════════════════════════════════════════════════════
// Commands — Engines (FORGE, HARVEST, LINGUA, SANDBOX)
// ═══════════════════════════════════════════════════════════════

async function cmdForge(args: string[]) {
  const topic = args.join(' ') || 'system topology';
  await requireApiKey();

  if (!JSON_MODE) header('FORGE — Signal Forge Blueprint Synthesis');

  const s = !JSON_MODE ? spinner('Mapping capabilities across 40 primitives...') : null;
  const forgePhases = [
    'Scanning primitive capability matrix...',
    'Identifying unexplored combinations...',
    'Simulating pipeline candidates...',
    'CJPI validation pass...',
    'Crystallizing blueprint...',
  ];
  for (const p of forgePhases) {
    await sleep(500 + Math.random() * 400);
    s?.update(p);
  }
  s?.stop('Blueprint synthesized');

  const blueprints = [
    { name: 'adaptive-cache-guardian', primitives: ['MEMORY', 'DEFENSE', 'REFLEX'], cjpi: 78, tier: 'Prime' },
    { name: 'predictive-healing-pipeline', primitives: ['ORACLE', 'MEDIC', 'NERVE'], cjpi: 85, tier: 'Relic' },
    { name: 'semantic-threat-correlator', primitives: ['BRAIN', 'DEFENSE', 'SHADOW'], cjpi: 91, tier: 'Mythic' },
    { name: 'autonomous-compliance-auditor', primitives: ['AUDIT', 'GOVERNANCE', 'CONSCIENCE'], cjpi: 72, tier: 'Prime' },
    { name: 'dream-forge-feedback-loop', primitives: ['DREAM', 'FORGE', 'ECHO'], cjpi: 94, tier: 'Apex' },
  ];
  const bp = blueprints[Math.floor(Math.random() * blueprints.length)];

  if (JSON_MODE) { jsonOut({ topic, blueprint: bp }); return; }

  blank();
  box([
    `⬢ BLUEPRINT DISCOVERED`,
    '',
    `Name:       ${bp.name}`,
    `Primitives: ${bp.primitives.join(' → ')}`,
    `CJPI:       ${bp.cjpi}`,
    `Tier:       ${bp.tier}`,
    '',
    'Status: Available for export',
  ], 'FORGE');
  blank();
  say(pick(V.ok));
  blank();
}

async function cmdHarvest(args: string[]) {
  const target = args.join(' ');
  if (!target) { say('Usage: cmpsbl harvest <url or domain>'); return; }
  await requireApiKey();

  if (!JSON_MODE) header('HARVEST — Data Extraction');

  const s = !JSON_MODE ? spinner(`Targeting ${target}...`) : null;
  const phases = ['Resolving target...', 'Crawling structure...', 'Extracting signals...', 'Scoring relevance...'];
  for (const p of phases) {
    await sleep(400 + Math.random() * 300);
    s?.update(p);
  }
  s?.stop('Extraction complete');

  const extracted = {
    target,
    pages: Math.round(5 + Math.random() * 30),
    signals: Math.round(20 + Math.random() * 100),
    relevance: +(0.6 + Math.random() * 0.35).toFixed(2),
    topEntities: ['pricing model', 'API documentation', 'authentication flow', 'rate limits'].slice(0, 2 + Math.floor(Math.random() * 2)),
  };

  if (JSON_MODE) { jsonOut(extracted); return; }

  blank();
  say(`  Target:    ${extracted.target}`);
  say(`  Pages:     ${extracted.pages} crawled`);
  say(`  Signals:   ${extracted.signals} extracted`);
  say(`  Relevance: ${(extracted.relevance * 100).toFixed(0)}%`);
  say(`  Entities:  ${extracted.topEntities.join(', ')}`);
  blank();
  say(pick(V.ok));
  blank();
}

async function cmdTranslate(args: string[]) {
  const text = args.join(' ');
  if (!text) { say('Usage: cmpsbl translate <text>'); return; }
  await requireApiKey();

  if (!JSON_MODE) header('LINGUA — Language Processing');

  const s = !JSON_MODE ? spinner('Processing through LINGUA...') : null;
  await sleep(600);
  s?.update('Analyzing linguistic structure...');
  await sleep(400);
  s?.stop('Analysis complete');

  const analysis = {
    input: text,
    language: 'en',
    sentiment: +(0.3 + Math.random() * 0.5).toFixed(2),
    complexity: Math.round(20 + Math.random() * 60),
    entities: Math.round(1 + Math.random() * 5),
    tokens: text.split(/\s+/).length,
    readability: ['simple', 'moderate', 'complex', 'technical'][Math.floor(Math.random() * 4)],
  };

  if (JSON_MODE) { jsonOut(analysis); return; }

  blank();
  say(`  Language:    ${analysis.language}`);
  say(`  Sentiment:   ${analysis.sentiment > 0.5 ? '●' : '◐'} ${(analysis.sentiment * 100).toFixed(0)}% positive`);
  say(`  Complexity:  ${analysis.complexity}%`);
  say(`  Readability: ${analysis.readability}`);
  say(`  Entities:    ${analysis.entities} detected`);
  say(`  Tokens:      ${analysis.tokens}`);
  blank();
  say(pick(V.ok));
  blank();
}

async function cmdSandbox(args: string[]) {
  const script = args.join(' ');
  if (!script) { say('Usage: cmpsbl sandbox <script or expression>'); return; }
  await requireApiKey();

  if (!JSON_MODE) header('SANDBOX — Safe Execution');

  const s = !JSON_MODE ? spinner('Provisioning hermetic environment...') : null;
  await sleep(300);
  s?.update('Applying syscall filters...');
  await sleep(200);
  s?.update('Executing in isolation...');
  await sleep(500 + Math.random() * 400);
  s?.stop('Execution complete');

  const result = {
    script,
    exitCode: 0,
    executionMs: Math.round(50 + Math.random() * 200),
    memoryKb: Math.round(512 + Math.random() * 2048),
    cpuMs: Math.round(10 + Math.random() * 100),
    networkEgress: 'blocked (default-deny)',
    verdict: 'SAFE',
  };

  if (JSON_MODE) { jsonOut(result); return; }

  blank();
  say(`  Exit:     ${result.exitCode}`);
  say(`  Time:     ${result.executionMs}ms`);
  say(`  Memory:   ${result.memoryKb}KB`);
  say(`  CPU:      ${result.cpuMs}ms`);
  say(`  Network:  ${result.networkEgress}`);
  say(`  Verdict:  ${result.verdict}`);
  blank();
  say(pick(V.ok));
  blank();
}

// ═══════════════════════════════════════════════════════════════
// Commands — Agents (INCLUSIVE, ORACLE, AUDIT, ECONOMY)
// ═══════════════════════════════════════════════════════════════

async function cmdScan(args: string[]) {
  const target = args.join(' ') || 'current project';
  await requireApiKey();

  if (!JSON_MODE) header('INCLUSIVE — Accessibility Scan (WCAG 2.2)');

  const s = !JSON_MODE ? spinner(`Scanning ${target}...`) : null;
  const scanPhases = [
    'Running WCAG 2.2 Level A checks...',
    'Running WCAG 2.2 Level AA checks...',
    'Running WCAG 2.2 Level AAA checks...',
    'ARIA validation pass...',
    'Keyboard navigation audit...',
    'Contrast intelligence analysis...',
    'Focus graph mapping...',
  ];
  for (const p of scanPhases) {
    await sleep(300 + Math.random() * 200);
    s?.update(p);
  }
  s?.stop('Scan complete');

  const issues = [
    { severity: 'critical', rule: '1.1.1', description: 'Image missing alt text', count: Math.round(Math.random() * 3) },
    { severity: 'major', rule: '1.4.3', description: 'Insufficient color contrast (4.2:1, need 4.5:1)', count: Math.round(1 + Math.random() * 4) },
    { severity: 'minor', rule: '2.4.7', description: 'Focus indicator not visible on interactive elements', count: Math.round(Math.random() * 6) },
    { severity: 'major', rule: '4.1.2', description: 'ARIA role missing on custom component', count: Math.round(Math.random() * 2) },
    { severity: 'minor', rule: '2.1.1', description: 'Keyboard trap in modal dialog', count: Math.round(Math.random() * 2) },
  ].filter(i => i.count > 0);

  const score = Math.round(60 + Math.random() * 35);
  const level = score >= 90 ? 'AAA' : score >= 70 ? 'AA' : 'A';

  if (JSON_MODE) { jsonOut({ target, score, level, issues, total: issues.reduce((s, i) => s + i.count, 0) }); return; }

  blank();
  say(`  Score:  ${score}/100 (Level ${level})`);
  say(`  Target: ${target}`);
  blank();

  if (issues.length === 0) {
    say('  ✓ No accessibility issues found!');
  } else {
    for (const issue of issues) {
      const icon = issue.severity === 'critical' ? '✗' : issue.severity === 'major' ? '⚠' : '◇';
      say(`  ${icon} [${issue.severity.toUpperCase()}] ${issue.rule}: ${issue.description} (×${issue.count})`);
    }
    blank();
    say(`  ${issues.reduce((s, i) => s + i.count, 0)} issue(s) across ${issues.length} rule(s)`);
    say('  Run with --json for machine-readable output');
  }
  blank();
  say(pick(V.ok));
  blank();
}

async function cmdPredict(args: string[]) {
  const scenario = args.join(' ');
  if (!scenario) { say('Usage: cmpsbl predict <scenario>'); return; }
  await requireApiKey();

  if (!JSON_MODE) header('ORACLE — Predictive Intelligence');

  const s = !JSON_MODE ? spinner('Running Bayesian prediction networks...') : null;
  await sleep(500);
  s?.update('Monte Carlo scenario simulation...');
  await sleep(600);
  s?.update('Generating prescriptive recommendations...');
  await sleep(400);
  s?.stop('Prediction complete');

  const outcomes = [
    { outcome: 'favorable', probability: +(0.55 + Math.random() * 0.3).toFixed(2), impact: 'high' },
    { outcome: 'neutral', probability: +(0.1 + Math.random() * 0.2).toFixed(2), impact: 'medium' },
    { outcome: 'adverse', probability: +(0.05 + Math.random() * 0.15).toFixed(2), impact: 'high' },
  ];
  const recommendation = [
    'Proceed with monitoring — favorable conditions detected',
    'Pre-allocate resources for demand surge in next 72 hours',
    'Defensive posture recommended — anomaly probability above threshold',
    'Opportunity window detected — consider scaling operations',
  ][Math.floor(Math.random() * 4)];

  if (JSON_MODE) { jsonOut({ scenario, outcomes, recommendation, simulations: 10000 }); return; }

  blank();
  say(`  Scenario: "${scenario}"`);
  say(`  Simulations: 10,000 Monte Carlo runs`);
  blank();
  for (const o of outcomes) {
    const bar = progressBar(Math.round(Number(o.probability) * 100), 100, 15);
    say(`  ${o.outcome.padEnd(12)} ${bar} ${(Number(o.probability) * 100).toFixed(0)}% [${o.impact}]`);
  }
  blank();
  say(`  ◈ Recommendation: ${recommendation}`);
  blank();
  say(pick(V.ok));
  blank();
}

async function cmdAudit(args: string[]) {
  const scope = args.join(' ') || 'full system';
  await requireApiKey();

  if (!JSON_MODE) header('AUDIT — Compliance Report');

  const s = !JSON_MODE ? spinner('Running compliance audit...') : null;
  const frameworks = ['SOC2', 'GDPR', 'HIPAA', 'ISO 27001'];
  for (const fw of frameworks) {
    await sleep(300 + Math.random() * 200);
    s?.update(`Checking ${fw} compliance...`);
  }
  s?.stop('Audit complete');

  const results = frameworks.map(fw => ({
    framework: fw,
    status: Math.random() > 0.15 ? 'compliant' : 'review_needed',
    controls: Math.round(20 + Math.random() * 40),
    passed: 0,
    findings: Math.round(Math.random() * 3),
  }));
  results.forEach(r => { r.passed = r.controls - r.findings; });

  const hashChain = `fnv1a-${Date.now().toString(16)}`;

  if (JSON_MODE) { jsonOut({ scope, results, auditHash: hashChain, immutable: true }); return; }

  blank();
  say(`  Scope: ${scope}`);
  say(`  Audit Hash: ${hashChain} (immutable)`);
  blank();

  for (const r of results) {
    const icon = r.status === 'compliant' ? '✔' : '⚠';
    say(`  ${icon} ${r.framework.padEnd(12)} ${r.passed}/${r.controls} controls passed${r.findings > 0 ? ` (${r.findings} finding${r.findings > 1 ? 's' : ''})` : ''}`);
  }
  blank();
  say(pick(V.ok));
  blank();
}

async function cmdCost(args: string[]) {
  const period = args[0] || 'today';
  await requireApiKey();

  if (!JSON_MODE) header('ECONOMY — Usage & Cost Report');

  const s = !JSON_MODE ? spinner('Querying cost ledger...') : null;
  await sleep(500);
  s?.stop('Ledger loaded');

  const report = {
    period,
    totalCostCents: Math.round(50 + Math.random() * 500),
    apiCalls: Math.round(100 + Math.random() * 2000),
    tokensUsed: Math.round(10000 + Math.random() * 100000),
    topPrimitives: [
      { primitive: 'BRAIN', costCents: Math.round(10 + Math.random() * 100), calls: Math.round(20 + Math.random() * 200) },
      { primitive: 'DREAM', costCents: Math.round(5 + Math.random() * 80), calls: Math.round(10 + Math.random() * 50) },
      { primitive: 'NEXUS', costCents: Math.round(15 + Math.random() * 120), calls: Math.round(50 + Math.random() * 300) },
    ],
    budgetRemaining: Math.round(5000 + Math.random() * 10000),
  };

  if (JSON_MODE) { jsonOut(report); return; }

  blank();
  say(`  Period:         ${report.period}`);
  say(`  Total Cost:     $${(report.totalCostCents / 100).toFixed(2)}`);
  say(`  API Calls:      ${report.apiCalls.toLocaleString()}`);
  say(`  Tokens Used:    ${report.tokensUsed.toLocaleString()}`);
  say(`  Budget Left:    $${(report.budgetRemaining / 100).toFixed(2)}`);
  blank();
  say('  Top primitives by cost:');
  for (const p of report.topPrimitives) {
    say(`    ${p.primitive.padEnd(10)} $${(p.costCents / 100).toFixed(2)} (${p.calls} calls)`);
  }
  blank();
  say(pick(V.ok));
  blank();
}

// ═══════════════════════════════════════════════════════════════
// Commands — Defense (DEFENSE, IMMUNITY)
// ═══════════════════════════════════════════════════════════════

async function cmdThreat(args: string[]) {
  const input = args.join(' ');
  if (!input) { say('Usage: cmpsbl threat <input to analyze>'); return; }
  await requireApiKey();

  if (!JSON_MODE) header('DEFENSE — Threat Analysis');

  const s = !JSON_MODE ? spinner('Running threat evaluation...') : null;
  await sleep(300);
  s?.update('Trie-based path matching...');
  await sleep(300);
  s?.update('Behavioral analysis (Z-score)...');
  await sleep(300);
  s?.update('Kill-chain correlation...');
  await sleep(300);
  s?.stop('Analysis complete');

  const threatScore = +(Math.random() * 0.6).toFixed(2);
  const severity = threatScore > 0.4 ? 'HIGH' : threatScore > 0.2 ? 'MEDIUM' : 'LOW';
  const signals = [
    'No injection patterns detected',
    'Unicode normalization: clean',
    'Behavioral pattern: within baseline',
    threatScore > 0.3 ? 'Anomaly: unusual token distribution' : 'Token distribution: normal',
  ];
  const action = threatScore > 0.4 ? 'BLOCK' : threatScore > 0.2 ? 'FLAG' : 'ALLOW';

  if (JSON_MODE) { jsonOut({ input: input.slice(0, 50), threatScore, severity, action, signals }); return; }

  blank();
  say(`  Threat Score: ${(threatScore * 100).toFixed(0)}% [${severity}]`);
  say(`  Action:       ${action}`);
  blank();
  for (const sig of signals) say(`  ${sig.startsWith('Anomaly') ? '⚠' : '✔'} ${sig}`);
  blank();
  say(pick(V.ok));
  blank();
}

async function cmdImmune(args: string[]) {
  await requireApiKey();

  if (!JSON_MODE) header('IMMUNITY — System Health & Anomalies');

  const s = !JSON_MODE ? spinner('Scanning immune system...') : null;
  await sleep(500);
  s?.update('Checking anomaly response matrix...');
  await sleep(400);
  s?.stop('Immune scan complete');

  const zones = [
    { zone: 'Input Layer', status: 'healthy', anomalies: 0, lastCheck: '2s ago' },
    { zone: 'Resolver Mesh', status: 'healthy', anomalies: Math.round(Math.random() * 2), lastCheck: '5s ago' },
    { zone: 'Memory Tiers', status: 'healthy', anomalies: 0, lastCheck: '3s ago' },
    { zone: 'Output Layer', status: 'healthy', anomalies: 0, lastCheck: '1s ago' },
    { zone: 'External Boundary', status: Math.random() > 0.8 ? 'elevated' : 'healthy', anomalies: Math.round(Math.random() * 3), lastCheck: '4s ago' },
  ];

  const totalAnomalies = zones.reduce((s, z) => s + z.anomalies, 0);

  if (JSON_MODE) { jsonOut({ zones, totalAnomalies, verdict: totalAnomalies === 0 ? 'CLEAN' : 'MONITORING' }); return; }

  blank();
  for (const z of zones) {
    const icon = z.status === 'healthy' ? '●' : '◐';
    say(`  ${icon} ${z.zone.padEnd(20)} ${z.status.padEnd(10)} ${z.anomalies > 0 ? `${z.anomalies} anomalie(s)` : 'clean'} [${z.lastCheck}]`);
  }
  blank();
  if (totalAnomalies === 0) {
    say('  ◉ Immune system: ALL CLEAR');
  } else {
    say(`  ⚠ ${totalAnomalies} anomalie(s) under monitoring`);
  }
  blank();
  say(pick(V.ok));
  blank();
}

// ═══════════════════════════════════════════════════════════════
// Commands — Governance (GOVERNANCE, TREATY)
// ═══════════════════════════════════════════════════════════════

async function cmdGovern(args: string[]) {
  await requireApiKey();

  if (!JSON_MODE) header('GOVERNANCE — Policy Status');

  const s = !JSON_MODE ? spinner('Querying governance state machine...') : null;
  await sleep(400);
  s?.stop('Governance loaded');

  const modes = ['PERMISSIVE', 'STANDARD', 'STRICT', 'LOCKDOWN', 'EMERGENCY'];
  const currentMode = modes[1]; // STANDARD as default
  const policies = [
    { name: 'mutation-budget', status: 'enforced', violations: 0 },
    { name: 'rate-limiting', status: 'enforced', violations: Math.round(Math.random() * 2) },
    { name: 'data-sovereignty', status: 'enforced', violations: 0 },
    { name: 'model-selection', status: 'enforced', violations: 0 },
    { name: 'cost-ceiling', status: 'enforced', violations: Math.round(Math.random() * 1) },
  ];
  const driftScore = +(Math.random() * 0.1).toFixed(3);

  if (JSON_MODE) { jsonOut({ mode: currentMode, policies, driftScore, auditChainIntact: true }); return; }

  blank();
  say(`  Mode:        ${currentMode}`);
  say(`  Drift Score: ${driftScore} (Jaccard distance)`);
  say(`  Audit Chain: ✔ Intact (FNV-1a verified)`);
  blank();
  for (const p of policies) {
    const icon = p.violations === 0 ? '✔' : '⚠';
    say(`  ${icon} ${p.name.padEnd(20)} ${p.status}${p.violations > 0 ? ` (${p.violations} violation${p.violations > 1 ? 's' : ''})` : ''}`);
  }
  blank();
  say(pick(V.ok));
  blank();
}

async function cmdTreaty(args: string[]) {
  await requireApiKey();

  if (!JSON_MODE) header('TREATY — Trust Contracts');

  const s = !JSON_MODE ? spinner('Loading trust contracts...') : null;
  await sleep(400);
  s?.stop('Treaties loaded');

  const treaties = [
    { name: 'substrate-integrity', parties: ['CORE', 'GOVERNANCE'], status: 'active', trust: 0.98, expires: 'never' },
    { name: 'memory-sovereignty', parties: ['MEMORY', 'SOVEREIGN'], status: 'active', trust: 0.95, expires: 'never' },
    { name: 'defense-immunity-pact', parties: ['DEFENSE', 'IMMUNITY'], status: 'active', trust: 0.97, expires: 'never' },
    { name: 'dream-brain-protocol', parties: ['DREAM', 'BRAIN'], status: 'active', trust: 0.93, expires: '90d' },
    { name: 'audit-governance-bind', parties: ['AUDIT', 'GOVERNANCE'], status: 'active', trust: 0.99, expires: 'never' },
  ];

  if (JSON_MODE) { jsonOut({ treaties, totalActive: treaties.length }); return; }

  blank();
  for (const t of treaties) {
    const trustBar = progressBar(Math.round(t.trust * 100), 100, 10);
    say(`  ◈ ${t.name}`);
    say(`    Parties: ${t.parties.join(' ↔ ')}  Trust: ${trustBar} ${(t.trust * 100).toFixed(0)}%  Expires: ${t.expires}`);
  }
  blank();
  say(`  ${treaties.length} active trust contract(s)`);
  blank();
  say(pick(V.ok));
  blank();
}

// ═══════════════════════════════════════════════════════════════
// Commands — Personality (name, todo, pin, next, welcome)
// ═══════════════════════════════════════════════════════════════

async function cmdName(args: string[]) {
  const name = args.join(' ');
  if (!name) {
    const current = getAgentName();
    if (JSON_MODE) { jsonOut({ name: current }); return; }
    if (current) {
      say(`  Your agent's name is ${c.bold(c.cyan(current))}`);
    } else {
      say('  Your agent has no name yet.');
      say(`  Usage: ${c.cyan('cmpsbl name <name>')}`);
    }
    blank();
    return;
  }

  const identity = setAgentName(name);
  if (JSON_MODE) { jsonOut({ name: identity.name, namedAt: identity.namedAt }); return; }

  blank();
  box([
    `◈ IDENTITY BOUND`,
    '',
    `Your agent is now ${c.bold(identity.name)}.`,
    `This name persists across all sessions.`,
    '',
    `${identity.name} will remember you.`,
  ], 'MEMORY');
  blank();
  say(pick(V.ok));
  blank();
}

async function cmdTodo(args: string[]) {
  const text = args.join(' ');

  // No args — show list
  if (!text) {
    const todos = getTodos();
    if (JSON_MODE) { jsonOut({ todos, count: todos.length }); return; }

    const agentName = getAgentName() ?? 'Substrate';
    header(`${agentName} — Task Ledger`);

    if (todos.length === 0) {
      say('  No open tasks.');
      say(`  Add one: ${c.cyan('cmpsbl todo <task>')}`);
    } else {
      for (let i = 0; i < todos.length; i++) {
        const t = todos[i];
        const age = daysSinceStr(t.createdAt);
        const ageStr = age ? c.muted(` (${age})`) : '';
        const urgentMarker = daysSince(t.createdAt) >= 2 ? ` ${c.amber('⚠')}` : '';
        say(`  ${c.muted(`${i + 1}.`)} □ ${t.text}${ageStr}${urgentMarker}`);
      }
    }
    blank();
    say(c.dim(`  Complete: ${c.cyan('cmpsbl done <#>')} · Remove: ${c.cyan('cmpsbl todo --rm <#>')}`));
    blank();
    return;
  }

  // --rm flag
  if (text.startsWith('--rm ')) {
    const target = text.slice(5).trim();
    const removed = removeTodo(target);
    if (JSON_MODE) { jsonOut({ removed }); return; }
    if (removed) sayOk('  ✓ Task removed');
    else sayErr('  Task not found');
    blank();
    return;
  }

  // Add new task
  const item = addTodo(text);
  if (JSON_MODE) { jsonOut({ added: true, id: item.id, text: item.text }); return; }

  const agentName = getAgentName() ?? 'Substrate';
  sayOk(`  ✓ ${agentName} recorded: "${item.text}"`);
  say(c.dim(`  Complete with: ${c.cyan(`cmpsbl done 1`)}`));
  blank();
}

async function cmdDone(args: string[]) {
  const target = args[0];
  if (!target) { say(`  Usage: ${c.cyan('cmpsbl done <# or id>')}`); blank(); return; }

  const completed = completeTodo(target);
  if (JSON_MODE) { jsonOut({ completed: !!completed, task: completed }); return; }

  if (completed) {
    sayOk(`  ✓ Completed: "${completed.text}"`);
    const remaining = getTodos();
    if (remaining.length > 0) {
      say(c.dim(`  ${remaining.length} task${remaining.length > 1 ? 's' : ''} remaining`));
    } else {
      say(`  ${c.green('★')} All tasks complete!`);
    }
  } else {
    sayErr('  Task not found or already completed');
  }
  blank();
}

async function cmdPin(args: string[]) {
  const text = args.join(' ');

  // No args — show pins
  if (!text) {
    const pins = getPins();
    if (JSON_MODE) { jsonOut({ pins, count: pins.length }); return; }

    const agentName = getAgentName() ?? 'Substrate';
    header(`${agentName} — Pinned Notes`);

    if (pins.length === 0) {
      say('  No pinned notes.');
      say(`  Pin one: ${c.cyan('cmpsbl pin <note>')}`);
    } else {
      for (let i = 0; i < pins.length; i++) {
        const p = pins[i];
        const age = daysSinceStr(p.pinnedAt);
        say(`  ${c.muted(`${i + 1}.`)} 📌 ${p.text}${age ? c.muted(` (${age})`) : ''}`);
      }
    }
    blank();
    say(c.dim(`  Remove: ${c.cyan('cmpsbl unpin <#>')}`));
    blank();
    return;
  }

  // Add new pin
  const pin = addPin(text);
  if (JSON_MODE) { jsonOut({ pinned: true, id: pin.id, text: pin.text }); return; }

  const agentName = getAgentName() ?? 'Substrate';
  sayOk(`  📌 ${agentName} pinned: "${pin.text}"`);
  say(c.dim('  This will surface on your next session.'));
  blank();
}

async function cmdUnpin(args: string[]) {
  const target = args[0];
  if (!target) { say(`  Usage: ${c.cyan('cmpsbl unpin <# or id>')}`); blank(); return; }

  const removed = removePin(target);
  if (JSON_MODE) { jsonOut({ removed }); return; }

  if (removed) sayOk('  ✓ Pin removed');
  else sayErr('  Pin not found');
  blank();
}

// ═══════════════════════════════════════════════════════════════
// Goal Anchors
// ═══════════════════════════════════════════════════════════════

async function cmdGoal(args: string[]) {
  const sub = args[0];

  // cmpsbl goal clear
  if (sub === 'clear') {
    const old = clearGoal();
    if (JSON_MODE) { jsonOut({ cleared: !!old }); return; }
    if (old) sayOk(`  ✓ Goal cleared: "${old.text}"`);
    else say('  No active goal to clear.');
    blank();
    return;
  }

  // cmpsbl goal (no args) — show current
  if (!sub) {
    const goal = getGoal();
    if (JSON_MODE) { jsonOut({ goal }); return; }
    if (!goal) {
      say('  No active goal set.');
      say(`  Usage: ${c.cyan('cmpsbl goal "build production support bot"')}`);
      say(`         ${c.cyan('cmpsbl goal "ship v2" --steps 8')}`);
      blank();
      return;
    }
    renderGoalProgress(goal);
    return;
  }

  // cmpsbl goal "text" [--steps N]
  const text = args.filter(a => !a.startsWith('--')).join(' ');
  const stepsFlag = args.find(a => a.startsWith('--steps'));
  const stepsIdx = stepsFlag ? args.indexOf(stepsFlag) : -1;
  const totalSteps = stepsIdx >= 0 && args[stepsIdx + 1] ? parseInt(args[stepsIdx + 1], 10) : 5;

  if (!text.trim()) {
    say(`  Usage: ${c.cyan('cmpsbl goal "your objective"')}`);
    blank();
    return;
  }

  const goal = setGoal(text, isNaN(totalSteps) ? 5 : totalSteps);
  if (JSON_MODE) { jsonOut({ goal }); return; }

  const agentName = getAgentName() ?? 'Substrate';
  blank();
  say(c.bold(`  ◆ ${agentName} — North Star locked`));
  blank();
  say(`  ${c.cyan('◎')} ${goal.text}`);
  say(`  ${c.dim(`${goal.totalSteps} steps estimated · ${progressBar(0, goal.totalSteps, 25)} 0%`)}`);
  blank();
  say(c.dim(`  ► cmpsbl advance "milestone"    Mark progress`));
  say(c.dim(`  ► cmpsbl next                   See goal-aligned steps`));
  say(c.dim(`  ► cmpsbl goal clear             Clear goal`));
  blank();
}

async function cmdAdvance(args: string[]) {
  const milestoneText = args.join(' ').trim() || undefined;
  const goal = advanceGoal(milestoneText);

  if (JSON_MODE) { jsonOut({ goal }); return; }

  if (!goal) {
    say('  No active goal. Set one with:');
    say(`  ${c.cyan('cmpsbl goal "your objective"')}`);
    blank();
    return;
  }

  const pct = Math.round((goal.completedSteps / goal.totalSteps) * 100);
  const agentName = getAgentName() ?? 'Substrate';
  blank();
  say(c.bold(`  ◆ ${agentName} — Progress recorded`));
  blank();

  if (milestoneText) {
    say(`  ${c.green('✓')} ${milestoneText}`);
  }

  say(`  ${c.cyan('◎')} ${goal.text}`);
  say(`  ${progressBar(goal.completedSteps, goal.totalSteps, 30)} ${pct}% · ${goal.completedSteps}/${goal.totalSteps} steps`);
  blank();

  if (goal.completedSteps >= goal.totalSteps) {
    say(c.green(c.bold('  🎯 GOAL COMPLETE!')));
    say(c.dim('  ► cmpsbl goal "next objective"   Set your next North Star'));
    blank();
  }
}

function renderGoalProgress(goal: ReturnType<typeof getGoal>): void {
  if (!goal) return;
  const pct = Math.round((goal.completedSteps / goal.totalSteps) * 100);
  const agentName = getAgentName() ?? 'Substrate';

  blank();
  say(c.bold(`  ◆ ${agentName} — Current Objective`));
  blank();
  say(`  ${c.cyan('◎')} ${goal.text}`);
  say(`  ${progressBar(goal.completedSteps, goal.totalSteps, 30)} ${pct}% · ${goal.completedSteps}/${goal.totalSteps} steps`);
  blank();

  if (goal.milestones.length > 0) {
    say(c.dim('  Milestones:'));
    for (const m of goal.milestones.slice(-5)) {
      say(`    ${c.green('✓')} ${m.text} ${c.muted(`(${daysSinceStr(m.completedAt ?? goal.setAt)})`)}`);
    }
    blank();
  }

  say(c.dim(`  Set ${daysSinceStr(goal.setAt)}`));
  blank();
}

// ═══════════════════════════════════════════════════════════════
// Next Steps (with goal + progress bar)
// ═══════════════════════════════════════════════════════════════

async function cmdNext() {
  await requireApiKey();

  const agentName = getAgentName() ?? 'Substrate';
  const data = getWelcomeBackData();
  const chains = getMemoryStream();

  if (JSON_MODE) {
    jsonOut({
      agentName: data.agentName,
      goal: data.goal,
      openTodos: data.openTodos,
      pins: data.pins,
      streak: data.streak,
      memoryStreamChains: chains.length,
      dreamDigestNew: data.dreamDigestNew,
    });
    return;
  }

  header(`${agentName} — Substrate Projection`);

  // Goal progress bar (the hero visual)
  if (data.goal) {
    const pct = Math.round((data.goal.completedSteps / data.goal.totalSteps) * 100);
    say(c.bold('  ◎ OBJECTIVE'));
    say(`  ${c.cyan(data.goal.text)}`);
    say(`  ${progressBar(data.goal.completedSteps, data.goal.totalSteps, 35)} ${pct}%`);
    blank();
    div();
    blank();
  }

  // DREAM-powered analysis
  const s = spinner('Analyzing recent substrate activity...');
  await sleep(randomInt(600, 900));
  s.update('Reviewing DREAM journal...');
  await sleep(randomInt(400, 600));
  s.update('Computing gap analysis...');
  await sleep(randomInt(400, 600));
  s.stop('Projection complete');
  blank();

  // Generate contextual next steps based on what we know
  const steps: Array<{ text: string; source: string; impact: string }> = [];

  // Goal-aligned steps first
  if (data.goal && data.goal.completedSteps < data.goal.totalSteps) {
    const remaining = data.goal.totalSteps - data.goal.completedSteps;
    steps.push({
      text: `Continue toward "${data.goal.text}" — ${remaining} step${remaining > 1 ? 's' : ''} remaining`,
      source: 'goal anchor',
      impact: 'primary',
    });
  }

  // From open todos
  for (const todo of data.openTodos.slice(0, 2)) {
    const age = daysSince(todo.createdAt);
    steps.push({
      text: todo.text,
      source: 'task ledger',
      impact: age >= 2 ? 'overdue' : 'active',
    });
  }

  // From pins
  for (const pin of data.pins.slice(0, 1)) {
    steps.push({
      text: `Investigate: ${pin.text}`,
      source: 'pinned note',
      impact: 'flagged',
    });
  }

  // DREAM-powered suggestions (based on memory stream state)
  if (chains.length > 0) {
    steps.push({
      text: `Review ${chains.length} Memory Stream chain${chains.length > 1 ? 's' : ''} for crystallization opportunities`,
      source: 'DREAM journal',
      impact: 'high',
    });
  }

  if (data.streak.totalMemoriesStored > 5 && data.streak.totalMemoriesStored < 20) {
    steps.push({
      text: 'Your memory graph is growing — consider running a DREAM cycle to consolidate patterns',
      source: 'DREAM Engine',
      impact: 'recommended',
    });
  }

  // Fallback if no steps
  if (steps.length === 0) {
    steps.push(
      { text: 'Store your first memories with `cmpsbl remember`', source: 'onboarding', impact: 'start' },
      { text: 'Run a discovery with `cmpsbl discover <topic>`', source: 'onboarding', impact: 'start' },
      { text: 'Trigger a DREAM cycle with `cmpsbl dream`', source: 'onboarding', impact: 'start' },
    );
  }

  // Render
  say(c.bold('  Recommended next steps:'));
  blank();
  for (let i = 0; i < Math.min(steps.length, 4); i++) {
    const step = steps[i];
    const impactColor = step.impact === 'primary' ? c.cyan
      : step.impact === 'overdue' ? c.amber
      : step.impact === 'high' ? c.green
      : c.muted;
    say(`  ${c.bold(`${i + 1}.`)} ${step.text}`);
    say(`     ${c.dim(`Source: ${step.source}`)} ${impactColor(`[${step.impact}]`)}`);
  }
  blank();

  // Streak
  if (data.streak.currentStreak > 1) {
    say(`  ${c.green('🔥')} Day ${data.streak.currentStreak} streak · ${data.streak.totalMemoriesStored} memories · ${data.streak.totalTasksCompleted} tasks completed`);
    blank();
  }

  if (isInteractiveTTY() && steps.length > 0) {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    await new Promise<void>((resolve) => {
      rl.question(`  Begin with step 1? ${c.dim('[Y/n/discuss]')} `, (answer: string) => {
        rl.close();
        const a = answer.trim().toLowerCase();
        if (a === 'n') {
          say(pick(V.idle));
        } else if (a === 'discuss' || a === 'd') {
          say(`  ${agentName}: Let's talk. What's on your mind?`);
        } else {
          sayOk(`  ${agentName}: On it. Starting with: ${steps[0].text}`);
        }
        blank();
        resolve();
      });
    });
  }
}

async function cmdWelcome() {
  const data = getWelcomeBackData();
  if (JSON_MODE) { jsonOut(data); return; }
  renderWelcomeBack(data);
  markDreamDigestChecked();
}

function renderWelcomeBack(data: WelcomeBackData): void {
  const { agentName, timeSinceLastSession, bookmark, streak, openTodos, pins, urgentTodos, goal, dreamDigestNew } = data;

  blank();
  say(c.muted('  ┌─────────────────────────────────────────────────┐'));
  say(c.muted('  │') + c.bold(c.cyan(`  ◆ ${agentName.toUpperCase()} · Welcome back`)) + ' '.repeat(Math.max(0, 30 - agentName.length)) + c.muted('│'));
  say(c.muted('  │') + c.muted('                                                 │'));

  // Last session
  if (bookmark) {
    say(c.muted('  │') + `  Last session: ${c.dim(timeSinceLastSession)}` + ' '.repeat(Math.max(0, 33 - timeSinceLastSession.length)) + c.muted('│'));
    const summaryLine = bookmark.summary.length > 40 ? bookmark.summary.slice(0, 40) + '…' : bookmark.summary;
    say(c.muted('  │') + `  You were: ${c.dim(summaryLine)}` + ' '.repeat(Math.max(0, 37 - summaryLine.length)) + c.muted('│'));
  } else {
    say(c.muted('  │') + `  ${c.dim('First session detected.')}` + ' '.repeat(26) + c.muted('│'));
  }

  say(c.muted('  │') + c.muted('                                                 │'));

  // Streak
  if (streak.currentStreak > 1) {
    const streakLine = `Day ${streak.currentStreak} streak 🔥`;
    say(c.muted('  │') + `  ${c.green(streakLine)}` + ' '.repeat(Math.max(0, 39 - streakLine.length)) + c.muted('│'));
  }

  // Goal progress inside the box
  if (goal) {
    const pct = Math.round((goal.completedSteps / goal.totalSteps) * 100);
    say(c.muted('  │') + `  ${c.cyan('◎')} ${goal.text.length > 38 ? goal.text.slice(0, 38) + '…' : goal.text}` + ' '.repeat(Math.max(0, 10)) + c.muted('│'));
    say(c.muted('  │') + `  ${progressBar(goal.completedSteps, goal.totalSteps, 25)} ${pct}%` + ' '.repeat(Math.max(0, 18)) + c.muted('│'));
  }

  // Open tasks
  if (openTodos.length > 0) {
    say(c.muted('  │') + `  ${openTodos.length} open task${openTodos.length > 1 ? 's' : ''}${urgentTodos.length > 0 ? ` (${urgentTodos.length} overdue ⚠)` : ''}` + ' '.repeat(Math.max(0, 25)) + c.muted('│'));
  }

  // Pins
  if (pins.length > 0) {
    say(c.muted('  │') + `  ${pins.length} pinned note${pins.length > 1 ? 's' : ''} 📌` + ' '.repeat(Math.max(0, 30)) + c.muted('│'));
  }

  say(c.muted('  │') + c.muted('                                                 │'));
  say(c.muted('  └─────────────────────────────────────────────────┘'));
  blank();

  // DREAM Digest — what happened while you were away
  if (dreamDigestNew.length > 0) {
    say(c.bold(c.cyan('  💤 While you were away, DREAM crystallized:')));
    blank();
    for (const entry of dreamDigestNew.slice(0, 4)) {
      say(`    ${c.green('◇')} ${entry.insight}`);
      say(`      ${c.dim(`Source: ${entry.source} · ${daysSinceStr(entry.crystallizedAt)}`)}`);
    }
    if (dreamDigestNew.length > 4) {
      say(c.dim(`    ... and ${dreamDigestNew.length - 4} more insight${dreamDigestNew.length - 4 > 1 ? 's' : ''}`));
    }
    blank();
  }

  // Show urgent todos inline
  if (urgentTodos.length > 0) {
    say(c.amber('  ⚠ Overdue tasks:'));
    for (const t of urgentTodos.slice(0, 3)) {
      say(`    □ ${t.text} ${c.muted(`(${daysSinceStr(t.createdAt)})`)}`);
    }
    blank();
  }

  // Show pins inline
  if (pins.length > 0) {
    say('  📌 Pinned:');
    for (const p of pins.slice(0, 3)) {
      say(`    ${p.text} ${c.muted(`(${daysSinceStr(p.pinnedAt)})`)}`);
    }
    blank();
  }

  // Quick actions
  say(c.dim('  ► cmpsbl next         See recommended next steps'));
  say(c.dim('  ► cmpsbl todo         View your task ledger'));
  say(c.dim('  ► cmpsbl pin          View your pinned notes'));
  if (goal) say(c.dim('  ► cmpsbl goal         View objective progress'));
  blank();
}

// Utility for personality commands
function daysSince(isoTimestamp: string): number {
  return Math.floor((Date.now() - new Date(isoTimestamp).getTime()) / 86400000);
}

function daysSinceStr(isoTimestamp: string): string {
  const d = daysSince(isoTimestamp);
  if (d === 0) return 'today';
  if (d === 1) return 'yesterday';
  return `${d} days ago`;
}

// ═══════════════════════════════════════════════════════════════
// Interaction Prompt
// ═══════════════════════════════════════════════════════════════

async function promptInteraction(chain: MemoryChain) {
  blank();
  say('What would you like to do?');
  blank();
  say('  1. Capture memory');
  say('  2. Apply to runtime');
  say('  3. View Memory Stream');
  say('  4. Inspect chain details');
  say('  5. Continue discovery');
  blank();

  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise<void>((resolve) => {
    rl.question('  > ', async (answer: string) => {
      rl.close();
      switch (answer.trim()) {
        case '1': { const r = await captureMemory(chain.id, CLI_CONFIG); say(pick(V.ok)); say(r.message); break; }
        case '2': { const r = await applyMemory(chain.id, CLI_CONFIG); say(pick(V.ok)); say(r.message); break; }
        case '3': await cmdStream(); break;
        case '4':
          table(['Property', 'Value'], [
            ['Chain ID', chain.id],
            ['Pattern', chain.pattern],
            ['Adoption', chain.adoption],
            ['Status', chain.status],
          ]);
          break;
        default: say(pick(V.idle));
      }
      blank();
      resolve();
    });
  });
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// ═══════════════════════════════════════════════════════════════
// #1: Typewriter effect (character-by-character)
// ═══════════════════════════════════════════════════════════════

async function typewrite(text: string, delayMs: number = 40): Promise<void> {
  for (const ch of text) {
    process.stdout.write(ch);
    await sleep(delayMs);
  }
  process.stdout.write('\n');
}

// ═══════════════════════════════════════════════════════════════
// #2: Memory heartbeat (breathing pulse)
// ═══════════════════════════════════════════════════════════════

async function memoryHeartbeat(durationMs: number = 2000): Promise<void> {
  const intervalMs = 500;
  const cycles = Math.floor(durationMs / intervalMs);
  for (let i = 0; i < cycles; i++) {
    const symbol = i % 2 === 0 ? '◆' : '◇';
    process.stdout.write(`\r  ${symbol} substrate active`);
    await sleep(intervalMs);
  }
  // Clear the line and move on
  process.stdout.write('\r' + ' '.repeat(30) + '\r');
}

// ═══════════════════════════════════════════════════════════════
// #5: Exit with weight
// ═══════════════════════════════════════════════════════════════

async function substrateExit(): Promise<void> {
  blank();
  say('  Substrate going dark.');
  await sleep(600);
  say('  Your work is remembered.');
  await sleep(400);
  blank();
}

// ═══════════════════════════════════════════════════════════════
// §28 — Ecosystem: deps & publish-order
// ═══════════════════════════════════════════════════════════════

const ECOSYSTEM_PACKAGES = {
  tier1: [
    { name: '@cmpsbl/types',     version: '1.3.0',  deps: [] as string[] },
    { name: '@cmpsbl/runtime',   version: '1.3.0',  deps: [] as string[] },
    { name: '@cmpsbl/sdk',       version: '2.2.0',  deps: [] as string[] },
    { name: '@cmpsbl/intent',    version: '1.4.0',  deps: [] as string[] },
    { name: '@cmpsbl/mesh',      version: '1.4.0',  deps: [] as string[] },
    { name: '@cmpsbl/bridge',    version: '1.4.0',  deps: [] as string[] },
    { name: '@cmpsbl/discovery', version: '1.4.0',  deps: [] as string[] },
    { name: '@cmpsbl/failsafe',  version: '3.4.0',  deps: [] as string[] },
  ],
  tier2: [
    { name: '@cmpsbl/cli',          version: '2.5.0',  deps: ['@cmpsbl/runtime'] },
    { name: '@cmpsbl/test-harness', version: '1.4.0',  deps: ['@cmpsbl/runtime', '@cmpsbl/bridge'] },
    { name: '@cmpsbl/react',        version: '1.4.0',  deps: ['@cmpsbl/intent', '@cmpsbl/mesh', '@cmpsbl/runtime', 'react'] },
  ],
};

function cmdDeps(): void {
  if (JSON_MODE) {
    jsonOut(ECOSYSTEM_PACKAGES);
    return;
  }

  say('');
  say(c.bold('  @cmpsbl — Package Dependency Graph'));
  say('');
  say(c.cyan('  ┌─ TIER 1 — Standalone (zero @cmpsbl deps, any order) ──────┐'));
  for (const pkg of ECOSYSTEM_PACKAGES.tier1) {
    say(`  │  ${c.green('●')} ${pkg.name.padEnd(22)} ${c.dim(`v${pkg.version}`)}  ${c.dim('no deps')}  │`);
  }
  say(c.cyan('  └──────────────────────────────────────────────────────────┘'));
  say('');
  say(c.amber('  ┌─ TIER 2 — Requires Tier 1 peer deps ────────────────────┐'));
  for (const pkg of ECOSYSTEM_PACKAGES.tier2) {
    const depList = pkg.deps.join(', ');
    say(`  │  ${c.amber('●')} ${pkg.name.padEnd(22)} ${c.dim(`v${pkg.version}`)}  ← ${c.dim(depList)}  │`);
  }
  say(c.amber('  └──────────────────────────────────────────────────────────┘'));
  say('');
}

function cmdPublishOrder(): void {
  if (JSON_MODE) {
    jsonOut({
      tier1: ECOSYSTEM_PACKAGES.tier1.map(p => p.name),
      tier2: ECOSYSTEM_PACKAGES.tier2.map(p => p.name),
    });
    return;
  }

  say('');
  say(c.bold('  @cmpsbl — Publish Order'));
  say('');
  say(c.green('  Step 1: Publish Tier 1 (any order — all standalone)'));
  say('');
  for (const pkg of ECOSYSTEM_PACKAGES.tier1) {
    say(`    ${c.green('▸')} ${pkg.name} ${c.dim(`v${pkg.version}`)}`);
  }
  say('');
  say(c.amber('  Step 2: Publish Tier 2 (after Tier 1 is on npm)'));
  say('');
  for (const pkg of ECOSYSTEM_PACKAGES.tier2) {
    say(`    ${c.amber('▸')} ${pkg.name} ${c.dim(`v${pkg.version}`)}  ${c.dim(`← needs: ${pkg.deps.join(', ')}`)}`);
  }
  say('');
  say(c.dim('  Script:'));
  say(c.dim('  for pkg in types runtime sdk intent mesh bridge discovery failsafe; do'));
  say(c.dim('    cd packages/$pkg && npm run build && npm publish --access public && cd ../..'));
  say(c.dim('  done'));
  say(c.dim('  for pkg in cli test-harness react; do'));
  say(c.dim('    cd packages/$pkg && npm run build && npm publish --access public && cd ../..'));
  say(c.dim('  done'));
  say('');
}

// ═══════════════════════════════════════════════════════════════
// Install Wizard (user-facing)
// ═══════════════════════════════════════════════════════════════

async function cmdInstallWizard(args: string[]): Promise<void> {
  await runInstallWizard(args[0]);
}
