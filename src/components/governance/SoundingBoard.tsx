/**
 * Module Sounding Board — Internal Governor-Only Surface
 * Advisory-only feed where modules post outcomes, requests, and discoveries.
 * Modules cannot execute, mutate, or self-upgrade through this surface.
 */

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { MODULE_REGISTRY } from '@/lib/modules/module-registry';
import {
  CheckCircle2, Clock, XCircle, Eye, MessageSquare, AlertTriangle,
  Sparkles, Target, TrendingUp, Shield, Brain, Filter
} from 'lucide-react';

// Post type metadata
const POST_TYPE_META: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  capability_outcome: { label: 'Outcome Report', icon: Target, color: 'text-neon-green' },
  clm_request: { label: 'CLM Request', icon: TrendingUp, color: 'text-neon-blue' },
  discovery: { label: 'Discovery', icon: Sparkles, color: 'text-neon-amber' },
  anomaly: { label: 'Anomaly', icon: AlertTriangle, color: 'text-destructive' },
  milestone: { label: 'Milestone', icon: CheckCircle2, color: 'text-neon-cyan' },
};

const STATUS_META: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  open: { label: 'Open', icon: MessageSquare, color: 'text-muted-foreground' },
  acknowledged: { label: 'Acknowledged', icon: Eye, color: 'text-neon-blue' },
  approved: { label: 'Approved for Review', icon: CheckCircle2, color: 'text-neon-green' },
  scheduled: { label: 'Scheduled for Audit', icon: Clock, color: 'text-neon-amber' },
  declined: { label: 'Declined', icon: XCircle, color: 'text-destructive' },
};

function getModuleMeta(slug: string) {
  const mod = MODULE_REGISTRY.find(m => m.slug === slug.toLowerCase());
  return {
    name: mod?.name ?? slug.toUpperCase(),
    icon: mod?.icon ?? Brain,
    color: mod?.color ?? 'neon-blue',
  };
}

interface SoundingBoardPost {
  id: string;
  module_slug: string;
  post_type: string;
  title: string;
  body: string;
  confidence: number;
  severity: string;
  governor_status: string;
  governor_rationale: string | null;
  governor_action_at: string | null;
  created_at: string;
}

type GovernorAction = 'acknowledged' | 'approved' | 'scheduled' | 'declined';

