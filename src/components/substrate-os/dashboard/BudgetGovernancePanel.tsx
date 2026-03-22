/**
 * Budget Governance Panel — View and adjust daily/monthly budget limits
 * Governor-only controls for the NEXUS budget governance engine
 */

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { DollarSign, AlertTriangle, Settings, Save, RotateCcw, TrendingDown, ShieldAlert, Gauge } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { 
  getBudgetStatus, 
  getBudgetConfig, 
  updateBudgetConfig, 
  resetDailySpending,
  type BudgetStatus, 
  type BudgetConfig 
} from '@/lib/nexus/budgetGovernance';

export function BudgetGovernancePanel({ className }: { className?: string }) {
  const [config, setConfig] = useState<BudgetConfig>(getBudgetConfig());
  const [editing, setEditing] = useState(false);
  const [localConfig, setLocalConfig] = useState<BudgetConfig>(config);

  const { data: status, refetch } = useQuery({
    queryKey: ['budget-governance-status'],
    queryFn: getBudgetStatus,
    refetchInterval: 30000,
  });

  useEffect(() => {
    setConfig(getBudgetConfig());
    setLocalConfig(getBudgetConfig());
  }, []);

  const handleSave = () => {
    const updated = updateBudgetConfig(localConfig);
    setConfig(updated);
    setEditing(false);
    toast.success('Budget configuration updated');
    refetch();
  };

  const handleReset = () => {
    resetDailySpending();
    toast.success('Daily spending counters reset');
    refetch();
  };

  const handleCancel = () => {
    setLocalConfig(config);
    setEditing(false);
  };

  const formatCents = (cents: number) => `$${(cents / 100).toFixed(2)}`;

  return (
    <div className={cn('rounded-2xl border border-border/20 bg-gradient-to-b from-card/60 to-card/30 backdrop-blur-xl overflow-hidden', className)}>
      {/* Header */}
      <div className="px-5 pt-5 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-neon-amber/10 border border-neon-amber/15 flex items-center justify-center">
            <DollarSign className="w-3.5 h-3.5 text-neon-amber" />
          </div>
          <div>
            <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider block">Stream Budget Governance</span>
            {status?.is_throttled && (
              <Badge variant="destructive" className="text-[8px] h-4 px-1.5 gap-1">
                <ShieldAlert className="w-2.5 h-2.5" /> THROTTLED
              </Badge>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!editing ? (
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setEditing(true)}>
              <Settings className="w-3.5 h-3.5" />
            </Button>
          ) : (
            <div className="flex gap-1">
              <Button variant="ghost" size="sm" className="h-7 text-[10px]" onClick={handleCancel}>Cancel</Button>
              <Button size="sm" className="h-7 text-[10px] gap-1" onClick={handleSave}>
                <Save className="w-3 h-3" /> Save
              </Button>
            </div>
          )}
        </div>
      </div>

      {status && (
        <>
          {/* Daily/Monthly Meters */}
          <div className="px-5 pb-3 grid grid-cols-2 gap-3">
            <BudgetMeter
              label="Daily"
              spent={status.daily_spent_cents}
              limit={config.daily_limit_cents}
              percent={status.daily_percent_used}
            />
            <BudgetMeter
              label="Monthly"
              spent={status.monthly_spent_cents}
              limit={config.monthly_limit_cents}
              percent={status.monthly_percent_used}
            />
          </div>

          {/* Alerts */}
          {status.alerts.length > 0 && (
            <div className="px-5 pb-3 space-y-1.5">
              {status.alerts.map((alert, i) => (
                <div key={i} className={cn(
                  'flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-mono',
                  alert.type === 'exceeded' ? 'bg-destructive/10 text-destructive border border-destructive/20' :
                  alert.type === 'critical' ? 'bg-neon-amber/10 text-neon-amber border border-neon-amber/20' :
                  'bg-neon-amber/10 text-neon-amber border border-neon-amber/20'
                )}>
                  <AlertTriangle className="w-3 h-3 shrink-0" />
                  {alert.message}
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Config Editor */}
      {editing && (
        <motion.div
          className="px-5 pb-4 space-y-3 border-t border-border/10 pt-3"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
        >
          <ConfigRow label="Daily Limit" value={formatCents(localConfig.daily_limit_cents)}
            onChange={v => setLocalConfig(c => ({ ...c, daily_limit_cents: Math.round(parseFloat(v.replace('$', '')) * 100) }))}
          />
          <ConfigRow label="Monthly Limit" value={formatCents(localConfig.monthly_limit_cents)}
            onChange={v => setLocalConfig(c => ({ ...c, monthly_limit_cents: Math.round(parseFloat(v.replace('$', '')) * 100) }))}
          />
          <ConfigRow label="Alert Threshold %" value={localConfig.alert_threshold_percent.toString()}
            onChange={v => setLocalConfig(c => ({ ...c, alert_threshold_percent: parseInt(v) || 80 }))}
          />
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-muted-foreground font-mono">Hard Stop</span>
            <Switch
              checked={localConfig.hard_stop_enabled}
              onCheckedChange={v => setLocalConfig(c => ({ ...c, hard_stop_enabled: v }))}
            />
          </div>
          
          <Button variant="outline" size="sm" className="w-full text-[10px] gap-1 h-7 mt-2" onClick={handleReset}>
            <RotateCcw className="w-3 h-3" /> Reset Daily Counters
          </Button>
        </motion.div>
      )}

      {/* Category Limits */}
      <div className="px-5 py-3 border-t border-border/10">
        <span className="text-[9px] font-mono text-muted-foreground uppercase tracking-wider block mb-2">Category Caps (daily)</span>
        <div className="grid grid-cols-4 gap-1.5">
          {Object.entries(config.category_limits).map(([cat, limit]) => (
            <div key={cat} className="rounded-lg bg-muted/10 border border-border/10 px-2 py-1.5 text-center transition-all duration-300 hover:border-primary/15 hover:bg-muted/15">
              <div className="text-[10px] font-bold font-mono tabular-nums text-foreground">{formatCents(limit)}</div>
              <div className="text-[7px] text-muted-foreground/40 uppercase">{cat}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function BudgetMeter({ label, spent, limit, percent }: { label: string; spent: number; limit: number; percent: number }) {
  const color = percent >= 100 ? 'text-destructive' : percent >= 80 ? 'text-neon-amber' : 'text-neon-green';
  const barColor = percent >= 100 ? 'bg-destructive' : percent >= 80 ? 'bg-neon-amber' : 'bg-neon-green';

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-[9px] font-mono text-muted-foreground uppercase">{label}</span>
        <span className={cn('text-xs font-bold font-mono', color)}>{percent.toFixed(0)}%</span>
      </div>
      <div className="h-1.5 rounded-full bg-muted/20 overflow-hidden">
        <motion.div
          className={cn('h-full rounded-full', barColor)}
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(100, percent)}%` }}
          transition={{ duration: 0.6 }}
        />
      </div>
      <div className="flex justify-between text-[8px] text-muted-foreground/40 font-mono">
        <span>${(spent / 100).toFixed(2)}</span>
        <span>${(limit / 100).toFixed(2)}</span>
      </div>
    </div>
  );
}

function ConfigRow({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-[10px] text-muted-foreground font-mono shrink-0">{label}</span>
      <Input
        className="h-7 text-xs font-mono w-24 text-right"
        value={value}
        onChange={e => onChange(e.target.value)}
      />
    </div>
  );
}