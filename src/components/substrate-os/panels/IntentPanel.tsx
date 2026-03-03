/**
 * INTENT Panel — Module mesh monitoring & governance
 * Mobile-first with full message scrolling and response actions.
 */

import { useState, useMemo } from 'react';
import {
  Brain, Network, Activity, MessageSquare, Zap, Eye, Shield,
  RefreshCw, TrendingUp, BarChart3, Loader2, AlertCircle,
  ArrowRight, Clock, CheckCircle2, XCircle, Send, ThumbsUp,
  ThumbsDown, MoreHorizontal, ChevronDown, ChevronUp,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useMeshToggle } from '@/lib/substrate/intent-mesh/toggle';
import { toast } from 'sonner';

const INTENT_TYPES = [
  { type: 'query', label: 'Query', handlers: ['DECODE', 'BRAIN', 'MEMORY'], color: 'bg-cyan-500/15 text-cyan-700 dark:text-cyan-400 border-cyan-500/25' },
  { type: 'generate', label: 'Generate', handlers: ['ENCODE', 'FORGE', 'NEXUS'], color: 'bg-fuchsia-500/15 text-fuchsia-700 dark:text-fuchsia-400 border-fuchsia-500/25' },
  { type: 'analyze', label: 'Analyze', handlers: ['VISION', 'ORACLE', 'CORTEX'], color: 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/25' },
  { type: 'manage', label: 'Manage', handlers: ['GOVERNANCE', 'ATLAS'], color: 'bg-indigo-500/15 text-indigo-700 dark:text-indigo-400 border-indigo-500/25' },
  { type: 'learn', label: 'Learn', handlers: ['BRAIN', 'MEMORY', 'DREAM'], color: 'bg-purple-500/15 text-purple-700 dark:text-purple-400 border-purple-500/25' },
  { type: 'secure', label: 'Secure', handlers: ['DEFENSE', 'PHANTOM'], color: 'bg-red-500/15 text-red-700 dark:text-red-400 border-red-500/25' },
];

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

interface HubMessage {
  id: string;
  source: string;
  type: 'proposal' | 'alert' | 'request' | 'status';
  summary: string;
  detail: string;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  age: string;
  status: 'pending' | 'approved' | 'rejected' | 'acknowledged';
}

function generateHubMessages(): HubMessage[] {
  return [
    { id: 'h1', source: 'ENGINEER', type: 'proposal', summary: 'CLM detected 3 engines below performance threshold — recommend rebalancing', detail: 'Engines FORGE-2, ENCODE-7, and CORTEX-3 dropped below 72% efficiency. CLM suggests redistributing workload to healthier nodes and scheduling maintenance windows for the degraded engines. Estimated recovery: 4 hours.', urgency: 'medium', age: '2m', status: 'pending' },
    { id: 'h2', source: 'DEFENSE', type: 'alert', summary: 'Rate limiting spike on /api/nexus endpoint — 12 blocked in last 5min', detail: 'Anomalous traffic pattern detected from 3 IP ranges. PHANTOM has flagged these as potential enumeration attempts. Recommend temporary geo-blocking and escalation to AUDIT for forensic logging.', urgency: 'high', age: '30s', status: 'pending' },
    { id: 'h3', source: 'EVOLUTION', type: 'status', summary: 'Mutation pipeline completed — 4 improvements applied, 1 rolled back', detail: 'Applied mutations: DECODE latency optimization (-18ms), MEMORY cache hit ratio (+3.2%), BRAIN reasoning depth expansion, NEXUS fallback chain reorder. Rolled back: FORGE parallel compilation (caused 2% error rate increase).', urgency: 'low', age: '15m', status: 'acknowledged' },
    { id: 'h4', source: 'VISION', type: 'request', summary: 'Anomaly detected in NEXUS response times — requesting CORTEX investigation', detail: 'NEXUS P95 latency jumped from 340ms to 890ms over the last 20 minutes. Pattern does not correlate with traffic volume. VISION suspects an upstream provider degradation. Requesting CORTEX deep-analysis pipeline activation.', urgency: 'medium', age: '5m', status: 'pending' },
    { id: 'h5', source: 'BRAIN', type: 'status', summary: 'Memory consolidation cycle complete — 847 patterns archived', detail: 'Nightly consolidation processed 847 new patterns from 12,340 interaction logs. 23 patterns promoted to long-term memory. 4 contradictory patterns flagged for DREAM review. Knowledge graph expanded by 1.2%.', urgency: 'low', age: '1h', status: 'acknowledged' },
    { id: 'h6', source: 'CORTEX', type: 'proposal', summary: 'Pipeline efficiency can be improved 12% by reordering ENCODE → NEXUS flow', detail: 'Analysis of 50K recent pipeline executions shows that routing ENCODE output through NEXUS before FORGE reduces redundant token generation by 12%. Requires pipeline configuration update and 10-minute warm-up period.', urgency: 'medium', age: '8m', status: 'pending' },
    { id: 'h7', source: 'ORACLE', type: 'proposal', summary: 'Predictive model suggests MEMORY capacity will reach 85% in 48 hours', detail: 'Current growth rate of 2.3GB/day with 78% utilization. Recommend proactive archival of patterns older than 30 days with confidence < 0.6. This would free approximately 18% capacity.', urgency: 'medium', age: '12m', status: 'pending' },
    { id: 'h8', source: 'PHANTOM', type: 'alert', summary: 'Honeypot triggered — synthetic credential attempt from unknown origin', detail: 'A decoy API endpoint received 3 authentication attempts with fabricated tokens. Source IP does not match any known developer or service account. DEFENSE containment protocol initiated automatically.', urgency: 'critical', age: '1m', status: 'pending' },
    { id: 'h9', source: 'DREAM', type: 'request', summary: 'Requesting permission to run experimental mutation on DECODE context window', detail: 'DREAM has identified a potential 25% improvement to DECODE context resolution by adjusting the entity slot confidence decay curve. This is an experimental change that would affect all new sessions. Requesting governor approval for A/B test.', urgency: 'medium', age: '20m', status: 'pending' },
    { id: 'h10', source: 'ATLAS', type: 'status', summary: 'Governance audit complete — all 38 nodes reporting healthy', detail: 'Scheduled governance sweep completed. All 38 substrate nodes passed health checks. 2 nodes flagged for minor configuration drift (auto-corrected). Next audit scheduled in 6 hours.', urgency: 'low', age: '45m', status: 'acknowledged' },
  ];
}

export default function IntentPanel() {
  const meshToggle = useMeshToggle();
  const [activeTab, setActiveTab] = useState('hub');
  const [messages, setMessages] = useState<HubMessage[]>(() => generateHubMessages());
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  const pendingCount = messages.filter(m => m.status === 'pending').length;

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

  const handleAction = (id: string, action: 'approved' | 'rejected' | 'acknowledged') => {
    setMessages(prev => prev.map(m => m.id === id ? { ...m, status: action } : m));
    const labels = { approved: 'Approved', rejected: 'Rejected', acknowledged: 'Acknowledged' };
    toast.success(`${labels[action]} — response dispatched to module`);
  };

  const handleReply = (id: string) => {
    if (!replyText.trim()) return;
    toast.success(`Reply sent to ${messages.find(m => m.id === id)?.source}`);
    setReplyText('');
    setReplyingTo(null);
  };

  const statusBadge = (status: string) => {
    if (status === 'approved') return 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/25';
    if (status === 'rejected') return 'bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/25';
    if (status === 'acknowledged') return 'bg-muted/30 text-muted-foreground border-border/20';
    return 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/25';
  };

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-to-br from-amber-500/15 to-purple-500/10 border border-amber-500/25 flex items-center justify-center shrink-0">
            <Brain className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="min-w-0">
            <h2 className="text-base sm:text-lg font-bold tracking-tight">INTENT Mesh & Hub</h2>
            <p className="text-[9px] sm:text-[10px] text-muted-foreground/60 font-mono tracking-wider truncate">MODULE ORCHESTRATION · AFFINITY MATRIX</p>
          </div>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {pendingCount > 0 && (
            <Badge variant="outline" className="text-[10px] font-mono gap-1 border-amber-500/25 text-amber-600 dark:text-amber-400 bg-amber-500/5">
              {pendingCount} pending
            </Badge>
          )}
          <Badge variant="outline" className={cn(
            "text-[10px] font-mono gap-1.5 shrink-0",
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
        <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
          <TabsList className="bg-muted/15 border border-border/15 gap-0.5 w-max sm:w-auto">
            <TabsTrigger value="hub" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary text-xs gap-1 sm:gap-1.5 px-2.5 sm:px-3">
              <MessageSquare className="w-3.5 h-3.5 hidden sm:block" /> Hub
              {pendingCount > 0 && (
                <Badge variant="secondary" className="h-4 px-1 text-[9px] bg-amber-500/15 text-amber-600 dark:text-amber-400 border-none ml-0.5">{pendingCount}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="overview" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary text-xs gap-1 sm:gap-1.5 px-2.5 sm:px-3">
              <Eye className="w-3.5 h-3.5 hidden sm:block" /> Overview
            </TabsTrigger>
            <TabsTrigger value="affinity" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary text-xs gap-1 sm:gap-1.5 px-2.5 sm:px-3">
              <Network className="w-3.5 h-3.5 hidden sm:block" /> Affinity
            </TabsTrigger>
            <TabsTrigger value="classification" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary text-xs gap-1 sm:gap-1.5 px-2.5 sm:px-3">
              <BarChart3 className="w-3.5 h-3.5 hidden sm:block" /> Classify
            </TabsTrigger>
          </TabsList>
        </div>

        {/* ── Hub Messages (Primary) ── */}
        <TabsContent value="hub" className="mt-4">
          <div className="space-y-2 sm:space-y-2.5">
            {messages.map((msg, i) => {
              const MsgIcon = typeIcon(msg.type);
              const isExpanded = expandedId === msg.id;
              const isReplying = replyingTo === msg.id;
              const isPending = msg.status === 'pending';

              return (
                <motion.div
                  key={msg.id}
                  className={cn(
                    "rounded-lg sm:rounded-xl border bg-card/50 dark:bg-card/20 transition-colors",
                    isPending ? "border-border/20 dark:border-border/15" : "border-border/10 dark:border-border/5 opacity-75",
                    msg.urgency === 'critical' && isPending && "border-red-500/30 dark:border-red-500/20 bg-red-500/5",
                  )}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                >
                  {/* Message header */}
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : msg.id)}
                    className="w-full text-left p-3 sm:p-4 flex items-start gap-2.5 sm:gap-3"
                  >
                    <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0", urgencyColor(msg.urgency))}>
                      <MsgIcon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 sm:gap-2 mb-1 flex-wrap">
                        <span className="text-xs font-mono font-bold text-foreground">{msg.source}</span>
                        <Badge variant="outline" className="text-[9px] h-4">{msg.type}</Badge>
                        <Badge variant="outline" className={cn("text-[9px] h-4", urgencyColor(msg.urgency))}>{msg.urgency}</Badge>
                        <Badge variant="outline" className={cn("text-[9px] h-4", statusBadge(msg.status))}>{msg.status}</Badge>
                        <span className="text-[10px] text-muted-foreground/40 ml-auto flex items-center gap-1 shrink-0">
                          <Clock className="w-3 h-3" />{msg.age}
                        </span>
                      </div>
                      <p className="text-[12px] sm:text-sm text-muted-foreground/80 leading-relaxed">{msg.summary}</p>
                    </div>
                    <div className="shrink-0 mt-1">
                      {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground/40" /> : <ChevronDown className="w-4 h-4 text-muted-foreground/40" />}
                    </div>
                  </button>

                  {/* Expanded detail + actions */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="px-3 sm:px-4 pb-3 sm:pb-4 space-y-3">
                          {/* Detail text */}
                          <div className="ml-[42px] sm:ml-[44px] p-2.5 sm:p-3 rounded-lg bg-muted/10 dark:bg-muted/5 border border-border/10">
                            <p className="text-[11px] sm:text-xs text-muted-foreground/70 leading-relaxed">{msg.detail}</p>
                          </div>

                          {/* Action buttons */}
                          <div className="ml-[42px] sm:ml-[44px] flex flex-wrap items-center gap-2">
                            {isPending && msg.type === 'proposal' && (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-8 text-xs gap-1.5 border-emerald-500/25 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10"
                                  onClick={() => handleAction(msg.id, 'approved')}
                                >
                                  <ThumbsUp className="w-3.5 h-3.5" /> Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-8 text-xs gap-1.5 border-red-500/25 text-red-600 dark:text-red-400 hover:bg-red-500/10"
                                  onClick={() => handleAction(msg.id, 'rejected')}
                                >
                                  <ThumbsDown className="w-3.5 h-3.5" /> Reject
                                </Button>
                              </>
                            )}
                            {isPending && msg.type === 'alert' && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 text-xs gap-1.5 border-amber-500/25 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10"
                                onClick={() => handleAction(msg.id, 'acknowledged')}
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" /> Acknowledge
                              </Button>
                            )}
                            {isPending && msg.type === 'request' && (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-8 text-xs gap-1.5 border-emerald-500/25 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10"
                                  onClick={() => handleAction(msg.id, 'approved')}
                                >
                                  <ThumbsUp className="w-3.5 h-3.5" /> Grant
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-8 text-xs gap-1.5 border-red-500/25 text-red-600 dark:text-red-400 hover:bg-red-500/10"
                                  onClick={() => handleAction(msg.id, 'rejected')}
                                >
                                  <XCircle className="w-3.5 h-3.5" /> Deny
                                </Button>
                              </>
                            )}
                            {isPending && (
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 text-xs gap-1.5 text-muted-foreground/60"
                                onClick={() => setReplyingTo(isReplying ? null : msg.id)}
                              >
                                <Send className="w-3.5 h-3.5" /> Reply
                              </Button>
                            )}
                            {!isPending && (
                              <span className="text-[10px] text-muted-foreground/40 italic">
                                {msg.status === 'approved' ? '✓ Approved' : msg.status === 'rejected' ? '✗ Rejected' : '• Acknowledged'}
                              </span>
                            )}
                          </div>

                          {/* Reply input */}
                          <AnimatePresence>
                            {isReplying && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="ml-[42px] sm:ml-[44px] overflow-hidden"
                              >
                                <div className="flex gap-2 items-end">
                                  <Textarea
                                    placeholder={`Reply to ${msg.source}...`}
                                    value={replyText}
                                    onChange={(e) => setReplyText(e.target.value)}
                                    className="min-h-[60px] max-h-[120px] text-xs bg-muted/10 border-border/15 resize-none"
                                  />
                                  <Button
                                    size="sm"
                                    className="h-8 shrink-0"
                                    disabled={!replyText.trim()}
                                    onClick={() => handleReply(msg.id)}
                                  >
                                    <Send className="w-3.5 h-3.5" />
                                  </Button>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        </TabsContent>

        {/* ── Overview ── */}
        <TabsContent value="overview" className="mt-4 space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
            {[
              { label: 'Intent Types', value: '6', sub: 'Classification categories', icon: Brain, color: 'text-amber-500' },
              { label: 'Affinity Pairs', value: AFFINITY_PAIRS.length.toString(), sub: 'High co-resolution', icon: Network, color: 'text-cyan-500' },
              { label: 'Hub Messages', value: messages.length.toString(), sub: `${pendingCount} pending`, icon: MessageSquare, color: 'text-purple-500' },
              { label: 'Mesh Status', value: meshToggle.enabled ? 'Active' : 'Off', sub: 'Cross-module routing', icon: Zap, color: meshToggle.enabled ? 'text-emerald-500' : 'text-red-500' },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                className="rounded-lg sm:rounded-xl border border-border/15 dark:border-border/10 p-3 sm:p-4 bg-card/50 dark:bg-card/20"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
              >
                <stat.icon className={cn("w-4 h-4 mb-1.5 sm:mb-2", stat.color)} />
                <div className="text-lg sm:text-xl font-bold font-mono leading-tight">{stat.value}</div>
                <div className="text-[9px] sm:text-[10px] text-muted-foreground/50 mt-0.5 leading-tight">{stat.sub}</div>
                <div className="text-[8px] sm:text-[9px] text-muted-foreground/35 font-mono uppercase tracking-wider mt-1">{stat.label}</div>
              </motion.div>
            ))}
          </div>

          {/* Recent Hub Activity — show all */}
          <Card className="border-border/15 dark:border-border/10 bg-card/50 dark:bg-card/20">
            <CardHeader className="pb-2 sm:pb-3 px-4 sm:px-6">
              <CardTitle className="text-sm flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-primary shrink-0" />
                Recent Hub Activity
              </CardTitle>
              <CardDescription className="text-[11px] sm:text-xs">Latest governance messages from the INTENT Hub</CardDescription>
            </CardHeader>
            <CardContent className="px-4 sm:px-6">
              <div className="space-y-2">
                {messages.slice(0, 5).map((msg, i) => {
                  const MsgIcon = typeIcon(msg.type);
                  return (
                    <div key={i} className="flex items-start gap-2.5 sm:gap-3 p-2.5 sm:p-3 rounded-lg bg-muted/10 dark:bg-muted/5 border border-border/10 hover:bg-muted/20 transition-colors">
                      <MsgIcon className="w-4 h-4 mt-0.5 text-muted-foreground/60 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 sm:gap-2 mb-0.5 flex-wrap">
                          <span className="text-[10px] font-mono font-bold text-primary">{msg.source}</span>
                          <Badge variant="outline" className={cn("text-[8px] h-4 px-1", urgencyColor(msg.urgency))}>{msg.urgency}</Badge>
                          <Badge variant="outline" className={cn("text-[8px] h-4 px-1", statusBadge(msg.status))}>{msg.status}</Badge>
                          <span className="text-[9px] text-muted-foreground/40 ml-auto shrink-0">{msg.age}</span>
                        </div>
                        <p className="text-[11px] sm:text-xs text-muted-foreground/80 leading-relaxed">{msg.summary}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="w-full mt-2 text-xs text-muted-foreground/50"
                onClick={() => setActiveTab('hub')}
              >
                View all {messages.length} messages →
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Affinity Matrix ── */}
        <TabsContent value="affinity" className="mt-4 space-y-4">
          <p className="text-[11px] sm:text-xs text-muted-foreground/60 px-1">
            The Affinity Matrix tracks co-resolution success rates between module pairs. High-affinity pairs are pre-warmed for faster composition.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
            {AFFINITY_PAIRS.map((pair, i) => (
              <motion.div
                key={`${pair.a}-${pair.b}`}
                className="rounded-lg sm:rounded-xl border border-border/15 dark:border-border/10 p-3 sm:p-4 bg-card/50 dark:bg-card/20"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                    <span className="text-[11px] sm:text-xs font-mono font-bold text-primary">{pair.a}</span>
                    <Network className="w-3 h-3 text-muted-foreground/30 shrink-0" />
                    <span className="text-[11px] sm:text-xs font-mono font-bold text-primary">{pair.b}</span>
                  </div>
                  <span className={cn(
                    "text-sm font-bold font-mono shrink-0 ml-2",
                    pair.score >= 0.9 ? "text-emerald-600 dark:text-emerald-400" : pair.score >= 0.8 ? "text-cyan-600 dark:text-cyan-400" : "text-amber-600 dark:text-amber-400"
                  )}>
                    {Math.round(pair.score * 100)}%
                  </span>
                </div>
                <Progress value={pair.score * 100} className="h-1.5 mb-1.5 sm:mb-2" />
                <p className="text-[10px] text-muted-foreground/50">{pair.label}</p>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        {/* ── Classification ── */}
        <TabsContent value="classification" className="mt-4 space-y-4">
          <p className="text-[11px] sm:text-xs text-muted-foreground/60 px-1">
            Every user input is classified by intent type and routed to optimal module combinations.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3">
            {INTENT_TYPES.map((intent, i) => (
              <motion.div
                key={intent.type}
                className={cn("rounded-lg sm:rounded-xl border p-3 sm:p-4", intent.color)}
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
