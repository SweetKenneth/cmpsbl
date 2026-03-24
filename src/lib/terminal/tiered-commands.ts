/**
 * Tiered Terminal Commands
 * Defines which commands are available at each subscription tier.
 * Free users get essential read-only + crystallization commands.
 * Tiers unlock deeper control surfaces progressively.
 */

export type CommandTier = 'free' | 'studio' | 'creator' | 'architect' | 'governor';

export interface TieredCommand {
  command: string;
  description: string;
  tier: CommandTier;
  category: 'system' | 'memory' | 'build' | 'analytics' | 'governance' | 'evolution' | 'defense' | 'mesh';
}

/**
 * Master command registry with tier gates.
 * Commands are additive — each tier inherits all commands from lower tiers.
 */
export const TIERED_COMMANDS: TieredCommand[] = [
  // ── FREE (12 essential commands) ──────────────────────
  { command: 'help', description: 'Show available commands for your tier', tier: 'free', category: 'system' },
  { command: 'status', description: 'System health overview', tier: 'free', category: 'system' },
  { command: 'whoami', description: 'Show your identity and tier', tier: 'free', category: 'system' },
  { command: 'modules', description: 'List all 40 substrate primitives', tier: 'free', category: 'system' },
  { command: 'memory recall', description: 'Recall memories from your namespace', tier: 'free', category: 'memory' },
  { command: 'memory store', description: 'Store a new memory', tier: 'free', category: 'memory' },
  { command: 'memory stats', description: 'View memory usage and tier counts', tier: 'free', category: 'memory' },
  { command: 'foundry crystallize', description: 'Crystallize a memory chain from the Memory Stream', tier: 'free', category: 'build' },
  { command: 'foundry vault', description: 'View your crystallized memory chain inventory', tier: 'free', category: 'build' },
  { command: 'analytics summary', description: 'Basic system analytics', tier: 'free', category: 'analytics' },
  { command: 'sdk init', description: 'Initialize a new SDK project in your workspace', tier: 'free', category: 'build' },
  { command: 'sdk templates', description: 'List available starter templates', tier: 'free', category: 'build' },

  // ── CREATOR ($29/mo — 18 additional commands) ─────────
  { command: 'nexus route', description: 'Route a prompt through NEXUS fleet', tier: 'creator', category: 'system' },
  { command: 'nexus providers', description: 'List provider health and costs', tier: 'creator', category: 'system' },
  { command: 'decode parse', description: 'Parse natural language into intent', tier: 'creator', category: 'build' },
  { command: 'memory search', description: 'Vector search across memories', tier: 'creator', category: 'memory' },
  { command: 'memory namespaces', description: 'Manage memory namespaces (up to 3)', tier: 'creator', category: 'memory' },
  { command: 'foundry export', description: 'Export a crystallized pipeline (Tier 1–2 languages)', tier: 'creator', category: 'build' },
  { command: 'foundry inspect', description: 'Deep inspect a pipeline\'s CJPI scoring', tier: 'creator', category: 'build' },
  { command: 'sdk build', description: 'Build your workspace project', tier: 'creator', category: 'build' },
  { command: 'sdk deploy', description: 'Deploy your project to preview', tier: 'creator', category: 'build' },
  { command: 'sdk test', description: 'Run tests against your project', tier: 'creator', category: 'build' },
  { command: 'analytics events', description: 'View detailed event streams', tier: 'creator', category: 'analytics' },
  { command: 'analytics costs', description: 'View NEXUS cost breakdown', tier: 'creator', category: 'analytics' },
  { command: 'agents list', description: 'List your active agents', tier: 'creator', category: 'system' },
  { command: 'agents invoke', description: 'Invoke an agent by name', tier: 'creator', category: 'system' },
  { command: 'automation schedule', description: 'Schedule a task to run on cron', tier: 'creator', category: 'build' },
  { command: 'automation list', description: 'List scheduled automations', tier: 'creator', category: 'build' },
  { command: 'engine list', description: 'List available sealed engines', tier: 'creator', category: 'system' },
  { command: 'engine inspect', description: 'Inspect engine capabilities and health', tier: 'creator', category: 'system' },

  // ── STUDIO ($49/mo — 14 additional commands) ──────────
  { command: 'intent submit', description: 'Submit a goal to the Intent Mesh', tier: 'studio', category: 'mesh' },
  { command: 'intent status', description: 'Check goal resolution status', tier: 'studio', category: 'mesh' },
  { command: 'cortex analyze', description: 'Run cognitive load analysis', tier: 'studio', category: 'analytics' },
  { command: 'cortex suggest', description: 'Get optimization suggestions', tier: 'studio', category: 'analytics' },
  { command: 'encode generate', description: 'Generate code from a spec', tier: 'studio', category: 'build' },
  { command: 'encode audit', description: 'Audit a code artifact', tier: 'studio', category: 'build' },
  { command: 'maintenance breakers', description: 'View safety switch states', tier: 'studio', category: 'system' },
  { command: 'maintenance repair', description: 'Trigger auto-repair cycle', tier: 'studio', category: 'system' },
  { command: 'mesh activity', description: 'View mesh overlay activity', tier: 'studio', category: 'mesh' },
  { command: 'mesh synergies', description: 'List active synergy pipelines', tier: 'studio', category: 'mesh' },
  { command: 'foundry export-advanced', description: 'Export to Tier 3 languages (Rust, C, etc.)', tier: 'studio', category: 'build' },
  { command: 'atlas capabilities', description: 'Browse the capability atlas', tier: 'studio', category: 'system' },
  { command: 'sdk publish', description: 'Publish your project to the marketplace', tier: 'studio', category: 'build' },
  { command: 'sdk share', description: 'Share a workspace project with others', tier: 'studio', category: 'build' },

  // ── ARCHITECT ($79/mo — 12 additional commands) ───────
  { command: 'evolution propose', description: 'Submit a self-evolution proposal', tier: 'architect', category: 'evolution' },
  { command: 'evolution history', description: 'View evolution commit history', tier: 'architect', category: 'evolution' },
  { command: 'evolution rollback', description: 'Rollback to a previous evolution stamp', tier: 'architect', category: 'evolution' },
  { command: 'shadow probe', description: 'Run adversarial shadow probe', tier: 'architect', category: 'defense' },
  { command: 'shadow divergence', description: 'View shadow divergence scoring', tier: 'architect', category: 'defense' },
  { command: 'defense citadel', description: 'Citadel status and threat overview', tier: 'architect', category: 'defense' },
  { command: 'defense fingerprint', description: 'View device fingerprint analysis', tier: 'architect', category: 'defense' },
  { command: 'oracle predict', description: 'Run predictive analysis on system trends', tier: 'architect', category: 'analytics' },
  { command: 'memory namespaces-full', description: 'Manage up to 12 namespaces', tier: 'architect', category: 'memory' },
  { command: 'foundry export-silicon', description: 'Export to hardware languages (Verilog, VHDL)', tier: 'architect', category: 'build' },
  { command: 'trace export', description: 'Export execution traces for audit', tier: 'architect', category: 'analytics' },
  { command: 'trace replay', description: 'Replay an execution trace step-by-step', tier: 'architect', category: 'analytics' },

  // ── GOVERNOR (Admin — 10 additional commands) ─────────
  { command: 'governor mint', description: 'Mint new cognitive artifacts', tier: 'governor', category: 'governance' },
  { command: 'governor roles', description: 'Manage user roles and access', tier: 'governor', category: 'governance' },
  { command: 'governor flags', description: 'Toggle feature flags', tier: 'governor', category: 'governance' },
  { command: 'governor canary', description: 'Deploy a canary release', tier: 'governor', category: 'governance' },
  { command: 'governor audit', description: 'View full governance audit log', tier: 'governor', category: 'governance' },
  { command: 'system restart', description: 'Restart substrate subsystems', tier: 'governor', category: 'system' },
  { command: 'system snapshot', description: 'Create a full system snapshot', tier: 'governor', category: 'system' },
  { command: 'control-plane status', description: 'View control plane state', tier: 'governor', category: 'governance' },
  { command: 'control-plane commit', description: 'Commit control plane revision', tier: 'governor', category: 'governance' },
  { command: 'chaos inject', description: 'Inject controlled chaos for resilience testing', tier: 'governor', category: 'governance' },
];

