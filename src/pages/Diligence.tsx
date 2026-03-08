import { useState } from 'react';
import { runDiligence, type DiligenceReport } from '@/lib/diligence/run-diligence';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

export default function Diligence() {
  const [running, setRunning] = useState(false);
  const [report, setReport] = useState<DiligenceReport | null>(null);
  const [error, setError] = useState<string | null>(null);

  const run = async () => {
    setRunning(true);
    setError(null);
    try {
      const r = await runDiligence();
      setReport(r);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to run diligence');
    } finally {
      setRunning(false);
    }
  };

  const json = report ? JSON.stringify(report, null, 2) : '';

  const copy = async () => {
    if (!json) return;
    await navigator.clipboard.writeText(json);
  };

  return (
    <div className="min-h-screen bg-background p-6 max-w-4xl mx-auto space-y-6 pt-12">
      <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-xl font-black tracking-tight">Diligence Harness</CardTitle>
          <CardDescription>
            Runs a single investor-grade test battery and returns a structured report.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex gap-3">
          <Button onClick={run} disabled={running} className="gap-2 shadow-lg shadow-primary/15">
            {running ? 'Running…' : 'Run Tests'}
          </Button>
          <Button variant="outline" onClick={copy} disabled={!json} className="gap-2">
            Copy JSON
          </Button>
        </CardContent>
      </Card>

      {error && (
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive text-lg">Error</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
        </Card>
      )}

      {report && (
        <div className="grid grid-cols-3 gap-4">
          <Card className="p-4 text-center border-border/50 bg-card/80">
            <p className="text-sm text-muted-foreground font-mono uppercase tracking-wider">Passed</p>
            <p className="text-3xl font-black text-primary tabular-nums">{report.summary.passed}</p>
          </Card>
          <Card className="p-4 text-center border-border/50 bg-card/80">
            <p className="text-sm text-muted-foreground font-mono uppercase tracking-wider">Minor</p>
            <p className={cn('text-3xl font-black tabular-nums', report.summary.minor > 0 ? 'text-accent-foreground' : 'text-muted-foreground')}>
              {report.summary.minor}
            </p>
          </Card>
          <Card className="p-4 text-center border-border/50 bg-card/80">
            <p className="text-sm text-muted-foreground font-mono uppercase tracking-wider">Critical</p>
            <p className={cn('text-3xl font-black tabular-nums', report.summary.critical > 0 ? 'text-destructive' : 'text-muted-foreground')}>
              {report.summary.critical}
            </p>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Report JSON</CardTitle>
          <CardDescription>Paste this into chat for fixes.</CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            readOnly
            value={json}
            placeholder="Run tests to generate report…"
            className="font-mono text-xs min-h-[300px]"
          />
        </CardContent>
      </Card>
    </div>
  );
}
