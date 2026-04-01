/**
 * CMPSBL® CLI — Substrate Simulation Engine
 * Optional guided walkthrough created by the founder to teach
 * new developers how to navigate the substrate through
 * authentic "system recovery" missions.
 *
 * Can be exited at any time. Collects feedback on exit.
 * State persisted to ~/.cmpsbl/simulation.json
 *
 * © CMPSBL® — All rights reserved.
 */

import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import * as readline from 'readline';

// ═══════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════

export interface MissionStep {
  instruction: string;
  requiredCommand: string;
  hint: string;
  completedAt: string | null;
}

export interface Mission {
  id: number;
  name: string;
  narrative: string[];
  healthBefore: number;
  healthAfter: number;
  steps: MissionStep[];
  completedAt: string | null;
  celebration: string[];
}

export interface SimulationState {
  active: boolean;
  currentMission: number;
  systemHealth: number;
  startedAt: string;
  lastActiveAt: string;
  completedMissions: number[];
  commandHistory: string[];
  exitedAt: string | null;
  feedback: SimulationFeedback | null;
  graduated: boolean;
}

export interface SimulationFeedback {
  useful: string;
  confusing: string;
  missing: string;
  collectedAt: string;
}

// ═══════════════════════════════════════════════════════════════
// Persistence
// ═══════════════════════════════════════════════════════════════

const SIM_DIR = path.join(os.homedir(), '.cmpsbl');
const SIM_FILE = path.join(SIM_DIR, 'simulation.json');
const FEEDBACK_FILE = path.join(SIM_DIR, 'feedback.json');

function ensureDir(): void {
  if (!fs.existsSync(SIM_DIR)) fs.mkdirSync(SIM_DIR, { recursive: true });
}

export function loadSimulation(): SimulationState | null {
  try {
    if (!fs.existsSync(SIM_FILE)) return null;
    return JSON.parse(fs.readFileSync(SIM_FILE, 'utf-8')) as SimulationState;
  } catch {
    return null;
  }
}

export function saveSimulation(state: SimulationState): void {
  ensureDir();
  state.lastActiveAt = new Date().toISOString();
  fs.writeFileSync(SIM_FILE, JSON.stringify(state, null, 2));
}

function saveFeedback(fb: SimulationFeedback): void {
  ensureDir();
  fs.writeFileSync(FEEDBACK_FILE, JSON.stringify(fb, null, 2));
}

// ═══════════════════════════════════════════════════════════════
// Mission Definitions
// ═══════════════════════════════════════════════════════════════

