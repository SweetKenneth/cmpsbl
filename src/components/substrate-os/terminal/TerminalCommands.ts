/**
 * Terminal Command Registry
 * Complete list of all substrate commands organized by module
 */

import { Brain, Shield, Eye, Zap, MessageSquare, Moon, Settings, Terminal, Cpu, Clock, Search, Database, Activity, Lock, Router, Gauge, Sparkles, Radio, Key, Server, Send, List, PlayCircle, Plug, Globe, Workflow, Users, CreditCard, GitBranch, Box } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface CommandDefinition {
  command: string;
  description: string;
  category: 'brain' | 'decode' | 'defense' | 'nexus' | 'vision' | 'dream' | 'system' | 'modernizer' | 'core' | 'ripple' | 'access' | 'integration' | 'meta';
  icon: LucideIcon;
  requiresOperator: boolean;
  args?: string;
  example?: string;
}

export const BRAIN_COMMANDS: CommandDefinition[] = [
  { command: 'brain.status', description: 'Module health status', category: 'brain', icon: Brain, requiresOperator: false },
  { command: 'brain.query', description: 'Search memories by text', category: 'brain', icon: Search, requiresOperator: true, args: '<query>', example: 'brain.query machine learning' },
  { command: 'brain.remember', description: 'Store a new memory', category: 'brain', icon: Database, requiresOperator: true, args: '<content> [type]', example: 'brain.remember "neural nets learn via backprop" fact' },
  { command: 'brain.recall', description: 'Retrieve specific memories', category: 'brain', icon: Brain, requiresOperator: true, args: '<query> [limit]', example: 'brain.recall quantum 5' },
  { command: 'brain.reflect', description: 'Trigger daily reflection cycle', category: 'brain', icon: Brain, requiresOperator: true },
  { command: 'brain.dream', description: 'Run autonomous dream cycle', category: 'brain', icon: Moon, requiresOperator: true },
  { command: 'brain.reinforce', description: 'Boost memory confidence', category: 'brain', icon: Brain, requiresOperator: true, args: '<memory_id> [boost]' },
  { command: 'brain.synthesize', description: 'Cross-domain synthesis', category: 'brain', icon: Brain, requiresOperator: true },
  { command: 'brain.optimize', description: 'Compress and clean memory', category: 'brain', icon: Brain, requiresOperator: true },
  { command: 'brain.deep_think', description: 'Extended reasoning mode', category: 'brain', icon: Brain, requiresOperator: true, args: '<query> [depth]', example: 'brain.deep_think "consciousness" 3' },
  { command: 'brain.hypothesis_test', description: 'Test against knowledge graph', category: 'brain', icon: Brain, requiresOperator: true, args: '<hypothesis>' },
  { command: 'brain.cognitive_cycle', description: 'Full cognitive loop', category: 'brain', icon: Activity, requiresOperator: true },
  { command: 'brain.continuous_learn', description: 'Toggle 24/7 learning', category: 'brain', icon: Brain, requiresOperator: true, args: '<enabled>', example: 'brain.continuous_learn true' },
  { command: 'brain.graph_build', description: 'Update knowledge graph', category: 'brain', icon: Database, requiresOperator: true },
  { command: 'brain.graph_summary', description: 'Knowledge graph overview', category: 'brain', icon: Database, requiresOperator: false },
  { command: 'brain.curiosity', description: 'Get exploration queries', category: 'brain', icon: Search, requiresOperator: false },
  { command: 'brain.explore', description: 'Active research query', category: 'brain', icon: Search, requiresOperator: true, args: '<query>' },
  { command: 'brain.patterns', description: 'Learning patterns/insights', category: 'brain', icon: Brain, requiresOperator: false },
  { command: 'brain.session_reflection', description: 'Session activity summary', category: 'brain', icon: Clock, requiresOperator: false, args: '[hours]' },
  { command: 'brain.coherence_check', description: 'Memory coherence validation', category: 'brain', icon: Brain, requiresOperator: false, args: '[depth]' },
  { command: 'brain.forecast', description: 'Predictive forecasting', category: 'brain', icon: Activity, requiresOperator: false, args: '[metric] [window]' },
];

