/**
 * Terminal Command Registry
 * 500+ commands across 38 nodes / 12 sectors
 * Complete list of all substrate commands organized by sector
 *
 * Tier Gating: free | creator | architect | governor
 *   free      = Status, pulse, read-only queries
 *   creator   = Actions, mutations, basic operations ($29/mo)
 *   architect = Evolution, modernizer, advanced ops ($79/mo)
 *   governor  = System restore, dangerous ops, admin-only (CMPSBL)
 */

import { Brain, Shield, Eye, Zap, MessageSquare, Moon, Settings, Terminal, Cpu, Clock, Search, Database, Activity, Lock, Router, Gauge, Sparkles, Radio, Key, Server, Send, List, PlayCircle, Plug, Globe, Workflow, Users, CreditCard, GitBranch, Box, Wand2, FileText, PenTool, FileEdit, FileCheck, Layers, CheckCircle, XCircle, AlertTriangle, RefreshCw, BookOpen, Inbox, Compass, TestTube, ClipboardCheck, Network, Fingerprint } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { SubstrateRole } from '@/hooks/useUserRole';

export type CommandTier = SubstrateRole; // 'free' | 'creator' | 'architect' | 'governor'

export interface CommandDefinition {
  command: string;
  description: string;
  category: 'brain' | 'decode' | 'defense' | 'nexus' | 'vision' | 'dream' | 'system' | 'modernizer' | 'core' | 'ripple' | 'access' | 'integration' | 'cortex' | 'inclusive' | 'clm' | 'autoblog' | 'meta' | 'engine' | 'infra' | 'memory_mod' | 'relay_mod' | 'audit_mod' | 'identity_mod' | 'economy_mod' | 'sandbox_mod' | 'engineer' | 'intent_hub' | 'atlas' | 'sovereign' | 'oracle' | 'conscience' | 'treaty' | 'compass' | 'echo' | 'reflex' | 'forge' | 'lingua' | 'phantom' | 'harvest' | 'medic' | 'nerve' | 'governance' | 'evolution' | 'immunity' | 'observability';
  icon: LucideIcon;
  /** @deprecated Use requiredTier instead */
  requiresOperator: boolean;
  /** Minimum tier required to execute this command */
  requiredTier?: CommandTier;
  args?: string;
  example?: string;
}

/** Check if a user's tier meets the command requirement */
export function meetsRequiredTier(userTier: CommandTier, requiredTier: CommandTier): boolean {
  const tierOrder: CommandTier[] = ['free', 'creator', 'studio', 'architect', 'governor'];
  return tierOrder.indexOf(userTier) >= tierOrder.indexOf(requiredTier);
}

/** Get the required tier for a command (uses requiredTier if set, falls back to requiresOperator mapping) */
export function getCommandTier(cmd: CommandDefinition): CommandTier {
  if (cmd.requiredTier) return cmd.requiredTier;
  // Legacy fallback: requiresOperator=true → creator, false → free
  return cmd.requiresOperator ? 'creator' : 'free';
}

const TIER_LABELS: Record<CommandTier, string> = {
  free: 'FREE',
  creator: 'CREATOR',
  studio: 'STUDIO',
  architect: 'ARCHITECT',
  governor: 'GOVERNOR',
};

export function getTierLabel(tier: CommandTier): string {
  return TIER_LABELS[tier] || tier.toUpperCase();
}

const TIER_ICONS: Record<CommandTier, string> = {
  free: '○',
  creator: '◆',
  studio: '◈',
  architect: '★',
  governor: '◉',
};

export function getTierIcon(tier: CommandTier): string {
  return TIER_ICONS[tier] || '○';
}

export const BRAIN_COMMANDS: CommandDefinition[] = [
  // Core operations — status/read are free, mutations are creator, heavy ops are architect
  { command: 'brain.status', description: 'Full tier status (hot/warm/cold)', category: 'brain', icon: Brain, requiresOperator: false, requiredTier: 'free' },
  { command: 'brain.query', description: 'Search memories by text', category: 'brain', icon: Search, requiresOperator: true, requiredTier: 'creator', args: '<query>', example: 'brain.query machine learning' },
  { command: 'brain.remember', description: 'Store a new memory', category: 'brain', icon: Database, requiresOperator: true, requiredTier: 'creator', args: '<content> [type]', example: 'brain.remember "neural nets learn via backprop" fact' },
  { command: 'brain.recall', description: 'Retrieve specific memories', category: 'brain', icon: Brain, requiresOperator: true, requiredTier: 'creator', args: '<query> [limit]', example: 'brain.recall quantum 5' },
  { command: 'brain.reflect', description: 'Trigger daily reflection cycle', category: 'brain', icon: Brain, requiresOperator: true, requiredTier: 'creator' },
  { command: 'brain.dream', description: 'Run autonomous dream cycle', category: 'brain', icon: Moon, requiresOperator: true, requiredTier: 'creator' },
  { command: 'brain.reinforce', description: 'Boost memory confidence', category: 'brain', icon: Brain, requiresOperator: true, requiredTier: 'creator', args: '<memory_id> [boost]' },
  { command: 'brain.synthesize', description: 'Cross-domain synthesis', category: 'brain', icon: Brain, requiresOperator: true, requiredTier: 'architect' },
  // Memory management — heavy operations require architect
  { command: 'brain.tier', description: 'Run hot→warm→cold tiering cycle', category: 'brain', icon: Database, requiresOperator: true, requiredTier: 'architect', args: '[mode]', example: 'brain.tier aggressive' },
  { command: 'brain.optimize', description: 'Compress and clean memory', category: 'brain', icon: Brain, requiresOperator: true, requiredTier: 'architect' },
  { command: 'brain.prune', description: 'Remove low-value memories', category: 'brain', icon: Database, requiresOperator: true, requiredTier: 'architect', args: '[threshold]', example: 'brain.prune 0.1' },
  // Reasoning
  { command: 'brain.deep_think', description: 'Extended multi-step reasoning', category: 'brain', icon: Brain, requiresOperator: true, requiredTier: 'creator', args: '<query> [depth]', example: 'brain.deep_think "consciousness" 3' },
  { command: 'brain.hypothesis_test', description: 'IF-THEN scenario modeling', category: 'brain', icon: Brain, requiresOperator: true, requiredTier: 'creator', args: '<claim> [context]', example: 'brain.hypothesis_test "memory compression improves recall"' },
  { command: 'brain.causal', description: 'Causal reasoning & hypothesis gen', category: 'brain', icon: Brain, requiresOperator: true, requiredTier: 'creator', args: '[query_id]' },
  { command: 'brain.ethical', description: 'Ethical/legal risk evaluation', category: 'brain', icon: Shield, requiresOperator: true, requiredTier: 'creator', args: '<proposed_action>', example: 'brain.ethical "store user data without consent"' },
  { command: 'brain.self_critique', description: 'Output quality review', category: 'brain', icon: Brain, requiresOperator: true, requiredTier: 'creator', args: '<output> [output_type]', example: 'brain.self_critique "report content" text' },
  { command: 'brain.systems_reason', description: 'Multi-layer dependency mapping', category: 'brain', icon: Brain, requiresOperator: true, requiredTier: 'architect', args: '<system> <issue>', example: 'brain.systems_reason substrate "slow response"' },
  { command: 'brain.pattern_fusion', description: 'Merge insights from unrelated domains', category: 'brain', icon: Brain, requiresOperator: true, requiredTier: 'architect', args: '<problem> [domain_1] [domain_2]', example: 'brain.pattern_fusion "optimize memory" biology architecture' },
  // Learning & knowledge
  { command: 'brain.cognitive_cycle', description: 'Full cognitive loop', category: 'brain', icon: Activity, requiresOperator: true, requiredTier: 'architect' },
  { command: 'brain.continuous_learn', description: 'Toggle 24/7 learning', category: 'brain', icon: Brain, requiresOperator: true, requiredTier: 'architect', args: '<enabled>', example: 'brain.continuous_learn true' },
  { command: 'brain.graph_build', description: 'Update knowledge graph', category: 'brain', icon: Database, requiresOperator: true, requiredTier: 'architect' },
  { command: 'brain.graph_summary', description: 'Knowledge graph overview', category: 'brain', icon: Database, requiresOperator: false, requiredTier: 'free' },
  { command: 'brain.graph', description: 'Knowledge graph surfaces', category: 'brain', icon: Database, requiresOperator: false, requiredTier: 'free', args: '[--inspect|--stats|--export]' },
  { command: 'brain.synthesize_knowledge', description: 'Compress findings into core principles', category: 'brain', icon: Brain, requiresOperator: true, requiredTier: 'architect' },
  { command: 'brain.lesson_compress', description: 'Compress session learnings into lesson cards', category: 'brain', icon: Brain, requiresOperator: true, requiredTier: 'creator', args: '[timeframe]', example: 'brain.lesson_compress last_hour' },
  // Analysis & monitoring — reads are free
  { command: 'brain.curiosity', description: 'Get exploration queries', category: 'brain', icon: Search, requiresOperator: false, requiredTier: 'free' },
  { command: 'brain.curiosity_reflect', description: 'Prioritize topics by curiosity score', category: 'brain', icon: Search, requiresOperator: true, requiredTier: 'creator' },
  { command: 'brain.explore', description: 'Active research query', category: 'brain', icon: Search, requiresOperator: true, requiredTier: 'creator', args: '<query>' },
  { command: 'brain.patterns', description: 'Learning patterns/insights', category: 'brain', icon: Brain, requiresOperator: false, requiredTier: 'free' },
  { command: 'brain.session_reflection', description: 'Session activity summary', category: 'brain', icon: Clock, requiresOperator: false, requiredTier: 'free', args: '[hours]' },
  { command: 'brain.coherence_check', description: 'Memory coherence validation', category: 'brain', icon: Brain, requiresOperator: false, requiredTier: 'free', args: '[depth]' },
  { command: 'brain.forecast', description: 'Predictive forecasting', category: 'brain', icon: Activity, requiresOperator: false, requiredTier: 'free', args: '[metric] [window]' },
  { command: 'brain.forecast_eval', description: 'Evaluate forecast accuracy', category: 'brain', icon: Activity, requiresOperator: true, requiredTier: 'creator' },
  // Advanced cognition
  { command: 'brain.tone_detect', description: 'Emotional tone & persona analysis', category: 'brain', icon: Brain, requiresOperator: true, requiredTier: 'creator', args: '<message>', example: 'brain.tone_detect "I am confused about this feature"' },
  { command: 'brain.insight_aggregate', description: 'Cross-module metric collection', category: 'brain', icon: Database, requiresOperator: true, requiredTier: 'architect' },
  { command: 'brain.insight_synthesize', description: 'Strategic insight generation', category: 'brain', icon: Brain, requiresOperator: true, requiredTier: 'architect' },
  { command: 'brain.temporal_score', description: 'Memory freshness scoring', category: 'brain', icon: Clock, requiresOperator: true, requiredTier: 'creator', args: '[query] [context_type]', example: 'brain.temporal_score research' },
  { command: 'brain.reflexive_plan', description: 'Task decomposition with context audit', category: 'brain', icon: Brain, requiresOperator: true, requiredTier: 'creator', args: '<task> [context]', example: 'brain.reflexive_plan "optimize memory tiering"' },
  { command: 'brain.reward', description: 'Apply reward/penalty to memory confidence', category: 'brain', icon: Brain, requiresOperator: true, requiredTier: 'creator', args: '<memory_id> [reward_score] [outcome_type]', example: 'brain.reward abc123 0.1 positive' },
  { command: 'brain.reinforce_cycle', description: 'Enhanced reinforcement learning', category: 'brain', icon: Brain, requiresOperator: true, requiredTier: 'architect', args: '[lookbackHours] [minScore]', example: 'brain.reinforce_cycle 24 0.5' },
  { command: 'brain.persona_refine', description: 'Optimize persona patterns', category: 'brain', icon: Brain, requiresOperator: true, requiredTier: 'architect' },
];

export const DECODE_COMMANDS: CommandDefinition[] = [
  { command: 'decode.status', description: 'Module status', category: 'decode', icon: MessageSquare, requiresOperator: false, requiredTier: 'free' },
  { command: 'decode.chat', description: 'Chat with interpreter', category: 'decode', icon: MessageSquare, requiresOperator: true, requiredTier: 'creator', args: '<message>', example: 'decode.chat "explain quantum entanglement"' },
  { command: 'decode.intent', description: 'Extract structured intent', category: 'decode', icon: MessageSquare, requiresOperator: true, requiredTier: 'creator', args: '<message>' },
  { command: 'decode.dream', description: 'Generate dream content', category: 'decode', icon: Moon, requiresOperator: true, requiredTier: 'creator' },
  { command: 'decode.propose', description: 'Submit substrate proposal', category: 'decode', icon: MessageSquare, requiresOperator: true, requiredTier: 'creator', args: '<idea>' },
  { command: 'decode.learn', description: 'Ingest learning content', category: 'decode', icon: Brain, requiresOperator: true, requiredTier: 'creator', args: '<content> [source]' },
  // Personality subsystem (v7.1.0) - interpretive filters only
  { command: 'decode.personality.list', description: 'List personality profiles', category: 'decode', icon: MessageSquare, requiresOperator: false, requiredTier: 'free' },
  { command: 'decode.personality.get', description: 'Get current personality', category: 'decode', icon: MessageSquare, requiresOperator: false, requiredTier: 'free' },
  { command: 'decode.personality.set', description: 'Set personality profile', category: 'decode', icon: MessageSquare, requiresOperator: true, requiredTier: 'creator', args: '<profile>', example: 'decode.personality.set technical' },
  { command: 'decode.personality.auto', description: 'Enable auto-detection', category: 'decode', icon: MessageSquare, requiresOperator: true, requiredTier: 'creator' },
  { command: 'decode.personality.lock', description: 'Lock current profile', category: 'decode', icon: MessageSquare, requiresOperator: true, requiredTier: 'creator' },
  { command: 'decode.personality.unlock', description: 'Unlock profile switching', category: 'decode', icon: MessageSquare, requiresOperator: true, requiredTier: 'creator' },
  { command: 'decode.personality.detect', description: 'Detect personality from text', category: 'decode', icon: MessageSquare, requiresOperator: false, requiredTier: 'free', args: '<text>', example: 'decode.personality.detect "why is this broken again?!"' },
  { command: 'decode.personality.interpret', description: 'Interpret with personality lens', category: 'decode', icon: MessageSquare, requiresOperator: false, requiredTier: 'free', args: '<text>', example: 'decode.personality.interpret "explain how this works"' },
  { command: 'decode.personality.reset', description: 'Reset to neutral profile', category: 'decode', icon: MessageSquare, requiresOperator: true, requiredTier: 'creator' },
];

export const DEFENSE_COMMANDS: CommandDefinition[] = [
  { command: 'defense.status', description: 'Module status', category: 'defense', icon: Shield, requiresOperator: false, requiredTier: 'free' },
  { command: 'defense.analyze', description: 'Analyze request for threats', category: 'defense', icon: Shield, requiresOperator: true, requiredTier: 'creator', args: '<fingerprint> [ip]' },
  { command: 'defense.reputation', description: 'IP reputation score', category: 'defense', icon: Lock, requiresOperator: true, requiredTier: 'creator', args: '<ip_address>' },
  { command: 'defense.ip_intel', description: 'Full IP intelligence report', category: 'defense', icon: Shield, requiresOperator: true, requiredTier: 'creator', args: '<ip_address> [history]' },
  { command: 'defense.anomaly', description: 'Real-time anomaly detection', category: 'defense', icon: Activity, requiresOperator: true, requiredTier: 'creator', args: '[timeWindow]', example: 'defense.anomaly 6h' },
  { command: 'defense.anomaly_probe', description: 'Statistical z-score analysis', category: 'defense', icon: Activity, requiresOperator: false, requiredTier: 'free', args: '[lookbackHours]' },
  { command: 'defense.posture', description: 'Security posture summary', category: 'defense', icon: Shield, requiresOperator: false, requiredTier: 'free' },
  { command: 'defense.limits', description: 'Rate limit status', category: 'defense', icon: Gauge, requiresOperator: false, requiredTier: 'free' },
  { command: 'defense.rules', description: 'Active defense rules', category: 'defense', icon: Lock, requiresOperator: false, requiredTier: 'free' },
];

export const NEXUS_COMMANDS: CommandDefinition[] = [
  { command: 'nexus.status', description: 'Module status with analytics', category: 'nexus', icon: Zap, requiresOperator: false, requiredTier: 'free' },
  { command: 'nexus.route', description: 'Route to best provider', category: 'nexus', icon: Router, requiresOperator: true, requiredTier: 'creator', args: '<task>' },
  { command: 'nexus.text', description: 'Text generation via routing spine', category: 'nexus', icon: Zap, requiresOperator: true, requiredTier: 'creator', args: '<prompt> [model]', example: 'nexus.text "Explain gravity"' },
  { command: 'nexus.image', description: 'Image generation metadata', category: 'nexus', icon: Zap, requiresOperator: true, requiredTier: 'creator', args: '<prompt> [model]', example: 'nexus.image "a blue fox" dalle' },
  { command: 'nexus.providers', description: 'Provider registry + capabilities', category: 'nexus', icon: Router, requiresOperator: false, requiredTier: 'free' },
  { command: 'nexus.route_stats', description: 'AI routing analytics (24h)', category: 'nexus', icon: Activity, requiresOperator: false, requiredTier: 'free' },
  { command: 'nexus.analytics', description: 'Session analytics accumulator', category: 'nexus', icon: Gauge, requiresOperator: false, requiredTier: 'free' },
  { command: 'nexus.test', description: 'Test provider routing', category: 'nexus', icon: Zap, requiresOperator: true, requiredTier: 'creator', args: '[prompt]' },
  { command: 'nexus.pulse', description: 'Lightweight heartbeat', category: 'nexus', icon: Activity, requiresOperator: false, requiredTier: 'free' },
];

export const VISION_COMMANDS: CommandDefinition[] = [
  { command: 'vision.status', description: 'Module status (Vee v2.0)', category: 'vision', icon: Eye, requiresOperator: false, requiredTier: 'free' },
  { command: 'vision.health', description: 'System-wide health', category: 'vision', icon: Activity, requiresOperator: false, requiredTier: 'free' },
  { command: 'vision.pulse', description: 'Lightweight heartbeat', category: 'vision', icon: Activity, requiresOperator: false, requiredTier: 'free' },
  { command: 'vision.metrics', description: 'System metrics', category: 'vision', icon: Gauge, requiresOperator: false, requiredTier: 'free', args: '[period] [type]' },
  { command: 'vision.logs', description: 'View module logs', category: 'vision', icon: Terminal, requiresOperator: false, requiredTier: 'free', args: '[module] [limit]' },
  { command: 'vision.alert', description: 'Create alert', category: 'vision', icon: Activity, requiresOperator: true, requiredTier: 'creator', args: '<severity> <message>' },
  { command: 'vision.audit', description: 'Query audit log', category: 'vision', icon: Eye, requiresOperator: false, requiredTier: 'free', args: '[entity] [action]' },
  { command: 'vision.dashboard', description: 'Dashboard aggregation', category: 'vision', icon: Gauge, requiresOperator: false, requiredTier: 'free' },
  { command: 'vision.trace', description: 'Distributed tracing with causal chains', category: 'vision', icon: Eye, requiresOperator: true, requiredTier: 'creator', args: '[traceId|eventId]', example: 'vision.trace abc123' },
  { command: 'vision.monitor', description: 'Ecosystem health', category: 'vision', icon: Eye, requiresOperator: false, requiredTier: 'free' },
  { command: 'vision.resilience', description: 'Error analysis + auto-fix', category: 'vision', icon: Activity, requiresOperator: false, requiredTier: 'free' },
  { command: 'vision.analytics', description: 'Threat + provider analytics', category: 'vision', icon: Activity, requiresOperator: false, requiredTier: 'free' },
  { command: 'vision.anomalies', description: 'Anomaly detection results', category: 'vision', icon: Activity, requiresOperator: false, requiredTier: 'free', args: '[limit] [--window 5m|1h|24h]', example: 'vision.anomalies 10 --window 1h' },
  { command: 'vision.mode', description: 'Get/set vision mode', category: 'vision', icon: Eye, requiresOperator: false, requiredTier: 'free', args: '[passive|advisory|operative]' },
  { command: 'vision.replay', description: 'Replay traces over time window', category: 'vision', icon: Eye, requiresOperator: false, requiredTier: 'free', args: '[5m|1h|24h]', example: 'vision.replay 1h' },
  { command: 'vision.health_snapshot', description: 'Quick health snapshot', category: 'vision', icon: Activity, requiresOperator: false, requiredTier: 'free' },
  { command: 'vision.introspection', description: 'Deep self-analysis', category: 'vision', icon: Eye, requiresOperator: false, requiredTier: 'free' },
  { command: 'vision.quota', description: 'AI usage quota', category: 'vision', icon: Gauge, requiresOperator: false, requiredTier: 'free' },
  { command: 'vision.dependency_map', description: 'Module dependencies', category: 'vision', icon: Database, requiresOperator: false, requiredTier: 'free' },
  { command: 'vision.inspect', description: 'Inspect observability state', category: 'vision', icon: Eye, requiresOperator: false, requiredTier: 'free', args: '[--links]' },
  { command: 'vision.diagnostics', description: 'Diagnostics for observability', category: 'vision', icon: Eye, requiresOperator: false, requiredTier: 'free', args: '[--full]' },
];

