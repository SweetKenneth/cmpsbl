/**
 * Terminal Command Registry
 * v9.1.0 ARCHITECT Epoch — 360+ commands across 21 modules
 * Complete list of all substrate commands organized by module
 */

import { Brain, Shield, Eye, Zap, MessageSquare, Moon, Settings, Terminal, Cpu, Clock, Search, Database, Activity, Lock, Router, Gauge, Sparkles, Radio, Key, Server, Send, List, PlayCircle, Plug, Globe, Workflow, Users, CreditCard, GitBranch, Box, Wand2, FileText, PenTool, FileEdit, FileCheck, Layers, CheckCircle, XCircle } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface CommandDefinition {
  command: string;
  description: string;
  category: 'brain' | 'decode' | 'defense' | 'nexus' | 'vision' | 'dream' | 'system' | 'modernizer' | 'core' | 'ripple' | 'access' | 'integration' | 'cortex' | 'inclusive' | 'clm' | 'autoblog' | 'meta' | 'engine' | 'infra' | 'memory_mod' | 'relay_mod' | 'audit_mod' | 'identity_mod' | 'economy_mod' | 'sandbox_mod';
  icon: LucideIcon;
  requiresOperator: boolean;
  args?: string;
  example?: string;
}

export const BRAIN_COMMANDS: CommandDefinition[] = [
  // Core operations
  { command: 'brain.status', description: 'Full tier status (hot/warm/cold)', category: 'brain', icon: Brain, requiresOperator: false },
  { command: 'brain.query', description: 'Search memories by text', category: 'brain', icon: Search, requiresOperator: true, args: '<query>', example: 'brain.query machine learning' },
  { command: 'brain.remember', description: 'Store a new memory', category: 'brain', icon: Database, requiresOperator: true, args: '<content> [type]', example: 'brain.remember "neural nets learn via backprop" fact' },
  { command: 'brain.recall', description: 'Retrieve specific memories', category: 'brain', icon: Brain, requiresOperator: true, args: '<query> [limit]', example: 'brain.recall quantum 5' },
  { command: 'brain.reflect', description: 'Trigger daily reflection cycle', category: 'brain', icon: Brain, requiresOperator: true },
  { command: 'brain.dream', description: 'Run autonomous dream cycle', category: 'brain', icon: Moon, requiresOperator: true },
  { command: 'brain.reinforce', description: 'Boost memory confidence', category: 'brain', icon: Brain, requiresOperator: true, args: '<memory_id> [boost]' },
  { command: 'brain.synthesize', description: 'Cross-domain synthesis', category: 'brain', icon: Brain, requiresOperator: true },
  // Memory management
  { command: 'brain.tier', description: 'Run hot→warm→cold tiering cycle', category: 'brain', icon: Database, requiresOperator: true, args: '[mode]', example: 'brain.tier aggressive' },
  { command: 'brain.optimize', description: 'Compress and clean memory', category: 'brain', icon: Brain, requiresOperator: true },
  { command: 'brain.prune', description: 'Remove low-value memories', category: 'brain', icon: Database, requiresOperator: true, args: '[threshold]', example: 'brain.prune 0.1' },
  // Reasoning
  { command: 'brain.deep_think', description: 'Extended multi-step reasoning', category: 'brain', icon: Brain, requiresOperator: true, args: '<query> [depth]', example: 'brain.deep_think "consciousness" 3' },
  { command: 'brain.hypothesis_test', description: 'IF-THEN scenario modeling', category: 'brain', icon: Brain, requiresOperator: true, args: '<claim> [context]', example: 'brain.hypothesis_test "memory compression improves recall"' },
  { command: 'brain.causal', description: 'Causal reasoning & hypothesis gen', category: 'brain', icon: Brain, requiresOperator: true, args: '[query_id]' },
  { command: 'brain.ethical', description: 'Ethical/legal risk evaluation', category: 'brain', icon: Shield, requiresOperator: true, args: '<proposed_action>', example: 'brain.ethical "store user data without consent"' },
  { command: 'brain.self_critique', description: 'Output quality review', category: 'brain', icon: Brain, requiresOperator: true, args: '<output> [output_type]', example: 'brain.self_critique "report content" text' },
  { command: 'brain.systems_reason', description: 'Multi-layer dependency mapping', category: 'brain', icon: Brain, requiresOperator: true, args: '<system> <issue>', example: 'brain.systems_reason substrate "slow response"' },
  { command: 'brain.pattern_fusion', description: 'Merge insights from unrelated domains', category: 'brain', icon: Brain, requiresOperator: true, args: '<problem> [domain_1] [domain_2]', example: 'brain.pattern_fusion "optimize memory" biology architecture' },
  // Learning & knowledge
  { command: 'brain.cognitive_cycle', description: 'Full cognitive loop', category: 'brain', icon: Activity, requiresOperator: true },
  { command: 'brain.continuous_learn', description: 'Toggle 24/7 learning', category: 'brain', icon: Brain, requiresOperator: true, args: '<enabled>', example: 'brain.continuous_learn true' },
  { command: 'brain.graph_build', description: 'Update knowledge graph', category: 'brain', icon: Database, requiresOperator: true },
  { command: 'brain.graph_summary', description: 'Knowledge graph overview', category: 'brain', icon: Database, requiresOperator: false },
  { command: 'brain.graph', description: 'Knowledge graph surfaces', category: 'brain', icon: Database, requiresOperator: false, args: '[--inspect|--stats|--export]' },
  { command: 'brain.synthesize_knowledge', description: 'Compress findings into core principles', category: 'brain', icon: Brain, requiresOperator: true },
  { command: 'brain.lesson_compress', description: 'Compress session learnings into lesson cards', category: 'brain', icon: Brain, requiresOperator: true, args: '[timeframe]', example: 'brain.lesson_compress last_hour' },
  // Analysis & monitoring
  { command: 'brain.curiosity', description: 'Get exploration queries', category: 'brain', icon: Search, requiresOperator: false },
  { command: 'brain.curiosity_reflect', description: 'Prioritize topics by curiosity score', category: 'brain', icon: Search, requiresOperator: true },
  { command: 'brain.explore', description: 'Active research query', category: 'brain', icon: Search, requiresOperator: true, args: '<query>' },
  { command: 'brain.patterns', description: 'Learning patterns/insights', category: 'brain', icon: Brain, requiresOperator: false },
  { command: 'brain.session_reflection', description: 'Session activity summary', category: 'brain', icon: Clock, requiresOperator: false, args: '[hours]' },
  { command: 'brain.coherence_check', description: 'Memory coherence validation', category: 'brain', icon: Brain, requiresOperator: false, args: '[depth]' },
  { command: 'brain.forecast', description: 'Predictive forecasting', category: 'brain', icon: Activity, requiresOperator: false, args: '[metric] [window]' },
  { command: 'brain.forecast_eval', description: 'Evaluate forecast accuracy', category: 'brain', icon: Activity, requiresOperator: true },
  // Advanced cognition
  { command: 'brain.tone_detect', description: 'Emotional tone & persona analysis', category: 'brain', icon: Brain, requiresOperator: true, args: '<message>', example: 'brain.tone_detect "I am confused about this feature"' },
  { command: 'brain.insight_aggregate', description: 'Cross-module metric collection', category: 'brain', icon: Database, requiresOperator: true },
  { command: 'brain.insight_synthesize', description: 'Strategic insight generation', category: 'brain', icon: Brain, requiresOperator: true },
  { command: 'brain.temporal_score', description: 'Memory freshness scoring', category: 'brain', icon: Clock, requiresOperator: true, args: '[query] [context_type]', example: 'brain.temporal_score research' },
  { command: 'brain.reflexive_plan', description: 'Task decomposition with context audit', category: 'brain', icon: Brain, requiresOperator: true, args: '<task> [context]', example: 'brain.reflexive_plan "optimize memory tiering"' },
  { command: 'brain.reward', description: 'Apply reward/penalty to memory confidence', category: 'brain', icon: Brain, requiresOperator: true, args: '<memory_id> [reward_score] [outcome_type]', example: 'brain.reward abc123 0.1 positive' },
  { command: 'brain.reinforce_cycle', description: 'Enhanced reinforcement learning', category: 'brain', icon: Brain, requiresOperator: true, args: '[lookbackHours] [minScore]', example: 'brain.reinforce_cycle 24 0.5' },
  { command: 'brain.persona_refine', description: 'Optimize persona patterns', category: 'brain', icon: Brain, requiresOperator: true },
];

