/**
 * Integrity Scan Panel — Diagnostic-only system health scan UI
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Search, Shield, AlertTriangle, Info, XCircle, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { runIntegrityScan } from '@/lib/substrate/promotion-pipeline';
import type { IntegrityScanRun, IntegrityFinding } from '@/lib/substrate/promotion-pipeline/types';
import { toast } from 'sonner';

interface IntegrityScanPanelProps {
  latestScan: IntegrityScanRun | null;
  latestFindings: IntegrityFinding[];
  onScanComplete?: () => void;
}

const severityIcon: Record<string, any> = {
  critical: <XCircle className="w-3.5 h-3.5 text-red-500" />,
  error: <AlertTriangle className="w-3.5 h-3.5 text-red-400" />,
  warning: <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />,
  info: <Info className="w-3.5 h-3.5 text-blue-400" />,
};

const severityColor: Record<string, string> = {
  critical: 'border-red-500/20 bg-red-500/5',
  error: 'border-red-400/20 bg-red-400/5',
  warning: 'border-amber-400/20 bg-amber-400/5',
  info: 'border-blue-400/20 bg-blue-400/5',
};

export function IntegrityScanPanel({ latestScan, latestFindings, onScanComplete }: IntegrityScanPanelProps) {
  const [scanning, setScanning] = useState(false);
  const [localScan, setLocalScan] = useState<IntegrityScanRun | null>(null);
  const [localFindings, setLocalFindings] = useState<IntegrityFinding[]>([]);

  const scan = localScan ?? latestScan;
  const findings = localFindings.length > 0 ? localFindings : latestFindings;

  const handleScan = async () => {
    setScanning(true);
    try {
      const result = await runIntegrityScan('deep');
      setLocalScan(result.scan);
      setLocalFindings(result.findings);
      toast.success(`Integrity scan complete: ${result.scan.health_score}/100`);
      onScanComplete?.();
    } catch (err: any) {
      toast.error('Scan failed: ' + err.message);
    } finally {
      setScanning(false);
    }
  };

  const scoreColor = (scan?.health_score ?? 0) >= 80 ? 'text-emerald-400' 
    : (scan?.health_score ?? 0) >= 60 ? 'text-amber-400' 
    : 'text-red-400';

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Shield className="w-4 h-4 text-primary" />
            System Integrity
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 text-xs"
            onClick={handleScan}
            disabled={scanning}
          >
            <Search className="w-3.5 h-3.5" />
            {scanning ? 'Scanning...' : 'Run Integrity Scan'}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {scan ? (
          <>
            <div className="flex items-center gap-4">
              <div className="text-center">
                <p className={`text-4xl font-bold font-mono ${scoreColor}`}>{scan.health_score}</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">/100</p>
              </div>
              <div className="flex-1 grid grid-cols-3 gap-2 text-xs">
                <div className="p-2 rounded-lg bg-red-500/5 border border-red-500/10 text-center">
                  <p className="font-mono font-bold text-red-400">{scan.errors_found}</p>
                  <p className="text-muted-foreground">Errors</p>
                </div>
                <div className="p-2 rounded-lg bg-amber-500/5 border border-amber-500/10 text-center">
                  <p className="font-mono font-bold text-amber-400">{scan.warnings_found}</p>
                  <p className="text-muted-foreground">Warnings</p>
                </div>
                <div className="p-2 rounded-lg bg-muted/30 border border-border/30 text-center">
                  <p className="font-mono font-bold">{scan.duration_ms ?? 0}ms</p>
                  <p className="text-muted-foreground">Duration</p>
                </div>
              </div>
            </div>

            {findings.length > 0 && (
              <div className="space-y-1.5 max-h-[300px] overflow-y-auto">
                {findings.map((f) => (
                  <motion.div
                    key={f.id}
                    className={`p-2.5 rounded-lg border text-xs ${severityColor[f.severity] ?? ''}`}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                  >
                    <div className="flex items-start gap-2">
                      {severityIcon[f.severity]}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium">{f.message}</p>
                        {f.suggested_fix && (
                          <p className="text-muted-foreground mt-1 text-[10px]">💡 {f.suggested_fix}</p>
                        )}
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-[9px]">{f.category}</Badge>
                          <Badge variant="outline" className="text-[9px]">{f.severity}</Badge>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {findings.length === 0 && (
              <div className="flex items-center gap-2 text-sm text-emerald-400 p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
                <CheckCircle2 className="w-4 h-4" />
                No issues found — system integrity verified
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-6 text-sm text-muted-foreground">
            <Shield className="w-8 h-8 mx-auto mb-2 opacity-30" />
            Run an integrity scan to check system health
          </div>
        )}
      </CardContent>
    </Card>
  );
}
