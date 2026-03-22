/**
 * Pack Release Checklist — Admin-only density guard + release validation UI
 */
import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Shield,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ChevronDown,
  ChevronUp,
  Activity,
} from 'lucide-react';
import {
  validatePackRelease,
  DENSITY_THRESHOLDS,
  type ReleaseValidation,
  type PackDensityReport,
} from '@/lib/quarry/pack-density';
import { cn } from '@/lib/utils';

function DensityBar({ value, max, label }: { value: number; max: number; label: string }) {
  const pct = Math.min(100, (value / max) * 100);
  const isOver = value > max;
  const isNear = value > max * 0.8;

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className={cn(
          'font-mono font-medium',
          isOver ? 'text-destructive' : isNear ? 'text-neon-amber' : 'text-muted-foreground'
        )}>
          {typeof value === 'number' && value < 1 ? value.toFixed(2) : value} / {max}
        </span>
      </div>
      <Progress
        value={pct}
        className={cn(
          'h-1.5',
          isOver ? '[&>div]:bg-destructive' : isNear ? '[&>div]:bg-neon-amber' : ''
        )}
      />
    </div>
  );
}

export function PackReleaseChecklist() {
  const [expanded, setExpanded] = useState(false);
  const validation: ReleaseValidation = useMemo(() => validatePackRelease(), []);
  const { ecosystem, issues, canRelease } = validation;

  const errors = issues.filter(i => i.severity === 'error');
  const warnings = issues.filter(i => i.severity === 'warning');

  // Sort packs by density descending
  const sortedPacks = useMemo(
    () => [...ecosystem.packs].sort((a, b) => b.densityScore - a.densityScore),
    [ecosystem.packs]
  );

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Shield className="w-4 h-4 text-primary" />
            Release Checklist
          </CardTitle>
          <Badge variant={canRelease ? 'default' : 'destructive'} className="text-xs">
            {canRelease ? (
              <><CheckCircle2 className="w-3 h-3 mr-1" /> Release OK</>
            ) : (
              <><XCircle className="w-3 h-3 mr-1" /> Blocked</>
            )}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Summary metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="text-center p-2 rounded-lg bg-muted/30">
            <div className="text-lg font-bold">{ecosystem.packs.length}</div>
            <div className="text-xs text-muted-foreground">Packs</div>
          </div>
          <div className="text-center p-2 rounded-lg bg-muted/30">
            <div className="text-lg font-bold">{ecosystem.uniqueComponents}</div>
            <div className="text-xs text-muted-foreground">Unique Components</div>
          </div>
          <div className="text-center p-2 rounded-lg bg-muted/30">
            <div className="text-lg font-bold">{ecosystem.totalCrystallized}</div>
            <div className="text-xs text-muted-foreground">Crystallized Total</div>
          </div>
          <div className="text-center p-2 rounded-lg bg-muted/30">
            <div className={cn(
              'text-lg font-bold',
              errors.length > 0 ? 'text-destructive' : warnings.length > 0 ? 'text-neon-amber' : 'text-neon-green'
            )}>
              {errors.length}E / {warnings.length}W
            </div>
            <div className="text-xs text-muted-foreground">Issues</div>
          </div>
        </div>

        {/* Density gauges */}
        <div className="space-y-2">
          <DensityBar value={ecosystem.avgDensity} max={DENSITY_THRESHOLDS.maxAvgDensity} label="Avg Ecosystem Density" />
          <DensityBar value={ecosystem.maxDensity} max={DENSITY_THRESHOLDS.maxPackDensity} label="Max Pack Density" />
        </div>

        {/* Issues */}
        {issues.length > 0 && (
          <div className="space-y-1.5">
            {issues.map((issue, i) => (
              <div
                key={i}
                className={cn(
                  'flex items-start gap-2 p-2 rounded-md text-xs',
                  issue.severity === 'error' ? 'bg-destructive/10 text-destructive' : 'bg-neon-amber/10 text-neon-amber dark:text-neon-amber'
                )}
              >
                {issue.severity === 'error' ? (
                  <XCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                ) : (
                  <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                )}
                <div>
                  <span className="font-medium">{issue.packName}:</span>{' '}
                  {issue.message}
                </div>
              </div>
            ))}
          </div>
        )}

        {issues.length === 0 && (
          <div className="flex items-center gap-2 p-2 rounded-md bg-neon-green/10 text-neon-green dark:text-neon-green text-xs">
            <CheckCircle2 className="w-3.5 h-3.5" />
            All density checks passed. Ecosystem is balanced.
          </div>
        )}

        {/* Expandable per-pack table */}
        <Button
          variant="ghost"
          size="sm"
          className="w-full text-xs"
          onClick={() => setExpanded(!expanded)}
        >
          <Activity className="w-3.5 h-3.5 mr-1" />
          {expanded ? 'Hide' : 'Show'} Per-Pack Breakdown
          {expanded ? <ChevronUp className="w-3.5 h-3.5 ml-1" /> : <ChevronDown className="w-3.5 h-3.5 ml-1" />}
        </Button>

        {expanded && (
          <ScrollArea className="h-72">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Pack</TableHead>
                  <TableHead className="text-xs text-center">Comp</TableHead>
                  <TableHead className="text-xs text-center">Cryst</TableHead>
                  <TableHead className="text-xs text-center">Density</TableHead>
                  <TableHead className="text-xs text-center">Overlap</TableHead>
                  <TableHead className="text-xs text-center">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedPacks.map((pack: PackDensityReport) => {
                  const packIssues = issues.filter(i => i.packId === pack.packId);
                  const hasError = packIssues.some(i => i.severity === 'error');
                  const hasWarning = packIssues.some(i => i.severity === 'warning');

                  return (
                    <TableRow key={pack.packId}>
                      <TableCell className="text-xs font-medium max-w-[140px] truncate">
                        {pack.packName}
                      </TableCell>
                      <TableCell className="text-xs text-center">{pack.componentCount}</TableCell>
                      <TableCell className="text-xs text-center font-mono">{pack.crystallizedCount}</TableCell>
                      <TableCell className="text-xs text-center font-mono">
                        <span className={cn(
                          pack.densityScore > DENSITY_THRESHOLDS.maxPackDensity ? 'text-destructive' :
                          pack.densityScore > DENSITY_THRESHOLDS.maxPackDensity * 0.8 ? 'text-neon-amber' : ''
                        )}>
                          {pack.densityScore.toFixed(2)}
                        </span>
                      </TableCell>
                      <TableCell className="text-xs text-center">
                        <span className={cn(
                          pack.overlapPercent > DENSITY_THRESHOLDS.maxOverlapPercent ? 'text-neon-amber' : ''
                        )}>
                          {pack.overlapPercent}%
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        {hasError ? (
                          <XCircle className="w-3.5 h-3.5 text-destructive inline" />
                        ) : hasWarning ? (
                          <AlertTriangle className="w-3.5 h-3.5 text-neon-amber inline" />
                        ) : (
                          <CheckCircle2 className="w-3.5 h-3.5 text-neon-green inline" />
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
