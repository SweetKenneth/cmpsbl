/**
 * HardeningDashboard — Observability panel for all 8 hardened modules
 * Shows A–F grades, scores, and module health at a glance.
 */

import { Shield, RefreshCw, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { useHardeningHealth } from '@/hooks/useHardeningHealth';

const GRADE_COLORS: Record<string, string> = {
  A: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
  B: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
  C: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
  D: 'text-orange-400 bg-orange-500/10 border-orange-500/30',
  F: 'text-red-400 bg-red-500/10 border-red-500/30',
};

const GRADE_ICON: Record<string, typeof CheckCircle> = {
  A: CheckCircle,
  B: CheckCircle,
  C: AlertTriangle,
  D: AlertTriangle,
  F: XCircle,
};

export function HardeningDashboard() {
  const { modules, overallGrade, averageScore, loading, lastRefresh, refresh } = useHardeningHealth();

  if (loading) {
    return (
      <div className="p-6 rounded-lg border border-border/50 bg-card/50 backdrop-blur-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Shield className="h-4 w-4 animate-pulse" />
          <span className="text-sm">Loading hardening health...</span>
        </div>
      </div>
    );
  }

  const OverallIcon = GRADE_ICON[overallGrade] || CheckCircle;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${GRADE_COLORS[overallGrade] || GRADE_COLORS.A}`}>
            <OverallIcon className="h-4 w-4" />
            <span className="text-lg font-bold font-mono">{overallGrade}</span>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">Hardening</h3>
            <p className="text-xs text-muted-foreground">
              {averageScore}/100 avg across {modules.length} modules
            </p>
          </div>
        </div>
        <button
          onClick={refresh}
          className="p-1.5 rounded-md hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors"
          title="Refresh hardening health"
        >
          <RefreshCw className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Module Grid */}
      <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
        {modules.map((mod) => {
          const ModIcon = GRADE_ICON[mod.grade] || CheckCircle;
          return (
            <div
              key={mod.module}
              className={`p-3 rounded-lg border transition-all hover:scale-[1.02] ${GRADE_COLORS[mod.grade] || GRADE_COLORS.A}`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-mono font-bold tracking-wider opacity-80">
                  {mod.module}
                </span>
                <ModIcon className="h-3 w-3" />
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl font-bold font-mono">{mod.grade}</span>
                <span className="text-[10px] opacity-60">{mod.score}/100</span>
              </div>
              <p className="text-[9px] opacity-50 mt-0.5 font-mono">{mod.codename}</p>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      {lastRefresh && (
        <p className="text-[10px] text-muted-foreground text-right">
          Last refresh: {new Date(lastRefresh).toLocaleTimeString()}
        </p>
      )}
    </div>
  );
}