export const DREAM_COMMANDS: CommandDefinition[] = [
  { command: 'dream.status', description: 'Dream-Eater state with histograms + metabolic data', category: 'dream', icon: Moon, requiresOperator: false, requiredTier: 'free' },
  { command: 'dream.mood', description: 'Get/set mood with decay info', category: 'dream', icon: Moon, requiresOperator: true, requiredTier: 'creator', args: '[mood]' },
  { command: 'dream.cycle', description: 'Execute dream cycle', category: 'dream', icon: Moon, requiresOperator: true, requiredTier: 'creator' },
  { command: 'dream.feed', description: 'Feed dream text (auto-classifies type)', category: 'dream', icon: Moon, requiresOperator: true, requiredTier: 'creator', args: '<text> [--type dream|nightmare]', example: 'dream.feed "I was flying through clouds"' },
  { command: 'dream.consume', description: 'Process a dream (mutation curve)', category: 'dream', icon: Moon, requiresOperator: true, requiredTier: 'creator', args: '<dream_id>' },
  { command: 'dream.interpret', description: 'Interpret dream text', category: 'dream', icon: Moon, requiresOperator: true, requiredTier: 'creator', args: '<text>' },
  { command: 'dream.mutate', description: 'Trigger mutation', category: 'dream', icon: Moon, requiresOperator: true, requiredTier: 'architect' },
  { command: 'dream.reflect', description: 'Dream reflection', category: 'dream', icon: Moon, requiresOperator: true, requiredTier: 'creator' },
  { command: 'dream.awaken', description: 'Awaken Dream-Eater (reset with reason)', category: 'dream', icon: Moon, requiresOperator: true, requiredTier: 'architect', args: '[reason]', example: 'dream.awaken manual_reset' },
  { command: 'dream.pulse', description: 'Lightweight heartbeat + circadian', category: 'dream', icon: Activity, requiresOperator: false, requiredTier: 'free' },
  { command: 'dream.anomalies', description: 'View dream module anomalies', category: 'dream', icon: Activity, requiresOperator: false, requiredTier: 'free', args: '[limit] [--resolved]' },
];

export const SYSTEM_COMMANDS: CommandDefinition[] = [
  { command: 'system.status', description: 'Global system status (all entities + meshes)', category: 'system', icon: Cpu, requiresOperator: false, requiredTier: 'free' },
  { command: 'system.health', description: 'Full system health (all entities + meshes)', category: 'system', icon: Activity, requiresOperator: false, requiredTier: 'free' },
  { command: 'system.doctor', description: 'Quick diagnostics (env, DB, routing, providers)', category: 'system', icon: CheckCircle, requiresOperator: false, requiredTier: 'free' },
  { command: 'system.verify', description: 'Non-destructive checks with pass/fail results', category: 'system', icon: CheckCircle, requiresOperator: false, requiredTier: 'free', args: '[--verbose]' },
  { command: 'system.resilience', description: 'Resilience snapshot (circuits, health, heals)', category: 'system', icon: Shield, requiresOperator: false, requiredTier: 'free', args: '[role]', example: 'system.resilience operator' },
  { command: 'system.version', description: 'Substrate version', category: 'system', icon: Cpu, requiresOperator: false, requiredTier: 'free' },
  { command: 'system.config', description: 'View configuration', category: 'system', icon: Settings, requiresOperator: false, requiredTier: 'free', args: '[key]' },
  { command: 'system.audit', description: 'Query health incidents & audit log', category: 'system', icon: Eye, requiresOperator: false, requiredTier: 'free', args: '[since] [type]', example: 'system.audit 24h heal' },
  { command: 'system.diagnostics', description: 'Full diagnostics (all entities + meshes)', category: 'system', icon: Cpu, requiresOperator: false, requiredTier: 'free', args: '[--full]' },
  { command: 'system.heal', description: 'Self-healing trigger', category: 'system', icon: Shield, requiresOperator: true, requiredTier: 'architect', args: '[target] [force]' },
  { command: 'system.restart', description: 'Restart service', category: 'system', icon: Cpu, requiresOperator: true, requiredTier: 'architect', args: '[service]' },
  { command: 'system.backup', description: 'Create backup snapshot', category: 'system', icon: Database, requiresOperator: true, requiredTier: 'architect', args: '[include_data]' },
  { command: 'system.restore', description: 'Restore from backup', category: 'system', icon: Database, requiresOperator: true, requiredTier: 'governor', args: '<backup_id> [validate_only]' },
  { command: 'system.restore_portable', description: 'Restore from portable JSON backup', category: 'system', icon: Database, requiresOperator: true, requiredTier: 'governor', args: '<json> [--dry-run] [--mode=merge|replace]' },
  { command: 'system.list_backups', description: 'List available backups', category: 'system', icon: Database, requiresOperator: false, requiredTier: 'free' },
  { command: 'system.upgrade.propose', description: 'Propose upgrade (shadow)', category: 'system', icon: Cpu, requiresOperator: true, requiredTier: 'architect', args: '[scope] [notes]' },
  { command: 'system.upgrade.list', description: 'List upgrade plans', category: 'system', icon: Cpu, requiresOperator: false, requiredTier: 'free' },
  { command: 'system.upgrade.apply', description: 'Apply upgrade plan', category: 'system', icon: Cpu, requiresOperator: true, requiredTier: 'governor', args: '<plan_id>' },
  { command: 'system.upgrade.rollback', description: 'Rollback upgrade', category: 'system', icon: Cpu, requiresOperator: true, requiredTier: 'governor', args: '<plan_id>' },
  { command: 'system.modules', description: 'List all registered execution surfaces', category: 'system', icon: Box, requiresOperator: false, requiredTier: 'free', args: '[--full|--health|--dag|--roles|--boot|--inventory]' },
  { command: 'system.module', description: 'Get specific module details', category: 'system', icon: Box, requiresOperator: false, requiredTier: 'free', args: '<module_name>' },
  { command: 'system.changelog', description: 'View living evolution log', category: 'system', icon: FileText, requiresOperator: false, requiredTier: 'free' },
  { command: 'system.evolution', description: 'View living evolution log (alias)', category: 'system', icon: FileText, requiresOperator: false, requiredTier: 'free' },
  { command: 'system.scan_adapt', description: 'Scan edge functions for auto-adapt', category: 'system', icon: Search, requiresOperator: true, requiredTier: 'architect', args: '[--dry-run|--confirm|--prune-unused|--verbose]', example: 'system.scan_adapt --dry-run' },
  { command: 'system.capabilities', description: 'List all registered capabilities', category: 'system', icon: Box, requiresOperator: false, requiredTier: 'free', args: '[--active|--deprecated|--all]' },
  { command: 'system.capability', description: 'Get capability details', category: 'system', icon: Box, requiresOperator: false, requiredTier: 'free', args: '<capability_id>' },
];

export const MODERNIZER_COMMANDS: CommandDefinition[] = [
  { command: 'modernizer.status', description: 'Modernizer service status', category: 'modernizer', icon: Sparkles, requiresOperator: false, requiredTier: 'free' },
  { command: 'modernizer.jobs', description: 'List evolution runs (active + completed)', category: 'modernizer', icon: Activity, requiresOperator: false, requiredTier: 'free', args: '[limit]' },
  { command: 'modernizer.evolve', description: 'Unified Evolution Cycle (scan → plan → shadow → production → verify)', category: 'modernizer', icon: Sparkles, requiresOperator: true, requiredTier: 'architect', args: '[shadow|production|verify|abort|status] [--confirm]', example: 'modernizer.evolve shadow' },
  { command: 'modernizer.scan', description: 'Cognitive systems scan (4-phase: edge/system/health/LLM)', category: 'modernizer', icon: Search, requiresOperator: true, requiredTier: 'architect', args: '[--explain|--llm-report|--dry-run]', example: 'modernizer.scan --explain' },
  { command: 'modernizer.circuit', description: 'Evolution circuit breaker control', category: 'modernizer', icon: Shield, requiresOperator: false, requiredTier: 'free', args: '[status|reset|open <reason>]', example: 'modernizer.circuit status' },
  { command: 'modernizer.autonomy', description: 'Governed autonomy settings', category: 'modernizer', icon: Settings, requiresOperator: true, requiredTier: 'architect', args: '[status|set <mode>]', example: 'modernizer.autonomy set governed' },
  { command: 'modernizer.receipts', description: 'List evolution receipts (audit trail)', category: 'modernizer', icon: Database, requiresOperator: false, requiredTier: 'free', args: '[limit]' },
  { command: 'modernizer.receipt', description: 'View specific evolution receipt', category: 'modernizer', icon: Eye, requiresOperator: false, requiredTier: 'free', args: '<run_id>' },
  { command: 'modernizer.verify', description: 'Eligibility gate (plan-independent)', category: 'modernizer', icon: Shield, requiresOperator: false, requiredTier: 'free', args: '[component]', example: 'modernizer.verify brain' },
  { command: 'modernizer.analyze', description: 'Forward intent projection (what will change)', category: 'modernizer', icon: Search, requiresOperator: false, requiredTier: 'free', args: '[component]', example: 'modernizer.analyze memory' },
  { command: 'modernizer.forensics', description: 'Historical truth (what has changed)', category: 'modernizer', icon: Eye, requiresOperator: false, requiredTier: 'free', args: '<component> [--since 24h|7d|last_run]', example: 'modernizer.forensics brain --since 24h' },
  { command: 'modernizer.omega', description: 'Ω Unified observer v2.0 (can/will/has)', category: 'modernizer', icon: Eye, requiresOperator: false, requiredTier: 'free', args: '[component] [--since 24h|7d|30d] [--compact]', example: 'modernizer.omega brain --since 7d' },
  { command: 'modernizer.plans', description: 'List active evolution plan', category: 'modernizer', icon: Activity, requiresOperator: false, requiredTier: 'free' },
  { command: 'modernizer.review', description: 'Review a specific plan', category: 'modernizer', icon: Eye, requiresOperator: false, requiredTier: 'free', args: '<plan_id>' },
  { command: 'modernizer.validate', description: 'Validate plan readiness', category: 'modernizer', icon: Shield, requiresOperator: false, requiredTier: 'free', args: '<plan_id>' },
  { command: 'modernizer.diff', description: 'View plan diff and health comparison', category: 'modernizer', icon: Eye, requiresOperator: false, requiredTier: 'free', args: '<plan_id>' },
  { command: 'modernizer.rollback', description: 'Rollback an applied plan', category: 'modernizer', icon: Shield, requiresOperator: true, requiredTier: 'governor', args: '<plan_id>' },
  { command: 'modernizer.delete', description: 'Delete/reject a plan', category: 'modernizer', icon: Shield, requiresOperator: true, requiredTier: 'architect', args: '<plan_id>' },
  { command: 'modernizer.applied', description: 'List all applied improvements', category: 'modernizer', icon: Activity, requiresOperator: false, requiredTier: 'free' },
  { command: 'modernizer.archived', description: 'Scan archived functions to repurpose', category: 'modernizer', icon: Database, requiresOperator: false, requiredTier: 'free' },
  { command: 'modernizer.implement', description: 'Generate code for archived function repurposing', category: 'modernizer', icon: Sparkles, requiresOperator: true, requiredTier: 'governor', args: '<archived_function> <target_action>' },
  { command: 'modernizer.export', description: 'Export job assets', category: 'modernizer', icon: Database, requiresOperator: true, requiredTier: 'creator', args: '<job_id>' },
  { command: 'modernizer.quota', description: 'Check usage limits', category: 'modernizer', icon: Gauge, requiresOperator: false, requiredTier: 'free' },
  { command: 'modernizer.refresh', description: 'Resync metrics and clear stale hints', category: 'modernizer', icon: Activity, requiresOperator: true, requiredTier: 'creator' },
  { command: 'modernizer.stamps', description: 'View evolution stamps for verification', category: 'modernizer', icon: FileCheck, requiresOperator: false, requiredTier: 'free', args: '[limit]', example: 'modernizer.stamps 5' },
];

// CORE module — Kernel, scheduler, lifecycle
export const CORE_COMMANDS: CommandDefinition[] = [
  { command: 'core.status', description: 'Kernel status with uptime', category: 'core', icon: Server, requiresOperator: false, requiredTier: 'free' },
  { command: 'core.pulse', description: 'Lightweight heartbeat', category: 'core', icon: Activity, requiresOperator: false, requiredTier: 'free' },
  { command: 'core.boot', description: 'Initialize boot sequence', category: 'core', icon: PlayCircle, requiresOperator: true, requiredTier: 'architect' },
  { command: 'core.schedule', description: 'Schedule a delayed job', category: 'core', icon: Clock, requiresOperator: true, requiredTier: 'creator', args: '<module> <action> [delay]', example: 'core.schedule brain reflect 5m' },
  { command: 'core.jobs', description: 'List scheduled jobs', category: 'core', icon: List, requiresOperator: false, requiredTier: 'free', args: '[status] [limit]' },
  { command: 'core.process', description: 'Process next queued job', category: 'core', icon: PlayCircle, requiresOperator: true, requiredTier: 'creator' },
  { command: 'core.config', description: 'Get/set system config', category: 'core', icon: Settings, requiresOperator: true, requiredTier: 'architect', args: '[key] [value]' },
  { command: 'core.shutdown', description: 'Graceful system shutdown', category: 'core', icon: Server, requiresOperator: true, requiredTier: 'governor' },
];

// RIPPLE module v2.0 — Hybrid Event Orchestrator
export const RIPPLE_COMMANDS: CommandDefinition[] = [
  { command: 'ripple.status', description: 'Bus status with job breakdown + 24h analytics', category: 'ripple', icon: Radio, requiresOperator: false, requiredTier: 'free' },
  { command: 'ripple.pulse', description: 'Lightweight heartbeat', category: 'ripple', icon: Activity, requiresOperator: false, requiredTier: 'free' },
  { command: 'ripple.metrics', description: 'Bus metrics for Vision integration', category: 'ripple', icon: Gauge, requiresOperator: false, requiredTier: 'free' },
  { command: 'ripple.topics', description: 'List all topics', category: 'ripple', icon: List, requiresOperator: false, requiredTier: 'free' },
  { command: 'ripple.events', description: 'Get event log with status', category: 'ripple', icon: Activity, requiresOperator: false, requiredTier: 'free', args: '[topic] [limit] [status]' },
  { command: 'ripple.publish', description: 'Publish event + fan-out to subscribers', category: 'ripple', icon: Send, requiresOperator: true, requiredTier: 'creator', args: '<topic> <event_type> [payload]', example: 'ripple.publish system.alerts health_check "{}"' },
  { command: 'ripple.subscribe', description: 'Subscribe module/action to topic', category: 'ripple', icon: Radio, requiresOperator: true, requiredTier: 'creator', args: '<topic> <module> <action> [max_attempts]' },
  { command: 'ripple.replay', description: 'Re-process events on topic', category: 'ripple', icon: PlayCircle, requiresOperator: true, requiredTier: 'creator', args: '<topic> [limit]', example: 'ripple.replay system.alerts 10' },
  { command: 'ripple.jobs', description: 'List jobs with filtering', category: 'ripple', icon: List, requiresOperator: false, requiredTier: 'free', args: '[queue] [status] [limit]' },
  { command: 'ripple.enqueue', description: 'Add job to queue', category: 'ripple', icon: List, requiresOperator: true, requiredTier: 'creator', args: '<queue> <payload> [priority] [delay]' },
  { command: 'ripple.dequeue', description: 'Get next pending job', category: 'ripple', icon: List, requiresOperator: true, requiredTier: 'creator', args: '[queue]' },
  { command: 'ripple.work', description: 'Process job(s) from queue', category: 'ripple', icon: PlayCircle, requiresOperator: true, requiredTier: 'creator', args: '[queue] [--once]', example: 'ripple.work events --once' },
  { command: 'ripple.drain', description: 'Process all pending jobs in queue', category: 'ripple', icon: PlayCircle, requiresOperator: true, requiredTier: 'architect', args: '[queue]' },
  { command: 'ripple.ack', description: 'Acknowledge job as succeeded', category: 'ripple', icon: Shield, requiresOperator: true, requiredTier: 'creator', args: '<job_id>' },
  { command: 'ripple.nack', description: 'Reject job (increment attempts)', category: 'ripple', icon: Shield, requiresOperator: true, requiredTier: 'creator', args: '<job_id> [reason]' },
  { command: 'ripple.dead_letter', description: 'View dead-letter jobs', category: 'ripple', icon: Shield, requiresOperator: false, requiredTier: 'free', args: '[queue] [limit]' },
  { command: 'ripple.retry', description: 'Retry dead-letter job', category: 'ripple', icon: PlayCircle, requiresOperator: true, requiredTier: 'creator', args: '<job_id>' },
  { command: 'ripple.circuits', description: 'View subscriber circuit breakers', category: 'ripple', icon: Activity, requiresOperator: false, requiredTier: 'free' },
];

// ACCESS module v2.1 — API keys, subscriptions, entitlements, identity, bootstrap
export const ACCESS_COMMANDS: CommandDefinition[] = [
  { command: 'access.status', description: 'Module status (v2.1)', category: 'access', icon: Key, requiresOperator: false, requiredTier: 'free' },
  { command: 'access.pulse', description: 'Lightweight heartbeat', category: 'access', icon: Activity, requiresOperator: false, requiredTier: 'free' },
  { command: 'access.bootstrap', description: 'Bootstrap developer identity + roles', category: 'access', icon: Users, requiresOperator: false, requiredTier: 'free', args: '[display_name]', example: 'access.bootstrap Kenneth' },
  { command: 'access.identity', description: 'Get current session identity + roles', category: 'access', icon: Users, requiresOperator: false, requiredTier: 'free' },
  { command: 'access.register', description: 'Register as developer (requires auth)', category: 'access', icon: Users, requiresOperator: true, requiredTier: 'creator', args: '[display_name]', example: 'access.register "My App"' },
  { command: 'access.developer', description: 'Get developer profile', category: 'access', icon: Users, requiresOperator: false, requiredTier: 'free', args: '[developer_id]' },
  { command: 'access.developers', description: 'List all developers (admin)', category: 'access', icon: Users, requiresOperator: true, requiredTier: 'governor' },
  { command: 'access.create_key', description: 'Create API key', category: 'access', icon: Key, requiresOperator: true, requiredTier: 'creator', args: '[name] [scopes...]', example: 'access.create_key "My Key" substrate.read substrate.write' },
  { command: 'access.validate_key', description: 'Validate API key', category: 'access', icon: Shield, requiresOperator: true, requiredTier: 'creator', args: '<api_key>' },
  { command: 'access.revoke_key', description: 'Revoke API key', category: 'access', icon: Lock, requiresOperator: true, requiredTier: 'architect', args: '<key_id>' },
  { command: 'access.list_keys', description: 'List your API keys', category: 'access', icon: List, requiresOperator: false, requiredTier: 'free' },
  { command: 'access.usage', description: 'Get usage statistics', category: 'access', icon: Gauge, requiresOperator: false, requiredTier: 'free', args: '[product_code] [days]', example: 'access.usage scan 30' },
  { command: 'access.quota', description: 'Check quota remaining', category: 'access', icon: Gauge, requiresOperator: false, requiredTier: 'free', args: '[api_key_id]' },
  { command: 'access.subscription', description: 'Get subscription info', category: 'access', icon: Key, requiresOperator: false, requiredTier: 'free' },
  { command: 'access.entitlements', description: 'List your entitlements', category: 'access', icon: Shield, requiresOperator: false, requiredTier: 'free' },
  { command: 'access.products', description: 'List available products/entitlements', category: 'access', icon: Box, requiresOperator: false, requiredTier: 'free', args: '[category]', example: 'access.products cmptbl' },
];

// INTEGRATION module v2.0 — Adapters, Connections, Discovery, Governance
export const INTEGRATION_COMMANDS: CommandDefinition[] = [
  { command: 'integration.status', description: 'Integration module status (v2.0)', category: 'integration', icon: Plug, requiresOperator: false, requiredTier: 'free' },
  { command: 'integration.pulse', description: 'Lightweight heartbeat', category: 'integration', icon: Activity, requiresOperator: false, requiredTier: 'free' },
  { command: 'integration.adapters', description: 'List available adapters by category', category: 'integration', icon: Box, requiresOperator: false, requiredTier: 'free', args: '[category]', example: 'integration.adapters enterprise' },
  { command: 'integration.connect', description: 'Connect adapter with mode', category: 'integration', icon: Plug, requiresOperator: true, requiredTier: 'creator', args: '<mode> <adapter_id>', example: 'integration.connect mock PostgreSQL' },
  { command: 'integration.disconnect', description: 'Disconnect connection by ID', category: 'integration', icon: Plug, requiresOperator: true, requiredTier: 'creator', args: '<connection_id>' },
  { command: 'integration.connections', description: 'List active connections', category: 'integration', icon: Globe, requiresOperator: false, requiredTier: 'free' },
  { command: 'integration.test', description: 'Test adapter connectivity', category: 'integration', icon: Activity, requiresOperator: true, requiredTier: 'creator', args: '<adapter_id>', example: 'integration.test PostgreSQL' },
  { command: 'integration.discover', description: 'Discover system (shallow by default)', category: 'integration', icon: Search, requiresOperator: true, requiredTier: 'creator', args: '<adapter_id> [depth]', example: 'integration.discover PostgreSQL' },
  { command: 'integration.discovered', description: 'List discoveries', category: 'integration', icon: List, requiresOperator: false, requiredTier: 'free', args: '[adapter_id]' },
  { command: 'integration.map_command', description: 'Map terminal command to adapter', category: 'integration', icon: GitBranch, requiresOperator: true, requiredTier: 'architect', args: '<adapter_id> <command> "<description>"', example: 'integration.map_command PostgreSQL payroll "Run payroll"' },
  { command: 'integration.mapped_commands', description: 'List mapped commands', category: 'integration', icon: Terminal, requiresOperator: false, requiredTier: 'free', args: '[adapter_id]' },
  { command: 'integration.execute', description: 'Execute governed command', category: 'integration', icon: PlayCircle, requiresOperator: true, requiredTier: 'creator', args: '<adapter_id> <command> [params_json]', example: 'integration.execute PostgreSQL payroll' },
  { command: 'integration.policies', description: 'Get governance policies', category: 'integration', icon: Shield, requiresOperator: false, requiredTier: 'free' },
  { command: 'integration.set_policy', description: 'Set governance policy', category: 'integration', icon: Lock, requiresOperator: true, requiredTier: 'architect', args: '[adapter_id] <policy>' },
  { command: 'integration.governance', description: 'Governance status', category: 'integration', icon: Shield, requiresOperator: false, requiredTier: 'free' },
  { command: 'integration.audit_log', description: 'View governance audit log', category: 'integration', icon: Eye, requiresOperator: false, requiredTier: 'free', args: '[adapter_id] [limit]' },
  { command: 'integration.game_discover', description: 'Discover game engine APIs', category: 'integration', icon: Workflow, requiresOperator: true, requiredTier: 'architect', args: '<engine_type>', example: 'integration.game_discover unity' },
  { command: 'integration.enterprise_discover', description: 'Discover enterprise APIs', category: 'integration', icon: Users, requiresOperator: true, requiredTier: 'architect', args: '<system_type>', example: 'integration.enterprise_discover salesforce' },
  { command: 'integration.dev_discover', description: 'Discover dev platform APIs', category: 'integration', icon: GitBranch, requiresOperator: true, requiredTier: 'architect', args: '<platform_type>', example: 'integration.dev_discover github' },
  { command: 'integration.payroll', description: 'Execute payroll operation', category: 'integration', icon: CreditCard, requiresOperator: true, requiredTier: 'architect', args: '<adapter_id> <operation> [params]' },
  { command: 'integration.customer_service', description: 'Execute customer service op', category: 'integration', icon: Users, requiresOperator: true, requiredTier: 'architect', args: '<adapter_id> <operation> [params]' },
];

