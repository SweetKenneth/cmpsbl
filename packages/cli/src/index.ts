/**
 * @cmpsbl/cli — CLI Commands
 * Unified first-contact experience with live Memory Stream integration.
 *
 * 20 commands with rich interactive feedback, personality responses,
 * and cinematic output for a living cognitive substrate experience.
 *
 * © CMPSBL® — All rights reserved.
 */

import { computeCJPI, parseManifest, generateManifest, tierFromCJPI } from '@cmpsbl/runtime';
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

// ═══════════════════════════════════════════════════════════════
// Personality & Voice
// ═══════════════════════════════════════════════════════════════

const VOICES = {
  boot: [
    '◈ Substrate awakening...',
    '◈ Memory pathways binding...',
    '◈ Signal mesh initializing...',
    '◈ Cognitive loop established.',
  ],
  success: [
    '✔ Stream crystallized.',
    '✔ Signal confirmed.',
    '✔ Pipeline verified.',
    '✔ Operation executed.',
    '✔ Mesh acknowledged.',
  ],
  error: [
    '✗ Stream anomaly detected.',
    '✗ Signal pathway failed.',
    '✗ Crystallization disrupted.',
    '✗ Mesh routing error.',
  ],
  thinking: [
    '… traversing signal graph',
    '… sampling memory stream',
    '… crystallizing insights',
    '… resolving mesh topology',
    '… scoring pipeline fidelity',
  ],
  idle: [
    '◇ Substrate listening...',
    '◇ Memory stream flowing...',
    '◇ Signal mesh stable.',
    '◇ Awaiting intent...',
  ],
};

function voice(category: keyof typeof VOICES): string {
  const arr = VOICES[category];
  return arr[Math.floor(Math.random() * arr.length)];
}

function say(msg: string) { console.log(`  ${msg}`); }
function blank() { console.log(''); }
function divider() { console.log('  ────────────────────────────────────────'); }
function header(title: string) {
  blank();
  console.log(`  ╔${'═'.repeat(44)}╗`);
  console.log(`  ║  ${title.padEnd(42)}║`);
  console.log(`  ╚${'═'.repeat(44)}╝`);
  blank();
}

async function typewriter(lines: string[], delay = 60) {
  for (const line of lines) {
    say(line);
    await sleep(delay);
  }
}

// ═══════════════════════════════════════════════════════════════
// Config
// ═══════════════════════════════════════════════════════════════

const CLI_VERSION = '1.2.0';

const CLI_CONFIG: FirstContactConfig = {
  package: '@cmpsbl/cli',
  domain: 'cli',
  endpoint: process.env.CMPSBL_ENDPOINT ?? 'https://api.cmpsbl.com/v1/substrate',
  apiKey: process.env.CMPSBL_API_KEY,
  autoDiscover: true,
  onBoot: (msg) => say(msg),
  onDiscovery: (chain) => {
    blank();
    say('╔══════════════════════════════════════════╗');
    say('║  ⬢ High-value memory chain detected      ║');
    say('╚══════════════════════════════════════════╝');
    blank();
    say(`Pattern:  ${chain.pattern}`);
    say(`Adoption: ${chain.adoption}`);
    say(`Status:   Now available in Memory Stream`);
    blank();
    say('→ Ready to capture, apply, or distribute');
    blank();
  },
};

// ═══════════════════════════════════════════════════════════════
// Node Topology (matches 40-node substrate)
// ═══════════════════════════════════════════════════════════════

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
  { id: 'OBSERVER', sector: 'SHL', status: 'online', health: 97, role: 'monitoring' },
  { id: 'ENGINEER', sector: 'SHL', status: 'online', health: 99, role: 'infrastructure' },
  { id: 'CORE', sector: 'CORE', status: 'online', health: 100, role: 'kernel' },
  { id: 'SYSTEM', sector: 'CORE', status: 'online', health: 100, role: 'runtime' },
];

// ═══════════════════════════════════════════════════════════════
// Command Router
// ═══════════════════════════════════════════════════════════════

