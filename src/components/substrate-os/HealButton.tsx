/**
 * Heal Button — Prominent system healing control
 * Hardened UI component with visual feedback
 */

import { useState } from 'react';
import { Wrench, Loader2, CheckCircle2, Zap, Heart, RefreshCw, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

interface HealButtonProps {
  variant?: 'default' | 'compact' | 'prominent';
  healthScore?: number;
  onHealComplete?: (result: HealResult) => void;
}

interface HealResult {
  success: boolean;
  healed_modules?: string[];
  new_health?: Record<string, number>;
  message?: string;
  error?: string;
}

export function HealButton({ 
  variant = 'default', 
  healthScore = 100,
  onHealComplete 
}: HealButtonProps) {
  const [isHealing, setIsHealing] = useState(false);
  const [healResult, setHealResult] = useState<HealResult | null>(null);
  const queryClient = useQueryClient();

  const triggerHeal = async () => {
    setIsHealing(true);
    setHealResult(null);
    
    try {
      // Call substrate heal action
      const { data, error } = await supabase.functions.invoke('pf-substrate', {
        body: { module: 'system', action: 'heal' }
      });

      if (error) throw error;

      const result: HealResult = {
        success: data?.success ?? false,
        healed_modules: data?.healed_modules ?? [],
        new_health: data?.new_health ?? {},
        message: data?.message ?? 'Healing complete',
      };

      setHealResult(result);
      
      if (result.success) {
        toast.success(`🔧 ${result.message}`, {
          description: result.healed_modules?.length 
            ? `Healed: ${result.healed_modules.join(', ')}`
            : 'All systems restored',
        });
      } else {
        toast.error('Healing encountered issues');
      }

      // Invalidate all substrate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['substrate'] });
      queryClient.invalidateQueries({ queryKey: ['live'] });
      
      onHealComplete?.(result);
      
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      toast.error('Heal operation failed', { description: errorMsg });
      setHealResult({ success: false, error: errorMsg });
    } finally {
      setIsHealing(false);
    }
  };

  // Determine urgency based on health score
  const isUrgent = healthScore < 50;
  const isDegraded = healthScore < 80;

  if (variant === 'prominent') {
    return (
      <div className={cn(
        "relative overflow-hidden rounded-xl border p-4 transition-all",
        isUrgent ? "border-destructive/50 bg-destructive/5" :
        isDegraded ? "border-neon-amber/50 bg-neon-amber/5" :
        "border-neon-green/30 bg-neon-green/5"
      )}>
        {/* Animated pulse for urgent state */}
        {isUrgent && (
          <div className="absolute inset-0 bg-destructive/10 animate-pulse" />
        )}
        
        <div className="relative flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-12 h-12 rounded-lg flex items-center justify-center",
              isUrgent ? "bg-destructive/20" :
              isDegraded ? "bg-neon-amber/20" :
              "bg-neon-green/20"
            )}>
              {isHealing ? (
                <Loader2 className={cn(
                  "w-6 h-6 animate-spin",
                  isUrgent ? "text-destructive" :
                  isDegraded ? "text-neon-amber" :
                  "text-neon-green"
                )} />
              ) : (
                <Heart className={cn(
                  "w-6 h-6",
                  isUrgent ? "text-destructive" :
                  isDegraded ? "text-neon-amber" :
                  "text-neon-green"
                )} />
              )}
            </div>
            
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-medium text-sm">Orchestrator Health</h3>
                <Badge 
                  variant="outline" 
                  className={cn(
                    "text-[10px] h-5",
                    isUrgent ? "border-destructive/50 text-destructive" :
                    isDegraded ? "border-neon-amber/50 text-neon-amber" :
                    "border-neon-green/50 text-neon-green"
                  )}
                >
                  {healthScore}%
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                {isUrgent ? "Critical — immediate healing required" :
                 isDegraded ? "Degraded — healing recommended" :
                 "Healthy — all systems nominal"}
              </p>
            </div>
          </div>
          
          <Button
            onClick={triggerHeal}
            disabled={isHealing}
            size="lg"
            className={cn(
              "gap-2 min-w-[140px]",
              isUrgent ? "bg-destructive hover:bg-destructive/90" :
              isDegraded ? "bg-neon-amber hover:bg-neon-amber text-black" :
              "bg-neon-green hover:bg-green-700"
            )}
          >
            {isHealing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Healing...
              </>
            ) : healResult?.success ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                Healed!
              </>
            ) : (
              <>
                <Zap className="w-4 h-4" />
                {isUrgent ? "Heal Now" : "Run Heal"}
              </>
            )}
          </Button>
        </div>
        
        {healResult && (
          <div className="mt-3 pt-3 border-t border-border/50">
            <div className="flex flex-wrap gap-1.5">
              {healResult.healed_modules?.map((mod) => (
                <Badge key={mod} variant="outline" className="text-[9px] h-4 bg-neon-green/10 border-neon-green/30 text-neon-green">
                  <CheckCircle2 className="w-2 h-2 mr-1" />
                  {mod}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <Button
        onClick={triggerHeal}
        disabled={isHealing}
        variant="outline"
        size="sm"
        className={cn(
          "h-8 gap-1.5 text-xs",
          isUrgent ? "border-destructive/50 text-destructive hover:bg-destructive/10" :
          isDegraded ? "border-neon-amber/50 text-neon-amber hover:bg-neon-amber/10" :
          "border-neon-green/30 text-neon-green hover:bg-neon-green/10"
        )}
      >
        {isHealing ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <Wrench className="w-3.5 h-3.5" />
        )}
        {isHealing ? 'Healing...' : 'Heal'}
      </Button>
    );
  }

  // Default variant
  return (
    <Button
      onClick={triggerHeal}
      disabled={isHealing}
      variant={isUrgent ? "destructive" : "outline"}
      className={cn(
        "gap-2",
        !isUrgent && isDegraded && "border-neon-amber/50 text-neon-amber hover:bg-neon-amber/10",
        !isUrgent && !isDegraded && "border-neon-green/30 text-neon-green hover:bg-neon-green/10"
      )}
    >
      {isHealing ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          Healing System...
        </>
      ) : (
        <>
          <Wrench className="w-4 h-4" />
          {isUrgent ? "Emergency Heal" : "Auto-Heal"}
        </>
      )}
    </Button>
  );
}

// Quick heal action for use in other components
export async function quickHeal(): Promise<HealResult> {
  try {
    const { data, error } = await supabase.functions.invoke('pf-substrate', {
      body: { module: 'system', action: 'heal' }
    });
    
    if (error) throw error;
    
    return {
      success: data?.success ?? false,
      healed_modules: data?.healed_modules ?? [],
      new_health: data?.new_health ?? {},
      message: data?.message ?? 'Healing complete',
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error',
    };
  }
}
