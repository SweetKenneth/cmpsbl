/**
 * Overview Panel — Mobile-first command center dashboard.
 * Purposeful, actionable widgets with polished spacing.
 */

import { useState, useMemo, lazy, Suspense } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity, Cpu, Zap, Brain, Shield, Eye, Wrench, Server,
  Terminal, Loader2, CheckCircle2, RefreshCw, ArrowUpRight,
  Network, Layers, AlertTriangle, TrendingUp, Clock,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { motion } from 'framer-motion';
import { useSubstrateHealthScore } from '@/hooks/useSubstrateOS';
import { useMetric } from '@/stores/publicMetricsStore';
import { useSystemHeal, useSystemBackup } from '@/hooks/useSubstrateOSEnhanced';
import { buildMatrixNodes, calculateIntegrity } from '@/lib/core/matrixNodeRegistry';
import { system } from '@/lib/substrate';
import { cn } from '@/lib/utils';
import { EventStream } from '@/components/substrate-os/EventStream';
import { pushToast } from '@/components/toast/SmartToastStore';

const SystemHealthPanel = lazy(() => import('@/components/substrate-os/SystemHealthPanel').then(m => ({ default: m.SystemHealthPanel })));
const BackupRestorePanel = lazy(() => import('@/components/substrate-os/BackupRestorePanel').then(m => ({ default: m.BackupRestorePanel })));

// 12 sectors for the topology map
const SECTORS = [
  { id: 'CORE', nodes: ['CORE', 'SYSTEM'], color: 'text-orange-500 dark:text-orange-400' },
  { id: 'CCR', nodes: ['BRAIN', 'MEMORY', 'DREAM'], color: 'text-purple-500 dark:text-purple-400' },
  { id: 'OCG', nodes: ['RIPPLE', 'ACCESS', 'IDENTITY', 'RELAY', 'AUDIT', 'NERVE'], color: 'text-cyan-500 dark:text-cyan-400' },
  { id: 'Execution', nodes: ['DECODE', 'ENCODE', 'VISION', 'CORTEX', 'NEXUS', 'ECONOMY', 'SANDBOX', 'INCLUSIVE', 'MEDIC', 'INTEGRATION'], color: 'text-emerald-500 dark:text-emerald-400' },
  { id: 'ESZ', nodes: ['SOVEREIGN', 'ORACLE', 'CONSCIENCE', 'TREATY'], color: 'text-amber-500 dark:text-amber-400' },
  { id: 'EPZ', nodes: ['COMPASS', 'ECHO', 'REFLEX'], color: 'text-sky-500 dark:text-sky-400' },
  { id: 'EMZ', nodes: ['FORGE', 'LINGUA', 'HARVEST'], color: 'text-lime-500 dark:text-lime-400' },
  { id: 'CSZ', nodes: ['EVOLUTION', 'SHADOW', 'PHANTOM'], color: 'text-rose-500 dark:text-rose-400' },
  { id: 'Fields', nodes: ['IMMUNITY', 'INTENT'], color: 'text-pink-500 dark:text-pink-400' },
  { id: 'Plane', nodes: ['GOVERNANCE'], color: 'text-indigo-500 dark:text-indigo-400' },
  { id: 'Shell', nodes: ['DEFENSE'], color: 'text-red-500 dark:text-red-400' },
];

interface OverviewPanelProps {
  isOperator: boolean;
  isGovernor: boolean;
  onOpenTerminal: () => void;
  onNavigate: (tab: string) => void;
}