// CORTEX module v2.0 — Agency-class orchestrator with lifecycle, panic, dispatch, evolution
export const CORTEX_COMMANDS: CommandDefinition[] = [
  { command: 'cortex.status', description: 'Full status + capabilities + circuits', category: 'cortex', icon: Wand2, requiresOperator: false, requiredTier: 'free' },
  { command: 'cortex.health', description: 'Health + connected modules + circuits', category: 'cortex', icon: Activity, requiresOperator: false, requiredTier: 'free' },
  { command: 'cortex.pulse', description: 'Lightweight heartbeat', category: 'cortex', icon: Activity, requiresOperator: false, requiredTier: 'free' },
  { command: 'cortex.diagnostics', description: 'Deep self-analysis', category: 'cortex', icon: Search, requiresOperator: false, requiredTier: 'free' },
  { command: 'cortex.mode', description: 'Get/set mode (manual|shadow|auto)', category: 'cortex', icon: Settings, requiresOperator: false, requiredTier: 'free', args: '[manual|shadow|auto]', example: 'cortex.mode shadow' },
  { command: 'cortex.restart', description: 'Soft reload cortex state', category: 'cortex', icon: PlayCircle, requiresOperator: true, requiredTier: 'architect' },
  { command: 'cortex.panic', description: 'Panic mode controls', category: 'cortex', icon: Shield, requiresOperator: true, requiredTier: 'governor', args: '<freeze|resume|status> [reason]', example: 'cortex.panic freeze "Emergency"' },
  { command: 'cortex.dispatch', description: 'Execute module.action with governance', category: 'cortex', icon: Send, requiresOperator: true, requiredTier: 'creator', args: '<module.action> [args]', example: 'cortex.dispatch brain.reflect' },
  { command: 'cortex.observe', description: 'Subscribe to module events', category: 'cortex', icon: Eye, requiresOperator: false, requiredTier: 'free', args: '[module] [event_types]' },
  { command: 'cortex.propose', description: 'Generate improvement proposal', category: 'cortex', icon: Wand2, requiresOperator: true, requiredTier: 'creator', args: '<goal> [context]', example: 'cortex.propose "Optimize memory tiering"' },
  { command: 'cortex.evaluate', description: 'Score and assess proposal', category: 'cortex', icon: Search, requiresOperator: true, requiredTier: 'creator', args: '[proposal_id] [criteria]' },
  { command: 'cortex.apply', description: 'Execute approved changes', category: 'cortex', icon: PlayCircle, requiresOperator: true, requiredTier: 'architect', args: '<proposal_id> [target_module]' },
  { command: 'cortex.rollback', description: 'Rollback applied changes', category: 'cortex', icon: Shield, requiresOperator: true, requiredTier: 'governor', args: '<apply_id> [reason]' },
  { command: 'cortex.audit', description: 'Query decisions and deltas', category: 'cortex', icon: Eye, requiresOperator: false, requiredTier: 'free', args: '[since] [type]', example: 'cortex.audit 24h proposal' },
  { command: 'cortex.learn', description: 'Ingest outcome for reinforcement', category: 'cortex', icon: Brain, requiresOperator: true, requiredTier: 'creator', args: '<outcome> [proposal_id] [feedback]', example: 'cortex.learn success prop_abc123' },
  { command: 'cortex.summary', description: 'Human-readable context dump', category: 'cortex', icon: Terminal, requiresOperator: false, requiredTier: 'free' },
  { command: 'cortex.plan', description: 'Rank evolution sequences by priority', category: 'cortex', icon: Workflow, requiresOperator: false, requiredTier: 'free', args: '[sequence_id]' },
  { command: 'cortex.run', description: 'Execute sequence in shadow mode', category: 'cortex', icon: PlayCircle, requiresOperator: true, requiredTier: 'architect', args: '<sequence_id> [mode]', example: 'cortex.run abc123 shadow' },
  { command: 'cortex.world', description: 'Full module registry snapshot', category: 'cortex', icon: Globe, requiresOperator: false, requiredTier: 'free', args: '[--dag|--roles|--eligible]' },
  { command: 'cortex.inventory', description: 'Module inventory with eligibility', category: 'cortex', icon: Box, requiresOperator: false, requiredTier: 'free' },
  { command: 'cortex.synergy.status', description: 'Synergy engine overview (pipelines, executors, health)', category: 'cortex', icon: Workflow, requiresOperator: false, requiredTier: 'free' },
  { command: 'cortex.synergy.list', description: 'List all 200 synergy pipelines', category: 'cortex', icon: List, requiresOperator: false, requiredTier: 'free', args: '[--category <cat>|--module <mod>]', example: 'cortex.synergy.list --category intelligence' },
  { command: 'cortex.synergy.get', description: 'Get synergy pipeline details', category: 'cortex', icon: Eye, requiresOperator: false, requiredTier: 'free', args: '<synergy_id>', example: 'cortex.synergy.get smart-recall' },
  { command: 'cortex.synergy.execute', description: 'Execute a synergy pipeline', category: 'cortex', icon: PlayCircle, requiresOperator: true, requiredTier: 'creator', args: '<synergy_id> [input_json]', example: 'cortex.synergy.execute adaptive-routing' },
  { command: 'cortex.synergy.dry_run', description: 'Dry-run a synergy (no side effects)', category: 'cortex', icon: Eye, requiresOperator: false, requiredTier: 'free', args: '<synergy_id> [input_json]', example: 'cortex.synergy.dry_run cognitive-fusion' },
  { command: 'cortex.synergy.recommend', description: 'Get recommended synergies for context', category: 'cortex', icon: Sparkles, requiresOperator: false, requiredTier: 'free', args: '[context_json]' },
  { command: 'cortex.synergy.pipeline', description: 'Execute chained synergy pipeline', category: 'cortex', icon: Workflow, requiresOperator: true, requiredTier: 'architect', args: '<synergy1,synergy2,...> [input_json]', example: 'cortex.synergy.pipeline smart-recall,cognitive-fusion' },
  { command: 'cortex.synergy.categories', description: 'List synergy categories with counts', category: 'cortex', icon: Box, requiresOperator: false, requiredTier: 'free' },
  { command: 'cortex.synergy.modules', description: 'List synergies by module involvement', category: 'cortex', icon: Database, requiresOperator: false, requiredTier: 'free', args: '[module]', example: 'cortex.synergy.modules brain' },
];

// INCLUSIVE module v1.0 — Human Compatibility Pipeline (WCAG Scanning, Repair, Validation)
import { Accessibility } from 'lucide-react';

export const INCLUSIVE_COMMANDS: CommandDefinition[] = [
  { command: 'inclusive.status', description: 'Module status with global score', category: 'inclusive', icon: Accessibility, requiresOperator: false, requiredTier: 'free' },
  { command: 'inclusive.health', description: 'Health check', category: 'inclusive', icon: Activity, requiresOperator: false, requiredTier: 'free' },
  { command: 'inclusive.pulse', description: 'Lightweight heartbeat', category: 'inclusive', icon: Activity, requiresOperator: false, requiredTier: 'free' },
  { command: 'inclusive.scan', description: 'Scan URL/HTML for WCAG issues', category: 'inclusive', icon: Eye, requiresOperator: true, requiredTier: 'creator', args: '<target> [--wcag A|AA|AAA] [--depth quick|standard|deep]', example: 'inclusive.scan https://example.com' },
  { command: 'inclusive.self_scan', description: 'Scan the substrate UI itself', category: 'inclusive', icon: Eye, requiresOperator: true, requiredTier: 'creator' },
  { command: 'inclusive.repair', description: 'Auto-fix accessibility issues', category: 'inclusive', icon: Wand2, requiresOperator: true, requiredTier: 'architect', args: '<target> [issues...]', example: 'inclusive.repair https://example.com' },
  { command: 'inclusive.validate', description: 'Validate repairs, check for regressions', category: 'inclusive', icon: Shield, requiresOperator: true, requiredTier: 'creator', args: '<target>' },
  { command: 'inclusive.profile', description: 'Build user adaptive profile', category: 'inclusive', icon: Users, requiresOperator: true, requiredTier: 'creator', args: '<context>' },
  { command: 'inclusive.report', description: 'Generate compliance report', category: 'inclusive', icon: Database, requiresOperator: false, requiredTier: 'free', args: '<target> [json|markdown]' },
  { command: 'inclusive.scan_all_templates', description: 'Scan all marketplace templates', category: 'inclusive', icon: Search, requiresOperator: true, requiredTier: 'architect' },
  { command: 'inclusive.regressions', description: 'Get regressions in last N hours', category: 'inclusive', icon: Activity, requiresOperator: false, requiredTier: 'free', args: '[hours]', example: 'inclusive.regressions 24' },
  { command: 'inclusive.coverage', description: 'Template coverage stats', category: 'inclusive', icon: Gauge, requiresOperator: false, requiredTier: 'free' },
];

// CLM (Constant Learning Mode) commands — v6.7.0
export const CLM_COMMANDS: CommandDefinition[] = [
  { command: 'clm.status', description: 'CLM status (budget, topics, queue)', category: 'clm', icon: Brain, requiresOperator: false, requiredTier: 'free' },
  { command: 'clm.enable', description: 'Enable Constant Learning Mode', category: 'clm', icon: Brain, requiresOperator: true, requiredTier: 'architect' },
  { command: 'clm.disable', description: 'Disable Constant Learning Mode', category: 'clm', icon: Brain, requiresOperator: true, requiredTier: 'architect' },
  { command: 'clm.cycle', description: 'Run a manual CLM cycle', category: 'clm', icon: Activity, requiresOperator: true, requiredTier: 'creator' },
  { command: 'clm.budget', description: 'View daily budget allocation', category: 'clm', icon: Gauge, requiresOperator: false, requiredTier: 'free' },
  { command: 'clm.kill_switch', description: 'Activate/deactivate kill switch', category: 'clm', icon: Shield, requiresOperator: true, requiredTier: 'governor', args: '<on|off>', example: 'clm.kill_switch on' },
  { command: 'clm.topics', description: 'View topic bank with mastery scores', category: 'clm', icon: List, requiresOperator: false, requiredTier: 'free' },
  { command: 'clm.add_topic', description: 'Add custom topic to bank', category: 'clm', icon: Brain, requiresOperator: true, requiredTier: 'creator', args: '<topic> <category>', example: 'clm.add_topic "quantum computing" science' },
  { command: 'clm.review_queue', description: 'View spaced repetition queue', category: 'clm', icon: Clock, requiresOperator: false, requiredTier: 'free' },
  { command: 'clm.next_review', description: 'Get next review item', category: 'clm', icon: Brain, requiresOperator: false, requiredTier: 'free' },
];

export const META_COMMANDS: CommandDefinition[] = [
  // Help & Navigation
  { command: 'help', description: 'Show all commands', category: 'meta', icon: Terminal, requiresOperator: false },
  { command: 'help brain', description: 'Brain module commands', category: 'meta', icon: Brain, requiresOperator: false },
  { command: 'help decode', description: 'Decode module commands', category: 'meta', icon: MessageSquare, requiresOperator: false },
  { command: 'help defense', description: 'Defense module commands', category: 'meta', icon: Shield, requiresOperator: false },
  { command: 'help nexus', description: 'Nexus module commands', category: 'meta', icon: Zap, requiresOperator: false },
  { command: 'help vision', description: 'Vision module commands', category: 'meta', icon: Eye, requiresOperator: false },
  { command: 'help dream', description: 'Dream module commands', category: 'meta', icon: Moon, requiresOperator: false },
  { command: 'help system', description: 'System module commands', category: 'meta', icon: Cpu, requiresOperator: false },
  { command: 'help modernizer', description: 'Modernizer module commands', category: 'meta', icon: Sparkles, requiresOperator: false },
  { command: 'help cortex', description: 'Cortex (Agency) module commands', category: 'meta', icon: Wand2, requiresOperator: false },
  { command: 'help core', description: 'Core kernel commands', category: 'meta', icon: Server, requiresOperator: false },
  { command: 'help ripple', description: 'Message bus commands', category: 'meta', icon: Radio, requiresOperator: false },
  { command: 'help access', description: 'Identity/billing commands', category: 'meta', icon: Key, requiresOperator: false },
  { command: 'help integration', description: 'Enterprise integration commands', category: 'meta', icon: Plug, requiresOperator: false },
  { command: 'help inclusive', description: 'Accessibility pipeline commands', category: 'meta', icon: Accessibility, requiresOperator: false },
  { command: 'help clm', description: 'Constant Learning Mode commands', category: 'meta', icon: Brain, requiresOperator: false },
  { command: 'help seba', description: 'Self-Evolving Bounded Agent commands', category: 'meta', icon: Brain, requiresOperator: false },
  { command: 'help autoblog', description: 'AutoBlog primitive commands', category: 'meta', icon: PenTool, requiresOperator: false },
  { command: 'help engine', description: 'Cognitive Engine System commands', category: 'meta', icon: Cpu, requiresOperator: false },
  { command: 'help encoded', description: 'Encoded agent commands', category: 'meta', icon: PenTool, requiresOperator: false },
  { command: 'help infra', description: 'Infrastructure commands (cron, snapshots, etc)', category: 'meta', icon: Server, requiresOperator: false },
  { command: 'help patch', description: 'Patch dispatch commands', category: 'meta', icon: Send, requiresOperator: false },
  // Infrastructure Six + ENCODE module help (v10.5.4)
  { command: 'help memory', description: 'Memory (vector/RAG) module commands', category: 'meta', icon: Database, requiresOperator: false },
  { command: 'help relay', description: 'Relay (outbound webhooks) module commands', category: 'meta', icon: Send, requiresOperator: false },
  { command: 'help audit', description: 'Audit (compliance ledger) module commands', category: 'meta', icon: FileCheck, requiresOperator: false },
  { command: 'help identity', description: 'Identity (actor attribution) module commands', category: 'meta', icon: Key, requiresOperator: false },
  { command: 'help economy', description: 'Economy (cost/budget) module commands', category: 'meta', icon: CreditCard, requiresOperator: false },
  { command: 'help sandbox', description: 'Sandbox (isolated execution) module commands', category: 'meta', icon: Box, requiresOperator: false },
  { command: 'help encode', description: 'Encode (code generation) module commands', category: 'meta', icon: PenTool, requiresOperator: false },
  // Terminal Controls
  { command: 'clear', description: 'Clear terminal history', category: 'meta', icon: Terminal, requiresOperator: false },
  { command: 'whoami', description: 'Display identity', category: 'meta', icon: Cpu, requiresOperator: false },
  { command: 'history', description: 'Command history', category: 'meta', icon: Clock, requiresOperator: false },
  { command: 'export', description: 'Export session log', category: 'meta', icon: Database, requiresOperator: false },
  { command: 'theme', description: 'Toggle terminal theme', category: 'meta', icon: Eye, requiresOperator: false, args: '[dark|light|matrix]' },
  
  // Debug Mode (kill-switch for background activity)
  { command: 'debug', description: 'Show debug mode status & feature toggles', category: 'meta', icon: Settings, requiresOperator: false },
  { command: 'debug.on', description: 'Disable ALL background activity', category: 'meta', icon: Shield, requiresOperator: false },
  { command: 'debug.off', description: 'Enable ALL background activity', category: 'meta', icon: Zap, requiresOperator: false },
  { command: 'debug.batch', description: 'Enable features in batches (1-4)', category: 'meta', icon: Layers, requiresOperator: false, args: '<1-4>' },
  { command: 'debug.enable', description: 'Enable single feature', category: 'meta', icon: CheckCircle, requiresOperator: false, args: '<feature>' },
  { command: 'debug.disable', description: 'Disable single feature', category: 'meta', icon: XCircle, requiresOperator: false, args: '<feature>' },
  
  // v5.0.0: Aliases
  { command: 'alias', description: 'List all command aliases', category: 'meta', icon: Terminal, requiresOperator: false },
  { command: 'alias add', description: 'Create a custom alias', category: 'meta', icon: Terminal, requiresOperator: false, args: '<alias> <command>', example: 'alias add hs system.health' },
  { command: 'alias remove', description: 'Remove a custom alias', category: 'meta', icon: Terminal, requiresOperator: false, args: '<alias>' },
  
  // v5.0.0: Macros
  { command: 'macro', description: 'Macro help & commands', category: 'meta', icon: PlayCircle, requiresOperator: false },
  { command: 'macro list', description: 'List all macros', category: 'meta', icon: List, requiresOperator: false },
  { command: 'macro run', description: 'Execute a macro', category: 'meta', icon: PlayCircle, requiresOperator: false, args: '<name>', example: 'macro run health_check' },
  { command: 'macro show', description: 'Show macro details', category: 'meta', icon: Eye, requiresOperator: false, args: '<name>' },
  { command: 'macro create', description: 'Create a custom macro', category: 'meta', icon: Terminal, requiresOperator: false, args: '<name> <commands...>' },
  { command: 'macro delete', description: 'Delete a custom macro', category: 'meta', icon: Terminal, requiresOperator: false, args: '<name>' },
  
  // v5.0.0: Scheduling & Watch
  { command: 'schedule', description: 'Schedule command execution', category: 'meta', icon: Clock, requiresOperator: false, args: '<delay> <command>', example: 'schedule 5m brain.reflect' },
  { command: 'schedule list', description: 'List scheduled commands', category: 'meta', icon: List, requiresOperator: false },
  { command: 'schedule cancel', description: 'Cancel a scheduled command', category: 'meta', icon: Terminal, requiresOperator: false, args: '<id>' },
  { command: 'schedule clear', description: 'Cancel all scheduled commands', category: 'meta', icon: Terminal, requiresOperator: false },
  { command: 'watch', description: 'Run command repeatedly', category: 'meta', icon: Eye, requiresOperator: false, args: '<interval> <command>', example: 'watch 10s vision.pulse' },
  { command: 'watch list', description: 'List active watch sessions', category: 'meta', icon: List, requiresOperator: false },
  { command: 'watch stop', description: 'Stop a watch session', category: 'meta', icon: Terminal, requiresOperator: false, args: '<id|all>' },
  
  // v5.0.0: Audit & Analytics
  { command: 'audit', description: 'View session audit log', category: 'meta', icon: Eye, requiresOperator: false, args: '[limit]' },
  { command: 'audit stats', description: 'Session statistics', category: 'meta', icon: Activity, requiresOperator: false },
  { command: 'audit export', description: 'Export audit log as JSON', category: 'meta', icon: Database, requiresOperator: false },
];

// AUTOBLOG module — Governed blog automation primitive v2.0
export const AUTOBLOG_COMMANDS: CommandDefinition[] = [
  // Status & control
  { command: 'autoblog.status', description: 'AutoBlog status and circuit state', category: 'autoblog', icon: PenTool, requiresOperator: false },
  { command: 'autoblog.enable', description: 'Enable AutoBlog (Governor only)', category: 'autoblog', icon: PlayCircle, requiresOperator: true },
  { command: 'autoblog.disable', description: 'Disable AutoBlog (Governor only)', category: 'autoblog', icon: Shield, requiresOperator: true },
  
  // Autonomous mode v2.0
  { command: 'autoblog.start', description: 'Start basic autonomous mode', category: 'autoblog', icon: PlayCircle, requiresOperator: true },
  { command: 'autoblog.stop', description: 'Stop autonomous mode', category: 'autoblog', icon: Shield, requiresOperator: true },
  { command: 'autoblog.state', description: 'View autonomous engine state', category: 'autoblog', icon: Activity, requiresOperator: false },
  { command: 'autoblog.seed', description: 'Seed posts from evolution + community topics', category: 'autoblog', icon: Database, requiresOperator: true, args: '[count]', example: 'autoblog.seed 3' },
  
  // CLM (Constant Learning Mode) v2.1
  { command: 'autoblog.clm', description: 'Start CLM - 3-6 posts/week, intelligent publishing', category: 'autoblog', icon: PlayCircle, requiresOperator: true },
  { command: 'autoblog.clm.start', description: 'Start CLM (alias for autoblog.clm)', category: 'autoblog', icon: PlayCircle, requiresOperator: true },
  { command: 'autoblog.clm.stop', description: 'Stop CLM mode', category: 'autoblog', icon: Shield, requiresOperator: true },
  { command: 'autoblog.clm.status', description: 'View CLM status, weekly progress, quality trend', category: 'autoblog', icon: Activity, requiresOperator: false },
  
  // Lifecycle
  { command: 'autoblog.plan', description: 'Plan next blog post', category: 'autoblog', icon: FileEdit, requiresOperator: true },
  { command: 'autoblog.draft', description: 'Generate draft for queued item', category: 'autoblog', icon: FileEdit, requiresOperator: true, args: '<queue_id>' },
  { command: 'autoblog.verify', description: 'Verify draft safety and quality', category: 'autoblog', icon: Shield, requiresOperator: true, args: '<queue_id>' },
  { command: 'autoblog.publish', description: 'Publish verified draft to blog', category: 'autoblog', icon: Send, requiresOperator: true, args: '<queue_id>' },
  { command: 'autoblog.publish.all', description: 'Publish all ready drafts', category: 'autoblog', icon: Send, requiresOperator: true },
  { command: 'autoblog.abort', description: 'Abort queued/drafting item', category: 'autoblog', icon: Shield, requiresOperator: true, args: '<queue_id> [reason]' },
  
  // Queue & history
  { command: 'autoblog.queue', description: 'View post queue', category: 'autoblog', icon: List, requiresOperator: false },
  { command: 'autoblog.runs', description: 'View run history and audit trail', category: 'autoblog', icon: Activity, requiresOperator: false, args: '[limit]' },
  
  // Settings
  { command: 'autoblog.settings', description: 'View or update settings', category: 'autoblog', icon: Settings, requiresOperator: false, args: '[set <key> <value>]', example: 'autoblog.settings set cadence_minutes 480' },
  
  // Circuit breaker
  { command: 'autoblog.circuit', description: 'Circuit breaker control', category: 'autoblog', icon: Shield, requiresOperator: false, args: '[reset]' },
  
  // Healing
  { command: 'autoblog.heal', description: 'Self-heal AutoBlog subsystem', category: 'autoblog', icon: Shield, requiresOperator: true, args: '[--full]' },
];

