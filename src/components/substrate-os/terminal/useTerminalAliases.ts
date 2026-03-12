/**
 * Terminal Command Aliases
 * Shorthand aliases for 500+ commands
 */

export interface AliasDefinition {
  alias: string;
  expansion: string;
  description: string;
}

export const BUILTIN_ALIASES: AliasDefinition[] = [
  // Navigation shortcuts
  { alias: 'll', expansion: 'vision.logs brain 10', description: 'List recent brain logs' },
  { alias: 'cls', expansion: 'clear', description: 'Clear terminal' },
  { alias: 'clr', expansion: 'clear', description: 'Clear terminal' },
  { alias: 'h', expansion: 'help', description: 'Show help' },
  { alias: '?', expansion: 'help', description: 'Show help' },
  
  // Status shortcuts
  { alias: 'st', expansion: 'system.status', description: 'System status' },
  { alias: 'hp', expansion: 'vision.pulse', description: 'Health pulse' },
  { alias: 'sh', expansion: 'system.health', description: 'System health' },
  { alias: 'sd', expansion: 'system.diagnostics', description: 'Diagnostics' },
  
  // Brain shortcuts
  { alias: 'br', expansion: 'brain.reflect', description: 'Brain reflect' },
  { alias: 'bq', expansion: 'brain.query', description: 'Brain query' },
  { alias: 'bs', expansion: 'brain.status', description: 'Brain status' },
  
  // Dream shortcuts
  { alias: 'dc', expansion: 'dream.cycle', description: 'Dream cycle' },
  { alias: 'ds', expansion: 'dream.status', description: 'Dream status' },
  
  // Evolution shortcuts (EVOLUTION node)
  { alias: 'me', expansion: 'evolution.evolve', description: 'Evolution Cycle' },
  { alias: 'ms', expansion: 'evolution.evolve status', description: 'Evolution status' },
  { alias: 'ma', expansion: 'evolution.evolve shadow', description: 'Apply shadow' },
  { alias: 'mp', expansion: 'evolution.evolve production', description: 'Apply production' },
  
  // Omega Observer shortcuts (v1.0.0)
  { alias: 'mv', expansion: 'evolution.verify', description: 'Eligibility gate' },
  { alias: 'mf', expansion: 'evolution.forensics', description: 'Historical forensics' },
  { alias: 'mo', expansion: 'evolution.omega', description: 'Omega observer' },
  
  // Defense shortcuts
  { alias: 'dp', expansion: 'defense.posture', description: 'Security posture' },
  { alias: 'da', expansion: 'defense.anomaly_probe', description: 'Anomaly probe' },
  
  // Cortex (Orchestrator) shortcuts
  { alias: 'cp', expansion: 'cortex.propose', description: 'Cortex propose' },
  { alias: 'ce', expansion: 'cortex.evaluate', description: 'Cortex evaluate' },
  { alias: 'ca', expansion: 'cortex.apply', description: 'Cortex apply' },
  { alias: 'cs', expansion: 'cortex.status', description: 'Cortex status' },
  { alias: 'csum', expansion: 'cortex.summary', description: 'Cortex summary' },
  
  // INCLUSIVE (Human Compatibility) shortcuts
  { alias: 'inc.scan', expansion: 'inclusive.scan', description: 'Accessibility scan' },
  { alias: 'inc.repair', expansion: 'inclusive.repair', description: 'Auto-repair issues' },
  { alias: 'inc.report', expansion: 'inclusive.report', description: 'Generate report' },
  { alias: 'inc.validate', expansion: 'inclusive.validate', description: 'Validate repairs' },
  { alias: 'inc.status', expansion: 'inclusive.status', description: 'Module status' },
  { alias: 'inc.coverage', expansion: 'inclusive.coverage', description: 'Template coverage' },
  { alias: 'inc.regressions', expansion: 'inclusive.regressions', description: 'Check regressions' },
  { alias: 'is', expansion: 'inclusive.status', description: 'Inclusive status' },
  { alias: 'isc', expansion: 'inclusive.scan', description: 'Inclusive scan' },
  { alias: 'ir', expansion: 'inclusive.report', description: 'Inclusive report' },
  
  // Ripple v2 shortcuts
  { alias: 'rs', expansion: 'ripple.status', description: 'Ripple bus status' },
  { alias: 'rj', expansion: 'ripple.jobs', description: 'List jobs' },
  { alias: 'rdl', expansion: 'ripple.dead_letter', description: 'Dead-letter queue' },
  { alias: 'rw', expansion: 'ripple.work', description: 'Work next job' },
  { alias: 'rd', expansion: 'ripple.drain', description: 'Drain queue' },
  { alias: 'rc', expansion: 'ripple.circuits', description: 'Safety switches' },
  
  // CLM (Constant Learning Mode) shortcuts
  { alias: 'clms', expansion: 'clm.status', description: 'CLM status' },
  { alias: 'clmc', expansion: 'clm.cycle', description: 'CLM cycle' },
  { alias: 'clmb', expansion: 'clm.budget', description: 'CLM budget' },
  { alias: 'clmt', expansion: 'clm.topics', description: 'CLM topics' },
  { alias: 'clmr', expansion: 'clm.review_queue', description: 'Review queue' },
  
  // SEBA (Self-Evolving Bounded Agent) shortcuts
  { alias: 'ss', expansion: 'seba.status', description: 'SEBA status' },
  { alias: 'sc', expansion: 'seba.cycle', description: 'SEBA cycle' },
  { alias: 'sm', expansion: 'seba.mode', description: 'SEBA mode' },
  { alias: 'sp', expansion: 'seba.propose', description: 'SEBA propose' },
  { alias: 'sr', expansion: 'seba.review', description: 'SEBA review' },
  { alias: 'sh', expansion: 'seba.history', description: 'SEBA history' },
  
  // Quick actions
  { alias: 'heal', expansion: 'system.heal', description: 'Self-healing' },
  { alias: 'fix', expansion: 'system.heal auto true', description: 'Auto-fix issues' },
  { alias: 'reboot', expansion: 'system.restart', description: 'Restart services' },
];