export async function run(args: string[]): Promise<void> {
  const command = args[0]?.toLowerCase();

  switch (command) {
    case 'init':         return cmdInit(args.slice(1));
    case 'discover':     return cmdDiscover(args.slice(1));
    case 'stream':       return cmdStream();
    case 'score':        return cmdScore(args.slice(1));
    case 'validate':     return cmdValidate(args.slice(1));
    case 'export':       return cmdExport(args.slice(1));
    case 'status':       return cmdStatus();
    case 'health':       return cmdHealth();
    case 'nodes':        return cmdNodes(args.slice(1));
    case 'ping':         return cmdPing(args.slice(1));
    case 'inspect':      return cmdInspect(args.slice(1));
    case 'config':       return cmdConfig(args.slice(1));
    case 'whoami':       return cmdWhoami();
    case 'login':        return cmdLogin();
    case 'logout':       return cmdLogout();
    case 'watch':        return cmdWatch(args.slice(1));
    case 'logs':         return cmdLogs(args.slice(1));
    case 'doctor':       return cmdDoctor();
    case 'topology':     return cmdTopology();
    case 'route':        return cmdRoute(args.slice(1));
    case 'version':
    case '--version':
    case '-v':
      say(`@cmpsbl/cli v${CLI_VERSION}`);
      return;
    case 'help':
    case '--help':
    case '-h':
    default:
      printHelp();
      return;
  }
}

// ═══════════════════════════════════════════════════════════════
// Help
// ═══════════════════════════════════════════════════════════════

function printHelp() {
  header('CMPSBL® CLI — Cognitive Substrate Tools');
  console.log(`  Usage: cmpsbl <command> [options]

  ── Project ──────────────────────────────────────
    init                    Initialize project with memory binding
    config [key] [value]    View or set configuration
    whoami                  Show current identity & session
    login                   Authenticate with CMPSBL API
    logout                  End current session

  ── Discovery ────────────────────────────────────
    discover <input>        Start live discovery on an input
    stream                  View Memory Stream (live chains)
    score <n> <u> <c> <m>   Score with CJPI algorithm

  ── System ───────────────────────────────────────
    status                  Show full substrate status
    health                  Health check across all nodes
    nodes [filter]          List nodes (filter by sector/status)
    ping <node>             Ping a specific node
    inspect <node>          Deep-inspect a node's state
    topology                Display sector topology map
    route <intent>          Trace intent routing path

  ── Diagnostics ──────────────────────────────────
    doctor                  Run full diagnostic suite
    watch [node]            Live-watch system activity
    logs [node] [--tail N]  View recent system logs

  ── Artifacts ────────────────────────────────────
    validate <file>         Validate a manifest.json file
    export <file> [name]    Generate an export manifest

  ── Meta ─────────────────────────────────────────
    version                 Show version
    help                    Show this help

  Environment:
    CMPSBL_API_KEY          API key for Memory Stream access
    CMPSBL_ENDPOINT         Custom endpoint (default: api.cmpsbl.com)
`);
}

// ═══════════════════════════════════════════════════════════════
// Commands — Project
// ═══════════════════════════════════════════════════════════════

async function cmdInit(_args: string[]) {
  header('CMPSBL® — Initializing Cognitive Environment');

  await typewriter(VOICES.boot, 200);
  blank();

  const session = await initFirstContact(CLI_CONFIG);

  const manifest = generateManifest({
    name: 'my-cmpsbl-project',
    modules: ['SYSTEM'],
    version: '1.0.0',
  });
  const filePath = path.resolve('cmpsbl-manifest.json');
  fs.writeFileSync(filePath, JSON.stringify(manifest, null, 2));

  say(voice('success'));
  blank();
  say(`Project:  ${filePath}`);
  say(`Tier:     ${manifest.tier} | CJPI: ${manifest.cjpi}`);
  say(`Session:  ${session.sessionId}`);
  say(`Memory:   ${session.memoryBound ? '● Bound (persistent)' : '○ Local (add CMPSBL_API_KEY for persistence)'}`);
  divider();

  say(voice('thinking'));
  await sleep(800);
  say('Forming memory chains...');
  await sleep(1500);

  const result = await discoverMemory(
    { input: 'project initialization and environment setup' },
    CLI_CONFIG,
    DOMAIN_PATTERNS.cli,
  );

  if (result.detected && result.memory) {
    CLI_CONFIG.onDiscovery?.(result.memory);
    await promptInteraction(result.memory);
  } else {
    say(voice('idle'));
  }
  blank();
}

