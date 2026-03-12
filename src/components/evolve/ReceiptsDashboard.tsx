/**
 * Evolution Receipts Dashboard — Admin View
 * Timeline view with circuit state and drill-down
 */

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Clock, 
  Shield, 
  ShieldOff,
  RefreshCw,
  FileText,
  Activity,
  TrendingUp
} from 'lucide-react';
import { 
  getPublicReceipts, 
  getReceiptStats, 
  type PublicReceipt 
} from '@/lib/evolve/public-receipts';
import { 
  getCircuitStatus, 
  resetCircuit, 
  openCircuit,
  type CircuitStatus 
} from '@/lib/evolve/circuit-breaker';
import { 
  getAutonomyStatus, 
  setAutonomyMode,
  type AutonomyStatus,
  type AutonomyMode 
} from '@/lib/evolve/autonomy';
import { useToast } from '@/hooks/use-toast';

export function ReceiptsDashboard() {
  const [receipts, setReceipts] = useState<PublicReceipt[]>([]);
  const [circuit, setCircuit] = useState<CircuitStatus | null>(null);
  const [autonomy, setAutonomy] = useState<AutonomyStatus | null>(null);
  const [stats, setStats] = useState<{
    total_receipts: number;
    successful_evolutions: number;
    avg_confidence: number;
    avg_test_pass_rate: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedReceipt, setSelectedReceipt] = useState<PublicReceipt | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [receiptsData, circuitData, autonomyData, statsData] = await Promise.all([
        getPublicReceipts(1, 20),
        getCircuitStatus(),
        getAutonomyStatus(),
        getReceiptStats(),
      ]);
      
      setReceipts(receiptsData.receipts);
      setCircuit(circuitData);
      setAutonomy(autonomyData);
      setStats(statsData);
    } catch (error) {
      console.error('Failed to load data:', error);
    }
    setLoading(false);
  }

  async function handleCircuitReset() {
    const result = await resetCircuit('Admin manual reset');
    toast({
      title: result.success ? 'Circuit Reset' : 'Reset Failed',
      description: result.message,
      variant: result.success ? 'default' : 'destructive',
    });
    loadData();
  }

  async function handleCircuitOpen() {
    const result = await openCircuit('Admin manual trip');
    toast({
      title: result.success ? 'Circuit Opened' : 'Open Failed',
      description: result.message,
      variant: result.success ? 'default' : 'destructive',
    });
    loadData();
  }

  async function handleAutonomyChange(mode: AutonomyMode) {
    const result = await setAutonomyMode(mode);
    toast({
      title: result.success ? 'Autonomy Updated' : 'Update Failed',
      description: result.message,
      variant: result.success ? 'default' : 'destructive',
    });
    loadData();
  }

  function getPhaseIcon(phase: string) {
    switch (phase) {
      case 'verified':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'aborted':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default:
        return <Clock className="h-4 w-4 text-blue-500" />;
    }
  }

  function getPhaseColor(phase: string): 'default' | 'secondary' | 'destructive' | 'outline' {
    switch (phase) {
      case 'verified':
        return 'default';
      case 'failed':
        return 'destructive';
      case 'aborted':
        return 'secondary';
      default:
        return 'outline';
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-2xl font-bold">{stats?.total_receipts || 0}</p>
                <p className="text-xs text-muted-foreground">Total Receipts</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{stats?.successful_evolutions || 0}</p>
                <p className="text-xs text-muted-foreground">Verified</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">
                  {((stats?.avg_confidence || 0) * 100).toFixed(0)}%
                </p>
                <p className="text-xs text-muted-foreground">Avg Confidence</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-2xl font-bold">
                  {((stats?.avg_test_pass_rate || 0) * 100).toFixed(0)}%
                </p>
                <p className="text-xs text-muted-foreground">Test Pass Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Safety Switch */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {circuit?.is_blocking ? (
                <ShieldOff className="h-5 w-5 text-red-500" />
              ) : (
                <Shield className="h-5 w-5 text-green-500" />
              )}
              Safety Switch
            </CardTitle>
            <CardDescription>
              {circuit?.is_blocking 
                ? 'Evolution is BLOCKED'
                : 'Evolution is allowed'
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">State</span>
              <Badge variant={circuit?.is_blocking ? 'destructive' : 'default'}>
                {circuit?.state?.toUpperCase() || 'UNKNOWN'}
              </Badge>
            </div>
            
            {circuit?.reason && (
              <div className="text-sm text-muted-foreground">
                Reason: {circuit.reason}
              </div>
            )}
            
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={handleCircuitReset}
                disabled={!circuit?.is_blocking}
              >
                Reset Circuit
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={handleCircuitOpen}
                disabled={circuit?.is_blocking}
              >
                Open Circuit
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Autonomy Control */}
        <Card>
          <CardHeader>
            <CardTitle>Autonomy Mode</CardTitle>
            <CardDescription>
              {autonomy?.mode === 'governed' 
                ? 'Governed autonomous evolution'
                : autonomy?.mode === 'advisory'
                ? 'Advisory mode (suggestions only)'
                : 'Autonomy disabled'
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Current Mode</span>
              <Badge>{autonomy?.mode?.toUpperCase() || 'OFF'}</Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Runs Today</span>
              <span className="text-sm">
                {autonomy?.runs_today || 0} / {autonomy?.max_runs_today || 1}
              </span>
            </div>
            
            <div className="flex gap-2">
              <Button
                size="sm"
                variant={autonomy?.mode === 'off' ? 'default' : 'outline'}
                onClick={() => handleAutonomyChange('off')}
              >
                Off
              </Button>
              <Button
                size="sm"
                variant={autonomy?.mode === 'advisory' ? 'default' : 'outline'}
                onClick={() => handleAutonomyChange('advisory')}
              >
                Advisory
              </Button>
              <Button
                size="sm"
                variant={autonomy?.mode === 'governed' ? 'default' : 'outline'}
                onClick={() => handleAutonomyChange('governed')}
              >
                Governed
              </Button>
            </div>
            
            {autonomy?.blocking_reasons && autonomy.blocking_reasons.length > 0 && (
              <div className="text-xs text-muted-foreground">
                <p className="font-medium mb-1">Blocking reasons:</p>
                <ul className="list-disc list-inside">
                  {autonomy.blocking_reasons.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Receipts Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Evolution Receipts</span>
            <Button size="sm" variant="outline" onClick={loadData}>
              <RefreshCw className="h-4 w-4 mr-1" />
              Refresh
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px]">
            <div className="space-y-3">
              {receipts.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No evolution receipts yet
                </p>
              ) : (
                receipts.map((receipt) => (
                  <div
                    key={receipt.run_id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedReceipt?.run_id === receipt.run_id
                        ? 'border-primary bg-muted/50'
                        : 'hover:bg-muted/30'
                    }`}
                    onClick={() => setSelectedReceipt(
                      selectedReceipt?.run_id === receipt.run_id ? null : receipt
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getPhaseIcon(receipt.phase)}
                        <span className="font-mono text-sm">
                          {receipt.run_id.slice(0, 8)}
                        </span>
                        <Badge variant={getPhaseColor(receipt.phase)}>
                          {receipt.phase}
                        </Badge>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(receipt.timestamp).toLocaleString()}
                      </span>
                    </div>
                    
                    {selectedReceipt?.run_id === receipt.run_id && (
                      <div className="mt-4 pt-4 border-t grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Confidence</p>
                          <p className="font-medium">
                            {(receipt.confidence_score * 100).toFixed(0)}%
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Risk Level</p>
                          <p className="font-medium capitalize">{receipt.risk_level}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Tests</p>
                          <p className="font-medium">
                            {receipt.tests_passed}/{receipt.tests_run} passed
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Initiated By</p>
                          <p className="font-medium capitalize">{receipt.initiated_by}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Health Before</p>
                          <p className="font-medium">
                            {receipt.health_before !== null 
                              ? `${receipt.health_before}%` 
                              : 'N/A'}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Health After</p>
                          <p className="font-medium">
                            {receipt.health_after !== null 
                              ? `${receipt.health_after}%` 
                              : 'N/A'}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}

export default ReceiptsDashboard;
