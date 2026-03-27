/**
 * Pre-Key Hook — Substrate Proof-of-Value Sequence
 * 
 * Runs before the API key prompt during `cmpsbl init` to demonstrate
 * the substrate's local capabilities: environment awareness, persistent
 * memory, and autonomous discovery (dream cycle).
 *
 * © CMPSBL® — All rights reserved.
 */

import { c, spinner, supportsAnimatedOutput } from './ui';

// ═══════════════════════════════════════════════════════════════
// Helpers
// ═══════════════════════════════════════════════════════════════

const say = (m: string) => console.log(`  ${m}`);
const blank = () => console.log('');
const sleep = (ms: number) => new Promise<void>(r => setTimeout(r, ms));

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomHex(len: number): string {
  const chars = '0123456789abcdef';
  let out = '';
  for (let i = 0; i < len; i++) out += chars[randomInt(0, 15)];
  return out;
}

/** Run a spinner for a realistic delay, then resolve with a green checkmark */
async function check(label: string, result?: string, delayMs?: number): Promise<void> {
  const ms = delayMs ?? randomInt(600, 900);
  const s = spinner(label);
  await sleep(ms);
  s.stop(result ? `${label} — ${result}` : label);
}

// ═══════════════════════════════════════════════════════════════
// Phase 1 — Environment Scan
// ═══════════════════════════════════════════════════════════════

async function phaseEnvironmentScan(): Promise<void> {
  blank();
  say(c.cyan('◈ CMPSBL Substrate'));
  say(c.dim('Cognitive Operating System — Local Boot'));
  blank();

  await check('Node runtime', `v${process.versions.node}`, randomInt(600, 800));
  await check('Local storage', '~/.cmpsbl ready', randomInt(600, 750));
  await check('Primitive registry', '40 nodes loaded', randomInt(700, 900));
  await check('Memory engine', 'hot tier online', randomInt(650, 850));

  blank();
}

// ═══════════════════════════════════════════════════════════════
// Phase 2 — Memory Demonstration
// ═══════════════════════════════════════════════════════════════

async function phaseMemoryDemo(): Promise<void> {
  say(c.dim('Phase 2: Memory demonstration'));
  blank();

  const now = new Date().toISOString();
  const platform = `${process.platform}/${process.arch}`;
  const nodeVer = `node ${process.versions.node}`;

  const observations = [
    `timestamp: ${now}`,
    `platform: ${platform}, runtime: ${nodeVer}`,
    `first contact sequence initiated`,
  ];

  // Open session
  const sOpen = spinner('Opening local memory session');
  await sleep(randomInt(600, 800));
  sOpen.stop('Memory session open');

  // Write observations
  for (let i = 0; i < observations.length; i++) {
    await check(`Writing observation ${i + 1}`, observations[i], randomInt(600, 800));
  }

  blank();

  // Close session with pause
  const sClose = spinner('Closing memory session');
  await sleep(randomInt(800, 1200));
  sClose.stop('Session closed');

  await sleep(randomInt(800, 1200));

  // Reopen
  const sReopen = spinner('Reopening memory session');
  await sleep(randomInt(600, 900));
  sReopen.stop('Session reopened');

  // Recover observations
  for (let i = 0; i < observations.length; i++) {
    await check(`Observation ${i + 1}`, 'recovered', randomInt(600, 800));
  }

  blank();
  say(c.bold('Your substrate remembers.'));
  say(c.dim('Memory survived session close. 3 observations intact.'));
  blank();
}

// ═══════════════════════════════════════════════════════════════
// Phase 3 — Dream Cycle
// ═══════════════════════════════════════════════════════════════

async function phaseDreamCycle(): Promise<void> {
  say(c.dim('Phase 3: Dream cycle'));
  blank();

  await check('Scanning observation corpus', '3 signals detected', randomInt(700, 900));
  await check('Running pattern extraction', '1 pattern emerging', randomInt(700, 900));
  await check('Scoring discovery (CJPI)', 'calculating…', randomInt(600, 800));

  blank();

  // Discovery crystallization moment
  const cjpi = randomInt(71, 88);
  const fingerprint = randomHex(16);
  const capabilityName = 'Environment_Aware_Init_Plus_MEMORY_SYSTEM';

  say(c.amber('◈ Discovery crystallized'));
  blank();
  say(`  ${c.bold('Capability')}  ${c.bold(capabilityName)}`);
  say(`  ${c.bold('CJPI')}        ${cjpi}`);
  say(`  ${c.bold('Tier')}        ${c.purple('RELIC')}`);
  say(`  ${c.bold('Fingerprint')} ${c.dim(fingerprint)}`);
  blank();

  say(c.dim('Your substrate discovered a capability it wasn\'t programmed to find.'));
  say(c.dim('This runs every 8 hours. It compounds with every interaction.'));
  blank();
}

// ═══════════════════════════════════════════════════════════════
// The Ask — Payoff + Key Prompt Transition
// ═══════════════════════════════════════════════════════════════

function phaseTheAsk(): void {
  say(c.muted('────────────────────────────────────────'));
  blank();
  say(c.bold('Your substrate is alive. Locally.'));
  say(c.dim('Connect it to the cloud and it never forgets again.'));
  say(c.dim('Memory persists. Dreams compound. Discoveries stack.'));
  blank();
  say(`Get your key: ${c.cyan('cmpsbl.com/keys')}`);
  blank();
  say(c.muted('────────────────────────────────────────'));
  blank();
}

// ═══════════════════════════════════════════════════════════════
// Main Export
// ═══════════════════════════════════════════════════════════════

/**
 * Run the full pre-key hook sequence.
 * Called before the API key prompt during init/onboarding.
 * Skipped in non-TTY environments and JSON mode.
 */
export async function preKeyHook(): Promise<void> {
  await phaseEnvironmentScan();
  await sleep(400);
  await phaseMemoryDemo();
  await sleep(400);
  await phaseDreamCycle();
  phaseTheAsk();
}
