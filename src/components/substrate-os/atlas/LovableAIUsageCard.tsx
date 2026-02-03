/**
 * Lovable AI Usage Card
 * v1.0.0 — Tracks Lovable AI gateway usage for evolution cycles
 */

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Gauge, RefreshCw, TrendingUp, Zap, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

interface UsageStats {
  today: { calls: number; tokens: number };
  thisWeek: { calls: number; tokens: number };
  thisMonth: { calls: number; tokens: number };
}

// Budget limits synced with SEBA v2.1.0 safety controls
// These are conservative free tier estimates based on Lovable AI gateway
const FREE_TIER_LIMITS = {
  daily: 50,      // ~50 calls/day included free
  weekly: 300,    // ~300 calls/week
  monthly: 1000,  // ~1000 calls/month included free
};

// Cost per call estimate (after free tier)
const COST_PER_CALL_CENTS = 0.1; // ~$0.001 per call

// Each SEBA evolution cycle uses ~2-3 LLM calls:
// 1. SEBA analyze (pf-seba-llm-analyze)
// 2. Encoded generate (pf-encoded-agent) 
// 3. Optional: verification call
const CALLS_PER_CYCLE = 2.5;

// Budget-aware limits (conservative for safety)
// 50 calls/day ÷ 2.5 calls/cycle = ~20 cycles/day max
const DAILY_CYCLE_LIMIT = Math.floor(FREE_TIER_LIMITS.daily / CALLS_PER_CYCLE);
const MONTHLY_CYCLE_LIMIT = Math.floor(FREE_TIER_LIMITS.monthly / CALLS_PER_CYCLE);

export function LovableAIUsageCard() {
  const [usage, setUsage] = useState<UsageStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsage = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
      const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

      // Fetch usage from lovable_ai_usage table
      const { data, error: fetchError } = await supabase
        .from('lovable_ai_usage')
        .select('date, calls_used, tokens_used, category')
        .gte('date', monthStart.split('T')[0])
        .order('date', { ascending: false });

      if (fetchError) throw fetchError;

      // Aggregate by period
      const today = { calls: 0, tokens: 0 };
      const thisWeek = { calls: 0, tokens: 0 };
      const thisMonth = { calls: 0, tokens: 0 };

      const todayDate = now.toISOString().split('T')[0];
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      (data || []).forEach((row: any) => {
        thisMonth.calls += row.calls_used || 0;
        thisMonth.tokens += row.tokens_used || 0;

        if (row.date >= weekAgo) {
          thisWeek.calls += row.calls_used || 0;
          thisWeek.tokens += row.tokens_used || 0;
        }

        if (row.date === todayDate) {
          today.calls += row.calls_used || 0;
          today.tokens += row.tokens_used || 0;
        }
      });

      setUsage({ today, thisWeek, thisMonth });
    } catch (err) {
      console.error('Failed to fetch Lovable AI usage:', err);
      setError('Failed to load usage data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsage();
    const interval = setInterval(fetchUsage, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, [fetchUsage]);

  const getDailyPercent = () => {
    if (!usage) return 0;
    return Math.min(100, (usage.today.calls / FREE_TIER_LIMITS.daily) * 100);
  };

  const getMonthlyPercent = () => {
    if (!usage) return 0;
    return Math.min(100, (usage.thisMonth.calls / FREE_TIER_LIMITS.monthly) * 100);
  };

  const getStatusColor = (percent: number) => {
    if (percent >= 90) return 'text-red-400 bg-red-500/20 border-red-500/40';
    if (percent >= 70) return 'text-amber-400 bg-amber-500/20 border-amber-500/40';
    return 'text-emerald-400 bg-emerald-500/20 border-emerald-500/40';
  };

  const estimateCycles = (callsRemaining: number) => {
    return Math.floor(callsRemaining / CALLS_PER_CYCLE);
  };

  const dailyRemaining = Math.max(0, FREE_TIER_LIMITS.daily - (usage?.today.calls || 0));
  const monthlyRemaining = Math.max(0, FREE_TIER_LIMITS.monthly - (usage?.thisMonth.calls || 0));
  const dailyCyclesRemaining = estimateCycles(dailyRemaining);
  const monthlyCyclesRemaining = estimateCycles(monthlyRemaining);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <Card className="border-indigo-400/30 bg-gradient-to-br from-indigo-500/10 via-background to-transparent shadow-lg shadow-indigo-500/5 hover:shadow-indigo-500/10 transition-shadow">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500/30 to-indigo-600/20 flex items-center justify-center border border-indigo-400/30 shadow-sm shadow-indigo-500/20">
              <Gauge className="w-4 h-4 text-indigo-300" />
            </div>
            <span className="text-foreground/90">Lovable AI Usage</span>
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
              <AlertTriangle className="w-5 h-5 mx-auto mb-2 text-amber-400" />
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
                    {usage.today.calls} / {FREE_TIER_LIMITS.daily}
                  </span>
                </div>
                <Progress 
                  value={getDailyPercent()} 
                  className="h-2"
                />
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className={cn("text-[9px]", getStatusColor(getDailyPercent()))}>
                    {dailyRemaining} remaining
                  </Badge>
                  <span className="text-[10px] text-muted-foreground">
                    ~{estimateCycles(dailyRemaining)} cycles
                  </span>
                </div>
              </div>

              {/* Monthly Usage */}
              <div className="space-y-2 pt-2 border-t border-border/30">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">This Month</span>
                  <span className="font-mono text-foreground/90">
                    {usage.thisMonth.calls} / {FREE_TIER_LIMITS.monthly}
                  </span>
                </div>
                <Progress 
                  value={getMonthlyPercent()} 
                  className="h-2"
                />
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className={cn("text-[9px]", getStatusColor(getMonthlyPercent()))}>
                    {monthlyRemaining} remaining
                  </Badge>
                  <span className="text-[10px] text-muted-foreground">
                    ~{estimateCycles(monthlyRemaining)} cycles
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
                  <p className="text-lg font-bold text-foreground/90">{usage.thisWeek.calls}</p>
                </div>
                <div className="p-2.5 rounded-lg bg-background/60 border border-border/40">
                  <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                    <TrendingUp className="w-3 h-3" />
                    Est. Cost
                  </div>
                  <p className="text-lg font-bold text-emerald-400">
                    ${((Math.max(0, usage.thisMonth.calls - FREE_TIER_LIMITS.monthly) * COST_PER_CALL_CENTS) / 100).toFixed(2)}
                  </p>
                </div>
              </div>

              {/* Warning if approaching limit */}
              {getMonthlyPercent() >= 80 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30"
                >
                  <div className="flex items-center gap-2 text-amber-300 text-xs">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>
                      Approaching monthly limit. Consider adding credits in{' '}
                      <strong>Settings → Workspace → Usage</strong>.
                    </span>
                  </div>
                </motion.div>
              )}
            </>
          )}

          <p className="text-[10px] text-muted-foreground/70 text-center pt-1">
            Free tier: ~{FREE_TIER_LIMITS.daily}/day, ~{FREE_TIER_LIMITS.monthly}/month calls
          </p>
          <p className="text-[10px] text-muted-foreground/60 text-center">
            ≈ {DAILY_CYCLE_LIMIT} cycles/day, {MONTHLY_CYCLE_LIMIT} cycles/month (SEBA advisory mode)
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