export const MISSIONS: Mission[] = [
  {
    id: 1,
    name: 'STABILIZE',
    narrative: [
      '◈ EMERGENCY BROADCAST',
      '',
      '  The substrate is operating at critical capacity.',
      '  Core systems are degraded. Health metrics are unreliable.',
      '  An Engineer primitive has requested operator assistance.',
      '',
      '  Your first task: assess the damage and stabilize the system.',
      '  The substrate needs you to run diagnostics and initiate repair.',
    ],
    healthBefore: 35,
    healthAfter: 55,
    steps: [
      {
        instruction: 'Run a health check to assess system status.',
        requiredCommand: 'health',
        hint: 'Try: cmpsbl health',
        completedAt: null,
      },
      {
        instruction: 'Run the diagnostic suite to identify failures.',
        requiredCommand: 'doctor',
        hint: 'Try: cmpsbl doctor',
        completedAt: null,
      },
      {
        instruction: 'Initiate the healing protocol to stabilize core systems.',
        requiredCommand: 'heal',
        hint: 'Try: cmpsbl heal',
        completedAt: null,
      },
    ],
    completedAt: null,
    celebration: [
      '◆ STABILIZATION COMPLETE',
      '',
      '  System health restored from 35% to 55%.',
      '  Core primitives are responding. Memory pathways re-established.',
      '  The substrate acknowledges your intervention.',
      '',
      '  But there\'s more work to do. The forge is offline.',
      '  Proceed to Mission 2: REPAIR.',
    ],
  },
  {
    id: 2,
    name: 'REPAIR',
    narrative: [
      '◈ REPAIR PROTOCOL INITIATED',
      '',
      '  The forge subsystem is dormant. Signal Forge needs a loadout',
      '  to begin producing agents capable of autonomous repair.',
      '',
      '  Your task: activate the forge, discover available loadouts,',
      '  and run a system scan to verify integration.',
    ],
    healthBefore: 55,
    healthAfter: 70,
    steps: [
      {
        instruction: 'Open the forge to see available blueprints.',
        requiredCommand: 'forge',
        hint: 'Try: cmpsbl forge',
        completedAt: null,
      },
      {
        instruction: 'View available loadouts for activation.',
        requiredCommand: 'loadout',
        hint: 'Try: cmpsbl loadout',
        completedAt: null,
      },
      {
        instruction: 'Run a system scan to verify forge integration.',
        requiredCommand: 'scan',
        hint: 'Try: cmpsbl scan',
        completedAt: null,
      },
    ],
    completedAt: null,
    celebration: [
      '◆ REPAIR SEQUENCE COMPLETE',
      '',
      '  System health: 70%. Forge subsystem online.',
      '  Loadout registry is accessible. Scan results nominal.',
      '',
      '  The substrate is beginning to trust you.',
      '  Next: teach the system to think. Mission 3: BUILD.',
    ],
  },
  {
    id: 3,
    name: 'BUILD',
    narrative: [
      '◈ COGNITIVE BRIDGE REQUIRED',
      '',
      '  The substrate can observe, but it cannot reason without',
      '  an operator feeding it context. The BRAIN organ needs',
      '  input — a thought, a memory, a recall pathway.',
      '',
      '  Your task: establish the cognitive loop.',
    ],
    healthBefore: 70,
    healthAfter: 82,
    steps: [
      {
        instruction: 'Send a thought to the BRAIN for processing.',
        requiredCommand: 'think',
        hint: 'Try: cmpsbl think "What is the substrate capable of?"',
        completedAt: null,
      },
      {
        instruction: 'Store a memory in the substrate\'s memory stream.',
        requiredCommand: 'remember',
        hint: 'Try: cmpsbl remember "My first memory in the substrate"',
        completedAt: null,
      },
      {
        instruction: 'Recall a memory to verify the loop is active.',
        requiredCommand: 'recall',
        hint: 'Try: cmpsbl recall memory',
        completedAt: null,
      },
    ],
    completedAt: null,
    celebration: [
      '◆ COGNITIVE LOOP ESTABLISHED',
      '',
      '  System health: 82%. BRAIN is reasoning. Memory stream flowing.',
      '  The substrate just stored its first persistent memory from you.',
      '',
      '  Something is happening below the surface.',
      '  DREAM engine is stirring. Mission 4: DISCOVER.',
    ],
  },
  {
    id: 4,
    name: 'DISCOVER',
    narrative: [
      '◈ DREAM ENGINE ACTIVATING',
      '',
      '  While the substrate rests, DREAM synthesizes.',
      '  Sub-threshold patterns. Connections no algorithm requests.',
      '  Pure emergent cognition. No AI. Just structure.',
      '',
      '  Your task: witness what DREAM has produced and',
      '  observe the Memory Stream in motion.',
    ],
    healthBefore: 82,
    healthAfter: 92,
    steps: [
      {
        instruction: 'Check what DREAM has crystallized.',
        requiredCommand: 'dream',
        hint: 'Try: cmpsbl dream --last',
        completedAt: null,
      },
      {
        instruction: 'View the live Memory Stream.',
        requiredCommand: 'stream',
        hint: 'Try: cmpsbl stream',
        completedAt: null,
      },
      {
        instruction: 'Run a discovery cycle to surface new capabilities.',
        requiredCommand: 'discover',
        hint: 'Try: cmpsbl discover',
        completedAt: null,
      },
    ],
    completedAt: null,
    celebration: [
      '◆ DISCOVERY CYCLE COMPLETE',
      '',
      '  System health: 92%. DREAM engine is producing insights.',
      '  Memory Stream is flowing autonomously.',
      '  The substrate is learning from itself.',
      '',
      '  One final mission remains. You must see the full picture.',
      '  Mission 5: GRADUATE.',
    ],
  },
  {
    id: 5,
    name: 'GRADUATE',
    narrative: [
      '◈ FINAL ASSESSMENT',
      '',
      '  The substrate is nearly whole. But a system without',
      '  awareness of its own topology is a system without purpose.',
      '',
      '  Your final task: witness the full architecture,',
      '  observe its structure, and claim your place as operator.',
    ],
    healthBefore: 92,
    healthAfter: 100,
    steps: [
      {
        instruction: 'Run Ascension to see the full capability map.',
        requiredCommand: 'ascend',
        hint: 'Try: cmpsbl ascend',
        completedAt: null,
      },
      {
        instruction: 'Witness the substrate in real-time narration.',
        requiredCommand: 'witness',
        hint: 'Try: cmpsbl witness',
        completedAt: null,
      },
      {
        instruction: 'View the complete 12·12·8·8 topology.',
        requiredCommand: 'topology',
        hint: 'Try: cmpsbl topology',
        completedAt: null,
      },
    ],
    completedAt: null,
    celebration: [
      '◆ GRADUATION COMPLETE',
      '',
      '  ╔══════════════════════════════════════════════╗',
      '  ║                                              ║',
      '  ║   SUBSTRATE OPERATOR — CERTIFIED             ║',
      '  ║                                              ║',
      '  ║   You restored a degraded system from 35%    ║',
      '  ║   to full operational capacity.               ║',
      '  ║                                              ║',
      '  ║   The substrate remembers your contribution.  ║',
      '  ║                                              ║',
      '  ╚══════════════════════════════════════════════╝',
      '',
      '  You now have full access to all substrate capabilities.',
      '  The simulation is complete. The real work begins.',
      '',
      '  Run cmpsbl help to see everything available to you.',
    ],
  },
];

