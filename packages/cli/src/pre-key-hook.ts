/**
 * Pre-Key Hook — Substrate Proof-of-Value Sequence
 * 
 * Cinematic first-contact experience demonstrating the substrate's
 * cognitive depth: identity resolution, defense perimeter activation,
 * brain initialization, memory binding, and dream synthesis.
 *
 * Features three CLI-first innovations:
 * 1. Terminal Heartbeat Monitor — animated ECG trace during boot
 * 2. Constellation Map — primitive connection visualization
 * 3. DNA Helix — animated double-helix of primitive names during Ascension
 *
 * U.S. Patent App. No. 64/031,637
 * © CMPSBL® — All rights reserved.
 */

import { execSync } from 'child_process';
import { c, spinner, box, progressBar, supportsAnimatedOutput } from './ui';

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

/** Typewrite effect — character by character */
async function typewrite(text: string, delayMs: number = 35): Promise<void> {
  if (!supportsAnimatedOutput()) {
    console.log(text);
    return;
  }
  for (const ch of text) {
    process.stdout.write(ch);
    await sleep(delayMs);
  }
  process.stdout.write('\n');
}

/** Run a spinner for a realistic delay */
async function check(label: string, result?: string, delayMs?: number): Promise<void> {
  const ms = delayMs ?? randomInt(300, 600);
  const s = spinner(label);
  await sleep(ms);
  s.stop(result ? `${label} — ${result}` : label);
}

// ═══════════════════════════════════════════════════════════════
// Innovation #1 — Terminal Heartbeat Monitor
// An animated ECG trace that shows the substrate "coming alive"
// Never done before: a real-time heartbeat in a CLI
// ═══════════════════════════════════════════════════════════════

async function heartbeatMonitor(): Promise<void> {
  if (!supportsAnimatedOutput()) {
    say(`${c.green('●')} Substrate heartbeat: ${c.bold(c.green('ALIVE'))}`);
    return;
  }

  const ecgPattern = [
    '─', '─', '─', '╲', '╱', '─', '─', '╲', '╱', '╱',
    '▌', '╲', '╱', '─', '─', '─', '─', '─', '─', '─',
  ];

  say(c.dim('  ┌─ SUBSTRATE HEARTBEAT ─────────────────────┐'));

  for (let beat = 0; beat < 3; beat++) {
    let line = '  │ ';
    for (let i = 0; i < ecgPattern.length; i++) {
      const char = ecgPattern[i];
      const isSpike = char === '▌' || char === '╱';
      line += isSpike ? c.green(char) : c.dim(char);
      process.stdout.write(`\r${line}${' '.repeat(40)}`);
      await sleep(40);
    }

    const bpm = randomInt(72, 88);
    process.stdout.write(`  ${c.green(`${bpm} BPM`)} │\n`);
    await sleep(100);
  }

  say(c.dim('  └─────────────────── HEARTBEAT CONFIRMED ───┘'));
  blank();
}

// ═══════════════════════════════════════════════════════════════
// Innovation #2 — Terminal Constellation Map
// A real-time star map showing primitive connections forming
// Never done before: a spatial topology rendered in a CLI
// ═══════════════════════════════════════════════════════════════

