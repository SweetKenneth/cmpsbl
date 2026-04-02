import { Target, Clock, DollarSign, ArrowRight, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { BountyPriority } from '@/lib/factory/bounty-board';

interface BountyPreview {
  title: string;
  description: string;
  budgetDisplay: string;
  priority: BountyPriority;
  requirementCount: number;
  candidateCount: number;
  daysLeft: number;
}

const SAMPLE_BOUNTIES: BountyPreview[] = [
  {
    title: 'Zero-Trust API Gateway',
    description: 'Need a governance-wrapped API gateway with automatic threat detection and compliance logging.',
    budgetDisplay: '$250',
    priority: 'urgent',
    requirementCount: 4,
    candidateCount: 0,
    daysLeft: 14,
  },
  {
    title: 'GDPR Data Partitioner',
    description: 'Sovereign data partitioning that auto-classifies PII and routes to jurisdiction-correct storage.',
    budgetDisplay: '$180',
    priority: 'priority',
    requirementCount: 3,
    candidateCount: 0,
    daysLeft: 30,
  },
  {
    title: 'Agent Memory Persistence',
    description: 'Persistent memory layer for LLM agents that survives session boundaries with audit trails.',
    budgetDisplay: '$120',
    priority: 'standard',
    requirementCount: 2,
    candidateCount: 0,
    daysLeft: 60,
  },
];

const PRIORITY_STYLES: Record<BountyPriority, string> = {
  standard: 'bg-muted/50 text-muted-foreground',
  priority: 'bg-amber-500/10 text-amber-400',
  urgent: 'bg-red-500/10 text-red-400',
};

export function BountyBoard() {
  return (
    <div className="space-y-8">
      {/* Hero */}
      <div className="text-center space-y-3">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">
          The Bounty Board
        </h2>
        <p className="text-muted-foreground max-w-lg mx-auto">
          Post what you need. The substrate builds it. Rejected candidates become catalog inventory.
        </p>
        <p className="text-xs text-muted-foreground">
          15% platform fee · Minimum $50 bounty · 90-day maximum
        </p>
      </div>

      {/* Bounty List */}
      <div className="space-y-4">
        {SAMPLE_BOUNTIES.map((bounty) => (
          <Card key={bounty.title} className="border-border/50 hover:border-primary/30 transition-colors">
            <CardContent className="pt-5 pb-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-foreground text-sm">{bounty.title}</h3>
                    <Badge variant="outline" className={PRIORITY_STYLES[bounty.priority]}>
                      {bounty.priority}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2">{bounty.description}</p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Target className="h-3 w-3" />
                      {bounty.requirementCount} requirements
                    </span>
                    <span className="flex items-center gap-1">
                      <Search className="h-3 w-3" />
                      {bounty.candidateCount} candidates
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {bounty.daysLeft}d left
                    </span>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-lg font-bold text-emerald-400">{bounty.budgetDisplay}</p>
                  <p className="text-[10px] text-muted-foreground">bounty</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* How Rejected Candidates Work */}
      <Card className="border-border/50 bg-card/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">What happens to rejected candidates?</CardTitle>
        </CardHeader>
        <CardContent className="text-xs text-muted-foreground space-y-1">
          <p>• CJPI ≥ 68 → Listed in the Showroom at graduated pricing</p>
          <p>• CJPI &lt; 68 → Sent to the Junkyard for free picks</p>
          <p className="text-primary/80 pt-1">Nothing the substrate builds is ever wasted.</p>
        </CardContent>
      </Card>

      {/* CTAs */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button size="lg" className="gap-2">
          <DollarSign className="h-4 w-4" />
          Post a Bounty
          <ArrowRight className="h-4 w-4" />
        </Button>
        <Button size="lg" variant="outline" className="gap-2">
          <Search className="h-4 w-4" />
          Browse Open Bounties
        </Button>
      </div>
    </div>
  );
}
