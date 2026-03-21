/**
 * @cmpsbl/cli — CLI Commands
 *
 * Commands:
 *   init              Initialize a CMPSBL project
 *   score             Score a manifest with CJPI
 *   validate          Validate a manifest.json
 *   export            Generate an export bundle
 *   version           Show CLI version
 *
 * © CMPSBL® — All rights reserved.
 */

import { computeCJPI, parseManifest, generateManifest, tierFromCJPI } from '@cmpsbl/runtime';
import * as fs from 'fs';
import * as path from 'path';

export async function run(args: string[]): Promise<void> {
  const command = args[0];

  switch (command) {
    case 'init':
      return cmdInit(args.slice(1));
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
    init                    Initialize a new CMPSBL project
    score <n> <u> <c> <m>   Score with CJPI (novelty, utility, complexity, composability)
    validate <file>         Validate a manifest.json file
    export <file> [name]    Generate an export manifest
    version                 Show version
    help                    Show this help

  Examples:
    cmpsbl score 80 90 70 85
    cmpsbl validate manifest.json
    cmpsbl init
`);
}

function cmdInit(_args: string[]) {
  const manifest = generateManifest({
    name: 'my-cmpsbl-project',
    modules: ['SYSTEM'],
    version: '1.0.0',
  });
  const filePath = path.resolve('cmpsbl-manifest.json');
  fs.writeFileSync(filePath, JSON.stringify(manifest, null, 2));
  console.log(`✓ Initialized CMPSBL project at ${filePath}`);
  console.log(`  Tier: ${manifest.tier} | CJPI: ${manifest.cjpi}`);
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