// ═══════════════════════════════════════════════════════════════
// Simulation API
// ═══════════════════════════════════════════════════════════════

export function createSimulation(): SimulationState {
  return {
    active: true,
    currentMission: 1,
    systemHealth: 35,
    startedAt: new Date().toISOString(),
    lastActiveAt: new Date().toISOString(),
    completedMissions: [],
    commandHistory: [],
    exitedAt: null,
    feedback: null,
    graduated: false,
  };
}

export function getCurrentMission(state: SimulationState): Mission | null {
  if (state.graduated || !state.active) return null;
  return MISSIONS.find(m => m.id === state.currentMission) ?? null;
}

export function getCurrentStep(state: SimulationState): { mission: Mission; stepIndex: number; step: MissionStep } | null {
  const mission = getCurrentMission(state);
  if (!mission) return null;
  const stepIndex = mission.steps.findIndex(s => !s.completedAt);
  if (stepIndex === -1) return null;
  return { mission, stepIndex, step: mission.steps[stepIndex] };
}

/**
 * Record a command execution. If it matches the current step's required command,
 * mark it complete and potentially advance the mission.
 */
export function recordCommand(state: SimulationState, command: string): {
  state: SimulationState;
  stepCompleted: boolean;
  missionCompleted: boolean;
  graduated: boolean;
  celebration: string[] | null;
} {
  state.commandHistory.push(command);

  const current = getCurrentStep(state);
  if (!current) return { state, stepCompleted: false, missionCompleted: false, graduated: false, celebration: null };

  // Check if command matches (fuzzy: startsWith to allow args)
  const normalizedCmd = command.toLowerCase().split(' ')[0];
  if (normalizedCmd !== current.step.requiredCommand) {
    return { state, stepCompleted: false, missionCompleted: false, graduated: false, celebration: null };
  }

  // Mark step complete
  current.step.completedAt = new Date().toISOString();

  // Check if all steps in mission are done
  const allDone = current.mission.steps.every(s => s.completedAt);
  if (!allDone) {
    saveSimulation(state);
    return { state, stepCompleted: true, missionCompleted: false, graduated: false, celebration: null };
  }

  // Mission complete
  current.mission.completedAt = new Date().toISOString();
  state.completedMissions.push(current.mission.id);
  state.systemHealth = current.mission.healthAfter;

  // Advance to next mission or graduate
  const nextMission = MISSIONS.find(m => m.id === current.mission.id + 1);
  if (nextMission) {
    state.currentMission = nextMission.id;
  } else {
    state.graduated = true;
    state.active = false;
  }

  saveSimulation(state);
  return {
    state,
    stepCompleted: true,
    missionCompleted: true,
    graduated: state.graduated,
    celebration: current.mission.celebration,
  };
}

