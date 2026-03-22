/**
 * Diagnostics Panel Component
 * Visual tool for manual connection troubleshooting
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, Download, Play, AlertTriangle } from 'lucide-react';
import { runConnectionDiagnostics, exportDiagnostics, getDiagnosticSummary, type DiagnosticResult } from '@/lib/system/connectionDiagnostics';
import { toast } from 'sonner';

export function DiagnosticsPanel() {
  const [results, setResults] = useState<DiagnosticResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const handleRunDiagnostics = async () => {
    setIsRunning(true);
    toast.info('Running diagnostics...');
    
    try {
      const diagnosticResults = await runConnectionDiagnostics();
      setResults(diagnosticResults);
      
      const summary = getDiagnosticSummary(diagnosticResults);
      toast.success(`Diagnostics complete: ${summary}`);
    } catch (error) {
      toast.error('Error running diagnostics');
      console.error(error);
    } finally {
      setIsRunning(false);
    }
  };

  const handleExport = () => {
    const report = exportDiagnostics(results);
    const blob = new Blob([report], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `diagnostics-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Diagnostics exported');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass':
        return <CheckCircle className="h-5 w-5 text-neon-green" />;
      case 'fail':
        return <AlertCircle className="h-5 w-5 text-destructive" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-neon-amber" />;
      default:
        return null;
    }
  };

  const getStatusVariant = (status: string): "default" | "destructive" | "secondary" => {
    switch (status) {
      case 'pass':
        return 'default';
      case 'fail':
        return 'destructive';
      case 'warning':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Connection Diagnostics</CardTitle>
        <CardDescription>
          Run manual tests to identify connection issues
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button
            onClick={handleRunDiagnostics}
            disabled={isRunning}
            className="gap-2"
          >
            <Play className="h-4 w-4" />
            {isRunning ? 'Running...' : 'Run Diagnostics'}
          </Button>
          
          {results.length > 0 && (
            <Button
              onClick={handleExport}
              variant="outline"
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              Export Report
            </Button>
          )}
        </div>

        {results.length > 0 && (
          <div className="space-y-3">
            {results.map((result, index) => (
              <div
                key={index}
                className="border rounded-lg p-4 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(result.status)}
                    <span className="font-medium">{result.test}</span>
                  </div>
                  <Badge variant={getStatusVariant(result.status)}>
                    {result.status}
                  </Badge>
                </div>
                
                <p className="text-sm text-muted-foreground">
                  {result.message}
                </p>
                
                {result.details && (
                  <details className="text-xs">
                    <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                      View details
                    </summary>
                    <pre className="mt-2 p-2 bg-muted rounded overflow-auto">
                      {JSON.stringify(result.details, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
