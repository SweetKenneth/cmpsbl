/**
 * Quick Actions Panel
 * Premium glassmorphic action cards with animated feedback
 */

import { 
  Wrench, Server, Activity, Loader2, Shield, 
  Zap, Terminal, CheckCircle2, Sparkles
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { useSystemHeal, useSystemBackup } from '@/hooks/useSubstrateOSEnhanced';
import { useSubstrateHealthScore } from '@/hooks/useSubstrateOS';
import { system } from '@/lib/substrate';
import { useSubstrateVoice } from '@/components/substrate-os/audio';
import { useState } from 'react';
import { pushToast } from '@/components/toast/SmartToastStore';

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
    pushToast({ message: 'Auto-Heal initiated — Scanning all modules...', variant: 'info' });
    voice.info('Initiating system-wide heal', 'Scanning all modules for degradation...', 'SYSTEM');
    try {
      await healMutation.mutateAsync(undefined);
      pushToast({ message: 'System heal complete', variant: 'success' });
      voice.success('System heal complete', 'All modules restored', 'SYSTEM');
      healthScore.refetch();
      showSuccess('heal');
    } catch {
      pushToast({ message: 'Heal operation failed', variant: 'error' });
      voice.error('Heal failed', 'Manual intervention may be required', 'SYSTEM');
    }
  };

  const handleBackup = async () => {
    voice.info('Creating system backup', 'Capturing substrate state...', 'SYSTEM');
    try {
      const result = await backupMutation.mutateAsync();
      voice.success('Backup complete', `Snapshot saved: ${(result as any)?.backup_id?.slice(0, 8) || 'OK'}`, 'SYSTEM');
      showSuccess('backup');
    } catch {
      voice.error('Backup failed', 'Storage write error', 'SYSTEM');
    }
  };

  const handleDiagnostics = async () => {
    setDiagnosticsRunning(true);
    voice.system('Running diagnostics', 'Analyzing all Matrix Nodes...', 'VISION');
    try {
      const result = await system.diagnostics();
      if (result?.success) {
        voice.success('Diagnostics complete', 'All systems nominal', 'VISION');
        showSuccess('diagnostics');
      } else {
        voice.warning('Issues found', 'Review module health', 'VISION');
      }
    } catch {
      voice.error('Diagnostics failed', 'Unable to complete analysis', 'VISION');
    } finally {
      setDiagnosticsRunning(false);
    }
  };

  const actions = [
    {
      id: 'heal', label: 'Auto-Heal', icon: Wrench,
      description: 'Repair unhealthy modules',
      borderClass: 'border-emerald-500/15 hover:border-emerald-500/40',
      bgGradient: 'from-emerald-500/[0.06]', glowBg: 'bg-emerald-500/10',
      iconGradient: 'bg-gradient-to-br from-emerald-500 to-emerald-600',
      isPending: healMutation.isPending,
      onClick: handleHealAll,
    },
    {
      id: 'backup', label: 'Backup', icon: Server,
      description: 'Create system snapshot',
      borderClass: 'border-cyan-500/15 hover:border-cyan-500/40',
      bgGradient: 'from-cyan-500/[0.06]', glowBg: 'bg-cyan-500/10',
      iconGradient: 'bg-gradient-to-br from-cyan-500 to-cyan-600',
      isPending: backupMutation.isPending,
      onClick: handleBackup,
    },
    {
      id: 'diagnostics', label: 'Diagnostics', icon: Activity,
      description: 'Full system analysis',
      borderClass: 'border-amber-500/15 hover:border-amber-500/40',
      bgGradient: 'from-amber-500/[0.06]', glowBg: 'bg-amber-500/10',
      iconGradient: 'bg-gradient-to-br from-amber-500 to-amber-600',
      isPending: diagnosticsRunning,
      onClick: handleDiagnostics,
    },
    {
      id: 'terminal', label: 'Terminal', icon: Terminal,
      description: 'Command interface',
      borderClass: 'border-fuchsia-500/15 hover:border-fuchsia-500/40',
      bgGradient: 'from-fuchsia-500/[0.06]', glowBg: 'bg-fuchsia-500/10',
      iconGradient: 'bg-gradient-to-br from-fuchsia-500 to-fuchsia-600',
      isPending: false,
      onClick: onOpenTerminal,
    },
  ];

  if (!enabled) {
    return (
      <motion.div 
        className="p-10 rounded-2xl border border-dashed border-border/20 bg-muted/5"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      >
        <div className="text-center">
          <Shield className="w-10 h-10 mx-auto mb-3 text-muted-foreground/15" />
          <p className="text-sm text-muted-foreground/40 italic">Quick actions require operator access</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className="relative rounded-2xl border border-border/30 overflow-hidden"
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-card/95 via-card/60 to-card/30 backdrop-blur-2xl" />
      
      <div className="relative p-6">
        <div className="flex items-center gap-3 mb-6">
          <motion.div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/15 to-fuchsia-500/15 border border-cyan-500/25 flex items-center justify-center">
            <Zap className="w-5 h-5 text-cyan-400" />
            <motion.div
              className="absolute inset-0 rounded-xl border border-cyan-400/20"
              animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0, 0.4] }}
              transition={{ duration: 3, repeat: Infinity }}
            />
          </motion.div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">Quick Actions</h3>
            <p className="text-[10px] text-muted-foreground/60 font-mono tracking-wider">SYSTEM CONTROLS</p>
          </div>
          <Badge 
            variant="outline" 
            className={cn(
              "ml-auto text-[9px] font-mono gap-1.5",
              healthScore.isHealthy 
                ? "border-emerald-500/30 text-emerald-400/80 bg-emerald-500/5"
                : "border-amber-500/30 text-amber-400/80 bg-amber-500/5"
            )}
          >
            <motion.span 
              className={cn("w-1.5 h-1.5 rounded-full", healthScore.isHealthy ? "bg-emerald-500" : "bg-amber-500")}
              animate={{ opacity: [1, 0.4, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
            {healthScore.isHealthy ? 'ALL SYSTEMS GO' : 'ATTENTION'}
          </Badge>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {actions.map((action, idx) => {
            const ActionIcon = action.icon;
            const isSuccess = actionSuccess[action.id];
            
            return (
              <motion.button
                key={action.id}
                onClick={action.onClick}
                disabled={action.isPending}
                aria-label={`${action.label}: ${action.description}`}
                className={cn(
                  "group relative p-5 rounded-xl border text-left overflow-hidden transition-all duration-200",
                  action.borderClass,
                  action.isPending && "opacity-60 cursor-not-allowed"
                )}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 + idx * 0.06 }}
                whileHover={{ y: -3, transition: { duration: 0.15 } }}
                whileTap={{ scale: 0.98 }}
              >
                {/* Background gradient on hover */}
                <div className={cn(
                  "absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-300",
                  action.bgGradient, "to-transparent"
                )} />
                
                {/* Glow on hover */}
                <div className={cn(
                  "absolute -inset-2 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-2xl -z-10",
                  action.glowBg
                )} />
                
                <div className="relative">
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110 duration-200",
                    action.iconGradient,
                    "shadow-lg"
                  )}
                    style={{ boxShadow: `0 8px 24px -4px var(--tw-shadow-color, rgba(0,0,0,0.2))` }}
                  >
                    {action.isPending ? (
                      <Loader2 className="w-5 h-5 text-white animate-spin" />
                    ) : isSuccess ? (
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 400 }}>
                        <CheckCircle2 className="w-5 h-5 text-white" />
                      </motion.div>
                    ) : (
                      <ActionIcon className="w-5 h-5 text-white" />
                    )}
                  </div>
                  <h4 className="text-sm font-semibold text-foreground mb-0.5 flex items-center gap-2">
                    {action.label}
                    {isSuccess && (
                      <motion.span initial={{ opacity: 0, x: -5 }} animate={{ opacity: 1, x: 0 }} className="text-[10px] text-emerald-400 font-mono">✓</motion.span>
                    )}
                  </h4>
                  <p className="text-[11px] text-muted-foreground/60 leading-relaxed">{action.description}</p>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