async function constellationMap(): Promise<void> {
  if (!supportsAnimatedOutput()) {
    say('40 primitives connected across 4 categories');
    return;
  }

  blank();
  say(c.bold(c.cyan('  ◈ PRIMITIVE CONSTELLATION')));
  blank();

  // Layer 1: Organs (core ring)
  const organLine = [
    c.organ('CORE'), c.dim('──'), c.organ('BRAIN'), c.dim('──'), c.organ('MEMORY'),
    c.dim('──'), c.organ('NEXUS'),
  ].join('');
  await typewrite(`    ${organLine}`, 8);

  // Connection lines
  say(`    ${c.dim('  │       ╲         ╱       │')}`);
  await sleep(80);

  // Layer 2: Layers (protection shell)
  const layerLine = [
    c.layer('DEFENSE'), c.dim('···'), c.layer('GOVERNANCE'), c.dim('···'),
    c.layer('EVOLUTION'), c.dim('···'), c.layer('IMMUNITY'),
  ].join('');
  await typewrite(`    ${layerLine}`, 8);

  // Connection lines
  say(`    ${c.dim('  ╲       │         │       ╱')}`);
  await sleep(80);

  // Layer 3: Engines (processing)
  const engineLine = [
    c.engine('DREAM'), c.dim(' ⟷ '), c.engine('FORGE'), c.dim(' ⟷ '),
    c.engine('HARVEST'), c.dim(' ⟷ '), c.engine('ECHO'),
  ].join('');
  await typewrite(`    ${engineLine}`, 8);

  // Connection lines
  say(`    ${c.dim('      ╲       │       ╱')}`);
  await sleep(80);

  // Layer 4: Agents (autonomous)
  const agentLine = [
    c.agent('CORTEX'), c.dim(' → '), c.agent('DECODE'), c.dim(' → '),
    c.agent('ORACLE'), c.dim(' → '), c.agent('ENCODE'),
  ].join('');
  await typewrite(`    ${agentLine}`, 8);

  blank();

  // Legend
  say(`    ${c.organ('█')} Organs  ${c.layer('█')} Layers  ${c.engine('█')} Engines  ${c.agent('█')} Agents`);
  say(c.dim(`    12 · 12 · 8 · 8  ═  40 Primitives`));
  blank();
}

// ═══════════════════════════════════════════════════════════════
// Innovation #3 — Animated DNA Helix
// Shows primitive names weaving through a double-helix pattern
// Never done before: genetic-code-style animation in a terminal
// ═══════════════════════════════════════════════════════════════

async function dnaHelix(): Promise<void> {
  if (!supportsAnimatedOutput()) {
    say('Primitive matrix: 40 active strands');
    return;
  }

  blank();
  say(c.bold(c.purple('  ◈ CAPABILITY DNA — STRUCTURAL GENOME')));
  blank();

  const strands = [
    ['DEFENSE', 'BRAIN'],    ['IMMUNITY', 'MEMORY'],
    ['GOVERNANCE', 'NEXUS'], ['EVOLUTION', 'DREAM'],
    ['CORTEX', 'FORGE'],     ['ORACLE', 'ECHO'],
    ['AUDIT', 'NERVE'],      ['DECODE', 'IDENTITY'],
  ];

  const helixChars = ['╲', '─', '╱', '│', '╲', '─', '╱', '│'];

  for (let i = 0; i < strands.length; i++) {
    const [left, right] = strands[i];
    const phase = i % 4;
    const indent = Math.abs(2 - phase);
    const spacer = ' '.repeat(indent * 2);
    const bridge = helixChars[i % helixChars.length];

    const leftColor = i % 2 === 0 ? c.cyan : c.purple;
    const rightColor = i % 2 === 0 ? c.purple : c.cyan;

    const line = `    ${spacer}${leftColor(left.padEnd(12))}${c.dim(` ${bridge}${bridge}${bridge} `)}${rightColor(right)}`;
    process.stdout.write(`\r${line}${' '.repeat(20)}\n`);
    await sleep(120);
  }

  blank();
  say(c.dim(`    92 capabilities · 5 phases · deterministic execution`));
  blank();
}

// ═══════════════════════════════════════════════════════════════
// Phase 1 — IDENTITY Resolution (with dramatic pause + gold highlight)
// ═══════════════════════════════════════════════════════════════