export const DECODE_COMMANDS: CommandDefinition[] = [
  { command: 'decode.status', description: 'Module status', category: 'decode', icon: MessageSquare, requiresOperator: false },
  { command: 'decode.chat', description: 'Chat with interpreter', category: 'decode', icon: MessageSquare, requiresOperator: true, args: '<message>', example: 'decode.chat "explain quantum entanglement"' },
  { command: 'decode.intent', description: 'Extract structured intent', category: 'decode', icon: MessageSquare, requiresOperator: true, args: '<message>' },
  { command: 'decode.dream', description: 'Generate dream content', category: 'decode', icon: Moon, requiresOperator: true },
  { command: 'decode.propose', description: 'Submit substrate proposal', category: 'decode', icon: MessageSquare, requiresOperator: true, args: '<idea>' },
  { command: 'decode.learn', description: 'Ingest learning content', category: 'decode', icon: Brain, requiresOperator: true, args: '<content> [source]' },
];

export const DEFENSE_COMMANDS: CommandDefinition[] = [
  { command: 'defense.status', description: 'Module status', category: 'defense', icon: Shield, requiresOperator: false },
  { command: 'defense.analyze', description: 'Analyze request for threats', category: 'defense', icon: Shield, requiresOperator: true, args: '<fingerprint> [ip]' },
  { command: 'defense.reputation', description: 'IP reputation score', category: 'defense', icon: Lock, requiresOperator: true, args: '<ip_address>' },
  { command: 'defense.ip_intel', description: 'Full IP intelligence report', category: 'defense', icon: Shield, requiresOperator: true, args: '<ip_address> [history]' },
  { command: 'defense.anomaly', description: 'Real-time anomaly detection', category: 'defense', icon: Activity, requiresOperator: true, args: '[timeWindow]', example: 'defense.anomaly 6h' },
  { command: 'defense.anomaly_probe', description: 'Statistical z-score analysis', category: 'defense', icon: Activity, requiresOperator: false, args: '[lookbackHours]' },
  { command: 'defense.posture', description: 'Security posture summary', category: 'defense', icon: Shield, requiresOperator: false },
  { command: 'defense.limits', description: 'Rate limit status', category: 'defense', icon: Gauge, requiresOperator: false },
  { command: 'defense.rules', description: 'Active defense rules', category: 'defense', icon: Lock, requiresOperator: false },
];

export const NEXUS_COMMANDS: CommandDefinition[] = [
  { command: 'nexus.status', description: 'Module status', category: 'nexus', icon: Zap, requiresOperator: false },
  { command: 'nexus.route', description: 'Route to best provider', category: 'nexus', icon: Router, requiresOperator: true, args: '<task>' },
  { command: 'nexus.text', description: 'Text generation', category: 'nexus', icon: Zap, requiresOperator: true, args: '<prompt> [model]', example: 'nexus.text "Explain gravity"' },
  { command: 'nexus.image', description: 'Image generation', category: 'nexus', icon: Zap, requiresOperator: true, args: '<prompt> [model]' },
  { command: 'nexus.providers', description: 'Provider availability matrix', category: 'nexus', icon: Router, requiresOperator: false },
  { command: 'nexus.route_stats', description: 'AI routing analytics (24h)', category: 'nexus', icon: Activity, requiresOperator: false },
  { command: 'nexus.test', description: 'Test provider routing', category: 'nexus', icon: Zap, requiresOperator: true, args: '[prompt]' },
];

