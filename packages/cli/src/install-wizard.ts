/**
 * CMPSBL® CLI Install Wizard
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Interactive terminal wizard that guides users through
 * installing an exported agent/engine on their own stack.
 *
 * Usage (from CLI):
 *   cmpsbl install ./my-exported-agent
 *   cmpsbl install         # scans current dir
 *
 * © 2025–2026 CMPSBL® · PromptFluid™. All rights reserved.
 */

import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';

// ─── Types ──────────────────────────────────────────────────────────────

interface Manifest {
  name: string;
  tier: string;
  cjpi: number;
  modules: string[];
  runtime: string;
  targets: string[];
  version: string;
  category?: string;
}

interface WizardState {
  manifest: Manifest;
  exportDir: string;
  client: 'node' | 'react' | 'python' | 'rest';
  projectDir: string;
}

type ColorFn = (s: string) => string;

// ─── Minimal color helpers (no external deps) ────────────────────────

const ESC = '\x1b[';
const color = {
  gold: ((s: string) => `${ESC}33m${s}${ESC}0m`) as ColorFn,
  green: ((s: string) => `${ESC}32m${s}${ESC}0m`) as ColorFn,
  dim: ((s: string) => `${ESC}2m${s}${ESC}0m`) as ColorFn,
  bold: ((s: string) => `${ESC}1m${s}${ESC}0m`) as ColorFn,
  cyan: ((s: string) => `${ESC}36m${s}${ESC}0m`) as ColorFn,
  red: ((s: string) => `${ESC}31m${s}${ESC}0m`) as ColorFn,
};

const say = (m: string) => console.log(`  ${m}`);
const blank = () => console.log('');

// ─── Readline helper ────────────────────────────────────────────────