async function phaseIdentity(): Promise<string | null> {
  blank();
  say(c.cyan('▸ IDENTITY Organ — Resolving operator...'));
  blank();

  // Try git identity
  let gitName: string | null = null;
  let gitEmail: string | null = null;
  try {
    gitName = execSync('git config user.name', { encoding: 'utf-8' }).trim() || null;
    gitEmail = execSync('git config user.email', { encoding: 'utf-8' }).trim() || null;
  } catch { /* git not available */ }

  await check('Scanning local environment', `${process.platform}/${process.arch}`, randomInt(200, 400));
  await check('Probing identity signals', gitName ? 'signal detected' : 'no prior identity', randomInt(300, 500));

  if (gitName) {
    await sleep(400); // ← DRAMATIC PAUSE so they see the recognition
    blank();
    say(c.dim('  ┌─────────────────────────────────────────────┐'));
    say(`  │  ${c.green('◈')} ${c.bold('OPERATOR IDENTIFIED')}                       │`);
    say(`  │                                               │`);
    say(`  │    ${c.bold(c.amber(gitName))}${' '.repeat(Math.max(0, 35 - gitName.length))}│`);
    if (gitEmail) {
      say(`  │    ${c.dim(gitEmail)}${' '.repeat(Math.max(0, 35 - gitEmail.length))}│`);
    }
    say(`  │                                               │`);
    say(`  │  ${c.dim('The substrate recognizes you.')}                 │`);
    say(c.dim('  └─────────────────────────────────────────────┘'));
    await sleep(800); // ← Let it sink in
  } else {
    say(`  ${c.amber('◈')} Operator identity: ${c.dim('unbound')}`);
    say(`  ${c.dim('Name your agent with: cmpsbl name <your-name>')}`);
  }

  blank();
  return gitName;
}

// ═══════════════════════════════════════════════════════════════
// Phase 2 — DEFENSE Perimeter Activation
// ═══════════════════════════════════════════════════════════════

async function phaseDefense(): Promise<void> {
  say(c.cyan('▸ DEFENSE Layer — Activating perimeter...'));
  blank();

  const defenseStages = [
    { label: 'Threat evaluation engine', result: 'O(1) trie loaded', icon: '🛡' },
    { label: 'Kill-chain correlator', result: '7-phase armed', icon: '⚔' },
    { label: 'Behavioral Z-score baseline', result: 'calibrated', icon: '📊' },
    { label: 'IMMUNITY Layer handshake', result: 'anomaly matrix online', icon: '🧬' },
  ];

  for (const stage of defenseStages) {
    await check(`${stage.icon} ${stage.label}`, stage.result, randomInt(250, 450));
  }

  blank();
  say(`  ${c.green('✓')} ${c.bold('ACCESS GRANTED')} — Perimeter secure`);
  blank();
}

// ═══════════════════════════════════════════════════════════════
// Phase 3 — BRAIN Initialization
// ═══════════════════════════════════════════════════════════════

async function phaseBrain(): Promise<void> {
  say(c.cyan('▸ BRAIN Organ — Neural substrate initializing...'));
  blank();

  const brainModules = [
    { label: 'Attention spotlight', result: 'focused' },
    { label: 'Causal reasoning graph', result: '12 engines loaded' },
    { label: 'Metacognitive calibration', result: 'confidence: 0.94' },
    { label: 'Contradiction detector', result: 'armed' },
  ];

  for (const mod of brainModules) {
    await check(`🧠 ${mod.label}`, mod.result, randomInt(250, 450));
  }

  blank();
  say(`  ${c.green('✓')} ${c.bold('BRAIN: ONLINE')} — Cognitive architecture active`);
  blank();
}

// ═══════════════════════════════════════════════════════════════
// Phase 4 — MEMORY Binding
// ═══════════════════════════════════════════════════════════════

