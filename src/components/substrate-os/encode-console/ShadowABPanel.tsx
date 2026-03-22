/**
 * SHADOW A/B Testing Panel
 * Runs two variant approaches in shadow mode, compares divergence,
 * latency, and quality metrics, then promotes the winner as the
 * execution template for the real ENCODE implementation.
 */

import { useState } from 'react';
import { GitCompare, Trophy, Zap, Shield, Clock, ChevronRight, Check, X, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import type { ABExperiment, ABVariant } from '@/lib/substrate/evolution-ab';

export interface ShadowABExperiment {
  id: string;
  name: string;
  module: string;
  planId: string;
  variantA: ShadowVariant;
  variantB: ShadowVariant;
  winner: 'A' | 'B' | null;
  winnerReason: string | null;
  status: 'setup' | 'shadowing' | 'comparing' | 'decided' | 'cancelled';
  createdAt: number;
  decidedAt: number | null;
}

export interface ShadowVariant {
  label: 'A' | 'B';
  approach: string;
  description: string;
  metrics: {
    divergence: number;
    latency_ms: number;
    quality_score: number;
    safety_pass: boolean;
    error_rate: number;
    resource_cost: number;
  } | null;
  shadowRunId: string | null;
  status: 'pending' | 'running' | 'completed' | 'failed';
}

interface ShadowABPanelProps {
  experiments: ShadowABExperiment[];
  onSelectWinner: (experimentId: string, winner: 'A' | 'B') => void;
  onCancel: (experimentId: string) => void;
}

function MetricBar({ label, value, max, unit, invert }: { label: string; value: number; max: number; unit: string; invert?: boolean }) {
  const pct = Math.min((value / max) * 100, 100);
  const isGood = invert ? value < max * 0.5 : value > max * 0.5;
  return (
    <div className="space-y-0.5">
      <div className="flex justify-between text-[9px]">
        <span className="text-muted-foreground">{label}</span>
        <span className={cn("font-mono", isGood ? "text-neon-green" : "text-neon-amber")}>
          {typeof value === 'number' ? value.toFixed(2) : '—'}{unit}
        </span>
      </div>
      <Progress value={invert ? 100 - pct : pct} className="h-1" />
    </div>
  );
}

function VariantCard({ variant, isWinner, otherMetrics }: {
  variant: ShadowVariant;
  isWinner: boolean;
  otherMetrics: ShadowVariant['metrics'] | null;
}) {
  const m = variant.metrics;
  return (
    <div className={cn(
      "rounded-lg border p-3 space-y-2 transition-all",
      isWinner
        ? "border-neon-green/40 bg-neon-green/5 ring-1 ring-neon-green/20"
        : "border-border/30 bg-card/30",
      variant.status === 'failed' && "border-destructive/30 bg-destructive/5 opacity-60"
    )}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Badge variant="outline" className={cn(
            "text-[9px] font-mono px-1.5",
            variant.label === 'A' ? "border-neon-blue/30 text-neon-blue" : "border-neon-purple/30 text-neon-purple"
          )}>
            VARIANT {variant.label}
          </Badge>
          {isWinner && (
            <Trophy className="w-3 h-3 text-neon-amber" />
          )}
        </div>
        <Badge variant="outline" className={cn(
          "text-[8px] font-mono",
          variant.status === 'completed' ? "border-neon-green/30 text-neon-green" :
          variant.status === 'running' ? "border-neon-amber/30 text-neon-amber" :
          variant.status === 'failed' ? "border-destructive/30 text-destructive" :
          "border-muted-foreground/30 text-muted-foreground"
        )}>
          {variant.status === 'running' && <Loader2 className="w-2 h-2 animate-spin mr-1" />}
          {variant.status.toUpperCase()}
        </Badge>
      </div>

      <p className="text-[10px] text-muted-foreground leading-relaxed">{variant.approach}</p>

      {m && (
        <div className="space-y-1.5 pt-1">
          <MetricBar label="Quality" value={m.quality_score} max={1} unit="" />
          <MetricBar label="Divergence" value={m.divergence} max={0.2} unit="" invert />
          <MetricBar label="Latency" value={m.latency_ms} max={500} unit="ms" invert />
          <MetricBar label="Error Rate" value={m.error_rate} max={0.1} unit="%" invert />

          <div className="flex items-center justify-between text-[9px] pt-1">
            <span className="text-muted-foreground">Safety</span>
            {m.safety_pass ? (
              <span className="text-neon-green flex items-center gap-0.5"><Check className="w-2.5 h-2.5" /> PASS</span>
            ) : (
              <span className="text-destructive flex items-center gap-0.5"><X className="w-2.5 h-2.5" /> FAIL</span>
            )}
          </div>

          <div className="flex items-center justify-between text-[9px]">
            <span className="text-muted-foreground">Resource Cost</span>
            <span className="font-mono text-muted-foreground">{m.resource_cost.toFixed(1)} units</span>
          </div>

          {/* Delta comparison against other variant */}
          {otherMetrics && (
            <div className="border-t border-border/15 pt-1.5 mt-1.5">
              <p className="text-[8px] text-muted-foreground/60 font-mono mb-1">VS VARIANT {variant.label === 'A' ? 'B' : 'A'}</p>
              <div className="grid grid-cols-3 gap-1 text-[8px]">
                {(() => {
                  const qDelta = m.quality_score - otherMetrics.quality_score;
                  const lDelta = otherMetrics.latency_ms - m.latency_ms;
                  const eDelta = otherMetrics.error_rate - m.error_rate;
                  return (
                    <>
                      <span className={cn("font-mono", qDelta > 0 ? "text-neon-green" : qDelta < 0 ? "text-destructive" : "text-muted-foreground")}>
                        Q: {qDelta > 0 ? '+' : ''}{(qDelta * 100).toFixed(1)}%
                      </span>
                      <span className={cn("font-mono", lDelta > 0 ? "text-neon-green" : lDelta < 0 ? "text-destructive" : "text-muted-foreground")}>
                        L: {lDelta > 0 ? '+' : ''}{lDelta.toFixed(0)}ms
                      </span>
                      <span className={cn("font-mono", eDelta > 0 ? "text-neon-green" : eDelta < 0 ? "text-destructive" : "text-muted-foreground")}>
                        E: {eDelta > 0 ? '+' : ''}{(eDelta * 100).toFixed(2)}%
                      </span>
                    </>
                  );
                })()}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function ShadowABPanel({ experiments, onSelectWinner, onCancel }: ShadowABPanelProps) {
  if (experiments.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-1.5 px-1">
        <GitCompare className="w-3.5 h-3.5 text-primary/70" />
        <span className="text-[10px] font-bold text-foreground/80 tracking-wider uppercase">
          SHADOW A/B Tests
        </span>
        <Badge variant="outline" className="text-[8px] font-mono ml-auto">
          {experiments.length} active
        </Badge>
      </div>

      {experiments.map(exp => (
        <div key={exp.id} className="rounded-lg border border-border/20 bg-card/20 p-2.5 space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-semibold text-foreground/90">{exp.name}</p>
              <p className="text-[8px] text-muted-foreground/60 font-mono">{exp.module} · {exp.id}</p>
            </div>
            <Badge variant="outline" className={cn(
              "text-[8px] font-mono",
              exp.status === 'decided' ? "border-neon-green/30 text-neon-green" :
              exp.status === 'shadowing' ? "border-neon-amber/30 text-neon-amber animate-pulse" :
              exp.status === 'comparing' ? "border-neon-blue/30 text-neon-blue" :
              "border-muted-foreground/30"
            )}>
              {exp.status.toUpperCase()}
            </Badge>
          </div>

          {/* Execution timeline */}
          {exp.status !== 'setup' && (
            <div className="flex items-center gap-1 text-[8px] font-mono text-muted-foreground/50">
              {['SHADOW A', 'SHADOW B', 'COMPARE', 'DECIDE'].map((stage, i) => {
                const active = (
                  (exp.status === 'shadowing' && i <= 1) ||
                  (exp.status === 'comparing' && i <= 2) ||
                  (exp.status === 'decided' && i <= 3)
                );
                return (
                  <span key={stage} className="flex items-center gap-0.5">
                    {i > 0 && <ChevronRight className="w-2 h-2" />}
                    <span className={cn(active ? "text-primary" : "text-muted-foreground/30")}>{stage}</span>
                  </span>
                );
              })}
            </div>
          )}

          {/* Variant comparison */}
          <div className="grid grid-cols-2 gap-2">
            <VariantCard
              variant={exp.variantA}
              isWinner={exp.winner === 'A'}
              otherMetrics={exp.variantB.metrics}
            />
            <VariantCard
              variant={exp.variantB}
              isWinner={exp.winner === 'B'}
              otherMetrics={exp.variantA.metrics}
            />
          </div>

          {/* Winner announcement */}
          {exp.winner && exp.winnerReason && (
            <div className="rounded-md bg-neon-green/5 border border-neon-green/20 p-2">
              <p className="text-[9px] font-semibold text-neon-green flex items-center gap-1">
                <Trophy className="w-3 h-3" /> Variant {exp.winner} selected as implementation template
              </p>
              <p className="text-[8px] text-muted-foreground/70 mt-0.5">{exp.winnerReason}</p>
            </div>
          )}

          {/* Actions */}
          {exp.status === 'comparing' && (
            <div className="flex gap-1.5 pt-1">
              <Button
                size="sm"
                variant="outline"
                className="h-6 text-[9px] flex-1 border-neon-blue/30 text-neon-blue hover:bg-neon-blue/10"
                onClick={() => onSelectWinner(exp.id, 'A')}
              >
                Use Variant A
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-6 text-[9px] flex-1 border-neon-purple/30 text-neon-purple hover:bg-neon-purple/10"
                onClick={() => onSelectWinner(exp.id, 'B')}
              >
                Use Variant B
              </Button>
            </div>
          )}

          {exp.status !== 'decided' && exp.status !== 'cancelled' && (
            <Button
              size="sm"
              variant="ghost"
              className="h-5 text-[8px] text-muted-foreground/50 hover:text-destructive w-full"
              onClick={() => onCancel(exp.id)}
            >
              Cancel Experiment
            </Button>
          )}
        </div>
      ))}
    </div>
  );
}
