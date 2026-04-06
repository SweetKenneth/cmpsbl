/**
 * Autonomous Product Compiler — Governor Review Surface
 * /admin/compiler
 */

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { rateCompilation, generateProposals, persistProposals } from '@/lib/factory/product-compiler';
import { AdminRoute } from '@/components/admin/AdminRoute';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Brain, CheckCircle2, XCircle, Clock, Zap, RefreshCw, Package } from 'lucide-react';

interface CompilationRow {
  id: string;
  vertical: string;
  name: string;
  description: string;
  discovery_ids: string[];
  combined_chain: string[];
  coherence_score: number;
  compatibility_score: number;
  estimated_value_cents: number;
  component_count: number;
  status: string;
  rating: number | null;
  notes: string | null;
  created_at: string;
}

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case 'approved':
      return <Badge className="bg-emerald-600/20 text-emerald-400 border-emerald-600/30"><CheckCircle2 className="w-3 h-3 mr-1" />Approved</Badge>;
    case 'rejected':
      return <Badge className="bg-red-600/20 text-red-400 border-red-600/30"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
    default:
      return <Badge className="bg-amber-600/20 text-amber-400 border-amber-600/30"><Clock className="w-3 h-3 mr-1" />Pending Review</Badge>;
  }
}

function RatingLabel({ rating }: { rating: number }) {
  if (rating <= 2) return <span className="text-red-400 font-semibold">Never again ({rating})</span>;
  if (rating <= 4) return <span className="text-orange-400 font-semibold">Doesn't work ({rating})</span>;
  if (rating <= 6) return <span className="text-amber-400 font-semibold">Marginal ({rating})</span>;
  if (rating <= 8) return <span className="text-emerald-400 font-semibold">Strong ({rating})</span>;
  return <span className="text-cyan-400 font-semibold">Exceptional ({rating})</span>;
}

