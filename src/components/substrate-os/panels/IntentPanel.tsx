/**
 * INTENT Panel — Module mesh monitoring & governance
 * Big governance surface for monitoring module interactions, affinity, and hub messages.
 */

import { useState, useMemo, useEffect } from 'react';
import {
  Brain, Network, Activity, MessageSquare, Zap, Eye, Shield,
  RefreshCw, TrendingUp, BarChart3, Loader2, AlertCircle,
  ArrowRight, Clock, CheckCircle2, XCircle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useMeshToggle } from '@/lib/substrate/intent-mesh/toggle';

// Intent types from the mesh documentation
const INTENT_TYPES = [
  { type: 'query', label: 'Query', handlers: ['DECODE', 'BRAIN', 'MEMORY'], color: 'bg-cyan-500/15 text-cyan-700 dark:text-cyan-400 border-cyan-500/25' },
  { type: 'generate', label: 'Generate', handlers: ['ENCODE', 'FORGE', 'NEXUS'], color: 'bg-fuchsia-500/15 text-fuchsia-700 dark:text-fuchsia-400 border-fuchsia-500/25' },
  { type: 'analyze', label: 'Analyze', handlers: ['VISION', 'ORACLE', 'CORTEX'], color: 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/25' },
  { type: 'manage', label: 'Manage', handlers: ['GOVERNANCE', 'ATLAS'], color: 'bg-indigo-500/15 text-indigo-700 dark:text-indigo-400 border-indigo-500/25' },
  { type: 'learn', label: 'Learn', handlers: ['BRAIN', 'MEMORY', 'DREAM'], color: 'bg-purple-500/15 text-purple-700 dark:text-purple-400 border-purple-500/25' },
  { type: 'secure', label: 'Secure', handlers: ['DEFENSE', 'PHANTOM'], color: 'bg-red-500/15 text-red-700 dark:text-red-400 border-red-500/25' },
];

// High-affinity pairs from the substrate's intent mesh
const AFFINITY_PAIRS = [
  { a: 'BRAIN', b: 'MEMORY', score: 0.95, label: 'Cognitive recall' },
  { a: 'DECODE', b: 'NEXUS', score: 0.91, label: 'Conversational routing' },
  { a: 'VISION', b: 'CORTEX', score: 0.88, label: 'Perception pipeline' },
  { a: 'DEFENSE', b: 'AUDIT', score: 0.87, label: 'Security compliance' },
  { a: 'ENCODE', b: 'FORGE', score: 0.85, label: 'Code synthesis' },
  { a: 'DREAM', b: 'EVOLUTION', score: 0.82, label: 'Autonomous improvement' },
  { a: 'CORTEX', b: 'NEXUS', score: 0.80, label: 'Orchestrated routing' },
  { a: 'MEMORY', b: 'DREAM', score: 0.78, label: 'Consolidation' },
  { a: 'GOVERNANCE', b: 'ATLAS', score: 0.93, label: 'Policy enforcement' },
  { a: 'IDENTITY', b: 'ACCESS', score: 0.90, label: 'Auth resolution' },
];

// Simulated hub messages (from the Intent Hub documentation)
function generateHubMessages() {
  const sources = ['ENGINEER', 'EVOLUTION', 'DEFENSE', 'VISION', 'CORTEX', 'BRAIN'];
  const types: Array<'proposal' | 'alert' | 'status' | 'request'> = ['proposal', 'alert', 'status', 'request'];
  const msgs = [
    { source: 'ENGINEER', type: 'proposal' as const, summary: 'CLM detected 3 engines below performance threshold — recommend rebalancing', urgency: 'medium' as const, age: '2m' },
    { source: 'DEFENSE', type: 'alert' as const, summary: 'Rate limiting spike on /api/nexus endpoint — 12 blocked in last 5min', urgency: 'high' as const, age: '30s' },
    { source: 'EVOLUTION', type: 'status' as const, summary: 'Mutation pipeline completed — 4 improvements applied, 1 rolled back', urgency: 'low' as const, age: '15m' },
    { source: 'VISION', type: 'request' as const, summary: 'Anomaly detected in NEXUS response times — requesting CORTEX investigation', urgency: 'medium' as const, age: '5m' },
    { source: 'BRAIN', type: 'status' as const, summary: 'Memory consolidation cycle complete — 847 patterns archived', urgency: 'low' as const, age: '1h' },
    { source: 'CORTEX', type: 'proposal' as const, summary: 'Pipeline efficiency can be improved 12% by reordering ENCODE → NEXUS flow', urgency: 'medium' as const, age: '8m' },
  ];
  return msgs;
}

export default function IntentPanel() {
  const meshToggle = useMeshToggle();
  const [activeTab, setActiveTab] = useState('overview');
  const hubMessages = useMemo(() => generateHubMessages(), []);

  const urgencyColor = (u: string) => {
    if (u === 'critical') return 'bg-red-500/15 text-red-700 dark:text-red-400 border-red-500/25';
    if (u === 'high') return 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/25';
    if (u === 'medium') return 'bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/25';
    return 'bg-muted/30 text-muted-foreground border-border/20';
  };

  const typeIcon = (t: string) => {
    if (t === 'alert') return AlertCircle;
    if (t === 'proposal') return Zap;
    if (t === 'request') return ArrowRight;
    return CheckCircle2;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/15 to-purple-500/10 border border-amber-500/25 flex items-center justify-center">
            <Brain className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold tracking-tight">INTENT Mesh & Hub</h2>
            <p className="text-[10px] text-muted-foreground/60 font-mono tracking-wider">MODULE ORCHESTRATION · AFFINITY MATRIX · GOVERNANCE BUS</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className={cn(
            "text-[10px] font-mono gap-1.5",
            meshToggle.enabled
              ? "border-emerald-500/25 text-emerald-600 dark:text-emerald-400 bg-emerald-500/5"
              : "border-red-500/25 text-red-600 dark:text-red-400 bg-red-500/5"
          )}>
            <span className={cn("w-1.5 h-1.5 rounded-full", meshToggle.enabled ? "bg-emerald-500" : "bg-red-500")} />
            {meshToggle.enabled ? 'MESH ACTIVE' : 'MESH DISABLED'}
          </Badge>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-muted/15 border border-border/15 gap-0.5">
          <TabsTrigger value="overview" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary text-xs gap-1.5">
            <Eye className="w-3.5 h-3.5" /> Overview
          </TabsTrigger>
          <TabsTrigger value="hub" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary text-xs gap-1.5">
            <MessageSquare className="w-3.5 h-3.5" /> Hub
            <Badge variant="secondary" className="h-4 px-1 text-[9px] bg-amber-500/15 text-amber-600 dark:text-amber-400 border-none ml-1">{hubMessages.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="affinity" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary text-xs gap-1.5">
            <Network className="w-3.5 h-3.5" /> Affinity Matrix
          </TabsTrigger>
          <TabsTrigger value="classification" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary text-xs gap-1.5">
            <BarChart3 className="w-3.5 h-3.5" /> Classification
          </TabsTrigger>
        </TabsList>

        {/* ── Overview ── */}
        <TabsContent value="overview" className="mt-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { label: 'Intent Types', value: '6', sub: 'Classification categories', icon: Brain, color: 'text-amber-500' },
              { label: 'Affinity Pairs', value: AFFINITY_PAIRS.length.toString(), sub: 'High co-resolution pairs', icon: Network, color: 'text-cyan-500' },
              { label: 'Hub Messages', value: hubMessages.length.toString(), sub: `${hubMessages.filter(m => m.urgency === 'high').length} high urgency`, icon: MessageSquare, color: 'text-purple-500' },
              { label: 'Mesh Status', value: meshToggle.enabled ? 'Active' : 'Off', sub: 'Cross-module routing', icon: Zap, color: meshToggle.enabled ? 'text-emerald-500' : 'text-red-500' },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                className="rounded-xl border border-border/15 dark:border-border/10 p-4 bg-card/50 dark:bg-card/20"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
              >
                <stat.icon className={cn("w-4 h-4 mb-2", stat.color)} />
                <div className="text-xl font-bold font-mono">{stat.value}</div>
                <div className="text-[10px] text-muted-foreground/50 mt-0.5">{stat.sub}</div>
                <div className="text-[9px] text-muted-foreground/35 font-mono uppercase tracking-wider mt-1">{stat.label}</div>
              </motion.div>
            ))}
          </div>

          {/* Recent Hub Activity */}
          <Card className="border-border/15 dark:border-border/10 bg-card/50 dark:bg-card/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-primary" />
                Recent Hub Activity
              </CardTitle>
              <CardDescription className="text-xs">Latest governance messages from the INTENT Hub</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {hubMessages.slice(0, 4).map((msg, i) => {
                  const MsgIcon = typeIcon(msg.type);
                  return (
                    <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-muted/10 dark:bg-muted/5 border border-border/10 hover:bg-muted/20 transition-colors">
                      <MsgIcon className="w-4 h-4 mt-0.5 text-muted-foreground/60 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-[10px] font-mono font-bold text-primary">{msg.source}</span>
                          <Badge variant="outline" className={cn("text-[8px] h-4 px-1", urgencyColor(msg.urgency))}>{msg.urgency}</Badge>
                          <span className="text-[9px] text-muted-foreground/40 ml-auto">{msg.age}</span>
                        </div>
                        <p className="text-xs text-muted-foreground/80 leading-relaxed">{msg.summary}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Hub Messages ── */}
        <TabsContent value="hub" className="mt-4 space-y-4">
          <div className="space-y-2">
            {hubMessages.map((msg, i) => {
              const MsgIcon = typeIcon(msg.type);
              return (
                <motion.div
                  key={i}
                  className="flex items-start gap-3 p-4 rounded-xl border border-border/15 dark:border-border/10 bg-card/50 dark:bg-card/20 hover:bg-card/80 transition-colors"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0", urgencyColor(msg.urgency))}>
                    <MsgIcon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono font-bold text-foreground">{msg.source}</span>
                      <Badge variant="outline" className="text-[9px] h-4">{msg.type}</Badge>
                      <Badge variant="outline" className={cn("text-[9px] h-4", urgencyColor(msg.urgency))}>{msg.urgency}</Badge>
                      <span className="text-[10px] text-muted-foreground/40 ml-auto flex items-center gap-1"><Clock className="w-3 h-3" />{msg.age}</span>
                    </div>
                    <p className="text-sm text-muted-foreground/80 leading-relaxed">{msg.summary}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </TabsContent>

        {/* ── Affinity Matrix ── */}
        <TabsContent value="affinity" className="mt-4 space-y-4">
          <p className="text-xs text-muted-foreground/60 px-1">
            The Affinity Matrix tracks co-resolution success rates between module pairs. High-affinity pairs are pre-warmed for faster composition.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {AFFINITY_PAIRS.map((pair, i) => (
              <motion.div
                key={`${pair.a}-${pair.b}`}
                className="rounded-xl border border-border/15 dark:border-border/10 p-4 bg-card/50 dark:bg-card/20"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-primary">{pair.a}</span>
                    <Network className="w-3 h-3 text-muted-foreground/30" />
                    <span className="text-xs font-mono font-bold text-primary">{pair.b}</span>
                  </div>
                  <span className={cn(
                    "text-sm font-bold font-mono",
                    pair.score >= 0.9 ? "text-emerald-600 dark:text-emerald-400" : pair.score >= 0.8 ? "text-cyan-600 dark:text-cyan-400" : "text-amber-600 dark:text-amber-400"
                  )}>
                    {Math.round(pair.score * 100)}%
                  </span>
                </div>
                <Progress value={pair.score * 100} className="h-1.5 mb-2" />
                <p className="text-[10px] text-muted-foreground/50">{pair.label}</p>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        {/* ── Classification ── */}
        <TabsContent value="classification" className="mt-4 space-y-4">
          <p className="text-xs text-muted-foreground/60 px-1">
            Every user input is classified by intent type and routed to optimal module combinations.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {INTENT_TYPES.map((intent, i) => (
              <motion.div
                key={intent.type}
                className={cn("rounded-xl border p-4", intent.color)}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.06 }}
              >
                <div className="text-sm font-bold mb-2">{intent.label}</div>
                <div className="flex flex-wrap gap-1.5">
                  {intent.handlers.map(h => (
                    <Badge key={h} variant="outline" className="text-[9px] font-mono border-current/20 bg-background/50">
                      {h}
                    </Badge>
                  ))}
                </div>
                <p className="text-[10px] mt-2 opacity-60">Primary handler: {intent.handlers[0]}</p>
              </motion.div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
