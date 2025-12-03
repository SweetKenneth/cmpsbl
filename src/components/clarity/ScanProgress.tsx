import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';

interface ScanProgressProps {
  scanId: string;
  onComplete?: () => void;
}

interface ScanStatus {
  id: string;
  status: string;
  compliance_score: number;
  issues_found: number;
}

export function ScanProgress({ scanId, onComplete }: ScanProgressProps) {
  const [scan, setScan] = useState<ScanStatus | null>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    loadScan();
    const interval = setInterval(loadScan, 2000);
    return () => clearInterval(interval);
  }, [scanId]);

  const loadScan = async () => {
    const { data, error } = await supabase
      .from('pf_clarity_scans')
      .select('id, status, compliance_score, issues_found')
      .eq('id', scanId)
      .single();

    if (data) {
      setScan(data);
      
      if (data.status === 'in_progress') {
        setProgress(Math.min(progress + 10, 90));
      } else if (data.status === 'completed') {
        setProgress(100);
        if (onComplete) onComplete();
      } else if (data.status === 'failed') {
        setProgress(0);
      }
    }
  };

  if (!scan) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Scan Progress</h3>
          {scan.status === 'in_progress' && (
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
          )}
          {scan.status === 'completed' && (
            <CheckCircle className="w-5 h-5 text-green-500" />
          )}
          {scan.status === 'failed' && (
            <AlertCircle className="w-5 h-5 text-destructive" />
          )}
        </div>

        <Progress value={progress} className="h-2" />

        <div className="grid grid-cols-2 gap-4 pt-4">
          <div>
            <p className="text-sm text-muted-foreground">Status</p>
            <p className="font-semibold capitalize">{scan.status.replace('_', ' ')}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Issues Found</p>
            <p className="font-semibold">{scan.issues_found}</p>
          </div>
        </div>

        {scan.status === 'completed' && (
          <div className="pt-4 border-t">
            <p className="text-sm text-muted-foreground mb-1">Compliance Score</p>
            <p className="text-3xl font-bold text-primary">
              {Math.round(scan.compliance_score)}%
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}
