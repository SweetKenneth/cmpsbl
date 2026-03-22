/**
 * FalsePositiveFeedback — Let users flag findings and provide feedback
 * Integrates with the scan-run-identity suppression system
 */

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { 
  MessageSquareWarning, CheckCircle, XCircle, HelpCircle, 
  Flag, ThumbsUp, ThumbsDown, Search
} from 'lucide-react';
import { useSubmitFindingFeedback, useFindingFeedback } from '@/hooks/useEvolutionControlCenter';

// Sample findings (in production, these come from the latest scan)
const SAMPLE_FINDINGS = [
  { fingerprint: 'missing-retry-wrapper:nexus', title: 'Missing retry wrapper on NEXUS provider calls', severity: 'warning', category: 'resilience' },
  { fingerprint: 'stale-circuit-config:evolution', title: 'Stale safety switch configuration detected', severity: 'info', category: 'config' },
  { fingerprint: 'unhandled-edge-timeout:relay', title: 'Unhandled timeout in RELAY webhook delivery', severity: 'error', category: 'reliability' },
  { fingerprint: 'orphaned-migration:schema', title: 'Orphaned migration file detected', severity: 'info', category: 'cleanup' },
  { fingerprint: 'missing-rls:new-table', title: 'Table missing Row Level Security policy', severity: 'error', category: 'security' },
];

const VERDICT_CONFIG = {
  true_positive: { icon: ThumbsUp, label: 'Confirmed', color: 'bg-neon-green/20 text-neon-green', description: 'This is a real issue that should be fixed' },
  false_positive: { icon: ThumbsDown, label: 'False Positive', color: 'bg-neon-amber/20 text-neon-amber', description: 'This finding is not applicable to our system' },
  needs_review: { icon: HelpCircle, label: 'Needs Review', color: 'bg-neon-blue/20 text-neon-blue', description: 'Unsure — needs a closer look before deciding' },
} as const;

const SEVERITY_COLORS: Record<string, string> = {
  error: 'bg-destructive/20 text-destructive',
  warning: 'bg-neon-amber/20 text-neon-amber',
  info: 'bg-neon-blue/20 text-neon-blue',
};

export function FalsePositiveFeedback() {
  const [selectedFinding, setSelectedFinding] = useState<string | null>(null);
  const [reason, setReason] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const submitMutation = useSubmitFindingFeedback();
  const { data: feedbackList = [] } = useFindingFeedback();

  const feedbackMap = new Map(feedbackList.map(f => [f.finding_fingerprint, f]));

  const filteredFindings = SAMPLE_FINDINGS.filter(f => 
    !searchQuery || 
    f.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSubmit = (fingerprint: string, title: string, verdict: 'true_positive' | 'false_positive' | 'needs_review') => {
    submitMutation.mutate({
      finding_fingerprint: fingerprint,
      finding_title: title,
      verdict,
      reason: reason || undefined,
    });
    setSelectedFinding(null);
    setReason('');
  };

  const feedbackStats = {
    total: feedbackList.length,
    confirmed: feedbackList.filter(f => f.verdict === 'true_positive').length,
    falsePositive: feedbackList.filter(f => f.verdict === 'false_positive').length,
    needsReview: feedbackList.filter(f => f.verdict === 'needs_review').length,
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-foreground">Finding Feedback</h3>
        <p className="text-sm text-muted-foreground">Flag false positives so the scanner learns and stops repeating them</p>
      </div>

      {/* Stats */}
      {feedbackStats.total > 0 && (
        <div className="flex items-center gap-3 flex-wrap">
          <Badge variant="outline" className="text-xs">
            <ThumbsUp className="w-3 h-3 mr-1" />
            {feedbackStats.confirmed} confirmed
          </Badge>
          <Badge variant="outline" className="text-xs">
            <ThumbsDown className="w-3 h-3 mr-1" />
            {feedbackStats.falsePositive} false positives
          </Badge>
          <Badge variant="outline" className="text-xs">
            <HelpCircle className="w-3 h-3 mr-1" />
            {feedbackStats.needsReview} needs review
          </Badge>
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search findings..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-3 py-2 bg-muted/50 border border-border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>

      {/* Findings List */}
      <div className="space-y-2">
        {filteredFindings.map(finding => {
          const existing = feedbackMap.get(finding.fingerprint);
          const isSelected = selectedFinding === finding.fingerprint;
          const verdictConfig = existing ? VERDICT_CONFIG[existing.verdict] : null;

          return (
            <Card 
              key={finding.fingerprint} 
              className={`p-3 transition-colors ${isSelected ? 'ring-1 ring-primary' : ''}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2 min-w-0">
                  <Flag className="w-4 h-4 mt-0.5 flex-shrink-0 text-muted-foreground" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{finding.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className={`text-[10px] ${SEVERITY_COLORS[finding.severity] ?? 'bg-muted text-muted-foreground'}`}>
                        {finding.severity}
                      </Badge>
                      <span className="text-[10px] text-muted-foreground">{finding.category}</span>
                    </div>
                  </div>
                </div>

                {existing ? (
                  <Badge className={`text-[10px] flex-shrink-0 ${verdictConfig?.color}`}>
                    {verdictConfig && <verdictConfig.icon className="w-3 h-3 mr-1" />}
                    {verdictConfig?.label}
                  </Badge>
                ) : (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setSelectedFinding(isSelected ? null : finding.fingerprint)}
                    className="flex-shrink-0 text-xs"
                  >
                    <MessageSquareWarning className="w-3.5 h-3.5 mr-1" />
                    Review
                  </Button>
                )}
              </div>

              {isSelected && !existing && (
                <div className="mt-3 pt-3 border-t border-border/50 space-y-3">
                  <Textarea
                    placeholder="Optional: explain why this is or isn't a real issue..."
                    value={reason}
                    onChange={e => setReason(e.target.value)}
                    rows={2}
                    className="text-xs"
                  />
                  <div className="flex flex-wrap gap-2">
                    {(Object.entries(VERDICT_CONFIG) as [keyof typeof VERDICT_CONFIG, typeof VERDICT_CONFIG[keyof typeof VERDICT_CONFIG]][]).map(([key, config]) => (
                      <Button
                        key={key}
                        variant="outline"
                        size="sm"
                        onClick={() => handleSubmit(finding.fingerprint, finding.title, key)}
                        disabled={submitMutation.isPending}
                        className="text-xs"
                      >
                        <config.icon className="w-3.5 h-3.5 mr-1.5" />
                        {config.label}
                      </Button>
                    ))}
                  </div>
                  <p className="text-[10px] text-muted-foreground">
                    Your feedback trains the scanner to suppress false positives in future scans.
                  </p>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
