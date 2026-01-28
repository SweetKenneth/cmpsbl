/**
 * INCLUSIVE Module Tab — Human Compatibility Pipeline
 * v6.0.0 — WCAG Scanning, Repair, Validation, Profiling, Reporting
 */

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { 
  Accessibility, Activity, CheckCircle, XCircle, AlertTriangle,
  Lock, RefreshCw, Loader2, Eye, Wrench, FileText, Users,
  ChevronRight, BarChart3, Target, Sparkles
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { inclusive } from '@/lib/substrate';

interface InclusiveTabProps {
  enabled: boolean;
}

interface ScanResult {
  url?: string;
  score: number;
  violations: Array<{
    id: string;
    impact: 'critical' | 'serious' | 'moderate' | 'minor';
    description: string;
    nodes: number;
  }>;
  passes: number;
  wcag_level: string;
}

export function InclusiveTab({ enabled }: InclusiveTabProps) {
  const queryClient = useQueryClient();
  const [scanUrl, setScanUrl] = useState('');
  const [wcagLevel, setWcagLevel] = useState<'A' | 'AA' | 'AAA'>('AA');

  // Fetch module status
  const { data: status, isLoading: statusLoading, refetch: refetchStatus } = useQuery({
    queryKey: ['inclusive-status'],
    queryFn: async () => {
      const result = await inclusive.status();
      return result.data as any;
    },
    refetchInterval: 60000,
    enabled,
  });

  // Fetch coverage stats
  const { data: coverage, isLoading: coverageLoading } = useQuery({
    queryKey: ['inclusive-coverage'],
    queryFn: async () => {
      const result = await inclusive.coverage();
      return result.data as any;
    },
    refetchInterval: 120000,
    enabled,
  });

  // Scan mutation
  const scanMutation = useMutation({
    mutationFn: async (target: string) => {
      const result = await inclusive.scan(target, { wcag_level: wcagLevel, scan_depth: 'standard' });
      if (!result.success) throw new Error(result.error || 'Scan failed');
      return result.data as ScanResult;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['inclusive-status'] });
      if (data.score >= 90) {
        toast.success(`Accessibility score: ${data.score}%`, { description: `${data.passes} checks passed` });
      } else {
        toast.warning(`Accessibility score: ${data.score}%`, { description: `${data.violations?.length || 0} issues found` });
      }
    },
    onError: (error) => {
      toast.error('Scan failed', { description: error instanceof Error ? error.message : 'Unknown error' });
    },
  });

  // Self-scan mutation
  const selfScanMutation = useMutation({
    mutationFn: async () => {
      const result = await inclusive.selfScan();
      if (!result.success) throw new Error(result.error || 'Self-scan failed');
      return result.data as ScanResult;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['inclusive-status'] });
      toast.success(`Substrate UI score: ${data?.score || 100}%`);
    },
    onError: (error) => {
      toast.error('Self-scan failed', { description: error instanceof Error ? error.message : 'Unknown error' });
    },
  });

  // Repair mutation
  const repairMutation = useMutation({
    mutationFn: async (target: string) => {
      const result = await inclusive.repair(target);
      if (!result.success) throw new Error(result.error || 'Repair failed');
      return result.data;
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['inclusive-status'] });
      toast.success('Accessibility repairs applied', { description: `${data?.fixes_applied || 0} issues fixed` });
    },
    onError: (error) => {
      toast.error('Repair failed', { description: error instanceof Error ? error.message : 'Unknown error' });
    },
  });

  const globalScore = status?.global_score || status?.score || 100;
  const totalViolations = status?.total_violations || 0;

  if (!enabled) {
    return (
      <motion.main 
        className="container mx-auto px-4 py-6 max-w-7xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="rounded-xl border border-dashed border-teal-500/20 bg-muted/5 backdrop-blur-xl p-12">
          <div className="text-center">
            <Lock className="w-12 h-12 mx-auto mb-4 text-muted-foreground/30" />
            <h3 className="text-lg font-semibold text-muted-foreground/60">INCLUSIVE Access Restricted</h3>
            <p className="text-sm text-muted-foreground/50 mt-2">Operator privileges required for accessibility controls</p>
          </div>
        </div>
      </motion.main>
    );
  }

  return (
    <motion.main 
      className="container mx-auto px-4 py-6 max-w-7xl space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-teal-500/20 border border-teal-500/40 flex items-center justify-center">
            <Accessibility className="w-6 h-6 text-teal-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold">INCLUSIVE Module</h2>
            <p className="text-xs text-muted-foreground font-mono">human compatibility pipeline • WCAG 2.2</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => refetchStatus()}
            className="gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
          <Badge variant="outline" className={cn(
            "text-xs",
            globalScore >= 90 
              ? "border-emerald-500/50 text-emerald-400 bg-emerald-500/10" 
              : globalScore >= 70
              ? "border-amber-500/50 text-amber-400 bg-amber-500/10"
              : "border-red-500/50 text-red-400 bg-red-500/10"
          )}>
            WCAG {wcagLevel}
          </Badge>
        </div>
      </div>

      {/* Score Cards */}
      <div className="grid md:grid-cols-3 gap-4">
        {/* Global Score */}
        <Card className="border-teal-500/20 bg-muted/10 backdrop-blur-xl">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Target className="w-4 h-4 text-teal-400" />
              Global Accessibility Score
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {statusLoading ? (
              <Skeleton className="h-16 w-full" />
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <span className={cn(
                    "text-3xl font-bold",
                    globalScore >= 90 ? "text-emerald-400" : globalScore >= 70 ? "text-amber-400" : "text-red-400"
                  )}>
                    {globalScore}%
                  </span>
                  <Badge variant="outline" className={cn(
                    "text-xs",
                    globalScore >= 90 
                      ? "border-emerald-500/50 text-emerald-400 bg-emerald-500/10" 
                      : globalScore >= 70
                      ? "border-amber-500/50 text-amber-400 bg-amber-500/10"
                      : "border-red-500/50 text-red-400 bg-red-500/10"
                  )}>
                    {globalScore >= 90 ? 'EXCELLENT' : globalScore >= 70 ? 'GOOD' : 'NEEDS WORK'}
                  </Badge>
                </div>
                <Progress value={globalScore} className="h-2" />
              </>
            )}
          </CardContent>
        </Card>

        {/* Violations */}
        <Card className="border-amber-500/20 bg-muted/10 backdrop-blur-xl">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              Active Violations
            </CardTitle>
          </CardHeader>
          <CardContent>
            {statusLoading ? (
              <Skeleton className="h-16 w-full" />
            ) : (
              <div className="flex items-center justify-between">
                <span className={cn(
                  "text-3xl font-bold",
                  totalViolations === 0 ? "text-emerald-400" : "text-amber-400"
                )}>
                  {totalViolations}
                </span>
                {totalViolations === 0 ? (
                  <CheckCircle className="w-8 h-8 text-emerald-400/50" />
                ) : (
                  <XCircle className="w-8 h-8 text-amber-400/50" />
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Template Coverage */}
        <Card className="border-cyan-500/20 bg-muted/10 backdrop-blur-xl">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-cyan-400" />
              Template Coverage
            </CardTitle>
          </CardHeader>
          <CardContent>
            {coverageLoading ? (
              <Skeleton className="h-16 w-full" />
            ) : (
              <div className="flex items-center justify-between">
                <span className="text-3xl font-bold text-cyan-400">
                  {coverage?.coverage_percent || coverage?.total_templates || 0}%
                </span>
                <Badge variant="outline" className="border-cyan-500/50 text-cyan-400 bg-cyan-500/10 text-xs">
                  {coverage?.scanned_templates || 0}/{coverage?.total_templates || 0} scanned
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Scan Controls */}
      <Card className="border-teal-500/20 bg-muted/10 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Eye className="w-4 h-4 text-teal-400" />
            Accessibility Scanner
          </CardTitle>
          <CardDescription className="text-xs">Scan any URL for WCAG 2.2 compliance</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="https://example.com or paste HTML"
              value={scanUrl}
              onChange={(e) => setScanUrl(e.target.value)}
              className="flex-1 bg-muted/30"
            />
            <Select value={wcagLevel} onValueChange={(v) => setWcagLevel(v as any)}>
              <SelectTrigger className="w-24 bg-muted/30">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="A">Level A</SelectItem>
                <SelectItem value="AA">Level AA</SelectItem>
                <SelectItem value="AAA">Level AAA</SelectItem>
              </SelectContent>
            </Select>
            <Button
              onClick={() => scanUrl && scanMutation.mutate(scanUrl)}
              disabled={!scanUrl || scanMutation.isPending}
              className="gap-2"
            >
              {scanMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
              Scan
            </Button>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => selfScanMutation.mutate()}
              disabled={selfScanMutation.isPending}
              className="gap-2"
            >
              {selfScanMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
              Self-Scan Substrate UI
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => scanUrl && repairMutation.mutate(scanUrl)}
              disabled={!scanUrl || repairMutation.isPending}
              className="gap-2"
            >
              {repairMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Wrench className="w-4 h-4" />
              )}
              Auto-Repair
            </Button>
          </div>

          {/* Scan Results */}
          {scanMutation.data && (
            <div className="mt-4 p-4 rounded-lg bg-muted/20 border border-teal-500/20">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium">Scan Results</h4>
                <Badge variant="outline" className={cn(
                  "text-xs",
                  scanMutation.data.score >= 90 
                    ? "border-emerald-500/50 text-emerald-400 bg-emerald-500/10" 
                    : "border-amber-500/50 text-amber-400 bg-amber-500/10"
                )}>
                  Score: {scanMutation.data.score}%
                </Badge>
              </div>
              
              {scanMutation.data.violations?.length > 0 ? (
                <ScrollArea className="h-48">
                  <div className="space-y-2">
                    {scanMutation.data.violations.map((v, i) => (
                      <div key={i} className="flex items-start gap-2 p-2 rounded-lg bg-muted/20">
                        <div className={cn(
                          "w-2 h-2 rounded-full mt-1.5 shrink-0",
                          v.impact === 'critical' ? "bg-red-500" :
                          v.impact === 'serious' ? "bg-orange-500" :
                          v.impact === 'moderate' ? "bg-amber-500" : "bg-blue-500"
                        )} />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium truncate">{v.id}</p>
                          <p className="text-xs text-muted-foreground truncate">{v.description}</p>
                        </div>
                        <Badge variant="outline" className="text-[10px] shrink-0">{v.impact}</Badge>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              ) : (
                <div className="text-center py-4">
                  <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                  <p className="text-sm text-emerald-400">All checks passed!</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pipeline Info */}
      <Card className="border-teal-500/20 bg-muted/10 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Users className="w-4 h-4 text-teal-400" />
            Human Compatibility Pipeline
          </CardTitle>
          <CardDescription className="text-xs">End-to-end accessibility workflow</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between gap-2">
            {[
              { name: 'Scan', icon: Eye, desc: 'Detect issues' },
              { name: 'Repair', icon: Wrench, desc: 'Auto-fix violations' },
              { name: 'Validate', icon: CheckCircle, desc: 'Verify fixes' },
              { name: 'Profile', icon: Users, desc: 'Adaptive UX' },
              { name: 'Report', icon: FileText, desc: 'Document compliance' },
            ].map((step, i) => (
              <div key={step.name} className="flex items-center gap-2 flex-1">
                <div className="flex-1 text-center p-3 rounded-lg bg-muted/20 border border-teal-500/20">
                  <step.icon className="w-5 h-5 text-teal-400 mx-auto mb-1" />
                  <p className="text-xs font-medium text-teal-400">{step.name}</p>
                  <p className="text-[10px] text-muted-foreground">{step.desc}</p>
                </div>
                {i < 4 && <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.main>
  );
}
