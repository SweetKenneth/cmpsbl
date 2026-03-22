/**
 * CodeAgent v3 - PR Queue Panel
 * Review and approve/reject pending patches
 */

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { 
  GitPullRequest, 
  Check, 
  X, 
  Clock, 
  FileCode,
  ChevronDown,
  ChevronRight,
  AlertTriangle,
  Rocket
} from 'lucide-react';
import { 
  getPendingPRs, 
  getAllPRs, 
  approvePR, 
  rejectPR, 
  markDeployed,
  rollbackPR,
  PRPatch 
} from '@/lib/codeagent/pr-queue';
import { DiffViewer } from './DiffViewer';
import { toast } from 'sonner';

interface PRQueuePanelProps {
  onDeploy?: (pr: PRPatch) => Promise<void>;
}

export function PRQueuePanel({ onDeploy }: PRQueuePanelProps) {
  const [prs, setPrs] = useState<PRPatch[]>([]);
  const [selectedPR, setSelectedPR] = useState<string | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'deployed'>('pending');
  
  useEffect(() => {
    loadPRs();
  }, []);
  
  const loadPRs = () => {
    const allPRs = getAllPRs();
    setPrs(allPRs);
  };
  
  const filteredPRs = prs.filter(pr => {
    if (filter === 'all') return true;
    if (filter === 'pending') return pr.status === 'pending';
    if (filter === 'approved') return pr.status === 'approved';
    if (filter === 'deployed') return pr.status === 'deployed';
    return true;
  });
  
  const handleApprove = async (prId: string) => {
    const pr = await approvePR(prId, reviewNotes);
    if (pr) {
      toast.success('PR approved');
      setReviewNotes('');
      loadPRs();
    }
  };
  
  const handleReject = async (prId: string) => {
    if (!reviewNotes.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }
    const pr = await rejectPR(prId, reviewNotes);
    if (pr) {
      toast.info('PR rejected');
      setReviewNotes('');
      loadPRs();
    }
  };
  
  const handleDeploy = async (pr: PRPatch) => {
    try {
      if (onDeploy) {
        await onDeploy(pr);
      }
      await markDeployed(pr.id);
      toast.success('PR deployed successfully');
      loadPRs();
    } catch (e) {
      toast.error('Deployment failed');
    }
  };
  
  const handleRollback = async (prId: string) => {
    const success = await rollbackPR(prId);
    if (success) {
      toast.info('PR rolled back');
      loadPRs();
    }
  };
  
  const getStatusColor = (status: PRPatch['status']) => {
    switch (status) {
      case 'pending': return 'bg-neon-amber/10 text-neon-amber border-neon-amber/30';
      case 'approved': return 'bg-neon-green/10 text-neon-green border-neon-green/30';
      case 'rejected': return 'bg-destructive/10 text-destructive border-destructive/30';
      case 'deployed': return 'bg-neon-blue/10 text-neon-blue border-neon-blue/30';
      case 'rolled_back': return 'bg-muted text-muted-foreground';
      default: return '';
    }
  };
  
  const pendingCount = prs.filter(p => p.status === 'pending').length;
  
  return (
    <Card className="border-border/50 bg-card/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GitPullRequest className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">PR Queue</CardTitle>
            {pendingCount > 0 && (
              <Badge variant="outline" className="bg-neon-amber/10 text-neon-amber">
                {pendingCount} pending
              </Badge>
            )}
          </div>
          
          <div className="flex gap-1">
            {(['pending', 'approved', 'deployed', 'all'] as const).map(f => (
              <Button
                key={f}
                variant={filter === f ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setFilter(f)}
                className="text-xs h-7"
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <ScrollArea className="h-[500px]">
          {filteredPRs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <GitPullRequest className="h-8 w-8 mb-3 opacity-40" />
              <p className="text-sm">No {filter !== 'all' ? filter : ''} PRs</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredPRs.map(pr => (
                <div 
                  key={pr.id}
                  className="border border-border/50 rounded-lg overflow-hidden"
                >
                  <button
                    onClick={() => setSelectedPR(selectedPR === pr.id ? null : pr.id)}
                    className="w-full flex items-center justify-between p-3 hover:bg-muted/30 transition-colors text-left"
                  >
                    <div className="flex items-center gap-3">
                      {selectedPR === pr.id ? (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      )}
                      <div>
                        <h4 className="font-medium text-sm">{pr.title}</h4>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {pr.filesChanged.length} files • +{pr.additions} -{pr.deletions}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={getStatusColor(pr.status)}>
                        {pr.status}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        <Clock className="h-3 w-3 inline mr-1" />
                        {new Date(pr.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </button>
                  
                  {selectedPR === pr.id && (
                    <div className="border-t border-border/50 p-3 space-y-3">
                      <p className="text-sm text-muted-foreground">{pr.description}</p>
                      
                      {pr.validationErrors && pr.validationErrors.length > 0 && (
                        <div className="flex items-start gap-2 p-2 rounded bg-neon-amber/10 border border-neon-amber/30">
                          <AlertTriangle className="h-4 w-4 text-neon-amber mt-0.5" />
                          <div className="text-xs text-neon-amber">
                            <strong>Validation warnings:</strong>
                            <ul className="mt-1 space-y-0.5">
                              {pr.validationErrors.map((err, i) => (
                                <li key={i}>• {err}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      )}
                      
                      <div className="text-xs text-muted-foreground">
                        <FileCode className="h-3 w-3 inline mr-1" />
                        Files: {pr.filesChanged.join(', ')}
                      </div>
                      
                      <DiffViewer diff={pr.diff} />
                      
                      {pr.status === 'pending' && (
                        <div className="space-y-2 pt-2">
                          <Textarea
                            placeholder="Review notes (required for rejection)..."
                            value={reviewNotes}
                            onChange={(e) => setReviewNotes(e.target.value)}
                            className="min-h-[60px] text-sm"
                          />
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleApprove(pr.id)}
                              className="bg-neon-green hover:bg-emerald-700"
                            >
                              <Check className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleReject(pr.id)}
                            >
                              <X className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                          </div>
                        </div>
                      )}
                      
                      {pr.status === 'approved' && (
                        <div className="pt-2">
                          <Button
                            size="sm"
                            onClick={() => handleDeploy(pr)}
                            className="bg-neon-blue hover:bg-blue-700"
                          >
                            <Rocket className="h-4 w-4 mr-1" />
                            Deploy Now
                          </Button>
                        </div>
                      )}
                      
                      {pr.status === 'deployed' && pr.rollbackId && (
                        <div className="pt-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRollback(pr.id)}
                          >
                            Rollback
                          </Button>
                        </div>
                      )}
                      
                      {pr.reviewNotes && (
                        <div className="text-xs text-muted-foreground italic border-l-2 border-muted pl-2">
                          "{pr.reviewNotes}"
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

export default PRQueuePanel;
