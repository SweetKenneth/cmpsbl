/**
 * Matrix Integrity Map — Read-Only Breaker Visibility
 * Shows breaker state, failure count, weight, and sector for every Matrix Node
 */

import { Shield, Activity, AlertTriangle, CheckCircle2, RefreshCw, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import {
  type MatrixNode,
  type MatrixSector,
  type BreakerState,
  SECTOR_LABELS,
} from '@/lib/core/matrixNodeRegistry';

interface MatrixBreakerMapProps {
  nodes: MatrixNode[];
}

const BREAKER_STYLES: Record<BreakerState, { color: string; bg: string; icon: typeof CheckCircle2; label: string }> = {
  closed: { color: 'text-neon-green', bg: 'bg-neon-green/10 border-neon-green/20', icon: CheckCircle2, label: 'CLOSED' },
  'half-open': { color: 'text-neon-amber', bg: 'bg-neon-amber/10 border-neon-amber/20', icon: AlertTriangle, label: 'HALF-OPEN' },
  open: { color: 'text-destructive', bg: 'bg-destructive/10 border-destructive/20', icon: Zap, label: 'OPEN' },
  rerouting: { color: 'text-neon-blue', bg: 'bg-neon-blue/10 border-neon-blue/20', icon: RefreshCw, label: 'REROUTING' },
};

const SECTOR_ORDER: MatrixSector[] = ['core', 'system', 'ccr', 'ocg', 'execution', 'esz', 'epz', 'emz', 'csz', 'field', 'plane', 'shell'];
const SECTOR_COLORS: Record<MatrixSector, string> = {
  core: 'border-neon-amber/30',
  system: 'border-neon-amber/30',
  ccr: 'border-neon-purple/30',
  ocg: 'border-neon-cyan/30',
  execution: 'border-neon-blue/30',
  esz: 'border-neon-amber/30',
  epz: 'border-neon-cyan/30',
  emz: 'border-primary/30',
  csz: 'border-neon-purple/30',
  field: 'border-neon-green/30',
  plane: 'border-destructive/30',
  shell: 'border-neon-magenta/30',
};

export function MatrixBreakerMap({ nodes }: MatrixBreakerMapProps) {
  const bySector = SECTOR_ORDER.map(sector => ({
    sector,
    nodes: nodes.filter(n => n.sector === sector),
  }));

  return (
    <motion.div
      className="rounded-2xl border border-border/40 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-xl p-4 sm:p-5"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-destructive/20 to-neon-amber/20 border border-destructive/30 flex items-center justify-center">
          <Shield className="w-4 h-4 text-destructive" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-foreground">Stream Integrity Map</h3>
          <p className="text-[10px] text-muted-foreground font-mono">Memory Stream · Breaker state per node</p>
        </div>
      </div>

      <div className="space-y-4">
        {bySector.map(({ sector, nodes: sectorNodes }) => (
          <div key={sector}>
            <div className="text-[9px] font-mono text-muted-foreground/60 uppercase tracking-wider mb-2">
              {SECTOR_LABELS[sector]} ({sectorNodes.length})
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {sectorNodes.map((node, idx) => {
                const style = BREAKER_STYLES[node.breakerState] ?? BREAKER_STYLES.closed;
                const Icon = style.icon;
                return (
                  <motion.div
                    key={node.id}
                    className={cn(
                      'rounded-lg border p-2.5 flex items-start gap-2.5',
                      style.bg, SECTOR_COLORS[sector]
                    )}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.03 }}
                  >
                    <Icon className={cn('w-3.5 h-3.5 mt-0.5 shrink-0', style.color)} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-semibold text-foreground">{node.label}</span>
                        <Badge variant="outline" className={cn('text-[7px] h-3.5 px-1', style.color)}>
                          {style.label}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-[9px] font-mono text-muted-foreground/60">
                        <span>h:{node.health}%</span>
                        <span>w:{node.weight.toFixed(3)}</span>
                        <span>f:{node.failureCount}</span>
                      </div>
                      {node.lastRecovery && (
                        <div className="text-[8px] font-mono text-muted-foreground/40 mt-0.5">
                          recovered: {new Date(node.lastRecovery).toLocaleTimeString()}
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