// SEBA — Self-Evolving Bounded Agent v1.0.0
export const SEBA_COMMANDS: CommandDefinition[] = [
  // Status & control
  { command: 'seba.status', description: 'SEBA agent state and mode', category: 'clm', icon: Brain, requiresOperator: false },
  { command: 'seba.enable', description: 'Enable SEBA agent', category: 'clm', icon: PlayCircle, requiresOperator: true },
  { command: 'seba.disable', description: 'Disable SEBA agent', category: 'clm', icon: Shield, requiresOperator: true },
  { command: 'seba.mode', description: 'Get/set operating mode', category: 'clm', icon: Settings, requiresOperator: true, args: '[off|observe|advisory|governed]', example: 'seba.mode governed' },
  
  // Cycle operations
  { command: 'seba.cycle', description: 'Run complete SEBA cycle (5-phase)', category: 'clm', icon: Sparkles, requiresOperator: true },
  { command: 'seba.propose', description: 'Generate proposals only (no execution)', category: 'clm', icon: Wand2, requiresOperator: true },
  { command: 'seba.review', description: 'View pending proposals', category: 'clm', icon: Eye, requiresOperator: false },
  
  // Proposal management
  { command: 'seba.approve', description: 'Approve a proposal', category: 'clm', icon: Shield, requiresOperator: true, args: '<proposal_id>', example: 'seba.approve SEBA-001' },
  { command: 'seba.reject', description: 'Reject a proposal', category: 'clm', icon: Shield, requiresOperator: true, args: '<proposal_id>', example: 'seba.reject SEBA-001' },
  { command: 'seba.execute', description: 'Execute approved proposal', category: 'clm', icon: PlayCircle, requiresOperator: true, args: '<proposal_id>' },
  { command: 'seba.rollback', description: 'Rollback an execution', category: 'clm', icon: Shield, requiresOperator: true, args: '<execution_id>' },
  
  // Configuration
  { command: 'seba.config', description: 'View/update configuration', category: 'clm', icon: Settings, requiresOperator: false, args: '[key=value]' },
  { command: 'seba.thresholds', description: 'Adjust safety thresholds', category: 'clm', icon: Gauge, requiresOperator: true, args: '[auto_approve <val>|risk <level>]', example: 'seba.thresholds auto_approve 0.9' },
  { command: 'seba.history', description: 'View evolution history', category: 'clm', icon: Activity, requiresOperator: false, args: '[limit]', example: 'seba.history 20' },
  { command: 'seba.stamps', description: 'View evolution stamps for verification', category: 'clm', icon: FileCheck, requiresOperator: false, args: '[limit]', example: 'seba.stamps 5' },
  { command: 'seba.cooldown', description: 'View/manage insight cooldowns', category: 'clm', icon: Clock, requiresOperator: false },
];

// MODULE CLM — Module-specific self-learning v6.8.0
export const MODULE_CLM_COMMANDS: CommandDefinition[] = [
  { command: 'mclm.status', description: 'View all module CLM states', category: 'clm', icon: Brain, requiresOperator: false },
  { command: 'mclm.run', description: 'Run CLM for a specific module', category: 'clm', icon: Sparkles, requiresOperator: true, args: '<module>', example: 'mclm.run brain' },
  { command: 'mclm.run.all', description: 'Run CLM for all modules', category: 'clm', icon: Sparkles, requiresOperator: true },
  { command: 'mclm.feed', description: 'View latest intelligence feed', category: 'clm', icon: Activity, requiresOperator: false, args: '[limit]', example: 'mclm.feed 10' },
];

export const ENCODED_COMMANDS: CommandDefinition[] = [
  { command: 'encoded.status', description: 'Agent status and configuration', category: 'cortex', icon: PenTool, requiresOperator: false, requiredTier: 'free' },
  { command: 'encoded.config', description: 'View current configuration', category: 'cortex', icon: Settings, requiresOperator: false, requiredTier: 'free' },
  { command: 'encoded.skills', description: 'View skill proficiency levels', category: 'cortex', icon: Brain, requiresOperator: false, requiredTier: 'free' },
  { command: 'encoded.metrics', description: 'Quality metrics and success rates', category: 'cortex', icon: Activity, requiresOperator: false, requiredTier: 'free' },
  { command: 'encoded.dry_run', description: 'Enable dry-run mode (preview only)', category: 'cortex', icon: FileCheck, requiresOperator: true, requiredTier: 'creator' },
  { command: 'encoded.enable', description: 'Enable human approval mode', category: 'cortex', icon: PenTool, requiresOperator: true, requiredTier: 'creator' },
  { command: 'encoded.semi_auto', description: 'Enable semi-autonomous mode', category: 'cortex', icon: PenTool, requiresOperator: true, requiredTier: 'architect' },
  { command: 'encoded.verify', description: 'Verify code against guardrails', category: 'cortex', icon: FileCheck, requiresOperator: true, requiredTier: 'creator', args: '<code>' },
  { command: 'encoded.generate', description: 'Generate code (with task spec)', category: 'cortex', icon: FileEdit, requiresOperator: true, requiredTier: 'creator' },
  { command: 'encoded.analyze', description: 'Analyze code quality metrics', category: 'cortex', icon: Activity, requiresOperator: true, requiredTier: 'creator', args: '<code>' },
  { command: 'encoded.patterns', description: 'List learned code patterns', category: 'cortex', icon: Brain, requiresOperator: false, requiredTier: 'free' },
  { command: 'encoded.history', description: 'Recent Encoded executions', category: 'cortex', icon: Clock, requiresOperator: false, requiredTier: 'free' },
  { command: 'encoded.seba.enable', description: 'Enable SEBA integration', category: 'cortex', icon: GitBranch, requiresOperator: true, requiredTier: 'architect' },
  { command: 'encoded.seba.disable', description: 'Disable SEBA integration', category: 'cortex', icon: GitBranch, requiresOperator: true, requiredTier: 'architect' },
  { command: 'encoded.model.nexus', description: 'Use Nexus fleet as primary', category: 'cortex', icon: Sparkles, requiresOperator: true, requiredTier: 'architect' },
  { command: 'encoded.model.free', description: 'Use free-tier as primary', category: 'cortex', icon: Sparkles, requiresOperator: true, requiredTier: 'creator' },
  { command: 'encoded.help', description: 'Show all encoded commands', category: 'cortex', icon: Terminal, requiresOperator: false, requiredTier: 'free' },
];

export const ENGINE_COMMANDS: CommandDefinition[] = [
  { command: 'engine.status', description: 'Engine system overview (76 + 24 meta)', category: 'engine', icon: Cpu, requiresOperator: false, requiredTier: 'free' },
  { command: 'engine.list', description: 'List all 76 engines', category: 'engine', icon: List, requiresOperator: false, requiredTier: 'free', args: '[category]', example: 'engine.list cognitive' },
  { command: 'engine.get', description: 'Get engine details', category: 'engine', icon: Search, requiresOperator: false, requiredTier: 'free', args: '<engine_id>', example: 'engine.get reasoning_engine' },
  { command: 'engine.categories', description: 'List engine categories', category: 'engine', icon: Box, requiresOperator: false, requiredTier: 'free' },
  { command: 'engine.run', description: 'Execute an engine', category: 'engine', icon: PlayCircle, requiresOperator: true, requiredTier: 'creator', args: '<engine_id> [json_input]', example: 'engine.run reasoning_engine {"query":"test"}' },
  { command: 'engine.batch', description: 'Execute multiple engines', category: 'engine', icon: Workflow, requiresOperator: true, requiredTier: 'architect', args: '<engine_ids> [parallel]', example: 'engine.batch reasoning_engine,learning_engine true' },
  { command: 'meta.status', description: 'Meta-engine system overview', category: 'engine', icon: Workflow, requiresOperator: false, requiredTier: 'free' },
  { command: 'meta.list', description: 'List all 24 meta-engines', category: 'engine', icon: List, requiresOperator: false, requiredTier: 'free' },
  { command: 'meta.get', description: 'Get meta-engine details', category: 'engine', icon: Search, requiresOperator: false, requiredTier: 'free', args: '<meta_engine_id>', example: 'meta.get cognitive_mesh' },
  { command: 'meta.run', description: 'Execute a meta-engine', category: 'engine', icon: PlayCircle, requiresOperator: true, requiredTier: 'architect', args: '<meta_engine_id> [json_input]', example: 'meta.run cognitive_mesh {"task":"analyze"}' },
  { command: 'meta.batch', description: 'Execute multiple meta-engines', category: 'engine', icon: Workflow, requiresOperator: true, requiredTier: 'architect', args: '<meta_engine_ids> [parallel]', example: 'meta.batch cognitive_mesh,system_guardian true' },
  { command: 'engine.worldfirst', description: 'List 14 world-first enhancement engines', category: 'engine', icon: Sparkles, requiresOperator: false, requiredTier: 'free' },
  { command: 'engine.synergy', description: 'View synergy metrics', category: 'engine', icon: Activity, requiresOperator: false, requiredTier: 'free' },
  { command: 'engine.history', description: 'View recent engine executions', category: 'engine', icon: Clock, requiresOperator: false, requiredTier: 'free', args: '[limit]', example: 'engine.history 10' },
];

export const INFRA_COMMANDS: CommandDefinition[] = [
  { command: 'cron.list', description: 'List all scheduled jobs', category: 'infra', icon: Clock, requiresOperator: false, requiredTier: 'free' },
  { command: 'cron.stats', description: 'Cron runner statistics', category: 'infra', icon: Gauge, requiresOperator: false, requiredTier: 'free' },
  { command: 'cron.start', description: 'Start the cron runner', category: 'infra', icon: PlayCircle, requiresOperator: true, requiredTier: 'architect' },
  { command: 'cron.stop', description: 'Stop all cron jobs', category: 'infra', icon: XCircle, requiresOperator: true, requiredTier: 'architect' },
  { command: 'cron.trigger', description: 'Manually trigger a job', category: 'infra', icon: Zap, requiresOperator: true, requiredTier: 'creator', args: '<job-id>', example: 'cron.trigger health-check' },
  { command: 'cron.history', description: 'View cron run history', category: 'infra', icon: Clock, requiresOperator: false, requiredTier: 'free' },
  { command: 'cron.enable', description: 'Enable a specific job', category: 'infra', icon: CheckCircle, requiresOperator: true, requiredTier: 'creator', args: '<job-id>' },
  { command: 'cron.disable', description: 'Disable a specific job', category: 'infra', icon: XCircle, requiresOperator: true, requiredTier: 'creator', args: '<job-id>' },
  { command: 'ratelimit.status', description: 'Persistent rate limiter status', category: 'infra', icon: Gauge, requiresOperator: false, requiredTier: 'free' },
  { command: 'ratelimit.buckets', description: 'List all rate limit buckets', category: 'infra', icon: Database, requiresOperator: false, requiredTier: 'free' },
  { command: 'ratelimit.cleanup', description: 'Cleanup expired buckets', category: 'infra', icon: Settings, requiresOperator: true, requiredTier: 'creator' },
  { command: 'snapshot.list', description: 'List all state snapshots', category: 'infra', icon: Database, requiresOperator: false, requiredTier: 'free' },
  { command: 'snapshot.capture', description: 'Capture current state snapshot', category: 'infra', icon: Database, requiresOperator: true, requiredTier: 'architect' },
  { command: 'snapshot.stats', description: 'Snapshot storage statistics', category: 'infra', icon: Gauge, requiresOperator: false, requiredTier: 'free' },
  { command: 'snapshot.diff', description: 'Diff a snapshot vs current', category: 'infra', icon: GitBranch, requiresOperator: false, requiredTier: 'free', args: '<snapshot-id>' },
  { command: 'snapshot.restore', description: 'Restore from snapshot', category: 'infra', icon: Database, requiresOperator: true, requiredTier: 'governor', args: '<snapshot-id>' },
  { command: 'snapshot.delete', description: 'Delete a snapshot', category: 'infra', icon: XCircle, requiresOperator: true, requiredTier: 'architect', args: '<snapshot-id>' },
  { command: 'snapshot.prune', description: 'Prune old snapshots', category: 'infra', icon: Settings, requiresOperator: true, requiredTier: 'architect' },
  { command: 'analytics.summary', description: 'Capability usage summary (24h)', category: 'infra', icon: Activity, requiresOperator: false, requiredTier: 'free' },
  { command: 'analytics.top', description: 'Top used capabilities', category: 'infra', icon: Sparkles, requiresOperator: false, requiredTier: 'free' },
  { command: 'analytics.dead', description: 'Dead/unused capabilities', category: 'infra', icon: XCircle, requiresOperator: false, requiredTier: 'free' },
  { command: 'analytics.rising', description: 'Rising capability trends', category: 'infra', icon: Activity, requiresOperator: false, requiredTier: 'free' },
  { command: 'analytics.flush', description: 'Flush analytics to storage', category: 'infra', icon: Database, requiresOperator: true, requiredTier: 'architect' },
  { command: 'stream.status', description: 'Streaming pipeline status', category: 'infra', icon: Radio, requiresOperator: false, requiredTier: 'free' },
  { command: 'stream.active', description: 'Active stream sessions', category: 'infra', icon: Activity, requiresOperator: false, requiredTier: 'free' },
  { command: 'file.status', description: 'File processing pipeline status', category: 'infra', icon: FileText, requiresOperator: false, requiredTier: 'free' },
  { command: 'file.history', description: 'File processing history', category: 'infra', icon: Clock, requiresOperator: false, requiredTier: 'free' },
  { command: 'file.formats', description: 'Supported file formats', category: 'infra', icon: FileCheck, requiresOperator: false, requiredTier: 'free' },
  { command: 'nl.parse', description: 'Parse natural language to command', category: 'infra', icon: MessageSquare, requiresOperator: false, requiredTier: 'free', args: '<query>', example: 'nl.parse "show me system health"' },
  { command: 'nl.intents', description: 'List known NL intents', category: 'infra', icon: Search, requiresOperator: false, requiredTier: 'free' },
  { command: 'nl.history', description: 'NL parse history', category: 'infra', icon: Clock, requiresOperator: false, requiredTier: 'free' },
];

export const MEMORY_MOD_COMMANDS: CommandDefinition[] = [
  { command: 'memory.status', description: 'Vector/RAG orchestration status', category: 'memory_mod', icon: Database, requiresOperator: false, requiredTier: 'free' },
  { command: 'memory.recall', description: 'Semantic recall from vector store', category: 'memory_mod', icon: Search, requiresOperator: false, requiredTier: 'free', args: '<query> [limit]', example: 'memory.recall "security policy" 5' },
  { command: 'memory.ingest', description: 'Ingest document/data source', category: 'memory_mod', icon: Database, requiresOperator: true, requiredTier: 'creator', args: '<source> [format]', example: 'memory.ingest docs/ pdf' },
  { command: 'memory.consolidate', description: 'Run memory consolidation cycle', category: 'memory_mod', icon: Database, requiresOperator: true, requiredTier: 'architect' },
  { command: 'memory.tiers', description: 'View memory tier distribution', category: 'memory_mod', icon: Layers, requiresOperator: false, requiredTier: 'free' },
];

export const RELAY_MOD_COMMANDS: CommandDefinition[] = [
  { command: 'relay.status', description: 'Outbound effects hub status', category: 'relay_mod', icon: Send, requiresOperator: false, requiredTier: 'free' },
  { command: 'relay.dispatch', description: 'Dispatch outbound webhook', category: 'relay_mod', icon: Send, requiresOperator: true, requiredTier: 'creator', args: '<target_url> <payload>', example: 'relay.dispatch https://api.example.com/hook "{}"' },
  { command: 'relay.queue', description: 'View delivery queue', category: 'relay_mod', icon: List, requiresOperator: false, requiredTier: 'free', args: '[status]' },
  { command: 'relay.deliveries', description: 'Recent delivery history', category: 'relay_mod', icon: Activity, requiresOperator: false, requiredTier: 'free', args: '[limit]' },
  { command: 'relay.retry', description: 'Retry failed delivery', category: 'relay_mod', icon: PlayCircle, requiresOperator: true, requiredTier: 'creator', args: '<delivery_id>' },
];

export const AUDIT_MOD_COMMANDS: CommandDefinition[] = [
  { command: 'audit.status', description: 'Immutable compliance ledger status', category: 'audit_mod', icon: FileCheck, requiresOperator: false, requiredTier: 'free' },
  { command: 'audit.query', description: 'Query audit trail', category: 'audit_mod', icon: Search, requiresOperator: false, requiredTier: 'free', args: '[module] [action] [since]', example: 'audit.query defense block 24h' },
  { command: 'audit.verify', description: 'Verify hash chain integrity', category: 'audit_mod', icon: Shield, requiresOperator: false, requiredTier: 'free' },
  { command: 'audit.report', description: 'Generate compliance report', category: 'audit_mod', icon: FileText, requiresOperator: false, requiredTier: 'free', args: '[standard]', example: 'audit.report SOC2' },
  { command: 'audit.export', description: 'Export audit log', category: 'audit_mod', icon: Database, requiresOperator: true, requiredTier: 'architect', args: '[format] [since]' },
];

export const IDENTITY_MOD_COMMANDS: CommandDefinition[] = [
  { command: 'identity.status', description: 'Universal actor attribution status', category: 'identity_mod', icon: Key, requiresOperator: false, requiredTier: 'free' },
  { command: 'identity.whoami', description: 'Current actor identity + signature', category: 'identity_mod', icon: Users, requiresOperator: false, requiredTier: 'free' },
  { command: 'identity.resolve', description: 'Resolve actor by ID', category: 'identity_mod', icon: Search, requiresOperator: false, requiredTier: 'free', args: '<actor_id>' },
  { command: 'identity.sign', description: 'Sign action with identity', category: 'identity_mod', icon: Lock, requiresOperator: true, requiredTier: 'architect', args: '<action> <payload>' },
  { command: 'identity.verify', description: 'Verify identity signature', category: 'identity_mod', icon: Shield, requiresOperator: false, requiredTier: 'free', args: '<signature>' },
];

export const ECONOMY_MOD_COMMANDS: CommandDefinition[] = [
  { command: 'economy.status', description: 'Cost attribution & budget status', category: 'economy_mod', icon: CreditCard, requiresOperator: false, requiredTier: 'free' },
  { command: 'economy.cost', description: 'Track cost for operation', category: 'economy_mod', icon: CreditCard, requiresOperator: false, requiredTier: 'free', args: '[module] [period]', example: 'economy.cost nexus 24h' },
  { command: 'economy.budget', description: 'View/set budget limits', category: 'economy_mod', icon: Gauge, requiresOperator: false, requiredTier: 'free', args: '[module]' },
  { command: 'economy.report', description: 'Cost attribution report', category: 'economy_mod', icon: Activity, requiresOperator: false, requiredTier: 'free', args: '[period]', example: 'economy.report 7d' },
  { command: 'economy.forecast', description: 'Spend forecast', category: 'economy_mod', icon: Activity, requiresOperator: false, requiredTier: 'free', args: '[days]' },
];

export const SANDBOX_MOD_COMMANDS: CommandDefinition[] = [
  { command: 'sandbox.status', description: 'Isolated execution environment status', category: 'sandbox_mod', icon: Box, requiresOperator: false, requiredTier: 'free' },
  { command: 'sandbox.create', description: 'Create new sandbox environment', category: 'sandbox_mod', icon: Box, requiresOperator: true, requiredTier: 'creator', args: '[name] [ttl]', example: 'sandbox.create test-env 1h' },
  { command: 'sandbox.execute', description: 'Execute code in sandbox', category: 'sandbox_mod', icon: PlayCircle, requiresOperator: true, requiredTier: 'creator', args: '<sandbox_id> <code>' },
  { command: 'sandbox.list', description: 'List active sandboxes', category: 'sandbox_mod', icon: List, requiresOperator: false, requiredTier: 'free' },
  { command: 'sandbox.destroy', description: 'Destroy sandbox', category: 'sandbox_mod', icon: XCircle, requiresOperator: true, requiredTier: 'architect', args: '<sandbox_id>' },
];

// ENCODE MODULE — Code generation & transformation (v10.5.4)
export const ENCODE_MOD_COMMANDS: CommandDefinition[] = [
  { command: 'encode.status', description: 'Code generation engine status', category: 'cortex', icon: PenTool, requiresOperator: false },
  { command: 'encode.queue', description: 'View pending task packets from DECODE', category: 'cortex', icon: List, requiresOperator: false },
  { command: 'encode.receipts', description: 'Completion receipts with BRAIN refs', category: 'cortex', icon: FileCheck, requiresOperator: false, args: '[limit]' },
  { command: 'encode.health', description: 'ENCODE module health score', category: 'cortex', icon: Activity, requiresOperator: false },
  { command: 'encode.help', description: 'ENCODE module command reference', category: 'cortex', icon: Terminal, requiresOperator: false },
];

// PATCH — Distribution Patch Dispatch v8.5.0
export const PATCH_COMMANDS: CommandDefinition[] = [
  { command: 'patch.send', description: 'Dispatch a patch to LNCHBL', category: 'infra', icon: Send, requiresOperator: true, args: '<version> <changelog> [capabilities] [engines]', example: 'patch.send 2.1.0 "Enable dream synthesis" dream_synthesis reasoning_engine' },
  { command: 'patch.status', description: 'List recent patches from cmpsbl_patches', category: 'infra', icon: Activity, requiresOperator: false },
  { command: 'patch.publish', description: 'Publish a draft patch by ID and dispatch to LNCHBL', category: 'infra', icon: Send, requiresOperator: true, args: '<patch_id>', example: 'patch.publish abc123' },
  { command: 'patch.help', description: 'Show patch dispatch commands', category: 'infra', icon: Terminal, requiresOperator: false },
];

// ═══════════════════════════════════════════════════════════════════════════════
// HARDENING v2.0.0 — Cross-module hardening observability commands
// Covers: CORE, SYSTEM, CORTEX, ENCODE, DECODE, VISION, DEFENSE, GOVERNANCE
// ═══════════════════════════════════════════════════════════════════════════════

