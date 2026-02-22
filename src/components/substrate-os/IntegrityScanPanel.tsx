/**
 * Integrity Scan Panel — Pure diagnostic UI
 * Shows system integrity health score, findings, and scan history
 */

import { useState } from 'react';
import { 
  Shield, AlertTriangle, CheckCircle, XCircle, Loader2, 
  RefreshCw, ChevronRight, Info
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useIntegrityScan } from '@/hooks/admin/useIntegrityScan';
import { cn } from '@/lib/utils';
import type { FindingSeverity } from '@/lib/substrate/integrity-engine';

function getSeverityIcon(severity: FindingSeverity) {
  switch (severity) {
    case 'critical': return <XCircle className="w-3.5 h-3.5 text-red-400" />;
    case 'error': return <AlertTriangle className="w-3.5 h-3.5 text-red-400" />;
    case 'warning': return <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />;
    case 'info': return <Info className="w-3.5 h-3.5 text-blue-400" />;
  }
}

function getHealthColor(score: number) {
  if (score >= 90) return 'text-emerald-400';
  if (score >= 70) return 'text-amber-400';
  return 'text-red-400';
}

function getHealthBorderColor(score: number) {
  if (score >= 90) return 'border-emerald-500/30 bg-emerald-500/10';
  if (score >= 70) return 'border-amber-500/30 bg-amber-500/10';
  return 'border-red-500/30 bg-red-500/10';
}

export function IntegrityScanPanel() {
  const { scan, isScanning, lastResult, scanHistory } = useIntegrityScan();
  const [showHistory, setShowHistory] = useState(false);

  return (
    <Card className="border border-white/10 bg-white/5 dark:bg-white/[0.02] backdrop-blur-xl">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-cyan-400" />
            System Integrity
          </div>
          <Button
            size="sm"
            variant="outline"
            className="gap-1.5 border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10"
            onClick={() => scan('quick')}
            disabled={isScanning}
          >
            {isScanning ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <RefreshCw className="w-3 h-3" />
            )}
            {isScanning ? 'Scanning...' : 'Run Scan'}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Result */}
        {lastResult ? (
          <>
            {/* Health Score */}
            <div className={cn(
              "p-4 rounded-lg border text-center",
              getHealthBorderColor(lastResult.health_score)
            )}>
              <p className={cn("text-3xl font-bold", getHealthColor(lastResult.health_score))}>
                {lastResult.health_score}
              </p>
              <p className="text-xs text-muted-foreground mt-1">Integrity Health Score</p>
              <div className="flex items-center justify-center gap-4 mt-2 text-[10px]">
                <span className="text-red-400">{lastResult.errors_found} errors</span>
                <span className="text-amber-400">{lastResult.warnings_found} warnings</span>
                <span className="text-muted-foreground">{lastResult.duration_ms}ms</span>
              </div>
            </div>

            {/* Pass/Fail */}
            <div className={cn(
              "flex items-center gap-2 p-3 rounded-lg border",
              lastResult.passed 
                ? "border-emerald-500/30 bg-emerald-500/10" 
                : "border-red-500/30 bg-red-500/10"
            )}>
              {lastResult.passed ? (
                <CheckCircle className="w-4 h-4 text-emerald-400" />
              ) : (
                <XCircle className="w-4 h-4 text-red-400" />
              )}
              <span className={cn("text-xs font-medium", lastResult.passed ? "text-emerald-400" : "text-red-400")}>
                {lastResult.passed ? 'Promotion-ready — all checks passed' : 'Promotion blocked — issues detected'}
              </span>
            </div>

            {/* Findings */}
            {lastResult.findings.length > 0 && (
              <div>
                <p className="text-xs font-medium mb-2 text-foreground">Findings ({lastResult.findings.length})</p>
                <ScrollArea className="h-[200px]">
                  <div className="space-y-2 pr-2">
                    {lastResult.findings.map((finding, idx) => (
                      <div key={idx} className="flex items-start gap-2 p-2.5 rounded-lg bg-white/5 border border-white/10">
                        {getSeverityIcon(finding.severity as FindingSeverity)}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <Badge variant="outline" className="text-[8px] h-4">{finding.category}</Badge>
                            <Badge variant="outline" className={cn(
                              "text-[8px] h-4",
                              finding.severity === 'critical' && "border-red-500/50 text-red-400",
                              finding.severity === 'error' && "border-red-500/50 text-red-400",
                              finding.severity === 'warning' && "border-amber-500/50 text-amber-400",
                            )}>{finding.severity}</Badge>
                          </div>
                          <p className="text-[11px] text-muted-foreground">{finding.message}</p>
                          {finding.suggested_fix && (
                            <p className="text-[10px] text-cyan-400/70 mt-1">→ {finding.suggested_fix}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}

            {lastResult.findings.length === 0 && (
              <div className="text-center py-4">
                <CheckCircle className="w-8 h-8 mx-auto mb-2 text-emerald-400/50" />
                <p className="text-xs text-muted-foreground">No issues found</p>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-8">
            <Shield className="w-10 h-10 mx-auto mb-3 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">Run a scan to check system integrity</p>
            <p className="text-[10px] text-muted-foreground/70 mt-1">Pure diagnostic — does not mutate state</p>
          </div>
        )}

        {/* Scan History */}
        {scanHistory.length > 0 && (
          <Collapsible open={showHistory} onOpenChange={setShowHistory}>
            <CollapsibleTrigger className="flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground w-full">
              <ChevronRight className={cn("w-4 h-4 transition-transform", showHistory && "rotate-90")} />
              Scan History ({scanHistory.length})
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="mt-2 space-y-1.5">
                {scanHistory.slice(0, 10).map((scan: any) => (
                  <div key={scan.id} className="flex items-center justify-between p-2 rounded-lg bg-white/5 text-[10px]">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-[8px] h-4">{scan.mode}</Badge>
                      <span className={getHealthColor(scan.health_score)}>{scan.health_score}/100</span>
                    </div>
                    <span className="text-muted-foreground">
                      {new Date(scan.created_at).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}
      </CardContent>
    </Card>
  );
}
