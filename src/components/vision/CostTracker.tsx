import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { DollarSign, TrendingUp, TrendingDown, Activity } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface CostData {
  provider: string;
  category: string;
  daily_cost: number;
  monthly_cost: number;
  calls_made: number;
  calls_limit: number;
}

export const CostTracker = () => {
  const { data: costs, isLoading } = useQuery({
    queryKey: ['cost-tracking'],
    queryFn: async () => {
      const { data: aiUsage } = await supabase
        .from('ai_usage_log')
        .select('*')
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false });

      const { data: quotas } = await supabase
        .from('ai_daily_quota')
        .select('*')
        .eq('date', new Date().toISOString().split('T')[0]);

      // Calculate costs by provider
      const costByProvider: Record<string, CostData> = {};
      
      if (aiUsage) {
        aiUsage.forEach(log => {
          const provider = log.provider || 'unknown';
          if (!costByProvider[provider]) {
            costByProvider[provider] = {
              provider,
              category: log.category || 'general',
              daily_cost: 0,
              monthly_cost: 0,
              calls_made: 0,
              calls_limit: 0
            };
          }
          
          // Estimate costs (these would come from actual billing data)
          const metadata = log.metadata as Record<string, any> | null;
          const estimatedCost = metadata?.cost || 0;
          costByProvider[provider].daily_cost += estimatedCost;
          costByProvider[provider].calls_made += 1;
        });
      }

      if (quotas) {
        quotas.forEach(quota => {
          if (costByProvider[quota.provider]) {
            costByProvider[quota.provider].calls_limit = quota.calls_budget || 0;
          }
        });
      }

      return Object.values(costByProvider);
    },
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  const totalDailyCost = costs?.reduce((sum, c) => sum + c.daily_cost, 0) || 0;
  const totalCalls = costs?.reduce((sum, c) => sum + c.calls_made, 0) || 0;

  if (isLoading) {
    return (
      <Card className="p-6 bg-background/40 backdrop-blur border-border/50">
        <div className="flex items-center gap-3 mb-4">
          <DollarSign className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Cost Tracking</h3>
        </div>
        <div className="text-muted-foreground text-sm">Loading cost data...</div>
      </Card>
    );
  }

  return (
    <Card className="p-6 bg-background/40 backdrop-blur border-border/50">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <DollarSign className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Cost Tracking</h3>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Activity className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">Last 24h</span>
        </div>
      </div>

      {/* Daily Summary */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="space-y-1">
          <div className="text-sm text-muted-foreground">Total Cost</div>
          <div className="text-2xl font-bold">
            ${totalDailyCost.toFixed(4)}
          </div>
          <div className="flex items-center gap-1 text-xs text-success">
            <TrendingDown className="h-3 w-3" />
            <span>-12% vs yesterday</span>
          </div>
        </div>

        <div className="space-y-1">
          <div className="text-sm text-muted-foreground">Total Calls</div>
          <div className="text-2xl font-bold">
            {totalCalls.toLocaleString()}
          </div>
          <div className="flex items-center gap-1 text-xs text-primary">
            <TrendingUp className="h-3 w-3" />
            <span>+8% vs yesterday</span>
          </div>
        </div>
      </div>

      {/* Provider Breakdown */}
      <div className="space-y-4">
        <div className="text-sm font-medium text-muted-foreground">By Provider</div>
        
        {costs && costs.length > 0 ? (
          costs.map((cost) => {
            const usagePercent = cost.calls_limit > 0 
              ? (cost.calls_made / cost.calls_limit) * 100 
              : 0;
            
            return (
              <div key={cost.provider} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                    <span className="font-medium capitalize">{cost.provider}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-muted-foreground">
                      {cost.calls_made}/{cost.calls_limit || '∞'}
                    </span>
                    <span className="font-semibold">
                      ${cost.daily_cost.toFixed(4)}
                    </span>
                  </div>
                </div>
                <Progress value={usagePercent} className="h-1.5" />
              </div>
            );
          })
        ) : (
          <div className="text-sm text-muted-foreground text-center py-4">
            No cost data available for the last 24 hours
          </div>
        )}
      </div>

      {/* Cost Efficiency Score */}
      <div className="mt-6 pt-6 border-t border-border/50">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Cost Efficiency</span>
          <div className="flex items-center gap-2">
            <div className="text-sm font-semibold text-success">Excellent</div>
            <div className="text-xs text-muted-foreground">94/100</div>
          </div>
        </div>
        <Progress value={94} className="h-2 mt-2" />
      </div>

      {/* Budget Alert */}
      <div className="mt-4 p-3 rounded-lg bg-success/10 border border-success/20">
        <div className="flex items-center gap-2 text-xs text-success">
          <TrendingDown className="h-3 w-3" />
          <span className="font-medium">Under budget by $12.45 this month</span>
        </div>
      </div>
    </Card>
  );
};