const TIER_ORDER: CommandTier[] = ['free', 'studio', 'creator', 'architect', 'governor'];

/**
 * Get all commands available to a given tier (includes inherited).
 */
export function getCommandsForTier(tier: CommandTier): TieredCommand[] {
  const maxIndex = TIER_ORDER.indexOf(tier);
  return TIERED_COMMANDS.filter(cmd => TIER_ORDER.indexOf(cmd.tier) <= maxIndex);
}

/**
 * Get commands exclusive to a specific tier (not inherited).
 */
export function getExclusiveCommands(tier: CommandTier): TieredCommand[] {
  return TIERED_COMMANDS.filter(cmd => cmd.tier === tier);
}

/**
 * Check if a specific command is available at a tier.
 */
export function isCommandAvailable(command: string, userTier: CommandTier): boolean {
  const cmd = TIERED_COMMANDS.find(c => c.command === command);
  if (!cmd) return false;
  return TIER_ORDER.indexOf(userTier) >= TIER_ORDER.indexOf(cmd.tier);
}

/**
 * Get the tier required for a command.
 */
export function getRequiredTier(command: string): CommandTier | null {
  return TIERED_COMMANDS.find(c => c.command === command)?.tier ?? null;
}

/**
 * Get summary counts per tier.
 */
export function getTierCommandCounts(): Record<CommandTier, number> {
  const counts: Record<CommandTier, number> = { free: 0, studio: 0, creator: 0, architect: 0, governor: 0 };
  for (const tier of TIER_ORDER) {
    counts[tier] = getCommandsForTier(tier).length;
  }
  return counts;
}
