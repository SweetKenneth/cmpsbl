/**
 * Quick Actions Panel v5.5.0 - System-wide controls
 * Heal, backup, restart, diagnostics
 */

import { 
  Wrench, Server, Activity, Loader2, Shield, 
  Zap, Terminal
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { useSystemHeal, useSystemBackup } from '@/hooks/useSubstrateOSEnhanced';
import { useSubstrateHealthScore, useSystemStatus } from '@/hooks/useSubstrateOS';
import { system } from '@/lib/substrate';

interface QuickActionsPanelProps {
  enabled: boolean;
  onOpenTerminal?: () => void;
}

export function QuickActionsPanel({ enabled, onOpenTerminal }: QuickActionsPanelProps) {
  const healthScore = useSubstrateHealthScore();
  const healMutation = useSystemHeal();
  const backupMutation = useSystemBackup();

  const handleHealAll = async () => {
    toast.info('Initiating system-wide heal...');
    try {
      await healMutation.mutateAsync(undefined);
      toast.success('System heal complete');
      healthScore.refetch();
    } catch {
      toast.error('Heal operation failed');
    }
  };

  const handleBackup = async () => {
    toast.info('Creating system backup...');
    try {
      await backupMutation.mutateAsync();
      toast.success('Backup created successfully');
    } catch {
      toast.error('Backup failed');
    }
  };

  const handleDiagnostics = async () => {
    toast.info('Running full diagnostics...');
    try {
      const result = await system.diagnostics();
      if (result?.success) {
        toast.success('Diagnostics complete - all systems nominal');
      } else {
        toast.warning('Diagnostics found issues');
      }
    } catch {
      toast.error('Diagnostics failed');
    }
  };

  const actions = [
    {
      id: 'heal',
      label: 'Auto-Heal',
      icon: Wrench,
      description: 'Repair unhealthy modules',
      gradient: 'bg-gradient-to-r from-emerald-500 to-green-600',
      isPending: healMutation.isPending,
      onClick: handleHealAll,
      variant: 'success' as const,
    },
    {
      id: 'backup',
      label: 'Backup',
      icon: Server,
      description: 'Create system snapshot',
      gradient: 'bg-gradient-to-r from-blue-500 to-cyan-600',
      isPending: backupMutation.isPending,
      onClick: handleBackup,
      variant: 'primary' as const,
    },
    {
      id: 'diagnostics',
      label: 'Diagnostics',
      icon: Activity,
      description: 'Full system analysis',
      gradient: 'bg-gradient-to-r from-amber-500 to-orange-600',
      isPending: false,
      onClick: handleDiagnostics,
      variant: 'warning' as const,
    },
    {
      id: 'terminal',
      label: 'Terminal',
      icon: Terminal,
      description: 'Open command interface',
      gradient: 'bg-gradient-to-r from-fuchsia-500 to-purple-600',
      isPending: false,
      onClick: onOpenTerminal,
      variant: 'default' as const,
    },
  ];

  if (!enabled) {
    return (
      <motion.div 
        className="p-6 rounded-2xl border border-dashed border-border/30 bg-muted/10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="text-center">
          <Shield className="w-8 h-8 mx-auto mb-2 text-muted-foreground/30" />
          <p className="text-sm text-muted-foreground italic">
            Quick actions require operator access
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className="p-5 rounded-2xl border border-border/40 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-xl"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500/20 to-fuchsia-500/20 border border-cyan-500/30 flex items-center justify-center">
          <Zap className="w-4 h-4 text-cyan-400" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-foreground">Quick Actions</h3>
          <p className="text-[10px] text-muted-foreground font-mono">system-wide controls</p>
        </div>
        <Badge 
          variant="outline" 
          className={cn(
            "ml-auto text-[9px]",
            healthScore.isHealthy 
              ? "border-emerald-500/50 text-emerald-400 bg-emerald-500/10"
              : "border-amber-500/50 text-amber-400 bg-amber-500/10"
          )}
        >
          {healthScore.isHealthy ? 'READY' : 'ACTION NEEDED'}
        </Badge>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {actions.map((action, idx) => {
          const ActionIcon = action.icon;
          
          return (
            <motion.button
              key={action.id}
              onClick={action.onClick}
              disabled={action.isPending}
              className={cn(
                "relative p-4 rounded-xl border transition-all text-left",
                "hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]",
                action.variant === 'success' && "border-emerald-500/30 hover:border-emerald-500/60 bg-emerald-500/5",
                action.variant === 'primary' && "border-cyan-500/30 hover:border-cyan-500/60 bg-cyan-500/5",
                action.variant === 'warning' && "border-amber-500/30 hover:border-amber-500/60 bg-amber-500/5",
                action.variant === 'default' && "border-fuchsia-500/30 hover:border-fuchsia-500/60 bg-fuchsia-500/5",
                action.isPending && "opacity-70 cursor-not-allowed"
              )}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + idx * 0.05 }}
            >
              <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center mb-3", action.gradient)}>
                {action.isPending ? (
                  <Loader2 className="w-4 h-4 text-white animate-spin" />
                ) : (
                  <ActionIcon className="w-4 h-4 text-white" />
                )}
              </div>
              <h4 className="text-sm font-semibold text-foreground mb-0.5">{action.label}</h4>
              <p className="text-[10px] text-muted-foreground">{action.description}</p>
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
}
