/**
 * PricingEvidencePanel — Expandable panel showing per-provider pricing estimates
 * and consensus computation details for artifact detail views.
 */
import { useState } from 'react';
import { ChevronDown, ChevronRight, CheckCircle2, XCircle, AlertTriangle, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { formatPrice, confidenceLabel, pricingSourceLabel } from '@/lib/foundry/pricing-engine';
import type { PricingEvidence } from '@/lib/foundry/consensus-pricing';
import { Link } from 'react-router-dom';

interface PricingEvidencePanelProps {
  evidence: PricingEvidence;
  pricingSource: string;
  recommendedPrice: number;
  confidence: number;
  compact?: boolean;
}

export function PricingEvidencePanel({
  evidence,
  pricingSource,
  recommendedPrice,
  confidence,
  compact = false,
}: PricingEvidencePanelProps) {
  const [expanded, setExpanded] = useState(false);

  const successCount = evidence.providers_used.length;
  const failedCount = evidence.providers_failed.length;
  const outlierCount = evidence.outliers_rejected.length;

  return (
    <div className="border border-border/50 rounded-lg overflow-hidden bg-card/50">
      {/* Header - always visible */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-3 py-2 text-sm hover:bg-muted/30 transition-colors"
      >
        <div className="flex items-center gap-2">
          {expanded ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
          <span className="font-medium text-foreground">How this price was determined</span>
          <Badge variant="outline" className="text-xs">
            {pricingSourceLabel(pricingSource)}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            variant={confidence >= 0.7 ? 'default' : confidence >= 0.4 ? 'secondary' : 'outline'}
            className="text-xs"
          >
            {confidenceLabel(confidence)} Confidence
          </Badge>
          {!compact && (
            <span className="text-xs text-muted-foreground">
              {successCount}/{successCount + failedCount} providers
            </span>
          )}
        </div>
      </button>

      {/* Expanded content */}
      {expanded && (
        <div className="px-3 pb-3 space-y-3 border-t border-border/30">
          {/* Provider estimates */}
          <div className="mt-3">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Provider Estimates
            </h4>
            <div className="space-y-1.5">
              {evidence.providers.map((p) => (
                <div
                  key={p.provider}
                  className={`flex items-center justify-between text-sm px-2 py-1.5 rounded ${
                    p.excluded_as_outlier
                      ? 'bg-destructive/10 line-through opacity-60'
                      : p.success
                      ? 'bg-muted/30'
                      : 'bg-muted/10 opacity-50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {p.success ? (
                      p.excluded_as_outlier ? (
                        <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                      ) : (
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                      )
                    ) : (
                      <XCircle className="h-3.5 w-3.5 text-destructive" />
                    )}
                    <span className="font-mono text-xs">{providerDisplayName(p.provider)}</span>
                  </div>
                  <div className="text-xs text-right">
                    {p.success ? (
                      <span className={p.excluded_as_outlier ? 'text-muted-foreground' : 'text-foreground'}>
                        {formatPrice(p.price_range_low)} – {formatPrice(p.price_range_high)}
                        <span className="text-muted-foreground ml-1">
                          (mid: {formatPrice(p.estimated_mid_price)})
                        </span>
                      </span>
                    ) : (
                      <span className="text-destructive text-xs">{p.error || 'Failed'}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Consensus result */}
          {evidence.consensus_mid !== null && (
            <div className="bg-primary/5 border border-primary/20 rounded px-2 py-1.5">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-primary">Consensus Market Estimate</span>
                <span className="font-bold text-primary">{formatPrice(evidence.consensus_mid)}</span>
              </div>
            </div>
          )}

          {/* Formula breakdown */}
          <div>
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Pricing Formula
            </h4>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="bg-muted/30 rounded p-2 text-center">
                <div className="text-muted-foreground">Internal Value</div>
                <div className="font-bold">{formatPrice(evidence.internal_value_contribution)}</div>
                <div className="text-muted-foreground">{Math.round(evidence.formula_weights.internal * 100)}% weight</div>
              </div>
              <div className="bg-muted/30 rounded p-2 text-center">
                <div className="text-muted-foreground">Market Consensus</div>
                <div className="font-bold">{evidence.consensus_mid ? formatPrice(evidence.consensus_mid) : '—'}</div>
                <div className="text-muted-foreground">{Math.round(evidence.formula_weights.consensus_market * 100)}% weight</div>
              </div>
              <div className="bg-muted/30 rounded p-2 text-center">
                <div className="text-muted-foreground">CJPI Premium</div>
                <div className="font-bold">{evidence.cjpi_contribution}×</div>
                <div className="text-muted-foreground">{Math.round(evidence.formula_weights.cjpi_premium * 100)}% weight</div>
              </div>
            </div>
          </div>

          {/* Outliers */}
          {outlierCount > 0 && (
            <div className="text-xs text-amber-600 dark:text-amber-400">
              <AlertTriangle className="h-3 w-3 inline mr-1" />
              {outlierCount} outlier{outlierCount > 1 ? 's' : ''} excluded: {evidence.outliers_rejected.join(', ')}
            </div>
          )}

          {/* Final price */}
          <div className="flex items-center justify-between text-sm pt-1 border-t border-border/30">
            <span className="font-medium">Recommended Price</span>
            <span className="font-bold text-lg">{formatPrice(recommendedPrice)}</span>
          </div>

          {/* Methodology link */}
          <div className="text-center pt-1">
            <Link
              to="/pricing-method"
              className="text-xs text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-1"
            >
              How our pricing works <ExternalLink className="h-3 w-3" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

function providerDisplayName(id: string): string {
  switch (id) {
    case 'claude-haiku': return 'Claude Haiku 4.5';
    case 'openai-mini': return 'OpenAI GPT-4o-mini';
    case 'groq-llama': return 'Groq Llama 3.3';
    case 'openrouter-qwen': return 'OpenRouter Qwen3 80B';
    default: return id;
  }
}

export default PricingEvidencePanel;