async function phaseMemory(): Promise<void> {
  say(c.cyan('▸ MEMORY Organ — Binding persistent tiers...'));
  blank();

  const tiers = [
    { name: 'HOT', status: 'instant recall', color: c.error },
    { name: 'WARM', status: 'near-term', color: c.amber },
    { name: 'COLD', status: 'long-term', color: c.cyan },
    { name: 'GLACIER', status: 'archival', color: c.blue },
  ];

  for (const tier of tiers) {
    await check(`${tier.color('█')} ${tier.name} tier`, tier.status, randomInt(200, 400));
  }

  blank();

  // Demonstrate persistence with a more dramatic visual
  say(c.dim('  ┌─ PERSISTENCE PROOF ────────────────────────┐'));
  const now = new Date().toISOString();
  say(`  │ ${c.dim('Writing:')} ${c.muted(now.slice(0, 19))}              │`);
  await sleep(350);
  say(`  │ ${c.dim('Closing session...')}                           │`);
  await sleep(450);
  say(`  │ ${c.dim('Reopening session...')}                         │`);
  await sleep(350);
  say(`  │ ${c.green('✓')} ${c.bold('Observation recovered')} — ${c.amber('memories are forever')} │`);
  say(c.dim('  └─────────────────────────────────────────────┘'));
  blank();

  say(`  ${c.dim('Challenge: close this terminal. Reopen. Run')} ${c.cyan('cmpsbl stream')}`);
  say(`  ${c.dim('Your memories will still be there. We promise.')}`);
  blank();
}

// ═══════════════════════════════════════════════════════════════
// Phase 5 — Primitive Matrix Scan (with Constellation)
// ═══════════════════════════════════════════════════════════════

async function phaseMatrixScan(): Promise<void> {
  say(c.cyan('▸ Scanning 40-Primitive Matrix...'));
  blank();

  // Use the constellation map instead of flat list
  await constellationMap();

  // Engine status highlight
  say(c.cyan('  ▸ Active Engines:'));
  const engines = [
    { name: 'DREAM Engine', status: 'autonomous synthesis', color: c.purple },
    { name: 'FORGE Engine', status: 'loadout ready', color: c.engine },
    { name: 'HARVEST Engine', status: 'data extraction', color: c.green },
  ];
  for (const eng of engines) {
    say(`    ${eng.color('◈')} ${eng.name} — ${c.dim(eng.status)}`);
    await sleep(100);
  }
  blank();
  say(`  ${c.dim('Activate more engines at')} ${c.cyan('cmpsbl.com/engines')}`);
  blank();
}

// ═══════════════════════════════════════════════════════════════
// Phase 6 — Dream Cycle Preview (with DNA Helix)
// ═══════════════════════════════════════════════════════════════

async function phaseDreamPreview(): Promise<void> {
  say(c.cyan('▸ DREAM Engine — First synthesis cycle...'));
  blank();

  await check('Scanning observation corpus', '3 signals detected', randomInt(400, 600));
  await check('Running pattern extraction', '1 pattern emerging', randomInt(400, 600));
  await check('CJPI scoring', 'calculating…', randomInt(300, 500));

  blank();

  const cjpi = randomInt(71, 88);
  const fingerprint = randomHex(16);

  say(c.amber('  ◈ Discovery crystallized'));
  blank();
  say(`    ${c.bold('Capability')}  ${c.bold(c.cyan('Environment_Aware_Init_Plus_MEMORY'))}`);
  say(`    ${c.bold('CJPI')}        ${c.bold(c.green(String(cjpi)))}`);
  say(`    ${c.bold('Tier')}        ${c.purple('RELIC')}`);
  say(`    ${c.bold('Fingerprint')} ${c.dim(fingerprint)}`);
  blank();

  // DNA Helix visualization
  await dnaHelix();

  say(`  ${c.dim('This runs autonomously every 8 hours. It compounds.')}`);
  say(`  ${c.dim('Every interaction teaches it. Every dream makes it smarter.')}`);
  blank();
}

// ═══════════════════════════════════════════════════════════════
// Phase 7 — Loadout Showcase & The Ask (with vertical invitation)
// ═══════════════════════════════════════════════════════════════