export const VISION_COMMANDS: CommandDefinition[] = [
  { command: 'vision.status', description: 'Module status', category: 'vision', icon: Eye, requiresOperator: false },
  { command: 'vision.health', description: 'System-wide health', category: 'vision', icon: Activity, requiresOperator: false },
  { command: 'vision.pulse', description: 'Lightweight heartbeat', category: 'vision', icon: Activity, requiresOperator: false },
  { command: 'vision.metrics', description: 'System metrics', category: 'vision', icon: Gauge, requiresOperator: false, args: '[period] [type]' },
  { command: 'vision.logs', description: 'View module logs', category: 'vision', icon: Terminal, requiresOperator: false, args: '[module] [limit]' },
  { command: 'vision.alert', description: 'Create alert', category: 'vision', icon: Activity, requiresOperator: true, args: '<severity> <message>' },
  { command: 'vision.audit', description: 'Query audit log', category: 'vision', icon: Eye, requiresOperator: false, args: '[entity] [action]' },
  { command: 'vision.dashboard', description: 'Dashboard aggregation', category: 'vision', icon: Gauge, requiresOperator: false },
  { command: 'vision.trace', description: 'Distributed tracing', category: 'vision', icon: Eye, requiresOperator: true, args: '[traceId]' },
  { command: 'vision.monitor', description: 'Ecosystem health', category: 'vision', icon: Eye, requiresOperator: false },
  { command: 'vision.resilience', description: 'Error analysis + auto-fix', category: 'vision', icon: Activity, requiresOperator: false },
  { command: 'vision.analytics', description: 'Threat analytics (24h)', category: 'vision', icon: Activity, requiresOperator: false },
  { command: 'vision.health_snapshot', description: 'Quick health snapshot', category: 'vision', icon: Activity, requiresOperator: false },
  { command: 'vision.introspection', description: 'Deep self-analysis', category: 'vision', icon: Eye, requiresOperator: false },
  { command: 'vision.quota', description: 'AI usage quota', category: 'vision', icon: Gauge, requiresOperator: false },
  { command: 'vision.dependency_map', description: 'Module dependencies', category: 'vision', icon: Database, requiresOperator: false },
];

export const DREAM_COMMANDS: CommandDefinition[] = [
  { command: 'dream.status', description: 'Dream-Eater state', category: 'dream', icon: Moon, requiresOperator: false },
  { command: 'dream.mood', description: 'Get/set mood', category: 'dream', icon: Moon, requiresOperator: true, args: '[mood]' },
  { command: 'dream.cycle', description: 'Execute dream cycle', category: 'dream', icon: Moon, requiresOperator: true },
  { command: 'dream.feed', description: 'Submit dream content', category: 'dream', icon: Moon, requiresOperator: true, args: '<content> [type]' },
  { command: 'dream.consume', description: 'Process a dream', category: 'dream', icon: Moon, requiresOperator: true, args: '<dream_id>' },
  { command: 'dream.interpret', description: 'Interpret dream text', category: 'dream', icon: Moon, requiresOperator: true, args: '<text>' },
  { command: 'dream.mutate', description: 'Trigger mutation', category: 'dream', icon: Moon, requiresOperator: true },
  { command: 'dream.reflect', description: 'Dream reflection', category: 'dream', icon: Moon, requiresOperator: true },
  { command: 'dream.awaken', description: 'Awaken Dream-Eater', category: 'dream', icon: Moon, requiresOperator: true },
];

export const SYSTEM_COMMANDS: CommandDefinition[] = [
  { command: 'system.status', description: 'Global system status', category: 'system', icon: Cpu, requiresOperator: false },
  { command: 'system.health', description: 'Full system health', category: 'system', icon: Activity, requiresOperator: false },
  { command: 'system.version', description: 'Substrate version', category: 'system', icon: Cpu, requiresOperator: false },
  { command: 'system.config', description: 'View configuration', category: 'system', icon: Settings, requiresOperator: false, args: '[key]' },
  { command: 'system.audit', description: 'Query audit log', category: 'system', icon: Eye, requiresOperator: false, args: '[since] [type]' },
  { command: 'system.diagnostics', description: 'Full diagnostics', category: 'system', icon: Cpu, requiresOperator: false },
  { command: 'system.heal', description: 'Self-healing trigger', category: 'system', icon: Shield, requiresOperator: true, args: '[target] [force]' },
  { command: 'system.restart', description: 'Restart service', category: 'system', icon: Cpu, requiresOperator: true, args: '[service]' },
  { command: 'system.backup', description: 'Create backup snapshot', category: 'system', icon: Database, requiresOperator: true, args: '[include_data]' },
  { command: 'system.restore', description: 'Restore from backup', category: 'system', icon: Database, requiresOperator: true, args: '<backup_id> [validate_only]' },
  { command: 'system.list_backups', description: 'List available backups', category: 'system', icon: Database, requiresOperator: false },
  { command: 'system.upgrade.propose', description: 'Propose upgrade (shadow)', category: 'system', icon: Cpu, requiresOperator: true, args: '[scope] [notes]' },
  { command: 'system.upgrade.list', description: 'List upgrade plans', category: 'system', icon: Cpu, requiresOperator: false },
  { command: 'system.upgrade.apply', description: 'Apply upgrade plan', category: 'system', icon: Cpu, requiresOperator: true, args: '<plan_id>' },
  { command: 'system.upgrade.rollback', description: 'Rollback upgrade', category: 'system', icon: Cpu, requiresOperator: true, args: '<plan_id>' },
];