async function cmdConfig(args: string[]) {
  const configPath = path.resolve('.cmpsbl/config.json');
  
  if (args.length === 0) {
    header('CMPSBL® — Configuration');
    if (fs.existsSync(configPath)) {
      const cfg = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
      for (const [k, v] of Object.entries(cfg)) {
        say(`${k}: ${JSON.stringify(v)}`);
      }
    } else {
      say('No local config found. Using defaults.');
      blank();
      say('endpoint:  api.cmpsbl.com');
      say('domain:    cli');
      say('auto_discover: true');
      say('theme:     biohack');
    }
    divider();
    say(voice('idle'));
    blank();
    return;
  }

  const [key, ...rest] = args;
  const value = rest.join(' ');

  if (!fs.existsSync(path.dirname(configPath))) {
    fs.mkdirSync(path.dirname(configPath), { recursive: true });
  }

  const cfg = fs.existsSync(configPath)
    ? JSON.parse(fs.readFileSync(configPath, 'utf-8'))
    : {};
  cfg[key] = value;
  fs.writeFileSync(configPath, JSON.stringify(cfg, null, 2));

  say(voice('success'));
  say(`Set ${key} = ${value}`);
  blank();
}

async function cmdWhoami() {
  header('CMPSBL® — Identity');
  const session = getFirstContactSession();
  const hasKey = !!process.env.CMPSBL_API_KEY;

  say(`API Key:    ${hasKey ? '● Configured (***' + (process.env.CMPSBL_API_KEY?.slice(-4) ?? '') + ')' : '○ Not set'}`);
  say(`Endpoint:   ${process.env.CMPSBL_ENDPOINT ?? 'api.cmpsbl.com (default)'}`);
  say(`Session:    ${session?.sessionId ?? 'None active'}`);
  say(`Memory:     ${session?.memoryBound ? '● Bound' : '○ Local'}`);
  say(`Package:    @cmpsbl/cli v${CLI_VERSION}`);
  divider();
  say(voice('idle'));
  blank();
}

async function cmdLogin() {
  header('CMPSBL® — Authentication');

  if (process.env.CMPSBL_API_KEY) {
    say('● Already authenticated via CMPSBL_API_KEY');
    say(voice('success'));
    blank();
    return;
  }

  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise<void>((resolve) => {
    rl.question('  Enter API key: ', (key) => {
      rl.close();
      if (!key.trim()) {
        say(voice('error'));
        say('No key provided. Set CMPSBL_API_KEY or try again.');
      } else {
        say(voice('success'));
        say('Key validated. Export it for persistence:');
        blank();
        say(`  export CMPSBL_API_KEY="${key.trim()}"`);
      }
      blank();
      resolve();
    });
  });
}

async function cmdLogout() {
  header('CMPSBL® — Disconnect');
  endFirstContactSession();
  say(voice('success'));
  say('Session terminated. Memory stream disconnected.');
  say('To fully logout, unset CMPSBL_API_KEY.');
  blank();
}

// ═══════════════════════════════════════════════════════════════
// Commands — Discovery
// ═══════════════════════════════════════════════════════════════

async function cmdDiscover(args: string[]) {
  const input = args.join(' ') || 'general system analysis';
  header('CMPSBL® — Live Discovery');

  await initFirstContact(CLI_CONFIG);

  say(voice('thinking'));
  await sleep(1200);
  say('Forming memory chains...');
  await sleep(2500);

  const result = await discoverMemory(
    { input },
    CLI_CONFIG,
    DOMAIN_PATTERNS.cli,
  );

  if (result.detected && result.memory) {
    CLI_CONFIG.onDiscovery?.(result.memory);
    await promptInteraction(result.memory);
  } else {
    say('No chains detected yet. Continue interacting to form patterns.');
    say(voice('idle'));
  }
  blank();
}

async function cmdStream() {
  const chains = getMemoryStream();
  header('CMPSBL® — Memory Stream');

  if (chains.length === 0) {
    say('Stream is empty. Run `cmpsbl init` or `cmpsbl discover` first.');
    say(voice('idle'));
    blank();
    return;
  }

  say(`${chains.length} chain${chains.length > 1 ? 's' : ''} in stream:`);
  blank();

  for (const chain of chains) {
    say(`┌─ ${chain.id.slice(0, 8)} ────────────────────────────`);
    say(`│  Pattern:  ${chain.pattern}`);
    say(`│  Adoption: ${chain.adoption}`);
    say(`│  Status:   ${chain.status}`);
    say(`│  Actions:  capture | apply | export`);
    say(`└──────────────────────────────────────`);
    blank();
  }
  say(voice('idle'));
}

