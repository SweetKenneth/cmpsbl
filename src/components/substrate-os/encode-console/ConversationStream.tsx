/**
 * Conversation Stream — Left panel of ENCODE console
 * Displays USER / DECODE / ENCODE / SYSTEM messages, plans, and execution logs.
 */

import { useRef, useEffect } from 'react';
import { Bot, User, Cpu, Shield, CheckCircle2, XCircle, Clock, Layers, Zap, Brain } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import type { ConversationMessage } from '@/lib/substrate/encode-module/orchestration';
import type { PatchPlan } from '@/lib/substrate/plans/types';

interface ConversationStreamProps {
  messages: ConversationMessage[];
  plans: PatchPlan[];
  systemMessages: Array<{ type: 'info' | 'warning' | 'error' | 'success'; text: string; ts: string }>;
}

const ROLE_CONFIG: Record<string, { icon: React.ElementType; label: string; color: string; bg: string }> = {
  user: { icon: User, label: 'USER', color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
  decode: { icon: Cpu, label: 'DECODE', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
  encode: { icon: Bot, label: 'ENCODE', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
  system: { icon: Shield, label: 'SYSTEM', color: 'text-muted-foreground', bg: 'bg-muted/30 border-border/20' },
};

export function ConversationStream({ messages, plans, systemMessages }: ConversationStreamProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length, systemMessages.length]);

  const combined = [
    ...messages.map(m => ({ type: 'message' as const, data: m, ts: m.timestamp })),
    ...systemMessages.map(s => ({ type: 'system' as const, data: s, ts: s.ts })),
  ].sort((a, b) => new Date(a.ts).getTime() - new Date(b.ts).getTime());

  if (combined.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center space-y-3 max-w-sm">
          <Bot className="w-10 h-10 text-primary/20 mx-auto" />
          <p className="text-sm font-mono text-muted-foreground/40">ENCODE Systems Engineer</p>
          <p className="text-[11px] text-muted-foreground/30">
            Tell ENCODE what to build in natural language, or use <code className="text-primary/60">/help</code> for commands.
          </p>
          <div className="space-y-2 pt-3 text-left">
            <p className="text-[10px] text-muted-foreground/25 uppercase tracking-wider text-center">Try saying</p>
            {[
              '"Build a rate limiter for the API gateway"',
              '"Modify the DEFENSE module to add IP blocking"',
              '"Create a new webhook handler for Stripe events"',
              '/build authentication flow',
              '/resolve rate limiting',
            ].map((ex, i) => (
              <p key={i} className="text-[10px] text-muted-foreground/40 font-mono px-3 py-1.5 rounded bg-muted/20">
                {ex}
              </p>
            ))}
          </div>
          <div className="space-y-1 pt-2">
            <p className="text-[10px] text-muted-foreground/25 uppercase tracking-wider">Execution Flow</p>
            <p className="text-[10px] text-muted-foreground/30 font-mono">
              INTENT → DECODE → PLAN → APPROVAL → ENCODE → BRAIN
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="space-y-2 p-4">
        {combined.map((item, i) => {
          if (item.type === 'message') {
            const msg = item.data as ConversationMessage;
            const config = ROLE_CONFIG[msg.role] || ROLE_CONFIG.system;
            const Icon = config.icon;

            // Try to parse ENCODE review responses
            let parsedReview: any = null;
            if (msg.role === 'encode' && msg.metadata?.type === 'review_response') {
              try { parsedReview = JSON.parse(msg.content); } catch {}
            }

            return (
              <div key={msg.id} className={cn("border rounded-lg p-3", config.bg)}>
                <div className="flex items-center gap-2 mb-1.5">
                  <Icon className={cn("w-3.5 h-3.5", config.color)} />
                  <span className={cn("text-[10px] font-bold uppercase tracking-wider", config.color)}>
                    {config.label}
                  </span>
                  <span className="text-[9px] text-muted-foreground/30 font-mono ml-auto">
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </span>
                </div>

                {parsedReview ? (
                  <ReviewResponse review={parsedReview} />
                ) : (
                  <p className="text-[12px] text-foreground/80 font-mono whitespace-pre-wrap leading-relaxed">
                    {msg.content}
                  </p>
                )}
              </div>
            );
          }

          // System message
          const sys = item.data as { type: string; text: string; ts: string };
          const iconMap: Record<string, React.ElementType> = {
            success: CheckCircle2,
            error: XCircle,
            warning: Clock,
            info: Layers,
          };
          const colorMap: Record<string, string> = {
            success: 'text-green-500',
            error: 'text-destructive',
            warning: 'text-yellow-500',
            info: 'text-muted-foreground',
          };
          const SysIcon = iconMap[sys.type] || Layers;

          return (
            <div key={`sys-${i}`} className="flex items-start gap-2 px-2 py-1.5">
              <SysIcon className={cn("w-3 h-3 mt-0.5 shrink-0", colorMap[sys.type])} />
              <span className="text-[11px] text-muted-foreground/70 font-mono whitespace-pre-wrap">{sys.text}</span>
            </div>
          );
        })}

        {/* Active Plans */}
        {plans.filter(p => p.status === 'draft' || p.status === 'review').map(plan => (
          <PlanCard key={plan.plan_id} plan={plan} />
        ))}

        <div ref={bottomRef} />
      </div>
    </ScrollArea>
  );
}

function ReviewResponse({ review }: { review: any }) {
  return (
    <div className="space-y-2 mt-1">
      <p className="text-[11px] text-foreground/70 font-mono">{review.analysis_summary}</p>

      {review.architectural_understanding && (
        <div className="bg-background/40 rounded p-2 space-y-1">
          <span className="text-[9px] text-primary/60 uppercase tracking-wider font-bold">Architecture Context</span>
          {Object.entries(review.architectural_understanding).map(([k, v]) => (
            <div key={k} className="flex items-center justify-between text-[10px]">
              <span className="text-muted-foreground/50">{k.replace(/_/g, ' ')}</span>
              <span className="text-foreground/60 font-mono">{String(v)}</span>
            </div>
          ))}
        </div>
      )}

      {review.clarification_questions?.length > 0 && (
        <div className="space-y-1">
          <span className="text-[9px] text-amber-400/80 uppercase tracking-wider font-bold">Questions</span>
          {review.clarification_questions.map((q: string, i: number) => (
            <p key={i} className="text-[10px] text-amber-400/60 font-mono pl-2 border-l border-amber-500/20">
              {q}
            </p>
          ))}
        </div>
      )}

      {review.risk_assessment && (
        <Badge variant="outline" className="text-[9px]">
          Risk: {review.risk_assessment}
        </Badge>
      )}
    </div>
  );
}

function PlanCard({ plan }: { plan: PatchPlan }) {
  return (
    <div className="border border-primary/20 bg-primary/5 rounded-lg p-3 space-y-2">
      <div className="flex items-center gap-2">
        <Layers className="w-3.5 h-3.5 text-primary" />
        <span className="text-[11px] font-bold text-primary uppercase tracking-wider">Patch Plan</span>
        <Badge variant="outline" className={cn(
          "text-[9px] ml-auto",
          plan.status === 'approved' && 'border-green-500/30 text-green-500',
          plan.status === 'rejected' && 'border-destructive/30 text-destructive',
        )}>
          {plan.status}
        </Badge>
      </div>
      <p className="text-xs font-semibold text-foreground">{plan.title}</p>
      <p className="text-[11px] text-muted-foreground/60 font-mono">{plan.intent}</p>

      {plan.changes.length > 0 && (
        <div className="space-y-1">
          <span className="text-[9px] text-muted-foreground/40 uppercase">Changes ({plan.changes.length})</span>
          {plan.changes.slice(0, 5).map((c, i) => (
            <div key={i} className="flex items-center gap-1.5 text-[10px] font-mono">
              <Badge variant="outline" className="text-[8px] px-1">{c.type}</Badge>
              <span className="text-muted-foreground/50 truncate">{c.path}</span>
            </div>
          ))}
        </div>
      )}

      {plan.risks.length > 0 && (
        <div className="space-y-0.5">
          <span className="text-[9px] text-destructive/60 uppercase">Risks</span>
          {plan.risks.map((r, i) => (
            <p key={i} className="text-[10px] text-destructive/50 font-mono">⚠ {r}</p>
          ))}
        </div>
      )}

      <div className="flex gap-2 pt-1">
        <p className="text-[9px] text-muted-foreground/40 font-mono">
          {plan.plan_id} · Use /approve or /reject
        </p>
      </div>
    </div>
  );
}
