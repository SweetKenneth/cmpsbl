/**
 * Module Control Card v5.5.0 - Individual module powerhouse control
 * Gradient accents, real-time status, action buttons with Substrate Voice
 */

import { useState } from 'react';
import { 
  Loader2, CheckCircle2, XCircle, Activity, Zap, 
  ChevronRight, PlayCircle, RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { useSubstrateVoice } from '@/components/substrate-os/audio';
import { useSoundEffects } from '@/components/agency/features/SoundEffects';

export interface ModuleAction {
  id: string;
  label: string;
  icon?: React.ElementType;
  variant?: 'default' | 'primary' | 'success' | 'warning';
  disabled?: boolean;
}

export interface ModuleControlCardProps {
  id: string;
  name: string;
  layer: 'kernel' | 'cognitive' | 'operational' | 'admin' | 'orchestrator';
  icon: React.ElementType;
  description: string;
  isActive: boolean;
  isLoading?: boolean;
  metrics?: { label: string; value: string | number }[];
  actions?: ModuleAction[];
  onAction?: (actionId: string) => Promise<void>;
  onRefresh?: () => void;
  gradient: string;
  accentColor: string;
  delay?: number;
}

const layerBadges = {
  kernel: { label: 'KERNEL', color: 'border-orange-500/50 text-orange-400 bg-orange-500/10' },
  cognitive: { label: 'COGNITIVE', color: 'border-purple-500/50 text-purple-400 bg-purple-500/10' },
  operational: { label: 'OPERATIONAL', color: 'border-blue-500/50 text-blue-400 bg-blue-500/10' },
  admin: { label: 'ADMIN', color: 'border-emerald-500/50 text-emerald-400 bg-emerald-500/10' },
  orchestrator: { label: 'ORCHESTRATOR', color: 'border-fuchsia-500/50 text-fuchsia-400 bg-fuchsia-500/10' },
};

export function ModuleControlCard({
  id,
  name,
  layer,
  icon: Icon,
  description,
  isActive,
  isLoading,
  metrics = [],
  actions = [],
  onAction,
  onRefresh,
  gradient,
  accentColor,
  delay = 0,
}: ModuleControlCardProps) {
  const [pendingAction, setPendingAction] = useState<string | null>(null);
  const layerBadge = layerBadges[layer];
  const voice = useSubstrateVoice();
  const { play } = useSoundEffects();

  const handleAction = async (actionId: string) => {
    if (!onAction) return;
    setPendingAction(actionId);
    play('task_start');
    try {
      await onAction(actionId);
      play('task_complete');
    } catch (e) {
      voice.error(`${name} action failed`, 'Check module health status', name.toUpperCase());
    } finally {
      setPendingAction(null);
    }
  };

  return (
    <motion.div
      className={cn(
        "relative rounded-2xl border backdrop-blur-xl overflow-hidden",
        "transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl",
        isActive 
          ? "border-border/50 bg-gradient-to-br from-card/90 to-card/60" 
          : "border-border/30 bg-muted/20 opacity-60"
      )}
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, delay }}
    >
      {/* Gradient accent bar */}
      <div className={cn("h-1 w-full", gradient)} />

      {/* Glow effect */}
      {isActive && (
        <div className={cn(
          "absolute inset-0 opacity-10 blur-3xl -z-10",
          accentColor
        )} />
      )}

      <div className="p-4 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center border",
              isActive ? gradient : "bg-muted/50 border-border/50"
            )}>
              <Icon className={cn(
                "w-5 h-5",
                isActive ? "text-white" : "text-muted-foreground"
              )} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-foreground">{name}</h3>
                {isLoading && <Loader2 className="w-3 h-3 animate-spin text-muted-foreground" />}
              </div>
              <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider">
                {description}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={cn("text-[8px] h-5", layerBadge.color)}>
              {layerBadge.label}
            </Badge>
            <div className="flex items-center gap-1.5">
              <span className={cn(
                "w-2 h-2 rounded-full",
                isActive ? "bg-emerald-500" : "bg-red-500"
              )}>
                {isActive && (
                  <span className="absolute w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                )}
              </span>
            </div>
          </div>
        </div>

        {/* Metrics */}
        {metrics.length > 0 && (
          <div className="grid grid-cols-2 gap-2">
            {metrics.slice(0, 4).map((metric) => (
              <div 
                key={metric.label}
                className="px-3 py-2 rounded-lg bg-muted/30 border border-border/30"
              >
                <span className="text-[9px] text-muted-foreground uppercase font-mono block mb-0.5">
                  {metric.label}
                </span>
                <span className="text-sm font-bold font-mono text-foreground">
                  {metric.value}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Actions */}
        {actions.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {actions.slice(0, 3).map((action) => {
              const ActionIcon = action.icon || PlayCircle;
              const isPending = pendingAction === action.id;
              
              return (
                <Button
                  key={action.id}
                  variant="outline"
                  size="sm"
                  onClick={() => handleAction(action.id)}
                  disabled={action.disabled || isPending || isLoading}
                  className={cn(
                    "h-8 text-xs gap-1.5 flex-1",
                    action.variant === 'primary' && "border-cyan-500/40 text-cyan-400 hover:bg-cyan-500/10",
                    action.variant === 'success' && "border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10",
                    action.variant === 'warning' && "border-amber-500/40 text-amber-400 hover:bg-amber-500/10"
                  )}
                >
                  {isPending ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <ActionIcon className="w-3 h-3" />
                  )}
                  {action.label}
                </Button>
              );
            })}
            {onRefresh && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onRefresh}
                className="h-8 w-8 p-0"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </Button>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}