export const HARDENING_COMMANDS: CommandDefinition[] = [
  // Unified hardening overview
  { command: 'hardening.status', description: 'All hardened modules overview (grades + scores)', category: 'system', icon: Shield, requiresOperator: false, requiredTier: 'free' },
  { command: 'hardening.health', description: 'Aggregated hardening health composite', category: 'system', icon: Activity, requiresOperator: false, requiredTier: 'free' },
  { command: 'hardening.grades', description: 'A–F grade summary for all modules', category: 'system', icon: Gauge, requiresOperator: false, requiredTier: 'free' },
  { command: 'hardening.audit', description: 'Cross-module hardening audit chain verification', category: 'system', icon: FileCheck, requiresOperator: false, requiredTier: 'free' },
  { command: 'hardening.versions', description: 'Hardening version registry', category: 'system', icon: Cpu, requiresOperator: false, requiredTier: 'free' },

  // Per-module hardening commands — CORE
  { command: 'core.hardening', description: 'CORE hardening status (Foundation v2.0)', category: 'core', icon: Shield, requiresOperator: false, requiredTier: 'free' },
  { command: 'core.hardening.health', description: 'CORE hardening health composite', category: 'core', icon: Activity, requiresOperator: false, requiredTier: 'free' },
  { command: 'core.hardening.boot', description: 'CORE boot integrity chain', category: 'core', icon: Server, requiresOperator: false, requiredTier: 'free' },
  { command: 'core.hardening.watchdog', description: 'CORE kernel watchdog state', category: 'core', icon: Eye, requiresOperator: false, requiredTier: 'free' },

  // Per-module hardening commands — SYSTEM
  { command: 'system.hardening', description: 'SYSTEM hardening status (Bastion v2.0)', category: 'system', icon: Shield, requiresOperator: false, requiredTier: 'free' },
  { command: 'system.hardening.health', description: 'SYSTEM health composite (A–F)', category: 'system', icon: Activity, requiresOperator: false, requiredTier: 'free' },
  { command: 'system.hardening.lifecycle', description: 'Lifecycle state machine phase', category: 'system', icon: Cpu, requiresOperator: false, requiredTier: 'free' },
  { command: 'system.hardening.heartbeats', description: 'Module heartbeat monitor', category: 'system', icon: Activity, requiresOperator: false, requiredTier: 'free' },
  { command: 'system.hardening.quarantine', description: 'Quarantined modules list', category: 'system', icon: Shield, requiresOperator: false, requiredTier: 'free' },
  { command: 'system.hardening.canaries', description: 'Canary flag rollout status', category: 'system', icon: Gauge, requiresOperator: false, requiredTier: 'free' },
  { command: 'system.hardening.sla', description: 'SLA compliance monitor', category: 'system', icon: Activity, requiresOperator: false, requiredTier: 'free' },
  { command: 'system.hardening.boot_timing', description: 'Boot timing profiler', category: 'system', icon: Clock, requiresOperator: false, requiredTier: 'free' },
  { command: 'system.hardening.readiness', description: 'Operational readiness checks', category: 'system', icon: CheckCircle, requiresOperator: false, requiredTier: 'free' },

  // Per-module hardening commands — CORTEX
  { command: 'cortex.hardening', description: 'CORTEX hardening status (Conductor v2.0)', category: 'cortex', icon: Shield, requiresOperator: false, requiredTier: 'free' },
  { command: 'cortex.hardening.health', description: 'CORTEX orchestration health composite', category: 'cortex', icon: Activity, requiresOperator: false, requiredTier: 'free' },
  { command: 'cortex.hardening.sla', description: 'Pipeline SLA compliance', category: 'cortex', icon: Gauge, requiresOperator: false, requiredTier: 'free' },
  { command: 'cortex.hardening.backpressure', description: 'Backpressure controller state', category: 'cortex', icon: Activity, requiresOperator: false, requiredTier: 'free' },

  // Per-module hardening commands — ENCODE
  { command: 'encode.hardening', description: 'ENCODE hardening status (Forge v2.0)', category: 'cortex', icon: Shield, requiresOperator: false, requiredTier: 'free' },
  { command: 'encode.hardening.health', description: 'ENCODE health composite', category: 'cortex', icon: Activity, requiresOperator: false, requiredTier: 'free' },
  { command: 'encode.hardening.budget', description: 'Generation budget status', category: 'cortex', icon: Gauge, requiresOperator: false, requiredTier: 'free' },
  { command: 'encode.hardening.quality', description: 'Code quality gate scores', category: 'cortex', icon: FileCheck, requiresOperator: false, requiredTier: 'free' },

  // Per-module hardening commands — DECODE
  { command: 'decode.hardening', description: 'DECODE hardening status (Cipher v2.0)', category: 'decode', icon: Shield, requiresOperator: false, requiredTier: 'free' },
  { command: 'decode.hardening.health', description: 'DECODE health composite', category: 'decode', icon: Activity, requiresOperator: false, requiredTier: 'free' },
  { command: 'decode.hardening.trust', description: 'Identity trust ladder status', category: 'decode', icon: Key, requiresOperator: false, requiredTier: 'free' },
  { command: 'decode.hardening.sanitization', description: 'Input sanitization pipeline stats', category: 'decode', icon: Shield, requiresOperator: false, requiredTier: 'free' },

  // Per-module hardening commands — VISION
  { command: 'vision.hardening', description: 'VISION hardening status (Sentinel v2.0)', category: 'vision', icon: Shield, requiresOperator: false, requiredTier: 'free' },
  { command: 'vision.hardening.health', description: 'VISION health composite', category: 'vision', icon: Activity, requiresOperator: false, requiredTier: 'free' },
  { command: 'vision.hardening.anomalies', description: 'Anomaly detection integrity', category: 'vision', icon: Eye, requiresOperator: false, requiredTier: 'free' },

  // Per-module hardening commands — DEFENSE
  { command: 'defense.hardening', description: 'DEFENSE hardening status (Fortress v2.0)', category: 'defense', icon: Shield, requiresOperator: false, requiredTier: 'free' },
  { command: 'defense.hardening.health', description: 'DEFENSE health composite', category: 'defense', icon: Activity, requiresOperator: false, requiredTier: 'free' },
  { command: 'defense.hardening.fingerprint', description: 'Behavioral fingerprint engine stats', category: 'defense', icon: Lock, requiresOperator: false, requiredTier: 'free' },

  // Per-module hardening commands — GOVERNANCE
  { command: 'governance.hardening', description: 'GOVERNANCE hardening status (Magistrate v2.0)', category: 'system', icon: Shield, requiresOperator: false, requiredTier: 'free' },
  { command: 'governance.hardening.health', description: 'GOVERNANCE health composite', category: 'system', icon: Activity, requiresOperator: false, requiredTier: 'free' },
  { command: 'governance.hardening.decisions', description: 'Decision chain audit', category: 'system', icon: FileCheck, requiresOperator: false, requiredTier: 'free' },

  // Per-module hardening — BRAIN (CCR Zone)
  { command: 'brain.hardening', description: 'BRAIN hardening status (Memoria v2.0)', category: 'brain', icon: Shield, requiresOperator: false, requiredTier: 'free' },
  { command: 'brain.hardening.health', description: 'BRAIN health composite', category: 'brain', icon: Activity, requiresOperator: false, requiredTier: 'free' },
  { command: 'brain.hardening.beliefs', description: 'Belief revision tracker', category: 'brain', icon: Brain, requiresOperator: false, requiredTier: 'free' },
  { command: 'brain.hardening.biases', description: 'Cognitive bias detector alerts', category: 'brain', icon: Eye, requiresOperator: false, requiredTier: 'free' },
  { command: 'brain.hardening.cache', description: 'Reasoning result cache stats', category: 'brain', icon: Database, requiresOperator: false, requiredTier: 'free' },
  { command: 'brain.hardening.fatigue', description: 'Cognitive fatigue monitor', category: 'brain', icon: Activity, requiresOperator: false, requiredTier: 'free' },
  { command: 'brain.hardening.focus', description: 'Focus target distribution', category: 'brain', icon: Eye, requiresOperator: false, requiredTier: 'free' },
  { command: 'brain.hardening.inferences', description: 'Inference audit trail', category: 'brain', icon: FileCheck, requiresOperator: false, requiredTier: 'free' },
  { command: 'brain.hardening.kg', description: 'Knowledge graph integrity', category: 'brain', icon: Database, requiresOperator: false, requiredTier: 'free' },
  { command: 'brain.hardening.load', description: 'Cognitive load balancer state', category: 'brain', icon: Gauge, requiresOperator: false, requiredTier: 'free' },
  { command: 'brain.hardening.entropy', description: 'Cognitive entropy monitor', category: 'brain', icon: Activity, requiresOperator: false, requiredTier: 'free' },
  { command: 'brain.hardening.timeouts', description: 'Reasoning timeout enforcer stats', category: 'brain', icon: Clock, requiresOperator: false, requiredTier: 'free' },
  { command: 'brain.hardening.snapshots', description: 'Cognitive state snapshots', category: 'brain', icon: Database, requiresOperator: false, requiredTier: 'free' },

  // Per-module hardening — MEMORY (CCR Zone)
  { command: 'memory.hardening', description: 'MEMORY hardening status (Vault v2.0)', category: 'memory_mod', icon: Shield, requiresOperator: false, requiredTier: 'free' },
  { command: 'memory.hardening.health', description: 'MEMORY health composite', category: 'memory_mod', icon: Activity, requiresOperator: false, requiredTier: 'free' },
  { command: 'memory.hardening.tiering', description: 'Hot/warm/cold tier distribution', category: 'memory_mod', icon: Database, requiresOperator: false, requiredTier: 'free' },
  { command: 'memory.hardening.capacity', description: 'Memory capacity utilization', category: 'memory_mod', icon: Gauge, requiresOperator: false, requiredTier: 'free' },
  { command: 'memory.hardening.recall', description: 'Recall accuracy (precision/recall/F1)', category: 'memory_mod', icon: Activity, requiresOperator: false, requiredTier: 'free' },
  { command: 'memory.hardening.wal', description: 'Write-ahead log stats', category: 'memory_mod', icon: FileText, requiresOperator: false, requiredTier: 'free' },
  { command: 'memory.hardening.backup', description: 'Backup health status', category: 'memory_mod', icon: Database, requiresOperator: false, requiredTier: 'free' },
  { command: 'memory.hardening.duplicates', description: 'Deduplication engine stats', category: 'memory_mod', icon: Activity, requiresOperator: false, requiredTier: 'free' },
  { command: 'memory.hardening.corruption', description: 'Corruption detection rate', category: 'memory_mod', icon: Shield, requiresOperator: false, requiredTier: 'free' },
  { command: 'memory.hardening.sm2', description: 'SM-2 spaced repetition health', category: 'memory_mod', icon: Brain, requiresOperator: false, requiredTier: 'free' },
  { command: 'memory.hardening.index', description: 'Index health status', category: 'memory_mod', icon: Database, requiresOperator: false, requiredTier: 'free' },
  { command: 'memory.hardening.audit', description: 'Memory access audit trail', category: 'memory_mod', icon: FileCheck, requiresOperator: false, requiredTier: 'free' },
  { command: 'memory.hardening.retrieval', description: 'Retrieval latency (P95) by strategy', category: 'memory_mod', icon: Clock, requiresOperator: false, requiredTier: 'free' },

  // Per-module hardening — DREAM (CCR Zone)
  { command: 'dream.hardening', description: 'DREAM hardening status (Nocturne v2.0)', category: 'dream', icon: Shield, requiresOperator: false, requiredTier: 'free' },
  { command: 'dream.hardening.health', description: 'DREAM health composite', category: 'dream', icon: Activity, requiresOperator: false, requiredTier: 'free' },
  { command: 'dream.hardening.coherence', description: 'Dream coherence trend', category: 'dream', icon: Activity, requiresOperator: false, requiredTier: 'free' },
  { command: 'dream.hardening.hallucinations', description: 'Hallucination guard rate', category: 'dream', icon: Eye, requiresOperator: false, requiredTier: 'free' },
  { command: 'dream.hardening.energy', description: 'Dream energy budget', category: 'dream', icon: Gauge, requiresOperator: false, requiredTier: 'free' },
  { command: 'dream.hardening.queue', description: 'Dream cycle queue stats', category: 'dream', icon: Activity, requiresOperator: false, requiredTier: 'free' },
  { command: 'dream.hardening.patterns', description: 'Latent pattern cache stats', category: 'dream', icon: Brain, requiresOperator: false, requiredTier: 'free' },
  { command: 'dream.hardening.insights', description: 'Insight promotion pipeline', category: 'dream', icon: Sparkles, requiresOperator: false, requiredTier: 'free' },
  { command: 'dream.hardening.archive', description: 'Dream result archive stats', category: 'dream', icon: Database, requiresOperator: false, requiredTier: 'free' },
  { command: 'dream.hardening.governance', description: 'Dream governance gate stats', category: 'dream', icon: Shield, requiresOperator: false, requiredTier: 'free' },
  { command: 'dream.hardening.temperature', description: 'Dream temperature controller', category: 'dream', icon: Activity, requiresOperator: false, requiredTier: 'free' },
  { command: 'dream.hardening.idle', description: 'Idle cycle detector state', category: 'dream', icon: Clock, requiresOperator: false, requiredTier: 'free' },
  { command: 'dream.hardening.synthesis', description: 'Synthesis audit trail', category: 'dream', icon: FileCheck, requiresOperator: false, requiredTier: 'free' },

  // Per-module hardening — ECONOMY
  { command: 'economy.hardening', description: 'ECONOMY hardening status (Ledger v2.0)', category: 'economy_mod', icon: Shield, requiresOperator: false, requiredTier: 'free' },
  { command: 'economy.hardening.health', description: 'ECONOMY health composite', category: 'economy_mod', icon: Activity, requiresOperator: false, requiredTier: 'free' },
  { command: 'economy.hardening.budget', description: 'Budget breach circuit breaker', category: 'economy_mod', icon: Zap, requiresOperator: false, requiredTier: 'free' },
  { command: 'economy.hardening.velocity', description: 'Spend velocity limiter', category: 'economy_mod', icon: Gauge, requiresOperator: false, requiredTier: 'free' },
  { command: 'economy.hardening.anomalies', description: 'Cost anomaly detector (Z-score)', category: 'economy_mod', icon: Activity, requiresOperator: false, requiredTier: 'free' },
  { command: 'economy.hardening.audit', description: 'Economy audit hash chain', category: 'economy_mod', icon: FileCheck, requiresOperator: false, requiredTier: 'free' },
  { command: 'economy.hardening.forecast', description: 'Forecast drift detector', category: 'economy_mod', icon: Activity, requiresOperator: false, requiredTier: 'free' },
  { command: 'economy.hardening.envelope', description: 'Budget envelope guard', category: 'economy_mod', icon: Shield, requiresOperator: false, requiredTier: 'free' },
  { command: 'economy.hardening.runaway', description: 'Runaway spend prevention gate', category: 'economy_mod', icon: Shield, requiresOperator: false, requiredTier: 'free' },
  { command: 'economy.hardening.reconciliation', description: 'Reconciliation engine', category: 'economy_mod', icon: CheckCircle, requiresOperator: false, requiredTier: 'free' },
  { command: 'economy.hardening.fingerprint', description: 'Spend pattern fingerprinter', category: 'economy_mod', icon: Lock, requiresOperator: false, requiredTier: 'free' },
  { command: 'economy.hardening.rollover', description: 'Budget rollover engine', category: 'economy_mod', icon: CreditCard, requiresOperator: false, requiredTier: 'free' },
  { command: 'economy.hardening.attribution', description: 'Attribution confidence scorer', category: 'economy_mod', icon: Gauge, requiresOperator: false, requiredTier: 'free' },
  { command: 'economy.hardening.seals', description: 'Transaction integrity seal status', category: 'economy_mod', icon: Lock, requiresOperator: false, requiredTier: 'free' },
  { command: 'economy.hardening.tamper', description: 'Cost record tamper detection', category: 'economy_mod', icon: Shield, requiresOperator: false, requiredTier: 'free' },

  // Per-module hardening — IMMUNITY (Field — Outer Mesh)
  { command: 'immunity.hardening', description: 'IMMUNITY hardening status (Watchguard v2.0)', category: 'defense', icon: Shield, requiresOperator: false, requiredTier: 'free' },
  { command: 'immunity.hardening.health', description: 'IMMUNITY health composite', category: 'defense', icon: Activity, requiresOperator: false, requiredTier: 'free' },
  { command: 'immunity.hardening.quarantine', description: 'Quarantined modules list', category: 'defense', icon: Shield, requiresOperator: false, requiredTier: 'free' },
  { command: 'immunity.hardening.healing', description: 'Healing pipeline stats', category: 'defense', icon: Activity, requiresOperator: false, requiredTier: 'free' },
  { command: 'immunity.hardening.sentinel', description: 'Sentinel watchdog pulse stats', category: 'defense', icon: Eye, requiresOperator: false, requiredTier: 'free' },
  { command: 'immunity.hardening.cascade', description: 'Cascade failure detection events', category: 'defense', icon: Activity, requiresOperator: false, requiredTier: 'free' },
  { command: 'immunity.hardening.threats', description: 'Active threat intelligence feed', category: 'defense', icon: Shield, requiresOperator: false, requiredTier: 'free' },
  { command: 'immunity.hardening.drift', description: 'Drift baseline tracker', category: 'defense', icon: Gauge, requiresOperator: false, requiredTier: 'free' },
  { command: 'immunity.hardening.vaccines', description: 'Deployed vaccine registry', category: 'defense', icon: Shield, requiresOperator: false, requiredTier: 'free' },
  { command: 'immunity.hardening.memory', description: 'Immune memory (learned patterns)', category: 'defense', icon: Database, requiresOperator: false, requiredTier: 'free' },
  { command: 'immunity.hardening.circuit', description: 'Immune circuit breaker state', category: 'defense', icon: Zap, requiresOperator: false, requiredTier: 'free' },
  { command: 'immunity.hardening.permeation', description: 'Field permeation coverage', category: 'defense', icon: Activity, requiresOperator: false, requiredTier: 'free' },
  { command: 'immunity.hardening.audit', description: 'Tamper-evident audit chain', category: 'defense', icon: FileCheck, requiresOperator: false, requiredTier: 'free' },
  { command: 'immunity.hardening.fatigue', description: 'Immune fatigue detector', category: 'defense', icon: Activity, requiresOperator: false, requiredTier: 'free' },
  { command: 'immunity.hardening.response_time', description: 'Immune response time (P95/P99)', category: 'defense', icon: Clock, requiresOperator: false, requiredTier: 'free' },

  // Per-module hardening — EVOLUTION (Field — Middle Mesh)
  { command: 'evolution.hardening', description: 'EVOLUTION hardening status (Chrysalis v2.0)', category: 'system', icon: Shield, requiresOperator: false, requiredTier: 'free' },
  { command: 'evolution.hardening.health', description: 'EVOLUTION health composite', category: 'system', icon: Activity, requiresOperator: false, requiredTier: 'free' },
  { command: 'evolution.hardening.cycle', description: 'Current evolution cycle state', category: 'system', icon: GitBranch, requiresOperator: false, requiredTier: 'free' },
  { command: 'evolution.hardening.risk', description: 'Risk budget status', category: 'system', icon: Gauge, requiresOperator: false, requiredTier: 'free' },
  { command: 'evolution.hardening.snapshots', description: 'Snapshot inventory & age', category: 'system', icon: Database, requiresOperator: false, requiredTier: 'free' },
  { command: 'evolution.hardening.rollback', description: 'Rollback safety stats', category: 'system', icon: Activity, requiresOperator: false, requiredTier: 'free' },
  { command: 'evolution.hardening.shadow', description: 'Shadow mode validation results', category: 'system', icon: Eye, requiresOperator: false, requiredTier: 'free' },
  { command: 'evolution.hardening.entropy', description: 'Entropy trend analyzer', category: 'system', icon: Activity, requiresOperator: false, requiredTier: 'free' },
  { command: 'evolution.hardening.canary', description: 'Canary deployment states', category: 'system', icon: Server, requiresOperator: false, requiredTier: 'free' },
  { command: 'evolution.hardening.gates', description: 'Gate compliance tracker', category: 'system', icon: CheckCircle, requiresOperator: false, requiredTier: 'free' },
  { command: 'evolution.hardening.receipts', description: 'Tamper-evident receipt chain', category: 'system', icon: FileCheck, requiresOperator: false, requiredTier: 'free' },
  { command: 'evolution.hardening.vetos', description: 'Governance veto tracker', category: 'system', icon: XCircle, requiresOperator: false, requiredTier: 'free' },
  { command: 'evolution.hardening.velocity', description: 'Improvement velocity trend', category: 'system', icon: Activity, requiresOperator: false, requiredTier: 'free' },
  { command: 'evolution.hardening.funnel', description: 'Promotion pipeline funnel', category: 'system', icon: Layers, requiresOperator: false, requiredTier: 'free' },
  { command: 'evolution.hardening.cooldown', description: 'Evolution cooldown timer', category: 'system', icon: Clock, requiresOperator: false, requiredTier: 'free' },
  { command: 'evolution.hardening.seba', description: 'SEBA confidence scores', category: 'system', icon: Brain, requiresOperator: false, requiredTier: 'free' },

  // Per-module hardening — INTENT (Field — Inner Mesh)
  { command: 'intent.hardening', description: 'INTENT hardening status (Navigator v2.0)', category: 'brain', icon: Shield, requiresOperator: false, requiredTier: 'free' },
  { command: 'intent.hardening.health', description: 'INTENT health composite', category: 'brain', icon: Activity, requiresOperator: false, requiredTier: 'free' },
  { command: 'intent.hardening.resolution', description: 'Intent resolution audit trail', category: 'brain', icon: Search, requiresOperator: false, requiredTier: 'free' },
  { command: 'intent.hardening.goals', description: 'Goal lifecycle tracker', category: 'brain', icon: CheckCircle, requiresOperator: false, requiredTier: 'free' },
  { command: 'intent.hardening.amplification', description: 'Context amplification metrics', category: 'brain', icon: Sparkles, requiresOperator: false, requiredTier: 'free' },
  { command: 'intent.hardening.confidence', description: 'Confidence distribution', category: 'brain', icon: Gauge, requiresOperator: false, requiredTier: 'free' },
  { command: 'intent.hardening.disambiguation', description: 'Disambiguation engine stats', category: 'brain', icon: Activity, requiresOperator: false, requiredTier: 'free' },
  { command: 'intent.hardening.sessions', description: 'Session context tracker', category: 'brain', icon: Users, requiresOperator: false, requiredTier: 'free' },
  { command: 'intent.hardening.cache', description: 'Intent resolution cache stats', category: 'brain', icon: Database, requiresOperator: false, requiredTier: 'free' },
  { command: 'intent.hardening.conflicts', description: 'Intent conflict detector', category: 'brain', icon: XCircle, requiresOperator: false, requiredTier: 'free' },
  { command: 'intent.hardening.feedback', description: 'Intent feedback loop stats', category: 'brain', icon: Activity, requiresOperator: false, requiredTier: 'free' },
  { command: 'intent.hardening.latency', description: 'Intent resolution latency (P95)', category: 'brain', icon: Clock, requiresOperator: false, requiredTier: 'free' },
  { command: 'intent.hardening.taxonomy', description: 'Intent taxonomy mapper', category: 'brain', icon: Layers, requiresOperator: false, requiredTier: 'free' },
  { command: 'intent.hardening.patterns', description: 'Learned intent patterns', category: 'brain', icon: Brain, requiresOperator: false, requiredTier: 'free' },
  { command: 'intent.hardening.governance', description: 'Intent governance gate stats', category: 'brain', icon: Shield, requiresOperator: false, requiredTier: 'free' },
  { command: 'intent.hardening.throughput', description: 'Intent throughput monitor', category: 'brain', icon: Gauge, requiresOperator: false, requiredTier: 'free' },
  { command: 'intent.hardening.mesh', description: 'Mesh permeation stats', category: 'brain', icon: Globe, requiresOperator: false, requiredTier: 'free' },
  { command: 'intent.hardening.fallbacks', description: 'Fallback strategy stats', category: 'brain', icon: Activity, requiresOperator: false, requiredTier: 'free' },
];