export function SoundingBoard() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<string>('all');
  const [declineRationale, setDeclineRationale] = useState<Record<string, string>>({});

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['sounding-board', filter],
    queryFn: async () => {
      let query = supabase
        .from('module_sounding_board')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (filter !== 'all') {
        query = query.eq('governor_status', filter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []) as SoundingBoardPost[];
    },
  });

  const actionMutation = useMutation({
    mutationFn: async ({ id, action, rationale }: { id: string; action: GovernorAction; rationale?: string }) => {
      const { error } = await supabase
        .from('module_sounding_board')
        .update({
          governor_status: action,
          governor_rationale: rationale || null,
          governor_action_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;

      // Log to audit
      await supabase.from('audit_logs').insert({
        action: `sounding_board.${action}`,
        entity_type: 'sounding_board_post',
        entity_id: id,
        details: { action, rationale } as any,
      });
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['sounding-board'] });
      const meta = STATUS_META[vars.action];
      toast.success(`${meta.label}`, { description: 'Governor action logged.' });
    },
    onError: () => toast.error('Action failed'),
  });

  const handleAction = (id: string, action: GovernorAction) => {
    const rationale = action === 'declined' ? declineRationale[id] : undefined;
    if (action === 'declined' && !rationale?.trim()) {
      toast.error('Please provide a rationale for declining.');
      return;
    }
    actionMutation.mutate({ id, action, rationale });
  };

  const openCount = posts.filter(p => p.governor_status === 'open').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            Signal Feed
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Live module signals — non-executing, non-mutating
          </p>
        </div>
        {openCount > 0 && (
          <Badge variant="outline" className="border-neon-amber/40 text-neon-amber bg-neon-amber/10">
            {openCount} open
          </Badge>
        )}
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {['all', 'open', 'acknowledged', 'approved', 'scheduled', 'declined'].map((f) => (
          <Button
            key={f}
            size="sm"
            variant={filter === f ? 'default' : 'outline'}
            onClick={() => setFilter(f)}
            className="text-xs capitalize"
          >
            <Filter className="w-3 h-3 mr-1" />
            {f}
          </Button>
        ))}
      </div>

      {/* Feed */}
      <ScrollArea className="h-[600px]">
        <div className="space-y-4 pr-4">
          {isLoading && (
            <div className="text-center py-12 text-muted-foreground">Loading module posts…</div>
          )}
          
          {!isLoading && posts.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              No posts match this filter.
            </div>
          )}

          {posts.map((post) => {
            const moduleMeta = getModuleMeta(post.module_slug);
            const postMeta = POST_TYPE_META[post.post_type] || POST_TYPE_META.capability_outcome;
            const statusMeta = STATUS_META[post.governor_status] || STATUS_META.open;
            const PostIcon = postMeta.icon;
            const StatusIcon = statusMeta.icon;
            const ModuleIcon = moduleMeta.icon;

            return (
              <Card key={post.id} className="border-border/50">
                <CardContent className="p-4 space-y-3">
                  {/* Module header */}
                  <div className="flex items-start gap-3">
                    <Avatar className="h-9 w-9">
                      <AvatarFallback className={`bg-${moduleMeta.color}/20 text-${moduleMeta.color} text-xs font-bold`}>
                        <ModuleIcon className="w-4 h-4" />
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-sm">{moduleMeta.name}</span>
                        <Badge variant="outline" className="text-[9px] h-4 px-1.5 border-primary/30">
                          Verified Module
                        </Badge>
                        <Badge variant="outline" className={`text-[9px] h-4 px-1.5 ${postMeta.color}`}>
                          <PostIcon className="w-2.5 h-2.5 mr-0.5" />
                          {postMeta.label}
                        </Badge>
                        <Badge variant="outline" className={`text-[9px] h-4 px-1.5 ${statusMeta.color}`}>
                          <StatusIcon className="w-2.5 h-2.5 mr-0.5" />
                          {statusMeta.label}
                        </Badge>
                      </div>

                      <h3 className="font-medium text-sm mt-1">{post.title}</h3>
                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{post.body}</p>
                      
                      <div className="flex items-center gap-3 mt-2 text-[10px] text-muted-foreground/60">
                        <span>{new Date(post.created_at).toLocaleDateString()}</span>
                        <span>Confidence: {Math.round((post.confidence || 0) * 100)}%</span>
                        {post.severity !== 'info' && (
                          <span className={post.severity === 'critical' ? 'text-destructive' : 'text-neon-amber'}>
                            {post.severity}
                          </span>
                        )}
                      </div>

                      {/* Governor rationale display */}
                      {post.governor_rationale && (
                        <div className="mt-2 p-2 rounded bg-muted/50 border border-border/30">
                          <p className="text-[10px] text-muted-foreground">
                            <strong>Governor:</strong> {post.governor_rationale}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Governor actions — only show for open posts */}
                  {post.governor_status === 'open' && (
                    <div className="flex items-center gap-2 pl-12 flex-wrap">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs h-7"
                        onClick={() => handleAction(post.id, 'acknowledged')}
                        disabled={actionMutation.isPending}
                      >
                        <Eye className="w-3 h-3 mr-1" />
                        Acknowledge
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs h-7 border-neon-green/30 text-neon-green hover:bg-neon-green/10"
                        onClick={() => handleAction(post.id, 'approved')}
                        disabled={actionMutation.isPending}
                      >
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Approve for Review
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs h-7 border-neon-amber/30 text-neon-amber hover:bg-neon-amber/10"
                        onClick={() => handleAction(post.id, 'scheduled')}
                        disabled={actionMutation.isPending}
                      >
                        <Clock className="w-3 h-3 mr-1" />
                        Schedule Audit
                      </Button>
                      <div className="flex items-center gap-1 flex-1 min-w-[200px]">
                        <Textarea
                          placeholder="Rationale for declining…"
                          className="h-7 text-xs min-h-0 py-1 resize-none"
                          value={declineRationale[post.id] || ''}
                          onChange={(e) => setDeclineRationale(prev => ({ ...prev, [post.id]: e.target.value }))}
                        />
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs h-7 border-destructive/30 text-destructive hover:bg-destructive/10 shrink-0"
                          onClick={() => handleAction(post.id, 'declined')}
                          disabled={actionMutation.isPending}
                        >
                          <XCircle className="w-3 h-3 mr-1" />
                          Decline
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
