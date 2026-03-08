/**
 * Architecture Panel — Right side of ENCODE console
 * Displays architecture snapshot, node topology, health, and task queue.
 */

import { useMemo } from 'react';
import {
  Activity, Cpu, GitBranch, Shield, Layers, Lock, Unlock,
  CheckCircle2, XCircle, AlertTriangle, Clock, Zap
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import type { ArchitectureSnapshot } from '@/lib/substrate/encode-module/orchestration';
import type { UseEncodeOrchestrationReturn } from '@/hooks/substrate/useEncodeOrchestration';

interface ArchitecturePanelProps {
  orchestration: UseEncodeOrchestrationReturn;
  encodeHealth: number;
  taskQueue: Array<{ id: string; intent: string; status: string }>;
}

export function ArchitecturePanel({ orchestration, encodeHealth, taskQueue }: ArchitecturePanelProps) {
  const { snapshot, mode, isLocked, lockReason, conversation, patches } = orchestration;

  const healthColor = encodeHealth >= 80 ? 'text-green-500' : encodeHealth >= 50 ? 'text-yellow-500' : 'text-destructive';

  return (
    <ScrollArea className="h-full">
      <div className="space-y-3 p-4">
        {/* Status Row */}
        <div className="grid grid-cols-2 gap-2">
          <StatusCard
            label="ENCODE Health"
            value={`${encodeHealth}%`}
            icon={Activity}
            color={healthColor}
          />
          <StatusCard
            label="Mode"
            value={mode.toUpperCase()}
            icon={Cpu}
            color="text-primary"
          />
          <StatusCard
            label="Execution"
            value={isLocked ? 'LOCKED' : 'UNLOCKED'}
            icon={isLocked ? Lock : Unlock}
            color={isLocked ? 'text-destructive' : 'text-green-500'}
          />
          <StatusCard
            label="Messages"
            value={`${conversation.messages.length}`}
            icon={Layers}
            color="text-muted-foreground"
          />
        </div>

        {/* Lock Reason */}
        {isLocked && lockReason && (
          <Card className="border-destructive/20 bg-destructive/5">
            <CardContent className="p-3">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-3.5 h-3.5 text-destructive mt-0.5 shrink-0" />
                <p className="text-[11px] text-destructive/80 font-mono">{lockReason}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Architecture Snapshot */}
        <Card className="border-border/20">
          <CardHeader className="py-2.5 px-3">
            <CardTitle className="text-xs font-semibold flex items-center gap-1.5">
              <GitBranch className="w-3.5 h-3.5 text-primary" />
              Architecture Snapshot
            </CardTitle>
          </CardHeader>
          <CardContent className="px-3 pb-3">
            {snapshot ? (
              <div className="space-y-2">
                <InfoRow label="Modules" value={`${snapshot.module_registry.length}`} />
                <InfoRow label="Dependencies" value={`${snapshot.dependency_graph.length} edges`} />
                <InfoRow label="Utilities" value={`${snapshot.shared_utilities_index.length}`} />
                <InfoRow label="Timestamp" value={new Date(snapshot.created_at).toLocaleTimeString()} />
              </div>
            ) : (
              <p className="text-[11px] text-muted-foreground/50 font-mono">
                No snapshot. Run /audit to capture.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Task Queue */}
        <Card className="border-border/20">
          <CardHeader className="py-2.5 px-3">
            <CardTitle className="text-xs font-semibold flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-primary" />
              Task Queue ({taskQueue.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="px-3 pb-3">
            {taskQueue.length > 0 ? (
              <div className="space-y-1.5">
                {taskQueue.slice(0, 8).map(t => (
                  <div key={t.id} className="flex items-center gap-2 text-[11px]">
                    <Badge variant="outline" className="text-[9px] font-mono shrink-0">
                      {t.status}
                    </Badge>
                    <span className="text-muted-foreground truncate">{t.intent}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[11px] text-muted-foreground/50 font-mono">Queue empty</p>
            )}
          </CardContent>
        </Card>

        {/* Surgical Patches */}
        <Card className="border-border/20">
          <CardHeader className="py-2.5 px-3">
            <CardTitle className="text-xs font-semibold flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-primary" />
              Patches ({patches.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="px-3 pb-3">
            {patches.length > 0 ? (
              <div className="space-y-1.5">
                {patches.slice(-5).map(p => (
                  <div key={p.id} className="flex items-center gap-2 text-[11px]">
                    <span className={cn(
                      "w-1.5 h-1.5 rounded-full shrink-0",
                      p.applied ? 'bg-green-500' : 'bg-muted-foreground'
                    )} />
                    <span className="text-muted-foreground truncate font-mono">{p.rationale}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[11px] text-muted-foreground/50 font-mono">No patches</p>
            )}
          </CardContent>
        </Card>

        {/* Execution Pipeline */}
        <Card className="border-border/20">
          <CardHeader className="py-2.5 px-3">
            <CardTitle className="text-xs font-semibold flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-primary" />
              Execution Pipeline
            </CardTitle>
          </CardHeader>
          <CardContent className="px-3 pb-3">
            <div className="space-y-1">
              {PIPELINE_STAGES.map((stage, i) => (
                <div key={stage} className="flex items-center gap-2 text-[10px] font-mono">
                  <span className="text-muted-foreground/40 w-3">{i + 1}</span>
                  <span className="w-1 h-1 rounded-full bg-primary/30" />
                  <span className="text-muted-foreground">{stage}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </ScrollArea>
  );
}

// ── Helpers ──

function StatusCard({ label, value, icon: Icon, color }: { label: string; value: string; icon: React.ElementType; color: string }) {
  return (
    <div className="bg-card border border-border/20 rounded-lg p-2.5">
      <div className="flex items-center gap-1.5 mb-1">
        <Icon className={cn("w-3 h-3", color)} />
        <span className="text-[9px] text-muted-foreground/60 uppercase tracking-wider">{label}</span>
      </div>
      <span className={cn("text-sm font-bold font-mono", color)}>{value}</span>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-[11px]">
      <span className="text-muted-foreground/60">{label}</span>
      <span className="font-mono text-foreground">{value}</span>
    </div>
  );
}

const PIPELINE_STAGES = [
  'PLAN APPROVED',
  'Architecture Recall',
  'Pattern Selection',
  'Code Generation',
  'Guard Validation',
  'Artifact Sealing',
  'Brain Writeback',
];