export const MODERNIZER_COMMANDS: CommandDefinition[] = [
  { command: 'modernizer.status', description: 'Modernizer service status', category: 'modernizer', icon: Sparkles, requiresOperator: false },
  { command: 'modernizer.jobs', description: 'List recent modernization jobs', category: 'modernizer', icon: Activity, requiresOperator: false, args: '[limit]' },
  { command: 'modernizer.scan', description: 'Scan substrate for improvements', category: 'modernizer', icon: Search, requiresOperator: true, args: '[depth]', example: 'modernizer.scan deep' },
  { command: 'modernizer.analyze', description: 'Quick analysis of a module', category: 'modernizer', icon: Search, requiresOperator: true, args: '[module]' },
  { command: 'modernizer.propose', description: 'Generate upgrade proposal (shadow)', category: 'modernizer', icon: Sparkles, requiresOperator: true, args: '[scope] [notes]', example: 'modernizer.propose brain "optimize memory"' },
  { command: 'modernizer.plans', description: 'List all upgrade plans', category: 'modernizer', icon: Activity, requiresOperator: false },
  { command: 'modernizer.review', description: 'Review a specific plan', category: 'modernizer', icon: Eye, requiresOperator: false, args: '<plan_id>' },
  { command: 'modernizer.validate', description: 'Validate plan readiness', category: 'modernizer', icon: Shield, requiresOperator: false, args: '<plan_id>', example: 'modernizer.validate abc123' },
  { command: 'modernizer.diff', description: 'View plan diff and health comparison', category: 'modernizer', icon: Eye, requiresOperator: false, args: '<plan_id>' },
  { command: 'modernizer.apply', description: 'Apply plan (auto-routes shadow→prod)', category: 'modernizer', icon: Sparkles, requiresOperator: true, args: '<plan_id>' },
  { command: 'modernizer.apply_shadow', description: 'Apply plan to shadow mode only', category: 'modernizer', icon: Sparkles, requiresOperator: true, args: '<plan_id>' },
  { command: 'modernizer.test_shadow', description: 'Test shadow mode changes', category: 'modernizer', icon: Activity, requiresOperator: true, args: '<plan_id>' },
  { command: 'modernizer.apply_production', description: 'Promote shadow to production', category: 'modernizer', icon: Sparkles, requiresOperator: true, args: '<plan_id>' },
  { command: 'modernizer.rollback', description: 'Rollback an applied plan', category: 'modernizer', icon: Shield, requiresOperator: true, args: '<plan_id>' },
  { command: 'modernizer.delete', description: 'Delete/reject a plan', category: 'modernizer', icon: Shield, requiresOperator: true, args: '<plan_id>' },
  { command: 'modernizer.applied', description: 'List all applied improvements', category: 'modernizer', icon: Activity, requiresOperator: false },
  { command: 'modernizer.archived', description: 'Scan archived functions to repurpose', category: 'modernizer', icon: Database, requiresOperator: false },
  { command: 'modernizer.implement', description: 'Generate code for archived function repurposing', category: 'modernizer', icon: Sparkles, requiresOperator: true, args: '<archived_function> <target_action>', example: 'modernizer.implement pf-brain-systems-reasoning brain.deep_think' },
  { command: 'modernizer.export', description: 'Export job assets', category: 'modernizer', icon: Database, requiresOperator: true, args: '<job_id>' },
  { command: 'modernizer.quota', description: 'Check usage limits', category: 'modernizer', icon: Gauge, requiresOperator: false },
];

