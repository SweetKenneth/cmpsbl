/**
 * Quick Actions Panel v7.5.3 - System-wide controls
 * Heal, backup, restart, diagnostics with Substrate Voice notifications
 */

import { 
  Wrench, Server, Activity, Loader2, Shield, 
  Zap, Terminal, CheckCircle2, Sparkles
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { useSystemHeal, useSystemBackup } from '@/hooks/useSubstrateOSEnhanced';
import { useSubstrateHealthScore } from '@/hooks/useSubstrateOS';
import { system } from '@/lib/substrate';
import { useSubstrateVoice } from '@/components/substrate-os/audio';
import { useState } from 'react';

interface QuickActionsPanelProps {
  enabled: boolean;
  onOpenTerminal?: () => void;
}

export function QuickActionsPanel({ enabled, onOpenTerminal }: QuickActionsPanelProps) {
  const healthScore = useSubstrateHealthScore();
  const healMutation = useSystemHeal();
  const backupMutation = useSystemBackup();
  const voice = useSubstrateVoice();
  const [diagnosticsRunning, setDiagnosticsRunning] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<Record<string, boolean>>({});

  const showSuccess = (actionId: string) => {
    setActionSuccess(prev => ({ ...prev, [actionId]: true }));
    setTimeout(() => setActionSuccess(prev => ({ ...prev, [actionId]: false })), 2000);
  };

  const handleHealAll = async () => {
    voice.info('Initiating system-wide heal', 'Scanning all modules for degradation...', 'SYSTEM');
    try {
      await healMutation.mutateAsync(undefined);
      voice.success('System heal complete', 'All modules restored to optimal state', 'SYSTEM');
      healthScore.refetch();
      showSuccess('heal');
    } catch {
      voice.error('Heal operation failed', 'Manual intervention may be required', 'SYSTEM');
    }
  };

  const handleBackup = async () => {
    voice.info('Creating system backup', 'Capturing current substrate state...', 'SYSTEM');
    try {
      const result = await backupMutation.mutateAsync();
      voice.success('Backup complete', `Snapshot saved: ${(result as any)?.backup_id?.slice(0, 8) || 'OK'}`, 'SYSTEM');
      showSuccess('backup');
    } catch {
      voice.error('Backup failed', 'Storage write error detected', 'SYSTEM');
    }
  };

  const handleDiagnostics = async () => {
    setDiagnosticsRunning(true);
    voice.system('Running full diagnostics', 'Analyzing all 14 modules...', 'VISION');
    try {
      const result = await system.diagnostics();
      if (result?.success) {
        voice.success('Diagnostics complete', 'All systems nominal. No anomalies detected.', 'VISION');
        showSuccess('diagnostics');
      } else {
        voice.warning('Diagnostics found issues', 'Review module health for details', 'VISION');
      }
    } catch {
      voice.error('Diagnostics failed', 'Unable to complete system analysis', 'VISION');
    } finally {
      setDiagnosticsRunning(false);
    }
  };

  const actions = [
    {
      id: 'heal',
      label: 'Auto-Heal',
      icon: Wrench,
      description: 'Repair unhealthy modules',
      gradient: 'bg-gradient-to-br from-emerald-500 to-green-600',
      glowColor: 'emerald',
      isPending: healMutation.isPending,
      onClick: handleHealAll,
      variant: 'success' as const,
    },
    {
      id: 'backup',
      label: 'Backup',
      icon: Server,
      description: 'Create system snapshot',
      gradient: 'bg-gradient-to-br from-blue-500 to-cyan-600',
      glowColor: 'cyan',
      isPending: backupMutation.isPending,
      onClick: handleBackup,
      variant: 'primary' as const,
    },
    {
      id: 'diagnostics',
      label: 'Diagnostics',
      icon: Activity,
      description: 'Full system analysis',
      gradient: 'bg-gradient-to-br from-amber-500 to-orange-600',
      glowColor: 'amber',
      isPending: diagnosticsRunning,
      onClick: handleDiagnostics,
      variant: 'warning' as const,
    },
    {
      id: 'terminal',
      label: 'Terminal',
      icon: Terminal,
      description: 'Open command interface',
      gradient: 'bg-gradient-to-br from-fuchsia-500 to-purple-600',
      glowColor: 'fuchsia',
      isPending: false,
      onClick: onOpenTerminal,
      variant: 'default' as const,
    },
  ];

  if (!enabled) {
    return (
      <motion.div 
        className="p-8 rounded-2xl border border-dashed border-border/30 bg-muted/5"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="text-center">
          <Shield className="w-10 h-10 mx-auto mb-3 text-muted-foreground/20" />
          <p className="text-sm text-muted-foreground/60 italic">
            Quick actions require operator access
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className="p-6 rounded-2xl border border-border/40 bg-gradient-to-br from-card/90 via-card/50 to-transparent backdrop-blur-xl"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
    >
      <div className="flex items-center gap-3 mb-5">
        <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-fuchsia-500/20 border border-cyan-500/30 flex items-center justify-center">
          <Zap className="w-5 h-5 text-cyan-400" />
          <motion.div
            className="absolute inset-0 rounded-xl border border-cyan-400/30"
            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-foreground">Quick Actions</h3>
          <p className="text-[10px] text-muted-foreground font-mono">SYSTEM-WIDE CONTROLS</p>
        </div>
        <Badge 
          variant="outline" 
          className={cn(
            "ml-auto text-[9px] font-mono",
            healthScore.isHealthy 
              ? "border-emerald-500/50 text-emerald-400 bg-emerald-500/10"
              : "border-amber-500/50 text-amber-400 bg-amber-500/10"
          )}
        >
          <motion.span 
            className={cn(
              "w-1.5 h-1.5 rounded-full mr-1.5",
              healthScore.isHealthy ? "bg-emerald-500" : "bg-amber-500"
            )}
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
          {healthScore.isHealthy ? 'ALL SYSTEMS GO' : 'ATTENTION NEEDED'}
        </Badge>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {actions.map((action, idx) => {
          const ActionIcon = action.icon;
          const isSuccess = actionSuccess[action.id];
          
          return (
            <motion.button
              key={action.id}
              onClick={action.onClick}
              disabled={action.isPending}
              className={cn(
                "group relative p-5 rounded-xl border transition-all text-left overflow-hidden",
                "hover:scale-[1.02] active:scale-[0.98]",
                action.variant === 'success' && "border-emerald-500/30 hover:border-emerald-500/60 bg-gradient-to-br from-emerald-500/5 to-transparent",
                action.variant === 'primary' && "border-cyan-500/30 hover:border-cyan-500/60 bg-gradient-to-br from-cyan-500/5 to-transparent",
                action.variant === 'warning' && "border-amber-500/30 hover:border-amber-500/60 bg-gradient-to-br from-amber-500/5 to-transparent",
                action.variant === 'default' && "border-fuchsia-500/30 hover:border-fuchsia-500/60 bg-gradient-to-br from-fuchsia-500/5 to-transparent",
                action.isPending && "opacity-70 cursor-not-allowed"
              )}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + idx * 0.05 }}
              whileHover={{ y: -2 }}
            >
              {/* Hover glow effect */}
              <div className={cn(
                "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl -z-10",
                action.glowColor === 'emerald' && "bg-emerald-500/10",
                action.glowColor === 'cyan' && "bg-cyan-500/10",
                action.glowColor === 'amber' && "bg-amber-500/10",
                action.glowColor === 'fuchsia' && "bg-fuchsia-500/10"
              )} />
              
              <div className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center mb-4 shadow-lg transition-transform group-hover:scale-110",
                action.gradient
              )}>
                {action.isPending ? (
                  <Loader2 className="w-5 h-5 text-white animate-spin" />
                ) : isSuccess ? (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <CheckCircle2 className="w-5 h-5 text-white" />
                  </motion.div>
                ) : (
                  <ActionIcon className="w-5 h-5 text-white" />
                )}
              </div>
              <h4 className="text-sm font-semibold text-foreground mb-1 flex items-center gap-2">
                {action.label}
                {isSuccess && (
                  <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-[10px] text-emerald-400 font-mono"
                  >
                    ✓ DONE
                  </motion.span>
                )}
              </h4>
              <p className="text-[11px] text-muted-foreground leading-relaxed">{action.description}</p>
              
              {/* Decorative corner */}
              <div className={cn(
                "absolute top-2 right-2 w-1.5 h-1.5 rounded-full opacity-50",
                action.variant === 'success' && "bg-emerald-400",
                action.variant === 'primary' && "bg-cyan-400",
                action.variant === 'warning' && "bg-amber-400",
                action.variant === 'default' && "bg-fuchsia-400"
              )} />
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
}