// ═══ ENGINEER Operational Commands ═══
export const ENGINEER_OP_COMMANDS: CommandDefinition[] = [
  { command: 'engineer.status', description: 'ENGINEER node overview', category: 'engine', icon: Settings, requiresOperator: false, requiredTier: 'free' },
  { command: 'engineer.health', description: 'Engine fleet health summary', category: 'engine', icon: Activity, requiresOperator: false, requiredTier: 'free' },
  { command: 'engineer.degraded', description: 'List degraded engines', category: 'engine', icon: AlertTriangle, requiresOperator: false, requiredTier: 'free' },
  { command: 'engineer.proposals', description: 'All pending proposals', category: 'engine', icon: FileText, requiresOperator: false, requiredTier: 'free' },
  { command: 'engineer.proposals.pending', description: 'Proposals awaiting review', category: 'engine', icon: Clock, requiresOperator: false, requiredTier: 'free' },
  { command: 'engineer.proposals.approved', description: 'Approved proposal history', category: 'engine', icon: CheckCircle, requiresOperator: false, requiredTier: 'free' },
  { command: 'engineer.cycle', description: 'Run maintenance cycle', category: 'engine', icon: RefreshCw, requiresOperator: true, requiredTier: 'architect' },
  { command: 'engineer.study', description: 'Current CLM study focus', category: 'engine', icon: BookOpen, requiresOperator: false, requiredTier: 'free' },
  { command: 'engineer.study.queue', description: 'CLM study queue', category: 'engine', icon: List, requiresOperator: false, requiredTier: 'free' },
  { command: 'engineer.study.topics', description: 'Dynamic CLM topics', category: 'engine', icon: Brain, requiresOperator: false, requiredTier: 'free' },
  { command: 'engineer.stats', description: 'ENGINEER statistics', category: 'engine', icon: Gauge, requiresOperator: false, requiredTier: 'free' },
  { command: 'engineer.hardening', description: 'ENGINEER hardening status (Mechanist v2.0)', category: 'engine', icon: Shield, requiresOperator: false, requiredTier: 'free' },
  { command: 'engineer.hardening.health', description: 'ENGINEER health composite', category: 'engine', icon: Activity, requiresOperator: false, requiredTier: 'free' },
  { command: 'engineer.hardening.audit', description: 'Engine audit trail', category: 'engine', icon: FileCheck, requiresOperator: false, requiredTier: 'free' },
  { command: 'engineer.hardening.baselines', description: 'Engine performance baselines', category: 'engine', icon: Gauge, requiresOperator: false, requiredTier: 'free' },
  { command: 'engineer.hardening.maintenance', description: 'Upcoming maintenance schedule', category: 'engine', icon: Clock, requiresOperator: false, requiredTier: 'free' },
  { command: 'engineer.hardening.synergy', description: 'Synergy multiplier tracker', category: 'engine', icon: Sparkles, requiresOperator: false, requiredTier: 'free' },
  { command: 'engineer.hardening.restarts', description: 'Engine restart counts', category: 'engine', icon: RefreshCw, requiresOperator: false, requiredTier: 'free' },
  { command: 'engineer.hardening.errors', description: 'Engine error classifications', category: 'engine', icon: XCircle, requiresOperator: false, requiredTier: 'free' },
  { command: 'engineer.hardening.lifecycle', description: 'Engine lifecycle states', category: 'engine', icon: GitBranch, requiresOperator: false, requiredTier: 'free' },
  { command: 'engineer.hardening.alerts', description: 'Degradation alert queue', category: 'engine', icon: AlertTriangle, requiresOperator: false, requiredTier: 'free' },
  { command: 'engineer.hardening.throughput', description: 'Engine throughput monitor', category: 'engine', icon: Gauge, requiresOperator: false, requiredTier: 'free' },
  { command: 'engineer.hardening.transfers', description: 'Knowledge transfer history', category: 'engine', icon: Send, requiresOperator: false, requiredTier: 'free' },
  { command: 'engineer.hardening.telemetry', description: 'Telemetry trend snapshots', category: 'engine', icon: Activity, requiresOperator: false, requiredTier: 'free' },
  { command: 'engineer.hardening.certs', description: 'Engine certification tracker', category: 'engine', icon: CheckCircle, requiresOperator: false, requiredTier: 'free' },
];

// ═══ INTENT Hub Operational Commands ═══
export const INTENT_OP_COMMANDS: CommandDefinition[] = [
  { command: 'intent.inbox', description: 'All pending intent messages', category: 'brain', icon: Inbox, requiresOperator: false, requiredTier: 'free' },
  { command: 'intent.inbox.count', description: 'Pending message count', category: 'brain', icon: Gauge, requiresOperator: false, requiredTier: 'free' },
  { command: 'intent.stats', description: 'Intent hub statistics', category: 'brain', icon: Activity, requiresOperator: false, requiredTier: 'free' },
  { command: 'intent.messages', description: 'Recent messages (all statuses)', category: 'brain', icon: MessageSquare, requiresOperator: false, requiredTier: 'free' },
  { command: 'intent.messages.node', description: 'Messages by source node', category: 'brain', icon: Router, requiresOperator: false, requiredTier: 'free', args: '<node>' },
  { command: 'intent.approve', description: 'Approve a pending message', category: 'brain', icon: CheckCircle, requiresOperator: true, requiredTier: 'architect', args: '<messageId> [note]' },
  { command: 'intent.reject', description: 'Reject a pending message', category: 'brain', icon: XCircle, requiresOperator: true, requiredTier: 'architect', args: '<messageId> <reason>' },
  { command: 'intent.action_required', description: 'Messages needing human action', category: 'brain', icon: AlertTriangle, requiresOperator: false, requiredTier: 'free' },
  { command: 'intent.proposals', description: 'All proposals via INTENT', category: 'brain', icon: FileText, requiresOperator: false, requiredTier: 'free' },
  { command: 'intent.alerts', description: 'All alerts via INTENT', category: 'brain', icon: AlertTriangle, requiresOperator: false, requiredTier: 'free' },
  { command: 'intent.needs', description: 'All node needs/requests', category: 'brain', icon: Sparkles, requiresOperator: false, requiredTier: 'free' },
  { command: 'intent.questions', description: 'Node questions pending reply', category: 'brain', icon: MessageSquare, requiresOperator: false, requiredTier: 'free' },
  { command: 'intent.expired', description: 'Expired/timed-out messages', category: 'brain', icon: Clock, requiresOperator: false, requiredTier: 'free' },
  { command: 'intent.response_time', description: 'Avg human response time', category: 'brain', icon: Clock, requiresOperator: false, requiredTier: 'free' },
  { command: 'intent.by_priority', description: 'Message breakdown by priority', category: 'brain', icon: Layers, requiresOperator: false, requiredTier: 'free' },
  { command: 'intent.by_type', description: 'Message breakdown by type', category: 'brain', icon: Layers, requiresOperator: false, requiredTier: 'free' },
  { command: 'intent.by_node', description: 'Message count per source node', category: 'brain', icon: Users, requiresOperator: false, requiredTier: 'free' },
  { command: 'intent.history', description: 'Full message history', category: 'brain', icon: Database, requiresOperator: false, requiredTier: 'free' },
  { command: 'intent.bridge.engineer', description: 'ENGINEER→INTENT bridge status', category: 'brain', icon: Plug, requiresOperator: false, requiredTier: 'free' },
  { command: 'intent.bridge.health', description: 'Node bridge health overview', category: 'brain', icon: Activity, requiresOperator: false, requiredTier: 'free' },
  { command: 'intent.summary', description: 'Natural language INTENT summary', category: 'brain', icon: FileText, requiresOperator: false, requiredTier: 'free' },
  { command: 'intent.priorities', description: 'Critical items needing attention', category: 'brain', icon: AlertTriangle, requiresOperator: false, requiredTier: 'free' },
  { command: 'intent.feed', description: 'Live node communication feed', category: 'brain', icon: Radio, requiresOperator: false, requiredTier: 'free' },
  { command: 'intent.translate', description: 'Translate technical to human language', category: 'brain', icon: Globe, requiresOperator: false, requiredTier: 'free', args: '<messageId>' },
  { command: 'intent.escalate', description: 'Escalate message priority', category: 'brain', icon: Zap, requiresOperator: true, requiredTier: 'architect', args: '<messageId>' },
];

// ═══ ATLAS Operational Commands ═══
export const ATLAS_OP_COMMANDS: CommandDefinition[] = [
  { command: 'atlas.status', description: 'ATLAS control plane status', category: 'system', icon: Compass, requiresOperator: false, requiredTier: 'free' },
  { command: 'atlas.approvals', description: 'Approval chain log', category: 'system', icon: CheckCircle, requiresOperator: false, requiredTier: 'free' },
  { command: 'atlas.approvals.stats', description: 'Approval/rejection ratio', category: 'system', icon: Gauge, requiresOperator: false, requiredTier: 'free' },
  { command: 'atlas.sessions', description: 'Active ATLAS sessions', category: 'system', icon: Users, requiresOperator: false, requiredTier: 'free' },
  { command: 'atlas.rate_limit', description: 'Command rate limit status', category: 'system', icon: Shield, requiresOperator: false, requiredTier: 'free' },
  { command: 'atlas.policy', description: 'Policy enforcement audits', category: 'system', icon: Shield, requiresOperator: false, requiredTier: 'free' },
  { command: 'atlas.mode', description: 'Governance mode transitions', category: 'system', icon: Settings, requiresOperator: false, requiredTier: 'free' },
  { command: 'atlas.capabilities', description: 'Capability usage ranking', category: 'system', icon: Sparkles, requiresOperator: false, requiredTier: 'free' },
  { command: 'atlas.escalations', description: 'Unresolved escalations', category: 'system', icon: AlertTriangle, requiresOperator: false, requiredTier: 'free' },
  { command: 'atlas.escalations.resolve', description: 'Resolve an escalation', category: 'system', icon: CheckCircle, requiresOperator: true, requiredTier: 'architect', args: '<source>' },
  { command: 'atlas.dry_run', description: 'Dry run success rate', category: 'system', icon: TestTube, requiresOperator: false, requiredTier: 'free' },
  { command: 'atlas.node_comm', description: 'Node communication frequency', category: 'system', icon: Radio, requiresOperator: false, requiredTier: 'free' },
  { command: 'atlas.response_time', description: 'Avg response time', category: 'system', icon: Clock, requiresOperator: false, requiredTier: 'free' },
  { command: 'atlas.threads', description: 'Active conversation threads', category: 'system', icon: MessageSquare, requiresOperator: false, requiredTier: 'free' },
  { command: 'atlas.approval_latency', description: 'Human approval latency', category: 'system', icon: Clock, requiresOperator: false, requiredTier: 'free' },
  { command: 'atlas.expired', description: 'Total expired messages', category: 'system', icon: Clock, requiresOperator: false, requiredTier: 'free' },
  { command: 'atlas.uptime', description: 'ATLAS uptime', category: 'system', icon: Activity, requiresOperator: false, requiredTier: 'free' },
  { command: 'atlas.queue_depth', description: 'Priority queue depth trend', category: 'system', icon: Layers, requiresOperator: false, requiredTier: 'free' },
  { command: 'atlas.satisfaction', description: 'Node satisfaction scores', category: 'system', icon: Sparkles, requiresOperator: false, requiredTier: 'free', args: '<node>' },
  { command: 'atlas.compliance', description: 'Governance compliance score', category: 'system', icon: Shield, requiresOperator: false, requiredTier: 'free' },
  { command: 'atlas.sla', description: 'SLA breach count', category: 'system', icon: AlertTriangle, requiresOperator: false, requiredTier: 'free' },
  { command: 'atlas.decision_quality', description: 'Decision confidence average', category: 'system', icon: Brain, requiresOperator: false, requiredTier: 'free' },
  { command: 'atlas.heatmap', description: 'Node engagement heatmap', category: 'system', icon: Activity, requiresOperator: false, requiredTier: 'free' },
  { command: 'atlas.intent_sync', description: 'Intent integration health', category: 'system', icon: Plug, requiresOperator: false, requiredTier: 'free' },
  { command: 'atlas.hardening', description: 'ATLAS hardening status (Prometheus v2.0)', category: 'system', icon: Shield, requiresOperator: false, requiredTier: 'free' },
  { command: 'atlas.hardening.health', description: 'ATLAS health composite', category: 'system', icon: Activity, requiresOperator: false, requiredTier: 'free' },
];

// ═══ AUDIT Hardening Commands ═══
export const AUDIT_HARDENING_COMMANDS: CommandDefinition[] = [
  { command: 'audit.hardening', description: 'AUDIT hardening status (Ironclad v2.0)', category: 'audit_mod', icon: Shield, requiresOperator: false, requiredTier: 'free' },
  { command: 'audit.hardening.health', description: 'AUDIT health composite', category: 'audit_mod', icon: Activity, requiresOperator: false, requiredTier: 'free' },
  { command: 'audit.hardening.chain', description: 'Chain integrity validation', category: 'audit_mod', icon: Lock, requiresOperator: false, requiredTier: 'free' },
  { command: 'audit.hardening.tamper', description: 'Tamper detection events', category: 'audit_mod', icon: Shield, requiresOperator: false, requiredTier: 'free' },
  { command: 'audit.hardening.retention', description: 'Retention policy config', category: 'audit_mod', icon: Clock, requiresOperator: false, requiredTier: 'free' },
  { command: 'audit.hardening.dedup', description: 'Entry dedup window stats', category: 'audit_mod', icon: Database, requiresOperator: false, requiredTier: 'free' },
  { command: 'audit.hardening.wal', description: 'Write-ahead log tail', category: 'audit_mod', icon: FileText, requiresOperator: false, requiredTier: 'free' },
  { command: 'audit.hardening.compliance', description: 'Compliance report', category: 'audit_mod', icon: CheckCircle, requiresOperator: false, requiredTier: 'free' },
  { command: 'audit.hardening.budget', description: 'Query rate budget', category: 'audit_mod', icon: Gauge, requiresOperator: false, requiredTier: 'free' },
  { command: 'audit.hardening.merkle', description: 'Merkle proof status', category: 'audit_mod', icon: Lock, requiresOperator: false, requiredTier: 'free' },
  { command: 'audit.hardening.attestations', description: 'Cross-zone attestations', category: 'audit_mod', icon: CheckCircle, requiresOperator: false, requiredTier: 'free' },
  { command: 'audit.hardening.compaction', description: 'Compaction engine stats', category: 'audit_mod', icon: Database, requiresOperator: false, requiredTier: 'free' },
  { command: 'audit.hardening.signatures', description: 'Entry signature status', category: 'audit_mod', icon: Lock, requiresOperator: false, requiredTier: 'free' },
  { command: 'audit.hardening.export', description: 'Audit export engine', category: 'audit_mod', icon: Send, requiresOperator: false, requiredTier: 'free' },
  { command: 'audit.hardening.throughput', description: 'Audit throughput monitor', category: 'audit_mod', icon: Gauge, requiresOperator: false, requiredTier: 'free' },
  { command: 'audit.hardening.immutability', description: 'Immutability guard status', category: 'audit_mod', icon: Shield, requiresOperator: false, requiredTier: 'free' },
  { command: 'audit.hardening.alerts', description: 'Audit alert queue', category: 'audit_mod', icon: AlertTriangle, requiresOperator: false, requiredTier: 'free' },
  { command: 'audit.hardening.fork', description: 'Chain fork detection', category: 'audit_mod', icon: GitBranch, requiresOperator: false, requiredTier: 'free' },
  { command: 'audit.hardening.encryption', description: 'Encryption layer status', category: 'audit_mod', icon: Lock, requiresOperator: false, requiredTier: 'free' },
  { command: 'audit.hardening.sla', description: 'Audit SLA monitor', category: 'audit_mod', icon: Activity, requiresOperator: false, requiredTier: 'free' },
  { command: 'audit.hardening.replay_guard', description: 'Replay protection stats', category: 'audit_mod', icon: Shield, requiresOperator: false, requiredTier: 'free' },
  { command: 'audit.hardening.schema', description: 'Audit schema version', category: 'audit_mod', icon: Database, requiresOperator: false, requiredTier: 'free' },
  { command: 'audit.hardening.cold_storage', description: 'Cold storage gateway', category: 'audit_mod', icon: Database, requiresOperator: false, requiredTier: 'free' },
  { command: 'audit.hardening.witnesses', description: 'Witness cosigning policy', category: 'audit_mod', icon: Users, requiresOperator: false, requiredTier: 'free' },
  { command: 'audit.hardening.priority', description: 'Entry priority classifier', category: 'audit_mod', icon: Layers, requiresOperator: false, requiredTier: 'free' },
];

// ═══ RELAY Hardening Commands ═══
export const RELAY_HARDENING_COMMANDS: CommandDefinition[] = [
  { command: 'relay.hardening', description: 'RELAY hardening status (Conduit v2.0)', category: 'relay_mod', icon: Shield, requiresOperator: false, requiredTier: 'free' },
  { command: 'relay.hardening.health', description: 'RELAY health composite', category: 'relay_mod', icon: Activity, requiresOperator: false, requiredTier: 'free' },
  { command: 'relay.hardening.delivery', description: 'Delivery log & stats', category: 'relay_mod', icon: Send, requiresOperator: false, requiredTier: 'free' },
  { command: 'relay.hardening.dlq', description: 'Dead letter queue', category: 'relay_mod', icon: AlertTriangle, requiresOperator: false, requiredTier: 'free' },
  { command: 'relay.hardening.signing', description: 'HMAC signing config', category: 'relay_mod', icon: Lock, requiresOperator: false, requiredTier: 'free' },
  { command: 'relay.hardening.retry', description: 'Retry budget status', category: 'relay_mod', icon: RefreshCw, requiresOperator: false, requiredTier: 'free' },
  { command: 'relay.hardening.targets', description: 'Target health monitor', category: 'relay_mod', icon: Server, requiresOperator: false, requiredTier: 'free' },
  { command: 'relay.hardening.circuits', description: 'Per-target circuit breakers', category: 'relay_mod', icon: Zap, requiresOperator: false, requiredTier: 'free' },
  { command: 'relay.hardening.payload', description: 'Payload size guard', category: 'relay_mod', icon: Shield, requiresOperator: false, requiredTier: 'free' },
  { command: 'relay.hardening.dedup', description: 'Content hash dedup stats', category: 'relay_mod', icon: Database, requiresOperator: false, requiredTier: 'free' },
  { command: 'relay.hardening.rate_limit', description: 'Per-target rate limits', category: 'relay_mod', icon: Gauge, requiresOperator: false, requiredTier: 'free' },
  { command: 'relay.hardening.timeout', description: 'Webhook timeout config', category: 'relay_mod', icon: Clock, requiresOperator: false, requiredTier: 'free' },
  { command: 'relay.hardening.latency', description: 'Delivery latency (P50/P95/P99)', category: 'relay_mod', icon: Activity, requiresOperator: false, requiredTier: 'free' },
  { command: 'relay.hardening.routing', description: 'Outbound routing table', category: 'relay_mod', icon: Router, requiresOperator: false, requiredTier: 'free' },
  { command: 'relay.hardening.tls', description: 'TLS enforcement status', category: 'relay_mod', icon: Lock, requiresOperator: false, requiredTier: 'free' },
  { command: 'relay.hardening.idempotency', description: 'Idempotency key stats', category: 'relay_mod', icon: Key, requiresOperator: false, requiredTier: 'free' },
  { command: 'relay.hardening.versions', description: 'Webhook API versions', category: 'relay_mod', icon: GitBranch, requiresOperator: false, requiredTier: 'free' },
  { command: 'relay.hardening.batch', description: 'Batch dispatch stats', category: 'relay_mod', icon: Layers, requiresOperator: false, requiredTier: 'free' },
  { command: 'relay.hardening.priority', description: 'Priority queue depth', category: 'relay_mod', icon: Layers, requiresOperator: false, requiredTier: 'free' },
  { command: 'relay.hardening.egress', description: 'Egress filtering stats', category: 'relay_mod', icon: Shield, requiresOperator: false, requiredTier: 'free' },
  { command: 'relay.hardening.receipts', description: 'Delivery receipt tracker', category: 'relay_mod', icon: CheckCircle, requiresOperator: false, requiredTier: 'free' },
  { command: 'relay.hardening.replay', description: 'Webhook replay engine', category: 'relay_mod', icon: RefreshCw, requiresOperator: false, requiredTier: 'free' },
  { command: 'relay.hardening.failover', description: 'Provider failover config', category: 'relay_mod', icon: Server, requiresOperator: false, requiredTier: 'free' },
  { command: 'relay.hardening.audit_trail', description: 'Outbound audit trail', category: 'relay_mod', icon: FileCheck, requiresOperator: false, requiredTier: 'free' },
  { command: 'relay.hardening.sla', description: 'RELAY SLA monitor', category: 'relay_mod', icon: Activity, requiresOperator: false, requiredTier: 'free' },
];

