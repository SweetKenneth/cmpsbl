/**
 * @cmpsbl/cli — CLI Commands
 * Unified first-contact experience with live Memory Stream integration.
 *
 * Commands:
 *   init              Initialize a CMPSBL project with memory binding
 *   discover          Start live discovery
 *   stream            View Memory Stream
 *   score             Score a manifest with CJPI
 *   validate          Validate a manifest.json
 *   export            Generate an export bundle
 *   version           Show CLI version
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
} from '@cmpsbl/runtime';
import { DOMAIN_PATTERNS } from '@cmpsbl/types';
import type { FirstContactConfig, MemoryChain } from '@cmpsbl/types';
import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';

const CLI_CONFIG: FirstContactConfig = {
  package: '@cmpsbl/cli',
  domain: 'cli',
  endpoint: process.env.CMPSBL_ENDPOINT ?? 'https://api.cmpsbl.com/v1/substrate',
  apiKey: process.env.CMPSBL_API_KEY,
  autoDiscover: true,
  onBoot: (msg) => console.log(`  ${msg}`),
  onDiscovery: (chain) => {
    console.log('\n  ╔══════════════════════════════════════════╗');
    console.log('  ║  High-value memory chain detected        ║');
    console.log('  ╚══════════════════════════════════════════╝');
    console.log(`\n  Pattern:  ${chain.pattern}`);
    console.log(`  Adoption: ${chain.adoption}`);
    console.log(`  Status:   Now available in Memory Stream`);
    console.log('\n  → Ready to capture, apply, or distribute\n');
  },
};

export async function run(args: string[]): Promise<void> {
  const command = args[0];

  switch (command) {
    case 'init':
      return cmdInit(args.slice(1));
    case 'discover':
      return cmdDiscover(args.slice(1));
    case 'stream':
      return cmdStream();
    case 'score':
      return cmdScore(args.slice(1));
    case 'validate':
      return cmdValidate(args.slice(1));
    case 'export':
      return cmdExport(args.slice(1));
    case 'version':
    case '--version':
    case '-v':
      console.log('@cmpsbl/cli v1.0.0');
      return;
    case 'help':
    case '--help':
    case '-h':
    default:
      printHelp();
      return;
  }
}

function printHelp() {
  console.log(`
  CMPSBL® CLI — Cognitive Substrate Tools

  Usage: cmpsbl <command> [options]

  Commands:
    init                    Initialize a CMPSBL project with memory binding
    discover <input>        Start live discovery on an input
    stream                  View Memory Stream (live chains)
    score <n> <u> <c> <m>   Score with CJPI (novelty, utility, complexity, composability)
    validate <file>         Validate a manifest.json file
    export <file> [name]    Generate an export manifest
    version                 Show version
    help                    Show this help

  Environment:
    CMPSBL_API_KEY          Your API key for Memory Stream access
    CMPSBL_ENDPOINT         Custom API endpoint (default: https://api.cmpsbl.com/v1/substrate)

  Examples:
    cmpsbl init
    cmpsbl discover "track user behavior across sessions"
    cmpsbl stream
    cmpsbl score 80 90 70 85
`);
}

async function cmdInit(_args: string[]) {
  console.log('\n  CMPSBL® — Initializing cognitive environment\n');

  // First contact boot sequence
  const session = await initFirstContact(CLI_CONFIG);

  // Generate manifest
  const manifest = generateManifest({
    name: 'my-cmpsbl-project',
    modules: ['SYSTEM'],
    version: '1.0.0',
  });
  const filePath = path.resolve('cmpsbl-manifest.json');
  fs.writeFileSync(filePath, JSON.stringify(manifest, null, 2));

  console.log(`\n  ✔ Project initialized at ${filePath}`);
  console.log(`    Tier: ${manifest.tier} | CJPI: ${manifest.cjpi}`);
  console.log(`    Session: ${session.sessionId}`);
  console.log(`    Memory: ${session.memoryBound ? 'Bound' : 'Local (add CMPSBL_API_KEY for persistent memory)'}`);

  // Auto-discover on init
  console.log('\n  Observing interaction patterns...');
  await sleep(800);
  console.log('  Forming memory chains...');
  await sleep(1500);

  const result = await discoverMemory(
    { input: 'project initialization and environment setup' },
    CLI_CONFIG,
    DOMAIN_PATTERNS.cli,
  );

  if (result.detected && result.memory) {
    CLI_CONFIG.onDiscovery?.(result.memory);
    await promptInteraction(result.memory);
  }
}

async function cmdDiscover(args: string[]) {
  const input = args.join(' ') || 'general system analysis';
  console.log('\n  CMPSBL® — Live Discovery\n');

  await initFirstContact(CLI_CONFIG);

  console.log('  Observing interaction patterns...');
  await sleep(1200);
  console.log('  Forming memory chains...');
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
    console.log('  No chains detected yet. Continue interacting to form patterns.\n');
  }
}

async function cmdStream() {
  const session = getFirstContactSession();
  const chains = getMemoryStream();

  console.log('\n  Memory Stream (Live)\n');

  if (chains.length === 0) {
    console.log('  No chains in stream. Run `cmpsbl init` or `cmpsbl discover` first.\n');
    return;
  }

  for (const chain of chains) {
    console.log(`  [${chain.id.slice(0, 8)}]`);
    console.log(`    Pattern:  ${chain.pattern}`);
    console.log(`    Adoption: ${chain.adoption}`);
    console.log(`    Status:   ${chain.status}`);
    console.log(`    Options:`);
    console.log(`      → Capture`);
    console.log(`      → Apply`);
    console.log(`      → Export`);
    console.log('');
  }
}

async function promptInteraction(chain: MemoryChain) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

  console.log('  What would you like to do?\n');
  console.log('    1. Capture memory');
  console.log('    2. Apply to agent');
  console.log('    3. View Memory Stream');
  console.log('    4. Continue discovery');
  console.log('');

  return new Promise<void>((resolve) => {
    rl.question('  > ', async (answer) => {
      rl.close();
      switch (answer.trim()) {
        case '1': {
          const result = await captureMemory(chain.id, CLI_CONFIG);
          console.log(`\n  ✔ ${result.message}\n`);
          break;
        }
        case '2': {
          const result = await applyMemory(chain.id, CLI_CONFIG);
          console.log(`\n  ✔ ${result.message}\n`);
          break;
        }
        case '3':
          await cmdStream();
          break;
        case '4':
          console.log('\n  Discovery continues in background...\n');
          break;
        default:
          console.log('\n  Discovery continues in background...\n');
      }
      resolve();
    });
  });
}

function cmdScore(args: string[]) {
  if (args.length < 4) {
    console.error('Usage: cmpsbl score <novelty> <utility> <complexity> <composability>');
    console.error('  Each value should be 0–100');
    return;
  }
  const [n, u, c, m] = args.map(Number);
  if ([n, u, c, m].some(isNaN)) {
    console.error('All values must be numbers (0–100)');
    return;
  }
  const result = computeCJPI({ novelty: n, utility: u, complexity: c, composability: m });
  console.log(`\n  CJPI Score: ${result.total}`);
  console.log(`  Tier:       ${result.tier}`);
  console.log(`  Breakdown:  N=${result.novelty} U=${result.utility} C=${result.complexity} M=${result.composability}\n`);
}

function cmdValidate(args: string[]) {
  const file = args[0] ?? 'cmpsbl-manifest.json';
  const filePath = path.resolve(file);
  if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filePath}`);
    return;
  }
  try {
    const manifest = parseManifest(fs.readFileSync(filePath, 'utf-8'));
    console.log(`✓ Valid CMPSBL manifest`);
    console.log(`  Name: ${manifest.name}`);
    console.log(`  Tier: ${manifest.tier} | CJPI: ${manifest.cjpi}`);
    console.log(`  Modules: ${manifest.modules.join(', ')}`);
  } catch (err) {
    console.error(`✗ Invalid manifest: ${err instanceof Error ? err.message : err}`);
  }
}

function cmdExport(args: string[]) {
  const file = args[0] ?? 'cmpsbl-manifest.json';
  const filePath = path.resolve(file);
  if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filePath}`);
    return;
  }
  const manifest = parseManifest(fs.readFileSync(filePath, 'utf-8'));
  console.log(`✓ Export ready for "${manifest.name}"`);
  console.log(`  Tier: ${manifest.tier} | Runtime: ${manifest.runtime}`);
  console.log(`  Targets: ${manifest.targets.join(', ')}`);
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
