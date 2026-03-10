/**
 * Atlas Module Registry
 * Single source of truth for substrate entities, meshes, and zones
 */

import type { ModuleRegistryEntry, ModuleAction } from './types';

// The canonical entity + mesh + zone registry
export const MODULE_REGISTRY: ModuleRegistryEntry[] = [
  // Kernel Layer
  {
    id: 'core',
    name: 'Core',
    layer: 'kernel',
    status: 'healthy',
    capabilities: ['system.health', 'system.heal', 'system.restart'],
    actions: [
      { id: 'health', name: 'Health Check', risk: 'low', reversible: true, requiresConfirmation: false },
      { id: 'heal', name: 'Self-Heal', risk: 'medium', reversible: true, requiresConfirmation: true },
      { id: 'restart', name: 'Restart Module', risk: 'high', reversible: false, requiresConfirmation: true },
    ],
  },
  {
    id: 'defense',
    name: 'Defense',
    layer: 'kernel',
    status: 'healthy',
    capabilities: ['defense.scan', 'defense.block', 'defense.report'],
    actions: [
      { id: 'scan', name: 'Security Scan', risk: 'low', reversible: true, requiresConfirmation: false },
      { id: 'block', name: 'Block Threat', risk: 'medium', reversible: true, requiresConfirmation: true },
      { id: 'report', name: 'Generate Report', risk: 'low', reversible: true, requiresConfirmation: false },
    ],
  },
  {
    id: 'vision',
    name: 'Vision',
    layer: 'kernel',
    status: 'healthy',
    capabilities: ['vision.observe', 'vision.predict', 'vision.alert'],
    actions: [
      { id: 'observe', name: 'Observe State', risk: 'low', reversible: true, requiresConfirmation: false },
      { id: 'predict', name: 'Predict Trend', risk: 'low', reversible: true, requiresConfirmation: false },
      { id: 'alert', name: 'Set Alert', risk: 'low', reversible: true, requiresConfirmation: false },
    ],
  },
  // Cognitive Layer
  {
    id: 'brain',
    name: 'Brain',
    layer: 'cognitive',
    status: 'healthy',
    capabilities: ['brain.remember', 'brain.recall', 'brain.learn', 'brain.dream'],
    actions: [
      { id: 'remember', name: 'Store Memory', risk: 'low', reversible: true, requiresConfirmation: false },
      { id: 'recall', name: 'Recall Memory', risk: 'low', reversible: true, requiresConfirmation: false },
      { id: 'learn', name: 'Learn Pattern', risk: 'low', reversible: true, requiresConfirmation: false },
      { id: 'dream', name: 'Dream Synthesis', risk: 'medium', reversible: true, requiresConfirmation: true },
      { id: 'reason', name: 'Reason Analysis', risk: 'low', reversible: true, requiresConfirmation: false },
    ],
  },
  {
    id: 'decode',
    name: 'Decode',
    layer: 'cognitive',
    status: 'healthy',
    capabilities: ['decode.interpret', 'decode.classify', 'decode.extract'],
    actions: [
      { id: 'interpret', name: 'Interpret Input', risk: 'low', reversible: true, requiresConfirmation: false },
      { id: 'classify', name: 'Classify Intent', risk: 'low', reversible: true, requiresConfirmation: false },
      { id: 'extract', name: 'Extract Entities', risk: 'low', reversible: true, requiresConfirmation: false },
    ],
  },
  {
    id: 'dream',
    name: 'Dream',
    layer: 'cognitive',
    status: 'healthy',
    capabilities: ['dream.synthesize', 'dream.fuse', 'dream.pool'],
    actions: [
      { id: 'synthesize', name: 'Synthesize Insight', risk: 'low', reversible: true, requiresConfirmation: false },
      { id: 'fuse', name: 'Pattern Fusion', risk: 'medium', reversible: true, requiresConfirmation: true },
      { id: 'pool', name: 'Pool Dreams', risk: 'low', reversible: true, requiresConfirmation: false },
    ],
  },
  // Operational Layer
  {
    id: 'nexus',
    name: 'Nexus',
    layer: 'operational',
    status: 'healthy',
    capabilities: ['nexus.route', 'nexus.generate', 'nexus.models'],
    actions: [
      { id: 'route', name: 'Route Request', risk: 'low', reversible: true, requiresConfirmation: false },
      { id: 'generate', name: 'Generate Content', risk: 'medium', reversible: true, requiresConfirmation: false },
      { id: 'models', name: 'List Models', risk: 'low', reversible: true, requiresConfirmation: false },
    ],
  },
  {
    id: 'ripple',
    name: 'Ripple',
    layer: 'operational',
    status: 'healthy',
    capabilities: ['ripple.emit', 'ripple.subscribe', 'ripple.broadcast'],
    actions: [
      { id: 'emit', name: 'Emit Event', risk: 'low', reversible: false, requiresConfirmation: false },
      { id: 'subscribe', name: 'Subscribe Topic', risk: 'low', reversible: true, requiresConfirmation: false },
      { id: 'broadcast', name: 'Broadcast Message', risk: 'medium', reversible: false, requiresConfirmation: true },
    ],
  },
  {
    id: 'integration',
    name: 'Integration',
    layer: 'operational',
    status: 'healthy',
    capabilities: ['integration.connect', 'integration.sync', 'integration.discover'],
    actions: [
      { id: 'connect', name: 'Connect Adapter', risk: 'medium', reversible: true, requiresConfirmation: true },
      { id: 'sync', name: 'Sync Data', risk: 'medium', reversible: true, requiresConfirmation: true },
      { id: 'discover', name: 'Discover Systems', risk: 'low', reversible: true, requiresConfirmation: false },
    ],
  },
  // Administrative Layer
  {
    id: 'access',
    name: 'Access',
    layer: 'administrative',
    status: 'healthy',
    capabilities: ['access.identity', 'access.keys', 'access.quota'],
    actions: [
      { id: 'identity', name: 'Get Identity', risk: 'low', reversible: true, requiresConfirmation: false },
      { id: 'keys', name: 'Manage Keys', risk: 'high', reversible: true, requiresConfirmation: true },
      { id: 'quota', name: 'Check Quota', risk: 'low', reversible: true, requiresConfirmation: false },
    ],
  },
  {
    id: 'system',
    name: 'System',
    layer: 'administrative',
    status: 'healthy',
    capabilities: ['system.config', 'system.backup', 'system.restore'],
    actions: [
      { id: 'config', name: 'Get Config', risk: 'low', reversible: true, requiresConfirmation: false },
      { id: 'backup', name: 'Create Backup', risk: 'medium', reversible: true, requiresConfirmation: true },
      { id: 'restore', name: 'Restore Backup', risk: 'high', reversible: false, requiresConfirmation: true },
    ],
  },
  {
    id: 'inclusive',
    name: 'Inclusive',
    layer: 'administrative',
    status: 'healthy',
    capabilities: ['inclusive.scan', 'inclusive.repair', 'inclusive.report'],
    actions: [
      { id: 'scan', name: 'A11y Scan', risk: 'low', reversible: true, requiresConfirmation: false },
      { id: 'repair', name: 'Auto Repair', risk: 'medium', reversible: true, requiresConfirmation: true },
      { id: 'report', name: 'Generate Report', risk: 'low', reversible: true, requiresConfirmation: false },
    ],
  },
  // Orchestrator Layer
  {
    id: 'cortex',
    name: 'Cortex',
    layer: 'orchestrator',
    status: 'healthy',
    capabilities: ['cortex.orchestrate', 'cortex.delegate', 'cortex.optimize'],
    actions: [
      { id: 'orchestrate', name: 'Run Pipeline', risk: 'medium', reversible: true, requiresConfirmation: true },
      { id: 'delegate', name: 'Delegate Task', risk: 'medium', reversible: true, requiresConfirmation: true },
      { id: 'optimize', name: 'Optimize Flow', risk: 'low', reversible: true, requiresConfirmation: false },
    ],
  },
  {
    id: 'evolution',
    name: 'Evolution',
    layer: 'orchestrator',
    status: 'healthy',
    capabilities: ['evolution.scan', 'evolution.propose', 'evolution.apply'],
    actions: [
      { id: 'scan', name: 'Scan for Upgrades', risk: 'low', reversible: true, requiresConfirmation: false },
      { id: 'propose', name: 'Propose Changes', risk: 'low', reversible: true, requiresConfirmation: false },
      { id: 'apply', name: 'Apply Evolution', risk: 'high', reversible: true, requiresConfirmation: true },
    ],
  },
  {
    id: 'encode',
    name: 'Encode',
    layer: 'orchestrator',
    status: 'healthy',
    capabilities: ['encode.generate', 'encode.shadow', 'encode.promote'],
    actions: [
      { id: 'generate', name: 'Generate Code', risk: 'medium', reversible: true, requiresConfirmation: true },
      { id: 'shadow', name: 'Shadow Practice', risk: 'low', reversible: true, requiresConfirmation: false },
      { id: 'promote', name: 'Promote to Production', risk: 'high', reversible: true, requiresConfirmation: true },
    ],
  },
  // Infrastructure Layer
  {
    id: 'memory',
    name: 'Memory',
    layer: 'infrastructure',
    status: 'healthy',
    capabilities: ['memory.store', 'memory.recall', 'memory.consolidate'],
    actions: [
      { id: 'store', name: 'Store Vector', risk: 'low', reversible: true, requiresConfirmation: false },
      { id: 'recall', name: 'Semantic Recall', risk: 'low', reversible: true, requiresConfirmation: false },
      { id: 'consolidate', name: 'Consolidate Memory', risk: 'medium', reversible: true, requiresConfirmation: true },
    ],
  },
  {
    id: 'relay',
    name: 'Relay',
    layer: 'infrastructure',
    status: 'healthy',
    capabilities: ['relay.send', 'relay.queue', 'relay.status'],
    actions: [
      { id: 'send', name: 'Send Webhook', risk: 'medium', reversible: false, requiresConfirmation: true },
      { id: 'queue', name: 'Queue Message', risk: 'low', reversible: true, requiresConfirmation: false },
      { id: 'status', name: 'Delivery Status', risk: 'low', reversible: true, requiresConfirmation: false },
    ],
  },
  {
    id: 'audit',
    name: 'Audit',
    layer: 'infrastructure',
    status: 'healthy',
    capabilities: ['audit.log', 'audit.query', 'audit.verify'],
    actions: [
      { id: 'log', name: 'Log Event', risk: 'low', reversible: false, requiresConfirmation: false },
      { id: 'query', name: 'Query Logs', risk: 'low', reversible: true, requiresConfirmation: false },
      { id: 'verify', name: 'Verify Chain', risk: 'low', reversible: true, requiresConfirmation: false },
    ],
  },
  {
    id: 'identity',
    name: 'Identity',
    layer: 'infrastructure',
    status: 'healthy',
    capabilities: ['identity.resolve', 'identity.sign', 'identity.verify'],
    actions: [
      { id: 'resolve', name: 'Resolve Actor', risk: 'low', reversible: true, requiresConfirmation: false },
      { id: 'sign', name: 'Sign Identity', risk: 'medium', reversible: false, requiresConfirmation: true },
      { id: 'verify', name: 'Verify Signature', risk: 'low', reversible: true, requiresConfirmation: false },
    ],
  },
  {
    id: 'economy',
    name: 'Economy',
    layer: 'infrastructure',
    status: 'healthy',
    capabilities: ['economy.cost', 'economy.budget', 'economy.report'],
    actions: [
      { id: 'cost', name: 'Track Cost', risk: 'low', reversible: true, requiresConfirmation: false },
      { id: 'budget', name: 'Set Budget', risk: 'medium', reversible: true, requiresConfirmation: true },
      { id: 'report', name: 'Cost Report', risk: 'low', reversible: true, requiresConfirmation: false },
    ],
  },
  {
    id: 'sandbox',
    name: 'Sandbox',
    layer: 'infrastructure',
    status: 'healthy',
    capabilities: ['sandbox.create', 'sandbox.execute', 'sandbox.destroy'],
    actions: [
      { id: 'create', name: 'Create Sandbox', risk: 'low', reversible: true, requiresConfirmation: false },
      { id: 'execute', name: 'Execute in Sandbox', risk: 'medium', reversible: true, requiresConfirmation: true },
      { id: 'destroy', name: 'Destroy Sandbox', risk: 'low', reversible: true, requiresConfirmation: false },
    ],
  },
];

/**
 * Get the full module registry
 */
export function getRegistry(): ModuleRegistryEntry[] {
  return MODULE_REGISTRY;
}

/**
 * Get a specific module
 */
export function getModule(id: string): ModuleRegistryEntry | undefined {
  return MODULE_REGISTRY.find(m => m.id === id);
}

/**
 * Get an action from a module
 */
export function getAction(moduleId: string, actionId: string): ModuleAction | undefined {
  const module = getModule(moduleId);
  return module?.actions.find(a => a.id === actionId);
}

/**
 * List all available actions
 */
export function listActions(): Array<{ module: string; action: ModuleAction }> {
  const actions: Array<{ module: string; action: ModuleAction }> = [];
  
  for (const module of MODULE_REGISTRY) {
    for (const action of module.actions) {
      actions.push({ module: module.id, action });
    }
  }
  
  return actions;
}

/**
 * Get modules by layer
 */
export function getModulesByLayer(layer: ModuleRegistryEntry['layer']): ModuleRegistryEntry[] {
  return MODULE_REGISTRY.filter(m => m.layer === layer);
}