export const DECODE_COMMANDS: CommandDefinition[] = [
  { command: 'decode.status', description: 'Module status', category: 'decode', icon: MessageSquare, requiresOperator: false },
  { command: 'decode.chat', description: 'Chat with interpreter', category: 'decode', icon: MessageSquare, requiresOperator: true, args: '<message>', example: 'decode.chat "explain quantum entanglement"' },
  { command: 'decode.intent', description: 'Extract structured intent', category: 'decode', icon: MessageSquare, requiresOperator: true, args: '<message>' },
  { command: 'decode.dream', description: 'Generate dream content', category: 'decode', icon: Moon, requiresOperator: true },
  { command: 'decode.propose', description: 'Submit substrate proposal', category: 'decode', icon: MessageSquare, requiresOperator: true, args: '<idea>' },
  { command: 'decode.learn', description: 'Ingest learning content', category: 'decode', icon: Brain, requiresOperator: true, args: '<content> [source]' },
  // Personality subsystem (v7.1.0) - interpretive filters only
  { command: 'decode.personality.list', description: 'List personality profiles', category: 'decode', icon: MessageSquare, requiresOperator: false },
  { command: 'decode.personality.get', description: 'Get current personality', category: 'decode', icon: MessageSquare, requiresOperator: false },
  { command: 'decode.personality.set', description: 'Set personality profile', category: 'decode', icon: MessageSquare, requiresOperator: true, args: '<profile>', example: 'decode.personality.set technical' },
  { command: 'decode.personality.auto', description: 'Enable auto-detection', category: 'decode', icon: MessageSquare, requiresOperator: true },
  { command: 'decode.personality.lock', description: 'Lock current profile', category: 'decode', icon: MessageSquare, requiresOperator: true },
  { command: 'decode.personality.unlock', description: 'Unlock profile switching', category: 'decode', icon: MessageSquare, requiresOperator: true },
  { command: 'decode.personality.detect', description: 'Detect personality from text', category: 'decode', icon: MessageSquare, requiresOperator: false, args: '<text>', example: 'decode.personality.detect "why is this broken again?!"' },
  { command: 'decode.personality.interpret', description: 'Interpret with personality lens', category: 'decode', icon: MessageSquare, requiresOperator: false, args: '<text>', example: 'decode.personality.interpret "explain how this works"' },
  { command: 'decode.personality.reset', description: 'Reset to neutral profile', category: 'decode', icon: MessageSquare, requiresOperator: true },
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
  { command: 'nexus.status', description: 'Module status with analytics', category: 'nexus', icon: Zap, requiresOperator: false },
  { command: 'nexus.route', description: 'Route to best provider', category: 'nexus', icon: Router, requiresOperator: true, args: '<task>' },
  { command: 'nexus.text', description: 'Text generation via routing spine', category: 'nexus', icon: Zap, requiresOperator: true, args: '<prompt> [model]', example: 'nexus.text "Explain gravity"' },
  { command: 'nexus.image', description: 'Image generation metadata', category: 'nexus', icon: Zap, requiresOperator: true, args: '<prompt> [model]', example: 'nexus.image "a blue fox" dalle' },
  { command: 'nexus.providers', description: 'Provider registry + capabilities', category: 'nexus', icon: Router, requiresOperator: false },
  { command: 'nexus.route_stats', description: 'AI routing analytics (24h)', category: 'nexus', icon: Activity, requiresOperator: false },
  { command: 'nexus.analytics', description: 'Session analytics accumulator', category: 'nexus', icon: Gauge, requiresOperator: false },
  { command: 'nexus.test', description: 'Test provider routing', category: 'nexus', icon: Zap, requiresOperator: true, args: '[prompt]' },
  { command: 'nexus.pulse', description: 'Lightweight heartbeat', category: 'nexus', icon: Activity, requiresOperator: false },
];

export const VISION_COMMANDS: CommandDefinition[] = [
  { command: 'vision.status', description: 'Module status (Vee v2.0)', category: 'vision', icon: Eye, requiresOperator: false },
  { command: 'vision.health', description: 'System-wide health', category: 'vision', icon: Activity, requiresOperator: false },
  { command: 'vision.pulse', description: 'Lightweight heartbeat', category: 'vision', icon: Activity, requiresOperator: false },
  { command: 'vision.metrics', description: 'System metrics', category: 'vision', icon: Gauge, requiresOperator: false, args: '[period] [type]' },
  { command: 'vision.logs', description: 'View module logs', category: 'vision', icon: Terminal, requiresOperator: false, args: '[module] [limit]' },
  { command: 'vision.alert', description: 'Create alert', category: 'vision', icon: Activity, requiresOperator: true, args: '<severity> <message>' },
  { command: 'vision.audit', description: 'Query audit log', category: 'vision', icon: Eye, requiresOperator: false, args: '[entity] [action]' },
  { command: 'vision.dashboard', description: 'Dashboard aggregation', category: 'vision', icon: Gauge, requiresOperator: false },
  { command: 'vision.trace', description: 'Distributed tracing with causal chains', category: 'vision', icon: Eye, requiresOperator: true, args: '[traceId|eventId]', example: 'vision.trace abc123' },
  { command: 'vision.monitor', description: 'Ecosystem health', category: 'vision', icon: Eye, requiresOperator: false },
  { command: 'vision.resilience', description: 'Error analysis + auto-fix', category: 'vision', icon: Activity, requiresOperator: false },
  { command: 'vision.analytics', description: 'Threat + provider analytics', category: 'vision', icon: Activity, requiresOperator: false },
  { command: 'vision.anomalies', description: 'Anomaly detection results', category: 'vision', icon: Activity, requiresOperator: false, args: '[limit] [--window 5m|1h|24h]', example: 'vision.anomalies 10 --window 1h' },
  { command: 'vision.mode', description: 'Get/set vision mode', category: 'vision', icon: Eye, requiresOperator: false, args: '[passive|advisory|operative]' },
  { command: 'vision.replay', description: 'Replay traces over time window', category: 'vision', icon: Eye, requiresOperator: false, args: '[5m|1h|24h]', example: 'vision.replay 1h' },
  { command: 'vision.health_snapshot', description: 'Quick health snapshot', category: 'vision', icon: Activity, requiresOperator: false },
  { command: 'vision.introspection', description: 'Deep self-analysis', category: 'vision', icon: Eye, requiresOperator: false },
  { command: 'vision.quota', description: 'AI usage quota', category: 'vision', icon: Gauge, requiresOperator: false },
  { command: 'vision.dependency_map', description: 'Module dependencies', category: 'vision', icon: Database, requiresOperator: false },
  { command: 'vision.inspect', description: 'Inspect observability state', category: 'vision', icon: Eye, requiresOperator: false, args: '[--links]' },
  { command: 'vision.diagnostics', description: 'Diagnostics for observability', category: 'vision', icon: Eye, requiresOperator: false, args: '[--full]' },
];

