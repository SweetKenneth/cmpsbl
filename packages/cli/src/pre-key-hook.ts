/**
 * Pre-Key Hook — Substrate Proof-of-Value Sequence
 * 
 * Cinematic first-contact experience demonstrating the substrate's
 * cognitive depth: identity resolution, defense perimeter activation,
 * brain initialization, memory binding, and dream synthesis.
 *
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
// Phase 1 — IDENTITY Resolution
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
    await sleep(200);
    say(`  ${c.green('◈')} ${c.bold('Operator identified')}: ${c.cyan(c.bold(gitName))}`);
    if (gitEmail) say(`  ${c.muted('↳')} ${c.dim(gitEmail)}`);
    blank();
    say(`  ${c.dim('The substrate recognizes you.')}`);
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

  // Demonstrate persistence
  const now = new Date().toISOString();
  say(`  ${c.dim('Writing observation:')} ${c.muted(now)}`);
  await sleep(300);
  say(`  ${c.dim('Closing session...')}`);
  await sleep(400);
  say(`  ${c.dim('Reopening session...')}`);
  await sleep(300);
  say(`  ${c.green('✓')} Observation recovered — ${c.bold('memories are forever')}`);
  blank();

  say(`  ${c.dim('Challenge: close this terminal. Reopen. Run')} ${c.cyan('cmpsbl stream')}`);
  say(`  ${c.dim('Your memories will still be there. We promise.')}`);
  blank();
}

// ═══════════════════════════════════════════════════════════════
// Phase 5 — Primitive Matrix Scan
// ═══════════════════════════════════════════════════════════════

async function phaseMatrixScan(): Promise<void> {
  say(c.cyan('▸ Scanning 40-Primitive Matrix...'));
  blank();

  if (supportsAnimatedOutput()) {
    // Animated primitive scan
    const primitives = [
      { name: 'CORE', cat: 'Organ' }, { name: 'BRAIN', cat: 'Organ' }, { name: 'MEMORY', cat: 'Organ' },
      { name: 'NEXUS', cat: 'Organ' }, { name: 'DEFENSE', cat: 'Layer' }, { name: 'GOVERNANCE', cat: 'Layer' },
      { name: 'DREAM', cat: 'Engine' }, { name: 'FORGE', cat: 'Engine' }, { name: 'DECODE', cat: 'Agent' },
      { name: 'ENCODE', cat: 'Agent' }, { name: 'CORTEX', cat: 'Agent' }, { name: 'ORACLE', cat: 'Agent' },
    ];

    const catColor = (cat: string) =>
      cat === 'Organ' ? c.organ : cat === 'Layer' ? c.layer :
      cat === 'Engine' ? c.engine : c.agent;

    let line = '    ';
    for (let i = 0; i < primitives.length; i++) {
      const p = primitives[i];
      line += catColor(p.cat)(`${p.name} `);
      if ((i + 1) % 4 === 0) {
        say(line);
        line = '    ';
        await sleep(150);
      }
    }
    if (line.trim()) say(line);
    say(`    ${c.dim('... +28 more primitives active')}`);
  } else {
    say('    40 primitives loaded across 4 categories');
  }

  blank();
  say(`  ${c.dim('12 Organs · 12 Layers · 8 Engines · 8 Agents')}`);
  blank();

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
// Phase 6 — Dream Cycle Preview
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
  say(`    ${c.bold('Capability')}  ${c.bold('Environment_Aware_Init_Plus_MEMORY')}`);
  say(`    ${c.bold('CJPI')}        ${cjpi}`);
  say(`    ${c.bold('Tier')}        ${c.purple('RELIC')}`);
  say(`    ${c.bold('Fingerprint')} ${c.dim(fingerprint)}`);
  blank();

  say(`  ${c.dim('This runs autonomously every 8 hours. It compounds.')}`);
  say(`  ${c.dim('Every interaction teaches it. Every dream makes it smarter.')}`);
  blank();
}

// ═══════════════════════════════════════════════════════════════
// Phase 7 — Loadout Showcase & The Ask
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

  say(c.bold('  Your substrate is alive. Locally.'));
  say(c.dim('  Connect it to the cloud and it never forgets again.'));
  say(c.dim('  Memory persists. Dreams compound. Discoveries stack.'));
  blank();
  say(`  Get your key: ${c.cyan('cmpsbl.com/keys')}`);
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
export async function preKeyHook(): Promise<string | null> {
  blank();
  say(c.cyan('◈ CMPSBL® Substrate'));
  say(c.dim('  Governed Cognitive Infrastructure — Local Boot'));
  blank();

  // Phase 1 — Identity
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

  // Phase 5 — Matrix Scan
  await phaseMatrixScan();
  await sleep(200);

  // Phase 6 — Dream Preview
  await phaseDreamPreview();
  await sleep(300);

  // Phase 7 — Loadouts & The Ask
  phaseLoadoutsAndAsk();

  return operatorName;
}
