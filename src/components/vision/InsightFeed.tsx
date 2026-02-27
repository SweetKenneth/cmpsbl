import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { TrendingUp } from 'lucide-react';

interface CrossInsight {
  id: string;
  insight_text: string;
  domains: string[];
  confidence: number;
  metadata: any;
  created_at: string;
}

export default function InsightFeed() {
  const [insights, setInsights] = useState<CrossInsight[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInsights();
    const interval = setInterval(fetchInsights, 300000); // Refresh every 5 minutes
    return () => clearInterval(interval);
  }, []);

  const fetchInsights = async () => {
    try {
      const { data, error } = await supabase
        .from('brain_cross_insights')
        .select('*')
        .order('confidence', { ascending: false })
        .limit(5);
      
      if (error) throw error;
      
      setInsights(data || []);
    } catch (error) {
      console.error('Failed to fetch insights:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="p-4 bg-card">
        <div className="animate-pulse">
          <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-muted rounded w-1/2"></div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4 bg-card">
      <div className="flex items-center gap-2 mb-3">
        <TrendingUp className="w-5 h-5 text-primary" />
        <h3 className="font-bold text-foreground">Cross-Module Insights</h3>
      </div>
      
      {insights.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No insights generated yet. Run daily synthesis to see strategic insights.
        </p>
      ) : (
        <div className="space-y-3">
          {insights.map((insight, index) => (
            <div 
              key={insight.id}
              className="p-3 rounded-lg bg-primary/5 border border-primary/20"
            >
              <div className="flex items-start justify-between gap-2 mb-1">
                <p className="font-semibold text-sm text-foreground">
                  {insight.insight_text}
                </p>
                <span className="text-xs text-primary font-medium shrink-0">
                  #{index + 1}
                </span>
              </div>
              {insight.domains && insight.domains.length > 0 && (
                <p className="text-xs text-muted-foreground mb-2">
                  Domains: {insight.domains.join(', ')}
                </p>
              )}
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary rounded-full transition-all"
                    style={{ width: `${(insight.confidence || 0) * 100}%` }}
                  />
                </div>
                <span className="text-xs text-muted-foreground">
                  {((insight.confidence || 0) * 100).toFixed(0)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
      
      <p className="text-xs text-muted-foreground mt-3">
        Strategic insights synthesized from all CMPSBL modules
      </p>
    </Card>
  );
}
