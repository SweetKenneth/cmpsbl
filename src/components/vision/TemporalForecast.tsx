import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { TrendingUp, Clock, Target } from 'lucide-react';

interface Forecast {
  metric_name: string;
  predicted_value: number;
  confidence: number;
  forecast_date: string;
  metadata: any;
  created_at: string;
}

export default function TemporalForecast() {
  const [forecasts, setForecasts] = useState<Forecast[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchForecasts();
    const interval = setInterval(fetchForecasts, 300000); // Refresh every 5 minutes
    return () => clearInterval(interval);
  }, []);

  const fetchForecasts = async () => {
    try {
      const { data } = await supabase
        .from('brain_forecasts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (data) {
        // Get unique latest forecast per metric
        const uniqueForecasts = data.reduce((acc: Forecast[], curr) => {
          if (!acc.find(f => f.metric_name === curr.metric_name)) {
            acc.push(curr);
          }
          return acc;
        }, []);
        
        setForecasts(uniqueForecasts);
      }
    } catch (error) {
      console.error('Error fetching forecasts:', error);
    } finally {
      setLoading(false);
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-neon-green';
    if (confidence >= 0.6) return 'text-neon-amber';
    return 'text-neon-amber';
  };

  const formatMetricName = (name: string) => {
    return name.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  return (
    <Card className="bg-gradient-to-br from-background to-muted border-primary/20 p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-lg bg-primary/10">
          <Clock className="h-5 w-5 text-primary" />
        </div>
        <h3 className="text-lg font-bold">Temporal Forecasts</h3>
      </div>

      {loading ? (
        <div className="text-sm text-muted-foreground">Loading forecasts...</div>
      ) : forecasts.length === 0 ? (
        <div className="text-sm text-muted-foreground">
          No forecasts available yet. Check back after the next analysis cycle.
        </div>
      ) : (
        <div className="space-y-4">
          {/* Forecasts Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 text-muted-foreground font-medium">Metric</th>
                  <th className="text-right py-2 text-muted-foreground font-medium">3-Day Forecast</th>
                  <th className="text-right py-2 text-muted-foreground font-medium">Confidence</th>
                </tr>
              </thead>
              <tbody>
                {forecasts.map((forecast, i) => (
                  <tr key={i} className="border-b border-border/50">
                    <td className="py-3 text-muted-foreground">
                      {formatMetricName(forecast.metric_name)}
                    </td>
                    <td className="py-3 text-right font-mono font-bold">
                      {(forecast.predicted_value || 0).toFixed(2)}
                    </td>
                    <td className={`py-3 text-right font-bold ${getConfidenceColor(forecast.confidence || 0)}`}>
                      {((forecast.confidence || 0) * 100).toFixed(0)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Info Section */}
          <div className="pt-4 border-t border-border">
            <div className="flex items-start gap-2 mb-3">
              <TrendingUp className="h-4 w-4 text-primary mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium mb-1">How It Works</p>
                <p className="text-xs text-muted-foreground">
                  Analyzes 14-day historical trends using linear regression to forecast metrics 3-7 days ahead. 
                  Confidence scores adjust based on forecast accuracy vs actual outcomes.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-2">
              <Target className="h-4 w-4 text-primary mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium mb-1">Evaluation Cycle</p>
                <p className="text-xs text-muted-foreground">
                  Forecasts are automatically evaluated against actual metrics after the horizon period. 
                  The system learns from errors to improve future predictions.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
