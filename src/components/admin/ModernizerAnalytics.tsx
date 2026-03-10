import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { TrendingUp, CheckCircle, XCircle, Clock } from 'lucide-react';

interface EvolutionRun {
  run_id: string;
  phase: string | null;
  confidence_score: number | null;
  created_at: string;
  plan_id: string;
  risk_level: string | null;
}

/**
 * EvolutionAnalytics — Displays evolution run metrics from the evolution_runs table.
 * @deprecated Component name retained for import compatibility; internally uses EVOLUTION data.
 */
export const ModernizerAnalytics = () => {
  const [runs, setRuns] = useState<EvolutionRun[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRuns = async () => {
      try {
        const { data, error } = await supabase
          .from('evolution_runs')
          .select('run_id, phase, confidence_score, created_at, plan_id, risk_level')
          .order('created_at', { ascending: false })
          .limit(30);

        if (error) throw error;
        setRuns(data || []);
      } catch (error) {
        console.error('Failed to fetch evolution runs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRuns();
  }, []);

  if (loading) return <div>Loading analytics...</div>;

  const totalRuns = runs.length;
  const verified = runs.filter(r => r.phase === 'verified').length;
  const failed = runs.filter(r => r.phase === 'failed' || r.phase === 'aborted').length;
  const planning = runs.filter(r => r.phase === 'planning').length;

  const avgConfidence = runs.reduce((sum, r) => sum + (r.confidence_score || 0), 0) / (totalRuns || 1);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">EVOLUTION Analytics</h2>

      <div className="grid md:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-muted-foreground">Total Runs</div>
              <div className="text-3xl font-bold mt-1">{totalRuns}</div>
            </div>
            <TrendingUp className="h-8 w-8 text-primary opacity-50" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-muted-foreground">Verified</div>
              <div className="text-3xl font-bold mt-1 text-emerald-500">{verified}</div>
            </div>
            <CheckCircle className="h-8 w-8 text-emerald-500 opacity-50" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-muted-foreground">Planning</div>
              <div className="text-3xl font-bold mt-1">{planning}</div>
            </div>
            <Clock className="h-8 w-8 text-muted-foreground opacity-50" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-muted-foreground">Avg Confidence</div>
              <div className="text-3xl font-bold mt-1">{Math.round(avgConfidence)}%</div>
            </div>
            <TrendingUp className="h-8 w-8 text-primary opacity-50" />
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="font-semibold mb-4">Recent Evolution Runs</h3>
        <div className="space-y-2">
          {runs.slice(0, 7).map((run) => (
            <div key={run.run_id} className="flex items-center justify-between py-2 border-b last:border-0">
              <span className="text-sm truncate max-w-[200px]">{run.plan_id.slice(0, 12)}</span>
              <div className="flex items-center gap-4 text-sm">
                <span className={`font-medium ${
                  run.phase === 'verified' ? 'text-emerald-500' :
                  run.phase === 'failed' || run.phase === 'aborted' ? 'text-destructive' :
                  'text-muted-foreground'
                }`}>
                  {run.phase}
                </span>
                {run.confidence_score != null && (
                  <span className="font-medium">
                    {Math.round(run.confidence_score)}%
                  </span>
                )}
              </div>
            </div>
          ))}
          {runs.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">No evolution runs yet.</p>
          )}
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="font-semibold mb-4">Run Summary</h3>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-emerald-500" />
            <div>
              <div className="text-sm text-muted-foreground">Success Rate</div>
              <div className="font-bold">{totalRuns > 0 ? Math.round((verified / totalRuns) * 100) : 0}%</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Clock className="h-5 w-5 text-muted-foreground" />
            <div>
              <div className="text-sm text-muted-foreground">In Progress</div>
              <div className="font-bold">
                {runs.filter(r => r.phase === 'shadow_applied' || r.phase === 'production_applied').length}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <XCircle className="h-5 w-5 text-destructive" />
            <div>
              <div className="text-sm text-muted-foreground">Failed / Aborted</div>
              <div className="font-bold">{failed}</div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
