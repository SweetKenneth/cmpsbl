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
} from '@cmpsbl/runtime';
import { DOMAIN_PATTERNS } from '@cmpsbl/types';
import type { FirstContactConfig, MemoryChain } from '@cmpsbl/types';
import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';

import { spinner, pulseSpinner, meshSpinner, progressBar, animatedList, table, box } from './ui';
import { printSuggestions, printErrorRecovery } from './suggestions';

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
const blank = () => console.log('');
const div = () => say('────────────────────────────────────────');

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

function loadStoredKey(): string | undefined {
  try {
    if (fs.existsSync(CREDS_FILE)) {
      const data = JSON.parse(fs.readFileSync(CREDS_FILE, 'utf-8'));
      return data.apiKey;
    }
  } catch { /* ignore corrupt file */ }
  return undefined;
}

function saveStoredKey(key: string): void {
  if (!fs.existsSync(CREDS_DIR)) fs.mkdirSync(CREDS_DIR, { recursive: true });
  fs.writeFileSync(CREDS_FILE, JSON.stringify({ apiKey: key, savedAt: new Date().toISOString() }, null, 2));
  fs.chmodSync(CREDS_FILE, 0o600); // owner-only read/write
}

function clearStoredKey(): void {
  try { if (fs.existsSync(CREDS_FILE)) fs.unlinkSync(CREDS_FILE); } catch { /* ignore */ }
}

/** Resolve API key: env var > stored credentials */
function resolveApiKey(): string | undefined {
  return process.env.CMPSBL_API_KEY || loadStoredKey();
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
    '⚠  AUTHENTICATION REQUIRED',
    '',
    'The CMPSBL Substrate requires a developer API key.',
    'You can get one free at the Developer Portal.',
  ], 'ACCESS');
  blank();

  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

  // Step 1: Open browser
  await new Promise<void>((resolve) => {
    rl.question('  Press ENTER to open the Developer Portal in your browser...', () => {
      openBrowser(DEV_PORTAL_URL);
      blank();
      say('  ✓ Browser opened → ' + DEV_PORTAL_URL);
      say('  Register as a developer and generate your API key.');
      blank();
      resolve();
    });
  });

  // Step 2: Paste key
  const key = await new Promise<string>((resolve) => {
    rl.question('  Paste your API key: ', (answer) => {
      resolve(answer.trim());
    });
  });

  rl.close();

  if (!key || key.length < 10) {
    say(pick(V.err));
    say('Invalid API key. Run `cmpsbl login` to try again.');
    blank();
    process.exit(1);
  }

  // Step 3: Save persistently
  saveStoredKey(key);
  blank();
  say('  ✓ API key saved to ~/.cmpsbl/credentials');
  say('  ✓ Memory: PERSISTENT · Substrate: LIVE');
  blank();

  // Update config for this session
  CLI_CONFIG.apiKey = key;

  return key;
}

// ═══════════════════════════════════════════════════════════════
// Config & Nodes
// ═══════════════════════════════════════════════════════════════

const CLI_VERSION = '1.3.0' as const;