// CORE module — Kernel, scheduler, lifecycle
export const CORE_COMMANDS: CommandDefinition[] = [
  { command: 'core.status', description: 'Kernel status with uptime', category: 'core', icon: Server, requiresOperator: false },
  { command: 'core.pulse', description: 'Lightweight heartbeat', category: 'core', icon: Activity, requiresOperator: false },
  { command: 'core.boot', description: 'Initialize boot sequence', category: 'core', icon: PlayCircle, requiresOperator: true },
  { command: 'core.schedule', description: 'Schedule a delayed job', category: 'core', icon: Clock, requiresOperator: true, args: '<module> <action> [delay]', example: 'core.schedule brain reflect 5m' },
  { command: 'core.jobs', description: 'List scheduled jobs', category: 'core', icon: List, requiresOperator: false, args: '[status] [limit]' },
  { command: 'core.process', description: 'Process next queued job', category: 'core', icon: PlayCircle, requiresOperator: true },
  { command: 'core.config', description: 'Get/set system config', category: 'core', icon: Settings, requiresOperator: true, args: '[key] [value]' },
  { command: 'core.shutdown', description: 'Graceful system shutdown', category: 'core', icon: Server, requiresOperator: true },
];

// RIPPLE module — Message bus, pub/sub, queues
export const RIPPLE_COMMANDS: CommandDefinition[] = [
  { command: 'ripple.status', description: 'Message bus status', category: 'ripple', icon: Radio, requiresOperator: false },
  { command: 'ripple.pulse', description: 'Lightweight heartbeat', category: 'ripple', icon: Activity, requiresOperator: false },
  { command: 'ripple.topics', description: 'List all topics', category: 'ripple', icon: List, requiresOperator: false },
  { command: 'ripple.events', description: 'Get event log', category: 'ripple', icon: Activity, requiresOperator: false, args: '[topic] [limit]' },
  { command: 'ripple.publish', description: 'Publish event to topic', category: 'ripple', icon: Send, requiresOperator: true, args: '<topic> <event_type> [payload]', example: 'ripple.publish system.alerts health_check "{}"' },
  { command: 'ripple.subscribe', description: 'Subscribe to topic', category: 'ripple', icon: Radio, requiresOperator: true, args: '<topic> <module> <action>' },
  { command: 'ripple.enqueue', description: 'Add job to queue', category: 'ripple', icon: List, requiresOperator: true, args: '<queue> <payload>' },
  { command: 'ripple.dequeue', description: 'Get next from queue', category: 'ripple', icon: List, requiresOperator: true, args: '<queue>' },
  { command: 'ripple.dead_letter', description: 'View failed jobs', category: 'ripple', icon: Shield, requiresOperator: false },
  { command: 'ripple.retry', description: 'Retry failed job', category: 'ripple', icon: PlayCircle, requiresOperator: true, args: '<job_id>' },
];

// ACCESS module — API keys, billing, metering
export const ACCESS_COMMANDS: CommandDefinition[] = [
  { command: 'access.status', description: 'Identity module status', category: 'access', icon: Key, requiresOperator: false },
  { command: 'access.pulse', description: 'Lightweight heartbeat', category: 'access', icon: Activity, requiresOperator: false },
  { command: 'access.create_key', description: 'Create API key', category: 'access', icon: Key, requiresOperator: true, args: '<developer_id> [name] [scopes]', example: 'access.create_key dev_123 "My Key" read,write' },
  { command: 'access.validate_key', description: 'Validate API key', category: 'access', icon: Shield, requiresOperator: true, args: '<api_key>' },
  { command: 'access.revoke_key', description: 'Revoke API key', category: 'access', icon: Lock, requiresOperator: true, args: '<key_id>' },
  { command: 'access.list_keys', description: 'List developer keys', category: 'access', icon: List, requiresOperator: false, args: '<developer_id>' },
  { command: 'access.usage', description: 'Get usage statistics', category: 'access', icon: Gauge, requiresOperator: false, args: '[api_key_id] [start] [end]' },
  { command: 'access.quota', description: 'Check quota remaining', category: 'access', icon: Gauge, requiresOperator: false, args: '<api_key_id>' },
  { command: 'access.subscription', description: 'Get subscription info', category: 'access', icon: Key, requiresOperator: false, args: '<developer_id>' },
];

