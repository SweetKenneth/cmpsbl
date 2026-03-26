/**
 * FeatureSuggestions — AI-generated feature & function suggestions
 * Part of the Evolution Control Center
 */

import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Lightbulb, Loader2, CheckCircle, XCircle, Clock,
  Code, Layers, Zap, ChevronDown, ChevronUp, Sparkles
} from 'lucide-react';
import { toast } from 'sonner';
import {
  generateSuggestions, storeSuggestions, listSuggestions, updateSuggestionStatus,
  type FeatureSuggestion, type SuggestionCategory
} from '@/lib/evolve/feature-suggestion-engine';
import { cn } from '@/lib/utils';

// ── Category Icons ─────────────────────────────────────────

const CATEGORY_CONFIG: Record<SuggestionCategory, { icon: typeof Code; label: string; color: string }> = {
  resolver:        { icon: Layers, label: 'Resolver', color: 'text-blue-400' },
  hook:            { icon: Code, label: 'Hook', color: 'text-purple-400' },
  'edge-function': { icon: Zap, label: 'Edge Fn', color: 'text-amber-400' },
  'ui-feature':    { icon: Sparkles, label: 'UI Feature', color: 'text-emerald-400' },
  integration:     { icon: Layers, label: 'Integration', color: 'text-cyan-400' },
  optimization:    { icon: Zap, label: 'Optimization', color: 'text-orange-400' },
};

// ── Effort Badge ───────────────────────────────────────────

function EffortBadge({ effort }: { effort: string }) {
  const colors: Record<string, string> = {
    trivial: 'text-emerald-400 bg-emerald-400/10',
    small: 'text-blue-400 bg-blue-400/10',
    medium: 'text-amber-400 bg-amber-400/10',
    large: 'text-red-400 bg-red-400/10',
  };
  return (
    <span className={cn('px-2 py-0.5 rounded text-[10px] font-mono', colors[effort] || colors.medium)}>
      {effort}
    </span>
  );
}

// ── Suggestion Card ────────────────────────────────────────

