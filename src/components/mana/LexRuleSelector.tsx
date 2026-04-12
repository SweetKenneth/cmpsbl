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
];

const FAMILY_META: Record<string, { icon: typeof Shield; color: string; description: string }> = {
  DEFENSE: { icon: Shield, color: 'text-[hsl(var(--destructive))]', description: 'Input protection & threat prevention' },
  BEACON: { icon: Activity, color: 'text-[hsl(var(--neon-cyan,190_100%_60%))]', description: 'Observability & performance monitoring' },
  GOVERNANCE: { icon: Scale, color: 'text-[hsl(var(--neon-purple,270_100%_70%))]', description: 'Policy enforcement & access control' },
  FAILSAFE: { icon: Zap, color: 'text-green-500', description: 'Fault isolation & resilience' },
  AUDIT: { icon: AlertTriangle, color: 'text-[hsl(var(--neon-blue,210_100%_60%))]', description: 'Provenance & forensic traceability' },
  SHADOW: { icon: Eye, color: 'text-[hsl(var(--neon-amber,40_100%_60%))]', description: 'Output control & data masking' },
  DREAM: { icon: Brain, color: 'text-[hsl(var(--neon-pink,330_100%_65%))]', description: 'Algorithmic pattern emergence' },
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