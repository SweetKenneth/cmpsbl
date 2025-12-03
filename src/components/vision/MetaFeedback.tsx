import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';

interface FeedbackSummary {
  avg_accuracy: number;
  avg_confidence: number;
  validation_rate: number;
}

export default function MetaFeedback() {
  const [stats, setStats] = useState<FeedbackSummary>({
    avg_accuracy: 0,
    avg_confidence: 0,
    validation_rate: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  const fetchStats = async () => {
    try {
      // Get feedback data from brain_feedback table
      const { data, error } = await supabase
        .from('brain_feedback')
        .select('success_rating, metadata')
        .not('success_rating', 'is', null);
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        const avgRating = data.reduce((sum, item) => sum + (item.success_rating || 0), 0) / data.length;
        const validationCount = data.filter(item => item.success_rating !== null).length;
        
        setStats({
          avg_accuracy: avgRating / 5, // Normalize to 0-1
          avg_confidence: avgRating / 5, // Normalize to 0-1
          validation_rate: validationCount / data.length
        });
      }
    } catch (error) {
      console.error('Failed to fetch meta feedback stats:', error);
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
      <h3 className="font-bold mb-3 text-foreground">Meta Feedback Loop</h3>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Average Accuracy:</span>
          <span className="font-semibold text-foreground">
            {(stats.avg_accuracy * 100).toFixed(1)}%
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Average Confidence:</span>
          <span className="font-semibold text-foreground">
            {(stats.avg_confidence * 100).toFixed(1)}%
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Validation Rate:</span>
          <span className="font-semibold text-foreground">
            {(stats.validation_rate * 100).toFixed(1)}%
          </span>
        </div>
      </div>
      <p className="text-xs text-muted-foreground mt-3">
        Evaluates reasoning quality and tracks self-corrections.
      </p>
    </Card>
  );
}