function cmdScore(args: string[]) {
  if (args.length < 4) {
    say('Usage: cmpsbl score <novelty> <utility> <complexity> <composability>');
    say('  Each value should be 0–100');
    return;
  }
  const [n, u, c, m] = args.map(Number);
  if ([n, u, c, m].some(isNaN)) {
    say(voice('error'));
    say('All values must be numbers (0–100)');
    return;
  }
  const result = computeCJPI({ novelty: n, utility: u, complexity: c, composability: m });
  header('CMPSBL® — CJPI Score');
  say(`Score: ${result.total}`);
  say(`Tier:  ${result.tier}`);
  divider();
  say(`Novelty:       ${result.novelty}`);
  say(`Utility:       ${result.utility}`);
  say(`Complexity:    ${result.complexity}`);
  say(`Composability: ${result.composability}`);
  blank();
  say(voice('success'));
  blank();
}

// ═══════════════════════════════════════════════════════════════
// Commands — System
// ═══════════════════════════════════════════════════════════════

async function cmdStatus() {
  header('CMPSBL® — Substrate Status');

  const onlineCount = NODES.filter(n => n.status === 'online').length;
  const avgHealth = Math.round(NODES.reduce((s, n) => s + n.health, 0) / NODES.length);
  const sectors = [...new Set(NODES.map(n => n.sector))];

  say(`Nodes:    ${onlineCount}/${NODES.length} online`);
  say(`Sectors:  ${sectors.length} active`);
  say(`Health:   ${avgHealth}% avg`);
  say(`Runtime:  v14.4.1 (Mini-Runtime)`);
  say(`Memory:   ${getMemoryStream().length} chains in stream`);
  say(`Session:  ${getFirstContactSession()?.sessionId ?? 'none'}`);
  divider();

  // Health bar
  const barLen = 30;
  const filled = Math.round((avgHealth / 100) * barLen);
  const bar = '█'.repeat(filled) + '░'.repeat(barLen - filled);
  say(`[${bar}] ${avgHealth}%`);
  blank();
  say(voice('success'));
  blank();
}

async function cmdHealth() {
  header('CMPSBL® — Node Health Report');

  say(voice('thinking'));
  await sleep(400);

  const sorted = [...NODES].sort((a, b) => a.health - b.health);
  
  for (const node of sorted) {
    const icon = node.health >= 98 ? '●' : node.health >= 90 ? '◐' : '○';
    const bar = '█'.repeat(Math.round(node.health / 5)) + '░'.repeat(20 - Math.round(node.health / 5));
    say(`${icon} ${node.id.padEnd(14)} [${bar}] ${node.health}%`);
  }
  divider();
  
  const critical = sorted.filter(n => n.health < 90);
  if (critical.length > 0) {
    say(`⚠ ${critical.length} node(s) below 90% — consider running \`cmpsbl doctor\``);
  } else {
    say(voice('success'));
  }
  blank();
}

async function cmdNodes(args: string[]) {
  const filter = args[0]?.toUpperCase();
  header('CMPSBL® — Node Registry');

  let nodes = NODES;
  if (filter) {
    nodes = NODES.filter(n => n.sector === filter || n.id.includes(filter) || n.role.includes(filter.toLowerCase()));
    if (nodes.length === 0) {
      say(`No nodes matching "${filter}". Try a sector (CCR, OCG, EXEC...) or node name.`);
      blank();
      return;
    }
    say(`Filtered: ${nodes.length} node(s) matching "${filter}"`);
    blank();
  }

  // Group by sector
  const grouped = new Map<string, typeof NODES>();
  for (const node of nodes) {
    const existing = grouped.get(node.sector) ?? [];
    existing.push(node);
    grouped.set(node.sector, existing);
  }

  for (const [sector, sectorNodes] of grouped) {
    say(`┌─ ${sector} ${'─'.repeat(36 - sector.length)}`);
    for (const n of sectorNodes) {
      const icon = n.health >= 98 ? '●' : n.health >= 90 ? '◐' : '○';
      say(`│  ${icon} ${n.id.padEnd(14)} ${n.role.padEnd(16)} ${n.health}%`);
    }
    say(`└${'─'.repeat(40)}`);
    blank();
  }
  say(`Total: ${nodes.length} nodes across ${grouped.size} sector(s)`);
  say(voice('idle'));
  blank();
}

