/**
 * Smart Command Suggestions
 * Context-aware next-command suggestions
 */

import { ALL_COMMANDS, type CommandDefinition } from './TerminalCommands';

export interface SmartSuggestion {
  command: string;
  reason: string;
  confidence: number;
}

// Command workflow mappings - what typically follows what
const COMMAND_WORKFLOWS: Record<string, string[]> = {
  // Brain workflows
  'brain.status': ['brain.reflect', 'brain.query', 'brain.optimize', 'brain.patterns'],
  'brain.query': ['brain.recall', 'brain.remember', 'brain.reinforce', 'brain.deep_think'],
  'brain.remember': ['brain.query', 'brain.reinforce', 'brain.graph_build', 'brain.patterns'],
  'brain.reflect': ['brain.dream', 'brain.synthesize', 'brain.patterns', 'brain.session_reflection'],
  'brain.dream': ['dream.cycle', 'brain.reflect', 'brain.patterns', 'brain.synthesize'],
  'brain.optimize': ['brain.status', 'brain.graph_build', 'brain.patterns', 'system.health'],
  'brain.deep_think': ['brain.hypothesis_test', 'brain.synthesize', 'brain.remember', 'brain.patterns'],
  'brain.synthesize': ['brain.patterns', 'brain.graph_build', 'brain.reflect', 'brain.deep_think'],
  'brain.patterns': ['brain.reflect', 'brain.optimize', 'brain.synthesize', 'evolution.status'],
  'brain.graph_build': ['brain.graph_summary', 'brain.patterns', 'brain.synthesize', 'brain.coherence_check'],
  'brain.graph_summary': ['brain.graph_build', 'brain.query', 'brain.patterns', 'brain.coherence_check'],
  'brain.curiosity': ['brain.explore', 'brain.query', 'brain.deep_think', 'brain.synthesize'],
  'brain.explore': ['brain.remember', 'brain.synthesize', 'brain.patterns', 'brain.curiosity'],
  
  // System workflows
  'system.status': ['system.health', 'vision.pulse', 'system.diagnostics', 'evolution.status'],
  'system.health': ['system.heal', 'system.diagnostics', 'vision.metrics', 'evolution.scan'],
  'system.diagnostics': ['system.heal', 'system.health', 'vision.logs', 'system.backup'],
  'system.heal': ['system.health', 'system.status', 'system.diagnostics', 'vision.pulse'],
  'system.backup': ['system.list_backups', 'system.status', 'system.restore', 'system.health'],
  'system.list_backups': ['system.restore', 'system.backup', 'system.status', 'system.health'],
  
  // Vision workflows
  'vision.pulse': ['vision.health', 'system.status', 'vision.metrics', 'vision.logs'],
  'vision.health': ['vision.metrics', 'vision.logs', 'system.heal', 'vision.resilience'],
  'vision.metrics': ['vision.dashboard', 'vision.logs', 'vision.health', 'vision.analytics'],
  'vision.logs': ['vision.metrics', 'vision.health', 'vision.trace', 'system.diagnostics'],
  'vision.dashboard': ['vision.metrics', 'vision.health', 'vision.analytics', 'vision.resilience'],
  'vision.resilience': ['system.heal', 'vision.health', 'vision.logs', 'vision.metrics'],
  
  // Defense workflows
  'defense.status': ['defense.posture', 'defense.anomaly', 'defense.limits', 'defense.rules'],
  'defense.posture': ['defense.anomaly', 'defense.rules', 'defense.limits', 'vision.analytics'],
  'defense.anomaly': ['defense.posture', 'defense.ip_intel', 'defense.rules', 'vision.logs'],
  'defense.anomaly_probe': ['defense.anomaly', 'defense.posture', 'defense.rules', 'vision.analytics'],
  'defense.reputation': ['defense.ip_intel', 'defense.posture', 'defense.anomaly', 'defense.rules'],
  'defense.ip_intel': ['defense.reputation', 'defense.posture', 'defense.anomaly', 'defense.rules'],
  
  // Nexus workflows
  'nexus.status': ['nexus.providers', 'nexus.route_stats', 'nexus.test', 'nexus.text'],
  'nexus.providers': ['nexus.route', 'nexus.route_stats', 'nexus.test', 'nexus.text'],
  'nexus.text': ['nexus.providers', 'nexus.route_stats', 'brain.remember', 'nexus.image'],
  'nexus.image': ['nexus.providers', 'nexus.route_stats', 'nexus.text', 'nexus.test'],
  'nexus.route_stats': ['nexus.providers', 'nexus.test', 'vision.metrics', 'nexus.text'],
  
  // Dream workflows
  'dream.status': ['dream.cycle', 'dream.mood', 'dream.awaken', 'brain.dream'],
  'dream.cycle': ['dream.reflect', 'dream.status', 'brain.reflect', 'brain.patterns'],
  'dream.mood': ['dream.cycle', 'dream.status', 'dream.awaken', 'dream.interpret'],
  'dream.reflect': ['dream.cycle', 'brain.reflect', 'brain.patterns', 'dream.status'],
  'dream.awaken': ['dream.cycle', 'dream.status', 'dream.mood', 'brain.dream'],
  'dream.feed': ['dream.consume', 'dream.cycle', 'dream.interpret', 'dream.reflect'],
  'dream.consume': ['dream.reflect', 'dream.cycle', 'brain.reflect', 'dream.status'],
  
  // Evolution Cycle workflows (formerly modernizer)
  'evolution.status': ['evolution.evolve', 'evolution.evolve status', 'evolution.jobs', 'evolution.quota'],
  'evolution.evolve': ['evolution.evolve shadow', 'evolution.evolve production', 'evolution.evolve verify', 'evolution.evolve status'],
  'evolution.evolve status': ['evolution.evolve', 'evolution.evolve shadow', 'evolution.evolve abort', 'system.health'],
  'evolution.evolve shadow': ['evolution.evolve production', 'evolution.evolve verify', 'evolution.evolve status', 'system.health'],
  'evolution.evolve production': ['evolution.evolve verify', 'evolution.evolve status', 'system.health', 'vision.pulse'],
  'evolution.evolve verify': ['evolution.evolve status', 'system.health', 'vision.pulse', 'evolution.jobs'],
  'evolution.evolve abort': ['evolution.evolve', 'evolution.status', 'system.health', 'evolution.jobs'],
  // Legacy commands (redirect to evolve)
  'evolution.scan': ['evolution.evolve', 'evolution.evolve status', 'evolution.analyze', 'evolution.status'],
  'evolution.propose': ['evolution.evolve', 'evolution.evolve shadow', 'evolution.status', 'evolution.analyze'],
  'evolution.plans': ['evolution.evolve status', 'evolution.evolve shadow', 'evolution.evolve abort', 'evolution.status'],
  'evolution.apply': ['evolution.evolve shadow', 'evolution.evolve production', 'evolution.evolve status', 'system.health'],
  'evolution.rollback': ['evolution.evolve status', 'evolution.status', 'system.health', 'evolution.jobs'],
  'evolution.applied': ['evolution.plans', 'evolution.status', 'evolution.scan', 'system.health'],
  
  // Core workflows
  'core.status': ['core.pulse', 'core.jobs', 'core.config', 'system.status'],
  'core.pulse': ['core.status', 'vision.pulse', 'system.health', 'core.jobs'],
  'core.jobs': ['core.process', 'core.schedule', 'core.status', 'ripple.events'],
  'core.schedule': ['core.jobs', 'core.process', 'core.status', 'ripple.enqueue'],
  
  // Ripple workflows
  'ripple.status': ['ripple.topics', 'ripple.events', 'ripple.pulse', 'core.status'],
  'ripple.topics': ['ripple.events', 'ripple.subscribe', 'ripple.publish', 'ripple.status'],
  'ripple.events': ['ripple.topics', 'ripple.status', 'vision.logs', 'ripple.dead_letter'],
  'ripple.dead_letter': ['ripple.retry', 'ripple.events', 'ripple.status', 'vision.logs'],
  
  // Access workflows
  'access.status': ['access.usage', 'access.quota', 'access.list_keys', 'access.pulse'],
  'access.create_key': ['access.list_keys', 'access.quota', 'access.usage', 'access.validate_key'],
  'access.list_keys': ['access.create_key', 'access.usage', 'access.revoke_key', 'access.quota'],
  'access.usage': ['access.quota', 'access.list_keys', 'access.status', 'vision.metrics'],
  'access.quota': ['access.usage', 'access.list_keys', 'access.subscription', 'access.status'],
  
  // Decode workflows
  'decode.status': ['decode.chat', 'decode.intent', 'decode.learn', 'decode.dream'],
  'decode.chat': ['decode.intent', 'decode.learn', 'brain.remember', 'decode.dream'],
  'decode.intent': ['decode.chat', 'decode.learn', 'brain.remember', 'decode.propose'],
  'decode.learn': ['brain.remember', 'brain.reflect', 'decode.chat', 'brain.patterns'],
  
  // Integration workflows
  'integration.status': ['integration.adapters', 'integration.connections', 'integration.policies', 'integration.pulse'],
  'integration.adapters': ['integration.connect', 'integration.discover', 'integration.connections', 'integration.status'],
  'integration.connect': ['integration.test', 'integration.connections', 'integration.adapters', 'integration.status'],
  'integration.connections': ['integration.disconnect', 'integration.test', 'integration.adapters', 'integration.audit_log'],
  
  // Meta/Terminal workflows
  'help': ['whoami', 'system.status', 'vision.pulse', 'cron.stats'],
  'whoami': ['help', 'system.status', 'audit stats', 'vision.pulse'],
  'history': ['clear', 'export', 'audit', 'audit stats'],
  'audit': ['audit stats', 'audit export', 'history', 'export'],
  'audit stats': ['audit', 'audit export', 'history', 'system.status'],
  'alias': ['alias add', 'macro', 'help', 'whoami'],
  'macro': ['macro list', 'macro run', 'alias', 'schedule'],
  'macro list': ['macro run', 'macro show', 'macro create', 'alias'],
  'schedule': ['schedule list', 'watch', 'core.schedule', 'cron.list'],
  'schedule list': ['schedule cancel', 'schedule clear', 'watch list', 'cron.list'],
  'watch': ['watch list', 'schedule', 'vision.pulse', 'system.status'],
  'watch list': ['watch stop', 'schedule list', 'vision.pulse', 'system.status'],
  
  // Infrastructure workflows
  'cron.list': ['cron.stats', 'cron.start', 'cron.history', 'cron.trigger health-check'],
  'cron.stats': ['cron.list', 'cron.history', 'cron.start', 'analytics.summary'],
  'cron.start': ['cron.list', 'cron.stats', 'cron.stop', 'system.status'],
  'cron.history': ['cron.list', 'cron.stats', 'analytics.summary', 'vision.logs'],
  'ratelimit.status': ['ratelimit.buckets', 'ratelimit.cleanup', 'defense.limits', 'defense.status'],
  'ratelimit.buckets': ['ratelimit.cleanup', 'ratelimit.status', 'defense.limits', 'defense.posture'],
  'snapshot.list': ['snapshot.capture', 'snapshot.stats', 'snapshot.prune', 'evolution.status'],
  'snapshot.capture': ['snapshot.list', 'snapshot.stats', 'snapshot.diff', 'system.status'],
  'analytics.summary': ['analytics.top', 'analytics.dead', 'analytics.rising', 'vision.metrics'],
  'analytics.top': ['analytics.dead', 'analytics.rising', 'analytics.summary', 'vision.analytics'],
  'analytics.dead': ['analytics.rising', 'analytics.top', 'analytics.summary', 'evolution.scan'],
  'stream.status': ['stream.active', 'nexus.status', 'nexus.text', 'vision.pulse'],
  'file.status': ['file.history', 'file.formats', 'brain.remember', 'decode.learn'],
  'file.formats': ['file.status', 'file.history', 'decode.learn', 'brain.query'],
  'nl.parse': ['nl.intents', 'nl.history', 'help', 'system.status'],
  'nl.intents': ['nl.parse', 'nl.history', 'help', 'decode.intent'],

  // CLM workflows
  'clm.status': ['clm.budget', 'clm.cycle', 'clm.review_queue', 'clm.topics'],
  'clm.budget': ['clm.status', 'clm.topics', 'clm.run_all', 'clm.cycle'],
  'clm.topics': ['clm.add_topic', 'clm.status', 'clm.review_queue', 'brain.learn'],
  'clm.cycle': ['clm.status', 'brain.reflect', 'clm.review_queue', 'vision.metrics'],
  'clm.review_queue': ['clm.next_review', 'clm.topics', 'clm.status', 'brain.query'],

  // SEBA workflows
  'seba.status': ['seba.cycle', 'seba.review', 'seba.mode', 'seba.propose'],
  'seba.cycle': ['seba.review', 'seba.status', 'seba.propose', 'vision.pulse'],
  'seba.propose': ['seba.review', 'seba.approve', 'seba.status', 'seba.history'],
  'seba.review': ['seba.approve', 'seba.reject', 'seba.execute', 'seba.status'],
  'seba.approve': ['seba.execute', 'seba.review', 'seba.status', 'system.health'],

  // Cortex workflows
  'cortex.status': ['cortex.intent', 'cortex.policy', 'cortex.active', 'cortex.dispatch'],
  'cortex.intent': ['cortex.dispatch', 'cortex.active', 'cortex.status', 'cortex.policy'],
  'cortex.dispatch': ['cortex.active', 'cortex.status', 'vision.trace', 'cortex.history'],

  // Inclusive workflows
  'inclusive.status': ['inclusive.scan', 'inclusive.violations', 'inclusive.fix', 'inclusive.score'],
  'inclusive.scan': ['inclusive.violations', 'inclusive.fix', 'inclusive.score', 'inclusive.status'],
  'inclusive.violations': ['inclusive.fix', 'inclusive.scan', 'inclusive.status', 'vision.logs'],

  // Encode workflows
  'encode.status': ['encode.queue', 'encode.receipts', 'encode.health', 'modernizer.status'],
  'encode.queue': ['encode.status', 'encode.receipts', 'modernizer.jobs', 'vision.logs'],
  'encode.receipts': ['encode.queue', 'encode.status', 'brain.query', 'modernizer.history'],
};

