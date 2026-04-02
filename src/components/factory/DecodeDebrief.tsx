/**
 * DecodeDebrief — Interactive guided tour of refurbishment results
 * DECODE walks user through findings conversationally after Ascension completes
 */

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, ChevronRight, Sparkles, Shield, Zap, CheckCircle2, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { RestorationReport } from '@/lib/factory/restoration-docs';
import type { ScanResult } from '@/lib/factory/scan-team';

interface DebriefMessage {
  id: string;
  role: 'decode' | 'system';
  content: string;
  icon?: React.ElementType;
  highlight?: boolean;
  action?: { label: string; onClick: () => void };
}

function buildDebriefMessages(
  report: RestorationReport,
  scanResult: ScanResult | null,
): DebriefMessage[] {
  const msgs: DebriefMessage[] = [];

  // Opening
  msgs.push({
    id: 'intro',
    role: 'decode',
    content: `Refurbishment complete. Let me walk you through exactly what changed — and what you're getting back. ✨`,
    icon: MessageSquare,
  });

  // CJPI Score
  const cert = report.cjpiCertificate;
  msgs.push({
    id: 'cjpi',
    role: 'decode',
    content: `Your code scored **CJPI ${cert.score}** — placing it in the **${cert.tier}** tier. ${cert.score >= 94 ? "That's exceptional." : cert.score >= 80 ? "Solid foundation." : "Room to grow."} Certificate serial: \`${cert.serialNumber}\``,
    icon: Sparkles,
    highlight: cert.score >= 90,
  });

  // Vulnerabilities found & fixed
  const critical = report.vulnerabilityAssessment.filter(v => v.severity === 'critical');
  const warnings = report.vulnerabilityAssessment.filter(v => v.severity === 'warning');
  if (critical.length > 0 || warnings.length > 0) {
    msgs.push({
      id: 'vulns',
      role: 'decode',
      content: `The scan team found **${critical.length} critical** and **${warnings.length} warning-level** issues. ${critical.length > 0 ? `Critical items — ${critical.map(c => `**${c.title}**`).join(', ')} — have been hardened.` : 'All warnings have been mitigated.'} 🛡️`,
      icon: Shield,
    });
  }

  // Primitives applied
  const primitiveNames = report.primitiveManifest.map(p => `**${p.name}**`);
  msgs.push({
    id: 'primitives',
    role: 'decode',
    content: `We applied ${report.primitiveManifest.length} primitives to your code: ${primitiveNames.join(', ')}. Each one strengthens a different layer — from defense hardening to governance compliance.`,
    icon: Zap,
  });

  // New capabilities
  if (report.newCapabilities.length > 0) {
    const capList = report.newCapabilities.slice(0, 3).map(c => `• **${c.name}**: ${c.description.slice(0, 80)}...`).join('\n');
    msgs.push({
      id: 'caps',
      role: 'decode',
      content: `Your code now has ${report.newCapabilities.length} new capabilities:\n\n${capList}${report.newCapabilities.length > 3 ? `\n\n...and ${report.newCapabilities.length - 3} more in the full report.` : ''}`,
      icon: Sparkles,
    });
  }

  // Documentation
  msgs.push({
    id: 'docs',
    role: 'decode',
    content: `Everything is documented — pipeline details, error codes, and a test harness config are included in your refurbishment report. You can verify every change independently with \`npx cmpsbl-test\`. 📋`,
    icon: FileText,
  });

  // Closing
  msgs.push({
    id: 'close',
    role: 'decode',
    content: `Your 3-day evaluation period starts now. Hot-swap architecture means zero friction — if something doesn't feel right, swap it out. But I think you'll like what you see. 🚀`,
    icon: CheckCircle2,
    highlight: true,
  });

  return msgs;
}

export function DecodeDebrief({
  report,
  scanResult,
}: {
  report: RestorationReport;
  scanResult: ScanResult | null;
}) {
  const messages = buildDebriefMessages(report, scanResult);
  const [visibleCount, setVisibleCount] = useState(1);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (visibleCount < messages.length) {
      const timer = setTimeout(() => {
        setVisibleCount(c => c + 1);
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [visibleCount, messages.length]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [visibleCount]);

  const isComplete = visibleCount >= messages.length;

  return (
    <div className="rounded-2xl border border-border/40 bg-card/20 overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-5 py-3 border-b border-border/20 bg-card/30">
        <div className="w-7 h-7 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
          <MessageSquare className="w-3.5 h-3.5 text-primary" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-foreground">DECODE Debrief</h3>
          <p className="text-[10px] text-muted-foreground">Interactive walkthrough of your refurbishment results</p>
        </div>
        {!isComplete && (
          <div className="ml-auto flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            <span className="text-[10px] text-primary font-medium">Analyzing...</span>
          </div>
        )}
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="max-h-[400px] overflow-y-auto p-4 space-y-3">
        <AnimatePresence>
          {messages.slice(0, visibleCount).map((msg, idx) => {
            const Icon = msg.icon || MessageSquare;
            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={cn(
                  "flex gap-3 p-3 rounded-xl",
                  msg.highlight
                    ? "bg-primary/5 border border-primary/15"
                    : "bg-muted/20 border border-border/10"
                )}
              >
                <div className={cn(
                  "w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5",
                  msg.highlight ? "bg-primary/15" : "bg-muted/40"
                )}>
                  <Icon className={cn("w-3.5 h-3.5", msg.highlight ? "text-primary" : "text-muted-foreground")} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-foreground/90 leading-relaxed whitespace-pre-line">
                    {msg.content.split(/(\*\*[^*]+\*\*|\`[^`]+\`)/).map((part, i) => {
                      if (part.startsWith('**') && part.endsWith('**')) {
                        return <strong key={i} className="font-bold text-foreground">{part.slice(2, -2)}</strong>;
                      }
                      if (part.startsWith('`') && part.endsWith('`')) {
                        return <code key={i} className="px-1 py-0.5 rounded bg-muted/50 text-[10px] font-mono">{part.slice(1, -1)}</code>;
                      }
                      return <span key={i}>{part}</span>;
                    })}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* Typing indicator */}
        {!isComplete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2 px-3 py-2"
          >
            <div className="flex gap-1">
              {[0, 1, 2].map(i => (
                <span
                  key={i}
                  className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30 animate-bounce"
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </div>
            <span className="text-[10px] text-muted-foreground/50">DECODE is reviewing...</span>
          </motion.div>
        )}
      </div>

      {/* Skip / complete */}
      {!isComplete && (
        <div className="px-4 py-3 border-t border-border/10">
          <Button
            variant="ghost"
            size="sm"
            className="text-xs h-8 gap-1"
            onClick={() => setVisibleCount(messages.length)}
          >
            Show all findings
            <ChevronRight className="w-3 h-3" />
          </Button>
        </div>
      )}
    </div>
  );
}