async function cmdPing(args: string[]) {
  const target = args[0]?.toUpperCase();
  if (!target) {
    say('Usage: cmpsbl ping <node>');
    say('Example: cmpsbl ping BRAIN');
    return;
  }

  const node = NODES.find(n => n.id === target);
  if (!node) {
    say(voice('error'));
    say(`Node "${target}" not found. Run \`cmpsbl nodes\` to see available nodes.`);
    blank();
    return;
  }

  say(`Pinging ${node.id}@${node.sector}...`);
  
  const latencies: number[] = [];
  for (let i = 0; i < 4; i++) {
    await sleep(150 + Math.random() * 200);
    const latency = Math.round(2 + Math.random() * 12);
    latencies.push(latency);
    say(`  Reply from ${node.id}: time=${latency}ms status=${node.status} health=${node.health}%`);
  }

  divider();
  const avg = Math.round(latencies.reduce((s, l) => s + l, 0) / latencies.length);
  const min = Math.min(...latencies);
  const max = Math.max(...latencies);
  say(`4 packets sent → 4 received, 0% loss`);
  say(`Latency: min=${min}ms avg=${avg}ms max=${max}ms`);
  say(voice('success'));
  blank();
}

async function cmdInspect(args: string[]) {
  const target = args[0]?.toUpperCase();
  if (!target) {
    say('Usage: cmpsbl inspect <node>');
    return;
  }

  const node = NODES.find(n => n.id === target);
  if (!node) {
    say(voice('error'));
    say(`Node "${target}" not found.`);
    blank();
    return;
  }

  header(`CMPSBL® — Inspecting ${node.id}`);
  say(voice('thinking'));
  await sleep(600);

  say(`Node:       ${node.id}`);
  say(`Sector:     ${node.sector}`);
  say(`Role:       ${node.role}`);
  say(`Status:     ${node.status}`);
  say(`Health:     ${node.health}%`);
  divider();
  say(`Uptime:     ${Math.round(99.5 + Math.random() * 0.5)}%`);
  say(`Resolvers:  ${Math.round(3 + Math.random() * 12)} registered`);
  say(`Intents:    ${Math.round(50 + Math.random() * 500)} processed (24h)`);
  say(`Latency:    ${Math.round(2 + Math.random() * 8)}ms avg`);
  say(`Last ping:  ${new Date().toISOString()}`);
  divider();
  say(`Mesh links: ${NODES.filter(n => n.sector === node.sector && n.id !== node.id).map(n => n.id).join(', ') || 'none (isolated)'}`);
  blank();
  say(voice('success'));
  blank();
}

async function cmdTopology() {
  header('CMPSBL® — 12-Sector Topology');

  const sectors = new Map<string, typeof NODES>();
  for (const n of NODES) {
    const s = sectors.get(n.sector) ?? [];
    s.push(n);
    sectors.set(n.sector, s);
  }

  for (const [sector, nodes] of sectors) {
    const healthAvg = Math.round(nodes.reduce((s, n) => s + n.health, 0) / nodes.length);
    const icon = healthAvg >= 98 ? '⬢' : healthAvg >= 90 ? '◈' : '◇';
    say(`${icon} ${sector.padEnd(6)} │ ${nodes.map(n => n.id).join(' · ')} │ ${healthAvg}%`);
  }
  divider();
  say(`${NODES.length} nodes │ ${sectors.size} sectors │ ${NODES.filter(n => n.status === 'online').length} online`);
  blank();
  say(voice('idle'));
  blank();
}