// Module-level defaults when specific command not found
const MODULE_DEFAULTS: Record<string, string[]> = {
  brain: ['brain.status', 'brain.query', 'brain.reflect', 'brain.patterns'],
  system: ['system.status', 'system.health', 'system.diagnostics', 'vision.pulse'],
  vision: ['vision.pulse', 'vision.health', 'vision.metrics', 'vision.logs'],
  defense: ['defense.status', 'defense.posture', 'defense.anomaly', 'defense.rules'],
  nexus: ['nexus.status', 'nexus.providers', 'nexus.text', 'nexus.route_stats'],
  dream: ['dream.status', 'dream.cycle', 'dream.mood', 'brain.dream'],
  modernizer: ['modernizer.status', 'modernizer.scan', 'modernizer.plans', 'modernizer.applied'],
  core: ['core.status', 'core.jobs', 'core.pulse', 'system.status'],
  ripple: ['ripple.status', 'ripple.topics', 'ripple.events', 'ripple.pulse'],
  access: ['access.status', 'access.usage', 'access.quota', 'access.list_keys'],
  decode: ['decode.status', 'decode.chat', 'decode.intent', 'decode.learn'],
  integration: ['integration.status', 'integration.adapters', 'integration.connections', 'integration.policies'],
  meta: ['help', 'whoami', 'history', 'audit'],
  infra: ['cron.list', 'analytics.summary', 'snapshot.list', 'ratelimit.status'],
  cron: ['cron.list', 'cron.stats', 'cron.start', 'cron.history'],
  ratelimit: ['ratelimit.status', 'ratelimit.buckets', 'ratelimit.cleanup', 'defense.limits'],
  snapshot: ['snapshot.list', 'snapshot.capture', 'snapshot.stats', 'snapshot.prune'],
  analytics: ['analytics.summary', 'analytics.top', 'analytics.dead', 'analytics.rising'],
  stream: ['stream.status', 'stream.active', 'nexus.status', 'nexus.text'],
  file: ['file.status', 'file.history', 'file.formats', 'decode.learn'],
  nl: ['nl.parse', 'nl.intents', 'nl.history', 'help'],
};

