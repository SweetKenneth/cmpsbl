/**
 * LexRuleSelector — Configure Lex governance rules before Layer 2 attachment
 * The conscience of Mana — users choose what rules govern their software.
 * 
 * 32 granular capabilities organized by family.
 */

import { useState, useMemo } from 'react';
import {
  Shield, Eye, Zap, Scale, Activity, AlertTriangle, CheckCircle2,
  Lock, Timer, BarChart3, FileCheck, Gauge, Bug, GitBranch,
  ShieldCheck, Gavel, UserCheck, Fingerprint, RotateCcw, Clock,
  Box, Umbrella, FileText, Camera, Microscope, Filter, EyeOff,
  Brain, TrendingDown, Search, ChevronDown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import type { ManaCapability } from '@/lib/mana/types';

export interface LexRuleConfig {
  capability: ManaCapability;
  enabled: boolean;
  label: string;
  description: string;
  icon: typeof Shield;
  color: string;
  family: string;
}

interface CapabilityFamily {
  name: string;
  icon: typeof Shield;
  color: string;
  rules: LexRuleConfig[];
}

const DEFAULT_RULES: LexRuleConfig[] = [
  // ── DEFENSE family ──
  { capability: 'defense_gate', enabled: true, label: 'Defense Gate', description: 'Block exploit paths and validate inputs at function boundaries.', icon: Shield, color: 'text-[hsl(var(--destructive))]', family: 'DEFENSE' },
  { capability: 'input_sanitizer', enabled: true, label: 'Input Sanitizer', description: 'Strip XSS, script injection, and dangerous patterns from string arguments.', icon: ShieldCheck, color: 'text-[hsl(var(--destructive))]', family: 'DEFENSE' },
  { capability: 'threat_scorer', enabled: false, label: 'Threat Scorer', description: 'Assign a 0–100 threat score per invocation based on argument analysis.', icon: Gauge, color: 'text-[hsl(var(--destructive))]', family: 'DEFENSE' },
  { capability: 'rate_limiter', enabled: false, label: 'Rate Limiter', description: 'Throttle excessive invocations — configurable calls/second ceiling.', icon: Timer, color: 'text-[hsl(var(--destructive))]', family: 'DEFENSE' },
  { capability: 'payload_validator', enabled: false, label: 'Payload Validator', description: 'Enforce argument size and structure constraints before execution.', icon: FileCheck, color: 'text-[hsl(var(--destructive))]', family: 'DEFENSE' },
  { capability: 'injection_guard', enabled: true, label: 'Injection Guard', description: 'Block SQL injection, template injection, and eval-based attacks.', icon: Lock, color: 'text-[hsl(var(--destructive))]', family: 'DEFENSE' },

  // ── BEACON family ──
  { capability: 'beacon_telemetry', enabled: true, label: 'Beacon Telemetry', description: 'Observe usage patterns — latency, argument counts, return types.', icon: Activity, color: 'text-[hsl(var(--neon-cyan,190_100%_60%))]', family: 'BEACON' },
  { capability: 'latency_profiler', enabled: false, label: 'Latency Profiler', description: 'Percentile-aware profiling — track p50/p95/p99 execution timing.', icon: BarChart3, color: 'text-[hsl(var(--neon-cyan,190_100%_60%))]', family: 'BEACON' },
  { capability: 'error_tracker', enabled: true, label: 'Error Tracker', description: 'Categorize and count errors by type with rolling failure rates.', icon: Bug, color: 'text-[hsl(var(--neon-cyan,190_100%_60%))]', family: 'BEACON' },
  { capability: 'throughput_meter', enabled: false, label: 'Throughput Meter', description: 'Measure real-time calls/second for capacity planning.', icon: TrendingDown, color: 'text-[hsl(var(--neon-cyan,190_100%_60%))]', family: 'BEACON' },
  { capability: 'dependency_mapper', enabled: false, label: 'Dependency Mapper', description: 'Trace inter-function call chains and argument flow.', icon: GitBranch, color: 'text-[hsl(var(--neon-cyan,190_100%_60%))]', family: 'BEACON' },

  // ── GOVERNANCE family ──
  { capability: 'governance_hook', enabled: false, label: 'Governance Hook', description: 'Policy enforcement on state-mutating functions via Lex verdicts.', icon: Scale, color: 'text-[hsl(var(--neon-purple,270_100%_70%))]', family: 'GOVERNANCE' },
  { capability: 'mutation_guard', enabled: false, label: 'Mutation Guard', description: 'Freeze input objects to detect and prevent unauthorized mutations.', icon: Fingerprint, color: 'text-[hsl(var(--neon-purple,270_100%_70%))]', family: 'GOVERNANCE' },
  { capability: 'policy_enforcer', enabled: false, label: 'Policy Enforcer', description: 'Declarative rule-based gating — deny/allow/observe per function.', icon: Gavel, color: 'text-[hsl(var(--neon-purple,270_100%_70%))]', family: 'GOVERNANCE' },
  { capability: 'consent_gate', enabled: false, label: 'Consent Gate', description: 'Require explicit consent before executing sensitive operations.', icon: UserCheck, color: 'text-[hsl(var(--neon-purple,270_100%_70%))]', family: 'GOVERNANCE' },
  { capability: 'compliance_check', enabled: false, label: 'Compliance Check', description: 'Regulatory verification — GDPR/HIPAA/PCI compliance auditing.', icon: Search, color: 'text-[hsl(var(--neon-purple,270_100%_70%))]', family: 'GOVERNANCE' },
  { capability: 'access_controller', enabled: false, label: 'Access Controller', description: 'Role-based access control enforced at function boundaries.', icon: Lock, color: 'text-[hsl(var(--neon-purple,270_100%_70%))]', family: 'GOVERNANCE' },

  // ── FAILSAFE family ──
  { capability: 'circuit_breaker', enabled: true, label: 'Circuit Breaker', description: 'Auto fault isolation — opens circuit after repeated failures.', icon: Zap, color: 'text-green-500', family: 'FAILSAFE' },
  { capability: 'retry_handler', enabled: false, label: 'Retry Handler', description: 'Automatic retry with configurable backoff on transient failures.', icon: RotateCcw, color: 'text-green-500', family: 'FAILSAFE' },
  { capability: 'timeout_guard', enabled: false, label: 'Timeout Guard', description: 'Enforce execution time limits — kill long-running operations.', icon: Clock, color: 'text-green-500', family: 'FAILSAFE' },
  { capability: 'bulkhead_isolator', enabled: false, label: 'Bulkhead Isolator', description: 'Concurrency limits — prevent cascade failures across domains.', icon: Box, color: 'text-green-500', family: 'FAILSAFE' },
  { capability: 'fallback_provider', enabled: false, label: 'Fallback Provider', description: 'Graceful degradation — return safe defaults on failure.', icon: Umbrella, color: 'text-green-500', family: 'FAILSAFE' },

  // ── AUDIT family ──
  { capability: 'audit_trail', enabled: false, label: 'Audit Trail', description: 'Immutable invocation logging with timestamps and caller context.', icon: AlertTriangle, color: 'text-[hsl(var(--neon-blue,210_100%_60%))]', family: 'AUDIT' },
  { capability: 'call_logger', enabled: false, label: 'Call Logger', description: 'Structured invocation logging — argument types and counts.', icon: FileText, color: 'text-[hsl(var(--neon-blue,210_100%_60%))]', family: 'AUDIT' },
  { capability: 'state_snapshot', enabled: false, label: 'State Snapshot', description: 'Capture before/after state for mutation diffing and rollback.', icon: Camera, color: 'text-[hsl(var(--neon-blue,210_100%_60%))]', family: 'AUDIT' },
  { capability: 'forensic_recorder', enabled: false, label: 'Forensic Recorder', description: 'Deep call-stack recording with unique call IDs for investigation.', icon: Microscope, color: 'text-[hsl(var(--neon-blue,210_100%_60%))]', family: 'AUDIT' },

  // ── SHADOW family ──
  { capability: 'shadow_rule', enabled: false, label: 'Shadow Rule', description: 'Override function outputs silently — result governed by Lex.', icon: Eye, color: 'text-[hsl(var(--neon-amber,40_100%_60%))]', family: 'SHADOW' },
  { capability: 'output_filter', enabled: false, label: 'Output Filter', description: 'Strip credit card numbers and sensitive patterns from outputs.', icon: Filter, color: 'text-[hsl(var(--neon-amber,40_100%_60%))]', family: 'SHADOW' },
  { capability: 'data_masker', enabled: false, label: 'Data Masker', description: 'PII/PHI masking — emails, SSNs, phone numbers in arguments.', icon: EyeOff, color: 'text-[hsl(var(--neon-amber,40_100%_60%))]', family: 'SHADOW' },

  // ── DREAM family ──
  { capability: 'dream_synthesis', enabled: false, label: 'Dream Synthesis', description: 'Sub-threshold pattern collection for algorithmic insight emergence.', icon: Brain, color: 'text-[hsl(var(--neon-pink,330_100%_65%))]', family: 'DREAM' },
  { capability: 'anomaly_detector', enabled: false, label: 'Anomaly Detector', description: 'Statistical z-score anomaly flagging on execution timing.', icon: Brain, color: 'text-[hsl(var(--neon-pink,330_100%_65%))]', family: 'DREAM' },
  { capability: 'drift_monitor', enabled: false, label: 'Drift Monitor', description: 'Behavioral change detection — flags return type drift over time.', icon: TrendingDown, color: 'text-[hsl(var(--neon-pink,330_100%_65%))]', family: 'DREAM' },

  // ── MEMORY family ──
  { capability: 'memory_cache', enabled: false, label: 'Memory Cache', description: 'Memoize function results with TTL-controlled retention.', icon: Brain, color: 'text-violet-400', family: 'MEMORY' },
  { capability: 'memory_ttl', enabled: false, label: 'Memory TTL', description: 'Time-to-live enforcement on cached data — automatic eviction.', icon: Clock, color: 'text-violet-400', family: 'MEMORY' },
  { capability: 'memory_state_track', enabled: false, label: 'State Tracker', description: 'Monitor state transitions for audit and rollback.', icon: Camera, color: 'text-violet-400', family: 'MEMORY' },

  // ── NEXUS family ──
  { capability: 'nexus_router', enabled: false, label: 'Nexus Router', description: 'Model-agnostic AI routing — optimal provider per task.', icon: GitBranch, color: 'text-indigo-400', family: 'NEXUS' },
  { capability: 'nexus_cost_gate', enabled: false, label: 'Cost Gate', description: 'Per-call and daily budget enforcement for AI operations.', icon: Timer, color: 'text-indigo-400', family: 'NEXUS' },
  { capability: 'nexus_fallback', enabled: false, label: 'Nexus Fallback', description: 'Automatic provider fallback on degraded endpoints.', icon: Umbrella, color: 'text-indigo-400', family: 'NEXUS' },

  // ── BRAIN family ──
  { capability: 'brain_reasoning_trace', enabled: false, label: 'Reasoning Trace', description: 'Capture multi-step inference chains for auditability.', icon: Brain, color: 'text-fuchsia-400', family: 'BRAIN' },
  { capability: 'brain_context_guard', enabled: false, label: 'Context Guard', description: 'Enforce token/context window limits before LLM calls.', icon: Lock, color: 'text-fuchsia-400', family: 'BRAIN' },
  { capability: 'brain_confidence_gate', enabled: false, label: 'Confidence Gate', description: 'Flag low-confidence outputs for human review.', icon: Gauge, color: 'text-fuchsia-400', family: 'BRAIN' },

  // ── ORACLE family ──
  { capability: 'oracle_predictor', enabled: false, label: 'Predictor', description: 'Capture forecast accuracy for predictive functions.', icon: TrendingDown, color: 'text-amber-400', family: 'ORACLE' },
  { capability: 'oracle_anomaly_alert', enabled: false, label: 'Anomaly Alert', description: 'Statistical outlier detection on operational data.', icon: AlertTriangle, color: 'text-amber-400', family: 'ORACLE' },
  { capability: 'oracle_causal_trace', enabled: false, label: 'Causal Trace', description: 'Map cause-effect chains to identify root causes.', icon: GitBranch, color: 'text-amber-400', family: 'ORACLE' },

  // ── CORTEX family ──
  { capability: 'cortex_orchestrator', enabled: false, label: 'Orchestrator', description: 'DAG-based multi-step task coordination.', icon: Activity, color: 'text-sky-400', family: 'CORTEX' },
  { capability: 'cortex_resource_gate', enabled: false, label: 'Resource Gate', description: 'Govern compute/memory allocation per task.', icon: Box, color: 'text-sky-400', family: 'CORTEX' },
  { capability: 'cortex_planning_trace', enabled: false, label: 'Planning Trace', description: 'Track goal decomposition and re-planning decisions.', icon: FileText, color: 'text-sky-400', family: 'CORTEX' },

  // ── IMMUNITY family ──
  { capability: 'immunity_self_heal', enabled: false, label: 'Self-Heal', description: 'Autonomous error recovery after consecutive failures.', icon: Umbrella, color: 'text-emerald-400', family: 'IMMUNITY' },
  { capability: 'immunity_quarantine', enabled: false, label: 'Quarantine', description: 'Isolate failing components to prevent cascade failures.', icon: Box, color: 'text-emerald-400', family: 'IMMUNITY' },
  { capability: 'immunity_vaccination', enabled: false, label: 'Vaccination', description: 'Record failure patterns — same bug never hits twice.', icon: ShieldCheck, color: 'text-emerald-400', family: 'IMMUNITY' },

  // ── IDENTITY family ──
  { capability: 'identity_session_bind', enabled: false, label: 'Session Bind', description: 'Bind sessions with device fingerprinting and attestation.', icon: Fingerprint, color: 'text-teal-400', family: 'IDENTITY' },
  { capability: 'identity_auth_gate', enabled: false, label: 'Auth Gate', description: 'Identity verification before function execution.', icon: Lock, color: 'text-teal-400', family: 'IDENTITY' },

  // ── SOVEREIGN family ──
  { capability: 'sovereign_encrypt', enabled: false, label: 'Encrypt', description: 'Data sovereignty and AES-256 encryption at boundaries.', icon: Lock, color: 'text-cyan-400', family: 'SOVEREIGN' },
  { capability: 'sovereign_tenant_isolate', enabled: false, label: 'Tenant Isolate', description: 'Cryptographic data separation between tenants.', icon: Box, color: 'text-cyan-400', family: 'SOVEREIGN' },

  // ── ACCESS family ──
  { capability: 'access_rbac_gate', enabled: false, label: 'RBAC Gate', description: 'Role-based permission enforcement at function boundaries.', icon: Lock, color: 'text-orange-400', family: 'ACCESS' },
  { capability: 'access_api_key_check', enabled: false, label: 'API Key Check', description: 'API key validation, rotation, and usage tracking.', icon: FileCheck, color: 'text-orange-400', family: 'ACCESS' },

  // ── EVOLUTION family ──
  { capability: 'evolution_patch', enabled: false, label: 'Evolution Patch', description: 'Governed self-improvement — validated mutations.', icon: RotateCcw, color: 'text-lime-400', family: 'EVOLUTION' },
  { capability: 'evolution_rollback', enabled: false, label: 'Rollback', description: 'Instant rollback to any previous state.', icon: RotateCcw, color: 'text-lime-400', family: 'EVOLUTION' },

  // ── CONSCIENCE family ──
  { capability: 'conscience_ethics_gate', enabled: false, label: 'Ethics Gate', description: 'Evaluate actions against configurable ethical guidelines.', icon: Scale, color: 'text-rose-400', family: 'CONSCIENCE' },
  { capability: 'conscience_bias_check', enabled: false, label: 'Bias Check', description: 'Detect and flag biased outputs before delivery.', icon: Search, color: 'text-rose-400', family: 'CONSCIENCE' },

  // ── FORGE family ──
  { capability: 'forge_package_seal', enabled: false, label: 'Package Seal', description: 'Integrity verification on export artifacts.', icon: FileCheck, color: 'text-stone-400', family: 'FORGE' },
  { capability: 'forge_integrity_check', enabled: false, label: 'Integrity Check', description: 'SHA-256 verification of packaged artifacts.', icon: ShieldCheck, color: 'text-stone-400', family: 'FORGE' },

  // ── HARVEST family ──
  { capability: 'harvest_quality_gate', enabled: false, label: 'Quality Gate', description: 'Validate ingested data quality — freshness, authority, bias.', icon: Filter, color: 'text-yellow-400', family: 'HARVEST' },
  { capability: 'harvest_dedup', enabled: false, label: 'Deduplication', description: 'Prevent duplicate data from entering the pipeline.', icon: GitBranch, color: 'text-yellow-400', family: 'HARVEST' },

  // ── VISION family ──
  { capability: 'vision_perf_monitor', enabled: false, label: 'Perf Monitor', description: 'Core Web Vitals tracking — LCP, CLS, INP.', icon: BarChart3, color: 'text-pink-400', family: 'VISION' },
  { capability: 'vision_accessibility_check', enabled: false, label: 'Accessibility', description: 'WCAG compliance validation and ARIA checking.', icon: Eye, color: 'text-pink-400', family: 'VISION' },

  // ── RELAY family ──
  { capability: 'relay_sync', enabled: false, label: 'Relay Sync', description: 'Real-time state synchronization across clients.', icon: Activity, color: 'text-blue-400', family: 'RELAY' },
  { capability: 'relay_offline_cache', enabled: false, label: 'Offline Cache', description: 'Service worker cache with background sync.', icon: Box, color: 'text-blue-400', family: 'RELAY' },

  // ── TREATY family ──
  { capability: 'treaty_contract_check', enabled: false, label: 'Contract Check', description: 'Inter-service contract enforcement and versioning.', icon: Gavel, color: 'text-slate-400', family: 'TREATY' },
  { capability: 'treaty_sla_monitor', enabled: false, label: 'SLA Monitor', description: 'Track latency, uptime, and throughput SLAs.', icon: BarChart3, color: 'text-slate-400', family: 'TREATY' },

  // ── Remaining families with universal telemetry ──
  { capability: 'echo_amplifier', enabled: false, label: 'Echo Amplifier', description: 'Amplify recurring success patterns and dampen failures.', icon: Activity, color: 'text-purple-400', family: 'ECHO' },
  { capability: 'echo_resonance', enabled: false, label: 'Resonance Tuner', description: 'Self-calibrating feedback loop gain control.', icon: Activity, color: 'text-purple-400', family: 'ECHO' },
  { capability: 'phantom_stealth', enabled: false, label: 'Stealth Mode', description: 'Minimal-footprint execution — no external logging.', icon: EyeOff, color: 'text-gray-400', family: 'PHANTOM' },
  { capability: 'phantom_fingerprint_mask', enabled: false, label: 'Fingerprint Mask', description: 'Randomize request signatures to prevent profiling.', icon: Fingerprint, color: 'text-gray-400', family: 'PHANTOM' },
  { capability: 'lingua_normalizer', enabled: false, label: 'Lingua Normalizer', description: 'Multilingual text normalization and encoding.', icon: FileText, color: 'text-green-400', family: 'LINGUA' },
  { capability: 'lingua_encoding_guard', enabled: false, label: 'Encoding Guard', description: 'Enforce valid UTF-8 and prevent encoding attacks.', icon: ShieldCheck, color: 'text-green-400', family: 'LINGUA' },
  { capability: 'nerve_priority_router', enabled: false, label: 'Priority Router', description: 'Route signals by urgency — critical alerts bypass queue.', icon: Zap, color: 'text-red-400', family: 'NERVE' },
  { capability: 'nerve_backpressure', enabled: false, label: 'Backpressure', description: 'Adaptive overload protection for signal pipelines.', icon: Timer, color: 'text-red-400', family: 'NERVE' },
  { capability: 'compass_intent_resolver', enabled: false, label: 'Intent Resolver', description: 'Disambiguate user intent through classification.', icon: Search, color: 'text-sky-300', family: 'COMPASS' },
  { capability: 'compass_goal_validator', enabled: false, label: 'Goal Validator', description: 'Validate actions align with stated objectives.', icon: CheckCircle2, color: 'text-sky-300', family: 'COMPASS' },
  { capability: 'sandbox_isolator', enabled: false, label: 'Sandbox Isolator', description: 'Execute untrusted code in isolated environments.', icon: Box, color: 'text-amber-300', family: 'SANDBOX' },
  { capability: 'sandbox_resource_limit', enabled: false, label: 'Resource Limit', description: 'Enforce CPU/memory limits on sandboxed execution.', icon: Timer, color: 'text-amber-300', family: 'SANDBOX' },
  { capability: 'ripple_impact_tracer', enabled: false, label: 'Impact Tracer', description: 'Trace downstream effects of changes across the graph.', icon: GitBranch, color: 'text-orange-300', family: 'RIPPLE' },
  { capability: 'ripple_dependency_check', enabled: false, label: 'Dependency Check', description: 'Map transitive dependencies and fragile paths.', icon: GitBranch, color: 'text-orange-300', family: 'RIPPLE' },
  { capability: 'inclusive_i18n_guard', enabled: false, label: 'i18n Guard', description: 'RTL layout support and cultural sensitivity checks.', icon: FileText, color: 'text-teal-300', family: 'INCLUSIVE' },
  { capability: 'inclusive_contrast_check', enabled: false, label: 'Contrast Check', description: 'High contrast and dyslexia mode rendering checks.', icon: Eye, color: 'text-teal-300', family: 'INCLUSIVE' },
  { capability: 'integration_bridge', enabled: false, label: 'Integration Bridge', description: 'External service connectors with OAuth management.', icon: GitBranch, color: 'text-indigo-300', family: 'INTEGRATION' },
  { capability: 'integration_webhook', enabled: false, label: 'Webhook Handler', description: 'Event-driven integration endpoint management.', icon: Zap, color: 'text-indigo-300', family: 'INTEGRATION' },
  { capability: 'atlas_complexity_check', enabled: false, label: 'Complexity Check', description: 'Identify components with excessive coupling.', icon: Search, color: 'text-emerald-300', family: 'ATLAS' },
  { capability: 'atlas_dependency_map', enabled: false, label: 'Dependency Map', description: 'Live dependency map of component relationships.', icon: GitBranch, color: 'text-emerald-300', family: 'ATLAS' },
  { capability: 'medic_health_check', enabled: false, label: 'Health Check', description: 'Runtime health diagnostics and liveness probes.', icon: Activity, color: 'text-lime-300', family: 'MEDIC' },
  { capability: 'medic_memory_guard', enabled: false, label: 'Memory Guard', description: 'Track heap growth and detect memory leaks.', icon: Brain, color: 'text-lime-300', family: 'MEDIC' },
  { capability: 'system_telemetry', enabled: false, label: 'System Telemetry', description: 'Structured telemetry pipeline — zero-config dashboards.', icon: Activity, color: 'text-cyan-300', family: 'SYSTEM' },
  { capability: 'system_feature_flag', enabled: false, label: 'Feature Flags', description: 'Runtime feature toggles with kill-switches on error.', icon: Zap, color: 'text-cyan-300', family: 'SYSTEM' },
  { capability: 'reflex_circuit_breaker', enabled: false, label: 'Reflex Breaker', description: 'Sub-millisecond circuit breakers with exponential backoff.', icon: Zap, color: 'text-rose-300', family: 'REFLEX' },
  { capability: 'reflex_fallback_chain', enabled: false, label: 'Fallback Chain', description: 'Multi-tier fallback — cached, degraded, static.', icon: Umbrella, color: 'text-rose-300', family: 'REFLEX' },
  { capability: 'core_lifecycle_guard', enabled: false, label: 'Lifecycle Guard', description: 'Enforce valid state transitions — no impossible states.', icon: Lock, color: 'text-stone-300', family: 'CORE' },
  { capability: 'core_state_validator', enabled: false, label: 'State Validator', description: 'Validate state consistency on every transition.', icon: CheckCircle2, color: 'text-stone-300', family: 'CORE' },
];

const FAMILY_META: Record<string, { icon: typeof Shield; color: string; description: string }> = {
  DEFENSE: { icon: Shield, color: 'text-[hsl(var(--destructive))]', description: 'Input protection & threat prevention' },
  BEACON: { icon: Activity, color: 'text-[hsl(var(--neon-cyan,190_100%_60%))]', description: 'Observability & performance monitoring' },
  GOVERNANCE: { icon: Scale, color: 'text-[hsl(var(--neon-purple,270_100%_70%))]', description: 'Policy enforcement & access control' },
  FAILSAFE: { icon: Zap, color: 'text-green-500', description: 'Fault isolation & resilience' },
  AUDIT: { icon: AlertTriangle, color: 'text-[hsl(var(--neon-blue,210_100%_60%))]', description: 'Provenance & forensic traceability' },
  SHADOW: { icon: Eye, color: 'text-[hsl(var(--neon-amber,40_100%_60%))]', description: 'Output control & data masking' },
  DREAM: { icon: Brain, color: 'text-[hsl(var(--neon-pink,330_100%_65%))]', description: 'Algorithmic pattern emergence' },
  MEMORY: { icon: Brain, color: 'text-violet-400', description: 'Semantic memory & caching' },
  NEXUS: { icon: GitBranch, color: 'text-indigo-400', description: 'AI routing & cost control' },
  BRAIN: { icon: Brain, color: 'text-fuchsia-400', description: 'Reasoning & confidence gating' },
  ORACLE: { icon: TrendingDown, color: 'text-amber-400', description: 'Prediction & causal analysis' },
  CORTEX: { icon: Activity, color: 'text-sky-400', description: 'Task orchestration & planning' },
  IMMUNITY: { icon: Umbrella, color: 'text-emerald-400', description: 'Self-healing & quarantine' },
  IDENTITY: { icon: Fingerprint, color: 'text-teal-400', description: 'Session binding & auth' },
  SOVEREIGN: { icon: Lock, color: 'text-cyan-400', description: 'Encryption & data sovereignty' },
  ACCESS: { icon: Lock, color: 'text-orange-400', description: 'RBAC & API key management' },
  EVOLUTION: { icon: RotateCcw, color: 'text-lime-400', description: 'Governed self-improvement' },
  CONSCIENCE: { icon: Scale, color: 'text-rose-400', description: 'Ethics & bias detection' },
  FORGE: { icon: FileCheck, color: 'text-stone-400', description: 'Artifact packaging & integrity' },
  HARVEST: { icon: Filter, color: 'text-yellow-400', description: 'Data ingestion & quality' },
  VISION: { icon: BarChart3, color: 'text-pink-400', description: 'Performance & accessibility' },
  RELAY: { icon: Activity, color: 'text-blue-400', description: 'Real-time sync & offline' },
  TREATY: { icon: Gavel, color: 'text-slate-400', description: 'Contract & SLA enforcement' },
  ECHO: { icon: Activity, color: 'text-purple-400', description: 'Signal amplification' },
  PHANTOM: { icon: EyeOff, color: 'text-gray-400', description: 'Stealth operations' },
  LINGUA: { icon: FileText, color: 'text-green-400', description: 'Multilingual processing' },
  NERVE: { icon: Zap, color: 'text-red-400', description: 'Priority signal routing' },
  COMPASS: { icon: Search, color: 'text-sky-300', description: 'Intent disambiguation' },
  SANDBOX: { icon: Box, color: 'text-amber-300', description: 'Isolated execution' },
  RIPPLE: { icon: GitBranch, color: 'text-orange-300', description: 'Change impact analysis' },
  INCLUSIVE: { icon: Eye, color: 'text-teal-300', description: 'Accessibility & i18n' },
  INTEGRATION: { icon: GitBranch, color: 'text-indigo-300', description: 'External service connectors' },
  ATLAS: { icon: Search, color: 'text-emerald-300', description: 'Dependency & complexity mapping' },
  MEDIC: { icon: Activity, color: 'text-lime-300', description: 'Runtime health diagnostics' },
  SYSTEM: { icon: Activity, color: 'text-cyan-300', description: 'Telemetry & feature flags' },
  REFLEX: { icon: Zap, color: 'text-rose-300', description: 'Instant failure response' },
  CORE: { icon: Lock, color: 'text-stone-300', description: 'Lifecycle state management' },
};

interface Props {
  functionCount: number;
  hostName: string;
  onComplete: (rules: LexRuleConfig[]) => void;
}

export function LexRuleSelector({ functionCount, hostName, onComplete }: Props) {
  const [rules, setRules] = useState<LexRuleConfig[]>(DEFAULT_RULES);
  const [lexMode, setLexMode] = useState<'permissive' | 'strict'>('permissive');
  const [expandedFamilies, setExpandedFamilies] = useState<Set<string>>(new Set(['DEFENSE', 'FAILSAFE']));

  const enabledCount = useMemo(() => rules.filter(r => r.enabled).length, [rules]);
  const estimatedPoints = useMemo(() => functionCount * enabledCount, [functionCount, enabledCount]);

  const families = useMemo(() => {
    const grouped = new Map<string, LexRuleConfig[]>();
    for (const rule of rules) {
      const existing = grouped.get(rule.family) ?? [];
      existing.push(rule);
      grouped.set(rule.family, existing);
    }
    return Array.from(grouped.entries()).map(([name, familyRules]) => ({
      name,
      ...FAMILY_META[name],
      rules: familyRules,
    }));
  }, [rules]);

  const toggleRule = (capability: ManaCapability) => {
    setRules(prev => prev.map(r =>
      r.capability === capability ? { ...r, enabled: !r.enabled } : r
    ));
  };

  const toggleFamily = (familyName: string) => {
    setExpandedFamilies(prev => {
      const next = new Set(prev);
      if (next.has(familyName)) next.delete(familyName);
      else next.add(familyName);
      return next;
    });
  };

  const enableAllInFamily = (familyName: string) => {
    setRules(prev => prev.map(r =>
      r.family === familyName ? { ...r, enabled: true } : r
    ));
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-bold mb-1">Configure Lex — The Conscience</h3>
        <p className="text-sm text-muted-foreground">
          32 Layer 2 capabilities across 7 families for{' '}
          <span className="font-semibold text-foreground">{hostName}</span>.
        </p>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Host functions', value: functionCount },
          { label: 'Active capabilities', value: `${enabledCount}/32` },
          { label: 'Attachment points', value: estimatedPoints },
        ].map(s => (
          <div key={s.label} className="text-center p-3 rounded-xl bg-card/50 border border-border/30">
            <p className="text-2xl font-black text-primary">{s.value}</p>
            <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Lex Mode */}
      <div className="flex items-center justify-between p-4 rounded-xl bg-card/50 border border-border/30">
        <div>
          <p className="text-sm font-bold">Lex Mode</p>
          <p className="text-xs text-muted-foreground">
            {lexMode === 'permissive' ? 'Allow by default — only deny by rule' : 'Deny by default — only allow by rule'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className={cn("text-xs font-mono", lexMode === 'permissive' ? "text-green-500" : "text-muted-foreground")}>Permissive</span>
          <Switch
            checked={lexMode === 'strict'}
            onCheckedChange={(v) => setLexMode(v ? 'strict' : 'permissive')}
          />
          <span className={cn("text-xs font-mono", lexMode === 'strict' ? "text-[hsl(var(--destructive))]" : "text-muted-foreground")}>Strict</span>
        </div>
      </div>

      {/* Family sections */}
      <div className="space-y-3">
        {families.map(family => {
          const meta = FAMILY_META[family.name];
          const FamilyIcon = meta?.icon ?? Shield;
          const enabledInFamily = family.rules.filter(r => r.enabled).length;
          const isExpanded = expandedFamilies.has(family.name);

          return (
            <div key={family.name} className="rounded-xl border border-border/30 overflow-hidden">
              {/* Family header */}
              <button
                onClick={() => toggleFamily(family.name)}
                className="w-full flex items-center gap-3 p-4 bg-card/50 hover:bg-card/80 transition-colors"
              >
                <FamilyIcon className={cn("w-5 h-5 shrink-0", meta?.color)} />
                <div className="flex-1 text-left">
                  <p className="text-sm font-bold">{family.name}</p>
                  <p className="text-[10px] text-muted-foreground">{meta?.description}</p>
                </div>
                <span className={cn(
                  "text-xs font-mono px-2 py-0.5 rounded-full",
                  enabledInFamily > 0 ? "bg-primary/10 text-primary" : "bg-muted/20 text-muted-foreground"
                )}>
                  {enabledInFamily}/{family.rules.length}
                </span>
                <ChevronDown className={cn(
                  "w-4 h-4 text-muted-foreground transition-transform",
                  isExpanded && "rotate-180"
                )} />
              </button>

              {/* Capability rules */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="px-3 pb-3 space-y-2">
                      {/* Enable all button */}
                      {enabledInFamily < family.rules.length && (
                        <button
                          onClick={(e) => { e.stopPropagation(); enableAllInFamily(family.name); }}
                          className="text-[10px] font-mono text-primary hover:text-primary/80 transition-colors px-1 py-0.5"
                        >
                          Enable all {family.name} capabilities →
                        </button>
                      )}

                      {family.rules.map(rule => (
                        <Card
                          key={rule.capability}
                          className={cn(
                            "transition-all cursor-pointer border",
                            rule.enabled
                              ? "border-primary/30 bg-primary/[0.03] shadow-sm"
                              : "border-border/10 bg-card/20 opacity-60"
                          )}
                          onClick={() => toggleRule(rule.capability)}
                        >
                          <CardContent className="p-3 flex items-center gap-3">
                            <div className={cn(
                              "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                              rule.enabled ? "bg-primary/10" : "bg-muted/10"
                            )}>
                              <rule.icon className={cn("w-4 h-4", rule.enabled ? rule.color : "text-muted-foreground/40")} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold">{rule.label}</p>
                              <p className="text-[10px] text-muted-foreground leading-relaxed">{rule.description}</p>
                            </div>
                            <Switch
                              checked={rule.enabled}
                              onCheckedChange={() => toggleRule(rule.capability)}
                              onClick={(e) => e.stopPropagation()}
                            />
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      <Button
        onClick={() => onComplete(rules)}
        disabled={enabledCount === 0}
        className="w-full gap-2"
        size="lg"
      >
        <CheckCircle2 className="w-4 h-4" />
        Proceed to Attachment ({enabledCount} capabilities · ~{estimatedPoints} points)
      </Button>
    </div>
  );
}