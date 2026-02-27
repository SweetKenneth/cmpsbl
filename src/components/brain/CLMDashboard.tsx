/**
 * CLM Dashboard — Admin Controls for Constant Learning Mode
 * Budget, status, and kill switch controls
 */

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Brain, Zap, Clock, PlayCircle, PauseCircle, RefreshCw, Shield } from 'lucide-react';
import { useCLM } from '@/lib/substrate/clm/useCLM';

export function CLMDashboard() {
  const { enabled, running, budget, tier, srQueueSize, enable, disable, triggerKillSwitch, runOnce, resetBudget } = useCLM();
  const [isLoading, setIsLoading] = useState(false);

  const handleToggle = () => { enabled ? disable() : enable(); };
  const handleRunOnce = async () => { setIsLoading(true); await runOnce(); setIsLoading(false); };
  const handleKillSwitch = () => { if (window.confirm('Trigger kill switch?')) triggerKillSwitch(); };
  const handleResetBudget = () => { if (window.confirm('Reset budget?')) resetBudget(); };

  const usedPercent = budget.usedUnits / (budget.usedUnits + budget.remainingUnits) * 100 || 0;
  const canExecute = budget.remainingUnits > 0 && enabled;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Brain className="h-8 w-8 text-primary" />
          <div>
            <h2 className="text-2xl font-bold">Constant Learning Mode</h2>
            <p className="text-muted-foreground">NEXUS Dynamic Allocation · 4-Hour Cycles</p>
          </div>
        </div>
        <Badge variant={enabled ? 'default' : 'secondary'}>{enabled ? 'ACTIVE' : 'DISABLED'}</Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2"><Zap className="h-4 w-4" />Cycle Allocation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Dynamic</div>
            <Progress value={usedPercent} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">{budget.usedUnits} used / {budget.remainingUnits} remaining</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2"><Clock className="h-4 w-4" />Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{running ? 'Running' : 'Idle'}</div>
            <p className="text-xs text-muted-foreground mt-1">Tier: {tier.name}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2"><RefreshCw className="h-4 w-4" />SR Queue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{srQueueSize}</div>
            <p className="text-xs text-muted-foreground mt-1">Items pending review</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5" />Controls</CardTitle>
          <CardDescription>{canExecute ? '✅ Ready' : '⛔ Blocked'}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <Switch checked={enabled} onCheckedChange={handleToggle} disabled={isLoading} />
            <span className="text-sm">{enabled ? 'Enabled' : 'Disabled'}</span>
          </div>
          <Button variant="outline" size="sm" onClick={handleRunOnce} disabled={isLoading || !canExecute}>
            <PlayCircle className="h-4 w-4 mr-2" />Run Once
          </Button>
          <Button variant="outline" size="sm" onClick={handleResetBudget} disabled={isLoading}>
            <RefreshCw className="h-4 w-4 mr-2" />Reset Budget
          </Button>
          <Button variant="destructive" size="sm" onClick={handleKillSwitch}>
            <PauseCircle className="h-4 w-4 mr-2" />Kill Switch
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