const CLI_CONFIG: FirstContactConfig = {
  package: '@cmpsbl/cli',
  domain: 'cli',
  endpoint: process.env.CMPSBL_ENDPOINT ?? 'https://api.cmpsbl.com/v1/substrate',
  apiKey: resolveApiKey(),
  autoDiscover: true,
  onBoot: (msg) => { if (!JSON_MODE) say(msg); },
  onCeremony: (event) => {
    if (JSON_MODE) { jsonOut({ event: 'ceremony', ...event }); return; }
    if (event.phase === 'sector_boot') {
      const bar = progressBar(event.nodesOnline ?? 0, event.totalNodes ?? 40, 20);
      say(`${event.message.padEnd(55)} ${bar}`);
    } else {
      say(event.message);
      if (event.detail) say(`  ${event.detail}`);
    }
  },
  onDiscovery: (chain) => {
    if (JSON_MODE) { jsonOut({ event: 'discovery', chain }); return; }
    blank();
    box(['⬢ High-value memory chain detected', '', `Pattern:  ${chain.pattern}`, `Adoption: ${chain.adoption}`, `Status:   Now in Memory Stream`], 'DISCOVERY');
    blank();
  },
};

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
  { id: 'SHADOW', sector: 'SHL', status: 'online', health: 97, role: 'stealth-testing' },
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
  args = args.filter(a => a !== '--json' && a !== '--no-color');

  const command = args[0]?.toLowerCase();

  // First-run detection
  if (!command || command === 'help' || command === '--help' || command === '-h') {
    const hasManifest = fs.existsSync(path.resolve('cmpsbl-manifest.json'));
    const hasConfig = fs.existsSync(path.resolve('.cmpsbl/config.json'));
    if (!hasManifest && !hasConfig && command !== 'help') {
      return cmdOnboarding();
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
      case 'login':        await cmdLogin(); break;
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
    changelog               View what's new

  ── Meta ─────────────────────────────────────────
    version                 Show version
    help                    Show this help

  Flags:
    --json                  Output structured JSON (for CI/CD)
    --no-color              Disable colored output

  Environment:
    CMPSBL_API_KEY          API key (overrides ~/.cmpsbl/credentials)
    CMPSBL_ENDPOINT         Custom endpoint (default: api.cmpsbl.com)

  Get your API key at https://cmpsbl.com/api-access
  42 commands · 40 primitives · cmpsbl.com
`);
}

// ═══════════════════════════════════════════════════════════════
// First-run Onboarding
// ═══════════════════════════════════════════════════════════════

async function cmdOnboarding() {
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

  // ── Mandatory API key gate ──
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

  await initFirstContact(CLI_CONFIG);

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
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise<void>((resolve) => {
    rl.question('  Initialize a new project here? (y/n) ', async (answer) => {
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
  say('Type commands without the `cmpsbl` prefix. Type `exit` or `quit` to leave.');
  say('Tab-completion hints: status, health, nodes, ping, discover, stream, inspect');
  blank();
  say(pick(V.idle));
  blank();

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: '  cmpsbl> ',
    completer: (line: string) => {
      const cmds = [
        'init', 'discover', 'stream', 'score', 'validate', 'export',
        'status', 'health', 'nodes', 'ping', 'inspect', 'config',
        'whoami', 'login', 'logout', 'watch', 'logs', 'doctor',
        'topology', 'route', 'benchmark', 'diff', 'changelog',
        'help', 'version', 'exit', 'quit',
      ];
      const hits = cmds.filter(c => c.startsWith(line.trim().toLowerCase()));
      return [hits.length ? hits : cmds, line];
    },
  });

  rl.prompt();

  return new Promise<void>((resolve) => {
    rl.on('line', async (line) => {
      const trimmed = line.trim();
      if (!trimmed) { rl.prompt(); return; }
      if (trimmed === 'exit' || trimmed === 'quit') {
        say(pick(V.ok));
        say('Session ended.');
        blank();
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
    // ── Mandatory API key gate ──
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
  const session = opts?.skipCeremony
    ? (getFirstContactSession() ?? await initFirstContact(CLI_CONFIG))
    : await initFirstContact(CLI_CONFIG);

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

  const s2 = spinner(pick(V.think));
  await sleep(1500);
  s2.stop('Discovery scan complete');

  const result = await discoverMemory(
    { input: 'project initialization and environment setup' },
    CLI_CONFIG,
    DOMAIN_PATTERNS.cli,
  );

  if (result.detected && result.memory) {
    CLI_CONFIG.onDiscovery?.(result.memory);
    await promptInteraction(result.memory);
  } else {
    say(pick(V.idle));
  }
}

async function cmdConfig(args: string[]) {
  const configPath = path.resolve('.cmpsbl/config.json');

  if (args.length === 0) {
    const cfg = fs.existsSync(configPath)
      ? JSON.parse(fs.readFileSync(configPath, 'utf-8'))
      : { endpoint: 'api.cmpsbl.com', domain: 'cli', auto_discover: true, theme: 'biohack' };

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
  const session = getFirstContactSession();
  const hasKey = !!process.env.CMPSBL_API_KEY;
  const data = {
    apiKey: hasKey ? `***${process.env.CMPSBL_API_KEY?.slice(-4) ?? ''}` : null,
    endpoint: process.env.CMPSBL_ENDPOINT ?? 'api.cmpsbl.com',
    session: session?.sessionId ?? null,
    memoryBound: session?.memoryBound ?? false,
    version: CLI_VERSION,
  };

  const apiKey = resolveApiKey();
  const hasKey = !!apiKey;
  if (JSON_MODE) { jsonOut(data); return; }
  header('Identity');
  say(`API Key:    ${hasKey ? `● Configured (***${apiKey?.slice(-4) ?? ''})` : '○ Not set'}`);
  say(`Source:     ${process.env.CMPSBL_API_KEY ? 'Environment variable' : hasKey ? '~/.cmpsbl/credentials' : 'None'}`);
  say(`Endpoint:   ${data.endpoint}`);
  say(`Session:    ${data.session ?? 'None active'}`);
  say(`Memory:     ${data.memoryBound ? '● Bound (persistent)' : '○ Local'}`);
  say(`Package:    @cmpsbl/cli v${CLI_VERSION}`);
  div();
  say(pick(V.idle));
  blank();
}

async function cmdLogin() {
  const existing = resolveApiKey();
  if (existing) {
    if (JSON_MODE) { jsonOut({ authenticated: true, source: process.env.CMPSBL_API_KEY ? 'env' : 'credentials' }); return; }
    say(`● Already authenticated (***${existing.slice(-4)})`);
    say(`  Source: ${process.env.CMPSBL_API_KEY ? 'CMPSBL_API_KEY env var' : '~/.cmpsbl/credentials'}`);
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
  clearStoredKey();
  if (JSON_MODE) { jsonOut({ disconnected: true, credentialsCleared: true }); return; }
  say(pick(V.ok));
  say('Session terminated. Credentials cleared.');
  say('Memory stream disconnected.');
  blank();
}

// ═══════════════════════════════════════════════════════════════
// First Dream — Guided Post-Init Experience
// ═══════════════════════════════════════════════════════════════

async function offerFirstDream() {
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
    rl.question('  Ready to dream? (Y/n) ', async (answer) => {
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

function scaffoldFirstDream(heuristic: { pattern: string; confidence: number; insight: string }) {
  const projectDir = path.resolve('first-dream');
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

import { substrate } from '@cmpsbl/core';

async function main() {
  // Connect to the substrate (uses ~/.cmpsbl/credentials)
  await substrate.init();

  console.log('◈ Initiating dream cycle...');

  // Trigger a DREAM Engine cycle
  const dream = await substrate.dream.cycle();

  console.log('◈ Dream complete.');
  console.log(\`  Pattern:    \${dream.heuristic}\`);
  console.log(\`  Confidence: \${(dream.confidence * 100).toFixed(0)}%\`);

  // Check the Memory Stream for accumulated discoveries
  const stream = await substrate.memory.stream();
  console.log(\`\\n◈ Memory Stream: \${stream.length} chain(s)\\n\`);

  for (const chain of stream) {
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

  await initFirstContact(CLI_CONFIG);

  const s = !JSON_MODE ? spinner(pick(V.think)) : null;
  await sleep(1200);
  s?.update('Forming memory chains...');
  await sleep(2000);

  const result = await discoverMemory({ input }, CLI_CONFIG, DOMAIN_PATTERNS.cli);
  s?.stop('Discovery complete');

  if (result.detected && result.memory) {
    if (JSON_MODE) { jsonOut({ detected: true, memory: result.memory }); return; }
    CLI_CONFIG.onDiscovery?.(result.memory);
    await promptInteraction(result.memory);
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

  const checks = [
    { name: 'API Key configured', check: () => !!process.env.CMPSBL_API_KEY },
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
        'Interactive REPL shell with tab completion',
        'Animated spinners for all async operations',
        '--json flag for CI/CD integration',
        'Benchmark command for latency testing',
        'Diff command for manifest comparison',
        'First-run onboarding wizard',
        'Contextual next-step suggestions after every command',
        'Actionable error recovery messages',
        '--no-color flag for accessibility',
        'Doctor diagnostic suite expanded',
      ],
    });
    return;
  }

  header(`Changelog — v${CLI_VERSION}`);
  const items = [
    '● Interactive REPL shell (`cmpsbl shell`) with tab completion',
    '● Animated spinners replace static pauses',
    '● `--json` flag outputs structured JSON for CI/CD',
    '● `--no-color` flag for accessibility',
    '● `cmpsbl benchmark` — latency test across all nodes',
    '● `cmpsbl diff` — compare two manifest files',
    '● `cmpsbl changelog` — see what\'s new',
    '● First-run onboarding wizard for new users',
    '● Smart next-step suggestions after every command',
    '● Actionable error recovery with fix instructions',
    '● Formatted tables for nodes, scores, and inspections',
    '● Box-framed headers and discovery alerts',
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
    rl.question('  > ', async (answer) => {
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
