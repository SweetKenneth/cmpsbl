/**
 * INCLUSIVE Node Tab — Human Compatibility System
 * WCAG Scanning, Repair, Validation, Profiling, Reporting
 * 
 * Full glue layer integration across 40 nodes:
 * - SYSTEM: self_scan → system.audit
 * - VISION: score → vision.health metrics  
 * - DEFENSE: severity → defense risk chain
 * - EVOLUTION: regressions → proposals
 * - TEMPLATES: scan→repair→validate→approve chain
 * - MARKETPLACE: block publishing on critical violations
 * - ACCESS: Role-based capability gating
 */

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { 
  Accessibility, Activity, CheckCircle, XCircle, AlertTriangle,
  Lock, RefreshCw, Loader2, Eye, Wrench, FileText, Users,
  ChevronRight, BarChart3, Target, Sparkles, Shield, TrendingDown,
  Bell
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
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { inclusive } from '@/lib/substrate';
import { 
  useInclusiveStatusOS, 
  useInclusiveCoverageOS, 
  useInclusiveRegressionsOS 
} from '@/hooks/useSubstrateOS';

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
  const [autoRepairEnabled, setAutoRepairEnabled] = useState(true);

  // Use glue-integrated hooks for real-time data
  const { data: statusData, isLoading: statusLoading, refetch: refetchStatus } = useInclusiveStatusOS();
  const { data: coverageData, isLoading: coverageLoading } = useInclusiveCoverageOS();
  const { data: regressionsData, isLoading: regressionsLoading } = useInclusiveRegressionsOS(24);
  
  // Extract status from response
  const status = statusData?.data as any;
  const coverage = coverageData?.data as any;
  const regressions = (regressionsData?.data as any)?.regressions || [];

  // Scan mutation with auto-repair capability
  const scanMutation = useMutation({
    mutationFn: async (target: string) => {
      if (autoRepairEnabled) {
        // Use unified scan-and-repair flow
        const result = await inclusive.scanAndRepair(target, { wcag_level: wcagLevel, scan_depth: 'standard' });
        if (!result.success) throw new Error(result.error || 'Scan and repair failed');
        return result.data as any;
      } else {
        // Standard scan only
        const result = await inclusive.scan(target, { wcag_level: wcagLevel, scan_depth: 'standard' });
        if (!result.success) throw new Error(result.error || 'Scan failed');
        return result.data as ScanResult;
      }
    },
    onSuccess: (data) => {
      // Invalidate all glue-connected modules
      queryClient.invalidateQueries({ queryKey: ['substrate', 'inclusive'] });
      queryClient.invalidateQueries({ queryKey: ['substrate', 'vision', 'health'] });
      queryClient.invalidateQueries({ queryKey: ['substrate', 'system', 'audit'] });
      queryClient.invalidateQueries({ queryKey: ['substrate', 'evolution', 'status'] });
      
      // Handle scan-and-repair result
      if (data.repair?.applied) {
        const scanScore = data.scan?.score || 0;
        const finalScore = data.final_score || scanScore;
        const fixesApplied = data.repair?.fixes_count || 0;
        
        if (fixesApplied > 0) {
          toast.success(`Auto-repaired ${fixesApplied} issue(s)`, { 
            description: `Score improved: ${scanScore}% → ${finalScore}%` 
          });
        } else if (scanScore >= 90) {
          toast.success(`Accessibility score: ${finalScore}%`, { description: 'All checks passed' });
        } else {
          toast.warning(`Score: ${finalScore}%`, { description: 'Some issues require manual review' });
        }
      } else {
        // Standard scan result
        const score = data.score || 0;
        if (score >= 90) {
          toast.success(`Accessibility score: ${score}%`, { description: `${data.passes || 0} checks passed` });
        } else {
          toast.warning(`Accessibility score: ${score}%`, { description: `${data.violations?.length || 0} issues found` });
        }
      }
    },
    onError: (error) => {
      toast.error('Scan failed', { description: error instanceof Error ? error.message : 'Unknown error' });
    },
  });

  // Self-scan mutation - connects to SYSTEM.audit
  const selfScanMutation = useMutation({
    mutationFn: async () => {
      const result = await inclusive.selfScan();
      if (!result.success) throw new Error(result.error || 'Self-scan failed');
      return result.data as ScanResult;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['substrate', 'inclusive'] });
      queryClient.invalidateQueries({ queryKey: ['substrate', 'system', 'audit'] });
      queryClient.invalidateQueries({ queryKey: ['substrate', 'vision', 'health'] });
      toast.success(`Substrate UI score: ${data?.score || 100}%`);
    },
    onError: (error) => {
      toast.error('Self-scan failed', { description: error instanceof Error ? error.message : 'Unknown error' });
    },
  });

  // Repair mutation - may trigger EVOLUTION proposal
  const repairMutation = useMutation({
    mutationFn: async (target: string) => {
      const result = await inclusive.repair(target);
      if (!result.success) throw new Error(result.error || 'Repair failed');
      return result.data;
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['substrate', 'inclusive'] });
      queryClient.invalidateQueries({ queryKey: ['substrate', 'evolution', 'status'] });
      toast.success('Accessibility repairs applied', { description: `${data?.fixes_applied || 0} issues fixed` });
    },
    onError: (error) => {
      toast.error('Repair failed', { description: error instanceof Error ? error.message : 'Unknown error' });
    },
  });

  const globalScore = status?.global_score || status?.score || 100;
  const totalViolations = status?.total_violations || 0;
  const regressionsCount = regressions?.length || status?.regressions_24h || 0;
  const pendingRepairs = status?.pending_repairs || 0;

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-teal-500/20 border border-teal-500/40 flex items-center justify-center shrink-0">
            <Accessibility className="w-5 sm:w-6 h-5 sm:h-6 text-teal-400" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold">INCLUSIVE Module</h2>
            <p className="text-[10px] sm:text-xs text-muted-foreground font-mono">human compatibility engine • WCAG 2.2</p>
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
      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
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
          <div className="flex flex-col sm:flex-row gap-2">
            <Input
              placeholder="https://example.com or paste HTML"
              value={scanUrl}
              onChange={(e) => setScanUrl(e.target.value)}
              className="flex-1 bg-muted/30"
            />
            <div className="flex gap-2">
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
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex flex-wrap gap-2">
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
                Self-Scan UI
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => scanUrl && repairMutation.mutate(scanUrl)}
                disabled={!scanUrl || repairMutation.isPending || autoRepairEnabled}
                className="gap-2"
                title={autoRepairEnabled ? "Auto-repair is enabled - repairs run automatically after scan" : "Run repair manually"}
              >
                {repairMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Wrench className="w-4 h-4" />
                )}
                Repair
              </Button>
            </div>
            
            {/* Auto-Repair Toggle */}
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/30 border border-teal-500/20">
              <Switch
                id="auto-repair"
                checked={autoRepairEnabled}
                onCheckedChange={setAutoRepairEnabled}
                className="data-[state=checked]:bg-teal-500"
              />
              <Label htmlFor="auto-repair" className="text-xs font-medium cursor-pointer flex items-center gap-1.5">
                <Wrench className="w-3 h-3" />
                Auto-Fix
              </Label>
            </div>
          </div>

          {/* Scan Results */}
          {scanMutation.data && (
            <div className="mt-4 p-4 rounded-lg bg-muted/20 border border-teal-500/20">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium flex items-center gap-2">
                  Scan Results
                  {scanMutation.data.repair?.applied && (
                    <Badge variant="outline" className="border-teal-500/50 text-teal-400 bg-teal-500/10 text-[10px]">
                      <Wrench className="w-3 h-3 mr-1" />
                      Auto-Fixed
                    </Badge>
                  )}
                </h4>
                <div className="flex items-center gap-2">
                  {scanMutation.data.repair?.applied && scanMutation.data.repair?.fixes_count > 0 && (
                    <Badge variant="outline" className="border-emerald-500/50 text-emerald-400 bg-emerald-500/10 text-xs">
                      +{scanMutation.data.improvement || 0}% improved
                    </Badge>
                  )}
                  <Badge variant="outline" className={cn(
                    "text-xs",
                    (scanMutation.data.final_score || scanMutation.data.score || 0) >= 90 
                      ? "border-emerald-500/50 text-emerald-400 bg-emerald-500/10" 
                      : "border-amber-500/50 text-amber-400 bg-amber-500/10"
                  )}>
                    Score: {scanMutation.data.final_score || scanMutation.data.score || 0}%
                  </Badge>
                </div>
              </div>
              
              {/* Show repairs applied */}
              {scanMutation.data.repair?.applied && scanMutation.data.repair?.fixes_count > 0 && (
                <div className="mb-3 p-3 rounded-lg bg-teal-500/10 border border-teal-500/20">
                  <div className="flex items-center gap-2 text-teal-400 mb-2">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-xs font-medium">
                      {scanMutation.data.repair.fixes_count} issue(s) automatically fixed
                    </span>
                  </div>
                  {scanMutation.data.repair?.repairs?.length > 0 && (
                    <div className="space-y-1">
                      {scanMutation.data.repair.repairs.slice(0, 3).map((r: any, i: number) => (
                        <div key={i} className="text-[10px] text-muted-foreground">
                          • {r.explanation || r.wcag_criterion || 'Fixed issue'}
                        </div>
                      ))}
                      {scanMutation.data.repair.repairs.length > 3 && (
                        <div className="text-[10px] text-muted-foreground">
                          ...and {scanMutation.data.repair.repairs.length - 3} more
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
              
              {/* Show remaining violations */}
              {(scanMutation.data.violations?.length > 0 || scanMutation.data.scan?.issues?.length > 0) ? (
                <ScrollArea className="h-48">
                  <div className="space-y-2">
                    {(scanMutation.data.violations || scanMutation.data.scan?.issues || []).map((v: any, i: number) => (
                      <div key={i} className="flex items-start gap-2 p-2 rounded-lg bg-muted/20">
                        <div className={cn(
                          "w-2 h-2 rounded-full mt-1.5 shrink-0",
                          (v.impact === 'critical' || v.severity === 'critical') ? "bg-red-500" :
                          (v.impact === 'serious' || v.severity === 'high') ? "bg-orange-500" :
                          (v.impact === 'moderate' || v.severity === 'medium') ? "bg-amber-500" : "bg-blue-500"
                        )} />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium truncate">{v.id || v.type}</p>
                          <p className="text-xs text-muted-foreground truncate">{v.description}</p>
                        </div>
                        <Badge variant="outline" className="text-[10px] shrink-0">
                          {v.impact || v.severity}
                        </Badge>
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
          <div className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-2 overflow-x-auto">
            {[
              { name: 'Scan', icon: Eye, desc: 'Detect issues' },
              { name: 'Repair', icon: Wrench, desc: 'Auto-fix violations' },
              { name: 'Validate', icon: CheckCircle, desc: 'Verify fixes' },
              { name: 'Profile', icon: Users, desc: 'Adaptive UX' },
              { name: 'Report', icon: FileText, desc: 'Document compliance' },
            ].map((step, i) => (
              <div key={step.name} className="flex items-center gap-1 sm:gap-2 flex-1 min-w-[60px]">
                <div className="flex-1 text-center p-2 sm:p-3 rounded-lg bg-muted/20 border border-teal-500/20">
                  <step.icon className="w-4 sm:w-5 h-4 sm:h-5 text-teal-400 mx-auto mb-1" />
                  <p className="text-[10px] sm:text-xs font-medium text-teal-400">{step.name}</p>
                  <p className="text-[9px] sm:text-[10px] text-muted-foreground hidden sm:block">{step.desc}</p>
                </div>
                {i < 4 && <ChevronRight className="w-3 sm:w-4 h-3 sm:h-4 text-muted-foreground shrink-0" />}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.main>
  );
}