// Generate reasons for suggestions
function generateReason(lastCmd: string, suggestedCmd: string): string {
  const lastModule = lastCmd.split('.')[0];
  const sugModule = suggestedCmd.split('.')[0];
  
  // Same module follow-ups
  if (lastModule === sugModule) {
    if (suggestedCmd.includes('status')) return 'Check module status';
    if (suggestedCmd.includes('health')) return 'Verify health';
    if (suggestedCmd.includes('reflect')) return 'Trigger reflection';
    if (suggestedCmd.includes('patterns')) return 'View patterns';
    if (suggestedCmd.includes('query') || suggestedCmd.includes('recall')) return 'Search memories';
    if (suggestedCmd.includes('optimize')) return 'Optimize performance';
    if (suggestedCmd.includes('apply')) return 'Apply changes';
    if (suggestedCmd.includes('validate')) return 'Validate before apply';
    if (suggestedCmd.includes('test')) return 'Test changes';
    if (suggestedCmd.includes('rollback')) return 'Revert if needed';
    return 'Continue workflow';
  }
  
  // Cross-module suggestions
  if (suggestedCmd.includes('health') || suggestedCmd.includes('status')) return 'Verify system state';
  if (suggestedCmd.includes('logs') || suggestedCmd.includes('metrics')) return 'Check diagnostics';
  if (suggestedCmd.includes('heal')) return 'Auto-fix issues';
  if (sugModule === 'brain') return 'Process learnings';
  if (sugModule === 'vision') return 'Monitor results';
  if (sugModule === 'modernizer') return 'Plan improvements';
  
  return 'Suggested next step';
}