// INTEGRATION module — Enterprise adapters, auto-discovery, LLM governance
export const INTEGRATION_COMMANDS: CommandDefinition[] = [
  { command: 'integration.status', description: 'Integration module status', category: 'integration', icon: Plug, requiresOperator: false },
  { command: 'integration.pulse', description: 'Lightweight heartbeat', category: 'integration', icon: Activity, requiresOperator: false },
  { command: 'integration.adapters', description: 'List available adapters', category: 'integration', icon: Box, requiresOperator: false },
  { command: 'integration.connect', description: 'Connect enterprise adapter', category: 'integration', icon: Plug, requiresOperator: true, args: '<type> <name> <config>', example: 'integration.connect erp "SAP" {"host":"..."}' },
  { command: 'integration.disconnect', description: 'Disconnect adapter', category: 'integration', icon: Plug, requiresOperator: true, args: '<adapter_id>' },
  { command: 'integration.test', description: 'Test adapter connectivity', category: 'integration', icon: Activity, requiresOperator: true, args: '<adapter_id>' },
  { command: 'integration.connections', description: 'List connected adapters', category: 'integration', icon: Globe, requiresOperator: false },
  { command: 'integration.discover', description: 'Auto-discover client systems', category: 'integration', icon: Search, requiresOperator: true, args: '[target] [depth]', example: 'integration.discover erp deep' },
  { command: 'integration.discovered', description: 'Get discovered endpoints', category: 'integration', icon: List, requiresOperator: false, args: '[adapter_id]' },
  { command: 'integration.map_command', description: 'Map function to terminal cmd', category: 'integration', icon: GitBranch, requiresOperator: true, args: '<func> <cmd> <desc>' },
  { command: 'integration.mapped_commands', description: 'List mapped commands', category: 'integration', icon: Terminal, requiresOperator: false, args: '[adapter_id]' },
  { command: 'integration.execute', description: 'Execute governed LLM action', category: 'integration', icon: PlayCircle, requiresOperator: true, args: '<adapter_id> <action> [params]' },
  { command: 'integration.policies', description: 'Get governance policies', category: 'integration', icon: Shield, requiresOperator: false },
  { command: 'integration.set_policy', description: 'Set governance policy', category: 'integration', icon: Lock, requiresOperator: true, args: '[adapter_id] <policy>' },
  { command: 'integration.audit_log', description: 'View governance audit log', category: 'integration', icon: Eye, requiresOperator: false, args: '[adapter_id] [limit]' },
  { command: 'integration.game_discover', description: 'Discover game engine APIs', category: 'integration', icon: Workflow, requiresOperator: true, args: '<engine_type>', example: 'integration.game_discover unity' },
  { command: 'integration.enterprise_discover', description: 'Discover enterprise APIs', category: 'integration', icon: Users, requiresOperator: true, args: '<system_type>', example: 'integration.enterprise_discover salesforce' },
  { command: 'integration.dev_discover', description: 'Discover dev platform APIs', category: 'integration', icon: GitBranch, requiresOperator: true, args: '<platform_type>', example: 'integration.dev_discover github' },
  { command: 'integration.payroll', description: 'Execute payroll operation', category: 'integration', icon: CreditCard, requiresOperator: true, args: '<adapter_id> <operation> [params]' },
  { command: 'integration.customer_service', description: 'Execute customer service op', category: 'integration', icon: Users, requiresOperator: true, args: '<adapter_id> <operation> [params]' },
];

export const META_COMMANDS: CommandDefinition[] = [
  { command: 'help', description: 'Show all commands', category: 'meta', icon: Terminal, requiresOperator: false },
  { command: 'help brain', description: 'Brain module commands', category: 'meta', icon: Brain, requiresOperator: false },
  { command: 'help decode', description: 'Decode module commands', category: 'meta', icon: MessageSquare, requiresOperator: false },
  { command: 'help defense', description: 'Defense module commands', category: 'meta', icon: Shield, requiresOperator: false },
  { command: 'help nexus', description: 'Nexus module commands', category: 'meta', icon: Zap, requiresOperator: false },
  { command: 'help vision', description: 'Vision module commands', category: 'meta', icon: Eye, requiresOperator: false },
  { command: 'help dream', description: 'Dream module commands', category: 'meta', icon: Moon, requiresOperator: false },
  { command: 'help system', description: 'System module commands', category: 'meta', icon: Cpu, requiresOperator: false },
  { command: 'help modernizer', description: 'Modernizer module commands', category: 'meta', icon: Sparkles, requiresOperator: false },
  { command: 'help core', description: 'Core kernel commands', category: 'meta', icon: Server, requiresOperator: false },
  { command: 'help ripple', description: 'Message bus commands', category: 'meta', icon: Radio, requiresOperator: false },
  { command: 'help access', description: 'Identity/billing commands', category: 'meta', icon: Key, requiresOperator: false },
  { command: 'help integration', description: 'Enterprise integration commands', category: 'meta', icon: Plug, requiresOperator: false },
  { command: 'clear', description: 'Clear terminal history', category: 'meta', icon: Terminal, requiresOperator: false },
  { command: 'whoami', description: 'Display identity', category: 'meta', icon: Cpu, requiresOperator: false },
  { command: 'history', description: 'Command history', category: 'meta', icon: Clock, requiresOperator: false },
  { command: 'export', description: 'Export session log', category: 'meta', icon: Database, requiresOperator: false },
  { command: 'theme', description: 'Toggle terminal theme', category: 'meta', icon: Eye, requiresOperator: false, args: '[dark|light|matrix]' },
];

