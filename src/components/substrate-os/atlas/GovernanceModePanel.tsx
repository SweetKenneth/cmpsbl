/**
 * GovernanceModePanel — Visualizes current governance mode, subsystem states,
 * health-governance bridge, budget governor status, and hardening overview
 */

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Shield, Activity, AlertTriangle, CheckCircle, RefreshCw,
  Lock, Eye, Zap, Radio, Server, Clock
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  getSubsystemState, GOVERNANCE_MODE_META,
  type GovernanceMode, type SubsystemState,
} from '@/lib/system/governance';
import { useHardeningHealth } from '@/hooks/useHardeningHealth';

const MODE_ICONS: Record<GovernanceMode, typeof Shield> = {
  ACTIVE: CheckCircle,
  OBSERVE: Eye,
  LOCKDOWN: Lock,
  EVOLVE: Zap,
};

export function GovernanceModePanel() {
  const [currentMode, setCurrentMode] = useState<GovernanceMode>('ACTIVE');
  const [subsystems, setSubsystems] = useState<SubsystemState>(getSubsystemState('ACTIVE'));
  const { modules, overallGrade, averageScore, refresh: refreshHealth } = useHardeningHealth();

  const refresh = useCallback(() => {
    setSubsystems(getSubsystemState(currentMode));
    refreshHealth();
  }, [currentMode, refreshHealth]);

  useEffect(() => { refresh(); }, [refresh]);

  const meta = GOVERNANCE_MODE_META[currentMode];
  const ModeIcon = MODE_ICONS[currentMode];

  const subsystemEntries = Object.entries(subsystems) as [keyof SubsystemState, boolean][];

  return (
    <div className="space-y-6">
      {/* Current Mode */}
      <Card className="border-border/20 bg-gradient-to-b from-card/60 to-card/30 backdrop-blur-xl">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <Shield className="w-4 h-4 text-cyan-400" />
              Governance Control Plane
            </CardTitle>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={refresh}>
              <RefreshCw className="w-3.5 h-3.5" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Mode Selector */}
          <div className="grid grid-cols-4 gap-2 mb-6">
            {(Object.keys(GOVERNANCE_MODE_META) as GovernanceMode[]).map(mode => {
              const m = GOVERNANCE_MODE_META[mode];
              const Icon = MODE_ICONS[mode];
              const isActive = mode === currentMode;
              return (
                <button
                  key={mode}
                  onClick={() => { setCurrentMode(mode); setSubsystems(getSubsystemState(mode)); }}
                  className={cn(
                    'p-3 rounded-xl border text-center transition-all',
                    isActive
                      ? 'border-cyan-500/40 bg-cyan-500/10 scale-[1.02]'
                      : 'border-border/30 bg-muted/10 hover:border-border/50'
                  )}
                >
                  <Icon className={cn('w-5 h-5 mx-auto mb-1', m.color)} />
                  <div className="text-xs font-bold">{m.label}</div>
                  <div className="text-[9px] text-muted-foreground">{m.icon}</div>
                </button>
              );
            })}
          </div>

          {/* Mode Description */}
          <div className="p-4 rounded-xl border border-border/30 bg-muted/10 mb-4">
            <div className="flex items-center gap-2 mb-2">
              <ModeIcon className={cn('w-4 h-4', meta.color)} />
              <span className="text-sm font-bold">{meta.label} Mode</span>
              <Badge className={cn('text-[10px]', meta.color === 'text-green-400' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' : meta.color === 'text-red-400' ? 'bg-red-500/20 text-red-400 border-red-500/40' : meta.color === 'text-blue-400' ? 'bg-blue-500/20 text-blue-400 border-blue-500/40' : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40')}>
                {currentMode}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">{meta.description}</p>
          </div>

          {/* Subsystem States */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {subsystemEntries.map(([key, enabled]) => (
              <div
                key={key}
                className={cn(
                  'p-2.5 rounded-lg border text-center transition-colors',
                  enabled
                    ? 'border-emerald-500/30 bg-emerald-500/10'
                    : 'border-red-500/20 bg-red-500/5'
                )}
              >
                <div className={cn('text-[10px] font-mono font-bold', enabled ? 'text-emerald-400' : 'text-red-400')}>
                  {enabled ? '● ON' : '○ OFF'}
                </div>
                <div className="text-[9px] text-muted-foreground mt-0.5 font-mono">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Hardening Health Grid */}
      <Card className="border-border/20 bg-gradient-to-b from-card/60 to-card/30 backdrop-blur-xl">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-400" />
            Hardening Health — {modules.length} Modules
            <Badge className={cn('text-[10px] ml-auto',
              overallGrade === 'A' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' :
              overallGrade === 'B' ? 'bg-blue-500/20 text-blue-400 border-blue-500/40' :
              'bg-amber-500/20 text-amber-400 border-amber-500/40'
            )}>
              {overallGrade} — {averageScore}/100
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {modules.map(mod => (
              <motion.div
                key={mod.module}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className={cn(
                  'p-2.5 rounded-lg border text-center transition-all hover:scale-[1.02]',
                  mod.grade === 'A' ? 'border-emerald-500/30 bg-emerald-500/10' :
                  mod.grade === 'B' ? 'border-blue-500/30 bg-blue-500/10' :
                  mod.grade === 'C' ? 'border-amber-500/30 bg-amber-500/10' :
                  'border-red-500/30 bg-red-500/10'
                )}
              >
                <div className={cn('text-lg font-bold font-mono',
                  mod.grade === 'A' ? 'text-emerald-400' :
                  mod.grade === 'B' ? 'text-blue-400' :
                  mod.grade === 'C' ? 'text-amber-400' : 'text-red-400'
                )}>
                  {mod.grade}
                </div>
                <div className="text-[9px] font-mono font-bold text-foreground/80">{mod.module}</div>
                <div className="text-[8px] text-muted-foreground">{mod.score}/100</div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