export const DREAM_COMMANDS: CommandDefinition[] = [
  { command: 'dream.status', description: 'Dream-Eater state with histograms + metabolic data', category: 'dream', icon: Moon, requiresOperator: false },
  { command: 'dream.mood', description: 'Get/set mood with decay info', category: 'dream', icon: Moon, requiresOperator: true, args: '[mood]' },
  { command: 'dream.cycle', description: 'Execute dream cycle', category: 'dream', icon: Moon, requiresOperator: true },
  { command: 'dream.feed', description: 'Feed dream text (auto-classifies type)', category: 'dream', icon: Moon, requiresOperator: true, args: '<text> [--type dream|nightmare]', example: 'dream.feed "I was flying through clouds"' },
  { command: 'dream.consume', description: 'Process a dream (mutation curve)', category: 'dream', icon: Moon, requiresOperator: true, args: '<dream_id>' },
  { command: 'dream.interpret', description: 'Interpret dream text', category: 'dream', icon: Moon, requiresOperator: true, args: '<text>' },
  { command: 'dream.mutate', description: 'Trigger mutation', category: 'dream', icon: Moon, requiresOperator: true },
  { command: 'dream.reflect', description: 'Dream reflection', category: 'dream', icon: Moon, requiresOperator: true },
  { command: 'dream.awaken', description: 'Awaken Dream-Eater (reset with reason)', category: 'dream', icon: Moon, requiresOperator: true, args: '[reason]', example: 'dream.awaken manual_reset' },
  { command: 'dream.pulse', description: 'Lightweight heartbeat + circadian', category: 'dream', icon: Activity, requiresOperator: false },
  { command: 'dream.anomalies', description: 'View dream module anomalies', category: 'dream', icon: Activity, requiresOperator: false, args: '[limit] [--resolved]' },
];

export const SYSTEM_COMMANDS: CommandDefinition[] = [
  { command: 'system.status', description: 'Global system status', category: 'system', icon: Cpu, requiresOperator: false },
  { command: 'system.health', description: 'Full system health', category: 'system', icon: Activity, requiresOperator: false },
  { command: 'system.doctor', description: 'Quick diagnostics (env, DB, routing, providers)', category: 'system', icon: CheckCircle, requiresOperator: false },
  { command: 'system.verify', description: 'Non-destructive checks with pass/fail results', category: 'system', icon: CheckCircle, requiresOperator: false, args: '[--verbose]' },
  { command: 'system.resilience', description: 'Resilience snapshot (circuits, health, heals)', category: 'system', icon: Shield, requiresOperator: false, args: '[role]', example: 'system.resilience operator' },
  { command: 'system.version', description: 'Substrate version', category: 'system', icon: Cpu, requiresOperator: false },
  { command: 'system.config', description: 'View configuration', category: 'system', icon: Settings, requiresOperator: false, args: '[key]' },
  { command: 'system.audit', description: 'Query health incidents & audit log', category: 'system', icon: Eye, requiresOperator: false, args: '[since] [type]', example: 'system.audit 24h heal' },
  { command: 'system.diagnostics', description: 'Full diagnostics', category: 'system', icon: Cpu, requiresOperator: false, args: '[--full]' },
  { command: 'system.heal', description: 'Self-healing trigger', category: 'system', icon: Shield, requiresOperator: true, args: '[target] [force]' },
  { command: 'system.restart', description: 'Restart service', category: 'system', icon: Cpu, requiresOperator: true, args: '[service]' },
  { command: 'system.backup', description: 'Create backup snapshot', category: 'system', icon: Database, requiresOperator: true, args: '[include_data]' },
  { command: 'system.restore', description: 'Restore from backup', category: 'system', icon: Database, requiresOperator: true, args: '<backup_id> [validate_only]' },
  { command: 'system.restore_portable', description: 'Restore from portable JSON backup (governor only)', category: 'system', icon: Database, requiresOperator: true, args: '<json> [--dry-run] [--mode=merge|replace]' },
  { command: 'system.list_backups', description: 'List available backups', category: 'system', icon: Database, requiresOperator: false },
  { command: 'system.upgrade.propose', description: 'Propose upgrade (shadow)', category: 'system', icon: Cpu, requiresOperator: true, args: '[scope] [notes]' },
  { command: 'system.upgrade.list', description: 'List upgrade plans', category: 'system', icon: Cpu, requiresOperator: false },
  { command: 'system.upgrade.apply', description: 'Apply upgrade plan', category: 'system', icon: Cpu, requiresOperator: true, args: '<plan_id>' },
  { command: 'system.upgrade.rollback', description: 'Rollback upgrade', category: 'system', icon: Cpu, requiresOperator: true, args: '<plan_id>' },
  // v5.6.0: Module Registry + Inventory
  { command: 'system.modules', description: 'List all registered modules', category: 'system', icon: Box, requiresOperator: false, args: '[--full|--health|--dag|--roles|--boot|--inventory]' },
  { command: 'system.module', description: 'Get specific module details', category: 'system', icon: Box, requiresOperator: false, args: '<module_name>' },
  { command: 'system.changelog', description: 'View living evolution log', category: 'system', icon: FileText, requiresOperator: false },
  { command: 'system.evolution', description: 'View living evolution log (alias)', category: 'system', icon: FileText, requiresOperator: false },
  // v7.0.0: Capability Auto-Adapt System
  { command: 'system.scan_adapt', description: 'Scan edge functions for overlap and auto-adapt capabilities', category: 'system', icon: Search, requiresOperator: true, args: '[--dry-run|--confirm|--prune-unused|--verbose]', example: 'system.scan_adapt --dry-run' },
  { command: 'system.capabilities', description: 'List all registered capabilities', category: 'system', icon: Box, requiresOperator: false, args: '[--active|--deprecated|--all]' },
  { command: 'system.capability', description: 'Get capability details', category: 'system', icon: Box, requiresOperator: false, args: '<capability_id>' },
];