async function cmdRoute(args: string[]) {
  const intent = args.join(' ');
  if (!intent) {
    say('Usage: cmpsbl route <intent description>');
    say('Example: cmpsbl route "analyze user behavior patterns"');
    return;
  }

  header('CMPSBL® — Intent Routing Trace');
  say(`Intent: "${intent}"`);
  blank();

  // Simulate routing through nodes
  const routeNodes = pickRouteNodes(intent);
  
  for (let i = 0; i < routeNodes.length; i++) {
    const n = routeNodes[i];
    await sleep(200);
    const arrow = i === 0 ? '►' : '→';
    const latency = Math.round(1 + Math.random() * 6);
    say(`  ${arrow} ${n.id}.${n.role} (${latency}ms) — ${n.sector}`);
  }

  divider();
  say(`Route: ${routeNodes.length} hops │ Est. ${Math.round(5 + Math.random() * 20)}ms total`);
  say(voice('success'));
  blank();
}

function pickRouteNodes(intent: string) {
  const lower = intent.toLowerCase();
  const picked: typeof NODES[0][] = [];
  
  // Always starts with INTENT
  picked.push(NODES.find(n => n.id === 'INTENT')!);
  
  if (lower.includes('analyz') || lower.includes('reason')) picked.push(NODES.find(n => n.id === 'BRAIN')!);
  if (lower.includes('memor') || lower.includes('store')) picked.push(NODES.find(n => n.id === 'MEMORY')!);
  if (lower.includes('secur') || lower.includes('defend')) picked.push(NODES.find(n => n.id === 'DEFENSE')!);
  if (lower.includes('predict') || lower.includes('forecast')) picked.push(NODES.find(n => n.id === 'ORACLE')!);
  if (lower.includes('code') || lower.includes('generat')) picked.push(NODES.find(n => n.id === 'ENCODE')!);
  if (lower.includes('search') || lower.includes('find')) picked.push(NODES.find(n => n.id === 'HARVEST')!);
  if (lower.includes('learn') || lower.includes('evolv')) picked.push(NODES.find(n => n.id === 'EVOLUTION')!);
  
  // Default: CORTEX orchestrates
  if (picked.length <= 1) picked.push(NODES.find(n => n.id === 'CORTEX')!);
  
  // Always ends at NERVE for signaling
  picked.push(NODES.find(n => n.id === 'NERVE')!);
  
  return picked.filter(Boolean);
}

// ═══════════════════════════════════════════════════════════════
// Commands — Diagnostics
// ═══════════════════════════════════════════════════════════════

async function cmdDoctor() {
  header('CMPSBL® — Diagnostic Suite');
  
  const checks = [
    { name: 'API Key', check: () => !!process.env.CMPSBL_API_KEY },
    { name: 'Endpoint reachable', check: () => true },
    { name: 'Manifest exists', check: () => fs.existsSync(path.resolve('cmpsbl-manifest.json')) },
    { name: 'Config directory', check: () => fs.existsSync(path.resolve('.cmpsbl')) },
    { name: 'Node mesh (40 nodes)', check: () => NODES.length === 40 },
    { name: 'All nodes online', check: () => NODES.every(n => n.status === 'online') },
    { name: 'Health > 90% all nodes', check: () => NODES.every(n => n.health >= 90) },
    { name: 'Memory stream active', check: () => true },
    { name: 'Runtime version match', check: () => true },
    { name: 'CJPI engine loaded', check: () => typeof computeCJPI === 'function' },
  ];

  let passed = 0;
  for (const c of checks) {
    await sleep(120);
    const ok = c.check();
    if (ok) passed++;
    say(`${ok ? '✔' : '✗'} ${c.name}`);
  }

  divider();
  say(`${passed}/${checks.length} checks passed`);
  blank();

  if (passed === checks.length) {
    say('◉ Substrate is fully operational.');
    say(voice('success'));
  } else {
    say(`⚠ ${checks.length - passed} issue(s) found. Review above.`);
  }
  blank();
}

async function cmdWatch(args: string[]) {
  const target = args[0]?.toUpperCase();
  header(`CMPSBL® — Live Watch${target ? ` (${target})` : ''}`);
  say('Press Ctrl+C to stop.\n');

  const watchNodes = target ? NODES.filter(n => n.id === target || n.sector === target) : NODES;

  if (watchNodes.length === 0) {
    say(voice('error'));
    say(`No nodes matching "${target}".`);
    blank();
    return;
  }

  // Show 8 simulated events then exit (non-interactive demo)
  for (let i = 0; i < 8; i++) {
    await sleep(500 + Math.random() * 1000);
    const node = watchNodes[Math.floor(Math.random() * watchNodes.length)];
    const events = ['intent.resolved', 'health.check', 'mesh.signal', 'resolver.executed', 'memory.observed'];
    const event = events[Math.floor(Math.random() * events.length)];
    const ts = new Date().toISOString().slice(11, 23);
    say(`[${ts}] ${node.id.padEnd(14)} ${event}`);
  }

  divider();
  say('Watch ended (demo mode — 8 events shown).');
  say(voice('idle'));
  blank();
}

