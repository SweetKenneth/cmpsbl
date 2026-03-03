/**
 * Matrix Integrity Panel — Read-Only Integrity Transparency
 * Displays operational + structural integrity with equation visibility
 */

import { Activity, Shield, Info, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import {
  type MatrixIntegrityReport,
  type MatrixSector,
  SECTOR_LABELS,
  getIntegrityEquation,
} from '@/lib/core/matrixNodeRegistry';

interface MatrixIntegrityPanelProps {
  report: MatrixIntegrityReport;
}

const SECTOR_COLORS: Record<MatrixSector, string> = {
  core: 'text-orange-400',
  system: 'text-yellow-400',
  ccr: 'text-purple-400',
  ocg: 'text-cyan-400',
  execution: 'text-blue-400',
  esz: 'text-amber-400',
  epz: 'text-teal-400',
  emz: 'text-indigo-400',
  field: 'text-emerald-400',
  plane: 'text-red-400',
  shell: 'text-rose-400',
};

const SECTOR_BG: Record<MatrixSector, string> = {
  core: 'bg-orange-500/10 border-orange-500/20',
  system: 'bg-yellow-500/10 border-yellow-500/20',
  ccr: 'bg-purple-500/10 border-purple-500/20',
  ocg: 'bg-cyan-500/10 border-cyan-500/20',
  execution: 'bg-blue-500/10 border-blue-500/20',
  esz: 'bg-amber-500/10 border-amber-500/20',
  epz: 'bg-teal-500/10 border-teal-500/20',
  emz: 'bg-indigo-500/10 border-indigo-500/20',
  field: 'bg-emerald-500/10 border-emerald-500/20',
  plane: 'bg-red-500/10 border-red-500/20',
  shell: 'bg-rose-500/10 border-rose-500/20',
};

export function MatrixIntegrityPanel({ report }: MatrixIntegrityPanelProps) {
  const [expanded, setExpanded] = useState(false);

  const statusColor = report.isCritical
    ? 'text-red-400'
    : report.operational < 80
      ? 'text-amber-400'
      : 'text-emerald-400';

  const statusBg = report.isCritical
    ? 'bg-red-500/10 border-red-500/30'
    : report.operational < 80
      ? 'bg-amber-500/10 border-amber-500/30'
      : 'bg-emerald-500/10 border-emerald-500/30';

  return (
    <motion.div
      className="rounded-2xl border border-border/40 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-xl overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
    >
      {/* Header */}
      <div className="p-4 sm:p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border border-emerald-500/30 flex items-center justify-center">
              <Activity className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">Matrix Integrity</h3>
              <p className="text-[10px] text-muted-foreground font-mono">{report.nodeCount} nodes · Σw = {report.totalWeight}</p>
            </div>
          </div>
          <Badge variant="outline" className={cn('text-xs', statusBg, statusColor)}>
            {report.status}
          </Badge>
        </div>

        {/* Dual Metrics */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className={cn('rounded-xl border p-3', statusBg)}>
            <div className="text-[9px] text-muted-foreground font-mono uppercase tracking-wider mb-1">Operational</div>
            <div className={cn('text-2xl font-bold font-mono', statusColor)}>{report.operational}%</div>
            <div className="text-[9px] text-muted-foreground/60 mt-0.5">Σ(health × weight)</div>
          </div>
          <div className="rounded-xl border border-border/30 bg-muted/10 p-3">
            <div className="text-[9px] text-muted-foreground font-mono uppercase tracking-wider mb-1">Structural</div>
            <div className="text-2xl font-bold font-mono text-foreground">{report.structural}%</div>
            <div className="text-[9px] text-muted-foreground/60 mt-0.5">Breaker coherence</div>
          </div>
        </div>

        {/* Sector Breakdown */}
        <div className="space-y-1.5 mb-3">
          {(['core', 'system', 'ccr', 'ocg', 'execution', 'field', 'plane', 'shell'] as MatrixSector[]).map((sector) => {
            const data = report.sectors[sector] ?? { health: 0, nodeCount: 0, weight: 0 };
            const sectorColor = SECTOR_COLORS[sector] ?? 'text-muted-foreground';
            const sectorLabel = (SECTOR_LABELS[sector] ?? sector.toUpperCase()).replace(' Sector', '');
            return (
              <div key={sector} className="flex items-center gap-2">
                <span className={cn('text-[9px] font-mono w-20 shrink-0', sectorColor)}>
                  {sectorLabel}
                </span>
                <div className="flex-1 h-1.5 rounded-full bg-muted/20 overflow-hidden">
                  <motion.div
                    className={cn('h-full rounded-full', sectorColor.replace('text-', 'bg-'))}
                    initial={{ width: 0 }}
                    animate={{ width: `${data.health}%` }}
                    transition={{ duration: 1, delay: 0.2 }}
                  />
                </div>
                <span className="text-[9px] font-mono text-muted-foreground w-8 text-right">{data.health}%</span>
                <span className="text-[8px] font-mono text-muted-foreground/50 w-6 text-right">{data.nodeCount}n</span>
              </div>
            );
          })}
        </div>

        {/* Equation Toggle */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1.5 text-[10px] text-muted-foreground/60 hover:text-muted-foreground transition-colors font-mono"
          aria-label={expanded ? 'Hide integrity equation' : 'Show integrity equation'}
          aria-expanded={expanded}
        >
          <Info className="w-3 h-3" />
          Integrity Equation
          {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>

        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="mt-2 p-3 rounded-lg bg-muted/10 border border-border/20">
                <code className="text-[10px] text-cyan-400/80 font-mono block leading-relaxed">
                  {getIntegrityEquation()}
                </code>
                <div className="mt-2 text-[9px] text-muted-foreground/50 font-mono space-y-0.5">
                  <div>• breaker=open → health=0</div>
                  <div>• breaker=half-open → health=min(raw, 50)</div>
                  <div>• CRITICAL if integrity&lt;40 OR CORE breaker open</div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
