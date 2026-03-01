/**
 * Atlas Control Plane Tab
 * Single-source-of-truth substrate interface with CLM + SEBA integration
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Compass, Play, Pause, RefreshCw, CheckCircle2, XCircle, 
  AlertTriangle, Zap, FileText, ToggleLeft, ToggleRight,
  Clock, Activity, Brain, TestTube, BookOpen, Radio, Inbox, Shield
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { 
  executeAtlasRequest, 
  listCapabilities, 
  setCapability,
  getSEBAStatus,
  getAutoblogStatusSummary,
  type AtlasCapability,
  type AtlasAuditEntry,
  type IntelSummary,
} from '@/lib/os/atlas';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';
import { AtlasAutonomyPanel } from './atlas/AtlasAutonomyPanel';
import { AtlasChatInterface } from './atlas/AtlasChatInterface';
import { NodeInboxView } from './atlas/NodeInboxView';
import { GovernanceModePanel } from './atlas/GovernanceModePanel';

export function AtlasTab() {
  const { user } = useAuth();
  const { role, isOperator } = useUserRole();
  const [capabilities, setCapabilities] = useState<AtlasCapability[]>([]);
  const [auditLog, setAuditLog] = useState<AtlasAuditEntry[]>([]);
  const [intel, setIntel] = useState<IntelSummary[]>([]);
  const [sebaStatus, setSebaStatus] = useState<{ enabled: boolean; mode: string; phase: string } | null>(null);
  const [autoblogStatus, setAutoblogStatus] = useState<{ enabled: boolean; mode: string; queue_length: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [executing, setExecuting] = useState(false);
  const [activeTab, setActiveTab] = useState('command');

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [caps, seba, autoblog, intelResult, auditResult] = await Promise.all([
        listCapabilities(),
        getSEBAStatus(),
        getAutoblogStatusSummary(),
        executeAtlasRequest({ op: 'intel' }, user?.id, role),
        executeAtlasRequest({ op: 'audit', payload: { limit: 20 } }, user?.id, role),
      ]);
      
      setCapabilities(caps);
      setSebaStatus(seba);
      setAutoblogStatus(autoblog);
      if (intelResult.ok && intelResult.output) {
        setIntel((intelResult.output as { summaries: IntelSummary[] }).summaries || []);
      }
      if (auditResult.ok && auditResult.output) {
        setAuditLog((auditResult.output as { entries: AtlasAuditEntry[] }).entries || []);
      }
    } catch (err) {
      console.error('Atlas load error:', err);
    } finally {
      setLoading(false);
    }
  }

  async function toggleCapability(key: string, enabled: boolean) {
    const success = await setCapability(key, enabled, user?.id);
    if (success) {
      setCapabilities(caps => caps.map(c => c.key === key ? { ...c, enabled } : c));
      toast.success(`${key} ${enabled ? 'enabled' : 'disabled'}`);
    } else {
      toast.error('Failed to update capability');
    }
  }

  async function runSEBAAction(cmd: string) {
    setExecuting(true);
    try {
      const result = await executeAtlasRequest({ op: 'seba', payload: { cmd } }, user?.id, role);
      if (result.ok) {
        toast.success(`SEBA ${cmd} completed`);
        loadData();
      } else {
        toast.error(result.error || 'Failed');
      }
    } finally {
      setExecuting(false);
    }
  }

  async function runTests(cmd: 'smoke' | 'full') {
    setExecuting(true);
    try {
      const result = await executeAtlasRequest({ op: 'tests', payload: { cmd } }, user?.id, role);
      if (result.ok) {
        const testResult = result.output as { passed: number; failed: number; summary: string };
        toast.success(`Tests: ${testResult?.summary || 'Complete'}`);
      } else {
        toast.error(result.error || 'Tests failed');
      }
    } finally {
      setExecuting(false);
    }
  }

  const statusColor = (status: string) => {
    switch (status) {
      case 'success': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40';
      case 'fail': return 'bg-red-500/20 text-red-400 border-red-500/40';
      case 'blocked': return 'bg-amber-500/20 text-amber-400 border-amber-500/40';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-cyan-500/40 flex items-center justify-center">
            <Compass className="w-5 h-5 text-cyan-400" />
            {sebaStatus?.mode !== 'off' && (
              <motion.div
                className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-400"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            )}
          </div>
          <div>
            <h2 className="text-lg font-bold flex items-center gap-2">
              Atlas Control Plane
              {sebaStatus?.mode !== 'off' && (
                <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/40 text-[10px]">
                  <Radio className="w-2.5 h-2.5 mr-1" />
                  LIVE
                </Badge>
              )}
            </h2>
            <p className="text-xs text-muted-foreground font-mono">SPARTA • autonomous operation control</p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={loadData} disabled={loading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="command" className="flex items-center gap-2">
            <Compass className="w-3 h-3" />
            <span className="hidden sm:inline">Command</span>
          </TabsTrigger>
          <TabsTrigger value="inbox" className="flex items-center gap-2">
            <Inbox className="w-3 h-3" />
            <span className="hidden sm:inline">Inbox</span>
          </TabsTrigger>
          <TabsTrigger value="governance" className="flex items-center gap-2">
            <Shield className="w-3 h-3" />
            <span className="hidden sm:inline">Govern</span>
          </TabsTrigger>
          <TabsTrigger value="autonomy" className="flex items-center gap-2">
            <Radio className="w-3 h-3" />
            <span className="hidden sm:inline">Autonomy</span>
          </TabsTrigger>
          <TabsTrigger value="capabilities" className="flex items-center gap-2">
            <ToggleRight className="w-3 h-3" />
            <span className="hidden sm:inline">Caps</span>
          </TabsTrigger>
          <TabsTrigger value="intel" className="flex items-center gap-2">
            <Brain className="w-3 h-3" />
            <span className="hidden sm:inline">Intel</span>
          </TabsTrigger>
          <TabsTrigger value="audit" className="flex items-center gap-2">
            <FileText className="w-3 h-3" />
            <span className="hidden sm:inline">Audit</span>
          </TabsTrigger>
        </TabsList>

        {/* Command Tab - Conversational Control */}
        <TabsContent value="command" className="mt-6">
          <AtlasChatInterface />
        </TabsContent>

        {/* Node Inbox Tab */}
        <TabsContent value="inbox" className="mt-6">
          <Card className="border-cyan-500/20 bg-muted/5 overflow-hidden">
            <NodeInboxView className="h-[600px]" />
          </Card>
        </TabsContent>

        {/* Governance Mode Tab */}
        <TabsContent value="governance" className="mt-6">
          <GovernanceModePanel />
        </TabsContent>

        {/* Autonomy Tab - CLM + SEBA */}
        <TabsContent value="autonomy" className="mt-6">
          <AtlasAutonomyPanel />
        </TabsContent>

        {/* Capabilities Tab */}
        <TabsContent value="capabilities" className="mt-6">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card className="border-cyan-500/20 bg-muted/5">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <ToggleRight className="w-4 h-4 text-cyan-400" />
                  System Capabilities
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  <div className="space-y-3">
                    {capabilities.map(cap => (
                      <div key={cap.key} className="flex items-center justify-between p-3 rounded-lg bg-background/50 border border-border/30">
                        <div>
                          <span className="text-xs font-mono font-medium">{cap.key}</span>
                          {cap.notes && (
                            <p className="text-[10px] text-muted-foreground mt-0.5">{cap.notes}</p>
                          )}
                        </div>
                        <Switch
                          checked={cap.enabled}
                          onCheckedChange={(v) => toggleCapability(cap.key, v)}
                          disabled={!isOperator}
                        />
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            <Card className="border-purple-500/20 bg-muted/5">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Zap className="w-4 h-4 text-purple-400" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg bg-background/50">
                  <div>
                    <p className="text-sm font-medium">SEBA Agent</p>
                    <p className="text-xs text-muted-foreground">{sebaStatus?.mode || 'off'} • {sebaStatus?.phase || 'idle'}</p>
                  </div>
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost" onClick={() => runSEBAAction('status')} disabled={executing} aria-label="SEBA status">
                      <Activity className="w-3 h-3" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => runSEBAAction('cycle')} disabled={executing} aria-label="SEBA cycle">
                      <Play className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-background/50">
                  <div>
                    <p className="text-sm font-medium">Autoblog</p>
                    <p className="text-xs text-muted-foreground">{autoblogStatus?.mode || 'off'} • {autoblogStatus?.queue_length || 0} queued</p>
                  </div>
                  <Badge variant="outline" className="text-[10px]">{autoblogStatus?.enabled ? 'ON' : 'OFF'}</Badge>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="flex-1" onClick={() => runTests('smoke')} disabled={executing}>
                    <TestTube className="w-3 h-3 mr-1" /> Smoke
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1" onClick={() => runTests('full')} disabled={executing}>
                    <TestTube className="w-3 h-3 mr-1" /> Full
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Intel Tab */}
        <TabsContent value="intel" className="mt-6">
          <Card className="border-emerald-500/20 bg-muted/5">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Brain className="w-4 h-4 text-emerald-400" />
                Intelligence Feed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <div className="space-y-3">
                  {intel.length === 0 ? (
                    <p className="text-xs text-muted-foreground text-center py-8">No intelligence yet</p>
                  ) : intel.map((item, i) => (
                    <motion.div 
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="p-4 rounded-lg border border-border/50 bg-background/50"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <Badge variant="outline" className="text-[10px]">{item.module}</Badge>
                        <span className="text-[10px] text-muted-foreground">{Math.round(item.confidence * 100)}%</span>
                      </div>
                      <p className="text-sm font-medium">{item.title}</p>
                      <p className="text-xs text-muted-foreground mt-1">{item.summary}</p>
                    </motion.div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Audit Tab */}
        <TabsContent value="audit" className="mt-6">
          <Card className="border-amber-500/20 bg-muted/5">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <FileText className="w-4 h-4 text-amber-400" />
                Audit Log
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <div className="space-y-2">
                  {auditLog.length === 0 ? (
                    <p className="text-xs text-muted-foreground text-center py-8">No audit entries</p>
                  ) : auditLog.map(entry => (
                    <div key={entry.id} className="p-3 rounded border border-border/30 bg-background/30">
                      <div className="flex items-center justify-between mb-1">
                        <Badge className={`text-[10px] ${statusColor(entry.status)}`}>{entry.status}</Badge>
                        <span className="text-[10px] text-muted-foreground font-mono">{entry.execution_ms}ms</span>
                      </div>
                      <p className="text-xs font-medium">{entry.op}{entry.target ? ` → ${entry.target}` : ''}</p>
                      <p className="text-[10px] text-muted-foreground truncate">{entry.result_summary || entry.trace_id}</p>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
