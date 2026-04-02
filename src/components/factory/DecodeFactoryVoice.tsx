/**
 * DecodeFactoryVoice — DECODE as the Voice of the Factory
 * Three roles: Honest Mechanic, Recommendation Engine, Discovery Commentator
 * Contextual panel that appears on factory pages to explain findings.
 */

import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { 
  MessageCircle, 
  Shield, 
  Wrench, 
  Sparkles, 
  ChevronDown, 
  ChevronUp,
  AlertTriangle,
  CheckCircle2,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export type DecodeVoiceRole = "mechanic" | "recommender" | "commentator";

interface DiagnosticFinding {
  id: string;
  severity: "critical" | "warning" | "info";
  title: string;
  description: string;
  primitiveRecommendation?: string;
}

interface DiscoveryComment {
  id: string;
  discoveryName: string;
  cjpiScore: number;
  commentary: string;
  tier: "Raw" | "Mint" | "Prime" | "Relic" | "Mythic" | "Apex";
}

interface DecodeFactoryVoiceProps {
  role: DecodeVoiceRole;
  /** Diagnostic findings from ENCODE+ORACLE+ENGINEER */
  findings?: DiagnosticFinding[];
  /** Discovery commentary for Showroom browsing */
  discoveries?: DiscoveryComment[];
  /** Primitives recommended after scan */
  recommendedPrimitives?: string[];
  className?: string;
}

const ROLE_CONFIG: Record<DecodeVoiceRole, { 
  icon: typeof MessageCircle; 
  title: string; 
  subtitle: string; 
  accent: string;
}> = {
  mechanic: {
    icon: Wrench,
    title: "The Honest Mechanic",
    subtitle: "DECODE explains what ENCODE found in your code",
    accent: "text-amber-400",
  },
  recommender: {
    icon: Zap,
    title: "Primitive Recommendations",
    subtitle: "DECODE walks you through what each primitive will do",
    accent: "text-primary",
  },
  commentator: {
    icon: Sparkles,
    title: "Discovery Commentary",
    subtitle: "DECODE explains what the Scouts found",
    accent: "text-[hsl(var(--neon-cyan))]",
  },
};

const SEVERITY_CONFIG = {
  critical: { icon: AlertTriangle, color: "text-destructive", bg: "bg-destructive/10", border: "border-destructive/30" },
  warning: { icon: AlertTriangle, color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/30" },
  info: { icon: CheckCircle2, color: "text-[hsl(var(--neon-cyan))]", bg: "bg-[hsl(var(--neon-cyan)/0.1)]", border: "border-[hsl(var(--neon-cyan)/0.3)]" },
} as const;

const TIER_COLORS: Record<string, string> = {
  Raw: "text-muted-foreground",
  Mint: "text-emerald-400",
  Prime: "text-sky-400",
  Relic: "text-amber-400",
  Mythic: "text-purple-400",
  Apex: "text-primary",
};

export function DecodeFactoryVoice({
  role,
  findings = [],
  discoveries = [],
  recommendedPrimitives = [],
  className,
}: DecodeFactoryVoiceProps) {
  const [expanded, setExpanded] = useState(true);
  const config = ROLE_CONFIG[role];
  const Icon = config.icon;

  const toggleExpanded = useCallback(() => setExpanded(prev => !prev), []);

  return (
    <div className={cn(
      "rounded-xl border border-border/40 bg-card/30 backdrop-blur-sm overflow-hidden",
      className,
    )}>
      {/* Header */}
      <button
        onClick={toggleExpanded}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-card/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 border border-primary/20">
            <Icon className={cn("w-4 h-4", config.accent)} />
          </div>
          <div className="text-left">
            <div className="text-sm font-bold text-foreground">{config.title}</div>
            <div className="text-[10px] text-muted-foreground">{config.subtitle}</div>
          </div>
        </div>
        {expanded ? (
          <ChevronUp className="w-4 h-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        )}
      </button>

      {/* Content */}
      {expanded && (
        <div className="px-5 pb-5 space-y-3">
          {/* Mechanic: Show diagnostic findings */}
          {role === "mechanic" && findings.length > 0 && (
            <div className="space-y-2">
              {findings.map((finding) => {
                const sev = SEVERITY_CONFIG[finding.severity];
                const SevIcon = sev.icon;
                return (
                  <div
                    key={finding.id}
                    className={cn("rounded-lg border p-3", sev.bg, sev.border)}
                  >
                    <div className="flex items-start gap-2">
                      <SevIcon className={cn("w-4 h-4 mt-0.5 shrink-0", sev.color)} />
                      <div>
                        <div className={cn("text-xs font-bold", sev.color)}>{finding.title}</div>
                        <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
                          {finding.description}
                        </p>
                        {finding.primitiveRecommendation && (
                          <div className="mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-primary/10 border border-primary/20">
                            <Shield className="w-3 h-3 text-primary" />
                            <span className="text-[10px] font-semibold text-primary">
                              Recommended: {finding.primitiveRecommendation}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Recommender: Show primitive recommendations */}
          {role === "recommender" && recommendedPrimitives.length > 0 && (
            <div>
              <p className="text-xs text-muted-foreground mb-2">
                Based on the scan, DECODE recommends running these primitives against your code:
              </p>
              <div className="flex flex-wrap gap-1.5">
                {recommendedPrimitives.map((primitive) => (
                  <span
                    key={primitive}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-primary/10 border border-primary/20 text-[11px] font-semibold text-primary"
                  >
                    <Zap className="w-3 h-3" />
                    {primitive}
                  </span>
                ))}
              </div>
              <p className="text-[10px] text-muted-foreground/60 mt-2">
                Select up to 20 primitives. The scan team has ranked these by predicted impact.
              </p>
            </div>
          )}

          {/* Commentator: Show discovery commentary */}
          {role === "commentator" && discoveries.length > 0 && (
            <div className="space-y-2">
              {discoveries.map((discovery) => (
                <div
                  key={discovery.id}
                  className="rounded-lg border border-border/30 bg-card/20 p-3"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-foreground">{discovery.discoveryName}</span>
                    <span className={cn("text-[10px] font-bold uppercase tracking-wider", TIER_COLORS[discovery.tier] ?? "text-muted-foreground")}>
                      {discovery.tier} · {discovery.cjpiScore}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    {discovery.commentary}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Empty state */}
          {role === "mechanic" && findings.length === 0 && (
            <div className="text-center py-6">
              <MessageCircle className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-xs text-muted-foreground">Upload your code and DECODE will explain the diagnostic results.</p>
            </div>
          )}
          {role === "commentator" && discoveries.length === 0 && (
            <div className="text-center py-6">
              <Sparkles className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-xs text-muted-foreground">Select a discovery to hear DECODE's commentary.</p>
            </div>
          )}

          {/* Open full DECODE chat */}
          <div className="pt-2 border-t border-border/20">
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-xs text-muted-foreground hover:text-foreground"
              onClick={() => {
                const { open } = (window as any).__decodeStore?.getState?.() ?? {};
                if (open) open("assistant");
              }}
            >
              <MessageCircle className="w-3 h-3 mr-1.5" />
              Ask DECODE a question
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