/**
 * Check if a command is blocked by simulation progress.
 * Returns guidance text if blocked, null if allowed.
 */
export function getSimulationGuidance(state: SimulationState, command: string): string | null {
  if (!state.active || state.graduated) return null;

  const current = getCurrentStep(state);
  if (!current) return null;

  // Allow the required command and basic navigation
  const alwaysAllowed = ['help', 'simulate', 'train', 'status', 'whoami', 'version', 'about', 'info', 'shell', 'exit', 'quit'];
  const normalizedCmd = command.toLowerCase().split(' ')[0];
  if (alwaysAllowed.includes(normalizedCmd)) return null;
  if (normalizedCmd === current.step.requiredCommand) return null;

  // Allow any command from already-completed missions
  const completedCommands = MISSIONS
    .filter(m => state.completedMissions.includes(m.id))
    .flatMap(m => m.steps.map(s => s.requiredCommand));
  if (completedCommands.includes(normalizedCmd)) return null;

  // Allow completed steps in current mission
  const completedCurrentSteps = current.mission.steps
    .filter(s => s.completedAt)
    .map(s => s.requiredCommand);
  if (completedCurrentSteps.includes(normalizedCmd)) return null;

  return null; // Don't block — let commands run, just don't advance simulation
}

// ═══════════════════════════════════════════════════════════════
// Feedback Collection
// ═══════════════════════════════════════════════════════════════

export async function collectFeedback(state: SimulationState): Promise<SimulationFeedback> {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

  const ask = (question: string): Promise<string> =>
    new Promise(resolve => rl.question(question, (a: string) => resolve(a.trim())));

  const useful = await ask('\n  Was the simulation useful? (yes/no/somewhat): ');
  const confusing = await ask('  What was confusing, if anything? (or press ENTER to skip): ');
  const missing = await ask('  What did you wish was included? (or press ENTER to skip): ');

  rl.close();

  const fb: SimulationFeedback = {
    useful: useful || 'no response',
    confusing: confusing || 'nothing noted',
    missing: missing || 'nothing noted',
    collectedAt: new Date().toISOString(),
  };

  state.feedback = fb;
  state.exitedAt = new Date().toISOString();
  state.active = false;
  saveSimulation(state);
  saveFeedback(fb);

  return fb;
}

// ═══════════════════════════════════════════════════════════════
// Status Summary
// ═══════════════════════════════════════════════════════════════

export function getSimulationSummary(state: SimulationState): string[] {
  const mission = getCurrentMission(state);
  const step = getCurrentStep(state);
  const lines: string[] = [];

  lines.push(`  Simulation: ${state.active ? 'ACTIVE' : state.graduated ? 'GRADUATED' : 'EXITED'}`);
  lines.push(`  System Health: ${state.systemHealth}%`);
  lines.push(`  Missions Completed: ${state.completedMissions.length}/${MISSIONS.length}`);
  lines.push(`  Commands Executed: ${state.commandHistory.length}`);

  if (mission && step) {
    lines.push('');
    lines.push(`  Current Mission: ${mission.name} (${mission.id}/${MISSIONS.length})`);
    lines.push(`  Current Step: ${step.step.instruction}`);
    lines.push(`  Hint: ${step.step.hint}`);
  } else if (state.graduated) {
    lines.push('');
    lines.push('  All missions complete. You are a certified operator.');
  }

  return lines;
}

/**
 * Get a boot-time message if simulation is active.
 * Returns null if no simulation or not active.
 */
export function getSimulationBootMessage(state: SimulationState | null): string[] | null {
  if (!state || !state.active) return null;

  const mission = getCurrentMission(state);
  const step = getCurrentStep(state);
  if (!mission || !step) return null;

  const completedInMission = mission.steps.filter(s => s.completedAt).length;

  return [
    `  ◈ Simulation Active — Mission ${mission.id}: ${mission.name}`,
    `  System Health: ${state.systemHealth}%  ·  Progress: ${completedInMission}/${mission.steps.length} steps`,
    `  Next: ${step.step.instruction}`,
    `  ${step.step.hint}`,
  ];
}
