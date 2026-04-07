/**
 * LexRuleSelector — Configure Lex governance rules before Layer 2 attachment
 * The conscience of Mana — users choose what rules govern their software.
 */

import { useState, useMemo } from 'react';
import { Shield, Eye, Zap, Scale, Activity, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import type { ManaCapability } from '@/lib/mana/types';

export interface LexRuleConfig {
  capability: ManaCapability;
  enabled: boolean;
  label: string;
  description: string;
  icon: typeof Shield;
  color: string;
}

const DEFAULT_RULES: LexRuleConfig[] = [
  {
    capability: 'defense_gate',
    enabled: true,
    label: 'DEFENSE Gates',
    description: 'Block exploit paths and validate inputs at function boundaries. Lex denies suspicious invocations.',
    icon: Shield,
    color: 'text-[hsl(var(--destructive))]',
  },
  {
    capability: 'beacon_telemetry',
    enabled: true,
    label: 'BEACON Telemetry',
    description: 'Observe usage patterns — latency, argument counts, return types — without modifying behavior.',
    icon: Activity,
    color: 'text-[hsl(var(--neon-cyan,190_100%_60%))]',
  },
  {
    capability: 'governance_hook',
    enabled: false,
    label: 'Governance Hooks',
    description: 'Policy enforcement on state-mutating functions. Lex can deny operations that violate governance.',
    icon: Scale,
    color: 'text-[hsl(var(--neon-purple,270_100%_70%))]',
  },
  {
    capability: 'shadow_rule',
    enabled: false,
    label: 'Shadow Rules',
    description: 'Override function outputs silently. The host code runs but the result is governed by Lex.',
    icon: Eye,
    color: 'text-[hsl(var(--neon-amber,40_100%_60%))]',
  },
  {
    capability: 'circuit_breaker',
    enabled: true,
    label: 'Circuit Breaker',
    description: 'Automatic fault isolation. If a function fails repeatedly, the circuit opens to prevent cascades.',
    icon: Zap,
    color: 'text-green-500',
  },
  {
    capability: 'audit_trail',
    enabled: false,
    label: 'Audit Trail',
    description: 'Immutable invocation logging with timestamps and caller context. Full forensic traceability.',
    icon: AlertTriangle,
    color: 'text-[hsl(var(--neon-blue,210_100%_60%))]',
  },
];

interface Props {
  functionCount: number;
  hostName: string;
  onComplete: (rules: LexRuleConfig[]) => void;
}

export function LexRuleSelector({ functionCount, hostName, onComplete }: Props) {
  const [rules, setRules] = useState<LexRuleConfig[]>(DEFAULT_RULES);
  const [lexMode, setLexMode] = useState<'permissive' | 'strict'>('permissive');

  const enabledCount = useMemo(() => rules.filter(r => r.enabled).length, [rules]);
  const estimatedPoints = useMemo(() => functionCount * enabledCount, [functionCount, enabledCount]);

  const toggleRule = (capability: ManaCapability) => {
    setRules(prev => prev.map(r =>
      r.capability === capability ? { ...r, enabled: !r.enabled } : r
    ));
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-bold mb-1">Configure Lex — The Conscience</h3>
        <p className="text-sm text-muted-foreground">
          Choose which Layer 2 capabilities Lex enforces on <span className="font-semibold text-foreground">{hostName}</span>.
          {' '}Each enabled capability wraps every discovered function.
        </p>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Host functions', value: functionCount },
          { label: 'Active rules', value: enabledCount },
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

      {/* Rule cards */}
      <div className="space-y-3">
        {rules.map(rule => (
          <Card
            key={rule.capability}
            className={cn(
              "transition-all cursor-pointer",
              rule.enabled
                ? "border-primary/30 bg-primary/[0.03] shadow-sm"
                : "border-border/20 bg-card/30 opacity-70"
            )}
            onClick={() => toggleRule(rule.capability)}
          >
            <CardContent className="p-4 flex items-center gap-4">
              <div className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                rule.enabled ? "bg-primary/10" : "bg-muted/20"
              )}>
                <rule.icon className={cn("w-5 h-5", rule.enabled ? rule.color : "text-muted-foreground/50")} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold">{rule.label}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{rule.description}</p>
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

      <Button
        onClick={() => onComplete(rules)}
        disabled={enabledCount === 0}
        className="w-full gap-2"
        size="lg"
      >
        <CheckCircle2 className="w-4 h-4" />
        Proceed to Attachment ({enabledCount} rules · ~{estimatedPoints} points)
      </Button>
    </div>
  );
}