function ask(question: string): Promise<string> {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    rl.question(`  ${question}`, (answer: string) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

// ─── Manifest detection ─────────────────────────────────────────────

function findManifest(dir: string): Manifest | null {
  const candidates = ['manifest.json', 'cmpsbl-manifest.json'];
  for (const name of candidates) {
    const file = path.join(dir, name);
    if (fs.existsSync(file)) {
      try {
        const data = JSON.parse(fs.readFileSync(file, 'utf-8')) as Manifest;
        if (data.name && data.runtime) return data;
      } catch { /* skip malformed */ }
    }
  }
  return null;
}

// ─── Step 1: Detect export ──────────────────────────────────────────

async function stepDetect(exportPath?: string): Promise<WizardState | null> {
  const dir = exportPath ? path.resolve(exportPath) : process.cwd();

  if (!fs.existsSync(dir)) {
    say(color.red(`✗ Path not found: ${dir}`));
    return null;
  }

  const manifest = findManifest(dir);
  if (!manifest) {
    say(color.red('✗ No CMPSBL manifest found.'));
    say(color.dim('  Expected manifest.json in the export root.'));
    say(color.dim('  Run this command from inside an exported bundle.'));
    return null;
  }

  blank();
  say('╔══════════════════════════════════════════════╗');
  say('║      CMPSBL® INSTALL WIZARD                 ║');
  say('╚══════════════════════════════════════════════╝');
  blank();
  say(`  ${color.gold('◈')} Export: ${color.bold(manifest.name)}`);
  say(`  ${color.dim('Tier:')} ${manifest.tier}  ${color.dim('CJPI:')} ${manifest.cjpi}  ${color.dim('v')}${manifest.version}`);
  say(`  ${color.dim('Primitives:')} ${manifest.modules.join(', ')}`);
  blank();

  return {
    manifest,
    exportDir: dir,
    client: 'node',
    projectDir: process.cwd(),
  };
}

// ─── Step 2: Choose client ──────────────────────────────────────────

async function stepChooseClient(state: WizardState): Promise<WizardState> {
  say(color.bold('STEP 1 — Choose your runtime'));
  blank();
  say('  [1] Node.js / Bun / Deno');
  say('  [2] React / Next.js / Vite');
  say('  [3] Python (bridge mode)');
  say('  [4] Other (REST API)');
  blank();

  const choice = await ask('Choose (1-4): ');
  const map: Record<string, WizardState['client']> = {
    '1': 'node', '2': 'react', '3': 'python', '4': 'rest',
  };
  state.client = map[choice] ?? 'node';
  blank();
  say(`  ${color.green('✓')} Client: ${state.client}`);
  blank();
  return state;
}

// ─── Step 3: Configure target ───────────────────────────────────────

async function stepConfigure(state: WizardState): Promise<WizardState> {
  say(color.bold('STEP 2 — Configure target directory'));
  blank();

  const defaultDir = state.client === 'react'
    ? './src/lib/' + state.manifest.name.toLowerCase().replace(/\s+/g, '-')
    : './' + state.manifest.name.toLowerCase().replace(/\s+/g, '-');

  const dir = await ask(`Install to (${color.dim(defaultDir)}): `) || defaultDir;
  state.projectDir = path.resolve(dir);
  blank();
  say(`  ${color.green('✓')} Target: ${state.projectDir}`);
  blank();
  return state;
}

// ─── Step 4: Execute install ────────────────────────────────────────

async function stepInstall(state: WizardState): Promise<void> {
  say(color.bold('STEP 3 — Installing'));
  blank();

  // Create target directory
  if (!fs.existsSync(state.projectDir)) {
    fs.mkdirSync(state.projectDir, { recursive: true });
    say(`  ${color.green('✓')} Created ${state.projectDir}`);
  }

  // Copy src/ files
  const srcDir = path.join(state.exportDir, 'src');
  if (fs.existsSync(srcDir)) {
    copyDirSync(srcDir, path.join(state.projectDir, 'src'));
    say(`  ${color.green('✓')} Copied source files`);
  }

  // Copy _runtime/ files
  const runtimeDir = path.join(state.exportDir, '_runtime');
  if (fs.existsSync(runtimeDir)) {
    copyDirSync(runtimeDir, path.join(state.projectDir, '_runtime'));
    say(`  ${color.green('✓')} Copied sealed runtime`);
  }

  // Copy manifest
  const manifestSrc = path.join(state.exportDir, 'manifest.json');
  if (fs.existsSync(manifestSrc)) {
    fs.copyFileSync(manifestSrc, path.join(state.projectDir, 'manifest.json'));
    say(`  ${color.green('✓')} Copied manifest`);
  }

  // Generate .env.example
  const envContent = [
    '# CMPSBL® Environment Configuration',
    `# Export: ${state.manifest.name} v${state.manifest.version}`,
    '',
    'CMPSBL_API_KEY=pf_live_your_key_here',
    '# CMPSBL_ENDPOINT=https://custom-endpoint (optional)',
    '# CMPSBL_MEMORY_TTL_DAYS=90',
    '# CMPSBL_MEMORY_DIR=~/.cmpsbl/memory',
  ].join('\n');
  fs.writeFileSync(path.join(state.projectDir, '.env.example'), envContent);
  say(`  ${color.green('✓')} Generated .env.example`);

  // Client-specific instructions
  blank();
  say(color.bold('STEP 4 — Next steps'));
  blank();

  switch (state.client) {
    case 'node':
      say(`  1. ${color.cyan('cp .env.example .env')} and add your API key`);
      say(`  2. ${color.cyan('npx tsx quickstart.ts')} to verify`);
      break;
    case 'react':
      say(`  1. Copy env vars to your ${color.cyan('.env.local')}`);
      say(`  2. Import: ${color.cyan(`import { runtime } from './${path.basename(state.projectDir)}/src';`)}`);
      say(`  3. ${color.cyan('npm run dev')} to verify`);
      break;
    case 'python':
      say(`  1. ${color.cyan('pip install cmpsbl-bridge')}`);
      say(`  2. Set ${color.cyan('CMPSBL_API_KEY')} in your environment`);
      say(`  3. ${color.cyan(`from ${path.basename(state.projectDir).replace(/-/g, '_')} import runtime`)}`);
      break;
    case 'rest':
      say(`  1. Set ${color.cyan('CMPSBL_API_KEY')} in your environment`);
      say(`  2. ${color.cyan(`POST /api/${state.manifest.name.toLowerCase().replace(/\\s+/g, '-')}/invoke`)}`);
      say(`  3. See docs/guides/INTEGRATION.md for payload format`);
      break;
  }

  blank();
  say('────────────────────────────────────────');
  say(`  ${color.green('✓')} Installation complete`);
  say(`  ${color.dim('Need help?')} support@cmpsbl.com`);
  say('────────────────────────────────────────');
  blank();
}

// ─── Recursive directory copy ───────────────────────────────────────

function copyDirSync(src: string, dest: string): void {
  if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, entry.name);
    const d = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirSync(s, d);
    } else {
      fs.copyFileSync(s, d);
    }
  }
}

// ─── Main export ────────────────────────────────────────────────────

export async function runInstallWizard(exportPath?: string): Promise<void> {
  const state = await stepDetect(exportPath);
  if (!state) {
    process.exitCode = 1;
    return;
  }

  const modified = await stepChooseClient(state);
  const configured = await stepConfigure(modified);
  await stepInstall(configured);
}
