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
              <Shield className="w-4 h-4 text-neon-cyan" />
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
                      ? 'border-neon-cyan/40 bg-neon-cyan/10 scale-[1.02]'
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
              <Badge className={cn('text-[10px]', meta.color === 'text-neon-green' ? 'bg-neon-green/20 text-neon-green border-neon-green/40' : meta.color === 'text-destructive' ? 'bg-destructive/20 text-destructive border-destructive/40' : meta.color === 'text-neon-blue' ? 'bg-neon-blue/20 text-neon-blue border-neon-blue/40' : 'bg-neon-amber/20 text-neon-amber border-neon-amber/40')}>
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
                    ? 'border-neon-green/30 bg-neon-green/10'
                    : 'border-destructive/20 bg-destructive/5'
                )}
              >
                <div className={cn('text-[10px] font-mono font-bold', enabled ? 'text-neon-green' : 'text-destructive')}>
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
            <Activity className="w-4 h-4 text-neon-green" />
            Hardening Health — {modules.length} Modules
            <Badge className={cn('text-[10px] ml-auto',
              overallGrade === 'A' ? 'bg-neon-green/20 text-neon-green border-neon-green/40' :
              overallGrade === 'B' ? 'bg-neon-blue/20 text-neon-blue border-neon-blue/40' :
              'bg-neon-amber/20 text-neon-amber border-neon-amber/40'
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
                  mod.grade === 'A' ? 'border-neon-green/30 bg-neon-green/10' :
                  mod.grade === 'B' ? 'border-neon-blue/30 bg-neon-blue/10' :
                  mod.grade === 'C' ? 'border-neon-amber/30 bg-neon-amber/10' :
                  'border-destructive/30 bg-destructive/10'
                )}
              >
                <div className={cn('text-lg font-bold font-mono',
                  mod.grade === 'A' ? 'text-neon-green' :
                  mod.grade === 'B' ? 'text-neon-blue' :
                  mod.grade === 'C' ? 'text-neon-amber' : 'text-destructive'
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
