/**
 * Stream Control Card
 * Gradient accents, real-time status, action buttons with Memory Stream Voice
 */

import { useState } from 'react';
import { 
  Loader2, CheckCircle2, XCircle, Activity, Zap, 
  ChevronRight, PlayCircle, RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
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
  layer: string;
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

const layerBadges: Record<string, { label: string; color: string }> = {
  kernel: { label: 'KERNEL', color: 'border-neon-amber/50 text-neon-amber bg-neon-amber/10' },
  cognitive: { label: 'COGNITIVE', color: 'border-neon-purple/50 text-neon-purple bg-neon-purple/10' },
  operational: { label: 'OPERATIONAL', color: 'border-neon-blue/50 text-neon-blue bg-neon-blue/10' },
  admin: { label: 'ADMIN', color: 'border-neon-green/50 text-neon-green bg-neon-green/10' },
  orchestrator: { label: 'ORCHESTRATOR', color: 'border-neon-magenta/50 text-neon-magenta bg-neon-magenta/10' },
  infrastructure: { label: 'INFRA', color: 'border-neon-cyan/50 text-neon-cyan bg-neon-cyan/10' },
  infra: { label: 'INFRA', color: 'border-neon-cyan/50 text-neon-cyan bg-neon-cyan/10' },
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
  const [recentSuccess, setRecentSuccess] = useState<string | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const layerBadge = layerBadges[layer] ?? { label: layer?.toUpperCase() ?? 'UNKNOWN', color: 'border-border/50 text-muted-foreground bg-muted/10' };
  const voice = useSubstrateVoice();
  const { play } = useSoundEffects();

  const handleAction = async (actionId: string) => {
    if (!onAction) return;
    setPendingAction(actionId);
    play('task_start');
    try {
      await onAction(actionId);
      play('task_complete');
      setRecentSuccess(actionId);
      setTimeout(() => setRecentSuccess(null), 2000);
    } catch (e) {
      voice.error(`${name} action failed`, 'Check module health status', name.toUpperCase());
    } finally {
      setPendingAction(null);
    }
  };

  return (
    <motion.div
      className={cn(
        "group relative rounded-2xl border backdrop-blur-xl overflow-hidden",
        "transition-all duration-300",
        isActive 
          ? "border-border/50 bg-gradient-to-br from-card/95 to-card/70 hover:border-border/70" 
          : "border-border/30 bg-muted/20 opacity-60"
      )}
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, delay }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={isActive ? { y: -4, scale: 1.01 } : {}}
    >
      {/* Gradient accent bar */}
      <div className={cn("h-1 w-full", gradient)} />

      {/* Hover glow effect */}
      <AnimatePresence>
        {isActive && isHovered && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={cn("absolute inset-0 opacity-20 blur-3xl -z-10", accentColor)}
          />
        )}
      </AnimatePresence>

      <div className="p-4 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <motion.div 
              className={cn(
                "w-11 h-11 rounded-xl flex items-center justify-center border shadow-lg",
                isActive ? gradient : "bg-muted/50 border-border/50"
              )}
              whileHover={isActive ? { scale: 1.1, rotate: 5 } : {}}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Icon className={cn(
                "w-5 h-5",
                isActive ? "text-white" : "text-muted-foreground"
              )} />
            </motion.div>
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
            <Badge variant="outline" className={cn("text-[8px] h-5 font-mono", layerBadge.color)}>
              {layerBadge.label}
            </Badge>
            <div className="relative flex items-center">
              <motion.span 
                className={cn(
                  "w-2.5 h-2.5 rounded-full",
                  isActive ? "bg-neon-green" : "bg-destructive"
                )}
                animate={isActive ? { scale: [1, 1.2, 1] } : {}}
                transition={{ duration: 2, repeat: Infinity }}
              />
              {isActive && (
                <motion.span 
                  className="absolute inset-0 w-2.5 h-2.5 rounded-full bg-neon-green"
                  animate={{ scale: [1, 2], opacity: [0.5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
              )}
            </div>
          </div>
        </div>

        {/* Metrics */}
        {metrics.length > 0 && (
          <div className="grid grid-cols-2 gap-2">
            {metrics.slice(0, 4).map((metric, i) => (
              <motion.div 
                key={metric.label}
                className="px-3 py-2.5 rounded-lg bg-muted/30 border border-border/30 hover:bg-muted/40 transition-colors"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: delay + 0.1 + i * 0.05 }}
              >
                <span className="text-[9px] text-muted-foreground uppercase font-mono block mb-0.5">
                  {metric.label}
                </span>
                <span className="text-sm font-bold font-mono text-foreground">
                  {metric.value}
                </span>
              </motion.div>
            ))}
          </div>
        )}

        {/* Actions */}
        {actions.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {actions.slice(0, 3).map((action) => {
              const ActionIcon = action.icon || PlayCircle;
              const isPending = pendingAction === action.id;
              const isSuccess = recentSuccess === action.id;
              
              return (
                <Button
                  key={action.id}
                  variant="outline"
                  size="sm"
                  onClick={() => handleAction(action.id)}
                  disabled={action.disabled || isPending || isLoading}
                  className={cn(
                    "h-8 text-xs gap-1.5 flex-1 transition-all",
                    action.variant === 'primary' && "border-neon-cyan/40 text-neon-cyan hover:bg-neon-cyan/10 hover:border-neon-cyan/60",
                    action.variant === 'success' && "border-neon-green/40 text-neon-green hover:bg-neon-green/10 hover:border-neon-green/60",
                    action.variant === 'warning' && "border-neon-amber/40 text-neon-amber hover:bg-neon-amber/10 hover:border-neon-amber/60",
                    isSuccess && "border-neon-green/60 bg-neon-green/10"
                  )}
                >
                  {isPending ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : isSuccess ? (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring" }}
                    >
                      <CheckCircle2 className="w-3 h-3 text-neon-green" />
                    </motion.div>
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
                disabled={isLoading}
                className="h-8 w-8 p-0 hover:bg-muted/50"
              >
                <RefreshCw className={cn("w-3.5 h-3.5", isLoading && "animate-spin")} />
              </Button>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}
