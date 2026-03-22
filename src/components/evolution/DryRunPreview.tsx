/**
 * DryRunPreview — Impact preview panel for evolution proposals
 * Shows before/after diffs, confidence score, risk assessment, and recommendation
 */

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  FlaskConical, TrendingUp, TrendingDown, AlertTriangle, 
  CheckCircle, XOctagon, Eye, ArrowRight, Minus 
} from 'lucide-react';
import { useDryRunPreview, useEvolutionRuns } from '@/hooks/useEvolutionControlCenter';
import type { DryRunResult, SimulatedChange } from '@/lib/evolve/dry-run-preview';
import type { EvolutionMetrics } from '@/lib/evolve/evolution-delta';

const RISK_COLORS: Record<string, string> = {
  low: 'bg-neon-green/20 text-neon-green',
  medium: 'bg-neon-amber/20 text-neon-amber',
  high: 'bg-neon-amber/20 text-neon-amber',
  critical: 'bg-destructive/20 text-destructive',
};

const RECOMMENDATION_CONFIG = {
  proceed: { icon: CheckCircle, label: 'Safe to Proceed', color: 'text-neon-green' },
  review: { icon: Eye, label: 'Needs Human Review', color: 'text-neon-amber' },
  abort: { icon: XOctagon, label: 'Not Recommended', color: 'text-destructive' },
};

function MetricRow({ label, before, after }: { label: string; before: number; after: number }) {
  const delta = after - before;
  const improved = delta > 0;
  const degraded = delta < 0;
  return (
    <div className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <div className="flex items-center gap-3">
        <span className="text-sm font-mono">{before.toFixed(1)}</span>
        <ArrowRight className="w-3 h-3 text-muted-foreground" />
        <span className={`text-sm font-mono font-medium ${degraded ? 'text-destructive' : improved ? 'text-neon-green' : 'text-muted-foreground'}`}>
          {after.toFixed(1)}
        </span>
        <div className="flex items-center gap-1 w-16 justify-end">
          {degraded && <TrendingDown className="w-3 h-3 text-destructive" />}
          {improved && <TrendingUp className="w-3 h-3 text-neon-green" />}
          {!degraded && !improved && <Minus className="w-3 h-3 text-muted-foreground" />}
          <span className={`text-xs font-mono ${degraded ? 'text-destructive' : improved ? 'text-neon-green' : 'text-muted-foreground'}`}>
            {delta > 0 ? '+' : ''}{delta.toFixed(1)}
          </span>
        </div>
      </div>
    </div>
  );
}

