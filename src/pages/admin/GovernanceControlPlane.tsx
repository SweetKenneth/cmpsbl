/**
 * Clockless Governance Control Plane — Admin Only
 * Internal route for governance mode switching with audit trail.
 */

import { useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Shield,
  Eye,
  Lock,
  Zap,
  AlertTriangle,
  RotateCcw,
  Clock,
  Activity,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { useGovernanceMode } from '@/hooks/admin/useGovernanceMode';
import {
  GovernanceMode,
  GOVERNANCE_MODE_META,
  getSubsystemState,
} from '@/lib/system/governance';
import { formatDistanceToNow } from 'date-fns';

const MODE_ICONS: Record<GovernanceMode, typeof Shield> = {
  ACTIVE: Activity,
  OBSERVE: Eye,
  LOCKDOWN: Lock,
  EVOLVE: Zap,
};

export default function GovernanceControlPlane() {
  const { currentMode, isLoading, auditLog, switchMode, panicRevert } = useGovernanceMode();
  const [selectedMode, setSelectedMode] = useState<GovernanceMode | null>(null);
  const [reason, setReason] = useState('');
  const [useTTL, setUseTTL] = useState(false);
  const [ttlMinutes, setTtlMinutes] = useState(60);

  const activeMode = (currentMode?.mode ?? 'ACTIVE') as GovernanceMode;
  const meta = GOVERNANCE_MODE_META[activeMode];
  const subsystems = getSubsystemState(activeMode);
  const isNotActive = activeMode !== 'ACTIVE';

  const handleSwitch = () => {
    if (!selectedMode || !reason.trim()) return;
    switchMode.mutate(
      { newMode: selectedMode, reason: reason.trim(), ttlMinutes: useTTL ? ttlMinutes : undefined },
      { onSuccess: () => { setSelectedMode(null); setReason(''); setUseTTL(false); } }
    );
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-20">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Current Mode Banner */}
        <Card className="border-2" style={{ borderColor: activeMode === 'LOCKDOWN' ? 'hsl(var(--destructive))' : activeMode === 'OBSERVE' ? 'hsl(var(--warning, 45 93% 47%))' : 'hsl(var(--primary))' }}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{meta.icon}</span>
                <div>
                  <CardTitle className="text-xl">Current Mode: {meta.label}</CardTitle>
                  <CardDescription>{meta.description}</CardDescription>
                </div>
              </div>
              {isNotActive && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm" className="gap-2">
                      <AlertTriangle className="w-4 h-4" />
                      PANIC REVERT
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Emergency Revert to ACTIVE?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will immediately restore all subsystems to their default ACTIVE state.
                        CLM, Dream, and Evolution will resume normal operation.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => panicRevert.mutate()}>
                        Confirm Revert
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {currentMode?.changed_at && (
                <div className="text-sm">
                  <span className="text-muted-foreground">Changed:</span>{' '}
                  {formatDistanceToNow(new Date(currentMode.changed_at), { addSuffix: true })}
                </div>
              )}
              {currentMode?.reason && (
                <div className="text-sm col-span-2">
                  <span className="text-muted-foreground">Reason:</span> {currentMode.reason}
                </div>
              )}
              {currentMode?.expires_at && (
                <div className="text-sm">
                  <span className="text-muted-foreground">Expires:</span>{' '}
                  {formatDistanceToNow(new Date(currentMode.expires_at), { addSuffix: true })}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Subsystem Status */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Subsystem Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'CLM', active: subsystems.clm },
                { label: 'Dream', active: subsystems.dream },
                { label: 'Evolution', active: subsystems.evolution },
                { label: 'Schedulers', active: subsystems.schedulers },
                { label: 'Mutations', active: subsystems.mutations },
                { label: 'Aggressive Rate Limit', active: subsystems.rateLimitingAggressive },
                { label: 'Canary Required', active: subsystems.canaryRequired },
                { label: 'Auto-Rollback', active: subsystems.autoRollback },
              ].map(({ label, active }) => (
                <div key={label} className="flex items-center gap-2 text-sm p-2 rounded-lg border border-transparent hover:border-border/50 transition-all duration-200">
                  {active ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <XCircle className="w-4 h-4 text-muted-foreground/50" />
                  )}
                  <span className={active ? 'text-foreground' : 'text-muted-foreground/60'}>{label}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Mode Selector */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Switch Governance Mode</CardTitle>
            <CardDescription>Select a mode, provide a reason, and optionally set a TTL for auto-revert.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {(Object.keys(GOVERNANCE_MODE_META) as GovernanceMode[]).map((mode) => {
                const m = GOVERNANCE_MODE_META[mode];
                const Icon = MODE_ICONS[mode];
                const isActive = activeMode === mode;
                const isSelected = selectedMode === mode;
                return (
                  <button
                    key={mode}
                    onClick={() => !isActive && setSelectedMode(mode)}
                    disabled={isActive}
                    className={`p-3 rounded-lg border-2 text-left transition-all duration-300 ${
                      isActive
                        ? 'border-primary/50 bg-primary/10 opacity-60 cursor-not-allowed'
                        : isSelected
                        ? 'border-primary bg-primary/5 ring-2 ring-primary/30 -translate-y-0.5 shadow-sm'
                        : 'border-border hover:border-primary/30 hover:-translate-y-0.5 hover:shadow-sm cursor-pointer'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Icon className="w-4 h-4" />
                      <span className="font-medium text-sm">{m.label}</span>
                      {isActive && <Badge variant="outline" className="text-[10px] px-1">Current</Badge>}
                    </div>
                    <p className="text-xs text-muted-foreground leading-snug">{m.description}</p>
                  </button>
                );
              })}
            </div>

            {selectedMode && (
              <>
                <Separator />
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="reason">Reason (required)</Label>
                    <Textarea
                      id="reason"
                      placeholder="Why are you changing the governance mode?"
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <Switch checked={useTTL} onCheckedChange={setUseTTL} id="ttl-toggle" />
                    <Label htmlFor="ttl-toggle" className="text-sm">Auto-revert to ACTIVE after TTL</Label>
                  </div>
                  {useTTL && (
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <Input
                        type="number"
                        min={5}
                        max={1440}
                        value={ttlMinutes}
                        onChange={(e) => setTtlMinutes(Number(e.target.value))}
                        className="w-24"
                      />
                      <span className="text-sm text-muted-foreground">minutes</span>
                    </div>
                  )}

                  {selectedMode === 'LOCKDOWN' ? (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="destructive"
                          disabled={!reason.trim() || switchMode.isPending}
                          className="gap-2"
                        >
                          <Lock className="w-4 h-4" />
                          Engage LOCKDOWN
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>⚠️ Confirm LOCKDOWN Mode</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will disable CLM, Dream, Evolution, all schedulers, and enable aggressive rate limiting.
                            Only auth, continuity, core API, and audit logging will remain active.
                            {useTTL && ` Auto-reverts after ${ttlMinutes} minutes.`}
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={handleSwitch}>Confirm LOCKDOWN</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  ) : (
                    <Button
                      onClick={handleSwitch}
                      disabled={!reason.trim() || switchMode.isPending}
                      className="gap-2"
                    >
                      <RotateCcw className="w-4 h-4" />
                      Switch to {GOVERNANCE_MODE_META[selectedMode].label}
                    </Button>
                  )}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Audit Log */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Governance Audit Log</CardTitle>
            <CardDescription>Last 50 mode transitions</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px]">
              {auditLog.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">No mode changes recorded yet.</p>
              ) : (
                <div className="space-y-3">
                  {auditLog.map((entry) => (
                    <div key={entry.id} className="flex items-start gap-3 text-sm border-b border-border/50 pb-3">
                      <div className="flex-shrink-0 mt-0.5">
                        {entry.auto_reverted ? (
                          <Badge variant="outline" className="text-[10px]">AUTO</Badge>
                        ) : (
                          <Badge variant="secondary" className="text-[10px]">MANUAL</Badge>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-xs">{entry.previous_mode}</span>
                          <span className="text-muted-foreground">→</span>
                          <span className="font-mono text-xs font-bold">{entry.new_mode}</span>
                          {entry.ttl_minutes && (
                            <span className="text-xs text-muted-foreground">(TTL: {entry.ttl_minutes}m)</span>
                          )}
                        </div>
                        <p className="text-muted-foreground text-xs mt-0.5 truncate">{entry.reason}</p>
                        <div className="flex gap-1 mt-1 flex-wrap">
                          {(entry.affected_subsystems as string[]).map((s) => (
                            <Badge key={s} variant="outline" className="text-[9px] px-1">{s}</Badge>
                          ))}
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground flex-shrink-0">
                        {formatDistanceToNow(new Date(entry.created_at), { addSuffix: true })}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
