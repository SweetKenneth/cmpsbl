/**
 * CompoundingValueDashboard — Shows users their accumulated substrate value
 * Crystallizations over time, memory density, tier history, Ascension count.
 * Accessible from nav menu under "My Value" or from the workbench.
 */
import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useFoundryState } from '@/hooks/useFoundryState';
import { useUserRole } from '@/hooks/useUserRole';
import { useTrialAccess } from '@/hooks/useTrialAccess';
import { Brain, TrendingUp, Gem, Layers, ArrowUpRight, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function CompoundingValueDashboard() {
  const { inventory, todayMineCount, dailyLimit, userState, isLoading } = useFoundryState();
  const { role } = useUserRole();
  const { isTrialActive, trialTier, daysRemaining } = useTrialAccess();

  // Compute stats
  const stats = useMemo(() => {
    if (!inventory.length) return null;

    const totalValue = inventory.reduce((sum, i) => sum + (i.valuationDisplay || 0), 0);
    const avgScore = Math.round(inventory.reduce((sum, i) => sum + i.score, 0) / inventory.length);

    // Group by day for streak/trend
    const byDate = new Map<string, number>();
    for (const item of inventory) {
      const date = new Date(item.obtainedAt).toISOString().split('T')[0];
      byDate.set(date, (byDate.get(date) || 0) + 1);
    }

    // Tier distribution
    const tiers: Record<string, number> = {};
    for (const item of inventory) {
      tiers[item.publicTier] = (tiers[item.publicTier] || 0) + 1;
    }

    // Unique categories
    const categories = new Set(inventory.map(i => i.category).filter(Boolean));

    return {
      totalCrystallizations: inventory.length,
      totalValue,
      avgScore,
      activeDays: byDate.size,
      tiers,
      categories: categories.size,
      streakDays: userState?.streakDays ?? 0,
    };
  }, [inventory, userState]);

  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-20 rounded-xl bg-muted/20" />
        ))}
      </div>
    );
  }

  const tierLabel = role.charAt(0).toUpperCase() + role.slice(1);

  return (
    <div className="space-y-4">
      {/* Trial badge */}
      {isTrialActive && trialTier && (
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20 text-xs font-semibold text-primary w-fit">
          <Crown className="w-3 h-3" />
          {trialTier.charAt(0).toUpperCase() + trialTier.slice(1)} Trial — {daysRemaining}d left
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard
          icon={Brain}
          label="Crystallizations"
          value={stats?.totalCrystallizations ?? 0}
          sub={`${todayMineCount}/${dailyLimit === -1 ? '∞' : dailyLimit} today`}
        />
        <StatCard
          icon={TrendingUp}
          label="Total Value"
          value={`$${((stats?.totalValue ?? 0) / 100).toLocaleString()}`}
          sub="Compounding"
        />
        <StatCard
          icon={Gem}
          label="Avg Score"
          value={stats?.avgScore ?? 0}
          sub={`${stats?.categories ?? 0} categories`}
        />
        <StatCard
          icon={Layers}
          label="Active Days"
          value={stats?.activeDays ?? 0}
          sub={`${stats?.streakDays ?? 0}-day streak`}
        />
      </div>

      {/* Tier distribution */}
      {stats && Object.keys(stats.tiers).length > 0 && (
        <div className="rounded-xl border border-border/20 bg-card/20 p-4">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Rarity Distribution</h3>
          <div className="flex flex-wrap gap-2">
            {Object.entries(stats.tiers)
              .sort((a, b) => b[1] - a[1])
              .map(([tier, count]) => (
                <div
                  key={tier}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-muted/30 border border-border/20 text-xs"
                >
                  <span className="font-bold text-foreground">{count}</span>
                  <span className="text-muted-foreground">{tier}</span>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Compounding value message */}
      {stats && stats.totalCrystallizations > 5 && (
        <div className="rounded-xl border border-primary/15 bg-gradient-to-r from-primary/5 to-transparent p-4 text-center">
          <p className="text-sm font-semibold text-foreground/80">
            Your substrate has compounded{' '}
            <span className="text-primary font-bold">
              ${((stats.totalValue) / 100).toLocaleString()}
            </span>{' '}
            in discovered value across{' '}
            <span className="text-primary font-bold">{stats.activeDays}</span> days.
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            This value grows with every crystallization. Keep your subscription active to protect it.
          </p>
        </div>
      )}

      {/* Empty state */}
      {(!stats || stats.totalCrystallizations === 0) && (
        <div className="text-center py-8 space-y-3">
          <Brain className="w-10 h-10 text-muted-foreground/30 mx-auto" />
          <p className="text-sm text-muted-foreground">No crystallizations yet</p>
          <Button size="sm" variant="outline" asChild>
            <Link to="/foundry">
              Open Memory Stream <ArrowUpRight className="w-3 h-3 ml-1" />
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, sub }: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  sub: string;
}) {
  return (
    <div className="rounded-xl border border-border/20 bg-card/20 p-3 sm:p-4">
      <div className="flex items-center gap-2 mb-2">
        <Icon className="w-4 h-4 text-primary/60" />
        <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{label}</span>
      </div>
      <p className="text-lg sm:text-xl font-black text-foreground leading-none mb-1">{value}</p>
      <p className="text-[10px] text-muted-foreground">{sub}</p>
    </div>
  );
}