// ═══ RIPPLE Hardening Commands ═══
export const RIPPLE_HARDENING_COMMANDS: CommandDefinition[] = [
  { command: 'ripple.hardening', description: 'RIPPLE hardening status (Tsunami v2.0)', category: 'ripple', icon: Shield, requiresOperator: false, requiredTier: 'free' },
  { command: 'ripple.hardening.health', description: 'RIPPLE health composite', category: 'ripple', icon: Activity, requiresOperator: false, requiredTier: 'free' },
  { command: 'ripple.hardening.bloom', description: 'Bloom filter dedup stats', category: 'ripple', icon: Database, requiresOperator: false, requiredTier: 'free' },
  { command: 'ripple.hardening.backpressure', description: 'Backpressure manager state', category: 'ripple', icon: Gauge, requiresOperator: false, requiredTier: 'free' },
  { command: 'ripple.hardening.dlq', description: 'Event dead letter queue', category: 'ripple', icon: AlertTriangle, requiresOperator: false, requiredTier: 'free' },
  { command: 'ripple.hardening.circuits', description: 'Subscriber circuit breakers', category: 'ripple', icon: Zap, requiresOperator: false, requiredTier: 'free' },
  { command: 'ripple.hardening.replay', description: 'Event replay buffer', category: 'ripple', icon: RefreshCw, requiresOperator: false, requiredTier: 'free' },
  { command: 'ripple.hardening.topics', description: 'Topic pattern heatmap', category: 'ripple', icon: Activity, requiresOperator: false, requiredTier: 'free' },
  { command: 'ripple.hardening.priority', description: 'Event priority distribution', category: 'ripple', icon: Layers, requiresOperator: false, requiredTier: 'free' },
  { command: 'ripple.hardening.subscribers', description: 'Subscriber health monitor', category: 'ripple', icon: Users, requiresOperator: false, requiredTier: 'free' },
  { command: 'ripple.hardening.throughput', description: 'Event throughput monitor', category: 'ripple', icon: Gauge, requiresOperator: false, requiredTier: 'free' },
  { command: 'ripple.hardening.validation', description: 'Event schema validation stats', category: 'ripple', icon: CheckCircle, requiresOperator: false, requiredTier: 'free' },
  { command: 'ripple.hardening.leaks', description: 'Subscription leak detector', category: 'ripple', icon: AlertTriangle, requiresOperator: false, requiredTier: 'free' },
  { command: 'ripple.hardening.ttl', description: 'Event TTL config', category: 'ripple', icon: Clock, requiresOperator: false, requiredTier: 'free' },
  { command: 'ripple.hardening.fanout', description: 'Fan-out limiter', category: 'ripple', icon: Radio, requiresOperator: false, requiredTier: 'free' },
  { command: 'ripple.hardening.ordering', description: 'Event ordering guarantor', category: 'ripple', icon: List, requiresOperator: false, requiredTier: 'free' },
  { command: 'ripple.hardening.acl', description: 'Subscription ACL stats', category: 'ripple', icon: Lock, requiresOperator: false, requiredTier: 'free' },
  { command: 'ripple.hardening.enrichment', description: 'Event enrichment pipeline', category: 'ripple', icon: Sparkles, requiresOperator: false, requiredTier: 'free' },
  { command: 'ripple.hardening.partitions', description: 'Partition config', category: 'ripple', icon: Database, requiresOperator: false, requiredTier: 'free' },
  { command: 'ripple.hardening.correlation', description: 'Event correlation groups', category: 'ripple', icon: Workflow, requiresOperator: false, requiredTier: 'free' },
  { command: 'ripple.hardening.poison', description: 'Poison event detector', category: 'ripple', icon: Shield, requiresOperator: false, requiredTier: 'free' },
  { command: 'ripple.hardening.modes', description: 'Push/pull delivery mode stats', category: 'ripple', icon: Activity, requiresOperator: false, requiredTier: 'free' },
  { command: 'ripple.hardening.compression', description: 'Event compression config', category: 'ripple', icon: Database, requiresOperator: false, requiredTier: 'free' },
  { command: 'ripple.hardening.idempotent', description: 'Idempotent delivery stats', category: 'ripple', icon: Key, requiresOperator: false, requiredTier: 'free' },
  { command: 'ripple.hardening.sla', description: 'RIPPLE SLA monitor', category: 'ripple', icon: Activity, requiresOperator: false, requiredTier: 'free' },
];

// ═══ SANDBOX Hardening Commands ═══
export const SANDBOX_HARDENING_COMMANDS: CommandDefinition[] = [
  { command: 'sandbox.hardening', description: 'SANDBOX hardening status (Crucible v2.0)', category: 'sandbox_mod', icon: Shield, requiresOperator: false, requiredTier: 'free' },
  { command: 'sandbox.hardening.health', description: 'SANDBOX health composite', category: 'sandbox_mod', icon: Activity, requiresOperator: false, requiredTier: 'free' },
  { command: 'sandbox.hardening.escapes', description: 'Escape detection stats', category: 'sandbox_mod', icon: Shield, requiresOperator: false, requiredTier: 'free' },
  { command: 'sandbox.hardening.quotas', description: 'Resource quota config', category: 'sandbox_mod', icon: Gauge, requiresOperator: false, requiredTier: 'free' },
  { command: 'sandbox.hardening.lifecycle', description: 'Sandbox lifecycle states', category: 'sandbox_mod', icon: GitBranch, requiresOperator: false, requiredTier: 'free' },
  { command: 'sandbox.hardening.timeouts', description: 'Timeout enforcement stats', category: 'sandbox_mod', icon: Clock, requiresOperator: false, requiredTier: 'free' },
  { command: 'sandbox.hardening.memory', description: 'Memory isolation guard', category: 'sandbox_mod', icon: Database, requiresOperator: false, requiredTier: 'free' },
  { command: 'sandbox.hardening.injection', description: 'Code injection prevention', category: 'sandbox_mod', icon: Shield, requiresOperator: false, requiredTier: 'free' },
  { command: 'sandbox.hardening.audit', description: 'Execution audit trail', category: 'sandbox_mod', icon: FileCheck, requiresOperator: false, requiredTier: 'free' },
  { command: 'sandbox.hardening.pool', description: 'Sandbox pool manager', category: 'sandbox_mod', icon: Server, requiresOperator: false, requiredTier: 'free' },
  { command: 'sandbox.hardening.snapshots', description: 'Snapshot integrity validator', category: 'sandbox_mod', icon: Database, requiresOperator: false, requiredTier: 'free' },
  { command: 'sandbox.hardening.contamination', description: 'Cross-sandbox contamination guard', category: 'sandbox_mod', icon: Shield, requiresOperator: false, requiredTier: 'free' },
  { command: 'sandbox.hardening.ttl', description: 'TTL enforcement stats', category: 'sandbox_mod', icon: Clock, requiresOperator: false, requiredTier: 'free' },
  { command: 'sandbox.hardening.rate_limit', description: 'Execution rate limiter', category: 'sandbox_mod', icon: Gauge, requiresOperator: false, requiredTier: 'free' },
  { command: 'sandbox.hardening.output', description: 'Output sanitizer stats', category: 'sandbox_mod', icon: Shield, requiresOperator: false, requiredTier: 'free' },
  { command: 'sandbox.hardening.replay', description: 'Deterministic replay buffer', category: 'sandbox_mod', icon: RefreshCw, requiresOperator: false, requiredTier: 'free' },
  { command: 'sandbox.hardening.seal', description: 'Hermetic seal verification', category: 'sandbox_mod', icon: Lock, requiresOperator: false, requiredTier: 'free' },
  { command: 'sandbox.hardening.cost', description: 'Execution cost estimator', category: 'sandbox_mod', icon: CreditCard, requiresOperator: false, requiredTier: 'free' },
  { command: 'sandbox.hardening.parallel', description: 'Parallel execution limiter', category: 'sandbox_mod', icon: Layers, requiresOperator: false, requiredTier: 'free' },
  { command: 'sandbox.hardening.env', description: 'Environment variable guard', category: 'sandbox_mod', icon: Key, requiresOperator: false, requiredTier: 'free' },
  { command: 'sandbox.hardening.network', description: 'Network isolation enforcer', category: 'sandbox_mod', icon: Globe, requiresOperator: false, requiredTier: 'free' },
  { command: 'sandbox.hardening.results', description: 'Result validation gate', category: 'sandbox_mod', icon: CheckCircle, requiresOperator: false, requiredTier: 'free' },
  { command: 'sandbox.hardening.telemetry', description: 'Sandbox telemetry summary', category: 'sandbox_mod', icon: Activity, requiresOperator: false, requiredTier: 'free' },
  { command: 'sandbox.hardening.reaper', description: 'Dead sandbox reaper stats', category: 'sandbox_mod', icon: XCircle, requiresOperator: false, requiredTier: 'free' },
  { command: 'sandbox.hardening.warmup', description: 'Sandbox warmup preloader', category: 'sandbox_mod', icon: Zap, requiresOperator: false, requiredTier: 'free' },
];

// ═══ INCLUSIVE Hardening Commands ═══
export const INCLUSIVE_HARDENING_COMMANDS: CommandDefinition[] = [
  { command: 'inclusive.hardening', description: 'INCLUSIVE hardening status (Clarity v2.0)', category: 'inclusive', icon: Shield, requiresOperator: false, requiredTier: 'free' },
  { command: 'inclusive.hardening.health', description: 'INCLUSIVE health composite', category: 'inclusive', icon: Activity, requiresOperator: false, requiredTier: 'free' },
  { command: 'inclusive.hardening.compliance', description: 'WCAG compliance trend', category: 'inclusive', icon: CheckCircle, requiresOperator: false, requiredTier: 'free' },
  { command: 'inclusive.hardening.repairs', description: 'Auto-repair success rate', category: 'inclusive', icon: RefreshCw, requiresOperator: false, requiredTier: 'free' },
  { command: 'inclusive.hardening.regressions', description: 'Regression detection history', category: 'inclusive', icon: AlertTriangle, requiresOperator: false, requiredTier: 'free' },
  { command: 'inclusive.hardening.severity', description: 'Severity distribution tracker', category: 'inclusive', icon: Gauge, requiresOperator: false, requiredTier: 'free' },
  { command: 'inclusive.hardening.throughput', description: 'Scan throughput monitor', category: 'inclusive', icon: Activity, requiresOperator: false, requiredTier: 'free' },
  { command: 'inclusive.hardening.templates', description: 'Template coverage tracker', category: 'inclusive', icon: FileCheck, requiresOperator: false, requiredTier: 'free' },
  { command: 'inclusive.hardening.criteria', description: 'Top violated WCAG criteria', category: 'inclusive', icon: FileText, requiresOperator: false, requiredTier: 'free' },
  { command: 'inclusive.hardening.depth', description: 'Scan depth distribution', category: 'inclusive', icon: Layers, requiresOperator: false, requiredTier: 'free' },
  { command: 'inclusive.hardening.gates', description: 'Compliance gate results', category: 'inclusive', icon: Shield, requiresOperator: false, requiredTier: 'free' },
  { command: 'inclusive.hardening.escalations', description: 'DEFENSE escalation tracker', category: 'inclusive', icon: AlertTriangle, requiresOperator: false, requiredTier: 'free' },
  { command: 'inclusive.hardening.proposals', description: 'Modernizer proposal tracker', category: 'inclusive', icon: FileText, requiresOperator: false, requiredTier: 'free' },
  { command: 'inclusive.hardening.score_history', description: 'Accessibility score history', category: 'inclusive', icon: Activity, requiresOperator: false, requiredTier: 'free' },
  { command: 'inclusive.hardening.autofix', description: 'Auto-fix queue status', category: 'inclusive', icon: Wand2, requiresOperator: false, requiredTier: 'free' },
  { command: 'inclusive.hardening.contrast', description: 'Color contrast analyzer', category: 'inclusive', icon: Eye, requiresOperator: false, requiredTier: 'free' },
  { command: 'inclusive.hardening.keyboard', description: 'Keyboard navigation auditor', category: 'inclusive', icon: Cpu, requiresOperator: false, requiredTier: 'free' },
  { command: 'inclusive.hardening.screenreader', description: 'Screen reader compatibility', category: 'inclusive', icon: Eye, requiresOperator: false, requiredTier: 'free' },
  { command: 'inclusive.hardening.focus', description: 'Focus management auditor', category: 'inclusive', icon: Eye, requiresOperator: false, requiredTier: 'free' },
  { command: 'inclusive.hardening.motion', description: 'Reduced motion compliance', category: 'inclusive', icon: Activity, requiresOperator: false, requiredTier: 'free' },
  { command: 'inclusive.hardening.lang', description: 'Language & localization auditor', category: 'inclusive', icon: Globe, requiresOperator: false, requiredTier: 'free' },
  { command: 'inclusive.hardening.forms', description: 'Form accessibility checker', category: 'inclusive', icon: FileEdit, requiresOperator: false, requiredTier: 'free' },
  { command: 'inclusive.hardening.selfscan', description: 'Self-scan pipeline stats', category: 'inclusive', icon: RefreshCw, requiresOperator: false, requiredTier: 'free' },
  { command: 'inclusive.hardening.publish', description: 'Marketplace publish gate', category: 'inclusive', icon: Shield, requiresOperator: false, requiredTier: 'free' },
  { command: 'inclusive.hardening.telemetry', description: 'INCLUSIVE telemetry summary', category: 'inclusive', icon: Activity, requiresOperator: false, requiredTier: 'free' },
];

// ═══ ESZ — Expansion Sovereignty Zone Commands ═══
export const SOVEREIGN_COMMANDS: CommandDefinition[] = [
  { command: 'sovereign.status', description: 'Jurisdiction classifier status', category: 'sovereign', icon: Globe, requiresOperator: false, requiredTier: 'free' },
  { command: 'sovereign.jurisdictions', description: 'Active jurisdiction map', category: 'sovereign', icon: Globe, requiresOperator: false, requiredTier: 'free' },
  { command: 'sovereign.compliance', description: 'Data sovereignty compliance', category: 'sovereign', icon: Shield, requiresOperator: false, requiredTier: 'free' },
  { command: 'sovereign.classify', description: 'Classify data by jurisdiction', category: 'sovereign', icon: Layers, requiresOperator: true, requiredTier: 'studio', args: '<data_ref>' },
  { command: 'sovereign.residency', description: 'Data residency report', category: 'sovereign', icon: Database, requiresOperator: false, requiredTier: 'free' },
  { command: 'sovereign.transfer', description: 'Cross-border transfer audit', category: 'sovereign', icon: Send, requiresOperator: true, requiredTier: 'architect' },
  { command: 'sovereign.policies', description: 'Active sovereignty policies', category: 'sovereign', icon: FileText, requiresOperator: false, requiredTier: 'free' },
  { command: 'sovereign.violations', description: 'Policy violation log', category: 'sovereign', icon: AlertTriangle, requiresOperator: false, requiredTier: 'free' },
];

export const ORACLE_COMMANDS: CommandDefinition[] = [
  { command: 'oracle.status', description: 'Predictive engine status', category: 'oracle', icon: Eye, requiresOperator: false, requiredTier: 'free' },
  { command: 'oracle.predict', description: 'Generate prediction', category: 'oracle', icon: Sparkles, requiresOperator: true, requiredTier: 'studio', args: '<signal> [horizon]' },
  { command: 'oracle.forecasts', description: 'Active forecast registry', category: 'oracle', icon: Activity, requiresOperator: false, requiredTier: 'free' },
  { command: 'oracle.accuracy', description: 'Prediction accuracy tracker', category: 'oracle', icon: Gauge, requiresOperator: false, requiredTier: 'free' },
  { command: 'oracle.bayesian', description: 'Bayesian optimizer status', category: 'oracle', icon: Brain, requiresOperator: false, requiredTier: 'free' },
  { command: 'oracle.anomalies', description: 'Predicted anomaly alerts', category: 'oracle', icon: AlertTriangle, requiresOperator: false, requiredTier: 'free' },
  { command: 'oracle.confidence', description: 'Confidence interval map', category: 'oracle', icon: Layers, requiresOperator: false, requiredTier: 'free' },
  { command: 'oracle.retrain', description: 'Retrain prediction model', category: 'oracle', icon: RefreshCw, requiresOperator: true, requiredTier: 'architect' },
];

export const CONSCIENCE_COMMANDS: CommandDefinition[] = [
  { command: 'conscience.status', description: 'Ethical framework status', category: 'conscience', icon: Shield, requiresOperator: false, requiredTier: 'free' },
  { command: 'conscience.evaluate', description: 'Ethical evaluation of action', category: 'conscience', icon: Brain, requiresOperator: true, requiredTier: 'studio', args: '<action_ref>' },
  { command: 'conscience.bias', description: 'Bias detection scanner', category: 'conscience', icon: Eye, requiresOperator: false, requiredTier: 'free' },
  { command: 'conscience.fairness', description: 'Fairness metrics dashboard', category: 'conscience', icon: Activity, requiresOperator: false, requiredTier: 'free' },
  { command: 'conscience.audit', description: 'Ethics audit trail', category: 'conscience', icon: ClipboardCheck, requiresOperator: false, requiredTier: 'free' },
  { command: 'conscience.framework', description: 'Active ethical framework', category: 'conscience', icon: Layers, requiresOperator: false, requiredTier: 'free' },
  { command: 'conscience.overrides', description: 'Override log', category: 'conscience', icon: AlertTriangle, requiresOperator: false, requiredTier: 'free' },
  { command: 'conscience.score', description: 'Composite ethics score', category: 'conscience', icon: Gauge, requiresOperator: false, requiredTier: 'free' },
];

export const TREATY_COMMANDS: CommandDefinition[] = [
  { command: 'treaty.status', description: 'Contract engine status', category: 'treaty', icon: FileText, requiresOperator: false, requiredTier: 'free' },
  { command: 'treaty.contracts', description: 'Active contracts registry', category: 'treaty', icon: FileText, requiresOperator: false, requiredTier: 'free' },
  { command: 'treaty.validate', description: 'Validate contract terms', category: 'treaty', icon: CheckCircle, requiresOperator: true, requiredTier: 'studio', args: '<contract_id>' },
  { command: 'treaty.sla', description: 'SLA compliance monitor', category: 'treaty', icon: Gauge, requiresOperator: false, requiredTier: 'free' },
  { command: 'treaty.breaches', description: 'Contract breach log', category: 'treaty', icon: AlertTriangle, requiresOperator: false, requiredTier: 'free' },
  { command: 'treaty.negotiate', description: 'Initiate contract negotiation', category: 'treaty', icon: Sparkles, requiresOperator: true, requiredTier: 'architect' },
  { command: 'treaty.templates', description: 'Contract templates', category: 'treaty', icon: FileText, requiresOperator: false, requiredTier: 'free' },
];

// ═══ EPZ — Expansion Perception Zone Commands ═══
export const COMPASS_COMMANDS: CommandDefinition[] = [
  { command: 'compass.status', description: 'Strategic compass status', category: 'compass', icon: Compass, requiresOperator: false, requiredTier: 'free' },
  { command: 'compass.bearing', description: 'Current strategic bearing', category: 'compass', icon: Compass, requiresOperator: false, requiredTier: 'free' },
  { command: 'compass.waypoints', description: 'Active waypoint registry', category: 'compass', icon: Compass, requiresOperator: false, requiredTier: 'free' },
  { command: 'compass.drift', description: 'Strategic drift detector', category: 'compass', icon: AlertTriangle, requiresOperator: false, requiredTier: 'free' },
  { command: 'compass.calibrate', description: 'Recalibrate compass', category: 'compass', icon: RefreshCw, requiresOperator: true, requiredTier: 'studio' },
  { command: 'compass.horizon', description: 'Horizon scanning results', category: 'compass', icon: Eye, requiresOperator: false, requiredTier: 'free' },
  { command: 'compass.alignment', description: 'Goal alignment score', category: 'compass', icon: Gauge, requiresOperator: false, requiredTier: 'free' },
];

export const ECHO_COMMANDS: CommandDefinition[] = [
  { command: 'echo.status', description: 'Simulation engine status', category: 'echo', icon: Radio, requiresOperator: false, requiredTier: 'free' },
  { command: 'echo.simulate', description: 'Run what-if simulation', category: 'echo', icon: TestTube, requiresOperator: true, requiredTier: 'studio', args: '<scenario>' },
  { command: 'echo.results', description: 'Simulation result history', category: 'echo', icon: Activity, requiresOperator: false, requiredTier: 'free' },
  { command: 'echo.replay', description: 'Replay historical scenario', category: 'echo', icon: RefreshCw, requiresOperator: true, requiredTier: 'studio', args: '<scenario_id>' },
  { command: 'echo.divergence', description: 'Timeline divergence analysis', category: 'echo', icon: GitBranch, requiresOperator: false, requiredTier: 'free' },
  { command: 'echo.sandbox', description: 'Simulation sandbox status', category: 'echo', icon: Box, requiresOperator: false, requiredTier: 'free' },
  { command: 'echo.confidence', description: 'Simulation confidence map', category: 'echo', icon: Gauge, requiresOperator: false, requiredTier: 'free' },
];

export const REFLEX_COMMANDS: CommandDefinition[] = [
  { command: 'reflex.status', description: 'Edge compute status', category: 'reflex', icon: Zap, requiresOperator: false, requiredTier: 'free' },
  { command: 'reflex.latency', description: 'Edge latency map', category: 'reflex', icon: Activity, requiresOperator: false, requiredTier: 'free' },
  { command: 'reflex.nodes', description: 'Active edge nodes', category: 'reflex', icon: Server, requiresOperator: false, requiredTier: 'free' },
  { command: 'reflex.cache', description: 'Edge cache stats', category: 'reflex', icon: Database, requiresOperator: false, requiredTier: 'free' },
  { command: 'reflex.deploy', description: 'Deploy edge function', category: 'reflex', icon: Zap, requiresOperator: true, requiredTier: 'architect', args: '<function_id>' },
  { command: 'reflex.throughput', description: 'Edge throughput monitor', category: 'reflex', icon: Gauge, requiresOperator: false, requiredTier: 'free' },
  { command: 'reflex.failover', description: 'Edge failover config', category: 'reflex', icon: Shield, requiresOperator: false, requiredTier: 'free' },
];