function SuggestionCard({ 
  suggestion, 
  onAction 
}: { 
  suggestion: FeatureSuggestion; 
  onAction: (id: string, action: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const cat = CATEGORY_CONFIG[suggestion.category] || CATEGORY_CONFIG.optimization;
  const CatIcon = cat.icon;

  return (
    <Card className="border-border/30 bg-card/60">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1 flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <CatIcon className={cn('w-3.5 h-3.5', cat.color)} />
              <Badge variant="outline" className="text-[10px]">{cat.label}</Badge>
              <EffortBadge effort={suggestion.estimatedEffort} />
              <Badge 
                variant={suggestion.status === 'accepted' ? 'default' : suggestion.status === 'rejected' ? 'destructive' : 'outline'} 
                className="text-[10px]"
              >
                {suggestion.status}
              </Badge>
            </div>
            <CardTitle className="text-sm">{suggestion.title}</CardTitle>
            <p className="text-[10px] text-muted-foreground font-mono">
              {suggestion.targetModule} • score {(suggestion.compositeScore * 100).toFixed(0)}% • {suggestion.model}
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setExpanded(!expanded)}>
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </Button>
        </div>
      </CardHeader>

      {expanded && (
        <CardContent className="pt-0 space-y-3">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground font-medium">Description</p>
            <p className="text-xs text-foreground/80">{suggestion.description}</p>
          </div>

          <div className="space-y-1">
            <p className="text-xs text-muted-foreground font-medium">Rationale</p>
            <p className="text-xs text-foreground/80 bg-muted/30 rounded-lg p-3 font-mono">
              {suggestion.rationale}
            </p>
          </div>

          {/* Scores */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-muted/20 rounded-lg p-2">
              <p className="text-[10px] text-muted-foreground">Impact</p>
              <p className="text-sm font-mono font-bold text-foreground">
                {(suggestion.impactScore * 100).toFixed(0)}%
              </p>
            </div>
            <div className="bg-muted/20 rounded-lg p-2">
              <p className="text-[10px] text-muted-foreground">Novelty</p>
              <p className="text-sm font-mono font-bold text-foreground">
                {(suggestion.noveltyScore * 100).toFixed(0)}%
              </p>
            </div>
            <div className="bg-muted/20 rounded-lg p-2">
              <p className="text-[10px] text-muted-foreground">Feasibility</p>
              <p className="text-sm font-mono font-bold text-foreground">
                {(suggestion.feasibilityScore * 100).toFixed(0)}%
              </p>
            </div>
          </div>

          {/* Files */}
          {suggestion.suggestedFiles.length > 0 && (
            <div className="space-y-1">
              <p className="text-[10px] text-muted-foreground font-medium">Suggested Files</p>
              <div className="flex flex-wrap gap-1">
                {suggestion.suggestedFiles.map((f, i) => (
                  <span key={i} className="text-[9px] font-mono bg-muted/30 rounded px-1.5 py-0.5">{f}</span>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          {suggestion.status === 'new' && (
            <div className="flex gap-2">
              <Button size="sm" onClick={() => onAction(suggestion.id, 'accept')} className="flex-1">
                <CheckCircle className="w-3 h-3 mr-1" /> Accept
              </Button>
              <Button size="sm" variant="outline" onClick={() => onAction(suggestion.id, 'defer')}>
                <Clock className="w-3 h-3 mr-1" /> Defer
              </Button>
              <Button size="sm" variant="destructive" onClick={() => onAction(suggestion.id, 'reject')}>
                <XCircle className="w-3 h-3 mr-1" /> Reject
              </Button>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}

// ── Main Component ─────────────────────────────────────────

export function FeatureSuggestions() {
  const [suggestions, setSuggestions] = useState<FeatureSuggestion[]>(() => listSuggestions());
  const [generating, setGenerating] = useState(false);
  const [focusArea, setFocusArea] = useState('');

  const refresh = useCallback(() => setSuggestions(listSuggestions()), []);

  const handleGenerate = async () => {
    setGenerating(true);
    toast.info('Querying NEXUS for feature suggestions...');

    try {
      const results = await generateSuggestions(focusArea || undefined);
      if (results.length === 0) {
        toast.warning('No suggestions generated — NEXUS may be rate-limited');
        return;
      }
      storeSuggestions(results);
      refresh();
      toast.success(`${results.length} suggestions generated via NEXUS fleet`);
    } catch {
      toast.error('Suggestion generation failed');
    } finally {
      setGenerating(false);
    }
  };

  const handleAction = (id: string, action: string) => {
    const statusMap: Record<string, FeatureSuggestion['status']> = {
      accept: 'accepted',
      reject: 'rejected',
      defer: 'deferred',
    };
    const newStatus = statusMap[action];
    if (!newStatus) return;
    updateSuggestionStatus(id, newStatus);
    refresh();
    toast.success(`Suggestion ${action}ed`);
  };

  return (
    <div className="space-y-4">
      {/* Generator */}
      <Card className="border-border/30 bg-card/60">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-amber-400" />
            Feature Suggestion Engine
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-xs text-muted-foreground">
            The system analyzes substrate topology, telemetry gaps, and codebase patterns to suggest new functions, resolvers, and features. Runs through NEXUS free-tier fleet (≤$0.05/run).
          </p>

          <Input
            placeholder="Optional focus area (e.g. 'telemetry hooks', 'defense resolvers')"
            value={focusArea}
            onChange={e => setFocusArea(e.target.value)}
            className="text-xs"
          />

          <Button
            onClick={handleGenerate}
            disabled={generating}
            className="w-full"
            size="sm"
          >
            {generating ? (
              <><Loader2 className="w-3 h-3 mr-1 animate-spin" /> Generating via NEXUS fleet...</>
            ) : (
              <><Lightbulb className="w-3 h-3 mr-1" /> Suggest New Features</>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Suggestions List */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" /> Suggestions
          {suggestions.length > 0 && (
            <Badge variant="secondary" className="text-[10px]">{suggestions.length}</Badge>
          )}
        </h3>

        {suggestions.length === 0 ? (
          <div className="text-center py-8 text-xs text-muted-foreground">
            <Lightbulb className="w-6 h-6 mx-auto mb-2 opacity-30" />
            No suggestions yet. Click above to generate.
          </div>
        ) : (
          suggestions.map(s => (
            <SuggestionCard key={s.id} suggestion={s} onAction={handleAction} />
          ))
        )}
      </div>
    </div>
  );
}