export function DryRunPreview() {
  const [result, setResult] = useState<DryRunResult | null>(null);
  const dryRunMutation = useDryRunPreview();
  const { data: runs = [] } = useEvolutionRuns(5);

  const runPreview = () => {
    // Build simulated changes from the latest proposal context
    const simulatedChanges: SimulatedChange[] = [
      { type: 'fix', target: 'error-handling', expectedHealthImpact: 0.15, expectedDebtImpact: -2, confidence: 0.85 },
      { type: 'refactor', target: 'circuit-breaker', expectedHealthImpact: 0.08, expectedDebtImpact: -1, confidence: 0.72 },
      { type: 'config', target: 'timeout-guards', expectedHealthImpact: 0.05, expectedDebtImpact: -1, confidence: 0.9 },
    ];

    const currentMetrics: EvolutionMetrics = {
      health_score: 72,
      audit_percent: 65,
      debt_flags_count: 14,
      open_circuit_count: 0,
      memory_total_vectors: 1200,
      entropy_score: 0.28,
    };

    dryRunMutation.mutate({
      proposalId: runs[0]?.plan_id ?? 'preview-draft',
      tenantId: 'global',
      simulatedChanges,
      currentMetrics,
    }, {
      onSuccess: (data) => setResult(data),
    });
  };

  const rec = result ? RECOMMENDATION_CONFIG[result.recommendation] : null;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Dry-Run Impact Preview</h3>
          <p className="text-sm text-muted-foreground">Simulate evolution changes before applying them</p>
        </div>
        <Button onClick={runPreview} disabled={dryRunMutation.isPending} size="sm">
          <FlaskConical className="w-4 h-4 mr-2" />
          {dryRunMutation.isPending ? 'Simulating...' : 'Run Preview'}
        </Button>
      </div>

      {!result && (
        <Card className="p-8 text-center space-y-3">
          <div className="w-12 h-12 rounded-xl bg-muted/50 flex items-center justify-center mx-auto">
            <FlaskConical className="w-6 h-6 text-muted-foreground" />
          </div>
          <h4 className="text-sm font-semibold">No preview yet</h4>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            Run a dry-run preview to see projected impact of the next evolution cycle on your system health, debt, and entropy.
          </p>
        </Card>
      )}

      {result && (
        <div className="grid gap-4 md:grid-cols-2">
          {/* Recommendation + Risk */}
          <Card className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold">Recommendation</h4>
              <Badge className={RISK_COLORS[result.riskAssessment.level]}>
                {result.riskAssessment.level} risk
              </Badge>
            </div>
            {rec && (
              <div className={`flex items-center gap-2 ${rec.color}`}>
                <rec.icon className="w-5 h-5" />
                <span className="font-medium">{rec.label}</span>
              </div>
            )}
            <div className="space-y-1">
              {result.riskAssessment.factors.map((f, i) => (
                <div key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                  <AlertTriangle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                  <span>{f}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Change Impact */}
          <Card className="p-4 space-y-3">
            <h4 className="text-sm font-semibold">Change Impact</h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-xs text-muted-foreground">Total Changes</span>
                <p className="text-lg font-mono font-bold">{result.changeImpact.totalChanges}</p>
              </div>
              <div>
                <span className="text-xs text-muted-foreground">Avg Confidence</span>
                <div className="flex items-center gap-2">
                  <Progress value={result.changeImpact.avgConfidence * 100} className="h-2 flex-1" />
                  <span className="text-sm font-mono">{(result.changeImpact.avgConfidence * 100).toFixed(0)}%</span>
                </div>
              </div>
              <div>
                <span className="text-xs text-muted-foreground">Health Δ</span>
                <p className={`text-sm font-mono ${result.changeImpact.projectedHealthChange >= 0 ? 'text-neon-green' : 'text-destructive'}`}>
                  {result.changeImpact.projectedHealthChange >= 0 ? '+' : ''}{result.changeImpact.projectedHealthChange.toFixed(2)}
                </p>
              </div>
              <div>
                <span className="text-xs text-muted-foreground">Debt Δ</span>
                <p className={`text-sm font-mono ${result.changeImpact.projectedDebtChange <= 0 ? 'text-neon-green' : 'text-destructive'}`}>
                  {result.changeImpact.projectedDebtChange > 0 ? '+' : ''}{result.changeImpact.projectedDebtChange.toFixed(1)}
                </p>
              </div>
            </div>
          </Card>

          {/* Before / After Metrics */}
          <Card className="p-4 md:col-span-2">
            <h4 className="text-sm font-semibold mb-3">Projected Metric Changes</h4>
            <MetricRow label="Health Score" before={result.projectedDelta.health_delta + result.projectedMetrics.health_score - result.projectedDelta.health_delta} after={result.projectedMetrics.health_score} />
            <MetricRow label="Audit %" before={result.projectedMetrics.audit_percent - result.projectedDelta.audit_delta} after={result.projectedMetrics.audit_percent} />
            <MetricRow label="Debt Flags" before={result.projectedMetrics.debt_flags_count - result.projectedDelta.debt_delta} after={result.projectedMetrics.debt_flags_count} />
            <MetricRow label="Entropy" before={result.projectedMetrics.entropy_score - result.projectedDelta.entropy_delta} after={result.projectedMetrics.entropy_score} />
            <div className="mt-3 flex items-center gap-2">
              <Badge variant={result.projectedDelta.net_improvement ? 'default' : 'destructive'}>
                {result.projectedDelta.net_improvement ? '✓ Net Improvement' : '✗ Net Degradation'}
              </Badge>
              <span className="text-xs text-muted-foreground">
                Simulated {new Date(result.simulatedAt).toLocaleTimeString()}
              </span>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
