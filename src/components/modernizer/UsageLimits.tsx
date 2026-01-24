import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Zap, TrendingUp, Crown, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface UsageLimits {
  plan_tier: string;
  monthly_jobs_limit: number;
  monthly_jobs_used: number;
  billing_period_end: string;
}

export const UsageLimits = () => {
  const [limits, setLimits] = useState<UsageLimits | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchLimits();
  }, []);

  const fetchLimits = async () => {
    try {
      const { data, error } = await supabase
        .from('modernizer_user_limits')
        .select('*')
        .single();

      if (error) throw error;
      setLimits(data);
    } catch (error) {
      console.error('Failed to fetch limits:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async (plan: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('pf-modernizer-checkout', {
        body: { plan }
      });

      if (error) throw error;
      
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Upgrade error:', error);
      toast({
        title: "Upgrade failed",
        description: "Could not start checkout",
        variant: "destructive"
      });
    }
  };

  if (loading || !limits) {
    return (
      <Card className="border-2 border-border/50 bg-card/80 backdrop-blur-sm animate-pulse">
        <CardHeader>
          <div className="h-6 bg-muted rounded w-32" />
        </CardHeader>
        <CardContent>
          <div className="h-2 bg-muted rounded w-full mb-4" />
          <div className="space-y-2">
            <div className="h-10 bg-muted rounded" />
            <div className="h-10 bg-muted rounded" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const usage = (limits.monthly_jobs_used / limits.monthly_jobs_limit) * 100;
  const remaining = limits.monthly_jobs_limit - limits.monthly_jobs_used;
  const isLow = remaining <= 1;

  return (
    <Card className="border-2 border-border/50 bg-card/80 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            Usage This Month
          </CardTitle>
          <Badge 
            variant={limits.plan_tier === 'free' ? 'secondary' : 'default'}
            className={limits.plan_tier !== 'free' ? 'bg-gradient-to-r from-primary to-accent text-primary-foreground' : ''}
          >
            {limits.plan_tier.toUpperCase()}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">
              {limits.monthly_jobs_used} / {limits.monthly_jobs_limit} jobs
            </span>
            <span className={`font-semibold ${isLow ? 'text-destructive' : 'text-primary'}`}>
              {remaining} left
            </span>
          </div>
          <Progress 
            value={usage} 
            className={`h-2 ${isLow ? '[&>div]:bg-destructive' : ''}`} 
          />
        </div>

        {limits.plan_tier === 'free' && (
          <div className="space-y-3 pt-2 border-t border-border/50">
            <p className="text-xs text-muted-foreground">
              Upgrade for unlimited modernizations
            </p>
            <div className="grid gap-2">
              <Button 
                onClick={() => handleUpgrade('starter')}
                variant="outline"
                size="sm"
                className="w-full justify-between h-9 text-xs"
              >
                <span className="flex items-center gap-2">
                  <TrendingUp className="w-3.5 h-3.5" />
                  Starter $19/mo
                </span>
                <span className="text-muted-foreground">10 jobs</span>
              </Button>
              <Button 
                onClick={() => handleUpgrade('pro')}
                variant="outline"
                size="sm"
                className="w-full justify-between h-9 text-xs"
              >
                <span className="flex items-center gap-2">
                  <Zap className="w-3.5 h-3.5" />
                  Pro $49/mo
                </span>
                <span className="text-muted-foreground">50 jobs</span>
              </Button>
              <Button 
                onClick={() => handleUpgrade('studio')}
                size="sm"
                className="w-full justify-between h-9 text-xs bg-gradient-to-r from-primary to-accent hover:opacity-90"
              >
                <span className="flex items-center gap-2">
                  <Crown className="w-3.5 h-3.5" />
                  Studio $99/mo
                </span>
                <span>Unlimited</span>
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
