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
  const base: HubMessage[] = [
    { id: 'h1', source: 'ENGINEER', type: 'proposal', summary: 'CLM detected 3 engines below performance threshold — recommend rebalancing', detail: 'Engines FORGE-2, ENCODE-7, and CORTEX-3 dropped below 72% efficiency. CLM suggests redistributing workload to healthier nodes and scheduling maintenance windows for the degraded engines. Estimated recovery: 4 hours.', urgency: 'medium', age: '2m', status: 'pending' },
    { id: 'h2', source: 'DEFENSE', type: 'alert', summary: 'Rate limiting spike on /api/nexus endpoint — 12 blocked in last 5min', detail: 'Anomalous traffic pattern detected from 3 IP ranges. PHANTOM has flagged these as potential enumeration attempts. Recommend temporary geo-blocking and escalation to AUDIT for forensic logging.', urgency: 'high', age: '30s', status: 'pending' },
    { id: 'h3', source: 'EVOLUTION', type: 'status', summary: 'Mutation pipeline completed — 4 improvements applied, 1 rolled back', detail: 'Applied mutations: DECODE latency optimization (-18ms), MEMORY cache hit ratio (+3.2%), BRAIN reasoning depth expansion, NEXUS fallback chain reorder. Rolled back: FORGE parallel compilation (caused 2% error rate increase).', urgency: 'low', age: '15m', status: 'acknowledged' },
    { id: 'h4', source: 'VISION', type: 'request', summary: 'Anomaly detected in NEXUS response times — requesting CORTEX investigation', detail: 'NEXUS P95 latency jumped from 340ms to 890ms over the last 20 minutes. Pattern does not correlate with traffic volume. VISION suspects an upstream provider degradation. Requesting CORTEX deep-analysis pipeline activation.', urgency: 'medium', age: '5m', status: 'pending' },
    { id: 'h5', source: 'BRAIN', type: 'status', summary: 'Memory consolidation cycle complete — 847 patterns archived', detail: 'Nightly consolidation processed 847 new patterns from 12,340 interaction logs. 23 patterns promoted to long-term memory. 4 contradictory patterns flagged for DREAM review. Knowledge graph expanded by 1.2%.', urgency: 'low', age: '1h', status: 'acknowledged' },
    { id: 'h6', source: 'CORTEX', type: 'proposal', summary: 'Pipeline efficiency can be improved 12% by reordering ENCODE → NEXUS flow', detail: 'Analysis of 50K recent pipeline executions shows that routing ENCODE output through NEXUS before FORGE reduces redundant token generation by 12%. Requires pipeline configuration update and 10-minute warm-up period.', urgency: 'medium', age: '8m', status: 'pending' },
    { id: 'h7', source: 'ORACLE', type: 'proposal', summary: 'Predictive model suggests MEMORY capacity will reach 85% in 48 hours', detail: 'Current growth rate of 2.3GB/day with 78% utilization. Recommend proactive archival of patterns older than 30 days with confidence < 0.6. This would free approximately 18% capacity.', urgency: 'medium', age: '12m', status: 'pending' },
    { id: 'h8', source: 'PHANTOM', type: 'alert', summary: 'Honeypot triggered — synthetic credential attempt from unknown origin', detail: 'A decoy API endpoint received 3 authentication attempts with fabricated tokens. Source IP does not match any known developer or service account. DEFENSE containment protocol initiated automatically.', urgency: 'critical', age: '1m', status: 'pending' },
    { id: 'h9', source: 'DREAM', type: 'request', summary: 'Requesting permission to run experimental mutation on DECODE context window', detail: 'DREAM has identified a potential 25% improvement to DECODE context resolution by adjusting the entity slot confidence decay curve. This is an experimental change that would affect all new sessions. Requesting governor approval for A/B test.', urgency: 'medium', age: '20m', status: 'pending' },
    { id: 'h10', source: 'ATLAS', type: 'status', summary: 'Governance audit complete — all 40 nodes reporting healthy', detail: 'Scheduled governance sweep completed. All 40 substrate nodes passed health checks. 2 nodes flagged for minor configuration drift (auto-corrected). Next audit scheduled in 6 hours.', urgency: 'low', age: '45m', status: 'acknowledged' },
    { id: 'h11', source: 'NERVE', type: 'alert', summary: 'Communication latency spike detected between BRAIN and MEMORY nodes', detail: 'Inter-node messaging latency increased from 2ms to 45ms. Possible congestion in the OCG sector bus. NERVE is rerouting through backup channels. If latency persists beyond 10 minutes, recommend mesh reboot.', urgency: 'high', age: '3m', status: 'pending' },
    { id: 'h12', source: 'CONSCIENCE', type: 'proposal', summary: 'Bias drift detected in NEXUS routing — recommend recalibration', detail: 'Over the past 72 hours, NEXUS has shown a 15% preference bias toward Google models over OpenAI for equivalent tasks. CONSCIENCE recommends a routing weight recalibration to restore provider equity.', urgency: 'medium', age: '25m', status: 'pending' },
    { id: 'h13', source: 'FORGE', type: 'status', summary: 'Cognitive minting queue processed — 3 new sealed runtimes deployed', detail: 'Three cognitives passed validation and were sealed: DataAnalyst-v2, SecurityAuditor-v1, ContentOptimizer-v3. All include embedded skill weights and capability manifests.', urgency: 'low', age: '35m', status: 'acknowledged' },
    { id: 'h14', source: 'SHADOW', type: 'alert', summary: 'Divergence score exceeded threshold on ENCODE output validation', detail: 'SHADOW detected a 23% divergence between ENCODE primary and shadow execution paths. This exceeds the 15% TSAC threshold. Flagging for manual review before promoting to production.', urgency: 'high', age: '7m', status: 'pending' },
    { id: 'h15', source: 'IDENTITY', type: 'request', summary: 'Token refresh storm detected — requesting rate limit adjustment', detail: '47 concurrent token refresh requests from a single session cluster. This appears to be a legitimate heavy-usage pattern rather than an attack. Requesting temporary rate limit increase from 10/min to 25/min for this cluster.', urgency: 'medium', age: '4m', status: 'pending' },
    { id: 'h16', source: 'MEMORY', type: 'status', summary: 'Hot memory tier compaction complete — 12% space recovered', detail: 'Compacted 2,340 redundant pattern entries. Merged 156 near-duplicate memories. Promoted 89 high-confidence patterns to warm tier. Hot tier utilization now at 67%.', urgency: 'low', age: '50m', status: 'acknowledged' },
    { id: 'h17', source: 'INCLUSIVE', type: 'proposal', summary: 'Accessibility scan found 3 WCAG violations on public pages', detail: 'Missing alt text on 2 hero images, insufficient color contrast on footer links (ratio 3.2:1 vs required 4.5:1), and missing skip navigation link. Recommend immediate remediation.', urgency: 'medium', age: '18m', status: 'pending' },
    { id: 'h18', source: 'EVOLUTION', type: 'status', summary: 'Dependency audit complete — 2 packages flagged for update', detail: 'framer-motion has a minor update available (performance fix). react-router-dom has a patch addressing a memory leak in concurrent mode. No security vulnerabilities detected.', urgency: 'low', age: '1h', status: 'acknowledged' },
    { id: 'h19', source: 'GOVERNANCE', type: 'proposal', summary: 'Policy review due — 5 RLS policies have not been audited in 30 days', detail: 'Tables: defense_events, brain_memory_hot, ai_usage_log, analytics_events, atlas_capabilities. Recommend running automated policy verification and cross-referencing with current access patterns.', urgency: 'medium', age: '22m', status: 'pending' },
    { id: 'h20', source: 'ACCESS', type: 'alert', summary: 'API key approaching daily rate limit — developer "sdk-integrator"', detail: 'Developer sdk-integrator has used 87% of daily quota (870/1000 calls). Current velocity suggests limit will be hit within 2 hours. Recommend proactive notification or temporary limit increase.', urgency: 'medium', age: '10m', status: 'pending' },
    { id: 'h21', source: 'RIPPLE', type: 'status', summary: 'Message bus throughput nominal — 1,240 events/min processed', detail: 'All 40 node subscriptions active. Average message latency: 3.2ms. No dropped messages in the last 6 hours. Queue depth: 0 (healthy).', urgency: 'low', age: '5m', status: 'acknowledged' },
    { id: 'h22', source: 'ENGINEER', type: 'alert', summary: 'Engine HYGIENE-1 degraded — CLM recommending maintenance window', detail: 'HYGIENE engine health dropped to 58% after encountering 3 consecutive validation failures on stale pattern cleanup. CLM has deprioritized non-critical hygiene tasks and is routing to VALIDATOR as backup.', urgency: 'high', age: '6m', status: 'pending' },
    { id: 'h23', source: 'DECODE', type: 'request', summary: 'Context window approaching capacity — requesting MEMORY flush', detail: 'Current conversation context is at 92% capacity (118K/128K tokens). Requesting MEMORY to archive older context segments to maintain response quality. User session has been active for 4.5 hours.', urgency: 'medium', age: '1m', status: 'pending' },
    { id: 'h24', source: 'VISION', type: 'proposal', summary: 'Performance regression detected in blog rendering pipeline', detail: 'Page load time for /blog increased from 1.2s to 2.8s over the past week. Root cause: unoptimized image pipeline and excessive client-side re-renders. Recommend lazy loading and image CDN integration.', urgency: 'medium', age: '30m', status: 'pending' },
    { id: 'h25', source: 'CORTEX', type: 'status', summary: 'Pipeline orchestration health check passed — all chains operational', detail: '14 active pipeline chains verified. No stale locks detected. Average chain execution time: 340ms. Longest chain: SCAN→ANALYZE→REPORT at 890ms (within SLA).', urgency: 'low', age: '15m', status: 'acknowledged' },
    { id: 'h26', source: 'PHANTOM', type: 'status', summary: 'Decoy network healthy — 12 honeypots active, 0 triggered in last hour', detail: 'All synthetic endpoints responding normally. Canary tokens embedded in 3 data stores are intact. No exfiltration attempts detected. Next rotation scheduled in 4 hours.', urgency: 'low', age: '40m', status: 'acknowledged' },
    { id: 'h27', source: 'DREAM', type: 'status', summary: 'Overnight dream cycle results — 7 optimizations queued for review', detail: 'Dream cycle analyzed 24h of operational data. Generated 7 optimization proposals: 3 routing improvements, 2 caching strategies, 1 error handling enhancement, 1 cost reduction opportunity. Total estimated improvement: 8.4%.', urgency: 'low', age: '2h', status: 'pending' },
    { id: 'h28', source: 'DEFENSE', type: 'proposal', summary: 'Recommend upgrading WAF rules based on new threat intelligence', detail: 'DEFENSE has correlated 3 new attack patterns from the last 48 hours with emerging CVEs. Proposing 5 new WAF rules targeting SQL injection variants and a GraphQL depth-limit bypass technique.', urgency: 'high', age: '14m', status: 'pending' },
    { id: 'h29', source: 'BRAIN', type: 'request', summary: 'Knowledge graph approaching node limit — requesting expansion approval', detail: 'Current graph: 45,230 nodes / 50,000 limit (90.5%). Growth rate: ~200 nodes/day. Requesting approval to expand limit to 100K nodes. Storage impact: ~120MB additional.', urgency: 'medium', age: '28m', status: 'pending' },
    { id: 'h30', source: 'EVOLUTION', type: 'proposal', summary: 'A/B test results ready — DECODE context optimization shows 18% improvement', detail: 'The experimental context window adjustment (from DREAM proposal h9) has been running for 12 hours. Results: 18% faster context resolution, 3% reduction in hallucination rate, no regression in response quality. Recommend full deployment.', urgency: 'medium', age: '11m', status: 'pending' },
    { id: 'h31', source: 'ATLAS', type: 'alert', summary: 'Governor approval queue has 12 items older than 1 hour', detail: 'Governance SLA requires response within 30 minutes for high-priority items. Currently 4 high-priority and 8 medium-priority items are awaiting review. Recommend batch review session.', urgency: 'high', age: '1m', status: 'pending' },
    { id: 'h32', source: 'NEXUS', type: 'status', summary: 'Fleet health check — 12/14 providers healthy, 2 degraded', detail: 'Degraded: Anthropic (elevated latency, P95: 4.2s vs normal 1.8s), Stability AI (intermittent 503s). All traffic rerouted to healthy providers. Cost impact: +4% due to fallback routing.', urgency: 'medium', age: '9m', status: 'acknowledged' },
    { id: 'h33', source: 'ENGINEER', type: 'status', summary: 'Maintenance cycle complete — 3 engines serviced, 0 critical issues', detail: 'Serviced: VALIDATOR-2 (cleared stale cache), REPORTER-1 (reset output buffer), HYGIENE-3 (patched pattern matcher). All engines returned to healthy status. Next scheduled maintenance: 6 hours.', urgency: 'low', age: '55m', status: 'acknowledged' },
    { id: 'h34', source: 'SHADOW', type: 'proposal', summary: 'Recommend adding shadow execution path for new ORACLE predictions', detail: 'ORACLE recently gained predictive capabilities for capacity planning. SHADOW proposes running parallel validation on all predictions for 7 days before trusting them for automated actions.', urgency: 'medium', age: '33m', status: 'pending' },
    { id: 'h35', source: 'CONSCIENCE', type: 'alert', summary: 'Content generation output flagged for potential ethical concern', detail: 'ENCODE generated code that includes hardcoded credentials in a template. While these are placeholder values, CONSCIENCE flags this as a security anti-pattern that could be copied by users.', urgency: 'high', age: '5m', status: 'pending' },
    { id: 'h36', source: 'FORGE', type: 'request', summary: 'Requesting additional compute allocation for cognitive training batch', detail: '4 cognitives in the training queue require GPU-equivalent processing. Current allocation: 2 concurrent training slots. Requesting temporary expansion to 4 slots for next 2 hours.', urgency: 'medium', age: '16m', status: 'pending' },
    { id: 'h37', source: 'IDENTITY', type: 'status', summary: 'Session integrity audit — all active sessions validated', detail: '23 active sessions verified. 0 orphaned tokens found. Average session duration: 2.4 hours. 2 sessions approaching 24h TTL, refresh tokens ready.', urgency: 'low', age: '20m', status: 'acknowledged' },
    { id: 'h38', source: 'NERVE', type: 'status', summary: 'Inter-node communication matrix — all 40 nodes connected', detail: 'Full mesh connectivity confirmed. Average cross-node latency: 4.1ms. No partition events detected. Heartbeat failure count: 0 in last 24h.', urgency: 'low', age: '10m', status: 'acknowledged' },
    { id: 'h39', source: 'MEMORY', type: 'alert', summary: 'Warm tier migration stalled — disk I/O bottleneck detected', detail: 'Warm-to-cold tier migration queue has 340 pending items. Disk write throughput dropped to 12MB/s (normal: 45MB/s). Likely cause: concurrent backup operation. Recommend staggering backup schedule.', urgency: 'medium', age: '8m', status: 'pending' },
    { id: 'h40', source: 'VISION', type: 'status', summary: 'Real-time monitoring dashboard — all key metrics within bounds', detail: 'CPU: 34%, Memory: 62%, Disk: 71%, Network: 23Mbps. No anomalies detected. All SLA targets met. Next deep analysis scheduled in 2 hours.', urgency: 'low', age: '3m', status: 'acknowledged' },
    { id: 'h41', source: 'ORACLE', type: 'proposal', summary: 'Traffic prediction: 40% increase expected in next 72 hours', detail: 'Based on historical patterns and current growth trajectory, ORACLE predicts a significant traffic surge. Recommend pre-scaling NEXUS provider pool and increasing DEFENSE rate limits proactively.', urgency: 'medium', age: '45m', status: 'pending' },
    { id: 'h42', source: 'GOVERNANCE', type: 'status', summary: 'Policy compliance report — 97.3% compliance across all modules', detail: '36 of 37 auditable policies passing. 1 warning: ENCODE code generation policy needs updated test coverage (last tested 14 days ago). No critical violations.', urgency: 'low', age: '1h', status: 'acknowledged' },
    { id: 'h43', source: 'RIPPLE', type: 'alert', summary: 'Message bus consumer lag detected on DEFENSE channel', detail: 'DEFENSE event consumer is 230 messages behind. Normal lag: <10. Likely cause: high-volume scan event burst. Auto-scaling consumer group. ETA to catch up: ~3 minutes.', urgency: 'medium', age: '2m', status: 'pending' },
    { id: 'h44', source: 'MODERNIZER', type: 'proposal', summary: 'Recommend migrating 3 utility functions to use native browser APIs', detail: 'lodash.debounce, date-fns.format, and custom UUID generator can be replaced with native alternatives. Estimated bundle size reduction: 8KB gzipped. No breaking changes expected.', urgency: 'low', age: '1h', status: 'pending' },
    { id: 'h45', source: 'INCLUSIVE', type: 'status', summary: 'Screen reader compatibility verified — all interactive elements labeled', detail: 'Full ARIA audit of dashboard surfaces complete. 156 interactive elements checked. 100% have accessible names. Tab order verified on 12 key flows. No keyboard traps detected.', urgency: 'low', age: '2h', status: 'acknowledged' },
    { id: 'h46', source: 'ACCESS', type: 'status', summary: 'Developer portal API health — 99.7% uptime this month', detail: '3 brief outages (total: 12 minutes) due to planned maintenance windows. All API keys validated. 5 new developer registrations this week. Quota utilization averaging 45%.', urgency: 'low', age: '30m', status: 'acknowledged' },
    { id: 'h47', source: 'CORTEX', type: 'alert', summary: 'Pipeline chain timeout on SCAN→DEEP-ANALYZE — exceeded 30s SLA', detail: 'Deep analysis pipeline took 47s on a complex multi-file scan. Bottleneck identified in the pattern matching phase. CORTEX is implementing chunked processing to prevent future timeouts.', urgency: 'medium', age: '12m', status: 'pending' },
    { id: 'h48', source: 'ENGINEER', type: 'proposal', summary: 'Meta-engine fleet expansion — propose adding 2 new composite engines', detail: 'Based on usage patterns, ENGINEER recommends creating: (1) SCAN-AND-FIX (combines Scanner + ENCODE for automated remediation), (2) PREDICT-AND-SCALE (combines ORACLE + ACCESS for proactive scaling). Estimated development: 4 hours each.', urgency: 'low', age: '38m', status: 'pending' },
    { id: 'h49', source: 'DEFENSE', type: 'status', summary: 'Threat intelligence feed updated — 47 new IoCs ingested', detail: 'Updated blocklists with 47 new Indicators of Compromise from 3 threat feeds. 12 IPs added to pre-emptive block list. 8 new user-agent signatures added to bot detection.', urgency: 'low', age: '25m', status: 'acknowledged' },
    { id: 'h50', source: 'DREAM', type: 'request', summary: 'Requesting extended dream cycle window — complex optimization detected', detail: 'Standard 4-hour dream window insufficient for a cross-module optimization involving BRAIN, MEMORY, and NEXUS interaction patterns. Requesting 8-hour window with reduced system load.', urgency: 'low', age: '42m', status: 'pending' },
  ];
  return base;
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
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-to-br from-primary/15 to-neon-purple/10 border border-primary/25 flex items-center justify-center shrink-0 animate-signal-pulse">
            <Brain className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
          </div>
          <div className="min-w-0">
            <h2 className="text-base sm:text-lg font-bold tracking-tight memory-stream-gradient-text">INTENT Mesh & Hub</h2>
            <p className="text-[9px] sm:text-[10px] text-muted-foreground/60 font-mono tracking-wider truncate">SIGNAL ORCHESTRATION · AFFINITY MATRIX</p>
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
          <ScrollArea className="h-[70vh] sm:h-[75vh]">
          <div className="space-y-2 sm:space-y-2.5 pr-3">
            {messages.map((msg, i) => {
              const MsgIcon = typeIcon(msg.type);
              const isExpanded = expandedId === msg.id;
              const isReplying = replyingTo === msg.id;
              const isPending = msg.status === 'pending';

              return (
                <motion.div
                  key={msg.id}
                  className={cn(
                    "rounded-lg sm:rounded-xl border bg-card/50 dark:bg-card/20 transition-colors signal-border",
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
          </ScrollArea>
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
                className="rounded-lg sm:rounded-xl border border-border/15 dark:border-border/10 p-3 sm:p-4 bg-card/50 dark:bg-card/20 hover:border-primary/15 hover:-translate-y-0.5 hover:shadow-sm transition-all duration-300"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
              >
                <stat.icon className={cn("w-4 h-4 mb-1.5 sm:mb-2", stat.color)} />
                <div className="text-lg sm:text-xl font-bold font-mono tabular-nums leading-tight">{stat.value}</div>
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
              <ScrollArea className="h-[400px]">
              <div className="space-y-2 pr-3">
                {messages.slice(0, 20).map((msg, i) => {
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
              </ScrollArea>
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
                className="rounded-lg sm:rounded-xl border border-border/15 dark:border-border/10 p-3 sm:p-4 bg-card/50 dark:bg-card/20 hover:border-primary/15 hover:-translate-y-0.5 hover:shadow-sm transition-all duration-300"
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
                    pair.score >= 0.9 ? "text-emerald-600 dark:text-emerald-400" : pair.score >= 0.8 ? "text-cyan-600 dark:text-cyan-400" : "text-amber-600 dark:text-amber-400", "tabular-nums"
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
                className={cn("rounded-lg sm:rounded-xl border p-3 sm:p-4 hover:-translate-y-0.5 hover:shadow-sm transition-all duration-300", intent.color)}
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