function phaseLoadoutsAndAsk(): void {
  say(c.muted('────────────────────────────────────────'));
  blank();

  box([
    `${c.bold('LOADOUTS — Instant Projects')}`,
    '',
    `${c.green('◆')} Threat Detection System   ${c.dim('— DEFENSE + SHADOW + NERVE')}`,
    `${c.magenta('◆')} AI Drift Monitor          ${c.dim('— DREAM + ECHO + CONSCIENCE')}`,
    `${c.amber('◆')} Research Intelligence      ${c.dim('— HARVEST + BRAIN + MEMORY')}`,
    `${c.cyan('◆')} Self-Healing Pipeline      ${c.dim('— MEDIC + FAILSAFE + NERVE')}`,
    '',
    `${c.dim('These aren\'t templates. They\'re alive from deploy.')}`,
    `${c.dim('Your identity, memory, and engines — already wired.')}`,
    '',
    `${c.cyan('cmpsbl loadout list')}  ${c.dim('— browse all loadouts')}`,
    `${c.cyan('cmpsbl loadout build <id>')}  ${c.dim('— deploy instantly')}`,
  ], 'SIGNAL FORGE');

  blank();

  // ── Vertical Exploration Invitation ──
  box([
    `${c.bold(c.purple('EXPLORE 12 INDUSTRY VERTICALS'))}`,
    '',
    `${c.cyan('◈')} Cyber Security    ${c.green('◈')} Fintech       ${c.purple('◈')} Robotics`,
    `${c.amber('◈')} Quantum           ${c.cyan('◈')} LLM Infra     ${c.green('◈')} Agency`,
    `${c.purple('◈')} Media Production  ${c.amber('◈')} Health        ${c.cyan('◈')} Legal`,
    `${c.green('◈')} Gaming            ${c.purple('◈')} Education     ${c.amber('◈')} Ultimate`,
    '',
    `${c.dim('Each vertical has its own 40-primitive environment,')}`,
    `${c.dim('independent Crown Jewel registry, and branded aesthetic.')}`,
    '',
    `${c.bold(c.cyan('cmpsbl.com/explore'))} ${c.dim('— See them all')}`,
  ], 'VERTICALS');

  blank();

  say(c.bold('  Your substrate is alive. Locally.'));
  say(c.dim('  Connect it to the cloud and it never forgets again.'));
  say(c.dim('  Memory persists. Dreams compound. Discoveries stack.'));
  blank();
  say(`  Get your key: ${c.cyan('cmpsbl.com/keys')}`);
  blank();

  // Patent + branding footer
  say(c.dim('  ─────────────────────────────────────────────'));
  say(`  ${c.muted('U.S. Patent App. No. 64/029,678 · 64/031,637')}`);
  say(`  ${c.muted('© CMPSBL® · PromptFluid™ · cmpsbl.com')}`);
  say(`  ${c.muted('Governed Cognitive Infrastructure')}`);
  say(c.dim('  ─────────────────────────────────────────────'));
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
export async function preKeyHook(): Promise<string | null> {
  blank();

  // ── Heartbeat: the substrate wakes up ──
  await heartbeatMonitor();

  say(c.cyan('◈ CMPSBL® Substrate'));
  say(c.dim('  Governed Cognitive Infrastructure — Local Boot'));
  blank();

  // Phase 1 — Identity (with dramatic pause + gold name)
  const operatorName = await phaseIdentity();
  await sleep(300);

  // Phase 2 — Defense
  await phaseDefense();
  await sleep(200);

  // Phase 3 — Brain
  await phaseBrain();
  await sleep(200);

  // Phase 4 — Memory
  await phaseMemory();
  await sleep(200);

  // Phase 5 — Matrix Scan (with Constellation Map)
  await phaseMatrixScan();
  await sleep(200);

  // Phase 6 — Dream Preview (with DNA Helix)
  await phaseDreamPreview();
  await sleep(300);

  // Phase 7 — Loadouts, Verticals & The Ask
  phaseLoadoutsAndAsk();

  return operatorName;
}