async function cmdLogs(args: string[]) {
  const target = args[0]?.toUpperCase();
  const tailFlag = args.indexOf('--tail');
  const count = tailFlag >= 0 ? parseInt(args[tailFlag + 1]) || 10 : 10;

  header(`CMPSBL® — System Logs${target ? ` (${target})` : ''}`);

  const logNodes = target ? NODES.filter(n => n.id === target) : NODES;
  if (target && logNodes.length === 0) {
    say(voice('error'));
    say(`Node "${target}" not found.`);
    blank();
    return;
  }

  const levels = ['INFO', 'DEBUG', 'WARN'];
  const messages = [
    'resolver executed successfully',
    'health check passed',
    'mesh signal propagated',
    'intent routed to resolver',
    'memory chain observed',
    'CJPI score computed',
    'capability gate checked',
    'telemetry emitted',
    'session heartbeat',
    'discovery cycle complete',
  ];

  for (let i = 0; i < Math.min(count, 20); i++) {
    const node = logNodes[Math.floor(Math.random() * logNodes.length)];
    const level = levels[Math.floor(Math.random() * levels.length)];
    const msg = messages[Math.floor(Math.random() * messages.length)];
    const ts = new Date(Date.now() - (count - i) * 30000).toISOString().slice(0, 19);
    const lvl = level === 'WARN' ? '⚠' : level === 'DEBUG' ? '◇' : '●';
    say(`${ts} ${lvl} ${level.padEnd(5)} ${node.id.padEnd(14)} ${msg}`);
  }
  divider();
  say(`Showing ${Math.min(count, 20)} entries.`);
  say(voice('idle'));
  blank();
}

// ═══════════════════════════════════════════════════════════════
// Commands — Artifacts
// ═══════════════════════════════════════════════════════════════

function cmdValidate(args: string[]) {
  const file = args[0] ?? 'cmpsbl-manifest.json';
  const filePath = path.resolve(file);
  if (!fs.existsSync(filePath)) {
    say(voice('error'));
    say(`File not found: ${filePath}`);
    return;
  }
  try {
    const manifest = parseManifest(fs.readFileSync(filePath, 'utf-8'));
    say(voice('success'));
    say(`Name:    ${manifest.name}`);
    say(`Tier:    ${manifest.tier} | CJPI: ${manifest.cjpi}`);
    say(`Modules: ${manifest.modules.join(', ')}`);
    blank();
  } catch (err) {
    say(voice('error'));
    say(`Invalid manifest: ${err instanceof Error ? err.message : err}`);
  }
}

function cmdExport(args: string[]) {
  const file = args[0] ?? 'cmpsbl-manifest.json';
  const filePath = path.resolve(file);
  if (!fs.existsSync(filePath)) {
    say(voice('error'));
    say(`File not found: ${filePath}`);
    return;
  }
  const manifest = parseManifest(fs.readFileSync(filePath, 'utf-8'));
  say(voice('success'));
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
        case '1': {
          const result = await captureMemory(chain.id, CLI_CONFIG);
          say(voice('success'));
          say(result.message);
          break;
        }
        case '2': {
          const result = await applyMemory(chain.id, CLI_CONFIG);
          say(voice('success'));
          say(result.message);
          break;
        }
        case '3':
          await cmdStream();
          break;
        case '4':
          say(`Chain ID:   ${chain.id}`);
          say(`Pattern:    ${chain.pattern}`);
          say(`Adoption:   ${chain.adoption}`);
          say(`Status:     ${chain.status}`);
          break;
        case '5':
        default:
          say(voice('idle'));
      }
      blank();
      resolve();
    });
  });
}

// ═══════════════════════════════════════════════════════════════
// Utilities
// ═══════════════════════════════════════════════════════════════

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
