/**
 * Nexus AI Usage Card
 * Tracks Nexus fleet usage across free-tier providers
 * Zero paid AI dependencies — all routing via Nexus fleet
 */

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Gauge, RefreshCw, TrendingUp, Zap, AlertTriangle, Activity } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { getFleetStatus } from '@/lib/nexus/router';

interface UsageStats {
  today: { calls: number; tokens: number };
  thisWeek: { calls: number; tokens: number };
  thisMonth: { calls: number; tokens: number };
}

// Nexus fleet daily capacity (sum of all free-tier RPDs at 80% safety margin)
// 14 providers: Groq(640) + Cerebras(9216) + SambaNova(26) + Google(1200) +
// DeepSeek(79999) + Together(79999) + OR×4(640) + Mistral(424) + Cohere(21) + Hyperbolic(63999) + FAL(500)
const FLEET_LIMITS = {
  daily: 236664,     // Total governed RPD across 14 providers
  weekly: 1653148,
  monthly: 7084920,
};

// Each SEBA evolution cycle uses ~2-3 LLM calls
const CALLS_PER_CYCLE = 2.5;
const DAILY_CYCLE_LIMIT = Math.floor(FLEET_LIMITS.daily / CALLS_PER_CYCLE);
const MONTHLY_CYCLE_LIMIT = Math.floor(FLEET_LIMITS.monthly / CALLS_PER_CYCLE);

export function NexusUsageCard() {
  const [usage, setUsage] = useState<UsageStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fleetHealth, setFleetHealth] = useState<number>(0);

  const fetchUsage = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

      // Fetch usage from ai_usage_log
      const { data, error: fetchError } = await supabase
        .from('ai_usage_log')
        .select('created_at, tokens_used, provider')
        .gte('created_at', monthStart)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      const today = { calls: 0, tokens: 0 };
      const thisWeek = { calls: 0, tokens: 0 };
      const thisMonth = { calls: 0, tokens: 0 };

      const todayDate = now.toISOString().split('T')[0];
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();

      (data || []).forEach((row: any) => {
        thisMonth.calls++;
        thisMonth.tokens += row.tokens_used || 0;

        if (row.created_at >= weekAgo) {
          thisWeek.calls++;
          thisWeek.tokens += row.tokens_used || 0;
        }

        if (row.created_at?.startsWith(todayDate)) {
          today.calls++;
          today.tokens += row.tokens_used || 0;
        }
      });

      setUsage({ today, thisWeek, thisMonth });

      // Get fleet health
      const fleet = getFleetStatus();
      setFleetHealth(fleet.healthyCount);
    } catch (err) {
      console.error('Failed to fetch Nexus usage:', err);
      setError('Failed to load usage data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsage();
    const interval = setInterval(fetchUsage, 60000);
    return () => clearInterval(interval);
  }, [fetchUsage]);

  const getDailyPercent = () => {
    if (!usage) return 0;
    return Math.min(100, (usage.today.calls / FLEET_LIMITS.daily) * 100);
  };

  const getMonthlyPercent = () => {
    if (!usage) return 0;
    return Math.min(100, (usage.thisMonth.calls / FLEET_LIMITS.monthly) * 100);
  };

  const getStatusColor = (percent: number) => {
    if (percent >= 90) return 'text-destructive bg-destructive/20 border-destructive/40';
    if (percent >= 70) return 'text-neon-amber bg-neon-amber/20 border-neon-amber/40';
    return 'text-neon-green bg-neon-green/20 border-neon-green/40';
  };

  const dailyRemaining = Math.max(0, FLEET_LIMITS.daily - (usage?.today.calls || 0));
  const monthlyRemaining = Math.max(0, FLEET_LIMITS.monthly - (usage?.thisMonth.calls || 0));

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <Card className="border-neon-cyan/30 bg-gradient-to-br from-neon-cyan/10 via-background to-transparent shadow-lg shadow-neon-cyan/5 hover:shadow-neon-cyan/10 transition-shadow">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-neon-cyan/30 to-neon-cyan/20 flex items-center justify-center border border-neon-cyan/30 shadow-sm shadow-neon-cyan/20">
              <Activity className="w-4 h-4 text-neon-cyan" />
            </div>
            <span className="text-foreground/90">Nexus Fleet Usage</span>
            <Badge variant="outline" className="ml-1 text-[9px] text-neon-green bg-neon-green/10 border-neon-green/30">
              {fleetHealth}/7 healthy
            </Badge>
            <Button
              size="icon"
              variant="ghost"
              className="ml-auto h-6 w-6"
              onClick={fetchUsage}
              disabled={loading}
            >
              <RefreshCw className={cn("w-3 h-3", loading && "animate-spin")} />
            </Button>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {error ? (
            <div className="text-center py-4 text-muted-foreground text-sm">
              <AlertTriangle className="w-5 h-5 mx-auto mb-2 text-neon-amber" />
              {error}
            </div>
          ) : loading && !usage ? (
            <div className="text-center py-4 text-muted-foreground text-sm">
              Loading usage data...
            </div>
          ) : usage && (
            <>
              {/* Daily Usage */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Today</span>
                  <span className="font-mono text-foreground/90">
                    {usage.today.calls.toLocaleString()} / {FLEET_LIMITS.daily.toLocaleString()}
                  </span>
                </div>
                <Progress 
                  value={getDailyPercent()} 
                  className="h-2"
                />
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className={cn("text-[9px]", getStatusColor(getDailyPercent()))}>
                    {dailyRemaining.toLocaleString()} remaining
                  </Badge>
                  <span className="text-[10px] text-muted-foreground">
                    ~{Math.floor(dailyRemaining / CALLS_PER_CYCLE)} cycles
                  </span>
                </div>
              </div>

              {/* Monthly Usage */}
              <div className="space-y-2 pt-2 border-t border-border/30">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">This Month</span>
                  <span className="font-mono text-foreground/90">
                    {usage.thisMonth.calls.toLocaleString()} / {FLEET_LIMITS.monthly.toLocaleString()}
                  </span>
                </div>
                <Progress 
                  value={getMonthlyPercent()} 
                  className="h-2"
                />
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className={cn("text-[9px]", getStatusColor(getMonthlyPercent()))}>
                    {monthlyRemaining.toLocaleString()} remaining
                  </Badge>
                  <span className="text-[10px] text-muted-foreground">
                    ~{Math.floor(monthlyRemaining / CALLS_PER_CYCLE)} cycles
                  </span>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/30">
                <div className="p-2.5 rounded-lg bg-background/60 border border-border/40">
                  <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                    <Zap className="w-3 h-3" />
                    This Week
                  </div>
                  <p className="text-lg font-bold text-foreground/90">{usage.thisWeek.calls.toLocaleString()}</p>
                </div>
                <div className="p-2.5 rounded-lg bg-background/60 border border-border/40">
                  <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                    <TrendingUp className="w-3 h-3" />
                    Cost
                  </div>
                  <p className="text-lg font-bold text-neon-green">$0.00</p>
                </div>
              </div>
            </>
          )}

          <p className="text-[10px] text-muted-foreground/70 text-center pt-1">
            Nexus fleet: 13 free-tier providers, ~{FLEET_LIMITS.daily.toLocaleString()} calls/day
          </p>
          <p className="text-[10px] text-muted-foreground/60 text-center">
            ≈ {DAILY_CYCLE_LIMIT.toLocaleString()} cycles/day, {MONTHLY_CYCLE_LIMIT.toLocaleString()} cycles/month — zero cost
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Backward compat export
export const CloudAIUsageCard = NexusUsageCard;