const customAliases: Map<string, AliasDefinition> = new Map();

export function resolveAlias(input: string): string {
  const parts = input.trim().split(/\s+/);
  const potentialAlias = parts[0].toLowerCase();
  
  // Check custom aliases first
  const custom = customAliases.get(potentialAlias);
  if (custom) {
    return custom.expansion + (parts.length > 1 ? ' ' + parts.slice(1).join(' ') : '');
  }
  
  // Check builtin aliases
  const builtin = BUILTIN_ALIASES.find(a => a.alias === potentialAlias);
  if (builtin) {
    return builtin.expansion + (parts.length > 1 ? ' ' + parts.slice(1).join(' ') : '');
  }
  
  return input;
}

export function addAlias(alias: string, expansion: string, description = ''): boolean {
  if (BUILTIN_ALIASES.some(a => a.alias === alias)) {
    return false; // Can't override builtins
  }
  customAliases.set(alias, { alias, expansion, description });
  return true;
}

export function removeAlias(alias: string): boolean {
  return customAliases.delete(alias);
}

export function listAliases(): AliasDefinition[] {
  return [...BUILTIN_ALIASES, ...Array.from(customAliases.values())];
}

export function formatAliasHelp(): string {
  const aliases = listAliases();
  const maxAliasLen = Math.max(...aliases.map(a => a.alias.length));
  const maxExpLen = Math.max(...aliases.map(a => a.expansion.length));
  
  let output = `
┌─ COMMAND ALIASES ────────────────────────────────────────────
│
│  Aliases are shorthand for common commands.
│  Usage: Just type the alias, it expands automatically.
│
├─ BUILTIN ALIASES ────────────────────────────────────────────
│
`;

  for (const a of BUILTIN_ALIASES) {
    const pad1 = a.alias.padEnd(maxAliasLen + 2);
    const pad2 = a.expansion.padEnd(maxExpLen + 2);
    output += `│  ${pad1}→  ${pad2}∷ ${a.description}\n`;
  }

  const customs = Array.from(customAliases.values());
  if (customs.length > 0) {
    output += `│\n├─ CUSTOM ALIASES ─────────────────────────────────────────────\n│\n`;
    for (const a of customs) {
      const pad1 = a.alias.padEnd(maxAliasLen + 2);
      const pad2 = a.expansion.padEnd(maxExpLen + 2);
      output += `│  ${pad1}→  ${pad2}∷ ${a.description}\n`;
    }
  }

  output += `│\n└──────────────────────────────────────────────────────────────`;
  return output;
}
