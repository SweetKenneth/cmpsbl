import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Brain, TrendingUp, Target, Sparkles } from 'lucide-react';

interface CuriositySettings {
  exploration_rate: number;
  threshold: number;
  settings: any;
  updated_at: string;
}

export default function CuriosityMonitor() {
  const [settings, setSettings] = useState<CuriositySettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSettings();
    const interval = setInterval(fetchSettings, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  const fetchSettings = async () => {
    try {
      const { data } = await supabase
        .from('brain_curiosity_settings')
        .select('*')
        .limit(1)
        .maybeSingle();

      if (data) {
        setSettings(data);
      }
    } catch (error) {
      console.error('Error fetching curiosity settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const explorationRatio = settings?.exploration_rate || 0.3;
  const exploitationRatio = 1 - explorationRatio;

  return (
    <Card className="bg-gradient-to-br from-background to-muted border-primary/20 p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-lg bg-primary/10">
          <Brain className="h-5 w-5 text-primary" />
        </div>
        <h3 className="text-lg font-bold">Curiosity Balancer</h3>
      </div>

      {loading ? (
        <div className="text-sm text-muted-foreground">Loading settings...</div>
      ) : !settings ? (
        <div className="text-sm text-muted-foreground">No settings configured yet</div>
      ) : (
        <div className="space-y-4">
          {/* Ratios Display */}
          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-muted-foreground">Exploration</span>
                <span className="text-sm font-bold text-primary">
                  {(explorationRatio * 100).toFixed(0)}%
                </span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all duration-500"
                  style={{ width: `${explorationRatio * 100}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-muted-foreground">Exploitation</span>
                <span className="text-sm font-bold text-neon-green">
                  {(exploitationRatio * 100).toFixed(0)}%
                </span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div 
                  className="h-full bg-neon-green transition-all duration-500"
                  style={{ width: `${exploitationRatio * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Threshold */}
          <div className="pt-4 border-t border-border">
            <div className="flex items-center gap-2 mb-2">
              <Target className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Curiosity Threshold</span>
            </div>
            <p className="text-lg font-bold text-primary">
              {(settings.threshold * 100).toFixed(0)}%
            </p>
          </div>

          {/* Description */}
          <div className="pt-4 border-t border-border">
            <p className="text-xs text-muted-foreground">
              Dynamically adjusts between exploring new topics and deepening existing knowledge 
              based on recent learning success and novelty metrics.
            </p>
            {settings.updated_at && (
              <p className="text-xs text-muted-foreground mt-2">
                Last adjusted: {new Date(settings.updated_at).toLocaleDateString()}
              </p>
            )}
          </div>
        </div>
      )}
    </Card>
  );
}