function ProposalCard({
  proposal,
  onRated,
}: {
  proposal: CompilationRow;
  onRated: () => void;
}) {
  const [rating, setRating] = useState<number>(5);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    setSubmitting(true);
    const success = await rateCompilation(proposal.id, rating, notes || undefined);
    setSubmitting(false);

    if (success) {
      toast.success(`Rated "${proposal.name}" → ${rating}/10`);
      onRated();
    } else {
      toast.error('Failed to submit rating');
    }
  };

  const isPending = proposal.status === 'pending';

  return (
    <Card className="border-border/50 bg-card/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <Package className="w-4 h-4 text-primary" />
              {proposal.name}
            </CardTitle>
            <CardDescription className="mt-1">{proposal.description}</CardDescription>
          </div>
          <StatusBadge status={proposal.status} />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Scores */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
          <div className="bg-muted/30 rounded-lg p-3 text-center">
            <div className="text-muted-foreground text-xs">Components</div>
            <div className="text-foreground font-bold text-lg">{proposal.component_count}</div>
          </div>
          <div className="bg-muted/30 rounded-lg p-3 text-center">
            <div className="text-muted-foreground text-xs">Coherence</div>
            <div className="text-foreground font-bold text-lg">{proposal.coherence_score}</div>
          </div>
          <div className="bg-muted/30 rounded-lg p-3 text-center">
            <div className="text-muted-foreground text-xs">Compatibility</div>
            <div className="text-foreground font-bold text-lg">{proposal.compatibility_score}</div>
          </div>
          <div className="bg-muted/30 rounded-lg p-3 text-center">
            <div className="text-muted-foreground text-xs">Est. Value</div>
            <div className="text-foreground font-bold text-lg">${(proposal.estimated_value_cents / 100).toFixed(0)}</div>
          </div>
        </div>

        {/* Combined chain */}
        <div>
          <div className="text-xs text-muted-foreground mb-1.5">Combined Primitive Chain</div>
          <div className="flex flex-wrap gap-1">
            {(proposal.combined_chain ?? []).map((p, i) => (
              <Badge key={i} variant="outline" className="text-xs font-mono">{p}</Badge>
            ))}
          </div>
        </div>

        {/* Rating controls — only for pending */}
        {isPending && (
          <div className="border-t border-border/30 pt-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Rating</span>
              <RatingLabel rating={rating} />
            </div>
            <Slider
              value={[rating]}
              onValueChange={([v]) => setRating(v)}
              min={1}
              max={10}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground px-1">
              <span>1 — Never again</span>
              <span>5 — Marginal</span>
              <span>10 — Exceptional</span>
            </div>
            <Textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Optional notes..."
              className="h-16 text-sm"
            />
            <Button
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full"
            >
              {submitting ? 'Submitting...' : `Submit Rating (${rating}/10)`}
            </Button>
          </div>
        )}

        {/* Already rated */}
        {!isPending && proposal.rating !== null && (
          <div className="border-t border-border/30 pt-3">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Governor Rating:</span>
              <RatingLabel rating={proposal.rating} />
            </div>
            {proposal.notes && (
              <p className="text-sm text-muted-foreground mt-1 italic">"{proposal.notes}"</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function ProductCompilerDashboard() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('pending');

  const { data: proposals = [], isLoading } = useQuery({
    queryKey: ['compiled-products', activeTab],
    queryFn: async () => {
      let query = supabase
        .from('compiled_products')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (activeTab !== 'all') {
        query = query.eq('status', activeTab);
      }

      const { data } = await query;
      return (data ?? []) as CompilationRow[];
    },
  });

  const { data: stats } = useQuery({
    queryKey: ['compiler-stats'],
    queryFn: async () => {
      const [pending, approved, rejected, feedbackCount] = await Promise.all([
        supabase.from('compiled_products').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('compiled_products').select('id', { count: 'exact', head: true }).eq('status', 'approved'),
        supabase.from('compiled_products').select('id', { count: 'exact', head: true }).eq('status', 'rejected'),
        supabase.from('compiler_feedback').select('id', { count: 'exact', head: true }),
      ]);
      return {
        pending: pending.count ?? 0,
        approved: approved.count ?? 0,
        rejected: rejected.count ?? 0,
        feedbackCount: feedbackCount.count ?? 0,
      };
    },
  });

  const generateMutation = useMutation({
    mutationFn: async () => {
      const proposals = await generateProposals('primary', 5);
      return persistProposals(proposals, `manual-${Date.now()}`);
    },
    onSuccess: (count) => {
      toast.success(`Generated ${count} new proposals`);
      queryClient.invalidateQueries({ queryKey: ['compiled-products'] });
      queryClient.invalidateQueries({ queryKey: ['compiler-stats'] });
    },
  });

  const onRated = () => {
    queryClient.invalidateQueries({ queryKey: ['compiled-products'] });
    queryClient.invalidateQueries({ queryKey: ['compiler-stats'] });
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-4 md:p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Brain className="w-6 h-6 text-primary" />
            Product Compiler
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Autonomous compilation engine — governor review surface
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => generateMutation.mutate()}
          disabled={generateMutation.isPending}
        >
          <RefreshCw className={`w-4 h-4 mr-1.5 ${generateMutation.isPending ? 'animate-spin' : ''}`} />
          Generate Proposals
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-amber-400">{stats?.pending ?? 0}</div>
            <div className="text-xs text-muted-foreground">Pending</div>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-emerald-400">{stats?.approved ?? 0}</div>
            <div className="text-xs text-muted-foreground">Approved</div>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-400">{stats?.rejected ?? 0}</div>
            <div className="text-xs text-muted-foreground">Rejected</div>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">{stats?.feedbackCount ?? 0}</div>
            <div className="text-xs text-muted-foreground">Decisions</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="pending">Pending ({stats?.pending ?? 0})</TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
          <TabsTrigger value="all">All</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          {isLoading ? (
            <div className="text-center text-muted-foreground py-12">Loading proposals...</div>
          ) : proposals.length === 0 ? (
            <div className="text-center py-12">
              <Zap className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No {activeTab} proposals</p>
              {activeTab === 'pending' && (
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3"
                  onClick={() => generateMutation.mutate()}
                  disabled={generateMutation.isPending}
                >
                  Generate First Proposals
                </Button>
              )}
            </div>
          ) : (
            proposals.map(p => (
              <ProposalCard key={p.id} proposal={p} onRated={onRated} />
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