export const ALL_COMMANDS: CommandDefinition[] = [
  ...BRAIN_COMMANDS,
  ...DECODE_COMMANDS,
  ...DEFENSE_COMMANDS,
  ...NEXUS_COMMANDS,
  ...VISION_COMMANDS,
  ...DREAM_COMMANDS,
  ...SYSTEM_COMMANDS,
  ...MODERNIZER_COMMANDS,
  ...CORE_COMMANDS,
  ...RIPPLE_COMMANDS,
  ...ACCESS_COMMANDS,
  ...INTEGRATION_COMMANDS,
  ...META_COMMANDS,
];

export const COMMAND_CATEGORIES = {
  core: { label: 'CORE', color: 'text-orange-400', borderColor: 'border-orange-500/30', commands: CORE_COMMANDS },
  brain: { label: 'BRAIN', color: 'text-purple-400', borderColor: 'border-purple-500/30', commands: BRAIN_COMMANDS },
  decode: { label: 'DECODE', color: 'text-blue-400', borderColor: 'border-blue-500/30', commands: DECODE_COMMANDS },
  defense: { label: 'DEFENSE', color: 'text-red-400', borderColor: 'border-red-500/30', commands: DEFENSE_COMMANDS },
  nexus: { label: 'NEXUS', color: 'text-amber-400', borderColor: 'border-amber-500/30', commands: NEXUS_COMMANDS },
  vision: { label: 'VISION', color: 'text-cyan-400', borderColor: 'border-cyan-500/30', commands: VISION_COMMANDS },
  dream: { label: 'DREAM', color: 'text-fuchsia-400', borderColor: 'border-fuchsia-500/30', commands: DREAM_COMMANDS },
  ripple: { label: 'RIPPLE', color: 'text-cyan-500', borderColor: 'border-cyan-500/30', commands: RIPPLE_COMMANDS },
  access: { label: 'ACCESS', color: 'text-amber-500', borderColor: 'border-amber-500/30', commands: ACCESS_COMMANDS },
  integration: { label: 'INTEGRATION', color: 'text-emerald-400', borderColor: 'border-emerald-500/30', commands: INTEGRATION_COMMANDS },
  system: { label: 'SYSTEM', color: 'text-gray-400', borderColor: 'border-gray-500/30', commands: SYSTEM_COMMANDS },
  modernizer: { label: 'MODERNIZER', color: 'text-pink-400', borderColor: 'border-pink-500/30', commands: MODERNIZER_COMMANDS },
  meta: { label: 'META', color: 'text-gray-400', borderColor: 'border-gray-500/30', commands: META_COMMANDS },
} as const;

export function findCommand(input: string): CommandDefinition | undefined {
  const normalized = input.toLowerCase().trim().split(' ')[0];
  return ALL_COMMANDS.find(cmd => cmd.command.toLowerCase() === normalized);
}

export function searchCommands(query: string): CommandDefinition[] {
  const normalized = query.toLowerCase().trim();
  if (!normalized) return [];
  
  return ALL_COMMANDS.filter(cmd => 
    cmd.command.toLowerCase().includes(normalized) ||
    cmd.description.toLowerCase().includes(normalized)
  ).slice(0, 10);
}
