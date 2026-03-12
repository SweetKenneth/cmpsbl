/**
 * Node Inbox View — ATLAS Dashboard
 * Shows what all nodes are saying, wanting, needing, and proposing
 * in plain human-readable language with approval/rejection actions.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Inbox, Check, X, Eye, Clock, AlertTriangle, MessageSquare,
  Filter, RefreshCw, ChevronDown, ChevronUp, Sparkles
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import {
  getPendingMessages, getAllMessages, approveMessage, rejectMessage,
  getIntentHubStats, submitToIntent, type NodeMessage,
} from '@/lib/substrate/intent-mesh/intent-hub';

const PRIORITY_COLORS: Record<string, string> = {
  critical: 'bg-red-500/20 text-red-300 border-red-400/40',
  high: 'bg-orange-500/20 text-orange-300 border-orange-400/40',
  medium: 'bg-yellow-500/20 text-yellow-300 border-yellow-400/40',
  low: 'bg-blue-500/20 text-blue-300 border-blue-400/40',
  info: 'bg-muted text-muted-foreground border-border',
};

const TYPE_LABELS: Record<string, string> = {
  proposal: '📋 Proposal',
  request: '🙋 Request',
  alert: '🚨 Alert',
  report: '📊 Report',
  need: '💡 Need',
  question: '❓ Question',
};

// Seed realistic system messages so the inbox isn't empty on first load
function seedSystemMessages() {
  const existing = getAllMessages(1);
  if (existing.length > 0) return;

  const seeds: Array<{
    node: string; codename: string; type: NodeMessage['messageType'];
    priority: NodeMessage['priority']; title: string; summary: string;
    detail: string; impact: string; action: boolean; tags: string[];
  }> = [
    {
      node: 'ENGINEER', codename: 'Mechanist', type: 'proposal', priority: 'medium',
      title: 'Consolidate redundant safety switch instances',
      summary: 'Three nodes share identical safety switch configs. Merging them into a shared switch pool would reduce memory usage by ~12% and simplify maintenance.',
      detail: 'Nodes: DEFENSE, NEXUS, CORTEX — identical thresholds (5 failures / 60s). Propose shared SafetySwitchPool.',
      impact: 'Reduces memory footprint and centralizes failure tracking for better observability.',
      action: true, tags: ['engine-maintenance', 'optimization'],
    },
    {
      node: 'DEFENSE', codename: 'Citadel', type: 'alert', priority: 'low',
      title: 'Rate limit threshold approaching for Groq provider',
      summary: 'Groq free-tier usage hit 78% of daily RPD limit. If current trajectory continues, the limit will be reached by ~18:00 UTC.',
      detail: 'Current: 624/800 RPD. Rate: ~26 req/hr. Projected exhaust: 6.7 hours.',
      impact: 'NEXUS will auto-failover to Cerebras if Groq is exhausted. No service disruption expected.',
      action: false, tags: ['rate-limit', 'nexus', 'groq'],
    },
    {
      node: 'BRAIN', codename: 'Cortical', type: 'report', priority: 'info',
      title: 'Memory tiering cycle completed successfully',
      summary: 'Hot → Warm demotion moved 14 memories. 2 high-value warm memories promoted to hot. Zero contradictions detected.',
      detail: 'Hot: 186/200, Warm: 1,847/2,000, Cold: 12,394/20,000. Compression ratio: 0.72.',
      impact: 'Memory system healthy. No action required.',
      action: false, tags: ['memory', 'tiering', 'routine'],
    },
    {
      node: 'NEXUS', codename: 'Router', type: 'report', priority: 'info',
      title: 'Fleet routing summary — last 24h',
      summary: 'Processed 847 requests across 9 providers. 99.6% success rate. Average latency: 312ms. Zero paid API calls.',
      detail: 'Top providers: Groq (412 req), Cerebras (198 req), Google (127 req). 3 safety switch trips (all recovered).',
      impact: 'Fleet operating within normal parameters. Cost: $0.00.',
      action: false, tags: ['fleet', 'daily-summary'],
    },
    {
      node: 'ENGINEER', codename: 'Mechanist', type: 'proposal', priority: 'high',
      title: 'SHADOW module health score below threshold',
      summary: 'SHADOW module health dropped to 67% due to 4 consecutive verification timeouts. Recommend resetting the divergence scoring engine and flushing stale TSAC proofs.',
      detail: 'Engine: shadow_divergence_engine. Failure type: timeout (>5000ms). Last success: 3h ago.',
      impact: 'If unaddressed, SHADOW verification pipeline will enter degraded mode within 6 hours.',
      action: true, tags: ['engine-maintenance', 'repair', 'shadow'],
    },
    {
      node: 'CONSCIENCE', codename: 'Arbiter', type: 'need', priority: 'medium',
      title: 'Bias detection model needs retraining data',
      summary: 'The bias scanner has processed 2,400+ outputs but the training corpus hasn\'t been refreshed in 14 days. Requesting permission to ingest recent DECODE outputs for recalibration.',
      detail: 'Current model accuracy: 91.2%. Target: 95%+. Estimated retraining time: ~45 minutes.',
      impact: 'Without retraining, bias detection accuracy may drift below acceptable thresholds.',
      action: true, tags: ['bias', 'training', 'conscience'],
    },
  ];

  for (const s of seeds) {
    submitToIntent(s.node, s.codename, s.type, s.priority, s.title, s.summary, s.detail, s.impact, s.action, s.tags);
  }
}

interface NodeInboxViewProps {
  className?: string;
}

export function NodeInboxView({ className }: NodeInboxViewProps) {
  const [messages, setMessages] = useState<NodeMessage[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [stats, setStats] = useState(getIntentHubStats());
  const [replyText, setReplyText] = useState<Record<string, string>>({});
  const seeded = useRef(false);

  // Seed system messages once
  useEffect(() => {
    if (!seeded.current) {
      seeded.current = true;
      seedSystemMessages();
    }
  }, []);

  const refresh = useCallback(() => {
    const all = getAllMessages(100);
    setMessages(filter === 'all' ? all :
      filter === 'pending' ? all.filter(m => m.status === 'pending') :
      filter === 'approved' ? all.filter(m => m.status === 'approved') :
      all.filter(m => m.status === 'rejected'));
    setStats(getIntentHubStats());
  }, [filter]);

  useEffect(() => { refresh(); }, [refresh]);
  useEffect(() => { const iv = setInterval(refresh, 10_000); return () => clearInterval(iv); }, [refresh]);

  const handleApprove = (id: string) => {
    approveMessage(id, replyText[id] || 'Approved');
    refresh();
  };

  const handleReject = (id: string) => {
    rejectMessage(id, replyText[id] || 'Rejected');
    refresh();
  };

  const formatAge = (ts: number) => {
    const mins = Math.floor((Date.now() - ts) / 60_000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Header Stats */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
        <div className="flex items-center gap-2">
          <Inbox className="w-5 h-5 text-cyan-400" />
          <h3 className="font-bold text-sm">Node Inbox</h3>
          <Badge className="text-[10px] bg-cyan-500/20 text-cyan-300 border-cyan-400/40">
            {stats.pendingCount} pending
          </Badge>
        </div>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={refresh}>
          <RefreshCw className="w-3.5 h-3.5" />
        </Button>
      </div>

      {/* Stat Summary */}
      <div className="grid grid-cols-4 gap-2 px-4 py-2 border-b border-border/30 bg-muted/20">
        <div className="text-center">
          <div className="text-lg font-bold text-foreground">{stats.totalMessages}</div>
          <div className="text-[10px] text-muted-foreground">Total</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-yellow-400">{stats.pendingCount}</div>
          <div className="text-[10px] text-muted-foreground">Pending</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-emerald-400">{stats.approvedCount}</div>
          <div className="text-[10px] text-muted-foreground">Approved</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-red-400">{stats.rejectedCount}</div>
          <div className="text-[10px] text-muted-foreground">Rejected</div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1 px-4 py-2 border-b border-border/30">
        {(['pending', 'all', 'approved', 'rejected'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              'px-3 py-1 text-[11px] rounded-md font-medium transition-colors',
              filter === f ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40' : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1">
        <div className="p-3 space-y-2">
          {messages.length === 0 && (
            <div className="text-center py-8 text-muted-foreground text-sm">
              <Sparkles className="w-8 h-8 mx-auto mb-2 opacity-40" />
              No messages to show
            </div>
          )}
          <AnimatePresence mode="popLayout">
            {messages.map(msg => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={cn(
                  'rounded-xl border p-3 transition-colors cursor-pointer',
                  msg.status === 'pending' ? 'border-cyan-500/30 bg-card/80' :
                  msg.status === 'approved' ? 'border-emerald-500/20 bg-emerald-500/5' :
                  msg.status === 'rejected' ? 'border-red-500/20 bg-red-500/5' : 'border-border/30 bg-card/50',
                )}
                onClick={() => setExpandedId(expandedId === msg.id ? null : msg.id)}
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className={cn('text-[9px]', PRIORITY_COLORS[msg.priority])}>
                        {msg.priority.toUpperCase()}
                      </Badge>
                      <span className="text-[10px] text-muted-foreground">{TYPE_LABELS[msg.messageType] || msg.messageType}</span>
                      <span className="text-[10px] text-muted-foreground ml-auto">{formatAge(msg.createdAt)}</span>
                    </div>
                    <div className="text-sm font-medium text-foreground">{msg.title}</div>
                    <div className="text-[11px] text-cyan-400 font-mono mt-0.5">from {msg.sourceNode} ({msg.sourceCodename})</div>
                  </div>
                  {expandedId === msg.id ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                </div>

                {/* Expanded Detail */}
                {expandedId === msg.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    className="mt-3 pt-3 border-t border-border/30 space-y-3"
                  >
                    <div>
                      <div className="text-[10px] font-semibold text-muted-foreground mb-1 uppercase tracking-wider">What's happening</div>
                      <p className="text-sm text-foreground/90 leading-relaxed">{msg.humanSummary}</p>
                    </div>
                    <div>
                      <div className="text-[10px] font-semibold text-muted-foreground mb-1 uppercase tracking-wider">Why it matters</div>
                      <p className="text-sm text-foreground/80 leading-relaxed">{msg.impact}</p>
                    </div>
                    <details className="text-xs">
                      <summary className="text-muted-foreground cursor-pointer hover:text-foreground">Technical details</summary>
                      <pre className="mt-1 p-2 rounded bg-muted/50 text-[11px] font-mono text-muted-foreground whitespace-pre-wrap">{msg.technicalDetail}</pre>
                    </details>
                    {msg.tags.length > 0 && (
                      <div className="flex gap-1 flex-wrap">
                        {msg.tags.map(tag => (
                          <span key={tag} className="text-[9px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{tag}</span>
                        ))}
                      </div>
                    )}
                    {msg.reviewerNote && (
                      <div className="bg-muted/30 rounded-lg p-2 text-sm">
                        <span className="text-[10px] text-muted-foreground">Your response: </span>
                        {msg.reviewerNote}
                      </div>
                    )}
                    {msg.status === 'pending' && msg.actionRequired && (
                      <div className="space-y-2">
                        <textarea
                          value={replyText[msg.id] || ''}
                          onChange={e => setReplyText(prev => ({ ...prev, [msg.id]: e.target.value }))}
                          placeholder="Add a note (optional)..."
                          className="w-full px-3 py-2 text-sm rounded-lg bg-muted/50 border border-border/50 resize-none focus:outline-none focus:ring-1 focus:ring-cyan-400/50"
                          rows={2}
                          onClick={e => e.stopPropagation()}
                        />
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs flex-1"
                            onClick={e => { e.stopPropagation(); handleApprove(msg.id); }}
                          >
                            <Check className="w-3.5 h-3.5 mr-1" /> Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            className="text-xs flex-1"
                            onClick={e => { e.stopPropagation(); handleReject(msg.id); }}
                          >
                            <X className="w-3.5 h-3.5 mr-1" /> Reject
                          </Button>
                        </div>
                      </div>
                    )}
                    {msg.status !== 'pending' && (
                      <Badge className={cn('text-[10px]',
                        msg.status === 'approved' ? 'bg-emerald-500/20 text-emerald-300' :
                        msg.status === 'rejected' ? 'bg-red-500/20 text-red-300' :
                        'bg-muted text-muted-foreground'
                      )}>
                        {msg.status.toUpperCase()}
                      </Badge>
                    )}
                  </motion.div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </ScrollArea>
    </div>
  );
}
