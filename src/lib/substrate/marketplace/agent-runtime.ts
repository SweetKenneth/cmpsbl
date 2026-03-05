/**
 * Marketplace Agent Runtime — Sealed Cognitive Agent Provisioning
 * 
 * Capabilities:
 *   - Isolated memory per agent
 *   - Version-minted runtime
 *   - Locked capability sets
 *   - DREAM improvement enabled
 * 
 * Lifecycle: purchase → mint_version → provision_instance → attach_governance
 */

import { emit } from '../events/emit';

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

export interface AgentDefinition {
  id: string;
  name: string;
  version: string;
  capabilities: string[];
  memoryIsolated: boolean;
  dreamEnabled: boolean;
  governancePolicy: GovernancePolicy;
}

export interface GovernancePolicy {
  maxConcurrentTasks: number;
  maxMemoryMB: number;
  allowedModules: string[];
  rateLimitPerMinute: number;
  auditAll: boolean;
}

export interface AgentInstance {
  instanceId: string;
  agentId: string;
  version: string;
  ownerId: string;
  status: 'provisioning' | 'active' | 'suspended' | 'terminated';
  createdAt: number;
  memoryNamespace: string;
  capabilities: string[];
  governancePolicy: GovernancePolicy;
  metrics: {
    tasksCompleted: number;
    tasksFailed: number;
    memoryUsageMB: number;
    lastActiveAt: number;
  };
}

export interface MintResult {
  instanceId: string;
  version: string;
  memoryNamespace: string;
  sealed: boolean;
}

// ═══════════════════════════════════════════════════════════════
// AGENT REGISTRY
// ═══════════════════════════════════════════════════════════════

const agentDefinitions = new Map<string, AgentDefinition>();
const instances = new Map<string, AgentInstance>();

// ═══════════════════════════════════════════════════════════════
// AGENT LIFECYCLE
// ═══════════════════════════════════════════════════════════════

/** Register an agent definition in the marketplace */
export function registerAgent(definition: AgentDefinition): void {
  agentDefinitions.set(definition.id, definition);

  emit({
    module: 'marketplace',
    event_type: 'agent.registered',
    outcome: 'succeeded',
    data: { agent_id: definition.id, name: definition.name, version: definition.version },
  });
}

/** Mint a versioned runtime for a purchased agent */
export function mintRuntime(agentId: string, ownerId: string): MintResult {
  const def = agentDefinitions.get(agentId);
  if (!def) throw new Error(`Agent ${agentId} not found in registry`);

  const instanceId = `inst-${crypto.randomUUID().slice(0, 8)}`;
  const memoryNamespace = `agent:${agentId}:${instanceId}`;

  const instance: AgentInstance = {
    instanceId,
    agentId,
    version: def.version,
    ownerId,
    status: 'provisioning',
    createdAt: Date.now(),
    memoryNamespace,
    capabilities: [...def.capabilities],
    governancePolicy: { ...def.governancePolicy },
    metrics: {
      tasksCompleted: 0,
      tasksFailed: 0,
      memoryUsageMB: 0,
      lastActiveAt: Date.now(),
    },
  };

  instances.set(instanceId, instance);

  emit({
    module: 'marketplace',
    event_type: 'agent.minted',
    outcome: 'succeeded',
    data: { instance_id: instanceId, agent_id: agentId, version: def.version },
  });

  return {
    instanceId,
    version: def.version,
    memoryNamespace,
    sealed: true,
  };
}

/** Provision and activate an agent instance */
export function provisionInstance(instanceId: string): AgentInstance {
  const instance = instances.get(instanceId);
  if (!instance) throw new Error(`Instance ${instanceId} not found`);
  if (instance.status !== 'provisioning') {
    throw new Error(`Instance ${instanceId} is ${instance.status}, expected provisioning`);
  }

  instance.status = 'active';

  emit({
    module: 'marketplace',
    event_type: 'agent.provisioned',
    outcome: 'succeeded',
    data: { instance_id: instanceId, agent_id: instance.agentId },
  });

  return instance;
}

/** Suspend an agent instance */
export function suspendInstance(instanceId: string, reason: string): void {
  const instance = instances.get(instanceId);
  if (!instance) return;
  instance.status = 'suspended';

  emit({
    module: 'marketplace',
    event_type: 'agent.suspended',
    outcome: 'succeeded',
    data: { instance_id: instanceId, reason },
  });
}

/** Terminate an agent instance */
export function terminateInstance(instanceId: string): void {
  const instance = instances.get(instanceId);
  if (!instance) return;
  instance.status = 'terminated';

  emit({
    module: 'marketplace',
    event_type: 'agent.terminated',
    outcome: 'succeeded',
    data: { instance_id: instanceId },
  });
}

// ═══════════════════════════════════════════════════════════════
// QUERIES
// ═══════════════════════════════════════════════════════════════

export function getAgentInstance(instanceId: string): AgentInstance | null {
  return instances.get(instanceId) || null;
}

export function getActiveInstances(): AgentInstance[] {
  return Array.from(instances.values()).filter(i => i.status === 'active');
}

export function getRegisteredAgents(): AgentDefinition[] {
  return Array.from(agentDefinitions.values());
}