export default function OverviewPanel({ isOperator, isGovernor, onOpenTerminal, onNavigate }: OverviewPanelProps) {
  const healthScore = useSubstrateHealthScore();
  const version = useMetric('version');
  const healMutation = useSystemHeal();
  const backupMutation = useSystemBackup();
  const [diagnosticsRunning, setDiagnosticsRunning] = useState(false);

  const matrixNodes = useMemo(() => buildMatrixNodes(healthScore.modules), [healthScore.modules]);
  const integrity = useMemo(() => calculateIntegrity(matrixNodes), [matrixNodes]);

  const statusLabel = healthScore.isHealthy ? 'OPTIMAL' : healthScore.isDegraded ? 'DEGRADED' : 'CRITICAL';
  const statusColor = healthScore.isHealthy ? 'text-emerald-600 dark:text-emerald-400' : healthScore.isDegraded ? 'text-amber-600 dark:text-amber-400' : 'text-red-600 dark:text-red-400';
  const ringColor = healthScore.isHealthy ? 'stroke-emerald-500' : healthScore.isDegraded ? 'stroke-amber-500' : 'stroke-red-500';

  const circumference = 2 * Math.PI * 42;
  const progress = (healthScore.healthScore / 100) * circumference;

  const handleHeal = async () => {
    pushToast({ message: 'Auto-Heal initiated...', variant: 'info' });
    try {
      await healMutation.mutateAsync(undefined);
      pushToast({ message: 'System heal complete', variant: 'success' });
      healthScore.refetch();
    } catch { pushToast({ message: 'Heal failed', variant: 'error' }); }
  };

  const handleBackup = async () => {
    try {
      await backupMutation.mutateAsync();
      pushToast({ message: 'Backup snapshot saved', variant: 'success' });
    } catch { pushToast({ message: 'Backup failed', variant: 'error' }); }
  };

  const handleDiagnostics = async () => {
    setDiagnosticsRunning(true);
    try {
      const result = await system.diagnostics();
      pushToast({ message: result?.success ? 'All systems nominal' : 'Issues detected — review health', variant: result?.success ? 'success' : 'warning' });
    } catch { pushToast({ message: 'Diagnostics failed', variant: 'error' }); }
    finally { setDiagnosticsRunning(false); }
  };

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* ── Hero Strip ── */}
      <motion.div
        className="rounded-xl sm:rounded-2xl border border-border/25 dark:border-border/15 overflow-hidden bg-card/80 dark:bg-card/40 backdrop-blur-xl"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="p-4 sm:p-6 lg:p-8 flex flex-col sm:flex-row items-center gap-5 sm:gap-8">
          {/* Health Ring */}
          <div className="relative shrink-0">
            <svg className="w-24 h-24 sm:w-28 sm:h-28 -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="42" fill="none" strokeWidth="4" className="stroke-border/15" />
              <motion.circle
                cx="50" cy="50" r="42" fill="none" strokeWidth="6" strokeLinecap="round"
                className={ringColor}
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset: circumference - progress }}
                transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={cn("text-2xl sm:text-3xl font-black font-mono", statusColor)}>{healthScore.healthScore}</span>
              <span className="text-[8px] text-muted-foreground/50 font-mono uppercase tracking-[0.3em]">health</span>
            </div>
          </div>

          {/* KPI cards */}
          <div className="flex-1 w-full grid grid-cols-2 gap-2.5 sm:gap-3">
            {[
              { label: 'Status', value: statusLabel, sub: `v${version}`, color: statusColor },
              { label: 'Matrix Nodes', value: `${healthScore.activeCount}/${healthScore.totalModules}`, sub: `${integrity.operational}% integrity`, color: 'text-primary' },
              { label: 'Structural', value: `${integrity.structural}%`, sub: (integrity.status ?? '').replace('MATRIX ', ''), color: 'text-foreground' },
              { label: 'Sectors', value: '12', sub: '38 nodes', color: 'text-foreground' },
            ].map((kpi, i) => (
              <motion.div
                key={kpi.label}
                className="rounded-lg sm:rounded-xl border border-border/20 dark:border-border/10 p-3 sm:p-4 bg-muted/5 dark:bg-muted/10"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.08 }}
              >
                <span className="text-[9px] text-muted-foreground/50 font-mono uppercase tracking-[0.15em] block mb-0.5">{kpi.label}</span>
                <span className={cn("text-base sm:text-lg lg:text-xl font-bold font-mono block leading-tight", kpi.color)}>{kpi.value}</span>
                <span className="text-[10px] text-muted-foreground/40 leading-tight">{kpi.sub}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* ── Quick Actions + Topology ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6">
        {/* Quick Actions */}
        <div className="lg:col-span-1 space-y-3">
          <h3 className="text-[11px] font-semibold text-muted-foreground/60 uppercase tracking-[0.15em] px-1">Quick Actions</h3>
          <div className="grid grid-cols-2 lg:grid-cols-1 gap-2">
            {[
              { id: 'heal', label: 'Auto-Heal', icon: Wrench, onClick: handleHeal, pending: healMutation.isPending, color: 'text-emerald-500' },
              { id: 'backup', label: 'Backup', icon: Server, onClick: handleBackup, pending: backupMutation.isPending, color: 'text-cyan-500' },
              { id: 'diagnostics', label: 'Diagnostics', icon: Activity, onClick: handleDiagnostics, pending: diagnosticsRunning, color: 'text-amber-500' },
              { id: 'terminal', label: 'Terminal', icon: Terminal, onClick: onOpenTerminal, pending: false, color: 'text-primary' },
            ].map(action => (
              <Button
                key={action.id}
                variant="outline"
                className="justify-start h-auto py-3 px-3 sm:px-4 border-border/20 dark:border-border/10 hover:bg-muted/30 dark:hover:bg-muted/20 w-full text-left"
                onClick={action.onClick}
                disabled={action.pending || !isOperator}
              >
                {action.pending ? (
                  <Loader2 className="w-4 h-4 mr-2.5 sm:mr-3 animate-spin text-muted-foreground shrink-0" />
                ) : (
                  <action.icon className={cn("w-4 h-4 mr-2.5 sm:mr-3 shrink-0", action.color)} />
                )}
                <span className="text-xs sm:text-sm font-medium truncate">{action.label}</span>
              </Button>
            ))}
          </div>

          {/* Navigation shortcuts */}
          <h3 className="text-[11px] font-semibold text-muted-foreground/60 uppercase tracking-[0.15em] px-1 pt-1">Navigate</h3>
          <div className="grid grid-cols-2 lg:grid-cols-1 gap-1">
            {[
              { label: 'INTENT Mesh', tab: 'intent', icon: Brain },
              { label: 'NEXUS Fleet', tab: 'nexus', icon: Zap },
              { label: 'Security', tab: 'security', icon: Shield },
              ...(isGovernor ? [{ label: 'Governor', tab: 'governor', icon: AlertTriangle }] : []),
            ].map(link => (
              <button
                key={link.tab}
                onClick={() => onNavigate(link.tab)}
                className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-all text-left min-h-[40px]"
              >
                <link.icon className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{link.label}</span>
                <ArrowUpRight className="w-3 h-3 ml-auto opacity-40 shrink-0" />
              </button>
            ))}
          </div>
        </div>

        {/* Sector Topology */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-3 px-1">
            <h3 className="text-[11px] font-semibold text-muted-foreground/60 uppercase tracking-[0.15em]">Sector Topology</h3>
            <Button variant="ghost" size="sm" className="h-7 px-2 text-[10px]" onClick={() => healthScore.refetch()} disabled={healthScore.isLoading}>
              <RefreshCw className={cn("w-3 h-3 mr-1", healthScore.isLoading && "animate-spin")} />
              Refresh
            </Button>
          </div>
          <TooltipProvider delayDuration={50}>
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-2">
              {SECTORS.map(sector => (
                <motion.div
                  key={sector.id}
                  className="rounded-lg sm:rounded-xl border border-border/15 dark:border-border/10 p-2.5 sm:p-3 bg-card/50 dark:bg-card/20 hover:bg-card/80 dark:hover:bg-card/30 transition-colors"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex items-center gap-1.5 mb-1.5 sm:mb-2">
                    <span className={cn("text-[10px] font-bold font-mono tracking-wider", sector.color)}>{sector.id}</span>
                    <span className="text-[9px] text-muted-foreground/40 ml-auto">{sector.nodes.length}</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {sector.nodes.map(node => {
                      const nodeKey = node.toLowerCase();
                      const isActive = healthScore.modules[nodeKey as keyof typeof healthScore.modules];
                      return (
                        <Tooltip key={node}>
                          <TooltipTrigger asChild>
                            <div className={cn(
                              "px-1.5 py-0.5 rounded text-[8px] sm:text-[9px] font-mono font-medium transition-all cursor-default",
                              isActive
                                ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20"
                                : "bg-muted/20 text-muted-foreground/30 border border-border/10"
                            )}>
                              {node}
                            </div>
                          </TooltipTrigger>
                          <TooltipContent side="bottom" className="text-xs">
                            <span className="font-semibold">{node}</span> — {isActive ? '● Online' : '○ Offline'}
                          </TooltipContent>
                        </Tooltip>
                      );
                    })}
                  </div>
                </motion.div>
              ))}
            </div>
          </TooltipProvider>
        </div>
      </div>

      {/* ── Live Event Stream + System Health ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
        <div>
          <h3 className="text-[11px] font-semibold text-muted-foreground/60 uppercase tracking-[0.15em] px-1 mb-3">Live Events</h3>
          <EventStream />
        </div>
        <div>
          <h3 className="text-[11px] font-semibold text-muted-foreground/60 uppercase tracking-[0.15em] px-1 mb-3">System Health</h3>
          <Suspense fallback={<div className="h-48 rounded-xl border border-border/15 animate-pulse bg-muted/10" />}>
            <SystemHealthPanel enabled={isOperator} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