// ═══ EMZ — Expansion Manufacturing Zone Commands ═══
export const FORGE_COMMANDS: CommandDefinition[] = [
  { command: 'forge.status', description: 'Asset forge status', category: 'forge', icon: Cpu, requiresOperator: false, requiredTier: 'free' },
  { command: 'forge.templates', description: 'Template registry', category: 'forge', icon: FileText, requiresOperator: false, requiredTier: 'free' },
  { command: 'forge.generate', description: 'Generate asset from template', category: 'forge', icon: Sparkles, requiresOperator: true, requiredTier: 'studio', args: '<template_id>' },
  { command: 'forge.queue', description: 'Generation queue', category: 'forge', icon: Layers, requiresOperator: false, requiredTier: 'free' },
  { command: 'forge.quality', description: 'Output quality metrics', category: 'forge', icon: Gauge, requiresOperator: false, requiredTier: 'free' },
  { command: 'forge.pipeline', description: 'Manufacturing pipeline', category: 'forge', icon: GitBranch, requiresOperator: false, requiredTier: 'free' },
  { command: 'forge.artifacts', description: 'Generated artifact log', category: 'forge', icon: Database, requiresOperator: false, requiredTier: 'free' },
];

export const LINGUA_COMMANDS: CommandDefinition[] = [
  { command: 'lingua.status', description: 'Translation engine status', category: 'lingua', icon: Globe, requiresOperator: false, requiredTier: 'free' },
  { command: 'lingua.translate', description: 'Translate content', category: 'lingua', icon: Globe, requiresOperator: true, requiredTier: 'creator', args: '<text> <target_lang>' },
  { command: 'lingua.languages', description: 'Supported languages', category: 'lingua', icon: Globe, requiresOperator: false, requiredTier: 'free' },
  { command: 'lingua.glossary', description: 'Domain glossary', category: 'lingua', icon: FileText, requiresOperator: false, requiredTier: 'free' },
  { command: 'lingua.quality', description: 'Translation quality score', category: 'lingua', icon: Gauge, requiresOperator: false, requiredTier: 'free' },
  { command: 'lingua.localize', description: 'Full localization run', category: 'lingua', icon: Globe, requiresOperator: true, requiredTier: 'studio', args: '<locale>' },
];

export const PHANTOM_COMMANDS: CommandDefinition[] = [
  { command: 'phantom.status', description: 'Privacy engine status', category: 'phantom', icon: Shield, requiresOperator: false, requiredTier: 'free' },
  { command: 'phantom.anonymize', description: 'Anonymize dataset', category: 'phantom', icon: Shield, requiresOperator: true, requiredTier: 'studio', args: '<dataset_ref>' },
  { command: 'phantom.pii', description: 'PII detection scan', category: 'phantom', icon: Eye, requiresOperator: false, requiredTier: 'free' },
  { command: 'phantom.mask', description: 'Data masking rules', category: 'phantom', icon: Shield, requiresOperator: false, requiredTier: 'free' },
  { command: 'phantom.retention', description: 'Data retention policy', category: 'phantom', icon: Clock, requiresOperator: false, requiredTier: 'free' },
  { command: 'phantom.purge', description: 'Execute data purge', category: 'phantom', icon: AlertTriangle, requiresOperator: true, requiredTier: 'architect', args: '<scope>' },
  { command: 'phantom.audit', description: 'Privacy audit trail', category: 'phantom', icon: ClipboardCheck, requiresOperator: false, requiredTier: 'free' },
];

export const HARVEST_COMMANDS: CommandDefinition[] = [
  { command: 'harvest.status', description: 'Data pipeline status', category: 'harvest', icon: Database, requiresOperator: false, requiredTier: 'free' },
  { command: 'harvest.pipelines', description: 'Active data pipelines', category: 'harvest', icon: GitBranch, requiresOperator: false, requiredTier: 'free' },
  { command: 'harvest.ingest', description: 'Ingest data source', category: 'harvest', icon: Database, requiresOperator: true, requiredTier: 'studio', args: '<source_ref>' },
  { command: 'harvest.transform', description: 'Transformation rules', category: 'harvest', icon: Sparkles, requiresOperator: false, requiredTier: 'free' },
  { command: 'harvest.quality', description: 'Data quality score', category: 'harvest', icon: Gauge, requiresOperator: false, requiredTier: 'free' },
  { command: 'harvest.throughput', description: 'Pipeline throughput', category: 'harvest', icon: Activity, requiresOperator: false, requiredTier: 'free' },
  { command: 'harvest.errors', description: 'Pipeline error log', category: 'harvest', icon: AlertTriangle, requiresOperator: false, requiredTier: 'free' },
];

// ═══ MEDIC & NERVE Commands ═══
export const MEDIC_COMMANDS: CommandDefinition[] = [
  { command: 'medic.status', description: 'Autonomous diagnostics status', category: 'medic', icon: Activity, requiresOperator: false, requiredTier: 'free' },
  { command: 'medic.diagnose', description: 'Run diagnostic cycle', category: 'medic', icon: Activity, requiresOperator: true, requiredTier: 'creator' },
  { command: 'medic.health_map', description: 'Module health heatmap', category: 'medic', icon: Activity, requiresOperator: false, requiredTier: 'free' },
  { command: 'medic.prescribe', description: 'Generate healing prescription', category: 'medic', icon: Sparkles, requiresOperator: true, requiredTier: 'studio' },
  { command: 'medic.repair_log', description: 'Self-repair history', category: 'medic', icon: FileText, requiresOperator: false, requiredTier: 'free' },
  { command: 'medic.triage', description: 'Issue triage queue', category: 'medic', icon: Layers, requiresOperator: false, requiredTier: 'free' },
  { command: 'medic.quarantine', description: 'Quarantined modules', category: 'medic', icon: Shield, requiresOperator: false, requiredTier: 'free' },
];

export const NERVE_COMMANDS: CommandDefinition[] = [
  { command: 'nerve.status', description: 'Inter-node signaling status', category: 'nerve', icon: Zap, requiresOperator: false, requiredTier: 'free' },
  { command: 'nerve.topology', description: 'Signal topology map', category: 'nerve', icon: Network, requiresOperator: false, requiredTier: 'free' },
  { command: 'nerve.latency', description: 'Signal latency matrix', category: 'nerve', icon: Activity, requiresOperator: false, requiredTier: 'free' },
  { command: 'nerve.consensus', description: 'Consensus repair status', category: 'nerve', icon: CheckCircle, requiresOperator: false, requiredTier: 'free' },
  { command: 'nerve.heartbeat', description: 'Distributed heartbeat log', category: 'nerve', icon: Activity, requiresOperator: false, requiredTier: 'free' },
  { command: 'nerve.partitions', description: 'Network partition detector', category: 'nerve', icon: AlertTriangle, requiresOperator: false, requiredTier: 'free' },
  { command: 'nerve.broadcast', description: 'Broadcast signal to all nodes', category: 'nerve', icon: Radio, requiresOperator: true, requiredTier: 'architect', args: '<signal>' },
];

// ═══ Mesh Overlay Commands (EVOLUTION, IMMUNITY, GOVERNANCE) ═══
export const EVOLUTION_COMMANDS: CommandDefinition[] = [
  { command: 'evolution.status', description: 'Mutation pipeline status', category: 'evolution', icon: Sparkles, requiresOperator: false, requiredTier: 'free' },
  { command: 'evolution.proposals', description: 'Pending mutation proposals', category: 'evolution', icon: FileText, requiresOperator: false, requiredTier: 'free' },
  { command: 'evolution.shadow', description: 'Shadow run results', category: 'evolution', icon: Eye, requiresOperator: false, requiredTier: 'free' },
  { command: 'evolution.promote', description: 'Promote mutation to production', category: 'evolution', icon: Zap, requiresOperator: true, requiredTier: 'architect', args: '<mutation_id>' },
  { command: 'evolution.rollback', description: 'Rollback last mutation', category: 'evolution', icon: RefreshCw, requiresOperator: true, requiredTier: 'architect' },
  { command: 'evolution.fitness', description: 'Fitness function scores', category: 'evolution', icon: Gauge, requiresOperator: false, requiredTier: 'free' },
  { command: 'evolution.generations', description: 'Generation history', category: 'evolution', icon: GitBranch, requiresOperator: false, requiredTier: 'free' },
];

export const IMMUNITY_COMMANDS: CommandDefinition[] = [
  { command: 'immunity.status', description: 'Self-healing mesh status', category: 'immunity', icon: Shield, requiresOperator: false, requiredTier: 'free' },
  { command: 'immunity.threats', description: 'Threat correlation map', category: 'immunity', icon: AlertTriangle, requiresOperator: false, requiredTier: 'free' },
  { command: 'immunity.antibodies', description: 'Active defense patterns', category: 'immunity', icon: Shield, requiresOperator: false, requiredTier: 'free' },
  { command: 'immunity.inoculate', description: 'Inoculate against known threat', category: 'immunity', icon: Shield, requiresOperator: true, requiredTier: 'studio', args: '<threat_sig>' },
  { command: 'immunity.gates', description: 'Capability gate status', category: 'immunity', icon: Lock, requiresOperator: false, requiredTier: 'free' },
  { command: 'immunity.heal', description: 'Trigger self-healing cycle', category: 'immunity', icon: RefreshCw, requiresOperator: true, requiredTier: 'architect' },
  { command: 'immunity.history', description: 'Immune response log', category: 'immunity', icon: FileText, requiresOperator: false, requiredTier: 'free' },
];

export const GOVERNANCE_COMMANDS: CommandDefinition[] = [
  { command: 'governance.status', description: 'Policy enforcement status', category: 'governance', icon: Globe, requiresOperator: false, requiredTier: 'free' },
  { command: 'governance.policies', description: 'Active policy registry', category: 'governance', icon: FileText, requiresOperator: false, requiredTier: 'free' },
  { command: 'governance.veto', description: 'Veto authority log', category: 'governance', icon: XCircle, requiresOperator: false, requiredTier: 'free' },
  { command: 'governance.drift', description: 'Policy drift detector', category: 'governance', icon: AlertTriangle, requiresOperator: false, requiredTier: 'free' },
  { command: 'governance.compliance', description: 'Compliance audit report', category: 'governance', icon: CheckCircle, requiresOperator: false, requiredTier: 'free' },
  { command: 'governance.override', description: 'Policy override (governor)', category: 'governance', icon: Lock, requiresOperator: true, requiredTier: 'governor', args: '<policy_id>' },
  { command: 'governance.self_audit', description: 'Self-referential audit', category: 'governance', icon: Eye, requiresOperator: false, requiredTier: 'free' },
];

// ═══════════════════════════════════════════════════════════════════════════════
// GOV — Governance shorthand commands (gov.* handlers)
// ═══════════════════════════════════════════════════════════════════════════════

export const GOV_COMMANDS: CommandDefinition[] = [
  { command: 'gov.mode', description: 'Current governance mode & subsystem states', category: 'governance', icon: Globe, requiresOperator: false, requiredTier: 'free' },
  { command: 'gov.vetoes', description: 'Active vetoes with authority & scope', category: 'governance', icon: XCircle, requiresOperator: false, requiredTier: 'free' },
  { command: 'gov.compliance', description: 'Run compliance audit', category: 'governance', icon: CheckCircle, requiresOperator: false, requiredTier: 'free' },
  { command: 'gov.drift', description: 'Governance drift analysis', category: 'governance', icon: AlertTriangle, requiresOperator: false, requiredTier: 'free' },
  { command: 'gov.transitions', description: 'Available mode transitions & quorum', category: 'governance', icon: Workflow, requiresOperator: false, requiredTier: 'free' },
  { command: 'gov.help', description: 'Governance command reference', category: 'governance', icon: BookOpen, requiresOperator: false, requiredTier: 'free' },
];

// ═══════════════════════════════════════════════════════════════════════════════
// OBS — Observability commands (obs.* handlers)
// ═══════════════════════════════════════════════════════════════════════════════

export const OBS_COMMANDS: CommandDefinition[] = [
  { command: 'obs.summary', description: 'Full observability overview', category: 'observability', icon: Eye, requiresOperator: false, requiredTier: 'free' },
  { command: 'obs.bridges', description: 'Bridge activity & message flow', category: 'observability', icon: Network, requiresOperator: false, requiredTier: 'free' },
  { command: 'obs.latency', description: 'Cross-node latency metrics', category: 'observability', icon: Gauge, requiresOperator: false, requiredTier: 'free' },
  { command: 'obs.hotspots', description: 'Error hotspot detection', category: 'observability', icon: AlertTriangle, requiresOperator: false, requiredTier: 'free' },
  { command: 'obs.telemetry', description: 'Telemetry engine state', category: 'observability', icon: Activity, requiresOperator: false, requiredTier: 'free' },
  { command: 'obs.telemetry.errors', description: 'Recent error log', category: 'observability', icon: XCircle, requiresOperator: false, requiredTier: 'free' },
  { command: 'obs.telemetry.gov', description: 'Governance events log', category: 'observability', icon: Globe, requiresOperator: false, requiredTier: 'free' },
  { command: 'obs.dlq', description: 'Dead letter queue status', category: 'observability', icon: Inbox, requiresOperator: false, requiredTier: 'free' },
  { command: 'obs.health', description: 'Composite health score', category: 'observability', icon: Activity, requiresOperator: false, requiredTier: 'free' },
  { command: 'obs.help', description: 'Observability command reference', category: 'observability', icon: BookOpen, requiresOperator: false, requiredTier: 'free' },
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
  ...CORTEX_COMMANDS,
  ...INCLUSIVE_COMMANDS,
  ...CLM_COMMANDS,
  ...SEBA_COMMANDS,
  ...CORE_COMMANDS,
  ...RIPPLE_COMMANDS,
  ...ACCESS_COMMANDS,
  ...INTEGRATION_COMMANDS,
  ...AUTOBLOG_COMMANDS,
  ...ENCODED_COMMANDS,
  ...ENGINE_COMMANDS,
  ...META_COMMANDS,
  ...INFRA_COMMANDS,
  ...PATCH_COMMANDS,
  ...MEMORY_MOD_COMMANDS,
  ...RELAY_MOD_COMMANDS,
  ...AUDIT_MOD_COMMANDS,
  ...IDENTITY_MOD_COMMANDS,
  ...ECONOMY_MOD_COMMANDS,
  ...SANDBOX_MOD_COMMANDS,
  ...ENCODE_MOD_COMMANDS,
  ...HARDENING_COMMANDS,
  ...ENGINEER_OP_COMMANDS,
  ...INTENT_OP_COMMANDS,
  ...ATLAS_OP_COMMANDS,
  ...AUDIT_HARDENING_COMMANDS,
  ...RELAY_HARDENING_COMMANDS,
  ...RIPPLE_HARDENING_COMMANDS,
  ...SANDBOX_HARDENING_COMMANDS,
  ...INCLUSIVE_HARDENING_COMMANDS,
  // Expansion Zones
  ...SOVEREIGN_COMMANDS,
  ...ORACLE_COMMANDS,
  ...CONSCIENCE_COMMANDS,
  ...TREATY_COMMANDS,
  ...COMPASS_COMMANDS,
  ...ECHO_COMMANDS,
  ...REFLEX_COMMANDS,
  ...FORGE_COMMANDS,
  ...LINGUA_COMMANDS,
  ...PHANTOM_COMMANDS,
  ...HARVEST_COMMANDS,
  // Infrastructure
  ...MEDIC_COMMANDS,
  ...NERVE_COMMANDS,
  // Mesh Overlays
  ...EVOLUTION_COMMANDS,
  ...IMMUNITY_COMMANDS,
  ...GOVERNANCE_COMMANDS,
  // Shorthand command sets
  ...GOV_COMMANDS,
  ...OBS_COMMANDS,
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
  cortex: { label: 'CORTEX', color: 'text-violet-400', borderColor: 'border-violet-500/30', commands: CORTEX_COMMANDS },
  inclusive: { label: 'INCLUSIVE', color: 'text-teal-400', borderColor: 'border-teal-500/30', commands: INCLUSIVE_COMMANDS },
  system: { label: 'SYSTEM', color: 'text-gray-400', borderColor: 'border-gray-500/30', commands: SYSTEM_COMMANDS },
  modernizer: { label: 'MODERNIZER', color: 'text-pink-400', borderColor: 'border-pink-500/30', commands: MODERNIZER_COMMANDS },
  seba: { label: 'SEBA', color: 'text-emerald-400', borderColor: 'border-emerald-500/30', commands: SEBA_COMMANDS },
  clm: { label: 'CLM', color: 'text-indigo-400', borderColor: 'border-indigo-500/30', commands: [...CLM_COMMANDS, ...MODULE_CLM_COMMANDS] },
  autoblog: { label: 'AUTOBLOG', color: 'text-rose-400', borderColor: 'border-rose-500/30', commands: AUTOBLOG_COMMANDS },
  engine: { label: 'ENGINE', color: 'text-cyan-400', borderColor: 'border-cyan-500/30', commands: ENGINE_COMMANDS },
  meta: { label: 'META', color: 'text-gray-400', borderColor: 'border-gray-500/30', commands: META_COMMANDS },
  infra: { label: 'INFRA', color: 'text-lime-400', borderColor: 'border-lime-500/30', commands: INFRA_COMMANDS },
  memory_mod: { label: 'MEMORY', color: 'text-sky-400', borderColor: 'border-sky-500/30', commands: MEMORY_MOD_COMMANDS },
  relay_mod: { label: 'RELAY', color: 'text-lime-400', borderColor: 'border-lime-500/30', commands: RELAY_MOD_COMMANDS },
  audit_mod: { label: 'AUDIT', color: 'text-stone-400', borderColor: 'border-stone-500/30', commands: AUDIT_MOD_COMMANDS },
  identity_mod: { label: 'IDENTITY', color: 'text-rose-400', borderColor: 'border-rose-500/30', commands: IDENTITY_MOD_COMMANDS },
  economy_mod: { label: 'ECONOMY', color: 'text-amber-400', borderColor: 'border-amber-500/30', commands: ECONOMY_MOD_COMMANDS },
  sandbox_mod: { label: 'SANDBOX', color: 'text-emerald-400', borderColor: 'border-emerald-500/30', commands: SANDBOX_MOD_COMMANDS },
  hardening: { label: 'HARDENING', color: 'text-emerald-300', borderColor: 'border-emerald-400/30', commands: HARDENING_COMMANDS },
  engineer_op: { label: 'ENGINEER', color: 'text-orange-300', borderColor: 'border-orange-400/30', commands: ENGINEER_OP_COMMANDS },
  intent_hub: { label: 'INTENT HUB', color: 'text-cyan-300', borderColor: 'border-cyan-400/30', commands: INTENT_OP_COMMANDS },
  atlas_op: { label: 'ATLAS', color: 'text-purple-300', borderColor: 'border-purple-400/30', commands: ATLAS_OP_COMMANDS },
  audit_hardening: { label: 'AUDIT HARDENING', color: 'text-stone-300', borderColor: 'border-stone-400/30', commands: AUDIT_HARDENING_COMMANDS },
  relay_hardening: { label: 'RELAY HARDENING', color: 'text-lime-300', borderColor: 'border-lime-400/30', commands: RELAY_HARDENING_COMMANDS },
  ripple_hardening: { label: 'RIPPLE HARDENING', color: 'text-cyan-300', borderColor: 'border-cyan-400/30', commands: RIPPLE_HARDENING_COMMANDS },
  sandbox_hardening: { label: 'SANDBOX HARDENING', color: 'text-emerald-300', borderColor: 'border-emerald-400/30', commands: SANDBOX_HARDENING_COMMANDS },
  inclusive_hardening: { label: 'INCLUSIVE HARDENING', color: 'text-teal-300', borderColor: 'border-teal-400/30', commands: INCLUSIVE_HARDENING_COMMANDS },
  // ESZ — Expansion Sovereignty Zone
  sovereign: { label: 'SOVEREIGN', color: 'text-orange-300', borderColor: 'border-orange-400/30', commands: SOVEREIGN_COMMANDS },
  oracle: { label: 'ORACLE', color: 'text-amber-300', borderColor: 'border-amber-400/30', commands: ORACLE_COMMANDS },
  conscience: { label: 'CONSCIENCE', color: 'text-rose-300', borderColor: 'border-rose-400/30', commands: CONSCIENCE_COMMANDS },
  treaty: { label: 'TREATY', color: 'text-emerald-300', borderColor: 'border-emerald-400/30', commands: TREATY_COMMANDS },
  // EPZ — Expansion Perception Zone
  compass: { label: 'COMPASS', color: 'text-sky-400', borderColor: 'border-sky-500/30', commands: COMPASS_COMMANDS },
  echo: { label: 'ECHO', color: 'text-indigo-300', borderColor: 'border-indigo-400/30', commands: ECHO_COMMANDS },
  reflex: { label: 'REFLEX', color: 'text-pink-300', borderColor: 'border-pink-400/30', commands: REFLEX_COMMANDS },
  // EMZ — Expansion Manufacturing Zone
  forge: { label: 'FORGE', color: 'text-orange-400', borderColor: 'border-orange-500/30', commands: FORGE_COMMANDS },
  lingua: { label: 'LINGUA', color: 'text-teal-300', borderColor: 'border-teal-400/30', commands: LINGUA_COMMANDS },
  phantom: { label: 'PHANTOM', color: 'text-slate-300', borderColor: 'border-slate-400/30', commands: PHANTOM_COMMANDS },
  harvest: { label: 'HARVEST', color: 'text-lime-300', borderColor: 'border-lime-400/30', commands: HARVEST_COMMANDS },
  // Infrastructure
  medic: { label: 'MEDIC', color: 'text-rose-300', borderColor: 'border-rose-400/30', commands: MEDIC_COMMANDS },
  nerve: { label: 'NERVE', color: 'text-sky-300', borderColor: 'border-sky-400/30', commands: NERVE_COMMANDS },
  // Mesh Overlays
  evolution: { label: 'EVOLUTION', color: 'text-rose-400', borderColor: 'border-rose-500/30', commands: EVOLUTION_COMMANDS },
  immunity: { label: 'IMMUNITY', color: 'text-rose-300', borderColor: 'border-rose-400/30', commands: IMMUNITY_COMMANDS },
  governance: { label: 'GOVERNANCE', color: 'text-sky-400', borderColor: 'border-sky-500/30', commands: [...GOVERNANCE_COMMANDS, ...GOV_COMMANDS] },
  observability: { label: 'OBSERVABILITY', color: 'text-yellow-400', borderColor: 'border-yellow-500/30', commands: OBS_COMMANDS },
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
