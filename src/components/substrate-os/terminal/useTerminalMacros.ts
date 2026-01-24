/**
 * Terminal Macros & Scripts
 * Define and execute multi-command scripts
 */

export interface MacroDefinition {
  name: string;
  description: string;
  commands: string[];
  createdAt: Date;
}

// Builtin macros
export const BUILTIN_MACROS: MacroDefinition[] = [
  {
    name: 'health_check',
    description: 'Full system health verification',
    commands: [
      'system.status',
      'vision.pulse',
      'system.diagnostics',
      'defense.posture',
    ],
    createdAt: new Date(),
  },
  {
    name: 'morning_brief',
    description: 'Daily cognitive briefing',
    commands: [
      'system.health',
      'brain.reflect',
      'dream.status',
      'modernizer.status',
      'vision.analytics',
    ],
    createdAt: new Date(),
  },
  {
    name: 'security_audit',
    description: 'Security posture review',
    commands: [
      'defense.status',
      'defense.posture',
      'defense.anomaly_probe 24',
      'defense.rules',
      'vision.analytics',
    ],
    createdAt: new Date(),
  },
  {
    name: 'brain_optimize',
    description: 'Full brain optimization cycle',
    commands: [
      'brain.status',
      'brain.reflect',
      'brain.synthesize',
      'brain.optimize',
      'brain.graph_build',
    ],
    createdAt: new Date(),
  },
  {
    name: 'upgrade_cycle',
    description: 'Full modernizer upgrade workflow',
    commands: [
      'modernizer.scan deep',
      'modernizer.status',
      'modernizer.plans',
    ],
    createdAt: new Date(),
  },
  {
    name: 'night_cycle',
    description: 'End-of-day dream and reflection',
    commands: [
      'brain.session_reflection 8',
      'dream.cycle',
      'brain.dream',
      'system.backup',
    ],
    createdAt: new Date(),
  },
];

const customMacros: Map<string, MacroDefinition> = new Map();

// Load from localStorage
try {
  const saved = localStorage.getItem('substrate_macros');
  if (saved) {
    const parsed = JSON.parse(saved) as MacroDefinition[];
    parsed.forEach(m => customMacros.set(m.name, { ...m, createdAt: new Date(m.createdAt) }));
  }
} catch (e) {
  console.warn('Failed to load macros from localStorage');
}

function saveMacros() {
  try {
    localStorage.setItem('substrate_macros', JSON.stringify(Array.from(customMacros.values())));
  } catch (e) {
    console.warn('Failed to save macros to localStorage');
  }
}

export function getMacro(name: string): MacroDefinition | undefined {
  return customMacros.get(name) || BUILTIN_MACROS.find(m => m.name === name);
}

export function createMacro(name: string, description: string, commands: string[]): boolean {
  if (BUILTIN_MACROS.some(m => m.name === name)) {
    return false; // Can't override builtins
  }
  customMacros.set(name, { name, description, commands, createdAt: new Date() });
  saveMacros();
  return true;
}

export function deleteMacro(name: string): boolean {
  if (BUILTIN_MACROS.some(m => m.name === name)) {
    return false;
  }
  const result = customMacros.delete(name);
  saveMacros();
  return result;
}

export function listMacros(): MacroDefinition[] {
  return [...BUILTIN_MACROS, ...Array.from(customMacros.values())];
}

export function formatMacroHelp(): string {
  const macros = listMacros();
  const maxNameLen = Math.max(...macros.map(m => m.name.length), 8);
  
  let output = `
┌─ TERMINAL MACROS ────────────────────────────────────────────
│
│  Macros execute multiple commands in sequence.
│  Usage: macro run <name> or @<name>
│
├─ COMMANDS ───────────────────────────────────────────────────
│
│  macro list              ∷  List all macros
│  macro run <name>        ∷  Execute a macro
│  macro show <name>       ∷  Show macro commands
│  macro create <name>     ∷  Create new macro (interactive)
│  macro delete <name>     ∷  Delete custom macro
│
├─ BUILTIN MACROS ─────────────────────────────────────────────
│
`;

  for (const m of BUILTIN_MACROS) {
    const pad = m.name.padEnd(maxNameLen + 2);
    output += `│  @${pad}∷ ${m.description} (${m.commands.length} cmds)\n`;
  }

  const customs = Array.from(customMacros.values());
  if (customs.length > 0) {
    output += `│\n├─ CUSTOM MACROS ──────────────────────────────────────────────\n│\n`;
    for (const m of customs) {
      const pad = m.name.padEnd(maxNameLen + 2);
      output += `│  @${pad}∷ ${m.description} (${m.commands.length} cmds)\n`;
    }
  }

  output += `│\n└──────────────────────────────────────────────────────────────`;
  return output;
}

export function formatMacroDetail(name: string): string {
  const macro = getMacro(name);
  if (!macro) {
    return `▓ ERROR: Macro '${name}' not found`;
  }

  let output = `
┌─ MACRO: ${macro.name} ──────────────────────────────────────────
│
│  ${macro.description}
│
├─ COMMANDS ───────────────────────────────────────────────────
│
`;

  macro.commands.forEach((cmd, i) => {
    output += `│  ${(i + 1).toString().padStart(2)}. ${cmd}\n`;
  });

  output += `│\n│  Created: ${macro.createdAt.toLocaleDateString()}\n`;
  output += `└──────────────────────────────────────────────────────────────`;
  return output;
}
