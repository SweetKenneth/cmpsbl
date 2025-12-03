import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, TrendingUp, AlertTriangle, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export default function BotSniper() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<any>(null);
  const [subscription, setSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadDashboard();
    }
  }, [user]);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const [statsRes, subRes] = await Promise.all([
        supabase.functions.invoke('bot-sniper-stats', {
          body: { timeRange: '24h' }
        }),
        supabase.functions.invoke('bot-sniper-check-subscription')
      ]);

      if (statsRes.data) setStats(statsRes.data);
      if (subRes.data) setSubscription(subRes.data);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="p-8 max-w-md text-center">
          <Shield className="w-16 h-16 mx-auto mb-4 text-primary" />
          <h1 className="text-2xl font-bold mb-2">Bot Sniper</h1>
          <p className="text-muted-foreground mb-6">
            Detect and block malicious bots with AI-powered precision
          </p>
          <Button onClick={() => navigate('/auth')}>Sign In to Continue</Button>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-lg">Loading dashboard...</div>
      </div>
    );
  }

  const hasSubscription = subscription?.subscribed;

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Shield className="w-8 h-8 text-primary" />
              Bot Sniper Dashboard
            </h1>
            <p className="text-muted-foreground mt-1">
              Real-time bot detection and threat intelligence
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => navigate('/bot-sniper/analytics')}>
              <Activity className="w-4 h-4 mr-2" />
              Analytics
            </Button>
            <Button onClick={() => navigate('/bot-sniper/settings')}>
              Settings
            </Button>
          </div>
        </div>

        {/* Subscription Banner */}
        {!hasSubscription && (
          <Card className="p-6 bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold mb-1">
                  Start Protecting Your Site Today
                </h3>
                <p className="text-muted-foreground">
                  Bot Sniper Base: $9/mo • 10,000 requests/month • Full bot detection
                </p>
              </div>
              <Button onClick={() => navigate('/bot-sniper/pricing')}>
                Get Started
              </Button>
            </div>
          </Card>
        )}

        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-4">
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-primary/10">
                <Activity className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Requests</p>
                <p className="text-2xl font-bold">{stats?.summary?.total_requests || 0}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-destructive/10">
                <AlertTriangle className="w-6 h-6 text-destructive" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Bots Detected</p>
                <p className="text-2xl font-bold">{stats?.summary?.bots_detected || 0}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-amber-500/10">
                <TrendingUp className="w-6 h-6 text-amber-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Threat Score</p>
                <p className="text-2xl font-bold">{stats?.summary?.avg_threat_score || 0}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-green-500/10">
                <Shield className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Usage</p>
                <p className="text-2xl font-bold">
                  {subscription?.requests_used || 0} / {subscription?.requests_limit || 0}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-start"
              onClick={() => navigate('/bot-sniper/analytics')}
            >
              <Activity className="w-5 h-5 mb-2" />
              <div className="text-left">
                <div className="font-medium">View Analytics</div>
                <div className="text-sm text-muted-foreground">
                  Deep dive into threat patterns
                </div>
              </div>
            </Button>

            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-start"
              onClick={() => navigate('/bot-sniper/settings')}
            >
              <Shield className="w-5 h-5 mb-2" />
              <div className="text-left">
                <div className="font-medium">Manage API Keys</div>
                <div className="text-sm text-muted-foreground">
                  Create and manage access keys
                </div>
              </div>
            </Button>

            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-start"
              onClick={() => navigate('/bot-sniper/pricing')}
            >
              <TrendingUp className="w-5 h-5 mb-2" />
              <div className="text-left">
                <div className="font-medium">Upgrade Plan</div>
                <div className="text-sm text-muted-foreground">
                  Get Full Suite for $1/mo
                </div>
              </div>
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