/**
 * Generate smart suggestions based on the last executed command
 */
export function generateSmartSuggestions(
  lastCommand: string,
  commandHistory: string[] = [],
  maxSuggestions: number = 4
): SmartSuggestion[] {
  const normalized = lastCommand.toLowerCase().trim().split(' ')[0];
  
  // Get workflow-based suggestions
  let suggestions = COMMAND_WORKFLOWS[normalized] || [];
  
  // Fallback to module defaults
  if (suggestions.length === 0) {
    const module = normalized.split('.')[0];
    suggestions = MODULE_DEFAULTS[module] || MODULE_DEFAULTS['meta'];
  }
  
  // Filter out recently executed commands to avoid repetition
  const recentCmds = new Set(commandHistory.slice(-5).map(c => c.split(' ')[0].toLowerCase()));
  const filtered = suggestions.filter(s => !recentCmds.has(s.toLowerCase()) && s.toLowerCase() !== normalized);
  
  // If all filtered out, use original suggestions minus the last command
  const finalSuggestions = filtered.length > 0 
    ? filtered 
    : suggestions.filter(s => s.toLowerCase() !== normalized);
  
  // Map to SmartSuggestion format with confidence
  return finalSuggestions.slice(0, maxSuggestions).map((cmd, idx) => ({
    command: cmd,
    reason: generateReason(normalized, cmd),
    confidence: 1 - (idx * 0.15), // Decreasing confidence: 1.0, 0.85, 0.7, 0.55
  }));
}

/**
 * Get command definition for a suggestion
 */
export function getSuggestionDefinition(command: string): CommandDefinition | undefined {
  return ALL_COMMANDS.find(c => c.command.toLowerCase() === command.toLowerCase());
}

/**
 * Format suggestions for terminal display
 */
export function formatSuggestionsOutput(suggestions: SmartSuggestion[]): string {
  if (suggestions.length === 0) return '';
  
  let output = '\n┌─ SMART SUGGESTIONS ──────────────────────────────────────────\n│\n';
  
  suggestions.forEach((s, i) => {
    const num = i + 1;
    const def = getSuggestionDefinition(s.command);
    const icon = def?.requiresOperator ? '⚡' : '○';
    output += `│  [${num}] ${icon} ${s.command.padEnd(28)} → ${s.reason}\n`;
  });
  
  output += `│\n│  Press 1-${suggestions.length} to execute, or type a new command\n`;
  output += `└──────────────────────────────────────────────────────────────`;
  
  return output;
}
