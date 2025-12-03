import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  GitBranch, 
  AlertTriangle,
  Eye,
  Sparkles
} from 'lucide-react';

interface Proposal {
  id: string;
  target_system: string;
  title: string;
  summary: string;
  suggested_change: any;
  expected_impact: any;
  confidence: number;
  status: string;
  diffs?: any;
  created_at: string;
  created_by: string;
  reviewer?: string;
  reviewed_at?: string;
}

export default function CascadeGovernance() {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('pending');

  useEffect(() => {
    fetchProposals();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('proposals-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'evolution_proposals'
        },
        () => {
          fetchProposals();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [statusFilter]);

  const fetchProposals = async () => {
    try {
      let query = supabase
        .from('evolution_proposals')
        .select('*')
        .order('created_at', { ascending: false });

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data, error } = await query;

      if (error) throw error;
      setProposals(data || []);
    } catch (error) {
      console.error('Error fetching proposals:', error);
      toast.error('Failed to load proposals');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (proposalId: string) => {
    try {
      const { error } = await supabase.functions.invoke('pf-cascade-proposals', {
        body: {
          proposal_id: proposalId,
          action: 'approve',
          reviewer: 'Kenneth Sweet'
        }
      });

      if (error) throw error;

      toast.success('Proposal approved! Ready to apply.');
      fetchProposals();
    } catch (error) {
      console.error('Error approving proposal:', error);
      toast.error('Failed to approve proposal');
    }
  };

  const handleReject = async (proposalId: string) => {
    try {
      const { error } = await supabase.functions.invoke('pf-cascade-proposals', {
        body: {
          proposal_id: proposalId,
          action: 'reject',
          reviewer: 'Kenneth Sweet'
        }
      });

      if (error) throw error;

      toast.success('Proposal rejected');
      fetchProposals();
    } catch (error) {
      console.error('Error rejecting proposal:', error);
      toast.error('Failed to reject proposal');
    }
  };

  const handleApply = async (proposalId: string) => {
    try {
      const { error } = await supabase.functions.invoke('pf-cascade-apply', {
        body: {
          proposal_id: proposalId,
          action: 'apply',
          applied_by: 'Kenneth Sweet'
        }
      });

      if (error) throw error;

      toast.success('Changes applied successfully!');
      fetchProposals();
    } catch (error) {
      console.error('Error applying proposal:', error);
      toast.error('Failed to apply changes');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'approved':
        return <CheckCircle className="w-4 h-4" />;
      case 'rejected':
        return <XCircle className="w-4 h-4" />;
      case 'applied':
        return <Sparkles className="w-4 h-4" />;
      default:
        return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'approved':
        return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'rejected':
        return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'applied':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      default:
        return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <GitBranch className="w-8 h-8" />
            Cascade Governance
          </h1>
          <p className="text-muted-foreground mt-2">
            Review and approve Cascade's optimization proposals. Manual-only control guaranteed.
          </p>
        </div>
      </div>

      <Tabs value={statusFilter} onValueChange={setStatusFilter}>
        <TabsList>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="applied">Applied</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
          <TabsTrigger value="all">All</TabsTrigger>
        </TabsList>

        <TabsContent value={statusFilter} className="space-y-4 mt-6">
          {loading ? (
            <Card>
              <CardContent className="p-8 text-center">
                <div className="animate-pulse">Loading proposals...</div>
              </CardContent>
            </Card>
          ) : proposals.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                No proposals found
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {proposals.map((proposal) => (
                <Card key={proposal.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{proposal.title}</CardTitle>
                        <CardDescription className="mt-1">
                          {proposal.target_system}
                        </CardDescription>
                      </div>
                      <Badge variant="outline" className={getStatusColor(proposal.status)}>
                        <span className="flex items-center gap-1">
                          {getStatusIcon(proposal.status)}
                          {proposal.status}
                        </span>
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">{proposal.summary}</p>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Confidence:</span>
                        <Badge variant="secondary">
                          {(proposal.confidence * 100).toFixed(0)}%
                        </Badge>
                      </div>
                      
                      {proposal.expected_impact && (
                        <div className="text-sm space-y-1">
                          <p className="text-muted-foreground">Expected Impact:</p>
                          <ul className="text-xs space-y-1 ml-4">
                            {Object.entries(proposal.expected_impact).map(([key, value]) => (
                              <li key={key}>• {key}: {String(value)}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 pt-4 border-t">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        onClick={() => setSelectedProposal(proposal)}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                      
                      {proposal.status === 'pending' && (
                        <>
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() => handleApprove(proposal.id)}
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleReject(proposal.id)}
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Reject
                          </Button>
                        </>
                      )}
                      
                      {proposal.status === 'approved' && (
                        <Button
                          size="sm"
                          variant="default"
                          className="flex-1"
                          onClick={() => handleApply(proposal.id)}
                        >
                          <Sparkles className="w-4 h-4 mr-1" />
                          Apply Now
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Proposal Detail Drawer */}
      {selectedProposal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50">
          <div className="fixed right-0 top-0 h-full w-full max-w-2xl bg-background border-l shadow-lg">
            <ScrollArea className="h-full">
              <div className="p-6 space-y-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-2xl font-bold">{selectedProposal.title}</h2>
                    <p className="text-muted-foreground mt-1">
                      {selectedProposal.target_system}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedProposal(null)}
                  >
                    Close
                  </Button>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>{selectedProposal.summary}</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Suggested Changes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <pre className="text-xs bg-muted p-4 rounded-lg overflow-x-auto">
                      {JSON.stringify(selectedProposal.suggested_change, null, 2)}
                    </pre>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Expected Impact</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <pre className="text-xs bg-muted p-4 rounded-lg overflow-x-auto">
                      {JSON.stringify(selectedProposal.expected_impact, null, 2)}
                    </pre>
                  </CardContent>
                </Card>
              </div>
            </ScrollArea>
          </div>
        </div>
      )}
    </div>
  );
}