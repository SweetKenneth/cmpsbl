import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface ActionProposal {
  id: string;
  proposal_title: string;
  proposal_detail: any;
  expected_impact: any;
  status: string;
  created_at: string;
}

export default function DecisionCenter() {
  const [busy, setBusy] = useState(false);

  const { data: proposals, refetch } = useQuery({
    queryKey: ['action-proposals'],
    queryFn: async () => {
      // Use direct SQL query to bypass type checking for new table
      const { data, error } = await supabase.rpc('get_action_proposals' as any) as any;
      
      if (error) {
        // Fallback: try direct query
        const result = await (supabase as any)
          .from('brain_actions_queue')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(20);
        
        if (result.error) throw result.error;
        return (result.data || []) as ActionProposal[];
      }
      
      return (data || []) as ActionProposal[];
    },
    refetchInterval: 30000,
  });

  async function updateStatus(id: string, status: string) {
    setBusy(true);
    
    try {
      const { error } = await (supabase as any)
        .from('brain_actions_queue')
        .update({ 
          status,
          approved_by: 'admin',
          approved_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;
      toast.success(`Proposal ${status}`);
      refetch();
    } catch (error) {
      toast.error('Failed to update status');
      console.error(error);
    } finally {
      setBusy(false);
    }
  }

  async function executeAction(id: string) {
    setBusy(true);
    
    try {
      const { error } = await supabase.functions.invoke('pf-brain-act', {
        body: { id }
      });

      if (error) throw error;
      toast.success('Action executed');
      refetch();
    } catch (error) {
      toast.error('Execution failed');
      console.error(error);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-border/50 p-6">
      <h3 className="text-xl font-bold text-foreground mb-4">Decision Center</h3>
      
      <div className="space-y-4">
        {(proposals || []).map((p: ActionProposal) => (
          <div key={p.id} className="p-4 rounded-lg bg-background/50 border border-border/50">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <h4 className="font-semibold text-foreground">{p.proposal_title}</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  Expected: {p.expected_impact?.metric} {p.expected_impact?.lift > 0 ? '+' : ''}{p.expected_impact?.lift}
                </p>
              </div>
              <span className={`text-xs px-2 py-1 rounded ${
                p.status === 'approved' ? 'bg-neon-green/20 text-neon-green' :
                p.status === 'executed' ? 'bg-neon-blue/20 text-neon-blue' :
                p.status === 'rejected' ? 'bg-destructive/20 text-destructive' :
                'bg-neon-amber/20 text-neon-amber'
              }`}>
                {p.status}
              </span>
            </div>

            <div className="flex gap-2 mt-3">
              <Button 
                size="sm"
                variant="outline"
                disabled={busy || p.status !== 'proposed'}
                onClick={() => updateStatus(p.id, 'approved')}
                className="text-xs"
              >
                Approve
              </Button>
              <Button 
                size="sm"
                variant="outline"
                disabled={busy || p.status !== 'proposed'}
                onClick={() => updateStatus(p.id, 'rejected')}
                className="text-xs"
              >
                Reject
              </Button>
              <Button 
                size="sm"
                disabled={busy || p.status !== 'approved'}
                onClick={() => executeAction(p.id)}
                className="text-xs"
              >
                Execute
              </Button>
            </div>
          </div>
        ))}

        {(!proposals || proposals.length === 0) && (
          <p className="text-sm text-muted-foreground text-center py-8">
            No action proposals yet. Brain will generate proposals based on insights.
          </p>
        )}
      </div>
    </Card>
  );
}