export const MODERNIZER_COMMANDS: CommandDefinition[] = [
  { command: 'modernizer.status', description: 'Modernizer service status', category: 'modernizer', icon: Sparkles, requiresOperator: false },
  { command: 'modernizer.jobs', description: 'List evolution runs (active + completed)', category: 'modernizer', icon: Activity, requiresOperator: false, args: '[limit]' },
  
  // ═══ EVOLUTION CYCLE v0.7.7 (Primary Commands) ═══
  { command: 'modernizer.evolve', description: 'Unified Evolution Cycle (scan → plan → shadow → production → verify)', category: 'modernizer', icon: Sparkles, requiresOperator: true, args: '[shadow|production|verify|abort|status] [--confirm]', example: 'modernizer.evolve shadow' },
  
  // ═══ COGNITIVE SCAN v0.7.7 ═══
  { command: 'modernizer.scan', description: 'Cognitive systems scan (4-phase: edge/system/health/LLM)', category: 'modernizer', icon: Search, requiresOperator: true, args: '[--explain|--llm-report|--dry-run]', example: 'modernizer.scan --explain' },
  
  // ═══ CIRCUIT BREAKER v0.7.6 ═══
  { command: 'modernizer.circuit', description: 'Evolution circuit breaker control', category: 'modernizer', icon: Shield, requiresOperator: false, args: '[status|reset|open <reason>]', example: 'modernizer.circuit status' },
  
  // ═══ AUTONOMY v0.7.6 ═══
  { command: 'modernizer.autonomy', description: 'Governed autonomy settings', category: 'modernizer', icon: Settings, requiresOperator: true, args: '[status|set <mode>]', example: 'modernizer.autonomy set governed' },
  
  // ═══ RECEIPTS v0.7.5 ═══
  { command: 'modernizer.receipts', description: 'List evolution receipts (audit trail)', category: 'modernizer', icon: Database, requiresOperator: false, args: '[limit]' },
  { command: 'modernizer.receipt', description: 'View specific evolution receipt', category: 'modernizer', icon: Eye, requiresOperator: false, args: '<run_id>' },
  
  // ═══ OMEGA OBSERVER ENGINE v1.0.0 ═══
  { command: 'modernizer.verify', description: 'Eligibility gate (plan-independent)', category: 'modernizer', icon: Shield, requiresOperator: false, args: '[component]', example: 'modernizer.verify brain' },
  { command: 'modernizer.analyze', description: 'Forward intent projection (what will change)', category: 'modernizer', icon: Search, requiresOperator: false, args: '[component]', example: 'modernizer.analyze memory' },
  { command: 'modernizer.forensics', description: 'Historical truth (what has changed)', category: 'modernizer', icon: Eye, requiresOperator: false, args: '<component> [--since 24h|7d|last_run]', example: 'modernizer.forensics brain --since 24h' },
  { command: 'modernizer.omega', description: 'Ω Unified observer v2.0 (can/will/has)', category: 'modernizer', icon: Eye, requiresOperator: false, args: '[component] [--since 24h|7d|30d] [--compact]', example: 'modernizer.omega brain --since 7d' },
  
  // Plan management
  { command: 'modernizer.plans', description: 'List active evolution plan', category: 'modernizer', icon: Activity, requiresOperator: false },
  { command: 'modernizer.review', description: 'Review a specific plan', category: 'modernizer', icon: Eye, requiresOperator: false, args: '<plan_id>' },
  { command: 'modernizer.validate', description: 'Validate plan readiness', category: 'modernizer', icon: Shield, requiresOperator: false, args: '<plan_id>' },
  { command: 'modernizer.diff', description: 'View plan diff and health comparison', category: 'modernizer', icon: Eye, requiresOperator: false, args: '<plan_id>' },
  { command: 'modernizer.rollback', description: 'Rollback an applied plan', category: 'modernizer', icon: Shield, requiresOperator: true, args: '<plan_id>' },
  { command: 'modernizer.delete', description: 'Delete/reject a plan', category: 'modernizer', icon: Shield, requiresOperator: true, args: '<plan_id>' },
  { command: 'modernizer.applied', description: 'List all applied improvements', category: 'modernizer', icon: Activity, requiresOperator: false },
  { command: 'modernizer.archived', description: 'Scan archived functions to repurpose', category: 'modernizer', icon: Database, requiresOperator: false },
  { command: 'modernizer.implement', description: 'Generate code for archived function repurposing', category: 'modernizer', icon: Sparkles, requiresOperator: true, args: '<archived_function> <target_action>' },
  { command: 'modernizer.export', description: 'Export job assets', category: 'modernizer', icon: Database, requiresOperator: true, args: '<job_id>' },
  { command: 'modernizer.quota', description: 'Check usage limits', category: 'modernizer', icon: Gauge, requiresOperator: false },
  { command: 'modernizer.refresh', description: 'Resync metrics and clear stale hints', category: 'modernizer', icon: Activity, requiresOperator: true },
  { command: 'modernizer.stamps', description: 'View evolution stamps for verification', category: 'modernizer', icon: FileCheck, requiresOperator: false, args: '[limit]', example: 'modernizer.stamps 5' },
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

// RIPPLE module v2.0 — Hybrid Event Orchestrator
export const RIPPLE_COMMANDS: CommandDefinition[] = [
  // Status & health
  { command: 'ripple.status', description: 'Bus status with job breakdown + 24h analytics', category: 'ripple', icon: Radio, requiresOperator: false },
  { command: 'ripple.pulse', description: 'Lightweight heartbeat', category: 'ripple', icon: Activity, requiresOperator: false },
  { command: 'ripple.metrics', description: 'Bus metrics for Vision integration', category: 'ripple', icon: Gauge, requiresOperator: false },
  
  // Topics & events
  { command: 'ripple.topics', description: 'List all topics', category: 'ripple', icon: List, requiresOperator: false },
  { command: 'ripple.events', description: 'Get event log with status', category: 'ripple', icon: Activity, requiresOperator: false, args: '[topic] [limit] [status]' },
  { command: 'ripple.publish', description: 'Publish event + fan-out to subscribers', category: 'ripple', icon: Send, requiresOperator: true, args: '<topic> <event_type> [payload]', example: 'ripple.publish system.alerts health_check "{}"' },
  { command: 'ripple.subscribe', description: 'Subscribe module/action to topic', category: 'ripple', icon: Radio, requiresOperator: true, args: '<topic> <module> <action> [max_attempts]' },
  { command: 'ripple.replay', description: 'Re-process events on topic', category: 'ripple', icon: PlayCircle, requiresOperator: true, args: '<topic> [limit]', example: 'ripple.replay system.alerts 10' },
  
  // Jobs & queues
  { command: 'ripple.jobs', description: 'List jobs with filtering', category: 'ripple', icon: List, requiresOperator: false, args: '[queue] [status] [limit]' },
  { command: 'ripple.enqueue', description: 'Add job to queue', category: 'ripple', icon: List, requiresOperator: true, args: '<queue> <payload> [priority] [delay]' },
  { command: 'ripple.dequeue', description: 'Get next pending job', category: 'ripple', icon: List, requiresOperator: true, args: '[queue]' },
  { command: 'ripple.work', description: 'Process job(s) from queue', category: 'ripple', icon: PlayCircle, requiresOperator: true, args: '[queue] [--once]', example: 'ripple.work events --once' },
  { command: 'ripple.drain', description: 'Process all pending jobs in queue', category: 'ripple', icon: PlayCircle, requiresOperator: true, args: '[queue]' },
  
  // Delivery semantics
  { command: 'ripple.ack', description: 'Acknowledge job as succeeded', category: 'ripple', icon: Shield, requiresOperator: true, args: '<job_id>' },
  { command: 'ripple.nack', description: 'Reject job (increment attempts)', category: 'ripple', icon: Shield, requiresOperator: true, args: '<job_id> [reason]' },
  { command: 'ripple.dead_letter', description: 'View dead-letter jobs', category: 'ripple', icon: Shield, requiresOperator: false, args: '[queue] [limit]' },
  { command: 'ripple.retry', description: 'Retry dead-letter job', category: 'ripple', icon: PlayCircle, requiresOperator: true, args: '<job_id>' },
  
  // Circuit breakers
  { command: 'ripple.circuits', description: 'View subscriber circuit breakers', category: 'ripple', icon: Activity, requiresOperator: false },
];

// ACCESS module v2.1 — API keys, subscriptions, entitlements, identity, bootstrap
export const ACCESS_COMMANDS: CommandDefinition[] = [
  // Status & pulse
  { command: 'access.status', description: 'Module status (v2.1)', category: 'access', icon: Key, requiresOperator: false },
  { command: 'access.pulse', description: 'Lightweight heartbeat', category: 'access', icon: Activity, requiresOperator: false },
  
  // Identity & Bootstrap (NEW)
  { command: 'access.bootstrap', description: 'Bootstrap developer identity + roles', category: 'access', icon: Users, requiresOperator: false, args: '[display_name]', example: 'access.bootstrap Kenneth' },
  { command: 'access.identity', description: 'Get current session identity + roles', category: 'access', icon: Users, requiresOperator: false },
  
  // Developer CRUD
  { command: 'access.register', description: 'Register as developer (requires auth)', category: 'access', icon: Users, requiresOperator: true, args: '[display_name]', example: 'access.register "My App"' },
  { command: 'access.developer', description: 'Get developer profile', category: 'access', icon: Users, requiresOperator: false, args: '[developer_id]' },
  { command: 'access.developers', description: 'List all developers (admin)', category: 'access', icon: Users, requiresOperator: true },
  
  // API Key lifecycle
  { command: 'access.create_key', description: 'Create API key', category: 'access', icon: Key, requiresOperator: true, args: '[name] [scopes...]', example: 'access.create_key "My Key" substrate.read substrate.write' },
  { command: 'access.validate_key', description: 'Validate API key', category: 'access', icon: Shield, requiresOperator: true, args: '<api_key>' },
  { command: 'access.revoke_key', description: 'Revoke API key', category: 'access', icon: Lock, requiresOperator: true, args: '<key_id>' },
  { command: 'access.list_keys', description: 'List your API keys', category: 'access', icon: List, requiresOperator: false },
  
  // Usage & Quota
  { command: 'access.usage', description: 'Get usage statistics', category: 'access', icon: Gauge, requiresOperator: false, args: '[product_code] [days]', example: 'access.usage scan 30' },
  { command: 'access.quota', description: 'Check quota remaining', category: 'access', icon: Gauge, requiresOperator: false, args: '[api_key_id]' },
  
  // Subscriptions & Entitlements
  { command: 'access.subscription', description: 'Get subscription info', category: 'access', icon: Key, requiresOperator: false },
  { command: 'access.entitlements', description: 'List your entitlements', category: 'access', icon: Shield, requiresOperator: false },
  
  // Product catalog
  { command: 'access.products', description: 'List available products/entitlements', category: 'access', icon: Box, requiresOperator: false, args: '[category]', example: 'access.products cmptbl' },
];

// INTEGRATION module v2.0 — Adapters, Connections, Discovery, Governance
export const INTEGRATION_COMMANDS: CommandDefinition[] = [
  // Status & pulse
  { command: 'integration.status', description: 'Integration module status (v2.0)', category: 'integration', icon: Plug, requiresOperator: false },
  { command: 'integration.pulse', description: 'Lightweight heartbeat', category: 'integration', icon: Activity, requiresOperator: false },
  
  // Adapters & connections
  { command: 'integration.adapters', description: 'List available adapters by category', category: 'integration', icon: Box, requiresOperator: false, args: '[category]', example: 'integration.adapters enterprise' },
  { command: 'integration.connect', description: 'Connect adapter with mode', category: 'integration', icon: Plug, requiresOperator: true, args: '<mode> <adapter_id>', example: 'integration.connect mock PostgreSQL' },
  { command: 'integration.disconnect', description: 'Disconnect connection by ID', category: 'integration', icon: Plug, requiresOperator: true, args: '<connection_id>' },
  { command: 'integration.connections', description: 'List active connections', category: 'integration', icon: Globe, requiresOperator: false },
  { command: 'integration.test', description: 'Test adapter connectivity', category: 'integration', icon: Activity, requiresOperator: true, args: '<adapter_id>', example: 'integration.test PostgreSQL' },
  
  // Discovery
  { command: 'integration.discover', description: 'Discover system (shallow by default)', category: 'integration', icon: Search, requiresOperator: true, args: '<adapter_id> [depth]', example: 'integration.discover PostgreSQL' },
  { command: 'integration.discovered', description: 'List discoveries', category: 'integration', icon: List, requiresOperator: false, args: '[adapter_id]' },
  
  // Command mapping & execution
  { command: 'integration.map_command', description: 'Map terminal command to adapter', category: 'integration', icon: GitBranch, requiresOperator: true, args: '<adapter_id> <command> "<description>"', example: 'integration.map_command PostgreSQL payroll "Run payroll"' },
  { command: 'integration.mapped_commands', description: 'List mapped commands', category: 'integration', icon: Terminal, requiresOperator: false, args: '[adapter_id]' },
  { command: 'integration.execute', description: 'Execute governed command', category: 'integration', icon: PlayCircle, requiresOperator: true, args: '<adapter_id> <command> [params_json]', example: 'integration.execute PostgreSQL payroll' },
  
  // Governance & audit
  { command: 'integration.policies', description: 'Get governance policies', category: 'integration', icon: Shield, requiresOperator: false },
  { command: 'integration.set_policy', description: 'Set governance policy', category: 'integration', icon: Lock, requiresOperator: true, args: '[adapter_id] <policy>' },
  { command: 'integration.governance', description: 'Governance status', category: 'integration', icon: Shield, requiresOperator: false },
  { command: 'integration.audit_log', description: 'View governance audit log', category: 'integration', icon: Eye, requiresOperator: false, args: '[adapter_id] [limit]' },
  
  // Enterprise verticals
  { command: 'integration.game_discover', description: 'Discover game engine APIs', category: 'integration', icon: Workflow, requiresOperator: true, args: '<engine_type>', example: 'integration.game_discover unity' },
  { command: 'integration.enterprise_discover', description: 'Discover enterprise APIs', category: 'integration', icon: Users, requiresOperator: true, args: '<system_type>', example: 'integration.enterprise_discover salesforce' },
  { command: 'integration.dev_discover', description: 'Discover dev platform APIs', category: 'integration', icon: GitBranch, requiresOperator: true, args: '<platform_type>', example: 'integration.dev_discover github' },
  { command: 'integration.payroll', description: 'Execute payroll operation', category: 'integration', icon: CreditCard, requiresOperator: true, args: '<adapter_id> <operation> [params]' },
  { command: 'integration.customer_service', description: 'Execute customer service op', category: 'integration', icon: Users, requiresOperator: true, args: '<adapter_id> <operation> [params]' },
];

// CORTEX module v2.0 — Agency-class orchestrator with lifecycle, panic, dispatch, evolution
export const CORTEX_COMMANDS: CommandDefinition[] = [
  // Status & health
  { command: 'cortex.status', description: 'Full status + capabilities + circuits', category: 'cortex', icon: Wand2, requiresOperator: false },
  { command: 'cortex.health', description: 'Health + connected modules + circuits', category: 'cortex', icon: Activity, requiresOperator: false },
  { command: 'cortex.pulse', description: 'Lightweight heartbeat', category: 'cortex', icon: Activity, requiresOperator: false },
  { command: 'cortex.diagnostics', description: 'Deep self-analysis', category: 'cortex', icon: Search, requiresOperator: false },
  
  // Mode control
  { command: 'cortex.mode', description: 'Get/set mode (manual|shadow|auto)', category: 'cortex', icon: Settings, requiresOperator: false, args: '[manual|shadow|auto]', example: 'cortex.mode shadow' },
  { command: 'cortex.restart', description: 'Soft reload cortex state', category: 'cortex', icon: PlayCircle, requiresOperator: true },
  
  // Panic controls
  { command: 'cortex.panic', description: 'Panic mode controls', category: 'cortex', icon: Shield, requiresOperator: true, args: '<freeze|resume|status> [reason]', example: 'cortex.panic freeze "Emergency"' },
  
  // Dispatch & observe
  { command: 'cortex.dispatch', description: 'Execute module.action with governance', category: 'cortex', icon: Send, requiresOperator: true, args: '<module.action> [args]', example: 'cortex.dispatch brain.reflect' },
  { command: 'cortex.observe', description: 'Subscribe to module events', category: 'cortex', icon: Eye, requiresOperator: false, args: '[module] [event_types]' },
  
  // PAAEL Loop
  { command: 'cortex.propose', description: 'Generate improvement proposal', category: 'cortex', icon: Wand2, requiresOperator: true, args: '<goal> [context]', example: 'cortex.propose "Optimize memory tiering"' },
  { command: 'cortex.evaluate', description: 'Score and assess proposal', category: 'cortex', icon: Search, requiresOperator: true, args: '[proposal_id] [criteria]' },
  { command: 'cortex.apply', description: 'Execute approved changes', category: 'cortex', icon: PlayCircle, requiresOperator: true, args: '<proposal_id> [target_module]' },
  { command: 'cortex.rollback', description: 'Rollback applied changes', category: 'cortex', icon: Shield, requiresOperator: true, args: '<apply_id> [reason]' },
  { command: 'cortex.audit', description: 'Query decisions and deltas', category: 'cortex', icon: Eye, requiresOperator: false, args: '[since] [type]', example: 'cortex.audit 24h proposal' },
  { command: 'cortex.learn', description: 'Ingest outcome for reinforcement', category: 'cortex', icon: Brain, requiresOperator: true, args: '<outcome> [proposal_id] [feedback]', example: 'cortex.learn success prop_abc123' },
  { command: 'cortex.summary', description: 'Human-readable context dump', category: 'cortex', icon: Terminal, requiresOperator: false },
  
  // Evolution sequencing
  { command: 'cortex.plan', description: 'Rank evolution sequences by priority', category: 'cortex', icon: Workflow, requiresOperator: false, args: '[sequence_id]' },
  { command: 'cortex.run', description: 'Execute sequence in shadow mode', category: 'cortex', icon: PlayCircle, requiresOperator: true, args: '<sequence_id> [mode]', example: 'cortex.run abc123 shadow' },
  
  // v5.6.0: World Model + Introspection
  { command: 'cortex.world', description: 'Full module registry snapshot', category: 'cortex', icon: Globe, requiresOperator: false, args: '[--dag|--roles|--eligible]' },
  { command: 'cortex.inventory', description: 'Module inventory with eligibility', category: 'cortex', icon: Box, requiresOperator: false },
  
  // v7.0.0: Cross-Module Synergy Engine (120 Pipelines, 98 Executors)
  { command: 'cortex.synergy.status', description: 'Synergy engine overview (pipelines, executors, health)', category: 'cortex', icon: Workflow, requiresOperator: false },
  { command: 'cortex.synergy.list', description: 'List all 120 synergy pipelines', category: 'cortex', icon: List, requiresOperator: false, args: '[--category <cat>|--module <mod>]', example: 'cortex.synergy.list --category intelligence' },
  { command: 'cortex.synergy.get', description: 'Get synergy pipeline details', category: 'cortex', icon: Eye, requiresOperator: false, args: '<synergy_id>', example: 'cortex.synergy.get smart-recall' },
  { command: 'cortex.synergy.execute', description: 'Execute a synergy pipeline', category: 'cortex', icon: PlayCircle, requiresOperator: true, args: '<synergy_id> [input_json]', example: 'cortex.synergy.execute adaptive-routing' },
  { command: 'cortex.synergy.dry_run', description: 'Dry-run a synergy (no side effects)', category: 'cortex', icon: Eye, requiresOperator: false, args: '<synergy_id> [input_json]', example: 'cortex.synergy.dry_run cognitive-fusion' },
  { command: 'cortex.synergy.recommend', description: 'Get recommended synergies for context', category: 'cortex', icon: Sparkles, requiresOperator: false, args: '[context_json]' },
  { command: 'cortex.synergy.pipeline', description: 'Execute chained synergy pipeline', category: 'cortex', icon: Workflow, requiresOperator: true, args: '<synergy1,synergy2,...> [input_json]', example: 'cortex.synergy.pipeline smart-recall,cognitive-fusion' },
  { command: 'cortex.synergy.categories', description: 'List synergy categories with counts', category: 'cortex', icon: Box, requiresOperator: false },
  { command: 'cortex.synergy.modules', description: 'List synergies by module involvement', category: 'cortex', icon: Database, requiresOperator: false, args: '[module]', example: 'cortex.synergy.modules brain' },
];

// INCLUSIVE module v1.0 — Human Compatibility Pipeline (WCAG Scanning, Repair, Validation)
import { Accessibility } from 'lucide-react';

export const INCLUSIVE_COMMANDS: CommandDefinition[] = [
  // Status & health
  { command: 'inclusive.status', description: 'Module status with global score', category: 'inclusive', icon: Accessibility, requiresOperator: false },
  { command: 'inclusive.health', description: 'Health check', category: 'inclusive', icon: Activity, requiresOperator: false },
  { command: 'inclusive.pulse', description: 'Lightweight heartbeat', category: 'inclusive', icon: Activity, requiresOperator: false },
  
  // Core pipeline
  { command: 'inclusive.scan', description: 'Scan URL/HTML for WCAG issues', category: 'inclusive', icon: Eye, requiresOperator: true, args: '<target> [--wcag A|AA|AAA] [--depth quick|standard|deep]', example: 'inclusive.scan https://example.com' },
  { command: 'inclusive.self_scan', description: 'Scan the substrate UI itself', category: 'inclusive', icon: Eye, requiresOperator: true },
  { command: 'inclusive.repair', description: 'Auto-fix accessibility issues', category: 'inclusive', icon: Wand2, requiresOperator: true, args: '<target> [issues...]', example: 'inclusive.repair https://example.com' },
  { command: 'inclusive.validate', description: 'Validate repairs, check for regressions', category: 'inclusive', icon: Shield, requiresOperator: true, args: '<target>' },
  { command: 'inclusive.profile', description: 'Build user adaptive profile', category: 'inclusive', icon: Users, requiresOperator: true, args: '<context>' },
  { command: 'inclusive.report', description: 'Generate compliance report', category: 'inclusive', icon: Database, requiresOperator: false, args: '<target> [json|markdown]' },
  
  // Extended operations
  { command: 'inclusive.scan_all_templates', description: 'Scan all marketplace templates', category: 'inclusive', icon: Search, requiresOperator: true },
  { command: 'inclusive.regressions', description: 'Get regressions in last N hours', category: 'inclusive', icon: Activity, requiresOperator: false, args: '[hours]', example: 'inclusive.regressions 24' },
  { command: 'inclusive.coverage', description: 'Template coverage stats', category: 'inclusive', icon: Gauge, requiresOperator: false },
];

// CLM (Constant Learning Mode) commands — v6.7.0
export const CLM_COMMANDS: CommandDefinition[] = [
  // Status & control
  { command: 'clm.status', description: 'CLM status (budget, topics, queue)', category: 'clm', icon: Brain, requiresOperator: false },
  { command: 'clm.enable', description: 'Enable Constant Learning Mode', category: 'clm', icon: Brain, requiresOperator: true },
  { command: 'clm.disable', description: 'Disable Constant Learning Mode', category: 'clm', icon: Brain, requiresOperator: true },
  { command: 'clm.cycle', description: 'Run a manual CLM cycle', category: 'clm', icon: Activity, requiresOperator: true },
  
  // Budget & governance
  { command: 'clm.budget', description: 'View daily budget allocation', category: 'clm', icon: Gauge, requiresOperator: false },
  { command: 'clm.kill_switch', description: 'Activate/deactivate kill switch', category: 'clm', icon: Shield, requiresOperator: true, args: '<on|off>', example: 'clm.kill_switch on' },
  
  // Topics & curriculum
  { command: 'clm.topics', description: 'View topic bank with mastery scores', category: 'clm', icon: List, requiresOperator: false },
  { command: 'clm.add_topic', description: 'Add custom topic to bank', category: 'clm', icon: Brain, requiresOperator: true, args: '<topic> <category>', example: 'clm.add_topic "quantum computing" science' },
  
  // Spaced repetition
  { command: 'clm.review_queue', description: 'View spaced repetition queue', category: 'clm', icon: Clock, requiresOperator: false },
  { command: 'clm.next_review', description: 'Get next review item', category: 'clm', icon: Brain, requiresOperator: false },
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
  { command: 'encoded.status', description: 'Agent status and configuration', category: 'cortex', icon: PenTool, requiresOperator: false },
  { command: 'encoded.config', description: 'View current configuration', category: 'cortex', icon: Settings, requiresOperator: false },
  { command: 'encoded.skills', description: 'View skill proficiency levels', category: 'cortex', icon: Brain, requiresOperator: false },
  { command: 'encoded.metrics', description: 'Quality metrics and success rates', category: 'cortex', icon: Activity, requiresOperator: false },
  { command: 'encoded.dry_run', description: 'Enable dry-run mode (preview only)', category: 'cortex', icon: FileCheck, requiresOperator: true },
  { command: 'encoded.enable', description: 'Enable human approval mode', category: 'cortex', icon: PenTool, requiresOperator: true },
  { command: 'encoded.semi_auto', description: 'Enable semi-autonomous mode', category: 'cortex', icon: PenTool, requiresOperator: true },
  { command: 'encoded.verify', description: 'Verify code against guardrails', category: 'cortex', icon: FileCheck, requiresOperator: true, args: '<code>' },
  { command: 'encoded.generate', description: 'Generate code (with task spec)', category: 'cortex', icon: FileEdit, requiresOperator: true },
  { command: 'encoded.analyze', description: 'Analyze code quality metrics', category: 'cortex', icon: Activity, requiresOperator: true, args: '<code>' },
  { command: 'encoded.patterns', description: 'List learned code patterns', category: 'cortex', icon: Brain, requiresOperator: false },
  { command: 'encoded.history', description: 'Recent Encoded executions', category: 'cortex', icon: Clock, requiresOperator: false },
  { command: 'encoded.seba.enable', description: 'Enable SEBA integration', category: 'cortex', icon: GitBranch, requiresOperator: true },
  { command: 'encoded.seba.disable', description: 'Disable SEBA integration', category: 'cortex', icon: GitBranch, requiresOperator: true },
  { command: 'encoded.model.lovable', description: 'Use Lovable AI as primary', category: 'cortex', icon: Sparkles, requiresOperator: true },
  { command: 'encoded.model.free', description: 'Use free-tier as primary', category: 'cortex', icon: Sparkles, requiresOperator: true },
  { command: 'encoded.help', description: 'Show all encoded commands', category: 'cortex', icon: Terminal, requiresOperator: false },
];

// ENGINE — Cognitive Engine System v8.1.0
export const ENGINE_COMMANDS: CommandDefinition[] = [
  // Engine browsing
  { command: 'engine.status', description: 'Engine system overview', category: 'engine', icon: Cpu, requiresOperator: false },
  { command: 'engine.list', description: 'List all 62 engines', category: 'engine', icon: List, requiresOperator: false, args: '[category]', example: 'engine.list cognitive' },
  { command: 'engine.get', description: 'Get engine details', category: 'engine', icon: Search, requiresOperator: false, args: '<engine_id>', example: 'engine.get reasoning_engine' },
  { command: 'engine.categories', description: 'List engine categories', category: 'engine', icon: Box, requiresOperator: false },
  
  // Engine execution
  { command: 'engine.run', description: 'Execute an engine', category: 'engine', icon: PlayCircle, requiresOperator: true, args: '<engine_id> [json_input]', example: 'engine.run reasoning_engine {"query":"test"}' },
  { command: 'engine.batch', description: 'Execute multiple engines', category: 'engine', icon: Workflow, requiresOperator: true, args: '<engine_ids> [parallel]', example: 'engine.batch reasoning_engine,learning_engine true' },
  
  // Meta-engine browsing
  { command: 'meta.status', description: 'Meta-engine system overview', category: 'engine', icon: Workflow, requiresOperator: false },
  { command: 'meta.list', description: 'List all 20 meta-engines', category: 'engine', icon: List, requiresOperator: false },
  { command: 'meta.get', description: 'Get meta-engine details', category: 'engine', icon: Search, requiresOperator: false, args: '<meta_engine_id>', example: 'meta.get cognitive_mesh' },
  
  // Meta-engine execution
  { command: 'meta.run', description: 'Execute a meta-engine', category: 'engine', icon: PlayCircle, requiresOperator: true, args: '<meta_engine_id> [json_input]', example: 'meta.run cognitive_mesh {"task":"analyze"}' },
  { command: 'meta.batch', description: 'Execute multiple meta-engines', category: 'engine', icon: Workflow, requiresOperator: true, args: '<meta_engine_ids> [parallel]', example: 'meta.batch cognitive_mesh,system_guardian true' },
  
  // World-first engines
  { command: 'engine.worldfirst', description: 'List 14 world-first enhancement engines', category: 'engine', icon: Sparkles, requiresOperator: false },
  { command: 'engine.synergy', description: 'View synergy metrics', category: 'engine', icon: Activity, requiresOperator: false },
  
  // History
  { command: 'engine.history', description: 'View recent engine executions', category: 'engine', icon: Clock, requiresOperator: false, args: '[limit]', example: 'engine.history 10' },
];

// ═══ Infrastructure Commands (v8.5.0) ═══
export const INFRA_COMMANDS: CommandDefinition[] = [
  // Cron Runner
  { command: 'cron.list', description: 'List all scheduled jobs', category: 'infra', icon: Clock, requiresOperator: false },
  { command: 'cron.stats', description: 'Cron runner statistics', category: 'infra', icon: Gauge, requiresOperator: false },
  { command: 'cron.start', description: 'Start the cron runner', category: 'infra', icon: PlayCircle, requiresOperator: true },
  { command: 'cron.stop', description: 'Stop all cron jobs', category: 'infra', icon: XCircle, requiresOperator: true },
  { command: 'cron.trigger', description: 'Manually trigger a job', category: 'infra', icon: Zap, requiresOperator: true, args: '<job-id>', example: 'cron.trigger health-check' },
  { command: 'cron.history', description: 'View cron run history', category: 'infra', icon: Clock, requiresOperator: false },
  { command: 'cron.enable', description: 'Enable a specific job', category: 'infra', icon: CheckCircle, requiresOperator: true, args: '<job-id>' },
  { command: 'cron.disable', description: 'Disable a specific job', category: 'infra', icon: XCircle, requiresOperator: true, args: '<job-id>' },
  // Rate Limiter
  { command: 'ratelimit.status', description: 'Persistent rate limiter status', category: 'infra', icon: Gauge, requiresOperator: false },
  { command: 'ratelimit.buckets', description: 'List all rate limit buckets', category: 'infra', icon: Database, requiresOperator: false },
  { command: 'ratelimit.cleanup', description: 'Cleanup expired buckets', category: 'infra', icon: Settings, requiresOperator: true },
  // Rollback Snapshots
  { command: 'snapshot.list', description: 'List all state snapshots', category: 'infra', icon: Database, requiresOperator: false },
  { command: 'snapshot.capture', description: 'Capture current state snapshot', category: 'infra', icon: Database, requiresOperator: true },
  { command: 'snapshot.stats', description: 'Snapshot storage statistics', category: 'infra', icon: Gauge, requiresOperator: false },
  { command: 'snapshot.diff', description: 'Diff a snapshot vs current', category: 'infra', icon: GitBranch, requiresOperator: false, args: '<snapshot-id>' },
  { command: 'snapshot.restore', description: 'Restore from snapshot', category: 'infra', icon: Database, requiresOperator: true, args: '<snapshot-id>' },
  { command: 'snapshot.delete', description: 'Delete a snapshot', category: 'infra', icon: XCircle, requiresOperator: true, args: '<snapshot-id>' },
  { command: 'snapshot.prune', description: 'Prune old snapshots', category: 'infra', icon: Settings, requiresOperator: true },
  // Capability Analytics
  { command: 'analytics.summary', description: 'Capability usage summary (24h)', category: 'infra', icon: Activity, requiresOperator: false },
  { command: 'analytics.top', description: 'Top used capabilities', category: 'infra', icon: Sparkles, requiresOperator: false },
  { command: 'analytics.dead', description: 'Dead/unused capabilities', category: 'infra', icon: XCircle, requiresOperator: false },
  { command: 'analytics.rising', description: 'Rising capability trends', category: 'infra', icon: Activity, requiresOperator: false },
  { command: 'analytics.flush', description: 'Flush analytics to storage', category: 'infra', icon: Database, requiresOperator: true },
  // Streaming Pipeline
  { command: 'stream.status', description: 'Streaming pipeline status', category: 'infra', icon: Radio, requiresOperator: false },
  { command: 'stream.active', description: 'Active stream sessions', category: 'infra', icon: Activity, requiresOperator: false },
  // File Processing
  { command: 'file.status', description: 'File processing pipeline status', category: 'infra', icon: FileText, requiresOperator: false },
  { command: 'file.history', description: 'File processing history', category: 'infra', icon: Clock, requiresOperator: false },
  { command: 'file.formats', description: 'Supported file formats', category: 'infra', icon: FileCheck, requiresOperator: false },
  // Natural Language Terminal
  { command: 'nl.parse', description: 'Parse natural language to command', category: 'infra', icon: MessageSquare, requiresOperator: false, args: '<query>', example: 'nl.parse "show me system health"' },
  { command: 'nl.intents', description: 'List known NL intents', category: 'infra', icon: Search, requiresOperator: false },
  { command: 'nl.history', description: 'NL parse history', category: 'infra', icon: Clock, requiresOperator: false },
];

// ═══ Infrastructure Module Commands (v9.1.0 ARCHITECT) ═══
export const MEMORY_MOD_COMMANDS: CommandDefinition[] = [
  { command: 'memory.status', description: 'Vector/RAG orchestration status', category: 'memory_mod', icon: Database, requiresOperator: false },
  { command: 'memory.recall', description: 'Semantic recall from vector store', category: 'memory_mod', icon: Search, requiresOperator: false, args: '<query> [limit]', example: 'memory.recall "security policy" 5' },
  { command: 'memory.ingest', description: 'Ingest document/data source', category: 'memory_mod', icon: Database, requiresOperator: true, args: '<source> [format]', example: 'memory.ingest docs/ pdf' },
  { command: 'memory.consolidate', description: 'Run memory consolidation cycle', category: 'memory_mod', icon: Database, requiresOperator: true },
  { command: 'memory.tiers', description: 'View memory tier distribution', category: 'memory_mod', icon: Layers, requiresOperator: false },
];

export const RELAY_MOD_COMMANDS: CommandDefinition[] = [
  { command: 'relay.status', description: 'Outbound effects hub status', category: 'relay_mod', icon: Send, requiresOperator: false },
  { command: 'relay.dispatch', description: 'Dispatch outbound webhook', category: 'relay_mod', icon: Send, requiresOperator: true, args: '<target_url> <payload>', example: 'relay.dispatch https://api.example.com/hook "{}"' },
  { command: 'relay.queue', description: 'View delivery queue', category: 'relay_mod', icon: List, requiresOperator: false, args: '[status]' },
  { command: 'relay.deliveries', description: 'Recent delivery history', category: 'relay_mod', icon: Activity, requiresOperator: false, args: '[limit]' },
  { command: 'relay.retry', description: 'Retry failed delivery', category: 'relay_mod', icon: PlayCircle, requiresOperator: true, args: '<delivery_id>' },
];

export const AUDIT_MOD_COMMANDS: CommandDefinition[] = [
  { command: 'audit.status', description: 'Immutable compliance ledger status', category: 'audit_mod', icon: FileCheck, requiresOperator: false },
  { command: 'audit.query', description: 'Query audit trail', category: 'audit_mod', icon: Search, requiresOperator: false, args: '[module] [action] [since]', example: 'audit.query defense block 24h' },
  { command: 'audit.verify', description: 'Verify hash chain integrity', category: 'audit_mod', icon: Shield, requiresOperator: false },
  { command: 'audit.report', description: 'Generate compliance report', category: 'audit_mod', icon: FileText, requiresOperator: false, args: '[standard]', example: 'audit.report SOC2' },
  { command: 'audit.export', description: 'Export audit log', category: 'audit_mod', icon: Database, requiresOperator: true, args: '[format] [since]' },
];

export const IDENTITY_MOD_COMMANDS: CommandDefinition[] = [
  { command: 'identity.status', description: 'Universal actor attribution status', category: 'identity_mod', icon: Key, requiresOperator: false },
  { command: 'identity.whoami', description: 'Current actor identity + signature', category: 'identity_mod', icon: Users, requiresOperator: false },
  { command: 'identity.resolve', description: 'Resolve actor by ID', category: 'identity_mod', icon: Search, requiresOperator: false, args: '<actor_id>' },
  { command: 'identity.sign', description: 'Sign action with identity', category: 'identity_mod', icon: Lock, requiresOperator: true, args: '<action> <payload>' },
  { command: 'identity.verify', description: 'Verify identity signature', category: 'identity_mod', icon: Shield, requiresOperator: false, args: '<signature>' },
];

export const ECONOMY_MOD_COMMANDS: CommandDefinition[] = [
  { command: 'economy.status', description: 'Cost attribution & budget status', category: 'economy_mod', icon: CreditCard, requiresOperator: false },
  { command: 'economy.cost', description: 'Track cost for operation', category: 'economy_mod', icon: CreditCard, requiresOperator: false, args: '[module] [period]', example: 'economy.cost nexus 24h' },
  { command: 'economy.budget', description: 'View/set budget limits', category: 'economy_mod', icon: Gauge, requiresOperator: false, args: '[module]' },
  { command: 'economy.report', description: 'Cost attribution report', category: 'economy_mod', icon: Activity, requiresOperator: false, args: '[period]', example: 'economy.report 7d' },
  { command: 'economy.forecast', description: 'Spend forecast', category: 'economy_mod', icon: Activity, requiresOperator: false, args: '[days]' },
];

export const SANDBOX_MOD_COMMANDS: CommandDefinition[] = [
  { command: 'sandbox.status', description: 'Isolated execution environment status', category: 'sandbox_mod', icon: Box, requiresOperator: false },
  { command: 'sandbox.create', description: 'Create new sandbox environment', category: 'sandbox_mod', icon: Box, requiresOperator: true, args: '[name] [ttl]', example: 'sandbox.create test-env 1h' },
  { command: 'sandbox.execute', description: 'Execute code in sandbox', category: 'sandbox_mod', icon: PlayCircle, requiresOperator: true, args: '<sandbox_id> <code>' },
  { command: 'sandbox.list', description: 'List active sandboxes', category: 'sandbox_mod', icon: List, requiresOperator: false },
  { command: 'sandbox.destroy', description: 'Destroy sandbox', category: 'sandbox_mod', icon: XCircle, requiresOperator: true, args: '<sandbox_id>' },
];

// PATCH — Distribution Patch Dispatch v8.5.0
export const PATCH_COMMANDS: CommandDefinition[] = [
  { command: 'patch.send', description: 'Dispatch a patch to LNCHBL', category: 'infra', icon: Send, requiresOperator: true, args: '<version> <changelog> [capabilities] [engines]', example: 'patch.send 2.1.0 "Enable dream synthesis" dream_synthesis reasoning_engine' },
  { command: 'patch.status', description: 'List recent patches from cmpsbl_patches', category: 'infra', icon: Activity, requiresOperator: false },
  { command: 'patch.publish', description: 'Publish a draft patch by ID and dispatch to LNCHBL', category: 'infra', icon: Send, requiresOperator: true, args: '<patch_id>', example: 'patch.publish abc123' },
  { command: 'patch.help', description: 'Show patch dispatch commands', category: 'infra', icon: Terminal, requiresOperator: false },
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
