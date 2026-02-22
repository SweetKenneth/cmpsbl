/**
 * Cinematic Upgrade Success Splash
 * Full-screen overlay shown only on verified successful promotion.
 */

import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Shield, ArrowUpRight, ArrowDownRight, Minus, X, FileText, ClipboardList } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { DiffSummary } from '@/lib/substrate/promotion-pipeline/types';

interface UpgradeSplashProps {
  visible: boolean;
  onDismiss: () => void;
  onViewDiff?: () => void;
  onViewAudit?: () => void;
  diff?: DiffSummary;
  integrityScore?: number;
  promotionId?: string;
  stabilityStats?: {
    attempted: number;
    succeeded: number;
    rollbacks: number;
    destructiveFailures: number;
    verificationPassRate: number;
  };
}

function DeltaChip({ label, value, invert = false }: { label: string; value: number; invert?: boolean }) {
  const pct = (value * 100).toFixed(1);
  const isPositive = invert ? value < 0 : value > 0;
  const isNeutral = Math.abs(value) < 0.001;
  
  return (
    <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-background/50 border border-border/30">
      <span className="text-sm text-muted-foreground">{label}</span>
      <div className="flex items-center gap-1.5">
        {isNeutral ? (
          <Minus className="w-3.5 h-3.5 text-muted-foreground" />
        ) : isPositive ? (
          <ArrowUpRight className="w-3.5 h-3.5 text-emerald-500" />
        ) : (
          <ArrowDownRight className="w-3.5 h-3.5 text-red-400" />
        )}
        <span className={`text-sm font-mono font-semibold ${
          isNeutral ? 'text-muted-foreground' : isPositive ? 'text-emerald-400' : 'text-red-400'
        }`}>
          {isNeutral ? '0%' : `${value > 0 ? '+' : ''}${pct}%`}
        </span>
      </div>
    </div>
  );
}

export function UpgradeSplash({
  visible,
  onDismiss,
  onViewDiff,
  onViewAudit,
  diff,
  integrityScore,
  promotionId,
  stabilityStats,
}: UpgradeSplashProps) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            className="relative max-w-lg w-full mx-4 rounded-2xl border border-emerald-500/30 bg-gradient-to-b from-card to-background overflow-hidden shadow-2xl shadow-emerald-500/10"
            initial={{ scale: 0.8, y: 40 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20, opacity: 0 }}
            transition={{ type: 'spring', damping: 20, stiffness: 200 }}
          >
            {/* Glow ring */}
            <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-96 h-40 bg-emerald-500/20 rounded-full blur-3xl" />

            {/* Close */}
            <button onClick={onDismiss} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground z-10">
              <X className="w-5 h-5" />
            </button>

            <div className="relative p-6 sm:p-8 space-y-6">
              {/* Hero */}
              <motion.div 
                className="text-center space-y-3"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <motion.div
                  className="mx-auto w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center border-2 border-emerald-500/40"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1, rotate: 360 }}
                  transition={{ delay: 0.3, type: 'spring' }}
                >
                  <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                </motion.div>
                <h2 className="text-2xl font-bold tracking-tight">CMPSBL UPGRADE SUCCESSFUL</h2>
                <p className="text-sm text-muted-foreground">
                  Promotion verified and applied • Rollback safety armed
                </p>
                {promotionId && (
                  <Badge variant="outline" className="text-[10px] font-mono">
                    {promotionId.slice(0, 8)}
                  </Badge>
                )}
              </motion.div>

              {/* Deltas */}
              {diff && (
                <motion.div
                  className="space-y-1.5"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Performance Deltas</p>
                  <DeltaChip label="Success Rate" value={diff.success_rate_delta} />
                  <DeltaChip label="Escalation" value={diff.escalation_delta} invert />
                  <DeltaChip label="Latency" value={diff.latency_delta} invert />
                  <DeltaChip label="Cost" value={diff.cost_delta} invert />
                  <DeltaChip label="Executor Health" value={diff.executor_health_delta} />
                  <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-background/50 border border-border/30">
                    <span className="text-sm text-muted-foreground">Rules Applied</span>
                    <span className="text-sm font-mono font-semibold">
                      +{diff.rules_added} / -{diff.rules_removed}
                    </span>
                  </div>
                  {integrityScore !== undefined && (
                    <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-background/50 border border-border/30">
                      <span className="text-sm text-muted-foreground">Integrity Score</span>
                      <span className={`text-sm font-mono font-semibold ${
                        integrityScore >= 80 ? 'text-emerald-400' : integrityScore >= 60 ? 'text-amber-400' : 'text-red-400'
                      }`}>
                        {integrityScore}/100
                      </span>
                    </div>
                  )}
                </motion.div>
              )}

              {/* 7-Day Stability */}
              {stabilityStats && (
                <motion.div
                  className="p-3 rounded-lg border border-border/30 bg-background/30 space-y-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="w-4 h-4 text-primary" />
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">7-Day Stability Summary</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex justify-between"><span className="text-muted-foreground">Attempted</span><span className="font-mono">{stabilityStats.attempted}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Succeeded</span><span className="font-mono text-emerald-400">{stabilityStats.succeeded}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Rollbacks</span><span className="font-mono text-amber-400">{stabilityStats.rollbacks}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Destructive</span><span className="font-mono text-emerald-400">{stabilityStats.destructiveFailures}</span></div>
                    <div className="col-span-2 flex justify-between"><span className="text-muted-foreground">Verification Pass Rate</span><span className="font-mono">{(stabilityStats.verificationPassRate * 100).toFixed(0)}%</span></div>
                  </div>
                </motion.div>
              )}

              {/* Actions */}
              <motion.div
                className="flex gap-2 pt-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
              >
                {onViewDiff && (
                  <Button variant="outline" size="sm" className="flex-1 gap-1.5" onClick={onViewDiff}>
                    <FileText className="w-3.5 h-3.5" /> View Full Diff
                  </Button>
                )}
                {onViewAudit && (
                  <Button variant="outline" size="sm" className="flex-1 gap-1.5" onClick={onViewAudit}>
                    <ClipboardList className="w-3.5 h-3.5" /> Audit Trail
                  </Button>
                )}
                <Button size="sm" className="flex-1" onClick={onDismiss}>
                  Continue
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
